import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  filterKolamCategoryTree,
  flattenAllCategories,
  flattenKolamCategoryTree,
  getKolamCategoryTreeIds,
  type KolamCategory,
} from '../domain/kolam-category';
import { getKolamFormSection } from '../domain/kolam-form';
import { getKolamTableColumns } from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamCategoryController,
  type KolamCategoryController,
} from '../hooks/use-kolam-category-controller';
import { KolamButton } from './kolam-button';
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
import { KolamDescriptionList } from './kolam-description-list';
import {
  KolamOverflowMenuButton,
  KolamPaginationSizeControl,
  KolamPaginationSummaryLabel,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamNativeFormSection } from './kolam-native-form-section';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamStatusBadge } from './kolam-status-badge';

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
      <View style={styles.tableToolbar}>
        <KolamFormTextField
          onChangeText={setSearch}
          placeholder="Cari kategori..."
          style={styles.searchInput}
          value={search}
        />
        <KolamButton
          label={expandedIds.size ? 'Collapse All' : 'Expand All'}
          onPress={toggleAll}
        />
        <KolamPaginationSizeControl onChange={setPageSize} value={pageSize} />
        <KolamPaginationSummaryLabel
          page={safePage}
          pageSize={pageSize}
          total={visibleRows.length}
        />

      </View>
      <KolamContentFrame variant="settingsWebConfig">
        <KolamDataTableHeader columns={getKolamTableColumns('category')} />
        <View style={styles.tableBody}>

          {pagedRows.length ? (
            pagedRows.map(category => (
              <KolamCategoryRow
                category={category}
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
        </View>
      </KolamContentFrame>
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
            onPress={() => setPage(current => Math.min(pageCount, current + 1))}
          />
        </View>
      ) : null}
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
  expanded,
  onAddChild,
  onDelete,
  onEdit,
  onSelect,
  onToggle,
}: {
  category: KolamCategory;
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

  return (
    <KolamDataTableRowFrame
      style={[styles.categoryRow, actionMenuOpen ? styles.activeActionRow : null]}
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
                text: category.description || 'Tanpa deskripsi',
                style: styles.rowMeta,
              },
            ]}
          />
        </View>
      </View>
      <View style={styles.childrenCell}>
        <KolamDataTableMetaCell>
          {category.childrenCount || category.children.length}
        </KolamDataTableMetaCell>
      </View>
      <KolamDataTableAmountCell style={styles.countCell}>
        {category.productCount}
      </KolamDataTableAmountCell>
      <KolamDataTableAmountCell style={styles.countCell}>
        {category.speciesCount}
      </KolamDataTableAmountCell>
      <View style={styles.marketplaceCell}>
        <KolamStatusBadge
          intent={category.showInMarketplace ? 'success' : 'muted'}
          label={
            category.showInMarketplace
              ? 'Tampil'
              : 'Tersembunyi'
          }
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
      {category ? <KolamCategoryIconPreview category={category} /> : null}
      {!editable && category ? (
        <KolamContentFrame variant="settingsWebConfig">
          <View style={styles.detailHeader}>
            <KolamStatusBadge
              intent={category.showInMarketplace ? 'success' : 'muted'}
              label={
                category.showInMarketplace ? 'Marketplace' : 'Tidak tampil'
              }
            />
            <KolamButton
              intent="primary"
              label="Edit"
              onPress={controller.onEdit}
            />
          </View>
          <KolamDescriptionList
            rows={[
              {
                id: 'parent',
                label: 'Parent',
                value: category.parentName ?? 'Root Category',
                meta: `Level ${category.level}`,
                tone: 'default',
              },
              {
                id: 'products',
                label: 'Total Produk',
                value: String(category.productCount),
                meta: 'Backend',
                tone: 'success',
              },
              {
                id: 'species',
                label: 'Species',
                value: String(category.speciesCount),
                meta: 'Backend',
                tone: 'success',
              },
              {
                id: 'services',
                label: 'Services',
                value: String(category.serviceCount),
                meta: 'Backend',
                tone: 'success',
              },
              {
                id: 'marketplace',
                label: 'Marketplace',
                value: category.showInMarketplace
                  ? 'Tampil di marketplace'
                  : 'Tidak tampil',
                meta: `Urutan ${category.marketplaceOrder}`,
                tone: category.showInMarketplace ? 'success' : 'default',
              },
              {
                id: 'icon',
                label: 'Icon',
                value: category.iconUrl ?? 'Belum ada icon',
                meta: controller.iconDraft?.syncState ?? 'local asset',
                tone:
                  controller.iconDraft?.syncState === 'failed'
                    ? 'danger'
                    : 'default',
              },
            ]}
          />
        </KolamContentFrame>
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
          <FieldShell label="Nama Kategori" required>
            <KolamFormTextField
              editable={!controller.saving}
              onChangeText={name => controller.onChangeForm({ name })}
              placeholder="Nama kategori"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={form.name}
            />
          </FieldShell>
          <FieldShell label="Parent">
            <ScrollView
              nestedScrollEnabled
              style={styles.parentScroll}
              contentContainerStyle={styles.parentGrid}
            >
              <KolamButton
                intent={!form.parentId ? 'primary' : 'outline'}
                label="Root Category"
                onPress={() => controller.onChangeForm({ parentId: '' })}
              />
              {parentOptions.map(category => (
                <KolamButton
                  intent={form.parentId === category.id ? 'primary' : 'outline'}
                  key={category.id}
                  label={`${'  '.repeat(category.level)}${category.name}`}
                  onPress={() =>
                    controller.onChangeForm({ parentId: category.id })
                  }
                />
              ))}
            </ScrollView>
          </FieldShell>
          <FieldShell label="Deskripsi">
            <KolamFormTextField
              editable={!controller.saving}
              multiline
              onChangeText={description =>
                controller.onChangeForm({ description })
              }
              placeholder="Deskripsi singkat"
              style={[
                settingsWebFormStyles.settingsWebFormFieldValue,
                settingsWebFormStyles.settingsWebFormFieldValueTextarea,
              ]}
              value={form.description}
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
          <FieldShell label="Icon server">
            <KolamFormTextField
              editable={!controller.saving}
              mode="url"
              onChangeText={iconRemoteUrl =>
                controller.onChangeForm({ iconRemoteUrl })
              }
              placeholder="URL icon dari backend"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={form.iconRemoteUrl}
            />
          </FieldShell>
        </View>
        {controller.iconDraft ? (
          <KolamStatusBadge
            intent={
              controller.iconDraft.syncState === 'failed' ? 'danger' : 'warning'
            }
            label={`Icon ${controller.iconDraft.syncState}`}
          />
        ) : null}
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

function KolamCategoryIconPreview({ category }: { category: KolamCategory }) {
  return (
    <View style={styles.iconRow}>
      <KolamCategoryIcon category={category} variant="detail" />
      <KolamCopyStack
        containerStyle={styles.iconCopy}
        items={[
          { id: 'name', text: category.name, style: styles.iconTitle },
          {
            id: 'meta',
            text: `${category.productCount} produk / ${category.speciesCount} species`,
            style: styles.iconMeta,
          },
        ]}
      />
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

function getCategoryRoute(category: KolamCategory) {
  return `/label-dan-field/kategori/${encodeURIComponent(category.name)}`;
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
  tableToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    zIndex: 8,
  },
  searchInput: {
    width: 240,
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
    minWidth: 30,
    paddingHorizontal: 8,
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
  },
  countCell: {
    width: 92,
  },
  marketplaceCell: {
    width: 132,
    alignItems: 'flex-start',
    gap: 3,
  },
  marketplaceMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  activeActionRow: {
    zIndex: 1000,
    elevation: 30,
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
  detailHeader: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: V.layout.tableCellPaddingX,
    paddingVertical: 12,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  iconCopy: {
    flex: 1,
    minWidth: 0,
  },
  iconTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '900',
  },
  iconMeta: {
    marginTop: 4,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 18,
  },
  parentScroll: {
    maxHeight: 160,
  },
  parentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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










