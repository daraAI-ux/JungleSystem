import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { KolamComplaintSurface } from '../src/components/kolam-complaint-surface';
import type { KolamComplaintController } from '../src/hooks/use-kolam-complaint-controller';

const mockController: KolamComplaintController = {
  complaints: [
    {
      id: 'c1',
      ticketCode: 'COMP-1',
      saleId: 's1',
      invoiceCode: 'INV-1',
      customerName: 'Budi',
      isCustomProject: false,
      saleSourceRef: null,
      source: 'arrival_inspection',
      status: 'pending',
      decision: null,
      priority: 'medium',
      category: 'damaged',
      description: 'Rusak',
      itemCount: 1,
      items: [],
      refundAmount: 0,
      assignedStaffId: null,
      assignedStaffName: '—',
      createdById: null,
      createdByName: 'Staff',
      createdByType: 'staff',
      isServiceOnly: false,
      marketplaceSource: null,
      marketplaceReadOnly: false,
      photos: [],
      histories: [],
      returnTracking: null,
      replacementTracking: null,
      replacementReturnTracking: null,
      refundPaymentStatus: null,
      refundPaymentSentByLabel: '',
      refundPaymentDetails: null,
      refundPaymentProof: [],
      refundPaymentHistory: [],
      refundTransaction: null,
      warrantyContext: null,
      vendorClaim: null,
      serviceContext: null,
      pendingService: null,
      subscription: null,
      reworkTracking: [],
      currentReworkIndex: null,
      reworkCount: 0,
      maxRework: 2,
      createdAt: '2026-07-31T00:00:00.000Z',
      raw: {},
    },
  ],
  customProjectOnly: false,
  dataSource: 'live',
  decisionFilter: 'all',
  error: null,
  loading: false,
  mode: 'list',
  mutating: false,
  page: 1,
  pageSize: 10,
  search: '',
  selectedComplaint: null,
  saleSources: [],
  sourceFilter: 'all',
  staffOptions: [],
  walletOptions: [],
  statusFilter: 'all',
  priorityFilter: 'all',
  categoryFilter: 'all',
  complaintPeriodDays: 3,
  periodDraft: '3',
  periodEditorOpen: false,
  statusMessage: null,
  total: 1,
  totalPages: 1,
  onAssignStaff: jest.fn(async () => false),
  onBackToList: jest.fn(),
  onChangePeriodDraft: jest.fn(),
  onCloseComplaint: jest.fn(async () => false),
  onConfirmRefundPayment: jest.fn(async () => false),
  onCreateComplaint: jest.fn(async () => null),
  onCreateNew: jest.fn(),
  onCreateRefundTransaction: jest.fn(async () => false),
  onRefresh: jest.fn(async () => undefined),
  onSaveComplaintPeriodDays: jest.fn(async () => false),
  onSearchChange: jest.fn(),
  onSelectComplaint: jest.fn(async () => undefined),
  onSendRefundPayment: jest.fn(async () => false),
  onSetCategoryFilter: jest.fn(),
  onSetCustomProjectOnly: jest.fn(),
  onSetDecisionFilter: jest.fn(),
  onSetPage: jest.fn(),
  onSetPageSize: jest.fn(),
  onSetPriorityFilter: jest.fn(),
  onSetSourceFilter: jest.fn(),
  onSetStatusFilter: jest.fn(),
  onSpawnServiceReworkVisit: jest.fn(async () => false),
  onSubmitReworkCustomerResponse: jest.fn(async () => false),
  onTogglePeriodEditor: jest.fn(),
  onUpdateDecision: jest.fn(async () => false),
  onUpdateReturnStatus: jest.fn(async () => false),
  onUpdateReplacementStatus: jest.fn(async () => false),
  onUpdateReplacementReturnStatus: jest.fn(async () => false),
  onUpdateReworkStatus: jest.fn(async () => false),
  onUpdateStatus: jest.fn(async () => false),
  onUpdateVendorClaim: jest.fn(async () => false),
};

jest.mock('../src/hooks/use-kolam-complaint-controller', () => ({
  useKolamComplaintController: () => mockController,
}));

function renderText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root
    .findAllByType(Text)
    .flatMap(node => flattenText(node.props.children));
}

function flattenText(value: React.ReactNode): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(flattenText);
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)];
  }
  return [];
}

describe('KolamComplaintSurface', () => {
  it('renders list polish controls and ticket rows', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamComplaintSurface route="/complaints" />,
      );
    });

    const text = renderText(renderer!);
    expect(text).toEqual(
      expect.arrayContaining([
        'COMP-1',
        'INV-1',
        'Periode (3h)',
        'Baru',
        'Proyek khusus',
      ]),
    );
  });

  it('shows period editor when open', async () => {
    mockController.periodEditorOpen = true;
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamComplaintSurface route="/complaints" />,
      );
    });

    const text = renderText(renderer!);
    expect(text).toEqual(
      expect.arrayContaining(['Atur periode keluhan', 'Simpan periode']),
    );
    mockController.periodEditorOpen = false;
  });
});
