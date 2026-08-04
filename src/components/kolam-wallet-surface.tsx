import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  formatKolamWalletConfirmStatusLabel,
  formatKolamWalletTxSourceLabel,
  formatKolamWalletTxTypeLabel,
  formatKolamWalletTypeLabel,
  getKolamWalletConfirmStatusIntent,
  getKolamWalletTypeIntent,
  KOLAM_WALLET_CONFIRM_STATUS_OPTIONS,
  KOLAM_WALLET_ROOT,
  KOLAM_WALLET_TX_SOURCE_OPTIONS,
  KOLAM_WALLET_TX_TYPE_OPTIONS,
  KOLAM_WALLET_TYPE_OPTIONS,
  type KolamWallet,
  type KolamWalletTab,
  type KolamWalletTransaction,
} from '../domain/kolam-wallet';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import {
  useKolamWalletController,
  type KolamWalletController,
} from '../hooks/use-kolam-wallet-controller';
import { formatRupiah } from '../lib/money';
import {
  pickNativeAssetFile,
  pickNativeImageFile,
} from '../services/native-file-picker';
import { KolamButton } from './kolam-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamCatalogListTableShell } from './kolam-catalog-list-table-shell';
import { KolamDropdownSelect, KolamTableFooterControls } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamModalBackdrop } from './kolam-modal-backdrop';
import { KolamStatusBadge } from './kolam-status-badge';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';

type WalletProofPick = {
  name: string;
  uri: string;
};

const WALLET_COLUMNS = [
  { id: 'name', label: 'Nama', flex: 1.2 },
  { id: 'type', label: 'Tipe', flex: 0.9 },
  { id: 'balance', label: 'Saldo', flex: 1 },
  { id: 'note', label: 'Catatan', flex: 1.1 },
] as const;

const TX_COLUMNS = [
  { id: 'date', label: 'Tanggal', flex: 1 },
  { id: 'wallet', label: 'Dompet', flex: 1 },
  { id: 'type', label: 'Tipe', flex: 0.7 },
  { id: 'source', label: 'Sumber', flex: 0.9 },
  { id: 'amount', label: 'Jumlah', flex: 1 },
  { id: 'status', label: 'Status', flex: 0.9 },
  { id: 'note', label: 'Catatan', flex: 1 },
  { id: 'action', label: '', flex: 0.8 },
] as const;

/**
 * Wallet ops — FE `/wallet` (dompet list + transaksi + drop/tarik/transfer).
 */
export function KolamWalletSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamWalletController(route);

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

      {controller.mode === 'list' ? (
        <WalletListMode controller={controller} onRouteChange={onRouteChange} />
      ) : (
        <WalletDetailMode controller={controller} onRouteChange={onRouteChange} />
      )}

      <WalletActionModal
        controller={controller}
        preselectedWalletId={
          controller.mode === 'detail' ? controller.documentId ?? undefined : undefined
        }
        wallets={
          controller.allWallets.length > 0
            ? controller.allWallets
            : controller.wallets
        }
      />
    </View>
  );
}

function WalletListMode({
  controller,
  onRouteChange,
}: {
  controller: KolamWalletController;
  onRouteChange?: (route: string) => void;
}) {
  return (
    <View style={styles.listRoot}>
      <WalletSummaryStrip controller={controller} />
      <WalletActionBar controller={controller} />
      <WalletTabBar
        activeTab={controller.activeTab}
        onChangeTab={controller.onChangeTab}
      />
      {controller.activeTab === 'wallets' ? (
        <WalletListPanel controller={controller} onRouteChange={onRouteChange} />
      ) : (
        <WalletTransactionPanel controller={controller} showWalletFilter />
      )}
    </View>
  );
}

function WalletDetailMode({
  controller,
  onRouteChange,
}: {
  controller: KolamWalletController;
  onRouteChange?: (route: string) => void;
}) {
  const wallet = controller.detailWallet;
  return (
    <View style={styles.listRoot}>
      <View style={styles.detailHeader}>
        <KolamButton
          intent="secondary"
          label="Kembali"
          onPress={() => onRouteChange?.(KOLAM_WALLET_ROOT)}
          style={styles.filterTrigger}
        />
        {wallet ? (
          <View style={styles.detailTitleBlock}>
            <Text style={styles.detailTitle}>{wallet.name}</Text>
            <KolamStatusBadge
              intent={getKolamWalletTypeIntent(wallet.type)}
              label={formatKolamWalletTypeLabel(wallet.type)}
            />
          </View>
        ) : null}
      </View>

      {controller.loadingDetail ? (
        <Text style={styles.metaText}>Memuat…</Text>
      ) : wallet ? (
        <View style={styles.detailCards}>
          <KolamCardFrame style={styles.card}>
            <Text style={styles.cardLabel}>Saldo</Text>
            <Text style={styles.cardValue}>{formatRupiah(wallet.currentBalance)}</Text>
          </KolamCardFrame>
          <KolamCardFrame style={styles.card}>
            <Text style={styles.cardLabel}>Saldo awal</Text>
            <Text style={styles.cardValue}>{formatRupiah(wallet.initialBalance)}</Text>
          </KolamCardFrame>
        </View>
      ) : null}

      <WalletActionBar controller={controller} />
      <WalletTransactionPanel controller={controller} showWalletFilter={false} />
    </View>
  );
}

