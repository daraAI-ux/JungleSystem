import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  getKolamDaraMarketIntelTab,
  isKolamDaraMarketIntelRoute,
} from '../domain/kolam-dara-market-intel';
import {
  buildKolamDaraPricingEquipmentConsoleLines,
  getKolamDaraPricingEquipmentProgressPercent,
  isKolamDaraPricingEquipmentJobActive,
  type KolamDaraPricingEquipmentJobPoll,
  type KolamDaraPricingEquipmentPreview,
  type KolamDaraPricingMarketplaceMode,
  type KolamDaraPricingMarkupType,
} from '../domain/kolam-dara-pricing-equipment';
import {sanitizeApiErrorMessage} from '../lib/api-error';
import {
  fetchKolamDaraPricingEquipmentJob,
  previewKolamDaraPricingEquipment,
  startKolamDaraPricingEquipmentJob,
} from '../services/kolam-dara-pricing-equipment-api';

const POLL_MS = 2000;

export interface KolamDaraPricingEquipmentController {
  activeJob: KolamDaraPricingEquipmentJobPoll | null;
  consoleLines: string[];
  includeProducts: boolean;
  includeSpecies: boolean;
  loadingPreview: boolean;
  marketplaceMode: KolamDaraPricingMarketplaceMode;
  markupType: KolamDaraPricingMarkupType;
  markupValue: string;
  notice: string | null;
  preview: KolamDaraPricingEquipmentPreview | null;
  previewOp: 'kolam' | 'marketplace_db' | null;
  previewRows: KolamDaraPricingEquipmentPreview['rows'];
  progressPct: number;
  runningOp: string | null;
  onPreview: (operation: 'kolam' | 'marketplace_db') => Promise<void>;
  onPushPreviewNotice: () => void;
  onRun: (
    operation: 'kolam' | 'marketplace_db' | 'push_olshop',
    opts?: {pushPlatform?: 'tokopedia' | 'shopee'},
  ) => Promise<void>;
  onSetIncludeProducts: (value: boolean) => void;
  onSetIncludeSpecies: (value: boolean) => void;
  onSetMarketplaceMode: (value: KolamDaraPricingMarketplaceMode) => void;
  onSetMarkupType: (value: KolamDaraPricingMarkupType) => void;
  onSetMarkupValue: (value: string) => void;
}

