import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { KolamStockTransaction } from '../domain/kolam-stock-transaction';
import {
  KOLAM_STOCK_TRANSACTION_ROOT,
  canCancelFinanceStockTransaction,
  canVerifyStockTransaction,
  crossSyncOriginLabel,
  crossSyncPlatformLabel,
  crossSyncSummaryLabel,
  crossSyncTargetStatusLabel,
  hasStockTransactionCrossSyncAudit,
  hasStockTransactionFinanceVerification,
  isKolamStockTransactionListRoute,
} from '../domain/kolam-stock-transaction';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { getKolamFileUrl } from '../lib/file-url';
import {
  useKolamStockTransactionController,
  type KolamStockTransactionController,
} from '../hooks/use-kolam-stock-transaction-controller';
import { KolamButton } from './kolam-button';
import { KolamConfirmDialog } from './kolam-confirm-dialog';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDescriptionList } from './kolam-description-list';
import {
  KolamDropdownSelect,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamStatusBadge } from './kolam-status-badge';

const LIST_COLUMNS = [
  { id: 'target', label: 'Target', flex: 1.4 },
  { id: 'variant', label: 'Varian', flex: 0.9 },
  { id: 'type', label: 'Tipe', flex: 0.6 },
  { id: 'source', label: 'Sumber', flex: 0.9 },
  { id: 'sync', label: 'Sync MP', flex: 0.8 },
  { id: 'status', label: 'Status', flex: 1 },
  { id: 'qty', label: 'Qty', flex: 0.5 },
  { id: 'before', label: 'Sebelum', flex: 0.6 },
  { id: 'after', label: 'Sesudah', flex: 0.6 },
  { id: 'delta', label: 'Selisih', flex: 0.6 },
] as const;

export function KolamStockTransactionSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamStockTransactionController(route);

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
          numberOfLines={2}
          style={styles.errorBadge}
        />
      ) : null}
      {controller.statusMessage ? (
        <KolamStatusBadge
          intent="success"
          label={controller.statusMessage}
          numberOfLines={2}
          style={styles.errorBadge}
        />
      ) : null}
      {controller.mode === 'list' && isKolamStockTransactionListRoute(route) ? (
        <KolamStockTransactionList
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : controller.mode === 'detail' ? (
        <KolamStockTransactionDetail
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : (
        <KolamStockTransactionPlaceholder onRouteChange={onRouteChange} />
      )}
    </View>
  );
}

function KolamStockTransactionPlaceholder({
  onRouteChange,
}: {
  onRouteChange?: (route: string) => void;
}) {
  return (
    <View style={styles.placeholder}>
      <KolamCopyStack
        items={[
          { id: 'title', text: 'Opname cepat', style: styles.title },
          {
            id: 'msg',
            text: 'Form opname cepat menyusul di Batch 3.',
            style: styles.subtitle,
          },
        ]}
      />
      <KolamButton
        label="Kembali ke daftar"
        onPress={() => onRouteChange?.(KOLAM_STOCK_TRANSACTION_ROOT)}
      />
    </View>
  );
}

