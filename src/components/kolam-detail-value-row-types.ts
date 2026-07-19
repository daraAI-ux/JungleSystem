export type KolamDetailValueTone = 'default' | 'success' | 'warning' | 'danger';

export interface KolamDetailValueRowProps {
  label: string;
  meta: string;
  tone?: KolamDetailValueTone;
  value: string;
}
