/**
 * Biteship booking / reschedule helpers — FE SoT:
 * `biteship-booking-status.ts` + `biteship-tracking-display.ts` (commit 3cfa01ed).
 */

import type {KolamSaleHistory, KolamSaleItem} from './kolam-sales';

export type KolamBiteshipBookingState = 'booked' | 'pending' | 'failed';

export const KOLAM_BITESHIP_INSTANT_COURIERS = new Set([
  'gojek',
  'grab',
  'lalamove',
  'paxel',
  'borzo',
]);

const RESCHEDULABLE = new Set([
  'confirmed',
  'scheduled',
  'allocated',
  'picking_up',
  'courier_not_found',
  'on_hold',
]);

export function isKolamBiteshipCheckoutItem(item: KolamSaleItem): boolean {
  return (
    item.shippingSource === 'biteship' ||
    Boolean(
      item.biteshipCourierCode.trim() && item.biteshipServiceCode.trim(),
    )
  );
}

/** Belum punya orderId Biteship — resi manual/palsu tetap dianggap perlu book. */
export function needsKolamBiteshipBooking(item: KolamSaleItem): boolean {
  if (!isKolamBiteshipCheckoutItem(item)) {
    return false;
  }
  if ((item.itemType || '') === 'service') {
    return false;
  }
  return !item.biteshipOrderId.trim();
}

export function isKolamBiteshipInstantCourier(code?: string | null): boolean {
  return KOLAM_BITESHIP_INSTANT_COURIERS.has(
    String(code || '')
      .trim()
      .toLowerCase(),
  );
}

export function canRescheduleKolamBiteshipItem(item: KolamSaleItem): boolean {
  if (!item.biteshipOrderId.trim()) {
    return false;
  }
  if (
    item.itemDeliveryStatus === 'on_delivery' ||
    item.itemDeliveryStatus === 'delivered'
  ) {
    return false;
  }
  const status = String(item.biteshipTrackingOrderStatus || '').toLowerCase();
  if (!status) {
    return true;
  }
  return RESCHEDULABLE.has(status);
}

export function resolveKolamBiteshipItemBooking(
  item: KolamSaleItem,
  saleStatus: string | undefined,
  histories?: KolamSaleHistory[] | null,
): {
  state: KolamBiteshipBookingState;
  message?: string;
  orderId?: string;
} | null {
  if (!isKolamBiteshipCheckoutItem(item)) {
    return null;
  }

  if (item.biteshipOrderId.trim()) {
    return {
      state: 'booked',
      orderId: item.biteshipOrderId,
    };
  }

  if (item.biteshipWaybillId.trim()) {
    return {
      state: 'failed',
      message:
        'Resi tanpa order Biteship (manual/palsu) — book ulang via Request jemput, jangan Reschedule',
    };
  }

  if (saleStatus !== 'paid') {
    return null;
  }

  const itemId = item.id;
  const failNote = [...(histories || [])]
    .reverse()
    .find(history => {
      const note = history.note || '';
      return (
        note.includes('Biteship auto-booking failed') ||
        (itemId && note.includes(`skipped for item ${itemId}`))
      );
    })?.note;

  if (failNote) {
    return {state: 'failed', message: failNote};
  }

  return {state: 'pending'};
}

export function defaultKolamBiteshipScheduleFields() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(10, 0, 0, 0);
  return {
    deliveryDate: date.toISOString().slice(0, 10),
    deliveryTime: '10:00',
  };
}

export function formatKolamBiteshipDeliveryDatetime(
  value?: string | null,
): string | null {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toLocaleString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function firstKolamBiteshipScheduledLabel(
  items: KolamSaleItem[],
): string | null {
  for (const item of items) {
    const label = formatKolamBiteshipDeliveryDatetime(
      item.biteshipTrackingDeliveryDatetime,
    );
    if (label) {
      return label;
    }
  }
  return null;
}

/** Webstore paid + biteship items yang perlu book (packing / waiting_pickup tanpa orderId). */
export function showKolamWebstoreBiteshipRequest(sale: {
  status: string;
  deliveryStatus: string;
  marketplaceSource?: string | null;
  items: KolamSaleItem[];
}): boolean {
  const source = String(sale.marketplaceSource || '').toLowerCase();
  if (source === 'shopee' || source === 'tokopedia') {
    return false;
  }
  if (sale.status !== 'paid') {
    return false;
  }
  const biteshipItems = sale.items.filter(isKolamBiteshipCheckoutItem);
  if (biteshipItems.length === 0) {
    return false;
  }
  if (!biteshipItems.some(needsKolamBiteshipBooking)) {
    return false;
  }
  return (
    sale.deliveryStatus === 'packing' || sale.deliveryStatus === 'waiting_pickup'
  );
}

/** waiting_pickup + orderId nyata + status boleh reschedule. */
export function showKolamWebstoreBiteshipReschedule(sale: {
  status: string;
  deliveryStatus: string;
  marketplaceSource?: string | null;
  items: KolamSaleItem[];
}): boolean {
  const source = String(sale.marketplaceSource || '').toLowerCase();
  if (source === 'shopee' || source === 'tokopedia') {
    return false;
  }
  if (sale.status !== 'paid') {
    return false;
  }
  if (sale.deliveryStatus !== 'waiting_pickup') {
    return false;
  }
  const biteshipItems = sale.items.filter(isKolamBiteshipCheckoutItem);
  if (!biteshipItems.some(item => item.biteshipOrderId.trim())) {
    return false;
  }
  return biteshipItems.some(canRescheduleKolamBiteshipItem);
}
