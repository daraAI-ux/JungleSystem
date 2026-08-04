import {useCallback, useEffect, useState} from 'react';
import {
  getKolamDaraMarketIntelTab,
  isKolamDaraMarketIntelRoute,
} from '../domain/kolam-dara-market-intel';
import {
  formatKolamDaraMarketPlatformFeeCheckNotice,
  type KolamDaraMarketPlatformFeeCalculation,
  type KolamDaraMarketPlatformFeeMeta,
  type KolamDaraMarketPlatformFeePanelTab,
  type KolamDaraMarketPlatformFeeProfile,
  type KolamDaraMarketPlatformFeePrograms,
  type KolamDaraMarketPlatformFeeSnapshot,
  type KolamDaraMarketPlatformFeeSource,
  type KolamDaraMarketPlatformFeeSummary,
  type KolamDaraMarketPlatformId,
} from '../domain/kolam-dara-market-platform-fee';
import {sanitizeApiErrorMessage} from '../lib/api-error';
import {
  addKolamDaraMarketPlatformFeeSource,
  approveKolamDaraMarketPlatformFeeSnapshot,
  checkKolamDaraMarketPlatformFeeSource,
  fetchKolamDaraMarketPlatformFeeCalculation,
  fetchKolamDaraMarketPlatformFeeMeta,
  fetchKolamDaraMarketPlatformFeeProfiles,
  fetchKolamDaraMarketPlatformFeeSnapshots,
  fetchKolamDaraMarketPlatformFeeSources,
  fetchKolamDaraMarketPlatformFeeSummary,
  rejectKolamDaraMarketPlatformFeeSnapshot,
  saveKolamDaraMarketPlatformFeeProfile,
} from '../services/kolam-dara-market-platform-fee-api';

export type KolamDaraMarketPlatformFeeScanProgress = {
  current: number;
  total: number;
  name: string;
};

export interface KolamDaraMarketPlatformFeeController {
  calculation: KolamDaraMarketPlatformFeeCalculation | null;
  calcLoading: boolean;
  discountInput: string;
  error: string | null;
  loading: boolean;
  meta: KolamDaraMarketPlatformFeeMeta | null;
  newName: string;
  newUrl: string;
  notice: string | null;
  panelTab: KolamDaraMarketPlatformFeePanelTab;
  priceInput: string;
  profiles: KolamDaraMarketPlatformFeeProfile[];
  qtyInput: string;
  scanAllProgress: KolamDaraMarketPlatformFeeScanProgress | null;
  scanningId: string | null;
  snapshots: KolamDaraMarketPlatformFeeSnapshot[];
  sources: KolamDaraMarketPlatformFeeSource[];
  summary: KolamDaraMarketPlatformFeeSummary | null;
  isScanning: boolean;
  onAddSource: () => Promise<void>;
  onApproveSnapshot: (id: string) => Promise<void>;
  onCheckAll: () => Promise<void>;
  onCheckOne: (id: string, name: string) => Promise<void>;
  onLoadCalculation: () => Promise<void>;
  onRefresh: () => Promise<void>;
  onRejectSnapshot: (id: string) => Promise<void>;
  onSaveProfile: (
    platform: KolamDaraMarketPlatformId,
    draft: {
      sellerTier: string;
      primaryCategoryId: string;
      primaryCategoryLabel: string;
      programs: KolamDaraMarketPlatformFeePrograms;
      notes: string;
    },
  ) => Promise<void>;
  onSetDiscountInput: (value: string) => void;
  onSetNewName: (value: string) => void;
  onSetNewUrl: (value: string) => void;
  onSetPanelTab: (tab: KolamDaraMarketPlatformFeePanelTab) => void;
  onSetPriceInput: (value: string) => void;
  onSetQtyInput: (value: string) => void;
}

