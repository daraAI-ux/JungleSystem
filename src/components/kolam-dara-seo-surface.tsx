import React, {useMemo, useRef, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useKolamAuthContext} from '../context/kolam-app-contexts';
import {
  KOLAM_DARA_SEO_JOBS_HREF,
  KOLAM_DARA_SEO_TABS,
  buildKolamDaraSeoRoute,
  formatKolamDaraSeoScoreStatus,
  formatKolamDaraSeoSentimentStatus,
  getKolamDaraSeoTab,
  resolveKolamDaraSeoAccess,
  resolveKolamDaraSeoScoreTone,
  resolveKolamDaraSeoSentimentTone,
  type KolamDaraSeoTabId,
} from '../domain/kolam-dara-seo';
import {
  formatKolamDaraJobProgressLabel,
  getKolamDaraJobProgressPercent,
  type KolamDaraAsyncJob,
} from '../domain/kolam-pusat-ai-jobs';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {useKolamDaraSeoApprovalsController} from '../hooks/use-kolam-dara-seo-approvals-controller';
import {
  useKolamDaraSeoController,
  type KolamDaraSeoController,
} from '../hooks/use-kolam-dara-seo-controller';
import {useKolamDaraSeoAuditLogsController} from '../hooks/use-kolam-dara-seo-audit-logs-controller';
import {useKolamDaraSeoIntegrationsController} from '../hooks/use-kolam-dara-seo-integrations-controller';
import {
  useKolamDaraSeoJobsProgress,
  type KolamDaraSeoJobsProgressController,
} from '../hooks/use-kolam-dara-seo-jobs-progress';
import {useKolamDaraSeoKeywordsController} from '../hooks/use-kolam-dara-seo-keywords-controller';
import {useKolamDaraSeoMentionsController} from '../hooks/use-kolam-dara-seo-mentions-controller';
import {useKolamDaraSeoRankingsController} from '../hooks/use-kolam-dara-seo-rankings-controller';
import {useKolamDaraSeoSentimentController} from '../hooks/use-kolam-dara-seo-sentiment-controller';
import {useKolamDaraSeoSocialController} from '../hooks/use-kolam-dara-seo-social-controller';
import {useKolamDaraSeoWebsiteController} from '../hooks/use-kolam-dara-seo-website-controller';
import {KolamButton} from './kolam-button';
import {KolamDaraSeoApprovalsBody} from './kolam-dara-seo-approvals-body';
import {KolamDaraSeoAuditLogsBody} from './kolam-dara-seo-audit-logs-body';
import {KolamDaraSeoCircularKpi} from './kolam-dara-seo-circular-kpi';
import {KolamDaraSeoIntegrationsBody} from './kolam-dara-seo-integrations-body';
import {KolamDaraSeoKeywordsBody} from './kolam-dara-seo-keywords-body';
import {KolamDaraSeoMentionsBody} from './kolam-dara-seo-mentions-body';
import {KolamDaraSeoRankingsBody} from './kolam-dara-seo-rankings-body';
import {KolamDaraSeoSentimentBody} from './kolam-dara-seo-sentiment-body';
import {KolamDaraSeoSocialBody} from './kolam-dara-seo-social-body';
import {KolamDaraSeoWebsiteBody} from './kolam-dara-seo-website-body';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamSurfacePanelTabs} from './kolam-surface-panel-tabs';
import {KolamTableFilterTrigger} from './kolam-table-filter-trigger';
import {kolamTableToolbarStyles} from './kolam-table-toolbar-styles';

