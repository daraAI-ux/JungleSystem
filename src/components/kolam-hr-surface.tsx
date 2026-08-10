import React, {useEffect, useMemo} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {useKolamAuthContext} from '../context/kolam-app-contexts';
import {
  buildKolamHrRoute,
  canonicalizeKolamHrRoute,
  KOLAM_HR_ACCESS_UNAVAILABLE,
  pickKolamHrVisibleTab,
  resolveKolamHrAccess,
  type KolamHrTabId,
} from '../domain/kolam-hr';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamHrAttendanceBody} from './kolam-hr-attendance-body';
import {KolamHrLeavesBody} from './kolam-hr-leaves-body';
import {KolamHrOvertimeBody} from './kolam-hr-overtime-body';
import {KolamSurfacePanelTabs} from './kolam-surface-panel-tabs';

/** FE `HrSystemPage` shell — no duplicate module title (dashboard header). */
export function KolamHrSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const {authUser} = useKolamAuthContext();
  const access = useMemo(
    () =>
      resolveKolamHrAccess({
        roleKey: authUser?.roleKey,
        permissions: authUser?.permissions,
      }),
    [authUser?.permissions, authUser?.roleKey],
  );

  const canonicalRoute = canonicalizeKolamHrRoute(route);
  const selectedTab = pickKolamHrVisibleTab(
    canonicalRoute,
    access.visibleTabs,
  );

  useEffect(() => {
    const next = canonicalizeKolamHrRoute(route);
    if (next !== route) {
      onRouteChange?.(next);
    }
  }, [onRouteChange, route]);

  if (!access.canSee) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState
          message="hr"
          title={KOLAM_HR_ACCESS_UNAVAILABLE}
        />
      </View>
    );
  }

  return (
    <View style={styles.surface}>
      <View style={styles.tabBar}>
        <KolamSurfacePanelTabs
          onSelectTab={(tabId: KolamHrTabId) => {
            onRouteChange?.(buildKolamHrRoute(tabId));
          }}
          selectedTabId={selectedTab}
          tabs={access.visibleTabs}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
        style={styles.scroll}>
        {selectedTab === 'absensi' ? (
          <KolamHrAttendanceBody
            enabled={access.canAbsensi}
            onRouteChange={onRouteChange}
          />
        ) : null}
        {selectedTab === 'cuti' ? (
          <KolamHrLeavesBody enabled={access.canCuti} />
        ) : null}
        {selectedTab === 'lembur' ? (
          <KolamHrOvertimeBody
            canUpdate={access.canLemburUpdate}
            enabled={access.canLembur}
          />
        ) : null}
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
