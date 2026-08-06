import React from 'react';
import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import {
  formatKolamDaraSeoSocialDate,
  formatKolamDaraSeoSocialMetric,
  formatKolamDaraSeoSocialStatusLabel,
  getKolamDaraSeoSocialStatusIntent,
  KOLAM_DARA_SEO_SOCIAL_PAGE_SIZE,
  pickKolamDaraSeoLatestSocialSnapshot,
  type KolamDaraSeoSocialPlatform,
  type KolamDaraSeoSocialSnapshot,
} from '../domain/kolam-dara-seo';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamDaraSeoSocialController} from '../hooks/use-kolam-dara-seo-social-controller';
import {KolamButton} from './kolam-button';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamListTableComposition} from './kolam-list-table-composition';
import {KolamStatusBadge} from './kolam-status-badge';

/** Same asset as chat rail (`kolam-global-chat-rail`). */
const TIKTOK_LOGO = require('../assets/marketplace/tiktok.webp');

/**
 * FE parity: DA-Dara-Plugin `dara-seo-social-insights.tsx`
 * Side-by-side IG/TikTok cards + Riwayat snapshot table (10/page).
 */
export function KolamDaraSeoSocialBody({
  controller,
}: {
  controller: KolamDaraSeoSocialController;
}) {
  const igLatest = pickKolamDaraSeoLatestSocialSnapshot(
    controller.rows,
    'instagram',
  );
  const tiktokLatest = pickKolamDaraSeoLatestSocialSnapshot(
    controller.rows,
    'tiktok',
  );
  const showTable = controller.pagedItems.length > 0;

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      {controller.notice ? (
        <Text style={styles.notice}>{controller.notice}</Text>
      ) : null}
      {controller.loading && !controller.rows.length ? (
        <Text style={styles.meta}>Memuat...</Text>
      ) : null}
      {controller.error && !controller.rows.length ? (
        <KolamEmptyState message={controller.error} title="Gagal memuat" />
      ) : null}

      <View style={styles.cardsRow}>
        <PlatformCard
          latest={igLatest}
          onSync={periodDays => void controller.onSync('instagram', periodDays)}
          platform="instagram"
          syncing={controller.syncing}
          title="Instagram"
        />
        <PlatformCard
          latest={tiktokLatest}
          onSync={periodDays => void controller.onSync('tiktok', periodDays)}
          platform="tiktok"
          syncing={controller.syncing}
          title="TikTok"
        />
      </View>

      <View style={styles.historyCard}>
        <Text style={styles.historyTitle}>Riwayat snapshot</Text>
        {controller.loading && !controller.rows.length ? (
          <Text style={styles.meta}>Memuat...</Text>
        ) : null}
        {!controller.loading && !controller.rows.length ? (
          <Text style={styles.emptyLine}>
            Belum ada snapshot. Tekan Sinkron di atas.
          </Text>
        ) : null}

        {showTable ? (
          <KolamListTableComposition
            columns={[
              {
                flex: 0.9,
                id: 'platform',
                label: 'Platform',
                render: row => (
                  <Text style={[styles.td, styles.capitalize]}>
                    {row.platform}
                  </Text>
                ),
              },
              {
                align: 'center',
                flex: 0.9,
                id: 'status',
                label: 'Status',
                render: row => (
                  <KolamStatusBadge
                    intent={getKolamDaraSeoSocialStatusIntent(row.status)}
                    label={formatKolamDaraSeoSocialStatusLabel(row.status)}
                    style={styles.centerBadge}
                  />
                ),
              },
              {
                align: 'center',
                flex: 0.7,
                id: 'period',
                label: 'Periode',
                render: row => (
                  <Text style={styles.td}>{`${row.periodDays} hari`}</Text>
                ),
              },
              {
                align: 'center',
                flex: 0.9,
                id: 'followers',
                label: 'Pengikut',
                render: row => (
                  <Text style={styles.td}>
                    {formatKolamDaraSeoSocialMetric(row.metrics.followers)}
                  </Text>
                ),
              },
              {
                align: 'center',
                flex: 1,
                id: 'reach',
                label: 'Jangkauan / Tayangan',
                render: row => (
                  <Text style={styles.td}>
                    {formatKolamDaraSeoSocialMetric(
                      row.platform === 'tiktok'
                        ? row.metrics.videoViews
                        : row.metrics.reach,
                    )}
                  </Text>
                ),
              },
              {
                align: 'center',
                flex: 1.3,
                id: 'time',
                label: 'Waktu',
                render: row => (
                  <Text style={styles.timeText}>
                    {formatKolamDaraSeoSocialDate(
                      row.fetchedAt || row.createdAt,
                    )}
                  </Text>
                ),
              },
            ]}
            getRowKey={row => row.id}
            pagination={{
              onPageChange: controller.onSetPage,
              page: controller.page,
              pageSize: KOLAM_DARA_SEO_SOCIAL_PAGE_SIZE,
              total: controller.total,
            }}
            rows={controller.pagedItems}
            style={styles.tableShell}
          />
        ) : null}
      </View>
    </ScrollView>
  );
}

