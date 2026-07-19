import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamSwitch} from '../src/components/kolam-switch';
import {KolamToggleRow} from '../src/components/kolam-toggle-row';

describe('KolamToggleRow', () => {
  it('renders a shared label/description row with a KolamSwitch', async () => {
    const onPress = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamToggleRow
          active
          label="Storefront"
          description="Aktifkan web storefront"
          onPress={onPress}
        />,
      );
    });

    const toggle = renderer!.root.findByType(KolamSwitch);

    expect(toggle.props.active).toBe(true);
    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      'Storefront',
      'Aktifkan web storefront',
    ]);

    toggle.props.onPress();
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
