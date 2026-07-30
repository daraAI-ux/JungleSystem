import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import {
  createKolamDetailItemsFromRawArray,
  getKolamRawArray,
} from '../domain/kolam-detail-list';
import {
  getKolamBrandFlagByCountry,
  KOLAM_BRAND_FLAG_OPTIONS,
  type KolamBrand,
  type KolamBrandStatus,
} from '../domain/kolam-brand';
import { getKolamFormSection } from '../domain/kolam-form';
import {
  getKolamTableColumns,
  getKolamTableVisualContract,
  type KolamTableColumn,
} from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamBrandController,
  type KolamBrandController,
} from '../hooks/use-kolam-brand-controller';
import { KolamBrandLogo } from './kolam-brand-logo';
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
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFlagIcon } from './kolam-flag-icon';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamNativeFormSection } from './kolam-native-form-section';
import { KolamTipTapRichTextEditor } from './kolam-tiptap-rich-text-editor';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamHoverTooltip } from './kolam-hover-tooltip';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import { KolamLabelFieldDetailOverview } from './kolam-label-field-detail-overview';
import { KolamSearchField } from './kolam-search-field';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamTableFilterTrigger } from './kolam-table-filter-trigger';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

type BrandSortMode = 'name-asc' | 'name-desc';
type BrandAssetMode = 'none' | 'products-desc' | 'raws-desc';
type BrandListFilterPanel = 'sort' | 'asset';

const BRAND_FILTER_PANEL_WIDTH = 220;

export function KolamBrandSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamBrandController(route);

  return (
    <KolamModuleShell controller={controller} onRouteChange={onRouteChange}>
      {controller.mode === 'list' ? (
        <KolamBrandList controller={controller} onRouteChange={onRouteChange} />
      ) : (
        <KolamBrandDetail controller={controller} />
      )}
    </KolamModuleShell>
  );
}

function KolamModuleShell({
  children,
  controller,
  onRouteChange,
}: {
  children: React.ReactNode;
  controller: KolamBrandController;
  onRouteChange?: (route: string) => void;
}) {
  if (controller.mode === 'list') {
    return (
      <View style={styles.surface}>
        {controller.error ? (
          <KolamStatusBadge
            intent="danger"
            label={controller.error}
            style={styles.errorBadge}
            numberOfLines={2}
          />
        ) : null}
        {children}
      </View>
    );
  }

  const contextLabel =
    controller.mode === 'new'
      ? 'Merek baru'
      : controller.mode === 'edit'
        ? `Edit · ${controller.selectedBrand?.name || controller.form.name || 'Merek'}`
        : controller.selectedBrand?.name || 'Detail merek';

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
                onRouteChange?.('/label-dan-field/merek');
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
          style={styles.errorBadge}
          numberOfLines={2}
        />
      ) : null}
      {children}
    </View>
  );
}

