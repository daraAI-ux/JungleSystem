import React from 'react';
import type {KolamSettingsPanelController} from './kolam-settings-panel-controller';
import {
  KolamSettingsActivityLogSurface,
  KolamSettingsDetailRowsSurface,
  KolamSettingsRoleManagementSurface,
  KolamSettingsWebConfigSurface,
} from './kolam-settings-panel-surfaces';

export function KolamSettingsSurfaceBody({
  controller,
}: {
  controller: KolamSettingsPanelController;
}) {
  if (controller.activeSurfaceId === 'web-settings') {
    return (
      <KolamSettingsWebConfigSurface
        fields={controller.webConfigFields}
        maintenanceMode={controller.maintenanceMode}
        onToggleMaintenanceMode={() =>
          controller.setMaintenanceMode(current => !current)
        }
        onToggleStorefrontEnabled={() =>
          controller.setStorefrontEnabled(current => !current)
        }
        onWebTitleChange={controller.setWebTitle}
        sections={controller.webFormSections}
        storefrontEnabled={controller.storefrontEnabled}
        webTitle={controller.webTitle}
      />
    );
  }

  if (controller.activeSurfaceId === 'role-management') {
    return (
      <KolamSettingsRoleManagementSurface
        roleEditorActions={controller.roleEditorActions}
        roleInfoPanel={controller.roleInfoPanel}
        roleMemberPreview={controller.roleMemberPreview}
        rolePermissionMatrixGroups={controller.rolePermissionMatrixGroups}
        rolePermissionPreviewRows={controller.rolePermissionPreviewRows}
        roleResourceGroups={controller.roleResourceGroups}
        roleRows={controller.roleRows}
        roleTabItems={controller.roleTabItems}
        selectedRole={controller.selectedRole}
        selectedRoleId={controller.selectedRoleId}
        onSelectRole={controller.setSelectedRoleId}
      />
    );
  }

  if (controller.activeSurfaceId === 'activity-log') {
    return (
      <KolamSettingsActivityLogSurface
        columns={controller.activityColumns}
        filterControls={controller.activityFilterControls}
        onPageChange={controller.changeActivityPage}
        onSelectActivityLog={controller.setSelectedActivityLogId}
        pagination={controller.activityPagination}
        rows={controller.activityRows}
        selectedActivityLog={controller.selectedActivityLog}
        selectedActivityLogFields={controller.selectedActivityLogFields}
        selectedActivityLogId={controller.selectedActivityLogId}
        statsCards={controller.activityStatsCards}
      />
    );
  }

  return <KolamSettingsDetailRowsSurface rows={controller.detailRows} />;
}
