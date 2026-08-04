import {
  getKolamNotificationLink,
  normalizeKolamNotificationsResult,
  normalizeKolamNotificationStats,
} from '../src/domain/kolam-notifications';
import {getKolamNotificationAttentionItem} from '../src/hooks/use-kolam-notification-center-controller';

describe('kolam notifications parity helpers', () => {
  it('normalizes backend notifications from every module category generically', () => {
    const result = normalizeKolamNotificationsResult(
      {
        data: [
          {
            _id: 'n-sales',
            title: 'Order Tokopedia baru',
            message: 'Order baru masuk.',
            type: 'info',
            category: 'sales',
            relatedEntity: {type: 'Sale', id: 'sale-1'},
            createdAt: '2026-08-04T04:00:00.000Z',
          },
          {
            _id: 'n-po',
            title: 'PO Siap Diterima',
            message: 'PO siap proses penerimaan.',
            type: 'warning',
            category: 'purchase-order',
            relatedEntity: {type: 'PurchaseOrder', id: 'po-1'},
            createdAt: '2026-08-04T04:01:00.000Z',
          },
          {
            _id: 'n-chat',
            title: 'Team Chat - Anda disebut',
            message: 'Anda disebut.',
            type: 'info',
            category: 'team-chat',
            relatedEntity: {type: 'TeamChatRoom', id: 'room-1'},
            createdAt: '2026-08-04T04:02:00.000Z',
          },
        ],
        pagination: {totalData: 3, page: 1, perPage: 10},
      },
      1,
      10,
    );

    expect(result.data.map(item => item.category)).toEqual([
      'sales',
      'purchase-order',
      'team-chat',
    ]);
    expect(getKolamNotificationLink(result.data[0])).toBe('/sales/sale-1');
    expect(getKolamNotificationLink(result.data[1])).toBe(
      '/purchase-order/po-1',
    );
    expect(getKolamNotificationLink(result.data[2])).toBe(
      '/notifications/n-chat',
    );
  });

  it('maps unread backend notifications into attention panel items', () => {
    const notification = normalizeKolamNotificationsResult({
      data: [
        {
          _id: 'n-kasbon',
          title: 'Pengajuan kasbon baru',
          message: 'Kasbon perlu diverifikasi.',
          type: 'warning',
          category: 'kasbon',
          isRead: false,
          metadata: {userId: 'user-1'},
          relatedEntity: {type: 'Kasbon', id: 'kasbon-1'},
          createdAt: '2026-08-04T04:00:00.000Z',
        },
      ],
    }).data[0];

    const item = getKolamNotificationAttentionItem(notification);

    expect(item).toEqual(
      expect.objectContaining({
        id: 'notification-n-kasbon',
        label: 'Pengajuan kasbon baru',
        tone: 'warning',
        isUnread: true,
        routeHint: '/list-of-users/users/user-1',
      }),
    );
    expect(item.notification?._id).toBe('n-kasbon');
  });

  it('normalizes unread stats for the bell badge', () => {
    expect(
      normalizeKolamNotificationStats({
        data: {total: 120, unread: 14, read: 106},
      }),
    ).toEqual({total: 120, unread: 14, read: 106});
    expect(normalizeKolamNotificationStats({data: {count: 9}}).unread).toBe(9);
  });
});
