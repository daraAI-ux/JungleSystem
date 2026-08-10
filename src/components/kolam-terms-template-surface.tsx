import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamTermsTemplateController,
  type KolamTermsTemplateController,
} from '../hooks/use-kolam-terms-template-controller';
import { KolamButton } from './kolam-button';
import {KolamSaveButton} from './kolam-save-button';
import {KolamEditButton} from './kolam-edit-button';
import { KolamConfirmDialog } from './kolam-confirm-dialog';
import { KolamDetailScrollSurface } from './kolam-detail-scroll-surface';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import {
  KolamDropdownSelect,
  KolamTableRowActionMenu,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamHtmlContent } from './kolam-html-content';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import {KolamNotesField} from './kolam-notes-field';
import { KolamSearchField } from './kolam-search-field';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';
import { KolamTipTapRichTextEditor } from './kolam-tiptap-rich-text-editor';

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
  const columns = React.useMemo(
    () =>
      buildTermsTemplateListColumns({
        onOpen: item => {
          controller.onSelectItem(item);
          onRouteChange?.(buildKolamTermsTemplateDetailRoute(item.id));
        },
      }),
    [controller, onRouteChange],
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

      <KolamListTableComposition
        actionsColumn
        columns={columns}
        emptyTitle="Kosong"
        getRowKey={item => item.id}
        loading={controller.loading}
        pagination={{
          onPageChange: controller.onSetPage,
          page: controller.page,
          pageSize: controller.pageSize,
          total: controller.total,
        }}
        renderActions={item => (
          <TermsTemplateActionsMenu
            item={item}
            mutating={controller.mutating}
            onArchive={() => setPendingArchive(item)}
            onPublish={() => {
              void controller.onPublish(item);
            }}
          />
        )}
        rows={controller.items}
      />

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

function buildTermsTemplateListColumns({
  onOpen,
}: {
  onOpen: (item: KolamTermsTemplate) => void;
}): Array<KolamListTableColumn<KolamTermsTemplate>> {
  return [
    {
      flex: 1.32,
      id: 'title',
      label: 'Judul',
      render: item => (
        <Pressable
          accessibilityRole="button"
          onPress={() => onOpen(item)}
          style={styles.identityCell}
        >
          <Text numberOfLines={2} style={styles.primaryText}>
            {item.title}
          </Text>
        </Pressable>
      ),
    },
    {
      align: 'center',
      flex: 0.88,
      id: 'slug',
      label: 'Slug',
      render: item => (
        <Text numberOfLines={1} style={styles.cellTextCenter}>
          {item.slug || '-'}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.76,
      id: 'category',
      label: 'Kategori',
      render: item => (
        <View style={styles.centerCell}>
          <Text numberOfLines={1} style={styles.cellTextCenter}>
            {item.category || '-'}
          </Text>
        </View>
      ),
    },
    {
      align: 'center',
      flex: 0.76,
      id: 'status',
      label: 'Status',
      render: item => (
        <View style={styles.centerCell}>
          <KolamStatusBadge
            intent={getKolamTermsTemplateStatusIntent(item.status)}
            label={formatKolamTermsTemplateStatusLabel(item.status)}
            style={styles.centeredBadge}
          />
        </View>
      ),
    },
    {
      align: 'center',
      flex: 0.72,
      id: 'complaint',
      label: 'Komplain',
      render: item => (
        <Text numberOfLines={1} style={styles.cellTextCenter}>
          {formatKolamTermsTemplateComplaintWindow(item.complaintWindowDays)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.48,
      id: 'version',
      label: 'Versi',
      render: item => (
        <Text numberOfLines={1} style={styles.cellTextCenter}>
          {String(item.version)}
        </Text>
      ),
    },
  ];
}

function TermsTemplateActionsMenu({
  item,
  mutating,
  onArchive,
  onPublish,
}: {
  item: KolamTermsTemplate;
  mutating: boolean;
  onArchive: () => void;
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

  return actions.length > 0 ? <KolamTableRowActionMenu actions={actions} /> : null;
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
              intent="secondary"
            />
            {item && item.status === 'archived' ? (
              <KolamButton
                disabled={controller.mutating}
                label="Buka draf"
                onPress={() => {
                  void controller.onSetDraft(item);
                }}
                intent="secondary"
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
                intent="secondary"
              />
            ) : null}
            {controller.mode === 'detail' && editable ? (
              <KolamEditButton
                onPress={() => controller.onEdit()}
                intent="secondary"
              />
            ) : null}
            {(controller.mode === 'new' ||
              controller.mode === 'edit' ||
              (controller.mode === 'detail' && editable)) &&
            editable ? (
              <KolamSaveButton
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
        <KolamDetailScrollSurface contentContainerStyle={styles.detailContent}>
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
                  <KolamNotesField
                    editable={!controller.mutating}
                    label="Catatan perubahan"
                    onChangeText={changeNote =>
                      controller.onChangeForm({ changeNote })
                    }
                    placeholder="Opsional"
                    value={form.changeNote}
                  />
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
        </KolamDetailScrollSurface>
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
  primaryText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  cellText: {
    color: V.colors.fg,
    fontSize: 12,
  },
  identityCell: {
    minWidth: 0,
    width: '100%',
  },
  centerCell: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    minWidth: 0,
    width: '100%',
  },
  centeredBadge: {
    alignSelf: 'center',
  },
  cellTextCenter: {
    color: V.colors.fg,
    fontSize: 12,
    textAlign: 'center',
    width: '100%',
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