function WalletSummaryStrip({ controller }: { controller: KolamWalletController }) {
  const stats = controller.summaryStats;
  const mainBalance = stats.mainWallet?.currentBalance ?? 0;
  const txTotal = controller.txPagination.total;

  return (
    <View style={styles.cardsRow}>
      <KolamCardFrame style={styles.summaryCard}>
        <View
          style={[
            styles.summaryAccent,
            stats.totalBalance < 0 ? styles.accentDanger : styles.accentPrimary,
          ]}
        />
        <View style={styles.summaryBody}>
          <Text style={styles.cardLabel}>Saldo Bersih</Text>
          <Text
            numberOfLines={1}
            style={[
              styles.cardValue,
              stats.totalBalance < 0 ? styles.valueDanger : styles.valuePrimary,
            ]}
          >
            {formatRupiah(stats.totalBalance)}
          </Text>
          <Text numberOfLines={2} style={styles.cardHint}>
            {formatRupiah(stats.positiveBalance)} dana positif,{' '}
            {formatRupiah(stats.negativeBalance)} eksposur negatif
          </Text>
        </View>
      </KolamCardFrame>

      <KolamCardFrame style={styles.summaryCard}>
        <View style={[styles.summaryAccent, styles.accentSuccess]} />
        <View style={styles.summaryBody}>
          <Text style={styles.cardLabel}>Cakupan Dompet</Text>
          <Text style={styles.cardValue}>{String(stats.walletCount)}</Text>
          <Text numberOfLines={1} style={styles.cardHint}>
            {stats.virtualCount} virtual, {stats.cashCount} tunai
          </Text>
        </View>
      </KolamCardFrame>

      <KolamCardFrame style={styles.summaryCard}>
        <View
          style={[
            styles.summaryAccent,
            mainBalance < 0 ? styles.accentDanger : styles.accentWarning,
          ]}
        />
        <View style={styles.summaryBody}>
          <Text style={styles.cardLabel}>Dompet Utama</Text>
          <Text
            numberOfLines={1}
            style={[
              styles.cardValue,
              mainBalance < 0 ? styles.valueDanger : styles.valuePrimary,
            ]}
          >
            {formatRupiah(mainBalance)}
          </Text>
          <Text numberOfLines={1} style={styles.cardHint}>
            {stats.mainWallet?.name ?? 'Dompet utama belum dikonfigurasi'}
          </Text>
        </View>
      </KolamCardFrame>

      <KolamCardFrame style={styles.summaryCard}>
        <View style={[styles.summaryAccent, styles.accentInfo]} />
        <View style={styles.summaryBody}>
          <Text style={styles.cardLabel}>Transaksi</Text>
          <Text style={styles.cardValue}>{String(txTotal)}</Text>
          <Text numberOfLines={1} style={styles.cardHint}>
            {controller.txTypeCounts.credit} kredit,{' '}
            {controller.txTypeCounts.debit} debit pada tampilan ini
          </Text>
        </View>
      </KolamCardFrame>
    </View>
  );
}

function WalletActionBar({
  controller,
}: {
  controller: KolamWalletController;
}) {
  if (!controller.canEdit) {
    return null;
  }
  return (
    <View style={styles.actionBar}>
      <KolamButton
        intent="secondary"
        label="Drop Dana"
        onPress={() => controller.onOpenActionModal('deposit')}
        style={styles.filterTrigger}
      />
      <KolamButton
        intent="secondary"
        label="Tarik Dana"
        onPress={() => controller.onOpenActionModal('withdraw')}
        style={styles.filterTrigger}
      />
      <KolamButton
        intent="secondary"
        label="Transfer"
        onPress={() => controller.onOpenActionModal('transfer')}
        style={styles.filterTrigger}
      />
    </View>
  );
}

