import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  formatKolamDaraTrainingVisionDateTime,
  formatKolamDaraTrainingVisionTrainStatusLabel,
  KOLAM_DARA_TRAINING_VISION_LIST_PAGE_SIZE,
  KOLAM_DARA_TRAINING_VISION_MATCH_LABELS,
  KOLAM_DARA_TRAINING_VISION_MIN_PRODUCT_PHOTOS,
  KOLAM_DARA_TRAINING_VISION_MIN_SPECIES_PHOTOS,
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
  fetchKolamDaraTrainingVisionClipIndexJob,
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
import {KolamSaveButton} from './kolam-save-button';
import {KolamDetailSummaryCard} from './kolam-detail-summary-card';
import {KolamDetailScrollSurface} from './kolam-detail-scroll-surface';
import {KolamRefreshButton} from './kolam-refresh-button';
import {KolamDropdownSelect} from './kolam-dropdown-select';
import {KolamListTableComposition} from './kolam-list-table-composition';
import {KolamModalBackdrop} from './kolam-modal-backdrop';
import {KolamRemoteImage} from './kolam-remote-image';
import {KolamStatusBadge} from './kolam-status-badge';

const THUMB = {width: 48, height: 48, borderRadius: 6} as const;
const CATALOG_THUMB = {width: 56, height: 56, borderRadius: 6} as const;