export function KolamDaraSeoSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const selectedTab = getKolamDaraSeoTab(route);
  const {authUser} = useKolamAuthContext();
  const access = resolveKolamDaraSeoAccess({
    roleKey: authUser?.roleKey,
    permissions: authUser?.permissions,
    isOwner: (authUser as {isOwner?: boolean} | null | undefined)?.isOwner,
  });
  const controller = useKolamDaraSeoController(route);
  const approvalsController = useKolamDaraSeoApprovalsController(route);
  const rankingsController = useKolamDaraSeoRankingsController(route);
  const keywordsController = useKolamDaraSeoKeywordsController(route);
  const mentionsController = useKolamDaraSeoMentionsController(route);
  const websiteController = useKolamDaraSeoWebsiteController(route);
  const sentimentController = useKolamDaraSeoSentimentController(route);
  const auditLogsController = useKolamDaraSeoAuditLogsController(route);
  const integrationsController = useKolamDaraSeoIntegrationsController(route);
  const socialController = useKolamDaraSeoSocialController(route);
  const jobsProgress = useKolamDaraSeoJobsProgress(route);

  return (
    <View style={styles.surface}>
      <View style={styles.tabBar}>
        <KolamSurfacePanelTabs
          onSelectTab={(tabId: KolamDaraSeoTabId) => {
            if (tabId === 'jobs') {
              onRouteChange?.(KOLAM_DARA_SEO_JOBS_HREF);
              return;
            }
            onRouteChange?.(buildKolamDaraSeoRoute(tabId));
          }}
          selectedTabId={selectedTab}
          tabs={KOLAM_DARA_SEO_TABS.map(tab => ({
            id: tab.id,
            label: tab.label,
          }))}
        />
      </View>

      <KolamDaraSeoJobsProgressStrip
        jobs={jobsProgress.activeJobs}
        onOpenJobs={() => onRouteChange?.(KOLAM_DARA_SEO_JOBS_HREF)}
      />
      {jobsProgress.notice ? (
        <Text style={styles.notice}>{jobsProgress.notice}</Text>
      ) : null}

      {selectedTab === 'dashboard' ? (
        <KolamDaraSeoDashboardBody
          canDraft={access.canDraft}
          controller={controller}
          jobsProgress={jobsProgress}
          onRouteChange={onRouteChange}
        />
      ) : selectedTab === 'approvals' ? (
        <KolamDaraSeoApprovalsBody
          canApprove={access.canApprove}
          canDraft={access.canDraft}
          controller={approvalsController}
          onRouteChange={onRouteChange}
        />
      ) : selectedTab === 'rankings' ? (
        <KolamDaraSeoRankingsBody
          canDraft={access.canDraft}
          controller={rankingsController}
        />
      ) : selectedTab === 'keywords' ? (
        <KolamDaraSeoKeywordsBody controller={keywordsController} />
      ) : selectedTab === 'mentions' ? (
        <KolamDaraSeoMentionsBody
          canDraft={access.canDraft}
          controller={mentionsController}
        />
      ) : selectedTab === 'website' ? (
        <KolamDaraSeoWebsiteBody
          canApprove={access.canApprove}
          canDraft={access.canDraft}
          controller={websiteController}
          jobsProgress={jobsProgress}
          onRouteChange={onRouteChange}
        />
      ) : selectedTab === 'sentiment' ? (
        <KolamDaraSeoSentimentBody
          canDraft={access.canDraft}
          controller={sentimentController}
        />
      ) : selectedTab === 'audit-logs' ? (
        <KolamDaraSeoAuditLogsBody controller={auditLogsController} />
      ) : selectedTab === 'integrations' ? (
        <KolamDaraSeoIntegrationsBody
          canDraft={access.canDraft}
          canManageSettings={access.canManageSettings}
          controller={integrationsController}
        />
      ) : selectedTab === 'social-insights' ? (
        <KolamDaraSeoSocialBody controller={socialController} />
      ) : (
        <KolamEmptyState title="Belum tersedia" />
      )}
    </View>
  );
}

