type NativeClipboardLike = {
  setString?: (value: string) => Promise<void> | void;
};

type NativeClipboardModule = NativeClipboardLike & {
  default?: NativeClipboardLike;
};

declare const require: (moduleName: string) => unknown;

export async function copyTextToClipboard(value: string) {
  const text = value.trim();
  if (!text) {
    return false;
  }

  const nativeClipboard = getNativeClipboard();
  if (nativeClipboard?.setString) {
    try {
      await nativeClipboard.setString(text);
      return true;
    } catch {
      // Native module may be installed but not linked until the next Windows build.
    }
  }

  const runtime = globalThis as unknown as {
    navigator?: {
      clipboard?: { writeText?: (value: string) => Promise<void> | void };
    };
  };
  const navigatorClipboard = runtime.navigator?.clipboard;

  try {
    if (navigatorClipboard?.writeText) {
      await navigatorClipboard.writeText(text);
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

function getNativeClipboard(): NativeClipboardLike | null {
  try {
    const clipboardModule = require(
      '@react-native-clipboard/clipboard',
    ) as NativeClipboardModule;
    return clipboardModule.default ?? clipboardModule;
  } catch {
    return null;
  }
}
