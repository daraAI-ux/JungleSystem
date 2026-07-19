import type {SyncActivityEntry} from './sync-activity';

export interface SettingsSurfaceItem {
  id: 'web-settings' | 'role-management' | 'activity-log';
  title: string;
  route: string;
  description: string;
  status: 'native-summary' | 'source-audit' | 'planned';
  badge: string;
}

export interface SettingsDetailRow {
  id: string;
  label: string;
  value: string;
  meta: string;
  tone: 'default' | 'success' | 'warning' | 'danger';
}

export interface SettingsDescriptionListVisualContract {
  sourceComponent: 'components/ui/description-list.tsx';
  layout: 'term-detail-grid';
  desktopColumns: 'min(50%, calc(var(--spacing)*80)) auto';
  termTone: 'muted';
  rowBorder: 'top-except-first';
  textScale: 'text-sm/6';
}

export interface SettingsSwitchVisualContract {
  sourceComponent: 'components/ui/switch.tsx';
  role: 'switch';
  trackShape: 'rounded-pill';
  trackSize: 'w-8 h-5 sm';
  trackWidth: 32;
  trackHeight: 20;
  trackPadding: 3;
  knobShape: 'rounded-full';
  knobSize: 14;
  selectedMotion: 'translate-x-3';
  selectedTranslateX: 12;
  offTone: 'secondary with fg/5 inset ring';
  selectedTone: 'primary';
  focusTreatment: 'primary/10 bg with ring/20';
  knobTreatment: 'white shadow-sm fg/5 ring';
  disabledOpacity: 0.5;
}

export interface SettingsPaginationVisualContract {
  sourceComponent: 'components/ui/pagination.tsx';
  ariaLabel: 'pagination';
  layout: 'centered-horizontal-list';
  itemSize: 'h-9 min-w-10';
  itemHeight: 36;
  itemMinWidth: 40;
  gap: '5px';
  gapPx: 5;
  itemIntent: 'outline';
  defaultIntent: 'plain';
  currentState: 'aria-current-page-disabled';
  currentOpacity: 1;
  textTreatment: 'font-normal tabular-nums';
  focusTreatment: 'primary border primary/10 bg ring/20';
  iconSegments: Array<'previous' | 'next'>;
}

export interface SettingsActivityLogPagination {
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  from: number;
  to: number;
  hasPrevious: boolean;
  hasNext: boolean;
  pages: number[];
}

export type SettingsActivityLogFilterControlId =
  | 'search'
  | 'type'
  | 'status'
  | 'method'
  | 'source'
  | 'suspicious';

export interface SettingsActivityLogFilterControl {
  id: SettingsActivityLogFilterControlId;
  label: string;
  control: 'search' | 'select';
  triggerWidth: 'min-w-32' | 'min-w-40' | 'min-w-64';
  placeholder?: string;
  options?: Array<{
    id: string;
    label: string;
  }>;
  sourceComponent: 'settings/activity-log/activity-log-list.tsx';
}

export interface SettingsActivityLogFilterVisualContract {
  sourceComponent: 'settings/activity-log/activity-log-list.tsx';
  searchComponent: 'components/ui/search-field.tsx';
  selectComponent: 'components/ui/select.tsx';
  refreshComponent: 'components/ui/button.tsx';
  layoutClass: 'mt-4 flex flex-wrap items-center gap-2';
  layout: 'wrapped-row';
  gapPx: 8;
  marginTopPx: 16;
  controlHeight: 36;
  searchMinWidth: 256;
  selectMinWidth: 128;
  selectWideMinWidth: 160;
  triggerShape: 'rounded-lg';
  triggerTone: 'bg with input inset ring';
  focusTreatment: 'ring/10 bg with ring-3 ring/20';
  textTreatment: 'sm:text-sm/6 normal-weight';
  searchIcon: 'IconSearch';
  selectChevron: 'IconChevronsY';
  refreshButton: 'outline sm with IconRefresh';
  visibleSelectLabel: false;
}

export type SettingsActivityLogColumnId =
  | 'timestamp'
  | 'user'
  | 'source'
  | 'type'
  | 'method'
  | 'path'
  | 'ip'
  | 'status'
  | 'duration'
  | 'detail';

export interface SettingsActivityLogTableColumn {
  id: SettingsActivityLogColumnId;
  label: string;
  width: number | 'flex';
  isRowHeader: boolean;
  sourceComponent: 'settings/activity-log/activity-log-list.tsx';
}

export interface SettingsActivityLogDetailField {
  id:
    | 'timestamp'
    | 'user'
    | 'source'
    | 'type'
    | 'method'
    | 'path'
    | 'ip'
    | 'user-agent'
    | 'status'
    | 'duration'
    | 'action';
  label: string;
  value: string;
  mono: boolean;
  sourceComponent: 'settings/activity-log/activity-log-list.tsx';
}

export type SettingsRoleEditorActionId =
  | 'create-role'
  | 'update-role'
  | 'delete-role';

export interface SettingsRoleEditorAction {
  id: SettingsRoleEditorActionId;
  label: string;
  method: 'POST' | 'PUT' | 'DELETE';
  path: string;
  intent: 'outline' | 'danger';
  disabled: boolean;
  disabledReason?: string;
  sourceComponent: 'settings/roles/create-roles.tsx' | 'settings/roles/list.tsx';
}

