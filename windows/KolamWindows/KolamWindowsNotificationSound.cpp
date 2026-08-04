#include "pch.h"
#include "KolamWindowsNotificationSound.h"

#include <algorithm>
#include <cmath>
#include <memory>
#include <mutex>
#include <string>

#include <winrt/Windows.Foundation.h>
#include <winrt/Windows.Media.Core.h>
#include <winrt/Windows.Media.Playback.h>

namespace KolamWindows {
namespace {

std::mutex g_playerMutex;
winrt::Windows::Media::Playback::MediaPlayer g_player{nullptr};

bool StartsWith(std::string const &value, char const *prefix) {
  return value.rfind(prefix, 0) == 0;
}

double ClampVolume(double value) {
  if (!std::isfinite(value)) {
    return 0.5;
  }

  return std::min(1.0, std::max(0.0, value));
}

double ReadVolume(::React::JSValueObject const &options) {
  auto it = options.find("volume");
  if (it == options.end()) {
    return 0.5;
  }

  if (it->second.Type() == ::React::JSValueType::Double ||
      it->second.Type() == ::React::JSValueType::Int64) {
    return ClampVolume(it->second.AsDouble());
  }

  return 0.5;
}

::React::JSValueObject PlayedResult(std::string path) {
  return ::React::JSValueObject{{"path", path}};
}

void PlaySystemBeep(::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  try {
    MessageBeep(MB_ICONASTERISK);
    result.Resolve(PlayedResult("system-beep"));
  } catch (...) {
    result.Reject("Suara notifikasi tidak bisa diputar.");
  }
}

void PlayMediaUri(
    std::string uri,
    double volume,
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  try {
    auto mediaUri = winrt::Windows::Foundation::Uri(winrt::to_hstring(uri));
    auto source = winrt::Windows::Media::Core::MediaSource::CreateFromUri(mediaUri);

    std::scoped_lock lock(g_playerMutex);
    g_player = winrt::Windows::Media::Playback::MediaPlayer();
    g_player.AutoPlay(false);
    g_player.Volume(volume);
    g_player.Source(source);
    g_player.Play();

    result.Resolve(PlayedResult("media-player"));
  } catch (winrt::hresult_error const &error) {
    result.Reject(winrt::to_string(error.message()).c_str());
  } catch (...) {
    result.Reject("Suara notifikasi tidak bisa diputar.");
  }
}

void PlayNotificationSound(
    std::string uri,
    ::React::JSValueObject options,
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  if (uri.empty()) {
    PlaySystemBeep(std::move(result));
    return;
  }

  if (StartsWith(uri, "data:audio/")) {
    PlaySystemBeep(std::move(result));
    return;
  }

  PlayMediaUri(std::move(uri), ReadVolume(options), std::move(result));
}

} // namespace

void KolamWindowsNotificationSound::playNotificationSound(
    std::string uri,
    ::React::JSValueObject options,
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  PlayNotificationSound(std::move(uri), std::move(options), std::move(result));
}

void KolamWindowsNotificationSound::playSound(
    std::string uri,
    ::React::JSValueObject options,
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  PlayNotificationSound(std::move(uri), std::move(options), std::move(result));
}

} // namespace KolamWindows
