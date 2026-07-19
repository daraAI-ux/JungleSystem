import React from 'react';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {KolamQuickSearchIdentity} from './kolam-quick-search-identity';
import {KolamQuickSearchShortcut} from './kolam-quick-search-shortcut';
import {quickSearchStyles as styles} from './kolam-quick-search-styles';
import type {KolamQuickSearchProps} from './kolam-quick-search-types';

export type {KolamQuickSearchProps} from './kolam-quick-search-types';

export function KolamQuickSearch({
  collapsed = false,
  label = 'Quick Search',
  onPress,
  shortcutLabel = 'Ctrl K',
}: KolamQuickSearchProps) {
  return (
    <KolamInteractionFrame
      onPress={onPress}
      style={[styles.quickSearch, collapsed && styles.quickSearchCollapsed]}>
      <KolamQuickSearchIdentity collapsed={collapsed} label={label} />
      <KolamQuickSearchShortcut
        collapsed={collapsed}
        shortcutLabel={shortcutLabel}
      />
    </KolamInteractionFrame>
  );
}
