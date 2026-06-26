import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { cateringMenus, ceremonies } from '@/db/schema';
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
      .select({
        id: cateringMenus.id,
        weddingId: cateringMenus.weddingId,
        ceremonyId: cateringMenus.ceremonyId,
        ceremonyName: ceremonies.name,
        vendorId: cateringMenus.vendorId,
        cuisine: cateringMenus.cuisine,
        guestCount: cateringMenus.guestCount,
        appetizers: cateringMenus.appetizers,
        mainCourses: cateringMenus.mainCourses,
        desserts: cateringMenus.desserts,
        drinks: cateringMenus.drinks,
        notes: cateringMenus.notes,
        createdAt: cateringMenus.createdAt,
        updatedAt: cateringMenus.updatedAt,
      })
      .from(cateringMenus)
      .leftJoin(ceremonies, eq(cateringMenus.ceremonyId, ceremonies.id))
      .where(eq(cateringMenus.weddingId, targetWeddingId));

    return Response.json(result);
  } catch (error) {
    console.error('[GET /api/v1/catering-menus]', error);
    return errorResponse('Failed to fetch catering menus.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const body = await request.json();
    const { ceremonyId, vendorId, cuisine, guestCount, appetizers, mainCourses, desserts, drinks, notes } = body;

    if (!ceremonyId || typeof ceremonyId !== 'string') {
      return errorResponse('ceremonyId is required.', 400);
    }

    const bodyWeddingId = getBodyWeddingId(auth, body);
    if (!bodyWeddingId) return errorResponse('weddingId required for global key.', 400);

    const [created] = await db
      .insert(cateringMenus)
      .values({
        weddingId: bodyWeddingId,
        ceremonyId,
        vendorId: vendorId ?? null,
        cuisine: cuisine ?? null,
        guestCount: guestCount ?? 0,
        appetizers: appetizers ?? null,
        mainCourses: mainCourses ?? null,
        desserts: desserts ?? null,
        drinks: drinks ?? null,
        notes: notes ?? null,
      })
      .returning();

    return Response.json(created, { status: 201 });
  } catch (error) {
    console.error('[POST /api/v1/catering-menus]', error);
    return errorResponse('Failed to create catering menu.');
  }
}
