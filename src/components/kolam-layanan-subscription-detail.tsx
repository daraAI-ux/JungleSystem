import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  getKolamLayananSubscriptionStatusIntent,
  getKolamLayananSubscriptionStatusLabel,
  getKolamLayananTaskTypeLabel,
  KOLAM_LAYANAN_ROOT,
} from '../domain/kolam-layanan';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { formatRupiah } from '../lib/money';
import { useKolamLayananSubscriptionController } from '../hooks/use-kolam-layanan-subscription-controller';
import { KolamButton } from './kolam-button';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDescriptionList } from './kolam-description-list';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamStatusBadge } from './kolam-status-badge';
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
  const title = subscription?.subscriptionNumber || 'Detail langganan';

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
              label="Daftar"
              onPress={() =>
                onRouteChange?.(`${KOLAM_LAYANAN_ROOT}?tab=langganan`)
              }
            />
            {subscription?.saleId ? (
              <KolamButton
                disabled={controller.downloadingInvoice}
                intent="primary"
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
          <View style={styles.stripRow}>
            <KolamStatusBadge
              intent={getKolamLayananSubscriptionStatusIntent(
                subscription.status,
              )}
              label={getKolamLayananSubscriptionStatusLabel(
                subscription.status,
              )}
            />
            <KolamStatusBadge
              intent={subscription.autoRenew ? 'success' : 'secondary'}
              label={
                subscription.autoRenew
                  ? 'Perpanjang otomatis'
                  : 'Tanpa perpanjang'
              }
            />
            <KolamStatusBadge
              intent="info"
              label={getKolamLayananTaskTypeLabel(subscription.taskType)}
            />
          </View>

          <FormSection
            description="Batch 6 read-only — ubah kontrak menyusul."
            title="Ringkasan langganan"
          >
            <KolamDescriptionList
              rows={[
                desc('number', 'Nomor', subscription.subscriptionNumber),
                desc('customer', 'Pelanggan', subscription.customerName),
                desc(
                  'phone',
                  'Telepon',
                  subscription.customerPhone || '—',
                ),
                desc('service', 'Paket', subscription.serviceName),
                desc('package', 'Kode paket', subscription.packageCode),
                desc('voucher', 'Voucher', subscription.voucherSerial),
                desc(
                  'period',
                  'Periode',
                  `${formatDate(subscription.startDate)} – ${formatDate(subscription.endDate)}`,
                ),
                desc(
                  'transport',
                  'Transport default',
                  formatRupiah(subscription.transportCostDefault),
                ),
                desc(
                  'tasks',
                  'Template tugas',
                  `${subscription.packageTasksCount} item`,
                ),
                desc('notes', 'Catatan', subscription.notes || '—'),
              ]}
            />
          </FormSection>

          <FormSection
            description="Tautan modul terkait (baca saja)."
            title="Tautan silang"
          >
            {controller.crossLinks.map(link => (
              <Pressable
                accessibilityRole="button"
                disabled={!link.available || !link.route}
                key={link.id}
                onPress={() => {
                  if (link.route) {
                    onRouteChange?.(link.route);
                  }
                }}
                style={[
                  styles.linkRow,
                  !link.available ? styles.linkRowDisabled : null,
                ]}
              >
                <View style={styles.linkCopy}>
                  <Text style={styles.primaryText}>{link.label}</Text>
                  <Text style={styles.metaText}>{link.description}</Text>
                </View>
                <Text style={styles.linkAction}>
                  {link.available ? 'Buka' : 'Tidak ada'}
                </Text>
              </Pressable>
            ))}
          </FormSection>

          {controller.pendingVerifications.length ? (
            <FormSection
              description="Menunggu konfirmasi pelanggan."
              title="Konfirmasi kunjungan"
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
                      {formatDatetime(row.scheduledTime)}
                    </Text>
                  </View>
                  <Text style={styles.linkAction}>Buka</Text>
                </Pressable>
              ))}
            </FormSection>
          ) : null}

          {subscription.status === 'active' ? (
            <FormSection title="Jadwal kunjungan mendatang">
              {controller.upcomingVisits.length === 0 ? (
                <Text style={styles.metaText}>
                  Belum ada pratinjau jadwal, atau slot belum digenerate.
                </Text>
              ) : (
                controller.upcomingVisits.map((visit, index) => (
                  <View
                    key={`${visit.packageTaskCode}-${visit.scheduledTime}-${index}`}
                    style={styles.visitRow}
                  >
                    <Text style={styles.primaryText}>{visit.visitTitle}</Text>
                    <Text style={styles.metaText}>
                      {visit.packageTaskCode || '—'} ·{' '}
                      {formatDatetime(visit.scheduledTime)}
                    </Text>
                  </View>
                ))
              )}
            </FormSection>
          ) : null}
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
    gap: 10,
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
  linkRow: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  linkRowDisabled: {
    opacity: 0.55,
  },
  linkCopy: {
    flex: 1,
    gap: 2,
  },
  linkAction: {
    color: V.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  visitRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
    paddingVertical: 8,
  },
});
