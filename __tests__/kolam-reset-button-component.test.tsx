import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {KolamInteractionFrame} from '../src/components/kolam-interaction-frame';
import {KolamResetButton} from '../src/components/kolam-reset-button';
import {KolamResetIcon} from '../src/components/kolam-reset-icon';

describe('KolamResetButton', () => {
  it('renders as an icon-only reset action', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(<KolamResetButton />);
    });

    const button = renderer!.root.findByType(KolamInteractionFrame);
    expect(button.props.accessibilityLabel).toBe('Reset');
    expect(renderer!.root.findAllByType(KolamResetIcon)).toHaveLength(1);
    expect(renderer!.root.findByType(Text).props.children).toBe('');
  });

  it('keeps the reset action pressable', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(<KolamResetButton onPress={onPress} />);
    });

    renderer!.root.findByType(KolamInteractionFrame).props.onPress();

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
