import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamInteractiveRowFrame} from '../src/components/kolam-interactive-row-frame';
import {KolamPressable} from '../src/components/kolam-pressable';
import {KolamRowFrame} from '../src/components/kolam-row-frame';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamRowFrame', () => {
  it('renders shared static row variants with Kolam table chrome', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamRowFrame variant="surface">
          <Text>Surface row</Text>
        </KolamRowFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({backgroundColor: V.colors.bg}),
      ]),
    );
    expect(renderer!.root.findByType(Text).props.children).toBe('Surface row');
  });

  it('routes shared interactive rows through KolamPressable', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamInteractiveRowFrame
          accessibilityLabel="role row"
          accessibilityState={{selected: true}}
          onPress={onPress}
          selected>
          <Text>Role</Text>
        </KolamInteractiveRowFrame>,
      );
    });

    const row = renderer!.root.findByType(KolamPressable);

    expect(row.props.accessibilityLabel).toBe('role row');
    expect(row.props.accessibilityState).toEqual({selected: true});
    expect(row.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({backgroundColor: V.colors.successSoft}),
      ]),
    );

    row.props.onPress();
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
