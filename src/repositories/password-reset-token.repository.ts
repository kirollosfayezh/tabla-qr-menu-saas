import { BaseRepository } from './base.repository';

export interface PasswordResetTokenRow {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
}

/**
 * Password-reset token store.
 * Uses raw SQL so the repo compiles before `prisma generate` picks up the new table.
 * Works correctly once `pnpm db:push` materializes `password_reset_tokens`.
 */
export class PasswordResetTokenRepository extends BaseRepository {
  public async insert(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    await this.db.$executeRaw`
      INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, created_at)
      VALUES (gen_random_uuid(), ${input.userId}::uuid, ${input.tokenHash}, ${input.expiresAt}, NOW())
    `;
  }

  public async findByTokenHash(tokenHash: string): Promise<PasswordResetTokenRow | null> {
    const rows = await this.db.$queryRaw<Array<{
      id: string;
      user_id: string;
      token_hash: string;
      expires_at: Date;
      used_at: Date | null;
    }>>`
      SELECT id, user_id, token_hash, expires_at, used_at
      FROM password_reset_tokens
      WHERE token_hash = ${tokenHash}
      LIMIT 1
    `;
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      userId: row.user_id,
      tokenHash: row.token_hash,
      expiresAt: row.expires_at,
      usedAt: row.used_at,
    };
  }

  public async markUsed(id: string): Promise<void> {
    await this.db.$executeRaw`UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ${id}::uuid`;
  }

  public async deleteExpiredForUser(userId: string): Promise<void> {
    await this.db.$executeRaw`DELETE FROM password_reset_tokens WHERE user_id = ${userId}::uuid AND (expires_at < NOW() OR used_at IS NOT NULL)`;
  }
}
