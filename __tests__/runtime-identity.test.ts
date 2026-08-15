import {appConfig} from '../src/config/app';
import {
  getRuntimeIdentityItems,
  getRuntimeIdentitySummary,
} from '../src/domain/runtime-identity';

describe('runtime identity surface', () => {
  it('shows KolamWindows as the native client without replacing Electron access', () => {
    const items = getRuntimeIdentityItems();

    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'native-client',
          value: appConfig.nativeUserAgent,
          detail:
            'Origin: app://kolamwindows / User-Agent: KolamWindows/3.1.7 / x-da-client: kolam-windows / x-da-client-version: 3.1.7 / x-source: pos',
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

  it('keeps device identity partial until Windows runtime supplies signed MACs', () => {
    expect(getRuntimeIdentityItems()).toContainEqual(
      expect.objectContaining({
        id: 'device-identity',
        value: 'MAC missing',
        detail: 'native MAC unavailable',
        status: 'partial',
      }),
    );

    expect(
      getRuntimeIdentityItems({deviceIdentityStatus: 'pending'}),
    ).toContainEqual(
      expect.objectContaining({
        id: 'device-identity',
        value: 'Pending native MAC',
        status: 'partial',
      }),
    );

    expect(
      getRuntimeIdentityItems({deviceIdentityStatus: 'missing'}),
    ).toContainEqual(
      expect.objectContaining({
        id: 'device-identity',
        value: 'MAC missing',
        detail: 'native MAC unavailable',
        status: 'partial',
      }),
    );

    expect(
      getRuntimeIdentityItems({deviceIdentityStatus: 'mac-only'}),
    ).toContainEqual(
      expect.objectContaining({
        id: 'device-identity',
        value: 'MAC attached',
        detail: 'x-device-mac attached; signature pending',
        status: 'partial',
      }),
    );

    expect(
      getRuntimeIdentityItems({deviceIdentityStatus: 'signed'}),
    ).toContainEqual(
      expect.objectContaining({
        id: 'device-identity',
        value: 'MAC signed',
        detail: 'x-device-mac + x-device-mac-signature',
        status: 'ready',
      }),
    );

    expect(
      getRuntimeIdentityItems({deviceIdentityAttached: true}),
    ).toContainEqual(
      expect.objectContaining({
        id: 'device-identity',
        value: 'MAC signed',
        status: 'ready',
      }),
    );
  });

  it('summarizes runtime readiness for the compact status strip', () => {
    expect(getRuntimeIdentitySummary(getRuntimeIdentityItems())).toEqual({
      ready: 3,
      partial: 1,
      blocked: 0,
    });
  });
});
