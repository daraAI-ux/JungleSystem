import React, {useCallback, useEffect} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useKolamAuthContext} from '../context/kolam-app-contexts';
import {
  KOLAM_DARA_MARKET_INTEL_JOBS_HREF,
  KOLAM_DARA_MARKET_INTEL_ROOT,
  KOLAM_DARA_MARKET_INTEL_TABS,
  buildKolamDaraMarketIntelRoute,
  getKolamDaraMarketIntelTab,
  resolveKolamDaraMarketIntelAccess,
  type KolamDaraMarketIntelTabId,
} from '../domain/kolam-dara-market-intel';
import {
  formatKolamDaraJobProgressLabel,
  getKolamDaraJobProgressPercent,
  type KolamDaraAsyncJob,
} from '../domain/kolam-pusat-ai-jobs';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {useKolamDaraMarketIntelApprovalsController} from '../hooks/use-kolam-dara-market-intel-approvals-controller';
import {useKolamDaraMarketIntelCompetitorsController} from '../hooks/use-kolam-dara-market-intel-competitors-controller';
import {useKolamDaraMarketIntelDashboardController} from '../hooks/use-kolam-dara-market-intel-dashboard-controller';
import {useKolamDaraMarketIntelJobsProgress} from '../hooks/use-kolam-dara-market-intel-jobs-progress';
import {useKolamDaraMarketIntelStoreHealthController} from '../hooks/use-kolam-dara-market-intel-store-health-controller';
import {useKolamDaraMarketPlatformFeeController} from '../hooks/use-kolam-dara-market-platform-fee-controller';
import {useKolamDaraPricingEquipmentController} from '../hooks/use-kolam-dara-pricing-equipment-controller';
import {KolamDaraMarketIntelApprovalsBody} from './kolam-dara-market-intel-approvals-body';
import {KolamDaraMarketIntelCompetitorsBody} from './kolam-dara-market-intel-competitors-body';
import {KolamDaraMarketIntelDashboardBody} from './kolam-dara-market-intel-dashboard-body';
import {KolamDaraMarketIntelPeralatanBody} from './kolam-dara-market-intel-peralatan-body';
import {KolamDaraMarketIntelStoreHealthBody} from './kolam-dara-market-intel-store-health-body';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamSurfacePanelTabs} from './kolam-surface-panel-tabs';

export function KolamDaraMarketIntelSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const selectedTab = getKolamDaraMarketIntelTab(route);
  const {authUser} = useKolamAuthContext();
  const access = resolveKolamDaraMarketIntelAccess({
    roleKey: authUser?.roleKey,
    permissions: authUser?.permissions,
    isOwner: (authUser as {isOwner?: boolean} | null | undefined)?.isOwner,
  });
  const dashboardController = useKolamDaraMarketIntelDashboardController(
    access.canSee ? route : '',
  );
  const approvalsController = useKolamDaraMarketIntelApprovalsController(
    access.canSee ? route : '',
    access.canViewMargin,
  );
  const competitorsController = useKolamDaraMarketIntelCompetitorsController(
    access.canSee ? route : '',
  );
  const storeHealthController = useKolamDaraMarketIntelStoreHealthController(
    access.canSee ? route : '',
  );
  const platformFeeController = useKolamDaraMarketPlatformFeeController(
    access.canSee && access.canDraft ? route : '',
  );
  const bulkPricingController = useKolamDaraPricingEquipmentController(
    access.canSee && access.canDraft ? route : '',
  );
  const onMarketJobSettled = useCallback(() => {
    // FE `dara-jobs-updated` → dashboard reload (no-op off dashboard tab).
    void dashboardController.onRefresh();
  }, [dashboardController.onRefresh]);
  const jobsProgress = useKolamDaraMarketIntelJobsProgress(
    access.canSee ? route : '',
    {onJobSettled: onMarketJobSettled},
  );

  useEffect(() => {
    const query = route.includes('?') ? route.split('?')[1] ?? '' : '';
    const params = new URLSearchParams(query);
    if (
      params.get('tab') === 'kesehatan' &&
      !route.includes('/kesehatan')
    ) {
      onRouteChange?.(`${KOLAM_DARA_MARKET_INTEL_ROOT}/kesehatan`);
    }
  }, [onRouteChange, route]);

  if (!access.canSee) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState title="Akses ditolak" message="ai-market-intel" />
      </View>
    );
  }

  return (
    <View style={styles.surface}>
      <View style={styles.tabBar}>
        <KolamSurfacePanelTabs
          onSelectTab={(tabId: KolamDaraMarketIntelTabId) => {
            onRouteChange?.(buildKolamDaraMarketIntelRoute(tabId));
          }}
          selectedTabId={selectedTab}
          tabs={KOLAM_DARA_MARKET_INTEL_TABS.map(tab => ({
            id: tab.id,
            label: tab.label,
          }))}
        />
      </View>

      <KolamDaraMarketIntelJobsProgressStrip
        jobs={jobsProgress.activeJobs}
        onOpenJobs={() => onRouteChange?.(KOLAM_DARA_MARKET_INTEL_JOBS_HREF)}
      />
      {jobsProgress.notice ? (
        <Text style={styles.notice}>{jobsProgress.notice}</Text>
      ) : null}

      {selectedTab === 'dashboard' ? (
        <KolamDaraMarketIntelDashboardBody
          canDraft={access.canDraft}
          canViewMargin={access.canViewMargin}
          controller={dashboardController}
          jobsProgress={jobsProgress}
          onRouteChange={onRouteChange}
        />
      ) : selectedTab === 'approvals' ? (
        <KolamDaraMarketIntelApprovalsBody
          canApprove={access.canApprove}
          canViewMargin={access.canViewMargin}
          controller={approvalsController}
        />
      ) : selectedTab === 'competitors' ? (
        <KolamDaraMarketIntelCompetitorsBody
          canDraft={access.canDraft}
          controller={competitorsController}
        />
      ) : selectedTab === 'kesehatan' ? (
        <KolamDaraMarketIntelStoreHealthBody
          controller={storeHealthController}
          onRouteChange={onRouteChange}
        />
      ) : selectedTab === 'peralatan' ? (
        <KolamDaraMarketIntelPeralatanBody
          bulkPricingController={bulkPricingController}
          canDraft={access.canDraft}
          platformFeeController={platformFeeController}
        />
      ) : (
        <KolamDaraMarketIntelPlaceholderTab tabId={selectedTab} />
      )}
    </View>
  );
}

