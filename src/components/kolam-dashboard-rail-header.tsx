import React from 'react';
import {StyleSheet} from 'react-native';
import type {DashboardRailSection} from '../domain/dashboard-rail';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamDashboardRailAction} from './kolam-dashboard-rail-action';
import {KolamDashboardRailIconShell} from './kolam-dashboard-rail-icon-shell';
import {DASHBOARD_RAIL_VISUAL} from './kolam-dashboard-rail-visual';
import {KolamHeaderFrame} from './kolam-header-frame';

export function KolamDashboardRailHeader({
  onOpenRoute,
  section,
}: {
  onOpenRoute?: (route: string) => void;
  section: DashboardRailSection;
}) {
  return (
    <KolamHeaderFrame variant="dashboardRail">
      {DASHBOARD_RAIL_VISUAL.layout.headerIconVisible ? (
        <KolamDashboardRailIconShell
          iconKind={section.iconKind}
          tone={section.tone}
        />
      ) : null}
      <KolamCopyStack
        containerStyle={styles.dashboardRailHeaderCopy}
        items={[
          {
            id: 'title',
            text: section.title,
            style: [
              styles.dashboardRailTitle,
              section.tone === 'danger' && styles.dashboardRailTitleDanger,
              section.tone === 'warning' && styles.dashboardRailTitleWarning,
              section.tone === 'success' && styles.dashboardRailTitleSuccess,
            ],
          },
          ...(DASHBOARD_RAIL_VISUAL.layout.showDescription
            ? [
                {
                  id: 'description',
                  text: section.description,
                  style: styles.dashboardRailDescription,
                },
              ]
            : []),
        ]}
      />
      <KolamDashboardRailAction
        actionIconKind={section.actionIconKind}
        actionLabel={section.actionLabel}
        actionRoute={section.actionRoute}
        onOpenRoute={onOpenRoute}
        tone={section.tone}
      />
    </KolamHeaderFrame>
  );
}

const styles = StyleSheet.create({
  dashboardRailHeaderCopy: {
    flex: 1,
    minWidth: 0,
  },
  dashboardRailTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_RAIL_VISUAL.text.headerTitleFontSize,
    fontWeight: '800',
  },
  dashboardRailTitleDanger: {
    color: V.colors.danger,
  },
  dashboardRailTitleWarning: {
    color: V.colors.warning,
  },
  dashboardRailTitleSuccess: {
    color: V.colors.success,
  },
  dashboardRailDescription: {
    marginTop: DASHBOARD_RAIL_VISUAL.text.headerDescriptionGapY,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_RAIL_VISUAL.text.headerDescriptionFontSize,
  },
});
