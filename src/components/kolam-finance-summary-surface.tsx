import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  formatKolamFinanceConfirmStatusLabel,
  formatKolamFinanceTxTypeLabel,
  getKolamFinanceConfirmStatusIntent,
  KOLAM_FINANCE_CONFIRM_STATUS_OPTIONS,
  KOLAM_FINANCE_RANGE_OPTIONS,
  txMatchesFinanceFocusId,
  type KolamFinanceRange,
  type KolamFinanceTransaction,
} from '../domain/kolam-finance-summary';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamFinanceSummaryController,
  type KolamFinanceSummaryController,
} from '../hooks/use-kolam-finance-summary-controller';
import { formatRupiah } from '../lib/money';
import { KolamButton } from './kolam-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamTableFooterControls } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

const TX_COLUMNS = [
  { id: 'date', label: 'Tanggal', flex: 1.1 },
  { id: 'wallet', label: 'Dompet', flex: 1 },
  { id: 'type', label: 'Tipe', flex: 0.7 },
  { id: 'amount', label: 'Jumlah', flex: 1 },
  { id: 'status', label: 'Status', flex: 1 },
  { id: 'note', label: 'Catatan', flex: 1.2 },
  { id: 'action', label: '', flex: 0.8 },
] as const;

/**
 * Finance Summary — FE `/finance` ops hub (range + cards + TX confirm).
 */
