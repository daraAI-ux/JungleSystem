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
import Svg, {Path} from 'react-native-svg';
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
  type KolamStockOpnameUserRef,
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
import {KolamStockSyncButton} from './kolam-stock-sync-button';
import { KolamCardFrame } from './kolam-card-frame';
import { KolamConfirmDialog } from './kolam-confirm-dialog';
import { KolamDetailScrollSurface } from './kolam-detail-scroll-surface';
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
import { KolamMarketplacePriceSyncDialog } from './kolam-marketplace-price-sync-dialog';
import { KolamModalBackdrop } from './kolam-modal-backdrop';
import { KolamPdfDownloadButton } from './kolam-pdf-download-button';
import { KolamRemoteImage } from './kolam-remote-image';
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
  const [photoLine, setPhotoLine] = useState<KolamStockOpnameLine | null>(null);
  const [photoDraftUris, setPhotoDraftUris] = useState<string[]>([]);
  const [photoKeepUris, setPhotoKeepUris] = useState<string[]>([]);
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

  const draftOwnerProfile = useMemo(
    () =>
      controller.staffAssignees.find(user => user.id === controller.draftOwnerId) ||
      null,
    [controller.draftOwnerId, controller.staffAssignees],
  );
  const draftConductedProfile = useMemo(
    () =>
      controller.staffAssignees.find(
        user => user.id === controller.draftConductedId,
      ) || null,
    [controller.draftConductedId, controller.staffAssignees],
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

  const openLinePhotos = React.useCallback((line: KolamStockOpnameLine) => {
    setPhotoLine(line);
    setPhotoDraftUris([]);
    setPhotoKeepUris(line.photos);
  }, []);

  const lineColumns = useMemo<Array<KolamListTableColumn<KolamStockOpnameLine>>>(
    () => [
      {
        flex: 2.2,
        id: 'item',
        label: 'Barang',
        render: line => (
          <View style={styles.tableItemCell}>
            <Text style={styles.lineTitle}>
              #{line.lineNo} · {line.targetTypeLabel}
            </Text>
            <Text numberOfLines={2} style={styles.tableItemName}>
              {stockOpnameLineTargetLabel(line)}
            </Text>
            {line.variantLabel ? (
              <Text numberOfLines={1} style={styles.meta}>
                Varian: {line.variantLabel}
              </Text>
            ) : null}
            {line.rejectReason ? (
              <Text numberOfLines={2} style={styles.meta}>
                Catatan review: {line.rejectReason}
              </Text>
            ) : null}
          </View>
        ),
      },
      {
        align: 'right',
        flex: 0.8,
        id: 'systemQty',
        label: 'Sistem',
        render: line => {
          const usingLiveSystem =
            (line.systemQty == null || !Number.isFinite(line.systemQty)) &&
            line.liveSystemQty != null;
          const systemBaseline = stockOpnameLineSystemBaseline(line);
          return (
            <Text style={styles.tableNumber}>
              {systemBaseline ?? '—'}
              {usingLiveSystem ? ' live' : ''}
            </Text>
          );
        },
      },
      {
        align: 'right',
        flex: 0.8,
        id: 'physicalQty',
        label: 'Fisik',
        render: line => (
          <Text style={styles.tableNumber}>{line.physicalQty}</Text>
        ),
      },
      {
        align: 'right',
        flex: 0.8,
        id: 'diff',
        label: 'Selisih',
        render: line => {
          const diff = stockOpnameLineDiff(line);
          return (
            <Text
              style={[
                styles.tableNumber,
                diff != null && diff < 0 ? styles.minusMissing : null,
              ]}
            >
              {diff ?? '—'}
            </Text>
          );
        },
      },
      {
        flex: 1.4,
        id: 'reason',
        label: 'Alasan',
        render: line => {
          const canEdit =
            canUpdate &&
            (controller.canEditDraftLine(line) ||
              controller.canEditRevisionLine(line));
          const needsMinus = stockOpnameLineNeedsMinusReason(line);
          if (needsMinus && canEdit) {
            return (
              <KolamDropdownSelect
                label="Alasan"
                onChange={value =>
                  void controller.onUpdateLine({
                    lineId: line.id,
                    keepPhotos: line.photos,
                    minusReason: value
                      ? (value as KolamOpnameMinusReason)
                      : null,
                  })
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
            );
          }
          return (
            <Text
              numberOfLines={2}
              style={line.minusReasonLabel ? styles.meta : styles.minusMissing}
            >
              {needsMinus ? line.minusReasonLabel || 'Belum diisi' : line.minusReasonLabel || '—'}
            </Text>
          );
        },
      },
      {
        align: 'center',
        flex: 0.9,
        id: 'photos',
        label: 'Foto',
        render: line => {
          const canEdit =
            canUpdate &&
            (controller.canEditDraftLine(line) ||
              controller.canEditRevisionLine(line));
          return canEdit ? (
            <KolamButton
              label={`Foto (${line.photos.length})`}
              onPress={() => openLinePhotos(line)}
            />
          ) : (
            <Text style={styles.meta}>{line.photos.length}</Text>
          );
        },
      },
      {
        align: 'center',
        flex: 1,
        id: 'status',
        label: 'Status',
        render: line => (
          <KolamStatusBadge
            intent={lineStatusIntent(line.lineStatus)}
            label={line.lineStatusLabel}
          />
        ),
      },
    ],
    [canUpdate, controller, openLinePhotos],
  );

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
  const closePhotoModal = () => {
    setPhotoLine(null);
    setPhotoDraftUris([]);
    setPhotoKeepUris([]);
  };

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
              {controller.statusMessage ? (
                <KolamStatusBadge
                  intent="success"
                  label={controller.statusMessage}
                  numberOfLines={2}
                />
              ) : null}
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
                <KolamStockSyncButton
                  label={`Samakan stok produk (${marketplaceSyncTargets.productIds.length})`}
                  onPress={() => setSyncRetry('products')}
                />
              ) : null}
              {controller.isPosted &&
              marketplaceSyncTargets.speciesIds.length > 0 ? (
                <KolamStockSyncButton
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
                  icon={<PostToStockArrowIcon />}
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
                  style={styles.postToStockButton}
                  textStyle={styles.postToStockButtonText}
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
              {canUpdate &&
              ['draft', 'in_review', 'ready_to_post'].includes(header.status) ? (
                <KolamCancelButton
                  disabled={controller.acting}
                  label="Batalkan"
                  onPress={() => setCancelOpen(true)}
                />
              ) : null}
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
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Akuntabilitas</Text>
          {controller.isDraft && canUpdate ? (
            <KolamSaveButton
              disabled={controller.acting}
              label="Simpan PIC / pelaksana"
              onPress={() => {
                void controller.onSaveAccountability();
              }}
            />
          ) : null}
        </View>
        <Text style={styles.muted}>
          PIC dan pelaksana wajib sebelum kirim review.
        </Text>
        {controller.isDraft && canUpdate ? (
          <>
            <View style={styles.accountabilityRow}>
              <View
                style={[styles.accountabilityBox, styles.accountabilityProfileBox]}
              >
                <AccountabilityProfileBadge
                  name={
                    draftOwnerProfile
                      ? stockOpnameStaffAssigneeLabel(draftOwnerProfile)
                      : ''
                  }
                />
                <KolamDropdownSelect
                  label="PIC"
                  onChange={controller.setDraftOwnerId}
                  options={staffOptions}
                  searchable
                  value={controller.draftOwnerId}
                />
              </View>
              <View
                style={[styles.accountabilityBox, styles.accountabilityProfileBox]}
              >
                <AccountabilityProfileBadge
                  name={
                    draftConductedProfile
                      ? stockOpnameStaffAssigneeLabel(draftConductedProfile)
                      : ''
                  }
                />
                <KolamDropdownSelect
                  label="Pelaksana"
                  onChange={controller.setDraftConductedId}
                  options={staffOptions}
                  searchable
                  value={controller.draftConductedId}
                />
              </View>
            </View>
          </>
        ) : (
          <View style={styles.accountabilityRow}>
            <View
              style={[styles.accountabilityBox, styles.accountabilityProfileBox]}
            >
              <AccountabilityProfileBadge
                name={stockOpnameUserDisplayName(header.owner)}
                photo={header.owner?.photo}
              />
              <Text style={styles.fieldLabel}>PIC</Text>
              <Text style={styles.meta}>
                {stockOpnameUserDisplayName(header.owner) || '—'}
              </Text>
            </View>
            <View
              style={[styles.accountabilityBox, styles.accountabilityProfileBox]}
            >
              <AccountabilityProfileBadge
                name={stockOpnameUserDisplayName(header.conductedBy)}
                photo={header.conductedBy?.photo}
              />
              <Text style={styles.fieldLabel}>Pelaksana</Text>
              <Text style={styles.meta}>
                {stockOpnameUserDisplayName(header.conductedBy) || '—'}
              </Text>
            </View>
          </View>
        )}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.fieldLabel}>Catatan</Text>
          {controller.isDraft && canUpdate ? (
            <KolamSaveButton
              disabled={controller.acting}
              label="Simpan catatan"
              onPress={() => {
                void controller.onUpdateNote(noteDraft);
              }}
            />
          ) : null}
        </View>
        <KolamFormTextField
          editable={controller.isDraft && canUpdate}
          multiline
          numberOfLines={3}
          onChangeText={setNoteDraft}
          placeholder="Catatan dokumen"
          style={[styles.multiline, styles.noteField]}
          value={noteDraft}
        />
      </KolamCardFrame>

      {controller.showAddLineForm && canUpdate ? (
        <AddLineForm
          controller={controller}
          targetOptions={targetOptions}
        />
      ) : null}

      <View style={styles.linesSection}>
        <Text style={styles.sectionTitle}>
          Baris ({controller.lines.length})
        </Text>
        <KolamListTableComposition
          actionsColumn
          columns={lineColumns}
          emptyTitle={
            controller.loading
              ? 'Memuat baris...'
              : 'Belum ada baris'
          }
          footer={
            <View style={styles.tableFooterRow}>
              <Text style={styles.meta}>
                Total {controller.lines.length} baris
              </Text>
            </View>
          }
          getRowKey={line => line.id}
          loading={controller.loading}
          renderActions={line => {
            return (
              <StockOpnameLineActionsMenu
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
                canRemove={canUpdate && controller.canRemoveLine(line)}
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
              />
            );
          }}
          rows={controller.lines}
        />
      </View>

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
              style={[styles.multiline, styles.noteField]}
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

      <Modal
        animationType="fade"
        onRequestClose={closePhotoModal}
        transparent
        visible={Boolean(photoLine)}
      >
        <View style={styles.modalOverlay}>
          <KolamModalBackdrop onPress={closePhotoModal} />
          <View style={styles.modalCard}>
            <Text style={styles.sectionTitle}>Foto line</Text>
            <Text style={styles.meta}>
              {photoKeepUris.length + photoDraftUris.length} / 5 foto
            </Text>
            <View style={styles.uploadActions}>
              <KolamButton
                disabled={photoKeepUris.length + photoDraftUris.length >= 5}
                label="Pilih foto"
                onPress={() => {
                  if (photoKeepUris.length + photoDraftUris.length >= 5) {
                    return;
                  }
                  void pickNativeImageFile().then(result => {
                    const uri = result?.uri;
                    if (!uri) {
                      return;
                    }
                    setPhotoDraftUris(current => [...current, uri]);
                  });
                }}
              />
            </View>
            {photoLine ? (
              <ScrollView style={styles.photoModalScroll}>
                <View style={styles.uploadPreviewGrid}>
                  {photoLine.photos.map((photo, index) => {
                    const uri = getKolamFileUrl(photo) ?? photo;
                    const kept = photoKeepUris.includes(photo);
                    return (
                      <View
                        key={photo}
                        style={[
                          styles.uploadPreviewItem,
                          !kept && styles.photoMarkedRemove,
                        ]}
                      >
                        <KolamRemoteImage
                          accessibilityLabel={`Foto ${index + 1}`}
                          sourceUri={uri}
                          style={styles.uploadPreviewImage}
                        />
                        <KolamDeleteButton
                          label={kept ? 'Hapus' : 'Batal'}
                          onPress={() =>
                            setPhotoKeepUris(current =>
                              kept
                                ? current.filter(item => item !== photo)
                                : [...current, photo],
                            )
                          }
                          style={styles.uploadPreviewDelete}
                        />
                      </View>
                    );
                  })}
                  {photoDraftUris.map((uri, index) => (
                    <View
                      key={`${uri}-${index}`}
                      style={styles.uploadPreviewItem}
                    >
                      <Image
                        source={{ uri }}
                        style={styles.uploadPreviewImage}
                      />
                      <KolamDeleteButton
                        label="Hapus"
                        onPress={() =>
                          setPhotoDraftUris(current =>
                            current.filter((_, itemIndex) => itemIndex !== index),
                          )
                        }
                        style={styles.uploadPreviewDelete}
                      />
                    </View>
                  ))}
                </View>
              </ScrollView>
            ) : null}
            <View style={styles.modalActions}>
              <KolamCancelButton muted onPress={closePhotoModal} />
              <KolamSaveButton
                disabled={controller.acting || !photoLine}
                onPress={() => {
                  if (!photoLine) {
                    return;
                  }
                  void controller
                    .onUpdateLine({
                      lineId: photoLine.id,
                      keepPhotos: photoKeepUris,
                      photoUris: photoDraftUris,
                    })
                    .then(ok => {
                      if (ok) {
                        closePhotoModal();
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

function AccountabilityProfileBadge({
  name,
  photo,
}: {
  name: string;
  photo?: KolamStockOpnameUserRef['photo'];
}) {
  const displayName = name.trim();
  if (!displayName) {
    return null;
  }
  const initials = getAccountabilityInitials(displayName);
  const photoUri = photo ? getKolamFileUrl(photo) : '';

  return (
    <View style={styles.accountabilityProfile}>
      {photoUri ? (
        <Image
          accessibilityLabel={displayName}
          source={{ uri: photoUri }}
          style={styles.accountabilityProfileImage}
        />
      ) : (
        <Text style={styles.accountabilityProfileInitials}>{initials}</Text>
      )}
    </View>
  );
}

function getAccountabilityInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('');
}

function PostToStockArrowIcon() {
  return (
    <Svg height="100%" viewBox="0 0 20 20" width="100%">
      <Path
        d="M10 16 V5 M5.5 9.5 10 5 14.5 9.5"
        fill="none"
        stroke={V.colors.primaryFg}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </Svg>
  );
}

function StockOpnameLineActionsMenu({
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
}) {
  const [actionMenuOpen, setActionMenuOpen] = React.useState(false);
  const actions = [
    ...(canEdit ? [{ label: 'Rubah', onPress: onEdit }] : []),
    ...(canApprove ? [{ label: 'Setujui', onPress: onApprove }] : []),
    ...(canReview
      ? [
          { label: 'Revisi', onPress: onRequestRevision },
          { label: 'Tolak', onPress: onReject, tone: 'danger' as const },
        ]
      : []),
    ...(canResubmit ? [{ label: 'Kirim ulang', onPress: onResubmit }] : []),
    ...(canRemove
      ? [{ label: 'Hapus', onPress: onRemove, tone: 'danger' as const }]
      : []),
  ];

  return (
    <View style={actionMenuOpen ? styles.activeActionRow : null}>
      <KolamOverflowMenuButton
        accessibilityLabel={`Aksi baris ${line.lineNo}`}
        actions={
          actions.length
            ? actions
            : [{ disabled: true, label: 'Tidak ada aksi', onPress: () => {} }]
        }
        floating
        onOpenChange={setActionMenuOpen}
      />
    </View>
  );
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
  const photoUris = controller.addDraft.photoUris;

  const handlePickPhoto = () => {
    if (photoUris.length >= 5) {
      return;
    }
    void pickNativeImageFile().then(result => {
      const uri = result?.uri;
      if (!uri) {
        return;
      }
      controller.setAddDraft({
        photoUris: [...photoUris, uri],
      });
    });
  };

  const handleRemovePhoto = (index: number) => {
    controller.setAddDraft({
      photoUris: photoUris.filter((_, itemIndex) => itemIndex !== index),
    });
  };

  return (
    <KolamCardFrame style={styles.card} variant="compact">
      <Text style={styles.sectionTitle}>Tambah barang</Text>
      <View style={styles.accountabilityRow}>
        <View style={styles.accountabilityBox}>
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
        </View>
        <View style={styles.accountabilityBox}>
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
        </View>
      </View>
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
      <View style={styles.accountabilityRow}>
        <View style={styles.accountabilityBox}>
          <Text style={styles.fieldLabel}>Qty sistem</Text>
          <Text style={styles.meta}>
            {controller.addLineSystemQty == null
              ? '—'
              : String(controller.addLineSystemQty)}
            {controller.addLineDiff != null
              ? ` · Selisih: ${controller.addLineDiff}`
              : ''}
          </Text>
        </View>
        <View style={styles.accountabilityBox}>
          <Text style={styles.fieldLabel}>Qty fisik</Text>
          <KolamFormTextField
            mode="numeric"
            onChangeText={value =>
              controller.setAddDraft({ physicalQty: value })
            }
            value={controller.addDraft.physicalQty}
          />
        </View>
      </View>
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
        style={[styles.multiline, styles.noteField]}
        value={controller.addDraft.lineNote}
      />
      <View style={styles.uploadCard}>
        <View style={styles.uploadHeader}>
          <View>
            <Text style={styles.fieldLabel}>Foto bukti</Text>
            <Text style={styles.meta}>{photoUris.length} / 5 dipilih</Text>
          </View>
          <View style={styles.uploadActions}>
            {photoUris.length > 0 ? (
              <KolamDeleteButton
                label="Hapus semua"
                onPress={() => controller.setAddDraft({ photoUris: [] })}
              />
            ) : null}
            <KolamButton
              disabled={photoUris.length >= 5}
              label="Pilih foto"
              onPress={handlePickPhoto}
            />
          </View>
        </View>
        {photoUris.length > 0 ? (
          <View style={styles.uploadPreviewGrid}>
            {photoUris.map((uri, index) => (
              <View key={`${uri}-${index}`} style={styles.uploadPreviewItem}>
                <Image source={{ uri }} style={styles.uploadPreviewImage} />
                <KolamDeleteButton
                  label="Hapus"
                  onPress={() => handleRemovePhoto(index)}
                  style={styles.uploadPreviewDelete}
                />
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <View style={styles.actionWrap}>
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
  onManagePhotos,
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
  onManagePhotos: () => void;
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
          <KolamButton
            label={`Foto (${line.photos.length})`}
            onPress={onManagePhotos}
          />
        ) : null}
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
      return 'warning';
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
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
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
  postToStockButton: {
    backgroundColor: '#374151',
    borderColor: '#374151',
  },
  postToStockButtonText: {
    color: V.colors.primaryFg,
  },
  accountabilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  accountabilityBox: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 8,
    minWidth: 240,
    padding: 10,
  },
  accountabilityProfileBox: {
    overflow: 'hidden',
    paddingRight: 58,
    position: 'relative',
  },
  accountabilityProfile: {
    alignItems: 'center',
    backgroundColor: V.colors.muted,
    borderColor: V.colors.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 10,
    top: 10,
    width: 36,
  },
  accountabilityProfileImage: {
    height: 36,
    width: 36,
  },
  accountabilityProfileInitials: {
    color: V.colors.fg,
    fontSize: 12,
    fontWeight: '900',
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
  noteField: {
    backgroundColor: V.colors.warningSoft,
    borderColor: V.colors.warning,
  },
  linesSection: {
    gap: 10,
  },
  tableItemCell: {
    gap: 3,
  },
  tableItemName: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '700',
  },
  tableNumber: {
    color: V.colors.fg,
    fontSize: 13,
    fontWeight: '800',
  },
  tableFooterRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activeActionRow: {
    elevation: 30,
    overflow: 'visible',
    zIndex: 1000,
  },
  uploadCard: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 10,
  },
  uploadHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  uploadActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  uploadPreviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  uploadPreviewItem: {
    borderColor: V.colors.border,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    position: 'relative',
  },
  uploadPreviewImage: {
    height: 92,
    width: 128,
  },
  uploadPreviewDelete: {
    position: 'absolute',
    right: 6,
    top: 6,
  },
  photoModalScroll: {
    maxHeight: 340,
  },
  photoMarkedRemove: {
    opacity: 0.45,
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
