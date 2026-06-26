import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { guests } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  validateApiKey,
  unauthorizedResponse,
  errorResponse,
  getRequestedWeddingId,
  getBodyWeddingId,
} from '../auth-helper';

export async function GET(request: NextRequest) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const targetWeddingId = getRequestedWeddingId(auth, request);
    if (!targetWeddingId) return errorResponse('weddingId required for global key.', 400);

    const result = await db
      .select()
      .from(guests)
      .where(eq(guests.weddingId, targetWeddingId));

    return Response.json(result);
  } catch (error) {
    console.error('[GET /api/v1/guests]', error);
    return errorResponse('Failed to fetch guests.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const body = await request.json();
    const { name, email, phone, rsvpStatus, plusOneCount, dietaryRestrictions, invitedCeremonies } = body;

    if (!name || typeof name !== 'string') {
      return errorResponse('name is required.', 400);
    }

    const bodyWeddingId = getBodyWeddingId(auth, body);
    if (!bodyWeddingId) return errorResponse('weddingId required for global key.', 400);

    const [created] = await db
      .insert(guests)
      .values({
        weddingId: bodyWeddingId,
        name,
        email: email ?? null,
        phone: phone ?? null,
        rsvpStatus: rsvpStatus ?? 'pending',
        plusOneCount: plusOneCount ?? 0,
        dietaryRestrictions: dietaryRestrictions ?? null,
        invitedCeremonies: invitedCeremonies ?? 'all',
      })
      .returning();

    return Response.json(created, { status: 201 });
  } catch (error) {
    console.error('[POST /api/v1/guests]', error);
    return errorResponse('Failed to create guest.');
  }
}
