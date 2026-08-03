import {
  computeKolamOwnerCopilotNightOpsTotal,
  formatKolamOwnerCopilotEventLabel,
  formatKolamOwnerCopilotIdr,
  normalizeKolamOwnerCopilotDashboard,
} from '../src/domain/kolam-pusat-ai-owner-copilot';

describe('kolam-pusat-ai-owner-copilot domain', () => {
  it('normalizes dashboard envelope and labels', () => {
    const dash = normalizeKolamOwnerCopilotDashboard({
      success: true,
      data: {
        generatedAt: '2026-08-03T12:00:00.000Z',
        lookbackHours: 24,
        window: {label: '3 Agu 00.00 — 3 Agu 12.00 WIB'},
        teamChat: {
          aiRoomId: 'room-1',
          roomName: 'Chat dengan DARA',
          webHref: '/team-chat?room=room-1',
          suggestedPrompts: ['Ringkasan bisnis hari ini'],
        },
        health: {
          sales: {formatted: 'Rp 1.000.000', totalIdr: 1000000, orderCount: 4},
          margin: {
            formattedProfit: 'Rp 200.000 (20.0%)',
            grossProfitIdr: 200000,
            marginPercent: 20,
          },
          lowStockCount: 3,
        },
        nightOps: {
          opsAuditEnabled: true,
          counts: {
            olshop_dispatch: 2,
            olshop_defer: 1,
            olshop_fail: 0,
            olshop_stock_hold: 0,
            webstore_start: 1,
            dana_ok: 1,
            dana_fail: 0,
          },
          failures: [
            {
              id: 'f1',
              eventType: 'olshop_autopilot',
              invoiceCode: 'INV-1',
              reason: 'stok kosong',
            },
          ],
          recentEvents: [
            {
              id: 'e1',
              at: '2026-08-03T11:00:00.000Z',
              eventType: 'dana_auto_lunas',
              invoiceCode: 'INV-2',
              status: 'ok',
            },
          ],
        },
        insights: [
          {
            kind: 'ops',
            title: 'Alert malam',
            body: 'Cek defer olshop',
            broadcastAt: '2026-08-03T10:00:00.000Z',
          },
        ],
        executive: {note: 'Note eksekutif.'},
      },
    });

    expect(dash).not.toBeNull();
    expect(dash!.health.salesFormatted).toBe('Rp 1.000.000');
    expect(dash!.health.orderCount).toBe(4);
    expect(dash!.nightOps.failures[0].invoiceCode).toBe('INV-1');
    expect(dash!.teamChat.webHref).toBe('/team-chat?room=room-1');
    expect(computeKolamOwnerCopilotNightOpsTotal(dash!.nightOps.counts)).toBe(5);
    expect(formatKolamOwnerCopilotEventLabel('olshop_autopilot')).toBe(
      'Automasi olshop',
    );
    expect(formatKolamOwnerCopilotIdr(1500)).toContain('Rp');
  });
});
