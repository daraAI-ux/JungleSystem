import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {KolamCopyStack} from './kolam-copy-stack';
import type {KolamStatusBadgeIntent} from './kolam-status-badge-types';
import {statusBadgeStyles as styles} from './kolam-status-badge-styles';
import {getStatusBadgeTextIntentStyle} from './kolam-status-badge-text-style';

export function KolamStatusBadgeLabel({
  intent,
  label,
  numberOfLines,
  textStyle,
}: {
  intent: KolamStatusBadgeIntent;
  label: string | number;
  numberOfLines?: number;
  textStyle?: StyleProp<TextStyle>;
}) {
  return (
    <KolamCopyStack
      items={[
        {
          id: 'label',
          text: label,
          style: [styles.text, getStatusBadgeTextIntentStyle(intent), textStyle],
          textProps: {numberOfLines},
        },
      ]}
    />
  );
}
