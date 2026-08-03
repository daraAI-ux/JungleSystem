/**
 * Log DARA (staff notify) — Pusat AI tab.
 * SoT: FE `DaraStaffNotifyLogPanel` + BE `listDaraStaffNotifyLog`.
 */

import {formatKolamOwnerCopilotWib} from './kolam-pusat-ai-owner-copilot';

export type KolamDaraStaffNotifyChannels = {
  teamChat: boolean;
  waStaff: boolean;
  browserPush: boolean;
};

export type KolamDaraStaffNotifyEvent = {
  id: string;
  at: string;
  eventType: string;
  action: string;
  invoiceCode: string;
  phase: string;
  detail: string;
  copySource: 'llm' | 'template' | string;
  notified: KolamDaraStaffNotifyChannels;
  saleId: string;
};

export type KolamDaraStaffNotifyLog = {
  generatedAt: string;
  lookbackHours: number;
  summary: {
    total: number;
    llmCopy: number;
    templateCopy: number;
  };
  events: KolamDaraStaffNotifyEvent[];
};

export const KOLAM_DARA_STAFF_NOTIFY_EMPTY = 'Belum ada event.';
export const KOLAM_DARA_STAFF_NOTIFY_UNAVAILABLE = 'Log tidak tersedia.';

const EVENT_LABELS: Record<string, string> = {
  webstore_packing_request: 'Packing dimulai',
  webstore_packing_reminder: 'Reminder packing',
  webstore_packing_overdue: 'Packing overdue',
  webstore_staff_ready: 'Packing siap',
  webstore_booking_failed: 'Booking gagal',
  webstore_booked: 'Booking berhasil',
};

/** FE `eventLabel2`. */
export function formatKolamDaraStaffNotifyEventLabel(type: string) {
  if (!type) {
    return '—';
  }
  if (EVENT_LABELS[type]) {
    return EVENT_LABELS[type];
  }
  return type.replace(/^webstore_/, '').replace(/_/g, ' ');
}

/** FE `channelBadges`. */
export function formatKolamDaraStaffNotifyChannels(
  notified: KolamDaraStaffNotifyChannels,
) {
  const parts: string[] = [];
  if (notified.teamChat) {
    parts.push('Team Chat');
  }
  if (notified.waStaff) {
    parts.push('WA');
  }
  if (notified.browserPush) {
    parts.push('Browser');
  }
  return parts.length ? parts.join(' · ') : '—';
}

export function formatKolamDaraStaffNotifyWib(iso: string | null | undefined) {
  return formatKolamOwnerCopilotWib(iso);
}

export function isKolamDaraStaffNotifyLlmCopy(copySource: string) {
  return copySource === 'llm';
}

export function normalizeKolamDaraStaffNotifyLog(
  payload: unknown,
): KolamDaraStaffNotifyLog | null {
  const root = asRecord(payload);
  const data = asRecord(
    root.data && typeof root.data === 'object' ? root.data : root,
  );
  if (!Object.keys(data).length) {
    return null;
  }

  const summary = asRecord(data.summary);
  return {
    generatedAt: toIsoString(data.generatedAt),
    lookbackHours: toFiniteNumber(data.lookbackHours) || 72,
    summary: {
      total: toFiniteNumber(summary.total),
      llmCopy: toFiniteNumber(summary.llmCopy),
      templateCopy: toFiniteNumber(summary.templateCopy),
    },
    events: normalizeEvents(data.events),
  };
}

function normalizeEvents(value: unknown): KolamDaraStaffNotifyEvent[] {
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
      const notified = asRecord(row.notified);
      const copySource =
        typeof row.copySource === 'string' && row.copySource.trim()
          ? row.copySource.trim()
          : 'template';
      return {
        id,
        at: toIsoString(row.at),
        eventType: typeof row.eventType === 'string' ? row.eventType : '',
        action: typeof row.action === 'string' ? row.action : '',
        invoiceCode:
          typeof row.invoiceCode === 'string' ? row.invoiceCode.trim() : '',
        phase: typeof row.phase === 'string' ? row.phase : '',
        detail: typeof row.detail === 'string' ? row.detail.trim() : '',
        copySource,
        notified: {
          teamChat: notified.teamChat === true,
          waStaff: notified.waStaff === true,
          browserPush: notified.browserPush === true,
        },
        saleId: typeof row.saleId === 'string' ? row.saleId : '',
      };
    })
    .filter((item): item is KolamDaraStaffNotifyEvent => item != null);
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
