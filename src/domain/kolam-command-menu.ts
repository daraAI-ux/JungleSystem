export interface KolamCommandMenuVisualContract {
  sourceComponent: string;
  paletteSourceComponent: string;
  shortcut: 'k';
  searchPlaceholder: string;
  sectionLimit: number;
  showStatsBar: boolean;
  showMetaColumn: boolean;
  showDescription: boolean;
  panelMaxWidth: number;
  panelTopOffset: number;
  searchBorderBottom: boolean;
  listPadding: number;
  sectionHeaderPaddingX: number;
  rowMinHeight: number;
  rowPaddingX: number;
  rowPaddingY: number;
  rowGap: number;
  iconSize: number;
  descriptionLineHeight: number;
  closeActionLabel: string;
  closeActionIconKind: 'x';
}

const kolamCommandMenuVisual: KolamCommandMenuVisualContract = {
  sourceComponent:
    'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\command-menu.tsx',
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
};

export function getKolamCommandMenuVisualContract(): KolamCommandMenuVisualContract {
  return {
    ...kolamCommandMenuVisual,
  };
}
