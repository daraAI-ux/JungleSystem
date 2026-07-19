import React from 'react';
import {KolamDetailValueBadge} from './kolam-detail-value-badge';
import {KolamDetailValueCopy} from './kolam-detail-value-copy';
import {KolamRowFrame} from './kolam-row-frame';
import type {KolamDetailValueRowProps} from './kolam-detail-value-row-types';

export type {
  KolamDetailValueRowProps,
  KolamDetailValueTone,
} from './kolam-detail-value-row-types';

export function KolamDetailValueRow({
  label,
  meta,
  tone = 'default',
  value,
}: KolamDetailValueRowProps) {
  return (
    <KolamRowFrame>
      <KolamDetailValueCopy label={label} meta={meta} />
      <KolamDetailValueBadge tone={tone} value={value} />
    </KolamRowFrame>
  );
}
