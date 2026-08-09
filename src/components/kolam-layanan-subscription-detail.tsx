import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  getKolamLayananSubscriptionStatusIntent,
  getKolamLayananSubscriptionStatusLabel,
  KOLAM_LAYANAN_ROOT,
  KOLAM_LAYANAN_SUBSCRIPTION_STATUS_OPTIONS,
} from '../domain/kolam-layanan';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { useKolamLayananSubscriptionController } from '../hooks/use-kolam-layanan-subscription-controller';
import { KolamButton } from './kolam-button';
import {KolamSaveButton} from './kolam-save-button';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDetailScrollSurface } from './kolam-detail-scroll-surface';
import {
  KolamDetailMetaStrip,
  KolamDetailMetaStripItem,
  kolamDetailMetaStripStyles,
} from './kolam-detail-meta-strip';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamPdfDownloadButton } from './kolam-pdf-download-button';
import { KolamRupiahField } from './kolam-rupiah-field';
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
  trailing,
}: {
  children: React.ReactNode;
  description?: string;
  title: string;
  trailing?: React.ReactNode;
}) {
  return (
    <KolamContentFrame variant="nativeFormSection">
      <View style={styles.sectionHeader}>
        <KolamCopyStack
          containerStyle={styles.sectionCopy}
          items={[
            { id: 'title', text: title, style: styles.sectionTitle },
            ...(description
              ? [
                  {
                    id: 'description',
                    text: description,
                    style: styles.metaText,
                  },
                ]
              : []),
          ]}
        />
        {trailing}
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </KolamContentFrame>
  );
}

