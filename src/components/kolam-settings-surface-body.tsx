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
        regionParentCode={controller.regionParentCode}
        regionRows={controller.regionRows}
        regionSearch={controller.regionSearch}
        regionSyncMessage={controller.regionSyncMessage}
        regionSyncStatus={controller.regionSyncStatus}
        regionSyncSummaryRows={controller.regionSyncSummaryRows}
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
        onDeletePaymentMethod={id => {
          void controller.deletePaymentMethod(id);
        }}
        onDeletePaymentMethodPhoto={id => {
          void controller.deletePaymentMethodPhoto(id);
        }}
        onEditMarketplaceLandingNotice={controller.editMarketplaceLandingNotice}
        onEditPaymentMethod={controller.editPaymentMethod}
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
        setRegionFilter={controller.setRegionFilter}
        setSitemapCustomUrlsDraftText={controller.setSitemapCustomUrlsDraftText}
        setSitemapExcludedSlugsDraftText={
          controller.setSitemapExcludedSlugsDraftText
        }
        setSitemapMasterField={controller.setSitemapMasterField}
        setSitemapSectionField={controller.setSitemapSectionField}
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
        saveMessage={controller.roleMessage}
        saveStatus={controller.roleSaveStatus}
        setDraftField={controller.setRoleDraftField}
        onSelectRole={controller.setSelectedRoleId}
        onTogglePermissionAction={controller.onToggleRolePermissionAction}
      />
    );
  }

  return <KolamSettingsDetailRowsSurface rows={controller.detailRows} />;
}
