import React, { useState } from 'react';
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  canAddItemsToKolamSale,
  canDownloadKolamSaleShippingResi,
  canOpenKolamSaleComplaintCreate,
  canShowKolamSaleComplaintSuccessPrompt,
  canShowKolamSaleEditAction,
  canUploadKolamSalePaymentProof,
  formatKolamSaleDeliveryFilterLabel,
  formatKolamSaleDeliveryStatusLabel,
  formatKolamSaleItemTypeLabel,
  formatKolamSaleLogisticsTime,
  formatKolamSalePaymentStatusLabel,
  formatKolamSaleWalletConfirmStatusLabel,
  formatKolamSaleWalletSourceLabel,
  formatKolamSaleWalletTxTypeLabel,
  formatKolamSaleWalletTypeLabel,
  getKolamNoShippingDeliveryLabel,
  getKolamSaleAllowedDeliveryTransitions,
  getKolamSaleAllowedStatusTransitions,
  getKolamSaleCouriers,
  getKolamSaleItemDiscountAmount,
  getKolamSaleItemVoucherDiscountApplied,
  formatKolamSaleItemVoucherLabel,
  getKolamSaleMainComplaint,
  getKolamSaleMarketplaceFulfillment,
  getKolamSaleMarketplaceLogistics,
  getKolamSaleOutstandingAmount,
  getKolamSalePaymentStatusIntent,
  getKolamSaleServiceLabel,
  getKolamSaleTrackingNumber,
  getKolamSaleWalletConfirmStatusIntent,
  resolveKolamSaleSourceLogoUri,
  isKolamPosSale,
  isKolamSaleMarketplaceManaged,
  kolamSaleSkipsShippingFlow,
  needsKolamTokopediaPickupRequest,
  shouldShowKolamTokopediaDropOffBadge,
  KOLAM_SALES_DISCOUNT_APPROVAL_ROUTE,
  KOLAM_SALES_ROOT,
  type KolamSalePaymentStatus,
  type KolamSaleDeliveryTransitionTarget,
  type KolamSaleStatusTransitionTarget,
} from '../domain/kolam-sales';
import {
  buildKolamComplaintCreateRoute,
  KOLAM_COMPLAINT_ROOT,
} from '../domain/kolam-complaint';
import { stockTransactionSourceLabel } from '../domain/kolam-stock-transaction';
import { getKolamCourierLogoSource } from '../domain/kolam-courier-logos';
import {
  computeKolamSaleProfitSummary,
  getKolamSaleItemProfitBreakdownMap,
  type KolamSaleItemProfitBreakdown,
} from '../domain/kolam-sales-profit';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { formatRupiah } from '../lib/money';
import type { KolamSalesController } from '../hooks/use-kolam-sales-controller';
import { KolamButton } from './kolam-button';
import {KolamDeleteButton} from './kolam-delete-button';
import {KolamDaftarButton} from './kolam-daftar-button';
import {KolamEditButton} from './kolam-edit-button';
import { KolamCardFrame } from './kolam-card-frame';
import {
  KolamDetailMetaStrip,
  KolamDetailMetaStripItem,
  kolamDetailMetaStripStyles,
} from './kolam-detail-meta-strip';
import { KolamConfirmDialog } from './kolam-confirm-dialog';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDetailScrollSurface } from './kolam-detail-scroll-surface';
import { KolamDetailSummaryCard } from './kolam-detail-summary-card';
import { KolamOverflowMenuButton } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamPdfDownloadButton } from './kolam-pdf-download-button';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';
import { KolamUploadArrowIcon } from './kolam-upload-arrow-icon';

/**
 * FE `SalesInvoice` Batch A: header, status strip, 2-col info/items | shipping/history,
 * proofs, partial outstanding. DARA/POD/warranty deferred to Batch B/C.
 */
