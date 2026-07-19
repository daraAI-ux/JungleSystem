import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamNavItem} from '../src/components/kolam-nav-item';
import {getShellModule} from '../src/domain/app-shell';

describe('KolamNavItem', () => {
  it('renders the module label, route count, and selected state', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamNavItem active module={getShellModule('kolam')} onPress={onPress} />,
      );
    });

    const pressable = renderer!.root.findByProps({
      accessibilityRole: 'button',
    });
    const textNodes = renderer!.root.findAllByType(Text);

    pressable.props.onPress();

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(pressable.props.accessibilityState).toEqual({selected: true});
    expect(textNodes.map(node => node.props.children)).toEqual(
      expect.arrayContaining(['Kolam', getShellModule('kolam').routes.length]),
    );
  });

  it('keeps collapsed sidebar items icon-only', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamNavItem
          collapsed
          module={getShellModule('settings')}
          onPress={jest.fn()}
        />,
      );
    });

    expect(renderer!.root.findAllByType(Text)).toHaveLength(0);
    expect(renderer!.root.findAllByType(View).length).toBeGreaterThan(1);
  });
});
