import { useCallback, useEffect, useState } from 'react';
import {
  getKolamFinanceTaxSurfaceMode,
  KOLAM_FINANCE_TAX_PROFILE_ROUTE,
} from '../domain/kolam-finance-tax';
import { ApiError } from '../lib/api-error';
import {
  getKolamTaxCompanyProfile,
  type KolamTaxCompanyProfile,
} from '../services/kolam-financial-settings-api';

export interface KolamFinanceTaxController {
  mode: ReturnType<typeof getKolamFinanceTaxSurfaceMode>;
  profile: KolamTaxCompanyProfile | null;
  loading: boolean;
  error: string;
  onRefresh: () => Promise<void>;
}

export function useKolamFinanceTaxController(
  route: string,
): KolamFinanceTaxController {
  const mode = getKolamFinanceTaxSurfaceMode(route);
  const [profile, setProfile] = useState<KolamTaxCompanyProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (mode !== 'tax-profile') {
      setProfile(null);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const nextProfile = await getKolamTaxCompanyProfile();
      setProfile(nextProfile);
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

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    mode,
    profile,
    loading,
    error,
    onRefresh: refresh,
  };
}

export { KOLAM_FINANCE_TAX_PROFILE_ROUTE };
