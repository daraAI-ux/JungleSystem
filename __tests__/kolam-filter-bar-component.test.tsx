import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamButton} from '../src/components/kolam-button';
import {KolamFilterBar} from '../src/components/kolam-filter-bar';
import {KolamSelectTrigger} from '../src/components/kolam-select-trigger';

describe('KolamFilterBar', () => {
  it('renders search, select, and refresh controls from shared primitives', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamFilterBar
          accessibilityLabel="filters"
          controls={[
            {
              id: 'search',
              label: 'Cari',
              control: 'search',
              triggerWidth: 'min-w-64',
              placeholder: 'Cari path atau IP...',
            },
            {
              id: 'status',
              label: 'Status',
              control: 'select',
              triggerWidth: 'min-w-32',
              options: [{id: '', label: 'Semua status'}],
            },
          ]}
        />,
      );
    });

    expect(renderer!.root.findByProps({accessibilityLabel: 'filters'})).toBeTruthy();
    expect(renderer!.root.findByType(KolamSelectTrigger).props).toEqual(
      expect.objectContaining({
        accessibilityLabel: 'Status',
        value: 'Semua status',
      }),
    );
    expect(renderer!.root.findByType(KolamButton).props.label).toBe('Refresh');
    expect(renderer!.root.findAllByType(Text).map(node => node.props.children)).toEqual([
      'Cari path atau IP...',
      'Semua status',
      'Refresh',
    ]);
  });
});
