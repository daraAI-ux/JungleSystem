import React from 'react';
import type {DashboardPendingOrdersDescriptor} from '../domain/dashboard-pending-orders';
import {KolamChevronIcon} from './kolam-chevron-icon';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {KolamListFrame} from './kolam-list-frame';
import {pendingOrdersStyles as styles} from './kolam-dashboard-pending-orders-styles';

export function KolamDashboardPendingOrdersActionLink({
  descriptor,
  onOpenRoute,
}: {
  descriptor: DashboardPendingOrdersDescriptor;
  onOpenRoute?: (route: string) => void;
}) {
  const content = (
    <KolamListFrame variant="pendingOrdersActionLink">
      <KolamCopyStack
        items={[
          {
            id: 'label',
            text: descriptor.actionLabel,
            style: styles.pendingOrdersLinkText,
          },
        ]}
      />
      {descriptor.actionIconKind === 'chevron' ? (
        <KolamChevronIcon size="dashboard-sm" />
      ) : null}
    </KolamListFrame>
  );

  if (!onOpenRoute) {
    return content;
  }

  return (
    <KolamInteractionFrame
      accessibilityLabel={`${descriptor.actionLabel} - ${descriptor.actionRoute}`}
      onPress={() => onOpenRoute(descriptor.actionRoute)}>
      {content}
    </KolamInteractionFrame>
  );
}
