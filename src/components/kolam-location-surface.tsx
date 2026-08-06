import React from 'react';
import {Linking, Pressable, StyleSheet, Text, View} from 'react-native';
import {
  getKolamLocationRouteMode,
  getKolamLocationTierLabel,
  getKolamLocationTypeLabel,
  KOLAM_LOCATION_TIER_OPTIONS,
  KOLAM_LOCATION_TYPE_OPTIONS,
  type KolamLocationTier,
  type KolamLocationType,
} from '../domain/kolam-location';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {
  createKolamLocation,
  deleteKolamLocation,
  getKolamLocationAssets,
  getKolamLocationEnclosures,
  getKolamLocationParentLookup,
  getKolamLocationDetail,
  getKolamLocationList,
  getKolamLocationProducts,
  getKolamLocations,
  updateKolamLocation,
  type KolamLocationAssetRow,
  type KolamLocationDetailItem,
  type KolamLocationEnclosureRow,
  type KolamLocationListItem,
  type KolamLocationListTypeFilter,
  type KolamLocationOption,
  type KolamLocationPagination,
  type KolamLocationProductRow,
  type KolamLocationSavePayload,
} from '../services/kolam-location-api';
import {getKolamFileUrl} from '../lib/file-url';
import {KolamButton} from './kolam-button';
import {KolamRefreshButton} from './kolam-refresh-button';
import {KolamResetButton} from './kolam-reset-button';
import {KolamConfirmDialog} from './kolam-confirm-dialog';
import {KolamContentFrame} from './kolam-content-frame';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamDetailSummaryCard} from './kolam-detail-summary-card';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
} from './kolam-dropdown-select';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamFormTextField} from './kolam-form-text-field';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import {KolamRemoteImage} from './kolam-remote-image';
import {KolamSearchField} from './kolam-search-field';
import {
  KolamStatusBadge,
  type KolamStatusBadgeIntent,
} from './kolam-status-badge';
import {KolamTableFilterTrigger} from './kolam-table-filter-trigger';
import {kolamTableToolbarStyles} from './kolam-table-toolbar-styles';

type LocationTypeFilterValue = KolamLocationListTypeFilter | '';

const LOCATION_TYPE_OPTIONS: Array<{
  label: string;
  value: LocationTypeFilterValue;
}> = [
  {label: 'Semua Tipe', value: ''},
  ...KOLAM_LOCATION_TYPE_OPTIONS,
];

const LOCATION_FORM_TYPE_OPTIONS = KOLAM_LOCATION_TYPE_OPTIONS.filter(
  option => option.value !== 'bin',
);

const INITIAL_PAGINATION: KolamLocationPagination = {
  limit: 10,
  page: 1,
  total: 0,
  totalPages: 1,
};

const EMPTY_LOCATION_FORM: KolamLocationFormState = {
  address: '',
  description: '',
  mapsUrl: '',
  name: '',
  parent: '',
  phoneNumber: '',
  tier: 'primary',
  type: 'warehouse',
};

const LOCATION_TIER_NOTES: Record<
  KolamLocationTier,
  {description: string; example: string; marker: string}
> = {
  primary: {
    description: 'Lokasi utama seperti gudang atau toko.',
    example: 'Contoh: Gudang Utama, Toko Cabang Jakarta',
    marker: '1',
  },
  secondary: {
    description: 'Bagian dari lokasi utama.',
    example: 'Contoh: Lantai 1, Area Penyimpanan A',
    marker: '2',
  },
  tertiary: {
    description: 'Bagian dari lokasi sekunder.',
    example: 'Contoh: Rak A1, Rak B2',
    marker: '3',
  },
};

type KolamLocationFormState = KolamLocationSavePayload & {
  address: string;
  description: string;
  mapsUrl: string;
  parent: string;
  phoneNumber: string;
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
      <KolamLocationForm
        locationId={mode === 'edit' ? getKolamLocationIdFromRoute(route) : ''}
        mode={mode}
        onRouteChange={onRouteChange}
      />
    );
  }

  return <KolamLocationList onRouteChange={onRouteChange} />;
}

function getKolamLocationIdFromRoute(route: string) {
  const path = route.split('?')[0];
  const match = path.match(/^\/locations\/([^/]+)(?:\/edit)?$/);
  return match ? decodeURIComponent(match[1]) : '';
}

