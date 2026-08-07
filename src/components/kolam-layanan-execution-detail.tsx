import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  getKolamLayananExecutionStatusLabel,
  getKolamLayananProgressStepLabel,
  getKolamLayananReviewStatusLabel,
  getKolamLayananTaskTypeLabel,
  getKolamLayananVisitVerificationLabel,
  KOLAM_LAYANAN_REJECTION_DECISION_OPTIONS,
  KOLAM_LAYANAN_ROOT,
  requiresKolamLayananVisitVerification,
} from '../domain/kolam-layanan';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { useKolamLayananExecutionController } from '../hooks/use-kolam-layanan-execution-controller';
import { KolamButton } from './kolam-button';
import {KolamDaftarButton} from './kolam-daftar-button';
import { KolamRefreshButton } from './kolam-refresh-button';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDetailScrollSurface } from './kolam-detail-scroll-surface';
import { KolamDescriptionList } from './kolam-description-list';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamSwitch } from './kolam-switch';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

function FormSection({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <KolamContentFrame variant="nativeFormSection">
      <KolamCopyStack
        containerStyle={styles.sectionCopy}
        items={[
          { id: 'title', text: title, style: styles.sectionTitle },
          ...(description
            ? [{ id: 'description', text: description, style: styles.metaText }]
            : []),
        ]}
      />
      <View style={styles.sectionBody}>{children}</View>
    </KolamContentFrame>
  );
}

function desc(id: string, label: string, value: string) {
  return { id, label, meta: '', tone: 'default' as const, value };
}

