import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  canCloseKolamComplaint,
  canOpenKolamComplaintRefundPayment,
  canSetKolamComplaintDecision,
  canShowKolamComplaintServiceContext,
  canSpawnKolamComplaintServiceReworkVisit,
  canSubmitKolamComplaintReworkCustomerResponse,
  canUpdateKolamComplaintReworkStatus,
  canUpdateKolamComplaintStatus,
  canUpdateKolamComplaintVendorClaim,
  getAllowedKolamComplaintReworkStatuses,
  getAllowedKolamComplaintStatuses,
  getAllowedKolamComplaintTrackingStatuses,
  getAllowedKolamComplaintVendorClaimStatuses,
  getAvailableKolamComplaintDecisions,
  getKolamComplaintCategoryLabel,
  getKolamComplaintCurrentRework,
  getKolamComplaintDecisionBadgeIntent,
  getKolamComplaintDecisionLabel,
  getKolamComplaintHistoryActionLabel,
  getKolamComplaintPriorityLabel,
  getKolamComplaintRefundPaymentStatusLabel,
  getKolamComplaintRefundWorkflowStep,
  getKolamComplaintReworkStatusLabel,
  getKolamComplaintSourceLabel,
  getKolamComplaintStatusBadgeIntent,
  getKolamComplaintStatusLabel,
  getKolamComplaintTrackingStatusLabel,
  getKolamComplaintVendorClaimStatusLabel,
  getKolamComplaintWarrantyDaysRemainingAtClaim,
  getKolamComplaintWarrantyModeLabel,
  isKolamComplaintRefundAwaitingReturn,
  isKolamComplaintReturnAwaitingVerification,
  isWarrantyClaimComplaint,
  KOLAM_COMPLAINT_CATEGORY_FILTER_OPTIONS,
  KOLAM_COMPLAINT_DECISION_OPTIONS,
  KOLAM_COMPLAINT_KPI_OPTIONS,
  KOLAM_COMPLAINT_PRIORITY_OPTIONS,
  KOLAM_COMPLAINT_REFUND_TRANSFER_METHOD_OPTIONS,
  KOLAM_COMPLAINT_ROOT,
  KOLAM_COMPLAINT_SOURCE_OPTIONS,
  KOLAM_COMPLAINT_STATUS_OPTIONS,
  needsKolamComplaintReplacementReturnTracking,
  needsKolamComplaintReplacementTracking,
  needsKolamComplaintReturnTracking,
  resolveKolamComplaintSaleSourceLogoUri,
  type KolamComplaint,
  type KolamComplaintDecision,
  type KolamComplaintKpiSeverity,
  type KolamComplaintReworkStatus,
  type KolamComplaintStatus,
  type KolamComplaintTrackingStatus,
  type KolamComplaintVendorClaimStatus,
} from '../domain/kolam-complaint';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { formatRupiah } from '../lib/money';
import { pickNativeImageFile } from '../services/native-file-picker';
import {
  useKolamComplaintController,
  type KolamComplaintController,
} from '../hooks/use-kolam-complaint-controller';
import { KolamButton } from './kolam-button';
import { KolamRefreshButton } from './kolam-refresh-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamComplaintCreateForm } from './kolam-complaint-create-form';
import { KolamDescriptionList } from './kolam-description-list';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamSearchField } from './kolam-search-field';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamSwitch } from './kolam-switch';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

function descRow(id: string, label: string, value: string) {
  return { id, label, meta: '', tone: 'default' as const, value };
}

export function KolamComplaintSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamComplaintController(route);

  return (
    <KolamComplaintShell controller={controller} onRouteChange={onRouteChange}>
      {controller.mode === 'list' ? (
        <KolamComplaintList
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : controller.mode === 'new' ? (
        <KolamComplaintCreateForm
          controller={controller}
          onRouteChange={onRouteChange}
          route={route}
        />
      ) : (
        <KolamComplaintDetail
          controller={controller}
          onRouteChange={onRouteChange}
        />
      )}
    </KolamComplaintShell>
  );
}

function KolamComplaintShell({
  children,
  controller,
  onRouteChange,
}: {
  children: React.ReactNode;
  controller: KolamComplaintController;
  onRouteChange?: (route: string) => void;
}) {
  if (controller.mode === 'list') {
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
        {children}
      </View>
    );
  }

  const contextLabel =
    controller.mode === 'new'
      ? 'Komplain baru'
      : controller.selectedComplaint?.ticketCode || 'Detail komplain';
  const saleId = controller.selectedComplaint?.saleId;

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
              label="Daftar"
              onPress={() => {
                controller.onBackToList();
                onRouteChange?.(KOLAM_COMPLAINT_ROOT);
              }}
              style={styles.toolbarButton}
            />
            <KolamRefreshButton
              accessibilityLabel="Refresh"
              disabled={controller.loading}

              onPress={() => {
                void controller.onRefresh();
              }}
              style={styles.toolbarButton}
            />
            {saleId ? (
              <KolamButton
                label="Lihat invoice"
                onPress={() => onRouteChange?.(`/sales/${saleId}`)}
                style={styles.toolbarButton}
              />
            ) : null}
          </View>
        </View>
      </View>
      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
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
      {children}
    </View>
  );
}

function KolamComplaintList({
  controller,
  onRouteChange,
}: {
  controller: KolamComplaintController;
  onRouteChange?: (route: string) => void;
}) {
  const columns = React.useMemo(
    () =>
      buildComplaintListColumns({
        onSelect: complaint => {
          void controller.onSelectComplaint(complaint).then(() => {
            onRouteChange?.(`${KOLAM_COMPLAINT_ROOT}/${complaint.id}`);
          });
        },
      }),
    [controller, onRouteChange],
  );

  return (
    <View style={styles.stack}>
      <View style={kolamTableToolbarStyles.shell}>
        <View
          style={[
            kolamTableToolbarStyles.row,
            styles.complaintToolbarRow,
          ]}>
          <View
            style={[
              kolamTableToolbarStyles.filters,
              styles.complaintToolbarFilters,
            ]}>
            <KolamSearchField
              containerStyle={[
                kolamTableToolbarStyles.searchInput,
                styles.complaintSearchInput,
              ]}
              onChangeText={controller.onSearchChange}
              placeholder="Cari tiket, invoice, pelanggan…"
              value={controller.search}
            />
            <KolamDropdownSelect
              label="Sumber"
              onChange={value =>
                controller.onSetSourceFilter(
                  value as typeof controller.sourceFilter,
                )
              }
              options={[
                { label: 'Sumber', value: 'all' },
                ...KOLAM_COMPLAINT_SOURCE_OPTIONS.filter(
                  option => option.id !== 'all',
                ).map(option => ({
                  label: option.label,
                  value: option.id,
                })),
              ]}
              showLabelInTrigger={false}
              style={styles.complaintFilterTrigger}
              value={controller.sourceFilter}
            />
            <KolamDropdownSelect
              label="Status"
              onChange={value =>
                controller.onSetStatusFilter(
                  value as typeof controller.statusFilter,
                )
              }
              options={[
                { label: 'Status', value: 'all' },
                ...KOLAM_COMPLAINT_STATUS_OPTIONS.map(option => ({
                  label: option.label,
                  value: option.id,
                })),
              ]}
              showLabelInTrigger={false}
              style={styles.complaintFilterTrigger}
              value={controller.statusFilter}
            />
            <KolamDropdownSelect
              label="Keputusan"
              onChange={value =>
                controller.onSetDecisionFilter(
                  value as typeof controller.decisionFilter,
                )
              }
              options={[
                { label: 'Keputusan', value: 'all' },
                ...KOLAM_COMPLAINT_DECISION_OPTIONS.map(option => ({
                  label: option.label,
                  value: option.id,
                })),
              ]}
              showLabelInTrigger={false}
              style={styles.complaintFilterTriggerWide}
              value={controller.decisionFilter}
            />
            <KolamDropdownSelect
              label="Prioritas"
              onChange={value =>
                controller.onSetPriorityFilter(
                  value as typeof controller.priorityFilter,
                )
              }
              options={[
                { label: 'Prioritas', value: 'all' },
                ...KOLAM_COMPLAINT_PRIORITY_OPTIONS.map(option => ({
                  label: option.label,
                  value: option.id,
                })),
              ]}
              showLabelInTrigger={false}
              style={styles.complaintFilterTrigger}
              value={controller.priorityFilter}
            />
            <KolamDropdownSelect
              label="Kategori"
              onChange={value =>
                controller.onSetCategoryFilter(
                  value as typeof controller.categoryFilter,
                )
              }
              options={[
                { label: 'Kategori', value: 'all' },
                ...KOLAM_COMPLAINT_CATEGORY_FILTER_OPTIONS.map(option => ({
                  label: option.label,
                  value: option.id,
                })),
              ]}
              showLabelInTrigger={false}
              style={styles.complaintFilterTrigger}
              value={controller.categoryFilter}
            />
          </View>
          <View
            style={[
              kolamTableToolbarStyles.actions,
              styles.complaintToolbarActions,
            ]}>
            <View style={styles.switchInline}>
              <Text style={styles.metaText}>Proyek khusus</Text>
              <KolamSwitch
                active={controller.customProjectOnly}
                onPress={() =>
                  controller.onSetCustomProjectOnly(!controller.customProjectOnly)
                }
              />
            </View>
            <KolamRefreshButton
              accessibilityLabel="Refresh"
              disabled={controller.loading}

              onPress={() => {
                void controller.onRefresh();
              }}
              style={styles.toolbarButton}
            />
            <KolamButton
              intent="primary"
              label="Baru"
              tone="positive"
              onPress={() => {
                controller.onCreateNew();
                onRouteChange?.(`${KOLAM_COMPLAINT_ROOT}/create`);
              }}
              style={styles.toolbarButton}
            />
          </View>
        </View>
      </View>

      <KolamListTableComposition
        actionsColumn
        columns={columns}
        emptyTitle="Komplain kosong"
        getRowKey={complaint => complaint.id}
        loading={controller.loading}
        pagination={{
          onPageChange: controller.onSetPage,
          page: controller.page,
          pageSize: controller.pageSize,
          total: controller.total,
        }}
        renderActions={complaint => (
          <KolamComplaintActionsMenu
            complaint={complaint}
            onSelect={() => {
              void controller.onSelectComplaint(complaint).then(() => {
                onRouteChange?.(`${KOLAM_COMPLAINT_ROOT}/${complaint.id}`);
              });
            }}
          />
        )}
        rows={controller.complaints}
      />
    </View>
  );
}

