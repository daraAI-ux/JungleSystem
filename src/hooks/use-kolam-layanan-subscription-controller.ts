import { useCallback, useEffect, useMemo, useState } from 'react';
import type { KolamCustomer } from '../domain/kolam-customer';
import {
  createKolamLayananSubscriptionContractForm,
  createKolamLayananSubscriptionUpdatePayload,
  getKolamLayananSubscriptionIdFromRoute,
  type KolamLayananSubscriptionContractFormState,
  type KolamLayananSubscriptionDetail,
  type KolamLayananSubscriptionPendingVerification,
  type KolamLayananSubscriptionVisitPreviewResult,
} from '../domain/kolam-layanan';
import { getErrorMessage as getApiErrorMessage } from '../lib/api-error';
import { getKolamCustomerList } from '../services/kolam-customer-api';
import {
  downloadKolamLayananSubscriptionInvoice,
  getKolamLayananSubscription,
  getKolamLayananSubscriptionPendingVerifications,
  getKolamLayananSubscriptionUpcomingVisits,
  getKolamLayananVoucher,
  spawnKolamLayananSubscriptionVisits,
  syncKolamLayananSubscriptionFromPending,
  updateKolamLayananSubscription,
} from '../services/kolam-layanan-api';

const EMPTY_VISIT_RESULT: KolamLayananSubscriptionVisitPreviewResult = {
  preview: [],
  skipped: false,
  reason: null,
  taskId: null,
  taskType: null,
  ops: null,
};

export interface KolamLayananSubscriptionController {
  contractForm: KolamLayananSubscriptionContractFormState;
  customers: KolamCustomer[];
  customersLoading: boolean;
  downloadingInvoice: boolean;
  error: string | null;
  loading: boolean;
  notice: string | null;
  pendingVerifications: KolamLayananSubscriptionPendingVerification[];
  saving: boolean;
  spawningVisits: boolean;
  subscription: KolamLayananSubscriptionDetail | null;
  syncing: boolean;
  visitPreview: KolamLayananSubscriptionVisitPreviewResult;
  visitsError: string | null;
  visitsLoading: boolean;
  onChangeContractForm: (
    patch: Partial<KolamLayananSubscriptionContractFormState>,
  ) => void;
  onDownloadInvoice: () => Promise<boolean>;
  onRefresh: () => Promise<void>;
  onSaveContract: () => Promise<boolean>;
  onSpawnVisits: () => Promise<boolean>;
  onSyncFromVoucher: () => Promise<boolean>;
}

