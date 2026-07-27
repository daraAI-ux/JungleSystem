import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamServerMetricsStripHost} from '../src/components/kolam-server-metrics-strip-host';

jest.mock('../src/hooks/use-kolam-server-metrics-controller', () => ({
  useKolamServerMetricsController: ({enabled}: {enabled: boolean}) => ({
    loading: false,
    snapshot: enabled
      ? {
          checkedAt: '2026-07-19T00:00:00.000Z',
          cpuPercent: 12,
          memoryPercent: 34,
          diskPercent: 56,
        }
      : null,
  }),
}));

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

describe('KolamServerMetricsStripHost', () => {
  it('owns metrics state and renders the strip without App props', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<KolamServerMetricsStripHost />);
    });

    expect(renderText(renderer!)).toEqual(
      expect.arrayContaining(['CPU 12%', 'RAM 34%', 'Disk 56%']),
    );
  });
});
