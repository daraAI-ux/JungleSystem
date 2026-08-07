import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  KOLAM_PURCHASE_ORDER_ROOT,
  filterPoStatusOptions,
  getAllowedNextPOStatuses,
  getKolamPOItemCode,
  getKolamPOItemDisplayTitle,
  getKolamPOItemHref,
  getKolamPOItemUnitLabel,
  getKolamPOItemVariantLabel,
  getKolamPOPaymentStatusLabel,
  getKolamPORefundStatusLabel,
  getKolamPOStatusLabel,
  hasKolamPurchaseOrderPermission,
  isKolamPOStatus,
  isKolamPurchaseOrderListRoute,
  type KolamPOCheckItemInput,
  type KolamPOFormLineItem,
  type KolamPOStatus,
  type KolamPurchaseOrder,
  type KolamPurchaseOrderItem,
} from '../domain/kolam-purchase-order';
import { KOLAM_SUPPLIER_ROOT } from '../domain/kolam-vendor';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { formatRupiah } from '../lib/money';
import { getKolamFileUrl } from '../lib/file-url';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  useKolamPurchaseOrderController,
  type KolamPurchaseOrderController,
} from '../hooks/use-kolam-purchase-order-controller';
import type { KolamMarketplacePlatform } from '../services/kolam-marketplace-sync-api';
import type {
  KolamPOItemForSelection,
  KolamPOItemForSelectionVariant,
} from '../services/kolam-purchase-order-api';
import { KolamButton } from './kolam-button';
import {KolamCancelButton} from './kolam-cancel-button';
import {KolamSaveButton} from './kolam-save-button';
import {KolamDaftarButton} from './kolam-daftar-button';
import {KolamEditButton} from './kolam-edit-button';
import { KolamConfirmDialog } from './kolam-confirm-dialog';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDateField } from './kolam-date-field';
import { KolamDeleteConfirmDialog } from './kolam-delete-confirm-dialog';
import { KolamDetailScrollSurface } from './kolam-detail-scroll-surface';
import { KolamDescriptionList } from './kolam-description-list';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamExportXlsButton } from './kolam-export-xls-button';
import { KolamFormTextField } from './kolam-form-text-field';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import { KolamPdfDownloadButton } from './kolam-pdf-download-button';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamSearchField } from './kolam-search-field';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamSwitch } from './kolam-switch';
import { KolamTableFilterTrigger } from './kolam-table-filter-trigger';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

type POStatusFilterPanel = 'status' | 'payment' | null;
type POStatusIntent = 'primary' | 'success' | 'warning' | 'danger' | 'muted';

const PO_STATUS_OPTIONS: KolamPOStatus[] = [
  'draft',
  'sent',
  'delivery',
  'received',
  'on_check',
  'completed',
  'rejected',
  'cancelled',
];
const PO_PAYMENT_STATUS_OPTIONS = ['unpaid', 'partial_paid', 'paid'] as const;
/** Mirror FE `INVOICE_UPLOAD_STATUSES` on purchase-order detail. */
const PO_VENDOR_INVOICE_UPLOAD_STATUSES: KolamPOStatus[] = [
  'sent',
  'delivery',
  'received',
  'on_check',
  'completed',
];

export function KolamPurchaseOrderSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamPurchaseOrderController(route);

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
      {controller.statusMessage ? (
        <KolamStatusBadge
          intent="success"
          label={controller.statusMessage}
          numberOfLines={2}
          style={styles.errorBadge}
        />
      ) : null}
      {controller.mode === 'list' && isKolamPurchaseOrderListRoute(route) ? (
        <KolamPurchaseOrderList controller={controller} onRouteChange={onRouteChange} />
      ) : controller.mode === 'create' || controller.mode === 'edit' ? (
        <KolamPurchaseOrderForm controller={controller} onRouteChange={onRouteChange} />
      ) : (
        <KolamPurchaseOrderDetail controller={controller} onRouteChange={onRouteChange} />
      )}
    </View>
  );
}

/* ──────────────────────────────────────────
   List (Fase 1)
   ──────────────────────────────────────────*/

