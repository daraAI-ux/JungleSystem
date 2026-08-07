import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  calcKolamLayananVolumeM3FromUnitLabel,
  formatKolamLayananContractDuration,
  formatKolamLayananIdr,
  formatKolamLayananPurchaseDimensions,
  formatKolamLayananPurchaseVolumeM3,
  canKolamLayananSupervisorReview,
  getKolamLayananExecutionStatusLabel,
  getKolamLayananMaterialChargeLabel,
  getKolamLayananPendingStatusIntent,
  getKolamLayananPendingStatusLabel,
  getKolamLayananReviewStatusLabel,
  getKolamLayananScheduleStatusLabel,
  getKolamLayananSubscriptionStatusIntent,
  getKolamLayananSubscriptionStatusLabel,
  getKolamLayananTaskTypeLabel,
  getKolamLayananVoucherAuditActionLabel,
  getKolamLayananWeekdayLabel,
  KOLAM_LAYANAN_DIMENSION_UNIT_OPTIONS,
  KOLAM_LAYANAN_MATERIAL_CHARGE_OPTIONS,
  KOLAM_LAYANAN_REJECTION_DECISION_OPTIONS,
  KOLAM_LAYANAN_ROOT,
  KOLAM_LAYANAN_WEEKDAY_OPTIONS,
  parseKolamLayananDimInput,
  type KolamLayananContractDurationUnit,
  type KolamLayananRejectionDecision,
  type KolamLayananVoucherDetail,
  type KolamLayananVoucherMaterialLine,
} from '../domain/kolam-layanan';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamLayananVoucherController,
  type KolamLayananVoucherController,
} from '../hooks/use-kolam-layanan-voucher-controller';
import { KolamButton } from './kolam-button';
import {KolamSaveButton} from './kolam-save-button';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDetailScrollSurface } from './kolam-detail-scroll-surface';
import {
  KolamDetailMetaStrip,
  KolamDetailMetaStripItem,
} from './kolam-detail-meta-strip';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { containsHtmlMarkup, KolamHtmlContent } from './kolam-html-content';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamSwitch } from './kolam-switch';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

