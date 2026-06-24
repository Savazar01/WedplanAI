import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { weddingTraditions } from '@/db/schema';
import { eq } from 'drizzle-orm';
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
      'key',
      'name',
      'description',
      'seedTasks',
      'seedCeremonies',
    ] as const;

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = field === 'key'
          ? String(body[field]).toLowerCase().replace(/\s+/g, '_')
          : body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse('No valid fields provided for update.', 400);
    }

    const [updated] = await db
      .update(weddingTraditions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(weddingTraditions.id, id))
      .returning();

    if (!updated) return notFoundResponse('Tradition');

    return Response.json(updated);
  } catch (error: unknown) {
    console.error('[PUT /api/v1/traditions/[id]]', error);
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === '23505') {
      return errorResponse('A tradition with this key already exists.', 409);
    }
    return errorResponse('Failed to update tradition.');
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const { id } = await params;

    const [deleted] = await db
      .delete(weddingTraditions)
      .where(eq(weddingTraditions.id, id))
      .returning();

    if (!deleted) return notFoundResponse('Tradition');

    return Response.json({ message: 'Tradition deleted successfully.', tradition: deleted });
  } catch (error) {
    console.error('[DELETE /api/v1/traditions/[id]]', error);
    return errorResponse('Failed to delete tradition.');
  }
}
