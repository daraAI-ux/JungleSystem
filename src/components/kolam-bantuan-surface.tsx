import React from 'react';
import {Linking, Pressable, StyleSheet, Text, View} from 'react-native';
import {
  getKolamBantuanKindLabel,
  getKolamBantuanModuleFromManifest,
  getKolamBantuanSlugFromRoute,
  searchKolamBantuanDocumentsClient,
  type KolamBantuanManifest,
  type KolamBantuanModule,
  type KolamBantuanSearchEntry,
  type KolamBantuanSearchHit,
} from '../domain/kolam-bantuan';
import {getDashboardLayoutVisualContract} from '../domain/dashboard-layout';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {
  fetchKolamBantuanDocBySlug,
  fetchKolamBantuanManifest,
  fetchKolamBantuanSearchIndex,
  getKolamBantuanLocalManifest,
} from '../services/kolam-bantuan-api';
import {KolamButton} from './kolam-button';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamDaftarButton} from './kolam-daftar-button';
import {KolamDetailScrollSurface} from './kolam-detail-scroll-surface';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamPanelFrame} from './kolam-panel-frame';
import {KolamSearchField} from './kolam-search-field';

const DASHBOARD_LAYOUT_VISUAL = getDashboardLayoutVisualContract();
const HUB_PAGE_SIZE = 20;

