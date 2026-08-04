import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  formatKolamFinanceConfirmStatusLabel,
  formatKolamFinanceTxTypeLabel,
  getKolamFinanceConfirmStatusIntent,
  KOLAM_FINANCE_CONFIRM_STATUS_OPTIONS,
  KOLAM_FINANCE_RANGE_OPTIONS,
  txMatchesFinanceFocusId,
  type KolamFinanceConfirmStatusFilter,
  type KolamFinanceRange,
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
import { KolamCheckmarkIcon } from './kolam-checkmark-icon';
import { KolamTableFooterControls } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import {
  measureFilterPanelAnchor,
  type KolamFilterPanelAnchor,
} from './kolam-filter-panel-anchor';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamTableFilterTrigger } from './kolam-table-filter-trigger';
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

const FINANCE_FILTER_PANEL_WIDTH = 220;

type FinanceSummaryFilterPanel = 'range' | 'status';

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
  const [activeFilterPanel, setActiveFilterPanel] =
    useState<FinanceSummaryFilterPanel | null>(null);
  const [panelAnchor, setPanelAnchor] = useState<KolamFilterPanelAnchor | null>(
    null,
  );
  const toolbarRef = useRef<View>(null);
  const rangeTriggerRef = useRef<View>(null);
  const statusTriggerRef = useRef<View>(null);

  const rangeLabel =
    KOLAM_FINANCE_RANGE_OPTIONS.find(
      option => option.value === controller.filters.range,
    )?.label ?? 'Bulan';
  const statusLabel =
    KOLAM_FINANCE_CONFIRM_STATUS_OPTIONS.find(
      option => option.value === controller.filters.confirmStatus,
    )?.label ?? 'Semua status';

  const getFilterTriggerRef = (panel: FinanceSummaryFilterPanel) =>
    panel === 'range' ? rangeTriggerRef : statusTriggerRef;

  const closeFilterPanel = useCallback(() => {
    setActiveFilterPanel(null);
    setPanelAnchor(null);
  }, []);

  const openFilterPanel = (panel: FinanceSummaryFilterPanel) => {
    if (activeFilterPanel === panel) {
      closeFilterPanel();
      return;
    }
    setActiveFilterPanel(null);
    setPanelAnchor(null);
    requestAnimationFrame(() => {
      measureFilterPanelAnchor(
        toolbarRef.current,
        getFilterTriggerRef(panel).current,
        FINANCE_FILTER_PANEL_WIDTH,
        anchor => {
          setPanelAnchor(anchor);
          setActiveFilterPanel(panel);
        },
      );
    });
  };

  useEffect(() => {
    if (!activeFilterPanel) {
      return;
    }
    requestAnimationFrame(() => {
      measureFilterPanelAnchor(
        toolbarRef.current,
        getFilterTriggerRef(activeFilterPanel).current,
        FINANCE_FILTER_PANEL_WIDTH,
        setPanelAnchor,
      );
    });
  }, [activeFilterPanel]);

  const panelOptions =
    activeFilterPanel === 'range'
      ? KOLAM_FINANCE_RANGE_OPTIONS.map(option => ({
          label: option.label,
          value: option.value,
        }))
      : activeFilterPanel === 'status'
        ? KOLAM_FINANCE_CONFIRM_STATUS_OPTIONS.map(option => ({
            label: option.label,
            value: option.value,
          }))
        : [];

  return (
    <View ref={toolbarRef} collapsable={false} style={styles.toolbarWrap}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View
            style={[
              kolamTableToolbarStyles.filters,
              styles.filtersAlignEnd,
            ]}
          >
            <View ref={rangeTriggerRef} collapsable={false}>
              <KolamTableFilterTrigger
                active={
                  activeFilterPanel === 'range' ||
                  controller.filters.range !== 'month'
                }
                label={rangeLabel}
                onPress={() => openFilterPanel('range')}
                open={activeFilterPanel === 'range'}
                variant="quiet"
              />
            </View>
            <View ref={statusTriggerRef} collapsable={false}>
              <KolamTableFilterTrigger
                active={
                  activeFilterPanel === 'status' ||
                  controller.filters.confirmStatus !== 'all'
                }
                label={statusLabel}
                onPress={() => openFilterPanel('status')}
                open={activeFilterPanel === 'status'}
                variant="quiet"
              />
            </View>
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
                closeFilterPanel();
                void controller.onDownloadLedger();
              }}
              style={styles.actionButton}
            />
            <KolamButton
              intent="secondary"
              label={controller.loading ? 'Memuat…' : 'Muat ulang'}
              onPress={() => {
                closeFilterPanel();
                void controller.onRefresh();
              }}
              style={styles.actionButton}
            />
          </View>
        </View>
      </View>

      {activeFilterPanel && panelAnchor ? (
        <View
          style={[
            styles.filterOverlayPanel,
            {
              left: panelAnchor.left,
              top: panelAnchor.top,
              width: FINANCE_FILTER_PANEL_WIDTH,
            },
          ]}
        >
          {panelOptions.map(option => {
            const selected =
              activeFilterPanel === 'range'
                ? controller.filters.range === option.value
                : controller.filters.confirmStatus === option.value;
            return (
              <KolamInteractionFrame
                accessibilityLabel={option.label}
                key={`${activeFilterPanel}-${option.value}`}
                onPress={() => {
                  if (activeFilterPanel === 'range') {
                    controller.onChangeRange(option.value as KolamFinanceRange);
                  } else {
                    controller.onChangeConfirmStatus(
                      option.value as KolamFinanceConfirmStatusFilter,
                    );
                  }
                  closeFilterPanel();
                }}
                selected={selected}
                style={[
                  styles.filterMenuItem,
                  selected ? styles.filterMenuItemSelected : null,
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.filterMenuItemLabel,
                    selected ? styles.filterMenuItemLabelSelected : null,
                  ]}
                >
                  {option.label}
                </Text>
                {selected ? (
                  <KolamCheckmarkIcon color={V.colors.primary} size="sm" />
                ) : (
                  <View style={styles.filterMenuItemCheckSpacer} />
                )}
              </KolamInteractionFrame>
            );
          })}
          <View style={styles.filterPanelFooter}>
            <KolamButton label="Tutup" onPress={closeFilterPanel} />
          </View>
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
  const cashMovement = summary?.cashMovement ?? {
    totalInflow: summary?.totalIncome ?? 0,
    totalOutflow: summary?.totalExpense ?? 0,
    netMovement: summary?.profitLoss ?? 0,
  };
  const profitAndLoss = summary?.profitAndLoss;
  const grossMargin = summary?.grossMargin;
  const profitLoss = profitAndLoss?.netProfit ?? summary?.profitLoss ?? 0;
  const cashNetMovement = cashMovement.netMovement;
  const pnlIncome = profitAndLoss?.totalIncome ?? summary?.totalIncome ?? 0;
  const profitMargin = pnlIncome > 0 ? (profitLoss / pnlIncome) * 100 : 0;
  const flowTotal = cashMovement.totalInflow + cashMovement.totalOutflow;
  const expenseRatio =
    flowTotal > 0 ? (cashMovement.totalOutflow / flowTotal) * 100 : 0;
  const wallets = summary?.wallets ?? [];
  const walletTotal = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  return (
    <View style={styles.cardsRow}>
      <KolamCardFrame style={styles.statCard}>
        <View style={styles.statCardInner}>
          <View style={styles.statCopy}>
            <Text numberOfLines={1} style={styles.statLabel}>
              Pemasukan Finance
            </Text>
            <Text numberOfLines={1} style={[styles.statValue, styles.statSuccess]}>
              {formatRupiah(cashMovement.totalInflow)}
            </Text>
            <Text numberOfLines={1} style={styles.statHint}>
              ↗ Aliran pendapatan aktif
            </Text>
          </View>
          <View style={styles.statIconCircle}>
            <Text style={styles.statIcon}>💰</Text>
          </View>
        </View>
      </KolamCardFrame>

      <KolamCardFrame style={styles.statCard}>
        <View style={styles.statCardInner}>
          <View style={styles.statCopy}>
            <Text numberOfLines={1} style={styles.statLabel}>
              Pengeluaran Finance
            </Text>
            <Text numberOfLines={1} style={[styles.statValue, styles.statDanger]}>
              {formatRupiah(cashMovement.totalOutflow)}
            </Text>
            <View style={styles.statProgressTrack}>
              <View
                style={[
                  styles.statProgressFill,
                  {width: `${Math.min(expenseRatio, 100)}%`},
                ]}
              />
            </View>
          </View>
          <View style={styles.statIconCircle}>
            <Text style={styles.statIcon}>💸</Text>
          </View>
        </View>
      </KolamCardFrame>

      <KolamCardFrame style={styles.statCard}>
        <View style={styles.statCardInner}>
          <View style={styles.statCopy}>
            <Text numberOfLines={1} style={styles.statLabel}>
              Laba/Rugi (P&L)
            </Text>
            <Text
              numberOfLines={1}
              style={[
                styles.statValue,
                profitLoss >= 0 ? styles.statSuccess : styles.statDanger,
              ]}
            >
              {formatRupiah(profitLoss)}
            </Text>
            <Text numberOfLines={1} style={styles.statHint}>
              {Math.round(profitMargin)}% margin
            </Text>
            {grossMargin ? (
              <Text numberOfLines={1} style={styles.statHint}>
                Gross margin: {formatRupiah(grossMargin.grossMargin)}
              </Text>
            ) : null}
          </View>
          <View style={styles.statIconCircle}>
            <Text style={styles.statIcon}>
              {profitLoss >= 0 ? '📈' : '📉'}
            </Text>
          </View>
        </View>
      </KolamCardFrame>

      <KolamCardFrame style={styles.statCard}>
        <View style={styles.statCardInner}>
          <View style={styles.statCopy}>
            <Text numberOfLines={1} style={styles.statLabel}>
              Net Arus Finance
            </Text>
            <Text
              numberOfLines={1}
              style={[
                styles.statValue,
                cashNetMovement >= 0 ? styles.statSuccess : styles.statDanger,
              ]}
            >
              {formatRupiah(cashNetMovement)}
            </Text>
            <Text numberOfLines={1} style={styles.statHint}>
              Wallet: {wallets.length} · Total: {formatRupiah(walletTotal)}
            </Text>
          </View>
          <View style={styles.statIconCircle}>
            <Text style={styles.statIcon}>💳</Text>
          </View>
        </View>
      </KolamCardFrame>
    </View>
  );
}

function FinanceWalletStrip({
  controller,
}: {
  controller: KolamFinanceSummaryController;
}) {
  const wallets = controller.summary?.wallets ?? [];
  const walletTotal = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  return (
    <KolamCardFrame style={styles.walletPanel}>
      <View style={styles.walletPanelHeader}>
        <Text style={styles.walletPanelTitle}>💳 Manajemen Dompet</Text>
      </View>
      {wallets.length === 0 ? (
        <View style={styles.walletEmpty}>
          <View style={styles.statIconCircleLarge}>
            <Text style={styles.statIconLarge}>💳</Text>
          </View>
          <Text style={styles.walletEmptyTitle}>Belum ada dompet</Text>
        </View>
      ) : (
        <View style={styles.walletPanelBody}>
          <View style={styles.walletTotalRow}>
            <Text style={styles.statHint}>Total saldo</Text>
            <Text style={styles.walletTotalValue}>{formatRupiah(walletTotal)}</Text>
          </View>
          {wallets.map(wallet => (
            <View key={wallet.name} style={styles.walletRow}>
              <View style={styles.walletRowLeft}>
                <View style={styles.statIconCircle}>
                  <Text style={styles.statIconSmall}>💳</Text>
                </View>
                <View style={styles.walletRowCopy}>
                  <Text numberOfLines={1} style={styles.walletName}>
                    {wallet.name}
                  </Text>
                  <Text numberOfLines={1} style={styles.statHint}>
                    Aktif
                  </Text>
                </View>
              </View>
              <View style={styles.walletRowRight}>
                <Text style={styles.walletBalance}>
                  {formatRupiah(wallet.balance)}
                </Text>
                <KolamStatusBadge intent="success" label="Aktif" />
              </View>
            </View>
          ))}
        </View>
      )}
    </KolamCardFrame>
  );
}

function FinanceTransactionList({
  controller,
}: {
  controller: KolamFinanceSummaryController;
}) {
  const safePage = Math.max(1, controller.filters.page);
  const pageCount = Math.max(1, controller.totalPages);

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
        {controller.paginatedTransactions.length === 0 ? (
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              compact
              title={controller.loading ? 'Memuat…' : 'Tidak ada transaksi'}
            />
          </View>
        ) : (
          controller.paginatedTransactions.map(item => {
            const focused = txMatchesFinanceFocusId(item, controller.focusTxId);
            const canConfirmRow =
              controller.canConfirm &&
              item.confirmStatus === 'unconfirmed' &&
              item.id;
            return (
              <View
                key={item.id}
                style={[styles.row, focused ? styles.rowFocused : null]}
              >
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
                  <Text style={styles.primaryText}>
                    {formatRupiah(item.amount)}
                  </Text>
                </View>
                <View style={[styles.cell, { flex: 1 }]}>
                  <KolamStatusBadge
                    intent={getKolamFinanceConfirmStatusIntent(
                      item.confirmStatus,
                    )}
                    label={formatKolamFinanceConfirmStatusLabel(
                      item.confirmStatus,
                    )}
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
                        controller.confirmingTxId === item.id
                          ? '…'
                          : 'Konfirmasi'
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
          })
        )}
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
    gap: 10,
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
  /** No search filler — keep filter hugs flush before actions (right side). */
  filtersAlignEnd: {
    justifyContent: 'flex-end',
  },
  dateInput: {
    flexGrow: 0,
    minWidth: 140,
    width: 150,
  },
  actionButton: {
    flexGrow: 0,
    flexShrink: 0,
  },
  filterOverlayPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    elevation: 1200,
    gap: 2,
    padding: 6,
    position: 'absolute',
    shadowColor: V.colors.fg,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    zIndex: 120000,
  },
  filterMenuItem: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    minHeight: 36,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  filterMenuItemSelected: {
    backgroundColor: V.colors.primarySoft,
  },
  filterMenuItemLabel: {
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  filterMenuItemLabelSelected: {
    color: V.colors.primary,
    fontWeight: '800',
  },
  filterMenuItemCheckSpacer: {
    height: 14,
    width: 14,
  },
  filterPanelFooter: {
    alignItems: 'flex-end',
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    marginTop: 4,
    paddingTop: 6,
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCard: {
    flexBasis: 200,
    flexGrow: 1,
    minWidth: 180,
    padding: 14,
  },
  statCardInner: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  statCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  statLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 18,
    fontWeight: '700',
  },
  statSuccess: {
    color: V.colors.success,
  },
  statDanger: {
    color: V.colors.danger,
  },
  statHint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  statProgressTrack: {
    backgroundColor: V.colors.muted,
    borderRadius: 999,
    height: 6,
    marginTop: 2,
    overflow: 'hidden',
    width: '100%',
  },
  statProgressFill: {
    backgroundColor: V.colors.danger,
    borderRadius: 999,
    height: '100%',
  },
  statIconCircle: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  statIconCircleLarge: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 64,
    justifyContent: 'center',
    marginBottom: 8,
    width: 64,
  },
  statIcon: {
    fontSize: 18,
  },
  statIconSmall: {
    fontSize: 14,
  },
  statIconLarge: {
    fontSize: 24,
  },
  walletPanel: {
    padding: 0,
  },
  walletPanelHeader: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  walletPanelTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '700',
  },
  walletPanelBody: {
    gap: 10,
    padding: 14,
  },
  walletEmpty: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 28,
  },
  walletEmptyTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
  walletTotalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  walletTotalValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  walletRow: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  walletRowLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    minWidth: 0,
  },
  walletRowCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  walletRowRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  walletName: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  walletBalance: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  listRoot: {
    gap: 8,
  },
  tableFrame: {
    width: '100%',
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
