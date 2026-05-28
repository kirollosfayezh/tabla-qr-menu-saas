import { auth } from '@/lib/auth/auth';
import { ForbiddenError, UnauthorizedError } from '@/lib/errors/errors';

export interface AdminContext {
  userId: string;
  email: string;
}

/**
 * Resolve an ADMIN-role session.
 * Throws UnauthorizedError if no session, ForbiddenError if the user is not an admin.
 * Use this at the top of every admin page, repository call, and server action.
 */
export async function requireAdmin(): Promise<AdminContext> {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  if (session.user.role !== 'ADMIN') throw new ForbiddenError('Admin only');
  return { userId: session.user.id, email: session.user.email };
}
