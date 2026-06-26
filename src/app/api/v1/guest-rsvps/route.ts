import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { guestRsvps, guests, ceremonies } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  validateApiKey,
  unauthorizedResponse,
  notFoundResponse,
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
      .from(guestRsvps)
      .innerJoin(guests, eq(guestRsvps.guestId, guests.id))
      .innerJoin(ceremonies, eq(guestRsvps.ceremonyId, ceremonies.id))
      .where(eq(guests.weddingId, targetWeddingId));

    return Response.json(result);
  } catch (error) {
    console.error('[GET /api/v1/guest-rsvps]', error);
    return errorResponse('Failed to fetch guest RSVPs.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const body = await request.json();
    const { guestId, ceremonyId, rsvpStatus, guestCount } = body;

    if (!guestId || !ceremonyId || !rsvpStatus) {
      return errorResponse('guestId, ceremonyId, and rsvpStatus are required.', 400);
    }

    if (!['attending', 'declined'].includes(rsvpStatus)) {
      return errorResponse('rsvpStatus must be "attending" or "declined".', 400);
    }

    const targetWeddingId = getBodyWeddingId(auth, body);
    if (!targetWeddingId) return errorResponse('weddingId required for global key.', 400);

    const [guest] = await db
      .select({ id: guests.id })
      .from(guests)
      .where(and(eq(guests.id, guestId), eq(guests.weddingId, targetWeddingId)))
      .limit(1);

    if (!guest) return notFoundResponse('Guest');

    const [created] = await db
      .insert(guestRsvps)
      .values({
        guestId,
        ceremonyId,
        rsvpStatus,
        guestCount: guestCount ?? 0,
      })
      .returning();

    return Response.json(created, { status: 201 });
  } catch (error) {
    console.error('[POST /api/v1/guest-rsvps]', error);
    return errorResponse('Failed to create guest RSVP.');
  }
}
