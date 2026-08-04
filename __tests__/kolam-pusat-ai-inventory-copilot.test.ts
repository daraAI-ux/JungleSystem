import {
  mapKolamInventoryCopilotHref,
  normalizeKolamInventoryCopilotDashboard,
  normalizeKolamInventoryOpsLog,
  normalizeKolamPangeranIsopodHealth,
} from '../src/domain/kolam-pusat-ai-inventory-copilot';

describe('kolam-pusat-ai-inventory-copilot domain', () => {
  it('normalizes dashboard, ops log, and pangeran health', () => {
    const dash = normalizeKolamInventoryCopilotDashboard({
      success: true,
      data: {
        generatedAt: '2026-08-03T12:00:00.000Z',
        lookbackHours: 24,
        note: 'note',
        queue: {
          priorityHint: 'Prioritas stok',
          counts: {
            lowStock: 4,
            outOfStock: 1,
            slowMovers: 2,
            criticalSku: 3,
            openOpnameSessions: 5,
            agedOpenOpname: 1,
            opnameDraft: 2,
            opnameInReview: 1,
            opnameReadyToPost: 0,
            opnameVarianceDocs: 2,
            opnameVarianceQty: 9,
            receivingBacklog: 1,
            packQueueTotal: 3,
            packSlaRisk: 1,
          },
          lowStockItems: [{name: 'SKU A', stock: 2, threshold: 5, sku: 'A'}],
          opnameVarianceDocs: [
            {documentNumber: 'SO-1', location: 'Gudang', varianceQty: 3},
          ],
          openOpnameSample: [
            {documentNumber: 'SO-2', status: 'draft', location: 'Rak'},
          ],
          receivingBacklogItems: [
            {poCode: 'PO-9', status: 'received', vendor: 'Vendor'},
          ],
          packHandoff: {label: 'Pack antrian 3'},
          slowMoverItems: [
            {name: 'Slow', sku: 'S1', qtySold: 1, revenueIdr: 1000},
          ],
          locationDepth: {
            opnameByLocation: [
              {
                locationName: 'Utama',
                locationType: 'warehouse',
                openSessions: 2,
              },
            ],
          },
        },
        pangeranIsopodProfile: {name: 'Pangeran', photoUrl: '/p.jpg'},
        teamChat: {
          aiRoomId: 'room-1',
          roomName: 'Ops Inv',
          webHref: '/team-chat?room=room-1',
          suggestedPrompts: ['SKU mana yang low stock atau habis?'],
        },
        links: {
          productsLowStock: '/products?stock=low',
          stockOpname: '/stock-opname',
          locations: '/locations',
        },
      },
    });

    expect(dash).not.toBeNull();
    expect(dash!.counts.lowStock).toBe(4);
    expect(dash!.lowStockLines[0].text).toContain('SKU A');
    expect(dash!.links.some(l => l.id === 'productsLowStock')).toBe(true);
    expect(dash!.teamChat.suggestedPrompts).toHaveLength(1);

    const log = normalizeKolamInventoryOpsLog({
      data: {
        generatedAt: '2026-08-03T12:00:00.000Z',
        dara: [
          {
            id: 'd1',
            at: '2026-08-03T11:00:00.000Z',
            detail: 'Low stock naik',
            status: 'warn',
          },
        ],
        bot: [],
      },
    });
    expect(log!.dara).toHaveLength(1);

    const health = normalizeKolamPangeranIsopodHealth({
      data: {
        checkedAt: '2026-08-03T12:00:00.000Z',
        overallHealthy: true,
        platforms: [
          {
            platform: 'Team Chat',
            enabled: true,
            healthy: true,
            state: 'ready',
          },
        ],
        notifyRoom: {
          id: 'room-1',
          name: 'Ops',
          webHref: '/team-chat?room=room-1',
        },
      },
    });
    expect(health!.platforms[0].platform).toBe('Team Chat');
    expect(mapKolamInventoryCopilotHref('/products?stock=low')).toBe(
      '/products',
    );
  });
});
