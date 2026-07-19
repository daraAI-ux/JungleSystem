import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import type {SummaryRow} from '../lib/unified-summary';
import {summaryBlockStyles as styles} from './kolam-summary-block-styles';

export function KolamSummaryLine({row}: {row: SummaryRow}) {
  return (
    <KolamCopyStack
      containerStyle={styles.line}
      items={[
        {id: 'label', text: row.label, style: styles.lineLabel},
        {
          id: 'value',
          text: row.value,
          style: [
            styles.lineValue,
            row.tone === 'warning' && styles.lineWarning,
          ],
        },
      ]}
    />
  );
}