export interface SettingsRolePermissionPreviewRow {
  id: string;
  resource: 'role' | 'websetting' | 'activity-log';
  label: string;
  actions: string[];
  source: 'lib/permissions/resource-actions.ts';
}

export interface SettingsRoleResourceGroup {
  id: string;
  label: string;
  resources: string[];
  sourceComponent: 'settings/roles/list.tsx';
}

export interface SettingsRolePermissionMatrixAction {
  id: string;
  label: string;
  selected: boolean;
  disabled: boolean;
}

export interface SettingsRolePermissionMatrixRow {
  id: string;
  resource: 'role' | 'websetting' | 'activity-log';
  label: string;
  activeCount: number;
  totalCount: number;
  tone: 'success' | 'warning' | 'muted';
  actions: SettingsRolePermissionMatrixAction[];
  source: 'lib/permissions/resource-actions.ts';
}

export interface SettingsRolePermissionMatrixGroup {
  id: string;
  label: string;
  resourceCount: number;
  activeCount: number;
  totalPossible: number;
  expanded: boolean;
  rows: SettingsRolePermissionMatrixRow[];
  sourceComponent: 'settings/roles/list.tsx';
}

export interface SettingsRoleTabItem {
  id: string;
  label: string;
  key: string;
  permissionCount: number;
  defaultRole: boolean;
  fullAccess: boolean;
  sourceComponent: 'settings/roles/list.tsx';
}

export interface SettingsRoleInfoPanel {
  id: string;
  name: string;
  description: string;
  key: string;
  badges: Array<{
    id: 'full-access' | 'default';
    label: string;
    tone: 'warning' | 'secondary';
  }>;
  canDelete: boolean;
  deleteLabel: 'Delete';
  notice?: string;
  sourceComponent: 'settings/roles/list.tsx';
}

export interface SettingsRoleMemberPreview {
  roleId: string;
  label: string;
  count: number;
  members: Array<{
    id: string;
    name: string;
    initials: string;
  }>;
  sourceComponent: 'settings/roles/list.tsx';
}

export interface SettingsActivityLogRow {
  id: string;
  timestamp: string;
  user: string;
  source: string;
  type: 'api' | 'page';
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | '-';
  path: string;
  ip: string;
  status: string;
  statusCode: string;
  duration: string;
  event: string;
  suspicious: string[];
  tone: 'success' | 'warning' | 'muted';
}

export interface SettingsActivityLogStatsCard {
  id: 'window' | 'events' | 'success' | 'attention';
  label: string;
  value: string;
  detail: string;
  tone: 'default' | 'success' | 'warning' | 'muted';
  sourceEndpoint: '/activity-log/stats';
  backendField: 'days' | 'byType' | 'byStatus' | 'topPaths';
}

export interface SettingsRoleAccessRow {
  id: string;
  role: string;
  key: string;
  kolam: boolean;
  pos: boolean;
  am: boolean;
  meta: string;
  defaultRole: boolean;
}

export interface SettingsWebConfigField {
  id: 'storefront-title' | 'storefront-status' | 'maintenance-mode';
  label: string;
  value: string;
  description: string;
  control: 'text' | 'toggle';
}

export interface SettingsWebFormField {
  id: string;
  label: string;
  placeholder: string;
  control: 'text' | 'textarea' | 'switch' | 'file';
  value: string;
  required: boolean;
}

export interface SettingsWebFormSection {
  id:
    | 'version'
    | 'logo'
    | 'company-info'
    | 'contact-info'
    | 'address'
    | 'shipping-origin'
    | 'social-media'
    | 'maintenance-mode';
  title: string;
  description: string;
  layout: 'single' | 'grid-2' | 'stack';
  fields: SettingsWebFormField[];
  sourceComponent: 'settings/websetting/websetting-page.tsx';
}

export interface SettingsLiveEndpoint {
  id: string;
  label: string;
  method: 'GET' | 'PUT' | 'POST' | 'DELETE';
  path: string;
  permission: string;
  status: 'wired' | 'read-only' | 'planned';
}

export const settingsSurfaceItems: SettingsSurfaceItem[] = [
  {
    id: 'web-settings',
    title: 'Web Settings',
    route: '/settings/websetting',
    description: 'Display, web storefront, and general Kolam configuration.',
    status: 'source-audit',
    badge: 'Config',
  },
  {
    id: 'role-management',
    title: 'Role Management',
    route: '/settings/roles',
    description: 'Role access, permission groups, and staff capability review.',
    status: 'source-audit',
    badge: 'Access',
  },
  {
    id: 'activity-log',
    title: 'Activity Log',
    route: '/settings/activity-log',
    description: 'Audit trail for user activity, navigation, and API changes.',
    status: 'native-summary',
    badge: 'Audit',
  },
];

export function getSettingsSurfaceStats(items = settingsSurfaceItems) {
  return {
    total: items.length,
    nativeSummary: items.filter(item => item.status === 'native-summary')
      .length,
    sourceAudit: items.filter(item => item.status === 'source-audit').length,
    planned: items.filter(item => item.status === 'planned').length,
  };
}

