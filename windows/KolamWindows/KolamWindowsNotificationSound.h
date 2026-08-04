#pragma once

#include <NativeModules.h>

namespace KolamWindows {

REACT_MODULE(KolamWindowsNotificationSound)
struct KolamWindowsNotificationSound {
  REACT_METHOD(playNotificationSound)
  void playNotificationSound(
      std::string uri,
      ::React::JSValueObject options,
      ::React::ReactPromise<::React::JSValueObject> &&result) noexcept;

  REACT_METHOD(playSound)
  void playSound(
      std::string uri,
      ::React::JSValueObject options,
      ::React::ReactPromise<::React::JSValueObject> &&result) noexcept;
};

} // namespace KolamWindows
