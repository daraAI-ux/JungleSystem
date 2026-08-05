import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  formatKolamPayrollPeriodStatusLabel,
  getKolamPayrollPeriodStatusIntent,
  KOLAM_PAYROLL_MONTH_OPTIONS,
  KOLAM_PAYROLL_ROOT,
  buildKolamPayrollPeriodRoute,
  buildKolamPayrollSlipRoute,
  type KolamPayrollPendingEmployee,
  type KolamPayrollPeriod,
  type KolamPayrollSlip,
} from '../domain/kolam-payroll';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamPayrollController,
  type KolamPayrollController,
} from '../hooks/use-kolam-payroll-controller';
import { formatRupiah } from '../lib/money';
import { KolamButton } from './kolam-button';
import { KolamRefreshButton } from './kolam-refresh-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

const PERIOD_COLUMNS = [
  { id: 'period', label: 'Periode', flex: 1 },
  { id: 'status', label: 'Status', flex: 0.8 },
  { id: 'slips', label: 'Slip', flex: 0.6 },
  { id: 'thp', label: 'THP', flex: 1 },
  { id: 'wallet', label: 'Dompet', flex: 1 },
  { id: 'action', label: '', flex: 0.7 },
] as const;

const SLIP_COLUMNS = [
  { id: 'code', label: 'Kode', flex: 0.9 },
  { id: 'employee', label: 'Karyawan', flex: 1.2 },
  { id: 'thp', label: 'THP', flex: 1 },
  { id: 'pkp', label: 'PKP', flex: 0.5 },
  { id: 'action', label: '', flex: 1.1 },
] as const;

const PENDING_COLUMNS = [
  { id: 'name', label: 'Karyawan', flex: 1.6 },
  { id: 'salary', label: 'Pokok', flex: 1 },
  { id: 'action', label: '', flex: 0.8 },
] as const;

type DetailListTab = 'slips' | 'pending';

export function KolamPayrollSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamPayrollController(route, onRouteChange);

  if (!controller.canView) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState compact title="Akses ditolak" />
      </View>
    );
  }

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

      {controller.mode === 'list' ? (
        <PayrollListBody controller={controller} onRouteChange={onRouteChange} />
      ) : null}
      {controller.mode === 'detail' ? (
        <PayrollDetailBody
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : null}
      {controller.mode === 'slip' ? (
        <PayrollSlipBody controller={controller} onRouteChange={onRouteChange} />
      ) : null}
      {controller.mode === 'unsupported' ? (
        <KolamEmptyState title="Belum tersedia" />
      ) : null}
    </View>
  );
}

