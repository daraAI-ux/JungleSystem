import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  KOLAM_PRODUCTION_ROOT,
  canCancelKolamProduction,
  canEditKolamProduction,
  canRecalculateKolamProduction,
  getAllowedNextProductionStatuses,
  getKolamProductionHistoryStatusLabel,
  getKolamProductionStatusLabel,
  getKolamProductionTargetHref,
  getKolamProductionTargetLabel,
  getKolamProductionTargetTypeLabel,
  getKolamProductionVariantLabel,
  hasKolamProductionPermission,
  isKolamProductionListRoute,
  type KolamProduction,
  type KolamProductionComponentUsed,
  type KolamProductionLinkedPO,
  type KolamProductionStatus,
  type KolamProductForProduction,
  type KolamSubmitCheckBreakdownEntry,
} from '../domain/kolam-production';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import { formatRupiah } from '../lib/money';
import { getKolamFileUrl } from '../lib/file-url';
import {
  useKolamProductionController,
  type KolamProductionController,
} from '../hooks/use-kolam-production-controller';
import { KolamButton } from './kolam-button';
import {KolamDaftarButton} from './kolam-daftar-button';
import {KolamEditButton} from './kolam-edit-button';
import { KolamRefreshButton } from './kolam-refresh-button';
import { KolamConfirmDialog } from './kolam-confirm-dialog';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamDateField } from './kolam-date-field';
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import { KolamDetailScrollSurface } from './kolam-detail-scroll-surface';
import { KolamDescriptionList } from './kolam-description-list';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamHoverTooltip } from './kolam-hover-tooltip';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import { KolamPdfDownloadButton } from './kolam-pdf-download-button';
import { KolamProfileAvatarContent } from './kolam-profile-avatar-content';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamSearchField } from './kolam-search-field';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamSwitch } from './kolam-switch';
import { KolamTableFilterTrigger } from './kolam-table-filter-trigger';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

const PRODUCTION_STATUS_OPTIONS: KolamProductionStatus[] = [
  'waiting_for_po',
  'pending',
  'in_progress',
  // FE list filter intentionally omits on_check — keep parity.
  'completed',
  'cancelled',
];

const WAITING_PO_POLL_MS = 20_000;

type ProductionStatusFilterPanel = 'status' | null;
type ProductionStatusIntent = 'primary' | 'success' | 'warning' | 'danger' | 'muted';

function productionStatusIntent(status?: string): ProductionStatusIntent {
  if (status === 'completed') return 'success';
  if (status === 'cancelled') return 'danger';
  if (status === 'on_check') return 'warning';
  if (status === 'waiting_for_po') return 'primary';
  if (status === 'pending' || status === 'in_progress') return 'warning';
  return 'muted';
}

export function KolamProductionSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamProductionController(route);

  return (
    <View style={styles.surface}>
      {controller.error ? (
        <KolamStatusBadge intent="danger" label={controller.error} numberOfLines={3} style={styles.errorBadge} />
      ) : null}
      {controller.statusMessage ? (
        <KolamStatusBadge intent="success" label={controller.statusMessage} numberOfLines={2} style={styles.errorBadge} />
      ) : null}
      {controller.mode === 'list' && isKolamProductionListRoute(route) ? (
        <KolamProductionList controller={controller} onRouteChange={onRouteChange} />
      ) : controller.mode === 'create' || controller.mode === 'edit' ? (
        <KolamProductionForm controller={controller} onRouteChange={onRouteChange} />
      ) : (
        <KolamProductionDetail controller={controller} onRouteChange={onRouteChange} />
      )}
    </View>
  );
}

function KolamProductionList({
  controller,
  onRouteChange,
}: {
  controller: KolamProductionController;
  onRouteChange?: (route: string) => void;
}) {
  const { authUser } = useKolamAuthContext();
  const canCreate = hasKolamProductionPermission(authUser?.permissions, 'create', authUser?.roleKey);
  const canDelete = hasKolamProductionPermission(authUser?.permissions, 'delete', authUser?.roleKey);
  const [searchInput, setSearchInput] = React.useState(controller.filters.search);
  const [activeFilterPanel, setActiveFilterPanel] =
    React.useState<ProductionStatusFilterPanel>(null);
  const [deleteCandidate, setDeleteCandidate] = React.useState<KolamProduction | null>(null);
  const [restoreCandidate, setRestoreCandidate] = React.useState<KolamProduction | null>(null);

  React.useEffect(() => {
    setSearchInput(controller.filters.search);
  }, [controller.filters.search]);

  React.useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput !== controller.filters.search) {
        controller.onSearchChange(searchInput);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [controller, searchInput]);

  const pageCount = Math.max(1, controller.pagination.totalPages);
  const safePage = Math.min(Math.max(controller.pagination.page, 1), pageCount);
  const statusFilterLabel = controller.filters.status
    ? getKolamProductionStatusLabel(controller.filters.status)
    : 'Status';

  const listColumns = React.useMemo(
    () =>
      buildProductionListColumns({
        onSelect: production => {
          void controller.onSelectProduction(production);
          onRouteChange?.(`${KOLAM_PRODUCTION_ROOT}/${production.id}`);
        },
      }),
    [controller, onRouteChange],
  );

  return (
    <View style={styles.listRoot}>
      <View style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              <KolamSearchField
                containerStyle={kolamTableToolbarStyles.searchInput}
                onChangeText={setSearchInput}
                placeholder="Cari batch / target / deskripsi"
                value={searchInput}
              />
              <KolamTableFilterTrigger
                active={activeFilterPanel === 'status' || Boolean(controller.filters.status)}
                label={statusFilterLabel}
                onPress={() =>
                  setActiveFilterPanel(current => (current === 'status' ? null : 'status'))
                }
                open={activeFilterPanel === 'status'}
                variant="quiet"
              />
              <KolamDateField
                accessibilityLabel="Tanggal mulai"
                label="Dari"
                onChange={value => controller.onChangeFilters({ startDate: value })}
                placeholder="Dari"
                showLabelInTrigger={false}
                style={styles.dateField}
                value={controller.filters.startDate}
              />
              <KolamDateField
                accessibilityLabel="Tanggal sampai"
                label="Sampai"
                onChange={value => controller.onChangeFilters({ endDate: value })}
                placeholder="Sampai"
                showLabelInTrigger={false}
                style={styles.dateField}
                value={controller.filters.endDate}
              />
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              <KolamButton
                disabled={controller.exporting || controller.loading}
                label={controller.exporting ? 'Mengekspor…' : 'Ekspor'}
                onPress={() => void controller.onExportList()}
                style={styles.toolbarButton}
              />
              {canCreate ? (
                <KolamButton
                  intent="primary"
                  label="Baru"
                  tone="positive"
                  onPress={() => {
                    controller.onCreateNew();
                    onRouteChange?.(`${KOLAM_PRODUCTION_ROOT}/create`);
                  }}
                  style={styles.toolbarButton}
                />
              ) : null}
            </View>
          </View>
        </View>

        {activeFilterPanel === 'status' ? (
          <View style={[styles.filterOverlayPanel, styles.filterPanelStatus]}>
            <ScrollView
              contentContainerStyle={styles.filterPanelContent}
              keyboardShouldPersistTaps="handled"
              style={styles.filterPanelScroll}
            >
              <KolamButton
                intent={!controller.filters.status ? 'primary' : 'plain'}
                label="Semua status"
                onPress={() => {
                  controller.onChangeFilters({ status: '' });
                  setActiveFilterPanel(null);
                }}
                style={styles.filterPanelOption}
              />
              {PRODUCTION_STATUS_OPTIONS.map(status => (
                <KolamButton
                  intent={controller.filters.status === status ? 'primary' : 'plain'}
                  key={status}
                  label={getKolamProductionStatusLabel(status)}
                  onPress={() => {
                    controller.onChangeFilters({
                      status: controller.filters.status === status ? '' : status,
                    });
                    setActiveFilterPanel(null);
                  }}
                  style={styles.filterPanelOption}
                />
              ))}
            </ScrollView>
            <View style={styles.filterPanelFooter}>
              <KolamButton label="Tutup" onPress={() => setActiveFilterPanel(null)} />
            </View>
          </View>
        ) : null}
      </View>

      <KolamListTableComposition
        actionsColumn
        columns={listColumns}
        emptyTitle={controller.loading ? 'Memuat produksi...' : 'Belum ada produksi'}
        getRowKey={item => item.id}
        loading={controller.loading}
        pagination={{
          onPageChange: controller.onPageChange,
          page: safePage,
          pageSize: controller.pagination.limit,
          total: controller.pagination.total,
        }}
        renderActions={item => (
          <KolamProductionActionsMenu
            canDelete={canDelete}
            onDelete={() => setDeleteCandidate(item)}
            onRestore={() => setRestoreCandidate(item)}
            onSelect={() => {
              void controller.onSelectProduction(item);
              onRouteChange?.(`${KOLAM_PRODUCTION_ROOT}/${item.id}`);
            }}
            production={item}
          />
        )}
        rows={controller.productions}
      />

      <KolamDeleteConfirmDialog
        itemLabel={deleteCandidate?.batchId}
        itemType="produksi"
        visible={Boolean(deleteCandidate)}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => {
          const candidate = deleteCandidate;
          setDeleteCandidate(null);
          if (!candidate) return;
          void (async () => {
            await controller.onSelectProduction(candidate);
            await controller.onDeleteProduction();
            onRouteChange?.(KOLAM_PRODUCTION_ROOT);
          })();
        }}
      />

      <KolamConfirmDialog
        confirmLabel="Pulihkan"
        message={`Pulihkan produksi ${restoreCandidate?.batchId ?? ''}?`}
        title="Pulihkan Produksi"
        visible={Boolean(restoreCandidate)}
        onCancel={() => setRestoreCandidate(null)}
        onConfirm={() => {
          const candidate = restoreCandidate;
          setRestoreCandidate(null);
          if (!candidate) return;
          void (async () => {
            await controller.onSelectProduction(candidate);
            await controller.onRestoreProduction();
            void controller.onRefresh();
          })();
        }}
      />
    </View>
  );
}

