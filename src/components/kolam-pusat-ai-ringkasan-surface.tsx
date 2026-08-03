import React, {useMemo} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useKolamAuthContext} from '../context/kolam-app-contexts';
import {
  buildKolamPusatAiHubRoute,
  filterKolamPusatAiHubTabs,
  getKolamPusatAiHubTab,
  type KolamPusatAiHubTabId,
} from '../domain/kolam-pusat-ai';
import {isTopNavAdminRole} from '../domain/top-nav';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {
  useKolamPusatAiRingkasanController,
  type KolamPusatAiRingkasanController,
} from '../hooks/use-kolam-pusat-ai-ringkasan-controller';
import {KolamButton} from './kolam-button';
import {KolamDropdownSelect} from './kolam-dropdown-select';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamStatsCardStrip} from './kolam-stats-card-strip';
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
  const controller = useKolamPusatAiRingkasanController(route);

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
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : (
        <KolamEmptyState title="Belum tersedia" />
      )}
    </View>
  );
}

/** Alias for hub surface (tabs + ringkasan). */
export const KolamPusatAiSurface = KolamPusatAiRingkasanSurface;

function resolveSelectedHubTab(
  route: string,
  isAdmin: boolean,
): KolamPusatAiHubTabId {
  const tab = getKolamPusatAiHubTab(route);
  if (tab === 'other') {
    return 'ringkasan';
  }
  const allowed = filterKolamPusatAiHubTabs(isAdmin).some(item => item.id === tab);
  return allowed ? tab : 'ringkasan';
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 24,
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
