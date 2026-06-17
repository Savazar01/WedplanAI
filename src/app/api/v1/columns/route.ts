import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { kanbanColumns } from '@/db/schema';
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
      .from(kanbanColumns)
      .where(eq(kanbanColumns.weddingId, auth.weddingId));

    return Response.json(result);
  } catch (error) {
    console.error('[GET /api/v1/columns]', error);
    return errorResponse('Failed to fetch columns.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const body = await request.json();
    const { name, color, position } = body;

    if (!name || typeof name !== 'string') {
      return errorResponse('name is required.', 400);
    }

    const [created] = await db
      .insert(kanbanColumns)
      .values({
        weddingId: auth.weddingId,
        name,
        color: color ?? '#6771ab',
        position: position ?? 0,
        type: 'custom',
      })
      .returning();

    return Response.json(created, { status: 201 });
  } catch (error) {
    console.error('[POST /api/v1/columns]', error);
    return errorResponse('Failed to create column.');
  }
}
