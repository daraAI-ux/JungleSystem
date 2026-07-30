import React from 'react';
import { FlatList, Image, Modal, StyleSheet, Text, View } from 'react-native';
import {
  KOLAM_PRODUCT_SERIAL_ROOT,
  getKolamProductSerialOpnameIntent,
  getKolamProductSerialOpnameLabel,
  getKolamProductSerialStatusIntent,
  getKolamProductSerialStatusLabel,
  getKolamProductSerialTypeIntent,
  getKolamProductSerialTypeLabel,
  hasKolamProductSerialPermission,
  type KolamProductSerial,
  type KolamProductSerialProductType,
  type KolamProductSerialStatus,
} from '../domain/kolam-product-serial';
import { getKolamTableColumns } from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  useKolamProductSerialController,
  type KolamProductSerialController,
  type KolamProductSerialOpnameSessionItem,
} from '../hooks/use-kolam-product-serial-controller';
import { KolamButton } from './kolam-button';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDataTableHeader } from './kolam-data-table-header';
import { KolamDataTableRowFrame } from './kolam-data-table-row-frame';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamModalBackdrop } from './kolam-modal-backdrop';
import { KolamOverflowMenuButton, KolamTableFooterControls } from './kolam-dropdown-select';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamTableFilterTrigger } from './kolam-table-filter-trigger';

const PRODUCT_TYPE_OPTIONS: KolamProductSerialProductType[] = [
  'freyer',
  'enclonura',
  'general',
];
const STATUS_OPTIONS: KolamProductSerialStatus[] = ['in-stock', 'sold', 'void'];

export function KolamProductSerialSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamProductSerialController(route);

  return (
    <View
      style={[
        styles.surface,
        controller.mode === 'list' ? styles.listSurface : null,
      ]}
    >
      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
          style={styles.statusBadge}
        />
      ) : null}
      {controller.statusMessage ? (
        <KolamStatusBadge
          intent="success"
          label={controller.statusMessage}
          numberOfLines={2}
          style={styles.statusBadge}
        />
      ) : null}
      {controller.mode === 'opname' ? (
        <KolamProductSerialOpname controller={controller} onRouteChange={onRouteChange} />
      ) : (
        <KolamProductSerialList controller={controller} onRouteChange={onRouteChange} />
      )}
    </View>
  );
}

