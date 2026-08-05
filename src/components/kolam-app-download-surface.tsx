import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  formatKolamAppDownloadFileSize,
  type KolamAppDownloadArtifact,
  type KolamAppDownloadPlatform,
  type KolamAppDownloadVersion,
  type KolamSupportingApp,
} from '../domain/kolam-app-download';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {copyTextToClipboard} from '../lib/native-clipboard';
import {
  getKolamAppDownloadArtifactUrl,
  getKolamAppDownloads,
} from '../services/kolam-app-download-api';
import {KolamButton} from './kolam-button';
import {KolamInteractionFrame} from './kolam-interaction-frame';

export function KolamAppDownloadSurface() {
  const [apps, setApps] = React.useState<KolamSupportingApp[]>([]);
  const [expandedVersions, setExpandedVersions] = React.useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const {width} = useWindowDimensions();

  const loadApps = React.useCallback(() => {
    let active = true;

    setLoading(true);
    setError(null);
    getKolamAppDownloads()
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
  }, []);

  React.useEffect(() => loadApps(), [loadApps]);

  const compact = width < 900;

  return (
    <View style={styles.root}>
      <View style={styles.toolbar}>
        <Text style={styles.summaryText}>
          {loading ? 'Memuat' : `${apps.length} aplikasi`}
        </Text>
        <KolamButton label="Refresh" onPress={loadApps} />
      </View>

      {message ? <Text style={styles.successText}>{message}</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {!error && !loading && apps.length === 0 ? (
        <Text style={styles.emptyText}>
          Belum ada aplikasi pendukung yang dipublikasikan.
        </Text>
      ) : null}

      <ScrollView contentContainerStyle={styles.list}>
        {apps.map(app => (
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
        ))}
      </ScrollView>
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
                <Text style={styles.releaseNotes}>
                  {selectedVersion.releaseNotes}
                </Text>
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
        <Text style={styles.artifactTitle}>
          {artifact.platformLabel || artifact.platform}
          {artifact.fileKind ? (
            <Text style={styles.artifactKind}> - {artifact.fileKind}</Text>
          ) : null}
        </Text>
        <Text numberOfLines={1} style={styles.artifactFilename}>
          {artifact.originalName}
        </Text>
        <View style={styles.md5Row}>
          <Text numberOfLines={1} style={styles.md5Text}>
            MD5: {artifact.md5}
          </Text>
          <KolamButton label="Salin" onPress={onCopyMd5} />
        </View>
      </View>
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
      />
    </View>
  );
}

function PlatformBadge({platform}: {platform: KolamAppDownloadPlatform}) {
  return (
    <KolamInteractionFrame
      accessibilityLabel={platform}
      accessibilityRole="image"
      style={[
        styles.platformBadge,
        {backgroundColor: getPlatformColor(platform)},
      ]}
    >
      <Text style={styles.platformBadgeText}>{getPlatformInitial(platform)}</Text>
    </KolamInteractionFrame>
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

const styles = StyleSheet.create({
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
    alignItems: 'center',
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
  fileSize: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '800',
    minWidth: 64,
    textAlign: 'right',
  },
  list: {
    gap: 12,
    paddingBottom: 24,
  },
  md5Row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  md5Text: {
    color: V.colors.mutedFg,
    flex: 1,
    fontFamily: 'Consolas',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    minWidth: 0,
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
  releaseNotes: {
    color: V.colors.mutedFg,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
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
  toolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  versionPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  versionStack: {
    gap: 12,
  },
});
