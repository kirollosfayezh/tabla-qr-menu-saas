import type { UserRole } from '@prisma/client';
import { AdminUserRepository } from '@/repositories/admin/admin-user.repository';
import { getMessaging } from '@/integrations/messaging/messaging.factory';
import { AuditLogService } from './audit-log.service';
import { broadcastEmail } from './email-templates';
import { logger } from '@/lib/logger';
import type { AdminContext } from '@/lib/admin/require-admin';
import type { BroadcastAudience, BroadcastEmailDTO } from '@/dtos/broadcast.dto';

/** Send in small chunks with a short pause so we stay under Resend's request rate. */
const CHUNK_SIZE = 5;
const CHUNK_DELAY_MS = 600;

const AUDIENCE_ROLE: Record<BroadcastAudience, UserRole | undefined> = {
  all: undefined,
  owners: 'OWNER',
  admins: 'ADMIN',
};

export interface BroadcastResult {
  total: number;
  sent: number;
  failed: number;
}

/**
 * Sends an admin-authored email to every user in the chosen audience.
 * Best-effort: individual failures are counted, never abort the run, and the
 * whole broadcast is recorded in the audit log.
 */
export class BroadcastService {
  constructor(
    private readonly users: AdminUserRepository = new AdminUserRepository(),
    private readonly audit: AuditLogService = new AuditLogService(),
  ) {}

  public async send(actor: AdminContext, input: BroadcastEmailDTO): Promise<BroadcastResult> {
    const recipients = await this.users.listRecipients(AUDIENCE_ROLE[input.audience]);
    const template = broadcastEmail({ subject: input.subject, body: input.body });

    let sent = 0;
    let failed = 0;
    for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
      const chunk = recipients.slice(i, i + CHUNK_SIZE);
      const settled = await Promise.allSettled(
        chunk.map((r) =>
          getMessaging().sendEmail({
            to: { email: r.email, name: r.name ?? undefined },
            subject: template.subject,
            html: template.html,
            text: template.text,
          }),
        ),
      );
      for (const res of settled) {
        if (res.status === 'fulfilled') sent++;
        else failed++;
      }
      if (i + CHUNK_SIZE < recipients.length) await delay(CHUNK_DELAY_MS);
    }

    if (failed > 0) logger.warn({ failed, total: recipients.length }, 'broadcast: some emails failed to send');
    await this.audit.record(
      actor,
      'email.broadcast',
      { type: 'broadcast' },
      { subject: input.subject, audience: input.audience, total: recipients.length, sent, failed },
    );
    return { total: recipients.length, sent, failed };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
