import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { SupportRepository } from '@/repositories/support.repository';
import { limiters } from '@/lib/security/rate-limiter';

/** Admin polls a restaurant's thread. Pass ?restaurantId=... */
export async function GET(req: Request): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
  const rl = await limiters.public.limit(`admin-support-poll:${ip}`);
  if (!rl.success) return NextResponse.json({ error: 'Rate limited' }, { status: 429 });

  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const restaurantId = searchParams.get('restaurantId');
  if (!restaurantId) return NextResponse.json({ error: 'Missing restaurantId' }, { status: 400 });

  const messages = await new SupportRepository().listByRestaurant(restaurantId);
  await new SupportRepository().markReadByAdmin(restaurantId);
  return NextResponse.json(messages);
}
