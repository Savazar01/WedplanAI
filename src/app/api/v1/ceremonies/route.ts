import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { ceremonies } from '@/db/schema';
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
      .from(ceremonies)
      .where(eq(ceremonies.weddingId, auth.weddingId));

    return Response.json(result);
  } catch (error) {
    console.error('[GET /api/v1/ceremonies]', error);
    return errorResponse('Failed to fetch ceremonies.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const body = await request.json();
    const { name, description, startTime, endTime, location } = body;

    if (!name || typeof name !== 'string') {
      return errorResponse('name is required.', 400);
    }
    if (!startTime) {
      return errorResponse('startTime is required.', 400);
    }
    if (!endTime) {
      return errorResponse('endTime is required.', 400);
    }
    if (!location || typeof location !== 'string') {
      return errorResponse('location is required.', 400);
    }

    const [created] = await db
      .insert(ceremonies)
      .values({
        weddingId: auth.weddingId,
        name,
        description: description ?? null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location,
        isCustom: true,
      })
      .returning();

    return Response.json(created, { status: 201 });
  } catch (error) {
    console.error('[POST /api/v1/ceremonies]', error);
    return errorResponse('Failed to create ceremony.');
  }
}
