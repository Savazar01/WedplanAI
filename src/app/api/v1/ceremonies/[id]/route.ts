import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { ceremonies } from '@/db/schema';
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

    const allowedFields = [
      'name',
      'description',
      'startTime',
      'endTime',
      'location',
      'isFoodServed',
      'dressCode',
      'extraChecklist',
      'assignedUserId',
    ] as const;

    const updates: Record<string, unknown> = {};
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

    const [updatedCeremony] = await db
      .update(ceremonies)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(ceremonies.id, id), eq(ceremonies.weddingId, weddingId)))
      .returning();

    if (!updatedCeremony) return notFoundResponse('Ceremony');

    return Response.json(updatedCeremony);
  } catch (error) {
    console.error('[PUT /api/v1/ceremonies/[id]]', error);
    return errorResponse('Failed to update ceremony.');
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const { id } = await params;
    const weddingId = getRequestedWeddingId(auth, request);
    if (!weddingId) return errorResponse('weddingId is required.', 400);

    const [deletedCeremony] = await db
      .delete(ceremonies)
      .where(and(eq(ceremonies.id, id), eq(ceremonies.weddingId, weddingId)))
      .returning();

    if (!deletedCeremony) return notFoundResponse('Ceremony');

    return Response.json({ message: 'Ceremony deleted successfully.', ceremony: deletedCeremony });
  } catch (error) {
    console.error('[DELETE /api/v1/ceremonies/[id]]', error);
    return errorResponse('Failed to delete ceremony.');
  }
}