function FieldShell({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <View style={settingsWebFormStyles.settingsWebFormField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

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

/** FE DetailField: label atas, value bawah. */
function DetailField({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <View style={styles.detailField}>
      <Text style={styles.detailFieldLabel}>{label}</Text>
      <View style={styles.detailFieldValue}>{children}</View>
    </View>
  );
}

function formatDate(value?: string | null) {
  if (!value) {
    return null;
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

function EmptyValue() {
  return <Text style={styles.emptyValue}>—</Text>;
}

function voucherBackRoute(voucher: KolamLayananVoucherDetail | null) {
  if (voucher?.serviceId) {
    return `${KOLAM_LAYANAN_ROOT}/${voucher.serviceId}`;
  }
  return KOLAM_LAYANAN_ROOT;
}

export function KolamLayananVoucherDetail({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamLayananVoucherController(route);
  const voucher = controller.voucher;
  const title = voucher?.serviceSerial || 'Detail voucher';

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
            <KolamButton
              label="Kembali ke layanan"
              onPress={() => onRouteChange?.(voucherBackRoute(voucher))}
            />
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
      {!controller.canMutateSale ? (
        <KolamStatusBadge
          intent="warning"
          label="Mode baca: ubah jadwal / T&C / material butuh izin update penjualan (sale), bukan hanya akses Layanan."
          numberOfLines={3}
          style={styles.banner}
        />
      ) : null}

      {controller.loading && !voucher ? (
        <KolamEmptyState message="Memuat detail voucher…" title="Memuat" />
      ) : !voucher ? (
        <KolamEmptyState
          message="Voucher tidak ditemukan."
          title="Tidak ada data"
        />
      ) : (
        <KolamDetailScrollSurface contentContainerStyle={styles.content}>
          <KolamDetailMetaStrip>
            <KolamDetailMetaStripItem label="Status voucher">
              <KolamStatusBadge
                intent={getKolamLayananPendingStatusIntent(voucher.status)}
                label={getKolamLayananPendingStatusLabel(voucher.status)}
              />
            </KolamDetailMetaStripItem>
          </KolamDetailMetaStrip>

          {voucher.initiated ? (
            <View style={styles.detailColumns}>
              <View style={styles.detailMain}>
                <VoucherInfoSection
                  onRouteChange={onRouteChange}
                  voucher={voucher}
                />
                <VoucherInitiatedTaskPanels
                  controller={controller}
                  onRouteChange={onRouteChange}
                  voucherId={voucher.id}
                />
              </View>
              <View style={styles.detailSide}>
                <VoucherSubscriptionSection
                  controller={controller}
                  onRouteChange={onRouteChange}
                />
                <VoucherExecutionHistorySection
                  controller={controller}
                  onRouteChange={onRouteChange}
                  voucherId={voucher.id}
                />
                <VoucherAuditSection controller={controller} />
              </View>
            </View>
          ) : (
            <View style={styles.detailColumns}>
              <View style={styles.detailMain}>
                <VoucherInfoSection
                  onRouteChange={onRouteChange}
                  voucher={voucher}
                />
                <VoucherContractDimensionsSection controller={controller} />
                <VoucherMaterialsSection controller={controller} />
              </View>
              <View style={styles.detailSide}>
                <VoucherSubscriptionSection
                  controller={controller}
                  onRouteChange={onRouteChange}
                />
                <VoucherCustomerReadinessSection controller={controller} />
                <VoucherScheduleSection controller={controller} />
                <VoucherTermsSection controller={controller} />
                {controller.canMutateSale ? (
                  <VoucherStaffActivateSection controller={controller} />
                ) : null}
                <VoucherAuditSection controller={controller} />
              </View>
            </View>
          )}
        </KolamDetailScrollSurface>
      )}
    </View>
  );
}


function formatDateTime(value?: string | null) {
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

function VoucherInitiatedTaskPanels({
  controller,
  onRouteChange,
  voucherId,
}: {
  controller: KolamLayananVoucherController;
  onRouteChange?: (route: string) => void;
  voucherId: string;
}) {
  const task = controller.task;
  if (controller.taskLoading && !task) {
    return (
      <FormSection title="Ringkasan tugas">
        <Text style={styles.metaText}>Memuat data tugas…</Text>
      </FormSection>
    );
  }
  if (!task) {
    return (
      <FormSection title="Ringkasan tugas">
        <Text style={styles.warnText}>
          Data tugas tidak ditemukan untuk voucher ini.
        </Text>
      </FormSection>
    );
  }

  const upcoming = task.executions.filter(
    item => item.status === 'pending' || item.status === 'now',
  );
  const doneCount = task.executions.filter(
    item => item.status === 'completed' || item.status === 'skipped',
  ).length;

  return (
    <>
      <FormSection title="Ringkasan tugas">
        <View style={styles.summaryGrid}>
          <DetailField label="Nama tugas">
            <Text style={styles.summaryValue}>{task.name || '—'}</Text>
          </DetailField>
          <DetailField label="Progres">
            <Text style={styles.summaryValue}>
              {task.executions.length
                ? `${doneCount} / ${task.executions.length} kunjungan`
                : '—'}
            </Text>
          </DetailField>
        </View>
      </FormSection>

      <FormSection title="Jadwal akan datang">
        {upcoming.length === 0 ? (
          <Text style={styles.metaText}>Tidak ada jadwal mendatang.</Text>
        ) : (
          upcoming.map(execution => (
            <View key={execution.id} style={styles.auditRow}>
              <View style={styles.stripRow}>
                <KolamStatusBadge
                  intent={execution.status === 'now' ? 'success' : 'secondary'}
                  label={getKolamLayananExecutionStatusLabel(execution.status)}
                />
                <Text style={styles.monoText}>
                  #{execution.id.slice(-6)}
                </Text>
              </View>
              <Text style={styles.metaText}>
                Jadwal: {formatDateTime(execution.scheduledTime)}
              </Text>
              <Text style={styles.metaText}>
                PIC: {execution.assignedToName || '—'}
              </Text>
              <Pressable
                accessibilityRole="link"
                onPress={() =>
                  onRouteChange?.(
                    `${KOLAM_LAYANAN_ROOT}/voucher/${voucherId}/execution/${execution.id}`,
                  )
                }
              >
                <Text style={styles.linkText}>Buka detail eksekusi</Text>
              </Pressable>
            </View>
          ))
        )}
      </FormSection>

      <FormSection
        description={`${task.messages.length} pesan`}
        title="Diskusi"
      >
        {task.messages.length === 0 ? (
          <Text style={styles.metaText}>
            Belum ada pesan. Mulai percakapan.
          </Text>
        ) : (
          task.messages.map(message => (
            <View key={message.id} style={styles.auditRow}>
              <View style={styles.stripRow}>
                <Text style={styles.primaryText}>{message.senderName}</Text>
                <KolamStatusBadge
                  intent={
                    message.senderType === 'staff' ? 'info' : 'secondary'
                  }
                  label={message.senderType === 'staff' ? 'Staff' : 'Klien'}
                />
              </View>
              <Text style={styles.metaText}>
                {formatDateTime(message.createdAt)}
              </Text>
              <Text style={styles.summaryValue}>{message.message}</Text>
            </View>
          ))
        )}
        <FieldShell label="Pesan baru">
          <KolamFormTextField
            multiline
            onChangeText={controller.onChangeDiscussionDraft}
            placeholder="Tulis pesan…"
            style={[
              settingsWebFormStyles.settingsWebFormFieldValue,
              settingsWebFormStyles.settingsWebFormFieldValueTextarea,
            ]}
            value={controller.discussionDraft}
          />
        </FieldShell>
        <KolamButton
          disabled={controller.saving || !controller.discussionDraft.trim()}
          intent="primary"
          label="Kirim pesan"
          onPress={() => {
            void controller.onSendDiscussion();
          }}
        />
      </FormSection>
    </>
  );
}

function VoucherExecutionHistorySection({
  controller,
  onRouteChange,
  voucherId,
}: {
  controller: KolamLayananVoucherController;
  onRouteChange?: (route: string) => void;
  voucherId: string;
}) {
  const task = controller.task;
  const completed =
    task?.executions.filter(
      item =>
        item.status === 'completed' ||
        item.status === 'skipped' ||
        item.status === 'missed',
    ) ?? [];

  return (
    <FormSection title="Riwayat eksekusi">
      {!task ? (
        <Text style={styles.metaText}>
          {controller.taskLoading
            ? 'Memuat riwayat…'
            : 'Belum ada riwayat eksekusi.'}
        </Text>
      ) : completed.length === 0 ? (
        <Text style={styles.metaText}>Belum ada riwayat eksekusi.</Text>
      ) : (
        completed.map(execution => {
          const canReview = canKolamLayananSupervisorReview(execution);
          const rejecting = controller.rejectExecutionId === execution.id;
          return (
            <View key={execution.id} style={styles.auditRow}>
              <View style={styles.stripRow}>
                <Text style={styles.monoText}>
                  #{execution.id.slice(-6)}
                </Text>
                <KolamStatusBadge
                  intent="secondary"
                  label={getKolamLayananExecutionStatusLabel(execution.status)}
                />
                {execution.reviewStatus ? (
                  <KolamStatusBadge
                    intent={
                      execution.reviewStatus === 'accepted'
                        ? 'success'
                        : execution.reviewStatus === 'rejected'
                          ? 'danger'
                          : 'warning'
                    }
                    label={getKolamLayananReviewStatusLabel(
                      execution.reviewStatus,
                    )}
                  />
                ) : null}
              </View>
              <Text style={styles.metaText}>
                Jadwal: {formatDateTime(execution.scheduledTime)}
              </Text>
              <Text style={styles.metaText}>
                Selesai: {formatDateTime(execution.executionTime)}
              </Text>
              <Pressable
                accessibilityRole="link"
                onPress={() =>
                  onRouteChange?.(
                    `${KOLAM_LAYANAN_ROOT}/voucher/${voucherId}/execution/${execution.id}`,
                  )
                }
              >
                <Text style={styles.linkText}>Detail</Text>
              </Pressable>
              {canReview ? (
                <View style={styles.actionRow}>
                  <KolamButton
                    disabled={controller.saving}
                    intent="primary"
                    label="Terima"
                    onPress={() => {
                      void controller.onAcceptExecutionReview(execution.id);
                    }}
                  />
                  <KolamButton
                    disabled={controller.saving}
                    label="Tolak"
                    onPress={() =>
                      controller.onOpenRejectExecution(execution.id)
                    }
                  />
                </View>
              ) : null}
              {rejecting ? (
                <View style={styles.infoBox}>
                  <FieldShell label="Alasan penolakan">
                    <KolamFormTextField
                      multiline
                      onChangeText={controller.onChangeRejectReason}
                      style={[
                        settingsWebFormStyles.settingsWebFormFieldValue,
                        settingsWebFormStyles.settingsWebFormFieldValueTextarea,
                      ]}
                      value={controller.rejectReason}
                    />
                  </FieldShell>
                  <KolamDropdownSelect
                    label="Keputusan"
                    onChange={value =>
                      controller.onChangeRejectDecision(
                        value as KolamLayananRejectionDecision,
                      )
                    }
                    options={KOLAM_LAYANAN_REJECTION_DECISION_OPTIONS.map(
                      option => ({
                        label: option.label,
                        value: option.id,
                      }),
                    )}
                    value={controller.rejectDecision}
                  />
                  <View style={styles.actionRow}>
                    <KolamButton
                      disabled={controller.saving}
                      intent="primary"
                      label="Simpan penolakan"
                      onPress={() => {
                        void controller.onConfirmRejectExecution();
                      }}
                    />
                    <KolamButton
                      label="Batal"
                      onPress={controller.onCancelRejectExecution}
                    />
                  </View>
                </View>
              ) : null}
            </View>
          );
        })
      )}
    </FormSection>
  );
}

function VoucherInfoSection({
  onRouteChange,
  voucher,
}: {
  onRouteChange?: (route: string) => void;
  voucher: KolamLayananVoucherDetail;
}) {
  const purchaseDimLabel = formatKolamLayananPurchaseDimensions(
    voucher.purchaseDimensions,
  );
  const volumeFallback = !purchaseDimLabel
    ? formatKolamLayananPurchaseVolumeM3(voucher.quantity)
    : null;
  const enclosureTypesLabel = voucher.purchaseEnclosureTypes.length
    ? voucher.purchaseEnclosureTypes.join(', ')
    : null;
  const enclosureLabel = voucher.enclosureName
    ? voucher.enclosureType
      ? `${voucher.enclosureName} (${voucher.enclosureType})`
      : voucher.enclosureName
    : null;
  const contractLabel =
    voucher.contractDurationValue != null && voucher.contractDurationUnit
      ? formatKolamLayananContractDuration(
          voucher.contractDurationValue,
          voucher.contractDurationUnit as KolamLayananContractDurationUnit,
        )
      : null;
  const purchasedLabel = formatDate(voucher.purchasedAt);
  const initiatedLabel = formatDate(voucher.initiatedAt);
  const hasInvoice =
    Boolean(voucher.invoiceCode) && voucher.invoiceCode !== '—';
  const hasCustomer =
    Boolean(voucher.customerName) && voucher.customerName !== '—';
  const hasService =
    Boolean(voucher.serviceName) && voucher.serviceName !== '—';
  const hasPackage =
    Boolean(voucher.packageCode) && voucher.packageCode !== '—';

  return (
    <FormSection title="Informasi voucher">
      <View style={styles.summaryGrid}>
        <DetailField label="Faktur">
          {hasInvoice && voucher.saleId ? (
            <Pressable
              accessibilityRole="link"
              onPress={() => onRouteChange?.(`/sales/${voucher.saleId}`)}
            >
              <Text style={[styles.summaryValue, styles.monoText]}>
                {voucher.invoiceCode}
              </Text>
            </Pressable>
          ) : hasInvoice ? (
            <Text style={[styles.summaryValue, styles.monoText]}>
              {voucher.invoiceCode}
            </Text>
          ) : (
            <EmptyValue />
          )}
        </DetailField>
        <DetailField label="Pelanggan">
          {hasCustomer ? (
            <Text style={styles.summaryValue}>{voucher.customerName}</Text>
          ) : (
            <EmptyValue />
          )}
        </DetailField>

        <DetailField label="Layanan">
          {hasService ? (
            <Text style={styles.summaryValue}>{voucher.serviceName}</Text>
          ) : (
            <EmptyValue />
          )}
        </DetailField>
        <DetailField label="Tipe layanan">
          {voucher.taskType ? (
            <KolamStatusBadge
              intent={voucher.taskType === 'dosing' ? 'info' : 'secondary'}
              label={getKolamLayananTaskTypeLabel(voucher.taskType)}
            />
          ) : (
            <EmptyValue />
          )}
        </DetailField>

        <DetailField label="Kunjungan per bulan">
          {voucher.visitsPerMonth != null && voucher.visitsPerMonth > 0 ? (
            <Text style={styles.summaryValue}>{voucher.visitsPerMonth}</Text>
          ) : (
            <EmptyValue />
          )}
        </DetailField>
        <DetailField label="Durasi kontrak">
          {contractLabel && contractLabel !== '—' ? (
            <Text style={styles.summaryValue}>{contractLabel}</Text>
          ) : (
            <EmptyValue />
          )}
        </DetailField>

        <DetailField label="Kode paket">
          {hasPackage ? (
            <Text style={[styles.summaryValue, styles.monoText]}>
              {voucher.packageCode}
            </Text>
          ) : (
            <EmptyValue />
          )}
        </DetailField>

        <DetailField label="Ukuran kandang (P × L × T)">
          {purchaseDimLabel ? (
            <View style={styles.dimBlock}>
              <Text style={styles.summaryValue}>{purchaseDimLabel}</Text>
              {volumeFallback ? (
                <Text style={styles.metaText}>Volume: {volumeFallback}</Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.dimBlock}>
              <EmptyValue />
              <Text style={styles.warnText}>
                Ukuran kontrak belum tercatat — aktivasi ke kandang ditolak.
              </Text>
            </View>
          )}
        </DetailField>
        <DetailField label="Tipe kandang kontrak">
          {enclosureTypesLabel ? (
            <Text style={styles.summaryValue}>{enclosureTypesLabel}</Text>
          ) : (
            <EmptyValue />
          )}
        </DetailField>

        <DetailField label="Kandang teraktivasi">
          {voucher.enclosureId && enclosureLabel ? (
            <Pressable
              accessibilityRole="link"
              onPress={() =>
                onRouteChange?.(`/enclosures/${voucher.enclosureId}`)
              }
            >
              <Text style={styles.linkText}>{enclosureLabel}</Text>
            </Pressable>
          ) : enclosureLabel ? (
            <Text style={styles.summaryValue}>{enclosureLabel}</Text>
          ) : (
            <EmptyValue />
          )}
        </DetailField>
        <DetailField label="PIC kunjungan">
          {voucher.visitAssignedToName ? (
            <Text style={styles.summaryValue}>
              {voucher.visitAssignedToName}
            </Text>
          ) : (
            <EmptyValue />
          )}
        </DetailField>

        <DetailField label="Tanggal beli">
          {purchasedLabel ? (
            <Text style={styles.summaryValue}>{purchasedLabel}</Text>
          ) : (
            <EmptyValue />
          )}
        </DetailField>
        <DetailField label="Tanggal aktivasi">
          {initiatedLabel ? (
            <Text style={styles.summaryValue}>{initiatedLabel}</Text>
          ) : (
            <EmptyValue />
          )}
        </DetailField>
      </View>
    </FormSection>
  );
}

function VoucherContractDimensionsSection({
  controller,
}: {
  controller: KolamLayananVoucherController;
}) {
  const voucher = controller.voucher;
  if (!voucher) {
    return null;
  }
  const disabled =
    !controller.canMutateSale ||
    voucher.status === 'cancelled' ||
    voucher.status === 'initiated';
  const draft = controller.contractDraft;
  const length = parseKolamLayananDimInput(draft.length);
  const width = parseKolamLayananDimInput(draft.width);
  const height = parseKolamLayananDimInput(draft.height);
  const volumeM3 = calcKolamLayananVolumeM3FromUnitLabel(
    length,
    width,
    height,
    draft.unitLabel,
  );
  const currentLabel = formatKolamLayananPurchaseDimensions(
    voucher.purchaseDimensions,
  );

  return (
    <FormSection
      description="P × L × T dari pembelian — wajib agar aktivasi ke kandang pelanggan bisa dilakukan. Perubahan disinkron ke baris layanan di faktur (termasuk faktur paid)."
      title="Ukuran kontrak kandang"
    >
      {currentLabel ? (
        <Text style={styles.metaText}>
          Tercatat: <Text style={styles.primaryText}>{currentLabel}</Text>
        </Text>
      ) : (
        <Text style={styles.warnText}>
          Belum ada ukuran kontrak — isi form di bawah sebelum aktivasi.
        </Text>
      )}

      <View style={styles.calculatorBox}>
        <Text style={styles.calculatorTitle}>
          Kalkulator volume (P × L × T → m³)
        </Text>
        <View style={styles.dimRow}>
          <FieldShell label="Panjang">
            <KolamFormTextField
              editable={!disabled}
              mode="numeric"
              onChangeText={value =>
                controller.onChangeContractDraft({ length: value })
              }
              placeholder="Panjang"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={draft.length}
            />
          </FieldShell>
          <FieldShell label="Lebar">
            <KolamFormTextField
              editable={!disabled}
              mode="numeric"
              onChangeText={value =>
                controller.onChangeContractDraft({ width: value })
              }
              placeholder="Lebar"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={draft.width}
            />
          </FieldShell>
          <FieldShell label="Tinggi">
            <KolamFormTextField
              editable={!disabled}
              mode="numeric"
              onChangeText={value =>
                controller.onChangeContractDraft({ height: value })
              }
              placeholder="Tinggi"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={draft.height}
            />
          </FieldShell>
          <KolamDropdownSelect
            label="Satuan"
            onChange={value => {
              if (disabled) {
                return;
              }
              controller.onChangeContractDraft({ unitLabel: value || 'Cm' });
            }}
            options={KOLAM_LAYANAN_DIMENSION_UNIT_OPTIONS.map(option => ({
              label: option.label,
              value: option.id,
            }))}
            value={draft.unitLabel}
          />
        </View>
        {volumeM3 != null && volumeM3 > 0 ? (
          <Text style={styles.metaText}>
            Volume:{' '}
            <Text style={styles.primaryText}>{volumeM3.toFixed(2)} m³</Text>
            {voucher.quantity != null && voucher.quantity > 0
              ? ` · qty faktur: ${voucher.quantity} m³`
              : ''}
          </Text>
        ) : null}
      </View>

      {controller.canMutateSale && !disabled ? (
        <KolamButton
          disabled={controller.saving}
          intent="primary"
          label={controller.saving ? 'Menyimpan…' : 'Simpan ukuran kontrak'}
          onPress={() => {
            void controller.onSaveContractDimensions();
          }}
        />
      ) : null}
    </FormSection>
  );
}

function VoucherSubscriptionSection({
  controller,
  onRouteChange,
}: {
  controller: KolamLayananVoucherController;
  onRouteChange?: (route: string) => void;
}) {
  const subscription = controller.subscription;

  if (!subscription) {
    return (
      <FormSection title="Langganan">
        <Text style={styles.metaText}>
          Belum ada dokumen langganan untuk voucher ini. Klik sync untuk
          membuat/memperbarui dari data voucher.
        </Text>
        <KolamButton
          disabled={controller.syncingSubscription}
          label={
            controller.syncingSubscription
              ? 'Menyinkron…'
              : 'Buat / sync langganan'
          }
          onPress={() => {
            void controller.onSyncSubscription();
          }}
        />
      </FormSection>
    );
  }

  return (
    <FormSection title="Langganan">
      <View style={styles.summaryGrid}>
        <DetailField label="Nomor">
          <Pressable
            accessibilityRole="link"
            onPress={() =>
              onRouteChange?.(
                `${KOLAM_LAYANAN_ROOT}/langganan/${subscription.id}`,
              )
            }
          >
            <Text style={[styles.linkText, styles.monoText]}>
              {subscription.subscriptionNumber || subscription.id}
            </Text>
          </Pressable>
        </DetailField>
        <DetailField label="Status">
          <KolamStatusBadge
            intent={getKolamLayananSubscriptionStatusIntent(
              subscription.status,
            )}
            label={getKolamLayananSubscriptionStatusLabel(subscription.status)}
          />
        </DetailField>
        <DetailField label="Periode">
          <Text style={styles.summaryValue}>
            {formatDate(subscription.startDate) || '—'} –{' '}
            {formatDate(subscription.endDate) || '—'}
          </Text>
        </DetailField>
        <DetailField label="Perpanjangan otomatis">
          <Text style={styles.summaryValue}>
            {subscription.autoRenew ? 'Ya' : 'Tidak'}
          </Text>
        </DetailField>
      </View>

      <View style={styles.transportBlock}>
        <Text style={styles.primaryText}>
          Transport default (HPP kunjungan)
        </Text>
        <Text style={styles.metaText}>
          Dipakai jika biaya transport per kunjungan belum diisi manual.
        </Text>
        <View style={styles.actionRow}>
          <FieldShell label="Transport default">
            <KolamFormTextField
              mode="numeric"
              onChangeText={value =>
                controller.onChangeTransportDraft(value.replace(/[^\d]/g, ''))
              }
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={controller.transportDraft}
            />
          </FieldShell>
          <KolamSaveButton
            disabled={controller.saving}
            onPress={() => {
              void controller.onSaveTransport();
            }}
          />
          <Text style={styles.metaText}>
            {formatKolamLayananIdr(
              Number(controller.transportDraft.replace(/[^\d]/g, '')) || 0,
            )}
          </Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <KolamButton
          disabled={controller.syncingSubscription}
          label={
            controller.syncingSubscription
              ? 'Menyinkron…'
              : 'Sync ulang dari voucher'
          }
          onPress={() => {
            void controller.onSyncSubscription();
          }}
        />
        {subscription.status === 'active' ? (
          <KolamButton
            disabled={controller.saving}
            label="Buka jadwal kunjungan"
            onPress={() => {
              void controller.onSpawnVisits();
            }}
          />
        ) : null}
      </View>
    </FormSection>
  );
}

function VoucherCustomerReadinessSection({
  controller,
}: {
  controller: KolamLayananVoucherController;
}) {
  const terms = controller.terms;
  const schedule = controller.schedule;
  const voucher = controller.voucher;
  const termsRequired = terms?.required === true;
  const termsAccepted = !termsRequired || terms?.allAccepted === true;
  const needsSchedule = schedule?.requiresScheduleFlow === true;
  const scheduleReady =
    !needsSchedule || schedule?.status === 'schedule_approved';
  const picReady = !needsSchedule || Boolean(schedule?.visitAssignedTo);
  const missingPicAfterApprove =
    needsSchedule &&
    schedule?.status === 'schedule_approved' &&
    !schedule?.visitAssignedTo;
  const customerReady = termsAccepted && scheduleReady && picReady;
  const customerName =
    voucher?.customerName && voucher.customerName !== '—'
      ? voucher.customerName
      : null;

  return (
    <FormSection title="Aktivasi pelanggan">
      <KolamStatusBadge
        intent={customerReady ? 'success' : 'warning'}
        label={customerReady ? 'Siap aktivasi' : 'Menunggu pelanggan'}
      />
      {customerName ? (
        <Text style={styles.metaText}>
          Pelanggan: <Text style={styles.primaryText}>{customerName}</Text>
        </Text>
      ) : null}
      <Text style={styles.metaText}>
        Persetujuan S&amp;K, jadwal, dan pemilihan kandang dilakukan di
        dashboard pelanggan. Halaman ini hanya menampilkan status.
      </Text>

      <View style={styles.readinessBlock}>
        <View style={styles.stripRow}>
          <Text style={styles.primaryText}>Syarat &amp; ketentuan</Text>
          <KolamStatusBadge
            intent={termsAccepted ? 'success' : 'secondary'}
            label={
              termsRequired
                ? termsAccepted
                  ? 'Disetujui pelanggan'
                  : 'Belum disetujui'
                : 'Tidak wajib'
            }
          />
        </View>
        {termsRequired && terms?.templates.length ? (
          <View style={styles.infoBox}>
            {terms.templates.map(template => (
              <View key={template.termsTemplateId} style={styles.stripRow}>
                <Text style={styles.summaryValue}>
                  {template.title || 'Syarat & ketentuan'} · v{template.version}
                </Text>
                <KolamStatusBadge
                  intent={template.accepted ? 'success' : 'secondary'}
                  label={template.accepted ? 'Disetujui' : 'Belum'}
                />
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.metaText}>
            {termsRequired
              ? 'Belum ada template S&K terhubung.'
              : 'Paket ini tidak mewajibkan persetujuan S&K.'}
          </Text>
        )}
      </View>

      {needsSchedule ? (
        <View style={styles.readinessBlock}>
          <View style={styles.stripRow}>
            <Text style={styles.primaryText}>Jadwal kunjungan</Text>
            <KolamStatusBadge
              intent={scheduleReady ? 'success' : 'secondary'}
              label={getKolamLayananScheduleStatusLabel(
                schedule?.status ?? 'pending',
              )}
            />
          </View>
          {schedule?.proposedVisitSlots.length ? (
            <View style={styles.infoBox}>
              {schedule.proposedVisitSlots.map((slot, index) => (
                <Text
                  key={`${slot.weekday}-${slot.time}-${index}`}
                  style={styles.metaText}
                >
                  {getKolamLayananWeekdayLabel(slot.weekday)} · {slot.time}
                  {schedule.scheduleProposedBy === 'client'
                    ? ' (dari pelanggan)'
                    : schedule.scheduleProposedBy === 'staff'
                      ? ' (dari staff)'
                      : ''}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.metaText}>Belum ada jadwal diajukan.</Text>
          )}
          {schedule?.visitAssignedToDisplayName ? (
            <Text style={styles.metaText}>
              PIC:{' '}
              <Text style={styles.primaryText}>
                {schedule.visitAssignedToDisplayName}
              </Text>
            </Text>
          ) : missingPicAfterApprove ? (
            <Text style={styles.warnText}>
              Jadwal disetujui — PIC kunjungan belum ditetapkan. Tentukan di
              kartu Jadwal kunjungan voucher.
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.stripRow, styles.readinessFooter]}>
        <Text style={styles.primaryText}>Status aktivasi</Text>
        <KolamStatusBadge
          intent={customerReady ? 'success' : 'warning'}
          label={
            customerReady
              ? 'Menunggu pelanggan memilih kandang & aktivasi'
              : 'Pelanggan belum menyelesaikan persyaratan'
          }
        />
      </View>
    </FormSection>
  );
}

function VoucherStaffActivateSection({
  controller,
}: {
  controller: KolamLayananVoucherController;
}) {
  const voucher = controller.voucher;
  const terms = controller.terms;
  const schedule = controller.schedule;
  if (!voucher || voucher.initiated || voucher.status === 'cancelled') {
    return null;
  }

  const customerId =
    voucher.customerId || terms?.customerId || controller.subscription?.customerId;
  const customerName =
    voucher.customerName && voucher.customerName !== '—'
      ? voucher.customerName
      : null;
  const termsRequired = terms?.required === true;
  const termsAccepted = !termsRequired || terms?.allAccepted === true;
  const needsSchedule = schedule?.requiresScheduleFlow === true;
  const scheduleApproved =
    !needsSchedule || schedule?.status === 'schedule_approved';
  const picReady = !needsSchedule || Boolean(schedule?.visitAssignedTo);
  const missingPicAfterApprove =
    needsSchedule &&
    schedule?.status === 'schedule_approved' &&
    !schedule?.visitAssignedTo;
  const activationReady = scheduleApproved && picReady;
  const canActivate =
    Boolean(customerId) &&
    Boolean(controller.activateEnclosureId) &&
    activationReady &&
    (!termsRequired || termsAccepted);

  return (
    <FormSection title="Aktivasi atas nama pelanggan">
      {!customerId ? (
        <Text style={styles.warnText}>
          Pelanggan belum teridentifikasi dari penjualan/langganan. Pastikan
          faktur terhubung ke pelanggan.
        </Text>
      ) : (
        <Text style={styles.metaText}>
          Pelanggan:{' '}
          <Text style={styles.primaryText}>{customerName ?? '—'}</Text>
        </Text>
      )}

      {termsRequired ? (
        <View style={styles.infoBox}>
          <Text style={styles.primaryText}>Syarat &amp; ketentuan layanan</Text>
          {termsAccepted ? (
            <Text style={styles.metaText}>
              Syarat &amp; ketentuan sudah disetujui.
            </Text>
          ) : (
            <>
              <Text style={styles.metaText}>
                Gunakan kartu Syarat &amp; ketentuan di atas untuk menyimpan
                persetujuan staff atas nama pelanggan, lalu aktivasi di sini.
              </Text>
              <KolamStatusBadge intent="warning" label="Belum disetujui" />
            </>
          )}
        </View>
      ) : null}

      {missingPicAfterApprove ? (
        <Text style={styles.warnText}>
          Jadwal sudah disetujui, tetapi PIC kunjungan belum ditetapkan. Gunakan
          kartu Jadwal kunjungan voucher untuk memilih staff PIC.
        </Text>
      ) : null}

      {needsSchedule &&
      scheduleApproved &&
      picReady &&
      schedule?.visitAssignedToDisplayName ? (
        <Text style={styles.metaText}>
          PIC kunjungan:{' '}
          <Text style={styles.primaryText}>
            {schedule.visitAssignedToDisplayName}
          </Text>
        </Text>
      ) : null}

      <Text style={styles.primaryText}>Kandang pelanggan</Text>
      {!customerId ? null : controller.enclosureOptions.length === 0 ? (
        <Text style={styles.metaText}>
          Belum ada kandang terhubung pelanggan untuk akun ini.
        </Text>
      ) : (
        <KolamDropdownSelect
          label="Pilih kandang"
          onChange={controller.onChangeActivateEnclosureId}
          options={[
            { label: 'Pilih kandang', value: '' },
            ...controller.enclosureOptions.map(option => ({
              label: option.label,
              value: option.id,
            })),
          ]}
          value={controller.activateEnclosureId}
        />
      )}

      <KolamButton
        disabled={controller.saving || !canActivate}
        intent="primary"
        label="Aktivasi voucher"
        onPress={() => {
          void controller.onStaffInitiate();
        }}
      />
    </FormSection>
  );
}

function VoucherAuditSection({
  controller,
}: {
  controller: KolamLayananVoucherController;
}) {
  if (!controller.canViewSale) {
    return (
      <FormSection title="Riwayat audit">
        <Text style={styles.metaText}>
          Tidak ada izin view penjualan (sale) untuk memuat audit voucher.
        </Text>
      </FormSection>
    );
  }

  return (
    <FormSection
      description="Perubahan voucher, jadwal, material, dan aktivitas kunjungan (append-only)."
      title="Riwayat audit"
    >
      {controller.auditSource === 'immutable' &&
      controller.auditEntries.length ? (
        <KolamStatusBadge intent="secondary" label="Audit immutable" />
      ) : null}
      {controller.auditEntries.length === 0 ? (
        <Text style={styles.metaText}>Belum ada aktivitas tercatat.</Text>
      ) : (
        controller.auditEntries.map(entry => (
          <View key={entry.id} style={styles.auditRow}>
            <Text style={styles.primaryText}>
              {getKolamLayananVoucherAuditActionLabel(entry.action)}
            </Text>
            <Text style={styles.metaText}>
              {entry.changedAt
                ? new Date(entry.changedAt).toLocaleString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '—'}{' '}
              · {entry.changedByName}
            </Text>
            {entry.note ? (
              <Text style={styles.metaText}>{entry.note}</Text>
            ) : null}
            {entry.metadataSummary ? (
              <Text style={styles.metaText}>{entry.metadataSummary}</Text>
            ) : null}
          </View>
        ))
      )}
    </FormSection>
  );
}

function VoucherScheduleSection({
  controller,
}: {
  controller: KolamLayananVoucherController;
}) {
  const schedule = controller.schedule;
  if (!controller.canViewSale) {
    return (
      <FormSection title="Jadwal kunjungan">
        <Text style={styles.metaText}>
          Tidak ada izin view penjualan (sale) untuk memuat jadwal voucher.
        </Text>
      </FormSection>
    );
  }
  if (!schedule) {
    return (
      <FormSection title="Jadwal kunjungan">
        <Text style={styles.metaText}>
          {controller.loading
            ? 'Memuat persyaratan jadwal…'
            : 'Persyaratan jadwal tidak tersedia untuk voucher ini.'}
        </Text>
      </FormSection>
    );
  }
  if (!schedule.requiresScheduleFlow) {
    return (
      <FormSection title="Jadwal kunjungan">
        <Text style={styles.metaText}>
          Paket ini tidak membutuhkan alur penjadwalan kunjungan.
        </Text>
      </FormSection>
    );
  }

  const status = schedule.status;
  const canEditSchedule =
    controller.canMutateSale &&
    (status === 'pending' ||
      status === 'awaiting_client_approval' ||
      status === 'awaiting_staff_approval');
  const missingPicAfterApprove =
    status === 'schedule_approved' && !schedule.visitAssignedTo;
  const needsPicInput =
    controller.canMutateSale &&
    (status === 'awaiting_staff_approval' ||
      status === 'pending' ||
      status === 'awaiting_client_approval' ||
      missingPicAfterApprove);

  return (
    <FormSection
      description="Mutasi memakai izin sale/update (sama BE pending-services)."
      title="Jadwal kunjungan"
    >
      <View style={styles.stripRow}>
        <KolamStatusBadge
          intent="secondary"
          label={getKolamLayananScheduleStatusLabel(status)}
        />
        <Text style={styles.metaText}>
          {schedule.visitsPerWeek ?? 1} kunjungan / minggu
        </Text>
      </View>

      {schedule.proposedVisitSlots.length ? (
        <View style={styles.infoBox}>
          <Text style={styles.primaryText}>Jadwal diajukan</Text>
          {schedule.proposedVisitSlots.map((slot, index) => (
            <Text key={`${slot.weekday}-${slot.time}-${index}`} style={styles.metaText}>
              {getKolamLayananWeekdayLabel(slot.weekday)} · {slot.time}
              {schedule.scheduleProposedBy === 'client'
                ? ' (pelanggan)'
                : schedule.scheduleProposedBy === 'staff'
                  ? ' (staff)'
                  : ''}
            </Text>
          ))}
        </View>
      ) : null}

      {status === 'schedule_approved' && schedule.visitAssignedToDisplayName ? (
        <View style={styles.infoBox}>
          <Text style={styles.primaryText}>PIC kunjungan</Text>
          <Text style={styles.metaText}>
            {schedule.visitAssignedToDisplayName}
          </Text>
        </View>
      ) : null}

      {missingPicAfterApprove ? (
        <Text style={styles.warnText}>
          Jadwal sudah disetujui, tetapi PIC belum ditetapkan.
        </Text>
      ) : null}

      {canEditSchedule
        ? controller.scheduleDraftSlots.map((slot, index) => (
            <View key={`draft-${index}`} style={styles.slotRow}>
              <KolamDropdownSelect
                label={`Hari #${index + 1}`}
                onChange={value =>
                  controller.onChangeScheduleSlot(index, {
                    weekday: Number(value),
                  })
                }
                options={KOLAM_LAYANAN_WEEKDAY_OPTIONS.map(option => ({
                  label: option.label,
                  value: option.id,
                }))}
                value={
                  slot.weekday >= 0 && slot.weekday <= 6
                    ? String(slot.weekday)
                    : ''
                }
              />
              <FieldShell label="Jam (HH:mm)">
                <KolamFormTextField
                  onChangeText={value =>
                    controller.onChangeScheduleSlot(index, { time: value })
                  }
                  placeholder="09:00"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={slot.time}
                />
              </FieldShell>
            </View>
          ))
        : null}

      {needsPicInput ? (
        <KolamDropdownSelect
          label="PIC kunjungan"
          onChange={controller.onChangePicId}
          options={[
            { label: 'Pilih PIC', value: '' },
            ...controller.staffOptions.map(staff => ({
              label: staff.displayName,
              value: staff.id,
            })),
          ]}
          value={controller.picId}
        />
      ) : null}

      {controller.canMutateSale ? (
        <View style={styles.actionRow}>
          {canEditSchedule ? (
            <KolamButton
              disabled={controller.saving}
              intent="primary"
              label="Ajukan jadwal"
              onPress={() => {
                void controller.onProposeSchedule();
              }}
            />
          ) : null}
          {status === 'awaiting_staff_approval' ? (
            <>
              <KolamButton
                disabled={controller.saving}
                intent="primary"
                label="Setujui jadwal"
                onPress={() => {
                  void controller.onApproveSchedule();
                }}
              />
              <KolamButton
                disabled={controller.saving}
                label="Tolak"
                onPress={() => {
                  void controller.onRejectSchedule();
                }}
              />
            </>
          ) : null}
          {missingPicAfterApprove ? (
            <KolamButton
              disabled={controller.saving}
              intent="primary"
              label="Tetapkan PIC"
              onPress={() => {
                void controller.onAssignPic();
              }}
            />
          ) : null}
        </View>
      ) : null}
    </FormSection>
  );
}

function VoucherTermsSection({
  controller,
}: {
  controller: KolamLayananVoucherController;
}) {
  const terms = controller.terms;
  if (!controller.canViewSale) {
    return (
      <FormSection title="Syarat & ketentuan">
        <Text style={styles.metaText}>
          Tidak ada izin view penjualan (sale) untuk memuat T&amp;C.
        </Text>
      </FormSection>
    );
  }
  if (!terms) {
    return (
      <FormSection title="Syarat & ketentuan">
        <Text style={styles.metaText}>
          {controller.loading
            ? 'Memuat syarat & ketentuan…'
            : 'Konteks T&C tidak tersedia.'}
        </Text>
      </FormSection>
    );
  }
  if (!terms.required) {
    return (
      <FormSection title="Syarat & ketentuan">
        <KolamStatusBadge intent="secondary" label="Tidak wajib" />
      </FormSection>
    );
  }

  const accepted = terms.allAccepted;

  return (
    <FormSection
      description="Persetujuan staff atas nama pelanggan — endpoint sale/update."
      title="Syarat & ketentuan"
    >
      <KolamStatusBadge
        intent={accepted ? 'success' : 'warning'}
        label={accepted ? 'Sudah disetujui' : 'Belum disetujui'}
      />
      {terms.templates.map(template => (
        <View key={template.termsTemplateId} style={styles.termsBlock}>
          <Text style={styles.primaryText}>
            {template.title} · v{template.version}
          </Text>
          {containsHtmlMarkup(template.content) ? (
            <KolamHtmlContent html={template.content} style={styles.html} />
          ) : (
            <Text style={styles.metaText}>
              {template.content || '—'}
            </Text>
          )}
        </View>
      ))}
      {!accepted && controller.canMutateSale ? (
        <>
          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Text style={styles.primaryText}>
                Setuju atas nama pelanggan di lokasi
              </Text>
            </View>
            <KolamSwitch
              active={controller.termsAgreed}
              onPress={() =>
                controller.onSetTermsAgreed(!controller.termsAgreed)
              }
            />
          </View>
          <KolamButton
            disabled={controller.saving || !controller.termsAgreed}
            intent="primary"
            label="Simpan persetujuan"
            onPress={() => {
              void controller.onAcceptTerms();
            }}
          />
        </>
      ) : null}
    </FormSection>
  );
}

function VoucherMaterialsSection({
  controller,
}: {
  controller: KolamLayananVoucherController;
}) {
  const voucher = controller.voucher;
  const disabled =
    !controller.canMutateSale ||
    voucher?.status === 'cancelled' ||
    voucher?.status === 'initiated';
  const hasHppPending = controller.materialLines.some(
    line => line.chargeMode === 'hpp_voucher' && !line.stockFulfilledAt,
  );

  return (
    <FormSection
      description="Tagih pelanggan → revisi faktur. HPP voucher → stok keluar + debit dompet DA. Punya sendiri → catatan opsional tanpa SKU wajib."
      title="Material tambahan (perjanjian manual)"
    >
      {hasHppPending ? (
        <KolamStatusBadge intent="danger" label="Stok HPP belum diproses" />
      ) : null}

      {controller.materialLines.length === 0 ? (
        <Text style={styles.metaText}>Belum ada baris material.</Text>
      ) : null}

      {controller.materialLines.map(line => (
        <MaterialLineEditor
          disabled={disabled}
          key={line.key}
          line={line}
          onChange={patch => controller.onChangeMaterialLine(line.key, patch)}
          onRemove={() => controller.onRemoveMaterialLine(line.key)}
        />
      ))}

      {!disabled ? (
        <View style={styles.actionRow}>
          <KolamButton
            label="Tambah baris"
            onPress={controller.onAddMaterialLine}
          />
          <KolamButton
            disabled={controller.saving}
            intent="primary"
            label="Simpan material"
            onPress={() => {
              void controller.onSaveMaterials();
            }}
          />
          {hasHppPending ? (
            <KolamButton
              disabled={controller.saving}
              label="Proses stok HPP"
              onPress={() => {
                void controller.onFulfillHppStock();
              }}
            />
          ) : null}
        </View>
      ) : null}
    </FormSection>
  );
}

function MaterialLineEditor({
  disabled,
  line,
  onChange,
  onRemove,
}: {
  disabled: boolean;
  line: KolamLayananVoucherMaterialLine;
  onChange: (patch: Partial<KolamLayananVoucherMaterialLine>) => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.materialCard}>
      <Text style={styles.metaText}>
        {getKolamLayananMaterialChargeLabel(line.chargeMode)}
        {line.stockFulfilledAt ? ' · stok OK' : ''}
      </Text>
      <FieldShell label="Nama">
        <KolamFormTextField
          editable={!disabled}
          onChangeText={value => onChange({ productName: value })}
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={line.productName}
        />
      </FieldShell>
      {line.chargeMode !== 'client_own' ? (
        <FieldShell label="ID produk katalog">
          <KolamFormTextField
            editable={!disabled}
            onChangeText={value => onChange({ productId: value })}
            placeholder="Mongo ObjectId produk/raw"
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={line.productId}
          />
        </FieldShell>
      ) : null}
      <FieldShell label="Qty / eksekusi">
        <KolamFormTextField
          editable={!disabled}
          mode="numeric"
          onChangeText={value => onChange({ quantity: value })}
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={line.quantity}
        />
      </FieldShell>
      <KolamDropdownSelect
        label="Jenis inventori"
        onChange={value => {
          if (disabled) {
            return;
          }
          onChange({
            inventoryKind: value === 'raw' ? 'raw' : 'product',
          });
        }}
        options={[
          { label: 'Bahan baku', value: 'raw' },
          { label: 'Produk jadi', value: 'product' },
        ]}
        value={line.inventoryKind}
      />
      <KolamDropdownSelect
        label="Mode tagihan"
        onChange={value => {
          if (disabled) {
            return;
          }
          onChange({
            chargeMode: value as KolamLayananVoucherMaterialLine['chargeMode'],
          });
        }}
        options={KOLAM_LAYANAN_MATERIAL_CHARGE_OPTIONS.map(option => ({
          label: option.label,
          value: option.id,
        }))}
        value={line.chargeMode}
      />
      {line.chargeMode === 'client' ? (
        <FieldShell label="Harga satuan">
          <KolamFormTextField
            editable={!disabled}
            mode="numeric"
            onChangeText={value => onChange({ unitPrice: value })}
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={line.unitPrice}
          />
        </FieldShell>
      ) : null}
      {!disabled ? (
        <KolamButton label="Hapus baris" onPress={onRemove} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 8,
  },
  content: {
    alignItems: 'stretch',
    gap: 12,
    paddingBottom: 32,
  },
  detailColumns: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailMain: {
    flexBasis: 420,
    flexGrow: 2,
    gap: 12,
    minWidth: 280,
  },
  detailSide: {
    flexBasis: 300,
    flexGrow: 1,
    gap: 12,
    minWidth: 260,
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailField: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: 4,
    minWidth: 140,
  },
  detailFieldLabel: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  detailFieldValue: {
    minWidth: 0,
  },
  summaryValue: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  monoText: {
    fontFamily: 'Consolas',
  },
  emptyValue: {
    color: V.colors.mutedFg,
    fontSize: 13,
  },
  linkText: {
    color: V.colors.primary,
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  dimBlock: {
    gap: 4,
  },
  calculatorBox: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: 8,
    padding: 10,
  },
  calculatorTitle: {
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dimRow: {
    gap: 8,
  },
  transportBlock: {
    gap: 8,
  },
  readinessBlock: {
    gap: 8,
  },
  readinessFooter: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  auditRow: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 10,
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
  warnText: {
    color: V.colors.warning,
    fontSize: 12,
    lineHeight: 18,
  },
  infoBox: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 10,
  },
  slotRow: {
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  termsBlock: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 10,
  },
  html: {
    maxHeight: 180,
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
  materialCard: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 10,
  },
});
