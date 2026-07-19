export interface KolamSearchFieldVisualContract {
  commandMenuSourceComponent: string;
  searchFieldSourceComponent: string;
  iconSize: number;
  defaultHeight: number;
  commandHeight: number;
  paddingX: number;
  gap: number;
  hasLeadingSearchIcon: boolean;
  hasTrailingEscapeHint: boolean;
}

const kolamSearchFieldVisual: KolamSearchFieldVisualContract = {
  commandMenuSourceComponent:
    'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\command-menu.tsx',
  searchFieldSourceComponent:
    'E:\\Projects\\da-inventory-frontend\\src\\components\\ui\\search-field.tsx',
  iconSize: 20,
  defaultHeight: 36,
  commandHeight: 44,
  paddingX: 10,
  gap: 8,
  hasLeadingSearchIcon: true,
  hasTrailingEscapeHint: true,
};

export function getKolamSearchFieldVisualContract(): KolamSearchFieldVisualContract {
  return {...kolamSearchFieldVisual};
}
