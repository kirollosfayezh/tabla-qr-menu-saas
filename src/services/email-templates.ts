interface BaseTemplate {
  subject: string;
  html: string;
  text: string;
}

interface ResetInput {
  url: string;
  locale: 'en' | 'ar';
  expiresInMinutes: number;
}

interface VerifyInput {
  url: string;
  locale: 'en' | 'ar';
}

interface ReceiptInput {
  locale: 'en' | 'ar';
  themeName: string;
  amountCents: number;
  currencyCode: string;
  transactionId: string;
}

interface RefundInput {
  locale: 'en' | 'ar';
  amountCents: number;
  currencyCode: string;
  refundTransactionId: string;
}

interface InstapayAdminInput {
  restaurantName: string;
  planName: string;
  amountCents: number;
  currencyCode: string;
  paymentId: string;
}

const WRAPPER = (body: string): string => `
<!doctype html>
<html><body style="font-family:Inter,system-ui,Arial,sans-serif;background:#FAFAFB;padding:24px;color:#0F0F1A">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#FFFFFF;border:1px solid #E8E8EC;border-radius:14px;padding:32px">
    ${body}
    <tr><td style="padding-top:24px;border-top:1px solid #E8E8EC;color:#8A8A9A;font-size:12px">Tabla · QR menus for restaurants</td></tr>
  </table>
</body></html>`;

function money(cents: number, currency: string, locale: 'en' | 'ar'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency }).format(cents / 100);
}

/** Escape HTML so admin-authored broadcast text can never inject markup into the email. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Branded wrapper around an admin broadcast. Body is plain text — escaped, newlines → <br>. */
export function broadcastEmail(input: { subject: string; body: string }): BaseTemplate {
  const safeBody = escapeHtml(input.body).replace(/\n/g, '<br>');
  const html = WRAPPER(`
    <tr><td><h1 style="margin:0 0 12px;font-size:22px">${escapeHtml(input.subject)}</h1></td></tr>
    <tr><td style="color:#4A4A5E;font-size:14px;line-height:1.6">${safeBody}</td></tr>
  `);
  return { subject: input.subject, html, text: input.body };
}

export function resetPasswordEmail(input: ResetInput): BaseTemplate {
  const isAr = input.locale === 'ar';
  const subject = isAr ? 'إعادة تعيين كلمة المرور — طبلة' : 'Reset your Tabla password';
  const headline = isAr ? 'إعادة تعيين كلمة المرور' : 'Reset your password';
  const body = isAr
    ? `تلقّينا طلبًا لإعادة تعيين كلمة مرورك. الرابط صالح لـ ${input.expiresInMinutes} دقيقة.`
    : `We received a request to reset your password. This link is valid for ${input.expiresInMinutes} minutes.`;
  const button = isAr ? 'إعادة التعيين' : 'Reset password';
  const footer = isAr ? 'إذا لم تطلب هذا، تجاهل الرسالة.' : "If you didn't request this, you can safely ignore it.";
  const html = WRAPPER(`
    <tr><td><h1 style="margin:0 0 12px;font-size:22px">${headline}</h1></td></tr>
    <tr><td style="color:#4A4A5E;font-size:14px;line-height:1.6">${body}</td></tr>
    <tr><td style="padding:24px 0"><a href="${input.url}" style="display:inline-block;background:#FF6B35;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600">${button}</a></td></tr>
    <tr><td style="color:#8A8A9A;font-size:12px">${footer}</td></tr>
  `);
  const text = `${headline}\n\n${body}\n\n${input.url}\n\n${footer}`;
  return { subject, html, text };
}

export function verifyEmailEmail(input: VerifyInput): BaseTemplate {
  const isAr = input.locale === 'ar';
  const subject = isAr ? 'تأكيد بريدك الإلكتروني — طبلة' : 'Verify your Tabla email';
  const headline = isAr ? 'تأكيد البريد الإلكتروني' : 'Verify your email';
  const body = isAr
    ? 'اضغط الزر أدناه لتأكيد عنوان بريدك. الرابط لاستخدام واحد.'
    : 'Click the button below to verify your email address. The link is single-use.';
  const button = isAr ? 'تأكيد البريد' : 'Verify email';
  const html = WRAPPER(`
    <tr><td><h1 style="margin:0 0 12px;font-size:22px">${headline}</h1></td></tr>
    <tr><td style="color:#4A4A5E;font-size:14px;line-height:1.6">${body}</td></tr>
    <tr><td style="padding:24px 0"><a href="${input.url}" style="display:inline-block;background:#FF6B35;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600">${button}</a></td></tr>
  `);
  const text = `${headline}\n\n${body}\n\n${input.url}`;
  return { subject, html, text };
}

