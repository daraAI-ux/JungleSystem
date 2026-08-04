import React, {useMemo} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useKolamAuthContext} from '../context/kolam-app-contexts';
import {
  buildKolamDaraTrainingRoute,
  buildKolamDaraTrainingStatsCards,
  getKolamDaraTrainingTab,
  KOLAM_DARA_TRAINING_TABS,
  resolveKolamDaraTrainingAccess,
  type KolamDaraTrainingTabId,
} from '../domain/kolam-dara-training';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {useKolamDaraTrainingController} from '../hooks/use-kolam-dara-training-controller';
import {KolamButton} from './kolam-button';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamStatsCardStrip} from './kolam-stats-card-strip';
import {KolamStatusBadge} from './kolam-status-badge';
import {KolamSurfacePanelTabs} from './kolam-surface-panel-tabs';
import {kolamTableToolbarStyles} from './kolam-table-toolbar-styles';

/** FE `DaraTrainingPage` shell (Batch 0). */
export function KolamDaraTrainingSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const {authUser} = useKolamAuthContext();
  const access = resolveKolamDaraTrainingAccess({
    roleKey: authUser?.roleKey,
    permissions: authUser?.permissions,
    isOwner: (authUser as {isOwner?: boolean} | null | undefined)?.isOwner,
  });
  const controller = useKolamDaraTrainingController(route, {
    enabled: access.canSee,
  });

  const selectedTab = getKolamDaraTrainingTab(route);
  const selectedTabLabel =
    KOLAM_DARA_TRAINING_TABS.find(tab => tab.id === selectedTab)?.label ??
    'Frasa respons cepat';

  const statsCards = useMemo(
    () =>
      controller.stats
        ? buildKolamDaraTrainingStatsCards(controller.stats)
        : [],
    [controller.stats],
  );

  if (!access.canSee) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState
          message="dara-training"
          title="Akses ditolak"
        />
      </View>
    );
  }

  return (
    <View style={styles.surface}>
      <View style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters} />
            <View style={kolamTableToolbarStyles.actions}>
              <KolamButton
                disabled={controller.loading}
                label={controller.loading ? 'Memuat…' : 'Muat ulang'}
                onPress={() => {
                  void controller.onRefresh();
                }}
                size="sm"
              />
            </View>
          </View>
        </View>
      </View>

      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
        />
      ) : null}

      {statsCards.length > 0 ? <KolamStatsCardStrip cards={statsCards} /> : null}

      <View style={styles.tabBar}>
        <KolamSurfacePanelTabs
          onSelectTab={(tabId: KolamDaraTrainingTabId) => {
            onRouteChange?.(buildKolamDaraTrainingRoute(tabId));
          }}
          selectedTabId={selectedTab}
          tabs={KOLAM_DARA_TRAINING_TABS.map(tab => ({
            id: tab.id,
            label: tab.label,
          }))}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}>
        {controller.loading && !controller.stats ? (
          <Text style={styles.meta}>Memuat…</Text>
        ) : (
          <View style={styles.stubCard}>
            <Text style={styles.stubTitle}>{selectedTabLabel}</Text>
          </View>
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
  toolbarWrap: {
    elevation: 1000,
    flexShrink: 0,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
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
  stubCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 12,
  },
  stubTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  meta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
});
