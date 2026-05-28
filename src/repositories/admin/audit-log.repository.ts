import { BaseRepository } from '../base.repository';

export interface AuditLogRow {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: unknown;
  createdAt: Date;
}

export interface AuditLogCreateInput {
  actorId: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * AuditLog access using parameterized raw SQL.
 * The `audit_logs` table is defined in `schema.prisma` — run `pnpm db:push` to create it.
 * Uses raw SQL so the repository compiles without regenerating the Prisma client,
 * while still being safe from SQL injection thanks to Prisma's parameter tagging.
 */
export class AuditLogRepository extends BaseRepository {
  public async insert(input: AuditLogCreateInput): Promise<void> {
    const metadata = input.metadata ? JSON.stringify(input.metadata) : null;
    await this.db.$executeRaw`
      INSERT INTO audit_logs (id, actor_id, actor_email, action, target_type, target_id, metadata, created_at)
      VALUES (gen_random_uuid(), ${input.actorId}::uuid, ${input.actorEmail}, ${input.action}, ${input.targetType}, ${input.targetId ?? null}, ${metadata}::jsonb, NOW())
    `;
  }

  public async list(limit: number, offset: number): Promise<AuditLogRow[]> {
    const rows = await this.db.$queryRaw<Array<{
      id: string;
      actor_id: string;
      actor_email: string;
      action: string;
      target_type: string;
      target_id: string | null;
      metadata: unknown;
      created_at: Date;
    }>>`
      SELECT id, actor_id, actor_email, action, target_type, target_id, metadata, created_at
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return rows.map((row) => ({
      id: row.id,
      actorId: row.actor_id,
      actorEmail: row.actor_email,
      action: row.action,
      targetType: row.target_type,
      targetId: row.target_id,
      metadata: row.metadata,
      createdAt: row.created_at,
    }));
  }

  public async count(): Promise<number> {
    const rows = await this.db.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*)::bigint AS count FROM audit_logs`;
    return Number(rows[0]?.count ?? 0);
  }
}