function KolamLocationForm({
  locationId,
  mode,
  onRouteChange,
}: {
  locationId: string;
  mode: 'edit' | 'new';
  onRouteChange?: (route: string) => void;
}) {
  const isEdit = mode === 'edit';
  const [form, setForm] = React.useState<KolamLocationFormState>({
    ...EMPTY_LOCATION_FORM,
  });
  const [parentOptions, setParentOptions] = React.useState<
    KolamLocationOption[]
  >([]);
  const [loading, setLoading] = React.useState(isEdit);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;

    void getKolamLocations()
      .then(locations => {
        if (active) {
          setParentOptions(
            locations.filter(location => location.id !== locationId),
          );
        }
      })
      .catch(() => {
        if (active) {
          setParentOptions([]);
        }
      });

    return () => {
      active = false;
    };
  }, [locationId]);

  React.useEffect(() => {
    if (!isEdit) {
      setForm({...EMPTY_LOCATION_FORM});
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError('');

    void getKolamLocationDetail(locationId)
      .then(location => {
        if (!active) {
          return;
        }

        setForm({
          address: location.address,
          description: location.description,
          mapsUrl: location.mapsUrl,
          name: location.name,
          parent: location.parent?.id ?? '',
          phoneNumber: location.phoneNumber,
          tier: normalizeLocationTier(location.tier),
          type: normalizeLocationType(location.type),
        });
      })
      .catch(() => {
        if (active) {
          setError('Gagal memuat lokasi.');
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
  }, [isEdit, locationId]);

  const availableParents = React.useMemo(
    () => getLocationParentOptions(parentOptions, form.tier),
    [form.tier, parentOptions],
  );
  const requiresParent = form.tier !== 'primary';
  const parentDropdownOptions = [
    {label: 'Pilih lokasi induk', value: ''},
    ...availableParents.map(parent => ({
      label: [
        parent.name,
        getKolamLocationTypeLabel(parent.type),
        getKolamLocationTierLabel(parent.tier),
      ]
        .filter(Boolean)
        .join(' - '),
      value: parent.id,
    })),
  ];
  const selectedParent = availableParents.find(
    parent => parent.id === form.parent,
  );
  const parentValidation = validateLocationParent(form, selectedParent);

  const updateField = <TKey extends keyof KolamLocationFormState>(
    key: TKey,
    value: KolamLocationFormState[TKey],
  ) => {
    setForm(current => {
      const next = {...current, [key]: value};

      if (key === 'tier') {
        const tier = value as KolamLocationTier;
        next.parent =
          tier === 'primary' ||
          !getLocationParentOptions(parentOptions, tier).some(
            parent => parent.id === current.parent,
          )
            ? ''
            : current.parent;
      }

      return next;
    });
    setError('');
  };

  const handleSave = async () => {
    const name = form.name.trim();
    const validationMessage =
      !name
        ? 'Nama lokasi wajib diisi.'
        : parentValidation
          ? parentValidation
          : '';

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSaving(true);
    setError('');

    const payload: KolamLocationSavePayload = {
      address: normalizeOptionalLocationField(form.address),
      description: normalizeOptionalLocationField(form.description),
      mapsUrl: normalizeOptionalLocationField(form.mapsUrl),
      name,
      parent: form.parent || (isEdit ? null : undefined),
      phoneNumber: normalizeOptionalLocationField(form.phoneNumber),
      tier: form.tier,
      type: form.type,
    };

    try {
      const saved = isEdit
        ? await updateKolamLocation(locationId, payload)
        : await createKolamLocation(payload);
      onRouteChange?.(isEdit ? `/locations/${saved.id}` : '/locations');
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : isEdit
            ? 'Gagal menyimpan lokasi.'
            : 'Gagal membuat lokasi.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.detailSurface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text numberOfLines={1} style={styles.detailToolbarContext}>
              {isEdit
                ? `Edit · ${form.name.trim() || 'Lokasi'}`
                : 'Lokasi baru'}
            </Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              label="Daftar"
              onPress={() => onRouteChange?.('/locations')}
            />
          </View>
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

      {loading ? (
        <KolamEmptyState message="Memuat form lokasi..." title="Memuat" />
      ) : (
        <View style={styles.formStack}>
          <KolamContentFrame variant="settingsWebConfig" style={styles.detailCard}>
            <SectionTitle
              description={
                isEdit
                  ? 'Perbarui nama dan tipe untuk lokasi ini.'
                  : 'Masukkan nama dan tipe untuk lokasi ini.'
              }
              title="Informasi Dasar"
            />
            <View style={styles.formGrid}>
              <LabeledFormField label="Nama Lokasi">
                <KolamFormTextField
                  onChangeText={value => updateField('name', value)}
                  placeholder="mis. Gudang Utama, Lantai Toko 2"
                  style={styles.formInput}
                  value={form.name}
                />
              </LabeledFormField>
              <LabeledFormField label="Tipe Lokasi">
                <KolamDropdownSelect
                  label="Tipe Lokasi"
                  onChange={value =>
                    updateField('type', value as KolamLocationType)
                  }
                  options={getLocationFormTypeOptions(form.type)}
                  style={styles.formDropdown}
                  value={form.type}
                />
              </LabeledFormField>
            </View>
            <LabeledFormField label="Deskripsi">
              <KolamFormTextField
                multiline
                onChangeText={value => updateField('description', value)}
                placeholder="Deskripsi singkat lokasi ini (opsional)"
                style={[styles.formInput, styles.formTextarea]}
                textAlignVertical="top"
                value={form.description}
              />
            </LabeledFormField>
          </KolamContentFrame>

          <KolamContentFrame variant="settingsWebConfig" style={styles.detailCard}>
            <SectionTitle
              description="Tentukan posisi lokasi ini dalam struktur organisasi."
              title="Hierarki Lokasi"
            />
            <Text style={styles.formLabel}>Tingkat Lokasi</Text>
            <View style={styles.tierCardGrid}>
              {KOLAM_LOCATION_TIER_OPTIONS.map(option => (
                <LocationTierCard
                  key={option.value}
                  selected={form.tier === option.value}
                  tier={option.value}
                  onPress={() => updateField('tier', option.value)}
                />
              ))}
            </View>
            <Text style={styles.helpText}>
              {LOCATION_TIER_NOTES[form.tier].example}
            </Text>
            {requiresParent ? (
              <View style={styles.parentSelectStack}>
                <View style={styles.noteBox}>
                  <Text style={styles.noteText}>
                    Lokasi {getKolamLocationTierLabel(form.tier)} harus berada
                    di dalam lokasi{' '}
                    {form.tier === 'secondary'
                      ? 'Utama'
                      : 'Utama atau Sekunder'}
                    .
                  </Text>
                </View>
                <LabeledFormField label="Lokasi Induk">
                  <KolamDropdownSelect
                    label="Lokasi Induk"
                    menuPlacement="inline"
                    onChange={value => updateField('parent', value)}
                    options={parentDropdownOptions}
                    searchable
                    style={styles.formDropdown}
                    value={form.parent}
                  />
                </LabeledFormField>
              </View>
            ) : null}
          </KolamContentFrame>

          <KolamContentFrame variant="settingsWebConfig" style={styles.detailCard}>
            <SectionTitle
              description={
                isEdit
                  ? 'Perbarui alamat fisik dan informasi kontak (opsional).'
                  : 'Tambahkan alamat fisik dan informasi kontak (opsional).'
              }
              title="Kontak & Alamat"
            />
            <LabeledFormField label="Alamat Fisik">
              <KolamFormTextField
                onChangeText={value => updateField('address', value)}
                placeholder="Masukkan alamat lengkap"
                style={styles.formInput}
                value={form.address}
              />
            </LabeledFormField>
            <View style={styles.formGrid}>
              <LabeledFormField label="Nomor Telepon">
                <KolamFormTextField
                  keyboardType="phone-pad"
                  onChangeText={value => updateField('phoneNumber', value)}
                  placeholder="mis. 089666263522"
                  style={styles.formInput}
                  value={form.phoneNumber}
                />
              </LabeledFormField>
              <LabeledFormField label="URL Google Maps">
                <KolamFormTextField
                  mode="url"
                  onChangeText={value => updateField('mapsUrl', value)}
                  placeholder="Tempel tautan Google Maps"
                  style={styles.formInput}
                  value={form.mapsUrl}
                />
              </LabeledFormField>
            </View>
            {form.mapsUrl ? (
              <View style={styles.mapsPreviewBox}>
                <Text style={styles.mapsPreviewText} numberOfLines={2}>
                  {form.mapsUrl}
                </Text>
                <KolamButton
                  label="Buka Maps"
                  onPress={() => Linking.openURL(form.mapsUrl)}
                />
              </View>
            ) : null}
          </KolamContentFrame>

          <View style={styles.formActions}>
            <KolamButton
              disabled={saving}
              label="Batal"
              onPress={() =>
                onRouteChange?.(isEdit ? `/locations/${locationId}` : '/locations')
              }
            />
            <KolamButton
              disabled={saving}
              intent="primary"
              label={
                saving
                  ? isEdit
                    ? 'Menyimpan...'
                    : 'Membuat...'
                  : isEdit
                    ? 'Simpan Perubahan'
                    : 'Buat Lokasi'
              }
              onPress={handleSave}
            />
          </View>
        </View>
      )}
    </View>
  );
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
  const [refreshKey, setRefreshKey] = React.useState(0);

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
  }, [locationId, refreshKey]);

  if (loading && !location) {
    return (
      <View style={styles.detailSurface}>
        <KolamEmptyState
          message="Mengambil detail lokasi dari server."
          title="Memuat lokasi..."
        />
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.detailSurface}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              <Text numberOfLines={1} style={styles.detailToolbarContext}>
                Detail lokasi
              </Text>
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              <KolamButton
                label="Daftar"
                onPress={() => onRouteChange?.('/locations')}
              />
            </View>
          </View>
        </View>
        <KolamEmptyState
          message={error || 'Pilih lokasi dari daftar untuk melihat detail.'}
          title="Detail lokasi belum tersedia"
        />
      </View>
    );
  }

  const descendants = getLocationDescendants(location);

  return (
    <View style={styles.detailSurface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text numberOfLines={1} style={styles.detailToolbarContext}>
              {location.name}
            </Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamRefreshButton
              accessibilityLabel="Refresh"
              disabled={loading}

              onPress={() => setRefreshKey(current => current + 1)}
            />
            <KolamButton
              label="Daftar"
              onPress={() => onRouteChange?.('/locations')}
            />
            <KolamButton
              intent="primary"
              label="Edit"
              onPress={() =>
                onRouteChange?.(`/locations/${location.id}/edit`)
              }
            />
          </View>
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

      <KolamLocationSummaryCard
        descendants={descendants}
        location={location}
        onRouteChange={onRouteChange}
      />
      <KolamLocationInventorySection
        locationId={location.id}
        onRouteChange={onRouteChange}
      />
    </View>
  );
}

function KolamLocationSummaryCard({
  descendants,
  location,
  onRouteChange,
}: {
  descendants: KolamLocationListItem[];
  location: KolamLocationDetailItem;
  onRouteChange?: (route: string) => void;
}) {
  return (
    <View style={styles.locationSummaryRow}>
      <KolamDetailSummaryCard
        description="Informasi lokasi, kontak, alamat, dan waktu"
        fieldColumns={3}
        fields={[
          {
            id: 'type',
            label: 'Tipe',
            value: (
              <KolamStatusBadge
                intent={getLocationTypeIntent(location.type)}
                label={getKolamLocationTypeLabel(location.type)}
              />
            ),
          },
          {
            id: 'tier',
            label: 'Tingkat',
            value: (
              <KolamStatusBadge
                intent={getLocationTierIntent(location.tier)}
                label={getKolamLocationTierLabel(location.tier)}
              />
            ),
          },
          {
            id: 'parent',
            label: 'Lokasi Induk',
            value: <LocationParentInline parent={location.parent} />,
          },
          {
            id: 'capacity',
            label: 'Kapasitas Slot',
            value: location.capacitySlots ?? '-',
          },
          {
            id: 'phone',
            label: 'Telepon',
            value: location.phoneNumber ? (
              <KolamButton
                label={location.phoneNumber}
                onPress={() => {
                  void Linking.openURL(`tel:${location.phoneNumber}`);
                }}
              />
            ) : (
              '-'
            ),
          },
          {
            id: 'map',
            label: 'Peta',
            value: location.mapsUrl ? (
              <KolamButton
                label="Google Maps"
                onPress={() => {
                  void Linking.openURL(location.mapsUrl);
                }}
              />
            ) : (
              '-'
            ),
          },
          {
            id: 'address',
            label: 'Alamat',
            value: location.address || '-',
          },
          {
            id: 'description',
            label: 'Deskripsi',
            value: location.description || '-',
          },
          {
            id: 'created',
            label: 'Dibuat',
            value: formatLocationDateTime(location.createdAt),
          },
          {
            id: 'updated',
            label: 'Diperbarui',
            value: formatLocationDateTime(location.updatedAt),
          },
        ]}
        style={styles.locationInfoCard}
        title="Informasi Lokasi"
      />
      <KolamCardFrame
        accessibilityLabel="Hierarki"
        style={styles.locationHierarchyCard}
        variant="compact"
      >
        <View style={styles.sectionTitleStack}>
          <Text style={styles.sectionTitle}>Hierarki</Text>
        </View>
        <KolamLocationHierarchyContent
          descendants={descendants}
          location={location}
          onRouteChange={onRouteChange}
        />
      </KolamCardFrame>
    </View>
  );
}

function KolamLocationHierarchyContent({
  descendants,
  location,
  onRouteChange,
}: {
  descendants: KolamLocationListItem[];
  location: KolamLocationDetailItem;
  onRouteChange?: (route: string) => void;
}) {
  return (
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
        description="Produk, kandang, dan aset yang terhubung ke lokasi ini."
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
          columns={buildLocationProductInventoryColumns()}
          emptyTitle="Produk: tidak ada data."
          getRowKey={product => product.id}
          loading={loading}
          renderActions={product => (
            <KolamButton
              label="Lihat"
              onPress={() => onRouteChange?.(`/products/${product.id}`)}
            />
          )}
          rows={products}
          subtitle={`${totals.products || products.length} item`}
          title="Produk"
        />
        <InventoryTableBlock
          columns={buildLocationEnclosureInventoryColumns()}
          emptyTitle="Kandang: tidak ada data."
          getRowKey={enclosure => enclosure.id}
          loading={loading}
          renderActions={enclosure => (
            <KolamButton
              label="Lihat"
              onPress={() => onRouteChange?.(`/enclosures/${enclosure.id}`)}
            />
          )}
          rows={enclosures}
          subtitle={`${totals.enclosures || enclosures.length} unit`}
          title="Kandang"
        />
        <InventoryTableBlock
          columns={buildLocationAssetInventoryColumns()}
          emptyTitle="Aset: tidak ada data."
          getRowKey={asset => asset.id}
          loading={loading}
          renderActions={asset => (
            <KolamButton
              label="Lihat"
              onPress={() => onRouteChange?.(`/assets/${asset.id}`)}
            />
          )}
          rows={assets}
          subtitle={`${totals.assets || assets.length} item`}
          title="Aset"
        />
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
  const [activeFilterPanel, setActiveFilterPanel] =
    React.useState<'type' | null>(null);
  const [parentLookup, setParentLookup] = React.useState<
    Record<string, KolamLocationOption>
  >({});
  const [pageSize, setPageSize] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [deleteTarget, setDeleteTarget] =
    React.useState<KolamLocationListItem | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [pagination, setPagination] =
    React.useState<KolamLocationPagination>(INITIAL_PAGINATION);
  const listColumns = React.useMemo(
    () =>
      buildLocationListColumns({
        parentLookup,
        onSelect: location => onRouteChange?.(`/locations/${location.id}`),
      }),
    [onRouteChange, parentLookup],
  );

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
  }, [page, pageSize, refreshKey, search, shouldSearchApi, typeFilter]);

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
  const filtersAppliedCount = Number(Boolean(search)) + Number(Boolean(typeFilter));
  const typeFilterLabel = typeFilter
    ? getKolamLocationTypeLabel(typeFilter)
    : 'Tipe';
  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      await deleteKolamLocation(deleteTarget.id);
      setDeleteTarget(null);
      if (visibleItems.length <= 1 && page > 1) {
        setPage(current => Math.max(1, current - 1));
      } else {
        setRefreshKey(current => current + 1);
      }
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Gagal menghapus lokasi.',
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={styles.listStack}>
      <View style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              <KolamSearchField
                containerStyle={kolamTableToolbarStyles.searchInput}
                onChangeText={next => {
                  setSearch(next);
                  setShouldSearchApi(false);
                  setPage(1);
                }}
                placeholder="Cari lokasi..."
                value={search}
              />
              <KolamTableFilterTrigger
                active={activeFilterPanel === 'type' || Boolean(typeFilter)}
                label={typeFilterLabel}
                onPress={() =>
                  setActiveFilterPanel(current =>
                    current === 'type' ? null : 'type',
                  )
                }
                open={activeFilterPanel === 'type'}
                variant="quiet"
              />
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              {filtersAppliedCount > 0 ? (
                <KolamResetButton
                  muted
                  onPress={() => {
                    setSearch('');
                    setTypeFilter('');
                    setShouldSearchApi(false);
                    setActiveFilterPanel(null);
                    setPage(1);
                  }}
                  style={styles.toolbarButton}
                />
              ) : null}
              <KolamButton
                intent="primary"
                label="Baru"
                tone="positive"
                onPress={() => onRouteChange?.('/locations/create')}
                style={styles.toolbarButton}
              />
            </View>
          </View>
        </View>
        {activeFilterPanel === 'type' ? (
          <View style={[styles.filterOverlayPanel, styles.filterPanelType]}>
            <View style={styles.filterPanelContent}>
              {LOCATION_TYPE_OPTIONS.map(option => (
                <KolamButton
                  key={option.value || 'all'}
                  intent={option.value === typeFilter ? 'primary' : 'plain'}
                  label={option.label}
                  onPress={() => {
                    setTypeFilter(option.value);
                    setShouldSearchApi(false);
                    setActiveFilterPanel(null);
                    setPage(1);
                  }}
                  style={styles.filterPanelOption}
                />
              ))}
            </View>
          </View>
        ) : null}
      </View>
      {error ? (
        <KolamStatusBadge
          intent="danger"
          label={error}
          numberOfLines={2}
          style={styles.errorBadge}
        />
      ) : null}
      <KolamListTableComposition
        actionsColumn
        columns={listColumns}
        emptyTitle={
          searchEmpty
            ? `Tidak ada lokasi untuk "${search.trim()}"`
            : loading
              ? 'Memuat lokasi...'
              : 'Belum ada lokasi'
        }
        getRowKey={location => location.id}
        loading={loading}
        pagination={{
          onPageChange: setPage,
          page: safePage,
          pageSize,
          total: tableTotal,
        }}
        renderActions={location => (
          <KolamLocationActionsMenu
            location={location}
            onDelete={() => setDeleteTarget(location)}
            onEdit={() => onRouteChange?.(`/locations/${location.id}/edit`)}
            onSelect={() => onRouteChange?.(`/locations/${location.id}`)}
          />
        )}
        rows={visibleItems}
      />
      <KolamConfirmDialog
        confirmLabel={deleting ? 'Menghapus...' : 'Hapus'}
        destructive
        message={
          deleteTarget
            ? `Yakin ingin menghapus lokasi "${deleteTarget.name}"? Tindakan ini tidak dapat dibatalkan.`
            : 'Yakin ingin menghapus lokasi ini? Tindakan ini tidak dapat dibatalkan.'
        }
        onCancel={() => {
          if (!deleting) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={() => {
          if (!deleting) {
            void handleConfirmDelete();
          }
        }}
        title="Hapus Lokasi"
        visible={Boolean(deleteTarget)}
      />
    </View>
  );
}

function buildLocationListColumns({
  onSelect,
  parentLookup,
}: {
  onSelect: (location: KolamLocationListItem) => void;
  parentLookup: Record<string, KolamLocationOption>;
}): Array<KolamListTableColumn<KolamLocationListItem>> {
  return [
    {
      flex: 1.12,
      id: 'name',
      label: 'Lokasi',
      render: location => (
        <Pressable onPress={() => onSelect(location)} style={styles.identityCell}>
          <Text numberOfLines={1} style={styles.locationNameText}>
            {location.name}
          </Text>
        </Pressable>
      ),
    },
    {
      align: 'center',
      flex: 0.72,
      id: 'type',
      label: 'Tipe',
      render: location => (
        <KolamStatusBadge
          intent={getLocationTypeIntent(location.type)}
          label={getKolamLocationTypeLabel(location.type)}
          style={styles.centerBadge}
        />
      ),
    },
    {
      align: 'center',
      flex: 0.68,
      id: 'tier',
      label: 'Tingkat',
      render: location => (
        <Text numberOfLines={1} style={styles.locationMetaText}>
          {getKolamLocationTierLabel(location.tier)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 1,
      id: 'parent',
      label: 'Parent',
      render: location => {
        const parent = resolveLocationParent(location, parentLookup);
        return (
          <View style={styles.parentCopy}>
            <Text numberOfLines={1} style={styles.parentNameText}>
              {parent?.name || '-'}
            </Text>
            {parent?.type ? (
              <Text numberOfLines={1} style={styles.parentTypeText}>
                {getKolamLocationTypeLabel(parent.type)}
              </Text>
            ) : null}
          </View>
        );
      },
    },
    {
      align: 'center',
      flex: 0.82,
      id: 'phone',
      label: 'Telepon',
      render: location => (
        <Text numberOfLines={1} style={styles.locationMetaText}>
          {location.phoneNumber || '-'}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 1,
      id: 'description',
      label: 'Catatan',
      render: location => (
        <Text numberOfLines={2} style={styles.locationMetaText}>
          {truncateLocationDescription(location.description)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'created',
      label: 'Dibuat',
      render: location => (
        <Text numberOfLines={1} style={styles.locationMetaText}>
          {formatLocationDateTime(location.createdAt)}
        </Text>
      ),
    },
  ];
}

function KolamLocationActionsMenu({
  location,
  onDelete,
  onEdit,
  onSelect,
}: {
  location: KolamLocationListItem;
  onDelete: () => void;
  onEdit: () => void;
  onSelect: () => void;
}) {
  return (
    <KolamOverflowMenuButton
      accessibilityLabel={`Menu ${location.name}`}
      actions={[
        {label: 'Lihat', onPress: onSelect},
        {label: 'Rubah', onPress: onEdit},
        {label: 'Hapus', onPress: onDelete, tone: 'danger'},
      ]}
    />
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

function LocationParentInline({
  parent,
}: {
  parent: KolamLocationDetailItem['parent'];
}) {
  if (!parent) {
    return <Text style={styles.summaryInlineText}>-</Text>;
  }

  return (
    <View style={styles.inlineBadgeRow}>
      <Text style={styles.summaryInlineText}>{parent.name || parent.id}</Text>
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

function LabeledFormField({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      {children}
    </View>
  );
}

function LocationTierCard({
  onPress,
  selected,
  tier,
}: {
  onPress: () => void;
  selected: boolean;
  tier: KolamLocationTier;
}) {
  const note = LOCATION_TIER_NOTES[tier];

  return (
    <KolamButton
      accessibilityLabel={`Pilih tingkat ${getKolamLocationTierLabel(tier)}`}
      intent={selected ? 'primary' : 'secondary'}
      label={`${note.marker}. ${getKolamLocationTierLabel(tier)}\n${note.description}`}
      onPress={onPress}
      style={styles.tierCard}
      textStyle={styles.tierCardText}
    />
  );
}

function InventoryTableBlock<TRow>({
  columns,
  emptyTitle,
  getRowKey,
  loading,
  renderActions,
  rows,
  subtitle,
  title,
}: {
  columns: Array<KolamListTableColumn<TRow>>;
  emptyTitle: string;
  getRowKey: (row: TRow, index: number) => string;
  loading: boolean;
  renderActions: (row: TRow) => React.ReactNode;
  rows: TRow[];
  subtitle: string;
  title: string;
}) {
  return (
    <View style={styles.inventoryBlock}>
      <View>
        <Text style={styles.inventoryTitle}>{title}</Text>
        <Text style={styles.inventorySubtitle}>{subtitle}</Text>
      </View>
      <KolamListTableComposition
        actionsColumn
        columns={columns}
        emptyTitle={loading ? `Memuat ${title.toLowerCase()}...` : emptyTitle}
        getRowKey={getRowKey}
        loading={loading}
        renderActions={renderActions}
        rows={rows}
        showFooter={false}
      />
    </View>
  );
}

function buildLocationProductInventoryColumns(): Array<
  KolamListTableColumn<KolamLocationProductRow>
> {
  return [
    {
      align: 'center',
      flex: 0.58,
      id: 'photo',
      label: 'Foto',
      render: product => (
        <InventoryPhoto
          label={`Foto ${product.name}`}
          scope="location-product"
          sourceUri={getKolamFileUrl(product.thumbnailImage)}
        />
      ),
    },
    {
      flex: 1.45,
      id: 'name',
      label: 'Produk',
      render: product => (
        <Text numberOfLines={2} style={styles.inventoryNameText}>
          {product.name}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'sku',
      label: 'SKU',
      render: product => (
        <Text numberOfLines={1} style={styles.inventoryCenterText}>
          {product.sku || '-'}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.65,
      id: 'stock',
      label: 'Stok',
      render: product => (
        <Text numberOfLines={1} style={styles.inventoryCenterText}>
          {product.stock}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.92,
      id: 'status',
      label: 'Status',
      render: product => (
        <View style={styles.inventoryBadgeCell}>
          <KolamStatusBadge
            intent={product.sellable ? 'success' : 'secondary'}
            label={product.sellable ? 'Layak Jual' : 'Tidak Layak Jual'}
          />
        </View>
      ),
    },
  ];
}

function buildLocationEnclosureInventoryColumns(): Array<
  KolamListTableColumn<KolamLocationEnclosureRow>
> {
  return [
    {
      align: 'center',
      flex: 0.58,
      id: 'photo',
      label: 'Foto',
      render: enclosure => (
        <InventoryPhoto
          label={`Foto ${enclosure.name}`}
          scope="location-enclosure"
          sourceUri={getKolamFileUrl(enclosure.coverPhotoUrl)}
        />
      ),
    },
    {
      align: 'center',
      flex: 0.84,
      id: 'code',
      label: 'Kode',
      render: enclosure => (
        <Text numberOfLines={1} style={styles.inventoryCenterText}>
          {enclosure.code || '-'}
        </Text>
      ),
    },
    {
      flex: 1.35,
      id: 'name',
      label: 'Kandang',
      render: enclosure => (
        <Text numberOfLines={2} style={styles.inventoryNameText}>
          {enclosure.name}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.86,
      id: 'type',
      label: 'Tipe',
      render: enclosure => (
        <Text numberOfLines={1} style={styles.inventoryCenterText}>
          {enclosure.type || '-'}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 1,
      id: 'pic',
      label: 'PIC',
      render: enclosure => (
        <Text numberOfLines={1} style={styles.inventoryCenterText}>
          {enclosure.assignedToName || '-'}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'status',
      label: 'Status',
      render: enclosure => (
        <Text numberOfLines={1} style={styles.inventoryCenterText}>
          {enclosure.status || '-'}
        </Text>
      ),
    },
  ];
}

function buildLocationAssetInventoryColumns(): Array<
  KolamListTableColumn<KolamLocationAssetRow>
> {
  return [
    {
      flex: 1.5,
      id: 'name',
      label: 'Aset',
      render: asset => (
        <Text numberOfLines={2} style={styles.inventoryNameText}>
          {asset.name}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.86,
      id: 'code',
      label: 'Kode',
      render: asset => (
        <Text numberOfLines={1} style={styles.inventoryCenterText}>
          {asset.code || '-'}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.86,
      id: 'status',
      label: 'Status',
      render: asset => (
        <Text numberOfLines={1} style={styles.inventoryCenterText}>
          {asset.status || '-'}
        </Text>
      ),
    },
  ];
}

function InventoryPhoto({
  label,
  scope,
  sourceUri,
}: {
  label: string;
  scope: string;
  sourceUri: string | null;
}) {
  return (
    <View style={styles.inventoryPhotoCell}>
      {sourceUri ? (
        <KolamRemoteImage
          accessibilityLabel={label}
          resizeMode="cover"
          scope={scope}
          sourceUri={sourceUri}
          style={styles.inventoryPhoto}
        />
      ) : (
        <Text style={styles.mutedText}>-</Text>
      )}
    </View>
  );
}

function getLocationParentOptions(
  locations: KolamLocationOption[],
  tier: KolamLocationTier,
) {
  if (tier === 'primary') {
    return [];
  }

  if (tier === 'secondary') {
    return locations.filter(location => location.tier === 'primary');
  }

  return locations.filter(
    location => location.tier === 'primary' || location.tier === 'secondary',
  );
}

function validateLocationParent(
  form: KolamLocationFormState,
  parent?: KolamLocationOption,
) {
  if (form.tier !== 'primary' && !form.parent) {
    return 'Silakan pilih lokasi induk.';
  }

  if (!form.parent || !parent) {
    return '';
  }

  const validParentType: Partial<Record<KolamLocationType, KolamLocationType>> =
    {
      area: 'store',
      bin: 'rack',
      floor: 'warehouse',
      rack: 'floor',
    };
  const expectedParentType = validParentType[form.type];

  if (expectedParentType && parent.type !== expectedParentType) {
    return `Induk untuk ${getKolamLocationTypeLabel(
      form.type,
    )} harus bertipe ${getKolamLocationTypeLabel(expectedParentType)}.`;
  }

  return '';
}

function normalizeOptionalLocationField(value: string) {
  const normalized = value.trim();
  return normalized || null;
}

function normalizeLocationTier(value: string): KolamLocationTier {
  return value === 'secondary' || value === 'tertiary' ? value : 'primary';
}

function normalizeLocationType(value: string): KolamLocationType {
  return KOLAM_LOCATION_TYPE_OPTIONS.some(option => option.value === value)
    ? (value as KolamLocationType)
    : 'warehouse';
}

function getLocationFormTypeOptions(currentType: KolamLocationType) {
  return currentType === 'bin'
    ? KOLAM_LOCATION_TYPE_OPTIONS
    : LOCATION_FORM_TYPE_OPTIONS;
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
  detailSurface: {
    gap: 14,
  },
  detailToolbarContext: {
    color: V.colors.fg,
    flexShrink: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    minWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  listStack: {
    gap: 14,
  },
  toolbarWrap: {
    elevation: 1000,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
  },
  toolbarButton: {
    flexShrink: 0,
    minHeight: 34,
    paddingHorizontal: 10,
  },
  filterOverlayPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 1200,
    padding: 6,
    position: 'absolute',
    shadowColor: V.colors.fg,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 16,
    top: 48,
    width: 220,
    zIndex: 120000,
  },
  filterPanelType: {
    left: 150,
  },
  filterPanelContent: {
    gap: 4,
  },
  filterPanelOption: {
    justifyContent: 'flex-start',
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
  listCell: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  identityCell: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  locationNameText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'left',
  },
  locationMetaText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    textAlign: 'center',
    width: '100%',
  },
  parentCopy: {
    alignItems: 'center',
    minWidth: 0,
    width: '100%',
  },
  parentNameText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
  },
  parentTypeText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
    textAlign: 'center',
  },
  centerBadge: {
    alignSelf: 'center',
  },
  actionsTrack: {
    alignItems: 'center',
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
  detailCard: {
    gap: 12,
    padding: 16,
  },
  locationSummaryRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  locationInfoCard: {
    flexBasis: 620,
    flexGrow: 1,
    minWidth: 360,
  },
  locationHierarchyCard: {
    flexBasis: 280,
    flexGrow: 0.45,
    gap: 14,
    minWidth: 260,
    paddingHorizontal: 14,
    paddingVertical: 14,
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
  summaryInlineText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
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
  formStack: {
    gap: 12,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formField: {
    flex: 1,
    gap: 6,
    minWidth: 260,
  },
  formLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
  },
  formInput: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: V.colors.fg,
    fontSize: 13,
    lineHeight: 20,
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  formTextarea: {
    minHeight: 104,
  },
  formDropdown: {
    alignSelf: 'stretch',
  },
  tierCardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tierCard: {
    alignItems: 'center',
    flex: 1,
    minHeight: 86,
    minWidth: 180,
    paddingHorizontal: 12,
  },
  tierCardText: {
    lineHeight: 18,
    textAlign: 'center',
  },
  helpText: {
    color: V.colors.mutedFg,
    fontSize: 12,
    lineHeight: 18,
  },
  parentSelectStack: {
    gap: 10,
  },
  noteBox: {
    backgroundColor: V.colors.infoSoft,
    borderColor: V.colors.info,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noteText: {
    color: V.colors.fg,
    fontSize: 12,
    lineHeight: 18,
  },
  mapsPreviewBox: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    padding: 12,
  },
  mapsPreviewText: {
    color: V.colors.mutedFg,
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    minWidth: 0,
  },
  formActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
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
  inventoryPhotoCell: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  inventoryPhoto: {
    borderRadius: 8,
    height: 40,
    width: 40,
  },
  inventoryNameText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
  },
  inventoryCenterText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
    width: '100%',
  },
  inventoryBadgeCell: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  mutedText: {
    color: V.colors.mutedFg,
    fontSize: 13,
    lineHeight: 20,
  },
});
