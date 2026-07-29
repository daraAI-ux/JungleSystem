import React from 'react';
import { View } from 'react-native';
import type { ShellModuleIconKind } from '../domain/app-shell';
import { ModuleNavIcon } from './kolam-module-nav-icon';

const SECTION_ICON_KIND: Record<string, ShellModuleIconKind> = {
  finance: 'wallet',
  inventory: 'catalog',
  pusatAi: 'automation',
  sales: 'cart',
  user: 'people',
};

export function KolamMenuSectionIcon({
  active = false,
  sectionId,
}: {
  active?: boolean;
  sectionId: string;
}) {
  return (
    <View
      testID={`kolam-menu-section-icon:${sectionId}`}
      style={{ flexShrink: 0 }}
    >
      <ModuleNavIcon
        active={active}
        kind={SECTION_ICON_KIND[sectionId] ?? 'dashboard'}
      />
    </View>
  );
}
