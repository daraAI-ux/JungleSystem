import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {
  formatKolamDaraSeoKeywordDifficulty,
  formatKolamDaraSeoKeywordVolume,
  resolveKolamDaraSeoKeywordDifficulty,
} from '../domain/kolam-dara-seo';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamDaraSeoKeywordsController} from '../hooks/use-kolam-dara-seo-keywords-controller';
import {KolamButton} from './kolam-button';
import {KolamCatalogListTableShell} from './kolam-catalog-list-table-shell';
import {KolamEmptyState} from './kolam-empty-state';

/**
 * FE parity: DA-Dara-Plugin `dara-seo-keywords.tsx` table
 * Keyword / Volume / Difficulty / Trend / Skor + client page size 10.
 */
export function KolamDaraSeoKeywordsBody({
  controller,
}: {
  controller: KolamDaraSeoKeywordsController;
}) {
  const showTable = controller.pagedItems.length > 0;

  return (
    <View style={styles.surface}>
      {controller.loading && !controller.rows.length ? (
        <Text style={styles.loadingText}>Memuat…</Text>
      ) : null}

      {controller.error && !controller.rows.length ? (
        <KolamEmptyState message={controller.error} title="Gagal memuat" />
      ) : null}

      {!controller.loading && !controller.error && !controller.rows.length ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            Belum ada peluang keyword. Jalankan audit SEO produk dari dashboard.
          </Text>
        </View>
      ) : null}

      {showTable ? (
        <KolamCatalogListTableShell
          footer={
            <View style={styles.pager}>
              <KolamButton
                disabled={controller.page <= 1}
                label="Sebelumnya"
                onPress={() => controller.onSetPage(controller.page - 1)}
              />
              <Text style={styles.pageLabel}>
                {`${controller.page} / ${controller.totalPages} · ${controller.total}`}
              </Text>
              <KolamButton
                disabled={controller.page >= controller.totalPages}
                label="Berikutnya"
                onPress={() => controller.onSetPage(controller.page + 1)}
              />
            </View>
          }>
          <ScrollView horizontal style={styles.tableScroll}>
            <View style={styles.table}>
              <View style={styles.headerRow}>
                <Text style={[styles.th, styles.colKeyword]}>Keyword</Text>
                <Text style={[styles.th, styles.colVolume]}>Volume</Text>
                <Text style={[styles.th, styles.colDifficulty]}>Difficulty</Text>
                <Text style={[styles.th, styles.colTrend]}>Trend</Text>
                <Text style={[styles.th, styles.colScore]}>Skor</Text>
              </View>
              {controller.pagedItems.map(row => {
                const level = resolveKolamDaraSeoKeywordDifficulty(
                  row.opportunityScore,
                );
                return (
                  <View key={row.id} style={styles.bodyRow}>
                    <View style={styles.colKeyword}>
                      <Text style={styles.keywordStrong}>{row.mainKeyword}</Text>
                      {row.keywordType ? (
                        <Text style={styles.keywordType}>{row.keywordType}</Text>
                      ) : null}
                    </View>
                    <Text style={[styles.td, styles.colVolume]}>
                      {formatKolamDaraSeoKeywordVolume(
                        row.opportunityScore,
                      ).toLocaleString('id-ID')}
                    </Text>
                    <View style={styles.colDifficulty}>
                      <View
                        style={[
                          styles.pill,
                          level === 'low'
                            ? styles.pillLow
                            : level === 'medium'
                              ? styles.pillMedium
                              : styles.pillHigh,
                        ]}>
                        <Text
                          style={[
                            styles.pillText,
                            level === 'low'
                              ? styles.pillTextLow
                              : level === 'medium'
                                ? styles.pillTextMedium
                                : styles.pillTextHigh,
                          ]}>
                          {formatKolamDaraSeoKeywordDifficulty(
                            row.opportunityScore,
                          )}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.colTrend}>
                      <View
                        accessibilityLabel="Estimasi tren"
                        style={styles.sparkTrack}>
                        <View style={[styles.sparkSeg, styles.sparkSegWarn]} />
                        <View style={[styles.sparkSeg, styles.sparkSegMid]} />
                        <View style={[styles.sparkSeg, styles.sparkSegOk]} />
                      </View>
                    </View>
                    <Text style={[styles.td, styles.colScore]}>
                      {row.opportunityScore}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </KolamCatalogListTableShell>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 12,
    minHeight: 0,
  },
  loadingText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  tableScroll: {
    flexGrow: 0,
  },
  table: {
    minWidth: 640,
    width: '100%',
  },
  headerRow: {
    backgroundColor: V.colors.muted,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  bodyRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  th: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  td: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  colKeyword: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 180,
    paddingRight: 10,
  },
  colVolume: {
    width: 96,
  },
  colDifficulty: {
    width: 110,
  },
  colTrend: {
    width: 96,
  },
  colScore: {
    width: 64,
  },
  keywordStrong: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  keywordType: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    marginTop: 2,
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillLow: {
    backgroundColor: V.colors.successSoft,
  },
  pillMedium: {
    backgroundColor: V.colors.warningSoft,
  },
  pillHigh: {
    backgroundColor: V.colors.dangerSoft,
  },
  pillText: {
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  pillTextLow: {
    color: V.colors.success,
  },
  pillTextMedium: {
    color: V.colors.warning,
  },
  pillTextHigh: {
    color: V.colors.danger,
  },
  sparkTrack: {
    borderRadius: 6,
    flexDirection: 'row',
    height: 24,
    overflow: 'hidden',
    width: 72,
  },
  sparkSeg: {
    flex: 1,
    height: 24,
  },
  sparkSegWarn: {
    backgroundColor: 'rgba(220, 38, 38, 0.35)',
  },
  sparkSegMid: {
    backgroundColor: 'rgba(183, 121, 31, 0.35)',
  },
  sparkSegOk: {
    backgroundColor: 'rgba(5, 150, 105, 0.35)',
  },
  emptyCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  emptyText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    textAlign: 'center',
  },
  pager: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
});
