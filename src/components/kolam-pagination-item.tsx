import React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  getSettingsPaginationVisualContract,
  getSettingsSwitchVisualContract,
} from '../domain/settings-surface';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInteractionFrame} from './kolam-interaction-frame';

const SETTINGS_PAGINATION_VISUAL = getSettingsPaginationVisualContract();
const SETTINGS_SWITCH_VISUAL = getSettingsSwitchVisualContract();

export interface KolamPaginationItemProps {
  label?: string | number;
  direction?: 'previous' | 'next';
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

export function KolamPaginationItem({
  label,
  direction,
  selected = false,
  disabled = false,
  onPress,
}: KolamPaginationItemProps) {
  return (
    <KolamInteractionFrame
      accessibilityState={label !== undefined ? {selected} : undefined}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.item,
        selected && styles.itemCurrent,
        disabled && styles.itemDisabled,
      ]}>
      {direction ? <View style={getChevronStyle(direction)} /> : null}
      {label !== undefined ? (
        <KolamCopyStack
          items={[
            {
              id: 'label',
              text: label,
              style: [styles.text, selected && styles.textCurrent],
            },
          ]}
        />
      ) : null}
    </KolamInteractionFrame>
  );
}

function getChevronStyle(direction: 'previous' | 'next') {
  return direction === 'previous' ? styles.chevronLeft : styles.chevronRight;
}

const styles = StyleSheet.create({
  item: {
    minWidth: SETTINGS_PAGINATION_VISUAL.itemMinWidth,
    height: SETTINGS_PAGINATION_VISUAL.itemHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: V.radius.lg,
    backgroundColor: V.colors.bg,
    borderColor: 'rgba(17,24,39,0.15)',
    borderWidth: 1,
  },
  itemCurrent: {
    backgroundColor: V.colors.successSoft,
    borderColor: V.colors.primary,
  },
  itemDisabled: {
    opacity: SETTINGS_SWITCH_VISUAL.disabledOpacity,
  },
  text: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    fontWeight: '400',
  },
  textCurrent: {
    color: V.colors.primary,
  },
  chevronLeft: {
    width: 9,
    height: 9,
    borderLeftColor: V.colors.fg,
    borderBottomColor: V.colors.fg,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{rotate: '45deg'}],
  },
  chevronRight: {
    width: 9,
    height: 9,
    borderRightColor: V.colors.fg,
    borderTopColor: V.colors.fg,
    borderRightWidth: 2,
    borderTopWidth: 2,
    transform: [{rotate: '45deg'}],
  },
});