function KolamPurchaseOrderList({
  controller,
  onRouteChange,
}: {
  controller: KolamPurchaseOrderController;
  onRouteChange?: (route: string) => void;
}) {
  const { authUser } = useKolamAuthContext();
  const canCreate = hasKolamPurchaseOrderPermission(
    authUser?.permissions,
    'create',
    authUser?.roleKey,
  );
  const [searchInput, setSearchInput] = React.useState(controller.filters.search);
  const [activeFilterPanel, setActiveFilterPanel] =
    React.useState<POStatusFilterPanel>(null);
  const [deleteCandidate, setDeleteCandidate] =
    React.useState<KolamPurchaseOrder | null>(null);
  const listColumns = React.useMemo(
    () =>
      buildPurchaseOrderListColumns({
        onSelect: po => {
          void controller.onSelectPO(po);
          onRouteChange?.(`${KOLAM_PURCHASE_ORDER_ROOT}/${po.id}`);
        },
      }),
    [controller, onRouteChange],
  );

  const pageCount = Math.max(1, controller.pagination.totalPages);
  const safePage = Math.min(Math.max(controller.pagination.page, 1), pageCount);
  const statusFilterLabel = controller.filters.status
    ? getKolamPOStatusLabel(controller.filters.status)
    : 'Status';
  const paymentFilterLabel = controller.filters.paymentStatus
    ? getKolamPOPaymentStatusLabel(controller.filters.paymentStatus)
    : 'Pembayaran';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  return (
    <View style={styles.listRoot}>
      <View style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              <KolamSearchField
                containerStyle={kolamTableToolbarStyles.searchInput}
                onChangeText={setSearchInput}
                placeholder="Cari kode PO / pemasok"
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
              <KolamTableFilterTrigger
                active={
                  activeFilterPanel === 'payment' || Boolean(controller.filters.paymentStatus)
                }
                label={paymentFilterLabel}
                onPress={() =>
                  setActiveFilterPanel(current => (current === 'payment' ? null : 'payment'))
                }
                open={activeFilterPanel === 'payment'}
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
              <KolamExportXlsButton
                disabled={controller.exporting || controller.loading}
                label="Ekspor"
                loading={controller.exporting}
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
                    onRouteChange?.(`${KOLAM_PURCHASE_ORDER_ROOT}/create`);
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
              {PO_STATUS_OPTIONS.map(status => (
                <KolamButton
                  intent={controller.filters.status === status ? 'primary' : 'plain'}
                  key={status}
                  label={getKolamPOStatusLabel(status)}
                  onPress={() => {
                    controller.onChangeFilters({ status });
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

        {activeFilterPanel === 'payment' ? (
          <View style={[styles.filterOverlayPanel, styles.filterPanelPayment]}>
            <ScrollView
              contentContainerStyle={styles.filterPanelContent}
              keyboardShouldPersistTaps="handled"
              style={styles.filterPanelScroll}
            >
              <KolamButton
                intent={!controller.filters.paymentStatus ? 'primary' : 'plain'}
                label="Semua pembayaran"
                onPress={() => {
                  controller.onChangeFilters({ paymentStatus: '' });
                  setActiveFilterPanel(null);
                }}
                style={styles.filterPanelOption}
              />
              {PO_PAYMENT_STATUS_OPTIONS.map(status => (
                <KolamButton
                  intent={controller.filters.paymentStatus === status ? 'primary' : 'plain'}
                  key={status}
                  label={getKolamPOPaymentStatusLabel(status)}
                  onPress={() => {
                    controller.onChangeFilters({ paymentStatus: status });
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
        emptyTitle={
          controller.loading
            ? 'Memuat purchase order...'
            : controller.filters.search.trim()
              ? 'Tidak ditemukan'
              : 'Belum ada purchase order'
        }
        getRowKey={item => item.id}
        loading={controller.loading}
        pagination={{
          onPageChange: controller.onPageChange,
          page: safePage,
          pageSize: controller.pagination.limit,
          total: controller.pagination.total,
        }}
        renderActions={item => (
          <KolamPurchaseOrderActionsMenu
            onDelete={() => setDeleteCandidate(item)}
            onRestore={() => {
              void controller.onRestorePO(item);
            }}
            onSelect={() => {
              void controller.onSelectPO(item);
              onRouteChange?.(`${KOLAM_PURCHASE_ORDER_ROOT}/${item.id}`);
            }}
            po={item}
          />
        )}
        rows={controller.orders}
      />

      <KolamDeleteConfirmDialog
        itemLabel={deleteCandidate?.poCode}
        itemType="purchase order"
        visible={Boolean(deleteCandidate)}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={() => {
          const po = deleteCandidate;
          setDeleteCandidate(null);
          if (!po) {
            return;
          }
          void controller.onDeletePO(po);
        }}
      />
    </View>
  );
}

function buildPurchaseOrderListColumns({
  onSelect,
}: {
  onSelect: (po: KolamPurchaseOrder) => void;
}): Array<KolamListTableColumn<KolamPurchaseOrder>> {
  return [
    {
      flex: 1,
      id: 'po',
      label: 'PO',
      render: po => (
        <Pressable onPress={() => onSelect(po)} style={styles.identityCell}>
          <Text numberOfLines={1} style={styles.rowTitle}>
            {po.poCode || '-'}
          </Text>
        </Pressable>
      ),
    },
    {
      align: 'center',
      flex: 1.18,
      id: 'vendor',
      label: 'Pemasok',
      render: po => (
        <Text numberOfLines={2} style={styles.cellText}>
          {po.vendor?.name || '-'}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.52,
      id: 'items',
      label: 'Item',
      render: po => <Text style={styles.numText}>{po.items.length}</Text>,
    },
    {
      align: 'center',
      flex: 0.82,
      id: 'amount',
      label: 'Total',
      render: po => (
        <Text style={styles.numText}>{formatRupiah(po.total)}</Text>
      ),
    },
    {
      align: 'center',
      flex: 0.82,
      id: 'status',
      label: 'Status',
      render: po => (
        <View style={styles.statusCell}>
          <KolamStatusBadge
            intent={getKolamPOStatusIntent(po.status)}
            label={getKolamPOStatusLabel(po.status)}
            style={styles.centerBadge}
          />
          {po.isPartial ? (
            <KolamStatusBadge
              intent="warning"
              label="Sebagian"
              style={styles.centerBadge}
              textStyle={styles.badgeTextSm}
            />
          ) : null}
          <KolamStatusBadge
            intent={getKolamPOPaymentStatusIntent(po.paymentStatus)}
            label={getKolamPOPaymentStatusLabel(po.paymentStatus)}
            style={styles.centerBadge}
            textStyle={styles.badgeTextSm}
          />
        </View>
      ),
    },
    {
      align: 'center',
      flex: 0.82,
      id: 'created',
      label: 'Dibuat',
      render: po => (
        <Text numberOfLines={1} style={styles.cellText}>
          {formatPODateTime(po.createdAt)}
        </Text>
      ),
    },
  ];
}

function KolamPurchaseOrderActionsMenu({
  onDelete,
  onRestore,
  onSelect,
  po,
}: {
  onDelete: () => void;
  onRestore: () => void;
  onSelect: () => void;
  po: KolamPurchaseOrder;
}) {
  const canDelete = po.status === 'draft' || po.status === 'cancelled';
  const canRestore = po.status === 'cancelled';

  return (
    <KolamOverflowMenuButton
      accessibilityLabel={`Menu ${po.poCode || 'purchase order'}`}
      actions={[
        { label: 'Lihat', onPress: onSelect },
        ...(canRestore ? [{ label: 'Kembalikan ke draf', onPress: onRestore }] : []),
        ...(canDelete
          ? [{ label: 'Hapus', onPress: onDelete, tone: 'danger' as const }]
          : []),
      ]}
    />
  );
}

function KolamPurchaseOrderForm({
  controller,
  onRouteChange,
}: {
  controller: KolamPurchaseOrderController;
  onRouteChange?: (route: string) => void;
}) {
  const form = controller.form;
  const vendorLocked = controller.mode === 'edit' && controller.selectedPO?.status === 'sent';
  const contextLabel =
    controller.mode === 'create'
      ? 'PO baru'
      : `Edit · ${controller.selectedPO?.poCode ?? ''}`;

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
                controller.onBackToList();
                onRouteChange?.(KOLAM_PURCHASE_ORDER_ROOT);
              }}
              style={styles.toolbarButton}
            />
          </View>
        </View>
      </View>

      <KolamDetailScrollSurface
        style={styles.formRoot}
        contentContainerStyle={styles.formContent}
      >
      <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
        <Text style={styles.sectionTitle}>Data utama</Text>
        <View style={styles.formSplitRow}>
          <View style={styles.formSplitCell}>
            <FieldShell label="Pemasok" required>
              <KolamDropdownSelect
                accessibilityLabel="Pilih pemasok"
                label="Pemasok"
                onChange={vendorId => {
                  const vendor = controller.vendors.find(item => item.id === vendorId);
                  controller.onChangeForm({ vendorId, vendorName: vendor?.name ?? '' });
                }}
                options={[
                  { label: 'Pilih pemasok…', value: '' },
                  ...controller.vendors.map(vendor => ({ label: vendor.name, value: vendor.id })),
                ]}
                searchable
                searchPlaceholder="Cari pemasok…"
                value={form.vendorId}
                style={vendorLocked ? styles.disabledControl : undefined}
              />
              {vendorLocked ? (
                <Text style={styles.switchHint}>
                  Pemasok tidak bisa diubah setelah PO dikirim.
                </Text>
              ) : null}
            </FieldShell>
          </View>
          <View style={styles.formSplitCell}>
            <FieldShell label="Dompet">
              <KolamDropdownSelect
                accessibilityLabel="Pilih dompet"
                label="Dompet"
                onChange={walletId => controller.onChangeForm({ walletId })}
                options={[
                  { label: 'Tanpa dompet', value: '' },
                  ...controller.walletOptions.map(wallet => ({
                    label: `${wallet.name} (${wallet.type})`,
                    value: wallet.id,
                  })),
                ]}
                value={form.walletId}
              />
            </FieldShell>
          </View>
        </View>

        <View style={styles.formSplitRow}>
          <View style={styles.formSplitCell}>
            <FieldShell label="Ongkos kirim">
              <KolamFormTextField
                mode="numeric"
                onChangeText={shippingCost => controller.onChangeForm({ shippingCost })}
                placeholder="0"
                value={form.shippingCost}
              />
            </FieldShell>
          </View>
          <View style={styles.formSplitCell}>
            <FieldShell label="Diskon">
              <View style={styles.segmentRow}>
                <KolamButton
                  intent={form.discountType === 'percent' ? 'primary' : 'outline'}
                  label="Persen"
                  onPress={() => controller.onChangeForm({ discountType: 'percent' })}
                />
                <KolamButton
                  intent={form.discountType === 'amount' ? 'primary' : 'outline'}
                  label="Nominal"
                  onPress={() => controller.onChangeForm({ discountType: 'amount' })}
                />
              </View>
              <KolamFormTextField
                mode="numeric"
                onChangeText={discountValue => controller.onChangeForm({ discountValue })}
                placeholder="0"
                value={form.discountValue}
              />
            </FieldShell>
          </View>
        </View>

        <FieldShell label="Catatan">
          <KolamFormTextField
            multiline
            onChangeText={notes => controller.onChangeForm({ notes })}
            placeholder="Catatan PO (opsional)"
            style={styles.notesInput}
            value={form.notes}
          />
        </FieldShell>

        {controller.mode === 'create' ? (
          <FieldShell label="Kirim langsung">
            <View style={styles.switchRow}>
              <Text style={styles.switchHint}>
                Aktifkan untuk mengirim PO ke pemasok segera setelah disimpan.
              </Text>
              <KolamSwitch
                active={form.sendImmediately}
                onPress={() =>
                  controller.onChangeForm({ sendImmediately: !form.sendImmediately })
                }
              />
            </View>
          </FieldShell>
        ) : null}
      </KolamContentFrame>

      <KolamPOPaymentConfigCard controller={controller} />

      <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
        <Text style={styles.sectionTitle}>Detail Item</Text>
        <KolamPOItemPicker controller={controller} />
        <KolamPOItemLinesTable controller={controller} />
      </KolamContentFrame>

      <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
        <Text style={styles.sectionTitle}>Ringkasan biaya</Text>
        <KolamDescriptionList
          accessibilityLabel="Ringkasan biaya PO"
          rows={[
            {
              id: 'subtotal',
              label: 'Subtotal',
              value: formatRupiah(controller.breakdown.subtotal),
              meta: `${controller.breakdown.totalQty} qty`,
              tone: 'default',
            },
            {
              id: 'discount',
              label: 'Diskon',
              value: `- ${formatRupiah(controller.breakdown.discountAmount)}`,
              meta: '',
              tone: 'default',
            },
            {
              id: 'shipping',
              label: 'Ongkos kirim',
              value: formatRupiah(Number(form.shippingCost) || 0),
              meta: '',
              tone: 'default',
            },
            {
              id: 'final',
              label: 'Total akhir',
              value: formatRupiah(controller.breakdown.finalTotal),
              meta: '',
              tone: 'success',
            },
          ]}
        />
      </KolamContentFrame>

      <View style={styles.formActions}>
        <KolamCancelButton
          disabled={controller.mutating}
          onPress={() => {
            controller.onBackToList();
            onRouteChange?.(
              controller.selectedPO
                ? `${KOLAM_PURCHASE_ORDER_ROOT}/${controller.selectedPO.id}`
                : KOLAM_PURCHASE_ORDER_ROOT,
            );
          }}
        />
        <KolamSaveButton
          disabled={controller.mutating}
          label={controller.mutating ? 'Menyimpan…' : 'Simpan'}
          onPress={() => {
            void controller.onSave().then(id => {
              if (id) {
                onRouteChange?.(`${KOLAM_PURCHASE_ORDER_ROOT}/${id}`);
              }
            });
          }}
        />
      </View>
      </KolamDetailScrollSurface>
    </View>
  );
}

function KolamPOPaymentConfigCard({ controller }: { controller: KolamPurchaseOrderController }) {
  const form = controller.form;

  return (
    <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
      <Text style={styles.sectionTitle}>Metode pembayaran</Text>
      <View style={styles.segmentRow}>
        {(['cash', 'tempo', 'cicilan'] as const).map(type => (
          <KolamButton
            intent={form.paymentType === type ? 'primary' : 'outline'}
            key={type}
            label={paymentTypeLabel(type)}
            onPress={() => controller.onChangeForm({ paymentType: type })}
          />
        ))}
      </View>

      {form.paymentType === 'tempo' ? (
        <View style={styles.formSplitRow}>
          <View style={styles.formSplitCell}>
            <FieldShell label="Mode tempo">
              <View style={styles.segmentRow}>
                <KolamButton
                  intent={form.tempoMode === 'net_days' ? 'primary' : 'outline'}
                  label="Net days"
                  onPress={() => controller.onChangeForm({ tempoMode: 'net_days' })}
                />
                <KolamButton
                  intent={form.tempoMode === 'specific_date' ? 'primary' : 'outline'}
                  label="Tanggal tertentu"
                  onPress={() => controller.onChangeForm({ tempoMode: 'specific_date' })}
                />
              </View>
            </FieldShell>
          </View>
          <View style={styles.formSplitCell}>
            {form.tempoMode === 'net_days' ? (
              <FieldShell label="Jumlah hari">
                <KolamFormTextField
                  mode="numeric"
                  onChangeText={netDays => controller.onChangeForm({ netDays })}
                  placeholder="30"
                  value={form.netDays}
                />
              </FieldShell>
            ) : (
              <FieldShell label="Tanggal jatuh tempo">
                <KolamDateField
                  label="Tanggal"
                  onChange={specificDate => controller.onChangeForm({ specificDate })}
                  value={form.specificDate}
                />
              </FieldShell>
            )}
          </View>
        </View>
      ) : null}

      {form.paymentType === 'cicilan' ? (
        <FieldShell label="Jumlah cicilan (2–24)">
          <KolamFormTextField
            mode="numeric"
            onChangeText={installmentCount => controller.onChangeForm({ installmentCount })}
            placeholder="2"
            value={form.installmentCount}
          />
        </FieldShell>
      ) : null}

      <FieldShell label="Uang muka (DP)">
        <View style={styles.switchRow}>
          <Text style={styles.switchHint}>
            Aktifkan bila pemasok mensyaratkan uang muka sebelum pelunasan/cicilan.
          </Text>
          <KolamSwitch
            active={form.downPaymentEnabled}
            onPress={() =>
              controller.onChangeForm({ downPaymentEnabled: !form.downPaymentEnabled })
            }
          />
        </View>
      </FieldShell>

      {form.downPaymentEnabled ? (
        <View style={styles.formSplitRow}>
          <View style={styles.formSplitCell}>
            <FieldShell label={form.downPaymentInputType === 'percent' ? 'Nilai DP (%)' : 'Nilai DP (Rp)'}>
              <View style={styles.segmentRow}>
                <KolamButton
                  intent={form.downPaymentInputType === 'percent' ? 'primary' : 'outline'}
                  label="Persen"
                  onPress={() => controller.onChangeForm({ downPaymentInputType: 'percent' })}
                />
                <KolamButton
                  intent={form.downPaymentInputType === 'amount' ? 'primary' : 'outline'}
                  label="Nominal"
                  onPress={() => controller.onChangeForm({ downPaymentInputType: 'amount' })}
                />
              </View>
              <KolamFormTextField
                mode="numeric"
                onChangeText={downPaymentValue => controller.onChangeForm({ downPaymentValue })}
                placeholder="0"
                value={form.downPaymentValue}
              />
            </FieldShell>
          </View>
          <View style={styles.formSplitCell}>
            <FieldShell label="Jatuh tempo DP">
              <KolamDateField
                label="Tanggal"
                onChange={downPaymentDueDate =>
                  controller.onChangeForm({ downPaymentDueDate })
                }
                value={form.downPaymentDueDate}
              />
            </FieldShell>
          </View>
        </View>
      ) : null}
    </KolamContentFrame>
  );
}

function KolamPOItemPicker({ controller }: { controller: KolamPurchaseOrderController }) {
  const [type, setType] = React.useState<'all' | 'product' | 'species' | 'packing'>('all');
  const [search, setSearch] = React.useState('');
  const [pendingVariantItem, setPendingVariantItem] =
    React.useState<KolamPOItemForSelection | null>(null);

  React.useEffect(() => {
    const handle = setTimeout(() => {
      void controller.onSearchItemsForPO({ search, type });
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, type]);

  const results: KolamPOItemForSelection[] = [
    ...(type === 'all' || type === 'product' ? controller.itemPickerResult.products : []),
    ...(type === 'all' || type === 'species' ? controller.itemPickerResult.species : []),
    ...(type === 'all' || type === 'packing' ? controller.itemPickerResult.packings : []),
  ];

  return (
    <View style={styles.itemPicker}>
      <View style={styles.filterRowInline}>
        <KolamFormTextField
          onChangeText={setSearch}
          placeholder="Cari produk / species / packing…"
          style={styles.searchInput}
          value={search}
        />
        <KolamDropdownSelect
          accessibilityLabel="Tipe item"
          label="Tipe"
          onChange={value => setType(value as typeof type)}
          options={[
            { label: 'Semua', value: 'all' },
            { label: 'Produk', value: 'product' },
            { label: 'Species', value: 'species' },
            { label: 'Packing', value: 'packing' },
          ]}
          value={type}
        />
      </View>
      <View style={styles.itemResultList}>
        {controller.itemPickerLoading ? (
          <Text style={styles.metaText}>Memuat item…</Text>
        ) : results.length ? (
          results.map(item => (
            <View key={`${item.itemType}-${item.id}`} style={styles.itemResultRow}>
              <KolamCopyStack
                containerStyle={styles.itemResultCopy}
                items={[
                  { id: 'title', text: item.title, style: styles.rowTitle },
                  {
                    id: 'meta',
                    text: [item.sku, item.commonName].filter(Boolean).join(' · ') || '—',
                    style: styles.rowMeta,
                  },
                ]}
              />
              <Text style={styles.numText}>{formatRupiah(item.price)}</Text>
              {item.variants.length ? (
                <KolamButton
                  label="Pilih varian"
                  onPress={() => setPendingVariantItem(item)}
                />
              ) : (
                <KolamButton
                  intent="primary"
                  label="Tambah"
                  onPress={() => controller.onAddItemLine(item, null)}
                />
              )}
            </View>
          ))
        ) : (
          <Text style={styles.metaText}>Tidak ada hasil.</Text>
        )}
      </View>

      {pendingVariantItem ? (
        <View style={styles.variantPickerPanel}>
          <Text style={styles.sectionTitle}>Pilih varian — {pendingVariantItem.title}</Text>
          {pendingVariantItem.variants.map((variant: KolamPOItemForSelectionVariant) => (
            <KolamButton
              key={variant.id}
              label={`${
                [variant.tier1Value, variant.tier2Value].filter(Boolean).join(' / ') ||
                variant.sku ||
                'Varian'
              } · ${formatRupiah(variant.price)}`}
              onPress={() => {
                controller.onAddItemLine(pendingVariantItem, variant);
                setPendingVariantItem(null);
              }}
              style={styles.filterPanelOption}
            />
          ))}
          <KolamCancelButton onPress={() => setPendingVariantItem(null)} />
        </View>
      ) : null}
    </View>
  );
}

function KolamPOItemLinesTable({ controller }: { controller: KolamPurchaseOrderController }) {
  const columns = React.useMemo(
    () => buildPOFormItemColumns(controller),
    [controller],
  );

  return (
    <KolamListTableComposition
      columns={columns}
      emptyTitle="Belum ada item ditambahkan."
      getRowKey={item => item.key}
      rows={controller.form.items}
      showFooter={false}
      style={styles.poItemsTable}
    />
  );
}

function buildPOFormItemColumns(
  controller: KolamPurchaseOrderController,
): Array<KolamListTableColumn<KolamPOFormLineItem>> {
  return [
    {
      flex: 1.3,
      id: 'item',
      label: 'Item',
      render: item => (
        <View style={styles.identityCell}>
          <Text numberOfLines={2} style={styles.rowTitle}>
            {item.title || '—'}
          </Text>
        </View>
      ),
    },
    {
      align: 'center',
      flex: 0.8,
      id: 'sku',
      label: 'SKU',
      render: item => (
        <Text numberOfLines={2} style={styles.cellText}>
          {item.sku || '—'}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'variant',
      label: 'Varian',
      render: item => (
        <Text numberOfLines={2} style={styles.cellText}>
          {item.variantLabel || '—'}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.74,
      id: 'quantity',
      label: 'Qty',
      render: item => (
        <KolamFormTextField
          mode="numeric"
          onChangeText={quantity =>
            controller.onChangeItemLine(item.key, { quantity })
          }
          style={styles.qtyInput}
          value={item.quantity}
        />
      ),
    },
    {
      align: 'center',
      flex: 0.62,
      id: 'unit',
      label: 'Satuan',
      render: item => <Text style={styles.cellText}>{item.unitLabel || '—'}</Text>,
    },
    {
      align: 'center',
      flex: 0.95,
      id: 'unitPrice',
      label: 'Harga Satuan',
      render: item => (
        <KolamFormTextField
          mode="numeric"
          onChangeText={value =>
            controller.onChangeItemLine(item.key, {
              unitPrice: Number(value) || 0,
            })
          }
          style={styles.priceInput}
          value={String(item.unitPrice)}
        />
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'subtotal',
      label: 'Subtotal',
      render: item => (
        <Text style={styles.numText}>
          {formatRupiah((Number(item.quantity) || 0) * item.unitPrice)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.62,
      id: 'actions',
      label: 'Aksi',
      render: item => (
        <KolamButton
          intent="danger"
          label="Hapus"
          onPress={() => controller.onRemoveItemLine(item.key)}
        />
      ),
    },
  ];
}

/* ──────────────────────────────────────────
   Detail (Fase 3–6)
   ──────────────────────────────────────────*/

function KolamPurchaseOrderDetail({
  controller,
  onRouteChange,
}: {
  controller: KolamPurchaseOrderController;
  onRouteChange?: (route: string) => void;
}) {
  const { authUser } = useKolamAuthContext();
  const po = controller.selectedPO;
  const [activeDialog, setActiveDialog] = React.useState<
    'receive' | 'check' | 'editCheck' | 'marketplace' | null
  >(null);
  const [pendingSimpleTransition, setPendingSimpleTransition] = React.useState<
    Exclude<KolamPOStatus, 'received' | 'on_check' | 'sent'> | null
  >(null);
  const itemColumns = React.useMemo(
    () => buildPODetailItemColumns({ onRouteChange }),
    [onRouteChange],
  );

  if (!po && controller.loading) {
    return (
      <View style={styles.placeholder}>
        <KolamEmptyState compact message="Mengambil data purchase order." title="Memuat detail…" />
      </View>
    );
  }

  if (!po) {
    return (
      <View style={styles.placeholder}>
        <KolamEmptyState
          compact
          message="Purchase order tidak ditemukan atau gagal dimuat."
          title="Detail tidak tersedia"
        />
        <KolamButton
          label="Kembali ke daftar"
          onPress={() => {
            controller.onBackToList();
            onRouteChange?.(KOLAM_PURCHASE_ORDER_ROOT);
          }}
        />
      </View>
    );
  }

  const allowedNext = filterPoStatusOptions(
    po.status,
    getAllowedNextPOStatuses(po.status),
    authUser?.permissions,
    authUser?.roleKey,
    { isPartial: po.isPartial },
  );
  const canEdit =
    (po.status === 'draft' || po.status === 'sent') &&
    hasKolamPurchaseOrderPermission(authUser?.permissions, 'update', authUser?.roleKey);
  const canSyncMarketplace = po.status === 'received' || po.status === 'completed';
  const canUploadVendorInvoice =
    isKolamPOStatus(po.status) &&
    PO_VENDOR_INVOICE_UPLOAD_STATUSES.includes(po.status);

  const handleTransitionPress = (next: string) => {
    if (next === 'received') {
      setActiveDialog('receive');
      return;
    }
    if (next === 'on_check') {
      setActiveDialog('check');
      return;
    }
    if (next === 'cancelled' || next === 'rejected') {
      setPendingSimpleTransition(next);
      return;
    }
    if (next === 'completed' && po.paymentStatus !== 'paid') {
      setPendingSimpleTransition('completed');
      return;
    }
    if (next === 'sent' || next === 'delivery' || next === 'draft' || next === 'completed') {
      void controller.onUpdateStatus({ status: next });
    }
  };

  return (
    <View style={styles.detailSurface}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <Text numberOfLines={1} style={styles.detailToolbarContext}>
              {po.poCode || 'Purchase order'}
            </Text>
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamDaftarButton
              onPress={() => {
                controller.onBackToList();
                onRouteChange?.(KOLAM_PURCHASE_ORDER_ROOT);
              }}
              style={styles.toolbarButton}
            />
            {canEdit ? (
              <KolamEditButton
                onPress={() => {
                  if (controller.onEdit()) {
                    onRouteChange?.(`${KOLAM_PURCHASE_ORDER_ROOT}/${po.id}/edit`);
                  }
                }}
                style={styles.toolbarButton}
              />
            ) : null}
            <KolamPdfDownloadButton
              disabled={controller.exporting}
              label="PDF"
              loading={controller.exporting}
              loadingLabel="Mengekspor…"
              onPress={() => void controller.onExportPdf()}
              style={styles.toolbarButton}
            />
            {canUploadVendorInvoice ? (
              <KolamButton
                disabled={controller.mutating}
                label={po.vendorInvoice ? 'Ganti invoice vendor' : 'Unggah invoice vendor'}
                onPress={async () => {
                  const uri = await controller.onPickImage();
                  if (uri) {
                    void controller.onUploadVendorInvoice(uri);
                  }
                }}
                style={styles.toolbarButton}
              />
            ) : null}
            {canSyncMarketplace ? (
              <KolamButton
                label="Sinkron marketplace"
                onPress={() => setActiveDialog('marketplace')}
                style={styles.toolbarButton}
              />
            ) : null}
            {po.status === 'cancelled' ? (
              <KolamButton
                label="Kembalikan ke draf"
                onPress={() => void controller.onRestoreToDraft()}
                style={styles.toolbarButton}
              />
            ) : null}
            {allowedNext.map(next => (
              <KolamButton
                intent="primary"
                key={next}
                label={getKolamPOStatusLabel(next)}
                onPress={() => handleTransitionPress(next)}
                style={styles.toolbarButton}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.formSplitRow}>
        <View style={[styles.formSplitCell, styles.detailSplitCell]}>
          <KolamContentFrame
            style={[styles.detailCard, styles.detailSplitCard]}
            variant="settingsWebConfig"
          >
            <Text style={styles.sectionTitle}>Informasi purchase order</Text>
            <KolamDescriptionList
              accessibilityLabel="Informasi purchase order"
              rows={[
                { id: 'code', label: 'Kode PO', value: po.poCode || '—', meta: '', tone: 'default' },
                {
                  id: 'vendor',
                  label: 'Pemasok',
                  value: po.vendor?.name || '—',
                  meta: '',
                  tone: 'default',
                  ...(po.vendor?.id
                    ? {
                        onPress: () =>
                          onRouteChange?.(`${KOLAM_SUPPLIER_ROOT}/${po.vendor!.id}`),
                      }
                    : {}),
                },
                {
                  id: 'wallet',
                  label: 'Dompet',
                  value: po.wallet?.name || '—',
                  meta: po.wallet?.type || '',
                  tone: 'default',
                },
                {
                  id: 'status',
                  label: 'Status',
                  value: getKolamPOStatusLabel(po.status),
                  meta: po.isPartial ? 'Partial' : '',
                  tone: po.isPartial ? 'warning' : 'default',
                },
                {
                  id: 'notes',
                  label: 'Catatan',
                  value: po.notes || '—',
                  meta: '',
                  tone: 'default',
                },
                {
                  id: 'created',
                  label: 'Dibuat',
                  value: formatPODateTime(po.createdAt),
                  meta: po.createdByName || '',
                  tone: 'default',
                },
              ]}
            />
          </KolamContentFrame>
        </View>

        <View style={[styles.formSplitCell, styles.detailSplitCell]}>
          <KolamContentFrame
            style={[styles.detailCard, styles.detailSplitCard]}
            variant="settingsWebConfig"
          >
            <Text style={styles.sectionTitle}>Timeline pengadaan</Text>
            <KolamDescriptionList
              accessibilityLabel="Timeline pengadaan"
              rows={[
                { id: 'ordered', label: 'Dipesan', value: formatPODateTime(po.orderedAt), meta: '', tone: 'default' },
                { id: 'delivery', label: 'Pengiriman', value: formatPODateTime(po.deliveryAt), meta: '', tone: 'default' },
                { id: 'received', label: 'Diterima', value: formatPODateTime(po.receivedAt), meta: po.receivedByName || '', tone: 'default' },
                { id: 'checked', label: 'Diperiksa', value: formatPODateTime(po.onCheckAt), meta: po.checkedByName || '', tone: 'default' },
                { id: 'completed', label: 'Selesai', value: formatPODateTime(po.completedAt), meta: '', tone: 'default' },
                { id: 'cancelled', label: 'Dibatalkan', value: formatPODateTime(po.cancelledAt), meta: '', tone: 'default' },
              ]}
            />
            {po.vendorInvoice ? (
              <ProofImageRow label="Invoice vendor" uri={po.vendorInvoice} />
            ) : null}
          </KolamContentFrame>
        </View>
      </View>

      <View style={styles.formSplitRow}>
        <View style={[styles.formSplitCell, styles.detailSplitCell]}>
          <KolamContentFrame
            style={[styles.detailCard, styles.detailSplitCard, styles.proofBorderCard]}
            variant="settingsWebConfig"
          >
            <Text style={styles.sectionTitle}>Ringkasan biaya</Text>
            <KolamDescriptionList
              accessibilityLabel="Ringkasan biaya PO"
              rows={[
                { id: 'total', label: 'Total', value: formatRupiah(po.total), meta: '', tone: 'default' },
                { id: 'shipping', label: 'Ongkos kirim', value: formatRupiah(po.shippingCost), meta: '', tone: 'default' },
                {
                  id: 'discount',
                  label: 'Diskon',
                  value: po.discount ? `${po.discount.value}${po.discount.type === 'percent' ? '%' : ''}` : '—',
                  meta: '',
                  tone: 'default',
                },
                { id: 'final', label: 'Total akhir', value: formatRupiah(po.finalTotal), meta: '', tone: 'success' },
                {
                  id: 'actual',
                  label: 'Total aktual (setelah cek)',
                  value: po.actualTotal ? formatRupiah(po.actualTotal) : '—',
                  meta: '',
                  tone: 'default',
                },
              ]}
            />
          </KolamContentFrame>
        </View>

        <View style={[styles.formSplitCell, styles.detailSplitCell]}>
          <KolamPOPaymentSection controller={controller} po={po} />
        </View>
      </View>

      <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
        <View style={styles.itemsHeaderRow}>
          <Text style={styles.sectionTitle}>Detail Item</Text>
          {po.status === 'on_check' ? (
            <KolamButton
              label="Edit jumlah diterima"
              onPress={() => setActiveDialog('editCheck')}
            />
          ) : null}
        </View>
        <KolamListTableComposition
          columns={itemColumns}
          emptyTitle="Belum ada item pada purchase order ini."
          getRowKey={(item, index) =>
            item.id || `${item.itemType}-${item.refId}-${index}`
          }
          rows={po.items}
          showFooter={false}
          style={styles.poItemsTable}
        />
      </KolamContentFrame>

      <KolamPOProofsCard po={po} />
      <KolamPOInstallmentSection controller={controller} po={po} />
      <KolamPOFakturPajakSection controller={controller} po={po} />

      {activeDialog === 'receive' ? (
        <KolamPOReceiveDialog controller={controller} onClose={() => setActiveDialog(null)} />
      ) : null}
      {activeDialog === 'check' ? (
        <KolamPOCheckDialog
          controller={controller}
          onClose={() => setActiveDialog(null)}
          po={po}
        />
      ) : null}
      {activeDialog === 'editCheck' ? (
        <KolamPOEditCheckItemsDialog
          controller={controller}
          onClose={() => setActiveDialog(null)}
          po={po}
        />
      ) : null}
      {activeDialog === 'marketplace' ? (
        <KolamPOMarketplaceSyncPanel controller={controller} onClose={() => setActiveDialog(null)} />
      ) : null}

      <KolamConfirmDialog
        cancelLabel="Batal"
        confirmLabel={
          pendingSimpleTransition === 'completed' ? 'Tetap selesaikan' : 'Ya, lanjutkan'
        }
        destructive={pendingSimpleTransition === 'cancelled' || pendingSimpleTransition === 'rejected'}
        message={
          pendingSimpleTransition === 'completed'
            ? 'Pembayaran PO ini belum lunas. Selesaikan PO tetap sekarang?'
            : `Ubah status PO menjadi "${getKolamPOStatusLabel(pendingSimpleTransition || '')}"? Tindakan ini tidak bisa dibatalkan begitu saja.`
        }
        onCancel={() => setPendingSimpleTransition(null)}
        onConfirm={() => {
          const next = pendingSimpleTransition;
          setPendingSimpleTransition(null);
          if (next) {
            void controller.onUpdateStatus({ status: next });
          }
        }}
        title="Konfirmasi perubahan status"
        visible={Boolean(pendingSimpleTransition)}
      />
    </View>
  );
}

function buildPODetailItemColumns({
  onRouteChange,
}: {
  onRouteChange?: (route: string) => void;
}): Array<KolamListTableColumn<KolamPurchaseOrderItem>> {
  return [
    {
      flex: 1.25,
      id: 'item',
      label: 'Produk',
      render: item => {
        const href = getKolamPOItemHref(item);
        return (
          <Pressable
            disabled={!href}
            onPress={() => {
              if (href) {
                onRouteChange?.(href);
              }
            }}
            style={styles.identityCell}
          >
            <Text numberOfLines={2} style={styles.rowTitle}>
              {getKolamPOItemDisplayTitle(item)}
            </Text>
          </Pressable>
        );
      },
    },
    {
      align: 'center',
      flex: 0.85,
      id: 'code',
      label: 'SKU / Kode',
      render: item => (
        <Text numberOfLines={2} style={styles.cellText}>
          {getKolamPOItemCode(item)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'variant',
      label: 'Varian',
      render: item => (
        <Text numberOfLines={2} style={styles.cellText}>
          {getKolamPOItemVariantLabel(item.variant)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.62,
      id: 'quantity',
      label: 'Jumlah',
      render: item => <Text style={styles.numText}>{item.quantity}</Text>,
    },
    {
      align: 'center',
      flex: 0.62,
      id: 'unit',
      label: 'Satuan',
      render: item => (
        <Text style={styles.cellText}>{getKolamPOItemUnitLabel(item)}</Text>
      ),
    },
    {
      align: 'center',
      flex: 0.95,
      id: 'unitPrice',
      label: 'Harga Satuan',
      render: item => <Text style={styles.numText}>{formatRupiah(item.unitPrice)}</Text>,
    },
    {
      align: 'center',
      flex: 0.72,
      id: 'received',
      label: 'Diterima',
      render: item => (
        <Text style={styles.numText}>
          {item.receivedQuantity != null ? item.receivedQuantity : '—'}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.95,
      id: 'total',
      label: 'Total',
      render: item => <Text style={styles.numText}>{formatRupiah(item.lineTotal)}</Text>,
    },
  ];
}

function KolamPOProofsCard({ po }: { po: KolamPurchaseOrder }) {
  const showCard = Boolean(po.receivedAt || po.onCheckAt || po.isPartial);
  if (!showCard) {
    return null;
  }

  return (
    <View style={styles.proofSection}>
      <Text style={styles.sectionTitle}>Penerimaan & Pemeriksaan</Text>

      <View style={styles.formSplitRow}>
        <View style={[styles.formSplitCell, styles.detailSplitCell]}>
          <KolamContentFrame
            style={[styles.detailCard, styles.detailSplitCard, styles.proofBorderCard]}
            variant="settingsWebConfig"
          >
            <Text style={styles.sectionTitle}>Penerimaan</Text>
            <KolamDescriptionList
              accessibilityLabel="Penerimaan barang"
              rows={[
                {
                  id: 'receivedAt',
                  label: 'Diterima Pada',
                  value: formatPODateTime(po.receivedAt),
                  meta: '',
                  tone: 'default',
                },
                {
                  id: 'receivedBy',
                  label: 'Diterima Oleh',
                  value: po.receivedByName || '—',
                  meta: '',
                  tone: 'default',
                },
              ]}
            />
            {po.receiveProofs.length ? (
              <ProofGallery label="Bukti Penerimaan" paths={po.receiveProofs} />
            ) : null}
          </KolamContentFrame>
        </View>

        <View style={[styles.formSplitCell, styles.detailSplitCell]}>
          <KolamContentFrame
            style={[styles.detailCard, styles.detailSplitCard, styles.proofBorderCard]}
            variant="settingsWebConfig"
          >
            <Text style={styles.sectionTitle}>Pemeriksaan</Text>
            <KolamDescriptionList
              accessibilityLabel="Pemeriksaan barang"
              rows={[
                {
                  id: 'checkedAt',
                  label: 'Diperiksa Pada',
                  value: formatPODateTime(po.onCheckAt),
                  meta: '',
                  tone: 'default',
                },
                {
                  id: 'checkedBy',
                  label: 'Diperiksa Oleh',
                  value: po.checkedByName || '—',
                  meta: '',
                  tone: 'default',
                },
              ]}
            />
            {po.checkProofs.length ? (
              <ProofGallery label="Bukti Pemeriksaan" paths={po.checkProofs} />
            ) : null}
          </KolamContentFrame>
        </View>
      </View>

      {po.isPartial ? (
        <View style={styles.partialNoteBox}>
          <Text style={styles.partialNoteTitle}>Catatan Sebagian</Text>
          <Text style={styles.partialNoteBody}>{po.partialNote || '—'}</Text>
          {po.partialProofUploadedAt ? (
            <Text style={styles.metaText}>
              Dicatat {formatPODateTime(po.partialProofUploadedAt)}
            </Text>
          ) : null}
          {po.partialProofs.length ? (
            <ProofGallery
              label="Foto bukti sebagian"
              paths={po.partialProofs}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function ProofGallery({
  label,
  paths,
}: {
  label: string;
  paths: string[];
}) {
  return (
    <View style={styles.proofGroup}>
      <Text style={styles.rowMeta}>{label}</Text>
      <View style={styles.photoGrid}>
        {paths.map((path, index) => {
          const uri = getKolamFileUrl(path) ?? path;
          return (
            <KolamRemoteImage
              key={`${label}-${path}-${index}`}
              accessibilityLabel={`${label} ${index + 1}`}
              resizeMode="cover"
              sourceUri={uri}
              style={styles.photoThumb}
            />
          );
        })}
      </View>
    </View>
  );
}

function ProofImageRow({ label, uri }: { label: string; uri: string }) {
  const resolved = getKolamFileUrl(uri) ?? uri;
  return (
    <View style={styles.proofGroup}>
      <Text style={styles.rowMeta}>{label}</Text>
      <KolamRemoteImage
        accessibilityLabel={label}
        resizeMode="cover"
        sourceUri={resolved}
        style={styles.photoThumb}
      />
    </View>
  );
}

function KolamPOPaymentSection({
  controller,
  po,
}: {
  controller: KolamPurchaseOrderController;
  po: KolamPurchaseOrder;
}) {
  const downPayment = po.paymentConfig?.downPayment;

  return (
    <KolamContentFrame
      style={[styles.detailCard, styles.detailSplitCard, styles.proofBorderCard]}
      variant="settingsWebConfig"
    >
      <Text style={styles.sectionTitle}>Pembayaran</Text>
      <KolamDescriptionList
        accessibilityLabel="Detail pembayaran PO"
        rows={[
          {
            id: 'status',
            label: 'Status bayar',
            value: getKolamPOPaymentStatusLabel(po.paymentStatus),
            meta: '',
            tone: getKolamDescriptionTone(getKolamPOPaymentStatusIntent(po.paymentStatus)),
          },
          {
            id: 'amount',
            label: 'Jumlah dibayar',
            value: formatRupiah(po.paymentAmount),
            meta: po.paidAt ? `${po.paidByName || ''} · ${formatPODateTime(po.paidAt)}` : '',
            tone: 'default',
          },
          {
            id: 'refund',
            label: 'Status refund',
            value: getKolamPORefundStatusLabel(po.refundStatus),
            meta: po.refundStatus !== 'none' ? formatRupiah(po.refundAmount) : '',
            tone: getKolamDescriptionTone(getKolamPORefundStatusIntent(po.refundStatus)),
          },
        ]}
      />

      {downPayment?.enabled ? (
        <View style={styles.proofGroup}>
          <Text style={styles.rowMeta}>
            Uang muka (DP): {formatRupiah(downPayment.amount)}
            {downPayment.paidAt ? ` · dibayar ${formatPODateTime(downPayment.paidAt)}` : ' · belum dibayar'}
          </Text>
        </View>
      ) : null}

      <View style={styles.headerActions}>
        {po.paymentStatus !== 'paid' ? (
          <KolamButton
            disabled={controller.mutating}
            intent="primary"
            label="Tandai lunas"
            onPress={async () => {
              const uri = await controller.onPickImage();
              if (uri) {
                void controller.onPay(uri);
              }
            }}
          />
        ) : null}
        {downPayment?.enabled && !downPayment.paidAt ? (
          <KolamButton
            disabled={controller.mutating}
            label="Bayar DP"
            onPress={async () => {
              const uri = await controller.onPickImage();
              if (uri) {
                void controller.onPayDP(uri);
              }
            }}
          />
        ) : null}
        {po.refundStatus === 'pending' ? (
          <KolamButton
            disabled={controller.mutating}
            label="Konfirmasi refund"
            onPress={async () => {
              const uri = await controller.onPickImage();
              if (uri) {
                void controller.onConfirmRefund(uri);
              }
            }}
          />
        ) : null}
        {po.paymentProof ? (
          <KolamButton
            disabled={controller.mutating}
            label="Ganti bukti bayar"
            onPress={async () => {
              const uri = await controller.onPickImage();
              if (uri) {
                void controller.onReplacePaymentProof(uri);
              }
            }}
          />
        ) : null}
        {po.refundProof ? (
          <KolamButton
            disabled={controller.mutating}
            label="Ganti bukti refund"
            onPress={async () => {
              const uri = await controller.onPickImage();
              if (uri) {
                void controller.onReplaceRefundProof(uri);
              }
            }}
          />
        ) : null}
      </View>

      {po.paymentProof ? <ProofImageRow label="Bukti pembayaran" uri={po.paymentProof} /> : null}
      {po.refundProof ? <ProofImageRow label="Bukti refund" uri={po.refundProof} /> : null}
    </KolamContentFrame>
  );
}

function KolamPOInstallmentSection({
  controller,
  po,
}: {
  controller: KolamPurchaseOrderController;
  po: KolamPurchaseOrder;
}) {
  const schedule = po.paymentConfig?.schedule ?? [];
  if (!schedule.length) {
    return null;
  }

  return (
    <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
      <Text style={styles.sectionTitle}>Cicilan</Text>
      {controller.payableInstallmentsLoading ? (
        <Text style={styles.metaText}>Memuat cicilan…</Text>
      ) : null}
      {schedule.map((row, index) => {
        const installment =
          controller.payableInstallments.find(
            item => item.installmentNumber === row.installmentNumber,
          ) ?? controller.payableInstallments[index] ?? null;
        const paid = installment?.status === 'paid';
        return (
          <View key={row.installmentNumber} style={styles.installmentRow}>
            <KolamCopyStack
              containerStyle={styles.lineInfo}
              items={[
                {
                  id: 'title',
                  text: `Cicilan #${row.installmentNumber}`,
                  style: styles.rowTitle,
                },
                {
                  id: 'meta',
                  text: `${formatRupiah(row.amount)} · jatuh tempo ${formatPODate(row.dueDate)}`,
                  style: styles.rowMeta,
                },
              ]}
            />
            <KolamStatusBadge
              intent={paid ? 'success' : 'warning'}
              label={paid ? 'Lunas' : 'Belum bayar'}
            />
            {!paid && installment ? (
              <KolamButton
                disabled={controller.mutating}
                label="Bayar"
                onPress={async () => {
                  const uri = await controller.onPickImage();
                  if (uri) {
                    void controller.onPayInstallment(installment.id, [uri]);
                  }
                }}
              />
            ) : null}
          </View>
        );
      })}
    </KolamContentFrame>
  );
}

function KolamPOFakturPajakSection({
  controller,
  po,
}: {
  controller: KolamPurchaseOrderController;
  po: KolamPurchaseOrder;
}) {
  const [serialNumber, setSerialNumber] = React.useState(
    po.taxFaktur?.serialNumber ?? '',
  );
  const [status, setStatus] = React.useState<
    'none' | 'draft' | 'issued' | 'cancelled'
  >((po.taxFaktur?.status as 'none' | 'draft' | 'issued' | 'cancelled') || 'none');
  const [vendorNpwp, setVendorNpwp] = React.useState(
    po.taxFaktur?.vendorNpwp ?? '',
  );
  const [vendorName, setVendorName] = React.useState(
    po.taxFaktur?.vendorName || po.vendor?.name || '',
  );
  const [notes, setNotes] = React.useState(po.taxFaktur?.notes ?? '');

  React.useEffect(() => {
    setSerialNumber(po.taxFaktur?.serialNumber ?? '');
    setStatus(
      (po.taxFaktur?.status as 'none' | 'draft' | 'issued' | 'cancelled') ||
        'none',
    );
    setVendorNpwp(po.taxFaktur?.vendorNpwp ?? '');
    setVendorName(po.taxFaktur?.vendorName || po.vendor?.name || '');
    setNotes(po.taxFaktur?.notes ?? '');
  }, [po.id, po.taxFaktur, po.vendor?.name]);

  return (
    <KolamContentFrame
      style={[styles.detailCard, styles.proofBorderCard]}
      variant="settingsWebConfig"
    >
      <View style={styles.itemsHeaderRow}>
        <Text style={styles.sectionTitle}>Faktur Pajak</Text>
        <KolamButton
          disabled={controller.mutating}
          intent="primary"
          label="Simpan faktur"
          onPress={() =>
            void controller.onSaveFakturPajak({
              serialNumber,
              status,
              vendorNpwp,
              vendorName,
              notes,
            })
          }
          size="sm"
        />
      </View>
      <Text style={styles.metaText}>
        Catatan internal DJP (bukan e-Faktur Coretax).
      </Text>
      <FieldShell label="Nomor seri faktur">
        <KolamFormTextField
          onChangeText={setSerialNumber}
          placeholder="Nomor seri faktur"
          value={serialNumber}
        />
      </FieldShell>
      <FieldShell label="Status faktur">
        <KolamDropdownSelect
          label="Status faktur"
          onChange={value =>
            setStatus(value as 'none' | 'draft' | 'issued' | 'cancelled')
          }
          options={[
            { label: 'Belum ada', value: 'none' },
            { label: 'Draft', value: 'draft' },
            { label: 'Terbit', value: 'issued' },
            { label: 'Batal', value: 'cancelled' },
          ]}
          value={status}
        />
      </FieldShell>
      <FieldShell label="NPWP vendor">
        <KolamFormTextField
          onChangeText={setVendorNpwp}
          placeholder="NPWP vendor"
          value={vendorNpwp}
        />
      </FieldShell>
      <FieldShell label="Nama vendor (faktur)">
        <KolamFormTextField
          onChangeText={setVendorName}
          placeholder="Nama vendor pada faktur"
          value={vendorName}
        />
      </FieldShell>
      <FieldShell label="Catatan">
        <KolamFormTextField
          onChangeText={setNotes}
          placeholder="Catatan faktur"
          value={notes}
        />
      </FieldShell>
    </KolamContentFrame>
  );
}

function KolamPOReceiveDialog({
  controller,
  onClose,
}: {
  controller: KolamPurchaseOrderController;
  onClose: () => void;
}) {
  const [proofUris, setProofUris] = React.useState<string[]>([]);

  return (
    <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
      <Text style={styles.sectionTitle}>Tandai diterima</Text>
      <Text style={styles.metaText}>Tambahkan foto bukti penerimaan barang (opsional).</Text>
      <View style={styles.headerActions}>
        <KolamButton
          label="Tambah foto"
          onPress={async () => {
            const uri = await controller.onPickImage();
            if (uri) {
              setProofUris(current => [...current, uri]);
            }
          }}
        />
      </View>
      {proofUris.length ? (
        <View style={styles.photoGrid}>
          {proofUris.map((uri, index) => (
            <View key={`${uri}-${index}`} style={styles.photoItem}>
              <Image resizeMode="cover" source={{ uri: toLocalImageUri(uri) }} style={styles.photoThumb} />
              <KolamButton
                label="Hapus"
                onPress={() => setProofUris(current => current.filter((_, i) => i !== index))}
              />
            </View>
          ))}
        </View>
      ) : null}
      <View style={styles.headerActions}>
        <KolamCancelButton onPress={onClose} />
        <KolamButton
          disabled={controller.mutating}
          intent="primary"
          label={controller.mutating ? 'Menyimpan…' : 'Konfirmasi diterima'}
          onPress={() => {
            void controller.onReceivePO(proofUris).then(ok => {
              if (ok) {
                onClose();
              }
            });
          }}
        />
      </View>
    </KolamContentFrame>
  );
}

function KolamPOCheckDialog({
  controller,
  onClose,
  po,
}: {
  controller: KolamPurchaseOrderController;
  onClose: () => void;
  po: KolamPurchaseOrder;
}) {
  const [actuals, setActuals] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(
      po.items.map(item => [item.id, String(item.receivedQuantity ?? item.quantity)]),
    ),
  );
  const [checkProofUris, setCheckProofUris] = React.useState<string[]>([]);
  const [partialNote, setPartialNote] = React.useState(po.partialNote || '');
  const [partialProofUris, setPartialProofUris] = React.useState<string[]>([]);

  const isPartial = po.items.some(
    item => Number(actuals[item.id] ?? item.quantity) !== item.quantity,
  );

  const buildItems = (): KolamPOCheckItemInput[] =>
    po.items.map(item => buildCheckItemInput(item, Number(actuals[item.id]) || 0));

  return (
    <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
      <Text style={styles.sectionTitle}>Pemeriksaan barang</Text>
      {po.items.map(item => (
        <View key={item.id} style={styles.checkItemRow}>
          <KolamCopyStack
            containerStyle={styles.lineInfo}
            items={[
              {
                id: 'title',
                text: getKolamPOItemDisplayTitle(item),
                style: styles.rowTitle,
              },
              {
                id: 'meta',
                text: [
                  getKolamPOItemCode(item),
                  getKolamPOItemVariantLabel(item.variant),
                  `Dipesan ${item.quantity} ${getKolamPOItemUnitLabel(item)}`,
                ]
                  .filter(part => part && part !== '—')
                  .join(' · '),
                style: styles.rowMeta,
              },
            ]}
          />
          <KolamFormTextField
            mode="numeric"
            onChangeText={value => setActuals(current => ({ ...current, [item.id]: value }))}
            style={styles.qtyInput}
            value={actuals[item.id] ?? ''}
          />
        </View>
      ))}
      <View style={styles.headerActions}>
        <KolamButton
          label="Tambah foto pemeriksaan"
          onPress={async () => {
            const uri = await controller.onPickImage();
            if (uri) {
              setCheckProofUris(current => [...current, uri]);
            }
          }}
        />
      </View>
      {checkProofUris.length ? (
        <View style={styles.photoGrid}>
          {checkProofUris.map((uri, index) => (
            <Image
              key={`${uri}-${index}`}
              resizeMode="cover"
              source={{ uri: toLocalImageUri(uri) }}
              style={styles.photoThumb}
            />
          ))}
        </View>
      ) : null}

      {isPartial ? (
        <View style={styles.proofGroup}>
          <Text style={styles.metaText}>
            Kuantitas hasil cek berbeda dari pesanan — akan ditandai sebagai partial.
          </Text>
          <KolamFormTextField
            multiline
            onChangeText={setPartialNote}
            placeholder="Catatan partial"
            value={partialNote}
          />
          <KolamButton
            label="Tambah foto partial"
            onPress={async () => {
              const uri = await controller.onPickImage();
              if (uri) {
                setPartialProofUris(current => [...current, uri]);
              }
            }}
          />
        </View>
      ) : null}

      <View style={styles.headerActions}>
        <KolamCancelButton onPress={onClose} />
        <KolamButton
          disabled={controller.mutating}
          intent="primary"
          label={controller.mutating ? 'Menyimpan…' : 'Konfirmasi pemeriksaan'}
          onPress={() => {
            void controller
              .onCheckPO({
                items: buildItems(),
                localCheckProofUris: checkProofUris,
                partialNote: isPartial ? partialNote : undefined,
                localPartialProofUris: isPartial ? partialProofUris : undefined,
              })
              .then(ok => {
                if (ok) {
                  onClose();
                }
              });
          }}
        />
      </View>
    </KolamContentFrame>
  );
}

function KolamPOEditCheckItemsDialog({
  controller,
  onClose,
  po,
}: {
  controller: KolamPurchaseOrderController;
  onClose: () => void;
  po: KolamPurchaseOrder;
}) {
  const [actuals, setActuals] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(
      po.items.map(item => [item.id, String(item.receivedQuantity ?? item.quantity)]),
    ),
  );
  const [editReason, setEditReason] = React.useState('');
  const [partialNote, setPartialNote] = React.useState(po.partialNote || '');
  const [partialProofUris, setPartialProofUris] = React.useState<string[]>([]);

  const isPartial = po.items.some(
    item => Number(actuals[item.id] ?? item.quantity) !== item.quantity,
  );

  return (
    <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
      <Text style={styles.sectionTitle}>Edit item pemeriksaan</Text>
      {po.items.map(item => (
        <View key={item.id} style={styles.checkItemRow}>
          <KolamCopyStack
            containerStyle={styles.lineInfo}
            items={[
              {
                id: 'title',
                text: getKolamPOItemDisplayTitle(item),
                style: styles.rowTitle,
              },
              {
                id: 'meta',
                text: [
                  getKolamPOItemCode(item),
                  getKolamPOItemVariantLabel(item.variant),
                  `Dipesan ${item.quantity} ${getKolamPOItemUnitLabel(item)}`,
                ]
                  .filter(part => part && part !== '—')
                  .join(' · '),
                style: styles.rowMeta,
              },
            ]}
          />
          <KolamFormTextField
            mode="numeric"
            onChangeText={value => setActuals(current => ({ ...current, [item.id]: value }))}
            style={styles.qtyInput}
            value={actuals[item.id] ?? ''}
          />
        </View>
      ))}
      <FieldShell label="Alasan edit" required>
        <KolamFormTextField
          multiline
          onChangeText={setEditReason}
          placeholder="Jelaskan alasan mengubah hasil pemeriksaan"
          value={editReason}
        />
      </FieldShell>
      {isPartial ? (
        <View style={styles.proofGroup}>
          <KolamFormTextField
            multiline
            onChangeText={setPartialNote}
            placeholder="Catatan partial"
            value={partialNote}
          />
          <KolamButton
            label="Tambah foto partial"
            onPress={async () => {
              const uri = await controller.onPickImage();
              if (uri) {
                setPartialProofUris(current => [...current, uri]);
              }
            }}
          />
        </View>
      ) : null}
      <View style={styles.headerActions}>
        <KolamCancelButton onPress={onClose} />
        <KolamButton
          disabled={controller.mutating || !editReason.trim()}
          intent="primary"
          label={controller.mutating ? 'Menyimpan…' : 'Simpan perubahan'}
          onPress={() => {
            void controller
              .onEditCheckItems({
                items: po.items.map(item =>
                  buildCheckItemInput(item, Number(actuals[item.id]) || 0),
                ),
                editReason: editReason.trim(),
                partialNote: isPartial ? partialNote : undefined,
                localPartialProofUris: isPartial ? partialProofUris : undefined,
              })
              .then(ok => {
                if (ok) {
                  onClose();
                }
              });
          }}
        />
      </View>
    </KolamContentFrame>
  );
}

function KolamPOMarketplaceSyncPanel({
  controller,
  onClose,
}: {
  controller: KolamPurchaseOrderController;
  onClose: () => void;
}) {
  const [platforms, setPlatforms] = React.useState<KolamMarketplacePlatform[]>([
    'tokopedia',
    'shopee',
  ]);

  const togglePlatform = (platform: KolamMarketplacePlatform) => {
    setPlatforms(current =>
      current.includes(platform)
        ? current.filter(item => item !== platform)
        : [...current, platform],
    );
  };

  return (
    <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
      <Text style={styles.sectionTitle}>Sinkron stok marketplace</Text>
      <Text style={styles.metaText}>
        Sinkron stok SKU item PO ini ke platform yang dipilih.
      </Text>
      <View style={styles.segmentRow}>
        {(['tokopedia', 'shopee'] as const).map(platform => (
          <KolamButton
            intent={platforms.includes(platform) ? 'primary' : 'outline'}
            key={platform}
            label={platform === 'tokopedia' ? 'Tokopedia' : 'Shopee'}
            onPress={() => togglePlatform(platform)}
          />
        ))}
      </View>
      <View style={styles.headerActions}>
        <KolamCancelButton onPress={onClose} />
        <KolamButton
          disabled={!platforms.length || controller.mutating}
          intent="primary"
          label={controller.mutating ? 'Menyinkron…' : 'Sinkron sekarang'}
          onPress={() => {
            void controller.onSyncMarketplace(platforms).then(() => onClose());
          }}
        />
      </View>
    </KolamContentFrame>
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
    <View style={styles.fieldShell}>
      <Text style={styles.fieldLabel}>
        {label}
        {required ? ' *' : ''}
      </Text>
      {children}
    </View>
  );
}

/* ──────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────*/

function buildCheckItemInput(
  item: KolamPurchaseOrderItem,
  actualReceived: number,
): KolamPOCheckItemInput {
  return {
    ...(item.itemType === 'product' ? { product: item.refId } : {}),
    ...(item.itemType === 'species' ? { species: item.refId } : {}),
    ...(item.itemType === 'packing' ? { packing: item.refId } : {}),
    ...(item.variant?.id ? { variant: item.variant.id } : {}),
    actualReceived,
  };
}

function paymentTypeLabel(type: 'cash' | 'tempo' | 'cicilan') {
  switch (type) {
    case 'tempo':
      return 'Tempo';
    case 'cicilan':
      return 'Cicilan';
    case 'cash':
    default:
      return 'Tunai';
  }
}

function getKolamPOStatusIntent(status: string): POStatusIntent {
  switch (status) {
    case 'draft':
      return 'muted';
    case 'sent':
    case 'delivery':
      return 'primary';
    case 'received':
    case 'on_check':
      return 'warning';
    case 'completed':
      return 'success';
    case 'rejected':
    case 'cancelled':
      return 'danger';
    default:
      return 'muted';
  }
}

function getKolamPOPaymentStatusIntent(status: string): POStatusIntent {
  switch (status) {
    case 'paid':
      return 'success';
    case 'partial_paid':
      return 'warning';
    case 'unpaid':
    default:
      return 'danger';
  }
}

function getKolamPORefundStatusIntent(status: string): POStatusIntent {
  switch (status) {
    case 'refunded':
      return 'success';
    case 'pending':
      return 'warning';
    case 'none':
    default:
      return 'muted';
  }
}

function getKolamDescriptionTone(
  intent: POStatusIntent,
): 'default' | 'success' | 'warning' | 'danger' {
  if (intent === 'success' || intent === 'warning' || intent === 'danger') {
    return intent;
  }
  return 'default';
}

function toLocalImageUri(uri: string) {
  if (uri.startsWith('file://') || uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri;
  }
  return `file:///${uri.replace(/\\/g, '/')}`;
}

function formatPODate(value: string) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatPODateTime(value: string) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  surface: {
    gap: 14,
  },
  detailSurface: {
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
    alignSelf: 'stretch',
  },
  listRoot: {
    gap: 14,
  },
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
  filterRowInline: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  searchInput: {
    flexBasis: 140,
    flexGrow: 1,
    minWidth: 120,
  },
  dateField: {
    flexGrow: 0,
    flexShrink: 0,
    maxWidth: 140,
    minWidth: 108,
    width: 120,
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
  filterPanelPayment: {
    left: 280,
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
  paginationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyWrap: {
    padding: 16,
  },
  poItemsTable: {
    width: '100%',
  },
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
  centerBadge: {
    alignSelf: 'center',
  },
  actionsTrack: {
    alignItems: 'center',
  },
  statusCell: {
    gap: 4,
  },
  activeActionRow: {
    elevation: 96,
    overflow: 'visible',
    zIndex: 9000,
  },
  rowTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'left',
  },
  rowMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    textAlign: 'left',
  },
  cellText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    textAlign: 'center',
    width: '100%',
  },
  numText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
  },
  badgeTextSm: {
    fontSize: 10,
  },
  placeholder: {
    gap: 14,
    paddingVertical: 16,
  },
  formRoot: {
    flex: 1,
  },
  formContent: {
    gap: 14,
    paddingBottom: 24,
  },
  formActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailCard: {
    gap: 8,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '700',
  },
  itemsHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  fieldShell: {
    gap: 4,
  },
  fieldLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
  },
  formSplitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  formSplitCell: {
    flexGrow: 1,
    minWidth: 220,
  },
  detailSplitCell: {
    flex: 1,
    minWidth: 280,
  },
  detailSplitCard: {
    flex: 1,
  },
  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  switchHint: {
    color: V.colors.mutedFg,
    flex: 1,
    fontSize: 13,
  },
  notesInput: {
    minHeight: 64,
  },
  disabledControl: {
    opacity: 0.55,
  },
  itemPicker: {
    gap: 8,
  },
  itemResultList: {
    gap: 6,
    maxHeight: 260,
  },
  itemResultRow: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  itemResultCopy: {
    flex: 1,
    minWidth: 0,
  },
  variantPickerPanel: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    padding: 10,
  },
  lineTable: {
    gap: 6,
  },
  lineRow: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  lineInfo: {
    flex: 1,
    minWidth: 0,
  },
  qtyInput: {
    maxWidth: 90,
  },
  priceInput: {
    maxWidth: 140,
  },
  metaText: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  poItemRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  proofSection: {
    gap: 12,
  },
  proofBorderCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  proofGroup: {
    gap: 6,
  },
  partialNoteBox: {
    backgroundColor: V.colors.warningSoft,
    borderColor: V.colors.warning,
    borderLeftWidth: 4,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
    padding: 10,
  },
  partialNoteTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
  },
  partialNoteBody: {
    color: V.colors.fg,
    fontSize: 13,
    lineHeight: 18,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoItem: {
    gap: 6,
    width: 120,
  },
  photoThumb: {
    borderRadius: 8,
    height: 96,
    width: 148,
  },
  checkItemRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  installmentRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
});
