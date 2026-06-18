import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { weddings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  validateApiKey,
  unauthorizedResponse,
  notFoundResponse,
  errorResponse,
} from '../auth-helper';

export async function GET(request: NextRequest) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const [wedding] = await db
      .select()
      .from(weddings)
      .where(eq(weddings.id, auth.weddingId))
      .limit(1);

    if (!wedding) return notFoundResponse('Wedding');

    return Response.json(wedding);
  } catch (error) {
    console.error('[GET /api/v1/wedding]', error);
    return errorResponse('Failed to fetch wedding details.');
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const body = await request.json();

    const allowedFields = [
      'partnerA',
      'partnerB',
      'weddingDate',
      'location',
      'budget',
      'guestCount',
      'description',
      'showcaseFont',
      'showcaseTitleFont',
      'showcasePrimary',
      'showcaseSecondary',
      'showcaseBackground',
      'showcaseHeroUrl',
      'showcaseHeroData',
      'showcaseWelcomeText',
      'showcaseDetails',
      'showcaseSubtitle',
      'showcaseTitle',
      'showcaseDescription',
      'showcaseRsvpTitle',
      'showcaseRsvpDescription',
    ] as const;

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        if (field === 'weddingDate') {
          updates[field] = body[field] ? new Date(body[field]) : null;
        } else {
          updates[field] = body[field];
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse('No valid fields provided for update.', 400);
    }

    const [updated] = await db
      .update(weddings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(weddings.id, auth.weddingId))
      .returning();

    if (!updated) return notFoundResponse('Wedding');

    return Response.json(updated);
  } catch (error) {
    console.error('[PUT /api/v1/wedding]', error);
    return errorResponse('Failed to update wedding details.');
  }
}
