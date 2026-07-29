import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { getKolamFormSection } from '../domain/kolam-form';
import { getKolamTableColumns } from '../domain/kolam-table';
import {
  flattenKolamSupplierProductRows,
  flattenKolamSupplierSpeciesRows,
  formatKolamVendorAddress,
  getKolamVendorStatusIntent,
  getKolamVendorStatusLabel,
  KOLAM_SUPPLIER_ROOT,
  type KolamSupplierCatalogTab,
  type KolamVendor,
  type KolamVendorStatus,
} from '../domain/kolam-vendor';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { formatRupiah } from '../lib/money';
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
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import { KolamDescriptionList } from './kolam-description-list';
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
import { KolamSwitch } from './kolam-switch';
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
        {controller.mode === 'list' ? (
          <KolamButton
            intent="primary"
            label="Buat Baru"
            onPress={() => {
              controller.onCreateNew();
              onRouteChange?.(`${KOLAM_SUPPLIER_ROOT}/create`);
            }}
            style={styles.toolbarButton}
          />
        ) : (
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
      ) : (
        <KolamSupplierDetail
          controller={controller}
          onRouteChange={onRouteChange}
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
  const [deleteCandidate, setDeleteCandidate] =
    React.useState<KolamVendor | null>(null);

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
              onDelete={() => setDeleteCandidate(vendor)}
              onEdit={() => {
                onRouteChange?.(
                  `${KOLAM_SUPPLIER_ROOT}/${vendor.id}/edit`,
                );
              }}
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
      <KolamDeleteConfirmDialog
        itemLabel={deleteCandidate?.name}
        itemType="pemasok"
        visible={Boolean(deleteCandidate)}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => {
          const vendor = deleteCandidate;
          setDeleteCandidate(null);
          if (!vendor) {
            return;
          }
          void controller.onDeleteVendor(vendor).then(deleted => {
            if (deleted) {
              onRouteChange?.(KOLAM_SUPPLIER_ROOT);
            }
          });
        }}
      />
    </View>
  );
}

function KolamSupplierRow({
  onDelete,
  onEdit,
  onSelect,
  vendor,
}: {
  onDelete: () => void;
  onEdit: () => void;
  onSelect: () => void;
  vendor: KolamVendor;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);
  const thumb = vendor.photoUrls[0] || vendor.photos[0] || '';

  return (
    <KolamDataTableRowFrame style={actionMenuOpen ? styles.activeActionRow : undefined}>
      <Pressable onPress={onSelect} style={[styles.cell, styles.primaryCell]}>
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
                text:
                  [vendor.city, vendor.country].filter(Boolean).join(' · ') ||
                  '—',
                style: styles.rowMeta,
              },
            ]}
          />
        </View>
      </Pressable>
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
      <View style={styles.overflowCell}>
        <KolamOverflowMenuButton
          accessibilityLabel={`Menu ${vendor.name}`}
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

function KolamSupplierDetail({
  controller,
  onRouteChange,
}: {
  controller: KolamSupplierController;
  onRouteChange?: (route: string) => void;
}) {
  const vendor = controller.selectedVendor;
  const editable = controller.isEditable;
  const [deleteCandidate, setDeleteCandidate] =
    React.useState<KolamVendor | null>(null);

  if (editable) {
    return (
      <KolamSupplierForm
        controller={controller}
        onRouteChange={onRouteChange}
      />
    );
  }

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
      <View style={styles.detailActions}>
        <KolamButton
          intent="primary"
          label="Edit"
          onPress={() => {
            controller.onEdit();
            onRouteChange?.(
              `${KOLAM_SUPPLIER_ROOT}/${vendor.id}/edit`,
            );
          }}
        />
        <KolamButton
          intent="danger"
          label="Hapus"
          onPress={() => setDeleteCandidate(vendor)}
        />
      </View>
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

      <KolamSupplierCatalogTabs
        onRouteChange={onRouteChange}
        vendor={vendor}
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

      <KolamDeleteConfirmDialog
        itemLabel={deleteCandidate?.name}
        itemType="pemasok"
        visible={Boolean(deleteCandidate)}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => {
          const target = deleteCandidate;
          setDeleteCandidate(null);
          if (!target) {
            return;
          }
          void controller.onDeleteVendor(target).then(deleted => {
            if (deleted) {
              onRouteChange?.(KOLAM_SUPPLIER_ROOT);
            }
          });
        }}
      />
    </View>
  );
}

