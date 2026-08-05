import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  getCustomFieldTypeLabel,
  type KolamCustomField,
  type KolamCustomFieldStatus,
  type KolamCustomFieldType,
} from '../domain/kolam-custom-field';
import { getKolamFormSection } from '../domain/kolam-form';
import {
  countActiveLocaleAuditItems,
  createCustomFieldLocaleAuditItems,
} from '../domain/kolam-locale-audit';
import {
  getKolamTableColumns,
  getKolamTableVisualContract,
  type KolamTableColumn,
} from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamCustomFieldController,
  type KolamCustomFieldController,
} from '../hooks/use-kolam-custom-field-controller';
import { KolamButton } from './kolam-button';
import { KolamRefreshButton } from './kolam-refresh-button';
import { KolamCatalogTranslationsEditor } from './kolam-catalog-translations-editor';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamCheckmarkIcon } from './kolam-checkmark-icon';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamCustomFieldIcon } from './kolam-custom-field-icon';
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
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import { KolamLabelFieldDetailOverview } from './kolam-label-field-detail-overview';
import { KolamNativeFormSection } from './kolam-native-form-section';
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

type CustomFieldSortMode = 'label-asc' | 'label-desc' | 'order' | 'newest';
type CustomFieldStatusFilter = 'all' | KolamCustomFieldStatus;
type CustomFieldTypeFilter = 'all' | KolamCustomFieldType;
type CustomFieldListFilterPanel = 'sort' | 'status' | 'type';

const CUSTOM_FIELD_FILTER_PANEL_WIDTH = 220;

export function KolamCustomFieldSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamCustomFieldController(route);

  return (
    <KolamCustomFieldShell
      controller={controller}
      onRouteChange={onRouteChange}
    >
      {controller.mode === 'list' ? (
        <KolamCustomFieldList
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : (
        <KolamCustomFieldDetail controller={controller} />
      )}
    </KolamCustomFieldShell>
  );
}

