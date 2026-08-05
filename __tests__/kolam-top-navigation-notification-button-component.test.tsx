import React from 'react';
import Svg, {Circle, Path} from 'react-native-svg';
import ReactTestRenderer from 'react-test-renderer';
import {KolamIconButton} from '../src/components/kolam-icon-button';
import {KolamNotificationBadge} from '../src/components/kolam-notification-badge';
import {KolamNotificationBellIcon} from '../src/components/kolam-notification-bell-icon';
import {KolamPressable} from '../src/components/kolam-pressable';
import {KolamTopNavigationChatButton} from '../src/components/kolam-top-navigation-chat-button';
import {KolamTopNavigationChatIcon} from '../src/components/kolam-top-navigation-chat-icon';
import {KolamTopNavigationCashflowHost} from '../src/components/kolam-top-navigation-cashflow-host';
import {KolamTopNavigationDownloadIcon} from '../src/components/kolam-top-navigation-download-icon';
import {KolamTopNavigationMediaIcon} from '../src/components/kolam-top-navigation-media-icon';
import {KolamTopNavigationNotificationButton} from '../src/components/kolam-top-navigation-notification-button';
import {KolamTopNavigationRightControl} from '../src/components/kolam-top-navigation-right-control';
import {KolamTopNavigationTaskIcon} from '../src/components/kolam-top-navigation-task-icon';

const mockUseKolamAdminCashflowHeaderController = jest.fn();

jest.mock('../src/hooks/use-kolam-admin-cashflow-header-controller', () => ({
  useKolamAdminCashflowHeaderController: () =>
    mockUseKolamAdminCashflowHeaderController(),
}));

describe('KolamTopNavigationNotificationButton', () => {
  it('renders the notification bell without a circular icon-button frame', async () => {
    const onNotificationPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamTopNavigationNotificationButton
          attentionCount={7}
          onNotificationPress={onNotificationPress}
        />,
      );
    });

    expect(renderer!.root.findAllByType(KolamIconButton)).toHaveLength(0);
    expect(renderer!.root.findByType(KolamNotificationBellIcon)).toBeTruthy();
    expect(
      renderer!.root.findByType(KolamNotificationBadge).props.attentionCount,
    ).toBe(7);

    const button = renderer!.root.findByType(KolamPressable);
    expect(button.props.accessibilityLabel).toBe('Notifikasi');
    expect(button.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        height: 32,
        width: 32,
      }),
    );

    button.props.onPress();
    expect(onNotificationPress).toHaveBeenCalledTimes(1);
  });
});

describe('KolamTopNavigationChatButton', () => {
  it('renders unread count on the chat icon', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamTopNavigationChatButton
          accessibilityLabel="Pesan masuk"
          kind="inbox"
          onPress={jest.fn()}
          unreadCount={12}
        />,
      );
    });

    expect(
      renderer!.root.findByType(KolamNotificationBadge).props.attentionCount,
    ).toBe(12);
    expect(renderer!.root.findByType(KolamIconButton).props.variant).toBe(
      'ghost',
    );
  });

  it('keeps the chat badge hidden when there is no unread count', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamTopNavigationChatButton
          accessibilityLabel="Team chat"
          kind="team"
          onPress={jest.fn()}
        />,
      );
    });

    expect(
      renderer!.root.findByType(KolamNotificationBadge).props.attentionCount,
    ).toBe(0);
    expect(renderer!.root.findByType(KolamIconButton).props.variant).toBe(
      'ghost',
    );
  });

  it('renders the team chat icon as the native vector bubble artwork', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamTopNavigationChatIcon kind="team" />,
      );
    });

    const icon = renderer!.root.findByType(Svg);

    expect(icon.props.height).toBe(22);
    expect(icon.props.width).toBe(22);
    expect(icon.props.viewBox).toBe('0 0 512 512');
    expect(renderer!.root.findByType(Circle).props).toEqual(
      expect.objectContaining({fill: '#F47F65', r: 256}),
    );
    expect(renderer!.root.findAllByType(Path)).toHaveLength(3);
  });

  it('renders the inbox icon as the native vector headset artwork', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamTopNavigationChatIcon kind="inbox" />,
      );
    });

    const icon = renderer!.root.findByType(Svg);

    expect(icon.props.height).toBe(22);
    expect(icon.props.width).toBe(22);
    expect(icon.props.viewBox).toBe('0 0 512 512');
    expect(renderer!.root.findByType(Circle).props).toEqual(
      expect.objectContaining({fill: '#F47F65', r: 256}),
    );
    expect(renderer!.root.findAllByType(Path)).toHaveLength(7);
  });
});

