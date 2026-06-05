import { AuditLogRepository } from '@/repositories/admin/audit-log.repository';
import { logger } from '@/lib/logger';
import type { AdminContext } from '@/lib/admin/require-admin';

export type AuditAction =
  | 'restaurant.suspend'
  | 'restaurant.activate'
  | 'restaurant.set_status'
  | 'restaurant.delete'
  | 'user.set_role'
  | 'payment.refund'
  | 'payment.manual_confirm'
  | 'payment_method.enable'
  | 'payment_method.disable'
  | 'theme.create'
  | 'theme.update'
  | 'theme.delete'
  | 'package.create'
  | 'package.update'
  | 'package.delete'
  | 'email.broadcast'
  | 'restaurant.assign_plan';

export class AuditLogService {
  constructor(private readonly repo: AuditLogRepository = new AuditLogRepository()) {}

  /** Record an admin action. Logs to pino too — never throws (failures are warned, not propagated). */
  public async record(
    actor: AdminContext,
    action: AuditAction,
    target: { type: string; id?: string | null },
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.repo.insert({
        actorId: actor.userId,
        actorEmail: actor.email,
        action,
        targetType: target.type,
        targetId: target.id ?? null,
        metadata,
      });
    } catch (err) {
      logger.warn({ err, action }, 'audit log insert failed (table missing? run pnpm db:push)');
    }
  }
}
