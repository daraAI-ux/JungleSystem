import React, {useMemo, useRef, useState} from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import type {
  KolamDaraSeoSentimentController,
  KolamDaraSeoSentimentFilter,
} from '../hooks/use-kolam-dara-seo-sentiment-controller';
import {formatKolamDaraSeoSentimentRelativeTime} from '../hooks/use-kolam-dara-seo-sentiment-controller';
import {KolamButton} from './kolam-button';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamTableFilterTrigger} from './kolam-table-filter-trigger';

const QUICK_CHIPS = ['Produk bagus', 'Pengiriman lambat', 'Harga terlalu mahal'];

const FILTER_OPTS: Array<{id: KolamDaraSeoSentimentFilter; label: string}> = [
  {id: 'all', label: 'Semua'},
  {id: 'positive', label: 'Positif'},
  {id: 'neutral', label: 'Netral'},
  {id: 'negative', label: 'Negatif'},
];

const SENTIMENT_LABEL: Record<string, string> = {
  positive: 'Positif',
  neutral: 'Netral',
  negative: 'Negatif',
};

const COL_SENTIMENT = 100;
const COL_SCORE = 72;
const COL_ANALYZER = 110;
const COL_TIME = 110;
const COL_ACTION = 88;
const ROW_PAD = 20;
const FIXED_COLS =
  COL_SENTIMENT + COL_SCORE + COL_ANALYZER + COL_TIME + COL_ACTION + ROW_PAD;

/**
 * FE parity: DA-Dara-Plugin `DaraSentimentDashboard` + `dara-seo-sentiment.tsx`.
 */
