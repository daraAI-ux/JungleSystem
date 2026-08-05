import React from 'react';
import {Image} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamNotificationBellIcon} from '../src/components/kolam-notification-bell-icon';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamNotificationBellIcon', () => {
  it('renders the shared notification bell image asset', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<KolamNotificationBellIcon />);
    });

    const icon = renderer!.root.findByType(Image);

    expect(icon.props.resizeMode).toBe('contain');
    expect(icon.props.style).toEqual(
      expect.objectContaining({
        height: 22,
        width: 22,
      }),
    );
  });

  it('keeps the legacy color prop non-visual for callers', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamNotificationBellIcon color={V.colors.info} />,
      );
    });

    expect(renderer!.root.findByType(Image)).toBeTruthy();
  });
});
