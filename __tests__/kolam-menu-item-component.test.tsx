import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {
  KolamMenuCountBadge,
  KolamMenuItem,
  KolamMenuItemGroupLabel,
  KolamMenuSectionToggle,
} from '../src/components/kolam-menu-item';

describe('KolamMenuItem', () => {
  it('renders shared menu item semantics and calls onPress', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamMenuItem grouped label="Activity Log" onPress={onPress} />,
      );
    });

    const pressable = renderer!.root.findByProps({
      accessibilityRole: 'button',
    });

    pressable.props.onPress();

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(renderer!.root.findByType(Text).props.children).toBe('Activity Log');
  });

  it('renders shared menu group labels', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamMenuItemGroupLabel
          expanded={false}
          label="Label dan Field"
          onPress={onPress}
        />,
      );
    });

    const pressable = renderer!.root.findByProps({
      accessibilityRole: 'button',
    });
    pressable.props.onPress();

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(
      renderer!.root.findAllByType(Text).map(node => node.props.children),
    ).toContain('Label dan Field');
  });

  it('points the group disclosure chevron down when expanded', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamMenuItemGroupLabel
          expanded
          label="Label dan Field"
          onPress={() => undefined}
        />,
      );
    });

    expect(renderer!.root.findByProps({ direction: 'down' })).toBeTruthy();
  });

  it('renders shared section toggles with caller-provided icons', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamMenuSectionToggle
          icon={<Text>v</Text>}
          label="Inventory"
          onPress={onPress}
        />,
      );
    });

    const pressable = renderer!.root.findByProps({
      accessibilityRole: 'button',
    });

    pressable.props.onPress();

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(
      renderer!.root.findAllByType(Text).map(node => node.props.children),
    ).toEqual(['v', 'Inventory']);
  });

  it('renders shared menu count badges', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<KolamMenuCountBadge label={12} />);
    });

    expect(renderer!.root.findByType(Text).props.children).toBe(12);
  });
});
