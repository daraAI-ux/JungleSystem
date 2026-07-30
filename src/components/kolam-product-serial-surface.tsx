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
import {
  getKolamTableColumns,
  getKolamTableVisualContract,
  type KolamTableColumn,
} from '../domain/kolam-table';
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
import {
  getKolamDataTableColumnStyle,
  KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  KOLAM_DATA_TABLE_COLUMN_GAP,
} from './kolam-data-table-column-style';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDataTableHeader } from './kolam-data-table-header';
import { KolamDataTableRowFrame } from './kolam-data-table-row-frame';
import {
  KolamDataTableActionsTrack,
  KolamDataTableMainTrack,
} from './kolam-data-table-tracks';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamModalBackdrop } from './kolam-modal-backdrop';
import { KolamSearchField } from './kolam-search-field';
import { KolamOverflowMenuButton, KolamTableFooterControls } from './kolam-dropdown-select';
import { KolamStatusBadge } from './kolam-status-badge';
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
  const [panelAnchor, setPanelAnchor] = React.useState({ left: 0, top: 48 });
  const [qrSerial, setQrSerial] = React.useState<KolamProductSerial | null>(null);
  const [tableBodyWidth, setTableBodyWidth] = React.useState(0);
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
  const hasActiveFilters = Boolean(
    controller.filters.search ||
      controller.filters.productType ||
      controller.filters.status ||
      controller.filters.productId,
  );
  const filtersAppliedCount = [
    controller.filters.search,
    controller.filters.productType,
    controller.filters.status,
    controller.filters.productId,
  ].filter(Boolean).length;
  const listColumns = React.useMemo(
    () => fitProductSerialListColumns(tableBodyWidth),
    [tableBodyWidth],
  );
  const filteredProductName = controller.filters.productId
    ? controller.serials[0]?.product?.name
    : '';
  const emptyTitle = controller.loading
    ? 'Memuat nomor seri…'
    : controller.error
      ? 'Gagal memuat nomor seri'
      : 'Belum ada nomor seri';
  const emptyMessage = controller.error
    ? controller.error
    : hasActiveFilters
      ? 'Coba ubah pencarian atau filter.'
      : 'Nomor seri dibuat otomatis saat produksi selesai.';

  const anchorFilterPanel = React.useCallback((panel: ProductSerialFilterPanel) => {
    const triggerRef = panel === 'type' ? typeTriggerRef : statusTriggerRef;
    const toolbar = toolbarRef.current;
    const trigger = triggerRef.current;
    if (!toolbar || !trigger) {
      return;
    }
    toolbar.measureInWindow((toolbarX, toolbarY, toolbarWidth) => {
      trigger.measureInWindow((x, y, _width, height) => {
        const maxLeft = Math.max(0, toolbarWidth - FILTER_PANEL_WIDTH);
        const preferredLeft = x - toolbarX;
        setPanelAnchor({
          left: Math.min(Math.max(0, preferredLeft), maxLeft),
          top: y - toolbarY + height + 4,
        });
      });
    });
  }, []);

  const toggleFilterPanel = React.useCallback(
    (panel: ProductSerialFilterPanel) => {
      setActiveFilterPanel(current => {
        const next = current === panel ? null : panel;
        if (next) {
          requestAnimationFrame(() => anchorFilterPanel(next));
        }
        return next;
      });
    },
    [anchorFilterPanel],
  );

  React.useEffect(() => {
    if (!activeFilterPanel) {
      return;
    }
    requestAnimationFrame(() => anchorFilterPanel(activeFilterPanel));
  }, [activeFilterPanel, anchorFilterPanel]);

  const renderRow = React.useCallback(
    (item: KolamProductSerial) => (
      <KolamProductSerialRow
        columns={listColumns}
        key={item.id || item.serialNumber}
        onRouteChange={onRouteChange}
        onViewQr={() => setQrSerial(item)}
        serial={item}
      />
    ),
    [listColumns, onRouteChange],
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
              {filtersAppliedCount > 0 ? (
                <KolamButton
                  label="Reset"
                  muted
                  onPress={() => {
                    setSearchInput('');
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
        </View>

        {activeFilterPanel === 'type' ? (
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
                  }}
                  style={styles.filterPanelOption}
                />
              ))}
            </ScrollView>
            <View style={styles.filterPanelFooter}>
              <KolamButton label="Tutup" onPress={() => setActiveFilterPanel(null)} />
            </View>
          </View>
        ) : null}

        {activeFilterPanel === 'status' ? (
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
                  }}
                  style={styles.filterPanelOption}
                />
              ))}
            </ScrollView>
            <View style={styles.filterPanelFooter}>
              <KolamButton label="Tutup" onPress={() => setActiveFilterPanel(null)} />
            </View>
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
                    controller.onPageChange(Math.min(pageCount, safePage + 1))
                  }
                />
              </View>
            ) : null}
          </KolamTableFooterControls>
        }
        onBodyWidthChange={setTableBodyWidth}
      >
        <KolamDataTableHeader columns={listColumns} />
        {controller.serials.length ? (
          controller.serials.map(renderRow)
        ) : (
          <View style={styles.emptyWrap}>
            <KolamEmptyState compact message={emptyMessage} title={emptyTitle} />
          </View>
        )}
      </KolamCatalogListTableShell>

      <KolamProductSerialQrModal serial={qrSerial} onClose={() => setQrSerial(null)} />
    </View>
  );
}

