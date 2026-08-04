import React, {useMemo} from 'react';
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
  type KolamDaraSeoTabId,
} from '../domain/kolam-dara-seo';
import {isTopNavAdminRole} from '../domain/top-nav';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {
  useKolamDaraSeoController,
  type KolamDaraSeoController,
} from '../hooks/use-kolam-dara-seo-controller';
import {KolamButton} from './kolam-button';
import {KolamDropdownSelect} from './kolam-dropdown-select';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamStatsCardStrip} from './kolam-stats-card-strip';
import {KolamSurfacePanelTabs} from './kolam-surface-panel-tabs';

export function KolamDaraSeoSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const selectedTab = getKolamDaraSeoTab(route);
  const {authUser} = useKolamAuthContext();
  const canDraft = isTopNavAdminRole(authUser?.roleKey);
  const controller = useKolamDaraSeoController(route);

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

      {selectedTab === 'dashboard' ? (
        <KolamDaraSeoDashboardBody
          canDraft={canDraft}
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : (
        <KolamEmptyState title="Belum tersedia" />
      )}
    </View>
  );
}

function KolamDaraSeoDashboardBody({
  controller,
  canDraft,
  onRouteChange,
}: {
  controller: KolamDaraSeoController;
  canDraft: boolean;
  onRouteChange?: (route: string) => void;
}) {
  const {dashboard, pending, loading, error, notice, brandId, brands} =
    controller;

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

  const kpiCards = useMemo(() => {
    if (!dashboard) {
      return [
        {id: 'seo', label: 'SEO Score', value: '—', detail: '', tone: 'muted' as const},
        {
          id: 'vis',
          label: 'Search Visibility',
          value: '—',
          detail: '',
          tone: 'muted' as const,
        },
        {
          id: 'brand',
          label: 'Brand Reputation',
          value: '—',
          detail: '',
          tone: 'muted' as const,
        },
        {
          id: 'sent',
          label: 'Sentiment Score',
          value: '—',
          detail: '',
          tone: 'muted' as const,
        },
      ];
    }
    return [
      {
        id: 'seo',
        label: 'SEO Score',
        value: String(dashboard.seoScore),
        detail: formatKolamDaraSeoScoreStatus(dashboard.seoScore),
        tone: 'default' as const,
      },
      {
        id: 'vis',
        label: 'Search Visibility',
        value: `${dashboard.searchVisibility}%`,
        detail: 'Cukup',
        tone: 'default' as const,
      },
      {
        id: 'brand',
        label: 'Brand Reputation',
        value: String(dashboard.brandReputationScore),
        detail: 'Excellent',
        tone: 'default' as const,
      },
      {
        id: 'sent',
        label: 'Sentiment Score',
        value: String(dashboard.sentimentScore),
        detail: formatKolamDaraSeoSentimentStatus(dashboard.sentimentScore),
        tone:
          dashboard.sentimentScore < 0
            ? ('warning' as const)
            : ('default' as const),
      },
    ];
  }, [dashboard]);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}>
      <View style={styles.toolbar}>
        {brandOptions.length > 1 ? (
          <View style={styles.brandSelect}>
            <KolamDropdownSelect
              accessibilityLabel="Filter merek"
              label="Merek"
              onChange={controller.onSetBrandId}
              options={brandOptions}
              showLabelInTrigger
              value={brandId}
            />
          </View>
        ) : null}
        <View style={styles.toolbarActions}>
          {canDraft ? (
            <>
              <KolamButton
                disabled={controller.jobBusyType === 'seo.bulk_products'}
                intent="outline"
                label={
                  controller.jobBusyType === 'seo.bulk_products'
                    ? 'Audit produk…'
                    : 'Audit 30 produk'
                }
                onPress={() => {
                  void controller.onStartSeoJob(
                    'seo.bulk_products',
                    {limit: 30, generateDraft: true},
                    'Audit bulk produk',
                  );
                }}
              />
              <KolamButton
                disabled={controller.jobBusyType === 'seo.bulk_blogs'}
                intent="outline"
                label={
                  controller.jobBusyType === 'seo.bulk_blogs'
                    ? 'Audit blog…'
                    : 'Audit 30 blog'
                }
                onPress={() => {
                  void controller.onStartSeoJob(
                    'seo.bulk_blogs',
                    {limit: 30, generateDraft: true},
                    'Audit bulk blog',
                  );
                }}
              />
              <KolamButton
                disabled={controller.jobBusyType === 'seo.bulk_species'}
                intent="outline"
                label={
                  controller.jobBusyType === 'seo.bulk_species'
                    ? 'Audit livestock…'
                    : 'Audit 30 livestock'
                }
                onPress={() => {
                  void controller.onStartSeoJob(
                    'seo.bulk_species',
                    {limit: 30, generateDraft: true},
                    'Audit bulk livestock',
                  );
                }}
              />
              <KolamButton
                disabled={controller.jobBusyType === 'seo.serp_monitor'}
                intent="outline"
                label={
                  controller.jobBusyType === 'seo.serp_monitor'
                    ? 'Monitor…'
                    : 'Run SERP monitor'
                }
                onPress={() => {
                  void controller.onStartSeoJob(
                    'seo.serp_monitor',
                    {},
                    'SERP monitor',
                  );
                }}
              />
            </>
          ) : null}
          <KolamButton
            intent="outline"
            label="SEO Website"
            onPress={() => onRouteChange?.('/campaign/dara-seo/website')}
          />
          <KolamButton
            intent="outline"
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
            intent="outline"
            label={loading ? 'Memuat…' : 'Refresh'}
            onPress={() => {
              void controller.onRefresh();
            }}
          />
        </View>
      </View>

      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
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
          <KolamStatsCardStrip cards={kpiCards} />

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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 24,
  },
  toolbar: {
    gap: 10,
  },
  brandSelect: {
    maxWidth: 280,
  },
  toolbarActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
