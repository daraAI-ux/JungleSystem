import { NativeModules, Platform } from 'react-native';

export interface NativeImagePickerResult {
  cancelled: boolean;
  dropScreenX?: number;
  dropScreenY?: number;
  extension?: string;
  mimeType?: string;
  name?: string;
  path?: string;
  uri?: string;
}

export interface NativeFilePickerBridge {
  consumeDroppedImage?(): Promise<NativeImagePickerResult>;
  peekDroppedImage?(): Promise<NativeImagePickerResult>;
  pickAudio?(): Promise<NativeImagePickerResult>;
  pickFile?(): Promise<NativeImagePickerResult>;
  pickImage(): Promise<NativeImagePickerResult>;
  pickVideo?(): Promise<NativeImagePickerResult>;
  readSvgPreviewFile?(pathOrUri: string): Promise<{ ok: boolean; text?: string }>;
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

export async function peekNativeDroppedImage(): Promise<NativeImagePickerResult> {
  if (Platform.OS !== 'windows') {
    return { cancelled: true };
  }

  const bridge = getNativeFilePickerBridge();
  if (!bridge?.peekDroppedImage) {
    return { cancelled: true };
  }

  try {
    const result = await bridge.peekDroppedImage();
    if (!result || typeof result !== 'object') {
      return { cancelled: true };
    }
    return result;
  } catch {
    return { cancelled: true };
  }
}

export async function consumeNativeDroppedImage(): Promise<NativeImagePickerResult> {
  if (Platform.OS !== 'windows') {
    return { cancelled: true };
  }

  const bridge = getNativeFilePickerBridge();
  if (!bridge?.consumeDroppedImage) {
    return { cancelled: true };
  }

  try {
    const result = await bridge.consumeDroppedImage();
    if (!result || typeof result !== 'object') {
      return { cancelled: true };
    }
    return result;
  } catch {
    return { cancelled: true };
  }
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

export async function pickNativeAssetFile(): Promise<NativeImagePickerResult> {
  if (Platform.OS !== 'windows') {
    return { cancelled: true };
  }

  const bridge = getNativeFilePickerBridge();
  if (!bridge?.pickFile) {
    throw new Error('File picker aset Windows belum tersedia di runtime.');
  }

  return bridge.pickFile();
}

export async function readNativeSvgPreviewFile(pathOrUri: string): Promise<string> {
  if (Platform.OS !== 'windows') {
    return '';
  }

  const bridge = getNativeFilePickerBridge();
  if (!bridge?.readSvgPreviewFile) {
    return '';
  }

  const result = await bridge.readSvgPreviewFile(pathOrUri);
  return result.ok && typeof result.text === 'string' ? result.text : '';
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
