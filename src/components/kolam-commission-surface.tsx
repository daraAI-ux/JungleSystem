import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { KOLAM_COMMISSION_ROOT } from '../domain/kolam-commission';
import {
  canReleaseCommissionRowFromNormalized,
  getCommissionStatusIntent,
  KOLAM_COMMISSION_STATUS_FILTER_OPTIONS,
  type KolamCommissionListRow,
  type KolamCommissionRecipientSummaryRow,
  type KolamCommissionStatusFilter,
} from '../domain/kolam-commission';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { useKolamCommissionListController } from '../hooks/use-kolam-commission-list-controller';
import { getKolamFileUrl } from '../lib/file-url';
import { formatRupiah } from '../lib/money';
import { resolveProfilePhotoUrl } from '../services/auth-api';
import { KolamButton } from './kolam-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamListTableComposition } from './kolam-list-table-composition';
import { KolamProfileAvatarContent } from './kolam-profile-avatar-content';
import { KolamSearchField } from './kolam-search-field';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

export function KolamCommissionSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamCommissionListController(route, onRouteChange);

  if (!controller.canView) {
    return (
      <View style={styles.surface}>
        <KolamEmptyState title="Akses ditolak" />
      </View>
    );
  }

  if (controller.mode === 'unsupported') {
    return (
      <View style={styles.surface}>
        <KolamEmptyState title="Belum tersedia" />
        {onRouteChange ? (
          <KolamButton
            intent="secondary"
            label="Kembali"
            onPress={() => onRouteChange(KOLAM_COMMISSION_ROOT)}
            style={styles.backButton}
          />
        ) : null}
      </View>
    );
  }

  return <CommissionListBody controller={controller} />;
}

