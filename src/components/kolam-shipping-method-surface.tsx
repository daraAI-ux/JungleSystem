import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  buildMethodName,
  findCourier,
  findService,
  type KolamBiteshipServiceOption,
} from '../domain/kolam-shipping-courier-catalog';
import {
  formatKolamShippingMethodCategoryLabel,
  formatKolamShippingMethodEstimatedDaysLabel,
  formatKolamShippingMethodPricingTypeLabel,
  formatKolamShippingMethodRateSourceLabel,
  isKolamShippingMethodBiteship,
  KOLAM_SHIPPING_METHOD_CATEGORY_OPTIONS,
  KOLAM_SHIPPING_METHOD_INSURANCE_TYPE_OPTIONS,
  KOLAM_SHIPPING_METHOD_PRICING_TYPE_OPTIONS,
  KOLAM_SHIPPING_METHOD_RATE_SOURCE_OPTIONS,
  type KolamShippingMethod,
} from '../domain/kolam-shipping-method';
import {
  fitKolamDataTableColumns,
  getKolamTableVisualContract,
  type KolamTableColumn,
} from '../domain/kolam-table';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { formatRupiah } from '../lib/money';
import { pickNativeImageFile } from '../services/native-file-picker';
import {
  useKolamShippingMethodController,
  type KolamShippingMethodController,
} from '../hooks/use-kolam-shipping-method-controller';
import { KolamButton } from './kolam-button';
import { KolamRefreshButton } from './kolam-refresh-button';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamContentFrame } from './kolam-content-frame';
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
import { KolamDescriptionList } from './kolam-description-list';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamHoverTooltip } from './kolam-hover-tooltip';
import { KolamInteractionFrame } from './kolam-interaction-frame';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamSearchField } from './kolam-search-field';
import { KolamSettingsWebFieldLabel } from './kolam-settings-web-field-label';
import { settingsWebFormStyles } from './kolam-settings-web-form-styles';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamSwitch } from './kolam-switch';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

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

function ShippingMethodFormSection({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <KolamContentFrame variant="nativeFormSection">
      <KolamCopyStack
        containerStyle={styles.sectionCopy}
        items={[
          { id: 'title', text: title, style: styles.sectionTitle },
          ...(description
            ? [
                {
                  id: 'description',
                  text: description,
                  style: styles.sectionDescription,
                },
              ]
            : []),
        ]}
      />
      <KolamContentFrame variant="nativeFormControls">{children}</KolamContentFrame>
    </KolamContentFrame>
  );
}

const METHOD_LIST_COLUMNS_BASE: KolamTableColumn[] = [
  { id: 'primary', label: 'Logo', align: 'left', width: 148 },
  { id: 'meta', label: 'Sumber', align: 'left', width: 100 },
  { id: 'children', label: 'Kurir / Layanan', align: 'left', width: 140 },
  { id: 'marketplace', label: 'Harga', align: 'left', width: 120 },
  { id: 'notes', label: 'Perkiraan hari', align: 'left', width: 100 },
  { id: 'status', label: 'Status', align: 'left', width: 120 },
  { id: 'products', label: 'Webstore', align: 'left', width: 120 },
  {
    id: 'actions',
    label: '',
    align: 'right',
    width: KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
  },
];

const CATALOG_LIST_COLUMNS_BASE: KolamTableColumn[] = [
  { id: 'primary', label: 'Kurir', align: 'left', width: 140 },
  { id: 'meta', label: 'Layanan', align: 'left', width: 160 },
  { id: 'children', label: 'Kategori', align: 'left', width: 100 },
  { id: 'status', label: 'Status', align: 'left', width: 120 },
  { id: 'notes', label: 'Disinkronkan', align: 'left', width: 160 },
];

function fitShippingMethodListColumns(containerWidth: number): KolamTableColumn[] {
  return fitKolamDataTableColumns(METHOD_LIST_COLUMNS_BASE, containerWidth, {
    actionsMinWidth: KOLAM_DATA_TABLE_ACTIONS_MIN_WIDTH,
    gap: KOLAM_DATA_TABLE_COLUMN_GAP,
    paddingX: getKolamTableVisualContract().body.cellPaddingX * 2,
    primaryMinWidth: 132,
    secondaryMinWidth: 72,
  });
}

function fitShippingCatalogListColumns(
  containerWidth: number,
): KolamTableColumn[] {
  return fitKolamDataTableColumns(CATALOG_LIST_COLUMNS_BASE, containerWidth, {
    actionsMinWidth: 0,
    gap: KOLAM_DATA_TABLE_COLUMN_GAP,
    paddingX: getKolamTableVisualContract().body.cellPaddingX * 2,
    primaryMinWidth: 100,
    secondaryMinWidth: 72,
  });
}

function descRow(id: string, label: string, value: string) {
  return { id, label, meta: '', tone: 'default' as const, value };
}

