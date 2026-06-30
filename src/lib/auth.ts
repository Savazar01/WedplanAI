import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/client";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3044",
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
      persona: {
        type: "string",
        defaultValue: "diy",
      },
      weddingId: {
        type: "string",
        required: false,
      },
      weddingAccess: {
        type: "string",
        defaultValue: "all",
      },
      shouldChangePassword: {
        type: "boolean",
        defaultValue: false,
      },
    },
  },
  advanced: {
    // Disable the __Secure- cookie prefix.
    // Coolify terminates SSL at the reverse proxy and forwards HTTP
    // internally — the __Secure- prefix would cause the browser to
    // refuse to send the cookie on the internal HTTP leg, breaking
    // session detection in the middleware.
    useSecureCookies: false,
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      // Keep secure:true so the browser only sends the cookie over HTTPS
      // to the public domain, but without the __Secure- name prefix.
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  },
});
