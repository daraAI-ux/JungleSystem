import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamActionButton} from '../src/components/kolam-action-button';

describe('KolamActionButton', () => {
  it('renders a shared action button with icon and label', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamActionButton
          label="Edit role"
          icon={<View accessibilityLabel="edit icon" />}
          onPress={onPress}
        />,
      );
    });

    const button = renderer!.root.findByProps({accessibilityRole: 'button'});

    expect(renderer!.root.findByType(Text).props.children).toBe('Edit role');
    button.props.onPress();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('blocks disabled action presses and shows the disabled reason label', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamActionButton
          label="Delete role"
          intent="danger"
          disabled
          disabledReason="Default role cannot be deleted"
          onPress={onPress}
        />,
      );
    });

    const button = renderer!.root.findByProps({accessibilityRole: 'button'});
    const labels = renderer!.root.findAllByType(Text).map(node => node.props.children);

    expect(button.props.disabled).toBe(true);
    expect(button.props.onPress).toBeUndefined();
    expect(labels).toEqual(['Delete role', 'Default']);
  });

  it('passes through accessibility and visual override props', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamActionButton
          label="Hapus role"
          accessibilityLabel="Hapus role custom"
          style={{minHeight: 30}}
          textStyle={{fontSize: 11}}
        />,
      );
    });

    const button = renderer!.root.findByProps({accessibilityRole: 'button'});
    const label = renderer!.root.findByType(Text);

    expect(button.props.accessibilityLabel).toBe('Hapus role custom');
    expect(button.props.style).toContainEqual({minHeight: 30});
    expect(label.props.style).toContainEqual({fontSize: 11});
  });
});
