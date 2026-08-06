import React from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {
  formatKolamDaraSeoMentionSource,
  KOLAM_DARA_SEO_MENTIONS_PAGE_SIZE,
  type KolamDaraSeoMentionRow,
} from '../domain/kolam-dara-seo';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {KolamDaraSeoMentionsController} from '../hooks/use-kolam-dara-seo-mentions-controller';
import {KolamButton} from './kolam-button';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamListTableComposition} from './kolam-list-table-composition';
import {KolamStatusBadge} from './kolam-status-badge';

/**
 * FE parity: DA-Dara-Plugin `dara-seo-mentions.tsx`
 * Entitas / Sumber / Engine / Snippet + client page size 10.
 */
export function KolamDaraSeoMentionsBody({
  canDraft,
  controller,
}: {
  canDraft: boolean;
  controller: KolamDaraSeoMentionsController;
}) {
  const showTable = controller.pagedItems.length > 0;

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
        <Text style={styles.meta}>Memuat...</Text>
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
        <KolamListTableComposition
          columns={[
            {
              flex: 1.4,
              id: 'entity',
              label: 'Entitas',
              render: row => (
                <Text numberOfLines={2} style={styles.entityText}>
                  {row.entityName}
                </Text>
              ),
            },
            {
              align: 'center',
              flex: 0.8,
              id: 'source',
              label: 'Sumber',
              render: row => <MentionSourceBadge row={row} />,
            },
            {
              align: 'center',
              flex: 0.7,
              id: 'engine',
              label: 'Engine',
              render: row => (
                <Text style={styles.engineText}>{row.engine || '—'}</Text>
              ),
            },
            {
              flex: 1.8,
              id: 'snippet',
              label: 'Snippet',
              render: row => (
                <Text numberOfLines={2} style={styles.snippetText}>
                  {row.snippet || '—'}
                </Text>
              ),
            },
          ]}
          getRowKey={row => row.id}
          pagination={{
            onPageChange: controller.onSetPage,
            page: controller.page,
            pageSize: KOLAM_DARA_SEO_MENTIONS_PAGE_SIZE,
            total: controller.total,
          }}
          rows={controller.pagedItems}
          style={styles.tableShell}
        />
      ) : null}
    </ScrollView>
  );
}

function MentionSourceBadge({row}: {row: KolamDaraSeoMentionRow}) {
  return (
    <KolamStatusBadge
      intent="secondary"
      label={formatKolamDaraSeoMentionSource(row.sourceType, row.sourceName)}
      style={styles.centerBadge}
    />
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
  entityText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  centerBadge: {
    alignSelf: 'center',
  },
  engineText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    textAlign: 'center',
  },
  snippetText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    paddingRight: 4,
  },
});
