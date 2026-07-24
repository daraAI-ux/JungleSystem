import React from 'react';
import { StyleSheet, View } from 'react-native';
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
  applyKolamAdaptiveColumnWidths,
  getKolamTableColumnWidthMap,
  getKolamTableColumns,
  type KolamTableColumnWidthMap,
} from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { getKolamFileUrl } from '../lib/file-url';
import {
  useKolamCategoryController,
  type KolamCategoryController,
} from '../hooks/use-kolam-category-controller';
import { KolamButton } from './kolam-button';
import { KolamCatalogTranslationsEditor } from './kolam-catalog-translations-editor';
import { KolamCategoryIcon } from './kolam-category-icon';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDataTableHeader } from './kolam-data-table-header';
import {
  KolamDataTableAmountCell,
  KolamDataTableMetaCell,
} from './kolam-data-table-text-cell';
import { KolamDataTableRowFrame } from './kolam-data-table-row-frame';
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamLabelFieldDetailOverview } from './kolam-label-field-detail-overview';
import { KolamNativeFormSection } from './kolam-native-form-section';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamStatusBadge } from './kolam-status-badge';
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
  return (
    <View style={styles.surface}>
      <View style={styles.header}>
        <View style={styles.headerActions}>
          <KolamButton
            disabled={controller.loading}
            label="Refresh"
            onPress={() => {
              void controller.onRefresh();
            }}
          />
          {controller.mode === 'list' ? (
            <KolamButton
              intent="primary"
              label="Buat Baru"
              onPress={() => {
                controller.onCreateNew();
                onRouteChange?.('/label-dan-field/kategori/baru');
              }}
            />
          ) : (
            <KolamButton
              label="Daftar"
              onPress={() => {
                controller.onBackToList();
                onRouteChange?.('/label-dan-field/kategori');
              }}
            />
          )}
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
  const allCategories = flattenAllCategories(controller.categories);
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
  const summary = getCategorySummary(allCategories);
  const categoryColumns = React.useMemo(
    () =>
      applyKolamAdaptiveColumnWidths(getKolamTableColumns('category'), [
        {
          id: 'children',
          values: allCategories.map(
            category => category.childrenCount || category.children.length,
          ),
          minWidth: 92,
          maxWidth: 132,
        },
        {
          id: 'products',
          values: allCategories.map(category => category.productCount),
          minWidth: 76,
          maxWidth: 104,
        },
        {
          id: 'meta',
          values: allCategories.map(category => category.speciesCount),
          minWidth: 76,
          maxWidth: 104,
        },
        {
          id: 'marketplace',
          values: allCategories.map(category =>
            category.showInMarketplace
              ? `Tampil Urutan ${category.marketplaceOrder}`
              : 'Tersembunyi',
          ),
          minWidth: 112,
          maxWidth: 132,
          charWidth: 7,
        },
      ]),
    [allCategories],
  );
  const columnWidths = React.useMemo(
    () => getKolamTableColumnWidthMap(categoryColumns),
    [categoryColumns],
  );
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
      <View style={styles.summaryGrid}>
        <SummaryTile label="Total Kategori" value={allCategories.length} />
        <SummaryTile label="Root" value={summary.root} />
        <SummaryTile label="Produk" value={summary.products} />
        <SummaryTile label="Species" value={summary.species} />
      </View>
      <View style={kolamTableToolbarStyles.row}>
        <KolamFormTextField
          onChangeText={setSearch}
          placeholder="Cari kategori..."
          style={kolamTableToolbarStyles.searchInput}
          value={search}
        />
        <View style={kolamTableToolbarStyles.controls}>
          <KolamButton
            label={expandedIds.size ? 'Tutup Semua' : 'Buka Semua'}
            onPress={toggleAll}
          />
        </View>
      </View>
      <KolamContentFrame variant="settingsWebConfig">
        <KolamDataTableHeader columns={categoryColumns} />
        <View style={styles.tableBody}>
          {pagedRows.length ? (
            pagedRows.map(category => (
              <KolamCategoryRow
                category={category}
                columnWidths={columnWidths}
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
                  controller.loading
                    ? 'Memuat kategori...'
                    : 'Belum ada kategori'
                }
              />
            </View>
          )}
        </View>
      </KolamContentFrame>
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
  columnWidths,
  expanded,
  onAddChild,
  onDelete,
  onEdit,
  onSelect,
  onToggle,
}: {
  category: KolamCategory;
  columnWidths: KolamTableColumnWidthMap;
  expanded: boolean;
  onAddChild: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onSelect: () => void;
  onToggle: () => void;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);
  const hasChildren = category.children.length > 0;
  const canAddChild = category.level < 2;
  const rowDescription = truncateCategoryRowDescription(
    category.description || 'Tanpa deskripsi',
  );

  return (
    <KolamDataTableRowFrame
      style={[
        styles.categoryRow,
        actionMenuOpen ? styles.activeActionRow : null,
      ]}
    >
      <View style={styles.categoryIdentityCell}>
        <View style={[styles.treeIndent, { width: category.level * 24 }]} />
        <KolamButton
          disabled={!hasChildren}
          label={hasChildren ? (expanded ? 'v' : '>') : '-'}
          onPress={onToggle}
          style={styles.treeButton}
          textStyle={styles.treeButtonText}
        />
        <View style={styles.categoryIdentity}>
          <KolamCategoryIcon category={category} />
          <KolamCopyStack
            containerStyle={styles.categoryCopy}
            items={[
              { id: 'name', text: category.name, style: styles.rowTitle },
              {
                id: 'description',
                text: rowDescription,
                style: styles.rowMeta,
              },
            ]}
          />
        </View>
      </View>
      <View style={[styles.childrenCell, { width: columnWidths.children }]}>
        <KolamDataTableMetaCell style={{ width: columnWidths.children }}>
          {category.childrenCount || category.children.length}
        </KolamDataTableMetaCell>
      </View>
      <KolamDataTableAmountCell
        style={[styles.countCell, { width: columnWidths.products }]}
      >
        {category.productCount}
      </KolamDataTableAmountCell>
      <KolamDataTableAmountCell
        style={[styles.countCell, { width: columnWidths.meta }]}
      >
        {category.speciesCount}
      </KolamDataTableAmountCell>
      <View
        style={[styles.marketplaceCell, { width: columnWidths.marketplace }]}
      >
        <KolamStatusBadge
          intent={category.showInMarketplace ? 'success' : 'muted'}
          label={category.showInMarketplace ? 'Tampil' : 'Tersembunyi'}
        />
        {category.showInMarketplace ? (
          <KolamCopyStack
            items={[
              {
                id: 'order',
                text: `Urutan ${category.marketplaceOrder}`,
                style: styles.marketplaceMeta,
              },
            ]}
          />
        ) : null}
      </View>
      <View style={styles.overflowCell}>
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
          <View style={styles.detailActions}>
            <KolamButton
              intent="primary"
              label="Edit"
              onPress={controller.onEdit}
            />
          </View>
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

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryTile}>
      <KolamCopyStack
        items={[
          { id: 'value', text: value, style: styles.summaryValue },
          { id: 'label', text: label, style: styles.summaryLabel },
        ]}
      />
    </View>
  );
}

