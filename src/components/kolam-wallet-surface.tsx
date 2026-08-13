import React, { useMemo, useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  formatKolamWalletConfirmStatusLabel,
  formatKolamWalletShortDate,
  formatKolamWalletTxSourceLabel,
  formatKolamWalletTxTypeLabel,
  formatKolamWalletTypeLabel,
  getKolamWalletConfirmStatusIntent,
  getKolamWalletCreateRoute,
  getKolamWalletDetailRoute,
  getKolamWalletEditRoute,
  getKolamWalletTypeIntent,
  isKolamWalletProofPdf,
  KOLAM_WALLET_CONFIRM_STATUS_OPTIONS,
  KOLAM_WALLET_CREATE_TYPE_OPTIONS,
  KOLAM_WALLET_ROOT,
  KOLAM_WALLET_TX_SOURCE_OPTIONS,
  KOLAM_WALLET_TX_TYPE_OPTIONS,
  KOLAM_WALLET_TYPE_OPTIONS,
  type KolamWallet,
  type KolamWalletTab,
  type KolamWalletTransaction,
  type KolamWalletType,
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
import {KolamDaftarButton} from './kolam-daftar-button';
import {KolamDeleteButton} from './kolam-delete-button';
import {KolamCancelButton} from './kolam-cancel-button';
import {KolamSaveButton} from './kolam-save-button';
import {KolamEditButton} from './kolam-edit-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamDetailScrollSurface } from './kolam-detail-scroll-surface';
import {
  KolamDropdownSelect,
  KolamOverflowMenuButton,
} from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamExportDialog } from './kolam-export-dialog';
import { KolamExportXlsButton } from './kolam-export-xls-button';
import { KolamFormTextField } from './kolam-form-text-field';
import { type KolamImagePreviewItem } from './kolam-image-preview-dialog';
import { KolamListTableComposition } from './kolam-list-table-composition';
import { KolamModalBackdrop } from './kolam-modal-backdrop';
import {KolamNotesDisplay, KolamNotesField} from './kolam-notes-field';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamSwitch } from './kolam-switch';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';
import { KolamToolbarDateFilter } from './kolam-toolbar-date-filter';
import {KolamUploadButton} from './kolam-upload-button';

