import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  KOLAM_TAXONOMY_LEVELS,
  KOLAM_TAXONOMY_PARENT_LEVEL,
  getTaxonomyLevelLabel,
  getTaxonomyStatusLabel,
  type KolamTaxonomy,
  type KolamTaxonomyLevel,
  type KolamTaxonomyStatus,
} from '../domain/kolam-taxonomy';
import { getKolamFormSection } from '../domain/kolam-form';
import {
  countActiveLocaleAuditItems,
  createTaxonomyLocaleAuditItems,
} from '../domain/kolam-locale-audit';
import { getKolamTableColumns } from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamTaxonomyController,
  type KolamTaxonomyController,
} from '../hooks/use-kolam-taxonomy-controller';
import { KolamButton } from './kolam-button';
import { KolamCatalogTranslationsEditor } from './kolam-catalog-translations-editor';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDataTableHeader } from './kolam-data-table-header';
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

type TaxonomySortMode = 'name-asc' | 'name-desc' | 'level-asc' | 'newest';
type TaxonomyLevelFilter = 'all' | KolamTaxonomyLevel;
type TaxonomyStatusFilter = 'all' | KolamTaxonomyStatus;
type TaxonomyRootFilter = 'all' | 'root';

export function KolamTaxonomySurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamTaxonomyController(route);

  return (
    <KolamTaxonomyShell controller={controller} onRouteChange={onRouteChange}>
      {controller.mode === 'list' ? (
        <KolamTaxonomyList controller={controller} onRouteChange={onRouteChange} />
      ) : (
        <KolamTaxonomyDetail controller={controller} />
      )}
    </KolamTaxonomyShell>
  );
}

