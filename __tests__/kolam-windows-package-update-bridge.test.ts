import {NativeModules, Platform} from 'react-native';
import {
  getKolamWindowsPackageInfo,
  getKolamWindowsPackageUpdateBridge,
} from '../src/services/kolam-windows-package-update';

describe('kolam windows package update bridge', () => {
  const originalOs = Platform.OS;
  const originalBridge = NativeModules.KolamWindowsPackageUpdate;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: originalOs,
    });
    NativeModules.KolamWindowsPackageUpdate = originalBridge;
  });

  it('returns null outside Windows', () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'ios',
    });

    expect(getKolamWindowsPackageUpdateBridge()).toBeNull();
    expect(getKolamWindowsPackageInfo().packaged).toBe(false);
  });

  it('reads package info from the native module', () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'windows',
    });
    NativeModules.KolamWindowsPackageUpdate = {
      getPackageInfo: () => ({
        familyName: 'JungleSystem_family',
        name: 'JungleSystem',
        packaged: true,
        publicVersion: '3.1.4',
        publisher: 'CN=user',
        version: '3.1.4.0',
      }),
    };

    expect(getKolamWindowsPackageInfo()).toEqual({
      familyName: 'JungleSystem_family',
      name: 'JungleSystem',
      packaged: true,
      publicVersion: '3.1.4',
      publisher: 'CN=user',
      version: '3.1.4.0',
    });
  });
});