function KolamProductSerialList({
  controller,
  onRouteChange,
}: {
  controller: KolamProductSerialController;
  onRouteChange?: (route: string) => void;
}) {
  const { authUser } = useKolamAuthContext();
  const canOpname = hasKolamProductSerialPermission(
    authUser?.permissions,
    'opname',
    authUser?.roleKey,
  );
  const [searchInput, setSearchInput] = React.useState(controller.filters.search);
  const [activeFilterPanel, setActiveFilterPanel] = React.useState<
    'type' | 'status' | null
  >(null);
  const [qrSerial, setQrSerial] = React.useState<KolamProductSerial | null>(null);

  React.useEffect(() => {
    setSearchInput(controller.filters.search);
  }, [controller.filters.search]);

  React.useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput !== controller.filters.search) {
        controller.onSearchChange(searchInput);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [controller, searchInput]);

  const pageCount = Math.max(1, controller.pagination.totalPages);
  const safePage = Math.min(Math.max(controller.pagination.page, 1), pageCount);
  const typeFilterLabel = controller.filters.productType
    ? getKolamProductSerialTypeLabel(controller.filters.productType)
    : 'Tipe';
  const statusFilterLabel = controller.filters.status
    ? getKolamProductSerialStatusLabel(controller.filters.status)
    : 'Status';
  const hasActiveFilters = Boolean(
    controller.filters.search ||
      controller.filters.productType ||
      controller.filters.status ||
      controller.filters.productId,
  );
  const filteredProductName = controller.filters.productId
    ? controller.serials[0]?.product?.name
    : '';

  const renderRow = React.useCallback(
    ({ item }: { item: KolamProductSerial }) => (
      <KolamProductSerialRow
        onRouteChange={onRouteChange}
        onViewQr={() => setQrSerial(item)}
        serial={item}
      />
    ),
    [onRouteChange],
  );

  return (
    <View style={styles.listRoot}>
      {controller.filters.productId ? (
        <View style={styles.productFilterBanner}>
          <Text style={styles.productFilterTitle}>Lisensi / Stok per Unit</Text>
          <Text style={styles.helperText}>
            {filteredProductName
              ? `Lisensi untuk produk: ${filteredProductName}. Total: ${controller.pagination.total} unit.`
              : `Lisensi untuk produk ini. Total: ${controller.pagination.total} unit.`}
          </Text>
          <KolamButton
            label="Lihat semua"
            onPress={() => controller.onClearProductFilter()}
            size="sm"
          />
        </View>
      ) : null}

      <View style={styles.toolbarWrap}>
        <View style={styles.toolbarShell}>
          <View style={styles.filterRow}>
            <KolamFormTextField
              onChangeText={setSearchInput}
              placeholder="Cari nomor seri"
              style={styles.searchInput}
              value={searchInput}
            />
            <KolamTableFilterTrigger
              active={
                activeFilterPanel === 'type' || Boolean(controller.filters.productType)
              }
              label={typeFilterLabel}
              onPress={() =>
                setActiveFilterPanel(current => (current === 'type' ? null : 'type'))
              }
              style={styles.filterTrigger}
            />
            <KolamTableFilterTrigger
              active={
                activeFilterPanel === 'status' || Boolean(controller.filters.status)
              }
              label={statusFilterLabel}
              onPress={() =>
                setActiveFilterPanel(current =>
                  current === 'status' ? null : 'status',
                )
              }
              style={styles.filterTrigger}
            />
          </View>
          <View style={styles.actionRow}>
            {hasActiveFilters ? (
              <KolamButton
                label="Bersihkan"
                muted
                onPress={() => {
                  setActiveFilterPanel(null);
                  controller.onClearFilters();
                }}
                style={styles.toolbarButton}
              />
            ) : null}
            <KolamButton
              disabled={controller.loading}
              label="Muat ulang"
              onPress={() => void controller.onRefresh()}
              style={styles.toolbarButton}
            />
            {canOpname ? (
              <KolamButton
                intent="primary"
                label="Opname Serial"
                onPress={() => onRouteChange?.(`${KOLAM_PRODUCT_SERIAL_ROOT}/opname`)}
                style={styles.toolbarButton}
              />
            ) : null}
          </View>
        </View>
        {activeFilterPanel === 'type' ? (
          <View style={styles.filterPanel}>
            {PRODUCT_TYPE_OPTIONS.map(type => (
              <KolamButton
                key={type}
                intent={controller.filters.productType === type ? 'primary' : 'plain'}
                label={getKolamProductSerialTypeLabel(type)}
                onPress={() =>
                  controller.onChangeFilters({
                    productType: controller.filters.productType === type ? '' : type,
                  })
                }
              />
            ))}
          </View>
        ) : null}
        {activeFilterPanel === 'status' ? (
          <View style={styles.filterPanel}>
            {STATUS_OPTIONS.map(status => (
              <KolamButton
                key={status}
                intent={controller.filters.status === status ? 'primary' : 'plain'}
                label={getKolamProductSerialStatusLabel(status)}
                onPress={() =>
                  controller.onChangeFilters({
                    status: controller.filters.status === status ? '' : status,
                  })
                }
              />
            ))}
          </View>
        ) : null}
      </View>

      <KolamCatalogListTableShell
        footer={
          <KolamTableFooterControls
            onPageSizeChange={controller.onLimitChange}
            page={safePage}
            pageSize={controller.pagination.limit}
            total={controller.pagination.total}
          >
            {pageCount > 1 ? (
              <View style={styles.paginationRow}>
                <KolamButton
                  disabled={safePage <= 1}
                  label="Sebelumnya"
                  onPress={() => controller.onPageChange(Math.max(1, safePage - 1))}
                />
                <KolamCopyStack
                  items={[{ id: 'page', text: `${safePage} / ${pageCount}`, style: styles.pageLabel }]}
                />
                <KolamButton
                  disabled={safePage >= pageCount}
                  label="Berikutnya"
                  onPress={() => controller.onPageChange(Math.min(pageCount, safePage + 1))}
                />
              </View>
            ) : null}
          </KolamTableFooterControls>
        }
        style={styles.tableFrame}
      >
        <FlatList
          contentContainerStyle={styles.listContent}
          data={controller.serials}
          keyExtractor={item => item.id || item.serialNumber}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <KolamEmptyState
                compact
                message={
                  hasActiveFilters
                    ? 'Coba ubah pencarian atau filter.'
                    : 'Nomor seri dibuat otomatis saat produksi selesai.'
                }
                title={controller.loading ? 'Memuat nomor seri…' : 'Belum ada nomor seri'}
              />
            </View>
          }
          ListHeaderComponent={<KolamDataTableHeader columns={getKolamTableColumns('product-serial')} />}
          removeClippedSubviews={false}
          renderItem={renderRow}
          style={styles.listFlatList}
        />
      </KolamCatalogListTableShell>

      <KolamProductSerialQrModal serial={qrSerial} onClose={() => setQrSerial(null)} />
    </View>
  );
}

