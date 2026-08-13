#pragma once

#include <NativeModules.h>

namespace KolamWindows {

REACT_MODULE(KolamWindowsDeviceIdentity)
struct KolamWindowsDeviceIdentity {
  REACT_SYNC_METHOD(getDeviceIdentity)
  ::React::JSValueObject getDeviceIdentity() noexcept;

  // Sync keyboard probe for chat composer (RNW TextInput omits shiftKey on Enter).
  REACT_SYNC_METHOD(isShiftKeyDown)
  bool isShiftKeyDown() noexcept;
};

} // namespace KolamWindows