function PayrollListBody({
  controller,
  onRouteChange,
}: {
  controller: KolamPayrollController;
  onRouteChange?: (route: string) => void;
}) {
  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear();
    return [y - 1, y, y + 1].map(value => ({
      label: String(value),
      value: String(value),
    }));
  }, []);

  const monthOptions = KOLAM_PAYROLL_MONTH_OPTIONS.map(option => ({
    label: option.label,
    value: String(option.value),
  }));

  const renderRow = ({ item }: { item: KolamPayrollPeriod }) => (
    <View style={styles.row}>
      <View style={[styles.cell, { flex: 1 }]}>
        <Text style={styles.primaryText}>{item.periodKey}</Text>
      </View>
      <View style={[styles.cell, { flex: 0.8 }]}>
        <KolamStatusBadge
          intent={getKolamPayrollPeriodStatusIntent(item.status)}
          label={formatKolamPayrollPeriodStatusLabel(item.status)}
        />
      </View>
      <View style={[styles.cell, { flex: 0.6 }]}>
        <Text style={styles.metaText}>{item.slipCount}</Text>
      </View>
      <View style={[styles.cell, { flex: 1 }]}>
        <Text style={styles.primaryText}>
          {formatRupiah(item.totalTakeHome)}
        </Text>
      </View>
      <View style={[styles.cell, { flex: 1 }]}>
        <Text numberOfLines={1} style={styles.metaText}>
          {item.walletName || '—'}
        </Text>
      </View>
      <View style={[styles.cell, { flex: 0.7 }]}>
        <KolamButton
          intent="secondary"
          label="Buka"
          onPress={() =>
            onRouteChange?.(buildKolamPayrollPeriodRoute(item.periodKey))
          }
          style={styles.rowAction}
        />
      </View>
    </View>
  );

  return (
    <>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <KolamFormTextField
              onChangeText={controller.onSearchChange}
              placeholder="Cari periode"
              style={styles.searchInput}
              value={controller.search}
            />
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamRefreshButton
              accessibilityLabel="Muat ulang"
              intent="secondary"

              onPress={() => {
                void controller.onRefresh();
              }}
              style={styles.toolbarButton}
            />
          </View>
        </View>
      </View>

      {controller.canCreate ? (
        <KolamCardFrame style={styles.createCard}>
          <Text style={styles.sectionTitle}>Buat periode</Text>
          <View style={styles.createRow}>
            <KolamDropdownSelect
              label="Tahun"
              onChange={value =>
                controller.onCreateYearChange(
                  Number(value) || new Date().getFullYear(),
                )
              }
              options={yearOptions}
              value={String(controller.createYear)}
            />
            <KolamDropdownSelect
              label="Bulan"
              onChange={value =>
                controller.onCreateMonthChange(Number(value) || 1)
              }
              options={monthOptions}
              value={String(controller.createMonth)}
            />
            <KolamButton
              disabled={controller.mutating}
              intent="primary"
              label={controller.mutating ? 'Membuat…' : 'Buat periode'}
              onPress={() => {
                void controller.onCreatePeriod();
              }}
              style={styles.createButton}
            />
          </View>
        </KolamCardFrame>
      ) : null}

      <KolamCatalogListTableShell footer={null} style={styles.tableFrame}>
        <FlatList
          data={controller.filteredPeriods}
          keyExtractor={item => item.id || item.periodKey}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <KolamEmptyState
                compact
                title={controller.loading ? 'Memuat…' : 'Belum ada periode'}
              />
            </View>
          }
          ListHeaderComponent={
            <View style={styles.headerRow}>
              {PERIOD_COLUMNS.map(column => (
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
        />
      </KolamCatalogListTableShell>
    </>
  );
}

function PayrollDetailBody({
  controller,
  onRouteChange,
}: {
  controller: KolamPayrollController;
  onRouteChange?: (route: string) => void;
}) {
  const [listTab, setListTab] = useState<DetailListTab>('slips');
  const [employeeSearch, setEmployeeSearch] = useState('');

  const period = controller.detail?.period;
  const isFinal = period?.status === 'finalized';
  const slips = controller.detail?.slips ?? [];
  const pending = controller.detail?.pendingEmployees ?? [];
  const showPendingTab = !isFinal && pending.length > 0;

  useEffect(() => {
    if (!showPendingTab && listTab === 'pending') {
      setListTab('slips');
    }
  }, [listTab, showPendingTab]);

  const walletOptions = controller.wallets.map(wallet => ({
    label: `${wallet.name} (${formatRupiah(wallet.currentBalance)})`,
    value: wallet.id,
  }));

  const filteredSlips = useMemo(() => {
    const q = employeeSearch.trim().toLowerCase();
    if (!q) {
      return slips;
    }
    return slips.filter(row => {
      const haystack = `${row.userLabel} ${row.employeeNumber} ${row.slipCode}`
        .trim()
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [employeeSearch, slips]);

  const filteredPending = useMemo(() => {
    const q = employeeSearch.trim().toLowerCase();
    if (!q) {
      return pending;
    }
    return pending.filter(row => row.name.toLowerCase().includes(q));
  }, [employeeSearch, pending]);

  const renderSlipRow = ({ item }: { item: KolamPayrollSlip }) => {
    const hasErrorWarning = item.warnings.some(
      warning => warning.severity === 'error',
    );
    const isPkp = item.employeeSnapshot.isPkp;
    return (
      <View style={styles.row}>
        <View style={[styles.cell, { flex: 0.9 }]}>
          <Text style={styles.primaryText}>{item.slipCode || '—'}</Text>
        </View>
        <View style={[styles.cell, { flex: 1.2 }]}>
          <Text style={styles.primaryText}>{item.userLabel}</Text>
          {item.employeeNumber ? (
            <Text style={styles.metaText}>{item.employeeNumber}</Text>
          ) : null}
        </View>
        <View style={[styles.cell, { flex: 1 }]}>
          <Text style={styles.primaryText}>
            {formatRupiah(item.takeHomePay)}
          </Text>
        </View>
        <View style={[styles.cell, { flex: 0.5 }]}>
          <Text style={styles.metaText}>
            {isPkp ? 'Y' : '—'}
            {hasErrorWarning ? ' !' : ''}
          </Text>
        </View>
        <View style={[styles.cell, styles.actionCell, { flex: 1.1 }]}>
          {!isFinal && controller.canUpdate ? (
            <KolamButton
              disabled={controller.mutating || !item.userId}
              intent="secondary"
              label="↻"
              onPress={() => {
                void controller.onGenerateOne({ userId: item.userId });
              }}
              style={styles.iconAction}
            />
          ) : null}
          <KolamButton
            intent="secondary"
            label="Slip"
            onPress={() => onRouteChange?.(buildKolamPayrollSlipRoute(item.id))}
            style={styles.rowAction}
          />
        </View>
      </View>
    );
  };

  const renderPendingRow = ({ item }: { item: KolamPayrollPendingEmployee }) => (
    <View style={styles.row}>
      <View style={[styles.cell, { flex: 1.6 }]}>
        <Text style={styles.primaryText}>{item.name || '—'}</Text>
        {item.isPkp ? <Text style={styles.metaText}>PKP</Text> : null}
      </View>
      <View style={[styles.cell, { flex: 1 }]}>
        <Text style={styles.primaryText}>
          {item.salary != null ? formatRupiah(item.salary) : '—'}
        </Text>
      </View>
      <View style={[styles.cell, { flex: 0.8 }]}>
        <KolamButton
          disabled={controller.mutating || !item.userId}
          intent="secondary"
          label="Buat"
          onPress={() => {
            void controller.onGenerateOne({
              userId: item.userId,
              openSlip: true,
            });
          }}
          style={styles.rowAction}
        />
      </View>
    </View>
  );

  if (!period && !controller.loading) {
    return <KolamEmptyState title="Periode tidak ditemukan" />;
  }

  const emptySlipMsg =
    slips.length === 0
      ? 'Belum ada slip'
      : 'Tidak ada hasil pencarian';
  const emptyPendingMsg =
    pending.length === 0
      ? 'Tidak ada karyawan tanpa slip'
      : 'Tidak ada hasil pencarian';

  return (
    <>
      <View style={styles.detailHeader}>
        {onRouteChange ? (
          <KolamButton
            intent="secondary"
            label="Kembali"
            onPress={() => onRouteChange(KOLAM_PAYROLL_ROOT)}
            style={styles.backButton}
          />
        ) : null}
        <Text style={styles.detailTitle}>
          {period?.periodKey ?? controller.periodKey}
        </Text>
        {period ? (
          <KolamStatusBadge
            intent={getKolamPayrollPeriodStatusIntent(period.status)}
            label={formatKolamPayrollPeriodStatusLabel(period.status)}
          />
        ) : null}
      </View>

      {period ? (
        <KolamCardFrame style={styles.summaryCard}>
          <Text style={styles.metaText}>
            {period.slipCount} slip · THP {formatRupiah(period.totalTakeHome)}
          </Text>
          {period.walletName ? (
            <Text style={styles.metaText}>Dompet: {period.walletName}</Text>
          ) : null}
        </KolamCardFrame>
      ) : null}

      {!isFinal && controller.canUpdate ? (
        <KolamCardFrame style={styles.opsCard}>
          <View style={styles.opsRow}>
            <KolamDropdownSelect
              label="Dompet"
              onChange={controller.onSelectedWalletChange}
              options={
                walletOptions.length > 0
                  ? walletOptions
                  : [{ label: '—', value: '' }]
              }
              value={controller.selectedWalletId || ''}
            />
            <KolamButton
              disabled={controller.mutating || !controller.selectedWalletId}
              intent="secondary"
              label="Simpan dompet"
              onPress={() => {
                void controller.onSetWallet();
              }}
              style={styles.opsButton}
            />
            <KolamButton
              disabled={controller.mutating}
              intent="secondary"
              label="Generate semua"
              onPress={() => {
                void controller.onGenerateAll(false);
              }}
              style={styles.opsButton}
            />
            <KolamButton
              disabled={controller.mutating}
              intent="primary"
              label="Finalisasi"
              onPress={() => {
                void controller.onFinalize();
              }}
              style={styles.opsButton}
            />
          </View>
        </KolamCardFrame>
      ) : null}

      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={styles.tabGroup}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setListTab('slips')}
              style={[
                styles.tabButton,
                listTab === 'slips' ? styles.tabButtonActive : null,
              ]}
            >
              <Text
                style={[
                  styles.tabLabel,
                  listTab === 'slips' ? styles.tabLabelActive : null,
                ]}
              >
                Slip {filteredSlips.length}
              </Text>
            </Pressable>
            {showPendingTab ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setListTab('pending')}
                style={[
                  styles.tabButton,
                  listTab === 'pending' ? styles.tabButtonActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    listTab === 'pending' ? styles.tabLabelActive : null,
                  ]}
                >
                  Belum {filteredPending.length}
                </Text>
              </Pressable>
            ) : null}
          </View>
          <View style={kolamTableToolbarStyles.filters}>
            <KolamFormTextField
              onChangeText={setEmployeeSearch}
              placeholder="Cari karyawan"
              style={styles.searchInput}
              value={employeeSearch}
            />
          </View>
        </View>
      </View>

      {listTab === 'slips' ? (
        <KolamCatalogListTableShell footer={null} style={styles.tableFrame}>
          <FlatList
            data={filteredSlips}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <KolamEmptyState
                  compact
                  title={controller.loading ? 'Memuat…' : emptySlipMsg}
                />
              </View>
            }
            ListHeaderComponent={
              <View style={styles.headerRow}>
                {SLIP_COLUMNS.map(column => (
                  <View
                    key={column.id}
                    style={[styles.cell, { flex: column.flex }]}
                  >
                    <Text style={styles.headerCellText}>{column.label}</Text>
                  </View>
                ))}
              </View>
            }
            renderItem={renderSlipRow}
          />
        </KolamCatalogListTableShell>
      ) : (
        <KolamCatalogListTableShell footer={null} style={styles.tableFrame}>
          <FlatList
            data={filteredPending}
            keyExtractor={item => item.userId}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <KolamEmptyState
                  compact
                  title={controller.loading ? 'Memuat…' : emptyPendingMsg}
                />
              </View>
            }
            ListHeaderComponent={
              <View style={styles.headerRow}>
                {PENDING_COLUMNS.map(column => (
                  <View
                    key={column.id}
                    style={[styles.cell, { flex: column.flex }]}
                  >
                    <Text style={styles.headerCellText}>{column.label}</Text>
                  </View>
                ))}
              </View>
            }
            renderItem={renderPendingRow}
          />
        </KolamCatalogListTableShell>
      )}
    </>
  );
}

