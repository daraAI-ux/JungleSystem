import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  getKolamBrandFlagByCountry,
  KOLAM_BRAND_FLAG_OPTIONS,
  type KolamBrand,
  type KolamBrandStatus,
} from '../domain/kolam-brand';
import { getKolamFormSection } from '../domain/kolam-form';
import { getKolamTableColumns } from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamBrandController,
  type KolamBrandController,
} from '../hooks/use-kolam-brand-controller';
import { KolamBrandLogo } from './kolam-brand-logo';
import { KolamButton } from './kolam-button';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDataTableHeader } from './kolam-data-table-header';
import {
  KolamDataTableAmountCell,
  KolamDataTableMetaCell,
} from './kolam-data-table-text-cell';
import { KolamDataTableRowFrame } from './kolam-data-table-row-frame';
import { KolamDescriptionList } from './kolam-description-list';
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
  KolamPaginationSizeControl,
  KolamPaginationSummaryLabel,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFlagIcon } from './kolam-flag-icon';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamNativeFormSection } from './kolam-native-form-section';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamHoverTooltip } from './kolam-hover-tooltip';
import { KolamStatusBadge } from './kolam-status-badge';

type BrandSortMode = 'name-asc' | 'name-desc';
type BrandAssetMode = 'none' | 'products-desc' | 'raws-desc';

export function KolamBrandSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamBrandController(route);

  return (
    <KolamModuleShell controller={controller} onRouteChange={onRouteChange}>
      {controller.mode === 'list' ? (
        <KolamBrandList controller={controller} onRouteChange={onRouteChange} />
      ) : (
        <KolamBrandDetail controller={controller} />
      )}
    </KolamModuleShell>
  );
}

function KolamModuleShell({
  children,
  controller,
  onRouteChange,
}: {
  children: React.ReactNode;
  controller: KolamBrandController;
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
                onRouteChange?.('/label-dan-field/merek/baru');
              }}
            />
          ) : (
            <KolamButton
              label="Daftar"
              onPress={() => {
                controller.onBackToList();
                onRouteChange?.('/label-dan-field/merek');
              }}
            />
          )}
        </View>
      </View>
      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          style={styles.errorBadge}
          numberOfLines={2}
        />
      ) : null}
      {children}
    </View>
  );
}

