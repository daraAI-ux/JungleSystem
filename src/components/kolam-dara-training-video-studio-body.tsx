import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  formatKolamDaraTrainingVideoStudioBytes,
  formatKolamDaraTrainingVideoStudioDate,
  KOLAM_DARA_TRAINING_VIDEO_STUDIO_RATIO_LABEL,
  resolveKolamDaraTrainingVideoStudioStatusIntent,
  resolveKolamDaraTrainingVideoStudioStatusLabel,
  isKolamDaraTrainingVideoStudioTerminalStatus,
  type KolamDaraTrainingVideoStudioConfig,
  type KolamDaraTrainingVideoStudioJob,
  type KolamDaraTrainingVideoStudioUpload,
} from '../domain/kolam-dara-training-video-studio';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {ApiError} from '../lib/api-error';
import {
  buildKolamDaraTrainingVideoStudioDownloadUrl,
  cancelKolamDaraTrainingVideoStudioJob,
  createKolamDaraTrainingVideoStudioJob,
  fetchKolamDaraTrainingVideoStudioConfig,
  listKolamDaraTrainingVideoStudioJobs,
  overlayKolamDaraTrainingVideoStudioLogo,
  pollKolamDaraTrainingVideoStudioJob,
  refreshKolamDaraTrainingVideoStudioJob,
  uploadKolamDaraTrainingVideoStudioRaw,
} from '../services/kolam-dara-training-video-studio-api';
import {
  pickNativeVideoFile,
  type NativeImagePickerResult,
} from '../services/native-file-picker';
import {KolamButton} from './kolam-button';
import {KolamDropdownSelect} from './kolam-dropdown-select';
import {openKolamMediaPreview} from './kolam-media-preview-dialog';
import {KolamMediaPlayer} from './kolam-media-player';
import {KolamStatusBadge} from './kolam-status-badge';
import {KolamSwitch} from './kolam-switch';

