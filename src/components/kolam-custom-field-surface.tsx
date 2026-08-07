import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  getCustomFieldTypeLabel,
  type KolamCustomField,
  type KolamCustomFieldStatus,
  type KolamCustomFieldType,
} from '../domain/kolam-custom-field';
import { getKolamFormSection } from '../domain/kolam-form';
import { createCustomFieldLocaleAuditItems } from '../domain/kolam-locale-audit';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamCustomFieldController,
  type KolamCustomFieldController,
} from '../hooks/use-kolam-custom-field-controller';
import { KolamButton } from './kolam-button';
import {KolamCancelButton} from './kolam-cancel-button';
import {KolamSaveButton} from './kolam-save-button';
import {KolamDaftarButton} from './kolam-daftar-button';
import {KolamEditButton} from './kolam-edit-button';
import { KolamCatalogTranslationsEditor } from './kolam-catalog-translations-editor';
import { KolamCheckmarkIcon } from './kolam-checkmark-icon';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamCustomFieldIcon } from './kolam-custom-field-icon';
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import { KolamDetailSummaryCard } from './kolam-detail-summary-card';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import { KolamNativeFormSection } from './kolam-native-form-section';
import { KolamSearchField } from './kolam-search-field';
import { KolamSettingsWebFileField } from './kolam-settings-web-file-field';
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


  return (
    <View style={styles.surface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters} />
          <View style={kolamTableToolbarStyles.actions}>
            {controller.mode === 'detail' ? (
              <>
                <KolamDaftarButton
                  onPress={() => {
                    controller.onBackToList();
                    onRouteChange?.('/custom-fields');
                  }}
                />
                <KolamEditButton
                  intent="primary"
                  onPress={controller.onEdit}
                />
              </>
            ) : (
              <>
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
              </>
            )}
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
  const pageSize = 10;
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
  const listColumns = React.useMemo<
    Array<KolamListTableColumn<KolamCustomField>>
  >(() => buildCustomFieldListColumns(), []);
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
  }, [search, sortMode, statusFilter, typeFilter]);

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
              <KolamButton
                intent="primary"
                label="Baru"
                tone="positive"
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
      <KolamListTableComposition
        columns={listColumns}
        emptyTitle={
          controller.loading ? 'Memuat field kustom...' : 'Belum ada field'
        }
        getRowKey={field => field.id}
        loading={controller.loading}
        pagination={{
          onPageChange: setPage,
          page: safePage,
          pageSize,
          total: sortedFields.length,
        }}
        renderActions={field => (
          <KolamCustomFieldActionsMenu
            field={field}
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
        )}
        rows={pagedFields}
      />
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

function buildCustomFieldListColumns(): Array<
  KolamListTableColumn<KolamCustomField>
