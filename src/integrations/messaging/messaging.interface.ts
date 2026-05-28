export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailMessage {
  to: EmailRecipient;
  subject: string;
  html: string;
  text: string;
  /** Optional override; default `EMAIL_FROM` env var. */
  from?: string;
}

/** Transactional message provider contract. Adapters: Resend, Console (dev). */
export interface IMessagingProvider {
  sendEmail(message: EmailMessage): Promise<{ providerMessageId: string | null }>;
}