export function KolamSalesOpsDetail({
  controller,
  onRouteChange,
}: {
  controller: KolamSalesController;
  onRouteChange?: (route: string) => void;
}) {
  const sale = controller.selectedSale;
  const [pendingStatus, setPendingStatus] =
    useState<KolamSaleStatusTransitionTarget | null>(null);
  const [pendingDelivery, setPendingDelivery] =
    useState<KolamSaleDeliveryTransitionTarget | null>(null);

  if (controller.loading && !sale) {
    return (
      <KolamContentFrame variant="settingsWebConfig">
        <KolamEmptyState
          message="Mengambil invoice dari server Kolam."
          title="Memuat detail…"
        />
      </KolamContentFrame>
    );
  }

  if (!sale) {
    return (
      <KolamContentFrame style={styles.detailMissing} variant="settingsWebConfig">
        <KolamEmptyState
          message={controller.error || 'Data penjualan tidak tersedia.'}
          title="Invoice tidak ditemukan"
        />
        <KolamButton
          label="Kembali ke daftar"
          onPress={() => onRouteChange?.(KOLAM_SALES_ROOT)}
        />
      </KolamContentFrame>
    );
  }

  const marketplaceManaged = isKolamSaleMarketplaceManaged(sale);
  const currentPaymentStatus = sale.status as KolamSalePaymentStatus;
  const skipShipping = kolamSaleSkipsShippingFlow(sale);
  const posSale = isKolamPosSale(sale);
  const allowedTransitions = marketplaceManaged
    ? []
    : getKolamSaleAllowedStatusTransitions(currentPaymentStatus);
  const canUploadProof =
    !marketplaceManaged && canUploadKolamSalePaymentProof(sale.status);
  const showDeliveryActions =
    !marketplaceManaged &&
    !skipShipping &&
    (sale.status === 'paid' || sale.status === 'partial_paid');
  const isOfflineSource = sale.sourceRef?.type === 'offline';
  const allowedDeliveryTransitions = showDeliveryActions
    ? getKolamSaleAllowedDeliveryTransitions(sale.deliveryStatus, {
        isOfflineSource,
      })
    : [];
  const canRequestBiteshipPickup =
    !marketplaceManaged &&
    !skipShipping &&
    isOfflineSource &&
    sale.status === 'paid' &&
    (!sale.deliveryStatus || sale.deliveryStatus === 'none');
  const marketplaceFulfillment = getKolamSaleMarketplaceFulfillment(sale);
  const showTokopediaPickupRequest = needsKolamTokopediaPickupRequest(sale);
  const showTokopediaDropOffBadge = shouldShowKolamTokopediaDropOffBadge(sale);
  const tokopediaDropOffUrl =
    marketplaceFulfillment?.dropOffPointUrl?.trim() || '';
  const showMarketplaceFulfillmentActions =
    showTokopediaPickupRequest || showTokopediaDropOffBadge;
  const showResi = !skipShipping && canDownloadKolamSaleShippingResi(sale);
  const outstanding = getKolamSaleOutstandingAmount(sale);
  const profitSummary = computeKolamSaleProfitSummary(sale);
  const profitByIndex = getKolamSaleItemProfitBreakdownMap(profitSummary);
  const showInternalSummary = profitSummary.itemBreakdowns.length > 0;
  const saleCouriers = getKolamSaleCouriers(sale);
  const saleServiceLabel = getKolamSaleServiceLabel(sale);
  const saleTrackingNumber = getKolamSaleTrackingNumber(sale);
  const sourceLogoUri = resolveKolamSaleSourceLogoUri(
    sale,
    controller.sources,
  );
  const marketplaceLogistics = getKolamSaleMarketplaceLogistics(sale);
  const logisticsPlatformLabel =
    marketplaceLogistics?.platform === 'shopee'
      ? 'Shopee'
      : marketplaceLogistics?.platform === 'tokopedia'
        ? 'Tokopedia'
        : '';
  const pendingLabel = pendingStatus
    ? formatKolamSalePaymentStatusLabel(pendingStatus)
    : '';
  const paymentStatusLabel =
    formatKolamSalePaymentStatusLabel(currentPaymentStatus);
  const paymentStatusActions = allowedTransitions.map(status => ({
    label: formatKolamSalePaymentStatusLabel(status),
    onPress: () => setPendingStatus(status),
    tone: status === 'cancelled' ? 'danger' : 'default',
  })) satisfies React.ComponentProps<
    typeof KolamOverflowMenuButton
  >['actions'];
  const deliveryStatusLabel =
    sale.status === 'cancelled'
      ? 'Dibatalkan'
      : skipShipping
        ? getKolamNoShippingDeliveryLabel(sale)
        : formatKolamSaleDeliveryStatusLabel(
            sale.deliveryStatus,
            sale.status,
            sale,
          );
  const deliveryStatusActions = allowedDeliveryTransitions.map(target => ({
    label: formatKolamSaleDeliveryFilterLabel(target),
    onPress: () => setPendingDelivery(target),
  })) satisfies React.ComponentProps<
    typeof KolamOverflowMenuButton
  >['actions'];
  const buyerPhone = sale.customer?.phone || sale.buyerInfo?.phone || '';
  const buyerEmail = sale.customer?.email || sale.buyerInfo?.email || '';
  const mainComplaint = getKolamSaleMainComplaint(sale);
  const showComplaintCreate = canOpenKolamSaleComplaintCreate(sale);
  const showComplaintSuccessPrompt = canShowKolamSaleComplaintSuccessPrompt(sale);
  const complaintCreateRoute = buildKolamComplaintCreateRoute({
    saleId: sale.id,
  });
  const handleUploadPaymentProof = async () => {
    const uri = await controller.onPickImage();
    if (uri) {
      void controller.onUploadPaymentProof(uri);
    }
  };

  return (
    <View style={styles.detailSurface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text numberOfLines={1} style={styles.detailToolbarContext}>
              {sale.invoiceCode}
            </Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamDaftarButton
              onPress={() => onRouteChange?.(KOLAM_SALES_ROOT)}
              style={styles.toolbarButton}
            />
            {canShowKolamSaleEditAction(sale) ? (
              <KolamEditButton
                onPress={() =>
                  onRouteChange?.(`${KOLAM_SALES_ROOT}/${sale.id}/edit`)
                }
                style={styles.toolbarButton}
              />
            ) : null}
            {canAddItemsToKolamSale(sale) ? (
              <KolamButton
                label="Tambah item"
                onPress={() =>
                  onRouteChange?.(
                    `${KOLAM_SALES_ROOT}/${sale.id}/edit?mode=add-items`,
                  )
                }
                style={styles.toolbarButton}
              />
            ) : null}
            {canUploadProof ? (
              <KolamButton
                disabled={controller.mutating}
                icon={
                  <KolamUploadArrowIcon color={V.colors.primaryFg} size={16} />
                }
                label="Unggah bukti"
                onPress={handleUploadPaymentProof}
                style={styles.paymentProofUploadButton}
                textStyle={styles.paymentProofUploadButtonText}
              />
            ) : null}
            <KolamPdfDownloadButton
              disabled={controller.downloadingInvoice || controller.mutating}
              intent="primary"
              label="Unduh invoice PDF"
              loading={controller.downloadingInvoice}
              loadingLabel="Mengunduh…"
              onPress={() => {
                void controller.onDownloadInvoice();
              }}
              style={styles.toolbarButton}
            />
            {showResi ? (
              <KolamPdfDownloadButton
                disabled={controller.downloadingInvoice || controller.mutating}
                label="Unduh resi"
                loading={controller.downloadingInvoice}
                loadingLabel="Mengunduh…"
                onPress={() => {
                  void controller.onDownloadResi();
                }}
                style={styles.toolbarButton}
              />
            ) : null}
            {mainComplaint ? (
              <KolamButton
                label="Lihat komplain"
                onPress={() =>
                  onRouteChange?.(
                    `${KOLAM_COMPLAINT_ROOT}/${mainComplaint.id}`,
                  )
                }
                style={styles.toolbarButton}
              />
            ) : showComplaintCreate ? (
              <KolamButton
                label="Ajukan komplain"
                onPress={() => onRouteChange?.(complaintCreateRoute)}
                style={styles.toolbarButton}
              />
            ) : null}
          </View>
        </View>
      </View>

      {sale.openLivestockPendingCount > 0 ? (
        <KolamCopyStack
          items={[
            {
              id: 'livestock',
              text: `${sale.openLivestockPendingCount} species perlu atur kandang`,
              style: styles.warningHint,
            },
          ]}
        />
      ) : null}

      <KolamDetailScrollSurface
        contentContainerStyle={styles.detailContent}
        style={styles.detailRoot}
      >

      {mainComplaint ? (
        <KolamCardFrame style={styles.complaintBanner} variant="compact">
          <View style={styles.complaintBannerRow}>
            <View style={styles.complaintBannerCopy}>
              <Text style={styles.primaryText}>
                Komplain {mainComplaint.ticketCode}
              </Text>
              <Text style={styles.metaText}>
                Status: {mainComplaint.status || '—'}
                {mainComplaint.decision
                  ? ` · Keputusan: ${mainComplaint.decision}`
                  : ''}
              </Text>
            </View>
            <KolamButton
              intent="primary"
              label="Buka tiket"
              onPress={() =>
                onRouteChange?.(`${KOLAM_COMPLAINT_ROOT}/${mainComplaint.id}`)
              }
              style={styles.toolbarButton}
            />
          </View>
        </KolamCardFrame>
      ) : null}

      {showComplaintSuccessPrompt ? (
        <KolamCardFrame style={styles.complaintBanner} variant="compact">
          <Text style={styles.primaryText}>Konfirmasi status transaksi</Text>
          <Text style={styles.metaText}>
            Transaksi sudah dibayar dan diterima. Konfirmasi selesai, atau
            ajukan komplain jika ada masalah.
          </Text>
          <View style={styles.complaintBannerActions}>
            {allowedDeliveryTransitions.includes('success') ? (
              <KolamButton
                disabled={controller.mutating}
                intent="primary"
                label="Selesai"
                onPress={() => setPendingDelivery('success')}
                style={styles.toolbarButton}
              />
            ) : null}
            <KolamButton
              label="Komplain"
              onPress={() => onRouteChange?.(complaintCreateRoute)}
              style={styles.toolbarButton}
            />
          </View>
        </KolamCardFrame>
      ) : null}

      <KolamDetailMetaStrip
        trailing={
          sourceLogoUri ? (
            <View style={kolamDetailMetaStripStyles.stripSourceSlot}>
              <KolamRemoteImage
                accessibilityLabel={
                  sale.sourceRef?.name || 'Sumber penjualan'
                }
                resizeMode="contain"
                sourceUri={sourceLogoUri}
                style={kolamDetailMetaStripStyles.stripSourceLogo}
              />
            </View>
          ) : null
        }
      >
        <KolamDetailMetaStripItem label="Pembayaran">
          <KolamOverflowMenuButton
            accessibilityLabel="Status pembayaran"
            actions={paymentStatusActions}
            disabled={marketplaceManaged || allowedTransitions.length === 0}
            floating
            label={paymentStatusLabel}
            menuAlign="left"
            menuWidth={190}
            style={[
              styles.paymentStatusTrigger,
              marketplaceManaged || allowedTransitions.length === 0
                ? styles.paymentStatusTriggerMuted
                : null,
            ]}
            textStyle={styles.paymentStatusTriggerText}
            variant="select"
          />
        </KolamDetailMetaStripItem>
        <KolamDetailMetaStripItem
          label={skipShipping ? (posSale ? 'POS' : 'Layanan') : 'Pengiriman'}
        >
          {skipShipping ? (
            <KolamStatusBadge
              intent={sale.status === 'cancelled' ? 'danger' : 'info'}
              label={deliveryStatusLabel}
            />
          ) : (
            <KolamOverflowMenuButton
              accessibilityLabel="Status pengiriman"
              actions={deliveryStatusActions}
              disabled={
                !showDeliveryActions || allowedDeliveryTransitions.length === 0
              }
              floating
              label={deliveryStatusLabel}
              menuAlign="left"
              menuWidth={210}
              style={[
                styles.deliveryStatusTrigger,
                !showDeliveryActions || allowedDeliveryTransitions.length === 0
                  ? styles.paymentStatusTriggerMuted
                  : null,
              ]}
              textStyle={styles.paymentStatusTriggerText}
              variant="select"
            />
          )}
        </KolamDetailMetaStripItem>
        <KolamDetailMetaStripItem label="Total">
          <Text style={kolamDetailMetaStripStyles.stripValue}>
            {formatRupiah(sale.finalTotal)}
          </Text>
        </KolamDetailMetaStripItem>
        {!marketplaceManaged && sale.pointsEarned > 0 ? (
          <KolamDetailMetaStripItem label="Poin">
            <Text style={kolamDetailMetaStripStyles.stripValue}>
              {sale.pointsEarned.toLocaleString('id-ID')}
            </Text>
          </KolamDetailMetaStripItem>
        ) : null}
        {marketplaceManaged && sale.marketplaceOrderId ? (
          <KolamDetailMetaStripItem label="Order ID">
            <Text style={kolamDetailMetaStripStyles.stripValue}>
              {sale.marketplaceOrderId}
            </Text>
          </KolamDetailMetaStripItem>
        ) : null}
      </KolamDetailMetaStrip>

      {skipShipping ? (
        <Text style={styles.infoNote}>
          {posSale
            ? 'Penjualan POS — tanpa alur pengiriman.'
            : 'Penjualan layanan saja — tanpa alur pengiriman.'}
        </Text>
      ) : null}

      <View style={styles.detailFrame}>
        <View style={styles.detailFrameRow}>
          <View style={styles.detailFrameMain}>
            <KolamDetailSummaryCard
              title="Informasi Transaksi"
              fields={[
                {
                  id: 'buyer',
                  label:
                    sale.buyerInfo && !sale.customer
                      ? 'Pembeli eksternal'
                      : 'Pelanggan',
                  value: [sale.buyerLabel, buyerPhone, buyerEmail]
                    .filter(Boolean)
                    .join(' | '),
                },
                {
                  id: 'pic',
                  label: 'PIC',
                  value: sale.createdByName || '—',
                },
                {
                  id: 'payment-method',
                  label: 'Metode bayar',
                  value: [sale.paymentMethod?.name, sale.paymentMethod?.type]
                    .filter(Boolean)
                    .join(' | ') || '—',
                },
                {
                  id: 'created',
                  label: 'Dibuat',
                  value: formatShortDateTime(sale.createdAt) || '—',
                },
                {
                  id: 'transaction',
                  label: 'Tanggal transaksi',
                  value: formatShortDateTime(sale.transactionDate) || '—',
                },
                ...(sale.discountType
                  ? [
                      {
                        id: 'discount-type',
                        label: 'Tipe diskon',
                        value: sale.discountType,
                      },
                    ]
                  : []),
                ...(sale.notes
                  ? [
                      {
                        id: 'notes',
                        label: 'Catatan',
                        value: sale.notes,
                      },
                    ]
                  : []),
              ]}
            />

            <KolamCardFrame style={styles.paymentProofCard} variant="compact">
              <View style={styles.paymentProofHeader}>
                <Text style={styles.sectionTitle}>
                  Bukti pembayaran ({sale.paymentProofs.length})
                </Text>
              </View>
              {sale.paymentProofs.length === 0 ? (
                <Text style={styles.metaText}>Belum ada bukti pembayaran.</Text>
              ) : (
                sale.paymentProofs.map(proof => (
                  <View key={proof.id} style={styles.proofRow}>
                    {proof.uri ? (
                      <KolamRemoteImage
                        accessibilityLabel={proof.note || proof.path}
                        sourceUri={proof.uri}
                        style={styles.proofThumb}
                      />
                    ) : (
                      <Text style={styles.metaText}>{proof.path}</Text>
                    )}
                    <View style={styles.proofMeta}>
                      {proof.note ? (
                        <Text style={styles.metaText}>{proof.note}</Text>
                      ) : null}
                      {proof.uploadedAt ? (
                        <Text style={styles.metaText}>
                          {formatShortDateTime(proof.uploadedAt)}
                        </Text>
                      ) : null}
                      {!marketplaceManaged ? (
                        <View style={styles.actionButtons}>
                          <KolamButton
                            disabled={controller.mutating}
                            label="Ganti"
                            onPress={async () => {
                              const uri = await controller.onPickImage();
                              if (uri) {
                                void controller.onReplacePaymentProof(
                                  proof.id,
                                  uri,
                                );
                              }
                            }}
                          />
                          <KolamDeleteButton
                            disabled={controller.mutating}
                            intent="danger"
                            label="Hapus"
                            onPress={() => {
                              void controller.onDeletePaymentProof(proof.id);
                            }}
                          />
                        </View>
                      ) : null}
                    </View>
                  </View>
                ))
              )}
            </KolamCardFrame>
          </View>

          {!skipShipping ? (
            <View style={styles.detailFrameSide}>
              <Text style={styles.sectionTitle}>Informasi Pengiriman</Text>
              <View style={styles.shippingBlock}>
                <View style={styles.shippingField}>
                  <Text style={styles.shippingFieldLabel}>Alamat</Text>
                  <Text style={styles.shippingFieldValue}>
                    {sale.shippingAddressText || '—'}
                  </Text>
                </View>
                <View style={styles.shippingField}>
                  <Text style={styles.shippingFieldLabel}>Kurir</Text>
                  {saleCouriers.length > 0 ? (
                    <View style={styles.courierChipRow}>
                      {saleCouriers.map(courier => {
                        const logo = getKolamCourierLogoSource(courier.logoKey);
                        return (
                          <View key={courier.name} style={styles.courierChip}>
                            {logo ? (
                              <Image
                                accessibilityLabel={`Logo ${courier.name}`}
                                resizeMode="contain"
                                source={logo}
                                style={styles.courierLogo}
                              />
                            ) : null}
                            <Text style={styles.shippingFieldValue}>
                              {courier.name}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    <Text style={styles.shippingFieldValue}>Tidak ada kurir</Text>
                  )}
                </View>
                {saleServiceLabel ? (
                  <View style={styles.shippingField}>
                    <Text style={styles.shippingFieldLabel}>Layanan</Text>
                    <Text style={styles.shippingFieldValue}>
                      {saleServiceLabel}
                    </Text>
                  </View>
                ) : null}
                {saleTrackingNumber ? (
                  <View style={styles.shippingField}>
                    <Text style={styles.shippingFieldLabel}>Nomor Resi</Text>
                    <Text
                      selectable
                      style={[styles.shippingFieldValue, styles.trackingMono]}
                    >
                      {saleTrackingNumber}
                    </Text>
                  </View>
                ) : null}
                <View style={styles.shippingField}>
                  <Text style={styles.shippingFieldLabel}>Total pengiriman</Text>
                  <Text style={styles.shippingFieldValue}>
                    {formatRupiah(sale.shippingCost)}
                  </Text>
                </View>
              </View>

              {marketplaceLogistics ? (
                <>
                  <Text style={styles.sectionTitle}>
                    Perjalanan paket ({logisticsPlatformLabel})
                  </Text>
                  {marketplaceLogistics.lastUpdate &&
                  marketplaceLogistics.timeline.length === 0 ? (
                    <Text style={styles.metaText}>
                      {marketplaceLogistics.lastUpdate}
                    </Text>
                  ) : marketplaceLogistics.timeline.length === 0 ? (
                    <Text style={styles.metaText}>
                      Belum ada pembaruan perjalanan paket.
                    </Text>
                  ) : (
                    <ScrollView
                      contentContainerStyle={styles.historyScroll}
                      nestedScrollEnabled
                      style={styles.historyScrollView}
                    >
                      <View style={styles.historyTimeline}>
                        {marketplaceLogistics.timeline.map((entry, index) => {
                          const timeLabel = formatKolamSaleLogisticsTime(
                            entry.at,
                          );
                          const isLatest = index === 0;
                          return (
                            <View
                              key={`${entry.message}-${entry.at || index}`}
                              style={styles.historyTimelineItem}
                            >
                              <View
                                style={[
                                  styles.historyTimelineDot,
                                  isLatest
                                    ? styles.historyTimelineDotSuccess
                                    : styles.historyTimelineDotSecondary,
                                ]}
                              />
                              <View style={styles.historyTimelineBody}>
                                <Text style={styles.historyTimelineTitle}>
                                  {entry.message}
                                </Text>
                                {timeLabel ? (
                                  <Text style={styles.metaText}>
                                    {timeLabel}
                                  </Text>
                                ) : null}
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </ScrollView>
                  )}
                </>
              ) : null}

              {showDeliveryActions ? (
                <>
                  {allowedDeliveryTransitions.length === 0 ? (
                    <Text style={styles.metaText}>
                      Tidak ada transisi pengiriman yang tersedia.
                    </Text>
                  ) : null}
                  {canRequestBiteshipPickup ? (
                    <KolamButton
                      disabled={controller.mutating}
                      label="Request pickup Biteship"
                      onPress={() => {
                        void controller.onRequestBiteshipPickup();
                      }}
                    />
                  ) : null}
                </>
              ) : marketplaceManaged ? (
                <View style={styles.marketplaceFulfillmentActions}>
                  {showTokopediaDropOffBadge ? (
                    <View style={styles.tokopediaDropOffRow}>
                      <KolamStatusBadge
                        intent="warning"
                        label="Antar ke counter (Tokopedia)"
                      />
                      {tokopediaDropOffUrl ? (
                        <Pressable
                          accessibilityRole="link"
                          onPress={() => {
                            void Linking.openURL(tokopediaDropOffUrl).catch(
                              () => undefined,
                            );
                          }}
                        >
                          <Text style={styles.dropOffLink}>Lokasi counter</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  ) : null}
                  {showTokopediaPickupRequest ? (
                    <KolamButton
                      disabled={controller.mutating}
                      intent="primary"
                      label="Request jemput kurir (Tokopedia)"
                      onPress={() => {
                        void controller.onRequestMarketplacePickup();
                      }}
                    />
                  ) : null}
                  {!showMarketplaceFulfillmentActions ? (
                    <Text style={styles.metaText}>
                      Pengiriman marketplace dikelola otomatis dari platform.
                    </Text>
                  ) : null}
                </View>
              ) : sale.status !== 'paid' && sale.status !== 'partial_paid' ? (
                <Text style={styles.metaText}>
                  Transisi pengiriman tersedia setelah status Lunas.
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.columns}>
        <View style={styles.columnMain}>
          {marketplaceManaged || allowedTransitions.length === 0 ? (
            <>
              <Text style={styles.sectionTitle}>Aksi status</Text>
              {marketplaceManaged ? (
                <Text style={styles.metaText}>
                  Status pembayaran marketplace dikelola otomatis dari platform.
                </Text>
              ) : (
                <>
                  <Text style={styles.metaText}>
                    {sale.status === 'pending'
                      ? 'Menunggu persetujuan finance (ubah via Persetujuan Diskon).'
                      : 'Tidak ada transisi status yang tersedia.'}
                  </Text>
                  {sale.status === 'pending' ? (
                    <KolamButton
                      label="Ke persetujuan diskon"
                      onPress={() =>
                        onRouteChange?.(KOLAM_SALES_DISCOUNT_APPROVAL_ROUTE)
                      }
                    />
                  ) : null}
                </>
              )}
            </>
          ) : null}

          <Text style={styles.sectionTitle}>Detail Item Penjualan</Text>
          {sale.items.length === 0 ? (
            <Text style={styles.metaText}>Tidak ada item.</Text>
          ) : (
            sale.items.map((item, index) => {
              const lineTotal = item.unitPrice * item.quantity;
              const discountAmount = getKolamSaleItemDiscountAmount(item);
              const voucherApplied = getKolamSaleItemVoucherDiscountApplied(item);
              const packingClientTotal = item.packings.reduce(
                (sum, packing) =>
                  sum + packing.unitPriceAtSale * packing.quantity,
                0,
              );
              const clientPay =
                Math.max(0, item.subtotal - voucherApplied) +
                Math.max(0, item.shippingCost) +
                packingClientTotal;
              const internal = profitByIndex.get(index) ?? null;

              return (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemRow}>
                    {item.thumbnailUri ? (
                      <KolamRemoteImage
                        accessibilityLabel={`Gambar ${item.title}`}
                        sourceUri={item.thumbnailUri}
                        style={styles.itemThumb}
                      />
                    ) : (
                      <View style={styles.itemThumbPlaceholder}>
                        <Text style={styles.itemThumbPlaceholderText}>—</Text>
                      </View>
                    )}
                    <View style={styles.itemBody}>
                      <Text style={styles.primaryText}>{item.title}</Text>
                      <Text style={styles.metaText}>
                        {formatKolamSaleItemTypeLabel(item.itemType)}
                        {item.variantLabel ? ` · ${item.variantLabel}` : ''}
                        {item.sku ? ` · ${item.sku}` : ''}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.breakdownCard}>
                    <View
                      style={[
                        styles.breakdownSection,
                        styles.breakdownSectionFirst,
                      ]}
                    >
                      <Text style={styles.breakdownSectionTitle}>
                        Tagihan Client
                      </Text>
                      <BreakdownAmountRow
                        label={`${formatRupiah(item.unitPrice)} × ${item.quantity}`}
                        value={formatRupiah(lineTotal)}
                      />
                      {discountAmount > 0 ? (
                        <BreakdownAmountRow
                          label={
                            item.discount?.type === 'percentage'
                              ? `Diskon (${item.discount.amount}%)`
                              : 'Diskon'
                          }
                          tone="deduction"
                          value={`-${formatRupiah(discountAmount)}`}
                        />
                      ) : null}
                      {voucherApplied > 0 ? (
                        <BreakdownAmountRow
                          label={`Voucher ${formatKolamSaleItemVoucherLabel(item) || item.voucherCode}`}
                          tone="deduction"
                          value={`-${formatRupiah(voucherApplied)}`}
                        />
                      ) : item.voucherCode ? (
                        <BreakdownAmountRow
                          label={`Voucher ${item.voucherCode}`}
                          tone="muted"
                          value=""
                        />
                      ) : null}
                      {item.shippingCost > 0 ? (
                        <BreakdownAmountRow
                          label="Ongkir"
                          value={formatRupiah(item.shippingCost)}
                        />
                      ) : null}
                      {packingClientTotal > 0 ? (
                        <BreakdownAmountRow
                          label="Kemasan"
                          value={formatRupiah(packingClientTotal)}
                        />
                      ) : null}
                      <BreakdownAmountRow
                        emphasis
                        label="Client Bayar"
                        value={formatRupiah(clientPay)}
                      />
                    </View>

                    {internal ? (
                      <ItemInternalBreakdownSection
                        bd={internal}
                        mode={profitSummary.mode}
                      />
                    ) : null}
                  </View>
                </View>
              );
            })
          )}

          <View style={styles.totalsCard}>
            <BreakdownAmountRow
              label="Subtotal"
              value={formatRupiah(sale.total)}
            />
            {sale.shippingCost > 0 ? (
              <BreakdownAmountRow
                label="Ongkir"
                value={formatRupiah(sale.shippingCost)}
              />
            ) : null}
            {sale.customCosts.map((cost, index) => (
              <BreakdownAmountRow
                key={`custom-cost-${index}`}
                label={cost.name}
                value={formatRupiah(cost.amount)}
              />
            ))}
            {sale.sourceCost > 0 && !marketplaceManaged ? (
              <BreakdownAmountRow
                label="Biaya sumber"
                value={formatRupiah(sale.sourceCost)}
              />
            ) : null}
            <BreakdownAmountRow
              emphasis
              label="Total keseluruhan"
              tone="profit"
              value={formatRupiah(sale.finalTotal)}
            />
            <BreakdownAmountRow
              label="Sudah dibayar"
              value={formatRupiah(sale.paidAmount)}
            />
          </View>

          {showInternalSummary ? (
            <View style={styles.internalSummaryCard}>
              <Text style={styles.breakdownSectionTitle}>
                Internal keseluruhan
              </Text>
              <BreakdownAmountRow
                label={
                  profitSummary.mode === 'olshop'
                    ? `Sub Total (${profitSummary.itemBreakdowns.length} item — Pemasukan kotor)`
                    : 'Pendapatan'
                }
                value={formatRupiah(profitSummary.grossSubtotal)}
              />
              {profitSummary.totalProductHpp > 0 ? (
                <BreakdownAmountRow
                  label="Total HPP"
                  tone="deduction"
                  value={`-${formatRupiah(profitSummary.totalProductHpp)}`}
                />
              ) : null}
              {profitSummary.mode === 'olshop' &&
              profitSummary.marketplaceFees > 0 ? (
                <>
                  <Text style={styles.metaText}>
                    {profitSummary.marketplaceFeeLabel}
                  </Text>
                  {profitSummary.marketplaceFeeBreakdown.length > 0
                    ? profitSummary.marketplaceFeeBreakdown.map((row, i) => (
                        <BreakdownAmountRow
                          key={`${row.name}-${i}`}
                          label={`– ${row.name}`}
                          tone="deduction"
                          value={`-${formatRupiah(row.amount)}`}
                        />
                      ))
                    : null}
                  <BreakdownAmountRow
                    label="Total"
                    tone="deduction"
                    value={`-${formatRupiah(profitSummary.marketplaceFees)}`}
                  />
                </>
              ) : null}
              {profitSummary.mode === 'internal' &&
              profitSummary.paymentMethodCost > 0 ? (
                <BreakdownAmountRow
                  label="Biaya Payment Method"
                  tone="deduction"
                  value={`-${formatRupiah(profitSummary.paymentMethodCost)}`}
                />
              ) : null}
              {profitSummary.totalCommission > 0 ? (
                <BreakdownAmountRow
                  label="Komisi final"
                  tone="deduction"
                  value={`-${formatRupiah(profitSummary.totalCommission)}`}
                />
              ) : null}
              <BreakdownAmountRow
                emphasis
                label="Profit bersih"
                tone={
                  profitSummary.netProfit >= 0 ? 'profit' : 'deduction'
                }
                value={formatRupiah(profitSummary.netProfit)}
              />
            </View>
          ) : null}
          {sale.status === 'partial_paid' ? (
            <KolamCardFrame style={styles.outstandingCard} variant="compact">
              <Text style={styles.sectionTitle}>Sisa Pembayaran</Text>
              <Text style={styles.primaryText}>{formatRupiah(outstanding)}</Text>
              <Text style={styles.metaText}>
                Total {formatRupiah(sale.finalTotal)} − dibayar{' '}
                {formatRupiah(sale.paidAmount)}
              </Text>
            </KolamCardFrame>
          ) : null}

          {sale.walletTransactions.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>
                Transaksi Dompet ({sale.walletTransactions.length})
              </Text>
              {sale.walletTransactions.map(tx => {
                const isCredit = tx.type === 'credit';
                return (
                  <Pressable
                    accessibilityRole="button"
                    key={tx.id}
                    onPress={() => onRouteChange?.(`/wallet/${tx.id}`)}
                    style={styles.relatedTxCard}
                  >
                    <View style={styles.relatedTxHeader}>
                      <Text style={styles.primaryText}>
                        {formatKolamSaleWalletTxTypeLabel(tx.type)}
                        {tx.walletName ? ` · ${tx.walletName}` : ''}
                      </Text>
                      <Text
                        style={[
                          styles.relatedTxAmount,
                          isCredit
                            ? styles.profitPositive
                            : styles.profitNegative,
                        ]}
                      >
                        {isCredit ? '+' : '-'}
                        {formatRupiah(tx.amount)}
                      </Text>
                    </View>
                    <Text style={styles.metaText}>
                      {formatKolamSaleWalletSourceLabel(tx.source)}
                      {tx.walletType
                        ? ` · ${formatKolamSaleWalletTypeLabel(tx.walletType)}`
                        : ''}
                    </Text>
                    <View style={styles.relatedTxFooter}>
                      <KolamStatusBadge
                        intent={getKolamSaleWalletConfirmStatusIntent(
                          tx.confirmStatus,
                        )}
                        label={formatKolamSaleWalletConfirmStatusLabel(
                          tx.confirmStatus,
                        )}
                      />
                      {tx.createdAt ? (
                        <Text style={styles.metaText}>
                          {formatShortDateTime(tx.createdAt)}
                        </Text>
                      ) : null}
                    </View>
                    {tx.note ? (
                      <Text style={styles.metaText}>{tx.note}</Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </>
          ) : null}

          {sale.stockTransactions.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Alur Stok</Text>
              <Text style={styles.metaText}>
                Pergerakan stok terkait invoice ini (stok Kolam = acuan utama).
              </Text>
              {sale.stockTransactions.map(tx => (
                <Pressable
                  accessibilityRole="button"
                  key={tx.id}
                  onPress={() =>
                    onRouteChange?.(`/stock-transaction/${tx.id}`)
                  }
                  style={styles.relatedTxCard}
                >
                  <Text style={[styles.primaryText, styles.relatedTxLink]}>
                    {stockTransactionSourceLabel(tx.source)} ·{' '}
                    {tx.type || '—'} · qty {tx.quantity}
                  </Text>
                  <Text style={styles.metaText}>
                    {tx.before ?? '—'} → {tx.after ?? '—'}
                    {tx.reason ? ` · ${tx.reason}` : ''}
                  </Text>
                  {tx.crossSyncSummary ? (
                    <Text style={styles.metaText}>
                      Cross-sync: {tx.crossSyncSummary}
                    </Text>
                  ) : null}
                  {tx.createdAt ? (
                    <Text style={styles.metaText}>
                      {formatShortDateTime(tx.createdAt)}
                    </Text>
                  ) : null}
                </Pressable>
              ))}
            </>
          ) : null}
        </View>

        <View style={styles.columnSide}>
          {controller.livestockAllocations.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Alokasi kandang</Text>
              {controller.livestockAllocations.map(row => (
                <Text key={row.id} style={styles.metaText}>
                  {row.label} · {row.status}
                </Text>
              ))}
            </>
          ) : null}

          {sale.saleHistories.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Riwayat Status</Text>
              <ScrollView
                contentContainerStyle={styles.historyScroll}
                nestedScrollEnabled
                style={styles.historyScrollView}
              >
                <View style={styles.historyTimeline}>
                  {[...sale.saleHistories]
                    .sort(
                      (a, b) =>
                        new Date(b.changedAt).getTime() -
                        new Date(a.changedAt).getTime(),
                    )
                    .map(history => (
                      <View key={history.id} style={styles.historyTimelineItem}>
                        <View
                          style={[
                            styles.historyTimelineDot,
                            historyTimelineDotStyle(history.status),
                          ]}
                        />
                        <View style={styles.historyTimelineBody}>
                          <Text style={styles.historyTimelineTitle}>
                            {formatKolamSalePaymentStatusLabel(history.status)}
                          </Text>
                          <Text style={styles.metaText}>
                            {formatShortDateTime(history.changedAt)}
                            {history.changedByName
                              ? ` · ${history.changedByName}`
                              : ''}
                          </Text>
                          {history.note ? (
                            <Text style={styles.metaText}>{history.note}</Text>
                          ) : null}
                        </View>
                      </View>
                    ))}
                </View>
              </ScrollView>
            </>
          ) : null}
        </View>
      </View>
    </KolamDetailScrollSurface>

      <KolamConfirmDialog
        cancelLabel="Batal"
        confirmLabel={
          pendingStatus === 'cancelled' ? 'Batalkan penjualan' : 'Ubah status'
        }
        destructive={pendingStatus === 'cancelled'}
        message={
          pendingStatus === 'paid'
            ? `Ubah status ${sale.invoiceCode} menjadi Lunas? Stok dan wallet akan diproses di server.`
            : pendingStatus === 'cancelled'
              ? `Batalkan ${sale.invoiceCode}? Stok/wallet dapat dikembalikan sesuai aturan backend.`
              : `Ubah status ${sale.invoiceCode} menjadi ${pendingLabel}?`
        }
        onCancel={() => setPendingStatus(null)}
        onConfirm={() => {
          const next = pendingStatus;
          setPendingStatus(null);
          if (next) {
            void controller.onUpdateStatus(next);
          }
        }}
        title="Konfirmasi status"
        visible={Boolean(pendingStatus)}
      />
      <KolamConfirmDialog
        cancelLabel="Batal"
        confirmLabel="Ubah pengiriman"
        message={`Ubah status pengiriman ${sale.invoiceCode} menjadi ${
          pendingDelivery
            ? formatKolamSaleDeliveryFilterLabel(pendingDelivery)
            : ''
        }?`}
        onCancel={() => setPendingDelivery(null)}
        onConfirm={() => {
          const next = pendingDelivery;
          setPendingDelivery(null);
          if (next) {
            void controller.onUpdateDelivery(next);
          }
        }}
        title="Konfirmasi pengiriman"
        visible={Boolean(pendingDelivery)}
      />
    </View>
  );
}

function commissionRuleLabel(
  rule: KolamSaleItemProfitBreakdown['commissionRule'],
): string {
  if (!rule) {
    return 'Komisi';
  }
  if (rule.type === 'percentage') {
    return `Komisi (${rule.val}%)`;
  }
  return 'Komisi (tetap/unit)';
}

function ItemInternalBreakdownSection({
  bd,
  mode,
}: {
  bd: KolamSaleItemProfitBreakdown;
  mode: 'olshop' | 'internal';
}) {
  const storedLabel =
    bd.vendorHpp > 0 || bd.bomHpp > 0
      ? 'HPP Produk (tersimpan)'
      : 'HPP Produk';

  return (
    <View style={styles.breakdownSection}>
      <Text style={styles.breakdownSectionTitle}>Internal</Text>
      {bd.hasDiscount ? (
        <BreakdownAmountRow
          label="Diskon item"
          tone="deduction"
          value={`-${formatRupiah(bd.discountAmount)}`}
        />
      ) : null}
      <BreakdownAmountRow
        label="Pendapatan (setelah disc)"
        value={formatRupiah(bd.revenueAfterDiscount)}
      />
      {bd.vendorHpp > 0 ? (
        <BreakdownAmountRow
          label="Harga Vendor"
          tone="deduction"
          value={`-${formatRupiah(bd.vendorHpp)}`}
        />
      ) : null}
      {bd.bomHpp > 0 ? (
        <BreakdownAmountRow
          label="Harga bahan baku"
          tone="deduction"
          value={`-${formatRupiah(bd.bomHpp)}`}
        />
      ) : null}
      {bd.storedHpp > 0 ? (
        <BreakdownAmountRow
          label={storedLabel}
          tone="deduction"
          value={`-${formatRupiah(bd.storedHpp)}`}
        />
      ) : null}
      {bd.packingHpp > 0 ? (
        <BreakdownAmountRow
          label="Harga packing"
          tone="deduction"
          value={`-${formatRupiah(bd.packingHpp)}`}
        />
      ) : null}
      {mode === 'internal' && bd.pmCostShare > 0 ? (
        <BreakdownAmountRow
          label="Biaya Payment Method"
          tone="deduction"
          value={`-${formatRupiah(bd.pmCostShare)}`}
        />
      ) : null}
      {mode === 'olshop' && bd.sourceFeeShare > 0 ? (
        <BreakdownAmountRow
          label="Biaya layanan (proporsional)"
          tone="deduction"
          value={`-${formatRupiah(bd.sourceFeeShare)}`}
        />
      ) : null}
      <BreakdownAmountRow
        label="Total sebelum komisi"
        value={formatRupiah(bd.commissionBaseBeforeCommission)}
      />
      {bd.commissionAmount > 0 ? (
        <BreakdownAmountRow
          label={commissionRuleLabel(bd.commissionRule)}
          tone="deduction"
          value={`-${formatRupiah(bd.commissionAmount)}`}
        />
      ) : null}
      <BreakdownAmountRow
        emphasis
        label="Profit Item"
        tone={bd.profitItem >= 0 ? 'profit' : 'deduction'}
        value={formatRupiah(bd.profitItem)}
      />
    </View>
  );
}

function BreakdownAmountRow({
  emphasis = false,
  label,
  tone = 'default',
  value,
}: {
  emphasis?: boolean;
  label: string;
  tone?: 'default' | 'muted' | 'deduction' | 'profit';
  value: string;
}) {
  const valueColor =
    tone === 'deduction'
      ? styles.breakdownDeduction
      : tone === 'profit'
        ? styles.breakdownProfit
        : tone === 'muted'
          ? styles.breakdownMuted
          : styles.breakdownValue;

  return (
    <View style={styles.breakdownRow}>
      <Text
        style={[
          styles.breakdownLabel,
          emphasis ? styles.breakdownLabelEmphasis : null,
        ]}
      >
        {label}
      </Text>
      {value ? (
        <Text
          style={[
            valueColor,
            emphasis ? styles.breakdownValueEmphasis : null,
          ]}
        >
          {value}
        </Text>
      ) : null}
    </View>
  );
}

function formatShortDateTime(value: string) {
  if (!value) {
    return '';
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

function historyTimelineDotStyle(status: string) {
  const intent = getKolamSalePaymentStatusIntent(status);
  if (intent === 'success') {
    return styles.historyTimelineDotSuccess;
  }
  if (intent === 'danger') {
    return styles.historyTimelineDotDanger;
  }
  if (intent === 'warning') {
    return styles.historyTimelineDotWarning;
  }
  return styles.historyTimelineDotSecondary;
}

const styles = StyleSheet.create({
  detailSurface: {
    gap: 14,
  },
  detailToolbarContext: {
    color: V.colors.fg,
    flexShrink: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    minWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  complaintBanner: {
    gap: 8,
    padding: 12,
  },
  complaintBannerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  complaintBannerCopy: {
    flex: 1,
    gap: 2,
  },
  complaintBannerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toolbarButton: {
    flexShrink: 0,
    minHeight: 34,
    paddingHorizontal: 10,
  },
  detailRoot: {
    flexGrow: 0,
  },
  detailContent: {
    alignItems: 'stretch',
    gap: 12,
    paddingBottom: 24,
  },
  detailMissing: {
    gap: 12,
    padding: 16,
  },
  detailHeader: {
    gap: 10,
  },
  detailTitle: {
    color: V.colors.fg,
    fontSize: 18,
    fontWeight: '800',
  },
  detailSubtitle: {
    color: V.colors.mutedFg,
    fontSize: 13,
  },
  warningHint: {
    color: V.colors.warning,
    fontSize: 12,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoNote: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  detailFrame: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  detailFrameRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailFrameMain: {
    flex: 2,
    flexBasis: 420,
    gap: 8,
    minWidth: 280,
    paddingRight: 16,
  },
  detailFrameSide: {
    borderLeftColor: V.colors.border,
    borderLeftWidth: StyleSheet.hairlineWidth,
    flex: 1,
    flexBasis: 280,
    gap: 10,
    minWidth: 240,
    paddingLeft: 16,
  },
  columns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  columnMain: {
    flex: 2,
    flexBasis: 420,
    gap: 10,
    minWidth: 280,
  },
  columnSide: {
    flex: 1,
    flexBasis: 280,
    gap: 10,
    minWidth: 240,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  paymentStatusTrigger: {
    minHeight: 30,
    minWidth: 190,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  deliveryStatusTrigger: {
    minHeight: 30,
    minWidth: 210,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  paymentStatusTriggerMuted: {
    opacity: 0.72,
  },
  paymentStatusTriggerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  paymentProofCard: {
    gap: 10,
  },
  paymentProofHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  paymentProofUploadButton: {
    backgroundColor: '#374151',
    borderColor: '#374151',
    flexShrink: 0,
  },
  paymentProofUploadButtonText: {
    color: V.colors.primaryFg,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemCard: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
    paddingVertical: 8,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 10,
  },
  itemThumb: {
    borderRadius: 6,
    height: 56,
    width: 56,
  },
  itemThumbPlaceholder: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderRadius: 6,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  itemThumbPlaceholderText: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  itemBody: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  breakdownCard: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    marginLeft: 66,
    marginTop: 8,
    overflow: 'hidden',
  },
  breakdownSection: {
    borderTopColor: V.colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  breakdownSectionFirst: {
    backgroundColor: V.colors.mutedSoft,
    borderTopWidth: 0,
  },
  breakdownSectionTitle: {
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  breakdownRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  breakdownLabel: {
    color: V.colors.mutedFg,
    flex: 1,
    fontSize: 12,
  },
  breakdownLabelEmphasis: {
    color: V.colors.fg,
    fontWeight: '600',
  },
  breakdownValue: {
    color: V.colors.fg,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  breakdownValueEmphasis: {
    fontWeight: '700',
  },
  breakdownMuted: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  breakdownDeduction: {
    color: V.colors.danger,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  breakdownProfit: {
    color: V.colors.success,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  totalsCard: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  internalSummaryCard: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  outstandingCard: {
    gap: 4,
    padding: 12,
  },
  relatedTxCard: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  relatedTxHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  relatedTxAmount: {
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  relatedTxFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relatedTxLink: {
    color: V.colors.success,
  },
  profitPositive: {
    color: V.colors.success,
  },
  profitNegative: {
    color: V.colors.danger,
  },
  proofRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingVertical: 8,
  },
  proofThumb: {
    borderRadius: 6,
    height: 72,
    width: 72,
  },
  proofMeta: {
    flex: 1,
    gap: 6,
    minWidth: 160,
  },
  shippingBlock: {
    gap: 10,
  },
  marketplaceFulfillmentActions: {
    gap: 10,
  },
  tokopediaDropOffRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dropOffLink: {
    color: V.colors.primary,
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  shippingField: {
    gap: 2,
  },
  shippingFieldLabel: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '600',
  },
  shippingFieldValue: {
    color: V.colors.fg,
    fontSize: 13,
    lineHeight: 18,
  },
  courierChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  courierChip: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  courierLogo: {
    height: 20,
    width: 20,
  },
  trackingMono: {
    fontFamily: 'Consolas',
    fontVariant: ['tabular-nums'],
  },
  historyScrollView: {
    maxHeight: 320,
  },
  historyScroll: {
    paddingBottom: 4,
    paddingTop: 2,
  },
  historyTimeline: {
    borderLeftColor: V.colors.border,
    borderLeftWidth: 2,
    gap: 14,
    paddingLeft: 12,
  },
  historyTimelineItem: {
    paddingLeft: 4,
    position: 'relative',
  },
  historyTimelineDot: {
    borderColor: V.colors.bg,
    borderRadius: 6,
    borderWidth: 2,
    height: 10,
    left: -18,
    position: 'absolute',
    top: 3,
    width: 10,
  },
  historyTimelineDotSuccess: {
    backgroundColor: V.colors.success,
  },
  historyTimelineDotDanger: {
    backgroundColor: V.colors.danger,
  },
  historyTimelineDotWarning: {
    backgroundColor: V.colors.warning,
  },
  historyTimelineDotSecondary: {
    backgroundColor: V.colors.mutedFg,
  },
  historyTimelineBody: {
    gap: 2,
  },
  historyTimelineTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
});
