import React, { useMemo } from 'react';
import {
  Image,
  Pressable,
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
import { KolamEmptyState } from './kolam-empty-state';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamSurfacePanelTabs } from './kolam-surface-panel-tabs';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

type AssetPurchaseInfoPresentation =
  | 'plain'
  | 'code'
  | 'status'
  | 'total'
  | 'link';

type AssetPurchaseInfoRow = {
  id: string;
  label: string;
  value: string;
  presentation: AssetPurchaseInfoPresentation;
  onPress?: () => void;
  statusIntent?: ReturnType<typeof getFinanceExpenseStatusIntent>;
};

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

  const infoRows = useMemo((): AssetPurchaseInfoRow[] => {
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
        presentation: detail.code ? 'code' : 'plain',
      },
      {
        id: 'status',
        label: 'Status',
        value: formatFinanceExpenseStatusLabel(detail.status),
        presentation: 'status',
        statusIntent: getFinanceExpenseStatusIntent(detail.status),
      },
      {
        id: 'name',
        label: 'Nama Aset',
        value: detail.name || '—',
        presentation: 'plain',
      },
      {
        id: 'total',
        label: 'Total',
        value: formatRupiah(detail.total),
        presentation: 'total',
      },
      {
        id: 'executedAt',
        label: 'Dieksekusi Pada',
        value: formatFinanceExpenseDateTime(detail.executedAt),
        presentation: 'plain',
      },
      {
        id: 'wallet',
        label: 'Dompet Pembayaran',
        value: detail.walletId
          ? detail.walletLabel || detail.walletId
          : 'Dompet Utama Default',
        presentation: detail.walletId ? 'link' : 'plain',
        onPress: detail.walletId ? controller.onOpenWallet : undefined,
      },
      {
        id: 'location',
        label: 'Lokasi',
        value: locationValue,
        presentation: 'plain',
      },
      {
        id: 'series',
        label: 'Nomor Seri',
        value: detail.series || '—',
        presentation: 'plain',
      },
      {
        id: 'reason',
        label: 'Alasan Pembelian',
        value: detail.reason || '—',
        presentation: 'plain',
      },
      {
        id: 'createdAt',
        label: 'Dibuat Pada',
        value: formatFinanceExpenseDateTime(detail.createdAt),
        presentation: 'plain',
      },
      {
        id: 'updatedAt',
        label: 'Terakhir Diperbarui',
        value: formatFinanceExpenseDateTime(detail.updatedAt),
        presentation: 'plain',
      },
    ];
  }, [controller.onOpenWallet, detail]);

  return (
    <View style={styles.surface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text numberOfLines={1} style={styles.toolbarContext}>
              {detail.name || detail.code || 'Pembelian Aset'}
            </Text>
            {detail.code ? (
              <KolamStatusBadge intent="secondary" label={detail.code} />
            ) : null}
            <KolamStatusBadge
              intent={getFinanceExpenseStatusIntent(detail.status)}
              label={formatFinanceExpenseStatusLabel(detail.status)}
            />
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              disabled={controller.loading || controller.verifying}
              intent="outline"
              label="Refresh"
              onPress={() => {
                void controller.onRefresh();
              }}
              style={styles.toolbarButton}
            />
            <KolamButton
              intent="outline"
              label="Kembali ke daftar"
              onPress={controller.onBack}
              style={styles.toolbarButton}
            />
            {controller.canShowVerify ? (
              <KolamButton
                disabled={controller.verifying}
                label={controller.verifying ? 'Memverifikasi…' : 'Verify'}
                onPress={() => {
                  void controller.onVerify();
                }}
                style={styles.toolbarButton}
              />
            ) : null}
            <KolamButton
              intent="secondary"
              label="Ubah"
              onPress={controller.onEdit}
              style={styles.toolbarButton}
            />
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

      <View style={styles.bodyRow}>
        <View style={styles.mainPane}>
          <KolamSurfacePanelTabs
            onSelectTab={controller.onSelectTab}
            selectedTabId={controller.tab}
            tabs={controller.tabs}
          />
          <ScrollView contentContainerStyle={styles.content} style={styles.mainScroll}>
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
          </ScrollView>
        </View>
        <View style={styles.historyPane}>
          <HistoryPanel items={controller.historyItems} />
        </View>
      </View>
    </View>
  );
}

