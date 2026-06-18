import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { kanbanColumns, tasks } from '@/db/schema';
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

    const allowedFields = ['name', 'color', 'position'] as const;

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse('No valid fields provided for update.', 400);
    }

    const [updatedColumn] = await db
      .update(kanbanColumns)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(kanbanColumns.id, id), eq(kanbanColumns.weddingId, auth.weddingId)))
      .returning();

    if (!updatedColumn) return notFoundResponse('Column');

    return Response.json(updatedColumn);
  } catch (error) {
    console.error('[PUT /api/v1/columns/[id]]', error);
    return errorResponse('Failed to update column.');
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const { id } = await params;

    // Check if there are tasks referencing this column
    const existingTasks = await db
      .select({ id: tasks.id })
      .from(tasks)
      .where(and(eq(tasks.columnId, id), eq(tasks.weddingId, auth.weddingId)))
      .limit(1);

    if (existingTasks.length > 0) {
      return errorResponse('Column has tasks. Move tasks before deleting.', 400);
    }

    const [deletedColumn] = await db
      .delete(kanbanColumns)
      .where(and(eq(kanbanColumns.id, id), eq(kanbanColumns.weddingId, auth.weddingId)))
      .returning();

    if (!deletedColumn) return notFoundResponse('Column');

    return Response.json({ message: 'Column deleted successfully.', column: deletedColumn });
  } catch (error) {
    console.error('[DELETE /api/v1/columns/[id]]', error);
    return errorResponse('Failed to delete column.');
  }
}
