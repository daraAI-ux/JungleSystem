import React from 'react';
import {StyleSheet} from 'react-native';
import type {CatalogItem} from '../domain/pos';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {formatRupiah} from '../lib/money';
import {KolamBadge} from './kolam-badge';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamHeaderFrame} from './kolam-header-frame';
import {KolamSelectableCard} from './kolam-selectable-card';

export interface KolamCatalogCardProps {
  item: CatalogItem;
  onPress: (item: CatalogItem) => void;
}

export function KolamCatalogCard({item, onPress}: KolamCatalogCardProps) {
  const lowStock = item.stock <= item.lowStockThreshold;

  return (
    <KolamSelectableCard
      minHeight={168}
      onPress={() => onPress(item)}
      accessibilityLabel={`Pilih ${item.name}`}>
      <KolamHeaderFrame variant="catalogCard">
        <KolamCopyStack
          items={[{id: 'type', text: item.type, style: styles.itemType}]}
        />
        <KolamBadge
          label={`${item.stock} stok`}
          intent={lowStock ? 'warning' : 'success'}
        />
      </KolamHeaderFrame>
      <KolamCopyStack
        items={[
          {id: 'name', text: item.name, style: styles.itemName},
          {id: 'code', text: item.code, style: styles.itemCode},
          {
            id: 'price',
            text: formatRupiah(item.price),
            style: styles.itemPrice,
          },
        ]}
      />
    </KolamSelectableCard>
  );
}

const styles = StyleSheet.create({
  itemType: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  itemName: {
    color: V.colors.fg,
    fontSize: 18,
    fontWeight: '900',
  },
  itemCode: {
    marginTop: 6,
    color: V.colors.mutedFg,
    fontSize: 13,
  },
  itemPrice: {
    marginTop: 'auto',
    color: V.colors.info,
    fontSize: 18,
    fontWeight: '900',
  },
});