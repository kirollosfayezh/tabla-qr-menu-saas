import { BaseRepository } from './base.repository';
import type { SupportMessage } from '@prisma/client';

export class SupportRepository extends BaseRepository {
  public listByRestaurant(restaurantId: string): Promise<SupportMessage[]> {
    return this.db.supportMessage.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'asc' },
    });
  }

  public send(restaurantId: string, content: string, senderRole: 'OWNER' | 'ADMIN'): Promise<SupportMessage> {
    return this.db.supportMessage.create({
      data: { restaurantId, content, senderRole },
    });
  }

  public markReadByAdmin(restaurantId: string): Promise<{ count: number }> {
    return this.db.supportMessage.updateMany({
      where: { restaurantId, senderRole: 'OWNER', readByAdmin: false },
      data: { readByAdmin: true },
    });
  }

  public markReadByOwner(restaurantId: string): Promise<{ count: number }> {
    return this.db.supportMessage.updateMany({
      where: { restaurantId, senderRole: 'ADMIN', readByOwner: false },
      data: { readByOwner: true },
    });
  }

  /** For admin inbox: all conversations with last message + unread count. */
  public async listConversations(): Promise<Array<{
    restaurantId: string;
    restaurantName: string;
    lastMessage: string;
    lastAt: Date;
    unreadCount: number;
  }>> {
    const rows = await this.db.$queryRaw<Array<{
      restaurant_id: string;
      restaurant_name: string;
      last_message: string;
      last_at: Date;
      unread_count: bigint;
    }>>`
      SELECT
        r.id           AS restaurant_id,
        r.name         AS restaurant_name,
        sm.content     AS last_message,
        sm.created_at  AS last_at,
        (SELECT COUNT(*) FROM support_messages u
         WHERE u.restaurant_id = r.id AND u.sender_role = 'OWNER' AND u.read_by_admin = false
        ) AS unread_count
      FROM restaurants r
      INNER JOIN support_messages sm ON sm.id = (
        SELECT id FROM support_messages
        WHERE restaurant_id = r.id
        ORDER BY created_at DESC
        LIMIT 1
      )
      ORDER BY sm.created_at DESC
    `;
    return rows.map((r) => ({
      restaurantId: r.restaurant_id,
      restaurantName: r.restaurant_name,
      lastMessage: r.last_message,
      lastAt: r.last_at,
      unreadCount: Number(r.unread_count),
    }));
  }
}
