import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import {
  KOLAM_ENCLOSURE_LIST_TABS,
  KOLAM_ENCLOSURE_TYPES,
  KOLAM_ENCLOSURE_ROOT,
  canKolamEnclosureBeListed,
  canKolamProductionSaleBranch,
  climateDraftFromRow,
  climateDraftsEqual,
  filterKolamEnclosureTaskTypesForCategoryBucket,
  formatKolamEnclosureTaskStatusLabel,
  getKolamEnclosureParameterChartValues,
  getKolamEnclosureParameterLastUpdated,
  getKolamEnclosureTaskStatusIntent,
  getKolamProductionSaleStageKey,
  getKolamSpeciesSizeUpgradeTargets,
  mergeKolamEnclosureClimateRows,
  normalizeKolamEnclosurePageSize,
  resolveKolamProductionAdvanceTarget,
  supportsKolamEnclosureClimateParameters,
  type KolamEnclosure,
  type KolamEnclosureAllocationOverviewRow,
  type KolamEnclosureClientScope,
  type KolamEnclosureClimateDraft,
  type KolamEnclosureClimateRow,
  type KolamEnclosureDashboardDeathEvent,
  type KolamEnclosureDashboardSpeciesRow,
  type KolamEnclosureLivestockFilter,
  type KolamEnclosureLivestockPurpose,
  type KolamEnclosureProductionEvent,
  type KolamEnclosureStatistics,
  type KolamEnclosureStatisticsEvent,
  type KolamSpeciesTaxonomyProduction,
} from '../domain/kolam-enclosure';
import type {KolamBarcodeLabelItem} from '../domain/kolam-barcode';
import type {KolamSpecies} from '../domain/kolam-species';
import {
  fitKolamDataTableColumns,
  getKolamTableColumns,
  getKolamTableVisualContract,
  type KolamTableColumn,
} from '../domain/kolam-table';
import {kolamVisualTokens as V} from '../domain/kolam-visual';
import {getKolamFileUrl} from '../lib/file-url';
import {pickNativeImageFile} from '../services/native-file-picker';
import {getKolamSpeciesList, getKolamSpeciesTaxonomyProduction} from '../services/kolam-species-api';
import {getKolamEnclosures} from '../services/kolam-enclosure-api';
import {getKolamUnits} from '../services/kolam-unit-api';
import {
  useKolamEnclosureController,
  type KolamEnclosureController,
} from '../hooks/use-kolam-enclosure-controller';
import {KolamBarcodePanel} from './kolam-barcode-panel';
import {KolamBarcodePrintDialog} from './kolam-barcode-print-dialog';
import {KolamButton} from './kolam-button';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamCatalogListTableShell} from './kolam-catalog-list-table-shell';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamDashboardMetricSparkline} from './kolam-dashboard-metric-sparkline';
import {
  getKolamDataTableColumnStyle,
  KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  KOLAM_DATA_TABLE_COLUMN_GAP,
} from './kolam-data-table-column-style';
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
import {KolamHoverTooltip} from './kolam-hover-tooltip';
import {KolamProfileAvatarContent} from './kolam-profile-avatar-content';
import {KolamRemoteImage} from './kolam-remote-image';
import {KolamSearchField} from './kolam-search-field';
import {KolamStatusBadge} from './kolam-status-badge';
import {KolamTableFilterTrigger} from './kolam-table-filter-trigger';
import {kolamTableToolbarStyles} from './kolam-table-toolbar-styles';
import {KolamToggleRow} from './kolam-toggle-row';

type EnclosureFilterPanel = 'type' | 'livestock' | null;
type EnclosureDetailTab =
  | 'overview'
  | 'species'
  | 'production'
  | 'tasks'
  | 'statistics';

const ENCLOSURE_EDIT_NONE = '__none__';
const ENCLOSURE_EDIT_STATUS_OPTIONS = [
  'active',
  'inactive',
  'maintenance',
  'quarantine',
] as const;
const ENCLOSURE_EDIT_SIZE_UNIT_INITIALS = new Set(['Cm', 'Mm', 'M']);

type EnclosureEditFormState = {
  acquired_date: string;
  assignedTo: string;
  brandId: string;
  clientScope: KolamEnclosureClientScope;
  enclosure_code: string;
  enclosure_size: {
    high: {unit: string; value: number};
    length: {unit: string; value: number};
    width: {unit: string; value: number};
  };
  enclosure_type: string;
  livestockPurpose: KolamEnclosureLivestockPurpose;
  locationId: string;
  note: string;
  status: string;
  type_aquarium: string;
};
const ENCLOSURE_FILTER_PANEL_WIDTH = 232;
const DASHBOARD_SPECIES_PAGE_SIZE = 12;
const DASHBOARD_PRODUCTION_STATS_PAGE_SIZE = 10;
const DASHBOARD_DEATH_PAGE_SIZE = 10;
const PRODUCTION_DIAGRAM_TOP_N = 6;

const DASHBOARD_DEATH_COLUMNS: KolamTableColumn[] = [
  {id: 'meta', label: 'Waktu', align: 'left', width: 142},
  {id: 'children', label: 'Enclosure', align: 'left', width: 120},
  {id: 'primary', label: 'Species', align: 'left'},
  {id: 'amount', label: 'Qty', align: 'right', width: 80},
  {id: 'status', label: 'Status', align: 'center', width: 132},
  {id: 'actions', label: '', align: 'center', headerAlign: 'center', width: 64},
];

const ALLOCATION_OVERVIEW_COLUMNS: KolamTableColumn[] = [
  {id: 'primary', label: 'Species', align: 'left'},
  {id: 'notes', label: 'Varian', align: 'left', width: 132},
  {id: 'children', label: 'Sudah di enclosure', align: 'right', width: 148},
  {id: 'amount', label: 'Belum di enclosure', align: 'right', width: 148},
  {id: 'marketplace', label: 'Kode enclosure', align: 'left', width: 220},
];

const LIVESTOCK_FILTER_OPTIONS: Array<{
  label: string;
  value: KolamEnclosureLivestockFilter;
}> = [
  {label: 'Semua livestock', value: 'all'},
  {label: 'Saleable', value: 'saleable'},
  {label: 'Production', value: 'production'},
];

const ENCLOSURE_DETAIL_BASE_TABS: Array<{
  id: Exclude<EnclosureDetailTab, 'production'>;
  label: string;
}> = [
  {id: 'overview', label: 'Ringkasan'},
  {id: 'species', label: 'Spesies'},
  {id: 'tasks', label: 'Tugas'},
  {id: 'statistics', label: 'Statistik'},
];

const ENCLOSURE_DETAIL_TABS_WITH_PRODUCTION: Array<{
  id: EnclosureDetailTab;
  label: string;
}> = [
  {id: 'overview', label: 'Ringkasan'},
  {id: 'species', label: 'Spesies'},
  {id: 'production', label: 'Produksi'},
  {id: 'tasks', label: 'Tugas'},
  {id: 'statistics', label: 'Statistik'},
];

export function KolamEnclosureSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamEnclosureController(route);

  if (controller.mode === 'detail' || controller.mode === 'customer-detail') {
    return (
      <KolamEnclosureDetailSurface
        controller={controller}
        onRouteChange={onRouteChange}
      />
    );
  }

  if (controller.mode === 'edit') {
    return (
      <KolamEnclosureEditSurface
        controller={controller}
        onRouteChange={onRouteChange}
      />
    );
  }

  return (
    <View style={styles.surface}>
      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
          style={styles.errorBadge}
        />
      ) : null}
      {controller.statusMessage ? (
        <KolamStatusBadge
          intent="success"
          label={controller.statusMessage}
          numberOfLines={2}
          style={styles.errorBadge}
        />
      ) : null}
      <KolamEnclosureList
        controller={controller}
        onRouteChange={onRouteChange}
      />
    </View>
  );
}

function KolamEnclosureEditSurface({
  controller,
  onRouteChange,
}: {
  controller: KolamEnclosureController;
  onRouteChange?: (route: string) => void;
}) {
  const enclosure = controller.selectedEnclosure;
  const detailRoute = controller.routeEnclosureId
    ? `${KOLAM_ENCLOSURE_ROOT}/${encodeURIComponent(controller.routeEnclosureId)}`
    : KOLAM_ENCLOSURE_ROOT;
  const [form, setForm] = React.useState<EnclosureEditFormState>(() =>
    createEmptyEnclosureEditFormState(),
  );
  const [formError, setFormError] = React.useState<string | null>(null);
  const [hydratedId, setHydratedId] = React.useState('');

  React.useEffect(() => {
    if (!enclosure) {
      return;
    }
    if (hydratedId === enclosure.id) {
      return;
    }
    setForm(createEnclosureEditFormState(enclosure));
    setHydratedId(enclosure.id);
    setFormError(null);
  }, [enclosure, hydratedId]);

  if (controller.loading && controller.dataSource === 'idle') {
    return <InlineState title="Memuat data enclosure..." />;
  }
  if (controller.error && !enclosure) {
    return (
      <View style={styles.surface}>
        <InlineState
          message={controller.error}
          title="Gagal memuat data enclosure"
        />
        <View style={styles.detailActions}>
          <KolamButton
            label="Batal"
            onPress={() => onRouteChange?.(detailRoute)}
          />
          <KolamButton
            disabled={controller.loading}
            label="Muat ulang"
            onPress={() => void controller.onRefresh()}
          />
        </View>
      </View>
    );
  }
  if (!enclosure) {
    return (
      <View style={styles.surface}>
        <InlineState
          message="Data enclosure tidak ditemukan dari response Kolam."
          title="Enclosure tidak ditemukan"
        />
        <View style={styles.detailActions}>
          <KolamButton
            label="Batal"
            onPress={() => onRouteChange?.(detailRoute)}
          />
        </View>
      </View>
    );
  }

  const sizeUnitOptions = controller.editUnits.filter(unit =>
    ENCLOSURE_EDIT_SIZE_UNIT_INITIALS.has(unit.initial),
  );
  const sizeUnitId =
    form.enclosure_size.high.unit ||
    form.enclosure_size.width.unit ||
    form.enclosure_size.length.unit ||
    '';
  const effectiveSizeUnitId = sizeUnitId || sizeUnitOptions[0]?.id || '';
  const needsProvisioning =
    enclosure.computed.needsProvisioning || !enclosure.code.trim();
  const hasSize =
    Number(form.enclosure_size.high.value) > 0 &&
    Number(form.enclosure_size.width.value) > 0 &&
    Number(form.enclosure_size.length.value) > 0;
  const sizeLocked =
    !needsProvisioning && hasSize && Boolean(form.enclosure_code.trim());
  const coverUri = getKolamFileUrl(enclosure.coverPhotoUrl);
  const brandBannerUri = getKolamFileUrl(enclosure.brand?.photos?.[0] || '');
  const brandOptions = [
    {label: '—', value: ENCLOSURE_EDIT_NONE},
    ...controller.editBrands.map(brand => ({
      label: brand.name,
      value: brand.id,
    })),
  ];
  const locationOptions = [
    {label: '—', value: ENCLOSURE_EDIT_NONE},
    ...controller.editLocations.map(location => ({
      label: location.name || location.label,
      value: location.id,
    })),
  ];
  const picOptions = [
    {label: '— Tidak ada —', value: ENCLOSURE_EDIT_NONE},
    ...controller.staffAssignees.map(staff => ({
      label: staff.displayName || staff.username || staff.email || staff.id,
      value: staff.id,
    })),
  ];
  const typeOptions = KOLAM_ENCLOSURE_TYPES.map(type => ({
    label: type,
    value: type,
  }));
  const statusOptions = ENCLOSURE_EDIT_STATUS_OPTIONS.map(status => ({
    label: status,
    value: status,
  }));
  const unitSelectOptions = sizeUnitOptions.map(unit => ({
    label: unit.initial || unit.name,
    value: unit.id,
  }));

  const formatDim = (value: number, unitId: string) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return '—';
    }
    const unit = sizeUnitOptions.find(item => item.id === unitId);
    return unit ? `${numeric} ${unit.initial || unit.name}` : String(numeric);
  };

  const patchSizeValue = (
    dim: 'high' | 'width' | 'length',
    raw: string,
  ) => {
    const next = Number(raw);
    setForm(current => ({
      ...current,
      enclosure_size: {
        ...current.enclosure_size,
        [dim]: {
          unit: effectiveSizeUnitId,
          value: Number.isFinite(next) ? next : 0,
        },
      },
    }));
  };

  const onSave = async () => {
    if (!form.enclosure_code.trim() || !form.enclosure_type) {
      setFormError('Kode dan tipe wajib');
      return;
    }
    if (!effectiveSizeUnitId) {
      setFormError('Satuan ukuran wajib');
      return;
    }
    setFormError(null);
    const code = form.enclosure_code.trim().toUpperCase();
    const saved = await controller.onSaveEnclosureEdit({
      assignedTo: form.assignedTo || null,
      body: {
        acquired_date: form.acquired_date || undefined,
        brandId: form.brandId || undefined,
        clientScope: form.clientScope,
        enclosure_code: code,
        enclosure_name: code,
        enclosure_type: form.enclosure_type,
        livestockPurpose: form.livestockPurpose,
        locationId: form.locationId || undefined,
        note: form.note.trim() || undefined,
        status: form.status,
        type_aquarium:
          form.enclosure_type === 'Aquarium' ? form.type_aquarium : undefined,
        ...(sizeLocked
          ? {}
          : {
              enclosure_size: {
                high: {
                  unit: effectiveSizeUnitId,
                  value: Number(form.enclosure_size.high.value),
                },
                length: {
                  unit: effectiveSizeUnitId,
                  value: Number(form.enclosure_size.length.value),
                },
                width: {
                  unit: effectiveSizeUnitId,
                  value: Number(form.enclosure_size.width.value),
                },
              },
            }),
      },
    });
    if (saved) {
      onRouteChange?.(detailRoute);
    }
  };

  const onPickCover = async () => {
    const picked = await pickNativeImageFile();
    if (!picked.cancelled && picked.uri) {
      await controller.onUploadCoverPhoto(picked.uri);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.editFormContent}>
      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
          style={styles.errorBadge}
        />
      ) : null}
      {formError ? (
        <KolamStatusBadge
          intent="danger"
          label={formError}
          numberOfLines={2}
          style={styles.errorBadge}
        />
      ) : null}
      {controller.statusMessage ? (
        <KolamStatusBadge
          intent="success"
          label={controller.statusMessage}
          numberOfLines={2}
          style={styles.errorBadge}
        />
      ) : null}

      <DetailSection title="Identitas">
        <Text style={styles.sectionMeta}>
          Kode, merek, dan tanggal pemasangan.
        </Text>
        <View style={styles.editFormGrid}>
          <LabeledEditField label="Kode *">
            <KolamFormTextField
              onChangeText={value =>
                setForm(current => ({
                  ...current,
                  enclosure_code: value.toUpperCase(),
                }))
              }
              placeholder="Kode enclosure"
              style={styles.editFormInput}
              value={form.enclosure_code}
            />
          </LabeledEditField>
          <LabeledEditField label="Merek">
            <KolamDropdownSelect
              label="Merek"
              menuPlacement="inline"
              onChange={value =>
                setForm(current => ({
                  ...current,
                  brandId: value === ENCLOSURE_EDIT_NONE ? '' : value,
                }))
              }
              options={brandOptions}
              showLabelInTrigger={false}
              style={styles.editFormInput}
              value={form.brandId || ENCLOSURE_EDIT_NONE}
            />
          </LabeledEditField>
          {brandBannerUri ? (
            <View style={styles.editBrandBanner}>
              <KolamRemoteImage
                accessibilityLabel="Banner merek"
                resizeMode="contain"
                scope="enclosure-edit-brand"
                sourceUri={brandBannerUri}
                style={styles.editBrandBannerImage}
              />
            </View>
          ) : null}
          <LabeledEditField label="Tanggal ditambahkan">
            <KolamFormTextField
              onChangeText={value =>
                setForm(current => ({...current, acquired_date: value}))
              }
              placeholder="YYYY-MM-DD"
              style={styles.editFormInput}
              value={form.acquired_date}
            />
          </LabeledEditField>
          <LabeledEditField label="Visibilitas klien">
            <KolamDropdownSelect
              label="Visibilitas klien"
              menuPlacement="inline"
              onChange={value =>
                setForm(current => ({
                  ...current,
                  clientScope: value as KolamEnclosureClientScope,
                }))
              }
              options={[
                {label: 'Internal staff', value: 'internal'},
                {label: 'Terhubung klien', value: 'client_linked'},
              ]}
              showLabelInTrigger={false}
              style={styles.editFormInput}
              value={form.clientScope}
            />
          </LabeledEditField>
          <LabeledEditField label="Tujuan livestock">
            <KolamDropdownSelect
              label="Tujuan livestock"
              menuPlacement="inline"
              onChange={value =>
                setForm(current => ({
                  ...current,
                  livestockPurpose: value as KolamEnclosureLivestockPurpose,
                }))
              }
              options={[
                {label: 'Stok jual', value: 'saleable'},
                {label: 'Produksi (indukan)', value: 'production'},
              ]}
              showLabelInTrigger={false}
              style={styles.editFormInput}
              value={form.livestockPurpose}
            />
          </LabeledEditField>
          <Text style={styles.sectionMeta}>
            Produksi = seluruh isi kandang indukan (stock OUT, tidak dijual)
          </Text>
        </View>
      </DetailSection>

      <DetailSection title="Foto sampul">
        <Text style={styles.sectionMeta}>Gambar utama enclosure.</Text>
        <View style={styles.editCoverPreview}>
          {coverUri ? (
            <KolamRemoteImage
              accessibilityLabel="Cover enclosure"
              resizeMode="cover"
              scope="enclosure-edit-cover"
              sourceUri={coverUri}
              style={styles.editCoverImage}
            />
          ) : (
            <Text style={styles.mutedText}>Belum ada foto</Text>
          )}
        </View>
        <View style={styles.detailActions}>
          <KolamButton
            disabled={controller.operationLoading}
            label="Unggah"
            onPress={() => void onPickCover()}
          />
          {coverUri ? (
            <KolamButton
              disabled={controller.operationLoading}
              label="Hapus foto"
              onPress={() => void controller.onDeleteCoverPhoto()}
            />
          ) : null}
        </View>
      </DetailSection>

      <DetailSection title="Operasional">
        <Text style={styles.sectionMeta}>Tipe, lokasi, PIC, dan status.</Text>
        <View style={styles.editFormGrid}>
          <LabeledEditField label="Tipe">
            <KolamDropdownSelect
              label="Tipe"
              menuPlacement="inline"
              onChange={value =>
                setForm(current => ({
                  ...current,
                  enclosure_type: value,
                  type_aquarium: '',
                }))
              }
              options={typeOptions}
              showLabelInTrigger={false}
              style={styles.editFormInput}
              value={form.enclosure_type || typeOptions[0]?.value || 'Terrarium'}
            />
          </LabeledEditField>
          {form.enclosure_type === 'Aquarium' ? (
            <LabeledEditField label="Tipe air">
              <KolamDropdownSelect
                label="Tipe air"
                menuPlacement="inline"
                onChange={value =>
                  setForm(current => ({...current, type_aquarium: value}))
                }
                options={[
                  {label: 'Freshwater', value: 'freshwater'},
                  {label: 'Marine', value: 'marine'},
                ]}
                showLabelInTrigger={false}
                style={styles.editFormInput}
                value={form.type_aquarium || 'freshwater'}
              />
            </LabeledEditField>
          ) : null}
          <LabeledEditField label="Status">
            <KolamDropdownSelect
              label="Status"
              menuPlacement="inline"
              onChange={value =>
                setForm(current => ({...current, status: value}))
              }
              options={statusOptions}
              showLabelInTrigger={false}
              style={styles.editFormInput}
              value={form.status || 'active'}
            />
          </LabeledEditField>
          <LabeledEditField label="Lokasi">
            <KolamDropdownSelect
              label="Lokasi"
              menuPlacement="inline"
              onChange={value =>
                setForm(current => ({
                  ...current,
                  locationId: value === ENCLOSURE_EDIT_NONE ? '' : value,
                }))
              }
              options={locationOptions}
              showLabelInTrigger={false}
              style={styles.editFormInput}
              value={form.locationId || ENCLOSURE_EDIT_NONE}
            />
          </LabeledEditField>
          <LabeledEditField label="PIC">
            <KolamDropdownSelect
              label="PIC"
              menuPlacement="inline"
              onChange={value =>
                setForm(current => ({
                  ...current,
                  assignedTo: value === ENCLOSURE_EDIT_NONE ? '' : value,
                }))
              }
              options={picOptions}
              showLabelInTrigger={false}
              style={styles.editFormInput}
              value={form.assignedTo || ENCLOSURE_EDIT_NONE}
            />
          </LabeledEditField>
          <LabeledEditField label="Catatan">
            <KolamFormTextField
              multiline
              numberOfLines={3}
              onChangeText={value =>
                setForm(current => ({...current, note: value}))
              }
              placeholder="Catatan"
              style={[styles.editFormInput, styles.editFormTextArea]}
              value={form.note}
            />
          </LabeledEditField>
        </View>
      </DetailSection>

      <DetailSection title="Ukuran">
        <Text style={styles.sectionMeta}>
          {sizeLocked
            ? 'Dimensi sudah tercatat — view-only setelah provisioning.'
            : 'Dimensi fisik enclosure.'}
        </Text>
        {sizeLocked ? (
          <View style={styles.editSizeLockedList}>
            <DetailField
              label="Tinggi"
              value={formatDim(form.enclosure_size.high.value, effectiveSizeUnitId)}
            />
            <DetailField
              label="Lebar"
              value={formatDim(form.enclosure_size.width.value, effectiveSizeUnitId)}
            />
            <DetailField
              label="Panjang"
              value={formatDim(form.enclosure_size.length.value, effectiveSizeUnitId)}
            />
          </View>
        ) : (
          <View style={styles.editFormGrid}>
            <LabeledEditField label="Satuan ukuran">
              <KolamDropdownSelect
                label="Satuan ukuran"
                menuPlacement="inline"
                onChange={value =>
                  setForm(current => ({
                    ...current,
                    enclosure_size: {
                      high: {
                        unit: value,
                        value: Number(current.enclosure_size.high.value) || 0,
                      },
                      length: {
                        unit: value,
                        value: Number(current.enclosure_size.length.value) || 0,
                      },
                      width: {
                        unit: value,
                        value: Number(current.enclosure_size.width.value) || 0,
                      },
                    },
                  }))
                }
                options={
                  unitSelectOptions.length
                    ? unitSelectOptions
                    : [{label: '—', value: ''}]
                }
                showLabelInTrigger={false}
                style={styles.editFormInput}
                value={effectiveSizeUnitId || unitSelectOptions[0]?.value || ''}
              />
            </LabeledEditField>
            <LabeledEditField label="Tinggi">
              <KolamFormTextField
                mode="numeric"
                onChangeText={value => patchSizeValue('high', value)}
                placeholder="0"
                style={styles.editFormInput}
                value={String(form.enclosure_size.high.value || 0)}
              />
            </LabeledEditField>
            <LabeledEditField label="Lebar">
              <KolamFormTextField
                mode="numeric"
                onChangeText={value => patchSizeValue('width', value)}
                placeholder="0"
                style={styles.editFormInput}
                value={String(form.enclosure_size.width.value || 0)}
              />
            </LabeledEditField>
            <LabeledEditField label="Panjang">
              <KolamFormTextField
                mode="numeric"
                onChangeText={value => patchSizeValue('length', value)}
                placeholder="0"
                style={styles.editFormInput}
                value={String(form.enclosure_size.length.value || 0)}
              />
            </LabeledEditField>
          </View>
        )}
      </DetailSection>

      <View style={styles.detailActions}>
        <KolamButton
          disabled={controller.operationLoading}
          label="Simpan"
          onPress={() => void onSave()}
        />
        <KolamButton
          disabled={controller.operationLoading}
          label="Batal"
          onPress={() => onRouteChange?.(detailRoute)}
        />
      </View>
    </ScrollView>
  );
}

