import React from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  useKolamProductSerialController,
  type KolamProductSerialController,
  type KolamProductSerialOpnameSessionItem,
} from '../hooks/use-kolam-product-serial-controller';
import { KolamButton } from './kolam-button';
import {KolamDaftarButton} from './kolam-daftar-button';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import { KolamModalBackdrop } from './kolam-modal-backdrop';
import { KolamSearchField } from './kolam-search-field';
import { KolamTableRowActionMenu } from './kolam-dropdown-select';
import { KolamStatusBadge } from './kolam-status-badge';
import {
  measureFilterPanelAnchor,
  type KolamFilterPanelAnchor,
} from './kolam-filter-panel-anchor';
import { KolamTableFilterTrigger } from './kolam-table-filter-trigger';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

type ProductSerialFilterPanel = 'type' | 'status';

const FILTER_PANEL_WIDTH = 240;

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
    <View style={styles.surface}>
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
  const [activeFilterPanel, setActiveFilterPanel] =
    React.useState<ProductSerialFilterPanel | null>(null);
  const [panelAnchor, setPanelAnchor] =
    React.useState<KolamFilterPanelAnchor | null>(null);
  const [qrSerial, setQrSerial] = React.useState<KolamProductSerial | null>(null);
  const toolbarRef = React.useRef<View>(null);
  const typeTriggerRef = React.useRef<View>(null);
  const statusTriggerRef = React.useRef<View>(null);

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
  }, [controller.filters.search, controller.onSearchChange, searchInput]);

  const pageCount = Math.max(1, controller.pagination.totalPages);
  const safePage = Math.min(Math.max(controller.pagination.page, 1), pageCount);
  const typeFilterLabel = controller.filters.productType
    ? getKolamProductSerialTypeLabel(controller.filters.productType)
    : 'Tipe';
  const statusFilterLabel = controller.filters.status
    ? getKolamProductSerialStatusLabel(controller.filters.status)
    : 'Status';
  const listColumns = React.useMemo(
    () => buildProductSerialListColumns(),
    [],
  );
  const filteredProductName = controller.filters.productId
    ? controller.serials[0]?.product?.name
    : '';
  const emptyTitle = controller.loading
    ? 'Memuat nomor seri…'
    : controller.error
      ? 'Gagal memuat nomor seri'
      : 'Belum ada nomor seri';
  const getFilterTriggerRef = (panel: ProductSerialFilterPanel) =>
    panel === 'type' ? typeTriggerRef : statusTriggerRef;

  const anchorFilterPanel = React.useCallback((panel: ProductSerialFilterPanel) => {
    measureFilterPanelAnchor(
      toolbarRef.current,
      getFilterTriggerRef(panel).current,
      FILTER_PANEL_WIDTH,
      setPanelAnchor,
    );
  }, []);

  const toggleFilterPanel = (panel: ProductSerialFilterPanel) => {
    if (activeFilterPanel === panel) {
      setActiveFilterPanel(null);
      setPanelAnchor(null);
      return;
    }
    setActiveFilterPanel(null);
    setPanelAnchor(null);
    requestAnimationFrame(() => {
      measureFilterPanelAnchor(
        toolbarRef.current,
        getFilterTriggerRef(panel).current,
        FILTER_PANEL_WIDTH,
        anchor => {
          setPanelAnchor(anchor);
          setActiveFilterPanel(panel);
        },
      );
    });
  };

  React.useEffect(() => {
    if (!activeFilterPanel) {
      return;
    }
    requestAnimationFrame(() => anchorFilterPanel(activeFilterPanel));
  }, [activeFilterPanel, anchorFilterPanel]);

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

      <View ref={toolbarRef} style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              <KolamSearchField
                containerStyle={kolamTableToolbarStyles.searchInput}
                onChangeText={setSearchInput}
                placeholder="Cari nomor seri"
                value={searchInput}
              />
              <View ref={typeTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={
                    activeFilterPanel === 'type' || Boolean(controller.filters.productType)
                  }
                  label={typeFilterLabel}
                  onPress={() => toggleFilterPanel('type')}
                  open={activeFilterPanel === 'type'}
                  variant="quiet"
                />
              </View>
              <View ref={statusTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={
                    activeFilterPanel === 'status' || Boolean(controller.filters.status)
                  }
                  label={statusFilterLabel}
                  onPress={() => toggleFilterPanel('status')}
                  open={activeFilterPanel === 'status'}
                  variant="quiet"
                />
              </View>
            </View>
            <View style={kolamTableToolbarStyles.actions}>
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
        </View>

        {activeFilterPanel === 'type' && panelAnchor ? (
          <View
            style={[
              styles.filterOverlayPanel,
              {
                left: panelAnchor.left,
                top: panelAnchor.top,
                width: FILTER_PANEL_WIDTH,
              },
            ]}
          >
            <ScrollView
              contentContainerStyle={styles.filterPanelContent}
              keyboardShouldPersistTaps="handled"
              style={styles.filterPanelScroll}
            >
              <KolamButton
                intent={!controller.filters.productType ? 'primary' : 'plain'}
                label="Semua tipe"
                onPress={() => {
                  controller.onChangeFilters({ productType: '' });
                  setActiveFilterPanel(null);
                  setPanelAnchor(null);
                }}
                style={styles.filterPanelOption}
              />
              {PRODUCT_TYPE_OPTIONS.map(type => (
                <KolamButton
                  intent={controller.filters.productType === type ? 'primary' : 'plain'}
                  key={type}
                  label={getKolamProductSerialTypeLabel(type)}
                  onPress={() => {
                    controller.onChangeFilters({ productType: type });
                    setActiveFilterPanel(null);
                    setPanelAnchor(null);
                  }}
                  style={styles.filterPanelOption}
                />
              ))}
            </ScrollView>
            <View style={styles.filterPanelFooter}>
              <KolamButton
                label="Tutup"
                onPress={() => {
                  setActiveFilterPanel(null);
                  setPanelAnchor(null);
                }}
              />
            </View>
          </View>
        ) : null}

        {activeFilterPanel === 'status' && panelAnchor ? (
          <View
            style={[
              styles.filterOverlayPanel,
              {
                left: panelAnchor.left,
                top: panelAnchor.top,
                width: FILTER_PANEL_WIDTH,
              },
            ]}
          >
            <ScrollView
              contentContainerStyle={styles.filterPanelContent}
              keyboardShouldPersistTaps="handled"
              style={styles.filterPanelScroll}
            >
              <KolamButton
                intent={!controller.filters.status ? 'primary' : 'plain'}
                label="Semua status"
                onPress={() => {
                  controller.onChangeFilters({ status: '' });
                  setActiveFilterPanel(null);
                  setPanelAnchor(null);
                }}
                style={styles.filterPanelOption}
              />
              {STATUS_OPTIONS.map(status => (
                <KolamButton
                  intent={controller.filters.status === status ? 'primary' : 'plain'}
                  key={status}
                  label={getKolamProductSerialStatusLabel(status)}
                  onPress={() => {
                    controller.onChangeFilters({ status });
                    setActiveFilterPanel(null);
                    setPanelAnchor(null);
                  }}
                  style={styles.filterPanelOption}
                />
              ))}
            </ScrollView>
            <View style={styles.filterPanelFooter}>
              <KolamButton
                label="Tutup"
                onPress={() => {
                  setActiveFilterPanel(null);
                  setPanelAnchor(null);
                }}
              />
            </View>
          </View>
        ) : null}
      </View>

      <KolamListTableComposition
        actionsColumn
        columns={listColumns}
        emptyTitle={emptyTitle}
        getRowKey={item => item.id || item.serialNumber}
        loading={controller.loading}
        pagination={{
          onPageChange: controller.onPageChange,
          page: safePage,
          pageSize: controller.pagination.limit,
          total: controller.pagination.total,
        }}
        renderActions={item => (
          <KolamProductSerialActionsMenu
            onRouteChange={onRouteChange}
            onViewQr={() => setQrSerial(item)}
            serial={item}
          />
        )}
        rows={controller.serials}
      />

      <KolamProductSerialQrModal serial={qrSerial} onClose={() => setQrSerial(null)} />
    </View>
  );
}

