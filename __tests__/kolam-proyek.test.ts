import {
  buildKolamProyekActivityEntries,
  buildKolamProyekDetailRoute,
  buildKolamProyekDetailRouteForItem,
  buildKolamProyekEditRoute,
  buildKolamProyekListRoute,
  buildKolamProyekNewRoute,
  buildKolamProyekQuotationPayload,
  canCancelKolamProyekQuotation,
  canCloseKolamProyek,
  canConfirmKolamProyekDp,
  canDeleteKolamProyekQuotation,
  canDownloadKolamProyekInvoice,
  canEditKolamProyekQuotation,
  canResendKolamProyekQuotation,
  canSendKolamProyekQuotation,
  canStartKolamProyekWork,
  canSubmitKolamProyekDelivery,
  canSubmitKolamProyekDesign,
  canUpdateKolamProyekProgress,
  computeKolamProyekCommissionPreview,
  computeKolamProyekCostBreakdown,
  computeKolamProyekOutstanding,
  createEmptyKolamProyekQuotationForm,
  createKolamProyekQuotationFormFromDetail,
  formatKolamProyekComplaintWindowLabel,
  formatKolamProyekDpRowStatusLabel,
  formatKolamProyekLifecycleLabel,
  formatKolamProyekPaymentModeLabel,
  formatKolamProyekReviewDecisionLabel,
  getKolamProyekAllowedNext,
  getKolamProyekCloseBlockReason,
  getKolamProyekDpRowOutstanding,
  getKolamProyekHappyPathNext,
  getKolamProyekLifecycleIntent,
  getKolamProyekRouteRef,
  getKolamProyekSectionVisibility,
  getKolamProyekStepperStageState,
  getKolamProyekSurfaceMode,
  hasKolamProyekPermission,
  isKolamProyekDetailRoute,
  isKolamProyekEditRoute,
  isKolamProyekListRoute,
  isKolamProyekNewRoute,
  isKolamProyekQuotationRef,
  isKolamProyekRoute,
  normalizeKolamProyekDetail,
  normalizeKolamProyekList,
  resolveKolamProyekNextStepHero,
  validateKolamProyekDpConfirmAmount,
  validateKolamProyekLifecycleNote,
  validateKolamProyekProgressUpdate,
  validateKolamProyekQuotationForm,
  validateKolamProyekSubmitRound,
} from '../src/domain/kolam-proyek';

