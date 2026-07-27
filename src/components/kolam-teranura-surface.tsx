import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { type KolamTableColumn, getKolamTableColumns } from '../domain/kolam-table';
import { type KolamTeranura } from '../domain/kolam-teranura';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  type KolamTeranuraSellableFilter,
  useKolamTeranuraController,
} from '../hooks/use-kolam-teranura-controller';
import { formatRupiah } from '../lib/money';
import { KolamBadge } from './kolam-badge';
import { KolamButton } from './kolam-button';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDataTableHeader } from './kolam-data-table-header';
import { KolamDataTableRowFrame } from './kolam-data-table-row-frame';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamRemoteImage } from './kolam-remote-image';

export function KolamTeranuraSurface({
  onRouteChange,
}: {
  onRouteChange?: (route: string) => void;
}) {
  const controller = useKolamTeranuraController();
  const columns = React.useMemo(() => getKolamTableColumns('teranura'), []);
  const categoryOptions = React.useMemo(
    () => [
      { label: 'Semua kategori', value: 'all' },
      ...controller.categories.map(category => ({
        label: category.name,
        value: category.id,
      })),
    ],
    [controller.categories],
  );
  const brandOptions = React.useMemo(
    () => [
      { label: 'Semua merek', value: 'all' },
      ...controller.brands.map(brand => ({
        label: brand.name,
        value: brand.id,
      })),
    ],
    [controller.brands],
  );
  const sellableOptions = React.useMemo(
    (): Array<{ label: string; value: KolamTeranuraSellableFilter }> => [
      { label: 'Semua status', value: 'all' },
      { label: 'Dapat dijual', value: 'true' },
      { label: 'Tidak dijual', value: 'false' },
    ],
    [],
  );
  const pageCount = Math.max(1, controller.pagination.totalPages);
  const safePage = Math.min(Math.max(controller.pagination.page, 1), pageCount);
  const selectedCategory = controller.filters.categoryIds[0] ?? 'all';
  const selectedBrand = controller.filters.brandIds[0] ?? 'all';

  return (
    <View style={styles.surface}>
      <View style={styles.stack}>
        <View style={styles.toolbarShell}>
          <View style={styles.filterRow}>
            <KolamFormTextField
              mode="search"
              onChangeText={controller.onSearchChange}
              placeholder="Cari Teranura..."
              style={styles.searchInput}
              value={controller.filters.search}
            />
            <KolamDropdownSelect
              label="Kategori"
              onChange={value =>
                controller.onChangeFilters({
                  categoryIds: value === 'all' ? [] : [value],
                })
              }
              options={categoryOptions}
              searchable
              searchPlaceholder="Cari kategori..."
              triggerStyle={styles.filterSelect}
              value={selectedCategory}
            />
            <KolamDropdownSelect
              label="Merek"
              onChange={value =>
                controller.onChangeFilters({
                  brandIds: value === 'all' ? [] : [value],
                })
              }
              options={brandOptions}
              searchable
              searchPlaceholder="Cari merek..."
              triggerStyle={styles.filterSelect}
              value={selectedBrand}
            />
            <KolamDropdownSelect<KolamTeranuraSellableFilter>
              label="Status"
              onChange={value => controller.onChangeFilters({ sellable: value })}
              options={sellableOptions}
              triggerStyle={styles.filterSelect}
              value={controller.filters.sellable}
            />
          </View>
          <View style={styles.actionRow}>
            <KolamButton
              disabled={controller.loading}
              label="Muat Ulang"
              onPress={() => {
                void controller.onRefresh();
              }}
              style={styles.toolbarButton}
            />
            <KolamButton
              intent="primary"
              label="Baru"
              onPress={() => onRouteChange?.('/teranura/create')}
              style={styles.toolbarButton}
            />
          </View>
        </View>

        {controller.error ? <Text style={styles.error}>{controller.error}</Text> : null}

        <KolamContentFrame
          style={styles.tableFrame}
          variant="settingsWebConfig"
        >
          <FlatList
            data={controller.items}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <KolamEmptyState
                  compact
                  message="Data Teranura belum tersedia dari backend."
                  title={
                    controller.loading
                      ? 'Memuat Teranura...'
                      : 'Belum ada Teranura'
                  }
                />
              </View>
            }
            ListHeaderComponent={<KolamDataTableHeader columns={columns} />}
            renderItem={({ item }) => (
              <TeranuraRow
                columns={columns}
                item={item}
                onEdit={() => onRouteChange?.(`/teranura/${item.id}/edit`)}
                onSelect={() => onRouteChange?.(`/teranura/${item.id}`)}
              />
            )}
            style={styles.list}
          />
        </KolamContentFrame>

        <View style={styles.footerWrap}>
          <KolamTableFooterControls
            onPageSizeChange={controller.onLimitChange}
            page={safePage}
            pageSize={controller.pagination.limit}
            total={controller.pagination.total}
          >
            {pageCount > 1 ? (
              <View style={styles.paginationBar}>
                <KolamButton
                  disabled={safePage <= 1}
                  label="Sebelumnya"
                  onPress={() => controller.onPageChange(safePage - 1)}
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
                  onPress={() => controller.onPageChange(safePage + 1)}
                />
              </View>
            ) : null}
          </KolamTableFooterControls>
        </View>
      </View>
    </View>
  );
}