function KolamDaraSeoJobsProgressStrip({
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
                  {formatSeoJobStatusLabel(job.status)}
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

function formatSeoJobStatusLabel(status: string) {
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

function KolamDaraSeoDashboardBody({
  controller,
  canDraft,
  jobsProgress,
  onRouteChange,
}: {
  controller: KolamDaraSeoController;
  canDraft: boolean;
  jobsProgress: KolamDaraSeoJobsProgressController;
  onRouteChange?: (route: string) => void;
}) {
  const {dashboard, pending, loading, error, brandId, brands} = controller;
  const toolbarRef = useRef<View>(null);
  const brandTriggerRef = useRef<View>(null);
  const [brandPanelOpen, setBrandPanelOpen] = useState(false);
  const [panelAnchor, setPanelAnchor] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const brandOptions = useMemo(
    () => [
      {label: 'Semua merek', value: 'all'},
      ...brands.map(brand => ({
        label: brand.name,
        value: brand.id,
      })),
    ],
    [brands],
  );

  const brandLabel =
    brandOptions.find(option => option.value === brandId)?.label ?? 'Merek';

  const openBrandPanel = () => {
    if (brandPanelOpen) {
      setBrandPanelOpen(false);
      return;
    }
    brandTriggerRef.current?.measureInWindow((x, y, _w, h) => {
      toolbarRef.current?.measureInWindow((tx, ty) => {
        setPanelAnchor({top: y - ty + h + 4, left: Math.max(0, x - tx)});
        setBrandPanelOpen(true);
      });
    });
  };

  const kpiCards = useMemo(() => {
    if (!dashboard) {
      return null;
    }
    return [
      {
        id: 'seo',
        label: 'SEO Score (rata-rata)',
        display: String(dashboard.seoScore),
        sub: '/100',
        pct: dashboard.seoScore,
        status: formatKolamDaraSeoScoreStatus(dashboard.seoScore),
        tone: resolveKolamDaraSeoScoreTone(dashboard.seoScore),
        trend: '+8 poin vs 30 hari lalu',
      },
      {
        id: 'vis',
        label: 'Search Visibility',
        display: `${dashboard.searchVisibility}%`,
        pct: dashboard.searchVisibility,
        status: 'Cukup',
        tone: 'good' as const,
        trend: '+12% vs bulan lalu',
      },
      {
        id: 'brand',
        label: 'Brand Reputation',
        display: String(dashboard.brandReputationScore),
        sub: '/100',
        pct: dashboard.brandReputationScore,
        status: 'Excellent',
        tone: 'good' as const,
        trend: 'Stabil',
      },
      {
        id: 'sent',
        label: 'Sentiment Score',
        display: String(dashboard.sentimentScore),
        pct: Math.min(100, Math.abs(dashboard.sentimentScore)),
        status: formatKolamDaraSeoSentimentStatus(dashboard.sentimentScore),
        tone: resolveKolamDaraSeoSentimentTone(dashboard.sentimentScore),
        trend: 'Berdasarkan review terbaru',
      },
    ];
  }, [dashboard]);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}>
      <View
        ref={toolbarRef}
        collapsable={false}
        style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              {brandOptions.length > 1 ? (
                <View ref={brandTriggerRef} collapsable={false}>
                  <KolamTableFilterTrigger
                    active={brandPanelOpen || brandId !== 'all'}
                    label={brandLabel}
                    onPress={openBrandPanel}
                    open={brandPanelOpen}
                    variant="quiet"
                  />
                </View>
              ) : null}
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              {canDraft ? (
                <>
                  <KolamButton
                    disabled={jobsProgress.isRunning('seo.bulk_products')}
                    label={
                      jobsProgress.isRunning('seo.bulk_products')
                        ? 'Audit produk…'
                        : 'Audit 30 produk'
                    }
                    onPress={() => {
                      void jobsProgress.onStartSeoJob(
                        'seo.bulk_products',
                        {limit: 30, generateDraft: true},
                        'Audit bulk produk',
                      );
                    }}
                  />
                  <KolamButton
                    disabled={jobsProgress.isRunning('seo.bulk_blogs')}
                    label={
                      jobsProgress.isRunning('seo.bulk_blogs')
                        ? 'Audit blog…'
                        : 'Audit 30 blog'
                    }
                    onPress={() => {
                      void jobsProgress.onStartSeoJob(
                        'seo.bulk_blogs',
                        {limit: 30, generateDraft: true},
                        'Audit bulk blog',
                      );
                    }}
                  />
                  <KolamButton
                    disabled={jobsProgress.isRunning('seo.bulk_species')}
                    label={
                      jobsProgress.isRunning('seo.bulk_species')
                        ? 'Audit livestock…'
                        : 'Audit 30 livestock'
                    }
                    onPress={() => {
                      void jobsProgress.onStartSeoJob(
                        'seo.bulk_species',
                        {limit: 30, generateDraft: true},
                        'Audit bulk livestock',
                      );
                    }}
                  />
                  <KolamButton
                    disabled={jobsProgress.isRunning('seo.serp_monitor')}
                    label={
                      jobsProgress.isRunning('seo.serp_monitor')
                        ? 'Monitor…'
                        : 'Run SERP monitor'
                    }
                    onPress={() => {
                      void jobsProgress.onStartSeoJob(
                        'seo.serp_monitor',
                        {},
                        'SERP monitor',
                      );
                    }}
                  />
                </>
              ) : null}
              <KolamButton
                label="SEO Website"
                onPress={() => onRouteChange?.('/campaign/dara-seo/website')}
              />
              <KolamButton
                label="Pusat AI"
                onPress={() => onRouteChange?.('/pusat-ai')}
              />
              <KolamButton
                intent="primary"
                label={`Approvals${
                  dashboard ? ` (${dashboard.pendingApprovals})` : ''
                }`}
                onPress={() => onRouteChange?.('/campaign/dara-seo/approvals')}
              />
              <KolamButton
                disabled={loading}
                label={loading ? 'Memuat…' : 'Refresh'}
                onPress={() => {
                  void controller.onRefresh();
                }}
              />
            </View>
          </View>
        </View>
        {brandPanelOpen && panelAnchor ? (
          <View
            style={[
              styles.filterOverlayPanel,
              {top: panelAnchor.top, left: panelAnchor.left},
            ]}>
            <ScrollView
              contentContainerStyle={styles.filterPanelContent}
              keyboardShouldPersistTaps="handled"
              style={styles.filterPanelScroll}>
              {brandOptions.map(option => (
                <KolamButton
                  intent={brandId === option.value ? 'primary' : 'plain'}
                  key={option.value}
                  label={option.label}
                  onPress={() => {
                    controller.onSetBrandId(option.value);
                    setBrandPanelOpen(false);
                  }}
                  style={styles.filterPanelOption}
                />
              ))}
            </ScrollView>
            <View style={styles.filterPanelFooter}>
              <KolamButton
                label="Tutup"
                onPress={() => setBrandPanelOpen(false)}
              />
            </View>
          </View>
        ) : null}
      </View>

      {error && dashboard ? <Text style={styles.warnText}>{error}</Text> : null}
      {!controller.seoEnabled ? (
        <Text style={styles.warnText}>DARA SEO dimatikan di pengaturan.</Text>
      ) : null}

      {error && !dashboard ? (
        <KolamEmptyState message={error} title="Gagal memuat" />
      ) : null}

      {loading && !dashboard ? (
        <Text style={styles.loadingText}>Memuat…</Text>
      ) : null}

      {dashboard ? (
        <>
          {kpiCards ? (
            <View style={styles.kpiGrid}>
              {kpiCards.map(card => (
                <KolamDaraSeoCircularKpi
                  key={card.id}
                  display={card.display}
                  label={card.label}
                  pct={card.pct}
                  status={card.status}
                  sub={card.sub}
                  tone={card.tone}
                  trend={card.trend}
                />
              ))}
            </View>
          ) : null}

          <View style={styles.metaRow}>
            <Text style={styles.meta}>
              {`Pending ${dashboard.pendingApprovals} · Applied ${dashboard.appliedChanges} · Mentions negatif ${dashboard.negativeMentions}`}
            </Text>
            <Text style={styles.meta}>
              {`Perlu optimasi ${dashboard.needsOptimization} · Keyword opportunities ${dashboard.keywordOpportunities}`}
            </Text>
          </View>

          {dashboard.growthBullets.length ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Insight pertumbuhan</Text>
              {dashboard.growthBullets.slice(0, 4).map(bullet => (
                <Text key={bullet} style={styles.bullet}>
                  {`• ${bullet}`}
                </Text>
              ))}
            </View>
          ) : null}

          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>Menunggu persetujuan</Text>
              <Pressable
                accessibilityRole="link"
                onPress={() =>
                  onRouteChange?.('/campaign/dara-seo/approvals')
                }>
                <Text style={styles.link}>Lihat semua</Text>
              </Pressable>
            </View>
            {pending.length === 0 ? (
              <Text style={styles.emptyLine}>Tidak ada usulan pending.</Text>
            ) : (
              pending.map(item => (
                <Pressable
                  accessibilityRole="button"
                  key={item.id}
                  onPress={() =>
                    onRouteChange?.(
                      `/campaign/dara-seo/approvals?id=${encodeURIComponent(item.id)}`,
                    )
                  }
                  style={styles.pendingRow}>
                  <Text style={styles.pendingTitle}>{item.title}</Text>
                  <Text style={styles.pendingMeta}>
                    {`${item.targetType} · skor ${item.seoScore}${
                      item.pendingItemCount
                        ? ` · ${item.pendingItemCount} item`
                        : ''
                    }`}
                  </Text>
                  {item.summary ? (
                    <Text numberOfLines={2} style={styles.pendingSummary}>
                      {item.summary}
                    </Text>
                  ) : null}
                </Pressable>
              ))
            )}
          </View>
        </>
      ) : null}
    </ScrollView>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 24,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  toolbarWrap: {
    elevation: 1000,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
  },
  filterOverlayPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 1200,
    maxWidth: 280,
    padding: 6,
    position: 'absolute',
    shadowColor: V.colors.fg,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 16,
    width: 240,
    zIndex: 120000,
  },
  filterPanelScroll: {
    maxHeight: 280,
  },
  filterPanelContent: {
    gap: 4,
  },
  filterPanelOption: {
    justifyContent: 'flex-start',
  },
  filterPanelFooter: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    marginTop: 4,
    paddingTop: 4,
  },
  notice: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  warnText: {
    color: V.colors.warning,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  loadingText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  metaRow: {
    gap: 4,
  },
  meta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  card: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    padding: 12,
  },
  cardHead: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  bullet: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 16,
  },
  link: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  emptyLine: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  pendingRow: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pendingTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  pendingMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  pendingSummary: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    marginTop: 2,
  },
});
