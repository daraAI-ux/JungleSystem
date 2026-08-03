import {
  formatKolamDaraStaffNotifyChannels,
  formatKolamDaraStaffNotifyEventLabel,
  normalizeKolamDaraStaffNotifyLog,
} from '../src/domain/kolam-pusat-ai-log-dara';

describe('kolam-pusat-ai-log-dara domain', () => {
  it('normalizes staff notify log envelope and labels', () => {
    const log = normalizeKolamDaraStaffNotifyLog({
      success: true,
      data: {
        generatedAt: '2026-08-03T12:00:00.000Z',
        lookbackHours: 72,
        summary: {total: 2, llmCopy: 1, templateCopy: 1},
        events: [
          {
            id: 'e1',
            at: '2026-08-03T11:00:00.000Z',
            eventType: 'dara_staff_notify',
            action: 'webstore_packing_request',
            invoiceCode: 'INV-9',
            copySource: 'llm',
            notified: {teamChat: true, waStaff: true, browserPush: false},
            detail: 'Packing dimulai',
          },
        ],
      },
    });

    expect(log).not.toBeNull();
    expect(log!.summary.total).toBe(2);
    expect(log!.events[0].invoiceCode).toBe('INV-9');
    expect(
      formatKolamDaraStaffNotifyEventLabel('webstore_packing_request'),
    ).toBe('Packing dimulai');
    expect(
      formatKolamDaraStaffNotifyChannels({
        teamChat: true,
        waStaff: true,
        browserPush: false,
      }),
    ).toBe('Team Chat · WA');
  });
});
