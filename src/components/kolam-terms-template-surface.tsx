import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  buildKolamTermsTemplateDetailRoute,
  canArchiveKolamTermsTemplate,
  canPublishKolamTermsTemplate,
  formatKolamTermsTemplateComplaintWindow,
  formatKolamTermsTemplateStatusLabel,
  getKolamTermsTemplateStatusIntent,
  KOLAM_TERMS_TEMPLATE_CREATE_STATUS_OPTIONS,
  KOLAM_TERMS_TEMPLATE_NEW_ROUTE,
  KOLAM_TERMS_TEMPLATE_ROOT,
  KOLAM_TERMS_TEMPLATE_STATUS_FILTER_OPTIONS,
  type KolamTermsTemplate,
  type KolamTermsTemplateStatus,
} from '../domain/kolam-terms-template';
import {
  fitKolamDataTableColumns,
  getKolamTableVisualContract,
  type KolamTableColumn,
} from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamTermsTemplateController,
  type KolamTermsTemplateController,
} from '../hooks/use-kolam-terms-template-controller';
import { KolamButton } from './kolam-button';
import { KolamRefreshButton } from './kolam-refresh-button';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamConfirmDialog } from './kolam-confirm-dialog';
import { KolamContentFrame } from './kolam-content-frame';
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
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamHtmlContent } from './kolam-html-content';
import { KolamSearchField } from './kolam-search-field';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';
import { KolamTipTapRichTextEditor } from './kolam-tiptap-rich-text-editor';

const LIST_COLUMNS_BASE: KolamTableColumn[] = [
  { id: 'primary', label: 'Judul', align: 'left', width: 220 },
  { id: 'meta', label: 'Slug', align: 'left', width: 140 },
  { id: 'children', label: 'Kategori', align: 'left', width: 100 },
  { id: 'status', label: 'Status', align: 'left', width: 110 },
  { id: 'notes', label: 'Komplain', align: 'left', width: 80 },
  { id: 'amount', label: 'Versi', align: 'left', width: 64 },
  {
    id: 'actions',
    label: '',
    align: 'right',
    width: KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  },
];

function fitTermsTemplateListColumns(containerWidth: number): KolamTableColumn[] {
  return fitKolamDataTableColumns(LIST_COLUMNS_BASE, containerWidth, {
    actionsMinWidth: KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
    gap: KOLAM_DATA_TABLE_COLUMN_GAP,
    paddingX: getKolamTableVisualContract().body.cellPaddingX * 2,
    primaryMinWidth: 160,
    secondaryMinWidth: 56,
  });
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

export function KolamTermsTemplateSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamTermsTemplateController(route, onRouteChange);

  if (controller.mode === 'list') {
    return (
      <KolamTermsTemplateList
        controller={controller}
        onRouteChange={onRouteChange}
      />
    );
  }

  return (
    <KolamTermsTemplateFormShell
      controller={controller}
      onRouteChange={onRouteChange}
    />
  );
}

