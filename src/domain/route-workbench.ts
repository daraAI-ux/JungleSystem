import type {AppArea} from './app-shell';

export type RouteWorkbenchIntent =
  | 'automation'
  | 'detail'
  | 'finance'
  | 'form'
  | 'governance'
  | 'inventory'
  | 'people'
  | 'service'
  | 'transaction'
  | 'workspace';

export interface RouteWorkbenchInput {
  area: AppArea;
  dataSnapshot: string;
  description: string;
  label: string;
  route: string;
  sourceRepo: string;
  syncState: string;
}

export interface RouteWorkbenchSummaryItem {
  badges?: string[];
  id: string;
  meta: string;
  title: string;
}

export interface RouteWorkbenchTarget {
  id: string;
  label: string;
  method: string;
  path: string;
  permission: string;
}

export interface RouteWorkbenchRow {
  id: string;
  label: string;
  meta: string;
  tone: 'default' | 'success' | 'warning';
  value: string;
}

export interface RouteWorkbenchModel {
  intent: RouteWorkbenchIntent;
  rows: RouteWorkbenchRow[];
  summary: RouteWorkbenchSummaryItem[];
  targets: RouteWorkbenchTarget[];
}

export function getRouteWorkbenchModel(
  input: RouteWorkbenchInput,
): RouteWorkbenchModel {
  const intent = getRouteWorkbenchIntent(input.route);
  const lane = getRouteWorkbenchLane(input.area, intent);
  const writeMode = getRouteWriteMode(input.route, intent);

  return {
    intent,
    summary: [
      {
        id: 'intent',
        title: getRouteWorkbenchIntentTitle(intent),
        meta: getIntentMeta(intent),
        badges: [input.area.toUpperCase(), writeMode],
      },
      {
        id: 'runtime',
        title: 'Runtime Server',
        meta: `Sync ${input.area.toUpperCase()} saat ini: ${input.syncState}.`,
        badges: ['server-only'],
      },
      {
        id: 'data',
        title: 'Data Preview',
        meta: input.dataSnapshot,
        badges: [lane],
      },
    ],
    rows: [
      {
        id: 'screen-plan',
        label: 'Native Screen',
        value: `${input.label} workbench`,
        meta: `${input.description} Surface ini membuka route lebih dulu sebelum detail visual dipoles.`,
        tone: 'default',
      },
      {
        id: 'runtime-mode',
        label: 'Runtime Mode',
        value: 'Server existing',
        meta: 'Tidak memakai backend lokal dan tetap membawa identitas native client Windows.',
        tone: 'success',
      },
      {
        id: 'source-contract',
        label: 'Source Contract',
        value: input.sourceRepo,
        meta: 'Dipakai sebagai acuan behavior dan API contract, bukan copy UI mentah-mentah.',
        tone: 'success',
      },
      {
        id: 'next-step',
        label: 'Next Build Step',
        value: getRouteWorkbenchNextBuildStep(intent),
        meta: 'Tahap berikutnya tinggal mengganti workbench generic ini dengan screen native spesifik per prioritas.',
        tone: 'warning',
      },
    ],
    targets: [
      {
        id: 'view',
        label: 'Open Surface',
        method: 'VIEW',
        path: input.route,
        permission: lane,
      },
      {
        id: 'read',
        label: 'Read Runtime',
        method: 'GET',
        path: getRuntimeReadPath(input.area, input.route),
        permission: 'native client gate',
      },
      {
        id: 'mutate',
        label: writeMode === 'read-only' ? 'Mutation Guard' : 'Write Flow',
        method: writeMode === 'read-only' ? 'LOCK' : 'POST',
        path: getRuntimeWritePath(input.area, input.route),
        permission: writeMode,
      },
    ],
  };
}

export function getRouteWorkbenchIntent(route: string): RouteWorkbenchIntent {
  const normalized = route.toLowerCase();

  if (/(create|new|edit|open|payment|sale-draft)/.test(normalized)) {
    return 'form';
  }

  if (/(:id|:ref|detail|\/[0-9a-f-]+$)/.test(normalized)) {
    return 'detail';
  }

  if (/(finance|wallet|cashflow|payable|receivable|tax|payment|expense|bonus|payroll)/.test(normalized)) {
    return 'finance';
  }

  if (/(product|species|catalog|brand|category|tag|stock|storage|asset|supplier|purchase|production|enclosure|material)/.test(normalized)) {
    return 'inventory';
  }

  if (/(sale|order|checkout|cart|transaction|voucher|marketplace)/.test(normalized)) {
    return 'transaction';
  }

  if (/(customer|user|staff|team|hr|attendance|account|role)/.test(normalized)) {
    return 'people';
  }

  if (/(task|automation|hardware|device|rack|box|mutasi|webhook|worker)/.test(normalized)) {
    return 'automation';
  }

  if (/(service|layanan|complaint|appointment|project|proyek|terms)/.test(normalized)) {
    return 'service';
  }

  if (/(settings|admin|activity-log|audit|websetting|sitemap|maintenance|sync)/.test(normalized)) {
    return 'governance';
  }

  return 'workspace';
}

