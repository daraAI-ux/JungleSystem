import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {
  pickKolamDaraSeoLatestSocialSnapshot,
  type KolamDaraSeoSocialSnapshot,
} from '../domain/kolam-dara-seo';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamDaraSeoSocialController} from '../hooks/use-kolam-dara-seo-social-controller';
import {KolamButton} from './kolam-button';
import {KolamEmptyState} from './kolam-empty-state';

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

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      {controller.notice ? (
        <Text style={styles.notice}>{controller.notice}</Text>
      ) : null}
      {controller.loading && !controller.rows.length ? (
        <Text style={styles.meta}>Memuat…</Text>
      ) : null}
      {controller.error && !controller.rows.length ? (
        <KolamEmptyState message={controller.error} title="Gagal memuat" />
      ) : null}

      <View style={styles.cardsRow}>
        <PlatformCard
          latest={igLatest}
          onSync={periodDays => void controller.onSync('instagram', periodDays)}
          syncBusyKey={controller.syncBusyKey}
          title="Instagram"
        />
        <PlatformCard
          latest={tiktokLatest}
          onSync={periodDays => void controller.onSync('tiktok', periodDays)}
          syncBusyKey={controller.syncBusyKey}
          title="TikTok"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Riwayat</Text>
        {!controller.rows.length ? (
          <Text style={styles.emptyLine}>Belum ada snapshot.</Text>
        ) : (
          controller.rows.map(row => (
            <View key={row.id} style={styles.historyRow}>
              <Text style={styles.historyPlatform}>
                {`${row.platform} · ${row.periodDays}h`}
              </Text>
              <Text style={styles.meta}>{formatSocialStatus(row.status)}</Text>
              <Text style={styles.meta}>
                {(row.fetchedAt || row.createdAt)
                  ? new Date(row.fetchedAt || row.createdAt).toLocaleString(
                      'id-ID',
                    )
                  : '—'}
              </Text>
              {row.error ? (
                <Text style={styles.warnText}>{row.error}</Text>
              ) : null}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function PlatformCard({
  latest,
  onSync,
  syncBusyKey,
  title,
}: {
  latest: KolamDaraSeoSocialSnapshot | null;
  onSync: (periodDays: 7 | 28) => void;
  syncBusyKey: string | null;
  title: string;
}) {
  const platformKey = title.toLowerCase() === 'instagram' ? 'instagram' : 'tiktok';
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {!latest ? (
        <Text style={styles.emptyLine}>Belum ada data.</Text>
      ) : (
        <View style={styles.metricsBlock}>
          {formatMetricLines(latest).map(line => (
            <Text key={line} style={styles.meta}>
              {line}
            </Text>
          ))}
        </View>
      )}
      <View style={styles.cardActions}>
        <KolamButton
          disabled={syncBusyKey === `${platformKey}-7`}
          label={syncBusyKey === `${platformKey}-7` ? 'Sync…' : 'Sync 7'}
          onPress={() => onSync(7)}
        />
        <KolamButton
          disabled={syncBusyKey === `${platformKey}-28`}
          label={syncBusyKey === `${platformKey}-28` ? 'Sync…' : 'Sync 28'}
          onPress={() => onSync(28)}
        />
      </View>
    </View>
  );
}

function formatMetricLines(row: KolamDaraSeoSocialSnapshot) {
  const lines: string[] = [];
  const m = row.metrics;
  if (m.followers != null) {
    lines.push(`Followers ${m.followers.toLocaleString('id-ID')}`);
  }
  if (m.reach != null) {
    lines.push(`Reach ${m.reach.toLocaleString('id-ID')}`);
  }
  if (m.impressions != null) {
    lines.push(`Impressions ${m.impressions.toLocaleString('id-ID')}`);
  }
  if (m.profileViews != null) {
    lines.push(`Profile views ${m.profileViews.toLocaleString('id-ID')}`);
  }
  if (m.videoViews != null) {
    lines.push(`Video views ${m.videoViews.toLocaleString('id-ID')}`);
  }
  if (m.likes != null) {
    lines.push(`Likes ${m.likes.toLocaleString('id-ID')}`);
  }
  if (m.engagementRate != null) {
    lines.push(`Engagement ${m.engagementRate}%`);
  }
  if (!lines.length) {
    lines.push(formatSocialStatus(row.status));
  }
  return lines;
}

function formatSocialStatus(status: string) {
  if (status === 'pending') {
    return 'Menunggu';
  }
  if (status === 'success') {
    return 'Berhasil';
  }
  if (status === 'failed') {
    return 'Gagal';
  }
  return status;
}

const styles = StyleSheet.create({
  scroll: {flex: 1},
  content: {gap: 12, paddingBottom: 24},
  notice: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
  meta: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
  warnText: {color: V.colors.warning, fontFamily: V.fontFamily, fontSize: 12},
  emptyLine: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
  cardsRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
  card: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexBasis: 260,
    flexGrow: 1,
    gap: 8,
    padding: 12,
  },
  cardTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  metricsBlock: {gap: 2},
  cardActions: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4},
  historyRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    gap: 2,
    paddingVertical: 8,
  },
  historyPlatform: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
});
