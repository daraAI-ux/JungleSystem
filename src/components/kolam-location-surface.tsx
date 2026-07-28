import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {getKolamLocationRouteMode} from '../domain/kolam-location';
import {getKolamTableColumns} from '../domain/kolam-table';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {
  getKolamLocationList,
  type KolamLocationListItem,
  type KolamLocationListTypeFilter,
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
import {KolamDataTablePrimaryCell} from './kolam-data-table-primary-cell';
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
  {label: 'Gudang', value: 'warehouse'},
  {label: 'Lantai', value: 'floor'},
  {label: 'Rak', value: 'rack'},
  {label: 'Toko', value: 'store'},
  {label: 'Area', value: 'area'},
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
      <KolamLocationListHeader />
      <KolamLocationList onRouteChange={onRouteChange} />
    </View>
  );
}

function KolamLocationListHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>Inventori</Text>
        <Text style={styles.title}>Lokasi</Text>
        <Text style={styles.description}>
          Kelola lokasi gudang, lantai, rak, dan area penyimpanan
        </Text>
      </View>
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
  const [typeFilter, setTypeFilter] =
    React.useState<LocationTypeFilterValue>('');
  const [pageSize, setPageSize] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const [pagination, setPagination] =
    React.useState<KolamLocationPagination>(INITIAL_PAGINATION);

  React.useEffect(() => {
    let active = true;
    const handle = setTimeout(() => {
      setLoading(true);
      setError('');
      void getKolamLocationList({
        limit: pageSize,
        name: search,
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
  }, [page, pageSize, search, typeFilter]);

  const pageCount = Math.max(1, pagination.totalPages);
  const safePage = Math.min(page, pageCount);

  return (
    <View style={styles.stack}>
      <View style={kolamTableToolbarStyles.row}>
        <KolamFormTextField
          onChangeText={next => {
            setSearch(next);
            setPage(1);
          }}
          placeholder="Cari"
          style={kolamTableToolbarStyles.searchInput}
          value={search}
        />
        <View style={kolamTableToolbarStyles.controls}>
          <KolamDropdownSelect<LocationTypeFilterValue>
            label="Tipe"
            onChange={next => {
              setTypeFilter(next);
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
            total={pagination.total}>
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
        {items.length ? (
          items.map(location => (
            <KolamLocationRow
              key={location.id}
              location={location}
              onEdit={() => onRouteChange?.(`/locations/${location.id}/edit`)}
              onSelect={() => onRouteChange?.(`/locations/${location.id}`)}
            />
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              compact
              message="Data lokasi belum tersedia dari server."
              title={loading ? 'Memuat lokasi...' : 'Belum ada lokasi'}
            />
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
}: {
  location: KolamLocationListItem;
  onEdit: () => void;
  onSelect: () => void;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);

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
          label={getLocationTypeLabel(location.type)}
        />
      </View>
      <KolamDataTableMetaCell style={styles.tierCell}>
        {getLocationTierLabel(location.tier)}
      </KolamDataTableMetaCell>
      <View style={styles.parentCell}>
        <KolamDataTablePrimaryCell
          subtitle={
            location.parent?.type ? getLocationTypeLabel(location.parent.type) : ''
          }
          title={location.parent?.name || '-'}
        />
      </View>
      <KolamDataTableMetaCell style={styles.phoneCell}>
        {location.phoneNumber || '-'}
      </KolamDataTableMetaCell>
      <KolamDataTableMetaCell style={styles.descriptionCell}>
        {truncateLocationDescription(location.description)}
      </KolamDataTableMetaCell>
      <KolamDataTableAmountCell style={styles.createdCell}>
        {formatLocationDate(location.createdAt)}
      </KolamDataTableAmountCell>
      <View style={styles.overflowCell}>
        <KolamOverflowMenuButton
          accessibilityLabel={`Menu ${location.name}`}
          actions={[
            {label: 'Lihat', onPress: onSelect},
            {label: 'Rubah', onPress: onEdit},
          ]}
          onOpenChange={setActionMenuOpen}
        />
      </View>
    </KolamDataTableRowFrame>
  );
}

function getLocationTypeLabel(type: string) {
  return (
    (LOCATION_TYPE_OPTIONS.find(option => option.value === type)?.label ??
      type) ||
    '-'
  );
}

function getLocationTypeIntent(type: string): KolamStatusBadgeIntent {
  switch (type) {
    case 'warehouse':
      return 'success';
    case 'floor':
      return 'info';
    case 'rack':
      return 'primary';
    case 'store':
      return 'warning';
    default:
      return 'secondary';
  }
}

function getLocationTierLabel(tier: string) {
  switch (tier) {
    case 'main':
      return 'Utama';
    case 'sub':
      return 'Sub';
    case 'nested':
      return 'Nested';
    default:
      return tier || '-';
  }
}

function truncateLocationDescription(description: string) {
  return description.length > 50
    ? `${description.substring(0, 50)}...`
    : description || '-';
}

function formatLocationDate(value: string) {
  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return '-';
  }

  return new Date(timestamp).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
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
