import React from 'react';
import type { KolamSettingsPanelController } from './kolam-settings-panel-controller';
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
  if (
    controller.activeSettingsTabId === 'umum' ||
    controller.activeSettingsTabId === 'notifikasi' ||
    controller.activeSettingsTabId === 'toko' ||
    controller.activeSettingsTabId === 'operasional' ||
    controller.activeSettingsTabId === 'finansial' ||
    controller.activeSettingsTabId === 'plugin' ||
    controller.activeSettingsTabId === 'konten'
  ) {
    return (
      <KolamSettingsWebConfigSurface
        activeTabId={controller.activeSettingsTabId}
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
        marketplaceLandingAssetStatus={controller.marketplaceLandingAssetStatus}
        financialSummaryRows={controller.financialSummaryRows}
        operationalRooms={controller.operationalRooms}
        operationalStaffRows={controller.operationalStaffRows}
        onClearMarketplaceLandingNoticeDraft={
          controller.clearMarketplaceLandingNoticeDraft
        }
        onDeleteMarketplaceAnnouncementBanner={banner => {
          void controller.deleteMarketplaceAnnouncementBanner(banner);
        }}
        onDeleteMarketplaceBioactiveStep={index => {
          void controller.deleteMarketplaceBioactiveStep(index);
        }}
        onDeleteMarketplaceCategoryBanner={banner => {
          void controller.deleteMarketplaceCategoryBanner(banner);
        }}
        onDeleteMarketplaceFeaturedCollection={index => {
          void controller.deleteMarketplaceFeaturedCollection(index);
        }}
        onDeleteMarketplaceHeroSlide={slide => {
          void controller.deleteMarketplaceHeroSlide(slide);
        }}
        onDeleteMarketplaceLandingNotice={key => {
          void controller.deleteMarketplaceLandingNotice(key);
        }}
        onEditMarketplaceLandingNotice={controller.editMarketplaceLandingNotice}
        onMoveMarketplaceAnnouncementBanner={(banner, direction) => {
          void controller.moveMarketplaceAnnouncementBanner(banner, direction);
        }}
        onMoveMarketplaceBioactiveStep={(index, direction) => {
          void controller.moveMarketplaceBioactiveStep(index, direction);
        }}
        onMoveMarketplaceCategoryBanner={(banner, direction) => {
          void controller.moveMarketplaceCategoryBanner(banner, direction);
        }}
        onMoveMarketplaceFeaturedCollection={(index, direction) => {
          void controller.moveMarketplaceFeaturedCollection(index, direction);
        }}
        onMoveMarketplaceHeroSlide={(slide, direction) => {
          void controller.moveMarketplaceHeroSlide(slide, direction);
        }}
        onSaveMarketplaceLandingCta={() => {
          void controller.saveMarketplaceLandingCta();
        }}
        onSaveMarketplaceLandingYoutube={() => {
          void controller.saveMarketplaceLandingYoutube();
        }}
        onSaveMarketplaceLandingNotice={() => {
          void controller.saveMarketplaceLandingNotice();
        }}
        onUploadMarketplaceAnnouncementImage={banner => {
          void controller.uploadMarketplaceAnnouncementImage(banner);
        }}
        onUploadMarketplaceBioactiveStepImage={index => {
          void controller.uploadMarketplaceBioactiveStepImage(index);
        }}
        onUploadMarketplaceCategoryBannerImage={banner => {
          void controller.uploadMarketplaceCategoryBannerImage(banner);
        }}
        onUploadMarketplaceCtaBackground={() => {
          void controller.uploadMarketplaceCtaBackground();
        }}
        onUploadMarketplaceDaraAvatar={() => {
          void controller.uploadMarketplaceDaraAvatar();
        }}
        onUploadMarketplaceFeaturedCollectionImage={index => {
          void controller.uploadMarketplaceFeaturedCollectionImage(index);
        }}
        onUploadMarketplaceHeroImage={slide => {
          void controller.uploadMarketplaceHeroImage(slide);
        }}
        onUploadMarketplaceLogo={() => {
          void controller.uploadMarketplaceLogo();
        }}
        onUploadMarketplaceYoutubeBackground={() => {
          void controller.uploadMarketplaceYoutubeBackground();
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

  if (controller.activeSettingsTabId === 'peran') {
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

  if (controller.activeSettingsTabId === 'sync') {
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
