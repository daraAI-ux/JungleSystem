import React from 'react';
import {View} from 'react-native';
import {KolamAppShellSurface} from './kolam-app-shell-surface';
import {KolamImagePreviewHost} from './kolam-image-preview-dialog';
import {KolamLoginScreen} from './kolam-login-screen';
import {KolamMediaPreviewHost} from './kolam-media-preview-dialog';
import {KolamWorkspaceSurface} from './kolam-workspace-surface';
import {
  useKolamAuthContext,
  useKolamShellChromeContext,
  useKolamWorkspaceViewContext,
} from '../context/kolam-app-contexts';

export function KolamAppRoot() {
  const {authUser, deviceIdentityStatus} = useKolamAuthContext();
  const {runtime} = useKolamWorkspaceViewContext();

  if (!authUser) {
    return (
      <KolamLoginScreen
        auth={runtime.auth}
        deviceIdentityStatus={deviceIdentityStatus}
        syncStatus={runtime.syncStatus}
      />
    );
  }

  return <KolamSignedInLayout />;
}

const KolamSignedInLayout = React.memo(function KolamSignedInLayout() {
  return (
    <View style={{flex: 1}}>
      <KolamShellWorkspaceHost />
      <KolamImagePreviewHost />
      <KolamMediaPreviewHost />
    </View>
  );
});

function KolamShellWorkspaceHost() {
  const {
    dashboardHeader,
    overlay,
    rightRail,
    sidebar,
    topNavigation,
    workspaceTabs,
  } = useKolamShellChromeContext();

  return (
    <KolamAppShellSurface
      sidebar={sidebar}
      topNavigation={topNavigation}
      overlay={overlay}
      dashboardHeader={dashboardHeader}
      rightRail={rightRail}
      workspaceTabs={workspaceTabs}
    >
      <KolamWorkspaceHost />
    </KolamAppShellSurface>
  );
}

const KolamWorkspaceHost = React.memo(function KolamWorkspaceHost() {
  const {runtime, workspace} = useKolamWorkspaceViewContext();
  return <KolamWorkspaceSurface {...workspace} runtime={runtime} />;
});
