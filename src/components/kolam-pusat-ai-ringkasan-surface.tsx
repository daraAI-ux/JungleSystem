import React, {useMemo} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useKolamAuthContext} from '../context/kolam-app-contexts';
import {
  buildKolamPusatAiHubRoute,
  filterKolamPusatAiHubTabs,
  getKolamPusatAiHubTab,
  type KolamPusatAiHubTabId,
} from '../domain/kolam-pusat-ai';
import {
  formatKolamDaraJobModuleLabel,
  formatKolamDaraJobProgressLabel,
  getKolamDaraJobProgressPercent,
  getKolamDaraJobStatusIntent,
  isKolamDaraJobActive,
  KOLAM_DARA_JOBS_MODULE_OPTIONS,
  KOLAM_DARA_JOBS_STATUS_OPTIONS,
  KOLAM_PUSAT_AI_PROSES_EMPTY_COPY,
  KOLAM_PUSAT_AI_PROSES_HELPER_COPY,
  type KolamDaraAsyncJob,
} from '../domain/kolam-pusat-ai-jobs';
import {isTopNavAdminRole} from '../domain/top-nav';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {
  useKolamPusatAiProsesController,
  type KolamPusatAiProsesController,
} from '../hooks/use-kolam-pusat-ai-proses-controller';
import {
  useKolamPusatAiRingkasanController,
  type KolamPusatAiRingkasanController,
} from '../hooks/use-kolam-pusat-ai-ringkasan-controller';
import {KolamButton} from './kolam-button';
import {KolamDropdownSelect} from './kolam-dropdown-select';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamStatsCardStrip} from './kolam-stats-card-strip';
import {KolamStatusBadge} from './kolam-status-badge';
import {KolamSurfacePanelTabs} from './kolam-surface-panel-tabs';
import {kolamTableToolbarStyles} from './kolam-table-toolbar-styles';

export function KolamPusatAiRingkasanSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const {authUser} = useKolamAuthContext();
  const isAdmin = isTopNavAdminRole(authUser?.roleKey);
  const hubTabs = useMemo(() => filterKolamPusatAiHubTabs(isAdmin), [isAdmin]);
  const selectedTab = resolveSelectedHubTab(route, isAdmin);
  const ringkasanController = useKolamPusatAiRingkasanController(route);
  const prosesController = useKolamPusatAiProsesController(route, {
    canNormalize: isAdmin,
  });

  return (
    <View style={styles.surface}>
      <View style={styles.tabBar}>
        <KolamSurfacePanelTabs
          onSelectTab={(tabId: KolamPusatAiHubTabId) => {
            onRouteChange?.(buildKolamPusatAiHubRoute(tabId));
          }}
          selectedTabId={selectedTab}
          tabs={hubTabs.map(tab => ({id: tab.id, label: tab.label}))}
        />
      </View>

      {selectedTab === 'ringkasan' ? (
        <KolamPusatAiRingkasanBody
          controller={ringkasanController}
          onRouteChange={onRouteChange}
        />
      ) : selectedTab === 'proses' ? (
        <KolamPusatAiProsesBody controller={prosesController} />
      ) : (
        <KolamEmptyState title="Belum tersedia" />
      )}
    </View>
  );
}

/** Alias for hub surface (tabs + ringkasan/proses). */
export const KolamPusatAiSurface = KolamPusatAiRingkasanSurface;

function resolveSelectedHubTab(
  route: string,
  isAdmin: boolean,
): KolamPusatAiHubTabId {
  const tab = getKolamPusatAiHubTab(route);
  if (tab === 'other') {
    return 'ringkasan';
  }
  const allowed = filterKolamPusatAiHubTabs(isAdmin).some(
    item => item.id === tab,
  );
  return allowed ? tab : 'ringkasan';
}

