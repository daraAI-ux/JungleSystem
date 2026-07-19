import React from 'react';
import {View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamNotificationBellIcon} from '../src/components/kolam-notification-bell-icon';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamNotificationBellIcon', () => {
  it('renders the shared notification bell with muted tint by default', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<KolamNotificationBellIcon />);
    });

    const rendered = JSON.stringify(
      renderer!.root.findAllByType(View).map(node => node.props.style),
    );

    expect(renderer!.root.findAllByType(View)).toHaveLength(4);
    expect(rendered).toContain(V.colors.mutedFg);
  });

  it('supports a custom notification bell tint', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamNotificationBellIcon color={V.colors.info} />,
      );
    });

    const rendered = JSON.stringify(
      renderer!.root.findAllByType(View).map(node => node.props.style),
    );

    expect(rendered).toContain(V.colors.info);
  });
});
