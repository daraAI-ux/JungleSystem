import React from 'react';
import {KolamHeaderFrame} from './kolam-header-frame';
import {KolamPaginationNav} from './kolam-pagination-nav';
import {KolamPaginationSummary} from './kolam-pagination-summary';
import type {KolamPaginationFooterProps} from './kolam-pagination-footer-types';

export type {
  KolamPaginationFooterProps,
  KolamPaginationState,
} from './kolam-pagination-footer-types';

export function KolamPaginationFooter({
  accessibilityLabel,
  onPageChange,
  pagination,
}: KolamPaginationFooterProps) {
  return (
    <KolamHeaderFrame
      accessibilityLabel={accessibilityLabel}
      variant="paginationFooter">
      <KolamPaginationSummary pagination={pagination} />
      <KolamPaginationNav
        pagination={pagination}
        onPageChange={onPageChange}
      />
    </KolamHeaderFrame>
  );
}