function DetailsTab({
  customFields,
  infoRows,
  photos,
}: {
  customFields: Array<{ label: string; value: string }>;
  infoRows: AssetPurchaseInfoRow[];
  photos: string[];
}) {
  return (
    <View style={styles.tabBody}>
      <KolamContentFrame variant="nativeFormSection">
        <Text style={styles.sectionTitle}>Informasi Aset</Text>
        <View style={styles.infoList}>
          {infoRows.map((row, index) => (
            <View
              key={row.id}
              style={[styles.infoRow, index === 0 ? styles.infoRowFirst : null]}
            >
              <Text style={styles.infoLabel}>{row.label}</Text>
              <View style={styles.infoValue}>
                <InfoValue row={row} />
              </View>
            </View>
          ))}
        </View>
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
          <Text style={styles.sectionTitle}>Foto</Text>
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

function InfoValue({ row }: { row: AssetPurchaseInfoRow }) {
  if (row.presentation === 'code') {
    return <KolamStatusBadge intent="secondary" label={row.value} />;
  }
  if (row.presentation === 'status') {
    return (
      <KolamStatusBadge
        intent={row.statusIntent || 'secondary'}
        label={row.value}
      />
    );
  }
  if (row.presentation === 'total') {
    return <KolamStatusBadge intent="danger" label={row.value} />;
  }
  if (row.presentation === 'link' && row.onPress) {
    return (
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={row.value}
        onPress={row.onPress}
      >
        <Text style={styles.infoLink}>{row.value}</Text>
      </Pressable>
    );
  }
  return <Text style={styles.infoText}>{row.value}</Text>;
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

function HistoryPanel({
  items,
}: {
  items: KolamAssetPurchaseDetailController['historyItems'];
}) {
  return (
    <KolamContentFrame style={styles.historyFrame} variant="nativeFormSection">
      <Text style={styles.historyTitle}>Riwayat Aktivitas</Text>
      {items.length === 0 ? (
        <KolamEmptyState compact title="Belum ada riwayat" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.historyScroll}
          style={styles.historyScrollView}
        >
          {items.map(item => (
            <View key={item.id} style={styles.historyRow}>
              <Text style={styles.historyItemTitle}>{item.title}</Text>
              <Text style={styles.historyItemMeta}>{item.atLabel}</Text>
              {item.lines.map((line, index) => (
                <Text
                  key={`${item.id}-${index}`}
                  style={styles.historyItemLine}
                >
                  {line}
                </Text>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </KolamContentFrame>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 12,
    padding: 16,
  },
  toolbarContext: {
    color: V.colors.fg,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '700',
    minWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  toolbarButton: {
    flexShrink: 0,
    minHeight: 34,
  },
  banner: {
    alignSelf: 'stretch',
  },
  bodyRow: {
    alignItems: 'stretch',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    minHeight: 0,
  },
  mainPane: {
    flex: 3,
    flexBasis: 0,
    gap: 10,
    minHeight: 0,
    minWidth: 320,
  },
  mainScroll: {
    flex: 1,
    minHeight: 0,
  },
  historyPane: {
    flex: 1,
    flexBasis: 0,
    minHeight: 0,
    minWidth: 240,
    maxWidth: 320,
  },
  historyFrame: {
    flex: 1,
    gap: 10,
    minHeight: 0,
  },
  historyTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '700',
  },
  historyScrollView: {
    flex: 1,
    minHeight: 0,
  },
  historyScroll: {
    paddingBottom: 8,
  },
  historyRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 3,
    paddingVertical: 10,
  },
  historyItemTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  historyItemMeta: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  historyItemLine: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 17,
  },
  content: {
    gap: 16,
    paddingBottom: 24,
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
    marginBottom: 8,
  },
  infoList: {
    borderTopColor: V.colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  infoRow: {
    alignItems: 'flex-start',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 12,
  },
  infoRowFirst: {
    borderTopWidth: 0,
  },
  infoLabel: {
    color: V.colors.mutedFg,
    flexShrink: 0,
    fontSize: 13,
    lineHeight: 20,
    width: '38%',
  },
  infoValue: {
    flex: 1,
    minWidth: 0,
  },
  infoText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    textAlign: 'left',
  },
  infoLink: {
    color: V.colors.primary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'left',
    textDecorationLine: 'underline',
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
  backButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
});
