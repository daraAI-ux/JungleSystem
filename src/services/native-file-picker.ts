import { NativeModules, Platform } from 'react-native';

export interface NativeImagePickerResult {
  cancelled: boolean;
  extension?: string;
  mimeType?: string;
  name?: string;
  path?: string;
  uri?: string;
}

export interface NativeFilePickerBridge {
  pickAudio?(): Promise<NativeImagePickerResult>;
  pickImage(): Promise<NativeImagePickerResult>;
  pickVideo?(): Promise<NativeImagePickerResult>;
}

export async function pickNativeImageFile(): Promise<NativeImagePickerResult> {
  if (Platform.OS !== 'windows') {
    return { cancelled: true };
  }

  const bridge = getNativeFilePickerBridge();
  if (!bridge) {
    throw new Error('File picker Windows belum tersedia di runtime.');
  }

  return bridge.pickImage();
}

export async function pickNativeVideoFile(): Promise<NativeImagePickerResult> {
  if (Platform.OS !== 'windows') {
    return { cancelled: true };
  }

  const bridge = getNativeFilePickerBridge();
  if (!bridge?.pickVideo) {
    throw new Error('File picker video Windows belum tersedia di runtime.');
  }

  return bridge.pickVideo();
}

export async function pickNativeAudioFile(): Promise<NativeImagePickerResult> {
  if (Platform.OS !== 'windows') {
    return { cancelled: true };
  }

  const bridge = getNativeFilePickerBridge();
  if (!bridge?.pickAudio) {
    throw new Error('File picker audio Windows belum tersedia di runtime.');
  }

  return bridge.pickAudio();
}
export function getNativeFilePickerBridge(): NativeFilePickerBridge | null {
  const bridge = NativeModules.KolamWindowsFilePicker as
    | NativeFilePickerBridge
    | undefined;

  if (bridge && typeof bridge.pickImage === 'function') {
    return bridge;
  }

  return null;
}

