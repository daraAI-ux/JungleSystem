import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getKolamTableColumns } from '../domain/kolam-table';
import {
  formatKolamVendorAddress,
  getKolamVendorStatusIntent,
  getKolamVendorStatusLabel,
  KOLAM_SUPPLIER_ROOT,
  type KolamVendor,
} from '../domain/kolam-vendor';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamSupplierController,
  type KolamSupplierController,
} from '../hooks/use-kolam-supplier-controller';
import { KolamButton } from './kolam-button';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDataTableHeader } from './kolam-data-table-header';
import { KolamDataTableRowFrame } from './kolam-data-table-row-frame';
import { KolamDescriptionList } from './kolam-description-list';
import {
  KolamDropdownSelect,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamLabelFieldDetailOverview } from './kolam-label-field-detail-overview';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

type SupplierSortMode = 'name-asc' | 'name-desc' | 'po-desc' | 'newest';
type SupplierStatusFilter = 'all' | 'active' | 'inactive' | 'blacklisted';

export function KolamSupplierSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamSupplierController(route);

  return (
    <View style={styles.surface}>
      <View style={styles.headerActions}>
        <KolamButton
          disabled={controller.loading}
          label="Refresh"
          onPress={() => {
            void controller.onRefresh();
          }}
          style={styles.toolbarButton}
        />
        {controller.mode === 'list' ? null : (
          <KolamButton
            label="Daftar"
            muted
            onPress={() => {
              controller.onBackToList();
              onRouteChange?.(KOLAM_SUPPLIER_ROOT);
            }}
            style={styles.toolbarButton}
          />
        )}
      </View>
      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={2}
          style={styles.errorBadge}
        />
      ) : null}
      {controller.mode === 'list' ? (
        <KolamSupplierList
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : controller.mode === 'detail' ? (
        <KolamSupplierDetail
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : (
        <KolamEmptyState
          compact
          message="Buat dan ubah pemasok akan tersedia di fase berikutnya. Sementara ini gunakan daftar dan detil baca."
          title="Form pemasok belum tersedia"
        />
      )}
    </View>
  );
}

