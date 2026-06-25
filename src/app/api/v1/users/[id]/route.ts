import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  validateApiKey,
  unauthorizedResponse,
  notFoundResponse,
  errorResponse,
  requireAdminScope,
} from '../../auth-helper';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const isAdmin = await requireAdminScope(auth);
    if (!isAdmin) {
      return Response.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const allowedFields = [
      'name',
      'role',
      'persona',
      'weddingAccess',
      'street',
      'city',
      'state',
      'country',
      'pincode',
      'languages',
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

    // Verify user belongs to same wedding
    const [existing] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), eq(users.weddingId, auth.weddingId)))
      .limit(1);

    if (!existing) return notFoundResponse('Team member');

    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        persona: users.persona,
        weddingAccess: users.weddingAccess,
        weddingId: users.weddingId,
        street: users.street,
        city: users.city,
        state: users.state,
        country: users.country,
        pincode: users.pincode,
        languages: users.languages,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return Response.json(updatedUser);
  } catch (error) {
    console.error('[PUT /api/v1/users/[id]]', error);
    return errorResponse('Failed to update team member.');
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const isAdmin = await requireAdminScope(auth);
    if (!isAdmin) {
      return Response.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const { id } = await params;

    // Verify user belongs to same wedding
    const [existing] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), eq(users.weddingId, auth.weddingId)))
      .limit(1);

    if (!existing) return notFoundResponse('Team member');

    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    return Response.json({ message: 'Team member deleted successfully.', user: deletedUser });
  } catch (error) {
    console.error('[DELETE /api/v1/users/[id]]', error);
    return errorResponse('Failed to delete team member.');
  }
}
