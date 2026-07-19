import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamBreadcrumbItem} from '../src/components/kolam-breadcrumb-item';

describe('KolamBreadcrumbItem', () => {
  it('renders breadcrumb item semantics and calls onPress', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamBreadcrumbItem label="Dashboard" onPress={onPress} />,
      );
    });

    const button = renderer!.root.findByProps({accessibilityRole: 'button'});

    button.props.onPress();

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(button.props.accessibilityState).toEqual({selected: false});
    expect(renderer!.root.findByType(Text).props.children).toBe('Dashboard');
  });

  it('marks current breadcrumb items as selected', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamBreadcrumbItem current label="Settings" onPress={jest.fn()} />,
      );
    });

    const button = renderer!.root.findByProps({accessibilityRole: 'button'});

    expect(button.props.accessibilityState).toEqual({selected: true});
  });
});
