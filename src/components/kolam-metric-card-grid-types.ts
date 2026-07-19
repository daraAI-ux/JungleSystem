export interface KolamMetricCardItem {
  id: string;
  label: string;
  value: string | number;
}

export interface KolamMetricCardGridProps {
  accessibilityLabel?: string;
  items: KolamMetricCardItem[];
}