function KolamBrandList({
  controller,
  onRouteChange,
}: {
  controller: KolamBrandController;
  onRouteChange?: (route: string) => void;
}) {
  const [sortMode, setSortMode] = React.useState<BrandSortMode>('name-asc');
  const [assetMode, setAssetMode] = React.useState<BrandAssetMode>('none');
  const [search, setSearch] = React.useState('');
  const [pageSize, setPageSize] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const [deleteCandidate, setDeleteCandidate] =
    React.useState<KolamBrand | null>(null);
  const summary = getBrandSummary(controller.brands);
  const filteredBrands = React.useMemo(
    () => filterBrands(controller.brands, search),
    [controller.brands, search],
  );
  const sortedBrands = React.useMemo(
    () => getSortedBrands(filteredBrands, sortMode, assetMode),
    [assetMode, filteredBrands, sortMode],
  );
  const pageCount = Math.max(1, Math.ceil(sortedBrands.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pagedBrands = sortedBrands.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  React.useEffect(() => {
    setPage(1);
  }, [assetMode, pageSize, search, sortMode]);

  return (
    <View style={styles.stack}>
      <View style={styles.summaryGrid}>
        <SummaryTile label="Total Merek" value={controller.brands.length} />
        <SummaryTile label="Aktif" value={summary.active} />
        <SummaryTile label="Nonaktif" value={summary.inactive} />
        <SummaryTile label="Blacklisted" value={summary.blacklisted} />
      </View>
      <View style={styles.tableToolbar}>
        <KolamFormTextField
          onChangeText={setSearch}
          placeholder="Cari merek..."
          style={styles.searchInput}
          value={search}
        />
        <KolamDropdownSelect<BrandSortMode>
          label="Urutan"
          onChange={setSortMode}
          options={[
            { label: 'Nama A-Z', value: 'name-asc' },
            { label: 'Nama Z-A', value: 'name-desc' },
          ]}
          value={sortMode}
        />
        <KolamDropdownSelect<BrandAssetMode>
          label="Aset terbanyak"
          onChange={setAssetMode}
          options={[
            { label: 'Semua', value: 'none' },
            { label: 'Produk', value: 'products-desc' },
            { label: 'Bahan', value: 'raws-desc' },
          ]}
          value={assetMode}
        />
        <KolamPaginationSizeControl onChange={setPageSize} value={pageSize} />
        <KolamPaginationSummaryLabel
          page={safePage}
          pageSize={pageSize}
          total={sortedBrands.length}
        />
      </View>
      <KolamContentFrame variant="settingsWebConfig">
        <KolamDataTableHeader columns={getKolamTableColumns('brand')} />
        {pagedBrands.length ? (
          pagedBrands.map(brand => (
            <KolamBrandRow
              brand={brand}
              key={brand.id}
              onEdit={() => {
                void controller.onSelectBrand(brand);
                onRouteChange?.(`${getBrandRoute(brand)}/edit`);
              }}
              onDelete={() => setDeleteCandidate(brand)}
              onSelect={() => {
                void controller.onSelectBrand(brand);
                onRouteChange?.(getBrandRoute(brand));
              }}
            />
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              compact
              message="Data Merek belum tersedia dari cache atau backend."
              title={controller.loading ? 'Memuat merek...' : 'Belum ada merek'}
            />
          </View>
        )}
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
        itemType="merek"
        visible={Boolean(deleteCandidate)}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => {
          const brand = deleteCandidate;
          setDeleteCandidate(null);

          if (!brand) {
            return;
          }

          void controller.onDeleteBrand(brand).then(deleted => {
            if (deleted) {
              onRouteChange?.('/label-dan-field/merek');
            }
          });
        }}
      />
    </View>
  );
}

function KolamBrandRow({
  brand,
  onDelete,
  onEdit,
  onSelect,
}: {
  brand: KolamBrand;
  onDelete: () => void;
  onEdit: () => void;
  onSelect: () => void;
}) {
  const flag = getKolamBrandFlagByCountry(brand.originCountry);
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);

  return (
    <KolamDataTableRowFrame style={actionMenuOpen && styles.activeActionRow}>
      <View style={styles.brandIdentityCell}>
        <KolamHoverTooltip label={brand.name}>
          <View style={styles.brandIdentity}>
            <KolamBrandLogo brand={brand} />
          </View>
        </KolamHoverTooltip>
      </View>
      <View style={styles.countryFlagCell}>
        <KolamHoverTooltip label={flag.country}>
          <KolamFlagIcon option={flag} />
        </KolamHoverTooltip>
      </View>
      <KolamDataTableAmountCell style={styles.countCell}>
        {brand.productCount}
      </KolamDataTableAmountCell>
      <KolamDataTableAmountCell style={styles.countCell}>
        {brand.rawMaterialCount}
      </KolamDataTableAmountCell>
      <View style={styles.notesCell}>
        <KolamDataTableMetaCell style={styles.notesText}>
          {brand.notes || brand.description || '-'}
        </KolamDataTableMetaCell>
      </View>
      <View style={styles.rowActions}>
        <KolamStatusBadge
          intent={getBrandStatusIntent(brand.status)}
          label={getBrandStatusLabel(brand.status)}
        />
      </View>
      <View style={styles.overflowCell}>
        <KolamOverflowMenuButton
          accessibilityLabel={`Menu ${brand.name}`}
          onOpenChange={setActionMenuOpen}
          actions={[
            { label: 'Lihat', onPress: onSelect },
            { label: 'Rubah', onPress: onEdit },
            { label: 'Hapus', onPress: onDelete, tone: 'danger' },
          ]}
        />
      </View>
    </KolamDataTableRowFrame>
  );
}

function KolamBrandDetail({
  controller,
}: {
  controller: KolamBrandController;
}) {
  const brand = controller.selectedBrand;
  const editable = controller.isEditable;

  if (!brand && controller.mode !== 'new') {
    return (
      <KolamEmptyState
        message="Pilih salah satu merek dari daftar untuk melihat detail."
        title="Belum ada merek dipilih"
      />
    );
  }

  return (
    <View style={styles.stack}>
      {brand ? <KolamBrandLogoPreview brand={brand} /> : null}
      {!editable && brand ? (
        <KolamContentFrame variant="settingsWebConfig">
          <View style={styles.detailHeader}>
            <KolamStatusBadge
              intent={getBrandStatusIntent(brand.status)}
              label={getBrandStatusLabel(brand.status)}
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
                id: 'country',
                label: 'Negara',
                value: brand.originCountry,
                meta: getKolamBrandFlagByCountry(brand.originCountry).flag,
                tone: 'default',
              },
              {
                id: 'products',
                label: 'Total Produk',
                value: String(brand.productCount),
                meta: 'Backend',
                tone: 'success',
              },
              {
                id: 'raws',
                label: 'Bahan Baku',
                value: String(brand.rawMaterialCount),
                meta: 'Backend',
                tone: 'success',
              },
              {
                id: 'logo',
                label: 'Logo',
                value: brand.logoUrl ?? 'Belum ada logo',
                meta: controller.logoDraft?.syncState ?? 'server',
                tone:
                  controller.logoDraft?.syncState === 'failed'
                    ? 'danger'
                    : 'default',
              },
            ]}
          />
        </KolamContentFrame>
      ) : (
        <KolamBrandForm controller={controller} />
      )}
    </View>
  );
}