function getRouteWorkbenchLane(area: AppArea, intent: RouteWorkbenchIntent) {
  if (area === 'plugins') {
    return 'plugin host';
  }

  if (area === 'am') {
    return intent === 'automation' ? 'automation runtime' : 'am runtime';
  }

  if (area === 'pos') {
    return intent === 'transaction' || intent === 'form'
      ? 'pos transaction'
      : 'pos data';
  }

  return 'kolam runtime';
}

function getRouteWriteMode(route: string, intent: RouteWorkbenchIntent) {
  if (intent === 'form') {
    return 'write-ready';
  }

  if (/(:id|edit|status|close|open|approval)/i.test(route)) {
    return 'guarded-write';
  }

  return 'read-only';
}

export function getRouteWorkbenchIntentTitle(intent: RouteWorkbenchIntent) {
  switch (intent) {
    case 'automation':
      return 'Automation Flow';
    case 'detail':
      return 'Detail View';
    case 'finance':
      return 'Finance Flow';
    case 'form':
      return 'Form Flow';
    case 'governance':
      return 'Governance';
    case 'inventory':
      return 'Inventory Flow';
    case 'people':
      return 'People Flow';
    case 'service':
      return 'Service Flow';
    case 'transaction':
      return 'Transaction Flow';
    case 'workspace':
    default:
      return 'Workspace';
  }
}

function getIntentMeta(intent: RouteWorkbenchIntent) {
  switch (intent) {
    case 'automation':
      return 'Task, device, webhook, dan worker state dibuka sebagai runtime AM native.';
    case 'detail':
      return 'Route detail disiapkan untuk membaca record dan action spesifik.';
    case 'finance':
      return 'Finance, wallet, pajak, dan cashflow masuk lane server existing.';
    case 'form':
      return 'Create, edit, payment, dan draft flow disiapkan sebagai form native.';
    case 'governance':
      return 'Settings, admin, role, dan audit dibuka dengan guard native.';
    case 'inventory':
      return 'Inventory, product, species, stock, storage, dan purchase data.';
    case 'people':
      return 'Customer, staff, team, account, dan role workflow.';
    case 'service':
      return 'Layanan, proyek, appointment, dan operational task.';
    case 'transaction':
      return 'Checkout, sales, order, marketplace, dan voucher workflow.';
    case 'workspace':
    default:
      return 'Surface umum untuk route yang belum punya screen native spesifik.';
  }
}

export function getRouteWorkbenchNextBuildStep(intent: RouteWorkbenchIntent) {
  switch (intent) {
    case 'form':
      return 'Pasang native form schema';
    case 'detail':
      return 'Pasang detail record loader';
    case 'finance':
      return 'Pasang finance table dan approval action';
    case 'inventory':
      return 'Pasang inventory table/action reusable';
    case 'transaction':
      return 'Pasang transaksi list/detail reusable';
    case 'automation':
      return 'Pasang AM task/device runtime panel';
    case 'people':
      return 'Pasang people table dan role guard';
    case 'service':
      return 'Pasang service/project workflow';
    case 'governance':
      return 'Pasang settings/audit editor';
    case 'workspace':
    default:
      return 'Prioritaskan screen native spesifik';
  }
}

function getRuntimeReadPath(area: AppArea, route: string) {
  if (area === 'am') {
    return route.startsWith('api/') || route.startsWith('am-be/')
      ? route
      : `am/${route}`;
  }

  if (area === 'plugins') {
    return `plugin-host${route.startsWith('/') ? route : `/${route}`}`;
  }

  return route.startsWith('/') ? route : `/${route}`;
}

function getRuntimeWritePath(area: AppArea, route: string) {
  const readPath = getRuntimeReadPath(area, route).replace(/\/$/, '');
  return `${readPath}/action`;
}
