import { BaseRepository } from './base.repository';
import { randomUUID } from 'crypto';

export interface OptionRow {
  id: string;
  label: string;
  labelAr: string | null;
  priceDeltaCents: number;
  sortOrder: number;
}

export interface OptionGroupRow {
  id: string;
  itemId: string;
  name: string;
  nameAr: string | null;
  minSelect: number;
  maxSelect: number;
  required: boolean;
  sortOrder: number;
  options: OptionRow[];
}

export interface OptionGroupSaveInput {
  /** Empty/missing id ⇒ insert. */
  id?: string;
  name: string;
  nameAr: string | null;
  minSelect: number;
  maxSelect: number;
  required: boolean;
  sortOrder: number;
  options: ReadonlyArray<{
    id?: string;
    label: string;
    labelAr: string | null;
    priceDeltaCents: number;
    sortOrder: number;
  }>;
}

/**
 * Data access for menu-item option groups + their options.
 * Uses parameterized raw SQL so the repo compiles before `prisma generate` next runs;
 * works correctly once `pnpm db:push` materializes the new tables.
 */
export class MenuItemOptionsRepository extends BaseRepository {
  /** List all option groups (with options) for one item, sorted. */
  public async listForItem(itemId: string): Promise<OptionGroupRow[]> {
    const groups = await this.db.$queryRaw<Array<{
      id: string;
      item_id: string;
      name: string;
      name_ar: string | null;
      min_select: number;
      max_select: number;
      required: boolean;
      sort_order: number;
    }>>`
      SELECT id, item_id, name, name_ar, min_select, max_select, required, sort_order
      FROM menu_item_option_groups
      WHERE item_id = ${itemId}::uuid
      ORDER BY sort_order ASC, created_at ASC
    `;
    if (groups.length === 0) return [];
    const groupIds = groups.map((g) => g.id);
    const options = await this.db.$queryRawUnsafe<Array<{
      id: string;
      group_id: string;
      label: string;
      label_ar: string | null;
      price_delta_cents: number;
      sort_order: number;
    }>>(
      `SELECT id, group_id, label, label_ar, price_delta_cents, sort_order
       FROM menu_item_options
       WHERE group_id = ANY($1::uuid[])
       ORDER BY sort_order ASC, created_at ASC`,
      groupIds,
    );
    const byGroup = new Map<string, OptionRow[]>();
    for (const id of groupIds) byGroup.set(id, []);
    for (const o of options) {
      byGroup.get(o.group_id)?.push({
        id: o.id,
        label: o.label,
        labelAr: o.label_ar,
        priceDeltaCents: o.price_delta_cents,
        sortOrder: o.sort_order,
      });
    }
    return groups.map((g) => ({
      id: g.id,
      itemId: g.item_id,
      name: g.name,
      nameAr: g.name_ar,
      minSelect: g.min_select,
      maxSelect: g.max_select,
      required: g.required,
      sortOrder: g.sort_order,
      options: byGroup.get(g.id) ?? [],
    }));
  }

  /** Bulk-replace all groups+options for one item atomically. */
  public async replaceForItem(itemId: string, groups: ReadonlyArray<OptionGroupSaveInput>): Promise<void> {
    await this.db.$transaction(async (tx) => {
      await tx.$executeRaw`DELETE FROM menu_item_option_groups WHERE item_id = ${itemId}::uuid`;
      for (let gi = 0; gi < groups.length; gi++) {
        const g = groups[gi]!;
        const nextGroupId = randomUUID();
        const rows = await tx.$queryRaw<Array<{ id: string }>>`
          INSERT INTO menu_item_option_groups (id, item_id, name, name_ar, min_select, max_select, required, sort_order, created_at, updated_at)
          VALUES (${nextGroupId}::uuid, ${itemId}::uuid, ${g.name}, ${g.nameAr}, ${g.minSelect}, ${g.maxSelect}, ${g.required}, ${gi}, NOW(), NOW())
          RETURNING id
        `;
        const groupId = rows[0]?.id;
        if (!groupId) throw new Error('Insert returned no id');
        for (let oi = 0; oi < g.options.length; oi++) {
          const o = g.options[oi]!;
          const nextOptionId = randomUUID();
          await tx.$executeRaw`
            INSERT INTO menu_item_options (id, group_id, label, label_ar, price_delta_cents, sort_order, created_at)
            VALUES (${nextOptionId}::uuid, ${groupId}::uuid, ${o.label}, ${o.labelAr}, ${o.priceDeltaCents}, ${oi}, NOW())
          `;
        }
      }
    });
  }

  /** Look up options by id for a given item (used to compute final cart price server-side). */
  public async resolveSelections(itemId: string, optionIds: ReadonlyArray<string>): Promise<OptionRow[]> {
    if (optionIds.length === 0) return [];
    const rows = await this.db.$queryRawUnsafe<Array<{
      id: string;
      label: string;
      label_ar: string | null;
      price_delta_cents: number;
      sort_order: number;
    }>>(
      `SELECT o.id, o.label, o.label_ar, o.price_delta_cents, o.sort_order
       FROM menu_item_options o
       INNER JOIN menu_item_option_groups g ON g.id = o.group_id
       WHERE g.item_id = $1::uuid AND o.id = ANY($2::uuid[])`,
      itemId,
      optionIds,
    );
    return rows.map((r) => ({
      id: r.id,
      label: r.label,
      labelAr: r.label_ar,
      priceDeltaCents: r.price_delta_cents,
      sortOrder: r.sort_order,
    }));
  }
}
