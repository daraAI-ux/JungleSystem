#include "pch.h"
#include "KolamWindowsNotificationSound.h"

#include <algorithm>
#include <atomic>
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

struct PlaybackAttempt {
  explicit PlaybackAttempt(::React::ReactPromise<::React::JSValueObject> &&promise) noexcept
      : result(std::move(promise)) {}

  ::React::ReactPromise<::React::JSValueObject> result;
  std::atomic_bool settled{false};
  winrt::Windows::Media::Playback::MediaPlayer::MediaOpened_revoker openedRevoker;
  winrt::Windows::Media::Playback::MediaPlayer::MediaFailed_revoker failedRevoker;
};

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

::React::JSValueObject PlayedResult(
    std::string path,
    std::string status,
    std::string uri = "") {
  auto result = ::React::JSValueObject{{"path", path}, {"status", status}};
  if (!uri.empty()) {
    result["uri"] = uri;
  }
  return result;
}

void ResolveOnce(
    std::shared_ptr<PlaybackAttempt> const &attempt,
    ::React::JSValueObject value) noexcept {
  if (!attempt->settled.exchange(true)) {
    attempt->openedRevoker.revoke();
    attempt->failedRevoker.revoke();
    attempt->result.Resolve(std::move(value));
  }
}

void RejectOnce(
    std::shared_ptr<PlaybackAttempt> const &attempt,
    char const *message) noexcept {
  if (!attempt->settled.exchange(true)) {
    attempt->openedRevoker.revoke();
    attempt->failedRevoker.revoke();
    attempt->result.Reject(message);
  }
}

void PlaySystemBeep(::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  try {
    MessageBeep(MB_ICONASTERISK);
    result.Resolve(PlayedResult("system-beep", "played"));
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
    auto attempt = std::make_shared<PlaybackAttempt>(std::move(result));

    std::scoped_lock lock(g_playerMutex);
    g_player = winrt::Windows::Media::Playback::MediaPlayer();
    g_player.AutoPlay(false);
    g_player.Volume(volume);
    attempt->openedRevoker = g_player.MediaOpened(
        winrt::auto_revoke,
        [attempt, uri](auto const &, auto const &) noexcept {
          ResolveOnce(attempt, PlayedResult("media-player", "opened", uri));
        });
    attempt->failedRevoker = g_player.MediaFailed(
        winrt::auto_revoke,
        [attempt](auto const &, winrt::Windows::Media::Playback::MediaPlayerFailedEventArgs const &args) noexcept {
          auto message = winrt::to_string(args.ErrorMessage());
          if (message.empty()) {
            message = "Suara notifikasi gagal dibuka oleh Windows MediaPlayer.";
          }
          RejectOnce(attempt, message.c_str());
        });
    g_player.Source(source);
    g_player.Play();
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
