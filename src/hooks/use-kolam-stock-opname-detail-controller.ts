import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  extractStockOpnameVariantsFromRaw,
  needsOpnameMinusReason,
  type KolamOpnameMinusReason,
  type KolamStockOpname,
  type KolamStockOpnameLine,
  type KolamStockOpnameLineTargetType,
  type KolamStockOpnameStaffAssignee,
  type KolamStockOpnameVariantOption,
} from '../domain/kolam-stock-opname';
import type { KolamPackingOption } from '../domain/kolam-packing-option';
import type { KolamProductOption } from '../domain/kolam-product-option';
import type { KolamSpecies } from '../domain/kolam-species';
import { ApiError } from '../lib/api-error';
import { getKolamPackingOptions } from '../services/kolam-packing-option-api';
import {
  getKolamProductOptions,
  getKolamRawProductOptions,
} from '../services/kolam-product-option-api';
import { getKolamSpeciesList } from '../services/kolam-species-api';
import {
  addKolamStockOpnameLine,
  cancelKolamStockOpname,
  deleteKolamStockOpname,
  deleteKolamStockOpnameLine,
  expandKolamStockOpnameVariants,
  exportKolamStockOpnamePdf,
  exportKolamStockOpnameXlsx,
  getKolamStockOpname,
  getKolamStockOpnameLines,
  getKolamStockOpnameStaffAssignees,
  postKolamStockOpname,
  resubmitKolamStockOpnameLineForReview,
  reviewKolamStockOpnameLine,
  submitKolamStockOpnameForReview,
  updateKolamStockOpnameHeader,
  updateKolamStockOpnameLine,
} from '../services/kolam-stock-opname-api';

export type KolamStockOpnameAddLineDraft = {
  targetType: KolamStockOpnameLineTargetType;
  targetId: string;
  variantId: string;
  physicalQty: string;
  minusReason: KolamOpnameMinusReason | '';
  lineNote: string;
  photoUris: string[];
};

export interface KolamStockOpnameDetailController {
  documentId: string;
  header: KolamStockOpname | null;
  lines: KolamStockOpnameLine[];
  staffAssignees: KolamStockOpnameStaffAssignee[];
  productOptions: KolamProductOption[];
  rawOptions: KolamProductOption[];
  speciesOptions: KolamSpecies[];
  packingOptions: KolamPackingOption[];
  loading: boolean;
  acting: boolean;
  error: string;
  statusMessage: string;
  draftOwnerId: string;
  draftConductedId: string;
  setDraftOwnerId: (id: string) => void;
  setDraftConductedId: (id: string) => void;
  addDraft: KolamStockOpnameAddLineDraft;
  setAddDraft: (patch: Partial<KolamStockOpnameAddLineDraft>) => void;
  resetAddDraft: () => void;
  selectedVariants: KolamStockOpnameVariantOption[];
  addLineSystemQty: number | null;
  addLineDiff: number | null;
  addLineNeedsMinusReason: boolean;
  isDraft: boolean;
  isReview: boolean;
  isReady: boolean;
  isPosted: boolean;
  isCancelled: boolean;
  hasRevisionLine: boolean;
  showAddLineForm: boolean;
  parentOnlyLineCount: number;
  onRefresh: () => Promise<void>;
  onSaveAccountability: () => Promise<boolean>;
  onUpdateNote: (note: string) => Promise<boolean>;
  onSubmitForReview: () => Promise<boolean>;
  onExpandVariants: () => Promise<boolean>;
  onCancel: (reason?: string) => Promise<boolean>;
  onDeleteDocument: () => Promise<boolean>;
  onPost: () => Promise<{
    continuationId: string | null;
  } | null>;
  onExportXlsx: () => Promise<boolean>;
  onExportPdf: () => Promise<boolean>;
  onAddLine: () => Promise<boolean>;
  onUpdateLine: (input: {
    lineId: string;
    physicalQty?: number;
    minusReason?: KolamOpnameMinusReason | null;
    lineNote?: string;
    photoUris?: string[];
    keepPhotos?: string[];
  }) => Promise<boolean>;
  onDeleteLine: (lineId: string) => Promise<boolean>;
  onApproveLine: (lineId: string) => Promise<boolean>;
  onReviewLine: (input: {
    lineId: string;
    decision: 'rejected' | 'revision';
    reason: string;
  }) => Promise<boolean>;
  onResubmitLine: (lineId: string) => Promise<boolean>;
  canEditDraftLine: (line: KolamStockOpnameLine) => boolean;
  canEditRevisionLine: (line: KolamStockOpnameLine) => boolean;
  canRemoveLine: (line: KolamStockOpnameLine) => boolean;
  clearStatusMessage: () => void;
}

