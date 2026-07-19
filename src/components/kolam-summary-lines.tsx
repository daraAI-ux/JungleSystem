import React from 'react';
import type {SummaryRow} from '../lib/unified-summary';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamSummaryLine} from './kolam-summary-line';

export function KolamSummaryLines({
  rows,
  title,
}: {
  rows: SummaryRow[];
  title: string;
}) {
  return (
    <KolamMappedList
      items={rows}
      getKey={row => `${title}-${row.label}`}
      renderItem={row => <KolamSummaryLine row={row} />}
    />
  );
}
