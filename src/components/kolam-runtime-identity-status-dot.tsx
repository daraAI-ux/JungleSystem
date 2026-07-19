import React from 'react';
import {View} from 'react-native';
import type {RuntimeIdentityItem} from '../domain/runtime-identity';
import {runtimeIdentityStyles as styles} from './kolam-runtime-identity-styles';

export function KolamRuntimeIdentityStatusDot({
  status,
}: {
  status: RuntimeIdentityItem['status'];
}) {
  return (
    <View
      style={[
        styles.runtimeIdentityBadgeDot,
        status === 'ready' && styles.runtimeIdentityBadgeDotReady,
        status === 'partial' && styles.runtimeIdentityBadgeDotPartial,
        status === 'blocked' && styles.runtimeIdentityBadgeDotBlocked,
      ]}
    />
  );
}