export function useKolamDaraMarketPlatformFeeController(
  route: string,
): KolamDaraMarketPlatformFeeController {
  const enabled =
    isKolamDaraMarketIntelRoute(route) &&
    getKolamDaraMarketIntelTab(route) === 'peralatan';

  const [panelTab, setPanelTab] =
    useState<KolamDaraMarketPlatformFeePanelTab>('monitor');
  const [meta, setMeta] = useState<KolamDaraMarketPlatformFeeMeta | null>(null);
  const [profiles, setProfiles] = useState<KolamDaraMarketPlatformFeeProfile[]>(
    [],
  );
  const [sources, setSources] = useState<KolamDaraMarketPlatformFeeSource[]>([]);
  const [snapshots, setSnapshots] = useState<
    KolamDaraMarketPlatformFeeSnapshot[]
  >([]);
  const [summary, setSummary] =
    useState<KolamDaraMarketPlatformFeeSummary | null>(null);
  const [calculation, setCalculation] =
    useState<KolamDaraMarketPlatformFeeCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [calcLoading, setCalcLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [scanAllProgress, setScanAllProgress] =
    useState<KolamDaraMarketPlatformFeeScanProgress | null>(null);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [priceInput, setPriceInput] = useState('100000');
  const [discountInput, setDiscountInput] = useState('0');
  const [qtyInput, setQtyInput] = useState('1');

  const isScanning = scanningId != null || scanAllProgress != null;

  const onRefresh = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [m, p, s, sn, sum] = await Promise.all([
        fetchKolamDaraMarketPlatformFeeMeta(),
        fetchKolamDaraMarketPlatformFeeProfiles(),
        fetchKolamDaraMarketPlatformFeeSources(),
        fetchKolamDaraMarketPlatformFeeSnapshots({status: 'pending'}),
        fetchKolamDaraMarketPlatformFeeSummary().catch(() => null),
      ]);
      setMeta(m);
      setProfiles(p);
      setSources(s);
      setSnapshots(sn);
      setSummary(sum);
    } catch (err) {
      setError(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Gagal memuat monitor biaya platform',
      );
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void onRefresh();
  }, [enabled, onRefresh]);

  const onLoadCalculation = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setCalcLoading(true);
    setError(null);
    try {
      setCalculation(
        await fetchKolamDaraMarketPlatformFeeCalculation({
          samplePrice: Number(priceInput) || 0,
          sampleDiscount: Number(discountInput) || 0,
          sampleQty: Number(qtyInput) || 1,
        }),
      );
    } catch (err) {
      setError(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Gagal memuat kalkulasi fee',
      );
    } finally {
      setCalcLoading(false);
    }
  }, [discountInput, enabled, priceInput, qtyInput]);

  useEffect(() => {
    if (!enabled || panelTab !== 'kalkulasi') {
      return;
    }
    void onLoadCalculation();
  }, [enabled, onLoadCalculation, panelTab]);

  const runCheckOne = useCallback(
    async (id: string, sourceName: string, quiet?: boolean) => {
      setScanningId(id);
      try {
        const result = await checkKolamDaraMarketPlatformFeeSource(id);
        if (!quiet) {
          setNotice(
            formatKolamDaraMarketPlatformFeeCheckNotice(result, sourceName),
          );
        }
        return result;
      } finally {
        setScanningId(null);
      }
    },
    [],
  );

  const onCheckOne = useCallback(
    async (id: string, name: string) => {
      if (isScanning) {
        return;
      }
      setNotice(null);
      try {
        await runCheckOne(id, name);
        await onRefresh();
      } catch (err) {
        setNotice(
          err instanceof Error && err.message.trim()
            ? sanitizeApiErrorMessage(err.message)
            : 'Gagal cek sumber',
        );
      }
    },
    [isScanning, onRefresh, runCheckOne],
  );

  const onCheckAll = useCallback(async () => {
    if (isScanning) {
      return;
    }
    const active = sources.filter(source => source.isActive);
    if (!active.length) {
      setNotice('Tidak ada URL aktif untuk dipindai');
      return;
    }
    setNotice(null);
    let changed = 0;
    let errors = 0;
    for (let i = 0; i < active.length; i += 1) {
      const source = active[i];
      setScanAllProgress({
        current: i + 1,
        total: active.length,
        name: source.name,
      });
      try {
        const result = await runCheckOne(source.id, source.name, true);
        if (result.changed) {
          changed += 1;
        }
        if (result.error) {
          errors += 1;
        }
      } catch (err) {
        errors += 1;
        setNotice(
          err instanceof Error && err.message.trim()
            ? sanitizeApiErrorMessage(err.message)
            : `Gagal memindai ${source.name}`,
        );
      }
    }
    setScanAllProgress(null);
    setNotice(
      `Scan selesai — ${changed} berubah/draft baru${
        errors ? `, ${errors} gagal` : ''
      }`,
    );
    await onRefresh();
  }, [isScanning, onRefresh, runCheckOne, sources]);

  const onAddSource = useCallback(async () => {
    if (!newUrl.trim()) {
      setNotice('URL wajib diisi');
      return;
    }
    setNotice(null);
    try {
      await addKolamDaraMarketPlatformFeeSource({
        name: newName.trim() || newUrl.trim(),
        url: newUrl.trim(),
      });
      setNewName('');
      setNewUrl('');
      setNotice('URL sumber ditambahkan');
      await onRefresh();
    } catch (err) {
      setNotice(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Gagal menambah URL',
      );
    }
  }, [newName, newUrl, onRefresh]);

  const onSaveProfile = useCallback(
    async (
      platform: KolamDaraMarketPlatformId,
      draft: {
        sellerTier: string;
        primaryCategoryId: string;
        primaryCategoryLabel: string;
        programs: KolamDaraMarketPlatformFeePrograms;
        notes: string;
      },
    ) => {
      setNotice(null);
      try {
        await saveKolamDaraMarketPlatformFeeProfile(platform, draft);
        setNotice(`Profil ${platform} disimpan`);
        await onRefresh();
      } catch (err) {
        setNotice(
          err instanceof Error && err.message.trim()
            ? sanitizeApiErrorMessage(err.message)
            : 'Gagal menyimpan profil',
        );
      }
    },
    [onRefresh],
  );

  const onApproveSnapshot = useCallback(
    async (id: string) => {
      setNotice(null);
      try {
        await approveKolamDaraMarketPlatformFeeSnapshot(id);
        setNotice('Draft disetujui');
        await onRefresh();
      } catch (err) {
        setNotice(
          err instanceof Error && err.message.trim()
            ? sanitizeApiErrorMessage(err.message)
            : 'Gagal approve',
        );
      }
    },
    [onRefresh],
  );

  const onRejectSnapshot = useCallback(
    async (id: string) => {
      setNotice(null);
      try {
        await rejectKolamDaraMarketPlatformFeeSnapshot(id);
        setNotice('Draft ditolak');
        await onRefresh();
      } catch (err) {
        setNotice(
          err instanceof Error && err.message.trim()
            ? sanitizeApiErrorMessage(err.message)
            : 'Gagal tolak',
        );
      }
    },
    [onRefresh],
  );

  return {
    calculation,
    calcLoading,
    discountInput,
    error,
    loading,
    meta,
    newName,
    newUrl,
    notice,
    panelTab,
    priceInput,
    profiles,
    qtyInput,
    scanAllProgress,
    scanningId,
    snapshots,
    sources,
    summary,
    isScanning,
    onAddSource,
    onApproveSnapshot,
    onCheckAll,
    onCheckOne,
    onLoadCalculation,
    onRefresh,
    onRejectSnapshot,
    onSaveProfile,
    onSetDiscountInput: setDiscountInput,
    onSetNewName: setNewName,
    onSetNewUrl: setNewUrl,
    onSetPanelTab: setPanelTab,
    onSetPriceInput: setPriceInput,
    onSetQtyInput: setQtyInput,
  };
}