/** FE DetailField: label atas, value bawah — tanpa DescriptionList. */
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
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function KolamLayananSubscriptionDetail({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamLayananSubscriptionController(route);
  const subscription = controller.subscription;
  const form = controller.contractForm;
  const visitPreview = controller.visitPreview;

  return (
    <View style={styles.surface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters} />
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              label="Daftar langganan"
              onPress={() =>
                onRouteChange?.(`${KOLAM_LAYANAN_ROOT}?tab=langganan`)
              }
            />
            {subscription?.saleId ? (
              <KolamPdfDownloadButton
                disabled={controller.downloadingInvoice}
                intent="outline"
                label="Unduh faktur"
                loading={controller.downloadingInvoice}
                loadingLabel="Mengunduh…"
                onPress={() => {
                  void controller.onDownloadInvoice();
                }}
              />
            ) : null}
            {subscription?.voucherId ? (
              <KolamButton
                disabled={controller.syncing}
                intent="outline"
                label={
                  controller.syncing ? 'Menyinkron…' : 'Sinkron dari voucher'
                }
                onPress={() => {
                  void controller.onSyncFromVoucher();
                }}
              />
            ) : null}
            <KolamSaveButton
              disabled={controller.saving || !subscription}
              label={controller.saving ? 'Menyimpan…' : 'Simpan'}
              onPress={() => {
                void controller.onSaveContract();
              }}
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

      {controller.loading && !subscription ? (
        <KolamEmptyState message="Memuat detail langganan…" title="Memuat" />
      ) : !subscription ? (
        <KolamEmptyState
          message="Langganan tidak ditemukan."
          title="Tidak ada data"
        />
      ) : (
        <KolamDetailScrollSurface contentContainerStyle={styles.content}>
          <KolamDetailMetaStrip>
            <KolamDetailMetaStripItem label="Status">
              <KolamStatusBadge
                intent={getKolamLayananSubscriptionStatusIntent(
                  subscription.status,
                )}
                label={getKolamLayananSubscriptionStatusLabel(
                  subscription.status,
                )}
              />
            </KolamDetailMetaStripItem>
            <KolamDetailMetaStripItem label="Pelanggan">
              <Text style={kolamDetailMetaStripStyles.stripValue}>
                {subscription.customerName || '—'}
              </Text>
            </KolamDetailMetaStripItem>
            <KolamDetailMetaStripItem label="Periode">
              <Text
                style={[kolamDetailMetaStripStyles.stripValue, styles.tabular]}
              >
                {formatDate(subscription.startDate)} –{' '}
                {formatDate(subscription.endDate)}
              </Text>
            </KolamDetailMetaStripItem>
            <KolamDetailMetaStripItem label="Perpanjang otomatis">
              <KolamStatusBadge
                intent={subscription.autoRenew ? 'success' : 'secondary'}
                label={subscription.autoRenew ? 'Ya' : 'Tidak'}
              />
            </KolamDetailMetaStripItem>
          </KolamDetailMetaStrip>

          <View style={styles.detailColumns}>
            <View style={styles.detailMain}>
              <FormSection title="Ringkasan langganan">
                <View style={styles.summaryGrid}>
                  <DetailField label="Paket">
                    {subscription.serviceName &&
                    subscription.serviceName !== '—' ? (
                      <Text style={styles.summaryValue}>
                        {subscription.serviceName}
                        {subscription.packageCode &&
                        subscription.packageCode !== '—' ? (
                          <Text style={styles.summaryMono}>
                            {' '}
                            ({subscription.packageCode})
                          </Text>
                        ) : null}
                      </Text>
                    ) : (
                      <Text style={styles.emptyValue}>Belum diisi</Text>
                    )}
                  </DetailField>
                  <DetailField label="Voucher">
                    {subscription.voucherId ? (
                      <Pressable
                        accessibilityRole="link"
                        onPress={() =>
                          onRouteChange?.(
                            `${KOLAM_LAYANAN_ROOT}/voucher/${subscription.voucherId}`,
                          )
                        }
                      >
                        <Text style={styles.linkText}>
                          {subscription.voucherSerial &&
                          subscription.voucherSerial !== '—'
                            ? subscription.voucherSerial
                            : 'Buka voucher'}
                        </Text>
                      </Pressable>
                    ) : (
                      <Text style={styles.summaryValue}>
                        {subscription.voucherSerial &&
                        subscription.voucherSerial !== '—'
                          ? subscription.voucherSerial
                          : '—'}
                      </Text>
                    )}
                  </DetailField>
                  <DetailField label="Faktur">
                    {subscription.saleInvoiceCode ? (
                      <View style={styles.invoiceRow}>
                        <Text style={[styles.summaryValue, styles.tabular]}>
                          {subscription.saleInvoiceCode}
                        </Text>
                        {subscription.saleId ? (
                          <Pressable
                            accessibilityRole="link"
                            onPress={() =>
                              onRouteChange?.(`/sales/${subscription.saleId}`)
                            }
                          >
                            <Text style={styles.linkText}>Lihat penjualan</Text>
                          </Pressable>
                        ) : null}
                      </View>
                    ) : (
                      <Text style={styles.emptyValue}>Belum diisi</Text>
                    )}
                  </DetailField>
                  <DetailField label="Template tugas">
                    <Text style={styles.summaryValue}>
                      {subscription.packageTasksCount} item
                    </Text>
                  </DetailField>
                </View>
              </FormSection>

              {controller.pendingVerifications.length ? (
                <FormSection
                  description="Pelanggan dapat mengonfirmasi lewat beranda marketplace atau tautan detail kunjungan."
                  title="Menunggu konfirmasi pelanggan"
                >
                  {controller.pendingVerifications.map(row => (
                    <Pressable
                      accessibilityRole="button"
                      disabled={!row.href}
                      key={`${row.taskId}-${row.executionId}`}
                      onPress={() => {
                        if (row.href) {
                          onRouteChange?.(row.href);
                        }
                      }}
                      style={styles.verifyRow}
                    >
                      <Text style={styles.summaryValue}>
                        {row.visitTitle || row.packageTaskCode || 'Kunjungan'}
                      </Text>
                      <Text style={styles.linkText}>
                        Buka · {formatDatetime(row.scheduledTime)}
                      </Text>
                    </Pressable>
                  ))}
                </FormSection>
              ) : null}

              {subscription.status === 'active' ? (
                <FormSection
                  description="Pratinjau slot yang akan dibuat di Kontrol Layanan (cron harian 00:15 WIB)."
                  title="Jadwal kunjungan"
                  trailing={
                    <KolamButton
                      disabled={controller.spawningVisits}
                      intent="outline"
                      label={
                        controller.spawningVisits
                          ? 'Membuat…'
                          : 'Buat jadwal sekarang'
                      }
                      onPress={() => {
                        void controller.onSpawnVisits();
                      }}
                      size="sm"
                    />
                  }
                >
                  {controller.visitsLoading ? (
                    <Text style={styles.metaText}>
                      Memuat pratinjau jadwal kunjungan…
                    </Text>
                  ) : controller.visitsError ? (
                    <Text style={styles.metaText}>
                      Gagal memuat jadwal: {controller.visitsError}
                    </Text>
                  ) : visitPreview.skipped ? (
                    <Text style={styles.metaText}>
                      Belum bisa pratinjau:{' '}
                      {visitPreview.reason || 'voucher atau tugas belum siap'}.
                    </Text>
                  ) : visitPreview.preview.length === 0 ? (
                    <Text style={styles.metaText}>
                      Tidak ada kunjungan dalam 14 hari ke depan. Periksa
                      template tugas paket atau klik buat jadwal.
                    </Text>
                  ) : (
                    <View style={styles.detailTable}>
                      <View style={styles.detailTableHeader}>
                        <Text style={[styles.detailTableHead, styles.colTask]}>
                          Tugas
                        </Text>
                        <Text style={[styles.detailTableHead, styles.colCode]}>
                          Kode
                        </Text>
                        <Text
                          style={[styles.detailTableHead, styles.colSchedule]}
                        >
                          Jadwal
                        </Text>
                        <Text
                          style={[styles.detailTableHead, styles.colDeadline]}
                        >
                          Deadline
                        </Text>
                      </View>
                      {visitPreview.preview.slice(0, 30).map((visit, index) => (
                        <View
                          key={`${visit.packageTaskCode}-${visit.scheduledTime}-${index}`}
                          style={styles.detailTableRow}
                        >
                          <Text
                            numberOfLines={2}
                            style={[styles.detailTableCell, styles.colTask]}
                          >
                            {visit.visitTitle}
                          </Text>
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.detailTableCell,
                              styles.colCode,
                              styles.tabular,
                            ]}
                          >
                            {visit.packageTaskCode || '—'}
                          </Text>
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.detailTableCell,
                              styles.colSchedule,
                              styles.metaText,
                            ]}
                          >
                            {formatDatetime(visit.scheduledTime)}
                          </Text>
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.detailTableCell,
                              styles.colDeadline,
                              styles.metaText,
                            ]}
                          >
                            {formatDatetime(visit.estimatedAt)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {!controller.visitsLoading &&
                  !controller.visitsError &&
                  visitPreview.taskId ? (
                    <Text style={styles.metaText}>
                      Tugas operasional: {visitPreview.taskType || '—'} ·{' '}
                      {visitPreview.taskId}
                      {visitPreview.ops != null
                        ? ` · terakhir dibuat: ${visitPreview.ops} slot`
                        : ''}
                    </Text>
                  ) : null}
                </FormSection>
              ) : (
                <FormSection title="Jadwal kunjungan">
                  <Text style={styles.metaText}>
                    Jadwal otomatis aktif setelah status langganan Aktif dan
                    voucher sudah diaktivasi di Enclonura.
                  </Text>
                </FormSection>
              )}
            </View>

            <View style={styles.detailSide}>
              <FormSection
                description="Ubah status dan periode langganan. Pelanggan tetap dari penjualan/voucher."
                title="Kontrak"
              >
                <FieldShell label="Status">
                  <KolamDropdownSelect
                    accessibilityLabel="Status"
                    label="Status"
                    onChange={value =>
                      controller.onChangeContractForm({ status: value })
                    }
                    options={KOLAM_LAYANAN_SUBSCRIPTION_STATUS_OPTIONS.map(
                      option => ({
                        label: option.label,
                        value: option.id,
                      }),
                    )}
                    value={String(form.status)}
                  />
                </FieldShell>
                <View style={styles.dateRow}>
                  <View style={styles.dateField}>
                    <FieldShell label="Tanggal mulai">
                      <KolamFormTextField
                        onChangeText={value =>
                          controller.onChangeContractForm({ startDate: value })
                        }
                        placeholder="YYYY-MM-DD"
                        value={form.startDate}
                      />
                    </FieldShell>
                  </View>
                  <View style={styles.dateField}>
                    <FieldShell label="Tanggal berakhir">
                      <KolamFormTextField
                        onChangeText={value =>
                          controller.onChangeContractForm({ endDate: value })
                        }
                        placeholder="YYYY-MM-DD"
                        value={form.endDate}
                      />
                    </FieldShell>
                  </View>
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.summaryValue}>Perpanjangan otomatis</Text>
                  <KolamSwitch
                    accessibilityLabel="Perpanjangan otomatis"
                    active={form.autoRenew}
                    onPress={() =>
                      controller.onChangeContractForm({
                        autoRenew: !form.autoRenew,
                      })
                    }
                  />
                </View>
                <FieldShell label="Biaya transport default">
                  <KolamRupiahField
                    onChangeValue={value =>
                      controller.onChangeContractForm({
                        transportCostDefault: String(value),
                      })
                    }
                    value={Number(form.transportCostDefault) || 0}
                  />
                </FieldShell>
                <FieldShell label="Catatan">
                  <KolamFormTextField
                    multiline
                    onChangeText={value =>
                      controller.onChangeContractForm({ notes: value })
                    }
                    value={form.notes}
                  />
                </FieldShell>
              </FormSection>
            </View>
          </View>
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
    alignItems: 'stretch',
    gap: 12,
    paddingBottom: 24,
  },
  banner: {
    alignSelf: 'stretch',
    marginHorizontal: 4,
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
    minWidth: 320,
  },
  detailSide: {
    flexBasis: 280,
    flexGrow: 1,
    gap: 12,
    minWidth: 240,
  },
  sectionHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '700',
  },
  sectionBody: {
    gap: 10,
  },
  fieldLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
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
  summaryMono: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '500',
  },
  emptyValue: {
    color: V.colors.mutedFg,
    fontSize: 13,
  },
  invoiceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  linkText: {
    color: V.colors.primary,
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  tabular: {
    fontFamily: V.fontFamily,
    fontVariant: ['tabular-nums'],
  },
  verifyRow: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateField: {
    flexBasis: 140,
    flexGrow: 1,
    minWidth: 120,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  metaText: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  detailTable: {
    alignSelf: 'stretch',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 0,
    overflow: 'hidden',
    width: '100%',
  },
  detailTableHeader: {
    alignItems: 'center',
    backgroundColor: V.colors.tableHeader,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  detailTableRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  detailTableHead: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailTableCell: {
    color: V.colors.fg,
    fontSize: 12,
    minWidth: 0,
  },
  colTask: { flex: 1.3, minWidth: 0 },
  colCode: { flexGrow: 0, flexShrink: 0, width: 72 },
  colSchedule: { flex: 1, minWidth: 0 },
  colDeadline: { flex: 1, minWidth: 0 },
});
