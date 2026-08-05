/**
 * Kolam Proyek (CustomProject) — native surface foundation (P0).
 * SoT: DA-Proyek-Plugin + BE plugins/proyek (`/api/custom-project`).
 */

import type { KolamStatusBadgeIntent } from '../components/kolam-status-badge-types';
import { formatRupiah } from '../lib/money';

export const KOLAM_PROYEK_ROOT = '/proyek';
export const KOLAM_PROYEK_NEW_ROUTE = `${KOLAM_PROYEK_ROOT}/new`;

export type KolamProyekPermissionAction =
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'update_status';

export type KolamProyekPermissionEntry = {
  resource?: string;
  actions?: string[];
};

export type KolamProyekLifecycleStatus =
  | 'draft'
  | 'quotation_sent'
  | 'revision_in_progress'
  | 'approved'
  | 'awaiting_dp'
  | 'dp_paid'
  | 'in_progress'
  | 'design_review'
  | 'delivered'
  | 'completed'
  | 'refunded'
  | 'cancelled';

export type KolamProyekProjectStatus = 'waiting' | 'in_progress' | 'completed';

export type KolamProyekPaymentMode = 'full' | 'staged';

export type KolamProyekSurfaceMode = 'list' | 'detail' | 'new' | 'edit';

export type KolamProyekSectionVisibility = 'active' | 'readonly' | 'hidden';

export type KolamProyekSectionKey =
  | 'quotationActions'
  | 'hppMaterials'
  | 'commission'
  | 'dpSchedule'
  | 'progressUpdate'
  | 'designReview'
  | 'closeProject'
  | 'projectReview'
  | 'lifecycleAdmin'
  | 'dangerDelete'
  | 'dangerCancel'
  | 'dangerRefund';

export type KolamProyekListItem = {
  id: string;
  quotationNumber: string;
  lifecycleStatus: KolamProyekLifecycleStatus | string;
  projectStatus: KolamProyekProjectStatus | string;
  clientName: string;
  clientId: string | null;
  designerName: string;
  designerId: string | null;
  progressPercent: number;
  contractValue: number;
  dealAmount: number;
  paymentMode: KolamProyekPaymentMode | string;
  saleId: string | null;
  saleInvoiceCode: string | null;
  linkedTaskId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  raw: unknown;
};

export type KolamProyekQuotationItem = {
  id: string;
  itemType: string;
  title: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  shippingCost: number;
  note: string;
};

export type KolamProyekHppMaterial = {
  id: string;
  label: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
  productId: string | null;
  speciesId: string | null;
  variantId: string | null;
  stockAppliedAt: string | null;
};

export type KolamProyekDpPaymentProof = {
  path: string;
  note: string;
  uploadedAt: string | null;
};

export type KolamProyekDpPaymentConfirmation = {
  index: number;
  amount: number;
  confirmedAt: string | null;
  note: string;
  reversedAt: string | null;
  reversalReason: string;
};

export type KolamProyekDpScheduleItem = {
  index: number;
  name: string;
  amount: number;
  amountReceived: number;
  paidAt: string | null;
  dueAt: string | null;
  kwitansiNumber: string | null;
  paymentProofs: KolamProyekDpPaymentProof[];
  paymentConfirmations: KolamProyekDpPaymentConfirmation[];
};

export type KolamProyekCommissionConfig = {
  daType: string;
  daValue: number;
  designerType: string;
  designerValue: number;
};

export type KolamProyekCommissionAccrual = {
  id: string;
  party: string;
  amount: number;
  status: string;
};

export type KolamProyekTermsTemplate = {
  id: string;
  title: string;
  content: string;
  complaintWindowDays: number | null;
};

export type KolamProyekNextStepAction =
  | 'send_quotation'
  | 'edit'
  | 'resend_quotation'
  | 'scroll_dp'
  | 'start_work'
  | 'scroll_design'
  | 'scroll_delivery'
  | 'close_project'
  | 'open_complaint';

export type KolamProyekNextStepHero = {
  stageLabel: string;
  badgeIntent: KolamStatusBadgeIntent;
  heading: string;
  description: string;
  primary?: {
    label: string;
    action: KolamProyekNextStepAction;
    disabled?: boolean;
    disabledReason?: string;
  };
  secondary?: Array<{label: string; action: KolamProyekNextStepAction}>;
};

export type KolamProyekProgressHistoryItem = {
  progressPercent: number;
  progressNote: string;
  at: string | null;
};

export type KolamProyekReviewDecision =
  | 'pending'
  | 'approved'
  | 'revision_requested'
  | 'rejected'
  | string;

export type KolamProyekReviewFile = {
  path: string;
  name: string;
  mimeType: string;
  fileSize: number;
};

export type KolamProyekReviewSubmission = {
  id: string;
  submittedAt: string | null;
  note: string;
  roundTitle: string;
  deadline: string | null;
  resolutionNote: string;
  files: KolamProyekReviewFile[];
  clientAttachments: KolamProyekReviewFile[];
  clientDecision: KolamProyekReviewDecision;
  decidedAt: string | null;
  revisionNote: string;
  rejectionReason: string;
};

export type KolamProyekSubmitRoundInput = {
  files: Array<{ uri: string; name?: string; mimeType?: string }>;
  note?: string;
  roundTitle?: string;
  deadline?: string;
  resolutionNote?: string;
};

export type KolamProyekLinkedTask = {
  id: string;
  title: string;
  status: string;
  workProgressPercent: number | null;
};

export type KolamProyekVarPreview = {
  contractValue: number;
  unexpectedExpenseTotal: number;
  materialsUsageTotal: number;
  varAmount: number;
};

export type KolamProyekCostBreakdown = {
  contractValue: number;
  produkToko: number;
  bahanTambahan: number;
  ongkir: number;
  manualHpp: number;
  totalHpp: number;
  unexpectedExpenseTotal: number;
  varAmount: number;
};

export type KolamProyekLifecycleHistoryItem = {
  from: string;
  to: string;
  note: string;
  at: string | null;
};

export type KolamProyekLinkedUnexpectedExpense = {
  id: string;
  code: string;
  name: string;
  amount: number;
  status: string;
  executedAt: string | null;
  vendorName: string;
  shippingAmount: number;
  allocationLabels: string[];
};

export type KolamProyekActivityEntry = {
  at: string;
  label: string;
};

export type KolamProyekDetail = KolamProyekListItem & {
  progressNote: string;
  maxWorkDays: number | null;
  targetCompletionDate: string | null;
  quotationDecision: string;
  itemCount: number;
  items: KolamProyekQuotationItem[];
  hppMaterials: KolamProyekHppMaterial[];
  hppManual: number;
  hppTotal: number;
  dpSchedule: KolamProyekDpScheduleItem[];
  dpAmount: number;
  minDpType: 'fixed' | 'percentage' | string;
  minDpValue: number;
  termsTemplateId: string | null;
  termsTemplates: KolamProyekTermsTemplate[];
  designReferenceEmbedUrl: string;
  commissionConfig: KolamProyekCommissionConfig | null;
  commissionAccruals: KolamProyekCommissionAccrual[];
  progressHistory: KolamProyekProgressHistoryItem[];
  lifecycleHistory: KolamProyekLifecycleHistoryItem[];
  linkedUnexpectedExpenses: KolamProyekLinkedUnexpectedExpense[];
  designSubmittedAt: string | null;
  designCheckedAt: string | null;
  designApprovedByClientAt: string | null;
  designSubmissions: KolamProyekReviewSubmission[];
  deliverySubmissions: KolamProyekReviewSubmission[];
  linkedTask: KolamProyekLinkedTask | null;
  saleStatus: string | null;
  saleFinalTotal: number | null;
  clientEmail: string | null;
  clientPhone: string | null;
  varPreview: KolamProyekVarPreview | null;
  costBreakdown: KolamProyekCostBreakdown;
  hasOpenComplaint: boolean;
  complaintId: string | null;
  complaintStatus: string | null;
};

export type KolamProyekQuotationFormItem = {
  key: string;
  customName: string;
  quantityText: string;
  unitPriceText: string;
  note: string;
};

export type KolamProyekQuotationFormState = {
  clientUserId: string;
  designerUserId: string;
  designerName: string;
  contractValueText: string;
  paymentMode: KolamProyekPaymentMode;
  minDpType: 'fixed' | 'percentage';
  minDpValueText: string;
  daType: 'fixed' | 'percentage';
  daValueText: string;
  designerType: 'fixed' | 'percentage';
  designerValueText: string;
  termsTemplateId: string;
  progressNote: string;
  designReferenceEmbedUrl: string;
  maxWorkDaysText: string;
  targetCompletionDate: string;
  items: KolamProyekQuotationFormItem[];
};

export type KolamProyekQuotationPayload = Record<string, unknown>;

export type KolamProyekListQuery = {
  page?: number;
  limit?: number;
  lifecycleStatus?: KolamProyekLifecycleStatus | '';
  customer?: string;
};

