import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { chatMessages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  validateApiKey,
  unauthorizedResponse,
  errorResponse,
  getRequestedWeddingId,
  getBodyWeddingId,
} from '../auth-helper';

export async function GET(request: NextRequest) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const targetWeddingId = getRequestedWeddingId(auth, request);
    if (!targetWeddingId) return errorResponse('weddingId required for global key.', 400);

    const result = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.weddingId, targetWeddingId));

    return Response.json(result);
  } catch (error) {
    console.error('[GET /api/v1/chat-messages]', error);
    return errorResponse('Failed to fetch chat messages.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const body = await request.json();
    const { senderName, senderEmail, senderRole, message } = body;

    if (!senderName || typeof senderName !== 'string') {
      return errorResponse('senderName is required.', 400);
    }
    if (!senderRole || typeof senderRole !== 'string') {
      return errorResponse('senderRole is required.', 400);
    }
    if (!message || typeof message !== 'string') {
      return errorResponse('message is required.', 400);
    }

    const bodyWeddingId = getBodyWeddingId(auth, body);
    if (!bodyWeddingId) return errorResponse('weddingId required for global key.', 400);

    const [created] = await db
      .insert(chatMessages)
      .values({
        weddingId: bodyWeddingId,
        senderName,
        senderEmail: senderEmail ?? null,
        senderRole,
        message,
      })
      .returning();

    return Response.json(created, { status: 201 });
  } catch (error) {
    console.error('[POST /api/v1/chat-messages]', error);
    return errorResponse('Failed to create chat message.');
  }
}