function LabeledEditField({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <View style={styles.editFormField}>
      <Text style={styles.detailFieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function createEmptyEnclosureEditFormState(): EnclosureEditFormState {
  return {
    acquired_date: '',
    assignedTo: '',
    brandId: '',
    clientScope: 'internal',
    enclosure_code: '',
    enclosure_size: {
      high: {unit: '', value: 0},
      length: {unit: '', value: 0},
      width: {unit: '', value: 0},
    },
    enclosure_type: '',
    livestockPurpose: 'saleable',
    locationId: '',
    note: '',
    status: 'active',
    type_aquarium: '',
  };
}

function createEnclosureEditFormState(
  enclosure: KolamEnclosure,
): EnclosureEditFormState {
  const unitId =
    enclosure.size.high.unit?.id ||
    enclosure.size.width.unit?.id ||
    enclosure.size.length.unit?.id ||
    '';
  return {
    acquired_date: enclosure.acquiredDate,
    assignedTo: enclosure.assignedToId || enclosure.assignedTo?.id || '',
    brandId: enclosure.brandId || enclosure.brand?.id || '',
    clientScope: enclosure.clientScope || 'internal',
    enclosure_code: enclosure.code || '',
    enclosure_size: {
      high: {unit: unitId, value: Number(enclosure.size.high.value) || 0},
      length: {unit: unitId, value: Number(enclosure.size.length.value) || 0},
      width: {unit: unitId, value: Number(enclosure.size.width.value) || 0},
    },
    enclosure_type: enclosure.type || '',
    livestockPurpose:
      enclosure.livestockPurpose === 'production' ? 'production' : 'saleable',
    locationId: enclosure.locationId || enclosure.location?.id || '',
    note: enclosure.note || '',
    status: enclosure.status || 'active',
    type_aquarium: enclosure.aquariumWaterType || '',
  };
}

function KolamEnclosureDetailSurface({
  controller,
  onRouteChange,
}: {
  controller: KolamEnclosureController;
  onRouteChange?: (route: string) => void;
}) {
  const enclosure = controller.selectedEnclosure;
  const [activeDetailTab, setActiveDetailTab] =
    React.useState<EnclosureDetailTab>('overview');
  const showProductionTab = Boolean(
    enclosure &&
      (enclosure.computed.productionPhaseTabVisible ||
        enclosure.livestockPurpose === 'production'),
  );
  const detailTabs = React.useMemo(
    () => getEnclosureDetailTabs(showProductionTab),
    [showProductionTab],
  );
  const safeActiveDetailTab = detailTabs.some(tab => tab.id === activeDetailTab)
    ? activeDetailTab
    : 'overview';

  React.useEffect(() => {
    if (!detailTabs.some(tab => tab.id === activeDetailTab)) {
      setActiveDetailTab('overview');
    }
  }, [activeDetailTab, detailTabs]);

  if (controller.loading && controller.dataSource === 'idle') {
    return <InlineState title="Memuat detail enclosure..." />;
  }
  if (controller.error) {
    return (
      <View style={styles.surface}>
        <InlineState
          message={controller.error}
          title="Gagal memuat detail enclosure"
        />
        <View style={styles.detailActions}>
          <KolamButton
            label="Daftar"
            onPress={() => onRouteChange?.(`${KOLAM_ENCLOSURE_ROOT}?scope=dashboard`)}
          />
          <KolamButton
            disabled={controller.loading}
            label="Muat ulang"
            onPress={() => void controller.onRefresh()}
          />
        </View>
      </View>
    );
  }
  if (!enclosure) {
    return (
      <InlineState
        message="Data enclosure tidak ditemukan dari response Kolam."
        title="Enclosure tidak ditemukan"
      />
    );
  }

  const scopeLabel =
    enclosure.clientScope === 'client_linked' ? 'Pelanggan' : 'Internal';
  const toolbarContext =
    enclosure.code.trim() || enclosure.name.trim() || enclosure.id;

  return (
    <View style={styles.detailSurface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text numberOfLines={1} style={styles.detailToolbarContext}>
              {toolbarContext}
            </Text>
            {detailTabs.map(tab => (
              <KolamButton
                intent={safeActiveDetailTab === tab.id ? 'primary' : 'outline'}
                key={tab.id}
                label={tab.label}
                onPress={() => setActiveDetailTab(tab.id)}
                style={styles.toolbarButton}
              />
            ))}
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              label="Daftar"
              onPress={() =>
                onRouteChange?.(`${KOLAM_ENCLOSURE_ROOT}?scope=dashboard`)
              }
              style={styles.toolbarButton}
            />
            <KolamButton
              disabled={controller.loading || controller.operationLoading}
              label="Muat ulang"
              onPress={() => void controller.onRefresh()}
              style={styles.toolbarButton}
            />
            <KolamButton
              label="Ubah"
              onPress={() =>
                onRouteChange?.(
                  `${KOLAM_ENCLOSURE_ROOT}/${enclosure.id}/edit`,
                )
              }
              style={styles.toolbarButton}
            />
          </View>
        </View>
      </View>

      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
          style={styles.errorBadge}
        />
      ) : null}
      {controller.statusMessage ? (
        <KolamStatusBadge
          intent="success"
          label={controller.statusMessage}
          numberOfLines={2}
          style={styles.errorBadge}
        />
      ) : null}

      <ScrollView
        contentContainerStyle={styles.detailContent}
        style={styles.detailRoot}
      >
        {safeActiveDetailTab === 'overview' ? (
          <KolamEnclosureDetailOverview
            controller={controller}
            enclosure={enclosure}
            scopeLabel={scopeLabel}
          />
        ) : null}
        {safeActiveDetailTab === 'species' ? (
          <KolamEnclosureDetailSpeciesTab
            controller={controller}
            enclosure={enclosure}
          />
        ) : null}
        {safeActiveDetailTab === 'production' ? (
          <KolamEnclosureDetailProductionTab
            controller={controller}
            enclosure={enclosure}
          />
        ) : null}
        {safeActiveDetailTab === 'tasks' ? (
          <KolamEnclosureDetailTasksTab
            controller={controller}
            onRouteChange={onRouteChange}
          />
        ) : null}
        {safeActiveDetailTab === 'statistics' ? (
          <KolamEnclosureDetailStatisticsTab
            controller={controller}
            enclosure={enclosure}
            onRouteChange={onRouteChange}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

function KolamEnclosureDetailOverview({
  controller,
  enclosure,
  scopeLabel,
}: {
  controller: KolamEnclosureController;
  enclosure: KolamEnclosure;
  scopeLabel: string;
}) {
  const [barcodeOpen, setBarcodeOpen] = React.useState(false);
  const coverUri = getKolamFileUrl(enclosure.coverPhotoUrl);
  const photoUris = getEnclosureDetailPhotoUris(enclosure);
  const sizeText = formatEnclosureSize(enclosure);
  const volumeText =
    enclosure.computed.volumeLiters != null
      ? `${enclosure.computed.volumeLiters} L`
      : '-';
  const showProvisioning =
    enclosure.computed.needsProvisioning && !enclosure.code.trim();
  const barcodeItems = React.useMemo<KolamBarcodeLabelItem[]>(
    () =>
      enclosure.code.trim()
        ? [
            {
              id: enclosure.id,
              name: enclosure.name || enclosure.code,
              code: enclosure.code,
            },
          ]
        : [],
    [enclosure.code, enclosure.id, enclosure.name],
  );

  return (
    <>
      <KolamCardFrame style={styles.stripCard} variant="compact">
        <View style={styles.stripRow}>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>Status</Text>
            <KolamStatusBadge
              intent={getEnclosureStatusIntent(enclosure.status)}
              label={enclosure.status || 'active'}
              textStyle={styles.badgeTextSm}
            />
          </View>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>Tujuan</Text>
            <KolamStatusBadge
              intent={
                enclosure.livestockPurpose === 'production' ? 'warning' : 'muted'
              }
              label={getLivestockPurposeLabel(enclosure.livestockPurpose)}
              textStyle={styles.badgeTextSm}
            />
          </View>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>Tipe</Text>
            <KolamStatusBadge
              intent="muted"
              label={String(enclosure.type || '-')}
              textStyle={styles.badgeTextSm}
            />
          </View>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>Cakupan</Text>
            <KolamStatusBadge
              intent={
                enclosure.clientScope === 'client_linked' ? 'success' : 'muted'
              }
              label={scopeLabel}
              textStyle={styles.badgeTextSm}
            />
          </View>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>Penjualan</Text>
            <Text style={styles.stripValue}>
              {getSaleStatusLabel(enclosure.saleStatus)}
            </Text>
          </View>
        </View>
      </KolamCardFrame>

      <View style={styles.columns}>
        <View style={styles.columnMain}>
          {enclosure.livestockPurpose === 'production' ? (
            <View style={styles.detailWarningBand}>
              <Text style={styles.warningText}>
                Kandang produksi (indukan - tidak dijual)
              </Text>
            </View>
          ) : null}

          <View style={styles.detailMediaPanel}>
            <View style={styles.detailMainPhoto}>
              {coverUri ? (
                <KolamRemoteImage
                  accessibilityLabel={`Foto utama ${enclosure.name || enclosure.code}`}
                  resizeMode="cover"
                  scope="enclosure-detail-gallery"
                  sourceUri={coverUri}
                  style={styles.detailMainPhotoImage}
                />
              ) : (
                <Text style={styles.mutedText}>Tidak ada foto</Text>
              )}
            </View>
            {photoUris.length > 1 ? (
              <View style={styles.detailThumbRow}>
                {photoUris.slice(0, 4).map((uri, index) => (
                  <KolamRemoteImage
                    accessibilityLabel={`Foto enclosure ${index + 1}`}
                    key={`${uri}:${index}`}
                    resizeMode="cover"
                    scope="enclosure-detail-thumbs"
                    sourceUri={uri}
                    style={styles.detailThumb}
                  />
                ))}
              </View>
            ) : null}
            {enclosure.code.trim() ? (
              <KolamBarcodePanel
                name={enclosure.name || enclosure.code}
                onPrint={() => setBarcodeOpen(true)}
                sku={enclosure.code}
              />
            ) : null}
          </View>

          <DetailSection title="Informasi enclosure">
            <View style={styles.detailFieldGrid}>
              <DetailField label="Kode" value={enclosure.code || '-'} />
              <DetailField label="Nama" value={enclosure.name || '-'} />
              <DetailField
                label="Tipe"
                value={
                  [
                    enclosure.type,
                    getAquariumWaterLabel(enclosure.aquariumWaterType),
                  ]
                    .filter(Boolean)
                    .join(' / ') || '-'
                }
              />
              <DetailField
                label="Tujuan livestock"
                value={getLivestockPurposeLabel(enclosure.livestockPurpose)}
              />
              <DetailField label="Status" value={enclosure.status || 'active'} />
              <DetailField label="Cakupan" value={scopeLabel} />
              <DetailField
                label="Pelanggan"
                value={enclosure.customer?.name || '-'}
              />
              <DetailField
                label="Lokasi"
                value={
                  [enclosure.location?.name, enclosure.location?.code]
                    .filter(Boolean)
                    .join(' / ') || '-'
                }
              />
              <DetailField
                label="PIC"
                value={enclosure.assignedTo?.displayName || '-'}
              />
              <DetailField label="Ukuran" value={sizeText || '-'} />
              <DetailField label="Volume" value={volumeText} />
              <DetailField
                label="Usia"
                value={enclosure.computed.ageLabel || '-'}
              />
              <DetailField label="Merek" value={enclosure.brand?.name || '-'} />
              <DetailField
                label="Status penjualan"
                value={getSaleStatusLabel(enclosure.saleStatus)}
              />
            </View>
          </DetailSection>

          {enclosure.note.trim() ? (
            <DetailSection title="Catatan">
              <Text style={styles.detailParagraph}>{enclosure.note}</Text>
            </DetailSection>
          ) : null}

          <EnclosureClimateParameters
            controller={controller}
            enclosure={enclosure}
          />

          <EnclosureSaleListingOperation
            controller={controller}
            enclosure={enclosure}
          />

          {showProvisioning ? (
            <EnclosureProvisioningOperation controller={controller} />
          ) : null}
        </View>

        <View style={styles.columnSide}>
          <DetailSection title="Spesies di enclosure">
            {enclosure.species.length ? (
              enclosure.species.slice(0, 6).map(item => (
                <View
                  key={`${item.speciesId}:${item.variantId}`}
                  style={styles.detailMiniRow}
                >
                  <KolamCopyStack
                    containerStyle={styles.panelRowCopy}
                    items={[
                      {
                        id: 'title',
                        text: item.speciesName || item.scientificName || '-',
                        style: styles.rowTitle,
                      },
                      {
                        id: 'meta',
                        text: [item.scientificName, item.variantLabel]
                          .filter(Boolean)
                          .join(' / '),
                        style: styles.rowMeta,
                      },
                    ]}
                  />
                  <Text style={styles.qtyText}>
                    {item.quantity} {item.unitLabel}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.mutedText}>Belum ada spesies.</Text>
            )}
          </DetailSection>

          <EnclosureMediaOperation
            controller={controller}
            enclosure={enclosure}
          />

          <EnclosureCommentsOperation controller={controller} />
        </View>
      </View>

      <KolamBarcodePrintDialog
        description="Label CODE128 memakai kode enclosure. Ukuran label mengikuti web enclosure: 75mm × 45mm."
        items={barcodeItems}
        onOpenChange={setBarcodeOpen}
        title="Cetak Barcode Enclosure"
        visible={barcodeOpen}
      />
    </>
  );
}

function KolamEnclosureDetailSpeciesTab({
  controller,
  enclosure,
}: {
  controller: KolamEnclosureController;
  enclosure: KolamEnclosure;
}) {
  return (
    <>
      <View style={styles.detailTwoColumn}>
        <DetailSection title="Spesies di enclosure">
          {enclosure.species.length ? (
            enclosure.species.map(item => (
              <View key={`${item.speciesId}:${item.variantId}`} style={styles.detailMiniRow}>
                <KolamCopyStack
                  containerStyle={styles.panelRowCopy}
                  items={[
                    {
                      id: 'title',
                      text: item.speciesName || item.scientificName || '-',
                      style: styles.rowTitle,
                    },
                    {
                      id: 'meta',
                      text: [item.scientificName, item.variantLabel]
                        .filter(Boolean)
                        .join(' / '),
                      style: styles.rowMeta,
                    },
                  ]}
                />
                <Text style={styles.qtyText}>
                  {item.quantity} {item.unitLabel}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.mutedText}>Belum ada spesies.</Text>
          )}
        </DetailSection>
        <DetailSection title="Riwayat populasi">
          {enclosure.speciesPopulationHistory.length ? (
            enclosure.speciesPopulationHistory.slice(0, 12).map((item, index) => (
              <View key={item.id || `${item.createdAt}:${index}`} style={styles.detailMiniRow}>
                <KolamCopyStack
                  containerStyle={styles.panelRowCopy}
                  items={[
                    {
                      id: 'title',
                      text: item.speciesName || item.scientificName || '-',
                      style: styles.rowTitle,
                    },
                    {
                      id: 'meta',
                      text: [
                        formatDashboardDateTime(item.createdAt),
                        item.eventTypeLabel || item.eventType,
                        item.reason,
                      ]
                        .filter(Boolean)
                        .join(' / '),
                      style: styles.rowMeta,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.qtyText,
                    item.delta < 0 ? styles.warningText : null,
                  ]}
                >
                  {item.delta > 0 ? '+' : ''}
                  {item.delta} {item.unitLabel}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.mutedText}>Belum ada riwayat populasi.</Text>
          )}
        </DetailSection>
      </View>
      <EnclosureSpeciesOperation
        controller={controller}
        enclosure={enclosure}
      />
    </>
  );
}

function KolamEnclosureDetailProductionTab({
  controller,
  enclosure,
}: {
  controller: KolamEnclosureController;
  enclosure: KolamEnclosure;
}) {
  const statistics = controller.enclosureStatistics;
  const production = statistics?.production ?? null;
  const productionSummary = production?.summary;
  const showEndpointState =
    controller.enclosureStatisticsLoading ||
    Boolean(controller.enclosureStatisticsError);

  return (
    <View style={styles.detailTwoColumn}>
      <DetailSection title="Ringkasan produksi">
        {showEndpointState ? (
          <DetailEndpointState
            error={controller.enclosureStatisticsError}
            loading={controller.enclosureStatisticsLoading}
          />
        ) : null}
        <View style={styles.summaryGrid}>
          <SummaryTile
            accent="primary"
            hint="Populasi (+) alasan KELAHIRAN"
            icon="+"
            label="Kelahiran indukan"
            value={
              productionSummary?.indukanBirthQty ??
              countProductionBirthQty(enclosure)
            }
          />
          <SummaryTile
            icon="P"
            label="Populasi indukan"
            value={
              statistics?.summary.currentPopulationQty ??
              sumDetailSpeciesQty(enclosure)
            }
          />
          <SummaryTile
            hint={
              productionSummary
                ? `Tambah ${productionSummary.eggAddedQty} / tetas ${productionSummary.hatchQty}`
                : undefined
            }
            icon="T"
            label="Telur produksi"
            value={
              productionSummary?.currentEggQty ??
              sumProductionEggQty(enclosure)
            }
          />
          <SummaryTile
            hint={
              productionSummary
                ? `Antar kandang ${productionSummary.transferInQty} / stok jual ${productionSummary.fromSaleableQty}`
                : undefined
            }
            icon="M"
            label="Pindah masuk"
            value={
              productionSummary
                ? productionSummary.transferInQty +
                  productionSummary.fromSaleableQty
                : 0
            }
          />
        </View>
      </DetailSection>
      {production ? (
        <DetailSection title="Log produksi">
          <ProductionEventList
            emptyLabel="Belum ada catatan produksi."
            rows={production.events.slice(0, 12)}
          />
        </DetailSection>
      ) : null}
      <DetailSection title="Telur di kandang">
        {(production?.eggsBySpecies.length
          ? production.eggsBySpecies
          : enclosure.productionEggs
        ).length ? (
          (production?.eggsBySpecies.length
            ? production.eggsBySpecies
            : enclosure.productionEggs
          ).map(item => (
            <View
              key={item.speciesId || item.speciesName}
              style={styles.detailMiniRow}
            >
              <KolamCopyStack
                containerStyle={styles.panelRowCopy}
                items={[
                  {
                    id: 'title',
                    text: item.speciesName || item.scientificName || '-',
                    style: styles.rowTitle,
                  },
                  {
                    id: 'meta',
                    text: item.scientificName,
                    style: styles.rowMeta,
                  },
                ]}
              />
              <Text style={styles.qtyText}>
                {item.quantity}{' '}
                {String('unitLabel' in item ? item.unitLabel : 'telur')}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.mutedText}>Belum ada telur produksi.</Text>
        )}
      </DetailSection>
      <EnclosureProductionOperation
        controller={controller}
        enclosure={enclosure}
      />
    </View>
  );
}

function KolamEnclosureDetailTasksTab({
  controller,
  onRouteChange,
}: {
  controller: KolamEnclosureController;
  onRouteChange?: (route: string) => void;
}) {
  const [createOpen, setCreateOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [taskTypeId, setTaskTypeId] = React.useState('');
  const filteredTypes = React.useMemo(
    () =>
      filterKolamEnclosureTaskTypesForCategoryBucket(
        controller.enclosureTaskTypes,
        'enclosure',
      ),
    [controller.enclosureTaskTypes],
  );
  const recurringRows = React.useMemo(
    () =>
      controller.enclosureRecurringEnrollments.filter(row =>
        filteredTypes.some(type => type.id === row.taskType.id),
      ),
    [controller.enclosureRecurringEnrollments, filteredTypes],
  );
  const taskTypeOptions = React.useMemo(
    () => [
      {label: '— Opsional —', value: ''},
      ...filteredTypes.map(type => ({label: type.name, value: type.id})),
    ],
    [filteredTypes],
  );

  const onCreate = async () => {
    try {
      await controller.onSpawnTask({
        title: title.trim() || undefined,
        taskTypeId: taskTypeId || undefined,
      });
      setCreateOpen(false);
      setTitle('');
      setTaskTypeId('');
    } catch {
      // Error surfaced via controller.error / status badge.
    }
  };

  return (
    <View style={styles.detailStatsStack}>
      <DetailSection title="Tugas terkait">
        <View style={styles.detailSectionIntroRow}>
          <Text style={styles.sectionMeta}>
            Task manual & sub-task dari enclosure ini
          </Text>
          <KolamButton
            label="Buat"
            onPress={() => setCreateOpen(current => !current)}
            style={styles.toolbarButton}
          />
        </View>
        {createOpen ? (
          <View style={styles.operationGrid}>
            <KolamFormTextField
              onChangeText={setTitle}
              placeholder="Judul (opsional)"
              style={styles.operationInput}
              value={title}
            />
            <KolamDropdownSelect
              label="Tipe task"
              menuPlacement="inline"
              onChange={setTaskTypeId}
              options={taskTypeOptions}
              style={styles.operationInput}
              value={taskTypeId}
            />
            <KolamButton
              disabled={controller.operationLoading}
              label="Simpan"
              onPress={() => void onCreate()}
              style={styles.toolbarButton}
            />
            <KolamButton
              label="Batal"
              onPress={() => {
                setCreateOpen(false);
                setTitle('');
                setTaskTypeId('');
              }}
              style={styles.toolbarButton}
            />
          </View>
        ) : null}
        {controller.enclosureTasksLoading ? (
          <Text style={styles.sectionMeta}>Memuat…</Text>
        ) : controller.enclosureTasks.length === 0 ? (
          <Text style={styles.sectionMeta}>Belum ada tugas.</Text>
        ) : (
          controller.enclosureTasks.map(task => (
            <View key={task.id} style={styles.detailMiniRow}>
              <KolamCopyStack
                containerStyle={styles.panelRowCopy}
                items={[
                  {
                    id: 'title',
                    text: task.title,
                    style: styles.rowTitle,
                  },
                ]}
              />
              <View style={styles.detailActions}>
                <KolamStatusBadge
                  intent={getKolamEnclosureTaskStatusIntent(task.status)}
                  label={formatKolamEnclosureTaskStatusLabel(task.status)}
                  textStyle={styles.badgeTextSm}
                />
                <KolamButton
                  label="Buka"
                  onPress={() => onRouteChange?.(`/task-manager/${task.id}`)}
                  style={styles.toolbarButton}
                />
              </View>
            </View>
          ))
        )}
        <KolamButton
          disabled={controller.enclosureTasksLoading}
          label="Muat ulang tugas"
          onPress={() => void controller.onRefreshTasks()}
          style={styles.toolbarButton}
        />
      </DetailSection>

      <DetailSection title="Jadwal berulang">
        <Text style={styles.sectionMeta}>
          Per tipe task · PIC dari enclosure
        </Text>
        {controller.enclosureRecurringLoading ? (
          <Text style={styles.sectionMeta}>Memuat…</Text>
        ) : recurringRows.length === 0 ? (
          <Text style={styles.sectionMeta}>Tidak ada tipe task enclosure.</Text>
        ) : (
          recurringRows.map(row => (
            <KolamToggleRow
              key={row.taskType.id}
              active={row.active}
              disabled={controller.operationLoading}
              label={row.taskType.name}
              onPress={() =>
                void controller
                  .onSetRecurringEnrollment({
                    taskTypeId: row.taskType.id,
                    active: !row.active,
                  })
                  .catch(() => undefined)
              }
            />
          ))
        )}
      </DetailSection>
    </View>
  );
}

function KolamEnclosureDetailStatisticsTab({
  controller,
  enclosure,
  onRouteChange,
}: {
  controller: KolamEnclosureController;
  enclosure: KolamEnclosure;
  onRouteChange?: (route: string) => void;
}) {
  const statistics = controller.enclosureStatistics;
  const deathQty = enclosure.speciesPopulationHistory
    .filter(item => item.eventType === 'death')
    .reduce((sum, item) => sum + Math.abs(item.delta), 0);
  const lostQty = enclosure.speciesPopulationHistory
    .filter(item => item.eventType === 'lost')
    .reduce((sum, item) => sum + Math.abs(item.delta), 0);
  const birthQty = countProductionBirthQty(enclosure);
  const summary = statistics?.summary;
  const stockRows = controller.enclosureStockTransactions;

  return (
    <View style={styles.detailStatsStack}>
      <DetailSection title="Ringkasan kondisi">
        <View style={styles.detailSectionIntroRow}>
          <Text style={styles.sectionMeta}>
            Perkiraan nilai dari harga jual species, bukan laba bersih setelah
            biaya.
          </Text>
          {summary ? (
            <KolamStatusBadge
              intent={getStatisticsHealthIntent(summary.healthTone)}
              label={summary.healthLabel}
              textStyle={styles.badgeTextSm}
            />
          ) : null}
        </View>
        <DetailEndpointState
          error={controller.enclosureStatisticsError}
          loading={controller.enclosureStatisticsLoading}
        />
        <View style={styles.summaryGrid}>
          <SummaryTile
            hint={formatKolamCurrency(summary?.deathValue ?? 0)}
            accent="warning"
            icon="!"
            label="Kematian"
            value={summary?.deathQty ?? deathQty}
          />
          <SummaryTile
            hint={formatKolamCurrency(summary?.lostValue ?? 0)}
            accent="warning"
            icon="L"
            label="Hilang"
            value={summary?.lostQty ?? lostQty}
          />
          <SummaryTile
            hint={formatKolamCurrency(summary?.saleRevenue ?? 0)}
            accent="primary"
            icon="J"
            label="Penjualan"
            value={summary?.saleQty ?? 0}
          />
          <SummaryTile
            hint={formatKolamCurrency(summary?.currentPopulationValue ?? 0)}
            icon="S"
            label="Populasi sekarang"
            value={summary?.currentPopulationQty ?? sumDetailSpeciesQty(enclosure)}
          />
          <SummaryTile
            hint={
              summary?.mortalityRate != null
                ? `Mortalitas ${summary.mortalityRate}%`
                : undefined
            }
            accent={
              (summary?.netBalance ?? 0) < 0 ? 'warning' : 'primary'
            }
            icon="N"
            label="Saldo jual-rugi"
            value={Math.round((summary?.netBalance ?? 0) / 1000)}
          />
          <SummaryTile
            accent="primary"
            icon="+"
            label="Kelahiran"
            value={birthQty}
          />
        </View>
      </DetailSection>

      {statistics?.livestockPurpose === 'production' ||
      enclosure.livestockPurpose === 'production' ? (
        <DetailSection title="Ringkasan produksi">
          <KolamEnclosureStatisticsProductionSummary
            enclosure={enclosure}
            statistics={statistics}
          />
        </DetailSection>
      ) : null}

      {statistics?.production ? (
        <DetailSection title="Log produksi">
          <ProductionEventList
            emptyLabel="Belum ada catatan produksi."
            rows={statistics.production.events.slice(0, 12)}
          />
        </DetailSection>
      ) : null}

      <View style={styles.detailTwoColumn}>
        <DetailSection title="Kematian">
          <StatisticsEventList
            emptyLabel="Belum ada catatan kematian."
            rows={statistics?.deaths ?? []}
          />
        </DetailSection>
        <DetailSection title="Hilang">
          <StatisticsEventList
            emptyLabel="Belum ada catatan hilang."
            rows={statistics?.lost ?? []}
          />
        </DetailSection>
      </View>

      <View style={styles.detailTwoColumn}>
        <DetailSection title="Penjualan">
          <StatisticsEventList
            emptyLabel="Belum ada penjualan dari kandang ini."
            rows={statistics?.sales ?? []}
            showInvoice
          />
        </DetailSection>
        <DetailSection title="Pergerakan stok">
          {controller.enclosureStockTransactionsLoading ? (
            <Text style={styles.sectionMeta}>Memuat…</Text>
          ) : controller.enclosureStockTransactionsError ? (
            <KolamStatusBadge
              intent="warning"
              label={controller.enclosureStockTransactionsError}
              numberOfLines={2}
              textStyle={styles.badgeTextSm}
            />
          ) : stockRows.length ? (
            <>
              {stockRows.map(row => (
                <View key={row.id} style={styles.detailMiniRow}>
                  <KolamCopyStack
                    containerStyle={styles.panelRowCopy}
                    items={[
                      {
                        id: 'title',
                        text: row.target?.label || '—',
                        style: styles.rowTitle,
                      },
                      {
                        id: 'meta',
                        text: [
                          formatDashboardDateTime(row.createdAt),
                          String(row.type || '').toUpperCase(),
                          row.reason || '',
                        ]
                          .filter(Boolean)
                          .join(' · '),
                        style: styles.rowMeta,
                      },
                    ]}
                  />
                  <View style={styles.detailActions}>
                    <Text
                      style={[
                        styles.qtyText,
                        row.quantity < 0 ? styles.warningText : null,
                      ]}
                    >
                      {row.quantity > 0 ? '+' : ''}
                      {row.quantity}
                    </Text>
                    <KolamButton
                      label="Lihat"
                      onPress={() =>
                        onRouteChange?.(`/stock-transaction/${row.id}`)
                      }
                      style={styles.toolbarButton}
                    />
                    {row.reference?.href ? (
                      <KolamButton
                        label="Invoice"
                        onPress={() => onRouteChange?.(row.reference!.href!)}
                        style={styles.toolbarButton}
                      />
                    ) : null}
                  </View>
                </View>
              ))}
              <KolamButton
                label="Lihat semua"
                onPress={() =>
                  onRouteChange?.(
                    `/stock-transaction?enclosureId=${encodeURIComponent(enclosure.id)}`,
                  )
                }
                style={styles.detailInlineButton}
              />
              <KolamButton
                disabled={controller.enclosureStockTransactionsLoading}
                label="Refresh stok"
                onPress={() => void controller.onRefreshStockTransactions()}
                style={styles.toolbarButton}
              />
            </>
          ) : (
            <Text style={styles.mutedText}>Belum ada transaksi.</Text>
          )}
        </DetailSection>
      </View>

      <DetailSection title="Parameter terbaca">
        <DetailParameterList enclosure={enclosure} />
      </DetailSection>
    </View>
  );
}

function KolamEnclosureStatisticsProductionSummary({
  enclosure,
  statistics,
}: {
  enclosure: KolamEnclosure;
  statistics: KolamEnclosureStatistics | null;
}) {
  const summary = statistics?.production?.summary;
  return (
    <View style={styles.summaryGrid}>
      <SummaryTile
        accent="primary"
        icon="+"
        label="Kelahiran indukan"
        value={summary?.indukanBirthQty ?? countProductionBirthQty(enclosure)}
      />
      <SummaryTile
        hint={
          summary
            ? `Tambah ${summary.eggAddedQty} / tetas ${summary.hatchQty}`
            : undefined
        }
        icon="T"
        label="Telur saat ini"
        value={summary?.currentEggQty ?? sumProductionEggQty(enclosure)}
      />
      <SummaryTile
        icon="A"
        label="Penempatan awal"
        value={summary?.placementQty ?? 0}
      />
      <SummaryTile
        icon="M"
        label="Pindah masuk"
        value={
          summary ? summary.transferInQty + summary.fromSaleableQty : 0
        }
      />
    </View>
  );
}

function DetailParameterList({
  enclosure,
  limit,
}: {
  enclosure: KolamEnclosure;
  limit?: number;
}) {
  const rows = limit ? enclosure.parameters.slice(0, limit) : enclosure.parameters;
  if (!rows.length) {
    return <Text style={styles.mutedText}>Belum ada parameter.</Text>;
  }
  return (
    <>
      {rows.map(item => (
        <View key={item.id || item.name} style={styles.detailMiniRow}>
          <Text numberOfLines={1} style={styles.cellText}>
            {item.name || '-'}
          </Text>
          <Text style={styles.qtyText}>
            {item.currentValue ?? '-'} {item.unitLabel}
          </Text>
        </View>
      ))}
    </>
  );
}

function EnclosureClimateParameters({
  controller,
  enclosure,
}: {
  controller: KolamEnclosureController;
  enclosure: KolamEnclosure;
}) {
  const isAquarium = enclosure.type === 'Aquarium';
  const title = isAquarium ? 'Parameter air' : 'Parameter iklim';
  const [unitByInitial, setUnitByInitial] = React.useState<
    Record<string, string>
  >({});

  React.useEffect(() => {
    let cancelled = false;
    void getKolamUnits()
      .then(units => {
        if (cancelled) {
          return;
        }
        const next: Record<string, string> = {};
        for (const unit of units) {
          if (unit.initial && !next[unit.initial]) {
            next[unit.initial] = unit.id;
          }
          if (unit.name && !next[unit.name]) {
            next[unit.name] = unit.id;
          }
        }
        setUnitByInitial(next);
      })
      .catch(() => {
        if (!cancelled) {
          setUnitByInitial({});
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (isAquarium && !enclosure.aquariumWaterType.trim()) {
    return (
      <DetailSection title={title}>
        <View style={styles.detailWarningBand}>
          <Text style={styles.warningText}>
            Sub-tipe air (tawar/laut) belum diset. Atur saat setup enclosure di
            form edit.
          </Text>
        </View>
      </DetailSection>
    );
  }

  if (
    !supportsKolamEnclosureClimateParameters(
      enclosure.type,
      enclosure.aquariumWaterType,
    )
  ) {
    return null;
  }

  const rows = React.useMemo(
    () =>
      mergeKolamEnclosureClimateRows(
        enclosure.type,
        enclosure.parameters,
        enclosure.aquariumWaterType,
      ),
    [enclosure.aquariumWaterType, enclosure.parameters, enclosure.type],
  );
  if (!rows.length) {
    return null;
  }

  return (
    <DetailSection title={title}>
      <Text style={styles.sectionMeta}>
        Perubahan disimpan otomatis — grafik riwayat dari setiap update nilai
      </Text>
      {rows.map(row => (
        <EnclosureClimateParameterCard
          key={row.parameterName}
          enclosureId={enclosure.id}
          onUpsert={controller.onUpsertClimateParameter}
          resolveUnitId={() =>
            row.server?.unitId ||
            unitByInitial[row.unitInitial] ||
            null
          }
          row={row}
        />
      ))}
    </DetailSection>
  );
}

function EnclosureClimateParameterCard({
  enclosureId,
  onUpsert,
  resolveUnitId,
  row,
}: {
  enclosureId: string;
  onUpsert: KolamEnclosureController['onUpsertClimateParameter'];
  resolveUnitId: () => string | null;
  row: KolamEnclosureClimateRow;
}) {
  const [draft, setDraft] = React.useState<KolamEnclosureClimateDraft>(() =>
    climateDraftFromRow(row),
  );
  const [saveState, setSaveState] = React.useState<
    'idle' | 'pending' | 'saving' | 'saved' | 'error'
  >('idle');
  const baselineRef = React.useRef(climateDraftFromRow(row));
  const savingRef = React.useRef(false);
  const draftRef = React.useRef(draft);
  const rowRef = React.useRef(row);
  const resolveUnitIdRef = React.useRef(resolveUnitId);
  const onUpsertRef = React.useRef(onUpsert);
  draftRef.current = draft;
  rowRef.current = row;
  resolveUnitIdRef.current = resolveUnitId;
  onUpsertRef.current = onUpsert;

  React.useEffect(() => {
    const fromServer = climateDraftFromRow(row);
    baselineRef.current = fromServer;
    setDraft(current =>
      climateDraftsEqual(current, fromServer) ? fromServer : current,
    );
    if (!savingRef.current) {
      setSaveState('idle');
    }
  }, [row]);

  React.useEffect(() => {
    if (climateDraftsEqual(draft, baselineRef.current)) {
      setSaveState(current => (current === 'pending' ? 'idle' : current));
      return;
    }
    setSaveState('pending');
    const timer = setTimeout(() => {
      void (async () => {
        const next = draftRef.current;
        const currentRow = rowRef.current;
        if (climateDraftsEqual(next, baselineRef.current)) {
          return;
        }
        if (next.min > next.max) {
          setSaveState('error');
          return;
        }
        savingRef.current = true;
        setSaveState('saving');
        try {
          await onUpsertRef.current({
            parameter_name: currentRow.parameterName,
            current_value: next.current,
            unit: resolveUnitIdRef.current(),
            alert_setting: {
              constant: next.constant,
              range: {min: next.min, max: next.max},
            },
          });
          baselineRef.current = {...next};
          setSaveState('saved');
        } catch {
          setSaveState('error');
        } finally {
          savingRef.current = false;
        }
      })();
    }, 800);
    return () => clearTimeout(timer);
  }, [draft, enclosureId]);

  React.useEffect(() => {
    if (saveState !== 'saved') {
      return;
    }
    const timer = setTimeout(() => setSaveState('idle'), 2400);
    return () => clearTimeout(timer);
  }, [saveState]);

  const chartValues = getKolamEnclosureParameterChartValues(row.server);
  const lastUpdated = getKolamEnclosureParameterLastUpdated(row.server);
  const statusText =
    saveState === 'pending'
      ? 'Menyimpan otomatis…'
      : saveState === 'saving'
        ? 'Menyimpan…'
        : saveState === 'saved'
          ? 'Tersimpan'
          : saveState === 'error'
            ? 'Gagal menyimpan — periksa nilai min/max'
            : null;

  const patch = (key: keyof KolamEnclosureClimateDraft, raw: string) => {
    const normalized = raw.trim().replace(',', '.');
    if (
      normalized === '' ||
      normalized === '-' ||
      normalized === '.' ||
      normalized === '-.'
    ) {
      return;
    }
    const value = Number(normalized);
    if (!Number.isFinite(value)) {
      return;
    }
    setDraft(current => ({...current, [key]: value}));
  };

  return (
    <View style={styles.climateCard}>
      <Text style={styles.rowTitle}>
        {row.parameterName}
        <Text style={styles.rowMeta}> ({row.unitInitial})</Text>
      </Text>
      <KolamFormTextField
        mode="numeric"
        onChangeText={value => patch('current', value)}
        placeholder="Nilai saat ini"
        style={styles.operationInput}
        value={String(draft.current)}
      />
      <Text style={styles.sectionMeta}>
        Update: {formatDashboardDateTime(lastUpdated) || '—'}
      </Text>
      {statusText ? <Text style={styles.sectionMeta}>{statusText}</Text> : null}
      {chartValues.length ? (
        <KolamDashboardMetricSparkline tone="success" values={chartValues} />
      ) : (
        <Text style={styles.mutedText}>Belum ada riwayat</Text>
      )}
      <View style={styles.operationGrid}>
        <KolamFormTextField
          mode="numeric"
          onChangeText={value => patch('constant', value)}
          placeholder="Target"
          style={styles.operationInput}
          value={String(draft.constant)}
        />
        <KolamFormTextField
          mode="numeric"
          onChangeText={value => patch('min', value)}
          placeholder="Min"
          style={styles.operationInput}
          value={String(draft.min)}
        />
        <KolamFormTextField
          mode="numeric"
          onChangeText={value => patch('max', value)}
          placeholder="Max"
          style={styles.operationInput}
          value={String(draft.max)}
        />
      </View>
    </View>
  );
}

function EnclosureProvisioningOperation({
  controller,
}: {
  controller: KolamEnclosureController;
}) {
  const [code, setCode] = React.useState('');
  return (
    <DetailSection title="Provisioning kode">
      <View style={styles.detailWarningBand}>
        <Text style={styles.warningText}>
          Enclosure belum punya kode. Simpan kode agar bisa dilacak dan dicetak
          barcode.
        </Text>
      </View>
      <View style={styles.operationGrid}>
        <KolamFormTextField
          autoCapitalize="characters"
          onChangeText={value => setCode(value.toUpperCase())}
          placeholder="ENC-AQUA-01"
          style={styles.operationInput}
          value={code}
        />
        <KolamButton
          disabled={controller.operationLoading || !code.trim()}
          label="Simpan kode"
          onPress={() => void controller.onProvisionCode(code)}
          style={styles.toolbarButton}
        />
      </View>
    </DetailSection>
  );
}

function EnclosureMediaOperation({
  controller,
  enclosure,
}: {
  controller: KolamEnclosureController;
  enclosure: KolamEnclosure;
}) {
  const [coverUri, setCoverUri] = React.useState('');
  const [photoUri, setPhotoUri] = React.useState('');
  const [deleteIndex, setDeleteIndex] = React.useState('');
  const pickImage = React.useCallback(async (setter: (uri: string) => void) => {
    const picked = await pickNativeImageFile();
    if (!picked.cancelled && picked.uri) {
      setter(picked.uri);
    }
  }, []);
  return (
    <DetailSection title="Foto & cover">
      <View style={styles.operationGrid}>
        <KolamFormTextField
          onChangeText={setCoverUri}
          placeholder="URI cover lokal"
          style={styles.operationInput}
          value={coverUri}
        />
        <KolamButton
          label="Pilih cover"
          onPress={() => void pickImage(setCoverUri)}
          style={styles.toolbarButton}
        />
        <KolamButton
          disabled={controller.operationLoading || !coverUri.trim()}
          label="Upload cover"
          onPress={() => controller.onUploadCoverPhoto(coverUri.trim())}
          style={styles.toolbarButton}
        />
        <KolamButton
          disabled={controller.operationLoading || !enclosure.coverPhotoUrl}
          label="Hapus cover"
          onPress={() => void controller.onDeleteCoverPhoto()}
          style={styles.toolbarButton}
        />
      </View>
      <View style={styles.operationGrid}>
        <KolamFormTextField
          onChangeText={setPhotoUri}
          placeholder="URI foto lokal"
          style={styles.operationInput}
          value={photoUri}
        />
        <KolamButton
          label="Pilih foto"
          onPress={() => void pickImage(setPhotoUri)}
          style={styles.toolbarButton}
        />
        <KolamButton
          disabled={controller.operationLoading || !photoUri.trim()}
          label="Upload foto"
          onPress={() => controller.onUploadPhotos([photoUri.trim()])}
          style={styles.toolbarButton}
        />
      </View>
      <View style={styles.operationGrid}>
        <KolamFormTextField
          mode="numeric"
          onChangeText={setDeleteIndex}
          placeholder="Index foto"
          style={styles.operationInput}
          value={deleteIndex}
        />
        <KolamButton
          disabled={controller.operationLoading || !deleteIndex.trim()}
          label="Hapus foto"
          onPress={() =>
            controller.onDeletePhoto(Math.max(0, Number(deleteIndex) || 0))
          }
          style={styles.toolbarButton}
        />
      </View>
    </DetailSection>
  );
}

function EnclosureSaleListingOperation({
  controller,
  enclosure,
}: {
  controller: KolamEnclosureController;
  enclosure: KolamEnclosure;
}) {
  const status = enclosure.saleStatus || 'not_for_sale';
  const eligibility = canKolamEnclosureBeListed(enclosure);
  const [price, setPrice] = React.useState(
    enclosure.salePrice && enclosure.salePrice > 0
      ? String(enclosure.salePrice)
      : '',
  );
  React.useEffect(() => {
    setPrice(
      enclosure.salePrice && enclosure.salePrice > 0
        ? String(enclosure.salePrice)
        : '',
    );
  }, [enclosure.salePrice]);

  const showListForm = status === 'not_for_sale' && eligibility.ok;
  const showClear = status === 'for_sale';
  const reservedPaid =
    enclosure.saleReservedInvoiceStatus === 'paid' ||
    enclosure.saleReservedInvoiceStatus === 'partial_paid';

  return (
    <DetailSection title="Jual unit kandang">
      <View style={styles.detailSectionIntroRow}>
        <Text style={styles.sectionMeta}>
          Jual kandang fisik (bukan livestock) lewat invoice tipe Kandang. Qty
          selalu 1.
        </Text>
        <KolamStatusBadge
          intent={getSaleStatusIntent(status)}
          label={getSaleStatusLabel(status)}
          textStyle={styles.badgeTextSm}
        />
      </View>
      {enclosure.salePrice != null && enclosure.salePrice > 0 ? (
        <Text style={styles.sectionMeta}>
          Harga listing: {formatKolamCurrency(enclosure.salePrice)}
        </Text>
      ) : null}
      {status === 'sold' && enclosure.soldAt ? (
        <Text style={styles.sectionMeta}>
          Terjual {formatDashboardDateTime(enclosure.soldAt)}
        </Text>
      ) : null}
      {status === 'reserved' ? (
        <View style={styles.detailWarningBand}>
          <Text style={styles.warningText}>
            {reservedPaid
              ? 'Invoice sudah lunas — kandang seharusnya terjual. Muat ulang halaman; jika masih muncul, hubungi admin (repair reservasi stale).'
              : 'Kandang ini ada di draft/pending invoice. Batalkan invoice atau hapus baris kandang untuk melepas reservasi.'}
          </Text>
          {enclosure.saleReservedInvoiceCode ? (
            <Text style={styles.sectionMeta}>
              Invoice: {enclosure.saleReservedInvoiceCode}
              {enclosure.saleReservedInvoiceStatus
                ? ` (${enclosure.saleReservedInvoiceStatus})`
                : ''}
            </Text>
          ) : null}
        </View>
      ) : null}
      {!eligibility.ok && status !== 'sold' && status !== 'reserved' ? (
        <View style={[styles.detailWarningBand, styles.detailDangerBand]}>
          <Text style={styles.dangerText}>{eligibility.reason}</Text>
        </View>
      ) : null}
      {showListForm ? (
        <View style={styles.operationGrid}>
          <KolamFormTextField
            mode="numeric"
            onChangeText={setPrice}
            placeholder="Harga jual (Rp)"
            style={styles.operationInput}
            value={price}
          />
          <KolamButton
            disabled={
              controller.operationLoading ||
              !(Number(price) > 0)
            }
            label="Tandai for_sale"
            onPress={() =>
              controller.onUpdateSaleListing({
                action: 'list',
                salePrice: Math.max(0, Number(price) || 0),
              })
            }
            style={styles.toolbarButton}
          />
        </View>
      ) : null}
      {showClear ? (
        <KolamButton
          disabled={controller.operationLoading}
          label="Batalkan listing"
          onPress={() => controller.onUpdateSaleListing({action: 'clear'})}
          style={styles.toolbarButton}
        />
      ) : null}
      {status === 'sold' ? (
        <Text style={styles.sectionMeta}>
          Kandang nonaktif operasional setelah lunas.
        </Text>
      ) : null}
    </DetailSection>
  );
}

function EnclosureCommentsOperation({
  controller,
}: {
  controller: KolamEnclosureController;
}) {
  const [comment, setComment] = React.useState('');
  const comments = controller.enclosureComments ?? [];
  return (
    <DetailSection title="Komentar">
      <View style={styles.operationGrid}>
        <KolamFormTextField
          multiline
          onChangeText={setComment}
          placeholder="Komentar baru"
          style={[styles.operationInput, styles.operationInputMultiline]}
          value={comment}
        />
        <KolamButton
          disabled={controller.operationLoading || !comment.trim()}
          label="Kirim"
          onPress={() =>
            controller.onCreateComment(comment.trim()).then(() => setComment(''))
          }
          style={styles.toolbarButton}
        />
        <KolamButton
          disabled={controller.operationLoading}
          label="Muat ulang"
          onPress={() => void controller.onRefreshComments()}
          style={styles.toolbarButton}
        />
      </View>
      {comments.length ? (
        comments.slice(0, 5).map(item => (
          <View key={item.id} style={styles.detailMiniRow}>
            <KolamCopyStack
              containerStyle={styles.panelRowCopy}
              items={[
                {
                  id: 'title',
                  text: item.user?.displayName || item.customer?.name || 'Komentar',
                  style: styles.rowTitle,
                },
                {
                  id: 'meta',
                  text: [
                    formatDashboardDateTime(item.createdAt),
                    `${item.totalLikes} suka`,
                  ].join(' / '),
                  style: styles.rowMeta,
                },
                {id: 'body', text: stripHtmlText(item.comment), style: styles.cellText},
              ]}
            />
            <View style={styles.detailActions}>
              <KolamButton
                disabled={controller.operationLoading}
                label="Like"
                onPress={() => controller.onLikeComment(item.id)}
                style={styles.toolbarButton}
              />
              <KolamButton
                disabled={controller.operationLoading || !item.isMyOwn}
                label="Hapus"
                onPress={() => controller.onDeleteComment(item.id)}
                style={styles.toolbarButton}
              />
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.mutedText}>Belum ada komentar.</Text>
      )}
    </DetailSection>
  );
}

function EnclosureSpeciesOperation({
  controller,
  enclosure,
}: {
  controller: KolamEnclosureController;
  enclosure: KolamEnclosure;
}) {
  const [speciesCatalog, setSpeciesCatalog] = React.useState<KolamSpecies[]>(
    [],
  );
  const [transferTargets, setTransferTargets] = React.useState<
    Array<{id: string; label: string}>
  >([]);
  const [crossPoolTargets, setCrossPoolTargets] = React.useState<
    Array<{id: string; label: string}>
  >([]);
  const [speciesId, setSpeciesId] = React.useState('');
  const [variantId, setVariantId] = React.useState('');
  const [lineKey, setLineKey] = React.useState('');
  const [qty, setQty] = React.useState('1');
  const [reason, setReason] = React.useState('');
  const [eventType, setEventType] = React.useState('death');
  const [delta, setDelta] = React.useState('-1');
  const [targetEnclosureId, setTargetEnclosureId] = React.useState('');
  const [toVariantId, setToVariantId] = React.useState('');
  const [eventPhotoUri, setEventPhotoUri] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    void getKolamSpeciesList({limit: 500, page: 1, view: ''})
      .then(result => {
        if (!cancelled) {
          setSpeciesCatalog(result.data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSpeciesCatalog([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    const samePurpose = enclosure.livestockPurpose;
    const oppositePurpose =
      samePurpose === 'production' ? 'saleable' : 'production';
    void Promise.all([
      getKolamEnclosures({
        enclosureType: 'all',
        limit: 200,
        livestockPurpose: samePurpose,
        page: 1,
        scope: 'internal',
        search: '',
      }),
      getKolamEnclosures({
        enclosureType: 'all',
        limit: 200,
        livestockPurpose: oppositePurpose,
        page: 1,
        scope: 'internal',
        search: '',
      }),
    ])
      .then(([same, opposite]) => {
        if (cancelled) {
          return;
        }
        setTransferTargets(
          same.data
            .filter(item => item.id !== enclosure.id)
            .map(item => ({
              id: item.id,
              label: `${item.code || item.id} · ${item.name || '-'}`,
            })),
        );
        setCrossPoolTargets(
          opposite.data
            .filter(item => item.id !== enclosure.id)
            .map(item => ({
              id: item.id,
              label: `${item.code || item.id} · ${item.name || '-'}`,
            })),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setTransferTargets([]);
          setCrossPoolTargets([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [enclosure.id, enclosure.livestockPurpose]);

  const selectedSpecies =
    speciesCatalog.find(item => item.id === speciesId) ?? null;
  const variantOptions = React.useMemo(
    () => [
      {label: '— Tanpa variant —', value: ''},
      ...(selectedSpecies?.variants ?? []).map(variant => ({
        label: variant.label || variant.sku || variant.id,
        value: variant.id,
      })),
    ],
    [selectedSpecies],
  );
  const lineOptions = React.useMemo(
    () => [
      {label: '— Pilih line —', value: ''},
      ...enclosure.species.map(item => ({
        label: `${item.speciesName || item.scientificName || item.speciesId}${
          item.variantLabel ? ` / ${item.variantLabel}` : ''
        } (${item.quantity})`,
        value: `${item.speciesId}:${item.variantId}`,
      })),
    ],
    [enclosure.species],
  );
  const upgradeTargets = React.useMemo(() => {
    if (!selectedSpecies || !variantId) {
      return [];
    }
    return getKolamSpeciesSizeUpgradeTargets(selectedSpecies, variantId);
  }, [selectedSpecies, variantId]);

  React.useEffect(() => {
    if (!lineKey) {
      return;
    }
    const [nextSpeciesId = '', nextVariantId = ''] = lineKey.split(':');
    setSpeciesId(nextSpeciesId);
    setVariantId(nextVariantId);
  }, [lineKey]);

  React.useEffect(() => {
    if (
      toVariantId &&
      !upgradeTargets.some(item => item.variantId === toVariantId)
    ) {
      setToVariantId(upgradeTargets[0]?.variantId ?? '');
    }
  }, [toVariantId, upgradeTargets]);

  const speciesOptions = React.useMemo(
    () => [
      {label: '— Pilih species —', value: ''},
      ...speciesCatalog.map(item => ({
        label: item.displayName || item.scientificName || item.id,
        value: item.id,
      })),
    ],
    [speciesCatalog],
  );
  const transferOptions = React.useMemo(
    () => [
      {label: '— Target transfer —', value: ''},
      ...transferTargets.map(item => ({label: item.label, value: item.id})),
    ],
    [transferTargets],
  );
  const crossPoolOptions = React.useMemo(
    () => [
      {label: '— Target cross-pool —', value: ''},
      ...crossPoolTargets.map(item => ({label: item.label, value: item.id})),
    ],
    [crossPoolTargets],
  );
  const eventTypeOptions = [
    {label: 'Kematian', value: 'death'},
    {label: 'Hilang', value: 'lost'},
    {label: 'Transfer keluar', value: 'transfer'},
    {label: 'Cross-pool', value: 'cross-pool'},
    {label: 'Adopsi', value: 'adoption'},
    {label: 'Kelahiran', value: 'birth'},
  ];
  const upgradeOptions = React.useMemo(
    () => [
      {label: '— Target ukuran —', value: ''},
      ...upgradeTargets.map(item => ({
        label: item.label,
        value: item.variantId,
      })),
    ],
    [upgradeTargets],
  );

  const baseInput = {
    enclosureId: enclosure.id,
    quantity: Math.max(1, Number(qty) || 1),
    reason: reason.trim() || undefined,
    speciesId: speciesId.trim(),
    variantId: variantId.trim() || null,
  };

  return (
    <DetailSection title="Operasional species">
      <KolamDropdownSelect
        label="Katalog spesies"
        menuPlacement="inline"
        onChange={value => {
          setSpeciesId(value);
          setVariantId('');
          setLineKey('');
          setToVariantId('');
        }}
        options={speciesOptions}
        searchable
        style={styles.operationInput}
        value={speciesId}
      />
      <KolamDropdownSelect
        label="Variant"
        menuPlacement="inline"
        onChange={setVariantId}
        options={variantOptions}
        style={styles.operationInput}
        value={variantId}
      />
      <View style={styles.operationGrid}>
        <KolamFormTextField
          mode="numeric"
          onChangeText={setQty}
          placeholder="Qty"
          style={styles.operationInputSmall}
          value={qty}
        />
        <KolamFormTextField
          onChangeText={setReason}
          placeholder="Alasan / catatan"
          style={styles.operationInput}
          value={reason}
        />
        <KolamButton
          disabled={controller.operationLoading || !speciesId.trim()}
          label="Attach"
          onPress={() => controller.onAttachSpecies(baseInput)}
          style={styles.toolbarButton}
        />
      </View>

      <Text style={styles.sectionMeta}>Event populasi</Text>
      <KolamDropdownSelect
        label="Line di enclosure"
        menuPlacement="inline"
        onChange={setLineKey}
        options={lineOptions}
        style={styles.operationInput}
        value={lineKey}
      />
      <View style={styles.operationGrid}>
        <KolamDropdownSelect
          label="Tipe event"
          menuPlacement="inline"
          onChange={value => {
            setEventType(value);
            setDelta(value === 'birth' ? '1' : '-1');
          }}
          options={eventTypeOptions}
          style={styles.operationInput}
          value={eventType}
        />
        <KolamFormTextField
          mode="numeric"
          onChangeText={setDelta}
          placeholder="Delta"
          style={styles.operationInputSmall}
          value={delta}
        />
        <KolamFormTextField
          onChangeText={setEventPhotoUri}
          placeholder="Foto event URI opsional"
          style={styles.operationInput}
          value={eventPhotoUri}
        />
        <KolamButton
          label="Pilih foto"
          onPress={() =>
            void pickNativeImageFile().then(picked => {
              if (!picked.cancelled && picked.uri) {
                setEventPhotoUri(picked.uri);
              }
            })
          }
          style={styles.toolbarButton}
        />
        <KolamButton
          disabled={
            controller.operationLoading ||
            !speciesId.trim() ||
            (eventType === 'death' && !eventPhotoUri.trim())
          }
          label="Catat event"
          onPress={() =>
            controller.onRecordPopulationEvent({
              enclosureId: enclosure.id,
              speciesId: speciesId.trim(),
              variantId: variantId.trim() || null,
              delta: Number(delta) || 0,
              eventType: eventType.trim() || null,
              reason: reason.trim() || undefined,
              photoUris: eventPhotoUri.trim() ? [eventPhotoUri.trim()] : [],
            })
          }
          style={styles.toolbarButton}
        />
      </View>

      <Text style={styles.sectionMeta}>Transfer / cross-pool</Text>
      <KolamDropdownSelect
        label="Target transfer (same purpose)"
        menuPlacement="inline"
        onChange={setTargetEnclosureId}
        options={transferOptions}
        searchable
        style={styles.operationInput}
        value={
          transferTargets.some(item => item.id === targetEnclosureId)
            ? targetEnclosureId
            : ''
        }
      />
      <View style={styles.operationGrid}>
        <KolamButton
          disabled={
            controller.operationLoading ||
            !speciesId.trim() ||
            !targetEnclosureId.trim() ||
            !transferTargets.some(item => item.id === targetEnclosureId)
          }
          label="Transfer"
          onPress={() =>
            controller.onTransferSpecies({
              ...baseInput,
              targetEnclosureId: targetEnclosureId.trim(),
            })
          }
          style={styles.toolbarButton}
        />
      </View>
      <KolamDropdownSelect
        label="Target cross-pool"
        menuPlacement="inline"
        onChange={setTargetEnclosureId}
        options={crossPoolOptions}
        searchable
        style={styles.operationInput}
        value={
          crossPoolTargets.some(item => item.id === targetEnclosureId)
            ? targetEnclosureId
            : ''
        }
      />
      <KolamButton
        disabled={
          controller.operationLoading ||
          !speciesId.trim() ||
          !targetEnclosureId.trim() ||
          !crossPoolTargets.some(item => item.id === targetEnclosureId)
        }
        label="Cross pool"
        onPress={() =>
          controller.onCrossPoolTransferSpecies({
            ...baseInput,
            direction:
              enclosure.livestockPurpose === 'production'
                ? 'release_to_sale'
                : 'take_to_production',
            targetEnclosureId: targetEnclosureId.trim(),
          })
        }
        style={styles.toolbarButton}
      />

      <Text style={styles.sectionMeta}>Naik ukuran variant</Text>
      {upgradeTargets.length ? (
        <View style={styles.operationGrid}>
          <KolamDropdownSelect
            label="Ke ukuran"
            menuPlacement="inline"
            onChange={setToVariantId}
            options={upgradeOptions}
            style={styles.operationInput}
            value={toVariantId}
          />
          <KolamButton
            disabled={
              controller.operationLoading ||
              !speciesId.trim() ||
              !variantId.trim() ||
              !toVariantId.trim()
            }
            label="Switch variant"
            onPress={() =>
              controller.onSwitchSpeciesVariant({
                enclosureId: enclosure.id,
                speciesId: speciesId.trim(),
                fromVariantId: variantId.trim(),
                toVariantId: toVariantId.trim(),
                quantity: Math.max(1, Number(qty) || 1),
                reason: reason.trim() || undefined,
              })
            }
            style={styles.toolbarButton}
          />
        </View>
      ) : (
        <Text style={styles.mutedText}>Tidak bisa naik ukuran.</Text>
      )}
    </DetailSection>
  );
}

function EnclosureProductionOperation({
  controller,
  enclosure,
}: {
  controller: KolamEnclosureController;
  enclosure: KolamEnclosure;
}) {
  const [speciesCatalog, setSpeciesCatalog] = React.useState<KolamSpecies[]>(
    [],
  );
  const [speciesId, setSpeciesId] = React.useState('');
  const [qty, setQty] = React.useState('1');
  const [reason, setReason] = React.useState('');
  const [taxonomyBySpecies, setTaxonomyBySpecies] = React.useState<
    Record<string, KolamSpeciesTaxonomyProduction | null>
  >({});
  const parsedQty = Math.max(1, Number(qty) || 1);

  React.useEffect(() => {
    let cancelled = false;
    void getKolamSpeciesList({limit: 500, page: 1, view: ''})
      .then(result => {
        if (!cancelled) {
          setSpeciesCatalog(result.data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSpeciesCatalog([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    const ids = Array.from(
      new Set(
        [
          ...enclosure.species.map(item => item.speciesId),
          ...enclosure.productionEggs.map(item => item.speciesId),
          speciesId,
        ].filter(Boolean),
      ),
    ).sort();
    if (!ids.length) {
      return;
    }
    let cancelled = false;
    void Promise.all(
      ids.map(async id => {
        try {
          const taxonomy = await getKolamSpeciesTaxonomyProduction(id);
          return {id, taxonomy};
        } catch {
          return {id, taxonomy: null as KolamSpeciesTaxonomyProduction | null};
        }
      }),
    ).then(results => {
      if (cancelled) {
        return;
      }
      setTaxonomyBySpecies(current => {
        const next = {...current};
        for (const row of results) {
          next[row.id] = row.taxonomy;
        }
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [
    enclosure.productionEggs,
    enclosure.species,
    speciesId,
  ]);

  const speciesOptions = React.useMemo(
    () => [
      {label: '— Pilih species —', value: ''},
      ...speciesCatalog.map(item => ({
        label: item.displayName || item.scientificName || item.id,
        value: item.id,
      })),
    ],
    [speciesCatalog],
  );
  const eggTaxonomy = speciesId ? taxonomyBySpecies[speciesId] : null;
  const canAddEggs = Boolean(eggTaxonomy?.profile || eggTaxonomy?.ready);

  return (
    <DetailSection title="Operasional produksi">
      <KolamDropdownSelect
        label="Spesies telur"
        menuPlacement="inline"
        onChange={setSpeciesId}
        options={speciesOptions}
        searchable
        style={styles.operationInput}
        value={speciesId}
      />
      <View style={styles.operationGrid}>
        <KolamFormTextField
          mode="numeric"
          onChangeText={setQty}
          placeholder="Qty"
          style={styles.operationInputSmall}
          value={qty}
        />
        <KolamFormTextField
          onChangeText={setReason}
          placeholder="Alasan / catatan"
          style={styles.operationInput}
          value={reason}
        />
        <KolamButton
          disabled={
            controller.operationLoading || !speciesId.trim() || !canAddEggs
          }
          label="Tambah telur"
          onPress={() =>
            controller.onAddProductionEggs({
              enclosureId: enclosure.id,
              speciesId: speciesId.trim(),
              quantity: parsedQty,
              reason: reason.trim() || undefined,
            })
          }
          style={styles.toolbarButton}
        />
        <KolamButton
          disabled={controller.operationLoading || !speciesId.trim()}
          label="Advance telur → kecebong"
          onPress={() =>
            controller.onAdvanceProductionEggs({
              enclosureId: enclosure.id,
              speciesId: speciesId.trim(),
              quantity: parsedQty,
              toStageKey: 'kecebong',
              reason: reason.trim() || undefined,
            })
          }
          style={styles.toolbarButton}
        />
      </View>
      {speciesId && !canAddEggs ? (
        <Text style={styles.mutedText}>
          Species belum punya profil taxonomy produksi.
        </Text>
      ) : null}

      {enclosure.productionEggs.length ? (
        <>
          <Text style={styles.sectionMeta}>Stok telur</Text>
          {enclosure.productionEggs.map(egg => (
            <View
              key={`${egg.speciesId}:${egg.scientificName}`}
              style={styles.detailMiniRow}
            >
              <KolamCopyStack
                containerStyle={styles.panelRowCopy}
                items={[
                  {
                    id: 'title',
                    text: egg.speciesName || egg.scientificName || egg.speciesId,
                    style: styles.rowTitle,
                  },
                  {
                    id: 'meta',
                    text: `${egg.quantity} ${egg.unitLabel}`,
                    style: styles.rowMeta,
                  },
                ]}
              />
              <KolamButton
                disabled={controller.operationLoading || egg.quantity <= 0}
                label="Advance"
                onPress={() =>
                  controller.onAdvanceProductionEggs({
                    enclosureId: enclosure.id,
                    speciesId: egg.speciesId,
                    quantity: Math.min(parsedQty, Math.max(1, egg.quantity)),
                    toStageKey: 'kecebong',
                    reason: reason.trim() || undefined,
                  })
                }
                style={styles.toolbarButton}
              />
            </View>
          ))}
        </>
      ) : null}

      {enclosure.species.length ? (
        <>
          <Text style={styles.sectionMeta}>Fase variant</Text>
          {enclosure.species.map(line => {
            const taxonomy = taxonomyBySpecies[line.speciesId];
            const advance = resolveKolamProductionAdvanceTarget(
              taxonomy,
              line.variantId,
            );
            const canSale = canKolamProductionSaleBranch(
              taxonomy,
              line.variantId,
            );
            const saleStageKey = getKolamProductionSaleStageKey(
              taxonomy,
              line.variantId,
            );
            return (
              <View
                key={`${line.speciesId}:${line.variantId}`}
                style={styles.climateCard}
              >
                <Text style={styles.rowTitle}>
                  {line.speciesName || line.scientificName}
                  {line.variantLabel ? ` / ${line.variantLabel}` : ''}
                </Text>
                <Text style={styles.sectionMeta}>
                  Qty {line.quantity} {line.unitLabel}
                  {advance
                    ? ` · next: ${advance.toLabel}`
                    : ' · tanpa advance'}
                </Text>
                <View style={styles.operationGrid}>
                  <KolamButton
                    disabled={
                      controller.operationLoading ||
                      !advance ||
                      line.quantity <= 0
                    }
                    label={
                      advance ? `Advance → ${advance.toLabel}` : 'Advance'
                    }
                    onPress={() =>
                      advance
                        ? controller.onChangeProductionPhase({
                            enclosureId: enclosure.id,
                            speciesId: line.speciesId,
                            fromStageKey: advance.fromStageKey,
                            toStageKey: advance.toStageKey,
                            quantity: Math.min(
                              parsedQty,
                              Math.max(1, line.quantity),
                            ),
                            reason: reason.trim() || undefined,
                          })
                        : undefined
                    }
                    style={styles.toolbarButton}
                  />
                  {canSale ? (
                    <KolamButton
                      disabled={
                        controller.operationLoading ||
                        !saleStageKey ||
                        line.quantity <= 0
                      }
                      label="Ke stok jual"
                      onPress={() =>
                        controller.onMoveProductionPhaseToSale({
                          enclosureId: enclosure.id,
                          speciesId: line.speciesId,
                          stageKey: saleStageKey,
                          quantity: Math.min(
                            parsedQty,
                            Math.max(1, line.quantity),
                          ),
                          reason: reason.trim() || undefined,
                        })
                      }
                      style={styles.toolbarButton}
                    />
                  ) : null}
                </View>
              </View>
            );
          })}
        </>
      ) : null}
    </DetailSection>
  );
}

function DetailEndpointState({
  error,
  loading,
}: {
  error: string | null;
  loading: boolean;
}) {
  if (loading) {
    return <Text style={styles.sectionMeta}>Memuat statistik detail...</Text>;
  }
  if (error) {
    return (
      <KolamStatusBadge
        intent="warning"
        label={`Statistik endpoint belum tersedia: ${error}`}
        numberOfLines={2}
        textStyle={styles.badgeTextSm}
      />
    );
  }
  return null;
}

function StatisticsEventList({
  emptyLabel,
  rows,
  showInvoice,
}: {
  emptyLabel: string;
  rows: KolamEnclosureStatisticsEvent[];
  showInvoice?: boolean;
}) {
  if (!rows.length) {
    return <Text style={styles.mutedText}>{emptyLabel}</Text>;
  }
  return (
    <>
      {rows.slice(0, 8).map((row, index) => (
        <View key={row.id || `${row.createdAt}:${index}`} style={styles.detailMiniRow}>
          <KolamCopyStack
            containerStyle={styles.panelRowCopy}
            items={[
              {
                id: 'title',
                text: row.scientificName || row.speciesName || '-',
                style: styles.rowTitle,
              },
              {
                id: 'meta',
                text: [
                  formatDashboardDateTime(row.createdAt),
                  row.variantLabel,
                  showInvoice ? row.invoiceCode : '',
                  row.reason,
                ]
                  .filter(Boolean)
                  .join(' / '),
                style: styles.rowMeta,
              },
            ]}
          />
          <KolamCopyStack
            containerStyle={styles.detailValueStack}
            items={[
              {
                id: 'qty',
                text: `${row.quantity} ekor`,
                style: styles.qtyText,
              },
              {
                id: 'value',
                text: formatKolamCurrency(row.totalValue),
                style: styles.rowMeta,
              },
            ]}
          />
        </View>
      ))}
    </>
  );
}

function ProductionEventList({
  emptyLabel,
  rows,
}: {
  emptyLabel: string;
  rows: KolamEnclosureProductionEvent[];
}) {
  if (!rows.length) {
    return <Text style={styles.mutedText}>{emptyLabel}</Text>;
  }
  return (
    <>
      {rows.map((row, index) => (
        <View key={row.id || `${row.createdAt}:${index}`} style={styles.detailMiniRow}>
          <KolamCopyStack
            containerStyle={styles.panelRowCopy}
            items={[
              {
                id: 'title',
                text: row.categoryLabel || row.category || 'Produksi',
                style: styles.rowTitle,
              },
              {
                id: 'meta',
                text: [
                  formatDashboardDateTime(row.createdAt),
                  row.scientificName || row.speciesName,
                  row.variantLabel,
                  row.reason,
                ]
                  .filter(Boolean)
                  .join(' / '),
                style: styles.rowMeta,
              },
            ]}
          />
          <Text style={styles.qtyText}>{row.quantity} ekor</Text>
        </View>
      ))}
    </>
  );
}

function DetailSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <View style={styles.detailSection}>
      <View style={styles.detailSectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.detailSectionBody}>{children}</View>
    </View>
  );
}

function DetailField({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.detailField}>
      <Text style={styles.detailFieldLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.detailFieldValue}>
        {value}
      </Text>
    </View>
  );
}

function KolamEnclosureList({
  controller,
  onRouteChange,
}: {
  controller: KolamEnclosureController;
  onRouteChange?: (route: string) => void;
}) {
  const [searchInput, setSearchInput] = React.useState(
    controller.filters.search,
  );
  const [activeFilterPanel, setActiveFilterPanel] =
    React.useState<EnclosureFilterPanel>(null);
  const [panelAnchor, setPanelAnchor] = React.useState({left: 0, top: 48});
  const toolbarRef = React.useRef<View>(null);
  const typeTriggerRef = React.useRef<View>(null);
  const livestockTriggerRef = React.useRef<View>(null);

  React.useEffect(() => {
    setSearchInput(controller.filters.search);
  }, [controller.filters.search]);

  React.useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput !== controller.filters.search) {
        controller.onSearchChange(searchInput);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [controller, searchInput]);

  const listTabActive =
    controller.activeTab === 'internal' ||
    controller.activeTab === 'client_linked';
  const filtersAppliedCount = [
    controller.filters.search,
    controller.filters.enclosureType !== 'all'
      ? controller.filters.enclosureType
      : '',
    controller.filters.livestockPurpose !== 'all'
      ? controller.filters.livestockPurpose
      : '',
  ].filter(Boolean).length;
  const typeFilterLabel =
    controller.filters.enclosureType === 'all'
      ? 'Tipe'
      : controller.filters.enclosureType;
  const livestockFilterLabel =
    controller.filters.livestockPurpose === 'all'
      ? 'Livestock'
      : getLivestockPurposeLabel(controller.filters.livestockPurpose);

  const anchorFilterPanel = React.useCallback((panel: EnclosureFilterPanel) => {
    if (!panel) {
      return;
    }
    const triggerRef =
      panel === 'type' ? typeTriggerRef : livestockTriggerRef;
    const toolbar = toolbarRef.current;
    const trigger = triggerRef.current;
    if (!toolbar || !trigger) {
      return;
    }
    toolbar.measureInWindow((toolbarX, toolbarY, toolbarWidth) => {
      trigger.measureInWindow((x, y, _width, height) => {
        const maxLeft = Math.max(
          0,
          toolbarWidth - ENCLOSURE_FILTER_PANEL_WIDTH,
        );
        const preferredLeft = x - toolbarX;
        setPanelAnchor({
          left: Math.min(Math.max(0, preferredLeft), maxLeft),
          top: y - toolbarY + height + 4,
        });
      });
    });
  }, []);

  const toggleFilterPanel = React.useCallback(
    (panel: Exclude<EnclosureFilterPanel, null>) => {
      setActiveFilterPanel(current => {
        const next = current === panel ? null : panel;
        if (next) {
          requestAnimationFrame(() => anchorFilterPanel(next));
        }
        return next;
      });
    },
    [anchorFilterPanel],
  );

  React.useEffect(() => {
    if (!activeFilterPanel) {
      return;
    }
    requestAnimationFrame(() => anchorFilterPanel(activeFilterPanel));
  }, [activeFilterPanel, anchorFilterPanel]);

  return (
    <View style={styles.listRoot}>
      <View ref={toolbarRef} collapsable={false} style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              {KOLAM_ENCLOSURE_LIST_TABS.map(tab => (
                <KolamButton
                  intent={controller.activeTab === tab.id ? 'primary' : 'outline'}
                  key={tab.id}
                  label={tab.label}
                  onPress={() => controller.onTabChange(tab.id)}
                  style={styles.toolbarButton}
                />
              ))}
              <KolamSearchField
                containerStyle={kolamTableToolbarStyles.searchInput}
                onChangeText={setSearchInput}
                placeholder="Cari kode / nama enclosure"
                value={searchInput}
              />
              <View ref={typeTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={
                    activeFilterPanel === 'type' ||
                    controller.filters.enclosureType !== 'all'
                  }
                  label={typeFilterLabel}
                  onPress={() => toggleFilterPanel('type')}
                  open={activeFilterPanel === 'type'}
                  variant="quiet"
                />
              </View>
              <View ref={livestockTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={
                    activeFilterPanel === 'livestock' ||
                    controller.filters.livestockPurpose !== 'all'
                  }
                  label={livestockFilterLabel}
                  onPress={() => toggleFilterPanel('livestock')}
                  open={activeFilterPanel === 'livestock'}
                  variant="quiet"
                />
              </View>
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              {filtersAppliedCount > 0 ? (
                <KolamButton
                  label="Reset"
                  muted={!listTabActive}
                  onPress={() => {
                    setSearchInput('');
                    setActiveFilterPanel(null);
                    controller.onClearFilters();
                  }}
                  style={styles.toolbarButton}
                />
              ) : null}
              <KolamButton
                disabled={controller.loading}
                label="Refresh"
                onPress={() => void controller.onRefresh()}
                style={styles.toolbarButton}
              />
            </View>
          </View>
        </View>

        {activeFilterPanel === 'type' ? (
          <View
            style={[
              styles.filterOverlayPanel,
              {
                left: panelAnchor.left,
                top: panelAnchor.top,
              },
            ]}
          >
            <ScrollView
              contentContainerStyle={styles.filterPanelContent}
              keyboardShouldPersistTaps="handled"
              style={styles.filterPanelScroll}
            >
              <KolamButton
                intent={
                  controller.filters.enclosureType === 'all'
                    ? 'primary'
                    : 'plain'
                }
                label="Semua tipe"
                onPress={() => {
                  controller.onChangeFilters({enclosureType: 'all'});
                  setActiveFilterPanel(null);
                }}
                style={styles.filterPanelOption}
              />
              {KOLAM_ENCLOSURE_TYPES.map(type => (
                <KolamButton
                  intent={
                    controller.filters.enclosureType === type
                      ? 'primary'
                      : 'plain'
                  }
                  key={type}
                  label={type}
                  onPress={() => {
                    controller.onChangeFilters({enclosureType: type});
                    setActiveFilterPanel(null);
                  }}
                  style={styles.filterPanelOption}
                />
              ))}
            </ScrollView>
            <View style={styles.filterPanelFooter}>
              <KolamButton
                label="Tutup"
                onPress={() => setActiveFilterPanel(null)}
              />
            </View>
          </View>
        ) : null}

        {activeFilterPanel === 'livestock' ? (
          <View
            style={[
              styles.filterOverlayPanel,
              {
                left: panelAnchor.left,
                top: panelAnchor.top,
              },
            ]}
          >
            <ScrollView
              contentContainerStyle={styles.filterPanelContent}
              keyboardShouldPersistTaps="handled"
              style={styles.filterPanelScroll}
            >
              {LIVESTOCK_FILTER_OPTIONS.map(option => (
                <KolamButton
                  intent={
                    controller.filters.livestockPurpose === option.value
                      ? 'primary'
                      : 'plain'
                  }
                  key={option.value}
                  label={option.label}
                  onPress={() => {
                    controller.onChangeFilters({
                      livestockPurpose: option.value,
                    });
                    setActiveFilterPanel(null);
                  }}
                  style={styles.filterPanelOption}
                />
              ))}
            </ScrollView>
            <View style={styles.filterPanelFooter}>
              <KolamButton
                label="Tutup"
                onPress={() => setActiveFilterPanel(null)}
              />
            </View>
          </View>
        ) : null}
      </View>

      {listTabActive ? (
        <KolamEnclosureTable
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : controller.activeTab === 'dashboard' ? (
        <KolamEnclosureDashboardPanel
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : controller.activeTab === 'pending' ? (
        <KolamEnclosurePendingPanel controller={controller} />
      ) : controller.activeTab === 'allocation' ? (
        <KolamEnclosureAllocationPanel
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : (
        <KolamEnclosureDeathHistoryPanel
          controller={controller}
          onRouteChange={onRouteChange}
        />
      )}
    </View>
  );
}

function KolamEnclosureTable({
  controller,
  onRouteChange,
}: {
  controller: KolamEnclosureController;
  onRouteChange?: (route: string) => void;
}) {
  const [tableBodyWidth, setTableBodyWidth] = React.useState(0);
  const listColumns = React.useMemo(
    () => fitEnclosureListColumns(tableBodyWidth),
    [tableBodyWidth],
  );
  const pageCount = Math.max(1, controller.pagination.totalPages);
  const safePage = Math.min(Math.max(controller.pagination.page, 1), pageCount);

  return (
    <KolamCatalogListTableShell
      footer={
        <KolamTableFooterControls
          onPageSizeChange={controller.onLimitChange}
          page={safePage}
          pageSize={controller.filters.limit}
          total={controller.pagination.total}
        >
          {pageCount > 1 ? (
            <View style={styles.paginationRow}>
              <KolamButton
                disabled={safePage <= 1}
                label="Sebelumnya"
                onPress={() =>
                  controller.onPageChange(Math.max(1, safePage - 1))
                }
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
                  controller.onPageChange(Math.min(pageCount, safePage + 1))
                }
              />
            </View>
          ) : null}
        </KolamTableFooterControls>
      }
      onBodyWidthChange={setTableBodyWidth}
      style={styles.tableFrame}
    >
      <KolamDataTableHeader columns={listColumns} />
      {controller.enclosures.length ? (
        controller.enclosures.map(item => (
          <KolamEnclosureRow
            columns={listColumns}
            enclosure={item}
            key={item.id || item.code}
            onSelect={() =>
              onRouteChange?.(`${KOLAM_ENCLOSURE_ROOT}/${item.id}`)
            }
          />
        ))
      ) : (
        <View style={styles.emptyWrap}>
          <KolamEmptyState
            compact
            message={getListEmptyMessage(controller)}
            title={
              controller.loading
                ? 'Memuat enclosure…'
                : controller.error
                  ? 'Gagal memuat enclosure'
                  : 'Belum ada enclosure'
            }
          />
        </View>
      )}
    </KolamCatalogListTableShell>
  );
}

function KolamEnclosureRow({
  columns,
  enclosure,
  onSelect,
}: {
  columns: ReturnType<typeof getKolamTableColumns>;
  enclosure: KolamEnclosure;
  onSelect: () => void;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);
  const imageUri = getKolamFileUrl(enclosure.coverPhotoUrl);
  const sizeText = formatEnclosureSize(enclosure);
  const columnOf = React.useCallback(
    (id: (typeof columns)[number]['id']) =>
      columns.find(column => column.id === id),
    [columns],
  );
  const photoColumn = columnOf('meta');
  const codeColumn = columnOf('children');
  const primaryColumn = columnOf('primary');
  const typeColumn = columnOf('notes');
  const livestockColumn = columnOf('products');
  const picColumn = columnOf('marketplace');
  const statusColumn = columnOf('status');
  const actionsColumn = columnOf('actions');

  return (
    <KolamDataTableRowFrame
      style={actionMenuOpen ? styles.activeActionRow : undefined}
    >
      <KolamDataTableMainTrack style={styles.mainTrackVisible}>
        <View
          style={[
            styles.listCell,
            styles.photoCell,
            photoColumn ? getKolamDataTableColumnStyle(photoColumn) : null,
          ]}
        >
          {imageUri ? (
            <KolamRemoteImage
              accessibilityLabel={`Foto ${enclosure.name || enclosure.code}`}
              resizeMode="cover"
              scope="enclosure-list"
              sourceUri={imageUri}
              style={styles.photo}
            />
          ) : (
            <Text style={styles.mutedText}>-</Text>
          )}
        </View>

        <View
          style={[
            styles.listCell,
            codeColumn ? getKolamDataTableColumnStyle(codeColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.cellTextStrong}>
            {enclosure.code || '-'}
          </Text>
        </View>

        <Pressable
          onPress={onSelect}
          style={[
            styles.listCell,
            styles.identityCell,
            primaryColumn ? getKolamDataTableColumnStyle(primaryColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.rowTitle}>
            {enclosure.name || enclosure.code || '-'}
          </Text>
          <Text numberOfLines={1} style={styles.rowMeta}>
            {[enclosure.location?.name, sizeText].filter(Boolean).join(' / ') ||
              '-'}
          </Text>
        </Pressable>

        <View
          style={[
            styles.listCell,
            styles.centerCell,
            typeColumn ? getKolamDataTableColumnStyle(typeColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={[styles.cellText, styles.centerText]}>
            {enclosure.type || '-'}
          </Text>
          {enclosure.aquariumWaterType ? (
            <Text numberOfLines={1} style={[styles.rowMeta, styles.centerText]}>
              {getAquariumWaterLabel(enclosure.aquariumWaterType)}
            </Text>
          ) : null}
        </View>

        <View
          style={[
            styles.listCell,
            styles.centerCell,
            livestockColumn
              ? getKolamDataTableColumnStyle(livestockColumn)
              : null,
          ]}
        >
          <Text numberOfLines={1} style={[styles.cellText, styles.centerText]}>
            {getLivestockPurposeLabel(enclosure.livestockPurpose)}
          </Text>
        </View>

        <View
          style={[
            styles.listCell,
            styles.picCell,
            picColumn ? getKolamDataTableColumnStyle(picColumn) : null,
            styles.overflowVisible,
          ]}
        >
          <KolamEnclosurePicAvatar enclosure={enclosure} />
        </View>

        <View
          style={[
            styles.listCell,
            styles.statusCell,
            statusColumn ? getKolamDataTableColumnStyle(statusColumn) : null,
          ]}
        >
          <KolamStatusBadge
            intent={getEnclosureStatusIntent(enclosure.status)}
            label={enclosure.status || 'active'}
            style={styles.centerBadge}
          />
          {enclosure.customer ? (
            <KolamStatusBadge
              intent="success"
              label="Customer"
              style={styles.centerBadge}
              textStyle={styles.badgeTextSm}
            />
          ) : null}
        </View>
      </KolamDataTableMainTrack>

      <KolamDataTableActionsTrack
        style={styles.actionsTrack}
        width={Math.max(
          actionsColumn?.width ?? KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
          KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
        )}
      >
        <KolamOverflowMenuButton
          accessibilityLabel={`Aksi ${enclosure.name || enclosure.code}`}
          actions={[{label: 'Lihat', onPress: onSelect}]}
          onOpenChange={setActionMenuOpen}
        />
      </KolamDataTableActionsTrack>
    </KolamDataTableRowFrame>
  );
}

function KolamEnclosurePicAvatar({enclosure}: {enclosure: KolamEnclosure}) {
  const name =
    enclosure.assignedTo?.displayName ||
    enclosure.assignedTo?.email ||
    'Tanpa PIC';
  const photoUri = getKolamFileUrl(enclosure.assignedTo?.photo);
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('') || '?';

  return (
    <KolamHoverTooltip
      align="center"
      containerStyle={styles.picTooltip}
      label={name}
    >
      <View accessibilityLabel={`PIC ${name}`} style={styles.picAvatar}>
        <KolamProfileAvatarContent
          imageStyle={styles.picAvatarImage}
          imageUrl={photoUri}
          initials={initials}
          textStyle={styles.picAvatarText}
        />
      </View>
    </KolamHoverTooltip>
  );
}

function KolamEnclosureDashboardPanel({
  controller,
  onRouteChange,
}: {
  controller: KolamEnclosureController;
  onRouteChange?: (route: string) => void;
}) {
  if (controller.loading && controller.dataSource === 'idle') {
    return <InlineState title="Memuat dashboard..." />;
  }
  if (controller.error) {
    return <InlineState title="Gagal memuat dashboard" message={controller.error} />;
  }

  const stats = controller.dashboardStats;
  return (
    <ScrollView contentContainerStyle={styles.dashboardContent}>
      <View style={styles.summaryGridHero}>
        <SummaryTile
          icon="E"
          label="Jumlah enclosure"
          value={stats.totals.enclosures}
        />
        <SummaryTile
          hint={`${stats.totals.individuals} ekor total`}
          icon="S"
          label="Spesies di enclosure"
          value={stats.totals.speciesDistinct}
        />
        <SummaryTile
          accent="primary"
          hint={`${stats.production.speciesDistinct} jenis`}
          icon="P"
          label="Indukan produksi"
          value={stats.production.totalQty}
        />
        <SummaryTile
          hint={`${stats.saleable.speciesDistinct} jenis`}
          icon="J"
          label="Stok jual di enclosure"
          value={stats.saleable.totalQty}
        />
        <SummaryTile
          accent="warning"
          hint={`${stats.deaths.reportedAnimals} ekor dilaporkan / ${stats.deaths.totalCases} event total`}
          icon="!"
          label="Kematian dilaporkan"
          value={stats.deaths.reportedCases}
        />
        <SummaryTile
          accent="primary"
          hint={`${stats.births.totalCases} event / alasan KELAHIRAN`}
          icon="+"
          label="Total kelahiran indukan"
          value={stats.births.totalAnimals}
        />
      </View>

      <DashboardProductionStatsCard
        rows={stats.production.rows}
        speciesDistinct={stats.production.speciesDistinct}
        totalQty={stats.production.totalQty}
      />
    </ScrollView>
  );
}

function KolamEnclosureDeathHistoryPanel({
  controller,
  onRouteChange,
}: {
  controller: KolamEnclosureController;
  onRouteChange?: (route: string) => void;
}) {
  if (controller.loading && controller.dataSource === 'idle') {
    return <InlineState title="Memuat riwayat kematian..." />;
  }
  if (controller.error) {
    return (
      <InlineState title="Gagal memuat riwayat kematian" message={controller.error} />
    );
  }

  const deaths = controller.dashboardStats.deaths;
  return (
    <View style={styles.deathHistoryPanel}>
      <View style={styles.summaryGridHero}>
        <SummaryTile
          accent="warning"
          hint={`${deaths.reportedAnimals} ekor`}
          icon="!"
          label="Kasus dilaporkan"
          value={deaths.reportedCases}
        />
        <SummaryTile
          hint={`${deaths.totalAnimals} ekor`}
          icon="E"
          label="Total event"
          value={deaths.totalCases}
        />
      </View>
      <View style={styles.deathHistoryToolbar}>
        <KolamButton
          label="Pergerakan stok"
          onPress={() => onRouteChange?.('/stock-transaction')}
          style={styles.toolbarButton}
        />
      </View>
      <DashboardDeathTable
        events={deaths.recent}
        onRouteChange={onRouteChange}
      />
    </View>
  );
}

function DashboardProductionStatsCard({
  rows,
  speciesDistinct,
  totalQty,
}: {
  rows: KolamEnclosureDashboardSpeciesRow[];
  speciesDistinct: number;
  totalQty: number;
}) {
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(
    1,
    Math.ceil(rows.length / DASHBOARD_PRODUCTION_STATS_PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice(
    (safePage - 1) * DASHBOARD_PRODUCTION_STATS_PAGE_SIZE,
    safePage * DASHBOARD_PRODUCTION_STATS_PAGE_SIZE,
  );
  const diagramRows = React.useMemo(
    () => buildProductionDiagramRows(rows, totalQty),
    [rows, totalQty],
  );

  React.useEffect(() => {
    setPage(1);
  }, [rows]);

  return (
    <View style={styles.productionStatsCard}>
      <View style={styles.productionStatsHeader}>
        <View style={styles.sectionHeadingCopy}>
          <Text style={styles.productionStatsTitle}>Indukan produksi</Text>
          <Text style={styles.productionStatsSubtitle}>
            Statistik kandang produksi (tidak dijual)
          </Text>
        </View>
        <View style={styles.productionStatsPills}>
          <View style={styles.productionStatPill}>
            <Text style={styles.productionStatPillValue}>{speciesDistinct}</Text>
            <Text style={styles.productionStatPillLabel}>jenis</Text>
          </View>
          <View style={styles.productionStatPill}>
            <Text style={styles.productionStatPillValue}>{totalQty}</Text>
            <Text style={styles.productionStatPillLabel}>ekor</Text>
          </View>
        </View>
      </View>

      <View style={styles.productionStatsBody}>
        <View style={styles.productionStatsTablePane}>
          <View style={styles.productionStatsTable}>
            <View style={styles.productionStatsTableHead}>
              <Text
                style={[
                  styles.productionStatsHeadCell,
                  styles.productionStatsColSpecies,
                ]}
              >
                Species
              </Text>
              <Text
                style={[
                  styles.productionStatsHeadCell,
                  styles.productionStatsColVariant,
                ]}
              >
                Varian
              </Text>
              <Text
                style={[
                  styles.productionStatsHeadCell,
                  styles.productionStatsColQty,
                ]}
              >
                Qty
              </Text>
              <Text
                style={[
                  styles.productionStatsHeadCell,
                  styles.productionStatsColEnc,
                ]}
              >
                Enc
              </Text>
            </View>
            {pageRows.length ? (
              pageRows.map(row => (
                <View
                  key={`${row.speciesId}:${row.variantId || ''}`}
                  style={styles.productionStatsTableRow}
                >
                  <View style={styles.productionStatsColSpecies}>
                    <Text numberOfLines={1} style={styles.productionStatsSpecies}>
                      {row.speciesName || '-'}
                    </Text>
                    {row.scientificName ? (
                      <Text
                        numberOfLines={1}
                        style={styles.productionStatsScientific}
                      >
                        {row.scientificName}
                      </Text>
                    ) : null}
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.productionStatsCell,
                      styles.productionStatsColVariant,
                    ]}
                  >
                    {row.variantLabel || '—'}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.productionStatsCellStrong,
                      styles.productionStatsColQty,
                    ]}
                  >
                    {row.qty} {row.unit || 'ekor'}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.productionStatsCellStrong,
                      styles.productionStatsColEnc,
                    ]}
                  >
                    {row.enclosureCount}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyWrap}>
                <KolamEmptyState
                  compact
                  message="Belum ada livestock produksi."
                  title="Belum ada indukan produksi"
                />
              </View>
            )}
          </View>
        </View>

        <View style={styles.productionDiagramPane}>
          <Text style={styles.productionDiagramTitle}>Distribusi qty</Text>
          <Text style={styles.productionDiagramSubtitle}>Top species</Text>
          {diagramRows.length ? (
            <View style={styles.productionDiagramList}>
              {diagramRows.map(item => (
                <View key={item.key} style={styles.productionDiagramRow}>
                  <Text numberOfLines={1} style={styles.productionDiagramLabel}>
                    {item.label}
                  </Text>
                  <View style={styles.productionDiagramTrack}>
                    <View
                      style={[
                        styles.productionDiagramFill,
                        {width: `${item.percent}%` as `${number}%`},
                      ]}
                    />
                  </View>
                  <Text style={styles.productionDiagramValue}>{item.qty}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.productionDiagramEmpty}>Belum ada data</Text>
          )}
        </View>
      </View>

      {rows.length > DASHBOARD_PRODUCTION_STATS_PAGE_SIZE ? (
        <SimpleDashboardPagination
          onPageChange={setPage}
          page={safePage}
          totalItems={rows.length}
          totalPages={totalPages}
        />
      ) : null}
    </View>
  );
}

function buildProductionDiagramRows(
  rows: KolamEnclosureDashboardSpeciesRow[],
  totalQty: number,
) {
  const bySpecies = new Map<
    string,
    {key: string; label: string; qty: number}
  >();

  for (const row of rows) {
    const key = row.speciesId || row.speciesName || row.variantId || 'unknown';
    const label = row.speciesName || row.scientificName || 'Species';
    const current = bySpecies.get(key);
    if (current) {
      current.qty += row.qty;
    } else {
      bySpecies.set(key, {key, label, qty: row.qty});
    }
  }

  const ranked = [...bySpecies.values()]
    .sort((left, right) => right.qty - left.qty || left.label.localeCompare(right.label))
    .slice(0, PRODUCTION_DIAGRAM_TOP_N);
  const maxQty = Math.max(1, ...ranked.map(item => item.qty), totalQty > 0 ? 1 : 0);

  return ranked.map(item => ({
    ...item,
    percent: Math.max(6, Math.round((item.qty / maxQty) * 100)),
  }));
}

function DashboardDeathTable({
  events,
  onRouteChange,
}: {
  events: KolamEnclosureDashboardDeathEvent[];
  onRouteChange?: (route: string) => void;
}) {
  const [tableBodyWidth, setTableBodyWidth] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(DASHBOARD_DEATH_PAGE_SIZE);
  const columns = React.useMemo(
    () => fitDeathHistoryColumns(tableBodyWidth),
    [tableBodyWidth],
  );
  const totalPages = Math.max(1, Math.ceil(events.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageEvents = events.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  React.useEffect(() => {
    setPage(1);
  }, [events, pageSize]);

  return (
    <KolamCatalogListTableShell
      footer={
        <KolamTableFooterControls
          onPageSizeChange={next => {
            setPageSize(normalizeKolamEnclosurePageSize(next));
            setPage(1);
          }}
          page={safePage}
          pageSize={pageSize}
          total={events.length}
        >
          {totalPages > 1 ? (
            <View style={styles.paginationRow}>
              <KolamButton
                disabled={safePage <= 1}
                label="Sebelumnya"
                onPress={() => setPage(Math.max(1, safePage - 1))}
              />
              <KolamCopyStack
                items={[
                  {
                    id: 'page',
                    text: `${safePage} / ${totalPages}`,
                    style: styles.pageLabel,
                  },
                ]}
              />
              <KolamButton
                disabled={safePage >= totalPages}
                label="Berikutnya"
                onPress={() => setPage(Math.min(totalPages, safePage + 1))}
              />
            </View>
          ) : null}
        </KolamTableFooterControls>
      }
      onBodyWidthChange={setTableBodyWidth}
      style={styles.tableFrame}
    >
      <KolamDataTableHeader columns={columns} />
      {pageEvents.length ? (
        pageEvents.map((event, index) => (
          <DashboardDeathRow
            columns={columns}
            event={event}
            key={`${event.enclosureId}:${event.createdAt || index}`}
            onRouteChange={onRouteChange}
          />
        ))
      ) : (
        <View style={styles.emptyWrap}>
          <KolamEmptyState
            compact
            message="Belum ada catatan kematian."
            title="Belum ada catatan kematian"
          />
        </View>
      )}
    </KolamCatalogListTableShell>
  );
}

function DashboardDeathRow({
  columns,
  event,
  onRouteChange,
}: {
  columns: KolamTableColumn[];
  event: KolamEnclosureDashboardDeathEvent;
  onRouteChange?: (route: string) => void;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);
  const stockRoute = event.stockTransactionId
    ? `/stock-transaction/${event.stockTransactionId}`
    : event.speciesId
      ? `/stock-transaction?speciesId=${encodeURIComponent(event.speciesId)}`
      : '/stock-transaction';
  const columnOf = React.useCallback(
    (id: KolamTableColumn['id']) => columns.find(column => column.id === id),
    [columns],
  );
  const metaColumn = columnOf('meta');
  const enclosureColumn = columnOf('children');
  const primaryColumn = columnOf('primary');
  const amountColumn = columnOf('amount');
  const statusColumn = columnOf('status');
  const actionsColumn = columnOf('actions');

  return (
    <KolamDataTableRowFrame
      style={actionMenuOpen ? styles.activeActionRow : undefined}
    >
      <KolamDataTableMainTrack style={styles.mainTrackVisible}>
        <View
          style={[
            styles.listCell,
            metaColumn ? getKolamDataTableColumnStyle(metaColumn) : null,
          ]}
        >
          <Text numberOfLines={2} style={styles.cellText}>
            {formatDashboardDateTime(event.createdAt)}
          </Text>
        </View>
        <Pressable
          onPress={() =>
            event.enclosureId
              ? onRouteChange?.(`${KOLAM_ENCLOSURE_ROOT}/${event.enclosureId}`)
              : undefined
          }
          style={[
            styles.listCell,
            enclosureColumn
              ? getKolamDataTableColumnStyle(enclosureColumn)
              : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.linkText}>
            {event.enclosureCode || event.enclosureId.slice(-8) || '-'}
          </Text>
        </Pressable>
        <View
          style={[
            styles.listCell,
            styles.identityCell,
            primaryColumn ? getKolamDataTableColumnStyle(primaryColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.rowTitle}>
            {event.speciesName || '-'}
          </Text>
          {event.scientificName ? (
            <Text numberOfLines={1} style={styles.rowMeta}>
              {event.scientificName}
            </Text>
          ) : null}
        </View>
        <View
          style={[
            styles.listCell,
            amountColumn ? getKolamDataTableColumnStyle(amountColumn) : null,
          ]}
        >
          <Text style={styles.numText}>{event.qty}</Text>
        </View>
        <View
          style={[
            styles.listCell,
            styles.statusCell,
            statusColumn ? getKolamDataTableColumnStyle(statusColumn) : null,
          ]}
        >
          <KolamStatusBadge
            intent={event.reported ? 'warning' : 'muted'}
            label={event.reported ? 'Dilaporkan' : 'Tanpa laporan'}
            style={styles.centerBadge}
            textStyle={styles.badgeTextSm}
          />
        </View>
      </KolamDataTableMainTrack>
      <KolamDataTableActionsTrack
        style={styles.actionsTrack}
        width={Math.max(
          actionsColumn?.width ?? KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
          KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
        )}
      >
        <KolamOverflowMenuButton
          accessibilityLabel={`Aksi kematian ${event.enclosureCode || event.speciesName || ''}`}
          actions={[
            {
              label: 'Lihat',
              onPress: () => onRouteChange?.(stockRoute),
            },
          ]}
          onOpenChange={setActionMenuOpen}
        />
      </KolamDataTableActionsTrack>
    </KolamDataTableRowFrame>
  );
}

function SimpleDashboardPagination({
  onPageChange,
  page,
  totalItems,
  totalPages,
}: {
  onPageChange: (page: number) => void;
  page: number;
  totalItems: number;
  totalPages: number;
}) {
  return (
    <View style={styles.dashboardPagination}>
      <Text style={styles.sectionMeta}>{totalItems} baris</Text>
      <View style={styles.paginationRow}>
        <KolamButton
          disabled={page <= 1}
          label="Sebelumnya"
          onPress={() => onPageChange(Math.max(1, page - 1))}
        />
        <Text style={styles.pageLabel}>
          {page} / {totalPages}
        </Text>
        <KolamButton
          disabled={page >= totalPages}
          label="Berikutnya"
          onPress={() => onPageChange(Math.min(totalPages, page + 1))}
        />
      </View>
    </View>
  );
}

function KolamEnclosurePendingPanel({
  controller,
}: {
  controller: KolamEnclosureController;
}) {
  if (controller.loading && !controller.pendingAllocations.length) {
    return <InlineState title="Memuat pending allocation..." />;
  }
  if (controller.error) {
    return <InlineState title="Gagal memuat pending" message={controller.error} />;
  }
  if (!controller.pendingAllocations.length) {
    return (
      <InlineState
        title="Tidak ada pending allocation"
        message="Semua livestock saleable sudah dialokasikan."
      />
    );
  }

  return (
    <View style={styles.panelList}>
      {controller.pendingAllocations.map(item => (
        <View key={item.id} style={styles.panelRow}>
          <KolamCopyStack
            containerStyle={styles.panelRowCopy}
            items={[
              {id: 'title', text: item.displayLine || item.speciesName, style: styles.rowTitle},
              {
                id: 'meta',
                text: [item.invoiceCode, item.variantLabel].filter(Boolean).join(' / '),
                style: styles.rowMeta,
              },
            ]}
          />
          <Text style={styles.qtyText}>{item.qtyRemaining}</Text>
        </View>
      ))}
    </View>
  );
}

function KolamEnclosureAllocationPanel({
  controller,
  onRouteChange,
}: {
  controller: KolamEnclosureController;
  onRouteChange?: (route: string) => void;
}) {
  const [page, setPage] = React.useState(1);
  const [openSpeciesIds, setOpenSpeciesIds] = React.useState<Set<string>>(
    () => new Set(),
  );
  const search = controller.filters.search.trim();
  const groups = React.useMemo(
    () => filterAllocationGroups(controller.allocationSpeciesGroups, search),
    [controller.allocationSpeciesGroups, search],
  );
  const totalPages = Math.max(1, Math.ceil(groups.length / DASHBOARD_SPECIES_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageGroups = groups.slice(
    (safePage - 1) * DASHBOARD_SPECIES_PAGE_SIZE,
    safePage * DASHBOARD_SPECIES_PAGE_SIZE,
  );

  React.useEffect(() => {
    setPage(1);
  }, [search, controller.allocationSpeciesGroups]);

  const toggleGroup = React.useCallback((speciesId: string) => {
    setOpenSpeciesIds(current => {
      const next = new Set(current);
      if (next.has(speciesId)) {
        next.delete(speciesId);
      } else {
        next.add(speciesId);
      }
      return next;
    });
  }, []);

  if (controller.loading && !controller.allocationOverview.items.length) {
    return <InlineState title="Memuat statistik allocation..." />;
  }
  if (controller.error) {
    return <InlineState title="Gagal memuat statistik" message={controller.error} />;
  }
  if (!controller.allocationSpeciesGroups.length) {
    return (
      <InlineState
        title="Belum ada statistik"
        message="Belum ada livestock yang terhubung ke enclosure."
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.dashboardContent}>
      <View style={styles.summaryGrid}>
        <SummaryTile
          icon="S"
          label="Jumlah species"
          value={controller.allocationOverview.totals.speciesCount}
        />
        <SummaryTile
          hint={`${controller.allocationOverview.totals.rowCount} varian`}
          icon="T"
          label="Stok total"
          value={controller.allocationOverview.totals.totalStock}
        />
        <SummaryTile
          accent="primary"
          icon="E"
          label="Sudah di enclosure"
          value={controller.allocationOverview.totals.totalAllocated}
        />
        <SummaryTile
          accent="warning"
          icon="!"
          label="Belum di enclosure"
          value={controller.allocationOverview.totals.totalUnallocated}
        />
      </View>
      <Text style={styles.sectionMeta}>
        {groups.length} species / {controller.allocationOverview.totals.rowCount} varian
      </Text>
      <KolamCatalogListTableShell
        footer={
          groups.length > DASHBOARD_SPECIES_PAGE_SIZE ? (
            <SimpleDashboardPagination
              onPageChange={setPage}
              page={safePage}
              totalItems={groups.length}
              totalPages={totalPages}
            />
          ) : (
            <Text style={styles.sectionMeta}>{groups.length} species</Text>
          )
        }
        style={styles.tableFrame}
      >
        <View style={styles.dashboardTable}>
          <KolamDataTableHeader columns={ALLOCATION_OVERVIEW_COLUMNS} />
          {pageGroups.length ? (
            pageGroups.map(group => (
              <AllocationSpeciesGroupRow
                group={group}
                key={group.speciesId}
                onRouteChange={onRouteChange}
                onToggle={() => toggleGroup(group.speciesId)}
                open={openSpeciesIds.has(group.speciesId)}
              />
            ))
          ) : (
            <View style={styles.emptyWrap}>
              <KolamEmptyState
                compact
                message={
                  search
                    ? `Tidak ada species untuk "${search}".`
                    : 'Belum ada data stok species.'
                }
                title={search ? 'Species tidak ditemukan' : 'Belum ada data stok'}
              />
            </View>
          )}
        </View>
      </KolamCatalogListTableShell>
    </ScrollView>
  );
}

type AllocationSpeciesGroup =
  KolamEnclosureController['allocationSpeciesGroups'][number];

function AllocationSpeciesGroupRow({
  group,
  onRouteChange,
  onToggle,
  open,
}: {
  group: AllocationSpeciesGroup;
  onRouteChange?: (route: string) => void;
  onToggle: () => void;
  open: boolean;
}) {
  const singleRow = group.rows.length === 1 && !group.hasVariants;
  const row = group.rows[0];

  if (singleRow && row) {
    return (
      <AllocationOverviewRow
        allocated={row.allocated}
        codes={row.enclosureCodes}
        enclosures={row.enclosures}
        onRouteChange={onRouteChange}
        scientificName={group.scientificName}
        speciesName={group.speciesName || group.speciesId}
        unit={row.unit || group.unit}
        unallocated={row.unallocated}
        variantLabel={row.variantLabel || '-'}
      />
    );
  }

  return (
    <View>
      <KolamDataTableRowFrame>
        <View style={[styles.cell, styles.primaryCell]}>
          <Text numberOfLines={1} style={styles.rowTitle}>
            {group.speciesName || group.speciesId}
          </Text>
          {group.scientificName ? (
            <Text numberOfLines={1} style={styles.scientificText}>
              {group.scientificName}
            </Text>
          ) : null}
        </View>
        <View style={[styles.cell, {width: allocationWidthOf('notes')}]}>
          <KolamButton
            label={`${group.rows.length} varian ${open ? 'up' : 'down'}`}
            onPress={onToggle}
            style={styles.variantToggleButton}
          />
        </View>
        <View style={[styles.cell, {width: allocationWidthOf('children')}]}>
          <Text style={styles.numText}>
            {group.totalAllocated} {group.unit}
          </Text>
        </View>
        <View style={[styles.cell, {width: allocationWidthOf('amount')}]}>
          <Text
            style={[
              styles.numText,
              group.totalUnallocated > 0 ? styles.warningText : null,
            ]}
          >
            {group.totalUnallocated} {group.unit}
          </Text>
        </View>
        <View style={[styles.cell, {width: allocationWidthOf('marketplace')}]}>
          <AllocationEnclosureCodeLinks
            onRouteChange={onRouteChange}
            rows={group.rows}
          />
        </View>
      </KolamDataTableRowFrame>
      {open ? (
        <View style={styles.allocationVariantPanel}>
          {group.rows.map(rowItem => (
            <AllocationVariantRow
              key={`${rowItem.speciesId}:${rowItem.variantId || ''}`}
              onRouteChange={onRouteChange}
              row={rowItem}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function AllocationOverviewRow({
  allocated,
  codes,
  enclosures,
  onRouteChange,
  scientificName,
  speciesName,
  unit,
  unallocated,
  variantLabel,
}: {
  allocated: number;
  codes: string[];
  enclosures: KolamEnclosureAllocationOverviewRow['enclosures'];
  onRouteChange?: (route: string) => void;
  scientificName: string;
  speciesName: string;
  unit: string;
  unallocated: number;
  variantLabel: string;
}) {
  return (
    <KolamDataTableRowFrame>
      <View style={[styles.cell, styles.primaryCell]}>
        <Text numberOfLines={1} style={styles.rowTitle}>
          {speciesName || '-'}
        </Text>
        {scientificName ? (
          <Text numberOfLines={1} style={styles.scientificText}>
            {scientificName}
          </Text>
        ) : null}
      </View>
      <View style={[styles.cell, {width: allocationWidthOf('notes')}]}>
        <Text numberOfLines={2} style={styles.cellText}>
          {variantLabel || '-'}
        </Text>
      </View>
      <View style={[styles.cell, {width: allocationWidthOf('children')}]}>
        <Text style={styles.numText}>
          {allocated} {unit}
        </Text>
      </View>
      <View style={[styles.cell, {width: allocationWidthOf('amount')}]}>
        <Text style={[styles.numText, unallocated > 0 ? styles.warningText : null]}>
          {unallocated} {unit}
        </Text>
      </View>
      <View style={[styles.cell, {width: allocationWidthOf('marketplace')}]}>
        <AllocationEnclosureCodeLinks
          onRouteChange={onRouteChange}
          rows={[{enclosureCodes: codes, enclosures}]}
        />
      </View>
    </KolamDataTableRowFrame>
  );
}

function AllocationVariantRow({
  onRouteChange,
  row,
}: {
  onRouteChange?: (route: string) => void;
  row: KolamEnclosureAllocationOverviewRow;
}) {
  return (
    <View style={styles.allocationVariantRow}>
      <Text numberOfLines={2} style={[styles.cellText, styles.variantName]}>
        {row.variantLabel || '-'}
      </Text>
      <Text style={styles.allocationVariantMetric}>
        Di enclosure: {row.allocated} {row.unit}
      </Text>
      <Text
        style={[
          styles.allocationVariantMetric,
          row.unallocated > 0 ? styles.warningText : null,
        ]}
      >
        Belum: {row.unallocated} {row.unit}
      </Text>
      <AllocationEnclosureCodeLinks
        onRouteChange={onRouteChange}
        rows={[row]}
        style={styles.allocationVariantCodes}
      />
    </View>
  );
}

function AllocationEnclosureCodeLinks({
  onRouteChange,
  rows,
  style,
}: {
  onRouteChange?: (route: string) => void;
  rows: Array<
    Pick<KolamEnclosureAllocationOverviewRow, 'enclosureCodes' | 'enclosures'>
  >;
  style?: StyleProp<TextStyle>;
}) {
  const links = collectAllocationEnclosureLinks(rows);
  if (!links.length) {
    return <Text style={[styles.cellText, style]}>-</Text>;
  }

  return (
    <View style={styles.codeLinksRow}>
      {links.map((link, index) => (
        <React.Fragment key={`${link.enclosureId || 'code'}:${link.code}`}>
          {index > 0 ? <Text style={[styles.cellText, style]}>, </Text> : null}
          {link.enclosureId ? (
            <Pressable
              accessibilityRole="link"
              onPress={() =>
                onRouteChange?.(`${KOLAM_ENCLOSURE_ROOT}/${link.enclosureId}`)
              }
            >
              <Text numberOfLines={1} style={[styles.linkText, style]}>
                {link.code}
              </Text>
            </Pressable>
          ) : (
            <Text numberOfLines={1} style={[styles.cellText, style]}>
              {link.code}
            </Text>
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

function InlineState({message, title}: {message?: string; title: string}) {
  return (
    <View style={styles.emptyWrap}>
      <KolamEmptyState compact message={message ?? ''} title={title} />
    </View>
  );
}

function SummaryTile({
  accent,
  hint,
  icon,
  label,
  value,
}: {
  accent?: 'primary' | 'warning';
  hint?: string;
  icon: string;
  label: string;
  value: number;
}) {
  return (
    <View
      style={[
        styles.summaryTile,
        accent === 'primary' ? styles.summaryTilePrimary : null,
        accent === 'warning' ? styles.summaryTileWarning : null,
      ]}
    >
      <View style={styles.summaryTileHeader}>
        <View
          style={[
            styles.summaryIcon,
            accent === 'primary' ? styles.summaryIconPrimary : null,
            accent === 'warning' ? styles.summaryIconWarning : null,
          ]}
        >
          <Text style={styles.summaryIconText}>{icon}</Text>
        </View>
        <Text style={styles.summaryValue}>{value}</Text>
      </View>
      <Text numberOfLines={2} style={styles.summaryLabel}>
        {label}
      </Text>
      {hint ? <Text style={styles.summaryHint}>{hint}</Text> : null}
    </View>
  );
}

function getListEmptyMessage(controller: KolamEnclosureController) {
  if (controller.error) {
    return controller.error;
  }
  if (controller.loading) {
    return 'Data enclosure sedang dimuat dari Kolam.';
  }
  if (controller.filters.search.trim()) {
    return `Tidak ada enclosure untuk "${controller.filters.search.trim()}".`;
  }
  return 'Coba ubah tab, pencarian, atau filter.';
}

function fitEnclosureListColumns(containerWidth: number): KolamTableColumn[] {
  return fitKolamDataTableColumns(
    getKolamTableColumns('enclosure'),
    containerWidth,
    {
      actionsMinWidth: KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
      gap: KOLAM_DATA_TABLE_COLUMN_GAP,
      paddingX: getKolamTableVisualContract().body.cellPaddingX * 2,
      primaryMinWidth: 160,
      secondaryMinWidth: 48,
    },
  );
}

function fitDeathHistoryColumns(containerWidth: number): KolamTableColumn[] {
  return fitKolamDataTableColumns(DASHBOARD_DEATH_COLUMNS, containerWidth, {
    actionsMinWidth: KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
    gap: KOLAM_DATA_TABLE_COLUMN_GAP,
    paddingX: getKolamTableVisualContract().body.cellPaddingX * 2,
    primaryMinWidth: 160,
    secondaryMinWidth: 72,
  });
}

function allocationWidthOf(id: KolamTableColumn['id']) {
  return ALLOCATION_OVERVIEW_COLUMNS.find(column => column.id === id)?.width;
}

function filterAllocationGroups(
  groups: KolamEnclosureController['allocationSpeciesGroups'],
  search: string,
) {
  const needle = search.trim().toLowerCase();
  if (!needle) {
    return groups;
  }

  return groups.filter(group => {
    const text = [
      group.speciesName,
      group.scientificName,
      group.unit,
      ...group.rows.flatMap(row => [
        row.variantLabel,
        ...row.enclosureCodes,
        ...row.enclosures.map(enclosure => enclosure.code),
      ]),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return text.includes(needle);
  });
}

function collectAllocationEnclosureLinks(
  rows: Array<
    Pick<KolamEnclosureAllocationOverviewRow, 'enclosureCodes' | 'enclosures'>
  >,
) {
  const byKey = new Map<string, {code: string; enclosureId: string}>();

  for (const row of rows) {
    for (const enclosure of row.enclosures) {
      const code = enclosure.code.trim();
      const enclosureId = enclosure.enclosureId.trim();
      if (!code && !enclosureId) {
        continue;
      }
      const key = enclosureId || `code:${code}`;
      const current = byKey.get(key);
      if (!current) {
        byKey.set(key, {
          code: code || enclosureId.slice(-8),
          enclosureId,
        });
        continue;
      }
      if (!current.enclosureId && enclosureId) {
        current.enclosureId = enclosureId;
      }
      if (!current.code && code) {
        current.code = code;
      }
    }
    for (const code of row.enclosureCodes) {
      const trimmed = code.trim();
      if (!trimmed) {
        continue;
      }
      const existing = [...byKey.values()].find(item => item.code === trimmed);
      if (existing) {
        continue;
      }
      byKey.set(`code:${trimmed}`, {code: trimmed, enclosureId: ''});
    }
  }

  return [...byKey.values()];
}

function getEnclosureDetailPhotoUris(enclosure: KolamEnclosure) {
  const uris: string[] = [];
  for (const path of [enclosure.coverPhotoUrl, ...enclosure.photos]) {
    const uri = getKolamFileUrl(path);
    if (uri && !uris.includes(uri)) {
      uris.push(uri);
    }
  }
  return uris;
}

function getEnclosureDetailTabs(showProductionTab: boolean) {
  return showProductionTab
    ? ENCLOSURE_DETAIL_TABS_WITH_PRODUCTION
    : ENCLOSURE_DETAIL_BASE_TABS;
}

function sumDetailSpeciesQty(enclosure: KolamEnclosure) {
  return enclosure.species.reduce(
    (sum, item) => sum + Math.max(0, Number(item.quantity) || 0),
    0,
  );
}

function sumProductionEggQty(enclosure: KolamEnclosure) {
  return enclosure.productionEggs.reduce(
    (sum, item) => sum + Math.max(0, Number(item.quantity) || 0),
    0,
  );
}

function countProductionBirthQty(enclosure: KolamEnclosure) {
  return enclosure.speciesPopulationHistory
    .filter(item => {
      const eventType = String(item.eventType || '').toLowerCase();
      const reason = String(item.reason || '').toUpperCase();
      return eventType === 'birth' || reason.includes('KELAHIRAN');
    })
    .reduce((sum, item) => sum + Math.max(0, Number(item.delta) || 0), 0);
}

function getDetailStockMovementRows(
  enclosure: KolamEnclosure,
  statistics: KolamEnclosureStatistics | null,
) {
  if (statistics) {
    return [
      ...statistics.deaths.map(row =>
        getStatisticsMovementRow(row, 'Kematian', -row.quantity),
      ),
      ...statistics.lost.map(row =>
        getStatisticsMovementRow(row, 'Hilang', -row.quantity),
      ),
      ...statistics.sales.map(row =>
        getStatisticsMovementRow(row, 'Penjualan', -row.quantity),
      ),
      ...(statistics.production?.events ?? []).map(row => ({
        key: row.id || `${row.createdAt}:${row.category}`,
        meta: [
          formatDashboardDateTime(row.createdAt),
          row.scientificName || row.speciesName,
          row.variantLabel,
          row.reason,
        ]
          .filter(Boolean)
          .join(' / '),
        quantity: row.quantity,
        title: row.categoryLabel || row.category || 'Produksi',
      })),
    ]
      .sort((left, right) => right.meta.localeCompare(left.meta))
      .slice(0, 8);
  }

  return enclosure.speciesPopulationHistory.slice(0, 8).map((row, index) => ({
    key: row.id || `${row.createdAt}:${index}`,
    meta: [
      formatDashboardDateTime(row.createdAt),
      row.speciesName || row.scientificName,
      row.variantLabel,
      row.reason,
    ]
      .filter(Boolean)
      .join(' / '),
    quantity: row.delta,
    title: row.eventTypeLabel || row.eventType || 'Pergerakan stok',
  }));
}

function getStatisticsMovementRow(
  row: KolamEnclosureStatisticsEvent,
  title: string,
  quantity: number,
) {
  return {
    key: row.id || `${row.createdAt}:${title}`,
    meta: [
      formatDashboardDateTime(row.createdAt),
      row.scientificName || row.speciesName,
      row.variantLabel,
      row.invoiceCode,
      row.reason,
    ]
      .filter(Boolean)
      .join(' / '),
    quantity,
    title,
  };
}

function formatKolamCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    currency: 'IDR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(Number(value) || 0);
}

function getStatisticsHealthIntent(tone: string) {
  if (tone === 'positive') {
    return 'success';
  }
  if (tone === 'negative') {
    return 'danger';
  }
  return 'muted';
}

function stripHtmlText(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatDashboardDateTime(value: string) {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

function getLivestockPurposeLabel(value: KolamEnclosureLivestockFilter | string) {
  if (value === 'production') {
    return 'Produksi (indukan)';
  }
  if (value === 'saleable') {
    return 'Stok jual';
  }
  return 'Semua livestock';
}

function getAquariumWaterLabel(value: string) {
  if (!value) {
    return '';
  }
  if (value === 'freshwater') {
    return 'Air tawar';
  }
  if (value === 'marine') {
    return 'Air laut';
  }
  return value;
}

function getSaleStatusLabel(value: string) {
  switch (value) {
    case 'for_sale':
      return 'Siap dijual';
    case 'reserved':
      return 'Direservasi invoice';
    case 'sold':
      return 'Terjual';
    default:
      return 'Belum dijual';
  }
}

function getSaleStatusIntent(
  value: string,
): 'success' | 'warning' | 'danger' | 'muted' {
  switch (value) {
    case 'for_sale':
      return 'success';
    case 'reserved':
      return 'warning';
    case 'sold':
      return 'danger';
    default:
      return 'muted';
  }
}

function getEnclosureStatusIntent(
  status: string,
): 'primary' | 'success' | 'warning' | 'danger' | 'muted' {
  switch (status) {
    case 'active':
      return 'success';
    case 'maintenance':
      return 'warning';
    case 'inactive':
    case 'deleted':
      return 'danger';
    default:
      return 'muted';
  }
}

function formatEnclosureSize(enclosure: KolamEnclosure) {
  const {high, length, width} = enclosure.size;
  const unit = length.unitLabel || width.unitLabel || high.unitLabel;
  const values = [length.value, width.value, high.value].filter(
    value => value > 0,
  );
  return values.length === 3 ? `${values.join(' x ')} ${unit}` : '';
}

const styles = StyleSheet.create({
  surface: {
    gap: 14,
  },
  editFormContent: {
    gap: 14,
    paddingBottom: 24,
  },
  editFormGrid: {
    gap: 12,
  },
  editFormField: {
    gap: 6,
  },
  editFormInput: {
    minWidth: 220,
  },
  editFormTextArea: {
    minHeight: 84,
  },
  editBrandBanner: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 64,
    maxWidth: 400,
    overflow: 'hidden',
  },
  editBrandBannerImage: {
    height: '100%',
    width: '100%',
  },
  editCoverPreview: {
    alignItems: 'center',
    aspectRatio: 16 / 9,
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    maxWidth: 400,
    overflow: 'hidden',
  },
  editCoverImage: {
    height: '100%',
    width: '100%',
  },
  editSizeLockedList: {
    gap: 8,
  },
  errorBadge: {
    alignSelf: 'stretch',
  },
  listRoot: {
    gap: 14,
    overflow: 'visible',
  },
  toolbarWrap: {
    elevation: 1000,
    gap: 10,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
  },
  toolbarButton: {
    flexShrink: 0,
    minHeight: 34,
    paddingHorizontal: 10,
  },
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
  detailRoot: {
    flexGrow: 0,
  },
  detailContent: {
    gap: 14,
    paddingBottom: 24,
  },
  stripCard: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  stripRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  stripItem: {
    gap: 4,
    minWidth: 96,
  },
  stripLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
  },
  stripValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  columns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  columnMain: {
    flex: 2,
    flexBasis: 420,
    gap: 14,
    minWidth: 280,
  },
  columnSide: {
    flex: 1,
    flexBasis: 280,
    gap: 14,
    minWidth: 240,
  },
  detailHeader: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 12,
  },
  detailHeaderPhoto: {
    alignItems: 'center',
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 56,
  },
  detailHeaderPhotoImage: {
    height: 56,
    width: 56,
  },
  detailHeaderCopy: {
    flex: 1,
    gap: 5,
    minWidth: 220,
  },
  detailTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 18,
    fontWeight: '900',
  },
  detailBadgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  detailCode: {
    backgroundColor: V.colors.secondary,
    borderRadius: 6,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  detailActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailTabBar: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 8,
  },
  detailTabButton: {
    minHeight: 34,
  },
  detailOverviewGrid: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  detailMediaPanel: {
    gap: 10,
    maxWidth: 420,
    minWidth: 220,
    width: '100%',
  },
  detailMainPhoto: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  detailMainPhotoImage: {
    height: '100%',
    width: '100%',
  },
  detailThumbRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailThumb: {
    borderRadius: 6,
    height: 58,
    width: 58,
  },
  detailInfoPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 12,
    minWidth: 280,
    padding: 12,
  },
  detailWarningBand: {
    backgroundColor: V.colors.warningSoft,
    borderColor: V.colors.warning,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  detailDangerBand: {
    backgroundColor: V.colors.dangerSoft,
    borderColor: V.colors.danger,
  },
  climateCard: {
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 10,
  },
  detailFieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailField: {
    backgroundColor: V.colors.secondary,
    borderRadius: 6,
    flexGrow: 1,
    minWidth: 150,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  detailFieldLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  detailFieldValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },
  detailSection: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: 280,
  },
  detailSectionHeader: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  detailSectionBody: {
    gap: 8,
    padding: 12,
  },
  detailParagraph: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 19,
  },
  detailTwoColumn: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  detailStatsStack: {
    gap: 14,
  },
  detailSectionIntroRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  detailMiniRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
  },
  detailValueStack: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  detailInlineButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  operationGrid: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  operationInput: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    minHeight: 34,
    minWidth: 180,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  operationInputSmall: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    minHeight: 34,
    minWidth: 110,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  operationInputMultiline: {
    minHeight: 68,
    textAlignVertical: 'top',
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
    top: 88,
    width: 232,
    zIndex: 120000,
  },
  filterPanelScroll: {
    maxHeight: 280,
  },
  filterPanelContent: {
    gap: 4,
  },
  filterPanelOption: {
    justifyContent: 'flex-start',
  },
  filterPanelFooter: {
    alignItems: 'flex-end',
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    marginTop: 6,
    paddingTop: 6,
  },
  tableFrame: {
    minHeight: 0,
    overflow: 'visible',
  },
  emptyWrap: {
    padding: 16,
  },
  paginationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
  },
  listCell: {
    gap: 2,
    justifyContent: 'center',
    minWidth: 0,
  },
  identityCell: {
    alignItems: 'flex-start',
  },
  centerCell: {
    alignItems: 'center',
  },
  centerText: {
    textAlign: 'center',
    width: '100%',
  },
  mainTrackVisible: {
    overflow: 'visible',
  },
  overflowVisible: {
    overflow: 'visible',
    zIndex: 9000,
  },
  picCell: {
    alignItems: 'center',
  },
  picTooltip: {
    alignSelf: 'center',
  },
  activeActionRow: {
    elevation: 30,
    overflow: 'visible',
    zIndex: 1000,
  },
  picAvatar: {
    alignItems: 'center',
    backgroundColor: V.colors.primarySoft,
    borderColor: V.colors.border,
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 32,
  },
  picAvatarImage: {
    borderRadius: 16,
    height: 32,
    width: 32,
  },
  picAvatarText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  photoCell: {
    alignItems: 'center',
  },
  photo: {
    borderRadius: 6,
    height: 40,
    width: 40,
  },
  cell: {
    justifyContent: 'center',
    minWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  primaryCell: {
    flex: 1,
    minWidth: 0,
  },
  statusCell: {
    alignItems: 'center',
    gap: 4,
  },
  centerBadge: {
    alignSelf: 'center',
  },
  actionsTrack: {
    justifyContent: 'center',
  },
  actionCell: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  rowTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '800',
  },
  rowMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  cellText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  cellTextStrong: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  numText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  warningText: {
    color: V.colors.warning,
  },
  dangerText: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  linkText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  codeLinksRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
    minWidth: 0,
  },
  scientificText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontStyle: 'italic',
  },
  mutedText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  badgeTextSm: {
    fontSize: 10,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryGridHero: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dashboardContent: {
    gap: 18,
    paddingBottom: 24,
  },
  deathHistoryPanel: {
    gap: 12,
    minHeight: 0,
  },
  deathHistoryToolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  sectionHeading: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  sectionHeadingCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  sectionMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionAction: {
    flexShrink: 0,
  },
  summaryTile: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 142,
    padding: 12,
  },
  summaryTilePrimary: {
    backgroundColor: V.colors.primarySoft,
    borderColor: V.colors.primary,
  },
  summaryTileWarning: {
    backgroundColor: V.colors.warningSoft,
    borderColor: V.colors.warning,
  },
  summaryTileHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryIcon: {
    alignItems: 'center',
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  summaryIconPrimary: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.primary,
  },
  summaryIconWarning: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.warning,
  },
  summaryIconText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  summaryValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 24,
    fontWeight: '800',
  },
  summaryLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryHint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    marginTop: 4,
  },
  dashboardTableBlock: {
    gap: 8,
  },
  productionStatsCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  productionStatsHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  productionStatsTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '800',
  },
  productionStatsSubtitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    marginTop: 2,
  },
  productionStatsPills: {
    flexDirection: 'row',
    gap: 8,
  },
  productionStatsBody: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productionStatsTablePane: {
    flexBasis: 0,
    flexGrow: 3,
    minWidth: 280,
  },
  productionDiagramPane: {
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flexBasis: 0,
    flexGrow: 1,
    gap: 8,
    minWidth: 160,
    padding: 10,
  },
  productionDiagramTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  productionDiagramSubtitle: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    marginTop: -4,
  },
  productionDiagramList: {
    gap: 8,
  },
  productionDiagramRow: {
    gap: 3,
  },
  productionDiagramLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  productionDiagramTrack: {
    backgroundColor: V.colors.bg,
    borderRadius: 999,
    height: 6,
    overflow: 'hidden',
    width: '100%',
  },
  productionDiagramFill: {
    backgroundColor: V.colors.primary,
    borderRadius: 999,
    height: '100%',
  },
  productionDiagramValue: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  productionDiagramEmpty: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
  },
  productionStatPill: {
    alignItems: 'center',
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 64,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  productionStatPillValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '900',
  },
  productionStatPillLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  productionStatsTable: {
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
  productionStatsTableHead: {
    alignItems: 'center',
    backgroundColor: V.colors.secondary,
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  productionStatsTableRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  productionStatsHeadCell: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  productionStatsColSpecies: {
    flex: 1.4,
    minWidth: 0,
  },
  productionStatsColVariant: {
    flex: 1,
    minWidth: 0,
  },
  productionStatsColQty: {
    flex: 0.7,
    minWidth: 72,
    textAlign: 'right',
  },
  productionStatsColEnc: {
    flex: 0.45,
    minWidth: 40,
    textAlign: 'right',
  },
  productionStatsSpecies: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  productionStatsScientific: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontStyle: 'italic',
  },
  productionStatsCell: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  productionStatsCellStrong: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  dashboardTable: {
    gap: 0,
    overflow: 'visible',
  },
  dashboardPagination: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  variantToggleButton: {
    alignSelf: 'flex-start',
    minHeight: 30,
    paddingHorizontal: 8,
  },
  allocationVariantPanel: {
    backgroundColor: V.colors.secondary,
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  allocationVariantRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    minHeight: 42,
    paddingVertical: 7,
  },
  variantName: {
    flex: 1,
    fontWeight: '700',
    minWidth: 0,
  },
  allocationVariantMetric: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    minWidth: 112,
    textAlign: 'right',
  },
  allocationVariantCodes: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    minWidth: 180,
    width: 220,
  },
  panelList: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
  },
  panelRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  panelRowCopy: {
    flex: 1,
    minWidth: 0,
  },
  qtyText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
});
