import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamHeaderFrame} from '../src/components/kolam-header-frame';
import {KolamShellFrame} from '../src/components/kolam-shell-frame';
import {getDashboardLayoutVisualContract} from '../src/domain/dashboard-layout';

describe('KolamShellFrame structural variants', () => {
  it('renders top navigation chrome with row alignment', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamShellFrame variant="topNavigation">
          <Text>Left</Text>
          <Text>Right</Text>
        </KolamShellFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({
        flexDirection: 'row',
        justifyContent: 'space-between',
      }),
    );
  });

  it('keeps dashboard header as a reusable header frame variant', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamHeaderFrame variant="dashboardHeader">
          <Text>Title</Text>
          <Text>Actions</Text>
        </KolamHeaderFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({
        flexDirection: 'row',
        justifyContent: 'space-between',
      }),
    );
  });

  it('uses the live Beranda layout gap for dashboard layout frames', async () => {
    const visual = getDashboardLayoutVisualContract();
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamShellFrame variant="dashboardLayout">
          <Text>Inventory rail</Text>
          <Text>Operational stack</Text>
        </KolamShellFrame>,
      );
    });

    expect(renderer!.root.findByType(View).props.style).toEqual(
      expect.objectContaining({
        flexDirection: 'column',
        gap: visual.layout.gapY,
        marginBottom: 0,
      }),
    );
  });
});
