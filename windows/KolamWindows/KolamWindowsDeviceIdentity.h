#pragma once

#include <NativeModules.h>

namespace KolamWindows {

REACT_MODULE(KolamWindowsDeviceIdentity)
struct KolamWindowsDeviceIdentity {
  REACT_SYNC_METHOD(getDeviceIdentity)
  ::React::JSValueObject getDeviceIdentity() noexcept;
};

} // namespace KolamWindows
