import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { taskCategories } from '@/db/schema';
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
      .from(taskCategories)
      .orderBy(taskCategories.name);

    return Response.json(result);
  } catch (error) {
    console.error('[GET /api/v1/categories]', error);
    return errorResponse('Failed to fetch categories.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const body = await request.json();
    const { key, name, followUpQuestions } = body;

    if (!key || typeof key !== 'string') {
      return errorResponse('key is required.', 400);
    }
    if (!name || typeof name !== 'string') {
      return errorResponse('name is required.', 400);
    }

    const [created] = await db
      .insert(taskCategories)
      .values({
        key: key.toLowerCase().replace(/\s+/g, '_'),
        name,
        followUpQuestions: followUpQuestions ?? null,
      })
      .returning();

    return Response.json(created, { status: 201 });
  } catch (error: unknown) {
    console.error('[POST /api/v1/categories]', error);
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === '23505') {
      return errorResponse('A category with this key already exists.', 409);
    }
    return errorResponse('Failed to create category.');
  }
}
