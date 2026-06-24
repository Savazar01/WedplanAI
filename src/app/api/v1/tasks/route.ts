import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { tasks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  validateApiKey,
  unauthorizedResponse,
  errorResponse,
} from '../auth-helper';

export async function GET(request: NextRequest) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const result = await db
      .select()
      .from(tasks)
      .where(eq(tasks.weddingId, auth.weddingId));

    return Response.json(result);
  } catch (error) {
    console.error('[GET /api/v1/tasks]', error);
    return errorResponse('Failed to fetch tasks.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const body = await request.json();

    const { title, description, dueDate, category, columnId, status, position, ceremonyId, assignedUserId, categoryData, cateringMenuId } = body;

    if (!title || typeof title !== 'string') {
      return errorResponse('title is required.', 400);
    }
    if (!category || typeof category !== 'string') {
      return errorResponse('category is required.', 400);
    }

    const [created] = await db
      .insert(tasks)
      .values({
        weddingId: auth.weddingId,
        title,
        description: description ?? null,
        dueDate: dueDate ? new Date(dueDate) : null,
        category,
        columnId: columnId ?? null,
        status: status ?? 'todo',
        position: position ?? 0,
        ceremonyId: ceremonyId ?? null,
        assignedUserId: assignedUserId ?? null,
        categoryData: categoryData ?? null,
        cateringMenuId: cateringMenuId ?? null,
        isCustom: true,
      })
      .returning();

    return Response.json(created, { status: 201 });
  } catch (error) {
    console.error('[POST /api/v1/tasks]', error);
    return errorResponse('Failed to create task.');
  }
}
