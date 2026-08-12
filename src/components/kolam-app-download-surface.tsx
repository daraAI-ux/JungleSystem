import React from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, {Circle, Path, Rect} from 'react-native-svg';
import {useKolamAuthContext} from '../context/kolam-app-contexts';
import {
  formatKolamAppDownloadFileSize,
  type KolamAppDownloadArtifact,
  type KolamAppDownloadPlatform,
  type KolamAppDownloadVersion,
  type KolamSupportingApp,
} from '../domain/kolam-app-download';
import {isTopNavAdminRole} from '../domain/top-nav';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {copyTextToClipboard} from '../lib/native-clipboard';
import {pickNativeAssetFile} from '../services/native-file-picker';
import {
  createKolamSupportingApp,
  deleteKolamAppDownloadArtifact,
  deleteKolamAppDownloadVersion,
  deleteKolamSupportingApp,
  getKolamAppDownloadArtifactUrl,
  getKolamAppDownloads,
  updateKolamSupportingApp,
  uploadKolamAppDownloadVersion,
  type KolamAppDownloadPickedFile,
} from '../services/kolam-app-download-api';
import {KolamButton} from './kolam-button';
import {KolamDeleteButton} from './kolam-delete-button';
import {KolamConfirmDialog} from './kolam-confirm-dialog';
import {KolamDetailScrollSurface} from './kolam-detail-scroll-surface';
import {KolamFormTextField} from './kolam-form-text-field';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {KolamNotesDisplay, KolamNotesField} from './kolam-notes-field';
import {KolamSaveButton} from './kolam-save-button';
import {KolamSettingsWebFieldLabel} from './kolam-settings-web-field-label';
import {kolamTableToolbarStyles} from './kolam-table-toolbar-styles';
import {KolamUploadButton} from './kolam-upload-button';

type DownloadSurfaceMode = 'catalog' | 'admin';

type DeleteTarget =
  | {type: 'app'; app: KolamSupportingApp}
  | {type: 'version'; app: KolamSupportingApp; version: KolamAppDownloadVersion}
  | {
      type: 'artifact';
      app: KolamSupportingApp;
      version: KolamAppDownloadVersion;
      artifact: KolamAppDownloadArtifact;
    };

