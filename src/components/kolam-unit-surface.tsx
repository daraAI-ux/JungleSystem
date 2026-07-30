import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  getUnitTypeLabel,
  type KolamUnit,
  type KolamUnitStatus,
  type KolamUnitType,
} from '../domain/kolam-unit';
import { getKolamFormSection } from '../domain/kolam-form';
import {
  getKolamTableColumns,
  getKolamTableVisualContract,
  type KolamTableColumn,
} from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamUnitController,
  type KolamUnitController,
} from '../hooks/use-kolam-unit-controller';
import { KolamButton } from './kolam-button';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamCheckmarkIcon } from './kolam-checkmark-icon';
import { KolamCopyStack } from './kolam-copy-stack';
import {
  getKolamDataTableColumnStyle,
  KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  KOLAM_DATA_TABLE_COLUMN_GAP,
} from './kolam-data-table-column-style';
import { KolamDataTableHeader } from './kolam-data-table-header';
import { KolamDataTableRowFrame } from './kolam-data-table-row-frame';
import {
  KolamDataTableActionsTrack,
  KolamDataTableMainTrack,
} from './kolam-data-table-tracks';
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import { KolamOverflowMenuButton, KolamTableFooterControls } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import { KolamLabelFieldDetailOverview } from './kolam-label-field-detail-overview';
import { KolamNativeFormSection } from './kolam-native-form-section';
import { KolamSearchField } from './kolam-search-field';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamTableFilterTrigger } from './kolam-table-filter-trigger';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

type UnitSortMode = 'name-asc' | 'name-desc' | 'initial-asc' | 'newest';
type UnitStatusFilter = 'all' | KolamUnitStatus;
type UnitTypeFilter = 'all' | KolamUnitType;
type UnitListFilterPanel = 'sort' | 'status' | 'type';

const UNIT_FILTER_PANEL_WIDTH = 220;

export function KolamUnitSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamUnitController(route);

  return (
    <KolamUnitShell controller={controller} onRouteChange={onRouteChange}>
      {controller.mode === 'list' ? (
        <KolamUnitList controller={controller} onRouteChange={onRouteChange} />
      ) : (
        <KolamUnitDetail controller={controller} />
      )}
    </KolamUnitShell>
  );
}

