import React from 'react';
import {StyleSheet, View} from 'react-native';
import {getSettingsSwitchVisualContract} from '../domain/settings-surface';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamInteractionFrame} from './kolam-interaction-frame';

const SETTINGS_SWITCH_VISUAL = getSettingsSwitchVisualContract();

export interface KolamSwitchProps {
  active: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function KolamSwitch({
  active,
  onPress,
  disabled = false,
}: KolamSwitchProps) {
  return (
    <KolamInteractionFrame
      accessibilityRole={SETTINGS_SWITCH_VISUAL.role}
      accessibilityState={{checked: active, disabled}}
      disabled={disabled}
      onPress={disabled ? undefined : onPress}
      style={[
        styles.track,
        active && styles.trackActive,
        disabled && styles.disabled,
      ]}>
      <View style={[styles.knob, active && styles.knobActive]} />
    </KolamInteractionFrame>
  );
}

const styles = StyleSheet.create({
  track: {
    width: SETTINGS_SWITCH_VISUAL.trackWidth,
    height: SETTINGS_SWITCH_VISUAL.trackHeight,
    justifyContent: 'center',
    padding: SETTINGS_SWITCH_VISUAL.trackPadding,
    borderRadius: 999,
    backgroundColor: V.colors.secondary,
    borderColor: 'rgba(17,24,39,0.05)',
    borderWidth: 1,
  },
  trackActive: {
    backgroundColor: V.colors.primary,
    borderColor: 'rgba(17,24,39,0.12)',
  },
  knob: {
    width: SETTINGS_SWITCH_VISUAL.knobSize,
    height: SETTINGS_SWITCH_VISUAL.knobSize,
    borderRadius: 999,
    backgroundColor: V.colors.bg,
    borderColor: 'rgba(17,24,39,0.05)',
    borderWidth: 1,
    shadowColor: V.colors.fg,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.12,
    shadowRadius: 1,
    elevation: 1,
  },
  knobActive: {
    transform: [{translateX: SETTINGS_SWITCH_VISUAL.selectedTranslateX}],
    borderColor: V.colors.bg,
    shadowColor: V.colors.primary,
    shadowOpacity: 0.2,
  },
  disabled: {
    opacity: SETTINGS_SWITCH_VISUAL.disabledOpacity,
  },
});