export function useKolamDaraPricingEquipmentController(
  route: string,
  enabledExtra = true,
): KolamDaraPricingEquipmentController {
  const enabled =
    enabledExtra &&
    isKolamDaraMarketIntelRoute(route) &&
    getKolamDaraMarketIntelTab(route) === 'peralatan';

  const [markupType, setMarkupType] =
    useState<KolamDaraPricingMarkupType>('percent');
  const [markupValue, setMarkupValue] = useState('15');
  const [marketplaceMode, setMarketplaceMode] =
    useState<KolamDaraPricingMarketplaceMode>('markup_online');
  const [includeProducts, setIncludeProducts] = useState(true);
  const [includeSpecies, setIncludeSpecies] = useState(true);
  const [preview, setPreview] =
    useState<KolamDaraPricingEquipmentPreview | null>(null);
  const [previewOp, setPreviewOp] = useState<'kolam' | 'marketplace_db' | null>(
    null,
  );
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeJob, setActiveJob] =
    useState<KolamDaraPricingEquipmentJobPoll | null>(null);
  const [runningOp, setRunningOp] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const pollCancelledRef = useRef(false);

  const baseParams = useMemo(
    () => ({
      markupType,
      markupValue: Number(markupValue) || 0,
      marketplaceMode,
      includeProducts,
      includeSpecies,
    }),
    [
      includeProducts,
      includeSpecies,
      marketplaceMode,
      markupType,
      markupValue,
    ],
  );

  const pollJob = useCallback(async (jobId: string) => {
    try {
      const job = await fetchKolamDaraPricingEquipmentJob(jobId);
      setActiveJob(job);
      if (isKolamDaraPricingEquipmentJobActive(job.status)) {
        return false;
      }
      setRunningOp(null);
      if (job.status === 'completed') {
        setNotice('Proses bulk harga selesai');
      } else {
        setNotice(job.error || 'Proses gagal');
      }
      return true;
    } catch (err) {
      setNotice(
        err instanceof Error && err.message.trim()
          ? sanitizeApiErrorMessage(err.message)
          : 'Gagal memuat status job',
      );
      setRunningOp(null);
      return true;
    }
  }, []);

  useEffect(() => {
    if (!enabled || !activeJobId) {
      return undefined;
    }
    pollCancelledRef.current = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const tick = async () => {
      const done = await pollJob(activeJobId);
      if (!pollCancelledRef.current && !done) {
        timer = setTimeout(tick, POLL_MS);
      }
    };
    void tick();
    return () => {
      pollCancelledRef.current = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [activeJobId, enabled, pollJob]);

  const onPreview = useCallback(
    async (operation: 'kolam' | 'marketplace_db') => {
      if (!enabled) {
        return;
      }
      setLoadingPreview(true);
      setPreviewOp(operation);
      setNotice(null);
      try {
        const data = await previewKolamDaraPricingEquipment({
          operation,
          ...baseParams,
        });
        setPreview(data);
        setNotice(
          `Preview: ${data.applicable} siap diubah, ${data.skipped} dilewati`,
        );
      } catch (err) {
        setPreview(null);
        setNotice(
          err instanceof Error && err.message.trim()
            ? sanitizeApiErrorMessage(err.message)
            : 'Gagal preview',
        );
      } finally {
        setLoadingPreview(false);
      }
    },
    [baseParams, enabled],
  );

  const onRun = useCallback(
    async (
      operation: 'kolam' | 'marketplace_db' | 'push_olshop',
      opts?: {pushPlatform?: 'tokopedia' | 'shopee'},
    ) => {
      if (!enabled) {
        return;
      }
      if (runningOp) {
        setNotice('Masih ada proses berjalan');
        return;
      }
      const pushPlatform = opts?.pushPlatform ?? 'tokopedia';
      const runningKey =
        operation === 'push_olshop'
          ? `push_olshop_${pushPlatform}`
          : operation;
      setNotice(null);
      try {
        const params =
          operation === 'push_olshop'
            ? {...baseParams, platforms: [pushPlatform]}
            : baseParams;
        const label =
          operation === 'push_olshop'
            ? pushPlatform === 'shopee'
              ? 'DARA Peralatan — push ke Shopee'
              : 'DARA Peralatan — push ke Tokopedia'
            : undefined;
        const {jobId} = await startKolamDaraPricingEquipmentJob({
          operation,
          params,
          label,
        });
        setActiveJobId(jobId);
        setRunningOp(runningKey);
        setActiveJob(null);
        setNotice('Proses dimulai — pantau progress di bawah');
      } catch (err) {
        setNotice(
          err instanceof Error && err.message.trim()
            ? sanitizeApiErrorMessage(err.message)
            : 'Gagal memulai proses',
        );
      }
    },
    [baseParams, enabled, runningOp],
  );

  const previewRows = useMemo(
    () => (preview?.rows.filter(row => !row.skip).slice(0, 25) ?? []),
    [preview],
  );

  return {
    activeJob,
    consoleLines: buildKolamDaraPricingEquipmentConsoleLines(activeJob),
    includeProducts,
    includeSpecies,
    loadingPreview,
    marketplaceMode,
    markupType,
    markupValue,
    notice,
    preview,
    previewOp,
    previewRows,
    progressPct: getKolamDaraPricingEquipmentProgressPercent(activeJob),
    runningOp,
    onPreview,
    onPushPreviewNotice: () => {
      setNotice('Operasi push langsung — tidak perlu preview');
    },
    onRun,
    onSetIncludeProducts: setIncludeProducts,
    onSetIncludeSpecies: setIncludeSpecies,
    onSetMarketplaceMode: setMarketplaceMode,
    onSetMarkupType: setMarkupType,
    onSetMarkupValue: setMarkupValue,
  };
}
