import React from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
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
import {
  fetchKolamKpiLeaderboard,
  fetchKolamKpiMeSummary,
} from '../services/kolam-kpi-team-api';
import { KolamButton } from './kolam-button';
import { KolamCardFrame } from './kolam-card-frame';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import { KolamStatusBadge } from './kolam-status-badge';

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
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
      style={styles.root}
    >
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

              <View style={styles.twelveGrid}>
                <KpiPortalCard onRouteChange={onRouteChange} />
                <PortalSummaryCards data={dataset} loading={loading} />
              </View>

              <View style={styles.twelveGrid}>
                <PortalAttendanceToday data={dataset} loading={loading} />
                <PortalAttendanceHistory
                  data={dataset}
                  loading={loading}
                  page={attendancePage}
                  setPage={setAttendancePage}
                />
              </View>

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

              <PortalTasksSection
                data={dataset}
                loading={loading}
                page={taskPage}
                setPage={setTaskPage}
              />
            </>
          )}
        </View>

        <View style={[styles.sideColumn, isWide ? styles.sideColumnWide : null]}>
          <PortalAccountSettings loading={loading} onRefresh={refresh} />
        </View>
      </View>
    </ScrollView>
  );
}

function PortalCard({
  action,
  children,
  style,
  subtitle,
  title,
}: {
  action?: React.ReactNode;
  children: React.ReactNode;
  style?: object;
  subtitle?: string;
  title: string;
}) {
  return (
    <KolamCardFrame style={[styles.portalCard, style]} variant="compact">
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
      <PortalCard style={styles.col5} subtitle="Memuat..." title="KPI kinerja">
        <View style={styles.kpiLoadingBar} />
      </PortalCard>
    );
  }

  if (failed || !summary) {
    return (
      <PortalCard style={styles.col5} title="KPI kinerja">
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
      style={styles.col5}
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
    { label: 'Slip', value: summary?.finalizedSlips },
    { label: 'Potongan', value: summary?.deductions },
    { label: 'Kasbon', value: summary?.activeKasbon },
    { label: 'Komisi tunggu', value: summary?.commissionAccrued },
    { label: 'Komisi cair', value: summary?.commissionReleased },
    { label: 'Lembur tunggu', value: summary?.overtimeApproved },
    { label: 'Lembur cair', value: summary?.overtimePaid },
    { label: 'Tugas', value: summary?.openTasks },
    { label: 'Bonus', value: summary?.bonusRecords },
  ];

  return (
    <View style={[styles.summaryWrap, styles.col7]}>
      {items.map((item, index) => (
        <View key={item.label} style={styles.summaryChip}>
          {loading && !summary ? (
            <ActivityIndicator color={V.colors.primary} size="small" />
          ) : (
            <>
              <Text style={styles.summaryLabel}>{item.label}</Text>
              <Text style={styles.summaryValue}>{formatNumber(item.value)}</Text>
            </>
          )}
        </View>
      ))}
      {loading && !summary && indexPlaceholder(items.length)}
    </View>
  );
}

function PortalAttendanceToday({
  data,
  loading,
}: {
  data: KolamPortalDataset | null;
  loading: boolean;
}) {
  const today = data?.todayAttendance;
  const day = today?.day;
  const hasCheckIn = Boolean(day?.checkInAt);
  const hasCheckOut = Boolean(day?.checkOutAt);
  return (
    <PortalCard style={styles.col5} title="Absensi hari ini">
      {loading && !today ? (
        <EmptyLine text="Memuat absensi..." />
      ) : (
        <View style={styles.attendanceBlock}>
          <View style={styles.innerBox}>
            <Text style={styles.mutedText}>Tanggal: {today?.dateKey ?? '-'}</Text>
            {today?.holiday ? <StatusBadge value="holiday" label="Hari libur toko" /> : null}
            <StatusBadge value={day?.status ?? 'pending'} label={formatAttendanceStatus(day?.status)} />
            <Text style={styles.bodyText}>
              Jam kerja: <Text style={styles.strongText}>{today?.settings?.workStartTime ?? '-'}</Text>
            </Text>
            {day?.checkInAt ? (
              <Text style={styles.bodyText}>Check-in: {formatDateTime(day.checkInAt)}</Text>
            ) : null}
            {day?.checkOutAt ? (
              <Text style={styles.bodyText}>Check-out: {formatDateTime(day.checkOutAt)}</Text>
            ) : null}
            {today?.settings?.requireFace && !today.faceEnrolled ? (
              <Text style={styles.warningText}>
                Wajah belum terdaftar - hubungi admin untuk pendaftaran wajah.
              </Text>
            ) : null}
          </View>
          {!today?.holiday ? (
            <View style={styles.innerBox}>
              {!hasCheckIn ? (
                <KolamButton disabled label="Check-in" />
              ) : hasCheckIn && !hasCheckOut ? (
                <KolamButton disabled label="Check-out" />
              ) : (
                <Text style={styles.mutedText}>Absensi hari ini selesai.</Text>
              )}
            </View>
          ) : null}
        </View>
      )}
    </PortalCard>
  );
}

