import React from 'react';
import {View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamStatusPanelIcon} from '../src/components/kolam-status-panel-icon';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';
import type {StatusPanelIconKind} from '../src/domain/status-panel';

const iconKinds: StatusPanelIconKind[] = [
  'activity',
  'checklist',
  'actions',
  'search',
];

describe('KolamStatusPanelIcon', () => {
  it.each(iconKinds)('renders the %s panel glyph', async kind => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<KolamStatusPanelIcon kind={kind} />);
    });

    expect(renderer!.root.findAllByType(View).length).toBeGreaterThan(1);
  });

  it('uses the status panel info tint', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamStatusPanelIcon kind="activity" />,
      );
    });

    const rendered = JSON.stringify(
      renderer!.root.findAllByType(View).map(node => node.props.style),
    );

    expect(rendered).toContain(V.colors.info);
  });
});