describe('kolam-proyek domain', () => {
  it('detects canonical and legacy routes', () => {
    expect(isKolamProyekRoute('/proyek')).toBe(true);
    expect(isKolamProyekRoute('/proyek/QUO-1')).toBe(true);
    expect(isKolamProyekRoute('/custom-project/instances/abc')).toBe(true);
    expect(isKolamProyekListRoute('/proyek')).toBe(true);
    expect(isKolamProyekListRoute('/proyek/instances')).toBe(true);
    expect(isKolamProyekListRoute('/custom-project')).toBe(true);
    expect(isKolamProyekNewRoute('/proyek/new')).toBe(true);
    expect(isKolamProyekNewRoute('/custom-project/instances/new')).toBe(true);
    expect(isKolamProyekDetailRoute('/proyek/QUO-1')).toBe(true);
    expect(isKolamProyekDetailRoute('/custom-project/instances/abc')).toBe(
      true,
    );
    expect(isKolamProyekDetailRoute('/proyek/new')).toBe(false);
    expect(isKolamProyekEditRoute('/proyek/abc/edit')).toBe(true);
    expect(getKolamProyekRouteRef('/proyek/QUO-12')).toBe('QUO-12');
    expect(getKolamProyekRouteRef('/custom-project/instances/abc')).toBe(
      'abc',
    );
    expect(getKolamProyekSurfaceMode('/proyek')).toBe('list');
    expect(getKolamProyekSurfaceMode('/proyek/new')).toBe('new');
    expect(getKolamProyekSurfaceMode('/proyek/x')).toBe('detail');
    expect(getKolamProyekSurfaceMode('/proyek/x/edit')).toBe('edit');
  });

  it('builds canonical paths preferring quotation ref', () => {
    expect(buildKolamProyekListRoute()).toBe('/proyek');
    expect(buildKolamProyekNewRoute()).toBe('/proyek/new');
    expect(buildKolamProyekDetailRoute('QUO-1')).toBe('/proyek/QUO-1');
    expect(isKolamProyekQuotationRef('QUO-99')).toBe(true);
    expect(
      buildKolamProyekDetailRouteForItem({
        id: 'id1',
        quotationNumber: 'QUO-9',
      }),
    ).toBe('/proyek/QUO-9');
    expect(buildKolamProyekEditRoute('id1', 'id1')).toBe('/proyek/id1/edit');
    expect(buildKolamProyekEditRoute('QUO-1', 'id1')).toBe('/proyek/QUO-1/edit');
  });

  it('normalizes list and rich detail panels for P1', () => {
    const list = normalizeKolamProyekList({
      data: [
        {
          _id: '507f1f77bcf86cd799439011',
          quotationNumber: 'QUO-1',
          lifecycleStatus: 'in_progress',
          progressPercent: 40,
          contractValue: 1500000,
          clientUser: { _id: 'c1', name: 'Andi' },
          designerName: 'Budi',
        },
      ],
      pagination: { page: 1, limit: 50, total: 1, totalPages: 1 },
    });

    expect(list.items).toHaveLength(1);
    expect(list.items[0]).toEqual(
      expect.objectContaining({
        quotationNumber: 'QUO-1',
        clientName: 'Andi',
        progressPercent: 40,
      }),
    );

    const detail = normalizeKolamProyekDetail({
      data: {
        _id: '507f1f77bcf86cd799439011',
        quotationNumber: 'QUO-1',
        lifecycleStatus: 'draft',
        contractValue: 2000000,
        hppManual: 100000,
        hppFromMaterials: [
          {
            product: { _id: 'p1', name: 'Pipa' },
            quantity: 2,
            unitCost: 50000,
            subtotal: 100000,
          },
        ],
        items: [
          {
            _id: 'i1',
            itemType: 'custom',
            customName: 'Desain custom',
            quantity: 1,
            unitPrice: 2000000,
            subtotal: 2000000,
          },
        ],
        dpSchedule: [
          {
            name: 'DP 1',
            amount: 1000000,
            amountReceived: 1000000,
            paidAt: '2026-08-01T00:00:00.000Z',
          },
        ],
        commissionConfig: {
          daType: 'percentage',
          daValue: 10,
          designerType: 'fixed',
          designerValue: 50000,
        },
        progressHistory: [
          {
            progressPercent: 20,
            progressNote: 'Awal',
            at: '2026-08-02T00:00:00.000Z',
          },
        ],
        linkedTask: {
          _id: 't1',
          title: 'Kerja proyek',
          status: 'in_progress',
          workProgressPercent: 55,
        },
        progressNote: 'Mulai',
        paymentMode: 'staged',
        varPreview: {
          contractValue: 2000000,
          unexpectedExpenseTotal: 0,
          materialsUsageTotal: 100000,
          varAmount: 1900000,
        },
      },
    });

    expect(detail?.items[0].title).toBe('Desain custom');
    expect(detail?.hppMaterials[0].label).toBe('Pipa');
    expect(detail?.dpSchedule).toHaveLength(1);
    expect(detail?.commissionConfig?.daValue).toBe(10);
    expect(detail?.linkedTask?.id).toBe('t1');
    expect(detail?.progressPercent).toBe(55);
    expect(detail?.costBreakdown.produkToko).toBe(100000);
    expect(detail?.costBreakdown.varAmount).toBe(1900000);
    expect(canEditKolamProyekQuotation(detail?.lifecycleStatus)).toBe(true);
    expect(formatKolamProyekPaymentModeLabel(detail?.paymentMode)).toBe(
      'DP berjenjang',
    );
  });

  it('exposes lifecycle labels, visibility, and transitions', () => {
    expect(formatKolamProyekLifecycleLabel('awaiting_dp')).toBe('Menunggu DP');
    expect(getKolamProyekLifecycleIntent('completed')).toBe('success');
    expect(getKolamProyekLifecycleIntent('cancelled')).toBe('danger');
    expect(getKolamProyekSectionVisibility('draft', 'dangerDelete')).toBe(
      'active',
    );
    expect(getKolamProyekSectionVisibility('draft', 'dpSchedule')).toBe(
      'hidden',
    );
    expect(getKolamProyekSectionVisibility('delivered', 'closeProject')).toBe(
      'active',
    );
    expect(getKolamProyekHappyPathNext('draft')).toEqual(['quotation_sent']);
    expect(getKolamProyekAllowedNext('draft')).toEqual([
      'quotation_sent',
      'cancelled',
    ]);
    expect(canEditKolamProyekQuotation('quotation_sent')).toBe(false);
    expect(canSendKolamProyekQuotation('draft')).toBe(true);
    expect(canSendKolamProyekQuotation('revision_in_progress')).toBe(false);
    expect(canResendKolamProyekQuotation('revision_in_progress')).toBe(true);
    expect(canDeleteKolamProyekQuotation('draft')).toBe(true);
    expect(canCancelKolamProyekQuotation('quotation_sent')).toBe(true);
    expect(
      computeKolamProyekCostBreakdown({
        contractValue: 1000,
        hppMaterials: [
          { id: '1', label: 'A', quantity: 1, unitCost: 100, subtotal: 100 },
        ],
        hppManual: 50,
        items: [],
        varPreview: null,
      }).totalHpp,
    ).toBe(150);
  });

  it('validates and builds quotation payload for P2', () => {
    const empty = createEmptyKolamProyekQuotationForm();
    expect(validateKolamProyekQuotationForm(empty)).toBe(
      'Pilih pelanggan dulu.',
    );

    const form = {
      ...empty,
      clientUserId: '507f1f77bcf86cd799439011',
      designerUserId: '507f1f77bcf86cd799439012',
      designerName: 'Budi',
      contractValueText: '2000000',
      paymentMode: 'staged' as const,
      minDpType: 'percentage' as const,
      minDpValueText: '40',
    };
    expect(validateKolamProyekQuotationForm(form)).toMatch(/DP minimum 50%/);

    const ok = {
      ...form,
      minDpValueText: '50',
      termsTemplateId: '507f1f77bcf86cd799439013',
      items: [
        {
          key: 'i1',
          customName: 'Custom A',
          quantityText: '2',
          unitPriceText: '100000',
          note: 'note',
        },
      ],
    };
    expect(validateKolamProyekQuotationForm(ok)).toBeNull();

    const payload = buildKolamProyekQuotationPayload(ok);
    expect(payload).toEqual(
      expect.objectContaining({
        clientUserId: '507f1f77bcf86cd799439011',
        designerUser: '507f1f77bcf86cd799439012',
        contractValue: 2000000,
        paymentMode: 'staged',
        dpEnabled: true,
        dpAmount: 1000000,
        minDpType: 'percentage',
        minDpValue: 50,
        termsTemplateId: '507f1f77bcf86cd799439013',
      }),
    );
    expect(payload.items).toEqual([
      expect.objectContaining({
        itemType: 'custom',
        customName: 'Custom A',
        quantity: 2,
        unitPrice: 100000,
        subtotal: 200000,
      }),
    ]);

    const fromDetail = createKolamProyekQuotationFormFromDetail(
      normalizeKolamProyekDetail({
        data: {
          _id: '507f1f77bcf86cd799439011',
          quotationNumber: 'QUO-1',
          lifecycleStatus: 'draft',
          contractValue: 1500000,
          paymentMode: 'full',
          clientUser: { _id: 'c1', name: 'Andi' },
          designerUser: { _id: 'd1', name: 'Budi' },
          designerName: 'Budi',
          commissionConfig: {
            daType: 'percentage',
            daValue: 20,
            designerType: 'percentage',
            designerValue: 80,
          },
          items: [
            {
              _id: 'it1',
              itemType: 'custom',
              customName: 'X',
              quantity: 1,
              unitPrice: 10,
              subtotal: 10,
            },
          ],
        },
      })!,
    );
    expect(fromDetail.clientUserId).toBe('c1');
    expect(fromDetail.designerUserId).toBe('d1');
    expect(fromDetail.contractValueText).toBe('1500000');
    expect(fromDetail.items).toHaveLength(1);
  });

  it('gates DP confirm and start-work for P3', () => {
    expect(canConfirmKolamProyekDp('awaiting_dp', 'staged')).toBe(true);
    expect(canConfirmKolamProyekDp('awaiting_dp', 'full')).toBe(false);
    expect(canConfirmKolamProyekDp('dp_paid', 'staged')).toBe(false);
    expect(canStartKolamProyekWork('dp_paid')).toBe(true);
    expect(canStartKolamProyekWork('awaiting_dp')).toBe(false);
    expect(validateKolamProyekLifecycleNote('abc')).toMatch(/minimal 5/);
    expect(validateKolamProyekLifecycleNote('Mulai kerja')).toBeNull();

    const row = {
      index: 0,
      name: 'DP 1',
      amount: 1000000,
      amountReceived: 250000,
      paidAt: null,
      dueAt: null,
      kwitansiNumber: null,
    };
    expect(getKolamProyekDpRowOutstanding(row)).toBe(750000);
    expect(formatKolamProyekDpRowStatusLabel(row)).toBe('Sebagian');
    expect(validateKolamProyekDpConfirmAmount(0, 750000)).toMatch(/lebih dari 0/);
    expect(validateKolamProyekDpConfirmAmount(800000, 750000)).toMatch(
      /melebihi sisa/,
    );
    expect(validateKolamProyekDpConfirmAmount(750000, 750000)).toBeNull();
  });

  it('gates design/delivery/close and normalizes submissions for P4', () => {
    const detail = normalizeKolamProyekDetail({
      data: {
        _id: '507f1f77bcf86cd799439011',
        quotationNumber: 'QUO-1',
        lifecycleStatus: 'in_progress',
        progressPercent: 40,
        contractValue: 1000000,
        paymentMode: 'staged',
        linkedTask: { _id: 't1', title: 'Task', status: 'done' },
        designSubmissions: [
          {
            _id: 'd1',
            roundTitle: 'Ronde 1',
            clientDecision: 'pending',
            files: [{ path: '/a.png', name: 'a.png' }],
          },
        ],
        deliverySubmissions: [],
      },
    })!;

    expect(detail.designSubmissions).toHaveLength(1);
    expect(detail.designSubmissions[0].roundTitle).toBe('Ronde 1');
    expect(canSubmitKolamProyekDesign(detail)).toBe(false);
    expect(canUpdateKolamProyekProgress('in_progress')).toBe(true);
    expect(validateKolamProyekProgressUpdate(30, 40)).toMatch(/hanya boleh naik/);
    expect(validateKolamProyekSubmitRound({ files: [] })).toMatch(/minimal 1/);

    const delivered = normalizeKolamProyekDetail({
      data: {
        _id: '507f1f77bcf86cd799439011',
        lifecycleStatus: 'delivered',
        progressPercent: 100,
        contractValue: 1000000,
        deliverySubmissions: [
          {
            _id: 'del1',
            roundTitle: 'Bukti 1',
            clientDecision: 'approved',
            files: [{ path: '/b.pdf', name: 'b.pdf' }],
          },
        ],
      },
    })!;
    expect(canSubmitKolamProyekDelivery(delivered)).toBe(false);
    expect(canCloseKolamProyek(delivered)).toBe(true);
    expect(getKolamProyekCloseBlockReason(delivered)).toBeNull();
    expect(
      formatKolamProyekReviewDecisionLabel('revision_requested'),
    ).toBe('Diminta revisi');
  });

  it('gates custom-project RBAC and invoice download', () => {
    expect(hasKolamProyekPermission(null, 'view')).toBe(true);
    expect(
      hasKolamProyekPermission(
        [{ resource: 'custom-project', actions: ['view'] }],
        'view',
      ),
    ).toBe(true);
    expect(
      hasKolamProyekPermission(
        [{ resource: 'custom-project', actions: ['view'] }],
        'create',
      ),
    ).toBe(false);
    expect(
      hasKolamProyekPermission(
        [{ resource: 'custom_project', actions: ['update_status'] }],
        'update_status',
      ),
    ).toBe(true);
    expect(
      hasKolamProyekPermission(
        [{ resource: 'sales', actions: ['*'] }],
        'view',
      ),
    ).toBe(false);
    expect(
      hasKolamProyekPermission([], 'view', 'super_administrator'),
    ).toBe(true);
    expect(
      hasKolamProyekPermission(
        [{ resource: '*', actions: ['*'] }],
        'delete',
      ),
    ).toBe(true);

    expect(canDownloadKolamProyekInvoice('draft')).toBe(false);
    expect(canDownloadKolamProyekInvoice('quotation_sent')).toBe(false);
    expect(canDownloadKolamProyekInvoice('awaiting_dp')).toBe(true);
    expect(canDownloadKolamProyekInvoice('in_progress')).toBe(true);
    expect(canDownloadKolamProyekInvoice('closed')).toBe(true);
    expect(canDownloadKolamProyekInvoice('cancelled')).toBe(false);
  });

  it('resolves next-step hero, outstanding, and payment proof status', () => {
    const draft = normalizeKolamProyekDetail({
      _id: 'p1',
      quotationNumber: 'QUO-1',
      lifecycleStatus: 'draft',
      contractValue: 1_000_000,
      dealAmount: 1_000_000,
      paymentMode: 'staged',
      dpSchedule: [
        {
          name: 'DP1',
          amount: 400_000,
          amountReceived: 100_000,
          paymentProofs: [{ path: '/proofs/a.jpg', note: 'TF' }],
        },
      ],
      termsTemplates: [
        {
          _id: 't1',
          title: 'TOS Umum',
          content: '<p>Syarat</p>',
          complaintWindowDays: 14,
        },
      ],
      commissionConfig: {
        daType: 'percentage',
        daValue: 10,
        designerType: 'fixed',
        designerValue: 50_000,
      },
      varPreview: { varAmount: 500_000 },
    })!;

    expect(computeKolamProyekOutstanding(draft)).toBe(900_000);
    expect(formatKolamProyekDpRowStatusLabel(draft.dpSchedule[0])).toBe(
      'Sebagian',
    );
    expect(formatKolamProyekComplaintWindowLabel(draft.termsTemplates)).toBe(
      '14 hari pasca selesai',
    );
    expect(draft.termsTemplates[0].title).toBe('TOS Umum');
    expect(resolveKolamProyekNextStepHero(draft).primary?.action).toBe(
      'send_quotation',
    );
    expect(
      resolveKolamProyekNextStepHero({
        ...draft,
        lifecycleStatus: 'dp_paid',
      }).primary?.action,
    ).toBe('start_work');

    const waitingProof = normalizeKolamProyekDetail({
      _id: 'p2',
      lifecycleStatus: 'awaiting_dp',
      contractValue: 500_000,
      paymentMode: 'staged',
      dpSchedule: [
        {
          name: 'DP1',
          amount: 200_000,
          amountReceived: 0,
          paymentProofs: [{ path: '/x.png' }],
        },
      ],
    })!;
    expect(formatKolamProyekDpRowStatusLabel(waitingProof.dpSchedule[0])).toBe(
      'Bukti Terkirim',
    );

    const withConfirmations = normalizeKolamProyekDetail({
      _id: 'p3',
      lifecycleStatus: 'awaiting_dp',
      contractValue: 500_000,
      paymentMode: 'staged',
      dpSchedule: [
        {
          name: 'DP1',
          amount: 200_000,
          amountReceived: 100_000,
          paymentConfirmations: [
            {
              amount: 100_000,
              confirmedAt: '2026-01-01T00:00:00.000Z',
              note: 'TF',
            },
            {
              amount: 50_000,
              confirmedAt: '2026-01-02T00:00:00.000Z',
              reversedAt: '2026-01-03T00:00:00.000Z',
              reversalReason: 'salah',
            },
          ],
        },
      ],
    })!;
    expect(withConfirmations.dpSchedule[0].paymentConfirmations).toHaveLength(
      2,
    );
    expect(withConfirmations.dpSchedule[0].paymentConfirmations[0].amount).toBe(
      100_000,
    );
    expect(
      withConfirmations.dpSchedule[0].paymentConfirmations[1].reversedAt,
    ).toBeTruthy();

    const commission = computeKolamProyekCommissionPreview(draft);
    expect(commission?.daAmount).toBe(50_000);
    expect(commission?.designerAmount).toBe(50_000);
  });

  it('builds tahapan stepper, activity, and linked UE for Batch 3', () => {
    const stage = getKolamProyekStepperStageState('revision_in_progress');
    expect(stage.isRevising).toBe(true);
    expect(stage.effective).toBe('quotation_sent');
    expect(getKolamProyekHappyPathNext('approved')).toContain('awaiting_dp');

    const detail = normalizeKolamProyekDetail({
      _id: 'p4',
      lifecycleStatus: 'in_progress',
      progressHistory: [
        { progressPercent: 40, progressNote: 'frame', at: '2026-02-01T10:00:00.000Z' },
      ],
      designSubmittedAt: '2026-02-02T10:00:00.000Z',
      dpSchedule: [
        { name: 'DP1', amount: 100, amountReceived: 100, paidAt: '2026-01-20T00:00:00.000Z' },
      ],
      lifecycleHistory: [
        { from: 'dp_paid', to: 'in_progress', note: 'Mulai', at: '2026-01-21T00:00:00.000Z' },
      ],
      linkedUnexpectedExpenses: [
        {
          _id: 'ue1',
          code: 'UE-1',
          amount: 250000,
          status: 'verified',
          shippingAmount: 15000,
          materialAllocations: [{ customName: 'Kayu', amount: 250000 }],
        },
      ],
    })!;

    expect(detail.lifecycleHistory).toHaveLength(1);
    expect(detail.linkedUnexpectedExpenses[0].code).toBe('UE-1');
    expect(detail.linkedUnexpectedExpenses[0].allocationLabels[0]).toContain(
      'Kayu',
    );
    const activity = buildKolamProyekActivityEntries(detail);
    expect(activity.some(item => item.label.startsWith('Progress 40%'))).toBe(
      true,
    );
    expect(activity.some(item => item.label === 'Desain dikirim')).toBe(true);
    expect(activity.some(item => item.label.includes('dibayar'))).toBe(true);
  });
});
