import { NativeModules, Platform } from 'react-native';
import {
  getNativeFilePickerBridge,
  pickNativeImageFile,
} from '../src/services/native-file-picker';

describe('native file picker bridge', () => {
  const originalOs = Platform.OS;
  const originalBridge = NativeModules.KolamWindowsFilePicker;

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: originalOs,
    });
    NativeModules.KolamWindowsFilePicker = originalBridge;
  });

  it('returns null when the Windows bridge is not registered', () => {
    NativeModules.KolamWindowsFilePicker = undefined;

    expect(getNativeFilePickerBridge()).toBeNull();
  });

  it('returns cancelled outside Windows runtime', async () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'ios',
    });

    await expect(pickNativeImageFile()).resolves.toEqual({ cancelled: true });
  });

  it('delegates image picking to the Windows native bridge', async () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'windows',
    });
    NativeModules.KolamWindowsFilePicker = {
      pickImage: jest.fn().mockResolvedValue({
        cancelled: false,
        uri: 'file:///C:/logo.png',
      }),
    };

    await expect(pickNativeImageFile()).resolves.toEqual({
      cancelled: false,
      uri: 'file:///C:/logo.png',
    });
  });
});
