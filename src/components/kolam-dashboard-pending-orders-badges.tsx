import React from 'react';
import type {DashboardPendingOrderRange} from '../domain/dashboard-pending-orders';
import {KolamBadge} from './kolam-badge';
import {KolamListFrame} from './kolam-list-frame';
import {KolamMappedList} from './kolam-mapped-list';

export function KolamDashboardPendingOrdersBadges({
  channels,
}: {
  channels: DashboardPendingOrderRange['channels'];
}) {
  const visibleChannels = channels.filter(channel => channel.count > 0);

  return (
    <KolamListFrame variant="pendingOrdersBadges">
      <KolamMappedList
        items={visibleChannels}
        getKey={channel => channel.id}
        renderItem={channel => (
          <KolamBadge
            label={`${channel.label} ${channel.count}`}
            intent="warning"
          />
        )}
      />
    </KolamListFrame>
  );
}