import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { vendors } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  validateApiKey,
  unauthorizedResponse,
  notFoundResponse,
  errorResponse,
} from '../../auth-helper';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const { id } = await params;
    const body = await request.json();

    const allowedFields = [
      'name',
      'category',
      'contactPerson',
      'phone',
      'email',
      'totalCost',
      'paidAmount',
      'paymentStatus',
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

    const [updatedVendor] = await db
      .update(vendors)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(vendors.id, id), eq(vendors.weddingId, auth.weddingId)))
      .returning();

    if (!updatedVendor) return notFoundResponse('Vendor');

    return Response.json(updatedVendor);
  } catch (error) {
    console.error('[PUT /api/v1/vendors/[id]]', error);
    return errorResponse('Failed to update vendor.');
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const { id } = await params;

    const [deletedVendor] = await db
      .delete(vendors)
      .where(and(eq(vendors.id, id), eq(vendors.weddingId, auth.weddingId)))
      .returning();

    if (!deletedVendor) return notFoundResponse('Vendor');

    return Response.json({ message: 'Vendor deleted successfully.', vendor: deletedVendor });
  } catch (error) {
    console.error('[DELETE /api/v1/vendors/[id]]', error);
    return errorResponse('Failed to delete vendor.');
  }
}
