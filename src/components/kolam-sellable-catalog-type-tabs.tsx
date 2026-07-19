import React from 'react';
import type {CatalogItemType} from '../domain/pos';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamSellableCatalogTypeTab} from './kolam-sellable-catalog-type-tab';

const TYPE_TABS: Array<{label: string; type: CatalogItemType | 'all'}> = [
  {label: 'Semua', type: 'all'},
  {label: 'Product', type: 'product'},
  {label: 'Species', type: 'species'},
];

export function KolamSellableCatalogTypeTabs({
  activeType,
  onTypeChange,
}: {
  activeType: CatalogItemType | 'all';
  onTypeChange: (type: CatalogItemType | 'all') => void;
}) {
  return (
    <KolamListFrame variant="sellableCatalogTabs">
      <KolamMappedList
        items={TYPE_TABS}
        getKey={tab => tab.type}
        renderItem={tab => (
          <KolamSellableCatalogTypeTab
            activeType={activeType}
            label={tab.label}
            type={tab.type}
            onTypeChange={onTypeChange}
          />
        )}
      />
    </KolamListFrame>
  );
}