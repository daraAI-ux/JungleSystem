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
    controller.activeSettingsTabId === 'ai' ||
    controller.activeSettingsTabId === 'plugin' ||
    controller.activeSettingsTabId === 'konten' ||
    controller.activeSettingsTabId === 'sitemap' ||
    controller.activeSettingsTabId === 'sync' ||
    controller.activeSettingsTabId === 'kpi'
  ) {
    return (
      <KolamSettingsWebConfigSurface
        activeTabId={controller.activeSettingsTabId}
        fields={controller.webConfigFields}
        maintenanceMode={controller.maintenanceMode}
        marketplaceLandingOverview={controller.marketplaceLandingOverview}
        marketplaceLandingCtaDraft={controller.marketplaceLandingCtaDraft}
        marketplaceLandingHeroDraft={controller.marketplaceLandingHeroDraft}
        marketplaceLandingCategoryDraft={
          controller.marketplaceLandingCategoryDraft
        }
        marketplaceLandingAnnouncementDraft={
          controller.marketplaceLandingAnnouncementDraft
        }
        marketplaceLandingYoutubeDraft={
          controller.marketplaceLandingYoutubeDraft
        }
        marketplaceLandingNoticeDraft={controller.marketplaceLandingNoticeDraft}
        marketplaceLandingSaveStatus={controller.marketplaceLandingSaveStatus}
        marketplaceLandingMessage={controller.marketplaceLandingMessage}
        marketplaceLandingAssetStatus={controller.marketplaceLandingAssetStatus}
        marketplaceLandingTabId={controller.marketplaceLandingTabId}
        marketplaceLandingTabItems={controller.marketplaceLandingTabItems}
        webContentLauncherItems={controller.webContentLauncherItems}
        webContentMessage={controller.webContentMessage}
        webContentPanelId={controller.webContentPanelId}
        webContentStatus={controller.webContentStatus}
        blogRows={controller.blogRows}
        blogTopicRows={controller.blogTopicRows}
        financialSummaryRows={controller.financialSummaryRows}
        financialMessage={controller.financialMessage}
        financialSectionVisibility={controller.financialSectionVisibility}
        financialStatus={controller.financialStatus}
        financialWallets={controller.financialWallets}
        daraKnowledgeDraft={controller.daraKnowledgeDraft}
        daraKnowledgeMessage={controller.daraKnowledgeMessage}
        daraKnowledgeSaveStatus={controller.daraKnowledgeSaveStatus}
        kpiMessage={controller.kpiMessage}
        kpiPreview={controller.kpiPreview}
        kpiSettingsDraft={controller.kpiSettingsDraft}
        kpiStatus={controller.kpiStatus}
        kpiSummaryRows={controller.kpiSummaryRows}
        paymentMethodDraft={controller.paymentMethodDraft}
        paymentMethodFilters={controller.paymentMethodFilters}
        paymentMethodTotal={controller.paymentMethodTotal}
        paymentMethodTotalPages={controller.paymentMethodTotalPages}
        paymentMethods={controller.paymentMethods}
        operationalRooms={controller.operationalRooms}
        operationalStaffRows={controller.operationalStaffRows}
        regionLevel={controller.regionLevel}
        regionProvinceRows={controller.regionProvinceRows}
        regionRegencyRows={controller.regionRegencyRows}
        regionDistrictRows={controller.regionDistrictRows}
        regionVillageRows={controller.regionVillageRows}
        regionRows={controller.regionRows}
        selectedProvince={controller.selectedProvince}
        selectedRegency={controller.selectedRegency}
        selectedDistrict={controller.selectedDistrict}
        selectedVillage={controller.selectedVillage}
        regionSyncMessage={controller.regionSyncMessage}
        regionSyncStatus={controller.regionSyncStatus}
        regionSyncSummaryRows={controller.regionSyncSummaryRows}
        onClearMarketplaceLandingNoticeDraft={
          controller.clearMarketplaceLandingNoticeDraft
        }
        onDeleteMarketplaceAnnouncementBanner={banner => {
          void controller.deleteMarketplaceAnnouncementBanner(banner);
        }}
        onDeleteMarketplaceCategoryBanner={banner => {
          void controller.deleteMarketplaceCategoryBanner(banner);
        }}
        onDeleteMarketplaceFeaturedCollection={index => {
          void controller.deleteMarketplaceFeaturedCollection(index);
        }}
        marketplaceCategories={controller.marketplaceCategories}
        onDeleteMarketplaceHeroSlide={slide => {
          void controller.deleteMarketplaceHeroSlide(slide);
        }}
        onDeleteMarketplaceLandingNotice={key => {
          void controller.deleteMarketplaceLandingNotice(key);
        }}
        onDeletePaymentMethod={id => {
          void controller.deletePaymentMethod(id);
        }}
        onDeletePaymentMethodPhoto={id => {
          void controller.deletePaymentMethodPhoto(id);
        }}
        onEditMarketplaceAnnouncementBanner={
          controller.editMarketplaceAnnouncementBanner
        }
        onEditMarketplaceCategoryBanner={
          controller.editMarketplaceCategoryBanner
        }
        onEditMarketplaceHeroSlide={controller.editMarketplaceHeroSlide}
        onEditMarketplaceLandingNotice={controller.editMarketplaceLandingNotice}
        onEditPaymentMethod={controller.editPaymentMethod}
        onMoveMarketplaceAnnouncementBanner={(banner, direction) => {
          void controller.moveMarketplaceAnnouncementBanner(banner, direction);
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
        onAddMarketplaceFeaturedCollection={
          controller.addMarketplaceFeaturedCollection
        }
        onUpdateMarketplaceFeaturedCollection={
          controller.updateMarketplaceFeaturedCollection
        }
        onUpdateMarketplaceBioactiveStep={
          controller.updateMarketplaceBioactiveStep
        }
        onSaveMarketplaceFeaturedCollections={() => {
          void controller.saveMarketplaceFeaturedCollections();
        }}
        onSaveMarketplaceBioactiveEcosystem={() => {
          void controller.saveMarketplaceBioactiveEcosystem();
        }}
        onPickMarketplaceLandingAnnouncementImage={() => {
          void controller.pickMarketplaceLandingAnnouncementImage();
        }}
        onPickMarketplaceLandingCategoryImage={() => {
          void controller.pickMarketplaceLandingCategoryImage();
        }}
        onPickMarketplaceLandingHeroImage={() => {
          void controller.pickMarketplaceLandingHeroImage();
        }}
        onClearMarketplaceAnnouncementDraft={
          controller.clearMarketplaceAnnouncementDraft
        }
        onClearMarketplaceCategoryDraft={
          controller.clearMarketplaceCategoryDraft
        }
        onClearMarketplaceHeroDraft={controller.clearMarketplaceHeroDraft}
        onSaveMarketplaceAnnouncementBanner={() => {
          void controller.saveMarketplaceAnnouncementBanner();
        }}
        onSaveMarketplaceCategoryBanner={() => {
          void controller.saveMarketplaceCategoryBanner();
        }}
        onSaveMarketplaceHeroSlide={() => {
          void controller.saveMarketplaceHeroSlide();
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
        onSaveDaraKnowledge={() => {
          void controller.saveDaraKnowledge();
        }}
        onClearPaymentMethodDraft={controller.clearPaymentMethodDraft}
        onSaveEnclosureSaleCommission={() => {
          void controller.saveEnclosureSaleCommission();
        }}
        onSaveFinancialTaxToggle={(key, value) => {
          controller.saveFinancialTaxToggle(key, value);
        }}
        onSaveOvertimeSettings={() => {
          void controller.saveOvertimeSettings();
        }}
        onSavePaymentMethod={() => {
          void controller.savePaymentMethod();
        }}
        onSaveTaxCompanyProfile={() => {
          void controller.saveTaxCompanyProfile();
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
        onUploadDaraWorkerPhoto={() => {
          void controller.uploadDaraWorkerPhoto();
        }}
        onUploadPaymentMethodPhoto={id => {
          void controller.uploadPaymentMethodPhoto(id);
        }}
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
        onRefreshRegionSync={controller.refreshRegionSync}
        onRefreshKpiWeeklyPreview={controller.refreshKpiWeeklyPreview}
        onRunRegionSync={scope => {
          void controller.runRegionSync(scope);
        }}
        onSaveKpiSettings={() => {
          void controller.saveKpiSettings();
        }}
        onSaveNotificationFirebase={() => {
          void controller.saveNotificationFirebase();
        }}
        onSaveNotificationOtpSmtp={() => {
          void controller.saveNotificationOtpSmtp();
        }}
        onSaveNotificationToggle={(key, value) => {
          void controller.saveNotificationToggle(key, value);
        }}
        onSaveShippingOrigin={() => {
          void controller.saveShippingOrigin();
        }}
        onSaveStoreOperatingHours={() => {
          void controller.saveStoreOperatingHours();
        }}
        onSaveOperationalComplaintPeriod={() => {
          void controller.saveOperationalComplaintPeriod();
        }}
        onSaveOperationalGoogleAuth={patch => {
          void controller.saveOperationalGoogleAuth(patch);
        }}
        onSaveOperationalLivechat={value => {
          void controller.saveOperationalLivechat(value);
        }}
        onSaveOperationalMaintenance={(target, value) => {
          void controller.saveOperationalMaintenance(target, value);
        }}
        onSaveOperationalPoWorkflow={patch => {
          void controller.saveOperationalPoWorkflow(patch);
        }}
        onSaveOperationalStaffAttendance={() => {
          void controller.saveOperationalStaffAttendance();
        }}
        onWebTitleChange={controller.setWebTitle}
        setMarketplaceLandingCtaDraftField={
          controller.setMarketplaceLandingCtaDraftField
        }
        setMarketplaceLandingAnnouncementDraftField={
          controller.setMarketplaceLandingAnnouncementDraftField
        }
        setMarketplaceLandingCategoryDraftField={
          controller.setMarketplaceLandingCategoryDraftField
        }
        setMarketplaceLandingHeroDraftField={
          controller.setMarketplaceLandingHeroDraftField
        }
        setMarketplaceLandingTabId={controller.setMarketplaceLandingTabId}
        setKpiEnabledRule={controller.setKpiEnabledRule}
        setKpiSettingsDraftField={controller.setKpiSettingsDraftField}
        setMarketplaceLandingYoutubeDraftField={
          controller.setMarketplaceLandingYoutubeDraftField
        }
        setMarketplaceLandingNoticeDraftField={
          controller.setMarketplaceLandingNoticeDraftField
        }
        setPaymentMethodDraftField={controller.setPaymentMethodDraftField}
        setPaymentMethodFilter={controller.setPaymentMethodFilter}
        setDaraKnowledgeDraftField={controller.setDaraKnowledgeDraftField}
        setWebContentPanelId={controller.setWebContentPanelId}
        setRegionSelection={controller.setRegionSelection}
        setSitemapCustomUrlsDraftText={controller.setSitemapCustomUrlsDraftText}
        setSitemapExcludedSlugsDraftText={
          controller.setSitemapExcludedSlugsDraftText
        }
        setSitemapMasterField={controller.setSitemapMasterField}
        setSitemapSectionField={controller.setSitemapSectionField}
        setSitemapStaticPageField={controller.setSitemapStaticPageField}
        addSitemapStaticPage={controller.addSitemapStaticPage}
        removeSitemapStaticPage={controller.removeSitemapStaticPage}
        setSitemapCustomUrlField={controller.setSitemapCustomUrlField}
        addSitemapCustomUrl={controller.addSitemapCustomUrl}
        removeSitemapCustomUrl={controller.removeSitemapCustomUrl}
        setTaxCompanyProfileDraftField={
          controller.setTaxCompanyProfileDraftField
        }
        taxCompanyProfile={controller.taxCompanyProfile}
        taxCompanyProfileDraft={controller.taxCompanyProfileDraft}
        taxPartyGaps={controller.taxPartyGaps}
        draft={controller.webSettingDraft}
        notificationSoundStatus={controller.notificationSoundStatus}
        sitemapChangeFrequencies={controller.sitemapChangeFrequencies}
        sitemapCustomUrlsText={controller.sitemapCustomUrlsText}
        sitemapDraft={controller.sitemapDraft}
        sitemapExcludedSlugsText={controller.sitemapExcludedSlugsText}
        sitemapSectionKeys={controller.sitemapSectionKeys}
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
        roleToDelete={controller.roleToDelete}
        saveMessage={controller.roleMessage}
        saveStatus={controller.roleSaveStatus}
        onCancelRoleDelete={controller.cancelRoleDelete}
        onConfirmRoleDelete={controller.confirmRoleDelete}
        setDraftField={controller.setRoleDraftField}
        onSelectRole={controller.setSelectedRoleId}
        onTogglePermissionAction={controller.onToggleRolePermissionAction}
      />
    );
  }

  if (controller.activeSettingsTabId === 'activity-log') {
    return (
      <KolamSettingsActivityLogSurface
        columns={controller.activityColumns}
        filterControls={controller.activityFilterControls}
        filterValues={controller.activityLogFilters}
        message={controller.activityLogMessage}
        onFilterChange={controller.setActivityLogFilter}
        onBlockActivityLogIp={controller.requestBlockActivityLogIp}
        onCancelBlockActivityLogIp={controller.cancelBlockActivityLogIp}
        onCancelDeleteAllActivityLogs={controller.cancelDeleteAllActivityLogs}
        onConfirmBlockActivityLogIp={controller.confirmBlockActivityLogIp}
        onConfirmDeleteAllActivityLogs={controller.confirmDeleteAllActivityLogs}
        onPageChange={controller.changeActivityPage}
        onRefresh={controller.refreshActivityLogs}
        onRequestDeleteAllActivityLogs={controller.requestDeleteAllActivityLogs}
        onSelectActivityLog={controller.setSelectedActivityLogId}
        pagination={controller.activityPagination}
        rows={controller.activityRows}
        blockIpTarget={controller.activityLogBlockIpTarget}
        deleteAllOpen={controller.activityLogDeleteOpen}
        deletingAll={controller.activityLogDeleting}
        selectedActivityLog={controller.selectedActivityLog}
        selectedActivityLogFields={controller.selectedActivityLogFields}
        selectedActivityLogId={controller.selectedActivityLogId}
        statsCards={controller.activityStatsCards}
      />
    );
  }

  return <KolamSettingsDetailRowsSurface rows={controller.detailRows} />;
}