function KolamUnitShell({
  children,
  controller,
  onRouteChange,
}: {
  children: React.ReactNode;
  controller: KolamUnitController;
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
      ? 'Satuan baru'
      : controller.mode === 'edit'
        ? `Edit · ${controller.selectedUnit?.name || controller.form.name || 'Satuan'}`
        : controller.selectedUnit?.name || 'Detail satuan';

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
            <KolamButton
              disabled={controller.loading}
              label="Refresh"
              onPress={() => {
                void controller.onRefresh();
              }}
            />
            <KolamButton
              label="Daftar"
              onPress={() => {
                controller.onBackToList();
                onRouteChange?.('/units');
              }}
            />
            {controller.mode === 'detail' ? (
              <KolamButton
                intent="primary"
                label="Edit"
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

function KolamUnitList({
  controller,
  onRouteChange,
}: {
  controller: KolamUnitController;
  onRouteChange?: (route: string) => void;
}) {
  const [search, setSearch] = React.useState('');
  const [sortMode, setSortMode] = React.useState<UnitSortMode>('name-asc');
  const [statusFilter, setStatusFilter] =
    React.useState<UnitStatusFilter>('all');
  const [typeFilter, setTypeFilter] = React.useState<UnitTypeFilter>('all');
  const [pageSize, setPageSize] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const [activeFilterPanel, setActiveFilterPanel] =
    React.useState<UnitListFilterPanel | null>(null);
  const [panelAnchor, setPanelAnchor] = React.useState({ left: 0, top: 40 });
  const toolbarRef = React.useRef<View>(null);
  const sortTriggerRef = React.useRef<View>(null);
  const statusTriggerRef = React.useRef<View>(null);
  const typeTriggerRef = React.useRef<View>(null);
  const [deleteCandidate, setDeleteCandidate] =
    React.useState<KolamUnit | null>(null);
  const [tableBodyWidth, setTableBodyWidth] = React.useState(0);
  const filteredUnits = React.useMemo(
    () => filterUnits(controller.units, search, statusFilter, typeFilter),
    [controller.units, search, statusFilter, typeFilter],
  );
  const sortedUnits = React.useMemo(
    () => sortUnits(filteredUnits, sortMode),
    [filteredUnits, sortMode],
  );
  const pageCount = Math.max(1, Math.ceil(sortedUnits.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pagedUnits = sortedUnits.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const listColumns = React.useMemo(
    () => fitUnitListColumns(tableBodyWidth),
    [tableBodyWidth],
  );
  const sortFilterLabel =
    sortMode === 'name-desc'
      ? 'Nama Z-A'
      : sortMode === 'initial-asc'
        ? 'Inisial A-Z'
        : sortMode === 'newest'
          ? 'Terbaru'
          : 'Nama A-Z';
  const statusFilterLabel =
    statusFilter === 'active'
      ? 'Aktif'
      : statusFilter === 'inactive'
        ? 'Nonaktif'
        : 'Semua Status';
  const typeFilterLabel = getUnitTypeFilterLabel(typeFilter);

  const anchorFilterPanel = React.useCallback(
    (panel: UnitListFilterPanel) => {
      const toolbar = toolbarRef.current;
      const trigger =
        panel === 'status'
          ? statusTriggerRef.current
          : panel === 'type'
            ? typeTriggerRef.current
            : sortTriggerRef.current;
      if (!toolbar || !trigger) {
        return;
      }
      toolbar.measureInWindow((toolbarX, toolbarY, toolbarWidth) => {
        trigger.measureInWindow((x, y, _width, height) => {
          const maxLeft = Math.max(0, toolbarWidth - UNIT_FILTER_PANEL_WIDTH);
          const preferredLeft = x - toolbarX;
          setPanelAnchor({
            left: Math.min(Math.max(0, preferredLeft), maxLeft),
            top: y - toolbarY + height + 4,
          });
        });
      });
    },
    [],
  );

  const openFilterPanel = (panel: UnitListFilterPanel) => {
    setActiveFilterPanel(current => {
      const next = current === panel ? null : panel;
      if (next) {
        requestAnimationFrame(() => anchorFilterPanel(next));
      }
      return next;
    });
  };

  React.useEffect(() => {
    setPage(1);
  }, [pageSize, search, sortMode, statusFilter, typeFilter]);

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
                placeholder="Cari satuan..."
                value={search}
              />
              <View ref={sortTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={sortMode !== 'name-asc'}
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
              <View ref={typeTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={typeFilter !== 'all'}
                  label={typeFilterLabel}
                  onPress={() => openFilterPanel('type')}
                  open={activeFilterPanel === 'type'}
                  variant="quiet"
                />
              </View>
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              <KolamButton
                disabled={controller.loading}
                label="Refresh"
                onPress={() => {
                  void controller.onRefresh();
                }}
              />
              <KolamButton
                intent="primary"
                label="Baru"
                onPress={() => {
                  controller.onCreateNew();
                  onRouteChange?.('/units/baru');
                }}
              />
            </View>
          </View>
        </View>
        {activeFilterPanel ? (
          <View
            style={[
              styles.filterOverlayPanel,
              {
                left: panelAnchor.left,
                top: panelAnchor.top,
                width: UNIT_FILTER_PANEL_WIDTH,
              },
            ]}
          >
            {getFilterPanelOptions(activeFilterPanel).map(option => {
              const selected = isFilterOptionSelected(
                activeFilterPanel,
                option.value,
                sortMode,
                statusFilter,
                typeFilter,
              );
              return (
                <KolamInteractionFrame
                  accessibilityLabel={option.label}
                  key={`${activeFilterPanel}-${option.value}`}
                  onPress={() => {
                    if (activeFilterPanel === 'sort') {
                      setSortMode(option.value as UnitSortMode);
                    } else if (activeFilterPanel === 'status') {
                      setStatusFilter(option.value as UnitStatusFilter);
                    } else {
                      setTypeFilter(option.value as UnitTypeFilter);
                    }
                    setActiveFilterPanel(null);
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
      <KolamCatalogListTableShell
        footer={
          <KolamTableFooterControls
            onPageSizeChange={setPageSize}
            page={safePage}
            pageSize={pageSize}
            total={sortedUnits.length}
          >
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
        onBodyWidthChange={setTableBodyWidth}
      >
        <KolamDataTableHeader columns={listColumns} />
        {pagedUnits.length ? (
          pagedUnits.map(unit => (
            <KolamUnitRow
              columns={listColumns}
              key={unit.id}
              onDelete={() => setDeleteCandidate(unit)}
              onEdit={() => {
                void controller.onSelectUnit(unit);
                onRouteChange?.(`${getUnitRoute(unit)}/edit`);
              }}
              onSelect={() => {
                void controller.onSelectUnit(unit);
                onRouteChange?.(getUnitRoute(unit));
              }}
              unit={unit}
            />
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              compact
              message="Data Satuan belum tersedia dari cache atau backend."
              title={
                controller.loading ? 'Memuat satuan...' : 'Belum ada satuan'
              }
            />
          </View>
        )}
      </KolamCatalogListTableShell>
      <KolamDeleteConfirmDialog
        itemLabel={deleteCandidate?.name}
        itemType="satuan"
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => {
          const unit = deleteCandidate;
          setDeleteCandidate(null);

          if (!unit) {
            return;
          }

          void controller.onDeleteUnit(unit).then(deleted => {
            if (deleted) {
              onRouteChange?.('/units');
            }
          });
        }}
        visible={Boolean(deleteCandidate)}
      />
    </View>
  );
}

function KolamUnitRow({
  columns,
  onDelete,
  onEdit,
  onSelect,
  unit,
}: {
  columns: ReturnType<typeof getKolamTableColumns>;
  onDelete: () => void;
  onEdit: () => void;
  onSelect: () => void;
  unit: KolamUnit;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);
  const columnOf = React.useCallback(
    (id: (typeof columns)[number]['id']) =>
      columns.find(column => column.id === id),
    [columns],
  );
  const primaryColumn = columnOf('primary');
  const metaColumn = columnOf('meta');
  const notesColumn = columnOf('notes');
  const childrenColumn = columnOf('children');
  const statusColumn = columnOf('status');
  const actionsColumn = columnOf('actions');

  return (
    <KolamDataTableRowFrame
      style={actionMenuOpen ? styles.activeActionRow : undefined}
    >
      <KolamDataTableMainTrack style={styles.mainTrackVisible}>
        <Pressable
          accessibilityRole="button"
          onPress={onSelect}
          style={[
            styles.listCell,
            styles.identityCell,
            primaryColumn ? getKolamDataTableColumnStyle(primaryColumn) : null,
          ]}
        >
          <KolamCopyStack
            items={[
              { id: 'name', text: unit.name || '-', style: styles.rowTitle },
              {
                id: 'category',
                text: unit.category || 'Satuan pengukuran',
                style: styles.rowMeta,
              },
            ]}
          />
        </Pressable>
        <View
          style={[
            styles.listCell,
            metaColumn ? getKolamDataTableColumnStyle(metaColumn) : null,
          ]}
        >
          <View style={styles.initialChip}>
            <Text numberOfLines={1} style={styles.initialText}>
              {unit.initial || '-'}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.listCell,
            notesColumn ? getKolamDataTableColumnStyle(notesColumn) : null,
          ]}
        >
          <KolamStatusBadge
            intent={getUnitTypeIntent(unit.type)}
            label={getUnitTypeLabel(unit.type)}
            style={styles.centerBadge}
          />
        </View>
        <View
          style={[
            styles.listCell,
            childrenColumn ? getKolamDataTableColumnStyle(childrenColumn) : null,
          ]}
        >
          <KolamStatusBadge
            intent={unit.isBase ? 'success' : 'muted'}
            label={unit.isBase ? 'Ya' : 'Tidak'}
            style={styles.centerBadge}
          />
        </View>
        <View
          style={[
            styles.listCell,
            statusColumn ? getKolamDataTableColumnStyle(statusColumn) : null,
          ]}
        >
          <KolamStatusBadge
            intent={unit.status === 'active' ? 'success' : 'warning'}
            label={getUnitStatusLabel(unit.status)}
            style={styles.centerBadge}
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
          accessibilityLabel={`Menu ${unit.name}`}
          actions={[
            { label: 'Lihat', onPress: onSelect },
            { label: 'Rubah', onPress: onEdit },
            { label: 'Hapus', onPress: onDelete, tone: 'danger' },
          ]}
          onOpenChange={setActionMenuOpen}
        />
      </KolamDataTableActionsTrack>
    </KolamDataTableRowFrame>
  );
}

function KolamUnitDetail({ controller }: { controller: KolamUnitController }) {
  const unit = controller.selectedUnit;
  const editable = controller.isEditable;

  if (!unit && controller.mode !== 'new') {
    return (
      <KolamEmptyState
        message="Pilih salah satu satuan dari daftar untuk melihat detail."
        title="Belum ada satuan dipilih"
      />
    );
  }

  return (
    <View style={styles.stack}>
      {!editable && unit ? (
        <KolamLabelFieldDetailOverview
          hero={<UnitHero unit={unit} />}
          meta={[
            { label: 'Nama', value: unit.name },
            { label: 'Simbol/Inisial', value: unit.initial || '-' },
            { label: 'Tipe', value: getUnitTypeLabel(unit.type) },
            { label: 'Kategori', value: unit.category || '-' },
            { label: 'Satuan Dasar', value: unit.isBase ? 'Ya' : 'Tidak' },
            ...(unit.createdAt
              ? [{ label: 'Dibuat', value: formatDateTime(unit.createdAt) }]
              : []),
            ...(unit.updatedAt
              ? [
                  {
                    label: 'Diperbarui',
                    value: formatDateTime(unit.updatedAt),
                  },
                ]
              : []),
          ]}
          metrics={[
            { label: 'Inisial', value: unit.initial || '-' },
            { label: 'Tipe', value: getUnitTypeLabel(unit.type) },
            { label: 'Dasar', value: unit.isBase ? 1 : 0 },
          ]}
          sections={[
            {
              description: 'Metadata satuan dari backend Kolam',
              emptyText: 'Tidak ada metadata tambahan',
              items: [
                { title: `ID: ${unit.id}` },
                { title: `Status: ${getUnitStatusLabel(unit.status)}` },
                ...(unit.category
                  ? [{ title: `Kategori: ${unit.category}` }]
                  : []),
              ],
              title: 'Metadata',
              total: unit.category ? 3 : 2,
            },
          ]}
          status={{
            intent: unit.status === 'active' ? 'success' : 'warning',
            label: getUnitStatusLabel(unit.status),
          }}
        />
      ) : (
        <KolamUnitForm controller={controller} />
      )}
    </View>
  );
}

function KolamUnitForm({ controller }: { controller: KolamUnitController }) {
  const form = controller.form;

  return (
    <KolamNativeFormSection section={getKolamFormSection('unit-detail')}>
      <View style={settingsWebFormStyles.settingsWebFormFields}>
        <View style={settingsWebFormStyles.settingsWebFormFieldsGrid}>
          <View style={styles.formSplitRow}>
            <View style={styles.formSplitCell}>
              <FieldShell label="Nama" required>
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={name => controller.onChangeForm({ name })}
                  placeholder="contoh: kilogram"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.name}
                />
              </FieldShell>
            </View>
            <View style={styles.formSplitCell}>
              <FieldShell label="Simbol/Inisial" required>
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={initial => controller.onChangeForm({ initial })}
                  placeholder="contoh: kg"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.initial}
                />
              </FieldShell>
            </View>
          </View>
        </View>
        <View style={styles.formActions}>
          <KolamButton
            disabled={controller.saving}
            label="Batal"
            onPress={controller.onBackToList}
          />
          <KolamButton
            disabled={controller.saving}
            intent="primary"
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

function UnitHero({ unit }: { unit: KolamUnit }) {
  return (
    <View style={styles.unitHero}>
      <KolamCopyStack
        items={[
          {
            id: 'initial',
            text: unit.initial || '-',
            style: styles.heroInitial,
          },
          { id: 'name', text: unit.name, style: styles.heroName },
        ]}
      />
    </View>
  );
}

function fitUnitListColumns(containerWidth: number): KolamTableColumn[] {
  const base = getKolamTableColumns('unit');
  if (containerWidth <= 0) {
    return base;
  }

  const gap = KOLAM_DATA_TABLE_COLUMN_GAP;
  const paddingX = getKolamTableVisualContract().body.cellPaddingX * 2;
  const actionsWidth = KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH;
  const gapsTotal = gap * Math.max(0, base.length - 1);
  const contentBudget = Math.max(
    0,
    containerWidth - paddingX - gapsTotal - actionsWidth,
  );
  const contentColumns = base.filter(column => column.id !== 'actions');
  const equalWidth = Math.max(
    72,
    Math.floor(contentBudget / Math.max(1, contentColumns.length)),
  );
  let remainder = contentBudget - equalWidth * contentColumns.length;
  const lastContentId = contentColumns[contentColumns.length - 1]?.id;

  return base.map(column => {
    if (column.id === 'actions') {
      return { ...column, width: actionsWidth };
    }

    const extra = column.id === lastContentId ? remainder : 0;
    if (column.id === lastContentId) {
      remainder = 0;
    }

    return {
      ...column,
      width: equalWidth + extra,
    };
  });
}

function getUnitTypeFilterLabel(typeFilter: UnitTypeFilter) {
  switch (typeFilter) {
    case 'weight':
      return 'Berat';
    case 'volume':
      return 'Volume';
    case 'length':
      return 'Panjang';
    case 'area':
      return 'Luas';
    case 'other':
      return 'Lainnya';
    case 'all':
    default:
      return 'Semua Tipe';
  }
}

function getFilterPanelOptions(panel: UnitListFilterPanel) {
  if (panel === 'sort') {
    return [
      { label: 'Nama A-Z', value: 'name-asc' as UnitSortMode },
      { label: 'Nama Z-A', value: 'name-desc' as UnitSortMode },
      { label: 'Inisial A-Z', value: 'initial-asc' as UnitSortMode },
      { label: 'Terbaru', value: 'newest' as UnitSortMode },
    ];
  }

  if (panel === 'status') {
    return [
      { label: 'Semua Status', value: 'all' as UnitStatusFilter },
      { label: 'Aktif', value: 'active' as UnitStatusFilter },
      { label: 'Nonaktif', value: 'inactive' as UnitStatusFilter },
    ];
  }

  return [
    { label: 'Semua Tipe', value: 'all' as UnitTypeFilter },
    { label: 'Berat', value: 'weight' as UnitTypeFilter },
    { label: 'Volume', value: 'volume' as UnitTypeFilter },
    { label: 'Panjang', value: 'length' as UnitTypeFilter },
    { label: 'Luas', value: 'area' as UnitTypeFilter },
    { label: 'Lainnya', value: 'other' as UnitTypeFilter },
  ];
}

function isFilterOptionSelected(
  panel: UnitListFilterPanel,
  value: string,
  sortMode: UnitSortMode,
  statusFilter: UnitStatusFilter,
  typeFilter: UnitTypeFilter,
) {
  if (panel === 'sort') {
    return value === sortMode;
  }

  if (panel === 'status') {
    return value === statusFilter;
  }

  return value === typeFilter;
}

function filterUnits(
  units: KolamUnit[],
  search: string,
  statusFilter: UnitStatusFilter,
  typeFilter: UnitTypeFilter,
) {
  const query = search.trim().toLowerCase();
  const list = Array.isArray(units) ? units : [];

  return list.filter(unit => {
    if (statusFilter !== 'all' && unit.status !== statusFilter) {
      return false;
    }

    if (typeFilter !== 'all' && unit.type !== typeFilter) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [unit.name, unit.initial, unit.category, getUnitTypeLabel(unit.type)]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });
}

function sortUnits(units: KolamUnit[], sortMode: UnitSortMode) {
  const list = Array.isArray(units) ? [...units] : [];

  return list.sort((left, right) => {
    const leftName = left.name || '';
    const rightName = right.name || '';
    const leftInitial = left.initial || '';
    const rightInitial = right.initial || '';

    if (sortMode === 'newest') {
      return (
        getUnitTime(right) - getUnitTime(left) ||
        leftName.localeCompare(rightName)
      );
    }

    if (sortMode === 'initial-asc') {
      return (
        leftInitial.localeCompare(rightInitial) ||
        leftName.localeCompare(rightName)
      );
    }

    return sortMode === 'name-desc'
      ? rightName.localeCompare(leftName)
      : leftName.localeCompare(rightName);
  });
}

function getUnitTime(unit: KolamUnit) {
  const timestamp = Date.parse(unit.createdAt ?? unit.updatedAt ?? '');
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getUnitRoute(unit: KolamUnit) {
  return `/units/${encodeURIComponent(unit.name || unit.id)}`;
}

function getUnitStatusLabel(status: KolamUnitStatus) {
  return status === 'inactive' ? 'Nonaktif' : 'Aktif';
}

function getUnitTypeIntent(type: KolamUnitType | null) {
  switch (type) {
    case 'weight':
      return 'primary';
    case 'volume':
      return 'info';
    case 'length':
      return 'warning';
    case 'area':
      return 'outline';
    case 'other':
    default:
      return 'muted';
  }
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

const styles = StyleSheet.create({
  surface: {
    flexGrow: 1,
    gap: 14,
    minHeight: 0,
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
    flexGrow: 1,
    gap: 14,
    minHeight: 0,
  },
  emptyWrap: {
    minHeight: 220,
    justifyContent: 'center',
  },
  activeActionRow: {
    zIndex: 1000,
    elevation: 30,
    overflow: 'visible',
  },
  mainTrackVisible: {
    overflow: 'visible',
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
  initialChip: {
    minHeight: 28,
    minWidth: 58,
    alignSelf: 'center',
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: V.colors.secondary,
  },
  initialText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  centerBadge: {
    alignSelf: 'center',
  },
  actionsTrack: {
    alignItems: 'center',
  },
  paginationRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  pageLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
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
  unitHero: {
    width: 168,
    minHeight: 96,
    gap: 8,
    padding: 14,
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
    justifyContent: 'center',
  },
  heroInitial: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 28,
    fontWeight: '900',
  },
  heroName: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
  },
  formSplitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 14,
  },
  formSplitCell: {
    minWidth: 260,
    flex: 1,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 16,
  },
});
