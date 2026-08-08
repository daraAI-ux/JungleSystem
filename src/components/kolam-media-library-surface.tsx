import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type DimensionValue,
} from 'react-native';
import {
  createKolamMediaRoute,
  kolamMediaFilterOptions,
  parseKolamMediaRoute,
} from '../domain/kolam-media';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { getKolamFileUrl } from '../lib/file-url';
import {
  checkKolamMediaOrphans,
  cleanupKolamMediaOrphans,
  getKolamMediaList,
  getKolamMediaOrphanFilenames,
  type KolamMediaItem,
  type KolamMediaListResult,
  type KolamMediaOrphanCheckResult,
  type KolamMediaOrphanCleanupResult,
} from '../services/kolam-media-api';
import { KolamButton } from './kolam-button';
import {KolamDeleteButton} from './kolam-delete-button';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import {
  measureFilterPanelAnchor,
  type KolamFilterPanelAnchor,
} from './kolam-filter-panel-anchor';
import { KolamMediaPlayer } from './kolam-media-player';
import { KolamModalBackdrop } from './kolam-modal-backdrop';
import { KolamTableFilterTrigger } from './kolam-table-filter-trigger';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

const PAGE_SIZE = 48;
const FILTER_PANEL_WIDTH = 220;

export function KolamMediaLibrarySurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const routeState = React.useMemo(() => parseKolamMediaRoute(route), [route]);
  const [draftSearch, setDraftSearch] = React.useState(routeState.search);
  const [result, setResult] = React.useState<KolamMediaListResult | null>(null);
  const [selectedItem, setSelectedItem] = React.useState<KolamMediaItem | null>(
    null,
  );
  const [error, setError] = React.useState<string | null>(null);
  const [filterPanelOpen, setFilterPanelOpen] = React.useState(false);
  const [panelAnchor, setPanelAnchor] =
    React.useState<KolamFilterPanelAnchor | null>(null);
  const [cleanupDialogOpen, setCleanupDialogOpen] = React.useState(false);
  const [cleanupPhase, setCleanupPhase] = React.useState<
    'ready' | 'checking' | 'review' | 'deleting' | 'done'
  >('ready');
  const [cleanupError, setCleanupError] = React.useState<string | null>(null);
  const [candidateFilenames, setCandidateFilenames] = React.useState<string[]>(
    [],
  );
  const [checkResult, setCheckResult] =
    React.useState<KolamMediaOrphanCheckResult | null>(null);
  const [cleanupResult, setCleanupResult] =
    React.useState<KolamMediaOrphanCleanupResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const toolbarRef = React.useRef<View>(null);
  const filterTriggerRef = React.useRef<View>(null);
  const { width } = useWindowDimensions();

  React.useEffect(() => {
    setDraftSearch(routeState.search);
  }, [routeState.search]);

  React.useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);
    getKolamMediaList({
      filter: routeState.filter,
      limit: PAGE_SIZE,
      page: routeState.page,
      search: routeState.search,
      type: routeState.type,
    })
      .then(nextResult => {
        if (!active) {
          return;
        }
        setResult(nextResult);
        setSelectedItem(current => {
          if (
            current &&
            nextResult.items.some(item => item.filename === current.filename)
          ) {
            return current;
          }
          return nextResult.items[0] ?? null;
        });
      })
      .catch(cause => {
        if (!active) {
          return;
        }
        setResult(null);
        setSelectedItem(null);
        setError(
          cause instanceof Error ? cause.message : 'Gagal memuat media.',
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
  }, [routeState.filter, routeState.page, routeState.search, routeState.type]);

  const setRoute = React.useCallback(
    (nextState: Partial<typeof routeState>) => {
      onRouteChange?.(
        createKolamMediaRoute({
          ...routeState,
          ...nextState,
        }),
      );
    },
    [onRouteChange, routeState],
  );

  const refreshCurrentList = React.useCallback(() => {
    setRoute({});
  }, [setRoute]);

  const columns = Math.max(2, Math.min(6, Math.floor((width - 360) / 180)));
  const items = result?.items ?? [];
  const selectedFilter =
    kolamMediaFilterOptions.find(option => option.id === routeState.filter) ??
    kolamMediaFilterOptions[0];

  const closeFilterPanel = React.useCallback(() => {
    setFilterPanelOpen(false);
    setPanelAnchor(null);
  }, []);

  const toggleFilterPanel = React.useCallback(() => {
    if (filterPanelOpen) {
      closeFilterPanel();
      return;
    }

    setFilterPanelOpen(false);
    setPanelAnchor(null);
    requestAnimationFrame(() => {
      measureFilterPanelAnchor(
        toolbarRef.current,
        filterTriggerRef.current,
        FILTER_PANEL_WIDTH,
        anchor => {
          setPanelAnchor(anchor);
          setFilterPanelOpen(true);
        },
      );
    });
  }, [closeFilterPanel, filterPanelOpen]);

  React.useEffect(() => {
    if (!filterPanelOpen) {
      return;
    }

    requestAnimationFrame(() => {
      measureFilterPanelAnchor(
        toolbarRef.current,
        filterTriggerRef.current,
        FILTER_PANEL_WIDTH,
        setPanelAnchor,
      );
    });
  }, [filterPanelOpen, width]);

  const openCleanupDialog = React.useCallback(async () => {
    setCleanupDialogOpen(true);
    setCleanupPhase('checking');
    setCleanupError(null);
    setCandidateFilenames([]);
    setCheckResult(null);
    setCleanupResult(null);

    try {
      const filenames = await getKolamMediaOrphanFilenames(routeState.type);
      setCandidateFilenames(filenames);

      if (!filenames.length) {
        setCleanupPhase('review');
        setCheckResult({ safe: [], scanned: 0, unsafe: [] });
        return;
      }

      const nextCheck = await checkKolamMediaOrphans(filenames);
      setCheckResult(nextCheck);
      setCleanupPhase('review');
    } catch (cause) {
      setCleanupError(
        cause instanceof Error ? cause.message : 'Gagal memeriksa orphan.',
      );
      setCleanupPhase('ready');
    }
  }, [routeState.type]);

  const closeCleanupDialog = React.useCallback(() => {
    setCleanupDialogOpen(false);
    setCleanupPhase('ready');
    setCleanupError(null);
  }, []);

  const deleteSafeOrphans = React.useCallback(async () => {
    const filenames = checkResult?.safe ?? [];

    if (!filenames.length) {
      return;
    }

    setCleanupPhase('deleting');
    setCleanupError(null);

    try {
      const nextResult = await cleanupKolamMediaOrphans({ filenames });
      setCleanupResult(nextResult);
      setCleanupPhase('done');
      refreshCurrentList();
    } catch (cause) {
      setCleanupError(
        cause instanceof Error ? cause.message : 'Gagal menghapus orphan.',
      );
      setCleanupPhase('review');
    }
  }, [checkResult?.safe, refreshCurrentList]);

  return (
    <View style={styles.root}>
      <View ref={toolbarRef} style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              <KolamFormTextField
                mode="search"
                onChangeText={setDraftSearch}
                onSubmitEditing={() =>
                  setRoute({ page: 1, search: draftSearch })
                }
                placeholder="Cari media"
                returnKeyType="search"
                style={kolamTableToolbarStyles.searchInput}
                value={draftSearch}
              />
              <KolamTableFilterTrigger
                active={routeState.type === 'image'}
                label="Gambar"
                onPress={() => setRoute({ page: 1, type: 'image' })}
              />
              <KolamTableFilterTrigger
                active={routeState.type === 'video'}
                label="Video"
                onPress={() => setRoute({ page: 1, type: 'video' })}
              />
              <View ref={filterTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={filterPanelOpen || routeState.filter !== 'all'}
                  label={`Filter: ${selectedFilter.label}`}
                  onPress={toggleFilterPanel}
                  open={filterPanelOpen}
                  variant="quiet"
                />
              </View>
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              {routeState.filter === 'orphan' ? (
                <KolamDeleteButton
                  disabled={cleanupDialogOpen}
                  intent="danger"
                  label="Hapus orphan"
                  onPress={() => {
                    openCleanupDialog().catch(() => undefined);
                  }}
                />
              ) : null}
              <KolamButton
                label="Cari"
                onPress={() => setRoute({ page: 1, search: draftSearch })}
              />
            </View>
          </View>
        </View>

        {filterPanelOpen && panelAnchor ? (
          <View
            style={[
              styles.filterOverlayPanel,
              {
                left: panelAnchor.left,
                top: panelAnchor.top,
                width: FILTER_PANEL_WIDTH,
              },
            ]}
          >
            <ScrollView
              contentContainerStyle={styles.filterPanelContent}
              keyboardShouldPersistTaps="handled"
              style={styles.filterPanelScroll}
            >
              {kolamMediaFilterOptions.map(option => (
                <KolamButton
                  intent={routeState.filter === option.id ? 'primary' : 'plain'}
                  key={option.id}
                  label={option.label}
                  onPress={() => {
                    setRoute({ filter: option.id, page: 1 });
                    closeFilterPanel();
                  }}
                  style={styles.filterPanelOption}
                />
              ))}
            </ScrollView>
            <View style={styles.filterPanelFooter}>
              <KolamButton label="Tutup" onPress={closeFilterPanel} />
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <View style={styles.listPane}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              {loading ? 'Memuat' : `${result?.total ?? 0} media`}
            </Text>
            <Text style={styles.summaryText}>
              Hal {result?.page ?? routeState.page}/{result?.totalPages ?? 1}
            </Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {!error && !loading && items.length === 0 ? (
            <Text style={styles.emptyText}>Tidak ada media.</Text>
          ) : null}

          <ScrollView
            contentContainerStyle={styles.grid}
            keyboardShouldPersistTaps="handled"
            style={styles.gridScroll}
          >
            {items.map(item => (
              <KolamMediaTile
                key={item.filename}
                columns={columns}
                item={item}
                selected={item.filename === selectedItem?.filename}
                onPress={() => setSelectedItem(item)}
              />
            ))}
          </ScrollView>

          <View style={styles.paginationRow}>
            <KolamButton
              disabled={routeState.page <= 1}
              label="Prev"
              onPress={() => setRoute({ page: routeState.page - 1 })}
            />
            <KolamButton
              disabled={
                (result?.page ?? routeState.page) >= (result?.totalPages ?? 1)
              }
              label="Next"
              onPress={() => setRoute({ page: routeState.page + 1 })}
            />
          </View>
        </View>

        <KolamMediaPreviewPane item={selectedItem} />
      </View>
      <KolamMediaOrphanCleanupDialog
        candidateCount={candidateFilenames.length}
        checkResult={checkResult}
        cleanupError={cleanupError}
        cleanupPhase={cleanupPhase}
        cleanupResult={cleanupResult}
        onClose={closeCleanupDialog}
        onDeleteSafe={deleteSafeOrphans}
        visible={cleanupDialogOpen}
      />
    </View>
  );
}

function KolamMediaTile({
  columns,
  item,
  onPress,
  selected,
}: {
  columns: number;
  item: KolamMediaItem;
  onPress: () => void;
  selected: boolean;
}) {
  const uri = getKolamMediaUri(item);
  const tileBasis = `${100 / columns}%` as DimensionValue;

  return (
    <KolamInteractionFrame
      accessibilityLabel={item.title ?? item.filename}
      onPress={onPress}
      style={[
        styles.tile,
        selected ? styles.tileSelected : null,
        { width: tileBasis },
      ]}
    >
      <View style={styles.thumb}>
        {item.type === 'image' && uri ? (
          <Image
            resizeMode="cover"
            source={{ uri }}
            style={styles.thumbImage}
          />
        ) : (
          <View style={styles.videoThumb}>
            <Text style={styles.videoGlyph}>Video</Text>
          </View>
        )}
      </View>
      <View style={styles.tileBody}>
        <Text numberOfLines={1} style={styles.tileTitle}>
          {item.title ?? item.filename}
        </Text>
        <Text numberOfLines={1} style={styles.tileMeta}>
          {item.isOrphan ? 'Orphan' : item.owners[0]?.type ?? 'Attached'}
        </Text>
      </View>
    </KolamInteractionFrame>
  );
}

function KolamMediaPreviewPane({ item }: { item: KolamMediaItem | null }) {
  const uri = item ? getKolamMediaUri(item) : null;

  if (!item || !uri) {
    return (
      <View style={styles.previewPane}>
        <Text style={styles.emptyText}>Pilih media.</Text>
      </View>
    );
  }

  return (
    <View style={styles.previewPane}>
      <Text numberOfLines={2} style={styles.previewTitle}>
        {item.title ?? item.filename}
      </Text>
      <Text numberOfLines={1} style={styles.previewMeta}>
        {item.filename}
      </Text>
      {item.type === 'image' ? (
        <Image
          resizeMode="contain"
          source={{ uri }}
          style={styles.previewImage}
        />
      ) : (
        <KolamMediaPlayer
          kind="video"
          style={styles.previewVideo}
          title={item.title ?? item.filename}
          uri={uri}
        />
      )}
      <View style={styles.ownerList}>
        <Text style={styles.ownerLabel}>Owner</Text>
        <Text style={styles.ownerText}>
          {item.isOrphan
            ? 'Orphan'
            : item.owners.map(owner => owner.name ?? owner.type).join(', ') ||
              'Attached'}
        </Text>
      </View>
      {item.alt ? <Text style={styles.previewMeta}>{item.alt}</Text> : null}
    </View>
  );
}

function KolamMediaOrphanCleanupDialog({
  candidateCount,
  checkResult,
  cleanupError,
  cleanupPhase,
  cleanupResult,
  onClose,
  onDeleteSafe,
  visible,
}: {
  candidateCount: number;
  checkResult: KolamMediaOrphanCheckResult | null;
  cleanupError: string | null;
  cleanupPhase: 'ready' | 'checking' | 'review' | 'deleting' | 'done';
  cleanupResult: KolamMediaOrphanCleanupResult | null;
  onClose: () => void;
  onDeleteSafe: () => Promise<void>;
  visible: boolean;
}) {
  const safeCount = checkResult?.safe.length ?? 0;
  const unsafeCount = checkResult?.unsafe.length ?? 0;
  const busy = cleanupPhase === 'checking' || cleanupPhase === 'deleting';
  const ignoreBackdropPress = React.useCallback(() => undefined, []);
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.max(360, Math.min(windowWidth - 48, 640));

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.cleanupModalRoot}>
      <KolamModalBackdrop onPress={busy ? ignoreBackdropPress : onClose} />
      <View
        accessibilityLabel="Cleanup orphan"
        style={[styles.cleanupModalCard, { width: cardWidth }]}
      >
        <View style={styles.cleanupModalHeader}>
          <Text style={styles.cleanupTitle}>Hapus orphan</Text>
          <Text style={styles.cleanupText}>
            Re-check file orphan sebelum hapus.
          </Text>
        </View>

        <ScrollView style={styles.cleanupModalScroll}>
          <View style={styles.cleanupModalBody}>
            {cleanupPhase === 'checking' ? (
              <Text style={styles.cleanupText}>Memeriksa file orphan...</Text>
            ) : null}

            {cleanupPhase === 'review' ? (
              <>
                <View style={styles.cleanupMetricRow}>
                  <KolamMediaCleanupMetric
                    label="Kandidat"
                    value={candidateCount}
                  />
                  <KolamMediaCleanupMetric label="Aman" value={safeCount} />
                  <KolamMediaCleanupMetric label="Lewati" value={unsafeCount} />
                </View>

                {cleanupError ? (
                  <Text style={styles.cleanupError}>{cleanupError}</Text>
                ) : null}

                {safeCount > 0 ? (
                  <View style={styles.cleanupSection}>
                    <Text style={styles.cleanupSectionTitle}>Aman</Text>
                    {checkResult?.safe.slice(0, 10).map(filename => (
                      <Text key={filename} style={styles.cleanupListText}>
                        {filename}
                      </Text>
                    ))}
                  </View>
                ) : null}

                {unsafeCount > 0 ? (
                  <View style={styles.cleanupSection}>
                    <Text style={styles.cleanupSectionTitle}>Dilewati</Text>
                    {checkResult?.unsafe.slice(0, 10).map(entry => (
                      <Text key={entry.filename} style={styles.cleanupListText}>
                        {entry.filename} -{' '}
                        {entry.foundIn.join(', ') || 'Referenced'}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </>
            ) : null}

            {cleanupPhase === 'deleting' ? (
              <Text style={styles.cleanupText}>Menghapus orphan...</Text>
            ) : null}

            {cleanupPhase === 'done' ? (
              <View style={styles.cleanupMetricRow}>
                <KolamMediaCleanupMetric
                  label="Terhapus"
                  value={cleanupResult?.deleted ?? 0}
                />
                <KolamMediaCleanupMetric
                  label="Gagal"
                  value={cleanupResult?.failed.length ?? 0}
                />
                <KolamMediaCleanupMetric
                  label="Lewati"
                  value={cleanupResult?.skippedUnsafe ?? 0}
                />
              </View>
            ) : null}

            {cleanupPhase === 'ready' && cleanupError ? (
              <Text style={styles.cleanupError}>{cleanupError}</Text>
            ) : null}
          </View>
        </ScrollView>

        <View style={styles.cleanupModalFooter}>
          <KolamButton disabled={busy} label="Tutup" onPress={onClose} />
          {cleanupPhase === 'review' && safeCount > 0 ? (
            <KolamDeleteButton
              intent="danger"
              label="Hapus"
              onPress={() => {
                onDeleteSafe().catch(() => undefined);
              }}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

function KolamMediaCleanupMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <View style={styles.cleanupMetric}>
      <Text style={styles.cleanupMetricLabel}>{label}</Text>
      <Text style={styles.cleanupMetricValue}>{value}</Text>
    </View>
  );
}

function getKolamMediaUri(item: KolamMediaItem): string | null {
  if (item.url) {
    return getKolamFileUrl(item.url);
  }

  if (item.path.startsWith('media/')) {
    return getKolamFileUrl(item.path);
  }

  return getKolamFileUrl(
    item.type === 'video'
      ? `media/videos/${item.filename}`
      : `media/${item.filename}`,
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: 12,
    minHeight: 0,
    position: 'relative',
  },
  toolbarWrap: {
    overflow: 'visible',
    position: 'relative',
    zIndex: 200,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 0,
  },
  listPane: {
    flex: 1,
    gap: 10,
    minHeight: 0,
    minWidth: 0,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  filterOverlayPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 32,
    maxHeight: 310,
    overflow: 'hidden',
    padding: 8,
    position: 'absolute',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    zIndex: 9400,
  },
  filterPanelContent: {
    gap: 4,
    paddingBottom: 4,
  },
  filterPanelFooter: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  filterPanelOption: {
    justifyContent: 'flex-start',
  },
  filterPanelScroll: {
    maxHeight: 250,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    paddingBottom: 4,
  },
  gridScroll: {
    flex: 1,
    minHeight: 0,
  },
  tile: {
    padding: 4,
  },
  tileSelected: {
    backgroundColor: V.colors.primarySoft,
  },
  thumb: {
    aspectRatio: 1.25,
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumbImage: {
    height: '100%',
    width: '100%',
  },
  videoThumb: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  videoGlyph: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
  },
  tileBody: {
    gap: 2,
    paddingHorizontal: 2,
    paddingTop: 6,
  },
  tileTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
  },
  tileMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  paginationRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  previewPane: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    minHeight: 360,
    padding: 10,
    width: 320,
  },
  previewTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 22,
  },
  previewMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  previewImage: {
    backgroundColor: V.colors.muted,
    borderRadius: 8,
    height: 220,
    width: '100%',
  },
  previewVideo: {
    height: 220,
    width: '100%',
  },
  ownerList: {
    gap: 4,
  },
  ownerLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  ownerText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  cleanupError: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  cleanupListText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  cleanupMetric: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    minWidth: 110,
    padding: 10,
  },
  cleanupMetricLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  cleanupMetricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cleanupMetricValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 18,
    fontWeight: '900',
  },
  cleanupModalBody: {
    gap: 14,
    paddingVertical: 4,
  },
  cleanupModalCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    maxHeight: '90%',
    maxWidth: 640,
    padding: 16,
    zIndex: 2,
  },
  cleanupModalFooter: {
    alignItems: 'center',
    borderTopColor: V.colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    paddingTop: 10,
  },
  cleanupModalHeader: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
    paddingBottom: 10,
  },
  cleanupModalRoot: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    elevation: 96,
    justifyContent: 'center',
    padding: 24,
    zIndex: 9600,
  },
  cleanupModalScroll: {
    flexGrow: 0,
    maxHeight: 440,
  },
  cleanupSection: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 10,
  },
  cleanupSectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  cleanupText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
  },
  cleanupTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '700',
  },
});
