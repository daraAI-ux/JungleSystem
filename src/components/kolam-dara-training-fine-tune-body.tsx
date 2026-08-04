import React, {useEffect, useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  formatKolamDaraTrainingFineTuneSourceCounts,
  KOLAM_DARA_TRAINING_FINE_TUNE_DATASET_FILTERS,
  KOLAM_DARA_TRAINING_FINE_TUNE_SOURCE_LABELS,
  KOLAM_DARA_TRAINING_FINE_TUNE_STATUS_LABELS,
  resolveKolamDaraTrainingFineTuneStatusIntent,
  type KolamDaraTrainingFineTuneBenchmarkScenario,
  type KolamDaraTrainingFineTuneDatasetFilter,
  type KolamDaraTrainingFineTuneDatasetItem,
  type KolamDaraTrainingFineTuneRun,
  type KolamDaraTrainingFineTuneSummary,
} from '../domain/kolam-dara-training';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {ApiError} from '../lib/api-error';
import {
  exportKolamDaraTrainingFineTuneJsonl,
  fetchKolamDaraTrainingFineTuneBenchmark,
  fetchKolamDaraTrainingFineTuneSummary,
  importKolamDaraTrainingFineTuneCandidates,
  listKolamDaraTrainingFineTuneCandidates,
  listKolamDaraTrainingFineTuneDataset,
  listKolamDaraTrainingFineTuneRuns,
  updateKolamDaraTrainingFineTuneDatasetItem,
} from '../services/kolam-dara-training-api';
import {KolamButton} from './kolam-button';
import {KolamStatusBadge} from './kolam-status-badge';

const PAGE_SIZE = 10;

