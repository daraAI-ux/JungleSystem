import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {
  formatKolamDaraTrainingDateTime,
  type KolamDaraTrainingFeedback,
  type KolamDaraTrainingStats,
} from '../domain/kolam-dara-training';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {ApiError} from '../lib/api-error';
import {
  listKolamDaraTrainingFeedback,
  runKolamDaraTrainingProductRerank,
} from '../services/kolam-dara-training-api';
import {KolamButton} from './kolam-button';

/** FE `DaraTrainingPage` tab products (Koreksi produk + run rerank). */
export function KolamDaraTrainingProductsBody({
  canManage,
  onStatsRefresh,
  refreshKey = 0,
  stats,
}: {
  canManage: boolean;
  onStatsRefresh?: () => Promise<void>;
  refreshKey?: number;
  stats: KolamDaraTrainingStats | null;
}) {
  const [rows, setRows] = useState<KolamDaraTrainingFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [trainLog, setTrainLog] = useState('');
  const [notice, setNotice] = useState('');

  const feedbackCount = stats?.feedbackCount ?? 0;
  const minPoc = stats?.minSamplesPoc ?? 5;
  const minFull = stats?.minSamplesDefault ?? 50;
  const feedbackReady = feedbackCount >= minPoc;
  const feedbackFull = feedbackCount >= minFull;

  const load = async () => {
    setLoading(true);
    try {
      setRows(await listKolamDaraTrainingFeedback({page: 1, limit: 20}));
      setNotice('');
    } catch (err) {
      setRows([]);
      setNotice(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal memuat feedback',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [refreshKey]);

  const runTraining = async (poc: boolean) => {
    setTraining(true);
    setTrainLog('');
    setNotice('');
    try {
      const res = await runKolamDaraTrainingProductRerank({
        poc,
        minSamples: poc ? 5 : undefined,
      });
      const log = [res.stdout, res.stderr].filter(Boolean).join('\n');
      setTrainLog(log || res.message);
      setNotice(res.message || (res.success ? 'Selesai' : 'Gagal'));
      if (res.success) {
        await onStatsRefresh?.();
        await load();
      }
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Training gagal dijalankan';
      setNotice(msg);
      setTrainLog(msg);
    } finally {
      setTraining(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <View style={styles.headCopy}>
            <Text style={styles.sectionTitle}>Training ranking produk</Text>
            <Text style={styles.meta}>
              Menggunakan feedback CS dari Inbox + log pencarian untuk melatih
              ulang ranking produk (XGBoost).
            </Text>
          </View>
          {canManage ? (
            <View style={styles.headActions}>
              <KolamButton
                disabled={training || !feedbackReady}
                intent="secondary"
                label={training ? 'Menjalankan…' : 'Training POC (≥5)'}
                onPress={() => {
                  void runTraining(true);
                }}
                size="sm"
              />
              <KolamButton
                disabled={
                  training || !feedbackFull || !stats?.hasSearchRankLog
                }
                label={training ? 'Menjalankan…' : 'Training penuh (≥50)'}
                onPress={() => {
                  void runTraining(false);
                }}
                size="sm"
              />
            </View>
          ) : null}
        </View>
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        {trainLog ? (
          <ScrollView style={styles.logBox}>
            <Text style={styles.logText}>{trainLog}</Text>
          </ScrollView>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Riwayat koreksi produk</Text>
        <Text style={styles.meta}>
          Label dari form feedback di Inbox saat CS memperbaiki produk yang
          disarankan DARA.
        </Text>
        {loading ? (
          <Text style={styles.meta}>Memuat…</Text>
        ) : rows.length === 0 ? (
          <Text style={styles.meta}>
            Belum ada koreksi. Staff bisa menandai produk benar dari balasan
            DARA di modul Inbox.
          </Text>
        ) : (
          <>
            <View style={styles.tableHead}>
              <Text style={[styles.th, styles.colQuery]}>Pertanyaan</Text>
              <Text style={[styles.th, styles.colSuggested]}>DARA sarankan</Text>
              <Text style={[styles.th, styles.colCorrect]}>Produk benar</Text>
              <Text style={[styles.th, styles.colTime]}>Waktu</Text>
            </View>
            {rows.map(row => (
              <View key={row.id} style={styles.tableRow}>
                <Text
                  numberOfLines={2}
                  style={[styles.td, styles.colQuery]}>
                  {row.query}
                </Text>
                <Text
                  numberOfLines={2}
                  style={[styles.tdMuted, styles.colSuggested]}>
                  {row.suggestedProductName || '—'}
                </Text>
                <Text
                  numberOfLines={2}
                  style={[styles.tdStrong, styles.colCorrect]}>
                  {row.correctSku
                    ? `${row.correctProductName} (${row.correctSku})`
                    : row.correctProductName}
                </Text>
                <Text style={[styles.tdMuted, styles.colTime]}>
                  {formatKolamDaraTrainingDateTime(row.createdAt)}
                </Text>
              </View>
            ))}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {gap: 12},
  card: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  cardHead: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  headCopy: {
    flex: 1,
    flexShrink: 1,
    gap: 4,
    minWidth: 180,
  },
  headActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  meta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  notice: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  logBox: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    maxHeight: 176,
    padding: 10,
  },
  logText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    lineHeight: 16,
  },
  tableHead: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 6,
  },
  tableRow: {
    alignItems: 'flex-start',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 8,
  },
  th: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  td: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  tdStrong: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  tdMuted: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  colQuery: {flex: 1.4, minWidth: 100},
  colSuggested: {flex: 1.2, minWidth: 90},
  colCorrect: {flex: 1.4, minWidth: 110},
  colTime: {flex: 1, minWidth: 88},
});
