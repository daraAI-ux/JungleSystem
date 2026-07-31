import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildKolamLayananSubscriptionCrossLinks,
  getKolamLayananSubscriptionIdFromRoute,
  type KolamLayananSubscriptionCrossLink,
  type KolamLayananSubscriptionDetail,
  type KolamLayananSubscriptionPendingVerification,
  type KolamLayananSubscriptionVisitPreview,
} from '../domain/kolam-layanan';
import { getErrorMessage as getApiErrorMessage } from '../lib/api-error';
import {
  downloadKolamLayananSubscriptionInvoice,
  getKolamLayananSubscription,
  getKolamLayananSubscriptionPendingVerifications,
  getKolamLayananSubscriptionUpcomingVisits,
  getKolamLayananVoucher,
} from '../services/kolam-layanan-api';

export interface KolamLayananSubscriptionController {
  crossLinks: KolamLayananSubscriptionCrossLink[];
  downloadingInvoice: boolean;
  error: string | null;
  loading: boolean;
  notice: string | null;
  pendingVerifications: KolamLayananSubscriptionPendingVerification[];
  subscription: KolamLayananSubscriptionDetail | null;
  upcomingVisits: KolamLayananSubscriptionVisitPreview[];
  onDownloadInvoice: () => Promise<boolean>;
  onRefresh: () => Promise<void>;
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
  const [upcomingVisits, setUpcomingVisits] = useState<
    KolamLayananSubscriptionVisitPreview[]
  >([]);
  const [pendingVerifications, setPendingVerifications] = useState<
    KolamLayananSubscriptionPendingVerification[]
  >([]);
  const [loading, setLoading] = useState(false);
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

      const [visits, verifications] = await Promise.all([
        detail.status === 'active'
          ? getKolamLayananSubscriptionUpcomingVisits(subscriptionId).catch(
              () => [],
            )
          : Promise.resolve([]),
        getKolamLayananSubscriptionPendingVerifications(subscriptionId).catch(
          () => [],
        ),
      ]);
      setUpcomingVisits(visits);
      setPendingVerifications(verifications);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
      setSubscription(null);
      setUpcomingVisits([]);
      setPendingVerifications([]);
    } finally {
      setLoading(false);
    }
  }, [subscriptionId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

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

  const crossLinks = useMemo(
    () =>
      subscription
        ? buildKolamLayananSubscriptionCrossLinks(subscription)
        : [],
    [subscription],
  );

  return useMemo(
    () => ({
      crossLinks,
      downloadingInvoice,
      error,
      loading,
      notice,
      pendingVerifications,
      subscription,
      upcomingVisits,
      onDownloadInvoice,
      onRefresh: refresh,
    }),
    [
      crossLinks,
      downloadingInvoice,
      error,
      loading,
      notice,
      onDownloadInvoice,
      pendingVerifications,
      refresh,
      subscription,
      upcomingVisits,
    ],
  );
}

function getErrorMessage(error: unknown) {
  const message = getApiErrorMessage(error).trim();
  return message || 'Terjadi kesalahan pada detail langganan.';
}
