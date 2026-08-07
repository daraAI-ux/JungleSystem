import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamTaxonomyController,
  type KolamTaxonomyController,
} from '../hooks/use-kolam-taxonomy-controller';
import { KolamButton } from './kolam-button';
import {KolamSaveButton} from './kolam-save-button';
import {KolamDaftarButton} from './kolam-daftar-button';
import {KolamEditButton} from './kolam-edit-button';
import { KolamCatalogTranslationsEditor } from './kolam-catalog-translations-editor';
import { KolamCheckmarkIcon } from './kolam-checkmark-icon';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
} from './kolam-dropdown-select';
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

type TaxonomySortMode = 'name-asc' | 'name-desc' | 'level-asc' | 'newest';
type TaxonomyLevelFilter = 'all' | KolamTaxonomyLevel;
type TaxonomyStatusFilter = 'all' | KolamTaxonomyStatus;
type TaxonomyRootFilter = 'all' | 'root';
type TaxonomyListFilterPanel = 'sort' | 'level' | 'root' | 'status';

const TAXONOMY_FILTER_PANEL_WIDTH = 220;

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
        <KolamTaxonomyList
          controller={controller}
          onRouteChange={onRouteChange}
        />
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
      ? 'Taksonomi baru'
      : controller.mode === 'edit'
      ? `Edit · ${
          controller.selectedTaxonomy?.name ||
          controller.form.name ||
          'Taksonomi'
        }`
      : controller.selectedTaxonomy?.name || 'Detail taksonomi';

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
                onRouteChange?.('/taxonomy');
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