function KolamProductSerialRow({
  serial,
  onRouteChange,
  onViewQr,
}: {
  serial: KolamProductSerial;
  onRouteChange?: (route: string) => void;
  onViewQr: () => void;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);
  const columns = getKolamTableColumns('product-serial');
  const widthOf = React.useCallback(
    (id: (typeof columns)[number]['id']) =>
      columns.find(column => column.id === id)?.width,
    [columns],
  );

  const actions = [
    ...(serial.qrCode ? [{ label: 'Lihat QR', onPress: onViewQr }] : []),
    ...(serial.production?.id
      ? [
          {
            label: 'Lihat Produksi',
            onPress: () => onRouteChange?.(`/production/${serial.production?.id}`),
          },
        ]
      : []),
  ];

  return (
    <KolamDataTableRowFrame style={actionMenuOpen ? styles.activeActionRow : undefined}>
      <View style={[styles.listCell, styles.primaryCell]}>
        <Text numberOfLines={1} style={styles.rowTitleMono}>
          {serial.serialNumber}
        </Text>
      </View>

      <View style={[styles.listCell, { width: widthOf('meta') }]}>
        <Text numberOfLines={1} style={styles.cellText}>
          {serial.product?.name || '—'}
        </Text>
        {serial.product?.sku ? (
          <Text numberOfLines={1} style={styles.rowMetaMono}>
            {serial.product.sku}
          </Text>
        ) : null}
      </View>

      <View style={[styles.listCell, { width: widthOf('notes') }]}>
        <KolamStatusBadge
          intent={getKolamProductSerialTypeIntent(serial.productType)}
          label={getKolamProductSerialTypeLabel(serial.productType)}
        />
      </View>

      <View style={[styles.listCell, { width: widthOf('children') }]}>
        <Text numberOfLines={1} style={styles.rowMetaMono}>
          {serial.production?.batchId || '—'}
        </Text>
      </View>

      <View style={[styles.listCell, { width: widthOf('marketplace') }]}>
        <Text numberOfLines={1} style={styles.cellText}>
          {formatProductSerialDate(serial.productionDate)}
        </Text>
      </View>

      <View style={[styles.listCell, styles.statusCell, { width: widthOf('status') }]}>
        <KolamStatusBadge
          intent={getKolamProductSerialStatusIntent(serial.status)}
          label={getKolamProductSerialStatusLabel(serial.status)}
        />
      </View>

      <View style={[styles.listCell, styles.statusCell, { width: widthOf('products') }]}>
        {serial.opnameStatus ? (
          <KolamStatusBadge
            intent={getKolamProductSerialOpnameIntent(serial.opnameStatus)}
            label={getKolamProductSerialOpnameLabel(serial.opnameStatus)}
          />
        ) : (
          <Text style={styles.rowMeta}>—</Text>
        )}
      </View>

      <View style={[styles.overflowCell, { width: widthOf('actions') ?? 48 }]}>
        {actions.length ? (
          <KolamOverflowMenuButton
            accessibilityLabel={`Menu ${serial.serialNumber}`}
            actions={actions}
            onOpenChange={open => setActionMenuOpen(open)}
          />
        ) : null}
      </View>
    </KolamDataTableRowFrame>
  );
}

