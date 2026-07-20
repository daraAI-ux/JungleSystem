import React from 'react';
import { StyleSheet, View } from 'react-native';
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
import { getKolamTableColumns } from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamCustomFieldController,
  type KolamCustomFieldController,
} from '../hooks/use-kolam-custom-field-controller';
import { KolamButton } from './kolam-button';
import { KolamCatalogTranslationsEditor } from './kolam-catalog-translations-editor';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamCustomFieldIcon } from './kolam-custom-field-icon';
import { KolamDataTableHeader } from './kolam-data-table-header';
import { KolamDataTableAmountCell } from './kolam-data-table-text-cell';
import { KolamDataTableRowFrame } from './kolam-data-table-row-frame';
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
  KolamPaginationSizeControl,
  KolamPaginationSummaryLabel,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamLabelFieldDetailOverview } from './kolam-label-field-detail-overview';
import { KolamNativeFormSection } from './kolam-native-form-section';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamStatusBadge } from './kolam-status-badge';

type CustomFieldSortMode = 'label-asc' | 'label-desc' | 'order' | 'newest';
type CustomFieldStatusFilter = 'all' | KolamCustomFieldStatus;
type CustomFieldTypeFilter = 'all' | KolamCustomFieldType;

export function KolamCustomFieldSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamCustomFieldController(route);

  return (
    <KolamCustomFieldShell controller={controller} onRouteChange={onRouteChange}>
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
  return (
    <View style={styles.surface}>
      <View style={styles.header}>
        <View style={styles.headerActions}>
          <KolamButton
            disabled={controller.loading}
            label="Refresh"
            onPress={() => {
              void controller.onRefresh();
            }}
          />
          {controller.mode === 'list' ? (
            <KolamButton
              intent="primary"
              label="Buat Baru"
              onPress={() => {
                controller.onCreateNew();
                onRouteChange?.('/custom-fields/baru');
              }}
            />
          ) : (
            <KolamButton
              label="Daftar"
              onPress={() => {
                controller.onBackToList();
                onRouteChange?.('/custom-fields');
              }}
            />
          )}
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
  const [deleteCandidate, setDeleteCandidate] =
    React.useState<KolamCustomField | null>(null);
  const summary = getCustomFieldSummary(controller.fields);
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

  React.useEffect(() => {
    setPage(1);
  }, [pageSize, search, sortMode, statusFilter, typeFilter]);

  return (
    <View style={styles.stack}>
      <View style={styles.summaryGrid}>
        <SummaryTile label="Total Field" value={controller.fields.length} />
        <SummaryTile label="Aktif" value={summary.active} />
        <SummaryTile label="Nonaktif" value={summary.inactive} />
        <SummaryTile label="Wajib" value={summary.required} />
      </View>
      <View style={styles.tableToolbar}>
        <KolamFormTextField
          onChangeText={setSearch}
          placeholder="Cari field kustom..."
          style={styles.searchInput}
          value={search}
        />
        <KolamDropdownSelect<CustomFieldSortMode>
          label="Urutan"
          onChange={setSortMode}
          options={[
            { label: 'Label A-Z', value: 'label-asc' },
            { label: 'Label Z-A', value: 'label-desc' },
            { label: 'Urutan Field', value: 'order' },
            { label: 'Terbaru', value: 'newest' },
          ]}
          value={sortMode}
        />
        <KolamDropdownSelect<CustomFieldStatusFilter>
          label="Status"
          onChange={setStatusFilter}
          options={[
            { label: 'Semua', value: 'all' },
            { label: 'Aktif', value: 'active' },
            { label: 'Nonaktif', value: 'inactive' },
          ]}
          value={statusFilter}
        />
        <KolamDropdownSelect<CustomFieldTypeFilter>
          label="Tipe"
          onChange={setTypeFilter}
          options={[
            { label: 'Semua', value: 'all' },
            { label: 'Teks', value: 'string' },
            { label: 'Angka', value: 'number' },
            { label: 'Ya/Tidak', value: 'boolean' },
            { label: 'Rentang', value: 'range' },
            { label: 'Pilihan', value: 'select' },
          ]}
          value={typeFilter}
        />
        <KolamPaginationSizeControl onChange={setPageSize} value={pageSize} />
        <KolamPaginationSummaryLabel
          page={safePage}
          pageSize={pageSize}
          total={sortedFields.length}
        />
      </View>
      <KolamContentFrame variant="settingsWebConfig">
        <KolamDataTableHeader columns={getKolamTableColumns('custom-field')} />
        {pagedFields.length ? (
          pagedFields.map(field => (
            <KolamCustomFieldRow
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
                controller.loading ? 'Memuat field kustom...' : 'Belum ada field'
              }
            />
          </View>
        )}
      </KolamContentFrame>
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
            onPress={() => setPage(current => Math.min(pageCount, current + 1))}
          />
        </View>
      ) : null}
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
    <KolamDataTableRowFrame style={actionMenuOpen && styles.activeActionRow}>
      <View style={styles.identityCell}>
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
      <View style={styles.keyCell}>
        <KolamCopyStack
          items={[{ id: 'key', text: field.fieldKey, style: styles.rowMeta }]}
        />
      </View>
      <View style={styles.typeCell}>
        <KolamStatusBadge
          intent="muted"
          label={getCustomFieldTypeLabel(field.fieldType)}
        />
      </View>
      <View style={styles.rulesCell}>
        <KolamCopyStack
          items={[
            {
              id: 'rules',
              text: getFieldRulesLabel(field),
              style: styles.rulesText,
              textProps: { numberOfLines: 2 },
            },
          ]}
        />
      </View>
      <KolamDataTableAmountCell style={styles.orderCell}>
        {field.order}
      </KolamDataTableAmountCell>
      <View style={styles.statusCell}>
        <KolamStatusBadge
          intent={field.status === 'active' ? 'success' : 'warning'}
          label={getFieldStatusLabel(field.status)}
        />
      </View>
      <View style={styles.overflowCell}>
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
          <View style={styles.detailActions}>
            <KolamButton intent="primary" label="Edit" onPress={controller.onEdit} />
          </View>
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
                ? [{ label: 'Diperbarui', value: formatDateTime(field.updatedAt) }]
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
    <KolamNativeFormSection section={getKolamFormSection('custom-field-detail')}>
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
          </FieldShell><FieldShell label="Tipe Field" required>
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

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryTile}>
      <KolamCopyStack
        items={[
          { id: 'value', text: value, style: styles.summaryValue },
          { id: 'label', text: label, style: styles.summaryLabel },
        ]}
      />
    </View>
  );
}


