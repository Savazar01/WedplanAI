"use server";

import { db } from "@/db/client";
import { llmConfigurations } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";

export async function getLLMConfigsAction() {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  try {
    const configs = await db.select().from(llmConfigurations);
    return { success: true, configs };
  } catch (error) {
    console.error("getLLMConfigsAction error:", error);
    return { error: "Failed to fetch LLM configurations." };
  }
}

export async function saveLLMConfigAction(data: {
  provider: string;
  apiKey?: string;
  baseUrl?: string;
  defaultModel: string;
  isActive: boolean;
}) {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  if (!data.provider || !data.defaultModel) {
    return { error: "Provider and Default Model are required." };
  }

  try {
    // If setting to active, deactivate all other configs
    if (data.isActive) {
      await db.update(llmConfigurations).set({ isActive: false });
    }

    const existing = await db
      .select()
      .from(llmConfigurations)
      .where(eq(llmConfigurations.provider, data.provider))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(llmConfigurations)
        .set({
          apiKey: data.apiKey ?? null,
          baseUrl: data.baseUrl ?? null,
          defaultModel: data.defaultModel,
          isActive: data.isActive,
          updatedAt: new Date(),
        })
        .where(eq(llmConfigurations.id, existing[0].id));
    } else {
      await db.insert(llmConfigurations).values({
        provider: data.provider,
        apiKey: data.apiKey ?? null,
        baseUrl: data.baseUrl ?? null,
        defaultModel: data.defaultModel,
        isActive: data.isActive,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("saveLLMConfigAction error:", error);
    return { error: error instanceof Error ? error.message : "Failed to save LLM configuration." };
  }
}

export async function setActiveLLMProviderAction(provider: string) {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  try {
    await db.transaction(async (tx) => {
      // Deactivate all first
      await tx.update(llmConfigurations).set({ isActive: false });
      // Activate the selected provider
      await tx
        .update(llmConfigurations)
        .set({ isActive: true, updatedAt: new Date() })
        .where(eq(llmConfigurations.provider, provider));
    });

    return { success: true };
  } catch (error) {
    console.error("setActiveLLMProviderAction error:", error);
    return { error: error instanceof Error ? error.message : "Failed to activate LLM provider." };
  }
}

export async function testLLMConfigAction(data: {
  provider: string;
  apiKey?: string;
  baseUrl?: string;
  defaultModel: string;
}) {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  if (!data.provider || !data.defaultModel) {
    return { error: "Provider and Default Model are required to test." };
  }

  const testPrompt = "Hello! Reply with exactly one word: Success.";
  const systemPrompt = "You are a helpful test assistant.";

  try {
    let responseText = "";

    if (data.provider === "openai" || data.provider === "openrouter" || data.provider === "custom") {
      const defaultBaseUrl = data.provider === "openrouter" 
        ? "https://openrouter.ai/api/v1" 
        : "https://api.openai.com/v1";
      const url = `${data.baseUrl || defaultBaseUrl}/chat/completions`;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (data.apiKey) {
        headers["Authorization"] = `Bearer ${data.apiKey}`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: data.defaultModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: testPrompt }
          ],
          max_tokens: 10,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error?.message || json?.error || `HTTP ${response.status} Error`);
      }

      responseText = json.choices?.[0]?.message?.content || "";
    } else if (data.provider === "anthropic") {
      const url = `${data.baseUrl || "https://api.anthropic.com"}/v1/messages`;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      };

      if (data.apiKey) {
        headers["x-api-key"] = data.apiKey;
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: data.defaultModel,
          system: systemPrompt,
          messages: [{ role: "user", content: testPrompt }],
          max_tokens: 10,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error?.message || json?.error || `HTTP ${response.status} Error`);
      }

      responseText = json.content?.[0]?.text || "";
    } else if (data.provider === "gemini") {
      if (!data.apiKey) {
        throw new Error("API Key is required for Gemini provider.");
      }
      const url = `${data.baseUrl || "https://generativelanguage.googleapis.com"}/v1beta/models/${data.defaultModel}:generateContent?key=${data.apiKey}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: testPrompt }],
            },
          ],
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          generationConfig: {
            maxOutputTokens: 10,
          },
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error?.message || json?.error || `HTTP ${response.status} Error`);
      }

      responseText = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } else {
      throw new Error(`Unsupported provider: ${data.provider}`);
    }

    if (!responseText) {
      throw new Error("Received empty response from the provider.");
    }

    return { success: true, response: responseText.trim() };
  } catch (error) {
    console.error("testLLMConfigAction error:", error);
    return { error: error instanceof Error ? error.message : "Connection test failed." };
  }
}

export async function generateAIContentAction(prompt: string, systemPrompt?: string) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return { error: "Unauthorized. Please log in." };
  }

  try {
    const activeConfigs = await db
      .select()
      .from(llmConfigurations)
      .where(eq(llmConfigurations.isActive, true))
      .limit(1);

    if (activeConfigs.length === 0) {
      return { error: "No active LLM configuration found. Please contact an administrator." };
    }

    const config = activeConfigs[0];
    let responseText = "";

    if (config.provider === "openai" || config.provider === "openrouter" || config.provider === "custom") {
      const defaultBaseUrl = config.provider === "openrouter"
        ? "https://openrouter.ai/api/v1"
        : "https://api.openai.com/v1";
      const url = `${config.baseUrl || defaultBaseUrl}/chat/completions`;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (config.apiKey) {
        headers["Authorization"] = `Bearer ${config.apiKey}`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: config.defaultModel,
          messages: [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            { role: "user", content: prompt }
          ],
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error?.message || json?.error || `HTTP ${response.status} Error`);
      }

      responseText = json.choices?.[0]?.message?.content || "";
    } else if (config.provider === "anthropic") {
      const url = `${config.baseUrl || "https://api.anthropic.com"}/v1/messages`;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      };

      if (config.apiKey) {
        headers["x-api-key"] = config.apiKey;
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: config.defaultModel,
          ...(systemPrompt ? { system: systemPrompt } : {}),
          messages: [{ role: "user", content: prompt }],
          max_tokens: 4096,
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error?.message || json?.error || `HTTP ${response.status} Error`);
      }

      responseText = json.content?.[0]?.text || "";
    } else if (config.provider === "gemini") {
      if (!config.apiKey) {
        throw new Error("API Key is required for Gemini provider.");
      }
      const url = `${config.baseUrl || "https://generativelanguage.googleapis.com"}/v1beta/models/${config.defaultModel}:generateContent?key=${config.apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          ...(systemPrompt ? {
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
          } : {}),
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json?.error?.message || json?.error || `HTTP ${response.status} Error`);
      }

      responseText = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } else {
      throw new Error(`Unsupported active provider: ${config.provider}`);
    }

    return { success: true, text: responseText };
  } catch (error) {
    console.error("generateAIContentAction error:", error);
    return { error: error instanceof Error ? error.message : "Failed to generate AI content." };
  }
}
