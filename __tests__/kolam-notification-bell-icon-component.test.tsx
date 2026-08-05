import React from 'react';
import Svg, {Circle, Path} from 'react-native-svg';
import ReactTestRenderer from 'react-test-renderer';
import {KolamNotificationBellIcon} from '../src/components/kolam-notification-bell-icon';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamNotificationBellIcon', () => {
  it('renders the shared notification bell as a native vector icon', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<KolamNotificationBellIcon />);
    });

    const icon = renderer!.root.findByType(Svg);

    expect(icon.props.height).toBe(22);
    expect(icon.props.width).toBe(22);
    expect(icon.props.viewBox).toBe('0 0 64 64');
    expect(renderer!.root.findByType(Circle).props.fill).toBe('#ED1C24');
    expect(renderer!.root.findAllByType(Path)).toHaveLength(2);
  });

  it('keeps the legacy color prop non-visual for callers', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamNotificationBellIcon color={V.colors.info} />,
      );
    });

    expect(renderer!.root.findByType(Svg)).toBeTruthy();
  });
});