function KolamProductSerialQrModal({
  serial,
  onClose,
}: {
  serial: KolamProductSerial | null;
  onClose: () => void;
}) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={Boolean(serial)}>
      <View style={styles.qrOverlay}>
        <KolamModalBackdrop onPress={onClose} />
        <View style={styles.qrDialog}>
          <Text style={styles.sectionTitle}>{serial?.serialNumber}</Text>
          {serial?.qrCode ? (
            <Image source={{ uri: serial.qrCode }} style={styles.qrImage} />
          ) : null}
          <KolamButton label="Tutup" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

function KolamProductSerialOpname({
  controller,
  onRouteChange,
}: {
  controller: KolamProductSerialController;
  onRouteChange?: (route: string) => void;
}) {
  const foundCount = controller.sessionItems.filter(item => item.found).length;
  const missingCount = controller.sessionItems.filter(item => !item.found).length;

  return (
    <View style={styles.opnameRoot}>
      <View style={styles.toolbarWrap}>
        <View style={styles.toolbarShell}>
          <KolamButton
            label="Daftar"
            muted
            onPress={() => onRouteChange?.(KOLAM_PRODUCT_SERIAL_ROOT)}
            style={styles.toolbarButton}
          />
          <View style={styles.opnameStatsRow}>
            <KolamStatusBadge intent="success" label={`Ditemukan: ${foundCount}`} />
            <KolamStatusBadge intent="danger" label={`Hilang: ${missingCount}`} />
            <KolamStatusBadge intent="muted" label={`Total pindai: ${controller.sessionItems.length}`} />
          </View>
          <KolamButton
            disabled={!controller.sessionItems.length}
            label="Reset sesi"
            onPress={() => controller.onResetSession()}
            style={styles.toolbarButton}
          />
        </View>
      </View>

      <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
        <Text style={styles.sectionTitle}>Pindai / Input Nomor Seri</Text>
        <Text style={styles.helperText}>
          Pindai atau ketik nomor seri untuk memverifikasi keberadaan fisik unit. Tekan Enter
          setelah setiap nomor seri.
        </Text>
        <View style={styles.opnameInputRow}>
          <KolamFormTextField
            autoCapitalize="characters"
            onChangeText={controller.onOpnameInputChange}
            onSubmitEditing={() => void controller.onSubmitOpname()}
            placeholder="FRY-20240215-0001 — tekan Enter"
            style={styles.opnameInput}
            value={controller.opnameInput}
          />
          <KolamButton
            disabled={controller.opnameSubmitting || !controller.opnameInput.trim()}
            intent="primary"
            label={controller.opnameSubmitting ? 'Memproses…' : 'Verifikasi'}
            onPress={() => void controller.onSubmitOpname()}
          />
        </View>
      </KolamContentFrame>

      {controller.sessionItems.length ? (
        <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
          <Text style={styles.sectionTitle}>Hasil Pindai Sesi Ini</Text>
          {controller.sessionItems.map(item => (
            <KolamProductSerialOpnameRow item={item} key={item.key} />
          ))}
        </KolamContentFrame>
      ) : (
        <KolamEmptyState
          message="Mulai memindai dengan memasukkan nomor seri di atas."
          title="Belum ada nomor seri yang dipindai"
        />
      )}
    </View>
  );
}

