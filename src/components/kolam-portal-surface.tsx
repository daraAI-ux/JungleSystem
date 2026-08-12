import React from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  formatKolamKpiPoints,
  kolamKpiLeaderboardRowLabel,
  type KolamKpiLeaderboard,
  type KolamKpiMeSummary,
} from '../domain/kolam-kpi';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  loadKolamPortalDataset,
  type KolamPortalAttendanceDay,
  type KolamPortalDataset,
  type KolamPortalMoneyRow,
  type KolamPortalPayrollCommissionPeriod,
  type KolamPortalTaskRow,
} from '../services/kolam-employee-portal-api';
import { updateCurrentUserProfile } from '../services/auth-api';
import {
  fetchKolamKpiLeaderboard,
  fetchKolamKpiMeSummary,
} from '../services/kolam-kpi-team-api';
import { KolamButton } from './kolam-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamDetailSummaryCard } from './kolam-detail-summary-card';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamSurfacePanelTabs } from './kolam-surface-panel-tabs';

const DEDUCTION_STATUS: Record<string, string> = {
  pending: 'Menunggu',
  verified: 'Disetujui',
  rejected: 'Ditolak',
};

const KASBON_STATUS: Record<string, string> = {
  pending: 'Menunggu',
  verified: 'Disetujui',
  rejected: 'Ditolak',
};

const OVERTIME_STATUS: Record<string, string> = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  paid: 'Sudah cair',
  failed: 'Gagal',
  invalidated: 'Batal',
};

const TASK_STATUS: Record<string, string> = {
  todo: 'Todo',
  in_progress: 'Berjalan',
  needs_review: 'Review',
  done: 'Selesai',
  cancelled: 'Batal',
};

type PortalWorkTab = 'attendance' | 'tasks';

const PORTAL_WORK_TABS = [
  { id: 'attendance', label: 'Absensi' },
  { id: 'tasks', label: 'Tugas saya' },
] as const;

export function KolamPortalSurface({
  onRouteChange,
}: {
  route?: string;
  onRouteChange?: (route: string) => void;
}) {
  const { authUser } = useKolamAuthContext();
  const { width } = useWindowDimensions();
  const [dataset, setDataset] = React.useState<KolamPortalDataset | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [attendancePage, setAttendancePage] = React.useState(1);
  const [taskPage, setTaskPage] = React.useState(1);
  const [activeWorkTab, setActiveWorkTab] = React.useState<PortalWorkTab>('attendance');
  const isWide = width >= 1180;
  const isEmployee = authUser?.isEmployee;
  const shouldLoad = isEmployee !== false;

  const refresh = React.useCallback(() => {
    if (!shouldLoad) {
      setLoading(false);
      setDataset(null);
      return () => undefined;
    }

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
          setDataset(getEmptyPortalDataset(error));
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
  }, [shouldLoad]);

  React.useEffect(() => refresh(), [refresh]);

  return (
    <View style={styles.root}>
      <View style={[styles.layout, isWide ? styles.layoutWide : null]}>
        <View style={[styles.mainColumn, isWide ? styles.mainColumnWide : null]}>
          {isEmployee === false ? (
            <KolamCardFrame style={styles.accessCard} variant="compact">
              <Text style={styles.mutedText}>
                Konten karyawan (absensi, gaji, dll.) hanya untuk akun dengan
                status karyawan. Gunakan menu admin sesuai hak akses.
              </Text>
            </KolamCardFrame>
          ) : (
            <>
              {dataset?.errorMessage ? (
                <KolamCardFrame style={styles.noticeCard} variant="compact">
                  <Text style={styles.noticeText}>{dataset.errorMessage}</Text>
                </KolamCardFrame>
              ) : null}

              <PortalSummaryCards data={dataset} loading={loading} />

              <PortalWorkTabsSection
                activeTab={activeWorkTab}
                data={dataset}
                attendancePage={attendancePage}
                loading={loading}
                onTabChange={setActiveWorkTab}
                setAttendancePage={setAttendancePage}
                setTaskPage={setTaskPage}
                taskPage={taskPage}
              />

              <View style={styles.threeGrid}>
                <PortalPayrollSlipsSection data={dataset} loading={loading} />
                <PortalCommissionsSection data={dataset} loading={loading} />
                <PortalOvertimeSection data={dataset} loading={loading} />
              </View>

              <View style={styles.threeGrid}>
                <PortalDeductionsSection data={dataset} loading={loading} />
                <PortalBonusesSection data={dataset} loading={loading} />
                <PortalKasbonSection data={dataset} loading={loading} />
              </View>

            </>
          )}
        </View>

        <View style={[styles.sideColumn, isWide ? styles.sideColumnWide : null]}>
          <PortalAccountSettings loading={loading} onRefresh={refresh} />
          {isEmployee === false ? null : (
            <KpiPortalCard onRouteChange={onRouteChange} />
          )}
        </View>
      </View>
    </View>
  );
}