export function KolamShippingMethodSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamShippingMethodController(route);

  return (
    <KolamShippingMethodShell
      controller={controller}
      onRouteChange={onRouteChange}>
      {controller.mode === 'list' ? (
        <KolamShippingMethodList
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : controller.isEditable ? (
        <KolamShippingMethodForm
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : (
        <KolamShippingMethodDetail
          controller={controller}
          onRouteChange={onRouteChange}
        />
      )}
    </KolamShippingMethodShell>
  );
}

function KolamShippingMethodShell({
  children,
  controller,
  onRouteChange,
}: {
  children: React.ReactNode;
  controller: KolamShippingMethodController;
  onRouteChange?: (route: string) => void;
}) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);

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
      ? 'Metode pengiriman baru'
      : controller.mode === 'edit'
        ? `Ubah · ${controller.selectedMethod?.displayName || controller.form.displayName || 'Metode pengiriman'}`
        : controller.selectedMethod?.displayName || 'Detail metode pengiriman';

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
            <KolamRefreshButton
              accessibilityLabel="Refresh"
              disabled={controller.loading}
              onPress={() => {
                void controller.onRefresh();
              }}
            />
            <KolamButton
              label="Daftar"
              onPress={() => {
                controller.onBackToList();
                onRouteChange?.(controller.getListRoute());
              }}
            />
            {controller.mode === 'detail' ? (
              <>
                <KolamButton
                  intent="primary"
                  label="Ubah"
                  onPress={() => {
                    controller.onEdit();
                    if (controller.selectedMethod) {
                      onRouteChange?.(
                        controller.getEditRoute(controller.selectedMethod),
                      );
                    }
                  }}
                />
                <KolamButton
                  disabled={controller.saving || !controller.selectedMethod}
                  intent="danger"
                  label="Hapus"
                  onPress={() => setDeleteOpen(true)}
                />
              </>
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
      <KolamDeleteConfirmDialog
        itemLabel={
          controller.selectedMethod?.displayName ||
          controller.selectedMethod?.name ||
          ''
        }
        itemType="metode pengiriman"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          const method = controller.selectedMethod;
          if (!method) {
            return;
          }
          void controller.onDeleteMethod(method).then(ok => {
            if (ok) {
              setDeleteOpen(false);
              onRouteChange?.(controller.getListRoute());
            }
          });
        }}
        visible={deleteOpen}
      />
    </View>
  );
}

function KolamShippingMethodList({
  controller,
  onRouteChange,
}: {
  controller: KolamShippingMethodController;
  onRouteChange?: (route: string) => void;
}) {
  const [deleteCandidate, setDeleteCandidate] =
    React.useState<KolamShippingMethod | null>(null);

  return (
    <View style={styles.listRoot}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <KolamSearchField
              accessibilityLabel={
                controller.listTab === 'catalog'
                  ? 'Cari kurir atau layanan'
                  : 'Cari metode pengiriman'
              }
              onChangeText={
                controller.listTab === 'catalog'
                  ? controller.onCatalogSearchChange
                  : controller.onSearchChange
              }
              placeholder={
                controller.listTab === 'catalog'
                  ? 'Cari kurir atau layanan'
                  : 'Cari'
              }
              style={kolamTableToolbarStyles.searchInput}
              value={
                controller.listTab === 'catalog'
                  ? controller.catalogSearch
                  : controller.search
              }
            />
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamRefreshButton
              accessibilityLabel="Refresh"
              disabled={
                controller.listTab === 'catalog'
                  ? controller.catalogLoading
                  : controller.loading
              }
              onPress={() => {
                if (controller.listTab === 'catalog') {
                  void controller.onRefreshCatalog();
                } else {
                  void controller.onRefresh();
                }
              }}
            />
            {controller.listTab === 'methods' ? (
              <>
                <KolamButton
                  disabled={controller.initializingDefaults}
                  label="Inisialisasi Default"
                  onPress={() => {
                    void controller.onInitializeDefaults();
                  }}
                />
                <KolamButton
                  intent="primary"
                  label="Baru"
                  tone="positive"
                  onPress={() => {
                    controller.onCreateNew();
                    onRouteChange?.(controller.getCreateRoute());
                  }}
                />
              </>
            ) : (
              <KolamButton
                disabled={controller.catalogSyncing}
                label="Sync Katalog Biteship"
                onPress={() => {
                  void controller.onSyncCatalog();
                }}
              />
            )}
          </View>
        </View>
      </View>

      <View style={styles.tabRow}>
        <Pressable
          onPress={() => controller.onSetListTab('methods')}
          style={[
            styles.tabButton,
            controller.listTab === 'methods' && styles.tabButtonActive,
          ]}>
          <Text
            style={[
              styles.tabLabel,
              controller.listTab === 'methods' && styles.tabLabelActive,
            ]}>
            Metode Pengiriman
          </Text>
        </Pressable>
        <Pressable
          onPress={() => controller.onSetListTab('catalog')}
          style={[
            styles.tabButton,
            controller.listTab === 'catalog' && styles.tabButtonActive,
          ]}>
          <Text
            style={[
              styles.tabLabel,
              controller.listTab === 'catalog' && styles.tabLabelActive,
            ]}>
            Katalog Kurir
          </Text>
        </Pressable>
      </View>

      {controller.listTab === 'methods' ? (
        <KolamShippingMethodMethodsTable
          controller={controller}
          onDeleteCandidate={setDeleteCandidate}
          onRouteChange={onRouteChange}
        />
      ) : (
        <KolamShippingMethodCatalogTable controller={controller} />
      )}

      <KolamDeleteConfirmDialog
        itemLabel={deleteCandidate?.displayName || deleteCandidate?.name || ''}
        itemType="metode pengiriman"
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => {
          if (!deleteCandidate) {
            return;
          }
          void controller.onDeleteMethod(deleteCandidate).then(ok => {
            if (ok) {
              setDeleteCandidate(null);
              onRouteChange?.(controller.getListRoute());
            }
          });
        }}
        visible={Boolean(deleteCandidate)}
      />
    </View>
  );
}