export type KolamProyekListResult = {
  items: KolamProyekListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const KOLAM_PROYEK_LIFECYCLE_FILTER_OPTIONS: Array<{
  value: '' | KolamProyekLifecycleStatus;
  label: string;
}> = [
  { value: '', label: 'Semua status' },
  { value: 'draft', label: 'Draft' },
  { value: 'quotation_sent', label: 'Penawaran terkirim' },
  { value: 'revision_in_progress', label: 'Revisi' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'awaiting_dp', label: 'Menunggu DP' },
  { value: 'dp_paid', label: 'DP lunas' },
  { value: 'in_progress', label: 'Dalam proses' },
  { value: 'design_review', label: 'Review desain' },
  { value: 'delivered', label: 'Dikirim' },
  { value: 'completed', label: 'Selesai' },
  { value: 'refunded', label: 'Refund' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

const LIFECYCLE_LABEL: Record<string, string> = {
  draft: 'Draft',
  quotation_sent: 'Penawaran terkirim',
  revision_in_progress: 'Revisi',
  approved: 'Disetujui',
  awaiting_dp: 'Menunggu DP',
  dp_paid: 'DP lunas',
  in_progress: 'Dalam proses',
  design_review: 'Review desain',
  delivered: 'Dikirim',
  completed: 'Selesai',
  refunded: 'Refund',
  cancelled: 'Dibatalkan',
};

/** Mirror FE `allowed-transitions.ts` / BE lifecycle-guard happy path. */
const ALLOWED_TRANSITIONS: Record<
  KolamProyekLifecycleStatus,
  readonly KolamProyekLifecycleStatus[]
> = {
  draft: ['quotation_sent', 'cancelled'],
  quotation_sent: ['revision_in_progress', 'approved', 'cancelled'],
  revision_in_progress: ['quotation_sent', 'cancelled'],
  approved: ['awaiting_dp', 'cancelled'],
  awaiting_dp: ['dp_paid', 'cancelled'],
  dp_paid: ['in_progress', 'refunded'],
  in_progress: ['refunded'],
  design_review: [],
  delivered: ['completed', 'refunded'],
  completed: [],
  refunded: [],
  cancelled: [],
};

const EXCEPTION_TARGETS = new Set<KolamProyekLifecycleStatus>([
  'refunded',
  'cancelled',
]);

/** Mirror FE `visibility.ts` matrix (intended stage-aware UI). */
const SECTION_VISIBILITY: Record<
  KolamProyekLifecycleStatus,
  Record<KolamProyekSectionKey, KolamProyekSectionVisibility>
> = {
  draft: {
    quotationActions: 'active',
    hppMaterials: 'active',
    commission: 'readonly',
    dpSchedule: 'hidden',
    progressUpdate: 'hidden',
    designReview: 'hidden',
    closeProject: 'hidden',
    projectReview: 'hidden',
    lifecycleAdmin: 'hidden',
    dangerDelete: 'active',
    dangerCancel: 'hidden',
    dangerRefund: 'hidden',
  },
  quotation_sent: {
    quotationActions: 'active',
    hppMaterials: 'active',
    commission: 'readonly',
    dpSchedule: 'hidden',
    progressUpdate: 'hidden',
    designReview: 'hidden',
    closeProject: 'hidden',
    projectReview: 'hidden',
    lifecycleAdmin: 'hidden',
    dangerDelete: 'hidden',
    dangerCancel: 'active',
    dangerRefund: 'hidden',
  },
  revision_in_progress: {
    quotationActions: 'active',
    hppMaterials: 'active',
    commission: 'readonly',
    dpSchedule: 'hidden',
    progressUpdate: 'hidden',
    designReview: 'hidden',
    closeProject: 'hidden',
    projectReview: 'hidden',
    lifecycleAdmin: 'hidden',
    dangerDelete: 'hidden',
    dangerCancel: 'active',
    dangerRefund: 'hidden',
  },
  approved: {
    quotationActions: 'readonly',
    hppMaterials: 'active',
    commission: 'active',
    dpSchedule: 'active',
    progressUpdate: 'hidden',
    designReview: 'hidden',
    closeProject: 'hidden',
    projectReview: 'hidden',
    lifecycleAdmin: 'active',
    dangerDelete: 'hidden',
    dangerCancel: 'active',
    dangerRefund: 'hidden',
  },
  awaiting_dp: {
    quotationActions: 'readonly',
    hppMaterials: 'active',
    commission: 'active',
    dpSchedule: 'active',
    progressUpdate: 'hidden',
    designReview: 'hidden',
    closeProject: 'hidden',
    projectReview: 'hidden',
    lifecycleAdmin: 'active',
    dangerDelete: 'hidden',
    dangerCancel: 'active',
    dangerRefund: 'hidden',
  },
  dp_paid: {
    quotationActions: 'readonly',
    hppMaterials: 'active',
    commission: 'active',
    dpSchedule: 'readonly',
    progressUpdate: 'hidden',
    designReview: 'hidden',
    closeProject: 'hidden',
    projectReview: 'hidden',
    lifecycleAdmin: 'active',
    dangerDelete: 'hidden',
    dangerCancel: 'hidden',
    dangerRefund: 'active',
  },
  in_progress: {
    quotationActions: 'readonly',
    hppMaterials: 'active',
    commission: 'active',
    dpSchedule: 'readonly',
    progressUpdate: 'active',
    designReview: 'active',
    closeProject: 'hidden',
    projectReview: 'hidden',
    lifecycleAdmin: 'active',
    dangerDelete: 'hidden',
    dangerCancel: 'hidden',
    dangerRefund: 'active',
  },
  design_review: {
    quotationActions: 'readonly',
    hppMaterials: 'active',
    commission: 'active',
    dpSchedule: 'readonly',
    progressUpdate: 'active',
    designReview: 'active',
    closeProject: 'hidden',
    projectReview: 'hidden',
    lifecycleAdmin: 'active',
    dangerDelete: 'hidden',
    dangerCancel: 'hidden',
    dangerRefund: 'active',
  },
  delivered: {
    quotationActions: 'readonly',
    hppMaterials: 'readonly',
    commission: 'active',
    dpSchedule: 'readonly',
    progressUpdate: 'readonly',
    designReview: 'readonly',
    closeProject: 'active',
    projectReview: 'active',
    lifecycleAdmin: 'active',
    dangerDelete: 'hidden',
    dangerCancel: 'hidden',
    dangerRefund: 'active',
  },
  completed: {
    quotationActions: 'readonly',
    hppMaterials: 'readonly',
    commission: 'readonly',
    dpSchedule: 'readonly',
    progressUpdate: 'readonly',
    designReview: 'readonly',
    closeProject: 'readonly',
    projectReview: 'readonly',
    lifecycleAdmin: 'hidden',
    dangerDelete: 'hidden',
    dangerCancel: 'hidden',
    dangerRefund: 'hidden',
  },
  cancelled: {
    quotationActions: 'readonly',
    hppMaterials: 'readonly',
    commission: 'readonly',
    dpSchedule: 'readonly',
    progressUpdate: 'hidden',
    designReview: 'hidden',
    closeProject: 'hidden',
    projectReview: 'hidden',
    lifecycleAdmin: 'hidden',
    dangerDelete: 'hidden',
    dangerCancel: 'readonly',
    dangerRefund: 'hidden',
  },
  refunded: {
    quotationActions: 'readonly',
    hppMaterials: 'readonly',
    commission: 'readonly',
    dpSchedule: 'readonly',
    progressUpdate: 'readonly',
    designReview: 'readonly',
    closeProject: 'hidden',
    projectReview: 'readonly',
    lifecycleAdmin: 'hidden',
    dangerDelete: 'hidden',
    dangerCancel: 'hidden',
    dangerRefund: 'readonly',
  },
};

function normalizeRoutePath(route: string) {
  const path = String(route || '').split('?')[0].trim();
  if (!path) {
    return '/';
  }
  return path.startsWith('/') ? path.replace(/\/+$/, '') || '/' : `/${path}`;
}

export function isKolamProyekQuotationRef(ref: string) {
  return /^QUO-/i.test(String(ref || '').trim());
}

export function isKolamProyekRoute(route: string) {
  const path = normalizeRoutePath(route);
  if (path === KOLAM_PROYEK_ROOT || path.startsWith(`${KOLAM_PROYEK_ROOT}/`)) {
    return true;
  }
  return (
    path === '/custom-project' || path.startsWith('/custom-project/')
  );
}

export function isKolamProyekListRoute(route: string) {
  const path = normalizeRoutePath(route);
  return (
    path === KOLAM_PROYEK_ROOT ||
    path === `${KOLAM_PROYEK_ROOT}/instances` ||
    path === '/custom-project' ||
    path === '/custom-project/instances'
  );
}

export function isKolamProyekNewRoute(route: string) {
  const path = normalizeRoutePath(route);
  return (
    path === KOLAM_PROYEK_NEW_ROUTE ||
    path === '/custom-project/instances/new'
  );
}

export function isKolamProyekEditRoute(route: string) {
  const path = normalizeRoutePath(route);
  return (
    /^\/proyek\/[^/]+\/edit$/.test(path) ||
    /^\/custom-project\/instances\/[^/]+\/edit$/.test(path)
  );
}

export function isKolamProyekDetailRoute(route: string) {
  const path = normalizeRoutePath(route);
  if (
    isKolamProyekListRoute(path) ||
    isKolamProyekNewRoute(path) ||
    isKolamProyekEditRoute(path)
  ) {
    return false;
  }
  return (
    /^\/proyek\/[^/]+$/.test(path) ||
    /^\/custom-project\/instances\/[^/]+$/.test(path)
  );
}

export function getKolamProyekSurfaceMode(
  route: string,
): KolamProyekSurfaceMode {
  if (isKolamProyekNewRoute(route)) {
    return 'new';
  }
  if (isKolamProyekEditRoute(route)) {
    return 'edit';
  }
  if (isKolamProyekDetailRoute(route)) {
    return 'detail';
  }
  return 'list';
}

export function getKolamProyekRouteRef(route: string): string | null {
  const path = normalizeRoutePath(route);
  const proyekEdit = path.match(/^\/proyek\/([^/]+)\/edit$/);
  if (proyekEdit?.[1]) {
    return decodeURIComponent(proyekEdit[1]);
  }
  const proyekDetail = path.match(/^\/proyek\/([^/]+)$/);
  if (
    proyekDetail?.[1] &&
    proyekDetail[1] !== 'new' &&
    proyekDetail[1] !== 'instances'
  ) {
    return decodeURIComponent(proyekDetail[1]);
  }
  const legacyEdit = path.match(/^\/custom-project\/instances\/([^/]+)\/edit$/);
  if (legacyEdit?.[1]) {
    return decodeURIComponent(legacyEdit[1]);
  }
  const legacyDetail = path.match(/^\/custom-project\/instances\/([^/]+)$/);
  if (legacyDetail?.[1] && legacyDetail[1] !== 'new') {
    return decodeURIComponent(legacyDetail[1]);
  }
  return null;
}

export function buildKolamProyekListRoute() {
  return KOLAM_PROYEK_ROOT;
}

export function buildKolamProyekNewRoute() {
  return KOLAM_PROYEK_NEW_ROUTE;
}

export function buildKolamProyekDetailRoute(ref: string) {
  const key = String(ref || '').trim();
  return `${KOLAM_PROYEK_ROOT}/${encodeURIComponent(key)}`;
}

export function buildKolamProyekEditRoute(ref: string, fallbackId?: string) {
  const key = isKolamProyekQuotationRef(ref)
    ? String(ref).trim()
    : String(fallbackId || ref || '').trim();
  return `${KOLAM_PROYEK_ROOT}/${encodeURIComponent(key)}/edit`;
}

/** Prefer quotation number in URL when available. */
export function buildKolamProyekDetailRouteForItem(
  item: Pick<KolamProyekListItem, 'id' | 'quotationNumber'>,
) {
  const ref = item.quotationNumber?.trim() || item.id;
  return buildKolamProyekDetailRoute(ref);
}

export function formatKolamProyekLifecycleLabel(status?: string | null) {
  const key = String(status || '').trim();
  return LIFECYCLE_LABEL[key] || key || 'Draft';
}

export function getKolamProyekLifecycleIntent(
  status?: string | null,
): KolamStatusBadgeIntent {
  switch (String(status || '').trim()) {
    case 'revision_in_progress':
    case 'awaiting_dp':
      return 'warning';
    case 'in_progress':
    case 'dp_paid':
    case 'design_review':
      return 'info';
    case 'completed':
    case 'approved':
    case 'delivered':
      return 'success';
    case 'cancelled':
    case 'refunded':
      return 'danger';
    default:
      return 'secondary';
  }
}

export function getKolamProyekSectionVisibility(
  status: string | null | undefined,
  section: KolamProyekSectionKey,
): KolamProyekSectionVisibility {
  const key = String(status || 'draft').trim() as KolamProyekLifecycleStatus;
  const row = SECTION_VISIBILITY[key] || SECTION_VISIBILITY.draft;
  return row[section] || 'hidden';
}

export function getKolamProyekHappyPathNext(
  current: string | null | undefined,
): KolamProyekLifecycleStatus[] {
  const key = String(current || '').trim() as KolamProyekLifecycleStatus;
  return (ALLOWED_TRANSITIONS[key] || []).filter(
    status => !EXCEPTION_TARGETS.has(status),
  );
}

export function getKolamProyekAllowedNext(
  current: string | null | undefined,
): KolamProyekLifecycleStatus[] {
  const key = String(current || '').trim() as KolamProyekLifecycleStatus;
  return [...(ALLOWED_TRANSITIONS[key] || [])];
}

/** Mirror FE `HAPPY_PATH` stepper sequence (excludes cancelled/refunded). */
export const KOLAM_PROYEK_HAPPY_PATH: KolamProyekLifecycleStatus[] = [
  'draft',
  'quotation_sent',
  'approved',
  'awaiting_dp',
  'dp_paid',
  'in_progress',
  'design_review',
  'delivered',
  'completed',
];

/** Mirror FE `NEXT_STEP_CTA` for Tahapan hint under the stepper. */
export const KOLAM_PROYEK_NEXT_STEP_CTA: Partial<
  Record<KolamProyekLifecycleStatus, string>
> = {
  draft: 'Kirim Penawaran ke Client',
  quotation_sent: 'Menunggu Respons Client',
  revision_in_progress: 'Kirim Ulang Penawaran',
  approved: 'Atur Jadwal DP',
  awaiting_dp: 'Catat Pembayaran DP',
  dp_paid: 'Mulai Pengerjaan',
  in_progress: 'Submit Desain',
  design_review: 'Approve / Minta Revisi Desain',
  delivered: 'Tutup Proyek',
};

export function getKolamProyekStepperStageState(
  status: string | null | undefined,
): {
  effective: KolamProyekLifecycleStatus;
  currentIndex: number;
  isTerminal: boolean;
  isRevising: boolean;
} {
  const key = (String(status || 'draft').trim() ||
    'draft') as KolamProyekLifecycleStatus;
  const isTerminal = key === 'cancelled' || key === 'refunded';
  const isRevising = key === 'revision_in_progress';
  const effective: KolamProyekLifecycleStatus = isRevising
    ? 'quotation_sent'
    : key;
  return {
    effective,
    currentIndex: KOLAM_PROYEK_HAPPY_PATH.indexOf(effective),
    isTerminal,
    isRevising,
  };
}

export function formatKolamProyekLifecycleTransitionLabel(
  to: string,
  from?: string | null,
) {
  if (from === 'design_review' && to === 'in_progress') {
    return 'Kembali ke Pengerjaan (revisi)';
  }
  if (from === 'revision_in_progress' && to === 'quotation_sent') {
    return 'Kirim Ulang Penawaran';
  }
  const labels: Partial<Record<string, string>> = {
    quotation_sent: 'Kirim Penawaran',
    revision_in_progress: 'Tandai Sedang Revisi',
    approved: 'Setujui Manual',
    awaiting_dp: 'Kirim Tagihan DP',
    dp_paid: 'Tandai DP Lunas (manual override)',
    in_progress: 'Mulai Pengerjaan',
    design_review: 'Kirim ke Review Desain',
    delivered: 'Tandai Sudah Dikirim',
    completed: 'Tandai Selesai',
  };
  return labels[to] || formatKolamProyekLifecycleLabel(to);
}

export function buildKolamProyekActivityEntries(
  detail: Pick<
    KolamProyekDetail,
    | 'progressHistory'
    | 'designSubmittedAt'
    | 'designCheckedAt'
    | 'designApprovedByClientAt'
    | 'dpSchedule'
  >,
): KolamProyekActivityEntry[] {
  const entries: KolamProyekActivityEntry[] = [];
  for (const item of detail.progressHistory ?? []) {
    if (!item.at) {
      continue;
    }
    const notePart = item.progressNote ? ` — ${item.progressNote}` : '';
    entries.push({
      at: item.at,
      label: `Progress ${item.progressPercent}%${notePart}`,
    });
  }
  if (detail.designSubmittedAt) {
    entries.push({at: detail.designSubmittedAt, label: 'Desain dikirim'});
  }
  if (detail.designCheckedAt) {
    entries.push({
      at: detail.designCheckedAt,
      label: 'Desain dicek internal',
    });
  }
  if (detail.designApprovedByClientAt) {
    entries.push({
      at: detail.designApprovedByClientAt,
      label: 'Client setujui desain',
    });
  }
  for (const row of detail.dpSchedule ?? []) {
    const dpLabel = row.name || String(row.index + 1);
    if (row.dueAt) {
      entries.push({at: row.dueAt, label: `DP ${dpLabel} ditagih`});
    }
    if (row.paidAt) {
      entries.push({at: row.paidAt, label: `DP ${dpLabel} dibayar`});
    }
  }
  return entries.sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );
}

/** Mirror FE `canEditProjectMaterials` — locked after delivered/terminal. */
export function canEditKolamProyekMaterials(status?: string | null) {
  const key = String(status || '').trim();
  return !['delivered', 'completed', 'cancelled', 'refunded'].includes(key);
}

export function buildKolamProyekHppPayload(
  lines: KolamProyekHppMaterial[],
): Array<Record<string, unknown>> {
  return lines
    .filter(
      line =>
        (line.productId || line.speciesId) && (Number(line.quantity) || 0) > 0,
    )
    .map(line => ({
      product: line.productId || null,
      species: line.speciesId || null,
      variant: line.variantId || null,
      quantity: Number(line.quantity) || 0,
      unitCost: Number(line.unitCost) || 0,
      subtotal:
        (Number(line.quantity) || 0) * (Number(line.unitCost) || 0),
    }));
}

export function isKolamProyekImagePath(path?: string | null) {
  return /\.(jpe?g|png|gif|webp|svg|avif)$/i.test(String(path || ''));
}

/** Quotation edit allowed only while draft / revision (BE DRAFT_EDITABLE_STATUSES). */
export function canEditKolamProyekQuotation(status?: string | null) {
  const key = String(status || '').trim();
  return key === 'draft' || key === 'revision_in_progress';
}

export function canSendKolamProyekQuotation(status?: string | null) {
  return String(status || '').trim() === 'draft';
}

export function canResendKolamProyekQuotation(status?: string | null) {
  return String(status || '').trim() === 'revision_in_progress';
}

export function canCancelKolamProyekQuotation(status?: string | null) {
  return (
    getKolamProyekSectionVisibility(status, 'dangerCancel') === 'active'
  );
}

/** Mirror FE DangerZone intent: lifecycle → refunded (BE-supported; not wallet Fase 3). */
export function canRefundKolamProyek(status?: string | null) {
  return (
    getKolamProyekSectionVisibility(status, 'dangerRefund') === 'active' &&
    getKolamProyekAllowedNext(status).includes('refunded')
  );
}

export function canDeleteKolamProyekQuotation(status?: string | null) {
  return getKolamProyekSectionVisibility(status, 'dangerDelete') === 'active';
}

/** Mirror BE `checkPermission("custom-project", action)` + super-admin. */
export function hasKolamProyekPermission(
  permissions: KolamProyekPermissionEntry[] | null | undefined,
  action: KolamProyekPermissionAction,
  roleKey?: string | null,
): boolean {
  const normalizedRole = String(roleKey ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  if (
    normalizedRole === 'super_administrator' ||
    normalizedRole === 'super_admin' ||
    normalizedRole === 'superadmin'
  ) {
    return true;
  }
  if (permissions == null) {
    return true;
  }
  const wanted = action.toLowerCase();
  return permissions.some(permission => {
    const resource = String(permission.resource ?? '')
      .trim()
      .toLowerCase();
    const actions = (permission.actions ?? []).map(item =>
      String(item).trim().toLowerCase(),
    );
    return (
      (resource === 'custom-project' ||
        resource === 'custom_project' ||
        resource === '*') &&
      (actions.includes(wanted) || actions.includes('*'))
    );
  });
}

/** Invoice PDF after quotation leaves early draft/sent/revision stages (FE detail). */
export function canDownloadKolamProyekInvoice(status?: string | null) {
  const key = String(status || '').trim();
  return ![
    '',
    'draft',
    'quotation_sent',
    'revision_in_progress',
    'cancelled',
  ].includes(key);
}

/** Finance confirm DP rows while schedule section is active (approved / awaiting_dp). */
export function canConfirmKolamProyekDp(
  status?: string | null,
  paymentMode?: string | null,
) {
  return (
    String(paymentMode || '').trim() === 'staged' &&
    getKolamProyekSectionVisibility(status, 'dpSchedule') === 'active'
  );
}

/** Start work only from dp_paid (BE PATCH lifecycle → in_progress). */
export function canStartKolamProyekWork(status?: string | null) {
  return String(status || '').trim() === 'dp_paid';
}

export function getKolamProyekDpRowOutstanding(row: KolamProyekDpScheduleItem) {
  return Math.max(
    0,
    (Number(row.amount) || 0) - (Number(row.amountReceived) || 0),
  );
}

export function computeKolamProyekOutstanding(
  detail: Pick<KolamProyekDetail, 'contractValue' | 'dealAmount' | 'dpSchedule'>,
) {
  const contract =
    Number(detail.contractValue) || Number(detail.dealAmount) || 0;
  const received = (detail.dpSchedule ?? []).reduce(
    (sum, row) => sum + (Number(row.amountReceived) || 0),
    0,
  );
  return Math.max(0, contract - received);
}

export function computeKolamProyekCommissionPreview(
  detail: Pick<
    KolamProyekDetail,
    'commissionConfig' | 'costBreakdown' | 'lifecycleStatus'
  >,
): {daAmount: number; designerAmount: number; basis: number} | null {
  if (
    getKolamProyekSectionVisibility(detail.lifecycleStatus, 'commission') ===
    'hidden'
  ) {
    return null;
  }
  const cfg = detail.commissionConfig;
  if (!cfg) {
    return null;
  }
  const basis = Number(detail.costBreakdown.varAmount) || 0;
  const daAmount =
    cfg.daType === 'fixed'
      ? Number(cfg.daValue) || 0
      : Math.round((basis * (Number(cfg.daValue) || 0)) / 100);
  const designerAmount =
    cfg.designerType === 'fixed'
      ? Number(cfg.designerValue) || 0
      : Math.round((basis * (Number(cfg.designerValue) || 0)) / 100);
  return {daAmount, designerAmount, basis};
}

export function formatKolamProyekComplaintWindowLabel(
  templates: KolamProyekTermsTemplate[],
) {
  const days = templates
    .map(item => item.complaintWindowDays)
    .filter((value): value is number => value != null && value > 0);
  if (days.length === 0) {
    return 'Ikut template TOS';
  }
  return `${Math.max(...days)} hari pasca selesai`;
}

/** Mirror FE `resolveHero` in NextStepHero / InstanceDetail. */
export function resolveKolamProyekNextStepHero(
  detail: KolamProyekDetail,
): KolamProyekNextStepHero {
  const status = detail.lifecycleStatus || 'draft';
  const outstanding = computeKolamProyekOutstanding(detail);
  const contract =
    Number(detail.contractValue) || Number(detail.dealAmount) || 0;

  switch (status) {
    case 'draft':
      return {
        stageLabel: 'Draft',
        badgeIntent: 'info',
        heading: 'Lengkapi & kirim penawaran',
        description:
          'Pastikan item, nilai kontrak, dan T&C sudah lengkap sebelum dikirim ke client.',
        primary: {
          label: 'Kirim ke Client',
          action: 'send_quotation',
          disabled: contract <= 0,
          disabledReason: contract <= 0 ? 'Isi nilai kontrak' : undefined,
        },
        secondary: [{label: 'Edit Draf', action: 'edit'}],
      };
    case 'quotation_sent':
      return {
        stageLabel: 'Penawaran terkirim',
        badgeIntent: 'warning',
        heading: 'Menunggu Keputusan Client',
        description:
          'Surat penawaran sudah terkirim. Tunggu client setujui / minta revisi / batalkan. Admin tidak perlu aksi.',
      };
    case 'revision_in_progress':
      return {
        stageLabel: 'Revisi',
        badgeIntent: 'warning',
        heading: 'Kirim Ulang Penawaran Setelah Revisi',
        description:
          'Client minta revisi. Perbarui item / harga / T&C dulu, lalu kirim ulang.',
        primary: {
          label: 'Kirim Ulang',
          action: 'resend_quotation',
        },
        secondary: [{label: 'Edit Draf', action: 'edit'}],
      };
    case 'approved':
    case 'awaiting_dp':
      return {
        stageLabel: status === 'approved' ? 'Disetujui' : 'Menunggu DP',
        badgeIntent: 'info',
        heading: 'Catat Pembayaran DP',
        description:
          'Client sudah setuju kontrak. Minta pembayaran atau catat bukti transfer DP.',
        primary: {label: 'Ke Jadwal DP', action: 'scroll_dp'},
      };
    case 'dp_paid':
      return {
        stageLabel: 'DP Lunas',
        badgeIntent: 'success',
        heading: 'Mulai Pengerjaan',
        description:
          'DP sudah diterima dan dikonfirmasi. Mulai pengerjaan untuk aktifkan submit desain + input progress.',
        primary: {label: 'Mulai Pengerjaan', action: 'start_work'},
      };
    case 'in_progress':
      return {
        stageLabel: 'Dikerjakan',
        badgeIntent: 'info',
        heading: 'Kirim Desain ke Client',
        description:
          'Unggah hasil desain untuk direview client. Revisi bisa dilakukan dari Review Desain.',
        primary: {label: 'Ke Review Desain', action: 'scroll_design'},
      };
    case 'design_review':
      return {
        stageLabel: 'Review Desain',
        badgeIntent: 'warning',
        heading: 'Menunggu Keputusan Client',
        description:
          'Desain terkirim. Client sedang review — setujui / minta revisi / tolak. Tidak perlu aksi admin sekarang.',
      };
    case 'delivered': {
      const lastDelivery = getLatestKolamProyekReviewSubmission(
        detail.deliverySubmissions,
      );
      if (!lastDelivery) {
        return {
          stageLabel: 'Dikirim',
          badgeIntent: 'success',
          heading: 'Kirim Bukti Pengerjaan',
          description:
            'Unggah foto/video/PDF hasil pekerjaan. Client akan mereview sebelum proyek bisa diselesaikan.',
          primary: {
            label: 'Kirim Bukti Pengerjaan',
            action: 'scroll_delivery',
          },
        };
      }
      if (lastDelivery.clientDecision === 'pending') {
        return {
          stageLabel: 'Dikirim',
          badgeIntent: 'warning',
          heading: 'Menunggu Keputusan Client',
          description:
            'Bukti Pengerjaan sudah dikirim. Tunggu client setujui / minta revisi / tolak. Tidak perlu aksi admin sekarang.',
        };
      }
      if (lastDelivery.clientDecision === 'revision_requested') {
        const revNote = lastDelivery.revisionNote
          ? ` Catatan client: ${lastDelivery.revisionNote}`
          : '';
        return {
          stageLabel: 'Dikirim',
          badgeIntent: 'warning',
          heading: 'Kirim Ulang Bukti Pengerjaan',
          description: `Client minta revisi Bukti Pengerjaan.${revNote}`,
          primary: {
            label: 'Kirim Ulang Bukti',
            action: 'scroll_delivery',
          },
        };
      }
      if (lastDelivery.clientDecision === 'rejected') {
        const rejReason = lastDelivery.rejectionReason
          ? ` Alasan: ${lastDelivery.rejectionReason}`
          : '';
        return {
          stageLabel: 'Dikirim',
          badgeIntent: 'danger',
          heading: 'Client Tolak Bukti',
          description: `Client menolak Bukti Pengerjaan.${rejReason}`,
        };
      }
      const progressNow = Number(detail.progressPercent) || 0;
      const progressBlocked = progressNow < 100;
      const paymentBlocked = outstanding > 0;
      return {
        stageLabel: 'Dikirim',
        badgeIntent: 'success',
        heading: 'Selesaikan Proyek',
        description:
          'Bukti Pengerjaan disetujui client & pembayaran lunas. Finalisasi membuat invoice penjualan dan akru komisi.',
        primary: {
          label: 'Selesaikan Proyek',
          action: 'close_project',
          disabled: paymentBlocked || progressBlocked,
          disabledReason: paymentBlocked
            ? `Pembayaran belum lunas (${formatRupiah(outstanding)})`
            : progressBlocked
              ? `Progress masih ${progressNow}%. Update ke 100% dulu.`
              : undefined,
        },
      };
    }
    case 'completed': {
      if (detail.hasOpenComplaint) {
        return {
          stageLabel: 'Komplain Dibuka',
          badgeIntent: 'danger',
          heading: 'Komplain Dibuka Client',
          description: detail.complaintStatus
            ? `Client membuka komplain (status: ${detail.complaintStatus}). Buka halaman komplain untuk review.`
            : 'Client membuka komplain. Buka halaman komplain untuk review dan set keputusan.',
          primary: detail.complaintId
            ? {
                label: 'Lihat Komplain',
                action: 'open_complaint',
              }
            : undefined,
        };
      }
      return {
        stageLabel: 'Selesai',
        badgeIntent: 'success',
        heading: 'Arsip Proyek',
        description:
          'Proyek sudah selesai. Komisi terakru dan siap dirilis via menu Finance (Rilis Komisi).',
      };
    }
    case 'cancelled':
      return {
        stageLabel: 'Dibatalkan',
        badgeIntent: 'danger',
        heading: 'Proyek Dibatalkan',
        description:
          'Proyek tidak dilanjutkan. Cek riwayat tahapan untuk alasan pembatalan.',
      };
    case 'refunded':
      return {
        stageLabel: 'Refund',
        badgeIntent: 'warning',
        heading: 'Proyek di-Refund',
        description:
          'Pembayaran dikembalikan ke client. Cek transaksi wallet untuk detail.',
      };
    default:
      return {
        stageLabel: String(status),
        badgeIntent: 'info',
        heading: 'Status tidak dikenal',
        description: `Status "${status}" tidak punya mapping langkah selanjutnya.`,
      };
  }
}

export function formatKolamProyekDpRowStatusLabel(row: KolamProyekDpScheduleItem) {
  if (row.paidAt) {
    return 'Lunas';
  }
  if ((Number(row.amountReceived) || 0) > 0) {
    return 'Sebagian';
  }
  if ((row.paymentProofs?.length ?? 0) > 0) {
    return 'Bukti Terkirim';
  }
  return 'Menunggu';
}

export function getKolamProyekDpRowStatusIntent(
  row: KolamProyekDpScheduleItem,
): KolamStatusBadgeIntent {
  if (row.paidAt) {
    return 'success';
  }
  if ((Number(row.amountReceived) || 0) > 0) {
    return 'info';
  }
  if ((row.paymentProofs?.length ?? 0) > 0) {
    return 'warning';
  }
  return 'secondary';
}

export function validateKolamProyekLifecycleNote(note: string) {
  if (String(note || '').trim().length < 5) {
    return 'Catatan minimal 5 karakter.';
  }
  return null;
}

export function validateKolamProyekDpConfirmAmount(
  amount: number,
  outstanding: number,
) {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Jumlah harus lebih dari 0.';
  }
  if (amount > outstanding + 0.0001) {
    return 'Jumlah melebihi sisa tagihan baris ini.';
  }
  return null;
}

export function getLatestKolamProyekReviewSubmission(
  submissions: KolamProyekReviewSubmission[],
) {
  if (!submissions.length) {
    return null;
  }
  return submissions[submissions.length - 1] ?? null;
}

export function isKolamProyekLinkedTaskDone(
  task: KolamProyekLinkedTask | null | undefined,
) {
  return String(task?.status || '')
    .trim()
    .toLowerCase() === 'done';
}

export function canUpdateKolamProyekProgress(status?: string | null) {
  return (
    getKolamProyekSectionVisibility(status, 'progressUpdate') === 'active'
  );
}

export function canSubmitKolamProyekDesign(
  detail: Pick<
    KolamProyekDetail,
    'lifecycleStatus' | 'designSubmissions'
  > | null,
) {
  if (!detail || detail.lifecycleStatus !== 'in_progress') {
    return false;
  }
  const latest = getLatestKolamProyekReviewSubmission(detail.designSubmissions);
  return latest?.clientDecision !== 'pending';
}

export function canSubmitKolamProyekDelivery(
  detail: Pick<
    KolamProyekDetail,
    'lifecycleStatus' | 'deliverySubmissions'
  > | null,
) {
  if (!detail || detail.lifecycleStatus !== 'delivered') {
    return false;
  }
  const latest = getLatestKolamProyekReviewSubmission(
    detail.deliverySubmissions,
  );
  if (!latest) {
    return true;
  }
  if (latest.clientDecision === 'pending') {
    return false;
  }
  if (latest.clientDecision === 'approved') {
    return false;
  }
  return true;
}

export function getKolamProyekCloseBlockReason(
  detail: KolamProyekDetail | null,
): string | null {
  if (!detail || detail.lifecycleStatus !== 'delivered') {
    return null;
  }
  const latest = getLatestKolamProyekReviewSubmission(
    detail.deliverySubmissions,
  );
  if (!latest) {
    return 'Bukti pengerjaan belum dikirim.';
  }
  if (latest.clientDecision !== 'approved') {
    if (latest.clientDecision === 'pending') {
      return 'Menunggu approve bukti pengerjaan dari klien.';
    }
    if (latest.clientDecision === 'revision_requested') {
      return 'Klien minta revisi bukti pengerjaan.';
    }
    if (latest.clientDecision === 'rejected') {
      return 'Klien menolak bukti pengerjaan.';
    }
    return 'Bukti pengerjaan belum disetujui klien.';
  }
  if ((Number(detail.progressPercent) || 0) < 100) {
    return `Progress masih ${Math.round(detail.progressPercent)}%. Update ke 100% dulu.`;
  }
  return null;
}

export function canCloseKolamProyek(detail: KolamProyekDetail | null) {
  if (!detail) {
    return false;
  }
  if (
    getKolamProyekSectionVisibility(detail.lifecycleStatus, 'closeProject') !==
    'active'
  ) {
    return false;
  }
  return getKolamProyekCloseBlockReason(detail) == null;
}

export function validateKolamProyekProgressUpdate(
  nextPercent: number,
  currentPercent: number,
) {
  if (!Number.isFinite(nextPercent) || nextPercent < 0 || nextPercent > 100) {
    return 'Progress harus antara 0–100.';
  }
  if (nextPercent < currentPercent) {
    return `Progress hanya boleh naik atau tetap (saat ini ${Math.round(currentPercent)}%).`;
  }
  return null;
}

export function validateKolamProyekSubmitRound(
  input: KolamProyekSubmitRoundInput,
) {
  if (!input.files.length) {
    return 'Pilih minimal 1 file.';
  }
  if (input.files.length > 10) {
    return 'Maksimal 10 file per kiriman.';
  }
  return null;
}

export function formatKolamProyekReviewDecisionLabel(
  decision?: string | null,
) {
  switch (String(decision || '').trim()) {
    case 'approved':
      return 'Disetujui klien';
    case 'revision_requested':
      return 'Diminta revisi';
    case 'rejected':
      return 'Ditolak klien';
    case 'pending':
      return 'Menunggu review';
    default:
      return decision || '—';
  }
}

export function getKolamProyekReviewDecisionIntent(
  decision?: string | null,
): KolamStatusBadgeIntent {
  switch (String(decision || '').trim()) {
    case 'approved':
      return 'success';
    case 'revision_requested':
      return 'warning';
    case 'rejected':
      return 'danger';
    case 'pending':
      return 'info';
    default:
      return 'secondary';
  }
}

export function createEmptyKolamProyekQuotationForm(): KolamProyekQuotationFormState {
  return {
    clientUserId: '',
    designerUserId: '',
    designerName: '',
    contractValueText: '',
    paymentMode: 'full',
    minDpType: 'percentage',
    minDpValueText: '50',
    daType: 'percentage',
    daValueText: '20',
    designerType: 'percentage',
    designerValueText: '80',
    termsTemplateId: '',
    progressNote: '',
    designReferenceEmbedUrl: '',
    maxWorkDaysText: '',
    targetCompletionDate: '',
    items: [],
  };
}

export function createKolamProyekQuotationFormFromDetail(
  detail: KolamProyekDetail,
): KolamProyekQuotationFormState {
  const commission = detail.commissionConfig;
  return {
    clientUserId: detail.clientId || '',
    designerUserId: detail.designerId || '',
    designerName:
      detail.designerName === '—' ? '' : detail.designerName || '',
    contractValueText:
      detail.contractValue > 0 ? String(detail.contractValue) : '',
    paymentMode: detail.paymentMode === 'staged' ? 'staged' : 'full',
    minDpType: detail.minDpType === 'fixed' ? 'fixed' : 'percentage',
    minDpValueText:
      detail.minDpValue > 0
        ? String(detail.minDpValue)
        : detail.dpAmount > 0
          ? String(detail.dpAmount)
          : '50',
    daType: commission?.daType === 'fixed' ? 'fixed' : 'percentage',
    daValueText:
      commission?.daValue != null ? String(commission.daValue) : '20',
    designerType:
      commission?.designerType === 'fixed' ? 'fixed' : 'percentage',
    designerValueText:
      commission?.designerValue != null
        ? String(commission.designerValue)
        : '80',
    termsTemplateId: detail.termsTemplateId || '',
    progressNote: detail.progressNote || '',
    designReferenceEmbedUrl: detail.designReferenceEmbedUrl || '',
    maxWorkDaysText:
      detail.maxWorkDays != null ? String(detail.maxWorkDays) : '',
    targetCompletionDate: detail.targetCompletionDate
      ? detail.targetCompletionDate.slice(0, 10)
      : '',
    items: detail.items
      .filter(item => item.itemType === 'custom' || !item.itemType)
      .map((item, index) => ({
        key: item.id || `item-${index}`,
        customName: item.title,
        quantityText: String(item.quantity || 1),
        unitPriceText: String(item.unitPrice || 0),
        note: item.note || '',
      })),
  };
}

export function createKolamProyekQuotationFormItem(): KolamProyekQuotationFormItem {
  return {
    key: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    customName: '',
    quantityText: '1',
    unitPriceText: '',
    note: '',
  };
}

export function validateKolamProyekQuotationForm(
  form: KolamProyekQuotationFormState,
): string | null {
  if (!form.clientUserId.trim()) {
    return 'Pilih pelanggan dulu.';
  }
  if (!form.designerUserId.trim()) {
    return 'Designer / PIC wajib dipilih.';
  }
  if (form.clientUserId.trim() === form.designerUserId.trim()) {
    return 'PIC tidak boleh sama dengan pelanggan.';
  }
  const contractValue = parseMoneyText(form.contractValueText);
  if (contractValue <= 0) {
    return 'Nilai kontrak harus lebih dari 0.';
  }
  if (form.paymentMode === 'staged') {
    const minDpValue = Number(form.minDpValueText) || 0;
    const dpNominal =
      form.minDpType === 'percentage'
        ? Math.round((contractValue * minDpValue) / 100)
        : minDpValue;
    const minRequired = Math.ceil(contractValue * 0.5);
    if (dpNominal < minRequired) {
      return `DP minimum 50% kontrak (${minRequired.toLocaleString('id-ID')}).`;
    }
  }
  for (const item of form.items) {
    if (!item.customName.trim()) {
      return 'Nama item kustom wajib diisi.';
    }
    if ((Number(item.quantityText) || 0) <= 0) {
      return 'Qty item harus lebih dari 0.';
    }
  }
  return null;
}

export function buildKolamProyekQuotationPayload(
  form: KolamProyekQuotationFormState,
): KolamProyekQuotationPayload {
  const contractValue = parseMoneyText(form.contractValueText);
  const minDpValueRaw = Number(form.minDpValueText) || 0;
  const dpAmount =
    form.paymentMode === 'staged' && form.minDpType === 'percentage'
      ? Math.round((contractValue * minDpValueRaw) / 100)
      : minDpValueRaw;

  const body: KolamProyekQuotationPayload = {
    clientUserId: form.clientUserId.trim(),
    contractValue,
    designerUser: form.designerUserId.trim(),
    progressNote: form.progressNote.trim(),
    designReferenceEmbedUrl: form.designReferenceEmbedUrl.trim(),
    paymentMode: form.paymentMode,
    dpEnabled: form.paymentMode === 'staged',
    dpAmount,
    minDpType: form.minDpType,
    minDpValue: minDpValueRaw,
    commissionConfig: {
      daType: form.daType,
      daValue: Number(form.daValueText) || 0,
      designerType: form.designerType,
      designerValue: Number(form.designerValueText) || 0,
    },
  };

  if (form.designerName.trim()) {
    body.designerName = form.designerName.trim();
  }
  if (form.maxWorkDaysText.trim()) {
    body.maxWorkDays = Math.max(0, Number(form.maxWorkDaysText) || 0);
  } else {
    body.maxWorkDays = null;
  }
  if (form.targetCompletionDate.trim()) {
    body.targetCompletionDate = form.targetCompletionDate.trim();
  } else {
    body.targetCompletionDate = null;
  }
  if (form.termsTemplateId.trim()) {
    body.termsTemplateId = form.termsTemplateId.trim();
  }
  if (form.items.length > 0) {
    body.items = form.items.map(item => {
      const quantity = Number(item.quantityText) || 0;
      const unitPrice = parseMoneyText(item.unitPriceText);
      return {
        itemType: 'custom',
        customName: item.customName.trim(),
        quantity,
        unitPrice,
        subtotal: quantity * unitPrice,
        note: item.note.trim() || undefined,
      };
    });
  }

  return body;
}

function parseMoneyText(value: string) {
  const digits = String(value || '').replace(/[^\d.-]/g, '');
  if (!digits) {
    return 0;
  }
  return Number(digits) || 0;
}

export function formatKolamProyekPaymentModeLabel(mode?: string | null) {
  return String(mode || '').trim() === 'staged' ? 'DP berjenjang' : 'Lunas di muka';
}

export function formatKolamProyekItemTypeLabel(itemType?: string | null) {
  switch (String(itemType || '').trim()) {
    case 'product':
      return 'Produk';
    case 'species':
      return 'Species';
    case 'service':
      return 'Layanan';
    case 'custom':
      return 'Kustom';
    default:
      return itemType || '—';
  }
}

export function computeKolamProyekCostBreakdown(input: {
  contractValue: number;
  hppMaterials: KolamProyekHppMaterial[];
  hppManual: number;
  items: KolamProyekQuotationItem[];
  varPreview: KolamProyekVarPreview | null;
}): KolamProyekCostBreakdown {
  const contractValue = Number(input.contractValue) || 0;
  const produkToko = input.hppMaterials.reduce(
    (sum, line) => sum + (Number(line.subtotal) || 0),
    0,
  );
  const unexpectedExpenseTotal = input.varPreview?.unexpectedExpenseTotal ?? 0;
  const hasUe = input.varPreview != null;
  const bahanTambahan = hasUe
    ? unexpectedExpenseTotal
    : input.items.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
  const ongkir = hasUe
    ? 0
    : input.items.reduce(
        (sum, item) => sum + (Number(item.shippingCost) || 0),
        0,
      );
  const manualHpp = Number(input.hppManual) || 0;
  const totalHpp = produkToko + bahanTambahan + ongkir + manualHpp;
  const varAmount =
    input.varPreview?.varAmount ??
    Math.max(0, contractValue - produkToko - bahanTambahan);

  return {
    contractValue,
    produkToko,
    bahanTambahan,
    ongkir,
    manualHpp,
    totalHpp,
    unexpectedExpenseTotal,
    varAmount,
  };
}

export function normalizeKolamProyekListItem(
  payload: unknown,
): KolamProyekListItem | null {
  const record = asRecord(unwrapData(payload));
  const id = getId(record);
  if (!id) {
    return null;
  }
  const client = asRecord(record.clientUser);
  const designer = asRecord(record.designerUser);
  const sale = asRecord(record.sale);
  const linkedTask = asRecord(record.linkedTask);

  return {
    id,
    quotationNumber: getString(record, 'quotationNumber'),
    lifecycleStatus: getString(record, 'lifecycleStatus') || 'draft',
    projectStatus: getString(record, 'projectStatus') || 'waiting',
    clientName:
      getString(client, 'name') ||
      (typeof record.clientUser === 'string' ? record.clientUser : '') ||
      '—',
    clientId: getId(client) || (typeof record.clientUser === 'string'
      ? record.clientUser
      : null),
    designerName:
      getString(record, 'designerName') ||
      [
        getString(designer, 'first_name'),
        getString(designer, 'last_name'),
      ]
        .filter(Boolean)
        .join(' ')
        .trim() ||
      getString(designer, 'username') ||
      '—',
    designerId:
      getId(designer) ||
      (typeof record.designerUser === 'string' ? record.designerUser : null),
    progressPercent: getNumber(record, 'progressPercent') ?? 0,
    contractValue: getNumber(record, 'contractValue') ?? 0,
    dealAmount: getNumber(record, 'dealAmount') ?? 0,
    paymentMode: getString(record, 'paymentMode') || 'full',
    saleId:
      getId(sale) ||
      (typeof record.sale === 'string' ? record.sale : null),
    saleInvoiceCode: getString(sale, 'invoiceCode') || null,
    linkedTaskId:
      getId(linkedTask) ||
      (typeof record.linkedTask === 'string' ? record.linkedTask : null),
    createdAt: getString(record, 'createdAt') || null,
    updatedAt: getString(record, 'updatedAt') || null,
    raw: payload,
  };
}

export function normalizeKolamProyekDetail(
  payload: unknown,
): KolamProyekDetail | null {
  const base = normalizeKolamProyekListItem(payload);
  if (!base) {
    return null;
  }
  const record = asRecord(unwrapData(payload));
  const client = asRecord(record.clientUser);
  const rawItems = Array.isArray(record.items) ? record.items : [];
  const items = rawItems.map((row, index) =>
    normalizeQuotationItem(row, index),
  );
  const hppMaterials = (
    Array.isArray(record.hppFromMaterials) ? record.hppFromMaterials : []
  ).map((row, index) => normalizeHppMaterial(row, index));
  const dpSchedule = (
    Array.isArray(record.dpSchedule) ? record.dpSchedule : []
  ).map((row, index) => normalizeDpScheduleItem(row, index));
  const progressHistory = (
    Array.isArray(record.progressHistory) ? record.progressHistory : []
  )
    .map(normalizeProgressHistoryItem)
    .filter((item): item is KolamProyekProgressHistoryItem => Boolean(item))
    .sort((a, b) => {
      const aTime = a.at ? new Date(a.at).getTime() : 0;
      const bTime = b.at ? new Date(b.at).getTime() : 0;
      return bTime - aTime;
    });

  const designSubmissions = (
    Array.isArray(record.designSubmissions) ? record.designSubmissions : []
  ).map((row, index) => normalizeReviewSubmission(row, index));
  const deliverySubmissions = (
    Array.isArray(record.deliverySubmissions)
      ? record.deliverySubmissions
      : []
  ).map((row, index) => normalizeReviewSubmission(row, index));

  const commissionRecord = asRecord(record.commissionConfig);
  const commissionConfig =
    Object.keys(commissionRecord).length > 0
      ? {
          daType: getString(commissionRecord, 'daType') || 'percentage',
          daValue: getNumber(commissionRecord, 'daValue') ?? 0,
          designerType:
            getString(commissionRecord, 'designerType') || 'percentage',
          designerValue: getNumber(commissionRecord, 'designerValue') ?? 0,
        }
      : null;

  const linkedTaskRecord = asRecord(record.linkedTask);
  const linkedTaskId =
    getId(linkedTaskRecord) ||
    (typeof record.linkedTask === 'string' ? record.linkedTask : null);
  const linkedTask: KolamProyekLinkedTask | null = linkedTaskId
    ? {
        id: linkedTaskId,
        title: getString(linkedTaskRecord, 'title') || 'Tugas proyek',
        status: getString(linkedTaskRecord, 'status') || '—',
        workProgressPercent: getNumber(
          linkedTaskRecord,
          'workProgressPercent',
        ),
      }
    : null;

  const sale = asRecord(record.sale);
  const varRecord = asRecord(record.varPreview);
  const varPreview =
    Object.keys(varRecord).length > 0
      ? {
          contractValue: getNumber(varRecord, 'contractValue') ?? 0,
          unexpectedExpenseTotal:
            getNumber(varRecord, 'unexpectedExpenseTotal') ?? 0,
          materialsUsageTotal: getNumber(varRecord, 'materialsUsageTotal') ?? 0,
          varAmount: getNumber(varRecord, 'varAmount') ?? 0,
        }
      : null;

  const hppManual = getNumber(record, 'hppManual') ?? 0;
  const costBreakdown = computeKolamProyekCostBreakdown({
    contractValue: base.contractValue || base.dealAmount,
    hppMaterials,
    hppManual,
    items,
    varPreview,
  });

  const effectiveProgress =
    linkedTask?.workProgressPercent != null
      ? linkedTask.workProgressPercent
      : base.progressPercent;

  const termsTemplatesRaw = Array.isArray(record.termsTemplates)
    ? record.termsTemplates
    : [];
  const termsTemplates: KolamProyekTermsTemplate[] = termsTemplatesRaw
    .map((row, index) => {
      if (typeof row === 'string') {
        return {
          id: row,
          title: row,
          content: '',
          complaintWindowDays: null,
        };
      }
      const item = asRecord(row);
      const id = getId(item);
      if (!id && !getString(item, 'title')) {
        return null;
      }
      return {
        id: id || `terms-${index}`,
        title: getString(item, 'title') || `Template ${index + 1}`,
        content: getString(item, 'content'),
        complaintWindowDays: getNumber(item, 'complaintWindowDays'),
      };
    })
    .filter((item): item is KolamProyekTermsTemplate => Boolean(item));
  const firstTerms = termsTemplates[0] ?? null;
  const termsSnapshot = asRecord(record.termsSnapshot);
  const termsTemplateId =
    firstTerms?.id ||
    getId(termsSnapshot) ||
    getString(termsSnapshot, 'source') ||
    getString(record, 'termsTemplateId') ||
    null;

  const commissionAccruals = (
    Array.isArray(record.commissionAccruals) ? record.commissionAccruals : []
  ).map((row, index) => {
    const item = asRecord(row);
    return {
      id: getId(item) || `accrual-${index}`,
      party:
        getString(item, 'party') ||
        getString(item, 'role') ||
        getString(item, 'type') ||
        '—',
      amount:
        getNumber(item, 'amount') ??
        getNumber(item, 'accruedAmount') ??
        getNumber(item, 'value') ??
        0,
      status: getString(item, 'status') || 'accrued',
    };
  });

  const lifecycleHistory = (
    Array.isArray(record.lifecycleHistory) ? record.lifecycleHistory : []
  )
    .map(row => {
      const item = asRecord(row);
      const to = getString(item, 'to');
      if (!to) {
        return null;
      }
      return {
        from: getString(item, 'from'),
        to,
        note: getString(item, 'note'),
        at: getString(item, 'at') || null,
      };
    })
    .filter((item): item is KolamProyekLifecycleHistoryItem => Boolean(item));

  const linkedUnexpectedExpenses = (
    Array.isArray(record.linkedUnexpectedExpenses)
      ? record.linkedUnexpectedExpenses
      : []
  ).map((row, index) => {
    const item = asRecord(row);
    const allocations = Array.isArray(item.materialAllocations)
      ? item.materialAllocations
      : [];
    const allocationLabels = allocations.map(allocationPayload => {
      const allocation = asRecord(allocationPayload);
      const product = asRecord(allocation.product);
      const species = asRecord(allocation.species);
      const service = asRecord(allocation.service);
      const label =
        getString(allocation, 'customName') ||
        getString(product, 'name') ||
        getString(species, 'localName') ||
        getString(species, 'commonName') ||
        getString(service, 'name') ||
        getString(allocation, 'itemType') ||
        'Alokasi';
      const amount = getNumber(allocation, 'amount') ?? 0;
      return `${label}: ${formatRupiah(amount)}`;
    });
    return {
      id: getId(item) || `ue-${index}`,
      code: getString(item, 'code'),
      name: getString(item, 'name'),
      amount: getNumber(item, 'amount') ?? 0,
      status: getString(item, 'status') || 'draft',
      executedAt: getString(item, 'executedAt') || null,
      vendorName: getString(item, 'vendorName'),
      shippingAmount: getNumber(item, 'shippingAmount') ?? 0,
      allocationLabels,
    };
  });

  return {
    ...base,
    progressPercent: effectiveProgress,
    linkedTaskId: linkedTask?.id || base.linkedTaskId,
    progressNote: getString(record, 'progressNote'),
    maxWorkDays: getNumber(record, 'maxWorkDays'),
    targetCompletionDate: getString(record, 'targetCompletionDate') || null,
    quotationDecision: getString(record, 'quotationDecision') || 'pending',
    itemCount: items.length,
    items,
    hppMaterials,
    hppManual,
    hppTotal: getNumber(record, 'hppTotal') ?? costBreakdown.totalHpp,
    dpSchedule,
    dpAmount: getNumber(record, 'dpAmount') ?? 0,
    minDpType: getString(record, 'minDpType') || 'percentage',
    minDpValue: getNumber(record, 'minDpValue') ?? 0,
    termsTemplateId,
    termsTemplates,
    designReferenceEmbedUrl: getString(record, 'designReferenceEmbedUrl'),
    commissionConfig,
    commissionAccruals,
    progressHistory,
    lifecycleHistory,
    linkedUnexpectedExpenses,
    designSubmittedAt: getString(record, 'designSubmittedAt') || null,
    designCheckedAt: getString(record, 'designCheckedAt') || null,
    designApprovedByClientAt:
      getString(record, 'designApprovedByClientAt') || null,
    designSubmissions,
    deliverySubmissions,
    linkedTask,
    saleStatus: getString(sale, 'status') || null,
    saleFinalTotal: getNumber(sale, 'finalTotal'),
    clientEmail: getString(client, 'email') || null,
    clientPhone: getString(client, 'phone') || null,
    varPreview,
    costBreakdown,
    hasOpenComplaint:
      record.hasOpenComplaint === true ||
      String(record.hasOpenComplaint || '').toLowerCase() === 'true',
    complaintId:
      getId(asRecord(record.complaint)) ||
      getString(record, 'complaintId') ||
      null,
    complaintStatus:
      getString(asRecord(record.complaint), 'status') ||
      getString(record, 'complaintStatus') ||
      null,
  };
}

function normalizeQuotationItem(
  payload: unknown,
  index: number,
): KolamProyekQuotationItem {
  const row = asRecord(payload);
  const product = asRecord(row.product);
  const species = asRecord(row.species);
  const service = asRecord(row.service);
  const title =
    getString(row, 'customName') ||
    getString(product, 'name') ||
    getString(species, 'localName') ||
    getString(species, 'commonName') ||
    getString(species, 'name') ||
    getString(service, 'name') ||
    getString(row, 'variantLabel') ||
    `Item ${index + 1}`;
  const quantity = getNumber(row, 'quantity') ?? 0;
  const unitPrice = getNumber(row, 'unitPrice') ?? 0;
  return {
    id: getId(row) || `item-${index}`,
    itemType: getString(row, 'itemType') || 'custom',
    title,
    quantity,
    unitPrice,
    subtotal: getNumber(row, 'subtotal') ?? quantity * unitPrice,
    shippingCost: getNumber(row, 'shippingCost') ?? 0,
    note: getString(row, 'note'),
  };
}

function normalizeHppMaterial(
  payload: unknown,
  index: number,
): KolamProyekHppMaterial {
  const row = asRecord(payload);
  const product = asRecord(row.product);
  const species = asRecord(row.species);
  const quantity = getNumber(row, 'quantity') ?? 0;
  const unitCost = getNumber(row, 'unitCost') ?? 0;
  return {
    id: getId(row) || `hpp-${index}`,
    label:
      getString(product, 'name') ||
      getString(species, 'localName') ||
      getString(species, 'commonName') ||
      getString(species, 'name') ||
      `Bahan ${index + 1}`,
    quantity,
    unitCost,
    subtotal: getNumber(row, 'subtotal') ?? quantity * unitCost,
    productId:
      getId(product) ||
      (typeof row.product === 'string' ? row.product : null),
    speciesId:
      getId(species) ||
      (typeof row.species === 'string' ? row.species : null),
    variantId:
      getId(asRecord(row.variant)) ||
      (typeof row.variant === 'string' ? row.variant : null) ||
      getString(row, 'variant') ||
      null,
    stockAppliedAt: getString(row, 'stockAppliedAt') || null,
  };
}

function normalizeDpScheduleItem(
  payload: unknown,
  index: number,
): KolamProyekDpScheduleItem {
  const row = asRecord(payload);
  const paymentProofs = (
    Array.isArray(row.paymentProofs) ? row.paymentProofs : []
  ).map(proofPayload => {
    const proof = asRecord(proofPayload);
    return {
      path: getString(proof, 'path'),
      note: getString(proof, 'note'),
      uploadedAt: getString(proof, 'uploadedAt') || null,
    };
  });
  const paymentConfirmations = (
    Array.isArray(row.paymentConfirmations) ? row.paymentConfirmations : []
  ).map((confPayload, confIndex) => {
    const conf = asRecord(confPayload);
    return {
      index: confIndex,
      amount: getNumber(conf, 'amount') ?? 0,
      confirmedAt: getString(conf, 'confirmedAt') || null,
      note: getString(conf, 'note'),
      reversedAt: getString(conf, 'reversedAt') || null,
      reversalReason: getString(conf, 'reversalReason'),
    };
  });
  return {
    index,
    name: getString(row, 'name') || `DP ${index + 1}`,
    amount: getNumber(row, 'amount') ?? 0,
    amountReceived: getNumber(row, 'amountReceived') ?? 0,
    paidAt: getString(row, 'paidAt') || null,
    dueAt: getString(row, 'dueAt') || null,
    kwitansiNumber: getString(row, 'kwitansiNumber') || null,
    paymentProofs,
    paymentConfirmations,
  };
}

function normalizeProgressHistoryItem(
  payload: unknown,
): KolamProyekProgressHistoryItem | null {
  const row = asRecord(payload);
  const progressPercent = getNumber(row, 'progressPercent');
  if (progressPercent == null) {
    return null;
  }
  return {
    progressPercent,
    progressNote: getString(row, 'progressNote'),
    at: getString(row, 'at') || null,
  };
}

function normalizeReviewFile(
  filePayload: unknown,
  fileIndex: number,
): KolamProyekReviewFile {
  const file = asRecord(filePayload);
  return {
    path: getString(file, 'path'),
    name:
      getString(file, 'name') ||
      getString(file, 'originalFilename') ||
      `File ${fileIndex + 1}`,
    mimeType: getString(file, 'mimeType'),
    fileSize: getNumber(file, 'fileSize') ?? 0,
  };
}

function normalizeReviewSubmission(
  payload: unknown,
  index: number,
): KolamProyekReviewSubmission {
  const row = asRecord(payload);
  const files = (Array.isArray(row.files) ? row.files : []).map(
    (filePayload, fileIndex) => normalizeReviewFile(filePayload, fileIndex),
  );
  const clientAttachments = (
    Array.isArray(row.clientAttachments) ? row.clientAttachments : []
  ).map((filePayload, fileIndex) =>
    normalizeReviewFile(filePayload, fileIndex),
  );
  return {
    id: getId(row) || `submission-${index}`,
    submittedAt: getString(row, 'submittedAt') || null,
    note: getString(row, 'note'),
    roundTitle: getString(row, 'roundTitle') || `Ronde ${index + 1}`,
    deadline: getString(row, 'deadline') || null,
    resolutionNote: getString(row, 'resolutionNote'),
    files,
    clientAttachments,
    clientDecision: getString(row, 'clientDecision') || 'pending',
    decidedAt: getString(row, 'decidedAt') || null,
    revisionNote: getString(row, 'revisionNote'),
    rejectionReason: getString(row, 'rejectionReason'),
  };
}

export function normalizeKolamProyekList(
  payload: unknown,
  query: KolamProyekListQuery = {},
): KolamProyekListResult {
  const page = query.page ?? 1;
  const limit = query.limit ?? 50;
  const root = asRecord(payload);
  const data = asRecord(root.data);
  const nested = asRecord(data.data);

  const rows = Array.isArray(data.data)
    ? data.data
    : Array.isArray(nested.data)
      ? nested.data
      : Array.isArray(root.data)
        ? root.data
        : Array.isArray(root.items)
          ? root.items
          : Array.isArray(payload)
            ? payload
            : [];

  const pagination = asRecord(
    data.pagination || nested.pagination || root.pagination,
  );

  const items = rows
    .map(row => normalizeKolamProyekListItem(row))
    .filter((item): item is KolamProyekListItem => Boolean(item));

  const total =
    getNumber(pagination, 'total') ??
    getNumber(data, 'total') ??
    getNumber(root, 'total') ??
    items.length;
  const totalPages =
    getNumber(pagination, 'totalPages') ??
    Math.max(1, Math.ceil(total / Math.max(1, limit)));

  return {
    items,
    page: getNumber(pagination, 'page') ?? page,
    limit: getNumber(pagination, 'limit') ?? limit,
    total,
    totalPages,
  };
}

function unwrapData(payload: unknown): unknown {
  const record = asRecord(payload);
  if ('data' in record) {
    return record.data;
  }
  return payload;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return '';
}

function getNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getId(record: Record<string, unknown>) {
  return getString(record, '_id') || getString(record, 'id') || null;
}
