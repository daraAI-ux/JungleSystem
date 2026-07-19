import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamSelectableRow} from '../src/components/kolam-selectable-row';

describe('KolamSelectableRow', () => {
  it('renders a shared selectable row with title, description, and trailing content', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSelectableRow
          title="Manager"
          description="Full access"
          selected
          onPress={onPress}>
          <Text>yes</Text>
        </KolamSelectableRow>,
      );
    });

    const row = renderer!.root.findByProps({accessibilityRole: 'button'});

    expect(row.props.accessibilityLabel).toBe('Manager');
    expect(row.props.accessibilityState).toEqual({selected: true});
    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      'Manager',
      'Full access',
      'yes',
    ]);

    row.props.onPress();
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
