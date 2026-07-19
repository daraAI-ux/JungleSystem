import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {KolamChoiceSegment} from '../src/components/kolam-choice-segment';
import {KolamChoiceSegmentGroup} from '../src/components/kolam-choice-segment-group';
import {KolamSegment} from '../src/components/kolam-segment';

describe('Kolam choice segment primitives', () => {
  it('routes option selection through KolamSegment', async () => {
    const onSelect = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamChoiceSegment
          id="percentage"
          label="%"
          selectedId="fixed"
          onSelect={onSelect}
        />,
      );
    });

    const segment = renderer!.root.findByType(KolamSegment);

    expect(segment.props.active).toBe(false);
    await act(async () => {
      segment.props.onPress();
    });
    expect(onSelect).toHaveBeenCalledWith('percentage');
  });

  it('renders segment groups from option descriptors', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamChoiceSegmentGroup
          options={[
            {id: 'fixed', label: 'Rp'},
            {id: 'percentage', label: '%'},
          ]}
          selectedId="fixed"
          onSelect={jest.fn()}
        />,
      );
    });

    expect(renderer!.root.findAllByType(KolamChoiceSegment)).toHaveLength(2);
  });
});
