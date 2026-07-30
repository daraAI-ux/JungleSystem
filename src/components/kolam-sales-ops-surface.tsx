import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  canAddItemsToKolamSale,
  canEditKolamSaleDraft,
  canUploadKolamSalePaymentProof,
  formatKolamSaleDeliveryStatusLabel,
  formatKolamSaleItemTypeLabel,
  formatKolamSalePaymentStatusLabel,
  getKolamSaleAllowedDeliveryTransitions,
  getKolamSaleAllowedStatusTransitions,
  getKolamSaleDeliveryStatusIntent,
  getKolamSalePaymentStatusIntent,
  isKolamSaleMarketplaceManaged,
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
  type KolamSaleDeliveryTransitionTarget,
  type KolamSaleLifecycle,
  type KolamSalePaymentStatus,
  type KolamSaleStatusTransitionTarget,
} from '../domain/kolam-sales';
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
import { KolamDateField } from './kolam-date-field';
import { KolamDescriptionList } from './kolam-description-list';
import {
  KolamDropdownSelect,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamTableFilterTrigger } from './kolam-table-filter-trigger';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

type SalesFilterPanel = 'lifecycle' | 'status' | 'delivery' | null;

const FILTER_PANEL_WIDTH = 260;

const LIST_COLUMNS = [
  { id: 'invoice', label: 'Invoice', flex: 1.1 },
  { id: 'buyer', label: 'Pembeli', flex: 1.2 },
  { id: 'source', label: 'Sumber', flex: 0.9 },
  { id: 'total', label: 'Total', flex: 0.9 },
  { id: 'payment', label: 'Bayar', flex: 1 },
  { id: 'delivery', label: 'Kirim', flex: 1 },
] as const;

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

  const renderRow = React.useCallback(
    ({ item }: { item: KolamSale }) => (
      <KolamSalesOpsRow
        sale={item}
        onSelect={() => {
          controller.onSelectSale(item);
          onRouteChange?.(`${KOLAM_SALES_ROOT}/${item.id}`);
        }}
      />
    ),
    [controller, onRouteChange],
  );

  return (
    <View style={styles.listRoot}>
      <View ref={toolbarRef} style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.row}>
          <KolamFormTextField
            onChangeText={setSearchInput}
            placeholder="Cari invoice / pembeli"
            style={kolamTableToolbarStyles.searchInput}
            value={searchInput}
          />
          <View style={kolamTableToolbarStyles.controls}>
            <View ref={lifecycleTriggerRef} collapsable={false}>
              <KolamTableFilterTrigger
                active={
                  activeFilterPanel === 'lifecycle' ||
                  controller.filters.lifecycle !== 'active'
                }
                label={
                  KOLAM_SALE_LIFECYCLE_OPTIONS.find(
                    option => option.value === controller.filters.lifecycle,
                  )?.label ?? 'Berjalan'
                }
                onPress={() => toggleFilterPanel('lifecycle')}
              />
            </View>
            <View ref={statusTriggerRef} collapsable={false}>
              <KolamTableFilterTrigger
                active={
                  activeFilterPanel === 'status' ||
                  Boolean(controller.filters.status)
                }
                label={
                  controller.filters.status
                    ? formatKolamSalePaymentStatusLabel(controller.filters.status)
                    : 'Status bayar'
                }
                onPress={() => toggleFilterPanel('status')}
              />
            </View>
            <View ref={deliveryTriggerRef} collapsable={false}>
              <KolamTableFilterTrigger
                active={
                  activeFilterPanel === 'delivery' ||
                  Boolean(controller.filters.deliveryStatus)
                }
                label={
                  controller.filters.deliveryStatus
                    ? formatKolamSaleDeliveryStatusLabel(
                        controller.filters.deliveryStatus,
                      )
                    : 'Pengiriman'
                }
                onPress={() => toggleFilterPanel('delivery')}
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
            />
            {filtersAppliedCount > 0 ? (
              <KolamButton
                label="Reset"
                muted
                onPress={() => {
                  setSearchInput('');
                  setActiveFilterPanel(null);
                  controller.onClearFilters();
                }}
              />
            ) : null}
            <KolamButton
              disabled={controller.exporting}
              label={controller.exporting ? 'Mengekspor…' : 'Export'}
              onPress={() => {
                void controller.onExportList();
              }}
            />
            <KolamButton
              disabled={controller.loading}
              label="Refresh"
              onPress={() => {
                void controller.onRefresh();
              }}
            />
            <KolamButton
              intent="primary"
              label="Baru"
              onPress={() => onRouteChange?.(`${KOLAM_SALES_ROOT}/create`)}
            />
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

      <View style={styles.analyticsStrip}>
        <Text style={styles.analyticsText}>
          {controller.analytics.totalSales} invoice ·{' '}
          {formatRupiah(controller.analytics.totalRevenue)}
        </Text>
        {controller.notificationSummary.pendingApproval > 0 ? (
          <Pressable
            onPress={() =>
              onRouteChange?.(KOLAM_SALES_DISCOUNT_APPROVAL_ROUTE)
            }
          >
            <KolamStatusBadge
              intent="warning"
              label={`${controller.notificationSummary.pendingApproval} menunggu persetujuan diskon`}
            />
          </Pressable>
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
        style={styles.tableFrame}
      >
        <FlatList
          contentContainerStyle={styles.listContent}
          data={controller.sales}
          extraData={controller.sales}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <KolamEmptyState
                compact
                message={
                  controller.loading
                    ? 'Mengambil daftar dari server Kolam.'
                    : filtersAppliedCount > 0
                      ? 'Coba ubah filter atau kata kunci.'
                      : 'Belum ada invoice pada tampilan ini.'
                }
                title={
                  controller.loading
                    ? 'Memuat penjualan…'
                    : 'Belum ada penjualan'
                }
              />
            </View>
          }
          ListHeaderComponent={
            <View style={styles.headerRow}>
              {LIST_COLUMNS.map(column => (
                <View
                  key={column.id}
                  style={[styles.cell, { flex: column.flex }]}
                >
                  <Text style={styles.headerCellText}>{column.label}</Text>
                </View>
              ))}
            </View>
          }
          renderItem={renderRow}
          style={styles.listFlatList}
        />
      </KolamCatalogListTableShell>
    </View>
  );
}

