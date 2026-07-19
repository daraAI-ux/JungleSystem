import React from 'react';
import {View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamSidebarTrigger} from '../src/components/kolam-sidebar-trigger';

describe('KolamSidebarTrigger', () => {
  it('renders shared sidebar trigger semantics and calls onPress', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSidebarTrigger onPress={onPress} />,
      );
    });

    const trigger = renderer!.root.findByProps({accessibilityRole: 'button'});

    trigger.props.onPress();

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(renderer!.root.findAllByType(View).length).toBeGreaterThanOrEqual(3);
  });
});