function KolamShippingMethodMethodsTable({
  controller,
  onDeleteCandidate,
  onRouteChange,
}: {
  controller: KolamShippingMethodController;
  onDeleteCandidate: (method: KolamShippingMethod | null) => void;
  onRouteChange?: (route: string) => void;
}) {
  const [tableBodyWidth, setTableBodyWidth] = React.useState(0);
  const columns = React.useMemo(
    () => fitShippingMethodListColumns(tableBodyWidth),
    [tableBodyWidth],
  );

  return (
    <KolamCatalogListTableShell
      footer={
        <KolamTableFooterControls
          onPageSizeChange={controller.onSetPageSize}
          page={controller.page}
          pageSize={controller.pageSize}
          total={controller.total}>
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
      onBodyWidthChange={setTableBodyWidth}>
      <KolamDataTableHeader columns={columns} />
      {!controller.loading && controller.methods.length === 0 ? (
        <View style={styles.emptyWrap}>
          <KolamEmptyState
            message="Belum ada metode pengiriman. Gunakan Baru atau Inisialisasi Default."
            title="Kosong"
          />
        </View>
      ) : null}
      {controller.methods.map(method => (
        <ShippingMethodListRow
          key={method.id}
          columns={columns}
          method={method}
          onDeleteCandidate={onDeleteCandidate}
          onOpenDetail={() => {
            void controller.onSelectMethod(method);
            onRouteChange?.(controller.getDetailRoute(method));
          }}
          onOpenEdit={() => {
            void controller.onSelectMethod(method).then(() => {
              controller.onEdit();
              onRouteChange?.(controller.getEditRoute(method));
            });
          }}
          onToggleActive={() => {
            void controller.onToggleMethodActive(method, !method.isActive);
          }}
          onToggleWebstore={() => {
            void controller.onToggleWebstore(
              method,
              !method.isAvailableOnWebstore,
            );
          }}
        />
      ))}
    </KolamCatalogListTableShell>
  );
}

function ShippingMethodListRow({
  columns,
  method,
  onDeleteCandidate,
  onOpenDetail,
  onOpenEdit,
  onToggleActive,
  onToggleWebstore,
}: {
  columns: KolamTableColumn[];
  method: KolamShippingMethod;
  onDeleteCandidate: (method: KolamShippingMethod | null) => void;
  onOpenDetail: () => void;
  onOpenEdit: () => void;
  onToggleActive: () => void;
  onToggleWebstore: () => void;
}) {
  const [logoTooltipOpen, setLogoTooltipOpen] = React.useState(false);
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);
  const raiseRow = logoTooltipOpen || actionMenuOpen;
  const col = (id: KolamTableColumn['id']) =>
    columns.find(column => column.id === id) ??
    METHOD_LIST_COLUMNS_BASE.find(column => column.id === id)!;

  return (
    <KolamDataTableRowFrame
      style={raiseRow ? styles.activeActionRow : undefined}>
      <KolamDataTableMainTrack style={styles.mainTrackVisible}>
        <View
          style={[
            getKolamDataTableColumnStyle(col('primary')),
            styles.logoCell,
            styles.overflowVisible,
          ]}>
          <KolamHoverTooltip
            label={method.displayName || method.name || 'Metode pengiriman'}
            onOpenChange={setLogoTooltipOpen}
            placement="bottom">
            <Pressable onPress={onOpenDetail} style={styles.logoPressable}>
              {method.logoUri ? (
                <KolamRemoteImage
                  accessibilityLabel={`Logo ${method.displayName}`}
                  resizeMode="contain"
                  sourceUri={method.logoUri}
                  style={styles.listLogo}
                />
              ) : (
                <View style={styles.listLogoPlaceholder} />
              )}
            </Pressable>
          </KolamHoverTooltip>
        </View>
        <View style={getKolamDataTableColumnStyle(col('meta'))}>
          <View style={styles.stackGap}>
            <KolamStatusBadge
              intent={
                isKolamShippingMethodBiteship(method) ? 'success' : 'secondary'
              }
              label={formatKolamShippingMethodRateSourceLabel(method)}
            />
            <Text style={styles.metaText}>
              {formatKolamShippingMethodCategoryLabel(method.category)}
            </Text>
          </View>
        </View>
        <View style={getKolamDataTableColumnStyle(col('children'))}>
          <View style={styles.stackGap}>
            <Text numberOfLines={1} style={styles.primaryText}>
              {getMethodCourierLabel(method)}
            </Text>
            <Text numberOfLines={2} style={styles.metaText}>
              {getMethodServiceLabel(method)}
            </Text>
          </View>
        </View>
        <View style={getKolamDataTableColumnStyle(col('marketplace'))}>
          {isKolamShippingMethodBiteship(method) ? (
            <View style={styles.stackGap}>
              <KolamStatusBadge intent="success" label="Tarif langsung" />
              <Text style={styles.metaText}>Dihitung saat checkout</Text>
            </View>
          ) : (
            <View style={styles.stackGap}>
              <Text style={styles.primaryText}>
                {formatKolamShippingMethodPricingTypeLabel(method.pricingType)}
              </Text>
              <Text style={styles.metaText}>
                {formatRupiah(method.pricingPrice)}
              </Text>
            </View>
          )}
        </View>
        <View style={getKolamDataTableColumnStyle(col('notes'))}>
          <Text style={styles.primaryText}>
            {formatKolamShippingMethodEstimatedDaysLabel(method)}
          </Text>
        </View>
        <View style={getKolamDataTableColumnStyle(col('status'))}>
          <View style={styles.switchBadgeRow}>
            <KolamSwitch active={method.isActive} onPress={onToggleActive} />
            <KolamStatusBadge
              intent={method.isActive ? 'success' : 'danger'}
              label={method.isActive ? 'Aktif' : 'Nonaktif'}
            />
          </View>
        </View>
        <View style={getKolamDataTableColumnStyle(col('products'))}>
          <View style={styles.switchBadgeRow}>
            <KolamSwitch
              active={method.isAvailableOnWebstore}
              onPress={onToggleWebstore}
            />
            <KolamStatusBadge
              intent={method.isAvailableOnWebstore ? 'success' : 'danger'}
              label={method.isAvailableOnWebstore ? 'Ya' : 'Tidak'}
            />
          </View>
        </View>
      </KolamDataTableMainTrack>
      <KolamDataTableActionsTrack>
        <KolamOverflowMenuButton
          accessibilityLabel={`Menu ${method.displayName}`}
          actions={[
            { label: 'Lihat', onPress: onOpenDetail },
            { label: 'Rubah', onPress: onOpenEdit },
            {
              label: 'Hapus',
              tone: 'danger',
              onPress: () => onDeleteCandidate(method),
            },
          ]}
          onOpenChange={setActionMenuOpen}
        />
      </KolamDataTableActionsTrack>
    </KolamDataTableRowFrame>
  );
}