function buildProductionListColumns({
  onSelect,
}: {
  onSelect: (production: KolamProduction) => void;
}): Array<KolamListTableColumn<KolamProduction>> {
  return [
    {
      flex: 1.15,
      id: 'target',
      label: 'Target',
      render: production => (
        <Pressable onPress={() => onSelect(production)} style={styles.identityCell}>
          <Text numberOfLines={2} style={styles.rowTitle}>
            {getKolamProductionTargetLabel(production)}
          </Text>
          <Text numberOfLines={1} style={styles.rowMeta}>
            {getKolamProductionTargetTypeLabel(production.targetType)}
          </Text>
        </Pressable>
      ),
    },
    {
      align: 'center',
      flex: 0.95,
      id: 'variant',
      label: 'Varian',
      render: production => {
        const variantSku = production.variant?.sku?.trim();
        return (
          <View style={styles.centerCell}>
            <Text numberOfLines={2} style={[styles.cellText, styles.centerText]}>
              {getKolamProductionVariantLabel(production.variant)}
            </Text>
            {variantSku ? (
              <Text numberOfLines={1} style={[styles.rowMeta, styles.centerText]}>
                {variantSku}
              </Text>
            ) : null}
          </View>
        );
      },
    },
    {
      align: 'center',
      flex: 0.72,
      id: 'qty',
      label: 'QTY',
      render: production => {
        const planned = production.plannedQuantity || production.quantity || 0;
        const completed = production.completedQuantity || 0;
        return (
          <View style={styles.centerCell}>
            <Text style={[styles.cellText, styles.centerText]}>
              {completed} / {planned}
            </Text>
            {production.status === 'completed' && completed < planned ? (
              <Text style={styles.warningText}>sebagian</Text>
            ) : null}
          </View>
        );
      },
    },
    {
      align: 'center',
      flex: 0.85,
      id: 'cost',
      label: 'Estimasi',
      render: production => (
        <Text style={styles.numText}>{formatRupiah(production.estimatedCost || 0)}</Text>
      ),
    },
    {
      align: 'center',
      flex: 0.78,
      id: 'batch',
      label: 'Batch',
      render: production => (
        <Text numberOfLines={1} style={styles.cellText}>
          {production.batchId || '-'}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'status',
      label: 'Status',
      render: production => {
        const linked = production.linkedPurchaseOrders ?? [];
        const linkedTotal = linked.length;
        const linkedDone = linked.filter(link =>
          ['completed', 'cancelled', 'rejected'].includes(String(link.status || '')),
        ).length;
        return (
          <View style={styles.statusCell}>
            <KolamStatusBadge
              intent={productionStatusIntent(production.status)}
              label={getKolamProductionStatusLabel(production.status)}
              style={styles.centerBadge}
            />
            {production.status === 'waiting_for_po' && linkedTotal > 0 ? (
              <Text style={styles.warningText}>
                {linkedDone}/{linkedTotal} PO
              </Text>
            ) : null}
          </View>
        );
      },
    },
    {
      align: 'center',
      flex: 0.58,
      id: 'pic',
      label: 'PIC',
      render: production => (
        <View style={[styles.picCell, styles.overflowVisible]}>
          <KolamProductionPicAvatar production={production} />
        </View>
      ),
    },
    {
      align: 'center',
      flex: 0.82,
      id: 'date',
      label: 'Tanggal',
      render: production => (
        <Text numberOfLines={1} style={styles.cellText}>
          {formatProductionListDate(production.productionDate)}
        </Text>
      ),
    },
  ];
}

function KolamProductionActionsMenu({
  canDelete,
  onDelete,
  onRestore,
  onSelect,
  production,
}: {
  canDelete: boolean;
  onDelete: () => void;
  onRestore: () => void;
  onSelect: () => void;
  production: KolamProduction;
}) {
  const actions = [
    { label: 'Lihat', onPress: onSelect },
    ...(production.status === 'cancelled' ? [{ label: 'Pulihkan', onPress: onRestore }] : []),
    ...(production.status === 'cancelled' && canDelete
      ? [{ label: 'Hapus', onPress: onDelete, tone: 'danger' as const }]
      : []),
  ];

  return (
    <KolamOverflowMenuButton
      accessibilityLabel={`Menu ${production.batchId || 'produksi'}`}
      actions={actions}
    />
  );
}

function KolamProductionPicAvatar({ production }: { production: KolamProduction }) {
  const name =
    production.assignedTo?.name ||
    production.assignedTo?.email ||
    'Tanpa PIC';
  const photoUri = getKolamFileUrl(production.assignedTo?.photo);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('') || '?';

  return (
    <KolamHoverTooltip containerStyle={styles.picTooltip} label={name}>
      <View accessibilityLabel={`PIC ${name}`} style={styles.picAvatar}>
        <KolamProfileAvatarContent
          imageStyle={styles.picAvatarImage}
          imageUrl={photoUri}
          initials={initials}
          textStyle={styles.picAvatarText}
        />
      </View>
    </KolamHoverTooltip>
  );
}

function formatProductionListDate(value?: string) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function KolamProductionForm({
  controller,
  onRouteChange,
}: {
  controller: KolamProductionController;
  onRouteChange?: (route: string) => void;
}) {
  const { authUser } = useKolamAuthContext();
  const isEdit = controller.mode === 'edit';
  const form = controller.form;
  const selectionSource = form.serialEnabled ? controller.freyersForProduction : controller.productsForProduction;
  const selectedProduct = selectionSource.find(item => item.id === form.productId) ?? null;
  const activeComponents =
    form.targetType === 'product' && selectedProduct
      ? resolveActiveComponents(selectedProduct, form.variantId)
      : [];

  const canPickAssignee =
    authUser?.roleKey === 'super_admin' ||
    authUser?.roleKey === 'super_administrator' ||
    authUser?.roleKey === 'administrator';

  const assigneeOptions = canPickAssignee
    ? controller.staffAssignees.map(user => ({
        value: user.id,
        label: user.displayName || user.email,
      }))
    : authUser?.id
    ? [{
        value: authUser.id,
        label: [authUser.firstName, authUser.lastName].filter(Boolean).join(' ') || authUser.email || 'Saya',
      }]
    : [];

  const contextLabel =
    controller.mode === 'create'
      ? 'Produksi baru'
      : `Edit · ${controller.selectedProduction?.batchId ?? ''}`;

  return (
    <View style={styles.detailSurface}>
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
                if (isEdit && controller.selectedProduction) {
                  onRouteChange?.(`${KOLAM_PRODUCTION_ROOT}/${controller.selectedProduction.id}`);
                  return;
                }
                controller.onBackToList();
                onRouteChange?.(KOLAM_PRODUCTION_ROOT);
              }}
              style={styles.toolbarButton}
            />
          </View>
        </View>
      </View>

      <KolamDetailScrollSurface contentContainerStyle={styles.formScroll}>
      <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
        <Text style={styles.sectionTitle}>{isEdit ? 'Edit Produksi' : 'Produksi Baru'}</Text>

        {!isEdit ? (
          <View style={styles.formSection}>
            <Text style={styles.sectionSubtitle}>Mode Serial (Freyer)</Text>
            <KolamSwitch
              active={form.serialEnabled}
              onPress={() =>
                controller.onChangeForm({
                  serialEnabled: !form.serialEnabled,
                  targetType: 'product',
                  productId: '',
                  variantId: '',
                })
              }
            />
          </View>
        ) : null}

        {!isEdit && !form.serialEnabled ? (
          <View style={styles.formSection}>
            <View style={styles.chipRow}>
              {(['product', 'species'] as const).map(type => (
                <KolamButton
                  key={type}
                  intent={form.targetType === type ? 'primary' : 'plain'}
                  label={type === 'product' ? 'Produk' : 'Spesies'}
                  onPress={() =>
                    controller.onChangeForm({
                      targetType: type,
                      productId: '',
                      speciesId: '',
                      variantId: '',
                    })
                  }
                />
              ))}
            </View>
          </View>
        ) : null}

        {form.targetType === 'product' || form.serialEnabled ? (
          <View style={styles.formSection}>
            <KolamDropdownSelect
              label={form.serialEnabled ? 'Freyer' : 'Produk'}
              onChange={value => controller.onChangeForm({ productId: value, variantId: '' })}
              options={selectionSource.map(item => ({
                value: item.id,
                label: `${item.name} (${item.sku || '—'})`,
              }))}
              value={form.productId}
            />
            {selectedProduct?.variants.length ? (
              <KolamDropdownSelect
                label="Varian"
                onChange={value => controller.onChangeForm({ variantId: value })}
                options={selectedProduct.variants.map(variant => ({
                  value: variant.id,
                  label: getKolamProductionVariantLabel(variant),
                }))}
                value={form.variantId}
              />
            ) : null}
            {activeComponents.length ? (
              <View style={styles.componentPreview}>
                {activeComponents.map(line => (
                  <Text key={line.productId} style={styles.helperText}>
                    {line.productName} × {line.quantity * (Number(form.quantity) || 1)}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.formSection}>
            <KolamDropdownSelect
              label="Spesies"
              onChange={value => controller.onChangeForm({ speciesId: value })}
              options={controller.speciesList.map(item => ({
                value: item.id,
                label: item.scientificName || item.displayName || item.id,
              }))}
              value={form.speciesId}
            />
            <Text style={styles.helperText}>
              BE dapat menolak produksi spesies tanpa komponen produk valid.
            </Text>
            {form.components.map((line, index) => (
              <View key={line.key} style={styles.componentRow}>
                <KolamDropdownSelect
                  label={`Bahan ${index + 1}`}
                  onChange={value => {
                    const product = controller.productsForProduction.find(item => item.id === value);
                    controller.onChangeForm({
                      components: form.components.map(entry =>
                        entry.key === line.key
                          ? { ...entry, productId: value, productName: product?.name ?? '' }
                          : entry,
                      ),
                    });
                  }}
                  options={controller.productsForProduction.map(item => ({
                    value: item.id,
                    label: item.name,
                  }))}
                  value={line.productId}
                />
                <KolamFormTextField
                  keyboardType="numeric"
                  onChangeText={value =>
                    controller.onChangeForm({
                      components: form.components.map(entry =>
                        entry.key === line.key ? { ...entry, quantity: value } : entry,
                      ),
                    })
                  }
                  placeholder="Qty"
                  value={line.quantity}
                />
              </View>
            ))}
            <KolamButton
              label="Tambah komponen"
              onPress={() =>
                controller.onChangeForm({
                  components: [
                    ...form.components,
                    { key: `c-${Date.now()}`, productId: '', productName: '', quantity: '1' },
                  ],
                })
              }
            />
          </View>
        )}

        <KolamFormTextField
          editable={
            !(
              isEdit &&
              controller.selectedProduction?.status === 'waiting_for_po'
            )
          }
          keyboardType="numeric"
          onChangeText={value => controller.onChangeForm({ quantity: value })}
          placeholder={
            isEdit &&
            controller.selectedProduction?.status === 'waiting_for_po'
              ? 'Kuantitas terkunci (menunggu PO)'
              : 'Kuantitas'
          }
          value={form.quantity}
        />
        <KolamFormTextField
          multiline
          numberOfLines={3}
          onChangeText={value => controller.onChangeForm({ description: value })}
          placeholder="Deskripsi"
          value={form.description}
        />
        <KolamDateField
          label="Tanggal produksi"
          onChange={value => controller.onChangeForm({ productionDate: value })}
          value={form.productionDate}
        />
        {assigneeOptions.length ? (
          <KolamDropdownSelect
            label="Penanggung jawab"
            onChange={value => controller.onChangeForm({ assignedToId: value })}
            options={assigneeOptions}
            value={form.assignedToId || assigneeOptions[0]?.value || ''}
          />
        ) : null}

        {isEdit && controller.selectedProduction ? (
          <View style={styles.formSection}>
            <Text style={styles.sectionSubtitle}>Foto produksi</Text>
            <View style={styles.photoGrid}>
              {controller.selectedProduction.photos.map((photo, index) => (
                <View key={`${photo}-${index}`} style={styles.photoEditCell}>
                  <KolamRemoteImage
                    accessibilityLabel={`Foto ${index + 1}`}
                    resizeMode="cover"
                    sourceUri={getKolamFileUrl(photo)}
                    style={styles.photoThumb}
                  />
                  <KolamButton
                    disabled={controller.mutating}
                    label="Hapus"
                    onPress={() => void controller.onDeletePhoto(index)}
                    size="sm"
                  />
                </View>
              ))}
            </View>
            <KolamButton
              disabled={controller.mutating}
              label="Unggah foto"
              onPress={() => {
                void controller.onPickImage().then(uri => {
                  if (uri) {
                    void controller.onUploadPhotos([uri]);
                  }
                });
              }}
              size="sm"
            />
          </View>
        ) : null}

        {!isEdit && controller.insufficientStock.length ? (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>Stok bahan kurang</Text>
            <Text style={styles.warningText}>
              Bahan berikut tidak cukup:{' '}
              {controller.insufficientStock.join(', ')}. Buat PO terlebih
              dahulu.
            </Text>
            <View style={styles.formActions}>
              <KolamButton
                disabled={controller.mutating}
                label="Generate PO"
                onPress={() => void controller.onGeneratePo()}
              />
              {(form.targetType === 'product' || form.serialEnabled) && form.productId ? (
                <KolamButton
                  disabled={controller.mutating}
                  intent="primary"
                  label="Buat produksi + PO"
                  onPress={() =>
                    void controller.onCreateWithPO().then(id => {
                      if (id) {
                        onRouteChange?.(`${KOLAM_PRODUCTION_ROOT}/${id}`);
                      }
                    })
                  }
                />
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={styles.formActions}>
          <KolamButton
            label="Batal"
            onPress={() => {
              if (isEdit && controller.selectedProduction) {
                onRouteChange?.(`${KOLAM_PRODUCTION_ROOT}/${controller.selectedProduction.id}`);
                return;
              }
              controller.onBackToList();
              onRouteChange?.(KOLAM_PRODUCTION_ROOT);
            }}
          />
          <KolamButton
            disabled={controller.mutating}
            intent="primary"
            label={controller.mutating ? 'Menyimpan…' : 'Simpan'}
            onPress={() =>
              void controller.onSave().then(id => {
                if (id) onRouteChange?.(`${KOLAM_PRODUCTION_ROOT}/${id}`);
              })
            }
          />
        </View>
      </KolamContentFrame>
    </KolamDetailScrollSurface>
    </View>
  );
}

function KolamProductionDetail({
  controller,
  onRouteChange,
}: {
  controller: KolamProductionController;
  onRouteChange?: (route: string) => void;
}) {
  const production = controller.selectedProduction;
  const { authUser } = useKolamAuthContext();
  const canUpdate = hasKolamProductionPermission(authUser?.permissions, 'update', authUser?.roleKey);
  const canDelete = hasKolamProductionPermission(authUser?.permissions, 'delete', authUser?.roleKey);

  const [showSubmitCheck, setShowSubmitCheck] = React.useState(false);
  const [showFinalize, setShowFinalize] = React.useState(false);
  const [showCancel, setShowCancel] = React.useState(false);
  const [showRestore, setShowRestore] = React.useState(false);
  const [showDelete, setShowDelete] = React.useState(false);

  if (!production) {
    return (
      <KolamEmptyState
        message={controller.loading ? 'Memuat detail…' : 'Produksi tidak ditemukan.'}
        title="Detail Produksi"
      />
    );
  }

  const plannedQty = production.plannedQuantity || production.quantity || 0;
  const completedQty = production.completedQuantity || 0;
  const progressPercent = plannedQty > 0 ? Math.round((completedQty / plannedQty) * 100) : 0;
  const targetHref = getKolamProductionTargetHref(production);
  const nextStatuses = getAllowedNextProductionStatuses(production.status);

  return (
    <View style={styles.detailSurface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text numberOfLines={1} style={styles.detailToolbarContext}>
              {production.batchId || getKolamProductionTargetLabel(production)}
            </Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamDaftarButton
              muted
              onPress={() => {
                controller.onBackToList();
                onRouteChange?.(KOLAM_PRODUCTION_ROOT);
              }}
              style={styles.toolbarButton}
            />
            {canEditKolamProduction(production.status) && canUpdate ? (
              <KolamEditButton
                onPress={() => {
                  controller.onEdit();
                  onRouteChange?.(`${KOLAM_PRODUCTION_ROOT}/${production.id}/edit`);
                }}
                style={styles.toolbarButton}
              />
            ) : null}
            <KolamPdfDownloadButton
              disabled={controller.exporting}
              label="PDF Perintah"
              loading={controller.exporting}
              loadingLabel="Mengekspor…"
              onPress={() => void controller.onExportPdf()}
              style={styles.toolbarButton}
            />
            <KolamPdfDownloadButton
              disabled={controller.exporting}
              label="PDF Detail"
              loading={controller.exporting}
              loadingLabel="Mengekspor…"
              onPress={() => void controller.onExportDetailPdf()}
              style={styles.toolbarButton}
            />
            {canRecalculateKolamProduction(production.status) && canUpdate ? (
              <KolamButton
                disabled={controller.mutating}
                label="Hitung Ulang"
                onPress={() => void controller.onRecalculate()}
                style={styles.toolbarButton}
              />
            ) : null}
            {nextStatuses.includes('in_progress') && canUpdate ? (
              <KolamButton
                label="Mulai Produksi"
                onPress={() => void controller.onStartProduction()}
                style={styles.toolbarButton}
              />
            ) : null}
            {production.status === 'in_progress' && canUpdate ? (
              <KolamButton
                label="Kirim Pemeriksaan"
                onPress={() => setShowSubmitCheck(true)}
                style={styles.toolbarButton}
              />
            ) : null}
            {production.status === 'on_check' && canUpdate ? (
              <KolamButton
                intent="primary"
                label="Finalisasi"
                onPress={() => setShowFinalize(true)}
                style={styles.toolbarButton}
              />
            ) : null}
            {canCancelKolamProduction(production.status) && canUpdate ? (
              <KolamButton
                intent="danger"
                label="Batalkan"
                onPress={() => setShowCancel(true)}
                style={styles.toolbarButton}
              />
            ) : null}
            {production.status === 'cancelled' && canUpdate ? (
              <KolamButton
                label="Pulihkan"
                onPress={() => setShowRestore(true)}
                style={styles.toolbarButton}
              />
            ) : null}
            {production.status === 'cancelled' && canDelete ? (
              <KolamButton
                intent="danger"
                label="Hapus"
                onPress={() => setShowDelete(true)}
                style={styles.toolbarButton}
              />
            ) : null}
          </View>
        </View>
      </View>

      <KolamDetailScrollSurface contentContainerStyle={styles.detailScroll}>
      <View style={styles.detailSplitRow}>
        <View
          style={[
            styles.detailMainCol,
            !production.productionHistories.length ? styles.detailMainColFull : null,
          ]}
        >
          <KolamContentFrame
            style={[styles.detailCard, styles.detailSplitCard]}
            variant="settingsWebConfig"
          >
            <View style={styles.detailHeaderRow}>
              <Text style={styles.sectionTitle}>{production.batchId}</Text>
              <KolamStatusBadge
                intent={productionStatusIntent(production.status)}
                label={getKolamProductionStatusLabel(production.status)}
              />
            </View>
            <Text style={styles.helperText}>
              {getKolamProductionTargetTypeLabel(production.targetType)} · Dibuat{' '}
              {production.createdAt
                ? production.createdAt.slice(0, 16).replace('T', ' ')
                : '—'}
            </Text>

            <KolamDescriptionList
              accessibilityLabel="Detail produksi"
              rows={[
                {
                  id: 'target',
                  label: 'Target',
                  value: getKolamProductionTargetLabel(production),
                  meta: '',
                  tone: 'default',
                  ...(targetHref ? { onPress: () => onRouteChange?.(targetHref) } : {}),
                },
                {
                  id: 'variant',
                  label: 'Varian',
                  value: getKolamProductionVariantLabel(production.variant),
                  meta: '',
                  tone: 'default',
                },
                {
                  id: 'qty',
                  label: 'Rencana / Selesai',
                  value: `${plannedQty} / ${completedQty} (${progressPercent}%)`,
                  meta: '',
                  tone: 'default',
                },
                {
                  id: 'estimated',
                  label: 'Estimasi Biaya',
                  value: formatRupiah(production.estimatedCost),
                  meta: '',
                  tone: 'default',
                },
                {
                  id: 'actual',
                  label: 'Biaya Aktual',
                  value:
                    production.status === 'completed' ? formatRupiah(production.actualCost) : '—',
                  meta: '',
                  tone: 'default',
                },
                {
                  id: 'assigned',
                  label: 'Penanggung jawab',
                  value: production.assignedTo?.name || production.assignedTo?.email || '—',
                  meta: '',
                  tone: 'default',
                },
                {
                  id: 'description',
                  label: 'Deskripsi',
                  value: production.description || '—',
                  meta: '',
                  tone: 'default',
                },
              ]}
            />
          </KolamContentFrame>
        </View>

        {production.productionHistories.length ? (
          <View style={styles.detailTimelineCol}>
            <KolamProductionHistorySection histories={production.productionHistories} />
          </View>
        ) : null}
      </View>

      {production.status === 'waiting_for_po' ? (
        <KolamProductionWaitingForPOCard
          batchId={production.batchId}
          insufficientNote={production.insufficientNote}
          linkedPurchaseOrders={production.linkedPurchaseOrders}
          onCancel={() => setShowCancel(true)}
          onRefresh={() => void controller.onRefreshDetailQuiet()}
          waitingForPoSince={production.waitingForPoSince}
        />
      ) : null}

      <KolamProductionMaterialsSection production={production} onRouteChange={onRouteChange} />

      {production.linkedPurchaseOrders.length && production.status !== 'waiting_for_po' ? (
        <KolamProductionLinkedPOsCard
          linkedPurchaseOrders={production.linkedPurchaseOrders}
          onRouteChange={onRouteChange}
        />
      ) : null}

      {production.photos.length ? (
        <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
          <Text style={styles.sectionTitle}>Foto Produksi</Text>
          <View style={styles.photoGrid}>
            {production.photos.map((photo, index) => (
              <KolamRemoteImage
                key={`${photo}-${index}`}
                accessibilityLabel={`Foto produksi ${index + 1}`}
                sourceUri={getKolamFileUrl(photo)}
                style={styles.photoThumb}
              />
            ))}
          </View>
        </KolamContentFrame>
      ) : null}

      {(production.inProgressProof || production.completedProof) && (
        <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
          <Text style={styles.sectionTitle}>Bukti Status</Text>
          {production.inProgressProof ? (
            <KolamRemoteImage
              accessibilityLabel="Bukti sedang berjalan"
              sourceUri={getKolamFileUrl(production.inProgressProof)}
              style={styles.proofImage}
            />
          ) : null}
          {production.completedProof ? (
            <KolamRemoteImage
              accessibilityLabel="Bukti selesai"
              sourceUri={getKolamFileUrl(production.completedProof)}
              style={styles.proofImage}
            />
          ) : null}
        </KolamContentFrame>
      )}

      {production.status === 'completed' ? (
        <KolamProductionSerialsSection loading={controller.serialsLoading} serials={controller.serials} />
      ) : null}

      {showSubmitCheck ? (
        <KolamProductionSubmitCheckPanel
          components={production.componentsUsed}
          mutating={controller.mutating}
          onClose={() => setShowSubmitCheck(false)}
          onPickImage={() => controller.onPickImage()}
          onSubmit={async body => {
            const ok = await controller.onSubmitCheck(body);
            if (ok) setShowSubmitCheck(false);
            return ok;
          }}
          plannedQuantity={plannedQty}
        />
      ) : null}

      {showFinalize ? (
        <KolamProductionFinalizePanel
          actualCost={production.actualCost || production.estimatedCost}
          completedQuantity={completedQty}
          components={production.componentsUsed}
          mutating={controller.mutating}
          onClose={() => setShowFinalize(false)}
          onSubmit={async body => {
            const ok = await controller.onFinalize(body);
            if (ok) setShowFinalize(false);
            return ok;
          }}
        />
      ) : null}

      <KolamConfirmDialog
        confirmLabel="Batalkan"
        destructive
        message={
          production.linkedPurchaseOrders.length
            ? `Batalkan produksi ${production.batchId}? PO draft/sent terkait akan dibatalkan otomatis; PO yang sudah lanjut tetap aktif.`
            : `Batalkan produksi ${production.batchId}?`
        }
        title="Batalkan Produksi"
        visible={showCancel}
        onCancel={() => setShowCancel(false)}
        onConfirm={() => {
          setShowCancel(false);
          void controller.onCancelProduction();
        }}
      />

      <KolamConfirmDialog
        confirmLabel="Pulihkan"
        message={`Pulihkan produksi ${production.batchId}?`}
        title="Pulihkan Produksi"
        visible={showRestore}
        onCancel={() => setShowRestore(false)}
        onConfirm={() => {
          setShowRestore(false);
          void controller.onRestoreProduction();
        }}
      />

      <KolamDeleteConfirmDialog
        itemLabel={production.batchId}
        itemType="produksi"
        visible={showDelete}
        onCancel={() => setShowDelete(false)}
        onConfirm={() => {
          setShowDelete(false);
          void controller.onDeleteProduction().then(ok => {
            if (ok) onRouteChange?.(KOLAM_PRODUCTION_ROOT);
          });
        }}
      />
    </KolamDetailScrollSurface>
    </View>
  );
}

function KolamProductionWaitingForPOCard({
  batchId,
  linkedPurchaseOrders,
  insufficientNote,
  waitingForPoSince,
  onRefresh,
  onCancel,
}: {
  batchId: string;
  linkedPurchaseOrders: KolamProductionLinkedPO[];
  insufficientNote?: string;
  waitingForPoSince?: string;
  onRefresh: () => void;
  onCancel: () => void;
}) {
  const terminalStatuses = new Set(['completed', 'cancelled', 'rejected']);
  const failStatuses = new Set(['cancelled', 'rejected']);
  const resolvable = linkedPurchaseOrders.filter(link => link.poId);
  const done = resolvable.filter(link => terminalStatuses.has(link.status)).length;
  const total = resolvable.length;
  const anyFailed = resolvable.some(link => failStatuses.has(link.status));
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const shouldPoll = done < total && !anyFailed;

  React.useEffect(() => {
    if (!shouldPoll) return undefined;
    const id = setInterval(onRefresh, WAITING_PO_POLL_MS);
    return () => clearInterval(id);
  }, [onRefresh, shouldPoll]);

  return (
    <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
      <Text style={styles.sectionTitle}>Menunggu PO diselesaikan</Text>
      <Text style={styles.helperText}>
        Produksi {batchId} akan otomatis pindah ke Menunggu saat semua PO terkait selesai.
      </Text>
      {insufficientNote ? <Text style={styles.warningText}>Kekurangan bahan: {insufficientNote}</Text> : null}
      <Text style={styles.sectionSubtitle}>{done} / {total} PO selesai ({percent}%)</Text>
      {anyFailed ? (
        <Text style={styles.warningText}>
          Satu atau lebih PO dibatalkan/ditolak — produksi tidak akan otomatis lanjut.
        </Text>
      ) : null}
      {resolvable.map(link => (
        <View key={link.poId} style={styles.linkedPoRow}>
          <Text style={styles.linkedPoCode}>{link.poCode}</Text>
          <Text style={styles.linkedPoVendor}>{link.vendorName || '—'}</Text>
          <KolamStatusBadge intent="muted" label={link.status.replace(/_/g, ' ')} />
        </View>
      ))}
      {waitingForPoSince ? (
        <Text style={styles.helperText}>
          Menunggu sejak {new Date(waitingForPoSince).toLocaleString('id-ID')}
        </Text>
      ) : null}
      {shouldPoll ? (
        <Text style={styles.helperText}>
          Auto-refresh tiap {Math.round(WAITING_PO_POLL_MS / 1000)} detik
        </Text>
      ) : null}
      <View style={styles.formActions}>
        <KolamRefreshButton accessibilityLabel="Muat ulang" onPress={onRefresh} />
        <KolamButton intent="danger" label="Batalkan Produksi" onPress={onCancel} />
      </View>
    </KolamContentFrame>
  );
}

function KolamProductionMaterialsSection({
  production,
  onRouteChange,
}: {
  production: KolamProduction;
  onRouteChange?: (route: string) => void;
}) {
  const showStock = production.status === 'waiting_for_po';
  const columns = React.useMemo(
    () => buildProductionMaterialColumns({ onRouteChange, showStock }),
    [onRouteChange, showStock],
  );
  const totalSubtotal = production.componentsUsed.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0,
  );

  return (
    <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
      <Text style={styles.sectionTitle}>Bahan & Biaya Produksi</Text>
      <Text style={styles.helperText}>Estimasi: {formatRupiah(production.estimatedCost)}</Text>
      {production.status === 'completed' ? (
        <Text style={styles.helperText}>Biaya aktual: {formatRupiah(production.actualCost)}</Text>
      ) : null}
      <KolamListTableComposition
        columns={columns}
        emptyTitle="Belum ada bahan"
        footer={
          <ProductionMaterialsFooter
            count={production.componentsUsed.length}
            total={totalSubtotal}
          />
        }
        getRowKey={line => line.id}
        rows={production.componentsUsed}
        showFooter={production.componentsUsed.length > 0}
        style={styles.materialsTable}
      />
    </KolamContentFrame>
  );
}

function buildProductionMaterialColumns({
  onRouteChange,
  showStock,
}: {
  onRouteChange?: (route: string) => void;
  showStock: boolean;
}): Array<KolamListTableColumn<KolamProductionComponentUsed>> {
  return [
    {
      flex: 1.3,
      id: 'component',
      label: 'Komponen',
      render: line => (
        <Pressable
          onPress={() => line.productId && onRouteChange?.(`/products/${line.productId}`)}
          style={styles.identityCell}
        >
          <Text numberOfLines={2} style={styles.rowTitle}>
            {line.productName}
          </Text>
        </Pressable>
      ),
    },
    {
      align: 'center',
      flex: 0.95,
      id: 'variant',
      label: 'Varian',
      render: line => (
        <Text numberOfLines={2} style={styles.cellText}>
          {getKolamProductionVariantLabel(line.variant)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'code',
      label: 'SKU / Kode',
      render: line => (
        <Text numberOfLines={2} style={styles.cellText}>
          {line.productSku || line.productCode || '—'}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.58,
      id: 'unit',
      label: 'Satuan',
      render: line => (
        <Text numberOfLines={1} style={styles.cellText}>
          {line.unit?.initial || line.unit?.name || '—'}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.72,
      id: 'quantity',
      label: 'Qty Dibutuhkan',
      render: line => <Text style={styles.numText}>{line.quantity}</Text>,
    },
    {
      align: 'center',
      flex: 0.8,
      id: 'stock',
      label: 'Stok Tersedia',
      render: line => (
        <Text style={styles.numText}>
          {showStock ? String(line.currentStock ?? line.available ?? '—') : 'Ter-reserve'}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'sufficiency',
      label: 'Kecukupan',
      render: line =>
        showStock ? (
          line.sufficient === false ? (
            <KolamStatusBadge intent="danger" label="Kurang" style={styles.centerBadge} />
          ) : line.sufficient ? (
            <KolamStatusBadge intent="success" label="Cukup" style={styles.centerBadge} />
          ) : (
            <Text style={styles.cellText}>—</Text>
          )
        ) : (
          <KolamStatusBadge intent="muted" label="Dialokasikan" style={styles.centerBadge} />
        ),
    },
    {
      align: 'center',
      flex: 0.95,
      id: 'unitPrice',
      label: 'Harga / Satuan',
      render: line => <Text style={styles.numText}>{formatRupiah(line.unitPrice)}</Text>,
    },
    {
      align: 'center',
      flex: 0.95,
      id: 'subtotal',
      label: 'Subtotal',
      render: line => (
        <Text style={styles.numText}>{formatRupiah(line.unitPrice * line.quantity)}</Text>
      ),
    },
  ];
}

function ProductionMaterialsFooter({
  count,
  total,
}: {
  count: number;
  total: number;
}) {
  return (
    <View style={styles.materialsFooter}>
      <Text style={styles.materialsFooterLabel}>Total material ({count} komponen)</Text>
      <Text style={styles.materialsFooterTotal}>{formatRupiah(total)}</Text>
    </View>
  );
}

function KolamProductionLinkedPOsCard({
  linkedPurchaseOrders,
  onRouteChange,
}: {
  linkedPurchaseOrders: KolamProductionLinkedPO[];
  onRouteChange?: (route: string) => void;
}) {
  return (
    <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
      <Text style={styles.sectionTitle}>Purchase Order Terkait</Text>
      {linkedPurchaseOrders.map(link => (
        <View key={link.poId} style={styles.linkedPoBlock}>
          <Pressable onPress={() => onRouteChange?.(`/purchase-order/${link.poId}`)}>
            <Text style={styles.linkText}>{link.poCode}</Text>
          </Pressable>
          <Text style={styles.helperText}>Vendor: {link.vendorName || '—'}</Text>
          <KolamStatusBadge intent="muted" label={link.status.replace(/_/g, ' ')} />
          {link.items.map(item => (
            <Text key={item.id} style={styles.helperText}>
              {item.title} × {item.quantity}
              {item.receivedQuantity != null ? ` (diterima ${item.receivedQuantity})` : ''}
            </Text>
          ))}
        </View>
      ))}
    </KolamContentFrame>
  );
}

function KolamProductionSerialsSection({
  serials,
  loading,
}: {
  serials: KolamProductionController['serials'];
  loading: boolean;
}) {
  if (loading && !serials.length) {
    return (
      <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
        <Text style={styles.sectionTitle}>Nomor Seri</Text>
        <Text style={styles.helperText}>Memuat nomor seri…</Text>
      </KolamContentFrame>
    );
  }
  if (!serials.length) return null;
  return (
    <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
      <Text style={styles.sectionTitle}>Nomor Seri ({serials.length})</Text>
      <View style={styles.serialGrid}>
        {serials.map(serial => (
          <View key={serial.id} style={styles.serialCard}>
            <Text style={styles.serialNumber}>{serial.serialNumber}</Text>
            <Text style={styles.helperText}>{serial.productType}</Text>
            {serial.qrCode ? <Image source={{ uri: serial.qrCode }} style={styles.qrThumb} /> : null}
          </View>
        ))}
      </View>
    </KolamContentFrame>
  );
}

function KolamProductionHistorySection({
  histories,
}: {
  histories: KolamProduction['productionHistories'];
}) {
  if (!histories.length) return null;
  const events = [...histories].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
  );
  return (
    <KolamContentFrame
      style={[styles.detailCard, styles.detailSplitCard]}
      variant="settingsWebConfig"
    >
      <Text style={styles.sectionTitle}>Timeline Produksi</Text>
      {events.map(event => (
        <View key={event.id} style={styles.historyRow}>
          <Text style={styles.helperText}>
            {event.changedAt ? event.changedAt.slice(0, 16).replace('T', ' ') : '—'}
          </Text>
          <KolamStatusBadge
            intent="muted"
            label={getKolamProductionHistoryStatusLabel(event.status)}
          />
          {event.note ? <Text style={styles.sectionSubtitle}>{event.note}</Text> : null}
          {event.recalcDelta ? (
            <Text style={styles.helperText}>
              Estimasi: {formatRupiah(event.recalcDelta.estimatedCostBefore)} →{' '}
              {formatRupiah(event.recalcDelta.estimatedCostAfter)}
            </Text>
          ) : null}
          {event.changedByName ? (
            <Text style={styles.helperText}>Oleh {event.changedByName}</Text>
          ) : null}
        </View>
      ))}
    </KolamContentFrame>
  );
}

function KolamProductionSubmitCheckPanel({
  plannedQuantity,
  components,
  mutating,
  onClose,
  onSubmit,
  onPickImage,
}: {
  plannedQuantity: number;
  components: KolamProductionComponentUsed[];
  mutating: boolean;
  onClose: () => void;
  onSubmit: (body: {
    completedQuantity: number;
    componentsBreakdown: KolamSubmitCheckBreakdownEntry[];
    note?: string;
    completedProofLocalUri?: string;
  }) => Promise<boolean>;
  onPickImage: () => Promise<string | null>;
}) {
  const [completedQty, setCompletedQty] = React.useState(String(plannedQuantity));
  const [note, setNote] = React.useState('');
  const [proofUri, setProofUri] = React.useState<string | null>(null);
  const [rows, setRows] = React.useState(() =>
    components.map(line => ({
      componentId: line.id,
      quantity: line.quantity,
      consumed: String(line.actualConsumed ?? line.quantity),
      returned: String(line.returnedQuantity ?? 0),
    })),
  );

  return (
    <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
      <Text style={styles.sectionTitle}>Kirim Pemeriksaan</Text>
      <KolamFormTextField
        keyboardType="numeric"
        onChangeText={setCompletedQty}
        placeholder="Kuantitas selesai"
        value={completedQty}
      />
      {rows.map(row => {
        const line = components.find(item => item.id === row.componentId);
        return (
          <View key={row.componentId} style={styles.componentRow}>
            <Text style={styles.sectionSubtitle}>
              {line?.productName ?? row.componentId} (alokasi {row.quantity})
            </Text>
            <KolamFormTextField
              keyboardType="numeric"
              onChangeText={value =>
                setRows(current =>
                  current.map(entry =>
                    entry.componentId === row.componentId ? { ...entry, consumed: value } : entry,
                  ),
                )
              }
              placeholder="Terpakai"
              value={row.consumed}
            />
            <KolamFormTextField
              keyboardType="numeric"
              onChangeText={value =>
                setRows(current =>
                  current.map(entry =>
                    entry.componentId === row.componentId ? { ...entry, returned: value } : entry,
                  ),
                )
              }
              placeholder="Dikembalikan"
              value={row.returned}
            />
          </View>
        );
      })}
      <KolamFormTextField multiline onChangeText={setNote} placeholder="Catatan" value={note} />
      <View style={styles.formActions}>
        <KolamButton
          label={proofUri ? 'Ganti bukti foto' : 'Pilih bukti foto'}
          onPress={() =>
            void onPickImage().then(uri => {
              if (uri) setProofUri(uri);
            })
          }
        />
        <KolamButton label="Batal" onPress={onClose} />
        <KolamButton
          disabled={mutating}
          intent="primary"
          label={mutating ? 'Mengirim…' : 'Kirim'}
          onPress={() =>
            void onSubmit({
              completedQuantity: Number(completedQty) || 0,
              componentsBreakdown: rows.map(row => ({
                componentId: row.componentId,
                actualConsumed: Number(row.consumed) || 0,
                returnedQuantity: Number(row.returned) || 0,
              })),
              note: note.trim() || undefined,
              completedProofLocalUri: proofUri ?? undefined,
            })
          }
        />
      </View>
    </KolamContentFrame>
  );
}

function KolamProductionFinalizePanel({
  completedQuantity,
  actualCost,
  components,
  mutating,
  onClose,
  onSubmit,
}: {
  completedQuantity: number;
  actualCost: number;
  components: KolamProductionComponentUsed[];
  mutating: boolean;
  onClose: () => void;
  onSubmit: (body: { decision: 'accept' | 'reject'; note?: string }) => Promise<boolean>;
}) {
  const [decision, setDecision] = React.useState<'accept' | 'reject'>('accept');
  const [note, setNote] = React.useState('');

  return (
    <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
      <Text style={styles.sectionTitle}>Finalisasi Produksi</Text>
      <Text style={styles.helperText}>
        Kuantitas selesai: {completedQuantity} · Biaya preview: {formatRupiah(actualCost)}
      </Text>
      {components.map(line => (
        <Text key={line.id} style={styles.helperText}>
          {line.productName}: terpakai {line.actualConsumed ?? line.quantity}, dikembalikan{' '}
          {line.returnedQuantity ?? 0}
        </Text>
      ))}
      <View style={styles.chipRow}>
        <KolamButton
          intent={decision === 'accept' ? 'primary' : 'plain'}
          label="Terima"
          onPress={() => setDecision('accept')}
        />
        <KolamButton
          intent={decision === 'reject' ? 'danger' : 'plain'}
          label="Tolak"
          onPress={() => setDecision('reject')}
        />
      </View>
      {decision === 'reject' ? (
        <KolamFormTextField multiline onChangeText={setNote} placeholder="Alasan penolakan" value={note} />
      ) : null}
      <View style={styles.formActions}>
        <KolamButton label="Batal" onPress={onClose} />
        <KolamButton
          disabled={mutating || (decision === 'reject' && !note.trim())}
          intent="primary"
          label={mutating ? 'Memproses…' : 'Konfirmasi'}
          onPress={() =>
            void onSubmit({
              decision,
              note: decision === 'reject' ? note.trim() : undefined,
            })
          }
        />
      </View>
    </KolamContentFrame>
  );
}

function resolveActiveComponents(product: KolamProductForProduction, variantId: string) {
  if (variantId) {
    const variant = product.variants.find(item => item.id === variantId);
    if (variant?.components.length) return variant.components;
  }
  return product.components;
}

const styles = StyleSheet.create({
  surface: { gap: 14 },
  detailSurface: { gap: 14 },
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
  errorBadge: { alignSelf: 'stretch' },
  listRoot: { gap: 14 },
  toolbarWrap: {
    elevation: 1000,
    overflow: 'visible',
    position: 'relative',
    zIndex: 100000,
  },
  toolbarButton: {
    flexShrink: 0,
    minHeight: 34,
    paddingHorizontal: 10,
  },
  filterOverlayPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 1200,
    padding: 6,
    position: 'absolute',
    shadowColor: V.colors.fg,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    top: 48,
    width: 240,
    zIndex: 120000,
  },
  filterPanelStatus: {
    left: 148,
  },
  filterPanelScroll: {
    maxHeight: 280,
  },
  filterPanelContent: {
    gap: 4,
  },
  filterPanelOption: {
    justifyContent: 'flex-start',
  },
  filterPanelFooter: {
    alignItems: 'flex-end',
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    marginTop: 6,
    paddingTop: 6,
  },
  dateField: {
    flexGrow: 0,
    flexShrink: 0,
    maxWidth: 140,
    minWidth: 108,
    width: 120,
  },
  emptyWrap: { padding: 16 },
  paginationRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  pageLabel: { color: V.colors.mutedFg, fontSize: 12, fontWeight: '600' },
  listCell: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  identityCell: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  statusCell: {
    alignItems: 'center',
    gap: 4,
  },
  centerBadge: {
    alignSelf: 'center',
  },
  actionsTrack: {
    alignItems: 'center',
  },
  mainTrackVisible: {
    overflow: 'visible',
  },
  overflowVisible: {
    overflow: 'visible',
    zIndex: 9000,
  },
  picCell: {
    alignItems: 'center',
  },
  picTooltip: {
    alignSelf: 'center',
  },
  picAvatar: {
    alignItems: 'center',
    backgroundColor: V.colors.primarySoft,
    borderColor: V.colors.border,
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 32,
  },
  picAvatarImage: {
    borderRadius: 16,
    height: 32,
    width: 32,
  },
  picAvatarText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 10,
    fontWeight: '800',
  },
  overflowCell: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    overflow: 'visible',
    paddingHorizontal: 0,
    zIndex: 9000,
  },
  activeActionRow: {
    elevation: 96,
    overflow: 'visible',
    zIndex: 9000,
  },
  rowTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '700',
  },
  rowMeta: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  centerCell: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  centerText: {
    textAlign: 'center',
    width: '100%',
  },
  cellText: {
    color: V.colors.fg,
    fontSize: 13,
    textAlign: 'center',
    width: '100%',
  },
  numText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
  },
  cellPrimary: { color: V.colors.fg, fontSize: 13, fontWeight: '600' },
  cellMeta: { color: V.colors.mutedFg, fontSize: 13 },
  cellChildren: { color: V.colors.fg, fontSize: 13, textAlign: 'right' },
  cellAmount: { color: V.colors.fg, fontSize: 13, textAlign: 'right' },
  cellStatus: { alignItems: 'flex-start', gap: 4 },
  cellMarketplace: { color: V.colors.mutedFg, fontSize: 12 },
  cellActions: { alignItems: 'flex-end' },
  cellNotes: { color: V.colors.fg, fontSize: 13 },
  cellProducts: { color: V.colors.fg, fontSize: 13 },
  cellRaws: { color: V.colors.fg, fontSize: 13, textAlign: 'right' },
  cellPrice: { color: V.colors.fg, fontSize: 13, textAlign: 'right' },
  formScroll: { paddingBottom: 24 },
  detailCard: { gap: 12, marginBottom: 12 },
  sectionTitle: { color: V.colors.fg, fontFamily: V.fontFamily, fontSize: 16, fontWeight: '800' },
  sectionSubtitle: { color: V.colors.fg, fontFamily: V.fontFamily, fontSize: 13, fontWeight: '600' },
  formSection: { gap: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  componentPreview: { gap: 4 },
  componentRow: { gap: 8, marginBottom: 8 },
  helperText: { color: V.colors.mutedFg, fontFamily: V.fontFamily, fontSize: 12, lineHeight: 18 },
  warningText: { color: V.colors.warning, fontFamily: V.fontFamily, fontSize: 12, lineHeight: 18 },
  warningTitle: { color: V.colors.warning, fontFamily: V.fontFamily, fontSize: 13, fontWeight: '700' },
  warningBox: {
    backgroundColor: V.colors.warningSoft,
    borderColor: V.colors.warning,
    borderLeftWidth: 4,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
    padding: 10,
  },
  photoEditCell: { gap: 6 },
  materialsTable: {
    width: '100%',
  },
  materialsFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  materialsFooterLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  materialsFooterTotal: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '800',
  },
  formActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  detailScroll: { gap: 12, paddingBottom: 24 },
  detailSplitRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailMainCol: {
    flex: 3,
    minWidth: 280,
  },
  detailMainColFull: {
    flexBasis: '100%',
    width: '100%',
  },
  detailTimelineCol: {
    flex: 1,
    minWidth: 220,
  },
  detailSplitCard: {
    flex: 1,
  },
  detailHeaderRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  linkText: { color: V.colors.primary, fontFamily: V.fontFamily, fontSize: 13, fontWeight: '600' },
  linkedPoRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 6,
  },
  linkedPoCode: { color: V.colors.fg, fontFamily: V.fontFamily, fontSize: 13, fontWeight: '600' },
  linkedPoVendor: { color: V.colors.mutedFg, flex: 1, fontSize: 12 },
  linkedPoBlock: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
    marginBottom: 8,
    paddingBottom: 8,
  },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoThumb: { borderRadius: V.radius.md, height: 96, width: 96 },
  proofImage: { borderRadius: V.radius.md, height: 180, marginBottom: 8, width: '100%' },
  serialGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  serialCard: {
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: V.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 140,
    padding: 8,
  },
  serialNumber: { color: V.colors.fg, fontFamily: V.fontFamily, fontSize: 13, fontWeight: '700' },
  qrThumb: { height: 64, marginTop: 4, width: 64 },
  historyRow: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
    marginBottom: 8,
    paddingBottom: 8,
  },
});
