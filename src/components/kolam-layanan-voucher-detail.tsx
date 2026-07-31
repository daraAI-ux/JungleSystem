import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  getKolamLayananMaterialChargeLabel,
  getKolamLayananPendingStatusLabel,
  getKolamLayananTaskTypeLabel,
  getKolamLayananWeekdayLabel,
  KOLAM_LAYANAN_MATERIAL_CHARGE_OPTIONS,
  KOLAM_LAYANAN_ROOT,
  KOLAM_LAYANAN_WEEKDAY_OPTIONS,
  type KolamLayananVoucherMaterialLine,
} from '../domain/kolam-layanan';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamLayananVoucherController,
  type KolamLayananVoucherController,
} from '../hooks/use-kolam-layanan-voucher-controller';
import { KolamButton } from './kolam-button';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDescriptionList } from './kolam-description-list';
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

function desc(id: string, label: string, value: string) {
  return { id, label, meta: '', tone: 'default' as const, value };
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
              disabled={controller.loading || controller.saving}
              label="Refresh"
              onPress={() => {
                void controller.onRefresh();
              }}
            />
            <KolamButton
              label="Daftar"
              onPress={() => onRouteChange?.(KOLAM_LAYANAN_ROOT)}
            />
            {voucher?.serviceId ? (
              <KolamButton
                label="Paket"
                onPress={() =>
                  onRouteChange?.(
                    `${KOLAM_LAYANAN_ROOT}/${voucher.serviceId}`,
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
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.stripRow}>
            <KolamStatusBadge
              intent={
                voucher.status === 'initiated'
                  ? 'success'
                  : voucher.status === 'pending'
                    ? 'secondary'
                    : 'warning'
              }
              label={getKolamLayananPendingStatusLabel(voucher.status)}
            />
            <KolamStatusBadge
              intent="info"
              label={getKolamLayananTaskTypeLabel(voucher.taskType)}
            />
          </View>

          <FormSection title="Informasi voucher">
            <KolamDescriptionList
              rows={[
                desc('serial', 'Serial', voucher.serviceSerial),
                desc('invoice', 'Faktur', voucher.invoiceCode),
                desc('service', 'Paket', voucher.serviceName),
                desc('package', 'Kode paket', voucher.packageCode),
                desc('customer', 'Pelanggan', voucher.customerName),
                desc(
                  'visits',
                  'Kunjungan / bulan',
                  voucher.visitsPerMonth != null
                    ? String(voucher.visitsPerMonth)
                    : '—',
                ),
                desc(
                  'contract',
                  'Durasi kontrak',
                  voucher.contractDurationValue != null
                    ? `${voucher.contractDurationValue} ${voucher.contractDurationUnit || ''}`
                    : '—',
                ),
                desc(
                  'pic',
                  'PIC',
                  voucher.visitAssignedToName || 'Belum ditetapkan',
                ),
              ]}
            />
          </FormSection>

          {voucher.initiated ? (
            <FormSection title="Voucher aktif">
              <Text style={styles.metaText}>
                Voucher sudah diinisiasi. Detail eksekusi kunjungan menyusul di
                batch berikutnya. Jadwal / T&amp;C / material di bawah bersifat
                arsip jika masih tersedia dari API.
              </Text>
            </FormSection>
          ) : null}

          <VoucherScheduleSection controller={controller} />
          <VoucherTermsSection controller={controller} />
          <VoucherMaterialsSection controller={controller} />
        </ScrollView>
      )}
    </View>
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
          label={getKolamLayananPendingStatusLabel(status)}
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
      description="Tagih pelanggan / HPP voucher / punya sendiri. Simpan memakai sale/update."
      title="Material tambahan"
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
