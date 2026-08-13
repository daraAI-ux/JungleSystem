import React from 'react';
import {SvgXml} from 'react-native-svg';
import ReactTestRenderer from 'react-test-renderer';
import {KolamNotificationBellIcon} from '../src/components/kolam-notification-bell-icon';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamNotificationBellIcon', () => {
  it('renders the shared notification bell as vector artwork', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<KolamNotificationBellIcon />);
    });

    expect(renderer!.root.findByType(SvgXml).props).toEqual(
      expect.objectContaining({height: 20, width: 20}),
    );
    expect(renderer!.root.findByType(SvgXml).props.xml).toContain('#d11131');
  });

  it('tints the bell when a color is provided', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamNotificationBellIcon color={V.colors.mutedFg} />,
      );
    });

    expect(renderer!.root.findByType(SvgXml).props.xml).toContain(
      V.colors.mutedFg,
    );
    expect(renderer!.root.findByType(SvgXml).props.xml).not.toContain('#d11131');
  });
});
