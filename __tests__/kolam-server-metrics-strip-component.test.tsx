import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamServerMetricsStrip} from '../src/components/kolam-server-metrics-strip';

function renderText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root
    .findAllByType(Text)
    .flatMap(node => flattenText(node.props.children));
}

function flattenText(value: React.ReactNode): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(flattenText);
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)];
  }

  return [];
}

describe('KolamServerMetricsStrip', () => {
  it('renders compact CPU RAM and disk percentages', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamServerMetricsStrip
          snapshot={{
            checkedAt: '2026-07-19T00:00:00.000Z',
            hostname: 'kolam-prod',
            cpuPercent: 12.4,
            memoryPercent: 58.9,
            diskPercent: 71,
          }}
        />,
      );
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['CPU 12%', 'RAM 59%', 'Disk 71%']),
    );
  });

  it('renders a safe loading state before the first sample arrives', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamServerMetricsStrip loading snapshot={null} />,
      );
    });

    expect(renderText(renderer!)).toContain('Server ...');
  });
});
