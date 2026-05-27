'use client';

import { useTranslations } from 'next-intl';
import { ConfirmDialog } from './confirm-dialog';
import { ItemModal } from './item-modal';
import { BulkPriceModal } from './bulk-price-modal';
import type { CategoryView, ItemDraft, ItemView } from './types';

export type PendingDialog =
  | { kind: 'deleteCategory'; id: string }
  | { kind: 'deleteItem'; item: ItemView }
  | null;

export type EditorTarget =
  | { kind: 'create'; categoryId: string }
  | { kind: 'edit'; item: ItemView }
  | null;

interface Props {
  editor: EditorTarget;
  pending: PendingDialog;
  bulkOpen: boolean;
  activeCategory: CategoryView | null;
  itemCount: number;
  currencyCode: string;
  locale: string;
  defaultLocale: 'en' | 'ar';
  closeEditor: () => void;
  closeBulk: () => void;
  closePending: () => void;
  onSaveItem: (draft: ItemDraft, id: string | null) => Promise<boolean>;
  onItemUploadError: (message: string) => void;
  onApplyBulk: (mode: 'percent' | 'absolute', value: number) => Promise<void>;
  onConfirmDeleteCategory: (id: string) => void;
  onConfirmDeleteItem: (item: ItemView) => void;
}

/** Cluster of overlay dialogs that the menu page can show. */
export function MenuDialogs(props: Props): React.JSX.Element {
  return (
    <>
      {props.editor ? (
        <ItemModal
          categoryId={
            props.editor.kind === 'create'
              ? props.editor.categoryId
              : props.editor.item.categoryId
          }
          currencyCode={props.currencyCode}
          locale={props.locale}
          defaultLocale={props.defaultLocale}
          initial={props.editor.kind === 'edit' ? props.editor.item : null}
          onCancel={props.closeEditor}
          onSave={props.onSaveItem}
          onError={props.onItemUploadError}
        />
      ) : null}

      {props.bulkOpen && props.activeCategory ? (
        <BulkPriceModal
          itemCount={props.itemCount}
          onCancel={props.closeBulk}
          onApply={props.onApplyBulk}
        />
      ) : null}

      {props.pending?.kind === 'deleteCategory' ? (
        <DeleteCategoryDialog
          id={props.pending.id}
          onConfirm={props.onConfirmDeleteCategory}
          onCancel={props.closePending}
        />
      ) : null}

      {props.pending?.kind === 'deleteItem' ? (
        <DeleteItemDialog
          item={props.pending.item}
          onConfirm={props.onConfirmDeleteItem}
          onCancel={props.closePending}
        />
      ) : null}
    </>
  );
}

function DeleteCategoryDialog({
  id,
  onConfirm,
  onCancel,
}: {
  id: string;
  onConfirm: (id: string) => void;
  onCancel: () => void;
}): React.JSX.Element {
  const t = useTranslations('owner.menu');
  return (
    <ConfirmDialog
      title={t('deleteCategory')}
      message={t('deleteCategoryConfirm')}
      confirmLabel={t('deleteCategory')}
      cancelLabel={t('form.cancel')}
      destructive
      onConfirm={() => onConfirm(id)}
      onCancel={onCancel}
    />
  );
}

function DeleteItemDialog({
  item,
  onConfirm,
  onCancel,
}: {
  item: ItemView;
  onConfirm: (item: ItemView) => void;
  onCancel: () => void;
}): React.JSX.Element {
  const t = useTranslations('owner.menu');
  return (
    <ConfirmDialog
      title={t('deleteItem')}
      message={t('deleteItemConfirm')}
      confirmLabel={t('deleteItem')}
      cancelLabel={t('form.cancel')}
      destructive
      onConfirm={() => onConfirm(item)}
      onCancel={onCancel}
    />
  );
}
