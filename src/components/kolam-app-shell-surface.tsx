import React from 'react';
import { ImageBackground, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { getDashboardLayoutVisualContract } from '../domain/dashboard-layout';
import {
  getKolamWorkspaceScrollPolicy,
  isCatalogTableListRoute,
} from '../domain/kolam-workspace-scroll';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { KolamOverlaySurface } from './kolam-overlay-surface';
import { KolamShellFrame } from './kolam-shell-frame';
import {
  KolamDashboardHeader,
  KolamSidebar,
  KolamTopNavigation,
} from './kolam-shell-widgets';
import { KolamWorkspaceScrollProvider } from './kolam-workspace-scroll-context';

type KolamDashboardHeaderProps = React.ComponentProps<
  typeof KolamDashboardHeader
>;
type KolamOverlaySurfaceProps = React.ComponentProps<
  typeof KolamOverlaySurface
>;
type KolamSidebarProps = React.ComponentProps<typeof KolamSidebar>;
type KolamTopNavigationProps = React.ComponentProps<typeof KolamTopNavigation>;
const DASHBOARD_LAYOUT_VISUAL = getDashboardLayoutVisualContract();
const BODY_BACKGROUND_SOURCE = require('../assets/images/bg-body.png');

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
  workspaceTabs?: React.ReactNode;
}

function KolamAppShellSurfaceComponent({
  children,
  dashboardHeader,
  overlay,
  rightRail,
  sidebar,
  topNavigation,
  workspaceTabs,
}: KolamAppShellSurfaceProps) {
  if (isPosFullWindowShellRoute(sidebar)) {
    return (
      <KolamShellFrame variant="appShell">
        <StatusBar barStyle="dark-content" />
        {children}
      </KolamShellFrame>
    );
  }

  const workspaceScrollPolicy = getKolamWorkspaceScrollPolicy({
    activeModule: sidebar.activeModule,
    route: sidebar.activeRoute,
  });
  const shellScrollRef = React.useRef<ScrollView>(null);
  const scrollShellTo = React.useCallback(
    (options: {animated?: boolean; x?: number; y?: number}) => {
      shellScrollRef.current?.scrollTo(options);
    },
    [],
  );
  const ownsWorkspaceScroll = workspaceScrollPolicy.scrollOwner === 'workspace';
  const pageContentStyle = [
    styles.mainContent,
    workspaceScrollPolicy.layout === 'centered' && styles.dashboardPageContent,
  ];
  const shellScrollKey = rightRail ? 'right-rail-open' : 'right-rail-closed';

  return (
    <KolamShellFrame variant="appShell">
      <StatusBar barStyle="dark-content" />

      <MemoKolamSidebar {...sidebar} />

      <KolamShellFrame variant="appMain">
        <MemoKolamTopNavigation {...topNavigation} />
        {workspaceTabs}
        <MemoKolamOverlaySurface {...overlay} />

        <ImageBackground
          resizeMode="cover"
          source={BODY_BACKGROUND_SOURCE}
          style={styles.bodyBackground}
        >
          <View style={styles.bodyBackgroundOverlay} />
          <KolamWorkspaceScrollProvider
            policy={workspaceScrollPolicy}
            scrollTo={scrollShellTo}
          >
            {ownsWorkspaceScroll ? (
              <View
                style={[styles.mainScroll, pageContentStyle, styles.ownedListPage]}
              >
                <MemoKolamDashboardHeader {...dashboardHeader} />
                <View style={styles.ownedListWorkspace}>{children}</View>
              </View>
            ) : (
              <ScrollView
                key={shellScrollKey}
                ref={shellScrollRef}
                keyboardShouldPersistTaps="handled"
                style={styles.mainScroll}
                contentContainerStyle={[pageContentStyle, styles.scrollContent]}
              >
                <MemoKolamDashboardHeader {...dashboardHeader} />
                {children}
              </ScrollView>
            )}
          </KolamWorkspaceScrollProvider>
        </ImageBackground>
      </KolamShellFrame>

      {rightRail}
    </KolamShellFrame>
  );
}

export const KolamAppShellSurface = React.memo(KolamAppShellSurfaceComponent);
KolamAppShellSurface.displayName = 'KolamAppShellSurface';

function isPosFullWindowShellRoute(sidebar: KolamSidebarProps) {
  if (sidebar.activeModule === 'checkout') {
    return true;
  }

  if (sidebar.activeModuleRoute?.moduleId === 'checkout') {
    return true;
  }

  const routePath = normalizeShellRoutePath(sidebar.activeRoute);

  return POS_FULL_WINDOW_ROUTES.has(routePath);
}

function normalizeShellRoutePath(route?: string | null) {
  const path = String(route ?? '').split('?')[0].replace(/\/+$/, '');

  if (!path) {
    return '/';
  }

  return path.startsWith('/') ? path : `/${path}`;
}

const POS_FULL_WINDOW_ROUTES = new Set([
  '/checkout',
  '/cart',
  '/payment',
  '/sale-draft',
  '/pos',
  '/pos/checkout',
]);

/**
 * Routes that own workspace scrolling; disable shell ScrollView nesting.
 * Keep mapped-table pages out of this list: they rely on the shell ScrollView.
 */
export { isCatalogTableListRoute };
const styles = StyleSheet.create({
  mainScroll: {
    flex: 1,
  },
  bodyBackground: {
    flex: 1,
  },
  bodyBackgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(247, 250, 247, 0.58)',
  },
  mainContent: {
    padding: V.layout.contentPadding,
  },
  scrollContent: {
    flexGrow: 1,
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
