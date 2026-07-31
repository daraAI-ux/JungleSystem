import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  formatKolamSaleDeliveryStatusLabel,
  formatKolamSalePaymentStatusLabel,
  getKolamSaleDeliveryStatusIntent,
  getKolamSalePaymentStatusIntent,
  isKolamSalesAddItemsRoute,
  isKolamSalesDiscountApprovalRoute,
  isKolamSalesEditRoute,
  KOLAM_SALE_DELIVERY_STATUS_OPTIONS,
  KOLAM_SALE_LIFECYCLE_OPTIONS,
  KOLAM_SALE_PAYMENT_STATUS_OPTIONS,
  KOLAM_SALES_DISCOUNT_APPROVAL_ROUTE,
  KOLAM_SALES_ROOT,
  type KolamSale,
  type KolamSaleCreateItemType,
  type KolamSaleDeliveryStatus,
  type KolamSaleLifecycle,
  type KolamSalePaymentStatus,
  type KolamSaleStatusTransitionTarget,
} from '../domain/kolam-sales';
import {
  getKolamTableColumns,
  getKolamTableVisualContract,
  type KolamTableColumn,
} from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { formatRupiah } from '../lib/money';
import {
  useKolamSalesController,
  type KolamSalesController,
} from '../hooks/use-kolam-sales-controller';
import { KolamButton } from './kolam-button';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamConfirmDialog } from './kolam-confirm-dialog';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import {
  getKolamDataTableColumnStyle,
  KOLAM_DATA_TABLE_COLUMN_GAP,
} from './kolam-data-table-column-style';
import { KolamDataTableHeader } from './kolam-data-table-header';
import { KolamDataTableRowFrame } from './kolam-data-table-row-frame';
import { KolamDataTableMainTrack } from './kolam-data-table-tracks';
import { KolamDateField } from './kolam-date-field';
import { KolamDescriptionList } from './kolam-description-list';
import {
  KolamDropdownSelect,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamSalesOpsAnalyticsPanel } from './kolam-sales-ops-analytics-panel';
import { KolamSalesOpsDetail } from './kolam-sales-ops-detail';
import { KolamSearchField } from './kolam-search-field';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamTableFilterTrigger } from './kolam-table-filter-trigger';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

type SalesFilterPanel = 'lifecycle' | 'status' | 'delivery' | null;

const FILTER_PANEL_WIDTH = 260;

const ITEM_TYPE_OPTIONS_FULL: Array<{
  label: string;
  value: KolamSaleCreateItemType;
}> = [
  { label: 'Produk', value: 'product' },
  { label: 'Spesies', value: 'species' },
  { label: 'Custom', value: 'custom' },
  { label: 'Layanan', value: 'service' },
  { label: 'Enclosure', value: 'enclosure' },
];

const ITEM_TYPE_OPTIONS_ADD_ITEMS: Array<{
  label: string;
  value: KolamSaleCreateItemType;
}> = [
  { label: 'Produk', value: 'product' },
  { label: 'Custom', value: 'custom' },
];

/**
 * Kolam backoffice penjualan (FE `/sales`).
 * P0: list + detail + status/proof/invoice.
 * P1: create (product | species | custom).
 * P2-P10: buyer info, points, transaction date, service/enclosure item,
 * voucher, custom costs, add-items, delivery, biteship, discount approval,
 * export, analytics, notifications.
 */
