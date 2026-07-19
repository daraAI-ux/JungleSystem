import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {DashboardCountCard} from '../domain/dashboard-counts';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamDashboardCountIcon} from './kolam-dashboard-count-icon';
import {DASHBOARD_COUNT_VISUAL} from './kolam-dashboard-metric-visual';
import {KolamInteractiveCardFrame} from './kolam-interactive-card-frame';

export function KolamDashboardCountCard({
  card,
  onOpenRoute,
}: {
  card: DashboardCountCard;
  onOpenRoute?: (route: string) => void;
}) {
  const content = (
    <>
      <View style={styles.dashboardCountIcon}>
        <KolamDashboardCountIcon kind={card.iconKind} />
      </View>
      <KolamCopyStack
        containerStyle={styles.dashboardCountCopy}
        items={[
          {
            id: 'value',
            text: card.value.toLocaleString('id-ID'),
            style: styles.dashboardCountValue,
          },
          {id: 'label', text: card.label, style: styles.dashboardCountLabel},
          {
            id: 'subLabel',
            text: card.subLabel,
            style: styles.dashboardCountSubLabel,
          },
        ]}
      />
    </>
  );

  if (!onOpenRoute) {
    return (
      <KolamCardFrame
        accessibilityLabel={card.accessibilityLabel}
        variant="dashboardCount">
        {content}
      </KolamCardFrame>
    );
  }

  return (
    <KolamInteractiveCardFrame
      accessibilityLabel={card.accessibilityLabel}
      onPress={() => onOpenRoute(card.routeHint)}
      variant="dashboardCount">
      {content}
    </KolamInteractiveCardFrame>
  );
}

const styles = StyleSheet.create({
  dashboardCountIcon: {
    width: DASHBOARD_COUNT_VISUAL.iconTile.size,
    height: DASHBOARD_COUNT_VISUAL.iconTile.size,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: DASHBOARD_COUNT_VISUAL.iconTile.radius,
    backgroundColor: V.colors[DASHBOARD_COUNT_VISUAL.iconTile.background],
  },
  dashboardCountCopy: {
    flex: 1,
    minWidth: 0,
  },
  dashboardCountLabel: {
    marginTop: DASHBOARD_COUNT_VISUAL.copy.labelGapY,
    color: V.colors[DASHBOARD_COUNT_VISUAL.copy.labelTone],
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_COUNT_VISUAL.copy.labelFontSize,
  },
  dashboardCountValue: {
    marginTop: DASHBOARD_COUNT_VISUAL.copy.valueGapY,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_COUNT_VISUAL.copy.valueFontSize,
    fontWeight: '700',
  },
  dashboardCountSubLabel: {
    marginTop: DASHBOARD_COUNT_VISUAL.copy.subLabelGapY,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: DASHBOARD_COUNT_VISUAL.copy.subLabelFontSize,
  },
});