export function getSettingsSurfaceItemByRoute(route: string) {
  return settingsSurfaceItems.find(item => item.route === route) ?? null;
}

export function getSettingsDetailRows(
  surfaceId: SettingsSurfaceItem['id'],
): SettingsDetailRow[] {
  if (surfaceId === 'web-settings') {
    return [
      {
        id: 'storefront',
        label: 'Storefront display',
        value: 'Live contract',
        meta: 'Uses /websetting and /websetting/version from Kolam backend',
        tone: 'success',
      },
      {
        id: 'kolam-header',
        label: 'Kolam header and navigation',
        value: 'Native shell',
        meta: 'Top nav, sidebar, command palette, and avatar menu are native',
        tone: 'success',
      },
      {
        id: 'runtime-config',
        label: 'Runtime API config',
        value: 'Session panel',
        meta: 'Existing AM server URL and source-aware sync live in native session controls',
        tone: 'success',
      },
    ];
  }

  if (surfaceId === 'role-management') {
    return [
      {
        id: 'kolam-access',
        label: 'Kolam access',
        value: 'access_inventory',
        meta: 'Unlocks inventory, finance, settings, and plugin host review',
        tone: 'success',
      },
      {
        id: 'pos-access',
        label: 'POS access',
        value: 'access_pos / role POS',
        meta: 'Unlocks checkout, catalog, sales, customer, wallet, and cashflow',
        tone: 'success',
      },
      {
        id: 'am-access',
        label: 'AM access',
        value: 'access_am',
        meta: 'Unlocks automation dashboard and workflow review',
        tone: 'warning',
      },
    ];
  }

  return [
    {
      id: 'sync-audit',
      label: 'Sync activity',
      value: 'Native log',
      meta: 'POS, Kolam, and AM sync state is recorded in the shell activity panel',
      tone: 'success',
    },
    {
      id: 'runtime-actions',
      label: 'Runtime actions',
      value: 'Command trace',
      meta: 'Native action strip records source contract and access requirement',
      tone: 'success',
    },
    {
      id: 'backend-audit',
      label: 'Backend activity detail',
      value: 'Live contract',
      meta: 'Maps /activity-log and /activity-log/stats from Kolam backend',
      tone: 'success',
    },
  ];
}

export function getSettingsDescriptionListVisualContract(): SettingsDescriptionListVisualContract {
  return {
    sourceComponent: 'components/ui/description-list.tsx',
    layout: 'term-detail-grid',
    desktopColumns: 'min(50%, calc(var(--spacing)*80)) auto',
    termTone: 'muted',
    rowBorder: 'top-except-first',
    textScale: 'text-sm/6',
  };
}

export function getSettingsSwitchVisualContract(): SettingsSwitchVisualContract {
  return {
    sourceComponent: 'components/ui/switch.tsx',
    role: 'switch',
    trackShape: 'rounded-pill',
    trackSize: 'w-8 h-5 sm',
    trackWidth: 32,
    trackHeight: 20,
    trackPadding: 3,
    knobShape: 'rounded-full',
    knobSize: 14,
    selectedMotion: 'translate-x-3',
    selectedTranslateX: 12,
    offTone: 'secondary with fg/5 inset ring',
    selectedTone: 'primary',
    focusTreatment: 'primary/10 bg with ring/20',
    knobTreatment: 'white shadow-sm fg/5 ring',
    disabledOpacity: 0.5,
  };
}

export function getSettingsPaginationVisualContract(): SettingsPaginationVisualContract {
  return {
    sourceComponent: 'components/ui/pagination.tsx',
    ariaLabel: 'pagination',
    layout: 'centered-horizontal-list',
    itemSize: 'h-9 min-w-10',
    itemHeight: 36,
    itemMinWidth: 40,
    gap: '5px',
    gapPx: 5,
    itemIntent: 'outline',
    defaultIntent: 'plain',
    currentState: 'aria-current-page-disabled',
    currentOpacity: 1,
    textTreatment: 'font-normal tabular-nums',
    focusTreatment: 'primary border primary/10 bg ring/20',
    iconSegments: ['previous', 'next'],
  };
}

export function getSettingsActivityLogFilterVisualContract(): SettingsActivityLogFilterVisualContract {
  return {
    sourceComponent: 'settings/activity-log/activity-log-list.tsx',
    searchComponent: 'components/ui/search-field.tsx',
    selectComponent: 'components/ui/select.tsx',
    refreshComponent: 'components/ui/button.tsx',
    layoutClass: 'mt-4 flex flex-wrap items-center gap-2',
    layout: 'wrapped-row',
    gapPx: 8,
    marginTopPx: 16,
    controlHeight: 36,
    searchMinWidth: 256,
    selectMinWidth: 128,
    selectWideMinWidth: 160,
    triggerShape: 'rounded-lg',
    triggerTone: 'bg with input inset ring',
    focusTreatment: 'ring/10 bg with ring-3 ring/20',
    textTreatment: 'sm:text-sm/6 normal-weight',
    searchIcon: 'IconSearch',
    selectChevron: 'IconChevronsY',
    refreshButton: 'outline sm with IconRefresh',
    visibleSelectLabel: false,
  };
}

