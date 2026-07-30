import {
  createEmptyKolamSourceFormState,
  createKolamSourceFormState,
  createKolamSourceSavePayload,
  estimateKolamSourceCostOnAmount,
  getKolamSourceIdFromRoute,
  getKolamSourceRouteMode,
  isKolamSourceRoute,
  normalizeKolamActiveSourceOptions,
  normalizeKolamSource,
  normalizeKolamSourceList,
  validateKolamSourceForm,
} from '../src/domain/kolam-source';
import {
  getKolamNavigationItemByRoute,
  getKolamNavigationRouteTarget,
} from '../src/domain/kolam-navigation';

describe('kolam-source domain', () => {
  it('parses source routes', () => {
    expect(isKolamSourceRoute('/source')).toBe(true);
    expect(isKolamSourceRoute('/source/create')).toBe(true);
    expect(isKolamSourceRoute('/source/abc')).toBe(true);
    expect(isKolamSourceRoute('/source/abc/edit')).toBe(true);
    expect(isKolamSourceRoute('/sales')).toBe(false);
    expect(getKolamSourceRouteMode('/source')).toBe('list');
    expect(getKolamSourceRouteMode('/source/create')).toBe('new');
    expect(getKolamSourceRouteMode('/source/abc')).toBe('detail');
    expect(getKolamSourceRouteMode('/source/abc/edit')).toBe('edit');
    expect(getKolamSourceIdFromRoute('/source/abc/edit')).toBe('abc');
    expect(getKolamSourceIdFromRoute('/source/create')).toBe(null);
  });

  it('normalizes list and active catalog payloads', () => {
    const list = normalizeKolamSourceList({
      data: [
        {
          _id: 's1',
          name: 'Shopee',
          type: 'online',
          isActive: true,
          isMarketplace: true,
          costFields: [{ name: 'Biaya layanan', type: 'percentage', value: 10 }],
          markupPercent: 5,
          markupFixed: 1000,
          logo: 'media/sources/shopee.png',
          wallet: { _id: 'w1', name: 'Escrow', type: 'virtual' },
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    expect(list.items).toHaveLength(1);
    expect(list.items[0].id).toBe('s1');
    expect(list.items[0].wallet?.name).toBe('Escrow');
    expect(list.items[0].costFields[0].name).toBe('Biaya layanan');
    expect(list.items[0].logoUri).toContain('media/sources/shopee.png');

    const active = normalizeKolamActiveSourceOptions({
      data: [
        {
          _id: 's1',
          name: 'Shopee',
          type: 'online',
          logo: 'media/sources/shopee.png',
        },
      ],
    });
    expect(active[0]).toEqual(
      expect.objectContaining({
        id: 's1',
        name: 'Shopee',
        type: 'online',
      }),
    );
    expect(active[0].logoUri).toContain('media/sources/shopee.png');
  });

  it('validates form and builds save payload', () => {
    const empty = createEmptyKolamSourceFormState();
    expect(validateKolamSourceForm(empty)).toMatch(/Nama/);

    const marketplace = {
      ...empty,
      name: 'Tokopedia',
      isMarketplace: true,
      walletId: null,
    };
    expect(validateKolamSourceForm(marketplace)).toMatch(/Dompet/);

    const valid = {
      ...empty,
      name: 'POS',
      type: 'offline' as const,
      isMarketplace: false,
      markupPercent: '0',
      markupFixed: '0',
      costFields: [{ name: 'Admin', type: 'fixed' as const, value: 500 }],
    };
    expect(validateKolamSourceForm(valid)).toBeNull();

    const payload = createKolamSourceSavePayload({
      ...valid,
      isMarketplace: true,
      walletId: 'wallet-1',
      commissionRecipientMode: 'pic',
      defaultCommissionRecipientIds: ['u1'],
    });
    expect(payload.wallet).toBe('wallet-1');
    expect(payload.commissionRecipientMode).toBe('equal_all_employees');
    expect(payload.defaultCommissionRecipients).toEqual([]);
  });

  it('estimates cost fields and round-trips form state', () => {
    const source = normalizeKolamSource({
      _id: 's2',
      name: 'Webstore',
      type: 'online',
      isActive: true,
      isMarketplace: false,
      costFields: [
        { name: 'Fee %', type: 'percentage', value: 10 },
        { name: 'Fee flat', type: 'fixed', value: 1000 },
      ],
      commissionEnabled: true,
      commissionRecipientMode: 'pic',
      defaultCommissionRecipients: [
        {
          _id: 'u1',
          first_name: 'Ada',
          last_name: 'Lovelace',
          isEmployee: true,
        },
      ],
    });

    expect(estimateKolamSourceCostOnAmount(source.costFields, 100_000)).toBe(
      11_000,
    );

    const form = createKolamSourceFormState(source);
    expect(form.defaultCommissionRecipientIds).toEqual(['u1']);
    expect(form.commissionRecipientMode).toBe('pic');
  });
});

describe('kolam-source navigation', () => {
  it('keeps /source on kolam module with Indonesian copy', () => {
    const item = getKolamNavigationItemByRoute('/source');
    expect(item).toEqual(
      expect.objectContaining({
        label: 'Sumber Penjualan',
        route: '/source',
      }),
    );
    expect(item?.description).toMatch(/sumber penjualan/i);
    expect(getKolamNavigationRouteTarget(item!).moduleId).toBe('kolam');
  });
});
