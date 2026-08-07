import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import {
  createKolamDetailItemsFromRawArray,
  getKolamRawArray,
  type KolamDetailListItem,
} from '../domain/kolam-detail-list';
import {
  getKolamBrandFlagByCountry,
  KOLAM_BRAND_FLAG_OPTIONS,
  type KolamBrand,
  type KolamBrandStatus,
} from '../domain/kolam-brand';
import { getKolamFormSection } from '../domain/kolam-form';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamBrandController,
  type KolamBrandController,
} from '../hooks/use-kolam-brand-controller';
import { KolamBrandLogo } from './kolam-brand-logo';
import { KolamButton } from './kolam-button';
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFlagIcon } from './kolam-flag-icon';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamNativeFormSection } from './kolam-native-form-section';
import { KolamTipTapRichTextEditor } from './kolam-tiptap-rich-text-editor';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { KolamSettingsWebFileField } from './kolam-settings-web-file-field';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamHoverTooltip } from './kolam-hover-tooltip';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import { KolamDetailSummaryCard } from './kolam-detail-summary-card';
import { KolamSearchField } from './kolam-search-field';
import { KolamStatusBadge } from './kolam-status-badge';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import {
  measureFilterPanelAnchor,
  type KolamFilterPanelAnchor,
} from './kolam-filter-panel-anchor';
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

  return (
    <View style={styles.surface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters} />
          <View style={kolamTableToolbarStyles.actions}>
            {controller.mode === 'detail' ? (
              <>
                <KolamButton
                  label="Daftar"
                  onPress={() => {
                    controller.onBackToList();
                    onRouteChange?.('/label-dan-field/merek');
                  }}
                />
                <KolamButton
                  intent="primary"
                  label="Edit"
                  onPress={controller.onEdit}
                />
              </>
            ) : (
              <>
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
              </>
            )}
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
  const pageSize = 10;
  const [page, setPage] = React.useState(1);
  const [activeFilterPanel, setActiveFilterPanel] =
    React.useState<BrandListFilterPanel | null>(null);
  const [panelAnchor, setPanelAnchor] =
    React.useState<KolamFilterPanelAnchor | null>(null);
  const toolbarRef = React.useRef<View>(null);
  const sortTriggerRef = React.useRef<View>(null);
  const assetTriggerRef = React.useRef<View>(null);
  const [deleteCandidate, setDeleteCandidate] =
    React.useState<KolamBrand | null>(null);
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
  const listColumns = React.useMemo<Array<KolamListTableColumn<KolamBrand>>>(
    () => buildBrandListColumns(),
    [],
  );
  const sortFilterLabel = sortMode === 'name-desc' ? 'Nama Z-A' : 'Nama A-Z';
  const assetFilterLabel =
    assetMode === 'products-desc'
      ? 'Produk'
      : assetMode === 'raws-desc'
      ? 'Bahan'
      : 'Aset terbanyak';

  const anchorFilterPanel = React.useCallback((panel: BrandListFilterPanel) => {
    const trigger =
      panel === 'asset' ? assetTriggerRef.current : sortTriggerRef.current;
    measureFilterPanelAnchor(
      toolbarRef.current,
      trigger,
      BRAND_FILTER_PANEL_WIDTH,
      setPanelAnchor,
    );
  }, []);

  const openFilterPanel = (panel: BrandListFilterPanel) => {
    if (activeFilterPanel === panel) {
      setActiveFilterPanel(null);
      setPanelAnchor(null);
      return;
    }
    setActiveFilterPanel(null);
    setPanelAnchor(null);
    const trigger =
      panel === 'asset' ? assetTriggerRef.current : sortTriggerRef.current;
    requestAnimationFrame(() => {
      measureFilterPanelAnchor(
        toolbarRef.current,
        trigger,
        BRAND_FILTER_PANEL_WIDTH,
        anchor => {
          setPanelAnchor(anchor);
          setActiveFilterPanel(panel);
        },
      );
    });
  };

  React.useEffect(() => {
    setPage(1);
  }, [assetMode, search, sortMode]);

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
                intent="primary"
                label="Baru"
                tone="positive"
                onPress={() => {
                  controller.onCreateNew();
                  onRouteChange?.('/label-dan-field/merek/baru');
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
                </KolamInteractionFrame>
              );
            })}
          </View>
        ) : null}
      </View>
      <KolamListTableComposition
        columns={listColumns}
        emptyTitle={controller.loading ? 'Memuat merek...' : 'Belum ada merek'}
        getRowKey={brand => brand.id}
        loading={controller.loading}
        pagination={{
          onPageChange: setPage,
          page: safePage,
          pageSize,
          total: sortedBrands.length,
        }}
        renderActions={brand => (
          <KolamBrandActionsMenu
            brand={brand}
            onDelete={() => setDeleteCandidate(brand)}
            onEdit={() => {
              void controller.onSelectBrand(brand);
              onRouteChange?.(`${getBrandRoute(brand)}/edit`);
            }}
            onSelect={() => {
              void controller.onSelectBrand(brand);
              onRouteChange?.(getBrandRoute(brand));
            }}
          />
        )}
        rows={pagedBrands}
      />
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