/** FE `DaraFineTuningTab`. */
export function KolamDaraTrainingFineTuneBody({
  canManage,
  refreshKey = 0,
}: {
  canManage: boolean;
  refreshKey?: number;
}) {
  const [summary, setSummary] =
    useState<KolamDaraTrainingFineTuneSummary | null>(null);
  const [candidates, setCandidates] = useState<
    KolamDaraTrainingFineTuneDatasetItem[]
  >([]);
  const [dataset, setDataset] = useState<KolamDaraTrainingFineTuneDatasetItem[]>(
    [],
  );
  const [benchmark, setBenchmark] = useState<
    KolamDaraTrainingFineTuneBenchmarkScenario[]
  >([]);
  const [runs, setRuns] = useState<KolamDaraTrainingFineTuneRun[]>([]);
  const [status, setStatus] =
    useState<KolamDaraTrainingFineTuneDatasetFilter>('all');
  const [candidatePage, setCandidatePage] = useState(1);
  const [datasetPage, setDatasetPage] = useState(1);
  const [datasetPages, setDatasetPages] = useState(1);
  const [benchmarkPage, setBenchmarkPage] = useState(1);
  const [runsPage, setRunsPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  const load = async (
    nextStatus: KolamDaraTrainingFineTuneDatasetFilter = status,
    nextDatasetPage = datasetPage,
  ) => {
    setLoading(true);
    try {
      const [s, c, d, b, r] = await Promise.all([
        fetchKolamDaraTrainingFineTuneSummary(),
        listKolamDaraTrainingFineTuneCandidates({limit: 200}),
        listKolamDaraTrainingFineTuneDataset({
          page: nextDatasetPage,
          limit: PAGE_SIZE,
          status: nextStatus,
        }),
        fetchKolamDaraTrainingFineTuneBenchmark(),
        listKolamDaraTrainingFineTuneRuns(),
      ]);
      setSummary(s);
      setCandidates(c);
      setDataset(d.rows);
      setDatasetPages(d.pages);
      setBenchmark(b.scenarios);
      setRuns(r);
      setNotice('');
    } catch (err) {
      setNotice(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal memuat Fine-tuning DARA',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [refreshKey, status, datasetPage]);

  const candidatePages = Math.max(1, Math.ceil(candidates.length / PAGE_SIZE));
  const benchmarkPages = Math.max(1, Math.ceil(benchmark.length / PAGE_SIZE));
  const runsPages = Math.max(1, Math.ceil(runs.length / PAGE_SIZE));

  const visibleCandidates = useMemo(
    () => slicePage(candidates, candidatePage, PAGE_SIZE),
    [candidates, candidatePage],
  );
  const visibleBenchmark = useMemo(
    () => slicePage(benchmark, benchmarkPage, PAGE_SIZE),
    [benchmark, benchmarkPage],
  );
  const visibleRuns = useMemo(
    () => slicePage(runs, runsPage, PAGE_SIZE),
    [runs, runsPage],
  );

  useEffect(() => {
    if (candidatePage > candidatePages) {
      setCandidatePage(candidatePages);
    }
  }, [candidatePage, candidatePages]);

  useEffect(() => {
    if (benchmarkPage > benchmarkPages) {
      setBenchmarkPage(benchmarkPages);
    }
  }, [benchmarkPage, benchmarkPages]);

  useEffect(() => {
    if (runsPage > runsPages) {
      setRunsPage(runsPages);
    }
  }, [runsPage, runsPages]);

  const importCandidates = async () => {
    setBusy('import');
    try {
      const res = await importKolamDaraTrainingFineTuneCandidates({limit: 120});
      setNotice(res.message);
      setCandidatePage(1);
      await load();
    } catch (err) {
      setNotice(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal import kandidat',
      );
    } finally {
      setBusy(null);
    }
  };

  const approveItem = async (id: string) => {
    setBusy(id);
    try {
      await updateKolamDaraTrainingFineTuneDatasetItem(id, {
        status: 'approved',
      });
      setNotice('Dataset item approved');
      await load();
    } catch {
      setNotice('Gagal approve dataset');
    } finally {
      setBusy(null);
    }
  };

  const exportJsonl = async () => {
    setBusy('export');
    try {
      const res = await exportKolamDaraTrainingFineTuneJsonl({minItems: 1});
      setNotice(res.message);
      await load();
    } catch (err) {
      setNotice(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal export JSONL',
      );
    } finally {
      setBusy(null);
    }
  };

  if (loading && !summary) {
    return <Text style={styles.meta}>Memuat Fine-tuning DARA…</Text>;
  }

  const approvedCount = summary?.approvedCount ?? 0;
  const blockedCount = summary?.blockedCount ?? 0;
  const benchmarkTotal = summary?.benchmarkTotal ?? benchmark.length;
  const minBenchmark = summary?.minBenchmarkRequired ?? 50;

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <View style={styles.headCopy}>
            <Text style={styles.sectionTitle}>Fine-tuning foundation</Text>
            <Text style={styles.meta}>
              Dataset dan registry optional untuk Team Chat / AI Room. Rule,
              tools, RAG, memory, quality guard, dan eval existing tetap menjadi
              jalur utama DARA.
            </Text>
          </View>
          {canManage ? (
            <View style={styles.headActions}>
              <KolamButton
                disabled={busy === 'import'}
                intent="secondary"
                label={busy === 'import' ? 'Import…' : 'Import kandidat'}
                onPress={() => {
                  void importCandidates();
                }}
                size="sm"
              />
              <KolamButton
                disabled={busy === 'export' || approvedCount < 1}
                label={busy === 'export' ? 'Export…' : 'Export JSONL'}
                onPress={() => {
                  void exportJsonl();
                }}
                size="sm"
              />
            </View>
          ) : null}
        </View>

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        <View style={styles.statGrid}>
          <StatBox
            hint={formatKolamDaraTrainingFineTuneSourceCounts(
              summary?.candidateSourceCounts || {},
            )}
            label="Dataset"
            value={summary?.datasetTotal ?? 0}
          />
          <StatBox
            label="Approved"
            tone={approvedCount > 0 ? 'ok' : 'warn'}
            value={approvedCount}
          />
          <StatBox
            hint="Secret/API key ditolak"
            label="Blocked"
            tone={blockedCount > 0 ? 'danger' : 'ok'}
            value={blockedCount}
          />
          <StatBox
            hint={`Minimum ${minBenchmark}`}
            label="Benchmark"
            tone={benchmarkTotal >= minBenchmark ? 'ok' : 'danger'}
            value={benchmarkTotal}
          />
          <StatBox
            hint={summary?.runtime.reason || 'env_disabled'}
            label="Runtime"
            tone={summary?.runtime.useFineTune ? 'warn' : 'ok'}
            value={summary?.runtime.useFineTune ? 'On' : 'Off'}
          />
        </View>
        <Text style={styles.meta}>
          Fine-tuned model tidak boleh menjadi sumber fakta bisnis. Jika model
          lambat, gagal, atau ditolak quality guard, DARA wajib fallback ke model
          lama.
        </Text>
      </View>

      <View style={styles.twoCol}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dataset kandidat</Text>
          <Text style={styles.meta}>
            Preview dari frasa, koreksi produk, review percakapan, eval, dan
            planner audit. Import tidak membuat rule baru.
          </Text>
          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.colSource]}>Sumber</Text>
            <Text style={[styles.th, styles.colInput]}>Input</Text>
            <Text style={[styles.th, styles.colValid]}>Validasi</Text>
          </View>
          {visibleCandidates.length === 0 ? (
            <Text style={styles.meta}>Tidak ada kandidat.</Text>
          ) : (
            visibleCandidates.map(row => (
              <View
                key={`${row.sourceType}:${row.sourceId}:${row.id}`}
                style={styles.tableRow}>
                <View style={styles.colSource}>
                  <KolamStatusBadge
                    intent="muted"
                    label={
                      KOLAM_DARA_TRAINING_FINE_TUNE_SOURCE_LABELS[
                        row.sourceType
                      ] || row.sourceType
                    }
                    numberOfLines={1}
                  />
                </View>
                <Text numberOfLines={2} style={[styles.td, styles.colInput]}>
                  {row.input || '—'}
                </Text>
                <View style={styles.colValid}>
                  <KolamStatusBadge
                    intent={resolveKolamDaraTrainingFineTuneStatusIntent(
                      row.validationStatus,
                    )}
                    label={
                      KOLAM_DARA_TRAINING_FINE_TUNE_STATUS_LABELS[
                        row.validationStatus
                      ] || row.validationStatus
                    }
                    numberOfLines={1}
                  />
                </View>
              </View>
            ))
          )}
          <TablePager
            onNext={() => setCandidatePage(page => page + 1)}
            onPrev={() => setCandidatePage(page => Math.max(1, page - 1))}
            page={candidatePage}
            pages={candidatePages}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sanitizer / validasi</Text>
          <Text style={styles.meta}>
            Dataset berisi PII disamarkan, sedangkan secret/API key/token
            diblokir sebelum training.
          </Text>
          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.colStatus]}>Status</Text>
            <Text style={[styles.th, styles.colInput]}>Contoh</Text>
            <Text style={[styles.th, styles.colValid]}>Validasi</Text>
            {canManage ? (
              <Text style={[styles.th, styles.colAction]}>Aksi</Text>
            ) : null}
          </View>
          {dataset.length === 0 ? (
            <Text style={styles.meta}>
              Belum ada dataset tersimpan. Import kandidat dulu.
            </Text>
          ) : (
            dataset.map(row => (
              <View key={row.id} style={styles.tableRow}>
                <View style={styles.colStatus}>
                  <KolamStatusBadge
                    intent={resolveKolamDaraTrainingFineTuneStatusIntent(
                      row.status,
                    )}
                    label={
                      KOLAM_DARA_TRAINING_FINE_TUNE_STATUS_LABELS[row.status] ||
                      row.status
                    }
                    numberOfLines={1}
                  />
                </View>
                <Text numberOfLines={2} style={[styles.td, styles.colInput]}>
                  {row.input || '—'}
                </Text>
                <View style={styles.colValid}>
                  <KolamStatusBadge
                    intent={resolveKolamDaraTrainingFineTuneStatusIntent(
                      row.validationStatus,
                    )}
                    label={
                      KOLAM_DARA_TRAINING_FINE_TUNE_STATUS_LABELS[
                        row.validationStatus
                      ] || row.validationStatus
                    }
                    numberOfLines={1}
                  />
                </View>
                {canManage ? (
                  <View style={styles.colAction}>
                    <KolamButton
                      disabled={
                        row.status === 'approved' ||
                        row.validationStatus === 'blocked' ||
                        busy === row.id
                      }
                      intent="secondary"
                      label="Approve"
                      onPress={() => {
                        void approveItem(row.id);
                      }}
                      size="sm"
                    />
                  </View>
                ) : null}
              </View>
            ))
          )}
          <View style={styles.filterRow}>
            {KOLAM_DARA_TRAINING_FINE_TUNE_DATASET_FILTERS.map(id => (
              <KolamButton
                key={id}
                intent={status === id ? 'primary' : 'secondary'}
                label={
                  KOLAM_DARA_TRAINING_FINE_TUNE_STATUS_LABELS[id] || id
                }
                onPress={() => {
                  setStatus(id);
                  setDatasetPage(1);
                }}
                size="sm"
              />
            ))}
          </View>
          <TablePager
            disabled={loading}
            onNext={() => setDatasetPage(page => page + 1)}
            onPrev={() => setDatasetPage(page => Math.max(1, page - 1))}
            page={datasetPage}
            pages={datasetPages}
          />
        </View>
      </View>

      <View style={styles.twoCol}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Eval benchmark</Text>
          <Text style={styles.meta}>
            Baseline minimal 50 skenario untuk memastikan fine-tune tidak
            merusak kemampuan DARA yang sudah ada.
          </Text>
          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.colIndex]}>#</Text>
            <Text style={[styles.th, styles.colQuery]}>Pertanyaan</Text>
            <Text style={[styles.th, styles.colExpect]}>Ekspektasi</Text>
          </View>
          {visibleBenchmark.length === 0 ? (
            <Text style={styles.meta}>Belum ada skenario benchmark.</Text>
          ) : (
            visibleBenchmark.map(row => (
              <View key={row.id} style={styles.tableRow}>
                <Text style={[styles.tdMuted, styles.colIndex]}>{row.index}</Text>
                <Text numberOfLines={2} style={[styles.td, styles.colQuery]}>
                  {row.query}
                </Text>
                <View style={styles.colExpect}>
                  <KolamStatusBadge
                    intent="muted"
                    label={row.expectedCapability || '—'}
                    numberOfLines={1}
                  />
                </View>
              </View>
            ))
          )}
          <TablePager
            onNext={() => setBenchmarkPage(page => page + 1)}
            onPrev={() => setBenchmarkPage(page => Math.max(1, page - 1))}
            page={benchmarkPage}
            pages={benchmarkPages}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Training runs / registry</Text>
          <Text style={styles.meta}>
            Registry model bersifat manual/offline sampai training real
            diaktifkan dan lolos quality gate.
          </Text>
          <View style={styles.tableHead}>
            <Text style={[styles.th, styles.colRun]}>Run</Text>
            <Text style={[styles.th, styles.colStatus]}>Status</Text>
            <Text style={[styles.th, styles.colModel]}>Model</Text>
            <Text style={[styles.th, styles.colRuntime]}>Runtime</Text>
          </View>
          {visibleRuns.length === 0 ? (
            <Text style={styles.meta}>
              Belum ada run. Export JSONL akan membuat run draft.
            </Text>
          ) : (
            visibleRuns.map(row => (
              <View key={row.id} style={styles.tableRow}>
                <Text numberOfLines={1} style={[styles.td, styles.colRun]}>
                  {row.runKey}
                </Text>
                <View style={styles.colStatus}>
                  <KolamStatusBadge
                    intent={row.status === 'succeeded' ? 'success' : 'muted'}
                    label={row.status}
                    numberOfLines={1}
                  />
                </View>
                <Text numberOfLines={1} style={[styles.tdMuted, styles.colModel]}>
                  {row.modelName || row.baseModel || '—'}
                </Text>
                <View style={styles.colRuntime}>
                  <KolamStatusBadge
                    intent={row.runtimeEligible ? 'warning' : 'muted'}
                    label={row.runtimeEligible ? 'Eligible' : 'Off'}
                    numberOfLines={1}
                  />
                </View>
              </View>
            ))
          )}
          <TablePager
            onNext={() => setRunsPage(page => page + 1)}
            onPrev={() => setRunsPage(page => Math.max(1, page - 1))}
            page={runsPage}
            pages={runsPages}
          />
        </View>
      </View>
    </View>
  );
}

