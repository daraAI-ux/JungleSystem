#pragma once

#include <NativeModules.h>

namespace KolamWindows {

void InstallKolamComposerKeyboardHook() noexcept;

REACT_MODULE(KolamWindowsDeviceIdentity)
struct KolamWindowsDeviceIdentity {
  REACT_SYNC_METHOD(getDeviceIdentity)
  ::React::JSValueObject getDeviceIdentity() noexcept;

  // True when Shift is down, or a Shift+Enter chord was latched at key-down
  // (JS onKeyPress often runs after Shift is released).
  REACT_SYNC_METHOD(isShiftKeyDown)
  bool isShiftKeyDown() noexcept;

  REACT_SYNC_METHOD(consumeShiftEnterChord)
  bool consumeShiftEnterChord() noexcept;
};

} // namespace KolamWindows
