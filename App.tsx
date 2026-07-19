import React from 'react';
import { KolamAppShellSurface } from './src/components/kolam-app-shell-surface';
import { KolamLoginScreen } from './src/components/kolam-login-screen';
import { KolamWorkspaceSurface } from './src/components/kolam-workspace-surface';
import type { DashboardSalesGraphRange } from './src/domain/dashboard-sales-graph';
import { getUnifiedSyncMessage } from './src/services/unified-data';
import { useKolamAuthController } from './src/hooks/use-kolam-auth-controller';
import { useKolamCashflowController } from './src/hooks/use-kolam-cashflow-controller';
import { useKolamCashflowPreview } from './src/hooks/use-kolam-cashflow-preview';
import { useKolamCheckoutController } from './src/hooks/use-kolam-checkout-controller';
import { useKolamCustomerController } from './src/hooks/use-kolam-customer-controller';
import { useKolamNavigationController } from './src/hooks/use-kolam-navigation-controller';
import { useKolamNativeDeviceIdentity } from './src/hooks/use-kolam-native-device-identity';
import { useKolamPosDatasetMutationController } from './src/hooks/use-kolam-pos-dataset-mutation-controller';
import { useKolamRuntimeActionController } from './src/hooks/use-kolam-runtime-action-controller';
import { useKolamRuntimeSurfaceController } from './src/hooks/use-kolam-runtime-surface-controller';
import { useKolamRuntimeStatusController } from './src/hooks/use-kolam-runtime-status-controller';
import { useKolamSaleDraftController } from './src/hooks/use-kolam-sale-draft-controller';
import { useKolamSaleStatusController } from './src/hooks/use-kolam-sale-status-controller';
import { useKolamServerMetricsController } from './src/hooks/use-kolam-server-metrics-controller';
import { useKolamSessionSyncController } from './src/hooks/use-kolam-session-sync-controller';
import { useKolamShellChromeController } from './src/hooks/use-kolam-shell-chrome-controller';
import { useKolamShellInteractionController } from './src/hooks/use-kolam-shell-interaction-controller';
import { useKolamUnifiedDataController } from './src/hooks/use-kolam-unified-data-controller';
import { useKolamWorkspaceSurfaceController } from './src/hooks/use-kolam-workspace-surface-controller';

function App() {
  const localFirstSyncedOwnerRef = React.useRef<string | null>(null);
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
  const {
    activeType,
    addToCart,
    afterDiscount,
    canCreateDraft,
    catalogSearch,
    checkout,
    checkoutWorkflowSteps,
    clearCheckoutCart,
    filteredCatalog,
    finalTotal,
    reconcileCheckoutWithDataset,
    selectCustomer,
    selectPaymentMethod,
    selectedCustomer,
    selectedPayment,
    setActiveType,
    setCatalogSearch,
    setDiscountType,
    subtotal,
    updateGlobalDiscount,
    updateLineDiscountAmount,
    updateLineDiscountType,
    updateQuantity,
    updateShippingCost,
  } = useKolamCheckoutController({
    accessScope,
    dataset,
    signedIn: !!authUser,
  });
  const { cashflowPreview, isLoadingCashflowPreview } = useKolamCashflowPreview(
    {
      activeModule,
      activeSession: dataset.activeSession,
    },
  );

  const handleSalesGraphRangeSelect = async (
    range: DashboardSalesGraphRange,
  ) => {
    setKolamDashboardRange(range);
    const nextDataset = await refreshUnifiedDataset({
      cacheOwnerId: getCacheOwnerId(authUser) ?? undefined,
      enabledAreas: accessScope,
      kolamDashboardRange: range,
      preferLiveApi: true,
    });
    reconcileCheckoutWithDataset(nextDataset);
    setAuthMessage(getUnifiedSyncMessage(nextDataset));
  };

  const { handleSignIn, handleSignOut, refreshDataset } =
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
  const { handleCreateSaleDraft, isCreatingSale } = useKolamSaleDraftController(
    {
      activeSession: dataset.activeSession,
      catalog: dataset.catalog,
      checkout,
      hasPosAccess: accessScope.pos,
      onMessage: setAuthMessage,
      onRefresh: () => refreshDataset(true),
      selectedCustomer,
      selectedPayment,
      signedIn: Boolean(authUser),
    },
  );

  const {
    attentionItems,
    readinessChecks,
    readinessSummaryText,
    runtimeIdentityItems,
    runtimeIdentityMeta,
  } = useKolamRuntimeStatusController({ dataset, deviceIdentityStatus });
  const serverMetrics = useKolamServerMetricsController({
    enabled: Boolean(authUser),
  });
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
  const { handleSaleStatus, updatingSaleId } = useKolamSaleStatusController({
    hasPosAccess: accessScope.pos,
    onMessage: setAuthMessage,
    onSaleUpdated: handleSaleUpdated,
    signedIn: Boolean(authUser),
  });

  const { handleRuntimeAction } = useKolamRuntimeActionController({
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

  const { dashboardHeader, overlay, sidebar, topNavigation } =
    useKolamShellChromeController({
      accessScope,
      activeAmSurface,
      activeKolamSurface,
      activeModule,
      activeModuleRoute,
      activeNavigationItem,
      activePluginRoute,
      activeSession: dataset.activeSession,
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
      onCommandPaletteClose: handleCommandPaletteClose,
      onCommandSearchChange: setCommandSearch,
      onCommandSelect: handleCommandSelect,
      onMessage: setAuthMessage,
      onMoveMenuSection: handleMoveKolamMenuSection,
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
      serverMetrics,
      timezone: authUser?.timezone,
    });
  const { workspace } = useKolamWorkspaceSurfaceController({
    activeModule,
    activeAmSurface,
    activeKolamSurface,
    activeModuleRoute,
    activeNavigationItem,
    activePluginRoute,
    activeType,
    afterDiscount,
    canCloseCashflow: canCloseCashflowSession,
    canCreateDraft,
    canOpenCashflow: canOpenCashflowSession,
    cashflowPreview,
    cashflowShiftName,
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
    onGlobalDiscountChange: updateGlobalDiscount,
    onGlobalDiscountTypeChange: setDiscountType,
    onOpenCashflow: handleOpenCashflow,
    onPluginSearchChange: setPluginSearch,
    onQuantityChange: updateQuantity,
    onSalesGraphRangeSelect: handleSalesGraphRangeSelect,
    onSelectModule: handleModuleSelect,
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
  const { runtime } = useKolamRuntimeSurfaceController({
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

  if (!authUser) {
    return (
      <KolamLoginScreen
        auth={runtime.auth}
        deviceIdentityStatus={deviceIdentityStatus}
        syncStatus={runtime.syncStatus}
      />
    );
  }

  return (
    <KolamAppShellSurface
      sidebar={sidebar}
      topNavigation={topNavigation}
      overlay={overlay}
      dashboardHeader={dashboardHeader}
    >
      <KolamWorkspaceSurface {...workspace} runtime={runtime} />
    </KolamAppShellSurface>
  );
}

function getKolamLoginDeviceIdentityMessage(): string {
  return 'Login Kolam belum dikirim: native runtime belum membaca MAC address perangkat.';
}

function getCacheOwnerId(user: { id?: string; email?: string } | null) {
  return user?.id ?? user?.email ?? null;
}

export default App;
