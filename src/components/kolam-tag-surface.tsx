import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  normalizeTagColor,
  type KolamTag,
  type KolamTagStatus,
  type KolamTagUsageItem,
} from '../domain/kolam-tag';
import { getKolamFormSection } from '../domain/kolam-form';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamTagController,
  type KolamTagController,
} from '../hooks/use-kolam-tag-controller';
import { KolamButton } from './kolam-button';
import {KolamEditButton} from './kolam-edit-button';
import { KolamCheckmarkIcon } from './kolam-checkmark-icon';
import { KolamColorSwatchPicker } from './kolam-color-swatch-picker';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import { KolamOverflowMenuButton } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import { KolamLabelFieldDetailOverview } from './kolam-label-field-detail-overview';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
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
import { KolamTipTapRichTextEditor } from './kolam-tiptap-rich-text-editor';

type TagSortMode = 'name-asc' | 'name-desc' | 'newest';
type TagStatusFilter = 'all' | KolamTagStatus;
type TagListFilterPanel = 'sort' | 'status';

const TAG_FILTER_PANEL_WIDTH = 220;

export function KolamTagSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamTagController(route);

  return (
    <KolamTagShell controller={controller} onRouteChange={onRouteChange}>
      {controller.mode === 'list' ? (
        <KolamTagList controller={controller} onRouteChange={onRouteChange} />
      ) : (
        <KolamTagDetail controller={controller} />
      )}
    </KolamTagShell>
  );
}

