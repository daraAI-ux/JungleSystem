import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import {
  clearAuthSource,
  clearAuthToken,
  createMemoryAuthTokenStore,
  saveAuthSource,
  saveAuthToken,
  setAuthTokenStore,
} from '../src/services/token-store';

const fetchMock = jest.fn();

function collectText(
  node: ReactTestRenderer.ReactTestRendererJSON | ReactTestRenderer.ReactTestRendererJSON[] | string | null,
): string[] {
  if (!node) {
    return [];
  }

  if (typeof node === 'string') {
    return [node];
  }

  if (Array.isArray(node)) {
    return node.flatMap(child => collectText(child));
  }

  return node.children?.flatMap(child => collectText(child)) ?? [];
}

describe('Kolam dashboard render order', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
    setAuthTokenStore(createMemoryAuthTokenStore());
    clearAuthToken();
    clearAuthSource();
  });

  it('keeps Beranda content in the same broad order as the live FE', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    saveAuthToken('stored-token');
    saveAuthSource('kolam');
    fetchMock.mockResolvedValue(jsonResponse({
      id: 'user-1',
      email: 'staff@example.test',
      first_name: 'Anura',
      last_name: 'Staff',
      access_inventory: true,
      access_pos: true,
      access_am: true,
      role: {key: 'staff'},
    }));

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<App />);
      await Promise.resolve();
      await Promise.resolve();
    });

    const text = collectText(renderer?.toJSON() ?? null).join(' ');
    const headerIndex = text.indexOf('Beranda');
    const metricIndex = text.indexOf('Omzet Hari ini');
    const visitIndex = text.indexOf('Konfirmasi kunjungan layanan');
    const inventorySectionIndex = text.indexOf('Ringkasan Inventori');
    const inventoryIndex = text.indexOf('Bahan baku');
    const railIndex = text.indexOf('Stok Habis');
    const salesGraphIndex = text.indexOf('Ringkasan Penjualan');
    const pendingIndex = text.indexOf('Pesanan perlu ditindak lanjuti');
    const sourceIndex = text.indexOf('Source repo live');
    const runtimeFooterIndex = text.indexOf('Unified runtime');

    expect(headerIndex).toBeGreaterThanOrEqual(0);
    expect(metricIndex).toBeGreaterThanOrEqual(0);
    expect(visitIndex).toBeGreaterThanOrEqual(0);
    expect(inventorySectionIndex).toBeGreaterThanOrEqual(0);
    expect(inventoryIndex).toBeGreaterThanOrEqual(0);
    expect(railIndex).toBeGreaterThanOrEqual(0);
    expect(salesGraphIndex).toBeGreaterThanOrEqual(0);
    expect(pendingIndex).toBeGreaterThanOrEqual(0);
    expect(sourceIndex).toBe(-1);
    expect(runtimeFooterIndex).toBe(-1);
    expect(headerIndex).toBeLessThan(metricIndex);
    expect(metricIndex).toBeLessThan(visitIndex);
    expect(visitIndex).toBeLessThan(inventorySectionIndex);
    expect(inventorySectionIndex).toBeLessThan(inventoryIndex);
    expect(inventoryIndex).toBeLessThan(railIndex);
    expect(railIndex).toBeLessThan(salesGraphIndex);
    expect(salesGraphIndex).toBeLessThan(pendingIndex);

    await ReactTestRenderer.act(async () => {
      renderer?.unmount();
    });
  });
});

function jsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    text: jest.fn().mockResolvedValue(JSON.stringify(payload)),
  };
}





