import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {KolamModalBackdrop} from '../src/components/kolam-modal-backdrop';

describe('KolamModalBackdrop', () => {
  it('renders shared modal backdrop semantics and calls onPress', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamModalBackdrop onPress={onPress} />,
      );
    });

    const backdrop = renderer!.root.findByProps({
      accessibilityRole: 'button',
    });

    backdrop.props.onPress();

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(backdrop.props.style)).toContain(
      'rgba(15, 23, 42, 0.20)',
    );
  });
});
