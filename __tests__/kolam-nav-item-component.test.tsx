import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamNavItem} from '../src/components/kolam-nav-item';
import {getShellModule} from '../src/domain/app-shell';

describe('KolamNavItem', () => {
  it('renders non-Kolam module route count and selected state', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamNavItem
          active
          module={getShellModule('checkout')}
          onPress={onPress}
        />,
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
      expect.arrayContaining([
        'Checkout',
        getShellModule('checkout').routes.length,
      ]),
    );
  });

  it('keeps top Kolam area modules free from route-count badges', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamNavItem
          active
          module={getShellModule('settings')}
          onPress={jest.fn()}
        />,
      );
    });

    const labels = renderer!.root
      .findAllByType(Text)
      .map(node => node.props.children);

    expect(labels).toContain('Pengaturan');
    expect(labels).not.toContain(getShellModule('settings').routes.length);
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
