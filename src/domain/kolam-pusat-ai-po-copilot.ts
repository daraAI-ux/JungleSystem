/**
 * PO Copilot — Pusat AI tab.
 * SoT: DA-Dara-Plugin `po-copilot-dashboard-panel.tsx` + `po-copilot-api.ts`.
 */

import {formatKolamOwnerCopilotWib} from './kolam-pusat-ai-owner-copilot';

export type KolamPoCopilotRange = 'today' | 'month' | 'year' | 'all';

export const KOLAM_PO_COPILOT_RANGES: Array<{
  id: KolamPoCopilotRange;
  label: string;
}> = [
  {id: 'today', label: 'Hari ini'},
  {id: 'month', label: 'Bulan ini'},
  {id: 'year', label: 'Tahun ini'},
  {id: 'all', label: 'Semua'},
];

export const KOLAM_PO_COPILOT_DESCRIPTION =
  'Statistik PO: closed vs gagal · profil bot Raja Anemon.';

export const KOLAM_PO_COPILOT_OPS_EMPTY = 'Belum ada entri.';

export type KolamPoStatsSummary = {
  metric: string;
  value: number;
  change: number;
  data: Array<{timestamp: string; value: number}>;
};

export type KolamPoCopilotStats = {
  generatedAt: string;
  range: string;
  note: string;
  closed: KolamPoStatsSummary;
  failed: KolamPoStatsSummary;
  rajaAnemonProfile: {
    name: string;
    photoUrl: string;
  };
};

export type KolamPoOpsLogBadge = {
  label: string;
  value: string;
};

export type KolamPoOpsLogEvent = {
  id: string;
  at: string;
  eventType: string;
  action: string;
  status: string;
  detail: string;
  phase: string;
  invoiceCode: string;
  controller: string;
  executor: string;
  poCode: string;
  vendorName: string;
  conversationId: string;
  messageId: string;
  dispatchTaskId: string;
  error: string;
  badges: KolamPoOpsLogBadge[];
};

export type KolamPoOpsLog = {
  generatedAt: string;
  note: string;
  dara: KolamPoOpsLogEvent[];
  bot: KolamPoOpsLogEvent[];
};

export type KolamRajaAnemonPlatformHealth = {
  platform: string;
  enabled: boolean;
  healthy: boolean | null;
  state: string;
  reason: string;
};

export type KolamRajaAnemonProcurementAgent = {
  enabled: boolean;
  modelTier: string;
  approvalGuard: boolean;
  paymentGuard: string;
  note: string;
  guardrailBadges: KolamPoOpsLogBadge[];
};

export type KolamRajaAnemonHealth = {
  checkedAt: string;
  overallHealthy: boolean | null;
  overallState: string;
  platforms: KolamRajaAnemonPlatformHealth[];
  procurementAgent: KolamRajaAnemonProcurementAgent | null;
  notifyRoom: {
    id: string;
    name: string;
    webHref: string;
  } | null;
  note: string;
};

export function formatKolamPoCopilotWib(iso: string | null | undefined) {
  return formatKolamOwnerCopilotWib(iso);
}

export function formatKolamPoCopilotRoomLabel(room: {
  _id?: string;
  id?: string;
  name?: string;
  isGeneral?: boolean;
}) {
  if (room.isGeneral) {
    return 'General';
  }
  const name = typeof room.name === 'string' ? room.name.trim() : '';
  if (name) {
    return name;
  }
  const id = String(room._id || room.id || '');
  return id ? `Room ${id.slice(-6)}` : 'Room';
}

export function formatKolamPoCopilotRoleLabel(value?: string | null) {
  const text = String(value || '')
    .trim()
    .toLowerCase();
  if (!text) {
    return '';
  }
  if (text === 'dara') {
    return 'DARA';
  }
  if (text === 'raja_anemon') {
    return 'Raja Anemon';
  }
  return String(value || '').trim();
}

