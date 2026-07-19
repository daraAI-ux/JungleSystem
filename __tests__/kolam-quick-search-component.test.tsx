import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamQuickSearch} from '../src/components/kolam-quick-search';

describe('KolamQuickSearch', () => {
  it('renders expanded quick search labels and calls onPress', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<KolamQuickSearch onPress={onPress} />);
    });

    const button = renderer!.root.findByProps({accessibilityRole: 'button'});

    button.props.onPress();

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      'Quick Search',
      'Ctrl K',
    ]);
  });

  it('keeps collapsed quick search icon-only', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamQuickSearch collapsed onPress={jest.fn()} />,
      );
    });

    expect(renderer!.root.findAllByType(Text)).toHaveLength(0);
    expect(renderer!.root.findAllByType(View).length).toBeGreaterThan(1);
  });
});