function KolamStockTransactionDetail({
  controller,
  onRouteChange,
}: {
  controller: KolamStockTransactionController;
  onRouteChange?: (route: string) => void;
}) {
  const [cancelConfirmOpen, setCancelConfirmOpen] = React.useState(false);
  const tx = controller.selectedTransaction;
  const showFinance = tx
    ? hasStockTransactionFinanceVerification(tx.source)
    : false;
  const showVerify = tx ? canVerifyStockTransaction(tx) : false;
  const showCancelFinance = tx ? canCancelFinanceStockTransaction(tx) : false;
  const photoItems =
    tx?.photos.map((photo, index) => ({
      id: `${photo}-${index}`,
      uri: getKolamFileUrl(photo) ?? photo,
      title: `Foto bukti ${index + 1}`,
    })) ?? [];

  if (!tx && controller.loading) {
    return (
      <View style={styles.placeholder}>
        <KolamEmptyState
          compact
          message="Mengambil data transaksi dari server."
          title="Memuat detail…"
        />
      </View>
    );
  }

  if (!tx) {
    return (
      <View style={styles.placeholder}>
        <KolamEmptyState
          compact
          message="Transaksi tidak ditemukan atau gagal dimuat."
          title="Detail tidak tersedia"
        />
        <KolamButton
          label="Kembali ke daftar"
          onPress={() => onRouteChange?.(KOLAM_STOCK_TRANSACTION_ROOT)}
        />
      </View>
    );
  }

  const infoRows: Array<{
    id: string;
    label: string;
    value: string;
    meta: string;
    tone: 'default' | 'success' | 'warning' | 'danger';
  }> = [
    {
      id: 'id',
      label: 'ID transaksi',
      value: tx.id,
      meta: '',
      tone: 'default',
    },
    {
      id: 'type',
      label: 'Tipe',
      value: formatType(tx.type),
      meta: '',
      tone: 'default',
    },
    {
      id: 'source',
      label: 'Sumber',
      value: tx.sourceLabel,
      meta: '',
      tone: 'default',
    },
  ];

  if (tx.enclosureLabel) {
    infoRows.push({
      id: 'enclosure',
      label: 'Kandang',
      value: tx.enclosureLabel,
      meta: tx.enclosureHref || '',
      tone: 'default',
    });
  }
  if (tx.reference) {
    infoRows.push({
      id: 'reference',
      label: 'Referensi',
      value: tx.reference.label,
      meta: tx.reference.sourceModel,
      tone: 'default',
    });
  }

  infoRows.push(
    {
      id: 'target',
      label: 'Target',
      value: tx.target?.label || '—',
      meta: tx.target
        ? `${targetKindLabel(tx.target.kind)} · ${tx.target.sku}`
        : '',
      tone: 'default',
    },
    {
      id: 'variant',
      label: 'Varian',
      value: tx.variantLabel,
      meta: '',
      tone: 'default',
    },
    {
      id: 'stock',
      label: 'Perubahan stok',
      value: `${formatNumber(tx.before)} → ${formatNumber(tx.after)} (${formatSigned(
        tx.delta,
      )})`,
      meta: tx.computed?.isEnclosureOnly
        ? `Stok jual global: ${formatNumber(tx.globalBefore)} → ${formatNumber(
            tx.globalAfter,
          )}`
        : tx.computed?.displayScopeLabel || '',
      tone: 'default',
    },
    {
      id: 'qty',
      label: 'Kuantitas',
      value: formatNumber(tx.quantity),
      meta: '',
      tone: 'default',
    },
    {
      id: 'reason',
      label: 'Alasan',
      value: tx.reason || 'Tidak ada alasan',
      meta: '',
      tone: 'default',
    },
  );

  if (showFinance) {
    infoRows.push(
      {
        id: 'verification',
        label: 'Status verifikasi',
        value: tx.statusLabel,
        meta: tx.verificationHint || '',
        tone:
          tx.status === 'verified' || tx.financeCancelled
            ? 'success'
            : 'warning',
      },
      {
        id: 'finance-status',
        label: 'Status finance',
        value: tx.financeStatusLabel,
        meta: tx.financeStatusHint || '',
        tone: tx.financeCancelled
          ? 'warning'
          : tx.walletTransaction?.confirmStatus === 'confirmed'
          ? 'success'
          : 'default',
      },
    );
  }

  if (showFinance && tx.verifiedAt) {
    infoRows.push({
      id: 'verified-at',
      label: 'Diverifikasi pada',
      value: formatDateTime(tx.verifiedAt),
      meta: tx.verifiedBy?.name || '',
      tone: 'default',
    });
  }

  infoRows.push(
    {
      id: 'created-by',
      label: 'Dibuat oleh',
      value: tx.createdBy?.name || '—',
      meta: '',
      tone: 'default',
    },
    {
      id: 'created-at',
      label: 'Dibuat pada',
      value: formatDateTime(tx.createdAt),
      meta: '',
      tone: 'default',
    },
  );

  return (
    <View style={styles.detailRoot}>
      <View style={styles.headerBlock}>
        <KolamCopyStack
          items={[
            {
              id: 'title',
              text: `Transaksi Stok #${tx.id.slice(-8)}`,
              style: styles.title,
            },
            {
              id: 'desc',
              text: tx.reason || 'Detail transaksi stok dan informasi terkait',
              style: styles.subtitle,
            },
          ]}
        />
        <View style={styles.headerActions}>
          <KolamButton
            disabled={controller.loading || controller.mutating}
            label="Refresh"
            onPress={() => {
              void controller.onRefresh();
            }}
          />
          <KolamButton
            label="Daftar"
            onPress={() => onRouteChange?.(KOLAM_STOCK_TRANSACTION_ROOT)}
          />
          {showVerify ? (
            <KolamButton
              disabled={controller.mutating}
              intent="primary"
              label={
                controller.mutating ? 'Memproses…' : 'Verifikasi Finance'
              }
              onPress={() => {
                void controller.onVerify();
              }}
            />
          ) : null}
          {showCancelFinance ? (
            <KolamButton
              disabled={controller.mutating}
              label="Batalkan Finance"
              onPress={() => setCancelConfirmOpen(true)}
            />
          ) : null}
        </View>
      </View>

      {tx.target?.href ? (
        <View style={styles.headerActions}>
          <KolamButton
            label={`Buka ${targetKindLabel(tx.target.kind)}`}
            onPress={() => onRouteChange?.(tx.target!.href!)}
          />
        </View>
      ) : null}

      <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
        <Text style={styles.sectionTitle}>Informasi transaksi</Text>
        <KolamDescriptionList
          accessibilityLabel="Detail transaksi stok"
          rows={infoRows}
        />
      </KolamContentFrame>

      {hasStockTransactionCrossSyncAudit(tx.crossSync) && tx.crossSync ? (
        <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
          <Text style={styles.sectionTitle}>Sinkron marketplace</Text>
          <Text style={styles.cellText}>
            {crossSyncSummaryLabel(tx.crossSync.summary)}
          </Text>
          {tx.crossSync.originPlatform ? (
            <Text style={styles.metaText}>
              Asal: {crossSyncOriginLabel(tx.crossSync.originPlatform)}
            </Text>
          ) : null}
          {tx.crossSync.sku ? (
            <Text style={styles.metaText}>
              SKU {tx.crossSync.sku}
              {tx.crossSync.targetStock != null
                ? ` → stok target ${tx.crossSync.targetStock}`
                : ''}
            </Text>
          ) : null}
          {tx.crossSync.targets.length ? (
            tx.crossSync.targets.map(target => (
              <View key={target.platform} style={styles.crossSyncTarget}>
                <Text style={styles.cellText}>
                  {crossSyncPlatformLabel(target.platform)} ·{' '}
                  {crossSyncTargetStatusLabel(target.status)}
                </Text>
                {target.taskId ? (
                  <Text style={styles.metaText}>Task: {target.taskId}</Text>
                ) : null}
                {target.error ? (
                  <Text style={styles.dangerText}>{target.error}</Text>
                ) : null}
                {target.completedAt ? (
                  <Text style={styles.metaText}>
                    Selesai: {formatDateTime(target.completedAt)}
                  </Text>
                ) : target.dispatchedAt ? (
                  <Text style={styles.metaText}>
                    Dikirim: {formatDateTime(target.dispatchedAt)}
                  </Text>
                ) : null}
              </View>
            ))
          ) : (
            <Text style={styles.metaText}>
              Belum ada target platform tercatat.
            </Text>
          )}
        </KolamContentFrame>
      ) : null}

      {showFinance ? (
        <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
          <Text style={styles.sectionTitle}>Finance</Text>
          {tx.financeCancelled ? (
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>Finance dibatalkan</Text>
              <Text style={styles.metaText}>
                {formatDateTime(tx.financeCancelledAt)}
                {tx.financeCancelledBy
                  ? ` · ${tx.financeCancelledBy.name}`
                  : ''}
              </Text>
            </View>
          ) : tx.walletTransaction ? (
            <>
              <KolamDescriptionList
                accessibilityLabel="Detail finance transaksi stok"
                rows={[
                  {
                    id: 'wallet',
                    label: 'Dompet',
                    value: tx.walletTransaction.walletName,
                    meta: '',
                    tone: 'default',
                  },
                  {
                    id: 'amount',
                    label: 'Jumlah',
                    value: formatCurrency(tx.walletTransaction.amount),
                    meta: '',
                    tone: 'default',
                  },
                  {
                    id: 'wallet-status',
                    label: 'Status',
                    value: tx.walletTransaction.confirmStatus,
                    meta: '',
                    tone:
                      tx.walletTransaction.confirmStatus === 'confirmed'
                        ? 'success'
                        : tx.walletTransaction.confirmStatus === 'rejected'
                        ? 'danger'
                        : 'warning',
                  },
                ]}
              />
              <Text style={styles.metaText}>
                Data dompet di atas hanya catatan legacy/audit.
              </Text>
            </>
          ) : (
            <Text style={styles.metaText}>
              Lanjutkan proses verifikasi finance.
            </Text>
          )}
        </KolamContentFrame>
      ) : null}

      {photoItems.length ? (
        <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
          <Text style={styles.sectionTitle}>Foto bukti</Text>
          <Text style={styles.metaText}>
            {photoItems.length} foto terlampir
          </Text>
          <View style={styles.photoGrid}>
            {photoItems.map((photo, index) => (
              <KolamRemoteImage
                key={photo.id}
                accessibilityLabel={photo.title}
                previewIndex={index}
                previewItems={photoItems}
                sourceUri={photo.uri}
                style={styles.photoThumb}
              />
            ))}
          </View>
        </KolamContentFrame>
      ) : null}

      <KolamConfirmDialog
        cancelLabel="Batal"
        confirmLabel="Batalkan finance"
        destructive
        message="Putuskan transaksi keuangan dari stock opname ini. Hanya perubahan stok yang tetap; tidak ada uang masuk atau keluar. Lanjutkan?"
        onCancel={() => setCancelConfirmOpen(false)}
        onConfirm={() => {
          void controller.onCancelFinance().then(ok => {
            if (ok) {
              setCancelConfirmOpen(false);
            }
          });
        }}
        title="Batalkan finance"
        visible={cancelConfirmOpen}
      />
    </View>
  );
}

