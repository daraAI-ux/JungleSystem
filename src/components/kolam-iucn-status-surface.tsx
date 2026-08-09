import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  getIucnConservationInfo,
  getIucnStatusLabel,
  type KolamIucnSpeciesUsageItem,
  type KolamIucnStatus,
  type KolamIucnStatusState,
} from '../domain/kolam-iucn-status';
import { getKolamFormSection } from '../domain/kolam-form';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamIucnStatusController,
  type KolamIucnStatusController,
} from '../hooks/use-kolam-iucn-status-controller';
import { KolamButton } from './kolam-button';
import {KolamCancelButton} from './kolam-cancel-button';
import {KolamSaveButton} from './kolam-save-button';
import {KolamDaftarButton} from './kolam-daftar-button';
import {KolamEditButton} from './kolam-edit-button';
import { KolamCheckmarkIcon } from './kolam-checkmark-icon';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import { KolamTableRowActionMenu } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import { KolamNativeFormSection } from './kolam-native-form-section';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamSearchField } from './kolam-search-field';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamStatusBadge } from './kolam-status-badge';
import {
  measureFilterPanelAnchor,
  type KolamFilterPanelAnchor,
} from './kolam-filter-panel-anchor';
import { KolamTableFilterTrigger } from './kolam-table-filter-trigger';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

type IucnSortMode = 'order-asc' | 'name-asc' | 'name-desc' | 'newest';
type IucnStatusFilter = 'all' | KolamIucnStatusState;
type IucnImageFilter = 'all' | 'with-image' | 'without-image';
type IucnListFilterPanel = 'sort' | 'status' | 'image';

const IUCN_FILTER_PANEL_WIDTH = 220;

export function KolamIucnStatusSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamIucnStatusController(route);

  return (
    <KolamIucnShell controller={controller} onRouteChange={onRouteChange}>
      {controller.mode === 'list' ? (
        <KolamIucnList controller={controller} onRouteChange={onRouteChange} />
      ) : (
        <KolamIucnDetail controller={controller} />
      )}
    </KolamIucnShell>
  );
}

function KolamIucnShell({
  children,
  controller,
  onRouteChange,
}: {
  children: React.ReactNode;
  controller: KolamIucnStatusController;
  onRouteChange?: (route: string) => void;
}) {
  if (controller.mode === 'list') {
    return (
      <View style={styles.surface}>
        {controller.error ? (
          <KolamStatusBadge
            intent="danger"
            label={controller.error}
            numberOfLines={2}
            style={styles.errorBadge}
          />
        ) : null}
        {children}
      </View>
    );
  }

  const contextLabel =
    controller.mode === 'new'
      ? 'Status IUCN baru'
      : controller.mode === 'edit'
      ? `Edit · ${
          controller.selectedItem?.name || controller.form.name || 'Status IUCN'
        }`
      : controller.selectedItem?.name || 'Detail status IUCN';

  return (
    <View style={styles.surface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text numberOfLines={1} style={styles.detailToolbarContext}>
              {contextLabel}
            </Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamDaftarButton
              onPress={() => {
                controller.onBackToList();
                onRouteChange?.('/iucn-status');
              }}
            />
            {controller.mode === 'detail' ? (
              <KolamEditButton
                intent="primary"
                onPress={controller.onEdit}
              />
            ) : null}
          </View>
        </View>
      </View>
      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={2}
          style={styles.errorBadge}
        />
      ) : null}
      {children}
    </View>
  );
}

