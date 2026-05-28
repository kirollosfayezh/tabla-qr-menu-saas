import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/errors/error-handler';
import { verifyPaymobHmac } from '@/integrations/payment/paymob-hmac';
import { ForbiddenError } from '@/lib/errors/errors';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { PaymentService } from '@/services/payment.service';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const ip = await clientIp();
    await enforceRateLimit('webhook', `paymob:${ip}`);
    const payload = await req.json();
    const hmac = req.nextUrl.searchParams.get('hmac');
    if (!verifyPaymobHmac(payload, hmac)) {
      // Audit the attempt before refusing.
      await new PaymentService().recordRejectedWebhook(payload);
      throw new ForbiddenError('Invalid Paymob signature');
    }
    await new PaymentService().handlePaymobWebhook(payload);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
}
