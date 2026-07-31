import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  formatKolamLayananUnitPrice,
  getKolamLayananTaskTypeLabel,
  KOLAM_LAYANAN_LIST_TABS,
  KOLAM_LAYANAN_ROOT,
  type KolamLayananService,
} from '../domain/kolam-layanan';
import { type KolamTableColumn } from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamLayananController,
  type KolamLayananController,
} from '../hooks/use-kolam-layanan-controller';
import { KolamButton } from './kolam-button';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
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
  KolamOverflowMenuButton,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamSearchField } from './kolam-search-field';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

const LIST_COLUMNS: KolamTableColumn[] = [
  { id: 'primary', label: 'Nama', align: 'left', width: 180 },
  { id: 'meta', label: 'SKU', align: 'left', width: 110 },
  { id: 'children', label: 'Kode paket', align: 'left', width: 110 },
  { id: 'products', label: 'Merek', align: 'left', width: 130 },
  { id: 'status', label: 'Tipe', align: 'left', width: 110 },
  { id: 'notes', label: 'Jual m³', align: 'right', width: 90 },
  { id: 'marketplace', label: 'Jual km', align: 'right', width: 90 },
  {
    id: 'actions',
    label: '',
    align: 'right',
    width: KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  },
];

export function KolamLayananSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamLayananController(route);

  if (controller.mode !== 'list') {
    return (
      <KolamLayananPlaceholder
        controller={controller}
        onRouteChange={onRouteChange}
        route={route}
      />
    );
  }

  return (
    <View style={styles.surface}>
      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
          style={styles.errorBadge}
        />
      ) : null}
      <KolamLayananList controller={controller} onRouteChange={onRouteChange} />
    </View>
  );
}

function KolamLayananPlaceholder({
  controller,
  onRouteChange,
  route,
}: {
  controller: KolamLayananController;
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const title =
    controller.mode === 'create'
      ? 'Layanan baru'
      : controller.mode === 'edit'
        ? 'Ubah layanan'
        : controller.mode === 'langganan'
          ? 'Detail langganan'
          : controller.mode === 'voucher'
            ? 'Detail voucher'
            : controller.mode === 'execution'
              ? 'Detail eksekusi kunjungan'
              : 'Detail layanan';

  return (
    <View style={styles.surface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text numberOfLines={1} style={styles.placeholderTitle}>
              {title}
            </Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              label="Daftar"
              onPress={() => onRouteChange?.(KOLAM_LAYANAN_ROOT)}
            />
          </View>
        </View>
      </View>
      <KolamEmptyState
        message={`Halaman ${route} menyusul di batch berikutnya. Kembali ke daftar untuk mengelola katalog paket.`}
        title="Segera hadir"
      />
    </View>
  );
}

function KolamLayananList({
  controller,
  onRouteChange,
}: {
  controller: KolamLayananController;
  onRouteChange?: (route: string) => void;
}) {
  const [tableBodyWidth, setTableBodyWidth] = React.useState(0);

  const columns = React.useMemo(() => {
    if (tableBodyWidth <= 0) {
      return LIST_COLUMNS;
    }
    const flexible = LIST_COLUMNS.filter(column => column.id !== 'actions');
    const actionsWidth = KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH;
    const gapTotal = KOLAM_DATA_TABLE_COLUMN_GAP * (LIST_COLUMNS.length - 1);
    const available = Math.max(
      420,
      tableBodyWidth - actionsWidth - gapTotal,
    );
    const baseWidth = flexible.reduce(
      (sum, column) => sum + (column.width ?? 100),
      0,
    );
    const scale = available / Math.max(1, baseWidth);
    return [
      ...flexible.map(column => ({
        ...column,
        width: Math.max(56, Math.round((column.width ?? 100) * scale)),
      })),
      { ...LIST_COLUMNS[LIST_COLUMNS.length - 1], width: actionsWidth },
    ];
  }, [tableBodyWidth]);

  return (
    <View style={styles.stack}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            {KOLAM_LAYANAN_LIST_TABS.map(tab => (
              <KolamButton
                intent={
                  controller.activeTab === tab.id ? 'primary' : 'outline'
                }
                key={tab.id}
                label={tab.label}
                onPress={() => {
                  const href = controller.onTabChange(tab.id);
                  onRouteChange?.(href);
                }}
                style={styles.tabButton}
              />
            ))}
            {controller.activeTab === 'daftar' ? (
              <KolamSearchField
                containerStyle={kolamTableToolbarStyles.searchInput}
                onChangeText={controller.onSearchChange}
                placeholder="Cari layanan…"
                value={controller.search}
              />
            ) : null}
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              disabled={controller.loading || controller.activeTab !== 'daftar'}
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
                onRouteChange?.(`${KOLAM_LAYANAN_ROOT}/create`);
              }}
            />
          </View>
        </View>
      </View>

      {controller.activeTab === 'daftar' ? (
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
          {!controller.loading && controller.services.length === 0 ? (
            <KolamEmptyState
              message="Belum ada paket layanan, atau pencarian tidak menemukan hasil."
              title="Layanan kosong"
            />
          ) : null}
          {controller.services.map(service => (
            <KolamLayananServiceRow
              columns={columns}
              key={service.id}
              onSelect={() => {
                controller.onSelectService(service);
                onRouteChange?.(`${KOLAM_LAYANAN_ROOT}/${service.id}`);
              }}
              service={service}
            />
          ))}
        </KolamCatalogListTableShell>
      ) : (
        <KolamEmptyState
          message={
            controller.activeTab === 'operasional'
              ? 'Grid kapasitas dan KPI operasional menyusul di batch berikutnya.'
              : 'Daftar langganan menyusul di batch berikutnya.'
          }
          title={
            controller.activeTab === 'operasional'
              ? 'Operasional Layanan'
              : 'Langganan'
          }
        />
      )}
    </View>
  );
}

