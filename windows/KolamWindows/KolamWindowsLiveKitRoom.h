#pragma once

#include <NativeModules.h>
#include <atomic>
#include <functional>
#include <mutex>
#include <string>

namespace KolamWindows {

REACT_MODULE(KolamWindowsLiveKitRoom)
struct KolamWindowsLiveKitRoom {
  REACT_INIT(Initialize)
  void Initialize(winrt::Microsoft::ReactNative::ReactContext const &reactContext) noexcept;

  REACT_METHOD(connectRoom)
  void connectRoom(
      ::React::JSValueObject params,
      ::React::ReactPromise<::React::JSValueObject> &&result) noexcept;

  REACT_METHOD(disconnectRoom)
  void disconnectRoom(::React::ReactPromise<::React::JSValueObject> &&result) noexcept;

  REACT_METHOD(setMicEnabled)
  void setMicEnabled(
      bool enabled,
      ::React::ReactPromise<::React::JSValueObject> &&result) noexcept;

  // NativeEventEmitter wiring (RNW).
  REACT_METHOD(addListener)
  void addListener(std::string eventName) noexcept;

  REACT_METHOD(removeListeners)
  void removeListeners(int count) noexcept;

  REACT_EVENT(ConnectionChanged)
  std::function<void(::React::JSValueObject const &)> ConnectionChanged;

  REACT_EVENT(MediaError)
  std::function<void(::React::JSValueObject const &)> MediaError;

 private:
  winrt::Microsoft::ReactNative::ReactContext m_context;
};

} // namespace KolamWindows
