import React, { useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  KOLAM_OPNAME_MINUS_REASON_OPTIONS,
  KOLAM_STOCK_OPNAME_LINE_TARGET_LABELS,
  KOLAM_STOCK_OPNAME_ROOT,
  collectStockOpnameMarketplaceSyncTargets,
  formatStockOpnameLineCounts,
  hasKolamStockOpnamePermission,
  needsOpnameMinusReason,
  stockOpnameLineDiff,
  stockOpnameLineNeedsMinusReason,
  stockOpnameLineSystemBaseline,
  stockOpnameLineTargetLabel,
  stockOpnameUserDisplayName,
  type KolamOpnameMinusReason,
  type KolamStockOpnameLine,
  type KolamStockOpnameLineTargetType,
  type KolamStockOpnameStaffAssignee,
} from '../domain/kolam-stock-opname';
import { kolamVisualTokens as V } from '../domain/kolam-visual';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  useKolamStockOpnameDetailController,
  type KolamStockOpnameDetailController,
} from '../hooks/use-kolam-stock-opname-detail-controller';
import { getKolamFileUrl } from '../lib/file-url';
import { pickNativeImageFile } from '../services/native-file-picker';
import { KolamButton } from './kolam-button';
import {KolamDeleteButton} from './kolam-delete-button';
import {KolamCancelButton} from './kolam-cancel-button';
import {KolamSaveButton} from './kolam-save-button';
import {KolamDaftarButton} from './kolam-daftar-button';
import {KolamEditButton} from './kolam-edit-button';
import {KolamStockTransactionButton} from './kolam-stock-transaction-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamConfirmDialog } from './kolam-confirm-dialog';
import { KolamDetailScrollSurface } from './kolam-detail-scroll-surface';
import { KolamDropdownSelect } from './kolam-dropdown-select';
import { KolamEmptyState } from './kolam-empty-state';
import { KolamExportXlsButton } from './kolam-export-xls-button';
import { KolamFormTextField } from './kolam-form-text-field';
import { KolamMarketplacePriceSyncDialog } from './kolam-marketplace-price-sync-dialog';
import { KolamModalBackdrop } from './kolam-modal-backdrop';
import { KolamPdfDownloadButton } from './kolam-pdf-download-button';
import { KolamStatusBadge } from './kolam-status-badge';
import {kolamTableToolbarStyles} from './kolam-table-toolbar-styles';

/**
 * Detail dokumen stock opname — FE `/stock-opname/[id]`.
 * Header, baris, review, posting.
 */