export function KolamFinanceSummarySurface({
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamFinanceSummaryController(route);

  return (
    <View style={styles.surface}>
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

      <FinanceSummaryToolbar controller={controller} />
      <FinanceSummaryCards controller={controller} />
      <FinanceWalletStrip controller={controller} />
      <FinanceTransactionList controller={controller} />
    </View>
  );
}

function FinanceSummaryToolbar({
  controller,
}: {
  controller: KolamFinanceSummaryController;
}) {
  const [rangeOpen, setRangeOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const rangeLabel =
    KOLAM_FINANCE_RANGE_OPTIONS.find(
      option => option.value === controller.filters.range,
    )?.label ?? 'Bulan';
  const statusLabel =
    KOLAM_FINANCE_CONFIRM_STATUS_OPTIONS.find(
      option => option.value === controller.filters.confirmStatus,
    )?.label ?? 'Semua status';

  return (
    <View style={kolamTableToolbarStyles.shell}>
      <View style={kolamTableToolbarStyles.row}>
        <View style={kolamTableToolbarStyles.filters}>
          <KolamButton
            intent={rangeOpen ? 'primary' : 'secondary'}
            label={rangeLabel}
            onPress={() => {
              setStatusOpen(false);
              setRangeOpen(current => !current);
            }}
            style={styles.filterTrigger}
          />
          <KolamButton
            intent={
              statusOpen || controller.filters.confirmStatus !== 'all'
                ? 'primary'
                : 'secondary'
            }
            label={statusLabel}
            onPress={() => {
              setRangeOpen(false);
              setStatusOpen(current => !current);
            }}
            style={styles.filterTrigger}
          />
          {controller.filters.range === 'custom' ? (
            <>
              <KolamFormTextField
                onChangeText={value =>
                  controller.onChangeCustomDates(
                    value,
                    controller.filters.endDate,
                  )
                }
                placeholder="Mulai YYYY-MM-DD"
                style={styles.dateInput}
                value={controller.filters.startDate}
              />
              <KolamFormTextField
                onChangeText={value =>
                  controller.onChangeCustomDates(
                    controller.filters.startDate,
                    value,
                  )
                }
                placeholder="Akhir YYYY-MM-DD"
                style={styles.dateInput}
                value={controller.filters.endDate}
              />
            </>
          ) : null}
        </View>
        <View style={kolamTableToolbarStyles.actions}>
          <KolamButton
            disabled={controller.downloadingLedger}
            intent="secondary"
            label={
              controller.downloadingLedger ? 'Mengunduh…' : 'Unduh buku besar'
            }
            onPress={() => {
              void controller.onDownloadLedger();
            }}
            style={styles.filterTrigger}
          />
          <KolamButton
            intent="secondary"
            label={controller.loading ? 'Memuat…' : 'Muat ulang'}
            onPress={() => {
              void controller.onRefresh();
            }}
            style={styles.filterTrigger}
          />
        </View>
      </View>

      {rangeOpen ? (
        <View style={styles.filterPanel}>
          {KOLAM_FINANCE_RANGE_OPTIONS.map(option => (
            <Pressable
              key={option.value}
              onPress={() => {
                controller.onChangeRange(option.value as KolamFinanceRange);
                setRangeOpen(false);
              }}
              style={styles.filterOption}
            >
              <Text style={styles.filterOptionText}>{option.label}</Text>
            </Pressable>
          ))}
          <KolamButton
            intent="secondary"
            label="Tutup"
            onPress={() => setRangeOpen(false)}
            style={styles.filterClose}
          />
        </View>
      ) : null}

      {statusOpen ? (
        <View style={styles.filterPanel}>
          {KOLAM_FINANCE_CONFIRM_STATUS_OPTIONS.map(option => (
            <Pressable
              key={option.value}
              onPress={() => {
                controller.onChangeConfirmStatus(option.value);
                setStatusOpen(false);
              }}
              style={styles.filterOption}
            >
              <Text style={styles.filterOptionText}>{option.label}</Text>
            </Pressable>
          ))}
          <KolamButton
            intent="secondary"
            label="Tutup"
            onPress={() => setStatusOpen(false)}
            style={styles.filterClose}
          />
        </View>
      ) : null}
    </View>
  );
}

function FinanceSummaryCards({
  controller,
}: {
  controller: KolamFinanceSummaryController;
}) {
  const summary = controller.summary;
  const cards = [
    {
      id: 'income',
      label: 'Pemasukan',
      value: summary?.totalIncome ?? 0,
    },
    {
      id: 'expense',
      label: 'Pengeluaran',
      value: summary?.totalExpense ?? 0,
    },
    {
      id: 'profit',
      label: 'Laba / Rugi',
      value: summary?.profitLoss ?? 0,
    },
    {
      id: 'payable',
      label: 'Utang terbuka',
      value: summary?.liabilitiesPayableOpen ?? 0,
    },
  ];

  return (
    <View style={styles.cardsRow}>
      {cards.map(card => (
        <KolamCardFrame key={card.id} style={styles.card}>
          <Text style={styles.cardLabel}>{card.label}</Text>
          <Text style={styles.cardValue}>{formatRupiah(card.value)}</Text>
        </KolamCardFrame>
      ))}
    </View>
  );
}

function FinanceWalletStrip({
  controller,
}: {
  controller: KolamFinanceSummaryController;
}) {
  const wallets = controller.summary?.wallets ?? [];
  if (wallets.length === 0) {
    return null;
  }
  return (
    <View style={styles.walletStrip}>
      {wallets.map(wallet => (
        <View key={wallet.name} style={styles.walletChip}>
          <Text numberOfLines={1} style={styles.walletName}>
            {wallet.name}
          </Text>
          <Text style={styles.walletBalance}>
            {formatRupiah(wallet.balance)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function FinanceTransactionList({
  controller,
}: {
  controller: KolamFinanceSummaryController;
}) {
  const safePage = Math.max(1, controller.filters.page);
  const pageCount = Math.max(1, controller.totalPages);

  const renderRow = React.useCallback(
    ({ item }: { item: KolamFinanceTransaction }) => {
      const focused = txMatchesFinanceFocusId(item, controller.focusTxId);
      const canConfirmRow =
        controller.canConfirm &&
        item.confirmStatus === 'unconfirmed' &&
        item.id;
      return (
        <View style={[styles.row, focused ? styles.rowFocused : null]}>
          <View style={[styles.cell, { flex: 1.1 }]}>
            <Text numberOfLines={2} style={styles.metaText}>
              {formatTxDate(item.date)}
            </Text>
          </View>
          <View style={[styles.cell, { flex: 1 }]}>
            <Text numberOfLines={1} style={styles.primaryText}>
              {item.wallet}
            </Text>
          </View>
          <View style={[styles.cell, { flex: 0.7 }]}>
            <Text style={styles.metaText}>
              {formatKolamFinanceTxTypeLabel(item.type)}
            </Text>
          </View>
          <View style={[styles.cell, { flex: 1 }]}>
            <Text style={styles.primaryText}>{formatRupiah(item.amount)}</Text>
          </View>
          <View style={[styles.cell, { flex: 1 }]}>
            <KolamStatusBadge
              intent={getKolamFinanceConfirmStatusIntent(item.confirmStatus)}
              label={formatKolamFinanceConfirmStatusLabel(item.confirmStatus)}
            />
          </View>
          <View style={[styles.cell, { flex: 1.2 }]}>
            <Text numberOfLines={2} style={styles.metaText}>
              {item.note || item.source || '—'}
            </Text>
          </View>
          <View style={[styles.cell, { flex: 0.8 }]}>
            {canConfirmRow ? (
              <KolamButton
                intent="primary"
                label={
                  controller.confirmingTxId === item.id ? '…' : 'Konfirmasi'
                }
                onPress={() => {
                  void controller.onConfirmTransaction(item);
                }}
                style={styles.confirmButton}
              />
            ) : null}
          </View>
        </View>
      );
    },
    [controller],
  );

  return (
    <View style={styles.listRoot}>
      <KolamCatalogListTableShell
        footer={
          <KolamTableFooterControls
            onPageSizeChange={controller.onLimitChange}
            page={safePage}
            pageSize={controller.filters.limit}
            total={controller.filteredTransactions.length}
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
          data={controller.paginatedTransactions}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <KolamEmptyState
                compact
                title={
                  controller.loading ? 'Memuat…' : 'Tidak ada transaksi'
                }
              />
            </View>
          }
          ListHeaderComponent={
            <View style={styles.headerRow}>
              {TX_COLUMNS.map(column => (
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
          style={styles.list}
        />
      </KolamCatalogListTableShell>
    </View>
  );
}

function formatTxDate(value: string): string {
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

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 10,
    minHeight: 0,
  },
  banner: {
    alignSelf: 'stretch',
  },
  filterTrigger: {
    flexGrow: 0,
    flexShrink: 0,
  },
  dateInput: {
    flexGrow: 0,
    minWidth: 140,
    width: 150,
  },
  filterPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 2,
    marginTop: 6,
    padding: 6,
  },
  filterOption: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  filterOptionText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  filterClose: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  card: {
    flexGrow: 1,
    flexBasis: 160,
    minWidth: 140,
    padding: 12,
  },
  cardLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    marginBottom: 4,
  },
  cardValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '600',
  },
  walletStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  walletChip: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 140,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  walletName: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  walletBalance: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  listRoot: {
    flex: 1,
    gap: 8,
    minHeight: 240,
  },
  tableFrame: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyWrap: {
    paddingVertical: 24,
  },
  headerRow: {
    alignItems: 'center',
    backgroundColor: V.colors.tableHeader,
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 36,
    paddingHorizontal: 8,
  },
  headerCellText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  paginationBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  row: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 44,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  rowFocused: {
    backgroundColor: V.colors.primarySoft,
  },
  cell: {
    paddingHorizontal: 4,
  },
  primaryText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '500',
  },
  metaText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  confirmButton: {
    alignSelf: 'flex-start',
  },
});
