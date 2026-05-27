'use client';

import { MenuDialogs, type EditorTarget, type PendingDialog } from './menu-dialogs';
import type { CategoryView, MenuPageData } from './types';

interface ActionApi {
  saveItem: (draft: import('./types').ItemDraft, id: string | null) => Promise<boolean>;
  applyBulk: (
    categoryId: string,
    mode: 'percent' | 'absolute',
    value: number,
  ) => Promise<void>;
  deleteCat: (id: string) => Promise<void>;
  deleteItem: (item: import('./types').ItemView) => Promise<void>;
}

interface Props {
  editor: EditorTarget;
  pending: PendingDialog;
  bulkOpen: boolean;
  activeCategory: CategoryView | null;
  visibleItemsCount: number;
  data: MenuPageData;
  locale: string;
  actions: ActionApi;
  onCloseEditor: () => void;
  onCloseBulk: () => void;
  onClosePending: () => void;
  onPostDeleteCategory: (id: string) => void;
  onUploadError: (message: string) => void;
}

/** Adapter that wires page-level state into the dumb <MenuDialogs> component. */
export function DialogsHost(props: Props): React.JSX.Element {
  return (
    <MenuDialogs
      editor={props.editor}
      pending={props.pending}
      bulkOpen={props.bulkOpen}
      activeCategory={props.activeCategory}
      itemCount={props.visibleItemsCount}
      currencyCode={props.data.currencyCode}
      locale={props.locale}
      defaultLocale={props.data.defaultLocale}
      closeEditor={props.onCloseEditor}
      closeBulk={props.onCloseBulk}
      closePending={props.onClosePending}
      onSaveItem={async (draft, id) => {
        const ok = await props.actions.saveItem(draft, id);
        if (ok) props.onCloseEditor();
        return ok;
      }}
      onItemUploadError={props.onUploadError}
      onApplyBulk={async (mode, value) => {
        if (!props.activeCategory) return;
        await props.actions.applyBulk(props.activeCategory.id, mode, value);
        props.onCloseBulk();
      }}
      onConfirmDeleteCategory={(id) => {
        props.onClosePending();
        void props.actions.deleteCat(id).then(() => props.onPostDeleteCategory(id));
      }}
      onConfirmDeleteItem={(item) => {
        props.onClosePending();
        void props.actions.deleteItem(item);
      }}
    />
  );
}
