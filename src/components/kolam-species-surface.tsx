import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { getKolamFormSection } from '../domain/kolam-form';
import {
  createEmptyKolamSpeciesVariantFormRow,
  getSpeciesStatusLabel,
  slugifySpeciesName,
  type KolamSpecies,
  type KolamSpeciesSellableFilter,
  type KolamSpeciesStatus,
  type KolamSpeciesStockStatus,
  type KolamSpeciesVariantFormRow,
} from '../domain/kolam-species';
import { getKolamTableColumns } from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamSpeciesController,
  type KolamSpeciesController,
} from '../hooks/use-kolam-species-controller';
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
import { KolamRemoteImage } from './kolam-remote-image';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamStatusBadge } from './kolam-status-badge';

type SpeciesSortMode =
  | 'name-asc'
  | 'name-desc'
  | 'price-desc'
  | 'stock-desc'
  | 'newest';
type SpeciesStatusFilter = 'all' | KolamSpeciesStatus;
type SpeciesDeleteMediaTarget =
  | { type: 'thumbnail'; label: string }
  | { type: 'photo'; index: number; label: string }
  | { type: 'video'; index: number; label: string }
  | { type: 'voice'; label: string }
  | { type: 'variant-photo'; variantId: string; index: number; label: string }
  | { type: 'variant-video'; variantId: string; index: number; label: string };

export function KolamSpeciesSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamSpeciesController(route);

  return (
    <KolamSpeciesShell controller={controller} onRouteChange={onRouteChange}>
      {controller.mode === 'list' ? (
        <KolamSpeciesList controller={controller} onRouteChange={onRouteChange} />
      ) : controller.mode === 'new' || controller.mode === 'edit' ? (
        <KolamSpeciesForm controller={controller} onRouteChange={onRouteChange} />
      ) : (
        <KolamSpeciesDetail controller={controller} />
      )}
    </KolamSpeciesShell>
  );
}

function KolamSpeciesShell({
  children,
  controller,
  onRouteChange,
}: {
  children: React.ReactNode;
  controller: KolamSpeciesController;
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
                onRouteChange?.('/species/baru');
              }}
            />
          ) : controller.mode === 'detail' ? (
            <KolamButton
              intent="primary"
              label="Rubah"
              onPress={() => {
                controller.onEdit();
                const item = controller.selectedSpecies;
                if (item) {
                  onRouteChange?.(`${getSpeciesRoute(item)}/edit`);
                }
              }}
            />
          ) : null}
          {controller.mode !== 'list' ? (
            <KolamButton
              label="Daftar"
              onPress={() => {
                controller.onBackToList();
                onRouteChange?.('/species');
              }}
            />
          ) : null}
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

