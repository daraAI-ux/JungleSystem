import React from 'react';
import type {SummaryRow} from '../lib/unified-summary';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamSummaryBlockTitle} from './kolam-summary-block-title';
import {KolamSummaryEmpty} from './kolam-summary-empty';
import {KolamSummaryLines} from './kolam-summary-lines';

export interface KolamSummaryBlockProps {
  emptyText?: string;
  rows: SummaryRow[];
  title: string;
}

export function KolamSummaryBlock({
  emptyText = 'Data belum tersedia.',
  rows,
  title,
}: KolamSummaryBlockProps) {
  return (
    <KolamCardFrame variant="summary">
      <KolamSummaryBlockTitle title={title} />
      {rows.length ? (
        <KolamSummaryLines rows={rows} title={title} />
      ) : (
        <KolamSummaryEmpty text={emptyText} />
      )}
    </KolamCardFrame>
  );
}