function PortalCard({
  action,
  children,
  sidebar = false,
  style,
  subtitle,
  title,
}: {
  action?: React.ReactNode;
  children: React.ReactNode;
  sidebar?: boolean;
  style?: object;
  subtitle?: string;
  title: string;
}) {
  return (
    <KolamCardFrame
      style={[sidebar ? styles.portalSidebarCard : styles.portalCard, style]}
      variant="compact">
      <View style={styles.portalCardHeader}>
        <View style={styles.portalCardTitleWrap}>
          <Text style={styles.portalCardTitle}>{title}</Text>
          {subtitle ? <Text style={styles.portalCardSubtitle}>{subtitle}</Text> : null}
        </View>
        {action ? <View style={styles.portalCardAction}>{action}</View> : null}
      </View>
      <View style={styles.portalCardBody}>{children}</View>
    </KolamCardFrame>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <Text style={styles.emptyText}>{text}</Text>;
}

function KpiPortalCard({
  onRouteChange,
}: {
  onRouteChange?: (route: string) => void;
}) {
  const [summary, setSummary] = React.useState<KolamKpiMeSummary | null>(null);
  const [leaderboard, setLeaderboard] =
    React.useState<KolamKpiLeaderboard | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    setFailed(false);
    Promise.all([
      fetchKolamKpiMeSummary(),
      fetchKolamKpiLeaderboard({period: 'week', limit: 3}),
    ])
      .then(([nextSummary, nextLeaderboard]) => {
        if (!alive) {
          return;
        }
        setSummary(nextSummary);
        setLeaderboard(nextLeaderboard);
        setFailed(!nextSummary);
      })
      .catch(() => {
        if (alive) {
          setSummary(null);
          setLeaderboard(null);
          setFailed(true);
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

  if (loading) {
    return (
      <PortalCard sidebar style={styles.sidebarCard} subtitle="Memuat..." title="KPI kinerja">
        <View style={styles.kpiLoadingBar} />
      </PortalCard>
    );
  }

  if (failed || !summary) {
    return (
      <PortalCard sidebar style={styles.sidebarCard} title="KPI kinerja">
        <EmptyLine text="Ringkasan KPI tidak tersedia." />
      </PortalCard>
    );
  }

  return (
    <PortalCard
      action={
        <View style={styles.kpiActionRow}>
          {summary.level ? (
            <StatusBadge
              label={summary.level.label}
              style={styles.kpiLevelBadge}
              value="level"
            />
          ) : null}
          <KolamButton
            intent="plain"
            label="Detail"
            onPress={() => onRouteChange?.('/portal/kpi')}
            style={styles.kpiDetailButton}
            textStyle={styles.kpiDetailButtonText}
          />
        </View>
      }
      sidebar
      style={styles.sidebarCard}
      subtitle={summary.scoringEnabled ? summary.period.week : undefined}
      title="KPI kinerja"
    >
      <View style={styles.kpiMetricRow}>
        <View>
          <Text style={styles.kpiMetricLabel}>Minggu ini</Text>
          <Text style={styles.kpiWeekValue}>
            {formatKolamKpiPoints(summary.weekPoints)}
          </Text>
          <DeltaLine delta={summary.weekDelta} />
        </View>
        <View>
          <Text style={styles.kpiMetricLabel}>Bulan ini</Text>
          <Text style={styles.kpiMonthValue}>
            {formatKolamKpiPoints(summary.monthPoints)}
          </Text>
          {summary.rewardAmountRp ? (
            <Text style={styles.smallMuted}>
              Bonus level: Rp {formatNumber(summary.rewardAmountRp)}
            </Text>
          ) : null}
        </View>
      </View>
      {leaderboard?.rows.length ? (
        <View style={styles.kpiLeaderboardBlock}>
          <Text style={styles.kpiMetricLabel}>
            Top 3 minggu ini
            {leaderboard.me ? ` · Anda #${leaderboard.me.rank}` : ''}
          </Text>
          <View style={styles.kpiLeaderboardList}>
            {leaderboard.rows.map(row => {
              const isMe = leaderboard.me?.userId === row.userId;
              return (
                <View key={row.userId} style={styles.kpiLeaderboardRow}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.kpiLeaderboardName,
                      isMe ? styles.kpiLeaderboardMe : null,
                    ]}
                  >
                    {row.rank}. {kolamKpiLeaderboardRowLabel(row)}
                  </Text>
                  <Text style={styles.kpiLeaderboardPoints}>
                    {formatKolamKpiPoints(row.points)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}
      {summary.message ? (
        <Text style={styles.mutedText}>{summary.message}</Text>
      ) : null}
    </PortalCard>
  );
}

function DeltaLine({delta}: {delta: number}) {
  if (delta === 0) {
    return <Text style={styles.kpiDeltaMuted}>Sama dengan minggu lalu</Text>;
  }
  const sign = delta > 0 ? '+' : '';
  return (
    <Text style={[styles.kpiDelta, delta > 0 ? styles.kpiDeltaUp : styles.kpiDeltaDown]}>
      {sign}
      {delta} vs minggu lalu
    </Text>
  );
}

function PortalSummaryCards({
  data,
  loading,
}: {
  data: KolamPortalDataset | null;
  loading: boolean;
}) {
  const summary = data?.summary;
  const items = [
    { id: 'slip', label: 'Slip', value: summary?.finalizedSlips },
    { id: 'potongan', label: 'Potongan', value: summary?.deductions },
    { id: 'kasbon', label: 'Kasbon', value: summary?.activeKasbon },
    { id: 'komisi-tunggu', label: 'Komisi tunggu', value: summary?.commissionAccrued },
    { id: 'komisi-cair', label: 'Komisi cair', value: summary?.commissionReleased },
    { id: 'lembur-tunggu', label: 'Lembur tunggu', value: summary?.overtimeApproved },
    { id: 'lembur-cair', label: 'Lembur cair', value: summary?.overtimePaid },
    { id: 'tugas', label: 'Tugas', value: summary?.openTasks },
    { id: 'bonus', label: 'Bonus', value: summary?.bonusRecords },
  ];

  return (
    <KolamDetailSummaryCard
      fieldColumns={3}
      fields={items.map(item => ({
        id: item.id,
        label: item.label,
        value: loading && !summary ? 'Memuat...' : formatNumber(item.value),
      }))}
      style={[styles.col7, styles.summaryCard]}
      title="Ringkasan"
    />
  );
}

function PortalWorkTabsSection({
  activeTab,
  attendancePage,
  data,
  loading,
  onTabChange,
  setAttendancePage,
  setTaskPage,
  taskPage,
}: {
  activeTab: PortalWorkTab;
  attendancePage: number;
  data: KolamPortalDataset | null;
  loading: boolean;
  onTabChange: (tab: PortalWorkTab) => void;
  setAttendancePage: (page: number) => void;
  setTaskPage: (page: number) => void;
  taskPage: number;
}) {
  const today = data?.todayAttendance;
  const day = today?.day;
  const hasCheckIn = Boolean(day?.checkInAt);
  const hasCheckOut = Boolean(day?.checkOutAt);
  const attendance = data?.attendance;
  const days = attendance?.days ?? [];
  const subtitle = getAttendanceRange(attendance ?? null);
  const pageSize = 10;
  const attendanceRows = paginate(days, attendancePage, pageSize);
  const attendanceColumns: Array<KolamListTableColumn<KolamPortalAttendanceDay>> = [
    {
      id: 'date',
      label: 'Tgl',
      flex: 0.9,
      render: row => <CellText>{row.dateKey ?? '-'}</CellText>,
    },
    {
      id: 'status',
      label: 'Status',
      flex: 1,
      render: row => (
        <StatusBadge
          label={formatAttendanceStatus(row.status)}
          value={row.status}
        />
      ),
    },
    {
      id: 'in',
      label: 'Masuk',
      flex: 1,
      render: row => <CellText>{formatDateTime(row.checkInAt)}</CellText>,
    },
    {
      id: 'out',
      label: 'Keluar',
      flex: 1,
      render: row => <CellText>{formatDateTime(row.checkOutAt)}</CellText>,
    },
  ];
  const tasks = data?.tasks ?? [];
  const taskRows = paginate(tasks, taskPage, pageSize);
  const taskColumns: Array<KolamListTableColumn<KolamPortalTaskRow>> = [
    { id: 'title', label: 'Judul', flex: 1.8, render: row => <CellText strong>{row.title ?? '-'}</CellText> },
    { id: 'project', label: 'Proyek', flex: 1, render: row => <CellText>{getTaskProject(row)}</CellText> },
    { id: 'status', label: 'Status', flex: 0.9, render: row => <StatusBadge value={row.status} label={TASK_STATUS[row.status ?? ''] ?? formatStatus(row.status)} /> },
  ];
  const cardSubtitle =
    activeTab === 'attendance'
      ? subtitle
      : tasks.length
        ? `${tasks.length} item`
        : undefined;

  return (
    <PortalCard subtitle={cardSubtitle} title="Aktivitas">
      <View style={styles.portalTableTabs}>
        <KolamSurfacePanelTabs
          onSelectTab={onTabChange}
          selectedTabId={activeTab}
          tabs={[...PORTAL_WORK_TABS]}
        />
      </View>
      {activeTab === 'attendance' ? (
      <View style={styles.attendanceUnified}>
        <View style={styles.attendanceTodayRow}>
          {loading && !today ? (
            <EmptyLine text="Memuat absensi..." />
          ) : (
            <>
              <View style={styles.attendanceTodayInfo}>
                <Text style={styles.mutedText}>
                  Tanggal: {today?.dateKey ?? '-'}
                </Text>
                <View style={styles.attendanceBadgeRow}>
                  {today?.holiday ? (
                    <StatusBadge label="Hari libur toko" value="holiday" />
                  ) : null}
                  <StatusBadge
                    label={formatAttendanceStatus(day?.status)}
                    value={day?.status ?? 'pending'}
                  />
                </View>
                <Text style={styles.bodyText}>
                  Jam kerja:{' '}
                  <Text style={styles.strongText}>
                    {today?.settings?.workStartTime ?? '-'}
                  </Text>
                </Text>
                {day?.checkInAt ? (
                  <Text style={styles.bodyText}>
                    Check-in: {formatDateTime(day.checkInAt)}
                  </Text>
                ) : null}
                {day?.checkOutAt ? (
                  <Text style={styles.bodyText}>
                    Check-out: {formatDateTime(day.checkOutAt)}
                  </Text>
                ) : null}
                {today?.settings?.requireFace && !today.faceEnrolled ? (
                  <Text style={styles.warningText}>
                    Wajah belum terdaftar - hubungi admin untuk pendaftaran wajah.
                  </Text>
                ) : null}
              </View>
              {!today?.holiday ? (
                <View style={styles.attendanceTodayAction}>
                  {!hasCheckIn ? (
                    <KolamButton disabled label="Check-in" />
                  ) : hasCheckIn && !hasCheckOut ? (
                    <KolamButton disabled label="Check-out" />
                  ) : (
                    <Text style={styles.mutedText}>Absensi hari ini selesai.</Text>
                  )}
                </View>
              ) : null}
            </>
          )}
        </View>
        <View style={styles.attendanceHistoryBlock}>
          <Text style={styles.attendanceHistoryTitle}>Riwayat</Text>
          <KolamListTableComposition
            columns={attendanceColumns}
            emptyTitle={loading ? 'Memuat...' : 'Belum ada data periode ini.'}
            getRowKey={(row, index) => row.dateKey ?? `attendance-${index}`}
            pagination={{ onPageChange: setAttendancePage, page: attendancePage, pageSize, total: days.length }}
            rows={attendanceRows}
          />
        </View>
      </View>
      ) : (
        <KolamListTableComposition
          columns={taskColumns}
          emptyTitle={loading && !data ? 'Memuat...' : 'Tidak ada tugas terbuka.'}
          getRowKey={(row, index) => row._id ?? `task-${index}`}
          pagination={{ onPageChange: setTaskPage, page: taskPage, pageSize, total: tasks.length }}
          rows={taskRows}
        />
      )}
    </PortalCard>
  );
}

function PortalPayrollSlipsSection({
  data,
  loading,
}: {
  data: KolamPortalDataset | null;
  loading: boolean;
}) {
  const periods = getPayrollPeriods(data);
  const slipRows = periods.filter(row => row.slip);
  return (
    <PortalCard title="Slip gaji" subtitle={slipRows.length ? String(slipRows.length) : undefined}>
      {loading && !data ? (
        <EmptyLine text="Memuat..." />
      ) : !slipRows.length ? (
        <EmptyLine text={data?.errorMessage ? 'Slip gaji belum dapat dimuat.' : 'Belum ada slip finalized.'} />
      ) : (
        <CompactList
          rows={slipRows}
          renderRow={row => (
            <View style={styles.compactRowLine}>
              <Text style={[styles.compactPrimary, styles.compactPeriod]}>{row.periodKey}</Text>
              <Text numberOfLines={1} style={styles.compactMuted}>{row.slip?.slipCode ?? '-'}</Text>
              <Text style={styles.compactAmount}>{formatCurrency(row.slip?.takeHomePay)}</Text>
            </View>
          )}
        />
      )}
    </PortalCard>
  );
}

function PortalCommissionsSection({
  data,
  loading,
}: {
  data: KolamPortalDataset | null;
  loading: boolean;
}) {
  const periods = getPayrollPeriods(data);
  const commRows = periods.filter(row => row.commission);
  const totals = data?.payrollCommission?.totals;
  const hasTotals =
    (totals?.commissionPendingNet ?? data?.summary?.commissionAccruedNet ?? 0) > 0 ||
    (totals?.commissionReleasedNet ?? data?.summary?.commissionReleasedNet ?? 0) > 0;
  const subtitle =
    totals || data?.summary
      ? `tunggu ${formatCurrency(totals?.commissionPendingNet ?? data?.summary?.commissionAccruedNet)} · cair ${formatCurrency(totals?.commissionReleasedNet ?? data?.summary?.commissionReleasedNet)}`
      : undefined;

  return (
    <PortalCard title="Komisi" subtitle={subtitle}>
      {loading && !data ? (
        <EmptyLine text="Memuat..." />
      ) : !commRows.length && !hasTotals ? (
        <EmptyLine text="Belum ada komisi." />
      ) : (
        <>
          <CompactList
            rows={commRows}
            renderRow={row => (
              <View style={styles.compactWrapLine}>
                <Text style={[styles.compactPrimary, styles.compactPeriod]}>{row.periodKey}</Text>
                <Text style={styles.compactMuted}>tunggu</Text>
                <Text style={styles.compactPrimary}>{formatCurrency(row.commission?.pendingNet)}</Text>
                <Text style={styles.compactMuted}>· cair</Text>
                <Text style={styles.compactPrimary}>{formatCurrency(row.commission?.releasedNet)}</Text>
              </View>
            )}
          />
          <Text style={styles.smallMuted}>Angka gross. PDF untuk detail.</Text>
        </>
      )}
    </PortalCard>
  );
}

function PortalOvertimeSection({
  data,
  loading,
}: {
  data: KolamPortalDataset | null;
  loading: boolean;
}) {
  const rows = data?.overtime ?? [];
  const subtitle = data?.summary
    ? `tunggu ${formatCurrency(data.summary.overtimeApprovedAmount)} · cair ${formatCurrency(data.summary.overtimePaidAmount)}`
    : undefined;
  return (
    <PortalCard title="Biaya lembur" subtitle={subtitle}>
      {loading && !data ? (
        <EmptyLine text="Memuat..." />
      ) : !rows.length ? (
        <EmptyLine text="Belum ada pengajuan lembur." />
      ) : (
        <CompactList
          rows={rows.slice(0, 12)}
          renderRow={row => (
            <View style={styles.compactRowLine}>
              <Text numberOfLines={1} style={styles.compactPrimary}>{row.title ?? row.reason ?? row.type ?? '-'}</Text>
              <StatusBadge value={row.status} label={OVERTIME_STATUS[row.status ?? ''] ?? formatStatus(row.status)} />
              <Text style={styles.compactAmount}>{formatCurrency(row.amount)}</Text>
            </View>
          )}
        />
      )}
    </PortalCard>
  );
}

function PortalDeductionsSection({
  data,
  loading,
}: {
  data: KolamPortalDataset | null;
  loading: boolean;
}) {
  return (
    <PortalCard title="Potongan" subtitle={data?.deductions.length ? String(data.deductions.length) : undefined}>
      <MoneyCompactSection
        empty="Tidak ada"
        loading={loading && !data}
        rows={data?.deductions ?? []}
        statusMap={DEDUCTION_STATUS}
      />
    </PortalCard>
  );
}

function PortalBonusesSection({
  data,
  loading,
}: {
  data: KolamPortalDataset | null;
  loading: boolean;
}) {
  return (
    <PortalCard title="Bonus" subtitle={data?.bonuses.length ? String(data.bonuses.length) : undefined}>
      <MoneyCompactSection
        empty="Belum ada"
        loading={loading && !data}
        rows={data?.bonuses ?? []}
      />
    </PortalCard>
  );
}

function PortalKasbonSection({
  data,
  loading,
}: {
  data: KolamPortalDataset | null;
  loading: boolean;
}) {
  return (
    <PortalCard
      action={<KolamButton disabled label="Ajukan kasbon" />}
      subtitle={data?.kasbon.length ? String(data.kasbon.length) : undefined}
      title="Kasbon"
    >
      <MoneyCompactSection
        empty="Tidak ada"
        loading={loading && !data}
        rows={data?.kasbon ?? []}
        statusMap={KASBON_STATUS}
      />
    </PortalCard>
  );
}

function MoneyCompactSection({
  empty,
  loading,
  rows,
  statusMap,
}: {
  empty: string;
  loading: boolean;
  rows: KolamPortalMoneyRow[];
  statusMap?: Record<string, string>;
}) {
  if (loading) {
    return <EmptyLine text="Memuat..." />;
  }
  if (!rows.length) {
    return <EmptyLine text={empty} />;
  }
  return (
    <CompactList
      rows={rows}
      renderRow={row => (
        <View style={styles.compactRow}>
          <View style={styles.compactTextBlock}>
            <Text numberOfLines={1} style={styles.compactPrimary}>
              {row.title ?? row.reason ?? row.type ?? row.periodKey ?? '-'}
            </Text>
            {row.reason && row.title ? (
              <Text numberOfLines={1} style={styles.compactMuted}>{row.reason}</Text>
            ) : row.status ? (
              <Text style={styles.compactMuted}>{statusMap?.[row.status] ?? formatStatus(row.status)}</Text>
            ) : null}
          </View>
          <Text style={styles.compactAmount}>
            {formatCurrency(row.amount ?? row.totalAmount ?? row.netPayable)}
          </Text>
        </View>
      )}
    />
  );
}

function PortalAccountSettings({
  loading,
  onRefresh,
}: {
  loading: boolean;
  onRefresh: () => void;
}) {
  const { authUser, displayName } = useKolamAuthContext();
  const [savedUser, setSavedUser] = React.useState(authUser);
  const effectiveUser = savedUser ?? authUser;
  const name = displayName || [effectiveUser?.firstName, effectiveUser?.lastName].filter(Boolean).join(' ').trim() || '-';
  const initials = getInitials(name || effectiveUser?.username || effectiveUser?.email);
  const [form, setForm] = React.useState({
    firstName: effectiveUser?.firstName ?? '',
    lastName: effectiveUser?.lastName ?? '',
    email: effectiveUser?.email ?? '',
    phoneNumber: effectiveUser?.phoneNumber ?? '',
  });
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    setSavedUser(authUser);
    setForm({
      firstName: authUser?.firstName ?? '',
      lastName: authUser?.lastName ?? '',
      email: authUser?.email ?? '',
      phoneNumber: authUser?.phoneNumber ?? '',
    });
  }, [authUser]);

  const updateForm = React.useCallback(
    (field: keyof typeof form) => (value: string) => {
      setForm(current => ({ ...current, [field]: value }));
      setMessage('');
    },
    [],
  );

  const handleSave = React.useCallback(async () => {
    setSaving(true);
    setMessage('');
    try {
      const nextUser = await updateCurrentUserProfile({
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim(),
        phone_number: form.phoneNumber.trim(),
      });
      setSavedUser(nextUser);
      setForm({
        firstName: nextUser.firstName ?? '',
        lastName: nextUser.lastName ?? '',
        email: nextUser.email ?? '',
        phoneNumber: nextUser.phoneNumber ?? '',
      });
      setMessage('Tersimpan');
      onRefresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  }, [form.email, form.firstName, form.lastName, form.phoneNumber, onRefresh]);

  return (
    <PortalCard
      action={
        <KolamButton
          disabled={loading || saving}
          label={saving ? 'Menyimpan' : 'Simpan'}
          onPress={handleSave}
        />
      }
      sidebar
      style={styles.sidebarCard}
      subtitle="Profil & keamanan"
      title="Pengaturan Akun"
    >
      <View style={styles.accountField}>
        <View style={styles.accountFieldHeader}>
          <View>
            <Text style={styles.accountLabel}>Foto profil</Text>
            <Text style={styles.smallMuted}>JPG/PNG maks. 2MB</Text>
          </View>
          <KolamButton disabled label="Unggah" />
        </View>
        <View style={styles.profileRow}>
          <View style={styles.avatarWrap}>
            {effectiveUser?.profilePhotoUrl ? (
              <Image source={{ uri: effectiveUser.profilePhotoUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
          <View style={styles.profileText}>
            <Text numberOfLines={1} style={styles.compactPrimary}>{name}</Text>
            {effectiveUser?.username ? (
              <Text numberOfLines={1} style={styles.compactMuted}>@{effectiveUser.username}</Text>
            ) : null}
          </View>
        </View>
      </View>
      <View style={styles.accountFieldsStack}>
        <AccountEditableField
          label="Nama depan"
          onChangeText={updateForm('firstName')}
          value={form.firstName}
        />
        <AccountEditableField
          label="Nama belakang"
          onChangeText={updateForm('lastName')}
          value={form.lastName}
        />
        <AccountEditableField label="Username" readOnly value={effectiveUser?.username ?? ''} />
        <AccountEditableField
          label="Email"
          onChangeText={updateForm('email')}
          value={form.email}
        />
        <AccountEditableField
          label="Telepon"
          onChangeText={updateForm('phoneNumber')}
          value={form.phoneNumber}
        />
        <View style={styles.accountField}>
          <View style={styles.accountFieldHeader}>
            <Text style={styles.accountLabel}>Kata sandi</Text>
            <KolamButton disabled label="Ubah" size="sm" />
          </View>
          <Text numberOfLines={1} style={styles.bodyText}>
            ********
          </Text>
        </View>
      </View>
      {message ? <Text style={styles.accountMessage}>{message}</Text> : null}
    </PortalCard>
  );
}

function AccountEditableField({
  label,
  onChangeText,
  readOnly = false,
  value,
}: {
  label: string;
  onChangeText?: (value: string) => void;
  readOnly?: boolean;
  value?: string | null;
}) {
  return (
    <View style={styles.accountField}>
      <Text style={styles.accountLabel}>{label}</Text>
      <TextInput
        editable={!readOnly}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor={V.colors.mutedFg}
        style={[styles.accountInput, readOnly ? styles.accountInputReadOnly : null]}
        value={value ?? ''}
      />
    </View>
  );
}

function CompactList<TRow>({
  renderRow,
  rows,
}: {
  renderRow: (row: TRow) => React.ReactNode;
  rows: TRow[];
}) {
  return (
    <View style={styles.compactList}>
      {rows.map((row, index) => (
        <View key={getRowId(row) ?? `compact-${index}`} style={styles.compactListItem}>
          {renderRow(row)}
        </View>
      ))}
    </View>
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

function StatusBadge({
  label,
  style,
  value,
}: {
  label?: string;
  style?: object;
  value?: string | null;
}) {
  return (
    <KolamStatusBadge
      intent={getStatusIntent(value)}
      label={label ?? formatStatus(value)}
      numberOfLines={1}
      style={style}
    />
  );
}

function getEmptyPortalDataset(error: unknown): KolamPortalDataset {
  return {
    attendance: null,
    bonuses: [],
    commissions: [],
    deductions: [],
    errorMessage:
      error instanceof Error ? error.message : 'Portal belum dapat dimuat.',
    kasbon: [],
    overtime: [],
    payrollCommission: null,
    payrollSlips: [],
    summary: null,
    tasks: [],
    todayAttendance: null,
  };
}

function getPayrollPeriods(
  data: KolamPortalDataset | null,
): KolamPortalPayrollCommissionPeriod[] {
  if (data?.payrollCommission?.periods?.length) {
    return data.payrollCommission.periods;
  }
  return (data?.payrollSlips ?? []).map(slip => ({
    periodKey: slip.periodKey ?? '-',
    slip: {
      _id: slip._id,
      periodKey: slip.periodKey,
      slipCode: slip.slipCode,
      takeHomePay: slip.takeHomePay,
    },
    commission: null,
  }));
}

function paginate<TRow>(rows: TRow[], page: number, pageSize: number): TRow[] {
  const safePage = Math.max(1, page);
  return rows.slice((safePage - 1) * pageSize, safePage * pageSize);
}

function getRowId(row: unknown): string | null {
  if (row && typeof row === 'object' && typeof (row as { _id?: unknown })._id === 'string') {
    return (row as { _id: string })._id;
  }
  if (row && typeof row === 'object' && typeof (row as { periodKey?: unknown }).periodKey === 'string') {
    return (row as { periodKey: string }).periodKey;
  }
  return null;
}

function getTaskProject(row: KolamPortalTaskRow): string {
  const project = (row as { project?: unknown }).project;
  if (project && typeof project === 'object') {
    const record = project as { quotationNumber?: string; code?: string; name?: string };
    return record.quotationNumber ?? record.code ?? record.name ?? '-';
  }
  return typeof project === 'string' ? project : '-';
}

function getAttendanceRange(attendance: KolamPortalDataset['attendance']) {
  if (!attendance) {
    return undefined;
  }
  const start = attendance.bounds?.periodStart;
  const end = attendance.bounds?.periodEnd;
  if (start && end) {
    return `${formatDate(start)} - ${formatDate(end)}`;
  }
  return attendance.periodKey;
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
  return value.replace(/_/g, ' ');
}

function formatAttendanceStatus(value?: string | null) {
  const map: Record<string, string> = {
    absent: 'Tidak hadir',
    late: 'Terlambat',
    on_time: 'Tepat waktu',
    pending: 'Belum absen',
    present: 'Hadir',
  };
  return map[value ?? ''] ?? formatStatus(value);
}

function getStatusIntent(value?: string | null) {
  switch (value) {
    case 'approved':
    case 'done':
    case 'finalized':
    case 'on_time':
    case 'paid':
    case 'present':
    case 'released':
    case 'verified':
      return 'success' as const;
    case 'absent':
    case 'cancelled':
    case 'failed':
    case 'invalidated':
    case 'rejected':
    case 'revoked':
      return 'danger' as const;
    case 'holiday':
    case 'pending':
    case 'in_progress':
    case 'late':
      return 'warning' as const;
    default:
      return 'muted' as const;
  }
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

function formatDateTime(value?: string | null) {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getInitials(value?: string | null) {
  const parts = String(value ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) {
    return 'U';
  }
  return parts.slice(0, 2).map(part => part[0]?.toUpperCase()).join('');
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
  },
  layout: {
    gap: 16,
    width: '100%',
  },
  layoutWide: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mainColumn: {
    gap: 16,
    width: '100%',
  },
  mainColumnWide: {
    flex: 3,
    minWidth: 520,
    width: undefined,
  },
  sideColumn: {
    gap: 16,
    width: '100%',
  },
  sideColumnWide: {
    flex: 1,
    minWidth: 260,
    width: undefined,
  },
  twelveGrid: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    width: '100%',
  },
  threeGrid: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    width: '100%',
  },
  col5: {
    flexBasis: 300,
    flexGrow: 5,
    minWidth: 280,
  },
  col7: {
    flexBasis: 420,
    flexGrow: 7,
    minWidth: 340,
  },
  portalCard: {
    flexBasis: 280,
    flexGrow: 1,
    minWidth: 260,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  portalSidebarCard: {
    alignSelf: 'stretch',
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    width: '100%',
  },
  portalCardHeader: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  portalCardTitleWrap: {
    alignItems: 'baseline',
    flexDirection: 'row',
    flexShrink: 1,
    flexWrap: 'wrap',
    gap: 8,
  },
  portalCardTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '700',
  },
  portalCardSubtitle: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 16,
  },
  portalCardAction: {
    flexShrink: 0,
  },
  portalCardBody: {
    minWidth: 0,
    padding: 12,
  },
  portalTableTabs: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  summaryCard: {
    minWidth: 340,
    width: '100%',
  },
  sidebarCard: {
    width: '100%',
  },
  kpiActionRow: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
    minHeight: 30,
  },
  kpiLevelBadge: {
    alignSelf: 'center',
    minHeight: 30,
    paddingVertical: 0,
  },
  kpiDetailButton: {
    alignSelf: 'center',
    minHeight: 30,
    paddingVertical: 0,
  },
  kpiDetailButtonText: {
    lineHeight: 18,
  },
  kpiLoadingBar: {
    backgroundColor: V.colors.mutedSoft,
    borderRadius: 6,
    height: 40,
    width: '100%',
  },
  kpiMetricRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  kpiMetricLabel: {
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  kpiWeekValue: {
    color: V.colors.fg,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 30,
  },
  kpiMonthValue: {
    color: V.colors.fg,
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 24,
  },
  kpiDelta: {
    fontSize: 12,
    lineHeight: 16,
  },
  kpiDeltaMuted: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 16,
  },
  kpiDeltaUp: {
    color: V.colors.success,
  },
  kpiDeltaDown: {
    color: V.colors.danger,
  },
  kpiLeaderboardBlock: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    gap: 4,
    marginTop: 12,
    paddingTop: 8,
  },
  kpiLeaderboardList: {
    gap: 3,
  },
  kpiLeaderboardRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  kpiLeaderboardName: {
    color: V.colors.fg,
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    minWidth: 0,
  },
  kpiLeaderboardMe: {
    color: V.colors.primary,
    fontWeight: '700',
  },
  kpiLeaderboardPoints: {
    color: V.colors.fg,
    flexShrink: 0,
    fontSize: 12,
    lineHeight: 17,
  },
  attendanceUnified: {
    gap: 12,
  },
  attendanceTodayRow: {
    alignItems: 'stretch',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 12,
  },
  attendanceTodayInfo: {
    flex: 1,
    gap: 8,
    minWidth: 280,
  },
  attendanceTodayAction: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    minWidth: 140,
  },
  attendanceBadgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  attendanceHistoryBlock: {
    gap: 8,
  },
  attendanceHistoryTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
  },
  compactList: {
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    maxHeight: 220,
    overflow: 'hidden',
  },
  compactListItem: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  compactRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  compactRowLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  compactWrapLine: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  compactTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  compactPrimary: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  compactPeriod: {
    minWidth: 58,
  },
  compactMuted: {
    color: V.colors.mutedFg,
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  compactAmount: {
    color: V.colors.fg,
    flexShrink: 0,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    marginLeft: 'auto',
  },
  cellText: {
    color: V.colors.fg,
    fontSize: 12,
    lineHeight: 17,
  },
  cellTextStrong: {
    fontWeight: '700',
  },
  mutedText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 18,
  },
  smallMuted: {
    color: V.colors.mutedFg,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 8,
  },
  emptyText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 18,
  },
  bodyText: {
    color: V.colors.fg,
    fontSize: 12,
    lineHeight: 18,
  },
  strongText: {
    fontWeight: '700',
  },
  warningText: {
    color: V.colors.warning,
    fontSize: 12,
    lineHeight: 17,
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
  accessCard: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  accountField: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    gap: 8,
    paddingVertical: 12,
  },
  accountFieldHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  accountLabel: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
  },
  profileRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  avatarWrap: {
    alignItems: 'center',
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 32,
    borderWidth: 1,
    height: 64,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 64,
  },
  avatarImage: {
    height: 64,
    width: 64,
  },
  avatarText: {
    color: V.colors.mutedFg,
    fontSize: 16,
    fontWeight: '800',
  },
  profileText: {
    flex: 1,
    minWidth: 0,
  },
  accountFieldsStack: {
    minWidth: 0,
  },
  accountInput: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    minHeight: 36,
    paddingHorizontal: 10,
    paddingVertical: 0,
  },
  accountInputReadOnly: {
    backgroundColor: V.colors.mutedSoft,
    color: V.colors.mutedFg,
  },
  accountMessage: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
});