function KolamBrandForm({ controller }: { controller: KolamBrandController }) {
  const form = controller.form;

  return (
    <KolamNativeFormSection section={getKolamFormSection('brand-detail')}>
      <View style={settingsWebFormStyles.settingsWebFormFields}>
        <View style={settingsWebFormStyles.settingsWebFormFieldsGrid}>
          <FieldShell label="Nama Merek" required>
            <KolamFormTextField
              editable={!controller.saving}
              onChangeText={name => controller.onChangeForm({ name })}
              placeholder="Nama merek"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={form.name}
            />
          </FieldShell>
          <FieldShell label="Status" required>
            <View style={styles.segmentRow}>
              {(
                ['active', 'inactive', 'blacklisted'] as KolamBrandStatus[]
              ).map(status => (
                <KolamButton
                  intent={form.status === status ? 'primary' : 'outline'}
                  key={status}
                  label={getBrandStatusLabel(status)}
                  onPress={() => controller.onChangeForm({ status })}
                />
              ))}
            </View>
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
          <FieldShell label="Catatan">
            <KolamFormTextField
              editable={!controller.saving}
              multiline
              onChangeText={notes => controller.onChangeForm({ notes })}
              placeholder="Catatan internal"
              style={[
                settingsWebFormStyles.settingsWebFormFieldValue,
                settingsWebFormStyles.settingsWebFormFieldValueTextarea,
              ]}
              value={form.notes}
            />
          </FieldShell>
          <FieldShell label="Link">
            <KolamFormTextField
              editable={!controller.saving}
              multiline
              onChangeText={linkText => controller.onChangeForm({ linkText })}
              placeholder="Satu link per baris"
              style={[
                settingsWebFormStyles.settingsWebFormFieldValue,
                settingsWebFormStyles.settingsWebFormFieldValueTextarea,
              ]}
              value={form.linkText}
            />
          </FieldShell>
          <FieldShell label="Logo lokal">
            <View style={styles.logoPickerRow}>
              <KolamFormTextField
                editable={!controller.saving}
                mode="url"
                onChangeText={logoLocalUri =>
                  controller.onChangeForm({ logoLocalUri })
                }
                placeholder="Pilih file logo dari komputer"
                style={[
                  settingsWebFormStyles.settingsWebFormFieldValue,
                  styles.logoPickerInput,
                ]}
                value={form.logoLocalUri}
              />
              <KolamButton
                disabled={controller.saving}
                label="Pilih Logo"
                onPress={() => {
                  void controller.onPickLogo();
                }}
              />
            </View>
          </FieldShell>
          <FieldShell label="Logo server">
            <KolamFormTextField
              editable={!controller.saving}
              mode="url"
              onChangeText={logoRemoteUrl =>
                controller.onChangeForm({ logoRemoteUrl })
              }
              placeholder="URL logo dari backend"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={form.logoRemoteUrl}
            />
          </FieldShell>
        </View>
        <FieldShell label="Bendera asal" required wide>
          <ScrollView
            nestedScrollEnabled
            style={styles.flagScroll}
            contentContainerStyle={styles.flagGrid}
          >
            {KOLAM_BRAND_FLAG_OPTIONS.map(option => (
              <KolamButton
                icon={<KolamFlagIcon option={option} />}
                intent={
                  form.originCountry === option.country ? 'primary' : 'outline'
                }
                key={option.code}
                label={option.country}
                onPress={() =>
                  controller.onChangeForm({ originCountry: option.country })
                }
                style={styles.flagButton}
              />
            ))}
          </ScrollView>
        </FieldShell>
        {controller.logoDraft ? (
          <KolamStatusBadge
            intent={
              controller.logoDraft.syncState === 'failed' ? 'danger' : 'warning'
            }
            label={`Logo ${controller.logoDraft.syncState}`}
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
  wide = false,
}: {
  children: React.ReactNode;
  label: string;
  required?: boolean;
  wide?: boolean;
}) {
  return (
    <View
      style={[
        settingsWebFormStyles.settingsWebFormField,
        wide && styles.fieldWide,
      ]}
    >
      <KolamSettingsWebFieldLabel label={label} required={required} />
      {children}
    </View>
  );
}

function KolamBrandLogoPreview({ brand }: { brand: KolamBrand }) {
  return (
    <View style={styles.logoRow}>
      <KolamBrandLogo brand={brand} variant="detail" />
      <KolamCopyStack
        containerStyle={styles.logoCopy}
        items={[
          { id: 'name', text: brand.name, style: styles.logoTitle },
          {
            id: 'meta',
            text: `${brand.productCount} produk / ${brand.rawMaterialCount} bahan baku`,
            style: styles.logoMeta,
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

function getBrandSummary(brands: KolamBrand[]) {
  return brands.reduce(
    (summary, brand) => {
      summary[brand.status] += 1;
      return summary;
    },
    { active: 0, inactive: 0, blacklisted: 0 },
  );
}

function filterBrands(brands: KolamBrand[], search: string) {
  const query = search.trim().toLowerCase();
  if (!query) {
    return brands;
  }

  return brands.filter(brand =>
    [
      brand.name,
      brand.originCountry,
      brand.description,
      brand.notes,
      String(brand.productCount),
      String(brand.rawMaterialCount),
    ]
      .join(' ')
      .toLowerCase()
      .includes(query),
  );
}

function getSortedBrands(
  brands: KolamBrand[],
  sortMode: BrandSortMode,
  assetMode: BrandAssetMode,
) {
  return [...brands].sort((left, right) => {
    if (assetMode === 'products-desc') {
      return (
        right.productCount - left.productCount ||
        left.name.localeCompare(right.name)
      );
    }

    if (assetMode === 'raws-desc') {
      return (
        right.rawMaterialCount - left.rawMaterialCount ||
        left.name.localeCompare(right.name)
      );
    }

    return sortMode === 'name-desc'
      ? right.name.localeCompare(left.name)
      : left.name.localeCompare(right.name);
  });
}

function getBrandRoute(brand: KolamBrand) {
  return `/label-dan-field/merek/${encodeURIComponent(brand.name)}`;
}

function getBrandStatusLabel(status: KolamBrandStatus) {
  switch (status) {
    case 'inactive':
      return 'Nonaktif';
    case 'blacklisted':
      return 'Blacklist';
    case 'active':
    default:
      return 'Aktif';
  }
}

function getBrandStatusIntent(status: KolamBrandStatus) {
  switch (status) {
    case 'inactive':
      return 'warning';
    case 'blacklisted':
      return 'danger';
    case 'active':
    default:
      return 'success';
  }
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
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 22,
    fontWeight: '900',
  },
  hint: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 18,
  },
  breadcrumb: {
    marginTop: 6,
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
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
  rowActions: {
    width: 116,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
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
  brandIdentityCell: {
    flex: 1,
    minWidth: 0,
  },
  brandIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
  },
  countryFlagCell: {
    width: 96,
    alignItems: 'flex-start',
  },
  notesCell: {
    width: 180,
  },
  notesText: {
    width: 180,
  },
  countCell: {
    width: 92,
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
  emptyWrap: {
    padding: 16,
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
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  logoCopy: {
    flex: 1,
    minWidth: 0,
  },
  logoTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '900',
  },
  logoMeta: {
    marginTop: 4,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 18,
  },
  fieldWide: {
    flexBasis: '100%',
  },
  flagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flagScroll: {
    maxHeight: 216,
  },
  flagButton: {
    minWidth: 168,
    justifyContent: 'flex-start',
  },
  logoPickerRow: {
    minHeight: V.control.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoPickerInput: {
    flex: 1,
    minWidth: 0,
  },
  segmentRow: {
    minHeight: V.control.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  formActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 8,
  },
});
