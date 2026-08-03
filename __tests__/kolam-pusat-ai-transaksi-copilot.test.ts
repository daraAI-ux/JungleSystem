import {
  mergeKolamDeliveryChannelSources,
  normalizeKolamKatakTerbangHealth,
  normalizeKolamShippingDeliveryStats,
  normalizeKolamShippingOpsLog,
} from '../src/domain/kolam-pusat-ai-transaksi-copilot';

describe('kolam-pusat-ai-transaksi-copilot domain', () => {
  it('normalizes delivery stats, ops log, and health', () => {
    const stats = normalizeKolamShippingDeliveryStats({
      success: true,
      data: {
        generatedAt: '2026-08-03T12:00:00.000Z',
        range: 'month',
        note: 'note',
        dara: {
          value: 12,
          change: 5.5,
          data: [{timestamp: '2026-08-01T00:00:00.000Z', value: 2}],
          byChannel: {shopee: 4, tokopedia: 5, web: 3},
        },
        bot: {
          value: 8,
          change: -2,
          data: [],
          byChannel: {shopee: 3, tokopedia: 3, web: 2},
        },
        katakTerbangProfile: {name: 'Katak', photoUrl: '/x.jpg'},
        channelSources: {
          shopee: {sourceId: 's1', name: 'Shopee', logo: null},
        },
      },
    });

    expect(stats).not.toBeNull();
    expect(stats!.dara.value).toBe(12);
    expect(stats!.bot.byChannel.tokopedia).toBe(3);
    expect(stats!.katakTerbangProfile.name).toBe('Katak');

    const log = normalizeKolamShippingOpsLog({
      data: {
        generatedAt: '2026-08-03T12:00:00.000Z',
        lookbackHours: 72,
        dara: [
          {
            id: 'd1',
            at: '2026-08-03T11:00:00.000Z',
            eventType: 'webstore_fulfillment',
            detail: 'packing',
          },
        ],
        bot: [],
      },
    });
    expect(log!.dara).toHaveLength(1);

    const health = normalizeKolamKatakTerbangHealth({
      data: {
        checkedAt: '2026-08-03T12:00:00.000Z',
        overallHealthy: true,
        amConfigured: true,
        amReachable: true,
        platforms: [
          {
            platform: 'shopee',
            enabled: true,
            healthy: true,
            state: 'healthy',
            reason: '',
          },
        ],
        notifyRoom: {
          id: 'r1',
          name: 'Ops',
          webHref: '/team-chat?room=r1',
        },
      },
    });
    expect(health!.notifyRoom?.webHref).toBe('/team-chat?room=r1');
    expect(
      mergeKolamDeliveryChannelSources(stats!.channelSources, {
        web: {sourceId: 'w1', name: 'Website', logo: '/w.png'},
      }).web.sourceId,
    ).toBe('w1');
  });
});
