import React from 'react';
import {Linking, StyleSheet, Text, View} from 'react-native';
import {
  getKolamLocationRouteMode,
  getKolamLocationTierLabel,
  getKolamLocationTypeLabel,
  KOLAM_LOCATION_TYPE_OPTIONS,
} from '../domain/kolam-location';
import {getKolamTableColumns} from '../domain/kolam-table';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {
  getKolamLocationAssets,
  getKolamLocationEnclosures,
  getKolamLocationParentLookup,
  getKolamLocationDetail,
  getKolamLocationList,
  getKolamLocationProducts,
  type KolamLocationAssetRow,
  type KolamLocationDetailItem,
  type KolamLocationEnclosureRow,
  type KolamLocationListItem,
  type KolamLocationListTypeFilter,
  type KolamLocationOption,
  type KolamLocationPagination,
  type KolamLocationProductRow,
} from '../services/kolam-location-api';
import {getKolamFileUrl} from '../lib/file-url';
import {KolamButton} from './kolam-button';
import {KolamCatalogListTableShell} from './kolam-catalog-list-table-shell';
import {KolamContentFrame} from './kolam-content-frame';
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
import {KolamRemoteImage} from './kolam-remote-image';
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
    if (mode === 'detail') {
      return (
        <KolamLocationDetail
          locationId={getKolamLocationIdFromRoute(route)}
          onRouteChange={onRouteChange}
        />
      );
    }

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

function getKolamLocationIdFromRoute(route: string) {
  const path = route.split('?')[0];
  const match = path.match(/^\/locations\/([^/]+)(?:\/edit)?$/);
  return match ? decodeURIComponent(match[1]) : '';
}

