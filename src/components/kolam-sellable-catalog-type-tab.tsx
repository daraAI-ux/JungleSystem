import React from 'react';
import type {CatalogItemType} from '../domain/pos';
import {KolamChoiceSegment} from './kolam-choice-segment';

export function KolamSellableCatalogTypeTab({
  activeType,
  label,
  type,
  onTypeChange,
}: {
  activeType: CatalogItemType | 'all';
  label: string;
  type: CatalogItemType | 'all';
  onTypeChange: (type: CatalogItemType | 'all') => void;
}) {
  return (
    <KolamChoiceSegment
      id={type}
      label={label}
      selectedId={activeType}
      onSelect={onTypeChange}
      variant="tab"
    />
  );
}
