import { db } from "@/db/client";
import { apiKeys, users, weddings } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";
import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export interface AuthResult {
  weddingId: string | null;
  keyId: string;
  scope: 'global' | 'wedding';
  userId: string | null;
}

/**
 * Validates an x-api-key header against the database.
 * Returns the associated weddingId if valid, or null if invalid/expired.
 */
export async function validateApiKey(request: NextRequest): Promise<AuthResult | null> {
  const rawKey = request.headers.get("x-api-key");
  if (!rawKey) return null;

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rl = checkRateLimit(`api:${ip}`, 'api');
  if (!rl.success) return null;

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

  if (keyRecord.scope === 'global') {
    return {
      weddingId: null,
      keyId: keyRecord.id,
      scope: 'global' as const,
      userId: keyRecord.userId,
    };
  }

  return {
    weddingId: keyRecord.weddingId,
    keyId: keyRecord.id,
    scope: 'wedding' as const,
    userId: null,
  };
}

export async function requireAdminScope(auth: AuthResult): Promise<boolean> {
  let userId: string | null = null;

  if (auth.scope === 'global' && auth.userId) {
    userId = auth.userId;
  } else if (auth.weddingId) {
    const [wedding] = await db
      .select({ userId: weddings.userId })
      .from(weddings)
      .where(eq(weddings.id, auth.weddingId))
      .limit(1);
    if (wedding) userId = wedding.userId;
  }

  if (!userId) return false;
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user?.role === 'admin';
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

export function getRequestedWeddingId(auth: AuthResult, request: NextRequest): string | null {
  if (auth.scope === 'global') {
    const url = new URL(request.url);
    return url.searchParams.get('weddingId') || null;
  }
  return auth.weddingId;
}

export function getBodyWeddingId(auth: AuthResult, body: any): string | null {
  if (auth.scope === 'global') {
    return body?.weddingId || null;
  }
  return auth.weddingId;
}