export function getSettingsActivityLogRows(
  entries: SyncActivityEntry[],
  limit = 6,
  page = 1,
): SettingsActivityLogRow[] {
  const safeLimit = Math.max(1, limit);
  const offset = (Math.max(1, page) - 1) * safeLimit;

  return entries.slice(offset, offset + safeLimit).map(entry => ({
    id: entry.id,
    timestamp: entry.timestamp,
    user: 'native-shell',
    source: getActivityLogSource(entry.area),
    type: 'api',
    method: getActivityLogMethod(entry.status),
    path: getActivityLogPath(entry.area),
    ip: '-',
    event: entry.detail,
    status: entry.status,
    statusCode: getActivityLogStatusCode(entry.status),
    duration: entry.status === 'live' ? '< 1s' : '-',
    suspicious: entry.tone === 'warning' ? ['sync_fallback'] : [],
    tone: entry.tone,
  }));
}

export function getSettingsActivityLogTableColumns(): SettingsActivityLogTableColumn[] {
  const columns: Array<Omit<SettingsActivityLogTableColumn, 'sourceComponent'>> = [
    {id: 'timestamp', label: 'Waktu', width: 92, isRowHeader: false},
    {id: 'user', label: 'User', width: 112, isRowHeader: false},
    {id: 'source', label: 'Source', width: 84, isRowHeader: false},
    {id: 'type', label: 'Tipe', width: 68, isRowHeader: false},
    {id: 'method', label: 'Method', width: 78, isRowHeader: false},
    {id: 'path', label: 'Path', width: 'flex', isRowHeader: true},
    {id: 'ip', label: 'IP', width: 72, isRowHeader: false},
    {id: 'status', label: 'Status', width: 78, isRowHeader: false},
    {id: 'duration', label: 'Durasi', width: 68, isRowHeader: false},
    {id: 'detail', label: '', width: 36, isRowHeader: false},
  ];

  return columns.map(column => ({
    ...column,
    sourceComponent: 'settings/activity-log/activity-log-list.tsx' as const,
  }));
}

export function getSettingsActivityLogDetailFields(
  row: SettingsActivityLogRow,
): SettingsActivityLogDetailField[] {
  const fields: Array<Omit<SettingsActivityLogDetailField, 'sourceComponent'>> = [
    {id: 'timestamp', label: 'Timestamp', value: row.timestamp, mono: false},
    {id: 'user', label: 'User', value: row.user, mono: false},
    {id: 'source', label: 'Source', value: row.source || '-', mono: false},
    {id: 'type', label: 'Type', value: row.type, mono: false},
    {id: 'method', label: 'Method', value: row.method, mono: false},
    {id: 'path', label: 'Path', value: row.path, mono: true},
    {id: 'ip', label: 'IP', value: row.ip || '-', mono: true},
    {
      id: 'user-agent',
      label: 'User Agent',
      value: 'React Native Windows shell',
      mono: false,
    },
    {
      id: 'status',
      label: 'Status',
      value: `${row.statusCode} (${row.status})`,
      mono: false,
    },
    {id: 'duration', label: 'Duration', value: row.duration, mono: false},
    {
      id: 'action',
      label: 'Action',
      value: 'sync_activity_preview',
      mono: true,
    },
  ];

  return fields.map(field => ({
    ...field,
    sourceComponent: 'settings/activity-log/activity-log-list.tsx' as const,
  }));
}

function getActivityLogSource(area: SyncActivityEntry['area']) {
  if (area === 'kolam') {
    return 'Kolam';
  }

  return area;
}

function getActivityLogMethod(status: SyncActivityEntry['status']) {
  return status === 'disabled' ? '-' : 'GET';
}

function getActivityLogPath(area: SyncActivityEntry['area']) {
  if (area === 'pos') {
    return '/products?sellable=true';
  }

  if (area === 'kolam') {
    return '/dashboard/sales-graph';
  }

  return '/dashboard';
}

function getActivityLogStatusCode(status: SyncActivityEntry['status']) {
  if (status === 'live') {
    return '200';
  }

  if (status === 'fallback') {
    return '503';
  }

  if (status === 'disabled') {
    return '-';
  }

  return 'seed';
}

