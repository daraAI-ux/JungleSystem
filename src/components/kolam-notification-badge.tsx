import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {topNavigationStyles as styles} from './kolam-top-navigation-styles';

export function KolamNotificationBadge({
  attentionCount,
}: {
  attentionCount: number;
}) {
  if (attentionCount <= 0) {
    return null;
  }

  return (
    <KolamCopyStack
      items={[
        {
          id: 'badge',
          text: attentionCount > 99 ? '99+' : attentionCount,
          style: styles.notificationBadge,
        },
      ]}
    />
  );
}
