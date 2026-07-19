import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamIconButton} from '../src/components/kolam-icon-button';

describe('KolamIconButton', () => {
  it('renders a shared framed icon-only button and delegates press behavior', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamIconButton accessibilityLabel="Close" onPress={onPress}>
          <Text>x</Text>
        </KolamIconButton>,
      );
    });

    const button = renderer!.root.findByProps({accessibilityRole: 'button'});

    expect(button.props.accessibilityLabel).toBe('Close');
    expect(renderer!.root.findByType(Text).props.children).toBe('x');

    button.props.onPress();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders ghost compact icon buttons for menu movement controls', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamIconButton size={22} radius="sm" variant="ghost">
          <Text>^</Text>
        </KolamIconButton>,
      );
    });

    expect(renderer!.root.findByType(Text).props.children).toBe('^');
    expect(renderer!.root.findByProps({accessibilityRole: 'button'})).toBeTruthy();
  });

  it('supports full-radius top navigation icon buttons', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamIconButton size={32} radius="full" variant="ghost">
          <Text>A</Text>
        </KolamIconButton>,
      );
    });

    expect(renderer!.root.findByType(Text).props.children).toBe('A');
    expect(renderer!.root.findByProps({accessibilityRole: 'button'})).toBeTruthy();
  });
});
