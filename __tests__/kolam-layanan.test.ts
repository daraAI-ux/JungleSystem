import {
  buildKolamLayananOpsKpiCards,
  calcKolamLayananVolumeM3FromUnitLabel,
  createEmptyKolamLayananServiceFormState,
  createKolamLayananProductComponentsPayload,
  createKolamLayananServiceSavePayload,
  formatKolamLayananCommission,
  formatKolamLayananMemberPoints,
  formatKolamLayananPricingMethod,
  formatKolamLayananUnitPrice,
  getKolamLayananListTab,
  getKolamLayananRouteMode,
  getKolamLayananServiceIdFromRoute,
  getKolamLayananSubscriptionStatusLabel,
  getKolamLayananTaskTypeLabel,
  getKolamLayananVoucherIdFromRoute,
  getKolamLayananExecutionRouteIds,
  getKolamLayananSubscriptionIdFromRoute,
  buildKolamLayananSubscriptionCrossLinks,
  canKolamLayananRecordCustomerVerification,
  canKolamLayananSupervisorReview,
  findKolamLayananExecutionInTask,
  hasKolamLayananVolumePricing,
  hasKolamSalePermission,
  isKolamLayananNativeRoute,
  kolamLayananVisitSlotsReadyForPropose,
  normalizeKolamLayananExecutionDetail,
  normalizeKolamLayananOpsDashboard,
  normalizeKolamLayananPendingList,
  normalizeKolamLayananScheduleRequirements,
  normalizeKolamLayananService,
  normalizeKolamLayananServiceList,
  normalizeKolamLayananServiceSpawnTaskResult,
  normalizeKolamLayananSubscriptionDetail,
  normalizeKolamLayananSubscriptionList,
  normalizeKolamLayananSubscriptionVisitPreviews,
  normalizeKolamLayananTaskDetail,
  normalizeKolamLayananTermsContext,
  normalizeKolamLayananVoucherAudit,
  normalizeKolamLayananVoucherDetail,
  createKolamLayananSubscriptionContractForm,
  createKolamLayananSubscriptionUpdatePayload,
  parseKolamLayananDimInput,
  validateKolamLayananMaterialLines,
  validateKolamLayananServiceForm,
} from '../src/domain/kolam-layanan';
import { getKolamNavigationItemByRoute } from '../src/domain/kolam-navigation';

