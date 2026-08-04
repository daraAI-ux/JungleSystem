import React from 'react';
import {
  KolamGlobalChatRail,
  type KolamGlobalChatRailMode,
} from '../components/kolam-global-chat-rail';
import {KolamWorkspaceTabStrip} from '../components/kolam-workspace-tab-strip';
import type {DashboardSalesGraphRange} from '../domain/dashboard-sales-graph';
import type {TopNavRightControl} from '../domain/top-nav';
import type {KolamWorkspaceTabSnapshot} from '../domain/kolam-workspace-tabs';
import {
  DEFAULT_SETTINGS_TAB_ID,
  getSettingsTabItemById,
  type SettingsTabItem,
} from '../domain/settings-surface';
import {getUnifiedSyncMessage} from '../services/unified-data';
import {useKolamAuthController} from '../hooks/use-kolam-auth-controller';
import {useKolamCashflowController} from '../hooks/use-kolam-cashflow-controller';
import {useKolamCashflowPreview} from '../hooks/use-kolam-cashflow-preview';
import {useKolamCheckoutController} from '../hooks/use-kolam-checkout-controller';
import {useKolamCustomerController} from '../hooks/use-kolam-customer-controller';
import {useKolamNavigationController} from '../hooks/use-kolam-navigation-controller';
import {useKolamNativeDeviceIdentity} from '../hooks/use-kolam-native-device-identity';
import {useKolamPosDatasetMutationController} from '../hooks/use-kolam-pos-dataset-mutation-controller';
import {useKolamRuntimeActionController} from '../hooks/use-kolam-runtime-action-controller';
import {useKolamRuntimeSurfaceController} from '../hooks/use-kolam-runtime-surface-controller';
import {useKolamRuntimeStatusController} from '../hooks/use-kolam-runtime-status-controller';
import {useKolamSaleDraftController} from '../hooks/use-kolam-sale-draft-controller';
import {useKolamSaleStatusController} from '../hooks/use-kolam-sale-status-controller';
import {useKolamSessionSyncController} from '../hooks/use-kolam-session-sync-controller';
import {useKolamShellChromeController} from '../hooks/use-kolam-shell-chrome-controller';
import {useKolamShellInteractionController} from '../hooks/use-kolam-shell-interaction-controller';
import {useKolamUnifiedDataController} from '../hooks/use-kolam-unified-data-controller';
import {useKolamWorkspaceSurfaceController} from '../hooks/use-kolam-workspace-surface-controller';
import {useKolamWorkspaceTabsController} from '../hooks/use-kolam-workspace-tabs-controller';
import {
  KolamAuthContext,
  KolamDataContext,
  KolamNavigationContext,
  KolamShellChromeContext,
  KolamWorkspaceTabsContext,
  KolamWorkspaceViewContext,
  type KolamAuthContextValue,
  type KolamDataContextValue,
  type KolamNavigationContextValue,
  type KolamShellChromeContextValue,
  type KolamWorkspaceTabsContextValue,
  type KolamWorkspaceViewContextValue,
} from './kolam-app-contexts';

