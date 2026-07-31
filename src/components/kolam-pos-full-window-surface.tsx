import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import type {
  CartLine,
  CatalogItem,
  CatalogItemType,
  CheckoutState,
  Customer,
  PaymentMethod,
  SaleSummary,
} from '../domain/pos';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {formatRupiah} from '../lib/money';
import {KolamButton} from './kolam-button';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {KolamQuantityStepper} from './kolam-quantity-stepper';
import {KolamSearchField} from './kolam-search-field';

export interface KolamPosFullWindowSurfaceProps {
  activeType: CatalogItemType | 'all';
  afterDiscount: number;
  canCreateDraft: boolean;
  catalog: CatalogItem[];
  catalogSearch: string;
  checkout: CheckoutState;
  customers: Customer[];
  filteredCatalog: CatalogItem[];
  finalTotal: number;
  isCreatingSale: boolean;
  onAddToCart: (item: CatalogItem) => void;
  onBackToCenter: () => void;
  onCatalogSearchChange: (query: string) => void;
  onClearCart: () => void;
  onCreateSaleDraft: () => void;
  onGlobalDiscountChange: (value: string) => void;
  onGlobalDiscountTypeChange: (discountType: CheckoutState['globalDiscountType']) => void;
  onQuantityChange: (itemId: string, nextQuantity: number) => void;
  onSelectCustomer: (customerId: string) => void;
  onSelectPaymentMethod: (methodId: string) => void;
  onShippingCostChange: (value: string) => void;
  onTypeChange: (type: CatalogItemType | 'all') => void;
  paymentMethods: PaymentMethod[];
  recentSales: SaleSummary[];
  selectedCustomer?: Customer;
  selectedPayment?: PaymentMethod;
  subtotal: number;
}

type PosWindowView = 'catalog' | 'customers' | 'sales' | 'cashflow';

