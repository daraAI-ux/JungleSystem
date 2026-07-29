import {
  canEditKolamTaxPartyProfile,
  createEmptyKolamTaxPartyProfileFormState,
  hasKolamTaxPartyNpwp,
} from '../src/domain/kolam-tax-party';

describe('kolam tax party profile', () => {
  it('detects NPWP completeness like FE badge', () => {
    expect(
      hasKolamTaxPartyNpwp(
        createEmptyKolamTaxPartyProfileFormState('Vendor'),
      ),
    ).toBe(false);
    expect(
      hasKolamTaxPartyNpwp({
        npwp: '123456789012345',
        npwp16: '',
        legalName: 'Vendor',
      }),
    ).toBe(true);
    expect(
      hasKolamTaxPartyNpwp({
        npwp: '',
        npwp16: '1234567890123456',
        legalName: 'Vendor',
      }),
    ).toBe(true);
    expect(
      hasKolamTaxPartyNpwp({
        npwp: '123',
        npwp16: '456',
        legalName: 'Vendor',
      }),
    ).toBe(false);
  });

  it('allows edit for admin and tax:draft', () => {
    expect(
      canEditKolamTaxPartyProfile({
        roleKey: 'super_administrator',
        permissions: [],
      }),
    ).toBe(true);
    expect(
      canEditKolamTaxPartyProfile({
        roleKey: 'administrator',
        permissions: [],
      }),
    ).toBe(true);
    expect(
      canEditKolamTaxPartyProfile({
        roleKey: 'staff',
        permissions: [{ resource: 'tax', actions: ['draft'] }],
      }),
    ).toBe(true);
    expect(
      canEditKolamTaxPartyProfile({
        roleKey: 'staff',
        permissions: [{ resource: 'tax', actions: ['view'] }],
      }),
    ).toBe(false);
  });
});
