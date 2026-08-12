import React, {useMemo} from 'react';
import {Linking, Pressable, StyleSheet, Text, View} from 'react-native';
import {
  formatKolamHrDatetime,
  KOLAM_HR_OVERTIME_FILTERS,
  KOLAM_HR_OVERTIME_STATUS_LABEL,
  kolamHrOvertimeStatusIntent,
  type KolamHrOvertimeRow,
} from '../domain/kolam-hr';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {useKolamHrOvertimeController} from '../hooks/use-kolam-hr-overtime-controller';
import {formatRupiah} from '../lib/money';
import {KolamButton} from './kolam-button';
import {KolamDropdownSelect} from './kolam-dropdown-select';
import {KolamListTableComposition} from './kolam-list-table-composition';
import {KolamStatusBadge} from './kolam-status-badge';
import {kolamTableToolbarStyles} from './kolam-table-toolbar-styles';
import {KolamUploadButton} from './kolam-upload-button';

/** FE `HrOvertimePanel`. */
export function KolamHrOvertimeBody({
  canUpdate,
  enabled,
}: {
  canUpdate: boolean;
  enabled: boolean;
}) {
  const controller = useKolamHrOvertimeController({
    canUpdate,
    enabled,
  });

  const columns = useMemo(
    () => [
      {
        id: 'employee',
        label: 'Karyawan',
        flex: 1,
        render: (row: KolamHrOvertimeRow) => (
          <Text style={styles.cellText}>{row.userName}</Text>
        ),
      },
      {
        id: 'task',
        label: 'Tugas',
        flex: 1.2,
        render: (row: KolamHrOvertimeRow) => (
          <View style={styles.stack}>
            <Text numberOfLines={1} style={styles.cellText}>
              {row.taskTitle}
            </Text>
            <Text style={styles.meta}>
              DL: {formatKolamHrDatetime(row.taskDueDate)}
            </Text>
          </View>
        ),
      },
      {
        id: 'reason',
        label: 'Alasan',
        flex: 1.3,
        render: (row: KolamHrOvertimeRow) => (
          <View style={styles.stack}>
            <Text style={styles.meta}>{row.reason || '-'}</Text>
            {row.invalidatedReason ? (
              <Text style={styles.dangerText}>{row.invalidatedReason}</Text>
            ) : null}
          </View>
        ),
      },
      {
        id: 'amount',
        label: 'Nilai',
        flex: 0.9,
        render: (row: KolamHrOvertimeRow) => (
          <View style={styles.stack}>
            <Text style={styles.cellText}>{formatRupiah(row.amount)}</Text>
            {row.overtimeUnits ? (
              <Text style={styles.meta}>
                {row.overtimeUnits} {row.unitLabel}
              </Text>
            ) : null}
          </View>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        flex: 0.8,
        render: (row: KolamHrOvertimeRow) => (
          <KolamStatusBadge
            intent={kolamHrOvertimeStatusIntent(row.status)}
            label={KOLAM_HR_OVERTIME_STATUS_LABEL[row.status]}
          />
        ),
      },
    ],
    [],
  );

  if (!enabled) {
    return <Text style={styles.meta}>Akses payroll diperlukan.</Text>;
  }

  return (
    <View style={styles.root}>
      <View style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              {KOLAM_HR_OVERTIME_FILTERS.map(tab => (
                <KolamButton
                  intent={controller.filter === tab.id ? 'primary' : 'outline'}
                  key={tab.id}
                  label={tab.label}
                  onPress={() => controller.setFilter(tab.id)}
                  size="sm"
                />
              ))}
            </View>
          </View>
        </View>
      </View>

      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
        />
      ) : null}
      {controller.statusMessage ? (
        <KolamStatusBadge
          intent="success"
          label={controller.statusMessage}
          numberOfLines={2}
        />
      ) : null}

      <KolamListTableComposition
        actionsColumn
        columns={columns}
        emptyTitle="Tidak ada data."
        getRowKey={row => row.id}
        loading={controller.loading}
        renderActions={row => (
          <View style={styles.actionCol}>
            {row.status === 'pending' && canUpdate ? (
              <View style={styles.actionRow}>
                <KolamButton
                  disabled={controller.mutating}
                  label="Setujui"
                  onPress={() => {
                    void controller.onReview(row.id, 'approve');
                  }}
                  size="sm"
                />
                <KolamButton
                  disabled={controller.mutating}
                  intent="danger"
                  label="Tolak"
                  onPress={() => {
                    void controller.onReview(row.id, 'reject');
                  }}
                  size="sm"
                />
              </View>
            ) : null}
            {row.status === 'approved' && canUpdate ? (
              <View style={styles.payBlock}>
                <KolamDropdownSelect
                  label="Wallet"
                  onChange={value => controller.setWalletForRow(row.id, value)}
                  options={[
                    {label: 'Pilih wallet', value: ''},
                    ...controller.walletOptions,
                  ]}
                  showLabelInTrigger={false}
                  value={controller.walletById[row.id] || ''}
                />
                <KolamButton
                  disabled={controller.mutating}
                  label="Bayar"
                  onPress={() => {
                    void controller.onPay(row.id);
                  }}
                  size="sm"
                />
              </View>
            ) : null}
            {row.status === 'paid' && canUpdate ? (
              row.transferProofPath ? (
                <Pressable
                  accessibilityRole="link"
                  onPress={() => {
                    void Linking.openURL(row.transferProofPath!);
                  }}>
                  <Text style={styles.linkText}>Lihat bukti</Text>
                </Pressable>
              ) : (
                <KolamUploadButton
                  disabled={controller.mutating}
                  label="Unggah bukti"
                  onPress={() => {
                    void controller.onUploadProof(row.id);
                  }}
                  size="sm"
                />
              )
            ) : null}
          </View>
        )}
        rows={controller.rows}
        showFooter={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: 10,
    minHeight: 0,
  },
  toolbarWrap: {
    elevation: 1000,
    flexShrink: 0,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
  },
  stack: {
    gap: 2,
  },
  actionCol: {
    gap: 6,
    minWidth: 140,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  payBlock: {
    gap: 6,
    minWidth: 160,
  },
  cellText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  meta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  dangerText: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  linkText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