function KolamProductSerialOpnameRow({
  item,
}: {
  item: KolamProductSerialOpnameSessionItem;
}) {
  return (
    <View style={styles.opnameRow}>
      <View style={styles.opnameRowHeader}>
        <Text style={styles.rowTitleMono}>{item.serialNumber}</Text>
        <KolamStatusBadge
          intent={item.found ? 'success' : 'danger'}
          label={item.found ? 'Ditemukan' : 'Hilang'}
        />
      </View>
      {item.data ? (
        <Text style={styles.helperText}>
          {item.data.productName || '—'} ({item.data.productSku || '—'}) · Batch{' '}
          {item.data.batchId || '—'}
        </Text>
      ) : null}
      <Text style={styles.rowMeta}>{item.message}</Text>
      <Text style={styles.rowMeta}>{formatProductSerialDateTime(item.scannedAt)}</Text>
    </View>
  );
}

function formatProductSerialDate(value?: string) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatProductSerialDateTime(value?: string) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('id-ID');
}

const styles = StyleSheet.create({
  surface: { gap: 12 },
  listSurface: { flex: 1, minHeight: 0, overflow: 'visible' },
  statusBadge: { alignSelf: 'stretch' },
  listRoot: { flex: 1, gap: 12, minHeight: 0, overflow: 'visible' },
  productFilterBanner: {
    backgroundColor: V.colors.primarySoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    padding: 10,
  },
  productFilterTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
  },
  toolbarWrap: {
    elevation: 1000,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
  },
  toolbarShell: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'space-between',
    overflow: 'visible',
    padding: 4,
  },
  filterRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    minWidth: 280,
    overflow: 'visible',
  },
  searchInput: {
    flexBasis: 140,
    flexGrow: 1,
    maxWidth: 220,
    minWidth: 120,
  },
  filterTrigger: {
    flexBasis: 'auto',
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 108,
  },
  actionRow: {
    alignItems: 'center',
    borderLeftColor: V.colors.border,
    borderLeftWidth: 1,
    flexDirection: 'row',
    flexShrink: 0,
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-end',
    paddingLeft: 8,
  },
  toolbarButton: {
    flexShrink: 0,
    minHeight: 34,
    paddingHorizontal: 10,
  },
  filterPanel: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  tableFrame: { flex: 1, minHeight: 0, overflow: 'visible' },
  listFlatList: { flexGrow: 1, minHeight: 0, overflow: 'visible' },
  listContent: { flexGrow: 1, overflow: 'visible' },
  emptyWrap: { paddingVertical: 24 },
  paginationRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  pageLabel: { color: V.colors.mutedFg, fontSize: 13 },
  listCell: {
    justifyContent: 'center',
    minWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
  primaryCell: {
    flex: 1,
    minWidth: 0,
  },
  statusCell: {
    alignItems: 'flex-start',
    gap: 4,
  },
  overflowCell: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    overflow: 'visible',
    paddingHorizontal: 0,
    width: 48,
    zIndex: 9000,
  },
  activeActionRow: {
    elevation: 96,
    overflow: 'visible',
    zIndex: 9000,
  },
  rowTitleMono: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  rowMeta: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  rowMetaMono: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  cellText: {
    color: V.colors.fg,
    fontSize: 13,
  },
  helperText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 18,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '800',
  },
  detailCard: { gap: 12, marginBottom: 12 },
  qrOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrDialog: {
    width: 320,
    maxWidth: '86%',
    gap: 14,
    padding: 18,
    alignItems: 'center',
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    shadowColor: V.colors.fg,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  qrImage: {
    width: 220,
    height: 220,
  },
  opnameRoot: { flex: 1, gap: 12, minHeight: 0 },
  opnameStatsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  opnameInputRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  opnameInput: {
    flexGrow: 1,
    minWidth: 240,
  },
  opnameRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
    marginBottom: 8,
    paddingBottom: 8,
  },
  opnameRowHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
});