const EMPTY_ADD_DRAFT: KolamStockOpnameAddLineDraft = {
  targetType: 'product',
  targetId: '',
  variantId: '',
  physicalQty: '0',
  minusReason: '',
  lineNote: '',
  photoUris: [],
};

export function useKolamStockOpnameDetailController(
  documentId: string | null,
): KolamStockOpnameDetailController {
  const resolvedId = documentId?.trim() || '';
  const [header, setHeader] = useState<KolamStockOpname | null>(null);
  const [lines, setLines] = useState<KolamStockOpnameLine[]>([]);
  const [staffAssignees, setStaffAssignees] = useState<
    KolamStockOpnameStaffAssignee[]
  >([]);
  const [productOptions, setProductOptions] = useState<KolamProductOption[]>(
    [],
  );
  const [rawOptions, setRawOptions] = useState<KolamProductOption[]>([]);
  const [speciesOptions, setSpeciesOptions] = useState<KolamSpecies[]>([]);
  const [packingOptions, setPackingOptions] = useState<KolamPackingOption[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [draftOwnerId, setDraftOwnerId] = useState('');
  const [draftConductedId, setDraftConductedId] = useState('');
  const [addDraft, setAddDraftState] =
    useState<KolamStockOpnameAddLineDraft>(EMPTY_ADD_DRAFT);

  const refresh = useCallback(async () => {
    if (!resolvedId) {
      setHeader(null);
      setLines([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [headerRow, linesResult, staff] = await Promise.all([
        getKolamStockOpname(resolvedId),
        getKolamStockOpnameLines(resolvedId, { page: 1, limit: 500 }),
        getKolamStockOpnameStaffAssignees({ limit: 500 }),
      ]);
      setHeader(headerRow);
      setLines(linesResult.data);
      setStaffAssignees(staff);
      if (headerRow.status === 'draft') {
        setDraftOwnerId(headerRow.ownerId || '');
        setDraftConductedId(headerRow.conductedById || '');
      }
    } catch (err) {
      setError(formatError(err, 'Gagal memuat detail stock opname.'));
    } finally {
      setLoading(false);
    }
  }, [resolvedId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      getKolamProductOptions(),
      getKolamRawProductOptions(),
      getKolamSpeciesList({ page: 1, limit: 1000 }),
      getKolamPackingOptions(),
    ])
      .then(([products, raws, speciesResult, packings]) => {
        if (cancelled) {
          return;
        }
        setProductOptions(products.filter(item => item.type !== 'raw'));
        setRawOptions(raws);
        setSpeciesOptions(speciesResult.data);
        setPackingOptions(packings);
      })
      .catch(() => {
        // Catalog load failures surface when user tries to add lines.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setAddDraft = useCallback((patch: Partial<KolamStockOpnameAddLineDraft>) => {
    setAddDraftState(prev => {
      const next = { ...prev, ...patch };
      if (patch.targetType != null && patch.targetType !== prev.targetType) {
        next.targetId = '';
        next.variantId = '';
        next.physicalQty = '0';
        next.minusReason = '';
        next.photoUris = [];
      }
      if (patch.targetId != null && patch.targetId !== prev.targetId) {
        next.variantId = '';
        next.minusReason = '';
        next.photoUris = [];
      }
      return next;
    });
  }, []);

  const resetAddDraft = useCallback(() => {
    setAddDraftState(EMPTY_ADD_DRAFT);
  }, []);

  const selectedVariants = useMemo(() => {
    if (addDraft.targetType === 'product') {
      const item = productOptions.find(row => row.id === addDraft.targetId);
      return extractStockOpnameVariantsFromRaw(item?.raw);
    }
    if (addDraft.targetType === 'raw') {
      const item = rawOptions.find(row => row.id === addDraft.targetId);
      return extractStockOpnameVariantsFromRaw(item?.raw);
    }
    if (addDraft.targetType === 'species') {
      const item = speciesOptions.find(row => row.id === addDraft.targetId);
      return extractStockOpnameVariantsFromRaw(item);
    }
    return [];
  }, [
    addDraft.targetId,
    addDraft.targetType,
    productOptions,
    rawOptions,
    speciesOptions,
  ]);

  const addLineSystemQty = useMemo(() => {
    if (!addDraft.targetId) {
      return null;
    }
    if (addDraft.targetType === 'packing') {
      return (
        packingOptions.find(row => row.id === addDraft.targetId)?.stock ?? null
      );
    }
    if (selectedVariants.length > 0) {
      if (!addDraft.variantId) {
        return null;
      }
      return (
        selectedVariants.find(row => row.id === addDraft.variantId)?.stock ??
        null
      );
    }
    if (addDraft.targetType === 'species') {
      return (
        speciesOptions.find(row => row.id === addDraft.targetId)?.stock ?? null
      );
    }
    if (addDraft.targetType === 'raw') {
      return rawOptions.find(row => row.id === addDraft.targetId)?.stock ?? null;
    }
    return (
      productOptions.find(row => row.id === addDraft.targetId)?.stock ?? null
    );
  }, [
    addDraft.targetId,
    addDraft.targetType,
    addDraft.variantId,
    packingOptions,
    productOptions,
    rawOptions,
    selectedVariants,
    speciesOptions,
  ]);

  const physicalQtyNumber = Number(addDraft.physicalQty);
  const addLineDiff =
    addLineSystemQty != null && Number.isFinite(physicalQtyNumber)
      ? physicalQtyNumber - addLineSystemQty
      : null;
  const addNeedsMinus = needsOpnameMinusReason(
    addDraft.targetType,
    addLineDiff,
  );

  const isDraft = header?.status === 'draft';
  const isReview = header?.status === 'in_review';
  const isReady = header?.status === 'ready_to_post';
  const isPosted =
    header?.status === 'posted' || header?.status === 'partially_posted';
  const isCancelled = header?.status === 'cancelled';
  const hasRevisionLine = lines.some(line => line.lineStatus === 'revision');
  const showAddLineForm = Boolean(
    (isDraft || (isReview && hasRevisionLine)),
  );
  const parentOnlyLineCount = lines.filter(
    line => line.targetType !== 'packing' && !line.variantId,
  ).length;

  const runAction = useCallback(
    async <T,>(
      action: () => Promise<T>,
      successMessage: string | null,
      failureFallback: string,
      options?: { skipRefresh?: boolean },
    ): Promise<T | null> => {
      setActing(true);
      setError('');
      setStatusMessage('');
      try {
        const result = await action();
        if (successMessage) {
          setStatusMessage(successMessage);
        }
        if (!options?.skipRefresh) {
          await refresh();
        }
        return result;
      } catch (err) {
        setError(formatError(err, failureFallback));
        return null;
      } finally {
        setActing(false);
      }
    },
    [refresh],
  );

  const onSaveAccountability = useCallback(async () => {
    if (!resolvedId) {
      return false;
    }
    const result = await runAction(
      () =>
        updateKolamStockOpnameHeader(resolvedId, {
          ownerId: draftOwnerId || null,
          conductedBy: draftConductedId || null,
        }),
      'PIC dan pelaksana disimpan.',
      'Gagal menyimpan akuntabilitas.',
    );
    return Boolean(result);
  }, [draftConductedId, draftOwnerId, resolvedId, runAction]);

  const onUpdateNote = useCallback(
    async (note: string) => {
      if (!resolvedId) {
        return false;
      }
      const result = await runAction(
        () => updateKolamStockOpnameHeader(resolvedId, { note }),
        'Catatan disimpan.',
        'Gagal menyimpan catatan.',
      );
      return Boolean(result);
    },
    [resolvedId, runAction],
  );

  const onSubmitForReview = useCallback(async () => {
    if (!resolvedId) {
      return false;
    }
    if (!draftOwnerId || !draftConductedId) {
      setError('PIC dan pelaksana wajib diisi sebelum kirim review.');
      return false;
    }
    const result = await runAction(async () => {
      const needSave =
        header?.ownerId !== draftOwnerId ||
        header?.conductedById !== draftConductedId;
      if (needSave) {
        await updateKolamStockOpnameHeader(resolvedId, {
          ownerId: draftOwnerId || null,
          conductedBy: draftConductedId || null,
        });
      }
      return submitKolamStockOpnameForReview(resolvedId);
    }, 'Dokumen dikirim untuk review.', 'Gagal mengirim review.');
    return Boolean(result);
  }, [
    draftConductedId,
    draftOwnerId,
    header?.conductedById,
    header?.ownerId,
    resolvedId,
    runAction,
  ]);

  const onExpandVariants = useCallback(async () => {
    if (!resolvedId) {
      return false;
    }
    const result = await runAction(
      () => expandKolamStockOpnameVariants(resolvedId),
      null,
      'Gagal memperluas varian.',
    );
    if (!result) {
      return false;
    }
    setStatusMessage(
      `Varian diperluas: ${result.totalLines} baris (${result.withVariant} dengan varian).`,
    );
    return true;
  }, [resolvedId, runAction]);

  const onCancel = useCallback(
    async (reason?: string) => {
      if (!resolvedId) {
        return false;
      }
      const result = await runAction(
        () => cancelKolamStockOpname(resolvedId, reason),
        'Dokumen dibatalkan.',
        'Gagal membatalkan dokumen.',
      );
      return Boolean(result);
    },
    [resolvedId, runAction],
  );

  const onDeleteDocument = useCallback(async () => {
    if (!resolvedId) {
      return false;
    }
    const result = await runAction(
      () => deleteKolamStockOpname(resolvedId),
      'Dokumen dihapus.',
      'Gagal menghapus dokumen.',
      { skipRefresh: true },
    );
    return Boolean(result);
  }, [resolvedId, runAction]);

  const onPost = useCallback(async () => {
    if (!resolvedId) {
      return null;
    }
    const result = await runAction(
      () => postKolamStockOpname(resolvedId),
      null,
      'Gagal memposting dokumen.',
    );
    if (!result) {
      return null;
    }
    setStatusMessage(
      result.continuation
        ? `Diposting ${result.postedCount} baris. Draf lanjutan: ${result.continuation.documentNumber}`
        : `Diposting ${result.postedCount} baris.`,
    );
    return { continuationId: result.continuation?.id ?? null };
  }, [resolvedId, runAction]);

  const onExportXlsx = useCallback(async () => {
    if (!resolvedId || !header) {
      return false;
    }
    const result = await runAction(
      () =>
        exportKolamStockOpnameXlsx(resolvedId, header.documentNumber || resolvedId),
      null,
      'Gagal ekspor XLSX.',
      { skipRefresh: true },
    );
    if (!result) {
      return false;
    }
    setStatusMessage(`Ekspor XLSX siap: ${result.name}`);
    return true;
  }, [header, resolvedId, runAction]);

  const onExportPdf = useCallback(async () => {
    if (!resolvedId || !header) {
      return false;
    }
    const result = await runAction(
      () =>
        exportKolamStockOpnamePdf(resolvedId, header.documentNumber || resolvedId),
      null,
      'Gagal ekspor PDF.',
      { skipRefresh: true },
    );
    if (!result) {
      return false;
    }
    setStatusMessage(`Ekspor PDF siap: ${result.name}`);
    return true;
  }, [header, resolvedId, runAction]);

  const onAddLine = useCallback(async () => {
    if (!resolvedId) {
      return false;
    }
    if (!addDraft.targetId) {
      setError('Pilih barang terlebih dahulu.');
      return false;
    }
    if (selectedVariants.length > 0 && !addDraft.variantId) {
      setError('Pilih varian terlebih dahulu.');
      return false;
    }
    if (!Number.isFinite(physicalQtyNumber)) {
      setError('Qty fisik tidak valid.');
      return false;
    }
    if (addNeedsMinus && !addDraft.minusReason) {
      setError('Pilih alasan selisih minus.');
      return false;
    }
    const result = await runAction(
      () =>
        addKolamStockOpnameLine(resolvedId, {
          targetType: addDraft.targetType,
          productId:
            addDraft.targetType === 'product' || addDraft.targetType === 'raw'
              ? addDraft.targetId
              : undefined,
          speciesId:
            addDraft.targetType === 'species' ? addDraft.targetId : undefined,
          packingId:
            addDraft.targetType === 'packing' ? addDraft.targetId : undefined,
          variant: addDraft.variantId || null,
          physicalQty: physicalQtyNumber,
          minusReason: addDraft.minusReason || undefined,
          lineNote: addDraft.lineNote || undefined,
          photoUris: addDraft.photoUris,
        }),
      'Baris ditambahkan.',
      'Gagal menambah baris.',
    );
    if (result) {
      resetAddDraft();
    }
    return Boolean(result);
  }, [
    addDraft,
    addNeedsMinus,
    physicalQtyNumber,
    resetAddDraft,
    resolvedId,
    runAction,
    selectedVariants.length,
  ]);

  const onUpdateLine = useCallback(
    async (input: {
      lineId: string;
      physicalQty?: number;
      minusReason?: KolamOpnameMinusReason | null;
      lineNote?: string;
      photoUris?: string[];
      keepPhotos?: string[];
    }) => {
      if (!resolvedId) {
        return false;
      }
      const result = await runAction(
        () => updateKolamStockOpnameLine(resolvedId, input),
        'Baris diperbarui.',
        'Gagal memperbarui baris.',
      );
      return Boolean(result);
    },
    [resolvedId, runAction],
  );

  const onDeleteLine = useCallback(
    async (lineId: string) => {
      if (!resolvedId) {
        return false;
      }
      const result = await runAction(
        async () => {
          await deleteKolamStockOpnameLine(resolvedId, lineId);
          return true;
        },
        'Baris dihapus.',
        'Gagal menghapus baris.',
      );
      return Boolean(result);
    },
    [resolvedId, runAction],
  );

  const onApproveLine = useCallback(
    async (lineId: string) => {
      if (!resolvedId) {
        return false;
      }
      const result = await runAction(
        () =>
          reviewKolamStockOpnameLine(resolvedId, {
            lineId,
            decision: 'approved',
          }),
        'Baris disetujui.',
        'Gagal menyetujui baris.',
      );
      return Boolean(result);
    },
    [resolvedId, runAction],
  );

  const onReviewLine = useCallback(
    async (input: {
      lineId: string;
      decision: 'rejected' | 'revision';
      reason: string;
    }) => {
      if (!resolvedId) {
        return false;
      }
      if (!input.reason.trim()) {
        setError('Alasan wajib diisi.');
        return false;
      }
      const result = await runAction(
        () =>
          reviewKolamStockOpnameLine(resolvedId, {
            lineId: input.lineId,
            decision: input.decision,
            reason: input.reason.trim(),
          }),
        input.decision === 'rejected'
          ? 'Baris ditolak.'
          : 'Permintaan revisi dikirim.',
        'Gagal mereview baris.',
      );
      return Boolean(result);
    },
    [resolvedId, runAction],
  );

  const onResubmitLine = useCallback(
    async (lineId: string) => {
      if (!resolvedId) {
        return false;
      }
      const result = await runAction(
        () => resubmitKolamStockOpnameLineForReview(resolvedId, lineId),
        'Baris dikirim ulang untuk review.',
        'Gagal mengirim ulang baris.',
      );
      return Boolean(result);
    },
    [resolvedId, runAction],
  );

  const canEditDraftLine = useCallback(
    (line: KolamStockOpnameLine) =>
      Boolean(isDraft && line.lineStatus === 'draft'),
    [isDraft],
  );
  const canEditRevisionLine = useCallback(
    (line: KolamStockOpnameLine) =>
      Boolean(isReview && line.lineStatus === 'revision'),
    [isReview],
  );
  const canRemoveLine = useCallback(
    (line: KolamStockOpnameLine) =>
      canEditDraftLine(line) || canEditRevisionLine(line),
    [canEditDraftLine, canEditRevisionLine],
  );

  return {
    documentId: resolvedId,
    header,
    lines,
    staffAssignees,
    productOptions,
    rawOptions,
    speciesOptions,
    packingOptions,
    loading,
    acting,
    error,
    statusMessage,
    draftOwnerId,
    draftConductedId,
    setDraftOwnerId,
    setDraftConductedId,
    addDraft,
    setAddDraft,
    resetAddDraft,
    selectedVariants,
    addLineSystemQty,
    addLineDiff,
    addLineNeedsMinusReason: addNeedsMinus,
    isDraft: Boolean(isDraft),
    isReview: Boolean(isReview),
    isReady: Boolean(isReady),
    isPosted: Boolean(isPosted),
    isCancelled: Boolean(isCancelled),
    hasRevisionLine,
    showAddLineForm,
    parentOnlyLineCount,
    onRefresh: refresh,
    onSaveAccountability,
    onUpdateNote,
    onSubmitForReview,
    onExpandVariants,
    onCancel,
    onDeleteDocument,
    onPost,
    onExportXlsx,
    onExportPdf,
    onAddLine,
    onUpdateLine,
    onDeleteLine,
    onApproveLine,
    onReviewLine,
    onResubmitLine,
    canEditDraftLine,
    canEditRevisionLine,
    canRemoveLine,
    clearStatusMessage: () => setStatusMessage(''),
  };
}

function formatError(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