/** Training thumb: image non-interactive; delete overlay on hover (FE trash). */
function VisionTrainingPhotoThumb({
  canDelete,
  onDelete,
  photoKey,
}: {
  canDelete: boolean;
  onDelete: () => void;
  photoKey: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      accessibilityLabel={photoKey}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPress={() => {
        if (canDelete) {
          setHovered(true);
        }
      }}
      style={styles.trainingThumb}>
      <View pointerEvents="none">
        <KolamRemoteImage
          accessibilityLabel={photoKey}
          sourceUri={resolveKolamDaraTrainingVisionImageUri(photoKey)}
          style={CATALOG_THUMB}
        />
      </View>
      {canDelete && hovered ? (
        <Pressable
          accessibilityLabel="Hapus"
          accessibilityRole="button"
          onPress={onDelete}
          style={styles.trainingDelete}>
          <Text style={styles.trainingDeleteText}>✕</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

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

function PipelineSummaryFieldValue({
  hint,
  value,
}: {
  hint?: string;
  value: string | number;
}) {
  return (
    <View style={styles.pipelineSummaryValue}>
      <Text style={styles.pipelineSummaryValueText}>{value}</Text>
      {hint ? <Text style={styles.pipelineSummaryHint}>{hint}</Text> : null}
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
  const {height: windowHeight, width: windowWidth} = useWindowDimensions();
  const [section, setSection] =
    useState<KolamDaraTrainingVisionSectionId>('ringkasan');
  const [stats, setStats] = useState<KolamDaraTrainingVisionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [speciesRows, setSpeciesRows] = useState<
    KolamDaraTrainingVisionSpecies[]
  >([]);
  const [speciesPage, setSpeciesPage] = useState(1);
  const [speciesTotal, setSpeciesTotal] = useState(0);
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
  const [productTotal, setProductTotal] = useState(0);
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
  const [selectedCatalogKeys, setSelectedCatalogKeys] = useState<string[]>([]);
  const [negKey, setNegKey] = useState('');
  const [negType, setNegType] = useState('lainnya');
  const [photoSaving, setPhotoSaving] = useState(false);
  const [clipLogLines, setClipLogLines] = useState<string[]>([]);
  const clipJobWasRunningRef = useRef(false);

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
            limit: KOLAM_DARA_TRAINING_VISION_LIST_PAGE_SIZE,
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
      setSpeciesTotal(sp.total);
      setProductRows(pr.rows);
      setProductTotal(pr.total);
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

  useEffect(() => {
    if (section !== 'ringkasan') {
      return;
    }
    let cancelled = false;
    const tick = async () => {
      try {
        const view = await fetchKolamDaraTrainingVisionClipIndexJob(100);
        if (cancelled) {
          return;
        }
        setClipLogLines(view.log);
        const status = view.job?.status || '';
        if (status === 'running') {
          clipJobWasRunningRef.current = true;
          setStats(prev =>
            prev
              ? {
                  ...prev,
                  clipIndexJob: view.job,
                }
              : prev,
          );
        } else if (clipJobWasRunningRef.current) {
          clipJobWasRunningRef.current = false;
          void load();
        }
      } catch {
        // keep last log lines
      }
    };
    void tick();
    const shouldPoll = clipJobRunning || busy === 'rebuild';
    if (!shouldPoll) {
      return () => {
        cancelled = true;
      };
    }
    const id = setInterval(() => {
      void tick();
    }, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [busy, clipJobRunning, load, section]);

  const runBusy = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
    } catch (err) {
      setNotice(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Operasi gagal',
      );
    } finally {
      setBusy(null);
    }
  };

  const openSpecies = async (row: KolamDaraTrainingVisionSpecies) => {
    setSelectedSpecies(row);
    setSelectedProduct(null);
    setSelectedCatalogKeys([]);
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
    setSelectedCatalogKeys([]);
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
      setSelectedCatalogKeys([]);
    }
  };

  const toggleCatalogKey = (key: string) => {
    setSelectedCatalogKeys(prev =>
      prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key],
    );
  };

  const savePhoto = async () => {
    const keys = selectedCatalogKeys;
    if (!keys.length) {
      setNotice('Pilih foto katalog');
      return;
    }
    setPhotoSaving(true);
    try {
      let added = 0;
      for (const key of keys) {
        if (selectedProduct) {
          await addKolamDaraTrainingVisionProductPhoto(
            selectedProduct.productId,
            {
              photoKey: key,
              source: 'catalog',
            },
          );
          added += 1;
        } else if (selectedSpecies) {
          await addKolamDaraTrainingVisionSpeciesPhoto(
            selectedSpecies.speciesId,
            {
              photoKey: key,
              source: 'catalog',
            },
          );
          added += 1;
        }
      }
      setSelectedCatalogKeys([]);
      if (selectedProduct) {
        await openProduct(selectedProduct);
      } else if (selectedSpecies) {
        await openSpecies(selectedSpecies);
      }
      await load();
      setNotice(added > 1 ? `${added} foto ditambahkan` : 'Foto ditambahkan');
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
      await load();
      setNotice('Foto dihapus');
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
      setNotice(
        r.message ||
          (r.success
            ? 'Rebuild dimulai — lihat Console log'
            : 'Rebuild gagal'),
      );
      clipJobWasRunningRef.current = true;
      try {
        const view = await fetchKolamDaraTrainingVisionClipIndexJob(100);
        setClipLogLines(view.log);
        if (view.job) {
          setStats(prev =>
            prev ? {...prev, clipIndexJob: view.job} : prev,
          );
        }
      } catch {
        // ignore
      }
      await load();
    });

  const negTypeOptions =
    stats?.negativeTypes.length ?
      stats.negativeTypes.map(t => ({label: t.label, value: t.id}))
    : [{label: 'Di luar katalog DA', value: 'lainnya'}];

  const modalPhotos = selectedProduct ? productPhotos : speciesPhotos;
  const modalCatalogPhotos =
    selectedProduct?.catalogPhotos ?? selectedSpecies?.catalogPhotos ?? [];
  const photoModalOpen = selectedSpecies != null || selectedProduct != null;
  const photoModalTitle =
    selectedProduct?.displayName ??
    selectedSpecies?.displayName ??
    'Foto training';
  const outOfCatalogPanel = (
    <View style={styles.introPanel}>
      <Text style={styles.sectionTitle}>Di luar katalog</Text>
      <Text style={styles.meta}>
        Foto yang bukan bukti bayar, species, atau produk katalog disimpan
        sebagai contoh penolakan. Data ini membantu DARA menahan jawaban saat
        gambar tidak cocok.
      </Text>

      {canManage ? (
        <View style={styles.formBox}>
          <Text style={styles.fieldLabel}>Tambah contoh ditolak</Text>
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
                setNotice('Contoh ditolak ditambahkan');
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
            {canManage ? <Text style={[styles.th, styles.colAction]} /> : null}
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
                {row.correctDisplayName || '-'}
                {row.correctSku ? ` ${row.correctSku}` : ''}
              </Text>
              <Text style={[styles.tdMuted, styles.colStatus]}>
                {row.matchStatus || '-'}
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
          <Text style={styles.sectionTitle}>Contoh ditolak</Text>
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
                {row.negativeType || '-'}
              </Text>
              <Text style={[styles.tdMuted, styles.colDate]}>
                {formatKolamDaraTrainingVisionDateTime(row.createdAt)}
              </Text>
            </View>
          ))}
        </>
      ) : null}
      <Text style={styles.meta}>
        {hardNegatives.length} contoh ditolak terdaftar.
      </Text>
    </View>
  );

  return (
    <>
    <KolamDetailScrollSurface contentContainerStyle={styles.root}>
      <View style={styles.introCard}>
        <Text style={styles.introTitle}>Vision inbox</Text>
        <Text style={styles.meta}>
          DARA hanya boleh mengenali bukti pembayaran, species, dan produk
          katalog. Foto lain ditahan supaya DARA tidak menebak. Bukti bayar
          dibaca lebih dulu, lalu foto katalog dicocokkan dari dataset.
        </Text>
        {section === 'ringkasan' ? outOfCatalogPanel : null}
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

      {section === 'ringkasan' ? (
        <>
          {stats ? (
            <KolamDetailSummaryCard
              fieldColumns={4}
              fields={[
                {
                  id: 'closed-world',
                  label: 'Closed-world',
                  value:
                    stats.closedWorldMode !== false ? 'Aktif' : 'Nonaktif',
                },
                {
                  id: 'embed-active',
                  label: 'Embed aktif',
                  value: (
                    <PipelineSummaryFieldValue
                      hint={stats.embedModelId.split('/').pop()}
                      value={stats.embedFamily || 'siglip'}
                    />
                  ),
                },
                {
                  id: 'threshold-min',
                  label: 'Threshold min',
                  value: stats.embedMinScore ?? '-',
                },
                {
                  id: 'index-model-ok',
                  label: 'Indeks model OK',
                  value:
                    stats.embedIndexCurrentModel ?? stats.clipIndexClipCount,
                },
                {
                  id: 'needs-rebuild',
                  label: 'Perlu rebuild',
                  value: (
                    <PipelineSummaryFieldValue
                      hint={
                        (stats.embedIndexStale ?? 0) > 0 ?
                          'Jalankan rebuild dual'
                        : undefined
                      }
                      value={stats.embedIndexStale ?? 0}
                    />
                  ),
                },
                {
                  id: 'detect-crop',
                  label: 'Detect/crop',
                  value: (
                    <PipelineSummaryFieldValue
                      hint={
                        stats.detectCropBackend === 'sam' ?
                          stats.detectCropModel.split('/').pop() ||
                          'mobile_sam'
                        : stats.detectCropModel.split('/').pop() || 'yolov8n'
                      }
                      value={stats.detectCropMode || 'auto'}
                    />
                  ),
                },
                {
                  id: 'ocr-unified',
                  label: 'OCR unified',
                  value: (
                    <PipelineSummaryFieldValue
                      hint={stats.ocrEngine || undefined}
                      value={
                        stats.ocrUnifiedEnabled !== false ?
                          'Aktif'
                        : 'Nonaktif'
                      }
                    />
                  ),
                },
                {
                  id: 'species-training-photos',
                  label: 'Foto training species',
                  value: stats.speciesTrainingPhotos ?? stats.trainingPhotos,
                },
                {
                  id: 'product-training-photos',
                  label: 'Foto training produk',
                  value: stats.productTrainingPhotos ?? 0,
                },
                {
                  id: 'yolo-species',
                  label: 'YOLO species',
                  value: stats.yoloModelReady ? 'Aktif' : 'Belum',
                },
                {
                  id: 'yolo-product',
                  label: 'YOLO produk',
                  value: (
                    <PipelineSummaryFieldValue
                      hint={
                        stats.yoloProductClassCount ?
                          `${stats.yoloProductClassCount} SKU`
                        : `Min ${stats.minProductTrainingPhotos ?? 3} foto/SKU`
                      }
                      value={stats.yoloProductModelReady ? 'Aktif' : 'Belum'}
                    />
                  ),
                },
                {
                  id: 'inbox-feedback',
                  label: 'Koreksi inbox',
                  value: (
                    <PipelineSummaryFieldValue
                      hint={`Species ${stats.feedbackSpeciesTotal ?? '-'} - Produk ${stats.feedbackProductTotal ?? '-'}`}
                      value={stats.feedbackTotal ?? 0}
                    />
                  ),
                },
                {
                  id: 'feedback-queue',
                  label: 'Antrian feedback',
                  value: stats.feedbackPending ?? 0,
                },
              ]}
              title="Status pipeline"
            />
          ) : null}

          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.headCopy}>
                <Text style={styles.sectionTitle}>Eval holdout</Text>
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
                      const runs =
                        await listKolamDaraTrainingVisionEvalRuns(8);
                      setEvalHistory(runs);
                      setNotice(
                        r ?
                          `SigLIP ${r.siglip?.accuracy ?? 0}% - YOLO sp ${r.yoloSpecies?.accuracy ?? 0}%`
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
                      : '-'}
                    </Text>
                    <Text style={[styles.td, styles.colMetric]}>
                      {row.yoloSpecies?.accuracy != null ?
                        `${row.yoloSpecies.accuracy}%`
                      : '-'}
                    </Text>
                    <Text style={[styles.td, styles.colMetric]}>
                      {row.yoloProduct?.accuracy != null ?
                        `${row.yoloProduct.accuracy}%`
                      : '-'}
                    </Text>
                  </View>
                ))}
              </>
            ) : null}
          </View>

          <KolamDetailSummaryCard
            actions={
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
                <KolamRefreshButton
                  accessibilityLabel="Refresh"
                  disabled={loading}
                  intent="secondary"
                  onPress={() => {
                    void load();
                  }}
                  size="sm"
                />
              </View>
            }
            description="Audit produksi: abstain, auto-reply vision, false-match CS."
            fieldColumns={4}
            fields={
              baselineKpi ?
                [
                  {
                    id: 'inbox-source',
                    label: 'Sumber inbox',
                    value: (
                      <PipelineSummaryFieldValue
                        hint={
                          baselineKpi.inboxEventCount != null ?
                            `${baselineKpi.inboxEventCount} event`
                          : undefined
                        }
                        value={baselineKpi.inboxSource || '-'}
                      />
                    ),
                  },
                  {
                    id: 'abstain-rate',
                    label: 'Abstain rate',
                    value: (
                      <PipelineSummaryFieldValue
                        hint={`${baselineKpi.inboxClarifyAbstain} dari ${
                          baselineKpi.inboxAutoReply +
                          baselineKpi.inboxClarifyAbstain
                        } attempt katalog`}
                        value={`${baselineKpi.inboxAbstainRate ?? 0}%`}
                      />
                    ),
                  },
                  {
                    id: 'auto-reply-vision',
                    label: 'Auto-reply vision',
                    value: (
                      <PipelineSummaryFieldValue
                        hint={`Match ${baselineKpi.inboxVisionMatch} - Ambigu ${baselineKpi.inboxVisionAmbiguous} - LLM ${baselineKpi.inboxVisionLlm}`}
                        value={`${baselineKpi.inboxAutoReplyRate ?? 0}%`}
                      />
                    ),
                  },
                  {
                    id: 'false-match-cs',
                    label: 'False match CS',
                    value: (
                      <PipelineSummaryFieldValue
                        hint={`${baselineKpi.feedbackFalseMatch}/${baselineKpi.feedbackTotal} koreksi`}
                        value={`${baselineKpi.feedbackFalseMatchRate ?? 0}%`}
                      />
                    ),
                  },
                  {
                    id: 'precision-proxy',
                    label: 'Precision estimasi',
                    value: (
                      <PipelineSummaryFieldValue
                        hint="Butuh koreksi CS + auto-reply di periode sama"
                        value={
                          baselineKpi.precisionPct != null ?
                            `${baselineKpi.precisionPct}%`
                          : '-'
                        }
                      />
                    ),
                  },
                  {
                    id: 'payment-ocr',
                    label: 'Bukti bayar',
                    value: baselineKpi.inboxPayment,
                  },
                  {
                    id: 'skip-dedup',
                    label: 'Skip dedup foto',
                    value: baselineKpi.inboxSkippedDedup,
                  },
                  {
                    id: 'siglip-latest',
                    label: 'Holdout SigLIP',
                    value:
                      baselineKpi.latestHoldoutSiglipAccuracy != null ?
                        `${baselineKpi.latestHoldoutSiglipAccuracy}%`
                      : '-',
                  },
                ]
              : [
                  {
                    id: 'empty',
                    label: 'Status',
                    value: 'Belum ada data KPI untuk periode ini.',
                  },
                ]
            }
            sections={
              baselineKpi?.inboxByMatchMethod.length ?
                [
                  {
                    id: 'match-method',
                    title: 'Metode auto-reply',
                    content: (
                      <Text style={styles.meta}>
                        {baselineKpi.inboxByMatchMethod
                          .map(row => `${row.method} ${row.count}`)
                          .join(' - ')}
                      </Text>
                    ),
                  },
                ]
              : undefined
            }
            title="Baseline KPI"
          />

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
                    label={
                      busy === 'rebuild' ? 'Rebuild…' : 'Rebuild species + produk'
                    }
                    onPress={() => {
                      void handleRebuildIndex(true);
                    }}
                    size="sm"
                  />
                  <KolamButton
                    disabled={!!busy || clipJobRunning}
                    intent="secondary"
                    label={
                      busy === 'rebuild' ? 'Rebuild…' : 'Rebuild species saja'
                    }
                    onPress={() => {
                      void handleRebuildIndex(false);
                    }}
                    size="sm"
                  />
                  <KolamButton
                    disabled={
                      !!busy ||
                      clipJobRunning ||
                      !(stats?.clipIndexMissing ?? 0)
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
              <View style={styles.pipelineColumns}>
                <View style={styles.pipelineColumn}>
                  <PipelineField
                    label="Baris indeks"
                    value={stats.clipIndexTotal ?? 0}
                  />
                  <PipelineField
                    label="Embedding OK"
                    value={stats.clipIndexClipCount ?? 0}
                  />
                </View>
                <View style={styles.pipelineColumn}>
                  <PipelineField
                    label="Perlu backfill"
                    value={stats.clipIndexMissing ?? 0}
                  />
                  <PipelineField
                    hint={
                      clipJob?.status === 'failed' && clipJob.error
                        ? clipJob.error
                        : undefined
                    }
                    label="Job"
                    value={clipJob ? clipJobLabel(clipJob) : '-'}
                  />
                </View>
              </View>
            ) : null}
            {clipJob?.status === 'failed' && clipJob.error ? (
              <Text style={styles.notice}>{clipJob.error}</Text>
            ) : null}

            <View style={styles.console}>
              <View style={styles.consoleHead}>
                <View
                  style={[
                    styles.consoleDot,
                    clipJobRunning ? styles.consoleDotOn : null,
                  ]}
                />
                <Text style={styles.consoleTitle}>
                  Console log
                  {clipJobRunning ? ' · berjalan' : ''}
                </Text>
              </View>
              <ScrollView
                nestedScrollEnabled
                style={styles.consoleScroll}>
                <Text style={styles.consoleBody}>
                  {clipLogLines.length
                    ? clipLogLines.join('\n')
                    : '// Log muncul saat rebuild / backfill berjalan'}
                </Text>
              </ScrollView>
            </View>
          </View>
        </>
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
            <KolamListTableComposition
              columns={[
                {
                  flex: 2.15,
                  id: 'species',
                  label: 'Species',
                  render: row => (
                    <View>
                      <Text numberOfLines={2} style={styles.tdStrong}>
                        {row.displayName}
                      </Text>
                      {row.scientificName ? (
                        <Text numberOfLines={1} style={styles.tdMuted}>
                          {row.scientificName}
                        </Text>
                      ) : null}
                    </View>
                  ),
                },
                {
                  align: 'center',
                  flex: 0.62,
                  id: 'catalog',
                  label: 'Katalog',
                  render: row => (
                    <Text style={styles.td}>{row.catalogPhotoCount}</Text>
                  ),
                },
                {
                  align: 'center',
                  flex: 0.62,
                  id: 'training',
                  label: 'Training',
                  render: row => (
                    <Text style={styles.td}>{row.trainingCount}</Text>
                  ),
                },
                {
                  align: 'left',
                  flex: 0.82,
                  id: 'status',
                  label: 'Status',
                  render: row => {
                    const trainStatus =
                      formatKolamDaraTrainingVisionTrainStatusLabel(
                        row.trainingCount,
                        stats?.minTrainingPhotos ??
                          KOLAM_DARA_TRAINING_VISION_MIN_SPECIES_PHOTOS,
                        row.catalogPhotoCount,
                      );
                    return (
                      <KolamStatusBadge
                        intent={trainStatus.ready ? 'success' : 'muted'}
                        label={trainStatus.label}
                      />
                    );
                  },
                },
                {
                  align: 'right',
                  flex: 0.48,
                  id: 'action',
                  label: '',
                  render: row => (
                    <KolamButton
                      intent="secondary"
                      label="Kelola"
                      onPress={() => {
                        void openSpecies(row);
                      }}
                      size="sm"
                    />
                  ),
                },
              ]}
              emptyTitle={loading ? 'Memuat...' : 'Tidak ada species'}
              getRowKey={row => row.speciesId}
              loading={loading}
              pagination={
                !loading && speciesTotal > 0
                  ? {
                      onPageChange: setSpeciesPage,
                      page: speciesPage,
                      pageSize: KOLAM_DARA_TRAINING_VISION_LIST_PAGE_SIZE,
                      total: speciesTotal,
                    }
                  : undefined
              }
              rows={loading ? [] : speciesRows}
              showFooter={!loading && speciesTotal > 0}
            />
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
            <KolamListTableComposition
              columns={[
                {
                  flex: 2.15,
                  id: 'product',
                  label: 'Produk',
                  render: row => (
                    <Text numberOfLines={2} style={styles.tdStrong}>
                      {row.displayName}
                    </Text>
                  ),
                },
                {
                  align: 'center',
                  flex: 0.62,
                  id: 'catalog',
                  label: 'Katalog',
                  render: row => (
                    <Text style={styles.td}>{row.catalogPhotoCount}</Text>
                  ),
                },
                {
                  align: 'center',
                  flex: 0.62,
                  id: 'training',
                  label: 'Training',
                  render: row => (
                    <Text style={styles.td}>{row.trainingCount}</Text>
                  ),
                },
                {
                  align: 'left',
                  flex: 0.82,
                  id: 'status',
                  label: 'Status',
                  render: row => {
                    const trainStatus =
                      formatKolamDaraTrainingVisionTrainStatusLabel(
                        row.trainingCount,
                        stats?.minProductTrainingPhotos ??
                          KOLAM_DARA_TRAINING_VISION_MIN_PRODUCT_PHOTOS,
                        row.catalogPhotoCount,
                      );
                    return (
                      <KolamStatusBadge
                        intent={trainStatus.ready ? 'success' : 'muted'}
                        label={trainStatus.label}
                      />
                    );
                  },
                },
                {
                  align: 'right',
                  flex: 0.48,
                  id: 'action',
                  label: '',
                  render: row => (
                    <KolamButton
                      intent="secondary"
                      label="Kelola"
                      onPress={() => {
                        void openProduct(row);
                      }}
                      size="sm"
                    />
                  ),
                },
              ]}
              emptyTitle={loading ? 'Memuat...' : 'Tidak ada produk'}
              getRowKey={row => row.productId}
              loading={loading}
              pagination={
                !loading && productTotal > 0
                  ? {
                      onPageChange: setProductPage,
                      page: productPage,
                      pageSize: KOLAM_DARA_TRAINING_VISION_LIST_PAGE_SIZE,
                      total: productTotal,
                    }
                  : undefined
              }
              rows={loading ? [] : productRows}
              showFooter={!loading && productTotal > 0}
            />
          </View>
        </>
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
    </KolamDetailScrollSurface>

      <Modal
        animationType="fade"
        onRequestClose={closePhotoModal}
        transparent
        visible={photoModalOpen}>
        <View
          style={[
            styles.modalRoot,
            {height: windowHeight, width: windowWidth},
          ]}>
          <KolamModalBackdrop onPress={closePhotoModal} />
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{photoModalTitle}</Text>
              <Text style={styles.meta}>
                Pilih foto katalog, lalu Tambah foto
              </Text>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.modalBody}>
                {canManage && modalCatalogPhotos.length > 0 ? (
                  <View style={styles.modalSection}>
                    <Text style={styles.fieldLabel}>
                      Foto katalog — klik untuk pilih (abu = sudah di training)
                    </Text>
                    <View style={styles.catalogGrid}>
                      {modalCatalogPhotos.map(photoKey => {
                        const exists = modalPhotos.some(
                          photo => photo.photoKey === photoKey,
                        );
                        const picked = selectedCatalogKeys.includes(photoKey);
                        return (
                          <Pressable
                            key={photoKey}
                            accessibilityLabel={photoKey}
                            accessibilityRole="button"
                            disabled={exists || photoSaving}
                            onPress={() => {
                              if (!exists) {
                                toggleCatalogKey(photoKey);
                              }
                            }}
                            style={[
                              styles.catalogThumb,
                              picked ? styles.catalogThumbPicked : null,
                              exists ? styles.catalogThumbExists : null,
                            ]}>
                            <View pointerEvents="none">
                              <KolamRemoteImage
                                accessibilityLabel={photoKey}
                                sourceUri={resolveKolamDaraTrainingVisionImageUri(
                                  photoKey,
                                )}
                                style={CATALOG_THUMB}
                              />
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ) : canManage ? (
                  <Text style={styles.meta}>Tidak ada foto katalog</Text>
                ) : null}

                <View style={styles.modalSection}>
                  <View style={styles.catalogGrid}>
                    {modalPhotos.map(photo => (
                      <VisionTrainingPhotoThumb
                        key={photo.id}
                        canDelete={canManage && !photoSaving}
                        onDelete={() => {
                          void deletePhoto(photo.id);
                        }}
                        photoKey={photo.photoKey}
                      />
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              {canManage && modalCatalogPhotos.length > 0 ? (
                <KolamSaveButton
                  disabled={photoSaving || selectedCatalogKeys.length === 0}
                  intent="primary"
                  label={photoSaving ? 'Menyimpan…' : 'Tambah foto'}
                  onPress={() => {
                    void savePhoto();
                  }}
                  size="sm"
                />
              ) : null}
              <KolamButton
                disabled={photoSaving}
                intent="outline"
                label="Tutup"
                onPress={closePhotoModal}
                size="sm"
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  introPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
    marginTop: 8,
    padding: 10,
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
    gap: 28,
    marginTop: 4,
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
    gap: 12,
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  pipelineFieldLabel: {
    color: V.colors.mutedFg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 18,
    paddingRight: 8,
    paddingTop: 1,
  },
  pipelineFieldRight: {
    alignItems: 'flex-end',
    flexShrink: 0,
    gap: 4,
    maxWidth: '52%',
  },
  pipelineFieldValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'right',
  },
  pipelineFieldHint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'right',
  },
  pipelineSummaryValue: {
    alignItems: 'flex-start',
    gap: 2,
    minWidth: 0,
  },
  pipelineSummaryValueText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
    textAlign: 'left',
  },
  pipelineSummaryHint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'left',
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
  modalScroll: {
    flexGrow: 0,
    maxHeight: 440,
  },
  modalBody: {
    gap: 16,
    paddingVertical: 4,
  },
  modalSection: {
    gap: 8,
  },
  modalHeader: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
    paddingBottom: 10,
  },
  modalFooter: {
    alignItems: 'center',
    borderTopColor: V.colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    paddingTop: 10,
  },
  catalogGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catalogThumb: {
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 56,
    overflow: 'hidden',
    width: 56,
  },
  catalogThumbPicked: {
    borderColor: V.colors.primary,
    borderWidth: 2,
  },
  catalogThumbExists: {
    opacity: 0.4,
  },
  trainingThumb: {
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 56,
    overflow: 'hidden',
    position: 'relative',
    width: 56,
  },
  trainingDelete: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  trainingDeleteText: {
    color: '#ffffff',
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  modalRoot: {
    alignItems: 'center',
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
    maxWidth: 640,
    padding: 16,
    width: '100%',
    zIndex: 2,
  },
  modalTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
  console: {
    backgroundColor: '#0b1220',
    borderColor: '#1f2937',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    marginTop: 4,
    padding: 12,
  },
  consoleHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  consoleDot: {
    backgroundColor: '#4b5563',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  consoleDotOn: {
    backgroundColor: '#4ade80',
  },
  consoleTitle: {
    color: '#d1d5db',
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  consoleScroll: {
    maxHeight: 180,
  },
  consoleBody: {
    color: '#4ade80',
    fontFamily: V.fontFamily,
    fontSize: 11,
    lineHeight: 16,
  },
});
