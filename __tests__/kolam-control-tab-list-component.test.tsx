import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {KolamControlTabItem} from '../src/components/kolam-control-tab-item';
import {KolamControlTabList} from '../src/components/kolam-control-tab-list';

describe('KolamControlTabList', () => {
  it('renders horizontal tabs and delegates selected item changes', async () => {
    const onSelect = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamControlTabList
          accessibilityLabel="role tabs"
          selectedId="owner"
          onSelect={onSelect}
          items={[
            {id: 'owner', label: 'Owner', count: 18, flag: 'Full'},
            {id: 'staff', label: 'Staff', count: 9},
          ]}
        />,
      );
    });

    expect(renderer!.root.findByProps({accessibilityLabel: 'role tabs'})).toBeTruthy();

    const tabs = renderer!.root.findAllByType(KolamControlTabItem);

    expect(tabs.map(tab => tab.props.label)).toEqual(['Owner', 'Staff']);
    expect(tabs[0].props.selected).toBe(true);
    expect(tabs[1].props.selected).toBe(false);

    tabs[1].props.onPress();

    expect(onSelect).toHaveBeenCalledWith('staff');
  });
});
