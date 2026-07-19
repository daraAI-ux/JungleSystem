import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamPaginationItem} from '../src/components/kolam-pagination-item';

describe('KolamPaginationItem', () => {
  it('renders a shared page item with selected state', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamPaginationItem label={2} selected onPress={jest.fn()} />,
      );
    });

    const button = renderer!.root.findByProps({accessibilityRole: 'button'});

    expect(button.props.accessibilityState).toEqual({selected: true});
    expect(button.props.disabled).toBe(false);
    expect(renderer!.root.findByType(Text).props.children).toBe(2);
  });

  it('blocks disabled navigation presses while keeping chevron affordance', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamPaginationItem
          direction="previous"
          disabled
          onPress={onPress}
        />,
      );
    });

    const button = renderer!.root.findByProps({accessibilityRole: 'button'});

    expect(button.props.disabled).toBe(true);
    expect(button.props.onPress).toBeUndefined();
    expect(renderer!.root.findAllByType(View).length).toBeGreaterThanOrEqual(1);
  });
});
