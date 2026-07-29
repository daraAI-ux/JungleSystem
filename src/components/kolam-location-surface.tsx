import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  getKolamLocationRouteMode,
  getKolamLocationTierLabel,
  getKolamLocationTypeLabel,
  KOLAM_LOCATION_TYPE_OPTIONS,
} from '../domain/kolam-location';
import {getKolamTableColumns} from '../domain/kolam-table';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {
  getKolamLocationParentLookup,
  getKolamLocationList,
  type KolamLocationListItem,
  type KolamLocationListTypeFilter,
  type KolamLocationOption,
  type KolamLocationPagination,
} from '../services/kolam-location-api';
import {KolamButton} from './kolam-button';
import {KolamCatalogListTableShell} from './kolam-catalog-list-table-shell';
import {KolamCopyStack} from './kolam-copy-stack';
import {
  KolamDataTableAmountCell,
  KolamDataTableMetaCell,
} from './kolam-data-table-text-cell';
import {KolamDataTableHeader} from './kolam-data-table-header';
import {KolamDataTableRowFrame} from './kolam-data-table-row-frame';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamFormTextField} from './kolam-form-text-field';
import {
  KolamStatusBadge,
  type KolamStatusBadgeIntent,
} from './kolam-status-badge';
import {kolamTableToolbarStyles} from './kolam-table-toolbar-styles';

type LocationTypeFilterValue = KolamLocationListTypeFilter | '';

const LOCATION_TYPE_OPTIONS: Array<{
  label: string;
  value: LocationTypeFilterValue;
}> = [
  {label: 'Semua Tipe', value: ''},
  ...KOLAM_LOCATION_TYPE_OPTIONS,
];

const INITIAL_PAGINATION: KolamLocationPagination = {
  limit: 10,
  page: 1,
  total: 0,
  totalPages: 1,
};

export function KolamLocationSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const mode = getKolamLocationRouteMode(route.split('?')[0]);

  if (mode !== 'list') {
    return (
      <View style={styles.surface}>
        <View style={styles.header}>
          <View style={styles.heading}>
            <Text style={styles.eyebrow}>Inventori</Text>
            <Text style={styles.title}>
              {mode === 'new' ? 'Tambah Lokasi' : 'Lokasi'}
            </Text>
            <Text style={styles.description}>
              Kelola lokasi gudang, lantai, rak, dan area penyimpanan
            </Text>
          </View>
          <KolamButton
            label="Daftar"
            onPress={() => onRouteChange?.('/locations')}
          />
        </View>
        <KolamEmptyState
          message="Form dan detail lokasi belum masuk fase ini."
          title="Belum tersedia"
        />
      </View>
    );
  }

  return (
    <View style={styles.surface}>
      <KolamLocationList onRouteChange={onRouteChange} />
    </View>
  );
}

