import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {KolamInteractionFrame} from '../src/components/kolam-interaction-frame';
import {KolamPressable} from '../src/components/kolam-pressable';

describe('KolamInteractionFrame', () => {
  it('normalizes button role, state, and press forwarding through KolamPressable', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamInteractionFrame
          accessibilityLabel="Open"
          selected
          onPress={onPress}>
          open
        </KolamInteractionFrame>,
      );
    });

    const frame = renderer!.root.findByType(KolamPressable);

    expect(frame.props.accessibilityRole).toBe('button');
    expect(frame.props.accessibilityLabel).toBe('Open');
    expect(frame.props.accessibilityState).toEqual({
      disabled: false,
      selected: true,
    });

    await act(async () => {
      frame.props.onPress();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('blocks disabled press handlers consistently', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamInteractionFrame disabled onPress={onPress}>
          blocked
        </KolamInteractionFrame>,
      );
    });

    const frame = renderer!.root.findByType(KolamPressable);

    expect(frame.props.disabled).toBe(true);
    expect(frame.props.onPress).toBeUndefined();
    expect(frame.props.accessibilityState).toEqual({disabled: true});
  });
});
