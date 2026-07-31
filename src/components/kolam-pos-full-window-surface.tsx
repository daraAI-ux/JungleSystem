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
  CashflowSession,
  CatalogItem,
  CatalogItemType,
  CheckoutState,
  Customer,
  PaymentMethod,
  SaleSummary,
} from '../domain/pos';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {formatRupiah} from '../lib/money';
import type {WorkflowStep} from '../lib/workflow';
import {KolamButton} from './kolam-button';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {KolamQuantityStepper} from './kolam-quantity-stepper';
import {KolamRemoteImage} from './kolam-remote-image';
import {KolamSearchField} from './kolam-search-field';

export interface KolamPosFullWindowSurfaceProps {
  activeSession?: CashflowSession | null;
  activeCategory?: string | null;
  activeType: CatalogItemType | 'all';
  afterDiscount: number;
  canCreateDraft: boolean;
  catalog: CatalogItem[];
  catalogCategories?: string[];
  catalogSearch: string;
  checkout: CheckoutState;
  customers: Customer[];
  filteredCatalog: CatalogItem[];
  finalTotal: number;
  isCreatingSale: boolean;
  onAddToCart: (item: CatalogItem) => void;
  onBackToCenter: () => void;
  onCatalogSearchChange: (query: string) => void;
  onCategoryChange?: (category: string | null) => void;
  onClearCart: () => void;
  onCreateSaleDraft: () => void;
  onGlobalDiscountChange: (value: string) => void;
  onGlobalDiscountTypeChange: (discountType: CheckoutState['globalDiscountType']) => void;
  onQuantityChange: (itemId: string, nextQuantity: number) => void;
  onReplaceCheckout?: (checkout: CheckoutState) => void;
  onSelectCustomer: (customerId: string) => void;
  onSelectPaymentMethod: (methodId: string) => void;
  onShippingCostChange: (value: string) => void;
  onTypeChange: (type: CatalogItemType | 'all') => void;
  paymentMethods: PaymentMethod[];
  recentSales: SaleSummary[];
  selectedCustomer?: Customer;
  subtotal: number;
  workflowSteps?: WorkflowStep[];
}

type PosWindowView = 'catalog' | 'customers' | 'sales' | 'cashflow';
type PosKeyboardEvent = {
  key?: string;
  preventDefault?: () => void;
};
type PosKeyboardTarget = {
  addEventListener?: (
    eventName: 'keydown',
    listener: (event: PosKeyboardEvent) => void,
  ) => void;
  removeEventListener?: (
    eventName: 'keydown',
    listener: (event: PosKeyboardEvent) => void,
  ) => void;
};
const POS_CATALOG_PAGE_SIZES = [12, 24, 48, 96] as const;
type PosSavedOrder = {
  id: string;
  name: string;
  checkout: CheckoutState;
  createdAt: string;
  customerName?: string;
};
type PosValidationNotice = {
  message: string;
  tone: 'danger' | 'warning';
};

