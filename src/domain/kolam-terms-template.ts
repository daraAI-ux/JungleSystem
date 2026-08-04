/**
 * Kolam Syarat & Ketentuan (`/terms-templates`) — FE Proyek plugin CMS.
 * Source of truth: FE plugin terms-templates + BE `/api/terms-templates`.
 * T1: list + status. T2: create / detail / edit form (single TipTap content).
 */

import type { KolamStatusBadgeIntent } from '../components/kolam-status-badge-types';

export const KOLAM_TERMS_TEMPLATE_ROOT = '/terms-templates';
export const KOLAM_TERMS_TEMPLATE_NEW_ROUTE = `${KOLAM_TERMS_TEMPLATE_ROOT}/new`;

export type KolamTermsTemplateStatus = 'draft' | 'published' | 'archived';

export type KolamTermsTemplate = {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: KolamTermsTemplateStatus;
  version: number;
  complaintWindowDays: number | null;
  content: string;
  lastChangeNote: string;
  createdAt?: string;
  updatedAt?: string;
  raw: unknown;
};

export type KolamTermsTemplateListQuery = {
  page?: number;
  limit?: number;
  q?: string;
  status?: KolamTermsTemplateStatus | '';
};

export type KolamTermsTemplateListResult = {
  items: KolamTermsTemplate[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type KolamTermsTemplateSurfaceMode =
  | 'list'
  | 'detail'
  | 'new'
  | 'edit';

export const KOLAM_TERMS_TEMPLATE_STATUS_FILTER_OPTIONS: Array<{
  value: '' | KolamTermsTemplateStatus;
  label: string;
}> = [
  { value: '', label: 'Status' },
  { value: 'draft', label: 'Draf' },
  { value: 'published', label: 'Diterbitkan' },
  { value: 'archived', label: 'Diarsipkan' },
];

function normalizeRoutePath(route: string) {
  const path = String(route || '').split('?')[0].trim();
  if (!path) {
    return '/';
  }
  return path.startsWith('/') ? path.replace(/\/+$/, '') || '/' : `/${path}`;
}

export function isKolamTermsTemplateRoute(route: string) {
  const path = normalizeRoutePath(route);
  return (
    path === KOLAM_TERMS_TEMPLATE_ROOT ||
    path.startsWith(`${KOLAM_TERMS_TEMPLATE_ROOT}/`)
  );
}

export function isKolamTermsTemplateListRoute(route: string) {
  return normalizeRoutePath(route) === KOLAM_TERMS_TEMPLATE_ROOT;
}

export function isKolamTermsTemplateNewRoute(route: string) {
  return normalizeRoutePath(route) === KOLAM_TERMS_TEMPLATE_NEW_ROUTE;
}

export function isKolamTermsTemplateEditRoute(route: string) {
  const path = normalizeRoutePath(route);
  return /^\/terms-templates\/[^/]+\/edit$/.test(path);
}

export function isKolamTermsTemplateDetailRoute(route: string) {
  const path = normalizeRoutePath(route);
  if (
    path === KOLAM_TERMS_TEMPLATE_ROOT ||
    path === KOLAM_TERMS_TEMPLATE_NEW_ROUTE ||
    isKolamTermsTemplateEditRoute(path)
  ) {
    return false;
  }
  return /^\/terms-templates\/[^/]+$/.test(path);
}

export function getKolamTermsTemplateRouteId(route: string): string | null {
  const path = normalizeRoutePath(route);
  const editMatch = path.match(/^\/terms-templates\/([^/]+)\/edit$/);
  if (editMatch?.[1]) {
    return decodeURIComponent(editMatch[1]);
  }
  const detailMatch = path.match(/^\/terms-templates\/([^/]+)$/);
  if (!detailMatch?.[1] || detailMatch[1] === 'new') {
    return null;
  }
  return decodeURIComponent(detailMatch[1]);
}

export function getKolamTermsTemplateSurfaceMode(
  route: string,
): KolamTermsTemplateSurfaceMode {
  if (isKolamTermsTemplateNewRoute(route)) {
    return 'new';
  }
  if (isKolamTermsTemplateEditRoute(route)) {
    return 'edit';
  }
  if (isKolamTermsTemplateDetailRoute(route)) {
    return 'detail';
  }
  return 'list';
}

export function buildKolamTermsTemplateDetailRoute(id: string) {
  return `${KOLAM_TERMS_TEMPLATE_ROOT}/${encodeURIComponent(id)}`;
}

export function buildKolamTermsTemplateEditRoute(id: string) {
  return `${KOLAM_TERMS_TEMPLATE_ROOT}/${encodeURIComponent(id)}/edit`;
}

export type KolamTermsTemplateFormState = {
  title: string;
  slug: string;
  category: string;
  /** Empty string = unset (null on BE). */
  complaintWindowDays: string;
  status: KolamTermsTemplateStatus;
  content: string;
  changeNote: string;
};

export type KolamTermsTemplateSaveBody = {
  title: string;
  slug?: string;
  category?: string;
  content?: string;
  status?: KolamTermsTemplateStatus;
  complaintWindowDays?: number | null;
  changeNote?: string;
};

export const KOLAM_TERMS_TEMPLATE_CREATE_STATUS_OPTIONS: Array<{
  value: Exclude<KolamTermsTemplateStatus, 'archived'>;
  label: string;
}> = [
  { value: 'draft', label: 'Draf' },
  { value: 'published', label: 'Diterbitkan' },
];

export function createEmptyKolamTermsTemplateFormState(): KolamTermsTemplateFormState {
  return {
    title: '',
    slug: '',
    category: 'default',
    complaintWindowDays: '',
    status: 'draft',
    content: '',
    changeNote: '',
  };
}

export function createKolamTermsTemplateFormState(
  item: KolamTermsTemplate,
): KolamTermsTemplateFormState {
  return {
    title: item.title === '—' ? '' : item.title,
    slug: item.slug,
    category: item.category || 'default',
    complaintWindowDays:
      item.complaintWindowDays == null
        ? ''
        : String(item.complaintWindowDays),
    status: item.status,
    content: item.content || '',
    changeNote: '',
  };
}

export function isKolamTermsTemplateFormEditable(
  item: KolamTermsTemplate | null,
  mode: KolamTermsTemplateSurfaceMode,
) {
  if (mode === 'new') {
    return true;
  }
  if (!item) {
    return false;
  }
  return item.status !== 'archived';
}

export function validateKolamTermsTemplateForm(
  form: KolamTermsTemplateFormState,
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const title = form.title.trim();
  if (title.length < 3) {
    errors.push('Judul wajib minimal 3 karakter.');
  }
  const daysRaw = form.complaintWindowDays.trim();
  if (daysRaw) {
    const days = Number(daysRaw);
    if (!Number.isFinite(days) || days < 0 || !Number.isInteger(days)) {
      errors.push('Masa tunggu komplain harus angka bulat ≥ 0 atau kosong.');
    }
  }
  return { isValid: errors.length === 0, errors };
}

export function buildKolamTermsTemplateCreateBody(
  form: KolamTermsTemplateFormState,
): KolamTermsTemplateSaveBody {
  const slug = form.slug.trim();
  const category = form.category.trim() || 'default';
  const daysRaw = form.complaintWindowDays.trim();
  const body: KolamTermsTemplateSaveBody = {
    title: form.title.trim(),
    category,
    content: form.content,
    status: form.status === 'published' ? 'published' : 'draft',
    complaintWindowDays: daysRaw ? Math.trunc(Number(daysRaw)) : null,
  };
  if (slug) {
    body.slug = slug;
  }
  return body;
}

export function buildKolamTermsTemplateUpdateBody(
  form: KolamTermsTemplateFormState,
): KolamTermsTemplateSaveBody {
  const slug = form.slug.trim();
  const category = form.category.trim() || 'default';
  const daysRaw = form.complaintWindowDays.trim();
  const changeNote = form.changeNote.trim();
  const body: KolamTermsTemplateSaveBody = {
    title: form.title.trim(),
    category,
    content: form.content,
    complaintWindowDays: daysRaw ? Math.trunc(Number(daysRaw)) : null,
  };
  if (slug) {
    body.slug = slug;
  }
  if (changeNote) {
    body.changeNote = changeNote.slice(0, 500);
  }
  return body;
}

export function formatKolamTermsTemplateStatusLabel(
  status?: string | null,
): string {
  switch (String(status ?? '').toLowerCase()) {
    case 'draft':
      return 'Draf';
    case 'published':
      return 'Diterbitkan';
    case 'archived':
      return 'Diarsipkan';
    default:
      return status?.trim() || '—';
  }
}

export function getKolamTermsTemplateStatusIntent(
  status?: string | null,
): KolamStatusBadgeIntent {
  switch (String(status ?? '').toLowerCase()) {
    case 'published':
      return 'success';
    case 'draft':
      return 'warning';
    case 'archived':
      return 'muted';
    default:
      return 'outline';
  }
}

export function formatKolamTermsTemplateComplaintWindow(
  days: number | null | undefined,
): string {
  if (days == null || !Number.isFinite(days)) {
    return '—';
  }
  return String(Math.max(0, Math.trunc(days)));
}

export function canPublishKolamTermsTemplate(item: KolamTermsTemplate) {
  return item.status === 'draft' || item.status === 'archived';
}

export function canArchiveKolamTermsTemplate(item: KolamTermsTemplate) {
  return item.status === 'draft' || item.status === 'published';
}

export function normalizeKolamTermsTemplateStatus(
  value: unknown,
): KolamTermsTemplateStatus {
  const raw = String(value ?? '')
    .trim()
    .toLowerCase();
  if (raw === 'published' || raw === 'archived' || raw === 'draft') {
    return raw;
  }
  return 'draft';
}

export function normalizeKolamTermsTemplate(payload: unknown): KolamTermsTemplate {
  const root = asRecord(payload);
  let source = root;
  if (root.data && typeof root.data === 'object' && !Array.isArray(root.data)) {
    const data = asRecord(root.data);
    if (data._id || data.id || data.title || data.slug) {
      source = data;
    }
  }

  const complaintRaw = source.complaintWindowDays;
  let complaintWindowDays: number | null = null;
  if (complaintRaw === null || complaintRaw === undefined || complaintRaw === '') {
    complaintWindowDays = null;
  } else {
    const n = Number(complaintRaw);
    complaintWindowDays = Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : null;
  }

  return {
    id:
      getMongoId(source, '_id') ||
      getMongoId(source, 'id') ||
      getString(source, '_id') ||
      getString(source, 'id'),
    title: getString(source, 'title') || '—',
    slug: getString(source, 'slug'),
    category: getString(source, 'category') || 'default',
    status: normalizeKolamTermsTemplateStatus(source.status),
    version: getNumber(source, 'version') ?? 1,
    complaintWindowDays,
    content: typeof source.content === 'string' ? source.content : '',
    lastChangeNote: getString(source, 'lastChangeNote'),
    createdAt: getString(source, 'createdAt') || undefined,
    updatedAt: getString(source, 'updatedAt') || undefined,
    raw: payload,
  };
}

export function normalizeKolamTermsTemplateList(
  payload: unknown,
  query: KolamTermsTemplateListQuery = {},
): KolamTermsTemplateListResult {
  const root = unwrapData(payload);
  const nested = asRecord(root.data);
  const listSource = Array.isArray(root.data)
    ? root.data
    : Array.isArray(nested.data)
      ? nested.data
      : Array.isArray(payload)
        ? payload
        : [];
  const pagination = asRecord(
    nested.pagination || root.pagination || asRecord(payload).pagination,
  );

  const limit =
    query.limit ??
    getNumber(pagination, 'limit') ??
    getNumber(root, 'limit') ??
    50;
  const page =
    query.page ??
    getNumber(pagination, 'page') ??
    getNumber(root, 'page') ??
    1;
  const total =
    getNumber(pagination, 'total') ??
    getNumber(root, 'total') ??
    listSource.length;
  const totalPages =
    getNumber(pagination, 'totalPages') ??
    Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return {
    items: listSource
      .map(row => {
        try {
          return normalizeKolamTermsTemplate(row);
        } catch {
          return null;
        }
      })
      .filter((item): item is KolamTermsTemplate => Boolean(item?.id)),
    page,
    limit,
    total,
    totalPages,
  };
}

function unwrapData(payload: unknown): Record<string, unknown> {
  const root = asRecord(payload);
  if (root.success === true && root.data != null) {
    return asRecord(root.data);
  }
  return root;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function getString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return '';
}

function getNumber(
  record: Record<string, unknown>,
  key: string,
): number | undefined {
  const value = record[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function getMongoId(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  if (value && typeof value === 'object') {
    const nested = value as Record<string, unknown>;
    if (typeof nested.$oid === 'string' && nested.$oid.trim()) {
      return nested.$oid.trim();
    }
    if (typeof nested._id === 'string' && nested._id.trim()) {
      return nested._id.trim();
    }
  }
  return '';
}
