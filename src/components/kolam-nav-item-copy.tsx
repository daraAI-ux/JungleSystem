import React from 'react';
import type {ShellModule} from '../domain/app-shell';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInlineFrame} from './kolam-inline-frame';
import {KolamNavItemBadge} from './kolam-nav-item-badge';
import {navItemStyles as styles} from './kolam-nav-item-styles';

export function KolamNavItemCopy({
  active,
  module,
}: {
  active: boolean;
  module: ShellModule;
}) {
  return (
    <KolamInlineFrame variant="navItemCopy">
      <KolamInlineFrame variant="navItemHeader">
        <KolamCopyStack
          items={[
            {
              id: 'label',
              text: module.label,
              style: [styles.text, active && styles.textActive],
            },
          ]}
        />
        <KolamNavItemBadge active={active} count={module.routes.length} />
      </KolamInlineFrame>
    </KolamInlineFrame>
  );
}