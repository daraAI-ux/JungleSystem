#pragma once

#include <NativeModules.h>

namespace KolamWindows {

void RegisterKolamAppNotifications() noexcept;
bool ConsumeKolamToastActivationAndYield() noexcept;

REACT_MODULE(KolamWindowsToastNotification)
struct KolamWindowsToastNotification {
  REACT_INIT(Initialize)
  void Initialize(winrt::Microsoft::ReactNative::ReactContext const &reactContext) noexcept;

  REACT_METHOD(showToast)
  void showToast(
      ::React::JSValueObject options,
      ::React::ReactPromise<::React::JSValueObject> &&result) noexcept;

  REACT_METHOD(takePendingActivation)
  void takePendingActivation(
      ::React::ReactPromise<::React::JSValueObject> &&result) noexcept;

  REACT_METHOD(addListener)
  void addListener(std::string eventName) noexcept;

  REACT_METHOD(removeListeners)
  void removeListeners(int count) noexcept;

  REACT_EVENT(ToastActivated)
  std::function<void(::React::JSValueObject const &)> ToastActivated;

 private:
  winrt::Microsoft::ReactNative::ReactContext m_context;
};

} // namespace KolamWindows
