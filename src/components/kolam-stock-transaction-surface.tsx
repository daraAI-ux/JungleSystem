import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { KolamStockTransaction } from '../domain/kolam-stock-transaction';
import {
  KOLAM_STOCK_TRANSACTION_ROOT,
  KOLAM_STOCK_OPNAME_TARGET_LABELS,
  canCancelFinanceStockTransaction,
  canVerifyStockTransaction,
  crossSyncOriginLabel,
  crossSyncPlatformLabel,
  crossSyncSummaryLabel,
  hasStockTransactionFinanceVerification,
  isKolamStockTransactionListRoute,
  resolveStockTxCrossSyncDisplay,
} from '../domain/kolam-stock-transaction';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { getKolamFileUrl } from '../lib/file-url';
import {
  useKolamStockTransactionController,
  type KolamStockTransactionController,
} from '../hooks/use-kolam-stock-transaction-controller';
import { KolamButton } from './kolam-button';
import {KolamCancelButton} from './kolam-cancel-button';
import {KolamSaveButton} from './kolam-save-button';
import {KolamDaftarButton} from './kolam-daftar-button';
import { KolamConfirmDialog } from './kolam-confirm-dialog';
import { KolamContentFrame } from './kolam-content-frame';
import { KolamCopyStack } from './kolam-copy-stack';
import { KolamDateField } from './kolam-date-field';
import { KolamDetailSummaryCard } from './kolam-detail-summary-card';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamRemoteImage } from './kolam-remote-image';
import { KolamSearchField } from './kolam-search-field';
import { KolamStatusBadge } from './kolam-status-badge';
import { KolamStockCrossSyncObservabilityHost } from './kolam-stock-cross-sync-observability-host';
import { KolamStockTransactionSourceIcon } from './kolam-stock-transaction-source-icon';
import { KolamMarketplaceSyncPlatformList } from './kolam-marketplace-sync-platform-list';
import { KolamTableFilterTrigger } from './kolam-table-filter-trigger';
import { kolamTableToolbarStyles } from './kolam-table-toolbar-styles';
import {
  KolamListTableComposition,
  type KolamListTableColumn,
} from './kolam-list-table-composition';

type StockTxFilterPanel = 'target' | 'status';

