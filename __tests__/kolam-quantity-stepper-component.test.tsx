import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamPressable} from '../src/components/kolam-pressable';
import {KolamQuantityStepper} from '../src/components/kolam-quantity-stepper';

describe('KolamQuantityStepper', () => {
  it('renders the shared quantity stepper value and controls', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamQuantityStepper
          quantity={3}
          onDecrement={jest.fn()}
          onIncrement={jest.fn()}
        />,
      );
    });

    const buttons = renderer!.root.findAllByType(KolamPressable);

    expect(buttons).toHaveLength(2);
    expect(
      renderer!.root.findAllByType(Text).map(node => node.props.children),
    ).toEqual(['-', 3, '+']);
  });

  it('delegates decrement and increment behavior to callers', async () => {
    const onDecrement = jest.fn();
    const onIncrement = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamQuantityStepper
          quantity={1}
          onDecrement={onDecrement}
          onIncrement={onIncrement}
        />,
      );
    });

    const buttons = renderer!.root.findAllByType(KolamPressable);

    buttons[0].props.onPress();
    buttons[1].props.onPress();

    expect(onDecrement).toHaveBeenCalledTimes(1);
    expect(onIncrement).toHaveBeenCalledTimes(1);
  });
});
