export type KolamStatsCardTone = 'default' | 'success' | 'warning' | 'muted';

export interface KolamStatsCardItem {
  detail: string;
  id: string;
  label: string;
  tone: KolamStatsCardTone;
  value: string;
}

export interface KolamStatsCardStripProps {
  cards: KolamStatsCardItem[];
}
