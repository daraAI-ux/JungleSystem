import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamCommandPaletteItem} from '../src/components/kolam-command-palette-item';

describe('KolamCommandPaletteItem', () => {
  it('renders command palette item semantics and calls onPress', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamCommandPaletteItem
          description="Open native route"
          icon={<View />}
          label="Activity Log"
          meta="settings/activity-log"
          onPress={onPress}
          showMeta
        />,
      );
    });

    const pressable = renderer!.root.findByProps({
      accessibilityRole: 'button',
    });

    pressable.props.onPress();

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual(
      ['Activity Log', 'Open native route', 'settings/activity-log'],
    );
  });

  it('can hide optional command metadata', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamCommandPaletteItem
          description="Hidden"
          icon={<View />}
          label="Command"
          meta="hidden"
          onPress={jest.fn()}
          showDescription={false}
          showMeta={false}
        />,
      );
    });

    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      'Command',
    ]);
  });
});