function KolamShippingMethodCatalogTable({
  controller,
}: {
  controller: KolamShippingMethodController;
}) {
  const [tableBodyWidth, setTableBodyWidth] = React.useState(0);
  const stats = controller.catalogStats;
  const columns = React.useMemo(
    () => fitShippingCatalogListColumns(tableBodyWidth),
    [tableBodyWidth],
  );
  const col = (id: KolamTableColumn['id']) =>
    columns.find(column => column.id === id) ??
    CATALOG_LIST_COLUMNS_BASE.find(column => column.id === id)!;

  return (
    <View style={styles.catalogRoot}>
      <View style={styles.statRow}>
        <KolamStatusBadge intent="secondary" label={`Kurir ${stats.couriers}`} />
        <KolamStatusBadge intent="secondary" label={`Layanan ${stats.services}`} />
        <KolamStatusBadge intent="success" label={`Aktif ${stats.active}`} />
        <KolamStatusBadge intent="danger" label={`Nonaktif ${stats.inactive}`} />
      </View>

      <KolamCatalogListTableShell
        footer={
          <KolamTableFooterControls
            onPageSizeChange={() => {}}
            page={1}
            pageSize={controller.catalogItems.length || 1}
            total={controller.catalogItems.length}
          />
        }
        onBodyWidthChange={setTableBodyWidth}>
        <KolamDataTableHeader columns={columns} />
        {!controller.catalogLoading && controller.catalogItems.length === 0 ? (
          <View style={styles.emptyWrap}>
            <KolamEmptyState
              message="Belum ada data katalog kurir. Jalankan Sync Katalog Biteship."
              title="Kosong"
            />
          </View>
        ) : null}
        {controller.catalogItems.map(item => (
            <KolamDataTableRowFrame key={item.id}>
              <KolamDataTableMainTrack>
                <View style={getKolamDataTableColumnStyle(col('primary'))}>
                  <Text style={styles.primaryText}>{item.courierName}</Text>
                  <Text style={styles.metaText}>{item.courierCode}</Text>
                </View>
                <View style={getKolamDataTableColumnStyle(col('meta'))}>
                  <Text style={styles.primaryText}>{item.serviceName}</Text>
                  <Text style={styles.metaText}>{item.serviceCode}</Text>
                </View>
                <View style={getKolamDataTableColumnStyle(col('children'))}>
                  <Text style={styles.primaryText}>
                    {formatKolamShippingMethodCategoryLabel(item.category)}
                  </Text>
                </View>
                <View style={getKolamDataTableColumnStyle(col('status'))}>
                  <View style={styles.switchBadgeRow}>
                    <KolamSwitch
                      active={item.isActive}
                      onPress={() => {
                        void controller.onToggleCatalogActive(
                          item,
                          !item.isActive,
                        );
                      }}
                    />
                    <KolamStatusBadge
                      intent={item.isActive ? 'success' : 'danger'}
                      label={item.isActive ? 'Aktif' : 'Nonaktif'}
                    />
                  </View>
                </View>
                <View style={getKolamDataTableColumnStyle(col('notes'))}>
                  <Text style={styles.metaText}>
                    {formatCatalogSyncedAt(item.syncedAt)}
                  </Text>
                </View>
              </KolamDataTableMainTrack>
            </KolamDataTableRowFrame>
          ))}
      </KolamCatalogListTableShell>
    </View>
  );
}

