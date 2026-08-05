import React, { useMemo } from 'react';
import { FlatList, Modal, StyleSheet, Text, View } from 'react-native';
import {
  getKolamBonusStatusIntent,
  KOLAM_BONUS_MONTH_OPTIONS,
  type KolamBonusListRow,
} from '../domain/kolam-bonus';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamBonusListController,
  type KolamBonusListController,
} from '../hooks/use-kolam-bonus-controller';
import { formatRupiah } from '../lib/money';
import { KolamButton } from './kolam-button';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamModalBackdrop } from './kolam-modal-backdrop';
import { KolamRefreshButton } from './kolam-refresh-button';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

const BONUS_COLUMNS = [
  { id: 'code', label: 'Kode', flex: 0.9 },
  { id: 'employee', label: 'Karyawan', flex: 1.2 },
  { id: 'amount', label: 'Jumlah', flex: 1 },
  { id: 'status', label: 'Status', flex: 0.9 },
  { id: 'date', label: 'Tanggal', flex: 1.2 },
] as const;

export function KolamBonusSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamBonusListController(route, onRouteChange);

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
      <BonusToolbar controller={controller} />
      <Text style={styles.helperText}>
        Bonus masuk payroll setelah terverifikasi. Verifikasi lewat Pengeluaran
        Tak Terduga.
      </Text>
      <BonusList controller={controller} />
      <BonusCreateDialog controller={controller} />
    </View>
  );
}

function BonusToolbar({
  controller,
}: {
  controller: KolamBonusListController;
}) {
  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear();
    return [y - 1, y, y + 1].map(value => ({
      label: String(value),
      value: String(value),
    }));
  }, []);

  const monthOptions = KOLAM_BONUS_MONTH_OPTIONS.map(option => ({
    label: option.label,
    value: String(option.value),
  }));

  return (
    <View style={kolamTableToolbarStyles.shell}>
      <View style={kolamTableToolbarStyles.row}>
        <View
          style={[kolamTableToolbarStyles.filters, styles.filtersAlignEnd]}
        >
          <KolamDropdownSelect
            label="Tahun"
            onChange={value =>
              controller.onYearChange(Number(value) || new Date().getFullYear())
            }
            options={yearOptions}
            value={String(controller.filters.year)}
          />
          <KolamDropdownSelect
            label="Bulan"
            onChange={value =>
              controller.onMonthChange(Number(value) || 1)
            }
            options={monthOptions}
            value={String(controller.filters.month)}
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
          {controller.canCreate ? (
            <KolamButton
              intent="primary"
              label="Tambah bonus"
              onPress={controller.onOpenCreate}
              style={styles.createToolbarButton}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

function BonusList({ controller }: { controller: KolamBonusListController }) {
  const renderRow = ({ item }: { item: KolamBonusListRow }) => (
    <View style={styles.row}>
      <View style={[styles.cell, { flex: 0.9 }]}>
        <Text style={styles.primaryText}>{item.code || item.name || '—'}</Text>
      </View>
      <View style={[styles.cell, { flex: 1.2 }]}>
        <Text style={styles.primaryText}>{item.employeeLabel}</Text>
      </View>
      <View style={[styles.cell, { flex: 1 }]}>
        <Text style={styles.primaryText}>{formatRupiah(item.amount)}</Text>
      </View>
      <View style={[styles.cell, { flex: 0.9 }]}>
        <KolamStatusBadge
          intent={getKolamBonusStatusIntent(item.status)}
          label={item.statusLabel}
        />
      </View>
      <View style={[styles.cell, { flex: 1.2 }]}>
        <Text style={styles.metaText}>
          {formatBonusDate(item.executedAt || item.createdAt)}
        </Text>
      </View>
    </View>
  );

  return (
    <KolamCatalogListTableShell fill footer={null} style={styles.tableFrame}>
      <FlatList
        data={controller.rows}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              compact
              title={
                !controller.canView
                  ? 'Akses ditolak'
                  : controller.loading
                    ? 'Memuat…'
                    : 'Belum ada bonus'
              }
            />
          </View>
        }
        ListHeaderComponent={
          <View style={styles.headerRow}>
            {BONUS_COLUMNS.map(column => (
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
  );
}

function BonusCreateDialog({
  controller,
}: {
  controller: KolamBonusListController;
}) {
  const amountValid =
    Number.isFinite(Number(controller.createDraft.amount)) &&
    Number(controller.createDraft.amount) > 0;
  const canSubmit =
    Boolean(controller.createDraft.userId.trim()) &&
    amountValid &&
    !controller.mutating;

  return (
    <Modal
      animationType="fade"
      onRequestClose={controller.onCloseCreate}
      transparent
      visible={controller.createOpen}
    >
      <View style={styles.dialogOverlay}>
        <KolamModalBackdrop onPress={controller.onCloseCreate} />
        <View accessibilityLabel="Bonus baru" style={styles.dialog}>
          <Text style={styles.dialogTitle}>Bonus baru</Text>
          <Text style={styles.dialogHint}>
            Bonus dibuat belum terverifikasi — verifikasi di Pengeluaran Tak
            Terduga.
          </Text>

          <KolamDropdownSelect
            label="Karyawan"
            onChange={value =>
              controller.onCreateDraftChange({ userId: value })
            }
            options={[
              {
                label: controller.loadingEmployees
                  ? 'Memuat…'
                  : 'Pilih karyawan',
                value: '',
              },
              ...controller.employeeOptions,
            ]}
            searchable
            value={controller.createDraft.userId}
          />

          <Text style={styles.fieldLabel}>Jumlah (Rp)</Text>
          <KolamFormTextField
            mode="numeric"
            onChangeText={value =>
              controller.onCreateDraftChange({ amount: value })
            }
            placeholder="0"
            value={controller.createDraft.amount}
          />

          <Text style={styles.fieldLabel}>Alasan</Text>
          <KolamFormTextField
            multiline
            onChangeText={value =>
              controller.onCreateDraftChange({ reason: value })
            }
            placeholder="Opsional"
            value={controller.createDraft.reason}
          />

          <View style={styles.dialogActions}>
            <KolamButton
              disabled={controller.mutating}
              intent="secondary"
              label="Batal"
              onPress={controller.onCloseCreate}
            />
            <KolamButton
              disabled={!canSubmit}
              intent="primary"
              label={controller.mutating ? 'Menyimpan…' : 'Simpan'}
              onPress={() => {
                void controller.onCreateBonus();
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function formatBonusDate(value: string): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
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
  helperText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  filtersAlignEnd: {
    justifyContent: 'flex-end',
  },
  toolbarButton: {
    minWidth: 96,
  },
  createToolbarButton: {
    minWidth: 120,
  },
  tableFrame: {
    flex: 1,
    minHeight: 0,
  },
  list: {
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
  dialogOverlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  dialog: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    maxWidth: '92%',
    padding: 16,
    width: 420,
    zIndex: 1,
  },
  dialogTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  dialogHint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  fieldLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 4,
  },
});
