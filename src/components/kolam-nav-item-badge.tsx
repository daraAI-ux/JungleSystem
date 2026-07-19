import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {navItemStyles as styles} from './kolam-nav-item-styles';

export function KolamNavItemBadge({
  active,
  count,
}: {
  active: boolean;
  count: number;
}) {
  return (
    <KolamCopyStack
      items={[
        {
          id: 'badge',
          text: count,
          style: [styles.badge, active && styles.badgeActive],
        },
      ]}
    />
  );
}