function WalletTabBar({
  activeTab,
  onChangeTab,
}: {
  activeTab: KolamWalletTab;
  onChangeTab: (tab: KolamWalletTab) => void;
}) {
  return (
    <View style={styles.tabBar}>
      {(
        [
          { id: 'wallets' as const, label: 'Dompet' },
          { id: 'transactions' as const, label: 'Transaksi' },
        ] as const
      ).map(tab => (
        <Pressable
          key={tab.id}
          onPress={() => onChangeTab(tab.id)}
          style={[styles.tab, activeTab === tab.id ? styles.tabActive : null]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab.id ? styles.tabTextActive : null,
            ]}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function WalletListPanel({
  controller,
  onRouteChange,
}: {
  controller: KolamWalletController;
  onRouteChange?: (route: string) => void;
}) {
  const [typeOpen, setTypeOpen] = useState(false);
  const typeLabel =
    KOLAM_WALLET_TYPE_OPTIONS.find(
      option => option.value === controller.walletFilters.type,
    )?.label ?? 'Semua tipe';
  const safePage = Math.max(1, controller.walletPagination.page);
  const pageCount = Math.max(1, controller.walletPagination.totalPages);

  const renderRow = React.useCallback(
    ({ item }: { item: KolamWallet }) => (
      <Pressable
        onPress={() =>
          onRouteChange?.(
            `${KOLAM_WALLET_ROOT}/${encodeURIComponent(item.id)}`,
          )
        }
        style={styles.row}
      >
        <View style={[styles.cell, { flex: 1.2 }]}>
          <Text numberOfLines={2} style={styles.primaryText}>
            {item.name}
          </Text>
        </View>
        <View style={[styles.cell, { flex: 0.9 }]}>
          <KolamStatusBadge
            intent={getKolamWalletTypeIntent(item.type)}
            label={formatKolamWalletTypeLabel(item.type)}
          />
        </View>
        <View style={[styles.cell, { flex: 1 }]}>
          <Text style={styles.primaryText}>{formatRupiah(item.currentBalance)}</Text>
        </View>
        <View style={[styles.cell, { flex: 1.1 }]}>
          <Text numberOfLines={2} style={styles.metaText}>
            {item.note || '—'}
          </Text>
        </View>
      </Pressable>
    ),
    [onRouteChange],
  );

  return (
    <View style={styles.panel}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            <KolamFormTextField
              onChangeText={value =>
                controller.onChangeWalletFilters({ search: value })
              }
              placeholder="Cari dompet"
              style={kolamTableToolbarStyles.searchInput}
              value={controller.walletFilters.search}
            />
            <KolamButton
              intent={
                typeOpen || controller.walletFilters.type !== 'all'
                  ? 'primary'
                  : 'secondary'
              }
              label={typeLabel}
              onPress={() => setTypeOpen(current => !current)}
              style={styles.filterTrigger}
            />
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              intent="secondary"
              label={controller.loadingWallets ? 'Memuat…' : 'Muat ulang'}
              onPress={() => {
                void controller.onRefreshWallets();
              }}
              style={styles.filterTrigger}
            />
          </View>
        </View>
        {typeOpen ? (
          <View style={styles.filterPanel}>
            {KOLAM_WALLET_TYPE_OPTIONS.map(option => (
              <Pressable
                key={option.value}
                onPress={() => {
                  controller.onChangeWalletFilters({ type: option.value });
                  setTypeOpen(false);
                }}
                style={styles.filterOption}
              >
                <Text style={styles.filterOptionText}>{option.label}</Text>
              </Pressable>
            ))}
            <KolamButton
              intent="secondary"
              label="Tutup"
              onPress={() => setTypeOpen(false)}
              style={styles.filterClose}
            />
          </View>
        ) : null}
      </View>

      <KolamCatalogListTableShell
        footer={
          <KolamTableFooterControls
            onPageSizeChange={controller.onWalletLimitChange}
            page={safePage}
            pageSize={controller.walletFilters.limit}
            total={controller.walletPagination.total}
          >
            {pageCount > 1 ? (
              <View style={styles.paginationBar}>
                <KolamButton
                  intent="secondary"
                  label="‹"
                  onPress={() =>
                    controller.onWalletPageChange(Math.max(1, safePage - 1))
                  }
                  style={styles.pageButton}
                />
                <Text style={styles.metaText}>
                  {safePage} / {pageCount}
                </Text>
                <KolamButton
                  intent="secondary"
                  label="›"
                  onPress={() =>
                    controller.onWalletPageChange(
                      Math.min(pageCount, safePage + 1),
                    )
                  }
                  style={styles.pageButton}
                />
              </View>
            ) : null}
          </KolamTableFooterControls>
        }
        style={styles.tableFrame}
      >
        <FlatList
          contentContainerStyle={styles.listContent}
          data={controller.filteredWallets}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <KolamEmptyState
                compact
                title={
                  controller.loadingWallets ? 'Memuat…' : 'Tidak ada dompet'
                }
              />
            </View>
          }
          ListHeaderComponent={
            <View style={styles.headerRow}>
              {WALLET_COLUMNS.map(column => (
                <View
                  key={column.id}
                  style={[styles.cell, { flex: column.flex }]}
                >
                  <Text style={styles.headerCellText}>{column.label}</Text>
                </View>
              ))}
            </View>
          }
          renderItem={renderRow}
          style={styles.list}
        />
      </KolamCatalogListTableShell>
    </View>
  );
}

function WalletTransactionPanel({
  controller,
  showWalletFilter,
}: {
  controller: KolamWalletController;
  showWalletFilter: boolean;
}) {
  const [typeOpen, setTypeOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const safePage = Math.max(1, controller.txPagination.page);
  const pageCount = Math.max(1, controller.txPagination.totalPages);

  const walletOptions = useMemo(
    () => [
      { label: 'Semua dompet', value: '' },
      ...controller.wallets.map(wallet => ({
        label: wallet.name,
        value: wallet.id,
      })),
    ],
    [controller.wallets],
  );

  const typeLabel =
    KOLAM_WALLET_TX_TYPE_OPTIONS.find(
      option => option.value === controller.txFilters.type,
    )?.label ?? 'Semua tipe';
  const sourceLabel =
    KOLAM_WALLET_TX_SOURCE_OPTIONS.find(
      option => option.value === controller.txFilters.source,
    )?.label ?? 'Semua sumber';
  const statusLabel =
    KOLAM_WALLET_CONFIRM_STATUS_OPTIONS.find(
      option => option.value === controller.txFilters.confirmStatus,
    )?.label ?? 'Semua status';

  const renderRow = React.useCallback(
    ({ item }: { item: KolamWalletTransaction }) => {
      const canConfirmRow =
        controller.canConfirm &&
        item.confirmStatus === 'unconfirmed' &&
        Boolean(item.id);
      return (
        <View style={styles.row}>
          <View style={[styles.cell, { flex: 1 }]}>
            <Text numberOfLines={2} style={styles.metaText}>
              {formatTxDate(item.createdAt)}
            </Text>
          </View>
          <View style={[styles.cell, { flex: 1 }]}>
            <Text numberOfLines={1} style={styles.primaryText}>
              {item.walletName || item.walletId || '—'}
            </Text>
          </View>
          <View style={[styles.cell, { flex: 0.7 }]}>
            <Text style={styles.metaText}>
              {formatKolamWalletTxTypeLabel(item.type)}
            </Text>
          </View>
          <View style={[styles.cell, { flex: 0.9 }]}>
            <Text numberOfLines={1} style={styles.metaText}>
              {formatKolamWalletTxSourceLabel(item.source)}
            </Text>
          </View>
          <View style={[styles.cell, { flex: 1 }]}>
            <Text style={styles.primaryText}>{formatRupiah(item.amount)}</Text>
          </View>
          <View style={[styles.cell, { flex: 0.9 }]}>
            <KolamStatusBadge
              intent={getKolamWalletConfirmStatusIntent(item.confirmStatus)}
              label={formatKolamWalletConfirmStatusLabel(item.confirmStatus)}
            />
          </View>
          <View style={[styles.cell, { flex: 1 }]}>
            <Text numberOfLines={2} style={styles.metaText}>
              {item.note || '—'}
            </Text>
          </View>
          <View style={[styles.cell, { flex: 0.8 }]}>
            {canConfirmRow ? (
              <KolamButton
                intent="primary"
                label={
                  controller.confirmingTxId === item.id ? '…' : 'Konfirmasi'
                }
                onPress={() => {
                  void controller.onConfirmTransaction(item);
                }}
                style={styles.confirmButton}
              />
            ) : null}
          </View>
        </View>
      );
    },
    [controller],
  );

  return (
    <View style={styles.panel}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={kolamTableToolbarStyles.row}>
          <View style={kolamTableToolbarStyles.filters}>
            {showWalletFilter ? (
              <KolamDropdownSelect
                label="Dompet"
                menuPlacement="inline"
                onChange={value =>
                  controller.onChangeTxFilters({ walletId: value })
                }
                options={walletOptions}
                style={styles.walletSelect}
                value={controller.txFilters.walletId}
              />
            ) : null}
            <KolamButton
              intent={
                typeOpen || controller.txFilters.type !== 'all'
                  ? 'primary'
                  : 'secondary'
              }
              label={typeLabel}
              onPress={() => {
                setSourceOpen(false);
                setStatusOpen(false);
                setTypeOpen(current => !current);
              }}
              style={styles.filterTrigger}
            />
            <KolamButton
              intent={
                sourceOpen || controller.txFilters.source !== 'all'
                  ? 'primary'
                  : 'secondary'
              }
              label={sourceLabel}
              onPress={() => {
                setTypeOpen(false);
                setStatusOpen(false);
                setSourceOpen(current => !current);
              }}
              style={styles.filterTrigger}
            />
            <KolamButton
              intent={
                statusOpen || controller.txFilters.confirmStatus !== 'all'
                  ? 'primary'
                  : 'secondary'
              }
              label={statusLabel}
              onPress={() => {
                setTypeOpen(false);
                setSourceOpen(false);
                setStatusOpen(current => !current);
              }}
              style={styles.filterTrigger}
            />
            <KolamFormTextField
              onChangeText={value =>
                controller.onChangeTxFilters({ startDate: value })
              }
              placeholder="Mulai YYYY-MM-DD"
              style={styles.dateInput}
              value={controller.txFilters.startDate}
            />
            <KolamFormTextField
              onChangeText={value =>
                controller.onChangeTxFilters({ endDate: value })
              }
              placeholder="Akhir YYYY-MM-DD"
              style={styles.dateInput}
              value={controller.txFilters.endDate}
            />
          </View>
          <View style={kolamTableToolbarStyles.actions}>
            <KolamButton
              intent="secondary"
              label="Reset"
              onPress={controller.onClearTxFilters}
              style={styles.filterTrigger}
            />
            <KolamButton
              intent="secondary"
              label={controller.loadingTransactions ? 'Memuat…' : 'Muat ulang'}
              onPress={() => {
                void controller.onRefreshTransactions();
              }}
              style={styles.filterTrigger}
            />
          </View>
        </View>

        {typeOpen ? (
          <FilterPanel
            onClose={() => setTypeOpen(false)}
            onSelect={value => controller.onChangeTxFilters({ type: value })}
            options={KOLAM_WALLET_TX_TYPE_OPTIONS}
          />
        ) : null}
        {sourceOpen ? (
          <FilterPanel
            onClose={() => setSourceOpen(false)}
            onSelect={value => controller.onChangeTxFilters({ source: value })}
            options={KOLAM_WALLET_TX_SOURCE_OPTIONS}
          />
        ) : null}
        {statusOpen ? (
          <FilterPanel
            onClose={() => setStatusOpen(false)}
            onSelect={value =>
              controller.onChangeTxFilters({ confirmStatus: value })
            }
            options={KOLAM_WALLET_CONFIRM_STATUS_OPTIONS}
          />
        ) : null}
      </View>

      <KolamCatalogListTableShell
        footer={
          <KolamTableFooterControls
            onPageSizeChange={controller.onTxLimitChange}
            page={safePage}
            pageSize={controller.txFilters.limit}
            total={controller.txPagination.total}
          >
            {pageCount > 1 ? (
              <View style={styles.paginationBar}>
                <KolamButton
                  intent="secondary"
                  label="‹"
                  onPress={() =>
                    controller.onTxPageChange(Math.max(1, safePage - 1))
                  }
                  style={styles.pageButton}
                />
                <Text style={styles.metaText}>
                  {safePage} / {pageCount}
                </Text>
                <KolamButton
                  intent="secondary"
                  label="›"
                  onPress={() =>
                    controller.onTxPageChange(
                      Math.min(pageCount, safePage + 1),
                    )
                  }
                  style={styles.pageButton}
                />
              </View>
            ) : null}
          </KolamTableFooterControls>
        }
        style={styles.tableFrame}
      >
        <FlatList
          contentContainerStyle={styles.listContent}
          data={controller.transactions}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <KolamEmptyState
                compact
                title={
                  controller.loadingTransactions
                    ? 'Memuat…'
                    : 'Tidak ada transaksi'
                }
              />
            </View>
          }
          ListHeaderComponent={
            <View style={styles.headerRow}>
              {TX_COLUMNS.map(column => (
                <View
                  key={column.id}
                  style={[styles.cell, { flex: column.flex }]}
                >
                  <Text style={styles.headerCellText}>{column.label}</Text>
                </View>
              ))}
            </View>
          }
          renderItem={renderRow}
          style={styles.list}
        />
      </KolamCatalogListTableShell>
    </View>
  );
}

function FilterPanel<T extends string>({
  onClose,
  onSelect,
  options,
}: {
  onClose: () => void;
  onSelect: (value: T) => void;
  options: Array<{ label: string; value: T }>;
}) {
  return (
    <View style={styles.filterPanel}>
      {options.map(option => (
        <Pressable
          key={option.value}
          onPress={() => {
            onSelect(option.value);
            onClose();
          }}
          style={styles.filterOption}
        >
          <Text style={styles.filterOptionText}>{option.label}</Text>
        </Pressable>
      ))}
      <KolamButton
        intent="secondary"
        label="Tutup"
        onPress={onClose}
        style={styles.filterClose}
      />
    </View>
  );
}

function WalletActionModal({
  controller,
  preselectedWalletId,
  wallets,
}: {
  controller: KolamWalletController;
  preselectedWalletId?: string;
  wallets: KolamWallet[];
}) {
  const modal = controller.actionModal;
  if (!modal) {
    return null;
  }
  return (
    <Modal
      animationType="fade"
      onRequestClose={controller.onCloseActionModal}
      transparent
      visible
    >
      <View style={styles.modalRoot}>
        <KolamModalBackdrop onPress={controller.onCloseActionModal} />
        <View style={styles.modalCard}>
          {modal === 'deposit' ? (
            <DepositForm
              controller={controller}
              onClose={controller.onCloseActionModal}
              preselectedWalletId={preselectedWalletId}
              wallets={wallets}
            />
          ) : null}
          {modal === 'withdraw' ? (
            <WithdrawForm
              controller={controller}
              onClose={controller.onCloseActionModal}
              preselectedWalletId={preselectedWalletId}
              wallets={wallets}
            />
          ) : null}
          {modal === 'transfer' ? (
            <TransferForm
              controller={controller}
              onClose={controller.onCloseActionModal}
              wallets={wallets}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function DepositForm({
  controller,
  onClose,
  preselectedWalletId,
  wallets,
}: {
  controller: KolamWalletController;
  onClose: () => void;
  preselectedWalletId?: string;
  wallets: KolamWallet[];
}) {
  const [walletId, setWalletId] = useState(
    preselectedWalletId ?? wallets[0]?.id ?? '',
  );
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [proofs, setProofs] = useState<WalletProofPick[]>([]);
  const [formError, setFormError] = useState('');
  const selectedWallet = wallets.find(wallet => wallet.id === walletId);
  const numericAmount = Number(amount);
  const safeAmount =
    Number.isFinite(numericAmount) && numericAmount > 0 ? numericAmount : 0;
  const projectedBalance = (selectedWallet?.currentBalance ?? 0) + safeAmount;
  const walletOptions = wallets.map(wallet => ({
    label: `${wallet.name} · ${formatRupiah(wallet.currentBalance)}`,
    value: wallet.id,
  }));
  const requiresProof = Boolean(selectedWallet?.requireDepositProof);
  const canSubmit =
    Boolean(walletId) &&
    safeAmount > 0 &&
    (!requiresProof || proofs.length > 0) &&
    !controller.submitting;

  return (
    <WalletFormShell
      error={formError}
      onClose={onClose}
      onSubmit={() => {
        setFormError('');
        if (!canSubmit) {
          if (requiresProof && proofs.length === 0) {
            setFormError('Bukti setoran wajib untuk dompet ini.');
          }
          return;
        }
        void controller.onDeposit({
          walletId,
          amount: safeAmount,
          note,
          proofLocalUris: proofs.map(proof => proof.uri),
        });
      }}
      submitDisabled={!canSubmit}
      submitLabel={controller.submitting ? 'Memproses…' : 'Drop Dana'}
      title="Drop Dana"
    >
      <KolamDropdownSelect
        label="Wallet Tujuan"
        menuPlacement="inline"
        onChange={setWalletId}
        options={walletOptions}
        value={walletId}
      />
      {selectedWallet ? (
        <View style={styles.balanceInfo}>
          <Text style={styles.metaText}>Saldo saat ini</Text>
          <Text style={styles.balanceInfoValue}>
            {formatRupiah(selectedWallet.currentBalance)}
          </Text>
        </View>
      ) : null}
      <KolamFormTextField
        keyboardType="numeric"
        onChangeText={setAmount}
        placeholder="Jumlah"
        value={amount}
      />
      <KolamFormTextField
        onChangeText={setNote}
        placeholder="Catatan"
        value={note}
      />
      <WalletProofPicker
        onChange={setProofs}
        proofs={proofs}
        required={requiresProof}
      />
      {selectedWallet && safeAmount > 0 ? (
        <View style={styles.balanceInfo}>
          <Text style={styles.metaText}>Saldo setelah drop</Text>
          <Text style={styles.balanceInfoValue}>
            {formatRupiah(projectedBalance)}
          </Text>
        </View>
      ) : null}
    </WalletFormShell>
  );
}

function WithdrawForm({
  controller,
  onClose,
  preselectedWalletId,
  wallets,
}: {
  controller: KolamWalletController;
  onClose: () => void;
  preselectedWalletId?: string;
  wallets: KolamWallet[];
}) {
  const [walletId, setWalletId] = useState(
    preselectedWalletId ?? wallets[0]?.id ?? '',
  );
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [proofs, setProofs] = useState<WalletProofPick[]>([]);
  const [formError, setFormError] = useState('');
  const selectedWallet = wallets.find(wallet => wallet.id === walletId);
  const numericAmount = Number(amount);
  const safeAmount =
    Number.isFinite(numericAmount) && numericAmount > 0 ? numericAmount : 0;
  const projectedBalance = (selectedWallet?.currentBalance ?? 0) - safeAmount;
  const walletOptions = wallets.map(wallet => ({
    label: `${wallet.name} · ${formatRupiah(wallet.currentBalance)}`,
    value: wallet.id,
  }));
  const canSubmit =
    Boolean(walletId) && safeAmount > 0 && !controller.submitting;

  return (
    <WalletFormShell
      error={formError}
      onClose={onClose}
      onSubmit={() => {
        setFormError('');
        if (!canSubmit) {
          return;
        }
        if (selectedWallet && safeAmount > selectedWallet.currentBalance) {
          setFormError('Jumlah melebihi saldo saat ini.');
          return;
        }
        void controller.onWithdraw({
          walletId,
          amount: safeAmount,
          note,
          proofLocalUris: proofs.map(proof => proof.uri),
        });
      }}
      submitDisabled={!canSubmit}
      submitLabel={controller.submitting ? 'Memproses…' : 'Tarik Dana'}
      title="Tarik Dana"
    >
      <KolamDropdownSelect
        label="Wallet Sumber"
        menuPlacement="inline"
        onChange={setWalletId}
        options={walletOptions}
        value={walletId}
      />
      {selectedWallet ? (
        <View style={styles.balanceInfo}>
          <Text style={styles.metaText}>Saldo saat ini</Text>
          <Text style={styles.balanceInfoValue}>
            {formatRupiah(selectedWallet.currentBalance)}
          </Text>
        </View>
      ) : null}
      <KolamFormTextField
        keyboardType="numeric"
        onChangeText={setAmount}
        placeholder="Jumlah"
        value={amount}
      />
      <KolamFormTextField
        onChangeText={setNote}
        placeholder="Catatan"
        value={note}
      />
      <WalletProofPicker onChange={setProofs} proofs={proofs} />
      {selectedWallet && safeAmount > 0 ? (
        <View style={styles.balanceInfo}>
          <Text style={styles.metaText}>Saldo setelah tarik</Text>
          <Text
            style={[
              styles.balanceInfoValue,
              projectedBalance < 0 ? styles.valueDanger : null,
            ]}
          >
            {formatRupiah(projectedBalance)}
          </Text>
        </View>
      ) : null}
    </WalletFormShell>
  );
}

function TransferForm({
  controller,
  onClose,
  wallets,
}: {
  controller: KolamWalletController;
  onClose: () => void;
  wallets: KolamWallet[];
}) {
  const [fromWalletId, setFromWalletId] = useState(wallets[0]?.id ?? '');
  const [toWalletId, setToWalletId] = useState(
    wallets.find(wallet => wallet.id !== wallets[0]?.id)?.id ?? '',
  );
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [proofs, setProofs] = useState<WalletProofPick[]>([]);
  const [formError, setFormError] = useState('');
  const fromWallet = wallets.find(wallet => wallet.id === fromWalletId);
  const toWallet = wallets.find(wallet => wallet.id === toWalletId);
  const numericAmount = Number(amount);
  const safeAmount =
    Number.isFinite(numericAmount) && numericAmount > 0 ? numericAmount : 0;
  const isSameWallet =
    Boolean(fromWalletId) &&
    Boolean(toWalletId) &&
    fromWalletId === toWalletId;
  const fromProjected = (fromWallet?.currentBalance ?? 0) - safeAmount;
  const toProjected = (toWallet?.currentBalance ?? 0) + safeAmount;
  const fromOptions = wallets
    .filter(wallet => wallet.id !== toWalletId)
    .map(wallet => ({
      label: `${wallet.name} · ${formatRupiah(wallet.currentBalance)}`,
      value: wallet.id,
    }));
  const toOptions = wallets
    .filter(wallet => wallet.id !== fromWalletId)
    .map(wallet => ({
      label: `${wallet.name} · ${formatRupiah(wallet.currentBalance)}`,
      value: wallet.id,
    }));
  const canSubmit =
    Boolean(fromWalletId) &&
    Boolean(toWalletId) &&
    !isSameWallet &&
    safeAmount > 0 &&
    !controller.submitting;

  return (
    <WalletFormShell
      error={formError}
      onClose={onClose}
      onSubmit={() => {
        setFormError('');
        if (!canSubmit) {
          if (isSameWallet) {
            setFormError('Tidak bisa transfer ke wallet yang sama');
          }
          return;
        }
        void controller.onTransfer({
          fromWalletId,
          toWalletId,
          amount: safeAmount,
          note,
          proofLocalUris: proofs.map(proof => proof.uri),
        });
      }}
      submitDisabled={!canSubmit}
      submitLabel={controller.submitting ? 'Memproses…' : 'Transfer'}
      title="Transfer Antar Wallet"
    >
      <KolamDropdownSelect
        label="Dari Wallet"
        menuPlacement="inline"
        onChange={setFromWalletId}
        options={fromOptions}
        value={fromWalletId}
      />
      <KolamDropdownSelect
        label="Ke Wallet"
        menuPlacement="inline"
        onChange={setToWalletId}
        options={toOptions}
        value={toWalletId}
      />
      {isSameWallet ? (
        <KolamStatusBadge
          intent="danger"
          label="Tidak bisa transfer ke wallet yang sama"
        />
      ) : null}
      <KolamFormTextField
        keyboardType="numeric"
        onChangeText={setAmount}
        placeholder="Jumlah Transfer"
        value={amount}
      />
      <KolamFormTextField
        onChangeText={setNote}
        placeholder="Catatan"
        value={note}
      />
      <WalletProofPicker onChange={setProofs} proofs={proofs} />
      {fromWallet && toWallet && safeAmount > 0 && !isSameWallet ? (
        <View style={styles.previewBlock}>
          <Text style={styles.previewTitle}>Preview Saldo</Text>
          <View style={styles.balanceInfo}>
            <Text style={styles.metaText}>{fromWallet.name}</Text>
            <Text
              style={[
                styles.balanceInfoValue,
                fromProjected < 0 ? styles.valueDanger : null,
              ]}
            >
              {formatRupiah(fromProjected)}
            </Text>
          </View>
          <View style={styles.balanceInfo}>
            <Text style={styles.metaText}>{toWallet.name}</Text>
            <Text style={styles.balanceInfoValue}>
              {formatRupiah(toProjected)}
            </Text>
          </View>
        </View>
      ) : null}
    </WalletFormShell>
  );
}

function WalletProofPicker({
  onChange,
  proofs,
  required = false,
}: {
  onChange: (next: WalletProofPick[]) => void;
  proofs: WalletProofPick[];
  required?: boolean;
}) {
  const pickProof = async () => {
    if (proofs.length >= 3) {
      return;
    }
    try {
      let result;
      try {
        result = await pickNativeAssetFile();
      } catch {
        result = await pickNativeImageFile();
      }
      if (result.cancelled || !result.uri) {
        return;
      }
      onChange([
        ...proofs,
        {
          uri: result.uri,
          name: result.name?.trim() || `bukti-${proofs.length + 1}`,
        },
      ].slice(0, 3));
    } catch {
      // Native picker may be unavailable in non-Windows/test runtime.
    }
  };

  return (
    <View style={styles.proofBlock}>
      <Text style={styles.proofLabel}>
        Bukti {required ? '(wajib)' : '(opsional)'}
      </Text>
      <View style={styles.proofActions}>
        <KolamButton
          disabled={proofs.length >= 3}
          intent="secondary"
          label="Upload Bukti"
          onPress={() => {
            void pickProof();
          }}
        />
        <Text style={styles.metaText}>{proofs.length}/3 file</Text>
      </View>
      {proofs.length > 0 ? (
        <View style={styles.proofList}>
          {proofs.map((proof, index) => (
            <View key={`${proof.uri}-${index}`} style={styles.proofItem}>
              {/\.(png|jpe?g|webp|gif)$/i.test(proof.name) ||
              proof.uri.startsWith('file:') ? (
                <Image source={{uri: proof.uri}} style={styles.proofThumb} />
              ) : (
                <View style={styles.proofFallback}>
                  <Text style={styles.metaText}>FILE</Text>
                </View>
              )}
              <Text numberOfLines={1} style={styles.proofName}>
                {proof.name}
              </Text>
              <KolamButton
                intent="secondary"
                label="Hapus"
                onPress={() =>
                  onChange(proofs.filter((_, itemIndex) => itemIndex !== index))
                }
              />
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function WalletFormShell({
  children,
  error,
  onClose,
  onSubmit,
  submitDisabled,
  submitLabel,
  title,
}: {
  children: React.ReactNode;
  error?: string;
  onClose: () => void;
  onSubmit: () => void;
  submitDisabled?: boolean;
  submitLabel: string;
  title: string;
}) {
  return (
    <ScrollView contentContainerStyle={styles.formBody}>
      <Text style={styles.formTitle}>{title}</Text>
      {error ? (
        <KolamStatusBadge intent="danger" label={error} numberOfLines={3} />
      ) : null}
      {children}
      <View style={styles.formActions}>
        <KolamButton intent="secondary" label="Batal" onPress={onClose} />
        <KolamButton
          disabled={submitDisabled}
          intent="primary"
          label={submitLabel}
          onPress={onSubmit}
        />
      </View>
    </ScrollView>
  );
}

function formatTxDate(value: string): string {
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
    gap: 12,
    minHeight: 0,
  },
  listRoot: {
    flex: 1,
    gap: 12,
  },
  banner: {
    alignSelf: 'stretch',
  },
  cardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryCard: {
    flexBasis: 200,
    flexGrow: 1,
    minWidth: 180,
    overflow: 'hidden',
    padding: 0,
  },
  summaryAccent: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    bottom: 10,
    left: 0,
    position: 'absolute',
    top: 10,
    width: 3,
  },
  accentPrimary: {
    backgroundColor: V.colors.primary,
  },
  accentSuccess: {
    backgroundColor: V.colors.success,
  },
  accentWarning: {
    backgroundColor: V.colors.warning,
  },
  accentDanger: {
    backgroundColor: V.colors.danger,
  },
  accentInfo: {
    backgroundColor: V.colors.info,
  },
  summaryBody: {
    gap: 2,
    paddingHorizontal: 14,
    paddingLeft: 16,
    paddingVertical: 12,
  },
  card: {
    flexGrow: 1,
    minWidth: 160,
    padding: 12,
  },
  cardLabel: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  cardValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  cardHint: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 11,
    marginTop: 2,
  },
  valuePrimary: {
    color: V.colors.primary,
  },
  valueDanger: {
    color: V.colors.danger,
  },
  balanceInfo: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  balanceInfoValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  previewBlock: {
    gap: 8,
  },
  previewTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  proofBlock: {
    gap: 8,
  },
  proofLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  proofActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  proofList: {
    gap: 8,
  },
  proofItem: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 8,
  },
  proofThumb: {
    borderRadius: 6,
    height: 40,
    width: 40,
  },
  proofFallback: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderRadius: 6,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  proofName: {
    color: V.colors.fg,
    flex: 1,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  actionBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tabActive: {
    backgroundColor: V.colors.primarySoft,
    borderColor: V.colors.primary,
  },
  tabText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: V.colors.primary,
  },
  panel: {
    flex: 1,
    gap: 8,
    minHeight: 240,
  },
  tableFrame: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyWrap: {
    paddingVertical: 24,
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
  filterTrigger: {
    minHeight: 32,
  },
  filterPanel: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 2,
    marginTop: 4,
    padding: 4,
  },
  filterOption: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  filterOptionText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
  },
  filterClose: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  dateInput: {
    minWidth: 140,
  },
  walletSelect: {
    minWidth: 160,
  },
  row: {
    alignItems: 'center',
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cell: {
    minWidth: 0,
  },
  primaryText: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '600',
  },
  metaText: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
  },
  paginationBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  pageButton: {
    minWidth: 32,
  },
  confirmButton: {
    minHeight: 28,
  },
  detailHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailTitleBlock: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailTitle: {
    color: V.colors.fg,
    fontSize: 16,
    fontWeight: '700',
  },
  detailCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalRoot: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: '85%',
    maxWidth: 480,
    width: '100%',
    zIndex: 2,
  },
  formBody: {
    gap: 12,
    padding: 16,
  },
  formTitle: {
    color: V.colors.fg,
    fontSize: 16,
    fontWeight: '700',
  },
  formActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 8,
  },
});
