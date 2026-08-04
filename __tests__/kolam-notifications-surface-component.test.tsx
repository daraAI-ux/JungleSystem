import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {KolamButton} from '../src/components/kolam-button';
import {KolamNotificationsSurface} from '../src/components/kolam-notifications-surface';
import {useKolamNotificationCenterController} from '../src/hooks/use-kolam-notification-center-controller';

jest.mock('../src/hooks/use-kolam-notification-center-controller', () => ({
  useKolamNotificationCenterController: jest.fn(),
}));

const useNotificationControllerMock =
  useKolamNotificationCenterController as jest.MockedFunction<
    typeof useKolamNotificationCenterController
  >;

function mockNotificationController(overrides = {}) {
  const controller = {
    attentionItems: [],
    deleteAll: jest.fn(),
    errorMessage: '',
    isLoading: false,
    isRefreshing: false,
    markAllAsRead: jest.fn(),
    markAsRead: jest.fn(),
    notifications: [],
    pagination: {
      from: 0,
      hasMore: false,
      page: 1,
      perPage: 20,
      to: 0,
      totalData: 0,
    },
    refresh: jest.fn(),
    stats: {total: 3, unread: 1, read: 2},
    unreadCount: 1,
    ...overrides,
  };

  useNotificationControllerMock.mockReturnValue(controller as never);

  return controller;
}

describe('KolamNotificationsSurface', () => {
  beforeEach(() => {
    useNotificationControllerMock.mockReset();
  });

  it('renders Delete All on the full notifications page', async () => {
    const controller = mockNotificationController();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamNotificationsSurface route="/notifications" />,
      );
    });

    const deleteAllButton = renderer!.root
      .findAllByType(KolamButton)
      .find(button => button.props.label === 'Delete All');

    expect(deleteAllButton?.props.intent).toBe('danger');
    expect(deleteAllButton?.props.disabled).toBe(false);

    deleteAllButton?.props.onPress();
    expect(controller.deleteAll).toHaveBeenCalledTimes(1);
  });

  it('disables Delete All when there are no notifications', async () => {
    mockNotificationController({stats: {total: 0, unread: 0, read: 0}});
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamNotificationsSurface route="/notifications" />,
      );
    });

    const deleteAllButton = renderer!.root
      .findAllByType(KolamButton)
      .find(button => button.props.label === 'Delete All');

    expect(deleteAllButton?.props.disabled).toBe(true);
  });
});
