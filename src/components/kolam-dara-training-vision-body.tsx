import React, {useCallback, useEffect, useState} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  formatKolamDaraTrainingVisionDateTime,
  KOLAM_DARA_TRAINING_VISION_MATCH_LABELS,
  KOLAM_DARA_TRAINING_VISION_SECTIONS,
  resolveKolamDaraTrainingVisionMatchIntent,
  type KolamDaraTrainingVisionBaselineKpi,
  type KolamDaraTrainingVisionEvalMetric,
  type KolamDaraTrainingVisionEvalRun,
  type KolamDaraTrainingVisionFeedback,
  type KolamDaraTrainingVisionFeedbackKind,
  type KolamDaraTrainingVisionFeedbackQueueItem,
  type KolamDaraTrainingVisionHardNegative,
  type KolamDaraTrainingVisionPhoto,
  type KolamDaraTrainingVisionProduct,
  type KolamDaraTrainingVisionSectionId,
  type KolamDaraTrainingVisionSpecies,
  type KolamDaraTrainingVisionStats,
} from '../domain/kolam-dara-training-vision';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {ApiError} from '../lib/api-error';
import {
  addKolamDaraTrainingVisionHardNegative,
  addKolamDaraTrainingVisionProductPhoto,
  addKolamDaraTrainingVisionSpeciesPhoto,
  backfillKolamDaraTrainingVisionClip,
  deleteKolamDaraTrainingVisionPhoto,
  evalKolamDaraTrainingVisionYolo,
  exportKolamDaraTrainingVisionYolo,
  exportKolamDaraTrainingVisionYoloProducts,
  fetchKolamDaraTrainingVisionBaselineKpi,
  fetchKolamDaraTrainingVisionLatestEvalRun,
  fetchKolamDaraTrainingVisionStats,
  importKolamDaraTrainingVisionFeedback,
  importKolamDaraTrainingVisionFeedbackQueueItem,
  listKolamDaraTrainingVisionEvalRuns,
  listKolamDaraTrainingVisionFeedback,
  listKolamDaraTrainingVisionFeedbackQueue,
  listKolamDaraTrainingVisionHardNegatives,
  listKolamDaraTrainingVisionProductPhotos,
  listKolamDaraTrainingVisionProducts,
  listKolamDaraTrainingVisionSpecies,
  listKolamDaraTrainingVisionSpeciesPhotos,
  rebuildKolamDaraTrainingVisionClipIndex,
  resolveKolamDaraTrainingVisionImageUri,
  runKolamDaraTrainingVisionHoldoutEval,
  trainKolamDaraTrainingVisionYolo,
  trainKolamDaraTrainingVisionYoloProducts,
} from '../services/kolam-dara-training-vision-api';
import {KolamButton} from './kolam-button';
import {KolamDropdownSelect} from './kolam-dropdown-select';
import {KolamModalBackdrop} from './kolam-modal-backdrop';
import {KolamRemoteImage} from './kolam-remote-image';
import {KolamStatusBadge} from './kolam-status-badge';

const THUMB = {width: 48, height: 48, borderRadius: 6} as const;

function StatBox({
  hint,
  label,
  value,
}: {
  hint?: string;
  label: string;
  value: string | number;
}) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {hint ? <Text style={styles.statHint}>{hint}</Text> : null}
    </View>
  );
}

/** Plain scannable row — no tile/box chrome. */
function PipelineField({
  hint,
  label,
  value,
}: {
  hint?: string;
  label: string;
  value: string | number;
}) {
  return (
    <View style={styles.pipelineField}>
      <Text style={styles.pipelineFieldLabel}>{label}</Text>
      <View style={styles.pipelineFieldRight}>
        <Text style={styles.pipelineFieldValue}>{value}</Text>
        {hint ? <Text style={styles.pipelineFieldHint}>{hint}</Text> : null}
      </View>
    </View>
  );
}

function EvalMetricBox({
  hint,
  metric,
  title,
}: {
  hint?: string;
  metric: KolamDaraTrainingVisionEvalMetric | null;
  title: string;
}) {
  const err = metric?.error?.trim();
  const hasScore = (metric?.total ?? 0) > 0;
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{title}</Text>
      {err && !hasScore ? (
        <Text style={styles.statWarn}>{err}</Text>
      ) : (
        <Text style={styles.statValue}>
          {hasScore ? `${metric?.accuracy ?? 0}%` : '—'}
        </Text>
      )}
      {hasScore ? (
        <Text style={styles.statHint}>
          {metric?.correct}/{metric?.total} benar
        </Text>
      ) : null}
      {hint ? <Text style={styles.statHint}>{hint}</Text> : null}
    </View>
  );
}

function clipJobLabel(job: KolamDaraTrainingVisionStats['clipIndexJob']) {
  if (job?.status === 'running') {
    return 'Berjalan';
  }
  if (job?.status === 'done') {
    return 'Selesai';
  }
  if (job?.status === 'failed') {
    return 'Gagal';
  }
  return 'Idle';
}

