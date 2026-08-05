import React from 'react';
import {Linking, StyleSheet, Text, View} from 'react-native';
import {
  getKolamLocationRouteMode,
  getKolamLocationTierLabel,
  getKolamLocationTypeLabel,
  KOLAM_LOCATION_TIER_OPTIONS,
  KOLAM_LOCATION_TYPE_OPTIONS,
  type KolamLocationTier,
  type KolamLocationType,
} from '../domain/kolam-location';
import {
  fitKolamDataTableColumns,
  getKolamTableColumns,
  getKolamTableVisualContract,
  type KolamTableColumn,
} from '../domain/kolam-table';
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
import {KolamResetButton} from './kolam-reset-button';
import {KolamCatalogListTableShell} from './kolam-catalog-list-table-shell';
import {KolamConfirmDialog} from './kolam-confirm-dialog';
import {KolamContentFrame} from './kolam-content-frame';
import {KolamCopyStack} from './kolam-copy-stack';
import {
  getKolamDataTableColumnStyle,
  KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  KOLAM_DATA_TABLE_COLUMN_GAP,
} from './kolam-data-table-column-style';
import {
  KolamDataTableAmountCell,
  KolamDataTableMetaCell,
} from './kolam-data-table-text-cell';
import {KolamDataTableHeader} from './kolam-data-table-header';
import {KolamDataTableRowFrame} from './kolam-data-table-row-frame';
import {
  KolamDataTableActionsTrack,
  KolamDataTableMainTrack,
} from './kolam-data-table-tracks';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import {KolamEmptyState} from './kolam-empty-state';
import {KolamFormTextField} from './kolam-form-text-field';
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
            <KolamButton
              disabled={loading}
              label="Refresh"
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
  const [tableBodyWidth, setTableBodyWidth] = React.useState(0);
  const listColumns = React.useMemo(
    () => fitLocationListColumns(tableBodyWidth),
    [tableBodyWidth],
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
        }
        onBodyWidthChange={setTableBodyWidth}>
        <KolamDataTableHeader columns={listColumns} />
        {visibleItems.length ? (
          visibleItems.map(location => (
            <KolamLocationRow
              columns={listColumns}
              key={location.id}
              location={location}
              onDelete={() => setDeleteTarget(location)}
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

function KolamLocationRow({
  columns,
  location,
  onDelete,
  onEdit,
  onSelect,
  parentLookup,
}: {
  columns: ReturnType<typeof getKolamTableColumns>;
  location: KolamLocationListItem;
  onDelete: () => void;
  onEdit: () => void;
  onSelect: () => void;
  parentLookup: Record<string, KolamLocationOption>;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);
  const parent = resolveLocationParent(location, parentLookup);
  const columnOf = React.useCallback(
    (id: (typeof columns)[number]['id']) =>
      columns.find(column => column.id === id),
    [columns],
  );
  const primaryColumn = columnOf('primary');
  const typeColumn = columnOf('meta');
  const tierColumn = columnOf('children');
  const parentColumn = columnOf('notes');
  const phoneColumn = columnOf('marketplace');
  const descriptionColumn = columnOf('status');
  const createdColumn = columnOf('amount');
  const actionsColumn = columnOf('actions');

  return (
    <KolamDataTableRowFrame
      style={actionMenuOpen ? styles.activeActionRow : undefined}>
      <KolamDataTableMainTrack>
        <View
          style={[
            styles.listCell,
            styles.identityCell,
            primaryColumn ? getKolamDataTableColumnStyle(primaryColumn) : null,
          ]}>
          <KolamCopyStack
            items={[
              {
                id: 'name',
                text: location.name,
                style: styles.locationNameText,
                textProps: {numberOfLines: 1},
              },
            ]}
          />
        </View>
        <View
          style={[
            styles.listCell,
            typeColumn ? getKolamDataTableColumnStyle(typeColumn) : null,
          ]}>
          <KolamStatusBadge
            intent={getLocationTypeIntent(location.type)}
            label={getKolamLocationTypeLabel(location.type)}
            style={styles.centerBadge}
          />
        </View>
        <View
          style={[
            styles.listCell,
            tierColumn ? getKolamDataTableColumnStyle(tierColumn) : null,
          ]}>
          <Text numberOfLines={1} style={styles.locationMetaText}>
            {getKolamLocationTierLabel(location.tier)}
          </Text>
        </View>
        <View
          style={[
            styles.listCell,
            parentColumn ? getKolamDataTableColumnStyle(parentColumn) : null,
          ]}>
          <KolamCopyStack
            containerStyle={styles.parentCopy}
            items={[
              {
                id: 'parent-name',
                text: parent?.name || '-',
                style: styles.parentNameText,
                textProps: {numberOfLines: 1},
              },
              ...(parent?.type
                ? [
                    {
                      id: 'parent-type',
                      text: getKolamLocationTypeLabel(parent.type),
                      style: styles.parentTypeText,
                      textProps: {numberOfLines: 1},
                    },
                  ]
                : []),
            ]}
          />
        </View>
        <View
          style={[
            styles.listCell,
            phoneColumn ? getKolamDataTableColumnStyle(phoneColumn) : null,
          ]}>
          <Text numberOfLines={1} style={styles.locationMetaText}>
            {location.phoneNumber || '-'}
          </Text>
        </View>
        <View
          style={[
            styles.listCell,
            descriptionColumn
              ? getKolamDataTableColumnStyle(descriptionColumn)
              : null,
          ]}>
          <Text numberOfLines={2} style={styles.locationMetaText}>
            {truncateLocationDescription(location.description)}
          </Text>
        </View>
        <View
          style={[
            styles.listCell,
            createdColumn ? getKolamDataTableColumnStyle(createdColumn) : null,
          ]}>
          <Text numberOfLines={1} style={styles.locationMetaText}>
            {formatLocationDateTime(location.createdAt)}
          </Text>
        </View>
      </KolamDataTableMainTrack>
      <KolamDataTableActionsTrack
        style={styles.actionsTrack}
        width={Math.max(
          actionsColumn?.width ?? KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
          KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
        )}>
        <KolamOverflowMenuButton
          accessibilityLabel={`Menu ${location.name}`}
          actions={[
            {label: 'Lihat', onPress: onSelect},
            {label: 'Rubah', onPress: onEdit},
            {
              label: 'Hapus',
              onPress: onDelete,
              tone: 'danger',
            },
          ]}
          onOpenChange={setActionMenuOpen}
        />
      </KolamDataTableActionsTrack>
    </KolamDataTableRowFrame>
  );
}

function fitLocationListColumns(containerWidth: number): KolamTableColumn[] {
  return fitKolamDataTableColumns(
    getKolamTableColumns('location'),
    containerWidth,
    {
      actionsMinWidth: KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
      gap: KOLAM_DATA_TABLE_COLUMN_GAP,
      paddingX: getKolamTableVisualContract().body.cellPaddingX * 2,
      primaryMinWidth: 160,
      secondaryMinWidth: 56,
    },
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
