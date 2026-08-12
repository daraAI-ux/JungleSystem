import React from 'react';
import {Linking, StyleSheet, Text, View} from 'react-native';
import {
  getKolamBantuanKindLabel,
  getKolamBantuanModuleFromManifest,
  getKolamBantuanSlugFromRoute,
  groupKolamBantuanModules,
  searchKolamBantuanDocumentsClient,
  type KolamBantuanManifest,
  type KolamBantuanModule,
  type KolamBantuanSearchEntry,
  type KolamBantuanSearchHit,
} from '../domain/kolam-bantuan';
import {kolamBantuanMarkdownToHtml} from '../domain/kolam-bantuan-markdown';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {
  fetchKolamBantuanDocBySlug,
  fetchKolamBantuanManifest,
  fetchKolamBantuanSearchIndex,
} from '../services/kolam-bantuan-api';
import {KolamButton} from './kolam-button';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamDetailScrollSurface} from './kolam-detail-scroll-surface';
import {KolamDetailSummaryCard} from './kolam-detail-summary-card';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamHtmlContent} from './kolam-html-content';
import {KolamInteractionFrame} from './kolam-interaction-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamSearchField} from './kolam-search-field';

export function KolamBantuanSurface({
  onRouteChange,
  route = '/bantuan',
}: {
  onRouteChange?: (route: string) => void;
  route?: string;
}) {
  const slug = getKolamBantuanSlugFromRoute(route);
  const [manifest, setManifest] = React.useState<KolamBantuanManifest | null>(
    null,
  );
  const [searchIndex, setSearchIndex] = React.useState<
    KolamBantuanSearchEntry[]
  >([]);
  const [docBody, setDocBody] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [docLoading, setDocLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const module = getKolamBantuanModuleFromManifest(manifest, slug);
  const visibleModules = manifest?.modules ?? [];
  const searchHits = React.useMemo(
    () => searchKolamBantuanDocumentsClient(search, searchIndex, visibleModules),
    [search, searchIndex, visibleModules],
  );

  React.useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);
    Promise.all([fetchKolamBantuanManifest(), fetchKolamBantuanSearchIndex()])
      .then(([nextManifest, nextSearchIndex]) => {
        if (cancelled) {
          return;
        }

        setManifest(nextManifest);
        setSearchIndex(nextSearchIndex);
      })
      .catch(nextError => {
        if (cancelled) {
          return;
        }

        setError(getErrorMessage(nextError));
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

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

      void Linking.openURL(href);
    },
    [onRouteChange],
  );

  return (
    <KolamDetailScrollSurface contentContainerStyle={styles.surface}>
      <KolamDetailSummaryCard
        title="Bantuan"
        description="Dokumentasi operasional Kolam."
        fieldColumns={4}
        fields={[
          {
            id: 'modules',
            label: 'Dokumen',
            value: loading ? 'Memuat' : `${manifest?.modules.length ?? 0}`,
          },
          {
            id: 'version',
            label: 'Versi',
            value: manifest?.version || '-',
          },
          {
            id: 'source',
            label: 'Sumber',
            value: 'Plugin Bantuan',
          },
          {
            id: 'route',
            label: 'Route',
            value: slug ? `/bantuan/${slug}` : '/bantuan',
          },
        ]}
        actions={
          slug ? (
            <KolamButton
              intent="outline"
              label="Beranda"
              onPress={() => onRouteChange?.('/bantuan')}
            />
          ) : null
        }
      />

      <KolamSearchField
        containerStyle={styles.search}
        onChangeText={setSearch}
        placeholder="Cari bantuan..."
        trailingLabel={
          search.trim()
            ? `${searchHits.length} hasil`
            : `${visibleModules.length} dokumen`
        }
        value={search}
      />

      {error ? (
        <KolamEmptyState compact message={error} title="Bantuan belum tersedia" />
      ) : null}

      {search.trim() ? (
        <KolamBantuanSearchResults
          hits={searchHits}
          onRouteChange={onRouteChange}
        />
      ) : slug ? (
        <KolamBantuanDoc
          docBody={docBody}
          loading={docLoading || loading}
          module={module}
          onLinkPress={handleInternalRoute}
          onRouteChange={onRouteChange}
          slug={slug}
        />
      ) : (
        <KolamBantuanHub
          loading={loading}
          manifest={manifest}
          onRouteChange={onRouteChange}
        />
      )}
    </KolamDetailScrollSurface>
  );
}

