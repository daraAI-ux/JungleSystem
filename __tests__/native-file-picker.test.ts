import { NativeModules, Platform } from 'react-native';
import {
  getNativeFilePickerBridge,
  pickNativeAssetFile,
  pickNativeAudioFile,
  pickNativeImageFile,
  pickNativeVideoFile,
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

  it('delegates asset, video, and audio picking to the Windows native bridge', async () => {
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: 'windows',
    });
    NativeModules.KolamWindowsFilePicker = {
      pickImage: jest.fn(),
      pickFile: jest.fn().mockResolvedValue({
        cancelled: false,
        mimeType: 'video/mp4',
        name: 'clip.mp4',
        path: 'C:\\media\\clip.mp4',
        uri: 'file:///C:/media/clip.mp4',
      }),
      pickVideo: jest.fn().mockResolvedValue({
        cancelled: false,
        mimeType: 'video/webm',
        name: 'clip.webm',
        path: 'C:\\media\\clip.webm',
        uri: 'file:///C:/media/clip.webm',
      }),
      pickAudio: jest.fn().mockResolvedValue({
        cancelled: false,
        mimeType: 'audio/mpeg',
        name: 'voice.mp3',
        path: 'C:\\media\\voice.mp3',
        uri: 'file:///C:/media/voice.mp3',
      }),
    };

    await expect(pickNativeAssetFile()).resolves.toMatchObject({
      mimeType: 'video/mp4',
      name: 'clip.mp4',
      path: 'C:\\media\\clip.mp4',
    });
    await expect(pickNativeVideoFile()).resolves.toMatchObject({
      mimeType: 'video/webm',
      name: 'clip.webm',
    });
    await expect(pickNativeAudioFile()).resolves.toMatchObject({
      mimeType: 'audio/mpeg',
      name: 'voice.mp3',
    });
  });
});
