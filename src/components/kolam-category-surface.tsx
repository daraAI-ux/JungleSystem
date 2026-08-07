import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  createKolamDetailItemsFromRawArray,
  getKolamRawArray,
  type KolamDetailListItem,
} from '../domain/kolam-detail-list';
import {
  filterKolamCategoryTree,
  flattenAllCategories,
  flattenKolamCategoryTree,
  getKolamCategoryTreeIds,
  type KolamCategory,
} from '../domain/kolam-category';
import { getKolamFormSection } from '../domain/kolam-form';
import {
  createCategoryLocaleAuditItems,
} from '../domain/kolam-locale-audit';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { getKolamFileUrl } from '../lib/file-url';
import {
  useKolamCategoryController,
  type KolamCategoryController,
} from '../hooks/use-kolam-category-controller';
import { KolamButton } from './kolam-button';
import {KolamDaftarButton} from './kolam-daftar-button';
import {KolamEditButton} from './kolam-edit-button';
import { KolamCatalogTranslationsEditor } from './kolam-catalog-translations-editor';
import { KolamCategoryIcon } from './kolam-category-icon';
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamHoverTooltip } from './kolam-hover-tooltip';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import { KolamDetailSummaryCard } from './kolam-detail-summary-card';
import {
  KolamListTableComposition,
  KolamListTablePaginationFooter,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import { KolamNativeFormSection } from './kolam-native-form-section';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamSearchField } from './kolam-search-field';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { KolamSettingsWebFileField } from './kolam-settings-web-file-field';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamTableFilterTrigger } from './kolam-table-filter-trigger';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

export function KolamCategorySurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamCategoryController(route);

  return (
    <KolamCategoryShell controller={controller} onRouteChange={onRouteChange}>
      {controller.mode === 'list' ? (
        <KolamCategoryList
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : (
        <KolamCategoryDetail controller={controller} />
      )}
    </KolamCategoryShell>
  );
}

function KolamCategoryShell({
  children,
  controller,
  onRouteChange,
}: {
  children: React.ReactNode;
  controller: KolamCategoryController;
  onRouteChange?: (route: string) => void;
}) {
  if (controller.mode === 'list') {
    return (
      <View style={styles.surface}>
        {controller.error ? (
          <KolamStatusBadge
            intent="danger"
            label={controller.error}
            numberOfLines={2}
            style={styles.errorBadge}
          />
        ) : null}
        {children}
      </View>
    );
  }

  return (
    <View style={styles.surface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters} />
          <View style={kolamTableToolbarStyles.actions}>
            {controller.mode === 'detail' ? (
              <>
                <KolamDaftarButton
                  onPress={() => {
                    controller.onBackToList();
                    onRouteChange?.('/label-dan-field/kategori');
                  }}
                />
                <KolamEditButton
                  intent="primary"
                  onPress={controller.onEdit}
                />
              </>
            ) : (
              <>
                <KolamButton
                  disabled={controller.saving}
                  label="Batal"
                  onPress={controller.onBackToList}
                />
                <KolamButton
                  disabled={controller.saving}
                  intent="primary"
                  label={controller.saving ? 'Menyimpan...' : 'Simpan'}
                  onPress={() => {
                    void controller.onSave();
                  }}
                />
              </>
            )}
          </View>
        </View>
      </View>
      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={2}
          style={styles.errorBadge}
        />
      ) : null}
      {children}
    </View>
  );
}