function KolamSpeciesList({
  controller,
  onRouteChange,
}: {
  controller: KolamSpeciesController;
  onRouteChange?: (route: string) => void;
}) {
  const [search, setSearch] = React.useState('');
  const [sortMode, setSortMode] = React.useState<SpeciesSortMode>('name-asc');
  const [statusFilter, setStatusFilter] =
    React.useState<SpeciesStatusFilter>('all');
  const [stockFilter, setStockFilter] =
    React.useState<KolamSpeciesStockStatus>('all');
  const [sellableFilter, setSellableFilter] =
    React.useState<KolamSpeciesSellableFilter>('all');
  const [pageSize, setPageSize] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const summary = getSpeciesSummary(controller.species);
  const filteredSpecies = React.useMemo(
    () =>
      filterSpecies(
        controller.species,
        search,
        statusFilter,
        stockFilter,
        sellableFilter,
      ),
    [controller.species, search, sellableFilter, statusFilter, stockFilter],
  );
  const sortedSpecies = React.useMemo(
    () => sortSpecies(filteredSpecies, sortMode),
    [filteredSpecies, sortMode],
  );
  const pageCount = Math.max(1, Math.ceil(sortedSpecies.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pagedSpecies = sortedSpecies.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  React.useEffect(() => {
    setPage(1);
  }, [pageSize, search, sellableFilter, sortMode, statusFilter, stockFilter]);

  return (
    <View style={styles.stack}>
      <View style={styles.summaryGrid}>
        <SummaryTile label="Total Spesies" value={controller.species.length} />
        <SummaryTile label="Dijual" value={summary.sellable} />
        <SummaryTile label="Stok Ada" value={summary.inStock} />
        <SummaryTile label="Stok Habis" value={summary.outOfStock} />
      </View>
      <View style={styles.tableToolbar}>
        <KolamFormTextField
          onChangeText={setSearch}
          placeholder="Cari spesies..."
          style={styles.searchInput}
          value={search}
        />
        <KolamDropdownSelect<SpeciesSortMode>
          label="Urutan"
          onChange={setSortMode}
          options={[
            { label: 'Nama A-Z', value: 'name-asc' },
            { label: 'Nama Z-A', value: 'name-desc' },
            { label: 'Harga tertinggi', value: 'price-desc' },
            { label: 'Stok terbanyak', value: 'stock-desc' },
            { label: 'Terbaru', value: 'newest' },
          ]}
          value={sortMode}
        />
        <KolamDropdownSelect<SpeciesStatusFilter>
          label="Status"
          onChange={setStatusFilter}
          options={[
            { label: 'Semua', value: 'all' },
            { label: 'Aktif', value: 'active' },
            { label: 'Nonaktif', value: 'inactive' },
            { label: 'Draft', value: 'draft' },
          ]}
          value={statusFilter}
        />
        <KolamDropdownSelect<KolamSpeciesStockStatus>
          label="Stok"
          onChange={setStockFilter}
          options={[
            { label: 'Semua', value: 'all' },
            { label: 'Ada stok', value: 'in_stock' },
            { label: 'Stok habis', value: 'out_of_stock' },
          ]}
          value={stockFilter}
        />
        <KolamDropdownSelect<KolamSpeciesSellableFilter>
          label="Jual"
          onChange={setSellableFilter}
          options={[
            { label: 'Semua', value: 'all' },
            { label: 'Dijual', value: 'sellable' },
            { label: 'Tidak dijual', value: 'not-sellable' },
          ]}
          value={sellableFilter}
        />
        <KolamPaginationSizeControl onChange={setPageSize} value={pageSize} />
        <KolamPaginationSummaryLabel
          page={safePage}
          pageSize={pageSize}
          total={sortedSpecies.length}
        />
      </View>
      <KolamContentFrame variant="settingsWebConfig">
        <KolamDataTableHeader columns={getKolamTableColumns('species')} />
        {pagedSpecies.length ? (
          pagedSpecies.map(item => (
            <KolamSpeciesRow
              item={item}
              key={item.id}
              onEdit={() => {
                void controller.onSelectSpecies(item, 'edit');
                onRouteChange?.(`${getSpeciesRoute(item)}/edit`);
              }}
              onSelect={() => {
                void controller.onSelectSpecies(item);
                onRouteChange?.(getSpeciesRoute(item));
              }}
            />
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              compact
              message="Data Spesies belum tersedia dari cache lokal atau backend."
              title={controller.loading ? 'Memuat spesies...' : 'Belum ada spesies'}
            />
          </View>
        )}
      </KolamContentFrame>
      {pageCount > 1 ? (
        <View style={styles.paginationBar}>
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
    </View>
  );
}

function KolamSpeciesRow({
  item,
  onEdit,
  onSelect,
}: {
  item: KolamSpecies;
  onEdit: () => void;
  onSelect: () => void;
}) {
  return (
    <KolamDataTableRowFrame style={styles.tableRow}>
      <View style={[styles.cell, styles.primaryCell]}>
        <View style={styles.speciesThumb}>
          <KolamRemoteImage
            accessibilityLabel={`Foto ${item.displayName}`}
            resizeMode="cover"
            revision={item.updatedAt ?? item.thumbnailUri ?? item.id}
            scope="species"
            sourceUri={item.thumbnailUri}
            style={styles.speciesThumbImage}
          />
        </View>
        <KolamCopyStack
          containerStyle={styles.primaryCopy}
          items={[
            {
              id: 'name',
              text: item.scientificName,
              style: styles.scientificName,
              textProps: { numberOfLines: 1 },
            },
            {
              id: 'common',
              text: item.commonName || item.localName || '-',
              style: styles.rowSubtext,
              textProps: { numberOfLines: 1 },
            },
          ]}
        />
      </View>
      <View style={[styles.cell, styles.metaCell]}>
        <KolamCopyStack
          items={[
            {
              id: 'sku',
              text: item.sku || '-',
              style: styles.rowText,
              textProps: { numberOfLines: 1 },
            },
          ]}
        />
      </View>
      <View style={[styles.cell, styles.amountCell]}>
        <KolamCopyStack
          items={[
            {
              id: 'price',
              text: formatCurrency(item.priceToSell),
              style: styles.rowTextRight,
              textProps: { numberOfLines: 1 },
            },
          ]}
        />
      </View>
      <View style={[styles.cell, styles.stockCell]}>
        <KolamCopyStack
          items={[
            {
              id: 'stock',
              text: `${formatNumber(item.stock)}${item.unitLabel ? ` ${item.unitLabel}` : ''}`,
              style: styles.rowTextRight,
              textProps: { numberOfLines: 1 },
            },
            {
              id: 'variant',
              text: item.hasVariants ? `${item.variantCount} varian` : 'Tanpa varian',
              style: styles.rowSubtextRight,
              textProps: { numberOfLines: 1 },
            },
          ]}
        />
      </View>
      <View style={[styles.cell, styles.syncCell]}>
        <KolamCopyStack
          items={[
            {
              id: 'sync',
              text: item.marketplaceSync.label,
              style: styles.rowText,
              textProps: { numberOfLines: 1 },
            },
          ]}
        />
      </View>
      <View style={[styles.cell, styles.notesCell]}>
        <KolamCopyStack
          items={[
            {
              id: 'taxonomy',
              text: item.taxonomy?.name || item.taxonomyPath || '-',
              style: styles.rowText,
              textProps: { numberOfLines: 1 },
            },
            {
              id: 'category',
              text: item.categories.map(category => category.name).join(', ') || '-',
              style: styles.rowSubtext,
              textProps: { numberOfLines: 1 },
            },
          ]}
        />
      </View>
      <View style={[styles.cell, styles.statusCell]}>
        <KolamStatusBadge
          intent={item.status === 'active' ? 'success' : 'muted'}
          label={getSpeciesStatusLabel(item.status)}
        />
      </View>
      <View style={[styles.cell, styles.actionsCell]}>
        <KolamOverflowMenuButton
          actions={[
            { label: 'Lihat', onPress: onSelect },
            { label: 'Rubah', onPress: onEdit },
            { disabled: true, label: 'Hapus', onPress: () => undefined, tone: 'danger' },
          ]}
        />
      </View>
    </KolamDataTableRowFrame>
  );
}

function KolamSpeciesForm({
  controller,
  onRouteChange,
}: {
  controller: KolamSpeciesController;
  onRouteChange?: (route: string) => void;
}) {
  const form = controller.form;
  const [deleteMediaTarget, setDeleteMediaTarget] = React.useState<SpeciesDeleteMediaTarget | null>(null);
  const [deleteVariantTarget, setDeleteVariantTarget] = React.useState<{ id: string; label: string } | null>(null);
  const categoryOptions = controller.categories.filter(
    category => !form.categoryIds.includes(category.id),
  );
  const selectedCategories = controller.categories.filter(category =>
    form.categoryIds.includes(category.id),
  );
  const tagOptions = controller.tags.filter(tag => !form.tagIds.includes(tag.id));
  const selectedTags = controller.tags.filter(tag => form.tagIds.includes(tag.id));

  return (
    <>
      <KolamNativeFormSection section={getKolamFormSection('species-detail')}>
      <View style={settingsWebFormStyles.settingsWebFormFields}>
        <View style={settingsWebFormStyles.settingsWebFormFieldsGrid}>
          <FieldShell label="Nama Ilmiah" required>
            <KolamFormTextField
              editable={!controller.saving}
              onChangeText={scientificName =>
                controller.onChangeForm({ scientificName })
              }
              placeholder="Contoh: Dendrobates tinctorius"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={form.scientificName}
            />
          </FieldShell>
          <View style={styles.twoColumnGrid}>
            <FieldShell label="Nama Umum">
              <KolamFormTextField
                editable={!controller.saving}
                onChangeText={commonName => controller.onChangeForm({ commonName })}
                placeholder="Nama umum"
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={form.commonName}
              />
            </FieldShell>
            <FieldShell label="Nama Lokal">
              <KolamFormTextField
                editable={!controller.saving}
                onChangeText={localName => controller.onChangeForm({ localName })}
                placeholder="Nama lokal"
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={form.localName}
              />
            </FieldShell>
          </View>
          <View style={styles.twoColumnGrid}>
            <FieldShell label="Taksonomi Genus" required>
              <KolamDropdownSelect
                accessibilityLabel="Pilih taksonomi genus"
                label="Taksonomi Genus"
                menuStyle={styles.longDropdownMenu}
                onChange={taxonomyId => controller.onChangeForm({ taxonomyId })}
                options={[
                  { label: 'Pilih genus', value: '' },
                  ...controller.taxonomies.map(taxonomy => ({
                    label: taxonomy.name,
                    value: taxonomy.id,
                  })),
                ]}
                searchable
                searchPlaceholder="Cari genus..."
                showLabelInTrigger={false}
                value={form.taxonomyId}
              />
            </FieldShell>
            <FieldShell label="Status">
              <KolamDropdownSelect<KolamSpeciesStatus>
                label="Status"
                onChange={status => controller.onChangeForm({ status })}
                options={[
                  { label: 'Aktif', value: 'active' },
                  { label: 'Nonaktif', value: 'inactive' },
                  { label: 'Draft', value: 'draft' },
                ]}
                showLabelInTrigger={false}
                value={form.status}
              />
            </FieldShell>
          </View>
          <FieldShell label="Kategori" required>
            <View style={styles.categoryPickerStack}>
              <KolamDropdownSelect
                accessibilityLabel="Tambah kategori spesies"
                label="Tambah Kategori"
                menuStyle={styles.longDropdownMenu}
                onChange={categoryId => {
                  if (!categoryId || form.categoryIds.includes(categoryId)) {
                    return;
                  }

                  controller.onChangeForm({
                    categoryIds: [...form.categoryIds, categoryId],
                  });
                }}
                options={[
                  { label: 'Tambah kategori', value: '' },
                  ...categoryOptions.map(category => ({
                    label: `${'  '.repeat(category.level)}${category.name}`,
                    value: category.id,
                  })),
                ]}
                searchable
                searchPlaceholder="Cari kategori..."
                showLabelInTrigger={false}
                value=""
              />
              <View style={styles.selectedCategoryRow}>
                {selectedCategories.length ? (
                  selectedCategories.map(category => (
                    <KolamButton
                      intent="outline"
                      key={category.id}
                      label={`${category.name} x`}
                      onPress={() =>
                        controller.onChangeForm({
                          categoryIds: form.categoryIds.filter(
                            categoryId => categoryId !== category.id,
                          ),
                        })
                      }
                      style={styles.selectedCategoryButton}
                    />
                  ))
                ) : (
                  <KolamCopyStack
                    items={[
                      {
                        id: 'empty-category',
                        text: 'Belum ada kategori dipilih.',
                        style: styles.fieldHint,
                      },
                    ]}
                  />
                )}
              </View>
            </View>
          </FieldShell>
          <FieldShell label="Tag">
            <View style={styles.categoryPickerStack}>
              <KolamDropdownSelect
                accessibilityLabel="Tambah tag spesies"
                label="Tambah Tag"
                menuStyle={styles.longDropdownMenu}
                onChange={tagId => {
                  if (!tagId || form.tagIds.includes(tagId)) {
                    return;
                  }

                  controller.onChangeForm({
                    tagIds: [...form.tagIds, tagId],
                  });
                }}
                options={[
                  { label: 'Tambah tag', value: '' },
                  ...tagOptions.map(tag => ({
                    label: tag.name,
                    value: tag.id,
                  })),
                ]}
                searchable
                searchPlaceholder="Cari tag..."
                showLabelInTrigger={false}
                value=""
              />
              <View style={styles.selectedCategoryRow}>
                {selectedTags.length ? (
                  selectedTags.map(tag => (
                    <KolamButton
                      intent="outline"
                      key={tag.id}
                      label={`${tag.name} x`}
                      onPress={() =>
                        controller.onChangeForm({
                          tagIds: form.tagIds.filter(tagId => tagId !== tag.id),
                        })
                      }
                      style={styles.selectedCategoryButton}
                    />
                  ))
                ) : (
                  <KolamCopyStack
                    items={[
                      {
                        id: 'empty-tag',
                        text: 'Belum ada tag dipilih.',
                        style: styles.fieldHint,
                      },
                    ]}
                  />
                )}
              </View>
            </View>
          </FieldShell>
          <View style={styles.twoColumnGrid}>
            <FieldShell label="IUCN">
              <KolamDropdownSelect
                accessibilityLabel="Pilih status IUCN"
                label="IUCN"
                menuStyle={styles.longDropdownMenu}
                onChange={iucnStatusId =>
                  controller.onChangeForm({ iucnStatusId })
                }
                options={[
                  { label: 'Tanpa IUCN', value: '' },
                  ...controller.iucnStatuses.map(status => ({
                    label: `${status.abbreviation} - ${status.name}`,
                    value: status.id,
                  })),
                ]}
                searchable
                searchPlaceholder="Cari IUCN..."
                showLabelInTrigger={false}
                value={form.iucnStatusId}
              />
            </FieldShell>
            <FieldShell label="SKU">
              <KolamFormTextField
                editable={!controller.saving}
                onChangeText={sku => controller.onChangeForm({ sku })}
                placeholder="SKU"
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={form.sku}
              />
            </FieldShell>
          </View>
          <FieldShell label="Link Web dan Marketplace">
            <View style={styles.linkFieldGrid}>
              <KolamFormTextField
                editable={!controller.saving}
                mode="url"
                onChangeText={linkWebsite => controller.onChangeForm({ linkWebsite })}
                placeholder="Website"
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={form.linkWebsite}
              />
              <KolamFormTextField
                editable={!controller.saving}
                mode="url"
                onChangeText={linkShopee => controller.onChangeForm({ linkShopee })}
                placeholder="Shopee"
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={form.linkShopee}
              />
              <KolamFormTextField
                editable={!controller.saving}
                mode="url"
                onChangeText={linkTokopedia => controller.onChangeForm({ linkTokopedia })}
                placeholder="Tokopedia"
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={form.linkTokopedia}
              />
              <KolamFormTextField
                editable={!controller.saving}
                mode="url"
                onChangeText={linkPos => controller.onChangeForm({ linkPos })}
                placeholder="Link POS"
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={form.linkPos}
              />
              <KolamFormTextField
                editable={!controller.saving}
                mode="url"
                onChangeText={linkOther => controller.onChangeForm({ linkOther })}
                placeholder="Link lainnya"
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={form.linkOther}
              />
              <KolamFormTextField
                editable={!controller.saving}
                mode="url"
                onChangeText={iucnLink => controller.onChangeForm({ iucnLink })}
                placeholder="Link IUCN"
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={form.iucnLink}
              />
            </View>
          </FieldShell>
          <View style={styles.twoColumnGrid}>
            <FieldShell label="Dijual">
              <View style={styles.segmentRow}>
                <KolamButton
                  intent={form.sellable ? 'primary' : 'outline'}
                  label="Dijual"
                  onPress={() => controller.onChangeForm({ sellable: true })}
                />
                <KolamButton
                  intent={!form.sellable ? 'primary' : 'outline'}
                  label="Tidak dijual"
                  onPress={() => controller.onChangeForm({ sellable: false })}
                />
              </View>
            </FieldShell>
            <FieldShell label="Satuan">
              <KolamDropdownSelect
                accessibilityLabel="Pilih satuan"
                label="Satuan"
                menuStyle={styles.longDropdownMenu}
                onChange={unitId => controller.onChangeForm({ unitId })}
                options={[
                  { label: 'Pilih satuan', value: '' },
                  ...controller.units.map(unit => ({
                    label: unit.initial ? `${unit.name} (${unit.initial})` : unit.name,
                    value: unit.id,
                  })),
                ]}
                searchable
                searchPlaceholder="Cari satuan..."
                showLabelInTrigger={false}
                value={form.unitId}
              />
            </FieldShell>
          </View>
          <View style={styles.twoColumnGrid}>
            <FieldShell label="Harga Jual">
              <KolamFormTextField
                editable={!controller.saving}
                keyboardType="numeric"
                onChangeText={priceToSell =>
                  controller.onChangeForm({ priceToSell })
                }
                placeholder="0"
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={form.priceToSell}
              />
            </FieldShell>
            <FieldShell label="Stok Awal">
              <KolamFormTextField
                editable={!controller.saving}
                keyboardType="numeric"
                onChangeText={stock => controller.onChangeForm({ stock })}
                placeholder="0"
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={form.stock}
              />
            </FieldShell>
          </View>
          <SpeciesVariantEditorPanel
            controller={controller}
            onDeleteVariant={setDeleteVariantTarget}
          />
          <FieldShell label="Media Spesies">
            <View style={styles.mediaPickerStack}>
              <View style={styles.mediaPickerRow}>
                <KolamFormTextField
                  editable={false}
                  mode="url"
                  placeholder="Pilih thumbnail dari komputer"
                  style={[
                    settingsWebFormStyles.settingsWebFormFieldValue,
                    styles.mediaPickerInput,
                  ]}
                  value={form.thumbnailLocalUri}
                />
                <KolamButton
                  disabled={controller.saving}
                  label="Pilih Thumbnail"
                  onPress={() => {
                    void controller.onPickThumbnail();
                  }}
                />
              </View>
              <View style={styles.mediaPickerRow}>
                <KolamFormTextField
                  editable={false}
                  mode="url"
                  placeholder="Pilih foto untuk ditambahkan"
                  style={[
                    settingsWebFormStyles.settingsWebFormFieldValue,
                    styles.mediaPickerInput,
                  ]}
                  value={form.photoLocalUri}
                />
                <KolamButton
                  disabled={controller.saving}
                  label="Tambah Foto"
                  onPress={() => {
                    void controller.onPickPhoto();
                  }}
                />
              </View>
              <View style={styles.mediaPickerRow}>
                <KolamFormTextField
                  editable={false}
                  mode="url"
                  placeholder="Pilih video untuk ditambahkan"
                  style={[
                    settingsWebFormStyles.settingsWebFormFieldValue,
                    styles.mediaPickerInput,
                  ]}
                  value={form.videoLocalUri}
                />
                <KolamButton
                  disabled={controller.saving}
                  label="Tambah Video"
                  onPress={() => {
                    void controller.onPickVideo();
                  }}
                />
              </View>
              <View style={styles.mediaPickerRow}>
                <KolamFormTextField
                  editable={false}
                  mode="url"
                  placeholder="Pilih voice/audio spesies"
                  style={[
                    settingsWebFormStyles.settingsWebFormFieldValue,
                    styles.mediaPickerInput,
                  ]}
                  value={form.voiceLocalUri}
                />
                <KolamButton
                  disabled={controller.saving}
                  label="Pilih Voice"
                  onPress={() => {
                    void controller.onPickVoice();
                  }}
                />
              </View>
              <KolamCopyStack
                items={[
                  {
                    id: 'media-note',
                    text: 'Media dikirim ke backend saat Simpan, lalu detail dan cache lokal diperbarui.',
                    style: styles.fieldHint,
                  },
                ]}
              />
              {controller.selectedSpecies?.thumbnailUri || controller.selectedSpecies?.photoUris.length ? (
                <View style={styles.existingMediaGrid}>
                  {controller.selectedSpecies.thumbnailUri ? (
                    <View style={styles.existingMediaItem}>
                      <KolamRemoteImage
                        accessibilityLabel="Thumbnail spesies"
                        resizeMode="cover"
                        revision={
                          controller.selectedSpecies.updatedAt ??
                          controller.selectedSpecies.thumbnailUri
                        }
                        scope="species"
                        sourceUri={controller.selectedSpecies.thumbnailUri}
                        style={styles.existingMediaImage}
                      />
                      <KolamButton
                        disabled={controller.saving}
                        intent="danger"
                        label="Hapus Thumbnail"
                        onPress={() =>
                          setDeleteMediaTarget({
                            type: 'thumbnail',
                            label: 'thumbnail spesies',
                          })
                        }
                        style={styles.mediaDeleteButton}
                      />
                    </View>
                  ) : null}
                  {controller.selectedSpecies.photoUris.map((photoUri, index) => (
                    <SpeciesImageMediaCard
                      accessibilityLabel={`Foto spesies ${index + 1}`}
                      disabled={controller.saving}
                      key={`${photoUri}-${index}`}
                      onDelete={() =>
                        setDeleteMediaTarget({
                          type: 'photo',
                          index,
                          label: `foto ${index + 1}`,
                        })
                      }
                      onMoveDown={() => {
                        void controller.onReorderPhoto(index, 'down');
                      }}
                      onMoveUp={() => {
                        void controller.onReorderPhoto(index, 'up');
                      }}
                      revision={`${controller.selectedSpecies?.updatedAt ?? ''}-${index}`}
                      showMoveDown={index < (controller.selectedSpecies?.photoUris.length ?? 0) - 1}
                      showMoveUp={index > 0}
                      sourceUri={photoUri}
                      deleteLabel={`Hapus Foto ${index + 1}`}
                    />
                  ))}
                </View>
              ) : null}
              <SpeciesVideoVoiceMediaPanel
                controller={controller}
                onDelete={setDeleteMediaTarget}
              />
              <SpeciesVariantMediaPanel
                controller={controller}
                onDelete={setDeleteMediaTarget}
              />
            </View>
          </FieldShell>
          <KolamCatalogTranslationsEditor
            editable={!controller.saving}
            kind="species"
            onChange={translations => controller.onChangeForm({ translations })}
            primarySpeciesLocale={{
              commonName: form.commonName,
              localName: form.localName,
              shortDescription: form.shortDescription,
              description: form.description,
              morfologis: form.morfologis,
              habitat: form.habitat,
              distribution: form.distribution,
              onChange: patch => controller.onChangeForm(patch),
            }}
            translations={form.translations}
          />
        </View>
        <View style={styles.formActions}>
          <KolamButton
            disabled={controller.saving}
            label="Batal"
            onPress={() => {
              controller.onBackToList();
              onRouteChange?.('/species');
            }}
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
      <KolamDeleteConfirmDialog
        itemLabel={deleteVariantTarget?.label}
        itemType="varian spesies"
        onCancel={() => setDeleteVariantTarget(null)}
        onConfirm={() => {
          if (!deleteVariantTarget) {
            return;
          }

          removeSpeciesVariantRow(controller, deleteVariantTarget.id);
          setDeleteVariantTarget(null);
        }}
        visible={!!deleteVariantTarget}
      />
      <KolamDeleteConfirmDialog
        itemLabel={deleteMediaTarget?.label}
        itemType="media spesies"
        onCancel={() => setDeleteMediaTarget(null)}
        onConfirm={() => {
          const target = deleteMediaTarget;
          if (!target) {
            return;
          }

          const action = createDeleteMediaAction(controller, target);

          void action.then(success => {
            if (success) {
              setDeleteMediaTarget(null);
            }
          });
        }}
        visible={!!deleteMediaTarget}
      />
    </>
  );
}

function SpeciesVariantEditorPanel({
  controller,
  onDeleteVariant,
}: {
  controller: KolamSpeciesController;
  onDeleteVariant: (target: { id: string; label: string }) => void;
}) {
  const form = controller.form;

  return (
    <FieldShell label="Varian Spesies">
      <View style={styles.variantEditorPanel}>
        <View style={styles.twoColumnGrid}>
          <KolamFormTextField
            editable={!controller.saving}
            onChangeText={variantConfigTier1Name =>
              controller.onChangeForm({ variantConfigTier1Name, variantsTouched: true })
            }
            placeholder="Contoh: Ukuran"
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={form.variantConfigTier1Name}
          />
          <KolamFormTextField
            editable={!controller.saving}
            onChangeText={variantConfigTier2Name =>
              controller.onChangeForm({ variantConfigTier2Name, variantsTouched: true })
            }
            placeholder="Contoh: Jenis kelamin / fase"
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={form.variantConfigTier2Name}
          />
        </View>
        <View style={styles.variantEditorHeader}>
          <KolamCopyStack
            items={[
              {
                id: 'summary',
                text: form.variants.length
                  ? `${form.variants.length} varian disiapkan`
                  : 'Belum ada varian',
                style: styles.fieldHint,
              },
            ]}
          />
          <KolamButton
            disabled={controller.saving}
            intent="primary"
            label="Tambah Varian"
            onPress={() => addSpeciesVariantRow(controller)}
          />
        </View>
        {form.variants.map((variant, index) => (
          <SpeciesVariantFormCard
            controller={controller}
            index={index}
            key={variant.id}
            onDeleteVariant={onDeleteVariant}
            variant={variant}
          />
        ))}
      </View>
    </FieldShell>
  );
}

function SpeciesVariantFormCard({
  controller,
  index,
  onDeleteVariant,
  variant,
}: {
  controller: KolamSpeciesController;
  index: number;
  onDeleteVariant: (target: { id: string; label: string }) => void;
  variant: KolamSpeciesVariantFormRow;
}) {
  const unitOptions = [
    { label: 'Pilih satuan', value: '' },
    ...controller.units.map(unit => ({
      label: unit.initial ? `${unit.name} (${unit.initial})` : unit.name,
      value: unit.id,
    })),
  ];
  const liveVariant = controller.selectedSpecies?.variants.find(item => item.id === variant.id);
  const variantLabel = [variant.tier1Value, variant.tier2Value].filter(Boolean).join(' / ') || `Varian ${index + 1}`;

  return (
    <View style={styles.variantFormCard}>
      <View style={styles.variantEditorHeader}>
        <KolamCopyStack
          items={[
            {
              id: 'title',
              text: variantLabel,
              style: styles.variantTitle,
            },
            {
              id: 'stock',
              text: `Stok saat ini: ${formatNumber(liveVariant?.stock ?? 0)}`,
              style: styles.fieldHint,
            },
          ]}
        />
        <KolamButton
          disabled={controller.saving}
          intent="danger"
          label="Hapus Varian"
          onPress={() => onDeleteVariant({ id: variant.id, label: variantLabel })}
        />
      </View>
      <View style={styles.twoColumnGrid}>
        <KolamFormTextField
          editable={!controller.saving}
          onChangeText={tier1Value => updateSpeciesVariantRow(controller, variant.id, { tier1Value })}
          placeholder="Nilai varian utama"
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={variant.tier1Value}
        />
        <KolamFormTextField
          editable={!controller.saving}
          onChangeText={tier2Value => updateSpeciesVariantRow(controller, variant.id, { tier2Value })}
          placeholder="Nilai varian kedua"
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={variant.tier2Value}
        />
      </View>
      <View style={styles.twoColumnGrid}>
        <KolamFormTextField
          editable={!controller.saving}
          onChangeText={sku => updateSpeciesVariantRow(controller, variant.id, { sku })}
          placeholder="SKU varian"
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={variant.sku}
        />
        <KolamFormTextField
          editable={!controller.saving}
          onChangeText={productCode => updateSpeciesVariantRow(controller, variant.id, { productCode })}
          placeholder="Kode produk"
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={variant.productCode}
        />
      </View>
      <View style={styles.fourColumnGrid}>
        <KolamFormTextField
          editable={!controller.saving}
          keyboardType="numeric"
          onChangeText={price => updateSpeciesVariantRow(controller, variant.id, { price })}
          placeholder="HPP"
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={variant.price}
        />
        <KolamFormTextField
          editable={!controller.saving}
          keyboardType="numeric"
          onChangeText={priceToSell => updateSpeciesVariantRow(controller, variant.id, { priceToSell })}
          placeholder="Harga jual"
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={variant.priceToSell}
        />
        <KolamFormTextField
          editable={!controller.saving}
          keyboardType="numeric"
          onChangeText={onlinePrice => updateSpeciesVariantRow(controller, variant.id, { onlinePrice })}
          placeholder="Harga online"
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={variant.onlinePrice}
        />
        <KolamFormTextField
          editable={!controller.saving}
          keyboardType="numeric"
          onChangeText={minimumPriceToSales => updateSpeciesVariantRow(controller, variant.id, { minimumPriceToSales })}
          placeholder="Min. sales"
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={variant.minimumPriceToSales}
        />
      </View>
      <View style={styles.twoColumnGrid}>
        <KolamFormTextField
          editable={!controller.saving}
          keyboardType="numeric"
          onChangeText={marketPrice => updateSpeciesVariantRow(controller, variant.id, { marketPrice })}
          placeholder="Harga pasar"
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={variant.marketPrice}
        />
        <KolamFormTextField
          editable={!controller.saving}
          keyboardType="numeric"
          onChangeText={minimumOrderQty => updateSpeciesVariantRow(controller, variant.id, { minimumOrderQty })}
          placeholder="Minimum order"
          style={settingsWebFormStyles.settingsWebFormFieldValue}
          value={variant.minimumOrderQty}
        />
      </View>
      <View style={styles.twoColumnGrid}>
        <View style={styles.inlineFieldGroup}>
          <KolamFormTextField
            editable={!controller.saving}
            keyboardType="numeric"
            onChangeText={weightValue => updateSpeciesVariantRow(controller, variant.id, { weightValue })}
            placeholder="Berat"
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={variant.weightValue}
          />
          <KolamDropdownSelect
            label="Satuan berat"
            menuStyle={styles.longDropdownMenu}
            onChange={weightUnitId => updateSpeciesVariantRow(controller, variant.id, { weightUnitId })}
            options={unitOptions}
            searchable
            searchPlaceholder="Cari satuan..."
            showLabelInTrigger={false}
            value={variant.weightUnitId}
          />
        </View>
        <View style={styles.inlineFieldGroup}>
          <View style={styles.dimensionTriplet}>
            <KolamFormTextField
              editable={!controller.saving}
              keyboardType="numeric"
              onChangeText={dimensionLength => updateSpeciesVariantRow(controller, variant.id, { dimensionLength })}
              placeholder="P"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={variant.dimensionLength}
            />
            <KolamFormTextField
              editable={!controller.saving}
              keyboardType="numeric"
              onChangeText={dimensionWidth => updateSpeciesVariantRow(controller, variant.id, { dimensionWidth })}
              placeholder="L"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={variant.dimensionWidth}
            />
            <KolamFormTextField
              editable={!controller.saving}
              keyboardType="numeric"
              onChangeText={dimensionHeight => updateSpeciesVariantRow(controller, variant.id, { dimensionHeight })}
              placeholder="T"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={variant.dimensionHeight}
            />
          </View>
          <KolamDropdownSelect
            label="Satuan dimensi"
            menuStyle={styles.longDropdownMenu}
            onChange={dimensionUnitId => updateSpeciesVariantRow(controller, variant.id, { dimensionUnitId })}
            options={unitOptions}
            searchable
            searchPlaceholder="Cari satuan..."
            showLabelInTrigger={false}
            value={variant.dimensionUnitId}
          />
        </View>
      </View>
    </View>
  );
}

function addSpeciesVariantRow(controller: KolamSpeciesController) {
  controller.onChangeForm({
    variants: [...controller.form.variants, createEmptyKolamSpeciesVariantFormRow()],
    variantsTouched: true,
  });
}

function updateSpeciesVariantRow(
  controller: KolamSpeciesController,
  id: string,
  patch: Partial<KolamSpeciesVariantFormRow>,
) {
  controller.onChangeForm({
    variants: controller.form.variants.map(variant =>
      variant.id === id ? { ...variant, ...patch } : variant,
    ),
    variantsTouched: true,
  });
}

function removeSpeciesVariantRow(controller: KolamSpeciesController, id: string) {
  const nextVariants = controller.form.variants.filter(variant => variant.id !== id);
  controller.onChangeForm({
    selectedVariantId:
      controller.form.selectedVariantId === id ? '' : controller.form.selectedVariantId,
    variants: nextVariants,
    variantsTouched: true,
  });
}
function SpeciesVideoVoiceMediaPanel({
  controller,
  onDelete,
}: {
  controller: KolamSpeciesController;
  onDelete: (target: SpeciesDeleteMediaTarget) => void;
}) {
  const item = controller.selectedSpecies;
  if (!item) {
    return null;
  }

  return (
    <View style={styles.mediaLinkStack}>
      {item.videoUris.map((videoUri, index) => (
        <SpeciesLinkMediaRow
          disabled={controller.saving}
          key={`${videoUri}-${index}`}
          label={`Video ${index + 1}`}
          onDelete={() =>
            onDelete({ type: 'video', index, label: `video ${index + 1}` })
          }
          onMoveDown={() => {
            void controller.onReorderVideo(index, 'down');
          }}
          onMoveUp={() => {
            void controller.onReorderVideo(index, 'up');
          }}
          showMoveDown={index < item.videoUris.length - 1}
          showMoveUp={index > 0}
          uri={videoUri}
        />
      ))}
      {item.voiceUri ? (
        <SpeciesLinkMediaRow
          disabled={controller.saving}
          label="Voice Spesies"
          onDelete={() => onDelete({ type: 'voice', label: 'voice spesies' })}
          uri={item.voiceUri}
        />
      ) : null}
    </View>
  );
}

function SpeciesVariantMediaPanel({
  controller,
  onDelete,
}: {
  controller: KolamSpeciesController;
  onDelete: (target: SpeciesDeleteMediaTarget) => void;
}) {
  const item = controller.selectedSpecies;
  const form = controller.form;
  const selectedVariant = item?.variants.find(
    variant => variant.id === form.selectedVariantId,
  );

  if (!item?.variants.length) {
    return null;
  }

  return (
    <View style={styles.variantMediaPanel}>
      <KolamDropdownSelect
        accessibilityLabel="Pilih varian untuk media"
        label="Varian"
        menuStyle={styles.longDropdownMenu}
        onChange={selectedVariantId =>
          controller.onChangeForm({ selectedVariantId })
        }
        options={[
          { label: 'Pilih varian', value: '' },
          ...item.variants.map(variant => ({
            label: variant.sku ? `${variant.label} (${variant.sku})` : variant.label,
            value: variant.id,
          })),
        ]}
        searchable
        searchPlaceholder="Cari varian..."
        showLabelInTrigger={false}
        value={form.selectedVariantId}
      />
      <View style={styles.mediaPickerRow}>
        <KolamFormTextField
          editable={false}
          mode="url"
          placeholder="Pilih foto varian"
          style={[
            settingsWebFormStyles.settingsWebFormFieldValue,
            styles.mediaPickerInput,
          ]}
          value={form.variantPhotoLocalUri}
        />
        <KolamButton
          disabled={controller.saving || !form.selectedVariantId}
          label="Tambah Foto Varian"
          onPress={() => {
            void controller.onPickVariantPhoto();
          }}
        />
      </View>
      <View style={styles.mediaPickerRow}>
        <KolamFormTextField
          editable={false}
          mode="url"
          placeholder="Pilih video varian"
          style={[
            settingsWebFormStyles.settingsWebFormFieldValue,
            styles.mediaPickerInput,
          ]}
          value={form.variantVideoLocalUri}
        />
        <KolamButton
          disabled={controller.saving || !form.selectedVariantId}
          label="Tambah Video Varian"
          onPress={() => {
            void controller.onPickVariantVideo();
          }}
        />
      </View>
      {selectedVariant ? (
        <View style={styles.existingMediaGrid}>
          {selectedVariant.photoUris.map((photoUri, index) => (
            <SpeciesImageMediaCard
              accessibilityLabel={`Foto varian ${index + 1}`}
              disabled={controller.saving}
              key={`${selectedVariant.id}-photo-${index}`}
              onDelete={() =>
                onDelete({
                  type: 'variant-photo',
                  variantId: selectedVariant.id,
                  index,
                  label: `${selectedVariant.label} foto ${index + 1}`,
                })
              }
              revision={`${selectedVariant.id}-${photoUri}`}
              sourceUri={photoUri}
              deleteLabel={`Hapus Foto ${index + 1}`}
            />
          ))}
          {selectedVariant.videoUris.map((videoUri, index) => (
            <SpeciesLinkMediaRow
              disabled={controller.saving}
              key={`${selectedVariant.id}-video-${index}`}
              label={`Video Varian ${index + 1}`}
              onDelete={() =>
                onDelete({
                  type: 'variant-video',
                  variantId: selectedVariant.id,
                  index,
                  label: `${selectedVariant.label} video ${index + 1}`,
                })
              }
              uri={videoUri}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function SpeciesImageMediaCard({
  accessibilityLabel,
  deleteLabel,
  disabled,
  onDelete,
  onMoveDown,
  onMoveUp,
  revision,
  showMoveDown = false,
  showMoveUp = false,
  sourceUri,
}: {
  accessibilityLabel: string;
  deleteLabel: string;
  disabled: boolean;
  onDelete: () => void;
  onMoveDown?: () => void;
  onMoveUp?: () => void;
  revision: string;
  showMoveDown?: boolean;
  showMoveUp?: boolean;
  sourceUri: string;
}) {
  return (
    <View style={styles.existingMediaItem}>
      <KolamRemoteImage
        accessibilityLabel={accessibilityLabel}
        resizeMode="cover"
        revision={revision}
        scope="species"
        sourceUri={sourceUri}
        style={styles.existingMediaImage}
      />
      {onMoveUp || onMoveDown ? (
        <View style={styles.mediaLinkRow}>
          <KolamButton
            disabled={disabled || !showMoveUp}
            label="Naik"
            onPress={onMoveUp ?? (() => undefined)}
          />
          <KolamButton
            disabled={disabled || !showMoveDown}
            label="Turun"
            onPress={onMoveDown ?? (() => undefined)}
          />
        </View>
      ) : null}
      <KolamButton
        disabled={disabled}
        intent="danger"
        label={deleteLabel}
        onPress={onDelete}
        style={styles.mediaDeleteButton}
      />
    </View>
  );
}

function SpeciesLinkMediaRow({
  disabled,
  label,
  onDelete,
  onMoveDown,
  onMoveUp,
  showMoveDown = false,
  showMoveUp = false,
  uri,
}: {
  disabled: boolean;
  label: string;
  onDelete: () => void;
  onMoveDown?: () => void;
  onMoveUp?: () => void;
  showMoveDown?: boolean;
  showMoveUp?: boolean;
  uri: string;
}) {
  return (
    <View style={styles.mediaLinkRow}>
      <KolamButton
        label={label}
        onPress={() => {
          void Linking.openURL(uri);
        }}
      />
      {onMoveUp || onMoveDown ? (
        <>
          <KolamButton
            disabled={disabled || !showMoveUp}
            label="Naik"
            onPress={onMoveUp ?? (() => undefined)}
          />
          <KolamButton
            disabled={disabled || !showMoveDown}
            label="Turun"
            onPress={onMoveDown ?? (() => undefined)}
          />
        </>
      ) : null}
      <KolamButton
        disabled={disabled}
        intent="danger"
        label="Hapus"
        onPress={onDelete}
      />
    </View>
  );
}

function createDeleteMediaAction(
  controller: KolamSpeciesController,
  target: SpeciesDeleteMediaTarget,
) {
  switch (target.type) {
    case 'thumbnail':
      return controller.onDeleteThumbnail();
    case 'photo':
      return controller.onDeletePhoto(target.index);
    case 'video':
      return controller.onDeleteVideo(target.index);
    case 'voice':
      return controller.onDeleteVoice();
    case 'variant-photo':
      return controller.onDeleteVariantPhoto(target.variantId, target.index);
    case 'variant-video':
      return controller.onDeleteVariantVideo(target.variantId, target.index);
    default:
      return Promise.resolve(false);
  }
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
      <KolamCopyStack
        items={[
          {
            id: 'label',
            text: required ? `${label} *` : label,
            style: settingsWebFormStyles.settingsWebFormFieldLabel,
          },
        ]}
      />
      {children}
    </View>
  );
}
function KolamSpeciesDetail({
  controller,
}: {
  controller: KolamSpeciesController;
}) {
  const item = controller.selectedSpecies;

  if (!item) {
    return (
      <View style={styles.emptyWrap}>
        <KolamEmptyState
          compact
          message="Pilih spesies dari daftar untuk melihat detail."
          title="Detail spesies belum dipilih"
        />
      </View>
    );
  }

  const detailLinks = [
    ...item.links,
    ...(item.iucnLink
      ? [{ label: 'IUCN Link', name: 'iucn' as const, value: item.iucnLink }]
      : []),
  ];

  return (
    <KolamLabelFieldDetailOverview
      hero={
        <View style={styles.detailHeroImage}>
          <KolamRemoteImage
            accessibilityLabel={`Foto ${item.displayName}`}
            resizeMode="cover"
            revision={item.updatedAt ?? item.thumbnailUri ?? item.id}
            scope="species"
            sourceUri={item.thumbnailUri}
            style={styles.detailHeroImage}
          />
        </View>
      }
      meta={[
        { label: 'Nama umum', value: item.commonName || '-' },
        { label: 'Nama lokal', value: item.localName || '-' },
        { label: 'Taksonomi', value: item.taxonomyPath || item.taxonomy?.name || '-' },
        {
          label: 'Kategori',
          value: item.categories.map(category => category.name).join(', ') || '-',
        },
        { label: 'SKU', value: item.sku || '-' },
        { label: 'IUCN', value: item.iucnStatus?.name || '-' },
        {
          label: 'Tag',
          value: item.tags.map(tag => tag.name).join(', ') || '-',
        },
        ...detailLinks.map(link => ({
          label: link.label,
          value: link.value,
          onPress: () => openExternalUrl(link.value),
        })),
      ]}
      metrics={[
        { label: 'Stok', value: formatNumber(item.stock) },
        { label: 'Varian', value: item.variantCount },
        { label: 'Harga Jual', value: formatCurrency(item.priceToSell) },
      ]}
      sections={[
        {
          accordion: true,
          description: 'Terjemahan dan deskripsi yang akan dipakai webstore.',
          emptyText: 'Belum ada data terjemahan.',
          items: item.locales.map(locale => ({
            badge: locale.code.toUpperCase(),
            title: getLocaleLabel(locale.code),
            value:
              locale.shortDescription ||
              locale.description ||
              locale.commonName ||
              '-',
            meta: [
              locale.commonName ? `Nama umum: ${locale.commonName}` : '',
              locale.localName ? `Nama lokal: ${locale.localName}` : '',
              locale.habitat ? `Habitat: ${locale.habitat}` : '',
              locale.distribution ? `Distribusi: ${locale.distribution}` : '',
            ]
              .filter(Boolean)
              .join('\n'),
          })),
          title: 'Terjemahan',
          total: item.locales.length,
        },
        {
          description: 'Link eksternal yang tersimpan di backend dan cache lokal.',
          emptyText: 'Belum ada link eksternal.',
          items: detailLinks.map(link => ({
            title: link.label,
            value: link.value,
          })),
          title: 'Link',
          total: detailLinks.length,
        },
        {
          description: 'Media lokal yang disinkron dari backend ketika ada perubahan.',
          emptyText: 'Belum ada foto spesies.',
          items: item.photoUris.map((uri, index) => ({
            thumbnail: (
              <KolamRemoteImage
                accessibilityLabel={`Foto spesies ${index + 1}`}
                resizeMode="cover"
                revision={`${item.updatedAt ?? item.id}-${index}`}
                scope="species"
                sourceUri={uri}
                style={styles.sectionThumb}
              />
            ),
            title: `Foto ${index + 1}`,
            value: 'Cache lokal',
          })),
          title: 'Media',
          total: item.photoUris.length,
        },
      ]}
      status={{
        intent: item.status === 'active' ? 'success' : 'muted',
        label: getSpeciesStatusLabel(item.status),
      }}
    />
  );
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <KolamContentFrame style={styles.summaryTile} variant="settingsWebConfig">
      <KolamCopyStack
        items={[
          {
            id: 'value',
            text: formatNumber(value),
            style: styles.summaryValue,
          },
          {
            id: 'label',
            text: label,
            style: styles.summaryLabel,
          },
        ]}
      />
    </KolamContentFrame>
  );
}

function getSpeciesSummary(species: KolamSpecies[]) {
  return species.reduce(
    (summary, item) => ({
      sellable: summary.sellable + (item.sellable ? 1 : 0),
      inStock: summary.inStock + (item.stock > 0 ? 1 : 0),
      outOfStock: summary.outOfStock + (item.stock <= 0 ? 1 : 0),
    }),
    { sellable: 0, inStock: 0, outOfStock: 0 },
  );
}

function filterSpecies(
  species: KolamSpecies[],
  search: string,
  statusFilter: SpeciesStatusFilter,
  stockFilter: KolamSpeciesStockStatus,
  sellableFilter: KolamSpeciesSellableFilter,
) {
  const normalizedSearch = search.trim().toLowerCase();

  return species.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) {
      return false;
    }

    if (stockFilter === 'in_stock' && item.stock <= 0) {
      return false;
    }

    if (stockFilter === 'out_of_stock' && item.stock > 0) {
      return false;
    }

    if (sellableFilter === 'sellable' && !item.sellable) {
      return false;
    }

    if (sellableFilter === 'not-sellable' && item.sellable) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return [
      item.scientificName,
      item.commonName,
      item.localName,
      item.sku,
      item.taxonomyPath,
      ...item.categories.map(category => category.name),
      ...item.tags.map(tag => tag.name),
    ]
      .join(' ')
      .toLowerCase()
      .includes(normalizedSearch);
  });
}

function sortSpecies(species: KolamSpecies[], sortMode: SpeciesSortMode) {
  const next = [...species];

  switch (sortMode) {
    case 'name-desc':
      return next.sort((a, b) => b.displayName.localeCompare(a.displayName));
    case 'price-desc':
      return next.sort((a, b) => b.priceToSell - a.priceToSell);
    case 'stock-desc':
      return next.sort((a, b) => b.stock - a.stock);
    case 'newest':
      return next.sort((a, b) =>
        String(b.updatedAt ?? b.createdAt ?? '').localeCompare(
          String(a.updatedAt ?? a.createdAt ?? ''),
        ),
      );
    default:
      return next.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }
}

function getSpeciesRoute(item: KolamSpecies) {
  return `/species/${encodeURIComponent(item.slug || slugifySpeciesName(item.scientificName) || item.id)}`;
}

function openExternalUrl(value: string) {
  const url = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  void Linking.openURL(url);
}

function getLocaleLabel(code: string) {
  switch (code) {
    case 'id':
      return 'Indonesia';
    case 'en':
      return 'English';
    case 'fr':
      return 'Francais';
    case 'zh':
      return 'Chinese';
    case 'hi':
      return 'Hindi';
    case 'ar':
      return 'Arabic';
    case 'ja':
      return 'Japanese';
    default:
      return code.toUpperCase();
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    currency: 'IDR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value || 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(value || 0);
}

const styles = StyleSheet.create({
  surface: {
    gap: 16,
  },
  header: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
    gap: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryTile: {
    flexBasis: 220,
    flexGrow: 1,
  },
  summaryValue: {
    color: V.colors.fg,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  summaryLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  tableToolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  searchInput: {
    minWidth: 220,
  },
  emptyWrap: {
    padding: 24,
  },
  paginationBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  pageLabel: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  tableRow: {
    alignItems: 'center',
  },
  cell: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  primaryCell: {
    alignItems: 'center',
    flex: 1,
    minWidth: 260,
  },
  metaCell: {
    width: 126,
  },
  amountCell: {
    justifyContent: 'flex-end',
    width: 140,
  },
  stockCell: {
    justifyContent: 'flex-end',
    width: 110,
  },
  syncCell: {
    width: 132,
  },
  notesCell: {
    width: 230,
  },
  statusCell: {
    justifyContent: 'flex-end',
    width: 116,
  },
  actionsCell: {
    justifyContent: 'flex-end',
    width: 64,
  },
  speciesThumb: {
    backgroundColor: V.colors.secondary,
    borderRadius: 6,
    height: 44,
    overflow: 'hidden',
    width: 44,
  },
  speciesThumbImage: {
    height: 44,
    width: 44,
  },
  primaryCopy: {
    flex: 1,
    marginLeft: 12,
  },
  scientificName: {
    color: V.colors.fg,
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '800',
    lineHeight: 20,
  },
  rowText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  rowTextRight: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'right',
  },
  rowSubtext: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  rowSubtextRight: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    textAlign: 'right',
  },
  detailHeroImage: {
    backgroundColor: V.colors.secondary,
    borderRadius: 6,
    height: 96,
    overflow: 'hidden',
    width: 128,
  },
  twoColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  fourColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  variantEditorPanel: {
    gap: 12,
  },
  variantEditorHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  variantFormCard: {
    backgroundColor: V.colors.mutedSoft,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  variantTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  inlineFieldGroup: {
    flexBasis: 320,
    flexGrow: 1,
    gap: 8,
  },
  dimensionTriplet: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryPickerStack: {
    gap: 10,
  },
  selectedCategoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedCategoryButton: {
    minHeight: 32,
  },
  linkFieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  fieldHint: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  mediaLinkStack: {
    gap: 8,
  },
  mediaLinkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variantMediaPanel: {
    backgroundColor: V.colors.secondary,
    borderRadius: 6,
    gap: 10,
    padding: 10,
  },  existingMediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  existingMediaItem: {
    alignItems: 'center',
    backgroundColor: V.colors.secondary,
    borderRadius: 6,
    gap: 8,
    padding: 8,
    width: 132,
  },
  existingMediaImage: {
    borderRadius: 6,
    height: 72,
    width: 116,
  },
  mediaDeleteButton: {
    minHeight: 30,
  },  mediaPickerStack: {
    gap: 10,
  },
  mediaPickerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mediaPickerInput: {
    flex: 1,
    minWidth: 240,
  },  segmentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  formActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    paddingTop: 16,
  },
  longDropdownMenu: {
    maxHeight: 320,
    minWidth: 280,
  },  sectionThumb: {
    borderRadius: 6,
    height: 36,
    width: 36,
  },
});



































