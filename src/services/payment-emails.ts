import type { Payment } from '@prisma/client';
import type { UserRepository } from '@/repositories/user.repository';
import type { ThemeRepository } from '@/repositories/theme.repository';
import { getMessaging } from '@/integrations/messaging/messaging.factory';
import { paymentReceiptEmail, refundEmail } from './email-templates';

/**
 * Payment notification emails, isolated from PaymentService so the service stays
 * focused on the money-state machine. Both are best-effort: a missing user/email
 * is a silent no-op; the caller swallows transport errors.
 */

export async function sendReceiptEmail(
  users: UserRepository,
  themes: ThemeRepository,
  payment: Payment,
  themeId: string,
  transactionId: string | undefined,
): Promise<void> {
  const user = await users.findById(payment.userId);
  if (!user || !user.email) return;
  const theme = await themes.findById(themeId);
  const locale: 'en' | 'ar' = user.localePreference === 'ar' ? 'ar' : 'en';
  const template = paymentReceiptEmail({
    locale,
    themeName: theme?.name ?? 'Theme',
    amountCents: payment.amountCents,
    currencyCode: payment.currencyCode,
    transactionId: transactionId ?? payment.id,
  });
  await getMessaging().sendEmail({
    to: { email: user.email, name: user.name ?? undefined },
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

export async function sendRefundEmail(
  users: UserRepository,
  payment: Payment,
  refundTransactionId: string,
): Promise<void> {
  const user = await users.findById(payment.userId);
  if (!user || !user.email) return;
  const locale: 'en' | 'ar' = user.localePreference === 'ar' ? 'ar' : 'en';
  const template = refundEmail({
    locale,
    amountCents: payment.amountCents,
    currencyCode: payment.currencyCode,
    refundTransactionId,
  });
  await getMessaging().sendEmail({
    to: { email: user.email, name: user.name ?? undefined },
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}
