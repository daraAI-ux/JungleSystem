import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { KOLAM_COMMISSION_ROOT } from '../domain/kolam-commission';
import {
  canReleaseCommissionRowFromNormalized,
  getCommissionStatusIntent,
  KOLAM_COMMISSION_STATUS_FILTER_OPTIONS,
  type KolamCommissionListRow,
  type KolamCommissionStatusFilter,
} from '../domain/kolam-commission';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { useKolamCommissionListController } from '../hooks/use-kolam-commission-list-controller';
import { getKolamFileUrl } from '../lib/file-url';
import { formatRupiah } from '../lib/money';
import { resolveProfilePhotoUrl } from '../services/auth-api';
import { KolamButton } from './kolam-button';
import { KolamRefreshButton } from './kolam-refresh-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import {
  KolamDropdownSelect,
  KolamTableFooterControls,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamProfileAvatarContent } from './kolam-profile-avatar-content';
import { KolamSearchField } from './kolam-search-field';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

const COMMISSION_COLUMNS = [
  { id: 'invoice', label: 'Invoice', flex: 1 },
  { id: 'recipient', label: 'Penerima', flex: 1 },
  { id: 'item', label: 'Item', flex: 1.1 },
  { id: 'status', label: 'Status', flex: 0.9 },
  { id: 'amount', label: 'Komisi', flex: 0.9 },
  { id: 'action', label: 'Pembayaran', flex: 1.2 },
] as const;

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
  const pageCount = Math.max(1, controller.pagination.totalPages);

  const renderRow = React.useCallback(
    ({ item }: { item: KolamCommissionListRow }) => {
      const showRelease =
        controller.canRelease && canReleaseCommissionRowFromNormalized(item);
      const selectedWallet = controller.walletByRow[item.id] ?? '';

      return (
        <View style={styles.row}>
          <View style={[styles.cell, { flex: 1 }]}>
            <Text numberOfLines={1} style={styles.primaryText}>
              {item.invoiceLabel}
            </Text>
            {item.saleCashflowSessionStatus ? (
              <Text numberOfLines={1} style={styles.metaText}>
                {item.saleCashflowSessionStatus}
              </Text>
            ) : null}
          </View>
          <View style={[styles.cell, { flex: 1 }]}>
            <Text numberOfLines={1} style={styles.primaryText}>
              {item.recipientLabel}
            </Text>
          </View>
          <View style={[styles.cell, { flex: 1.1 }]}>
            <Text numberOfLines={1} style={styles.primaryText}>
              {item.itemLabel}
            </Text>
            <Text numberOfLines={1} style={styles.metaText}>
              {item.itemSku} | {item.itemType}
              {item.quantity ? ` | Jml ${item.quantity}` : ''}
            </Text>
          </View>
          <View style={[styles.cell, { flex: 0.9 }]}>
            <KolamStatusBadge
              intent={getCommissionStatusIntent(item.status)}
              label={item.statusLabel}
            />
            <Text numberOfLines={1} style={styles.metaText}>
              {item.deliveryStatusLabel}
            </Text>
          </View>
          <View style={[styles.cell, { flex: 0.9 }]}>
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
          <View style={[styles.cell, { flex: 1.2 }]}>
            {showRelease ? (
              <View style={styles.releaseRow}>
                <KolamDropdownSelect
                  label="Dompet"
                  onChange={value => controller.onWalletChange(item.id, value)}
                  options={walletSelectOptions}
                  showLabelInTrigger={false}
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
            ) : null}
          </View>
        </View>
      );
    },
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
        <View style={styles.summaryHeaderRow}>
          <View style={styles.summaryRecipientCell}>
            <Text style={styles.summaryHeaderText}>Penerima</Text>
          </View>
          <View style={styles.summaryMoneyCell}>
            <Text style={[styles.summaryHeaderText, styles.alignRight]}>
              Terakru
            </Text>
          </View>
          <View style={styles.summaryMoneyCell}>
            <Text style={[styles.summaryHeaderText, styles.alignRight]}>
              Dibayar
            </Text>
          </View>
          <View style={styles.summaryCountCell}>
            <Text style={[styles.summaryHeaderText, styles.alignRight]}>
              Baris
            </Text>
          </View>
          <View style={styles.summaryActionCell}>
            <Text style={[styles.summaryHeaderText, styles.alignRight]}>
              Aksi
            </Text>
          </View>
        </View>
        {controller.recipientSummaryRows.length ? (
          controller.recipientSummaryRows.map(row => (
            <View
              key={row.recipientUser || row.displayName}
              style={styles.summaryRow}
            >
              <View style={styles.summaryRecipientCell}>
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
              </View>
              <Text
                numberOfLines={1}
                style={[styles.primaryText, styles.summaryMoneyCell]}
              >
                {formatRupiah(row.totalAccrued)}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.primaryText, styles.summaryMoneyCell]}
              >
                {formatRupiah(row.totalReleased)}
              </Text>
              <View style={styles.summaryCountCell}>
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
              <View style={styles.summaryActionCell}>
                <KolamButton
                  intent="secondary"
                  label="Lihat baris"
                  onPress={() =>
                    controller.onRecipientFilterChange(row.recipientUser)
                  }
                  style={styles.summaryActionButton}
                />
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptySummary}>
            <KolamEmptyState
              compact
              title={controller.summaryLoading ? 'Memuat...' : 'Tidak ada data'}
            />
          </View>
        )}
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
            <KolamRefreshButton
              accessibilityLabel="Muat ulang"
              intent="secondary"

              onPress={() => {
                void controller.onRefresh();
              }}
            />
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
        <KolamCatalogListTableShell
          footer={
            <KolamTableFooterControls
              onPageSizeChange={controller.onLimitChange}
              page={safePage}
              pageSize={controller.pagination.limit}
              total={controller.pagination.total}
            >
              {pageCount > 1 ? (
                <View style={styles.paginationBar}>
                  <KolamButton
                    disabled={safePage <= 1 || controller.loading}
                    label="Sebelumnya"
                    onPress={() =>
                      controller.onPageChange(Math.max(1, safePage - 1))
                    }
                  />
                  <Text style={styles.pageLabel}>
                    {safePage} / {pageCount}
                  </Text>
                  <KolamButton
                    disabled={safePage >= pageCount || controller.loading}
                    label="Berikutnya"
                    onPress={() =>
                      controller.onPageChange(Math.min(pageCount, safePage + 1))
                    }
                  />
                </View>
              ) : null}
            </KolamTableFooterControls>
          }
          style={styles.tableFrame}
        >
          <View style={styles.tableBody}>
            <View style={styles.headerRow}>
              {COMMISSION_COLUMNS.map(column => (
                <View
                  key={column.id}
                  style={[styles.cell, { flex: column.flex }]}
                >
                  <Text style={styles.headerCellText}>{column.label}</Text>
                </View>
              ))}
            </View>
            {controller.rows.length === 0 ? (
              <View style={styles.emptyWrap}>
                <KolamEmptyState
                  compact
                  title={controller.loading ? 'Memuat...' : 'Tidak ada data'}
                />
              </View>
            ) : (
              controller.rows.map(item => (
                <React.Fragment key={item.id}>
                  {renderRow({ item })}
                </React.Fragment>
              ))
            )}
          </View>
        </KolamCatalogListTableShell>
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
  summaryHeaderRow: {
    alignItems: 'center',
    backgroundColor: V.colors.tableHeader,
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 34,
    paddingHorizontal: 8,
  },
  summaryHeaderText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  alignRight: {
    textAlign: 'right',
  },
  summaryRow: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  summaryRecipientCell: {
    flex: 1.4,
    minWidth: 0,
    paddingHorizontal: 4,
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
  summaryMoneyCell: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 4,
    textAlign: 'right',
  },
  summaryCountCell: {
    alignItems: 'flex-end',
    flex: 1.1,
    gap: 4,
    minWidth: 0,
    paddingHorizontal: 4,
  },
  summaryActionCell: {
    alignItems: 'flex-end',
    flex: 0.9,
    minWidth: 0,
    paddingHorizontal: 4,
  },
  summaryBadge: {
    alignSelf: 'flex-end',
  },
  summaryActionButton: {
    flexGrow: 0,
  },
  emptySummary: {
    paddingVertical: 18,
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
  tableBody: {
    minHeight: 0,
    width: '100%',
  },
  emptyWrap: {
    minHeight: 200,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  headerRow: {
    alignItems: 'center',
    backgroundColor: V.colors.tableHeader,
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 36,
    paddingHorizontal: 8,
  },
  headerCellText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  row: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 44,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  cell: {
    paddingHorizontal: 4,
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
    flexWrap: 'wrap',
    gap: 6,
  },
  releaseButton: {
    flexGrow: 0,
  },
  paginationBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
});
