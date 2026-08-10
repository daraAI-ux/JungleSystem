import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  formatKolamFinanceConfirmStatusLabel,
  formatKolamFinanceTxTypeLabel,
  getKolamFinanceConfirmStatusIntent,
  getKolamFinanceDetailAmount,
  getKolamFinanceDetailFlowTotal,
  getKolamFinanceDetailRatioPercent,
  hasKolamFinanceDetailKey,
  KOLAM_FINANCE_CONFIRM_STATUS_OPTIONS,
  KOLAM_FINANCE_DETAIL_FILTER_OPTIONS,
  KOLAM_FINANCE_RANGE_OPTIONS,
  type KolamFinanceConfirmStatusFilter,
  type KolamFinanceDetailFilterMode,
  type KolamFinanceRange,
  type KolamFinanceTransaction,
} from '../domain/kolam-finance-summary';
import { KOLAM_FINANCE_TAX_ROOT } from '../domain/kolam-finance-tax';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamFinanceSummaryController,
  type KolamFinanceSummaryController,
} from '../hooks/use-kolam-finance-summary-controller';
import { formatRupiah } from '../lib/money';
import { KolamButton } from './kolam-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamCheckmarkIcon } from './kolam-checkmark-icon';
import {
  measureFilterPanelAnchor,
  type KolamFilterPanelAnchor,
} from './kolam-filter-panel-anchor';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import { KolamSegment } from './kolam-segment';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamTableFilterTrigger } from './kolam-table-filter-trigger';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';
import { KolamToolbarDateFilter } from './kolam-toolbar-date-filter';

const TX_COLUMNS = [
  { id: 'date', label: 'Tanggal', flex: 1, align: 'left' },
  { id: 'wallet', label: 'Dompet', flex: 0.72, align: 'left' },
  { id: 'type', label: 'Tipe', flex: 0.48, align: 'left' },
  { id: 'amount', label: 'Jumlah', flex: 0.95, align: 'left' },
  { id: 'status', label: 'Status', flex: 0.8, align: 'left' },
  { id: 'note', label: 'Catatan', flex: 0.95, align: 'left' },
  { id: 'actions', label: '', flex: 0.85, align: 'right' },
] as const;

type FinanceTxColumnId = (typeof TX_COLUMNS)[number]['id'];

const FINANCE_FILTER_PANEL_WIDTH = 220;

type FinanceSummaryFilterPanel = 'range' | 'status';

/**
 * Finance Summary — FE `/finance` ops hub (range + cards + TX confirm).
 */
