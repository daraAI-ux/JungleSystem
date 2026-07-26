import React from 'react';
import {ScrollView, StatusBar, StyleSheet} from 'react-native';
import {getDashboardLayoutVisualContract} from '../domain/dashboard-layout';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {KolamOverlaySurface} from './kolam-overlay-surface';
import {KolamShellFrame} from './kolam-shell-frame';
import {
  KolamDashboardHeader,
  KolamSidebar,
  KolamTopNavigation,
} from './kolam-shell-widgets';

type KolamDashboardHeaderProps = React.ComponentProps<
  typeof KolamDashboardHeader
>;
type KolamOverlaySurfaceProps = React.ComponentProps<typeof KolamOverlaySurface>;
type KolamSidebarProps = React.ComponentProps<typeof KolamSidebar>;
type KolamTopNavigationProps = React.ComponentProps<typeof KolamTopNavigation>;
const DASHBOARD_LAYOUT_VISUAL = getDashboardLayoutVisualContract();

export interface KolamAppShellSurfaceProps {
  children: React.ReactNode;
  dashboardHeader: KolamDashboardHeaderProps;
  overlay: KolamOverlaySurfaceProps;
  rightRail?: React.ReactNode;
  sidebar: KolamSidebarProps;
  topNavigation: KolamTopNavigationProps;
}

export function KolamAppShellSurface({
  children,
  dashboardHeader,
  overlay,
  rightRail,
  sidebar,
  topNavigation,
}: KolamAppShellSurfaceProps) {
  const isKolamDashboard =
    sidebar.activeModule === 'kolam' || isKolamCenteredRoute(sidebar.activeRoute);

  return (
    <KolamShellFrame variant="appShell">
      <StatusBar barStyle="dark-content" />

      <KolamSidebar {...sidebar} />

      <KolamShellFrame variant="appMain">
        <KolamTopNavigation {...topNavigation} />
        <KolamOverlaySurface {...overlay} />

        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={[
            styles.mainContent,
            isKolamDashboard && styles.dashboardPageContent,
          ]}>
          <KolamDashboardHeader {...dashboardHeader} />
          {children}
        </ScrollView>
      </KolamShellFrame>

      {rightRail}
    </KolamShellFrame>
  );
}

function isKolamCenteredRoute(route?: string | null) {
  const routePath = route?.split('?')[0] ?? '';

  return KOLAM_CENTERED_ROUTE_PREFIXES.some(prefix =>
    routePath === prefix || routePath.startsWith(`${prefix}/`),
  );
}

const KOLAM_CENTERED_ROUTE_PREFIXES = [
  '/label-dan-field',
  '/merek',
  '/kategori',
  '/tag',
  '/field-kustom',
  '/satuan',
  '/species',
  '/taxonomy',
  '/iucn-status',
  '/products',
  '/archive',
  '/raw-materials',
  '/packing-materials',
  '/teranura',
  '/stock-transactions',
  '/stock-opname',
  '/locations',
  '/suppliers',
  '/purchase-orders',
];
const styles = StyleSheet.create({
  mainScroll: {
    flex: 1,
  },
  mainContent: {
    padding: V.layout.contentPadding,
  },
  dashboardPageContent: {
    width: '100%',
    maxWidth: DASHBOARD_LAYOUT_VISUAL.page.maxWidthPx,
    alignSelf: 'center',
    paddingHorizontal: DASHBOARD_LAYOUT_VISUAL.page.paddingX,
    paddingTop: DASHBOARD_LAYOUT_VISUAL.page.paddingTop,
    paddingBottom: DASHBOARD_LAYOUT_VISUAL.page.paddingBottom,
  },
});