function KolamIucnList({
  controller,
  onRouteChange,
}: {
  controller: KolamIucnStatusController;
  onRouteChange?: (route: string) => void;
}) {
  const [search, setSearch] = React.useState('');
  const [sortMode, setSortMode] = React.useState<IucnSortMode>('order-asc');
  const [statusFilter, setStatusFilter] =
    React.useState<IucnStatusFilter>('all');
  const [imageFilter, setImageFilter] = React.useState<IucnImageFilter>('all');
  const pageSize = 10;
  const [page, setPage] = React.useState(1);
  const [activeFilterPanel, setActiveFilterPanel] =
    React.useState<IucnListFilterPanel | null>(null);
  const [panelAnchor, setPanelAnchor] =
    React.useState<KolamFilterPanelAnchor | null>(null);
  const toolbarRef = React.useRef<View>(null);
  const sortTriggerRef = React.useRef<View>(null);
  const statusTriggerRef = React.useRef<View>(null);
  const imageTriggerRef = React.useRef<View>(null);
  const [deleteCandidate, setDeleteCandidate] =
    React.useState<KolamIucnStatus | null>(null);
  const filteredItems = React.useMemo(
    () => filterIucnItems(controller.items, search, statusFilter, imageFilter),
    [controller.items, imageFilter, search, statusFilter],
  );
  const sortedItems = React.useMemo(
    () => sortIucnItems(filteredItems, sortMode),
    [filteredItems, sortMode],
  );
  const pageCount = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pagedItems = sortedItems.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const listColumns = React.useMemo<
    Array<KolamListTableColumn<KolamIucnStatus>>
  >(() => buildIucnStatusListColumns(), []);
  const sortFilterLabel =
    sortMode === 'name-asc'
      ? 'Nama A-Z'
      : sortMode === 'name-desc'
      ? 'Nama Z-A'
      : sortMode === 'newest'
      ? 'Terbaru'
      : 'Urutan IUCN';
  const statusFilterLabel =
    statusFilter === 'active'
      ? 'Aktif'
      : statusFilter === 'inactive'
      ? 'Nonaktif'
      : 'Semua Status';
  const imageFilterLabel =
    imageFilter === 'with-image'
      ? 'Dengan gambar'
      : imageFilter === 'without-image'
      ? 'Tanpa gambar'
      : 'Semua Gambar';

  const getFilterTriggerRef = (panel: IucnListFilterPanel) => {
    switch (panel) {
      case 'status':
        return statusTriggerRef;
      case 'image':
        return imageTriggerRef;
      case 'sort':
      default:
        return sortTriggerRef;
    }
  };

  const anchorFilterPanel = React.useCallback((panel: IucnListFilterPanel) => {
    measureFilterPanelAnchor(
      toolbarRef.current,
      getFilterTriggerRef(panel).current,
      IUCN_FILTER_PANEL_WIDTH,
      setPanelAnchor,
    );
  }, []);

  const openFilterPanel = (panel: IucnListFilterPanel) => {
    if (activeFilterPanel === panel) {
      setActiveFilterPanel(null);
      setPanelAnchor(null);
      return;
    }
    setActiveFilterPanel(null);
    setPanelAnchor(null);
    requestAnimationFrame(() => {
      measureFilterPanelAnchor(
        toolbarRef.current,
        getFilterTriggerRef(panel).current,
        IUCN_FILTER_PANEL_WIDTH,
        anchor => {
          setPanelAnchor(anchor);
          setActiveFilterPanel(panel);
        },
      );
    });
  };

  React.useEffect(() => {
    setPage(1);
  }, [imageFilter, search, sortMode, statusFilter]);

  React.useEffect(() => {
    if (!activeFilterPanel) {
      return;
    }
    requestAnimationFrame(() => anchorFilterPanel(activeFilterPanel));
  }, [activeFilterPanel, anchorFilterPanel]);

  return (
    <View style={styles.stack}>
      <View ref={toolbarRef} collapsable={false} style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              <KolamSearchField
                containerStyle={kolamTableToolbarStyles.searchInput}
                onChangeText={setSearch}
                placeholder="Cari status IUCN..."
                value={search}
              />
              <View ref={sortTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={sortMode !== 'order-asc'}
                  label={sortFilterLabel}
                  onPress={() => openFilterPanel('sort')}
                  open={activeFilterPanel === 'sort'}
                  variant="quiet"
                />
              </View>
              <View ref={statusTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={statusFilter !== 'all'}
                  label={statusFilterLabel}
                  onPress={() => openFilterPanel('status')}
                  open={activeFilterPanel === 'status'}
                  variant="quiet"
                />
              </View>
              <View ref={imageTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={imageFilter !== 'all'}
                  label={imageFilterLabel}
                  onPress={() => openFilterPanel('image')}
                  open={activeFilterPanel === 'image'}
                  variant="quiet"
                />
              </View>
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              <KolamButton
                intent="primary"
                label="Baru"
                tone="positive"
                onPress={() => {
                  controller.onCreateNew();
                  onRouteChange?.('/iucn-status/baru');
                }}
              />
            </View>
          </View>
        </View>
        {activeFilterPanel && panelAnchor ? (
          <View
            style={[
              styles.filterOverlayPanel,
              {
                left: panelAnchor.left,
                top: panelAnchor.top,
                width: IUCN_FILTER_PANEL_WIDTH,
              },
            ]}
          >
            {getFilterPanelOptions(activeFilterPanel).map(option => {
              const selected = isFilterOptionSelected(
                activeFilterPanel,
                option.value,
                sortMode,
                statusFilter,
                imageFilter,
              );
              return (
                <KolamInteractionFrame
                  accessibilityLabel={option.label}
                  key={`${activeFilterPanel}-${option.value}`}
                  onPress={() => {
                    if (activeFilterPanel === 'sort') {
                      setSortMode(option.value as IucnSortMode);
                    } else if (activeFilterPanel === 'status') {
                      setStatusFilter(option.value as IucnStatusFilter);
                    } else {
                      setImageFilter(option.value as IucnImageFilter);
                    }
                    setActiveFilterPanel(null);
                    setPanelAnchor(null);
                  }}
                  selected={selected}
                  style={[
                    styles.filterMenuItem,
                    selected ? styles.filterMenuItemSelected : null,
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.filterMenuItemLabel,
                      selected ? styles.filterMenuItemLabelSelected : null,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {selected ? (
                    <KolamCheckmarkIcon color={V.colors.primary} size="sm" />
                  ) : (
                    <View style={styles.filterMenuItemCheckSpacer} />
                  )}
                </KolamInteractionFrame>
              );
            })}
          </View>
        ) : null}
      </View>
      <KolamListTableComposition
        columns={listColumns}
        emptyTitle={
          controller.loading ? 'Memuat status IUCN...' : 'Belum ada status IUCN'
        }
        getRowKey={item => item.id}
        loading={controller.loading}
        pagination={{
          onPageChange: setPage,
          page: safePage,
          pageSize,
          total: sortedItems.length,
        }}
        renderActions={item => (
          <KolamIucnActionsMenu
            item={item}
            onDelete={() => setDeleteCandidate(item)}
            onEdit={() => {
              void controller.onSelectItem(item);
              onRouteChange?.(`${getIucnRoute(item)}/edit`);
            }}
            onSelect={() => {
              void controller.onSelectItem(item);
              onRouteChange?.(getIucnRoute(item));
            }}
          />
        )}
        rows={pagedItems}
      />
      <KolamDeleteConfirmDialog
        itemLabel={deleteCandidate?.name}
        itemType="status IUCN"
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => {
          const item = deleteCandidate;
          setDeleteCandidate(null);

          if (!item) {
            return;
          }

          void controller.onDeleteItem(item).then(deleted => {
            if (deleted) {
              onRouteChange?.('/iucn-status');
            }
          });
        }}
        visible={Boolean(deleteCandidate)}
      />
    </View>
  );
}

function buildIucnStatusListColumns(): Array<
  KolamListTableColumn<KolamIucnStatus>
> {
  return [
    {
      align: 'center',
      flex: 0.7,
      id: 'meta',
      label: 'Gambar',
      render: item => <IucnImageBadge item={item} size="small" />,
    },
    {
      align: 'center',
      flex: 0.72,
      id: 'children',
      label: 'Kode',
      render: item => <IucnAbbreviationCell item={item} />,
    },
    {
      flex: 1.35,
      id: 'primary',
      label: 'Status IUCN',
      render: item => <IucnIdentityCell item={item} />,
    },
    {
      align: 'center',
      flex: 0.62,
      id: 'amount',
      label: 'Urutan',
      render: item => (
        <Text numberOfLines={1} style={styles.countText}>
          {String(item.order)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.82,
      id: 'status',
      label: 'Status',
      render: item => (
        <KolamStatusBadge
          intent={item.status === 'active' ? 'success' : 'warning'}
          label={getIucnStatusLabel(item.status)}
          style={styles.centerBadge}
        />
      ),
    },
  ];
}

function IucnAbbreviationCell({ item }: { item: KolamIucnStatus }) {
  const info = getIucnConservationInfo(item.abbreviation);

  return (
    <View style={[styles.abbreviationBadge, { borderColor: info.color }]}>
      <Text numberOfLines={1} style={styles.abbreviationText}>
        {item.abbreviation || '-'}
      </Text>
    </View>
  );
}

function IucnIdentityCell({ item }: { item: KolamIucnStatus }) {
  const info = getIucnConservationInfo(item.abbreviation);

  return (
    <View style={styles.iucnTableIdentityCell}>
      <KolamCopyStack
        containerStyle={styles.identityCopy}
        items={[
          { id: 'name', text: item.name, style: styles.rowTitle },
          {
            id: 'label',
            text: info.label || '-',
            style: styles.rowMeta,
            textProps: { ellipsizeMode: 'tail', numberOfLines: 1 },
          },
        ]}
      />
    </View>
  );
}

function KolamIucnActionsMenu({
  item,
  onDelete,
  onEdit,
  onSelect,
}: {
  item: KolamIucnStatus;
  onDelete: () => void;
  onEdit: () => void;
  onSelect: () => void;
}) {
  return (
    <KolamTableRowActionMenu
      accessibilityLabel={`Menu ${item.name}`}
      actions={[
        { label: 'Lihat', onPress: onSelect },
        { label: 'Rubah', onPress: onEdit },
        { label: 'Hapus', onPress: onDelete, tone: 'danger' },
      ]}
    />
  );
}

function KolamIucnDetail({
  controller,
}: {
  controller: KolamIucnStatusController;
}) {
  const item = controller.selectedItem;
  const editable = controller.isEditable;

  if (!item && controller.mode !== 'new') {
    return (
      <KolamEmptyState
        message="Pilih salah satu status IUCN dari daftar untuk melihat detail."
        title="Belum ada status IUCN dipilih"
      />
    );
  }

  return (
    <View style={styles.stack}>
      {!editable && item ? (
        <IucnStatusDetailReadOnly item={item} />
      ) : (
        <KolamIucnForm controller={controller} />
      )}
    </View>
  );
}

function IucnStatusDetailReadOnly({ item }: { item: KolamIucnStatus }) {
  const conservation = getIucnConservationInfo(item.abbreviation);
  const infoRows = [
    { label: 'Singkatan', value: item.abbreviation || '-' },
    { label: 'Label IUCN', value: conservation.label || item.name || '-' },
    {
      label: 'Gambar',
      value: item.image ? 'Tersimpan lokal/cache' : 'Belum ada gambar',
    },
    ...(item.createdBy ? [{ label: 'Pembuat', value: item.createdBy }] : []),
    ...(item.updatedAt
      ? [{ label: 'Diperbarui', value: formatDateTime(item.updatedAt) }]
      : []),
    { label: 'Urutan', value: String(item.order) },
    { label: 'Species', value: String(item.species.length) },
  ];

  return (
    <View style={styles.detailStack}>
      <View style={styles.detailTopRow}>
        <View style={styles.detailInfoPanel}>
          <Text style={styles.detailPanelTitle}>Informasi IUCN</Text>
          <View style={styles.detailInfoBody}>
            <IucnHero item={item} />
            <View style={styles.detailInfoMeta}>
              <KolamStatusBadge
                intent={item.status === 'active' ? 'success' : 'warning'}
                label={getIucnStatusLabel(item.status)}
                style={styles.detailStatusBadge}
              />
              {infoRows.map(row => (
                <Text
                  key={row.label}
                  numberOfLines={2}
                  style={styles.detailMetaText}
                >
                  {row.label}: {row.value}
                </Text>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.detailConservationPanel}>
          <Text style={styles.detailPanelTitle}>Konservasi</Text>
          <Text style={styles.detailPanelDescription}>
            Keterangan status konservasi berdasarkan singkatan IUCN.
          </Text>
          <View style={styles.conservationBody}>
            <Text
              style={[styles.conservationAbbr, { color: conservation.color }]}
            >
              {item.abbreviation || '-'}
            </Text>
            <Text style={styles.conservationLabel}>
              {conservation.label || item.name || '-'}
            </Text>
            {conservation.description ? (
              <Text style={styles.conservationDescription}>
                {conservation.description}
              </Text>
            ) : (
              <Text style={styles.detailEmptyText}>
                Belum ada keterangan konservasi.
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.speciesPanel}>
        <Text style={styles.detailPanelTitle}>
          Spesies ({item.species.length})
        </Text>
        <Text style={styles.detailPanelDescription}>
          Spesies yang diklasifikasikan dengan status IUCN ini.
        </Text>
        {item.species.length ? (
          <View style={styles.speciesCardGrid}>
            {item.species.map(species => (
              <IucnSpeciesCard key={species.id} species={species} />
            ))}
          </View>
        ) : (
          <Text style={styles.detailEmptyText}>
            Belum ada spesies dengan status ini.
          </Text>
        )}
      </View>
    </View>
  );
}

function IucnSpeciesCard({ species }: { species: KolamIucnSpeciesUsageItem }) {
  const name =
    species.scientificName || species.commonName || species.id || '-';

  return (
    <View style={styles.speciesCard}>
      <View style={styles.speciesCardPhoto}>
        <KolamRemoteImage
          accessibilityLabel={`Foto ${name}`}
          resizeMode="cover"
          revision={species.photoUri ?? species.id}
          scope="species"
          sourceUri={species.photoUri}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <Text numberOfLines={2} style={styles.speciesCardName}>
        {name}
      </Text>
    </View>
  );
}

function KolamIucnForm({
  controller,
}: {
  controller: KolamIucnStatusController;
}) {
  const form = controller.form;

  return (
    <KolamNativeFormSection section={getKolamFormSection('iucn-status-detail')}>
      <View style={settingsWebFormStyles.settingsWebFormFields}>
        <View style={settingsWebFormStyles.settingsWebFormFieldsGrid}>
          <View style={styles.formSplitRow}>
            <View style={styles.formSplitCell}>
              <FieldShell label="Nama" required>
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={name => controller.onChangeForm({ name })}
                  placeholder="mis. Risiko Rendah"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.name}
                />
              </FieldShell>
            </View>
            <View style={styles.formSplitCell}>
              <FieldShell label="Singkatan" required>
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={abbreviation =>
                    controller.onChangeForm({
                      abbreviation: abbreviation.toUpperCase(),
                    })
                  }
                  placeholder="mis. LC"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.abbreviation}
                />
              </FieldShell>
            </View>
          </View>
          <FieldShell label="Status" required>
            <View style={styles.segmentRow}>
              {(['active', 'inactive'] as KolamIucnStatusState[]).map(
                status => (
                  <KolamButton
                    intent={form.status === status ? 'primary' : 'outline'}
                    key={status}
                    label={getIucnStatusLabel(status)}
                    onPress={() => controller.onChangeForm({ status })}
                  />
                ),
              )}
            </View>
          </FieldShell>
          <FieldShell label="Gambar Badge">
            <View style={styles.imagePickerRow}>
              <KolamFormTextField
                editable={!controller.saving}
                mode="url"
                onChangeText={imageLocalUri =>
                  controller.onChangeForm({ imageLocalUri })
                }
                placeholder="Pilih file gambar dari komputer"
                style={[
                  settingsWebFormStyles.settingsWebFormFieldValue,
                  styles.imagePickerInput,
                ]}
                value={form.imageLocalUri}
              />
              <KolamButton
                disabled={controller.saving}
                label="Pilih Gambar"
                onPress={() => {
                  void controller.onPickImage();
                }}
              />
            </View>
          </FieldShell>
        </View>
        <View style={styles.formActions}>
          <KolamCancelButton
            disabled={controller.saving}
            onPress={controller.onBackToList}
          />
          <KolamSaveButton
            disabled={controller.saving}
            label={controller.saving ? 'Menyimpan...' : 'Simpan'}
            onPress={() => {
              void controller.onSave();
            }}
          />
        </View>
      </View>
    </KolamNativeFormSection>
  );
}

function FieldShell({
  children,
  label,
  required = false,
}: {
  children: React.ReactNode;
  label: string;
  required?: boolean;
}) {
  return (
    <View style={settingsWebFormStyles.settingsWebFormField}>
      <KolamSettingsWebFieldLabel label={label} required={required} />
      {children}
    </View>
  );
}

function IucnImageBadge({
  item,
  size,
}: {
  item: KolamIucnStatus;
  size: 'small' | 'large';
}) {
  const sizeStyle = size === 'large' ? styles.imageLarge : styles.imageSmall;

  return (
    <View style={[styles.imageBox, sizeStyle]}>
      <KolamRemoteImage
        accessibilityLabel={`Gambar ${item.abbreviation}`}
        resizeMode="contain"
        revision={item.updatedAt ?? item.image ?? undefined}
        scope="iucn-status"
        sourceUri={item.imageUri}
        style={StyleSheet.absoluteFill}
      />
      {!item.imageUri ? (
        <KolamCopyStack
          items={[
            {
              id: 'abbr',
              text: item.abbreviation || '-',
              style: styles.imageFallbackText,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

function IucnHero({ item }: { item: KolamIucnStatus }) {
  const info = getIucnConservationInfo(item.abbreviation);

  return (
    <View style={styles.heroWrap}>
      <IucnImageBadge item={item} size="large" />
      <KolamCopyStack
        items={[
          {
            id: 'abbr',
            text: item.abbreviation || '-',
            style: [styles.heroAbbr, { color: info.color }],
          },
          { id: 'name', text: item.name, style: styles.heroName },
        ]}
      />
    </View>
  );
}

function getIucnRoute(item: KolamIucnStatus) {
  return `/iucn-status/${encodeURIComponent(
    item.abbreviation || item.name || item.id,
  )}`;
}

function getFilterPanelOptions(panel: IucnListFilterPanel) {
  if (panel === 'sort') {
    return [
      { label: 'Urutan IUCN', value: 'order-asc' as IucnSortMode },
      { label: 'Nama A-Z', value: 'name-asc' as IucnSortMode },
      { label: 'Nama Z-A', value: 'name-desc' as IucnSortMode },
      { label: 'Terbaru', value: 'newest' as IucnSortMode },
    ];
  }

  if (panel === 'status') {
    return [
      { label: 'Semua Status', value: 'all' as IucnStatusFilter },
      { label: 'Aktif', value: 'active' as IucnStatusFilter },
      { label: 'Nonaktif', value: 'inactive' as IucnStatusFilter },
    ];
  }

  return [
    { label: 'Semua Gambar', value: 'all' as IucnImageFilter },
    { label: 'Dengan gambar', value: 'with-image' as IucnImageFilter },
    { label: 'Tanpa gambar', value: 'without-image' as IucnImageFilter },
  ];
}

function isFilterOptionSelected(
  panel: IucnListFilterPanel,
  value: string,
  sortMode: IucnSortMode,
  statusFilter: IucnStatusFilter,
  imageFilter: IucnImageFilter,
) {
  if (panel === 'sort') {
    return value === sortMode;
  }

  if (panel === 'status') {
    return value === statusFilter;
  }

  return value === imageFilter;
}

function filterIucnItems(
  items: KolamIucnStatus[],
  search: string,
  statusFilter: IucnStatusFilter,
  imageFilter: IucnImageFilter,
) {
  const query = search.trim().toLowerCase();

  return items.filter(item => {
    const matchesSearch = query
      ? [
          item.name,
          item.abbreviation,
          getIucnConservationInfo(item.abbreviation).label,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query)
      : true;
    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter;
    const matchesImage =
      imageFilter === 'all' ||
      (imageFilter === 'with-image' ? Boolean(item.image) : !item.image);

    return matchesSearch && matchesStatus && matchesImage;
  });
}

function sortIucnItems(items: KolamIucnStatus[], sortMode: IucnSortMode) {
  const next = [...items];
  switch (sortMode) {
    case 'name-desc':
      return next.sort((left, right) => right.name.localeCompare(left.name));
    case 'name-asc':
      return next.sort((left, right) => left.name.localeCompare(right.name));
    case 'newest':
      return next.sort((left, right) =>
        String(right.updatedAt ?? '').localeCompare(
          String(left.updatedAt ?? ''),
        ),
      );
    case 'order-asc':
    default:
      return next.sort(
        (left, right) =>
          left.order - right.order || left.name.localeCompare(right.name),
      );
  }
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const styles = StyleSheet.create({
  surface: {
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
  errorBadge: {
    alignSelf: 'flex-start',
    maxWidth: 760,
  },
  stack: {
    gap: 14,
  },
  iucnTableIdentityCell: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    overflow: 'visible',
    width: '100%',
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'left',
  },
  rowMeta: {
    marginTop: 2,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'left',
  },
  abbreviationBadge: {
    alignSelf: 'center',
    minWidth: 46,
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  abbreviationText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  countText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    width: '100%',
  },
  centerBadge: {
    alignSelf: 'center',
  },
  iucnActionMenuRaised: {
    elevation: 30,
    zIndex: 1000,
  },
  toolbarWrap: {
    elevation: 1000,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
  },
  filterOverlayPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    elevation: 1200,
    gap: 2,
    padding: 6,
    position: 'absolute',
    shadowColor: V.colors.fg,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    zIndex: 120000,
  },
  filterMenuItem: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    minHeight: 36,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  filterMenuItemSelected: {
    backgroundColor: V.colors.primarySoft,
  },
  filterMenuItemLabel: {
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  filterMenuItemLabelSelected: {
    color: V.colors.primary,
    fontWeight: '800',
  },
  filterMenuItemCheckSpacer: {
    height: 14,
    width: 14,
  },
  formSplitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formSplitCell: {
    minWidth: 260,
    flex: 1,
  },
  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imagePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  imagePickerInput: {
    flex: 1,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  imageBox: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imageSmall: {
    width: 38,
    height: 38,
  },
  imageLarge: {
    width: 84,
    height: 84,
  },
  imageFallbackText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  heroWrap: {
    width: 160,
    gap: 10,
  },
  heroAbbr: {
    fontFamily: V.fontFamily,
    fontSize: 22,
    fontWeight: '900',
  },
  heroName: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '900',
  },
  detailStack: {
    gap: 16,
  },
  detailTopRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  detailInfoPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    gap: 12,
    minWidth: 320,
    padding: 16,
  },
  detailConservationPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    gap: 8,
    minWidth: 280,
    padding: 16,
  },
  detailPanelTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '900',
  },
  detailPanelDescription: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  detailInfoBody: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailInfoMeta: {
    flex: 1,
    gap: 8,
    minWidth: 180,
  },
  detailStatusBadge: {
    alignSelf: 'flex-start',
  },
  detailMetaText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  conservationBody: {
    gap: 8,
    marginTop: 4,
  },
  conservationAbbr: {
    fontFamily: V.fontFamily,
    fontSize: 28,
    fontWeight: '900',
  },
  conservationLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '900',
  },
  conservationDescription: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
  },
  detailEmptyText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  speciesPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  speciesCardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  speciesCard: {
    backgroundColor: V.colors.secondary,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 10,
    width: 120,
  },
  speciesCardPhoto: {
    alignSelf: 'center',
    backgroundColor: V.colors.muted,
    borderRadius: 8,
    height: 72,
    overflow: 'hidden',
    width: 72,
  },
  speciesCardName: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
});
