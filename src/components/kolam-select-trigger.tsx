import React from 'react';
import {StyleSheet, View} from 'react-native';
import {getSettingsActivityLogFilterVisualContract} from '../domain/settings-surface';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCopyStack} from './kolam-copy-stack';

const SETTINGS_ACTIVITY_FILTER_VISUAL =
  getSettingsActivityLogFilterVisualContract();

export interface KolamSelectTriggerProps {
  accessibilityLabel: string;
  value: string;
  wide?: boolean;
}

export function KolamSelectTrigger({
  accessibilityLabel,
  value,
  wide = false,
}: KolamSelectTriggerProps) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[styles.trigger, wide && styles.triggerWide]}>
      <KolamCopyStack
        items={[
          {
            id: 'value',
            text: value,
            textProps: {numberOfLines: 1},
            style: styles.value,
          },
        ]}
      />
      <View style={styles.chevron} />
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minWidth: SETTINGS_ACTIVITY_FILTER_VISUAL.selectMinWidth,
    minHeight: SETTINGS_ACTIVITY_FILTER_VISUAL.controlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: V.radius.lg,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.input,
    borderWidth: 1,
    shadowColor: V.colors.fg,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 1,
  },
  triggerWide: {
    minWidth: SETTINGS_ACTIVITY_FILTER_VISUAL.selectWideMinWidth,
  },
  value: {
    flex: 1,
    maxWidth: 150,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  chevron: {
    width: 7,
    height: 7,
    marginLeft: 'auto',
    borderRightColor: V.colors.mutedFg,
    borderRightWidth: 1.5,
    borderBottomColor: V.colors.mutedFg,
    borderBottomWidth: 1.5,
    transform: [{rotate: '45deg'}, {translateY: -2}],
  },
});