function buildProductSerialListColumns(): Array<KolamListTableColumn<KolamProductSerial>> {
  return [
    {
      flex: 1,
      id: 'serial',
      label: 'Serial',
      render: serial => (
        <View style={styles.identityCell}>
          <Text numberOfLines={1} style={styles.rowTitleMono}>
            {serial.serialNumber}
          </Text>
        </View>
      ),
    },
    {
      align: 'center',
      flex: 1.2,
      id: 'product',
      label: 'Produk',
      render: serial => (
        <Text numberOfLines={1} style={styles.cellText}>
          {serial.product?.name || '-'}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.72,
      id: 'type',
      label: 'Tipe',
      render: serial => (
        <View style={styles.statusCell}>
          <KolamStatusBadge
            intent={getKolamProductSerialTypeIntent(serial.productType)}
            label={getKolamProductSerialTypeLabel(serial.productType)}
            style={styles.centerBadge}
          />
        </View>
      ),
    },
    {
      align: 'center',
      flex: 0.78,
      id: 'date',
      label: 'Produksi',
      render: serial => (
        <Text numberOfLines={1} style={styles.cellText}>
          {formatProductSerialDate(serial.productionDate)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.78,
      id: 'status',
      label: 'Status',
      render: serial => (
        <View style={styles.statusCell}>
          <KolamStatusBadge
            intent={getKolamProductSerialStatusIntent(serial.status)}
            label={getKolamProductSerialStatusLabel(serial.status)}
            style={styles.centerBadge}
          />
        </View>
      ),
    },
    {
      align: 'center',
      flex: 0.8,
      id: 'opname',
      label: 'Opname',
      render: serial => (
        <View style={styles.statusCell}>
          {serial.opnameStatus ? (
            <KolamStatusBadge
              intent={getKolamProductSerialOpnameIntent(serial.opnameStatus)}
              label={getKolamProductSerialOpnameLabel(serial.opnameStatus)}
              style={styles.centerBadge}
            />
          ) : (
            <Text style={styles.rowMeta}>-</Text>
          )}
        </View>
      ),
    },
  ];
}

function KolamProductSerialActionsMenu({
  onRouteChange,
  onViewQr,
  serial,
}: {
  onRouteChange?: (route: string) => void;
  onViewQr: () => void;
  serial: KolamProductSerial;
}) {
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

  return actions.length ? (
    <KolamTableRowActionMenu
      accessibilityLabel={`Menu ${serial.serialNumber}`}
      actions={actions}
    />
  ) : null;
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
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text numberOfLines={1} style={styles.detailToolbarContext}>
              Opname Serial
            </Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamDaftarButton
              muted
              onPress={() => onRouteChange?.(KOLAM_PRODUCT_SERIAL_ROOT)}
              style={styles.toolbarButton}
            />
            <KolamButton
              disabled={!controller.sessionItems.length}
              label="Reset sesi"
              onPress={() => controller.onResetSession()}
              style={styles.toolbarButton}
            />
          </View>
        </View>
      </View>

      <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
        <View style={styles.opnameTitleRow}>
          <Text style={styles.sectionTitle}>Pindai / Input Nomor Seri</Text>
          <View style={styles.opnameStats}>
            <KolamStatusBadge intent="success" label={`Ditemukan: ${foundCount}`} />
            <KolamStatusBadge intent="danger" label={`Hilang: ${missingCount}`} />
            <KolamStatusBadge
              intent="muted"
              label={`Total pindai: ${controller.sessionItems.length}`}
            />
          </View>
        </View>
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
  surface: { gap: 14 },
  statusBadge: { alignSelf: 'stretch' },
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
  listRoot: { gap: 14 },
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
  toolbarButton: {
    flexShrink: 0,
    minHeight: 34,
    paddingHorizontal: 10,
  },
  filterOverlayPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 1200,
    padding: 6,
    position: 'absolute',
    shadowColor: V.colors.fg,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    zIndex: 120000,
  },
  filterPanelScroll: {
    maxHeight: 280,
  },
  filterPanelContent: {
    gap: 4,
  },
  filterPanelOption: {
    justifyContent: 'flex-start',
  },
  filterPanelFooter: {
    alignItems: 'flex-end',
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    marginTop: 6,
    paddingTop: 6,
  },
  emptyWrap: { paddingHorizontal: 12, paddingVertical: 24 },
  paginationRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  pageLabel: { color: V.colors.mutedFg, fontSize: 13 },
  listCell: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  identityCell: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  primaryCell: {
    minWidth: 0,
    width: 96,
  },
  statusCell: {
    alignItems: 'center',
    gap: 4,
  },
  centerBadge: {
    alignSelf: 'center',
  },
  actionsTrack: {
    alignItems: 'center',
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
    textAlign: 'center',
    width: '100%',
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
  opnameRoot: { gap: 14 },
  opnameTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
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
  opnameStats: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    flexWrap: 'wrap',
    gap: 8,
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