export function compactKolamPoCopilotText(value?: string | null, max = 48) {
  const text = String(value || '').trim();
  if (!text) {
    return '';
  }
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export function normalizeKolamPoCopilotStats(
  payload: unknown,
): KolamPoCopilotStats | null {
  const root = asRecord(payload);
  const data = asRecord(
    root.data && typeof root.data === 'object' ? root.data : root,
  );
  if (!Object.keys(data).length) {
    return null;
  }
  const profile = asRecord(data.rajaAnemonProfile);
  return {
    generatedAt: toIsoString(data.generatedAt),
    range: typeof data.range === 'string' ? data.range : 'month',
    note: typeof data.note === 'string' ? data.note.trim() : '',
    closed: normalizeSummary(data.closed),
    failed: normalizeSummary(data.failed),
    rajaAnemonProfile: {
      name: typeof profile.name === 'string' ? profile.name.trim() : '',
      photoUrl:
        typeof profile.photoUrl === 'string' ? profile.photoUrl.trim() : '',
    },
  };
}

export function normalizeKolamPoOpsLog(payload: unknown): KolamPoOpsLog | null {
  const root = asRecord(payload);
  const data = asRecord(
    root.data && typeof root.data === 'object' ? root.data : root,
  );
  if (!Object.keys(data).length) {
    return null;
  }
  return {
    generatedAt: toIsoString(data.generatedAt),
    note: typeof data.note === 'string' ? data.note.trim() : '',
    dara: normalizeOpsEvents(data.dara),
    bot: normalizeOpsEvents(data.bot),
  };
}

export function normalizeKolamRajaAnemonHealth(
  payload: unknown,
): KolamRajaAnemonHealth | null {
  const root = asRecord(payload);
  const data = asRecord(
    root.data && typeof root.data === 'object' ? root.data : root,
  );
  if (!Object.keys(data).length) {
    return null;
  }
  const notify = asRecord(data.notifyRoom);
  const platforms = Array.isArray(data.platforms)
    ? data.platforms
        .map(item => {
          const row = asRecord(item);
          const platform =
            typeof row.platform === 'string' ? row.platform.trim() : '';
          if (!platform) {
            return null;
          }
          return {
            platform,
            enabled: row.enabled === true,
            healthy:
              row.healthy === true
                ? true
                : row.healthy === false
                  ? false
                  : null,
            state: typeof row.state === 'string' ? row.state : '',
            reason: typeof row.reason === 'string' ? row.reason.trim() : '',
          };
        })
        .filter(
          (item): item is KolamRajaAnemonPlatformHealth => item != null,
        )
    : [];

  return {
    checkedAt: toIsoString(data.checkedAt),
    overallHealthy:
      data.overallHealthy === true
        ? true
        : data.overallHealthy === false
          ? false
          : null,
    overallState:
      typeof data.overallState === 'string' ? data.overallState : '',
    platforms,
    procurementAgent: normalizeProcurementAgent(data.procurementAgent),
    notifyRoom:
      typeof notify.id === 'string' && notify.id.trim()
        ? {
            id: notify.id.trim(),
            name:
              typeof notify.name === 'string' && notify.name.trim()
                ? notify.name.trim()
                : 'Team Chat',
            webHref:
              typeof notify.webHref === 'string' ? notify.webHref.trim() : '',
          }
        : null,
    note: typeof data.note === 'string' ? data.note.trim() : '',
  };
}

function normalizeProcurementAgent(
  value: unknown,
): KolamRajaAnemonProcurementAgent | null {
  const row = asRecord(value);
  if (!Object.keys(row).length) {
    return null;
  }
  const guardrails = asRecord(row.guardrails);
  const guardrailBadges: KolamPoOpsLogBadge[] = [];
  pushBadge(
    guardrailBadges,
    'invoice source',
    typeof guardrails.invoiceExplicitSource === 'string'
      ? guardrails.invoiceExplicitSource
      : typeof guardrails.invoiceAttach === 'string'
        ? guardrails.invoiceAttach
        : '',
  );
  pushBadge(
    guardrailBadges,
    'invoice replace',
    typeof guardrails.invoiceReplace === 'string'
      ? guardrails.invoiceReplace
      : '',
  );
  pushBadge(
    guardrailBadges,
    'paid approval',
    typeof guardrails.paymentNotifyApproval === 'string'
      ? guardrails.paymentNotifyApproval
      : '',
  );
  pushBadge(
    guardrailBadges,
    'paid duplicate',
    typeof guardrails.duplicatePaidNotify === 'string'
      ? guardrails.duplicatePaidNotify
      : '',
  );
  pushBadge(
    guardrailBadges,
    'vendor disclosure',
    typeof guardrails.vendorDisclosure === 'string'
      ? guardrails.vendorDisclosure
      : '',
  );
  pushBadge(
    guardrailBadges,
    'vendor format',
    typeof guardrails.vendorMarkdown === 'string'
      ? guardrails.vendorMarkdown
      : '',
  );
  pushBadge(
    guardrailBadges,
    'vendor inbox',
    typeof guardrails.vendorConversationIsolation === 'string'
      ? guardrails.vendorConversationIsolation
      : '',
  );
  pushBadge(
    guardrailBadges,
    'approval log',
    typeof guardrails.approvalReplyLog === 'string'
      ? guardrails.approvalReplyLog
      : '',
  );
  pushBadge(
    guardrailBadges,
    'outbound audit',
    typeof guardrails.outboundAuditMetadata === 'string'
      ? guardrails.outboundAuditMetadata
      : '',
  );

  return {
    enabled: row.enabled === true,
    modelTier: typeof row.modelTier === 'string' ? row.modelTier.trim() : '',
    approvalGuard: row.approvalGuard === true,
    paymentGuard:
      typeof row.paymentGuard === 'string' ? row.paymentGuard.trim() : '',
    note: typeof row.note === 'string' ? row.note.trim() : '',
    guardrailBadges,
  };
}

function normalizeSummary(value: unknown): KolamPoStatsSummary {
  const row = asRecord(value);
  const data = Array.isArray(row.data)
    ? row.data
        .map(item => {
          const point = asRecord(item);
          const timestamp =
            typeof point.timestamp === 'string' ? point.timestamp : '';
          if (!timestamp) {
            return null;
          }
          return {timestamp, value: toFiniteNumber(point.value)};
        })
        .filter(
          (item): item is {timestamp: string; value: number} => item != null,
        )
    : [];

  return {
    metric: typeof row.metric === 'string' ? row.metric : '',
    value: toFiniteNumber(row.value),
    change: toFiniteNumber(row.change),
    data,
  };
}

function normalizeOpsEvents(value: unknown): KolamPoOpsLogEvent[] {
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
      const runtime = asRecord(row.runtime);
      const badges: KolamPoOpsLogBadge[] = [];
      pushBadge(
        badges,
        'status',
        typeof row.status === 'string' ? row.status : '',
      );
      pushBadge(badges, 'controller', formatKolamPoCopilotRoleLabel(row.controller as string));
      pushBadge(badges, 'executor', formatKolamPoCopilotRoleLabel(row.executor as string));
      if (runtime.deterministic === true) {
        pushBadge(badges, 'runtime', 'deterministic');
      }
      if (runtime.llm === false) {
        pushBadge(badges, 'LLM', 'off');
      }
      pushBadge(badges, 'PO', typeof row.poCode === 'string' ? row.poCode : '');
      pushBadge(
        badges,
        'vendor',
        typeof row.vendorName === 'string' ? row.vendorName : '',
      );
      pushBadge(
        badges,
        'AM task',
        typeof row.dispatchTaskId === 'string' ? row.dispatchTaskId : '',
      );
      pushBadge(
        badges,
        'quote status',
        typeof row.quoteStatus === 'string' ? row.quoteStatus : '',
      );
      pushBadge(
        badges,
        'pay',
        typeof row.paymentStatus === 'string' ? row.paymentStatus : '',
      );
      pushBadge(badges, 'error', typeof row.error === 'string' ? row.error : '');

      return {
        id,
        at: toIsoString(row.at),
        eventType: typeof row.eventType === 'string' ? row.eventType : '',
        action: typeof row.action === 'string' ? row.action : '',
        status: typeof row.status === 'string' ? row.status : '',
        detail: typeof row.detail === 'string' ? row.detail.trim() : '',
        phase: typeof row.phase === 'string' ? row.phase : '',
        invoiceCode:
          typeof row.invoiceCode === 'string' ? row.invoiceCode.trim() : '',
        controller: typeof row.controller === 'string' ? row.controller : '',
        executor: typeof row.executor === 'string' ? row.executor : '',
        poCode: typeof row.poCode === 'string' ? row.poCode.trim() : '',
        vendorName:
          typeof row.vendorName === 'string' ? row.vendorName.trim() : '',
        conversationId:
          typeof row.conversationId === 'string'
            ? row.conversationId.trim()
            : '',
        messageId:
          typeof row.messageId === 'string' ? row.messageId.trim() : '',
        dispatchTaskId:
          typeof row.dispatchTaskId === 'string'
            ? row.dispatchTaskId.trim()
            : '',
        error: typeof row.error === 'string' ? row.error.trim() : '',
        badges,
      };
    })
    .filter((item): item is KolamPoOpsLogEvent => item != null);
}

function pushBadge(
  badges: KolamPoOpsLogBadge[],
  label: string,
  value: string | null | undefined,
) {
  const text = String(value || '').trim();
  if (!text) {
    return;
  }
  badges.push({label, value: text});
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
