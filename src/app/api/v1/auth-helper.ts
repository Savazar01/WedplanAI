import { db } from "@/db/client";
import { apiKeys } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";
import { NextRequest } from "next/server";

export interface AuthResult {
  weddingId: string;
  keyId: string;
}

/**
 * Validates an x-api-key header against the database.
 * Returns the associated weddingId if valid, or null if invalid/expired.
 */
export async function validateApiKey(request: NextRequest): Promise<AuthResult | null> {
  const rawKey = request.headers.get("x-api-key");
  if (!rawKey) return null;

  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
  const now = new Date();

  const [keyRecord] = await db
    .select()
    .from(apiKeys)
    .where(
      and(
        eq(apiKeys.keyHash, keyHash),
        gt(apiKeys.expiresAt, now)
      )
    )
    .limit(1);

  if (!keyRecord) return null;

  return {
    weddingId: keyRecord.weddingId,
    keyId: keyRecord.id,
  };
}

export function unauthorizedResponse() {
  return Response.json(
    { error: "Unauthorized: Invalid or expired API key. Provide a valid x-api-key header." },
    { status: 401 }
  );
}

export function notFoundResponse(entity: string = "Resource") {
  return Response.json({ error: `${entity} not found.` }, { status: 404 });
}

export function errorResponse(message: string, status = 500) {
  return Response.json({ error: message }, { status });
}
