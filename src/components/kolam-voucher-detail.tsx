import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  buildKolamVoucherEditRoute,
  formatKolamVoucherApplicableToLabel,
  formatKolamVoucherDateTime,
  formatKolamVoucherDiscountLabel,
  formatKolamVoucherPeriodLabel,
  formatKolamVoucherRemainingLabel,
  formatKolamVoucherStatusLabel,
  formatKolamVoucherUsageLabel,
  getKolamVoucherStatusIntent,
  KOLAM_VOUCHER_ROOT,
} from '../domain/kolam-voucher';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { formatRupiah } from '../lib/money';
import { copyTextToClipboard } from '../lib/native-clipboard';
import type { KolamVoucherController } from '../hooks/use-kolam-voucher-controller';
import { KolamButton } from './kolam-button';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamDetailScrollSurface } from './kolam-detail-scroll-surface';
import { KolamDescriptionList } from './kolam-description-list';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

export function KolamVoucherDetail({
  controller,
  onRouteChange,
}: {
  controller: KolamVoucherController;
  onRouteChange?: (route: string) => void;
}) {
  const voucher = controller.selectedVoucher;

  if (controller.loading && !voucher) {
    return (
      <KolamEmptyState message="Memuat detail voucher…" title="Memuat" />
    );
  }

  if (!voucher) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState
          message={controller.error || 'Voucher tidak ditemukan.'}
          title="Tidak tersedia"
        />
        <KolamButton
          label="Kembali ke daftar"
          onPress={() => onRouteChange?.(controller.onBackToList())}
        />
      </View>
    );
  }

  const remaining = formatKolamVoucherRemainingLabel(voucher);
  const totalDiscountGiven = controller.redemptions
    .filter(item => !item.cancelled)
    .reduce((sum, item) => sum + item.discountApplied, 0);

  return (
    <KolamDetailScrollSurface contentContainerStyle={styles.content}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={styles.titleBlock}>
            <Text numberOfLines={2} style={styles.title}>
              {voucher.title || voucher.code}
            </Text>
            <View style={styles.badgeRow}>
              <KolamStatusBadge
                intent={getKolamVoucherStatusIntent(voucher.status)}
                label={formatKolamVoucherStatusLabel(voucher.status)}
              />
              <KolamStatusBadge
                intent={remaining.intent}
                label={remaining.label}
              />
              {voucher.firstOrderOnly ? (
                <KolamStatusBadge intent="primary" label="Pesanan pertama saja" />
              ) : null}
            </View>
            <Text style={styles.code}>{voucher.code}</Text>
            {voucher.description ? (
              <Text style={styles.subtitle}>{voucher.description}</Text>
            ) : null}
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              intent="outline"
              label="Salin kode"
              onPress={() => {
                void copyTextToClipboard(voucher.code).then(() => {
                  /* soft feedback via statusMessage is optional; keep silent */
                });
              }}
            />
            <KolamButton
              intent="outline"
              label="Kembali"
              onPress={() => onRouteChange?.(KOLAM_VOUCHER_ROOT)}
            />
            {controller.canUpdate ? (
              <KolamButton
                label="Ubah"
                onPress={() => {
                  const next = controller.onEdit();
                  if (next) {
                    onRouteChange?.(next);
                  } else {
                    onRouteChange?.(buildKolamVoucherEditRoute(voucher.id));
                  }
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
          numberOfLines={3}
          style={styles.banner}
        />
      ) : null}
      {controller.statusMessage ? (
        <KolamStatusBadge
          intent="success"
          label={controller.statusMessage}
          numberOfLines={2}
          style={styles.banner}
        />
      ) : null}

      <View style={styles.metricRow}>
        <MetricCard
          label="Diskon"
          value={formatKolamVoucherDiscountLabel(voucher)}
          hint={
            voucher.discountType === 'percentage'
              ? voucher.maxDiscountAmount
                ? `Maks ${formatRupiah(voucher.maxDiscountAmount)}`
                : 'Tanpa batas'
              : undefined
          }
        />
        <MetricCard
          label="Min. Pembelian"
          value={
            voucher.minPurchaseAmount > 0
              ? formatRupiah(voucher.minPurchaseAmount)
              : '—'
          }
          hint={
            voucher.minPurchaseAmount > 0
              ? 'Subtotal minimum'
              : 'Tanpa minimum'
          }
        />
        <MetricCard
          label="Penggunaan"
          value={formatKolamVoucherUsageLabel(voucher)}
          hint={voucher.usageLimit ? 'Terhadap batas total' : 'Tanpa batas'}
        />
        <MetricCard
          label="Diskon diberikan"
          value={formatRupiah(totalDiscountGiven)}
          hint="Dari halaman redemption saat ini"
        />
      </View>

      <KolamContentFrame variant="nativeFormSection">
        <Text style={styles.sectionTitle}>Aturan Voucher</Text>
        <KolamDescriptionList
          accessibilityLabel="Aturan voucher"
          rows={[
            {
              id: 'period',
              label: 'Periode',
              meta: '',
              tone: 'default',
              value: formatKolamVoucherPeriodLabel(voucher),
            },
            {
              id: 'applicable',
              label: 'Cakupan',
              meta: '',
              tone: 'default',
              value: formatKolamVoucherApplicableToLabel(voucher.applicableTo),
            },
            {
              id: 'per-user',
              label: 'Batas per pelanggan',
              meta: '',
              tone: 'default',
              value:
                voucher.usageLimitPerUser != null &&
                voucher.usageLimitPerUser > 0
                  ? String(voucher.usageLimitPerUser)
                  : 'Tanpa batas',
            },
            {
              id: 'created',
              label: 'Dibuat',
              meta: '',
              tone: 'default',
              value: formatKolamVoucherDateTime(voucher.createdAt),
            },
            {
              id: 'updated',
              label: 'Diperbarui',
              meta: '',
              tone: 'default',
              value: formatKolamVoucherDateTime(voucher.updatedAt),
            },
          ]}
        />
      </KolamContentFrame>

      {voucher.applicableTo === 'products' ? (
        <ScopeList
          empty="Tidak ada produk terpilih."
          items={voucher.applicableProducts.map(item => item.label)}
          title="Produk yang memenuhi syarat"
        />
      ) : null}
      {voucher.applicableTo === 'species' ? (
        <ScopeList
          empty="Tidak ada spesies terpilih."
          items={voucher.applicableSpecies.map(item => item.label)}
          title="Spesies yang memenuhi syarat"
        />
      ) : null}
      {voucher.applicableCustomers.length > 0 ? (
        <ScopeList
          empty="Semua pelanggan."
          items={voucher.applicableCustomers.map(item =>
            item.sublabel ? `${item.label} · ${item.sublabel}` : item.label,
          )}
          title="Pelanggan yang memenuhi syarat"
        />
      ) : null}

      <KolamContentFrame variant="nativeFormSection">
        <View style={styles.redemptionHeader}>
          <Text style={styles.sectionTitle}>Riwayat Penukaran</Text>
          <Text style={styles.meta}>
            {controller.redemptionTotal} total
          </Text>
        </View>
        {controller.loadingRedemptions && controller.redemptions.length === 0 ? (
          <Text style={styles.meta}>Memuat penukaran…</Text>
        ) : null}
        {!controller.loadingRedemptions &&
        controller.redemptions.length === 0 ? (
          <KolamEmptyState
            compact
            message="Belum ada penukaran untuk voucher ini."
            title="Kosong"
          />
        ) : null}
        {controller.redemptions.map(item => (
          <View key={item.id} style={styles.redemptionRow}>
            <View style={styles.redemptionMain}>
              <Text numberOfLines={1} style={styles.redemptionTitle}>
                {item.customerLabel}
              </Text>
              <Text numberOfLines={1} style={styles.meta}>
                {item.saleLabel} · {formatKolamVoucherDateTime(item.createdAt)}
              </Text>
            </View>
            <View style={styles.redemptionAside}>
              <Text style={styles.redemptionAmount}>
                -{formatRupiah(item.discountApplied)}
              </Text>
              {item.cancelled ? (
                <KolamStatusBadge intent="danger" label="Dibatalkan" />
              ) : (
                <KolamStatusBadge intent="success" label="Aktif" />
              )}
            </View>
          </View>
        ))}
        {controller.redemptionTotalPages > 1 ? (
          <View style={styles.paginationRow}>
            <KolamButton
              disabled={
                controller.redemptionPage <= 1 || controller.loadingRedemptions
              }
              label="Sebelumnya"
              onPress={() =>
                controller.onSetRedemptionPage(
                  Math.max(1, controller.redemptionPage - 1),
                )
              }
            />
            <Text style={styles.meta}>
              {controller.redemptionPage} / {controller.redemptionTotalPages}
            </Text>
            <KolamButton
              disabled={
                controller.redemptionPage >= controller.redemptionTotalPages ||
                controller.loadingRedemptions
              }
              label="Berikutnya"
              onPress={() =>
                controller.onSetRedemptionPage(
                  Math.min(
                    controller.redemptionTotalPages,
                    controller.redemptionPage + 1,
                  ),
                )
              }
            />
          </View>
        ) : null}
      </KolamContentFrame>
    </KolamDetailScrollSurface>
  );
}

function MetricCard({
  hint,
  label,
  value,
}: {
  hint?: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.metricValue}>
        {value}
      </Text>
      {hint ? <Text style={styles.meta}>{hint}</Text> : null}
    </View>
  );
}

function ScopeList({
  empty,
  items,
  title,
}: {
  empty: string;
  items: string[];
  title: string;
}) {
  return (
    <KolamContentFrame variant="nativeFormSection">
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.length === 0 ? (
        <Text style={styles.meta}>{empty}</Text>
      ) : (
        items.map((item, index) => (
          <Text key={`${item}-${index}`} style={styles.scopeItem}>
            • {item}
          </Text>
        ))
      )}
    </KolamContentFrame>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 12,
  },
  content: {
    gap: 12,
    paddingBottom: 24,
  },
  titleBlock: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  title: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 18,
    fontWeight: '800',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  code: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  subtitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  banner: {
    alignSelf: 'stretch',
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    gap: 4,
    minWidth: 140,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  metricLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '800',
  },
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  meta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  scopeItem: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 18,
  },
  redemptionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  redemptionRow: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
  },
  redemptionMain: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  redemptionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  redemptionAside: {
    alignItems: 'flex-end',
    gap: 4,
  },
  redemptionAmount: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  paginationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 8,
  },
});