function buildComplaintListColumns({
  onSelect,
}: {
  onSelect: (complaint: KolamComplaint) => void;
}): Array<KolamListTableColumn<KolamComplaint>> {
  return [
    {
      flex: 1.05,
      id: 'ticket',
      label: 'Kode Tiket',
      render: complaint => (
        <Pressable
          accessibilityRole="button"
          onPress={() => onSelect(complaint)}
          style={styles.identityCell}
        >
          <Text numberOfLines={1} style={styles.primaryText}>
            {complaint.ticketCode}
          </Text>
          {complaint.marketplaceSource ? (
            <Text numberOfLines={1} style={styles.metaText}>
              Mirror {complaint.marketplaceSource}
            </Text>
          ) : null}
        </Pressable>
      ),
    },
    {
      align: 'center',
      flex: 0.92,
      id: 'invoice',
      label: 'Invoice',
      render: complaint => (
        <View style={styles.centerCell}>
          <Text numberOfLines={1} style={styles.cellTextCenter}>
            {complaint.invoiceCode}
          </Text>
          {complaint.isCustomProject ? (
            <KolamStatusBadge intent="info" label="Proyek khusus" />
          ) : null}
        </View>
      ),
    },
    {
      align: 'center',
      flex: 0.72,
      id: 'source',
      label: 'Sumber',
      render: complaint => (
        <Text numberOfLines={1} style={styles.cellTextCenter}>
          {getKolamComplaintSourceLabel(complaint.source)}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.48,
      id: 'items',
      label: 'Item',
      render: complaint => (
        <Text style={styles.cellTextCenter}>{complaint.itemCount}</Text>
      ),
    },
    {
      align: 'center',
      flex: 0.86,
      id: 'status',
      label: 'Status',
      render: complaint => (
        <KolamStatusBadge
          intent={getKolamComplaintStatusBadgeIntent(complaint.status)}
          label={getKolamComplaintStatusLabel(complaint.status)}
        />
      ),
    },
    {
      align: 'center',
      flex: 0.92,
      id: 'decision',
      label: 'Keputusan',
      render: complaint => (
        <KolamStatusBadge
          intent={getKolamComplaintDecisionBadgeIntent(complaint.decision)}
          label={getKolamComplaintDecisionLabel(complaint.decision)}
        />
      ),
    },
    {
      align: 'center',
      flex: 0.82,
      id: 'staff',
      label: 'Staf',
      render: complaint => (
        <Text numberOfLines={1} style={styles.cellTextCenter}>
          {complaint.assignedStaffName}
        </Text>
      ),
    },
    {
      align: 'center',
      flex: 0.82,
      id: 'created',
      label: 'Dibuat',
      render: complaint => (
        <Text numberOfLines={1} style={styles.metaTextCenter}>
          {formatListDate(complaint.createdAt)}
        </Text>
      ),
    },
  ];
}

function KolamComplaintActionsMenu({
  complaint,
  onSelect,
}: {
  complaint: KolamComplaint;
  onSelect: () => void;
}) {
  return (
    <KolamOverflowMenuButton
      accessibilityLabel={`Menu ${complaint.ticketCode}`}
      actions={[{ label: 'Lihat', onPress: onSelect }]}
    />
  );
}

function KolamComplaintDetail({
  controller,
  onRouteChange,
}: {
  controller: KolamComplaintController;
  onRouteChange?: (route: string) => void;
}) {
  const complaint = controller.selectedComplaint;

  if (!complaint) {
    return (
      <KolamEmptyState
        message="Tiket komplain tidak ditemukan."
        title="Tidak ada data"
      />
    );
  }

  const itemCount = complaint.itemCount || complaint.items.length;
  const sourceLogoUri = resolveKolamComplaintSaleSourceLogoUri(
    complaint,
    controller.saleSources,
  );

  return (
    <ScrollView
      contentContainerStyle={styles.detailContent}
      style={styles.detailRoot}
    >
      {complaint.marketplaceReadOnly ? (
        <KolamStatusBadge
          intent="warning"
          label={`Mirror marketplace ${complaint.marketplaceSource} — hanya baca di Kolam.`}
          numberOfLines={2}
          style={styles.banner}
        />
      ) : null}

      <KolamCardFrame style={styles.stripCard} variant="compact">
        <View style={styles.stripRow}>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>Status</Text>
            <KolamStatusBadge
              intent={getKolamComplaintStatusBadgeIntent(complaint.status)}
              label={getKolamComplaintStatusLabel(complaint.status)}
            />
          </View>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>Keputusan</Text>
            <KolamStatusBadge
              intent={getKolamComplaintDecisionBadgeIntent(complaint.decision)}
              label={getKolamComplaintDecisionLabel(complaint.decision)}
            />
          </View>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>Prioritas</Text>
            <Text style={styles.stripValue}>
              {getKolamComplaintPriorityLabel(complaint.priority)}
            </Text>
          </View>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>Items</Text>
            <Text style={styles.stripValue}>{itemCount}</Text>
          </View>
          {complaint.refundAmount > 0 ? (
            <View style={styles.stripItem}>
              <Text style={styles.stripLabel}>Refund</Text>
              <Text style={styles.stripValue}>
                {formatRupiah(complaint.refundAmount)}
              </Text>
            </View>
          ) : null}
          {complaint.isCustomProject ? (
            <View style={styles.stripItem}>
              <Text style={styles.stripLabel}>Flag</Text>
              <KolamStatusBadge intent="info" label="Proyek khusus" />
            </View>
          ) : null}
          {complaint.isServiceOnly ? (
            <View style={styles.stripItem}>
              <Text style={styles.stripLabel}>Layanan</Text>
              <KolamStatusBadge intent="secondary" label="Khusus layanan" />
            </View>
          ) : null}
          {sourceLogoUri ? (
            <View style={styles.stripSourceSlot}>
              <KolamRemoteImage
                accessibilityLabel={
                  complaint.saleSourceRef?.name || 'Sumber penjualan'
                }
                resizeMode="contain"
                sourceUri={sourceLogoUri}
                style={styles.stripSourceLogo}
              />
            </View>
          ) : null}
        </View>
      </KolamCardFrame>

      <View style={styles.columns}>
        <View style={styles.columnMain}>
          <Text style={styles.sectionTitle}>Informasi Komplain</Text>
          <KolamDescriptionList
            accessibilityLabel="Informasi komplain"
            rows={[
              descRow('invoice', 'Invoice', complaint.invoiceCode || '—'),
              descRow('customer', 'Pelanggan', complaint.customerName || '—'),
              descRow(
                'source',
                'Sumber komplain',
                getKolamComplaintSourceLabel(complaint.source),
              ),
              descRow(
                'saleSource',
                'Sumber penjualan',
                complaint.saleSourceRef?.name || '—',
              ),
              descRow(
                'category',
                'Kategori',
                getKolamComplaintCategoryLabel(complaint.category),
              ),
              descRow(
                'staff',
                'Staf ditugaskan',
                complaint.assignedStaffName || '—',
              ),
              descRow(
                'createdBy',
                'Dibuat oleh',
                complaint.createdByName || '—',
              ),
              descRow('createdAt', 'Dibuat', formatListDate(complaint.createdAt)),
              descRow(
                'description',
                'Deskripsi',
                complaint.description || '—',
              ),
            ]}
          />

          <Text style={styles.sectionTitle}>Item komplain</Text>
          {complaint.items.length === 0 ? (
            <Text style={styles.metaText}>Tidak ada item.</Text>
          ) : (
            complaint.items.map(item => (
              <View key={item.id} style={styles.itemCard}>
                <Text style={styles.primaryText}>{item.name}</Text>
                <Text style={styles.metaText}>
                  Qty {item.quantity}
                  {item.reason ? ` · ${item.reason}` : ''}
                </Text>
              </View>
            ))
          )}

          {complaint.photos.length ? (
            <>
              <Text style={styles.sectionTitle}>Bukti foto</Text>
              <View style={styles.photoRow}>
                {complaint.photos.map(photo =>
                  photo.uri ? (
                    <KolamRemoteImage
                      accessibilityLabel="Bukti komplain"
                      key={photo.id}
                      resizeMode="cover"
                      sourceUri={photo.uri}
                      style={styles.photo}
                    />
                  ) : null,
                )}
              </View>
            </>
          ) : null}

          {complaint.returnTracking || needsKolamComplaintReturnTracking(complaint) ? (
            <>
              <Text style={styles.sectionTitle}>Pelacakan retur</Text>
              <KolamDescriptionList
                accessibilityLabel="Retur"
                rows={[
                  descRow(
                    'ret-status',
                    'Status',
                    getKolamComplaintTrackingStatusLabel(
                      complaint.returnTracking?.status || 'pending',
                    ),
                  ),
                  descRow(
                    'ret-track',
                    'Resi',
                    complaint.returnTracking?.trackingNumber || '—',
                  ),
                  descRow(
                    'ret-courier',
                    'Kurir',
                    complaint.returnTracking?.courierName || '—',
                  ),
                ]}
              />
            </>
          ) : null}

          {complaint.replacementTracking ||
          needsKolamComplaintReplacementTracking(complaint) ||
          isKolamComplaintReturnAwaitingVerification(complaint) ? (
            <>
              <Text style={styles.sectionTitle}>Pelacakan penggantian</Text>
              {isKolamComplaintReturnAwaitingVerification(complaint) ? (
                <KolamStatusBadge
                  intent="warning"
                  label="Retur harus diterima dan diverifikasi dulu sebelum pengiriman pengganti."
                  numberOfLines={3}
                  style={styles.banner}
                />
              ) : null}
              <KolamDescriptionList
                accessibilityLabel="Penggantian"
                rows={[
                  descRow(
                    'rep-status',
                    'Status',
                    getKolamComplaintTrackingStatusLabel(
                      complaint.replacementTracking?.status || 'pending',
                    ),
                  ),
                  descRow(
                    'rep-track',
                    'Resi',
                    complaint.replacementTracking?.trackingNumber || '—',
                  ),
                  descRow(
                    'rep-courier',
                    'Kurir',
                    complaint.replacementTracking?.courierName || '—',
                  ),
                ]}
              />
            </>
          ) : null}

          {complaint.replacementReturnTracking ||
          needsKolamComplaintReplacementReturnTracking(complaint) ? (
            <>
              <Text style={styles.sectionTitle}>Retur barang pengganti</Text>
              <KolamDescriptionList
                accessibilityLabel="Retur pengganti"
                rows={[
                  descRow(
                    'repr-status',
                    'Status',
                    getKolamComplaintTrackingStatusLabel(
                      complaint.replacementReturnTracking?.status || 'pending',
                    ),
                  ),
                  descRow(
                    'repr-track',
                    'Resi',
                    complaint.replacementReturnTracking?.trackingNumber || '—',
                  ),
                  descRow(
                    'repr-courier',
                    'Kurir',
                    complaint.replacementReturnTracking?.courierName || '—',
                  ),
                ]}
              />
            </>
          ) : null}

          {complaint.refundPaymentStatus ||
          complaint.refundTransaction ||
          canOpenKolamComplaintRefundPayment(complaint) ||
          isKolamComplaintRefundAwaitingReturn(complaint) ? (
            <>
              <Text style={styles.sectionTitle}>Pembayaran refund</Text>
              {isKolamComplaintRefundAwaitingReturn(complaint) ? (
                <KolamStatusBadge
                  intent="warning"
                  label="Retur harus diverifikasi dulu sebelum refund."
                  numberOfLines={2}
                  style={styles.banner}
                />
              ) : null}
              <KolamDescriptionList
                accessibilityLabel="Refund"
                rows={[
                  descRow(
                    'rf-status',
                    'Status',
                    getKolamComplaintRefundPaymentStatusLabel(
                      complaint.refundPaymentStatus,
                    ),
                  ),
                  descRow(
                    'rf-amount',
                    'Jumlah',
                    complaint.refundAmount > 0
                      ? formatRupiah(complaint.refundAmount)
                      : '—',
                  ),
                  descRow(
                    'rf-wallet',
                    'Wallet',
                    complaint.refundTransaction?.walletName || '—',
                  ),
                  descRow(
                    'rf-tx',
                    'Konfirmasi txn',
                    complaint.refundTransaction?.confirmStatus || '—',
                  ),
                  ...(complaint.refundPaymentDetails
                    ? [
                        descRow(
                          'rf-acc',
                          'Rekening',
                          complaint.refundPaymentDetails.accountNumber || '—',
                        ),
                        descRow(
                          'rf-name',
                          'Atas nama',
                          complaint.refundPaymentDetails.accountName || '—',
                        ),
                        descRow(
                          'rf-bank',
                          'Bank',
                          complaint.refundPaymentDetails.bank || '—',
                        ),
                      ]
                    : []),
                ]}
              />
              {complaint.refundPaymentProof.length ? (
                <View style={styles.photoRow}>
                  {complaint.refundPaymentProof.map(photo =>
                    photo.uri ? (
                      <KolamRemoteImage
                        accessibilityLabel="Bukti refund"
                        key={photo.id}
                        resizeMode="cover"
                        sourceUri={photo.uri}
                        style={styles.photo}
                      />
                    ) : null,
                  )}
                </View>
              ) : null}
            </>
          ) : null}

          <KolamComplaintWarrantyContextCard complaint={complaint} />
          <KolamComplaintVendorClaimCard
            complaint={complaint}
            controller={controller}
          />
          <KolamComplaintServiceContextCard
            complaint={complaint}
            controller={controller}
            onRouteChange={onRouteChange}
          />
          <KolamComplaintReworkProgressCard complaint={complaint} />

          {!complaint.marketplaceReadOnly ? (
            <KolamComplaintWorkflowPanel controller={controller} complaint={complaint} />
          ) : (
            <KolamStatusBadge
              intent="secondary"
              label="Aksi staf disembunyikan untuk mirror marketplace."
              numberOfLines={2}
              style={styles.banner}
            />
          )}
        </View>

        <View style={styles.columnSide}>
          <Text style={styles.sectionTitle}>Riwayat</Text>
          {complaint.histories.length === 0 ? (
            <Text style={styles.metaText}>Belum ada riwayat.</Text>
          ) : (
            complaint.histories.map(history => (
              <View key={history.id} style={styles.historyCard}>
                <Text style={styles.primaryText}>
                  {getKolamComplaintHistoryActionLabel(history.action)}
                </Text>
                <Text style={styles.metaText}>{history.note || '—'}</Text>
                <Text style={styles.metaText}>
                  {history.changedByLabel} · {formatListDate(history.changedAt)}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function KolamComplaintWorkflowPanel({
  complaint,
  controller,
}: {
  complaint: KolamComplaint;
  controller: KolamComplaintController;
}) {
  const allowedStatuses = getAllowedKolamComplaintStatuses(complaint.status);
  const decisionOptions = getAvailableKolamComplaintDecisions(
    complaint.isServiceOnly,
    {
      isWarrantyClaim: isWarrantyClaimComplaint(complaint),
      warrantyMode: complaint.warrantyContext?.mode ?? null,
    },
  );
  const returnStatus =
    complaint.returnTracking?.status || ('pending' as KolamComplaintTrackingStatus);
  const allowedReturnStatuses = getAllowedKolamComplaintTrackingStatuses(returnStatus);
  const replacementStatus =
    complaint.replacementTracking?.status ||
    ('pending' as KolamComplaintTrackingStatus);
  const allowedReplacementStatuses =
    getAllowedKolamComplaintTrackingStatuses(replacementStatus);
  const replacementReturnStatus =
    complaint.replacementReturnTracking?.status ||
    ('pending' as KolamComplaintTrackingStatus);
  const allowedReplacementReturnStatuses =
    getAllowedKolamComplaintTrackingStatuses(replacementReturnStatus);

  const [staffId, setStaffId] = React.useState(complaint.assignedStaffId || '');
  const [assignNote, setAssignNote] = React.useState('');
  const [nextStatus, setNextStatus] = React.useState<KolamComplaintStatus>(
    allowedStatuses[0] || complaint.status,
  );
  const [statusNote, setStatusNote] = React.useState('');
  const [decision, setDecision] = React.useState<NonNullable<KolamComplaintDecision> | ''>(
    complaint.decision || decisionOptions[0]?.id || '',
  );
  const [refundAmount, setRefundAmount] = React.useState(
    complaint.refundAmount > 0 ? String(complaint.refundAmount) : '',
  );
  const [decisionNote, setDecisionNote] = React.useState('');
  const [closeNote, setCloseNote] = React.useState('');
  const [kpiSeverity, setKpiSeverity] = React.useState<
    KolamComplaintKpiSeverity | 'none'
  >('none');
  const [returnNextStatus, setReturnNextStatus] =
    React.useState<KolamComplaintTrackingStatus>(
      allowedReturnStatuses[0] || returnStatus,
    );
  const [returnNote, setReturnNote] = React.useState('');
  const [returnVerifiedNote, setReturnVerifiedNote] = React.useState('');
  const [trackingNumber, setTrackingNumber] = React.useState(
    complaint.returnTracking?.trackingNumber || '',
  );
  const [courierName, setCourierName] = React.useState(
    complaint.returnTracking?.courierName || '',
  );
  const [replacementNextStatus, setReplacementNextStatus] =
    React.useState<KolamComplaintTrackingStatus>(
      allowedReplacementStatuses[0] || replacementStatus,
    );
  const [replacementNote, setReplacementNote] = React.useState('');
  const [replacementVerifiedNote, setReplacementVerifiedNote] =
    React.useState('');
  const [replacementTrackingNumber, setReplacementTrackingNumber] =
    React.useState(complaint.replacementTracking?.trackingNumber || '');
  const [replacementCourierName, setReplacementCourierName] = React.useState(
    complaint.replacementTracking?.courierName || '',
  );
  const [replacementReceivedByType, setReplacementReceivedByType] =
    React.useState<'customer' | 'other'>(
      complaint.replacementTracking?.receivedByType === 'other'
        ? 'other'
        : 'customer',
    );
  const [replacementReceivedByOther, setReplacementReceivedByOther] =
    React.useState(
      complaint.replacementTracking?.receivedByType === 'other'
        ? complaint.replacementTracking.receivedByLabel || ''
        : '',
    );
  const [replacementReturnNextStatus, setReplacementReturnNextStatus] =
    React.useState<KolamComplaintTrackingStatus>(
      allowedReplacementReturnStatuses[0] || replacementReturnStatus,
    );
  const [replacementReturnNote, setReplacementReturnNote] = React.useState('');
  const [replacementReturnVerifiedNote, setReplacementReturnVerifiedNote] =
    React.useState('');
  const [replacementReturnTrackingNumber, setReplacementReturnTrackingNumber] =
    React.useState(
      complaint.replacementReturnTracking?.trackingNumber || '',
    );
  const [replacementReturnCourierName, setReplacementReturnCourierName] =
    React.useState(complaint.replacementReturnTracking?.courierName || '');
  const [replacementReturnReceivedBy, setReplacementReturnReceivedBy] =
    React.useState(
      complaint.replacementReturnTracking?.receivedById ||
        complaint.assignedStaffId ||
        '',
    );

  React.useEffect(() => {
    const nextAllowed = getAllowedKolamComplaintStatuses(complaint.status);
    const nextDecisions = getAvailableKolamComplaintDecisions(
      complaint.isServiceOnly,
      {
        isWarrantyClaim: isWarrantyClaimComplaint(complaint),
        warrantyMode: complaint.warrantyContext?.mode ?? null,
      },
    );
    const nextReturnStatus =
      complaint.returnTracking?.status ||
      ('pending' as KolamComplaintTrackingStatus);
    const nextAllowedReturn =
      getAllowedKolamComplaintTrackingStatuses(nextReturnStatus);
    const nextReplacementStatus =
      complaint.replacementTracking?.status ||
      ('pending' as KolamComplaintTrackingStatus);
    const nextAllowedReplacement =
      getAllowedKolamComplaintTrackingStatuses(nextReplacementStatus);
    const nextReplacementReturnStatus =
      complaint.replacementReturnTracking?.status ||
      ('pending' as KolamComplaintTrackingStatus);
    const nextAllowedReplacementReturn =
      getAllowedKolamComplaintTrackingStatuses(nextReplacementReturnStatus);

    setStaffId(complaint.assignedStaffId || '');
    setNextStatus(nextAllowed[0] || complaint.status);
    setDecision(complaint.decision || nextDecisions[0]?.id || '');
    setRefundAmount(
      complaint.refundAmount > 0 ? String(complaint.refundAmount) : '',
    );
    setReturnNextStatus(nextAllowedReturn[0] || nextReturnStatus);
    setTrackingNumber(complaint.returnTracking?.trackingNumber || '');
    setCourierName(complaint.returnTracking?.courierName || '');
    setReplacementNextStatus(
      nextAllowedReplacement[0] || nextReplacementStatus,
    );
    setReplacementTrackingNumber(
      complaint.replacementTracking?.trackingNumber || '',
    );
    setReplacementCourierName(complaint.replacementTracking?.courierName || '');
    setReplacementReceivedByType(
      complaint.replacementTracking?.receivedByType === 'other'
        ? 'other'
        : 'customer',
    );
    setReplacementReceivedByOther(
      complaint.replacementTracking?.receivedByType === 'other'
        ? complaint.replacementTracking.receivedByLabel || ''
        : '',
    );
    setReplacementReturnNextStatus(
      nextAllowedReplacementReturn[0] || nextReplacementReturnStatus,
    );
    setReplacementReturnTrackingNumber(
      complaint.replacementReturnTracking?.trackingNumber || '',
    );
    setReplacementReturnCourierName(
      complaint.replacementReturnTracking?.courierName || '',
    );
    setReplacementReturnReceivedBy(
      complaint.replacementReturnTracking?.receivedById ||
        complaint.assignedStaffId ||
        '',
    );
  }, [
    complaint.assignedStaffId,
    complaint.decision,
    complaint.id,
    complaint.isServiceOnly,
    complaint.refundAmount,
    complaint.replacementReturnTracking?.courierName,
    complaint.replacementReturnTracking?.receivedById,
    complaint.replacementReturnTracking?.status,
    complaint.replacementReturnTracking?.trackingNumber,
    complaint.replacementTracking?.courierName,
    complaint.replacementTracking?.receivedByLabel,
    complaint.replacementTracking?.receivedByType,
    complaint.replacementTracking?.status,
    complaint.replacementTracking?.trackingNumber,
    complaint.returnTracking?.courierName,
    complaint.returnTracking?.status,
    complaint.returnTracking?.trackingNumber,
    complaint.source,
    complaint.status,
    complaint.warrantyContext?.mode,
  ]);

  const busy = controller.mutating || controller.loading;
  const needsRefundAmount =
    decision === 'refund' || decision === 'return_then_refund';
  const showReplacementUpdater =
    needsKolamComplaintReplacementTracking(complaint) &&
    allowedReplacementStatuses.length > 0;
  const showReplacementReturnUpdater =
    needsKolamComplaintReplacementReturnTracking(complaint) &&
    allowedReplacementReturnStatuses.length > 0;
  const replacementReceivedByValue =
    replacementReceivedByType === 'customer'
      ? complaint.createdById || ''
      : replacementReceivedByOther.trim();
  const replacementReceivedReady =
    replacementNextStatus !== 'received' ||
    (replacementReceivedByType === 'customer'
      ? Boolean(complaint.createdById)
      : Boolean(replacementReceivedByOther.trim()));
  const replacementReturnReceivedReady =
    replacementReturnNextStatus !== 'received' ||
    Boolean(replacementReturnReceivedBy.trim());

  return (
    <View style={styles.workflowPanel}>
      <Text style={styles.sectionTitle}>Aksi workflow</Text>

      <View style={styles.workflowBlock}>
        <Text style={styles.workflowBlockTitle}>Tugaskan staf</Text>
        <KolamDropdownSelect
          accessibilityLabel="Pilih staf"
          label="Staf"
          menuPlacement="inline"
          onChange={setStaffId}
          options={[
            { label: 'Pilih staf…', value: '' },
            ...controller.staffOptions.map(option => ({
              label: option.label,
              value: option.id,
            })),
          ]}
          searchable={controller.staffOptions.length > 8}
          searchPlaceholder="Cari staf…"
          showLabelInTrigger={false}
          value={staffId}
        />
        <KolamFormTextField
          multiline
          numberOfLines={2}
          onChangeText={setAssignNote}
          placeholder="Catatan penugasan (opsional)"
          style={styles.workflowNote}
          value={assignNote}
        />
        <KolamButton
          disabled={busy || !staffId}
          intent="primary"
          label={busy ? 'Menyimpan…' : 'Simpan penugasan'}
          onPress={() => {
            void controller.onAssignStaff(staffId, assignNote).then(ok => {
              if (ok) {
                setAssignNote('');
              }
            });
          }}
        />
      </View>

      <View style={styles.workflowBlock}>
        <Text style={styles.workflowBlockTitle}>Ubah status</Text>
        {!complaint.assignedStaffId ? (
          <Text style={styles.metaText}>
            Tugaskan staf dulu sebelum mengubah status.
          </Text>
        ) : null}
        <KolamDropdownSelect
          accessibilityLabel="Status baru"
          label="Status"
          menuPlacement="inline"
          onChange={value => setNextStatus(value as KolamComplaintStatus)}
          options={allowedStatuses.map(status => ({
            label: getKolamComplaintStatusLabel(status),
            value: status,
          }))}
          showLabelInTrigger={false}
          value={nextStatus}
        />
        <KolamFormTextField
          multiline
          numberOfLines={3}
          onChangeText={setStatusNote}
          placeholder="Catatan wajib…"
          style={styles.workflowNote}
          value={statusNote}
        />
        <KolamButton
          disabled={
            busy ||
            !canUpdateKolamComplaintStatus(complaint) ||
            !statusNote.trim() ||
            !allowedStatuses.includes(nextStatus)
          }
          intent="primary"
          label={busy ? 'Menyimpan…' : 'Update status'}
          onPress={() => {
            void controller.onUpdateStatus(nextStatus, statusNote).then(ok => {
              if (ok) {
                setStatusNote('');
              }
            });
          }}
        />
      </View>

      {canSetKolamComplaintDecision(complaint) ? (
        <View style={styles.workflowBlock}>
          <Text style={styles.workflowBlockTitle}>
            {complaint.decision ? 'Ubah keputusan' : 'Set keputusan'}
          </Text>
          <KolamDropdownSelect
            accessibilityLabel="Keputusan"
            label="Keputusan"
            menuPlacement="inline"
            onChange={value =>
              setDecision(value as NonNullable<KolamComplaintDecision>)
            }
            options={decisionOptions.map(option => ({
              label: option.label,
              value: option.id,
            }))}
            showLabelInTrigger={false}
            value={decision}
          />
          {needsRefundAmount ? (
            <KolamFormTextField
              mode="numeric"
              onChangeText={setRefundAmount}
              placeholder="Jumlah refund (Rp)"
              value={refundAmount}
            />
          ) : null}
          <KolamFormTextField
            multiline
            numberOfLines={3}
            onChangeText={setDecisionNote}
            placeholder="Catatan wajib…"
            style={styles.workflowNote}
            value={decisionNote}
          />
          <KolamButton
            disabled={
              busy ||
              !decision ||
              !decisionNote.trim() ||
              (needsRefundAmount && !refundAmount.trim())
            }
            intent="primary"
            label={busy ? 'Menyimpan…' : 'Simpan keputusan'}
            onPress={() => {
              if (!decision) {
                return;
              }
              void controller
                .onUpdateDecision({
                  decision,
                  note: decisionNote,
                  ...(needsRefundAmount
                    ? { refundAmount: Math.max(0, Number(refundAmount) || 0) }
                    : {}),
                })
                .then(ok => {
                  if (ok) {
                    setDecisionNote('');
                  }
                });
            }}
          />
        </View>
      ) : null}

      {needsKolamComplaintReturnTracking(complaint) &&
      allowedReturnStatuses.length > 0 ? (
        <View style={styles.workflowBlock}>
          <Text style={styles.workflowBlockTitle}>Update retur</Text>
          <KolamDropdownSelect
            accessibilityLabel="Status retur"
            label="Status retur"
            menuPlacement="inline"
            onChange={value =>
              setReturnNextStatus(value as KolamComplaintTrackingStatus)
            }
            options={allowedReturnStatuses.map(status => ({
              label: getKolamComplaintTrackingStatusLabel(status),
              value: status,
            }))}
            showLabelInTrigger={false}
            value={returnNextStatus}
          />
          <KolamFormTextField
            onChangeText={setTrackingNumber}
            placeholder="Nomor resi"
            value={trackingNumber}
          />
          <KolamFormTextField
            onChangeText={setCourierName}
            placeholder="Nama kurir"
            value={courierName}
          />
          {returnNextStatus === 'verified' ? (
            <KolamFormTextField
              multiline
              numberOfLines={3}
              onChangeText={setReturnVerifiedNote}
              placeholder="Catatan verifikasi wajib…"
              style={styles.workflowNote}
              value={returnVerifiedNote}
            />
          ) : (
            <KolamFormTextField
              multiline
              numberOfLines={3}
              onChangeText={setReturnNote}
              placeholder="Catatan…"
              style={styles.workflowNote}
              value={returnNote}
            />
          )}
          <KolamButton
            disabled={
              busy ||
              (returnNextStatus === 'verified'
                ? !returnVerifiedNote.trim()
                : false)
            }
            intent="primary"
            label={busy ? 'Menyimpan…' : 'Update retur'}
            onPress={() => {
              void controller
                .onUpdateReturnStatus({
                  status: returnNextStatus,
                  trackingNumber,
                  courierName,
                  ...(returnNextStatus === 'verified'
                    ? { verifiedNote: returnVerifiedNote }
                    : { note: returnNote }),
                })
                .then(ok => {
                  if (ok) {
                    setReturnNote('');
                    setReturnVerifiedNote('');
                  }
                });
            }}
          />
        </View>
      ) : null}

      {isKolamComplaintReturnAwaitingVerification(complaint) ? (
        <View style={styles.workflowBlock}>
          <Text style={styles.workflowBlockTitle}>Update penggantian</Text>
          <Text style={styles.metaText}>
            Retur harus diterima dan diverifikasi dulu sebelum pengiriman
            pengganti.
          </Text>
        </View>
      ) : null}

      {showReplacementUpdater ? (
        <View style={styles.workflowBlock}>
          <Text style={styles.workflowBlockTitle}>Update penggantian</Text>
          <KolamDropdownSelect
            accessibilityLabel="Status penggantian"
            label="Status penggantian"
            menuPlacement="inline"
            onChange={value =>
              setReplacementNextStatus(value as KolamComplaintTrackingStatus)
            }
            options={allowedReplacementStatuses.map(status => ({
              label: getKolamComplaintTrackingStatusLabel(status),
              value: status,
            }))}
            showLabelInTrigger={false}
            value={replacementNextStatus}
          />
          <KolamFormTextField
            onChangeText={setReplacementTrackingNumber}
            placeholder="Nomor resi"
            value={replacementTrackingNumber}
          />
          <KolamFormTextField
            onChangeText={setReplacementCourierName}
            placeholder="Nama kurir"
            value={replacementCourierName}
          />
          {replacementNextStatus === 'received' ? (
            <>
              <KolamDropdownSelect
                accessibilityLabel="Diterima oleh"
                label="Diterima oleh"
                menuPlacement="inline"
                onChange={value =>
                  setReplacementReceivedByType(value as 'customer' | 'other')
                }
                options={[
                  {
                    label: complaint.createdByName
                      ? `Pelanggan (${complaint.createdByName})`
                      : 'Pelanggan',
                    value: 'customer',
                  },
                  { label: 'Orang lain', value: 'other' },
                ]}
                showLabelInTrigger={false}
                value={replacementReceivedByType}
              />
              {replacementReceivedByType === 'other' ? (
                <KolamFormTextField
                  onChangeText={setReplacementReceivedByOther}
                  placeholder="Nama penerima"
                  value={replacementReceivedByOther}
                />
              ) : !complaint.createdById ? (
                <Text style={styles.metaText}>
                  ID pembuat komplain tidak tersedia untuk opsi pelanggan.
                </Text>
              ) : null}
            </>
          ) : null}
          {replacementNextStatus === 'verified' ? (
            <KolamFormTextField
              multiline
              numberOfLines={3}
              onChangeText={setReplacementVerifiedNote}
              placeholder="Catatan verifikasi wajib…"
              style={styles.workflowNote}
              value={replacementVerifiedNote}
            />
          ) : (
            <KolamFormTextField
              multiline
              numberOfLines={3}
              onChangeText={setReplacementNote}
              placeholder="Catatan…"
              style={styles.workflowNote}
              value={replacementNote}
            />
          )}
          <KolamButton
            disabled={
              busy ||
              !replacementReceivedReady ||
              (replacementNextStatus === 'verified'
                ? !replacementVerifiedNote.trim()
                : !replacementNote.trim())
            }
            intent="primary"
            label={busy ? 'Menyimpan…' : 'Update penggantian'}
            onPress={() => {
              void controller
                .onUpdateReplacementStatus({
                  status: replacementNextStatus,
                  trackingNumber: replacementTrackingNumber,
                  courierName: replacementCourierName,
                  ...(replacementNextStatus === 'verified'
                    ? {
                        verifiedNote: replacementVerifiedNote,
                        note: replacementVerifiedNote,
                      }
                    : { note: replacementNote }),
                  ...(replacementNextStatus === 'received'
                    ? {
                        receivedByType: replacementReceivedByType,
                        receivedBy: replacementReceivedByValue,
                      }
                    : {}),
                })
                .then(ok => {
                  if (ok) {
                    setReplacementNote('');
                    setReplacementVerifiedNote('');
                  }
                });
            }}
          />
        </View>
      ) : null}

      {showReplacementReturnUpdater ? (
        <View style={styles.workflowBlock}>
          <Text style={styles.workflowBlockTitle}>
            Update retur barang pengganti
          </Text>
          <KolamDropdownSelect
            accessibilityLabel="Status retur pengganti"
            label="Status retur pengganti"
            menuPlacement="inline"
            onChange={value =>
              setReplacementReturnNextStatus(
                value as KolamComplaintTrackingStatus,
              )
            }
            options={allowedReplacementReturnStatuses.map(status => ({
              label: getKolamComplaintTrackingStatusLabel(status),
              value: status,
            }))}
            showLabelInTrigger={false}
            value={replacementReturnNextStatus}
          />
          <KolamFormTextField
            onChangeText={setReplacementReturnTrackingNumber}
            placeholder="Nomor resi"
            value={replacementReturnTrackingNumber}
          />
          <KolamFormTextField
            onChangeText={setReplacementReturnCourierName}
            placeholder="Nama kurir"
            value={replacementReturnCourierName}
          />
          {replacementReturnNextStatus === 'received' ? (
            <KolamDropdownSelect
              accessibilityLabel="Staf penerima"
              label="Staf penerima"
              menuPlacement="inline"
              onChange={setReplacementReturnReceivedBy}
              options={[
                { label: 'Pilih staf…', value: '' },
                ...controller.staffOptions.map(option => ({
                  label: option.label,
                  value: option.id,
                })),
              ]}
              searchable={controller.staffOptions.length > 8}
              searchPlaceholder="Cari staf…"
              showLabelInTrigger={false}
              value={replacementReturnReceivedBy}
            />
          ) : null}
          {replacementReturnNextStatus === 'verified' ? (
            <KolamFormTextField
              multiline
              numberOfLines={3}
              onChangeText={setReplacementReturnVerifiedNote}
              placeholder="Catatan verifikasi wajib…"
              style={styles.workflowNote}
              value={replacementReturnVerifiedNote}
            />
          ) : (
            <KolamFormTextField
              multiline
              numberOfLines={3}
              onChangeText={setReplacementReturnNote}
              placeholder="Catatan…"
              style={styles.workflowNote}
              value={replacementReturnNote}
            />
          )}
          <KolamButton
            disabled={
              busy ||
              !replacementReturnReceivedReady ||
              (replacementReturnNextStatus === 'verified'
                ? !replacementReturnVerifiedNote.trim()
                : !replacementReturnNote.trim())
            }
            intent="primary"
            label={busy ? 'Menyimpan…' : 'Update retur pengganti'}
            onPress={() => {
              void controller
                .onUpdateReplacementReturnStatus({
                  status: replacementReturnNextStatus,
                  trackingNumber: replacementReturnTrackingNumber,
                  courierName: replacementReturnCourierName,
                  ...(replacementReturnNextStatus === 'verified'
                    ? { verifiedNote: replacementReturnVerifiedNote }
                    : { note: replacementReturnNote }),
                  ...(replacementReturnNextStatus === 'received'
                    ? { receivedBy: replacementReturnReceivedBy }
                    : {}),
                })
                .then(ok => {
                  if (ok) {
                    setReplacementReturnNote('');
                    setReplacementReturnVerifiedNote('');
                  }
                });
            }}
          />
        </View>
      ) : null}

      <KolamComplaintRefundWorkflow
        complaint={complaint}
        controller={controller}
      />
      <KolamComplaintReworkWorkflow
        complaint={complaint}
        controller={controller}
      />
      <KolamComplaintReworkCustomerResponseWorkflow
        complaint={complaint}
        controller={controller}
      />

      {canCloseKolamComplaint(complaint) ? (
        <View style={styles.workflowBlock}>
          <Text style={styles.workflowBlockTitle}>Tutup tiket</Text>
          <KolamFormTextField
            multiline
            numberOfLines={3}
            onChangeText={setCloseNote}
            placeholder="Catatan penutupan wajib…"
            style={styles.workflowNote}
            value={closeNote}
          />
          <KolamDropdownSelect
            accessibilityLabel="Penalti KPI"
            label="KPI"
            menuPlacement="inline"
            onChange={value =>
              setKpiSeverity(value as KolamComplaintKpiSeverity | 'none')
            }
            options={KOLAM_COMPLAINT_KPI_OPTIONS.map(option => ({
              label: option.label,
              value: option.id,
            }))}
            showLabelInTrigger={false}
            value={kpiSeverity}
          />
          <KolamButton
            disabled={busy || closeNote.trim().length < 10}
            intent="danger"
            label={busy ? 'Menutup…' : 'Tutup tiket'}
            onPress={() => {
              void controller
                .onCloseComplaint({
                  note: closeNote,
                  kpiSeverity: kpiSeverity === 'none' ? null : kpiSeverity,
                })
                .then(ok => {
                  if (ok) {
                    setCloseNote('');
                    setKpiSeverity('none');
                  }
                });
            }}
          />
        </View>
      ) : null}
    </View>
  );
}

function KolamComplaintWarrantyContextCard({
  complaint,
}: {
  complaint: KolamComplaint;
}) {
  if (!isWarrantyClaimComplaint(complaint) || !complaint.warrantyContext) {
    return null;
  }
  const ctx = complaint.warrantyContext;
  const daysAtClaim = getKolamComplaintWarrantyDaysRemainingAtClaim(complaint);

  return (
    <>
      <Text style={styles.sectionTitle}>Konteks garansi</Text>
      <KolamDescriptionList
        accessibilityLabel="Konteks garansi"
        rows={[
          descRow(
            'w-mode',
            'Mode',
            getKolamComplaintWarrantyModeLabel(ctx.mode),
          ),
          ...(ctx.vendorName
            ? [descRow('w-vendor', 'Vendor', ctx.vendorName)]
            : []),
          ...(ctx.warrantyDays != null
            ? [descRow('w-days', 'Durasi', `${ctx.warrantyDays} hari`)]
            : []),
          ...(ctx.warrantyEndsAt
            ? [
                descRow(
                  'w-end',
                  'Berakhir',
                  formatListDate(ctx.warrantyEndsAt),
                ),
              ]
            : []),
          ...(daysAtClaim != null
            ? [
                descRow(
                  'w-remain',
                  'Sisa saat klaim',
                  `${daysAtClaim} hari`,
                ),
              ]
            : []),
        ]}
      />
    </>
  );
}

function KolamComplaintVendorClaimCard({
  complaint,
  controller,
}: {
  complaint: KolamComplaint;
  controller: KolamComplaintController;
}) {
  if (
    !isWarrantyClaimComplaint(complaint) ||
    complaint.warrantyContext?.mode !== 'official_distributor'
  ) {
    return null;
  }

  const vendorClaim = complaint.vendorClaim;
  const currentStatus = vendorClaim?.status || 'pending_submission';
  const allowed = getAllowedKolamComplaintVendorClaimStatuses(currentStatus);
  const canEdit = canUpdateKolamComplaintVendorClaim(complaint);
  const busy = controller.mutating || controller.loading;

  const [nextStatus, setNextStatus] =
    React.useState<KolamComplaintVendorClaimStatus>(
      allowed[0] || currentStatus,
    );
  const [claimReference, setClaimReference] = React.useState(
    vendorClaim?.claimReference || '',
  );
  const [vendorResponseNote, setVendorResponseNote] = React.useState(
    vendorClaim?.vendorResponseNote || '',
  );
  const [resolutionNote, setResolutionNote] = React.useState(
    vendorClaim?.resolutionNote || '',
  );
  const [note, setNote] = React.useState('');

  React.useEffect(() => {
    const nextAllowed = getAllowedKolamComplaintVendorClaimStatuses(
      vendorClaim?.status || 'pending_submission',
    );
    setNextStatus(nextAllowed[0] || vendorClaim?.status || 'pending_submission');
    setClaimReference(vendorClaim?.claimReference || '');
    setVendorResponseNote(vendorClaim?.vendorResponseNote || '');
    setResolutionNote(vendorClaim?.resolutionNote || '');
    setNote('');
  }, [
    complaint.id,
    vendorClaim?.claimReference,
    vendorClaim?.resolutionNote,
    vendorClaim?.status,
    vendorClaim?.vendorResponseNote,
  ]);

  return (
    <>
      <Text style={styles.sectionTitle}>Klaim vendor</Text>
      <KolamDescriptionList
        accessibilityLabel="Klaim vendor"
        rows={[
          descRow(
            'vc-status',
            'Status',
            getKolamComplaintVendorClaimStatusLabel(currentStatus),
          ),
          ...(vendorClaim?.claimReference
            ? [descRow('vc-ref', 'Referensi', vendorClaim.claimReference)]
            : []),
          ...(vendorClaim?.submittedAt
            ? [
                descRow(
                  'vc-sub',
                  'Diajukan',
                  formatListDate(vendorClaim.submittedAt),
                ),
              ]
            : []),
          ...(vendorClaim?.submittedByLabel
            ? [descRow('vc-by', 'Oleh', vendorClaim.submittedByLabel)]
            : []),
        ]}
      />
      {vendorClaim?.vendorResponseNote ? (
        <Text style={styles.metaText}>{vendorClaim.vendorResponseNote}</Text>
      ) : null}
      {vendorClaim?.resolutionNote ? (
        <Text style={styles.metaText}>{vendorClaim.resolutionNote}</Text>
      ) : null}

      {canEdit ? (
        <View style={styles.workflowBlock}>
          <Text style={styles.workflowBlockTitle}>Perbarui klaim vendor</Text>
          <KolamDropdownSelect
            accessibilityLabel="Status klaim vendor"
            label="Status"
            menuPlacement="inline"
            onChange={value =>
              setNextStatus(value as KolamComplaintVendorClaimStatus)
            }
            options={allowed.map(status => ({
              label: getKolamComplaintVendorClaimStatusLabel(status),
              value: status,
            }))}
            showLabelInTrigger={false}
            value={nextStatus}
          />
          {nextStatus === 'submitted_to_vendor' ||
          vendorClaim?.claimReference ? (
            <KolamFormTextField
              onChangeText={setClaimReference}
              placeholder="Referensi klaim"
              value={claimReference}
            />
          ) : null}
          {nextStatus === 'vendor_approved' ||
          nextStatus === 'vendor_rejected' ||
          vendorClaim?.vendorResponseNote ? (
            <KolamFormTextField
              multiline
              numberOfLines={2}
              onChangeText={setVendorResponseNote}
              placeholder="Catatan respons vendor"
              style={styles.workflowNote}
              value={vendorResponseNote}
            />
          ) : null}
          {nextStatus === 'resolved' || vendorClaim?.resolutionNote ? (
            <KolamFormTextField
              multiline
              numberOfLines={2}
              onChangeText={setResolutionNote}
              placeholder="Catatan penyelesaian"
              style={styles.workflowNote}
              value={resolutionNote}
            />
          ) : null}
          <KolamFormTextField
            multiline
            numberOfLines={3}
            onChangeText={setNote}
            placeholder="Catatan internal (min. 10 karakter)"
            style={styles.workflowNote}
            value={note}
          />
          <KolamButton
            disabled={busy || note.trim().length < 10}
            intent="primary"
            label={busy ? 'Menyimpan…' : 'Simpan klaim vendor'}
            onPress={() => {
              void controller
                .onUpdateVendorClaim({
                  status: nextStatus,
                  note,
                  claimReference,
                  vendorResponseNote,
                  resolutionNote,
                })
                .then(ok => {
                  if (ok) {
                    setNote('');
                  }
                });
            }}
          />
        </View>
      ) : null}
    </>
  );
}

function KolamComplaintServiceContextCard({
  complaint,
  controller,
  onRouteChange,
}: {
  complaint: KolamComplaint;
  controller: KolamComplaintController;
  onRouteChange?: (route: string) => void;
}) {
  if (!canShowKolamComplaintServiceContext(complaint)) {
    return null;
  }

  const busy = controller.mutating || controller.loading;
  const pending = complaint.pendingService;
  const subscription = complaint.subscription;
  const ctx = complaint.serviceContext;
  const canSpawn = canSpawnKolamComplaintServiceReworkVisit(complaint);

  return (
    <>
      <Text style={styles.sectionTitle}>Layanan & kontrol layanan</Text>
      <KolamDescriptionList
        accessibilityLabel="Konteks layanan"
        rows={[
          ...(pending
            ? [
                descRow(
                  'svc-pending',
                  'Voucher',
                  pending.serviceSerial || pending.id.slice(-8),
                ),
              ]
            : []),
          ...(subscription
            ? [
                descRow(
                  'svc-sub',
                  'Langganan',
                  subscription.subscriptionNumber || subscription.id.slice(-8),
                ),
              ]
            : []),
          ...(ctx?.taskId
            ? [
                descRow(
                  'svc-visit',
                  'Kunjungan',
                  ctx.visitTitle ||
                    `${ctx.taskKind || 'tugas'} · ${ctx.packageTaskCode || ctx.taskId.slice(-6)}`,
                ),
              ]
            : []),
        ]}
      />
      <View style={styles.photoActions}>
        {pending?.id ? (
          <KolamButton
            intent="plain"
            label="Buka voucher"
            onPress={() =>
              onRouteChange?.(`/layanan/voucher/${pending.id}`)
            }
          />
        ) : null}
        {subscription?.id ? (
          <KolamButton
            intent="plain"
            label="Buka langganan"
            onPress={() =>
              onRouteChange?.(`/layanan/langganan/${subscription.id}`)
            }
          />
        ) : null}
        {pending?.id && ctx?.executionId ? (
          <KolamButton
            intent="plain"
            label="Detail eksekusi"
            onPress={() =>
              onRouteChange?.(
                `/layanan/voucher/${pending.id}/execution/${ctx.executionId}`,
              )
            }
          />
        ) : null}
      </View>
      {canSpawn ? (
        <KolamButton
          disabled={busy}
          intent="primary"
          label={
            busy ? 'Membuat…' : 'Tambah kunjungan rework di Kontrol Layanan'
          }
          onPress={() => {
            void controller.onSpawnServiceReworkVisit();
          }}
        />
      ) : null}
    </>
  );
}

function KolamComplaintReworkProgressCard({
  complaint,
}: {
  complaint: KolamComplaint;
}) {
  if (
    isWarrantyClaimComplaint(complaint) ||
    complaint.decision !== 'rework'
  ) {
    return null;
  }

  const current = getKolamComplaintCurrentRework(complaint);

  return (
    <>
      <Text style={styles.sectionTitle}>Pelacakan rework</Text>
      <KolamDescriptionList
        accessibilityLabel="Rework"
        rows={[
          descRow(
            'rw-count',
            'Hitungan',
            `${complaint.reworkCount} / ${complaint.maxRework}`,
          ),
          ...(current
            ? [
                descRow(
                  'rw-num',
                  'Rework aktif',
                  `#${current.reworkNumber}`,
                ),
                descRow(
                  'rw-status',
                  'Status',
                  getKolamComplaintReworkStatusLabel(current.status),
                ),
                ...(current.assignedToLabel
                  ? [descRow('rw-asg', 'Ditugaskan', current.assignedToLabel)]
                  : []),
                ...(current.resultNote
                  ? [descRow('rw-result', 'Hasil', current.resultNote)]
                  : []),
                ...(current.customerAccepted === true
                  ? [descRow('rw-cust', 'Pelanggan', 'Menerima hasil')]
                  : current.customerAccepted === false
                    ? [descRow('rw-cust', 'Pelanggan', 'Menolak hasil')]
                    : complaint.status === 'rework_review'
                      ? [
                          descRow(
                            'rw-cust',
                            'Pelanggan',
                            'Menunggu review',
                          ),
                        ]
                      : []),
              ]
            : [descRow('rw-empty', 'Status', 'Belum ada pelacakan')]),
        ]}
      />
      {current?.photos.length ? (
        <View style={styles.photoRow}>
          {current.photos.map(photo =>
            photo.uri ? (
              <KolamRemoteImage
                accessibilityLabel="Bukti rework"
                key={photo.id}
                resizeMode="cover"
                sourceUri={photo.uri}
                style={styles.photo}
              />
            ) : null,
          )}
        </View>
      ) : null}
      {complaint.reworkTracking.length > 1 ? (
        <Text style={styles.metaText}>
          Riwayat:{' '}
          {complaint.reworkTracking
            .map(
              row =>
                `#${row.reworkNumber} ${getKolamComplaintReworkStatusLabel(row.status)}`,
            )
            .join(' · ')}
        </Text>
      ) : null}
    </>
  );
}

function KolamComplaintReworkWorkflow({
  complaint,
  controller,
}: {
  complaint: KolamComplaint;
  controller: KolamComplaintController;
}) {
  if (!canUpdateKolamComplaintReworkStatus(complaint)) {
    if (
      complaint.decision === 'rework' &&
      !isWarrantyClaimComplaint(complaint) &&
      getKolamComplaintCurrentRework(complaint)?.status === 'completed' &&
      complaint.status === 'rework_review'
    ) {
      return (
        <View style={styles.workflowBlock}>
          <Text style={styles.workflowBlockTitle}>Update rework</Text>
          <Text style={styles.metaText}>
            Menunggu review pelanggan atas hasil rework.
          </Text>
        </View>
      );
    }
    return null;
  }

  const current = getKolamComplaintCurrentRework(complaint);
  if (!current) {
    return null;
  }

  const allowed = getAllowedKolamComplaintReworkStatuses(current.status);
  const busy = controller.mutating || controller.loading;
  const [nextStatus, setNextStatus] = React.useState<KolamComplaintReworkStatus>(
    allowed[0] || current.status,
  );
  const [note, setNote] = React.useState('');
  const [resultNote, setResultNote] = React.useState(current.resultNote || '');
  const [photoUris, setPhotoUris] = React.useState<string[]>([]);

  React.useEffect(() => {
    const nextAllowed = getAllowedKolamComplaintReworkStatuses(current.status);
    setNextStatus(nextAllowed[0] || current.status);
    setNote('');
    setResultNote(current.resultNote || '');
    setPhotoUris([]);
  }, [complaint.id, current.id, current.resultNote, current.status]);

  return (
    <View style={styles.workflowBlock}>
      <Text style={styles.workflowBlockTitle}>Update rework</Text>
      <Text style={styles.metaText}>
        Rework #{current.reworkNumber} dari maks. {complaint.maxRework} ·{' '}
        {getKolamComplaintReworkStatusLabel(current.status)}
      </Text>
      <KolamDropdownSelect
        accessibilityLabel="Status rework"
        label="Status rework"
        menuPlacement="inline"
        onChange={value => setNextStatus(value as KolamComplaintReworkStatus)}
        options={allowed.map(status => ({
          label: getKolamComplaintReworkStatusLabel(status),
          value: status,
        }))}
        showLabelInTrigger={false}
        value={nextStatus}
      />
      {nextStatus === 'in_progress' ? (
        <KolamFormTextField
          multiline
          numberOfLines={3}
          onChangeText={setNote}
          placeholder="Catatan mulai rework…"
          style={styles.workflowNote}
          value={note}
        />
      ) : null}
      {nextStatus === 'completed' || nextStatus === 'failed' ? (
        <>
          <KolamFormTextField
            multiline
            numberOfLines={3}
            onChangeText={setResultNote}
            placeholder={
              nextStatus === 'completed'
                ? 'Catatan hasil rework…'
                : 'Alasan gagal…'
            }
            style={styles.workflowNote}
            value={resultNote}
          />
          <View style={styles.photoActions}>
            <KolamButton
              label={`Tambah foto (${photoUris.length})`}
              onPress={() => {
                void pickNativeImageFile().then(result => {
                  if (!result?.uri) {
                    return;
                  }
                  setPhotoUris(currentPhotos => [
                    ...currentPhotos,
                    result.uri!,
                  ]);
                });
              }}
            />
          </View>
          {photoUris.length ? (
            <View style={styles.photoRow}>
              {photoUris.map((uri, index) => (
                <View key={`${uri}-${index}`} style={styles.localPhotoItem}>
                  <Image source={{ uri }} style={styles.localPhotoThumb} />
                  <KolamButton
                    intent="plain"
                    label="Hapus"
                    onPress={() =>
                      setPhotoUris(currentPhotos =>
                        currentPhotos.filter(
                          (_, photoIndex) => photoIndex !== index,
                        ),
                      )
                    }
                  />
                </View>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
      <KolamButton
        disabled={
          busy ||
          (nextStatus === 'in_progress' && !note.trim()) ||
          ((nextStatus === 'completed' || nextStatus === 'failed') &&
            !resultNote.trim())
        }
        intent="primary"
        label={busy ? 'Menyimpan…' : 'Update rework'}
        onPress={() => {
          void controller
            .onUpdateReworkStatus({
              status: nextStatus,
              ...(nextStatus === 'in_progress' ? { note } : {}),
              ...(nextStatus === 'completed' || nextStatus === 'failed'
                ? { resultNote, photoUris }
                : {}),
            })
            .then(ok => {
              if (ok) {
                setNote('');
                setPhotoUris([]);
              }
            });
        }}
      />
    </View>
  );
}

function KolamComplaintReworkCustomerResponseWorkflow({
  complaint,
  controller,
}: {
  complaint: KolamComplaint;
  controller: KolamComplaintController;
}) {
  if (!canSubmitKolamComplaintReworkCustomerResponse(complaint)) {
    return null;
  }

  const current = getKolamComplaintCurrentRework(complaint);
  const busy = controller.mutating || controller.loading;
  const [accepted, setAccepted] = React.useState<'yes' | 'no' | ''>('');
  const [note, setNote] = React.useState('');
  const nearMax =
    complaint.reworkCount >= Math.max(0, complaint.maxRework - 1);

  return (
    <View style={styles.workflowBlock}>
      <Text style={styles.workflowBlockTitle}>Review hasil rework</Text>
      {current?.resultNote ? (
        <Text style={styles.metaText}>{current.resultNote}</Text>
      ) : null}
      <KolamDropdownSelect
        accessibilityLabel="Respons pelanggan"
        label="Respons"
        menuPlacement="inline"
        onChange={value => setAccepted(value as 'yes' | 'no' | '')}
        options={[
          { label: 'Pilih respons…', value: '' },
          { label: 'Terima hasil', value: 'yes' },
          { label: 'Tolak hasil', value: 'no' },
        ]}
        showLabelInTrigger={false}
        value={accepted}
      />
      {accepted === 'no' && nearMax ? (
        <KolamStatusBadge
          intent="warning"
          label={`Penolakan ini dapat memicu alur refund (batas ${complaint.maxRework}x rework).`}
          numberOfLines={3}
          style={styles.banner}
        />
      ) : null}
      <KolamFormTextField
        multiline
        numberOfLines={2}
        onChangeText={setNote}
        placeholder="Catatan (opsional)"
        style={styles.workflowNote}
        value={note}
      />
      <KolamButton
        disabled={busy || !accepted}
        intent={accepted === 'no' ? 'danger' : 'primary'}
        label={
          busy
            ? 'Mengirim…'
            : accepted === 'yes'
              ? 'Terima hasil'
              : accepted === 'no'
                ? 'Tolak hasil'
                : 'Kirim respons'
        }
        onPress={() => {
          if (!accepted) {
            return;
          }
          void controller
            .onSubmitReworkCustomerResponse({
              accepted: accepted === 'yes',
              note,
            })
            .then(ok => {
              if (ok) {
                setAccepted('');
                setNote('');
              }
            });
        }}
      />
    </View>
  );
}

function KolamComplaintRefundWorkflow({
  complaint,
  controller,
}: {
  complaint: KolamComplaint;
  controller: KolamComplaintController;
}) {
  const step = getKolamComplaintRefundWorkflowStep(complaint);
  const busy = controller.mutating || controller.loading;
  const [walletId, setWalletId] = React.useState('');
  const [transactionNote, setTransactionNote] = React.useState('');
  const [accountNumber, setAccountNumber] = React.useState('');
  const [accountName, setAccountName] = React.useState('');
  const [bank, setBank] = React.useState('');
  const [transferDate, setTransferDate] = React.useState('');
  const [transferMethod, setTransferMethod] = React.useState('transfer');
  const [paymentNote, setPaymentNote] = React.useState('');
  const [photoUris, setPhotoUris] = React.useState<string[]>([]);
  const [confirmNote, setConfirmNote] = React.useState('');

  React.useEffect(() => {
    setWalletId('');
    setTransactionNote('');
    setAccountNumber('');
    setAccountName('');
    setBank('');
    setTransferDate('');
    setTransferMethod('transfer');
    setPaymentNote('');
    setPhotoUris([]);
    setConfirmNote('');
  }, [complaint.id, step]);

  if (isKolamComplaintRefundAwaitingReturn(complaint)) {
    return (
      <View style={styles.workflowBlock}>
        <Text style={styles.workflowBlockTitle}>Pembayaran refund</Text>
        <Text style={styles.metaText}>
          Retur harus diterima dan diverifikasi dulu sebelum membuat transaksi
          refund.
        </Text>
      </View>
    );
  }

  if (step === 'unavailable' && !complaint.refundPaymentStatus) {
    return null;
  }

  if (step === 'completed' || complaint.refundPaymentStatus === 'completed') {
    return (
      <View style={styles.workflowBlock}>
        <Text style={styles.workflowBlockTitle}>Pembayaran refund</Text>
        <KolamStatusBadge
          intent="success"
          label="Refund selesai — transaksi wallet dikonfirmasi."
          numberOfLines={2}
          style={styles.banner}
        />
      </View>
    );
  }

  if (!canOpenKolamComplaintRefundPayment(complaint) && step !== 'create') {
    return null;
  }

  return (
    <View style={styles.workflowBlock}>
      <Text style={styles.workflowBlockTitle}>Pembayaran refund</Text>
      <Text style={styles.metaText}>
        Jumlah: {formatRupiah(complaint.refundAmount || 0)}
      </Text>

      {step === 'create' ? (
        <>
          <KolamDropdownSelect
            accessibilityLabel="Pilih wallet"
            label="Wallet"
            menuPlacement="inline"
            onChange={setWalletId}
            options={[
              { label: 'Pilih wallet…', value: '' },
              ...controller.walletOptions.map(wallet => ({
                label: `${wallet.name} · ${formatRupiah(wallet.currentBalance)}`,
                value: wallet.id,
              })),
            ]}
            searchable={controller.walletOptions.length > 8}
            searchPlaceholder="Cari wallet…"
            showLabelInTrigger={false}
            value={walletId}
          />
          <KolamFormTextField
            multiline
            numberOfLines={2}
            onChangeText={setTransactionNote}
            placeholder="Catatan transaksi (opsional)"
            style={styles.workflowNote}
            value={transactionNote}
          />
          <KolamButton
            disabled={busy || !walletId || complaint.refundAmount <= 0}
            intent="primary"
            label={busy ? 'Menyimpan…' : 'Buat transaksi refund'}
            onPress={() => {
              void controller.onCreateRefundTransaction({
                walletId,
                note: transactionNote,
              });
            }}
          />
        </>
      ) : null}

      {step === 'send' ? (
        <>
          {complaint.refundTransaction ? (
            <Text style={styles.metaText}>
              Wallet: {complaint.refundTransaction.walletName} · Status txn:{' '}
              {complaint.refundTransaction.confirmStatus || 'unconfirmed'}
            </Text>
          ) : null}
          <KolamFormTextField
            onChangeText={setAccountNumber}
            placeholder="Nomor rekening *"
            value={accountNumber}
          />
          <KolamFormTextField
            onChangeText={setAccountName}
            placeholder="Nama pemilik rekening *"
            value={accountName}
          />
          <KolamFormTextField
            onChangeText={setBank}
            placeholder="Bank *"
            value={bank}
          />
          <KolamFormTextField
            onChangeText={setTransferDate}
            placeholder="Tanggal transfer (YYYY-MM-DD)"
            value={transferDate}
          />
          <KolamDropdownSelect
            accessibilityLabel="Metode transfer"
            label="Metode"
            menuPlacement="inline"
            onChange={setTransferMethod}
            options={KOLAM_COMPLAINT_REFUND_TRANSFER_METHOD_OPTIONS.map(
              option => ({
                label: option.label,
                value: option.id,
              }),
            )}
            showLabelInTrigger={false}
            value={transferMethod}
          />
          <KolamFormTextField
            multiline
            numberOfLines={2}
            onChangeText={setPaymentNote}
            placeholder="Catatan pembayaran (opsional)"
            style={styles.workflowNote}
            value={paymentNote}
          />
          <View style={styles.photoActions}>
            <KolamButton
              label={`Tambah bukti (${photoUris.length})`}
              onPress={() => {
                void pickNativeImageFile().then(result => {
                  if (!result?.uri) {
                    return;
                  }
                  setPhotoUris(current => [...current, result.uri!]);
                });
              }}
            />
          </View>
          {photoUris.length ? (
            <View style={styles.photoRow}>
              {photoUris.map((uri, index) => (
                <View key={`${uri}-${index}`} style={styles.localPhotoItem}>
                  <Image source={{ uri }} style={styles.localPhotoThumb} />
                  <KolamButton
                    intent="plain"
                    label="Hapus"
                    onPress={() =>
                      setPhotoUris(current =>
                        current.filter((_, photoIndex) => photoIndex !== index),
                      )
                    }
                  />
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.metaText}>Minimal satu foto bukti wajib.</Text>
          )}
          <KolamButton
            disabled={
              busy ||
              !accountNumber.trim() ||
              !accountName.trim() ||
              !bank.trim() ||
              photoUris.length === 0
            }
            intent="primary"
            label={busy ? 'Mengirim…' : 'Kirim bukti refund'}
            onPress={() => {
              void controller
                .onSendRefundPayment({
                  accountNumber,
                  accountName,
                  bank,
                  transferDate,
                  transferMethod,
                  note: paymentNote,
                  photoUris,
                })
                .then(ok => {
                  if (ok) {
                    setPhotoUris([]);
                    setPaymentNote('');
                  }
                });
            }}
          />
        </>
      ) : null}

      {step === 'confirm' ? (
        <>
          <Text style={styles.metaText}>
            Periksa detail pembayaran di atas, lalu konfirmasi transaksi wallet.
            Saldo wallet akan dipotong.
          </Text>
          <KolamFormTextField
            multiline
            numberOfLines={2}
            onChangeText={setConfirmNote}
            placeholder="Catatan konfirmasi (opsional)"
            style={styles.workflowNote}
            value={confirmNote}
          />
          <KolamButton
            disabled={busy || !complaint.refundTransaction?.id}
            intent="primary"
            label={busy ? 'Mengonfirmasi…' : 'Konfirmasi transaksi'}
            onPress={() => {
              void controller.onConfirmRefundPayment({
                confirmNote,
              });
            }}
          />
        </>
      ) : null}
    </View>
  );
}

function formatListDate(value?: string) {
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
  detailToolbarContext: {
    color: V.colors.fg,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '700',
    maxWidth: 420,
    minWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  toolbarButton: {
    flexShrink: 0,
    minHeight: 34,
    paddingHorizontal: 10,
  },
  complaintToolbarRow: {
    flexWrap: 'nowrap',
    minWidth: 0,
  },
  complaintToolbarFilters: {
    flexGrow: 1,
    flexShrink: 1,
    flexWrap: 'nowrap',
    minWidth: 0,
  },
  complaintSearchInput: {
    flexBasis: 150,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 104,
  },
  complaintFilterTrigger: {
    flexShrink: 1,
    maxWidth: 108,
    minWidth: 82,
  },
  complaintFilterTriggerWide: {
    flexShrink: 1,
    maxWidth: 124,
    minWidth: 92,
  },
  complaintToolbarActions: {
    flexGrow: 0,
    flexShrink: 0,
    flexWrap: 'nowrap',
    marginLeft: 'auto',
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
  cellText: {
    color: V.colors.fg,
    fontSize: 13,
  },
  identityCell: {
    minWidth: 0,
    width: '100%',
  },
  centerCell: {
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
    width: '100%',
  },
  cellTextCenter: {
    color: V.colors.fg,
    fontSize: 13,
    textAlign: 'center',
    width: '100%',
  },
  metaTextCenter: {
    color: V.colors.mutedFg,
    fontSize: 12,
    textAlign: 'center',
    width: '100%',
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
  switchInline: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    gap: 6,
  },
  detailRoot: {
    flexGrow: 0,
  },
  detailContent: {
    gap: 12,
    paddingBottom: 24,
  },
  stripCard: {
    overflow: 'hidden',
    paddingLeft: 12,
    paddingRight: 12,
    paddingVertical: 0,
  },
  stripRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    minHeight: 72,
  },
  stripItem: {
    gap: 4,
    justifyContent: 'center',
    minWidth: 120,
    paddingVertical: 12,
  },
  stripLabel: {
    color: V.colors.mutedFg,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  stripValue: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '700',
  },
  stripSourceSlot: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    marginLeft: 'auto',
    minHeight: 72,
    width: 88,
  },
  stripSourceLogo: {
    height: 72,
    width: 88,
  },
  banner: {
    alignSelf: 'stretch',
  },
  columns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  columnMain: {
    flex: 2,
    flexBasis: 420,
    gap: 10,
    minWidth: 280,
  },
  columnSide: {
    flex: 1,
    flexBasis: 280,
    gap: 10,
    minWidth: 240,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  workflowPanel: {
    gap: 12,
    marginTop: 8,
  },
  workflowBlock: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
    padding: 12,
  },
  workflowBlockTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
  },
  workflowNote: {
    minHeight: 72,
    width: '100%',
  },
  itemCard: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
    paddingVertical: 8,
  },
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photo: {
    borderRadius: 8,
    height: 88,
    width: 88,
  },
  photoActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  localPhotoItem: {
    gap: 4,
    width: 88,
  },
  localPhotoThumb: {
    borderRadius: 8,
    height: 88,
    width: 88,
  },
  historyCard: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  placeholder: {
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
  },
});
