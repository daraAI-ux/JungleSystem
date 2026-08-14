import React from 'react';
import {
  KolamGlobalChatRail,
  type KolamGlobalChatRailMode,
} from '../components/kolam-global-chat-rail';
import {KolamWorkspaceTabStrip} from '../components/kolam-workspace-tab-strip';
import type {AttentionPanelItem} from '../domain/attention-panel';
import type {DashboardSalesGraphRange} from '../domain/dashboard-sales-graph';
import type {TopNavRightControl} from '../domain/top-nav';
import type {KolamWorkspaceTabSnapshot} from '../domain/kolam-workspace-tabs';
import {getAccessScope} from '../domain/auth';
import {
  DEFAULT_SETTINGS_TAB_ID,
  getSettingsTabItemById,
  type SettingsTabItem,
} from '../domain/settings-surface';
import {getUnifiedSyncMessage} from '../services/unified-data';
import {useKolamAuthController} from '../hooks/use-kolam-auth-controller';
import {useKolamCashflowController} from '../hooks/use-kolam-cashflow-controller';
import {useKolamCashflowPreview} from '../hooks/use-kolam-cashflow-preview';
import {useKolamChatNotificationHost} from '../hooks/use-kolam-chat-notification-host';
import {useKolamWindowsToastActivation} from '../hooks/use-kolam-windows-toast-activation';
import {useKolamCheckoutController} from '../hooks/use-kolam-checkout-controller';
import {useKolamCustomerController} from '../hooks/use-kolam-customer-controller';
import {useKolamNavigationController} from '../hooks/use-kolam-navigation-controller';
import {useKolamNativeDeviceIdentity} from '../hooks/use-kolam-native-device-identity';
import {useKolamNotificationCenterController} from '../hooks/use-kolam-notification-center-controller';
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
  const [chatRailInitialSelectedId, setChatRailInitialSelectedId] =
    React.useState<string | null>(null);
  const [activeSettingsTab, setActiveSettingsTab] =
    React.useState<SettingsTabItem | null>(
      getSettingsTabItemById(DEFAULT_SETTINGS_TAB_ID),
    );
  const deviceIdentityStatus = useKolamNativeDeviceIdentity();
  const {
    accessScope,
    authEmail,
    authLoginMode,
    authMessage,
    authOtpCode,
    authOtpConfig,
    authOtpStep,
    authPassword,
    authSource,
    authSourceHint,
    authUser,
    displayName,
    handleRequestOtp,
    handleSignIn: signInAuth,
    handleSignOut: signOutAuth,
    handleVerifyOtp: verifyOtpAuth,
    isRequestingOtp,
    isSigningIn,
    setAuthEmail,
    setAuthLoginMode,
    setAuthMessage,
    setAuthOtpCode,
    setAuthOtpStep,
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
    handleDashboardRouteContext: handleNavigationDashboardRouteContext,
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
    accessScope,
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

  const handleVerifyOtp = React.useCallback(async () => {
    if (authSource === 'kolam' && deviceIdentityStatus === 'missing') {
      setAuthMessage(getKolamLoginDeviceIdentityMessage());
      return;
    }

    const session = await verifyOtpAuth();
    if (!session) {
      return;
    }

    localFirstSyncedOwnerRef.current = getCacheOwnerId(session.user);
    try {
      const nextDataset = await refreshUnifiedDataset({
        cacheOwnerId: getCacheOwnerId(session.user) ?? undefined,
        preferLiveApi: true,
        enabledAreas: getAccessScope(session.user),
      });
      reconcileCheckoutWithDataset(nextDataset);
      setAuthMessage(getUnifiedSyncMessage(nextDataset));
    } catch (error) {
      setAuthMessage(
        error instanceof Error
          ? `Login berhasil, tetapi sinkronisasi data gagal: ${error.message}`
          : 'Login berhasil, tetapi sinkronisasi data gagal.',
      );
    }
  }, [
    authSource,
    deviceIdentityStatus,
    reconcileCheckoutWithDataset,
    refreshUnifiedDataset,
    setAuthMessage,
    verifyOtpAuth,
  ]);

  const handleHeaderRefresh = React.useCallback(() => {
    void refreshDataset(true, accessScope, kolamDashboardRange);
  }, [accessScope, kolamDashboardRange, refreshDataset]);

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

      setChatRailInitialSelectedId(null);
      setActiveChatRail(currentMode =>
        currentMode === nextMode ? null : nextMode,
      );
    },
    [],
  );
  const handleChatRailClose = React.useCallback(() => {
    setChatRailInitialSelectedId(null);
    setActiveChatRail(null);
  }, []);
  const openInboxChatRail = React.useCallback((conversationId?: string) => {
    const id = String(conversationId || '').trim();
    setChatRailInitialSelectedId(id || null);
    setActiveChatRail('inbox');
  }, []);
  const handleDashboardRouteContext = React.useCallback(
    (route: string) => {
      const teamChatRoomId = getTeamChatRoomIdFromRoute(route);

      if (teamChatRoomId !== undefined) {
        setChatRailInitialSelectedId(teamChatRoomId);
        setActiveChatRail('team-chat');
        return;
      }

      handleNavigationDashboardRouteContext(route);
    },
    [handleNavigationDashboardRouteContext],
  );
  const {unreadCounts: chatUnreadCounts} = useKolamChatNotificationHost({
    currentUserId:
      authUser?.id != null && String(authUser.id).trim()
        ? String(authUser.id)
        : null,
    enabled: Boolean(authUser),
    visibleRailMode: activeChatRail,
  });
  const handleToastActivation = React.useCallback(
    (activation: {stream: 'inbox' | 'team-chat'; targetId: string}) => {
      const targetId = String(activation.targetId || '').trim();
      const hasThread =
        targetId &&
        targetId !== 'unread-inbox' &&
        targetId !== 'unread-team';

      if (activation.stream === 'team-chat') {
        setChatRailInitialSelectedId(hasThread ? targetId : null);
        setActiveChatRail('team-chat');
        return;
      }

      openInboxChatRail(hasThread ? targetId : undefined);
    },
    [openInboxChatRail],
  );
  useKolamWindowsToastActivation({
    enabled: Boolean(authUser),
    onActivate: handleToastActivation,
  });
  const notificationCenter = useKolamNotificationCenterController({
    enabled: Boolean(authUser),
    limit: 10,
    playSoundOnNewUnread: true,
  });
  const {
    attentionItems,
    markAsRead: markNotificationAsRead,
    unreadCount: notificationUnreadCount,
  } = notificationCenter;
  const handleAttentionItemPress = React.useCallback(
    (item: AttentionPanelItem) => {
      if (!item.routeHint) {
        return;
      }

      setIsAttentionPanelOpen(false);
      const route = item.routeHint;
      Promise.resolve(
        item.notification ? markNotificationAsRead(item.notification) : undefined,
      )
        .catch(error => {
          setAuthMessage(
            error instanceof Error
              ? error.message
              : 'Gagal memproses notifikasi.',
          );
        })
        .finally(() => {
          handleDashboardRouteContext(route);
        });
    },
    [
      handleDashboardRouteContext,
      markNotificationAsRead,
      setAuthMessage,
      setIsAttentionPanelOpen,
    ],
  );

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
      chatUnreadCounts,
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
      onAttentionItemPress: handleAttentionItemPress,
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
      onRefreshDataset: handleHeaderRefresh,
      refreshLoading: isLoadingDataset,
      notificationUnreadCount,
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
    authLoginMode,
    authOtpCode,
    authOtpConfig,
    authOtpStep,
    commandSearch,
    commandTotalCount: commandIndex.length,
    commands: filteredCommands,
    coverageCommands: commandIndex,
    dataset,
    displayName,
    isLoadingDataset,
    isSigningIn,
    isRequestingOtp,
    onCommandSelect: handleCommandSelect,
    onRuntimeAction: handleRuntimeAction,
    onSignIn: handleSignIn,
    onRequestOtp: handleRequestOtp,
    onVerifyOtp: handleVerifyOtp,
    onSignOut: handleSignOut,
    onSync: () => refreshDataset(true),
    readinessChecks,
    readinessSummaryText,
    runtimeIdentityItems,
    runtimeIdentityMeta,
    setAmApiBaseUrl,
    setAuthEmail,
    setAuthLoginMode,
    setAuthOtpCode,
    setAuthOtpStep,
    setAuthPassword,
    setAuthSource,
    setCommandSearch,
    syncActivity,
  });

  const rightRailNode = React.useMemo(
    () =>
      activeChatRail ? (
        <KolamGlobalChatRail
          initialSelectedId={chatRailInitialSelectedId}
          mode={activeChatRail}
          onClose={handleChatRailClose}
        />
      ) : null,
    [activeChatRail, chatRailInitialSelectedId, handleChatRailClose],
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
      authLoginMode,
      authMessage,
      authOtpCode,
      authOtpConfig,
      authOtpStep,
      authPassword,
      authSource,
      authSourceHint,
      authUser,
      deviceIdentityStatus,
      displayName,
      handleRequestOtp,
      handleSignIn,
      handleSignOut,
      handleVerifyOtp,
      isRequestingOtp,
      isSigningIn,
      setAuthEmail,
      setAuthLoginMode,
      setAuthMessage,
      setAuthOtpCode,
      setAuthOtpStep,
      setAuthPassword,
      setAuthSource,
    }),
    [
      accessScope,
      authEmail,
      authLoginMode,
      authMessage,
      authOtpCode,
      authOtpConfig,
      authOtpStep,
      authPassword,
      authSource,
      authSourceHint,
      authUser,
      deviceIdentityStatus,
      displayName,
      handleRequestOtp,
      handleSignIn,
      handleSignOut,
      handleVerifyOtp,
      isRequestingOtp,
      isSigningIn,
      setAuthEmail,
      setAuthLoginMode,
      setAuthMessage,
      setAuthOtpCode,
      setAuthOtpStep,
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
      openInboxChatRail,
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
      openInboxChatRail,
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

function getTeamChatRoomIdFromRoute(route: string): string | null | undefined {
  const trimmed = route.trim();
  if (!trimmed) {
    return undefined;
  }

  const [path, query = ''] = trimmed.split('?');
  if (path.replace(/\/+$/, '') !== '/team-chat') {
    return undefined;
  }

  const params = new URLSearchParams(query);
  const roomId = params.get('room')?.trim();
  return roomId || null;
}