function formatDatetime(value?: string | null) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function KolamLayananExecutionDetail({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamLayananExecutionController(route);
  const voucher = controller.voucher;
  const execution = controller.execution;
  const title = execution
    ? `Eksekusi · ${execution.id.slice(-8)}`
    : 'Detail eksekusi';

  return (
    <View style={styles.surface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text numberOfLines={1} style={styles.toolbarTitle}>
              {title}
            </Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamRefreshButton
              accessibilityLabel="Refresh"
              disabled={controller.loading || controller.saving}

              onPress={() => {
                void controller.onRefresh();
              }}
            />
            <KolamDaftarButton
              onPress={() => onRouteChange?.(KOLAM_LAYANAN_ROOT)}
            />
            {voucher?.id ? (
              <KolamButton
                label="Voucher"
                onPress={() =>
                  onRouteChange?.(
                    `${KOLAM_LAYANAN_ROOT}/voucher/${voucher.id}`,
                  )
                }
              />
            ) : null}
          </View>
        </View>
      </View>

      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={4}
          style={styles.banner}
        />
      ) : null}
      {controller.notice ? (
        <KolamStatusBadge
          intent="success"
          label={controller.notice}
          numberOfLines={3}
          style={styles.banner}
        />
      ) : null}

      {controller.loading && !execution ? (
        <KolamEmptyState message="Memuat detail eksekusi…" title="Memuat" />
      ) : !execution || !voucher ? (
        <KolamEmptyState
          message="Eksekusi atau voucher tidak ditemukan."
          title="Tidak ada data"
        />
      ) : (
        <KolamDetailScrollSurface contentContainerStyle={styles.content}>
          <View style={styles.stripRow}>
            <KolamStatusBadge
              intent={
                execution.status === 'completed'
                  ? 'success'
                  : execution.status === 'skipped' ||
                      execution.status === 'missed'
                    ? 'warning'
                    : 'info'
              }
              label={getKolamLayananExecutionStatusLabel(execution.status)}
            />
            <KolamStatusBadge
              intent="secondary"
              label={getKolamLayananTaskTypeLabel(
                controller.task?.taskType || voucher.taskType,
              )}
            />
            {requiresKolamLayananVisitVerification(execution) ? (
              <KolamStatusBadge
                intent={
                  execution.visitVerificationStatus === 'verified'
                    ? 'success'
                    : execution.visitVerificationStatus === 'rejected'
                      ? 'danger'
                      : 'warning'
                }
                label={getKolamLayananVisitVerificationLabel(
                  execution.visitVerificationStatus,
                )}
              />
            ) : null}
            {execution.reviewStatus ? (
              <KolamStatusBadge
                intent={
                  execution.reviewStatus === 'accepted'
                    ? 'success'
                    : execution.reviewStatus === 'rejected'
                      ? 'danger'
                      : 'warning'
                }
                label={getKolamLayananReviewStatusLabel(execution.reviewStatus)}
              />
            ) : null}
          </View>

          <FormSection title="Informasi eksekusi">
            <KolamDescriptionList
              rows={[
                desc('voucher', 'Voucher', voucher.serviceSerial),
                desc('invoice', 'Faktur', voucher.invoiceCode),
                desc('customer', 'Pelanggan', voucher.customerName),
                desc(
                  'scheduled',
                  'Jadwal',
                  formatDatetime(execution.scheduledTime),
                ),
                desc(
                  'estimated',
                  'Estimasi selesai',
                  formatDatetime(execution.estimatedAt),
                ),
                desc(
                  'actual',
                  'Waktu aktual',
                  formatDatetime(execution.executionTime),
                ),
                desc(
                  'assigned',
                  'Penanggung jawab',
                  execution.assignedToName || '—',
                ),
                desc(
                  'executed',
                  'Dikerjakan oleh',
                  execution.executedByName || '—',
                ),
                desc(
                  'progress',
                  'Progres',
                  getKolamLayananProgressStepLabel(execution.progressStep) ||
                    '—',
                ),
                desc(
                  'notes',
                  'Catatan',
                  execution.executionNotes || execution.notes || '—',
                ),
              ]}
            />
          </FormSection>

          <FormSection
            description="Supervisor memverifikasi hasil lapangan; konfirmasi pelanggan menutup antrian dashboard."
            title="Verifikasi & konfirmasi kunjungan"
          >
            {execution.supervisorVerifiedAt ? (
              <Text style={styles.metaText}>
                Supervisor: {execution.supervisorVerifiedByName || '—'} ·{' '}
                {formatDatetime(execution.supervisorVerifiedAt)}
              </Text>
            ) : null}
            {execution.customerVerifiedAt ? (
              <Text style={styles.metaText}>
                Pelanggan:{' '}
                {execution.customerVerificationConfirmed
                  ? 'Setuju'
                  : 'Tidak setuju'}
                {execution.customerVerificationNote
                  ? ` — ${execution.customerVerificationNote}`
                  : ''}{' '}
                · {formatDatetime(execution.customerVerifiedAt)}
              </Text>
            ) : null}

            {controller.canSupervisorReview ? (
              <View style={styles.actionBox}>
                <Text style={styles.primaryText}>Verifikasi supervisor</Text>
                <View style={styles.actionRow}>
                  <KolamButton
                    disabled={controller.saving}
                    intent="primary"
                    label="Verifikasi"
                    onPress={() => {
                      void controller.onAcceptReview();
                    }}
                  />
                  <KolamButton
                    disabled={controller.saving}
                    label="Tolak"
                    onPress={() => controller.onSetRejectOpen(true)}
                  />
                </View>
                {controller.rejectOpen ? (
                  <View style={styles.rejectBox}>
                    <Text style={styles.primaryText}>Tolak hasil eksekusi</Text>
                    <View style={settingsWebFormStyles.settingsWebFormField}>
                      <Text style={styles.fieldLabel}>Alasan</Text>
                      <KolamFormTextField
                        multiline
                        onChangeText={controller.onSetRejectReason}
                        placeholder="Alasan penolakan…"
                        style={[
                          settingsWebFormStyles.settingsWebFormFieldValue,
                          settingsWebFormStyles.settingsWebFormFieldValueTextarea,
                        ]}
                        value={controller.rejectReason}
                      />
                    </View>
                    <KolamDropdownSelect
                      label="Keputusan"
                      onChange={value =>
                        controller.onSetRejectDecision(
                          value as typeof controller.rejectDecision,
                        )
                      }
                      options={[
                        { label: 'Pilih keputusan', value: '' },
                        ...KOLAM_LAYANAN_REJECTION_DECISION_OPTIONS.map(
                          option => ({
                            label: option.label,
                            value: option.id,
                          }),
                        ),
                      ]}
                      value={controller.rejectDecision}
                    />
                    <View style={styles.actionRow}>
                      <KolamButton
                        label="Batal"
                        onPress={() => controller.onSetRejectOpen(false)}
                      />
                      <KolamButton
                        disabled={
                          controller.saving ||
                          !controller.rejectReason.trim() ||
                          !controller.rejectDecision
                        }
                        intent="primary"
                        label="Konfirmasi tolak"
                        onPress={() => {
                          void controller.onRejectReview();
                        }}
                      />
                    </View>
                  </View>
                ) : null}
              </View>
            ) : null}

            {controller.canCustomerConfirm ? (
              <View style={styles.actionBox}>
                <Text style={styles.primaryText}>
                  Konfirmasi pelanggan
                </Text>
                <View style={styles.switchRow}>
                  <View style={styles.switchCopy}>
                    <Text style={styles.metaText}>
                      Pelanggan menyetujui hasil kunjungan
                    </Text>
                  </View>
                  <KolamSwitch
                    active={controller.customerConfirmed}
                    onPress={() =>
                      controller.onSetCustomerConfirmed(
                        !controller.customerConfirmed,
                      )
                    }
                  />
                </View>
                <View style={settingsWebFormStyles.settingsWebFormField}>
                  <Text style={styles.fieldLabel}>Catatan</Text>
                  <KolamFormTextField
                    multiline
                    onChangeText={controller.onSetCustomerNote}
                    placeholder="Catatan dari pelanggan / WA / telepon…"
                    style={[
                      settingsWebFormStyles.settingsWebFormFieldValue,
                      settingsWebFormStyles.settingsWebFormFieldValueTextarea,
                    ]}
                    value={controller.customerNote}
                  />
                </View>
                <KolamButton
                  disabled={controller.saving}
                  intent="primary"
                  label="Catat konfirmasi pelanggan"
                  onPress={() => {
                    void controller.onSaveCustomerConfirm();
                  }}
                />
              </View>
            ) : null}

            {!controller.canSupervisorReview &&
            !controller.canCustomerConfirm ? (
              <Text style={styles.metaText}>
                Tidak ada tindakan verifikasi/konfirmasi yang terbuka untuk
                eksekusi ini saat ini.
              </Text>
            ) : null}
          </FormSection>
        </KolamDetailScrollSurface>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 8,
  },
  content: {
    gap: 16,
    paddingBottom: 32,
    paddingHorizontal: 8,
  },
  toolbarTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 420,
  },
  banner: {
    alignSelf: 'stretch',
    marginHorizontal: 4,
  },
  stripRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionCopy: {
    gap: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '700',
  },
  sectionBody: {
    gap: 12,
  },
  fieldLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  primaryText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  metaText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 18,
  },
  actionBox: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 10,
  },
  rejectBox: {
    gap: 10,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  switchCopy: {
    flex: 1,
  },
});
