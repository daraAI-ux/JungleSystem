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
        marketplaceLandingOverview={controller.marketplaceLandingOverview}
        marketplaceLandingCtaDraft={controller.marketplaceLandingCtaDraft}
        marketplaceLandingYoutubeDraft={
          controller.marketplaceLandingYoutubeDraft
        }
        marketplaceLandingNoticeDraft={controller.marketplaceLandingNoticeDraft}
        marketplaceLandingSaveStatus={controller.marketplaceLandingSaveStatus}
        marketplaceLandingMessage={controller.marketplaceLandingMessage}
        onClearMarketplaceLandingNoticeDraft={
          controller.clearMarketplaceLandingNoticeDraft
        }
        onDeleteMarketplaceLandingNotice={key => {
          void controller.deleteMarketplaceLandingNotice(key);
        }}
        onEditMarketplaceLandingNotice={controller.editMarketplaceLandingNotice}
        onSaveMarketplaceLandingCta={() => {
          void controller.saveMarketplaceLandingCta();
        }}
        onSaveMarketplaceLandingYoutube={() => {
          void controller.saveMarketplaceLandingYoutube();
        }}
        onSaveMarketplaceLandingNotice={() => {
          void controller.saveMarketplaceLandingNotice();
        }}
        onToggleMaintenanceMode={() =>
          controller.setMaintenanceMode(current => !current)
        }
        onToggleStorefrontEnabled={() =>
          controller.setStorefrontEnabled(current => !current)
        }
        onSave={() => {
          void controller.saveWebSetting();
        }}
        onDeleteNotificationSound={type => {
          void controller.deleteNotificationSound(type);
        }}
        onPluginControlChange={controller.setWebSettingPluginControl}
        onUploadNotificationSound={type => {
          void controller.uploadNotificationSound(type);
        }}
        onWebTitleChange={controller.setWebTitle}
        setMarketplaceLandingCtaDraftField={
          controller.setMarketplaceLandingCtaDraftField
        }
        setMarketplaceLandingYoutubeDraftField={
          controller.setMarketplaceLandingYoutubeDraftField
        }
        setMarketplaceLandingNoticeDraftField={
          controller.setMarketplaceLandingNoticeDraftField
        }
        draft={controller.webSettingDraft}
        notificationSoundStatus={controller.notificationSoundStatus}
        saveMessage={controller.webSettingMessage}
        saveStatus={controller.webSettingSaveStatus}
        sections={controller.webFormSections}
        setDraftField={controller.setWebSettingDraftField}
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
        draft={controller.roleDraft}
        onAction={controller.onRoleAction}
        selectedRole={controller.selectedRole}
        selectedRoleId={controller.selectedRoleId}
        saveMessage={controller.roleMessage}
        saveStatus={controller.roleSaveStatus}
        setDraftField={controller.setRoleDraftField}
        onSelectRole={controller.setSelectedRoleId}
        onTogglePermissionAction={controller.onToggleRolePermissionAction}
      />
    );
  }

  if (controller.activeSurfaceId === 'activity-log') {
    return (
      <KolamSettingsActivityLogSurface
        columns={controller.activityColumns}
        filterControls={controller.activityFilterControls}
        filterValues={controller.activityLogFilters}
        onPageChange={controller.changeActivityPage}
        onRefresh={controller.refreshActivityLogs}
        onSelectActivityLog={controller.setSelectedActivityLogId}
        onFilterChange={controller.setActivityLogFilter}
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