function KolamProductSerialRow({
  serial,
  columns,
  onRouteChange,
  onViewQr,
}: {
  serial: KolamProductSerial;
  columns: ReturnType<typeof getKolamTableColumns>;
  onRouteChange?: (route: string) => void;
  onViewQr: () => void;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);
  const columnOf = React.useCallback(
    (id: (typeof columns)[number]['id']) => columns.find(column => column.id === id),
    [columns],
  );
  const primaryColumn = columnOf('primary');
  const metaColumn = columnOf('meta');
  const notesColumn = columnOf('notes');
  const marketplaceColumn = columnOf('marketplace');
  const statusColumn = columnOf('status');
  const productsColumn = columnOf('products');
  const actionsColumn = columnOf('actions');

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
      <KolamDataTableMainTrack>
        <View
          style={[
            styles.listCell,
            styles.identityCell,
            primaryColumn ? getKolamDataTableColumnStyle(primaryColumn) : styles.primaryCell,
          ]}
        >
          <Text numberOfLines={1} style={styles.rowTitleMono}>
            {serial.serialNumber}
          </Text>
        </View>

        <View
          style={[
            styles.listCell,
            metaColumn ? getKolamDataTableColumnStyle(metaColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.cellText}>
            {serial.product?.name || '—'}
          </Text>
          {serial.product?.sku ? (
            <Text numberOfLines={1} style={styles.rowMetaMono}>
              {serial.product.sku}
            </Text>
          ) : null}
        </View>

        <View
          style={[
            styles.listCell,
            styles.statusCell,
            notesColumn ? getKolamDataTableColumnStyle(notesColumn) : null,
          ]}
        >
          <KolamStatusBadge
            intent={getKolamProductSerialTypeIntent(serial.productType)}
            label={getKolamProductSerialTypeLabel(serial.productType)}
            style={styles.centerBadge}
          />
        </View>

        <View
          style={[
            styles.listCell,
            marketplaceColumn ? getKolamDataTableColumnStyle(marketplaceColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.cellText}>
            {formatProductSerialDate(serial.productionDate)}
          </Text>
        </View>

        <View
          style={[
            styles.listCell,
            styles.statusCell,
            statusColumn ? getKolamDataTableColumnStyle(statusColumn) : null,
          ]}
        >
          <KolamStatusBadge
            intent={getKolamProductSerialStatusIntent(serial.status)}
            label={getKolamProductSerialStatusLabel(serial.status)}
            style={styles.centerBadge}
          />
        </View>

        <View
          style={[
            styles.listCell,
            styles.statusCell,
            productsColumn ? getKolamDataTableColumnStyle(productsColumn) : null,
          ]}
        >
          {serial.opnameStatus ? (
            <KolamStatusBadge
              intent={getKolamProductSerialOpnameIntent(serial.opnameStatus)}
              label={getKolamProductSerialOpnameLabel(serial.opnameStatus)}
              style={styles.centerBadge}
            />
          ) : (
            <Text style={styles.rowMeta}>—</Text>
          )}
        </View>
      </KolamDataTableMainTrack>

      <KolamDataTableActionsTrack
        style={styles.actionsTrack}
        width={Math.max(
          actionsColumn?.width ?? KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
          KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
        )}
      >
        {actions.length ? (
          <KolamOverflowMenuButton
            accessibilityLabel={`Menu ${serial.serialNumber}`}
            actions={actions}
            onOpenChange={open => setActionMenuOpen(open)}
          />
        ) : null}
      </KolamDataTableActionsTrack>
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
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text numberOfLines={1} style={styles.detailToolbarContext}>
              Opname Serial
            </Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              label="Daftar"
              muted
              onPress={() => onRouteChange?.(KOLAM_PRODUCT_SERIAL_ROOT)}
              style={styles.toolbarButton}
            />
            <KolamStatusBadge intent="success" label={`Ditemukan: ${foundCount}`} />
            <KolamStatusBadge intent="danger" label={`Hilang: ${missingCount}`} />
            <KolamStatusBadge
              intent="muted"
              label={`Total pindai: ${controller.sessionItems.length}`}
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

function fitProductSerialListColumns(containerWidth: number): KolamTableColumn[] {
  const base = getKolamTableColumns('product-serial');
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
