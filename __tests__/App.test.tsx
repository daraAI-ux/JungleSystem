/**
 * @format
 */

import React from 'react';
import { Text } from 'react-native';
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
import {
  MemoryLocalDataStore,
  resetLocalDataStore,
  setLocalDataStore,
} from '../src/services/local-data-store';
import { persistUnifiedDatasetIfChanged } from '../src/services/unified-local-cache';
import {
  seedUnifiedDataset,
  type UnifiedDataset,
} from '../src/services/unified-data';

const fetchMock = jest.fn();
const mountedRenderers: ReactTestRenderer.ReactTestRenderer[] = [];

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock;
  setAuthTokenStore(createMemoryAuthTokenStore());
  clearAuthToken();
  clearAuthSource();
  setLocalDataStore(new MemoryLocalDataStore());
});

afterEach(async () => {
  await ReactTestRenderer.act(async () => {
    mountedRenderers.splice(0).forEach(renderer => renderer.unmount());
    await Promise.resolve();
  });
  resetLocalDataStore();
});

function renderApp() {
  const renderer = ReactTestRenderer.create(<App />);
  mountedRenderers.push(renderer);
  return renderer;
}

test('renders correctly', async () => {
  await ReactTestRenderer.act(async () => {
    renderApp();
    await Promise.resolve();
  });
});

test('shows the dedicated login screen before a server session exists', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(async () => {
    renderer = renderApp();
    await Promise.resolve();
  });

  const textNodes = renderer!.root.findAllByType(Text);
  const renderedText = textNodes
    .map(node => node.props.children)
    .flat()
    .filter(Boolean);

  expect(renderedText).toEqual(
    expect.arrayContaining([
      'Azurda',
      'Backend',
      'Native Client',
      'Login',
    ]),
  );
  expect(renderedText).not.toContain('Beranda');
});

test('keeps the native shell aligned with the live Kolam sidebar chrome after login restore', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  saveAuthToken('stored-token');
  saveAuthSource('kolam');
  fetchMock.mockResolvedValue(
    jsonResponse({
      id: 'user-1',
      email: 'staff@example.test',
      first_name: 'Anura',
      last_name: 'Staff',
      access_inventory: true,
      access_pos: true,
      access_am: true,
      role: { key: 'staff' },
    }),
  );

  await ReactTestRenderer.act(async () => {
    renderer = renderApp();
    await Promise.resolve();
    await Promise.resolve();
  });

  const textNodes = renderer!.root.findAllByType(Text);
  const renderedText = textNodes
    .map(node => node.props.children)
    .flat()
    .filter(Boolean);

  expect(renderedText).toEqual(
    expect.arrayContaining(['Kolam', 'POS', 'AM', 'Plugin']),
  );
  expect(renderedText).not.toContain('Kolam + POS + AM');
  expect(renderedText).not.toContain('Native Windows');
});

test('marks the active shell navigation item as selected like the live current page after login restore', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  saveAuthToken('stored-token');
  saveAuthSource('kolam');
  fetchMock.mockResolvedValue(
    jsonResponse({
      id: 'user-1',
      email: 'staff@example.test',
      first_name: 'Anura',
      last_name: 'Staff',
      access_inventory: true,
      access_pos: true,
      access_am: true,
      role: { key: 'staff' },
    }),
  );

  await ReactTestRenderer.act(async () => {
    renderer = renderApp();
    await Promise.resolve();
    await Promise.resolve();
  });

  const selectedControls = renderer!.root
    .findAllByProps({ accessibilityRole: 'button' })
    .filter(node => node.props.accessibilityState?.selected === true);
  const selectedKolamNavItems = selectedControls.filter(node =>
    node
      .findAllByType(Text)
      .map(textNode => textNode.props.children)
      .flat()
      .includes('Kolam'),
  );

  expect(selectedKolamNavItems.length).toBeGreaterThan(0);
  expect(
    selectedKolamNavItems[0]
      .findAllByType(Text)
      .map(node => node.props.children)
      .flat(),
  ).toContain('Kolam');
});

test('shows cached Kolam dashboard first when a stored session opens the app again', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  const cachedDataset: UnifiedDataset = {
    ...seedUnifiedDataset,
    kolam: {
      ...seedUnifiedDataset.kolam,
      source: 'live',
      dashboardCounts: {
        products: 77,
        rawProducts: 6,
        species: 5,
        services: 4,
      },
    },
    sync: {
      pos: 'disabled',
      kolam: 'live',
      am: 'disabled',
    },
  };
  let rejectLiveRequests: (error: Error) => void = () => undefined;
  const liveRequest = new Promise<never>((_, reject) => {
    rejectLiveRequests = reject;
  });

  await persistUnifiedDatasetIfChanged({
    cacheOwnerId: 'user-1',
    dataset: cachedDataset,
  });
  saveAuthToken('stored-token');
  saveAuthSource('kolam');
  fetchMock.mockImplementation((url: string) => {
    if (url.endsWith('/auth/detail-user')) {
      return Promise.resolve(
        jsonResponse({
          id: 'user-1',
          email: 'staff@example.test',
          first_name: 'Anura',
          last_name: 'Staff',
          access_inventory: true,
          access_pos: false,
          access_am: false,
          role: { key: 'staff' },
        }),
      );
    }

    return liveRequest;
  });

  await ReactTestRenderer.act(async () => {
    renderer = renderApp();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });

  const renderedText = renderer!.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .flat()
    .filter(Boolean)
    .map(String);

  expect(renderedText).toEqual(
    expect.arrayContaining(['Beranda', 'Cache', '77']),
  );
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining('/auth/detail-user'),
    expect.any(Object),
  );

  rejectLiveRequests(new Error('offline after cached render'));
  await ReactTestRenderer.act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
});

function jsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    text: jest.fn().mockResolvedValue(JSON.stringify(payload)),
  };
}
