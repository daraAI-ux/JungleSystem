import {useCallback, useEffect, useState} from 'react';
import {
  getKolamFinanceTaxSurfaceMode,
  KOLAM_DARA_TAX_DEFAULT_PERIOD,
  KOLAM_FINANCE_TAX_PROFILE_ROUTE,
  type KolamDaraTaxPeriod,
} from '../domain/kolam-finance-tax';
import type {
  KolamDaraTaxDashboard,
  KolamDaraTaxOverviewSeries,
} from '../domain/kolam-dara-tax';
import {ApiError} from '../lib/api-error';
import {getKolamWebSetting} from '../services/kolam-api';
import {
  fetchKolamDaraTaxDashboard,
  fetchKolamDaraTaxOverviewSeries,
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
  onRefresh: () => Promise<void>;
}

export function useKolamFinanceTaxController(
  route: string,
): KolamFinanceTaxController {
  const mode = getKolamFinanceTaxSurfaceMode(route);
  const [profile, setProfile] = useState<KolamTaxCompanyProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [period, setPeriod] = useState<KolamDaraTaxPeriod>(
    KOLAM_DARA_TAX_DEFAULT_PERIOD,
  );
  const [dashboard, setDashboard] = useState<KolamDaraTaxDashboard | null>(
    null,
  );
  const [series, setSeries] = useState<KolamDaraTaxOverviewSeries | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (mode === 'dashboard') {
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
        return;
      }

      const nextProfile = await getKolamTaxCompanyProfile();
      setProfile(nextProfile);
      setDashboard(null);
      setSeries(null);
    } catch (err) {
      if (mode === 'tax-profile') {
        setProfile(null);
      }
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : mode === 'dashboard'
              ? 'Gagal memuat status DARA Tax'
              : 'Gagal memuat profil pajak',
      );
    } finally {
      setLoading(false);
    }
  }, [mode, period]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

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
    onRefresh: refresh,
  };
}

export {KOLAM_FINANCE_TAX_PROFILE_ROUTE};
