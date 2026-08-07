import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  getKolamBonusStatusIntent,
  KOLAM_BONUS_MONTH_OPTIONS,
  KOLAM_BONUS_ROOT,
  type KolamBonusListRow,
} from '../domain/kolam-bonus';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamBonusListController,
  type KolamBonusListController,
} from '../hooks/use-kolam-bonus-controller';
import { formatRupiah } from '../lib/money';
import { KolamButton } from './kolam-button';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamListTableComposition } from './kolam-list-table-composition';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { KolamStatusBadge } from './kolam-status-badge';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

export function KolamBonusSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamBonusListController(route, onRouteChange);

  if (controller.mode === 'create') {
    return <BonusCreatePage controller={controller} />;
  }

  if (controller.mode === 'unsupported') {
    return (
      <View style={styles.surface}>
        <KolamEmptyState title="Halaman tidak tersedia" />
        {onRouteChange ? (
          <KolamButton
            intent="secondary"
            label="Kembali"
            onPress={() => onRouteChange(KOLAM_BONUS_ROOT)}
            style={styles.backButton}
          />
        ) : null}
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
      <View style={styles.listBody}>
        <BonusToolbar controller={controller} />
        <Text style={styles.helperText}>
          Bonus masuk payroll setelah terverifikasi. Verifikasi lewat Pengeluaran
          Tak Terduga.
        </Text>
        <BonusList controller={controller} />
      </View>
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
  const columns = React.useMemo(
    () => [
      {
        id: 'code',
        label: 'Kode',
        flex: 0.9,
        render: (item: KolamBonusListRow) => (
          <Text style={styles.primaryText}>
            {item.code || item.name || '—'}
          </Text>
        ),
      },
      {
        id: 'employee',
        label: 'Karyawan',
        flex: 1.2,
        render: (item: KolamBonusListRow) => (
          <Text style={styles.primaryText}>{item.employeeLabel}</Text>
        ),
      },
      {
        id: 'amount',
        label: 'Jumlah',
        flex: 1,
        render: (item: KolamBonusListRow) => (
          <Text style={styles.primaryText}>{formatRupiah(item.amount)}</Text>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        flex: 0.9,
        render: (item: KolamBonusListRow) => (
          <KolamStatusBadge
            intent={getKolamBonusStatusIntent(item.status)}
            label={item.statusLabel}
          />
        ),
      },
      {
        id: 'date',
        label: 'Tanggal',
        flex: 1.2,
        render: (item: KolamBonusListRow) => (
          <Text style={styles.metaText}>
            {formatBonusDate(item.executedAt || item.createdAt)}
          </Text>
        ),
      },
    ],
    [],
  );

  return (
    <KolamListTableComposition
      columns={columns}
      emptyTitle={!controller.canView ? 'Akses ditolak' : 'Belum ada bonus'}
      getRowKey={item => item.id}
      loading={controller.loading}
      rows={controller.rows}
      showFooter={false}
      style={styles.tableFrame}
    />
  );
}

function BonusCreatePage({
  controller,
}: {
  controller: KolamBonusListController;
}) {
  if (!controller.canCreate) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState title="Akses ditolak" />
        <KolamButton
          intent="secondary"
          label="Kembali"
          onPress={controller.onCancelCreate}
          style={styles.backButton}
        />
      </View>
    );
  }

  const amountValid =
    Number.isFinite(Number(controller.createDraft.amount)) &&
    Number(controller.createDraft.amount) > 0;
  const canSubmit =
    Boolean(controller.createDraft.userId.trim()) &&
    amountValid &&
    !controller.mutating;

  return (
    <ScrollView
      contentContainerStyle={styles.createContent}
      style={styles.surface}
    >
      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
          style={styles.banner}
        />
      ) : null}

      <KolamContentFrame variant="nativeFormSection">
        <KolamCopyStack
          containerStyle={styles.sectionCopy}
          items={[
            {
              id: 'title',
              text: 'Data bonus',
              style: styles.sectionTitle,
            },
            {
              id: 'hint',
              text: 'Bonus dibuat belum terverifikasi — verifikasi di Pengeluaran Tak Terduga.',
              style: styles.sectionHint,
            },
          ]}
        />
        <KolamContentFrame variant="nativeFormControls">
          <View style={settingsWebFormStyles.settingsWebFormFields}>
            <View style={settingsWebFormStyles.settingsWebFormField}>
              <KolamSettingsWebFieldLabel label="Karyawan" required />
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
                showLabelInTrigger={false}
                value={controller.createDraft.userId}
              />
            </View>

            <View style={settingsWebFormStyles.settingsWebFormField}>
              <KolamSettingsWebFieldLabel label="Jumlah (Rp)" required />
              <KolamFormTextField
                mode="numeric"
                onChangeText={value =>
                  controller.onCreateDraftChange({ amount: value })
                }
                placeholder="0"
                value={controller.createDraft.amount}
              />
            </View>

            <View style={settingsWebFormStyles.settingsWebFormField}>
              <KolamSettingsWebFieldLabel label="Alasan" required={false} />
              <KolamFormTextField
                multiline
                onChangeText={value =>
                  controller.onCreateDraftChange({ reason: value })
                }
                placeholder="Opsional"
                value={controller.createDraft.reason}
              />
            </View>
          </View>
        </KolamContentFrame>
      </KolamContentFrame>

      <View style={styles.createActions}>
        <KolamButton
          disabled={controller.mutating}
          intent="secondary"
          label="Batal"
          onPress={controller.onCancelCreate}
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
    </ScrollView>
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
  createContent: {
    gap: 12,
    paddingBottom: 24,
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
  listBody: {
    flex: 1,
    gap: 10,
    minHeight: 0,
  },
  tableFrame: {
    alignSelf: 'stretch',
    width: '100%',
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
  sectionCopy: {
    gap: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  createActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
});