function KolamTaxonomyList({
  controller,
  onRouteChange,
}: {
  controller: KolamTaxonomyController;
  onRouteChange?: (route: string) => void;
}) {
  const [search, setSearch] = React.useState('');
  const [sortMode, setSortMode] = React.useState<TaxonomySortMode>('name-asc');
  const [levelFilter, setLevelFilter] =
    React.useState<TaxonomyLevelFilter>('all');
  const [statusFilter, setStatusFilter] =
    React.useState<TaxonomyStatusFilter>('all');
  const [rootFilter, setRootFilter] = React.useState<TaxonomyRootFilter>('all');
  const pageSize = 10;
  const [page, setPage] = React.useState(1);
  const [activeFilterPanel, setActiveFilterPanel] =
    React.useState<TaxonomyListFilterPanel | null>(null);
  const [panelAnchor, setPanelAnchor] =
    React.useState<KolamFilterPanelAnchor | null>(null);
  const toolbarRef = React.useRef<View>(null);
  const sortTriggerRef = React.useRef<View>(null);
  const levelTriggerRef = React.useRef<View>(null);
  const rootTriggerRef = React.useRef<View>(null);
  const statusTriggerRef = React.useRef<View>(null);
  const [deleteCandidate, setDeleteCandidate] =
    React.useState<KolamTaxonomy | null>(null);
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
  const listColumns = React.useMemo<Array<KolamListTableColumn<KolamTaxonomy>>>(
    () => buildTaxonomyListColumns(),
    [],
  );
  const sortFilterLabel =
    sortMode === 'name-desc'
      ? 'Nama Z-A'
      : sortMode === 'level-asc'
      ? 'Tingkat'
      : sortMode === 'newest'
      ? 'Terbaru'
      : 'Nama A-Z';
  const levelFilterLabel =
    levelFilter === 'all'
      ? 'Semua Tingkat'
      : getTaxonomyLevelLabel(levelFilter);
  const rootFilterLabel =
    rootFilter === 'root' ? 'Hanya Akar' : 'Semua Hierarki';
  const statusFilterLabel =
    statusFilter === 'active'
      ? 'Aktif'
      : statusFilter === 'inactive'
      ? 'Nonaktif'
      : 'Semua Status';

  const getFilterTriggerRef = (panel: TaxonomyListFilterPanel) => {
    switch (panel) {
      case 'level':
        return levelTriggerRef;
      case 'root':
        return rootTriggerRef;
      case 'status':
        return statusTriggerRef;
      case 'sort':
      default:
        return sortTriggerRef;
    }
  };

  const anchorFilterPanel = React.useCallback(
    (panel: TaxonomyListFilterPanel) => {
      measureFilterPanelAnchor(
        toolbarRef.current,
        getFilterTriggerRef(panel).current,
        TAXONOMY_FILTER_PANEL_WIDTH,
        setPanelAnchor,
      );
    },
    [],
  );

  const openFilterPanel = (panel: TaxonomyListFilterPanel) => {
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
        TAXONOMY_FILTER_PANEL_WIDTH,
        anchor => {
          setPanelAnchor(anchor);
          setActiveFilterPanel(panel);
        },
      );
    });
  };

  React.useEffect(() => {
    setPage(1);
  }, [levelFilter, rootFilter, search, sortMode, statusFilter]);

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
                placeholder="Cari taksonomi..."
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
              <View ref={levelTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={levelFilter !== 'all'}
                  label={levelFilterLabel}
                  onPress={() => openFilterPanel('level')}
                  open={activeFilterPanel === 'level'}
                  variant="quiet"
                />
              </View>
              <View ref={rootTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={rootFilter !== 'all'}
                  label={rootFilterLabel}
                  onPress={() => openFilterPanel('root')}
                  open={activeFilterPanel === 'root'}
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
                  onRouteChange?.('/taxonomy/baru');
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
                width: TAXONOMY_FILTER_PANEL_WIDTH,
              },
            ]}
          >
            {getFilterPanelOptions(activeFilterPanel).map(option => {
              const selected = isFilterOptionSelected(
                activeFilterPanel,
                option.value,
                sortMode,
                levelFilter,
                rootFilter,
                statusFilter,
              );
              return (
                <KolamInteractionFrame
                  accessibilityLabel={option.label}
                  key={`${activeFilterPanel}-${option.value}`}
                  onPress={() => {
                    if (activeFilterPanel === 'sort') {
                      setSortMode(option.value as TaxonomySortMode);
                    } else if (activeFilterPanel === 'level') {
                      setLevelFilter(option.value as TaxonomyLevelFilter);
                    } else if (activeFilterPanel === 'root') {
                      setRootFilter(option.value as TaxonomyRootFilter);
                    } else {
                      setStatusFilter(option.value as TaxonomyStatusFilter);
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
          controller.loading ? 'Memuat taksonomi...' : 'Belum ada taksonomi'
        }
        getRowKey={taxonomy => taxonomy.id}
        loading={controller.loading}
        pagination={{
          onPageChange: setPage,
          page: safePage,
          pageSize,
          total: sortedTaxonomies.length,
        }}
        renderActions={taxonomy => (
          <KolamTaxonomyActionsMenu
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
        )}
        rows={pagedTaxonomies}
      />
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

function buildTaxonomyListColumns(): Array<
  KolamListTableColumn<KolamTaxonomy>
> {
  return [
    {
      flex: 1.28,
      id: 'primary',
      label: 'Taksonomi',
      render: taxonomy => <KolamTaxonomyIdentityCell taxonomy={taxonomy} />,
    },
    {
      align: 'center',
      flex: 0.82,
      id: 'meta',
      label: 'Tingkat',
      render: taxonomy => (
        <KolamStatusBadge
          intent="muted"
          label={getTaxonomyLevelLabel(taxonomy.level)}
          style={styles.centerBadge}
        />
      ),
    },
    {
      align: 'center',
      flex: 1,
      id: 'notes',
      label: 'Nama Ilmiah',
      render: taxonomy => (
        <Text
          numberOfLines={1}
          style={[
            styles.notesText,
            taxonomy.scientificName ? styles.italicText : null,
          ]}
        >
          {taxonomy.scientificName || '-'}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.62,
      id: 'children',
      label: 'Anak',
      render: taxonomy => (
        <Text numberOfLines={1} style={styles.countText}>
          {String(taxonomy.children.length)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 1.08,
      id: 'marketplace',
      label: 'Jalur',
      render: taxonomy => (
        <Text numberOfLines={1} style={styles.pathText}>
          {taxonomy.path || '-'}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.82,
      id: 'status',
      label: 'Status',
      render: taxonomy => (
        <KolamStatusBadge
          intent={taxonomy.status === 'active' ? 'success' : 'warning'}
          label={getTaxonomyStatusLabel(taxonomy.status)}
          style={styles.centerBadge}
        />
      ),
    },
  ];
}

function KolamTaxonomyIdentityCell({ taxonomy }: { taxonomy: KolamTaxonomy }) {
  return (
    <View style={styles.taxonomyTableIdentityCell}>
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
  );
}

function KolamTaxonomyActionsMenu({
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
    <View style={actionMenuOpen ? styles.taxonomyActionMenuRaised : null}>
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
        <KolamLabelFieldDetailOverview
          hero={<TaxonomyHero taxonomy={taxonomy} />}
          meta={[
            {
              label: 'Tingkat',
              value: getTaxonomyLevelLabel(taxonomy.level),
            },
            {
              label: 'Induk',
              value: taxonomy.parentName || 'Akar taksonomi',
            },
            ...(taxonomy.scientificName
              ? [{ label: 'Nama ilmiah', value: taxonomy.scientificName }]
              : []),
            ...(taxonomy.commonName
              ? [{ label: 'Nama umum', value: taxonomy.commonName }]
              : []),
            ...(taxonomy.path
              ? [{ label: 'Jalur', value: taxonomy.path }]
              : []),
          ]}
          metrics={[
            { label: 'Anak', value: taxonomy.children.length },
            { label: 'Foto', value: taxonomy.photos.length },
            {
              label: 'Locale aktif',
              value: countActiveLocaleAuditItems(localeAuditItems),
            },
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
              description:
                'Referensi foto taksonomi dari backend yang tersimpan lokal',
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
                      {
                        label: `Pilih ${getTaxonomyLevelLabel(parentLevel)}`,
                        value: '',
                      },
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
                  onChangeText={commonName =>
                    controller.onChangeForm({ commonName })
                  }
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

function ReadonlyValue({ value }: { value: string }) {
  return (
    <View style={styles.readonlyBox}>
      <KolamCopyStack
        items={[{ id: 'value', text: value, style: styles.readonlyText }]}
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
          {
            id: 'level',
            text: getTaxonomyLevelLabel(taxonomy.level),
            style: styles.heroLevel,
          },
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
  return `/taxonomy/${encodeURIComponent(
    taxonomy.slug || taxonomy.name || taxonomy.id,
  )}`;
}

function getFilterPanelOptions(panel: TaxonomyListFilterPanel) {
  if (panel === 'sort') {
    return [
      { label: 'Nama A-Z', value: 'name-asc' as TaxonomySortMode },
      { label: 'Nama Z-A', value: 'name-desc' as TaxonomySortMode },
      { label: 'Tingkat', value: 'level-asc' as TaxonomySortMode },
      { label: 'Terbaru', value: 'newest' as TaxonomySortMode },
    ];
  }

  if (panel === 'level') {
    return [
      { label: 'Semua Tingkat', value: 'all' as TaxonomyLevelFilter },
      ...KOLAM_TAXONOMY_LEVELS.map(level => ({
        label: getTaxonomyLevelLabel(level),
        value: level as TaxonomyLevelFilter,
      })),
    ];
  }

  if (panel === 'root') {
    return [
      { label: 'Semua Hierarki', value: 'all' as TaxonomyRootFilter },
      { label: 'Hanya Akar', value: 'root' as TaxonomyRootFilter },
    ];
  }

  return [
    { label: 'Semua Status', value: 'all' as TaxonomyStatusFilter },
    { label: 'Aktif', value: 'active' as TaxonomyStatusFilter },
    { label: 'Nonaktif', value: 'inactive' as TaxonomyStatusFilter },
  ];
}

function isFilterOptionSelected(
  panel: TaxonomyListFilterPanel,
  value: string,
  sortMode: TaxonomySortMode,
  levelFilter: TaxonomyLevelFilter,
  rootFilter: TaxonomyRootFilter,
  statusFilter: TaxonomyStatusFilter,
) {
  if (panel === 'sort') {
    return value === sortMode;
  }

  if (panel === 'level') {
    return value === levelFilter;
  }

  if (panel === 'root') {
    return value === rootFilter;
  }

  return value === statusFilter;
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
    const matchesLevel =
      levelFilter === 'all' || taxonomy.level === levelFilter;
    const matchesStatus =
      statusFilter === 'all' || taxonomy.status === statusFilter;
    const matchesRoot = rootFilter === 'all' || !taxonomy.parentId;

    return matchesSearch && matchesLevel && matchesStatus && matchesRoot;
  });
}

function sortTaxonomies(
  taxonomies: KolamTaxonomy[],
  sortMode: TaxonomySortMode,
) {
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
        String(right.updatedAt ?? '').localeCompare(
          String(left.updatedAt ?? ''),
        ),
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
  taxonomyTableIdentityCell: {
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
    flex: 1,
    minWidth: 0,
  },
  taxonomyMark: {
    width: 12,
    height: 36,
    borderRadius: 6,
    backgroundColor: V.colors.primary,
    flexShrink: 0,
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
  centerBadge: {
    alignSelf: 'center',
  },
  notesText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },
  italicText: {
    fontStyle: 'italic',
  },
  countText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    width: '100%',
  },
  pathText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },
  taxonomyActionMenuRaised: {
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
    gap: 8,
    paddingTop: 16,
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
