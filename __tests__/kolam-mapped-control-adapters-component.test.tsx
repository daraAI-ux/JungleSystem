import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {KolamControlTabList} from '../src/components/kolam-control-tab-list';
import {KolamMappedControlTabList} from '../src/components/kolam-mapped-control-tab-list';
import {KolamMappedSelectorChipGroup} from '../src/components/kolam-mapped-selector-chip-group';
import {KolamMappedSummaryCardList} from '../src/components/kolam-mapped-summary-card-list';
import {KolamMappedSurfacePanel} from '../src/components/kolam-mapped-surface-panel';
import {KolamSelectorChipGroup} from '../src/components/kolam-selector-chip-group';
import {KolamSummaryCardList} from '../src/components/kolam-summary-card-list';
import {KolamSurfacePanel} from '../src/components/kolam-surface-panel';

describe('mapped control adapters', () => {
  it('maps domain items into selector chip options', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamMappedSelectorChipGroup
          selectedId="cash"
          onSelect={jest.fn()}
          items={[{id: 'cash', name: 'Cash'}]}
          getOption={item => ({id: item.id, label: item.name})}
        />,
      );
    });

    expect(renderer!.root.findByType(KolamSelectorChipGroup).props.options).toEqual([
      {id: 'cash', label: 'Cash'},
    ]);
  });

  it('maps domain items into control tabs', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamMappedControlTabList
          selectedId="owner"
          onSelect={jest.fn()}
          items={[{id: 'owner', label: 'Owner', permissions: 12}]}
          getItem={item => ({
            count: item.permissions,
            id: item.id,
            label: item.label,
          })}
        />,
      );
    });

    expect(renderer!.root.findByType(KolamControlTabList).props.items).toEqual([
      {count: 12, id: 'owner', label: 'Owner'},
    ]);
  });

  it('maps domain items into summary cards and surface tabs', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <>
          <KolamMappedSummaryCardList
            accessibilityLabel="summary"
            items={[{id: 'role', label: 'Role', total: 3}]}
            getItem={item => ({
              id: item.id,
              meta: `${item.total} items`,
              title: item.label,
            })}
          />
          <KolamMappedSurfacePanel
            title="Settings"
            description="Config"
            selectedTabId="web"
            onSelectTab={jest.fn()}
            tabItems={[{id: 'web', badge: 'Web'}]}
            getTab={item => ({id: item.id, label: item.badge})}>
            <Text>Body</Text>
          </KolamMappedSurfacePanel>
        </>,
      );
    });

    expect(renderer!.root.findByType(KolamSummaryCardList).props.items).toEqual([
      {id: 'role', meta: '3 items', title: 'Role'},
    ]);
    expect(renderer!.root.findByType(KolamSurfacePanel).props.tabs).toEqual([
      {id: 'web', label: 'Web'},
    ]);
  });
});
