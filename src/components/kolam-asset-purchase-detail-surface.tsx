import React, { useMemo } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  formatFinanceExpenseDateTime,
  formatFinanceExpenseStatusLabel,
  getFinanceExpenseStatusIntent,
  getKolamFinanceExpenseRoot,
} from '../domain/kolam-finance-expense';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamAssetPurchaseDetailController,
  type KolamAssetPurchaseDetailController,
} from '../hooks/use-kolam-asset-purchase-detail-controller';
import { getKolamFileUrl } from '../lib/file-url';
import { formatRupiah } from '../lib/money';
import { KolamAssetPurchaseDepreciationTab } from './kolam-asset-purchase-depreciation-tab';
import { KolamButton } from './kolam-button';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDescriptionList } from './kolam-description-list';
import type { KolamDescriptionListRow } from './kolam-description-list-types';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamSurfacePanelTabs } from './kolam-surface-panel-tabs';

export function KolamAssetPurchaseDetailSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamAssetPurchaseDetailController(
    route,
    onRouteChange,
  );

  if (!controller) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState title="Belum tersedia" />
        {onRouteChange ? (
          <KolamButton
            intent="secondary"
            label="Kembali"
            onPress={() =>
              onRouteChange(getKolamFinanceExpenseRoot('asset-purchase'))
            }
            style={styles.backButton}
          />
        ) : null}
      </View>
    );
  }

  if (!controller.canView) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState title="Akses ditolak" />
        <KolamButton
          intent="secondary"
          label="Kembali"
          onPress={controller.onBack}
          style={styles.backButton}
        />
      </View>
    );
  }

  if (controller.loading && !controller.detail) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState message="Memuat…" title="Pembelian Aset" />
      </View>
    );
  }

  if (!controller.detail) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState
          message={controller.error || undefined}
          title="Tidak ditemukan"
        />
        <KolamButton
          intent="secondary"
          label="Kembali"
          onPress={controller.onBack}
          style={styles.backButton}
        />
      </View>
    );
  }

  return <AssetPurchaseDetailBody controller={controller} />;
}

