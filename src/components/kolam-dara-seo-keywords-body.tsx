import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {
  formatKolamDaraSeoKeywordDifficulty,
  formatKolamDaraSeoKeywordVolume,
} from '../domain/kolam-dara-seo';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamDaraSeoKeywordsController} from '../hooks/use-kolam-dara-seo-keywords-controller';
import {KolamButton} from './kolam-button';
import {KolamEmptyState} from './kolam-empty-state';

export function KolamDaraSeoKeywordsBody({
  controller,
}: {
  controller: KolamDaraSeoKeywordsController;
}) {
  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      <View style={styles.toolbar}>
        <KolamButton
          disabled={controller.loading}
          label={controller.loading ? 'Memuat…' : 'Refresh'}
          onPress={() => {
            void controller.onRefresh();
          }}
        />
      </View>

      {controller.error && !controller.rows.length ? (
        <KolamEmptyState message={controller.error} title="Gagal memuat" />
      ) : null}
      {!controller.loading && !controller.error && !controller.rows.length ? (
        <KolamEmptyState
          message="Jalankan audit SEO produk dari dashboard."
          title="Belum ada peluang keyword"
        />
      ) : null}

      {controller.pagedItems.map(row => (
        <View key={row.id} style={styles.row}>
          <Text style={styles.keyword}>{row.mainKeyword}</Text>
          {row.keywordType ? (
            <Text style={styles.meta}>{row.keywordType}</Text>
          ) : null}
          <Text style={styles.meta}>
            {`Volume ${formatKolamDaraSeoKeywordVolume(
              row.opportunityScore,
            ).toLocaleString('id-ID')} · ${formatKolamDaraSeoKeywordDifficulty(
              row.opportunityScore,
            )} · Skor ${row.opportunityScore}`}
          </Text>
        </View>
      ))}

      {controller.total > 0 ? (
        <View style={styles.pager}>
          <KolamButton
            disabled={controller.page <= 1}
            label="Sebelumnya"
            onPress={() => controller.onSetPage(controller.page - 1)}
          />
          <Text style={styles.meta}>
            {`${controller.page}/${controller.totalPages} · ${controller.total}`}
          </Text>
          <KolamButton
            disabled={controller.page >= controller.totalPages}
            label="Berikutnya"
            onPress={() => controller.onSetPage(controller.page + 1)}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {flex: 1},
  content: {gap: 10, paddingBottom: 24},
  toolbar: {alignItems: 'flex-end'},
  row: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  keyword: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  meta: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
  pager: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
});