function KolamSupplierList({
  controller,
  onRouteChange,
}: {
  controller: KolamSupplierController;
  onRouteChange?: (route: string) => void;
}) {
  const [search, setSearch] = React.useState('');
  const [sortMode, setSortMode] = React.useState<SupplierSortMode>('name-asc');
  const [statusFilter, setStatusFilter] =
    React.useState<SupplierStatusFilter>('all');
  const [pageSize, setPageSize] = React.useState(10);
  const [page, setPage] = React.useState(1);

  const summary = React.useMemo(
    () => getVendorSummary(controller.vendors),
    [controller.vendors],
  );
  const filtered = React.useMemo(
    () => filterVendors(controller.vendors, search, statusFilter),
    [controller.vendors, search, statusFilter],
  );
  const sorted = React.useMemo(
    () => sortVendors(filtered, sortMode),
    [filtered, sortMode],
  );
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  React.useEffect(() => {
    setPage(1);
  }, [pageSize, search, sortMode, statusFilter]);

  return (
    <View style={styles.stack}>
      <View style={styles.summaryGrid}>
        <SummaryTile label="Total" value={controller.vendors.length} />
        <SummaryTile label="Aktif" value={summary.active} />
        <SummaryTile label="Nonaktif" value={summary.inactive} />
        <SummaryTile label="Blacklist" value={summary.blacklisted} />
      </View>
      <View style={kolamTableToolbarStyles.row}>
        <KolamFormTextField
          onChangeText={setSearch}
          placeholder="Cari pemasok…"
          style={kolamTableToolbarStyles.searchInput}
          value={search}
        />
        <View style={kolamTableToolbarStyles.controls}>
          <KolamDropdownSelect<SupplierSortMode>
            label="Urutan"
            onChange={setSortMode}
            options={[
              { label: 'Nama A-Z', value: 'name-asc' },
              { label: 'Nama Z-A', value: 'name-desc' },
              { label: 'Total PO', value: 'po-desc' },
              { label: 'Terbaru', value: 'newest' },
            ]}
            value={sortMode}
          />
          <KolamDropdownSelect<SupplierStatusFilter>
            label="Status"
            onChange={setStatusFilter}
            options={[
              { label: 'Semua', value: 'all' },
              { label: 'Aktif', value: 'active' },
              { label: 'Nonaktif', value: 'inactive' },
              { label: 'Blacklist', value: 'blacklisted' },
            ]}
            value={statusFilter}
          />
        </View>
      </View>
      <KolamCatalogListTableShell
        footer={
          <KolamTableFooterControls
            onPageSizeChange={setPageSize}
            page={safePage}
            pageSize={pageSize}
            total={sorted.length}
          >
            {pageCount > 1 ? (
              <View style={styles.paginationRow}>
                <KolamButton
                  disabled={safePage <= 1}
                  label="Sebelumnya"
                  onPress={() => setPage(current => Math.max(1, current - 1))}
                />
                <Text style={styles.pageLabel}>
                  {safePage} / {pageCount}
                </Text>
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
      >
        <KolamDataTableHeader columns={getKolamTableColumns('supplier')} />
        {paged.length ? (
          paged.map(vendor => (
            <KolamSupplierRow
              key={vendor.id}
              onSelect={() => {
                void controller.onSelectVendor(vendor);
                onRouteChange?.(`${KOLAM_SUPPLIER_ROOT}/${vendor.id}`);
              }}
              vendor={vendor}
            />
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              compact
              message="Coba ubah pencarian atau filter status."
              title={
                controller.loading ? 'Memuat pemasok…' : 'Belum ada pemasok'
              }
            />
          </View>
        )}
      </KolamCatalogListTableShell>
    </View>
  );
}

function KolamSupplierRow({
  onSelect,
  vendor,
}: {
  onSelect: () => void;
  vendor: KolamVendor;
}) {
  const thumb = vendor.photoUrls[0] || vendor.photos[0] || '';
  return (
    <Pressable onPress={onSelect}>
      <KolamDataTableRowFrame>
        <View style={[styles.cell, styles.primaryCell]}>
          <View style={styles.identity}>
            {thumb ? (
              <KolamRemoteImage
                accessibilityLabel={`Foto ${vendor.name}`}
                resizeMode="cover"
                scope="vendor"
                sourceUri={thumb}
                style={styles.thumb}
              />
            ) : (
              <View style={styles.thumbFallback}>
                <Text style={styles.thumbFallbackText}>
                  {vendor.name.slice(0, 1).toUpperCase()}
                </Text>
              </View>
            )}
            <KolamCopyStack
              containerStyle={styles.identityCopy}
              items={[
                { id: 'name', text: vendor.name, style: styles.rowTitle },
                {
                  id: 'meta',
                  text: [vendor.city, vendor.country].filter(Boolean).join(' · ') || '—',
                  style: styles.rowMeta,
                },
              ]}
            />
          </View>
        </View>
        <View style={[styles.cell, { width: 140 }]}>
          <Text numberOfLines={2} style={styles.cellText}>
            {vendor.phone || '—'}
          </Text>
        </View>
        <View style={[styles.cell, { width: 180 }]}>
          <Text numberOfLines={2} style={styles.cellText}>
            {vendor.email || '—'}
          </Text>
        </View>
        <View style={[styles.cell, { width: 100 }]}>
          <Text style={styles.numText}>{vendor.poCount}</Text>
        </View>
        <View style={[styles.cell, { width: 120 }]}>
          <KolamStatusBadge
            intent={getKolamVendorStatusIntent(vendor.status)}
            label={getKolamVendorStatusLabel(vendor.status)}
          />
        </View>
      </KolamDataTableRowFrame>
    </Pressable>
  );
}

function KolamSupplierDetail({
  controller,
  onRouteChange,
}: {
  controller: KolamSupplierController;
  onRouteChange?: (route: string) => void;
}) {
  const vendor = controller.selectedVendor;

  if (!vendor) {
    return (
      <KolamEmptyState
        compact
        message="Pilih pemasok dari daftar untuk melihat detil."
        title={controller.loading ? 'Memuat detil…' : 'Detil belum tersedia'}
      />
    );
  }

  const address = formatKolamVendorAddress(vendor);
  const heroUri = vendor.photoUrls[0] || vendor.photos[0] || '';

  return (
    <View style={styles.stack}>
      <KolamLabelFieldDetailOverview
        hero={
          heroUri ? (
            <KolamRemoteImage
              accessibilityLabel={`Foto ${vendor.name}`}
              resizeMode="cover"
              scope="vendor"
              sourceUri={heroUri}
              style={styles.heroImage}
            />
          ) : (
            <View style={styles.heroFallback}>
              <Text style={styles.heroFallbackText}>
                {vendor.name.slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )
        }
        meta={[
          { label: 'Telepon', value: vendor.phone || '—' },
          { label: 'Email', value: vendor.email || '—' },
          { label: 'Alamat', value: address || '—' },
          ...(vendor.isOfficialDistributor
            ? [{ label: 'Distributor', value: 'Resmi' }]
            : []),
          ...(vendor.createdByName
            ? [{ label: 'Dibuat oleh', value: vendor.createdByName }]
            : []),
        ]}
        metrics={[
          { label: 'Total PO', value: vendor.poCount },
          { label: 'Produk', value: vendor.productCount },
          { label: 'Species', value: vendor.speciesCount },
          { label: 'Packing', value: vendor.packingCount },
        ]}
        sections={[
          {
            title: 'Merek',
            description: 'Merek yang terkait dengan pemasok ini',
            emptyText: 'Belum ada merek tertaut.',
            total: vendor.brands.length,
            items: vendor.brands.map(brand => ({
              title: brand.name,
              meta: brand.id,
              value: 'Buka merek',
            })),
          },
          {
            title: 'Tautan',
            description: 'URL eksternal pemasok',
            emptyText: 'Belum ada tautan.',
            total: vendor.links.length,
            items: vendor.links.map((link, index) => ({
              title: link,
              meta: `Tautan ${index + 1}`,
            })),
          },
        ]}
        status={{
          intent: getKolamVendorStatusIntent(vendor.status),
          label: getKolamVendorStatusLabel(vendor.status),
        }}
      />

      <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
        <Text style={styles.sectionTitle}>Informasi pemasok</Text>
        <KolamDescriptionList
          accessibilityLabel="Detil pemasok"
          rows={[
            {
              id: 'name',
              label: 'Nama',
              value: vendor.name,
              meta: '',
              tone: 'default',
            },
            {
              id: 'description',
              label: 'Deskripsi',
              value: vendor.description || '—',
              meta: '',
              tone: 'default',
            },
            {
              id: 'bank',
              label: 'Bank',
              value: vendor.bankName || '—',
              meta: vendor.bankAccountNumber || '',
              tone: 'default',
            },
            {
              id: 'warranty',
              label: 'Catatan garansi',
              value: vendor.warrantyContactNote || '—',
              meta: '',
              tone: 'default',
            },
          ]}
        />
      </KolamContentFrame>

      {vendor.brands.length ? (
        <View style={styles.brandChipRow}>
          {vendor.brands.map(brand => (
            <KolamButton
              key={brand.id}
              label={brand.name}
              muted
              onPress={() => onRouteChange?.(`/brands/${brand.id}`)}
              style={styles.brandChip}
            />
          ))}
        </View>
      ) : null}

      {vendor.photoUrls.length > 1 ? (
        <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
          <Text style={styles.sectionTitle}>Foto</Text>
          <View style={styles.photoGrid}>
            {vendor.photoUrls.map((uri, index) => (
              <KolamRemoteImage
                key={`${uri}-${index}`}
                accessibilityLabel={`Foto pemasok ${index + 1}`}
                resizeMode="cover"
                scope="vendor"
                sourceUri={uri}
                style={styles.photoThumb}
              />
            ))}
          </View>
        </KolamContentFrame>
      ) : null}
    </View>
  );
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryTile}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function getVendorSummary(vendors: KolamVendor[]) {
  return vendors.reduce(
    (acc, vendor) => {
      if (vendor.status === 'active') {
        acc.active += 1;
      } else if (vendor.status === 'blacklisted') {
        acc.blacklisted += 1;
      } else {
        acc.inactive += 1;
      }
      return acc;
    },
    { active: 0, inactive: 0, blacklisted: 0 },
  );
}

function filterVendors(
  vendors: KolamVendor[],
  search: string,
  status: SupplierStatusFilter,
) {
  const query = search.trim().toLowerCase();
  return vendors.filter(vendor => {
    if (status !== 'all' && vendor.status !== status) {
      return false;
    }
    if (!query) {
      return true;
    }
    return [
      vendor.name,
      vendor.phone,
      vendor.email,
      vendor.city,
      vendor.country,
      vendor.province,
    ]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });
}

function sortVendors(vendors: KolamVendor[], mode: SupplierSortMode) {
  const next = [...vendors];
  next.sort((left, right) => {
    switch (mode) {
      case 'name-desc':
        return right.name.localeCompare(left.name, 'id');
      case 'po-desc':
        return right.poCount - left.poCount;
      case 'newest':
        return (right.createdAt || '').localeCompare(left.createdAt || '');
      case 'name-asc':
      default:
        return left.name.localeCompare(right.name, 'id');
    }
  });
  return next;
}

const styles = StyleSheet.create({
  surface: {
    gap: 12,
    minHeight: 0,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  toolbarButton: {
    minHeight: 34,
  },
  errorBadge: {
    alignSelf: 'stretch',
  },
  stack: {
    gap: 12,
    minHeight: 0,
    flex: 1,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryTile: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 120,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  summaryLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
  },
  summaryValue: {
    color: V.colors.fg,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  paginationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyWrap: {
    padding: 16,
  },
  cell: {
    justifyContent: 'center',
    minWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  primaryCell: {
    flex: 1,
  },
  identity: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minWidth: 0,
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
  },
  thumb: {
    borderRadius: 6,
    height: 36,
    width: 36,
  },
  thumbFallback: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderRadius: 6,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  thumbFallbackText: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '700',
  },
  rowTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '700',
  },
  rowMeta: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  cellText: {
    color: V.colors.fg,
    fontSize: 13,
  },
  numText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  detailCard: {
    gap: 8,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '700',
  },
  heroImage: {
    borderRadius: 10,
    height: 120,
    width: 120,
  },
  heroFallback: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderRadius: 10,
    height: 120,
    justifyContent: 'center',
    width: 120,
  },
  heroFallbackText: {
    color: V.colors.fg,
    fontSize: 36,
    fontWeight: '700',
  },
  brandChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  brandChip: {
    minHeight: 32,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoThumb: {
    borderRadius: 8,
    height: 88,
    width: 120,
  },
});
