import {
  createEmptyKolamShippingMethodFormState,
  createKolamShippingMethodFormState,
  createKolamShippingMethodSavePayload,
  formatKolamShippingMethodCategoryLabel,
  formatKolamShippingMethodEstimatedDaysLabel,
  formatKolamShippingMethodPricingTypeLabel,
  formatKolamShippingMethodRateSourceLabel,
  getKolamShippingMethodBreadcrumbPath,
  isKolamShippingMethodBiteship,
  isKolamShippingMethodRoute,
  normalizeKolamShippingMethod,
  normalizeKolamShippingMethodList,
  normalizeKolamShippingMethodListResult,
  parseKolamShippingMethodRoute,
  toKolamShippingMethodPicker,
  validateKolamShippingMethodForm,
  type KolamShippingMethod,
} from '../src/domain/kolam-shipping-method';

describe('kolam-shipping-method domain', () => {
  const samplePayload = {
    _id: 'sm1',
    name: 'jne-reg',
    displayName: 'JNE Reguler',
    description: 'Layanan reguler',
    category: 'regular',
    rateSource: 'manual',
    pricingModel: { type: 'fixed', price: 15000 },
    estimatedDays: { min: 2, max: 5 },
    specialConditions: {
      restrictedRegions: ['Jakarta'],
      minimumOrderAmount: 100000,
      maximumWeight: 10,
      maximumDimension: { length: 30, width: 20, height: 10 },
    },
    insurance: { enabled: true, type: 'percentage', price: 2.5 },
    isActive: true,
    isAvailableOnWebstore: false,
    icon: '/uploads/jne.png',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  };

  it('normalizes a shipping method with picker + admin fields', () => {
    const method = normalizeKolamShippingMethod(samplePayload);
    expect(method.id).toBe('sm1');
    expect(method.name).toBe('jne-reg');
    expect(method.displayName).toBe('JNE Reguler');
    expect(method.pricingType).toBe('fixed');
    expect(method.pricingPrice).toBe(15000);
    expect(method.estimatedMinDays).toBe(2);
    expect(method.estimatedMaxDays).toBe(5);
    expect(method.restrictedRegions).toEqual(['Jakarta']);
    expect(method.maximumWeight).toBe(10);
    expect(method.insuranceEnabled).toBe(true);
    expect(method.insuranceType).toBe('percentage');
    expect(method.insurancePrice).toBe(2.5);
    expect(method.isActive).toBe(true);
    expect(method.isAvailableOnWebstore).toBe(false);
    expect(method.logoUri).toContain('/uploads/jne.png');
  });

  it('keeps picker summary compatible with species shape', () => {
    const method = normalizeKolamShippingMethod(samplePayload);
    const picker = toKolamShippingMethodPicker(method);
    expect(picker).toEqual({
      id: 'sm1',
      displayName: 'JNE Reguler',
      logoUri: method.logoUri,
      category: 'regular',
      pricingType: 'fixed',
      pricingPrice: 15000,
      estimatedMinDays: 2,
      estimatedMaxDays: 5,
      restrictedRegions: ['Jakarta'],
      maximumWeight: 10,
      maximumDimensionLength: 30,
      maximumDimensionWidth: 20,
      maximumDimensionHeight: 10,
      minimumOrderAmount: 100000,
    });
  });

  it('normalizes list and paginated result', () => {
    const list = normalizeKolamShippingMethodList({
      data: [samplePayload],
    });
    expect(list).toHaveLength(1);

    const page = normalizeKolamShippingMethodListResult({
      data: [samplePayload],
      pagination: { page: 2, limit: 10, total: 21, totalPages: 3 },
    });
    expect(page.page).toBe(2);
    expect(page.total).toBe(21);
    expect(page.totalPages).toBe(3);
    expect(page.data[0]?.id).toBe('sm1');
  });

  it('detects biteship methods and formats labels', () => {
    const biteship = normalizeKolamShippingMethod({
      _id: 'b1',
      name: 'jnt',
      displayName: 'J&T',
      rateSource: 'biteship',
      biteshipCourierCode: 'jnt',
      category: 'instant',
      pricingModel: { type: 'fixed', price: 0 },
      estimatedDays: { min: 0, max: 1 },
      isActive: true,
    });
    expect(isKolamShippingMethodBiteship(biteship)).toBe(true);
    expect(formatKolamShippingMethodRateSourceLabel(biteship)).toBe('Biteship');
    expect(formatKolamShippingMethodCategoryLabel('instant')).toBe('Instan');
    expect(formatKolamShippingMethodPricingTypeLabel('per_kg')).toBe(
      'Per Kilogram',
    );
    expect(formatKolamShippingMethodEstimatedDaysLabel(biteship)).toBe(
      '0 - 1 hari',
    );
  });

  it('parses routes and breadcrumbs', () => {
    expect(isKolamShippingMethodRoute('/shipping-method')).toBe(true);
    expect(isKolamShippingMethodRoute('/shipping-method/create')).toBe(true);
    expect(isKolamShippingMethodRoute('/products')).toBe(false);
    expect(parseKolamShippingMethodRoute('/shipping-method')).toEqual({
      mode: 'list',
      id: null,
    });
    expect(parseKolamShippingMethodRoute('/shipping-method/create')).toEqual({
      mode: 'new',
      id: null,
    });
    expect(parseKolamShippingMethodRoute('/shipping-method/abc')).toEqual({
      mode: 'detail',
      id: 'abc',
    });
    expect(parseKolamShippingMethodRoute('/shipping-method/abc/edit')).toEqual({
      mode: 'edit',
      id: 'abc',
    });
    expect(
      getKolamShippingMethodBreadcrumbPath('edit', {
        id: 'abc',
        displayName: 'X',
      }),
    ).toBe('/shipping-method/abc/edit');
  });

  it('builds and validates manual save payload', () => {
    const form = createEmptyKolamShippingMethodFormState();
    form.rateSource = 'manual';
    form.name = 'a';
    expect(validateKolamShippingMethodForm(form)).toMatch(/minimal 2/);

    form.name = 'JNE REG';
    form.displayName = 'JNE Reguler';
    form.pricingPrice = '12000';
    form.restrictedRegionsText = 'Jakarta, Bandung';
    form.minimumOrderAmount = '50000';
    expect(validateKolamShippingMethodForm(form)).toBeNull();

    const payload = createKolamShippingMethodSavePayload(form);
    expect(payload).toMatchObject({
      name: 'JNE REG',
      displayName: 'JNE Reguler',
      rateSource: 'manual',
      pricingModel: { type: 'fixed', price: 12000 },
      specialConditions: {
        restrictedRegions: ['Jakarta', 'Bandung'],
        minimumOrderAmount: 50000,
      },
    });
  });

  it('validates biteship form and builds payload', () => {
    const form = createEmptyKolamShippingMethodFormState();
    form.rateSource = 'biteship';
    expect(validateKolamShippingMethodForm(form)).toMatch(/kurir/i);

    form.biteshipCourierCode = 'jne';
    form.biteshipCourierName = 'JNE';
    form.biteshipServiceCodes = ['REG'];
    form.biteshipServiceNames = ['Reguler'];
    form.category = 'regular';
    expect(validateKolamShippingMethodForm(form)).toBeNull();

    const payload = createKolamShippingMethodSavePayload(form);
    expect(payload).toMatchObject({
      rateSource: 'biteship',
      biteshipCourierCode: 'jne',
      biteshipServiceCodes: ['REG'],
      pricingModel: { type: 'fixed', price: 0 },
    });
  });

  it('hydrates form state from detail', () => {
    const method = normalizeKolamShippingMethod(samplePayload);
    const form = createKolamShippingMethodFormState(method);
    expect(form.id).toBe('sm1');
    expect(form.name).toBe('jne-reg');
    expect(form.pricingPrice).toBe('15000');
    expect(form.insuranceEnabled).toBe(true);
    expect(form.restrictedRegionsText).toBe('Jakarta');
    expect(form.isAvailableOnWebstore).toBe(false);
  });
});
