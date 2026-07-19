import React from 'react';
import type {RuntimeIdentityItem} from '../domain/runtime-identity';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamHeaderFrame} from './kolam-header-frame';
import {KolamRuntimeIdentityStatusBadge} from './kolam-runtime-identity-status-badge';
import {runtimeIdentityStyles as styles} from './kolam-runtime-identity-styles';

export function KolamRuntimeIdentityCardHeader({
  item,
}: {
  item: RuntimeIdentityItem;
}) {
  return (
    <KolamHeaderFrame variant="runtimeIdentityCard">
      <KolamCopyStack
        items={[
          {id: 'label', text: item.label, style: styles.runtimeIdentityLabel},
        ]}
      />
      <KolamRuntimeIdentityStatusBadge status={item.status} />
    </KolamHeaderFrame>
  );
}