import React from 'react';
import {StyleSheet, View} from 'react-native';
import {getKolamBadgeVisualContract} from '../domain/kolam-badge';
import {getKolamControlTabsVisualContract} from '../domain/kolam-control-tabs';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInteractionFrame} from './kolam-interaction-frame';

const KOLAM_BADGE_VISUAL = getKolamBadgeVisualContract();
const KOLAM_CONTROL_TABS_VISUAL = getKolamControlTabsVisualContract();

export interface KolamControlTabItemProps {
  count?: number;
  flag?: string;
  label: string;
  onPress: () => void;
  selected?: boolean;
}

export function KolamControlTabItem({
  count,
  flag,
  label,
  onPress,
  selected = false,
}: KolamControlTabItemProps) {
  return (
    <KolamInteractionFrame
      accessibilityRole="tab"
      accessibilityState={{selected}}
      onPress={onPress}
      style={[styles.tab, selected && styles.tabSelected]}>
      <KolamCopyStack
        items={[
          {
            id: 'label',
            text: label,
            textProps: {numberOfLines: 1},
            style: [styles.label, selected && styles.labelSelected],
          },
        ]}
      />
      {typeof count === 'number' ? (
        <KolamCopyStack
          items={[
            {
              id: 'count',
              text: count,
              style: [styles.count, selected && styles.countSelected],
            },
          ]}
        />
      ) : null}
      {flag ? (
        <KolamCopyStack items={[{id: 'flag', text: flag, style: styles.flag}]} />
      ) : null}
      {selected ? <View style={styles.indicator} /> : null}
    </KolamInteractionFrame>
  );
}

const badgeFontWeight =
  KOLAM_BADGE_VISUAL.base.fontWeight === 'medium' ? '500' : '700';
const tabFontWeight =
  KOLAM_CONTROL_TABS_VISUAL.tabFontWeight === 'medium' ? '500' : '700';

const styles = StyleSheet.create({
  tab: {
    minHeight: KOLAM_CONTROL_TABS_VISUAL.tabMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 8,
    paddingHorizontal: KOLAM_CONTROL_TABS_VISUAL.tabPaddingX,
    paddingVertical: 0,
    borderRadius: 0,
    position: 'relative',
  },
  tabSelected: {
    backgroundColor:
      KOLAM_CONTROL_TABS_VISUAL.tabSelectedBackground === 'transparent'
        ? 'transparent'
        : V.colors.bg,
    shadowColor: V.colors.fg,
    shadowOpacity: KOLAM_CONTROL_TABS_VISUAL.tabSelectedShadow ? 0.08 : 0,
    shadowRadius: KOLAM_CONTROL_TABS_VISUAL.tabSelectedShadow ? 4 : 0,
    shadowOffset: {width: 0, height: 0},
  },
  label: {
    maxWidth: 150,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: KOLAM_CONTROL_TABS_VISUAL.fontSize,
    fontWeight: tabFontWeight,
  },
  labelSelected: {
    color: V.colors.fg,
  },
  count: {
    minWidth: 20,
    overflow: 'hidden',
    paddingHorizontal: KOLAM_BADGE_VISUAL.square.paddingX,
    paddingVertical: KOLAM_BADGE_VISUAL.base.paddingY,
    borderRadius: V.radius.sm,
    color: V.colors.mutedFg,
    backgroundColor: V.colors.muted,
    fontFamily: 'Consolas',
    fontSize: KOLAM_BADGE_VISUAL.base.fontSize,
    lineHeight: KOLAM_BADGE_VISUAL.base.lineHeight,
    fontWeight: badgeFontWeight,
    textAlign: 'center',
  },
  countSelected: {
    color: V.colors.primary,
    backgroundColor: V.colors.infoSoft,
  },
  flag: {
    overflow: 'hidden',
    paddingHorizontal: KOLAM_BADGE_VISUAL.square.paddingX,
    paddingVertical: KOLAM_BADGE_VISUAL.base.paddingY,
    borderRadius: V.radius.sm,
    color: V.colors.warning,
    backgroundColor: V.colors.warningSoft,
    fontFamily: V.fontFamily,
    fontSize: KOLAM_BADGE_VISUAL.base.fontSize,
    lineHeight: KOLAM_BADGE_VISUAL.base.lineHeight,
    fontWeight: badgeFontWeight,
  },
  indicator: {
    position: 'absolute',
    right: 0,
    bottom: -1,
    left: 0,
    height: KOLAM_CONTROL_TABS_VISUAL.tabIndicatorHeight,
    borderRadius: 999,
    backgroundColor: V.colors.fg,
  },
});