function AssetPurchaseDetailBody({
  controller,
}: {
  controller: KolamAssetPurchaseDetailController;
}) {
  const detail = controller.detail!;

  const infoRows = useMemo((): KolamDescriptionListRow[] => {
    const locationValue = detail.locationLabel
      ? detail.locationType
        ? `${detail.locationLabel} (${detail.locationType})`
        : detail.locationLabel
      : '—';

    return [
      {
        id: 'code',
        label: 'Kode',
        value: detail.code || '—',
        meta: '',
        tone: 'default',
      },
      {
        id: 'status',
        label: 'Status',
        value: formatFinanceExpenseStatusLabel(detail.status),
        meta: '',
        tone:
          detail.status === 'verified'
            ? 'success'
            : detail.status === 'unverified'
              ? 'warning'
              : 'default',
      },
      {
        id: 'name',
        label: 'Nama Aset',
        value: detail.name || '—',
        meta: '',
        tone: 'default',
      },
      {
        id: 'total',
        label: 'Total',
        value: formatRupiah(detail.total),
        meta: '',
        tone: 'danger',
      },
      {
        id: 'executedAt',
        label: 'Dieksekusi Pada',
        value: formatFinanceExpenseDateTime(detail.executedAt),
        meta: '',
        tone: 'default',
      },
      {
        id: 'wallet',
        label: 'Dompet Pembayaran',
        value: detail.walletId
          ? detail.walletLabel || detail.walletId
          : 'Dompet Utama Default',
        meta: '',
        tone: 'default',
        onPress: detail.walletId ? controller.onOpenWallet : undefined,
      },
      {
        id: 'location',
        label: 'Lokasi',
        value: locationValue,
        meta: '',
        tone: 'default',
      },
      {
        id: 'series',
        label: 'Nomor Seri',
        value: detail.series || '—',
        meta: '',
        tone: 'default',
      },
      {
        id: 'reason',
        label: 'Alasan Pembelian',
        value: detail.reason || '—',
        meta: '',
        tone: 'default',
      },
      {
        id: 'createdAt',
        label: 'Dibuat Pada',
        value: formatFinanceExpenseDateTime(detail.createdAt),
        meta: '',
        tone: 'default',
      },
      {
        id: 'updatedAt',
        label: 'Terakhir Diperbarui',
        value: formatFinanceExpenseDateTime(detail.updatedAt),
        meta: '',
        tone: 'default',
      },
    ];
  }, [controller.onOpenWallet, detail]);

  return (
    <View style={styles.surface}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text numberOfLines={2} style={styles.headerTitle}>
            {detail.name || 'Pembelian Aset'}
          </Text>
          {detail.code ? (
            <KolamStatusBadge intent="secondary" label={detail.code} />
          ) : null}
          <KolamStatusBadge
            intent={getFinanceExpenseStatusIntent(detail.status)}
            label={formatFinanceExpenseStatusLabel(detail.status)}
          />
        </View>
        <View style={styles.headerActions}>
          {controller.canShowVerify ? (
            <KolamButton
              disabled={controller.verifying}
              label={controller.verifying ? 'Memverifikasi…' : 'Verify'}
              onPress={() => {
                void controller.onVerify();
              }}
            />
          ) : null}
          <KolamButton
            intent="secondary"
            label="Ubah"
            onPress={controller.onEdit}
          />
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

      <KolamSurfacePanelTabs
        onSelectTab={controller.onSelectTab}
        selectedTabId={controller.tab}
        tabs={controller.tabs}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {controller.tab === 'details' ? (
          <DetailsTab
            customFields={detail.customFieldValues}
            infoRows={infoRows}
            photos={detail.photos}
          />
        ) : null}
        {controller.tab === 'pricing' ? (
          <PricingTab
            price={detail.price}
            shippingCost={detail.shippingCost}
            total={detail.total}
          />
        ) : null}
        {controller.tab === 'depreciation' ? (
          <KolamAssetPurchaseDepreciationTab
            onPurchaseRefresh={controller.onRefresh}
            purchase={detail}
          />
        ) : null}
        {controller.tab === 'history' ? (
          <HistoryTab items={controller.historyItems} />
        ) : null}
      </ScrollView>
    </View>
  );
}

