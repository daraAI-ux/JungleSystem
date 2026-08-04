import {useCallback, useEffect, useState} from 'react';
import {
  getKolamFinanceTaxSurfaceMode,
  KOLAM_DARA_TAX_DEFAULT_PERIOD,
  KOLAM_FINANCE_TAX_PROFILE_ROUTE,
  type KolamDaraTaxPeriod,
} from '../domain/kolam-finance-tax';
import {ApiError} from '../lib/api-error';
import {getKolamWebSetting} from '../services/kolam-api';
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

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (mode === 'dashboard') {
        const setting = await getKolamWebSetting();
        setTaxEnabled(setting.daraTaxEnabled !== false);
        setProfile(null);
        return;
      }
      const nextProfile = await getKolamTaxCompanyProfile();
      setProfile(nextProfile);
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
  }, [mode]);

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
    onRefresh: refresh,
  };
}

export {KOLAM_FINANCE_TAX_PROFILE_ROUTE};
