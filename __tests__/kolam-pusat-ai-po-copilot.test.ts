import {
  formatKolamPoCopilotRoleLabel,
  normalizeKolamPoCopilotStats,
  normalizeKolamPoOpsLog,
  normalizeKolamRajaAnemonHealth,
} from '../src/domain/kolam-pusat-ai-po-copilot';

describe('kolam-pusat-ai-po-copilot domain', () => {
  it('normalizes stats, ops log, and raja anemon health', () => {
    const stats = normalizeKolamPoCopilotStats({
      success: true,
      data: {
        generatedAt: '2026-08-03T12:00:00.000Z',
        range: 'month',
        note: 'note',
        closed: {
          metric: 'closed',
          value: 7,
          change: 12,
          data: [{timestamp: '2026-08-01T00:00:00.000Z', value: 2}],
        },
        failed: {
          metric: 'failed',
          value: 3,
          change: -4,
          data: [],
        },
        rajaAnemonProfile: {name: 'Raja', photoUrl: '/r.jpg'},
      },
    });

    expect(stats).not.toBeNull();
    expect(stats!.closed.value).toBe(7);
    expect(stats!.failed.change).toBe(-4);
    expect(stats!.rajaAnemonProfile.name).toBe('Raja');

    const log = normalizeKolamPoOpsLog({
      data: {
        generatedAt: '2026-08-03T12:00:00.000Z',
        dara: [
          {
            id: 'e1',
            at: '2026-08-03T11:00:00.000Z',
            detail: 'Quote diterima',
            poCode: 'PO-1',
            vendorName: 'Vendor A',
            controller: 'dara',
            status: 'ok',
          },
        ],
        bot: [],
      },
    });
    expect(log!.dara).toHaveLength(1);
    expect(log!.dara[0].badges.some(b => b.label === 'PO' && b.value === 'PO-1')).toBe(
      true,
    );
    expect(
      log!.dara[0].badges.some(
        b => b.label === 'controller' && b.value === 'DARA',
      ),
    ).toBe(true);

    const health = normalizeKolamRajaAnemonHealth({
      data: {
        checkedAt: '2026-08-03T12:00:00.000Z',
        overallHealthy: true,
        platforms: [
          {
            platform: 'procurement',
            enabled: true,
            healthy: true,
            state: 'ready',
            reason: '',
          },
        ],
        procurementAgent: {
          enabled: true,
          modelTier: 'fast',
          approvalGuard: true,
          paymentGuard: 'notify',
          guardrails: {
            invoiceAttach: 'explicit',
            vendorDisclosure: 'on',
          },
        },
        notifyRoom: {
          id: 'r1',
          name: 'Ops PO',
          webHref: '/team-chat?room=r1',
        },
      },
    });
    expect(health!.notifyRoom?.webHref).toBe('/team-chat?room=r1');
    expect(health!.procurementAgent?.enabled).toBe(true);
    expect(health!.procurementAgent?.guardrailBadges.length).toBeGreaterThan(0);
    expect(formatKolamPoCopilotRoleLabel('raja_anemon')).toBe('Raja Anemon');
  });
});
