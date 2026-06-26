import { NextRequest } from 'next/server';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth as authApi } from '@/lib/auth';
import {
  validateApiKey,
  unauthorizedResponse,
  errorResponse,
  requireAdminScope,
  getRequestedWeddingId,
} from '../auth-helper';

export async function GET(request: NextRequest) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const targetWeddingId = getRequestedWeddingId(auth, request);
    if (!targetWeddingId) return errorResponse('weddingId is required.', 400);

    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        persona: users.persona,
        weddingAccess: users.weddingAccess,
        weddingId: users.weddingId,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.weddingId, targetWeddingId))
      .orderBy(users.createdAt);

    return Response.json(result);
  } catch (error) {
    console.error('[GET /api/v1/users]', error);
    return errorResponse('Failed to fetch team members.');
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await validateApiKey(request);
    if (!auth) return unauthorizedResponse();

    const isAdmin = await requireAdminScope(auth);
    if (!isAdmin) {
      return Response.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, role, persona, weddingAccess } = body;

    if (!name || typeof name !== 'string') return errorResponse('name is required.', 400);
    if (!email || typeof email !== 'string') return errorResponse('email is required.', 400);
    if (!password || typeof password !== 'string') return errorResponse('password is required.', 400);
    if (!role || !['admin', 'user', 'client'].includes(role)) {
      return errorResponse('Valid role ("admin", "user", "client") is required.', 400);
    }

    // Check if email already exists
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return errorResponse('A user with this email already exists.', 409);
    }

    // Create user via Better Auth
    const result = await authApi.api.signUpEmail({
      body: {
        name,
        email,
        password,
        persona: persona || 'diy',
      },
    });

    if (!result || !result.user) {
      return errorResponse('Failed to create user account.', 500);
    }

    const targetWeddingId = (role === 'client' || role === 'user')
      ? (weddingAccess === 'all' || !weddingAccess ? auth.weddingId : weddingAccess)
      : null;

    const [updatedUser] = await db
      .update(users)
      .set({
        role,
        persona: persona || 'diy',
        weddingAccess: weddingAccess || 'all',
        weddingId: targetWeddingId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, result.user.id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        persona: users.persona,
        weddingAccess: users.weddingAccess,
        weddingId: users.weddingId,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    return Response.json(updatedUser, { status: 201 });
  } catch (error) {
    console.error('[POST /api/v1/users]', error);
    return errorResponse('Failed to create team member.');
  }
}