function getCategorySummary(categories: KolamCategory[]) {
  return categories.reduce(
    (summary, category) => {
      if (category.level === 0) {
        summary.root += 1;
      }
      summary.products += category.productCount;
      summary.species += category.speciesCount;
      return summary;
    },
    { products: 0, root: 0, species: 0 },
  );
}

function truncateCategoryRowDescription(description: string) {
  const normalized = description.replace(/\s+/g, ' ').trim();
  return normalized.length > 86
    ? `${normalized.slice(0, 83).trimEnd()}...`
    : normalized;
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
  header: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    gap: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
  errorBadge: {
    alignSelf: 'flex-start',
    maxWidth: 760,
  },
  stack: {
    gap: 14,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryTile: {
    minWidth: 150,
    flexGrow: 1,
    padding: 14,
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  summaryValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 22,
    fontWeight: '900',
  },
  summaryLabel: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  tableBody: {
    width: '100%',
  },
  categoryRow: {
    width: '100%',
  },
  categoryIdentityCell: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
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
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryCopy: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  rowMeta: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    lineHeight: 16,
  },
  childrenCell: {
    width: 132,
    alignItems: 'flex-end',
  },
  countCell: {
    width: 92,
  },
  marketplaceCell: {
    width: 132,
    alignItems: 'flex-end',
    gap: 2,
  },
  marketplaceMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 13,
    textAlign: 'right',
  },
  detailThumbnail: {
    width: 38,
    height: 38,
    borderRadius: 7,
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  activeActionRow: {
    zIndex: 1000,
    elevation: 96,
  },
  overflowCell: {
    width: 64,
    alignItems: 'flex-end',
    zIndex: 1100,
    elevation: 30,
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
  detailActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
