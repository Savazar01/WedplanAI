import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { taskCategories } from '@/db/schema';
import { eq } from 'drizzle-orm';
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
      'key',
      'name',
      'followUpQuestions',
    ] as const;

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = field === 'key'
          ? String(body[field]).toLowerCase().replace(/\s+/g, '_')
          : body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse('No valid fields provided for update.', 400);
    }

    const [updated] = await db
      .update(taskCategories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(taskCategories.id, id))
      .returning();

    if (!updated) return notFoundResponse('Category');

    return Response.json(updated);
  } catch (error: unknown) {
    console.error('[PUT /api/v1/categories/[id]]', error);
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === '23505') {
      return errorResponse('A category with this key already exists.', 409);
    }
    return errorResponse('Failed to update category.');
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

    const [deleted] = await db
      .delete(taskCategories)
      .where(eq(taskCategories.id, id))
      .returning();

    if (!deleted) return notFoundResponse('Category');

    return Response.json({ message: 'Category deleted successfully.', category: deleted });
  } catch (error) {
    console.error('[DELETE /api/v1/categories/[id]]', error);
    return errorResponse('Failed to delete category.');
  }
}