function KolamBrandList({
  controller,
  onRouteChange,
}: {
  controller: KolamBrandController;
  onRouteChange?: (route: string) => void;
}) {
  const [sortMode, setSortMode] = React.useState<BrandSortMode>('name-asc');
  const [assetMode, setAssetMode] = React.useState<BrandAssetMode>('none');
  const [search, setSearch] = React.useState('');
  const [pageSize, setPageSize] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const [activeFilterPanel, setActiveFilterPanel] =
    React.useState<BrandListFilterPanel | null>(null);
  const [panelAnchor, setPanelAnchor] = React.useState({ left: 0, top: 40 });
  const toolbarRef = React.useRef<View>(null);
  const sortTriggerRef = React.useRef<View>(null);
  const assetTriggerRef = React.useRef<View>(null);
  const [deleteCandidate, setDeleteCandidate] =
    React.useState<KolamBrand | null>(null);
  const [tableBodyWidth, setTableBodyWidth] = React.useState(0);
  const filteredBrands = React.useMemo(
    () => filterBrands(controller.brands, search),
    [controller.brands, search],
  );
  const sortedBrands = React.useMemo(
    () => getSortedBrands(filteredBrands, sortMode, assetMode),
    [assetMode, filteredBrands, sortMode],
  );
  const pageCount = Math.max(1, Math.ceil(sortedBrands.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pagedBrands = sortedBrands.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const listColumns = React.useMemo(
    () => fitBrandListColumns(tableBodyWidth),
    [tableBodyWidth],
  );
  const sortFilterLabel = sortMode === 'name-desc' ? 'Nama Z-A' : 'Nama A-Z';
  const assetFilterLabel =
    assetMode === 'products-desc'
      ? 'Produk'
      : assetMode === 'raws-desc'
        ? 'Bahan'
        : 'Aset terbanyak';

  const anchorFilterPanel = React.useCallback((panel: BrandListFilterPanel) => {
    const toolbar = toolbarRef.current;
    const trigger =
      panel === 'asset' ? assetTriggerRef.current : sortTriggerRef.current;
    if (!toolbar || !trigger) {
      return;
    }
    toolbar.measureInWindow((toolbarX, toolbarY, toolbarWidth) => {
      trigger.measureInWindow((x, y, _width, height) => {
        const maxLeft = Math.max(0, toolbarWidth - BRAND_FILTER_PANEL_WIDTH);
        const preferredLeft = x - toolbarX;
        setPanelAnchor({
          left: Math.min(Math.max(0, preferredLeft), maxLeft),
          top: y - toolbarY + height + 4,
        });
      });
    });
  }, []);

  const openFilterPanel = (panel: BrandListFilterPanel) => {
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
  }, [assetMode, pageSize, search, sortMode]);

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
                placeholder="Cari merek..."
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
              <View ref={assetTriggerRef} collapsable={false}>
                <KolamTableFilterTrigger
                  active={assetMode !== 'none'}
                  label={assetFilterLabel}
                  onPress={() => openFilterPanel('asset')}
                  open={activeFilterPanel === 'asset'}
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
                  onRouteChange?.('/label-dan-field/merek/baru');
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
                width: BRAND_FILTER_PANEL_WIDTH,
              },
            ]}
          >
            {(activeFilterPanel === 'sort'
              ? [
                  { label: 'Nama A-Z', value: 'name-asc' as BrandSortMode },
                  { label: 'Nama Z-A', value: 'name-desc' as BrandSortMode },
                ]
              : [
                  { label: 'Semua', value: 'none' as BrandAssetMode },
                  { label: 'Produk', value: 'products-desc' as BrandAssetMode },
                  { label: 'Bahan', value: 'raws-desc' as BrandAssetMode },
                ]
            ).map(option => {
              const selected =
                activeFilterPanel === 'sort'
                  ? option.value === sortMode
                  : option.value === assetMode;
              return (
                <KolamInteractionFrame
                  accessibilityLabel={option.label}
                  key={`${activeFilterPanel}-${option.value}`}
                  onPress={() => {
                    if (activeFilterPanel === 'sort') {
                      setSortMode(option.value as BrandSortMode);
                    } else {
                      setAssetMode(option.value as BrandAssetMode);
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
            total={sortedBrands.length}
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
        {pagedBrands.length ? (
          pagedBrands.map(brand => (
            <KolamBrandRow
              brand={brand}
              columns={listColumns}
              key={brand.id}
              onEdit={() => {
                void controller.onSelectBrand(brand);
                onRouteChange?.(`${getBrandRoute(brand)}/edit`);
              }}
              onDelete={() => setDeleteCandidate(brand)}
              onSelect={() => {
                void controller.onSelectBrand(brand);
                onRouteChange?.(getBrandRoute(brand));
              }}
            />
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              compact
              message="Data Merek belum tersedia dari cache atau backend."
              title={controller.loading ? 'Memuat merek...' : 'Belum ada merek'}
            />
          </View>
        )}
      </KolamCatalogListTableShell>
      <KolamDeleteConfirmDialog
        itemLabel={deleteCandidate?.name}
        itemType="merek"
        visible={Boolean(deleteCandidate)}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => {
          const brand = deleteCandidate;
          setDeleteCandidate(null);

          if (!brand) {
            return;
          }

          void controller.onDeleteBrand(brand).then(deleted => {
            if (deleted) {
              onRouteChange?.('/label-dan-field/merek');
            }
          });
        }}
      />
    </View>
  );
}

function KolamBrandRow({
  brand,
  columns,
  onDelete,
  onEdit,
  onSelect,
}: {
  brand: KolamBrand;
  columns: ReturnType<typeof getKolamTableColumns>;
  onDelete: () => void;
  onEdit: () => void;
  onSelect: () => void;
}) {
  const flag = getKolamBrandFlagByCountry(brand.originCountry);
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);
  const [nameTooltipOpen, setNameTooltipOpen] = React.useState(false);
  const [countryTooltipOpen, setCountryTooltipOpen] = React.useState(false);
  const columnOf = React.useCallback(
    (id: (typeof columns)[number]['id']) => columns.find(column => column.id === id),
    [columns],
  );
  const primaryColumn = columnOf('primary');
  const metaColumn = columnOf('meta');
  const productsColumn = columnOf('products');
  const rawsColumn = columnOf('raws');
  const notesColumn = columnOf('notes');
  const statusColumn = columnOf('status');
  const actionsColumn = columnOf('actions');
  const raiseRow = actionMenuOpen || nameTooltipOpen || countryTooltipOpen;

  return (
    <KolamDataTableRowFrame
      style={raiseRow ? styles.activeActionRow : undefined}
    >
      <KolamDataTableMainTrack style={styles.mainTrackVisible}>
        <View
          style={[
            styles.listCell,
            styles.logoCell,
            primaryColumn ? getKolamDataTableColumnStyle(primaryColumn) : null,
            styles.overflowVisible,
          ]}
        >
          <KolamHoverTooltip
            align="center"
            label={brand.name}
            onOpenChange={setNameTooltipOpen}
            placement="bottom"
          >
            <View style={styles.brandIdentity}>
              <KolamBrandLogo brand={brand} />
            </View>
          </KolamHoverTooltip>
        </View>
        <View
          style={[
            styles.listCell,
            styles.countryFlagCell,
            styles.logoCell,
            metaColumn ? getKolamDataTableColumnStyle(metaColumn) : null,
            styles.overflowVisible,
          ]}
        >
          <KolamHoverTooltip
            align="center"
            label={flag.country}
            onOpenChange={setCountryTooltipOpen}
            placement="bottom"
          >
            <View style={styles.countryRow}>
              <KolamFlagIcon option={flag} />
            </View>
          </KolamHoverTooltip>
        </View>
        <View
          style={[
            styles.listCell,
            styles.countCell,
            productsColumn ? getKolamDataTableColumnStyle(productsColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.countText}>
            {String(brand.productCount ?? 0)}
          </Text>
        </View>
        <View
          style={[
            styles.listCell,
            styles.countCell,
            rawsColumn ? getKolamDataTableColumnStyle(rawsColumn) : null,
          ]}
        >
          <Text numberOfLines={1} style={styles.countText}>
            {String(brand.rawMaterialCount ?? 0)}
          </Text>
        </View>
        <View
          style={[
            styles.listCell,
            styles.notesCell,
            notesColumn ? getKolamDataTableColumnStyle(notesColumn) : null,
          ]}
        >
          <Text numberOfLines={2} style={styles.notesText}>
            {brand.notes || brand.description || '-'}
          </Text>
        </View>
        <View
          style={[
            styles.listCell,
            styles.statusCell,
            statusColumn ? getKolamDataTableColumnStyle(statusColumn) : null,
          ]}
        >
          <KolamStatusBadge
            intent={getBrandStatusIntent(brand.status)}
            label={getBrandStatusLabel(brand.status)}
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
          accessibilityLabel={`Menu ${brand.name}`}
          onOpenChange={setActionMenuOpen}
          actions={[
            { label: 'Lihat', onPress: onSelect },
            { label: 'Rubah', onPress: onEdit },
            { label: 'Hapus', onPress: onDelete, tone: 'danger' },
          ]}
        />
      </KolamDataTableActionsTrack>
    </KolamDataTableRowFrame>
  );
}

function KolamBrandDetail({
  controller,
}: {
  controller: KolamBrandController;
}) {
  const brand = controller.selectedBrand;
  const editable = controller.isEditable;
  const detailLists = brand ? getBrandDetailLists(brand) : null;

  if (!brand && controller.mode !== 'new') {
    return (
      <KolamEmptyState
        message="Pilih salah satu merek dari daftar untuk melihat detail."
        title="Belum ada merek dipilih"
      />
    );
  }

  return (
    <View style={styles.stack}>
      {!editable && brand ? (
        <>
          <KolamLabelFieldDetailOverview
            hero={<KolamBrandLogo brand={brand} variant="detail" />}
            status={{
              intent: getBrandStatusIntent(brand.status),
              label: getBrandStatusLabel(brand.status),
            }}
            metrics={[
              { label: 'Produk', value: brand.productCount },
              { label: 'Bahan Baku', value: brand.rawMaterialCount },
              { label: 'Layanan', value: brand.serviceCount },
            ]}
            meta={[
              {
                icon: (
                  <KolamFlagIcon
                    option={getKolamBrandFlagByCountry(brand.originCountry)}
                  />
                ),
                label: 'Asal',
                value: brand.originCountry,
              },
              ...(brand.description
                ? [
                    {
                      label: 'Deskripsi',
                      value: stripHtmlForDetail(brand.description),
                    },
                  ]
                : []),
              ...brand.links.map(link => ({
                label: 'Link',
                onPress: () => {
                  void Linking.openURL(normalizeExternalLink(link));
                },
                value: link,
              })),
            ]}
            sections={[
              {
                title: 'Produk',
                total: brand.productCount,
                description: 'Produk yang menggunakan merek ini',
                items: detailLists?.products,
                emptyText: brand.productCount
                  ? 'Daftar produk belum tersedia dari cache lokal.'
                  : 'Tidak ada produk yang menggunakan merek ini',
              },
              {
                title: 'Bahan Baku',
                total: brand.rawMaterialCount,
                description: 'Bahan baku yang menggunakan merek ini',
                items: detailLists?.raws,
                emptyText: brand.rawMaterialCount
                  ? 'Daftar bahan baku belum tersedia dari cache lokal.'
                  : 'Tidak ada bahan baku yang menggunakan merek ini',
              },
              {
                title: 'Layanan',
                total: brand.serviceCount,
                description: 'Layanan yang menggunakan merek ini',
                items: detailLists?.services,
                emptyText: brand.serviceCount
                  ? 'Daftar layanan belum tersedia dari cache lokal.'
                  : 'Tidak ada layanan yang menggunakan merek ini',
              },
              {
                title: 'Species',
                total: brand.speciesCount,
                description: 'Species yang menggunakan merek ini',
                items: detailLists?.species,
                emptyText: brand.speciesCount
                  ? 'Daftar species belum tersedia dari cache lokal.'
                  : 'Tidak ada species yang menggunakan merek ini',
              },
            ]}
          />
        </>
      ) : (
        <KolamBrandForm controller={controller} />
      )}
    </View>
  );
}

function KolamBrandForm({ controller }: { controller: KolamBrandController }) {
  const form = controller.form;

  return (
    <KolamNativeFormSection section={getKolamFormSection('brand-detail')}>
      <View style={settingsWebFormStyles.settingsWebFormFields}>
        <View style={settingsWebFormStyles.settingsWebFormFieldsGrid}>
          <FieldShell label="Nama Merek" required>
            <KolamFormTextField
              editable={!controller.saving}
              onChangeText={name => controller.onChangeForm({ name })}
              placeholder="Nama merek"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={form.name}
            />
          </FieldShell>
          <View style={styles.formSplitRow}>
            <View style={styles.formSplitCell}>
              <FieldShell label="Status" required>
                <View style={styles.segmentRow}>
                  {(
                    ['active', 'inactive', 'blacklisted'] as KolamBrandStatus[]
                  ).map(status => (
                    <KolamButton
                      intent={form.status === status ? 'primary' : 'outline'}
                      key={status}
                      label={getBrandStatusLabel(status)}
                      onPress={() => controller.onChangeForm({ status })}
                    />
                  ))}
                </View>
              </FieldShell>
            </View>
            <View style={[styles.formSplitCell, styles.countryDropdownCell]}>
              <FieldShell label="Negara Asal" required>
                <KolamDropdownSelect
                  accessibilityLabel="Pilih negara asal"
                  label="Negara Asal"
                  menuStyle={styles.countryDropdownMenu}
                  onChange={originCountry =>
                    controller.onChangeForm({ originCountry })
                  }
                  options={KOLAM_BRAND_FLAG_OPTIONS.map(option => ({
                    icon: <KolamFlagIcon option={option} />,
                    label: option.country,
                    value: option.country,
                  }))}
                  searchable
                  searchPlaceholder="Cari nama negara..."
                  showLabelInTrigger={false}
                  value={form.originCountry}
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
              placeholder="Deskripsi singkat"
              value={form.description}
            />
          </FieldShell>
          <FieldShell label="Catatan">
            <KolamFormTextField
              editable={!controller.saving}
              multiline
              onChangeText={notes => controller.onChangeForm({ notes })}
              placeholder="Catatan internal"
              style={[
                settingsWebFormStyles.settingsWebFormFieldValue,
                settingsWebFormStyles.settingsWebFormFieldValueTextarea,
              ]}
              value={form.notes}
            />
          </FieldShell>
          <FieldShell label="Link">
            <KolamFormTextField
              editable={!controller.saving}
              multiline
              onChangeText={linkText => controller.onChangeForm({ linkText })}
              placeholder="Satu link per baris"
              style={[
                settingsWebFormStyles.settingsWebFormFieldValue,
                settingsWebFormStyles.settingsWebFormFieldValueTextarea,
              ]}
              value={form.linkText}
            />
          </FieldShell>
          <FieldShell label="Logo lokal">
            <View style={styles.logoPickerRow}>
              <KolamFormTextField
                editable={!controller.saving}
                mode="url"
                onChangeText={logoLocalUri =>
                  controller.onChangeForm({ logoLocalUri })
                }
                placeholder="Pilih file logo dari komputer"
                style={[
                  settingsWebFormStyles.settingsWebFormFieldValue,
                  styles.logoPickerInput,
                ]}
                value={form.logoLocalUri}
              />
              <KolamButton
                disabled={controller.saving}
                label="Pilih Logo"
                onPress={() => {
                  void controller.onPickLogo();
                }}
              />
            </View>
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
  wide = false,
}: {
  children: React.ReactNode;
  label: string;
  required?: boolean;
  wide?: boolean;
}) {
  return (
    <View
      style={[
        settingsWebFormStyles.settingsWebFormField,
        wide && styles.fieldWide,
      ]}
    >
      <KolamSettingsWebFieldLabel label={label} required={required} />
      {children}
    </View>
  );
}

function fitBrandListColumns(containerWidth: number): KolamTableColumn[] {
  const base = getKolamTableColumns('brand');
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

function filterBrands(brands: KolamBrand[], search: string) {
  const query = search.trim().toLowerCase();
  if (!query) {
    return brands;
  }

  return brands.filter(brand =>
    [
      brand.name,
      brand.originCountry,
      brand.description,
      brand.notes,
      String(brand.productCount),
      String(brand.rawMaterialCount),
    ]
      .join(' ')
      .toLowerCase()
      .includes(query),
  );
}

function getSortedBrands(
  brands: KolamBrand[],
  sortMode: BrandSortMode,
  assetMode: BrandAssetMode,
) {
  return [...brands].sort((left, right) => {
    if (assetMode === 'products-desc') {
      return (
        right.productCount - left.productCount ||
        left.name.localeCompare(right.name)
      );
    }

    if (assetMode === 'raws-desc') {
      return (
        right.rawMaterialCount - left.rawMaterialCount ||
        left.name.localeCompare(right.name)
      );
    }

    return sortMode === 'name-desc'
      ? right.name.localeCompare(left.name)
      : left.name.localeCompare(right.name);
  });
}

function getBrandRoute(brand: KolamBrand) {
  return `/label-dan-field/merek/${encodeURIComponent(brand.name)}`;
}

function getBrandStatusLabel(status: KolamBrandStatus) {
  switch (status) {
    case 'inactive':
      return 'Nonaktif';
    case 'blacklisted':
      return 'Blacklist';
    case 'active':
    default:
      return 'Aktif';
  }
}

function getBrandStatusIntent(status: KolamBrandStatus) {
  switch (status) {
    case 'inactive':
      return 'warning';
    case 'blacklisted':
      return 'danger';
    case 'active':
    default:
      return 'success';
  }
}

function getBrandDetailLists(brand: KolamBrand) {
  return {
    products: createKolamDetailItemsFromRawArray(
      getKolamRawArray(brand.raw, 'products'),
    ),
    raws: createKolamDetailItemsFromRawArray(
      getKolamRawArray(brand.raw, 'raws'),
    ),
    services: createKolamDetailItemsFromRawArray(
      getKolamRawArray(brand.raw, 'services'),
    ),
    species: createKolamDetailItemsFromRawArray(
      getKolamRawArray(brand.raw, 'species'),
    ),
  };
}

function normalizeExternalLink(link: string) {
  const trimmed = link.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
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
  logoCell: {
    zIndex: 2,
  },
  overflowVisible: {
    overflow: 'visible',
  },
  brandIdentity: {
    alignItems: 'center',
    flexDirection: 'column',
    gap: 4,
    maxWidth: '100%',
    minWidth: 0,
    width: '100%',
  },
  countryFlagCell: {
    alignItems: 'center',
  },
  countryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    maxWidth: '100%',
    minWidth: 0,
  },
  countCell: {
    alignItems: 'center',
  },
  countText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },
  notesCell: {
    alignItems: 'center',
    minWidth: 0,
  },
  notesText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    width: '100%',
  },
  statusCell: {
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyWrap: {
    padding: 16,
  },
  detailActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  fieldWide: {
    flexBasis: '100%',
  },
  formSplitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    zIndex: 80,
    elevation: 96,
  },
  formSplitCell: {
    flex: 1,
    minWidth: 280,
  },
  countryDropdownCell: {
    zIndex: 120,
    elevation: 24,
  },
  longDropdownMenu: {
    maxHeight: 340,
    minWidth: 360,
  },
  countryDropdownMenu: {
    maxHeight: 260,
    minWidth: 360,
  },
  logoPickerRow: {
    minHeight: V.control.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoPickerInput: {
    flex: 1,
    minWidth: 0,
  },
  segmentRow: {
    minHeight: V.control.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  formActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 8,
  },
});
