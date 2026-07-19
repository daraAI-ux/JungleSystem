import {appConfig} from '../src/config/app';
import {
  getRuntimeBackendEndpointContract,
  getRuntimeBackendEndpointContracts,
  isLocalBackendUrl,
} from '../src/domain/runtime-backend-contract';
import {getRuntimeIdentityItems} from '../src/domain/runtime-identity';

describe('runtime backend contract', () => {
  it('keeps default runtime endpoints on existing production servers', () => {
    expect(getRuntimeBackendEndpointContracts()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'api',
          value: 'amfibi.dunia-anura.com/api',
          status: 'ready',
        }),
        expect.objectContaining({
          id: 'kolam-api',
          value: 'amfibi.dunia-anura.com/api',
          status: 'ready',
        }),
        expect.objectContaining({
          id: 'am-api',
          value: 'frogs.dunia-anura.com/api',
          status: 'ready',
        }),
      ]),
    );
  });

  it('blocks localhost and loopback backend URLs for KolamWindows runtime', () => {
    expect(isLocalBackendUrl('http://localhost:3000/api')).toBe(true);
    expect(isLocalBackendUrl('http://127.0.0.1:3000/api')).toBe(true);
    expect(isLocalBackendUrl(appConfig.kolamApiBaseUrl)).toBe(false);
    expect(
      getRuntimeBackendEndpointContract(
        'kolam-api',
        'http://localhost:3000/api',
      ),
    ).toEqual(
      expect.objectContaining({
        status: 'blocked',
        detail: 'Backend lokal tidak boleh menjadi runtime KolamWindows.',
      }),
    );
  });

  it('surfaces local backend regressions as blocked runtime identity', () => {
    expect(
      getRuntimeIdentityItems({
        backendConfig: {
          apiBaseUrl: appConfig.apiBaseUrl,
          amApiBaseUrl: 'http://127.0.0.1:4000/api',
          kolamApiBaseUrl: 'http://localhost:3000/api',
        },
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'kolam-api',
          status: 'blocked',
        }),
        expect.objectContaining({
          id: 'am-api',
          status: 'blocked',
        }),
      ]),
    );
  });
});