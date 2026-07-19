import React from 'react';
import {StyleSheet, View} from 'react-native';
import {getKolamControlTabsVisualContract} from '../domain/kolam-control-tabs';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInteractionFrame} from './kolam-interaction-frame';

const KOLAM_CONTROL_TABS_VISUAL = getKolamControlTabsVisualContract();

export interface KolamSegmentProps {
  label: string;
  active: boolean;
  onPress: () => void;
  variant?: 'button' | 'tab' | 'range';
}

export function KolamSegment({
  label,
  active,
  onPress,
  variant = 'button',
}: KolamSegmentProps) {
  const isTab = variant === 'tab';
  const isRange = variant === 'range';

  return (
    <KolamInteractionFrame
      selected={active}
      onPress={onPress}
      style={[
        styles.segment,
        isTab && styles.segmentTab,
        isRange && styles.segmentRange,
        active && styles.segmentActive,
        isRange && active && styles.segmentRangeActive,
        isTab && active && styles.segmentTabActive,
      ]}>
      <KolamCopyStack
        items={[
          {
            id: 'label',
            text: label,
            style: [
              styles.segmentText,
              isTab && styles.segmentTabText,
              isRange && styles.segmentRangeText,
              active && styles.segmentTextActive,
              isRange && active && styles.segmentRangeTextActive,
              isTab && active && styles.segmentTabTextActive,
            ],
          },
        ]}
      />
      {isTab && active ? <View style={styles.segmentTabIndicator} /> : null}
    </KolamInteractionFrame>
  );
}

const styles = StyleSheet.create({
  segment: {
    minHeight: KOLAM_CONTROL_TABS_VISUAL.buttonMinHeight,
    justifyContent: 'center',
    paddingHorizontal: KOLAM_CONTROL_TABS_VISUAL.buttonPaddingX,
    borderRadius: V.radius.lg,
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderWidth: 1,
  },
  segmentActive: {
    backgroundColor: V.colors.primary,
    borderColor: V.colors.primary,
  },
  segmentRange: {
    minHeight: KOLAM_CONTROL_TABS_VISUAL.rangeButtonMinHeight,
    paddingHorizontal: KOLAM_CONTROL_TABS_VISUAL.rangeButtonPaddingX,
    paddingVertical: KOLAM_CONTROL_TABS_VISUAL.rangeButtonPaddingY,
    borderRadius: KOLAM_CONTROL_TABS_VISUAL.rangeButtonRadius,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
  },
  segmentRangeActive: {
    backgroundColor:
      V.colors[KOLAM_CONTROL_TABS_VISUAL.rangeButtonSelectedBackground],
    borderColor: 'transparent',
  },
  segmentTab: {
    minHeight: KOLAM_CONTROL_TABS_VISUAL.tabMinHeight,
    paddingHorizontal: KOLAM_CONTROL_TABS_VISUAL.tabPaddingX,
    borderRadius: 0,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
  },
  segmentTabActive: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  segmentText: {
    color: V.colors.mutedFg,
    fontSize: KOLAM_CONTROL_TABS_VISUAL.fontSize,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: V.colors.primaryFg,
  },
  segmentRangeText: {
    color: V.colors.mutedFg,
    fontSize: KOLAM_CONTROL_TABS_VISUAL.rangeButtonFontSize,
  },
  segmentRangeTextActive: {
    color: V.colors.fg,
  },
  segmentTabText: {
    color: V.colors.mutedFg,
    fontWeight: '700',
  },
  segmentTabTextActive: {
    color: V.colors.fg,
  },
  segmentTabIndicator: {
    position: 'absolute',
    right: 0,
    bottom: -1,
    left: 0,
    height: KOLAM_CONTROL_TABS_VISUAL.tabIndicatorHeight,
    borderRadius: 999,
    backgroundColor: V.colors.fg,
  },
});
