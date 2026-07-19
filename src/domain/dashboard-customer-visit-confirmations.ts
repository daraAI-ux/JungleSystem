import type {KolamPendingCustomerVerificationRow} from '../services/kolam-api';
import type {UnifiedDataset} from '../services/unified-data';

export interface DashboardCustomerVisitConfirmation {
  id: string;
  title: string;
  description: string;
  actionLabel: 'Konfirmasi';
  actionAccessibilityLabel: string;
  route: string;
}

export interface DashboardCustomerVisitConfirmationsDescriptor {
  title: 'Konfirmasi kunjungan layanan';
  description: 'Kunjungan yang sudah diverifikasi tim — menunggu persetujuan Anda.';
  sourcePartial: string;
  emptyBehavior: 'hidden';
}

export interface DashboardCustomerVisitConfirmationsVisualContract {
  sourcePartial: string;
  card: {
    background: 'bg';
    borderWidth: number;
    paddingY: number;
    radius: number;
    shadow: 'xs';
    sourcePrimitive: 'Card [--card-spacing:--spacing(4)]';
    spacing: number;
  };
  header: {
    descriptionGapY: number;
    descriptionFontSize: number;
    paddingX: number;
    titleFontSize: number;
    titleFontWeight: 'semibold';
  };
  list: {
    borderTopWidth: number;
    gapY: number;
    paddingX: number;
    paddingY: number;
  };
  row: {
    actionColor: 'primary';
    actionUnderline: boolean;
    borderWidth: number;
    descriptionGapY: number;
    descriptionFontSize: number;
    flexWrap: true;
    gapX: number;
    paddingX: number;
    paddingY: number;
    radius: number;
    titleFontSize: number;
    titleFontWeight: 'medium';
  };
}

export const dashboardCustomerVisitConfirmationsDescriptor: DashboardCustomerVisitConfirmationsDescriptor =
  {
    title: 'Konfirmasi kunjungan layanan',
    description:
      'Kunjungan yang sudah diverifikasi tim — menunggu persetujuan Anda.',
    sourcePartial:
      'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\app\\(app)\\(dashboard)\\(partials)\\customer-visit-confirmations.tsx',
    emptyBehavior: 'hidden',
  };

const dashboardCustomerVisitConfirmationsVisualContract: DashboardCustomerVisitConfirmationsVisualContract =
  {
    sourcePartial:
      'E:\\Projects\\_latest-da\\da-inventory-frontend\\src\\app\\(app)\\(dashboard)\\(partials)\\customer-visit-confirmations.tsx',
    card: {
      background: 'bg',
      borderWidth: 1,
      paddingY: 16,
      radius: 8,
      shadow: 'xs',
      sourcePrimitive: 'Card [--card-spacing:--spacing(4)]',
      spacing: 16,
    },
    header: {
      descriptionGapY: 4,
      descriptionFontSize: 14,
      paddingX: 16,
      titleFontSize: 16,
      titleFontWeight: 'semibold',
    },
    list: {
      borderTopWidth: 0,
      gapY: 8,
      paddingX: 16,
      paddingY: 0,
    },
    row: {
      actionColor: 'primary',
      actionUnderline: true,
      borderWidth: 1,
      descriptionGapY: 3,
      descriptionFontSize: 12,
      flexWrap: true,
      gapX: 8,
      paddingX: 12,
      paddingY: 8,
      radius: 6,
      titleFontSize: 14,
      titleFontWeight: 'medium',
    },
  };

export function getDashboardCustomerVisitConfirmations(
  dataset: UnifiedDataset,
): DashboardCustomerVisitConfirmation[] {
  return dataset.kolam.pendingCustomerVerifications.map(row => {
    const route = getExecutionDetailRoute(row);

    return {
      id: `${row.taskId}-${row.executionId}`,
      title: row.visitTitle ?? 'Kunjungan layanan',
      description: getVisitDescription(row),
      actionLabel: 'Konfirmasi',
      actionAccessibilityLabel: `Konfirmasi - ${route}`,
      route,
    };
  });
}

export function getDashboardCustomerVisitConfirmationsDescriptor(): DashboardCustomerVisitConfirmationsDescriptor {
  return dashboardCustomerVisitConfirmationsDescriptor;
}

export function getDashboardCustomerVisitConfirmationsVisualContract(): DashboardCustomerVisitConfirmationsVisualContract {
  return {
    ...dashboardCustomerVisitConfirmationsVisualContract,
    card: {...dashboardCustomerVisitConfirmationsVisualContract.card},
    header: {...dashboardCustomerVisitConfirmationsVisualContract.header},
    list: {...dashboardCustomerVisitConfirmationsVisualContract.list},
    row: {...dashboardCustomerVisitConfirmationsVisualContract.row},
  };
}

function getVisitDescription(row: KolamPendingCustomerVerificationRow) {
  const identity = row.subscriptionNumber ?? row.serviceSerial ?? 'Voucher';

  return `${identity} · Jadwal ${formatVisitSchedule(row.scheduledTime)}`;
}

function getExecutionDetailRoute(row: KolamPendingCustomerVerificationRow) {
  return `/layanan/voucher/${row.pendingServiceId}/execution/${row.executionId}`;
}

function formatVisitSchedule(value?: string | null) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  });
}
