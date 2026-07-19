import React from 'react';
import {StyleSheet} from 'react-native';
import {getDashboardLayoutVisualContract} from '../domain/dashboard-layout';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamDashboardCountStrip} from './kolam-dashboard-widgets';
import {KolamDashboardRailAction} from './kolam-dashboard-rail-action';
import {KolamHeaderFrame} from './kolam-header-frame';
import {DASHBOARD_COUNT_VISUAL} from './kolam-dashboard-metric-visual';
import type {KolamUnifiedDashboardCountSectionProps} from './kolam-unified-overview-panel-types';

const DASHBOARD_LAYOUT_VISUAL = getDashboardLayoutVisualContract();

export function KolamUnifiedDashboardCountSection({
  dashboardSections,
  onDashboardRoute,
}: KolamUnifiedDashboardCountSectionProps) {
  if (!dashboardSections.isKolamDashboard) {
    return null;
  }

  const descriptor = dashboardSections.countDescriptor;

  return (
    <KolamCardFrame variant="dashboardInventoryCounts" style={styles.section}>
      <KolamHeaderFrame variant="dashboardCountSection">
        <KolamCopyStack
          items={[
            {id: 'title', text: descriptor.title, style: styles.title},
            {
              id: 'description',
              text: descriptor.description,
              style: styles.description,
            },
          ]}
        />
        <KolamDashboardRailAction
          actionIconKind={descriptor.actionIconKind}
          actionLabel={descriptor.actionLabel}
          actionRoute={descriptor.actionRoute}
          onOpenRoute={onDashboardRoute}
          tone={descriptor.actionTone}
        />
      </KolamHeaderFrame>
      <KolamDashboardCountStrip
        cards={dashboardSections.countCards}
        onOpenRoute={onDashboardRoute}
        style={styles.countGrid}
      />
    </KolamCardFrame>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: DASHBOARD_LAYOUT_VISUAL.main.gapY,
  },
  title: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_COUNT_VISUAL.section.titleFontSize,
    fontWeight: '700',
  },
  description: {
    marginTop: DASHBOARD_COUNT_VISUAL.section.descriptionGapY,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_COUNT_VISUAL.section.descriptionFontSize,
  },
  countGrid: {
    marginBottom: 0,
    paddingHorizontal: DASHBOARD_COUNT_VISUAL.section.gridPaddingX,
    paddingBottom: DASHBOARD_COUNT_VISUAL.section.gridPaddingBottom,
  },
});
