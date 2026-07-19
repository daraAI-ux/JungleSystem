export interface KolamStatePillGroupItem {
  disabled?: boolean;
  id: string;
  label: string;
  selected?: boolean;
}

export interface KolamStatePillGroupProps {
  accessibilityLabel?: string;
  items: KolamStatePillGroupItem[];
}
