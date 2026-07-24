import { NativeModules } from 'react-native';

export interface NativeFileSaveResult {
  cancelled: boolean;
  path?: string;
  uri?: string;
  name?: string;
}

export interface NativeFileSaverBridge {
  saveFileBase64(
    suggestedName: string,
    base64Content: string,
  ): Promise<NativeFileSaveResult>;
}

export async function saveNativeBase64File(
  suggestedName: string,
  base64Content: string,
): Promise<NativeFileSaveResult> {
  const bridge = getNativeFileSaverBridge();
  if (!bridge) {
    throw new Error('File saver Windows belum tersedia di runtime.');
  }

  return bridge.saveFileBase64(suggestedName, base64Content);
}

function getNativeFileSaverBridge(): NativeFileSaverBridge | null {
  const bridge = NativeModules.KolamWindowsFilePicker as
    | NativeFileSaverBridge
    | undefined;

  if (bridge && typeof bridge.saveFileBase64 === 'function') {
    return bridge;
  }

  return null;
}