function KolamStockTransactionList({
  controller,
  onRouteChange,
}: {
  controller: KolamStockTransactionController;
  onRouteChange?: (route: string) => void;
}) {
  const [searchInput, setSearchInput] = React.useState(controller.filters.search);
  const pageCount = Math.max(1, controller.pagination.totalPages);
  const safePage = Math.min(Math.max(controller.pagination.page, 1), pageCount);
  const filtersAppliedCount = [
    controller.filters.search,
    controller.filters.status,
    controller.filters.productId,
    controller.filters.speciesId,
    controller.filters.stockOpnameId,
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
  }, [
    controller.filters.search,
    controller.onSearchChange,
    searchInput,
  ]);

  const targetFilterValue = controller.filters.productId
    ? `product:${controller.filters.productId}`
    : controller.filters.speciesId
    ? `species:${controller.filters.speciesId}`
    : 'all';

  const targetOptions = React.useMemo(() => {
    const productOpts = controller.productOptions.map(item => ({
      label: `${item.name}${item.sku ? ` (${item.sku})` : ''}`,
      value: `product:${item.id}` as const,
    }));
    const speciesOpts = controller.speciesOptions.map(item => ({
      label: `${item.scientificName || item.displayName}${
        item.sku ? ` (${item.sku})` : ''
      }`,
      value: `species:${item.id}` as const,
    }));
    return [
      { label: 'Semua produk & spesies', value: 'all' as const },
      ...productOpts,
      ...speciesOpts,
    ];
  }, [controller.productOptions, controller.speciesOptions]);

  const renderRow = React.useCallback(
    ({ item }: { item: KolamStockTransaction }) => (
      <Pressable
        accessibilityRole="button"
        onPress={() =>
          onRouteChange?.(`${KOLAM_STOCK_TRANSACTION_ROOT}/${item.id}`)
        }
        style={({ pressed }) => [
          styles.row,
          pressed ? styles.rowPressed : null,
        ]}
      >
        <View style={[styles.cell, { flex: 1.4 }]}>
          <Text numberOfLines={2} style={styles.primaryText}>
            {item.target?.label || '—'}
          </Text>
          <Text numberOfLines={1} style={styles.metaText}>
            {item.target?.sku || '—'}
          </Text>
        </View>
        <View style={[styles.cell, { flex: 0.9 }]}>
          <Text numberOfLines={2} style={styles.cellText}>
            {item.variantLabel}
          </Text>
        </View>
        <View style={[styles.cell, { flex: 0.6 }]}>
          <Text style={styles.cellText}>{formatType(item.type)}</Text>
        </View>
        <View style={[styles.cell, { flex: 0.9 }]}>
          <Text numberOfLines={2} style={styles.cellText}>
            {item.sourceLabel}
          </Text>
        </View>
        <View style={[styles.cell, { flex: 0.8 }]}>
          <Text numberOfLines={2} style={styles.metaText}>
            {crossSyncSummaryLabel(item.crossSync?.summary) || '—'}
          </Text>
        </View>
        <View style={[styles.cell, { flex: 1 }]}>
          <Text numberOfLines={1} style={styles.cellText}>
            {item.statusLabel}
          </Text>
          {item.financeNote ? (
            <Text numberOfLines={2} style={styles.metaText}>
              {item.financeNote}
            </Text>
          ) : null}
        </View>
        <View style={[styles.cell, { flex: 0.5 }]}>
          <Text style={styles.numText}>{formatNumber(item.quantity)}</Text>
        </View>
        <View style={[styles.cell, { flex: 0.6 }]}>
          <Text style={styles.numText}>{formatNumber(item.before)}</Text>
        </View>
        <View style={[styles.cell, { flex: 0.6 }]}>
          <Text style={styles.numText}>{formatNumber(item.after)}</Text>
        </View>
        <View style={[styles.cell, { flex: 0.6 }]}>
          <Text
            style={[
              styles.numText,
              item.delta > 0
                ? styles.deltaPositive
                : item.delta < 0
                ? styles.deltaNegative
                : null,
            ]}
          >
            {formatSigned(item.delta)}
          </Text>
        </View>
      </Pressable>
    ),
    [onRouteChange],
  );

  return (
    <View style={styles.listRoot}>
      <View style={styles.headerBlock}>
        <KolamCopyStack
          items={[
            {
              id: 'title',
              text: 'Transaksi Stok',
              style: styles.title,
            },
            {
              id: 'desc',
              text: controller.filters.stockOpnameId
                ? `Difilter menurut dokumen stock opname (ID: ${controller.filters.stockOpnameId})`
                : 'Daftar transaksi stok gudang',
              style: styles.subtitle,
            },
          ]}
        />
        <View style={styles.headerActions}>
          <KolamButton
            disabled={controller.loading}
            label="Refresh"
            onPress={() => {
              void controller.onRefresh();
            }}
          />
          <KolamButton
            disabled={controller.exporting || controller.loading}
            label={controller.exporting ? 'Mengekspor…' : 'Ekspor'}
            onPress={() => {
              void controller.onExport();
            }}
          />
          {filtersAppliedCount > 0 ? (
            <KolamButton
              label="Hapus filter"
              onPress={() => {
                setSearchInput('');
                controller.onClearFilters();
              }}
            />
          ) : null}
        </View>
      </View>

      <KolamContentFrame style={styles.filterFrame} variant="settingsWebConfig">
        <KolamFormTextField
          onChangeText={setSearchInput}
          placeholder="Cari nama, SKU, atau alasan…"
          value={searchInput}
        />
        <View style={styles.filterGrid}>
          <View style={styles.filterItem}>
            <KolamDropdownSelect
              label="Produk / spesies"
              onChange={value => {
                if (value === 'all') {
                  controller.onChangeFilters({ productId: '', speciesId: '' });
                  return;
                }
                if (value.startsWith('product:')) {
                  controller.onChangeFilters({
                    productId: value.slice('product:'.length),
                    speciesId: '',
                  });
                  return;
                }
                if (value.startsWith('species:')) {
                  controller.onChangeFilters({
                    productId: '',
                    speciesId: value.slice('species:'.length),
                  });
                }
              }}
              options={targetOptions}
              searchable
              searchPlaceholder="Cari produk atau spesies…"
              value={targetFilterValue}
            />
          </View>
          <View style={styles.filterItem}>
            <KolamDropdownSelect
              label="Status"
              onChange={value => {
                controller.onChangeFilters({
                  status:
                    value === 'verified' || value === 'unverified' ? value : '',
                });
              }}
              options={[
                { label: 'Semua status', value: 'all' },
                { label: 'Terverifikasi', value: 'verified' },
                { label: 'Belum terverifikasi', value: 'unverified' },
              ]}
              value={controller.filters.status || 'all'}
            />
          </View>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Mulai (YYYY-MM-DD)</Text>
            <KolamFormTextField
              onChangeText={value =>
                controller.onChangeFilters({ startDate: value.trim() })
              }
              placeholder="2026-01-01"
              value={controller.filters.startDate}
            />
          </View>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Sampai (YYYY-MM-DD)</Text>
            <KolamFormTextField
              onChangeText={value =>
                controller.onChangeFilters({ endDate: value.trim() })
              }
              placeholder="2026-12-31"
              value={controller.filters.endDate}
            />
          </View>
        </View>
      </KolamContentFrame>

      {controller.pendingReturns.length ? (
        <KolamContentFrame style={styles.pendingFrame} variant="settingsWebConfig">
          <Text style={styles.pendingTitle}>Ekspektasi retur tertunda</Text>
          {controller.pendingReturns.map(item => (
            <Text key={item.complaintId} style={styles.pendingRow}>
              {item.ticketCode} · qty {formatNumber(item.quantity)}
              {item.saleInvoiceCode ? ` · ${item.saleInvoiceCode}` : ''}
            </Text>
          ))}
        </KolamContentFrame>
      ) : null}

      <KolamContentFrame style={styles.tableFrame} variant="settingsWebConfig">
        <FlatList
          data={controller.transactions}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <KolamEmptyState
                compact
                message="Sesuaikan filter atau muat ulang dari server."
                title={
                  controller.loading
                    ? 'Memuat transaksi stok…'
                    : 'Belum ada transaksi'
                }
              />
            </View>
          }
          ListHeaderComponent={
            <View style={styles.headerRow}>
              {LIST_COLUMNS.map(column => (
                <View key={column.id} style={[styles.cell, { flex: column.flex }]}>
                  <Text style={styles.headerCellText}>{column.label}</Text>
                </View>
              ))}
            </View>
          }
          renderItem={renderRow}
          style={styles.listFlatList}
        />
      </KolamContentFrame>

      <KolamTableFooterControls
        onPageSizeChange={controller.onLimitChange}
        page={controller.pagination.page}
        pageSize={controller.pagination.limit}
        total={controller.pagination.total}
      >
        {pageCount > 1 ? (
          <View style={styles.paginationBar}>
            <KolamButton
              disabled={safePage <= 1}
              label="Sebelumnya"
              onPress={() =>
                controller.onPageChange(Math.max(1, safePage - 1))
              }
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
    </View>
  );
}

