import {
  BITESHIP_COURIERS,
  buildBiteshipCouriersFromCatalog,
  buildMethodName,
  findCourier,
  findService,
  getKolamShippingCourierCatalogStats,
  normalizeKolamShippingCourierCatalogItem,
  normalizeKolamShippingCourierCatalogList,
} from '../src/domain/kolam-shipping-courier-catalog';

describe('kolam-shipping-courier-catalog domain', () => {
  const sampleRow = {
    _id: 'cat1',
    provider: 'biteship',
    courierCode: 'jne',
    courierName: 'JNE',
    serviceCode: 'reg',
    serviceName: 'REG',
    description: 'Regular service',
    category: 'regular',
    isActive: true,
    syncedAt: '2026-01-01T00:00:00.000Z',
  };

  it('normalizes catalog rows', () => {
    const item = normalizeKolamShippingCourierCatalogItem(sampleRow);
    expect(item.id).toBe('cat1');
    expect(item.courierCode).toBe('jne');
    expect(item.serviceCode).toBe('reg');
    expect(item.isActive).toBe(true);

    const list = normalizeKolamShippingCourierCatalogList({ data: [sampleRow] });
    expect(list).toHaveLength(1);
  });

  it('builds couriers from active catalog rows', () => {
    const couriers = buildBiteshipCouriersFromCatalog([
      normalizeKolamShippingCourierCatalogItem(sampleRow),
      normalizeKolamShippingCourierCatalogItem({
        ...sampleRow,
        _id: 'cat2',
        serviceCode: 'yes',
        serviceName: 'YES',
      }),
      normalizeKolamShippingCourierCatalogItem({
        ...sampleRow,
        _id: 'cat3',
        isActive: false,
        serviceCode: 'oke',
        serviceName: 'OKE',
      }),
    ]);

    expect(couriers).toHaveLength(1);
    expect(couriers[0]?.code).toBe('jne');
    expect(couriers[0]?.services.map(service => service.code)).toEqual([
      'reg',
      'yes',
    ]);
  });

  it('finds courier/service and builds method name', () => {
    const courier = findCourier('jne', BITESHIP_COURIERS);
    expect(courier?.name).toBe('JNE');

    const service = findService('jne', 'reg', BITESHIP_COURIERS);
    expect(service?.name).toBe('REG');

    expect(buildMethodName('JNE', 'REG')).toBe('JNE - REG');
    expect(buildMethodName('JNE', null)).toBe('JNE');
  });

  it('computes catalog stats', () => {
    const stats = getKolamShippingCourierCatalogStats([
      normalizeKolamShippingCourierCatalogItem(sampleRow),
      normalizeKolamShippingCourierCatalogItem({
        ...sampleRow,
        _id: 'cat2',
        courierCode: 'jnt',
        courierName: 'J&T',
        serviceCode: 'ez',
        serviceName: 'EZ',
      }),
      normalizeKolamShippingCourierCatalogItem({
        ...sampleRow,
        _id: 'cat3',
        isActive: false,
      }),
    ]);

    expect(stats).toEqual({
      couriers: 2,
      services: 3,
      active: 2,
      inactive: 1,
    });
  });
});