export function useKolamLayananSubscriptionController(
  route: string,
): KolamLayananSubscriptionController {
  const subscriptionId = useMemo(
    () => getKolamLayananSubscriptionIdFromRoute(route),
    [route],
  );
  const [subscription, setSubscription] =
    useState<KolamLayananSubscriptionDetail | null>(null);
  const [contractForm, setContractForm] =
    useState<KolamLayananSubscriptionContractFormState>(
      createKolamLayananSubscriptionContractForm(null),
    );
  const [visitPreview, setVisitPreview] =
    useState<KolamLayananSubscriptionVisitPreviewResult>(EMPTY_VISIT_RESULT);
  const [visitsLoading, setVisitsLoading] = useState(false);
  const [visitsError, setVisitsError] = useState<string | null>(null);
  const [pendingVerifications, setPendingVerifications] = useState<
    KolamLayananSubscriptionPendingVerification[]
  >([]);
  const [customers, setCustomers] = useState<KolamCustomer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [spawningVisits, setSpawningVisits] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!subscriptionId) {
      setError('Langganan tidak ditemukan.');
      setSubscription(null);
      return;
    }
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      let detail = await getKolamLayananSubscription(subscriptionId);

      if (detail.voucherId) {
        try {
          const voucher = await getKolamLayananVoucher(detail.voucherId);
          detail = {
            ...detail,
            enclosureId: voucher.enclosureId,
            enclosureName: voucher.enclosureName,
            voucherSerial:
              detail.voucherSerial !== '—'
                ? detail.voucherSerial
                : voucher.serviceSerial,
          };
        } catch {
          // Cross-link enrichment is optional.
        }
      }

      setSubscription(detail);
      setContractForm(createKolamLayananSubscriptionContractForm(detail));

      const verifications =
        await getKolamLayananSubscriptionPendingVerifications(
          subscriptionId,
        ).catch(() => []);
      setPendingVerifications(verifications);

      if (detail.status === 'active') {
        setVisitsLoading(true);
        setVisitsError(null);
        try {
          const visits =
            await getKolamLayananSubscriptionUpcomingVisits(subscriptionId);
          setVisitPreview(visits);
        } catch (visitError) {
          setVisitPreview(EMPTY_VISIT_RESULT);
          setVisitsError(getErrorMessage(visitError));
        } finally {
          setVisitsLoading(false);
        }
      } else {
        setVisitPreview(EMPTY_VISIT_RESULT);
        setVisitsError(null);
        setVisitsLoading(false);
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setSubscription(null);
      setVisitPreview(EMPTY_VISIT_RESULT);
      setVisitsError(null);
      setVisitsLoading(false);
      setPendingVerifications([]);
    } finally {
      setLoading(false);
    }
  }, [subscriptionId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;
    setCustomersLoading(true);
    void getKolamCustomerList({ limit: 500, page: 1 })
      .then(result => {
        if (!cancelled) {
          setCustomers(result.items);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCustomers([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCustomersLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const onChangeContractForm = useCallback(
    (patch: Partial<KolamLayananSubscriptionContractFormState>) => {
      setContractForm(prev => ({ ...prev, ...patch }));
    },
    [],
  );

  const onDownloadInvoice = useCallback(async () => {
    if (!subscription?.saleId) {
      setError('Langganan tidak terhubung ke faktur penjualan.');
      return false;
    }
    setDownloadingInvoice(true);
    setError(null);
    setNotice(null);
    try {
      const result = await downloadKolamLayananSubscriptionInvoice(subscription);
      setNotice(
        result.path
          ? `Faktur disimpan: ${result.name}`
          : `Faktur diunduh: ${result.name}`,
      );
      return true;
    } catch (downloadError) {
      setError(getErrorMessage(downloadError));
      return false;
    } finally {
      setDownloadingInvoice(false);
    }
  }, [subscription]);

  const onSaveContract = useCallback(async () => {
    if (!subscriptionId) {
      setError('Langganan tidak ditemukan.');
      return false;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await updateKolamLayananSubscription(
        subscriptionId,
        createKolamLayananSubscriptionUpdatePayload(contractForm),
      );
      setNotice('Langganan disimpan');
      await refresh();
      return true;
    } catch (saveError) {
      setError(getErrorMessage(saveError));
      return false;
    } finally {
      setSaving(false);
    }
  }, [contractForm, refresh, subscriptionId]);

  const onSyncFromVoucher = useCallback(async () => {
    if (!subscription?.voucherId) {
      setError('Langganan tidak terhubung ke voucher.');
      return false;
    }
    setSyncing(true);
    setError(null);
    setNotice(null);
    try {
      await syncKolamLayananSubscriptionFromPending(subscription.voucherId);
      setNotice('Disinkronkan dari voucher');
      await refresh();
      return true;
    } catch (syncError) {
      setError(getErrorMessage(syncError));
      return false;
    } finally {
      setSyncing(false);
    }
  }, [refresh, subscription?.voucherId]);

  const onSpawnVisits = useCallback(async () => {
    if (!subscriptionId) {
      setError('Langganan tidak ditemukan.');
      return false;
    }
    setSpawningVisits(true);
    setError(null);
    setNotice(null);
    try {
      const result = await spawnKolamLayananSubscriptionVisits(subscriptionId, 14);
      setVisitPreview(result);
      setVisitsError(null);
      if (result.skipped) {
        setNotice(result.reason || 'Jadwal tidak dibuat');
      } else {
        setNotice(
          `Jadwal dibuat: ${result.ops ?? 0} slot baru di Kontrol Layanan`,
        );
      }
      return !result.skipped;
    } catch (spawnError) {
      setError(getErrorMessage(spawnError));
      return false;
    } finally {
      setSpawningVisits(false);
    }
  }, [subscriptionId]);

  return useMemo(
    () => ({
      contractForm,
      customers,
      customersLoading,
      downloadingInvoice,
      error,
      loading,
      notice,
      pendingVerifications,
      saving,
      spawningVisits,
      subscription,
      syncing,
      visitPreview,
      visitsError,
      visitsLoading,
      onChangeContractForm,
      onDownloadInvoice,
      onRefresh: refresh,
      onSaveContract,
      onSpawnVisits,
      onSyncFromVoucher,
    }),
    [
      contractForm,
      customers,
      customersLoading,
      downloadingInvoice,
      error,
      loading,
      notice,
      onChangeContractForm,
      onDownloadInvoice,
      onSaveContract,
      onSpawnVisits,
      onSyncFromVoucher,
      pendingVerifications,
      refresh,
      saving,
      spawningVisits,
      subscription,
      syncing,
      visitPreview,
      visitsError,
      visitsLoading,
    ],
  );
}

function getErrorMessage(error: unknown) {
  const message = getApiErrorMessage(error).trim();
  return message || 'Terjadi kesalahan pada detail langganan.';
}
