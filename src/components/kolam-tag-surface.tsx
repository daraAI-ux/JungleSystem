import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  normalizeTagColor,
  type KolamTag,
  type KolamTagStatus,
  type KolamTagUsageItem,
} from '../domain/kolam-tag';
import { getKolamFormSection } from '../domain/kolam-form';
import { getKolamTableColumns } from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamTagController,
  type KolamTagController,
} from '../hooks/use-kolam-tag-controller';
import { KolamButton } from './kolam-button';
import { KolamColorSwatchPicker } from './kolam-color-swatch-picker';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
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
import { KolamTipTapRichTextEditor } from './kolam-tiptap-rich-text-editor';

type TagSortMode = 'name-asc' | 'name-desc' | 'newest';
type TagStatusFilter = 'all' | KolamTagStatus;

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
                onRouteChange?.('/tags/baru');
              }}
            />
          ) : (
            <KolamButton
              label="Daftar"
              onPress={() => {
                controller.onBackToList();
                onRouteChange?.('/tags');
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
  const [pageSize, setPageSize] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const [deleteCandidate, setDeleteCandidate] =
    React.useState<KolamTag | null>(null);
  const summary = getTagSummary(controller.tags);
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

  React.useEffect(() => {
    setPage(1);
  }, [pageSize, search, sortMode, statusFilter]);

  return (
    <View style={styles.stack}>
      <View style={styles.summaryGrid}>
        <SummaryTile label="Total Tag" value={controller.tags.length} />
        <SummaryTile label="Aktif" value={summary.active} />
        <SummaryTile label="Nonaktif" value={summary.inactive} />
        <SummaryTile label="Digunakan" value={summary.used} />
      </View>
      <View style={styles.tableToolbar}>
        <KolamFormTextField
          onChangeText={setSearch}
          placeholder="Cari tag..."
          style={styles.searchInput}
          value={search}
        />
        <KolamDropdownSelect<TagSortMode>
          label="Urutan"
          onChange={setSortMode}
          options={[
            { label: 'Nama A-Z', value: 'name-asc' },
            { label: 'Nama Z-A', value: 'name-desc' },
            { label: 'Terbaru', value: 'newest' },
          ]}
          value={sortMode}
        />
        <KolamDropdownSelect<TagStatusFilter>
          label="Status"
          onChange={setStatusFilter}
          options={[
            { label: 'Semua', value: 'all' },
            { label: 'Aktif', value: 'active' },
            { label: 'Nonaktif', value: 'inactive' },
          ]}
          value={statusFilter}
        />
        <KolamPaginationSizeControl onChange={setPageSize} value={pageSize} />
        <KolamPaginationSummaryLabel
          page={safePage}
          pageSize={pageSize}
          total={sortedTags.length}
        />
      </View>
      <KolamContentFrame variant="settingsWebConfig">
        <KolamDataTableHeader columns={getKolamTableColumns('tag')} />
        {pagedTags.length ? (
          pagedTags.map(tag => (
            <KolamTagRow
              key={tag.id}
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
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              compact
              message="Data Tag belum tersedia dari cache atau backend."
              title={controller.loading ? 'Memuat tag...' : 'Belum ada tag'}
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

function KolamTagRow({
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
  const color = normalizeTagColor(tag.color);

  return (
    <KolamDataTableRowFrame style={actionMenuOpen && styles.activeActionRow}>
      <View style={styles.tagIdentityCell}>
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
      <View style={styles.colorCell}>
        <View style={[styles.colorChip, { borderColor: color }]}>
          <View style={[styles.colorChipDot, { backgroundColor: color }]} />
          <KolamCopyStack items={[{ id: 'color', text: color, style: styles.colorChipText }]} />
        </View>
      </View>
      <View style={styles.descriptionCell}>
        <KolamCopyStack
          items={[
            {
              id: 'description',
              text: stripHtmlForDetail(tag.description) || '-',
              style: styles.descriptionText,
              textProps: {
                ellipsizeMode: 'tail',
                numberOfLines: 1,
              },
            },
          ]}
        />
      </View>
      <KolamDataTableAmountCell style={styles.usageCell}>
        {tag.usageTotal}
      </KolamDataTableAmountCell>
      <View style={styles.statusCell}>
        <KolamStatusBadge
          intent={tag.status === 'active' ? 'success' : 'warning'}
          label={getTagStatusLabel(tag.status)}
        />
      </View>
      <View style={styles.overflowCell}>
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
    </KolamDataTableRowFrame>
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
          <View style={styles.detailActions}>
            <KolamButton intent="primary" label="Edit" onPress={controller.onEdit} />
          </View>
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
                ? [{ label: 'Diperbarui', value: formatDateTime(tag.updatedAt) }]
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

function getTagSummary(tags: KolamTag[]) {
  return tags.reduce(
    (summary, tag) => {
      summary[tag.status] += 1;
      if (tag.usageTotal > 0) {
        summary.used += 1;
      }

      return summary;
    },
    { active: 0, inactive: 0, used: 0 },
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
  tagIdentityCell: {
    flex: 1,
    minWidth: 0,
  },
  tagIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tagDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
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
  },
  rowMeta: {
    marginTop: 2,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
  },
  colorCell: {
    width: 96,
    alignItems: 'flex-start',
  },
  colorChip: {
    width: 96,
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  colorChipText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
  },
  colorChipDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  descriptionCell: {
    width: 320,
    minWidth: 0,
    overflow: 'hidden',
  },
  descriptionText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    width: 320,
  },
  usageCell: {
    width: 112,
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