export function KolamAppStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const localFirstSyncedOwnerRef = React.useRef<string | null>(null);
  const [activeChatRail, setActiveChatRail] =
    React.useState<KolamGlobalChatRailMode | null>(null);
  const [activeSettingsTab, setActiveSettingsTab] =
    React.useState<SettingsTabItem | null>(
      getSettingsTabItemById(DEFAULT_SETTINGS_TAB_ID),
    );
  const deviceIdentityStatus = useKolamNativeDeviceIdentity();
  const {
    accessScope,
    authEmail,
    authMessage,
    authPassword,
    authSource,
    authSourceHint,
    authUser,
    displayName,
    handleSignIn: signInAuth,
    handleSignOut: signOutAuth,
    isSigningIn,
    setAuthEmail,
    setAuthMessage,
    setAuthPassword,
    setAuthSource,
  } = useKolamAuthController();
  const {
    amApiBaseUrl,
    dataset,
    isLoadingDataset,
    kolamDashboardRange,
    refreshUnifiedDataset,
    setAmApiBaseUrl,
    setDataset,
    setKolamDashboardRange,
    syncActivity,
  } = useKolamUnifiedDataController();
  const {
    activeNavigationItem,
    activeAmSurface,
    activeKolamSurface,
    activeModuleRoute,
    activePluginRoute,
    activeModule,
    commandIndex,
    commandSearch,
    expandedKolamMenuSections,
    filteredCommands,
    filteredPlugins,
    handleAmSurfaceSelect,
    handleBreadcrumbPress,
    handleCommand: handleNavigationCommand,
    handleDashboardRouteContext,
    handleKolamNavigationItem,
    handleKolamSurfaceSelect,
    handleModuleSelect,
    handleModuleRouteSelect,
    handlePluginRouteSelect,
    handleMoveKolamMenuSection,
    handleUserMenuAction: handleNavigationUserMenuAction,
    isAttentionPanelOpen,
    isCommandPaletteOpen,
    isSidebarCollapsed,
    isUserMenuOpen,
    kolamMenuSectionOrder,
    openDashboardFromBreadcrumb,
    openQuickSearch,
    pluginSearch,
    restoreWorkspaceTabSnapshot,
    seeAllNotifications,
    setCommandSearch,
    setIsAttentionPanelOpen,
    setIsCommandPaletteOpen,
    setIsUserMenuOpen,
    setPluginSearch,
    toggleAttentionPanel,
    toggleKolamMenuSection,
    toggleSidebar,
    toggleUserMenu,
  } = useKolamNavigationController({
    onMessage: setAuthMessage,
  });
  const workspaceTabSnapshot = React.useMemo(
    () => ({
      activeAmSurface,
      activeKolamSurface,
      activeModule,
      activeModuleRoute,
      activeNavigationItem,
      activePluginRoute,
      activeSettingsTab,
    }),
    [
      activeAmSurface,
      activeKolamSurface,
      activeModule,
      activeModuleRoute,
      activeNavigationItem,
      activePluginRoute,
      activeSettingsTab,
    ],
  );
  const {
    activeTabId,
    handleCreateTab,
    handleTabClose,
    handleTabSelect,
    tabs,
  } = useKolamWorkspaceTabsController({
    snapshot: workspaceTabSnapshot,
  });
  const restoreWorkspaceTab = React.useCallback(
    (tabSnapshot: KolamWorkspaceTabSnapshot | null) => {
      if (!tabSnapshot) {
        return;
      }

      restoreWorkspaceTabSnapshot(tabSnapshot);
      setActiveSettingsTab(tabSnapshot.activeSettingsTab ?? null);
    },
    [restoreWorkspaceTabSnapshot],
  );
  const handleWorkspaceTabSelect = React.useCallback(
    (tabId: string) => {
      restoreWorkspaceTab(handleTabSelect(tabId));
    },
    [handleTabSelect, restoreWorkspaceTab],
  );
  const handleWorkspaceTabClose = React.useCallback(
    (tabId: string) => {
      restoreWorkspaceTab(handleTabClose(tabId));
    },
    [handleTabClose, restoreWorkspaceTab],
  );
  const {
    activeCategory,
    activeType,
    addToCart,
    afterDiscount,
    canCreateDraft,
    catalogCategories,
    catalogSearch,
    checkout,
    checkoutWorkflowSteps,
    clearCheckoutCart,
    filteredCatalog,
    finalTotal,
    reconcileCheckoutWithDataset,
    replaceCheckout,
    selectCustomer,
    selectPaymentMethod,
    selectedCustomer,
    selectedPayment,
    setActiveCategory,
    setActiveType,
    setCatalogSearch,
    setDiscountType,
    subtotal,
    updateGlobalDiscount,
    updateLineDiscountAmount,
    updateLineDiscountType,
    updateLineVoucherCode,
    updateQuantity,
    updateShippingCost,
  } = useKolamCheckoutController({
    accessScope,
    dataset,
    signedIn: !!authUser,
  });
  const {cashflowPreview, isLoadingCashflowPreview} = useKolamCashflowPreview({
    activeModule,
    activeSession: dataset.activeSession,
  });

  const handleSalesGraphRangeSelect = React.useCallback(
    async (range: DashboardSalesGraphRange) => {
      setKolamDashboardRange(range);
      const nextDataset = await refreshUnifiedDataset({
        cacheOwnerId: getCacheOwnerId(authUser) ?? undefined,
        enabledAreas: accessScope,
        kolamDashboardRange: range,
        preferLiveApi: true,
      });
      reconcileCheckoutWithDataset(nextDataset);
      setAuthMessage(getUnifiedSyncMessage(nextDataset));
    },
    [
      accessScope,
      authUser,
      reconcileCheckoutWithDataset,
      refreshUnifiedDataset,
      setAuthMessage,
      setKolamDashboardRange,
    ],
  );

  const {handleSignIn, handleSignOut, refreshDataset} =
    useKolamSessionSyncController({
      authUser,
      onMessage: setAuthMessage,
      onReconcileDataset: reconcileCheckoutWithDataset,
      onRefreshUnifiedDataset: refreshUnifiedDataset,
      onSignIn: async () => {
        if (authSource === 'kolam' && deviceIdentityStatus === 'missing') {
          setAuthMessage(getKolamLoginDeviceIdentityMessage());
          return null;
        }

        const session = await signInAuth();
        if (session) {
          localFirstSyncedOwnerRef.current = getCacheOwnerId(session.user);
        }
        return session;
      },
      onSignOut: async () => {
        localFirstSyncedOwnerRef.current = null;
        await signOutAuth();
      },
    });

  React.useEffect(() => {
    const cacheOwnerId = getCacheOwnerId(authUser);

    if (!cacheOwnerId || localFirstSyncedOwnerRef.current === cacheOwnerId) {
      return;
    }

    localFirstSyncedOwnerRef.current = cacheOwnerId;
    refreshDataset(true, accessScope, kolamDashboardRange).catch(error => {
      setAuthMessage(
        error instanceof Error
          ? `Cache lokal gagal disinkronkan: ${error.message}`
          : 'Cache lokal gagal disinkronkan.',
      );
    });
  }, [
    accessScope,
    authUser,
    kolamDashboardRange,
    refreshDataset,
    setAuthMessage,
  ]);

  const {
    canCloseCashflowSession,
    canOpenCashflowSession,
    cashflowShiftName,
    handleCloseCashflow,
    handleOpenCashflow,
    isClosingCashflow,
    isOpeningCashflow,
    setCashflowShiftName,
  } = useKolamCashflowController({
    activeSession: dataset.activeSession,
    hasPosAccess: accessScope.pos,
    onMessage: setAuthMessage,
    onRefresh: () => refreshDataset(true),
    signedIn: Boolean(authUser),
  });
  const {handleCreateSaleDraft, isCreatingSale} = useKolamSaleDraftController({
    activeSession: dataset.activeSession,
    catalog: dataset.catalog,
    checkout,
    hasPosAccess: accessScope.pos,
    onMessage: setAuthMessage,
    onRefresh: () => refreshDataset(true),
    selectedCustomer,
    selectedPayment,
    signedIn: Boolean(authUser),
  });

  const {
    attentionItems,
    readinessChecks,
    readinessSummaryText,
    runtimeIdentityItems,
    runtimeIdentityMeta,
  } = useKolamRuntimeStatusController({dataset, deviceIdentityStatus});
  const {
    handleCustomerCreated,
    handleCustomerVisitConfirm,
    handleSaleUpdated,
  } = useKolamPosDatasetMutationController({
    onMessage: setAuthMessage,
    onSelectCustomer: selectCustomer,
    setDataset,
  });
  const {
    customerForm,
    handleCreateCustomer,
    isCreatingCustomer,
    setCustomerForm,
  } = useKolamCustomerController({
    hasPosAccess: accessScope.pos,
    onCustomerCreated: handleCustomerCreated,
    onMessage: setAuthMessage,
    signedIn: Boolean(authUser),
  });
  const {handleSaleStatus, updatingSaleId} = useKolamSaleStatusController({
    hasPosAccess: accessScope.pos,
    onMessage: setAuthMessage,
    onSaleUpdated: handleSaleUpdated,
    signedIn: Boolean(authUser),
  });

  const {handleRuntimeAction} = useKolamRuntimeActionController({
    accessScope,
    onCloseCashflow: handleCloseCashflow,
    onCreateSaleDraft: handleCreateSaleDraft,
    onMessage: setAuthMessage,
    onOpenCashflow: handleOpenCashflow,
    onPluginSearchChange: setPluginSearch,
    onRefreshDataset: refreshDataset,
    onSelectModule: handleModuleSelect,
  });
  const {
    handleAttentionClose,
    handleCommandPaletteClose,
    handleCommandSelect,
    handleUserMenuClose,
  } = useKolamShellInteractionController({
    onCommand: handleNavigationCommand,
    onRuntimeAction: handleRuntimeAction,
    setIsAttentionPanelOpen,
    setIsCommandPaletteOpen,
    setIsUserMenuOpen,
  });
  const handleChatControlPress = React.useCallback(
    (control: TopNavRightControl) => {
      const nextMode = getChatRailMode(control);

      if (!nextMode) {
        return;
      }

      setActiveChatRail(currentMode =>
        currentMode === nextMode ? null : nextMode,
      );
    },
    [],
  );
  const handleChatRailClose = React.useCallback(() => {
    setActiveChatRail(null);
  }, []);

  const {dashboardHeader, overlay, sidebar, topNavigation} =
    useKolamShellChromeController({
      accessScope,
      activeAmSurface,
      activeKolamSurface,
      activeModule,
      activeModuleRoute,
      activeNavigationItem,
      activePluginRoute,
      activeSettingsTab,
      attentionItems,
      collapsed: isSidebarCollapsed,
      commandSearch,
      commands: filteredCommands,
      dataset,
      displayName,
      email: authUser?.email ?? 'seed@kolam.local',
      expandedSections: expandedKolamMenuSections,
      filterMenuByAccess: Boolean(authUser),
      isAttentionOpen: isAttentionPanelOpen,
      isCommandPaletteOpen,
      isUserMenuOpen,
      onAttentionClose: handleAttentionClose,
      onAvatarPress: toggleUserMenu,
      onBreadcrumbPress: handleBreadcrumbPress,
      onBreadcrumbDashboardPress: openDashboardFromBreadcrumb,
      onChatControlPress: handleChatControlPress,
      onCommandPaletteClose: handleCommandPaletteClose,
      onCommandSearchChange: setCommandSearch,
      onCommandSelect: handleCommandSelect,
      onMessage: setAuthMessage,
      onMoveMenuSection: handleMoveKolamMenuSection,
      onModuleRouteSelect: handleModuleRouteSelect,
      onNotificationPress: toggleAttentionPanel,
      onQuickSearch: openQuickSearch,
      onRouteContext: handleDashboardRouteContext,
      onSeeAllNotifications: seeAllNotifications,
      onSelectMenuItem: handleKolamNavigationItem,
      onSelectModule: handleModuleSelect,
      onSignOut: handleSignOut,
      onToggleMenuSection: toggleKolamMenuSection,
      onToggleSidebar: toggleSidebar,
      onUserMenuClose: handleUserMenuClose,
      onUserMenuSelect: handleNavigationUserMenuAction,
      profilePhotoUrl: authUser?.profilePhotoUrl,
      roleKey: authUser?.roleKey,
      sectionOrder: kolamMenuSectionOrder,
      timezone: authUser?.timezone,
    });
  const {workspace} = useKolamWorkspaceSurfaceController({
    activeModule,
    activeAmSurface,
    activeKolamSurface,
    activeModuleRoute,
    activeNavigationItem,
    activePluginRoute,
    activeType,
    activeCategory,
    afterDiscount,
    canCloseCashflow: canCloseCashflowSession,
    canCreateDraft,
    canOpenCashflow: canOpenCashflowSession,
    cashflowPreview,
    cashflowShiftName,
    catalogCategories,
    catalogSearch,
    checkout,
    customerForm,
    dataset,
    filteredCatalog,
    filteredPlugins,
    finalTotal,
    isClosingCashflow,
    isCreatingCustomer,
    isCreatingSale,
    isLoadingCashflowPreview,
    isOpeningCashflow,
    onAddToCart: addToCart,
    onAmSurfaceSelect: handleAmSurfaceSelect,
    onCashflowShiftNameChange: setCashflowShiftName,
    onCatalogSearchChange: setCatalogSearch,
    onCategoryChange: setActiveCategory,
    onClearCart: clearCheckoutCart,
    onCloseCashflow: handleCloseCashflow,
    onCommandSelect: handleCommandSelect,
    onKolamSurfaceSelect: handleKolamSurfaceSelect,
    onCreateCustomer: handleCreateCustomer,
    onCreateSaleDraft: handleCreateSaleDraft,
    onCustomerFormChange: setCustomerForm,
    onCustomerVisitConfirm: handleCustomerVisitConfirm,
    onDashboardRouteContext: handleDashboardRouteContext,
    onMessage: setAuthMessage,
    onModuleRouteSelect: handleModuleRouteSelect,
    onPluginRouteSelect: handlePluginRouteSelect,
    onDiscountAmountChange: updateLineDiscountAmount,
    onDiscountTypeChange: updateLineDiscountType,
    onVoucherCodeChange: updateLineVoucherCode,
    onGlobalDiscountChange: updateGlobalDiscount,
    onGlobalDiscountTypeChange: setDiscountType,
    onOpenCashflow: handleOpenCashflow,
    onPluginSearchChange: setPluginSearch,
    onQuantityChange: updateQuantity,
    onReplaceCheckout: replaceCheckout,
    onSalesGraphRangeSelect: handleSalesGraphRangeSelect,
    onSelectModule: handleModuleSelect,
    onSettingsTabChange: setActiveSettingsTab,
    onSelectCustomer: selectCustomer,
    onSelectPaymentMethod: selectPaymentMethod,
    onShippingCostChange: updateShippingCost,
    onStatusChange: handleSaleStatus,
    onTypeChange: setActiveType,
    pluginSearch,
    salesGraphRange: kolamDashboardRange,
    selectedCustomer,
    selectedPayment,
    subtotal,
    syncActivity,
    updatingSaleId,
    workflowSteps: checkoutWorkflowSteps,
  });
  const {runtime} = useKolamRuntimeSurfaceController({
    accessScope,
    activeModule,
    amApiBaseUrl,
    authEmail,
    authMessage,
    authPassword,
    authSource,
    authSourceHint,
    commandSearch,
    commandTotalCount: commandIndex.length,
    commands: filteredCommands,
    coverageCommands: commandIndex,
    dataset,
    displayName,
    isLoadingDataset,
    isSigningIn,
    onCommandSelect: handleCommandSelect,
    onRuntimeAction: handleRuntimeAction,
    onSignIn: handleSignIn,
    onSignOut: handleSignOut,
    onSync: () => refreshDataset(true),
    readinessChecks,
    readinessSummaryText,
    runtimeIdentityItems,
    runtimeIdentityMeta,
    setAmApiBaseUrl,
    setAuthEmail,
    setAuthPassword,
    setAuthSource,
    setCommandSearch,
    syncActivity,
  });

  const rightRailNode = React.useMemo(
    () =>
      activeChatRail ? (
        <KolamGlobalChatRail
          mode={activeChatRail}
          onClose={handleChatRailClose}
        />
      ) : null,
    [activeChatRail, handleChatRailClose],
  );
  const workspaceTabsNode = React.useMemo(
    () => (
      <KolamWorkspaceTabStrip
        activeTabId={activeTabId}
        onCreateTab={handleCreateTab}
        onTabClose={handleWorkspaceTabClose}
        onTabSelect={handleWorkspaceTabSelect}
        tabs={tabs}
      />
    ),
    [
      activeTabId,
      handleCreateTab,
      handleWorkspaceTabClose,
      handleWorkspaceTabSelect,
      tabs,
    ],
  );

  const authValue = React.useMemo<KolamAuthContextValue>(
    () => ({
      accessScope,
      authEmail,
      authMessage,
      authPassword,
      authSource,
      authSourceHint,
      authUser,
      deviceIdentityStatus,
      displayName,
      handleSignIn,
      handleSignOut,
      isSigningIn,
      setAuthEmail,
      setAuthMessage,
      setAuthPassword,
      setAuthSource,
    }),
    [
      accessScope,
      authEmail,
      authMessage,
      authPassword,
      authSource,
      authSourceHint,
      authUser,
      deviceIdentityStatus,
      displayName,
      handleSignIn,
      handleSignOut,
      isSigningIn,
      setAuthEmail,
      setAuthMessage,
      setAuthPassword,
      setAuthSource,
    ],
  );

  const dataValue = React.useMemo<KolamDataContextValue>(
    () => ({
      amApiBaseUrl,
      dataset,
      isLoadingDataset,
      kolamDashboardRange,
      refreshDataset,
      refreshUnifiedDataset,
      setAmApiBaseUrl,
      setDataset,
      setKolamDashboardRange,
      syncActivity,
    }),
    [
      amApiBaseUrl,
      dataset,
      isLoadingDataset,
      kolamDashboardRange,
      refreshDataset,
      refreshUnifiedDataset,
      setAmApiBaseUrl,
      setDataset,
      setKolamDashboardRange,
      syncActivity,
    ],
  );

  const navigationValue = React.useMemo<KolamNavigationContextValue>(
    () => ({
      activeAmSurface,
      activeChatRail,
      activeKolamSurface,
      activeModule,
      activeModuleRoute,
      activeNavigationItem,
      activePluginRoute,
      activeSettingsTab,
      handleAmSurfaceSelect,
      handleChatRailClose,
      handleDashboardRouteContext,
      handleKolamSurfaceSelect,
      handleModuleRouteSelect,
      handleModuleSelect,
      handlePluginRouteSelect,
      setActiveSettingsTab,
      setPluginSearch,
    }),
    [
      activeAmSurface,
      activeChatRail,
      activeKolamSurface,
      activeModule,
      activeModuleRoute,
      activeNavigationItem,
      activePluginRoute,
      activeSettingsTab,
      handleAmSurfaceSelect,
      handleChatRailClose,
      handleDashboardRouteContext,
      handleKolamSurfaceSelect,
      handleModuleRouteSelect,
      handleModuleSelect,
      handlePluginRouteSelect,
      setPluginSearch,
    ],
  );

  const shellChromeValue = React.useMemo<KolamShellChromeContextValue>(
    () => ({
      dashboardHeader,
      overlay,
      rightRail: rightRailNode,
      sidebar,
      topNavigation,
      workspaceTabs: workspaceTabsNode,
    }),
    [
      dashboardHeader,
      overlay,
      rightRailNode,
      sidebar,
      topNavigation,
      workspaceTabsNode,
    ],
  );

  const workspaceViewValue = React.useMemo<KolamWorkspaceViewContextValue>(
    () => ({
      runtime,
      workspace,
    }),
    [runtime, workspace],
  );
  const workspaceTabsValue = React.useMemo<KolamWorkspaceTabsContextValue>(
    () => ({
      activeTabId,
      tabs,
    }),
    [activeTabId, tabs],
  );

  return (
    <KolamAuthContext.Provider value={authValue}>
      <KolamDataContext.Provider value={dataValue}>
        <KolamNavigationContext.Provider value={navigationValue}>
          <KolamShellChromeContext.Provider value={shellChromeValue}>
            <KolamWorkspaceTabsContext.Provider value={workspaceTabsValue}>
              <KolamWorkspaceViewContext.Provider value={workspaceViewValue}>
                {children}
              </KolamWorkspaceViewContext.Provider>
            </KolamWorkspaceTabsContext.Provider>
          </KolamShellChromeContext.Provider>
        </KolamNavigationContext.Provider>
      </KolamDataContext.Provider>
    </KolamAuthContext.Provider>
  );
}

function getKolamLoginDeviceIdentityMessage(): string {
  return 'Login Kolam belum dikirim: native runtime belum membaca MAC address perangkat.';
}

function getCacheOwnerId(user: {id?: string; email?: string} | null) {
  return user?.id ?? user?.email ?? null;
}

function getChatRailMode(
  control: TopNavRightControl,
): KolamGlobalChatRailMode | null {
  if (control.id === 'chat-inbox') {
    return 'inbox';
  }

  if (control.id === 'chat-team') {
    return 'team-chat';
  }

  return null;
}