function DetailsTab({
  customFields,
  infoRows,
  photos,
}: {
  customFields: Array<{ label: string; value: string }>;
  infoRows: KolamDescriptionListRow[];
  photos: string[];
}) {
  return (
    <View style={styles.tabBody}>
      <KolamContentFrame variant="nativeFormSection">
        <KolamCopyStack
          containerStyle={styles.sectionCopy}
          items={[
            {
              id: 'title',
              text: 'Informasi Aset',
              style: styles.sectionTitle,
            },
          ]}
        />
        <KolamDescriptionList
          accessibilityLabel="Informasi aset"
          rows={infoRows}
        />
        {customFields.length > 0 ? (
          <View style={styles.specBlock}>
            <Text style={styles.specTitle}>Spesifikasi</Text>
            {customFields.map((field, index) => (
              <View key={`${field.label}-${index}`} style={styles.specRow}>
                <Text style={styles.specLabel}>{field.label}</Text>
                <Text style={styles.specValue}>{field.value || '—'}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </KolamContentFrame>

      {photos.length > 0 ? (
        <KolamContentFrame variant="nativeFormSection">
          <KolamCopyStack
            containerStyle={styles.sectionCopy}
            items={[
              {
                id: 'photos',
                text: 'Foto',
                style: styles.sectionTitle,
              },
            ]}
          />
          <View style={styles.photoGrid}>
            {photos.map((path, index) => {
              const uri = getKolamFileUrl(path) || path;
              return (
                <Image
                  key={`${path}-${index}`}
                  source={{ uri }}
                  style={styles.photoThumb}
                />
              );
            })}
          </View>
        </KolamContentFrame>
      ) : null}
    </View>
  );
}

function PricingTab({
  price,
  shippingCost,
  total,
}: {
  price: number;
  shippingCost: number;
  total: number;
}) {
  return (
    <KolamContentFrame variant="nativeFormSection">
      <KolamCopyStack
        containerStyle={styles.sectionCopy}
        items={[
          {
            id: 'title',
            text: 'Rincian Biaya',
            style: styles.sectionTitle,
          },
        ]}
      />
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Harga Aset</Text>
        <Text style={styles.priceValue}>{formatRupiah(price)}</Text>
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>Biaya Pengiriman</Text>
        <Text style={styles.priceValue}>
          {shippingCost > 0 ? formatRupiah(shippingCost) : 'Gratis Ongkir'}
        </Text>
      </View>
      <View style={[styles.priceRow, styles.priceRowTotal]}>
        <Text style={styles.priceTotalLabel}>Total</Text>
        <Text style={styles.priceTotalValue}>{formatRupiah(total)}</Text>
      </View>
    </KolamContentFrame>
  );
}

function HistoryTab({
  items,
}: {
  items: KolamAssetPurchaseDetailController['historyItems'];
}) {
  return (
    <KolamContentFrame variant="nativeFormSection">
      <KolamCopyStack
        containerStyle={styles.sectionCopy}
        items={[
          {
            id: 'title',
            text: 'Riwayat Aktivitas',
            style: styles.sectionTitle,
          },
        ]}
      />
      <View style={styles.timeline}>
        {items.map(item => (
          <View key={item.id} style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineBody}>
              <Text style={styles.timelineTitle}>{item.title}</Text>
              <Text style={styles.timelineMeta}>{item.atLabel}</Text>
              {item.lines.map((line, index) => (
                <Text key={`${item.id}-${index}`} style={styles.timelineLine}>
                  {line}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    </KolamContentFrame>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 12,
    padding: 16,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  headerCopy: {
    flexGrow: 1,
    flexShrink: 1,
    gap: 6,
    minWidth: 180,
  },
  headerTitle: {
    color: V.colors.fg,
    fontSize: 18,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  banner: {
    alignSelf: 'stretch',
  },
  content: {
    gap: 16,
    paddingBottom: 32,
  },
  tabBody: {
    gap: 16,
  },
  sectionCopy: {
    marginBottom: 8,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '700',
  },
  specBlock: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    overflow: 'hidden',
  },
  specTitle: {
    backgroundColor: V.colors.muted,
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  specRow: {
    borderTopColor: V.colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  specLabel: {
    color: V.colors.mutedFg,
    flexShrink: 1,
    fontSize: 13,
  },
  specValue: {
    color: V.colors.fg,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 12,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoThumb: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 112,
    width: 112,
  },
  priceRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  priceRowTotal: {
    borderBottomWidth: 0,
    paddingTop: 14,
  },
  priceLabel: {
    color: V.colors.mutedFg,
    fontSize: 13,
  },
  priceValue: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  priceTotalLabel: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '700',
  },
  priceTotalValue: {
    color: V.colors.danger,
    fontSize: 18,
    fontWeight: '700',
  },
  timeline: {
    borderLeftColor: V.colors.border,
    borderLeftWidth: 2,
    gap: 16,
    paddingLeft: 14,
  },
  timelineItem: {
    position: 'relative',
  },
  timelineDot: {
    backgroundColor: V.colors.primary,
    borderColor: V.colors.bg,
    borderRadius: 6,
    borderWidth: 2,
    height: 10,
    left: -20,
    position: 'absolute',
    top: 4,
    width: 10,
  },
  timelineBody: {
    gap: 4,
  },
  timelineTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  timelineMeta: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  timelineLine: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
});
