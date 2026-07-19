import React from 'react';
import {
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInteractionFrame} from './kolam-interaction-frame';

export interface KolamActionButtonProps {
  label: string;
  intent?: 'outline' | 'danger';
  disabled?: boolean;
  disabledReason?: string;
  disabledReasonLabel?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export function KolamActionButton({
  label,
  intent = 'outline',
  disabled = false,
  disabledReason,
  disabledReasonLabel = 'Default',
  icon,
  onPress,
  style,
  textStyle,
  accessibilityLabel,
}: KolamActionButtonProps) {
  const danger = intent === 'danger';

  return (
    <KolamInteractionFrame
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        danger && styles.buttonDanger,
        disabled && styles.buttonDisabled,
        style,
      ]}>
      {icon}
      <KolamCopyStack
        containerStyle={styles.textStack}
        items={[
          {
            id: 'label',
            text: label,
            style: [
              styles.text,
              danger && styles.textDanger,
              disabled && styles.textDisabled,
              textStyle,
            ],
          },
          ...(disabledReason
            ? [
                {
                  id: 'disabled-reason',
                  text: disabledReasonLabel,
                  style: styles.disabledReason,
                },
              ]
            : []),
        ]}
      />
    </KolamInteractionFrame>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: V.control.buttonSmHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: V.control.buttonPaddingX,
    borderRadius: V.radius.lg,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  buttonDanger: {
    backgroundColor: V.colors.warningSoft,
    borderColor: V.colors.warning,
  },
  buttonDisabled: {
    opacity: 0.58,
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
  },
  textStack: {},
  text: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  textDanger: {
    color: V.colors.warning,
  },
  textDisabled: {
    color: V.colors.mutedFg,
  },
  disabledReason: {
    marginTop: 1,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 9,
    fontWeight: '800',
  },
});
