export async function copyTextToClipboard(value: string) {
  const text = value.trim();
  if (!text) {
    return false;
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
