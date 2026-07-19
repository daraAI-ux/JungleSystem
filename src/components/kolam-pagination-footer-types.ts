export interface KolamPaginationState {
  from: number;
  hasNext: boolean;
  hasPrevious: boolean;
  page: number;
  pages: number[];
  to: number;
  total: number;
}

export interface KolamPaginationFooterProps {
  accessibilityLabel?: string;
  onPageChange: (page: number) => void;
  pagination: KolamPaginationState;
}