export function KolamBantuanSurface({
  onRouteChange,
  route = '/bantuan',
}: {
  onRouteChange?: (route: string) => void;
  route?: string;
}) {
  const slug = getKolamBantuanSlugFromRoute(route);
  const [manifest, setManifest] = React.useState<KolamBantuanManifest>(
    getKolamBantuanLocalManifest,
  );
  const [searchIndex, setSearchIndex] = React.useState<
    KolamBantuanSearchEntry[] | null
  >(null);
  const [searchIndexLoading, setSearchIndexLoading] = React.useState(false);
  const [docBody, setDocBody] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [hubVisibleCount, setHubVisibleCount] = React.useState(HUB_PAGE_SIZE);
  const [docLoading, setDocLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const module = getKolamBantuanModuleFromManifest(manifest, slug);
  const visibleModules = React.useMemo(
    () => manifest.modules ?? [],
    [manifest.modules],
  );
  const searchNeedle = search.trim();
  const searchHits = React.useMemo(
    () =>
      searchNeedle && searchIndex
        ? searchKolamBantuanDocumentsClient(
            searchNeedle,
            searchIndex,
            visibleModules,
          )
        : [],
    [searchNeedle, searchIndex, visibleModules],
  );

  React.useEffect(() => {
    let cancelled = false;

    // Background refresh only — hub already painted from local manifest.
    fetchKolamBantuanManifest()
      .then(nextManifest => {
        if (!cancelled) {
          setManifest(nextManifest);
        }
      })
      .catch(() => {
        // Keep local manifest.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    setHubVisibleCount(HUB_PAGE_SIZE);
  }, [manifest.modules.length]);

  React.useEffect(() => {
    if (!searchNeedle || searchIndex || searchIndexLoading) {
      return;
    }

    let cancelled = false;
    setSearchIndexLoading(true);
    fetchKolamBantuanSearchIndex()
      .then(nextSearchIndex => {
        if (!cancelled) {
          setSearchIndex(nextSearchIndex);
        }
      })
      .catch(nextError => {
        if (!cancelled) {
          setError(getErrorMessage(nextError));
        }
      })
      .finally(() => {
        setSearchIndexLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [searchNeedle, searchIndex, searchIndexLoading]);

  React.useEffect(() => {
    let cancelled = false;
    const resolvedSlug = module?.slug ?? slug;

    if (!resolvedSlug) {
      setDocBody('');
      setDocLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setDocLoading(true);
    setError(null);
    fetchKolamBantuanDocBySlug(resolvedSlug, module?.docPath)
      .then(body => {
        if (!cancelled) {
          setDocBody(body);
        }
      })
      .catch(nextError => {
        if (!cancelled) {
          setDocBody('');
          setError(getErrorMessage(nextError));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setDocLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [module?.docPath, module?.slug, slug]);

  const handleInternalRoute = React.useCallback(
    (href: string) => {
      if (href.startsWith('/bantuan')) {
        onRouteChange?.(href);
        return;
      }

      Linking.openURL(href).catch(() => undefined);
    },
    [onRouteChange],
  );

  return (
    <KolamDetailScrollSurface contentContainerStyle={styles.surface}>
      <KolamPanelFrame
        accessibilityLabel="Bantuan"
        style={styles.panel}
        variant="module">
        {slug ? (
          <View style={styles.detailAction}>
            <KolamDaftarButton onPress={() => onRouteChange?.('/bantuan')} />
          </View>
        ) : null}
        <KolamSearchField
          containerStyle={styles.search}
          onChangeText={setSearch}
          placeholder="Cari bantuan..."
          trailingLabel={
            searchNeedle
              ? searchIndexLoading
                ? 'Mencari...'
                : `${searchHits.length} hasil`
              : `${visibleModules.length} dokumen`
          }
          value={search}
        />

        {error ? (
          <KolamEmptyState compact message={error} title="Bantuan belum tersedia" />
        ) : null}

        {searchNeedle ? (
          searchIndexLoading && !searchIndex ? (
            <KolamEmptyState compact title="Memuat pencarian" />
          ) : (
            <KolamBantuanSearchResults
              hits={searchHits}
              onRouteChange={onRouteChange}
            />
          )
        ) : slug ? (
          <KolamBantuanDoc
            docBody={docBody}
            loading={docLoading}
            module={module}
            onLinkPress={handleInternalRoute}
            onRouteChange={onRouteChange}
            slug={slug}
          />
        ) : (
          <KolamBantuanHub
            modules={visibleModules}
            onLoadMore={() =>
              setHubVisibleCount(current => current + HUB_PAGE_SIZE)
            }
            onRouteChange={onRouteChange}
            visibleCount={hubVisibleCount}
          />
        )}
      </KolamPanelFrame>
    </KolamDetailScrollSurface>
  );
}

function KolamBantuanHub({
  modules,
  onLoadMore,
  onRouteChange,
  visibleCount,
}: {
  modules: KolamBantuanModule[];
  onLoadMore: () => void;
  onRouteChange?: (route: string) => void;
  visibleCount: number;
}) {
  if (!modules.length) {
    return <KolamEmptyState compact title="Dokumen bantuan kosong" />;
  }

  const pageModules = modules.slice(0, visibleCount);
  const hasMore = pageModules.length < modules.length;

  return (
    <View style={styles.list}>
      {pageModules.map(item => (
        <Pressable
          key={item.slug}
          accessibilityLabel={`Buka ${item.title}`}
          accessibilityRole="button"
          onPress={() => onRouteChange?.(`/bantuan/${item.slug}`)}
          style={styles.row}>
          <Text style={styles.rowKind}>
            {getKolamBantuanKindLabel(item.kind)}
          </Text>
          <Text numberOfLines={2} style={styles.rowTitle}>
            {item.title}
          </Text>
          <Text numberOfLines={2} style={styles.rowDescription}>
            {item.description}
          </Text>
        </Pressable>
      ))}
      {hasMore ? (
        <View style={styles.loadMoreRow}>
          <KolamButton
            intent="outline"
            label="Muat lagi"
            onPress={onLoadMore}
          />
          <Text style={styles.loadMoreMeta}>
            {pageModules.length}/{modules.length}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function KolamBantuanSearchResults({
  hits,
  onRouteChange,
}: {
  hits: KolamBantuanSearchHit[];
  onRouteChange?: (route: string) => void;
}) {
  if (!hits.length) {
    return <KolamEmptyState compact title="Tidak ada hasil" />;
  }

  return (
    <View style={styles.list}>
      {hits.map(hit => (
        <Pressable
          key={hit.href}
          accessibilityLabel={`Buka ${hit.title}`}
          accessibilityRole="button"
          onPress={() => onRouteChange?.(hit.href)}
          style={styles.row}>
          <Text style={styles.rowKind}>{hit.matchCount} cocok</Text>
          <Text numberOfLines={2} style={styles.rowTitle}>
            {hit.title}
          </Text>
          <Text numberOfLines={2} style={styles.rowDescription}>
            {hit.snippet || hit.description}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function KolamBantuanDoc({
  docBody,
  loading,
  module,
  onLinkPress: _onLinkPress,
  onRouteChange,
  slug,
}: {
  docBody: string;
  loading: boolean;
  module?: KolamBantuanModule;
  onLinkPress: (href: string) => void;
  onRouteChange?: (route: string) => void;
  slug: string;
}) {
  // Plain text only — react-native-render-html trees abort on RN Windows.
  const plainBody = React.useMemo(
    () => stripMarkdownLight(docBody),
    [docBody],
  );

  if (loading) {
    return <KolamEmptyState compact title="Memuat dokumen" />;
  }

  if (!module) {
    return <KolamEmptyState compact title="Dokumen tidak ada" />;
  }

  return (
    <View style={styles.docStack}>
      <KolamCardFrame style={styles.docCard} variant="compact">
        <Text style={styles.docKind}>{getKolamBantuanKindLabel(module.kind)}</Text>
        <Text style={styles.docTitle}>{module.title}</Text>
        <Text style={styles.docDescription}>{module.description}</Text>
        <Text style={styles.docMeta}>
          {module.updatedAt || '-'} / v{module.version || '-'}
        </Text>
      </KolamCardFrame>
      <KolamCardFrame style={styles.docBodyCard} variant="compact">
        <Text style={styles.docPlain}>{plainBody}</Text>
      </KolamCardFrame>
      <View style={styles.seriesNav}>
        {module.prevSlug ? (
          <KolamButton
            intent="outline"
            label="Sebelumnya"
            onPress={() => onRouteChange?.(`/bantuan/${module.prevSlug}`)}
          />
        ) : null}
        {module.nextSlug ? (
          <KolamButton
            intent="outline"
            label="Berikutnya"
            onPress={() => onRouteChange?.(`/bantuan/${module.nextSlug}`)}
          />
        ) : null}
        {!module.prevSlug && !module.nextSlug ? (
          <Text style={styles.hiddenMeta}>{slug}</Text>
        ) : null}
      </View>
    </View>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function stripMarkdownLight(markdown: string) {
  return markdown
    .replace(/^---[\s\S]*?---\s*/m, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\|\s*:?-{3,}.*$/gm, '')
    .replace(/^\|/gm, '')
    .replace(/\|$/gm, '')
    .replace(/\|/g, ' · ')
    .replace(/^[-*]\s+/gm, '• ')
    .trim();
}

const styles = StyleSheet.create({
  surface: {
    paddingBottom: 24,
  },
  panel: {
    alignSelf: 'center',
    maxWidth: DASHBOARD_LAYOUT_VISUAL.page.maxWidthPx,
    width: '100%',
  },
  detailAction: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  search: {
    marginBottom: 12,
    width: '100%',
  },
  list: {
    gap: 8,
    width: '100%',
  },
  row: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '100%',
  },
  rowKind: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.55,
    textTransform: 'uppercase',
  },
  rowTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 19,
  },
  rowDescription: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  loadMoreRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginTop: 4,
  },
  loadMoreMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  docStack: {
    gap: 12,
  },
  docCard: {
    gap: 7,
  },
  docKind: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.55,
    textTransform: 'uppercase',
  },
  docTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  docDescription: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  docMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  docBodyCard: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  docPlain: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
  },
  seriesNav: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  hiddenMeta: {
    color: 'transparent',
    fontSize: 1,
  },
});
