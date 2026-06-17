import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { rituals } from '@/db/schema';
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
      'description',
      'startTime',
      'endTime',
      'location',
    ] as const;

    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in body) {
        if (field === 'startTime' || field === 'endTime') {
          updates[field] = body[field] ? new Date(body[field]) : null;
        } else {
          updates[field] = body[field];
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse('No valid fields provided for update.', 400);
    }

    const [updatedRitual] = await db
      .update(rituals)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(rituals.id, id), eq(rituals.weddingId, auth.weddingId)))
      .returning();

    if (!updatedRitual) return notFoundResponse('Ritual');

    return Response.json(updatedRitual);
  } catch (error) {
    console.error('[PUT /api/v1/rituals/[id]]', error);
    return errorResponse('Failed to update ritual.');
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const { id } = await params;

    const [deletedRitual] = await db
      .delete(rituals)
      .where(and(eq(rituals.id, id), eq(rituals.weddingId, auth.weddingId)))
      .returning();

    if (!deletedRitual) return notFoundResponse('Ritual');

    return Response.json({ message: 'Ritual deleted successfully.', ritual: deletedRitual });
  } catch (error) {
    console.error('[DELETE /api/v1/rituals/[id]]', error);
    return errorResponse('Failed to delete ritual.');
  }
}