function KolamTermsTemplateList({
  controller,
  onRouteChange,
}: {
  controller: KolamTermsTemplateController;
  onRouteChange?: (route: string) => void;
}) {
  const [searchInput, setSearchInput] = React.useState(controller.search);
  const [pendingArchive, setPendingArchive] =
    React.useState<KolamTermsTemplate | null>(null);
  const [tableBodyWidth, setTableBodyWidth] = React.useState(0);
  const columns = React.useMemo(
    () => fitTermsTemplateListColumns(tableBodyWidth),
    [tableBodyWidth],
  );
  const actionsWidth = Math.max(
    columns.find(column => column.id === 'actions')?.width ??
      KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
    KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  );

  React.useEffect(() => {
    setSearchInput(controller.search);
  }, [controller.search]);

  React.useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput !== controller.search) {
        controller.onSearchChange(searchInput);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [controller, searchInput]);

  const statusFilterLabel =
    KOLAM_TERMS_TEMPLATE_STATUS_FILTER_OPTIONS.find(
      option => option.value === controller.statusFilter,
    )?.label ?? 'Status';

  return (
    <View style={styles.surface}>
      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
          style={styles.banner}
        />
      ) : null}
      {controller.statusMessage ? (
        <KolamStatusBadge
          intent="success"
          label={controller.statusMessage}
          numberOfLines={2}
          style={styles.banner}
        />
      ) : null}

      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <KolamSearchField
              containerStyle={kolamTableToolbarStyles.searchInput}
              onChangeText={setSearchInput}
              placeholder="Cari"
              value={searchInput}
            />
            <KolamDropdownSelect
              label={statusFilterLabel}
              onChange={value =>
                controller.onSetStatusFilter(
                  value as '' | KolamTermsTemplateStatus,
                )
              }
              options={KOLAM_TERMS_TEMPLATE_STATUS_FILTER_OPTIONS.map(
                option => ({
                  label: option.label,
                  value: option.value,
                }),
              )}
              showLabelInTrigger={false}
              style={styles.statusFilter}
              value={controller.statusFilter}
            />
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamRefreshButton
  accessibilityLabel="Muat ulang"

              onPress={() => {
                void controller.onRefresh();
              }}
              tone="secondary"
            />
            <KolamButton
              label="Baru"
              tone="positive"
              onPress={() => {
                controller.onCreateNew();
                onRouteChange?.(KOLAM_TERMS_TEMPLATE_NEW_ROUTE);
              }}
            />
          </View>
        </View>
      </View>

      <KolamCatalogListTableShell
        footer={
          <KolamTableFooterControls
            onPageSizeChange={controller.onSetPageSize}
            page={controller.page}
            pageSize={controller.pageSize}
            total={controller.total}
          >
            {controller.totalPages > 1 ? (
              <View style={styles.paginationRow}>
                <KolamButton
                  disabled={controller.page <= 1}
                  label="Sebelumnya"
                  onPress={() =>
                    controller.onSetPage(Math.max(1, controller.page - 1))
                  }
                />
                <Text style={styles.pageLabel}>
                  {controller.page} / {controller.totalPages}
                </Text>
                <KolamButton
                  disabled={controller.page >= controller.totalPages}
                  label="Berikutnya"
                  onPress={() =>
                    controller.onSetPage(
                      Math.min(controller.totalPages, controller.page + 1),
                    )
                  }
                />
              </View>
            ) : null}
          </KolamTableFooterControls>
        }
        onBodyWidthChange={setTableBodyWidth}
      >
        <KolamDataTableHeader columns={columns} />
        {!controller.loading && controller.items.length === 0 ? (
          <View style={styles.emptyWrap}>
            <KolamEmptyState message="Belum ada template." title="Kosong" />
          </View>
        ) : null}
        {controller.items.map(item => (
          <TermsTemplateListRow
            actionsWidth={actionsWidth}
            columns={columns}
            item={item}
            key={item.id}
            mutating={controller.mutating}
            onArchive={() => setPendingArchive(item)}
            onOpen={() => {
              controller.onSelectItem(item);
              onRouteChange?.(buildKolamTermsTemplateDetailRoute(item.id));
            }}
            onPublish={() => {
              void controller.onPublish(item);
            }}
          />
        ))}
      </KolamCatalogListTableShell>

      <KolamConfirmDialog
        confirmLabel="Arsipkan"
        destructive
        message={
          pendingArchive
            ? `Arsipkan “${pendingArchive.title}”? Template tidak dihapus permanen.`
            : ''
        }
        onCancel={() => setPendingArchive(null)}
        onConfirm={() => {
          const target = pendingArchive;
          setPendingArchive(null);
          if (target) {
            void controller.onArchive(target);
          }
        }}
        title="Arsipkan template"
        visible={Boolean(pendingArchive)}
      />
    </View>
  );
}

function TermsTemplateListRow({
  actionsWidth,
  columns,
  item,
  mutating,
  onArchive,
  onOpen,
  onPublish,
}: {
  actionsWidth: number;
  columns: KolamTableColumn[];
  item: KolamTermsTemplate;
  mutating: boolean;
  onArchive: () => void;
  onOpen: () => void;
  onPublish: () => void;
}) {
  const actions = [
    ...(canPublishKolamTermsTemplate(item)
      ? [
          {
            disabled: mutating,
            label: 'Terbitkan',
            onPress: onPublish,
          },
        ]
      : []),
    ...(canArchiveKolamTermsTemplate(item)
      ? [
          {
            disabled: mutating,
            label: 'Arsipkan',
            onPress: onArchive,
            tone: 'danger' as const,
          },
        ]
      : []),
  ];

  return (
    <KolamDataTableRowFrame>
      <KolamDataTableMainTrack>
        <Pressable
          accessibilityRole="button"
          onPress={onOpen}
          style={styles.rowPressable}
        >
          {columns
            .filter(column => column.id !== 'actions')
            .map(column => {
              const style = getKolamDataTableColumnStyle(column);
              if (column.id === 'primary') {
                return (
                  <View key={column.id} style={style}>
                    <Text numberOfLines={2} style={styles.primaryText}>
                      {item.title}
                    </Text>
                  </View>
                );
              }
              if (column.id === 'meta') {
                return (
                  <Text
                    key={column.id}
                    numberOfLines={1}
                    style={[styles.cellText, style]}
                  >
                    {item.slug || '—'}
                  </Text>
                );
              }
              if (column.id === 'children') {
                return (
                  <Text
                    key={column.id}
                    numberOfLines={1}
                    style={[styles.cellText, style]}
                  >
                    {item.category || '—'}
                  </Text>
                );
              }
              if (column.id === 'status') {
                return (
                  <View key={column.id} style={style}>
                    <KolamStatusBadge
                      intent={getKolamTermsTemplateStatusIntent(item.status)}
                      label={formatKolamTermsTemplateStatusLabel(item.status)}
                    />
                  </View>
                );
              }
              if (column.id === 'notes') {
                return (
                  <Text
                    key={column.id}
                    numberOfLines={1}
                    style={[styles.cellText, style]}
                  >
                    {formatKolamTermsTemplateComplaintWindow(
                      item.complaintWindowDays,
                    )}
                  </Text>
                );
              }
              if (column.id === 'amount') {
                return (
                  <Text
                    key={column.id}
                    numberOfLines={1}
                    style={[styles.cellText, style]}
                  >
                    {String(item.version)}
                  </Text>
                );
              }
              return <View key={column.id} style={style} />;
            })}
        </Pressable>
      </KolamDataTableMainTrack>
      <KolamDataTableActionsTrack width={actionsWidth}>
        {actions.length > 0 ? <KolamOverflowMenuButton actions={actions} /> : null}
      </KolamDataTableActionsTrack>
    </KolamDataTableRowFrame>
  );
}

