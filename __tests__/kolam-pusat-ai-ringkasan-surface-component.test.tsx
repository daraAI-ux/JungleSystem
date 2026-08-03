import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {KolamPusatAiRingkasanSurface} from '../src/components/kolam-pusat-ai-ringkasan-surface';
import {fetchKolamDaraMarketingHub} from '../src/services/kolam-dara-marketing-hub-api';

jest.mock('../src/services/kolam-dara-marketing-hub-api', () => ({
  fetchKolamDaraMarketingHub: jest.fn(),
}));

const fetchHubMock = fetchKolamDaraMarketingHub as jest.MockedFunction<
  typeof fetchKolamDaraMarketingHub
>;

function renderText(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root
    .findAll(node => typeof node.props.children === 'string')
    .flatMap(node => {
      const value = node.props.children;
      return typeof value === 'string' ? [value] : [];
    });
}

describe('KolamPusatAiRingkasanSurface', () => {
  beforeEach(() => {
    fetchHubMock.mockReset();
    fetchHubMock.mockResolvedValue({
      generatedAt: '2026-08-03T00:00:00.000Z',
      seo: {
        seoScore: 72,
        pendingApprovals: 2,
        negativeMentions: 1,
        keywordCount: 9,
      },
      market: {
        pendingApprovals: 3,
        tooCheap: 4,
        tooExpensive: 5,
        lowMargin: 1,
      },
      integrations: {
        serpConfigured: true,
        searxngReachable: false,
      },
      serpSnapshotsStored: 11,
      quickLinks: [
        {href: '/campaign/dara-seo', label: 'DARA SEO'},
        {href: '/campaign/dara-jobs', label: 'Riwayat proses'},
      ],
      brands: [{id: 'b1', name: 'Anura', productCount: 2, monitoringActive: true}],
      selectedBrandId: 'all',
    });
  });

  it('renders Ringkasan KPI and module actions from live hub', async () => {
    const onRouteChange = jest.fn();
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <KolamPusatAiRingkasanSurface
          onRouteChange={onRouteChange}
          route="/pusat-ai"
        />,
      );
      await Promise.resolve();
    });

    const text = renderText(renderer!).join(' ');
    expect(text).toContain('Skor SEO');
    expect(text).toContain('DARA SEO');
    expect(text).toContain('Market Intel');
    expect(text).toContain('Akses cepat');
    expect(text).toContain('DARA SEO');
    expect(text).not.toContain('Riwayat proses');

    const seoButton = renderer!.root.find(
      node =>
        node.props.accessibilityLabel === 'Buka SEO' ||
        (typeof node.props.label === 'string' && node.props.label === 'Buka SEO'),
    );
    await ReactTestRenderer.act(async () => {
      seoButton.props.onPress();
    });
    expect(onRouteChange).toHaveBeenCalledWith('/campaign/dara-seo');
  });
});
