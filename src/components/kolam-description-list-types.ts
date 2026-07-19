export type KolamDescriptionListTone =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger';

export interface KolamDescriptionListRow {
  id: string;
  label: string;
  meta: string;
  tone: KolamDescriptionListTone;
  value: string;
}

export interface KolamDescriptionListProps {
  accessibilityLabel?: string;
  rows: KolamDescriptionListRow[];
}