function KolamLocationList({
  onRouteChange,
}: {
  onRouteChange?: (route: string) => void;
}) {
  const [items, setItems] = React.useState<KolamLocationListItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [shouldSearchApi, setShouldSearchApi] = React.useState(false);
  const [typeFilter, setTypeFilter] =
    React.useState<LocationTypeFilterValue>('');
  const [parentLookup, setParentLookup] = React.useState<
    Record<string, KolamLocationOption>
  >({});
  const [pageSize, setPageSize] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const [pagination, setPagination] =
    React.useState<KolamLocationPagination>(INITIAL_PAGINATION);

  React.useEffect(() => {
    let active = true;
    void getKolamLocationParentLookup()
      .then(lookup => {
        if (active) {
          setParentLookup(lookup);
        }
      })
      .catch(() => {
        if (active) {
          setParentLookup({});
        }
      });

    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    let active = true;
    const normalizedSearch = search.trim();
    const handle = setTimeout(() => {
      setLoading(true);
      setError('');
      void getKolamLocationList({
        limit: pageSize,
        name: shouldSearchApi ? normalizedSearch : undefined,
        page,
        type: typeFilter,
      })
        .then(result => {
          if (!active) {
            return;
          }

          setItems(result.items);
          setPagination(result.pagination);
        })
        .catch(() => {
          if (!active) {
            return;
          }

          setItems([]);
          setPagination({...INITIAL_PAGINATION, limit: pageSize, page});
          setError('Gagal memuat lokasi dari server.');
        })
        .finally(() => {
          if (active) {
            setLoading(false);
          }
        });
    }, 250);

    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [page, pageSize, search, shouldSearchApi, typeFilter]);

  const normalizedSearch = normalizeLocationSearch(search);
  const clientFilteredItems = React.useMemo(
    () =>
      normalizedSearch
        ? items.filter(item => doesLocationMatchSearch(item, normalizedSearch))
        : items,
    [items, normalizedSearch],
  );
  const shouldTriggerApiSearch =
    Boolean(normalizedSearch) &&
    !shouldSearchApi &&
    !loading &&
    clientFilteredItems.length === 0;

  React.useEffect(() => {
    if (shouldTriggerApiSearch) {
      setShouldSearchApi(true);
    }
  }, [shouldTriggerApiSearch]);

  const visibleItems =
    normalizedSearch && !shouldSearchApi ? clientFilteredItems : items;
  const clientSearchActive = Boolean(normalizedSearch) && !shouldSearchApi;
  const tableTotal = clientSearchActive ? visibleItems.length : pagination.total;
  const pageCount = clientSearchActive ? 1 : Math.max(1, pagination.totalPages);
  const safePage = Math.min(page, pageCount);
  const searchEmpty = Boolean(normalizedSearch) && !loading && !visibleItems.length;

  return (
    <View style={styles.stack}>
      <View style={kolamTableToolbarStyles.row}>
        <KolamFormTextField
          onChangeText={next => {
            setSearch(next);
            setShouldSearchApi(false);
            setPage(1);
          }}
          placeholder="Cari"
          style={kolamTableToolbarStyles.searchInput}
          value={search}
        />
        <View style={kolamTableToolbarStyles.controls}>
          {search ? (
            <KolamButton
              label="Bersihkan"
              onPress={() => {
                setSearch('');
                setShouldSearchApi(false);
                setPage(1);
              }}
            />
          ) : null}
          <KolamDropdownSelect<LocationTypeFilterValue>
            label="Tipe"
            onChange={next => {
              setTypeFilter(next);
              setShouldSearchApi(false);
              setPage(1);
            }}
            options={LOCATION_TYPE_OPTIONS}
            value={typeFilter}
          />
          <KolamButton
            intent="primary"
            label="Baru"
            onPress={() => onRouteChange?.('/locations/create')}
          />
        </View>
      </View>
      {error ? (
        <KolamStatusBadge
          intent="danger"
          label={error}
          numberOfLines={2}
          style={styles.errorBadge}
        />
      ) : null}
      <KolamCatalogListTableShell
        footer={
          <KolamTableFooterControls
            onPageSizeChange={next => {
              setPageSize(next);
              setPage(1);
            }}
            page={safePage}
            pageSize={pageSize}
            total={tableTotal}>
            {pageCount > 1 ? (
              <View style={styles.paginationRow}>
                <KolamButton
                  disabled={safePage <= 1}
                  label="Sebelumnya"
                  onPress={() => setPage(current => Math.max(1, current - 1))}
                />
                <KolamCopyStack
                  items={[
                    {
                      id: 'page',
                      text: `${safePage} / ${pageCount}`,
                      style: styles.pageLabel,
                    },
                  ]}
                />
                <KolamButton
                  disabled={safePage >= pageCount}
                  label="Berikutnya"
                  onPress={() =>
                    setPage(current => Math.min(pageCount, current + 1))
                  }
                />
              </View>
            ) : null}
          </KolamTableFooterControls>
        }>
        <KolamDataTableHeader columns={getKolamTableColumns('location')} />
        {visibleItems.length ? (
          visibleItems.map(location => (
            <KolamLocationRow
              key={location.id}
              location={location}
              onEdit={() => onRouteChange?.(`/locations/${location.id}/edit`)}
              onSelect={() => onRouteChange?.(`/locations/${location.id}`)}
              parentLookup={parentLookup}
            />
          ))
        ) : (
          <View style={styles.emptyWrap}>
            {searchEmpty ? (
              <KolamEmptyState
                compact
                message={
                  shouldSearchApi
                    ? 'Coba kata kunci lain'
                    : 'Mencari lebih banyak hasil...'
                }
                title={`Tidak ada lokasi untuk "${search.trim()}"`}
              />
            ) : (
              <KolamEmptyState
                compact
                message="Data lokasi belum tersedia dari server."
                title={loading ? 'Memuat lokasi...' : 'Belum ada lokasi'}
              />
            )}
          </View>
        )}
      </KolamCatalogListTableShell>
    </View>
  );
}

function KolamLocationRow({
  location,
  onEdit,
  onSelect,
  parentLookup,
}: {
  location: KolamLocationListItem;
  onEdit: () => void;
  onSelect: () => void;
  parentLookup: Record<string, KolamLocationOption>;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);
  const parent = resolveLocationParent(location, parentLookup);

  return (
    <KolamDataTableRowFrame style={actionMenuOpen && styles.activeActionRow}>
      <View style={styles.nameCell}>
        <KolamCopyStack
          items={[
            {id: 'name', text: location.name, style: styles.locationNameText},
          ]}
        />
      </View>
      <View style={styles.typeCell}>
        <KolamStatusBadge
          intent={getLocationTypeIntent(location.type)}
          label={getKolamLocationTypeLabel(location.type)}
        />
      </View>
      <KolamDataTableMetaCell style={styles.tierCell}>
        {getKolamLocationTierLabel(location.tier)}
      </KolamDataTableMetaCell>
      <View style={styles.parentCell}>
        <KolamCopyStack
          items={[
            {
              id: 'parent-name',
              text: parent?.name || '-',
              style: styles.parentNameText,
            },
            ...(parent?.type
              ? [
                  {
                    id: 'parent-type',
                    text: getKolamLocationTypeLabel(parent.type),
                    style: styles.parentTypeText,
                  },
                ]
              : []),
          ]}
        />
      </View>
      <KolamDataTableMetaCell style={styles.phoneCell}>
        {location.phoneNumber || '-'}
      </KolamDataTableMetaCell>
      <KolamDataTableMetaCell style={styles.descriptionCell}>
        {truncateLocationDescription(location.description)}
      </KolamDataTableMetaCell>
      <KolamDataTableAmountCell style={styles.createdCell}>
        {formatLocationDateTime(location.createdAt)}
      </KolamDataTableAmountCell>
      <View style={styles.overflowCell}>
        <KolamOverflowMenuButton
          accessibilityLabel={`Menu ${location.name}`}
          actions={[
            {label: 'Lihat', onPress: onSelect},
            {label: 'Rubah', onPress: onEdit},
            {
              disabled: true,
              label: 'Hapus',
              onPress: () => undefined,
              tone: 'danger',
            },
          ]}
          onOpenChange={setActionMenuOpen}
        />
      </View>
    </KolamDataTableRowFrame>
  );
}

function getLocationTypeIntent(type: string): KolamStatusBadgeIntent {
  switch (type) {
    case 'warehouse':
      return 'primary';
    case 'floor':
      return 'success';
    case 'rack':
      return 'secondary';
    case 'store':
      return 'warning';
    case 'area':
      return 'info';
    default:
      return 'secondary';
  }
}

function truncateLocationDescription(description: string) {
  return description.length > 50
    ? `${description.substring(0, 50)}...`
    : description || '-';
}

function formatLocationDateTime(value: string) {
  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return '-';
  }

  return new Date(timestamp).toLocaleString('id-ID', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function normalizeLocationSearch(value: string) {
  return value.trim().toLowerCase();
}

function doesLocationMatchSearch(
  location: KolamLocationListItem,
  normalizedSearch: string,
) {
  return [
    location.name,
    location.description,
    location.type,
    getKolamLocationTypeLabel(location.type),
  ]
    .join(' ')
    .toLowerCase()
    .includes(normalizedSearch);
}

function resolveLocationParent(
  location: KolamLocationListItem,
  parentLookup: Record<string, KolamLocationOption>,
) {
  if (!location.parent) {
    return null;
  }

  if (location.parent.name) {
    return location.parent;
  }

  return parentLookup[location.parent.id] ?? location.parent;
}

const styles = StyleSheet.create({
  surface: {
    gap: 16,
    padding: 24,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    width: '100%',
  },
  heading: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    lineHeight: 18,
    textTransform: 'uppercase',
  },
  title: {
    color: V.colors.fg,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  description: {
    color: V.colors.mutedFg,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 4,
  },
  stack: {
    gap: 12,
  },
  errorBadge: {
    alignSelf: 'flex-start',
  },
  emptyWrap: {
    minHeight: 220,
    justifyContent: 'center',
  },
  activeActionRow: {
    zIndex: 9000,
    elevation: 90,
  },
  nameCell: {
    flex: 1,
    minWidth: 0,
  },
  locationNameText: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 24,
  },
  typeCell: {
    width: 112,
  },
  tierCell: {
    width: 104,
  },
  parentCell: {
    width: 156,
  },
  parentNameText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
  },
  parentTypeText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  phoneCell: {
    width: 132,
  },
  descriptionCell: {
    width: 220,
  },
  createdCell: {
    width: 128,
  },
  overflowCell: {
    alignItems: 'flex-end',
    width: 64,
  },
  paginationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
  },
});
