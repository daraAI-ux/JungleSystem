import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
import { buildKolamDaraTaxRoute } from '../domain/kolam-finance-tax';
import { KolamButton } from './kolam-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamDetailScrollSurface } from './kolam-detail-scroll-surface';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamListTableComposition } from './kolam-list-table-composition';
import { KolamPayrollSlipPrintDialog } from './kolam-payroll-slip-print-dialog';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

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

  const periodColumns = React.useMemo(
    () => [
      {
        id: 'period',
        label: 'Periode',
        flex: 1,
        render: (item: KolamPayrollPeriod) => (
          <Text style={styles.primaryText}>{item.periodKey}</Text>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        flex: 0.8,
        render: (item: KolamPayrollPeriod) => (
          <KolamStatusBadge
            intent={getKolamPayrollPeriodStatusIntent(item.status)}
            label={formatKolamPayrollPeriodStatusLabel(item.status)}
          />
        ),
      },
      {
        id: 'slips',
        label: 'Slip',
        flex: 0.6,
        render: (item: KolamPayrollPeriod) => (
          <Text style={styles.metaText}>{item.slipCount}</Text>
        ),
      },
      {
        id: 'thp',
        label: 'THP',
        flex: 1,
        render: (item: KolamPayrollPeriod) => (
          <Text style={styles.primaryText}>
            {formatRupiah(item.totalTakeHome)}
          </Text>
        ),
      },
      {
        id: 'wallet',
        label: 'Dompet',
        flex: 1,
        render: (item: KolamPayrollPeriod) => (
          <Text numberOfLines={1} style={styles.metaText}>
            {item.walletName || '—'}
          </Text>
        ),
      },
      {
        id: 'action',
        label: '',
        flex: 0.7,
        render: (item: KolamPayrollPeriod) => (
          <KolamButton
            intent="secondary"
            label="Buka"
            onPress={() =>
              onRouteChange?.(buildKolamPayrollPeriodRoute(item.periodKey))
            }
            style={styles.rowAction}
          />
        ),
      },
    ],
    [onRouteChange],
  );
  return (
    <View style={styles.listBody}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View
            style={[kolamTableToolbarStyles.filters, styles.filtersAlignEnd]}
          >
            <KolamFormTextField
              onChangeText={controller.onSearchChange}
              placeholder="Cari periode"
              style={styles.searchInput}
              value={controller.search}
            />
            {controller.canCreate ? (
              <>
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
              </>
            ) : null}
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            {controller.canCreate ? (
              <KolamButton
                disabled={controller.mutating}
                intent="primary"
                label={controller.mutating ? 'Membuat…' : 'Buat periode'}
                onPress={() => {
                  void controller.onCreatePeriod();
                }}
                style={styles.createToolbarButton}
              />
            ) : null}
          </View>
        </View>
      </View>

      <KolamListTableComposition
        columns={periodColumns}
        emptyTitle="Belum ada periode"
        getRowKey={item => item.id || item.periodKey}
        loading={controller.loading}
        rows={controller.filteredPeriods}
        showFooter={false}
        style={styles.tableFrame}
      />
    </View>
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

  const slipColumns = React.useMemo(
    () => [
      {
        id: 'code',
        label: 'Kode',
        flex: 0.9,
        render: (item: KolamPayrollSlip) => (
          <Text style={styles.primaryText}>{item.slipCode || '—'}</Text>
        ),
      },
      {
        id: 'employee',
        label: 'Karyawan',
        flex: 1.2,
        render: (item: KolamPayrollSlip) => (
          <View>
            <Text style={styles.primaryText}>{item.userLabel}</Text>
            {item.employeeNumber ? (
              <Text style={styles.metaText}>{item.employeeNumber}</Text>
            ) : null}
          </View>
        ),
      },
      {
        id: 'thp',
        label: 'THP',
        flex: 1,
        render: (item: KolamPayrollSlip) => (
          <Text style={styles.primaryText}>
            {formatRupiah(item.takeHomePay)}
          </Text>
        ),
      },
      {
        id: 'pkp',
        label: 'PKP',
        flex: 0.5,
        render: (item: KolamPayrollSlip) => {
          const hasErrorWarning = item.warnings.some(
            warning => warning.severity === 'error',
          );
          const isPkp = item.employeeSnapshot.isPkp;
          return (
            <Text style={styles.metaText}>
              {isPkp ? 'Y' : '—'}
              {hasErrorWarning ? ' !' : ''}
            </Text>
          );
        },
      },
      {
        id: 'action',
        label: '',
        flex: 1.1,
        render: (item: KolamPayrollSlip) => (
          <View style={styles.actionCell}>
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
        ),
      },
    ],
    [controller, isFinal, onRouteChange],
  );

  const pendingColumns = React.useMemo(
    () => [
      {
        id: 'name',
        label: 'Karyawan',
        flex: 1.6,
        render: (item: KolamPayrollPendingEmployee) => (
          <View>
            <Text style={styles.primaryText}>{item.name || '—'}</Text>
            {item.isPkp ? <Text style={styles.metaText}>PKP</Text> : null}
          </View>
        ),
      },
      {
        id: 'salary',
        label: 'Pokok',
        flex: 1,
        render: (item: KolamPayrollPendingEmployee) => (
          <Text style={styles.primaryText}>
            {item.salary != null ? formatRupiah(item.salary) : '—'}
          </Text>
        ),
      },
      {
        id: 'action',
        label: '',
        flex: 0.8,
        render: (item: KolamPayrollPendingEmployee) => (
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
        ),
      },
    ],
    [controller],
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
          <View style={styles.summaryRow}>
            <Text style={styles.metaText}>
              {period.slipCount} slip · THP{' '}
              <Text style={styles.summaryThp}>
                {formatRupiah(period.totalTakeHome)}
              </Text>
              {period.walletName ? ` · ${period.walletName}` : ''}
            </Text>
            {period.taxSettlement ? (
              onRouteChange ? (
                <Pressable
                  accessibilityRole="link"
                  onPress={() =>
                    onRouteChange(buildKolamDaraTaxRoute('pelunasan'))
                  }
                  style={styles.taxLink}
                >
                  <Text style={styles.taxLinkText}>
                    PPh{' '}
                    {period.taxSettlement.code.trim() ||
                      period.taxSettlement.id.slice(0, 8) ||
                      'Setoran'}
                  </Text>
                </Pressable>
              ) : (
                <Text style={styles.taxLinkText}>
                  PPh{' '}
                  {period.taxSettlement.code.trim() ||
                    period.taxSettlement.id.slice(0, 8) ||
                    'Setoran'}
                </Text>
              )
            ) : null}
          </View>
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
        <KolamListTableComposition
          columns={slipColumns}
          emptyTitle={emptySlipMsg}
          getRowKey={item => item.id}
          loading={controller.loading}
          rows={filteredSlips}
          showFooter={false}
          style={styles.detailTableFrame}
        />
      ) : (
        <KolamListTableComposition
          columns={pendingColumns}
          emptyTitle={emptyPendingMsg}
          getRowKey={item => item.userId}
          loading={controller.loading}
          rows={filteredPending}
          showFooter={false}
          style={styles.detailTableFrame}
        />
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
  const [printOpen, setPrintOpen] = useState(false);
  const slip = controller.slip;

  if (!slip && !controller.loading) {
    return <KolamEmptyState title="Slip tidak ditemukan" />;
  }

  if (!slip) {
    return (
      <View style={styles.emptyWrap}>
        <KolamEmptyState compact title="Memuat…" />
      </View>
    );
  }

  const snapshot = slip.employeeSnapshot;
  const name =
    `${snapshot.firstName} ${snapshot.lastName}`.trim() || slip.userLabel;
  const pphRateLabel = slip.pph21Payroll.applicable
    ? ` (${slip.pph21Payroll.rate}%)`
    : '';
  const printedAt = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <View style={styles.detailHeader}>
        {onRouteChange && slip.periodKey ? (
          <KolamButton
            intent="secondary"
            label="Kembali ke periode"
            onPress={() =>
              onRouteChange(buildKolamPayrollPeriodRoute(slip.periodKey))
            }
            style={styles.backButtonWide}
          />
        ) : null}
        <View style={styles.slipTitleBlock}>
          <Text style={styles.detailTitle}>
            Slip Gaji — {slip.periodKey || '—'}
          </Text>
          <Text style={styles.metaText}>{slip.slipCode || '—'}</Text>
        </View>
        <KolamButton
          intent="secondary"
          label="Cetak"
          onPress={() => setPrintOpen(true)}
          style={styles.printButton}
        />
        <KolamButton
          disabled={controller.mutating}
          intent="secondary"
          label={
            controller.mutating ? 'Memperbarui…' : 'Refresh narasi AI'
          }
          onPress={() => {
            void controller.onRefreshPph21Ai();
          }}
          style={styles.aiButton}
        />
      </View>

      <KolamDetailScrollSurface
        contentContainerStyle={styles.slipScrollContent}
        style={styles.slipScroll}
      >
        <KolamCardFrame style={styles.slipCard}>
          <View style={styles.slipDocHeader}>
            <Text style={styles.slipBrand}>Dunia Anura</Text>
            <View style={styles.slipDocHeaderRight}>
              <Text style={styles.slipDocTitle}>Slip Gaji</Text>
              <Text style={styles.metaText}>Periode {slip.periodKey}</Text>
              <Text style={styles.metaText}>{slip.slipCode || '—'}</Text>
            </View>
          </View>

          {slip.warnings.length > 0 ? (
            <View style={styles.warningBox}>
              {slip.warnings.map(warning => (
                <Text key={warning.code} style={styles.warningText}>
                  <Text style={styles.warningCode}>{warning.code}: </Text>
                  {warning.message}
                </Text>
              ))}
            </View>
          ) : null}

          <View style={styles.identityGrid}>
            <SlipIdentityField label="Nama" value={name} />
            <SlipIdentityField
              label="No. Karyawan"
              value={snapshot.employeeNumber || '—'}
            />
            <SlipIdentityField
              label="NPWP"
              value={snapshot.taxNumber || '—'}
            />
            <SlipIdentityField
              label="PKP"
              value={snapshot.isPkp ? 'Berlaku' : 'Tidak berlaku'}
            />
            <SlipIdentityField
              label="Departemen"
              value={snapshot.department || '—'}
            />
            <SlipIdentityField
              label="Posisi"
              value={snapshot.position || '—'}
            />
          </View>

          <View style={styles.amountTable}>
            <SlipAmountRow
              label="Gaji pokok"
              value={formatRupiah(slip.baseSalary)}
            />
            <SlipAmountRow
              label="Bonus (verified)"
              value={formatRupiah(slip.bonusTotal)}
            />
            <SlipAmountRow
              label="Komisi bruto (released)"
              value={formatRupiah(slip.commissionGross)}
            />
            <SlipAmountRow
              emphasis
              label="Bruto"
              value={formatRupiah(slip.grossBruto)}
            />
            <SlipAmountRow
              indented
              muted
              label="PPh 21 komisi (sudah dipotong)"
              value={`(${formatRupiah(slip.commissionPph21Withheld)})`}
            />
            <SlipAmountRow
              indented
              muted
              label={`PPh 21 gaji+bonus${pphRateLabel}`}
              value={`(${formatRupiah(slip.pph21Payroll.amount)})`}
            />
            <SlipAmountRow
              indented
              muted
              label="Kasbon"
              value={`(${formatRupiah(slip.kasbonTotal)})`}
            />
            <SlipAmountRow
              indented
              muted
              label="Potongan gaji"
              value={`(${formatRupiah(slip.salaryDeductionTotal)})`}
            />
            <SlipAmountRow
              strong
              label="Take home pay"
              value={formatRupiah(slip.takeHomePay)}
            />
          </View>

          {slip.pph21AiNote ? (
            <View style={styles.aiNoteBox}>
              <Text style={styles.aiNoteTitle}>
                Catatan PPh 21 (AI — estimasi)
              </Text>
              <Text style={styles.aiNoteBody}>{slip.pph21AiNote}</Text>
            </View>
          ) : null}

          <View style={styles.slipFooter}>
            <Text style={styles.footerText}>
              Dokumen estimasi internal. Bukan bukti potong resmi DJP. Rekap PPh
              21 bulanan: Tax Intelligence.
            </Text>
            <Text style={styles.footerText}>Dicetak: {printedAt}</Text>
          </View>
        </KolamCardFrame>
      </KolamDetailScrollSurface>

      <KolamPayrollSlipPrintDialog
        onOpenChange={setPrintOpen}
        slip={slip}
        visible={printOpen}
      />
    </>
  );
}

function SlipIdentityField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.identityField}>
      <Text style={styles.metaText}>{label}</Text>
      <Text style={styles.primaryText}>{value}</Text>
    </View>
  );
}

