#pragma once

#include <NativeModules.h>

namespace KolamWindows {

REACT_MODULE(KolamWindowsFilePicker)
struct KolamWindowsFilePicker {
  REACT_INIT(Initialize)
  void Initialize(winrt::Microsoft::ReactNative::ReactContext const &reactContext) noexcept;

  REACT_METHOD(pickImage)
  void pickImage(::React::ReactPromise<::React::JSValueObject> &&result) noexcept;

  REACT_METHOD(pickVideo)
  void pickVideo(::React::ReactPromise<::React::JSValueObject> &&result) noexcept;

  REACT_METHOD(pickAudio)
  void pickAudio(::React::ReactPromise<::React::JSValueObject> &&result) noexcept;

 private:
  winrt::Microsoft::ReactNative::ReactContext m_context;
};

} // namespace KolamWindows