function KolamPusatAiProsesBody({
  controller,
}: {
  controller: KolamPusatAiProsesController;
}) {
  return (
    <View style={styles.proses}>
      <View style={styles.helperCard}>
        <Text style={styles.helperText}>{KOLAM_PUSAT_AI_PROSES_HELPER_COPY}</Text>
      </View>

      <View style={styles.prosesActions}>
        <KolamButton
          disabled={controller.loading}
          intent="outline"
          label="Refresh"
          onPress={() => {
            void controller.onRefresh();
          }}
        />
        {controller.canNormalize ? (
          <KolamButton
            disabled={controller.normalizeBusy}
            intent="outline"
            label={
              controller.normalizeBusy
                ? 'Memperbaiki…'
                : 'Perbaiki tipe SEO lama'
            }
            onPress={() => {
              void controller.onNormalizeSeo();
            }}
          />
        ) : null}
      </View>

      {controller.notice ? (
        <Text style={styles.noticeText}>{controller.notice}</Text>
      ) : null}
      {controller.error ? (
        <Text style={styles.noticeText}>{controller.error}</Text>
      ) : null}

      <View style={styles.filterCard}>
        <View style={styles.filterField}>
          <Text style={styles.filterLabel}>Modul</Text>
          <KolamDropdownSelect
            accessibilityLabel="Filter modul"
            label="Modul"
            onChange={value =>
              controller.onSetModuleFilter(
                value as typeof controller.moduleFilter,
              )
            }
            options={KOLAM_DARA_JOBS_MODULE_OPTIONS}
            showLabelInTrigger={false}
            value={controller.moduleFilter}
          />
        </View>
        <View style={styles.filterField}>
          <Text style={styles.filterLabel}>Status</Text>
          <KolamDropdownSelect
            accessibilityLabel="Filter status"
            label="Status"
            onChange={value =>
              controller.onSetStatusFilter(
                value as typeof controller.statusFilter,
              )
            }
            options={KOLAM_DARA_JOBS_STATUS_OPTIONS}
            showLabelInTrigger={false}
            value={controller.statusFilter}
          />
        </View>
      </View>

      {controller.loading ? (
        <Text style={styles.loadingText}>Memuat…</Text>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          style={styles.scroll}>
          <View style={styles.jobsTable}>
            <View style={styles.jobsHeader}>
              <Text style={[styles.jobsHeaderCell, styles.colProses]}>
                Proses
              </Text>
              <Text style={[styles.jobsHeaderCell, styles.colModul]}>Modul</Text>
              <Text style={[styles.jobsHeaderCell, styles.colStatus]}>
                Status
              </Text>
              <Text style={[styles.jobsHeaderCell, styles.colProgress]}>
                Progress
              </Text>
              <Text style={[styles.jobsHeaderCell, styles.colAksi]}>Aksi</Text>
            </View>

            {controller.jobs.length === 0 ? (
              <Text style={styles.emptyTableText}>
                {KOLAM_PUSAT_AI_PROSES_EMPTY_COPY}
              </Text>
            ) : (
              controller.jobs.map(job => (
                <ProsesJobRow
                  job={job}
                  key={job.id}
                  onDismiss={() => controller.onDismissJob(job.id)}
                  onPoll={() => {
                    void controller.onPollJob(job.id);
                  }}
                  polling={controller.pollingJobId === job.id}
                />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function ProsesJobRow({
  job,
  onDismiss,
  onPoll,
  polling,
}: {
  job: KolamDaraAsyncJob;
  onDismiss: () => void;
  onPoll: () => void;
  polling: boolean;
}) {
  const active = isKolamDaraJobActive(job);
  const percent = getKolamDaraJobProgressPercent(job);

  return (
    <View style={styles.jobsRow}>
      <View style={[styles.jobsCell, styles.colProses]}>
        <Text style={styles.jobLabel}>{job.label}</Text>
        {job.progressMessage ? (
          <Text numberOfLines={1} style={styles.jobMessage}>
            {job.progressMessage}
          </Text>
        ) : null}
      </View>
      <View style={[styles.jobsCell, styles.colModul]}>
        <KolamStatusBadge
          intent="secondary"
          label={formatKolamDaraJobModuleLabel(job.module)}
        />
      </View>
      <View style={[styles.jobsCell, styles.colStatus]}>
        <KolamStatusBadge
          intent={getKolamDaraJobStatusIntent(job.status)}
          label={job.status}
        />
      </View>
      <View style={[styles.jobsCell, styles.colProgress]}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {width: `${percent}%`}]} />
        </View>
        <Text style={styles.jobProgress}>
          {formatKolamDaraJobProgressLabel(job)}
        </Text>
      </View>
      <View style={[styles.jobsCell, styles.colAksi, styles.jobActions]}>
        {active ? (
          <KolamButton
            disabled={polling}
            intent="outline"
            label="Update"
            onPress={onPoll}
          />
        ) : null}
        <KolamButton intent="outline" label="Tutup" onPress={onDismiss} />
      </View>
    </View>
  );
}

function KolamPusatAiRingkasanBody({
  controller,
  onRouteChange,
}: {
  controller: KolamPusatAiRingkasanController;
  onRouteChange?: (route: string) => void;
}) {
  const {hub, loading, error, quickLinks, kpiCards} = controller;
  const showBrandFilter = (hub?.brands.length ?? 0) > 0;

  return (
    <View style={styles.ringkasan}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            {showBrandFilter ? (
              <KolamDropdownSelect
                accessibilityLabel="Filter merek Pusat AI"
                label="Merek"
                onChange={controller.onSetBrandId}
                options={controller.brandOptions}
                showLabelInTrigger={false}
                value={controller.brandId}
              />
            ) : null}
          </View>
          <View style={kolamTableToolbarStyles.actions}>
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}>
        {error && !hub ? (
          <KolamEmptyState message={error} title="Gagal memuat" />
        ) : null}

        {!error || hub ? <KolamStatsCardStrip cards={kpiCards} /> : null}

        {hub ? (
          <View style={styles.modules}>
            <ModuleCard
              actionLabel="Buka SEO"
              href="/campaign/dara-seo"
              metric={hub.seo != null ? String(hub.seo.seoScore) : '—'}
              onRouteChange={onRouteChange}
              stats={[
                `Persetujuan: ${hub.seo?.pendingApprovals ?? 0}`,
                `Negatif: ${hub.seo?.negativeMentions ?? 0}`,
              ]}
              subtitle="Skor rata-rata audit produk & konten."
              title="DARA SEO"
            />
            <ModuleCard
              actionLabel="Buka Market Intel"
              href="/campaign/dara-market-intel"
              metric={String(hub.market.pendingApprovals)}
              onRouteChange={onRouteChange}
              stats={[
                `Murah: ${hub.market.tooCheap}`,
                `Mahal: ${hub.market.tooExpensive}`,
                `Margin rendah: ${hub.market.lowMargin}`,
              ]}
              subtitle="Antrian persetujuan harga & positioning pasar."
              title="Market Intel"
            />
            <ModuleCard
              actionLabel="Lihat ranking SERP"
              href="/campaign/dara-seo/rankings"
              metric={String(hub.serpSnapshotsStored)}
              onRouteChange={onRouteChange}
              stats={[
                hub.integrations.searxngReachable
                  ? 'SearXNG online'
                  : 'SearXNG offline',
                hub.integrations.serpConfigured
                  ? 'SerpAPI aktif'
                  : 'SerpAPI belum',
              ]}
              statusOnline={[
                hub.integrations.searxngReachable,
                hub.integrations.serpConfigured,
              ]}
              subtitle="Snapshot SERP tersimpan untuk monitoring keyword."
              title="Ranking & integrasi"
            />
          </View>
        ) : null}

        {hub && !loading && quickLinks.length > 0 ? (
          <View style={styles.quickLinks}>
            <Text style={styles.quickLinksTitle}>Akses cepat</Text>
            <View style={styles.quickLinksGrid}>
              {quickLinks.map(item => (
                <Pressable
                  accessibilityLabel={item.label}
                  accessibilityRole="button"
                  key={item.href}
                  onPress={() => onRouteChange?.(item.href)}
                  style={styles.quickLink}>
                  <Text numberOfLines={1} style={styles.quickLinkText}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {!loading && !hub && !error ? (
          <KolamEmptyState title="Belum ada data" />
        ) : null}
      </ScrollView>
    </View>
  );
}

function ModuleCard({
  actionLabel,
  href,
  metric,
  onRouteChange,
  stats,
  statusOnline,
  subtitle,
  title,
}: {
  actionLabel: string;
  href: string;
  metric: string;
  onRouteChange?: (route: string) => void;
  stats: string[];
  statusOnline?: boolean[];
  subtitle: string;
  title: string;
}) {
  return (
    <View style={styles.moduleCard}>
      <Text style={styles.moduleTitle}>{title}</Text>
      <Text style={styles.moduleMetric}>{metric}</Text>
      <Text style={styles.moduleSubtitle}>{subtitle}</Text>
      <View style={styles.moduleStats}>
        {stats.map((stat, index) => {
          const online = statusOnline?.[index];
          return (
            <Text
              key={stat}
              style={[
                styles.moduleStat,
                online === true ? styles.statusOnline : null,
                online === false ? styles.statusOffline : null,
              ]}>
              {stat}
            </Text>
          );
        })}
      </View>
      <View style={styles.moduleAction}>
        <KolamButton
          intent="outline"
          label={actionLabel}
          onPress={() => onRouteChange?.(href)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 12,
  },
  tabBar: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  ringkasan: {
    flex: 1,
    gap: 12,
  },
  proses: {
    flex: 1,
    gap: 16,
  },
  helperCard: {
    backgroundColor: V.colors.primarySoft,
    borderColor: V.colors.primary,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  helperText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 18,
  },
  prosesActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  noticeText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  filterCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    padding: 16,
  },
  filterField: {
    gap: 4,
    minWidth: 160,
  },
  filterLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  loadingText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    paddingHorizontal: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 24,
  },
  jobsTable: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  jobsHeader: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  jobsHeaderCell: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  jobsRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  jobsCell: {
    justifyContent: 'center',
    minWidth: 0,
  },
  colProses: {
    flex: 2.2,
  },
  colModul: {
    flex: 0.8,
  },
  colStatus: {
    flex: 0.9,
  },
  colProgress: {
    flex: 1.2,
    gap: 4,
    minWidth: 120,
  },
  colAksi: {
    flex: 1,
    minWidth: 128,
  },
  emptyTableText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    paddingVertical: 40,
    textAlign: 'center',
  },
  jobLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  jobMessage: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  progressTrack: {
    backgroundColor: V.colors.muted,
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    backgroundColor: V.colors.primary,
    height: '100%',
  },
  jobProgress: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  jobActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  modules: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moduleCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    flexBasis: 260,
    flexGrow: 1,
    gap: 6,
    minWidth: 240,
    padding: 14,
  },
  moduleTitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  moduleMetric: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  moduleSubtitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 16,
  },
  moduleStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  moduleStat: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  statusOnline: {
    color: V.colors.success,
  },
  statusOffline: {
    color: V.colors.warning,
  },
  moduleAction: {
    alignItems: 'flex-start',
    marginTop: 8,
  },
  quickLinks: {
    gap: 8,
  },
  quickLinksTitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickLink: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: V.radius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickLinkText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '500',
  },
});
