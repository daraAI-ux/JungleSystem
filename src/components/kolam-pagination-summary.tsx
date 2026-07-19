import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {paginationFooterStyles as styles} from './kolam-pagination-footer-styles';
import type {KolamPaginationState} from './kolam-pagination-footer-types';

export function KolamPaginationSummary({
  pagination,
}: {
  pagination: KolamPaginationState;
}) {
  return (
    <KolamCopyStack
      items={[
        {
          id: 'summary',
          text: [pagination.from, '-', pagination.to, ' of ', pagination.total],
          style: styles.summary,
        },
      ]}
    />
  );
}
