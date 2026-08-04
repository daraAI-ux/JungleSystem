import { useCallback, useEffect, useMemo, useState } from 'react';
import { useKolamAuthContext } from '../context/kolam-app-contexts';
import {
  completedKolamLayananVisitSlotsForApi,
  createEmptyKolamLayananMaterialLine,
  createEmptyKolamLayananVisitSlots,
  createKolamLayananContractDimensionsDraft,
  createKolamLayananProductComponentsPayload,
  ensureKolamLayananVisitSlotRows,
  getKolamLayananVoucherIdFromRoute,
  hasKolamSalePermission,
  kolamLayananVisitSlotsReadyForPropose,
  parseKolamLayananDimInput,
  validateKolamLayananMaterialLines,
  type KolamLayananContractDimensionsDraft,
  type KolamLayananScheduleRequirements,
  type KolamLayananSubscriptionDetail,
  type KolamLayananSubscriptionSpawnVisitsResult,
  type KolamLayananTermsContext,
  type KolamLayananVisitSlot,
  type KolamLayananVoucherDetail,
  type KolamLayananVoucherMaterialLine,
} from '../domain/kolam-layanan';
import type { KolamEnclosureStaffRef } from '../domain/kolam-enclosure';
import { getErrorMessage as getApiErrorMessage } from '../lib/api-error';
import { getKolamEnclosureStaffAssignees } from '../services/kolam-enclosure-api';
import {
  acceptKolamLayananVoucherTerms,
  approveKolamLayananVoucherSchedule,
  assignKolamLayananVoucherVisitPic,
  clearKolamLayananVoucherAddonProducts,
  fulfillKolamLayananVoucherAddonStock,
  getKolamLayananSubscription,
  getKolamLayananVoucher,
  getKolamLayananVoucherScheduleRequirements,
  getKolamLayananVoucherTerms,
  proposeKolamLayananVoucherSchedule,
  rejectKolamLayananVoucherSchedule,
  setKolamLayananVoucherProductComponents,
  setKolamLayananVoucherPurchaseContract,
  spawnKolamLayananSubscriptionVisits,
  syncKolamLayananSubscriptionFromPending,
  updateKolamLayananSubscription,
} from '../services/kolam-layanan-api';

export interface KolamLayananVoucherController {
  canMutateSale: boolean;
  canViewSale: boolean;
  contractDraft: KolamLayananContractDimensionsDraft;
  error: string | null;
  loading: boolean;
  materialLines: KolamLayananVoucherMaterialLine[];
  notice: string | null;
  picId: string;
  saving: boolean;
  schedule: KolamLayananScheduleRequirements | null;
  scheduleDraftSlots: KolamLayananVisitSlot[];
  staffOptions: KolamEnclosureStaffRef[];
  subscription: KolamLayananSubscriptionDetail | null;
  syncingSubscription: boolean;
  terms: KolamLayananTermsContext | null;
  termsAgreed: boolean;
  transportDraft: string;
  voucher: KolamLayananVoucherDetail | null;
  onAcceptTerms: () => Promise<boolean>;
  onAddMaterialLine: () => void;
  onApproveSchedule: () => Promise<boolean>;
  onAssignPic: () => Promise<boolean>;
  onChangeContractDraft: (
    patch: Partial<KolamLayananContractDimensionsDraft>,
  ) => void;
  onChangeMaterialLine: (
    key: string,
    patch: Partial<KolamLayananVoucherMaterialLine>,
  ) => void;
  onChangePicId: (value: string) => void;
  onChangeScheduleSlot: (
    index: number,
    patch: Partial<KolamLayananVisitSlot>,
  ) => void;
  onChangeTransportDraft: (value: string) => void;
  onFulfillHppStock: () => Promise<boolean>;
  onProposeSchedule: () => Promise<boolean>;
  onRefresh: () => Promise<void>;
  onRejectSchedule: () => Promise<boolean>;
  onRemoveMaterialLine: (key: string) => void;
  onSaveContractDimensions: () => Promise<boolean>;
  onSaveMaterials: () => Promise<boolean>;
  onSaveTransport: () => Promise<boolean>;
  onSetTermsAgreed: (value: boolean) => void;
  onSpawnVisits: () => Promise<boolean>;
  onSyncSubscription: () => Promise<boolean>;
}

