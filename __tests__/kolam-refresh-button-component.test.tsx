import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {KolamInteractionFrame} from '../src/components/kolam-interaction-frame';
import {KolamRefreshButton} from '../src/components/kolam-refresh-button';
import {KolamRefreshIcon} from '../src/components/kolam-refresh-icon';

describe('KolamRefreshButton', () => {
  it('renders as an icon-only refresh action', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(<KolamRefreshButton />);
    });

    const button = renderer!.root.findByType(KolamInteractionFrame);
    expect(button.props.accessibilityLabel).toBe('Refresh');
    expect(renderer!.root.findAllByType(KolamRefreshIcon)).toHaveLength(1);
    expect(renderer!.root.findByType(Text).props.children).toBe('');
  });

  it('keeps custom accessibility labels', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamRefreshButton accessibilityLabel="Muat ulang tugas" />,
      );
    });

    expect(
      renderer!.root.findByType(KolamInteractionFrame).props.accessibilityLabel,
    ).toBe('Muat ulang tugas');
  });
});
