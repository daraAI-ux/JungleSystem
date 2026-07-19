import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamMenuPressableFrame} from '../src/components/kolam-menu-pressable-frame';
import {KolamPressable} from '../src/components/kolam-pressable';

describe('KolamMenuPressableFrame', () => {
  it('routes menu pressable frames through KolamPressable', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamMenuPressableFrame onPress={onPress} variant="groupedItem">
          <Text>Activity Log</Text>
        </KolamMenuPressableFrame>,
      );
    });

    const frame = renderer!.root.findByType(KolamPressable);

    expect(frame.props.accessibilityRole).toBe('button');
    frame.props.onPress();
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(renderer!.root.findByType(Text).props.children).toBe('Activity Log');
  });

  it('supports section toggle row layout variant', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamMenuPressableFrame onPress={() => undefined} variant="sectionToggle">
          <Text>Inventory</Text>
        </KolamMenuPressableFrame>,
      );
    });

    expect(renderer!.root.findByType(Text).props.children).toBe('Inventory');
  });
});