/** FE `DaraTrainingVisionTab`. */
export function KolamDaraTrainingVisionBody({
  canManage,
  refreshKey = 0,
}: {
  canManage: boolean;
  refreshKey?: number;
}) {
  const [section, setSection] =
    useState<KolamDaraTrainingVisionSectionId>('ringkasan');
  const [stats, setStats] = useState<KolamDaraTrainingVisionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [speciesRows, setSpeciesRows] = useState<
    KolamDaraTrainingVisionSpecies[]
  >([]);
  const [speciesPage, setSpeciesPage] = useState(1);
  const [speciesPages, setSpeciesPages] = useState(1);
  const [speciesQ, setSpeciesQ] = useState('');
  const [speciesSearch, setSpeciesSearch] = useState('');
  const [selectedSpecies, setSelectedSpecies] =
    useState<KolamDaraTrainingVisionSpecies | null>(null);
  const [speciesPhotos, setSpeciesPhotos] = useState<
    KolamDaraTrainingVisionPhoto[]
  >([]);
  const [productRows, setProductRows] = useState<
    KolamDaraTrainingVisionProduct[]
  >([]);
  const [productPage, setProductPage] = useState(1);
  const [productPages, setProductPages] = useState(1);
  const [productQ, setProductQ] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] =
    useState<KolamDaraTrainingVisionProduct | null>(null);
  const [productPhotos, setProductPhotos] = useState<
    KolamDaraTrainingVisionPhoto[]
  >([]);
  const [feedbackRows, setFeedbackRows] = useState<
    KolamDaraTrainingVisionFeedback[]
  >([]);
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [feedbackPages, setFeedbackPages] = useState(1);
  const [feedbackQ, setFeedbackQ] = useState('');
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [feedbackKind, setFeedbackKind] =
    useState<KolamDaraTrainingVisionFeedbackKind>('all');
  const [hardNegatives, setHardNegatives] = useState<
    KolamDaraTrainingVisionHardNegative[]
  >([]);
  const [feedbackQueue, setFeedbackQueue] = useState<
    KolamDaraTrainingVisionFeedbackQueueItem[]
  >([]);
  const [yoloEvalNotice, setYoloEvalNotice] = useState('');
  const [evalRun, setEvalRun] = useState<KolamDaraTrainingVisionEvalRun | null>(
    null,
  );
  const [evalHistory, setEvalHistory] = useState<
    KolamDaraTrainingVisionEvalRun[]
  >([]);
  const [baselineKpi, setBaselineKpi] =
    useState<KolamDaraTrainingVisionBaselineKpi | null>(null);
  const [baselineDays, setBaselineDays] = useState(30);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [addKey, setAddKey] = useState('');
  const [negKey, setNegKey] = useState('');
  const [negType, setNegType] = useState('lainnya');
  const [photoSaving, setPhotoSaving] = useState(false);

  const clipJob = stats?.clipIndexJob;
  const clipJobRunning = clipJob?.status === 'running';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [st, sp, pr, fb, hn, fq, latestEval, evalRuns, baseline] =
        await Promise.all([
          fetchKolamDaraTrainingVisionStats(),
          listKolamDaraTrainingVisionSpecies({
            page: speciesPage,
            q: speciesSearch,
          }),
          listKolamDaraTrainingVisionProducts({
            page: productPage,
            q: productSearch,
          }),
          listKolamDaraTrainingVisionFeedback({
            page: feedbackPage,
            limit: 20,
            q: feedbackSearch,
            entityKind: feedbackKind,
          }),
          listKolamDaraTrainingVisionHardNegatives(),
          listKolamDaraTrainingVisionFeedbackQueue(30),
          fetchKolamDaraTrainingVisionLatestEvalRun().catch(() => null),
          listKolamDaraTrainingVisionEvalRuns(8).catch(() => []),
          fetchKolamDaraTrainingVisionBaselineKpi(baselineDays).catch(
            () => null,
          ),
        ]);
      setStats(st);
      setSpeciesRows(sp.rows);
      setSpeciesPages(sp.pages);
      setProductRows(pr.rows);
      setProductPages(pr.pages);
      setFeedbackRows(fb.rows);
      setFeedbackPages(fb.pages);
      setHardNegatives(hn);
      setFeedbackQueue(fq);
      setEvalRun(latestEval);
      setEvalHistory(evalRuns);
      setBaselineKpi(baseline);
      setNotice('');
    } catch (err) {
      setNotice(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal memuat data vision',
      );
    } finally {
      setLoading(false);
    }
  }, [
    baselineDays,
    feedbackKind,
    feedbackPage,
    feedbackSearch,
    productPage,
    productSearch,
    speciesPage,
    speciesSearch,
  ]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  useEffect(() => {
    if (
      stats?.negativeTypes.length &&
      !stats.negativeTypes.some(t => t.id === negType)
    ) {
      setNegType(stats.negativeTypes[0]?.id ?? 'lainnya');
    }
  }, [stats?.negativeTypes, negType]);

  const runBusy = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  };

  const openSpecies = async (row: KolamDaraTrainingVisionSpecies) => {
    setSelectedSpecies(row);
    setSelectedProduct(null);
    setAddKey(row.catalogPhotos[0] || '');
    try {
      setSpeciesPhotos(
        await listKolamDaraTrainingVisionSpeciesPhotos(row.speciesId),
      );
    } catch (err) {
      setNotice(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal memuat foto species',
      );
    }
  };

  const openProduct = async (row: KolamDaraTrainingVisionProduct) => {
    setSelectedProduct(row);
    setSelectedSpecies(null);
    setAddKey(row.catalogPhotos[0] || '');
    try {
      setProductPhotos(
        await listKolamDaraTrainingVisionProductPhotos(row.productId),
      );
    } catch (err) {
      setNotice(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal memuat foto produk',
      );
    }
  };

  const closePhotoModal = () => {
    if (!photoSaving) {
      setSelectedSpecies(null);
      setSelectedProduct(null);
    }
  };

  const savePhoto = async () => {
    const key = addKey.trim();
    if (!key) {
      setNotice('Path foto wajib diisi');
      return;
    }
    setPhotoSaving(true);
    try {
      if (selectedProduct) {
        await addKolamDaraTrainingVisionProductPhoto(
          selectedProduct.productId,
          {
            photoKey: key,
            source: selectedProduct.catalogPhotos.includes(key)
              ? 'catalog'
              : 'manual',
          },
        );
        await openProduct(selectedProduct);
      } else if (selectedSpecies) {
        await addKolamDaraTrainingVisionSpeciesPhoto(selectedSpecies.speciesId, {
          photoKey: key,
          source: selectedSpecies.catalogPhotos.includes(key)
            ? 'catalog'
            : 'manual',
        });
        await openSpecies(selectedSpecies);
      }
      setNotice('Foto ditambahkan');
      await load();
    } catch (err) {
      setNotice(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal menambah foto',
      );
    } finally {
      setPhotoSaving(false);
    }
  };

  const deletePhoto = async (photoId: string) => {
    try {
      await deleteKolamDaraTrainingVisionPhoto(photoId);
      if (selectedProduct) {
        await openProduct(selectedProduct);
      } else if (selectedSpecies) {
        await openSpecies(selectedSpecies);
      }
      setNotice('Foto dihapus');
      await load();
    } catch (err) {
      setNotice(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal menghapus',
      );
    }
  };

  const handleRebuildIndex = (includeProducts: boolean) =>
    runBusy('rebuild', async () => {
      const r = await rebuildKolamDaraTrainingVisionClipIndex({
        includeProducts,
      });
      setNotice(r.message || (r.success ? 'Rebuild selesai' : 'Rebuild gagal'));
      await load();
    });

  const negTypeOptions =
    stats?.negativeTypes.length ?
      stats.negativeTypes.map(t => ({label: t.label, value: t.id}))
    : [{label: 'Di luar katalog DA', value: 'lainnya'}];

  const modalPhotos = selectedProduct ? productPhotos : speciesPhotos;
  const photoModalOpen = selectedSpecies != null || selectedProduct != null;
  const photoModalTitle =
    selectedProduct?.displayName ??
    selectedSpecies?.displayName ??
    'Foto training';

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <View style={styles.introCard}>
        <Text style={styles.introTitle}>Vision inbox — closed-world</Text>
        <Text style={styles.meta}>
          DARA hanya mengenali{' '}
          <Text style={styles.metaStrong}>bukti pembayaran</Text>,{' '}
          <Text style={styles.metaStrong}>species</Text>, dan{' '}
          <Text style={styles.metaStrong}>produk sellable</Text> di katalog DA.
          Foto di luar katalog → abstain (tidak ditebak). OCR bukti bayar
          diprioritaskan sebelum vision katalog. Kelola dataset & indeks di tab
          di bawah.
        </Text>
      </View>

      <View style={styles.navShell}>
        {KOLAM_DARA_TRAINING_VISION_SECTIONS.map(item => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            onPress={() => setSection(item.id)}
            style={[
              styles.navChip,
              section === item.id ? styles.navChipActive : null,
            ]}>
            <Text
              style={[
                styles.navChipText,
                section === item.id ? styles.navChipTextActive : null,
              ]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      {section === 'ringkasan' && stats ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Status pipeline</Text>
          <View style={styles.pipelineColumns}>
            <View style={styles.pipelineColumn}>
              <PipelineField
                label="Closed-world"
                value={stats.closedWorldMode !== false ? 'Aktif' : 'Nonaktif'}
              />
              <PipelineField
                hint={stats.embedModelId.split('/').pop()}
                label="Embed aktif"
                value={stats.embedFamily || 'siglip'}
              />
              <PipelineField
                label="Threshold min"
                value={stats.embedMinScore ?? '—'}
              />
              <PipelineField
                label="Indeks model OK"
                value={stats.embedIndexCurrentModel ?? stats.clipIndexClipCount}
              />
              <PipelineField
                hint={
                  (stats.embedIndexStale ?? 0) > 0 ?
                    'Jalankan rebuild dual'
                  : undefined
                }
                label="Perlu rebuild"
                value={stats.embedIndexStale ?? 0}
              />
              <PipelineField
                hint={
                  stats.detectCropBackend === 'sam' ?
                    stats.detectCropModel.split('/').pop() || 'mobile_sam'
                  : stats.detectCropModel.split('/').pop() || 'yolov8n'
                }
                label="Detect/crop"
                value={stats.detectCropMode || 'auto'}
              />
              <PipelineField
                hint={stats.ocrEngine || undefined}
                label="OCR unified"
                value={stats.ocrUnifiedEnabled !== false ? 'Aktif' : 'Nonaktif'}
              />
            </View>
            <View style={styles.pipelineColumn}>
              <PipelineField
                label="Foto training species"
                value={stats.speciesTrainingPhotos ?? stats.trainingPhotos}
              />
              <PipelineField
                label="Foto training produk"
                value={stats.productTrainingPhotos ?? 0}
              />
              <PipelineField
                label="YOLO species"
                value={stats.yoloModelReady ? 'Aktif' : 'Belum'}
              />
              <PipelineField
                hint={
                  stats.yoloProductClassCount ?
                    `${stats.yoloProductClassCount} SKU`
                  : `Min ${stats.minProductTrainingPhotos ?? 3} foto/SKU`
                }
                label="YOLO produk"
                value={stats.yoloProductModelReady ? 'Aktif' : 'Belum'}
              />
              <PipelineField
                hint={`Species ${stats.feedbackSpeciesTotal ?? '—'} · Produk ${stats.feedbackProductTotal ?? '—'}`}
                label="Koreksi inbox"
                value={stats.feedbackTotal ?? 0}
              />
              <PipelineField
                label="Antrian feedback"
                value={stats.feedbackPending ?? 0}
              />
            </View>
          </View>
        </View>
      ) : null}

      {section === 'indeks' ? (
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.headCopy}>
              <Text style={styles.sectionTitle}>Indeks visual katalog</Text>
              <Text style={styles.meta}>
                Engine embed:{' '}
                <Text style={styles.metaStrong}>
                  {stats?.embedModelId.split('/').pop() || 'SigLIP'}
                </Text>
                {stats?.embedIndexStale ?
                  ` — ${stats.embedIndexStale} baris perlu rebuild (model lama)`
                : null}
                . Rebuild wajib setelah ganti model.
              </Text>
            </View>
            {canManage ? (
              <View style={styles.headActions}>
                <KolamButton
                  disabled={!!busy || clipJobRunning}
                  intent="primary"
                  label={busy === 'rebuild' ? 'Rebuild…' : 'Rebuild species + produk'}
                  onPress={() => {
                    void handleRebuildIndex(true);
                  }}
                  size="sm"
                />
                <KolamButton
                  disabled={!!busy || clipJobRunning}
                  intent="secondary"
                  label={busy === 'rebuild' ? 'Rebuild…' : 'Rebuild species saja'}
                  onPress={() => {
                    void handleRebuildIndex(false);
                  }}
                  size="sm"
                />
                <KolamButton
                  disabled={
                    !!busy || clipJobRunning || !(stats?.clipIndexMissing ?? 0)
                  }
                  intent="secondary"
                  label="Backfill embedding"
                  onPress={() => {
                    void runBusy('backfill', async () => {
                      const r = await backfillKolamDaraTrainingVisionClip();
                      setNotice(
                        r.message ||
                          (r.success ? 'Backfill selesai' : 'Backfill gagal'),
                      );
                      await load();
                    });
                  }}
                  size="sm"
                />
              </View>
            ) : null}
          </View>
          {stats ? (
            <View style={styles.statGrid}>
              <StatBox label="Baris indeks" value={stats.clipIndexTotal ?? 0} />
              <StatBox
                label="Embedding OK"
                value={stats.clipIndexClipCount ?? 0}
              />
              <StatBox
                label="Perlu backfill"
                value={stats.clipIndexMissing ?? 0}
              />
              <StatBox label="Job" value={clipJobLabel(clipJob)} />
            </View>
          ) : null}
        </View>
      ) : null}

      {section === 'species' ? (
        <>
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.headCopy}>
                <Text style={styles.sectionTitle}>YOLO species</Text>
                <Text style={styles.meta}>
                  Fast path inbox — min. {stats?.minTrainingPhotos ?? 5} foto per
                  species.
                </Text>
              </View>
              {canManage ? (
                <View style={styles.headActions}>
                  <KolamButton
                    disabled={!!busy}
                    intent="secondary"
                    label="Import feedback"
                    onPress={() => {
                      void runBusy('import', async () => {
                        const r = await importKolamDaraTrainingVisionFeedback();
                        setNotice(`Import: ${r.imported} foto`);
                        await load();
                      });
                    }}
                    size="sm"
                  />
                  <KolamButton
                    disabled={!!busy}
                    intent="secondary"
                    label="Export YOLO"
                    onPress={() => {
                      void runBusy('export', async () => {
                        const r = await exportKolamDaraTrainingVisionYolo(
                          stats?.minTrainingPhotos,
                        );
                        setNotice(r.message || 'Export selesai');
                        await load();
                      });
                    }}
                    size="sm"
                  />
                  <KolamButton
                    disabled={!!busy || !stats?.speciesReadyForTrain}
                    label="Train POC"
                    onPress={() => {
                      void runBusy('train', async () => {
                        const r = await trainKolamDaraTrainingVisionYolo({
                          poc: true,
                          epochs: 5,
                        });
                        setNotice(r.message || (r.success ? 'Training dimulai' : 'Training gagal'));
                        await load();
                      });
                    }}
                    size="sm"
                  />
                  <KolamButton
                    disabled={!!busy || !stats?.yoloModelReady}
                    intent="secondary"
                    label="Eval valid-set"
                    onPress={() => {
                      void runBusy('eval', async () => {
                        const r = await evalKolamDaraTrainingVisionYolo();
                        setYoloEvalNotice(r.message || 'Eval selesai');
                      });
                    }}
                    size="sm"
                  />
                </View>
              ) : null}
            </View>
            {yoloEvalNotice ? (
              <Text style={styles.meta}>Eval terakhir: {yoloEvalNotice}</Text>
            ) : null}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.sectionTitle}>Daftar species</Text>
              <View style={styles.searchRow}>
                <TextInput
                  onChangeText={setSpeciesQ}
                  placeholder="Cari species"
                  style={styles.searchInput}
                  value={speciesQ}
                />
                <KolamButton
                  intent="secondary"
                  label="Cari"
                  onPress={() => {
                    setSpeciesPage(1);
                    setSpeciesSearch(speciesQ.trim());
                  }}
                  size="sm"
                />
              </View>
            </View>
            {loading ? (
              <Text style={styles.meta}>Memuat…</Text>
            ) : speciesRows.length === 0 ? (
              <Text style={styles.meta}>Tidak ada species.</Text>
            ) : (
              <>
                <View style={styles.tableHead}>
                  <Text style={[styles.th, styles.colName]}>Species</Text>
                  <Text style={[styles.th, styles.colCount]}>Katalog</Text>
                  <Text style={[styles.th, styles.colCount]}>Training</Text>
                  <Text style={[styles.th, styles.colReady]}>Status</Text>
                  <Text style={[styles.th, styles.colAction]} />
                </View>
                {speciesRows.map(row => (
                  <View key={row.speciesId} style={styles.tableRow}>
                    <View style={styles.colName}>
                      <Text style={styles.tdStrong}>{row.displayName}</Text>
                      {row.scientificName ? (
                        <Text style={styles.tdMuted}>{row.scientificName}</Text>
                      ) : null}
                    </View>
                    <Text style={[styles.td, styles.colCount]}>
                      {row.catalogPhotoCount}
                    </Text>
                    <Text style={[styles.td, styles.colCount]}>
                      {row.trainingCount}
                    </Text>
                    <View style={styles.colReady}>
                      <KolamStatusBadge
                        intent={row.readyForTrain ? 'success' : 'muted'}
                        label={row.readyForTrain ? 'Siap latih' : 'Kumpulkan'}
                      />
                    </View>
                    <View style={styles.colAction}>
                      <KolamButton
                        intent="secondary"
                        label="Kelola"
                        onPress={() => {
                          void openSpecies(row);
                        }}
                        size="sm"
                      />
                    </View>
                  </View>
                ))}
                {speciesPages > 1 ? (
                  <View style={styles.pager}>
                    <KolamButton
                      disabled={speciesPage <= 1}
                      intent="secondary"
                      label="Sebelumnya"
                      onPress={() => setSpeciesPage(p => Math.max(1, p - 1))}
                      size="sm"
                    />
                    <Text style={styles.meta}>
                      {speciesPage}/{speciesPages}
                    </Text>
                    <KolamButton
                      disabled={speciesPage >= speciesPages}
                      intent="secondary"
                      label="Berikutnya"
                      onPress={() => setSpeciesPage(p => p + 1)}
                      size="sm"
                    />
                  </View>
                ) : null}
              </>
            )}
          </View>
        </>
      ) : null}

      {section === 'produk' ? (
        <>
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.headCopy}>
                <Text style={styles.sectionTitle}>YOLO produk (tier-1 SKU)</Text>
                <Text style={styles.meta}>
                  Klasifikasi cepat per SKU sellable — min.{' '}
                  {stats?.minProductTrainingPhotos ?? 3} foto per produk. Aktif
                  saat OCR hint produk atau fallback dual-index
                  (`DARA_VISION_SPECIES_ONLY=false`).
                </Text>
              </View>
              {canManage ? (
                <View style={styles.headActions}>
                  <KolamButton
                    disabled={!!busy}
                    intent="secondary"
                    label="Export YOLO"
                    onPress={() => {
                      void runBusy('export-yolo-product', async () => {
                        const r = await exportKolamDaraTrainingVisionYoloProducts(
                          stats?.minProductTrainingPhotos,
                        );
                        setNotice(r.message || 'Export selesai');
                        await load();
                      });
                    }}
                    size="sm"
                  />
                  <KolamButton
                    disabled={!!busy || !stats?.productTrainingPhotos}
                    label="Train POC"
                    onPress={() => {
                      void runBusy('train-yolo-product', async () => {
                        const r = await trainKolamDaraTrainingVisionYoloProducts({
                          poc: true,
                          epochs: 5,
                        });
                        setNotice(
                          r.message ||
                            (r.success ? 'Training dimulai' : 'Training gagal'),
                        );
                        await load();
                      });
                    }}
                    size="sm"
                  />
                </View>
              ) : null}
            </View>
            {stats ? (
              <Text style={styles.meta}>
                Model produk:{' '}
                <Text style={styles.metaStrong}>
                  {stats.yoloProductModelReady ?
                    `${stats.yoloProductClassCount ?? 0} kelas SKU`
                  : 'Belum dilatih'}
                </Text>
              </Text>
            ) : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Produk sellable</Text>
            <Text style={styles.meta}>
              Foto training produk masuk indeks visual saat rebuild dual.
              Koreksi dari inbox (tab Koreksi) otomatis mirror ke dataset
              produk.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.sectionTitle}>Daftar produk</Text>
              <View style={styles.searchRow}>
                <TextInput
                  onChangeText={setProductQ}
                  placeholder="Cari produk"
                  style={styles.searchInput}
                  value={productQ}
                />
                <KolamButton
                  intent="secondary"
                  label="Cari"
                  onPress={() => {
                    setProductPage(1);
                    setProductSearch(productQ.trim());
                  }}
                  size="sm"
                />
              </View>
            </View>
            {loading ? (
              <Text style={styles.meta}>Memuat…</Text>
            ) : productRows.length === 0 ? (
              <Text style={styles.meta}>Tidak ada produk.</Text>
            ) : (
              <>
                <View style={styles.tableHead}>
                  <Text style={[styles.th, styles.colName]}>Produk</Text>
                  <Text style={[styles.th, styles.colCount]}>Katalog</Text>
                  <Text style={[styles.th, styles.colCount]}>Training</Text>
                  <Text style={[styles.th, styles.colReady]}>Status</Text>
                  <Text style={[styles.th, styles.colAction]} />
                </View>
                {productRows.map(row => (
                  <View key={row.productId} style={styles.tableRow}>
                    <Text style={[styles.tdStrong, styles.colName]}>
                      {row.displayName}
                    </Text>
                    <Text style={[styles.td, styles.colCount]}>
                      {row.catalogPhotoCount}
                    </Text>
                    <Text style={[styles.td, styles.colCount]}>
                      {row.trainingCount}
                    </Text>
                    <View style={styles.colReady}>
                      <KolamStatusBadge
                        intent={row.readyForIndex ? 'success' : 'muted'}
                        label={row.readyForIndex ? 'Siap latih' : 'Kumpulkan'}
                      />
                    </View>
                    <View style={styles.colAction}>
                      <KolamButton
                        intent="secondary"
                        label="Kelola"
                        onPress={() => {
                          void openProduct(row);
                        }}
                        size="sm"
                      />
                    </View>
                  </View>
                ))}
                {productPages > 1 ? (
                  <View style={styles.pager}>
                    <KolamButton
                      disabled={productPage <= 1}
                      intent="secondary"
                      label="Sebelumnya"
                      onPress={() => setProductPage(p => Math.max(1, p - 1))}
                      size="sm"
                    />
                    <Text style={styles.meta}>
                      {productPage}/{productPages}
                    </Text>
                    <KolamButton
                      disabled={productPage >= productPages}
                      intent="secondary"
                      label="Berikutnya"
                      onPress={() => setProductPage(p => p + 1)}
                      size="sm"
                    />
                  </View>
                ) : null}
              </>
            )}
          </View>
        </>
      ) : null}

      {section === 'eval' ? (
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.headCopy}>
              <Text style={styles.sectionTitle}>Eval holdout (Fase 7)</Text>
              <Text style={styles.meta}>
                Uji akurasi tanpa bocor train: SigLIP pada foto training
                holdout (~20%), YOLO species/produk pada valid-set export.
                Hasil disimpan untuk perbandingan run.
              </Text>
            </View>
            {canManage ? (
              <KolamButton
                disabled={!!busy}
                label="Jalankan eval holdout"
                onPress={() => {
                  void runBusy('eval-holdout', async () => {
                    const r = await runKolamDaraTrainingVisionHoldoutEval({});
                    setEvalRun(r);
                    const runs = await listKolamDaraTrainingVisionEvalRuns(8);
                    setEvalHistory(runs);
                    setNotice(
                      r ?
                        `SigLIP ${r.siglip?.accuracy ?? 0}% · YOLO sp ${r.yoloSpecies?.accuracy ?? 0}%`
                      : 'Eval selesai',
                    );
                  });
                }}
                size="sm"
              />
            ) : null}
          </View>

          {evalRun ? (
            <>
              <View style={styles.inlineMeta}>
                <Text style={styles.meta}>
                  Terakhir:{' '}
                  <Text style={styles.metaStrong}>
                    {formatKolamDaraTrainingVisionDateTime(
                      evalRun.finishedAt || evalRun.startedAt,
                    )}
                  </Text>
                </Text>
                <KolamStatusBadge intent="muted" label={evalRun.status} />
              </View>
              <View style={styles.statGrid}>
                <EvalMetricBox
                  hint="CLIP-only, exclude foto query dari indeks"
                  metric={evalRun.siglip}
                  title="SigLIP holdout"
                />
                <EvalMetricBox
                  metric={evalRun.yoloSpecies}
                  title="YOLO species (valid-set)"
                />
                <EvalMetricBox
                  metric={evalRun.yoloProduct}
                  title="YOLO produk (valid-set)"
                />
              </View>
            </>
          ) : (
            <Text style={styles.meta}>
              Belum ada run eval. Export dataset YOLO dulu, rebuild indeks
              SigLIP, lalu jalankan eval holdout.
            </Text>
          )}

          {evalHistory.length > 1 ? (
            <>
              <Text style={styles.sectionTitle}>Riwayat run</Text>
              <View style={styles.tableHead}>
                <Text style={[styles.th, styles.colDateWide]}>Waktu</Text>
                <Text style={[styles.th, styles.colMetric]}>SigLIP</Text>
                <Text style={[styles.th, styles.colMetric]}>YOLO sp</Text>
                <Text style={[styles.th, styles.colMetric]}>YOLO pr</Text>
              </View>
              {evalHistory.map(row => (
                <View key={row.id} style={styles.tableRow}>
                  <Text style={[styles.tdMuted, styles.colDateWide]}>
                    {formatKolamDaraTrainingVisionDateTime(
                      row.finishedAt || row.startedAt,
                    )}
                  </Text>
                  <Text style={[styles.td, styles.colMetric]}>
                    {row.siglip?.accuracy != null ?
                      `${row.siglip.accuracy}%`
                    : '—'}
                  </Text>
                  <Text style={[styles.td, styles.colMetric]}>
                    {row.yoloSpecies?.accuracy != null ?
                      `${row.yoloSpecies.accuracy}%`
                    : '—'}
                  </Text>
                  <Text style={[styles.td, styles.colMetric]}>
                    {row.yoloProduct?.accuracy != null ?
                      `${row.yoloProduct.accuracy}%`
                    : '—'}
                  </Text>
                </View>
              ))}
            </>
          ) : null}
        </View>
      ) : null}

      {section === 'baseline' ? (
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.headCopy}>
              <Text style={styles.sectionTitle}>Baseline KPI (Fase 0)</Text>
              <Text style={styles.meta}>
                Audit produksi: abstain (klarifikasi), auto-reply vision, false
                match dari koreksi CS. Event inbox dicatat sejak deploy modul
                ini; periode lama fallback ke pesan `daraMeta`.
              </Text>
            </View>
            <View style={styles.headActions}>
              <KolamDropdownSelect
                label="Periode"
                onChange={value => setBaselineDays(Number(value) || 30)}
                options={[
                  {label: '7 hari', value: '7'},
                  {label: '30 hari', value: '30'},
                  {label: '90 hari', value: '90'},
                ]}
                value={String(baselineDays)}
              />
              <KolamButton
                disabled={loading}
                intent="secondary"
                label="Refresh"
                onPress={() => {
                  void load();
                }}
                size="sm"
              />
            </View>
          </View>

          {baselineKpi ?
            <>
              <Text style={styles.meta}>
                Periode: {formatKolamDaraTrainingVisionDateTime(baselineKpi.since)}{' '}
                — {formatKolamDaraTrainingVisionDateTime(baselineKpi.until)}
              </Text>
              <View style={styles.statGrid}>
                <StatBox
                  hint={`Match ${baselineKpi.inboxVisionMatch} · Ambigu ${baselineKpi.inboxVisionAmbiguous}`}
                  label="Inbox ditangani"
                  value={baselineKpi.inboxTotalHandled}
                />
                <StatBox
                  hint={`Auto-reply ${baselineKpi.inboxAutoReply}`}
                  label="Abstain / klarifikasi"
                  value={`${baselineKpi.inboxAbstainRate ?? 0}%`}
                />
                <StatBox
                  hint={`${baselineKpi.feedbackFalseMatch}/${baselineKpi.feedbackTotal} koreksi`}
                  label="False match (CS label)"
                  value={`${baselineKpi.feedbackFalseMatchRate ?? 0}%`}
                />
                <StatBox
                  hint="Butuh koreksi CS + auto-reply di periode sama"
                  label="Precision estimasi"
                  value={
                    baselineKpi.precisionPct != null ?
                      `${baselineKpi.precisionPct}%`
                    : '—'
                  }
                />
              </View>
              {baselineKpi.precisionNote ? (
                <Text style={styles.meta}>{baselineKpi.precisionNote}</Text>
              ) : null}
            </>
          : <Text style={styles.meta}>Belum ada data KPI untuk periode ini.</Text>}
        </View>
      ) : null}

      {section === 'luar' ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Di luar katalog & bukan target vision
          </Text>
          <Text style={styles.meta}>
            Hard negative melatih YOLO abstain — termasuk bukti bayar,
            screenshot, dan foto bukan species/produk DA. Frasa `payment_hint`
            ada di tab Frasa respons cepat.
          </Text>

          {canManage ? (
            <View style={styles.formBox}>
              <Text style={styles.fieldLabel}>Tambah hard negative</Text>
              <Text style={styles.fieldLabel}>Path foto</Text>
              <TextInput
                onChangeText={setNegKey}
                placeholder="/media/..."
                style={styles.textInput}
                value={negKey}
              />
              <KolamDropdownSelect
                label="Tipe"
                onChange={setNegType}
                options={negTypeOptions}
                value={negType}
              />
              <KolamButton
                disabled={!!busy || !negKey.trim()}
                label="Tambah"
                onPress={() => {
                  void runBusy('neg', async () => {
                    await addKolamDaraTrainingVisionHardNegative({
                      photoKey: negKey.trim(),
                      negativeType: negType,
                    });
                    setNegKey('');
                    setNotice('Hard negative ditambahkan');
                    await load();
                  });
                }}
                size="sm"
              />
            </View>
          ) : null}

          {feedbackQueue.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Antrian feedback</Text>
              <View style={styles.tableHead}>
                <Text style={[styles.th, styles.colKind]}>Jenis</Text>
                <Text style={[styles.th, styles.colLabel]}>Label benar</Text>
                <Text style={[styles.th, styles.colStatus]}>Status</Text>
                <Text style={[styles.th, styles.colDate]}>Tanggal</Text>
                {canManage ? (
                  <Text style={[styles.th, styles.colAction]} />
                ) : null}
              </View>
              {feedbackQueue.map(row => (
                <View key={row.id} style={styles.tableRow}>
                  <View style={styles.colKind}>
                    <KolamStatusBadge
                      intent={row.entityKind === 'product' ? 'primary' : 'muted'}
                      label={row.entityKind === 'product' ? 'Produk' : 'Species'}
                    />
                  </View>
                  <Text numberOfLines={2} style={[styles.td, styles.colLabel]}>
                    {row.correctDisplayName || '—'}
                    {row.correctSku ? ` ${row.correctSku}` : ''}
                  </Text>
                  <Text style={[styles.tdMuted, styles.colStatus]}>
                    {row.matchStatus || '—'}
                  </Text>
                  <Text style={[styles.tdMuted, styles.colDate]}>
                    {formatKolamDaraTrainingVisionDateTime(row.createdAt)}
                  </Text>
                  {canManage ? (
                    <View style={styles.colAction}>
                      <KolamButton
                        disabled={busy === row.id}
                        intent="secondary"
                        label="Import"
                        onPress={() => {
                          void runBusy(row.id, async () => {
                            await importKolamDaraTrainingVisionFeedbackQueueItem(
                              row.id,
                            );
                            setNotice('Diimport ke training');
                            await load();
                          });
                        }}
                        size="sm"
                      />
                    </View>
                  ) : null}
                </View>
              ))}
            </>
          ) : (
            <Text style={styles.meta}>Antrian feedback kosong.</Text>
          )}

          {hardNegatives.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Hard negatives</Text>
              <View style={styles.tableHead}>
                <Text style={[styles.th, styles.colPath]}>Path</Text>
                <Text style={[styles.th, styles.colKind]}>Tipe</Text>
                <Text style={[styles.th, styles.colDate]}>Tanggal</Text>
              </View>
              {hardNegatives.map(row => (
                <View key={row.id} style={styles.tableRow}>
                  <Text numberOfLines={2} style={[styles.tdMuted, styles.colPath]}>
                    {row.photoKey}
                  </Text>
                  <Text style={[styles.td, styles.colKind]}>
                    {row.negativeType || '—'}
                  </Text>
                  <Text style={[styles.tdMuted, styles.colDate]}>
                    {formatKolamDaraTrainingVisionDateTime(row.createdAt)}
                  </Text>
                </View>
              ))}
            </>
          ) : null}
          <Text style={styles.meta}>
            {hardNegatives.length} entri hard negative terdaftar.
          </Text>
        </View>
      ) : null}

      {section === 'koreksi' ? (
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.headCopy}>
              <Text style={styles.sectionTitle}>Koreksi vision dari Inbox</Text>
              <Text style={styles.meta}>
                CS menandai species atau produk sellable benar dari balasan
                vision DARA.
              </Text>
            </View>
            <View style={styles.searchRow}>
              <TextInput
                onChangeText={setFeedbackQ}
                placeholder="Cari"
                style={styles.searchInput}
                value={feedbackQ}
              />
              <KolamButton
                intent="secondary"
                label="Cari"
                onPress={() => {
                  setFeedbackPage(1);
                  setFeedbackSearch(feedbackQ.trim());
                }}
                size="sm"
              />
            </View>
          </View>

          <View style={styles.filterRow}>
            {(
              [
                ['all', 'Semua'],
                ['species', 'Species'],
                ['product', 'Produk'],
              ] as const
            ).map(([kind, label]) => (
              <KolamButton
                key={kind}
                intent={feedbackKind === kind ? 'primary' : 'secondary'}
                label={label}
                onPress={() => {
                  setFeedbackKind(kind);
                  setFeedbackPage(1);
                }}
                size="sm"
              />
            ))}
            {canManage ? (
              <KolamButton
                disabled={!!busy}
                intent="secondary"
                label="Import ke training"
                onPress={() => {
                  void runBusy('import-fb', async () => {
                    const r = await importKolamDaraTrainingVisionFeedback();
                    setNotice(`Import: ${r.imported} foto`);
                    await load();
                  });
                }}
                size="sm"
              />
            ) : null}
          </View>

          {loading ? (
            <Text style={styles.meta}>Memuat…</Text>
          ) : feedbackRows.length === 0 ? (
            <Text style={styles.meta}>Belum ada koreksi vision.</Text>
          ) : (
            <>
              <View style={styles.tableHead}>
                <Text style={[styles.th, styles.colThumb]}>Foto</Text>
                <Text style={[styles.th, styles.colKind]}>Jenis</Text>
                <Text style={[styles.th, styles.colSuggest]}>DARA sarankan</Text>
                <Text style={[styles.th, styles.colCorrect]}>Benar</Text>
                <Text style={[styles.th, styles.colStatus]}>Status</Text>
                <Text style={[styles.th, styles.colDate]}>Waktu</Text>
              </View>
              {feedbackRows.map(row => (
                <View key={row.id} style={styles.tableRow}>
                  <View style={styles.colThumb}>
                    {row.buyerImageUrl ?
                      <KolamRemoteImage
                        accessibilityLabel="Foto buyer"
                        sourceUri={resolveKolamDaraTrainingVisionImageUri(
                          row.buyerImageUrl,
                        )}
                        style={THUMB}
                      />
                    : <Text style={styles.tdMuted}>—</Text>}
                  </View>
                  <View style={styles.colKind}>
                    <KolamStatusBadge
                      intent={row.entityKind === 'product' ? 'primary' : 'muted'}
                      label={row.entityKind === 'product' ? 'Produk' : 'Species'}
                    />
                  </View>
                  <Text
                    numberOfLines={2}
                    style={[styles.tdMuted, styles.colSuggest]}>
                    {row.suggestedDisplayName || '—'}
                  </Text>
                  <Text numberOfLines={2} style={[styles.tdStrong, styles.colCorrect]}>
                    {row.correctDisplayName}
                    {row.correctSku ? ` ${row.correctSku}` : ''}
                  </Text>
                  <View style={styles.colStatus}>
                    <KolamStatusBadge
                      intent={resolveKolamDaraTrainingVisionMatchIntent(
                        row.matchStatus,
                      )}
                      label={
                        KOLAM_DARA_TRAINING_VISION_MATCH_LABELS[row.matchStatus]
                      }
                    />
                  </View>
                  <Text style={[styles.tdMuted, styles.colDate]}>
                    {formatKolamDaraTrainingVisionDateTime(row.createdAt)}
                  </Text>
                </View>
              ))}
            </>
          )}

          {feedbackPages > 1 ? (
            <View style={styles.pager}>
              <KolamButton
                disabled={feedbackPage <= 1}
                intent="secondary"
                label="Sebelumnya"
                onPress={() => setFeedbackPage(p => Math.max(1, p - 1))}
                size="sm"
              />
              <Text style={styles.meta}>
                {feedbackPage}/{feedbackPages}
              </Text>
              <KolamButton
                disabled={feedbackPage >= feedbackPages}
                intent="secondary"
                label="Berikutnya"
                onPress={() => setFeedbackPage(p => p + 1)}
                size="sm"
              />
            </View>
          ) : null}
        </View>
      ) : null}

      <Modal
        animationType="fade"
        onRequestClose={closePhotoModal}
        transparent
        visible={photoModalOpen}>
        <View style={styles.modalRoot}>
          <KolamModalBackdrop onPress={closePhotoModal} />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{photoModalTitle}</Text>
            <Text style={styles.meta}>Foto katalog atau path /media/…</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.photoRow}>
                {modalPhotos.map(photo => (
                  <View key={photo.id} style={styles.photoItem}>
                    <KolamRemoteImage
                      accessibilityLabel={photo.photoKey}
                      sourceUri={resolveKolamDaraTrainingVisionImageUri(
                        photo.photoKey,
                      )}
                      style={THUMB}
                    />
                    {canManage ? (
                      <KolamButton
                        intent="secondary"
                        label="Hapus"
                        onPress={() => {
                          void deletePhoto(photo.id);
                        }}
                        size="sm"
                      />
                    ) : null}
                  </View>
                ))}
              </View>
            </ScrollView>

            {canManage ? (
              <>
                <Text style={styles.fieldLabel}>Path foto</Text>
                <TextInput
                  onChangeText={setAddKey}
                  placeholder="/media/..."
                  style={styles.textInput}
                  value={addKey}
                />
                <KolamButton
                  disabled={photoSaving}
                  label={photoSaving ? 'Menyimpan…' : 'Simpan'}
                  onPress={() => {
                    void savePhoto();
                  }}
                  size="sm"
                />
              </>
            ) : null}

            <KolamButton
              disabled={photoSaving}
              intent="secondary"
              label="Tutup"
              onPress={closePhotoModal}
              size="sm"
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
    paddingBottom: 16,
  },
  introCard: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 12,
  },
  introTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  navShell: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    padding: 4,
  },
  navChip: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  navChipActive: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
  },
  navChipText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  navChipTextActive: {
    color: V.colors.fg,
  },
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
    alignItems: 'center',
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
  metaStrong: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  notice: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  pipelineColumns: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 20,
    width: '100%',
  },
  pipelineColumn: {
    flex: 1,
    minWidth: 0,
  },
  pipelineField: {
    alignItems: 'flex-start',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  pipelineFieldLabel: {
    color: V.colors.mutedFg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
    paddingTop: 1,
  },
  pipelineFieldRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
    gap: 2,
    maxWidth: '48%',
  },
  pipelineFieldValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    textAlign: 'right',
  },
  pipelineFieldHint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'right',
  },
  statGrid: {
    alignItems: 'stretch',
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
  },
  statBox: {
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    flexBasis: '23%',
    flexGrow: 1,
    flexShrink: 1,
    gap: 2,
    justifyContent: 'flex-start',
    minHeight: 72,
    minWidth: 148,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  statValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  statHint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  statWarn: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  searchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  searchInput: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: V.colors.fg,
    flexGrow: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    minWidth: 120,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  textInput: {
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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  formBox: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 10,
  },
  fieldLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
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
  colName: {flex: 1.4, minWidth: 100},
  colCount: {flex: 0.6, minWidth: 56},
  colReady: {flex: 0.8, minWidth: 72},
  colSku: {flex: 0.8, minWidth: 72},
  colThumb: {flex: 0.6, minWidth: 52},
  colKind: {flex: 0.7, minWidth: 64},
  colSuggest: {flex: 1, minWidth: 80},
  colCorrect: {flex: 1, minWidth: 80},
  colStatus: {flex: 0.7, minWidth: 64},
  colDate: {flex: 0.9, minWidth: 80},
  colDateWide: {flex: 1.2, minWidth: 100},
  colMetric: {flex: 0.7, minWidth: 56},
  colLabel: {flex: 1.2, minWidth: 90},
  colPath: {flex: 1.4, minWidth: 100},
  colAction: {flex: 0.7, minWidth: 72},
  inlineMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pager: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  photoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  photoItem: {
    gap: 4,
  },
  modalRoot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    maxHeight: '90%',
    maxWidth: 520,
    padding: 14,
    width: '100%',
    zIndex: 2,
  },
  modalTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
});