function KolamCategoryList({
  controller,
  onRouteChange,
}: {
  controller: KolamCategoryController;
  onRouteChange?: (route: string) => void;
}) {
  const [search, setSearch] = React.useState('');
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(
    () => new Set(),
  );
  const pageSize = 10;
  const [page, setPage] = React.useState(1);
  const [deleteCandidate, setDeleteCandidate] =
    React.useState<KolamCategory | null>(null);
  const filteredTree = React.useMemo(
    () => filterKolamCategoryTree(controller.categories, search),
    [controller.categories, search],
  );
  const visibleRows = React.useMemo(
    () => flattenKolamCategoryTree(filteredTree, expandedIds),
    [expandedIds, filteredTree],
  );
  const pageCount = Math.max(1, Math.ceil(visibleRows.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pagedRows = visibleRows.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const listColumns = React.useMemo<Array<KolamListTableColumn<KolamCategory>>>(
    () =>
      buildCategoryListColumns({
        expandedIds,
        onToggle: category =>
          setExpandedIds(current =>
            toggleCategoryExpanded(current, category.id),
          ),
      }),
    [expandedIds],
  );
  const expandAllLabel = expandedIds.size > 0 ? 'Tutup Semua' : 'Buka Semua';

  React.useEffect(() => {
    setPage(1);
  }, [search]);

  React.useEffect(() => {
    if (!search.trim()) {
      return;
    }

    setExpandedIds(new Set(getKolamCategoryTreeIds(controller.categories)));
  }, [controller.categories, search]);

  const toggleAll = () => {
    setExpandedIds(current =>
      current.size
        ? new Set()
        : new Set(getKolamCategoryTreeIds(controller.categories)),
    );
  };

  return (
    <View style={styles.stack}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <KolamSearchField
              containerStyle={kolamTableToolbarStyles.searchInput}
              onChangeText={setSearch}
              placeholder="Cari kategori..."
              value={search}
            />
            <KolamTableFilterTrigger
              active={expandedIds.size > 0}
              label={expandAllLabel}
              onPress={toggleAll}
              open={expandedIds.size > 0}
              variant="quiet"
            />
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              intent="primary"
              label="Baru"
              tone="positive"
              onPress={() => {
                controller.onCreateNew();
                onRouteChange?.('/label-dan-field/kategori/baru');
              }}
            />
          </View>
        </View>
      </View>
      <KolamListTableComposition
        columns={listColumns}
        emptyTitle={
          controller.loading ? 'Memuat kategori...' : 'Belum ada kategori'
        }
        getRowKey={category => category.id}
        loading={controller.loading}
        pagination={{
          onPageChange: setPage,
          page: safePage,
          pageSize,
          total: visibleRows.length,
        }}
        renderActions={category => (
          <KolamCategoryActionsMenu
            category={category}
            onAddChild={() => {
              controller.onCreateNew();
              controller.onChangeForm({ parentId: category.id });
              onRouteChange?.(
                `/label-dan-field/kategori/baru?parent=${encodeURIComponent(
                  category.id,
                )}`,
              );
            }}
            onDelete={() => setDeleteCandidate(category)}
            onEdit={() => {
              void controller.onSelectCategory(category);
              onRouteChange?.(`${getCategoryRoute(category)}/edit`);
            }}
            onSelect={() => {
              void controller.onSelectCategory(category);
              onRouteChange?.(getCategoryRoute(category));
            }}
          />
        )}
        rows={pagedRows}
      />
      <KolamDeleteConfirmDialog
        itemLabel={deleteCandidate?.name}
        itemType="kategori"
        visible={Boolean(deleteCandidate)}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => {
          const category = deleteCandidate;
          setDeleteCandidate(null);

          if (!category) {
            return;
          }

          void controller.onDeleteCategory(category).then(deleted => {
            if (deleted) {
              onRouteChange?.('/label-dan-field/kategori');
            }
          });
        }}
      />
    </View>
  );
}

function buildCategoryListColumns({
  expandedIds,
  onToggle,
}: {
  expandedIds: Set<string>;
  onToggle: (category: KolamCategory) => void;
}): Array<KolamListTableColumn<KolamCategory>> {
  return [
    {
      flex: 1.45,
      id: 'primary',
      label: 'Kategori',
      render: category => (
        <KolamCategoryIdentityCell
          category={category}
          expanded={expandedIds.has(category.id)}
          onToggle={() => onToggle(category)}
        />
      ),
    },
    {
      align: 'center',
      flex: 0.72,
      id: 'children',
      label: 'Sub',
      render: category => (
        <Text numberOfLines={1} style={styles.countText}>
          {String(category.childrenCount || category.children.length)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.72,
      id: 'products',
      label: 'Produk',
      render: category => (
        <Text numberOfLines={1} style={styles.countText}>
          {String(category.productCount)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.72,
      id: 'meta',
      label: 'Species',
      render: category => (
        <Text numberOfLines={1} style={styles.countText}>
          {String(category.speciesCount)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.92,
      id: 'marketplace',
      label: 'Marketplace',
      render: category => (
        <KolamStatusBadge
          intent={category.showInMarketplace ? 'success' : 'muted'}
          label={category.showInMarketplace ? 'Tampil' : 'Tersembunyi'}
          style={styles.statusBadge}
        />
      ),
    },
  ];
}

function KolamCategoryIdentityCell({
  category,
  expanded,
  onToggle,
}: {
  category: KolamCategory;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [nameTooltipOpen, setNameTooltipOpen] = React.useState(false);
  const hasChildren = category.children.length > 0;

  return (
    <View
      style={[
        styles.categoryTableIdentityCell,
        nameTooltipOpen ? styles.categoryTableCellRaised : null,
      ]}
    >
      <View style={styles.identityRow}>
        <View style={[styles.treeIndent, { width: category.level * 24 }]} />
        <KolamButton
          disabled={!hasChildren}
          label={hasChildren ? (expanded ? 'v' : '>') : '-'}
          onPress={onToggle}
          style={styles.treeButton}
          textStyle={styles.treeButtonText}
        />
        <KolamHoverTooltip
          align="center"
          label={category.description || category.name}
          onOpenChange={setNameTooltipOpen}
          placement="bottom"
        >
          <View style={styles.categoryIdentity}>
            <KolamCategoryIcon category={category} />
            <Text numberOfLines={1} style={styles.rowTitle}>
              {category.name}
            </Text>
          </View>
        </KolamHoverTooltip>
      </View>
    </View>
  );
}

function KolamCategoryActionsMenu({
  category,
  onAddChild,
  onDelete,
  onEdit,
  onSelect,
}: {
  category: KolamCategory;
  onAddChild: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onSelect: () => void;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);
  const canAddChild = category.level < 2;

  return (
    <View style={actionMenuOpen ? styles.categoryActionMenuRaised : null}>
      <KolamOverflowMenuButton
        accessibilityLabel={`Menu ${category.name}`}
        onOpenChange={setActionMenuOpen}
        actions={[
          { label: 'Lihat', onPress: onSelect },
          { label: 'Rubah', onPress: onEdit },
          {
            disabled: !canAddChild,
            label: 'Subkategori',
            onPress: onAddChild,
          },
          { label: 'Hapus', onPress: onDelete, tone: 'danger' },
        ]}
      />
    </View>
  );
}

function toggleCategoryExpanded(current: Set<string>, categoryId: string) {
  const next = new Set(current);
  if (next.has(categoryId)) {
    next.delete(categoryId);
  } else {
    next.add(categoryId);
  }
  return next;
}

function KolamCategoryDetail({
  controller,
}: {
  controller: KolamCategoryController;
}) {
  const category = controller.selectedCategory;
  const editable = controller.isEditable;
  const detailLists = category ? getCategoryDetailLists(category) : null;
  const localeAuditItems = category
    ? createCategoryLocaleAuditItems({
        description: category.description,
        name: category.name,
        translations: category.translations,
      })
    : [];

  if (!category && controller.mode !== 'new') {
    return (
      <KolamEmptyState
        message="Pilih salah satu kategori dari daftar untuk melihat detail."
        title="Belum ada kategori dipilih"
      />
    );
  }

  return (
    <View style={styles.stack}>
      {!editable && category ? (
        <>
          <KolamDetailSummaryCard
            body={
              category.description ? (
                <Text style={styles.categorySummaryDescription}>
                  {category.description}
                </Text>
              ) : undefined
            }
            bodyTitle={category.description ? 'Deskripsi' : undefined}
            fieldColumns={3}
            fields={[
              {
                id: 'status',
                label: 'Status',
                value: (
                  <KolamStatusBadge
                    intent={category.status === 'active' ? 'success' : 'warning'}
                    label={category.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  />
                ),
              },
              {
                id: 'parent',
                label: 'Induk',
                value: category.parentName ?? 'Kategori akar',
              },
              {
                id: 'marketplace',
                label: 'Marketplace',
                value: category.showInMarketplace
                  ? `Tampil, urutan ${category.marketplaceOrder}`
                  : 'Tidak tampil',
              },
              { id: 'products', label: 'Produk', value: category.productCount },
              { id: 'services', label: 'Layanan', value: category.serviceCount },
              { id: 'species', label: 'Species', value: category.speciesCount },
            ]}
            leading={
              <View style={styles.categorySummaryIconInCard}>
                <KolamCategoryIcon category={category} variant="summary" />
              </View>
            }
            leadingStyle={styles.categorySummaryLeadingSlot}
            title="Ringkasan kategori"
          />

          <CategoryLocaleSummaryCard
            items={localeAuditItems}
          />

          <View style={styles.categorySummaryGrid}>
            <CategoryLinkedItemsSummaryCard
              description="Produk yang menggunakan kategori ini"
              emptyText={
                category.productCount
                  ? 'Daftar produk belum tersedia dari cache lokal.'
                  : 'Tidak ada produk yang menggunakan kategori ini'
              }
              items={detailLists?.products}
              title="Produk"
            />
            <CategoryLinkedItemsSummaryCard
              description="Bahan baku yang menggunakan kategori ini"
              emptyText={
                detailLists?.raws.length
                  ? 'Daftar bahan baku belum tersedia dari cache lokal.'
                  : 'Tidak ada bahan baku yang menggunakan kategori ini'
              }
              items={detailLists?.raws}
              title="Bahan Baku"
            />
            <CategoryLinkedItemsSummaryCard
              description="Layanan yang menggunakan kategori ini"
              emptyText={
                category.serviceCount
                  ? 'Daftar layanan belum tersedia dari cache lokal.'
                  : 'Tidak ada layanan yang menggunakan kategori ini'
              }
              items={detailLists?.services}
              title="Layanan"
            />
            <CategoryLinkedItemsSummaryCard
              description="Species yang menggunakan kategori ini"
              emptyText={
                category.speciesCount
                  ? 'Daftar species belum tersedia dari cache lokal.'
                  : 'Tidak ada species yang menggunakan kategori ini'
              }
              items={detailLists?.species}
              title="Species"
            />
          </View>
        </>
      ) : (
        <KolamCategoryForm controller={controller} />
      )}
    </View>
  );
}

type CategoryDetailListItem = KolamDetailListItem & {
  fields?: { label: string; value?: string | null }[];
  thumbnail?: React.ReactNode;
};

function CategoryLocaleSummaryCard({
  items,
}: {
  items: CategoryDetailListItem[];
}) {
  return (
    <KolamDetailSummaryCard
      body={
        <CategoryLocaleAccordionList
          emptyText="Belum ada data locale untuk diaudit."
          items={items}
        />
      }
      description="Audit isi locale kategori."
      fields={[]}
      style={styles.categoryLocaleSummaryCard}
      title="Terjemahan"
    />
  );
}

function CategoryLinkedItemsSummaryCard({
  description,
  emptyText,
  items,
  title,
}: {
  description: string;
  emptyText: string;
  items?: CategoryDetailListItem[];
  title: string;
}) {
  return (
    <KolamDetailSummaryCard
      body={<CategoryLinkedItemsList emptyText={emptyText} items={items} />}
      description={description}
      fields={[]}
      style={styles.categorySummaryGridCard}
      title={title}
    />
  );
}

function CategoryLinkedItemsList({
  emptyText,
  items,
}: {
  emptyText: string;
  items?: CategoryDetailListItem[];
}) {
  const pageSize = 5;
  const total = items?.length ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const [page, setPage] = React.useState(1);
  const safePage = Math.min(Math.max(1, page), pageCount);
  const startIndex = (safePage - 1) * pageSize;
  const visibleItems = items?.slice(startIndex, startIndex + pageSize) ?? [];

  React.useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  if (!items?.length) {
    return <Text style={styles.categorySummaryEmptyText}>{emptyText}</Text>;
  }

  return (
    <View style={styles.categorySummaryListBlock}>
      <View style={styles.categorySummaryItemList}>
        {visibleItems.map((item, index) => (
          <View
            key={getCategoryDetailItemKey(item, startIndex + index)}
            style={styles.categorySummaryItemRow}
          >
            {item.thumbnail ? (
              <View style={styles.categorySummaryItemThumbnail}>
                {item.thumbnail}
              </View>
            ) : null}
            <View style={styles.categorySummaryItemCopy}>
              <Text numberOfLines={1} style={styles.categorySummaryItemTitle}>
                {item.title}
              </Text>
              {item.meta ? (
                <Text numberOfLines={1} style={styles.categorySummaryItemMeta}>
                  {item.meta}
                </Text>
              ) : null}
              {item.fields?.length ? (
                <View style={styles.categorySummaryItemFields}>
                  {item.fields.map(field => (
                    <Text
                      key={`${item.title}-${field.label}`}
                      numberOfLines={1}
                      style={styles.categorySummaryItemMeta}
                    >
                      {field.label}: {field.value || '-'}
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>
            {item.value || item.badge ? (
              <View style={styles.categorySummaryItemMetrics}>
                {item.value ? (
                  <Text numberOfLines={1} style={styles.categorySummaryItemValue}>
                    {item.value}
                  </Text>
                ) : null}
                {item.badge ? (
                  <KolamStatusBadge intent="muted" label={item.badge} />
                ) : null}
              </View>
            ) : null}
          </View>
        ))}
      </View>
      <KolamListTablePaginationFooter
        onPageChange={setPage}
        page={safePage}
        pageSize={pageSize}
        siblingCount={0}
        total={total}
      />
    </View>
  );
}

function CategoryLocaleAccordionList({
  emptyText,
  items,
}: {
  emptyText: string;
  items?: CategoryDetailListItem[];
}) {
  const [openKey, setOpenKey] = React.useState<string | null>(
    items?.length ? getCategoryDetailItemKey(items[0], 0) : null,
  );

  React.useEffect(() => {
    if (!items?.length) {
      setOpenKey(null);
      return;
    }

    const keys = items.map(getCategoryDetailItemKey);
    if (!openKey || !keys.includes(openKey)) {
      setOpenKey(keys[0]);
    }
  }, [items, openKey]);

  if (!items?.length) {
    return <Text style={styles.categorySummaryEmptyText}>{emptyText}</Text>;
  }

  return (
    <View style={styles.categoryLocaleAccordionList}>
      {items.map((item, index) => {
        const key = getCategoryDetailItemKey(item, index);
        const isOpen = openKey === key;

        return (
          <View key={key} style={styles.categoryLocaleAccordionItem}>
            <KolamInteractionFrame
              accessibilityLabel={`${isOpen ? 'Tutup' : 'Buka'} ${item.title}`}
              accessibilityState={{ expanded: isOpen }}
              onPress={() => setOpenKey(isOpen ? null : key)}
              style={styles.categoryLocaleAccordionHeader}
            >
              <View style={styles.categoryLocaleAccordionCopy}>
                <Text numberOfLines={1} style={styles.categorySummaryItemTitle}>
                  {item.title}
                </Text>
                {item.value ? (
                  <Text
                    numberOfLines={1}
                    style={styles.categoryLocaleAccordionSummary}
                  >
                    {item.value}
                  </Text>
                ) : null}
              </View>
              {item.badge ? (
                <KolamStatusBadge
                  intent={item.badge === 'Aktif' ? 'success' : 'muted'}
                  label={item.badge}
                />
              ) : null}
              <Text style={styles.categoryLocaleAccordionChevron}>
                {isOpen ? '^' : 'v'}
              </Text>
            </KolamInteractionFrame>
            {isOpen ? (
              <View style={styles.categoryLocaleAccordionContent}>
                {item.meta ? (
                  <Text style={styles.categorySummaryItemMeta}>
                    {item.meta}
                  </Text>
                ) : null}
                {item.value ? (
                  <Text style={styles.categorySummaryItemValue}>
                    {item.value}
                  </Text>
                ) : null}
                {item.fields?.length ? (
                  <View style={styles.categorySummaryItemFields}>
                    {item.fields.map(field => (
                      <Text
                        key={`${item.title}-${field.label}`}
                        style={styles.categorySummaryItemMeta}
                      >
                        {field.label}: {field.value || '-'}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function getCategoryDetailItemKey(item: CategoryDetailListItem, index: number) {
  return `${item.title}-${item.value ?? ''}-${index}`;
}

function KolamCategoryForm({
  controller,
}: {
  controller: KolamCategoryController;
}) {
  const form = controller.form;
  const parentOptions = flattenAllCategories(controller.categories).filter(
    category => category.level < 2 && category.id !== form.id,
  );

  return (
    <KolamNativeFormSection section={getKolamFormSection('category-detail')}>
      <View style={settingsWebFormStyles.settingsWebFormFields}>
        <View style={settingsWebFormStyles.settingsWebFormFieldsGrid}>
          <FieldShell label="Nama" required>
            <KolamFormTextField
              editable={!controller.saving}
              onChangeText={name => controller.onChangeForm({ name })}
              placeholder="Masukkan nama kategori"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={form.name}
            />
          </FieldShell>
          <FieldShell label="Pilih Induk">
            <KolamDropdownSelect
              accessibilityLabel="Pilih induk kategori"
              label="Pilih Induk"
              menuStyle={styles.longDropdownMenu}
              onChange={parentId => controller.onChangeForm({ parentId })}
              options={[
                {
                  label: 'Tanpa induk (kategori akar)',
                  value: '',
                },
                ...parentOptions.map(category => ({
                  label: `${'  '.repeat(category.level)}${category.name}`,
                  value: category.id,
                })),
              ]}
              showLabelInTrigger={false}
              value={form.parentId}
            />
          </FieldShell>
          <FieldShell label="Tampil di Marketplace">
            <View style={styles.segmentRow}>
              <KolamButton
                intent={form.showInMarketplace ? 'primary' : 'outline'}
                label="Tampil"
                onPress={() =>
                  controller.onChangeForm({ showInMarketplace: true })
                }
              />
              <KolamButton
                intent={!form.showInMarketplace ? 'primary' : 'outline'}
                label="Sembunyi"
                onPress={() =>
                  controller.onChangeForm({ showInMarketplace: false })
                }
              />
              <KolamFormTextField
                editable={!controller.saving}
                keyboardType="numeric"
                onChangeText={marketplaceOrder =>
                  controller.onChangeForm({ marketplaceOrder })
                }
                placeholder="Urutan tampil"
                style={[
                  settingsWebFormStyles.settingsWebFormFieldValue,
                  styles.orderInput,
                ]}
                value={form.marketplaceOrder}
              />
            </View>
          </FieldShell>
          <KolamSettingsWebFileField
            accessibilityLabel="Icon kategori"
            actionLabel="Pilih file"
            emptyLabel="Icon belum diatur"
            onLocalValueChange={iconLocalUri =>
              controller.onChangeForm({ iconLocalUri })
            }
            onUpload={() => {
              void controller.onPickIcon();
            }}
            scope="category-icon"
            value={form.iconLocalUri}
          />
          <KolamCatalogTranslationsEditor
            editable={!controller.saving}
            kind="category"
            onChange={translations => controller.onChangeForm({ translations })}
            primary={{
              name: form.name,
              description: form.description,
              onChange: patch => controller.onChangeForm(patch),
            }}
            translations={form.translations}
          />
        </View>
      </View>
    </KolamNativeFormSection>
  );
}

function FieldShell({
  children,
  label,
  required = false,
}: {
  children: React.ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <View style={settingsWebFormStyles.settingsWebFormField}>
      <KolamSettingsWebFieldLabel label={label} required={required} />
      {children}
    </View>
  );
}

function getCategoryRoute(category: KolamCategory) {
  return `/label-dan-field/kategori/${encodeURIComponent(category.name)}`;
}

function getCategoryDetailLists(category: KolamCategory) {
  return {
    products: createCategoryDetailItemsWithThumbnails(
      getKolamRawArray(category.raw, 'products'),
      'produk',
    ),
    raws: createCategoryDetailItemsWithThumbnails(
      getKolamRawArray(category.raw, 'raws'),
      'bahan-baku',
    ),
    services: createKolamDetailItemsFromRawArray(
      getKolamRawArray(category.raw, 'services'),
    ),
    species: createCategoryDetailItemsWithThumbnails(
      getKolamRawArray(category.raw, 'species'),
      'species',
    ),
  };
}

function createCategoryDetailItemsWithThumbnails(
  rawItems: unknown[],
  scope: string,
) {
  const baseItems = createKolamDetailItemsFromRawArray(rawItems);

  return baseItems.map((item, index) => {
    const imageUris = getCategoryDetailItemImageUris(rawItems[index]);
    const imageUri = imageUris[0];

    if (!imageUri) {
      return item;
    }

    return {
      ...item,
      thumbnail: (
        <KolamRemoteImage
          accessibilityLabel={`Foto ${item.title}`}
          previewIndex={0}
          previewItems={imageUris.map((uri, photoIndex) => ({
            id: `${scope}-${index}-${photoIndex}`,
            title: item.title,
            uri,
          }))}
          revision={`${scope}-${index}-${imageUri}`}
          scope={`category-detail-${scope}`}
          sourceUri={imageUri}
          style={styles.detailThumbnail}
        />
      ),
    };
  });
}

function getCategoryDetailItemImageUris(item: unknown) {
  const record = asCategoryDetailRecord(item);
  const values = [
    ...getCategoryDetailStringArray(record, 'photoUris'),
    ...getCategoryDetailStringArray(record, 'photos'),
    ...getCategoryDetailStringArray(record, 'images'),
    getCategoryDetailString(record, 'thumbnailUri'),
    getCategoryDetailString(record, 'thumbnailUrl'),
    getCategoryDetailString(record, 'thumbnailImage'),
    getCategoryDetailString(record, 'thumbnail'),
    getCategoryDetailString(record, 'imageUri'),
    getCategoryDetailString(record, 'imageUrl'),
    getCategoryDetailString(record, 'image'),
    getCategoryDetailString(record, 'photoUri'),
    getCategoryDetailString(record, 'photoUrl'),
    getCategoryDetailString(record, 'photo'),
  ];

  return Array.from(
    new Set(
      values
        .map(value => (value ? getKolamFileUrl(value) ?? value : ''))
        .filter(Boolean),
    ),
  );
}

function getCategoryDetailStringArray(
  record: Record<string, unknown>,
  key: string,
) {
  const value = record[key];

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item =>
      typeof item === 'string'
        ? item.trim()
        : getCategoryDetailString(asCategoryDetailRecord(item), 'url') ||
          getCategoryDetailString(asCategoryDetailRecord(item), 'uri') ||
          getCategoryDetailString(asCategoryDetailRecord(item), 'path') ||
          getCategoryDetailString(asCategoryDetailRecord(item), 'file'),
    )
    .filter(Boolean);
}

function getCategoryDetailString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

function asCategoryDetailRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

const styles = StyleSheet.create({
  surface: {
    gap: 14,
  },
  errorBadge: {
    alignSelf: 'flex-start',
    maxWidth: 760,
  },
  stack: {
    gap: 14,
  },
  categorySummaryLeadingSlot: {
    minHeight: 172,
  },
  categorySummaryIconInCard: {
    alignItems: 'center',
    height: 154,
    justifyContent: 'center',
    width: '100%',
  },
  categorySummaryDescription: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  categorySummaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  categoryLocaleSummaryCard: {
    width: '100%',
  },
  categorySummaryGridCard: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 320,
  },
  categorySummaryListBlock: {
    gap: 8,
  },
  categorySummaryItemList: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
  categorySummaryItemRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 54,
    paddingVertical: 9,
  },
  categorySummaryItemThumbnail: {
    flexShrink: 0,
  },
  categorySummaryItemCopy: {
    flex: 1,
    minWidth: 0,
  },
  categorySummaryItemFields: {
    gap: 2,
    marginTop: 5,
  },
  categorySummaryItemMetrics: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  categorySummaryItemTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
  },
  categorySummaryItemMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  categorySummaryItemValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    maxWidth: 100,
    textAlign: 'right',
  },
  categoryLocaleAccordionList: {
    gap: 8,
  },
  categoryLocaleAccordionItem: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  categoryLocaleAccordionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  categoryLocaleAccordionCopy: {
    flex: 1,
    minWidth: 0,
  },
  categoryLocaleAccordionSummary: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  categoryLocaleAccordionChevron: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    width: 18,
  },
  categoryLocaleAccordionContent: {
    borderTopColor: V.colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  categorySummaryEmptyText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  categoryTableIdentityCell: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    overflow: 'visible',
    width: '100%',
  },
  categoryTableCellRaised: {
    elevation: 30,
    zIndex: 1000,
  },
  identityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    maxWidth: '100%',
    minWidth: 0,
    width: '100%',
  },
  treeIndent: {
    flexShrink: 0,
  },
  treeButton: {
    width: 30,
    minWidth: 30,
    paddingHorizontal: 0,
    marginRight: 8,
  },
  treeButtonText: {
    fontSize: 13,
  },
  categoryIdentity: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    maxWidth: '100%',
    minWidth: 0,
  },
  rowTitle: {
    color: V.colors.fg,
    flexShrink: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    minWidth: 0,
    textAlign: 'left',
  },
  countText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },
  statusBadge: {
    alignSelf: 'center',
  },
  categoryActionMenuRaised: {
    elevation: 30,
    zIndex: 1000,
  },
  detailThumbnail: {
    width: 38,
    height: 38,
    borderRadius: 7,
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  longDropdownMenu: {
    maxHeight: 280,
    minWidth: 360,
  },
  segmentRow: {
    minHeight: V.control.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  orderInput: {
    width: 110,
  },
});