export function paymentReceiptEmail(input: ReceiptInput): BaseTemplate {
  const isAr = input.locale === 'ar';
  const subject = isAr ? `إيصال شراء سمة ${input.themeName} — طبلة` : `Tabla receipt: ${input.themeName}`;
  const headline = isAr ? 'تم استلام دفعتك' : 'Payment received';
  const body = isAr
    ? `شكرًا لشراء سمة <strong>${input.themeName}</strong>. تم تفعيلها في مطعمك.`
    : `Thanks for purchasing the <strong>${input.themeName}</strong> theme. It is now active on your restaurant.`;
  const total = isAr ? 'الإجمالي' : 'Total';
  const tx = isAr ? 'معرف العملية' : 'Transaction id';
  const html = WRAPPER(`
    <tr><td><h1 style="margin:0 0 12px;font-size:22px">${headline}</h1></td></tr>
    <tr><td style="color:#4A4A5E;font-size:14px;line-height:1.6">${body}</td></tr>
    <tr><td style="padding-top:16px"><strong>${total}:</strong> ${money(input.amountCents, input.currencyCode, input.locale)}</td></tr>
    <tr><td style="padding-top:4px;font-family:monospace;font-size:12px"><strong>${tx}:</strong> ${input.transactionId}</td></tr>
  `);
  const text = `${headline}\n\n${input.themeName}\n${total}: ${money(input.amountCents, input.currencyCode, input.locale)}\n${tx}: ${input.transactionId}`;
  return { subject, html, text };
}

export function refundEmail(input: RefundInput): BaseTemplate {
  const isAr = input.locale === 'ar';
  const subject = isAr ? 'تم الاسترداد — طبلة' : 'Refund processed — Tabla';
  const headline = isAr ? 'تم استرداد دفعتك' : 'Your refund was processed';
  const body = isAr
    ? 'تمت إعادة المبلغ إلى وسيلة الدفع الأصلية. قد يستغرق ظهوره ٥-١٠ أيام عمل.'
    : 'The amount has been refunded to your original payment method. It may take 5–10 business days to appear on your statement.';
  const total = isAr ? 'مبلغ الاسترداد' : 'Refund amount';
  const tx = isAr ? 'معرف الاسترداد' : 'Refund transaction id';
  const html = WRAPPER(`
    <tr><td><h1 style="margin:0 0 12px;font-size:22px">${headline}</h1></td></tr>
    <tr><td style="color:#4A4A5E;font-size:14px;line-height:1.6">${body}</td></tr>
    <tr><td style="padding-top:16px"><strong>${total}:</strong> ${money(input.amountCents, input.currencyCode, input.locale)}</td></tr>
    <tr><td style="padding-top:4px;font-family:monospace;font-size:12px"><strong>${tx}:</strong> ${input.refundTransactionId}</td></tr>
  `);
  const text = `${headline}\n\n${total}: ${money(input.amountCents, input.currencyCode, input.locale)}\n${tx}: ${input.refundTransactionId}`;
  return { subject, html, text };
}

export function instapayAdminEmail(input: InstapayAdminInput): BaseTemplate {
  const amount = money(input.amountCents, input.currencyCode, 'en');
  const subject = `InstaPay proof: ${input.restaurantName}`;
  const html = WRAPPER(`
    <tr><td><h1 style="margin:0 0 12px;font-size:22px">InstaPay proof received</h1></td></tr>
    <tr><td style="color:#4A4A5E;font-size:14px;line-height:1.7">
      <strong>Restaurant:</strong> ${escapeHtml(input.restaurantName)}<br>
      <strong>Plan:</strong> ${escapeHtml(input.planName)}<br>
      <strong>Amount:</strong> ${escapeHtml(amount)}<br>
      <strong>Payment ID:</strong> <span style="font-family:monospace">${escapeHtml(input.paymentId)}</span>
    </td></tr>
    <tr><td style="padding-top:16px;color:#8A8A9A;font-size:12px">The payment screenshot is attached to this email.</td></tr>
  `);
  const text = `InstaPay proof received\n\nRestaurant: ${input.restaurantName}\nPlan: ${input.planName}\nAmount: ${amount}\nPayment ID: ${input.paymentId}\n\nThe payment screenshot is attached.`;
  return { subject, html, text };
}

export function welcomeEmail(input: { locale: 'en' | 'ar'; name: string }): BaseTemplate {
  const isAr = input.locale === 'ar';
  const subject = isAr ? 'مرحبًا بك في طبلة' : 'Welcome to Tabla';
  const headline = isAr ? `مرحبًا ${input.name} 👋` : `Welcome, ${input.name} 👋`;
  const body = isAr
    ? 'حسابك جاهز. ابدأ بإنشاء قائمتك وحمّل رمز QR لطباعته على الطاولات.'
    : 'Your account is ready. Build your menu and download the QR code to put on tables.';
  const button = isAr ? 'افتح لوحة التحكم' : 'Open dashboard';
  const html = WRAPPER(`
    <tr><td><h1 style="margin:0 0 12px;font-size:22px">${headline}</h1></td></tr>
    <tr><td style="color:#4A4A5E;font-size:14px;line-height:1.6">${body}</td></tr>
    <tr><td style="padding:24px 0"><a href="/dashboard" style="display:inline-block;background:#FF6B35;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600">${button}</a></td></tr>
  `);
  const text = `${headline}\n\n${body}`;
  return { subject, html, text };
}
