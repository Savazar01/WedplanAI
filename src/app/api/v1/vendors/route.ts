import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { vendors } from '@/db/schema';
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
      .from(vendors)
      .where(eq(vendors.weddingId, auth.weddingId));

    return Response.json(result);
  } catch (error) {
    console.error('[GET /api/v1/vendors]', error);
    return errorResponse('Failed to fetch vendors.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const body = await request.json();
    const {
      name,
      category,
      contactPerson,
      phone,
      email,
      totalCost,
      paidAmount,
      paymentStatus,
      notes,
      ceremonyId,
    } = body;

    if (!name || typeof name !== 'string') {
      return errorResponse('name is required.', 400);
    }
    if (!category || typeof category !== 'string') {
      return errorResponse('category is required.', 400);
    }

    const [created] = await db
      .insert(vendors)
      .values({
        weddingId: auth.weddingId,
        name,
        category,
        contactPerson: contactPerson ?? null,
        phone: phone ?? null,
        email: email ?? null,
        totalCost: totalCost ?? 0,
        paidAmount: paidAmount ?? 0,
        paymentStatus: paymentStatus ?? 'unpaid',
        notes: notes ?? null,
        ceremonyId: ceremonyId ?? null,
      })
      .returning();

    return Response.json(created, { status: 201 });
  } catch (error) {
    console.error('[POST /api/v1/vendors]', error);
    return errorResponse('Failed to create vendor.');
  }
}