export function KolamAppDownloadSurface() {
  const {authUser} = useKolamAuthContext();
  const [apps, setApps] = React.useState<KolamSupportingApp[]>([]);
  const [expandedVersions, setExpandedVersions] = React.useState<
    Record<string, string>
  >({});
  const [mode, setMode] = React.useState<DownloadSurfaceMode>('catalog');
  const [loading, setLoading] = React.useState(false);
  const [acting, setActing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<DeleteTarget | null>(
    null,
  );
  const {width} = useWindowDimensions();
  const isAdmin = isTopNavAdminRole(authUser?.roleKey);

  React.useEffect(() => {
    if (!isAdmin && mode === 'admin') {
      setMode('catalog');
    }
  }, [isAdmin, mode]);

  const refreshApps = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nextApps = await getKolamAppDownloads({admin: mode === 'admin'});
      setApps(nextApps);
      setExpandedVersions(current => {
        const nextExpanded: Record<string, string> = {};

        nextApps.forEach(app => {
          const currentVersion = current[app.id];
          nextExpanded[app.id] = app.versions.some(
            version => version.id === currentVersion,
          )
            ? currentVersion
            : app.versions[0]?.id ?? '';
        });

        return nextExpanded;
      });
    } catch (cause) {
      setApps([]);
      setError(
        cause instanceof Error
          ? cause.message
          : 'Gagal memuat daftar aplikasi.',
      );
    } finally {
      setLoading(false);
    }
  }, [mode]);

  const loadApps = React.useCallback(() => {
    let active = true;

    setLoading(true);
    setError(null);
    getKolamAppDownloads({admin: mode === 'admin'})
      .then(nextApps => {
        if (!active) {
          return;
        }

        setApps(nextApps);
        setExpandedVersions(current => {
          const nextExpanded: Record<string, string> = {};

          nextApps.forEach(app => {
            const currentVersion = current[app.id];
            nextExpanded[app.id] = app.versions.some(
              version => version.id === currentVersion,
            )
              ? currentVersion
              : app.versions[0]?.id ?? '';
          });

          return nextExpanded;
        });
      })
      .catch(cause => {
        if (!active) {
          return;
        }

        setApps([]);
        setError(
          cause instanceof Error
            ? cause.message
            : 'Gagal memuat daftar aplikasi.',
        );
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [mode]);

  React.useEffect(() => loadApps(), [loadApps]);

  const compact = width < 900;

  const runMutation = React.useCallback(
    async (action: () => Promise<void>, successText: string) => {
      setActing(true);
      setError(null);
      setMessage(null);
      try {
        await action();
        await refreshApps();
        setMessage(successText);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Gagal.');
      } finally {
        setActing(false);
      }
    },
    [refreshApps],
  );

  const confirmDelete = React.useCallback(async () => {
    if (!deleteTarget) {
      return;
    }

    const target = deleteTarget;
    setDeleteTarget(null);
    await runMutation(async () => {
      if (target.type === 'app') {
        await deleteKolamSupportingApp(target.app.id);
        return;
      }

      if (target.type === 'version') {
        await deleteKolamAppDownloadVersion(target.app.id, target.version.id);
        return;
      }

      await deleteKolamAppDownloadArtifact(
        target.app.id,
        target.version.id,
        target.artifact.id,
      );
    }, 'Dihapus');
  }, [deleteTarget, runMutation]);

  return (
    <View style={styles.root}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text style={styles.summaryText}>
              {loading ? 'Memuat' : `${apps.length} aplikasi`}
            </Text>
          </View>
          {isAdmin ? (
            <View style={kolamTableToolbarStyles.actions}>
              <KolamButton
                intent={mode === 'catalog' ? 'primary' : 'outline'}
                label="Unduh"
                onPress={() => setMode('catalog')}
              />
              <KolamButton
                intent={mode === 'admin' ? 'primary' : 'outline'}
                label="Kelola"
                onPress={() => setMode('admin')}
              />
            </View>
          ) : null}
        </View>
      </View>

      {message ? <Text style={styles.successText}>{message}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {!error && !loading && apps.length === 0 && mode === 'catalog' ? (
        <Text style={styles.emptyText}>
          Belum ada aplikasi pendukung yang dipublikasikan.
        </Text>
      ) : null}

      <KolamDetailScrollSurface contentContainerStyle={styles.list}>
        {mode === 'admin' && isAdmin ? (
          <KolamAppDownloadAdminPanel
            acting={acting}
            apps={apps}
            onCreateApp={input =>
              runMutation(
                () => createKolamSupportingApp(input).then(() => undefined),
                'Aplikasi dibuat',
              )
            }
            onDelete={setDeleteTarget}
            onPickFile={pickAppDownloadInstallerFile}
            onUpdateApp={(appId, input) =>
              runMutation(
                () =>
                  updateKolamSupportingApp(appId, input).then(() => undefined),
                'Disimpan',
              )
            }
            onUploadVersion={(appId, input) =>
              runMutation(
                () =>
                  uploadKolamAppDownloadVersion(appId, input).then(
                    () => undefined,
                  ),
                'Versi diunggah',
              )
            }
          />
        ) : (
          apps.map(app => (
            <KolamAppDownloadCard
              app={app}
              compact={compact}
              expandedVersionId={expandedVersions[app.id] ?? ''}
              key={app.id}
              onCopyMd5={async md5 => {
                await copyTextToClipboard(md5);
                setMessage('MD5 disalin');
              }}
              onDownload={async ({artifact, version}) => {
                setMessage(null);
                const url = getKolamAppDownloadArtifactUrl({
                  appId: app.id,
                  artifact,
                  versionId: version.id,
                });
                await Linking.openURL(url);
              }}
              onSelectVersion={versionId => {
                setExpandedVersions(current => ({
                  ...current,
                  [app.id]: versionId,
                }));
              }}
            />
          ))
        )}
      </KolamDetailScrollSurface>

      <KolamConfirmDialog
        destructive
        confirmLabel={acting ? 'Menghapus...' : 'Hapus'}
        message={getDeleteMessage(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          confirmDelete().catch(() => undefined);
        }}
        title="Hapus"
        visible={Boolean(deleteTarget)}
      />
    </View>
  );
}

function KolamAppDownloadAdminPanel({
  acting,
  apps,
  onCreateApp,
  onDelete,
  onPickFile,
  onUpdateApp,
  onUploadVersion,
}: {
  acting: boolean;
  apps: KolamSupportingApp[];
  onCreateApp: (input: {
    name: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
  }) => Promise<void>;
  onDelete: (target: DeleteTarget) => void;
  onPickFile: () => Promise<KolamAppDownloadPickedFile | null>;
  onUpdateApp: (
    appId: string,
    input: {
      name?: string;
      description?: string;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) => Promise<void>;
  onUploadVersion: (
    appId: string,
    input: {
      version: string;
      releaseNotes?: string;
      files: KolamAppDownloadPickedFile[];
    },
  ) => Promise<void>;
}) {
  return (
    <View style={styles.adminStack}>
      <NewAppForm acting={acting} onCreate={onCreateApp} />
      {apps.length === 0 ? (
        <Text style={styles.emptyText}>Belum ada aplikasi.</Text>
      ) : (
        apps.map(app => (
          <ManageAppCard
            acting={acting}
            app={app}
            key={`${app.id}-${app.versionCount}-${app.isActive}`}
            onDelete={onDelete}
            onPickFile={onPickFile}
            onUpdateApp={onUpdateApp}
            onUploadVersion={onUploadVersion}
          />
        ))
      )}
    </View>
  );
}

function NewAppForm({
  acting,
  onCreate,
}: {
  acting: boolean;
  onCreate: (input: {name: string; description?: string}) => Promise<void>;
}) {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');

  const submit = React.useCallback(async () => {
    if (!name.trim()) {
      return;
    }

    await onCreate({
      name: name.trim(),
      description: description.trim(),
    });
    setName('');
    setDescription('');
  }, [description, name, onCreate]);

  return (
    <View style={styles.adminCard}>
      <Text style={styles.adminCardTitle}>Tambah aplikasi</Text>
      <View style={styles.formGrid}>
        <Field label="Nama" required>
          <KolamFormTextField
            onChangeText={setName}
            placeholder="Kolam Desktop"
            value={name}
          />
        </Field>
        <Field label="Deskripsi" required={false}>
          <KolamFormTextField
            onChangeText={setDescription}
            placeholder="Opsional"
            value={description}
          />
        </Field>
      </View>
      <View style={styles.formActions}>
        <KolamSaveButton
          disabled={acting || !name.trim()}
          intent="primary"
          label={acting ? 'Menyimpan...' : 'Buat aplikasi'}
          onPress={() => {
            submit().catch(() => undefined);
          }}
        />
      </View>
    </View>
  );
}

function ManageAppCard({
  acting,
  app,
  onDelete,
  onPickFile,
  onUpdateApp,
  onUploadVersion,
}: {
  acting: boolean;
  app: KolamSupportingApp;
  onDelete: (target: DeleteTarget) => void;
  onPickFile: () => Promise<KolamAppDownloadPickedFile | null>;
  onUpdateApp: (
    appId: string,
    input: {
      name?: string;
      description?: string;
      sortOrder?: number;
      isActive?: boolean;
    },
  ) => Promise<void>;
  onUploadVersion: (
    appId: string,
    input: {
      version: string;
      releaseNotes?: string;
      files: KolamAppDownloadPickedFile[];
    },
  ) => Promise<void>;
}) {
  const [name, setName] = React.useState(app.name);
  const [description, setDescription] = React.useState(app.description ?? '');
  const [sortOrder, setSortOrder] = React.useState(String(app.sortOrder ?? 0));
  const [isActive, setIsActive] = React.useState(app.isActive !== false);

  React.useEffect(() => {
    setName(app.name);
    setDescription(app.description ?? '');
    setSortOrder(String(app.sortOrder ?? 0));
    setIsActive(app.isActive !== false);
  }, [app.description, app.isActive, app.name, app.sortOrder]);

  const save = React.useCallback(async () => {
    if (!name.trim()) {
      return;
    }

    await onUpdateApp(app.id, {
      name: name.trim(),
      description: description.trim(),
      sortOrder: Number(sortOrder) || 0,
      isActive,
    });
  }, [app.id, description, isActive, name, onUpdateApp, sortOrder]);

  return (
    <View style={styles.adminCard}>
      <View style={styles.adminHeader}>
        <View style={styles.appTitleWrap}>
          <Text style={styles.adminCardTitle}>{app.name}</Text>
          <Text style={styles.adminMeta}>
            {app.isActive ? 'Aktif' : 'Nonaktif'}
          </Text>
        </View>
        <KolamDeleteButton
          disabled={acting}
          intent="danger"
          label="Hapus app"
          onPress={() => onDelete({type: 'app', app})}
        />
      </View>

      <View style={styles.formGrid}>
        <Field label="Nama" required>
          <KolamFormTextField onChangeText={setName} value={name} />
        </Field>
        <Field label="Urutan" required={false}>
          <KolamFormTextField
            mode="numeric"
            onChangeText={setSortOrder}
            value={sortOrder}
          />
        </Field>
        <Field label="Deskripsi" required={false} wide>
          <KolamFormTextField
            multiline
            onChangeText={setDescription}
            value={description}
          />
        </Field>
      </View>

      <View style={styles.activeRow}>
        <Text style={styles.activeLabel}>Tampilkan</Text>
        <KolamButton
          intent={isActive ? 'primary' : 'outline'}
          label={isActive ? 'Aktif' : 'Nonaktif'}
          onPress={() => setIsActive(current => !current)}
        />
      </View>
      <View style={styles.formActions}>
        <KolamSaveButton
          disabled={acting || !name.trim()}
          intent="primary"
          label={acting ? 'Menyimpan...' : 'Simpan metadata'}
          onPress={() => {
            save().catch(() => undefined);
          }}
        />
      </View>

      <UploadVersionForm
        acting={acting}
        appId={app.id}
        onPickFile={onPickFile}
        onUpload={onUploadVersion}
      />

      <View style={styles.versionAdminStack}>
        <Text style={styles.sectionLabel}>Versi terunggah</Text>
        {app.versions.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada versi.</Text>
        ) : (
          app.versions.map(version => (
            <View key={version.id} style={styles.versionAdminCard}>
              <View style={styles.versionAdminHeader}>
                <Text style={styles.versionTitle}>v{version.version}</Text>
                <KolamDeleteButton
                  disabled={acting}
                  intent="outline"
                  label="Hapus versi"
                  onPress={() => onDelete({type: 'version', app, version})}
                />
              </View>
              {version.artifacts.map(artifact => (
                <View key={artifact.id} style={styles.adminArtifactRow}>
                  <PlatformBadge platform={artifact.platform} />
                  <View style={styles.artifactMain}>
                    <Text numberOfLines={1} style={styles.artifactTitle}>
                      {artifact.originalName}
                    </Text>
                    <Text style={styles.artifactFilename}>
                      {formatKolamAppDownloadFileSize(artifact.fileSize)} -{' '}
                      {artifact.md5.slice(0, 8)}...
                    </Text>
                  </View>
                  <KolamDeleteButton
                    disabled={acting}
                    intent="plain"
                    label="Hapus file"
                    onPress={() =>
                      onDelete({type: 'artifact', app, version, artifact})
                    }
                  />
                </View>
              ))}
            </View>
          ))
        )}
      </View>
    </View>
  );
}

function UploadVersionForm({
  acting,
  appId,
  onPickFile,
  onUpload,
}: {
  acting: boolean;
  appId: string;
  onPickFile: () => Promise<KolamAppDownloadPickedFile | null>;
  onUpload: (
    appId: string,
    input: {
      version: string;
      releaseNotes?: string;
      files: KolamAppDownloadPickedFile[];
    },
  ) => Promise<void>;
}) {
  const [version, setVersion] = React.useState('');
  const [releaseNotes, setReleaseNotes] = React.useState('');
  const [files, setFiles] = React.useState<KolamAppDownloadPickedFile[]>([]);

  const addFile = React.useCallback(async () => {
    const file = await onPickFile();
    if (!file) {
      return;
    }

    setFiles(current => [...current, file].slice(0, 12));
  }, [onPickFile]);

  const submit = React.useCallback(async () => {
    if (!version.trim() || files.length === 0) {
      return;
    }

    await onUpload(appId, {
      version: version.trim(),
      releaseNotes: releaseNotes.trim(),
      files,
    });
    setVersion('');
    setReleaseNotes('');
    setFiles([]);
  }, [appId, files, onUpload, releaseNotes, version]);

  return (
    <View style={styles.uploadBox}>
      <Text style={styles.sectionLabel}>Unggah versi baru</Text>
      <View style={styles.formGrid}>
        <Field label="Versi" required>
          <KolamFormTextField
            onChangeText={setVersion}
            placeholder="1.0.0"
            value={version}
          />
        </Field>
        <KolamNotesField
          label="Catatan rilis"
          onChangeText={setReleaseNotes}
          placeholder="Opsional"
          value={releaseNotes}
        />
      </View>
      <View style={styles.filePickerRow}>
        <KolamButton
          disabled={acting || files.length >= 12}
          label="Pilih file installer"
          onPress={() => {
            addFile().catch(() => undefined);
          }}
        />
        <Text style={styles.adminMeta}>{files.length} file</Text>
      </View>
      {files.length > 0 ? (
        <View style={styles.fileList}>
          {files.map((file, index) => (
            <View key={`${file.uri}-${index}`} style={styles.fileRow}>
              <Text numberOfLines={1} style={styles.fileName}>
                {file.name || file.uri.split(/[/\\]/).pop() || `File ${index + 1}`}
              </Text>
              <KolamDeleteButton
                intent="outline"
                label="Hapus"
                onPress={() =>
                  setFiles(current => current.filter((_, i) => i !== index))
                }
              />
            </View>
          ))}
        </View>
      ) : null}
      <View style={styles.formActions}>
        <KolamUploadButton
          disabled={acting || !version.trim() || files.length === 0}
          label="Unggah versi"
          loading={acting}
          loadingLabel="Mengunggah..."
          onPress={() => {
            submit().catch(() => undefined);
          }}
        />
      </View>
    </View>
  );
}

function Field({
  children,
  label,
  required,
  wide,
}: {
  children: React.ReactNode;
  label: string;
  required: boolean;
  wide?: boolean;
}) {
  return (
    <View style={[styles.field, wide ? styles.fieldWide : null]}>
      <KolamSettingsWebFieldLabel label={label} required={required} />
      {children}
    </View>
  );
}

function KolamAppDownloadCard({
  app,
  compact,
  expandedVersionId,
  onCopyMd5,
  onDownload,
  onSelectVersion,
}: {
  app: KolamSupportingApp;
  compact: boolean;
  expandedVersionId: string;
  onCopyMd5: (md5: string) => Promise<void>;
  onDownload: (payload: {
    artifact: KolamAppDownloadArtifact;
    version: KolamAppDownloadVersion;
  }) => Promise<void>;
  onSelectVersion: (versionId: string) => void;
}) {
  const selectedVersion =
    app.versions.find(version => version.id === expandedVersionId) ??
    app.versions[0] ??
    null;

  return (
    <View style={[styles.appCard, compact ? styles.appCardCompact : null]}>
      <View style={styles.appHeader}>
        <View style={styles.appTitleWrap}>
          <Text style={styles.appTitle}>{app.name}</Text>
          {app.description ? (
            <Text style={styles.appDescription}>{app.description}</Text>
          ) : null}
        </View>
        <View style={styles.versionBadge}>
          <Text style={styles.versionBadgeText}>
            {app.versionCount} versi
          </Text>
        </View>
      </View>

      {app.versions.length === 0 ? (
        <Text style={styles.emptyText}>Belum ada rilis.</Text>
      ) : (
        <View style={styles.versionStack}>
          <View style={styles.versionPills}>
            {app.versions.map(version => (
              <KolamButton
                intent={selectedVersion?.id === version.id ? 'primary' : 'plain'}
                key={version.id}
                label={`v${version.version}`}
                onPress={() => onSelectVersion(version.id)}
              />
            ))}
          </View>

          {selectedVersion ? (
            <View style={styles.versionBody}>
              {selectedVersion.releaseNotes ? (
                <KolamNotesDisplay
                  label="Catatan rilis"
                  text={selectedVersion.releaseNotes}
                />
              ) : null}

              {selectedVersion.artifacts.length === 0 ? (
                <Text style={styles.emptyText}>Tidak ada file.</Text>
              ) : (
                selectedVersion.artifacts.map(artifact => (
                  <KolamAppDownloadArtifactRow
                    artifact={artifact}
                    key={artifact.id}
                    onCopyMd5={() => onCopyMd5(artifact.md5)}
                    onDownload={() => onDownload({artifact, version: selectedVersion})}
                  />
                ))
              )}
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

function KolamAppDownloadArtifactRow({
  artifact,
  onCopyMd5,
  onDownload,
}: {
  artifact: KolamAppDownloadArtifact;
  onCopyMd5: () => Promise<void>;
  onDownload: () => Promise<void>;
}) {
  const [downloading, setDownloading] = React.useState(false);

  const handleDownload = React.useCallback(async () => {
    setDownloading(true);
    try {
      await onDownload();
    } finally {
      setDownloading(false);
    }
  }, [onDownload]);

  return (
    <View style={styles.artifactRow}>
      <PlatformBadge platform={artifact.platform} />
      <View style={styles.artifactMain}>
        <View style={styles.artifactHeaderLine}>
          <Text style={styles.artifactTitle}>
            {artifact.platformLabel || artifact.platform}
            {artifact.fileKind ? (
              <Text style={styles.artifactKind}> - {artifact.fileKind}</Text>
            ) : null}
          </Text>
        </View>
        <Text numberOfLines={1} style={styles.artifactFilename}>
          {artifact.originalName}
        </Text>
        <View style={styles.md5Row}>
          <Text numberOfLines={1} style={styles.md5Text}>
            MD5: {artifact.md5}
          </Text>
          <KolamButton
            label="Salin"
            onPress={onCopyMd5}
            style={styles.copyButton}
          />
        </View>
      </View>
      <View style={styles.artifactActions}>
        <Text style={styles.fileSize}>
          {formatKolamAppDownloadFileSize(artifact.fileSize)}
        </Text>
        <KolamButton
          disabled={downloading}
          intent="primary"
          label={downloading ? '...' : 'Unduh'}
          onPress={() => {
            handleDownload().catch(() => undefined);
          }}
          style={styles.downloadButton}
        />
      </View>
    </View>
  );
}

function PlatformBadge({platform}: {platform: KolamAppDownloadPlatform}) {
  const isAndroid = platform === 'android';

  return (
    <KolamInteractionFrame
      accessibilityLabel={platform}
      accessibilityRole="image"
      style={[
        styles.platformBadge,
        {backgroundColor: getPlatformColor(platform)},
      ]}
    >
      {isAndroid ? (
        <AndroidPlatformIcon color="#ffffff" />
      ) : (
        <Text style={styles.platformBadgeText}>
          {getPlatformInitial(platform)}
        </Text>
      )}
    </KolamInteractionFrame>
  );
}

function AndroidPlatformIcon({color}: {color: string}) {
  return (
    <Svg height={22} viewBox="0 0 24 24" width={22}>
      <Path
        d="M7.25 8.15L5.65 5.38a.58.58 0 011-.58l1.7 2.94A7.02 7.02 0 0112 6.75c1.31 0 2.55.36 3.61.99l1.7-2.94a.58.58 0 111 .58l-1.6 2.77A5.86 5.86 0 0118.08 12H5.92a5.86 5.86 0 011.33-3.85z"
        fill={color}
      />
      <Rect fill={color} height={7.4} rx={1.4} width={12.16} x={5.92} y={12.85} />
      <Rect fill={color} height={5.4} rx={1} width={1.7} x={3.7} y={13.45} />
      <Rect fill={color} height={5.4} rx={1} width={1.7} x={18.6} y={13.45} />
      <Rect fill={color} height={3.7} rx={0.85} width={1.9} x={8.3} y={19.25} />
      <Rect fill={color} height={3.7} rx={0.85} width={1.9} x={13.8} y={19.25} />
      <Circle cx={9.35} cy={10.2} fill="#16a34a" r={0.58} />
      <Circle cx={14.65} cy={10.2} fill="#16a34a" r={0.58} />
    </Svg>
  );
}

function getPlatformInitial(platform: KolamAppDownloadPlatform): string {
  switch (platform) {
    case 'windows':
      return 'W';
    case 'android':
      return 'A';
    case 'debian':
      return 'D';
    case 'ios':
      return 'i';
    case 'mac':
      return 'M';
    default:
      return 'F';
  }
}

function getPlatformColor(platform: KolamAppDownloadPlatform): string {
  switch (platform) {
    case 'windows':
      return '#0078d4';
    case 'android':
      return '#16a34a';
    case 'debian':
      return '#d70751';
    case 'ios':
    case 'mac':
      return '#111827';
    default:
      return V.colors.mutedFg;
  }
}

async function pickAppDownloadInstallerFile(): Promise<KolamAppDownloadPickedFile | null> {
  const picked = await pickNativeAssetFile();
  if (picked.cancelled || !(picked.uri || picked.path)) {
    return null;
  }

  return {
    uri: picked.uri || picked.path || '',
    name: picked.name,
    mimeType: picked.mimeType,
  };
}

function getDeleteMessage(target: DeleteTarget | null): string {
  if (!target) {
    return '';
  }

  if (target.type === 'app') {
    return `Hapus aplikasi "${target.app.name}" dan semua filenya?`;
  }

  if (target.type === 'version') {
    return `Hapus versi ${target.version.version}?`;
  }

  return `Hapus file ${target.artifact.originalName}?`;
}

const styles = StyleSheet.create({
  activeLabel: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '800',
  },
  activeRow: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  adminArtifactRow: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  adminCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  adminCardTitle: {
    color: V.colors.fg,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 22,
  },
  adminHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  adminMeta: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
  },
  adminStack: {
    gap: 12,
  },
  appCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  appCardCompact: {
    padding: 14,
  },
  appDescription: {
    color: V.colors.mutedFg,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  appHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  appTitle: {
    color: V.colors.fg,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  appTitleWrap: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  artifactFilename: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  artifactActions: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexShrink: 0,
    gap: 6,
    justifyContent: 'center',
    minWidth: 96,
  },
  artifactHeaderLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minWidth: 0,
  },
  artifactKind: {
    color: V.colors.mutedFg,
    fontWeight: '600',
  },
  artifactMain: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  artifactRow: {
    alignItems: 'stretch',
    backgroundColor: '#f8fafc',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  artifactTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  emptyText: {
    color: V.colors.mutedFg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 19,
  },
  field: {
    flex: 1,
    gap: 6,
    minWidth: 220,
  },
  fieldWide: {
    flexBasis: '100%',
  },
  fileList: {
    gap: 8,
  },
  fileName: {
    color: V.colors.fg,
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    minWidth: 0,
  },
  filePickerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  fileRow: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  fileSize: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 17,
    textAlign: 'center',
  },
  formActions: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  list: {
    gap: 12,
    paddingBottom: 24,
  },
  md5Row: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    maxWidth: '78%',
    minWidth: 0,
  },
  md5Text: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    color: V.colors.mutedFg,
    flexShrink: 1,
    fontFamily: 'Consolas',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    minWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  copyButton: {
    flexShrink: 0,
  },
  downloadButton: {
    flexShrink: 0,
  },
  platformBadge: {
    alignItems: 'center',
    borderRadius: 8,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  platformBadgeText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  root: {
    flex: 1,
    gap: 12,
    minHeight: 0,
  },
  successText: {
    color: V.colors.primary,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 19,
  },
  summaryText: {
    color: V.colors.mutedFg,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  sectionLabel: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  segment: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  uploadBox: {
    backgroundColor: '#f8fafc',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  versionBadge: {
    backgroundColor: '#eef2f7',
    borderColor: V.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  versionBadgeText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  versionBody: {
    gap: 10,
  },
  versionAdminCard: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  versionAdminHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  versionAdminStack: {
    gap: 10,
  },
  versionPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  versionStack: {
    gap: 12,
  },
  versionTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
  },
});
