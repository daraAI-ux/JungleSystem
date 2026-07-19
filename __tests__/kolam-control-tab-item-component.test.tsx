import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamControlTabItem} from '../src/components/kolam-control-tab-item';

describe('KolamControlTabItem', () => {
  it('renders tab semantics, count, flag, and selected state', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamControlTabItem
          count={18}
          flag="Full"
          label="Owner"
          onPress={onPress}
          selected
        />,
      );
    });

    const tab = renderer!.root.findByProps({accessibilityRole: 'tab'});

    tab.props.onPress();

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(tab.props.accessibilityState).toEqual({selected: true});
    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual(
      ['Owner', 18, 'Full'],
    );
    expect(renderer!.root.findAllByType(View).length).toBeGreaterThan(0);
  });

  it('renders an unselected label-only tab', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamControlTabItem label="Staff" onPress={jest.fn()} />,
      );
    });

    const tab = renderer!.root.findByProps({accessibilityRole: 'tab'});

    expect(tab.props.accessibilityState).toEqual({selected: false});
    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      'Staff',
    ]);
  });
});