describe('kolam-layanan domain', () => {
  it('parses layanan routes and tabs', () => {
    expect(isKolamLayananNativeRoute('/layanan')).toBe(true);
    expect(isKolamLayananNativeRoute('/layanan?tab=operasional')).toBe(true);
    expect(isKolamLayananNativeRoute('/layanan/create')).toBe(true);
    expect(isKolamLayananNativeRoute('/layanan/abc')).toBe(true);
    expect(isKolamLayananNativeRoute('/layanan/abc/edit')).toBe(true);
    expect(isKolamLayananNativeRoute('/layanan/langganan/s1')).toBe(true);
    expect(isKolamLayananNativeRoute('/layanan/voucher/v1')).toBe(true);
    expect(
      isKolamLayananNativeRoute('/layanan/voucher/v1/execution/e1'),
    ).toBe(true);
    expect(isKolamLayananNativeRoute('/sales')).toBe(false);

    expect(getKolamLayananRouteMode('/layanan')).toBe('list');
    expect(getKolamLayananRouteMode('/layanan?tab=langganan')).toBe('list');
    expect(getKolamLayananRouteMode('/layanan/create')).toBe('create');
    expect(getKolamLayananRouteMode('/layanan/abc')).toBe('detail');
    expect(getKolamLayananRouteMode('/layanan/abc/edit')).toBe('edit');
    expect(getKolamLayananRouteMode('/layanan/langganan/s1')).toBe('langganan');
    expect(getKolamLayananRouteMode('/layanan/voucher/v1')).toBe('voucher');
    expect(getKolamLayananRouteMode('/layanan/voucher/v1/execution/e1')).toBe(
      'execution',
    );

    expect(getKolamLayananListTab('/layanan')).toBe('daftar');
    expect(getKolamLayananListTab('/layanan?tab=operasional')).toBe(
      'operasional',
    );
    expect(getKolamLayananListTab('/layanan?tab=langganan')).toBe('langganan');
    expect(getKolamLayananServiceIdFromRoute('/layanan/abc')).toBe('abc');
    expect(getKolamLayananServiceIdFromRoute('/layanan/abc/edit')).toBe('abc');
    expect(getKolamLayananServiceIdFromRoute('/layanan/create')).toBe(null);
    expect(getKolamLayananVoucherIdFromRoute('/layanan/voucher/v1')).toBe('v1');
    expect(getKolamLayananVoucherIdFromRoute('/layanan/abc')).toBe(null);
    expect(
      getKolamLayananExecutionRouteIds('/layanan/voucher/v1/execution/e1'),
    ).toEqual({ voucherId: 'v1', executionId: 'e1' });
    expect(getKolamLayananSubscriptionIdFromRoute('/layanan/langganan/s1')).toBe(
      's1',
    );
  });

  it('normalizes service list payload with sibling pagination', () => {
    const list = normalizeKolamLayananServiceList({
      data: [
        {
          _id: 'svc1',
          name: 'Dosing Bulanan',
          sku: 'SVC-001',
          packageCode: 'PKG-D1',
          taskType: 'dosing',
          price_m3: 15000,
          price_km: 5000,
          brand: [{ _id: 'b1', name: 'DA' }],
        },
      ],
      pagination: { page: 2, limit: 10, total: 25, totalPages: 3 },
    });

    expect(list.items).toHaveLength(1);
    expect(list.items[0].name).toBe('Dosing Bulanan');
    expect(list.items[0].sku).toBe('SVC-001');
    expect(list.items[0].packageCode).toBe('PKG-D1');
    expect(list.items[0].brands[0].name).toBe('DA');
    expect(getKolamLayananTaskTypeLabel(list.items[0].taskType)).toBe('Dosing');
    expect(formatKolamLayananUnitPrice(list.items[0].priceM3, 'm3')).toBe(
      '15.0Rb/m³',
    );
    expect(list.page).toBe(2);
    expect(list.total).toBe(25);
    expect(list.totalPages).toBe(3);
  });

  it('formats detail pricing/commission helpers and onlinePrice', () => {
    const service = normalizeKolamLayananService({
      _id: 'svc-detail',
      name: 'Perawatan',
      price_m3: 20000,
      price_km: 8000,
      cost_m3: 10000,
      cost_km: 2000,
      onlinePrice: 175000,
      commissionEnabled: true,
      commissionType: 'percentage',
      commissionValue: 5,
      memberPoints: { enabled: true, points: 12 },
      requiresOnSiteVisit: true,
      includesDelivery: false,
      productComponents: [
        {
          product: {
            _id: 'p1',
            name: 'Pakan A',
            productCode: 'RAW-1',
            type: 'raw',
            stock: 12,
            brand: { name: 'DA' },
            category: { name: 'Pakan' },
            price: 25000,
          },
          quantityPerExecution: 2,
          inventoryKind: 'raw',
          unit: { name: 'kg', initial: 'kg' },
        },
      ],
    });
    expect(service.onlinePrice).toBe(175000);
    expect(service.requiresOnSiteVisit).toBe(true);
    expect(service.productComponents).toHaveLength(1);
    expect(service.productComponents[0]).toEqual(
      expect.objectContaining({
        productName: 'Pakan A',
        productCode: 'RAW-1',
        inventoryKind: 'raw',
        quantityPerExecution: 2,
        stock: 12,
      }),
    );
    expect(hasKolamLayananVolumePricing(service)).toBe(true);
    expect(formatKolamLayananPricingMethod(service)).toBe('Per m³ & per km');
    expect(formatKolamLayananCommission(service)).toBe('5%');
    expect(formatKolamLayananMemberPoints(service)).toBe('12 poin');
  });

  it('normalizes service spawn task result', () => {
    expect(
      normalizeKolamLayananServiceSpawnTaskResult({
        created: true,
        data: {_id: 'task-svc-1', title: 'Layanan: Paket A'},
      }),
    ).toEqual({
      created: true,
      taskId: 'task-svc-1',
    });
    expect(
      normalizeKolamLayananServiceSpawnTaskResult({
        created: false,
        data: {id: 'task-svc-2'},
      }),
    ).toEqual({
      created: false,
      taskId: 'task-svc-2',
    });
  });

  it('normalizes ops dashboard, pending list, and subscriptions', () => {
    const ops = normalizeKolamLayananOpsDashboard({
      data: {
        subscriptions: { active: 4 },
        visits: { scheduledToday: 2 },
        hpp: { totalThisMonth: 250000 },
        capacity: {
          period: { periodStart: '2026-07-01', periodEnd: '2026-07-30' },
          summary: { fullSlots: 3, limitedSlots: 5, totalSlots: 28 },
          slots: [
            {
              week: 1,
              weekday: 1,
              status: 'limited',
              booked: 2,
              capacity: 3,
              remaining: 1,
              dates: ['2026-07-07'],
            },
          ],
        },
        alerts: {
          overdue: [
            {
              pendingServiceId: 'ps1',
              executionId: 'ex1',
              visitTitle: 'Dosing A',
              scheduledTime: '2026-07-30T08:00:00.000Z',
            },
          ],
          pendingSupervisor: [],
          pendingCustomerConfirm: [],
        },
      },
    });
    expect(ops.activeSubscriptions).toBe(4);
    expect(ops.scheduledToday).toBe(2);
    expect(ops.fullSlots).toBe(3);
    expect(ops.slots).toHaveLength(1);
    expect(ops.alerts.overdue[0].href).toContain(
      '/layanan/voucher/ps1/execution/ex1',
    );
    expect(buildKolamLayananOpsKpiCards(ops)[0].value).toBe('4');

    const pending = normalizeKolamLayananPendingList({
      data: [
        {
          _id: 'ps1',
          serviceSerial: 'VCH-1',
          status: 'pending',
          packageCode: 'PKG',
          service: { name: 'Dosing' },
          sale: { invoiceCode: 'INV-1', customer: { name: 'Budi' } },
        },
      ],
      pagination: {
        currentPage: 1,
        totalPages: 2,
        totalDocuments: 12,
        limit: 10,
      },
    });
    expect(pending.items[0].serviceSerial).toBe('VCH-1');
    expect(pending.items[0].customerName).toBe('Budi');
    expect(pending.total).toBe(12);
    expect(pending.totalPages).toBe(2);

    const subs = normalizeKolamLayananSubscriptionList({
      data: [
        {
          _id: 'sub1',
          subscriptionNumber: 'SUB-1',
          status: 'active',
          autoRenew: true,
          customer: { name: 'Ani' },
          service: { name: 'Paket A', packageCode: 'PA' },
          pendingService: { _id: 'ps1', serviceSerial: 'VCH-1' },
          startDate: '2026-01-01',
          endDate: '2026-12-31',
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
    expect(subs.items[0].subscriptionNumber).toBe('SUB-1');
    expect(subs.items[0].voucherId).toBe('ps1');
    expect(getKolamLayananSubscriptionStatusLabel('active')).toBe('Aktif');
  });

  it('builds and validates service create/edit payload', () => {
    const empty = createEmptyKolamLayananServiceFormState();
    expect(validateKolamLayananServiceForm(empty)).toContain('Nama');

    const form = {
      ...empty,
      name: 'Dosing Bulanan',
      sku: 'SVC-1',
      brandIds: ['b1'],
      enclosureTaskTypeKeys: ['dosing'],
      enclosureTypes: ['Terrarium'],
      taskType: 'dosing',
      packageCode: 'sv-01',
      price: '100000',
      priceM3: '15000',
      visitsPerMonth: '2',
      contractDurationValue: '3',
      contractDurationUnit: 'months' as const,
    };
    expect(validateKolamLayananServiceForm(form)).toBeNull();
    const body = createKolamLayananServiceSavePayload(form);
    expect(body.name).toBe('Dosing Bulanan');
    expect(body.brand).toEqual(['b1']);
    expect(body.packageCode).toBe('SV-01');
    expect(body.visitsPerMonth).toBe(2);
    expect(body.taskType).toBe('dosing');
    expect(body.price_m3).toBe(15000);
  });

  it('normalizes voucher audit timeline entries', () => {
    const audit = normalizeKolamLayananVoucherAudit({
      auditSource: 'immutable',
      data: [
        {
          _id: 'a1',
          action: 'voucher_activated',
          note: 'Ok',
          changedAt: '2026-08-01T10:00:00.000Z',
          changedBy: { first_name: 'Budi', last_name: 'S' },
        },
      ],
    });
    expect(audit.auditSource).toBe('immutable');
    expect(audit.entries[0].action).toBe('voucher_activated');
    expect(audit.entries[0].changedByName).toBe('Budi S');
  });

  it('calculates contract volume m3 from unit label', () => {
    expect(calcKolamLayananVolumeM3FromUnitLabel(100, 50, 40, 'Cm')).toBe(0.2);
    expect(parseKolamLayananDimInput('12,5')).toBe(12.5);
  });

  it('normalizes voucher purchase dimensions and enclosure types', () => {
    const voucher = normalizeKolamLayananVoucherDetail({
      data: {
        _id: 'ps2',
        status: 'pending',
        purchaseVolumeDimensions: {
          length: 100,
          width: 50,
          height: 40,
          unit: { initial: 'cm' },
        },
        purchaseEnclosureTypes: ['Terrarium', 'Aquarium'],
        service: {
          _id: 'svc2',
          name: 'Pkg',
          enclosureTypes: ['Vivarium'],
        },
      },
    });
    expect(voucher.purchaseDimensions).toEqual({
      length: 100,
      width: 50,
      height: 40,
      unitLabel: 'cm',
    });
    // Non-initiated: prefer live service enclosure types (FE enclosureTypesFromPending).
    expect(voucher.purchaseEnclosureTypes).toEqual(['Vivarium']);

    const initiated = normalizeKolamLayananVoucherDetail({
      data: {
        _id: 'ps3',
        status: 'initiated',
        purchaseEnclosureTypes: ['Terrarium'],
        service: { _id: 'svc3', name: 'Pkg', enclosureTypes: ['Vivarium'] },
      },
    });
    expect(initiated.purchaseEnclosureTypes).toEqual(['Terrarium']);
  });

  it('normalizes voucher detail, schedule, terms, and sale permission gate', () => {
    const voucher = normalizeKolamLayananVoucherDetail({
      data: {
        _id: 'ps1',
        serviceSerial: 'SVC-2026-001',
        status: 'awaiting_client_approval',
        packageCode: 'PKG-1',
        taskType: 'dosing',
        visitsPerMonth: 4,
        proposedVisitSlots: [{ weekday: 1, time: '09:00' }],
        scheduleProposedBy: 'staff',
        visitAssignedToUser: { displayName: 'Budi' },
        productComponents: [
          {
            product: { _id: 'p1', name: 'Pupuk' },
            quantityPerExecution: 2,
            chargeMode: 'hpp_voucher',
            unitPrice: 0,
          },
        ],
        service: { _id: 'svc1', name: 'Dosing' },
        sale: {
          _id: 'sale1',
          invoiceCode: 'INV-1',
          customer: { _id: 'c1', name: 'Andi' },
        },
      },
    });
    expect(voucher.id).toBe('ps1');
    expect(voucher.customerName).toBe('Andi');
    expect(voucher.materialLines).toHaveLength(1);
    expect(voucher.materialLines[0].chargeMode).toBe('hpp_voucher');
    expect(voucher.purchaseDimensions).toBeNull();
    expect(voucher.purchaseEnclosureTypes).toEqual([]);
    expect(getKolamLayananVoucherIdFromRoute('/layanan/voucher/ps1')).toBe(
      'ps1',
    );

    const schedule = normalizeKolamLayananScheduleRequirements({
      data: {
        requiresScheduleFlow: true,
        visitsPerWeek: 2,
        status: 'pending',
        proposedVisitSlots: [],
      },
    });
    expect(schedule.requiresScheduleFlow).toBe(true);
    expect(
      kolamLayananVisitSlotsReadyForPropose(
        [
          { weekday: 1, time: '09:00' },
          { weekday: 3, time: '10:00' },
        ],
        2,
      ),
    ).toBe(true);

    const terms = normalizeKolamLayananTermsContext({
      data: {
        pendingServiceId: 'ps1',
        required: true,
        allAccepted: false,
        templates: [
          {
            termsTemplateId: 't1',
            title: 'S&K Dosing',
            version: 2,
            content: '<p>Isi</p>',
            accepted: false,
          },
        ],
      },
    });
    expect(terms.required).toBe(true);
    expect(terms.templates[0].title).toBe('S&K Dosing');

    expect(
      hasKolamSalePermission([{ resource: 'sale', actions: ['view'] }], 'update'),
    ).toBe(false);
    expect(
      hasKolamSalePermission(
        [{ resource: 'sale', actions: ['update'] }],
        'update',
      ),
    ).toBe(true);
    expect(
      hasKolamSalePermission([], 'update', 'super_administrator'),
    ).toBe(true);

    const invalid = validateKolamLayananMaterialLines([
      {
        key: '1',
        productId: '',
        productName: 'X',
        quantity: '1',
        inventoryKind: 'product',
        chargeMode: 'client',
        unitPrice: '0',
        stockFulfilledAt: null,
      },
    ]);
    expect(invalid).toContain('ID produk');
    const payload = createKolamLayananProductComponentsPayload([
      {
        key: '2',
        productId: '',
        productName: 'Milik klien',
        quantity: '1',
        inventoryKind: 'product',
        chargeMode: 'client_own',
        unitPrice: '0',
        stockFulfilledAt: null,
      },
    ]);
    expect(payload[0].product).toBeNull();
  });

  it('normalizes execution detail and visit confirm gates', () => {
    const task = normalizeKolamLayananTaskDetail(
      {
        data: {
          _id: 'task1',
          name: 'Dosing langganan',
          executions: [
            {
              _id: 'ex1',
              status: 'completed',
              visitVerificationStatus: 'pending_supervisor',
              subscription: 'sub1',
              packageTaskCode: 'PT-01',
              scheduled_time: '2026-07-31T09:00:00.000Z',
              assignedTo: { first_name: 'Budi', last_name: 'S' },
            },
            {
              _id: 'ex2',
              status: 'completed',
              visitVerificationStatus: 'verified',
              subscription: 'sub1',
              packageTaskCode: 'PT-01',
              customerVerifiedAt: null,
            },
          ],
        },
      },
      'dosing',
    );
    expect(task.executions).toHaveLength(2);
    const pending = findKolamLayananExecutionInTask(task, 'ex1');
    expect(pending?.assignedToName).toBe('Budi S');
    expect(canKolamLayananSupervisorReview(pending!)).toBe(true);
    expect(canKolamLayananRecordCustomerVerification(pending!)).toBe(false);

    const verified = findKolamLayananExecutionInTask(task, 'ex2');
    expect(canKolamLayananSupervisorReview(verified!)).toBe(false);
    expect(canKolamLayananRecordCustomerVerification(verified!)).toBe(true);

    const bare = normalizeKolamLayananExecutionDetail({
      _id: 'ex3',
      status: 'completed',
      reviewStatus: 'pending_review',
    });
    expect(canKolamLayananSupervisorReview(bare)).toBe(true);
  });

  it('normalizes subscription detail and builds cross-links', () => {
    const detail = normalizeKolamLayananSubscriptionDetail({
      data: {
        _id: 'sub1',
        subscriptionNumber: 'SUB-1',
        status: 'active',
        autoRenew: true,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        packageCode: 'PKG-1',
        notes: 'Catatan',
        transportCostDefault: 25000,
        packageTasksSnapshot: [{ code: 'A' }, { code: 'B' }],
        customer: { _id: 'c1', name: 'Andi', phone: '081' },
        service: { _id: 'svc1', name: 'Dosing', taskType: 'dosing' },
        pendingService: { _id: 'ps1', serviceSerial: 'SVC-9' },
        sale: { _id: 'sale1', invoiceCode: 'INV-9', status: 'paid' },
      },
    });
    expect(detail.saleId).toBe('sale1');
    expect(detail.voucherId).toBe('ps1');
    expect(detail.packageTasksCount).toBe(2);
    const links = buildKolamLayananSubscriptionCrossLinks(detail);
    expect(links.find(link => link.id === 'sales')?.route).toBe('/sales/sale1');
    expect(links.find(link => link.id === 'voucher')?.route).toBe(
      '/layanan/voucher/ps1',
    );
    expect(links.find(link => link.id === 'complaint')?.route).toBe(
      '/complaints',
    );
    expect(links.find(link => link.id === 'stock')?.available).toBe(true);
  });

  it('normalizes subscription visit preview and contract form payload', () => {
    const visits = normalizeKolamLayananSubscriptionVisitPreviews({
      data: {
        skipped: false,
        ops: 3,
        taskId: 'task-1',
        taskType: 'dosing',
        preview: [
          {
            packageTaskCode: 'DOS-1',
            visitTitle: 'Dosing A',
            scheduled_time: '2026-08-05T10:00:00.000Z',
            estimatedAt: '2026-08-05T12:00:00.000Z',
          },
        ],
      },
    });
    expect(visits.preview).toHaveLength(1);
    expect(visits.preview[0].packageTaskCode).toBe('DOS-1');
    expect(visits.ops).toBe(3);
    expect(visits.skipped).toBe(false);

    const form = createKolamLayananSubscriptionContractForm({
      id: 'sub1',
      subscriptionNumber: 'SUB-1',
      customerName: 'Andi',
      serviceName: 'Paket',
      packageCode: 'PKG',
      voucherSerial: 'SRV-1',
      voucherId: 'ps1',
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-12-31T00:00:00.000Z',
      status: 'active',
      autoRenew: true,
      customerId: 'c1',
      customerPhone: null,
      customerEmail: null,
      serviceId: 's1',
      taskType: 'dosing',
      saleId: null,
      saleInvoiceCode: null,
      saleStatus: null,
      notes: 'Catatan',
      transportCostDefault: 15000,
      packageTasksCount: 1,
      enclosureId: null,
      enclosureName: null,
      createdAt: null,
      updatedAt: null,
    });
    expect(form.startDate).toBe('2026-01-01');
    expect(form.transportCostDefault).toBe('15000');
    expect(createKolamLayananSubscriptionUpdatePayload(form)).toEqual(
      expect.objectContaining({
        status: 'active',
        customerId: 'c1',
        autoRenew: true,
        transportCostDefault: 15000,
        notes: 'Catatan',
      }),
    );
  });
});

describe('kolam-layanan navigation', () => {
  it('keeps /layanan on kolam module with Indonesian copy', () => {
    const item = getKolamNavigationItemByRoute('/layanan');
    expect(item?.label).toBe('Layanan');
    expect(item?.description).toContain('Ringkasan operasional');
    expect(item?.route).toBe('/layanan');
  });
});
