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
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { getKolamFileUrl } from '../lib/file-url';
import {
  useKolamCategoryController,
  type KolamCategoryController,
} from '../hooks/use-kolam-category-controller';
import { KolamButton } from './kolam-button';
import { KolamRefreshButton } from './kolam-refresh-button';
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
import { KolamLabelFieldDetailOverview } from './kolam-label-field-detail-overview';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
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
      ? `Edit · ${
          controller.selectedCategory?.name ||
          controller.form.name ||
          'Kategori'
        }`
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
            <KolamRefreshButton
              accessibilityLabel="Refresh"
              disabled={controller.loading}
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
            <KolamRefreshButton
              accessibilityLabel="Refresh"
              disabled={controller.loading}
              onPress={() => {
                void controller.onRefresh();
              }}
            />
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