function KolamTagShell({
  children,
  controller,
  onRouteChange,
}: {
  children: React.ReactNode;
  controller: KolamTagController;
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
      ? 'Tag baru'
      : controller.mode === 'edit'
      ? `Edit · ${
          controller.selectedTag?.name || controller.form.name || 'Tag'
        }`
      : controller.selectedTag?.name || 'Detail tag';

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
              label="Daftar"
              onPress={() => {
                controller.onBackToList();
                onRouteChange?.('/tags');
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

function KolamTagList({
  controller,
  onRouteChange,
}: {
  controller: KolamTagController;
  onRouteChange?: (route: string) => void;
}) {
  const [search, setSearch] = React.useState('');
  const [sortMode, setSortMode] = React.useState<TagSortMode>('name-asc');
  const [statusFilter, setStatusFilter] =
    React.useState<TagStatusFilter>('all');
  const pageSize = 10;
  const [page, setPage] = React.useState(1);
  const [activeFilterPanel, setActiveFilterPanel] =
    React.useState<TagListFilterPanel | null>(null);
  const [panelAnchor, setPanelAnchor] =
    React.useState<KolamFilterPanelAnchor | null>(null);
  const toolbarRef = React.useRef<View>(null);
  const sortTriggerRef = React.useRef<View>(null);
  const statusTriggerRef = React.useRef<View>(null);
  const [deleteCandidate, setDeleteCandidate] = React.useState<KolamTag | null>(
    null,
  );
  const filteredTags = React.useMemo(
    () => filterTags(controller.tags, search, statusFilter),
    [controller.tags, search, statusFilter],
  );
  const sortedTags = React.useMemo(
    () => sortTags(filteredTags, sortMode),
    [filteredTags, sortMode],
  );
  const pageCount = Math.max(1, Math.ceil(sortedTags.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pagedTags = sortedTags.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const listColumns = React.useMemo<Array<KolamListTableColumn<KolamTag>>>(
    () => buildTagListColumns(),
    [],
  );
  const sortFilterLabel =
    sortMode === 'name-desc'
      ? 'Nama Z-A'
      : sortMode === 'newest'
      ? 'Terbaru'
      : 'Nama A-Z';
  const statusFilterLabel =
    statusFilter === 'active'
      ? 'Aktif'
      : statusFilter === 'inactive'
      ? 'Nonaktif'
      : 'Semua Status';

  const anchorFilterPanel = React.useCallback((panel: TagListFilterPanel) => {
    const trigger =
      panel === 'status' ? statusTriggerRef.current : sortTriggerRef.current;
    measureFilterPanelAnchor(
      toolbarRef.current,
      trigger,
      TAG_FILTER_PANEL_WIDTH,
      setPanelAnchor,
    );
  }, []);

  const openFilterPanel = (panel: TagListFilterPanel) => {
    if (activeFilterPanel === panel) {
      setActiveFilterPanel(null);
      setPanelAnchor(null);
      return;
    }
    setActiveFilterPanel(null);
    setPanelAnchor(null);
    const trigger =
      panel === 'status' ? statusTriggerRef.current : sortTriggerRef.current;
    requestAnimationFrame(() => {
      measureFilterPanelAnchor(
        toolbarRef.current,
        trigger,
        TAG_FILTER_PANEL_WIDTH,
        anchor => {
          setPanelAnchor(anchor);
          setActiveFilterPanel(panel);
        },
      );
    });
  };

  React.useEffect(() => {
    setPage(1);
  }, [search, sortMode, statusFilter]);

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
                placeholder="Cari tag..."
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
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              <KolamButton
                intent="primary"
                label="Baru"
                tone="positive"
                onPress={() => {
                  controller.onCreateNew();
                  onRouteChange?.('/tags/baru');
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
                width: TAG_FILTER_PANEL_WIDTH,
              },
            ]}
          >
            {(activeFilterPanel === 'sort'
              ? [
                  { label: 'Nama A-Z', value: 'name-asc' as TagSortMode },
                  { label: 'Nama Z-A', value: 'name-desc' as TagSortMode },
                  { label: 'Terbaru', value: 'newest' as TagSortMode },
                ]
              : [
                  { label: 'Semua Status', value: 'all' as TagStatusFilter },
                  { label: 'Aktif', value: 'active' as TagStatusFilter },
                  { label: 'Nonaktif', value: 'inactive' as TagStatusFilter },
                ]
            ).map(option => {
              const selected =
                activeFilterPanel === 'sort'
                  ? option.value === sortMode
                  : option.value === statusFilter;
              return (
                <KolamInteractionFrame
                  accessibilityLabel={option.label}
                  key={`${activeFilterPanel}-${option.value}`}
                  onPress={() => {
                    if (activeFilterPanel === 'sort') {
                      setSortMode(option.value as TagSortMode);
                    } else {
                      setStatusFilter(option.value as TagStatusFilter);
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
        emptyTitle={controller.loading ? 'Memuat tag...' : 'Belum ada tag'}
        getRowKey={tag => tag.id}
        loading={controller.loading}
        pagination={{
          onPageChange: setPage,
          page: safePage,
          pageSize,
          total: sortedTags.length,
        }}
        renderActions={tag => (
          <KolamTagActionsMenu
            onDelete={() => setDeleteCandidate(tag)}
            onEdit={() => {
              void controller.onSelectTag(tag);
              onRouteChange?.(`${getTagRoute(tag)}/edit`);
            }}
            onSelect={() => {
              void controller.onSelectTag(tag);
              onRouteChange?.(getTagRoute(tag));
            }}
            tag={tag}
          />
        )}
        rows={pagedTags}
      />
      <KolamDeleteConfirmDialog
        itemLabel={deleteCandidate?.name}
        itemType="tag"
        visible={Boolean(deleteCandidate)}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => {
          const tag = deleteCandidate;
          setDeleteCandidate(null);

          if (!tag) {
            return;
          }

          void controller.onDeleteTag(tag).then(deleted => {
            if (deleted) {
              onRouteChange?.('/tags');
            }
          });
        }}
      />
    </View>
  );
}

function buildTagListColumns(): Array<KolamListTableColumn<KolamTag>> {
  return [
    {
      flex: 1.2,
      id: 'primary',
      label: 'Tag',
      render: tag => <KolamTagIdentityCell tag={tag} />,
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'meta',
      label: 'Warna',
      render: tag => <KolamTagColorCell tag={tag} />,
    },
    {
      align: 'center',
      flex: 1.25,
      id: 'notes',
      label: 'Catatan',
      render: tag => (
        <Text numberOfLines={2} style={styles.notesText}>
          {stripHtmlForDetail(tag.description) || '-'}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.72,
      id: 'amount',
      label: 'Dipakai',
      render: tag => (
        <Text numberOfLines={1} style={styles.countText}>
          {String(tag.usageTotal)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.86,
      id: 'status',
      label: 'Status',
      render: tag => (
        <KolamStatusBadge
          intent={tag.status === 'active' ? 'success' : 'warning'}
          label={getTagStatusLabel(tag.status)}
          style={styles.statusBadge}
        />
      ),
    },
  ];
}

function KolamTagIdentityCell({ tag }: { tag: KolamTag }) {
  const color = normalizeTagColor(tag.color);

  return (
    <View style={styles.tagTableIdentityCell}>
      <View style={styles.tagIdentity}>
        <View style={[styles.tagDot, { backgroundColor: color }]} />
        <KolamCopyStack
          containerStyle={styles.tagCopy}
          items={[
            { id: 'name', text: tag.name, style: styles.rowTitle },
            {
              id: 'creator',
              text: `Pembuat: ${tag.createdBy || '-'}`,
              style: styles.rowMeta,
            },
          ]}
        />
      </View>
    </View>
  );
}

function KolamTagColorCell({ tag }: { tag: KolamTag }) {
  const color = normalizeTagColor(tag.color);

  return (
    <View style={[styles.colorChip, { borderColor: color }]}>
      <View style={[styles.colorChipDot, { backgroundColor: color }]} />
      <Text numberOfLines={1} style={styles.colorChipText}>
        {color}
      </Text>
    </View>
  );
}

function KolamTagActionsMenu({
  onDelete,
  onEdit,
  onSelect,
  tag,
}: {
  onDelete: () => void;
  onEdit: () => void;
  onSelect: () => void;
  tag: KolamTag;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);

  return (
    <View style={actionMenuOpen ? styles.tagActionMenuRaised : null}>
      <KolamOverflowMenuButton
        accessibilityLabel={`Menu ${tag.name}`}
        onOpenChange={setActionMenuOpen}
        actions={[
          { label: 'Lihat', onPress: onSelect },
          { label: 'Rubah', onPress: onEdit },
          { label: 'Hapus', onPress: onDelete, tone: 'danger' },
        ]}
      />
    </View>
  );
}

function KolamTagDetail({ controller }: { controller: KolamTagController }) {
  const tag = controller.selectedTag;
  const editable = controller.isEditable;

  if (!tag && controller.mode !== 'new') {
    return (
      <KolamEmptyState
        message="Pilih salah satu tag dari daftar untuk melihat detail."
        title="Belum ada tag dipilih"
      />
    );
  }

  return (
    <View style={styles.stack}>
      {!editable && tag ? (
        <>
          <KolamLabelFieldDetailOverview
            hero={<TagHero tag={tag} />}
            status={{
              intent: tag.status === 'active' ? 'success' : 'warning',
              label: getTagStatusLabel(tag.status),
            }}
            metrics={[
              { label: 'Produk', value: tag.usage.products.length },
              { label: 'Bahan Baku', value: tag.usage.rawMaterials.length },
              { label: 'Layanan', value: tag.usage.services.length },
            ]}
            meta={[
              { label: 'Warna', value: tag.color },
              { label: 'Pembuat', value: tag.createdBy || '-' },
              ...(tag.description
                ? [
                    {
                      label: 'Deskripsi',
                      value: stripHtmlForDetail(tag.description),
                    },
                  ]
                : []),
              ...(tag.updatedAt
                ? [
                    {
                      label: 'Diperbarui',
                      value: formatDateTime(tag.updatedAt),
                    },
                  ]
                : []),
            ]}
            sections={[
              createUsageSection(
                'Produk',
                'Produk yang menggunakan tag ini',
                tag.usage.products,
              ),
              createUsageSection(
                'Bahan Baku',
                'Bahan baku yang menggunakan tag ini',
                tag.usage.rawMaterials,
              ),
              createUsageSection(
                'Layanan',
                'Layanan yang menggunakan tag ini',
                tag.usage.services,
              ),
              createUsageSection(
                'Freyer',
                'Data freyer yang menggunakan tag ini',
                tag.usage.freyer,
              ),
              createUsageSection(
                'Teranura',
                'Data teranura yang menggunakan tag ini',
                tag.usage.teranura,
              ),
              createUsageSection(
                'Species',
                'Species yang menggunakan tag ini',
                tag.usage.species,
              ),
            ]}
          />
        </>
      ) : (
        <KolamTagForm controller={controller} />
      )}
    </View>
  );
}

function KolamTagForm({ controller }: { controller: KolamTagController }) {
  const form = controller.form;

  return (
    <KolamNativeFormSection section={getKolamFormSection('tag-detail')}>
      <View style={settingsWebFormStyles.settingsWebFormFields}>
        <View style={settingsWebFormStyles.settingsWebFormFieldsGrid}>
          <FieldShell label="Nama Tag" required>
            <KolamFormTextField
              editable={!controller.saving}
              onChangeText={name => controller.onChangeForm({ name })}
              placeholder="Nama tag"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={form.name}
            />
          </FieldShell>
          <View style={styles.formSplitRow}>
            <View style={styles.formSplitCell}>
              <FieldShell label="Status" required>
                <View style={styles.segmentRow}>
                  {(['active', 'inactive'] as KolamTagStatus[]).map(status => (
                    <KolamButton
                      intent={form.status === status ? 'primary' : 'outline'}
                      key={status}
                      label={getTagStatusLabel(status)}
                      onPress={() => controller.onChangeForm({ status })}
                    />
                  ))}
                </View>
              </FieldShell>
            </View>
            <View style={styles.formSplitCell}>
              <FieldShell label="Warna" required>
                <KolamColorSwatchPicker
                  disabled={controller.saving}
                  onChange={color => controller.onChangeForm({ color })}
                  value={form.color}
                />
              </FieldShell>
            </View>
          </View>
          <FieldShell label="Deskripsi">
            <KolamTipTapRichTextEditor
              editable={!controller.saving}
              onChangeText={description =>
                controller.onChangeForm({ description })
              }
              placeholder="Deskripsi tag"
              value={form.description}
            />
          </FieldShell>
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

function TagHero({ tag }: { tag: KolamTag }) {
  const color = normalizeTagColor(tag.color);

  return (
    <View style={[styles.tagHero, { borderColor: color }]}>
      <View style={[styles.tagHeroDot, { backgroundColor: color }]} />
      <KolamCopyStack
        items={[
          { id: 'hash', text: '#', style: styles.tagHeroHash },
          { id: 'name', text: tag.name, style: styles.tagHeroName },
        ]}
      />
    </View>
  );
}

function filterTags(
  tags: KolamTag[],
  search: string,
  statusFilter: TagStatusFilter,
) {
  const query = search.trim().toLowerCase();

  return tags.filter(tag => {
    if (statusFilter !== 'all' && tag.status !== statusFilter) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [tag.name, tag.description, tag.color, tag.createdBy]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });
}

function sortTags(tags: KolamTag[], sortMode: TagSortMode) {
  return [...tags].sort((left, right) => {
    if (sortMode === 'newest') {
      return (
        getTagTime(right) - getTagTime(left) ||
        left.name.localeCompare(right.name)
      );
    }

    return sortMode === 'name-desc'
      ? right.name.localeCompare(left.name)
      : left.name.localeCompare(right.name);
  });
}

function getTagTime(tag: KolamTag) {
  const timestamp = Date.parse(tag.createdAt ?? tag.updatedAt ?? '');
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getTagRoute(tag: KolamTag) {
  return `/tags/${encodeURIComponent(tag.name)}`;
}

function getTagStatusLabel(status: KolamTagStatus) {
  return status === 'inactive' ? 'Nonaktif' : 'Aktif';
}

function createUsageSection(
  title: string,
  description: string,
  items: KolamTagUsageItem[],
) {
  return {
    title,
    total: items.length,
    description,
    items: items.map(item => ({
      badge: item.type || undefined,
      meta: [item.sku, item.slug].filter(Boolean).join(' - '),
      title: item.name,
    })),
    emptyText: `Tidak ada ${title.toLowerCase()} yang menggunakan tag ini`,
  };
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
  tagTableIdentityCell: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    overflow: 'visible',
    width: '100%',
  },
  tagIdentity: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    maxWidth: '100%',
    minWidth: 0,
  },
  tagDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    flexShrink: 0,
  },
  tagCopy: {
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
  colorChip: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  colorChipDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  colorChipText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  notesText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    width: '100%',
  },
  countText: {
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
  tagActionMenuRaised: {
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
  tagHero: {
    width: 168,
    minHeight: 96,
    gap: 8,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: V.colors.bg,
  },
  tagHeroDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  tagHeroHash: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 18,
    fontWeight: '900',
  },
  tagHeroName: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 22,
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
  segmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 16,
  },
});
