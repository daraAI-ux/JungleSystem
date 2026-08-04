import React from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {formatKolamDaraSeoMentionSource} from '../domain/kolam-dara-seo';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamDaraSeoMentionsController} from '../hooks/use-kolam-dara-seo-mentions-controller';
import {KolamButton} from './kolam-button';
import {KolamEmptyState} from './kolam-empty-state';

export function KolamDaraSeoMentionsBody({
  canDraft,
  controller,
}: {
  canDraft: boolean;
  controller: KolamDaraSeoMentionsController;
}) {
  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      {canDraft ? (
        <View style={styles.ingestCard}>
          <Text style={styles.ingestTitle}>Tambah data</Text>
          <View style={styles.ingestBlock}>
            <Text style={styles.ingestLabel}>Keyword SERP</Text>
            <TextInput
              onChangeText={controller.onSetKeyword}
              placeholder="nama produk / brand"
              placeholderTextColor={V.colors.mutedFg}
              style={styles.input}
              value={controller.keyword}
            />
            <KolamButton
              disabled={controller.busy}
              intent="primary"
              label="Fetch SERP"
              onPress={() => {
                void controller.onFetchSerp();
              }}
            />
          </View>
          <View style={styles.ingestBlock}>
            <Text style={styles.ingestLabel}>Kompetitor</Text>
            <TextInput
              onChangeText={controller.onSetCompetitor}
              placeholder="Brand kompetitor"
              placeholderTextColor={V.colors.mutedFg}
              style={styles.input}
              value={controller.competitor}
            />
            <KolamButton
              disabled={controller.busy}
              label="Tambah kompetitor"
              onPress={() => {
                void controller.onIngestCompetitor();
              }}
            />
          </View>
          <View style={styles.ingestBlock}>
            <Text style={styles.ingestLabel}>Backlink</Text>
            <TextInput
              onChangeText={controller.onSetBacklinkUrl}
              placeholder="https://..."
              placeholderTextColor={V.colors.mutedFg}
              style={styles.input}
              value={controller.backlinkUrl}
            />
            <KolamButton
              disabled={controller.busy}
              label="Tambah backlink"
              onPress={() => {
                void controller.onIngestBacklink();
              }}
            />
          </View>
        </View>
      ) : null}

      {controller.notice ? (
        <Text style={styles.notice}>{controller.notice}</Text>
      ) : null}

      {controller.loading && !controller.rows.length ? (
        <Text style={styles.meta}>Memuat…</Text>
      ) : null}
      {controller.error && !controller.rows.length ? (
        <KolamEmptyState message={controller.error} title="Gagal memuat" />
      ) : null}
      {!controller.loading && !controller.error && !controller.rows.length ? (
        <KolamEmptyState
          message="Gunakan form di atas untuk menambah SERP, kompetitor, atau backlink."
          title="Belum ada data"
        />
      ) : null}

      {controller.rows.map(row => (
        <View key={row.id} style={styles.row}>
          <Text style={styles.rowTitle}>{row.entityName}</Text>
          <Text style={styles.meta}>
            {`${formatKolamDaraSeoMentionSource(
              row.sourceType,
              row.sourceName,
            )} · ${row.engine || '—'}`}
          </Text>
          <Text numberOfLines={2} style={styles.snippet}>
            {row.snippet || '—'}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {flex: 1},
  content: {gap: 10, paddingBottom: 24},
  ingestCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  ingestTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  ingestBlock: {gap: 6},
  ingestLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  notice: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
  meta: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
  row: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  rowTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  snippet: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
});
