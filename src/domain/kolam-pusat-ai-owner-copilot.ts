/**
 * Owner Copilot — Pusat AI tab.
 * SoT: FE `OwnerCopilotDashboardPanel` + BE `getOwnerCopilotDashboard`.
 */

import {formatRupiah} from '../lib/money';

export type KolamOwnerCopilotNightOpsStatus =
  | 'ok'
  | 'fail'
  | 'defer'
  | 'info'
  | string;

export type KolamOwnerCopilotNightOpsEvent = {
  id: string;
  at: string;
  eventType: string;
  invoiceCode: string;
  action: string;
  status: KolamOwnerCopilotNightOpsStatus;
  reason: string;
};

export type KolamOwnerCopilotNightOpsFailure = {
  id: string;
  at: string;
  eventType: string;
  invoiceCode: string;
  reason: string;
};

export type KolamOwnerCopilotInsight = {
  kind: string;
  title: string;
  body: string;
  broadcastAt: string;
};

export type KolamOwnerCopilotDashboard = {
  generatedAt: string;
  lookbackHours: number;
  windowLabel: string;
  teamChat: {
    aiRoomId: string;
    roomName: string;
    webHref: string;
    suggestedPrompts: string[];
  };
  health: {
    salesFormatted: string;
    orderCount: number;
    marginFormatted: string;
    lowStockCount: number;
  };
  nightOps: {
    opsAuditEnabled: boolean;
    counts: {
      olshop_dispatch: number;
      olshop_defer: number;
      olshop_fail: number;
      olshop_stock_hold: number;
      webstore_start: number;
      dana_ok: number;
      dana_fail: number;
    };
    failures: KolamOwnerCopilotNightOpsFailure[];
    recentEvents: KolamOwnerCopilotNightOpsEvent[];
  };
  insights: KolamOwnerCopilotInsight[];
  executiveNote: string;
};

export const KOLAM_OWNER_COPILOT_DESCRIPTION =
  'Snapshot read-only bisnis + Night Ops 24 jam. Detail & simulasi keputusan via Chat dengan DARA — bukan dari tile ini.';

export const KOLAM_OWNER_COPILOT_EMPTY_NIGHT_OPS =
  'Belum ada event ops dalam 24 jam.';

export const KOLAM_OWNER_COPILOT_AUDIT_OFF =
  'Audit log mati di Settings.';

const OWNER_COPILOT_DEV_NOTE_PATTERN =
  /(scenario|governance|sign-off|sign off|AC1\.005|runtime P2|placeholder)/i;

export function formatKolamOwnerCopilotIdr(value: unknown) {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) {
    return '—';
  }
  return formatRupiah(n);
}

