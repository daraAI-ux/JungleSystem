import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamPanelFrame} from '../src/components/kolam-panel-frame';
import {KOLAM_COMMAND_MENU_VISUAL} from '../src/components/kolam-command-palette-visual';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamPanelFrame', () => {
  it('renders shared status panel chrome with stable live card tokens', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamPanelFrame variant="status" accessibilityLabel="runtime status">
          <Text>Status child</Text>
        </KolamPanelFrame>,
      );
    });

    const frame = renderer!.root.findByType(View);

    expect(frame.props.accessibilityLabel).toBe('runtime status');
    expect(frame.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: V.colors.bg,
        borderColor: V.colors.border,
        overflow: 'hidden',
      }),
    );
    expect(renderer!.root.findByType(Text).props.children).toBe('Status child');
  });

  it('keeps command palette sizing on the shared frame variant', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamPanelFrame variant="commandPalette">
          <Text>Command child</Text>
        </KolamPanelFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({
        maxWidth: KOLAM_COMMAND_MENU_VISUAL.panelMaxWidth,
        width: '100%',
      }),
    );
  });
});