function KolamDaraMarketIntelJobsProgressStrip({
  jobs,
  onOpenJobs,
}: {
  jobs: KolamDaraAsyncJob[];
  onOpenJobs?: () => void;
}) {
  if (!jobs.length) {
    return null;
  }

  return (
    <View style={styles.jobsStrip}>
      {jobs.map(job => {
        const percent = getKolamDaraJobProgressPercent(job);
        return (
          <Pressable
            accessibilityRole="button"
            key={job.id}
            onPress={onOpenJobs}
            style={styles.jobPanel}>
            <View style={styles.jobHead}>
              <View style={styles.jobHeadText}>
                <Text style={styles.jobTitle}>{job.label}</Text>
                <Text style={styles.jobMeta}>
                  {formatMarketJobStatusLabel(job.status)}
                  {job.progressMessage ? ` · ${job.progressMessage}` : ''}
                  {job.progressTotal > 0
                    ? ` · ${formatKolamDaraJobProgressLabel(job)}`
                    : ''}
                </Text>
              </View>
              <Text style={styles.jobPct}>{`${percent}%`}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, {width: `${percent}%`}]} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function formatMarketJobStatusLabel(status: string) {
  if (status === 'queued') {
    return 'Antrian';
  }
  if (status === 'running') {
    return 'Berjalan';
  }
  if (status === 'completed') {
    return 'Selesai';
  }
  if (status === 'failed') {
    return 'Gagal';
  }
  return status;
}

function KolamDaraMarketIntelPlaceholderTab({
  tabId,
}: {
  tabId: KolamDaraMarketIntelTabId;
}) {
  const label =
    KOLAM_DARA_MARKET_INTEL_TABS.find(tab => tab.id === tabId)?.label ??
    'Intel Pasar';

  return (
    <View style={styles.body}>
      <KolamEmptyState title="Belum tersedia" message={label} />
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 12,
  },
  tabBar: {
    flexShrink: 0,
  },
  body: {
    flex: 1,
  },
  jobsStrip: {
    gap: 8,
  },
  jobPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  jobHead: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  jobHeadText: {
    flex: 1,
    gap: 2,
  },
  jobTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  jobMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  jobPct: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  progressTrack: {
    backgroundColor: V.colors.muted,
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: V.colors.primary,
    borderRadius: 999,
    height: 8,
  },
  notice: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
});
