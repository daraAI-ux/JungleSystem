import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamSegment} from '../src/components/kolam-segment';
import {KolamSurfacePanel} from '../src/components/kolam-surface-panel';

describe('KolamSurfacePanel', () => {
  it('renders header, tabs, children, and delegates tab selection', async () => {
    const onSelectTab = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSurfacePanel
          title="Settings"
          description="Configuration surfaces"
          selectedTabId="web"
          onSelectTab={onSelectTab}
          tabs={[
            {id: 'web', label: 'Web'},
            {id: 'roles', label: 'Roles'},
          ]}>
          <Text>Body</Text>
        </KolamSurfacePanel>,
      );
    });

    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      'Settings',
      'Configuration surfaces',
      'Web',
      'Roles',
      'Body',
    ]);

    const tabs = renderer!.root.findAllByType(KolamSegment);

    expect(tabs[0].props.active).toBe(true);
    expect(tabs[1].props.active).toBe(false);

    tabs[1].props.onPress();

    expect(onSelectTab).toHaveBeenCalledWith('roles');
  });
});
