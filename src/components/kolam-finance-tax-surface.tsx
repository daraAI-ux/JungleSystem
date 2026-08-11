import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useKolamAuthContext} from '../context/kolam-app-contexts';
import {
  buildKolamDaraTaxRoute,
  getKolamDaraTaxTab,
  KOLAM_DARA_TAX_PERIOD_OPTIONS,
  KOLAM_DARA_TAX_TABS,
  resolveKolamDaraTaxAccess,
  type KolamDaraTaxPeriod,
  type KolamDaraTaxTabId,
} from '../domain/kolam-finance-tax';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {useKolamFinanceTaxController} from '../hooks/use-kolam-finance-tax-controller';
import {KolamDetailScrollSurface} from './kolam-detail-scroll-surface';
import {KolamDaraTaxLaporanBody} from './kolam-dara-tax-laporan-body';
import {KolamDaraTaxOperasionalBody} from './kolam-dara-tax-operasional-body';
import {KolamDaraTaxRegulasiBody} from './kolam-dara-tax-regulasi-body';
import {KolamDaraTaxRingkasanBody} from './kolam-dara-tax-ringkasan-body';
import {KolamDaraTaxSetoranBody} from './kolam-dara-tax-setoran-body';
import {KolamDropdownSelect} from './kolam-dropdown-select';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamSurfacePanelTabs} from './kolam-surface-panel-tabs';
import {kolamTableToolbarStyles} from './kolam-table-toolbar-styles';

/** FE `DaraTaxDashboardPage` + `TaxIntelligenceDashboard` shell (Batch 0). */
export function KolamFinanceTaxSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamFinanceTaxController(route);
  const {authUser} = useKolamAuthContext();
  const access = resolveKolamDaraTaxAccess({
    roleKey: authUser?.roleKey,
    permissions: authUser?.permissions,
    isOwner: (authUser as {isOwner?: boolean} | null | undefined)?.isOwner,
  });

  if (!access.canSee) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState title="Akses ditolak" message="tax" />
      </View>
    );
  }

  const selectedTab = getKolamDaraTaxTab(route);
  const selectedTabLabel =
    KOLAM_DARA_TAX_TABS.find(tab => tab.id === selectedTab)?.label ??
    'Ringkasan';

  return (
    <View style={styles.surface}>
      <View style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              <KolamDropdownSelect
                accessibilityLabel="Periode"
                label="Periode"
                onChange={value =>
                  controller.onSetPeriod(value as KolamDaraTaxPeriod)
                }
                options={KOLAM_DARA_TAX_PERIOD_OPTIONS.map(opt => ({
                  label: opt.label,
                  value: opt.id,
                }))}
                showLabelInTrigger={false}
                value={controller.period}
              />
            </View>
          </View>
        </View>
      </View>

      {!controller.taxEnabled ? (
        <View style={styles.disabledBanner}>
          <Text style={styles.disabledBannerText}>
            DARA Pajak nonaktif. Aktifkan di Pengaturan → Alat AI.
          </Text>
        </View>
      ) : null}

      <KolamDetailScrollSurface
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}>
        <KolamSurfacePanelTabs
          onSelectTab={(tabId: KolamDaraTaxTabId) => {
            onRouteChange?.(buildKolamDaraTaxRoute(tabId));
          }}
          selectedTabId={selectedTab}
          tabs={KOLAM_DARA_TAX_TABS.map(tab => ({
            id: tab.id,
            label: tab.label,
          }))}
        />
        {selectedTab === 'ringkasan' ? (
          <KolamDaraTaxRingkasanBody
            dashboard={controller.dashboard}
            error={controller.error}
            loading={controller.loading}
            profile={controller.profile}
            series={controller.series}
          />
        ) : selectedTab === 'operasional' ? (
          <KolamDaraTaxOperasionalBody
            allocation={controller.allocation}
            journal={controller.journal}
            loading={controller.opsLoading}
            onRouteChange={onRouteChange}
            period={controller.period}
            sptPreview={controller.sptPreview}
            taxEnabled={controller.taxEnabled}
          />
        ) : selectedTab === 'regulasi' ? (
          <KolamDaraTaxRegulasiBody
            canApprove={access.canApprove}
            isAdmin={access.isAdmin}
            monitoringLoading={controller.monitoringLoading}
            notice={controller.notice}
            onNotice={controller.onSetNotice}
            onRefreshMonitoring={() => {
              void controller.onRefreshMonitoring();
            }}
            onRunWatcher={() => {
              void controller.onRunWatcher();
            }}
            pendingDraftCount={
              controller.dashboard?.pendingRegulationDraftCount ?? 0
            }
            taxEnabled={controller.taxEnabled}
            taxStatus={controller.taxStatus}
            versions={controller.regulationVersions}
            watcherRunning={controller.watcherRunning}
          />
        ) : selectedTab === 'laporan' ? (
          <KolamDaraTaxLaporanBody
            canDraft={access.canDraft}
            dashboard={controller.dashboard}
            loading={controller.loading}
            onRefresh={controller.onRefresh}
            period={controller.period}
            taxEnabled={controller.taxEnabled}
          />
        ) : selectedTab === 'pelunasan' ? (
          <KolamDaraTaxSetoranBody />
        ) : (
          <View style={styles.stubCard}>
            <Text style={styles.stubTitle}>{selectedTabLabel}</Text>
          </View>
        )}
      </KolamDetailScrollSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 10,
    minHeight: 0,
  },
  toolbarWrap: {
    elevation: 1000,
    flexShrink: 0,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
  },
  disabledBanner: {
    backgroundColor: '#fffbeb',
    borderColor: '#fcd34d',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  disabledBannerText: {
    color: '#92400e',
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 18,
  },
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 24,
  },
  stubCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 12,
  },
  stubTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
});
