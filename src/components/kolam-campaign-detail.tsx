import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  buildKolamCampaignEditRoute,
  countKolamCampaignVariants,
  formatKolamCampaignDiscountCompact,
  formatKolamCampaignDiscountTypeLabel,
  formatKolamCampaignFullDatetime,
  formatKolamCampaignStatusLabel,
  formatKolamCampaignPriceRange,
  getKolamCampaignDaysLeft,
  getKolamCampaignDurationDays,
  getKolamCampaignStatusIntent,
  KOLAM_CAMPAIGN_ROOT,
} from '../domain/kolam-campaign';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import type { KolamCampaignController } from '../hooks/use-kolam-campaign-controller';
import { KolamButton } from './kolam-button';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamDetailScrollSurface } from './kolam-detail-scroll-surface';
import { KolamDescriptionList } from './kolam-description-list';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

export function KolamCampaignDetail({
  controller,
  onRouteChange,
}: {
  controller: KolamCampaignController;
  onRouteChange?: (route: string) => void;
}) {
  const campaign = controller.selectedCampaign;

  if (controller.loading && !campaign) {
    return (
      <KolamEmptyState message="Memuat detail kampanye…" title="Memuat" />
    );
  }

  if (!campaign) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState
          message={controller.error || 'Kampanye tidak ditemukan.'}
          title="Tidak tersedia"
        />
        <KolamButton
          label="Kembali ke daftar"
          onPress={() => onRouteChange?.(controller.onBackToList())}
        />
      </View>
    );
  }

  const durationDays = getKolamCampaignDurationDays(campaign);
  const daysLeft = getKolamCampaignDaysLeft(campaign);
  const variantCount = countKolamCampaignVariants(campaign);
  const discountLabel = formatKolamCampaignDiscountCompact(campaign);
  const startLabel = new Date(campaign.startDate).toLocaleDateString('id-ID');
  const endLabel = new Date(campaign.endDate).toLocaleDateString('id-ID');

  return (
    <KolamDetailScrollSurface contentContainerStyle={styles.content}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={styles.titleBlock}>
            <Text numberOfLines={2} style={styles.title}>
              {campaign.title}
            </Text>
            <KolamStatusBadge
              intent={getKolamCampaignStatusIntent(campaign.status)}
              label={formatKolamCampaignStatusLabel(campaign.status)}
            />
            <Text style={styles.subtitle}>
              Periode kampanye {startLabel} - {endLabel} dengan diskon{' '}
              {discountLabel} (
              {formatKolamCampaignDiscountTypeLabel(campaign.discountType)}).
            </Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              intent="outline"
              label="Kembali"
              onPress={() => onRouteChange?.(KOLAM_CAMPAIGN_ROOT)}
            />
            {controller.canUpdate ? (
              <KolamButton
                label="Ubah"
                onPress={() => {
                  const next = controller.onEdit();
                  if (next) {
                    onRouteChange?.(next);
                  } else {
                    onRouteChange?.(buildKolamCampaignEditRoute(campaign.id));
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
          style={styles.errorBadge}
        />
      ) : null}
      {controller.statusMessage ? (
        <KolamStatusBadge
          intent="success"
          label={controller.statusMessage}
          numberOfLines={2}
          style={styles.errorBadge}
        />
      ) : null}

      <View style={styles.detailColumns}>
        <View style={styles.mainColumn}>
          <KolamContentFrame variant="nativeFormSection">
            <Text style={styles.sectionTitle}>Ringkasan Kampanye</Text>
            <Text style={styles.sectionDescription}>
              Ringkasan status kampanye, nilai diskon, cakupan produk, dan
              durasi aktif.
            </Text>
            <View style={styles.metricGrid}>
              <MetricCard
                description={
                  campaign.status === 'on_going'
                    ? 'Kampanye aktif'
                    : 'Siklus kampanye'
                }
                title="Status"
                value={formatKolamCampaignStatusLabel(campaign.status)}
              />
              <MetricCard
                accent
                description={`Diskon ${formatKolamCampaignDiscountTypeLabel(campaign.discountType)}`}
                title="Diskon"
                value={discountLabel}
              />
              <MetricCard
                description={
                  variantCount > 0
                    ? `${variantCount} varian terpilih`
                    : 'Semua item yang memenuhi syarat'
                }
                title="Produk"
                value={String(campaign.products.length)}
              />
              <MetricCard
                description={
                  daysLeft != null && daysLeft > 0
                    ? `${daysLeft} hari tersisa`
                    : 'Periode kampanye'
                }
                title="Durasi"
                value={durationDays != null ? `${durationDays} hari` : '—'}
              />
            </View>
          </KolamContentFrame>

          <KolamContentFrame variant="nativeFormSection">
            <View style={styles.productsHeader}>
              <View style={styles.titleBlock}>
                <Text style={styles.sectionTitle}>Produk Kampanye</Text>
                <Text style={styles.sectionDescription}>
                  Produk dan varian yang mendapat harga kampanye ini.
                </Text>
              </View>
              <KolamStatusBadge
                intent="secondary"
                label={`${campaign.products.length} produk`}
              />
            </View>

            {campaign.products.length === 0 ? (
              <KolamEmptyState
                message="Tidak ada produk pada kampanye ini."
                title="Kosong"
              />
            ) : (
              campaign.products.map((entry, index) => {
                const product = entry.product;
                const priceItems =
                  entry.variantIds.length > 0 && entry.variantDetails?.length
                    ? entry.variantDetails
                    : product?.variants?.length
                      ? product.variants
                      : product
                        ? [product]
                        : [];
                const priceRange = formatKolamCampaignPriceRange(
                  priceItems,
                  campaign,
                );

                return (
                  <View
                    key={`${entry.productId}-${index}`}
                    style={styles.productRow}
                  >
                    <View style={styles.productMain}>
                      <Text style={styles.productIndex}>{index + 1}</Text>
                      {product?.thumbnailUri ? (
                        <KolamRemoteImage
                          accessibilityLabel={product?.name || entry.productId}
                          sourceUri={product.thumbnailUri}
                          style={styles.thumb}
                        />
                      ) : (
                        <View style={styles.thumbPlaceholder} />
                      )}
                      <View style={styles.productCopy}>
                        <Text numberOfLines={2} style={styles.productName}>
                          {product?.name || entry.productId}
                        </Text>
                        {product?.sku ? (
                          <KolamStatusBadge
                            intent="secondary"
                            label={`SKU ${product.sku}`}
                          />
                        ) : null}
                        <View style={styles.variantBadges}>
                          {entry.variantIds.length === 0 ? (
                            <KolamStatusBadge
                              intent="info"
                              label={
                                product?.variants?.length
                                  ? 'Semua varian'
                                  : 'Produk utama'
                              }
                            />
                          ) : (
                            (entry.variantDetails ?? []).map(variant => (
                              <KolamStatusBadge
                                intent="secondary"
                                key={variant.id}
                                label={variant.label}
                              />
                            ))
                          )}
                        </View>
                      </View>
                    </View>
                    <View style={styles.pricePanel}>
                      <Text style={styles.pricePanelTitle}>Harga kampanye</Text>
                      {priceRange.original ? (
                        <Text style={styles.priceOriginal}>
                          {priceRange.original}
                        </Text>
                      ) : null}
                      <Text style={styles.priceCampaign}>
                        {priceRange.campaign || '—'}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </KolamContentFrame>
        </View>

        <View style={styles.sidebarColumn}>
          <KolamContentFrame variant="nativeFormSection">
            <Text style={styles.sectionTitle}>Status Kampanye</Text>
            <Text style={styles.sectionDescription}>
              Siklus dan timeline kampanye.
            </Text>
            <View style={styles.statusHighlight}>
              <Text style={styles.statusHighlightLabel}>Status saat ini</Text>
              <KolamStatusBadge
                intent={getKolamCampaignStatusIntent(campaign.status)}
                label={formatKolamCampaignStatusLabel(campaign.status)}
              />
            </View>
            <KolamDescriptionList
              accessibilityLabel="Status kampanye"
              rows={[
                {
                  id: 'start',
                  label: 'Mulai',
                  meta: '',
                  tone: 'default',
                  value: startLabel,
                },
                {
                  id: 'end',
                  label: 'Selesai',
                  meta: '',
                  tone: 'default',
                  value: endLabel,
                },
                ...(daysLeft != null && daysLeft > 0
                  ? [
                      {
                        id: 'left',
                        label: 'Sisa',
                        meta: '',
                        tone: 'default' as const,
                        value: `${daysLeft} hari`,
                      },
                    ]
                  : []),
              ]}
            />
          </KolamContentFrame>

          <KolamContentFrame variant="nativeFormSection">
            <Text style={styles.sectionTitle}>Metadata</Text>
            <Text style={styles.sectionDescription}>
              Timestamp audit untuk kampanye ini.
            </Text>
            <KolamDescriptionList
              accessibilityLabel="Metadata kampanye"
              rows={[
                {
                  id: 'created',
                  label: 'Dibuat',
                  meta: '',
                  tone: 'default',
                  value: formatKolamCampaignFullDatetime(campaign.createdAt),
                },
                {
                  id: 'updated',
                  label: 'Diperbarui',
                  meta: '',
                  tone: 'default',
                  value: formatKolamCampaignFullDatetime(campaign.updatedAt),
                },
              ]}
            />
          </KolamContentFrame>
        </View>
      </View>
    </KolamDetailScrollSurface>
  );
}

function MetricCard({
  accent,
  description,
  title,
  value,
}: {
  accent?: boolean;
  description: string;
  title: string;
  value: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={[styles.metricValue, accent ? styles.metricAccent : null]}>
        {value}
      </Text>
      <Text style={styles.metricDescription}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 12,
    padding: 12,
  },
  content: {
    gap: 12,
    paddingBottom: 24,
  },
  detailColumns: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mainColumn: {
    flexGrow: 2,
    flexShrink: 1,
    gap: 12,
    minWidth: 320,
  },
  sidebarColumn: {
    flexGrow: 1,
    flexShrink: 1,
    gap: 12,
    minWidth: 260,
    maxWidth: 420,
  },
  statusHighlight: {
    alignItems: 'center',
    backgroundColor: V.colors.primarySoft,
    borderColor: V.colors.primary,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statusHighlightLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
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
    fontWeight: '700',
  },
  subtitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 18,
  },
  errorBadge: {
    alignSelf: 'stretch',
  },
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionDescription: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
    marginTop: 4,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexGrow: 1,
    gap: 6,
    minWidth: 140,
    padding: 12,
  },
  metricTitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 20,
    fontWeight: '700',
  },
  metricAccent: {
    color: V.colors.primary,
  },
  metricDescription: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  productsHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productRow: {
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 10,
    padding: 12,
  },
  productMain: {
    alignItems: 'flex-start',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    minWidth: 220,
  },
  productIndex: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  thumb: {
    borderRadius: 8,
    height: 48,
    width: 48,
  },
  thumbPlaceholder: {
    backgroundColor: V.colors.muted,
    borderRadius: 8,
    height: 48,
    width: 48,
  },
  productCopy: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  productName: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  variantBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pricePanel: {
    backgroundColor: V.colors.muted,
    borderRadius: 8,
    gap: 4,
    minWidth: 160,
    padding: 10,
  },
  pricePanelTitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
  },
  priceOriginal: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  priceCampaign: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
});