function KolamShippingMethodDetail({
  controller,
}: {
  controller: KolamShippingMethodController;
  onRouteChange?: (route: string) => void;
}) {
  const method = controller.selectedMethod;

  if (!method) {
    return (
      <KolamEmptyState
        message="Metode pengiriman tidak ditemukan."
        title="Tidak ada data"
      />
    );
  }

  const biteship = isKolamShippingMethodBiteship(method);

  return (
    <ScrollView contentContainerStyle={styles.detailContent}>
      <View style={styles.detailHero}>
        {method.logoUri ? (
          <KolamRemoteImage
            accessibilityLabel={`Logo ${method.displayName}`}
            resizeMode="contain"
            sourceUri={method.logoUri}
            style={styles.detailLogo}
          />
        ) : (
          <View style={styles.detailLogoPlaceholder}>
            <Text style={styles.metaText}>Tanpa logo</Text>
          </View>
        )}
        <View style={styles.detailHeroText}>
          <Text style={styles.detailTitle}>{method.displayName}</Text>
          <View style={styles.badgeRow}>
            <KolamStatusBadge
              intent={biteship ? 'success' : 'secondary'}
              label={formatKolamShippingMethodRateSourceLabel(method)}
            />
            <KolamStatusBadge
              intent={method.isActive ? 'success' : 'danger'}
              label={method.isActive ? 'Aktif' : 'Nonaktif'}
            />
            <KolamStatusBadge
              intent={method.isAvailableOnWebstore ? 'success' : 'danger'}
              label={method.isAvailableOnWebstore ? 'Webstore' : 'Bukan webstore'}
            />
          </View>
          {method.description ? (
            <Text style={styles.metaText}>{method.description}</Text>
          ) : null}
        </View>
      </View>

      <ShippingMethodFormSection title="Informasi dasar">
        <KolamDescriptionList
          accessibilityLabel="Informasi dasar metode pengiriman"
          rows={[
            descRow('name', 'Nama internal', method.name || '—'),
            descRow('display', 'Nama tampilan', method.displayName || '—'),
            descRow(
              'category',
              'Kategori',
              formatKolamShippingMethodCategoryLabel(method.category),
            ),
            ...(biteship
              ? [
                  descRow(
                    'courier',
                    'Kurir Biteship',
                    method.biteshipCourierName ||
                      method.biteshipCourierCode ||
                      '—',
                  ),
                  descRow(
                    'services',
                    'Layanan',
                    getMethodServiceLabel(method),
                  ),
                ]
              : []),
          ]}
        />
      </ShippingMethodFormSection>

      <ShippingMethodFormSection title="Konfigurasi harga">
        <KolamDescriptionList
          accessibilityLabel="Konfigurasi harga"
          rows={
            biteship
              ? [
                  descRow('rate', 'Sumber tarif', 'Tarif langsung Biteship'),
                  descRow('note', 'Catatan', 'Dihitung saat checkout'),
                ]
              : [
                  descRow(
                    'type',
                    'Tipe harga',
                    formatKolamShippingMethodPricingTypeLabel(method.pricingType),
                  ),
                  descRow('price', 'Harga', formatRupiah(method.pricingPrice)),
                ]
          }
        />
      </ShippingMethodFormSection>

      <ShippingMethodFormSection title="Asuransi">
        <KolamDescriptionList
          accessibilityLabel="Asuransi"
          rows={
            method.insuranceEnabled
              ? [
                  descRow('enabled', 'Status', 'Aktif'),
                  descRow(
                    'type',
                    'Tipe',
                    method.insuranceType === 'percentage'
                      ? 'Persentase'
                      : 'Harga tetap',
                  ),
                  descRow(
                    'price',
                    'Nilai',
                    method.insuranceType === 'percentage'
                      ? `${method.insurancePrice}%`
                      : formatRupiah(method.insurancePrice),
                  ),
                ]
              : [descRow('enabled', 'Status', 'Nonaktif')]
          }
        />
      </ShippingMethodFormSection>

      <ShippingMethodFormSection title="Kondisi khusus">
        <KolamDescriptionList
          accessibilityLabel="Kondisi khusus"
          rows={[
            descRow(
              'regions',
              'Wilayah terbatas',
              method.restrictedRegions.length
                ? method.restrictedRegions.join(', ')
                : '—',
            ),
            descRow(
              'min-order',
              'Minimum order',
              method.minimumOrderAmount > 0
                ? formatRupiah(method.minimumOrderAmount)
                : '—',
            ),
          ]}
        />
      </ShippingMethodFormSection>

      <ShippingMethodFormSection title="Perkiraan waktu">
        <KolamDescriptionList
          accessibilityLabel="Perkiraan waktu"
          rows={[
            descRow(
              'eta',
              'Estimasi',
              formatKolamShippingMethodEstimatedDaysLabel(method),
            ),
          ]}
        />
      </ShippingMethodFormSection>

      <ShippingMethodFormSection title="Metadata">
        <KolamDescriptionList
          accessibilityLabel="Metadata metode pengiriman"
          rows={[
            descRow('created', 'Dibuat', method.createdAt || '—'),
            descRow('updated', 'Diperbarui', method.updatedAt || '—'),
          ]}
        />
      </ShippingMethodFormSection>
    </ScrollView>
  );
}

