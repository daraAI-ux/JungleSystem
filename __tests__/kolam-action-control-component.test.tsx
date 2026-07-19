import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {KolamActionControlButton} from '../src/components/kolam-action-control-button';
import {KolamActionControlSet} from '../src/components/kolam-action-control-set';
import {KolamButton} from '../src/components/kolam-button';

describe('Kolam action control primitives', () => {
  it('normalizes loading and can-run button state through KolamButton', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamActionControlButton
          label="Save"
          loading
          loadingLabel="Saving..."
          canRun={false}
        />,
      );
    });

    const button = renderer!.root.findByType(KolamButton);

    expect(button.props.label).toBe('Saving...');
    expect(button.props.muted).toBe(true);
  });

  it('renders action sets as shared action control buttons', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamActionControlSet
          actions={[
            {id: 'a', label: 'A'},
            {id: 'b', label: 'B', intent: 'primary'},
          ]}
        />,
      );
    });

    expect(renderer!.root.findAllByType(KolamActionControlButton)).toHaveLength(2);
  });
});