export function KolamStockOpnameDetail({
  documentId,
  onRouteChange,
}: {
  documentId: string | null;
  onRouteChange?: (route: string) => void;
}) {
  const controller = useKolamStockOpnameDetailController(documentId);
  const { authUser } = useKolamAuthContext();
  const canUpdate = hasKolamStockOpnamePermission(
    authUser?.permissions,
    'update',
    authUser?.roleKey,
  );
  const canSubmit = hasKolamStockOpnamePermission(
    authUser?.permissions,
    'submit',
    authUser?.roleKey,
  );
  const canReview = hasKolamStockOpnamePermission(
    authUser?.permissions,
    'review',
    authUser?.roleKey,
  );
  const canPost = hasKolamStockOpnamePermission(
    authUser?.permissions,
    'post',
    authUser?.roleKey,
  );
  const canDelete = hasKolamStockOpnamePermission(
    authUser?.permissions,
    'delete',
    authUser?.roleKey,
  );
  const [noteDraft, setNoteDraft] = useState('');
  const [noteSynced, setNoteSynced] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{
    lineId: string;
    decision: 'rejected' | 'revision';
  } | null>(null);
  const [reviewReason, setReviewReason] = useState('');
  const [editLine, setEditLine] = useState<KolamStockOpnameLine | null>(null);
  const [editQty, setEditQty] = useState('');
  const [editMinus, setEditMinus] = useState<KolamOpnameMinusReason | ''>('');
  const [editNote, setEditNote] = useState('');
  const [syncRetry, setSyncRetry] = useState<'products' | 'species' | null>(
    null,
  );

  React.useEffect(() => {
    if (!controller.header) {
      return;
    }
    if (!noteSynced || controller.header.id !== documentId) {
      setNoteDraft(controller.header.note || '');
      setNoteSynced(true);
    }
  }, [controller.header, documentId, noteSynced]);

  React.useEffect(() => {
    setNoteSynced(false);
    setSyncRetry(null);
  }, [documentId]);

  const marketplaceSyncTargets = useMemo(
    () => collectStockOpnameMarketplaceSyncTargets(controller.lines),
    [controller.lines],
  );

  const staffOptions = useMemo(
    () => [
      { label: '— Pilih —', value: '' },
      ...controller.staffAssignees.map(user => ({
        label: stockOpnameStaffAssigneeLabel(user),
        value: user.id,
      })),
    ],
    [controller.staffAssignees],
  );

  const targetOptions = useMemo(() => {
    if (controller.addDraft.targetType === 'raw') {
      return controller.rawOptions.map(item => ({
        label: `${item.name}${item.sku ? ` (${item.sku})` : ''}`,
        value: item.id,
      }));
    }
    if (controller.addDraft.targetType === 'species') {
      return controller.speciesOptions.map(item => ({
        label: item.localName || item.commonName || item.scientificName || item.id,
        value: item.id,
      }));
    }
    if (controller.addDraft.targetType === 'packing') {
      return controller.packingOptions.map(item => ({
        label: item.name,
        value: item.id,
      }));
    }
    return controller.productOptions.map(item => ({
      label: `${item.name}${item.sku ? ` (${item.sku})` : ''}`,
      value: item.id,
    }));
  }, [
    controller.addDraft.targetType,
    controller.packingOptions,
    controller.productOptions,
    controller.rawOptions,
    controller.speciesOptions,
  ]);

  if (controller.loading && !controller.header) {
    return (
      <KolamEmptyState message="Memuat dokumen…" title="Memuat" />
    );
  }

  if (!controller.header) {
    return (
      <View style={styles.root}>
        <KolamEmptyState
          message={controller.error || 'Dokumen tidak ditemukan.'}
          title="Tidak ada dokumen"
        />
        <KolamButton
          label="Kembali ke daftar"
          onPress={() => onRouteChange?.(KOLAM_STOCK_OPNAME_ROOT)}
        />
      </View>
    );
  }

  const header = controller.header;
  const lineCountsLabel = formatStockOpnameLineCounts(header.lineCounts);

  return (
    <>
    <KolamDetailScrollSurface contentContainerStyle={styles.root}>
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

      <KolamCardFrame style={styles.card} variant="compact">
        <View style={kolamTableToolbarStyles.shell}>
          <View style={kolamTableToolbarStyles.row}>
            <View style={kolamTableToolbarStyles.filters}>
              <Text style={styles.toolbarDocumentNumber}>
                {header.documentNumber || header.id}
              </Text>
              <KolamStatusBadge
                intent={statusIntent(header.status)}
                label={header.statusLabel}
              />
            </View>
            <View style={kolamTableToolbarStyles.actions}>
              <KolamDaftarButton
                onPress={() => onRouteChange?.(KOLAM_STOCK_OPNAME_ROOT)}
              />
              {controller.isPosted ? (
                <KolamStockTransactionButton
                  label="Lihat ledger"
                  onPress={() =>
                    onRouteChange?.(
                      `/stock-transaction?stockOpnameId=${encodeURIComponent(
                        header.id,
                      )}`,
                    )
                  }
                />
              ) : null}
              {controller.isPosted &&
              marketplaceSyncTargets.productIds.length > 0 ? (
                <KolamButton
                  label={`Samakan stok produk (${marketplaceSyncTargets.productIds.length})`}
                  onPress={() => setSyncRetry('products')}
                />
              ) : null}
              {controller.isPosted &&
              marketplaceSyncTargets.speciesIds.length > 0 ? (
                <KolamButton
                  label={`Samakan stok livestock (${marketplaceSyncTargets.speciesIds.length})`}
                  onPress={() => setSyncRetry('species')}
                />
              ) : null}
              {controller.isDraft &&
              controller.lines.length > 0 &&
              canSubmit ? (
                <KolamButton
                  disabled={
                    controller.acting ||
                    !controller.draftOwnerId ||
                    !controller.draftConductedId
                  }
                  intent="primary"
                  label="Kirim untuk review"
                  onPress={() => {
                    void controller.onSubmitForReview();
                  }}
                />
              ) : null}
              {controller.isDraft &&
              canUpdate &&
              controller.parentOnlyLineCount > 0 ? (
                <KolamButton
                  disabled={controller.acting}
                  label="Perluas varian"
                  onPress={() => {
                    void controller.onExpandVariants();
                  }}
                />
              ) : null}
              {controller.isReady && canPost ? (
                <KolamButton
                  disabled={controller.acting}
                  intent="primary"
                  label="Posting ke stok"
                  onPress={() => {
                    void controller.onPost().then(result => {
                      if (result?.continuationId) {
                        onRouteChange?.(
                          `${KOLAM_STOCK_OPNAME_ROOT}/${result.continuationId}`,
                        );
                      }
                    });
                  }}
                />
              ) : null}
              {canUpdate &&
              ['draft', 'in_review', 'ready_to_post'].includes(header.status) ? (
                <KolamCancelButton
                  disabled={controller.acting}
                  label="Batalkan"
                  onPress={() => setCancelOpen(true)}
                />
              ) : null}
              {controller.isCancelled && canDelete ? (
                <KolamDeleteButton
                  disabled={controller.acting}
                  intent="danger"
                  label="Hapus"
                  onPress={() => setDeleteOpen(true)}
                />
              ) : null}
              <KolamExportXlsButton
                disabled={controller.acting}
                label="Ekspor XLSX"
                onPress={() => {
                  void controller.onExportXlsx();
                }}
              />
              <KolamPdfDownloadButton
                disabled={controller.acting}
                label="Ekspor PDF"
                onPress={() => {
                  void controller.onExportPdf();
                }}
              />
            </View>
          </View>
        </View>

        <View style={styles.headerText}>
          {lineCountsLabel ? (
            <Text style={styles.muted}>{lineCountsLabel}</Text>
          ) : null}
          {header.parentOpname ? (
            <Pressable
              onPress={() =>
                onRouteChange?.(
                  `${KOLAM_STOCK_OPNAME_ROOT}/${header.parentOpname!.id}`,
                )
              }
            >
              <Text style={styles.linkText}>
                Lanjutan dari {header.parentOpname.documentNumber}
              </Text>
            </Pressable>
          ) : null}
          {header.continuationOpname ? (
            <Pressable
              onPress={() =>
                onRouteChange?.(
                  `${KOLAM_STOCK_OPNAME_ROOT}/${header.continuationOpname!.id}`,
                )
              }
            >
              <Text style={styles.linkText}>
                Draf lanjutan {header.continuationOpname.documentNumber}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </KolamCardFrame>

      <KolamCardFrame style={styles.card} variant="compact">
        <Text style={styles.sectionTitle}>Akuntabilitas</Text>
        <Text style={styles.muted}>
          PIC dan pelaksana wajib sebelum kirim review.
        </Text>
        {controller.isDraft && canUpdate ? (
          <>
            <KolamDropdownSelect
              label="PIC"
              onChange={controller.setDraftOwnerId}
              options={staffOptions}
              searchable
              value={controller.draftOwnerId}
            />
            <KolamDropdownSelect
              label="Pelaksana"
              onChange={controller.setDraftConductedId}
              options={staffOptions}
              searchable
              value={controller.draftConductedId}
            />
            <KolamButton
              disabled={controller.acting}
              label="Simpan PIC / pelaksana"
              onPress={() => {
                void controller.onSaveAccountability();
              }}
            />
          </>
        ) : (
          <>
            <Text style={styles.meta}>
              PIC: {stockOpnameUserDisplayName(header.owner) || '—'}
            </Text>
            <Text style={styles.meta}>
              Pelaksana:{' '}
              {stockOpnameUserDisplayName(header.conductedBy) || '—'}
            </Text>
          </>
        )}
        <Text style={styles.fieldLabel}>Catatan</Text>
        <KolamFormTextField
          editable={controller.isDraft && canUpdate}
          multiline
          numberOfLines={3}
          onChangeText={setNoteDraft}
          placeholder="Catatan dokumen"
          style={styles.multiline}
          value={noteDraft}
        />
        {controller.isDraft && canUpdate ? (
          <KolamButton
            disabled={controller.acting}
            label="Simpan catatan"
            onPress={() => {
              void controller.onUpdateNote(noteDraft);
            }}
          />
        ) : null}
      </KolamCardFrame>

      {controller.showAddLineForm && canUpdate ? (
        <AddLineForm
          controller={controller}
          targetOptions={targetOptions}
        />
      ) : null}

      <KolamCardFrame style={styles.card} variant="compact">
        <Text style={styles.sectionTitle}>
          Baris ({controller.lines.length})
        </Text>
        {controller.lines.length === 0 ? (
          <KolamEmptyState
            compact
            message="Belum ada baris. Tambahkan barang di atas."
            title="Kosong"
          />
        ) : (
          controller.lines.map(line => (
            <LineCard
              canApprove={
                canReview &&
                controller.isReview &&
                line.lineStatus === 'pending_review'
              }
              canEdit={
                canUpdate &&
                (controller.canEditDraftLine(line) ||
                  controller.canEditRevisionLine(line))
              }
              canRemove={
                canUpdate && controller.canRemoveLine(line)
              }
              canResubmit={
                canUpdate &&
                controller.isReview &&
                line.lineStatus === 'revision'
              }
              canReview={
                canReview &&
                controller.isReview &&
                line.lineStatus === 'pending_review'
              }
              key={line.id}
              line={line}
              onApprove={() => {
                void controller.onApproveLine(line.id);
              }}
              onEdit={() => {
                setEditLine(line);
                setEditQty(String(line.physicalQty));
                setEditMinus(line.minusReason || '');
                setEditNote(line.lineNote || '');
              }}
              onReject={() =>
                setReviewTarget({ lineId: line.id, decision: 'rejected' })
              }
              onRemove={() => {
                void controller.onDeleteLine(line.id);
              }}
              onRequestRevision={() =>
                setReviewTarget({ lineId: line.id, decision: 'revision' })
              }
              onResubmit={() => {
                void controller.onResubmitLine(line.id);
              }}
              onSaveMinusReason={reason => {
                void controller.onUpdateLine({
                  lineId: line.id,
                  minusReason: reason,
                  keepPhotos: line.photos,
                });
              }}
            />
          ))
        )}
      </KolamCardFrame>

      <KolamConfirmDialog
        cancelLabel="Tidak"
        confirmLabel="Batalkan dokumen"
        destructive
        message="Dokumen akan dibatalkan. Aksi ini tidak bisa dibatalkan."
        onCancel={() => setCancelOpen(false)}
        onConfirm={() => {
          void controller.onCancel().then(ok => {
            if (ok) {
              setCancelOpen(false);
            }
          });
        }}
        title="Batalkan dokumen?"
        visible={cancelOpen}
      />

      <KolamConfirmDialog
        cancelLabel="Tidak"
        confirmLabel="Hapus"
        destructive
        message="Dokumen yang dibatalkan akan dihapus permanen."
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => {
          void controller.onDeleteDocument().then(ok => {
            if (ok) {
              setDeleteOpen(false);
              onRouteChange?.(KOLAM_STOCK_OPNAME_ROOT);
            }
          });
        }}
        title="Hapus dokumen?"
        visible={deleteOpen}
      />

      <Modal
        animationType="fade"
        onRequestClose={() => setReviewTarget(null)}
        transparent
        visible={Boolean(reviewTarget)}
      >
        <View style={styles.modalOverlay}>
          <KolamModalBackdrop onPress={() => setReviewTarget(null)} />
          <View style={styles.modalCard}>
            <Text style={styles.sectionTitle}>
              {reviewTarget?.decision === 'rejected'
                ? 'Tolak baris'
                : 'Minta revisi'}
            </Text>
            <KolamFormTextField
              multiline
              numberOfLines={3}
              onChangeText={setReviewReason}
              placeholder="Alasan wajib"
              style={styles.multiline}
              value={reviewReason}
            />
            <View style={styles.modalActions}>
              <KolamCancelButton
                muted
                onPress={() => {
                  setReviewTarget(null);
                  setReviewReason('');
                }}
              />
              <KolamButton
                disabled={controller.acting || !reviewReason.trim()}
                intent="danger"
                label="Kirim"
                onPress={() => {
                  if (!reviewTarget) {
                    return;
                  }
                  void controller
                    .onReviewLine({
                      lineId: reviewTarget.lineId,
                      decision: reviewTarget.decision,
                      reason: reviewReason,
                    })
                    .then(ok => {
                      if (ok) {
                        setReviewTarget(null);
                        setReviewReason('');
                      }
                    });
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => setEditLine(null)}
        transparent
        visible={Boolean(editLine)}
      >
        <View style={styles.modalOverlay}>
          <KolamModalBackdrop onPress={() => setEditLine(null)} />
          <View style={styles.modalCard}>
            <Text style={styles.sectionTitle}>Edit baris</Text>
            <Text style={styles.fieldLabel}>Qty fisik</Text>
            <KolamFormTextField
              mode="numeric"
              onChangeText={setEditQty}
              value={editQty}
            />
            {editLine &&
            needsOpnameMinusReason(
              editLine.targetType,
              (() => {
                const baseline = stockOpnameLineSystemBaseline(editLine);
                const qty = Number(editQty);
                if (baseline == null || !Number.isFinite(qty)) {
                  return null;
                }
                return qty - baseline;
              })(),
            ) ? (
              <KolamDropdownSelect
                label="Alasan selisih minus"
                onChange={value =>
                  setEditMinus(value as KolamOpnameMinusReason | '')
                }
                options={[
                  { label: '— Pilih —', value: '' },
                  ...KOLAM_OPNAME_MINUS_REASON_OPTIONS.map(option => ({
                    label: option.label,
                    value: option.value,
                  })),
                ]}
                value={editMinus}
              />
            ) : null}
            <KolamFormTextField
              multiline
              numberOfLines={2}
              onChangeText={setEditNote}
              placeholder="Catatan baris"
              style={styles.multiline}
              value={editNote}
            />
            <View style={styles.modalActions}>
              <KolamCancelButton
                muted
                onPress={() => setEditLine(null)}
              />
              <KolamSaveButton
                disabled={
                  controller.acting ||
                  (editLine != null &&
                    needsOpnameMinusReason(
                      editLine.targetType,
                      (() => {
                        const baseline =
                          stockOpnameLineSystemBaseline(editLine);
                        const qty = Number(editQty);
                        if (baseline == null || !Number.isFinite(qty)) {
                          return null;
                        }
                        return qty - baseline;
                      })(),
                    ) &&
                    !editMinus)
                }
                onPress={() => {
                  if (!editLine) {
                    return;
                  }
                  const needsMinus = needsOpnameMinusReason(
                    editLine.targetType,
                    (() => {
                      const baseline = stockOpnameLineSystemBaseline(editLine);
                      const qty = Number(editQty);
                      if (baseline == null || !Number.isFinite(qty)) {
                        return null;
                      }
                      return qty - baseline;
                    })(),
                  );
                  void controller
                    .onUpdateLine({
                      lineId: editLine.id,
                      physicalQty: Number(editQty) || 0,
                      minusReason: needsMinus
                        ? editMinus || null
                        : null,
                      lineNote: editNote,
                      keepPhotos: editLine.photos,
                    })
                    .then(ok => {
                      if (ok) {
                        setEditLine(null);
                      }
                    });
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </KolamDetailScrollSurface>
    <KolamMarketplacePriceSyncDialog
      itemCount={marketplaceSyncTargets.productIds.length}
      onOpenChange={open => {
        if (!open) {
          setSyncRetry(null);
        }
      }}
      productIds={marketplaceSyncTargets.productIds}
      source="products"
      syncKind="stock"
      title="Samakan stok produk (retry setelah opname)"
      visible={syncRetry === 'products'}
    />
    <KolamMarketplacePriceSyncDialog
      itemCount={marketplaceSyncTargets.speciesIds.length}
      onOpenChange={open => {
        if (!open) {
          setSyncRetry(null);
        }
      }}
      source="species"
      speciesIds={marketplaceSyncTargets.speciesIds}
      syncKind="stock"
      title="Samakan stok livestock (retry setelah opname)"
      visible={syncRetry === 'species'}
    />
    </>
  );
}

function stockOpnameStaffAssigneeLabel(user: KolamStockOpnameStaffAssignee) {
  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  return fullName || user.name || user.username || user.email || user.id;
}

function AddLineForm({
  controller,
  targetOptions,
}: {
  controller: KolamStockOpnameDetailController;
  targetOptions: Array<{ label: string; value: string }>;
}) {
  const typeOptions = (
    Object.keys(KOLAM_STOCK_OPNAME_LINE_TARGET_LABELS) as KolamStockOpnameLineTargetType[]
  ).map(key => ({
    label: KOLAM_STOCK_OPNAME_LINE_TARGET_LABELS[key],
    value: key,
  }));

  return (
    <KolamCardFrame style={styles.card} variant="compact">
      <Text style={styles.sectionTitle}>Tambah barang</Text>
      <KolamDropdownSelect
        label="Tipe"
        onChange={value =>
          controller.setAddDraft({
            targetType: value as KolamStockOpnameLineTargetType,
          })
        }
        options={typeOptions}
        value={controller.addDraft.targetType}
      />
      <KolamDropdownSelect
        label="Item"
        onChange={value => {
          const stock =
            controller.addDraft.targetType === 'packing'
              ? controller.packingOptions.find(item => item.id === value)
                  ?.stock
              : controller.addDraft.targetType === 'species'
                ? controller.speciesOptions.find(item => item.id === value)
                    ?.stock
                : controller.addDraft.targetType === 'raw'
                  ? controller.rawOptions.find(item => item.id === value)?.stock
                  : controller.productOptions.find(item => item.id === value)
                      ?.stock;
          controller.setAddDraft({
            targetId: value,
            physicalQty: String(stock ?? 0),
          });
        }}
        options={[{ label: '— Pilih —', value: '' }, ...targetOptions]}
        searchable
        value={controller.addDraft.targetId}
      />
      {controller.selectedVariants.length > 0 ? (
        <KolamDropdownSelect
          label="Varian"
          onChange={value => {
            const stock =
              controller.selectedVariants.find(item => item.id === value)
                ?.stock ?? 0;
            controller.setAddDraft({
              variantId: value,
              physicalQty: String(stock),
            });
          }}
          options={[
            { label: '— Pilih —', value: '' },
            ...controller.selectedVariants.map(item => ({
              label: item.label,
              value: item.id,
            })),
          ]}
          value={controller.addDraft.variantId}
        />
      ) : null}
      <Text style={styles.meta}>
        Qty sistem:{' '}
        {controller.addLineSystemQty == null
          ? '—'
          : String(controller.addLineSystemQty)}
        {controller.addLineDiff != null
          ? ` · Selisih: ${controller.addLineDiff}`
          : ''}
      </Text>
      <Text style={styles.fieldLabel}>Qty fisik</Text>
      <KolamFormTextField
        mode="numeric"
        onChangeText={value => controller.setAddDraft({ physicalQty: value })}
        value={controller.addDraft.physicalQty}
      />
      {controller.addLineNeedsMinusReason ? (
        <KolamDropdownSelect
          label="Alasan selisih minus"
          onChange={value =>
            controller.setAddDraft({
              minusReason: value as KolamOpnameMinusReason | '',
            })
          }
          options={[
            { label: '— Pilih —', value: '' },
            ...KOLAM_OPNAME_MINUS_REASON_OPTIONS.map(option => ({
              label: option.label,
              value: option.value,
            })),
          ]}
          value={controller.addDraft.minusReason}
        />
      ) : null}
      <KolamFormTextField
        multiline
        numberOfLines={2}
        onChangeText={value => controller.setAddDraft({ lineNote: value })}
        placeholder="Catatan baris (opsional)"
        style={styles.multiline}
        value={controller.addDraft.lineNote}
      />
      <View style={styles.actionWrap}>
        <KolamButton
          label={`Foto (${controller.addDraft.photoUris.length}/5)`}
          onPress={() => {
            void pickNativeImageFile().then(result => {
              if (!result?.uri) {
                return;
              }
              const current = controller.addDraft.photoUris;
              if (current.length >= 5) {
                return;
              }
              controller.setAddDraft({
                photoUris: [...current, result.uri],
              });
            });
          }}
        />
        <KolamButton
          disabled={controller.acting}
          intent="primary"
          label="Tambah baris"
          onPress={() => {
            void controller.onAddLine();
          }}
        />
      </View>
    </KolamCardFrame>
  );
}

function LineCard({
  canApprove,
  canEdit,
  canRemove,
  canResubmit,
  canReview,
  line,
  onApprove,
  onEdit,
  onReject,
  onRemove,
  onRequestRevision,
  onResubmit,
  onSaveMinusReason,
}: {
  canApprove: boolean;
  canEdit: boolean;
  canRemove: boolean;
  canResubmit: boolean;
  canReview: boolean;
  line: KolamStockOpnameLine;
  onApprove: () => void;
  onEdit: () => void;
  onReject: () => void;
  onRemove: () => void;
  onRequestRevision: () => void;
  onResubmit: () => void;
  onSaveMinusReason: (reason: KolamOpnameMinusReason | null) => void;
}) {
  const label = stockOpnameLineTargetLabel(line);
  const systemBaseline = stockOpnameLineSystemBaseline(line);
  const diff = stockOpnameLineDiff(line);
  const needsMinus = stockOpnameLineNeedsMinusReason(line);
  const usingLiveSystem =
    (line.systemQty == null || !Number.isFinite(line.systemQty)) &&
    line.liveSystemQty != null;

  return (
    <View style={styles.lineCard}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.lineTitle}>
            #{line.lineNo} · {line.targetTypeLabel} · {label}
          </Text>
          {line.variantLabel ? (
            <Text style={styles.meta}>Varian: {line.variantLabel}</Text>
          ) : null}
          <Text style={styles.meta}>
            {usingLiveSystem ? 'Sistem (live) ' : 'Sistem '}
            {systemBaseline ?? '—'} → Fisik {line.physicalQty}
            {diff != null ? ` (selisih ${diff})` : ''}
          </Text>
          {needsMinus ? (
            canEdit ? (
              <KolamDropdownSelect
                label="Alasan selisih minus"
                onChange={value =>
                  onSaveMinusReason(
                    value ? (value as KolamOpnameMinusReason) : null,
                  )
                }
                options={[
                  { label: '— Pilih —', value: '' },
                  ...KOLAM_OPNAME_MINUS_REASON_OPTIONS.map(option => ({
                    label: option.label,
                    value: option.value,
                  })),
                ]}
                value={line.minusReason || ''}
              />
            ) : (
              <Text
                style={
                  line.minusReasonLabel ? styles.meta : styles.minusMissing
                }
              >
                Alasan:{' '}
                {line.minusReasonLabel || 'Belum diisi'}
              </Text>
            )
          ) : line.minusReasonLabel ? (
            <Text style={styles.meta}>Alasan: {line.minusReasonLabel}</Text>
          ) : null}
          {line.rejectReason ? (
            <Text style={styles.meta}>Catatan review: {line.rejectReason}</Text>
          ) : null}
        </View>
        <KolamStatusBadge
          intent={lineStatusIntent(line.lineStatus)}
          label={line.lineStatusLabel}
        />
      </View>
      {line.photos.length > 0 ? (
        <ScrollView horizontal style={styles.photoRow}>
          {line.photos.map(photo => {
            const uri = getKolamFileUrl(photo) ?? photo;
            return (
              <Image
                key={photo}
                source={{ uri }}
                style={styles.photoThumb}
              />
            );
          })}
        </ScrollView>
      ) : null}
      <View style={styles.actionWrap}>
        {canEdit ? (
          <KolamEditButton onPress={onEdit} />
        ) : null}
        {canRemove ? (
          <KolamDeleteButton intent="danger" label="Hapus" onPress={onRemove} />
        ) : null}
        {canApprove ? (
          <KolamButton intent="primary" label="Setujui" onPress={onApprove} />
        ) : null}
        {canReview ? (
          <>
            <KolamButton label="Revisi" onPress={onRequestRevision} />
            <KolamButton intent="danger" label="Tolak" onPress={onReject} />
          </>
        ) : null}
        {canResubmit ? (
          <KolamButton
            intent="primary"
            label="Kirim ulang"
            onPress={onResubmit}
          />
        ) : null}
      </View>
    </View>
  );
}

function statusIntent(
  status: string,
): 'success' | 'warning' | 'danger' | 'primary' | 'muted' {
  switch (status) {
    case 'posted':
      return 'success';
    case 'ready_to_post':
    case 'partially_posted':
      return 'primary';
    case 'in_review':
    case 'draft':
      return 'warning';
    case 'rejected':
    case 'cancelled':
      return 'danger';
    default:
      return 'muted';
  }
}

function lineStatusIntent(
  status: string,
): 'success' | 'warning' | 'danger' | 'primary' | 'muted' {
  switch (status) {
    case 'approved':
      return 'success';
    case 'pending_review':
      return 'primary';
    case 'revision':
    case 'draft':
      return 'warning';
    case 'rejected':
      return 'danger';
    default:
      return 'muted';
  }
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
    paddingBottom: 28,
  },
  banner: {
    alignSelf: 'flex-start',
  },
  card: {
    gap: 10,
    padding: 12,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  title: {
    color: V.colors.fg,
    fontSize: 16,
    fontWeight: '900',
  },
  sectionTitle: {
    color: V.colors.fg,
    fontSize: 14,
    fontWeight: '800',
  },
  muted: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  meta: {
    color: V.colors.mutedFg,
    fontSize: 12,
    fontWeight: '600',
  },
  minusMissing: {
    color: V.colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  linkText: {
    color: V.colors.primary,
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  actionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  toolbarDocumentNumber: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '900',
  },
  fieldLabel: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '800',
  },
  multiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  lineCard: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
    marginBottom: 8,
    padding: 10,
  },
  lineTitle: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '800',
  },
  photoRow: {
    maxHeight: 72,
  },
  photoThumb: {
    borderRadius: 6,
    height: 64,
    marginRight: 6,
    width: 64,
  },
  modalOverlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: V.colors.bg,
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    maxWidth: '92%',
    padding: 16,
    width: 440,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
});
