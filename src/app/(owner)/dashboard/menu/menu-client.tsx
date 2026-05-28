'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { CategoriesPanel } from './categories-panel';
import { ItemsPanel } from './items-panel';
import { DialogsHost } from './dialogs-host';
import type { EditorTarget, PendingDialog } from './menu-dialogs';
import { Toast } from './toast';
import { useMenuState } from './use-menu-state';
import { useMenuActions } from './use-menu-actions';
import type { MenuPageData } from './types';

export function MenuClient({ data }: { data: MenuPageData }): React.JSX.Element {
  const t = useTranslations('owner.menu');
  const locale = useLocale();
  const { state, commit } = useMenuState({ categories: data.categories, items: data.items });
  const [activeId, setActiveId] = useState<string | null>(state.categories[0]?.id ?? null);
  const [editor, setEditor] = useState<EditorTarget>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [pending, setPending] = useState<PendingDialog>(null);
  const [toast, setToast] = useState<string | null>(null);

  const activeCategory = useMemo(
    () => state.categories.find((c) => c.id === activeId) ?? state.categories[0] ?? null,
    [state.categories, activeId],
  );
  const visibleItems = useMemo(
    () => state.items.filter((i) => activeCategory && i.categoryId === activeCategory.id),
    [state.items, activeCategory],
  );

  const actions = useMenuActions({
    commit,
    currencyCode: data.currencyCode,
    itemsInActiveCategory: visibleItems,
    categories: state.categories,
    allItems: state.items,
    onFail: (m) => setToast(m ?? t('errors.uploadFailed')),
  });

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row">
        <CategoriesPanel
          categories={state.categories}
          maxCategories={data.maxCategories}
          activeId={activeCategory?.id ?? null}
          onSelect={setActiveId}
          onCreate={actions.addCategory}
          onRename={actions.rename}
          onDelete={(id) => setPending({ kind: 'deleteCategory', id })}
          onReorder={actions.reorderCats}
        />
        <ItemsPanel
          category={activeCategory}
          items={visibleItems}
          allItemsCount={state.items.length}
          maxItems={data.maxItems}
          currencyCode={data.currencyCode}
          locale={locale}
          onAdd={() =>
            activeCategory && setEditor({ kind: 'create', categoryId: activeCategory.id })
          }
          onEdit={(item) => setEditor({ kind: 'edit', item })}
          onDelete={(item) => setPending({ kind: 'deleteItem', item })}
          onToggle={actions.toggleItem}
          onReorder={actions.reorderItemsInCat}
          onBulkPrice={() => setBulkOpen(true)}
        />
      </div>

      <DialogsHost
        editor={editor}
        pending={pending}
        bulkOpen={bulkOpen}
        activeCategory={activeCategory}
        visibleItemsCount={visibleItems.length}
        data={data}
        locale={locale}
        actions={actions}
        onCloseEditor={() => setEditor(null)}
        onCloseBulk={() => setBulkOpen(false)}
        onClosePending={() => setPending(null)}
        onPostDeleteCategory={(id) => {
          if (activeId === id) setActiveId(state.categories[0]?.id ?? null);
        }}
        onUploadError={setToast}
      />

      {toast ? <Toast message={toast} onDismiss={() => setToast(null)} /> : null}
    </>
  );
}
