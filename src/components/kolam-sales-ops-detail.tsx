import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  canAddItemsToKolamSale,
  canDownloadKolamSaleShippingResi,
  canShowKolamSaleEditAction,
  canUploadKolamSalePaymentProof,
  formatKolamSaleDeliveryStatusLabel,
  formatKolamSaleItemTypeLabel,
  formatKolamSalePaymentStatusLabel,
  getKolamNoShippingDeliveryLabel,
  getKolamSaleAllowedDeliveryTransitions,
  getKolamSaleAllowedStatusTransitions,
  getKolamSaleDeliveryStatusIntent,
  getKolamSaleOutstandingAmount,
  getKolamSalePaymentStatusIntent,
  isKolamPosSale,
  isKolamSaleMarketplaceManaged,
  kolamSaleSkipsShippingFlow,
  KOLAM_SALES_DISCOUNT_APPROVAL_ROUTE,
  KOLAM_SALES_ROOT,
  type KolamSale,
  type KolamSaleDeliveryTransitionTarget,
  type KolamSaleStatusTransitionTarget,
} from '../domain/kolam-sales';
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
                id: 'source',
                label: 'Sumber',
                value: sale.sourceRef?.name || '—',
                meta: sale.sourceRef?.type || '',
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

          {sale.sourceRef?.logoUri ? (
            <KolamRemoteImage
              accessibilityLabel={sale.sourceRef.name}
              resizeMode="contain"
              sourceUri={sale.sourceRef.logoUri}
              style={styles.sourceLogo}
            />
          ) : null}

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
            sale.items.map(item => (
              <View key={item.id} style={styles.itemCard}>
                <Text style={styles.primaryText}>{item.title}</Text>
                <Text style={styles.metaText}>
                  {formatKolamSaleItemTypeLabel(item.itemType)}
                  {item.variantLabel ? ` · ${item.variantLabel}` : ''}
                  {item.sku ? ` · ${item.sku}` : ''}
                </Text>
                <Text style={styles.metaText}>
                  {item.quantity} × {formatRupiah(item.unitPrice)} ={' '}
                  {formatRupiah(item.subtotal)}
                </Text>
                {item.discount ? (
                  <Text style={styles.metaText}>
                    Diskon:{' '}
                    {item.discount.type === 'percentage'
                      ? `${item.discount.amount}%`
                      : formatRupiah(item.discount.amount)}
                  </Text>
                ) : null}
                {item.voucherCode ? (
                  <Text style={styles.metaText}>
                    Voucher: {item.voucherCode}
                  </Text>
                ) : null}
                {item.shippingCost > 0 ? (
                  <Text style={styles.metaText}>
                    Ongkir item: {formatRupiah(item.shippingCost)}
                  </Text>
                ) : null}
              </View>
            ))
          )}

          <Text style={styles.sectionTitle}>Total</Text>
          <KolamDescriptionList
            accessibilityLabel="Total penjualan"
            rows={[
              {
                id: 'subtotal',
                label: 'Subtotal',
                value: formatRupiah(sale.total),
                meta: '',
                tone: 'default',
              },
              {
                id: 'shipping',
                label: 'Ongkir',
                value: formatRupiah(sale.shippingCost),
                meta: '',
                tone: 'default',
              },
              ...sale.customCosts.map((cost, index) => ({
                id: `custom-cost-${index}`,
                label: cost.name,
                value: formatRupiah(cost.amount),
                meta: '',
                tone: 'default' as const,
              })),
              {
                id: 'final',
                label: 'Total keseluruhan',
                value: formatRupiah(sale.finalTotal),
                meta: '',
                tone: 'success',
              },
              {
                id: 'paid',
                label: 'Sudah dibayar',
                value: formatRupiah(sale.paidAmount),
                meta: '',
                tone: 'default',
              },
            ]}
          />

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
        </View>

        <View style={styles.columnSide}>
          {!skipShipping ? (
            <>
              <Text style={styles.sectionTitle}>Informasi Pengiriman</Text>
              <KolamCardFrame style={styles.shippingCard} variant="compact">
                <KolamDescriptionList
                  accessibilityLabel="Informasi pengiriman"
                  rows={[
                    {
                      id: 'address',
                      label: 'Alamat',
                      value: sale.shippingAddressText || '—',
                      meta: '',
                      tone: 'default',
                    },
                    {
                      id: 'delivery-status',
                      label: 'Status kirim',
                      value: formatKolamSaleDeliveryStatusLabel(
                        sale.deliveryStatus,
                        sale.status,
                      ),
                      meta: '',
                      tone: 'default',
                    },
                    {
                      id: 'shipping-cost',
                      label: 'Total pengiriman',
                      value: formatRupiah(sale.shippingCost),
                      meta: '',
                      tone: 'default',
                    },
                  ]}
                />
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
              </KolamCardFrame>
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
  primaryText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  metaText: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  sourceLogo: {
    height: 36,
    width: 36,
  },
  outstandingCard: {
    gap: 4,
    padding: 12,
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
  shippingCard: {
    gap: 10,
    padding: 12,
  },
  historyRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
    paddingVertical: 8,
  },
});