export function KolamPosFullWindowSurface({
  activeSession = null,
  activeCategory = null,
  activeType,
  afterDiscount,
  canCreateDraft,
  catalog,
  catalogCategories = [],
  catalogSearch,
  checkout,
  customers,
  filteredCatalog,
  finalTotal,
  isCreatingSale,
  onAddToCart,
  onBackToCenter,
  onCatalogSearchChange,
  onCategoryChange,
  onClearCart,
  onCreateSaleDraft,
  onGlobalDiscountChange,
  onGlobalDiscountTypeChange,
  onQuantityChange,
  onReplaceCheckout,
  onSelectCustomer,
  onSelectPaymentMethod,
  onShippingCostChange,
  onTypeChange,
  paymentMethods,
  recentSales,
  selectedCustomer,
  subtotal,
  workflowSteps = [],
}: KolamPosFullWindowSurfaceProps) {
  const {width} = useWindowDimensions();
  const searchInputRef = React.useRef<React.ElementRef<typeof TextInput>>(null);
  const categoryScrollRef = React.useRef<ScrollView>(null);
  const categoryScrollOffsetRef = React.useRef(0);
  const [activeView, setActiveView] = React.useState<PosWindowView>('catalog');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
  const [isSavedOrdersOpen, setIsSavedOrdersOpen] = React.useState(false);
  const [quickViewItem, setQuickViewItem] = React.useState<CatalogItem | null>(
    null,
  );
  const [savedOrders, setSavedOrders] = React.useState<PosSavedOrder[]>([]);
  const [customerSelectorSearch, setCustomerSelectorSearch] =
    React.useState('');
  const [catalogPage, setCatalogPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(24);
  const columnCount = getCatalogColumnCount(width);
  const totalCatalogPages = Math.max(
    1,
    Math.ceil(filteredCatalog.length / itemsPerPage),
  );
  const safeCatalogPage = Math.min(catalogPage, totalCatalogPages);
  const catalogPageStartIndex = (safeCatalogPage - 1) * itemsPerPage;
  const pagedCatalog = filteredCatalog.slice(
    catalogPageStartIndex,
    catalogPageStartIndex + itemsPerPage,
  );
  const catalogRows = chunkCatalog(pagedCatalog, columnCount);
  const cashflowStep = workflowSteps.find(step =>
    step.label.toLowerCase().includes('cashflow'),
  );
  const hasCashflowSession = cashflowStep?.done ?? true;
  const cartCount = checkout.cart.reduce(
    (total, line) => total + line.quantity,
    0,
  );
  const isCatalogView = activeView === 'catalog';
  const canOpenPayment = checkout.cart.length > 0 && !!selectedCustomer && hasCashflowSession;

  const handleSaveOrder = React.useCallback(() => {
    if (!checkout.cart.length) {
      return;
    }

    const createdAt = new Date().toISOString();

    setSavedOrders(current => [
      {
        id: `saved-${Date.now()}`,
        name: `Pesanan #${current.length + 1}`,
        checkout: cloneCheckoutState(checkout),
        createdAt,
        customerName: selectedCustomer?.name,
      },
      ...current,
    ]);
    setIsSavedOrdersOpen(true);
  }, [checkout, selectedCustomer]);

  const handleLoadSavedOrder = React.useCallback(
    (order: PosSavedOrder) => {
      onReplaceCheckout?.(cloneCheckoutState(order.checkout));
      setIsSavedOrdersOpen(false);
    },
    [onReplaceCheckout],
  );

  const handleDeleteSavedOrder = React.useCallback((orderId: string) => {
    setSavedOrders(current => current.filter(order => order.id !== orderId));
  }, []);

  const scrollCategories = React.useCallback((direction: 'left' | 'right') => {
    const nextOffset =
      direction === 'left'
        ? Math.max(0, categoryScrollOffsetRef.current - 220)
        : categoryScrollOffsetRef.current + 220;

    categoryScrollRef.current?.scrollTo({
      animated: true,
      x: nextOffset,
    });
  }, []);

  React.useEffect(() => {
    setCatalogPage(1);
  }, [activeCategory, activeType, catalogSearch, itemsPerPage]);

  React.useEffect(() => {
    if (catalogPage !== safeCatalogPage) {
      setCatalogPage(safeCatalogPage);
    }
  }, [catalogPage, safeCatalogPage]);

  React.useEffect(() => {
    const keyboardTarget = getPosKeyboardTarget();

    if (!keyboardTarget) {
      return undefined;
    }

    const handleKeyDown = (event: PosKeyboardEvent) => {
      if (event.key === 'F1') {
        event.preventDefault?.();
        setActiveView('catalog');
        setTimeout(() => searchInputRef.current?.focus(), 0);
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault?.();

        if (isPaymentModalOpen) {
          setIsPaymentModalOpen(false);
          return;
        }

        onCatalogSearchChange('');
      }
    };

    keyboardTarget.addEventListener?.('keydown', handleKeyDown);

    return () => {
      keyboardTarget.removeEventListener?.('keydown', handleKeyDown);
    };
  }, [isPaymentModalOpen, onCatalogSearchChange]);

  return (
    <View style={styles.surface}>
      <View style={styles.catalogPane}>
        <View style={styles.topBar}>
          <View style={styles.segmentRail}>
            <PosSegment
              active={isCatalogView && activeType !== 'species'}
              icon="P"
              label="Produk"
              onPress={() => {
                setActiveView('catalog');
                onTypeChange('product');
              }}
            />
            <PosSegment
              active={isCatalogView && activeType === 'species'}
              icon="S"
              label="Spesies"
              onPress={() => {
                setActiveView('catalog');
                onTypeChange('species');
              }}
            />
            <View style={styles.segmentDivider} />
            <PosSegment
              active={activeView === 'customers'}
              icon="C"
              label="Pelanggan"
              onPress={() => setActiveView('customers')}
            />
            <PosSegment
              active={activeView === 'sales'}
              icon="R"
              label="Penjualan"
              onPress={() => setActiveView('sales')}
            />
            <PosSegment
              active={activeView === 'cashflow'}
              icon="K"
              label="Kas"
              onPress={() => setActiveView('cashflow')}
            />
          </View>
          {isCatalogView ? (
            <View style={styles.searchWrap}>
              <KolamSearchField
                value={catalogSearch}
                onChangeText={onCatalogSearchChange}
                placeholder="Cari... (F1)"
                inputRef={searchInputRef}
                containerStyle={styles.search}
                inputStyle={catalogSearch ? styles.searchInputWithClear : null}
              />
              {catalogSearch ? (
                <KolamInteractionFrame
                  accessibilityRole="button"
                  accessibilityLabel="Hapus pencarian katalog"
                  onPress={() => onCatalogSearchChange('')}
                  style={styles.searchClearButton}>
                  <Text style={styles.searchClearText}>X</Text>
                </KolamInteractionFrame>
              ) : null}
            </View>
          ) : null}
          <Text style={styles.countText}>
            {getPosViewCountText({
              activeType,
              activeView,
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
              <KolamInteractionFrame
                onPress={() => scrollCategories('left')}
                style={styles.categoryScrollButton}>
                <Text style={styles.categoryScrollText}>{'<'}</Text>
              </KolamInteractionFrame>
              <ScrollView
                ref={categoryScrollRef}
                horizontal
                contentContainerStyle={styles.categoryPillList}
                onScroll={event => {
                  categoryScrollOffsetRef.current = event.nativeEvent.contentOffset.x;
                }}
                scrollEventThrottle={16}
                showsHorizontalScrollIndicator={false}>
                <PosCategoryPill
                  active={!activeCategory}
                  label="Semua"
                  onPress={() => onCategoryChange?.(null)}
                />
                {catalogCategories.map(category => (
                  <PosCategoryPill
                    key={category}
                    active={activeCategory === category}
                    label={category}
                    onPress={() => onCategoryChange?.(category)}
                  />
                ))}
              </ScrollView>
              <KolamInteractionFrame
                onPress={() => scrollCategories('right')}
                style={styles.categoryScrollButton}>
                <Text style={styles.categoryScrollText}>{'>'}</Text>
              </KolamInteractionFrame>
              {catalogSearch || activeCategory ? (
                <KolamButton
                  label="Hapus Filter"
                  intent="plain"
                  onPress={() => {
                    onCatalogSearchChange('');
                    onCategoryChange?.(null);
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
                        onOpenQuickView={setQuickViewItem}
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
            <PosCatalogPagination
              currentPage={safeCatalogPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              onPageChange={setCatalogPage}
              totalPages={totalCatalogPages}
            />
            {!hasCashflowSession ? (
              <PosCashflowLockOverlay onOpenCashflow={() => setActiveView('cashflow')} />
            ) : null}
          </>
        ) : (
          <PosSubview
            activeView={activeView}
            activeSession={activeSession}
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
        <PosCustomerSelectorInline
          customers={customers}
          searchValue={customerSelectorSearch}
          selectedCustomer={selectedCustomer}
          onSearchChange={setCustomerSelectorSearch}
          onSelectCustomer={onSelectCustomer}
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
            <View style={styles.orderEmptyIcon}>
              <Text style={styles.orderEmptyIconText}>Bag</Text>
            </View>
            <Text style={styles.orderEmptyTitle}>Keranjang Kosong</Text>
            <Text style={styles.orderEmptyText}>
              Pilih produk dari katalog untuk memulai pesanan
            </Text>
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
            <PosCheckoutValidationMessages workflowSteps={workflowSteps} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatRupiah(finalTotal)}</Text>
            </View>
            <KolamButton
              label={
                isCreatingSale
                  ? 'Memproses...'
                  : `Bayar ${canOpenPayment ? formatRupiah(finalTotal) : ''}`
              }
              intent="primary"
              size="md"
              disabled={!canOpenPayment || isCreatingSale}
              onPress={() => setIsPaymentModalOpen(true)}
              style={styles.payButton}
            />
            <View style={styles.savedOrderActions}>
              <KolamButton
                label="Simpan"
                intent="outline"
                disabled={!checkout.cart.length}
                onPress={handleSaveOrder}
                style={styles.savedOrderActionButton}
              />
              <KolamButton
                label={`Tersimpan (${savedOrders.length})`}
                intent="outline"
                disabled={!savedOrders.length}
                onPress={() => setIsSavedOrdersOpen(true)}
                style={styles.savedOrderActionButton}
              />
            </View>
            <KolamButton
              label={`Kosongkan (${cartCount})`}
              intent="plain"
              onPress={onClearCart}
            />
          </View>
        ) : null}
      </View>
      {isSavedOrdersOpen ? (
        <PosSavedOrdersPanel
          catalog={catalog}
          orders={savedOrders}
          canLoad={Boolean(onReplaceCheckout)}
          hasActiveCart={checkout.cart.length > 0}
          onClose={() => setIsSavedOrdersOpen(false)}
          onDeleteOrder={handleDeleteSavedOrder}
          onLoadOrder={handleLoadSavedOrder}
        />
      ) : null}
      {quickViewItem ? (
        <PosQuickViewModal
          cartLine={checkout.cart.find(line => line.itemId === quickViewItem.id)}
          item={quickViewItem}
          onAddToCart={onAddToCart}
          onClose={() => setQuickViewItem(null)}
        />
      ) : null}
      {isPaymentModalOpen ? (
        <PosPaymentModal
          isCreatingSale={isCreatingSale}
          paymentMethods={paymentMethods.filter(method => method.active)}
          selectedPaymentId={checkout.paymentMethodId}
          total={finalTotal}
          onClose={() => setIsPaymentModalOpen(false)}
          onConfirm={() => {
            if (!canCreateDraft) {
              return;
            }

            setIsPaymentModalOpen(false);
            onCreateSaleDraft();
          }}
          onSelectPaymentMethod={onSelectPaymentMethod}
        />
      ) : null}
    </View>
  );
}

function PosSegment({
  active = false,
  icon,
  label,
  onPress,
}: {
  active?: boolean;
  icon?: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <KolamInteractionFrame
      onPress={onPress}
      style={[styles.segment, active && styles.segmentActive]}>
      {icon ? (
        <Text style={[styles.segmentIcon, active && styles.segmentIconActive]}>
          {icon}
        </Text>
      ) : null}
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

function PosCatalogPagination({
  currentPage,
  itemsPerPage,
  onItemsPerPageChange,
  onPageChange,
  totalPages,
}: {
  currentPage: number;
  itemsPerPage: number;
  onItemsPerPageChange: (size: number) => void;
  onPageChange: (page: number) => void;
  totalPages: number;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <View style={styles.catalogPagination}>
      <Text style={styles.catalogPaginationText}>Tampil</Text>
      <View style={styles.catalogPageSizeRail}>
        {POS_CATALOG_PAGE_SIZES.map(size => (
          <KolamInteractionFrame
            key={size}
            onPress={() => onItemsPerPageChange(size)}
            style={[
              styles.catalogPageSizeButton,
              itemsPerPage === size && styles.catalogPageSizeButtonActive,
            ]}>
            <Text
              style={[
                styles.catalogPageSizeText,
                itemsPerPage === size && styles.catalogPageSizeTextActive,
              ]}>
              {size}
            </Text>
          </KolamInteractionFrame>
        ))}
      </View>
      <View style={styles.catalogPageControls}>
        <KolamButton
          disabled={currentPage <= 1}
          intent="outline"
          label="<"
          size="sm"
          onPress={() => onPageChange(Math.max(1, currentPage - 1))}
        />
        <Text style={styles.catalogPageText}>
          {currentPage}/{totalPages}
        </Text>
        <KolamButton
          disabled={currentPage >= totalPages}
          intent="outline"
          label=">"
          size="sm"
          onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        />
      </View>
    </View>
  );
}

function PosCashflowLockOverlay({
  onOpenCashflow,
}: {
  onOpenCashflow: () => void;
}) {
  return (
    <View style={styles.cashflowLockOverlay}>
      <View style={styles.cashflowLockIcon}>
        <Text style={styles.cashflowLockIconText}>Rp</Text>
      </View>
      <Text style={styles.cashflowLockTitle}>Sesi Kas Tidak Ditemukan</Text>
      <Text style={styles.cashflowLockText}>
        Buka shift terlebih dahulu untuk membuat pesanan.
      </Text>
      <KolamButton
        label="Buka Shift Sekarang"
        intent="primary"
        size="sm"
        onPress={onOpenCashflow}
      />
    </View>
  );
}

function PosCatalogCard({
  cartLine,
  item,
  onAddToCart,
  onOpenQuickView,
}: {
  cartLine?: CartLine;
  item: CatalogItem;
  onAddToCart: (item: CatalogItem) => void;
  onOpenQuickView: (item: CatalogItem) => void;
}) {
  const isOutOfStock = item.stock <= 0;
  const isLowStock = item.stock > 0 && item.stock <= item.lowStockThreshold;
  const isInCart = !!cartLine;
  const minimumPriceToSales = item.minimumPriceToSales ?? 0;
  const minimumOrderQty = item.minimumOrderQty ?? 1;
  const hasMinimumMeta = minimumPriceToSales > 0 || minimumOrderQty > 1;

  return (
    <View style={styles.cardSlot}>
      <View style={[styles.productCard, isInCart && styles.productCardActive]}>
        <View style={styles.productImage}>
          {item.imageUri ? (
            <KolamRemoteImage
              accessibilityLabel={item.name}
              previewItems={[
                {
                  revision: item.imageRevision ?? item.imageUri,
                  scope: 'pos-catalog',
                  title: item.name,
                  uri: item.imageUri,
                },
              ]}
              revision={item.imageRevision}
              scope="pos-catalog"
              sourceUri={item.imageUri}
              style={styles.productImageFill}
            />
          ) : (
            <>
              <Text style={styles.productImageIcon}>
                {item.type === 'species' ? 'S' : 'P'}
              </Text>
              <Text numberOfLines={2} style={styles.productImageName}>
                {item.name}
              </Text>
            </>
          )}
          {isOutOfStock || isLowStock ? (
            <Text style={[styles.stockBadge, isOutOfStock && styles.stockBadgeDanger]}>
              {isOutOfStock ? 'Habis' : `Sisa ${item.stock}`}
            </Text>
          ) : null}
          {isInCart ? <Text style={styles.inCartBadge}>OK</Text> : null}
        </View>
        <View style={styles.productCopy}>
          <View style={styles.productInfoHeader}>
            <Text numberOfLines={1} style={styles.skuText}>
              {item.code}
            </Text>
            {item.variantCount ? (
              <Text style={styles.variantBadge}>{item.variantCount} Varian</Text>
            ) : null}
          </View>
          <Text numberOfLines={2} style={styles.productName}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>{formatRupiah(item.price)}</Text>
          {hasMinimumMeta ? (
            <View style={styles.productMetaList}>
              {minimumPriceToSales > 0 ? (
                <Text style={styles.productMinimumPrice}>
                  Min. {formatRupiah(minimumPriceToSales)}
                </Text>
              ) : null}
              {minimumOrderQty > 1 ? (
                <Text style={styles.productMinimumOrder}>
                  Min. order {minimumOrderQty}
                </Text>
              ) : null}
            </View>
          ) : null}
          <KolamInteractionFrame
            onPress={() => onOpenQuickView(item)}
            style={styles.quickViewButton}>
            <Text style={styles.quickViewButtonText}>Detail</Text>
          </KolamInteractionFrame>
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

function PosCustomerSelectorInline({
  customers,
  onSearchChange,
  onSelectCustomer,
  searchValue,
  selectedCustomer,
}: {
  customers: Customer[];
  onSearchChange: (value: string) => void;
  onSelectCustomer: (customerId: string) => void;
  searchValue: string;
  selectedCustomer?: Customer;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const normalizedSearch = searchValue.trim().toLowerCase();
  const visibleCustomers = normalizedSearch
    ? customers
        .filter(customer =>
          [customer.name, customer.phone, customer.email]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch),
        )
        .slice(0, 30)
    : customers.slice(0, 8);

  if (selectedCustomer && !isOpen) {
    return (
      <View style={styles.customerInline}>
        <View style={styles.customerSelectedCard}>
          <View style={styles.customerInlineAvatar}>
            <Text style={styles.customerInlineAvatarText}>
              {selectedCustomer.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.customerSelectedCopy}>
            <Text numberOfLines={1} style={styles.customerSelectedName}>
              {selectedCustomer.name}
            </Text>
            <Text numberOfLines={1} style={styles.customerSelectedMeta}>
              {selectedCustomer.phone || selectedCustomer.email || 'Pelanggan'}
            </Text>
          </View>
          <Text style={styles.customerCheckText}>OK</Text>
          <KolamInteractionFrame
            accessibilityLabel="Ganti pelanggan"
            onPress={() => setIsOpen(true)}
            style={styles.customerIconButton}>
            <Text style={styles.customerIconButtonText}>...</Text>
          </KolamInteractionFrame>
          <KolamInteractionFrame
            accessibilityLabel="Hapus pelanggan"
            onPress={() => {
              onSelectCustomer('');
              onSearchChange('');
              setIsOpen(true);
            }}
            style={styles.customerIconButton}>
            <Text style={styles.customerIconButtonText}>X</Text>
          </KolamInteractionFrame>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.customerInline}>
      <View style={styles.customerSearchShell}>
        <Text style={styles.customerSearchIcon}>P</Text>
        <TextInput
          autoCapitalize="none"
          onChangeText={value => {
            onSearchChange(value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Pilih pelanggan..."
          placeholderTextColor={V.colors.mutedFg}
          style={styles.customerSearchInput}
          value={searchValue}
        />
        {searchValue ? (
          <KolamInteractionFrame
            accessibilityLabel="Hapus pencarian pelanggan"
            onPress={() => onSearchChange('')}
            style={styles.customerSearchClearButton}>
            <Text style={styles.customerIconButtonText}>X</Text>
          </KolamInteractionFrame>
        ) : null}
      </View>
      {isOpen ? (
        <View style={styles.customerDropdown}>
          {visibleCustomers.length ? (
            visibleCustomers.map(customer => (
              <KolamInteractionFrame
                key={customer.id}
                onPress={() => {
                  onSelectCustomer(customer.id);
                  onSearchChange('');
                  setIsOpen(false);
                }}
                style={styles.customerOptionRow}>
                <View style={styles.customerOptionAvatar}>
                  <Text style={styles.customerOptionAvatarText}>
                    {customer.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.customerOptionCopy}>
                  <Text numberOfLines={1} style={styles.customerOptionName}>
                    {customer.name}
                  </Text>
                  <Text numberOfLines={1} style={styles.customerOptionMeta}>
                    {customer.phone || customer.email || 'Pelanggan'}
                  </Text>
                </View>
              </KolamInteractionFrame>
            ))
          ) : (
            <Text style={styles.customerEmpty}>
              {customers.length ? 'Pelanggan tidak ditemukan' : 'Belum ada pelanggan'}
            </Text>
          )}
        </View>
      ) : null}
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

  const isAtStockLimit = item.stock > 0 && line.quantity >= item.stock;
  const typeLabel = item.type === 'species' ? 'Spesies' : 'Produk';

  return (
    <View style={styles.orderRow}>
      <View style={styles.orderThumb}>
        {item.imageUri ? (
          <KolamRemoteImage
            accessibilityLabel={item.name}
            revision={item.imageRevision}
            scope="pos-order"
            sourceUri={item.imageUri}
            style={styles.orderThumbImage}
          />
        ) : (
          <Text style={styles.orderThumbText}>
            {item.type === 'species' ? 'S' : 'P'}
          </Text>
        )}
      </View>
      <View style={styles.orderCopy}>
        <Text numberOfLines={2} style={styles.orderName}>
          {item.name}
        </Text>
        <View style={styles.orderTagRow}>
          <Text style={styles.orderTypeChip}>{typeLabel}</Text>
          {item.category ? (
            <Text numberOfLines={1} style={styles.orderCategoryChip}>
              {item.category}
            </Text>
          ) : null}
          <Text
            style={[
              styles.orderStockChip,
              isAtStockLimit && styles.orderStockChipLimit,
            ]}>
            Stok {item.stock}
          </Text>
        </View>
        <View style={styles.orderPriceRow}>
          <Text style={styles.orderMeta}>{formatRupiah(item.price)}</Text>
          <Text style={styles.orderLineTotal}>
            {formatRupiah(item.price * line.quantity)}
          </Text>
        </View>
        {isAtStockLimit ? (
          <Text style={styles.orderLimitText}>Jumlah sudah mencapai stok</Text>
        ) : null}
      </View>
      <View style={styles.orderActions}>
        <KolamInteractionFrame
          onPress={() => onQuantityChange(line.itemId, 0)}
          style={styles.orderRemoveButton}>
          <Text style={styles.orderRemoveText}>X</Text>
        </KolamInteractionFrame>
        <KolamQuantityStepper
          quantity={line.quantity}
          onDecrement={() => onQuantityChange(line.itemId, line.quantity - 1)}
          onIncrement={() =>
            onQuantityChange(line.itemId, Math.min(item.stock, line.quantity + 1))
          }
        />
      </View>
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

function PosCheckoutValidationMessages({
  workflowSteps,
}: {
  workflowSteps: WorkflowStep[];
}) {
  const missingNotices = workflowSteps
    .filter(step => !step.done)
    .map(step => getPosValidationNotice(step.label))
    .filter((notice): notice is PosValidationNotice => Boolean(notice));

  if (!missingNotices.length) {
    return null;
  }

  return (
    <View style={styles.validationList}>
      {missingNotices.map(notice => (
        <View
          key={notice.message}
          style={[
            styles.validationRow,
            notice.tone === 'warning' && styles.validationRowWarning,
          ]}>
          <Text
            style={[
              styles.validationMarker,
              notice.tone === 'warning' && styles.validationMarkerWarning,
            ]}>
            !
          </Text>
          <Text
            style={[
              styles.validationMessage,
              notice.tone === 'warning' && styles.validationMessageWarning,
            ]}>
            {notice.message}
          </Text>
        </View>
      ))}
    </View>
  );
}

function getPosValidationNotice(label: string): PosValidationNotice | null {
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel.includes('cashflow')) {
    return {
      message: 'Buka shift kas sebelum mencatat penjualan',
      tone: 'warning',
    };
  }

  if (normalizedLabel.includes('customer')) {
    return {message: 'Pilih pelanggan', tone: 'danger'};
  }

  if (normalizedLabel.includes('payment')) {
    return {message: 'Pilih metode pembayaran', tone: 'danger'};
  }

  if (normalizedLabel.includes('login')) {
    return {message: 'Login kasir diperlukan', tone: 'warning'};
  }

  if (normalizedLabel.includes('akses')) {
    return {message: 'Akses POS diperlukan', tone: 'warning'};
  }

  if (normalizedLabel.includes('cart')) {
    return {message: 'Tambahkan item ke pesanan', tone: 'danger'};
  }

  return null;
}

function PosCashMetric({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.cashMetricCard}>
      <Text style={styles.cashMetricLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.cashMetricValue}>
        {value}
      </Text>
    </View>
  );
}

function PosSubview({
  activeView,
  activeSession,
  customers,
  paymentMethods,
  recentSales,
  selectedCustomerId,
  selectedPaymentId,
  onSelectCustomer,
  onSelectPaymentMethod,
}: {
  activeView: Exclude<PosWindowView, 'catalog'>;
  activeSession?: CashflowSession | null;
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
          Ringkasan shift kas dan metode pembayaran POS.
        </Text>
      </View>
      {activeSession ? (
        <View style={styles.cashSessionPanel}>
          <View style={styles.cashSessionHeader}>
            <View>
              <Text style={styles.cashSessionTitle}>{activeSession.name}</Text>
              <Text style={styles.cashSessionMeta}>
                {activeSession.cashier} | Dibuka {formatPosDate(activeSession.openedAt)}
              </Text>
            </View>
            <Text style={styles.cashSessionBadge}>Aktif</Text>
          </View>
          <View style={styles.cashMetricGrid}>
            <PosCashMetric
              label="Kas Awal"
              value={formatRupiah(activeSession.openingBalance)}
            />
            <PosCashMetric
              label="Total Penjualan"
              value={formatRupiah(activeSession.snapshot?.totalSalesAmount ?? 0)}
            />
            <PosCashMetric
              label="Tunai"
              value={formatRupiah(activeSession.snapshot?.cashSalesTotal ?? 0)}
            />
            <PosCashMetric
              label="Transaksi"
              value={`${activeSession.snapshot?.totalSalesCount ?? 0}`}
            />
          </View>
        </View>
      ) : (
        <View style={styles.cashSessionEmptyPanel}>
          <Text style={styles.emptyTitle}>Shift kas belum aktif.</Text>
          <Text style={styles.emptyText}>
            Buka sesi kas dari modul Kas pusat sebelum menerima transaksi POS.
          </Text>
        </View>
      )}
      <View style={styles.subviewHeaderCompact}>
        <Text style={styles.subviewSectionTitle}>Metode Pembayaran</Text>
        <Text style={styles.subviewMeta}>
          Pilihan di sini juga tersedia di modal pembayaran.
        </Text>
      </View>
      <View style={styles.paymentGrid}>
        {paymentMethods.filter(method => method.active).map(method => {
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
  customers,
  filteredCatalog,
  recentSales,
}: {
  activeType: CatalogItemType | 'all';
  activeView: PosWindowView;
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

  return `${filteredCatalog.length} ${
    activeType === 'species'
      ? 'spesies'
      : activeType === 'product'
        ? 'produk'
        : 'item'
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

function cloneCheckoutState(checkout: CheckoutState): CheckoutState {
  return {
    ...checkout,
    cart: checkout.cart.map(line => ({...line})),
  };
}

function getSavedOrderItemCount(order: PosSavedOrder) {
  return order.checkout.cart.reduce((total, line) => total + line.quantity, 0);
}

function getSavedOrderSubtotal(order: PosSavedOrder, catalog: CatalogItem[]) {
  return order.checkout.cart.reduce((total, line) => {
    const item = catalog.find(catalogItem => catalogItem.id === line.itemId);
    return total + (item?.price ?? 0) * line.quantity;
  }, 0);
}

function getSavedOrderItemNames(order: PosSavedOrder, catalog: CatalogItem[]) {
  return order.checkout.cart
    .slice(0, 3)
    .map(line => catalog.find(item => item.id === line.itemId)?.name ?? line.itemId);
}

function getPosKeyboardTarget(): PosKeyboardTarget | undefined {
  const keyboardTarget = globalThis as typeof globalThis & PosKeyboardTarget;

  if (
    typeof keyboardTarget.addEventListener !== 'function' ||
    typeof keyboardTarget.removeEventListener !== 'function'
  ) {
    return undefined;
  }

  return keyboardTarget;
}

function PosSavedOrdersPanel({
  canLoad,
  catalog,
  hasActiveCart,
  orders,
  onClose,
  onDeleteOrder,
  onLoadOrder,
}: {
  canLoad: boolean;
  catalog: CatalogItem[];
  hasActiveCart: boolean;
  orders: PosSavedOrder[];
  onClose: () => void;
  onDeleteOrder: (orderId: string) => void;
  onLoadOrder: (order: PosSavedOrder) => void;
}) {
  const [pendingLoadOrderId, setPendingLoadOrderId] = React.useState<
    string | null
  >(null);
  const [pendingDeleteOrderId, setPendingDeleteOrderId] = React.useState<
    string | null
  >(null);

  const handleLoadPress = React.useCallback(
    (order: PosSavedOrder) => {
      if (!canLoad) {
        return;
      }
      if (hasActiveCart && pendingLoadOrderId !== order.id) {
        setPendingLoadOrderId(order.id);
        setPendingDeleteOrderId(null);
        return;
      }
      onLoadOrder(order);
    },
    [canLoad, hasActiveCart, onLoadOrder, pendingLoadOrderId],
  );

  const handleDeletePress = React.useCallback(
    (orderId: string) => {
      if (pendingDeleteOrderId !== orderId) {
        setPendingDeleteOrderId(orderId);
        setPendingLoadOrderId(null);
        return;
      }
      setPendingDeleteOrderId(null);
      onDeleteOrder(orderId);
    },
    [onDeleteOrder, pendingDeleteOrderId],
  );

  return (
    <View style={styles.savedOrdersOverlay}>
      <KolamInteractionFrame style={styles.paymentBackdrop} onPress={onClose} />
      <View style={styles.savedOrdersDialog}>
        <View style={styles.paymentHeader}>
          <View>
            <Text style={styles.paymentTitle}>Pesanan Tersimpan</Text>
            <Text style={styles.paymentSubtitle}>
              {orders.length} pesanan tersimpan di jendela POS ini.
            </Text>
          </View>
          <KolamButton label="Tutup" intent="outline" size="sm" onPress={onClose} />
        </View>
        {orders.length ? (
          <ScrollView style={styles.savedOrdersList}>
            {orders.map(order => {
              const itemCount = getSavedOrderItemCount(order);
              const subtotal = getSavedOrderSubtotal(order, catalog);
              const previewNames = getSavedOrderItemNames(order, catalog);
              const confirmingLoad = pendingLoadOrderId === order.id;
              const confirmingDelete = pendingDeleteOrderId === order.id;

              return (
                <View key={order.id} style={styles.savedOrderRow}>
                  <View style={styles.savedOrderCopy}>
                    <Text numberOfLines={1} style={styles.savedOrderName}>
                      {order.name}
                    </Text>
                    {order.customerName ? (
                      <Text numberOfLines={1} style={styles.savedOrderMeta}>
                        {order.customerName}
                      </Text>
                    ) : null}
                    <Text style={styles.savedOrderMeta}>
                      {itemCount} item | {formatRupiah(subtotal)} |{' '}
                      {formatPosDate(order.createdAt)}
                    </Text>
                    <View style={styles.savedOrderPreviewList}>
                      {previewNames.map((name, index) => (
                        <Text
                          key={`${order.id}-${index}`}
                          numberOfLines={1}
                          style={styles.savedOrderPreviewChip}>
                          {name}
                        </Text>
                      ))}
                      {order.checkout.cart.length > 3 ? (
                        <Text style={styles.savedOrderMoreText}>
                          +{order.checkout.cart.length - 3}
                        </Text>
                      ) : null}
                    </View>
                    {confirmingLoad || confirmingDelete ? (
                      <Text style={styles.savedOrderWarning}>
                        {confirmingLoad
                          ? 'Keranjang saat ini akan diganti.'
                          : 'Pesanan tersimpan akan dihapus.'}
                      </Text>
                    ) : null}
                  </View>
                  <View style={styles.savedOrderRowActions}>
                    <KolamButton
                      label={
                        confirmingDelete
                          ? 'Batal'
                          : confirmingLoad
                            ? 'Ganti'
                            : 'Muat'
                      }
                      intent="primary"
                      disabled={!canLoad && !confirmingDelete}
                      onPress={
                        confirmingDelete
                          ? () => setPendingDeleteOrderId(null)
                          : () => handleLoadPress(order)
                      }
                    />
                    <KolamButton
                      label={
                        confirmingLoad
                          ? 'Batal'
                          : confirmingDelete
                            ? 'Ya Hapus'
                            : 'Hapus'
                      }
                      intent="plain"
                      tone="default"
                      onPress={
                        confirmingLoad
                          ? () => setPendingLoadOrderId(null)
                          : () => handleDeletePress(order.id)
                      }
                    />
                  </View>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <View style={styles.savedOrdersEmpty}>
            <View style={styles.savedOrdersEmptyIcon}>
              <Text style={styles.savedOrdersEmptyIconText}>File</Text>
            </View>
            <Text style={styles.savedOrdersEmptyTitle}>
              Tidak ada pesanan tersimpan
            </Text>
            <Text style={styles.savedOrdersEmptyText}>
              Pesanan yang disimpan akan muncul di sini
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function PosQuickViewModal({
  cartLine,
  item,
  onAddToCart,
  onClose,
}: {
  cartLine?: CartLine;
  item: CatalogItem;
  onAddToCart: (item: CatalogItem) => void;
  onClose: () => void;
}) {
  const isOutOfStock = item.stock <= 0;
  const isLowStock = item.stock > 0 && item.stock <= item.lowStockThreshold;

  return (
    <View style={styles.quickViewOverlay}>
      <KolamInteractionFrame style={styles.paymentBackdrop} onPress={onClose} />
      <View style={styles.quickViewDialog}>
        <View style={styles.quickViewMedia}>
          {item.imageUri ? (
            <KolamRemoteImage
              accessibilityLabel={item.name}
              previewItems={[
                {
                  revision: item.imageRevision ?? item.imageUri,
                  scope: 'pos-quick-view',
                  title: item.name,
                  uri: item.imageUri,
                },
              ]}
              revision={item.imageRevision}
              scope="pos-quick-view"
              sourceUri={item.imageUri}
              style={styles.quickViewImage}
            />
          ) : (
            <View style={styles.quickViewPlaceholder}>
              <Text style={styles.productImageIcon}>
                {item.type === 'species' ? 'S' : 'P'}
              </Text>
              <Text numberOfLines={2} style={styles.productImageName}>
                {item.name}
              </Text>
            </View>
          )}
          {isOutOfStock || isLowStock ? (
            <Text style={[styles.quickViewStockBadge, isOutOfStock && styles.stockBadgeDanger]}>
              {isOutOfStock ? 'Habis' : `Sisa ${item.stock}`}
            </Text>
          ) : null}
        </View>
        <View style={styles.quickViewBody}>
          <View style={styles.quickViewHeader}>
            <View style={styles.quickViewTitleWrap}>
              <Text numberOfLines={2} style={styles.quickViewTitle}>
                {item.name}
              </Text>
              <Text style={styles.quickViewMeta}>
                {item.code} | {item.category || 'Tanpa kategori'}
              </Text>
            </View>
            <KolamButton label="Tutup" intent="outline" size="sm" onPress={onClose} />
          </View>
          <Text style={styles.quickViewPrice}>{formatRupiah(item.price)}</Text>
          <View style={styles.quickViewInfoGrid}>
            <PosQuickInfo label="Stok" value={`${item.stock}`} />
            <PosQuickInfo
              label="Jenis"
              value={item.type === 'species' ? 'Spesies' : 'Produk'}
            />
            <PosQuickInfo
              label="Varian"
              value={item.variantCount ? `${item.variantCount}` : '-'}
            />
            <PosQuickInfo
              label="Keranjang"
              value={cartLine ? `${cartLine.quantity}` : '-'}
            />
          </View>
          {item.labels.length || isOutOfStock || isLowStock ? (
            <View style={styles.quickViewLabelList}>
              {isOutOfStock || isLowStock ? (
                <Text
                  style={[
                    styles.quickViewLabelChip,
                    isOutOfStock
                      ? styles.quickViewLabelDanger
                      : styles.quickViewLabelWarning,
                  ]}>
                  {isOutOfStock ? 'Habis' : 'Stok Menipis'}
                </Text>
              ) : null}
              {item.labels.map(label => (
                <Text key={label} style={styles.quickViewLabelChip}>
                  {label}
                </Text>
              ))}
            </View>
          ) : null}
          <View style={styles.quickViewFooter}>
            <KolamButton
              label={cartLine ? 'Tambah Lagi' : 'Tambah'}
              intent="primary"
              size="md"
              disabled={isOutOfStock}
              onPress={() => onAddToCart(item)}
              style={styles.quickViewAddButton}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

function PosQuickInfo({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.quickInfoCard}>
      <Text style={styles.quickInfoLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.quickInfoValue}>
        {value}
      </Text>
    </View>
  );
}

function PosPaymentModal({
  isCreatingSale,
  paymentMethods,
  selectedPaymentId,
  total,
  onClose,
  onConfirm,
  onSelectPaymentMethod,
}: {
  isCreatingSale: boolean;
  paymentMethods: PaymentMethod[];
  selectedPaymentId?: string;
  total: number;
  onClose: () => void;
  onConfirm: () => void;
  onSelectPaymentMethod: (methodId: string) => void;
}) {
  const selectedPayment = paymentMethods.find(
    method => method.id === selectedPaymentId,
  );
  const isCash = selectedPayment ? isCashPaymentMethod(selectedPayment) : false;
  const [paidAmount, setPaidAmount] = React.useState(() =>
    total > 0 ? String(Math.round(total)) : '',
  );
  const paidValue = Number(paidAmount || 0);
  const change = paidValue - total;
  const quickAmounts = React.useMemo(() => getQuickPaymentAmounts(total), [total]);
  const canConfirm = Boolean(selectedPayment) && (!isCash || paidValue >= total);
  const confirmLabel = isCreatingSale
    ? 'Memproses...'
    : !selectedPayment
      ? 'Pilih Metode'
      : isCash && paidValue < total
        ? `Kurang ${formatRupiah(total - paidValue)}`
        : `Bayar ${formatRupiah(total)}`;

  React.useEffect(() => {
    setPaidAmount(total > 0 ? String(Math.round(total)) : '');
  }, [total]);

  return (
    <View style={styles.paymentOverlay}>
      <KolamInteractionFrame style={styles.paymentBackdrop} onPress={onClose} />
      <View style={styles.paymentDialog}>
        <View style={styles.paymentHeader}>
          <View>
            <Text style={styles.paymentTitle}>Pembayaran</Text>
            <Text style={styles.paymentSubtitle}>
              Pilih metode pembayaran dan konfirmasi.
            </Text>
          </View>
          <KolamButton label="Tutup" intent="outline" size="sm" onPress={onClose} />
        </View>

        <View style={styles.paymentBody}>
          <View style={styles.paymentColumn}>
            <Text style={styles.paymentSectionLabel}>Metode Pembayaran</Text>
            <ScrollView
              style={styles.paymentMethodList}
              contentContainerStyle={styles.paymentMethodListContent}>
              {paymentMethods.length ? (
                paymentMethods.map(method => (
                  <KolamInteractionFrame
                    key={method.id}
                    onPress={() => onSelectPaymentMethod(method.id)}
                    style={[
                      styles.paymentMethodCard,
                      selectedPaymentId === method.id &&
                        styles.paymentMethodCardActive,
                    ]}>
                    <View style={styles.paymentMethodIcon}>
                      <Text style={styles.paymentMethodIconText}>
                        {isCashPaymentMethod(method) ? 'Rp' : '$'}
                      </Text>
                    </View>
                    <View style={styles.paymentMethodCopy}>
                      <Text
                        style={[
                          styles.paymentMethodName,
                          selectedPaymentId === method.id &&
                            styles.paymentMethodNameActive,
                        ]}
                        numberOfLines={1}>
                        {method.name}
                      </Text>
                      <Text style={styles.paymentMethodMeta}>
                        {isCashPaymentMethod(method)
                          ? 'Tunai dengan hitung kembalian'
                          : 'Konfirmasi non-tunai'}
                      </Text>
                    </View>
                    {selectedPaymentId === method.id ? (
                      <Text style={styles.paymentMethodCheck}>Terpilih</Text>
                    ) : null}
                  </KolamInteractionFrame>
                ))
              ) : (
                <Text style={styles.paymentEmptyText}>
                  Belum ada metode pembayaran aktif.
                </Text>
              )}
            </ScrollView>
          </View>

          <View style={styles.paymentColumn}>
            <View style={styles.paymentTotalCard}>
              <Text style={styles.paymentTotalLabel}>Total Tagihan</Text>
              <Text style={styles.paymentTotalValue}>{formatRupiah(total)}</Text>
            </View>

            {isCash ? (
              <>
                <View style={styles.paymentPaidCard}>
                  <Text style={styles.paymentSectionLabel}>Jumlah Dibayar</Text>
                  <Text style={styles.paymentPaidValue}>
                    {formatRupiah(paidValue)}
                  </Text>
                </View>
                <View style={styles.quickAmountGrid}>
                  {quickAmounts.map(amount => (
                    <KolamInteractionFrame
                      key={amount.value}
                      onPress={() => setPaidAmount(String(amount.value))}
                      style={[
                        styles.quickAmountButton,
                        paidValue === amount.value &&
                          styles.quickAmountButtonActive,
                      ]}>
                      <Text
                        style={[
                          styles.quickAmountText,
                          paidValue === amount.value &&
                            styles.quickAmountTextActive,
                        ]}>
                        {paidValue === amount.value
                          ? `${amount.label} OK`
                          : amount.label}
                      </Text>
                    </KolamInteractionFrame>
                  ))}
                </View>
                <View style={styles.numpadGrid}>
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '<'].map(
                    key => (
                      <KolamInteractionFrame
                        key={key}
                        onPress={() => {
                          if (key === 'C') {
                            setPaidAmount('');
                          } else if (key === '<') {
                            setPaidAmount(value => value.slice(0, -1));
                          } else {
                            setPaidAmount(value =>
                              `${value}${key}`.replace(/^0+(?=\d)/, ''),
                            );
                          }
                        }}
                        style={[
                          styles.numpadButton,
                          key === 'C' && styles.numpadButtonDanger,
                          key === '<' && styles.numpadButtonWarning,
                        ]}>
                        <Text
                          style={[
                            styles.numpadText,
                            key === 'C' && styles.numpadTextDanger,
                            key === '<' && styles.numpadTextWarning,
                          ]}>
                          {key === '<' ? 'Hapus' : key}
                        </Text>
                      </KolamInteractionFrame>
                    ),
                  )}
                </View>
                <View
                  style={[
                    styles.changeCard,
                    change < 0 && styles.changeCardDanger,
                  ]}>
                  <Text style={styles.changeLabel}>
                    {change >= 0 ? 'Kembalian' : 'Kurang'}
                  </Text>
                  <Text
                    style={[
                      styles.changeValue,
                      change < 0 && styles.changeValueDanger,
                    ]}>
                    {formatRupiah(Math.abs(change))}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.nonCashCard}>
                <Text style={styles.nonCashTitle}>
                  {selectedPayment
                    ? `Konfirmasi ${selectedPayment.name}`
                    : 'Pilih metode pembayaran'}
                </Text>
                <Text style={styles.nonCashText}>
                  Pembayaran non-tunai akan dibuat sesuai total tagihan.
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.paymentFooter}>
          <KolamButton label="Batal" intent="outline" onPress={onClose} />
          <KolamButton
            label={confirmLabel}
            intent="primary"
            disabled={!canConfirm || isCreatingSale}
            onPress={onConfirm}
          />
        </View>
      </View>
    </View>
  );
}

function isCashPaymentMethod(method: PaymentMethod) {
  const normalized = method.name.toLowerCase();
  return (
    normalized.includes('cash') ||
    normalized.includes('tunai') ||
    normalized.includes('kas')
  );
}

function getQuickPaymentAmounts(total: number) {
  const roundedTotal = Math.max(0, Math.round(total));
  const amounts: Array<{label: string; value: number}> = [
    {label: 'Uang Pas', value: roundedTotal},
  ];
  const denominations = [10000, 20000, 50000, 100000, 200000, 500000];

  denominations.forEach(denomination => {
    const roundedUp =
      Math.ceil(roundedTotal / denomination) * denomination || denomination;

    if (
      roundedUp > roundedTotal &&
      !amounts.some(amount => amount.value === roundedUp)
    ) {
      amounts.push({label: formatRupiah(roundedUp), value: roundedUp});
    }

    if (
      denomination > roundedTotal &&
      !amounts.some(amount => amount.value === denomination)
    ) {
      amounts.push({label: formatRupiah(denomination), value: denomination});
    }
  });

  return amounts.sort((left, right) => left.value - right.value).slice(0, 5);
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
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
  segmentIcon: {
    width: 16,
    height: 16,
    overflow: 'hidden',
    borderRadius: 4,
    textAlign: 'center',
    color: V.colors.mutedFg,
    backgroundColor: V.colors.secondary,
    fontSize: 9,
    fontWeight: '900',
    lineHeight: 16,
  },
  segmentIconActive: {
    color: V.colors.primary,
    backgroundColor: V.colors.primarySoft,
  },
  segmentDivider: {
    width: 1,
    height: 20,
    marginHorizontal: 4,
    backgroundColor: V.colors.border,
  },
  searchWrap: {
    position: 'relative',
    width: 240,
  },
  search: {
    width: 240,
  },
  searchInputWithClear: {
    paddingRight: 28,
  },
  searchClearButton: {
    position: 'absolute',
    right: 9,
    top: 8,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  searchClearText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '900',
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
  categoryPillList: {
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  categoryScrollButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: V.colors.muted,
  },
  categoryScrollText: {
    color: V.colors.mutedFg,
    fontSize: 13,
    fontWeight: '900',
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
  catalogPagination: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    backgroundColor: V.colors.bg,
  },
  catalogPaginationText: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '700',
  },
  catalogPageSizeRail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 3,
    borderRadius: 6,
    backgroundColor: V.colors.muted,
  },
  catalogPageSizeButton: {
    minHeight: 24,
    minWidth: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    paddingHorizontal: 6,
  },
  catalogPageSizeButtonActive: {
    backgroundColor: V.colors.bg,
  },
  catalogPageSizeText: {
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '800',
  },
  catalogPageSizeTextActive: {
    color: V.colors.fg,
  },
  catalogPageControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catalogPageText: {
    minWidth: 54,
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  cashflowLockOverlay: {
    ...StyleSheet.absoluteFillObject,
    top: 104,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
  },
  cashflowLockIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    backgroundColor: V.colors.muted,
  },
  cashflowLockIconText: {
    color: V.colors.mutedFg,
    fontSize: 18,
    fontWeight: '900',
  },
  cashflowLockTitle: {
    marginTop: 14,
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
  cashflowLockText: {
    maxWidth: 260,
    marginTop: 6,
    marginBottom: 16,
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
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
  productImageFill: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    width: '100%',
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
  productInfoHeader: {
    minHeight: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  skuText: {
    flex: 1,
    minWidth: 0,
    color: V.colors.mutedFg,
    fontSize: 9,
    fontWeight: '700',
  },
  variantBadge: {
    overflow: 'hidden',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    color: V.colors.mutedFg,
    backgroundColor: V.colors.muted,
    fontSize: 9,
    fontWeight: '800',
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
  productMetaList: {
    gap: 1,
    marginTop: 2,
  },
  productMinimumPrice: {
    color: V.colors.warning,
    fontSize: 9,
    fontWeight: '700',
  },
  productMinimumOrder: {
    color: V.colors.mutedFg,
    fontSize: 9,
    fontWeight: '700',
  },
  quickViewButton: {
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    borderRadius: 5,
    backgroundColor: V.colors.muted,
  },
  quickViewButtonText: {
    color: V.colors.fg,
    fontSize: 10,
    fontWeight: '800',
  },
  addButton: {
    minHeight: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
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
  subviewHeaderCompact: {
    gap: 2,
    paddingTop: 4,
  },
  subviewTitle: {
    color: V.colors.fg,
    fontSize: 18,
    fontWeight: '900',
  },
  subviewSectionTitle: {
    color: V.colors.fg,
    fontSize: 13,
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
  cashSessionPanel: {
    gap: 12,
    borderRadius: 6,
    borderColor: V.colors.border,
    borderWidth: 1,
    padding: 14,
    backgroundColor: V.colors.bg,
  },
  cashSessionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cashSessionTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '900',
  },
  cashSessionMeta: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '600',
  },
  cashSessionBadge: {
    overflow: 'hidden',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    color: V.colors.success,
    backgroundColor: V.colors.successSoft,
    fontSize: 10,
    fontWeight: '900',
  },
  cashMetricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cashMetricCard: {
    width: 160,
    minHeight: 68,
    justifyContent: 'center',
    borderRadius: 6,
    padding: 10,
    backgroundColor: V.colors.mutedSoft,
  },
  cashMetricLabel: {
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '800',
  },
  cashMetricValue: {
    marginTop: 5,
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '900',
  },
  cashSessionEmptyPanel: {
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderColor: V.colors.border,
    borderWidth: 1,
    padding: 18,
    backgroundColor: V.colors.mutedSoft,
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
  customerInline: {
    paddingHorizontal: 12,
    paddingTop: 10,
    zIndex: 5,
  },
  customerSelectedCard: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: V.colors.muted,
  },
  customerInlineAvatar: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: V.colors.primarySoft,
  },
  customerInlineAvatarText: {
    color: V.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  customerSelectedCopy: {
    flex: 1,
    minWidth: 0,
  },
  customerSelectedName: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '900',
  },
  customerSelectedMeta: {
    marginTop: 1,
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '700',
  },
  customerCheckText: {
    color: V.colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  customerIconButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  customerIconButtonText: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '900',
  },
  customerSearchShell: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
    paddingHorizontal: 8,
    backgroundColor: V.colors.bg,
  },
  customerSearchIcon: {
    width: 18,
    textAlign: 'center',
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '900',
  },
  customerSearchInput: {
    minWidth: 0,
    minHeight: 36,
    flex: 1,
    paddingVertical: 0,
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '700',
  },
  customerSearchClearButton: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  customerDropdown: {
    overflow: 'hidden',
    marginTop: 6,
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  customerOptionRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  customerOptionAvatar: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: V.colors.muted,
  },
  customerOptionAvatarText: {
    color: V.colors.fg,
    fontSize: 11,
    fontWeight: '900',
  },
  customerOptionCopy: {
    flex: 1,
    minWidth: 0,
  },
  customerOptionName: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '900',
  },
  customerOptionMeta: {
    marginTop: 1,
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '700',
  },
  customerEmpty: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
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
    overflow: 'hidden',
    borderRadius: 6,
    backgroundColor: V.colors.muted,
  },
  orderThumbImage: {
    width: 38,
    height: 38,
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
  orderTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  orderTypeChip: {
    overflow: 'hidden',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    backgroundColor: V.colors.primarySoft,
    color: V.colors.primary,
    fontSize: 9,
    fontWeight: '900',
  },
  orderCategoryChip: {
    maxWidth: 96,
    overflow: 'hidden',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    backgroundColor: V.colors.muted,
    color: V.colors.mutedFg,
    fontSize: 9,
    fontWeight: '800',
  },
  orderStockChip: {
    overflow: 'hidden',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    backgroundColor: V.colors.muted,
    color: V.colors.mutedFg,
    fontSize: 9,
    fontWeight: '800',
  },
  orderStockChipLimit: {
    backgroundColor: V.colors.warningSoft,
    color: V.colors.warning,
  },
  orderMeta: {
    marginTop: 2,
    color: V.colors.mutedFg,
    fontSize: 10,
  },
  orderPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 2,
  },
  orderLineTotal: {
    color: V.colors.fg,
    fontSize: 11,
    fontWeight: '900',
  },
  orderLimitText: {
    marginTop: 3,
    color: V.colors.warning,
    fontSize: 9,
    fontWeight: '800',
  },
  orderActions: {
    alignItems: 'flex-end',
    gap: 6,
  },
  orderRemoveButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  orderRemoveText: {
    color: V.colors.danger,
    fontSize: 11,
    fontWeight: '900',
  },
  orderEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  orderEmptyIcon: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
    backgroundColor: V.colors.muted,
  },
  orderEmptyIconText: {
    color: V.colors.mutedFg,
    fontSize: 13,
    fontWeight: '900',
    opacity: 0.45,
  },
  orderEmptyTitle: {
    marginTop: 16,
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  orderEmptyText: {
    maxWidth: 210,
    marginTop: 4,
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
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
  validationList: {
    gap: 4,
    marginTop: 6,
  },
  validationRow: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    overflow: 'hidden',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: V.colors.dangerSoft,
  },
  validationRowWarning: {
    backgroundColor: V.colors.warningSoft,
  },
  validationMarker: {
    width: 14,
    textAlign: 'center',
    color: V.colors.danger,
    fontSize: 11,
    fontWeight: '900',
  },
  validationMarkerWarning: {
    color: V.colors.warning,
  },
  validationMessage: {
    flex: 1,
    color: V.colors.danger,
    fontSize: 10,
    fontWeight: '800',
  },
  validationMessageWarning: {
    color: V.colors.warning,
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
  savedOrderActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  savedOrderActionButton: {
    flex: 1,
  },
  savedOrdersOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 38,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  savedOrdersDialog: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '82%',
    overflow: 'hidden',
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 10},
  },
  savedOrdersList: {
    maxHeight: 440,
  },
  savedOrderRow: {
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
  savedOrderCopy: {
    flex: 1,
    minWidth: 0,
  },
  savedOrderName: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '900',
  },
  savedOrderMeta: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '600',
  },
  savedOrderPreviewList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 8,
  },
  savedOrderPreviewChip: {
    maxWidth: 118,
    overflow: 'hidden',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    color: V.colors.mutedFg,
    backgroundColor: V.colors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  savedOrderMoreText: {
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '800',
  },
  savedOrderWarning: {
    alignSelf: 'flex-start',
    marginTop: 8,
    borderRadius: 4,
    backgroundColor: V.colors.warningSoft,
    paddingHorizontal: 8,
    paddingVertical: 5,
    color: V.colors.warning,
    fontSize: 10,
    fontWeight: '800',
  },
  savedOrderRowActions: {
    alignItems: 'stretch',
    gap: 6,
  },
  savedOrdersEmpty: {
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
  savedOrdersEmptyIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    backgroundColor: V.colors.muted,
  },
  savedOrdersEmptyIconText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '900',
    opacity: 0.45,
  },
  savedOrdersEmptyTitle: {
    marginTop: 16,
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  savedOrdersEmptyText: {
    marginTop: 4,
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  quickViewOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 39,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  quickViewDialog: {
    width: '100%',
    maxWidth: 820,
    minHeight: 420,
    maxHeight: '86%',
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 10},
  },
  quickViewMedia: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.secondary,
  },
  quickViewImage: {
    height: '100%',
    width: '100%',
  },
  quickViewPlaceholder: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  quickViewStockBadge: {
    position: 'absolute',
    left: 12,
    top: 12,
    overflow: 'hidden',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    color: V.colors.warning,
    backgroundColor: V.colors.warningSoft,
    fontSize: 10,
    fontWeight: '900',
  },
  quickViewBody: {
    width: 360,
    gap: 14,
    padding: 16,
  },
  quickViewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  quickViewTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  quickViewTitle: {
    color: V.colors.fg,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 24,
  },
  quickViewMeta: {
    marginTop: 5,
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '700',
  },
  quickViewPrice: {
    color: V.colors.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  quickViewInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickInfoCard: {
    width: 156,
    minHeight: 62,
    justifyContent: 'center',
    borderRadius: 6,
    padding: 10,
    backgroundColor: V.colors.mutedSoft,
  },
  quickInfoLabel: {
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '800',
  },
  quickInfoValue: {
    marginTop: 4,
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '900',
  },
  quickViewLabelList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  quickViewLabelChip: {
    overflow: 'hidden',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: V.colors.mutedFg,
    backgroundColor: V.colors.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  quickViewLabelWarning: {
    color: V.colors.warning,
    backgroundColor: V.colors.warningSoft,
  },
  quickViewLabelDanger: {
    color: V.colors.danger,
    backgroundColor: V.colors.dangerSoft,
  },
  quickViewFooter: {
    marginTop: 'auto',
  },
  quickViewAddButton: {
    width: '100%',
  },
  paymentOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  paymentBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  paymentDialog: {
    width: '86%',
    maxWidth: 920,
    maxHeight: '90%',
    overflow: 'hidden',
    borderRadius: V.radius.lg,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  paymentHeader: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
  },
  paymentTitle: {
    color: V.colors.fg,
    fontSize: 18,
    fontWeight: '900',
  },
  paymentSubtitle: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  paymentBody: {
    flexDirection: 'row',
    gap: 18,
    padding: 18,
  },
  paymentColumn: {
    flex: 1,
    minWidth: 0,
  },
  paymentSectionLabel: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
  },
  paymentMethodList: {
    maxHeight: 430,
    marginTop: 10,
  },
  paymentMethodListContent: {
    gap: 8,
  },
  paymentMethodCard: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    padding: 12,
    backgroundColor: V.colors.bg,
  },
  paymentMethodCardActive: {
    borderColor: V.colors.primary,
    backgroundColor: V.colors.primarySoft,
  },
  paymentMethodIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: V.radius.md,
    backgroundColor: V.colors.muted,
  },
  paymentMethodIconText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
  },
  paymentMethodCopy: {
    flex: 1,
    minWidth: 0,
  },
  paymentMethodName: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
  },
  paymentMethodNameActive: {
    color: V.colors.primary,
  },
  paymentMethodMeta: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontSize: 11,
  },
  paymentMethodCheck: {
    color: V.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  paymentEmptyText: {
    borderRadius: V.radius.md,
    padding: 12,
    color: V.colors.mutedFg,
    backgroundColor: V.colors.muted,
    fontSize: 12,
  },
  paymentTotalCard: {
    borderRadius: V.radius.lg,
    padding: 16,
    backgroundColor: V.colors.successSoft,
  },
  paymentTotalLabel: {
    color: V.colors.success,
    fontSize: 12,
    fontWeight: '800',
  },
  paymentTotalValue: {
    marginTop: 4,
    color: V.colors.success,
    fontSize: 28,
    fontWeight: '900',
  },
  paymentPaidCard: {
    marginTop: 12,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    padding: 12,
  },
  paymentPaidValue: {
    marginTop: 6,
    color: V.colors.fg,
    fontSize: 22,
    fontWeight: '900',
  },
  quickAmountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  quickAmountButton: {
    minHeight: 34,
    justifyContent: 'center',
    borderRadius: V.radius.md,
    paddingHorizontal: 12,
    backgroundColor: V.colors.muted,
  },
  quickAmountButtonActive: {
    backgroundColor: V.colors.primary,
  },
  quickAmountText: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '800',
  },
  quickAmountTextActive: {
    color: V.colors.primaryFg,
  },
  numpadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  numpadButton: {
    width: '31.6%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: V.radius.md,
    backgroundColor: V.colors.muted,
  },
  numpadButtonDanger: {
    backgroundColor: V.colors.dangerSoft,
  },
  numpadButtonWarning: {
    backgroundColor: V.colors.warningSoft,
  },
  numpadText: {
    color: V.colors.fg,
    fontSize: 16,
    fontWeight: '900',
  },
  numpadTextDanger: {
    color: V.colors.danger,
  },
  numpadTextWarning: {
    color: V.colors.warning,
    fontSize: 12,
  },
  changeCard: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    borderRadius: V.radius.md,
    paddingHorizontal: 14,
    backgroundColor: V.colors.successSoft,
  },
  changeCardDanger: {
    backgroundColor: V.colors.dangerSoft,
  },
  changeLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '800',
  },
  changeValue: {
    color: V.colors.success,
    fontSize: 18,
    fontWeight: '900',
  },
  changeValueDanger: {
    color: V.colors.danger,
  },
  nonCashCard: {
    marginTop: 12,
    borderRadius: V.radius.md,
    borderColor: V.colors.border,
    borderWidth: 1,
    padding: 14,
    backgroundColor: V.colors.mutedSoft,
  },
  nonCashTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '900',
  },
  nonCashText: {
    marginTop: 4,
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 17,
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
});