describe('KolamTopNavigationCashflowHost', () => {
  beforeEach(() => {
    mockUseKolamAdminCashflowHeaderController.mockReturnValue({
      loading: false,
      session: {id: 'cashflow-session-1', name: 'Sesi pagi', status: 'open'},
      state: 'open',
    });
  });

  it('renders the cashflow session icon as native vector artwork', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<KolamTopNavigationCashflowHost />);
    });

    const icon = renderer!.root.findByType(Svg);

    expect(icon.props.height).toBe(22);
    expect(icon.props.width).toBe(22);
    expect(icon.props.viewBox).toBe('0 0 512 512');
    expect(renderer!.root.findByType(Circle).props).toEqual(
      expect.objectContaining({fill: '#F47F65', r: 256}),
    );
    expect(renderer!.root.findAllByType(Path)).toHaveLength(4);
    expect(renderer!.root.findByType(KolamIconButton).props.variant).toBe(
      'ghost',
    );
  });

  it('keeps the cashflow session topbar control on the active session route', async () => {
    const onNavigate = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamTopNavigationCashflowHost onNavigate={onNavigate} />,
      );
    });

    const button = renderer!.root.findByType(KolamIconButton);

    button.props.onPress();
    expect(onNavigate).toHaveBeenCalledWith(
      '/cashflow-session/cashflow-session-1',
    );
  });
});

describe('KolamTopNavigationDownloadIcon', () => {
  it('renders the downloads icon as native vector artwork', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<KolamTopNavigationDownloadIcon />);
    });

    const icon = renderer!.root.findByType(Svg);

    expect(icon.props.height).toBe(22);
    expect(icon.props.width).toBe(22);
    expect(icon.props.viewBox).toBe('0 0 512 512');
    expect(renderer!.root.findByType(Circle).props).toEqual(
      expect.objectContaining({fill: '#F47F65', r: 256}),
    );
    expect(renderer!.root.findAllByType(Path)).toHaveLength(2);
  });

  it('keeps the downloads topbar control on the app-downloads route', async () => {
    const onNavigate = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamTopNavigationRightControl
          attentionCount={0}
          control={{id: 'app-downloads', label: 'Download aplikasi'}}
          displayInitials="DA"
          onAvatarPress={jest.fn()}
          onCashflowNavigate={onNavigate}
          onNotificationPress={jest.fn()}
        />,
      );
    });

    const button = renderer!.root.findByType(KolamIconButton);

    expect(button.props.variant).toBe('ghost');
    button.props.onPress();
    expect(onNavigate).toHaveBeenCalledWith('/app-downloads');
  });
});

describe('KolamTopNavigationMediaIcon', () => {
  it('renders the media icon as native vector artwork', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<KolamTopNavigationMediaIcon />);
    });

    const icon = renderer!.root.findByType(Svg);

    expect(icon.props.height).toBe(22);
    expect(icon.props.width).toBe(22);
    expect(icon.props.viewBox).toBe('0 0 512 512');
    expect(renderer!.root.findByType(Circle).props).toEqual(
      expect.objectContaining({fill: '#F47F65', r: 256}),
    );
    expect(renderer!.root.findAllByType(Path)).toHaveLength(3);
  });

  it('keeps the media topbar control on the media route', async () => {
    const onNavigate = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamTopNavigationRightControl
          attentionCount={0}
          control={{id: 'media', label: 'Media library'}}
          displayInitials="DA"
          onAvatarPress={jest.fn()}
          onCashflowNavigate={onNavigate}
          onNotificationPress={jest.fn()}
        />,
      );
    });

    const button = renderer!.root.findByType(KolamIconButton);

    expect(button.props.variant).toBe('ghost');
    button.props.onPress();
    expect(onNavigate).toHaveBeenCalledWith('/media');
  });
});

describe('KolamTopNavigationTaskIcon', () => {
  it('renders the task icon as native vector artwork', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<KolamTopNavigationTaskIcon />);
    });

    const icon = renderer!.root.findByType(Svg);

    expect(icon.props.height).toBe(22);
    expect(icon.props.width).toBe(22);
    expect(icon.props.viewBox).toBe('0 0 512 512');
    expect(renderer!.root.findByType(Circle).props).toEqual(
      expect.objectContaining({fill: '#F47F65', r: 256}),
    );
    expect(renderer!.root.findAllByType(Path)).toHaveLength(4);
  });

  it('keeps the task topbar control on the task manager route', async () => {
    const onNavigate = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamTopNavigationRightControl
          attentionCount={0}
          control={{id: 'task-manager', label: 'Task Manager'}}
          displayInitials="DA"
          onAvatarPress={jest.fn()}
          onCashflowNavigate={onNavigate}
          onNotificationPress={jest.fn()}
        />,
      );
    });

    const button = renderer!.root.findByType(KolamIconButton);

    expect(button.props.variant).toBe('ghost');
    button.props.onPress();
    expect(onNavigate).toHaveBeenCalledWith('/task-manager');
  });
});