export function KolamStockTransactionSurface({
  onRouteChange,
  route,
}: {
  onRouteChange?: (route: string) => void;
  route: string;
}) {
  const controller = useKolamStockTransactionController(route);

  return (
    <View
      style={[
        styles.surface,
        controller.mode === 'list' ? styles.listSurface : null,
      ]}
    >
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
      {controller.mode === 'list' && isKolamStockTransactionListRoute(route) ? (
        <KolamStockTransactionList
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : controller.mode === 'detail' ? (
        <KolamStockTransactionDetail
          controller={controller}
          onRouteChange={onRouteChange}
        />
      ) : (
        <KolamStockTransactionOpname
          controller={controller}
          onRouteChange={onRouteChange}
        />
      )}
    </View>
  );
}

function KolamStockTransactionOpname({
  controller,
  onRouteChange,
}: {
  controller: KolamStockTransactionController;
  onRouteChange?: (route: string) => void;
}) {
  const [walletModalOpen, setWalletModalOpen] = React.useState(false);
  const form = controller.opnameForm;
  const targetOptions = React.useMemo(() => {
    if (form.targetType === 'product') {
      return controller.opnameProducts.map(item => ({
        label: `${item.name}${item.sku ? ` (${item.sku})` : ''}`,
        value: item.id,
      }));
    }
    if (form.targetType === 'raw') {
      return controller.opnameRawProducts.map(item => ({
        label: `${item.name}${item.sku ? ` (${item.sku})` : ''}`,
        value: item.id,
      }));
    }
    if (form.targetType === 'species') {
      return controller.speciesOptions.map(item => ({
        label: `${item.scientificName || item.displayName}${
          item.sku ? ` (${item.sku})` : ''
        }`,
        value: item.id,
      }));
    }
    if (form.targetType === 'freyer') {
      return controller.freyerOptions.map(item => ({
        label: `${item.name}${item.sku ? ` (${item.sku})` : ''}`,
        value: item.id,
      }));
    }
    return controller.teranuraOptions.map(item => ({
      label: `${item.name}${item.sku ? ` (${item.sku})` : ''}`,
      value: item.id,
    }));
  }, [
    controller.freyerOptions,
    controller.opnameProducts,
    controller.opnameRawProducts,
    controller.speciesOptions,
    controller.teranuraOptions,
    form.targetType,
  ]);

  const variantOptions = React.useMemo(
    () =>
      (controller.opnameSelectedTarget?.variants ?? []).map(variant => ({
        label: `${variant.label}${variant.sku ? ` (${variant.sku})` : ''}`,
        value: variant.id,
      })),
    [controller.opnameSelectedTarget],
  );

  const walletSelectOptions = React.useMemo(
    () =>
      controller.walletOptions.map(wallet => ({
        label: `${wallet.name} (${wallet.type})`,
        value: wallet.id,
      })),
    [controller.walletOptions],
  );

  const hasVariants = Boolean(controller.opnameSelectedTarget?.hasVariants);
  const canSave =
    Boolean(form.targetId) &&
    (!hasVariants || Boolean(form.variantId)) &&
    !controller.mutating;

  return (
    <View style={styles.detailRoot}>
      <View style={styles.headerBlock}>
        <KolamCopyStack
          items={[
            { id: 'title', text: 'Opname cepat', style: styles.title },
            {
              id: 'desc',
              text: 'Sesuaikan stok produk/life stock. Backend membuat transaksi sumber stock-opname.',
              style: styles.subtitle,
            },
          ]}
        />
        <View style={styles.headerActions}>
          <KolamCancelButton
            onPress={() => onRouteChange?.(KOLAM_STOCK_TRANSACTION_ROOT)}
          />
          <KolamSaveButton
            disabled={!canSave}
            label={controller.mutating ? 'Menyimpan…' : 'Simpan'}
            onPress={() => {
              void controller.onSubmitOpname().then(result => {
                if (result === 'wallet') {
                  setWalletModalOpen(true);
                  return;
                }
                if (result === 'done') {
                  onRouteChange?.(KOLAM_STOCK_TRANSACTION_ROOT);
                }
              });
            }}
          />
        </View>
      </View>

      <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
        <Text style={styles.sectionTitle}>Target penyesuaian</Text>
        <View style={styles.filterGrid}>
          <View style={styles.filterItem}>
            <KolamDropdownSelect
              label="Tipe target"
              onChange={value =>
                controller.onChangeOpnameForm({
                  targetType: value as typeof form.targetType,
                })
              }
              options={[
                { label: 'Produk', value: 'product' },
                { label: 'Bahan baku', value: 'raw' },
                { label: 'Life stock', value: 'species' },
                { label: 'Freyer', value: 'freyer' },
                { label: 'Teranura', value: 'teranura' },
              ]}
              value={form.targetType}
            />
          </View>
          <View style={styles.filterItem}>
            <KolamDropdownSelect
              label={KOLAM_STOCK_OPNAME_TARGET_LABELS[form.targetType]}
              onChange={value =>
                controller.onChangeOpnameForm({ targetId: value })
              }
              options={[{ label: 'Pilih item…', value: '' }, ...targetOptions]}
              searchable
              searchPlaceholder="Cari item…"
              value={form.targetId || ''}
            />
          </View>
          {hasVariants ? (
            <View style={styles.filterItem}>
              <KolamDropdownSelect
                label="Varian"
                onChange={value =>
                  controller.onChangeOpnameForm({ variantId: value })
                }
                options={[
                  { label: 'Pilih varian…', value: '' },
                  ...variantOptions,
                ]}
                searchable
                searchPlaceholder="Cari varian…"
                value={form.variantId || ''}
              />
            </View>
          ) : null}
        </View>
        {hasVariants ? (
          <Text style={styles.metaText}>
            Item ini punya varian — pilih varian. Stok utama tidak bisa
            disesuaikan langsung.
          </Text>
        ) : null}
      </KolamContentFrame>

      <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
        <Text style={styles.sectionTitle}>Penyesuaian stok</Text>
        <View style={styles.stockSummary}>
          <View style={styles.stockSummaryItem}>
            <Text style={styles.metaText}>Stok sekarang</Text>
            <Text style={styles.primaryText}>
              {controller.opnameCurrentStock == null
                ? '—'
                : formatNumber(controller.opnameCurrentStock)}
            </Text>
          </View>
          <View style={styles.stockSummaryItem}>
            <Text style={styles.metaText}>Selisih</Text>
            <Text
              style={[
                styles.primaryText,
                (controller.opnameDiff ?? 0) > 0
                  ? styles.deltaPositive
                  : (controller.opnameDiff ?? 0) < 0
                  ? styles.deltaNegative
                  : null,
              ]}
            >
              {controller.opnameDiff == null
                ? '—'
                : formatSigned(controller.opnameDiff)}
            </Text>
          </View>
        </View>
        <Text style={styles.filterLabel}>Stok sesudah</Text>
        <KolamFormTextField
          keyboardType="numeric"
          onChangeText={value =>
            controller.onChangeOpnameForm({ adjustedStock: value })
          }
          placeholder="0"
          value={form.adjustedStock}
        />
        <Text style={styles.filterLabel}>Alasan</Text>
        <KolamFormTextField
          multiline
          numberOfLines={3}
          onChangeText={value =>
            controller.onChangeOpnameForm({ reason: value })
          }
          placeholder="Opsional"
          value={form.reason}
        />
      </KolamContentFrame>

      <KolamContentFrame style={styles.detailCard} variant="settingsWebConfig">
        <Text style={styles.sectionTitle}>Foto bukti</Text>
        <View style={styles.headerActions}>
          <KolamButton
            disabled={controller.mutating}
            label="Tambah foto"
            onPress={() => {
              void controller.onAddOpnamePhoto();
            }}
          />
        </View>
        {form.photoUris.length ? (
          <View style={styles.photoGrid}>
            {form.photoUris.map((uri, index) => (
              <View key={`${uri}-${index}`} style={styles.photoItem}>
                <KolamRemoteImage
                  accessibilityLabel={`Foto opname ${index + 1}`}
                  sourceUri={uri}
                  style={styles.photoThumb}
                />
                <KolamButton
                  label="Hapus"
                  onPress={() => controller.onRemoveOpnamePhoto(index)}
                />
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.metaText}>Belum ada foto.</Text>
        )}
      </KolamContentFrame>

      {walletModalOpen ? (
        <KolamContentFrame
          style={styles.detailCard}
          variant="settingsWebConfig"
        >
          <Text style={styles.sectionTitle}>Konfirmasi dompet</Text>
          <Text style={styles.metaText}>
            Penurunan stok berdampak sekitar{' '}
            {formatCurrency(controller.opnameLossAmount)}. Pilih dompet lalu
            simpan.
          </Text>
          <KolamDropdownSelect
            label="Dompet"
            onChange={value =>
              controller.onChangeOpnameForm({ walletId: value })
            }
            options={[
              { label: 'Pilih dompet…', value: '' },
              ...walletSelectOptions,
            ]}
            value={form.walletId || ''}
          />
          <View style={styles.headerActions}>
            <KolamCancelButton
              onPress={() => setWalletModalOpen(false)}
            />
            <KolamButton
              disabled={!form.walletId || controller.mutating}
              intent="primary"
              label={controller.mutating ? 'Menyimpan…' : 'Lanjut simpan'}
              onPress={() => {
                void controller.onConfirmOpnameWallet().then(ok => {
                  if (ok) {
                    setWalletModalOpen(false);
                    onRouteChange?.(KOLAM_STOCK_TRANSACTION_ROOT);
                  }
                });
              }}
            />
          </View>
        </KolamContentFrame>
      ) : null}
    </View>
  );
}

function KolamStockTransactionDetail({
  controller,
  onRouteChange,
}: {
  controller: KolamStockTransactionController;
  onRouteChange?: (route: string) => void;
}) {
  const [cancelConfirmOpen, setCancelConfirmOpen] = React.useState(false);
  const tx = controller.selectedTransaction;
  const showFinance = tx
    ? hasStockTransactionFinanceVerification(tx.source)
    : false;
  const showVerify = tx ? canVerifyStockTransaction(tx) : false;
  const showCancelFinance = tx ? canCancelFinanceStockTransaction(tx) : false;
  const photoItems =
    tx?.photos.map((photo, index) => ({
      id: `${photo}-${index}`,
      uri: getKolamFileUrl(photo) ?? photo,
      title: `Foto bukti ${index + 1}`,
    })) ?? [];

  if (!tx && controller.loading) {
    return (
      <View style={styles.placeholder}>
        <KolamEmptyState
          compact
          message="Mengambil data transaksi dari server."
          title="Memuat detail…"
        />
      </View>
    );
  }

  if (!tx) {
    return (
      <View style={styles.placeholder}>
        <KolamEmptyState
          compact
          message="Transaksi tidak ditemukan atau gagal dimuat."
          title="Detail tidak tersedia"
        />
        <KolamButton
          label="Kembali ke daftar"
          onPress={() => onRouteChange?.(KOLAM_STOCK_TRANSACTION_ROOT)}
        />
      </View>
    );
  }

  const targetSpecies =
    tx.target?.kind === 'species'
      ? controller.speciesOptions.find(species => species.id === tx.target?.id)
      : null;
  const targetSpeciesPhotoUri =
    targetSpecies?.thumbnailUri || targetSpecies?.photoUris[0] || null;

  const infoRows: Array<{
    id: string;
    label: string;
    value: string;
    meta: string;
    tone: 'default' | 'success' | 'warning' | 'danger';
  }> = [
    {
      id: 'id',
      label: 'ID transaksi',
      value: tx.id,
      meta: '',
      tone: 'default',
    },
    {
      id: 'type',
      label: 'Tipe',
      value: formatType(tx.type),
      meta: '',
      tone: 'default',
    },
    {
      id: 'source',
      label: 'Sumber',
      value: tx.sourceLabel,
      meta: '',
      tone: 'default',
    },
  ];

  if (tx.enclosureLabel) {
    infoRows.push({
      id: 'enclosure',
      label: 'Kandang',
      value: tx.enclosureLabel,
      meta: tx.enclosureHref || '',
      tone: 'default',
    });
  }
  if (tx.reference) {
    infoRows.push({
      id: 'reference',
      label: 'Referensi',
      value: tx.reference.label,
      meta: tx.reference.sourceModel,
      tone: 'default',
    });
  }

  infoRows.push(
    {
      id: 'target',
      label: 'Target',
      value: tx.target?.label || '—',
      meta: tx.target
        ? `${targetKindLabel(tx.target.kind)} · ${tx.target.sku}`
        : '',
      tone: 'default',
    },
    {
      id: 'variant',
      label: 'Varian',
      value: tx.variantLabel,
      meta: '',
      tone: 'default',
    },
    {
      id: 'stock',
      label: 'Perubahan stok',
      value: `${formatNumber(tx.before)} → ${formatNumber(
        tx.after,
      )} (${formatSigned(tx.delta)})`,
      meta: tx.computed?.isEnclosureOnly
        ? `Stok jual global: ${formatNumber(tx.globalBefore)} → ${formatNumber(
            tx.globalAfter,
          )}`
        : tx.computed?.displayScopeLabel || '',
      tone: 'default',
    },
    {
      id: 'qty',
      label: 'Kuantitas',
      value: formatNumber(tx.quantity),
      meta: '',
      tone: 'default',
    },
    {
      id: 'reason',
      label: 'Alasan',
      value: tx.reason || 'Tidak ada alasan',
      meta: '',
      tone: 'default',
    },
  );

  if (showFinance) {
    infoRows.push({
      id: 'verification',
      label: 'Status verifikasi',
      value: tx.statusLabel,
      meta: tx.verificationHint || '',
      tone:
        tx.status === 'verified' || tx.financeCancelled ? 'success' : 'warning',
    });

    if (tx.financeCancelled) {
      infoRows.push({
        id: 'wallet-debit',
        label: 'Debit dompet',
        value: 'Dibatalkan',
        meta: 'Hanya perubahan stok; tidak ada uang masuk/keluar.',
        tone: 'warning',
      });
    } else if (tx.walletTransaction) {
      infoRows.push({
        id: 'wallet-debit',
        label: 'Debit dompet',
        value: tx.walletTransaction.walletName || 'Dompet',
        meta: `${formatCurrency(tx.walletTransaction.amount)} · ${
          tx.financeStatusLabel
        }`,
        tone:
          tx.walletTransaction.confirmStatus === 'confirmed'
            ? 'success'
            : tx.walletTransaction.confirmStatus === 'rejected'
            ? 'danger'
            : 'warning',
      });
    } else {
      infoRows.push({
        id: 'wallet-debit',
        label: 'Debit dompet',
        value: 'Tidak ada',
        meta: 'Tidak ada transaksi dompet tertaut pada transaksi ini.',
        tone: 'default',
      });
    }
  }

  if (showFinance && tx.verifiedAt) {
    infoRows.push({
      id: 'verified-at',
      label: 'Diverifikasi pada',
      value: formatDateTime(tx.verifiedAt),
      meta: tx.verifiedBy?.name || '',
      tone: 'default',
    });
  }

  infoRows.push(
    {
      id: 'created-by',
      label: 'Dibuat oleh',
      value: tx.createdBy?.name || '—',
      meta: '',
      tone: 'default',
    },
    {
      id: 'created-at',
      label: 'Dibuat pada',
      value: formatDateTime(tx.createdAt),
      meta: '',
      tone: 'default',
    },
  );

  return (
    <View style={styles.detailRoot}>
      <View style={styles.toolbarWrap}>
        <View style={styles.toolbarShell}>
          <View style={styles.detailActionRow}>
            <KolamDaftarButton
              muted
              onPress={() => onRouteChange?.(KOLAM_STOCK_TRANSACTION_ROOT)}
              style={styles.toolbarButton}
            />
            {tx.target?.href ? (
              <KolamButton
                label={`Buka ${targetKindLabel(tx.target.kind)}`}
                onPress={() => onRouteChange?.(tx.target!.href!)}
                style={styles.toolbarButton}
              />
            ) : null}
            {showVerify ? (
              <KolamButton
                disabled={controller.mutating}
                intent="primary"
                label={
                  controller.mutating ? 'Memproses…' : 'Verifikasi Finance'
                }
                onPress={() => {
                  void controller.onVerify();
                }}
                style={styles.toolbarButton}
              />
            ) : null}
            {showCancelFinance ? (
              <KolamButton
                disabled={controller.mutating}
                label="Batalkan Finance"
                onPress={() => setCancelConfirmOpen(true)}
                style={styles.toolbarButton}
              />
            ) : null}
          </View>
        </View>
      </View>

      <KolamDetailSummaryCard
        description="Detil transaksi stok dan status verifikasi."
        fields={infoRows.map(row => ({
          id: row.id,
          label: row.label,
          value:
            row.id === 'target' && targetSpeciesPhotoUri ? (
              <View style={styles.summaryTargetRow}>
                <KolamRemoteImage
                  accessibilityLabel={row.value || 'Foto spesies'}
                  sourceUri={targetSpeciesPhotoUri}
                  style={styles.summaryTargetPhoto}
                />
                <View style={styles.summaryTargetCopy}>
                  <Text style={styles.summaryFieldValue}>
                    {row.value || '—'}
                  </Text>
                  {row.meta ? (
                    <Text style={styles.summaryFieldMeta}>{row.meta}</Text>
                  ) : null}
                </View>
              </View>
            ) : (
              <View style={styles.summaryFieldStack}>
                <Text
                  style={[
                    styles.summaryFieldValue,
                    row.tone === 'success' ? styles.successText : null,
                    row.tone === 'warning' ? styles.warningText : null,
                    row.tone === 'danger' ? styles.dangerText : null,
                  ]}
                >
                  {row.value || '—'}
                </Text>
                {row.meta ? (
                  <Text style={styles.summaryFieldMeta}>{row.meta}</Text>
                ) : null}
              </View>
            ),
        }))}
        fieldColumns={3}
        style={styles.detailCard}
        title="Informasi transaksi"
      />

      {(() => {
        const crossSyncDisplay = resolveStockTxCrossSyncDisplay(
          tx.crossSync,
          tx.reason,
        );
        if (!crossSyncDisplay) {
          return null;
        }
        return (
          <KolamContentFrame
            style={styles.detailCard}
            variant="settingsWebConfig"
          >
            <Text style={styles.sectionTitle}>Sinkron ke marketplace</Text>
            <View style={styles.crossSyncBox}>
              <Text style={styles.cellText}>
                {crossSyncDisplay.summaryLabel}
              </Text>
              {crossSyncDisplay.originPlatform ? (
                <Text style={styles.metaText}>
                  Asal: {crossSyncOriginLabel(crossSyncDisplay.originPlatform)}
                </Text>
              ) : null}
              {crossSyncDisplay.sku ? (
                <Text style={styles.metaText}>
                  SKU {crossSyncDisplay.sku}
                  {crossSyncDisplay.targetStock != null
                    ? ` → stok target ${crossSyncDisplay.targetStock}`
                    : ''}
                </Text>
              ) : null}
              {crossSyncDisplay.syncNote ? (
                <Text style={styles.metaText}>
                  Catatan: {crossSyncDisplay.syncNote}
                </Text>
              ) : null}
              {crossSyncDisplay.usedFallbackPlatforms ? (
                <Text style={styles.metaText}>
                  Target platform dari catatan sinkron (audit kosong).
                </Text>
              ) : null}
              <View style={styles.crossSyncPlatformWrap}>
                <KolamMarketplaceSyncPlatformList
                  emptyText="Belum ada target platform"
                  formatTime={formatDateTime}
                  platforms={crossSyncDisplay.targets.map(target => ({
                    label: crossSyncPlatformLabel(target.platform),
                    lastSyncedAt: target.completedAt || target.dispatchedAt,
                    platform: target.platform,
                    status: target.status,
                    statusLabel: target.statusLabel,
                  }))}
                  showTime
                />
              </View>
              {crossSyncDisplay.targets.some(
                target => target.error || target.taskId,
              ) ? (
                <View style={styles.crossSyncExtraWrap}>
                  {crossSyncDisplay.targets.map(target => {
                    if (!target.error && !target.taskId) {
                      return null;
                    }
                    return (
                      <View
                        key={target.platform}
                        style={styles.crossSyncExtraRow}
                      >
                        <Text style={styles.metaText}>
                          {crossSyncPlatformLabel(target.platform)}
                          {target.taskId ? ` · Task ${target.taskId}` : ''}
                        </Text>
                        {target.error ? (
                          <Text style={styles.dangerText}>{target.error}</Text>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </View>
          </KolamContentFrame>
        );
      })()}

      {photoItems.length ? (
        <KolamContentFrame
          style={styles.detailCard}
          variant="settingsWebConfig"
        >
          <Text style={styles.sectionTitle}>Foto bukti</Text>
          <Text style={styles.metaText}>
            {photoItems.length} foto terlampir
          </Text>
          <View style={styles.photoGrid}>
            {photoItems.map((photo, index) => (
              <KolamRemoteImage
                key={photo.id}
                accessibilityLabel={photo.title}
                previewIndex={index}
                previewItems={photoItems}
                sourceUri={photo.uri}
                style={styles.photoThumb}
              />
            ))}
          </View>
        </KolamContentFrame>
      ) : null}

      <KolamConfirmDialog
        cancelLabel="Batal"
        confirmLabel="Batalkan finance"
        destructive
        message="Putuskan transaksi keuangan dari stock opname ini. Hanya perubahan stok yang tetap; tidak ada uang masuk atau keluar. Lanjutkan?"
        onCancel={() => setCancelConfirmOpen(false)}
        onConfirm={() => {
          void controller.onCancelFinance().then(ok => {
            if (ok) {
              setCancelConfirmOpen(false);
            }
          });
        }}
        title="Batalkan finance"
        visible={cancelConfirmOpen}
      />
    </View>
  );
}

function KolamStockTransactionList({
  controller,
  onRouteChange,
}: {
  controller: KolamStockTransactionController;
  onRouteChange?: (route: string) => void;
}) {
  const [searchInput, setSearchInput] = React.useState(
    controller.filters.search,
  );
  const [activeFilterPanel, setActiveFilterPanel] =
    React.useState<StockTxFilterPanel | null>(null);
  const [filterQuery, setFilterQuery] = React.useState('');
  const pageCount = Math.max(1, controller.pagination.totalPages);
  const safePage = Math.min(Math.max(controller.pagination.page, 1), pageCount);
  const listColumns = React.useMemo(
    () =>
      buildStockTransactionListColumns(item =>
        onRouteChange?.(`${KOLAM_STOCK_TRANSACTION_ROOT}/${item.id}`),
      ),
    [onRouteChange],
  );
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
  }, [
    controller,
    controller.filters.search,
    controller.onSearchChange,
    searchInput,
  ]);

  const targetFilterValue = controller.filters.productId
    ? `product:${controller.filters.productId}`
    : controller.filters.speciesId
    ? `species:${controller.filters.speciesId}`
    : 'all';

  const targetOptions = React.useMemo(() => {
    const productOpts = controller.productOptions.map(item => ({
      label: `${item.name}${item.sku ? ` (${item.sku})` : ''}`,
      value: `product:${item.id}` as const,
    }));
    const speciesOpts = controller.speciesOptions.map(item => ({
      label: `${item.scientificName || item.displayName}${
        item.sku ? ` (${item.sku})` : ''
      }`,
      value: `species:${item.id}` as const,
    }));
    return [
      { label: 'Semua', value: 'all' as const },
      ...productOpts,
      ...speciesOpts,
    ];
  }, [controller.productOptions, controller.speciesOptions]);

  const statusOptions = React.useMemo(
    () => [
      { label: 'Semua', value: 'all' },
      { label: 'Terverifikasi', value: 'verified' },
      { label: 'Belum verifikasi', value: 'unverified' },
    ],
    [],
  );

  const targetFilterLabel =
    targetFilterValue === 'all'
      ? 'Target'
      : truncateFilterLabel(
          targetOptions.find(option => option.value === targetFilterValue)
            ?.label ?? 'Target',
        );
  const statusFilterLabel = !controller.filters.status
    ? 'Status'
    : statusOptions.find(option => option.value === controller.filters.status)
        ?.label ?? 'Status';

  const openFilterPanel = (panel: StockTxFilterPanel) => {
    setFilterQuery('');
    setActiveFilterPanel(current => (current === panel ? null : panel));
  };

  return (
    <View style={styles.listRoot}>
      {controller.filters.stockOpnameId ? (
        <Text style={styles.subtitle}>
          Filter stock opname: {controller.filters.stockOpnameId}
        </Text>
      ) : null}

      <View style={styles.toolbarWrap}>
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              <KolamSearchField
                containerStyle={kolamTableToolbarStyles.searchInput}
                onChangeText={setSearchInput}
                placeholder="Cari"
                value={searchInput}
              />
              <KolamTableFilterTrigger
                active={
                  activeFilterPanel === 'target' || targetFilterValue !== 'all'
                }
                label={targetFilterLabel}
                onPress={() => openFilterPanel('target')}
                open={activeFilterPanel === 'target'}
                variant="quiet"
              />
              <KolamTableFilterTrigger
                active={
                  activeFilterPanel === 'status' ||
                  Boolean(controller.filters.status)
                }
                label={statusFilterLabel}
                onPress={() => openFilterPanel('status')}
                open={activeFilterPanel === 'status'}
                variant="quiet"
              />
              <KolamDateField
                accessibilityLabel="Tanggal mulai"
                label="Dari"
                onChange={value => {
                  setActiveFilterPanel(null);
                  controller.onChangeFilters({ startDate: value });
                }}
                placeholder="Dari"
                showLabelInTrigger={false}
                style={styles.dateField}
                value={controller.filters.startDate}
              />
              <KolamDateField
                accessibilityLabel="Tanggal sampai"
                label="Sampai"
                onChange={value => {
                  setActiveFilterPanel(null);
                  controller.onChangeFilters({ endDate: value });
                }}
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
                onPress={() => {
                  void controller.onExport();
                }}
                style={styles.toolbarButton}
              />
              <KolamButton
                intent="primary"
                label="Opname cepat"
                onPress={() =>
                  onRouteChange?.(`${KOLAM_STOCK_TRANSACTION_ROOT}/opname`)
                }
                style={styles.toolbarButton}
              />
            </View>
          </View>
        </View>

        {activeFilterPanel ? (
          <StockTxFilterOverlayPanel
            onClose={() => setActiveFilterPanel(null)}
            onQueryChange={setFilterQuery}
            onSelect={value => {
              if (activeFilterPanel === 'target') {
                if (value === 'all') {
                  controller.onChangeFilters({ productId: '', speciesId: '' });
                } else if (value.startsWith('product:')) {
                  controller.onChangeFilters({
                    productId: value.slice('product:'.length),
                    speciesId: '',
                  });
                } else if (value.startsWith('species:')) {
                  controller.onChangeFilters({
                    productId: '',
                    speciesId: value.slice('species:'.length),
                  });
                }
              } else {
                controller.onChangeFilters({
                  status:
                    value === 'verified' || value === 'unverified' ? value : '',
                });
              }
              setActiveFilterPanel(null);
              setFilterQuery('');
            }}
            options={
              activeFilterPanel === 'target' ? targetOptions : statusOptions
            }
            panel={activeFilterPanel}
            query={filterQuery}
            selectedValue={
              activeFilterPanel === 'target'
                ? targetFilterValue
                : controller.filters.status || 'all'
            }
          />
        ) : null}
      </View>

      <View style={styles.listBody} pointerEvents="box-none">
        <KolamStockCrossSyncObservabilityHost onRouteChange={onRouteChange} />

        {controller.pendingReturns.length ? (
          <KolamContentFrame
            style={styles.pendingFrame}
            variant="settingsWebConfig"
          >
            <Text style={styles.pendingTitle}>Ekspektasi retur tertunda</Text>
            {controller.pendingReturns.map(item => (
              <Text key={item.complaintId} style={styles.pendingRow}>
                {item.ticketCode} · qty {formatNumber(item.quantity)}
                {item.saleInvoiceCode ? ` · ${item.saleInvoiceCode}` : ''}
              </Text>
            ))}
          </KolamContentFrame>
        ) : null}

        <KolamListTableComposition
          columns={listColumns}
          emptyTitle={
            controller.loading
              ? 'Memuat transaksi stok...'
              : 'Belum ada transaksi'
          }
          getRowKey={item => item.id}
          loading={controller.loading}
          pagination={{
            onPageChange: page => controller.onPageChange(page),
            page: safePage,
            pageSize: controller.pagination.limit,
            total:
              controller.pagination.total || controller.transactions.length,
          }}
          rows={controller.transactions}
          style={styles.tableFrame}
        />
      </View>
    </View>
  );
}

function buildStockTransactionListColumns(
  onOpen: (item: KolamStockTransaction) => void,
): Array<KolamListTableColumn<KolamStockTransaction>> {
  return [
    {
      flex: 1.4,
      id: 'target',
      label: 'Target',
      render: item => (
        <StockTransactionCellButton item={item} onOpen={onOpen}>
          <Text numberOfLines={2} style={styles.primaryText}>
            {item.target?.label || '-'}
          </Text>
          <Text numberOfLines={1} style={styles.metaText}>
            {item.target?.sku || '-'}
          </Text>
        </StockTransactionCellButton>
      ),
    },
    {
      align: 'center',
      flex: 0.9,
      id: 'variant',
      label: 'Varian',
      render: item => (
        <StockTransactionCellButton center item={item} onOpen={onOpen}>
          <Text numberOfLines={2} style={styles.cellText}>
            {item.variantLabel}
          </Text>
        </StockTransactionCellButton>
      ),
    },
    {
      align: 'center',
      flex: 0.6,
      id: 'type',
      label: 'Tipe',
      render: item => (
        <StockTransactionCellButton center item={item} onOpen={onOpen}>
          <Text style={styles.cellText}>{formatType(item.type)}</Text>
        </StockTransactionCellButton>
      ),
    },
    {
      align: 'center',
      flex: 0.75,
      id: 'source',
      label: 'Sumber',
      render: item => (
        <StockTransactionCellButton center item={item} onOpen={onOpen}>
          <KolamStockTransactionSourceIcon
            label={item.sourceLabel}
            logoUri={item.salesSource?.logoUri}
            salesSourceName={item.salesSource?.name}
            source={item.source}
          />
        </StockTransactionCellButton>
      ),
    },
    {
      align: 'center',
      flex: 0.8,
      id: 'sync',
      label: 'Sync MP',
      render: item => (
        <StockTransactionCellButton center item={item} onOpen={onOpen}>
          <Text numberOfLines={2} style={styles.metaText}>
            {resolveStockTxCrossSyncDisplay(item.crossSync, item.reason)
              ?.summaryLabel ||
              crossSyncSummaryLabel(item.crossSync?.summary) ||
              '-'}
          </Text>
        </StockTransactionCellButton>
      ),
    },
    {
      flex: 1,
      id: 'status',
      label: 'Status',
      render: item => (
        <StockTransactionCellButton item={item} onOpen={onOpen}>
          <Text numberOfLines={1} style={styles.cellText}>
            {item.statusLabel}
          </Text>
          {item.financeNote ? (
            <Text numberOfLines={2} style={styles.metaText}>
              {item.financeNote}
            </Text>
          ) : null}
        </StockTransactionCellButton>
      ),
    },
    {
      align: 'center',
      flex: 0.5,
      id: 'qty',
      label: 'Qty',
      render: item => (
        <StockTransactionCellButton center item={item} onOpen={onOpen}>
          <Text style={styles.numText}>{formatNumber(item.quantity)}</Text>
        </StockTransactionCellButton>
      ),
    },
    {
      align: 'center',
      flex: 0.6,
      id: 'before',
      label: 'Sebelum',
      render: item => (
        <StockTransactionCellButton center item={item} onOpen={onOpen}>
          <Text style={styles.numText}>{formatNumber(item.before)}</Text>
        </StockTransactionCellButton>
      ),
    },
    {
      align: 'center',
      flex: 0.6,
      id: 'after',
      label: 'Sesudah',
      render: item => (
        <StockTransactionCellButton center item={item} onOpen={onOpen}>
          <Text style={styles.numText}>{formatNumber(item.after)}</Text>
        </StockTransactionCellButton>
      ),
    },
    {
      align: 'center',
      flex: 0.6,
      id: 'delta',
      label: 'Selisih',
      render: item => (
        <StockTransactionCellButton center item={item} onOpen={onOpen}>
          <Text
            style={[
              styles.numText,
              item.delta > 0
                ? styles.deltaPositive
                : item.delta < 0
                ? styles.deltaNegative
                : null,
            ]}
          >
            {formatSigned(item.delta)}
          </Text>
        </StockTransactionCellButton>
      ),
    },
  ];
}

function StockTransactionCellButton({
  center = false,
  children,
  item,
  onOpen,
}: {
  center?: boolean;
  children: React.ReactNode;
  item: KolamStockTransaction;
  onOpen: (item: KolamStockTransaction) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onOpen(item)}
      style={({ pressed }) => [
        styles.stockTxCellButton,
        center ? styles.stockTxCellButtonCenter : null,
        pressed ? styles.rowPressed : null,
      ]}
    >
      {children}
    </Pressable>
  );
}

function StockTxFilterOverlayPanel({
  onClose,
  onQueryChange,
  onSelect,
  options,
  panel,
  query,
  selectedValue,
}: {
  onClose: () => void;
  onQueryChange: (value: string) => void;
  onSelect: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  panel: StockTxFilterPanel;
  query: string;
  selectedValue: string;
}) {
  const normalizedQuery = normalizeStockTxFilterQuery(query);
  const filteredOptions = normalizedQuery
    ? options.filter(option =>
        normalizeStockTxFilterQuery(option.label).includes(normalizedQuery),
      )
    : options;

  return (
    <View
      style={[
        styles.filterOverlayPanel,
        panel === 'target'
          ? styles.filterPanelTarget
          : styles.filterPanelStatus,
      ]}
    >
      {panel === 'target' ? (
        <KolamFormTextField
          onChangeText={onQueryChange}
          placeholder="Cari target…"
          style={styles.filterPanelSearch}
          value={query}
        />
      ) : null}
      <ScrollView
        contentContainerStyle={styles.filterPanelContent}
        keyboardShouldPersistTaps="handled"
        style={styles.filterPanelScroll}
      >
        {filteredOptions.length ? (
          filteredOptions.map(option => {
            const selected = option.value === selectedValue;
            return (
              <KolamButton
                intent={selected ? 'primary' : 'plain'}
                key={option.value}
                label={option.label}
                onPress={() => onSelect(option.value)}
                style={styles.filterPanelOption}
              />
            );
          })
        ) : (
          <Text style={styles.filterPanelEmpty}>Tidak ada hasil</Text>
        )}
      </ScrollView>
      <View style={styles.filterPanelFooter}>
        <KolamButton label="Tutup" onPress={onClose} />
      </View>
    </View>
  );
}

function normalizeStockTxFilterQuery(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');
}

function truncateFilterLabel(label: string, max = 22) {
  const trimmed = label.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max - 1)}…`;
}

function formatType(type: string) {
  if (type === 'in') {
    return 'Masuk';
  }
  if (type === 'out') {
    return 'Keluar';
  }
  if (type === 'adjust') {
    return 'Sesuaikan';
  }
  return type || '—';
}

function formatNumber(value: number) {
  return Number.isFinite(value) ? String(value) : '—';
}

function formatSigned(value: number) {
  if (!Number.isFinite(value)) {
    return '—';
  }
  if (value > 0) {
    return `+${value}`;
  }
  return String(value);
}

function formatCurrency(value: number) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
}

function formatDateTime(value: string) {
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

function targetKindLabel(kind: string) {
  switch (kind) {
    case 'product':
      return 'Produk';
    case 'species':
      return 'Spesies';
    case 'packing':
      return 'Kemasan';
    case 'freyer':
      return 'Freyer';
    case 'teranura':
      return 'Teranura';
    case 'service':
      return 'Layanan';
    default:
      return 'Target';
  }
}

const styles = StyleSheet.create({
  surface: {
    gap: 12,
  },
  listSurface: {
    flex: 1,
    minHeight: 0,
    overflow: 'visible',
  },
  listRoot: {
    flex: 1,
    minHeight: 0,
    gap: 12,
    overflow: 'visible',
  },
  listBody: {
    flex: 1,
    minHeight: 0,
    gap: 12,
    zIndex: 0,
    elevation: 0,
  },
  detailRoot: {
    gap: 12,
  },
  errorBadge: {
    alignSelf: 'stretch',
  },
  headerBlock: {
    gap: 8,
  },
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    color: V.colors.fg,
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    color: V.colors.mutedFg,
    fontSize: 13,
  },
  toolbarWrap: {
    position: 'relative',
    zIndex: 100000,
    elevation: 1000,
    overflow: 'visible',
  },
  toolbarShell: {
    alignItems: 'center',
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'space-between',
    overflow: 'visible',
    padding: 4,
  },
  detailActionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-end',
    marginLeft: 'auto',
  },
  dateField: {
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 110,
    maxWidth: 160,
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
    width: 280,
    zIndex: 120000,
  },
  filterPanelTarget: {
    left: 148,
    width: 320,
  },
  filterPanelStatus: {
    left: 300,
    width: 220,
  },
  filterPanelSearch: {
    marginBottom: 6,
  },
  filterPanelScroll: {
    maxHeight: 260,
  },
  filterPanelContent: {
    gap: 4,
  },
  filterPanelOption: {
    justifyContent: 'flex-start',
  },
  filterPanelEmpty: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  filterPanelFooter: {
    alignItems: 'flex-end',
    borderTopColor: V.colors.border,
    borderTopWidth: 1,
    marginTop: 6,
    paddingTop: 6,
  },
  toolbarButton: {
    flexShrink: 0,
    minHeight: 34,
    paddingHorizontal: 10,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterItem: {
    flexGrow: 1,
    flexBasis: 220,
    minWidth: 200,
    gap: 4,
  },
  filterLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
  },
  pendingFrame: {
    gap: 4,
  },
  pendingTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  pendingRow: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  tableFrame: {
    minHeight: 0,
  },
  rowPressed: {
    backgroundColor: V.colors.muted,
  },
  stockTxCellButton: {
    alignSelf: 'stretch',
    minWidth: 0,
    paddingVertical: 2,
    width: '100%',
  },
  stockTxCellButtonCenter: {
    alignItems: 'center',
  },
  primaryText: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '600',
  },
  cellText: {
    color: V.colors.fg,
    fontSize: 12,
  },
  metaText: {
    color: V.colors.mutedFg,
    fontSize: 11,
  },
  summaryFieldStack: {
    gap: 3,
    minWidth: 0,
  },
  summaryTargetRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minWidth: 0,
  },
  summaryTargetPhoto: {
    borderRadius: 8,
    height: 42,
    width: 42,
  },
  summaryTargetCopy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  summaryFieldValue: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  summaryFieldMeta: {
    color: V.colors.mutedFg,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
  successText: {
    color: V.colors.success,
  },
  warningText: {
    color: V.colors.warning,
  },
  dangerText: {
    color: V.colors.danger,
    fontSize: 11,
  },
  numText: {
    color: V.colors.fg,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  deltaPositive: {
    color: V.colors.success,
  },
  deltaNegative: {
    color: V.colors.danger,
  },
  emptyWrap: {
    paddingVertical: 24,
  },
  paginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageLabel: {
    color: V.colors.mutedFg,
    fontSize: 12,
  },
  placeholder: {
    gap: 12,
    paddingVertical: 16,
  },
  detailCard: {
    gap: 8,
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 15,
    fontWeight: '700',
  },
  crossSyncBox: {
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: V.colors.border,
    backgroundColor: V.colors.bg,
  },
  crossSyncPlatformWrap: {
    paddingTop: 4,
  },
  crossSyncExtraWrap: {
    gap: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: V.colors.border,
    paddingTop: 6,
  },
  crossSyncExtraRow: {
    gap: 2,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoItem: {
    gap: 6,
  },
  photoThumb: {
    width: 148,
    height: 96,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: V.colors.border,
    backgroundColor: V.colors.muted,
  },
  stockSummary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  stockSummaryItem: {
    minWidth: 120,
    gap: 2,
  },
});
