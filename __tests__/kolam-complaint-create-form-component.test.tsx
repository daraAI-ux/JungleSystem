import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {KolamComplaintCreateForm} from '../src/components/kolam-complaint-create-form';
import type {KolamComplaintController} from '../src/hooks/use-kolam-complaint-controller';

const mockGetKolamSalesList = jest.fn();
const mockGetKolamCustomerList = jest.fn();
const mockGetKolamSale = jest.fn();

jest.mock('../src/services/kolam-sales-api', () => ({
  getKolamSalesList: (...args: unknown[]) => mockGetKolamSalesList(...args),
  getKolamSale: (...args: unknown[]) => mockGetKolamSale(...args),
}));

jest.mock('../src/services/kolam-customer-api', () => ({
  getKolamCustomerList: (...args: unknown[]) => mockGetKolamCustomerList(...args),
}));

jest.mock('../src/services/native-file-picker', () => ({
  pickNativeImageFile: jest.fn(async () => null),
}));

function flattenText(value: React.ReactNode): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(flattenText);
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)];
  }
  return [];
}

function renderText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root
    .findAllByType(Text)
    .flatMap(node => flattenText(node.props.children));
}

describe('KolamComplaintCreateForm', () => {
  beforeEach(() => {
    mockGetKolamSalesList.mockReset();
    mockGetKolamCustomerList.mockReset();
    mockGetKolamSale.mockReset();
    mockGetKolamCustomerList.mockResolvedValue({items: [], pagination: {}});
  });

  it('loads eligible invoices from KolamSaleListResult.data without crashing', async () => {
    mockGetKolamSalesList.mockImplementation(
      async (filters: {lifecycle: string}) => {
        if (filters.lifecycle === 'active') {
          return {
            data: [
              {
                id: 'sale-1',
                invoiceCode: 'INV-CREATE-1',
                status: 'paid',
                deliveryStatus: 'delivered',
                buyerLabel: 'Budi',
                customer: {name: 'Budi'},
                items: [{id: 'i1', quantity: 1, title: 'Produk A'}],
              },
            ],
            pagination: {page: 1, limit: 100, total: 1, totalPages: 1},
          };
        }
        return {
          data: [],
          pagination: {page: 1, limit: 100, total: 0, totalPages: 1},
        };
      },
    );

    const controller = {
      error: null,
      mutating: false,
      onCreateComplaint: jest.fn(async () => null),
    } as unknown as KolamComplaintController;

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamComplaintCreateForm
          controller={controller}
          route="/complaints/create"
        />,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockGetKolamSalesList).toHaveBeenCalled();
    const text = renderText(renderer!);
    expect(text).toContain('Buat Keluhan Baru');
    expect(text).not.toContain('Gagal memuat daftar penjualan');
  });
});
