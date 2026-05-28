import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { SupportRepository } from '@/repositories/support.repository';
import { limiters } from '@/lib/security/rate-limiter';

/** Owner polls their support messages — called every few seconds by the chat client. */
export async function GET(req: Request): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
  const rl = await limiters.public.limit(`support-poll:${ip}`);
  if (!rl.success) return NextResponse.json({ error: 'Rate limited' }, { status: 429 });

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const restaurant = await new RestaurantRepository().findByOwnerId(session.user.id);
  if (!restaurant) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const messages = await new SupportRepository().listByRestaurant(restaurant.id);
  await new SupportRepository().markReadByOwner(restaurant.id);
  return NextResponse.json(messages);
}
