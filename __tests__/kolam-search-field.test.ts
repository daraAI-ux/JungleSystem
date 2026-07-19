import {getKolamSearchFieldVisualContract} from '../src/domain/kolam-search-field';

describe('getKolamSearchFieldVisualContract', () => {
  it('maps native search inputs to the live Kolam search and command menu patterns', () => {
    const contract = getKolamSearchFieldVisualContract();

    expect(contract.commandMenuSourceComponent).toBe(
      'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\command-menu.tsx',
    );
    expect(contract.searchFieldSourceComponent).toBe(
      'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\search-field.tsx',
    );
    expect(contract).toMatchObject({
      iconSize: 20,
      defaultHeight: 36,
      commandHeight: 44,
      paddingX: 10,
      gap: 8,
      hasLeadingSearchIcon: true,
      hasTrailingEscapeHint: true,
    });
  });

  it('returns cloned visual values so render code cannot mutate the contract', () => {
    const first = getKolamSearchFieldVisualContract();
    first.iconSize = 1;

    expect(getKolamSearchFieldVisualContract().iconSize).toBe(20);
  });
});
