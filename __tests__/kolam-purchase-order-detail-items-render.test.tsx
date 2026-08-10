import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {KolamDataTableHeader} from '../src/components/kolam-data-table-header';
import {KolamDataTableRowFrame} from '../src/components/kolam-data-table-row-frame';
import {KolamDescriptionList} from '../src/components/kolam-description-list';
import {getKolamPOVendorInvoiceFileName} from '../src/components/kolam-purchase-order-surface';
import {
  getKolamPOItemCode,
  getKolamPOItemDisplayTitle,
  getKolamPOItemUnitLabel,
  getKolamPOItemVariantLabel,
  getKolamPOPaymentStatusLabel,
  getKolamPORefundStatusLabel,
  getKolamPOStatusLabel,
  normalizeKolamPurchaseOrder,
} from '../src/domain/kolam-purchase-order';
import {getKolamTableColumns} from '../src/domain/kolam-table';
import {formatRupiah} from '../src/lib/money';

describe('purchase order detail item table smoke', () => {
  it('derives a readable vendor invoice file name from uploaded path', () => {
    expect(
      getKolamPOVendorInvoiceFileName(
        '/uploads/po/PO-001/Invoice%20Vendor%20Agustus.pdf?token=abc',
      ),
    ).toBe('Invoice Vendor Agustus.pdf');
  });

  it('renders detail description + items table for a completed PO', () => {
    const po = normalizeKolamPurchaseOrder({
      data: {
        _id: 'po-12',
        poCode: 'PO-12-07-2026-392132',
        vendor: {_id: 'v1', name: 'Java petco'},
        wallet: {_id: 'w1', name: 'Kas', type: 'cash'},
        items: [
          {
            _id: 'item-1',
            product: {_id: 'p1', name: 'Produk A', sku: 'SKU-A'},
            variant: {_id: 'var-1', tier1Value: 'L', sku: 'SKU-A-L'},
            quantity: 2,
            unitPrice: 15000,
            receivedQuantity: 2,
            unit: {initial: 'pcs', name: 'Pcs'},
          },
          {
            _id: 'item-2',
            species: {
              _id: 's1',
              commonName: 'Rana',
              scientificName: 'Rana sp.',
            },
            quantity: 3,
            unitPrice: 8000,
          },
        ],
        status: 'completed',
        paymentStatus: 'paid',
        refundStatus: 'none',
        total: 54000,
        shippingCost: 0,
        finalTotal: 54000,
        paymentAmount: 54000,
        histories: [
          {
            _id: 'h1',
            status: 'completed',
            note: 'done',
            changedAt: '2026-07-12T10:00:00.000Z',
          },
        ],
      },
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      renderer = ReactTestRenderer.create(
        <>
          <KolamDescriptionList
            accessibilityLabel="info"
            rows={[
              {
                id: 'code',
                label: 'Kode PO',
                value: po.poCode || '—',
                meta: '',
                tone: 'default',
              },
              {
                id: 'status',
                label: 'Status',
                value: getKolamPOStatusLabel(po.status),
                meta: '',
                tone: 'success',
              },
              {
                id: 'pay',
                label: 'Status bayar',
                value: getKolamPOPaymentStatusLabel(po.paymentStatus),
                meta: '',
                tone: 'success',
              },
              {
                id: 'refund',
                label: 'Status refund',
                value: getKolamPORefundStatusLabel(po.refundStatus),
                meta: '',
                tone: 'default',
              },
              {
                id: 'total',
                label: 'Total',
                value: formatRupiah(po.total),
                meta: '',
                tone: 'default',
              },
            ]}
          />
          <KolamDataTableHeader
            columns={getKolamTableColumns('purchase-order-items')}
          />
          {po.items.map(item => (
            <KolamDataTableRowFrame key={item.id || `${item.refId}`}>
              <Text>{getKolamPOItemDisplayTitle(item)}</Text>
              <Text>{getKolamPOItemCode(item)}</Text>
              <Text>{getKolamPOItemVariantLabel(item.variant)}</Text>
              <Text>{String(item.quantity)}</Text>
              <Text>{getKolamPOItemUnitLabel(item)}</Text>
              <Text>{formatRupiah(item.unitPrice)}</Text>
              <Text>
                {item.receivedQuantity != null
                  ? String(item.receivedQuantity)
                  : '—'}
              </Text>
              <Text>{formatRupiah(item.lineTotal)}</Text>
            </KolamDataTableRowFrame>
          ))}
        </>,
      );
    });

    const labels = renderer!
      .root.findAllByType(Text)
      .flatMap(node => {
        const value = node.props.children;
        if (typeof value === 'string' || typeof value === 'number') {
          return [String(value)];
        }
        return [];
      });

    expect(labels).toEqual(
      expect.arrayContaining([
        'Produk',
        'SKU / Kode',
        'Varian',
        'Produk A',
        'Rana',
        'Selesai',
        'Lunas',
      ]),
    );
  });
});
