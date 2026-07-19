import {
  getKolamFormSection,
  getKolamFormVisualContract,
} from '../src/domain/kolam-form';

describe('getKolamFormSection', () => {
  it('defines live-style two-column form sections for Cashflow and Customer', () => {
    expect(getKolamFormSection('cashflow-open')).toMatchObject({
      id: 'cashflow-open',
      title: 'Open Session',
    });
    expect(getKolamFormSection('customer-create')).toMatchObject({
      id: 'customer-create',
      title: 'Customer Detail',
    });
  });

  it('returns cloned section descriptors for render safety', () => {
    const first = getKolamFormSection('customer-create');
    first.title = 'Changed';

    expect(getKolamFormSection('customer-create').title).toBe('Customer Detail');
  });

  it('keeps native form spacing aligned with the live OpenSessionForm card', () => {
    const contract = getKolamFormVisualContract();

    expect(contract.sourceComponent).toBe(
      'E:\\Projects\\da-inventory-frontend\\src\\components\\form-section.tsx',
    );
    expect(contract.section).toEqual({
      layout: 'two-column',
      columnGap: 32,
      rowGap: 24,
      separator: true,
    });
    expect(contract.fieldGrid).toEqual({
      desktopColumns: 2,
      gap: 16,
    });
    expect(contract.actions).toEqual({
      justify: 'end',
      gap: 8,
      paddingTop: 16,
    });
    expect(contract.input).toEqual({
      height: 36,
      radius: 8,
      borderColor: 'input',
      shadow: 'shadow-xs',
      fontSize: 13,
    });
  });
});
