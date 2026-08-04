import React, {useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {formatKolamDaraSeoMentionSource} from '../domain/kolam-dara-seo';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamDaraSeoMentionsController} from '../hooks/use-kolam-dara-seo-mentions-controller';
import {KolamButton} from './kolam-button';
import {KolamCatalogListTableShell} from './kolam-catalog-list-table-shell';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamStatusBadge} from './kolam-status-badge';

const COL_SUMBER = 120;
const COL_ENGINE = 100;
const ROW_PAD = 20;
const FIXED_COLS = COL_SUMBER + COL_ENGINE + ROW_PAD;

/**
 * FE parity: DA-Dara-Plugin `dara-seo-mentions.tsx`
 * Entitas / Sumber / Engine / Snippet + client page size 10.
 * Reuses KolamCatalogListTableShell (same chrome as Keywords / Species lists).
 */
export function KolamDaraSeoMentionsBody({
  canDraft,
  controller,
}: {
  canDraft: boolean;
  controller: KolamDaraSeoMentionsController;
}) {
  const [bodyWidth, setBodyWidth] = useState(0);
  const showTable = controller.pagedItems.length > 0;
  const tableWidth = Math.max(bodyWidth, 640);
  const flexibleWidths = useMemo(() => {
    const remaining = Math.max(320, tableWidth - FIXED_COLS);
    const entityWidth = Math.max(160, Math.round(remaining * 0.38));
    const snippetWidth = Math.max(160, remaining - entityWidth);
    return {entityWidth, snippetWidth};
  }, [tableWidth]);

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      {canDraft ? (
        <View style={styles.ingestCard}>
          <Text style={styles.ingestTitle}>Tambah data</Text>
          <View style={styles.ingestRow}>
            <View style={styles.ingestBox}>
              <Text style={styles.ingestLabel}>Keyword SERP</Text>
              <Text style={styles.ingestHint}>
                Ambil snapshot ranking untuk keyword produk/brand.
              </Text>
              <TextInput
                editable={!controller.busy}
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
                style={styles.ingestAction}
              />
            </View>
            <View style={styles.ingestBox}>
              <Text style={styles.ingestLabel}>Kompetitor</Text>
              <Text style={styles.ingestHint}>
                Catat nama brand pesaing untuk monitoring.
              </Text>
              <TextInput
                editable={!controller.busy}
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
                style={styles.ingestAction}
              />
            </View>
            <View style={styles.ingestBox}>
              <Text style={styles.ingestLabel}>Backlink</Text>
              <Text style={styles.ingestHint}>
                Simpan URL halaman yang link ke website/toko Anda.
              </Text>
              <TextInput
                editable={!controller.busy}
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
                style={styles.ingestAction}
              />
            </View>
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
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            Belum ada data. Gunakan form di atas untuk menambah SERP, kompetitor,
            atau backlink.
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
          }
          onBodyWidthChange={setBodyWidth}
          style={styles.tableShell}>
          <View
            style={[styles.table, bodyWidth > 0 ? {width: tableWidth} : null]}>
            <View style={styles.headerRow}>
              <Text style={[styles.th, {width: flexibleWidths.entityWidth}]}>
                Entitas
              </Text>
              <Text style={[styles.th, styles.colSumber]}>Sumber</Text>
              <Text style={[styles.th, styles.colEngine]}>Engine</Text>
              <Text style={[styles.th, {width: flexibleWidths.snippetWidth}]}>
                Snippet
              </Text>
            </View>
            {controller.pagedItems.map(row => (
              <View key={row.id} style={styles.bodyRow}>
                <View
                  style={[
                    styles.entityCell,
                    {width: flexibleWidths.entityWidth},
                  ]}>
                  <Text numberOfLines={2} style={styles.entityText}>
                    {row.entityName}
                  </Text>
                </View>
                <View style={styles.colSumber}>
                  <KolamStatusBadge
                    intent="secondary"
                    label={formatKolamDaraSeoMentionSource(
                      row.sourceType,
                      row.sourceName,
                    )}
                  />
                </View>
                <Text style={[styles.engineText, styles.colEngine]}>
                  {row.engine || '—'}
                </Text>
                <Text
                  numberOfLines={2}
                  style={[
                    styles.snippetText,
                    {width: flexibleWidths.snippetWidth},
                  ]}>
                  {row.snippet || '—'}
                </Text>
              </View>
            ))}
          </View>
        </KolamCatalogListTableShell>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {flex: 1},
  content: {gap: 12, paddingBottom: 24},
  ingestCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    padding: 12,
    width: '100%',
  },
  ingestTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  ingestRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  ingestBox: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 8,
    minWidth: 0,
    padding: 12,
  },
  ingestLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  ingestHint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    lineHeight: 15,
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
    width: '100%',
  },
  ingestAction: {
    alignSelf: 'stretch',
  },
  notice: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
  meta: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
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
  tableShell: {
    alignSelf: 'stretch',
    width: '100%',
  },
  table: {
    alignSelf: 'stretch',
    width: '100%',
  },
  headerRow: {
    alignSelf: 'stretch',
    backgroundColor: V.colors.muted,
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: '100%',
  },
  bodyRow: {
    alignItems: 'center',
    alignSelf: 'stretch',
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    width: '100%',
  },
  th: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  colSumber: {
    width: COL_SUMBER,
  },
  colEngine: {
    width: COL_ENGINE,
  },
  entityCell: {
    paddingRight: 10,
  },
  entityText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  engineText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  snippetText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    paddingRight: 4,
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
