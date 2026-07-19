import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamSegment} from '../src/components/kolam-segment';
import {getKolamControlTabsVisualContract} from '../src/domain/kolam-control-tabs';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamSegment', () => {
  it('renders a shared segmented button and delegates press behavior', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSegment label="Rp" active={false} onPress={onPress} />,
      );
    });

    const button = renderer!.root.findByProps({accessibilityRole: 'button'});

    expect(renderer!.root.findByType(Text).props.children).toBe('Rp');

    button.props.onPress();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders a range variant without the tab indicator', async () => {
    let activeRange: ReactTestRenderer.ReactTestRenderer;
    let inactiveRange: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      activeRange = ReactTestRenderer.create(
        <KolamSegment
          label="Bulan Ini"
          active
          onPress={jest.fn()}
          variant="range"
        />,
      );
      inactiveRange = ReactTestRenderer.create(
        <KolamSegment
          label="Tahun Ini"
          active={false}
          onPress={jest.fn()}
          variant="range"
        />,
      );
    });

    expect(activeRange!.root.findByType(Text).props.children).toBe('Bulan Ini');
    const visual = getKolamControlTabsVisualContract();
    const activeButton = activeRange!.root.findByProps({
      accessibilityRole: 'button',
    });
    const activeStyle = StyleSheet.flatten(activeButton.props.style);
    const activeTextStyle = StyleSheet.flatten(
      activeRange!.root.findByType(Text).props.style,
    );

    expect(activeStyle).toEqual(
      expect.objectContaining({
        minHeight: visual.rangeButtonMinHeight,
        paddingHorizontal: visual.rangeButtonPaddingX,
        paddingVertical: visual.rangeButtonPaddingY,
        borderRadius: visual.rangeButtonRadius,
        backgroundColor: V.colors[visual.rangeButtonSelectedBackground],
      }),
    );
    expect(activeTextStyle).toEqual(
      expect.objectContaining({fontSize: visual.rangeButtonFontSize}),
    );
    expect(activeRange!.root.findAllByType(View)).toHaveLength(
      inactiveRange!.root.findAllByType(View).length,
    );
  });

  it('renders the active tab indicator only for active tab variants', async () => {
    let activeTab: ReactTestRenderer.ReactTestRenderer;
    let inactiveTab: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      activeTab = ReactTestRenderer.create(
        <KolamSegment
          label="Semua"
          active
          onPress={jest.fn()}
          variant="tab"
        />,
      );
      inactiveTab = ReactTestRenderer.create(
        <KolamSegment
          label="Product"
          active={false}
          onPress={jest.fn()}
          variant="tab"
        />,
      );
    });

    expect(activeTab!.root.findAllByType(View)).toHaveLength(
      inactiveTab!.root.findAllByType(View).length + 1,
    );
  });
});
