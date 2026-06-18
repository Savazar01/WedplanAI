import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { guests } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  validateApiKey,
  unauthorizedResponse,
  notFoundResponse,
  errorResponse,
} from '../../auth-helper';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();

    const allowedFields = [
      'name',
      'email',
      'phone',
      'rsvpStatus',
      'plusOneCount',
      'dietaryRestrictions',
    ] as const;

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse('No valid fields provided for update.', 400);
    }

    const [updatedGuest] = await db
      .update(guests)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(guests.id, id), eq(guests.weddingId, auth.weddingId)))
      .returning();

    if (!updatedGuest) return notFoundResponse('Guest');

    return Response.json(updatedGuest);
  } catch (error) {
    console.error('[PUT /api/v1/guests/[id]]', error);
    return errorResponse('Failed to update guest.');
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const { id } = await params;

    const [deletedGuest] = await db
      .delete(guests)
      .where(and(eq(guests.id, id), eq(guests.weddingId, auth.weddingId)))
      .returning();

    if (!deletedGuest) return notFoundResponse('Guest');

    return Response.json({ message: 'Guest deleted successfully.', guest: deletedGuest });
  } catch (error) {
    console.error('[DELETE /api/v1/guests/[id]]', error);
    return errorResponse('Failed to delete guest.');
  }
}
