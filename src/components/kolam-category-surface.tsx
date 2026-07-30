import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  createKolamDetailItemsFromRawArray,
  getKolamRawArray,
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
  countActiveLocaleAuditItems,
  createCategoryLocaleAuditItems,
} from '../domain/kolam-locale-audit';
import {
  getKolamTableColumns,
  getKolamTableVisualContract,
  type KolamTableColumn,
} from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { getKolamFileUrl } from '../lib/file-url';
import {
  useKolamCategoryController,
  type KolamCategoryController,
} from '../hooks/use-kolam-category-controller';
import { KolamButton } from './kolam-button';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamCatalogTranslationsEditor } from './kolam-catalog-translations-editor';
import { KolamCategoryIcon } from './kolam-category-icon';
import { KolamCopyStack } from './kolam-copy-stack';
import {
  getKolamDataTableColumnStyle,
  KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  KOLAM_DATA_TABLE_COLUMN_GAP,
} from './kolam-data-table-column-style';
import { KolamDataTableHeader } from './kolam-data-table-header';
import { KolamDataTableRowFrame } from './kolam-data-table-row-frame';
import {
  KolamDataTableActionsTrack,
  KolamDataTableMainTrack,
} from './kolam-data-table-tracks';
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamHoverTooltip } from './kolam-hover-tooltip';
import { KolamLabelFieldDetailOverview } from './kolam-label-field-detail-overview';
import { KolamNativeFormSection } from './kolam-native-form-section';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamSearchField } from './kolam-search-field';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
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

  const contextLabel =
    controller.mode === 'new'
      ? 'Kategori baru'
      : controller.mode === 'edit'
        ? `Edit · ${controller.selectedCategory?.name || controller.form.name || 'Kategori'}`
        : controller.selectedCategory?.name || 'Detail kategori';

  return (
    <View style={styles.surface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text numberOfLines={1} style={styles.detailToolbarContext}>
              {contextLabel}
            </Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              disabled={controller.loading}
              label="Refresh"
              onPress={() => {
                void controller.onRefresh();
              }}
            />
            <KolamButton
              label="Daftar"
              onPress={() => {
                controller.onBackToList();
                onRouteChange?.('/label-dan-field/kategori');
              }}
            />
            {controller.mode === 'detail' ? (
              <KolamButton
                intent="primary"
                label="Edit"
                onPress={controller.onEdit}
              />
            ) : null}
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
  const [pageSize, setPageSize] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const [deleteCandidate, setDeleteCandidate] =
    React.useState<KolamCategory | null>(null);
  const [tableBodyWidth, setTableBodyWidth] = React.useState(0);
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
  const listColumns = React.useMemo(
    () => fitCategoryListColumns(tableBodyWidth),
    [tableBodyWidth],
  );
  const expandAllLabel = expandedIds.size > 0 ? 'Tutup Semua' : 'Buka Semua';

  React.useEffect(() => {
    setPage(1);
  }, [pageSize, search]);

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
              disabled={controller.loading}
              label="Refresh"
              onPress={() => {
                void controller.onRefresh();
              }}
            />
            <KolamButton
              intent="primary"
              label="Baru"
              onPress={() => {
                controller.onCreateNew();
                onRouteChange?.('/label-dan-field/kategori/baru');
              }}
            />
          </View>
        </View>
      </View>
      <KolamCatalogListTableShell
        footer={
          <KolamTableFooterControls
            onPageSizeChange={setPageSize}
            page={safePage}
            pageSize={pageSize}
            total={visibleRows.length}
          >
            {pageCount > 1 ? (
              <View style={styles.paginationRow}>
                <KolamButton
                  disabled={safePage <= 1}
                  label="Sebelumnya"
                  onPress={() => setPage(current => Math.max(1, current - 1))}
                />
                <KolamCopyStack
                  items={[
                    {
                      id: 'page',
                      text: `${safePage} / ${pageCount}`,
                      style: styles.pageLabel,
                    },
                  ]}
                />
                <KolamButton
                  disabled={safePage >= pageCount}
                  label="Berikutnya"
                  onPress={() =>
                    setPage(current => Math.min(pageCount, current + 1))
                  }
                />
              </View>
            ) : null}
          </KolamTableFooterControls>
        }
        onBodyWidthChange={setTableBodyWidth}
      >
        <KolamDataTableHeader columns={listColumns} />
        {pagedRows.length ? (
          pagedRows.map(category => (
            <KolamCategoryRow
              category={category}
              columns={listColumns}
              expanded={expandedIds.has(category.id)}
              key={category.id}
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
              onToggle={() =>
                setExpandedIds(current => {
                  const next = new Set(current);
                  if (next.has(category.id)) {
                    next.delete(category.id);
                  } else {
                    next.add(category.id);
                  }
                  return next;
                })
              }
            />
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              compact
              message="Data Kategori belum tersedia dari cache atau backend."
              title={
                controller.loading ? 'Memuat kategori...' : 'Belum ada kategori'
              }
            />
          </View>
        )}
      </KolamCatalogListTableShell>
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

function KolamCategoryRow({
  category,
  columns,
  expanded,
  onAddChild,
  onDelete,
  onEdit,
  onSelect,
  onToggle,
}: {
  category: KolamCategory;
  columns: ReturnType<typeof getKolamTableColumns>;
  expanded: boolean;
  onAddChild: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onSelect: () => void;
  onToggle: () => void;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);
  const [nameTooltipOpen, setNameTooltipOpen] = React.useState(false);
  const hasChildren = category.children.length > 0;
  const canAddChild = category.level < 2;
  const columnOf = React.useCallback(
    (id: (typeof columns)[number]['id']) => columns.find(column => column.id === id),
    [columns],
  );
  const primaryColumn = columnOf('primary');
  const childrenColumn = columnOf('children');
  const productsColumn = columnOf('products');
  const metaColumn = columnOf('meta');
  const marketplaceColumn = columnOf('marketplace');
  const actionsColumn = columnOf('actions');
  const raiseRow = actionMenuOpen || nameTooltipOpen;

  return (
    <KolamDataTableRowFrame
      style={raiseRow ? styles.activeActionRow : undefined}
    >
      <KolamDataTableMainTrack style={styles.mainTrackVisible}>
        <View
          style={[
            styles.listCell,
            styles.identityCell,
            primaryColumn ? getKolamDataTableColumnStyle(primaryColumn) : null,
            styles.overflowVisible,
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
        <View
          style={[
            styles.listCell,
            childrenColumn ? getKolamDataTableColumnStyle(childrenColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.countText}>
            {String(category.childrenCount || category.children.length)}
          </Text>
        </View>
        <View
          style={[
            styles.listCell,
            productsColumn ? getKolamDataTableColumnStyle(productsColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.countText}>
            {String(category.productCount)}
          </Text>
        </View>
        <View
          style={[
            styles.listCell,
            metaColumn ? getKolamDataTableColumnStyle(metaColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.countText}>
            {String(category.speciesCount)}
          </Text>
        </View>
        <View
          style={[
            styles.listCell,
            marketplaceColumn
              ? getKolamDataTableColumnStyle(marketplaceColumn)
              : null,
          ]}
        >
          <KolamStatusBadge
            intent={category.showInMarketplace ? 'success' : 'muted'}
            label={category.showInMarketplace ? 'Tampil' : 'Tersembunyi'}
            style={styles.statusBadge}
          />
        </View>
      </KolamDataTableMainTrack>
      <KolamDataTableActionsTrack
        style={styles.actionsTrack}
        width={Math.max(
          actionsColumn?.width ?? KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
          KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
        )}
      >
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
      </KolamDataTableActionsTrack>
    </KolamDataTableRowFrame>
  );
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
          <KolamLabelFieldDetailOverview
            hero={<KolamCategoryIcon category={category} variant="detail" />}
            status={{
              intent: category.status === 'active' ? 'success' : 'warning',
              label: category.status === 'active' ? 'Aktif' : 'Nonaktif',
            }}
            metrics={[
              { label: 'Produk', value: category.productCount },
              { label: 'Layanan', value: category.serviceCount },
              { label: 'Species', value: category.speciesCount },
            ]}
            meta={[
              {
                label: 'Induk',
                value: category.parentName ?? 'Kategori akar',
              },
              {
                label: 'Marketplace',
                value: category.showInMarketplace
                  ? `Tampil, urutan ${category.marketplaceOrder}`
                  : 'Tidak tampil',
              },
            ]}
            sections={[
              {
                accordion: true,
                title: 'Terjemahan',
                total: countActiveLocaleAuditItems(localeAuditItems),
                description:
                  'Audit isi locale kategori yang tersimpan lokal dan siap dikirim ke backend.',
                items: localeAuditItems,
                emptyText: 'Belum ada data locale untuk diaudit.',
              },
              {
                title: 'Produk',
                total: category.productCount,
                description: 'Produk yang menggunakan kategori ini',
                items: detailLists?.products,
                emptyText: category.productCount
                  ? 'Daftar produk belum tersedia dari cache lokal.'
                  : 'Tidak ada produk yang menggunakan kategori ini',
              },
              {
                title: 'Bahan Baku',
                total: detailLists?.raws.length ?? 0,
                description: 'Bahan baku yang menggunakan kategori ini',
                items: detailLists?.raws,
                emptyText: detailLists?.raws.length
                  ? 'Daftar bahan baku belum tersedia dari cache lokal.'
                  : 'Tidak ada bahan baku yang menggunakan kategori ini',
              },
              {
                title: 'Layanan',
                total: category.serviceCount,
                description: 'Layanan yang menggunakan kategori ini',
                items: detailLists?.services,
                emptyText: category.serviceCount
                  ? 'Daftar layanan belum tersedia dari cache lokal.'
                  : 'Tidak ada layanan yang menggunakan kategori ini',
              },
              {
                title: 'Species',
                total: category.speciesCount,
                description: 'Species yang menggunakan kategori ini',
                items: detailLists?.species,
                emptyText: category.speciesCount
                  ? 'Daftar species belum tersedia dari cache lokal.'
                  : 'Tidak ada species yang menggunakan kategori ini',
              },
            ]}
          />
        </>
      ) : (
        <KolamCategoryForm controller={controller} />
      )}
    </View>
  );
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
    <KolamNativeFormSection section={getKolamFormSection('brand-detail')}>
      <View style={settingsWebFormStyles.settingsWebFormFields}>
        <View style={settingsWebFormStyles.settingsWebFormFieldsGrid}>
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
          <FieldShell label="Icon lokal">
            <View style={styles.iconPickerRow}>
              <KolamFormTextField
                editable={!controller.saving}
                mode="url"
                onChangeText={iconLocalUri =>
                  controller.onChangeForm({ iconLocalUri })
                }
                placeholder="Pilih file icon dari komputer"
                style={[
                  settingsWebFormStyles.settingsWebFormFieldValue,
                  styles.iconPickerInput,
                ]}
                value={form.iconLocalUri}
              />
              <KolamButton
                disabled={controller.saving}
                label="Pilih Icon"
                onPress={() => {
                  void controller.onPickIcon();
                }}
              />
            </View>
          </FieldShell>
        </View>
        <View style={styles.formActions}>
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

function fitCategoryListColumns(containerWidth: number): KolamTableColumn[] {
  const base = getKolamTableColumns('category');
  if (containerWidth <= 0) {
    return base;
  }

  const gap = KOLAM_DATA_TABLE_COLUMN_GAP;
  const paddingX = getKolamTableVisualContract().body.cellPaddingX * 2;
  const actionsWidth = KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH;
  const gapsTotal = gap * Math.max(0, base.length - 1);
  const contentBudget = Math.max(
    0,
    containerWidth - paddingX - gapsTotal - actionsWidth,
  );
  const contentColumns = base.filter(column => column.id !== 'actions');
  const equalWidth = Math.max(
    72,
    Math.floor(contentBudget / Math.max(1, contentColumns.length)),
  );
  let remainder = contentBudget - equalWidth * contentColumns.length;
  const lastContentId = contentColumns[contentColumns.length - 1]?.id;

  return base.map(column => {
    if (column.id === 'actions') {
      return { ...column, width: actionsWidth };
    }

    const extra = column.id === lastContentId ? remainder : 0;
    if (column.id === lastContentId) {
      remainder = 0;
    }

    return {
      ...column,
      width: equalWidth + extra,
    };
  });
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

function getCategoryDetailString(
  record: Record<string, unknown>,
  key: string,
) {
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
  detailToolbarContext: {
    color: V.colors.fg,
    flexShrink: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    minWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  errorBadge: {
    alignSelf: 'flex-start',
    maxWidth: 760,
  },
  stack: {
    gap: 14,
  },
  activeActionRow: {
    zIndex: 1000,
    elevation: 30,
    overflow: 'visible',
  },
  mainTrackVisible: {
    overflow: 'visible',
  },
  listCell: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  identityCell: {
    zIndex: 2,
  },
  overflowVisible: {
    overflow: 'visible',
  },
  identityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
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
  actionsTrack: {
    alignItems: 'center',
  },
  detailThumbnail: {
    width: 38,
    height: 38,
    borderRadius: 7,
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  emptyWrap: {
    padding: 16,
  },
  paginationRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  pageLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
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
  iconPickerRow: {
    minHeight: V.control.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconPickerInput: {
    flex: 1,
    minWidth: 0,
  },
  formActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 8,
  },
});
