import React from 'react';
import {KolamCopyStack} from './kolam-copy-stack';
import {StyleSheet} from 'react-native';
import type {DashboardRailSection} from '../domain/dashboard-rail';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {DASHBOARD_RAIL_VISUAL} from './kolam-dashboard-rail-visual';

type DashboardRailItem = DashboardRailSection['items'][number];

export function KolamDashboardRailValueBadge({
  item,
}: {
  item: DashboardRailItem;
}) {
  return (
    <KolamCopyStack
      items={[
        {
          id: 'value',
          text: item.value,
          style: [
            styles.dashboardRailValue,
            item.tone === 'danger' && styles.dashboardRailValueDanger,
            item.tone === 'warning' && styles.dashboardRailValueWarning,
            item.tone === 'success' && styles.dashboardRailValueSuccess,
          ],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dashboardRailValue: {
    minWidth: 32,
    overflow: 'hidden',
    paddingHorizontal: V.control.badgePaddingX,
    paddingVertical: V.control.badgePaddingY,
    borderRadius: V.control.badgeRadius,
    color: V.colors.fg,
    backgroundColor: V.colors.muted,
    fontFamily: V.fontFamily,
    fontSize: V.control.badgeFontSize,
    fontWeight:
      DASHBOARD_RAIL_VISUAL.valueDisplay.warningFontWeight === 'medium'
        ? '500'
        : '700',
    fontVariant: DASHBOARD_RAIL_VISUAL.valueDisplay.tabularNumbers
      ? ['tabular-nums']
      : undefined,
    textAlign: 'right',
  },
  dashboardRailValueDanger: {
    width: DASHBOARD_RAIL_VISUAL.valueDisplay.dangerSize,
    height: DASHBOARD_RAIL_VISUAL.valueDisplay.dangerSize,
    minWidth: DASHBOARD_RAIL_VISUAL.valueDisplay.dangerSize,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: DASHBOARD_RAIL_VISUAL.valueDisplay.dangerSize / 2,
    color: V.colors.danger,
    backgroundColor: V.colors.dangerSoft,
    fontWeight:
      DASHBOARD_RAIL_VISUAL.valueDisplay.dangerFontWeight === 'semibold'
        ? '600'
        : '700',
    textAlign: 'center',
    lineHeight: DASHBOARD_RAIL_VISUAL.valueDisplay.dangerSize,
  },
  dashboardRailValueWarning: {
    color: V.colors.warning,
    backgroundColor: V.colors.warningSoft,
  },
  dashboardRailValueSuccess: {
    minWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 0,
    color: V.colors.fg,
    backgroundColor: 'transparent',
    fontWeight:
      DASHBOARD_RAIL_VISUAL.valueDisplay.successFontWeight === 'medium'
        ? '500'
        : '600',
  },
});
