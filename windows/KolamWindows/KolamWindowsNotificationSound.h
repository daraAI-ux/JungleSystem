#pragma once

#include <NativeModules.h>

namespace KolamWindows {

REACT_MODULE(KolamWindowsNotificationSound)
struct KolamWindowsNotificationSound {
  REACT_INIT(Initialize)
  void Initialize(winrt::Microsoft::ReactNative::ReactContext const &reactContext) noexcept;

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

  REACT_METHOD(stopNotificationSound)
  void stopNotificationSound(
      ::React::ReactPromise<::React::JSValueObject> &&result) noexcept;

 private:
  winrt::Microsoft::ReactNative::ReactContext m_context;
};

} // namespace KolamWindows
