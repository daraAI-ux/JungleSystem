import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {formatKolamDaraTaxDateId} from '../domain/kolam-dara-tax';
import {
  formatKolamDaraTaxDateTimeId,
  KOLAM_DARA_TAX_RMS_TABS,
  KOLAM_DARA_TAX_WATCH_STATUS_LABEL,
  type KolamDaraTaxAuditLog,
  type KolamDaraTaxKnowledge,
  type KolamDaraTaxKitab,
  type KolamDaraTaxRegulationDraft,
  type KolamDaraTaxRegulationSource,
  type KolamDaraTaxRegulationVersion,
  type KolamDaraTaxRmsSubTab,
  type KolamDaraTaxTaxStatus,
  type KolamDaraTaxVersionCompare,
} from '../domain/kolam-dara-tax-regulasi';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {
  aiFillKolamDaraTaxKitab,
  approveKolamDaraTaxRegulationDraft,
  checkKolamDaraTaxRegulationSource,
  compareKolamDaraTaxRegulationVersions,
  createKolamDaraTaxRegulationSource,
  deleteKolamDaraTaxRegulationSource,
  fetchKolamDaraTaxAuditLogs,
  fetchKolamDaraTaxKitab,
  fetchKolamDaraTaxKnowledge,
  fetchKolamDaraTaxRegulationDrafts,
  fetchKolamDaraTaxRegulationSources,
  fetchKolamDaraTaxRegulationVersions,
  rejectKolamDaraTaxRegulationDraft,
  rollbackKolamDaraTaxRegulationVersion,
  runKolamDaraTaxBootstrap,
  runKolamDaraTaxReaccruePph21,
  runKolamDaraTaxSnapshotBackfill,
} from '../services/kolam-dara-tax-api';
import {KolamButton} from './kolam-button';
import {KolamDropdownSelect} from './kolam-dropdown-select';
import {KolamStatusBadge} from './kolam-status-badge';
import type {KolamStatusBadgeIntent} from './kolam-status-badge-types';
import {KolamSurfacePanelTabs} from './kolam-surface-panel-tabs';

type DraftFormulas = {
  ppnRate?: number;
  pph23Rate?: number;
  umkmFinalRate?: number;
};

function watchStatusIntent(status: string): KolamStatusBadgeIntent {
  if (status === 'waiting_interval') {
    return 'success';
  }
  if (status === 'due' || status === 'never_checked') {
    return 'warning';
  }
  if (status === 'error') {
    return 'danger';
  }
  return 'secondary';
}

function versionStatusIntent(status: string): KolamStatusBadgeIntent {
  if (status === 'active') {
    return 'success';
  }
  if (status === 'superseded') {
    return 'secondary';
  }
  if (status === 'rejected') {
    return 'danger';
  }
  if (status === 'pending_review') {
    return 'warning';
  }
  return 'secondary';
}

function draftStatusIntent(status: string): KolamStatusBadgeIntent {
  if (status === 'pending_review') {
    return 'warning';
  }
  if (status === 'approved') {
    return 'success';
  }
  return 'secondary';
}

function kitabStatusIntent(code: string): KolamStatusBadgeIntent {
  if (code === 'ok') {
    return 'success';
  }
  if (code === 'pending' || code === 'gap') {
    return 'warning';
  }
  return 'secondary';
}

function errorMessage(err: unknown, fallback: string) {
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = String((err as {message?: unknown}).message || '').trim();
    if (msg) {
      return msg;
    }
  }
  return fallback;
}

