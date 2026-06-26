import { db } from "@/db/client";
import { emailConfigurations } from "@/db/schema";
import { eq } from "drizzle-orm";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const [config] = await db
      .select()
      .from(emailConfigurations)
      .where(eq(emailConfigurations.isActive, true))
      .limit(1);

    if (!config || config.provider === "disabled") {
      return { error: "Email integration is not configured or is disabled." };
    }

    if (config.provider === "sendgrid") {
      if (!config.apiKey) {
        return { error: "SendGrid API key is not configured." };
      }

      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [
                {
                  email: to,
                },
              ],
            },
          ],
          from: {
            email: config.senderEmail,
          },
          subject: subject,
          content: [
            {
              type: "text/html",
              value: html,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { error: `SendGrid error: ${response.status} - ${errorText}` };
      }

      return { success: true };
    }

    if (config.provider === "gmail") {
      if (!config.clientId || !config.clientSecret || !config.refreshToken) {
        return { error: "Gmail credentials (client ID, client secret, or refresh token) are missing." };
      }

      // 1. Perform an OAuth2 refresh request to get the access token
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          refresh_token: config.refreshToken,
          grant_type: "refresh_token",
        }),
      });

      if (!tokenResponse.ok) {
        const errText = await tokenResponse.text();
        return { error: `Gmail OAuth refresh token error: ${tokenResponse.status} - ${errText}` };
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      if (!accessToken) {
        return { error: "Failed to retrieve access token from Google OAuth response." };
      }

      // 2. Build RFC 2822 email message
      // Make sure the headers are correctly formatted and there's a blank line before the HTML content.
      const emailParts = [
        `To: ${to}`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset=utf-8`,
        `Content-Transfer-Encoding: 7bit`,
        `From: ${config.senderEmail}`,
        "",
        html,
      ];
      const rawEmail = emailParts.join("\r\n");

      // 3. Base64url encode the message
      const encodedEmail = Buffer.from(rawEmail)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      // 4. Send email using Gmail send API
      const gmailResponse = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          raw: encodedEmail,
        }),
      });

      if (!gmailResponse.ok) {
        const errText = await gmailResponse.text();
        return { error: `Gmail API error: ${gmailResponse.status} - ${errText}` };
      }

      return { success: true };
    }

    return { error: `Unsupported email provider: ${config.provider}` };
  } catch (error) {
    console.error("Mailer sendEmail error:", error);
    return { error: error instanceof Error ? error.message : "An unknown error occurred during email transmission." };
  }
}
