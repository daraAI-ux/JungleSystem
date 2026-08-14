import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import {KolamSettingsPackageUpdateActions} from '../src/components/kolam-settings-package-update-actions';
import {resetKolamPackageUpdateStoreForTests} from '../src/domain/kolam-package-update-store';
import {checkKolamPackageUpdate} from '../src/domain/kolam-package-update-store';
import {fetchKolamPackageLatestRelease} from '../src/services/kolam-package-update-api';
import {getKolamWindowsPackageInfo} from '../src/services/kolam-windows-package-update';

jest.mock('../src/services/kolam-package-update-api', () => ({
  fetchKolamPackageLatestRelease: jest.fn(),
}));

jest.mock('../src/services/kolam-windows-package-update', () => ({
  downloadKolamWindowsMsix: jest.fn(),
  getKolamWindowsPackageInfo: jest.fn(() => ({
    familyName: 'JungleSystem_test',
    name: 'JungleSystem',
    packaged: true,
    publicVersion: '3.1.4',
    publisher: 'CN=user',
    version: '3.1.4.0',
  })),
  installKolamWindowsMsix: jest.fn(),
  restartKolamWindowsApp: jest.fn(),
  subscribeKolamWindowsPackageUpdateProgress: () => () => undefined,
}));

const mockedFetch = fetchKolamPackageLatestRelease as jest.MockedFunction<
  typeof fetchKolamPackageLatestRelease
>;
const mockedInfo = getKolamWindowsPackageInfo as jest.MockedFunction<
  typeof getKolamWindowsPackageInfo
>;

function labels(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root
    .findAll(node => typeof node.props?.accessibilityLabel === 'string')
    .map(node => node.props.accessibilityLabel as string);
}

function texts(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root
    .findAllByType(Text)
    .flatMap(node => {
      const value = node.props.children;
      return typeof value === 'string' || typeof value === 'number'
        ? [String(value)]
        : [];
    });
}

describe('KolamSettingsPackageUpdateActions', () => {
  beforeEach(() => {
    resetKolamPackageUpdateStoreForTests();
    mockedFetch.mockReset();
    mockedInfo.mockReturnValue({
      familyName: 'JungleSystem_test',
      name: 'JungleSystem',
      packaged: true,
      publicVersion: '3.1.4',
      publisher: 'CN=user',
      version: '3.1.4.0',
    });
  });

  it('shows current version with Periksa and a disabled Pasang', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<KolamSettingsPackageUpdateActions />);
      await Promise.resolve();
    });

    expect(texts(renderer!)).toEqual(
      expect.arrayContaining(['Periksa', 'Pasang']),
    );
    expect(texts(renderer!)).toEqual(expect.arrayContaining(['3.1.4']));
    expect(labels(renderer!)).toEqual(expect.arrayContaining(['Periksa', 'Pasang']));

    const pasang = renderer!.root.find(
      node => node.props?.accessibilityLabel === 'Pasang' && node.props?.onPress,
    );
    expect(pasang.props.disabled).toBe(true);
  });

  it('enables Pasang only after a newer release is found', async () => {
    mockedFetch.mockResolvedValue({
      appId: 'JungleSystem',
      version: '3.1.5',
      url: 'https://amfibi.dunia-anura.com/app-downloads/JungleSystem_3.1.5_x64.msix',
      sha512: 'ab'.repeat(64),
      size: 10,
      artifact: 'JungleSystem_3.1.5_x64.msix',
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<KolamSettingsPackageUpdateActions />);
      await Promise.resolve();
    });

    await ReactTestRenderer.act(async () => {
      await checkKolamPackageUpdate({silent: false});
    });

    const pasang = renderer!.root.find(
      node => node.props?.accessibilityLabel === 'Pasang' && node.props?.onPress,
    );
    expect(pasang.props.disabled).toBe(false);
    expect(texts(renderer!)).toEqual(expect.arrayContaining(['3.1.5']));
  });
});
