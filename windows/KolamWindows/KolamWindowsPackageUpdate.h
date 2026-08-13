#pragma once

#include <NativeModules.h>
#include <atomic>
#include <mutex>
#include <string>

namespace KolamWindows {

REACT_MODULE(KolamWindowsPackageUpdate)
struct KolamWindowsPackageUpdate {
  REACT_INIT(Initialize)
  void Initialize(winrt::Microsoft::ReactNative::ReactContext const &reactContext) noexcept;

  REACT_SYNC_METHOD(getPackageInfo)
  ::React::JSValueObject getPackageInfo() noexcept;

  REACT_METHOD(downloadMsix)
  void downloadMsix(
      ::React::JSValueObject options,
      ::React::ReactPromise<::React::JSValueObject> &&result) noexcept;

  REACT_METHOD(installMsix)
  void installMsix(
      ::React::JSValueObject options,
      ::React::ReactPromise<::React::JSValueObject> &&result) noexcept;

  REACT_METHOD(restartApp)
  void restartApp(::React::ReactPromise<::React::JSValueObject> &&result) noexcept;

  REACT_METHOD(addListener)
  void addListener(std::string eventName) noexcept;

  REACT_METHOD(removeListeners)
  void removeListeners(int count) noexcept;

  REACT_EVENT(DownloadProgress)
  std::function<void(::React::JSValueObject const &)> DownloadProgress;

  REACT_EVENT(InstallProgress)
  std::function<void(::React::JSValueObject const &)> InstallProgress;

  winrt::fire_and_forget DownloadMsixAsync(
      ::React::JSValueObject options,
      ::React::ReactPromise<::React::JSValueObject> result);
  winrt::fire_and_forget InstallMsixAsync(
      ::React::JSValueObject options,
      ::React::ReactPromise<::React::JSValueObject> result);
  winrt::fire_and_forget RestartAppAsync(
      ::React::ReactPromise<::React::JSValueObject> result);

  winrt::Microsoft::ReactNative::ReactContext m_context;
  std::mutex m_mutex;
  std::wstring m_lastDownloadPath;
  std::atomic_bool m_busy{false};
};

} // namespace KolamWindows
