import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {View} from 'react-native';
import type {RuntimeIdentityItem} from '../domain/runtime-identity';
import {KolamRuntimeIdentityStatusDot} from './kolam-runtime-identity-status-dot';
import {runtimeIdentityStyles as styles} from './kolam-runtime-identity-styles';

export function KolamRuntimeIdentityStatusBadge({
  status,
}: {
  status: RuntimeIdentityItem['status'];
}) {
  return (
    <View
      style={[
        styles.runtimeIdentityBadge,
        status === 'ready' && styles.runtimeIdentityBadgeReady,
        status === 'partial' && styles.runtimeIdentityBadgePartial,
        status === 'blocked' && styles.runtimeIdentityBadgeBlocked,
      ]}>
      <KolamRuntimeIdentityStatusDot status={status} />
      <KolamCopyStack
        items={[
          {
            id: 'status',
            text: status,
            style: [
              styles.runtimeIdentityBadgeText,
              status === 'ready' && styles.runtimeIdentityBadgeTextReady,
              status === 'partial' && styles.runtimeIdentityBadgeTextPartial,
              status === 'blocked' && styles.runtimeIdentityBadgeTextBlocked,
            ],
          },
        ]}
      />
    </View>
  );
}
