import React from 'react';
import {View} from 'react-native';
import {KolamAppShellSurface} from './kolam-app-shell-surface';
import {KolamImagePreviewHost} from './kolam-image-preview-dialog';
import {KolamLoginScreen} from './kolam-login-screen';
import {KolamMaintenanceLockScreen} from './kolam-maintenance-lock-screen';
import {KolamMediaPreviewHost} from './kolam-media-preview-dialog';
import {KolamPackageUpdateSessionHost} from './kolam-package-update-session-host';
import {KolamTeamChatGroupCallGateHost} from './kolam-team-chat-group-call-gate-host';
import {KolamWorkspaceSurface} from './kolam-workspace-surface';
import {
  useKolamAuthContext,
  useKolamShellChromeContext,
  useKolamWorkspaceViewContext,
} from '../context/kolam-app-contexts';
import {useKolamMaintenanceLockController} from '../hooks/use-kolam-maintenance-lock-controller';

export function KolamAppRoot() {
  const {authUser, deviceIdentityStatus} = useKolamAuthContext();
  const {runtime} = useKolamWorkspaceViewContext();
  const maintenanceLock = useKolamMaintenanceLockController(Boolean(authUser));

  if (!authUser) {
    return (
      <KolamLoginScreen
        auth={runtime.auth}
        deviceIdentityStatus={deviceIdentityStatus}
        syncStatus={runtime.syncStatus}
      />
    );
  }

  if (maintenanceLock.locked) {
    return <KolamMaintenanceLockScreen />;
  }

  return <KolamSignedInLayout />;
}

const KolamSignedInLayout = React.memo(function KolamSignedInLayout() {
  return (
    <View style={{flex: 1}}>
      <KolamPackageUpdateSessionHost />
      <KolamShellWorkspaceHost />
      <KolamImagePreviewHost />
      <KolamMediaPreviewHost />
      <KolamTeamChatGroupCallGateHost />
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
