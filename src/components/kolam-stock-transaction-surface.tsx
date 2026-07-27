import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { KolamStockTransaction } from '../domain/kolam-stock-transaction';
import {
  KOLAM_STOCK_TRANSACTION_ROOT,
  isKolamStockTransactionListRoute,
} from '../domain/kolam-stock-transaction';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamStockTransactionController,
  type KolamStockTransactionController,
} from '../hooks/use-kolam-stock-transaction-controller';
import { KolamButton } from './kolam-button';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import {
  KolamDropdownSelect,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
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
      {controller.mode === 'list' && isKolamStockTransactionListRoute(route) ? (
        <KolamStockTransactionList
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : (
        <KolamStockTransactionPlaceholder
          mode={controller.mode}
          onRouteChange={onRouteChange}
        />
      )}
    </View>
  );
}

function KolamStockTransactionPlaceholder({
  mode,
  onRouteChange,
}: {
  mode: 'list' | 'detail' | 'opname';
  onRouteChange?: (route: string) => void;
}) {
  const title =
    mode === 'opname'
      ? 'Opname cepat'
      : mode === 'detail'
      ? 'Detail transaksi stok'
      : 'Transaksi Stok';
  const message =
    mode === 'opname'
      ? 'Form opname cepat menyusul di Batch 3.'
      : 'Detail transaksi (verifikasi / batal finance) menyusul di Batch 2.';

  return (
    <View style={styles.placeholder}>
      <KolamCopyStack
        items={[
          { id: 'title', text: title, style: styles.title },
          { id: 'msg', text: message, style: styles.subtitle },
        ]}
      />
      <KolamButton
        label="Kembali ke daftar"
        onPress={() => onRouteChange?.(KOLAM_STOCK_TRANSACTION_ROOT)}
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
            {item.crossSync?.summary || '—'}
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
});