export function KolamSalesOpsSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamSalesController(route);

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
          style={styles.banner}
        />
      ) : null}
      {controller.statusMessage ? (
        <KolamStatusBadge
          intent="success"
          label={controller.statusMessage}
          numberOfLines={2}
          style={styles.banner}
        />
      ) : null}
      {controller.mode === 'list' ? (
        <KolamSalesOpsList
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : controller.mode === 'create' ||
        isKolamSalesEditRoute(route) ||
        isKolamSalesAddItemsRoute(route) ? (
        <KolamSalesOpsCreateForm
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : controller.mode === 'approval' &&
        isKolamSalesDiscountApprovalRoute(route) ? (
        <KolamSalesOpsApproval
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : (
        <KolamSalesOpsDetail
          controller={controller}
          onRouteChange={onRouteChange}
        />
      )}
    </View>
  );
}

function KolamSalesOpsList({
  controller,
  onRouteChange,
}: {
  controller: KolamSalesController;
  onRouteChange?: (route: string) => void;
}) {
  const [searchInput, setSearchInput] = useState(controller.filters.search);
  const [activeFilterPanel, setActiveFilterPanel] =
    useState<SalesFilterPanel>(null);
  const [panelAnchor, setPanelAnchor] = useState({ left: 0, top: 48 });
  const [tableBodyWidth, setTableBodyWidth] = useState(0);
  const toolbarRef = React.useRef<View>(null);
  const lifecycleTriggerRef = React.useRef<View>(null);
  const statusTriggerRef = React.useRef<View>(null);
  const deliveryTriggerRef = React.useRef<View>(null);

  const pageCount = Math.max(1, controller.pagination.totalPages);
  const safePage = Math.min(Math.max(controller.pagination.page, 1), pageCount);
  const filtersAppliedCount = [
    controller.filters.search,
    controller.filters.status,
    controller.filters.deliveryStatus,
    controller.filters.needsAction ? '1' : '',
    controller.filters.lifecycle !== 'active' ? controller.filters.lifecycle : '',
    controller.filters.startDate,
    controller.filters.endDate,
  ].filter(Boolean).length;
  const listColumns = useMemo(
    () => fitSalesOpsListColumns(tableBodyWidth),
    [tableBodyWidth],
  );
  const lifecycleFilterLabel =
    KOLAM_SALE_LIFECYCLE_OPTIONS.find(
      option => option.value === controller.filters.lifecycle,
    )?.label ?? 'Berjalan';
  const statusFilterLabel = controller.filters.status
    ? formatKolamSalePaymentStatusLabel(controller.filters.status)
    : 'Status bayar';
  const deliveryFilterLabel = controller.filters.deliveryStatus
    ? formatKolamSaleDeliveryStatusLabel(controller.filters.deliveryStatus)
    : 'Pengiriman';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const anchorFilterPanel = React.useCallback(
    (panel: Exclude<SalesFilterPanel, null>) => {
      const triggerRef =
        panel === 'lifecycle'
          ? lifecycleTriggerRef
          : panel === 'status'
            ? statusTriggerRef
            : deliveryTriggerRef;
      const toolbar = toolbarRef.current;
      const trigger = triggerRef.current;
      if (!toolbar || !trigger) {
        return;
      }
      toolbar.measureInWindow((toolbarX, toolbarY, toolbarWidth) => {
        trigger.measureInWindow((x, y, width, height) => {
          const maxLeft = Math.max(0, toolbarWidth - FILTER_PANEL_WIDTH);
          const preferredLeft = x - toolbarX;
          const left = Math.min(Math.max(0, preferredLeft), maxLeft);
          setPanelAnchor({
            left,
            top: y - toolbarY + height + 4,
          });
        });
      });
    },
    [],
  );

  const toggleFilterPanel = React.useCallback(
    (panel: Exclude<SalesFilterPanel, null>) => {
      setActiveFilterPanel(prev => {
        const next = prev === panel ? null : panel;
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

  return (
    <View style={styles.listRoot}>
      <View ref={toolbarRef} style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              <KolamSearchField
                containerStyle={kolamTableToolbarStyles.searchInput}
                onChangeText={setSearchInput}
                placeholder="Cari invoice / pembeli"
                value={searchInput}
              />
              <View ref={lifecycleTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={
                    activeFilterPanel === 'lifecycle' ||
                    controller.filters.lifecycle !== 'active'
                  }
                  label={lifecycleFilterLabel}
                  onPress={() => toggleFilterPanel('lifecycle')}
                  open={activeFilterPanel === 'lifecycle'}
                  variant="quiet"
                />
              </View>
              <View ref={statusTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={
                    activeFilterPanel === 'status' ||
                    Boolean(controller.filters.status)
                  }
                  label={statusFilterLabel}
                  onPress={() => toggleFilterPanel('status')}
                  open={activeFilterPanel === 'status'}
                  variant="quiet"
                />
              </View>
              <View ref={deliveryTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={
                    activeFilterPanel === 'delivery' ||
                    Boolean(controller.filters.deliveryStatus)
                  }
                  label={deliveryFilterLabel}
                  onPress={() => toggleFilterPanel('delivery')}
                  open={activeFilterPanel === 'delivery'}
                  variant="quiet"
                />
              </View>
              <KolamDateField
                accessibilityLabel="Tanggal mulai"
                label="Dari"
                onChange={value =>
                  controller.onChangeFilters({ startDate: value })
                }
                placeholder="Dari"
                showLabelInTrigger={false}
                style={styles.dateField}
                value={controller.filters.startDate}
              />
              <KolamDateField
                accessibilityLabel="Tanggal sampai"
                label="Sampai"
                onChange={value => controller.onChangeFilters({ endDate: value })}
                placeholder="Sampai"
                showLabelInTrigger={false}
                style={styles.dateField}
                value={controller.filters.endDate}
              />
              <KolamButton
                intent={controller.filters.needsAction ? 'primary' : 'outline'}
                label="Perlu aksi"
                onPress={() =>
                  controller.onChangeFilters({
                    needsAction: !controller.filters.needsAction,
                  })
                }
                style={styles.toolbarButton}
              />
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
                disabled={controller.exporting}
                label={controller.exporting ? 'Mengekspor…' : 'Export'}
                onPress={() => {
                  void controller.onExportList();
                }}
                style={styles.toolbarButton}
              />
              <KolamButton
                disabled={controller.loading}
                label="Refresh"
                onPress={() => {
                  void controller.onRefresh();
                }}
                style={styles.toolbarButton}
              />
              <KolamButton
                intent="primary"
                label="Baru"
                onPress={() => onRouteChange?.(`${KOLAM_SALES_ROOT}/create`)}
                style={styles.toolbarButton}
              />
            </View>
          </View>
        </View>

        {activeFilterPanel === 'lifecycle' ? (
          <FilterPanel
            anchor={panelAnchor}
            onClose={() => setActiveFilterPanel(null)}
            onSelect={value => {
              controller.onChangeFilters({
                lifecycle: value as KolamSaleLifecycle,
                needsAction: false,
              });
              setActiveFilterPanel(null);
            }}
            options={KOLAM_SALE_LIFECYCLE_OPTIONS}
            selectedValue={controller.filters.lifecycle}
          />
        ) : null}
        {activeFilterPanel === 'status' ? (
          <FilterPanel
            anchor={panelAnchor}
            onClose={() => setActiveFilterPanel(null)}
            onSelect={value => {
              controller.onChangeFilters({
                status: value as '' | KolamSalePaymentStatus,
              });
              setActiveFilterPanel(null);
            }}
            options={KOLAM_SALE_PAYMENT_STATUS_OPTIONS}
            selectedValue={controller.filters.status}
          />
        ) : null}
        {activeFilterPanel === 'delivery' ? (
          <FilterPanel
            anchor={panelAnchor}
            onClose={() => setActiveFilterPanel(null)}
            onSelect={value => {
              controller.onChangeFilters({
                deliveryStatus: value as '' | KolamSaleDeliveryStatus,
              });
              setActiveFilterPanel(null);
            }}
            options={KOLAM_SALE_DELIVERY_STATUS_OPTIONS}
            selectedValue={controller.filters.deliveryStatus}
          />
        ) : null}
      </View>

      <KolamSalesOpsAnalyticsPanel
        analytics={controller.analytics}
        loading={controller.analyticsLoading}
        onOpenApproval={() =>
          onRouteChange?.(KOLAM_SALES_DISCOUNT_APPROVAL_ROUTE)
        }
        onRangeChange={controller.onAnalyticsRangeChange}
        pendingApproval={controller.notificationSummary.pendingApproval}
        range={controller.analyticsRange}
      />

      <KolamCatalogListTableShell
        footer={
          <KolamTableFooterControls
            onPageSizeChange={controller.onLimitChange}
            page={safePage}
            pageSize={controller.pagination.limit}
            total={controller.pagination.total}
          >
            {pageCount > 1 ? (
              <View style={styles.paginationBar}>
                <KolamButton
                  disabled={safePage <= 1 || controller.loading}
                  label="Sebelumnya"
                  onPress={() =>
                    controller.onPageChange(Math.max(1, safePage - 1))
                  }
                />
                <Text style={styles.pageLabel}>
                  {safePage} / {pageCount}
                </Text>
                <KolamButton
                  disabled={safePage >= pageCount || controller.loading}
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
        style={styles.tableFrame}
      >
        <KolamDataTableHeader columns={listColumns} />
        {controller.sales.length ? (
          controller.sales.map(item => (
            <KolamSalesOpsRow
              columns={listColumns}
              key={item.id}
              onSelect={() => {
                controller.onSelectSale(item);
                onRouteChange?.(`${KOLAM_SALES_ROOT}/${item.id}`);
              }}
              sale={item}
            />
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              compact
              message={
                controller.loading
                  ? 'Mengambil daftar dari server Kolam.'
                  : filtersAppliedCount > 0
                    ? `Coba ubah filter atau kata kunci. (total server: ${controller.pagination.total}, sumber: ${controller.dataSource})`
                    : `Belum ada invoice pada tampilan ini. (total server: ${controller.pagination.total}, sumber: ${controller.dataSource})`
              }
              title={
                controller.loading
                  ? 'Memuat penjualan…'
                  : 'Belum ada penjualan'
              }
            />
          </View>
        )}
      </KolamCatalogListTableShell>
    </View>
  );
}

function KolamSalesOpsRow({
  columns,
  onSelect,
  sale,
}: {
  columns: ReturnType<typeof getKolamTableColumns>;
  onSelect: () => void;
  sale: KolamSale;
}) {
  const columnOf = React.useCallback(
    (id: (typeof columns)[number]['id']) => columns.find(column => column.id === id),
    [columns],
  );
  const primaryColumn = columnOf('primary');
  const metaColumn = columnOf('meta');
  const childrenColumn = columnOf('children');
  const amountColumn = columnOf('amount');
  const statusColumn = columnOf('status');
  const marketplaceColumn = columnOf('marketplace');

  return (
    <Pressable onPress={onSelect}>
      <KolamDataTableRowFrame>
        <KolamDataTableMainTrack>
          <View
            style={[
              styles.listCell,
              styles.identityCell,
              primaryColumn ? getKolamDataTableColumnStyle(primaryColumn) : null,
            ]}
          >
            <Text numberOfLines={1} style={styles.invoiceCode}>
              {sale.invoiceCode}
            </Text>
            <Text numberOfLines={1} style={styles.metaText}>
              {formatShortDate(sale.transactionDate || sale.createdAt)}
            </Text>
          </View>

          <View
            style={[
              styles.listCell,
              metaColumn ? getKolamDataTableColumnStyle(metaColumn) : null,
            ]}
          >
            <Text numberOfLines={1} style={styles.primaryText}>
              {sale.buyerLabel}
            </Text>
            <Text numberOfLines={1} style={styles.metaText}>
              {sale.items.length} item
            </Text>
          </View>

          <View
            style={[
              styles.listCell,
              styles.sourceCell,
              childrenColumn ? getKolamDataTableColumnStyle(childrenColumn) : null,
            ]}
          >
            {sale.sourceRef?.logoUri ? (
              <KolamRemoteImage
                accessibilityLabel={sale.sourceRef.name}
                sourceUri={sale.sourceRef.logoUri}
                style={styles.sourceLogo}
              />
            ) : null}
            <Text numberOfLines={2} style={styles.primaryText}>
              {sale.sourceRef?.name || '—'}
            </Text>
          </View>

          <View
            style={[
              styles.listCell,
              amountColumn ? getKolamDataTableColumnStyle(amountColumn) : null,
            ]}
          >
            <Text numberOfLines={1} style={styles.primaryText}>
              {formatRupiah(sale.finalTotal)}
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
              intent={getKolamSalePaymentStatusIntent(sale.status)}
              label={formatKolamSalePaymentStatusLabel(sale.status)}
              numberOfLines={2}
              style={styles.centerBadge}
            />
          </View>

          <View
            style={[
              styles.listCell,
              styles.statusCell,
              marketplaceColumn
                ? getKolamDataTableColumnStyle(marketplaceColumn)
                : null,
            ]}
          >
            <KolamStatusBadge
              intent={getKolamSaleDeliveryStatusIntent(
                sale.deliveryStatus,
                sale.status,
              )}
              label={formatKolamSaleDeliveryStatusLabel(
                sale.deliveryStatus,
                sale.status,
              )}
              numberOfLines={2}
              style={styles.centerBadge}
            />
          </View>
        </KolamDataTableMainTrack>
      </KolamDataTableRowFrame>
    </Pressable>
  );
}

function KolamSalesOpsCreateForm({
  controller,
  onRouteChange,
}: {
  controller: KolamSalesController;
  onRouteChange?: (route: string) => void;
}) {
  const form = controller.form;
  const mode = controller.mode;
  const isAddItemsMode = mode === 'add-items';
  const isEditMode = mode === 'edit';

  const title =
    mode === 'edit'
      ? 'Ubah invoice'
      : mode === 'add-items'
        ? 'Tambah item'
        : 'Penjualan baru';
  const subtitle =
    mode === 'edit'
      ? 'Ubah data invoice draft sebelum dikirim ke pembeli.'
      : mode === 'add-items'
        ? 'Tambahkan produk atau item custom ke invoice yang sudah lunas.'
        : 'Buat invoice backoffice (produk, spesies, custom, layanan, atau enclosure).';

  const backRoute =
    (isEditMode || isAddItemsMode) && controller.selectedSale?.id
      ? `${KOLAM_SALES_ROOT}/${controller.selectedSale.id}`
      : KOLAM_SALES_ROOT;

  const itemTypeOptions = isAddItemsMode
    ? ITEM_TYPE_OPTIONS_ADD_ITEMS
    : ITEM_TYPE_OPTIONS_FULL;

  return (
    <View style={styles.formRoot}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text numberOfLines={1} style={styles.detailToolbarContext}>
              {title}
            </Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              label="Batal"
              onPress={() => onRouteChange?.(backRoute)}
              style={styles.toolbarButton}
            />
            <KolamButton
              disabled={controller.mutating || controller.optionsLoading}
              intent="primary"
              label={controller.mutating ? 'Menyimpan…' : 'Simpan'}
              onPress={() => {
                void controller.onSave().then(id => {
                  if (id) {
                    onRouteChange?.(`${KOLAM_SALES_ROOT}/${id}`);
                  }
                });
              }}
              style={styles.toolbarButton}
            />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.formContent}
        style={styles.formScroll}
      >
        <Text style={styles.detailSubtitle}>{subtitle}</Text>

      <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
        <Text style={styles.sectionTitle}>Data utama</Text>
        <View style={styles.formSplitRow}>
          <View style={styles.formSplitCell}>
            <FieldShell label="Sumber" required>
              <KolamDropdownSelect
                accessibilityLabel="Pilih sumber penjualan"
                label="Sumber"
                onChange={sourceRefId => controller.onChangeForm({ sourceRefId })}
                options={[
                  { label: 'Pilih sumber…', value: '' },
                  ...controller.sources.map(source => ({
                    label: `${source.name} (${source.type})`,
                    value: source.id,
                  })),
                ]}
                searchable
                searchPlaceholder="Cari sumber…"
                showLabelInTrigger={false}
                value={form.sourceRefId}
              />
            </FieldShell>
          </View>
          <View style={styles.formSplitCell}>
            <FieldShell label="Tanggal transaksi">
              <KolamDateField
                accessibilityLabel="Tanggal transaksi"
                label="Tanggal transaksi"
                onChange={transactionDate =>
                  controller.onChangeForm({ transactionDate })
                }
                placeholder="Pilih tanggal"
                showLabelInTrigger={false}
                value={form.transactionDate}
              />
            </FieldShell>
          </View>
        </View>

        {controller.useBuyerInfo ? (
          <View style={styles.buyerInfoBlock}>
            <Text style={styles.metaText}>
              Sumber ini memakai info pembeli manual (marketplace), bukan daftar
              pelanggan.
            </Text>
            <View style={styles.formSplitRow}>
              <View style={styles.formSplitCell}>
                <FieldShell label="Nama pembeli" required>
                  <KolamFormTextField
                    onChangeText={buyerInfoName =>
                      controller.onChangeForm({ buyerInfoName })
                    }
                    placeholder="Nama pembeli"
                    value={form.buyerInfoName}
                  />
                </FieldShell>
              </View>
              <View style={styles.formSplitCell}>
                <FieldShell label="Telepon">
                  <KolamFormTextField
                    onChangeText={buyerInfoPhone =>
                      controller.onChangeForm({ buyerInfoPhone })
                    }
                    placeholder="08xx"
                    value={form.buyerInfoPhone}
                  />
                </FieldShell>
              </View>
              <View style={styles.formSplitCell}>
                <FieldShell label="Email">
                  <KolamFormTextField
                    mode="email"
                    onChangeText={buyerInfoEmail =>
                      controller.onChangeForm({ buyerInfoEmail })
                    }
                    placeholder="email@contoh.com"
                    value={form.buyerInfoEmail}
                  />
                </FieldShell>
              </View>
            </View>
            <FieldShell label="Alamat">
              <KolamFormTextField
                onChangeText={buyerInfoAddress =>
                  controller.onChangeForm({ buyerInfoAddress })
                }
                placeholder="Alamat pengiriman"
                value={form.buyerInfoAddress}
              />
            </FieldShell>
          </View>
        ) : (
          <View style={styles.formSplitRow}>
            <View style={styles.formSplitCell}>
              <FieldShell label="Pelanggan" required>
                <KolamDropdownSelect
                  accessibilityLabel="Pilih pelanggan"
                  label="Pelanggan"
                  onChange={customerId => controller.onChangeForm({ customerId })}
                  options={[
                    { label: 'Pilih pelanggan…', value: '' },
                    ...controller.filteredCustomers.map(customer => ({
                      label: customer.name,
                      value: customer.id,
                    })),
                  ]}
                  searchable
                  searchPlaceholder="Cari pelanggan…"
                  showLabelInTrigger={false}
                  value={form.customerId}
                />
              </FieldShell>
            </View>
            <View style={styles.formSplitCell}>
              <FieldShell label="Metode pembayaran" required>
                <KolamDropdownSelect
                  accessibilityLabel="Pilih metode pembayaran"
                  label="Metode pembayaran"
                  onChange={paymentMethodId =>
                    controller.onChangeForm({ paymentMethodId })
                  }
                  options={[
                    { label: 'Pilih metode…', value: '' },
                    ...controller.filteredPaymentMethods.map(method => ({
                      label: method.name,
                      value: method.id,
                    })),
                  ]}
                  searchable
                  searchPlaceholder="Cari metode…"
                  showLabelInTrigger={false}
                  value={form.paymentMethodId}
                />
              </FieldShell>
            </View>
          </View>
        )}

        {controller.useBuyerInfo ? (
          <View style={styles.formSplitRow}>
            <View style={styles.formSplitCell}>
              <FieldShell label="Metode pembayaran" required>
                <KolamDropdownSelect
                  accessibilityLabel="Pilih metode pembayaran"
                  label="Metode pembayaran"
                  onChange={paymentMethodId =>
                    controller.onChangeForm({ paymentMethodId })
                  }
                  options={[
                    { label: 'Pilih metode…', value: '' },
                    ...controller.filteredPaymentMethods.map(method => ({
                      label: method.name,
                      value: method.id,
                    })),
                  ]}
                  searchable
                  searchPlaceholder="Cari metode…"
                  showLabelInTrigger={false}
                  value={form.paymentMethodId}
                />
              </FieldShell>
            </View>
            <View style={styles.formSplitCell} />
          </View>
        ) : null}

        <View style={styles.formSplitRow}>
          <View style={styles.formSplitCell}>
            <FieldShell label="Catatan">
              <KolamFormTextField
                onChangeText={notes => controller.onChangeForm({ notes })}
                placeholder="Opsional"
                value={form.notes}
              />
            </FieldShell>
          </View>
          <View style={styles.formSplitCell}>
            <FieldShell label="Metode poin">
              <KolamDropdownSelect
                accessibilityLabel="Pilih metode poin"
                label="Metode poin"
                onChange={pointsMethod =>
                  controller.onChangeForm({
                    pointsMethod: pointsMethod as
                      | ''
                      | 'manual'
                      | 'product_based',
                  })
                }
                options={[
                  { label: 'Tanpa poin', value: '' },
                  { label: 'Manual', value: 'manual' },
                  { label: 'Berdasarkan produk', value: 'product_based' },
                ]}
                showLabelInTrigger={false}
                value={form.pointsMethod}
              />
            </FieldShell>
            {form.pointsMethod === 'manual' ? (
              <FieldShell label="Poin manual">
                <KolamFormTextField
                  mode="numeric"
                  onChangeText={manualPoints =>
                    controller.onChangeForm({ manualPoints })
                  }
                  placeholder="0"
                  value={form.manualPoints}
                />
              </FieldShell>
            ) : null}
          </View>
        </View>

        {controller.optionsLoading ? (
          <Text style={styles.detailSubtitle}>Memuat opsi form…</Text>
        ) : null}
      </KolamContentFrame>

      <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
        <View style={styles.proofHeader}>
          <Text style={styles.sectionTitle}>Item</Text>
          <KolamButton label="Tambah item" onPress={controller.onAddCreateItem} />
        </View>
        {form.items.map((item, index) => (
          <View key={item.key} style={styles.createItemCard}>
            <View style={styles.proofHeader}>
              <Text style={styles.itemCardTitle}>Item {index + 1}</Text>
              {form.items.length > 1 ? (
                <KolamButton
                  label="Hapus"
                  muted
                  onPress={() => controller.onRemoveCreateItem(item.key)}
                />
              ) : null}
            </View>
            <View style={styles.formSplitRow}>
              <View style={styles.formSplitCell}>
                <FieldShell label="Tipe" required>
                  <KolamDropdownSelect
                    accessibilityLabel={`Tipe item ${index + 1}`}
                    label="Tipe"
                    onChange={value => {
                      const itemType = value as KolamSaleCreateItemType;
                      controller.onChangeCreateItem(item.key, {
                        itemType,
                        productId: '',
                        speciesId: '',
                        serviceId: '',
                        enclosureId: '',
                        quantity: itemType === 'enclosure' ? '1' : item.quantity,
                      });
                    }}
                    options={itemTypeOptions}
                    showLabelInTrigger={false}
                    value={item.itemType}
                  />
                </FieldShell>
              </View>
              <View style={styles.formSplitCellNarrow}>
                <FieldShell label="Qty" required>
                  <KolamFormTextField
                    editable={item.itemType !== 'enclosure'}
                    mode="numeric"
                    onChangeText={quantity =>
                      controller.onChangeCreateItem(item.key, { quantity })
                    }
                    value={item.itemType === 'enclosure' ? '1' : item.quantity}
                  />
                </FieldShell>
              </View>
            </View>

            {item.itemType === 'product' ? (
              <FieldShell label="Produk" required>
                <KolamDropdownSelect
                  accessibilityLabel={`Produk item ${index + 1}`}
                  label="Produk"
                  onChange={productId =>
                    controller.onChangeCreateItem(item.key, { productId })
                  }
                  options={[
                    { label: 'Pilih produk…', value: '' },
                    ...controller.products.map(product => ({
                      label: product.sku
                        ? `${product.name} (${product.sku})`
                        : product.name,
                      value: product.id,
                    })),
                  ]}
                  searchable
                  searchPlaceholder="Cari produk…"
                  showLabelInTrigger={false}
                  value={item.productId}
                />
              </FieldShell>
            ) : null}

            {item.itemType === 'species' ? (
              <FieldShell label="Spesies" required>
                <KolamDropdownSelect
                  accessibilityLabel={`Spesies item ${index + 1}`}
                  label="Spesies"
                  onChange={speciesId =>
                    controller.onChangeCreateItem(item.key, { speciesId })
                  }
                  options={[
                    { label: 'Pilih spesies…', value: '' },
                    ...controller.species.map(row => ({
                      label:
                        row.displayName ||
                        row.scientificName ||
                        row.commonName ||
                        row.id,
                      value: row.id,
                    })),
                  ]}
                  searchable
                  searchPlaceholder="Cari spesies…"
                  showLabelInTrigger={false}
                  value={item.speciesId}
                />
              </FieldShell>
            ) : null}

            {item.itemType === 'service' ? (
              <FieldShell label="Layanan" required>
                <KolamDropdownSelect
                  accessibilityLabel={`Layanan item ${index + 1}`}
                  label="Layanan"
                  onChange={serviceId =>
                    controller.onChangeCreateItem(item.key, { serviceId })
                  }
                  options={[
                    { label: 'Pilih layanan…', value: '' },
                    ...controller.services.map(service => ({
                      label: service.name,
                      value: service.id,
                    })),
                  ]}
                  searchable
                  searchPlaceholder="Cari layanan…"
                  showLabelInTrigger={false}
                  value={item.serviceId}
                />
              </FieldShell>
            ) : null}

            {item.itemType === 'enclosure' ? (
              <FieldShell label="Enclosure" required>
                <KolamDropdownSelect
                  accessibilityLabel={`Enclosure item ${index + 1}`}
                  label="Enclosure"
                  onChange={enclosureId =>
                    controller.onChangeCreateItem(item.key, { enclosureId })
                  }
                  options={[
                    { label: 'Pilih enclosure…', value: '' },
                    ...controller.enclosures.map(enclosure => ({
                      label: enclosure.name,
                      value: enclosure.id,
                    })),
                  ]}
                  searchable
                  searchPlaceholder="Cari enclosure…"
                  showLabelInTrigger={false}
                  value={item.enclosureId}
                />
              </FieldShell>
            ) : null}

            {item.itemType === 'custom' ? (
              <View style={styles.formSplitRow}>
                <View style={styles.formSplitCell}>
                  <FieldShell label="Nama custom" required>
                    <KolamFormTextField
                      onChangeText={customName =>
                        controller.onChangeCreateItem(item.key, { customName })
                      }
                      placeholder="Nama item"
                      value={item.customName}
                    />
                  </FieldShell>
                </View>
                <View style={styles.formSplitCellNarrow}>
                  <FieldShell label="Satuan">
                    <KolamFormTextField
                      onChangeText={customUnit =>
                        controller.onChangeCreateItem(item.key, { customUnit })
                      }
                      placeholder="pcs"
                      value={item.customUnit}
                    />
                  </FieldShell>
                </View>
                <View style={styles.formSplitCell}>
                  <FieldShell label="Harga satuan" required>
                    <KolamFormTextField
                      mode="numeric"
                      onChangeText={customUnitPrice =>
                        controller.onChangeCreateItem(item.key, {
                          customUnitPrice,
                        })
                      }
                      placeholder="0"
                      value={item.customUnitPrice}
                    />
                  </FieldShell>
                </View>
              </View>
            ) : null}

            <View style={styles.formSplitRow}>
              <View style={styles.formSplitCell}>
                <FieldShell label="Tipe diskon">
                  <KolamDropdownSelect
                    accessibilityLabel={`Tipe diskon item ${index + 1}`}
                    label="Tipe diskon"
                    onChange={discountType =>
                      controller.onChangeCreateItem(item.key, {
                        discountType:
                          discountType === 'percentage' ? 'percentage' : 'fixed',
                      })
                    }
                    options={[
                      { label: 'Fixed (Rp)', value: 'fixed' },
                      { label: 'Persen (%)', value: 'percentage' },
                    ]}
                    showLabelInTrigger={false}
                    value={item.discountType}
                  />
                </FieldShell>
              </View>
              <View style={styles.formSplitCell}>
                <FieldShell label="Diskon (opsional)">
                  <KolamFormTextField
                    mode="numeric"
                    onChangeText={discountAmount =>
                      controller.onChangeCreateItem(item.key, { discountAmount })
                    }
                    placeholder="0"
                    value={item.discountAmount}
                  />
                </FieldShell>
              </View>
              <View style={styles.formSplitCell}>
                <FieldShell label="Kode voucher">
                  <KolamFormTextField
                    onChangeText={voucherCode =>
                      controller.onChangeCreateItem(item.key, { voucherCode })
                    }
                    placeholder="Opsional"
                    value={item.voucherCode}
                  />
                </FieldShell>
              </View>
            </View>
          </View>
        ))}
      </KolamContentFrame>

      <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
        <View style={styles.proofHeader}>
          <Text style={styles.sectionTitle}>Biaya tambahan</Text>
          <KolamButton label="Tambah biaya" onPress={controller.onAddCustomCost} />
        </View>
        {form.customCosts.length === 0 ? (
          <Text style={styles.metaText}>Belum ada biaya tambahan.</Text>
        ) : (
          form.customCosts.map(cost => (
            <View key={cost.key} style={styles.formSplitRow}>
              <View style={styles.formSplitCell}>
                <FieldShell label="Nama biaya">
                  <KolamFormTextField
                    onChangeText={name =>
                      controller.onChangeCustomCost(cost.key, { name })
                    }
                    placeholder="Contoh: Biaya admin"
                    value={cost.name}
                  />
                </FieldShell>
              </View>
              <View style={styles.formSplitCell}>
                <FieldShell label="Jumlah">
                  <KolamFormTextField
                    mode="numeric"
                    onChangeText={amount =>
                      controller.onChangeCustomCost(cost.key, { amount })
                    }
                    placeholder="0"
                    value={cost.amount}
                  />
                </FieldShell>
              </View>
              <View style={styles.formSplitCellNarrow}>
                <FieldShell label=" ">
                  <KolamButton
                    label="Hapus"
                    muted
                    onPress={() => controller.onRemoveCustomCost(cost.key)}
                    style={styles.costRemoveButton}
                  />
                </FieldShell>
              </View>
            </View>
          ))
        )}
      </KolamContentFrame>
    </ScrollView>
    </View>
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
    <View style={styles.fieldShell}>
      <Text style={styles.fieldLabel}>
        {label}
        {required ? ' *' : ''}
      </Text>
      {children}
    </View>
  );
}


function KolamSalesOpsApproval({
  controller,
  onRouteChange,
}: {
  controller: KolamSalesController;
  onRouteChange?: (route: string) => void;
}) {
  const [pendingAction, setPendingAction] = useState<{
    sale: KolamSale;
    target: KolamSaleStatusTransitionTarget;
  } | null>(null);

  const requestAction = React.useCallback(
    (sale: KolamSale, target: KolamSaleStatusTransitionTarget) => {
      controller.onSelectSale(sale);
      setPendingAction({ sale, target });
    },
    [controller],
  );

  const renderRow = React.useCallback(
    ({ item }: { item: KolamSale }) => (
      <View style={styles.approvalCard}>
        <View style={styles.approvalRowHeader}>
          <View>
            <Text style={styles.invoiceCode}>{item.invoiceCode}</Text>
            <Text style={styles.metaText}>{item.buyerLabel}</Text>
          </View>
          <View>
            <Text style={styles.primaryText}>
              {formatRupiah(item.finalTotal)}
            </Text>
            <Text style={styles.metaText}>
              Diskon: {summarizeKolamSaleDiscounts(item)}
            </Text>
          </View>
        </View>
        <View style={styles.approvalActions}>
          <KolamButton
            disabled={controller.mutating}
            intent="primary"
            label="Setujui"
            onPress={() => requestAction(item, 'sent')}
          />
          <KolamButton
            disabled={controller.mutating}
            label="Tolak diskon"
            onPress={() => requestAction(item, 'reject')}
          />
          <KolamButton
            disabled={controller.mutating}
            intent="danger"
            label="Batalkan"
            onPress={() => requestAction(item, 'cancelled')}
          />
        </View>
      </View>
    ),
    [controller.mutating, requestAction],
  );

  return (
    <View style={styles.approvalRoot}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text numberOfLines={1} style={styles.detailToolbarContext}>
              Persetujuan diskon
            </Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              disabled={controller.loading}
              label="Refresh"
              onPress={() => {
                void controller.onRefresh();
              }}
              style={styles.toolbarButton}
            />
          </View>
        </View>
      </View>
      <Text style={styles.metaText}>
        Invoice dengan status Menunggu persetujuan finance.
      </Text>

      <FlatList
        contentContainerStyle={styles.approvalListContent}
        data={controller.sales}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              compact
              message={
                controller.loading
                  ? 'Mengambil invoice dari server Kolam.'
                  : 'Tidak ada invoice yang menunggu persetujuan diskon.'
              }
              title={
                controller.loading ? 'Memuat…' : 'Semua invoice sudah diproses'
              }
            />
          </View>
        }
        renderItem={renderRow}
      />

      <KolamConfirmDialog
        cancelLabel="Batal"
        confirmLabel={
          pendingAction?.target === 'sent'
            ? 'Setujui diskon'
            : pendingAction?.target === 'cancelled'
              ? 'Batalkan penjualan'
              : 'Tolak diskon'
        }
        destructive={
          pendingAction?.target === 'cancelled' ||
          pendingAction?.target === 'reject'
        }
        message={
          pendingAction
            ? `${
                pendingAction.target === 'sent'
                  ? 'Setujui diskon untuk'
                  : pendingAction.target === 'cancelled'
                    ? 'Batalkan'
                    : 'Tolak diskon untuk'
              } ${pendingAction.sale.invoiceCode}?`
            : ''
        }
        onCancel={() => setPendingAction(null)}
        onConfirm={() => {
          const action = pendingAction;
          setPendingAction(null);
          if (action) {
            void controller.onUpdateStatus(action.target);
          }
        }}
        title="Konfirmasi persetujuan diskon"
        visible={Boolean(pendingAction)}
      />
    </View>
  );
}

function summarizeKolamSaleDiscounts(sale: KolamSale): string {
  const discounted = sale.items.filter(
    item => item.discount && item.discount.amount > 0,
  );
  if (discounted.length === 0) {
    return 'Tidak ada diskon';
  }
  return discounted
    .map(item =>
      item.discount!.type === 'percentage'
        ? `${item.discount!.amount}%`
        : formatRupiah(item.discount!.amount),
    )
    .join(', ');
}

function FilterPanel({
  anchor,
  onClose,
  onSelect,
  options,
  selectedValue,
}: {
  anchor: { left: number; top: number };
  onClose: () => void;
  onSelect: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  selectedValue: string;
}) {
  const rows = useMemo(() => options, [options]);
  return (
    <View
      style={[
        styles.filterOverlayPanel,
        { left: anchor.left, top: anchor.top, width: FILTER_PANEL_WIDTH },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.filterPanelContent}
        keyboardShouldPersistTaps="handled"
        style={styles.filterPanelScroll}
      >
        {rows.map(option => (
          <KolamButton
            intent={selectedValue === option.value ? 'primary' : 'plain'}
            key={option.value || 'all'}
            label={option.label}
            onPress={() => onSelect(option.value)}
            style={styles.filterPanelOption}
          />
        ))}
      </ScrollView>
      <View style={styles.filterPanelFooter}>
        <KolamButton label="Tutup" onPress={onClose} />
      </View>
    </View>
  );
}

function formatShortDate(value: string) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function fitSalesOpsListColumns(containerWidth: number): KolamTableColumn[] {
  const base = getKolamTableColumns('sales-ops');
  if (containerWidth <= 0) {
    return base;
  }

  const gap = KOLAM_DATA_TABLE_COLUMN_GAP;
  const paddingX = getKolamTableVisualContract().body.cellPaddingX * 2;
  const gapsTotal = gap * Math.max(0, base.length - 1);
  const contentBudget = Math.max(0, containerWidth - paddingX - gapsTotal);
  const equalWidth = Math.max(
    72,
    Math.floor(contentBudget / Math.max(1, base.length)),
  );
  let remainder = contentBudget - equalWidth * base.length;
  const lastId = base[base.length - 1]?.id;

  return base.map(column => {
    const extra = column.id === lastId ? remainder : 0;
    if (column.id === lastId) {
      remainder = 0;
    }
    return {
      ...column,
      width: equalWidth + extra,
    };
  });
}

const styles = StyleSheet.create({
  surface: {
    gap: 14,
  },
  listSurface: {
    gap: 14,
    overflow: 'visible',
  },
  listRoot: {
    gap: 14,
    overflow: 'visible',
  },
  banner: {
    alignSelf: 'stretch',
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
  dateField: {
    maxWidth: 140,
    minWidth: 108,
    width: 120,
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
  tableFrame: {
    minHeight: 0,
    overflow: 'visible',
    zIndex: 2,
  },
  emptyWrap: {
    paddingVertical: 24,
  },
  listCell: {
    gap: 2,
    justifyContent: 'center',
    minWidth: 0,
  },
  identityCell: {
    alignItems: 'flex-start',
  },
  statusCell: {
    alignItems: 'center',
  },
  centerBadge: {
    alignSelf: 'center',
  },
  sourceCell: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  sourceLogo: {
    borderRadius: 4,
    height: 22,
    width: 22,
  },
  invoiceCode: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  primaryText: {
    color: V.colors.fg,
    fontSize: 13,
  },
  metaText: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  paginationBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  detailRoot: {
    flex: 1,
  },
  detailContent: {
    gap: 16,
    paddingBottom: 32,
  },
  detailMissing: {
    gap: 12,
  },
  detailHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  detailTitle: {
    color: V.colors.fg,
    fontSize: 20,
    fontWeight: '700',
  },
  detailSubtitle: {
    color: V.colors.mutedFg,
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '600',
  },
  proofHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  itemCard: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
    paddingVertical: 8,
  },
  proofRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  proofCard: {
    gap: 6,
    width: 160,
  },
  proofImage: {
    borderRadius: 8,
    height: 120,
    width: 120,
  },
  proofActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  historyRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
    paddingVertical: 8,
  },
  formRoot: {
    gap: 14,
  },
  formScroll: {
    flexGrow: 0,
  },
  formContent: {
    gap: 12,
    paddingBottom: 24,
  },
  detailCard: {
    gap: 8,
  },
  fieldShell: {
    gap: 4,
  },
  fieldLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
  },
  formSplitRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formSplitCell: {
    flex: 1,
    flexBasis: 240,
    minWidth: 240,
  },
  formSplitCellNarrow: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 120,
    maxWidth: 140,
    minWidth: 100,
    width: 120,
  },
  buyerInfoBlock: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
    padding: 12,
  },
  costRemoveButton: {
    alignSelf: 'stretch',
    minHeight: 34,
  },
  approvalRoot: {
    gap: 12,
  },
  approvalListContent: {
    gap: 10,
    paddingBottom: 16,
  },
  approvalCard: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  approvalRowHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  approvalActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  createItemCard: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
    padding: 12,
  },
  itemCardTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '600',
  },
});