function KolamBantuanHub({
  loading,
  manifest,
  onRouteChange,
}: {
  loading: boolean;
  manifest: KolamBantuanManifest | null;
  onRouteChange?: (route: string) => void;
}) {
  if (loading) {
    return <KolamEmptyState compact title="Memuat bantuan" />;
  }

  if (!manifest?.modules.length) {
    return <KolamEmptyState compact title="Dokumen bantuan kosong" />;
  }

  return (
    <View style={styles.groups}>
      <KolamMappedList
        items={groupKolamBantuanModules(manifest.modules)}
        getKey={group => group.id}
        renderItem={group => (
          <View style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.moduleGrid}>
              <KolamMappedList
                items={group.modules}
                getKey={item => item.slug}
                renderItem={item => (
                  <KolamBantuanModuleCard
                    module={item}
                    onPress={() => onRouteChange?.(`/bantuan/${item.slug}`)}
                  />
                )}
              />
            </View>
          </View>
        )}
      />
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
    <View style={styles.moduleGrid}>
      <KolamMappedList
        items={hits}
        getKey={hit => hit.href}
        renderItem={hit => (
          <KolamBantuanResultCard
            hit={hit}
            onPress={() => onRouteChange?.(hit.href)}
          />
        )}
      />
    </View>
  );
}

function KolamBantuanDoc({
  docBody,
  loading,
  module,
  onLinkPress,
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
  const html = React.useMemo(
    () => kolamBantuanMarkdownToHtml(docBody),
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
        <KolamHtmlContent html={html} onLinkPress={onLinkPress} />
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

function KolamBantuanModuleCard({
  module,
  onPress,
}: {
  module: KolamBantuanModule;
  onPress: () => void;
}) {
  return (
    <KolamInteractionFrame
      accessibilityLabel={`Buka ${module.title}`}
      onPress={onPress}
      style={styles.moduleCard}>
      <Text style={styles.moduleKind}>{getKolamBantuanKindLabel(module.kind)}</Text>
      <Text numberOfLines={2} style={styles.moduleTitle}>
        {module.title}
      </Text>
      <Text numberOfLines={3} style={styles.moduleDescription}>
        {module.description}
      </Text>
      <Text style={styles.moduleMeta}>
        {module.updatedAt || '-'} / v{module.version || '-'}
      </Text>
    </KolamInteractionFrame>
  );
}

function KolamBantuanResultCard({
  hit,
  onPress,
}: {
  hit: KolamBantuanSearchHit;
  onPress: () => void;
}) {
  return (
    <KolamInteractionFrame
      accessibilityLabel={`Buka ${hit.title}`}
      onPress={onPress}
      style={styles.moduleCard}>
      <Text style={styles.moduleKind}>{hit.matchCount} cocok</Text>
      <Text numberOfLines={2} style={styles.moduleTitle}>
        {hit.title}
      </Text>
      <Text numberOfLines={3} style={styles.moduleDescription}>
        {hit.snippet || hit.description}
      </Text>
    </KolamInteractionFrame>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

const styles = StyleSheet.create({
  surface: {
    paddingBottom: 24,
  },
  search: {
    width: '100%',
  },
  groups: {
    gap: 18,
  },
  group: {
    gap: 10,
  },
  groupTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '900',
  },
  moduleGrid: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    width: '100%',
  },
  moduleCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: '31%',
    flexGrow: 1,
    gap: 7,
    minHeight: 132,
    minWidth: 240,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  moduleKind: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.55,
    textTransform: 'uppercase',
  },
  moduleTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 19,
  },
  moduleDescription: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  moduleMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 'auto',
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
