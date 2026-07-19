import React from 'react';
import type {DashboardRailSection} from '../domain/dashboard-rail';
import {StyleSheet} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamChevronIcon} from './kolam-chevron-icon';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {KolamListFrame} from './kolam-list-frame';
import {KOLAM_BUTTON_VISUAL} from './kolam-dashboard-rail-visual';

type DashboardRailActionTone =
  | DashboardRailSection['tone']
  | 'default'
  | 'primary';

export function KolamDashboardRailAction({
  actionIconKind,
  actionLabel,
  actionRoute,
  onOpenRoute,
  tone = 'default',
}: {
  actionIconKind: DashboardRailSection['actionIconKind'];
  actionLabel: string;
  actionRoute?: DashboardRailSection['actionRoute'];
  onOpenRoute?: (route: string) => void;
  tone?: DashboardRailActionTone;
}) {
  const actionColor = getActionColor(tone);
  const content = (
    <KolamListFrame variant="dashboardRailAction">
      <KolamCopyStack
        items={[
          {
            id: 'label',
            text: actionLabel,
            style: [
              styles.dashboardRailActionText,
              {color: actionColor},
            ],
          },
        ]}
      />
      {actionIconKind === 'chevron' ? (
        <KolamChevronIcon color={actionColor} size="dashboard-sm" />
      ) : null}
    </KolamListFrame>
  );

  if (!onOpenRoute || !actionRoute) {
    return content;
  }

  return (
    <KolamInteractionFrame
      accessibilityLabel={`${actionLabel} - ${actionRoute}`}
      onPress={() => onOpenRoute(actionRoute)}>
      {content}
    </KolamInteractionFrame>
  );
}

function getActionColor(tone: DashboardRailActionTone) {
  switch (tone) {
    case 'danger':
      return V.colors.danger;
    case 'warning':
      return V.colors.warning;
    case 'success':
      return V.colors.success;
    case 'primary':
      return V.colors.primary;
    case 'default':
    default:
      return V.colors.mutedFg;
  }
}

const styles = StyleSheet.create({
  dashboardRailActionText: {
    fontFamily: V.fontFamily,
    fontSize: KOLAM_BUTTON_VISUAL.sizes.sm.fontSize,
    lineHeight: KOLAM_BUTTON_VISUAL.sizes.sm.lineHeight,
    fontWeight:
      KOLAM_BUTTON_VISUAL.base.fontWeight === 'medium' ? '500' : '700',
    textAlign: 'right',
  },
});
