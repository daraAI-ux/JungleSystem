import React from 'react';
import {View} from 'react-native';
import {getStatusBadgeIntentStyle} from './kolam-status-badge-intent-style';
import {KolamStatusBadgeLabel} from './kolam-status-badge-label';
import {
  type KolamStatusBadgeIntent,
  type KolamStatusBadgeProps,
} from './kolam-status-badge-types';
import {statusBadgeStyles as styles} from './kolam-status-badge-styles';

export type {KolamStatusBadgeIntent, KolamStatusBadgeProps};

export function KolamStatusBadge({
  label,
  intent = 'primary',
  icon,
  style,
  textStyle,
  numberOfLines,
}: KolamStatusBadgeProps) {
  return (
    <View style={[styles.badge, getStatusBadgeIntentStyle(intent), style]}>
      {icon}
      <KolamStatusBadgeLabel
        intent={intent}
        label={label}
        numberOfLines={numberOfLines}
        textStyle={textStyle}
      />
    </View>
  );
}
