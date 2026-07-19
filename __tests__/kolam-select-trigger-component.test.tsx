import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamSelectTrigger} from '../src/components/kolam-select-trigger';

describe('KolamSelectTrigger', () => {
  it('renders the shared native select trigger value and label', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSelectTrigger
          accessibilityLabel="Status"
          value="Semua status"
        />,
      );
    });

    expect(renderer!.root.findByType(Text).props.children).toBe(
      'Semua status',
    );
    expect(renderer!.root.findByProps({accessibilityLabel: 'Status'})).toBeTruthy();
  });

  it('keeps the chevron affordance for wide select triggers', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamSelectTrigger
          accessibilityLabel="Suspicious"
          value="Semua (incl. suspicious)"
          wide
        />,
      );
    });

    expect(renderer!.root.findAllByType(View).length).toBeGreaterThanOrEqual(2);
  });
});