function KolamCustomFieldShell({
  children,
  controller,
  onRouteChange,
}: {
  children: React.ReactNode;
  controller: KolamCustomFieldController;
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
      ? 'Field kustom baru'
      : controller.mode === 'edit'
        ? `Edit · ${controller.selectedField?.fieldLabel || controller.form.fieldLabel || 'Field Kustom'}`
        : controller.selectedField?.fieldLabel || 'Detail field kustom';

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
            <KolamRefreshButton
              accessibilityLabel="Refresh"
              disabled={controller.loading}

              onPress={() => {
                void controller.onRefresh();
              }}
            />
            <KolamButton
              label="Daftar"
              onPress={() => {
                controller.onBackToList();
                onRouteChange?.('/custom-fields');
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

function KolamCustomFieldList({
  controller,
  onRouteChange,
}: {
  controller: KolamCustomFieldController;
  onRouteChange?: (route: string) => void;
}) {
  const [search, setSearch] = React.useState('');
  const [sortMode, setSortMode] =
    React.useState<CustomFieldSortMode>('label-asc');
  const [statusFilter, setStatusFilter] =
    React.useState<CustomFieldStatusFilter>('all');
  const [typeFilter, setTypeFilter] =
    React.useState<CustomFieldTypeFilter>('all');
  const [pageSize, setPageSize] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const [activeFilterPanel, setActiveFilterPanel] =
    React.useState<CustomFieldListFilterPanel | null>(null);
  const [panelAnchor, setPanelAnchor] =
    React.useState<KolamFilterPanelAnchor | null>(null);
  const toolbarRef = React.useRef<View>(null);
  const sortTriggerRef = React.useRef<View>(null);
  const statusTriggerRef = React.useRef<View>(null);
  const typeTriggerRef = React.useRef<View>(null);
  const [deleteCandidate, setDeleteCandidate] =
    React.useState<KolamCustomField | null>(null);
  const [tableBodyWidth, setTableBodyWidth] = React.useState(0);
  const filteredFields = React.useMemo(
    () => filterFields(controller.fields, search, statusFilter, typeFilter),
    [controller.fields, search, statusFilter, typeFilter],
  );
  const sortedFields = React.useMemo(
    () => sortFields(filteredFields, sortMode),
    [filteredFields, sortMode],
  );
  const pageCount = Math.max(1, Math.ceil(sortedFields.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pagedFields = sortedFields.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const listColumns = React.useMemo(
    () => fitCustomFieldListColumns(tableBodyWidth),
    [tableBodyWidth],
  );
  const sortFilterLabel =
    sortMode === 'label-desc'
      ? 'Label Z-A'
      : sortMode === 'order'
        ? 'Urutan Field'
        : sortMode === 'newest'
          ? 'Terbaru'
          : 'Label A-Z';
  const statusFilterLabel =
    statusFilter === 'active'
      ? 'Aktif'
      : statusFilter === 'inactive'
        ? 'Nonaktif'
        : 'Semua Status';
  const typeFilterLabel = getCustomFieldTypeFilterLabel(typeFilter);

  const getFilterTriggerRef = (panel: CustomFieldListFilterPanel) => {
    switch (panel) {
      case 'status':
        return statusTriggerRef;
      case 'type':
        return typeTriggerRef;
      case 'sort':
      default:
        return sortTriggerRef;
    }
  };

  const anchorFilterPanel = React.useCallback(
    (panel: CustomFieldListFilterPanel) => {
      measureFilterPanelAnchor(
        toolbarRef.current,
        getFilterTriggerRef(panel).current,
        CUSTOM_FIELD_FILTER_PANEL_WIDTH,
        setPanelAnchor,
      );
    },
    [],
  );

  const openFilterPanel = (panel: CustomFieldListFilterPanel) => {
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
        CUSTOM_FIELD_FILTER_PANEL_WIDTH,
        anchor => {
          setPanelAnchor(anchor);
          setActiveFilterPanel(panel);
        },
      );
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
                placeholder="Cari field kustom..."
                value={search}
              />
              <View ref={sortTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={sortMode !== 'label-asc'}
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
              <KolamRefreshButton
                accessibilityLabel="Refresh"
                disabled={controller.loading}

                onPress={() => {
                  void controller.onRefresh();
                }}
              />
              <KolamButton
                intent="primary"
                label="Baru"
                onPress={() => {
                  controller.onCreateNew();
                  onRouteChange?.('/custom-fields/baru');
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
                width: CUSTOM_FIELD_FILTER_PANEL_WIDTH,
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
                      setSortMode(option.value as CustomFieldSortMode);
                    } else if (activeFilterPanel === 'status') {
                      setStatusFilter(option.value as CustomFieldStatusFilter);
                    } else {
                      setTypeFilter(option.value as CustomFieldTypeFilter);
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
      <KolamCatalogListTableShell
        footer={
          <KolamTableFooterControls
            onPageSizeChange={setPageSize}
            page={safePage}
            pageSize={pageSize}
            total={sortedFields.length}
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
        {pagedFields.length ? (
          pagedFields.map(field => (
            <KolamCustomFieldRow
              columns={listColumns}
              field={field}
              key={field.id}
              onDelete={() => setDeleteCandidate(field)}
              onEdit={() => {
                void controller.onSelectField(field);
                onRouteChange?.(`${getFieldRoute(field)}/edit`);
              }}
              onSelect={() => {
                void controller.onSelectField(field);
                onRouteChange?.(getFieldRoute(field));
              }}
              onSetStatus={status => {
                void controller.onSetFieldStatus(field, status);
              }}
            />
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              compact
              message="Data Field Kustom belum tersedia dari cache atau backend."
              title={
                controller.loading
                  ? 'Memuat field kustom...'
                  : 'Belum ada field'
              }
            />
          </View>
        )}
      </KolamCatalogListTableShell>
      <KolamDeleteConfirmDialog
        itemLabel={deleteCandidate?.fieldLabel}
        itemType="field kustom"
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => {
          const field = deleteCandidate;
          setDeleteCandidate(null);

          if (!field) {
            return;
          }

          void controller.onDeleteField(field).then(deleted => {
            if (deleted) {
              onRouteChange?.('/custom-fields');
            }
          });
        }}
        visible={Boolean(deleteCandidate)}
      />
    </View>
  );
}

function KolamCustomFieldRow({
  columns,
  field,
  onDelete,
  onEdit,
  onSelect,
  onSetStatus,
}: {
  columns: ReturnType<typeof getKolamTableColumns>;
  field: KolamCustomField;
  onDelete: () => void;
  onEdit: () => void;
  onSelect: () => void;
  onSetStatus: (status: KolamCustomFieldStatus) => void;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);
  const isInactive = field.status === 'inactive';
  const columnOf = React.useCallback(
    (id: (typeof columns)[number]['id']) =>
      columns.find(column => column.id === id),
    [columns],
  );
  const primaryColumn = columnOf('primary');
  const metaColumn = columnOf('meta');
  const notesColumn = columnOf('notes');
  const childrenColumn = columnOf('children');
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
            styles.identityCell,
            primaryColumn ? getKolamDataTableColumnStyle(primaryColumn) : null,
          ]}
        >
          <View style={styles.identity}>
            <KolamCustomFieldIcon field={field} />
            <KolamCopyStack
              containerStyle={styles.identityCopy}
              items={[
                { id: 'name', text: field.fieldLabel, style: styles.rowTitle },
                {
                  id: 'desc',
                  text: stripHtmlForDetail(field.description) || '-',
                  style: styles.rowMeta,
                  textProps: {
                    ellipsizeMode: 'tail',
                    numberOfLines: 1,
                  },
                },
              ]}
            />
          </View>
        </View>
        <View
          style={[
            styles.listCell,
            metaColumn ? getKolamDataTableColumnStyle(metaColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.keyText}>
            {field.fieldKey}
          </Text>
        </View>
        <View
          style={[
            styles.listCell,
            notesColumn ? getKolamDataTableColumnStyle(notesColumn) : null,
          ]}
        >
          <KolamStatusBadge
            intent="muted"
            label={getCustomFieldTypeLabel(field.fieldType)}
            style={styles.typeBadge}
          />
        </View>
        <View
          style={[
            styles.listCell,
            childrenColumn ? getKolamDataTableColumnStyle(childrenColumn) : null,
          ]}
        >
          <Text numberOfLines={2} style={styles.rulesText}>
            {getFieldRulesLabel(field)}
          </Text>
        </View>
        <View
          style={[
            styles.listCell,
            amountColumn ? getKolamDataTableColumnStyle(amountColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.orderText}>
            {String(field.order)}
          </Text>
        </View>
        <View
          style={[
            styles.listCell,
            statusColumn ? getKolamDataTableColumnStyle(statusColumn) : null,
          ]}
        >
          <KolamStatusBadge
            intent={field.status === 'active' ? 'success' : 'warning'}
            label={getFieldStatusLabel(field.status)}
            style={styles.statusBadge}
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
          accessibilityLabel={`Menu ${field.fieldLabel}`}
          actions={[
            { label: 'Lihat', onPress: onSelect },
            { label: 'Rubah', onPress: onEdit },
            {
              label: isInactive ? 'Pulihkan' : 'Nonaktifkan',
              onPress: () => onSetStatus(isInactive ? 'active' : 'inactive'),
            },
            { label: 'Hapus', onPress: onDelete, tone: 'danger' },
          ]}
          onOpenChange={setActionMenuOpen}
        />
      </KolamDataTableActionsTrack>
    </KolamDataTableRowFrame>
  );
}

function KolamCustomFieldDetail({
  controller,
}: {
  controller: KolamCustomFieldController;
}) {
  const field = controller.selectedField;
  const editable = controller.isEditable;
  const localeAuditItems = field
    ? createCustomFieldLocaleAuditItems({
        description: field.description,
        fieldLabel: field.fieldLabel,
        options: field.options,
        translations: field.translations,
      })
    : [];

  if (!field && controller.mode !== 'new') {
    return (
      <KolamEmptyState
        message="Pilih salah satu field kustom dari daftar untuk melihat detail."
        title="Belum ada field dipilih"
      />
    );
  }

  return (
    <View style={styles.stack}>
      {!editable && field ? (
        <>
          <KolamLabelFieldDetailOverview
            hero={<KolamCustomFieldIcon field={field} variant="detail" />}
            meta={[
              { label: 'Kunci', value: field.fieldKey },
              {
                label: 'Tipe',
                value: getCustomFieldTypeLabel(field.fieldType),
              },
              { label: 'Aturan', value: getFieldRulesLabel(field) },

              ...(field.updatedAt
                ? [
                    {
                      label: 'Diperbarui',
                      value: formatDateTime(field.updatedAt),
                    },
                  ]
                : []),
            ]}
            metrics={[
              { label: 'Urutan', value: field.order },
              { label: 'Opsi', value: field.options.length },
              { label: 'Wajib', value: field.required ? 1 : 0 },
            ]}
            sections={[
              {
                accordion: true,
                description:
                  'Audit isi locale field kustom yang tersimpan lokal dan siap dikirim ke backend.',
                emptyText: 'Belum ada data locale untuk diaudit.',
                items: localeAuditItems,
                title: 'Terjemahan',
                total: countActiveLocaleAuditItems(localeAuditItems),
              },
              {
                description: 'Nilai yang tersedia untuk tipe pilihan',
                emptyText: 'Tidak ada opsi khusus',
                items: field.options.map(option => ({
                  title: option,
                })),
                title: 'Opsi',
                total: field.options.length,
              },
              {
                description: 'Konfigurasi teknis field kustom',
                emptyText: 'Belum ada aturan tambahan',
                items: getFieldRuleItems(field),
                title: 'Aturan',
                total: getFieldRuleItems(field).length,
              },
            ]}
            status={{
              intent: field.status === 'active' ? 'success' : 'warning',
              label: getFieldStatusLabel(field.status),
            }}
          />
        </>
      ) : (
        <KolamCustomFieldForm controller={controller} />
      )}
    </View>
  );
}

function KolamCustomFieldForm({
  controller,
}: {
  controller: KolamCustomFieldController;
}) {
  const form = controller.form;
  const numericLike = form.fieldType === 'number' || form.fieldType === 'range';

  return (
    <KolamNativeFormSection
      section={getKolamFormSection('custom-field-detail')}
    >
      <View style={settingsWebFormStyles.settingsWebFormFields}>
        <View style={settingsWebFormStyles.settingsWebFormFieldsGrid}>
          <FieldShell label="Kunci Field" required>
            <KolamFormTextField
              editable={!controller.saving}
              onChangeText={fieldKey => controller.onChangeForm({ fieldKey })}
              placeholder="contoh: panjang_tubuh"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={form.fieldKey}
            />
          </FieldShell>
          <FieldShell label="Tipe Field" required>
            <KolamDropdownSelect<KolamCustomFieldType>
              label="Tipe"
              onChange={fieldType =>
                controller.onChangeForm({
                  fieldType,
                  hasMinMax:
                    fieldType === 'number' || fieldType === 'range'
                      ? form.hasMinMax
                      : false,
                  requiresUnit:
                    fieldType === 'number' || fieldType === 'range'
                      ? form.requiresUnit
                      : false,
                })
              }
              options={[
                { label: 'Teks', value: 'string' },
                { label: 'Angka', value: 'number' },
                { label: 'Ya/Tidak', value: 'boolean' },
                { label: 'Rentang', value: 'range' },
                { label: 'Pilihan', value: 'select' },
              ]}
              value={form.fieldType}
            />
          </FieldShell>
          <FieldShell label="Status" required>
            <View style={styles.segmentRow}>
              {(['active', 'inactive'] as KolamCustomFieldStatus[]).map(
                status => (
                  <KolamButton
                    intent={form.status === status ? 'primary' : 'outline'}
                    key={status}
                    label={getFieldStatusLabel(status)}
                    onPress={() => controller.onChangeForm({ status })}
                  />
                ),
              )}
            </View>
          </FieldShell>
          <FieldShell label="Urutan">
            <KolamFormTextField
              editable={!controller.saving}
              keyboardType="numeric"
              onChangeText={order => controller.onChangeForm({ order })}
              placeholder="0"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={form.order}
            />
          </FieldShell>
          <FieldShell label="Field Wajib">
            <View style={styles.segmentRow}>
              <KolamButton
                intent={form.required ? 'primary' : 'outline'}
                label="Ya"
                onPress={() => controller.onChangeForm({ required: true })}
              />
              <KolamButton
                intent={!form.required ? 'primary' : 'outline'}
                label="Tidak"
                onPress={() => controller.onChangeForm({ required: false })}
              />
            </View>
          </FieldShell>
          {numericLike ? (
            <>
              <FieldShell label="Memerlukan Satuan">
                <View style={styles.segmentRow}>
                  <KolamButton
                    intent={form.requiresUnit ? 'primary' : 'outline'}
                    label="Ya"
                    onPress={() =>
                      controller.onChangeForm({ requiresUnit: true })
                    }
                  />
                  <KolamButton
                    intent={!form.requiresUnit ? 'primary' : 'outline'}
                    label="Tidak"
                    onPress={() =>
                      controller.onChangeForm({
                        requiresUnit: false,
                        unitId: '',
                      })
                    }
                  />
                </View>
              </FieldShell>
              {form.requiresUnit ? (
                <FieldShell label="Satuan" required>
                  <KolamDropdownSelect<string>
                    label="Satuan"
                    onChange={unitId => controller.onChangeForm({ unitId })}
                    options={controller.units.map(unit => ({
                      label: unit.initial
                        ? `${unit.name} (${unit.initial})`
                        : unit.name,
                      value: unit.id,
                    }))}
                    value={form.unitId}
                  />
                </FieldShell>
              ) : null}
              <FieldShell label="Aktifkan Min/Max">
                <View style={styles.segmentRow}>
                  <KolamButton
                    intent={form.hasMinMax ? 'primary' : 'outline'}
                    label="Ya"
                    onPress={() => controller.onChangeForm({ hasMinMax: true })}
                  />
                  <KolamButton
                    intent={!form.hasMinMax ? 'primary' : 'outline'}
                    label="Tidak"
                    onPress={() =>
                      controller.onChangeForm({
                        hasMinMax: false,
                        maxAllowed: '',
                        minAllowed: '',
                      })
                    }
                  />
                </View>
              </FieldShell>
              {form.hasMinMax ? (
                <View style={styles.formSplitRow}>
                  <View style={styles.formSplitCell}>
                    <FieldShell label="Min Diizinkan">
                      <KolamFormTextField
                        editable={!controller.saving}
                        keyboardType="numeric"
                        onChangeText={minAllowed =>
                          controller.onChangeForm({ minAllowed })
                        }
                        style={settingsWebFormStyles.settingsWebFormFieldValue}
                        value={form.minAllowed}
                      />
                    </FieldShell>
                  </View>
                  <View style={styles.formSplitCell}>
                    <FieldShell label="Max Diizinkan">
                      <KolamFormTextField
                        editable={!controller.saving}
                        keyboardType="numeric"
                        onChangeText={maxAllowed =>
                          controller.onChangeForm({ maxAllowed })
                        }
                        style={settingsWebFormStyles.settingsWebFormFieldValue}
                        value={form.maxAllowed}
                      />
                    </FieldShell>
                  </View>
                </View>
              ) : null}
            </>
          ) : null}
          <FieldShell label="Nilai Default">
            {form.fieldType === 'boolean' ? (
              <View style={styles.segmentRow}>
                <KolamButton
                  intent={form.defaultBoolean ? 'primary' : 'outline'}
                  label="Ya"
                  onPress={() =>
                    controller.onChangeForm({ defaultBoolean: true })
                  }
                />
                <KolamButton
                  intent={!form.defaultBoolean ? 'primary' : 'outline'}
                  label="Tidak"
                  onPress={() =>
                    controller.onChangeForm({ defaultBoolean: false })
                  }
                />
              </View>
            ) : (
              <KolamFormTextField
                editable={!controller.saving}
                keyboardType={numericLike ? 'numeric' : 'default'}
                onChangeText={defaultValueText =>
                  controller.onChangeForm({ defaultValueText })
                }
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={form.defaultValueText}
              />
            )}
          </FieldShell>
          <FieldShell label="Icon">
            <View style={styles.iconPickerRow}>
              <KolamButton
                disabled={controller.saving}
                label="Pilih Icon"
                onPress={() => {
                  void controller.onPickIcon();
                }}
              />
              <KolamCopyStack
                containerStyle={styles.iconPathCopy}
                items={[
                  {
                    id: 'path',
                    text:
                      form.iconLocalUri ||
                      form.iconRemoteUrl ||
                      'Belum ada icon dipilih',
                    style: styles.iconPathText,
                    textProps: { numberOfLines: 1 },
                  },
                ]}
              />
            </View>
          </FieldShell>
          <KolamCatalogTranslationsEditor
            editable={!controller.saving}
            kind="custom-field"
            onChange={translations => controller.onChangeForm({ translations })}
            primary={{
              fieldLabel: form.fieldLabel,
              description: form.description,
              optionsText: form.optionsText,
              onChange: patch => controller.onChangeForm(patch),
            }}
            showOptions={form.fieldType === 'select'}
            translations={form.translations}
          />
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

function fitCustomFieldListColumns(containerWidth: number): KolamTableColumn[] {
  const base = getKolamTableColumns('custom-field');
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

function getCustomFieldTypeFilterLabel(typeFilter: CustomFieldTypeFilter) {
  switch (typeFilter) {
    case 'string':
      return 'Teks';
    case 'number':
      return 'Angka';
    case 'boolean':
      return 'Ya/Tidak';
    case 'range':
      return 'Rentang';
    case 'select':
      return 'Pilihan';
    case 'all':
    default:
      return 'Semua Tipe';
  }
}

function getFilterPanelOptions(panel: CustomFieldListFilterPanel) {
  if (panel === 'sort') {
    return [
      { label: 'Label A-Z', value: 'label-asc' as CustomFieldSortMode },
      { label: 'Label Z-A', value: 'label-desc' as CustomFieldSortMode },
      { label: 'Urutan Field', value: 'order' as CustomFieldSortMode },
      { label: 'Terbaru', value: 'newest' as CustomFieldSortMode },
    ];
  }

  if (panel === 'status') {
    return [
      { label: 'Semua Status', value: 'all' as CustomFieldStatusFilter },
      { label: 'Aktif', value: 'active' as CustomFieldStatusFilter },
      { label: 'Nonaktif', value: 'inactive' as CustomFieldStatusFilter },
    ];
  }

  return [
    { label: 'Semua Tipe', value: 'all' as CustomFieldTypeFilter },
    { label: 'Teks', value: 'string' as CustomFieldTypeFilter },
    { label: 'Angka', value: 'number' as CustomFieldTypeFilter },
    { label: 'Ya/Tidak', value: 'boolean' as CustomFieldTypeFilter },
    { label: 'Rentang', value: 'range' as CustomFieldTypeFilter },
    { label: 'Pilihan', value: 'select' as CustomFieldTypeFilter },
  ];
}

function isFilterOptionSelected(
  panel: CustomFieldListFilterPanel,
  value: string,
  sortMode: CustomFieldSortMode,
  statusFilter: CustomFieldStatusFilter,
  typeFilter: CustomFieldTypeFilter,
) {
  if (panel === 'sort') {
    return value === sortMode;
  }

  if (panel === 'status') {
    return value === statusFilter;
  }

  return value === typeFilter;
}

function filterFields(
  fields: KolamCustomField[],
  search: string,
  statusFilter: CustomFieldStatusFilter,
  typeFilter: CustomFieldTypeFilter,
) {
  const query = search.trim().toLowerCase();

  return fields.filter(field => {
    if (statusFilter !== 'all' && field.status !== statusFilter) {
      return false;
    }

    if (typeFilter !== 'all' && field.fieldType !== typeFilter) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [
      field.fieldLabel,
      field.fieldKey,
      field.description,
      field.unitLabel,
      field.options.join(' '),
    ]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });
}

function sortFields(fields: KolamCustomField[], sortMode: CustomFieldSortMode) {
  return [...fields].sort((left, right) => {
    if (sortMode === 'newest') {
      return (
        getFieldTime(right) - getFieldTime(left) ||
        left.fieldLabel.localeCompare(right.fieldLabel)
      );
    }

    if (sortMode === 'order') {
      return (
        left.order - right.order ||
        left.fieldLabel.localeCompare(right.fieldLabel)
      );
    }

    return sortMode === 'label-desc'
      ? right.fieldLabel.localeCompare(left.fieldLabel)
      : left.fieldLabel.localeCompare(right.fieldLabel);
  });
}

function getFieldTime(field: KolamCustomField) {
  const timestamp = Date.parse(field.createdAt ?? field.updatedAt ?? '');
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getFieldRoute(field: KolamCustomField) {
  const routeKey = field.fieldLabel || field.fieldKey || field.id;
  return `/custom-fields/${encodeURIComponent(routeKey)}`;
}

function getFieldStatusLabel(status: KolamCustomFieldStatus) {
  return status === 'inactive' ? 'Nonaktif' : 'Aktif';
}

function getFieldRulesLabel(field: KolamCustomField) {
  const rules = [field.required ? 'Wajib' : 'Opsional'];

  if (field.requiresUnit && field.unitLabel) {
    rules.push(`Satuan: ${field.unitLabel}`);
  }

  if (field.hasMinMax) {
    rules.push(
      `Min/Max: ${formatMaybeNumber(field.minAllowed)} - ${formatMaybeNumber(
        field.maxAllowed,
      )}`,
    );
  }

  if (field.fieldType === 'select') {
    rules.push(`${field.options.length} opsi`);
  }

  return rules.join(' - ');
}

function getFieldRuleItems(field: KolamCustomField) {
  return [
    { title: field.required ? 'Wajib diisi' : 'Opsional' },
    ...(field.requiresUnit
      ? [{ title: `Satuan: ${field.unitLabel || field.unitId || '-'}` }]
      : []),
    ...(field.hasMinMax
      ? [
          {
            title: `Min/Max: ${formatMaybeNumber(
              field.minAllowed,
            )} - ${formatMaybeNumber(field.maxAllowed)}`,
          },
        ]
      : []),
    ...(field.defaultValue == null || field.defaultValue === ''
      ? []
      : [{ title: `Default: ${String(field.defaultValue)}` }]),
  ];
}

function formatMaybeNumber(value: number | null) {
  return value == null ? '-' : String(value);
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

function stripHtmlForDetail(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
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
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: '100%',
    minWidth: 0,
  },
  identityCopy: {
    minWidth: 0,
    flex: 1,
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
  keyText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },
  typeBadge: {
    alignSelf: 'center',
  },
  rulesText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    textAlign: 'center',
    width: '100%',
  },
  orderText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },
  statusBadge: {
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
  segmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
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
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  iconPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconPathCopy: {
    minWidth: 0,
    flex: 1,
  },
  iconPathText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 16,
  },
});