function TeranuraRow({
  columns,
  item,
  onEdit,
  onSelect,
}: {
  columns: KolamTableColumn[];
  item: KolamTeranura;
  onEdit: () => void;
  onSelect: () => void;
}) {
  const code = item.sku || item.productCode || '-';
  const variantLabel = item.variants.length ? 'Produk varian' : 'Produk standar';

  return (
    <KolamDataTableRowFrame>
      <View style={styles.primaryCell}>
        <View style={styles.photoBox}>
          <KolamRemoteImage
            accessibilityLabel={item.name}
            scope="teranura"
            sourceUri={item.photoUrl}
            style={styles.photo}
          />
        </View>
        <View style={styles.primaryTextWrap}>
          <View style={styles.nameRow}>
            <Text numberOfLines={2} style={styles.nameText}>{item.name}</Text>
            {item.deviceLine === 'freyer' ? (
              <KolamBadge intent="info" label="Freyer" />
            ) : null}
          </View>
          <Text numberOfLines={1} style={styles.metaText}>
            {item.category?.name ?? 'Tanpa kategori'}
          </Text>
        </View>
      </View>
      <Text numberOfLines={1} selectable style={[styles.cellText, getCellWidth(columns, 'meta')]}>
        {code}
      </Text>
      <View style={[styles.brandCell, getCellWidth(columns, 'price')]}>
        {item.brand?.logoUrl ? (
          <KolamRemoteImage
            accessibilityLabel={item.brand.name}
            scope="brand"
            sourceUri={item.brand.logoUrl}
            style={styles.brandLogo}
          />
        ) : null}
        <Text numberOfLines={1} style={styles.cellText}>
          {item.brand?.name ?? '-'}
        </Text>
      </View>
      <Text numberOfLines={1} style={[styles.cellText, getCellWidth(columns, 'children')]}>
        {variantLabel}
      </Text>
      <Text numberOfLines={1} style={[styles.amountText, getCellWidth(columns, 'amount')]}>
        {item.priceToSell > 0 ? formatRupiah(item.priceToSell) : '-'}
      </Text>
      <Text numberOfLines={1} style={[styles.amountText, getCellWidth(columns, 'products')]}>
        {formatNumber(item.stock)}{item.unitLabel ? ` ${item.unitLabel}` : ''}
      </Text>
      <View style={[styles.statusCell, getCellWidth(columns, 'status')]}>
        <KolamBadge
          intent={item.sellable ? 'success' : 'secondary'}
          label={item.sellable ? 'Dapat dijual' : 'Tidak dijual'}
        />
      </View>
      <View style={[styles.actionsCell, getCellWidth(columns, 'actions')]}>
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

function getCellWidth(columns: KolamTableColumn[], id: KolamTableColumn['id']) {
  const width = columns.find(column => column.id === id)?.width;
  return width ? { width } : null;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value);
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    minHeight: 0,
  },
  stack: {
    flex: 1,
    minHeight: 0,
    gap: 16,
  },
  toolbarShell: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  filterRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    minWidth: 220,
  },
  filterSelect: {
    minWidth: 154,
    backgroundColor: V.colors.primarySoft,
    borderColor: V.colors.primary,
  },
  toolbarButton: {
    minHeight: 36,
  },
  error: {
    color: V.colors.danger,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  tableFrame: {
    flex: 1,
    minHeight: 0,
  },
  list: {
    flex: 1,
  },
  emptyWrap: {
    minHeight: 240,
    justifyContent: 'center',
  },
  primaryCell: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  photoBox: {
    width: 44,
    height: 44,
    flexShrink: 0,
    overflow: 'hidden',
    borderRadius: V.radius.md,
    backgroundColor: V.colors.secondary,
  },
  photo: {
    width: 44,
    height: 44,
  },
  primaryTextWrap: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  nameRow: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nameText: {
    flexShrink: 1,
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
  metaText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  cellText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  amountText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 16,
    textAlign: 'right',
  },
  brandCell: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLogo: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  statusCell: {
    alignItems: 'flex-end',
  },
  actionsCell: {
    alignItems: 'flex-end',
  },
  footerWrap: {
    paddingBottom: 8,
  },
  paginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
});