type WalletProofPick = {
  name: string;
  uri: string;
};

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
      ) : null}
      {controller.mode === 'detail' ? (
        <WalletDetailMode controller={controller} onRouteChange={onRouteChange} />
      ) : null}
      {controller.mode === 'create' ? (
        <WalletCreateMode controller={controller} onRouteChange={onRouteChange} />
      ) : null}
      {controller.mode === 'edit' ? (
        <WalletEditMode controller={controller} onRouteChange={onRouteChange} />
      ) : null}

      {controller.mode === 'list' || controller.mode === 'detail' ? (
        <WalletActionModal
          controller={controller}
          preselectedWalletId={
            controller.mode === 'detail'
              ? controller.documentId ?? undefined
              : undefined
          }
          wallets={
            controller.allWallets.length > 0
              ? controller.allWallets
              : controller.wallets
          }
        />
      ) : null}
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
      <WalletTabBar
        activeTab={controller.activeTab}
        onChangeTab={controller.onChangeTab}
      />
      {controller.activeTab === 'wallets' ? (
        <WalletListPanel controller={controller} onRouteChange={onRouteChange} />
      ) : (
        <WalletTransactionPanel
          controller={controller}
          onRouteChange={onRouteChange}
          showWalletFilter
        />
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
  const balanceChange = wallet
    ? wallet.currentBalance - wallet.initialBalance
    : 0;

  return (
    <View style={styles.listRoot}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={styles.detailToolbar}>
          {wallet ? (
            <View style={styles.detailTitleBlock}>
              <Text style={styles.detailTitle}>{wallet.name}</Text>
              <KolamStatusBadge
                intent={getKolamWalletTypeIntent(wallet.type)}
                label={formatKolamWalletTypeLabel(wallet.type)}
              />
            </View>
          ) : null}
          <View style={kolamTableToolbarStyles.actions}>
            <KolamDaftarButton
              onPress={() => onRouteChange?.(KOLAM_WALLET_ROOT)}
              size="sm"
            />
            {wallet && controller.canEdit ? (
              <KolamEditButton
                intent="secondary"
                onPress={() =>
                  onRouteChange?.(getKolamWalletEditRoute(wallet.id))
                }
                size="sm"
                style={styles.filterTrigger}
              />
            ) : null}
          </View>
        </View>
      </View>

      {controller.loadingDetail ? (
        <Text style={styles.metaText}>Memuat…</Text>
      ) : wallet ? (
        <>
          <View style={styles.detailCards}>
            <KolamCardFrame style={styles.card}>
              <Text style={styles.cardLabel}>Saldo</Text>
              <Text style={styles.cardValue}>
                {formatRupiah(wallet.currentBalance)}
              </Text>
            </KolamCardFrame>
            <KolamCardFrame style={styles.card}>
              <Text style={styles.cardLabel}>Saldo awal</Text>
              <Text style={styles.cardValue}>
                {formatRupiah(wallet.initialBalance)}
              </Text>
            </KolamCardFrame>
            <KolamCardFrame style={styles.card}>
              <Text style={styles.cardLabel}>Perubahan</Text>
              <Text
                style={[
                  styles.cardValue,
                  balanceChange > 0
                    ? styles.valuePrimary
                    : balanceChange < 0
                      ? styles.valueDanger
                      : null,
                ]}
              >
                {balanceChange > 0 ? '+' : ''}
                {formatRupiah(balanceChange)}
              </Text>
            </KolamCardFrame>
          </View>

          <KolamCardFrame style={styles.profileCard}>
            <Text style={styles.profileTitle}>Profil Dompet</Text>
            <View style={styles.profileGrid}>
              <WalletInfoItem label="Nama" value={wallet.name} />
              <WalletInfoItem
                label="Tipe"
                value={formatKolamWalletTypeLabel(wallet.type)}
              />
              <WalletInfoItem
                label="Provider / Bank"
                value={wallet.provider || '—'}
              />
              <WalletInfoItem
                label="Nama Rekening"
                value={wallet.accountName || '—'}
              />
              <WalletInfoItem
                label="Nomor Rekening"
                value={wallet.accountNumber || '—'}
              />
              <View style={styles.profileItem}>
                <Text style={styles.metaText}>Bukti setoran</Text>
                <KolamStatusBadge
                  intent={wallet.requireDepositProof ? 'warning' : 'secondary'}
                  label={wallet.requireDepositProof ? 'Wajib' : 'Opsional'}
                />
              </View>
              <KolamNotesDisplay
                containerStyle={styles.profileItemWide}
                label="Catatan"
                text={wallet.note}
              />
            </View>
          </KolamCardFrame>
        </>
      ) : null}

      <WalletTransactionPanel
        controller={controller}
        onRouteChange={onRouteChange}
        showCreateButton={false}
        showWalletFilter={false}
      />
    </View>
  );
}

function WalletInfoItem({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <View style={[styles.profileItem, wide ? styles.profileItemWide : null]}>
      <Text style={styles.metaText}>{label}</Text>
      <Text style={styles.primaryText}>{value}</Text>
    </View>
  );
}

function WalletToolbarActions({
  controller,
  onRouteChange,
  showCreate = true,
  style,
  trailing,
}: {
  controller: KolamWalletController;
  onRouteChange?: (route: string) => void;
  showCreate?: boolean;
  style?: StyleProp<ViewStyle>;
  trailing?: Array<React.ReactElement | null | false | undefined>;
}) {
  return (
    <View style={[kolamTableToolbarStyles.actions, styles.toolbarActionsCompact, style]}>
      {controller.canEdit ? (
        <KolamButton
          intent="secondary"
          label="Drop"
          onPress={() => controller.onOpenActionModal('deposit')}
          style={styles.filterTrigger}
        />
      ) : null}
      {controller.canEdit ? (
        <KolamButton
          intent="secondary"
          label="Tarik"
          onPress={() => controller.onOpenActionModal('withdraw')}
          style={styles.filterTrigger}
        />
      ) : null}
      {controller.canEdit ? (
        <KolamButton
          intent="secondary"
          label="Transfer"
          onPress={() => controller.onOpenActionModal('transfer')}
          style={styles.filterTrigger}
        />
      ) : null}
      {showCreate && controller.canCreate ? (
        <KolamButton
          intent="primary"
          label="Baru"
          tone="positive"
          onPress={() => onRouteChange?.(getKolamWalletCreateRoute())}
          style={styles.filterTrigger}
        />
      ) : null}
      {(trailing ?? []).filter(Boolean)}
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

function WalletListCard({
  canDelete,
  canEdit,
  item,
  onDelete,
  onRouteChange,
}: {
  canDelete: boolean;
  canEdit: boolean;
  item: KolamWallet;
  onDelete: () => void;
  onRouteChange?: (route: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const accountLabel = item.provider
    ? `${item.provider}${item.accountNumber ? ` · ${item.accountNumber}` : ''}`
    : `ID Dompet: ${item.id.slice(-8)}`;
  const actions: Array<{
    label: string;
    onPress: () => void;
    tone?: 'default' | 'danger';
  }> = [
    {
      label: 'Lihat Detail',
      onPress: () => onRouteChange?.(getKolamWalletDetailRoute(item.id)),
    },
  ];
  if (canEdit) {
    actions.push({
      label: 'Ubah Dompet',
      onPress: () => onRouteChange?.(getKolamWalletEditRoute(item.id)),
    });
  }
  if (canDelete) {
    actions.push({
      label: 'Hapus Dompet',
      onPress: onDelete,
      tone: 'danger',
    });
  }

  return (
    <View style={[styles.walletCardWrap, menuOpen ? styles.walletCardWrapMenuOpen : null]}>
      <KolamCardFrame
        style={[styles.walletCard, menuOpen ? styles.walletCardMenuOpen : null]}
      >
      <View style={styles.walletCardHeader}>
        <View style={styles.walletCardIdentity}>
          <View style={styles.walletCardIcon}>
            <Text style={styles.statIconSmall}>💳</Text>
          </View>
          <View style={styles.walletCardCopy}>
            <View style={styles.walletCardTitleRow}>
              <Text numberOfLines={1} style={styles.walletCardName}>
                {item.name}
              </Text>
              {item.type === 'main' ? null : (
                <KolamStatusBadge
                  intent={getKolamWalletTypeIntent(item.type)}
                  label={formatKolamWalletTypeLabel(item.type)}
                />
              )}
            </View>
            <Text numberOfLines={1} style={styles.metaText}>
              {accountLabel}
            </Text>
          </View>
        </View>
        <View style={styles.walletCardMenu}>
          <KolamOverflowMenuButton
            accessibilityLabel={`Menu ${item.name}`}
            actions={actions}
            onOpenChange={setMenuOpen}
          />
        </View>
      </View>

      <View style={styles.walletCardBalanceRow}>
        <View style={styles.walletCardBalanceCopy}>
          <Text style={styles.metaText}>Saldo Saat Ini</Text>
          <Text
            style={[
              styles.walletCardBalance,
              item.currentBalance < 0
                ? styles.valueDanger
                : styles.valuePrimary,
            ]}
          >
            {formatRupiah(item.currentBalance)}
          </Text>
        </View>
      </View>

      <View style={styles.walletCardMetaGrid}>
        <View style={styles.walletCardMetaCell}>
          <Text style={styles.metaText}>Awal</Text>
          <Text style={styles.primaryText}>
            {formatRupiah(item.initialBalance)}
          </Text>
        </View>
        <View style={styles.walletCardMetaCell}>
          <Text style={styles.metaText}>Diperbarui</Text>
          <Text numberOfLines={1} style={styles.primaryText}>
            {formatKolamWalletShortDate(item.updatedAt)}
          </Text>
        </View>
      </View>

      {item.note ? (
        <Text numberOfLines={2} style={styles.walletCardNote}>
          {item.note}
        </Text>
      ) : (
        <View style={styles.walletCardNoteSpacer} />
      )}

      <View style={styles.walletCardFooter}>
        <Text style={styles.metaText}>
          Dibuat {formatKolamWalletShortDate(item.createdAt)}
        </Text>
        <KolamButton
          intent="secondary"
          label="Lihat"
          onPress={() => onRouteChange?.(getKolamWalletDetailRoute(item.id))}
        />
      </View>
    </KolamCardFrame>
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
  const [deleteTarget, setDeleteTarget] = useState<KolamWallet | null>(null);
  const typeLabel =
    KOLAM_WALLET_TYPE_OPTIONS.find(
      option => option.value === controller.walletFilters.type,
    )?.label ?? 'Semua tipe';

  const renderWalletCard = React.useCallback(
    ({ item }: { item: KolamWallet }) => (
      <WalletListCard
        canDelete={controller.canDelete}
        canEdit={controller.canEdit}
        item={item}
        onDelete={() => setDeleteTarget(item)}
        onRouteChange={onRouteChange}
      />
    ),
    [controller.canDelete, controller.canEdit, onRouteChange],
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
              placeholder="Cari dompet..."
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
          <WalletToolbarActions
            controller={controller}
            onRouteChange={onRouteChange}
          />
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

      {controller.loadingWallets ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.metaText}>Memuat…</Text>
        </View>
      ) : controller.filteredWallets.length === 0 ? (
        <View style={styles.emptyWrap}>
          <KolamEmptyState compact title="Dompet tidak ditemukan" />
        </View>
      ) : (
        <View style={styles.walletCardGrid}>
          {controller.filteredWallets.map(item => (
            <React.Fragment key={item.id}>
              {renderWalletCard({ item })}
            </React.Fragment>
          ))}
        </View>
      )}

      {deleteTarget ? (
        <Modal
          animationType="fade"
          onRequestClose={() => setDeleteTarget(null)}
          transparent
          visible
        >
          <View style={styles.modalRoot}>
            <KolamModalBackdrop onPress={() => setDeleteTarget(null)} />
            <View style={styles.modalCard}>
              <Text style={styles.formTitle}>Hapus Dompet</Text>
              <Text style={styles.metaText}>
                Yakin ingin menghapus "{deleteTarget.name}"? Tindakan ini tidak
                dapat dibatalkan.
              </Text>
              <View style={styles.formActions}>
                <KolamCancelButton
                  intent="secondary"
                  onPress={() => setDeleteTarget(null)}
                />
                <KolamDeleteButton
                  disabled={controller.deletingWalletId === deleteTarget.id}
                  intent="primary"
                  label={
                    controller.deletingWalletId === deleteTarget.id
                      ? 'Menghapus...'
                      : 'Hapus'
                  }
                  onPress={() => {
                    void (async () => {
                      const ok = await controller.onDeleteWallet(deleteTarget);
                      if (ok) {
                        setDeleteTarget(null);
                      }
                    })();
                  }}
                />
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

function WalletCreateMode({
  controller,
  onRouteChange,
}: {
  controller: KolamWalletController;
  onRouteChange?: (route: string) => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<KolamWalletType>('regular');
  const [initialBalance, setInitialBalance] = useState('0');
  const [note, setNote] = useState('');
  const [provider, setProvider] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [requireDepositProof, setRequireDepositProof] = useState(false);
  const [formError, setFormError] = useState('');
  const balanceNumber = Number(initialBalance);
  const safeBalance =
    Number.isFinite(balanceNumber) && balanceNumber >= 0 ? balanceNumber : 0;

  return (
    <View style={styles.listRoot}>
      <View style={styles.detailHeader}>
        <KolamCancelButton
          intent="secondary"
          onPress={() => onRouteChange?.(KOLAM_WALLET_ROOT)}
          style={styles.filterTrigger}
        />
        <Text style={styles.detailTitle}>Dompet Baru</Text>
      </View>

      <KolamCardFrame style={styles.formCard}>
        <KolamDetailScrollSurface contentContainerStyle={styles.formBody}>
          {formError ? (
            <KolamStatusBadge intent="danger" label={formError} numberOfLines={3} />
          ) : null}
          <Text style={styles.sectionTitle}>Detail Dompet</Text>
          <KolamFormTextField
            onChangeText={setName}
            placeholder="Nama dompet"
            value={name}
          />
          <KolamDropdownSelect
            label="Tipe"
            menuPlacement="inline"
            onChange={value => setType(value as KolamWalletType)}
            options={KOLAM_WALLET_CREATE_TYPE_OPTIONS.map(option => ({
              label: option.label,
              value: option.value,
            }))}
            value={type}
          />
          {type === 'main' ? (
            <Text style={styles.metaText}>
              Hanya satu dompet utama yang diizinkan per sistem
            </Text>
          ) : null}
          <KolamFormTextField
            keyboardType="numeric"
            onChangeText={setInitialBalance}
            placeholder="Saldo Awal"
            value={initialBalance}
          />
          <KolamNotesField
            onChangeText={setNote}
            placeholder="Catatan"
            value={note}
          />
          <KolamFormTextField
            onChangeText={setProvider}
            placeholder="Provider / Bank"
            value={provider}
          />
          <KolamFormTextField
            onChangeText={setAccountNumber}
            placeholder="Nomor Rekening"
            value={accountNumber}
          />
          <KolamFormTextField
            onChangeText={setAccountName}
            placeholder="Nama Rekening"
            value={accountName}
          />

          <Text style={styles.sectionTitle}>Pengaturan Operasional</Text>
          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Text style={styles.primaryText}>Wajib bukti setoran</Text>
            </View>
            <KolamSwitch
              accessibilityLabel="Wajib bukti setoran"
              active={requireDepositProof}
              onPress={() => setRequireDepositProof(current => !current)}
            />
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.sectionTitle}>Ringkasan</Text>
            <View style={styles.balanceInfo}>
              <Text style={styles.metaText}>Tipe Dompet</Text>
              <KolamStatusBadge
                intent={getKolamWalletTypeIntent(type)}
                label={formatKolamWalletTypeLabel(type)}
              />
            </View>
            <View style={styles.balanceInfo}>
              <Text style={styles.metaText}>Saldo Awal</Text>
              <Text style={styles.balanceInfoValue}>
                {formatRupiah(safeBalance)}
              </Text>
            </View>
            <View style={styles.balanceInfo}>
              <Text style={styles.metaText}>Bukti Setoran</Text>
              <KolamStatusBadge
                intent={requireDepositProof ? 'warning' : 'secondary'}
                label={requireDepositProof ? 'Wajib' : 'Opsional'}
              />
            </View>
          </View>

          <View style={styles.formActions}>
            <KolamCancelButton
              intent="secondary"
              onPress={() => onRouteChange?.(KOLAM_WALLET_ROOT)}
            />
            <KolamButton
              disabled={controller.submitting || !name.trim()}
              intent="primary"
              label={
                controller.submitting ? 'Membuat dompet…' : 'Buat Dompet'
              }
              onPress={() => {
                setFormError('');
                if (!name.trim()) {
                  setFormError('Nama dompet wajib diisi.');
                  return;
                }
                void (async () => {
                  const created = await controller.onCreateWallet({
                    name: name.trim(),
                    type,
                    initialBalance: safeBalance,
                    currentBalance: safeBalance,
                    note,
                    provider,
                    accountNumber,
                    accountName,
                    requireDepositProof,
                  });
                  if (created?.id) {
                    onRouteChange?.(getKolamWalletDetailRoute(created.id));
                  } else {
                    setFormError('Gagal membuat dompet');
                  }
                })();
              }}
            />
          </View>
        </KolamDetailScrollSurface>
      </KolamCardFrame>
    </View>
  );
}

function WalletEditMode({
  controller,
  onRouteChange,
}: {
  controller: KolamWalletController;
  onRouteChange?: (route: string) => void;
}) {
  const wallet = controller.detailWallet;
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [provider, setProvider] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [requireDepositProof, setRequireDepositProof] = useState(false);
  const [formError, setFormError] = useState('');
  const [hydratedId, setHydratedId] = useState<string | null>(null);

  React.useEffect(() => {
    if (!wallet || wallet.id === hydratedId) {
      return;
    }
    setName(wallet.name);
    setNote(wallet.note);
    setProvider(wallet.provider);
    setAccountNumber(wallet.accountNumber);
    setAccountName(wallet.accountName);
    setRequireDepositProof(Boolean(wallet.requireDepositProof));
    setHydratedId(wallet.id);
  }, [hydratedId, wallet]);

  if (!controller.canEdit) {
    return (
      <View style={styles.listRoot}>
        <KolamStatusBadge intent="danger" label="Akses ditolak" />
        <KolamButton
          intent="secondary"
          label="Kembali"
          onPress={() => onRouteChange?.(KOLAM_WALLET_ROOT)}
        />
      </View>
    );
  }

  return (
    <View style={styles.listRoot}>
      <View style={styles.detailHeader}>
        <KolamCancelButton
          intent="secondary"
          onPress={() =>
            onRouteChange?.(
              wallet
                ? getKolamWalletDetailRoute(wallet.id)
                : KOLAM_WALLET_ROOT,
            )
          }
          style={styles.filterTrigger}
        />
        <Text style={styles.detailTitle}>Ubah Dompet</Text>
      </View>

      {controller.loadingDetail || !wallet ? (
        <Text style={styles.metaText}>Memuat…</Text>
      ) : (
        <KolamCardFrame style={styles.formCard}>
          <KolamDetailScrollSurface contentContainerStyle={styles.formBody}>
            {formError ? (
              <KolamStatusBadge
                intent="danger"
                label={formError}
                numberOfLines={3}
              />
            ) : null}
            <Text style={styles.sectionTitle}>Detail Dompet</Text>
            <KolamFormTextField
              onChangeText={setName}
              placeholder="Nama dompet"
              value={name}
            />
            <KolamNotesField
              onChangeText={setNote}
              placeholder="Catatan"
              value={note}
            />
            <KolamFormTextField
              onChangeText={setProvider}
              placeholder="Provider / Bank"
              value={provider}
            />
            <KolamFormTextField
              onChangeText={setAccountNumber}
              placeholder="Nomor Rekening"
              value={accountNumber}
            />
            <KolamFormTextField
              onChangeText={setAccountName}
              placeholder="Nama Rekening"
              value={accountName}
            />
            <View style={styles.switchRow}>
              <View style={styles.switchCopy}>
                <Text style={styles.primaryText}>Wajib bukti setoran</Text>
              </View>
              <KolamSwitch
                accessibilityLabel="Wajib bukti setoran"
                active={requireDepositProof}
                onPress={() => setRequireDepositProof(current => !current)}
              />
            </View>

            <Text style={styles.sectionTitle}>Informasi Dompet</Text>
            <View style={styles.balanceInfo}>
              <Text style={styles.metaText}>Tipe</Text>
              <KolamStatusBadge
                intent={getKolamWalletTypeIntent(wallet.type)}
                label={formatKolamWalletTypeLabel(wallet.type)}
              />
            </View>
            <View style={styles.balanceInfo}>
              <Text style={styles.metaText}>Saldo awal</Text>
              <Text style={styles.balanceInfoValue}>
                {formatRupiah(wallet.initialBalance)}
              </Text>
            </View>
            <View style={styles.balanceInfo}>
              <Text style={styles.metaText}>Saldo saat ini</Text>
              <Text style={styles.balanceInfoValue}>
                {formatRupiah(wallet.currentBalance)}
              </Text>
            </View>

            <View style={styles.formActions}>
              <KolamCancelButton
                intent="secondary"
                onPress={() =>
                  onRouteChange?.(getKolamWalletDetailRoute(wallet.id))
                }
              />
              <KolamSaveButton
                disabled={controller.submitting || !name.trim()}
                label={controller.submitting ? 'Menyimpan…' : 'Simpan'}
                onPress={() => {
                  setFormError('');
                  if (!name.trim()) {
                    setFormError('Nama dompet wajib diisi.');
                    return;
                  }
                  void (async () => {
                    const updated = await controller.onUpdateWallet(wallet.id, {
                      name: name.trim(),
                      note,
                      provider,
                      accountNumber,
                      accountName,
                      requireDepositProof,
                    });
                    if (updated?.id) {
                      onRouteChange?.(getKolamWalletDetailRoute(updated.id));
                    } else {
                      setFormError('Gagal memperbarui dompet');
                    }
                  })();
                }}
              />
            </View>
          </KolamDetailScrollSurface>
        </KolamCardFrame>
      )}
    </View>
  );
}

function WalletTransactionPanel({
  controller,
  onRouteChange,
  showCreateButton = true,
  showWalletFilter,
}: {
  controller: KolamWalletController;
  onRouteChange?: (route: string) => void;
  showCreateButton?: boolean;
  showWalletFilter: boolean;
}) {
  const [exportOpen, setExportOpen] = useState(false);
  const safePage = Math.max(1, controller.txPagination.page);

  const walletOptions = useMemo(
    () => [
      { label: 'Semua dana', value: '' },
      ...(controller.allWallets.length > 0
        ? controller.allWallets
        : controller.wallets
      ).map(wallet => ({
        label: wallet.name,
        value: wallet.id,
      })),
    ],
    [controller.allWallets, controller.wallets],
  );

  const transactionColumns = React.useMemo(
    () => buildWalletTransactionColumns(controller),
    [controller],
  );

  return (
    <View style={styles.panel}>
      <View style={kolamTableToolbarStyles.shell}>
        <View style={[kolamTableToolbarStyles.row, styles.txToolbarRow]}>
          <ScrollView
            horizontal
            contentContainerStyle={styles.txToolbarFiltersContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.txToolbarFiltersScroll}
          >
            {showWalletFilter ? (
              <KolamDropdownSelect
                label="Dana"
                onChange={value =>
                  controller.onChangeTxFilters({ walletId: value })
                }
                options={walletOptions}
                showLabelInTrigger={false}
                style={styles.txDropdown}
                triggerStyle={styles.filterTrigger}
                value={controller.txFilters.walletId}
              />
            ) : null}
            <KolamDropdownSelect
              label="Tipe"
              onChange={value => controller.onChangeTxFilters({ type: value })}
              options={KOLAM_WALLET_TX_TYPE_OPTIONS}
              showLabelInTrigger={false}
              style={styles.txDropdown}
              triggerStyle={styles.filterTrigger}
              value={controller.txFilters.type}
            />
            <KolamDropdownSelect
              label="Sumber"
              onChange={value =>
                controller.onChangeTxFilters({ source: value })
              }
              options={KOLAM_WALLET_TX_SOURCE_OPTIONS}
              showLabelInTrigger={false}
              style={styles.txDropdown}
              triggerStyle={styles.filterTrigger}
              value={controller.txFilters.source}
            />
            <KolamDropdownSelect
              label="Status"
              onChange={value =>
                controller.onChangeTxFilters({ confirmStatus: value })
              }
              options={KOLAM_WALLET_CONFIRM_STATUS_OPTIONS}
              showLabelInTrigger={false}
              style={styles.txDropdown}
              triggerStyle={styles.filterTrigger}
              value={controller.txFilters.confirmStatus}
            />
            <KolamToolbarDateFilter
              accessibilityLabel="Tanggal mulai"
              label="Dari"
              onChange={value =>
                controller.onChangeTxFilters({ startDate: value })
              }
              placeholder="Dari"
              value={controller.txFilters.startDate}
            />
            <KolamToolbarDateFilter
              accessibilityLabel="Tanggal sampai"
              label="Sampai"
              onChange={value =>
                controller.onChangeTxFilters({ endDate: value })
              }
              placeholder="Sampai"
              value={controller.txFilters.endDate}
            />
          </ScrollView>
          <WalletToolbarActions
            controller={controller}
            onRouteChange={onRouteChange}
            showCreate={showCreateButton && controller.mode === 'list'}
            trailing={[
              <KolamExportXlsButton
                key="export"
                label="Ekspor"
                onPress={() => setExportOpen(true)}
                style={styles.filterTrigger}
              />,
            ]}
          />
        </View>
      </View>

      <KolamListTableComposition
        columns={transactionColumns}
        emptyTitle={
          controller.loadingTransactions
            ? 'Memuat...'
            : 'Transaksi tidak ditemukan'
        }
        getRowKey={item => item.id}
        loading={controller.loadingTransactions}
        pagination={{
          onPageChange: controller.onTxPageChange,
          page: safePage,
          pageSize: controller.txFilters.limit,
          total: controller.txPagination.total,
        }}
        rows={controller.transactions}
        style={styles.tableFrame}
      />

      <KolamExportDialog
        catalogEndpoint="/wallet-transaction/export/fields"
        downloadEndpoint="/wallet-transaction/export.xlsx"
        downloadParams={{
          wallet: controller.txFilters.walletId || undefined,
          type:
            controller.txFilters.type !== 'all'
              ? controller.txFilters.type
              : undefined,
          source:
            controller.txFilters.source !== 'all'
              ? controller.txFilters.source
              : undefined,
          confirmStatus:
            controller.txFilters.confirmStatus !== 'all'
              ? controller.txFilters.confirmStatus
              : undefined,
          startDate: controller.txFilters.startDate || undefined,
          endDate: controller.txFilters.endDate || undefined,
        }}
        filenameHint="wallet-transactions"
        onOpenChange={setExportOpen}
        storageKey="wallet-tx-export-fields"
        title="Ekspor Transaksi Dompet"
        visible={exportOpen}
      />
    </View>
  );
}

function buildWalletTransactionColumns(controller: KolamWalletController) {
  return [
    {
      flex: 1,
      id: 'date',
      label: 'Tanggal',
      render: (item: KolamWalletTransaction) => (
        <Text numberOfLines={2} style={styles.metaText}>
          {formatTxDate(item.createdAt)}
        </Text>
      ),
    },
    {
      flex: 1,
      id: 'wallet',
      label: 'Dompet',
      render: (item: KolamWalletTransaction) => (
        <Text numberOfLines={1} style={styles.primaryText}>
          {item.walletName || item.walletId || '—'}
        </Text>
      ),
    },
    {
      flex: 0.7,
      id: 'type',
      label: 'Tipe',
      render: (item: KolamWalletTransaction) => (
        <Text style={styles.metaText}>
          {formatKolamWalletTxTypeLabel(item.type)}
        </Text>
      ),
    },
    {
      flex: 0.9,
      id: 'source',
      label: 'Sumber',
      render: (item: KolamWalletTransaction) => (
        <Text numberOfLines={1} style={styles.metaText}>
          {formatKolamWalletTxSourceLabel(item.source)}
        </Text>
      ),
    },
    {
      flex: 1,
      id: 'amount',
      label: 'Jumlah',
      render: (item: KolamWalletTransaction) => (
        <Text
          style={[
            styles.primaryText,
            item.type === 'credit' ? styles.valuePrimary : styles.valueDanger,
          ]}
        >
          {item.type === 'credit' ? '+' : '-'}
          {formatRupiah(item.amount)}
        </Text>
      ),
    },
    {
      flex: 0.9,
      id: 'status',
      label: 'Status',
      render: (item: KolamWalletTransaction) => (
        <KolamStatusBadge
          intent={getKolamWalletConfirmStatusIntent(item.confirmStatus)}
          label={formatKolamWalletConfirmStatusLabel(item.confirmStatus)}
        />
      ),
    },
    {
      flex: 0.9,
      id: 'bukti',
      label: 'Bukti',
      render: (item: KolamWalletTransaction) => (
        <WalletProofThumbs proofs={item.proofs} />
      ),
    },
    {
      flex: 1,
      id: 'note',
      label: 'Catatan',
      render: (item: KolamWalletTransaction) => (
        <Text numberOfLines={2} style={styles.metaText}>
          {item.note || '—'}
        </Text>
      ),
    },
    {
      flex: 0.8,
      id: 'action',
      label: '',
      render: (item: KolamWalletTransaction) => {
        const canConfirmRow =
          controller.canConfirm &&
          item.confirmStatus === 'unconfirmed' &&
          Boolean(item.id);
        return canConfirmRow ? (
          <KolamButton
            intent="primary"
            label={controller.confirmingTxId === item.id ? '...' : 'Konfirmasi'}
            onPress={() => {
              void controller.onConfirmTransaction(item);
            }}
            style={styles.confirmButton}
          />
        ) : null;
      },
    },
  ];
}

function WalletProofThumbs({
  proofs,
}: {
  proofs: KolamWalletTransaction['proofs'];
}) {
  if (!proofs.length) {
    return <Text style={styles.metaText}>—</Text>;
  }
  const visible = proofs.slice(0, 3);
  const imageItems: KolamImagePreviewItem[] = proofs
    .filter(proof => proof.uri && !isKolamWalletProofPdf(proof.path))
    .map((proof, index) => ({
      title: `Bukti ${index + 1}`,
      uri: proof.uri as string,
      revision: proof.path,
      scope: 'wallet-proof',
    }));

  return (
    <View style={styles.proofThumbs}>
      <Text style={styles.metaText}>Bukti</Text>
      <View style={styles.proofThumbRow}>
        {visible.map((proof, index) => {
          const isPdf = isKolamWalletProofPdf(proof.path);
          if (isPdf || !proof.uri) {
            return (
              <Pressable
                key={`${proof.path}-${index}`}
                onPress={() => {
                  if (proof.uri) {
                    void Linking.openURL(proof.uri);
                  }
                }}
                style={styles.proofThumbBox}
              >
                <Text style={styles.proofThumbPdf}>PDF</Text>
              </Pressable>
            );
          }
          const previewIndex = imageItems.findIndex(
            item => item.uri === proof.uri,
          );
          return (
            <KolamRemoteImage
              key={`${proof.path}-${index}`}
              accessibilityLabel={`Bukti ${index + 1}`}
              previewIndex={Math.max(0, previewIndex)}
              previewItems={imageItems}
              sourceUri={proof.uri}
              style={styles.proofThumbImage}
            />
          );
        })}
        {proofs.length > 3 ? (
          <Text style={styles.metaText}>+{proofs.length - 3}</Text>
        ) : null}
      </View>
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
  // In-tree overlay (not RN Modal): on Windows, Modal opens a separate OS
  // window with its own title bar and oversized chrome ("offside" strip).
  return (
    <View pointerEvents="box-none" style={styles.actionOverlayHost}>
      <KolamModalBackdrop onPress={controller.onCloseActionModal} />
      <View style={styles.actionModalCard}>
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
        menuStyle={styles.actionDropdownMenu}
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
      <KolamNotesField
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
        menuStyle={styles.actionDropdownMenu}
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
      <KolamNotesField
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
        menuStyle={styles.actionDropdownMenu}
        onChange={setFromWalletId}
        options={fromOptions}
        value={fromWalletId}
      />
      <KolamDropdownSelect
        label="Ke Wallet"
        menuStyle={styles.actionDropdownMenu}
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
      <KolamNotesField
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
        <KolamUploadButton
          disabled={proofs.length >= 3}
          label="Unggah Bukti"
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
              <KolamDeleteButton
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
    <View style={styles.actionFormShell}>
      <View style={styles.actionFormHeader}>
        <Text style={styles.actionFormTitle}>{title}</Text>
        {error ? (
          <KolamStatusBadge intent="danger" label={error} numberOfLines={2} />
        ) : null}
      </View>
      <ScrollView
        contentContainerStyle={styles.actionFormBody}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        style={styles.actionFormScroll}
      >
        {children}
      </ScrollView>
      <View style={styles.actionFormActions}>
        <KolamCancelButton intent="secondary" onPress={onClose} />
        <KolamButton
          disabled={submitDisabled}
          intent="primary"
          label={submitLabel}
          onPress={onSubmit}
        />
      </View>
    </View>
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
    overflow: 'hidden',
    position: 'relative',
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
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  balanceInfoValue: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  previewBlock: {
    gap: 6,
  },
  previewTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  proofBlock: {
    gap: 6,
  },
  proofLabel: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    fontWeight: '600',
  },
  proofActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  proofList: {
    gap: 6,
  },
  proofItem: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderRadius: 6,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
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
  rowActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  walletCardWrap: {
    flexBasis: 340,
    flexGrow: 1,
    maxWidth: '100%',
    minWidth: 280,
    overflow: 'visible',
    position: 'relative',
    zIndex: 1,
  },
  walletCardWrapMenuOpen: {
    elevation: 1000,
    overflow: 'visible',
    zIndex: 1000,
  },
  walletCardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    overflow: 'visible',
  },
  walletCard: {
    gap: 12,
    minHeight: 280,
    overflow: 'visible',
    padding: 14,
    position: 'relative',
    zIndex: 1,
  },
  walletCardMenuOpen: {
    elevation: 1000,
    overflow: 'visible',
    zIndex: 1000,
  },
  walletCardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    overflow: 'visible',
    zIndex: 2,
  },
  walletCardMenu: {
    flexShrink: 0,
    overflow: 'visible',
    zIndex: 3,
  },
  walletCardIdentity: {
    alignItems: 'flex-start',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    minWidth: 0,
  },
  walletCardIcon: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  statIconSmall: {
    fontSize: 18,
    lineHeight: 22,
  },
  walletCardCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  walletCardTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  walletCardName: {
    color: V.colors.fg,
    flexShrink: 1,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '700',
  },
  walletCardBalanceRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  walletCardBalanceCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  walletCardBalance: {
    fontFamily: V.fontFamily,
    fontSize: 20,
    fontWeight: '700',
  },
  walletCardMetaGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  walletCardMetaCell: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  walletCardNote: {
    backgroundColor: V.colors.muted,
    borderRadius: 8,
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  walletCardNoteSpacer: {
    flexGrow: 1,
    minHeight: 8,
  },
  walletCardFooter: {
    alignItems: 'center',
    borderTopColor: V.colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 10,
  },
  proofThumbs: {
    gap: 4,
  },
  proofThumbRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  proofThumbBox: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 4,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  proofThumbPdf: {
    color: V.colors.mutedFg,
    fontFamily: V.fontFamily,
    fontSize: 8,
    fontWeight: '700',
  },
  proofThumbImage: {
    borderColor: V.colors.border,
    borderRadius: 4,
    borderWidth: 1,
    height: 28,
    width: 28,
  },
  profileCard: {
    gap: 10,
    padding: 14,
  },
  profileTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 15,
    fontWeight: '700',
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  profileItem: {
    flexBasis: '46%',
    flexGrow: 1,
    gap: 4,
    minWidth: 160,
  },
  profileItemWide: {
    flexBasis: '100%',
  },
  formCard: {
    padding: 0,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  switchRow: {
    alignItems: 'center',
    borderColor: V.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  switchCopy: {
    flex: 1,
    marginRight: 12,
  },
  summaryBox: {
    backgroundColor: V.colors.muted,
    borderRadius: 10,
    gap: 8,
    padding: 12,
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
  emptyWrap: {
    paddingVertical: 24,
  },
  filterTrigger: {
    flexShrink: 0,
    minHeight: 32,
  },
  toolbarActionsCompact: {
    borderLeftWidth: 0,
    flexGrow: 0,
    flexShrink: 0,
    flexWrap: 'nowrap',
    gap: 4,
    justifyContent: 'flex-end',
    marginLeft: 'auto',
    paddingLeft: 0,
  },
  txToolbarRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 4,
    justifyContent: 'space-between',
    width: '100%',
  },
  txToolbarFiltersScroll: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  txToolbarFiltersContent: {
    alignItems: 'center',
    flexDirection: 'row',
    flexGrow: 0,
    flexWrap: 'nowrap',
    gap: 4,
    paddingRight: 4,
  },
  txDropdown: {
    flexShrink: 0,
    minWidth: 132,
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
  confirmButton: {
    minHeight: 28,
  },
  detailHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailToolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    width: '100%',
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
  actionOverlayHost: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    elevation: 200000,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    zIndex: 200000,
  },
  actionModalCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 0,
    maxHeight: '90%',
    maxWidth: '86%',
    overflow: 'hidden',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    width: 420,
    zIndex: 2,
  },
  actionDropdownMenu: {
    elevation: 0,
    maxHeight: 220,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
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
  actionFormShell: {
    width: '100%',
  },
  actionFormHeader: {
    borderBottomColor: V.colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
    paddingBottom: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  actionFormScroll: {
    flexGrow: 0,
    maxHeight: 360,
  },
  actionFormBody: {
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionFormTitle: {
    color: V.colors.fg,
    fontFamily: V.fontFamily,
    fontSize: 16,
    fontWeight: '700',
  },
  actionFormActions: {
    alignItems: 'center',
    alignSelf: 'stretch',
    borderTopColor: V.colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
  },
});