function PlatformCard({
  latest,
  onSync,
  platform,
  syncing,
  title,
}: {
  latest: KolamDaraSeoSocialSnapshot | null;
  onSync: (periodDays: 7 | 28) => void;
  platform: KolamDaraSeoSocialPlatform;
  syncing: boolean;
  title: string;
}) {
  const m = latest?.metrics;
  const busy = syncing || latest?.status === 'pending';
  const statusLabel = latest
    ? formatKolamDaraSeoSocialStatusLabel(latest.status)
    : 'Belum sinkron';
  const statusIntent = latest
    ? getKolamDaraSeoSocialStatusIntent(latest.status)
    : 'secondary';

  return (
    <View style={styles.platformCard}>
      <View style={styles.platformHead}>
        <View style={styles.platformHeadText}>
          <Text style={styles.platformTitle}>{title}</Text>
          <Text style={styles.platformDesc}>
            Akun inbox AM - sinkron via Playwright lalu kembali standby
          </Text>
        </View>
        <KolamStatusBadge intent={statusIntent} label={statusLabel} />
      </View>

      <View style={styles.metricsGrid}>
        {platform === 'instagram' ? (
          <MetricCell
            label="Pengikut"
            value={formatKolamDaraSeoSocialMetric(m?.followers)}
          />
        ) : (
          <MetricCell
            hint="Dari halaman profil, bukan analitik"
            label="Pengikut (profil)"
            value={
              m?.followers != null
                ? formatKolamDaraSeoSocialMetric(m.followers)
                : '—'
            }
          />
        )}
        <MetricCell
          label={platform === 'tiktok' ? 'Tayangan video' : 'Jangkauan'}
          value={formatKolamDaraSeoSocialMetric(
            platform === 'tiktok' ? m?.videoViews : m?.reach,
          )}
        />
        <MetricCell
          label={platform === 'tiktok' ? 'Kunjungan profil' : 'Tayangan'}
          value={formatKolamDaraSeoSocialMetric(
            platform === 'tiktok' ? m?.profileViews : m?.impressions,
          )}
        />
        {platform === 'instagram' ? (
          <MetricCell
            label="Kunjungan profil"
            value={formatKolamDaraSeoSocialMetric(m?.profileViews)}
          />
        ) : null}
        <MetricCell
          label="Interaksi / Suka"
          value={formatKolamDaraSeoSocialMetric(
            platform === 'tiktok' ? m?.likes : m?.engagementRate,
          )}
        />
      </View>

      <Text style={styles.meta}>
        {`Terakhir: ${formatKolamDaraSeoSocialDate(
          latest?.fetchedAt || latest?.createdAt,
        )}${latest?.periodDays ? ` - ${latest.periodDays} hari` : ''}`}
      </Text>
      {latest?.error ? <Text style={styles.warnText}>{latest.error}</Text> : null}

      <View style={styles.cardActions}>
        <KolamButton
          disabled={busy}
          intent="primary"
          label={busy ? 'Sinkron...' : 'Sinkron 7 hari'}
          onPress={() => onSync(7)}
        />
        <KolamButton
          disabled={busy}
          label={busy ? 'Sinkron...' : 'Sinkron 28 hari'}
          onPress={() => onSync(28)}
        />
      </View>

      <View pointerEvents="none" style={styles.platformLogoCorner}>
        <SocialPlatformLogo platform={platform} />
      </View>
    </View>
  );
}

/** Cosmetic logos matching chat rail (`KolamChatPlatformLogoMark`). */
function SocialPlatformLogo({platform}: {platform: KolamDaraSeoSocialPlatform}) {
  if (platform === 'tiktok') {
    return (
      <View style={styles.logoSlot}>
        <Image
          resizeMode="cover"
          source={TIKTOK_LOGO}
          style={styles.tiktokLogoImage}
        />
      </View>
    );
  }

  return (
    <View style={styles.logoSlot}>
      <View style={styles.instagramLogo}>
        <View style={styles.instagramLens} />
        <View style={styles.instagramFlash} />
      </View>
    </View>
  );
}

function MetricCell({
  hint,
  label,
  value,
}: {
  hint?: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metricCell}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {hint ? <Text style={styles.metricHint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {flex: 1},
  content: {gap: 16, paddingBottom: 24},
  notice: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
  meta: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
  warnText: {color: V.colors.danger, fontFamily: V.fontFamily, fontSize: 12},
  emptyLine: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    paddingVertical: 8,
  },
  cardsRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  platformCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    gap: 12,
    minWidth: 0,
    overflow: 'hidden',
    padding: 14,
    paddingBottom: 18,
    position: 'relative',
  },
  platformLogoCorner: {
    bottom: 10,
    position: 'absolute',
    right: 10,
  },
  logoSlot: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 36,
  },
  tiktokLogoImage: {
    height: 52,
    width: 52,
  },
  instagramLogo: {
    alignItems: 'center',
    backgroundColor: '#fff0f6',
    borderColor: '#e1306c',
    borderRadius: 9,
    borderWidth: 2.5,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  instagramLens: {
    borderColor: '#e1306c',
    borderRadius: 7,
    borderWidth: 2.5,
    height: 15,
    width: 15,
  },
  instagramFlash: {
    backgroundColor: '#e1306c',
    borderRadius: 2.5,
    height: 5,
    position: 'absolute',
    right: 5,
    top: 5,
    width: 5,
  },
  platformHead: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  platformHeadText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  platformTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '700',
  },
  platformDesc: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    lineHeight: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCell: {
    gap: 2,
    minWidth: 110,
    width: '30%',
  },
  metricLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  metricValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
  metricHint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
  },
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingRight: 48,
  },
  historyCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    padding: 12,
    width: '100%',
  },
  historyTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '700',
  },
  tableShell: {
    alignSelf: 'stretch',
    width: '100%',
  },
  td: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  centerBadge: {
    alignSelf: 'center',
  },
  capitalize: {
    textTransform: 'capitalize',
  },
  timeText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
});
