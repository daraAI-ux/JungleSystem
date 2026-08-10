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
import {KolamEditButton} from './kolam-edit-button';
import { KolamDetailScrollSurface } from './kolam-detail-scroll-surface';
import { KolamDescriptionList } from './kolam-description-list';
import type { KolamDescriptionListRow } from './kolam-description-list-types';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamSurfacePanelTabs } from './kolam-surface-panel-tabs';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

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
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <View style={styles.toolbarMeta}>
              <Text numberOfLines={1} style={styles.toolbarContext}>
                {detail.name || detail.code || 'Pembelian Aset'}
              </Text>
              {detail.code ? (
                <KolamStatusBadge
                  intent="secondary"
                  label={detail.code}
                  style={styles.toolbarBadge}
                />
              ) : null}
              <KolamStatusBadge
                intent={getFinanceExpenseStatusIntent(detail.status)}
                label={formatFinanceExpenseStatusLabel(detail.status)}
                style={styles.toolbarBadge}
              />
            </View>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
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
            <KolamEditButton
              intent="secondary"
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

      <View style={styles.tabsRow}>
        <View style={styles.tabsButtonsWrap}>
          <KolamSurfacePanelTabs
            onSelectTab={controller.onSelectTab}
            selectedTabId={controller.tab}
            tabs={controller.tabs}
          />
        </View>
      </View>

      <View style={styles.detailFrame}>
        <View style={styles.bodyRow}>
          <View style={styles.mainPane}>
            <KolamDetailScrollSurface
              contentContainerStyle={styles.content}
              style={styles.mainScroll}
            >
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
            </KolamDetailScrollSurface>
          </View>

          <View style={styles.historyPane}>
            <HistoryPanel items={controller.historyItems} />
          </View>
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
  infoRows: KolamDescriptionListRow[];
  photos: string[];
}) {
  return (
    <View style={styles.tabBody}>
      <Text style={styles.sectionTitle}>Informasi Aset</Text>
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

      {photos.length > 0 ? (
        <View style={styles.photoSection}>
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
        </View>
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
    <View style={styles.tabBody}>
      <Text style={styles.sectionTitle}>Rincian Biaya</Text>
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
    </View>
  );
}

function HistoryPanel({
  items,
}: {
  items: KolamAssetPurchaseDetailController['historyItems'];
}) {
  return (
    <View style={styles.historyFrame}>
      <Text style={styles.sectionTitle}>Riwayat Aktivitas</Text>
      {items.length === 0 ? (
        <Text style={styles.historyEmpty}>Belum ada riwayat</Text>
      ) : (
        <ScrollView
          contentContainerStyle={styles.historyScroll}
          style={styles.historyScrollView}
        >
          <View style={styles.timeline}>
            {items.map(item => {
              const isCreated = item.id === 'created';
              return (
                <View key={item.id} style={styles.timelineItem}>
                  <View
                    style={[
                      styles.timelineDot,
                      isCreated
                        ? styles.timelineDotSuccess
                        : styles.timelineDotPrimary,
                    ]}
                  />
                  <View style={styles.timelineBody}>
                    <Text style={styles.timelineTitle}>{item.title}</Text>
                    <Text style={styles.timelineMeta}>{item.atLabel}</Text>
                    {item.lines.map((line, index) => (
                      <Text
                        key={`${item.id}-${index}`}
                        style={styles.timelineLine}
                      >
                        {line}
                      </Text>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 12,
    padding: 16,
  },
  toolbarMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    flexWrap: 'wrap',
    gap: 6,
    minWidth: 0,
  },
  toolbarContext: {
    color: V.colors.fg,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    minWidth: 0,
    paddingHorizontal: 4,
    textAlignVertical: 'center',
  },
  toolbarBadge: {
    alignSelf: 'center',
  },
  toolbarButton: {
    flexShrink: 0,
    minHeight: 34,
  },
  banner: {
    alignSelf: 'stretch',
  },
  tabsRow: {
    alignSelf: 'stretch',
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    width: '100%',
  },
  tabsButtonsWrap: {
    // Overlap KolamSurfacePanelTabs bottom border onto the full-width line.
    marginBottom: -1,
  },
  detailFrame: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  bodyRow: {
    alignItems: 'stretch',
    flex: 1,
    flexDirection: 'row',
    minHeight: 0,
  },
  mainPane: {
    flex: 3,
    minHeight: 0,
    minWidth: 0,
    paddingRight: 16,
  },
  mainScroll: {
    flex: 1,
    minHeight: 0,
  },
  historyPane: {
    borderLeftColor: V.colors.border,
    borderLeftWidth: StyleSheet.hairlineWidth,
    flex: 1,
    maxWidth: 300,
    minHeight: 0,
    minWidth: 240,
    paddingLeft: 16,
  },
  historyFrame: {
    flex: 1,
    gap: 8,
    minHeight: 0,
    width: '100%',
  },
  historyEmpty: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  historyScrollView: {
    flex: 1,
    minHeight: 0,
  },
  historyScroll: {
    paddingBottom: 8,
    paddingTop: 2,
  },
  timeline: {
    borderLeftColor: V.colors.border,
    borderLeftWidth: 2,
    gap: 14,
    paddingLeft: 12,
  },
  timelineItem: {
    paddingLeft: 4,
    position: 'relative',
  },
  timelineDot: {
    borderColor: V.colors.bg,
    borderRadius: 6,
    borderWidth: 2,
    height: 10,
    left: -18,
    position: 'absolute',
    top: 3,
    width: 10,
  },
  timelineDotPrimary: {
    backgroundColor: V.colors.primary,
  },
  timelineDotSuccess: {
    backgroundColor: V.colors.success,
  },
  timelineBody: {
    gap: 3,
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
    lineHeight: 17,
  },
  content: {
    gap: 16,
    paddingBottom: 24,
  },
  tabBody: {
    gap: 8,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  photoSection: {
    gap: 8,
    marginTop: 8,
  },
  specBlock: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
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