function KolamTaxonomyShell({
  children,
  controller,
  onRouteChange,
}: {
  children: React.ReactNode;
  controller: KolamTaxonomyController;
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
                onRouteChange?.('/taxonomy/baru');
              }}
            />
          ) : (
            <KolamButton
              label="Daftar"
              onPress={() => {
                controller.onBackToList();
                onRouteChange?.('/taxonomy');
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

function KolamTaxonomyList({
  controller,
  onRouteChange,
}: {
  controller: KolamTaxonomyController;
  onRouteChange?: (route: string) => void;
}) {
  const [search, setSearch] = React.useState('');
  const [sortMode, setSortMode] = React.useState<TaxonomySortMode>('name-asc');
  const [levelFilter, setLevelFilter] = React.useState<TaxonomyLevelFilter>('all');
  const [statusFilter, setStatusFilter] =
    React.useState<TaxonomyStatusFilter>('all');
  const [rootFilter, setRootFilter] = React.useState<TaxonomyRootFilter>('all');
  const [pageSize, setPageSize] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const [deleteCandidate, setDeleteCandidate] =
    React.useState<KolamTaxonomy | null>(null);
  const summary = getTaxonomySummary(controller.taxonomies);
  const filteredTaxonomies = React.useMemo(
    () =>
      filterTaxonomies(
        controller.taxonomies,
        search,
        levelFilter,
        statusFilter,
        rootFilter,
      ),
    [controller.taxonomies, levelFilter, rootFilter, search, statusFilter],
  );
  const sortedTaxonomies = React.useMemo(
    () => sortTaxonomies(filteredTaxonomies, sortMode),
    [filteredTaxonomies, sortMode],
  );
  const pageCount = Math.max(1, Math.ceil(sortedTaxonomies.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pagedTaxonomies = sortedTaxonomies.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  React.useEffect(() => {
    setPage(1);
  }, [levelFilter, pageSize, rootFilter, search, sortMode, statusFilter]);

  return (
    <View style={styles.stack}>
      <View style={styles.summaryGrid}>
        <SummaryTile label="Total Taksonomi" value={controller.taxonomies.length} />
        <SummaryTile label="Aktif" value={summary.active} />
        <SummaryTile label="Nonaktif" value={summary.inactive} />
        <SummaryTile label="Genus" value={summary.genus} />
      </View>
      <View style={styles.tableToolbar}>
        <KolamFormTextField
          onChangeText={setSearch}
          placeholder="Cari taksonomi..."
          style={styles.searchInput}
          value={search}
        />
        <KolamDropdownSelect<TaxonomySortMode>
          label="Urutan"
          onChange={setSortMode}
          options={[
            { label: 'Nama A-Z', value: 'name-asc' },
            { label: 'Nama Z-A', value: 'name-desc' },
            { label: 'Tingkat', value: 'level-asc' },
            { label: 'Terbaru', value: 'newest' },
          ]}
          value={sortMode}
        />
        <KolamDropdownSelect<TaxonomyLevelFilter>
          label="Tingkat"
          onChange={setLevelFilter}
          options={[
            { label: 'Semua', value: 'all' },
            ...KOLAM_TAXONOMY_LEVELS.map(level => ({
              label: getTaxonomyLevelLabel(level),
              value: level,
            })),
          ]}
          value={levelFilter}
        />
        <KolamDropdownSelect<TaxonomyRootFilter>
          label="Hierarki"
          onChange={setRootFilter}
          options={[
            { label: 'Semua', value: 'all' },
            { label: 'Hanya akar', value: 'root' },
          ]}
          value={rootFilter}
        />
        <KolamDropdownSelect<TaxonomyStatusFilter>
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
          total={sortedTaxonomies.length}
        />
      </View>
      <KolamContentFrame variant="settingsWebConfig">
        <KolamDataTableHeader columns={getKolamTableColumns('taxonomy')} />
        {pagedTaxonomies.length ? (
          pagedTaxonomies.map(taxonomy => (
            <KolamTaxonomyRow
              key={taxonomy.id}
              onDelete={() => setDeleteCandidate(taxonomy)}
              onEdit={() => {
                void controller.onSelectTaxonomy(taxonomy);
                onRouteChange?.(`${getTaxonomyRoute(taxonomy)}/edit`);
              }}
              onSelect={() => {
                void controller.onSelectTaxonomy(taxonomy);
                onRouteChange?.(getTaxonomyRoute(taxonomy));
              }}
              taxonomy={taxonomy}
            />
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              compact
              message="Data Taksonomi belum tersedia dari cache atau backend."
              title={
                controller.loading ? 'Memuat taksonomi...' : 'Belum ada taksonomi'
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
            items={[{ id: 'page', text: `${safePage} / ${pageCount}`, style: styles.pageLabel }]}
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
        itemType="taksonomi"
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => {
          const taxonomy = deleteCandidate;
          setDeleteCandidate(null);

          if (!taxonomy) {
            return;
          }

          void controller.onDeleteTaxonomy(taxonomy).then(deleted => {
            if (deleted) {
              onRouteChange?.('/taxonomy');
            }
          });
        }}
        visible={Boolean(deleteCandidate)}
      />
    </View>
  );
}

function KolamTaxonomyRow({
  onDelete,
  onEdit,
  onSelect,
  taxonomy,
}: {
  onDelete: () => void;
  onEdit: () => void;
  onSelect: () => void;
  taxonomy: KolamTaxonomy;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);

  return (
    <KolamDataTableRowFrame style={actionMenuOpen && styles.activeActionRow}>
      <View style={styles.identityCell}>
        <View style={styles.identity}>
          <View style={styles.taxonomyMark} />
          <KolamCopyStack
            containerStyle={styles.identityCopy}
            items={[
              { id: 'name', text: taxonomy.name, style: styles.rowTitle },
              {
                id: 'path',
                text: taxonomy.path || taxonomy.parentName || 'Akar taksonomi',
                style: styles.rowMeta,
                textProps: { ellipsizeMode: 'tail', numberOfLines: 1 },
              },
            ]}
          />
        </View>
      </View>
      <View style={styles.levelCell}>
        <KolamStatusBadge intent="muted" label={getTaxonomyLevelLabel(taxonomy.level)} />
      </View>
      <View style={styles.scientificCell}>
        <KolamCopyStack
          items={[
            {
              id: 'scientific',
              text: taxonomy.scientificName || '-',
              style: [styles.rowMeta, taxonomy.scientificName ? styles.italicText : null],
              textProps: { ellipsizeMode: 'tail', numberOfLines: 1 },
            },
          ]}
        />
      </View>
      <View style={styles.childrenCell}>
        <KolamCopyStack
          items={[{ id: 'children', text: String(taxonomy.children.length), style: styles.amountText }]}
        />
      </View>
      <View style={styles.pathCell}>
        <KolamCopyStack
          items={[
            {
              id: 'path',
              text: taxonomy.path || '-',
              style: styles.pathText,
              textProps: { ellipsizeMode: 'tail', numberOfLines: 1 },
            },
          ]}
        />
      </View>
      <View style={styles.statusCell}>
        <KolamStatusBadge
          intent={taxonomy.status === 'active' ? 'success' : 'warning'}
          label={getTaxonomyStatusLabel(taxonomy.status)}
        />
      </View>
      <View style={styles.overflowCell}>
        <KolamOverflowMenuButton
          accessibilityLabel={`Menu ${taxonomy.name}`}
          actions={[
            { label: 'Lihat', onPress: onSelect },
            { label: 'Rubah', onPress: onEdit },
            { label: 'Hapus', onPress: onDelete, tone: 'danger' },
          ]}
          onOpenChange={setActionMenuOpen}
        />
      </View>
    </KolamDataTableRowFrame>
  );
}

function KolamTaxonomyDetail({
  controller,
}: {
  controller: KolamTaxonomyController;
}) {
  const taxonomy = controller.selectedTaxonomy;
  const editable = controller.isEditable;
  const localeAuditItems = taxonomy
    ? createTaxonomyLocaleAuditItems({
        description: taxonomy.description,
        name: taxonomy.name,
        translations: taxonomy.translations,
      })
    : [];

  if (!taxonomy && controller.mode !== 'new') {
    return (
      <KolamEmptyState
        message="Pilih salah satu taksonomi dari daftar untuk melihat detail."
        title="Belum ada taksonomi dipilih"
      />
    );
  }

  return (
    <View style={styles.stack}>
      {!editable && taxonomy ? (
        <>
          <View style={styles.detailActions}>
            <KolamButton intent="primary" label="Edit" onPress={controller.onEdit} />
          </View>
          <KolamLabelFieldDetailOverview
            hero={<TaxonomyHero taxonomy={taxonomy} />}
            meta={[
              { label: 'Tingkat', value: getTaxonomyLevelLabel(taxonomy.level) },
              { label: 'Induk', value: taxonomy.parentName || 'Akar taksonomi' },
              ...(taxonomy.scientificName
                ? [{ label: 'Nama ilmiah', value: taxonomy.scientificName }]
                : []),
              ...(taxonomy.commonName
                ? [{ label: 'Nama umum', value: taxonomy.commonName }]
                : []),
              ...(taxonomy.path ? [{ label: 'Jalur', value: taxonomy.path }] : []),
            ]}
            metrics={[
              { label: 'Anak', value: taxonomy.children.length },
              { label: 'Foto', value: taxonomy.photos.length },
              { label: 'Locale aktif', value: countActiveLocaleAuditItems(localeAuditItems) },
            ]}
            sections={[
              {
                accordion: true,
                description:
                  'Audit isi locale taksonomi yang tersimpan lokal dan siap dikirim ke backend.',
                emptyText: 'Belum ada data locale untuk diaudit.',
                items: localeAuditItems,
                title: 'Terjemahan',
                total: countActiveLocaleAuditItems(localeAuditItems),
              },
              {
                description: 'Urutan induk sampai taksonomi saat ini',
                emptyText: 'Jalur taksonomi belum tersedia dari cache lokal.',
                items: getPathItems(taxonomy),
                title: 'Jalur Taksonomi',
                total: getPathItems(taxonomy).length,
              },
              {
                description: 'Taksonomi anak langsung dari node ini',
                emptyText: 'Tidak ada anak taksonomi.',
                items: taxonomy.children.map(child => ({
                  badge: getTaxonomyLevelLabel(child.level),
                  meta: child.scientificName || child.path || undefined,
                  title: child.name,
                })),
                title: 'Anak',
                total: taxonomy.children.length,
              },
              {
                description: 'Referensi foto taksonomi dari backend yang tersimpan lokal',
                emptyText: 'Belum ada foto taksonomi.',
                items: taxonomy.photos.map((photo, index) => ({
                  title: `Foto ${index + 1}`,
                  value: photo,
                })),
                title: 'Foto',
                total: taxonomy.photos.length,
              },
            ]}
            status={{
              intent: taxonomy.status === 'active' ? 'success' : 'warning',
              label: getTaxonomyStatusLabel(taxonomy.status),
            }}
          />
        </>
      ) : (
        <KolamTaxonomyForm controller={controller} />
      )}
    </View>
  );
}

function KolamTaxonomyForm({
  controller,
}: {
  controller: KolamTaxonomyController;
}) {
  const form = controller.form;
  const editableHierarchy = controller.mode === 'new';
  const parentLevel = KOLAM_TAXONOMY_PARENT_LEVEL[form.level];
  const parentOptions = controller.taxonomies
    .filter(taxonomy => taxonomy.level === parentLevel)
    .sort((left, right) => left.name.localeCompare(right.name));

  return (
    <KolamNativeFormSection section={getKolamFormSection('taxonomy-detail')}>
      <View style={settingsWebFormStyles.settingsWebFormFields}>
        <View style={settingsWebFormStyles.settingsWebFormFieldsGrid}>
          <View style={styles.formSplitRow}>
            <View style={styles.formSplitCell}>
              <FieldShell label="Tingkat" required>
                {editableHierarchy ? (
                  <KolamDropdownSelect<KolamTaxonomyLevel>
                    label="Tingkat"
                    onChange={level =>
                      controller.onChangeForm({
                        level,
                        parentId: '',
                      })
                    }
                    options={KOLAM_TAXONOMY_LEVELS.map(level => ({
                      label: getTaxonomyLevelLabel(level),
                      value: level,
                    }))}
                    value={form.level}
                  />
                ) : (
                  <ReadonlyValue value={getTaxonomyLevelLabel(form.level)} />
                )}
              </FieldShell>
            </View>
            <View style={styles.formSplitCell}>
              <FieldShell label="Induk">
                {editableHierarchy && parentLevel ? (
                  <KolamDropdownSelect
                    label="Induk"
                    onChange={parentId => controller.onChangeForm({ parentId })}
                    options={[
                      { label: `Pilih ${getTaxonomyLevelLabel(parentLevel)}`, value: '' },
                      ...parentOptions.map(parent => ({
                        label: parent.name,
                        value: parent.id,
                      })),
                    ]}
                    searchable
                    searchPlaceholder="Cari induk..."
                    value={form.parentId}
                  />
                ) : (
                  <ReadonlyValue
                    value={
                      form.level === 'Kingdom'
                        ? 'Akar taksonomi'
                        : controller.selectedTaxonomy?.parentName || '-'
                    }
                  />
                )}
              </FieldShell>
            </View>
          </View>
          <View style={styles.formSplitRow}>
            <View style={styles.formSplitCell}>
              <FieldShell label="Nama ilmiah">
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={scientificName =>
                    controller.onChangeForm({ scientificName })
                  }
                  placeholder="Nama ilmiah"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.scientificName}
                />
              </FieldShell>
            </View>
            <View style={styles.formSplitCell}>
              <FieldShell label="Nama umum">
                <KolamFormTextField
                  editable={!controller.saving}
                  onChangeText={commonName => controller.onChangeForm({ commonName })}
                  placeholder="Nama umum"
                  style={settingsWebFormStyles.settingsWebFormFieldValue}
                  value={form.commonName}
                />
              </FieldShell>
            </View>
          </View>
          <FieldShell label="Status" required>
            <View style={styles.segmentRow}>
              {(['active', 'inactive'] as KolamTaxonomyStatus[]).map(status => (
                <KolamButton
                  intent={form.status === status ? 'primary' : 'outline'}
                  key={status}
                  label={getTaxonomyStatusLabel(status)}
                  onPress={() => controller.onChangeForm({ status })}
                />
              ))}
            </View>
          </FieldShell>
          <KolamCatalogTranslationsEditor
            editable={!controller.saving}
            kind="taxonomy"
            onChange={translations => controller.onChangeForm({ translations })}
            primary={{
              name: form.name,
              description: form.description,
              onChange: patch => controller.onChangeForm(patch),
            }}
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

function ReadonlyValue({ value }: { value: string }) {
  return (
    <View style={styles.readonlyBox}>
      <KolamCopyStack items={[{ id: 'value', text: value, style: styles.readonlyText }]} />
    </View>
  );
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryTile}>
      <KolamCopyStack
        items={[
          { id: 'value', text: String(value), style: styles.summaryValue },
          { id: 'label', text: label, style: styles.summaryLabel },
        ]}
      />
    </View>
  );
}

function TaxonomyHero({ taxonomy }: { taxonomy: KolamTaxonomy }) {
  return (
    <View style={styles.heroMarkWrap}>
      <View style={styles.heroMark} />
      <KolamCopyStack
        items={[
          { id: 'level', text: getTaxonomyLevelLabel(taxonomy.level), style: styles.heroLevel },
          { id: 'name', text: taxonomy.name, style: styles.heroName },
        ]}
      />
    </View>
  );
}

function getPathItems(taxonomy: KolamTaxonomy) {
  const pathItems = taxonomy.fullPath.length
    ? taxonomy.fullPath
    : taxonomy.ancestors;
  const withSelf = pathItems.some(item => item.id === taxonomy.id)
    ? pathItems
    : [...pathItems, taxonomy];

  return withSelf.map(item => ({
    badge: getTaxonomyLevelLabel(item.level),
    meta: item.scientificName || item.path || undefined,
    title: item.name,
  }));
}

function getTaxonomyRoute(taxonomy: KolamTaxonomy) {
  return `/taxonomy/${encodeURIComponent(taxonomy.slug || taxonomy.name || taxonomy.id)}`;
}

function getTaxonomySummary(taxonomies: KolamTaxonomy[]) {
  return taxonomies.reduce(
    (summary, taxonomy) => ({
      active: summary.active + (taxonomy.status === 'active' ? 1 : 0),
      inactive: summary.inactive + (taxonomy.status === 'inactive' ? 1 : 0),
      genus: summary.genus + (taxonomy.level === 'Genus' ? 1 : 0),
    }),
    { active: 0, genus: 0, inactive: 0 },
  );
}

function filterTaxonomies(
  taxonomies: KolamTaxonomy[],
  search: string,
  levelFilter: TaxonomyLevelFilter,
  statusFilter: TaxonomyStatusFilter,
  rootFilter: TaxonomyRootFilter,
) {
  const query = search.trim().toLowerCase();

  return taxonomies.filter(taxonomy => {
    const matchesSearch = query
      ? [
          taxonomy.name,
          taxonomy.path,
          taxonomy.scientificName,
          taxonomy.commonName,
          taxonomy.parentName ?? '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(query)
      : true;
    const matchesLevel = levelFilter === 'all' || taxonomy.level === levelFilter;
    const matchesStatus =
      statusFilter === 'all' || taxonomy.status === statusFilter;
    const matchesRoot = rootFilter === 'all' || !taxonomy.parentId;

    return matchesSearch && matchesLevel && matchesStatus && matchesRoot;
  });
}

function sortTaxonomies(taxonomies: KolamTaxonomy[], sortMode: TaxonomySortMode) {
  const next = [...taxonomies];
  switch (sortMode) {
    case 'name-desc':
      return next.sort((left, right) => right.name.localeCompare(left.name));
    case 'level-asc':
      return next.sort((left, right) => {
        const levelDiff =
          KOLAM_TAXONOMY_LEVELS.indexOf(left.level) -
          KOLAM_TAXONOMY_LEVELS.indexOf(right.level);
        return levelDiff || left.name.localeCompare(right.name);
      });
    case 'newest':
      return next.sort((left, right) =>
        String(right.updatedAt ?? '').localeCompare(String(left.updatedAt ?? '')),
      );
    case 'name-asc':
    default:
      return next.sort((left, right) => left.name.localeCompare(right.name));
  }
}

const styles = StyleSheet.create({
  surface: {
    gap: 14,
  },
  header: {
    alignItems: 'flex-end',
  },
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  errorBadge: {
    alignSelf: 'flex-start',
  },
  stack: {
    gap: 14,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryTile: {
    minWidth: 170,
    flexGrow: 1,
    gap: 6,
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
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
  },
  tableToolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    minWidth: 220,
    flexGrow: 1,
  },
  emptyWrap: {
    minHeight: 220,
    justifyContent: 'center',
  },
  activeActionRow: {
    zIndex: 20,
  },
  identityCell: {
    flex: 1,
    minWidth: 220,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
  },
  taxonomyMark: {
    width: 12,
    height: 36,
    borderRadius: 6,
    backgroundColor: V.colors.primary,
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
    fontSize: 12,
    fontWeight: '700',
  },
  italicText: {
    fontStyle: 'italic',
  },
  levelCell: {
    width: 120,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  scientificCell: {
    width: 180,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  childrenCell: {
    width: 88,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  amountText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'right',
  },
  pathCell: {
    width: 220,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  pathText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  statusCell: {
    width: 116,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  overflowCell: {
    width: 64,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  pageLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
  },
  detailActions: {
    alignItems: 'flex-end',
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
  readonlyBox: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
    borderColor: V.colors.border,
    borderWidth: 1,
    backgroundColor: V.colors.secondary,
  },
  readonlyText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  heroMarkWrap: {
    width: 160,
    gap: 10,
  },
  heroMark: {
    width: 58,
    height: 58,
    borderRadius: 8,
    backgroundColor: V.colors.primary,
  },
  heroLevel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  heroName: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 18,
    fontWeight: '900',
  },
});

