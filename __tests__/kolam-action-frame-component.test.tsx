import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamActionFrame} from '../src/components/kolam-action-frame';
import {KolamPressable} from '../src/components/kolam-pressable';

describe('KolamActionFrame', () => {
  it('routes compact action frames through KolamPressable', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamActionFrame
          accessibilityLabel="See all"
          onPress={onPress}
          variant="text">
          <Text>See all</Text>
        </KolamActionFrame>,
      );
    });

    const action = renderer!.root.findByType(KolamPressable);

    expect(action.props.accessibilityLabel).toBe('See all');
    expect(action.props.accessibilityRole).toBe('button');
    action.props.onPress();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('supports table action sizing without losing content', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamActionFrame accessibilityLabel="Details" variant="table">
          <Text>Icon</Text>
        </KolamActionFrame>,
      );
    });

    expect(renderer!.root.findByType(Text).props.children).toBe('Icon');
  });
});
