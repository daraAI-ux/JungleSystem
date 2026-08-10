import {useCallback, useEffect, useState} from 'react';
import type {KolamHrOvertimeRow} from '../domain/kolam-hr';
import {ApiError} from '../lib/api-error';
import {
  fetchKolamHrOvertimeList,
  payKolamHrOvertime,
  reviewKolamHrOvertime,
  uploadKolamHrOvertimeProof,
} from '../services/kolam-hr-overtime-api';
import {fetchKolamWalletsAll} from '../services/kolam-wallet-api';
import {pickNativeImageFile} from '../services/native-file-picker';

export type KolamHrWalletOption = {
  label: string;
  value: string;
};

export function useKolamHrOvertimeController(options: {
  canUpdate: boolean;
  enabled: boolean;
}) {
  const [filter, setFilter] = useState('pending');
  const [rows, setRows] = useState<KolamHrOvertimeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [walletOptions, setWalletOptions] = useState<KolamHrWalletOption[]>([]);
  const [walletById, setWalletById] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!options.enabled) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const next = await fetchKolamHrOvertimeList(filter);
      setRows(next);
    } catch (err) {
      setRows([]);
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal memuat lembur.',
      );
    } finally {
      setLoading(false);
    }
  }, [filter, options.enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!options.enabled || !options.canUpdate) {
      return;
    }
    let cancelled = false;
    void fetchKolamWalletsAll()
      .then(wallets => {
        if (cancelled) {
          return;
        }
        setWalletOptions(
          wallets.map(wallet => ({
            value: wallet.id,
            label: wallet.name || wallet.id,
          })),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setWalletOptions([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [options.canUpdate, options.enabled]);

  const onReview = useCallback(
    async (id: string, action: 'approve' | 'reject') => {
      setMutating(true);
      setError('');
      setStatusMessage('');
      try {
        await reviewKolamHrOvertime({id, action});
        setStatusMessage(
          action === 'approve' ? 'Lembur disetujui' : 'Lembur ditolak',
        );
        await load();
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Gagal memproses',
        );
      } finally {
        setMutating(false);
      }
    },
    [load],
  );

  const onPay = useCallback(
    async (id: string) => {
      const walletFrom = walletById[id];
      if (!walletFrom) {
        setError('Pilih wallet pembayaran');
        return;
      }
      setMutating(true);
      setError('');
      setStatusMessage('');
      try {
        await payKolamHrOvertime({id, walletFrom});
        setStatusMessage('Lembur dibayar — kas terdebit');
        await load();
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Gagal membayar',
        );
      } finally {
        setMutating(false);
      }
    },
    [load, walletById],
  );

  const onUploadProof = useCallback(
    async (id: string) => {
      setError('');
      setStatusMessage('');
      try {
        const picked = await pickNativeImageFile();
        if (picked.cancelled || !picked.uri) {
          return;
        }
        setMutating(true);
        await uploadKolamHrOvertimeProof({
          id,
          localUri: picked.uri,
          fileName: picked.name,
          mimeType: picked.mimeType,
        });
        setStatusMessage('Bukti transfer diunggah');
        await load();
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Gagal upload bukti',
        );
      } finally {
        setMutating(false);
      }
    },
    [load],
  );

  return {
    filter,
    setFilter,
    rows,
    loading,
    mutating,
    error,
    statusMessage,
    walletOptions,
    walletById,
    setWalletForRow: (id: string, walletId: string) => {
      setWalletById(prev => ({...prev, [id]: walletId}));
    },
    onRefresh: load,
    onReview,
    onPay,
    onUploadProof,
  };
}