function KolamLocationDetail({
  locationId,
  onRouteChange,
}: {
  locationId: string;
  onRouteChange?: (route: string) => void;
}) {
  const [location, setLocation] =
    React.useState<KolamLocationDetailItem | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;

    if (!locationId) {
      setLocation(null);
      setError('ID lokasi tidak valid.');
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError('');
    void getKolamLocationDetail(locationId)
      .then(nextLocation => {
        if (active) {
          setLocation(nextLocation);
        }
      })
      .catch(() => {
        if (active) {
          setLocation(null);
          setError('Gagal memuat detail lokasi.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [locationId]);

  if (loading && !location) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState
          message="Mengambil detail lokasi dari server."
          title="Memuat lokasi..."
        />
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState
          message={error || 'Pilih lokasi dari daftar untuk melihat detail.'}
          title="Detail lokasi belum tersedia"
        />
        <KolamButton label="Daftar" onPress={() => onRouteChange?.('/locations')} />
      </View>
    );
  }

  const descendants = getLocationDescendants(location);

  return (
    <View style={styles.surface}>
      <View style={styles.detailHeader}>
        <View style={styles.detailHeading}>
          <View style={styles.detailTitleRow}>
            <Text style={styles.detailTitle}>{location.name}</Text>
            <KolamStatusBadge
              intent={getLocationTypeIntent(location.type)}
              label={getKolamLocationTypeLabel(location.type)}
            />
          </View>
          <Text style={styles.detailSubtitle}>Detail lokasi dan hierarki</Text>
        </View>
        <View style={styles.detailActions}>
          <KolamButton
            intent="primary"
            label="Rubah"
            onPress={() => onRouteChange?.(`/locations/${location.id}/edit`)}
          />
          <KolamButton label="Daftar" onPress={() => onRouteChange?.('/locations')} />
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

      <View style={styles.detailGrid}>
        <View style={styles.detailMainColumn}>
          <KolamLocationInfoCard location={location} />
          <KolamLocationHierarchyCard
            descendants={descendants}
            location={location}
            onRouteChange={onRouteChange}
          />
        </View>
        <View style={styles.detailSideColumn}>
          <KolamLocationContactCard location={location} />
          <KolamLocationTimestampsCard location={location} />
        </View>
      </View>
      <KolamLocationInventorySection
        locationId={location.id}
        onRouteChange={onRouteChange}
      />
    </View>
  );
}

function KolamLocationInfoCard({
  location,
}: {
  location: KolamLocationDetailItem;
}) {
  return (
    <KolamContentFrame variant="settingsWebConfig" style={styles.detailCard}>
      <SectionTitle
        description="Informasi lengkap tentang lokasi ini"
        title="Informasi Lokasi"
      />
      <View style={styles.detailRows}>
        <DetailRow
          label="Tipe"
          value={
            <KolamStatusBadge
              intent={getLocationTypeIntent(location.type)}
              label={getKolamLocationTypeLabel(location.type)}
            />
          }
        />
        <DetailRow
          label="Tingkat"
          value={
            <KolamStatusBadge
              intent={getLocationTierIntent(location.tier)}
              label={getKolamLocationTierLabel(location.tier)}
            />
          }
        />
        <DetailRow
          label="Lokasi Induk"
          value={<LocationParentInline parent={location.parent} />}
        />
        <DetailRow label="Deskripsi" value={location.description || '-'} />
        <DetailRow label="Alamat" value={location.address || '-'} />
        <DetailRow
          label="Nomor Telepon"
          value={
            location.phoneNumber ? (
              <KolamButton
                label={location.phoneNumber}
                onPress={() => {
                  void Linking.openURL(`tel:${location.phoneNumber}`);
                }}
              />
            ) : (
              '-'
            )
          }
        />
        <DetailRow
          label="URL Peta"
          value={
            location.mapsUrl ? (
              <KolamButton
                label="Lihat di Google Maps"
                onPress={() => {
                  void Linking.openURL(location.mapsUrl);
                }}
              />
            ) : (
              '-'
            )
          }
        />
        {location.capacitySlots != null ? (
          <DetailRow label="Kapasitas Slot" value={location.capacitySlots} />
        ) : null}
      </View>
    </KolamContentFrame>
  );
}

function KolamLocationHierarchyCard({
  descendants,
  location,
  onRouteChange,
}: {
  descendants: KolamLocationListItem[];
  location: KolamLocationDetailItem;
  onRouteChange?: (route: string) => void;
}) {
  return (
    <KolamContentFrame variant="settingsWebConfig" style={styles.detailCard}>
      <SectionTitle
        description={
          location.parent
            ? 'Lokasi ini berada di bawah lokasi induk'
            : 'Ini adalah lokasi tingkat atas'
        }
        title="Hierarki"
      />
      <View style={styles.hierarchyStack}>
        {location.parent ? (
          <HierarchyItem
            label={location.parent.name || location.parent.id}
            meta={getKolamLocationTypeLabel(location.parent.type)}
            marker="-"
            onPress={() => onRouteChange?.(`/locations/${location.parent?.id}`)}
          />
        ) : null}
        <HierarchyItem
          active
          label={location.name}
          meta="Saat ini"
          marker="*"
        />
        {descendants.map(child => (
          <HierarchyItem
            key={child.id}
            label={child.name}
            meta={getKolamLocationTypeLabel(child.type)}
            marker="+"
            onPress={() => onRouteChange?.(`/locations/${child.id}`)}
          />
        ))}
        {descendants.length ? null : (
          <Text style={styles.mutedText}>Belum ada lokasi anak.</Text>
        )}
      </View>
    </KolamContentFrame>
  );
}

function KolamLocationContactCard({
  location,
}: {
  location: KolamLocationDetailItem;
}) {
  const hasContact =
    Boolean(location.address) ||
    Boolean(location.mapsUrl) ||
    Boolean(location.phoneNumber);

  return (
    <KolamContentFrame variant="settingsWebConfig" style={styles.detailCard}>
      <SectionTitle
        description="Alamat fisik dan informasi kontak"
        title="Kontak & Alamat"
      />
      {hasContact ? (
        <View style={styles.contactStack}>
          {location.phoneNumber ? (
            <ContactBlock
              label="Telepon"
              value={location.phoneNumber}
              onPress={() => {
                void Linking.openURL(`tel:${location.phoneNumber}`);
              }}
            />
          ) : null}
          {location.address ? (
            <ContactBlock label="Alamat" value={location.address} />
          ) : null}
          {location.mapsUrl ? (
            <ContactBlock
              label="Peta"
              value="Buka di Google Maps"
              onPress={() => {
                void Linking.openURL(location.mapsUrl);
              }}
            />
          ) : null}
        </View>
      ) : (
        <Text style={styles.mutedText}>
          Belum ada informasi kontak atau alamat.
        </Text>
      )}
    </KolamContentFrame>
  );
}

function KolamLocationTimestampsCard({
  location,
}: {
  location: KolamLocationDetailItem;
}) {
  return (
    <KolamContentFrame variant="settingsWebConfig" style={styles.detailCard}>
      <SectionTitle
        description="Tanggal pembuatan dan pembaruan terakhir"
        title="Waktu"
      />
      <View style={styles.contactStack}>
        <ContactBlock
          label="Dibuat"
          value={formatLocationDateTime(location.createdAt)}
        />
        <ContactBlock
          label="Diperbarui"
          value={formatLocationDateTime(location.updatedAt)}
        />
      </View>
    </KolamContentFrame>
  );
}

function KolamLocationInventorySection({
  locationId,
  onRouteChange,
}: {
  locationId: string;
  onRouteChange?: (route: string) => void;
}) {
  const [products, setProducts] = React.useState<KolamLocationProductRow[]>([]);
  const [enclosures, setEnclosures] = React.useState<KolamLocationEnclosureRow[]>([]);
  const [assets, setAssets] = React.useState<KolamLocationAssetRow[]>([]);
  const [totals, setTotals] = React.useState({
    assets: 0,
    enclosures: 0,
    products: 0,
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    void Promise.all([
      getKolamLocationProducts(locationId),
      getKolamLocationEnclosures(locationId),
      getKolamLocationAssets(locationId),
    ])
      .then(([productResult, enclosureResult, assetResult]) => {
        if (!active) {
          return;
        }

        setProducts(productResult.items);
        setEnclosures(enclosureResult.items);
        setAssets(assetResult.items);
        setTotals({
          assets: assetResult.total,
          enclosures: enclosureResult.total,
          products: productResult.total,
        });
      })
      .catch(() => {
        if (active) {
          setProducts([]);
          setEnclosures([]);
          setAssets([]);
          setTotals({assets: 0, enclosures: 0, products: 0});
          setError('Gagal memuat inventaris lokasi.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [locationId]);

  return (
    <KolamContentFrame variant="settingsWebConfig" style={styles.detailCard}>
      <SectionTitle
        description="Produk, enclosure, dan aset yang terhubung ke lokasi ini."
        title="Inventaris di lokasi"
      />
      {error ? (
        <KolamStatusBadge
          intent="danger"
          label={error}
          numberOfLines={2}
          style={styles.errorBadge}
        />
      ) : null}
      <View style={styles.inventoryStack}>
        <InventoryTableBlock
          empty={products.length === 0}
          loading={loading}
          subtitle={`${totals.products || products.length} item`}
          tableId="location-product"
          title="Produk">
          {products.map(product => (
            <LocationProductInventoryRow
              key={product.id}
              onRouteChange={onRouteChange}
              product={product}
            />
          ))}
        </InventoryTableBlock>
        <InventoryTableBlock
          empty={enclosures.length === 0}
          loading={loading}
          subtitle={`${totals.enclosures || enclosures.length} unit`}
          tableId="location-enclosure"
          title="Enclosure">
          {enclosures.map(enclosure => (
            <LocationEnclosureInventoryRow
              enclosure={enclosure}
              key={enclosure.id}
              onRouteChange={onRouteChange}
            />
          ))}
        </InventoryTableBlock>
        <InventoryTableBlock
          empty={assets.length === 0}
          loading={loading}
          subtitle={`${totals.assets || assets.length} item`}
          tableId="location-asset"
          title="Aset">
          {assets.map(asset => (
            <LocationAssetInventoryRow
              asset={asset}
              key={asset.id}
              onRouteChange={onRouteChange}
            />
          ))}
        </InventoryTableBlock>
      </View>
    </KolamContentFrame>
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

function SectionTitle({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <KolamCopyStack
      containerStyle={styles.sectionTitleStack}
      items={[
        {id: 'title', text: title, style: styles.sectionTitle},
        {id: 'description', text: description, style: styles.sectionDescription},
      ]}
    />
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailRowLabel}>{label}</Text>
      <View style={styles.detailRowValue}>
        {typeof value === 'string' || typeof value === 'number' ? (
          <Text style={styles.detailRowText}>{value}</Text>
        ) : (
          value
        )}
      </View>
    </View>
  );
}

function LocationParentInline({
  parent,
}: {
  parent: KolamLocationDetailItem['parent'];
}) {
  if (!parent) {
    return <Text style={styles.detailRowText}>-</Text>;
  }

  return (
    <View style={styles.inlineBadgeRow}>
      <Text style={styles.detailRowText}>{parent.name || parent.id}</Text>
      {parent.type ? (
        <KolamStatusBadge
          intent={getLocationTypeIntent(parent.type)}
          label={getKolamLocationTypeLabel(parent.type)}
        />
      ) : null}
    </View>
  );
}

function HierarchyItem({
  active = false,
  label,
  marker,
  meta,
  onPress,
}: {
  active?: boolean;
  label: string;
  marker: string;
  meta: string;
  onPress?: () => void;
}) {
  return (
    <View style={[styles.hierarchyItem, active && styles.hierarchyItemActive]}>
      <Text style={[styles.hierarchyMarker, active && styles.hierarchyMarkerActive]}>
        {marker}
      </Text>
      <View style={styles.hierarchyContent}>
        {onPress ? (
          <KolamButton
            label={label}
            onPress={onPress}
            style={styles.inlineActionButton}
          />
        ) : (
          <Text style={styles.hierarchyLabel}>{label}</Text>
        )}
        {meta ? <Text style={styles.hierarchyMeta}>{meta}</Text> : null}
      </View>
    </View>
  );
}

function ContactBlock({
  label,
  onPress,
  value,
}: {
  label: string;
  onPress?: () => void;
  value: string;
}) {
  return (
    <View style={styles.contactBlock}>
      <Text style={styles.contactLabel}>{label}</Text>
      {onPress ? (
        <KolamButton
          label={value}
          onPress={onPress}
          style={styles.contactButton}
        />
      ) : (
        <Text style={styles.contactValue}>{value || '-'}</Text>
      )}
    </View>
  );
}

function InventoryTableBlock({
  children,
  empty,
  loading,
  subtitle,
  tableId,
  title,
}: {
  children: React.ReactNode;
  empty: boolean;
  loading: boolean;
  subtitle: string;
  tableId: Parameters<typeof getKolamTableColumns>[0];
  title: string;
}) {
  return (
    <View style={styles.inventoryBlock}>
      <View>
        <Text style={styles.inventoryTitle}>{title}</Text>
        <Text style={styles.inventorySubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.inventoryTable}>
        <KolamDataTableHeader columns={getKolamTableColumns(tableId)} />
        {loading ? (
          <View style={styles.inventoryEmpty}>
            <Text style={styles.mutedText}>Memuat {title.toLowerCase()}...</Text>
          </View>
        ) : empty ? (
          <View style={styles.inventoryEmpty}>
            <Text style={styles.mutedText}>{title}: tidak ada data.</Text>
          </View>
        ) : (
          children
        )}
      </View>
    </View>
  );
}

function LocationProductInventoryRow({
  onRouteChange,
  product,
}: {
  onRouteChange?: (route: string) => void;
  product: KolamLocationProductRow;
}) {
  const imageUri = getKolamFileUrl(product.thumbnailImage);

  return (
    <KolamDataTableRowFrame>
      <View style={styles.inventoryPhotoCell}>
        {imageUri ? (
          <KolamRemoteImage
            accessibilityLabel={`Foto ${product.name}`}
            resizeMode="cover"
            scope="location-product"
            sourceUri={imageUri}
            style={styles.inventoryPhoto}
          />
        ) : (
          <Text style={styles.mutedText}>-</Text>
        )}
      </View>
      <View style={styles.inventoryNameCell}>
        <Text style={styles.inventoryNameText}>{product.name}</Text>
      </View>
      <KolamDataTableMetaCell style={styles.inventoryCodeCell}>
        {product.sku || '-'}
      </KolamDataTableMetaCell>
      <KolamDataTableAmountCell style={styles.inventoryStockCell}>
        {product.stock}
      </KolamDataTableAmountCell>
      <View style={styles.inventoryStatusCell}>
        <KolamStatusBadge
          intent={product.sellable ? 'success' : 'secondary'}
          label={product.sellable ? 'Layak Jual' : 'Tidak Layak Jual'}
        />
      </View>
      <View style={styles.inventoryActionCell}>
        <KolamButton
          label="Lihat"
          onPress={() => onRouteChange?.(`/products/${product.id}`)}
        />
      </View>
    </KolamDataTableRowFrame>
  );
}

function LocationEnclosureInventoryRow({
  enclosure,
  onRouteChange,
}: {
  enclosure: KolamLocationEnclosureRow;
  onRouteChange?: (route: string) => void;
}) {
  const imageUri = getKolamFileUrl(enclosure.coverPhotoUrl);

  return (
    <KolamDataTableRowFrame>
      <View style={styles.inventoryPhotoCell}>
        {imageUri ? (
          <KolamRemoteImage
            accessibilityLabel={`Foto ${enclosure.name}`}
            resizeMode="cover"
            scope="location-enclosure"
            sourceUri={imageUri}
            style={styles.inventoryPhoto}
          />
        ) : (
          <Text style={styles.mutedText}>-</Text>
        )}
      </View>
      <KolamDataTableMetaCell style={styles.enclosureCodeCell}>
        {enclosure.code || '-'}
      </KolamDataTableMetaCell>
      <View style={styles.inventoryNameCell}>
        <Text style={styles.inventoryNameText}>{enclosure.name}</Text>
      </View>
      <KolamDataTableMetaCell style={styles.enclosureTypeCell}>
        {enclosure.type || '-'}
      </KolamDataTableMetaCell>
      <KolamDataTableMetaCell style={styles.enclosurePicCell}>
        {enclosure.assignedToName || '-'}
      </KolamDataTableMetaCell>
      <KolamDataTableMetaCell style={styles.inventoryStatusTextCell}>
        {enclosure.status || '-'}
      </KolamDataTableMetaCell>
      <View style={styles.inventoryActionCell}>
        <KolamButton
          label="Lihat"
          onPress={() => onRouteChange?.(`/enclosures/${enclosure.id}`)}
        />
      </View>
    </KolamDataTableRowFrame>
  );
}

function LocationAssetInventoryRow({
  asset,
  onRouteChange,
}: {
  asset: KolamLocationAssetRow;
  onRouteChange?: (route: string) => void;
}) {
  return (
    <KolamDataTableRowFrame>
      <View style={styles.inventoryNameCell}>
        <Text style={styles.inventoryNameText}>{asset.name}</Text>
      </View>
      <KolamDataTableMetaCell style={styles.inventoryCodeCell}>
        {asset.code || '-'}
      </KolamDataTableMetaCell>
      <KolamDataTableMetaCell style={styles.inventoryStatusTextCell}>
        {asset.status || '-'}
      </KolamDataTableMetaCell>
      <View style={styles.inventoryActionCell}>
        <KolamButton
          label="Lihat"
          onPress={() => onRouteChange?.(`/assets/${asset.id}`)}
        />
      </View>
    </KolamDataTableRowFrame>
  );
}

function getLocationDescendants(location: KolamLocationDetailItem) {
  const byId = new Map<string, KolamLocationListItem>();
  [
    ...location.children,
    ...location.secondary,
    ...location.tertiary,
    ...location.children.flatMap(child => child.children ?? []),
  ].forEach(child => {
    byId.set(child.id, child);
  });

  return Array.from(byId.values());
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

function getLocationTierIntent(tier: string): KolamStatusBadgeIntent {
  switch (tier) {
    case 'primary':
      return 'info';
    case 'secondary':
      return 'warning';
    case 'tertiary':
      return 'success';
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
  detailHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  detailHeading: {
    flex: 1,
    minWidth: 0,
  },
  detailTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailTitle: {
    color: V.colors.fg,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 32,
  },
  detailSubtitle: {
    color: V.colors.mutedFg,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 2,
  },
  detailActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailMainColumn: {
    flex: 2,
    gap: 12,
    minWidth: 420,
  },
  detailSideColumn: {
    flex: 1,
    gap: 12,
    minWidth: 280,
  },
  detailCard: {
    gap: 12,
    padding: 16,
  },
  sectionTitleStack: {
    gap: 2,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
  },
  sectionDescription: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 18,
  },
  detailRows: {
    gap: 0,
  },
  detailRow: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 10,
  },
  detailRowLabel: {
    color: V.colors.mutedFg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    width: 148,
  },
  detailRowValue: {
    flex: 1,
    minWidth: 0,
  },
  detailRowText: {
    color: V.colors.fg,
    fontSize: 13,
    lineHeight: 20,
  },
  inlineBadgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hierarchyStack: {
    gap: 8,
  },
  hierarchyItem: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  hierarchyItemActive: {
    backgroundColor: V.colors.primarySoft,
  },
  hierarchyMarker: {
    color: V.colors.mutedFg,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 20,
    width: 18,
  },
  hierarchyMarkerActive: {
    color: V.colors.primary,
  },
  hierarchyContent: {
    flex: 1,
    minWidth: 0,
  },
  hierarchyLabel: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
  },
  hierarchyMeta: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 1,
  },
  inlineActionButton: {
    alignSelf: 'flex-start',
  },
  contactStack: {
    gap: 10,
  },
  contactBlock: {
    gap: 4,
  },
  contactLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  contactValue: {
    backgroundColor: V.colors.muted,
    borderRadius: 8,
    color: V.colors.fg,
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  contactButton: {
    alignSelf: 'flex-start',
  },
  inventoryStack: {
    gap: 16,
  },
  inventoryBlock: {
    gap: 8,
  },
  inventoryTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 22,
  },
  inventorySubtitle: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 18,
  },
  inventoryTable: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  inventoryEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 92,
    padding: 16,
  },
  inventoryPhotoCell: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
  },
  inventoryPhoto: {
    borderRadius: 8,
    height: 40,
    width: 40,
  },
  inventoryNameCell: {
    flex: 1,
    minWidth: 0,
  },
  inventoryNameText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
  },
  inventoryCodeCell: {
    width: 118,
  },
  inventoryStockCell: {
    width: 90,
  },
  inventoryStatusCell: {
    width: 126,
  },
  inventoryStatusTextCell: {
    width: 126,
  },
  inventoryActionCell: {
    alignItems: 'flex-end',
    width: 64,
  },
  enclosureCodeCell: {
    width: 104,
  },
  enclosureTypeCell: {
    width: 120,
  },
  enclosurePicCell: {
    width: 140,
  },
  mutedText: {
    color: V.colors.mutedFg,
    fontSize: 13,
    lineHeight: 20,
  },
});