function KolamSupplierCatalogTabs({
  onRouteChange,
  vendor,
}: {
  onRouteChange?: (route: string) => void;
  vendor: KolamVendor;
}) {
  const [tab, setTab] = React.useState<KolamSupplierCatalogTab>('products');
  const productRows = React.useMemo(
    () => flattenKolamSupplierProductRows(vendor.products, vendor.id),
    [vendor.id, vendor.products],
  );
  const speciesRows = React.useMemo(
    () => flattenKolamSupplierSpeciesRows(vendor.species, vendor.id),
    [vendor.id, vendor.species],
  );

  return (
    <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
      <Text style={styles.sectionTitle}>Katalog pemasok</Text>
      <View style={styles.segmentRow}>
        {(
          [
            { id: 'products', label: 'Produk & Raw' },
            { id: 'species', label: 'Species' },
            { id: 'packings', label: 'Bahan Kemasan' },
          ] as const
        ).map(item => (
          <KolamButton
            intent={tab === item.id ? 'primary' : 'outline'}
            key={item.id}
            label={item.label}
            onPress={() => setTab(item.id)}
          />
        ))}
      </View>

      {tab === 'products' ? (
        productRows.length ? (
          <View style={styles.catalogList}>
            {productRows.map(row => (
              <Pressable
                key={row.key}
                onPress={() =>
                  row.isVariantRow
                    ? undefined
                    : onRouteChange?.(`/products/${row.productId}`)
                }
                style={[
                  styles.catalogRow,
                  row.isVariantRow ? styles.catalogRowVariant : null,
                ]}
              >
                {!row.isVariantRow && row.photoUrl ? (
                  <KolamRemoteImage
                    accessibilityLabel={row.title}
                    resizeMode="cover"
                    scope="product"
                    sourceUri={row.photoUrl}
                    style={styles.catalogThumb}
                  />
                ) : !row.isVariantRow ? (
                  <View style={styles.catalogThumbFallback}>
                    <Text style={styles.thumbFallbackText}>
                      {row.title.slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.catalogVariantMark}>↳</Text>
                )}
                <View style={styles.catalogCopy}>
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.catalogTitle,
                      row.isVariantRow ? styles.catalogVariantTitle : null,
                    ]}
                  >
                    {row.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.rowMeta}>
                    {[row.code || null, row.brandLabel || null]
                      .filter(Boolean)
                      .join(' · ') || '—'}
                  </Text>
                </View>
                <Text style={styles.catalogPrice}>
                  {row.vendorPrice != null
                    ? formatRupiah(row.vendorPrice)
                    : '—'}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <KolamEmptyState
            compact
            message="Belum ada produk atau bahan baku tertaut ke pemasok ini."
            title="Tidak ada produk"
          />
        )
      ) : null}

      {tab === 'species' ? (
        speciesRows.length ? (
          <View style={styles.catalogList}>
            {speciesRows.map(row => (
              <Pressable
                key={row.key}
                onPress={() =>
                  row.isVariantRow
                    ? undefined
                    : onRouteChange?.(`/species/${row.speciesId}`)
                }
                style={[
                  styles.catalogRow,
                  row.isVariantRow ? styles.catalogRowVariant : null,
                ]}
              >
                {!row.isVariantRow && row.photoUrl ? (
                  <KolamRemoteImage
                    accessibilityLabel={row.title}
                    resizeMode="cover"
                    scope="species"
                    sourceUri={row.photoUrl}
                    style={styles.catalogThumb}
                  />
                ) : !row.isVariantRow ? (
                  <View style={styles.catalogThumbFallback}>
                    <Text style={styles.thumbFallbackText}>
                      {row.title.slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.catalogVariantMark}>↳</Text>
                )}
                <View style={styles.catalogCopy}>
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.catalogTitle,
                      row.isVariantRow ? styles.catalogVariantTitle : null,
                      !row.isVariantRow ? styles.catalogItalic : null,
                    ]}
                  >
                    {row.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.rowMeta}>
                    {[row.code || null, row.commonName || null]
                      .filter(Boolean)
                      .join(' · ') || '—'}
                  </Text>
                </View>
                <Text style={styles.catalogPrice}>
                  {row.vendorPrice != null
                    ? formatRupiah(row.vendorPrice)
                    : '—'}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <KolamEmptyState
            compact
            message="Belum ada species tertaut ke pemasok ini."
            title="Tidak ada species"
          />
        )
      ) : null}

      {tab === 'packings' ? (
        vendor.packings.length ? (
          <View style={styles.catalogList}>
            {vendor.packings.map(packing => (
              <Pressable
                key={packing.id}
                onPress={() =>
                  onRouteChange?.(`/packing-materials/${packing.id}`)
                }
                style={styles.catalogRow}
              >
                <View style={styles.catalogCopy}>
                  <Text numberOfLines={2} style={styles.catalogTitle}>
                    {packing.name}
                  </Text>
                  <Text numberOfLines={1} style={styles.rowMeta}>
                    {[
                      packing.category || null,
                      `Stok ${packing.stock}`,
                      packing.cost > 0
                        ? `HPP ${formatRupiah(packing.cost)}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>
                <Text style={styles.catalogPrice}>
                  {formatRupiah(packing.price)}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <KolamEmptyState
            compact
            message="Belum ada bahan kemasan dari pemasok ini."
            title="Tidak ada kemasan"
          />
        )
      ) : null}
    </KolamContentFrame>
  );
}

function KolamSupplierForm({
  controller,
  onRouteChange,
}: {
  controller: KolamSupplierController;
  onRouteChange?: (route: string) => void;
}) {
  const form = controller.form;
  const selectedBrands = controller.brands.filter(brand =>
    form.brandIds.includes(brand.id),
  );
  const brandOptions = controller.brands.filter(
    brand => !form.brandIds.includes(brand.id),
  );

  return (
    <KolamNativeFormSection section={getKolamFormSection('supplier-detail')}>
      <View style={settingsWebFormStyles.settingsWebFormFields}>
        <View style={settingsWebFormStyles.settingsWebFormFieldsGrid}>
          <FieldShell label="Nama pemasok" required>
            <KolamFormTextField
              editable={!controller.saving}
              onChangeText={name => controller.onChangeForm({ name })}
              placeholder="Nama perusahaan / pemasok"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={form.name}
            />
          </FieldShell>

          <View style={styles.formSplitRow}>
            <View style={styles.formSplitCell}>
              <FieldShell label="Telepon">
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={phone => controller.onChangeForm({ phone })}
                  placeholder="Nomor telepon"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.phone}
                />
              </FieldShell>
            </View>
            <View style={styles.formSplitCell}>
              <FieldShell label="Email">
                <KolamFormTextField
                  editable={!controller.saving}
                  mode="email"
                  onChangeText={email => controller.onChangeForm({ email })}
                  placeholder="email@contoh.com"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.email}
                />
              </FieldShell>
            </View>
          </View>

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

          <FieldShell label="Alamat">
            <KolamFormTextField
              editable={!controller.saving}
              multiline
              onChangeText={address => controller.onChangeForm({ address })}
              placeholder="Alamat lengkap"
              style={[
                settingsWebFormStyles.settingsWebFormFieldValue,
                settingsWebFormStyles.settingsWebFormFieldValueTextarea,
              ]}
              value={form.address}
            />
          </FieldShell>

          <View style={styles.formSplitRow}>
            <View style={styles.formSplitCell}>
              <FieldShell label="Kota">
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={city => controller.onChangeForm({ city })}
                  placeholder="Kota"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.city}
                />
              </FieldShell>
            </View>
            <View style={styles.formSplitCell}>
              <FieldShell label="Provinsi">
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={province =>
                    controller.onChangeForm({ province })
                  }
                  placeholder="Provinsi"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.province}
                />
              </FieldShell>
            </View>
          </View>

          <View style={styles.formSplitRow}>
            <View style={styles.formSplitCell}>
              <FieldShell label="Negara bagian / state">
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={state => controller.onChangeForm({ state })}
                  placeholder="State"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.state}
                />
              </FieldShell>
            </View>
            <View style={styles.formSplitCell}>
              <FieldShell label="Kode pos">
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={postalCode =>
                    controller.onChangeForm({ postalCode })
                  }
                  placeholder="Kode pos"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.postalCode}
                />
              </FieldShell>
            </View>
          </View>

          <FieldShell label="Negara">
            <KolamFormTextField
              editable={!controller.saving}
              onChangeText={country => controller.onChangeForm({ country })}
              placeholder="Indonesia"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={form.country}
            />
          </FieldShell>

          <View style={styles.formSplitRow}>
            <View style={styles.formSplitCell}>
              <FieldShell label="Bank">
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={bankName =>
                    controller.onChangeForm({ bankName })
                  }
                  placeholder="Nama bank"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.bankName}
                />
              </FieldShell>
            </View>
            <View style={styles.formSplitCell}>
              <FieldShell label="Nomor rekening">
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={bankAccountNumber =>
                    controller.onChangeForm({ bankAccountNumber })
                  }
                  placeholder="Nomor rekening"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.bankAccountNumber}
                />
              </FieldShell>
            </View>
          </View>

          <FieldShell label="Status" required>
            <View style={styles.segmentRow}>
              {(
                ['active', 'inactive', 'blacklisted'] as KolamVendorStatus[]
              ).map(status => (
                <KolamButton
                  intent={form.status === status ? 'primary' : 'outline'}
                  key={status}
                  label={getKolamVendorStatusLabel(status)}
                  onPress={() => controller.onChangeForm({ status })}
                />
              ))}
            </View>
          </FieldShell>

          <FieldShell label="Distributor resmi">
            <View style={styles.switchRow}>
              <Text style={styles.switchHint}>
                Tandai jika pemasok adalah distributor resmi merek.
              </Text>
              <KolamSwitch
                active={form.isOfficialDistributor}
                disabled={controller.saving}
                onPress={() =>
                  controller.onChangeForm({
                    isOfficialDistributor: !form.isOfficialDistributor,
                  })
                }
              />
            </View>
          </FieldShell>

          {form.isOfficialDistributor ? (
            <FieldShell label="Catatan kontak garansi">
              <KolamFormTextField
                editable={!controller.saving}
                multiline
                onChangeText={warrantyContactNote =>
                  controller.onChangeForm({ warrantyContactNote })
                }
                placeholder="Kontak / catatan garansi"
                style={[
                  settingsWebFormStyles.settingsWebFormFieldValue,
                  settingsWebFormStyles.settingsWebFormFieldValueTextarea,
                ]}
                value={form.warrantyContactNote}
              />
            </FieldShell>
          ) : null}

          <FieldShell label="Merek">
            <View style={styles.brandPicker}>
              {selectedBrands.length ? (
                <View style={styles.brandChipRow}>
                  {selectedBrands.map(brand => (
                    <KolamButton
                      key={brand.id}
                      label={`× ${brand.name}`}
                      muted
                      onPress={() =>
                        controller.onChangeForm({
                          brandIds: form.brandIds.filter(id => id !== brand.id),
                        })
                      }
                      style={styles.brandChip}
                    />
                  ))}
                </View>
              ) : (
                <Text style={styles.switchHint}>Belum ada merek dipilih.</Text>
              )}
              <KolamDropdownSelect
                label="Tambah merek"
                onChange={brandId => {
                  if (!brandId || form.brandIds.includes(brandId)) {
                    return;
                  }
                  controller.onChangeForm({
                    brandIds: [...form.brandIds, brandId],
                  });
                }}
                options={[
                  { label: 'Pilih merek…', value: '' },
                  ...brandOptions.map(brand => ({
                    label: brand.name,
                    value: brand.id,
                  })),
                ]}
                searchable
                searchPlaceholder="Cari merek…"
                showLabelInTrigger={false}
                value=""
              />
            </View>
          </FieldShell>

          <FieldShell label="Tautan">
            <KolamFormTextField
              editable={!controller.saving}
              multiline
              onChangeText={linkText => controller.onChangeForm({ linkText })}
              placeholder="Satu tautan per baris"
              style={[
                settingsWebFormStyles.settingsWebFormFieldValue,
                settingsWebFormStyles.settingsWebFormFieldValueTextarea,
              ]}
              value={form.linkText}
            />
          </FieldShell>

          <FieldShell label="Foto">
            <View style={styles.photoEditor}>
              <Text style={styles.switchHint}>
                Pilih hingga 5 foto baru. Foto tersimpan dihapus langsung; foto baru diunggah saat Simpan.
              </Text>
              <KolamButton
                disabled={
                  controller.saving || controller.pendingPhotoUris.length >= 5
                }
                label="Tambah foto"
                onPress={() => {
                  void controller.onPickPhoto();
                }}
              />
              {controller.pendingPhotoUris.length ? (
                <View style={styles.photoGrid}>
                  {controller.pendingPhotoUris.map((uri, index) => (
                    <View key={`pending-${uri}-${index}`} style={styles.photoItem}>
                      <Image
                        accessibilityLabel={`Foto baru ${index + 1}`}
                        resizeMode="cover"
                        source={{ uri: toLocalImageUri(uri) }}
                        style={styles.photoThumb}
                      />
                      <KolamButton
                        disabled={controller.saving}
                        intent="danger"
                        label="Buang"
                        onPress={() => controller.onRemovePendingPhoto(index)}
                        style={styles.photoRemove}
                      />
                    </View>
                  ))}
                </View>
              ) : null}
              {controller.selectedVendor?.photoUrls.length ? (
                <View style={styles.photoGrid}>
                  {controller.selectedVendor.photoUrls.map((uri, index) => (
                    <View key={`existing-${uri}-${index}`} style={styles.photoItem}>
                      <KolamRemoteImage
                        accessibilityLabel={`Foto tersimpan ${index + 1}`}
                        resizeMode="cover"
                        scope="vendor"
                        sourceUri={uri}
                        style={styles.photoThumb}
                      />
                      <KolamButton
                        disabled={controller.saving}
                        intent="danger"
                        label="Hapus"
                        onPress={() => {
                          void controller.onDeleteExistingPhoto(index);
                        }}
                        style={styles.photoRemove}
                      />
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.switchHint}>
                  Belum ada foto tersimpan untuk pemasok ini.
                </Text>
              )}
            </View>
          </FieldShell>
        </View>

        <View style={styles.formActions}>
          <KolamButton
            disabled={controller.saving}
            label="Batal"
            onPress={() => {
              controller.onBackToList();
              onRouteChange?.(KOLAM_SUPPLIER_ROOT);
            }}
          />
          <KolamButton
            disabled={controller.saving}
            intent="primary"
            label={controller.saving ? 'Menyimpan…' : 'Simpan'}
            onPress={() => {
              void controller.onSave().then(id => {
                if (id) {
                  onRouteChange?.(`${KOLAM_SUPPLIER_ROOT}/${id}`);
                }
              });
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

function toLocalImageUri(uri: string) {
  if (uri.startsWith('file://') || uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri;
  }
  return `file:///${uri.replace(/\\/g, '/')}`;
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
  overflowCell: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 8,
    width: 64,
  },
  activeActionRow: {
    zIndex: 20,
  },
  detailActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  brandPicker: {
    gap: 8,
  },
  catalogList: {
    gap: 6,
  },
  catalogRow: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  catalogRowVariant: {
    backgroundColor: V.colors.muted,
    marginLeft: 18,
  },
  catalogThumb: {
    borderRadius: 6,
    height: 36,
    width: 36,
  },
  catalogThumbFallback: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderRadius: 6,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  catalogVariantMark: {
    color: V.colors.mutedFg,
    fontSize: 14,
    textAlign: 'center',
    width: 36,
  },
  catalogCopy: {
    flex: 1,
    minWidth: 0,
  },
  catalogTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
  },
  catalogVariantTitle: {
    fontWeight: '500',
  },
  catalogItalic: {
    fontStyle: 'italic',
  },
  catalogPrice: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '600',
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
  photoEditor: {
    gap: 8,
  },
  photoItem: {
    gap: 6,
    width: 120,
  },
  photoRemove: {
    minHeight: 30,
  },
  formSplitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formSplitCell: {
    flexGrow: 1,
    minWidth: 220,
  },
  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  switchHint: {
    color: V.colors.mutedFg,
    flex: 1,
    fontSize: 13,
  },
  formActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
});
