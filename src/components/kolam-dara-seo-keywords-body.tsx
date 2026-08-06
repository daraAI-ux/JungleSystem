import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  formatKolamDaraSeoKeywordDifficulty,
  formatKolamDaraSeoKeywordVolume,
  KOLAM_DARA_SEO_KEYWORDS_PAGE_SIZE,
  resolveKolamDaraSeoKeywordDifficulty,
  type KolamDaraSeoKeywordRow,
} from '../domain/kolam-dara-seo';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamDaraSeoKeywordsController} from '../hooks/use-kolam-dara-seo-keywords-controller';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamListTableComposition} from './kolam-list-table-composition';

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
        <Text style={styles.loadingText}>Memuat...</Text>
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
        <KolamListTableComposition
          columns={[
            {
              flex: 2.5,
              id: 'keyword',
              label: 'Keyword',
              render: row => (
                <View style={styles.keywordCell}>
                  <Text style={styles.keywordStrong}>{row.mainKeyword}</Text>
                  {row.keywordType ? (
                    <Text style={styles.keywordType}>{row.keywordType}</Text>
                  ) : null}
                </View>
              ),
            },
            {
              align: 'right',
              flex: 0.9,
              id: 'volume',
              label: 'Volume',
              render: row => (
                <Text style={styles.td}>
                  {formatKolamDaraSeoKeywordVolume(
                    row.opportunityScore,
                  ).toLocaleString('id-ID')}
                </Text>
              ),
            },
            {
              align: 'center',
              flex: 1.1,
              id: 'difficulty',
              label: 'Difficulty',
              render: row => <KeywordDifficultyPill row={row} />,
            },
            {
              align: 'center',
              flex: 0.9,
              id: 'trend',
              label: 'Trend',
              render: () => (
                <View accessibilityLabel="Estimasi tren" style={styles.sparkTrack}>
                  <View style={[styles.sparkSeg, styles.sparkSegWarn]} />
                  <View style={[styles.sparkSeg, styles.sparkSegMid]} />
                  <View style={[styles.sparkSeg, styles.sparkSegOk]} />
                </View>
              ),
            },
            {
              align: 'center',
              flex: 0.6,
              id: 'score',
              label: 'Skor',
              render: row => <Text style={styles.td}>{row.opportunityScore}</Text>,
            },
          ]}
          getRowKey={row => row.id}
          pagination={{
            onPageChange: controller.onSetPage,
            page: controller.page,
            pageSize: KOLAM_DARA_SEO_KEYWORDS_PAGE_SIZE,
            total: controller.total,
          }}
          rows={controller.pagedItems}
          style={styles.tableShell}
        />
      ) : null}
    </View>
  );
}

function KeywordDifficultyPill({row}: {row: KolamDaraSeoKeywordRow}) {
  const level = resolveKolamDaraSeoKeywordDifficulty(row.opportunityScore);
  return (
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
        {formatKolamDaraSeoKeywordDifficulty(row.opportunityScore)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    alignSelf: 'stretch',
    flex: 1,
    gap: 12,
    minHeight: 0,
    width: '100%',
  },
  tableShell: {
    alignSelf: 'stretch',
    width: '100%',
  },
  loadingText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  td: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  keywordCell: {
    minWidth: 0,
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
    alignSelf: 'center',
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
    width: '100%',
  },
  emptyText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    textAlign: 'center',
  },
});
