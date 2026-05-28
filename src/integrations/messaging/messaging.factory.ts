import { ResendAdapter } from './resend.adapter';
import type { IMessagingProvider } from './messaging.interface';

let cached: IMessagingProvider | null = null;

/** Returns the active messaging provider (singleton). */
export function getMessaging(): IMessagingProvider {
  if (!cached) cached = new ResendAdapter();
  return cached;
}