export function KolamPosFullWindowSurface({
  activeType,
  afterDiscount,
  canCreateDraft,
  catalog,
  catalogSearch,
  checkout,
  customers,
  filteredCatalog,
  finalTotal,
  isCreatingSale,
  onAddToCart,
  onBackToCenter,
  onCatalogSearchChange,
  onClearCart,
  onCreateSaleDraft,
  onGlobalDiscountChange,
  onGlobalDiscountTypeChange,
  onQuantityChange,
  onSelectCustomer,
  onSelectPaymentMethod,
  onShippingCostChange,
  onTypeChange,
  paymentMethods,
  recentSales,
  selectedCustomer,
  selectedPayment,
  subtotal,
}: KolamPosFullWindowSurfaceProps) {
  const {width} = useWindowDimensions();
  const [activeView, setActiveView] = React.useState<PosWindowView>('catalog');
  const columnCount = getCatalogColumnCount(width);
  const catalogRows = chunkCatalog(filteredCatalog, columnCount);
  const cartCount = checkout.cart.reduce(
    (total, line) => total + line.quantity,
    0,
  );
  const isCatalogView = activeView === 'catalog';

  return (
    <View style={styles.surface}>
      <View style={styles.catalogPane}>
        <View style={styles.topBar}>
          <View style={styles.segmentRail}>
            <PosSegment
              active={isCatalogView && activeType !== 'species'}
              label="Produk"
              onPress={() => {
                setActiveView('catalog');
                onTypeChange('product');
              }}
            />
            <PosSegment
              active={isCatalogView && activeType === 'species'}
              label="Spesies"
              onPress={() => {
                setActiveView('catalog');
                onTypeChange('species');
              }}
            />
            <View style={styles.segmentDivider} />
            <PosSegment
              active={activeView === 'customers'}
              label="Pelanggan"
              onPress={() => setActiveView('customers')}
            />
            <PosSegment
              active={activeView === 'sales'}
              label="Penjualan"
              onPress={() => setActiveView('sales')}
            />
            <PosSegment
              active={activeView === 'cashflow'}
              label="Kas"
              onPress={() => setActiveView('cashflow')}
            />
          </View>
          {isCatalogView ? (
            <KolamSearchField
              value={catalogSearch}
              onChangeText={onCatalogSearchChange}
              placeholder="Cari... (F1)"
              containerStyle={styles.search}
            />
          ) : null}
          <Text style={styles.countText}>
            {getPosViewCountText({
              activeType,
              activeView,
              catalog,
              customers,
              filteredCatalog,
              recentSales,
            })}
          </Text>
          <KolamButton
            label="Kembali"
            intent="outline"
            size="sm"
            onPress={onBackToCenter}
          />
        </View>

        {isCatalogView ? (
          <>
            <View style={styles.categoryBar}>
              <PosCategoryPill
                active={activeType === 'all'}
                label="Semua"
                onPress={() => onTypeChange('all')}
              />
              <PosCategoryPill
                active={activeType === 'product'}
                label="Produk"
                onPress={() => onTypeChange('product')}
              />
              <PosCategoryPill
                active={activeType === 'species'}
                label="Spesies"
                onPress={() => onTypeChange('species')}
              />
              {catalogSearch ? (
                <KolamButton
                  label="Hapus Filter"
                  intent="plain"
                  onPress={() => {
                    onCatalogSearchChange('');
                    onTypeChange('all');
                  }}
                />
              ) : null}
            </View>

            <ScrollView
              style={styles.catalogScroll}
              contentContainerStyle={styles.catalogContent}
              showsVerticalScrollIndicator>
              {catalogRows.length ? (
                catalogRows.map((row, rowIndex) => (
                  <View key={`row-${rowIndex}`} style={styles.catalogRow}>
                    {row.map(item => (
                      <PosCatalogCard
                        key={item.id}
                        cartLine={checkout.cart.find(
                          line => line.itemId === item.id,
                        )}
                        item={item}
                        onAddToCart={onAddToCart}
                      />
                    ))}
                    {Array.from({length: columnCount - row.length}).map(
                      (_, index) => (
                        <View key={`empty-${index}`} style={styles.cardSlot} />
                      ),
                    )}
                  </View>
                ))
              ) : (
                <View style={styles.catalogEmpty}>
                  <Text style={styles.emptyTitle}>Tidak ada item yang cocok.</Text>
                  <Text style={styles.emptyText}>
                    Coba hapus filter atau kata kunci.
                  </Text>
                </View>
              )}
            </ScrollView>
          </>
        ) : (
          <PosSubview
            activeView={activeView}
            customers={customers}
            paymentMethods={paymentMethods}
            recentSales={recentSales}
            selectedCustomerId={checkout.customerId}
            selectedPaymentId={checkout.paymentMethodId}
            onSelectCustomer={onSelectCustomer}
            onSelectPaymentMethod={onSelectPaymentMethod}
          />
        )}
      </View>

      <View style={styles.orderPane}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderTitle}>Pesanan</Text>
          <Text style={styles.orderBadge}>{checkout.cart.length} barang</Text>
        </View>
        <SelectorBlock
          label="Pelanggan"
          emptyLabel="Pilih pelanggan"
          items={customers}
          selectedId={checkout.customerId}
          getLabel={customer => customer.name}
          onSelect={onSelectCustomer}
        />
        <SelectorBlock
          label="Metode Pembayaran"
          emptyLabel="Pilih metode"
          items={paymentMethods.filter(method => method.active)}
          selectedId={checkout.paymentMethodId}
          getLabel={method => method.name}
          onSelect={onSelectPaymentMethod}
        />

        {checkout.cart.length ? (
          <ScrollView style={styles.orderList}>
            {checkout.cart.map(line => (
              <PosOrderRow
                key={line.itemId}
                catalog={catalog}
                line={line}
                onQuantityChange={onQuantityChange}
              />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.orderEmpty}>
            <Text style={styles.emptyTitle}>Belum ada pesanan</Text>
            <Text style={styles.emptyText}>Pilih produk atau spesies dari katalog.</Text>
          </View>
        )}

        {checkout.cart.length ? (
          <View style={styles.orderFooter}>
            <View style={styles.adjustmentRow}>
              <Text style={styles.adjustmentLabel}>Diskon</Text>
              <View style={styles.discountToggle}>
                <PosTinyToggle
                  active={checkout.globalDiscountType === 'fixed'}
                  label="Rp"
                  onPress={() => onGlobalDiscountTypeChange('fixed')}
                />
                <PosTinyToggle
                  active={checkout.globalDiscountType === 'percentage'}
                  label="%"
                  onPress={() => onGlobalDiscountTypeChange('percentage')}
                />
              </View>
              <TextInput
                keyboardType="numeric"
                onChangeText={onGlobalDiscountChange}
                placeholder="0"
                style={styles.adjustmentInput}
                value={checkout.globalDiscount ? String(checkout.globalDiscount) : ''}
              />
            </View>
            <View style={styles.adjustmentRow}>
              <Text style={styles.adjustmentLabel}>Ongkir</Text>
              <TextInput
                keyboardType="numeric"
                onChangeText={onShippingCostChange}
                placeholder="0"
                style={[styles.adjustmentInput, styles.shippingInput]}
                value={checkout.shippingCost ? String(checkout.shippingCost) : ''}
              />
            </View>
            <SummaryLine label="Subtotal" value={formatRupiah(subtotal)} />
            {subtotal - afterDiscount > 0 ? (
              <SummaryLine
                danger
                label="Diskon"
                value={`-${formatRupiah(subtotal - afterDiscount)}`}
              />
            ) : null}
            {checkout.shippingCost > 0 ? (
              <SummaryLine label="Ongkir" value={formatRupiah(checkout.shippingCost)} />
            ) : null}
            {!selectedCustomer ? (
              <Text style={styles.validationText}>Pilih pelanggan</Text>
            ) : null}
            {!selectedPayment ? (
              <Text style={styles.validationText}>Pilih metode pembayaran</Text>
            ) : null}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatRupiah(finalTotal)}</Text>
            </View>
            <KolamButton
              label={
                isCreatingSale
                  ? 'Memproses...'
                  : `Bayar ${canCreateDraft ? formatRupiah(finalTotal) : ''}`
              }
              intent="primary"
              size="md"
              disabled={!canCreateDraft || isCreatingSale}
              onPress={onCreateSaleDraft}
              style={styles.payButton}
            />
            <KolamButton
              label={`Kosongkan (${cartCount})`}
              intent="plain"
              onPress={onClearCart}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function PosSegment({
  active = false,
  label,
  onPress,
}: {
  active?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <KolamInteractionFrame
      onPress={onPress}
      style={[styles.segment, active && styles.segmentActive]}>
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
        {label}
      </Text>
    </KolamInteractionFrame>
  );
}

function PosCategoryPill({
  active = false,
  label,
  onPress,
}: {
  active?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <KolamInteractionFrame
      onPress={onPress}
      style={[styles.categoryPill, active && styles.categoryPillActive]}>
      <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
        {label}
      </Text>
    </KolamInteractionFrame>
  );
}

function PosCatalogCard({
  cartLine,
  item,
  onAddToCart,
}: {
  cartLine?: CartLine;
  item: CatalogItem;
  onAddToCart: (item: CatalogItem) => void;
}) {
  const isOutOfStock = item.stock <= 0;
  const isLowStock = item.stock > 0 && item.stock <= item.lowStockThreshold;
  const isInCart = !!cartLine;

  return (
    <View style={styles.cardSlot}>
      <View style={[styles.productCard, isInCart && styles.productCardActive]}>
        <View style={styles.productImage}>
          <Text style={styles.productImageIcon}>{item.type === 'species' ? 'S' : 'P'}</Text>
          <Text numberOfLines={2} style={styles.productImageName}>
            {item.name}
          </Text>
          {isOutOfStock || isLowStock ? (
            <Text style={[styles.stockBadge, isOutOfStock && styles.stockBadgeDanger]}>
              {isOutOfStock ? 'Habis' : `Sisa ${item.stock}`}
            </Text>
          ) : null}
          {isInCart ? <Text style={styles.inCartBadge}>OK</Text> : null}
        </View>
        <View style={styles.productCopy}>
          <Text numberOfLines={1} style={styles.skuText}>
            {item.code}
          </Text>
          <Text numberOfLines={2} style={styles.productName}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>{formatRupiah(item.price)}</Text>
          <Text style={styles.productMeta}>Stok {item.stock}</Text>
          <KolamInteractionFrame
            disabled={isOutOfStock}
            onPress={() => onAddToCart(item)}
            style={[
              styles.addButton,
              isInCart && styles.addButtonActive,
              isOutOfStock && styles.addButtonDisabled,
            ]}>
            <Text style={styles.addButtonText}>
              {isInCart ? 'Sudah' : isOutOfStock ? 'Habis' : 'Tambah'}
            </Text>
          </KolamInteractionFrame>
        </View>
      </View>
    </View>
  );
}

function SelectorBlock<T extends {id: string}>({
  emptyLabel,
  getLabel,
  items,
  label,
  onSelect,
  selectedId,
}: {
  emptyLabel: string;
  getLabel: (item: T) => string;
  items: T[];
  label: string;
  onSelect: (id: string) => void;
  selectedId: string;
}) {
  return (
    <View style={styles.selectorBlock}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {items.length ? (
          items.slice(0, 8).map(item => {
            const active = selectedId === item.id;
            return (
              <KolamInteractionFrame
                key={item.id}
                onPress={() => onSelect(item.id)}
                style={[styles.selectorChip, active && styles.selectorChipActive]}>
                <Text
                  numberOfLines={1}
                  style={[styles.selectorText, active && styles.selectorTextActive]}>
                  {getLabel(item)}
                </Text>
              </KolamInteractionFrame>
            );
          })
        ) : (
          <Text style={styles.selectorEmpty}>{emptyLabel}</Text>
        )}
      </ScrollView>
    </View>
  );
}

function PosOrderRow({
  catalog,
  line,
  onQuantityChange,
}: {
  catalog: CatalogItem[];
  line: CartLine;
  onQuantityChange: (itemId: string, nextQuantity: number) => void;
}) {
  const item = catalog.find(catalogItem => catalogItem.id === line.itemId);

  if (!item) {
    return null;
  }

  return (
    <View style={styles.orderRow}>
      <View style={styles.orderThumb}>
        <Text style={styles.orderThumbText}>{item.type === 'species' ? 'S' : 'P'}</Text>
      </View>
      <View style={styles.orderCopy}>
        <Text numberOfLines={2} style={styles.orderName}>
          {item.name}
        </Text>
        <Text style={styles.orderMeta}>{formatRupiah(item.price)}</Text>
        <Text style={styles.orderMeta}>
          {formatRupiah(item.price * line.quantity)}
        </Text>
      </View>
      <KolamQuantityStepper
        quantity={line.quantity}
        onDecrement={() => onQuantityChange(line.itemId, line.quantity - 1)}
        onIncrement={() =>
          onQuantityChange(line.itemId, Math.min(item.stock, line.quantity + 1))
        }
      />
    </View>
  );
}

function PosTinyToggle({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <KolamInteractionFrame
      onPress={onPress}
      style={[styles.tinyToggle, active && styles.tinyToggleActive]}>
      <Text style={[styles.tinyToggleText, active && styles.tinyToggleTextActive]}>
        {label}
      </Text>
    </KolamInteractionFrame>
  );
}

function SummaryLine({
  danger = false,
  label,
  value,
}: {
  danger?: boolean;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.summaryLine}>
      <Text style={[styles.summaryLabel, danger && styles.summaryDanger]}>
        {label}
      </Text>
      <Text style={[styles.summaryValue, danger && styles.summaryDanger]}>
        {value}
      </Text>
    </View>
  );
}

function PosSubview({
  activeView,
  customers,
  paymentMethods,
  recentSales,
  selectedCustomerId,
  selectedPaymentId,
  onSelectCustomer,
  onSelectPaymentMethod,
}: {
  activeView: Exclude<PosWindowView, 'catalog'>;
  customers: Customer[];
  paymentMethods: PaymentMethod[];
  recentSales: SaleSummary[];
  selectedCustomerId: string;
  selectedPaymentId: string;
  onSelectCustomer: (customerId: string) => void;
  onSelectPaymentMethod: (methodId: string) => void;
}) {
  if (activeView === 'customers') {
    return (
      <ScrollView
        style={styles.subviewScroll}
        contentContainerStyle={styles.subviewContent}>
        <View style={styles.subviewHeader}>
          <Text style={styles.subviewTitle}>Pelanggan</Text>
          <Text style={styles.subviewMeta}>
            Pilih pelanggan untuk pesanan aktif.
          </Text>
        </View>
        <View style={styles.subviewGrid}>
          {customers.map(customer => {
            const active = selectedCustomerId === customer.id;

            return (
              <KolamInteractionFrame
                key={customer.id}
                onPress={() => onSelectCustomer(customer.id)}
                style={[styles.customerCard, active && styles.customerCardActive]}>
                <View style={styles.customerAvatar}>
                  <Text style={styles.customerAvatarText}>
                    {getInitials(customer.name)}
                  </Text>
                </View>
                <View style={styles.customerCardCopy}>
                  <Text numberOfLines={1} style={styles.customerName}>
                    {customer.name}
                  </Text>
                  <Text numberOfLines={1} style={styles.customerDetail}>
                    {customer.phone || customer.email || '-'}
                  </Text>
                  <Text numberOfLines={2} style={styles.customerDetail}>
                    {customer.address || '-'}
                  </Text>
                </View>
                {active ? <Text style={styles.selectedMark}>Dipilih</Text> : null}
              </KolamInteractionFrame>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  if (activeView === 'sales') {
    return (
      <ScrollView
        style={styles.subviewScroll}
        contentContainerStyle={styles.subviewContent}>
        <View style={styles.subviewHeader}>
          <Text style={styles.subviewTitle}>Penjualan</Text>
          <Text style={styles.subviewMeta}>
            Ringkasan transaksi terbaru POS.
          </Text>
        </View>
        {recentSales.length ? (
          <View style={styles.saleList}>
            {recentSales.map(sale => (
              <View key={sale.id} style={styles.saleRow}>
                <View style={styles.saleCopy}>
                  <Text style={styles.saleInvoice}>{sale.invoiceCode}</Text>
                  <Text numberOfLines={1} style={styles.saleMeta}>
                    {sale.customerName} | {formatPosDate(sale.createdAt)}
                  </Text>
                </View>
                <View style={styles.saleAmountBox}>
                  <Text style={styles.saleAmount}>{formatRupiah(sale.total)}</Text>
                  <Text style={styles.saleStatus}>{sale.status}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.catalogEmpty}>
            <Text style={styles.emptyTitle}>Belum ada penjualan.</Text>
            <Text style={styles.emptyText}>
              Transaksi yang dibuat dari POS akan muncul di sini.
            </Text>
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.subviewScroll}
      contentContainerStyle={styles.subviewContent}>
      <View style={styles.subviewHeader}>
        <Text style={styles.subviewTitle}>Kas</Text>
        <Text style={styles.subviewMeta}>
          Metode pembayaran aktif untuk checkout POS.
        </Text>
      </View>
      <View style={styles.paymentGrid}>
        {paymentMethods.map(method => {
          const active = selectedPaymentId === method.id;

          return (
            <KolamInteractionFrame
              key={method.id}
              onPress={() => onSelectPaymentMethod(method.id)}
              style={[styles.paymentCard, active && styles.paymentCardActive]}>
              <Text numberOfLines={1} style={styles.paymentName}>
                {method.name}
              </Text>
              <Text numberOfLines={1} style={styles.paymentMeta}>
                Wallet: {method.wallet || '-'}
              </Text>
              <Text
                style={[
                  styles.paymentStatus,
                  method.active ? styles.paymentStatusActive : styles.paymentStatusMuted,
                ]}>
                {method.active ? 'Aktif' : 'Nonaktif'}
              </Text>
            </KolamInteractionFrame>
          );
        })}
      </View>
    </ScrollView>
  );
}

function getPosViewCountText({
  activeType,
  activeView,
  catalog,
  customers,
  filteredCatalog,
  recentSales,
}: {
  activeType: CatalogItemType | 'all';
  activeView: PosWindowView;
  catalog: CatalogItem[];
  customers: Customer[];
  filteredCatalog: CatalogItem[];
  recentSales: SaleSummary[];
}) {
  if (activeView === 'customers') {
    return `${customers.length} pelanggan`;
  }

  if (activeView === 'sales') {
    return `${recentSales.length} transaksi`;
  }

  if (activeView === 'cashflow') {
    return 'kas POS';
  }

  return `${filteredCatalog.length || catalog.length} ${
    activeType === 'species' ? 'spesies' : 'produk'
  }`;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatPosDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(date);
}

function getCatalogColumnCount(width: number) {
  if (width >= 1680) {
    return 7;
  }
  if (width >= 1380) {
    return 6;
  }
  if (width >= 1120) {
    return 5;
  }
  return 4;
}

function chunkCatalog(items: CatalogItem[], columnCount: number) {
  const rows: CatalogItem[][] = [];

  for (let index = 0; index < items.length; index += columnCount) {
    rows.push(items.slice(index, index + columnCount));
  }

  return rows;
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: V.colors.bg,
  },
  catalogPane: {
    flex: 1,
    minWidth: 0,
    borderRightColor: V.colors.border,
    borderRightWidth: 1,
  },
  topBar: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    backgroundColor: V.colors.bg,
  },
  segmentRail: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    overflow: 'hidden',
    borderRadius: 6,
    padding: 4,
    backgroundColor: V.colors.muted,
  },
  segment: {
    minHeight: 30,
    justifyContent: 'center',
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  segmentActive: {
    backgroundColor: V.colors.bg,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    color: V.colors.mutedFg,
    fontSize: 13,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: V.colors.fg,
  },
  segmentDivider: {
    width: 1,
    height: 20,
    marginHorizontal: 4,
    backgroundColor: V.colors.border,
  },
  search: {
    width: 240,
  },
  countText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
  },
  categoryBar: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  categoryPill: {
    minHeight: 32,
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: 14,
    backgroundColor: V.colors.muted,
  },
  categoryPillActive: {
    backgroundColor: V.colors.primary,
  },
  categoryText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '800',
  },
  categoryTextActive: {
    color: V.colors.primaryFg,
  },
  catalogScroll: {
    flex: 1,
  },
  catalogContent: {
    padding: 16,
    gap: 8,
  },
  catalogRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cardSlot: {
    flex: 1,
    minWidth: 0,
  },
  productCard: {
    minHeight: 214,
    overflow: 'hidden',
    borderRadius: 6,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.mutedSoft,
  },
  productCardActive: {
    borderColor: 'rgba(73,168,117,0.45)',
    backgroundColor: V.colors.primarySoft,
  },
  productImage: {
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: V.colors.secondary,
  },
  productImageIcon: {
    color: V.colors.mutedFg,
    fontSize: 22,
    fontWeight: '900',
  },
  productImageName: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  stockBadge: {
    position: 'absolute',
    left: 4,
    top: 4,
    overflow: 'hidden',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    color: V.colors.warning,
    backgroundColor: V.colors.warningSoft,
    fontSize: 8,
    fontWeight: '900',
  },
  stockBadgeDanger: {
    color: V.colors.danger,
    backgroundColor: V.colors.dangerSoft,
  },
  inCartBadge: {
    position: 'absolute',
    right: 4,
    top: 4,
    overflow: 'hidden',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    color: V.colors.primaryFg,
    backgroundColor: V.colors.primary,
    fontSize: 8,
    fontWeight: '900',
  },
  productCopy: {
    flex: 1,
    padding: 8,
  },
  skuText: {
    color: V.colors.mutedFg,
    fontSize: 9,
    fontWeight: '700',
  },
  productName: {
    marginTop: 2,
    minHeight: 30,
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 15,
  },
  productPrice: {
    marginTop: 5,
    color: V.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  productMeta: {
    marginTop: 2,
    color: V.colors.mutedFg,
    fontSize: 9,
  },
  addButton: {
    minHeight: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderRadius: 6,
    backgroundColor: V.colors.primary,
  },
  addButtonActive: {
    backgroundColor: '#244837',
  },
  addButtonDisabled: {
    backgroundColor: V.colors.secondary,
  },
  addButtonText: {
    color: V.colors.primaryFg,
    fontSize: 12,
    fontWeight: '800',
  },
  catalogEmpty: {
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subviewScroll: {
    flex: 1,
  },
  subviewContent: {
    padding: 16,
    gap: 12,
  },
  subviewHeader: {
    gap: 2,
    paddingBottom: 4,
  },
  subviewTitle: {
    color: V.colors.fg,
    fontSize: 18,
    fontWeight: '900',
  },
  subviewMeta: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
  },
  subviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  customerCard: {
    width: 260,
    minHeight: 94,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 6,
    borderColor: V.colors.border,
    borderWidth: 1,
    padding: 10,
    backgroundColor: V.colors.mutedSoft,
  },
  customerCardActive: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.primarySoft,
  },
  customerAvatar: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: V.colors.muted,
  },
  customerAvatarText: {
    color: V.colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  customerCardCopy: {
    flex: 1,
    minWidth: 0,
  },
  customerName: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
  },
  customerDetail: {
    marginTop: 2,
    color: V.colors.mutedFg,
    fontSize: 11,
  },
  selectedMark: {
    position: 'absolute',
    right: 8,
    top: 8,
    overflow: 'hidden',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    color: V.colors.primaryFg,
    backgroundColor: V.colors.primary,
    fontSize: 8,
    fontWeight: '900',
  },
  saleList: {
    overflow: 'hidden',
    borderRadius: 6,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  saleRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    backgroundColor: V.colors.bg,
  },
  saleCopy: {
    flex: 1,
    minWidth: 0,
  },
  saleInvoice: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
  },
  saleMeta: {
    marginTop: 2,
    color: V.colors.mutedFg,
    fontSize: 11,
  },
  saleAmountBox: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  saleAmount: {
    color: V.colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  saleStatus: {
    marginTop: 2,
    overflow: 'hidden',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    color: V.colors.mutedFg,
    backgroundColor: V.colors.muted,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentCard: {
    width: 220,
    minHeight: 92,
    justifyContent: 'center',
    borderRadius: 6,
    borderColor: V.colors.border,
    borderWidth: 1,
    padding: 12,
    backgroundColor: V.colors.mutedSoft,
  },
  paymentCardActive: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.primarySoft,
  },
  paymentName: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '900',
  },
  paymentMeta: {
    marginTop: 4,
    color: V.colors.mutedFg,
    fontSize: 11,
  },
  paymentStatus: {
    alignSelf: 'flex-start',
    marginTop: 8,
    overflow: 'hidden',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 9,
    fontWeight: '900',
  },
  paymentStatusActive: {
    color: V.colors.success,
    backgroundColor: V.colors.successSoft,
  },
  paymentStatusMuted: {
    color: V.colors.mutedFg,
    backgroundColor: V.colors.muted,
  },
  orderPane: {
    width: 340,
    backgroundColor: V.colors.bg,
  },
  orderHeader: {
    padding: 12,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '900',
  },
  orderBadge: {
    overflow: 'hidden',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    color: V.colors.mutedFg,
    backgroundColor: V.colors.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  selectorBlock: {
    gap: 6,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  selectorLabel: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '800',
  },
  selectorChip: {
    maxWidth: 128,
    minHeight: 28,
    justifyContent: 'center',
    marginRight: 6,
    borderRadius: 6,
    paddingHorizontal: 9,
    backgroundColor: V.colors.muted,
  },
  selectorChipActive: {
    backgroundColor: V.colors.primary,
  },
  selectorText: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '800',
  },
  selectorTextActive: {
    color: V.colors.primaryFg,
  },
  selectorEmpty: {
    color: V.colors.mutedFg,
    fontSize: 11,
  },
  orderList: {
    flex: 1,
    marginTop: 10,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  orderThumb: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: V.colors.muted,
  },
  orderThumbText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '900',
  },
  orderCopy: {
    flex: 1,
    minWidth: 0,
  },
  orderName: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 15,
  },
  orderMeta: {
    marginTop: 2,
    color: V.colors.mutedFg,
    fontSize: 10,
  },
  orderEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 4,
    color: V.colors.mutedFg,
    fontSize: 12,
    textAlign: 'center',
  },
  orderFooter: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
  adjustmentRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  adjustmentLabel: {
    width: 48,
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '700',
  },
  discountToggle: {
    flexDirection: 'row',
    borderRadius: 4,
    padding: 2,
    backgroundColor: V.colors.muted,
  },
  tinyToggle: {
    minHeight: 22,
    justifyContent: 'center',
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  tinyToggleActive: {
    backgroundColor: V.colors.bg,
  },
  tinyToggleText: {
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '800',
  },
  tinyToggleTextActive: {
    color: V.colors.fg,
  },
  adjustmentInput: {
    flex: 1,
    minHeight: 30,
    borderRadius: 4,
    borderColor: V.colors.border,
    borderWidth: 1,
    paddingHorizontal: 8,
    color: V.colors.fg,
    fontSize: 12,
  },
  shippingInput: {
    marginLeft: 54,
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  summaryLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  summaryValue: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryDanger: {
    color: V.colors.success,
  },
  validationText: {
    marginTop: 6,
    overflow: 'hidden',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: V.colors.danger,
    backgroundColor: V.colors.dangerSoft,
    fontSize: 10,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
  totalLabel: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '900',
  },
  totalValue: {
    color: V.colors.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  payButton: {
    marginTop: 10,
  },
});
