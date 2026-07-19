import {appConfig} from '../config/app';

export type AuthSource = 'kolam' | 'pos' | 'am';

export interface AuthSourceDescriptor {
  id: AuthSource;
  label: string;
  bodySource: string;
  headerSource: string;
  description: string;
}

export interface AccessFlagSource {
  roleKey?: string;
  accessPos?: boolean;
  accessInventory?: boolean;
  accessAm?: boolean;
  accountRestricted?: boolean;
  resignedAt?: string | null;
}

export interface AccessScope {
  kolam: boolean;
  pos: boolean;
  am: boolean;
}

export const authSources: AuthSourceDescriptor[] = [
  {
    id: 'kolam',
    label: 'Kolam',
    bodySource: 'inventory',
    headerSource: appConfig.kolamSourceHeader,
    description: 'Inventory/Kolam access_inventory atau super administrator.',
  },
  {
    id: 'pos',
    label: 'POS',
    bodySource: 'pos',
    headerSource: appConfig.sourceHeader,
    description: 'POS access_pos atau role POS.',
  },
  {
    id: 'am',
    label: 'AM',
    bodySource: 'am',
    headerSource: appConfig.amSourceHeader,
    description: 'AM access_am melalui sesi Kolam staff.',
  },
];

export function getAuthSource(source: AuthSource): AuthSourceDescriptor {
  return authSources.find(item => item.id === source) ?? authSources[0];
}

export function getAccessScope(user: AccessFlagSource | null): AccessScope {
  if (!user || user.accountRestricted || user.resignedAt) {
    return {
      kolam: false,
      pos: false,
      am: false,
    };
  }

  const roleKey = normalizeRoleKey(user.roleKey);
  const isSuperAdmin = isSuperAdminRole(roleKey);

  return {
    kolam: isSuperAdmin || Boolean(user.accessInventory),
    pos: roleKey === 'pos' || Boolean(user.accessPos),
    am: isSuperAdmin || Boolean(user.accessAm),
  };
}

export function formatAccessScope(scope: AccessScope): string {
  const labels = [
    scope.kolam ? 'Kolam' : undefined,
    scope.pos ? 'POS' : undefined,
    scope.am ? 'AM' : undefined,
  ].filter(Boolean);

  return labels.length ? labels.join(' / ') : 'Tidak ada akses area';
}

function normalizeRoleKey(roleKey?: string) {
  return String(roleKey ?? '').toLowerCase();
}

function isSuperAdminRole(roleKey: string) {
  return (
    roleKey === 'super_administrator' ||
    roleKey === 'super_admin' ||
    roleKey === 'super-admin'
  );
}