export function formatKolamOwnerCopilotWib(iso: string | null | undefined) {
  if (!iso) {
    return '—';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** FE `eventLabel`. */
export function formatKolamOwnerCopilotEventLabel(type: string) {
  if (type === 'olshop_autopilot') {
    return 'Automasi olshop';
  }
  if (type === 'webstore_fulfillment') {
    return 'DARA ASLI webstore';
  }
  if (type === 'dana_auto_lunas') {
    return 'DANA auto-lunas';
  }
  if (type === 'dara_staff_notify') {
    return 'Staff notify DARA';
  }
  return type || '—';
}

export function getKolamOwnerCopilotStatusIntent(
  status: string,
): 'success' | 'danger' | 'warning' | 'secondary' {
  if (status === 'ok') {
    return 'success';
  }
  if (status === 'fail') {
    return 'danger';
  }
  if (status === 'defer') {
    return 'warning';
  }
  return 'secondary';
}

export function computeKolamOwnerCopilotNightOpsTotal(
  counts: KolamOwnerCopilotDashboard['nightOps']['counts'],
) {
  return (
    counts.olshop_dispatch +
    counts.olshop_defer +
    counts.olshop_fail +
    counts.olshop_stock_hold +
    counts.webstore_start +
    counts.dana_ok +
    counts.dana_fail
  );
}

export function normalizeKolamOwnerCopilotDashboard(
  payload: unknown,
): KolamOwnerCopilotDashboard | null {
  const root = asRecord(payload);
  const data = asRecord(
    root.data && typeof root.data === 'object' ? root.data : root,
  );
  if (!Object.keys(data).length) {
    return null;
  }

  const teamChat = asRecord(data.teamChat);
  const health = asRecord(data.health);
  const sales = asRecord(health.sales);
  const margin = asRecord(health.margin);
  const nightOps = asRecord(data.nightOps);
  const counts = asRecord(nightOps.counts);
  const window = asRecord(data.window);
  const executive = asRecord(data.executive);

  const salesFormatted =
    (typeof sales.formatted === 'string' && sales.formatted.trim()) ||
    formatKolamOwnerCopilotIdr(sales.totalIdr);
  const marginFormatted =
    (typeof margin.formattedProfit === 'string' &&
      margin.formattedProfit.trim()) ||
    `${formatKolamOwnerCopilotIdr(margin.grossProfitIdr)} (${toFiniteNumber(
      margin.marginPercent,
    ).toFixed(1)}%)`;

  const prompts = Array.isArray(teamChat.suggestedPrompts)
    ? teamChat.suggestedPrompts
        .filter((item): item is string => typeof item === 'string')
        .map(item => item.trim())
        .filter(Boolean)
    : [];

  return {
    generatedAt:
      typeof data.generatedAt === 'string'
        ? data.generatedAt
        : data.generatedAt instanceof Date
          ? data.generatedAt.toISOString()
          : '',
    lookbackHours: toFiniteNumber(data.lookbackHours) || 24,
    windowLabel:
      typeof window.label === 'string' && window.label.trim()
        ? window.label.trim()
        : '',
    teamChat: {
      aiRoomId:
        typeof teamChat.aiRoomId === 'string' ? teamChat.aiRoomId.trim() : '',
      roomName:
        typeof teamChat.roomName === 'string' && teamChat.roomName.trim()
          ? teamChat.roomName.trim()
          : 'Chat dengan DARA',
      webHref:
        typeof teamChat.webHref === 'string' ? teamChat.webHref.trim() : '',
      suggestedPrompts: prompts,
    },
    health: {
      salesFormatted,
      orderCount: toFiniteNumber(sales.orderCount),
      marginFormatted,
      lowStockCount: toFiniteNumber(health.lowStockCount),
    },
    nightOps: {
      opsAuditEnabled: nightOps.opsAuditEnabled !== false,
      counts: {
        olshop_dispatch: toFiniteNumber(counts.olshop_dispatch),
        olshop_defer: toFiniteNumber(counts.olshop_defer),
        olshop_fail: toFiniteNumber(counts.olshop_fail),
        olshop_stock_hold: toFiniteNumber(counts.olshop_stock_hold),
        webstore_start: toFiniteNumber(counts.webstore_start),
        dana_ok: toFiniteNumber(counts.dana_ok),
        dana_fail: toFiniteNumber(counts.dana_fail),
      },
      failures: normalizeFailures(nightOps.failures),
      recentEvents: normalizeEvents(nightOps.recentEvents),
    },
    insights: normalizeInsights(data.insights),
    executiveNote: normalizeExecutiveNote(executive.note),
  };
}

function normalizeExecutiveNote(value: unknown) {
  if (typeof value !== 'string') {
    return '';
  }

  const note = value.trim();
  if (!note || OWNER_COPILOT_DEV_NOTE_PATTERN.test(note)) {
    return '';
  }

  return note;
}

function normalizeFailures(value: unknown): KolamOwnerCopilotNightOpsFailure[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const row = asRecord(item);
      const id =
        (typeof row.id === 'string' && row.id) ||
        (typeof row._id === 'string' && row._id) ||
        '';
      if (!id) {
        return null;
      }
      return {
        id,
        at: toIsoString(row.at),
        eventType: typeof row.eventType === 'string' ? row.eventType : '',
        invoiceCode:
          typeof row.invoiceCode === 'string' ? row.invoiceCode.trim() : '',
        reason: typeof row.reason === 'string' ? row.reason.trim() : '',
      };
    })
    .filter((item): item is KolamOwnerCopilotNightOpsFailure => item != null);
}

function normalizeEvents(value: unknown): KolamOwnerCopilotNightOpsEvent[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const row = asRecord(item);
      const id =
        (typeof row.id === 'string' && row.id) ||
        (typeof row._id === 'string' && row._id) ||
        '';
      if (!id) {
        return null;
      }
      return {
        id,
        at: toIsoString(row.at),
        eventType: typeof row.eventType === 'string' ? row.eventType : '',
        invoiceCode:
          typeof row.invoiceCode === 'string' ? row.invoiceCode.trim() : '',
        action: typeof row.action === 'string' ? row.action : '',
        status: typeof row.status === 'string' ? row.status : 'info',
        reason: typeof row.reason === 'string' ? row.reason.trim() : '',
      };
    })
    .filter((item): item is KolamOwnerCopilotNightOpsEvent => item != null);
}

function normalizeInsights(value: unknown): KolamOwnerCopilotInsight[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map(item => {
      const row = asRecord(item);
      const title = typeof row.title === 'string' ? row.title.trim() : '';
      if (!title) {
        return null;
      }
      return {
        kind: typeof row.kind === 'string' ? row.kind : '',
        title,
        body: typeof row.body === 'string' ? row.body.trim() : '',
        broadcastAt: toIsoString(row.broadcastAt),
      };
    })
    .filter((item): item is KolamOwnerCopilotInsight => item != null);
}

function toIsoString(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  return '';
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function toFiniteNumber(value: unknown) {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}
