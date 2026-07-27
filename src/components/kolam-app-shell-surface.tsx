import React from 'react';
import {ScrollView, StatusBar, StyleSheet, View} from 'react-native';
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

const MemoKolamSidebar = React.memo(KolamSidebar);
const MemoKolamTopNavigation = React.memo(KolamTopNavigation);
const MemoKolamOverlaySurface = React.memo(KolamOverlaySurface);
const MemoKolamDashboardHeader = React.memo(KolamDashboardHeader);

export interface KolamAppShellSurfaceProps {
  children: React.ReactNode;
  dashboardHeader: KolamDashboardHeaderProps;
  overlay: KolamOverlaySurfaceProps;
  rightRail?: React.ReactNode;
  sidebar: KolamSidebarProps;
  topNavigation: KolamTopNavigationProps;
}

function KolamAppShellSurfaceComponent({
  children,
  dashboardHeader,
  overlay,
  rightRail,
  sidebar,
  topNavigation,
}: KolamAppShellSurfaceProps) {
  const isKolamDashboard =
    sidebar.activeModule === 'kolam' || isKolamCenteredRoute(sidebar.activeRoute);
  const ownsListScroll = isCatalogTableListRoute(sidebar.activeRoute);
  const pageContentStyle = [
    styles.mainContent,
    isKolamDashboard && styles.dashboardPageContent,
  ];

  return (
    <KolamShellFrame variant="appShell">
      <StatusBar barStyle="dark-content" />

      <MemoKolamSidebar {...sidebar} />

      <KolamShellFrame variant="appMain">
        <MemoKolamTopNavigation {...topNavigation} />
        <MemoKolamOverlaySurface {...overlay} />

        {ownsListScroll ? (
          <View style={[styles.mainScroll, pageContentStyle, styles.ownedListPage]}>
            <MemoKolamDashboardHeader {...dashboardHeader} />
            <View style={styles.ownedListWorkspace}>{children}</View>
          </View>
        ) : (
          <ScrollView
            style={styles.mainScroll}
            contentContainerStyle={pageContentStyle}>
            <MemoKolamDashboardHeader {...dashboardHeader} />
            {children}
          </ScrollView>
        )}
      </KolamShellFrame>

      {rightRail}
    </KolamShellFrame>
  );
}

export const KolamAppShellSurface = React.memo(KolamAppShellSurfaceComponent);
KolamAppShellSurface.displayName = 'KolamAppShellSurface';

function isKolamCenteredRoute(route?: string | null) {
  const routePath = route?.split('?')[0] ?? '';

  return KOLAM_CENTERED_ROUTE_PREFIXES.some(prefix =>
    routePath === prefix || routePath.startsWith(`${prefix}/`),
  );
}

/** Catalog table lists own scrolling via FlatList; disable shell ScrollView nesting. */
export function isCatalogTableListRoute(route?: string | null) {
  const routePath = (route?.split('?')[0] ?? '').replace(/\/+$/, '') || '/';

  return (
    routePath === '/species' ||
    routePath === '/products' ||
    routePath === '/products/archive' ||
    routePath === '/raw-materials' ||
    routePath === '/teranura' ||
    routePath === '/stock-transaction' ||
    routePath === '/stock-opname'
  );
}

const KOLAM_CENTERED_ROUTE_PREFIXES = [
  '/pengaturan',
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
  '/stock-transaction',
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
  ownedListPage: {
    minHeight: 0,
  },
  ownedListWorkspace: {
    flex: 1,
    minHeight: 0,
  },
});
