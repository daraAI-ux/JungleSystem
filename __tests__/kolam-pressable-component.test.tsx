import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamPressable} from '../src/components/kolam-pressable';

describe('KolamPressable', () => {
  it('defaults shared clickable surfaces to button semantics', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamPressable onPress={onPress}>
          <Text>Open</Text>
        </KolamPressable>,
      );
    });

    const pressable = renderer!.root.findByProps({
      accessibilityRole: 'button',
    });

    pressable.props.onPress();

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(renderer!.root.findByType(Text).props.children).toBe('Open');
  });

  it('preserves explicit accessibility role and state for specialized controls', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamPressable
          accessibilityRole="tab"
          accessibilityState={{selected: true}}>
          <Text>Roles</Text>
        </KolamPressable>,
      );
    });

    const pressable = renderer!.root.findByProps({
      accessibilityRole: 'tab',
    });

    expect(pressable.props.accessibilityState).toEqual({selected: true});
  });
});
