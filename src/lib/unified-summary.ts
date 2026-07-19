import type {AmDatasetState, KolamDatasetState} from '../services/unified-data';
import {formatRupiah} from './money';

export interface SummaryRow {
  label: string;
  value: string;
  tone?: 'default' | 'warning';
}

export function getKolamFinanceRows(kolam: KolamDatasetState): SummaryRow[] {
  const finance = kolam.financeSummary;
  const margin = kolam.saleCostSummary;

  if (!finance && !margin) {
    return [];
  }

  return [
    ...(finance
      ? [
          {label: 'Income', value: formatRupiah(finance.totalIncome)},
          {label: 'Expense', value: formatRupiah(finance.totalExpense)},
          {
            label: 'Profit/Loss',
            value: formatRupiah(finance.profitLoss),
            tone: finance.profitLoss < 0 ? 'warning' : 'default',
          } satisfies SummaryRow,
        ]
      : []),
    ...(margin
      ? [
          {label: 'Revenue paid', value: formatRupiah(margin.revenue)},
          {label: 'HPP', value: formatRupiah(margin.totalHpp)},
          {
            label: 'Gross margin',
            value: formatRupiah(margin.grossMargin),
            tone: margin.grossMargin < 0 ? 'warning' : 'default',
          } satisfies SummaryRow,
        ]
      : []),
  ];
}

export function getKolamWalletRows(kolam: KolamDatasetState): SummaryRow[] {
  return (kolam.financeSummary?.wallets ?? [])
    .slice()
    .sort((left, right) => right.balance - left.balance)
    .slice(0, 4)
    .map(wallet => ({
      label: wallet.name,
      value: formatRupiah(wallet.balance),
      tone: wallet.balance < 0 ? 'warning' : 'default',
    }));
}

export function getAmOperationRows(am: AmDatasetState): SummaryRow[] {
  const dashboard = am.dashboard;

  if (!dashboard) {
    return [];
  }

  return [
    {
      label: 'Total account',
      value: `${dashboard.summary.totalAccounts}`,
    },
    {
      label: 'Device aktif',
      value: `${dashboard.summary.activeDevices}`,
    },
    {
      label: 'Mutasi masuk',
      value: formatRupiah(dashboard.summary.todayIncoming.total),
    },
    {
      label: 'Mutasi keluar',
      value: formatRupiah(dashboard.summary.todayOutgoing.total),
    },
    {
      label: 'Transfer pending',
      value: `${dashboard.transfers.pending + dashboard.transfers.processing}`,
      tone:
        dashboard.transfers.pending + dashboard.transfers.processing > 0
          ? 'warning'
          : 'default',
    },
    {
      label: 'Transfer sukses',
      value: `${dashboard.transfers.success}`,
    },
  ];
}

export function getAmDeviceRows(am: AmDatasetState): SummaryRow[] {
  return (am.dashboard?.devices ?? []).slice(0, 4).map(device => ({
    label: device.name,
    value: `${device.activeAccountCount}/${device.accountCount} account`,
    tone:
      device.activeAccountCount < device.accountCount ? 'warning' : 'default',
  }));
}
