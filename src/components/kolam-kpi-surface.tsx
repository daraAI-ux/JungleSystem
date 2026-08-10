import React, {useMemo} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {useKolamAuthContext} from '../context/kolam-app-contexts';
import {
  buildKolamKpiRoute,
  getKolamKpiTab,
  KOLAM_KPI_ACCESS_DENIED,
  KOLAM_KPI_TABS,
  resolveKolamKpiAccess,
  type KolamKpiTabId,
} from '../domain/kolam-kpi';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamKpiChatReviewsBody} from './kolam-kpi-chat-reviews-body';
import {KolamKpiSummaryBody} from './kolam-kpi-summary-body';
import {KolamSurfacePanelTabs} from './kolam-surface-panel-tabs';

/** FE `KpiTeamPage` shell — no duplicate module title (dashboard header). */
export function KolamKpiSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const {authUser} = useKolamAuthContext();
  const access = useMemo(
    () =>
      resolveKolamKpiAccess({
        roleKey: authUser?.roleKey,
        permissions: authUser?.permissions,
      }),
    [authUser?.permissions, authUser?.roleKey],
  );

  const selectedTab = getKolamKpiTab(route);

  if (!access.canSee) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState message="kpi" title={KOLAM_KPI_ACCESS_DENIED} />
      </View>
    );
  }

  return (
    <View style={styles.surface}>
      <View style={styles.tabBar}>
        <KolamSurfacePanelTabs
          onSelectTab={(tabId: KolamKpiTabId) => {
            onRouteChange?.(buildKolamKpiRoute(tabId));
          }}
          selectedTabId={selectedTab}
          tabs={KOLAM_KPI_TABS}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
        style={styles.scroll}>
        {selectedTab === 'ringkasan' ? (
          <KolamKpiSummaryBody
            canView={access.canViewTeam}
            onRouteChange={onRouteChange}
          />
        ) : (
          <KolamKpiChatReviewsBody enabled={access.canViewTeam} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 10,
    minHeight: 0,
  },
  tabBar: {
    flexShrink: 0,
  },
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 24,
  },
});
