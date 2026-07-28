import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { kolamVisualTokens as V } from '../domain/kolam-visual';

type MenuRouteIconKind =
  | 'archive'
  | 'asset'
  | 'award'
  | 'banknote'
  | 'book'
  | 'bot'
  | 'briefcase'
  | 'calendar'
  | 'card'
  | 'cart'
  | 'chart'
  | 'checklist'
  | 'clipboard'
  | 'credit-card'
  | 'file'
  | 'folder'
  | 'gauge'
  | 'globe'
  | 'grid'
  | 'hard-drive'
  | 'heart-pulse'
  | 'id-card'
  | 'key'
  | 'layers'
  | 'map-pin'
  | 'package'
  | 'palette'
  | 'percent'
  | 'receipt'
  | 'shield'
  | 'spark'
  | 'tag'
  | 'truck'
  | 'user'
  | 'users'
  | 'wallet'
  | 'wrench';

const ROUTE_ICON_KIND: Record<string, MenuRouteIconKind> = {
  '/asset-purchase': 'asset',
  '/campaign': 'percent',
  '/campaign/dara-jobs': 'checklist',
  '/campaign/dara-market-intel': 'gauge',
  '/campaign/dara-seo': 'globe',
  '/commissions': 'award',
  '/complaints': 'heart-pulse',
  '/custom-fields': 'file',
  '/customers': 'users',
  '/enclosures': 'hard-drive',
  '/finance': 'chart',
  '/finance/bonus': 'award',
  '/finance/payroll': 'id-card',
  '/finance/tax': 'shield',
  '/iucn-status': 'shield',
  '/label-dan-field/kategori': 'folder',
  '/label-dan-field/merek': 'briefcase',
  '/layanan': 'spark',
  '/list-of-users': 'user',
  '/list-of-users/dara-training': 'bot',
  '/list-of-users/hr': 'id-card',
  '/list-of-users/kpi': 'gauge',
  '/locations': 'map-pin',
  '/packing-materials': 'layers',
  '/payable': 'receipt',
  '/products': 'package',
  '/products/archive': 'archive',
  '/product-serials': 'key',
  '/production': 'wrench',
  '/proyek': 'palette',
  '/purchase-order': 'clipboard',
  '/pusat-ai': 'bot',
  '/raw-materials': 'grid',
  '/receivable': 'banknote',
  '/routine-expenses': 'calendar',
  '/sales': 'cart',
  '/sales/discount-approval': 'checklist',
  '/shipping-method': 'truck',
  '/source': 'card',
  '/species': 'book',
  '/suppliers': 'truck',
  '/tags': 'tag',
  '/task-manager': 'checklist',
  '/task-manager/settings/categories': 'folder',
  '/task-manager/settings/task-types': 'clipboard',
  '/taxonomy': 'layers',
  '/teranura': 'book',
  '/terms-templates': 'file',
  '/unexpected-expense': 'receipt',
  '/unexpected-income': 'banknote',
  '/units': 'grid',
  '/vouchers': 'tag',
  '/wallet': 'wallet',
};

export function KolamMenuItemIcon({
  active = false,
  route,
}: {
  active?: boolean;
  route: string;
}) {
  const color = active ? V.colors.primary : V.colors.mutedFg;
  const iconKind = ROUTE_ICON_KIND[route] ?? 'package';

  return (
    <View testID={`kolam-menu-item-icon:${route}`} style={{ flexShrink: 0 }}>
      <MenuSvg color={color} iconKind={iconKind} size={18} />
    </View>
  );
}

function MenuSvg({
  color,
  iconKind,
  size,
}: {
  color: string;
  iconKind: MenuRouteIconKind;
  size: number;
}) {
  return (
    <Svg
      fill="none"
      height={size}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      width={size}
    >
      {renderIcon(iconKind)}
    </Svg>
  );
}

