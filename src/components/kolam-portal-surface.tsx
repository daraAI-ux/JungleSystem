import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  loadKolamPortalDataset,
  type KolamPortalAttendanceDay,
  type KolamPortalCommissionRow,
  type KolamPortalDataset,
  type KolamPortalMoneyRow,
  type KolamPortalPayrollSlip,
  type KolamPortalTaskRow,
} from '../services/kolam-employee-portal-api';
import { KolamButton } from './kolam-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamDetailSummaryCard } from './kolam-detail-summary-card';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import { KolamStatusBadge } from './kolam-status-badge';

type PortalMoneyTableRow = KolamPortalMoneyRow | KolamPortalCommissionRow;

export function KolamPortalSurface({
  onRouteChange,
}: {
  route?: string;
  onRouteChange?: (route: string) => void;
}) {
  const { width } = useWindowDimensions();
  const [dataset, setDataset] = React.useState<KolamPortalDataset | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [pageBySection, setPageBySection] = React.useState<Record<string, number>>({});
  const isWide = width >= 1180;

  const refresh = React.useCallback(() => {
    let alive = true;
    setLoading(true);
    loadKolamPortalDataset()
      .then(result => {
        if (alive) {
          setDataset(result);
        }
      })
      .catch(error => {
        if (alive) {
          setDataset({
            attendance: null,
            bonuses: [],
            commissions: [],
            deductions: [],
            errorMessage:
              error instanceof Error ? error.message : 'Portal belum dapat dimuat.',
            kasbon: [],
            overtime: [],
            payrollSlips: [],
            summary: null,
            tasks: [],
          });
        }
      })
      .finally(() => {
        if (alive) {
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  React.useEffect(() => refresh(), [refresh]);

  const setSectionPage = React.useCallback((section: string, page: number) => {
    setPageBySection(current => ({ ...current, [section]: page }));
  }, []);

  const summary = dataset?.summary;

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
      style={styles.root}
    >
      {dataset?.errorMessage ? (
        <KolamCardFrame style={styles.noticeCard} variant="compact">
          <Text style={styles.noticeText}>{dataset.errorMessage}</Text>
        </KolamCardFrame>
      ) : null}

      <View style={[styles.layout, isWide ? styles.layoutWide : null]}>
        <View style={[styles.mainColumn, isWide ? styles.mainColumnWide : null]}>
          <KolamDetailSummaryCard
            actions={
              <KolamButton
                label="Buka KPI"
                onPress={() => onRouteChange?.('/portal/kpi')}
              />
            }
            description="Absensi, gaji, komisi, potongan, bonus, kasbon, dan tugas."
            fieldColumns={3}
            fields={[
              { id: 'slips', label: 'Slip', value: formatNumber(summary?.finalizedSlips) },
              { id: 'deductions', label: 'Potongan', value: formatNumber(summary?.deductions) },
              { id: 'kasbon', label: 'Kasbon', value: formatNumber(summary?.activeKasbon) },
              { id: 'bonus', label: 'Bonus', value: formatNumber(summary?.bonusRecords) },
              { id: 'tasks', label: 'Tugas', value: formatNumber(summary?.openTasks) },
              { id: 'overtime', label: 'Lembur', value: formatNumber(summary?.overtimeApproved) },
            ]}
            style={styles.fullWidth}
            title="Ringkasan"
          />

          <View style={styles.twoColumnGrid}>
            <PortalTodayAttendanceCard
              days={dataset?.attendance?.days ?? []}
              loading={loading}
            />
            <PortalHistoryAttendanceTable
              days={dataset?.attendance?.days ?? []}
              loading={loading}
              page={pageBySection.attendance ?? 1}
              setPage={page => setSectionPage('attendance', page)}
            />
          </View>

          <View style={styles.twoColumnGrid}>
            <PortalPayrollTable
              loading={loading}
              page={pageBySection.slips ?? 1}
              rows={dataset?.payrollSlips ?? []}
              setPage={page => setSectionPage('slips', page)}
            />
            <PortalMoneyTable
              loading={loading}
              page={pageBySection.commissions ?? 1}
              rows={dataset?.commissions ?? []}
              section="commissions"
              setPage={page => setSectionPage('commissions', page)}
              title="Komisi"
              valuePicker={row =>
                'pph21' in row ? row.pph21?.netPayable ?? row.commissionAmount : row.amount
              }
            />
          </View>

          <View style={styles.twoColumnGrid}>
            <PortalMoneyTable
              loading={loading}
              page={pageBySection.deductions ?? 1}
              rows={dataset?.deductions ?? []}
              section="deductions"
              setPage={page => setSectionPage('deductions', page)}
              title="Potongan"
            />
            <PortalMoneyTable
              loading={loading}
              page={pageBySection.bonuses ?? 1}
              rows={dataset?.bonuses ?? []}
              section="bonuses"
              setPage={page => setSectionPage('bonuses', page)}
              title="Bonus"
            />
          </View>

          <View style={styles.twoColumnGrid}>
            <PortalMoneyTable
              loading={loading}
              page={pageBySection.kasbon ?? 1}
              rows={dataset?.kasbon ?? []}
              section="kasbon"
              setPage={page => setSectionPage('kasbon', page)}
              title="Kasbon"
            />
            <PortalMoneyTable
              loading={loading}
              page={pageBySection.overtime ?? 1}
              rows={dataset?.overtime ?? []}
              section="overtime"
              setPage={page => setSectionPage('overtime', page)}
              title="Lembur"
            />
          </View>

          <PortalTaskTable
            loading={loading}
            page={pageBySection.tasks ?? 1}
            rows={dataset?.tasks ?? []}
            setPage={page => setSectionPage('tasks', page)}
          />
        </View>

        <View style={[styles.sideColumn, isWide ? styles.sideColumnWide : null]}>
          <KolamDetailSummaryCard
            actions={
              <KolamButton
                disabled={loading}
                label={loading ? 'Memuat' : 'Refresh'}
                onPress={refresh}
              />
            }
            description="Portal staf"
            fieldColumns={2}
            fields={[
              { id: 'pending-commission', label: 'Komisi tunggu', value: formatCurrency(summary?.commissionAccruedNet) },
              { id: 'released-commission', label: 'Komisi cair', value: formatCurrency(summary?.commissionReleasedNet) },
              { id: 'overtime-approved', label: 'Lembur tunggu', value: formatCurrency(summary?.overtimeApprovedAmount) },
              { id: 'overtime-paid', label: 'Lembur cair', value: formatCurrency(summary?.overtimePaidAmount) },
            ]}
            title="Akun"
          />
        </View>
      </View>
    </ScrollView>
  );
}

function PortalTodayAttendanceCard({
  days,
  loading,
}: {
  days: KolamPortalAttendanceDay[];
  loading: boolean;
}) {
  const today = getTodayKey();
  const row = days.find(item => item.dateKey === today) ?? days[0];

  return (
    <KolamDetailSummaryCard
      fields={[
        { id: 'status', label: 'Status', value: loading ? 'Memuat...' : formatStatus(row?.status) },
        { id: 'check-in', label: 'Masuk', value: formatDateTime(row?.checkInAt) },
        { id: 'check-out', label: 'Keluar', value: formatDateTime(row?.checkOutAt) },
      ]}
      style={styles.gridCard}
      title="Absensi hari ini"
    />
  );
}

function PortalHistoryAttendanceTable({
  days,
  loading,
  page,
  setPage,
}: {
  days: KolamPortalAttendanceDay[];
  loading: boolean;
  page: number;
  setPage: (page: number) => void;
}) {
  const pageSize = 10;
  const rows = paginate(days, page, pageSize);
  const columns: Array<KolamListTableColumn<KolamPortalAttendanceDay>> = [
    { id: 'date', label: 'Tanggal', flex: 1.1, render: row => <CellText>{row.dateKey ?? '-'}</CellText> },
    { id: 'status', label: 'Status', flex: 0.9, align: 'center', render: row => <StatusBadge value={row.status} /> },
    { id: 'in', label: 'Masuk', flex: 1, align: 'center', render: row => <CellText>{formatTime(row.checkInAt)}</CellText> },
    { id: 'out', label: 'Keluar', flex: 1, align: 'center', render: row => <CellText>{formatTime(row.checkOutAt)}</CellText> },
  ];

  return (
    <SectionTable
      columns={columns}
      loading={loading}
      page={page}
      pageSize={pageSize}
      rows={rows}
      setPage={setPage}
      title="Riwayat absensi"
      total={days.length}
    />
  );
}

function PortalPayrollTable({
  loading,
  page,
  rows,
  setPage,
}: {
  loading: boolean;
  page: number;
  rows: KolamPortalPayrollSlip[];
  setPage: (page: number) => void;
}) {
  const pageSize = 10;
  const visibleRows = paginate(rows, page, pageSize);
  const columns: Array<KolamListTableColumn<KolamPortalPayrollSlip>> = [
    { id: 'code', label: 'Slip', flex: 1.2, render: row => <CellText strong>{row.slipCode ?? '-'}</CellText> },
    { id: 'period', label: 'Periode', flex: 1, align: 'center', render: row => <CellText>{row.periodKey ?? '-'}</CellText> },
    { id: 'pay', label: 'THP', flex: 1.1, align: 'right', render: row => <CellText strong>{formatCurrency(row.takeHomePay)}</CellText> },
    { id: 'status', label: 'Status', flex: 0.9, align: 'center', render: row => <StatusBadge value={row.status} /> },
  ];

  return (
    <SectionTable
      columns={columns}
      loading={loading}
      page={page}
      pageSize={pageSize}
      rows={visibleRows}
      setPage={setPage}
      title="Slip gaji"
      total={rows.length}
    />
  );
}

function PortalMoneyTable({
  loading,
  page,
  rows,
  section,
  setPage,
  title,
  valuePicker,
}: {
  loading: boolean;
  page: number;
  rows: PortalMoneyTableRow[];
  section: string;
  setPage: (page: number) => void;
  title: string;
  valuePicker?: (row: PortalMoneyTableRow) => number | undefined;
}) {
  const pageSize = 10;
  const visibleRows = paginate(rows, page, pageSize);
  const columns: Array<KolamListTableColumn<PortalMoneyTableRow>> = [
    { id: 'title', label: 'Data', flex: 1.4, render: row => <CellText strong>{getMoneyRowTitle(row)}</CellText> },
    { id: 'amount', label: 'Jumlah', flex: 1, align: 'right', render: row => <CellText strong>{formatCurrency(valuePicker?.(row) ?? row.amount ?? row.totalAmount ?? row.netPayable)}</CellText> },
    { id: 'status', label: 'Status', flex: 0.8, align: 'center', render: row => <StatusBadge value={row.status} /> },
  ];

  return (
    <SectionTable
      columns={columns}
      loading={loading}
      page={page}
      pageSize={pageSize}
      rows={visibleRows}
      rowKeyPrefix={section}
      setPage={setPage}
      title={title}
      total={rows.length}
    />
  );
}

function PortalTaskTable({
  loading,
  page,
  rows,
  setPage,
}: {
  loading: boolean;
  page: number;
  rows: KolamPortalTaskRow[];
  setPage: (page: number) => void;
}) {
  const pageSize = 10;
  const visibleRows = paginate(rows, page, pageSize);
  const columns: Array<KolamListTableColumn<KolamPortalTaskRow>> = [
    { id: 'title', label: 'Tugas', flex: 1.8, render: row => <CellText strong>{row.title ?? '-'}</CellText> },
    { id: 'priority', label: 'Prioritas', flex: 0.8, align: 'center', render: row => <CellText>{formatStatus(row.priority)}</CellText> },
    { id: 'due', label: 'Jatuh tempo', flex: 1, align: 'center', render: row => <CellText>{formatDate(row.dueDate)}</CellText> },
    { id: 'status', label: 'Status', flex: 0.9, align: 'center', render: row => <StatusBadge value={row.status} /> },
  ];

  return (
    <SectionTable
      columns={columns}
      loading={loading}
      page={page}
      pageSize={pageSize}
      rows={visibleRows}
      rowKeyPrefix="tasks"
      setPage={setPage}
      title="Tugas"
      total={rows.length}
    />
  );
}

function SectionTable<TRow>({
  columns,
  loading,
  page,
  pageSize,
  rows,
  rowKeyPrefix = 'row',
  setPage,
  title,
  total,
}: {
  columns: Array<KolamListTableColumn<TRow>>;
  loading: boolean;
  page: number;
  pageSize: number;
  rows: TRow[];
  rowKeyPrefix?: string;
  setPage: (page: number) => void;
  title: string;
  total: number;
}) {
  return (
    <KolamCardFrame style={styles.tableCard} variant="compact">
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {loading ? <ActivityIndicator color={V.colors.primary} size="small" /> : null}
      </View>
      <KolamListTableComposition
        columns={columns}
        emptyTitle={loading ? 'Memuat...' : 'Belum ada data'}
        getRowKey={(row, index) =>
          getRowId(row) ?? `${rowKeyPrefix}-${page}-${index}`
        }
        pagination={{
          onPageChange: setPage,
          page,
          pageSize,
          total,
        }}
        rows={rows}
      />
    </KolamCardFrame>
  );
}

function CellText({
  children,
  strong = false,
}: {
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <Text numberOfLines={2} style={[styles.cellText, strong ? styles.cellTextStrong : null]}>
      {children}
    </Text>
  );
}

function StatusBadge({ value }: { value?: string | null }) {
  const label = formatStatus(value);
  return (
    <KolamStatusBadge
      intent={getStatusIntent(value)}
      label={label}
      numberOfLines={1}
    />
  );
}

function paginate<TRow>(rows: TRow[], page: number, pageSize: number): TRow[] {
  const safePage = Math.max(1, page);
  return rows.slice((safePage - 1) * pageSize, safePage * pageSize);
}

function getRowId(row: unknown): string | null {
  if (row && typeof row === 'object' && typeof (row as { _id?: unknown })._id === 'string') {
    return (row as { _id: string })._id;
  }
  return null;
}

function getMoneyRowTitle(row: KolamPortalMoneyRow) {
  return row.title ?? row.reason ?? row.type ?? row.periodKey ?? '-';
}

function formatNumber(value?: number | null) {
  return new Intl.NumberFormat('id-ID').format(value ?? 0);
}

function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat('id-ID', {
    currency: 'IDR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value ?? 0);
}

function formatStatus(value?: string | null) {
  if (!value) {
    return '-';
  }
  const map: Record<string, string> = {
    approved: 'Disetujui',
    cancelled: 'Batal',
    done: 'Selesai',
    failed: 'Gagal',
    finalized: 'Final',
    in_progress: 'Berjalan',
    invalidated: 'Batal',
    paid: 'Sudah cair',
    pending: 'Menunggu',
    rejected: 'Ditolak',
    released: 'Cair',
    revoked: 'Dibatalkan',
    todo: 'Todo',
    verified: 'Disetujui',
  };
  return map[value] ?? value.replace(/_/g, ' ');
}

function getStatusIntent(value?: string | null) {
  switch (value) {
    case 'approved':
    case 'done':
    case 'finalized':
    case 'paid':
    case 'released':
    case 'verified':
      return 'success' as const;
    case 'failed':
    case 'invalidated':
    case 'rejected':
    case 'revoked':
      return 'danger' as const;
    case 'pending':
    case 'in_progress':
      return 'warning' as const;
    default:
      return 'muted' as const;
  }
}

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(value?: string | null) {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatTime(value?: string | null) {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return '-';
  }
  return `${formatDate(value)}, ${formatTime(value)}`;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    gap: 14,
    paddingBottom: 28,
    width: '100%',
  },
  layout: {
    gap: 14,
    width: '100%',
  },
  layoutWide: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  mainColumn: {
    gap: 14,
    width: '100%',
  },
  mainColumnWide: {
    flexBasis: '74%',
    flexGrow: 1,
    minWidth: 0,
    width: undefined,
  },
  sideColumn: {
    gap: 14,
    width: '100%',
  },
  sideColumnWide: {
    flexBasis: '24%',
    flexGrow: 0,
    minWidth: 280,
    width: undefined,
  },
  fullWidth: {
    width: '100%',
  },
  twoColumnGrid: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    width: '100%',
  },
  gridCard: {
    flexBasis: 360,
    flexGrow: 1,
    minWidth: 320,
  },
  tableCard: {
    flexBasis: 420,
    flexGrow: 1,
    gap: 10,
    minWidth: 360,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '700',
  },
  cellText: {
    color: V.colors.fg,
    fontSize: 12,
    lineHeight: 17,
  },
  cellTextStrong: {
    fontWeight: '700',
  },
  noticeCard: {
    backgroundColor: V.colors.warningSoft,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noticeText: {
    color: V.colors.warning,
    fontSize: 12,
    lineHeight: 17,
  },
});
