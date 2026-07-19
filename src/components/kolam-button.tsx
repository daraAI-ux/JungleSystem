import React from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {
  getKolamButtonVisualContract,
  type KolamButtonIntent,
  type KolamButtonSize,
  type KolamButtonTone,
} from '../domain/kolam-button';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInteractionFrame} from './kolam-interaction-frame';

const KOLAM_BUTTON_VISUAL = getKolamButtonVisualContract();

export interface KolamButtonProps {
  label: string;
  intent?: KolamButtonIntent;
  size?: KolamButtonSize;
  tone?: KolamButtonTone;
  disabled?: boolean;
  muted?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export function KolamButton({
  label,
  intent = 'outline',
  size = 'sm',
  tone = 'default',
  disabled = false,
  muted = false,
  onPress,
  icon,
  style,
  textStyle,
  accessibilityLabel,
}: KolamButtonProps) {
  const unavailable = disabled || muted;

  return (
    <KolamInteractionFrame
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        size === 'md' ? styles.buttonMd : styles.buttonSm,
        getIntentStyle(intent),
        getToneStyle(tone),
        style,
        unavailable && styles.buttonMuted,
      ]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <KolamCopyStack
        items={[
          {
            id: 'label',
            text: label,
            style: [
              styles.text,
              size === 'md' ? styles.textMd : styles.textSm,
              getTextIntentStyle(intent),
              getTextToneStyle(tone),
              unavailable && styles.textMuted,
              textStyle,
            ],
          },
        ]}
      />
    </KolamInteractionFrame>
  );
}

function getIntentStyle(intent: KolamButtonIntent) {
  switch (intent) {
    case 'primary':
      return styles.primary;
    case 'secondary':
      return styles.secondary;
    case 'warning':
      return styles.warning;
    case 'danger':
      return styles.danger;
    case 'plain':
      return styles.plain;
    case 'outline':
    default:
      return styles.outline;
  }
}

function getToneStyle(tone: KolamButtonTone) {
  switch (tone) {
    case 'positive':
      return styles.positive;
    case 'default':
    default:
      return undefined;
  }
}

function getTextIntentStyle(intent: KolamButtonIntent) {
  switch (intent) {
    case 'primary':
    case 'warning':
    case 'danger':
      return styles.textOnFill;
    case 'secondary':
    case 'outline':
    case 'plain':
    default:
      return styles.textDefault;
  }
}

function getTextToneStyle(tone: KolamButtonTone) {
  switch (tone) {
    case 'positive':
      return styles.textPositive;
    case 'default':
    default:
      return undefined;
  }
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: V.radius.lg,
    borderWidth: 1,
  },
  buttonSm: {
    minHeight: KOLAM_BUTTON_VISUAL.sizes.sm.minHeight,
    gap: KOLAM_BUTTON_VISUAL.sizes.sm.gapX,
    paddingHorizontal: KOLAM_BUTTON_VISUAL.sizes.sm.paddingX,
  },
  buttonMd: {
    minHeight: KOLAM_BUTTON_VISUAL.sizes.md.minHeight,
    gap: KOLAM_BUTTON_VISUAL.sizes.md.gapX,
    paddingHorizontal: KOLAM_BUTTON_VISUAL.sizes.md.paddingX,
  },
  primary: {
    backgroundColor: V.colors.primary,
    borderColor: V.colors.primary,
  },
  secondary: {
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
  },
  warning: {
    backgroundColor: V.colors.warning,
    borderColor: V.colors.warning,
  },
  danger: {
    backgroundColor: V.colors.danger,
    borderColor: V.colors.danger,
  },
  outline: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
  },
  plain: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  positive: {
    backgroundColor: V.colors.successSoft,
    borderColor: V.colors.success,
  },
  buttonMuted: {
    backgroundColor: V.colors.mutedFg,
    borderColor: V.colors.mutedFg,
    opacity: 0.75,
  },
  icon: {
    width: KOLAM_BUTTON_VISUAL.base.iconSize,
    height: KOLAM_BUTTON_VISUAL.base.iconSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: V.fontFamily,
    fontWeight:
      KOLAM_BUTTON_VISUAL.base.fontWeight === 'medium' ? '500' : '700',
  },
  textSm: {
    fontSize: KOLAM_BUTTON_VISUAL.sizes.sm.fontSize,
    lineHeight: KOLAM_BUTTON_VISUAL.sizes.sm.lineHeight,
  },
  textMd: {
    fontSize: KOLAM_BUTTON_VISUAL.sizes.md.fontSize,
    lineHeight: KOLAM_BUTTON_VISUAL.sizes.md.lineHeight,
  },
  textDefault: {
    color: V.colors.fg,
  },
  textOnFill: {
    color: V.colors.primaryFg,
  },
  textPositive: {
    color: V.colors.success,
  },
  textMuted: {
    color: V.colors.primaryFg,
  },
});