function slicePage<T>(rows: T[], page: number, pageSize: number) {
  const start = (Math.max(1, page) - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

function TablePager({
  disabled = false,
  onNext,
  onPrev,
  page,
  pages,
}: {
  disabled?: boolean;
  onNext: () => void;
  onPrev: () => void;
  page: number;
  pages: number;
}) {
  if (pages <= 1) {
    return null;
  }

  return (
    <View style={styles.pager}>
      <KolamButton
        disabled={disabled || page <= 1}
        intent="secondary"
        label="Sebelumnya"
        onPress={onPrev}
        size="sm"
      />
      <Text style={styles.meta}>
        {page}/{pages}
      </Text>
      <KolamButton
        disabled={disabled || page >= pages}
        intent="secondary"
        label="Berikutnya"
        onPress={onNext}
        size="sm"
      />
    </View>
  );
}

function StatBox({
  hint,
  label,
  tone,
  value,
}: {
  hint?: string;
  label: string;
  tone?: 'ok' | 'warn' | 'danger';
  value: string | number;
}) {
  return (
    <View
      style={[
        styles.statBox,
        tone === 'ok' ? styles.statOk : null,
        tone === 'warn' ? styles.statWarn : null,
        tone === 'danger' ? styles.statDanger : null,
      ]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {hint ? <Text style={styles.statHint}>{hint}</Text> : null}
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
    flex: 1,
    gap: 10,
    minWidth: 280,
    padding: 12,
  },
  cardHead: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  headCopy: {flex: 1, flexShrink: 1, gap: 4, minWidth: 180},
  headActions: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
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
  twoCol: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBox: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    flexBasis: 120,
    minWidth: 110,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  statOk: {
    backgroundColor: V.colors.successSoft,
    borderColor: V.colors.success,
  },
  statWarn: {
    backgroundColor: V.colors.warningSoft,
    borderColor: V.colors.warning,
  },
  statDanger: {
    backgroundColor: V.colors.dangerSoft,
    borderColor: V.colors.danger,
  },
  statLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  statValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  statHint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  pager: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 4,
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
  tdMuted: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  colSource: {flex: 1, minWidth: 80},
  colInput: {flex: 1.6, minWidth: 100},
  colValid: {flex: 0.9, minWidth: 72},
  colStatus: {flex: 0.9, minWidth: 72},
  colAction: {flex: 0.8, minWidth: 80},
  colIndex: {flex: 0.35, minWidth: 28},
  colQuery: {flex: 1.6, minWidth: 100},
  colExpect: {flex: 1, minWidth: 80},
  colRun: {flex: 1.2, minWidth: 90},
  colModel: {flex: 1.2, minWidth: 90},
  colRuntime: {flex: 0.8, minWidth: 72},
});
