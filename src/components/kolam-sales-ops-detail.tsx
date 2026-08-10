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
import {SvgXml} from 'react-native-svg';
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
  isKolamSaleShippingAutomationActive,
  kolamSaleSkipsShippingFlow,
  needsKolamTokopediaPickupRequest,
  shouldShowKolamTokopediaDropOffBadge,
  KOLAM_SALES_DISCOUNT_APPROVAL_ROUTE,
  KOLAM_SALES_ROOT,
  type KolamSale,
  type KolamSalePaymentStatus,
  type KolamSaleDeliveryTransitionTarget,
  type KolamSaleHistory,
  type KolamSaleItem,
  type KolamSaleLivestockAllocationRow,
  type KolamSaleSpeciesEnclosurePlacement,
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
import { getErrorMessage } from '../lib/api-error';
import { formatRupiah } from '../lib/money';
import type { KolamSalesController } from '../hooks/use-kolam-sales-controller';
import { getKolamSaleSpeciesEnclosureAllocation } from '../services/kolam-sales-api';
import { KolamButton } from './kolam-button';
import {KolamCancelButton} from './kolam-cancel-button';
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
import { KolamComplaintButton } from './kolam-complaint-button';
import {KolamDashboardHeaderActionIcon} from './kolam-dashboard-header-action-icon';
import { KolamDetailScrollSurface } from './kolam-detail-scroll-surface';
import { KolamDetailSummaryCard } from './kolam-detail-summary-card';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import {KolamKandangEnclosureIcon} from './kolam-kandang-enclosure-icon';
import { KolamModalDialog } from './kolam-modal-dialog';
import { KolamPdfDownloadButton } from './kolam-pdf-download-button';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamSaveButton } from './kolam-save-button';
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
  const biteshipWaybillItems = sale.items.filter(isKolamBiteshipCheckoutItem);
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
  const showDeliveryAutomationIcon =
    !skipShipping && isKolamSaleShippingAutomationActive(sale);
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
  const livestockPendingLabel =
    sale.openLivestockPendingCount > 0
      ? `${sale.openLivestockPendingCount} spesies perlu atur kandang`
      : '';

  return (
    <View style={styles.detailSurface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <View style={styles.detailToolbarTitleRow}>
              <Text numberOfLines={1} style={styles.detailToolbarContext}>
                {sale.invoiceCode}
              </Text>
              {livestockPendingLabel ? (
                <KolamStatusBadge
                  intent="warning"
                  label={livestockPendingLabel}
                  style={styles.detailToolbarBadge}
                />
              ) : null}
            </View>
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
                icon={
                  <KolamDashboardHeaderActionIcon
                    intent="primary"
                    kind="plus"
                  />
                }
                label="Tambah item"
                onPress={() =>
                  onRouteChange?.(
                    `${KOLAM_SALES_ROOT}/${sale.id}/edit?mode=add-items`,
                  )
                }
                style={[styles.toolbarButton, styles.toolbarDaftarToneButton]}
                textStyle={styles.toolbarDaftarToneButtonText}
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
              <KolamComplaintButton
                onPress={() => onRouteChange?.(complaintCreateRoute)}
                style={styles.toolbarButton}
              />
            ) : null}
          </View>
        </View>
      </View>

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
            <KolamComplaintButton
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
              icon={
                showDeliveryAutomationIcon ? (
                  <KolamSaleDeliveryRobotIcon />
                ) : undefined
              }
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
                          <React.Fragment key={courier.name}>
                            {logo ? (
                              <Image
                                accessibilityLabel={`Logo ${courier.name}`}
                                resizeMode="contain"
                                source={logo}
                                style={styles.courierLogo}
                              />
                            ) : (
                              <View style={styles.courierChip}>
                                <Text style={styles.shippingFieldValue}>
                                  {courier.name}
                                </Text>
                              </View>
                            )}
                          </React.Fragment>
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
                {saleTrackingNumber && biteshipWaybillItems.length === 0 ? (
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
                {biteshipWaybillItems.length > 0 ? (
                  <View style={styles.shippingField}>
                    <Text style={styles.shippingFieldLabel}>Nomor Resi</Text>
                    <View style={styles.biteshipWaybillList}>
                      {biteshipWaybillItems.map(item => (
                        <KolamBiteshipWaybillItem
                          disabled={
                            controller.mutating ||
                            sale.deliveryStatus === 'success'
                          }
                          item={item}
                          key={item.id}
                          onSave={waybillId =>
                            controller.onSetBiteshipWaybill(item.id, waybillId)
                          }
                          saleHistories={sale.saleHistories}
                          saleStatus={sale.status}
                        />
                      ))}
                    </View>
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
                    disabled={!tx.walletId}
                    onPress={() =>
                      tx.walletId
                        ? onRouteChange?.(
                            `/wallet/${encodeURIComponent(tx.walletId)}`,
                          )
                        : undefined
                    }
                    style={[
                      styles.relatedTxCard,
                      !tx.walletId && styles.relatedTxCardDisabled,
                    ]}
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

        </View>

        <View style={styles.columnSide}>
          {sale.saleHistories.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Riwayat Status</Text>
              <ScrollView
                contentContainerStyle={styles.historyScroll}
                nestedScrollEnabled
                style={[
                  styles.historyScrollView,
                  {
                    maxHeight: getSaleHistoryTimelineMaxHeight(
                      sale.saleHistories,
                    ),
                  },
                ]}
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

          <KolamSalesEnclosureAllocationPanel
            disabled={controller.mutating}
            onResolve={controller.onResolveLivestockAllocation}
            rows={controller.livestockAllocations}
          />

          <KolamSalesStockFlowCard
            onRouteChange={onRouteChange}
            sale={sale}
          />
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

function KolamSalesStockFlowCard({
  onRouteChange,
  sale,
}: {
  onRouteChange?: (route: string) => void;
  sale: KolamSale;
}) {
  return (
    <KolamCardFrame style={styles.fulfillmentCard} variant="compact">
      <Text style={styles.sectionTitle}>Alur Stok</Text>
      <Text style={styles.metaText}>
        Pergerakan stok terkait invoice ini (stok Kolam = acuan utama).
      </Text>
      {sale.stockTransactions.length > 0 ? (
        sale.stockTransactions.map(tx => (
          <Pressable
            accessibilityRole="button"
            key={tx.id}
            onPress={() => onRouteChange?.(`/stock-transaction/${tx.id}`)}
            style={styles.relatedTxCard}
          >
            <Text style={[styles.primaryText, styles.relatedTxLink]}>
              {stockTransactionSourceLabel(tx.source)} · {tx.type || '—'} · qty{' '}
              {tx.quantity}
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
        ))
      ) : (
        <Text style={styles.metaText}>Belum ada alur stok.</Text>
      )}
    </KolamCardFrame>
  );
}

type KolamSaleEnclosureAllocationDraftRow = {
  enclosureId: string;
  qty: number;
};

function KolamSalesEnclosureAllocationPanel({
  disabled,
  onResolve,
  rows,
}: {
  disabled: boolean;
  onResolve: (
    pendingId: string,
    allocations: { enclosureId: string; qty: number }[],
  ) => Promise<boolean>;
  rows: KolamSaleLivestockAllocationRow[];
}) {
  const [activePending, setActivePending] =
    useState<KolamSaleLivestockAllocationRow | null>(null);

  if (rows.length === 0) {
    return null;
  }

  return (
    <>
      <KolamCardFrame
        style={styles.fulfillmentCard}
        variant="compact"
      >
        <View style={styles.allocationHeader}>
          <View style={styles.allocationTitleRow}>
            <KolamKandangEnclosureIcon style={styles.allocationTitleIcon} />
            <Text style={styles.sectionTitle}>Alokasi enclosure</Text>
            <KolamStatusBadge
              intent="warning"
              label={livestockPendingBadgeLabel(rows.length)}
            />
          </View>
          <Text style={styles.metaText}>
            Tentukan kandang sumber untuk setiap species yang keluar dari
            penjualan ini.
          </Text>
        </View>
        <View style={styles.allocationList}>
          {rows.map(row => (
            <View key={row.id} style={styles.allocationRow}>
              <View style={styles.allocationBody}>
                <Text style={styles.primaryText}>
                  {row.speciesName || row.displayLine || row.label || 'Species'}
                  {row.variantLabel ? ` - ${row.variantLabel}` : ''}
                </Text>
                <Text style={styles.metaText}>
                  {row.qtyRemaining} {row.unitLabel || 'ekor'} menunggu alokasi
                  dari enclosure
                </Text>
              </View>
              <KolamButton
                disabled={disabled || !row.speciesId}
                label="Atur enclosure"
                onPress={() => setActivePending(row)}
              />
            </View>
          ))}
        </View>
      </KolamCardFrame>
      <KolamSalesEnclosureAllocationModal
        disabled={disabled}
        onClose={() => setActivePending(null)}
        onResolve={onResolve}
        pending={activePending}
      />
    </>
  );
}

function KolamSalesEnclosureAllocationModal({
  disabled,
  onClose,
  onResolve,
  pending,
}: {
  disabled: boolean;
  onClose: () => void;
  onResolve: (
    pendingId: string,
    allocations: { enclosureId: string; qty: number }[],
  ) => Promise<boolean>;
  pending: KolamSaleLivestockAllocationRow | null;
}) {
  const [placements, setPlacements] = useState<
    KolamSaleSpeciesEnclosurePlacement[]
  >([]);
  const [rows, setRows] = useState<KolamSaleEnclosureAllocationDraftRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const visible = Boolean(pending);

  React.useEffect(() => {
    if (!pending) {
      setPlacements([]);
      setRows([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    void getKolamSaleSpeciesEnclosureAllocation(pending.speciesId)
      .then(allocation => {
        if (cancelled) {
          return;
        }
        const options = allocation.placements.filter(placement => {
          if (!pending.variantId) {
            return !placement.variantId;
          }
          return placement.variantId === pending.variantId;
        });
        setPlacements(options);
        setRows([
          {
            enclosureId: options[0]?.enclosureId ?? '',
            qty: pending.qtyRemaining || 1,
          },
        ]);
      })
      .catch(loadError => {
        if (!cancelled) {
          setError(getErrorMessage(loadError));
          setPlacements([]);
          setRows([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pending]);

  const total = rows.reduce((sum, row) => sum + Math.max(0, row.qty), 0);
  const options = placements.map(placement => ({
    label: placement.label,
    value: placement.enclosureId,
  }));

  const updateRow = (
    index: number,
    patch: Partial<KolamSaleEnclosureAllocationDraftRow>,
  ) => {
    setRows(current =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    );
  };

  const addRow = () => {
    setRows(current => [
      ...current,
      { enclosureId: options[0]?.value ?? '', qty: 1 },
    ]);
  };

  const removeRow = (index: number) => {
    setRows(current =>
      current.length <= 1
        ? current
        : current.filter((_, rowIndex) => rowIndex !== index),
    );
  };

  const submit = async () => {
    if (!pending) {
      return;
    }
    const allocations = rows.filter(row => row.enclosureId && row.qty > 0);
    if (allocations.length === 0) {
      setError('Pilih minimal satu enclosure');
      return;
    }
    if (total !== pending.qtyRemaining) {
      setError(`Total alokasi harus ${pending.qtyRemaining}`);
      return;
    }
    setSubmitting(true);
    setError(null);
    const ok = await onResolve(pending.id, allocations);
    setSubmitting(false);
    if (ok) {
      onClose();
    }
  };

  return (
    <KolamModalDialog
      description={
        pending
          ? `${pending.speciesName || pending.displayLine || 'Species'} - ${
              pending.qtyRemaining
            } ${pending.unitLabel || 'ekor'} perlu dikurangi dari kandang.`
          : undefined
      }
      footer={
        <>
          <KolamCancelButton disabled={submitting} onPress={onClose} />
          <KolamSaveButton
            disabled={
              disabled || submitting || loading || options.length === 0
            }
            label={submitting ? 'Menyimpan...' : 'Simpan alokasi'}
            onPress={submit}
          />
        </>
      }
      maxHeight="84%"
      onClose={onClose}
      title="Alokasi sumber enclosure"
      visible={visible}
      width={720}
    >
      <ScrollView
        contentContainerStyle={styles.allocationModalBody}
        nestedScrollEnabled
      >
        {loading ? (
          <Text style={styles.metaText}>Memuat enclosure...</Text>
        ) : options.length === 0 ? (
          <Text style={styles.metaText}>
            Belum ada posisi di enclosure untuk species/variant ini. Tempatkan
            livestock dulu di halaman species atau enclosure.
          </Text>
        ) : (
          <View style={styles.allocationModalRows}>
            {rows.map((row, index) => (
              <View key={index} style={styles.allocationModalRow}>
                <KolamDropdownSelect
                  label="Enclosure"
                  onChange={value => updateRow(index, { enclosureId: value })}
                  options={options}
                  searchable
                  searchPlaceholder="Cari enclosure..."
                  showLabelInTrigger={index === 0}
                  style={styles.allocationModalSelect}
                  value={row.enclosureId || options[0].value}
                />
                <KolamFormTextField
                  mode="numeric"
                  onChangeText={value =>
                    updateRow(index, {
                      qty: Math.max(1, Number(value) || 1),
                    })
                  }
                  placeholder="Qty"
                  style={styles.allocationModalQty}
                  value={String(row.qty)}
                />
                <KolamDeleteButton
                  disabled={rows.length <= 1}
                  label="Hapus"
                  onPress={() => removeRow(index)}
                  style={styles.allocationModalDelete}
                />
              </View>
            ))}
            <View style={styles.allocationModalFooterRow}>
              <KolamButton label="Tambah baris" onPress={addRow} />
              <Text style={styles.metaText}>
                Total: {total} / {pending?.qtyRemaining ?? 0}
              </Text>
            </View>
          </View>
        )}
        {error ? <Text style={styles.allocationError}>{error}</Text> : null}
      </ScrollView>
    </KolamModalDialog>
  );
}

function livestockPendingBadgeLabel(count: number) {
  if (count <= 0) {
    return '';
  }
  return `${count} spesies perlu atur kandang`;
}

const KOLAM_SALE_DELIVERY_ROBOT_ICON_XML = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path fill="#0369A1" d="M11 2h2v3h3.5A3.5 3.5 0 0 1 20 8.5v7A3.5 3.5 0 0 1 16.5 19h-9A3.5 3.5 0 0 1 4 15.5v-7A3.5 3.5 0 0 1 7.5 5H11V2Zm-3.5 5A1.5 1.5 0 0 0 6 8.5v7A1.5 1.5 0 0 0 7.5 17h9a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 16.5 7h-9Zm1 4a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6.5-1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM9 14h6v2H9v-2Z"/>
  <path fill="#075985" d="M6.5 20h11a1 1 0 1 1 0 2h-11a1 1 0 1 1 0-2Z"/>
</svg>`;

function KolamSaleDeliveryRobotIcon() {
  return (
    <View
      accessibilityLabel="Automasi : On"
      accessibilityRole="image"
      style={styles.deliveryRobotIcon}
    >
      <SvgXml
        height="100%"
        width="100%"
        xml={KOLAM_SALE_DELIVERY_ROBOT_ICON_XML}
      />
    </View>
  );
}

function KolamBiteshipWaybillItem({
  disabled,
  item,
  onSave,
  saleHistories,
  saleStatus,
}: {
  disabled: boolean;
  item: KolamSaleItem;
  onSave: (waybillId: string) => Promise<boolean>;
  saleHistories: KolamSaleHistory[];
  saleStatus: string;
}) {
  const [waybill, setWaybill] = useState(item.biteshipWaybillId || '');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    setWaybill(item.biteshipWaybillId || '');
  }, [item.biteshipWaybillId]);

  const trimmedWaybill = waybill.trim();
  const deliveryStatus = item.itemDeliveryStatus || 'none';
  const booking = resolveKolamBiteshipItemBooking(
    item,
    saleStatus,
    saleHistories,
  );
  const inputDisabled = disabled || submitting || deliveryStatus === 'delivered';
  const saveDisabled =
    inputDisabled ||
    !trimmedWaybill ||
    trimmedWaybill === item.biteshipWaybillId;

  return (
    <View style={styles.biteshipWaybillCard}>
      <View style={styles.biteshipWaybillHeader}>
        <View style={styles.biteshipWaybillTitleRow}>
          <View style={styles.biteshipWaybillTitleBlock}>
            <Text numberOfLines={1} style={styles.primaryText}>
              {item.title}
            </Text>
            <Text style={styles.metaText}>
              Qty: {item.quantity}
              {item.biteshipCourierCode
                ? ` · ${item.biteshipCourierCode.toUpperCase()}`
                : ''}
            </Text>
          </View>
        </View>
        <KolamStatusBadge
          intent={
            deliveryStatus === 'delivered'
              ? 'success'
              : deliveryStatus === 'on_delivery'
                ? 'warning'
                : 'muted'
          }
          label={
            deliveryStatus === 'delivered'
              ? 'Terkirim'
              : deliveryStatus === 'on_delivery'
                ? 'Dalam pengiriman'
                : 'Menunggu'
          }
        />
      </View>
      {booking?.orderId ? (
        <Text style={[styles.metaText, styles.trackingMono]}>
          Biteship Order ID: {booking.orderId}
        </Text>
      ) : null}
      {booking?.state === 'pending' ? (
        <Text style={styles.biteshipPendingText}>
          Booking Biteship sedang diproses...
        </Text>
      ) : null}
      {booking?.state === 'failed' ? (
        <Text style={styles.biteshipFailedText}>
          Booking Biteship gagal - masukkan resi manual di bawah.
          {booking.message ? ` (${booking.message})` : ''}
        </Text>
      ) : null}
      <View style={styles.biteshipWaybillInputRow}>
        <KolamFormTextField
          editable={!inputDisabled}
          onChangeText={setWaybill}
          placeholder="Masukkan nomor resi"
          style={styles.biteshipWaybillInput}
          value={waybill}
        />
        <KolamSaveButton
          disabled={saveDisabled}
          label={item.biteshipWaybillId ? 'Perbarui' : 'Simpan'}
          onPress={async () => {
            if (saveDisabled) {
              return;
            }
            setSubmitting(true);
            try {
              await onSave(trimmedWaybill);
            } finally {
              setSubmitting(false);
            }
          }}
          style={styles.biteshipWaybillSaveButton}
        />
      </View>
      {item.biteshipTrackingOrderStatus ? (
        <Text style={styles.metaText}>
          Status Biteship:{' '}
          <Text style={styles.primaryText}>
            {item.biteshipTrackingOrderStatus.toUpperCase()}
          </Text>
        </Text>
      ) : null}
    </View>
  );
}

function isKolamBiteshipCheckoutItem(item: KolamSaleItem) {
  return (
    item.shippingSource === 'biteship' ||
    Boolean(
      item.biteshipCourierCode.trim() && item.biteshipServiceCode.trim(),
    )
  );
}

function resolveKolamBiteshipItemBooking(
  item: KolamSaleItem,
  saleStatus: string,
  histories: KolamSaleHistory[],
): {
  message?: string;
  orderId?: string;
  state: 'booked' | 'pending' | 'failed';
} | null {
  if (!isKolamBiteshipCheckoutItem(item)) {
    return null;
  }
  if (item.biteshipWaybillId.trim()) {
    return { state: 'booked', orderId: item.biteshipOrderId || undefined };
  }
  if (saleStatus !== 'paid') {
    return null;
  }

  const failNote = [...histories].reverse().find(history => {
    const note = history.note || '';
    return (
      note.includes('Biteship auto-booking failed') ||
      note.includes(`skipped for item ${item.id}`)
    );
  })?.note;

  if (failNote) {
    return { state: 'failed', message: failNote };
  }

  return { state: 'pending' };
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

function getSaleHistoryTimelineMaxHeight(histories: KolamSaleHistory[]) {
  const estimatedHeight = histories.reduce((total, history) => {
    const noteLength = history.note?.trim().length ?? 0;
    const noteRows = noteLength > 96 ? 2 : noteLength > 0 ? 1 : 0;
    return total + 44 + noteRows * 18;
  }, 10);

  return Math.min(320, Math.max(90, estimatedHeight));
}

const styles = StyleSheet.create({
  detailSurface: {
    gap: 14,
  },
  detailToolbarTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    minHeight: 34,
    minWidth: 0,
  },
  detailToolbarContext: {
    color: V.colors.fg,
    flexShrink: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    minWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 0,
  },
  detailToolbarBadge: {
    alignSelf: 'center',
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
  toolbarDaftarToneButton: {
    backgroundColor: '#374151',
    borderColor: '#374151',
  },
  toolbarDaftarToneButtonText: {
    color: V.colors.primaryFg,
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
  fulfillmentCard: {
    gap: 8,
  },
  allocationHeader: {
    gap: 6,
  },
  allocationTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allocationTitleIcon: {
    height: 18,
    width: 18,
  },
  allocationList: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  allocationRow: {
    alignItems: 'center',
    borderTopColor: V.colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  allocationBody: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  allocationModalBody: {
    gap: 12,
    paddingBottom: 4,
  },
  allocationModalRows: {
    gap: 10,
  },
  allocationModalRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
  },
  allocationModalSelect: {
    flex: 1,
    minWidth: 260,
  },
  allocationModalQty: {
    width: 100,
  },
  allocationModalDelete: {
    flexShrink: 0,
  },
  allocationModalFooterRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  allocationError: {
    color: V.colors.danger,
    fontSize: 12,
    fontWeight: '700',
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
  deliveryRobotIcon: {
    height: 15,
    width: 15,
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
  relatedTxCardDisabled: {
    opacity: 0.7,
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
    height: 34,
    width: 78,
  },
  trackingMono: {
    fontFamily: 'Consolas',
    fontVariant: ['tabular-nums'],
  },
  biteshipWaybillList: {
    gap: 8,
  },
  biteshipWaybillCard: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 10,
  },
  biteshipWaybillHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  biteshipWaybillTitleRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    minWidth: 180,
  },
  biteshipWaybillTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  biteshipPendingText: {
    color: V.colors.warning,
    fontSize: 12,
    fontWeight: '600',
  },
  biteshipFailedText: {
    color: V.colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  biteshipWaybillInputRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  biteshipWaybillInput: {
    flex: 1,
    minWidth: 180,
  },
  biteshipWaybillSaveButton: {
    flexShrink: 0,
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
