import {
  canRescheduleKolamBiteshipItem,
  isKolamBiteshipCheckoutItem,
  isKolamBiteshipInstantCourier,
  needsKolamBiteshipBooking,
  resolveKolamBiteshipItemBooking,
  showKolamWebstoreBiteshipRequest,
  showKolamWebstoreBiteshipReschedule,
} from '../src/domain/kolam-biteship-booking';
import type {KolamSaleItem} from '../src/domain/kolam-sales';

function item(partial: Partial<KolamSaleItem>): KolamSaleItem {
  return {
    id: 'item-1',
    itemType: 'product',
    title: 'Item',
    sku: 'SKU',
    quantity: 1,
    unitPrice: 1000,
    subtotal: 1000,
    discount: null,
    shippingCost: 0,
    unitCostAtSale: null,
    hppVendorUnitAtSale: null,
    hppBomUnitAtSale: null,
    hppStoredOnlyUnitAtSale: null,
    packings: [],
    thumbnailUri: null,
    variantLabel: '',
    shippingSource: 'biteship',
    biteshipCourierCode: 'jne',
    biteshipServiceCode: 'reg',
    biteshipWaybillId: '',
    biteshipOrderId: '',
    itemDeliveryStatus: 'packing',
    biteshipTrackingOrderStatus: '',
    biteshipTrackingDeliveryDatetime: '',
    shippingMethodId: '',
    shippingMethodName: '',
    productId: '',
    speciesId: '',
    serviceId: '',
    enclosureId: '',
    customName: '',
    customUnit: 'pcs',
    customCost: null,
    voucherCode: '',
    voucherDiscountApplied: 0,
    voucherDiscountType: '',
    voucherDiscountValue: null,
    ...partial,
  };
}

describe('kolam-biteship-booking', () => {
  it('needs booking when shippable without orderId (even with fake waybill)', () => {
    const withFakeResi = item({biteshipWaybillId: 'JNE123'});
    expect(isKolamBiteshipCheckoutItem(withFakeResi)).toBe(true);
    expect(needsKolamBiteshipBooking(withFakeResi)).toBe(true);
    expect(
      resolveKolamBiteshipItemBooking(withFakeResi, 'paid', [])?.state,
    ).toBe('failed');
  });

  it('booked only when biteshipOrderId exists', () => {
    const booked = item({
      biteshipOrderId: 'order-1',
      biteshipWaybillId: 'WB1',
    });
    expect(needsKolamBiteshipBooking(booked)).toBe(false);
    expect(resolveKolamBiteshipItemBooking(booked, 'paid', [])).toEqual({
      state: 'booked',
      orderId: 'order-1',
    });
  });

  it('detects instant couriers', () => {
    expect(isKolamBiteshipInstantCourier('gojek')).toBe(true);
    expect(isKolamBiteshipInstantCourier('JNE')).toBe(false);
  });

  it('canReschedule requires orderId and blocks on_delivery', () => {
    expect(
      canRescheduleKolamBiteshipItem(
        item({biteshipOrderId: '', biteshipTrackingOrderStatus: 'confirmed'}),
      ),
    ).toBe(false);
    expect(
      canRescheduleKolamBiteshipItem(
        item({
          biteshipOrderId: 'o1',
          itemDeliveryStatus: 'on_delivery',
          biteshipTrackingOrderStatus: 'confirmed',
        }),
      ),
    ).toBe(false);
    expect(
      canRescheduleKolamBiteshipItem(
        item({
          biteshipOrderId: 'o1',
          biteshipTrackingOrderStatus: 'confirmed',
        }),
      ),
    ).toBe(true);
  });

  it('shows request for packing/waiting_pickup without orderId', () => {
    const saleBase = {
      status: 'paid',
      marketplaceSource: '',
      items: [item({biteshipOrderId: ''})],
    };
    expect(
      showKolamWebstoreBiteshipRequest({
        ...saleBase,
        deliveryStatus: 'packing',
      }),
    ).toBe(true);
    expect(
      showKolamWebstoreBiteshipRequest({
        ...saleBase,
        deliveryStatus: 'waiting_pickup',
      }),
    ).toBe(true);
    expect(
      showKolamWebstoreBiteshipReschedule({
        ...saleBase,
        deliveryStatus: 'waiting_pickup',
      }),
    ).toBe(false);
  });

  it('shows reschedule only with real orderId', () => {
    const sale = {
      status: 'paid',
      deliveryStatus: 'waiting_pickup',
      marketplaceSource: '',
      items: [
        item({
          biteshipOrderId: 'o1',
          biteshipTrackingOrderStatus: 'allocated',
        }),
      ],
    };
    expect(showKolamWebstoreBiteshipRequest(sale)).toBe(false);
    expect(showKolamWebstoreBiteshipReschedule(sale)).toBe(true);
  });
});
