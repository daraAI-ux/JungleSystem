import React from 'react';
import Svg, {Circle, Path} from 'react-native-svg';
import ReactTestRenderer from 'react-test-renderer';
import {KolamIconButton} from '../src/components/kolam-icon-button';
import {KolamNotificationBadge} from '../src/components/kolam-notification-badge';
import {KolamNotificationBellIcon} from '../src/components/kolam-notification-bell-icon';
import {KolamPressable} from '../src/components/kolam-pressable';
import {KolamTopNavigationChatButton} from '../src/components/kolam-top-navigation-chat-button';
import {KolamTopNavigationChatIcon} from '../src/components/kolam-top-navigation-chat-icon';
import {KolamTopNavigationNotificationButton} from '../src/components/kolam-top-navigation-notification-button';

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

    expect(icon.props.height).toBe(32);
    expect(icon.props.width).toBe(32);
    expect(icon.props.viewBox).toBe('0 0 512 512');
    expect(renderer!.root.findByType(Circle).props).toEqual(
      expect.objectContaining({fill: '#F47F65', r: 256}),
    );
    expect(renderer!.root.findAllByType(Path)).toHaveLength(3);
  });
});
