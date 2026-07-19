export type KolamSummaryCardListVariant = 'panel' | 'compact';

export interface KolamSummaryCardItem {
  badges?: string[];
  id: string;
  meta: string;
  title: string;
}

export interface KolamSummaryCardListProps {
  accessibilityLabel?: string;
  items: KolamSummaryCardItem[];
  variant?: KolamSummaryCardListVariant;
}