export function getSettingsActivityLogPagination(
  total: number,
  page = 1,
  pageSize = 6,
): SettingsActivityLogPagination {
  const safeTotal = Math.max(0, total);
  const safePageSize = Math.max(1, pageSize);
  const pageCount = Math.max(1, Math.ceil(safeTotal / safePageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const from = safeTotal === 0 ? 0 : (safePage - 1) * safePageSize + 1;
  const to = Math.min(safeTotal, safePage * safePageSize);

  return {
    total: safeTotal,
    page: safePage,
    pageSize: safePageSize,
    pageCount,
    from,
    to,
    hasPrevious: safePage > 1,
    hasNext: safePage < pageCount,
    pages: Array.from({length: pageCount}, (_, index) => index + 1),
  };
}

export function getSettingsActivityLogStatsCards(
  entries: SyncActivityEntry[],
  days = 7,
): SettingsActivityLogStatsCard[] {
  const successCount = entries.filter(entry => entry.tone === 'success').length;
  const attentionCount = entries.filter(entry => entry.tone === 'warning').length;

  return [
    {
      id: 'window',
      label: 'Window',
      value: `${days}d`,
      detail: 'Backend stats window',
      tone: 'muted',
      sourceEndpoint: '/activity-log/stats',
      backendField: 'days',
    },
    {
      id: 'events',
      label: 'Events',
      value: entries.length.toString(),
      detail: 'Native sync rows as preview',
      tone: 'default',
      sourceEndpoint: '/activity-log/stats',
      backendField: 'byType',
    },
    {
      id: 'success',
      label: 'Success',
      value: successCount.toString(),
      detail: 'Mapped to backend byStatus',
      tone: 'success',
      sourceEndpoint: '/activity-log/stats',
      backendField: 'byStatus',
    },
    {
      id: 'attention',
      label: 'Attention',
      value: attentionCount.toString(),
      detail: 'Warnings until full API detail',
      tone: attentionCount > 0 ? 'warning' : 'muted',
      sourceEndpoint: '/activity-log/stats',
      backendField: 'topPaths',
    },
  ];
}

export function getSettingsActivityLogFilterControls(): SettingsActivityLogFilterControl[] {
  return [
    {
      id: 'search',
      label: 'Cari',
      control: 'search',
      triggerWidth: 'min-w-64',
      placeholder: 'Cari path atau IP...',
      sourceComponent: 'settings/activity-log/activity-log-list.tsx',
    },
    {
      id: 'type',
      label: 'Type',
      control: 'select',
      triggerWidth: 'min-w-32',
      options: [
        {id: '', label: 'Semua tipe'},
        {id: 'api', label: 'API'},
        {id: 'page', label: 'Page'},
      ],
      sourceComponent: 'settings/activity-log/activity-log-list.tsx',
    },
    {
      id: 'status',
      label: 'Status',
      control: 'select',
      triggerWidth: 'min-w-32',
      options: [
        {id: '', label: 'Semua status'},
        {id: 'success', label: 'Success'},
        {id: 'failed', label: 'Failed'},
      ],
      sourceComponent: 'settings/activity-log/activity-log-list.tsx',
    },
    {
      id: 'method',
      label: 'Method',
      control: 'select',
      triggerWidth: 'min-w-32',
      options: [
        {id: '', label: 'Semua method'},
        {id: 'GET', label: 'GET'},
        {id: 'POST', label: 'POST'},
        {id: 'PUT', label: 'PUT'},
        {id: 'PATCH', label: 'PATCH'},
        {id: 'DELETE', label: 'DELETE'},
      ],
      sourceComponent: 'settings/activity-log/activity-log-list.tsx',
    },
    {
      id: 'source',
      label: 'Source',
      control: 'select',
      triggerWidth: 'min-w-32',
      options: [
        {id: '', label: 'Semua source'},
        {id: 'Kolam', label: 'Kolam (admin)'},
        {id: 'pos', label: 'POS'},
        {id: 'store', label: 'Store'},
      ],
      sourceComponent: 'settings/activity-log/activity-log-list.tsx',
    },
    {
      id: 'suspicious',
      label: 'Suspicious',
      control: 'select',
      triggerWidth: 'min-w-40',
      options: [
        {id: '', label: 'Semua (incl. suspicious)'},
        {id: 'true', label: 'Hanya suspicious'},
        {id: 'automation_tool_ua', label: 'UA: automation tool'},
        {id: 'missing_user_agent', label: 'UA: missing'},
        {id: 'forged_source_no_origin', label: 'Forged source (no origin)'},
        {id: 'source_origin_mismatch', label: 'Source/origin mismatch'},
      ],
      sourceComponent: 'settings/activity-log/activity-log-list.tsx',
    },
  ];
}

export function getSettingsRoleEditorActions(
  roleId = ':id',
  defaultRole = false,
): SettingsRoleEditorAction[] {
  return [
    {
      id: 'create-role',
      label: 'New role',
      method: 'POST',
      path: '/roles',
      intent: 'outline',
      disabled: false,
      sourceComponent: 'settings/roles/create-roles.tsx',
    },
    {
      id: 'update-role',
      label: 'Edit role',
      method: 'PUT',
      path: `/roles/${roleId}`,
      intent: 'outline',
      disabled: false,
      sourceComponent: 'settings/roles/list.tsx',
    },
    {
      id: 'delete-role',
      label: 'Delete role',
      method: 'DELETE',
      path: `/roles/${roleId}`,
      intent: 'danger',
      disabled: defaultRole,
      disabledReason: defaultRole ? 'Default role cannot be deleted' : undefined,
      sourceComponent: 'settings/roles/list.tsx',
    },
  ];
}

export function getSettingsRolePermissionPreviewRows(): SettingsRolePermissionPreviewRow[] {
  return [
    {
      id: 'role-crud',
      resource: 'role',
      label: 'Role Management',
      actions: ['view', 'create', 'update', 'delete'],
      source: 'lib/permissions/resource-actions.ts',
    },
    {
      id: 'websetting-admin',
      resource: 'websetting',
      label: 'Web Settings',
      actions: ['view', 'update'],
      source: 'lib/permissions/resource-actions.ts',
    },
    {
      id: 'activity-log-view',
      resource: 'activity-log',
      label: 'Activity Log',
      actions: ['view'],
      source: 'lib/permissions/resource-actions.ts',
    },
  ];
}

export function getSettingsRolePermissionMatrixGroups(
  roleId = 'super-admin',
  defaultRole = false,
): SettingsRolePermissionMatrixGroup[] {
  const fullAccess = roleId === 'super-admin';
  const canEdit = !defaultRole && !fullAccess;
  const previewRows = getSettingsRolePermissionPreviewRows();
  const rows: SettingsRolePermissionMatrixRow[] = previewRows.map(row => {
    const selectedActions = getPreviewSelectedActions(row.resource, roleId);
    const actions = row.actions.map(action => ({
      id: action,
      label: getPermissionActionLabel(action),
      selected: fullAccess || selectedActions.includes(action),
      disabled: !canEdit,
    }));
    const activeCount = actions.filter(action => action.selected).length;

    const tone: SettingsRolePermissionMatrixRow['tone'] =
      activeCount === actions.length
        ? 'success'
        : activeCount > 0
          ? 'warning'
          : 'muted';

    return {
      id: row.id,
      resource: row.resource,
      label: row.label,
      activeCount,
      totalCount: actions.length,
      tone,
      actions,
      source: row.source,
    };
  });

  return [
    {
      id: 'settings-configuration-preview',
      label: 'Settings & Configuration',
      resourceCount: rows.length,
      activeCount: rows.reduce((total, row) => total + row.activeCount, 0),
      totalPossible: rows.reduce((total, row) => total + row.totalCount, 0),
      expanded: true,
      rows,
      sourceComponent: 'settings/roles/list.tsx',
    },
  ];
}

export function getSettingsRoleTabItems(
  rows = getSettingsRoleAccessRows(),
): SettingsRoleTabItem[] {
  return rows.map(row => {
    const [group] = getSettingsRolePermissionMatrixGroups(
      row.id,
      row.defaultRole,
    );

    return {
      id: row.id,
      label: row.role,
      key: row.key,
      permissionCount: group?.activeCount ?? 0,
      defaultRole: row.defaultRole,
      fullAccess: row.id === 'super-admin',
      sourceComponent: 'settings/roles/list.tsx',
    };
  });
}

export function getSettingsRoleInfoPanel(
  roleId = 'super-admin',
): SettingsRoleInfoPanel {
  const row =
    getSettingsRoleAccessRows().find(role => role.id === roleId) ??
    getSettingsRoleAccessRows()[0];
  const fullAccess = row.id === 'super-admin';
  const badges: SettingsRoleInfoPanel['badges'] = [];

  if (fullAccess) {
    badges.push({id: 'full-access', label: 'Full Access', tone: 'warning'});
  }

  if (row.defaultRole) {
    badges.push({id: 'default', label: 'Default', tone: 'secondary'});
  }

  return {
    id: row.id,
    name: row.role,
    description: row.meta,
    key: row.key,
    badges,
    canDelete: !row.defaultRole,
    deleteLabel: 'Delete',
    notice: fullAccess
      ? 'Super Admin has full access to all resources. Permissions cannot be modified.'
      : undefined,
    sourceComponent: 'settings/roles/list.tsx',
  };
}

function getPreviewSelectedActions(
  resource: SettingsRolePermissionPreviewRow['resource'],
  roleId: string,
) {
  if (roleId === 'inventory-staff') {
    return resource === 'role' ? ['view'] : resource === 'activity-log' ? ['view'] : [];
  }

  if (roleId === 'pos-cashier') {
    return resource === 'activity-log' ? ['view'] : [];
  }

  if (roleId === 'am-operator') {
    return resource === 'activity-log' ? ['view'] : [];
  }

  return [];
}

function getPermissionActionLabel(action: string) {
  const labels: Record<string, string> = {
    view: 'View',
    create: 'Create',
    update: 'Update',
    delete: 'Delete',
  };

  return labels[action] ?? action;
}

export function getSettingsRoleResourceGroups(): SettingsRoleResourceGroup[] {
  return [
    {
      id: 'inventory',
      label: 'Inventory',
      resources: [
        'brand',
        'category',
        'taxonomy',
        'location',
        'units',
        'product',
        'species',
        'source',
        'iucn-status',
      ],
      sourceComponent: 'settings/roles/list.tsx',
    },
    {
      id: 'sales-customers',
      label: 'Sales & Customers',
      resources: [
        'sale',
        'customer',
        'complaint',
        'enclosure',
        'shipping_method',
        'customer-species',
        'species-request',
        'taxonomy-request',
      ],
      sourceComponent: 'settings/roles/list.tsx',
    },
    {
      id: 'content',
      label: 'Content',
      resources: ['blog', 'blog-topic', 'tag'],
      sourceComponent: 'settings/roles/list.tsx',
    },
    {
      id: 'purchasing-production',
      label: 'Purchasing & Production',
      resources: ['vendor', 'purchase-order', 'production'],
      sourceComponent: 'settings/roles/list.tsx',
    },
    {
      id: 'finance',
      label: 'Finance',
      resources: ['wallet'],
      sourceComponent: 'settings/roles/list.tsx',
    },
    {
      id: 'stock-management',
      label: 'Stock Management',
      resources: ['stock-transaction', 'stock-opname'],
      sourceComponent: 'settings/roles/list.tsx',
    },
    {
      id: 'enclonura',
      label: 'Enclonura',
      resources: ['enclonura-species'],
      sourceComponent: 'settings/roles/list.tsx',
    },
    {
      id: 'settings-configuration',
      label: 'Settings & Configuration',
      resources: ['user', 'role', 'websetting', 'custom-field'],
      sourceComponent: 'settings/roles/list.tsx',
    },
    {
      id: 'system',
      label: 'System (Wildcard)',
      resources: ['*'],
      sourceComponent: 'settings/roles/list.tsx',
    },
  ];
}

export function getSettingsRoleAccessRows(): SettingsRoleAccessRow[] {
  return [
    {
      id: 'super-admin',
      role: 'Super Administrator',
      key: 'super-admin',
      kolam: true,
      pos: true,
      am: true,
      meta: 'Full shell access through super administrator role.',
      defaultRole: true,
    },
    {
      id: 'inventory-staff',
      role: 'Inventory Staff',
      key: 'inventory-staff',
      kolam: true,
      pos: false,
      am: false,
      meta: 'Uses access_inventory for Kolam operations and settings review.',
      defaultRole: false,
    },
    {
      id: 'pos-cashier',
      role: 'POS Cashier',
      key: 'pos-cashier',
      kolam: false,
      pos: true,
      am: false,
      meta: 'Uses access_pos or role POS for checkout, sales, and cashflow.',
      defaultRole: false,
    },
    {
      id: 'am-operator',
      role: 'AM Operator',
      key: 'am-operator',
      kolam: false,
      pos: false,
      am: true,
      meta: 'Uses access_am for automation dashboard and workflow review.',
      defaultRole: false,
    },
  ];
}

export function getSettingsRoleMemberPreview(
  roleId: SettingsRoleAccessRow['id'],
): SettingsRoleMemberPreview {
  const previews: Record<string, SettingsRoleMemberPreview> = {
    'super-admin': {
      roleId: 'super-admin',
      label: 'Members',
      count: 1,
      members: [
        {
          id: 'admin',
          name: 'Super Admin',
          initials: 'SA',
        },
      ],
      sourceComponent: 'settings/roles/list.tsx',
    },
    'inventory-staff': {
      roleId: 'inventory-staff',
      label: 'Members',
      count: 2,
      members: [
        {
          id: 'inventory-lead',
          name: 'Inventory Lead',
          initials: 'IL',
        },
        {
          id: 'stock-staff',
          name: 'Stock Staff',
          initials: 'SS',
        },
      ],
      sourceComponent: 'settings/roles/list.tsx',
    },
    'pos-cashier': {
      roleId: 'pos-cashier',
      label: 'Members',
      count: 1,
      members: [
        {
          id: 'cashier',
          name: 'POS Cashier',
          initials: 'PC',
        },
      ],
      sourceComponent: 'settings/roles/list.tsx',
    },
    'am-operator': {
      roleId: 'am-operator',
      label: 'Members',
      count: 0,
      members: [],
      sourceComponent: 'settings/roles/list.tsx',
    },
  };

  return (
    previews[roleId] ?? {
      roleId,
      label: 'Members',
      count: 0,
      members: [],
      sourceComponent: 'settings/roles/list.tsx',
    }
  );
}

export function getSettingsWebConfigFields(): SettingsWebConfigField[] {
  return [
    {
      id: 'storefront-title',
      label: 'Storefront title',
      value: 'Kolam Dunia Anura',
      description: 'Display name used by the public storefront and header.',
      control: 'text',
    },
    {
      id: 'storefront-status',
      label: 'Storefront enabled',
      value: 'Enabled',
      description: 'Native preview for /settings/websetting storefront status.',
      control: 'toggle',
    },
    {
      id: 'maintenance-mode',
      label: 'Maintenance mode',
      value: 'Off',
      description: 'Operational toggle for maintenance banner/state review.',
      control: 'toggle',
    },
  ];
}

export function getSettingsWebFormSections(): SettingsWebFormSection[] {
  return [
    {
      id: 'version',
      title: 'Version',
      description: 'Version per application. Each app has its own version number.',
      layout: 'grid-2',
      fields: [
        {id: 'kolam', label: 'Kolam', placeholder: '1.0.0', control: 'text', value: '1.0.0', required: false},
        {id: 'enclonura', label: 'Enclonura', placeholder: '1.0.0', control: 'text', value: '1.0.0', required: false},
        {id: 'pos', label: 'POS', placeholder: '1.0.0', control: 'text', value: '1.0.0', required: false},
        {id: 'marketplace', label: 'Marketplace', placeholder: '1.0.0', control: 'text', value: '1.0.0', required: false},
      ],
      sourceComponent: 'settings/websetting/websetting-page.tsx',
    },
    {
      id: 'logo',
      title: 'Logo',
      description: 'Upload logo/photo for WebSetting',
      layout: 'single',
      fields: [
        {id: 'logo-upload', label: 'Logo', placeholder: 'Upload Logo', control: 'file', value: 'Upload Logo', required: false},
      ],
      sourceComponent: 'settings/websetting/websetting-page.tsx',
    },
    {
      id: 'company-info',
      title: 'Company Info',
      description: 'Company name and tagline for branding',
      layout: 'stack',
      fields: [
        {id: 'company-name', label: 'Company Name', placeholder: 'Dunia Anura', control: 'text', value: 'Dunia Anura', required: false},
        {id: 'company-tagline', label: 'Company Tagline', placeholder: 'Your trusted pet store', control: 'text', value: 'Your trusted pet store', required: false},
      ],
      sourceComponent: 'settings/websetting/websetting-page.tsx',
    },
    {
      id: 'contact-info',
      title: 'Contact Info',
      description: 'Phone and email for customer contact',
      layout: 'stack',
      fields: [
        {id: 'phone', label: 'Phone', placeholder: '+62 812-3456-7890', control: 'text', value: '+62 812-3456-7890', required: false},
        {id: 'email', label: 'Email', placeholder: 'info@duniaanura.com', control: 'text', value: 'info@duniaanura.com', required: false},
      ],
      sourceComponent: 'settings/websetting/websetting-page.tsx',
    },
    {
      id: 'address',
      title: 'Address',
      description: 'Business/clinic/warehouse address',
      layout: 'single',
      fields: [
        {id: 'address', label: 'Address', placeholder: 'Jl. Contoh No. 1', control: 'textarea', value: 'Jl. Contoh No. 1', required: false},
      ],
      sourceComponent: 'settings/websetting/websetting-page.tsx',
    },
    {
      id: 'shipping-origin',
      title: 'Shipping Origin',
      description: 'Origin address for shipping rate calculation. Make sure postal code is filled.',
      layout: 'grid-2',
      fields: [
        {id: 'origin-address', label: 'Address', placeholder: 'Jl. Taman Ratu Raya No.34', control: 'text', value: 'Jl. Taman Ratu Raya No.34', required: false},
        {id: 'origin-city', label: 'City', placeholder: 'Jakarta Barat', control: 'text', value: 'Jakarta Barat', required: false},
        {id: 'origin-province', label: 'Province', placeholder: 'DKI Jakarta', control: 'text', value: 'DKI Jakarta', required: false},
        {id: 'origin-postal-code', label: 'Postal Code', placeholder: '11550', control: 'text', value: '11550', required: true},
      ],
      sourceComponent: 'settings/websetting/websetting-page.tsx',
    },
    {
      id: 'social-media',
      title: 'Social Media',
      description: 'Link social media (opsional)',
      layout: 'stack',
      fields: [
        {id: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...', control: 'text', value: '', required: false},
        {id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...', control: 'text', value: '', required: false},
        {id: 'twitter', label: 'Twitter', placeholder: 'https://twitter.com/...', control: 'text', value: '', required: false},
        {id: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/...', control: 'text', value: '', required: false},
        {id: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/...', control: 'text', value: '', required: false},
      ],
      sourceComponent: 'settings/websetting/websetting-page.tsx',
    },
    {
      id: 'maintenance-mode',
      title: 'Maintenance Mode',
      description: 'Enable/disable maintenance mode',
      layout: 'grid-2',
      fields: [
        {id: 'maintenance-pos', label: 'POS', placeholder: 'Enable maintenance mode for the POS', control: 'switch', value: 'Off', required: false},
        {id: 'maintenance-marketplace', label: 'Marketplace', placeholder: 'Enable maintenance mode for the Marketplace', control: 'switch', value: 'Off', required: false},
      ],
      sourceComponent: 'settings/websetting/websetting-page.tsx',
    },
  ];
}

export function getSettingsLiveEndpoints(): SettingsLiveEndpoint[] {
  return [
    {
      id: 'websetting-read',
      label: 'Web Settings',
      method: 'GET',
      path: '/websetting',
      permission: 'optional auth, policy sliced by role',
      status: 'wired',
    },
    {
      id: 'websetting-update',
      label: 'Web Settings update',
      method: 'PUT',
      path: '/websetting',
      permission: 'websetting:update',
      status: 'wired',
    },
    {
      id: 'version-read',
      label: 'App version',
      method: 'GET',
      path: '/websetting/version',
      permission: 'public',
      status: 'wired',
    },
    {
      id: 'roles-read',
      label: 'Role Management',
      method: 'GET',
      path: '/roles',
      permission: 'role:view',
      status: 'wired',
    },
    {
      id: 'activity-read',
      label: 'Activity Log',
      method: 'GET',
      path: '/activity-log',
      permission: 'activity-log:view',
      status: 'wired',
    },
    {
      id: 'activity-stats',
      label: 'Activity stats',
      method: 'GET',
      path: '/activity-log/stats',
      permission: 'activity-log:view',
      status: 'wired',
    },
  ];
}
