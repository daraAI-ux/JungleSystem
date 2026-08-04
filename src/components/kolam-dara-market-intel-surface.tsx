import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useKolamAuthContext} from '../context/kolam-app-contexts';
import {
  KOLAM_DARA_MARKET_INTEL_JOBS_HREF,
  KOLAM_DARA_MARKET_INTEL_TABS,
  buildKolamDaraMarketIntelRoute,
  getKolamDaraMarketIntelTab,
  resolveKolamDaraMarketIntelAccess,
  type KolamDaraMarketIntelTabId,
} from '../domain/kolam-dara-market-intel';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamSurfacePanelTabs} from './kolam-surface-panel-tabs';

/**
 * Batch 0 foundation: tab chrome + empty bodies.
 * Controllers / fetches land in later batches.
 */
export function KolamDaraMarketIntelSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const selectedTab = getKolamDaraMarketIntelTab(route);
  const {authUser} = useKolamAuthContext();
  const access = resolveKolamDaraMarketIntelAccess({
    roleKey: authUser?.roleKey,
    permissions: authUser?.permissions,
    isOwner: (authUser as {isOwner?: boolean} | null | undefined)?.isOwner,
  });

  if (!access.canSee) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState title="Akses ditolak" message="ai-market-intel" />
      </View>
    );
  }

  return (
    <View style={styles.surface}>
      <View style={styles.tabBar}>
        <KolamSurfacePanelTabs
          onSelectTab={(tabId: KolamDaraMarketIntelTabId) => {
            if (tabId === 'jobs') {
              onRouteChange?.(KOLAM_DARA_MARKET_INTEL_JOBS_HREF);
              return;
            }
            onRouteChange?.(buildKolamDaraMarketIntelRoute(tabId));
          }}
          selectedTabId={selectedTab}
          tabs={KOLAM_DARA_MARKET_INTEL_TABS.map(tab => ({
            id: tab.id,
            label: tab.label,
          }))}
        />
      </View>

      <KolamDaraMarketIntelPlaceholderTab tabId={selectedTab} />
    </View>
  );
}

function KolamDaraMarketIntelPlaceholderTab({
  tabId,
}: {
  tabId: KolamDaraMarketIntelTabId;
}) {
  const label =
    KOLAM_DARA_MARKET_INTEL_TABS.find(tab => tab.id === tabId)?.label ??
    'Intel Pasar';

  return (
    <View style={styles.body}>
      <KolamEmptyState title="Belum tersedia" message={label} />
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 12,
  },
  tabBar: {
    flexShrink: 0,
  },
  body: {
    flex: 1,
  },
});
