export type KolamDescriptionListTone =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger';

export interface KolamDescriptionListRow {
  id: string;
  label: string;
  meta: string;
  onPress?: () => void;
  thumbnail?: import('react').ReactNode;
  tone: KolamDescriptionListTone;
  value: string;
}

export interface KolamDescriptionListProps {
  accessibilityLabel?: string;
  rows: KolamDescriptionListRow[];
}
