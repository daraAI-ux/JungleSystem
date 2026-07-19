import {getKolamCommandMenuVisualContract} from '../src/domain/kolam-command-menu';

describe('getKolamCommandMenuVisualContract', () => {
  it('maps native command results to the live Kolam CommandMenu list pattern', () => {
    const contract = getKolamCommandMenuVisualContract();

    expect(contract.sourceComponent).toBe(
      'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\command-menu.tsx',
    );
    expect(contract).toMatchObject({
      paletteSourceComponent:
        'E:\\Projects\\da-inventory-frontend\\src\\components\\command-palette.tsx',
      shortcut: 'k',
      searchPlaceholder: 'Search pages...',
      sectionLimit: 5,
      showStatsBar: false,
      showMetaColumn: false,
      showDescription: true,
      panelMaxWidth: 576,
      panelTopOffset: 96,
      searchBorderBottom: true,
      listPadding: 8,
      sectionHeaderPaddingX: 10,
      rowMinHeight: 52,
      rowPaddingX: 10,
      rowPaddingY: 8,
      rowGap: 10,
      iconSize: 28,
      descriptionLineHeight: 16,
      closeActionLabel: 'Close command palette',
      closeActionIconKind: 'x',
    });
  });

  it('returns cloned visual values so render code cannot mutate the contract', () => {
    const first = getKolamCommandMenuVisualContract();
    first.rowMinHeight = 1;

    expect(getKolamCommandMenuVisualContract().rowMinHeight).toBe(52);
  });
});
