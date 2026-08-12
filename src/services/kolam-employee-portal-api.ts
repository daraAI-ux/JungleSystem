import { appConfig } from '../config/app';
import { apiRequest } from '../lib/api-client';

export type KolamPortalSummary = {
  finalizedSlips?: number;
  deductions?: number;
  activeKasbon?: number;
  openTasks?: number;
  bonusRecords?: number;
  commissionAccrued?: number;
  commissionReleased?: number;
  commissionAccruedNet?: number;
  commissionReleasedNet?: number;
  overtimeApproved?: number;
  overtimePaid?: number;
  overtimeFailed?: number;
  overtimeApprovedAmount?: number;
  overtimePaidAmount?: number;
};

export type KolamPortalAttendanceDay = {
  dateKey?: string;
  status?: string;
  checkInAt?: string | null;
  checkOutAt?: string | null;
};

export type KolamPortalAttendancePeriod = {
  periodKey?: string;
  bounds?: {
    periodStart?: string;
    periodEnd?: string;
    periodKey?: string;
  };
  days?: KolamPortalAttendanceDay[];
};

export type KolamPortalTodayAttendance = {
  dateKey?: string;
  holiday?: boolean;
  day?: KolamPortalAttendanceDay | null;
  settings?: {
    workStartTime?: string;
    requireGps?: boolean;
    requireFace?: boolean;
  };
  faceEnrolled?: boolean;
};

export type KolamPortalPayrollSlip = {
  _id?: string;
  slipCode?: string;
  periodKey?: string;
  status?: string;
  takeHomePay?: number;
  grossBruto?: number;
  finalizedAt?: string;
};

export type KolamPortalPayrollCommissionPeriod = {
  periodKey: string;
  slip: {
    _id?: string;
    slipCode?: string;
    periodKey?: string;
    takeHomePay?: number;
  } | null;
  commission: {
    monthKey?: string;
    totalNet?: number;
    pendingNet?: number;
    releasedNet?: number;
    rowCount?: number;
  } | null;
};

export type KolamPortalPayrollCommissionOverview = {
  periods: KolamPortalPayrollCommissionPeriod[];
  totals?: {
    commissionPendingNet?: number;
    commissionReleasedNet?: number;
    slipCount?: number;
  };
};

export type KolamPortalMoneyRow = {
  _id?: string;
  amount?: number;
  commissionAmount?: number;
  totalAmount?: number;
  netPayable?: number;
  status?: string;
  reason?: string;
  title?: string;
  type?: string;
  createdAt?: string;
  date?: string;
  periodKey?: string;
};

export type KolamPortalCommissionRow = KolamPortalMoneyRow & {
  sale?: { invoiceCode?: string; status?: string; paidAt?: string };
  product?: { name?: string; sku?: string } | null;
  species?: { commonName?: string; localName?: string; sku?: string } | null;
  service?: { name?: string; sku?: string } | null;
  pph21?: { netPayable?: number; amount?: number };
};

export type KolamPortalTaskRow = {
  _id?: string;
  title?: string;
  status?: string;
  dueDate?: string;
  priority?: string;
  createdAt?: string;
};

export type KolamPortalDataset = {
  attendance: KolamPortalAttendancePeriod | null;
  bonuses: KolamPortalMoneyRow[];
  commissions: KolamPortalCommissionRow[];
  deductions: KolamPortalMoneyRow[];
  errorMessage?: string;
  kasbon: KolamPortalMoneyRow[];
  overtime: KolamPortalMoneyRow[];
  payrollSlips: KolamPortalPayrollSlip[];
  summary: KolamPortalSummary | null;
  tasks: KolamPortalTaskRow[];
  todayAttendance: KolamPortalTodayAttendance | null;
  payrollCommission: KolamPortalPayrollCommissionOverview | null;
};

async function requestKolamPortal<T>(path: string): Promise<T> {
  return apiRequest<T>({
    baseUrl: appConfig.kolamApiBaseUrl,
    path,
    sourceHeader: appConfig.kolamSourceHeader,
  });
}

function unwrapData<T>(payload: unknown, fallback: T): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const nested = (payload as { data?: unknown }).data;
    return (nested ?? fallback) as T;
  }
  return (payload ?? fallback) as T;
}

function unwrapList<T>(payload: unknown): T[] {
  const data = unwrapData<unknown>(payload, []);
  if (Array.isArray(data)) {
    return data as T[];
  }
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: T[] }).data;
  }
  return [];
}

async function getPortalSummary(): Promise<KolamPortalSummary | null> {
  const payload = await requestKolamPortal<unknown>('/employee-portal/summary');
  return unwrapData<KolamPortalSummary | null>(payload, null);
}

async function getPortalAttendance(): Promise<KolamPortalAttendancePeriod | null> {
  const payload = await requestKolamPortal<unknown>('/employee-portal/attendance');
  return unwrapData<KolamPortalAttendancePeriod | null>(payload, null);
}