function KolamTermsTemplateFormShell({
  controller,
  onRouteChange,
}: {
  controller: KolamTermsTemplateController;
  onRouteChange?: (route: string) => void;
}) {
  const [pendingArchive, setPendingArchive] = React.useState(false);
  const item = controller.selected;
  const form = controller.form;
  const editable = controller.isFormEditable;
  const contextLabel =
    controller.mode === 'new'
      ? 'Template baru'
      : controller.mode === 'edit'
        ? `Ubah · ${item?.title || form.title || 'Template'}`
        : item?.title || form.title || 'Detail template';

  return (
    <View style={styles.surface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text numberOfLines={1} style={styles.detailToolbarContext}>
              {contextLabel}
            </Text>
            {item ? (
              <KolamStatusBadge
                intent={getKolamTermsTemplateStatusIntent(item.status)}
                label={formatKolamTermsTemplateStatusLabel(item.status)}
              />
            ) : null}
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              label="Kembali"
              onPress={() => {
                controller.onBackToList();
                onRouteChange?.(KOLAM_TERMS_TEMPLATE_ROOT);
              }}
              tone="secondary"
            />
            {item && item.status === 'archived' ? (
              <KolamButton
                disabled={controller.mutating}
                label="Buka draf"
                onPress={() => {
                  void controller.onSetDraft(item);
                }}
                tone="secondary"
              />
            ) : null}
            {item && canPublishKolamTermsTemplate(item) ? (
              <KolamButton
                disabled={controller.mutating}
                label="Terbitkan"
                onPress={() => {
                  void controller.onPublish(item);
                }}
              />
            ) : null}
            {item && canArchiveKolamTermsTemplate(item) ? (
              <KolamButton
                disabled={controller.mutating}
                label="Arsipkan"
                onPress={() => setPendingArchive(true)}
                tone="secondary"
              />
            ) : null}
            {controller.mode === 'detail' && editable ? (
              <KolamButton
                label="Ubah"
                onPress={() => controller.onEdit()}
                tone="secondary"
              />
            ) : null}
            {(controller.mode === 'new' ||
              controller.mode === 'edit' ||
              (controller.mode === 'detail' && editable)) &&
            editable ? (
              <KolamButton
                disabled={controller.mutating}
                label={
                  controller.mutating
                    ? 'Menyimpan…'
                    : controller.mode === 'new'
                      ? 'Buat'
                      : 'Simpan'
                }
                onPress={() => {
                  void controller.onSave();
                }}
              />
            ) : null}
          </View>
        </View>
      </View>

      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
          style={styles.banner}
        />
      ) : null}
      {controller.statusMessage ? (
        <KolamStatusBadge
          intent="success"
          label={controller.statusMessage}
          numberOfLines={2}
          style={styles.banner}
        />
      ) : null}

      {!editable && item?.status === 'archived' ? (
        <KolamStatusBadge
          intent="warning"
          label="Diarsipkan — buka draf atau terbitkan sebelum mengubah."
          numberOfLines={2}
          style={styles.banner}
        />
      ) : null}

      {controller.loading &&
      (controller.mode === 'detail' || controller.mode === 'edit') &&
      !item ? (
        <KolamEmptyState message="Memuat…" title="Detail" />
      ) : (
        <ScrollView contentContainerStyle={styles.detailContent}>
          <KolamContentFrame variant="nativeFormSection">
            <KolamCopyStack
              containerStyle={styles.sectionCopy}
              items={[
                {
                  id: 'title',
                  text: 'Metadata',
                  style: styles.sectionTitle,
                },
              ]}
            />
            <KolamContentFrame variant="nativeFormControls">
              <View style={settingsWebFormStyles.settingsWebFormFields}>
                <FieldShell label="Judul" required>
                  <KolamFormTextField
                    editable={editable && !controller.mutating}
                    onChangeText={title => controller.onChangeForm({ title })}
                    placeholder="Judul template"
                    value={form.title}
                  />
                </FieldShell>
                <FieldShell label="Slug">
                  <KolamFormTextField
                    editable={editable && !controller.mutating}
                    onChangeText={slug => controller.onChangeForm({ slug })}
                    placeholder="otomatis dari judul jika kosong"
                    value={form.slug}
                  />
                </FieldShell>
                <FieldShell label="Kategori">
                  <KolamFormTextField
                    editable={editable && !controller.mutating}
                    onChangeText={category =>
                      controller.onChangeForm({ category })
                    }
                    placeholder="default"
                    value={form.category}
                  />
                </FieldShell>
                <FieldShell label="Masa tunggu komplain (hari)">
                  <KolamFormTextField
                    editable={editable && !controller.mutating}
                    keyboardType="number-pad"
                    onChangeText={complaintWindowDays =>
                      controller.onChangeForm({ complaintWindowDays })
                    }
                    placeholder="kosong = default web setting"
                    value={form.complaintWindowDays}
                  />
                </FieldShell>
                {controller.mode === 'new' ? (
                  <FieldShell label="Status awal">
                    <KolamDropdownSelect
                      label={
                        KOLAM_TERMS_TEMPLATE_CREATE_STATUS_OPTIONS.find(
                          option => option.value === form.status,
                        )?.label ?? 'Draf'
                      }
                      onChange={value =>
                        controller.onChangeForm({
                          status:
                            value === 'published' ? 'published' : 'draft',
                        })
                      }
                      options={KOLAM_TERMS_TEMPLATE_CREATE_STATUS_OPTIONS.map(
                        option => ({
                          label: option.label,
                          value: option.value,
                        }),
                      )}
                      showLabelInTrigger={false}
                      value={
                        form.status === 'published' ? 'published' : 'draft'
                      }
                    />
                  </FieldShell>
                ) : null}
                {controller.mode !== 'new' && editable ? (
                  <FieldShell label="Catatan perubahan">
                    <KolamFormTextField
                      editable={!controller.mutating}
                      onChangeText={changeNote =>
                        controller.onChangeForm({ changeNote })
                      }
                      placeholder="Opsional"
                      value={form.changeNote}
                    />
                  </FieldShell>
                ) : null}
              </View>
            </KolamContentFrame>
          </KolamContentFrame>

          <KolamContentFrame variant="nativeFormSection">
            <KolamCopyStack
              containerStyle={styles.sectionCopy}
              items={[
                {
                  id: 'content',
                  text: 'Isi S&K',
                  style: styles.sectionTitle,
                },
              ]}
            />
            {editable ? (
              <View style={styles.editorWrap}>
                <KolamTipTapRichTextEditor
                  editable={!controller.mutating}
                  onChangeText={content =>
                    controller.onChangeForm({ content })
                  }
                  placeholder="Tulis syarat dan ketentuan…"
                  value={form.content}
                />
              </View>
            ) : (
              <View style={styles.htmlPreview}>
                {form.content.trim() ? (
                  <KolamHtmlContent html={form.content} />
                ) : (
                  <Text style={styles.emptyContent}>Belum ada konten.</Text>
                )}
              </View>
            )}
          </KolamContentFrame>
        </ScrollView>
      )}

      <KolamConfirmDialog
        confirmLabel="Arsipkan"
        destructive
        message={
          item
            ? `Arsipkan “${item.title}”? Template tidak dihapus permanen.`
            : ''
        }
        onCancel={() => setPendingArchive(false)}
        onConfirm={() => {
          setPendingArchive(false);
          if (item) {
            void controller.onArchive(item);
          }
        }}
        title="Arsipkan template"
        visible={pendingArchive}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 8,
  },
  banner: {
    alignSelf: 'stretch',
  },
  statusFilter: {
    minWidth: 140,
  },
  rowPressable: {
    alignItems: 'center',
    flexDirection: 'row',
    flexGrow: 0,
    flexShrink: 1,
    gap: KOLAM_DATA_TABLE_COLUMN_GAP,
    minWidth: 0,
  },
  primaryText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  cellText: {
    color: V.colors.fg,
    fontSize: 12,
  },
  detailToolbarContext: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 360,
  },
  detailContent: {
    gap: 12,
    paddingBottom: 24,
  },
  sectionCopy: {
    gap: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyWrap: {
    paddingVertical: 24,
  },
  paginationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  editorWrap: {
    minHeight: 280,
  },
  htmlPreview: {
    minHeight: 120,
    padding: 8,
  },
  emptyContent: {
    color: V.colors.mutedFg,
    fontSize: 13,
  },
});