export function KolamDaraSeoSentimentBody({
  canDraft,
  controller,
}: {
  canDraft: boolean;
  controller: KolamDaraSeoSentimentController;
}) {
  const [bodyWidth, setBodyWidth] = useState(0);
  const toolbarRef = useRef<View>(null);
  const filterTriggerRef = useRef<View>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [panelAnchor, setPanelAnchor] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const tableWidth = Math.max(bodyWidth, 720);
  const commentWidth = useMemo(
    () => Math.max(200, tableWidth - FIXED_COLS),
    [tableWidth],
  );
  const filterLabel =
    FILTER_OPTS.find(item => item.id === controller.filter)?.label ?? 'Semua';
  const showTable = controller.filteredRows.length > 0;
  const {summary} = controller;

  const openFilter = () => {
    if (filterOpen) {
      setFilterOpen(false);
      return;
    }
    filterTriggerRef.current?.measureInWindow((x, y, _w, h) => {
      toolbarRef.current?.measureInWindow((tx, ty) => {
        setPanelAnchor({top: y - ty + h + 4, left: Math.max(0, x - tx)});
        setFilterOpen(true);
      });
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
      {canDraft ? (
        <View style={styles.llamaBar}>
          <KolamButton
            disabled={!controller.llamaEnabled}
            intent={controller.useLlm ? 'primary' : 'outline'}
            label="Gunakan Llama (AI)"
            onPress={() => controller.onSetUseLlm(!controller.useLlm)}
          />
        </View>
      ) : null}

      <View style={styles.layout}>
        <View style={styles.primary}>
          {canDraft ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Teks review / komentar</Text>
              <Text style={styles.cardHint}>
                Tempel ulasan pelanggan atau komentar media sosial di sini.
              </Text>
              <TextInput
                multiline
                onChangeText={controller.onSetText}
                placeholder="Tempel ulasan pelanggan atau komentar media sosial di sini..."
                placeholderTextColor={V.colors.mutedFg}
                style={styles.textarea}
                textAlignVertical="top"
                value={controller.text}
              />
              <View style={styles.chipsRow}>
                {QUICK_CHIPS.map(chip => (
                  <KolamButton
                    key={chip}
                    label={chip}
                    onPress={() => controller.onUseQuickChip(chip)}
                    style={styles.chip}
                  />
                ))}
                <KolamButton
                  label="Reset"
                  onPress={() => controller.onSetText('')}
                  style={styles.chip}
                />
              </View>
              <KolamButton
                disabled={controller.busy || !controller.text.trim()}
                intent="primary"
                label={
                  controller.busy ? 'Menganalisis…' : 'Analisis Sentimen'
                }
                onPress={() => {
                  void controller.onIngest();
                }}
              />
            </View>
          ) : null}

          {controller.notice ? (
            <Text style={styles.notice}>{controller.notice}</Text>
          ) : null}

          <View style={styles.card}>
            <View ref={toolbarRef} collapsable={false} style={styles.resultsHead}>
              <Text style={styles.cardTitle}>Hasil Analisis</Text>
              <View style={styles.resultsTools}>
                <Text style={styles.meta}>
                  {`${controller.filteredRows.length} item`}
                </Text>
                <View ref={filterTriggerRef} collapsable={false}>
                  <KolamTableFilterTrigger
                    active={filterOpen || controller.filter !== 'all'}
                    label={filterLabel}
                    onPress={openFilter}
                    open={filterOpen}
                    variant="quiet"
                  />
                </View>
                <KolamButton
                  disabled={controller.loading}
                  label="Refresh"
                  onPress={() => {
                    void controller.onRefresh();
                  }}
                />
              </View>
              {filterOpen && panelAnchor ? (
                <View
                  style={[
                    styles.filterOverlayPanel,
                    {top: panelAnchor.top, left: panelAnchor.left},
                  ]}>
                  {FILTER_OPTS.map(option => (
                    <KolamButton
                      intent={
                        controller.filter === option.id ? 'primary' : 'plain'
                      }
                      key={option.id}
                      label={option.label}
                      onPress={() => {
                        controller.onSetFilter(option.id);
                        setFilterOpen(false);
                      }}
                      style={styles.filterOption}
                    />
                  ))}
                  <KolamButton
                    label="Tutup"
                    onPress={() => setFilterOpen(false)}
                  />
                </View>
              ) : null}
            </View>

            {controller.loading && !controller.rows.length ? (
              <Text style={styles.emptyCenter}>Memuat data…</Text>
            ) : null}
            {controller.error && !controller.rows.length ? (
              <KolamEmptyState
                message={controller.error}
                title="Gagal memuat"
              />
            ) : null}
            {!controller.loading &&
            !controller.error &&
            !controller.filteredRows.length ? (
              <Text style={styles.emptyCenter}>Belum ada hasil analisis.</Text>
            ) : null}

            {showTable ? (
              <View
                onLayout={event => {
                  const next = Math.round(event.nativeEvent.layout.width);
                  if (next > 0) {
                    setBodyWidth(next);
                  }
                }}
                style={styles.tableWrap}>
                <View
                  style={[
                    styles.table,
                    bodyWidth > 0 ? {width: tableWidth} : null,
                  ]}>
                  <View style={styles.headerRow}>
                    <Text style={[styles.th, {width: commentWidth}]}>
                      Komentar
                    </Text>
                    <Text style={[styles.th, styles.colSentiment]}>
                      Sentimen
                    </Text>
                    <Text style={[styles.th, styles.colScore]}>Skor</Text>
                    <Text style={[styles.th, styles.colAnalyzer]}>
                      Analyzer
                    </Text>
                    <Text style={[styles.th, styles.colTime]}>Waktu</Text>
                    {canDraft ? (
                      <Text style={[styles.th, styles.colAction]}>Aksi</Text>
                    ) : null}
                  </View>
                  {controller.filteredRows.map(row => (
                    <View key={row.id} style={styles.bodyRow}>
                      <Text
                        numberOfLines={3}
                        style={[styles.td, {width: commentWidth}]}>
                        {row.text}
                      </Text>
                      <View style={styles.colSentiment}>
                        <View
                          style={[
                            styles.pill,
                            row.sentiment === 'positive'
                              ? styles.pillPositive
                              : row.sentiment === 'negative'
                                ? styles.pillNegative
                                : styles.pillNeutral,
                          ]}>
                          <Text
                            style={[
                              styles.pillText,
                              row.sentiment === 'positive'
                                ? styles.pillTextPositive
                                : row.sentiment === 'negative'
                                  ? styles.pillTextNegative
                                  : styles.pillTextNeutral,
                            ]}>
                            {SENTIMENT_LABEL[row.sentiment] ?? row.sentiment}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.scoreText,
                          styles.colScore,
                          row.sentimentScore >= 0
                            ? styles.scorePositive
                            : styles.scoreNegative,
                        ]}>
                        {row.sentimentScore > 0
                          ? `+${row.sentimentScore}`
                          : String(row.sentimentScore)}
                      </Text>
                      <Text style={[styles.meta, styles.colAnalyzer]}>
                        {row.analyzedBy || 'dara_rules'}
                      </Text>
                      <Text style={[styles.meta, styles.colTime]}>
                        {formatKolamDaraSeoSentimentRelativeTime(
                          row.detectedAt,
                        )}
                      </Text>
                      {canDraft ? (
                        <View style={styles.colAction}>
                          <KolamButton
                            disabled={controller.deletingId === row.id}
                            label="Hapus"
                            onPress={() => {
                              void controller.onDelete(row.id);
                            }}
                          />
                        </View>
                      ) : null}
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.aside}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ringkasan Sentimen</Text>
            <View style={styles.statGrid}>
              <StatCell
                label="Positif"
                pct={summary.positivePct}
                tone="good"
                value={summary.positive}
              />
              <StatCell
                label="Netral"
                pct={summary.neutralPct}
                tone="warn"
                value={summary.neutral}
              />
              <StatCell
                label="Negatif"
                pct={summary.negativePct}
                tone="bad"
                value={summary.negative}
              />
              <StatCell label="Total" value={summary.total} />
            </View>
            <Text style={styles.distLabel}>Distribusi Sentimen</Text>
            <View style={styles.stackedBar}>
              <View
                style={[
                  styles.stackedSeg,
                  styles.stackedGood,
                  {width: `${summary.positivePct}%`},
                ]}
              />
              <View
                style={[
                  styles.stackedSeg,
                  styles.stackedWarn,
                  {width: `${summary.neutralPct}%`},
                ]}
              />
              <View
                style={[
                  styles.stackedSeg,
                  styles.stackedBad,
                  {width: `${summary.negativePct}%`},
                ]}
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ringkasan DARA</Text>
            <Text style={styles.daraSummary}>{summary.daraSummary}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Topik Utama</Text>
            {summary.topics.map(topic => (
              <View key={topic.title} style={styles.topicBlock}>
                <View style={styles.topicHead}>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                  <Text style={styles.topicPct}>{`${topic.pct}%`}</Text>
                </View>
                <View style={styles.topicTrack}>
                  <View
                    style={[
                      styles.topicFill,
                      {width: `${Math.max(topic.pct, 4)}%`},
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function StatCell({
  label,
  pct,
  tone,
  value,
}: {
  label: string;
  pct?: number;
  tone?: 'good' | 'warn' | 'bad';
  value: number;
}) {
  return (
    <View style={styles.statCell}>
      <Text
        style={[
          styles.statValue,
          tone === 'good'
            ? styles.statGood
            : tone === 'warn'
              ? styles.statWarn
              : tone === 'bad'
                ? styles.statBad
                : null,
        ]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>
        {pct != null ? `${label} · ${pct}%` : label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {flex: 1},
  content: {gap: 12, paddingBottom: 24},
  llamaBar: {
    alignItems: 'flex-end',
  },
  layout: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
  },
  primary: {
    flexBasis: 420,
    flexGrow: 2,
    gap: 12,
    minWidth: 0,
  },
  aside: {
    flexBasis: 280,
    flexGrow: 1,
    gap: 12,
    minWidth: 260,
  },
  card: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    padding: 12,
    width: '100%',
  },
  cardTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  cardHint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  textarea: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    minHeight: 120,
    paddingHorizontal: 10,
    paddingVertical: 10,
    width: '100%',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    alignSelf: 'flex-start',
  },
  notice: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
  resultsHead: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 20,
  },
  resultsTools: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOverlayPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 1200,
    gap: 4,
    padding: 6,
    position: 'absolute',
    width: 180,
    zIndex: 120000,
  },
  filterOption: {justifyContent: 'flex-start'},
  meta: {color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12},
  emptyCenter: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    paddingVertical: 24,
    textAlign: 'center',
  },
  tableWrap: {
    alignSelf: 'stretch',
    width: '100%',
  },
  table: {
    alignSelf: 'stretch',
    width: '100%',
  },
  headerRow: {
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
  td: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    paddingRight: 8,
  },
  colSentiment: {width: COL_SENTIMENT},
  colScore: {width: COL_SCORE},
  colAnalyzer: {width: COL_ANALYZER},
  colTime: {width: COL_TIME},
  colAction: {width: COL_ACTION},
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillPositive: {backgroundColor: V.colors.successSoft},
  pillNeutral: {backgroundColor: V.colors.warningSoft},
  pillNegative: {backgroundColor: V.colors.dangerSoft},
  pillText: {
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  pillTextPositive: {color: V.colors.success},
  pillTextNeutral: {color: V.colors.warning},
  pillTextNegative: {color: V.colors.danger},
  scoreText: {
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  scorePositive: {color: V.colors.success},
  scoreNegative: {color: V.colors.danger},
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCell: {
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 20,
    fontWeight: '700',
  },
  statGood: {color: V.colors.success},
  statWarn: {color: V.colors.warning},
  statBad: {color: V.colors.danger},
  statLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    marginTop: 4,
  },
  distLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  stackedBar: {
    backgroundColor: V.colors.muted,
    borderRadius: 999,
    flexDirection: 'row',
    height: 10,
    overflow: 'hidden',
    width: '100%',
  },
  stackedSeg: {height: 10},
  stackedGood: {backgroundColor: V.colors.success},
  stackedWarn: {backgroundColor: V.colors.warning},
  stackedBad: {backgroundColor: V.colors.danger},
  daraSummary: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 18,
  },
  topicBlock: {gap: 4},
  topicHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topicTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  topicPct: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  topicTrack: {
    backgroundColor: V.colors.muted,
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
  topicFill: {
    backgroundColor: V.colors.primary,
    borderRadius: 999,
    height: 8,
  },
});