async function getTodayAttendance(): Promise<KolamPortalTodayAttendance | null> {
  const payload = await apiRequest<unknown>({
    baseUrl: appConfig.kolamApiBaseUrl,
    path: '/staff-attendance/today',
    sourceHeader: appConfig.kolamSourceHeader,
  });
  return unwrapData<KolamPortalTodayAttendance | null>(payload, null);
}

async function listPortalPayrollSlips(): Promise<KolamPortalPayrollSlip[]> {
  const payload = await requestKolamPortal<unknown>('/employee-portal/payroll-slips');
  return unwrapList<KolamPortalPayrollSlip>(payload);
}

async function getPayrollAndCommission(): Promise<KolamPortalPayrollCommissionOverview | null> {
  const payload = await requestKolamPortal<unknown>(
    '/employee-portal/payroll-and-commission',
  );
  return unwrapData<KolamPortalPayrollCommissionOverview | null>(payload, null);
}

async function listPortalDeductions(): Promise<KolamPortalMoneyRow[]> {
  const payload = await requestKolamPortal<unknown>('/employee-portal/deductions');
  return unwrapList<KolamPortalMoneyRow>(payload);
}

async function listPortalBonuses(): Promise<KolamPortalMoneyRow[]> {
  const payload = await requestKolamPortal<unknown>('/employee-portal/bonuses');
  return unwrapList<KolamPortalMoneyRow>(payload);
}

async function listPortalKasbon(): Promise<KolamPortalMoneyRow[]> {
  const payload = await requestKolamPortal<unknown>('/employee-portal/kasbon');
  return unwrapList<KolamPortalMoneyRow>(payload);
}

async function listPortalCommissions(): Promise<KolamPortalCommissionRow[]> {
  const payload = await requestKolamPortal<unknown>('/employee-portal/commissions');
  return unwrapList<KolamPortalCommissionRow>(payload);
}

async function listPortalTasks(): Promise<KolamPortalTaskRow[]> {
  const payload = await apiRequest<unknown>({
    baseUrl: appConfig.kolamApiBaseUrl,
    path: '/employee-portal/tasks',
    query: { page: 1, limit: 20 },
    sourceHeader: appConfig.kolamSourceHeader,
  });
  return unwrapList<KolamPortalTaskRow>(payload);
}

async function listPortalOvertime(): Promise<KolamPortalMoneyRow[]> {
  const payload = await requestKolamPortal<unknown>('/employee-portal/overtime');
  return unwrapList<KolamPortalMoneyRow>(payload);
}

function getRejectedReason(result: PromiseSettledResult<unknown>): string | null {
  if (result.status === 'fulfilled') {
    return null;
  }
  const reason = result.reason;
  if (reason instanceof Error) {
    return reason.message;
  }
  return typeof reason === 'string' ? reason : 'Portal belum dapat dimuat.';
}

export async function loadKolamPortalDataset(): Promise<KolamPortalDataset> {
  const [
    summary,
    attendance,
    payrollSlips,
    deductions,
    bonuses,
    kasbon,
    commissions,
    tasks,
    overtime,
    todayAttendance,
    payrollCommission,
  ] = await Promise.allSettled([
    getPortalSummary(),
    getPortalAttendance(),
    listPortalPayrollSlips(),
    listPortalDeductions(),
    listPortalBonuses(),
    listPortalKasbon(),
    listPortalCommissions(),
    listPortalTasks(),
    listPortalOvertime(),
    getTodayAttendance(),
    getPayrollAndCommission(),
  ]);

  const errorMessage = [
    summary,
    attendance,
    payrollSlips,
    deductions,
    bonuses,
    kasbon,
    commissions,
    tasks,
    overtime,
    todayAttendance,
    payrollCommission,
  ]
    .map(getRejectedReason)
    .find(Boolean);

  return {
    attendance: attendance.status === 'fulfilled' ? attendance.value : null,
    bonuses: bonuses.status === 'fulfilled' ? bonuses.value : [],
    commissions: commissions.status === 'fulfilled' ? commissions.value : [],
    deductions: deductions.status === 'fulfilled' ? deductions.value : [],
    errorMessage: errorMessage ?? undefined,
    kasbon: kasbon.status === 'fulfilled' ? kasbon.value : [],
    overtime: overtime.status === 'fulfilled' ? overtime.value : [],
    payrollSlips: payrollSlips.status === 'fulfilled' ? payrollSlips.value : [],
    summary: summary.status === 'fulfilled' ? summary.value : null,
    tasks: tasks.status === 'fulfilled' ? tasks.value : [],
    todayAttendance:
      todayAttendance.status === 'fulfilled' ? todayAttendance.value : null,
    payrollCommission:
      payrollCommission.status === 'fulfilled' ? payrollCommission.value : null,
  };
}
