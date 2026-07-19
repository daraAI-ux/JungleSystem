import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {summaryBlockStyles as styles} from './kolam-summary-block-styles';

export function KolamSummaryBlockTitle({title}: {title: string}) {
  return (
    <KolamCopyStack items={[{id: 'title', text: title, style: styles.title}]} />
  );
}
