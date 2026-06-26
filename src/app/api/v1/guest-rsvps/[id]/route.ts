import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { guestRsvps, guests } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  validateApiKey,
  unauthorizedResponse,
  notFoundResponse,
  errorResponse,
  getRequestedWeddingId,
} from '../../auth-helper';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const { id } = await params;
    const weddingId = getRequestedWeddingId(auth, request);
    if (!weddingId) return errorResponse('weddingId is required.', 400);

    const body = await request.json();

    const allowedFields = ['rsvpStatus', 'guestCount'] as const;

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse('No valid fields provided for update.', 400);
    }

    const [existing] = await db
      .select({ id: guestRsvps.id })
      .from(guestRsvps)
      .innerJoin(guests, eq(guestRsvps.guestId, guests.id))
      .where(
        and(eq(guestRsvps.id, id), eq(guests.weddingId, weddingId))
      )
      .limit(1);

    if (!existing) return notFoundResponse('Guest RSVP');

    const [updatedRsvp] = await db
      .update(guestRsvps)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(guestRsvps.id, id))
      .returning();

    return Response.json(updatedRsvp);
  } catch (error) {
    console.error('[PUT /api/v1/guest-rsvps/[id]]', error);
    return errorResponse('Failed to update guest RSVP.');
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const { id } = await params;
    const weddingId = getRequestedWeddingId(auth, request);
    if (!weddingId) return errorResponse('weddingId is required.', 400);

    const [existing] = await db
      .select({ id: guestRsvps.id })
      .from(guestRsvps)
      .innerJoin(guests, eq(guestRsvps.guestId, guests.id))
      .where(
        and(eq(guestRsvps.id, id), eq(guests.weddingId, weddingId))
      )
      .limit(1);

    if (!existing) return notFoundResponse('Guest RSVP');

    const [deletedRsvp] = await db
      .delete(guestRsvps)
      .where(eq(guestRsvps.id, id))
      .returning();

    return Response.json({ message: 'Guest RSVP deleted successfully.', guestRsvp: deletedRsvp });
  } catch (error) {
    console.error('[DELETE /api/v1/guest-rsvps/[id]]', error);
    return errorResponse('Failed to delete guest RSVP.');
  }
}
