import {useCallback, useEffect, useState} from 'react';
import type {
  KolamDaraTaxAllocationBySource,
  KolamDaraTaxDashboard,
  KolamDaraTaxJournalPreview,
  KolamDaraTaxOverviewSeries,
  KolamDaraTaxSptPpnMasaPreview,
} from '../domain/kolam-dara-tax';
import {
  getKolamDaraTaxTab,
  getKolamFinanceTaxSurfaceMode,
  KOLAM_DARA_TAX_DEFAULT_PERIOD,
  KOLAM_FINANCE_TAX_PROFILE_ROUTE,
  type KolamDaraTaxPeriod,
} from '../domain/kolam-finance-tax';
import {ApiError} from '../lib/api-error';
import {getKolamWebSetting} from '../services/kolam-api';
import {
  fetchKolamDaraTaxAllocationBySource,
  fetchKolamDaraTaxDashboard,
  fetchKolamDaraTaxJournalPreview,
  fetchKolamDaraTaxOverviewSeries,
  fetchKolamDaraTaxSptPpnMasaPreview,
} from '../services/kolam-dara-tax-api';
import {
  getKolamTaxCompanyProfile,
  type KolamTaxCompanyProfile,
} from '../services/kolam-financial-settings-api';

export interface KolamFinanceTaxController {
  mode: ReturnType<typeof getKolamFinanceTaxSurfaceMode>;
  profile: KolamTaxCompanyProfile | null;
  loading: boolean;
  error: string;
  /** FE `daraTaxEnabled !== false` — default on when unset. */
  taxEnabled: boolean;
  period: KolamDaraTaxPeriod;
  onSetPeriod: (period: KolamDaraTaxPeriod) => void;
  dashboard: KolamDaraTaxDashboard | null;
  series: KolamDaraTaxOverviewSeries | null;
  allocation: KolamDaraTaxAllocationBySource | null;
  journal: KolamDaraTaxJournalPreview | null;
  sptPreview: KolamDaraTaxSptPpnMasaPreview | null;
  opsLoading: boolean;
  onRefresh: () => Promise<void>;
}

export function useKolamFinanceTaxController(
  route: string,
): KolamFinanceTaxController {
  const mode = getKolamFinanceTaxSurfaceMode(route);
  const selectedTab = getKolamDaraTaxTab(route);
  const [profile, setProfile] = useState<KolamTaxCompanyProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [opsLoading, setOpsLoading] = useState(false);
  const [error, setError] = useState('');
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [period, setPeriod] = useState<KolamDaraTaxPeriod>(
    KOLAM_DARA_TAX_DEFAULT_PERIOD,
  );
  const [dashboard, setDashboard] = useState<KolamDaraTaxDashboard | null>(
    null,
  );
  const [series, setSeries] = useState<KolamDaraTaxOverviewSeries | null>(null);
  const [allocation, setAllocation] =
    useState<KolamDaraTaxAllocationBySource | null>(null);
  const [journal, setJournal] = useState<KolamDaraTaxJournalPreview | null>(
    null,
  );
  const [sptPreview, setSptPreview] =
    useState<KolamDaraTaxSptPpnMasaPreview | null>(null);

  const loadCore = useCallback(async () => {
    if (mode !== 'dashboard') {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [settingSettled, dashSettled, seriesSettled] =
        await Promise.allSettled([
          getKolamWebSetting(),
          fetchKolamDaraTaxDashboard(period),
          fetchKolamDaraTaxOverviewSeries(6),
        ]);

      if (settingSettled.status === 'fulfilled') {
        setTaxEnabled(settingSettled.value.daraTaxEnabled !== false);
      }

      if (dashSettled.status === 'fulfilled') {
        setDashboard(dashSettled.value);
      } else {
        setDashboard(null);
        const reason = dashSettled.reason;
        setError(
          reason instanceof ApiError
            ? reason.message
            : reason instanceof Error
              ? reason.message
              : 'Dashboard pajak tidak dapat dimuat',
        );
      }

      if (seriesSettled.status === 'fulfilled') {
        setSeries(seriesSettled.value);
      } else {
        setSeries(null);
      }
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [mode, period]);

  const loadOperasional = useCallback(async () => {
    if (mode !== 'dashboard') {
      return;
    }
    setOpsLoading(true);
    try {
      const [allocRes, journalRes, sptRes] = await Promise.allSettled([
        fetchKolamDaraTaxAllocationBySource(period),
        fetchKolamDaraTaxJournalPreview(period),
        fetchKolamDaraTaxSptPpnMasaPreview(period),
      ]);
      setAllocation(allocRes.status === 'fulfilled' ? allocRes.value : null);
      setJournal(journalRes.status === 'fulfilled' ? journalRes.value : null);
      setSptPreview(sptRes.status === 'fulfilled' ? sptRes.value : null);
    } finally {
      setOpsLoading(false);
    }
  }, [mode, period]);

  const loadProfile = useCallback(async () => {
    if (mode !== 'tax-profile') {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const nextProfile = await getKolamTaxCompanyProfile();
      setProfile(nextProfile);
      setDashboard(null);
      setSeries(null);
      setAllocation(null);
      setJournal(null);
      setSptPreview(null);
    } catch (err) {
      setProfile(null);
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Gagal memuat profil pajak',
      );
    } finally {
      setLoading(false);
    }
  }, [mode]);

  const onRefresh = useCallback(async () => {
    if (mode === 'tax-profile') {
      await loadProfile();
      return;
    }
    await loadCore();
    if (selectedTab === 'operasional') {
      await loadOperasional();
    }
  }, [loadCore, loadOperasional, loadProfile, mode, selectedTab]);

  useEffect(() => {
    if (mode === 'tax-profile') {
      void loadProfile();
      return;
    }
    void loadCore();
  }, [loadCore, loadProfile, mode]);

  useEffect(() => {
    if (mode !== 'dashboard' || selectedTab !== 'operasional') {
      return;
    }
    void loadOperasional();
  }, [loadOperasional, mode, selectedTab]);

  return {
    mode,
    profile,
    loading,
    error,
    taxEnabled,
    period,
    onSetPeriod: setPeriod,
    dashboard,
    series,
    allocation,
    journal,
    sptPreview,
    opsLoading,
    onRefresh,
  };
}

export {KOLAM_FINANCE_TAX_PROFILE_ROUTE};
