import React from 'react';
import {Text, View} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamEmptyState} from '../src/components/kolam-empty-state';
import {getKolamEmptyStateVisualContract} from '../src/domain/kolam-empty-state';
import {kolamVisualTokens as V} from '../src/domain/kolam-visual';

describe('KolamEmptyState', () => {
  it('renders title, message, and live visual dimensions', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamEmptyState
          title="Belum ada data"
          message="Sinkronisasi belum mengirim item."
        />,
      );
    });

    const contract = getKolamEmptyStateVisualContract();
    const text = renderer!.root
      .findAllByType(Text)
      .map(node => node.props.children);
    const styles = JSON.stringify(
      renderer!.root.findAllByType(View).map(node => node.props.style),
    );

    expect(text).toContain('Belum ada data');
    expect(text).toContain('Sinkronisasi belum mengirim item.');
    expect(styles).toContain(`"minHeight":${contract.full.minHeight}`);
    expect(styles).toContain(`"width":${contract.full.iconRingSize}`);
  });

  it('can render the compact table empty state', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamEmptyState compact title="Kosong" message="Tidak ada hasil." />,
      );
    });

    const contract = getKolamEmptyStateVisualContract();
    const styles = JSON.stringify(
      renderer!.root.findAllByType(View).map(node => node.props.style),
    );

    expect(styles).toContain(`"minHeight":${contract.compact.minHeight}`);
    expect(styles).toContain(`"width":${contract.compact.iconRingSize}`);
  });

  it('can render the live right rail empty state without icon or message', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamEmptyState title="Semua produk tersedia" variant="dashboardRail" />,
      );
    });

    const contract = getKolamEmptyStateVisualContract();
    const text = renderer!.root
      .findAllByType(Text)
      .map(node => node.props.children);
    const views = renderer!.root.findAllByType(View);
    const title = renderer!.root.findByType(Text);

    expect(text).toEqual(['Semua produk tersedia']);
    expect(views).toHaveLength(1);
    expect(title.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          color: V.colors[contract.dashboardRail.titleTone],
          fontSize: contract.dashboardRail.titleFontSize,
          fontWeight: '400',
        }),
      ]),
    );
  });
});
