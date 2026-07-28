import React from 'react';
import { StyleSheet, View } from 'react-native';
import { kolamVisualTokens as V } from '../domain/kolam-visual';

type MenuRouteIconShape =
  | 'box'
  | 'tag'
  | 'slab'
  | 'book'
  | 'shield'
  | 'tool'
  | 'map'
  | 'truck'
  | 'cart'
  | 'spark'
  | 'wallet'
  | 'person'
  | 'clock'
  | 'leaf';

type MenuRouteIconAccent =
  | 'pinNorth'
  | 'pinEast'
  | 'pinSouth'
  | 'pinWest'
  | 'barNorth'
  | 'barEast'
  | 'barSouth'
  | 'barWest';

export function KolamMenuItemIcon({
  active = false,
  route,
}: {
  active?: boolean;
  route: string;
}) {
  const spec = getRouteIconSpec(route);
  const color = active ? V.colors.primary : spec.color;

  return (
    <View
      testID={`kolam-menu-item-icon:${route}`}
      style={[
        styles.icon,
        { backgroundColor: active ? V.colors.primarySoft : spec.soft },
      ]}
    >
      <View style={[styles[spec.shape], { borderColor: color }]} />
      <View
        style={[
          styles.accent,
          styles[spec.accent],
          spec.accent.startsWith('bar') && styles.accentBar,
          { backgroundColor: color },
        ]}
      />
    </View>
  );
}

function getRouteIconSpec(route: string): {
  accent: MenuRouteIconAccent;
  color: string;
  shape: MenuRouteIconShape;
  soft: string;
} {
  const shape = getRouteShape(route);
  const tone = getRouteTone(route);
  const accents: MenuRouteIconAccent[] = [
    'pinNorth',
    'pinEast',
    'pinSouth',
    'pinWest',
    'barNorth',
    'barEast',
    'barSouth',
    'barWest',
  ];

  return {
    accent: accents[getRouteHash(route) % accents.length],
    color: tone.color,
    shape,
    soft: tone.soft,
  };
}

function getRouteShape(route: string): MenuRouteIconShape {
  if (route.includes('brand')) {
    return 'slab';
  }

  if (route.includes('category') || route.includes('kategori')) {
    return 'tag';
  }

  if (route.includes('tag')) {
    return 'spark';
  }

  if (route.includes('custom-field') || route.includes('units')) {
    return 'slab';
  }

  if (
    route.includes('species') ||
    route.includes('taxonomy') ||
    route.includes('teranura') ||
    route.includes('freyer') ||
    route.includes('enclonura')
  ) {
    return 'book';
  }

  if (
    route.includes('iucn') ||
    route.includes('tax') ||
    route.includes('approval')
  ) {
    return 'shield';
  }

  if (
    route.includes('raw-materials') ||
    route.includes('packing') ||
    route.includes('production') ||
    route.includes('serial') ||
    route.includes('task')
  ) {
    return 'tool';
  }

  if (route.includes('location') || route.includes('storage')) {
    return 'map';
  }

  if (
    route.includes('supplier') ||
    route.includes('purchase-order') ||
    route.includes('shipping')
  ) {
    return 'truck';
  }

  if (
    route.includes('sales') ||
    route.includes('source') ||
    route.includes('voucher') ||
    route.includes('campaign') ||
    route.includes('proyek')
  ) {
    return 'cart';
  }

  if (
    route.includes('wallet') ||
    route.includes('finance') ||
    route.includes('payable') ||
    route.includes('receivable') ||
    route.includes('expense') ||
    route.includes('income') ||
    route.includes('commission')
  ) {
    return 'wallet';
  }

  if (
    route.includes('customer') ||
    route.includes('user') ||
    route.includes('staff') ||
    route.includes('portal')
  ) {
    return 'person';
  }

  if (route.includes('attendance') || route.includes('appointment')) {
    return 'clock';
  }

  if (route.includes('pusat-ai') || route.includes('dara')) {
    return 'spark';
  }

  if (route.includes('product') || route.includes('asset')) {
    return 'box';
  }

  return 'leaf';
}

function getRouteTone(route: string) {
  if (
    route.includes('finance') ||
    route.includes('wallet') ||
    route.includes('payable') ||
    route.includes('receivable')
  ) {
    return { color: V.colors.primary, soft: V.colors.primarySoft };
  }

  if (
    route.includes('sales') ||
    route.includes('campaign') ||
    route.includes('voucher') ||
    route.includes('shipping')
  ) {
    return { color: V.colors.warning, soft: V.colors.warningSoft };
  }

  if (
    route.includes('customer') ||
    route.includes('user') ||
    route.includes('staff') ||
    route.includes('portal')
  ) {
    return { color: '#7c3aed', soft: '#f3e8ff' };
  }

  if (
    route.includes('dara') ||
    route.includes('ai') ||
    route.includes('market-intel') ||
    route.includes('seo')
  ) {
    return { color: V.colors.info, soft: V.colors.infoSoft };
  }

  return { color: V.colors.success, soft: V.colors.successSoft };
}

function getRouteHash(route: string) {
  return route.split('').reduce((hash, char) => hash + char.charCodeAt(0), 0);
}

const styles = StyleSheet.create({
  icon: {
    width: 18,
    height: 18,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  accent: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 999,
  },
  accentBar: {
    width: 7,
    height: 2,
  },
  pinNorth: {
    top: 2,
    right: 3,
  },
  pinEast: {
    right: 2,
    bottom: 5,
  },
  pinSouth: {
    left: 4,
    bottom: 2,
  },
  pinWest: {
    left: 2,
    top: 5,
  },
  barNorth: {
    top: 3,
    left: 5,
  },
  barEast: {
    right: 2,
    top: 8,
    transform: [{ rotate: '90deg' }],
  },
  barSouth: {
    bottom: 3,
    left: 5,
  },
  barWest: {
    left: 2,
    top: 8,
    transform: [{ rotate: '90deg' }],
  },
  box: {
    width: 12,
    height: 11,
    borderRadius: 3,
    borderWidth: 2,
  },
  tag: {
    width: 11,
    height: 11,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 7,
    borderWidth: 2,
    transform: [{ rotate: '-35deg' }],
  },
  slab: {
    width: 12,
    height: 9,
    borderRadius: 2,
    borderWidth: 2,
  },
  book: {
    width: 12,
    height: 12,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 1,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 1,
    borderWidth: 2,
  },
  shield: {
    width: 11,
    height: 12,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    borderWidth: 2,
  },
  tool: {
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 0,
    borderLeftWidth: 2,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  map: {
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderRightWidth: 1,
    borderBottomWidth: 2,
    borderLeftWidth: 1,
    borderRadius: 2,
  },
  truck: {
    width: 13,
    height: 9,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRadius: 2,
  },
  cart: {
    width: 13,
    height: 10,
    borderTopWidth: 0,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  spark: {
    width: 10,
    height: 10,
    borderRadius: 2,
    borderWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
  wallet: {
    width: 13,
    height: 10,
    borderRadius: 4,
    borderWidth: 2,
  },
  person: {
    width: 12,
    height: 9,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    borderWidth: 2,
  },
  clock: {
    width: 12,
    height: 12,
    borderRadius: 999,
    borderWidth: 2,
  },
  leaf: {
    width: 10,
    height: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 8,
    borderWidth: 2,
    transform: [{ rotate: '35deg' }],
  },
});
