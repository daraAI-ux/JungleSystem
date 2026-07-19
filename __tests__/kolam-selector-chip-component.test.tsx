import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamSelectorChip} from '../src/components/kolam-selector-chip';

describe('KolamSelectorChip', () => {
  it('renders a shared selector chip with selected state', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSelectorChip label="Walk-in" active onPress={onPress} />,
      );
    });

    const chip = renderer!.root.findByProps({accessibilityRole: 'button'});

    expect(chip.props.accessibilityState).toEqual({selected: true});
    expect(renderer!.root.findByType(Text).props.children).toBe('Walk-in');

    chip.props.onPress();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('keeps inactive selector chips pressable', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSelectorChip label="Cash" active={false} onPress={onPress} />,
      );
    });

    const chip = renderer!.root.findByProps({accessibilityRole: 'button'});

    expect(chip.props.accessibilityState).toEqual({selected: false});
    chip.props.onPress();
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