function KolamShippingMethodForm({
  controller,
  onRouteChange,
}: {
  controller: KolamShippingMethodController;
  onRouteChange?: (route: string) => void;
}) {
  const { form, biteshipCouriers } = controller;
  const previewUri =
    form.pendingLogoUri ||
    (form.removeLogo ? null : controller.selectedMethod?.logoUri) ||
    null;
  const selectedCourier = findCourier(form.biteshipCourierCode, biteshipCouriers);
  const isAllServicesSelected =
    selectedCourier?.services.length &&
    selectedCourier.services.every(service =>
      form.biteshipServiceCodes.includes(service.code),
    );

  const syncBiteshipFields = (
    courierCode: string,
    serviceCodes: string[],
  ) => {
    const courier = findCourier(courierCode, biteshipCouriers);
    const services = serviceCodes
      .map(code => findService(courierCode, code, biteshipCouriers))
      .filter((service): service is KolamBiteshipServiceOption => Boolean(service));
    const allSelected =
      courier?.services.length &&
      courier.services.every(service => serviceCodes.includes(service.code));
    const serviceLabel = allSelected
      ? ''
      : services.map(service => service.name).join(', ');
    const nextName = buildMethodName(courier?.name, serviceLabel);
    const nextServiceNames = services.map(service => service.name);

    controller.onChangeForm({
      biteshipCourierCode: courierCode,
      biteshipCourierName: courier?.name || '',
      biteshipServiceCodes: serviceCodes,
      biteshipServiceNames: nextServiceNames,
      biteshipServiceCode: serviceCodes.length === 1 ? serviceCodes[0] : '',
      biteshipServiceName: nextServiceNames.length === 1 ? nextServiceNames[0] : '',
      name: nextName || courier?.name || '',
      displayName: nextName || courier?.name || '',
      category: courier?.category ?? form.category,
      pricingType: 'fixed',
      pricingPrice: '0',
      description:
        courier && allSelected
          ? `Semua layanan ${courier.name} via Biteship`
          : courier && services.length > 0
            ? `Layanan ${courier.name} via Biteship: ${serviceLabel}`
            : form.description,
    });
  };

  const toggleService = (serviceCode: string, selected: boolean) => {
    const nextCodes = selected
      ? Array.from(new Set([...form.biteshipServiceCodes, serviceCode]))
      : form.biteshipServiceCodes.filter(code => code !== serviceCode);
    syncBiteshipFields(form.biteshipCourierCode, nextCodes);
  };

  const handlePickLogo = async () => {
    try {
      const picked = await pickNativeImageFile();
      if (picked.cancelled) {
        return;
      }
      const localUri = picked.uri ?? picked.path ?? '';
      if (!localUri) {
        return;
      }
      controller.onChangeForm({
        pendingLogoUri: localUri,
        removeLogo: false,
      });
    } catch {
      // picker errors are rare
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.detailContent}>
      <ShippingMethodFormSection title="Informasi dasar">
        <KolamDropdownSelect
          label="Sumber tarif"
          onChange={value =>
            controller.onChangeForm({
              rateSource: value as typeof form.rateSource,
            })
          }
          options={KOLAM_SHIPPING_METHOD_RATE_SOURCE_OPTIONS.map(option => ({
            label: option.label,
            value: option.value,
          }))}
          value={form.rateSource}
        />

        {form.rateSource === 'biteship' ? (
          <>
            <KolamDropdownSelect
              label="Kurir Biteship"
              onChange={value => {
                syncBiteshipFields(String(value), []);
              }}
              options={[
                { label: '— Pilih kurir —', value: '' },
                ...biteshipCouriers.map(courier => ({
                  label: courier.name,
                  value: courier.code,
                })),
              ]}
              value={form.biteshipCourierCode}
            />

            <View style={styles.servicePanel}>
              <View style={styles.servicePanelHeader}>
                <View style={styles.servicePanelCopy}>
                  <Text style={styles.primaryText}>Layanan</Text>
                  <KolamStatusBadge
                    intent={isAllServicesSelected ? 'success' : 'info'}
                    label={
                      isAllServicesSelected
                        ? 'Semua dipilih'
                        : `${form.biteshipServiceCodes.length} dipilih`
                    }
                  />
                </View>
                <KolamButton
                  disabled={!form.biteshipCourierCode}
                  label="Gunakan semua"
                  onPress={() => {
                    const nextCodes =
                      selectedCourier?.services.map(service => service.code) ?? [];
                    syncBiteshipFields(form.biteshipCourierCode, nextCodes);
                  }}
                />
              </View>

              <View style={styles.serviceGrid}>
                {selectedCourier?.services.map(service => {
                  const isSelected = form.biteshipServiceCodes.includes(
                    service.code,
                  );
                  return (
                    <Pressable
                      key={service.code}
                      onPress={() => toggleService(service.code, !isSelected)}
                      style={[
                        styles.serviceChip,
                        isSelected && styles.serviceChipSelected,
                      ]}>
                      <Text style={styles.primaryText}>{service.name}</Text>
                      {service.description ? (
                        <Text style={styles.metaText}>{service.description}</Text>
                      ) : null}
                    </Pressable>
                  );
                })}
                {!selectedCourier ? (
                  <Text style={styles.metaText}>Pilih kurir terlebih dahulu.</Text>
                ) : null}
              </View>
            </View>
          </>
        ) : (
          <>
            <FieldShell label="Nama" required>
              <KolamFormTextField
                onChangeText={value => controller.onChangeForm({ name: value })}
                placeholder="Nama metode pengiriman"
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={form.name}
              />
            </FieldShell>
            <FieldShell label="Nama tampilan">
              <KolamFormTextField
                onChangeText={value =>
                  controller.onChangeForm({ displayName: value })
                }
                placeholder="Nama yang ditampilkan"
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={form.displayName}
              />
            </FieldShell>
            <FieldShell label="Deskripsi">
              <KolamFormTextField
                multiline
                onChangeText={value =>
                  controller.onChangeForm({ description: value })
                }
                placeholder="Opsional"
                style={[
                  settingsWebFormStyles.settingsWebFormFieldValue,
                  settingsWebFormStyles.settingsWebFormFieldValueTextarea,
                ]}
                value={form.description}
              />
            </FieldShell>
            <KolamDropdownSelect
              label="Kategori"
              onChange={value =>
                controller.onChangeForm({
                  category: value as typeof form.category,
                })
              }
              options={KOLAM_SHIPPING_METHOD_CATEGORY_OPTIONS.map(option => ({
                label: option.label,
                value: option.value,
              }))}
              value={form.category}
            />
          </>
        )}
      </ShippingMethodFormSection>

      {form.rateSource === 'manual' ? (
        <ShippingMethodFormSection title="Konfigurasi harga">
          <KolamDropdownSelect
            label="Tipe harga"
            onChange={value =>
              controller.onChangeForm({
                pricingType: value as typeof form.pricingType,
              })
            }
            options={KOLAM_SHIPPING_METHOD_PRICING_TYPE_OPTIONS.map(option => ({
              label: option.label,
              value: option.value,
            }))}
            value={form.pricingType}
          />
          <FieldShell label="Harga" required>
            <KolamFormTextField
              keyboardType="numeric"
              onChangeText={value =>
                controller.onChangeForm({ pricingPrice: value })
              }
              placeholder="0"
              style={settingsWebFormStyles.settingsWebFormFieldValue}
              value={form.pricingPrice}
            />
          </FieldShell>
        </ShippingMethodFormSection>
      ) : null}

      <ShippingMethodFormSection title="Asuransi">
        <View style={styles.switchRow}>
          <Text style={styles.primaryText}>Aktifkan asuransi</Text>
          <KolamSwitch
            active={form.insuranceEnabled}
            onPress={() =>
              controller.onChangeForm({
                insuranceEnabled: !form.insuranceEnabled,
              })
            }
          />
        </View>
        {form.insuranceEnabled ? (
          <>
            <KolamDropdownSelect
              label="Tipe asuransi"
              onChange={value =>
                controller.onChangeForm({
                  insuranceType: value as typeof form.insuranceType,
                })
              }
              options={KOLAM_SHIPPING_METHOD_INSURANCE_TYPE_OPTIONS.map(
                option => ({
                  label: option.label,
                  value: option.value,
                }),
              )}
              value={form.insuranceType}
            />
            <FieldShell label="Nilai asuransi">
              <KolamFormTextField
                keyboardType="numeric"
                onChangeText={value =>
                  controller.onChangeForm({ insurancePrice: value })
                }
                placeholder="0"
                style={settingsWebFormStyles.settingsWebFormFieldValue}
                value={form.insurancePrice}
              />
            </FieldShell>
          </>
        ) : null}
      </ShippingMethodFormSection>

      <ShippingMethodFormSection title="Kondisi khusus">
        <FieldShell label="Wilayah terbatas">
          <KolamFormTextField
            multiline
            onChangeText={value =>
              controller.onChangeForm({ restrictedRegionsText: value })
            }
            placeholder="Pisahkan dengan koma"
            style={[
              settingsWebFormStyles.settingsWebFormFieldValue,
              settingsWebFormStyles.settingsWebFormFieldValueTextarea,
            ]}
            value={form.restrictedRegionsText}
          />
        </FieldShell>
        <FieldShell label="Minimum order">
          <KolamFormTextField
            keyboardType="numeric"
            onChangeText={value =>
              controller.onChangeForm({ minimumOrderAmount: value })
            }
            placeholder="0"
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={form.minimumOrderAmount}
          />
        </FieldShell>
      </ShippingMethodFormSection>

      <ShippingMethodFormSection title="Perkiraan waktu">
        <FieldShell label="Hari minimum">
          <KolamFormTextField
            keyboardType="numeric"
            onChangeText={value =>
              controller.onChangeForm({ estimatedDaysMin: value })
            }
            placeholder="0"
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={form.estimatedDaysMin}
          />
        </FieldShell>
        <FieldShell label="Hari maksimum">
          <KolamFormTextField
            keyboardType="numeric"
            onChangeText={value =>
              controller.onChangeForm({ estimatedDaysMax: value })
            }
            placeholder="0"
            style={settingsWebFormStyles.settingsWebFormFieldValue}
            value={form.estimatedDaysMax}
          />
        </FieldShell>
      </ShippingMethodFormSection>

      <ShippingMethodFormSection title="Status">
        <View style={styles.switchRow}>
          <Text style={styles.primaryText}>Aktif</Text>
          <KolamSwitch
            active={form.isActive}
            onPress={() =>
              controller.onChangeForm({ isActive: !form.isActive })
            }
          />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.primaryText}>Tampil di webstore</Text>
          <KolamSwitch
            active={form.isAvailableOnWebstore}
            onPress={() =>
              controller.onChangeForm({
                isAvailableOnWebstore: !form.isAvailableOnWebstore,
              })
            }
          />
        </View>
      </ShippingMethodFormSection>

      <ShippingMethodFormSection title="Logo">
        <View style={styles.logoRow}>
          {previewUri ? (
            <KolamRemoteImage
              accessibilityLabel="Pratinjau logo"
              resizeMode="contain"
              sourceUri={previewUri}
              style={styles.formLogo}
            />
          ) : (
            <View style={styles.formLogoPlaceholder}>
              <Text style={styles.metaText}>Tanpa logo</Text>
            </View>
          )}
          <View style={styles.logoActions}>
            <KolamButton label="Pilih logo" onPress={() => void handlePickLogo()} />
            {previewUri || controller.selectedMethod?.iconPath ? (
              <KolamButton
                intent="danger"
                label="Hapus logo"
                onPress={() =>
                  controller.onChangeForm({
                    pendingLogoUri: null,
                    removeLogo: true,
                  })
                }
              />
            ) : null}
          </View>
        </View>
      </ShippingMethodFormSection>

      <View style={styles.detailActions}>
        <KolamButton
          label="Batal"
          onPress={() => {
            if (controller.mode === 'edit' && controller.selectedMethod) {
              controller.onCancelForm();
              onRouteChange?.(controller.getDetailRoute(controller.selectedMethod));
            } else {
              controller.onBackToList();
              onRouteChange?.(controller.getListRoute());
            }
          }}
        />
        <KolamInteractionFrame>
          <KolamButton
            disabled={controller.saving}
            intent="primary"
            label={controller.saving ? 'Menyimpan…' : 'Simpan'}
            onPress={() => {
              void controller.onSave().then(id => {
                if (id) {
                  onRouteChange?.(controller.getDetailRoute({ id }));
                }
              });
            }}
          />
        </KolamInteractionFrame>
      </View>
    </ScrollView>
  );
}

