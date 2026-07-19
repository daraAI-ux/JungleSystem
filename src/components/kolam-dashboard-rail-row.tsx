import React from 'react';
import {StyleSheet} from 'react-native';
import type {DashboardRailSection} from '../domain/dashboard-rail';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamChevronIcon} from './kolam-chevron-icon';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamDashboardProductThumb} from './kolam-dashboard-product-thumb';
import {KolamDashboardRailValueBadge} from './kolam-dashboard-rail-value-badge';
import {DASHBOARD_RAIL_VISUAL} from './kolam-dashboard-rail-visual';
import {KolamInteractiveCardFrame} from './kolam-interactive-card-frame';

type DashboardRailItem = DashboardRailSection['items'][number];

export function KolamDashboardRailRow({
  item,
  onOpenRoute,
}: {
  item: DashboardRailItem;
  onOpenRoute?: (route: string) => void;
}) {
  const content = (
    <>
      <KolamDashboardProductThumb label={item.label} url={item.thumbnailUrl} />
      <KolamCopyStack
        containerStyle={styles.dashboardRailIdentity}
        items={[
          {id: 'label', text: item.label, style: styles.dashboardRailLabel},
          ...(DASHBOARD_RAIL_VISUAL.list.showItemMeta
            ? [
                {
                  id: 'meta',
                  text: item.meta,
                  style: styles.dashboardRailMeta,
                },
              ]
            : []),
        ]}
      />
      <KolamDashboardRailValueBadge item={item} />
      {DASHBOARD_RAIL_VISUAL.list.showRowChevron &&
      item.trailingIconKind === 'chevron' ? (
        <KolamChevronIcon />
      ) : null}
    </>
  );

  if (!onOpenRoute) {
    return (
      <KolamCardFrame variant="dashboardRailRow">
        {content}
      </KolamCardFrame>
    );
  }

  return (
    <KolamInteractiveCardFrame
      accessibilityLabel={`${item.label} - ${item.route}`}
      onPress={() => onOpenRoute(item.route)}
      variant="dashboardRailRow">
      {content}
    </KolamInteractiveCardFrame>
  );
}

const styles = StyleSheet.create({
  dashboardRailIdentity: {
    flex: 1,
    minWidth: 0,
  },
  dashboardRailLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_RAIL_VISUAL.text.rowLabelFontSize,
    fontWeight:
      DASHBOARD_RAIL_VISUAL.text.rowLabelFontWeight === 'regular'
        ? '400'
        : '700',
  },
  dashboardRailMeta: {
    marginTop: DASHBOARD_RAIL_VISUAL.text.rowMetaGapY,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_RAIL_VISUAL.text.rowMetaFontSize,
  },
});