function getCustomFieldSummary(fields: KolamCustomField[]) {
  return fields.reduce(
    (summary, field) => {
      summary[field.status] += 1;
      if (field.required) {
        summary.required += 1;
      }

      return summary;
    },
    { active: 0, inactive: 0, required: 0 },
  );
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

function sortFields(
  fields: KolamCustomField[],
  sortMode: CustomFieldSortMode,
) {
  return [...fields].sort((left, right) => {
    if (sortMode === 'newest') {
      return (
        getFieldTime(right) - getFieldTime(left) ||
        left.fieldLabel.localeCompare(right.fieldLabel)
      );
    }

    if (sortMode === 'order') {
      return left.order - right.order || left.fieldLabel.localeCompare(right.fieldLabel);
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
  header: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    gap: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  },
  errorBadge: {
    alignSelf: 'flex-start',
    maxWidth: 760,
  },
  stack: {
    gap: 14,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryTile: {
    minWidth: 150,
    flexGrow: 1,
    padding: 14,
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  summaryValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 22,
    fontWeight: '900',
  },
  summaryLabel: {
    marginTop: 3,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  tableToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    zIndex: 8,
  },
  searchInput: {
    width: 240,
  },
  emptyWrap: {
    minHeight: 220,
    justifyContent: 'center',
  },
  activeActionRow: {
    zIndex: 1000,
    elevation: 30,
  },
  identityCell: {
    flex: 1,
    minWidth: 0,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  },
  rowMeta: {
    marginTop: 2,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  keyCell: {
    width: 150,
    minWidth: 0,
  },
  typeCell: {
    width: 110,
    alignItems: 'flex-start',
  },
  rulesCell: {
    width: 230,
    minWidth: 0,
  },
  rulesText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  orderCell: {
    width: 86,
  },
  statusCell: {
    width: 116,
    alignItems: 'flex-end',
  },
  overflowCell: {
    width: 64,
    alignItems: 'flex-end',
    zIndex: 1100,
    elevation: 30,
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
  detailActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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


