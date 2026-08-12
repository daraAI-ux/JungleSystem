import React from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { KOLAM_NEW_BUTTON_ICON_SVG } from '../assets/icons/new-button-icon-svg';
import {
  getKolamButtonVisualContract,
  type KolamButtonDensity,
  type KolamButtonIntent,
  type KolamButtonSize,
  type KolamButtonTone,
} from '../domain/kolam-button';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamInteractionFrame } from './kolam-interaction-frame';

const KOLAM_BUTTON_VISUAL = getKolamButtonVisualContract();
const KOLAM_NEW_BUTTON_ICON_XML = KOLAM_NEW_BUTTON_ICON_SVG.replace(
  /#000000/g,
  V.colors.success,
);
const KOLAM_ADD_BUTTON_LABEL_PREFIXES = [
  'add',
  'baru',
  'buat',
  'create',
  'new',
  'tambah',
] as const;
const KOLAM_COMPACT_BUTTON_VISUAL: Record<
  KolamButtonSize,
  {
    gapX: number;
    iconSize: number;
    lineHeight: number;
    minHeight: number;
    paddingX: number;
    fontSize: number;
  }
> = {
  sm: {
    minHeight: 30,
    paddingX: 9,
    gapX: 5,
    fontSize: 12,
    lineHeight: 17,
    iconSize: 14,
  },
  md: {
    minHeight: 32,
    paddingX: 10,
    gapX: 6,
    fontSize: 12,
    lineHeight: 20,
    iconSize: 14,
  },
};

export interface KolamButtonProps {
  label: string;
  density?: KolamButtonDensity;
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
  density = 'compact',
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
  const visualMetrics = getButtonVisualMetrics(size, density);
  const resolvedIcon =
    icon ??
    (isKolamAddButtonLabel(label) ? (
      <SvgXml height="100%" width="100%" xml={KOLAM_NEW_BUTTON_ICON_XML} />
    ) : null);

  return (
    <KolamInteractionFrame
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        {
          gap: visualMetrics.gapX,
          minHeight: visualMetrics.minHeight,
          paddingHorizontal: visualMetrics.paddingX,
        },
        getIntentStyle(intent),
        getToneStyle(tone),
        style,
        unavailable && styles.buttonMuted,
      ]}
    >
      {resolvedIcon ? (
        <View
          style={[
            styles.icon,
            { height: visualMetrics.iconSize, width: visualMetrics.iconSize },
          ]}
        >
          {resolvedIcon}
        </View>
      ) : null}
      <KolamCopyStack
        items={[
          {
            id: 'label',
            text: label,
            style: [
              styles.text,
              {
                fontSize: visualMetrics.fontSize,
                lineHeight: visualMetrics.lineHeight,
              },
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

function isKolamAddButtonLabel(label: string) {
  const normalized = label.trim().toLowerCase();

  return KOLAM_ADD_BUTTON_LABEL_PREFIXES.some(
    prefix => normalized === prefix || normalized.startsWith(`${prefix} `),
  );
}

function getButtonVisualMetrics(
  size: KolamButtonSize,
  density: KolamButtonDensity,
) {
  if (density === 'regular') {
    return {
      ...KOLAM_BUTTON_VISUAL.sizes[size],
      iconSize: KOLAM_BUTTON_VISUAL.base.iconSize,
    };
  }

  return KOLAM_COMPACT_BUTTON_VISUAL[size];
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: V.fontFamily,
    fontWeight:
      KOLAM_BUTTON_VISUAL.base.fontWeight === 'medium' ? '500' : '700',
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