/** FE `TaxIntelligenceDashboard` tab Regulasi (RMS). */
export function KolamDaraTaxRegulasiBody({
  taxEnabled,
  isAdmin,
  canApprove,
  pendingDraftCount,
  taxStatus,
  versions: versionsProp,
  monitoringLoading,
  watcherRunning,
  notice,
  onRunWatcher,
  onRefreshMonitoring,
  onNotice,
}: {
  taxEnabled: boolean;
  isAdmin: boolean;
  canApprove: boolean;
  pendingDraftCount: number;
  taxStatus: KolamDaraTaxTaxStatus | null;
  versions: KolamDaraTaxRegulationVersion[];
  monitoringLoading: boolean;
  watcherRunning: boolean;
  notice: string;
  onRunWatcher: () => void;
  onRefreshMonitoring: () => void;
  onNotice: (msg: string) => void;
}) {
  const [rmsSubTab, setRmsSubTab] = useState<KolamDaraTaxRmsSubTab>('ringkasan');

  const [kitab, setKitab] = useState<KolamDaraTaxKitab | null>(null);
  const [kitabLoading, setKitabLoading] = useState(false);
  const [kitabAiRunning, setKitabAiRunning] = useState(false);

  const [sources, setSources] = useState<KolamDaraTaxRegulationSource[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceCreating, setSourceCreating] = useState(false);
  const [checkingSourceId, setCheckingSourceId] = useState<string | null>(null);

  const [drafts, setDrafts] = useState<KolamDaraTaxRegulationDraft[]>([]);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [draftFormulas, setDraftFormulas] = useState<
    Record<string, DraftFormulas>
  >({});
  const [draftBusyId, setDraftBusyId] = useState<string | null>(null);

  const [versions, setVersions] = useState<KolamDaraTaxRegulationVersion[]>(
    versionsProp,
  );
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [compareA, setCompareA] = useState('');
  const [compareB, setCompareB] = useState('');
  const [compareResult, setCompareResult] =
    useState<KolamDaraTaxVersionCompare | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [rollbackBusyId, setRollbackBusyId] = useState<string | null>(null);

  const [knowledge, setKnowledge] = useState<KolamDaraTaxKnowledge[]>([]);
  const [knowledgeLoading, setKnowledgeLoading] = useState(false);

  const [auditLogs, setAuditLogs] = useState<KolamDaraTaxAuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const [maintenanceBusy, setMaintenanceBusy] = useState(false);

  useEffect(() => {
    setVersions(versionsProp);
  }, [versionsProp]);

  const rmsTabs = useMemo(
    () =>
      KOLAM_DARA_TAX_RMS_TABS.filter(tab => {
        if (tab.adminOnly && !isAdmin) {
          return false;
        }
        if (tab.approveOnly && !canApprove) {
          return false;
        }
        return true;
      }).map(tab => ({
        id: tab.id,
        label:
          tab.id === 'draft' && pendingDraftCount > 0
            ? `Draft (${pendingDraftCount})`
            : tab.label,
      })),
    [canApprove, isAdmin, pendingDraftCount],
  );

  const activeVersion = useMemo(
    () => versions.find(v => v.status === 'active') ?? null,
    [versions],
  );

  const watcherIsWatching =
    watcherRunning || taxStatus?.watcherManualInFlight === true;

  const loadKitab = useCallback(async () => {
    setKitabLoading(true);
    try {
      setKitab(await fetchKolamDaraTaxKitab());
    } catch (err) {
      setKitab(null);
      onNotice(errorMessage(err, 'Gagal memuat kitab'));
    } finally {
      setKitabLoading(false);
    }
  }, [onNotice]);

  const loadSources = useCallback(async () => {
    setSourcesLoading(true);
    try {
      setSources(await fetchKolamDaraTaxRegulationSources());
    } catch (err) {
      setSources([]);
      onNotice(errorMessage(err, 'Gagal memuat sumber regulasi'));
    } finally {
      setSourcesLoading(false);
    }
  }, [onNotice]);

  const loadDrafts = useCallback(async () => {
    setDraftsLoading(true);
    try {
      const items = await fetchKolamDaraTaxRegulationDrafts();
      setDrafts(items);
      const next: Record<string, DraftFormulas> = {};
      for (const d of items) {
        if (d.status === 'pending_review') {
          next[d.id] = {
            ppnRate: d.ppnRate ?? undefined,
            pph23Rate: d.pph23Rate ?? undefined,
            umkmFinalRate: d.umkmFinalRate ?? undefined,
          };
        }
      }
      setDraftFormulas(next);
    } catch (err) {
      setDrafts([]);
      onNotice(errorMessage(err, 'Gagal memuat draft'));
    } finally {
      setDraftsLoading(false);
    }
  }, [onNotice]);

  const loadVersions = useCallback(async () => {
    setVersionsLoading(true);
    try {
      setVersions(await fetchKolamDaraTaxRegulationVersions());
    } catch (err) {
      onNotice(errorMessage(err, 'Gagal memuat versi'));
    } finally {
      setVersionsLoading(false);
    }
  }, [onNotice]);

  const loadKnowledge = useCallback(async () => {
    setKnowledgeLoading(true);
    try {
      setKnowledge(await fetchKolamDaraTaxKnowledge());
    } catch (err) {
      setKnowledge([]);
      onNotice(errorMessage(err, 'Gagal memuat knowledge'));
    } finally {
      setKnowledgeLoading(false);
    }
  }, [onNotice]);

  const loadAudit = useCallback(async () => {
    setAuditLoading(true);
    try {
      setAuditLogs(await fetchKolamDaraTaxAuditLogs());
    } catch (err) {
      setAuditLogs([]);
      onNotice(errorMessage(err, 'Gagal memuat audit log'));
    } finally {
      setAuditLoading(false);
    }
  }, [onNotice]);

  useEffect(() => {
    if (rmsSubTab === 'kitab') {
      void loadKitab();
    }
  }, [loadKitab, rmsSubTab]);

  useEffect(() => {
    if (rmsSubTab === 'sumber') {
      void loadSources();
    }
  }, [loadSources, rmsSubTab]);

  useEffect(() => {
    if (rmsSubTab === 'draft') {
      void loadDrafts();
    }
  }, [loadDrafts, rmsSubTab]);

  useEffect(() => {
    if (rmsSubTab === 'versi') {
      void loadVersions();
    }
  }, [loadVersions, rmsSubTab]);

  useEffect(() => {
    if (rmsSubTab === 'kb') {
      void loadKnowledge();
    }
  }, [loadKnowledge, rmsSubTab]);

  useEffect(() => {
    if (rmsSubTab === 'audit' && canApprove) {
      void loadAudit();
    }
  }, [canApprove, loadAudit, rmsSubTab]);

  if (!taxEnabled) {
    return null;
  }

  const versionOptions = [
    {label: 'Pilih…', value: ''},
    ...versions.map(v => ({
      label: v.versionNumber || v.id,
      value: v.id,
    })),
  ];

  return (
    <View style={styles.root}>
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      <KolamSurfacePanelTabs
        onSelectTab={setRmsSubTab}
        selectedTabId={rmsSubTab}
        tabs={rmsTabs}
      />

      {rmsSubTab === 'ringkasan' ? (
        <View style={styles.stack}>
          {!activeVersion && isAdmin ? (
            <View style={styles.roseBanner}>
              <Text style={styles.roseText}>
                Belum ada versi regulasi aktif. Jalankan Bootstrap di
                Maintenance.
              </Text>
            </View>
          ) : null}

          {activeVersion ? (
            <View style={styles.card}>
              <Text style={styles.meta}>Regulasi aktif</Text>
              <Text style={styles.sectionTitle}>
                {`${activeVersion.versionNumber} — ${activeVersion.title}`}
              </Text>
              <Text style={styles.meta}>
                {`PPN ${activeVersion.ppnRate ?? 11}% · berlaku ${formatKolamDaraTaxDateId(
                  activeVersion.effectiveDate,
                )}`}
              </Text>
            </View>
          ) : null}

          {monitoringLoading ? (
            <Text style={styles.meta}>Memuat…</Text>
          ) : (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Regulation Watcher</Text>
              <Text style={styles.meta}>
                Pantau perubahan regulasi dari sumber eksternal. Toggle modul di
                Settings → AI-Tools.
              </Text>
              {taxStatus ? (
                <View style={styles.dl}>
                  <View style={styles.dlItem}>
                    <Text style={styles.meta}>Status runtime</Text>
                    <Text style={styles.tdStrong}>
                      {taxStatus.watcherRuntimeStatus || '—'}
                    </Text>
                  </View>
                  <View style={styles.dlItem}>
                    <Text style={styles.meta}>Jadwal</Text>
                    <Text style={styles.td}>
                      {`${taxStatus.watcherCron || '—'} (${
                        taxStatus.watcherTimezone || '—'
                      })`}
                    </Text>
                  </View>
                  <View style={styles.dlItem}>
                    <Text style={styles.meta}>Ringkasan</Text>
                    <Text style={styles.td}>
                      {`${taxStatus.monitored}/${taxStatus.total} sumber dimonitor${
                        taxStatus.withError > 0
                          ? ` · ${taxStatus.withError} error`
                          : ''
                      }${
                        taxStatus.dueNow > 0
                          ? ` · ${taxStatus.dueNow} perlu cek`
                          : ''
                      }`}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.meta}>Status watcher belum dimuat.</Text>
              )}

              {(taxStatus?.sources.length ?? 0) > 0 ? (
                <View>
                  <View style={styles.tableHead}>
                    <Text style={[styles.th, styles.colSource]}>Sumber</Text>
                    <Text style={[styles.th, styles.colStatus]}>Status</Text>
                    <Text style={[styles.th, styles.colChecked]}>
                      Terakhir cek
                    </Text>
                  </View>
                  {taxStatus!.sources.map(src => (
                    <View key={src.id} style={styles.tableRow}>
                      <View style={styles.colSource}>
                        <Pressable
                          accessibilityRole="link"
                          disabled={!src.url}
                          onPress={() => {
                            if (src.url) {
                              void Linking.openURL(src.url);
                            }
                          }}>
                          <Text style={styles.link}>{src.name || src.url}</Text>
                        </Pressable>
                      </View>
                      <View style={styles.colStatus}>
                        <KolamStatusBadge
                          intent={watchStatusIntent(src.watchStatus)}
                          label={
                            KOLAM_DARA_TAX_WATCH_STATUS_LABEL[src.watchStatus] ??
                            src.watchStatus
                          }
                        />
                      </View>
                      <Text style={[styles.tdMono, styles.colChecked]}>
                        {formatKolamDaraTaxDateTimeId(src.lastCheckedAt)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {isAdmin ? (
                <View style={styles.rowActions}>
                  {watcherIsWatching ? (
                    <KolamButton
                      disabled
                      intent="outline"
                      label="Sedang memeriksa…"
                    />
                  ) : (
                    <KolamButton
                      disabled={
                        !taxStatus?.watcherEnabled || watcherRunning
                      }
                      intent="outline"
                      label={
                        watcherRunning
                          ? 'Memeriksa…'
                          : 'Jalankan watcher sekarang'
                      }
                      onPress={onRunWatcher}
                    />
                  )}
                </View>
              ) : null}

              {taxStatus?.checkedAt ? (
                <Text style={styles.meta}>
                  {`Snapshot: ${formatKolamDaraTaxDateTimeId(
                    taxStatus.checkedAt,
                  )}`}
                </Text>
              ) : null}
            </View>
          )}
        </View>
      ) : null}

      {rmsSubTab === 'kitab' ? (
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.flexShrink}>
              <Text style={styles.sectionTitle}>Kitab regulasi</Text>
              {kitab ? (
                <Text style={styles.meta}>
                  {[kitab.legalName, kitab.taxpayerLabel]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </Text>
              ) : null}
              {kitab?.activeVersionNumber || kitab?.activeTitle ? (
                <Text style={styles.meta}>
                  {[kitab.activeVersionNumber, kitab.activeTitle]
                    .filter(Boolean)
                    .join(' — ')}
                </Text>
              ) : null}
            </View>
            <View style={styles.rowActions}>
              <KolamButton
                intent="outline"
                label="Muat ulang"
                onPress={() => {
                  void loadKitab();
                }}
              />
              {isAdmin ? (
                <KolamButton
                  disabled={kitabAiRunning}
                  intent="primary"
                  label={kitabAiRunning ? 'AI mengisi…' : 'Isi AI'}
                  onPress={() => {
                    setKitabAiRunning(true);
                    aiFillKolamDaraTaxKitab()
                      .then(result => {
                        setKitab(result);
                        onNotice('Kitab diisi AI');
                      })
                      .catch(err =>
                        onNotice(
                          errorMessage(err, 'Gagal isi kitab via AI'),
                        ),
                      )
                      .finally(() => setKitabAiRunning(false));
                  }}
                />
              ) : null}
            </View>
          </View>

          {kitabLoading && !kitab ? (
            <Text style={styles.meta}>Memuat kitab…</Text>
          ) : kitab ? (
            <>
              <View style={styles.tableHead}>
                <Text style={[styles.th, styles.colModul]}>Modul</Text>
                <Text style={[styles.th, styles.colFormula]}>Rumus</Text>
                <Text style={[styles.th, styles.colHukum]}>Hukum</Text>
                <Text style={[styles.th, styles.colStatus]}>Status</Text>
              </View>
              {kitab.rows.map(row => (
                <View
                  key={row.moduleId || row.modul}
                  style={styles.tableRow}>
                  <Text style={[styles.tdStrong, styles.colModul]}>
                    {row.modul}
                  </Text>
                  <Text style={[styles.tdMono, styles.colFormula]}>
                    {row.systemFormula || '—'}
                  </Text>
                  <Text style={[styles.td, styles.colHukum]}>
                    {row.dasarHukum || '—'}
                  </Text>
                  <View style={styles.colStatus}>
                    <KolamStatusBadge
                      intent={kitabStatusIntent(row.statusCode)}
                      label={row.statusLabel || row.statusCode || '—'}
                    />
                  </View>
                </View>
              ))}
              {kitab.disclaimer ? (
                <Text style={styles.metaTiny}>{kitab.disclaimer}</Text>
              ) : null}
            </>
          ) : null}
        </View>
      ) : null}

      {rmsSubTab === 'sumber' ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sumber</Text>
          {sourcesLoading ? (
            <Text style={styles.meta}>Memuat…</Text>
          ) : (
            <>
              {sources.length === 0 ? (
                <Text style={styles.meta}>Belum ada sumber.</Text>
              ) : (
                sources.map(src => (
                  <View key={src.id} style={styles.listCard}>
                    <View style={styles.cardHead}>
                      <Pressable
                        accessibilityRole="link"
                        disabled={!src.url}
                        onPress={() => {
                          if (src.url) {
                            void Linking.openURL(src.url);
                          }
                        }}
                        style={styles.flexShrink}>
                        <Text style={styles.tdStrong}>{src.name}</Text>
                        <Text style={styles.link}>{src.url}</Text>
                      </Pressable>
                      <KolamStatusBadge
                        intent={
                          src.isActive === false
                            ? 'secondary'
                            : watchStatusIntent(src.watchStatus)
                        }
                        label={
                          src.isActive === false
                            ? 'Nonaktif'
                            : KOLAM_DARA_TAX_WATCH_STATUS_LABEL[
                                src.watchStatus
                              ] ??
                              (src.watchStatus || '—')
                        }
                      />
                    </View>
                    {isAdmin ? (
                      <View style={styles.rowActions}>
                        <KolamButton
                          disabled={checkingSourceId != null}
                          intent="outline"
                          label={
                            checkingSourceId === src.id ? 'Mengecek…' : 'Cek'
                          }
                          onPress={() => {
                            setCheckingSourceId(src.id);
                            checkKolamDaraTaxRegulationSource(src.id)
                              .then(r => {
                                if (r.error) {
                                  onNotice(r.error);
                                } else if (r.changed) {
                                  onNotice(
                                    'Perubahan terdeteksi — cek tab Draft',
                                  );
                                } else {
                                  onNotice('Tidak ada perubahan');
                                }
                                void loadSources();
                                onRefreshMonitoring();
                              })
                              .catch(err =>
                                onNotice(errorMessage(err, 'Gagal cek URL')),
                              )
                              .finally(() => setCheckingSourceId(null));
                          }}
                        />
                        {src.isActive !== false ? (
                          <KolamButton
                            intent="outline"
                            label="Nonaktifkan"
                            onPress={() => {
                              deleteKolamDaraTaxRegulationSource(src.id)
                                .then(() => {
                                  onNotice('Sumber dinonaktifkan');
                                  void loadSources();
                                  onRefreshMonitoring();
                                })
                                .catch(err =>
                                  onNotice(
                                    errorMessage(
                                      err,
                                      'Gagal menonaktifkan sumber',
                                    ),
                                  ),
                                );
                            }}
                          />
                        ) : null}
                      </View>
                    ) : null}
                  </View>
                ))
              )}

              {isAdmin ? (
                <View style={styles.addForm}>
                  <Text style={styles.tdStrong}>Tambah sumber</Text>
                  <TextInput
                    accessibilityLabel="Nama"
                    onChangeText={setSourceName}
                    placeholder="Nama"
                    placeholderTextColor={V.colors.mutedFg}
                    style={styles.input}
                    value={sourceName}
                  />
                  <TextInput
                    accessibilityLabel="URL"
                    autoCapitalize="none"
                    onChangeText={setSourceUrl}
                    placeholder="URL"
                    placeholderTextColor={V.colors.mutedFg}
                    style={styles.input}
                    value={sourceUrl}
                  />
                  <KolamButton
                    disabled={sourceCreating}
                    intent="outline"
                    label={sourceCreating ? 'Menambah…' : 'Tambah'}
                    onPress={() => {
                      if (!sourceName.trim() || !sourceUrl.trim()) {
                        onNotice('Nama dan URL wajib');
                        return;
                      }
                      setSourceCreating(true);
                      createKolamDaraTaxRegulationSource({
                        name: sourceName.trim(),
                        url: sourceUrl.trim(),
                        authority: 'manual',
                        checkIntervalHours: 24,
                        isActive: true,
                      })
                        .then(() => {
                          onNotice('Sumber ditambahkan');
                          setSourceName('');
                          setSourceUrl('');
                          void loadSources();
                          onRefreshMonitoring();
                        })
                        .catch(err =>
                          onNotice(
                            errorMessage(err, 'Gagal menambah sumber'),
                          ),
                        )
                        .finally(() => setSourceCreating(false));
                    }}
                  />
                </View>
              ) : null}
            </>
          )}
        </View>
      ) : null}

      {rmsSubTab === 'draft' ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Draft regulasi</Text>
          {draftsLoading ? (
            <Text style={styles.meta}>Memuat…</Text>
          ) : drafts.length === 0 ? (
            <Text style={styles.meta}>Tidak ada draft.</Text>
          ) : (
            drafts.map(d => {
              const pending = d.status === 'pending_review';
              const f = draftFormulas[d.id] ?? {};
              return (
                <View key={d.id} style={styles.listCard}>
                  <View style={styles.cardHead}>
                    <Text style={[styles.tdStrong, styles.flexShrink]}>
                      {d.title}
                    </Text>
                    <KolamStatusBadge
                      intent={draftStatusIntent(d.status)}
                      label={d.status}
                    />
                  </View>
                  <Text style={styles.meta}>
                    {d.changeDiffSummary || d.aiSummary || '—'}
                  </Text>
                  {d.lawReferences.length > 0 ? (
                    <Text style={styles.meta}>
                      {d.lawReferences.join(' · ')}
                    </Text>
                  ) : null}
                  {pending && canApprove ? (
                    <>
                      <View style={styles.formulaRow}>
                        <View style={styles.formulaField}>
                          <Text style={styles.meta}>PPN %</Text>
                          <TextInput
                            keyboardType="numeric"
                            onChangeText={v =>
                              setDraftFormulas(prev => ({
                                ...prev,
                                [d.id]: {
                                  ...prev[d.id],
                                  ppnRate: Number(v) || 0,
                                },
                              }))
                            }
                            placeholderTextColor={V.colors.mutedFg}
                            style={styles.input}
                            value={String(f.ppnRate ?? '')}
                          />
                        </View>
                        <View style={styles.formulaField}>
                          <Text style={styles.meta}>PPh 23 %</Text>
                          <TextInput
                            keyboardType="numeric"
                            onChangeText={v =>
                              setDraftFormulas(prev => ({
                                ...prev,
                                [d.id]: {
                                  ...prev[d.id],
                                  pph23Rate: Number(v) || 0,
                                },
                              }))
                            }
                            placeholderTextColor={V.colors.mutedFg}
                            style={styles.input}
                            value={String(f.pph23Rate ?? '')}
                          />
                        </View>
                        <View style={styles.formulaField}>
                          <Text style={styles.meta}>UMKM final %</Text>
                          <TextInput
                            keyboardType="numeric"
                            onChangeText={v =>
                              setDraftFormulas(prev => ({
                                ...prev,
                                [d.id]: {
                                  ...prev[d.id],
                                  umkmFinalRate: Number(v) || 0,
                                },
                              }))
                            }
                            placeholderTextColor={V.colors.mutedFg}
                            style={styles.input}
                            value={String(f.umkmFinalRate ?? '')}
                          />
                        </View>
                      </View>
                      <View style={styles.rowActions}>
                        <KolamButton
                          disabled={draftBusyId === d.id}
                          intent="primary"
                          label="Approve"
                          onPress={() => {
                            setDraftBusyId(d.id);
                            approveKolamDaraTaxRegulationDraft(d.id, {
                              note: 'Approved via RMS',
                              formulas: draftFormulas[d.id],
                            })
                              .then(() => {
                                onNotice('Disetujui');
                                void loadDrafts();
                                onRefreshMonitoring();
                              })
                              .catch(err =>
                                onNotice(
                                  errorMessage(err, 'Gagal approve'),
                                ),
                              )
                              .finally(() => setDraftBusyId(null));
                          }}
                        />
                        <KolamButton
                          disabled={draftBusyId === d.id}
                          intent="outline"
                          label="Tolak"
                          onPress={() => {
                            setDraftBusyId(d.id);
                            rejectKolamDaraTaxRegulationDraft(
                              d.id,
                              'Rejected via RMS',
                            )
                              .then(() => {
                                onNotice('Ditolak');
                                void loadDrafts();
                                onRefreshMonitoring();
                              })
                              .catch(err =>
                                onNotice(errorMessage(err, 'Gagal tolak')),
                              )
                              .finally(() => setDraftBusyId(null));
                          }}
                        />
                      </View>
                    </>
                  ) : null}
                </View>
              );
            })
          )}
        </View>
      ) : null}

      {rmsSubTab === 'versi' ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Versi regulasi</Text>
          {versionsLoading ? (
            <Text style={styles.meta}>Memuat…</Text>
          ) : (
            <>
              {versions.length === 0 ? (
                <Text style={styles.meta}>Belum ada versi.</Text>
              ) : (
                versions.map(v => (
                  <View key={v.id} style={styles.listCard}>
                    <View style={styles.cardHead}>
                      <View style={styles.flexShrink}>
                        <Text style={styles.tdStrong}>
                          {`${v.versionNumber} — ${v.title}`}
                        </Text>
                        <Text style={styles.meta}>
                          {`PPN ${v.ppnRate ?? '—'}% · ${formatKolamDaraTaxDateId(
                            v.effectiveDate,
                          )}`}
                        </Text>
                      </View>
                      <View style={styles.rowActions}>
                        <KolamStatusBadge
                          intent={versionStatusIntent(v.status)}
                          label={v.status}
                        />
                        {canApprove && v.status === 'superseded' ? (
                          <KolamButton
                            disabled={rollbackBusyId === v.id}
                            intent="outline"
                            label="Rollback"
                            onPress={() => {
                              setRollbackBusyId(v.id);
                              rollbackKolamDaraTaxRegulationVersion(
                                v.id,
                                'Rollback via RMS',
                              )
                                .then(() => {
                                  onNotice('Rollback OK');
                                  void loadVersions();
                                  onRefreshMonitoring();
                                })
                                .catch(err =>
                                  onNotice(
                                    errorMessage(err, 'Rollback gagal'),
                                  ),
                                )
                                .finally(() => setRollbackBusyId(null));
                            }}
                          />
                        ) : null}
                      </View>
                    </View>
                  </View>
                ))
              )}

              <View style={styles.compareRow}>
                <View style={styles.compareSelect}>
                  <KolamDropdownSelect
                    label="Versi A"
                    onChange={setCompareA}
                    options={versionOptions}
                    value={compareA}
                  />
                </View>
                <View style={styles.compareSelect}>
                  <KolamDropdownSelect
                    label="Versi B"
                    onChange={setCompareB}
                    options={versionOptions}
                    value={compareB}
                  />
                </View>
                <KolamButton
                  disabled={!compareA || !compareB || compareLoading}
                  intent="outline"
                  label="Bandingkan"
                  onPress={() => {
                    setCompareLoading(true);
                    compareKolamDaraTaxRegulationVersions(compareA, compareB)
                      .then(setCompareResult)
                      .catch(err =>
                        onNotice(errorMessage(err, 'Compare gagal')),
                      )
                      .finally(() => setCompareLoading(false));
                  }}
                />
              </View>

              {compareResult ? (
                <View style={styles.compareResult}>
                  <Text style={styles.tdStrong}>{compareResult.summary}</Text>
                  {compareResult.formulaDiffs.map(row => (
                    <Text key={row.field} style={styles.meta}>
                      {`${row.field}: ${row.before} → ${row.after}`}
                    </Text>
                  ))}
                </View>
              ) : null}
            </>
          )}
        </View>
      ) : null}

      {rmsSubTab === 'kb' ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Knowledge base</Text>
          {knowledgeLoading ? (
            <Text style={styles.meta}>Memuat…</Text>
          ) : knowledge.length === 0 ? (
            <Text style={styles.meta}>Belum ada artikel.</Text>
          ) : (
            <>
              <View style={styles.tableHead}>
                <Text style={[styles.th, styles.colTitle]}>Judul</Text>
                <Text style={[styles.th, styles.colCategory]}>Kategori</Text>
                <Text style={[styles.th, styles.colChecked]}>Diperbarui</Text>
              </View>
              {knowledge.map(k => (
                <View key={k.id} style={styles.tableRow}>
                  <Text style={[styles.td, styles.colTitle]}>{k.title}</Text>
                  <Text style={[styles.meta, styles.colCategory]}>
                    {k.category}
                  </Text>
                  <Text style={[styles.tdMono, styles.colChecked]}>
                    {formatKolamDaraTaxDateId(k.updatedAt)}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>
      ) : null}

      {rmsSubTab === 'audit' && canApprove ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Audit log</Text>
          {auditLoading ? (
            <Text style={styles.meta}>Memuat…</Text>
          ) : auditLogs.length === 0 ? (
            <Text style={styles.meta}>Belum ada entri.</Text>
          ) : (
            auditLogs.map(row => (
              <View key={row.id} style={styles.listCard}>
                <Text style={styles.tdMono}>
                  {formatKolamDaraTaxDateTimeId(row.createdAt)}
                </Text>
                <Text style={styles.tdStrong}>{row.action}</Text>
                {row.toolName ? (
                  <Text style={styles.meta}>{row.toolName}</Text>
                ) : null}
                <Text style={styles.td}>{row.resultSummary || '—'}</Text>
              </View>
            ))
          )}
        </View>
      ) : null}

      {rmsSubTab === 'maintenance' && isAdmin ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Maintenance</Text>
          <View style={styles.rowActions}>
            <KolamButton
              disabled={maintenanceBusy}
              intent="primary"
              label="Bootstrap knowledge ID"
              onPress={() => {
                setMaintenanceBusy(true);
                runKolamDaraTaxBootstrap()
                  .then(() => {
                    onNotice('Bootstrap OK');
                    onRefreshMonitoring();
                  })
                  .catch(() => onNotice('Bootstrap gagal'))
                  .finally(() => setMaintenanceBusy(false));
              }}
            />
            <KolamButton
              disabled={maintenanceBusy}
              intent="outline"
              label={
                maintenanceBusy
                  ? 'Backfill…'
                  : 'Backfill snapshot (dry-run)'
              }
              onPress={() => {
                setMaintenanceBusy(true);
                runKolamDaraTaxSnapshotBackfill({dryRun: true, limit: 100})
                  .then(msg => {
                    onNotice(msg || 'Dry-run selesai');
                    onRefreshMonitoring();
                  })
                  .catch(() => onNotice('Backfill dry-run gagal'))
                  .finally(() => setMaintenanceBusy(false));
              }}
            />
            <KolamButton
              disabled={maintenanceBusy}
              intent="outline"
              label="Backfill snapshot (apply)"
              onPress={() => {
                setMaintenanceBusy(true);
                runKolamDaraTaxSnapshotBackfill({dryRun: false, limit: 200})
                  .then(msg => {
                    onNotice(msg || 'Backfill diterapkan');
                    onRefreshMonitoring();
                  })
                  .catch(() => onNotice('Backfill gagal'))
                  .finally(() => setMaintenanceBusy(false));
              }}
            />
            <KolamButton
              disabled={maintenanceBusy}
              intent="outline"
              label="Dry-run reaccrue PPh 21"
              onPress={() => {
                setMaintenanceBusy(true);
                runKolamDaraTaxReaccruePph21({dryRun: true, limit: 500})
                  .then(msg => onNotice(msg || 'Dry-run selesai'))
                  .catch(() => onNotice('Gagal'))
                  .finally(() => setMaintenanceBusy(false));
              }}
            />
            <KolamButton
              disabled={maintenanceBusy}
              intent="outline"
              label="Apply reaccrue PPh 21"
              onPress={() => {
                setMaintenanceBusy(true);
                runKolamDaraTaxReaccruePph21({dryRun: false, limit: 500})
                  .then(msg => onNotice(msg || 'Diterapkan'))
                  .catch(() => onNotice('Gagal'))
                  .finally(() => setMaintenanceBusy(false));
              }}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
  },
  stack: {
    gap: 12,
  },
  notice: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  meta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    lineHeight: 17,
  },
  metaTiny: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 4,
  },
  roseBanner: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  roseText: {
    color: '#881337',
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 18,
  },
  card: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  listCard: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 10,
  },
  cardHead: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: V.colors.fg,
    flexShrink: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  dl: {
    gap: 8,
  },
  dlItem: {
    gap: 2,
  },
  tableHead: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 6,
  },
  tableRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 6,
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
  tdMono: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  colSource: {flex: 1.4, minWidth: 100},
  colStatus: {flex: 1, minWidth: 72},
  colChecked: {flex: 1, minWidth: 80},
  colModul: {flex: 1.2, minWidth: 90},
  colFormula: {flex: 1.2, minWidth: 90},
  colHukum: {flex: 1.4, minWidth: 100},
  colTitle: {flex: 1.6, minWidth: 120},
  colCategory: {flex: 1, minWidth: 80},
  link: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  rowActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flexShrink: {
    flex: 1,
    flexShrink: 1,
    gap: 2,
    minWidth: 140,
  },
  input: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    minHeight: 34,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addForm: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: 8,
    marginTop: 4,
    padding: 10,
  },
  formulaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  formulaField: {
    flexGrow: 1,
    gap: 4,
    minWidth: 100,
  },
  compareRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  compareSelect: {
    flexGrow: 1,
    minWidth: 140,
  },
  compareResult: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 10,
  },
});
