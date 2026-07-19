import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamInteractivePillFrame} from '../src/components/kolam-interactive-pill-frame';
import {KolamPillFrame} from '../src/components/kolam-pill-frame';
import {KolamPressable} from '../src/components/kolam-pressable';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamPillFrame', () => {
  it('renders shared state pill chrome with selected and disabled styles', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamPillFrame disabled selected>
          <Text>View</Text>
        </KolamPillFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({borderColor: V.colors.primary}),
        expect.objectContaining({opacity: 0.78}),
      ]),
    );
    expect(renderer!.root.findByType(Text).props.children).toBe('View');
  });

  it('routes selector pills through KolamPressable', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamInteractivePillFrame
          accessibilityState={{selected: true}}
          onPress={onPress}
          selected
          variant="selector">
          <Text>Cash</Text>
        </KolamInteractivePillFrame>,
      );
    });

    const pill = renderer!.root.findByType(KolamPressable);

    expect(pill.props.accessibilityState).toEqual({selected: true});
    expect(pill.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({backgroundColor: V.colors.primary}),
      ]),
    );
    pill.props.onPress();
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
