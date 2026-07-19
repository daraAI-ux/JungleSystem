import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {KolamSelectorChip} from '../src/components/kolam-selector-chip';
import {KolamSelectorChipGroup} from '../src/components/kolam-selector-chip-group';

describe('KolamSelectorChipGroup', () => {
  it('renders visible selector chips and forwards selection', async () => {
    const onSelect = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSelectorChipGroup
          limit={2}
          options={[
            {id: 'walk-in', label: 'Walk-in'},
            {id: 'card', label: 'Card'},
            {id: 'cash', label: 'Cash'},
          ]}
          selectedId="card"
          onSelect={onSelect}
        />,
      );
    });

    const chips = renderer!.root.findAllByType(KolamSelectorChip);

    expect(chips).toHaveLength(2);
    expect(chips[1].props.active).toBe(true);
    await act(async () => {
      chips[0].props.onPress();
    });
    expect(onSelect).toHaveBeenCalledWith('walk-in');
  });
});
