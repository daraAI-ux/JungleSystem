import React from 'react';
import {KolamInlineFrame} from './kolam-inline-frame';
import {
  KolamTotalRowLabel,
  KolamTotalRowValue,
} from './kolam-total-row-text';
import type {KolamTotalRowProps} from './kolam-total-row-types';

export type {KolamTotalRowProps} from './kolam-total-row-types';

export function KolamTotalRow({
  label,
  strong = false,
  value,
}: KolamTotalRowProps) {
  return (
    <KolamInlineFrame variant="totalRow">
      <KolamTotalRowLabel label={label} strong={strong} />
      <KolamTotalRowValue strong={strong} value={value} />
    </KolamInlineFrame>
  );
}