function KolamSalesOpsRow({
  sale,
  onSelect,
}: {
  sale: KolamSale;
  onSelect: () => void;
}) {
  return (
    <Pressable onPress={onSelect} style={styles.row}>
      <View style={[styles.cell, { flex: LIST_COLUMNS[0].flex }]}>
        <Text numberOfLines={1} style={styles.invoiceCode}>
          {sale.invoiceCode}
        </Text>
        <Text numberOfLines={1} style={styles.metaText}>
          {formatShortDate(sale.transactionDate || sale.createdAt)}
        </Text>
      </View>
      <View style={[styles.cell, { flex: LIST_COLUMNS[1].flex }]}>
        <Text numberOfLines={1} style={styles.primaryText}>
          {sale.buyerLabel}
        </Text>
        <Text numberOfLines={1} style={styles.metaText}>
          {sale.items.length} item
        </Text>
      </View>
      <View
        style={[styles.cell, styles.sourceCell, { flex: LIST_COLUMNS[2].flex }]}
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
      <View style={[styles.cell, { flex: LIST_COLUMNS[3].flex }]}>
        <Text numberOfLines={1} style={styles.primaryText}>
          {formatRupiah(sale.finalTotal)}
        </Text>
      </View>
      <View style={[styles.cell, { flex: LIST_COLUMNS[4].flex }]}>
        <KolamStatusBadge
          intent={getKolamSalePaymentStatusIntent(sale.status)}
          label={formatKolamSalePaymentStatusLabel(sale.status)}
          numberOfLines={2}
        />
      </View>
      <View style={[styles.cell, { flex: LIST_COLUMNS[5].flex }]}>
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
        />
      </View>
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
    <ScrollView
      contentContainerStyle={styles.formContent}
      style={styles.formRoot}
    >
      <View style={styles.detailHeader}>
        <View>
          <Text style={styles.detailTitle}>{title}</Text>
          <Text style={styles.detailSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.headerActions}>
          <KolamButton
            label="Batal"
            onPress={() => onRouteChange?.(backRoute)}
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
          />
        </View>
      </View>

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
                value={form.sourceRefId}
              />
            </FieldShell>
          </View>
          <View style={styles.formSplitCell}>
            {controller.useBuyerInfo ? (
              <FieldShell label="Info pembeli">
                <Text style={styles.metaText}>
                  Sumber ini memakai info pembeli manual (marketplace), bukan
                  daftar pelanggan.
                </Text>
              </FieldShell>
            ) : (
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
                  value={form.customerId}
                />
              </FieldShell>
            )}
          </View>
        </View>

        {controller.useBuyerInfo ? (
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
            <View style={styles.formSplitCell}>
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
          </View>
        ) : null}

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
                value={form.paymentMethodId}
              />
            </FieldShell>
          </View>
          <View style={styles.formSplitCell}>
            <FieldShell label="Catatan">
              <KolamFormTextField
                onChangeText={notes => controller.onChangeForm({ notes })}
                placeholder="Opsional"
                value={form.notes}
              />
            </FieldShell>
          </View>
        </View>

        <View style={styles.formSplitRow}>
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
                value={form.pointsMethod}
              />
            </FieldShell>
          </View>
          {form.pointsMethod === 'manual' ? (
            <View style={styles.formSplitCell}>
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
            </View>
          ) : null}
          <View style={styles.formSplitCell}>
            <FieldShell label="Tanggal transaksi">
              <KolamDateField
                accessibilityLabel="Tanggal transaksi"
                label="Tanggal transaksi"
                onChange={transactionDate =>
                  controller.onChangeForm({ transactionDate })
                }
                placeholder="Pilih tanggal"
                value={form.transactionDate}
              />
            </FieldShell>
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
                    value={item.itemType}
                  />
                </FieldShell>
              </View>
              <View style={styles.formSplitCell}>
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
                <View style={styles.formSplitCell}>
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
              <View style={styles.formSplitCell}>
                <KolamButton
                  label="Hapus"
                  muted
                  onPress={() => controller.onRemoveCustomCost(cost.key)}
                />
              </View>
            </View>
          ))
        )}
      </KolamContentFrame>
    </ScrollView>
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

