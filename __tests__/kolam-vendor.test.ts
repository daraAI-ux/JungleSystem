import {
  formatKolamVendorAddress,
  getKolamSupplierRouteId,
  getKolamVendorStatusLabel,
  isKolamSupplierRoute,
  normalizeKolamVendor,
  normalizeKolamVendorDetail,
  normalizeKolamVendorList,
} from '../src/domain/kolam-vendor';

describe('kolam vendor / supplier domain', () => {
  it('recognizes supplier routes', () => {
    expect(isKolamSupplierRoute('/suppliers')).toBe(true);
    expect(isKolamSupplierRoute('/suppliers/abc')).toBe(true);
    expect(isKolamSupplierRoute('/suppliers/abc/edit')).toBe(true);
    expect(isKolamSupplierRoute('/products')).toBe(false);
    expect(getKolamSupplierRouteId('/suppliers/abc')).toBe('abc');
    expect(getKolamSupplierRouteId('/suppliers')).toBe(null);
    expect(getKolamSupplierRouteId('/suppliers/create')).toBe(null);
  });

  it('normalizes list and detail vendor payloads', () => {
    const list = normalizeKolamVendorList({
      data: [
        {
          _id: 'v1',
          name: 'Pemasok Satu',
          email: 'a@example.com',
          phone: '081234567890',
          status: 'active',
          isOfficialDistributor: true,
          city: 'Jakarta',
          country: 'Indonesia',
          poCount: 4,
          productCount: 2,
          brands: [{ _id: 'b1', name: 'Merek A' }],
          photos: ['uploads/v1.jpg'],
          createdBy: {
            _id: 'u1',
            first_name: 'Budi',
            last_name: 'Santoso',
            email: 'budi@example.com',
          },
        },
      ],
    });

    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      id: 'v1',
      name: 'Pemasok Satu',
      status: 'active',
      isOfficialDistributor: true,
      poCount: 4,
      productCount: 2,
      createdByName: 'Budi Santoso',
    });
    expect(list[0].brands).toEqual([{ id: 'b1', name: 'Merek A' }]);
    expect(getKolamVendorStatusLabel(list[0].status)).toBe('Aktif');
    expect(formatKolamVendorAddress(list[0])).toContain('Jakarta');

    const detail = normalizeKolamVendorDetail({
      data: {
        _id: 'v2',
        name: 'Pemasok Dua',
        status: 'blacklisted',
        bankName: 'BCA',
        bankAccountNumber: '123',
        link: ['https://example.com'],
        speciesCount: 3,
        packingCount: 1,
      },
    });
    expect(detail).toMatchObject({
      id: 'v2',
      status: 'blacklisted',
      bankName: 'BCA',
      speciesCount: 3,
      packingCount: 1,
    });
    expect(detail.links).toEqual(['https://example.com']);
    expect(getKolamVendorStatusLabel(detail.status)).toBe('Diblacklist');
  });

  it('keeps picker-safe defaults when optional fields missing', () => {
    const vendor = normalizeKolamVendor({
      _id: 'v3',
      name: 'Minimal',
    });
    expect(vendor).toMatchObject({
      id: 'v3',
      name: 'Minimal',
      email: '',
      phone: '',
      status: 'active',
      isOfficialDistributor: false,
      brands: [],
      photos: [],
      poCount: 0,
    });
  });
});