/** FE `DaraVideoStudioTab`. */
export function KolamDaraTrainingVideoStudioBody({
  canManage,
  refreshKey = 0,
}: {
  canManage: boolean;
  refreshKey?: number;
}) {
  const [config, setConfig] =
    useState<KolamDaraTrainingVideoStudioConfig | null>(null);
  const [jobs, setJobs] = useState<KolamDaraTrainingVideoStudioJob[]>([]);
  const [selectedFile, setSelectedFile] =
    useState<NativeImagePickerResult | null>(null);
  const [upload, setUpload] = useState<KolamDaraTrainingVideoStudioUpload | null>(
    null,
  );
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('');
  const [duration, setDuration] = useState('5');
  const [aspectRatio, setAspectRatio] = useState('');
  const [resolution, setResolution] = useState('');
  const [overlayLogo, setOverlayLogo] = useState(false);
  const [sourceVideoUrl, setSourceVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [activeJob, setActiveJob] =
    useState<KolamDaraTrainingVideoStudioJob | null>(null);

  const canSubmit =
    canManage &&
    Boolean(prompt.trim()) &&
    Boolean(model) &&
    Boolean(sourceVideoUrl.trim());

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cfg, history] = await Promise.all([
        fetchKolamDaraTrainingVideoStudioConfig(),
        listKolamDaraTrainingVideoStudioJobs(30),
      ]);
      setConfig(cfg);
      setJobs(history);
      setActiveJob(current => {
        if (current) {
          return history.find(row => row.id === current.id) ?? current;
        }
        return history[0] ?? null;
      });
      setPrompt(current => current || cfg.preset.prompt);
      setModel(current => current || cfg.defaultModel || cfg.models[0] || '');
      setNotice('');
    } catch (err) {
      setNotice(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal memuat Video Studio',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll, refreshKey]);

  useEffect(() => {
    if (upload?.sourceVideoUrl) {
      setSourceVideoUrl(upload.sourceVideoUrl);
    }
  }, [upload]);

  const modelOptions = useMemo(() => {
    const options = config?.models?.length ? config.models : model ? [model] : [];
    return Array.from(new Set(options.filter(Boolean)));
  }, [config?.models, model]);

  const durationOptions = useMemo(() => {
    return (
      config?.modelCapabilities?.[model]?.durations ||
      config?.supportedDurations ||
      [5]
    );
  }, [config, model]);

  const resolutionOptions = useMemo(() => {
    const options =
      config?.modelCapabilities?.[model]?.resolutions ||
      config?.supportedResolutions ||
      [];
    return ['', ...options.filter(Boolean)];
  }, [config, model]);

  const aspectRatioOptions = useMemo(() => {
    const options = config?.supportedAspectRatios?.length
      ? config.supportedAspectRatios
      : ['', '21:9', '16:9', '4:3', '1:1', '3:4', '9:16'];
    return Array.from(new Set(['', ...options])).filter(
      item => item === '' || KOLAM_DARA_TRAINING_VIDEO_STUDIO_RATIO_LABEL[item],
    );
  }, [config?.supportedAspectRatios]);

  useEffect(() => {
    if (
      durationOptions.length &&
      !durationOptions.includes(Number(duration))
    ) {
      setDuration(String(durationOptions[0]));
    }
  }, [duration, durationOptions]);

  useEffect(() => {
    if (resolution && !resolutionOptions.includes(resolution)) {
      setResolution('');
    }
  }, [resolution, resolutionOptions]);

  useEffect(() => {
    if (aspectRatio && !aspectRatioOptions.includes(aspectRatio)) {
      setAspectRatio('');
    }
  }, [aspectRatio, aspectRatioOptions]);

  const pickVideo = async () => {
    if (!canManage || busy) {
      return;
    }
    try {
      const picked = await pickNativeVideoFile();
      if (picked.cancelled) {
        return;
      }
      setSelectedFile(picked);
      setUpload(null);
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : 'Gagal memilih video',
      );
    }
  };

  const handleUpload = async () => {
    if (!selectedFile?.uri || !canManage) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(selectedFile.uri);
      const buffer = await res.arrayBuffer();
      const result = await uploadKolamDaraTrainingVideoStudioRaw(buffer, {
        filename: selectedFile.name || 'video.mp4',
        mimeType: selectedFile.mimeType || 'video/mp4',
      });
      setUpload(result);
      if (result.requiresPublicUrl) {
        setNotice(
          'Upload tersimpan lokal. Tambahkan URL publik/signed URL sebelum submit ke BytePlus.',
        );
      } else {
        setNotice('Video RAW siap dipakai');
      }
    } catch (err) {
      setNotice(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Upload video gagal',
      );
    } finally {
      setBusy(false);
    }
  };

  const pollUntilTerminal = async (job: KolamDaraTrainingVideoStudioJob) => {
    if (isKolamDaraTrainingVideoStudioTerminalStatus(job.status)) {
      return;
    }
    try {
      const updated = await pollKolamDaraTrainingVideoStudioJob(job.id);
      const finalJob =
        updated.status === 'succeeded' && updated.overlayLogo
          ? await overlayKolamDaraTrainingVideoStudioLogo(updated.id)
          : updated;
      setActiveJob(finalJob);
      setJobs(current =>
        current.map(row => (row.id === finalJob.id ? finalJob : row)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }
    setBusy(true);
    try {
      const job = await createKolamDaraTrainingVideoStudioJob({
        prompt,
        presetName: config?.preset.name,
        model,
        duration: duration ? Number(duration) : null,
        aspectRatio,
        resolution,
        overlayLogo,
        sourceFilename: upload?.sourceFilename || selectedFile?.name,
        sourceMimeType: upload?.sourceMimeType || selectedFile?.mimeType,
        sourceSizeBytes: upload?.sourceSizeBytes || undefined,
        sourceVideoUrl,
        uploadToken: upload?.uploadToken,
      });
      setActiveJob(job);
      setJobs(current => [job, ...current.filter(row => row.id !== job.id)]);
      setNotice('Task BytePlus dikirim');
      void pollUntilTerminal(job);
    } catch (err) {
      setNotice(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal mengirim task BytePlus',
      );
    } finally {
      setBusy(false);
    }
  };

  const refreshJob = async (
    job: KolamDaraTrainingVideoStudioJob,
    poll = false,
  ) => {
    setBusy(true);
    try {
      const updated = poll
        ? await pollKolamDaraTrainingVideoStudioJob(job.id)
        : await refreshKolamDaraTrainingVideoStudioJob(job.id);
      setActiveJob(updated);
      setJobs(current =>
        current.map(row => (row.id === updated.id ? updated : row)),
      );
      setNotice('');
    } catch (err) {
      setNotice(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal memperbarui status',
      );
    } finally {
      setBusy(false);
    }
  };

  const cancelJob = async (job: KolamDaraTrainingVideoStudioJob) => {
    setBusy(true);
    try {
      const updated = await cancelKolamDaraTrainingVideoStudioJob(job.id);
      setActiveJob(updated);
      setJobs(current =>
        current.map(row => (row.id === updated.id ? updated : row)),
      );
      setNotice('Job dibatalkan');
    } catch (err) {
      setNotice(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal membatalkan job',
      );
    } finally {
      setBusy(false);
    }
  };

  const retryJob = async (job: KolamDaraTrainingVideoStudioJob) => {
    if (!job.sourceVideoUrl) {
      return;
    }
    setBusy(true);
    try {
      const retried = await createKolamDaraTrainingVideoStudioJob({
        prompt: job.prompt,
        presetName: config?.preset.name,
        model: job.model,
        duration: job.duration ?? null,
        aspectRatio: job.aspectRatio || '',
        resolution: job.resolution || '',
        overlayLogo: Boolean(job.overlayLogo),
        sourceFilename: job.sourceFilename,
        sourceMimeType: job.sourceMimeType,
        sourceSizeBytes: job.sourceSizeBytes || undefined,
        sourceVideoUrl: job.sourceVideoUrl,
      });
      setActiveJob(retried);
      setJobs(current => [retried, ...current]);
      setNotice('Retry task BytePlus dikirim');
      void pollUntilTerminal(retried);
    } catch (err) {
      setNotice(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Retry job gagal',
      );
    } finally {
      setBusy(false);
    }
  };

  const overlayJob = async (job: KolamDaraTrainingVideoStudioJob) => {
    setBusy(true);
    try {
      const updated = await overlayKolamDaraTrainingVideoStudioLogo(job.id);
      setActiveJob(updated);
      setJobs(current =>
        current.map(row => (row.id === updated.id ? updated : row)),
      );
      setNotice('Logo dioverlay memakai PNG asli');
    } catch (err) {
      setNotice(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Overlay logo gagal',
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading && !config) {
    return <Text style={styles.meta}>Memuat Video Studio…</Text>;
  }

  const selectedFileLabel = selectedFile?.name
    ? `${selectedFile.name} — ${formatKolamDaraTrainingVideoStudioBytes(
        upload?.sourceSizeBytes,
      )}`
    : 'Pilih file video RAW.';

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <Text style={styles.sectionTitle}>Dunia Anura Video Studio</Text>
          <Text style={styles.meta}>
            Ubah video RAW species menjadi video sinematik melalui backend proxy
            BytePlus ModelArk.
          </Text>
        </View>

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        <View style={styles.columns}>
          <View style={styles.column}>
            <View style={styles.uploadBox}>
              <Text style={styles.fieldLabel}>Video RAW</Text>
              <Text style={styles.meta}>{selectedFileLabel}</Text>
              {upload ? (
                <KolamStatusBadge
                  intent={upload.requiresPublicUrl ? 'warning' : 'success'}
                  label={
                    upload.requiresPublicUrl ? 'Butuh URL publik' : 'URL siap'
                  }
                />
              ) : null}
              <View style={styles.rowActions}>
                <KolamButton
                  disabled={!canManage || busy}
                  intent="secondary"
                  label="Pilih video"
                  onPress={() => {
                    void pickVideo();
                  }}
                  size="sm"
                />
                <KolamButton
                  disabled={!selectedFile?.uri || busy || !canManage}
                  intent="secondary"
                  label={busy ? 'Upload…' : 'Upload RAW'}
                  onPress={() => {
                    void handleUpload();
                  }}
                  size="sm"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>video_url publik / signed URL</Text>
              <TextInput
                editable={canManage && !busy}
                onChangeText={setSourceVideoUrl}
                placeholder="https://..."
                placeholderTextColor={V.colors.mutedFg}
                style={styles.input}
                value={sourceVideoUrl}
              />
            </View>

            <View style={styles.dropdownGrid}>
              <KolamDropdownSelect
                label="Model"
                menuPlacement="inline"
                onChange={setModel}
                options={
                  modelOptions.length
                    ? modelOptions.map(item => ({label: item, value: item}))
                    : [{label: 'Konfigurasi env model', value: ''}]
                }
                style={styles.dropdown}
                value={model}
              />
              <KolamDropdownSelect
                label="Durasi"
                menuPlacement="inline"
                onChange={setDuration}
                options={durationOptions.map(item => ({
                  label: `${item}s`,
                  value: String(item),
                }))}
                style={styles.dropdown}
                value={duration}
              />
              <KolamDropdownSelect
                label="Ratio video"
                menuPlacement="inline"
                onChange={setAspectRatio}
                options={aspectRatioOptions.map(item => ({
                  label:
                    KOLAM_DARA_TRAINING_VIDEO_STUDIO_RATIO_LABEL[item] || item,
                  value: item,
                }))}
                style={styles.dropdown}
                value={aspectRatio}
              />
              <Text style={styles.hint}>Auto tidak memaksa 16:9.</Text>
              <KolamDropdownSelect
                label="Resolusi"
                menuPlacement="inline"
                onChange={setResolution}
                options={resolutionOptions.map(item => ({
                  label: item || 'Auto',
                  value: item,
                }))}
                style={styles.dropdown}
                value={resolution}
              />
            </View>

            <View style={styles.switchRow}>
              <KolamSwitch
                accessibilityLabel="Overlay logo PNG setelah selesai"
                active={overlayLogo}
                disabled={!canManage || busy}
                onPress={() => {
                  setOverlayLogo(current => !current);
                }}
              />
              <Text style={styles.switchLabel}>
                Overlay logo PNG setelah selesai
              </Text>
              <KolamStatusBadge
                intent={config?.apiKeyConfigured ? 'success' : 'warning'}
                label={
                  config?.apiKeyConfigured
                    ? 'API key backend siap'
                    : 'API key belum siap'
                }
              />
              <KolamStatusBadge
                intent="secondary"
                label={`Region ${config?.region || 'ap-southeast'}`}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Prompt</Text>
              <TextInput
                editable={canManage && !busy}
                multiline
                onChangeText={setPrompt}
                placeholderTextColor={V.colors.mutedFg}
                style={[styles.input, styles.promptInput]}
                value={prompt}
              />
            </View>

            <View style={styles.rowActions}>
              <KolamButton
                disabled={!config?.preset.prompt || busy}
                intent="secondary"
                label="Pakai preset"
                onPress={() => {
                  setPrompt(config?.preset.prompt || '');
                }}
                size="sm"
              />
              <KolamButton
                disabled={!canSubmit || busy}
                label={busy ? 'Kirim…' : 'Kirim task'}
                onPress={() => {
                  void handleSubmit();
                }}
                size="sm"
              />
            </View>
          </View>

          <View style={styles.column}>
            <View style={styles.panel}>
              <View style={styles.panelHead}>
                <View>
                  <Text style={styles.panelTitle}>Status</Text>
                  <Text style={styles.meta}>
                    {activeJob
                      ? formatKolamDaraTrainingVideoStudioDate(
                          activeJob.updatedAt,
                        )
                      : 'Belum ada job aktif'}
                  </Text>
                </View>
                {activeJob ? (
                  <KolamStatusBadge
                    intent={resolveKolamDaraTrainingVideoStudioStatusIntent(
                      activeJob.status,
                    )}
                    label={resolveKolamDaraTrainingVideoStudioStatusLabel(
                      activeJob.status,
                    )}
                  />
                ) : null}
              </View>

              {activeJob?.errorMessage ? (
                <Text style={styles.errorBox}>{activeJob.errorMessage}</Text>
              ) : null}

              {activeJob?.outputUrl ? (
                <View style={styles.previewWrap}>
                  <KolamMediaPlayer
                    kind="video"
                    style={styles.previewPlayer}
                    title="Hasil Video Studio"
                    uri={activeJob.outputUrl}
                  />
                  <View style={styles.rowActions}>
                    <KolamButton
                      intent="secondary"
                      label="Putar"
                      onPress={() => {
                        openKolamMediaPreview({
                          kind: 'video',
                          title: 'Hasil Video Studio',
                          uri: activeJob.outputUrl,
                        });
                      }}
                      size="sm"
                    />
                    <KolamButton
                      intent="plain"
                      label="Download hasil"
                      onPress={() => {
                        void Linking.openURL(
                          activeJob.outputUrl ||
                            buildKolamDaraTrainingVideoStudioDownloadUrl(
                              activeJob.id,
                            ),
                        );
                      }}
                      size="sm"
                    />
                  </View>
                </View>
              ) : null}

              {activeJob ? (
                <View style={styles.rowActions}>
                  <KolamButton
                    disabled={busy}
                    intent="secondary"
                    label="Refresh"
                    onPress={() => {
                      void refreshJob(activeJob);
                    }}
                    size="sm"
                  />
                  <KolamButton
                    disabled={busy}
                    intent="secondary"
                    label="Polling"
                    onPress={() => {
                      void refreshJob(activeJob, true);
                    }}
                    size="sm"
                  />
                  <KolamButton
                    disabled={
                      busy ||
                      !config?.cancelSupported ||
                      isKolamDaraTrainingVideoStudioTerminalStatus(
                        activeJob.status,
                      )
                    }
                    intent="plain"
                    label="Cancel"
                    onPress={() => {
                      void cancelJob(activeJob);
                    }}
                    size="sm"
                  />
                  <KolamButton
                    disabled={
                      busy ||
                      activeJob.status !== 'failed' ||
                      !activeJob.sourceVideoUrl
                    }
                    intent="secondary"
                    label="Retry"
                    onPress={() => {
                      void retryJob(activeJob);
                    }}
                    size="sm"
                  />
                  <KolamButton
                    disabled={busy || activeJob.status !== 'succeeded'}
                    intent="secondary"
                    label="Overlay logo"
                    onPress={() => {
                      void overlayJob(activeJob);
                    }}
                    size="sm"
                  />
                </View>
              ) : null}
            </View>

            <View style={styles.panel}>
              <View style={styles.panelHead}>
                <Text style={styles.panelTitle}>Histori job</Text>
                <KolamButton
                  disabled={busy}
                  intent="plain"
                  label="Refresh"
                  onPress={() => {
                    void loadAll();
                  }}
                  size="sm"
                />
              </View>
              <View style={styles.historyList}>
                {jobs.length ? (
                  jobs.map(job => (
                    <Pressable
                      key={job.id}
                      onPress={() => {
                        setActiveJob(job);
                      }}
                      style={[
                        styles.historyRow,
                        activeJob?.id === job.id && styles.historyRowActive,
                      ]}>
                      <View style={styles.historyRowTop}>
                        <Text numberOfLines={1} style={styles.historyTitle}>
                          {job.sourceFilename || job.model}
                        </Text>
                        <KolamStatusBadge
                          intent={resolveKolamDaraTrainingVideoStudioStatusIntent(
                            job.status,
                          )}
                          label={resolveKolamDaraTrainingVideoStudioStatusLabel(
                            job.status,
                          )}
                        />
                      </View>
                      <Text numberOfLines={1} style={styles.meta}>
                        {job.model} —{' '}
                        {formatKolamDaraTrainingVideoStudioDate(job.createdAt)}
                      </Text>
                    </Pressable>
                  ))
                ) : (
                  <Text style={styles.emptyHistory}>Belum ada histori.</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
  },
  card: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  cardHead: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    gap: 4,
    paddingBottom: 10,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
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
    lineHeight: 17,
  },
  columns: {
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 10,
    minWidth: 0,
  },
  uploadBox: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  field: {
    gap: 4,
  },
  fieldLabel: {
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
    fontSize: 12,
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  promptInput: {
    minHeight: 220,
    textAlignVertical: 'top',
  },
  dropdownGrid: {
    gap: 8,
  },
  dropdown: {
    flexGrow: 0,
  },
  hint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  switchLabel: {
    color: V.colors.fg,
    flexShrink: 1,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  rowActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  panel: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 10,
  },
  panelHead: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  panelTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: 'rgba(220,38,38,0.08)',
    borderRadius: 8,
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  previewWrap: {
    gap: 8,
  },
  previewPlayer: {
    backgroundColor: '#0f172a',
    height: 240,
    width: '100%',
  },
  historyList: {
    gap: 0,
    maxHeight: 520,
  },
  historyRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  historyRowActive: {
    backgroundColor: V.colors.muted,
  },
  historyRowTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  historyTitle: {
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyHistory: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    paddingVertical: 24,
    textAlign: 'center',
  },
});
