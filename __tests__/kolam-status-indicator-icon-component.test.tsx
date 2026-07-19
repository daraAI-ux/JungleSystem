import React from 'react';
import {View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamStatusIndicatorIcon} from '../src/components/kolam-status-indicator-icon';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamStatusIndicatorIcon', () => {
  it('renders check status indicators with the requested tint', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamStatusIndicatorIcon color={V.colors.success} kind="check" />,
      );
    });

    const rendered = JSON.stringify(
      renderer!.root.findAllByType(View).map(node => node.props.style),
    );

    expect(rendered).toContain(V.colors.success);
  });

  it('renders glyph status indicators with the requested tint', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamStatusIndicatorIcon color={V.colors.warning} kind="clock" />,
      );
    });

    const rendered = JSON.stringify(
      renderer!.root.findAllByType(View).map(node => node.props.style),
    );

    expect(rendered).toContain(V.colors.warning);
  });
});
