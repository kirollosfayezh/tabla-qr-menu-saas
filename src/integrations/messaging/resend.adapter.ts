import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import type { EmailMessage, IMessagingProvider } from './messaging.interface';

const RESEND_API = 'https://api.resend.com/emails';

/** Resend HTTPS API adapter. Falls back to console logging in dev if no key. */
export class ResendAdapter implements IMessagingProvider {
  public async sendEmail(message: EmailMessage): Promise<{ providerMessageId: string | null }> {
    if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
      logger.warn({ to: message.to.email, subject: message.subject }, 'Resend not configured; logging email instead');
      return { providerMessageId: null };
    }
    const from = message.from ?? env.EMAIL_FROM;
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to: [message.to.email],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      logger.error({ status: res.status, body }, 'Resend send failed');
      throw new Error(`Email send failed: ${res.status}`);
    }
    const body = (await res.json().catch(() => ({}))) as { id?: string };
    return { providerMessageId: body.id ?? null };
  }
}