function formatType(type: string) {
  if (type === 'in') {
    return 'Masuk';
  }
  if (type === 'out') {
    return 'Keluar';
  }
  if (type === 'adjust') {
    return 'Sesuaikan';
  }
  return type || '—';
}

function formatNumber(value: number) {
  return Number.isFinite(value) ? String(value) : '—';
}

function formatSigned(value: number) {
  if (!Number.isFinite(value)) {
    return '—';
  }
  if (value > 0) {
    return `+${value}`;
  }
  return String(value);
}

function formatCurrency(value: number) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
}

function formatDateTime(value: string) {
  if (!value) {
    return '—';
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

function targetKindLabel(kind: string) {
  switch (kind) {
    case 'product':
      return 'Produk';
    case 'species':
      return 'Spesies';
    case 'packing':
      return 'Kemasan';
    case 'freyer':
      return 'Freyer';
    case 'teranura':
      return 'Teranura';
    case 'service':
      return 'Layanan';
    default:
      return 'Target';
  }
}

const styles = StyleSheet.create({
  surface: {
    gap: 12,
  },
  listSurface: {
    flex: 1,
    minHeight: 0,
  },
  listRoot: {
    flex: 1,
    minHeight: 0,
    gap: 12,
  },
  detailRoot: {
    gap: 12,
  },
  errorBadge: {
    alignSelf: 'stretch',
  },
  headerBlock: {
    gap: 8,
  },
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    color: V.colors.fg,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: V.colors.mutedFg,
    fontSize: 13,
  },
  filterFrame: {
    gap: 12,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterItem: {
    flexGrow: 1,
    flexBasis: 220,
    minWidth: 200,
    gap: 4,
  },
  filterLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
  },
  pendingFrame: {
    gap: 4,
  },
  pendingTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  pendingRow: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  tableFrame: {
    flex: 1,
    minHeight: 0,
  },
  listFlatList: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: V.colors.border,
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 4,
  },
  headerCellText: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: V.colors.border,
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 4,
  },
  rowPressed: {
    backgroundColor: V.colors.muted,
  },
  cell: {
    minWidth: 0,
  },
  primaryText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  cellText: {
    color: V.colors.fg,
    fontSize: 12,
  },
  metaText: {
    color: V.colors.mutedFg,
    fontSize: 11,
  },
  dangerText: {
    color: V.colors.danger,
    fontSize: 11,
  },
  numText: {
    color: V.colors.fg,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  deltaPositive: {
    color: V.colors.success,
  },
  deltaNegative: {
    color: V.colors.danger,
  },
  emptyWrap: {
    paddingVertical: 24,
  },
  paginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  placeholder: {
    gap: 12,
    paddingVertical: 16,
  },
  detailCard: {
    gap: 8,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '700',
  },
  crossSyncTarget: {
    gap: 2,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: V.colors.border,
  },
  warningBox: {
    gap: 4,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: V.colors.warning,
    backgroundColor: V.colors.warningSoft,
  },
  warningTitle: {
    color: V.colors.warning,
    fontSize: 13,
    fontWeight: '600',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoThumb: {
    width: 148,
    height: 96,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: V.colors.border,
    backgroundColor: V.colors.muted,
  },
});