export function KolamFinanceSummarySurface({
  onRouteChange,
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
      <View style={styles.mainGrid}>
        <FinanceAnalyticsPanel
          controller={controller}
          onRouteChange={onRouteChange}
        />
        <FinanceWalletStrip controller={controller} />
      </View>
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
                <KolamToolbarDateFilter
                  accessibilityLabel="Tanggal mulai"
                  label="Dari"
                  onChange={value =>
                    controller.onChangeCustomDates(
                      value,
                      controller.filters.endDate,
                    )
                  }
                  placeholder="Dari"
                  value={controller.filters.startDate}
                />
                <KolamToolbarDateFilter
                  accessibilityLabel="Tanggal sampai"
                  label="Sampai"
                  onChange={value =>
                    controller.onChangeCustomDates(
                      controller.filters.startDate,
                      value,
                    )
                  }
                  placeholder="Sampai"
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

function FinanceAnalyticsPanel({
  controller,
  onRouteChange,
}: {
  controller: KolamFinanceSummaryController;
  onRouteChange?: (route: string) => void;
}) {
  const [filterMode, setFilterMode] =
    useState<KolamFinanceDetailFilterMode>('all');
  const summary = controller.summary;
  const details = summary?.details ?? {};
  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpense = summary?.totalExpense ?? 0;
  const flowTotal = getKolamFinanceDetailFlowTotal(totalIncome, totalExpense);
  const showRatio = filterMode === 'ratio';
  const showIncome =
    filterMode === 'all' || filterMode === 'income' || filterMode === 'ratio';
  const showExpenses =
    filterMode === 'all' || filterMode === 'expenses' || filterMode === 'ratio';

  const cashMovement = summary?.cashMovement ?? {
    totalInflow: totalIncome,
    totalOutflow: totalExpense,
    netMovement: summary?.profitLoss ?? 0,
  };
  const profitAndLoss = summary?.profitAndLoss;
  const profitLoss = profitAndLoss?.netProfit ?? summary?.profitLoss ?? 0;
  const cashNetMovement = cashMovement.netMovement;
  const pnlIncome = profitAndLoss?.totalIncome ?? totalIncome;
  const profitMargin = pnlIncome > 0 ? (profitLoss / pnlIncome) * 100 : 0;
  const expenseFlowTotal =
    cashMovement.totalInflow + cashMovement.totalOutflow;
  const expenseRatio =
    expenseFlowTotal > 0
      ? (cashMovement.totalOutflow / expenseFlowTotal) * 100
      : 0;
  const rangeLabel =
    KOLAM_FINANCE_RANGE_OPTIONS.find(
      option => option.value === controller.filters.range,
    )?.label ?? 'Bulan';
  const wallets = summary?.wallets ?? [];
  const txCount = summary?.transactions.length ?? 0;

  const hasShippingCost = hasKolamFinanceDetailKey(details, 'shippingCost');
  const hasInsuranceCost = hasKolamFinanceDetailKey(details, 'insuranceCost');
  const hasWoodPackingCost = hasKolamFinanceDetailKey(
    details,
    'woodPackingCost',
  );
  const commissionNet = getKolamFinanceDetailAmount(
    details,
    'commissionNetReleased',
  );
  const commissionPph = getKolamFinanceDetailAmount(
    details,
    'commissionPph21WithheldWallet',
  );
  const payrollPayment = getKolamFinanceDetailAmount(details, 'payrollPayment');

  return (
    <KolamCardFrame style={styles.analyticsPanel}>
      <View style={styles.analyticsHeader}>
        <Text style={styles.analyticsTitle}>📊 Rincian & Analitik Keuangan</Text>
        <KolamStatusBadge intent="secondary" label="Tampilan detail" />
      </View>
      <View style={styles.analyticsBody}>
        <View style={styles.analyticsBreakdown}>
          <Text style={styles.sectionEyebrow}>Pemasukan & Pengeluaran</Text>
          <View style={styles.modeRow}>
            {KOLAM_FINANCE_DETAIL_FILTER_OPTIONS.map(option => (
              <KolamSegment
                key={option.value}
                active={filterMode === option.value}
                label={option.label}
                onPress={() => setFilterMode(option.value)}
                variant="button"
              />
            ))}
          </View>

          {showIncome ? (
            <View style={styles.detailSection}>
              <Text style={[styles.detailSectionTitle, styles.statSuccess]}>
                Pemasukan (Credit)
              </Text>
              <FinanceDetailRow
                dotColor={V.colors.success}
                label="Pendapatan penjualan lunas (gross)"
                showRatio={showRatio}
                tone="success"
                total={flowTotal}
                value={getKolamFinanceDetailAmount(details, 'sales')}
              />
            </View>
          ) : null}

          {showExpenses ? (
            <View style={styles.detailSection}>
              <Text style={[styles.detailSectionTitle, styles.statDanger]}>
                Pengeluaran (Debit)
              </Text>
              <FinanceDetailRow
                dotColor={V.colors.mutedFg}
                label="Purchase Order"
                showRatio={showRatio}
                total={flowTotal}
                value={getKolamFinanceDetailAmount(details, 'purchaseOrder')}
              />
              {hasShippingCost ? (
                <FinanceDetailRow
                  dotColor={V.colors.mutedFg}
                  label="Biaya ongkir"
                  showRatio={showRatio}
                  total={flowTotal}
                  value={getKolamFinanceDetailAmount(details, 'shippingCost')}
                />
              ) : null}
              {hasInsuranceCost ? (
                <FinanceDetailRow
                  dotColor={V.colors.mutedFg}
                  label="Biaya asuransi"
                  showRatio={showRatio}
                  total={flowTotal}
                  value={getKolamFinanceDetailAmount(details, 'insuranceCost')}
                />
              ) : null}
              {hasWoodPackingCost ? (
                <FinanceDetailRow
                  dotColor={V.colors.mutedFg}
                  label="Biaya packing kayu"
                  showRatio={showRatio}
                  total={flowTotal}
                  value={getKolamFinanceDetailAmount(details, 'woodPackingCost')}
                />
              ) : null}
              <FinanceDetailRow
                dotColor={V.colors.danger}
                label="Komisi dibayar"
                showRatio={showRatio}
                tone="danger"
                total={flowTotal}
                value={getKolamFinanceDetailAmount(
                  details,
                  'commissionReleased',
                )}
              />
              {commissionNet > 0 ? (
                <FinanceDetailRow
                  indented
                  label="↳ Komisi net"
                  showRatio={false}
                  value={commissionNet}
                />
              ) : null}
              {commissionPph > 0 ? (
                <FinanceDetailRow
                  indented
                  label="↳ PPh 21 komisi"
                  showRatio={false}
                  value={commissionPph}
                />
              ) : null}
              {payrollPayment > 0 ? (
                <FinanceDetailRow
                  label="Payroll (THP)"
                  showRatio={false}
                  value={payrollPayment}
                />
              ) : null}
              <FinanceDetailRow
                dotColor={V.colors.warning}
                label="Pengeluaran rutin"
                showRatio={showRatio}
                tone="warning"
                total={flowTotal}
                value={getKolamFinanceDetailAmount(details, 'routineExpense')}
              />
              <FinanceDetailRow
                dotColor={V.colors.danger}
                label="Biaya tak terduga"
                showRatio={showRatio}
                tone="danger"
                total={flowTotal}
                value={getKolamFinanceDetailAmount(
                  details,
                  'unexpectedExpense',
                )}
              />
              <FinanceDetailRow
                dotColor={V.colors.mutedFg}
                label="Investasi aset"
                showRatio={showRatio}
                total={flowTotal}
                value={getKolamFinanceDetailAmount(details, 'assetPurchase')}
              />
              <FinanceDetailRow
                dotColor={V.colors.warning}
                label="Kerugian stock opname"
                showRatio={showRatio}
                tone="warning"
                total={flowTotal}
                value={getKolamFinanceDetailAmount(details, 'stockOpnameLoss')}
              />
              <FinanceDetailRow
                actionLabel={onRouteChange && !showRatio ? 'Kelola' : undefined}
                dotColor={V.colors.danger}
                label="Setoran pajak"
                onActionPress={
                  onRouteChange
                    ? () => onRouteChange(KOLAM_FINANCE_TAX_ROOT)
                    : undefined
                }
                showRatio={showRatio}
                tone="danger"
                total={flowTotal}
                value={getKolamFinanceDetailAmount(details, 'taxSettlement')}
              />
            </View>
          ) : null}
        </View>

        <View style={styles.analyticsMetrics}>
          <Text style={styles.sectionEyebrow}>Metrik Kinerja</Text>

          <View style={styles.metricBlock}>
            <View style={styles.metricLabelRow}>
              <Text style={styles.metricLabel}>Rasio pengeluaran</Text>
              <Text style={styles.metricValueMono}>
                {Math.round(expenseRatio)}%
              </Text>
            </View>
            <View style={styles.metricTrack}>
              <View
                style={[
                  styles.metricFillWarning,
                  {width: `${Math.min(expenseRatio, 100)}%`},
                ]}
              />
            </View>
          </View>

          <View style={styles.metricBlock}>
            <View style={styles.metricLabelRow}>
              <Text style={styles.metricLabel}>Margin laba</Text>
              <Text style={styles.metricValueMono}>
                {Math.round(profitMargin)}%
              </Text>
            </View>
            <View style={styles.marginRow}>
              <View style={styles.marginCircle}>
                <Text style={styles.marginCircleText}>
                  {Math.min(Math.round(Math.abs(profitMargin)), 100)}
                </Text>
              </View>
              <Text
                style={[
                  styles.metricLabel,
                  profitLoss >= 0 ? styles.statSuccess : styles.statDanger,
                ]}
              >
                {profitLoss >= 0 ? 'Untung' : 'Rugi'}
              </Text>
            </View>
          </View>

          <View style={styles.metricsFooter}>
            <View style={styles.periodCard}>
              <Text style={styles.periodTitle}>📅 Ringkasan {rangeLabel}</Text>
              <View style={styles.periodGrid}>
                <View style={styles.periodCell}>
                  <Text style={styles.statHint}>Laba/rugi P&L</Text>
                  <Text
                    style={[
                      styles.periodValue,
                      profitLoss >= 0 ? styles.statSuccess : styles.statDanger,
                    ]}
                  >
                    {formatRupiah(profitLoss)}
                  </Text>
                </View>
                <View style={styles.periodCell}>
                  <Text style={styles.statHint}>Transaksi</Text>
                  <Text style={styles.periodValue}>{txCount}</Text>
                </View>
              </View>
            </View>

            <View style={styles.healthBlock}>
              <Text style={styles.healthTitle}>Kesehatan keuangan</Text>
              <View style={styles.healthRow}>
                <Text style={styles.statHint}>Arus kas</Text>
                <KolamStatusBadge
                  intent={cashNetMovement >= 0 ? 'success' : 'danger'}
                  label={cashNetMovement >= 0 ? 'Positif' : 'Negatif'}
                />
              </View>
              <View style={styles.healthRow}>
                <Text style={styles.statHint}>Kontrol pengeluaran</Text>
                <KolamStatusBadge
                  intent={expenseRatio < 70 ? 'success' : 'warning'}
                  label={expenseRatio < 70 ? 'Baik' : 'Pantau'}
                />
              </View>
              <View style={styles.healthRow}>
                <Text style={styles.statHint}>Likuiditas</Text>
                <KolamStatusBadge
                  intent={wallets.length > 0 ? 'success' : 'danger'}
                  label={wallets.length > 0 ? 'Sehat' : 'Rendah'}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    </KolamCardFrame>
  );
}

function FinanceDetailRow({
  actionLabel,
  dotColor,
  indented,
  label,
  onActionPress,
  showRatio,
  tone,
  total = 0,
  value,
}: {
  actionLabel?: string;
  dotColor?: string;
  indented?: boolean;
  label: string;
  onActionPress?: () => void;
  showRatio: boolean;
  tone?: 'success' | 'danger' | 'warning';
  total?: number;
  value: number;
}) {
  const ratioPct = getKolamFinanceDetailRatioPercent(value, total);
  const fillColor =
    tone === 'success'
      ? V.colors.success
      : tone === 'danger'
        ? V.colors.danger
        : tone === 'warning'
          ? V.colors.warning
          : V.colors.mutedFg;
  const valueTone =
    tone === 'success'
      ? styles.statSuccess
      : tone === 'danger'
        ? styles.statDanger
        : tone === 'warning'
          ? styles.statWarning
          : null;

  return (
    <View style={[styles.detailRow, indented ? styles.detailRowIndented : null]}>
      <View style={styles.detailLabelCol}>
        {dotColor && !indented ? (
          <View style={[styles.detailDot, {backgroundColor: dotColor}]} />
        ) : null}
        <Text numberOfLines={2} style={styles.detailLabel}>
          {label}
        </Text>
      </View>
      <View style={styles.detailValueCol}>
        {showRatio ? (
          <View style={styles.ratioRow}>
            <View style={styles.ratioTrack}>
              <View
                style={[
                  styles.ratioFill,
                  {
                    backgroundColor: fillColor,
                    width: `${Math.min(ratioPct, 100)}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.ratioPct}>{ratioPct.toFixed(1)}%</Text>
          </View>
        ) : (
          <View style={styles.detailValueWrap}>
            <Text style={[styles.detailValue, valueTone]}>
              {formatRupiah(value)}
            </Text>
            {actionLabel && onActionPress ? (
              <KolamInteractionFrame onPress={onActionPress}>
                <Text style={styles.detailAction}>{actionLabel}</Text>
              </KolamInteractionFrame>
            ) : null}
          </View>
        )}
      </View>
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
  const transactionColumns = React.useMemo(
    () => createFinanceTransactionColumns(controller),
    [controller],
  );

  return (
    <View style={styles.listRoot}>
      <KolamListTableComposition
        columns={transactionColumns}
        emptyTitle={controller.loading ? 'Memuat...' : 'Tidak ada transaksi'}
        getRowKey={item => item.id}
        loading={controller.loading}
        pagination={{
          onPageChange: controller.onPageChange,
          page: safePage,
          pageSize: controller.filters.limit,
          total: controller.filteredTransactions.length,
        }}
        rows={controller.paginatedTransactions}
        style={styles.tableFrame}
      />
    </View>
  );
}

function createFinanceTransactionColumns(
  controller: KolamFinanceSummaryController,
): Array<
  KolamListTableColumn<KolamFinanceTransaction>
> {
  return TX_COLUMNS.map(column => ({
    ...column,
    render: item => renderFinanceTransactionCell(column.id, item, controller),
  }));
}

function renderFinanceTransactionCell(
  columnId: FinanceTxColumnId,
  item: KolamFinanceTransaction,
  controller: KolamFinanceSummaryController,
) {
  switch (columnId) {
    case 'date':
      return (
        <Text numberOfLines={2} style={styles.metaText}>
          {formatTxDate(item.date)}
        </Text>
      );
    case 'wallet':
      return (
        <Text numberOfLines={1} style={styles.primaryText}>
          {item.wallet}
        </Text>
      );
    case 'type':
      return (
        <Text numberOfLines={1} style={styles.metaText}>
          {formatKolamFinanceTxTypeLabel(item.type)}
        </Text>
      );
    case 'amount':
      return (
        <Text numberOfLines={1} style={styles.primaryText}>
          {formatRupiah(item.amount)}
        </Text>
      );
    case 'status':
      return (
        <KolamStatusBadge
          intent={getKolamFinanceConfirmStatusIntent(item.confirmStatus)}
          label={formatKolamFinanceConfirmStatusLabel(item.confirmStatus)}
        />
      );
    case 'note':
      return (
        <Text numberOfLines={2} style={styles.metaText}>
          {item.note || item.source || '-'}
        </Text>
      );
    case 'actions':
      return <FinanceTransactionActions controller={controller} item={item} />;
  }
}

function FinanceTransactionActions({
  controller,
  item,
}: {
  controller: KolamFinanceSummaryController;
  item: KolamFinanceTransaction;
}) {
  const canConfirmRow =
    controller.canConfirm && item.confirmStatus === 'unconfirmed' && item.id;

  return canConfirmRow ? (
    <KolamButton
      intent="primary"
      label={controller.confirmingTxId === item.id ? '...' : 'Konfirmasi'}
      onPress={() => {
        void controller.onConfirmTransaction(item);
      }}
      style={styles.confirmButton}
    />
  ) : null;
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
  mainGrid: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  analyticsPanel: {
    flexBasis: 520,
    flexGrow: 2,
    minWidth: 320,
    padding: 0,
  },
  analyticsHeader: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  analyticsTitle: {
    color: V.colors.fg,
    flexShrink: 1,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '700',
  },
  analyticsBody: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  analyticsBreakdown: {
    flexBasis: 280,
    flexGrow: 1,
    gap: 10,
    minWidth: 240,
    padding: 14,
  },
  analyticsMetrics: {
    backgroundColor: V.colors.mutedSoft,
    borderLeftColor: V.colors.border,
    borderLeftWidth: StyleSheet.hairlineWidth,
    flexBasis: 220,
    flexGrow: 1,
    gap: 12,
    minWidth: 200,
    padding: 14,
  },
  sectionEyebrow: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  detailSection: {
    gap: 0,
    marginTop: 4,
  },
  detailSectionTitle: {
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 4,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  detailRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  detailRowIndented: {
    paddingLeft: 18,
  },
  detailLabelCol: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    minWidth: 0,
  },
  detailDot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  detailLabel: {
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '500',
  },
  detailValueCol: {
    flexShrink: 0,
    maxWidth: '48%',
    minWidth: 110,
  },
  detailValueWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  detailValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  detailAction: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  ratioRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ratioTrack: {
    backgroundColor: V.colors.muted,
    borderRadius: 999,
    flex: 1,
    height: 8,
    overflow: 'hidden',
  },
  ratioFill: {
    borderRadius: 999,
    height: '100%',
  },
  ratioPct: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    minWidth: 42,
    textAlign: 'right',
  },
  metricBlock: {
    gap: 6,
  },
  metricLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  metricValueMono: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  metricTrack: {
    backgroundColor: V.colors.muted,
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
  metricFillWarning: {
    backgroundColor: V.colors.warning,
    borderRadius: 999,
    height: '100%',
  },
  marginRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  marginCircle: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 999,
    borderWidth: 3,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  marginCircleText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  metricsFooter: {
    borderTopColor: V.colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
    marginTop: 8,
    paddingTop: 12,
  },
  periodCard: {
    backgroundColor: V.colors.muted,
    borderRadius: 10,
    gap: 10,
    padding: 12,
  },
  periodTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  periodGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  periodCell: {
    flex: 1,
    gap: 2,
  },
  periodValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  healthBlock: {
    gap: 8,
  },
  healthTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  healthRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  statWarning: {
    color: V.colors.warning,
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
    flexBasis: 280,
    flexGrow: 1,
    minWidth: 240,
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
    alignSelf: 'flex-end',
    minWidth: 96,
  },
});
