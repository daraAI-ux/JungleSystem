import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {summaryBlockStyles as styles} from './kolam-summary-block-styles';

export function KolamSummaryEmpty({text}: {text: string}) {
  return (
    <KolamCopyStack items={[{id: 'empty', text, style: styles.empty}]} />
  );
}
