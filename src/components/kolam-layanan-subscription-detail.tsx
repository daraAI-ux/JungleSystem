import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  getKolamLayananSubscriptionStatusIntent,
  getKolamLayananSubscriptionStatusLabel,
  KOLAM_LAYANAN_ROOT,
  KOLAM_LAYANAN_SUBSCRIPTION_STATUS_OPTIONS,
} from '../domain/kolam-layanan';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { useKolamLayananSubscriptionController } from '../hooks/use-kolam-layanan-subscription-controller';
import { KolamButton } from './kolam-button';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDescriptionList } from './kolam-description-list';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
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

function desc(id: string, label: string, value: string) {
  return { id, label, meta: '', tone: 'default' as const, value };
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
    year: 'numeric',
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
  const title = subscription?.subscriptionNumber || 'Langganan';
  const visitPreview = controller.visitPreview;

  const customerOptions = React.useMemo(
    () => [
      { label: '— Belum dipilih —', value: '' },
      ...controller.customers.map(customer => ({
        label: customer.phone
          ? `${customer.name} · ${customer.phone}`
          : customer.name,
        value: customer.id,
      })),
    ],
    [controller.customers],
  );

  const packageLabel = subscription
    ? [
        subscription.serviceName && subscription.serviceName !== '—'
          ? subscription.serviceName
          : null,
        subscription.packageCode && subscription.packageCode !== '—'
          ? `(${subscription.packageCode})`
          : null,
      ]
        .filter(Boolean)
        .join(' ') || 'Belum diisi'
    : 'Belum diisi';

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
              disabled={controller.loading}
              label="Refresh"
              onPress={() => {
                void controller.onRefresh();
              }}
            />
            <KolamButton
              label="Daftar langganan"
              onPress={() =>
                onRouteChange?.(`${KOLAM_LAYANAN_ROOT}?tab=langganan`)
              }
            />
            {subscription?.saleId ? (
              <KolamButton
                disabled={controller.downloadingInvoice}
                intent="outline"
                label={
                  controller.downloadingInvoice
                    ? 'Mengunduh…'
                    : 'Unduh faktur'
                }
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
            <KolamButton
              disabled={controller.saving || !subscription}
              intent="primary"
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
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.statusStrip}>
            <View style={styles.statusStripItem}>
              <Text style={styles.statusStripLabel}>Status</Text>
              <KolamStatusBadge
                intent={getKolamLayananSubscriptionStatusIntent(
                  subscription.status,
                )}
                label={getKolamLayananSubscriptionStatusLabel(
                  subscription.status,
                )}
              />
            </View>
            <View style={[styles.statusStripItem, styles.statusStripDivider]}>
              <Text style={styles.statusStripLabel}>Pelanggan</Text>
              <Text style={styles.statusStripValue}>
                {subscription.customerName || '—'}
              </Text>
            </View>
            <View style={styles.statusStripItem}>
              <Text style={styles.statusStripLabel}>Periode</Text>
              <Text style={styles.statusStripValue}>
                {formatDate(subscription.startDate)} –{' '}
                {formatDate(subscription.endDate)}
              </Text>
            </View>
            <View style={[styles.statusStripItem, styles.statusStripDivider]}>
              <Text style={styles.statusStripLabel}>Perpanjang otomatis</Text>
              <KolamStatusBadge
                intent={subscription.autoRenew ? 'success' : 'secondary'}
                label={subscription.autoRenew ? 'Ya' : 'Tidak'}
              />
            </View>
          </View>

          <View style={styles.detailColumns}>
            <View style={styles.detailMain}>
              <FormSection title="Ringkasan langganan">
                <KolamDescriptionList
                  rows={[
                    desc('package', 'Paket', packageLabel),
                    desc(
                      'voucher',
                      'Voucher',
                      subscription.voucherSerial || '—',
                    ),
                    desc(
                      'invoice',
                      'Faktur',
                      subscription.saleInvoiceCode || 'Belum diisi',
                    ),
                    desc(
                      'tasks',
                      'Template tugas',
                      `${subscription.packageTasksCount} item`,
                    ),
                  ]}
                />
                <View style={styles.inlineActions}>
                  {subscription.voucherId ? (
                    <KolamButton
                      intent="outline"
                      label="Buka voucher"
                      onPress={() =>
                        onRouteChange?.(
                          `${KOLAM_LAYANAN_ROOT}/voucher/${subscription.voucherId}`,
                        )
                      }
                      size="sm"
                    />
                  ) : null}
                  {subscription.saleId ? (
                    <KolamButton
                      intent="outline"
                      label="Lihat penjualan"
                      onPress={() =>
                        onRouteChange?.(`/sales/${subscription.saleId}`)
                      }
                      size="sm"
                    />
                  ) : null}
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
                      style={styles.linkRow}
                    >
                      <View style={styles.linkCopy}>
                        <Text style={styles.primaryText}>{row.visitTitle}</Text>
                        <Text style={styles.metaText}>
                          Buka · {formatDatetime(row.scheduledTime)}
                        </Text>
                      </View>
                      <Text style={styles.linkAction}>Buka</Text>
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
                  {visitPreview.skipped ? (
                    <Text style={styles.metaText}>
                      Belum bisa pratinjau:{' '}
                      {visitPreview.reason ||
                        'voucher atau tugas belum siap'}
                      .
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
                          <View style={[styles.colCode, styles.badgeCell]}>
                            <KolamStatusBadge
                              intent="secondary"
                              label={visit.packageTaskCode || '—'}
                            />
                          </View>
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
                  {visitPreview.taskId ? (
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
                description="Ubah status, pelanggan, dan periode langganan."
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
                <FieldShell label="Pelanggan (Kolam)">
                  <KolamDropdownSelect
                    accessibilityLabel="Pelanggan"
                    label={
                      controller.customersLoading
                        ? 'Memuat pelanggan…'
                        : 'Pilih pelanggan'
                    }
                    onChange={value =>
                      controller.onChangeContractForm({ customerId: value })
                    }
                    options={customerOptions}
                    searchable
                    value={form.customerId}
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
                  <Text style={styles.primaryText}>Perpanjangan otomatis</Text>
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
                <FieldShell label="Biaya transport default (Rp)">
                  <KolamFormTextField
                    mode="numeric"
                    onChangeText={value =>
                      controller.onChangeContractForm({
                        transportCostDefault: value.replace(/[^\d]/g, ''),
                      })
                    }
                    value={form.transportCostDefault}
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
        </ScrollView>
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
  statusStrip: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statusStripItem: {
    gap: 4,
    minWidth: 120,
  },
  statusStripDivider: {
    borderLeftColor: V.colors.border,
    borderLeftWidth: 1,
    paddingLeft: 12,
  },
  statusStripLabel: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  statusStripValue: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
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
    minWidth: 0,
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
    gap: 4,
    minWidth: 0,
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
  inlineActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    justifyContent: 'space-between',
    gap: 12,
  },
  linkRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  linkCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  linkAction: {
    color: V.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  primaryText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
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
  badgeCell: {
    justifyContent: 'center',
  },
  colTask: { flex: 1.3, minWidth: 0 },
  colCode: { flexGrow: 0, flexShrink: 0, width: 88 },
  colSchedule: { flex: 1, minWidth: 0 },
  colDeadline: { flex: 1, minWidth: 0 },
});