function PortalAttendanceHistory({
  data,
  loading,
  page,
  setPage,
}: {
  data: KolamPortalDataset | null;
  loading: boolean;
  page: number;
  setPage: (page: number) => void;
}) {
  const attendance = data?.attendance;
  const days = attendance?.days ?? [];
  const subtitle = getAttendanceRange(attendance ?? null);
  const pageSize = 10;
  const rows = paginate(days, page, pageSize);
  const columns: Array<KolamListTableColumn<KolamPortalAttendanceDay>> = [
    { id: 'date', label: 'Tgl', flex: 0.9, render: row => <CellText>{row.dateKey ?? '-'}</CellText> },
    { id: 'status', label: 'Status', flex: 1, render: row => <StatusBadge value={row.status} label={formatAttendanceStatus(row.status)} /> },
    { id: 'in', label: 'Masuk', flex: 1, render: row => <CellText>{formatDateTime(row.checkInAt)}</CellText> },
    { id: 'out', label: 'Keluar', flex: 1, render: row => <CellText>{formatDateTime(row.checkOutAt)}</CellText> },
  ];

  return (
    <PortalCard style={styles.col7} subtitle={loading ? 'Memuat...' : subtitle} title="Riwayat absensi">
      <KolamListTableComposition
        columns={columns}
        emptyTitle={loading ? 'Memuat...' : 'Belum ada data periode ini.'}
        getRowKey={(row, index) => row.dateKey ?? `attendance-${index}`}
        pagination={{ onPageChange: setPage, page, pageSize, total: days.length }}
        rows={rows}
      />
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

function PortalTasksSection({
  data,
  loading,
  page,
  setPage,
}: {
  data: KolamPortalDataset | null;
  loading: boolean;
  page: number;
  setPage: (page: number) => void;
}) {
  const tasks = data?.tasks ?? [];
  const pageSize = 10;
  const rows = paginate(tasks, page, pageSize);
  const columns: Array<KolamListTableColumn<KolamPortalTaskRow>> = [
    { id: 'title', label: 'Judul', flex: 1.8, render: row => <CellText strong>{row.title ?? '-'}</CellText> },
    { id: 'project', label: 'Proyek', flex: 1, render: row => <CellText>{getTaskProject(row)}</CellText> },
    { id: 'status', label: 'Status', flex: 0.9, render: row => <StatusBadge value={row.status} label={TASK_STATUS[row.status ?? ''] ?? formatStatus(row.status)} /> },
  ];

  return (
    <PortalCard subtitle={tasks.length ? `${tasks.length} item` : undefined} title="Tugas saya">
      <KolamListTableComposition
        columns={columns}
        emptyTitle={loading && !data ? 'Memuat...' : 'Tidak ada tugas terbuka.'}
        getRowKey={(row, index) => row._id ?? `task-${index}`}
        pagination={{ onPageChange: setPage, page, pageSize, total: tasks.length }}
        rows={rows}
      />
    </PortalCard>
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
  const name = displayName || [authUser?.firstName, authUser?.lastName].filter(Boolean).join(' ').trim() || '-';
  const initials = getInitials(name || authUser?.username || authUser?.email);

  return (
    <PortalCard
      action={<KolamButton disabled={loading} label={loading ? 'Memuat' : 'Refresh'} onPress={onRefresh} />}
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
            {authUser?.profilePhotoUrl ? (
              <Image source={{ uri: authUser.profilePhotoUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
          <View style={styles.profileText}>
            <Text numberOfLines={1} style={styles.compactPrimary}>{name}</Text>
            {authUser?.username ? (
              <Text numberOfLines={1} style={styles.compactMuted}>@{authUser.username}</Text>
            ) : null}
          </View>
        </View>
      </View>
      <AccountReadOnlyField label="Nama depan" value={authUser?.firstName} />
      <AccountReadOnlyField label="Nama belakang" value={authUser?.lastName} />
      <AccountReadOnlyField label="Username" value={authUser?.username} />
      <AccountReadOnlyField label="Email" value={authUser?.email} />
      <AccountReadOnlyField label="Telepon" value="-" />
      <View style={styles.accountField}>
        <View style={styles.accountFieldHeader}>
          <View>
            <Text style={styles.accountLabel}>Kata sandi</Text>
            <Text style={styles.smallMuted}>Gunakan kata sandi yang kuat</Text>
          </View>
          <KolamButton disabled label="Ubah" />
        </View>
        <Text style={styles.bodyText}>********</Text>
      </View>
    </PortalCard>
  );
}

function AccountReadOnlyField({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.accountField}>
      <Text style={styles.accountLabel}>{label}</Text>
      <View style={styles.inputLike}>
        <Text numberOfLines={1} style={styles.inputLikeText}>{value || '-'}</Text>
      </View>
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

function indexPlaceholder(_count: number) {
  return null;
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
  scrollContent: {
    paddingBottom: 28,
    width: '100%',
  },
  layout: {
    gap: 16,
    width: '100%',
  },
  layoutWide: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  mainColumn: {
    gap: 16,
    width: '100%',
  },
  mainColumnWide: {
    flexBasis: '66%',
    flexGrow: 1,
    minWidth: 0,
    width: undefined,
  },
  sideColumn: {
    gap: 16,
    width: '100%',
  },
  sideColumnWide: {
    flexBasis: '32%',
    flexGrow: 0,
    minWidth: 320,
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
    flex: 1,
    padding: 12,
  },
  summaryWrap: {
    alignContent: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryChip: {
    alignItems: 'center',
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 36,
    minWidth: 88,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  summaryLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  summaryValue: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '700',
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
  attendanceBlock: {
    gap: 12,
  },
  innerBox: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 12,
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
  inputLike: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  inputLikeText: {
    color: V.colors.fg,
    fontSize: 12,
  },
});