function PayrollSlipBody({
  controller,
  onRouteChange,
}: {
  controller: KolamPayrollController;
  onRouteChange?: (route: string) => void;
}) {
  const slip = controller.slip;

  if (!slip && !controller.loading) {
    return <KolamEmptyState title="Slip tidak ditemukan" />;
  }

  return (
    <>
      <View style={styles.detailHeader}>
        {onRouteChange && slip?.periodKey ? (
          <KolamButton
            intent="secondary"
            label="Kembali"
            onPress={() =>
              onRouteChange(buildKolamPayrollPeriodRoute(slip.periodKey))
            }
            style={styles.backButton}
          />
        ) : null}
        <Text style={styles.detailTitle}>{slip?.slipCode || 'Slip gaji'}</Text>
      </View>

      {slip ? (
        <KolamCardFrame style={styles.summaryCard}>
          <Text style={styles.primaryText}>{slip.userLabel}</Text>
          <Text style={styles.metaText}>
            Gaji pokok {formatRupiah(slip.baseSalary)} · Bonus{' '}
            {formatRupiah(slip.bonusTotal)}
          </Text>
          <Text style={styles.metaText}>
            Bruto {formatRupiah(slip.grossBruto)} · Potongan{' '}
            {formatRupiah(slip.totalDeductions)} · PPh21{' '}
            {formatRupiah(slip.pph21Amount)}
          </Text>
          <Text style={styles.primaryText}>
            THP {formatRupiah(slip.takeHomePay)}
          </Text>
        </KolamCardFrame>
      ) : null}
    </>
  );
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
  searchInput: {
    flexGrow: 1,
    minWidth: 160,
  },
  toolbarButton: {
    minWidth: 96,
  },
  createCard: {
    gap: 8,
    padding: 12,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
  createRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  createButton: {
    minWidth: 120,
  },
  tableFrame: {
    flex: 1,
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
  row: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 44,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  cell: {
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  primaryText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  metaText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  rowAction: {
    minWidth: 72,
  },
  iconAction: {
    minWidth: 44,
  },
  actionCell: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'flex-end',
  },
  tabGroup: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 2,
    padding: 2,
  },
  tabButton: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tabButtonActive: {
    backgroundColor: V.colors.muted,
  },
  tabLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: V.colors.fg,
  },
  detailHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  backButton: {
    minWidth: 88,
  },
  detailTitle: {
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '600',
  },
  summaryCard: {
    gap: 4,
    padding: 12,
  },
  opsCard: {
    padding: 12,
  },
  opsRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  opsButton: {
    minWidth: 120,
  },
});
