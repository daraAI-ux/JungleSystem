import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  canAddItemsToKolamSale,
  canDownloadKolamSaleShippingResi,
  canShowKolamSaleEditAction,
  canUploadKolamSalePaymentProof,
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
  getKolamSaleDeliveryStatusIntent,
  getKolamSaleItemDiscountAmount,
  getKolamSaleMarketplaceLogistics,
  getKolamSaleOutstandingAmount,
  getKolamSalePaymentStatusIntent,
  getKolamSaleServiceLabel,
  getKolamSaleTrackingNumber,
  getKolamSaleWalletConfirmStatusIntent,
  isKolamPosSale,
  isKolamSaleMarketplaceManaged,
  kolamSaleSkipsShippingFlow,
  KOLAM_SALES_DISCOUNT_APPROVAL_ROUTE,
  KOLAM_SALES_ROOT,
  type KolamSaleDeliveryTransitionTarget,
  type KolamSaleStatusTransitionTarget,
} from '../domain/kolam-sales';
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
import { KolamCardFrame } from './kolam-card-frame';
import { KolamConfirmDialog } from './kolam-confirm-dialog';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDescriptionList } from './kolam-description-list';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamStatusBadge } from './kolam-status-badge';

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
  const skipShipping = kolamSaleSkipsShippingFlow(sale);
  const posSale = isKolamPosSale(sale);
  const allowedTransitions = marketplaceManaged
    ? []
    : getKolamSaleAllowedStatusTransitions(sale.status);
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
  const showResi = !skipShipping && canDownloadKolamSaleShippingResi(sale);
  const outstanding = getKolamSaleOutstandingAmount(sale);
  const profitSummary = computeKolamSaleProfitSummary(sale);
  const profitByIndex = getKolamSaleItemProfitBreakdownMap(profitSummary);
  const showInternalSummary = profitSummary.itemBreakdowns.length > 0;
  const saleCouriers = getKolamSaleCouriers(sale);
  const saleServiceLabel = getKolamSaleServiceLabel(sale);
  const saleTrackingNumber = getKolamSaleTrackingNumber(sale);
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
  const buyerPhone = sale.customer?.phone || sale.buyerInfo?.phone || '';
  const buyerEmail = sale.customer?.email || sale.buyerInfo?.email || '';

  return (
    <ScrollView
      contentContainerStyle={styles.detailContent}
      style={styles.detailRoot}
    >
      <View style={styles.detailHeader}>
        <KolamCopyStack
          items={[
            {
              id: 'title',
              text: sale.invoiceCode,
              style: styles.detailTitle,
            },
            {
              id: 'buyer',
              text: sale.buyerLabel,
              style: styles.detailSubtitle,
            },
            ...(sale.openLivestockPendingCount > 0
              ? [
                  {
                    id: 'livestock',
                    text: `${sale.openLivestockPendingCount} species perlu atur enclosure`,
                    style: styles.warningHint,
                  },
                ]
              : []),
          ]}
        />
        <View style={styles.headerActions}>
          <KolamButton
            label="Kembali"
            onPress={() => onRouteChange?.(KOLAM_SALES_ROOT)}
          />
          <KolamButton
            disabled={controller.loading || controller.mutating}
            label="Refresh"
            onPress={() => {
              void controller.onRefresh();
            }}
          />
          {canShowKolamSaleEditAction(sale) ? (
            <KolamButton
              label="Ubah"
              onPress={() =>
                onRouteChange?.(`${KOLAM_SALES_ROOT}/${sale.id}/edit`)
              }
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
            />
          ) : null}
          <KolamButton
            disabled={controller.downloadingInvoice || controller.mutating}
            intent="primary"
            label={
              controller.downloadingInvoice
                ? 'Mengunduh…'
                : 'Unduh invoice PDF'
            }
            onPress={() => {
              void controller.onDownloadInvoice();
            }}
          />
          {showResi ? (
            <KolamButton
              disabled={controller.downloadingInvoice || controller.mutating}
              label={
                controller.downloadingInvoice ? 'Mengunduh…' : 'Unduh resi'
              }
              onPress={() => {
                void controller.onDownloadResi();
              }}
            />
          ) : null}
        </View>
      </View>

      <KolamCardFrame style={styles.stripCard} variant="compact">
        <View style={styles.stripRow}>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>Pembayaran</Text>
            <KolamStatusBadge
              intent={getKolamSalePaymentStatusIntent(sale.status)}
              label={formatKolamSalePaymentStatusLabel(sale.status)}
            />
          </View>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>
              {skipShipping ? (posSale ? 'POS' : 'Layanan') : 'Pengiriman'}
            </Text>
            <KolamStatusBadge
              intent={
                sale.status === 'cancelled'
                  ? 'danger'
                  : skipShipping
                    ? 'info'
                    : getKolamSaleDeliveryStatusIntent(
                        sale.deliveryStatus,
                        sale.status,
                      )
              }
              label={
                sale.status === 'cancelled'
                  ? 'Dibatalkan'
                  : skipShipping
                    ? getKolamNoShippingDeliveryLabel(sale)
                    : formatKolamSaleDeliveryStatusLabel(
                        sale.deliveryStatus,
                        sale.status,
                      )
              }
            />
          </View>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>Total</Text>
            <Text style={styles.stripValue}>
              {formatRupiah(sale.finalTotal)}
            </Text>
          </View>
          {!marketplaceManaged && sale.pointsEarned > 0 ? (
            <View style={styles.stripItem}>
              <Text style={styles.stripLabel}>Poin</Text>
              <Text style={styles.stripValue}>
                {sale.pointsEarned.toLocaleString('id-ID')}
              </Text>
            </View>
          ) : null}
          {marketplaceManaged && sale.marketplaceOrderId ? (
            <View style={styles.stripItem}>
              <Text style={styles.stripLabel}>Order ID</Text>
              <Text style={styles.stripValue}>{sale.marketplaceOrderId}</Text>
            </View>
          ) : null}
          {sale.sourceRef?.logoUri || sale.sourceRef?.name ? (
            <View style={styles.stripItem}>
              <Text style={styles.stripLabel}>Sumber</Text>
              {sale.sourceRef.logoUri ? (
                <KolamRemoteImage
                  accessibilityLabel={sale.sourceRef.name || 'Sumber penjualan'}
                  resizeMode="contain"
                  sourceUri={sale.sourceRef.logoUri}
                  style={styles.stripSourceLogo}
                />
              ) : (
                <Text style={styles.stripValue}>{sale.sourceRef.name}</Text>
              )}
            </View>
          ) : null}
        </View>
      </KolamCardFrame>

      {skipShipping ? (
        <Text style={styles.infoNote}>
          {posSale
            ? 'Penjualan POS — tanpa alur pengiriman.'
            : 'Penjualan layanan saja — tanpa alur pengiriman.'}
        </Text>
      ) : null}

      <View style={styles.columns}>
        <View style={styles.columnMain}>
          <Text style={styles.sectionTitle}>Informasi Transaksi</Text>
          <KolamDescriptionList
            accessibilityLabel="Informasi transaksi"
            rows={[
              {
                id: 'buyer',
                label: sale.buyerInfo && !sale.customer ? 'Pembeli eksternal' : 'Pelanggan',
                value: sale.buyerLabel,
                meta: [buyerPhone, buyerEmail].filter(Boolean).join(' · '),
                tone: 'default',
              },
              {
                id: 'pic',
                label: 'PIC',
                value: sale.createdByName || '—',
                meta: '',
                tone: 'default',
              },
              {
                id: 'payment-method',
                label: 'Metode bayar',
                value: sale.paymentMethod?.name || '—',
                meta: sale.paymentMethod?.type || '',
                tone: 'default',
              },
              {
                id: 'created',
                label: 'Dibuat',
                value: formatShortDateTime(sale.createdAt) || '—',
                meta: '',
                tone: 'default',
              },
              {
                id: 'transaction',
                label: 'Tanggal transaksi',
                value: formatShortDateTime(sale.transactionDate) || '—',
                meta: '',
                tone: 'default',
              },
              ...(sale.discountType
                ? [
                    {
                      id: 'discount-type',
                      label: 'Tipe diskon',
                      value: sale.discountType,
                      meta: '',
                      tone: 'default' as const,
                    },
                  ]
                : []),
              ...(sale.notes
                ? [
                    {
                      id: 'notes',
                      label: 'Catatan',
                      value: sale.notes,
                      meta: '',
                      tone: 'default' as const,
                    },
                  ]
                : []),
            ]}
          />

          <Text style={styles.sectionTitle}>Aksi status</Text>
          {marketplaceManaged ? (
            <Text style={styles.metaText}>
              Status pembayaran marketplace dikelola otomatis dari platform.
            </Text>
          ) : allowedTransitions.length === 0 ? (
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
          ) : (
            <View style={styles.actionButtons}>
              {allowedTransitions.map(status => (
                <KolamButton
                  disabled={controller.mutating}
                  intent={status === 'cancelled' ? 'danger' : 'primary'}
                  key={status}
                  label={formatKolamSalePaymentStatusLabel(status)}
                  onPress={() => setPendingStatus(status)}
                />
              ))}
            </View>
          )}

          <Text style={styles.sectionTitle}>Detail Item Penjualan</Text>
          {sale.items.length === 0 ? (
            <Text style={styles.metaText}>Tidak ada item.</Text>
          ) : (
            sale.items.map((item, index) => {
              const lineTotal = item.unitPrice * item.quantity;
              const discountAmount = getKolamSaleItemDiscountAmount(item);
              const packingClientTotal = item.packings.reduce(
                (sum, packing) =>
                  sum + packing.unitPriceAtSale * packing.quantity,
                0,
              );
              const clientPay =
                item.subtotal +
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
                      {item.voucherCode ? (
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

          <Text style={styles.sectionTitle}>
            Bukti pembayaran ({sale.paymentProofs.length})
          </Text>
          {canUploadProof ? (
            <KolamButton
              disabled={controller.mutating}
              intent="primary"
              label="Unggah bukti"
              onPress={() => {
                void controller.onUploadPaymentProof();
              }}
            />
          ) : null}
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
                        onPress={() => {
                          void controller.onReplacePaymentProof(proof.id);
                        }}
                      />
                      <KolamButton
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
          {!skipShipping ? (
            <>
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
                {marketplaceLogistics ? (
                  <View style={styles.logisticsBlock}>
                    <Text style={styles.shippingFieldLabel}>
                      Perjalanan paket ({logisticsPlatformLabel})
                    </Text>
                    {marketplaceLogistics.lastUpdate &&
                    marketplaceLogistics.timeline.length === 0 ? (
                      <Text style={styles.shippingFieldValue}>
                        {marketplaceLogistics.lastUpdate}
                      </Text>
                    ) : (
                      marketplaceLogistics.timeline.map((entry, index) => {
                        const timeLabel = formatKolamSaleLogisticsTime(entry.at);
                        return (
                          <View
                            key={`${entry.message}-${entry.at || index}`}
                            style={styles.logisticsEntry}
                          >
                            <Text style={styles.shippingFieldValue}>
                              {entry.message}
                            </Text>
                            {timeLabel ? (
                              <Text style={styles.metaText}>{timeLabel}</Text>
                            ) : null}
                          </View>
                        );
                      })
                    )}
                  </View>
                ) : null}
                {showDeliveryActions ? (
                  <>
                    {allowedDeliveryTransitions.length === 0 ? (
                      <Text style={styles.metaText}>
                        Tidak ada transisi pengiriman yang tersedia.
                      </Text>
                    ) : (
                      <View style={styles.actionButtons}>
                        {allowedDeliveryTransitions.map(target => (
                          <KolamButton
                            disabled={controller.mutating}
                            intent="primary"
                            key={target}
                            label={formatKolamSaleDeliveryStatusLabel(
                              target,
                              sale.status,
                            )}
                            onPress={() => setPendingDelivery(target)}
                          />
                        ))}
                      </View>
                    )}
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
                  <Text style={styles.metaText}>
                    Pengiriman marketplace dikelola otomatis dari platform.
                  </Text>
                ) : sale.status !== 'paid' && sale.status !== 'partial_paid' ? (
                  <Text style={styles.metaText}>
                    Transisi pengiriman tersedia setelah status Lunas.
                  </Text>
                ) : null}
              </View>
            </>
          ) : null}

          {controller.livestockAllocations.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Alokasi enclosure</Text>
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
              {sale.saleHistories.map(history => (
                <View key={history.id} style={styles.historyRow}>
                  <Text style={styles.primaryText}>
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
              ))}
            </>
          ) : null}
        </View>
      </View>

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
            ? formatKolamSaleDeliveryStatusLabel(pendingDelivery, sale.status)
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
    </ScrollView>
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

const styles = StyleSheet.create({
  detailRoot: {
    flex: 1,
    minHeight: 0,
  },
  detailContent: {
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
  stripCard: {
    padding: 12,
  },
  stripRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  stripItem: {
    gap: 4,
    minWidth: 120,
  },
  stripLabel: {
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  stripValue: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '700',
  },
  infoNote: {
    color: V.colors.mutedFg,
    fontSize: 12,
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
  stripSourceLogo: {
    height: 28,
    width: 28,
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
  logisticsBlock: {
    borderTopColor: V.colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
    marginTop: 4,
    paddingTop: 10,
  },
  logisticsEntry: {
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  historyRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
    paddingVertical: 8,
  },
});
