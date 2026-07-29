import {
  hasSettingsPermission,
  isSettingsAdminRoleKey,
  isSettingsSuperAdminRoleKey,
  type SettingsTabVisibilityContext,
} from './settings-surface';

export interface KolamTaxPartyProfileFormState {
  npwp: string;
  npwp16: string;
  legalName: string;
}

export function createEmptyKolamTaxPartyProfileFormState(
  legalName = '',
): KolamTaxPartyProfileFormState {
  return {
    npwp: '',
    npwp16: '',
    legalName,
  };
}

export function hasKolamTaxPartyNpwp(form: KolamTaxPartyProfileFormState) {
  const npwp = form.npwp.replace(/\D/g, '');
  const npwp16 = form.npwp16.replace(/\D/g, '');
  return npwp.length === 15 || npwp16.length === 16;
}

/** Mirror FE TaxPartyProfileCard canEdit (tax:draft / admin / super-admin). */
export function canEditKolamTaxPartyProfile(
  context: SettingsTabVisibilityContext | null | undefined,
) {
  if (isSettingsSuperAdminRoleKey(String(context?.roleKey ?? ''))) {
    return true;
  }
  if (isSettingsAdminRoleKey(context?.roleKey)) {
    return true;
  }
  return (
    hasSettingsPermission(context, 'tax', 'draft') ||
    hasSettingsPermission(context, 'tax', '*') ||
    hasSettingsPermission(context, '*', '*')
  );
}