function getMethodCourierLabel(method: KolamShippingMethod) {
  if (isKolamShippingMethodBiteship(method)) {
    return (
      method.biteshipCourierName ||
      method.biteshipCourierCode?.toUpperCase() ||
      'Biteship'
    );
  }
  return method.displayName || method.name;
}

function getMethodServiceLabel(method: KolamShippingMethod) {
  if (isKolamShippingMethodBiteship(method)) {
    if (method.biteshipServiceNames.length) {
      return method.biteshipServiceNames.join(', ');
    }
    if (method.biteshipServiceCodes.length) {
      return method.biteshipServiceCodes.map(code => code.toUpperCase()).join(', ');
    }
    return (
      method.biteshipServiceName ||
      method.biteshipServiceCode?.toUpperCase() ||
      'Semua layanan'
    );
  }
  return method.category === 'instant'
    ? 'Pengiriman instan'
    : 'Pengiriman reguler';
}

function formatCatalogSyncedAt(value?: string) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('id-ID');
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 8,
  },
  listRoot: {
    flex: 1,
    gap: 8,
  },
  catalogRoot: {
    flex: 1,
    gap: 8,
  },
  errorBadge: {
    marginHorizontal: 8,
  },
  detailToolbarContext: {
    color: V.colors.fg,
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 8,
  },
  tabButton: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabButtonActive: {
    borderBottomColor: V.colors.primary,
  },
  tabLabel: {
    color: V.colors.mutedFg,
    fontSize: 13,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: V.colors.primary,
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 8,
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
  emptyWrap: {
    paddingHorizontal: 12,
    paddingVertical: 24,
  },
  activeActionRow: {
    elevation: 1200,
    zIndex: 120000,
  },
  mainTrackVisible: {
    overflow: 'visible',
  },
  logoCell: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 2,
  },
  overflowVisible: {
    overflow: 'visible',
  },
  logoPressable: {
    alignSelf: 'flex-start',
  },
  listLogo: {
    borderColor: V.colors.border,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    flexShrink: 0,
    height: 40,
    overflow: 'hidden',
    width: 132,
  },
  listLogoPlaceholder: {
    backgroundColor: V.colors.muted,
    borderRadius: 6,
    flexShrink: 0,
    height: 40,
    width: 132,
  },
  primaryText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  metaText: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  stackGap: {
    gap: 4,
  },
  switchBadgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  detailContent: {
    gap: 16,
    paddingBottom: 32,
    paddingHorizontal: 8,
  },
  detailHero: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 8,
  },
  detailLogo: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flexShrink: 0,
    height: 84,
    overflow: 'hidden',
    width: 158,
  },
  detailLogoPlaceholder: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flexShrink: 0,
    height: 84,
    justifyContent: 'center',
    width: 158,
  },
  detailHeroText: {
    flex: 1,
    gap: 6,
  },
  detailTitle: {
    color: V.colors.fg,
    fontSize: 18,
    fontWeight: '700',
  },
  badgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  sectionCopy: {
    gap: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionDescription: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  servicePanel: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
    padding: 12,
  },
  servicePanelHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  servicePanelCopy: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceChip: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
    minWidth: 140,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  serviceChipSelected: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.primary,
  },
  logoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  formLogo: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flexShrink: 0,
    height: 84,
    overflow: 'hidden',
    width: 158,
  },
  formLogoPlaceholder: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    flexShrink: 0,
    height: 84,
    justifyContent: 'center',
    width: 158,
  },
  logoActions: {
    gap: 8,
  },
});