function CommissionListBody({
  controller,
}: {
  controller: ReturnType<typeof useKolamCommissionListController>;
}) {
  const [searchInput, setSearchInput] = useState(controller.filters.search);

  useEffect(() => {
    setSearchInput(controller.filters.search);
  }, [controller.filters.search]);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (searchInput !== controller.filters.search) {
        controller.onSearchChange(searchInput);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [controller, searchInput]);

  const walletOptions = React.useMemo(
    () =>
      controller.wallets.map(wallet => ({
        label: wallet.name,
        value: wallet.id,
      })),
    [controller.wallets],
  );
  const walletSelectOptions = React.useMemo(
    () => [{ label: 'Dompet', value: '' }, ...walletOptions],
    [walletOptions],
  );
  const filteredRecipientLabel =
    controller.recipientSummaryRows.find(
      row => row.recipientUser === controller.filters.recipientUser,
    )?.displayName ?? controller.filters.recipientUser;
  const summaryMetricItems = [
    {
      id: 'accrued',
      label: 'Saldo terakru',
      value: formatRupiah(controller.summaryTotals.totalAccrued),
      meta: `${controller.summaryTotals.countAccrued} baris`,
    },
    {
      id: 'released',
      label: 'Dibayar',
      value: formatRupiah(controller.summaryTotals.totalReleased),
      meta: `${controller.summaryTotals.countReleased} baris`,
    },
    {
      id: 'recipients',
      label: 'Penerima',
      value: String(controller.summaryTotals.recipientCount),
      meta: 'Penerima',
    },
    {
      id: 'ledger',
      label: 'Baris buku besar',
      value: String(controller.pagination.total),
      meta: 'Sesuai filter',
    },
  ];

  const safePage = Math.max(1, controller.pagination.page);

  const recipientSummaryColumns = React.useMemo(
    () => [
      {
        flex: 1.4,
        id: 'recipient',
        label: 'Penerima',
        render: (row: KolamCommissionRecipientSummaryRow) => (
          <View style={styles.summaryRecipientIdentity}>
            <View
              accessibilityLabel={`Penerima ${row.displayName}`}
              style={styles.recipientAvatar}
            >
              <KolamProfileAvatarContent
                imageStyle={styles.recipientAvatarImage}
                imageUrl={getRecipientSummaryPhotoUrl(row.profilePicture)}
                initials={getRecipientSummaryInitials(row.displayName)}
                textStyle={styles.recipientAvatarText}
              />
            </View>
            <View style={styles.summaryRecipientText}>
              <Text numberOfLines={1} style={styles.primaryText}>
                {row.displayName}
              </Text>
              {row.email ? (
                <Text numberOfLines={1} style={styles.metaText}>
                  {row.email}
                </Text>
              ) : null}
            </View>
          </View>
        ),
      },
      {
        align: 'right' as const,
        flex: 1,
        id: 'accrued',
        label: 'Terakru',
        render: (row: KolamCommissionRecipientSummaryRow) => (
          <Text numberOfLines={1} style={styles.primaryText}>
            {formatRupiah(row.totalAccrued)}
          </Text>
        ),
      },
      {
        align: 'right' as const,
        flex: 1,
        id: 'released',
        label: 'Dibayar',
        render: (row: KolamCommissionRecipientSummaryRow) => (
          <Text numberOfLines={1} style={styles.primaryText}>
            {formatRupiah(row.totalReleased)}
          </Text>
        ),
      },
      {
        align: 'right' as const,
        flex: 1.1,
        id: 'count',
        label: 'Baris',
        render: (row: KolamCommissionRecipientSummaryRow) => (
          <View style={styles.summaryCountStack}>
            <KolamStatusBadge
              intent="warning"
              label={`${row.countAccrued} terakru`}
              style={styles.summaryBadge}
            />
            <KolamStatusBadge
              intent="success"
              label={`${row.countReleased} dibayar`}
              style={styles.summaryBadge}
            />
          </View>
        ),
      },
      {
        align: 'center' as const,
        flex: 0.9,
        id: 'action',
        label: 'Aksi',
        render: (row: KolamCommissionRecipientSummaryRow) => (
          <KolamButton
            intent="secondary"
            label="Lihat baris"
            onPress={() => controller.onRecipientFilterChange(row.recipientUser)}
            style={styles.summaryActionButton}
          />
        ),
      },
    ],
    [controller],
  );

  const commissionColumns = React.useMemo(
    () => [
      {
        flex: 1,
        id: 'invoice',
        label: 'Invoice',
        render: (item: KolamCommissionListRow) => (
          <View>
            <Text numberOfLines={1} style={styles.primaryText}>
              {item.invoiceLabel}
            </Text>
            {item.saleCashflowSessionStatus ? (
              <Text numberOfLines={1} style={styles.metaText}>
                {item.saleCashflowSessionStatus}
              </Text>
            ) : null}
          </View>
        ),
      },
      {
        flex: 1,
        id: 'recipient',
        label: 'Penerima',
        render: (item: KolamCommissionListRow) => (
          <View>
            <Text numberOfLines={1} style={styles.primaryText}>
              {item.recipientLabel}
            </Text>
          </View>
        ),
      },
      {
        flex: 1.1,
        id: 'item',
        label: 'Item',
        render: (item: KolamCommissionListRow) => (
          <View>
            <Text numberOfLines={1} style={styles.primaryText}>
              {item.itemLabel}
            </Text>
            <Text numberOfLines={1} style={styles.metaText}>
              {item.itemSku} | {item.itemType}
              {item.quantity ? ` | Jml ${item.quantity}` : ''}
            </Text>
          </View>
        ),
      },
      {
        flex: 0.9,
        id: 'status',
        label: 'Status',
        render: (item: KolamCommissionListRow) => (
          <View>
            <KolamStatusBadge
              intent={getCommissionStatusIntent(item.status)}
              label={item.statusLabel}
            />
            <Text numberOfLines={1} style={styles.metaText}>
              {item.deliveryStatusLabel}
            </Text>
          </View>
        ),
      },
      {
        flex: 0.9,
        id: 'amount',
        label: 'Komisi',
        render: (item: KolamCommissionListRow) => (
          <View>
            <Text style={styles.primaryText}>
              {formatRupiah(item.commissionAmount)}
            </Text>
            {item.pph21.applicable && item.pph21.amount > 0 ? (
              <Text numberOfLines={2} style={styles.taxText}>
                PPh 21 {item.pph21.rate}%: -{formatRupiah(item.pph21.amount)} |
                bersih{' '}
                {formatRupiah(item.pph21.netPayable || item.commissionAmount)}
              </Text>
            ) : null}
            <Text numberOfLines={1} style={styles.metaText}>
              {item.commissionRateLabel}
            </Text>
          </View>
        ),
      },
      {
        flex: 1.2,
        id: 'action',
        label: 'Pembayaran',
        render: (item: KolamCommissionListRow) => {
          const showRelease =
            controller.canRelease && canReleaseCommissionRowFromNormalized(item);
          const selectedWallet = controller.walletByRow[item.id] ?? '';

          return showRelease ? (
              <View style={styles.releaseRow}>
                <KolamDropdownSelect
                  label="Dompet"
                  menuStyle={styles.releaseWalletMenu}
                  onChange={value => controller.onWalletChange(item.id, value)}
                  options={walletSelectOptions}
                  showLabelInTrigger={false}
                  style={styles.releaseWalletSelect}
                  triggerStyle={styles.releaseWalletTrigger}
                  triggerTextStyle={styles.releaseWalletTriggerText}
                  value={selectedWallet}
                />
                <KolamButton
                  disabled={!selectedWallet || controller.releasingId !== null}
                  intent="primary"
                  label={controller.releasingId === item.id ? '...' : 'Bayar'}
                  onPress={() => {
                    void controller.onRelease(item);
                  }}
                  style={styles.releaseButton}
                />
              </View>
          ) : item.status === 'released' ? (
              <View style={styles.paymentStack}>
                <KolamStatusBadge
                  intent="success"
                  label="Dibayar"
                  style={styles.paymentBadge}
                />
                <Text numberOfLines={1} style={styles.metaText}>
                  {item.releasedAtLabel}
                </Text>
                {item.transferProof ? (
                  <Text numberOfLines={1} style={styles.linkText}>
                    Bukti transfer
                  </Text>
                ) : (
                  <KolamButton
                    disabled={controller.uploadingProofId === item.id}
                    intent="secondary"
                    label={
                      controller.uploadingProofId === item.id
                        ? 'Mengunggah...'
                        : 'Upload bukti'
                    }
                    onPress={() => {
                      void controller.onUploadTransferProof(item);
                    }}
                    style={styles.uploadProofButton}
                  />
                )}
              </View>
          ) : null;
        },
      },
    ],
    [controller, walletSelectOptions],
  );

  return (
    <View style={styles.surface}>
      {controller.error ? (
        <KolamStatusBadge
          intent="danger"
          label={controller.error}
          numberOfLines={3}
          style={styles.banner}
        />
      ) : null}
      {controller.statusMessage ? (
        <KolamStatusBadge
          intent="success"
          label={controller.statusMessage}
          numberOfLines={2}
          style={styles.banner}
        />
      ) : null}

      <View style={styles.metricGrid}>
        {summaryMetricItems.map(item => (
          <KolamCardFrame key={item.id} style={styles.metricCard}>
            <Text numberOfLines={1} style={styles.metricLabel}>
              {item.label}
            </Text>
            <Text numberOfLines={1} style={styles.metricValue}>
              {item.value}
            </Text>
            <Text numberOfLines={1} style={styles.metricMeta}>
              {item.meta}
            </Text>
          </KolamCardFrame>
        ))}
      </View>

      <KolamCardFrame style={styles.summarySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ringkasan Penerima</Text>
          <Text style={styles.sectionMeta}>
            {controller.summaryLoading
              ? 'Memuat...'
              : `${controller.recipientSummaryRows.length} penerima`}
          </Text>
        </View>
        <KolamListTableComposition
          columns={recipientSummaryColumns}
          emptyTitle={
            controller.summaryLoading ? 'Memuat...' : 'Tidak ada data'
          }
          getRowKey={row => row.recipientUser || row.displayName}
          loading={controller.summaryLoading}
          rows={controller.recipientSummaryRows}
          showFooter={false}
          style={styles.summaryTableFrame}
        />
      </KolamCardFrame>

      {controller.canRelease ? (
        <KolamCardFrame style={styles.adminActionsPanel}>
          <View style={styles.adminActionGroup}>
            <Text style={styles.adminActionLabel}>Batch release</Text>
            <View style={styles.adminActionRow}>
              <KolamDropdownSelect
                label="Dompet"
                onChange={controller.onBatchWalletChange}
                options={walletSelectOptions}
                showLabelInTrigger={false}
                value={controller.batchWalletId}
              />
              <KolamButton
                disabled={
                  controller.adminAction !== null ||
                  controller.batchEligibleCount === 0 ||
                  !controller.batchWalletId
                }
                intent="primary"
                label={
                  controller.adminAction === 'release-batch'
                    ? 'Memproses...'
                    : `Bayar semua (${controller.batchEligibleCount})`
                }
                onPress={() => {
                  void controller.onReleaseBatch();
                }}
                style={styles.adminActionButton}
              />
            </View>
          </View>
          <View style={styles.adminActionGroup}>
            <Text style={styles.adminActionLabel}>Sale ID</Text>
            <View style={styles.adminActionRow}>
              <TextInput
                onChangeText={controller.onActionSaleIdChange}
                placeholder="Sale ID"
                placeholderTextColor={V.colors.mutedFg}
                style={styles.saleIdInput}
                value={controller.actionSaleId}
              />
              <KolamButton
                disabled={
                  controller.adminAction !== null ||
                  !controller.actionSaleId.trim()
                }
                intent="secondary"
                label={
                  controller.adminAction === 'accrue'
                    ? 'Memproses...'
                    : 'Accrue'
                }
                onPress={() => {
                  void controller.onAccrueSale();
                }}
                style={styles.adminActionButton}
              />
              <KolamButton
                disabled={
                  controller.adminAction !== null ||
                  !controller.actionSaleId.trim()
                }
                intent="secondary"
                label={
                  controller.adminAction === 'recalculate'
                    ? 'Memproses...'
                    : 'Recalculate'
                }
                onPress={() => {
                  void controller.onRecalculateSale();
                }}
                style={styles.adminActionButton}
              />
            </View>
          </View>
        </KolamCardFrame>
      ) : null}

      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <KolamSearchField
              containerStyle={kolamTableToolbarStyles.searchInput}
              onChangeText={setSearchInput}
              placeholder="Cari"
              value={searchInput}
            />
            <KolamDropdownSelect
              label="Status"
              onChange={value =>
                controller.onStatusChange(value as KolamCommissionStatusFilter)
              }
              options={KOLAM_COMMISSION_STATUS_FILTER_OPTIONS.map(option => ({
                label: option.label,
                value: option.value,
              }))}
              showLabelInTrigger={false}
              value={controller.filters.status}
            />
          </View>
          <View style={kolamTableToolbarStyles.actions}>
          </View>
        </View>
      </View>

      {controller.filters.recipientUser ? (
        <View style={styles.recipientFilterBar}>
          <KolamStatusBadge intent="primary" label="Filter penerima" />
          <Text numberOfLines={1} style={styles.recipientFilterText}>
            {filteredRecipientLabel}
          </Text>
          <KolamButton
            intent="secondary"
            label="Hapus"
            onPress={() => controller.onRecipientFilterChange('')}
            style={styles.clearRecipientButton}
          />
        </View>
      ) : null}

      <View style={styles.listRoot}>
        <KolamListTableComposition
          columns={commissionColumns}
          emptyTitle={controller.loading ? 'Memuat...' : 'Tidak ada data'}
          getRowKey={item => item.id}
          loading={controller.loading}
          pagination={{
            onPageChange: controller.onPageChange,
            page: safePage,
            pageSize: controller.pagination.limit,
            total: controller.pagination.total,
          }}
          rows={controller.rows}
          style={styles.tableFrame}
        />
      </View>
    </View>
  );
}

function getRecipientSummaryPhotoUrl(value: string) {
  return resolveProfilePhotoUrl(value) ?? getKolamFileUrl(value);
}

function getRecipientSummaryInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('') || '?'
  );
}

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    gap: 10,
    minHeight: 0,
  },
  banner: {
    alignSelf: 'stretch',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    flexBasis: 180,
    flexGrow: 1,
    minWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  metricLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  metricMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    marginTop: 2,
  },
  summarySection: {
    gap: 0,
    padding: 0,
  },
  sectionHeader: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '800',
  },
  sectionMeta: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryRecipientIdentity: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minWidth: 0,
  },
  summaryRecipientText: {
    flex: 1,
    minWidth: 0,
  },
  recipientAvatar: {
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
  recipientAvatarImage: {
    height: 32,
    width: 32,
  },
  recipientAvatarText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
  },
  summaryCountStack: {
    alignItems: 'flex-end',
    gap: 4,
  },
  summaryBadge: {
    alignSelf: 'flex-end',
  },
  summaryActionButton: {
    alignSelf: 'center',
    flexGrow: 0,
  },
  summaryTableFrame: {
    borderWidth: 0,
    minHeight: 0,
  },
  adminActionsPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  adminActionGroup: {
    flexGrow: 1,
    gap: 6,
    minWidth: 280,
  },
  adminActionLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  adminActionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  adminActionButton: {
    flexGrow: 0,
  },
  saleIdInput: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.input,
    borderRadius: V.radius.lg,
    borderWidth: 1,
    color: V.colors.fg,
    flexBasis: 220,
    flexGrow: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
    minHeight: V.control.inputHeight,
    minWidth: 180,
    paddingHorizontal: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  recipientFilterBar: {
    alignItems: 'center',
    backgroundColor: V.colors.tableHeader,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  recipientFilterText: {
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  clearRecipientButton: {
    flexGrow: 0,
  },
  listRoot: {
    flexGrow: 0,
    minHeight: 240,
  },
  tableFrame: {
    minHeight: 0,
  },
  primaryText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '500',
  },
  metaText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  taxText: {
    color: V.colors.warning,
    fontFamily: V.fontFamily,
    fontSize: 11,
  },
  paymentStack: {
    alignItems: 'flex-start',
    gap: 3,
  },
  paymentBadge: {
    alignSelf: 'flex-start',
  },
  uploadProofButton: {
    flexGrow: 0,
  },
  linkText: {
    color: V.colors.primary,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  releaseRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 6,
    minWidth: 0,
  },
  releaseWalletSelect: {
    flexBasis: 0,
    flexGrow: 1,
    flexShrink: 1,
    maxWidth: 118,
    minWidth: 0,
  },
  releaseWalletTrigger: {
    minWidth: 0,
    paddingHorizontal: 8,
  },
  releaseWalletTriggerText: {
    fontSize: 12,
    maxWidth: 72,
  },
  releaseWalletMenu: {
    minWidth: 118,
  },
  releaseButton: {
    flexGrow: 0,
    flexShrink: 0,
  },
});
