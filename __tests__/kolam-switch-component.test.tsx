import React from 'react';
import {View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamSwitch} from '../src/components/kolam-switch';

describe('KolamSwitch', () => {
  it('renders the shared native switch state and delegates press behavior', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSwitch active onPress={onPress} />,
      );
    });

    const control = renderer!.root.findByProps({accessibilityRole: 'switch'});

    expect(control.props.accessibilityState).toEqual({
      checked: true,
      disabled: false,
    });

    control.props.onPress();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('blocks press when disabled while preserving checked state', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSwitch active={false} disabled onPress={onPress} />,
      );
    });

    const control = renderer!.root.findByProps({accessibilityRole: 'switch'});

    expect(control.props.disabled).toBe(true);
    expect(control.props.onPress).toBeUndefined();
    expect(control.props.accessibilityState).toEqual({
      checked: false,
      disabled: true,
    });
    expect(renderer!.root.findAllByType(View)).toHaveLength(2);
  });
});