function buildBrandListColumns(): Array<KolamListTableColumn<KolamBrand>> {
  return [
    {
      flex: 1.1,
      id: 'primary',
      label: 'Merek',
      render: brand => <KolamBrandLogoCell brand={brand} />,
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'meta',
      label: 'Negara',
      render: brand => <KolamBrandCountryCell brand={brand} />,
    },
    {
      align: 'center',
      flex: 0.75,
      id: 'products',
      label: 'Produk',
      render: brand => (
        <Text numberOfLines={1} style={styles.countText}>
          {String(brand.productCount ?? 0)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.75,
      id: 'raws',
      label: 'Bahan',
      render: brand => (
        <Text numberOfLines={1} style={styles.countText}>
          {String(brand.rawMaterialCount ?? 0)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 1.35,
      id: 'notes',
      label: 'Catatan',
      render: brand => (
        <Text numberOfLines={2} style={styles.notesText}>
          {brand.notes || brand.description || '-'}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'status',
      label: 'Status',
      render: brand => (
        <KolamStatusBadge
          intent={getBrandStatusIntent(brand.status)}
          label={getBrandStatusLabel(brand.status)}
          style={styles.statusBadge}
        />
      ),
    },
  ];
}

function KolamBrandLogoCell({ brand }: { brand: KolamBrand }) {
  const [nameTooltipOpen, setNameTooltipOpen] = React.useState(false);

  return (
    <View
      style={[
        styles.brandTableCell,
        nameTooltipOpen ? styles.brandTableCellRaised : null,
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
  );
}

function KolamBrandCountryCell({ brand }: { brand: KolamBrand }) {
  const flag = getKolamBrandFlagByCountry(brand.originCountry);
  const [countryTooltipOpen, setCountryTooltipOpen] = React.useState(false);

  return (
    <View
      style={[
        styles.brandTableCell,
        countryTooltipOpen ? styles.brandTableCellRaised : null,
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
  );
}

function KolamBrandActionsMenu({
  brand,
  onDelete,
  onEdit,
  onSelect,
}: {
  brand: KolamBrand;
  onDelete: () => void;
  onEdit: () => void;
  onSelect: () => void;
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);

  return (
    <View style={actionMenuOpen ? styles.brandActionMenuRaised : null}>
      <KolamOverflowMenuButton
        accessibilityLabel={`Menu ${brand.name}`}
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
          <KolamDetailSummaryCard
            body={
              brand.description ? (
                <Text style={styles.brandSummaryDescription}>
                  {stripHtmlForDetail(brand.description)}
                </Text>
              ) : undefined
            }
            bodyTitle={brand.description ? 'Deskripsi' : undefined}
            fieldColumns={3}
            fields={[
              {
                id: 'status',
                label: 'Status',
                value: (
                  <KolamStatusBadge
                    intent={getBrandStatusIntent(brand.status)}
                    label={getBrandStatusLabel(brand.status)}
                  />
                ),
              },
              {
                id: 'origin',
                label: 'Asal',
                value: (
                  <View style={styles.brandSummaryCountry}>
                    <KolamFlagIcon
                      option={getKolamBrandFlagByCountry(brand.originCountry)}
                    />
                    <Text style={styles.brandSummaryFieldText}>
                      {brand.originCountry}
                    </Text>
                  </View>
                ),
              },
              { id: 'products', label: 'Produk', value: brand.productCount },
              {
                id: 'raws',
                label: 'Bahan Baku',
                value: brand.rawMaterialCount,
              },
              { id: 'services', label: 'Layanan', value: brand.serviceCount },
              { id: 'species', label: 'Species', value: brand.speciesCount },
              ...(brand.links.length
                ? [
                    {
                      id: 'links',
                      label: 'Link',
                      value: <BrandSummaryLinks links={brand.links} />,
                    },
                  ]
                : []),
            ]}
            leading={
              brand.logoUrl ? (
                <View style={styles.brandSummaryLogoInCard}>
                  <KolamBrandLogo brand={brand} variant="summary" />
                </View>
              ) : undefined
            }
            leadingStyle={styles.brandSummaryLeadingSlot}
            title="Ringkasan merek"
          />

          <View style={styles.brandSummaryGrid}>
            <BrandLinkedItemsSummaryCard
              description="Produk yang menggunakan merek ini"
              emptyText={
                brand.productCount
                  ? 'Daftar produk belum tersedia dari cache lokal.'
                  : 'Tidak ada produk yang menggunakan merek ini'
              }
              items={detailLists?.products}
              title="Produk"
              total={brand.productCount}
            />
            <BrandLinkedItemsSummaryCard
              description="Bahan baku yang menggunakan merek ini"
              emptyText={
                brand.rawMaterialCount
                  ? 'Daftar bahan baku belum tersedia dari cache lokal.'
                  : 'Tidak ada bahan baku yang menggunakan merek ini'
              }
              items={detailLists?.raws}
              title="Bahan Baku"
              total={brand.rawMaterialCount}
            />
            <BrandLinkedItemsSummaryCard
              description="Layanan yang menggunakan merek ini"
              emptyText={
                brand.serviceCount
                  ? 'Daftar layanan belum tersedia dari cache lokal.'
                  : 'Tidak ada layanan yang menggunakan merek ini'
              }
              items={detailLists?.services}
              title="Layanan"
              total={brand.serviceCount}
            />
            <BrandLinkedItemsSummaryCard
              description="Species yang menggunakan merek ini"
              emptyText={
                brand.speciesCount
                  ? 'Daftar species belum tersedia dari cache lokal.'
                  : 'Tidak ada species yang menggunakan merek ini'
              }
              items={detailLists?.species}
              title="Species"
              total={brand.speciesCount}
            />
          </View>
        </>
      ) : (
        <KolamBrandForm controller={controller} />
      )}
    </View>
  );
}

function BrandSummaryLinks({ links }: { links: string[] }) {
  return (
    <View style={styles.brandSummaryFieldStack}>
      {links.map((link, index) => (
        <KolamInteractionFrame
          accessibilityLabel={`Buka ${link}`}
          key={`${link}-${index}`}
          onPress={() => {
            void Linking.openURL(normalizeExternalLink(link));
          }}
          style={styles.brandSummaryLinkValue}
        >
          <Text numberOfLines={1} style={styles.brandSummaryLinkText}>
            {link}
          </Text>
        </KolamInteractionFrame>
      ))}
    </View>
  );
}

function BrandLinkedItemsSummaryCard({
  description,
  emptyText,
  items,
  title,
  total,
}: {
  description: string;
  emptyText: string;
  items?: KolamDetailListItem[];
  title: string;
  total: number;
}) {
  return (
    <KolamDetailSummaryCard
      body={<BrandLinkedItemsList emptyText={emptyText} items={items} />}
      description={description}
      fields={[{ id: 'total', label: 'Total', value: total }]}
      style={styles.brandSummaryGridCard}
      title={title}
    />
  );
}

function BrandLinkedItemsList({
  emptyText,
  items,
}: {
  emptyText: string;
  items?: KolamDetailListItem[];
}) {
  if (!items?.length) {
    return <Text style={styles.brandSummaryEmptyText}>{emptyText}</Text>;
  }

  return (
    <View style={styles.brandSummaryItemList}>
      {items.map((item, index) => (
        <View
          key={getBrandDetailItemKey(item, index)}
          style={styles.brandSummaryItemRow}
        >
          <View style={styles.brandSummaryItemCopy}>
            <Text numberOfLines={1} style={styles.brandSummaryItemTitle}>
              {item.title}
            </Text>
            {item.meta ? (
              <Text numberOfLines={1} style={styles.brandSummaryItemMeta}>
                {item.meta}
              </Text>
            ) : null}
          </View>
          {item.value || item.badge ? (
            <View style={styles.brandSummaryItemMetrics}>
              {item.value ? (
                <Text numberOfLines={1} style={styles.brandSummaryItemValue}>
                  {item.value}
                </Text>
              ) : null}
              {item.badge ? (
                <KolamStatusBadge intent="muted" label={item.badge} />
              ) : null}
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function getBrandDetailItemKey(item: KolamDetailListItem, index: number) {
  return `${item.title}-${item.value ?? ''}-${index}`;
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
                <KolamDropdownSelect<KolamBrandStatus>
                  accessibilityLabel="Pilih status merek"
                  label="Status"
                  menuStyle={styles.longDropdownMenu}
                  onChange={status => controller.onChangeForm({ status })}
                  options={(
                    ['active', 'inactive', 'blacklisted'] as KolamBrandStatus[]
                  ).map(status => ({
                    label: getBrandStatusLabel(status),
                    value: status,
                  }))}
                  showLabelInTrigger={false}
                  value={form.status}
                />
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
          <FieldShell label="Catatan">
            <KolamFormTextField
              editable={!controller.saving}
              multiline
              onChangeText={notes => controller.onChangeForm({ notes })}
              placeholder="Catatan internal"
              style={[
                settingsWebFormStyles.settingsWebFormFieldValue,
                settingsWebFormStyles.settingsWebFormFieldValueTextarea,
                settingsWebFormStyles.settingsWebFormFieldValueNote,
              ]}
              value={form.notes}
            />
          </FieldShell>
          <View style={styles.brandAssetSettingsGrid}>
            <View style={styles.brandAssetSettingsCard}>
              <FieldShell label="Link">
                <KolamFormTextField
                  editable={!controller.saving}
                  multiline
                  onChangeText={linkText =>
                    controller.onChangeForm({ linkText })
                  }
                  placeholder="Satu link per baris"
                  style={[
                    settingsWebFormStyles.settingsWebFormFieldValue,
                    settingsWebFormStyles.settingsWebFormFieldValueTextarea,
                  ]}
                  value={form.linkText}
                />
              </FieldShell>
            </View>
            <View style={styles.brandAssetSettingsCard}>
              <KolamSettingsWebFileField
                accessibilityLabel="Logo merek"
                actionLabel="Pilih file"
                emptyLabel="Logo belum diatur"
                onLocalValueChange={logoLocalUri =>
                  controller.onChangeForm({ logoLocalUri })
                }
                onUpload={() => {
                  void controller.onPickLogo();
                }}
                scope="brand-logo"
                value={form.logoLocalUri || form.logoRemoteUrl}
              />
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
  errorBadge: {
    alignSelf: 'flex-start',
    maxWidth: 760,
  },
  stack: {
    gap: 14,
  },
  brandSummaryLeadingSlot: {
    minHeight: 172,
  },
  brandSummaryLogoInCard: {
    alignItems: 'center',
    height: 154,
    justifyContent: 'center',
    width: '100%',
  },
  brandSummaryCountry: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minHeight: 24,
    minWidth: 0,
  },
  brandSummaryFieldText: {
    color: V.colors.fg,
    flexShrink: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    minWidth: 0,
  },
  brandSummaryDescription: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  brandSummaryFieldStack: {
    gap: 8,
  },
  brandSummaryLinkValue: {
    alignItems: 'flex-start',
    minHeight: 20,
    paddingVertical: 1,
  },
  brandSummaryLinkText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    maxWidth: '100%',
  },
  brandSummaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  brandSummaryGridCard: {
    flexBasis: '48%',
    flexGrow: 1,
    minWidth: 320,
  },
  brandSummaryItemList: {
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
  },
  brandSummaryItemRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 54,
    paddingVertical: 9,
  },
  brandSummaryItemCopy: {
    flex: 1,
    minWidth: 0,
  },
  brandSummaryItemMetrics: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  brandSummaryItemTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
  },
  brandSummaryItemMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  brandSummaryItemValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    maxWidth: 100,
    textAlign: 'right',
  },
  brandSummaryEmptyText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  brandTableCell: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    overflow: 'visible',
    width: '100%',
  },
  brandTableCellRaised: {
    elevation: 30,
    zIndex: 1000,
  },
  brandIdentity: {
    alignItems: 'center',
    flexDirection: 'column',
    gap: 4,
    maxWidth: '100%',
    minWidth: 0,
    width: '100%',
  },
  countryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    maxWidth: '100%',
    minWidth: 0,
  },
  countText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },
  notesText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    width: '100%',
  },
  statusBadge: {
    alignSelf: 'center',
  },
  brandActionMenuRaised: {
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
  brandAssetSettingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  brandAssetSettingsCard: {
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
  segmentRow: {
    minHeight: V.control.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
});
