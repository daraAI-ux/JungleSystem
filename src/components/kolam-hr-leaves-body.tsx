import React, {useMemo} from 'react';
import {Modal, StyleSheet, Text, View} from 'react-native';
import {
  KOLAM_HR_LEAVE_TYPE_OPTIONS,
  type KolamHrLeaveRequest,
} from '../domain/kolam-hr';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {useKolamHrLeavesController} from '../hooks/use-kolam-hr-leaves-controller';
import {KolamButton} from './kolam-button';
import {KolamDropdownSelect} from './kolam-dropdown-select';
import {KolamFormTextField} from './kolam-form-text-field';
import {KolamListTableComposition} from './kolam-list-table-composition';
import {KolamModalBackdrop} from './kolam-modal-backdrop';
import {KolamStatusBadge} from './kolam-status-badge';
import {kolamTableToolbarStyles} from './kolam-table-toolbar-styles';

/** FE `HrLeavesPanel`. */
export function KolamHrLeavesBody({enabled}: {enabled: boolean}) {
  const controller = useKolamHrLeavesController({enabled});

  const columns = useMemo(
    () => [
      {
        id: 'employee',
        label: 'Karyawan',
        flex: 1.2,
        render: (row: KolamHrLeaveRequest) => (
          <Text style={styles.cellText}>{row.userName}</Text>
        ),
      },
      {
        id: 'type',
        label: 'Jenis',
        flex: 0.7,
        render: (row: KolamHrLeaveRequest) => (
          <Text style={styles.cellText}>{row.type}</Text>
        ),
      },
      {
        id: 'period',
        label: 'Periode',
        flex: 1.2,
        render: (row: KolamHrLeaveRequest) => (
          <Text style={styles.meta}>
            {row.startDateKey} — {row.endDateKey}
          </Text>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        flex: 0.8,
        render: (row: KolamHrLeaveRequest) => (
          <KolamStatusBadge
            intent={
              row.status === 'approved'
                ? 'success'
                : row.status === 'rejected'
                  ? 'danger'
                  : 'secondary'
            }
            label={row.status}
          />
        ),
      },
      {
        id: 'reason',
        label: 'Alasan',
        flex: 1.2,
        render: (row: KolamHrLeaveRequest) => (
          <Text style={styles.meta}>{row.reason || '-'}</Text>
        ),
      },
    ],
    [],
  );

  if (!enabled) {
    return <Text style={styles.meta}>Akses admin diperlukan.</Text>;
  }

  return (
    <View style={styles.root}>
      <View style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              <KolamButton
                intent={controller.filter === 'pending' ? 'primary' : 'outline'}
                label="Pending"
                onPress={() => controller.setFilter('pending')}
                size="sm"
              />
              <KolamButton
                intent={controller.filter === 'all' ? 'primary' : 'outline'}
                label="Semua"
                onPress={() => controller.setFilter('all')}
                size="sm"
              />
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              <KolamButton
                intent="outline"
                label="+ Input manual"
                onPress={() => controller.setCreateOpen(true)}
                size="sm"
              />
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
        emptyTitle={
          controller.filter === 'pending'
            ? 'Tidak ada pengajuan pending.'
            : 'Belum ada pengajuan.'
        }
        getRowKey={row => row.id}
        loading={controller.loading}
        renderActions={row =>
          row.status === 'pending' ? (
            <View style={styles.actionRow}>
              <KolamButton
                disabled={controller.mutating}
                label="Setujui"
                onPress={() => {
                  void controller.onReview(row.id, true);
                }}
                size="sm"
              />
              <KolamButton
                disabled={controller.mutating}
                intent="outline"
                label="Tolak"
                onPress={() => {
                  void controller.onReview(row.id, false);
                }}
                size="sm"
              />
            </View>
          ) : (
            <Text style={styles.meta}>—</Text>
          )
        }
        rows={controller.rows}
        showFooter={false}
      />

      <Modal
        animationType="fade"
        onRequestClose={() => {
          if (!controller.mutating) {
            controller.setCreateOpen(false);
          }
        }}
        transparent
        visible={controller.createOpen}>
        <View style={styles.modalRoot}>
          <KolamModalBackdrop
            onPress={() => {
              if (!controller.mutating) {
                controller.setCreateOpen(false);
              }
            }}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Input cuti / ijin manual</Text>
            <KolamDropdownSelect
              label="Karyawan"
              onChange={value => controller.setCreateDraft({userId: value})}
              options={[
                {
                  label: controller.loadingEmployees
                    ? 'Memuat…'
                    : 'Pilih karyawan',
                  value: '',
                },
                ...controller.employeeOptions,
              ]}
              showLabelInTrigger={false}
              value={controller.createDraft.userId}
            />
            <KolamDropdownSelect
              label="Jenis"
              onChange={value =>
                controller.setCreateDraft({
                  type: value as (typeof KOLAM_HR_LEAVE_TYPE_OPTIONS)[number]['id'],
                })
              }
              options={KOLAM_HR_LEAVE_TYPE_OPTIONS.map(option => ({
                label: option.label,
                value: option.id,
              }))}
              showLabelInTrigger={false}
              value={controller.createDraft.type}
            />
            <KolamFormTextField
              onChangeText={value =>
                controller.setCreateDraft({startDateKey: value})
              }
              placeholder="Mulai (YYYY-MM-DD)"
              value={controller.createDraft.startDateKey}
            />
            <KolamFormTextField
              onChangeText={value =>
                controller.setCreateDraft({endDateKey: value})
              }
              placeholder="Selesai (YYYY-MM-DD)"
              value={controller.createDraft.endDateKey}
            />
            <KolamFormTextField
              multiline
              onChangeText={value => controller.setCreateDraft({reason: value})}
              placeholder="Alasan"
              value={controller.createDraft.reason}
            />
            <View style={styles.modalFooter}>
              <KolamButton
                disabled={controller.mutating}
                intent="outline"
                label="Batal"
                onPress={() => controller.setCreateOpen(false)}
                size="sm"
              />
              <KolamButton
                disabled={controller.mutating}
                label={controller.mutating ? 'Menyimpan…' : 'Simpan'}
                onPress={() => {
                  void controller.onCreate();
                }}
                size="sm"
              />
            </View>
          </View>
        </View>
      </Modal>
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
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cellText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  meta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  modalRoot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    maxWidth: 480,
    padding: 16,
    width: '100%',
    zIndex: 2,
  },
  modalTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 4,
  },
});