> {
  return [
    {
      flex: 1.22,
      id: 'primary',
      label: 'Label Field',
      render: field => <KolamCustomFieldIdentityCell field={field} />,
    },
    {
      align: 'center',
      flex: 0.95,
      id: 'meta',
      label: 'Kunci',
      render: field => (
        <Text numberOfLines={1} style={styles.keyText}>
          {field.fieldKey}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.85,
      id: 'notes',
      label: 'Tipe',
      render: field => (
        <KolamStatusBadge
          intent="muted"
          label={getCustomFieldTypeLabel(field.fieldType)}
          style={styles.typeBadge}
        />
      ),
    },
    {
      align: 'center',
      flex: 1.18,
      id: 'children',
      label: 'Aturan',
      render: field => (
        <Text numberOfLines={2} style={styles.rulesText}>
          {getFieldRulesLabel(field)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.62,
      id: 'amount',
      label: 'Urutan',
      render: field => (
        <Text numberOfLines={1} style={styles.orderText}>
          {String(field.order)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.82,
      id: 'status',
      label: 'Status',
      render: field => (
        <KolamStatusBadge
          intent={field.status === 'active' ? 'success' : 'warning'}
          label={getFieldStatusLabel(field.status)}
          style={styles.statusBadge}
        />
      ),
    },
  ];
}

function KolamCustomFieldIdentityCell({ field }: { field: KolamCustomField }) {
  return (
    <View style={styles.customFieldTableIdentityCell}>
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
  );
}

function KolamCustomFieldActionsMenu({
  field,
  onDelete,
  onEdit,
  onSelect,
  onSetStatus,
}: {
  field: KolamCustomField;
  onDelete: () => void;
  onEdit: () => void;
  onSelect: () => void;
  onSetStatus: (status: KolamCustomFieldStatus) => void;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);
  const isInactive = field.status === 'inactive';

  return (
    <View style={actionMenuOpen ? styles.customFieldActionMenuRaised : null}>
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
    </View>
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
          <KolamDetailSummaryCard
            body={
              field.description ? (
                <Text style={styles.customFieldSummaryDescription}>
                  {stripHtmlForDetail(field.description)}
                </Text>
              ) : undefined
            }
            bodyTitle={field.description ? 'Deskripsi' : undefined}
            fieldColumns={3}
            fields={[
              {
                id: 'status',
                label: 'Status',
                value: (
                  <KolamStatusBadge
                    intent={field.status === 'active' ? 'success' : 'warning'}
                    label={getFieldStatusLabel(field.status)}
                  />
                ),
              },
              { id: 'key', label: 'Kunci', value: field.fieldKey },
              {
                id: 'type',
                label: 'Tipe',
                value: getCustomFieldTypeLabel(field.fieldType),
              },
              { id: 'order', label: 'Urutan', value: field.order },
              { id: 'options', label: 'Opsi', value: field.options.length },
              {
                id: 'required',
                label: 'Wajib',
                value: field.required ? 'Ya' : 'Tidak',
              },
              { id: 'rules', label: 'Aturan', value: getFieldRulesLabel(field) },
              ...(field.updatedAt
                ? [
                    {
                      id: 'updated',
                      label: 'Diperbarui',
                      value: formatDateTime(field.updatedAt),
                    },
                  ]
                : []),
            ]}
            leading={
              <View style={styles.customFieldSummaryIconInCard}>
                <KolamCustomFieldIcon field={field} variant="detail" />
              </View>
            }
            leadingStyle={styles.customFieldSummaryLeadingSlot}
            title="Ringkasan field kustom"
          />

          <CustomFieldLocaleSummaryCard items={localeAuditItems} />

          <View style={styles.customFieldSummaryGrid}>
            <CustomFieldSummarySectionCard
              description="Nilai yang tersedia untuk tipe pilihan"
              emptyText="Tidak ada opsi khusus"
              items={field.options.map(option => ({ title: option }))}
              title="Opsi"
              total={field.options.length}
            />
            <CustomFieldSummarySectionCard
              description="Konfigurasi teknis field kustom"
              emptyText="Belum ada aturan tambahan"
              items={getFieldRuleItems(field)}
              title="Aturan"
              total={getFieldRuleItems(field).length}
            />
          </View>
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
          <FieldShell label="Label Field" required>
            <KolamFormTextField
              editable={!controller.saving}
              onChangeText={fieldLabel =>
                controller.onChangeForm({ fieldLabel })
              }
              placeholder="contoh: Diameter"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={form.fieldLabel}
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
          <View style={styles.customFieldAssetSettingsCard}>
            <KolamSettingsWebFileField
              accessibilityLabel="Icon field kustom"
              actionLabel="Pilih file"
              emptyLabel="Icon belum diatur"
              onLocalValueChange={iconLocalUri =>
                controller.onChangeForm({ iconLocalUri })
              }
              onUpload={() => {
                void controller.onPickIcon();
              }}
              scope="custom-field-icon"
              value={form.iconLocalUri || form.iconRemoteUrl}
            />
          </View>
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
      </View>
    </KolamNativeFormSection>
  );
}

type CustomFieldSummarySectionItem = {
  badge?: string;
  fields?: { label: string; value?: string | null }[];
  meta?: string;
  title: string;
  value?: string;
};

function CustomFieldLocaleSummaryCard({
  items,
}: {
  items: CustomFieldSummarySectionItem[];
}) {
  return (
    <KolamDetailSummaryCard
      body={
        <CustomFieldLocaleAccordionList
          emptyText="Belum ada data locale untuk diaudit."
          items={items}
        />
      }
      description="Audit isi locale field kustom."
      fields={[]}
      style={styles.customFieldSummaryGridCard}
      title="Terjemahan"
    />
  );
}

function CustomFieldSummarySectionCard({
  description,
  emptyText,
  items,
  title,
  total,
}: {
  description: string;
  emptyText: string;
  items: CustomFieldSummarySectionItem[];
  title: string;
  total: number;
}) {
  return (
    <KolamDetailSummaryCard
      body={<CustomFieldSummarySectionList emptyText={emptyText} items={items} />}
      description={description}
      fields={[{ id: 'total', label: 'Total', value: total }]}
      style={styles.customFieldSummaryGridCard}
      title={title}
    />
  );
}

function CustomFieldLocaleAccordionList({
  emptyText,
  items,
}: {
  emptyText: string;
  items: CustomFieldSummarySectionItem[];
}) {
  const [openKey, setOpenKey] = React.useState<string | null>(
    items.length ? getCustomFieldSummarySectionItemKey(items[0], 0) : null,
  );

  React.useEffect(() => {
    if (!items.length) {
      setOpenKey(null);
      return;
    }

    const keys = items.map(getCustomFieldSummarySectionItemKey);
    if (!openKey || !keys.includes(openKey)) {
      setOpenKey(keys[0]);
    }
  }, [items, openKey]);

  if (!items.length) {
    return (
      <Text style={styles.customFieldSummaryEmptyText}>{emptyText}</Text>
    );
  }

  return (
    <View style={styles.customFieldLocaleAccordionList}>
      {items.map((item, index) => {
        const key = getCustomFieldSummarySectionItemKey(item, index);
        const isOpen = openKey === key;

        return (
          <View key={key} style={styles.customFieldLocaleAccordionItem}>
            <KolamInteractionFrame
              accessibilityLabel={`${isOpen ? 'Tutup' : 'Buka'} ${item.title}`}
              accessibilityState={{ expanded: isOpen }}
              onPress={() => setOpenKey(isOpen ? null : key)}
              style={styles.customFieldLocaleAccordionHeader}
            >
              <View style={styles.customFieldLocaleAccordionCopy}>
                <Text
                  numberOfLines={1}
                  style={styles.customFieldSummaryItemTitle}
                >
                  {item.title}
                </Text>
                {item.value ? (
                  <Text
                    numberOfLines={1}
                    style={styles.customFieldLocaleAccordionSummary}
                  >
                    {item.value}
                  </Text>
                ) : null}
              </View>
              {item.badge ? (
                <KolamStatusBadge
                  intent={item.badge === 'Aktif' ? 'success' : 'muted'}
                  label={item.badge}
                />
              ) : null}
              <Text style={styles.customFieldLocaleAccordionChevron}>
                {isOpen ? '^' : 'v'}
              </Text>
            </KolamInteractionFrame>
            {isOpen ? (
              <View style={styles.customFieldLocaleAccordionContent}>
                {item.meta ? (
                  <Text style={styles.customFieldSummaryItemMeta}>
                    {item.meta}
                  </Text>
                ) : null}
                {item.value ? (
                  <Text style={styles.customFieldSummaryItemValue}>
                    {item.value}
                  </Text>
                ) : null}
                {item.fields?.length ? (
                  <View style={styles.customFieldSummaryItemFields}>
                    {item.fields.map(field => (
                      <Text
                        key={`${item.title}-${field.label}`}
                        style={styles.customFieldSummaryItemMeta}
                      >
                        {field.label}: {field.value || '-'}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function CustomFieldSummarySectionList({
  emptyText,
  items,
}: {
  emptyText: string;
  items: CustomFieldSummarySectionItem[];
}) {
  if (!items.length) {
    return (
      <Text style={styles.customFieldSummaryEmptyText}>{emptyText}</Text>
    );
  }

  return (
    <View style={styles.customFieldSummaryItemList}>
      {items.map((item, index) => (
        <View
          key={`${item.title}-${index}`}
          style={styles.customFieldSummaryItemRow}
        >
          <View style={styles.customFieldSummaryItemCopy}>
            <Text
              numberOfLines={1}
              style={styles.customFieldSummaryItemTitle}
            >
              {item.title}
            </Text>
            {item.meta ? (
              <Text
                numberOfLines={1}
                style={styles.customFieldSummaryItemMeta}
              >
                {item.meta}
              </Text>
            ) : null}
            {item.fields?.length ? (
              <View style={styles.customFieldSummaryItemFields}>
                {item.fields.map(field => (
                  <Text
                    key={`${item.title}-${field.label}`}
                    numberOfLines={1}
                    style={styles.customFieldSummaryItemMeta}
                  >
                    {field.label}: {field.value || '-'}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
          {item.value || item.badge ? (
            <View style={styles.customFieldSummaryItemMetrics}>
              {item.value ? (
                <Text
                  numberOfLines={1}
                  style={styles.customFieldSummaryItemValue}
                >
                  {item.value}
                </Text>
              ) : null}
              {item.badge ? (
                <KolamStatusBadge intent="secondary" label={item.badge} />
              ) : null}
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function getCustomFieldSummarySectionItemKey(
  item: CustomFieldSummarySectionItem,
  index: number,
) {
  return `${item.title}-${item.badge ?? ''}-${index}`;
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
  errorBadge: {
    alignSelf: 'flex-start',
    maxWidth: 760,
  },
  stack: {
    gap: 14,
  },
  customFieldSummaryIconInCard: {
    alignItems: 'center',
    height: 154,
    justifyContent: 'center',
    width: '100%',
  },
  customFieldSummaryLeadingSlot: {
    flexBasis: '24%',
    minWidth: 180,
  },
  customFieldSummaryDescription: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  customFieldSummaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  customFieldSummaryGridCard: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 320,
  },
  customFieldSummaryItemList: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
  customFieldSummaryItemRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    minHeight: 42,
    paddingVertical: 8,
  },
  customFieldSummaryItemCopy: {
    flex: 1,
    minWidth: 0,
  },
  customFieldSummaryItemTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
  },
  customFieldSummaryItemMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  customFieldSummaryItemFields: {
    gap: 2,
    marginTop: 4,
  },
  customFieldSummaryItemMetrics: {
    alignItems: 'flex-end',
    gap: 4,
    maxWidth: 130,
  },
  customFieldSummaryItemValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  customFieldLocaleAccordionList: {
    gap: 8,
  },
  customFieldLocaleAccordionItem: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  customFieldLocaleAccordionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  customFieldLocaleAccordionCopy: {
    flex: 1,
    minWidth: 0,
  },
  customFieldLocaleAccordionSummary: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  customFieldLocaleAccordionChevron: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    width: 18,
  },
  customFieldLocaleAccordionContent: {
    borderTopColor: V.colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  customFieldSummaryEmptyText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  customFieldTableIdentityCell: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    overflow: 'visible',
    width: '100%',
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
  customFieldActionMenuRaised: {
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
  customFieldAssetSettingsCard: {
    backgroundColor: '#f9fafb',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexBasis: 320,
    gap: 10,
    minWidth: 280,
    padding: 10,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