function SlipAmountRow({
  label,
  value,
  emphasis,
  strong,
  muted,
  indented,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  strong?: boolean;
  muted?: boolean;
  indented?: boolean;
}) {
  return (
    <View style={[styles.amountRow, strong ? styles.amountRowStrong : null]}>
      <Text
        style={[
          styles.amountLabel,
          indented ? styles.amountLabelIndented : null,
          muted ? styles.metaText : null,
          emphasis || strong ? styles.amountLabelEmphasis : null,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.amountValue,
          muted ? styles.metaText : null,
          emphasis || strong ? styles.amountValueEmphasis : null,
          strong ? styles.amountValueStrong : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 10,
    minHeight: 0,
    position: 'relative',
  },
  banner: {
    alignSelf: 'stretch',
  },
  searchInput: {
    flexGrow: 1,
    minWidth: 160,
  },
  filtersAlignEnd: {
    alignItems: 'flex-end',
  },
  toolbarButton: {
    minWidth: 96,
  },
  createToolbarButton: {
    minWidth: 120,
  },
  listBody: {
    flex: 1,
    gap: 10,
    minHeight: 0,
  },
  tableFrame: {
    alignSelf: 'stretch',
    width: '100%',
  },
  detailTableFrame: {
    alignSelf: 'stretch',
    width: '100%',
  },
  emptyWrap: {
    paddingVertical: 24,
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
  backButtonWide: {
    minWidth: 140,
  },
  aiButton: {
    minWidth: 148,
  },
  printButton: {
    minWidth: 88,
  },
  slipTitleBlock: {
    flex: 1,
    gap: 2,
    minWidth: 160,
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
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryThp: {
    color: V.colors.success,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  taxLink: {
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  taxLinkText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  slipScroll: {
    flex: 1,
    minHeight: 0,
  },
  slipScrollContent: {
    paddingBottom: 16,
  },
  slipCard: {
    gap: 16,
    padding: 16,
  },
  slipDocHeader: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  slipBrand: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '600',
  },
  slipDocHeaderRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  slipDocTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: V.colors.warningSoft,
    borderColor: V.colors.warning,
    borderRadius: V.radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
    padding: 10,
  },
  warningText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  warningCode: {
    fontWeight: '700',
  },
  identityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  identityField: {
    gap: 2,
    minWidth: '45%',
    width: '47%',
  },
  amountTable: {
    borderTopColor: V.colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  amountRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  amountRowStrong: {
    borderBottomWidth: 0,
    paddingTop: 12,
  },
  amountLabel: {
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    paddingRight: 8,
  },
  amountLabelIndented: {
    paddingLeft: 12,
  },
  amountLabelEmphasis: {
    fontWeight: '600',
  },
  amountValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    textAlign: 'right',
  },
  amountValueEmphasis: {
    fontWeight: '600',
  },
  amountValueStrong: {
    fontSize: 16,
    fontWeight: '700',
  },
  aiNoteBox: {
    borderColor: V.colors.border,
    borderRadius: V.radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
    padding: 10,
  },
  aiNoteTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  aiNoteBody: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 18,
  },
  slipFooter: {
    borderTopColor: V.colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 4,
    paddingTop: 12,
  },
  footerText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    lineHeight: 16,
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
