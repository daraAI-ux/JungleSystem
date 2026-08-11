import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { ApiError } from '../lib/api-error';
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
import { KolamButton } from './kolam-button';
import { KolamListTableComposition } from './kolam-list-table-composition';
import { KolamStatusBadge } from './kolam-status-badge';

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
  const [dataset, setDataset] = useState<
    KolamDaraTrainingFineTuneDatasetItem[]
  >([]);
  const [benchmark, setBenchmark] = useState<
    KolamDaraTrainingFineTuneBenchmarkScenario[]
  >([]);
  const [runs, setRuns] = useState<KolamDaraTrainingFineTuneRun[]>([]);
  const [status, setStatus] =
    useState<KolamDaraTrainingFineTuneDatasetFilter>('all');
  const [candidatePage, setCandidatePage] = useState(1);
  const [datasetPage, setDatasetPage] = useState(1);
  const [datasetTotal, setDatasetTotal] = useState(0);
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
        listKolamDaraTrainingFineTuneCandidates({ limit: 200 }),
        listKolamDaraTrainingFineTuneDataset({
          page: nextDatasetPage,
          limit: PAGE_SIZE,
          status: nextStatus,
        }),
        fetchKolamDaraTrainingFineTuneBenchmark(),
        listKolamDaraTrainingFineTuneRuns(),
      ]);
      setSummary(s);
      setCandidates(Array.isArray(c) ? c : []);
      setDataset(Array.isArray(d?.rows) ? d.rows : []);
      setDatasetTotal(
        Number(d?.total) || (Array.isArray(d?.rows) ? d.rows.length : 0),
      );
      setBenchmark(Array.isArray(b?.scenarios) ? b.scenarios : []);
      setRuns(Array.isArray(r) ? r : []);
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
      const res = await importKolamDaraTrainingFineTuneCandidates({
        limit: 120,
      });
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
      const res = await exportKolamDaraTrainingFineTuneJsonl({ minItems: 1 });
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
          lambat, gagal, atau ditolak quality guard, DARA wajib fallback ke
          model lama.
        </Text>
      </View>

      <View style={styles.twoCol}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dataset kandidat</Text>
          <Text style={styles.meta}>
            Preview dari frasa, koreksi produk, review percakapan, eval, dan
            planner audit. Import tidak membuat rule baru.
          </Text>
          <KolamListTableComposition
            columns={[
              {
                flex: 1,
                id: 'source',
                label: 'Sumber',
                render: row => (
                  <KolamStatusBadge
                    intent="muted"
                    label={
                      KOLAM_DARA_TRAINING_FINE_TUNE_SOURCE_LABELS[
                        row.sourceType
                      ] || row.sourceType
                    }
                    numberOfLines={1}
                  />
                ),
              },
              {
                flex: 1.6,
                id: 'input',
                label: 'Input',
                render: row => (
                  <Text numberOfLines={2} style={styles.td}>
                    {row.input || '-'}
                  </Text>
                ),
              },
              {
                flex: 0.9,
                id: 'validation',
                label: 'Validasi',
                render: row => (
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
                ),
              },
            ]}
            emptyTitle="Tidak ada kandidat."
            getRowKey={row => row.id}
            pagination={{
              onPageChange: setCandidatePage,
              page: candidatePage,
              pageSize: PAGE_SIZE,
              total: candidates.length,
            }}
            rows={visibleCandidates}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sanitizer / validasi</Text>
          <Text style={styles.meta}>
            Dataset berisi PII disamarkan, sedangkan secret/API key/token
            diblokir sebelum training.
          </Text>
          <KolamListTableComposition
            columns={[
              {
                flex: 0.9,
                id: 'status',
                label: 'Status',
                render: row => (
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
                ),
              },
              {
                flex: 1.6,
                id: 'input',
                label: 'Contoh',
                render: row => (
                  <Text numberOfLines={2} style={styles.td}>
                    {row.input || '-'}
                  </Text>
                ),
              },
              {
                flex: 0.9,
                id: 'validation',
                label: 'Validasi',
                render: row => (
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
                ),
              },
            ]}
            emptyTitle="Belum ada dataset tersimpan. Import kandidat dulu."
            getRowKey={row => row.id}
            loading={loading}
            pagination={{
              onPageChange: setDatasetPage,
              page: datasetPage,
              pageSize: PAGE_SIZE,
              total: datasetTotal,
            }}
            renderActions={
              canManage
                ? row => (
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
                  )
                : undefined
            }
            rows={dataset}
          />
          <View style={styles.filterRow}>
            {KOLAM_DARA_TRAINING_FINE_TUNE_DATASET_FILTERS.map(id => (
              <KolamButton
                key={id}
                intent={status === id ? 'primary' : 'secondary'}
                label={KOLAM_DARA_TRAINING_FINE_TUNE_STATUS_LABELS[id] || id}
                onPress={() => {
                  setStatus(id);
                  setDatasetPage(1);
                }}
                size="sm"
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.twoCol}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Eval benchmark</Text>
          <Text style={styles.meta}>
            Baseline minimal 50 skenario untuk memastikan fine-tune tidak
            merusak kemampuan DARA yang sudah ada.
          </Text>
          <KolamListTableComposition
            columns={[
              {
                align: 'center',
                flex: 0.35,
                id: 'index',
                label: '#',
                render: row => <Text style={styles.tdMuted}>{row.index}</Text>,
              },
              {
                flex: 1.6,
                id: 'query',
                label: 'Pertanyaan',
                render: row => (
                  <Text numberOfLines={2} style={styles.td}>
                    {row.query}
                  </Text>
                ),
              },
              {
                flex: 1,
                id: 'expectation',
                label: 'Ekspektasi',
                render: row => (
                  <KolamStatusBadge
                    intent="muted"
                    label={row.expectedCapability || '-'}
                    numberOfLines={1}
                  />
                ),
              },
            ]}
            emptyTitle="Belum ada skenario benchmark."
            getRowKey={row => row.id}
            pagination={{
              onPageChange: setBenchmarkPage,
              page: benchmarkPage,
              pageSize: PAGE_SIZE,
              total: benchmark.length,
            }}
            rows={visibleBenchmark}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Training runs / registry</Text>
          <Text style={styles.meta}>
            Registry model bersifat manual/offline sampai training real
            diaktifkan dan lolos quality gate.
          </Text>
          <KolamListTableComposition
            columns={[
              {
                flex: 1.2,
                id: 'run',
                label: 'Run',
                render: row => (
                  <Text numberOfLines={1} style={styles.td}>
                    {row.runKey}
                  </Text>
                ),
              },
              {
                flex: 0.9,
                id: 'status',
                label: 'Status',
                render: row => (
                  <KolamStatusBadge
                    intent={row.status === 'succeeded' ? 'success' : 'muted'}
                    label={row.status}
                    numberOfLines={1}
                  />
                ),
              },
              {
                flex: 1.2,
                id: 'model',
                label: 'Model',
                render: row => (
                  <Text numberOfLines={1} style={styles.tdMuted}>
                    {row.modelName || row.baseModel || '-'}
                  </Text>
                ),
              },
              {
                flex: 0.8,
                id: 'runtime',
                label: 'Runtime',
                render: row => (
                  <KolamStatusBadge
                    intent={row.runtimeEligible ? 'warning' : 'muted'}
                    label={row.runtimeEligible ? 'Eligible' : 'Off'}
                    numberOfLines={1}
                  />
                ),
              },
            ]}
            emptyTitle="Belum ada run. Export JSONL akan membuat run draft."
            getRowKey={row => row.id}
            pagination={{
              onPageChange: setRunsPage,
              page: runsPage,
              pageSize: PAGE_SIZE,
              total: runs.length,
            }}
            rows={visibleRuns}
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
      ]}
    >
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {hint ? <Text style={styles.statHint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 12 },
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
  headCopy: { flex: 1, flexShrink: 1, gap: 4, minWidth: 180 },
  headActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
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
});
