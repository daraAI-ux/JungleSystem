import React from 'react';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {KolamNavItemBody} from './kolam-nav-item-body';
import {type KolamNavItemProps} from './kolam-nav-item-types';
import {navItemStyles as styles} from './kolam-nav-item-styles';

export type {KolamNavItemProps};

export function KolamNavItem({
  active = false,
  collapsed = false,
  module,
  onPress,
}: KolamNavItemProps) {
  return (
    <KolamInteractionFrame
      accessibilityState={{selected: active}}
      onPress={onPress}
      style={[
        styles.item,
        collapsed && styles.itemCollapsed,
        active && styles.itemActive,
      ]}>
      <KolamNavItemBody
        active={active}
        collapsed={collapsed}
        module={module}
      />
    </KolamInteractionFrame>
  );
}

