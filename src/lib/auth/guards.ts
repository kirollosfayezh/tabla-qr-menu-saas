import { auth } from './auth';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors/errors';

export interface SessionUser {
  id: string;
  email: string;
  role?: string;
}

/** Require an authenticated session; throws UnauthorizedError otherwise. */
export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.email) throw new UnauthorizedError();
  return {
    id: (session.user as { id: string }).id,
    email: session.user.email,
    role: (session.user as { role?: string }).role,
  };
}

/** Require the user to have the ADMIN role. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== 'ADMIN') throw new ForbiddenError('Admin access required');
  return user;
}
