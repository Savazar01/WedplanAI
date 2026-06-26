import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { cateringMenus } from '@/db/schema';
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
      'ceremonyId',
      'vendorId',
      'cuisine',
      'guestCount',
      'appetizers',
      'mainCourses',
      'desserts',
      'drinks',
      'notes',
    ] as const;

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse('No valid fields provided for update.', 400);
    }

    const [updatedMenu] = await db
      .update(cateringMenus)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(cateringMenus.id, id), eq(cateringMenus.weddingId, weddingId)))
      .returning();

    if (!updatedMenu) return notFoundResponse('Catering menu');

    return Response.json(updatedMenu);
  } catch (error) {
    console.error('[PUT /api/v1/catering-menus/[id]]', error);
    return errorResponse('Failed to update catering menu.');
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const { id } = await params;
    const weddingId = getRequestedWeddingId(auth, request);
    if (!weddingId) return errorResponse('weddingId is required.', 400);

    const [deletedMenu] = await db
      .delete(cateringMenus)
      .where(and(eq(cateringMenus.id, id), eq(cateringMenus.weddingId, weddingId)))
      .returning();

    if (!deletedMenu) return notFoundResponse('Catering menu');

    return Response.json({ message: 'Catering menu deleted successfully.', cateringMenu: deletedMenu });
  } catch (error) {
    console.error('[DELETE /api/v1/catering-menus/[id]]', error);
    return errorResponse('Failed to delete catering menu.');
  }
}
