import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamUserMenuItem} from '../src/components/kolam-user-menu-item';

describe('KolamUserMenuItem', () => {
  it('renders shared user menu item semantics and calls onPress', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamUserMenuItem
          icon={<View />}
          label="Settings"
          onPress={onPress}
          routeHint="/settings"
          trailing={<Text>{'>'}</Text>}
        />,
      );
    });

    const pressable = renderer!.root.findByProps({
      accessibilityRole: 'button',
    });

    pressable.props.onPress();

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual(
      ['Settings', '/settings', '>'],
    );
  });

  it('keeps danger and section variants renderable', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamUserMenuItem
          danger
          icon={<View />}
          label="Log out"
          onPress={jest.fn()}
          routeHint="auth/logout"
          sectionStart
        />,
      );
    });

    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      'Log out',
      'auth/logout',
    ]);
  });
});
