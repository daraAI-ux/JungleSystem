import React from 'react';
import { View } from 'react-native';
import type { ShellModuleIconKind } from '../domain/app-shell';
import { ModuleNavIcon } from './kolam-module-nav-icon';

const ROUTE_ICON_KIND: Record<string, ShellModuleIconKind> = {
  '/asset-purchase': 'wallet',
  '/campaign': 'sales',
  '/campaign/dara-jobs': 'automation',
  '/campaign/dara-market-intel': 'automation',
  '/campaign/dara-seo': 'automation',
  '/commissions': 'wallet',
  '/complaints': 'sales',
  '/custom-fields': 'settings',
  '/customers': 'people',
  '/enclosures': 'catalog',
  '/finance': 'wallet',
  '/finance/bonus': 'wallet',
  '/finance/payroll': 'people',
  '/finance/tax': 'settings',
  '/iucn-status': 'settings',
  '/label-dan-field/kategori': 'catalog',
  '/label-dan-field/merek': 'catalog',
  '/layanan': 'plugin',
  '/list-of-users': 'people',
  '/list-of-users/dara-training': 'automation',
  '/list-of-users/hr': 'people',
  '/list-of-users/kpi': 'sales',
  '/locations': 'dashboard',
  '/packing-materials': 'catalog',
  '/payable': 'wallet',
  '/products': 'catalog',
  '/products/archive': 'catalog',
  '/product-serials': 'settings',
  '/production': 'preparation',
  '/proyek': 'preparation',
  '/purchase-order': 'cart',
  '/pusat-ai': 'automation',
  '/raw-materials': 'catalog',
  '/receivable': 'wallet',
  '/routine-expenses': 'wallet',
  '/sales': 'cart',
  '/sales/discount-approval': 'sales',
  '/shipping-method': 'cart',
  '/source': 'sales',
  '/species': 'catalog',
  '/suppliers': 'cart',
  '/tags': 'plugin',
  '/task-manager': 'preparation',
  '/task-manager/settings/categories': 'settings',
  '/task-manager/settings/task-types': 'settings',
  '/taxonomy': 'catalog',
  '/teranura': 'catalog',
  '/terms-templates': 'preparation',
  '/unexpected-expense': 'wallet',
  '/unexpected-income': 'wallet',
  '/units': 'plugin',
  '/vouchers': 'sales',
  '/wallet': 'wallet',
};

export function KolamMenuItemIcon({
  active = false,
  route,
}: {
  active?: boolean;
  route: string;
}) {
  return (
    <View testID={`kolam-menu-item-icon:${route}`} style={{ flexShrink: 0 }}>
      <ModuleNavIcon
        active={active}
        kind={ROUTE_ICON_KIND[route] ?? 'dashboard'}
      />
    </View>
  );
}
