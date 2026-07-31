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
  selectedCustomer?: Customer;
  selectedPayment?: PaymentMethod;
  subtotal: number;
}

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
  selectedCustomer,
  selectedPayment,
  subtotal,
}: KolamPosFullWindowSurfaceProps) {
  const {width} = useWindowDimensions();
  const columnCount = getCatalogColumnCount(width);
  const catalogRows = chunkCatalog(filteredCatalog, columnCount);
  const cartCount = checkout.cart.reduce(
    (total, line) => total + line.quantity,
    0,
  );

  return (
    <View style={styles.surface}>
      <View style={styles.catalogPane}>
        <View style={styles.topBar}>
          <View style={styles.segmentRail}>
            <PosSegment
              active={activeType === 'product' || activeType === 'all'}
              label="Produk"
              onPress={() => onTypeChange(activeType === 'product' ? 'all' : 'product')}
            />
            <PosSegment
              active={activeType === 'species'}
              label="Spesies"
              onPress={() => onTypeChange('species')}
            />
            <View style={styles.segmentDivider} />
            <PosSegment label="Pelanggan" onPress={() => undefined} />
            <PosSegment label="Penjualan" onPress={() => undefined} />
            <PosSegment label="Kas" onPress={() => undefined} />
          </View>
          <KolamSearchField
            value={catalogSearch}
            onChangeText={onCatalogSearchChange}
            placeholder="Cari... (F1)"
            containerStyle={styles.search}
          />
          <Text style={styles.countText}>
            {filteredCatalog.length || catalog.length}{' '}
            {activeType === 'species' ? 'spesies' : 'produk'}
          </Text>
          <KolamButton
            label="Kembali"
            intent="outline"
            size="sm"
            onPress={onBackToCenter}
          />
        </View>

        <View style={styles.categoryBar}>
          <PosCategoryPill active label="Semua" onPress={() => undefined} />
          <PosCategoryPill label="Produk" onPress={() => onTypeChange('product')} />
          <PosCategoryPill label="Spesies" onPress={() => onTypeChange('species')} />
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
                    cartLine={checkout.cart.find(line => line.itemId === item.id)}
                    item={item}
                    onAddToCart={onAddToCart}
                  />
                ))}
                {Array.from({length: columnCount - row.length}).map((_, index) => (
                  <View key={`empty-${index}`} style={styles.cardSlot} />
                ))}
              </View>
            ))
          ) : (
            <View style={styles.catalogEmpty}>
              <Text style={styles.emptyTitle}>Tidak ada item yang cocok.</Text>
              <Text style={styles.emptyText}>Coba hapus filter atau kata kunci.</Text>
            </View>
          )}
        </ScrollView>
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
