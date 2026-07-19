import React from 'react';
import {
  StyleSheet,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import {getKolamBadgeVisualContract} from '../domain/kolam-badge';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCopyStack} from './kolam-copy-stack';

const KOLAM_BADGE_VISUAL = getKolamBadgeVisualContract();

export type KolamBadgeIntent =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'outline'
  | 'muted';

export interface KolamBadgeProps {
  label: string | number;
  align?: TextStyle['textAlign'];
  horizontalPadding?: number;
  intent?: KolamBadgeIntent;
  shape?: 'circle' | 'square';
  style?: StyleProp<TextStyle>;
  weight?: TextStyle['fontWeight'];
  width?: number;
}

export function KolamBadge({
  label,
  align,
  horizontalPadding,
  intent = 'primary',
  shape = 'circle',
  style,
  weight,
  width,
}: KolamBadgeProps) {
  return (
    <KolamCopyStack
      items={[
        {
          id: 'label',
          text: label,
          style: [
            styles.badge,
            shape === 'circle' ? styles.circle : styles.square,
            getIntentStyle(intent),
            width !== undefined && {width},
            align !== undefined && {textAlign: align},
            weight !== undefined && {fontWeight: weight},
            horizontalPadding !== undefined && {paddingHorizontal: horizontalPadding},
            style,
          ],
        },
      ]}
    />
  );
}

function getIntentStyle(intent: KolamBadgeIntent) {
  switch (intent) {
    case 'secondary':
    case 'muted':
      return styles.secondary;
    case 'success':
      return styles.success;
    case 'info':
      return styles.info;
    case 'warning':
      return styles.warning;
    case 'danger':
      return styles.danger;
    case 'outline':
      return styles.outline;
    case 'primary':
    default:
      return styles.primary;
  }
}

const styles = StyleSheet.create({
  badge: {
    overflow: 'hidden',
    paddingVertical: KOLAM_BADGE_VISUAL.base.paddingY,
    fontFamily: V.fontFamily,
    fontSize: KOLAM_BADGE_VISUAL.base.fontSize,
    lineHeight: KOLAM_BADGE_VISUAL.base.lineHeight,
    fontWeight:
      KOLAM_BADGE_VISUAL.base.fontWeight === 'medium' ? '500' : '700',
  },
  circle: {
    paddingHorizontal: KOLAM_BADGE_VISUAL.circle.paddingX,
    borderRadius: V.control.badgeRadius,
  },
  square: {
    paddingHorizontal: KOLAM_BADGE_VISUAL.square.paddingX,
    borderRadius: V.radius.sm,
  },
  primary: {
    color: V.colors.primary,
    backgroundColor: V.colors.primarySoft,
  },
  secondary: {
    color: V.colors.mutedFg,
    backgroundColor: V.colors.secondary,
  },
  success: {
    color: V.colors.success,
    backgroundColor: V.colors.successSoft,
  },
  info: {
    color: V.colors.info,
    backgroundColor: V.colors.infoSoft,
  },
  warning: {
    color: V.colors.warning,
    backgroundColor: V.colors.warningSoft,
  },
  danger: {
    color: V.colors.danger,
    backgroundColor: V.colors.warningSoft,
  },
  outline: {
    color: V.colors.fg,
    backgroundColor: 'transparent',
  },
});
