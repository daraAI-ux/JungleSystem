import React from 'react';
import type {ShellModule} from '../domain/app-shell';
import {KolamInlineFrame} from './kolam-inline-frame';
import {KolamNavItemCopy} from './kolam-nav-item-copy';
import {KolamNavItemGlyph} from './kolam-nav-item-glyph';
import {navItemStyles as styles} from './kolam-nav-item-styles';

export function KolamNavItemBody({
  active,
  collapsed,
  module,
}: {
  active: boolean;
  collapsed: boolean;
  module: ShellModule;
}) {
  return (
    <KolamInlineFrame
      variant="navItemBody"
      style={collapsed && styles.bodyCollapsed}>
      <KolamNavItemGlyph active={active} module={module} />
      {collapsed ? null : <KolamNavItemCopy active={active} module={module} />}
    </KolamInlineFrame>
  );
}