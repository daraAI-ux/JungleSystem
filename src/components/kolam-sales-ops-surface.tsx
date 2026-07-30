import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  canUploadKolamSalePaymentProof,
  formatKolamSaleDeliveryStatusLabel,
  formatKolamSaleItemTypeLabel,
  formatKolamSalePaymentStatusLabel,
  getKolamSaleAllowedStatusTransitions,
  getKolamSaleDeliveryStatusIntent,
  getKolamSalePaymentStatusIntent,
  isKolamSaleMarketplaceManaged,
  isKolamSalesListRoute,
  KOLAM_SALE_DELIVERY_STATUS_OPTIONS,
  KOLAM_SALE_LIFECYCLE_OPTIONS,
  KOLAM_SALE_PAYMENT_STATUS_OPTIONS,
  KOLAM_SALES_ROOT,
  type KolamSale,
  type KolamSaleDeliveryStatus,
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
import { KolamTableFooterControls } from './kolam-dropdown-select';
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

/**
 * Kolam backoffice penjualan (FE `/sales`).
 * P0: list + detail + status/proof/invoice.
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
      {controller.mode === 'list' && isKolamSalesListRoute(route) ? (
        <KolamSalesOpsList
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
              disabled={controller.loading}
              label="Refresh"
              onPress={() => {
                void controller.onRefresh();
              }}
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
        <Text style={styles.metaText}>
          {sale.status === 'pending'
            ? 'Menunggu persetujuan finance (ubah via Persetujuan Diskon).'
            : 'Tidak ada transisi status yang tersedia.'}
        </Text>
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
          {sale.paymentProofs.map(proof =>
            proof.uri ? (
              <KolamRemoteImage
                key={proof.id}
                accessibilityLabel={proof.note || 'Bukti pembayaran'}
                sourceUri={proof.uri}
                style={styles.proofImage}
              />
            ) : (
              <Text key={proof.id} style={styles.metaText}>
                {proof.path}
              </Text>
            ),
          )}
        </View>
      )}

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
    </ScrollView>
  );
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
  proofImage: {
    borderRadius: 8,
    height: 120,
    width: 120,
  },
  historyRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
    paddingVertical: 8,
  },
});