export function useKolamLayananVoucherController(
  route: string,
): KolamLayananVoucherController {
  const { authUser } = useKolamAuthContext();
  const voucherId = getKolamLayananVoucherIdFromRoute(route);

  const canViewSale = hasKolamSalePermission(
    authUser?.permissions,
    'view',
    authUser?.roleKey,
  );
  const canMutateSale = hasKolamSalePermission(
    authUser?.permissions,
    'update',
    authUser?.roleKey,
  );

  const [voucher, setVoucher] = useState<KolamLayananVoucherDetail | null>(
    null,
  );
  const [subscription, setSubscription] =
    useState<KolamLayananSubscriptionDetail | null>(null);
  const [schedule, setSchedule] =
    useState<KolamLayananScheduleRequirements | null>(null);
  const [terms, setTerms] = useState<KolamLayananTermsContext | null>(null);
  const [materialLines, setMaterialLines] = useState<
    KolamLayananVoucherMaterialLine[]
  >([]);
  const [scheduleDraftSlots, setScheduleDraftSlots] = useState<
    KolamLayananVisitSlot[]
  >([]);
  const [contractDraft, setContractDraft] =
    useState<KolamLayananContractDimensionsDraft>(
      createKolamLayananContractDimensionsDraft(null),
    );
  const [transportDraft, setTransportDraft] = useState('0');
  const [picId, setPicId] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [staffOptions, setStaffOptions] = useState<KolamEnclosureStaffRef[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncingSubscription, setSyncingSubscription] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!voucherId) {
      setError('Voucher tidak ditemukan.');
      return;
    }
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const live = await getKolamLayananVoucher(voucherId);
      setVoucher(live);
      setMaterialLines(live.materialLines);
      setContractDraft(
        createKolamLayananContractDimensionsDraft(live.purchaseDimensions),
      );

      const [scheduleLive, termsLive, staff, subscriptionLive] =
        await Promise.all([
          canViewSale
            ? getKolamLayananVoucherScheduleRequirements(voucherId).catch(
                () => null,
              )
            : Promise.resolve(null),
          canViewSale
            ? getKolamLayananVoucherTerms(voucherId).catch(() => null)
            : Promise.resolve(null),
          canMutateSale
            ? getKolamEnclosureStaffAssignees({ limit: 200 }).catch(() => [])
            : Promise.resolve([]),
          live.subscriptionId
            ? getKolamLayananSubscription(live.subscriptionId).catch(() => null)
            : Promise.resolve(null),
        ]);

      setSchedule(scheduleLive);
      setTerms(termsLive);
      setStaffOptions(staff);
      setSubscription(subscriptionLive);
      setTransportDraft(String(subscriptionLive?.transportCostDefault ?? 0));

      if (scheduleLive) {
        const visits = scheduleLive.visitsPerWeek ?? 1;
        const initial =
          scheduleLive.proposedVisitSlots.length > 0
            ? scheduleLive.proposedVisitSlots
            : createEmptyKolamLayananVisitSlots(visits);
        setScheduleDraftSlots(
          ensureKolamLayananVisitSlotRows(initial, visits),
        );
        if (scheduleLive.visitAssignedTo) {
          setPicId(scheduleLive.visitAssignedTo);
        } else if (live.visitAssignedToId) {
          setPicId(live.visitAssignedToId);
        }
      } else {
        setScheduleDraftSlots([]);
      }
      setTermsAgreed(false);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setVoucher(null);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [canMutateSale, canViewSale, voucherId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runMutate = useCallback(
    async (action: () => Promise<void>, successMessage: string) => {
      if (!voucherId) {
        return false;
      }
      if (!canMutateSale) {
        setError(
          'Perlu izin update penjualan (sale) untuk mengubah voucher. Menu Layanan saja tidak cukup.',
        );
        return false;
      }
      setSaving(true);
      setError(null);
      setNotice(null);
      try {
        await action();
        setNotice(successMessage);
        await refresh();
        return true;
      } catch (mutateError) {
        setError(getErrorMessage(mutateError));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [canMutateSale, refresh, voucherId],
  );

  const onProposeSchedule = useCallback(async () => {
    if (!schedule) {
      return false;
    }
    const visits = schedule.visitsPerWeek ?? 1;
    if (!kolamLayananVisitSlotsReadyForPropose(scheduleDraftSlots, visits)) {
      setError(
        `Lengkapi ${visits} slot — hari berbeda dan jam (HH:mm) untuk setiap kunjungan.`,
      );
      return false;
    }
    if (!picId.trim()) {
      setError('Pilih PIC kunjungan terlebih dahulu.');
      return false;
    }
    return runMutate(
      () =>
        proposeKolamLayananVoucherSchedule(
          voucherId!,
          completedKolamLayananVisitSlotsForApi(scheduleDraftSlots, visits),
          picId.trim(),
        ),
      'Jadwal & PIC diajukan — menunggu persetujuan pelanggan.',
    );
  }, [picId, runMutate, schedule, scheduleDraftSlots, voucherId]);

  const onApproveSchedule = useCallback(async () => {
    if (!picId.trim()) {
      setError('Pilih PIC kunjungan terlebih dahulu.');
      return false;
    }
    return runMutate(
      () => approveKolamLayananVoucherSchedule(voucherId!, picId.trim()),
      'Jadwal & PIC disetujui.',
    );
  }, [picId, runMutate, voucherId]);

  const onAssignPic = useCallback(async () => {
    if (!picId.trim()) {
      setError('Pilih PIC kunjungan terlebih dahulu.');
      return false;
    }
    return runMutate(
      () => assignKolamLayananVoucherVisitPic(voucherId!, picId.trim()),
      'PIC kunjungan ditetapkan.',
    );
  }, [picId, runMutate, voucherId]);

  const onRejectSchedule = useCallback(async () => {
    return runMutate(
      () => rejectKolamLayananVoucherSchedule(voucherId!),
      'Jadwal ditolak — pelanggan dapat mengajukan ulang.',
    );
  }, [runMutate, voucherId]);

  const onAcceptTerms = useCallback(async () => {
    if (!termsAgreed) {
      setError('Centang persetujuan syarat & ketentuan terlebih dahulu.');
      return false;
    }
    return runMutate(async () => {
      const next = await acceptKolamLayananVoucherTerms(voucherId!);
      setTerms(next);
    }, 'Syarat & ketentuan dicatat atas nama pelanggan.');
  }, [runMutate, termsAgreed, voucherId]);

  const onSaveMaterials = useCallback(async () => {
    const validationError = validateKolamLayananMaterialLines(materialLines);
    if (validationError) {
      setError(validationError);
      return false;
    }
    return runMutate(async () => {
      await setKolamLayananVoucherProductComponents(
        voucherId!,
        createKolamLayananProductComponentsPayload(materialLines),
      );
      await clearKolamLayananVoucherAddonProducts(voucherId!);
    }, 'Material voucher disimpan.');
  }, [materialLines, runMutate, voucherId]);

  const onFulfillHppStock = useCallback(async () => {
    return runMutate(async () => {
      const result = await fulfillKolamLayananVoucherAddonStock(voucherId!);
      setNotice(result.message || 'Stok HPP diproses.');
    }, 'Stok HPP diproses.');
  }, [runMutate, voucherId]);

  const onSaveContractDimensions = useCallback(async () => {
    const length = parseKolamLayananDimInput(contractDraft.length);
    const width = parseKolamLayananDimInput(contractDraft.width);
    const height = parseKolamLayananDimInput(contractDraft.height);
    if (length <= 0 || width <= 0 || height <= 0) {
      setError('Isi panjang, lebar, dan tinggi (angka positif)');
      return false;
    }
    return runMutate(
      () =>
        setKolamLayananVoucherPurchaseContract(voucherId!, {
          length,
          width,
          height,
          unitLabel: contractDraft.unitLabel || 'Cm',
        }),
      'Ukuran kontrak disimpan — tersinkron ke faktur',
    );
  }, [contractDraft, runMutate, voucherId]);

  const onSyncSubscription = useCallback(async () => {
    if (!voucherId) {
      return false;
    }
    setSyncingSubscription(true);
    setError(null);
    setNotice(null);
    try {
      const next = await syncKolamLayananSubscriptionFromPending(voucherId);
      setSubscription(next);
      setTransportDraft(String(next.transportCostDefault ?? 0));
      setNotice('Langganan disinkronkan');
      await refresh();
      return true;
    } catch (syncError) {
      setError(getErrorMessage(syncError));
      return false;
    } finally {
      setSyncingSubscription(false);
    }
  }, [refresh, voucherId]);

  const onSaveTransport = useCallback(async () => {
    if (!subscription?.id) {
      setError('Belum ada dokumen langganan.');
      return false;
    }
    const transport = Number(transportDraft.replace(/[^\d]/g, '')) || 0;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const next = await updateKolamLayananSubscription(subscription.id, {
        transportCostDefault: transport,
      });
      setSubscription(next);
      setTransportDraft(String(next.transportCostDefault ?? 0));
      setNotice('Transport default disimpan');
      return true;
    } catch (saveError) {
      setError(getErrorMessage(saveError));
      return false;
    } finally {
      setSaving(false);
    }
  }, [subscription?.id, transportDraft]);

  const onSpawnVisits = useCallback(async () => {
    if (!subscription?.id) {
      setError('Belum ada dokumen langganan.');
      return false;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const result: KolamLayananSubscriptionSpawnVisitsResult =
        await spawnKolamLayananSubscriptionVisits(subscription.id, 14);
      if (result.skipped) {
        setNotice(result.reason ?? 'Jadwal belum dibuka');
      } else {
        setNotice(`${result.ops ?? 0} slot kunjungan dibuka`);
      }
      return true;
    } catch (spawnError) {
      setError(getErrorMessage(spawnError));
      return false;
    } finally {
      setSaving(false);
    }
  }, [subscription?.id]);

  const onChangeScheduleSlot = useCallback(
    (index: number, patch: Partial<KolamLayananVisitSlot>) => {
      setScheduleDraftSlots(current =>
        current.map((slot, slotIndex) =>
          slotIndex === index ? { ...slot, ...patch } : slot,
        ),
      );
    },
    [],
  );

  const onChangeMaterialLine = useCallback(
    (key: string, patch: Partial<KolamLayananVoucherMaterialLine>) => {
      setMaterialLines(current =>
        current.map(line => (line.key === key ? { ...line, ...patch } : line)),
      );
    },
    [],
  );

  const onChangeContractDraft = useCallback(
    (patch: Partial<KolamLayananContractDimensionsDraft>) => {
      setContractDraft(current => ({ ...current, ...patch }));
    },
    [],
  );

  const onAddMaterialLine = useCallback(() => {
    setMaterialLines(current => [
      ...current,
      createEmptyKolamLayananMaterialLine(),
    ]);
  }, []);

  const onRemoveMaterialLine = useCallback((key: string) => {
    setMaterialLines(current => current.filter(line => line.key !== key));
  }, []);

  return useMemo(
    () => ({
      canMutateSale,
      canViewSale,
      contractDraft,
      error,
      loading,
      materialLines,
      notice,
      picId,
      saving,
      schedule,
      scheduleDraftSlots,
      staffOptions,
      subscription,
      syncingSubscription,
      terms,
      termsAgreed,
      transportDraft,
      voucher,
      onAcceptTerms,
      onAddMaterialLine,
      onApproveSchedule,
      onAssignPic,
      onChangeContractDraft,
      onChangeMaterialLine,
      onChangePicId: setPicId,
      onChangeScheduleSlot,
      onChangeTransportDraft: setTransportDraft,
      onFulfillHppStock,
      onProposeSchedule,
      onRefresh: refresh,
      onRejectSchedule,
      onRemoveMaterialLine,
      onSaveContractDimensions,
      onSaveMaterials,
      onSaveTransport,
      onSetTermsAgreed: setTermsAgreed,
      onSpawnVisits,
      onSyncSubscription,
    }),
    [
      canMutateSale,
      canViewSale,
      contractDraft,
      error,
      loading,
      materialLines,
      notice,
      onAcceptTerms,
      onAddMaterialLine,
      onApproveSchedule,
      onAssignPic,
      onChangeContractDraft,
      onChangeMaterialLine,
      onChangeScheduleSlot,
      onFulfillHppStock,
      onProposeSchedule,
      onRejectSchedule,
      onRemoveMaterialLine,
      onSaveContractDimensions,
      onSaveMaterials,
      onSaveTransport,
      onSpawnVisits,
      onSyncSubscription,
      picId,
      refresh,
      saving,
      schedule,
      scheduleDraftSlots,
      staffOptions,
      subscription,
      syncingSubscription,
      terms,
      termsAgreed,
      transportDraft,
      voucher,
    ],
  );
}

function getErrorMessage(error: unknown) {
  const message = getApiErrorMessage(error).trim();
  return message || 'Terjadi kesalahan pada detail voucher.';
}
