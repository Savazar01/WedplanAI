import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { tasks } from '@/db/schema';
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
      'title',
      'description',
      'dueDate',
      'category',
      'columnId',
      'status',
      'position',
      'ceremonyId',
      'assignedUserId',
      'categoryData',
      'cateringMenuId',
    ] as const;

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        if (field === 'dueDate') {
          updates[field] = body[field] ? new Date(body[field]) : null;
        } else {
          updates[field] = body[field];
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse('No valid fields provided for update.', 400);
    }

    const [updatedTask] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.weddingId, weddingId)))
      .returning();

    if (!updatedTask) return notFoundResponse('Task');

    return Response.json(updatedTask);
  } catch (error) {
    console.error('[PUT /api/v1/tasks/[id]]', error);
    return errorResponse('Failed to update task.');
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const { id } = await params;
    const weddingId = getRequestedWeddingId(auth, request);
    if (!weddingId) return errorResponse('weddingId is required.', 400);

    const [deletedTask] = await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.weddingId, weddingId)))
      .returning();

    if (!deletedTask) return notFoundResponse('Task');

    return Response.json({ message: 'Task deleted successfully.', task: deletedTask });
  } catch (error) {
    console.error('[DELETE /api/v1/tasks/[id]]', error);
    return errorResponse('Failed to delete task.');
  }
}