function renderIcon(iconKind: MenuRouteIconKind) {
  switch (iconKind) {
    case 'archive':
      return (
        <>
          <Rect height={4} rx={1} width={18} x={3} y={4} />
          <Path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
          <Line x1={10} x2={14} y1={12} y2={12} />
        </>
      );
    case 'asset':
      return (
        <>
          <Rect height={12} rx={2} width={14} x={5} y={6} />
          <Path d="M9 6V4h6v2" />
          <Path d="M9 12h6" />
          <Path d="M9 15h4" />
        </>
      );
    case 'award':
      return (
        <>
          <Circle cx={12} cy={8} r={4} />
          <Path d="M9.5 11.5 8 20l4-2 4 2-1.5-8.5" />
        </>
      );
    case 'banknote':
      return (
        <>
          <Rect height={12} rx={2} width={18} x={3} y={6} />
          <Circle cx={12} cy={12} r={2.4} />
          <Path d="M6 9.5v5M18 9.5v5" />
        </>
      );
    case 'book':
      return (
        <>
          <Path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3-3V4Z" />
          <Path d="M5 17V7a3 3 0 0 1 3-3" />
        </>
      );
    case 'bot':
      return (
        <>
          <Rect height={10} rx={3} width={14} x={5} y={9} />
          <Path d="M12 5v4" />
          <Circle cx={9} cy={14} r={1} />
          <Circle cx={15} cy={14} r={1} />
          <Path d="M9 18h6" />
        </>
      );
    case 'briefcase':
      return (
        <>
          <Rect height={12} rx={2} width={18} x={3} y={7} />
          <Path d="M9 7V5h6v2" />
          <Path d="M3 12h18" />
        </>
      );
    case 'calendar':
      return (
        <>
          <Rect height={16} rx={2} width={18} x={3} y={5} />
          <Path d="M8 3v4M16 3v4M3 10h18" />
        </>
      );
    case 'card':
      return (
        <>
          <Rect height={14} rx={2} width={18} x={3} y={5} />
          <Path d="M3 10h18M7 15h4" />
        </>
      );
    case 'cart':
      return (
        <>
          <Path d="M4 5h2l2 10h9l2-7H7" />
          <Circle cx={10} cy={19} r={1.5} />
          <Circle cx={17} cy={19} r={1.5} />
        </>
      );
    case 'chart':
      return (
        <>
          <Path d="M4 19V5" />
          <Path d="M4 19h16" />
          <Rect height={5} width={3} x={7} y={12} />
          <Rect height={9} width={3} x={12} y={8} />
          <Rect height={12} width={3} x={17} y={5} />
        </>
      );
    case 'checklist':
      return (
        <>
          <Rect height={16} rx={2} width={14} x={5} y={4} />
          <Path d="m8 10 1.5 1.5L12 9" />
          <Path d="M13.5 11h2.5M8 16h8" />
        </>
      );
    case 'clipboard':
      return (
        <>
          <Rect height={16} rx={2} width={14} x={5} y={5} />
          <Path d="M9 5a3 3 0 0 1 6 0" />
          <Path d="M9 10h6M9 14h6" />
        </>
      );
    case 'credit-card':
      return (
        <>
          <Rect height={14} rx={2} width={18} x={3} y={5} />
          <Path d="M3 10h18M7 15h3" />
        </>
      );
    case 'file':
      return (
        <>
          <Path d="M7 3h7l4 4v14H7V3Z" />
          <Path d="M14 3v5h4M9 13h6M9 17h4" />
        </>
      );
    case 'folder':
      return (
        <>
          <Path d="M3 7h7l2 2h9v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
          <Path d="M3 11h18" />
        </>
      );
    case 'gauge':
      return (
        <>
          <Path d="M5 17a8 8 0 1 1 14 0" />
          <Path d="m12 17 4-6" />
          <Path d="M8 17h8" />
        </>
      );
    case 'globe':
      return (
        <>
          <Circle cx={12} cy={12} r={9} />
          <Path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18" />
        </>
      );
    case 'grid':
      return (
        <>
          <Rect height={6} rx={1} width={6} x={4} y={4} />
          <Rect height={6} rx={1} width={6} x={14} y={4} />
          <Rect height={6} rx={1} width={6} x={4} y={14} />
          <Rect height={6} rx={1} width={6} x={14} y={14} />
        </>
      );
    case 'hard-drive':
      return (
        <>
          <Rect height={14} rx={2} width={18} x={3} y={5} />
          <Path d="M6 15h12" />
          <Circle cx={8} cy={12} r={1} />
          <Circle cx={16} cy={12} r={1} />
        </>
      );
    case 'heart-pulse':
      return (
        <>
          <Path d="M20 8.5c0 5-8 10-8 10s-8-5-8-10A4.5 4.5 0 0 1 12 5a4.5 4.5 0 0 1 8 3.5Z" />
          <Path d="M7 12h2l1.5-3 2.5 6 1.5-3H17" />
        </>
      );
    case 'id-card':
      return (
        <>
          <Rect height={14} rx={2} width={18} x={3} y={5} />
          <Circle cx={9} cy={11} r={2} />
          <Path d="M6.5 16a3 3 0 0 1 5 0M14 10h4M14 14h3" />
        </>
      );
    case 'key':
      return (
        <>
          <Circle cx={8} cy={12} r={3} />
          <Path d="M11 12h9M16 12v3M19 12v2" />
        </>
      );
    case 'layers':
      return (
        <>
          <Path d="m12 3 9 5-9 5-9-5 9-5Z" />
          <Path d="m3 12 9 5 9-5" />
          <Path d="m3 16 9 5 9-5" />
        </>
      );
    case 'map-pin':
      return (
        <>
          <Path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
          <Circle cx={12} cy={10} r={2.2} />
        </>
      );
    case 'package':
      return (
        <>
          <Path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
          <Path d="M4 7.5 12 12l8-4.5M12 12v9" />
        </>
      );
    case 'palette':
      return (
        <>
          <Path d="M12 4a8 8 0 0 0 0 16h1.5a2 2 0 0 0 1.4-3.4 1.6 1.6 0 0 1 1.1-2.6H18a6 6 0 0 0-6-10Z" />
          <Circle cx={8} cy={11} r={1} />
          <Circle cx={11} cy={8} r={1} />
          <Circle cx={14.5} cy={10} r={1} />
        </>
      );
    case 'percent':
      return (
        <>
          <Circle cx={8} cy={8} r={2} />
          <Circle cx={16} cy={16} r={2} />
          <Path d="M18 6 6 18" />
        </>
      );
    case 'receipt':
      return (
        <>
          <Path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
          <Path d="M9 8h6M9 12h6M9 16h4" />
        </>
      );
    case 'shield':
      return (
        <>
          <Path d="M12 3 19 6v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z" />
          <Path d="m9 12 2 2 4-5" />
        </>
      );
    case 'spark':
      return (
        <>
          <Path d="M12 3v5M12 16v5M3 12h5M16 12h5" />
          <Path d="m6 6 3 3M15 15l3 3M18 6l-3 3M9 15l-3 3" />
        </>
      );
    case 'tag':
      return (
        <>
          <Path d="M4 4h8l8 8-8 8-8-8V4Z" />
          <Circle cx={8.5} cy={8.5} r={1.5} />
        </>
      );
    case 'truck':
      return (
        <>
          <Path d="M3 7h11v9H3V7Z" />
          <Path d="M14 10h4l3 3v3h-7v-6Z" />
          <Circle cx={7} cy={18} r={2} />
          <Circle cx={17} cy={18} r={2} />
        </>
      );
    case 'user':
      return (
        <>
          <Circle cx={12} cy={8} r={4} />
          <Path d="M5 21a7 7 0 0 1 14 0" />
        </>
      );
    case 'users':
      return (
        <>
          <Circle cx={9} cy={8} r={3} />
          <Path d="M3.5 20a6 6 0 0 1 11 0" />
          <Path d="M16 11a3 3 0 1 0-1-5.8" />
          <Path d="M15 17a5 5 0 0 1 5.5 3" />
        </>
      );
    case 'wallet':
      return (
        <>
          <Path d="M4 7h15a2 2 0 0 1 2 2v9H5a2 2 0 0 1-2-2V7a3 3 0 0 1 3-3h11" />
          <Path d="M16 13h5" />
          <Circle cx={17.5} cy={13} r={0.8} />
        </>
      );
    case 'wrench':
      return (
        <>
          <Path d="M14.5 5.5a5 5 0 0 0 4 7.8L10 21l-4-4 7.7-8.5a5 5 0 0 0 .8-3Z" />
          <Path d="M6 17l1 1" />
        </>
      );
    default:
      return (
        <>
          <Polyline points="4 7 12 3 20 7" />
          <Path d="M5 10v9h14v-9" />
        </>
      );
  }
}