function KolamLayananServiceRow({
  columns,
  onSelect,
  service,
}: {
  columns: KolamTableColumn[];
  onSelect: () => void;
  service: KolamLayananService;
}) {
  const brandLabel =
    service.brands.length === 0
      ? '—'
      : service.brands
          .slice(0, 2)
          .map(brand => brand.name)
          .join(', ') +
        (service.brands.length > 2 ? ` +${service.brands.length - 2}` : '');

  return (
    <KolamDataTableRowFrame>
      <KolamDataTableMainTrack>
        <Pressable
          accessibilityRole="button"
          onPress={onSelect}
          style={getKolamDataTableColumnStyle(columns[0])}
        >
          <Text numberOfLines={1} style={styles.primaryText}>
            {service.name}
          </Text>
        </Pressable>
        <View style={getKolamDataTableColumnStyle(columns[1])}>
          <Text numberOfLines={1} style={styles.monoText}>
            {service.sku}
          </Text>
        </View>
        <View style={getKolamDataTableColumnStyle(columns[2])}>
          <Text numberOfLines={1} style={styles.monoText}>
            {service.packageCode}
          </Text>
        </View>
        <View style={getKolamDataTableColumnStyle(columns[3])}>
          <Text numberOfLines={1} style={styles.cellText}>
            {brandLabel}
          </Text>
        </View>
        <View style={getKolamDataTableColumnStyle(columns[4])}>
          <Text numberOfLines={1} style={styles.cellText}>
            {getKolamLayananTaskTypeLabel(service.taskType)}
          </Text>
        </View>
        <View style={getKolamDataTableColumnStyle(columns[5])}>
          <Text numberOfLines={1} style={styles.priceText}>
            {formatKolamLayananUnitPrice(service.priceM3, 'm3')}
          </Text>
        </View>
        <View style={getKolamDataTableColumnStyle(columns[6])}>
          <Text numberOfLines={1} style={styles.priceText}>
            {formatKolamLayananUnitPrice(service.priceKm, 'km')}
          </Text>
        </View>
      </KolamDataTableMainTrack>
      <KolamDataTableActionsTrack>
        <KolamOverflowMenuButton
          actions={[
            {
              label: 'Lihat',
              onPress: onSelect,
            },
          ]}
        />
      </KolamDataTableActionsTrack>
    </KolamDataTableRowFrame>
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 8,
  },
  stack: {
    flex: 1,
    gap: 8,
  },
  errorBadge: {
    alignSelf: 'stretch',
    marginHorizontal: 4,
  },
  tabButton: {
    minHeight: 34,
    paddingHorizontal: 10,
  },
  placeholderTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 420,
  },
  primaryText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  monoText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  cellText: {
    color: V.colors.fg,
    fontSize: 13,
  },
  priceText: {
    color: V.colors.success,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },
  paginationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
});