function KolamSalesOpsDetail({
  controller,
  onRouteChange,
}: {
  controller: KolamSalesController;
  onRouteChange?: (route: string) => void;
}) {
  const sale = controller.selectedSale;
  const [pendingStatus, setPendingStatus] =
    useState<KolamSaleStatusTransitionTarget | null>(null);
  const [pendingDelivery, setPendingDelivery] =
    useState<KolamSaleDeliveryTransitionTarget | null>(null);

  if (controller.loading && !sale) {
    return (
      <KolamContentFrame variant="settingsWebConfig">
        <KolamEmptyState
          message="Mengambil invoice dari server Kolam."
          title="Memuat detail…"
        />
      </KolamContentFrame>
    );
  }

  if (!sale) {
    return (
      <KolamContentFrame style={styles.detailMissing} variant="settingsWebConfig">
        <KolamEmptyState
          message={controller.error || 'Data penjualan tidak tersedia.'}
          title="Invoice tidak ditemukan"
        />
        <KolamButton
          label="Kembali ke daftar"
          onPress={() => onRouteChange?.(KOLAM_SALES_ROOT)}
        />
      </KolamContentFrame>
    );
  }

  const marketplaceManaged = isKolamSaleMarketplaceManaged(sale);
  const allowedTransitions = marketplaceManaged
    ? []
    : getKolamSaleAllowedStatusTransitions(sale.status);
  const canUploadProof =
    !marketplaceManaged && canUploadKolamSalePaymentProof(sale.status);
  const pendingLabel = pendingStatus
    ? formatKolamSalePaymentStatusLabel(pendingStatus)
    : '';
  const isOfflineSource = sale.sourceRef?.type === 'offline';
  const showDeliverySection =
    !marketplaceManaged &&
    (sale.status === 'paid' || sale.status === 'partial_paid');
  const allowedDeliveryTransitions = showDeliverySection
    ? getKolamSaleAllowedDeliveryTransitions(sale.deliveryStatus, {
        isOfflineSource,
      })
    : [];
  const canRequestBiteshipPickup =
    !marketplaceManaged &&
    isOfflineSource &&
    sale.status === 'paid' &&
    (!sale.deliveryStatus || sale.deliveryStatus === 'none');

  return (
    <ScrollView
      contentContainerStyle={styles.detailContent}
      style={styles.detailRoot}
    >
      <View style={styles.detailHeader}>
        <KolamCopyStack
          items={[
            {
              id: 'title',
              text: sale.invoiceCode,
              style: styles.detailTitle,
            },
            {
              id: 'buyer',
              text: sale.buyerLabel,
              style: styles.detailSubtitle,
            },
          ]}
        />
        <View style={styles.headerActions}>
          <KolamButton
            label="Kembali"
            onPress={() => onRouteChange?.(KOLAM_SALES_ROOT)}
          />
          <KolamButton
            disabled={controller.loading || controller.mutating}
            label="Refresh"
            onPress={() => {
              void controller.onRefresh();
            }}
          />
          {canEditKolamSaleDraft(sale) ? (
            <KolamButton
              label="Ubah"
              onPress={() =>
                onRouteChange?.(`${KOLAM_SALES_ROOT}/${sale.id}/edit`)
              }
            />
          ) : null}
          {canAddItemsToKolamSale(sale) ? (
            <KolamButton
              label="Tambah item"
              onPress={() =>
                onRouteChange?.(
                  `${KOLAM_SALES_ROOT}/${sale.id}/edit?mode=add-items`,
                )
              }
            />
          ) : null}
          <KolamButton
            disabled={controller.downloadingInvoice || controller.mutating}
            intent="primary"
            label={
              controller.downloadingInvoice
                ? 'Mengunduh…'
                : 'Unduh invoice PDF'
            }
            onPress={() => {
              void controller.onDownloadInvoice();
            }}
          />
          <KolamButton
            disabled={controller.downloadingInvoice || controller.mutating}
            label={controller.downloadingInvoice ? 'Mengunduh…' : 'Unduh resi'}
            onPress={() => {
              void controller.onDownloadResi();
            }}
          />
        </View>
      </View>

      <View style={styles.badgeRow}>
        <KolamStatusBadge
          intent={getKolamSalePaymentStatusIntent(sale.status)}
          label={formatKolamSalePaymentStatusLabel(sale.status)}
        />
        <KolamStatusBadge
          intent={getKolamSaleDeliveryStatusIntent(
            sale.deliveryStatus,
            sale.status,
          )}
          label={formatKolamSaleDeliveryStatusLabel(
            sale.deliveryStatus,
            sale.status,
          )}
        />
        {marketplaceManaged ? (
          <KolamStatusBadge
            intent="info"
            label="Marketplace otomatis"
          />
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>Aksi status</Text>
      {marketplaceManaged ? (
        <Text style={styles.metaText}>
          Status pembayaran marketplace dikelola otomatis dari platform.
        </Text>
      ) : allowedTransitions.length === 0 ? (
        <>
          <Text style={styles.metaText}>
            {sale.status === 'pending'
              ? 'Menunggu persetujuan finance (ubah via Persetujuan Diskon).'
              : 'Tidak ada transisi status yang tersedia.'}
          </Text>
          {sale.status === 'pending' ? (
            <KolamButton
              label="Ke persetujuan diskon"
              onPress={() =>
                onRouteChange?.(KOLAM_SALES_DISCOUNT_APPROVAL_ROUTE)
              }
            />
          ) : null}
        </>
      ) : (
        <View style={styles.actionButtons}>
          {allowedTransitions.map(status => (
            <KolamButton
              disabled={controller.mutating}
              intent={status === 'cancelled' ? 'danger' : 'primary'}
              key={status}
              label={formatKolamSalePaymentStatusLabel(status)}
              onPress={() => setPendingStatus(status)}
            />
          ))}
        </View>
      )}

      <KolamDescriptionList
        accessibilityLabel="Ringkasan penjualan"
        rows={[
          {
            id: 'buyer',
            label: 'Pembeli',
            value: sale.buyerLabel,
            meta: sale.customer?.phone || sale.buyerInfo?.phone || '',
            tone: 'default',
          },
          {
            id: 'source',
            label: 'Sumber',
            value: sale.sourceRef?.name || '—',
            meta: sale.sourceRef?.type || '',
            tone: 'default',
          },
          {
            id: 'payment-method',
            label: 'Metode bayar',
            value: sale.paymentMethod?.name || '—',
            meta: sale.paymentMethod?.type || '',
            tone: 'default',
          },
          {
            id: 'created',
            label: 'Dibuat',
            value: formatShortDateTime(sale.createdAt) || '—',
            meta: '',
            tone: 'default',
          },
          {
            id: 'transaction',
            label: 'Tanggal transaksi',
            value: formatShortDateTime(sale.transactionDate) || '—',
            meta: '',
            tone: 'default',
          },
        ]}
      />

      <Text style={styles.sectionTitle}>Item</Text>
      {sale.items.length === 0 ? (
        <Text style={styles.metaText}>Tidak ada item.</Text>
      ) : (
        sale.items.map(item => (
          <View key={item.id} style={styles.itemCard}>
            <Text style={styles.primaryText}>{item.title}</Text>
            <Text style={styles.metaText}>
              {formatKolamSaleItemTypeLabel(item.itemType)}
              {item.variantLabel ? ` · ${item.variantLabel}` : ''}
              {item.sku ? ` · ${item.sku}` : ''}
              {item.voucherCode ? ` · Voucher: ${item.voucherCode}` : ''}
            </Text>
            <Text style={styles.metaText}>
              {item.quantity} × {formatRupiah(item.unitPrice)} ={' '}
              {formatRupiah(item.subtotal)}
            </Text>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>Total</Text>
      <KolamDescriptionList
        accessibilityLabel="Total penjualan"
        rows={[
          {
            id: 'subtotal',
            label: 'Subtotal',
            value: formatRupiah(sale.total),
            meta: '',
            tone: 'default',
          },
          {
            id: 'shipping',
            label: 'Ongkir',
            value: formatRupiah(sale.shippingCost),
            meta: '',
            tone: 'default',
          },
          {
            id: 'final',
            label: 'Total akhir',
            value: formatRupiah(sale.finalTotal),
            meta: '',
            tone: 'success',
          },
          {
            id: 'paid',
            label: 'Sudah dibayar',
            value: formatRupiah(sale.paidAmount),
            meta: '',
            tone: 'default',
          },
        ]}
      />

      {showDeliverySection ? (
        <>
          <Text style={styles.sectionTitle}>Pengiriman</Text>
          {allowedDeliveryTransitions.length === 0 ? (
            <Text style={styles.metaText}>
              Tidak ada transisi pengiriman yang tersedia.
            </Text>
          ) : (
            <View style={styles.actionButtons}>
              {allowedDeliveryTransitions.map(target => (
                <KolamButton
                  disabled={controller.mutating}
                  intent="primary"
                  key={target}
                  label={formatKolamSaleDeliveryStatusLabel(target)}
                  onPress={() => setPendingDelivery(target)}
                />
              ))}
            </View>
          )}
          {canRequestBiteshipPickup ? (
            <KolamButton
              disabled={controller.mutating}
              label="Request pickup Biteship"
              onPress={() => {
                void controller.onRequestBiteshipPickup();
              }}
            />
          ) : null}
        </>
      ) : marketplaceManaged ? (
        <Text style={styles.metaText}>
          Fulfillment pengiriman marketplace berjalan otomatis dari platform.
        </Text>
      ) : null}

      <View style={styles.proofHeader}>
        <Text style={styles.sectionTitle}>
          Bukti pembayaran ({sale.paymentProofs.length})
        </Text>
        {canUploadProof ? (
          <KolamButton
            disabled={controller.mutating}
            label={controller.mutating ? 'Mengunggah…' : 'Unggah bukti'}
            onPress={() => {
              void (async () => {
                const uri = await controller.onPickImage();
                if (uri) {
                  await controller.onUploadPaymentProof(uri);
                }
              })();
            }}
          />
        ) : null}
      </View>
      {!canUploadProof && !marketplaceManaged ? (
        <Text style={styles.metaText}>
          Unggah bukti tersedia saat status Menunggu bayar / Bayar sebagian.
        </Text>
      ) : null}
      {sale.paymentProofs.length === 0 ? (
        <Text style={styles.metaText}>Belum ada bukti pembayaran.</Text>
      ) : (
        <View style={styles.proofRow}>
          {sale.paymentProofs.map(proof => (
            <View key={proof.id} style={styles.proofCard}>
              {proof.uri ? (
                <KolamRemoteImage
                  accessibilityLabel={proof.note || 'Bukti pembayaran'}
                  sourceUri={proof.uri}
                  style={styles.proofImage}
                />
              ) : (
                <Text style={styles.metaText}>{proof.path}</Text>
              )}
              {!marketplaceManaged ? (
                <View style={styles.proofActions}>
                  <KolamButton
                    disabled={controller.mutating}
                    label="Hapus"
                    muted
                    onPress={() => {
                      void controller.onDeletePaymentProof(proof.id);
                    }}
                  />
                  <KolamButton
                    disabled={controller.mutating}
                    label="Ganti"
                    onPress={() => {
                      void (async () => {
                        const uri = await controller.onPickImage();
                        if (uri) {
                          await controller.onReplacePaymentProof(proof.id, uri);
                        }
                      })();
                    }}
                  />
                </View>
              ) : null}
            </View>
          ))}
        </View>
      )}

      {controller.livestockAllocations.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Alokasi livestock pending</Text>
          {controller.livestockAllocations.map(row => (
            <Text key={row.id} style={styles.metaText}>
              {row.label}
              {row.status ? ` · ${row.status}` : ''}
            </Text>
          ))}
        </>
      ) : null}

      {sale.saleHistories.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>Riwayat status</Text>
          {sale.saleHistories.map(history => (
            <View key={history.id} style={styles.historyRow}>
              <Text style={styles.primaryText}>
                {formatKolamSalePaymentStatusLabel(history.status) ||
                  history.status}
              </Text>
              <Text style={styles.metaText}>
                {formatShortDateTime(history.changedAt)}
                {history.changedByName ? ` · ${history.changedByName}` : ''}
              </Text>
              {history.note ? (
                <Text style={styles.metaText}>{history.note}</Text>
              ) : null}
            </View>
          ))}
        </>
      ) : null}

      <KolamConfirmDialog
        cancelLabel="Batal"
        confirmLabel={
          pendingStatus === 'cancelled' ? 'Batalkan penjualan' : 'Ubah status'
        }
        destructive={pendingStatus === 'cancelled'}
        message={
          pendingStatus === 'paid'
            ? `Ubah status ${sale.invoiceCode} menjadi Lunas? Stok dan wallet akan diproses di server.`
            : pendingStatus === 'cancelled'
              ? `Batalkan ${sale.invoiceCode}? Stok/wallet dapat dikembalikan sesuai aturan backend.`
              : `Ubah status ${sale.invoiceCode} menjadi ${pendingLabel}?`
        }
        onCancel={() => setPendingStatus(null)}
        onConfirm={() => {
          const next = pendingStatus;
          setPendingStatus(null);
          if (next) {
            void controller.onUpdateStatus(next);
          }
        }}
        title="Konfirmasi status"
        visible={Boolean(pendingStatus)}
      />

      <KolamConfirmDialog
        cancelLabel="Batal"
        confirmLabel="Ubah pengiriman"
        message={`Ubah status pengiriman ${sale.invoiceCode} menjadi ${
          pendingDelivery
            ? formatKolamSaleDeliveryStatusLabel(pendingDelivery)
            : ''
        }?`}
        onCancel={() => setPendingDelivery(null)}
        onConfirm={() => {
          const next = pendingDelivery;
          setPendingDelivery(null);
          if (next) {
            void controller.onUpdateDelivery(next);
          }
        }}
        title="Konfirmasi pengiriman"
        visible={Boolean(pendingDelivery)}
      />
    </ScrollView>
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
      <View style={styles.approvalToolbar}>
        <View>
          <Text style={styles.sectionTitle}>Persetujuan diskon</Text>
          <Text style={styles.metaText}>
            Invoice dengan status Menunggu persetujuan finance.
          </Text>
        </View>
        <KolamButton
          disabled={controller.loading}
          label="Refresh"
          onPress={() => {
            void controller.onRefresh();
          }}
        />
      </View>

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

function formatShortDateTime(value: string) {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    minHeight: 0,
    gap: 12,
  },
  listSurface: {
    overflow: 'visible',
  },
  listRoot: {
    flex: 1,
    minHeight: 0,
    gap: 12,
    overflow: 'visible',
  },
  banner: {
    alignSelf: 'flex-start',
  },
  toolbarWrap: {
    elevation: 1000,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
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
  analyticsStrip: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 4,
  },
  analyticsText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
  },
  tableFrame: {
    flex: 1,
    minHeight: 0,
  },
  listFlatList: {
    flexGrow: 0,
  },
  listContent: {
    flexGrow: 0,
  },
  emptyWrap: {
    paddingVertical: 24,
  },
  headerRow: {
    backgroundColor: V.colors.tableHeader,
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  headerCellText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
  },
  row: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  cell: {
    gap: 2,
    minWidth: 0,
  },
  sourceCell: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
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
    flex: 1,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formSplitCell: {
    flexGrow: 1,
    minWidth: 220,
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
  approvalRoot: {
    flex: 1,
    gap: 12,
    minHeight: 0,
  },
  approvalToolbar: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  approvalListContent: {
    gap: 10,
    paddingBottom: 24,
  },
  approvalCard: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
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
});
