#include "pch.h"
#include "KolamWindowsNotificationSound.h"

#include <algorithm>
#include <atomic>
#include <cmath>
#include <memory>
#include <mutex>
#include <string>
#include <utility>

#include <winrt/Windows.Foundation.h>
#include <winrt/Windows.Media.Core.h>
#include <winrt/Windows.Media.Playback.h>
#include <winrt/Windows.Security.Cryptography.h>
#include <winrt/Windows.Storage.Streams.h>

namespace KolamWindows {
namespace {

std::mutex g_playerMutex;
winrt::Windows::Media::Playback::MediaPlayer g_player{nullptr};

// Same short WAV payload as JS KOLAM_DEFAULT_NOTIFICATION_BEEP_URI (base64 body only).
constexpr wchar_t kDefaultBeepWavBase64[] =
    L"UklGRqQMAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YYAMAAAAAOEdCy4UKUERhPFs2H/R6d8P/"
    L"Y0bZy1qKvUTWPQU2jjR1N0g+h4ZlSyVK5UWN/fi2yDR4ts395UWlSuVLB4ZIPrU3TjRFNpY9PUTaipnLY0bD/"
    L"3p33/RbNiE8UERFCkLLuEdAAAf4vXR7Na/7nwOlCeBLhcg8QJz5JnSltUL7KgL7CXILiwi4AXi5mvTa9Rr6ckI"
    L"HiTgLh4kyQhr6WvUa9Pi5uAFLCLILuwlqAsL7JbVmdJz5PECFyCBLpQnfA6/7uzW9dEf4g==";

enum class FallbackKind {
  None,
  DefaultBeep,
  SystemBeep,
};

struct PlaybackAttempt {
  PlaybackAttempt(
      ::React::ReactPromise<::React::JSValueObject> &&promise,
      double volumeValue,
      FallbackKind fallback) noexcept
      : result(std::move(promise)), volume(volumeValue), fallbackKind(fallback) {}

  ::React::ReactPromise<::React::JSValueObject> result;
  double volume{0.5};
  FallbackKind fallbackKind{FallbackKind::None};
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

void PlayDefaultBeep(
    double volume,
    ::React::ReactPromise<::React::JSValueObject> &&result,
    bool allowSystemBeepFallback) noexcept;

void HandlePlaybackFailure(
    std::shared_ptr<PlaybackAttempt> const &attempt,
    std::string const &message) noexcept {
  if (attempt->settled.load()) {
    return;
  }

  attempt->openedRevoker.revoke();
  attempt->failedRevoker.revoke();

  auto volume = attempt->volume;
  auto fallback = attempt->fallbackKind;

  if (fallback == FallbackKind::DefaultBeep) {
    if (attempt->settled.exchange(true)) {
      return;
    }
    PlayDefaultBeep(volume, std::move(attempt->result), true);
    return;
  }

  if (fallback == FallbackKind::SystemBeep) {
    if (attempt->settled.exchange(true)) {
      return;
    }
    PlaySystemBeep(std::move(attempt->result));
    return;
  }

  RejectOnce(attempt, message.c_str());
}

void PlayMediaSource(
    winrt::Windows::Media::Core::MediaSource const &source,
    double volume,
    std::string path,
    std::string uri,
    ::React::ReactPromise<::React::JSValueObject> &&result,
    FallbackKind fallbackKind) noexcept {
  auto attempt = std::make_shared<PlaybackAttempt>(
      std::move(result), volume, fallbackKind);

  try {
    std::scoped_lock lock(g_playerMutex);
    g_player = winrt::Windows::Media::Playback::MediaPlayer();
    g_player.AutoPlay(false);
    g_player.Volume(volume);
    attempt->openedRevoker = g_player.MediaOpened(
        winrt::auto_revoke,
        [attempt, path, uri](auto const &, auto const &) noexcept {
          ResolveOnce(attempt, PlayedResult(path, "opened", uri));
        });
    attempt->failedRevoker = g_player.MediaFailed(
        winrt::auto_revoke,
        [attempt](
            auto const &,
            winrt::Windows::Media::Playback::MediaPlayerFailedEventArgs const &args) noexcept {
          auto message = winrt::to_string(args.ErrorMessage());
          if (message.empty()) {
            message = "Suara notifikasi gagal dibuka oleh Windows MediaPlayer.";
          }
          HandlePlaybackFailure(attempt, message);
        });
    g_player.Source(source);
    g_player.Play();
  } catch (winrt::hresult_error const &error) {
    HandlePlaybackFailure(attempt, winrt::to_string(error.message()));
  } catch (...) {
    HandlePlaybackFailure(attempt, "Suara notifikasi tidak bisa diputar.");
  }
}

winrt::Windows::Storage::Streams::InMemoryRandomAccessStream CreateStreamFromBase64(
    winrt::hstring const &base64) {
  auto buffer =
      winrt::Windows::Security::Cryptography::CryptographicBuffer::DecodeFromBase64String(
          base64);
  auto stream = winrt::Windows::Storage::Streams::InMemoryRandomAccessStream();
  auto writer = winrt::Windows::Storage::Streams::DataWriter(stream);
  writer.WriteBuffer(buffer);
  writer.StoreAsync().get();
  writer.DetachStream();
  stream.Seek(0);
  return stream;
}

bool TryParseDataAudioUri(
    std::string const &uri,
    std::wstring &contentType,
    winrt::hstring &base64Payload) {
  if (!StartsWith(uri, "data:audio/")) {
    return false;
  }

  auto comma = uri.find(',');
  if (comma == std::string::npos || comma + 1 >= uri.size()) {
    return false;
  }

  auto header = uri.substr(5, comma - 5); // after "data:"
  if (header.find(";base64") == std::string::npos) {
    return false;
  }

  auto mimeEnd = header.find(';');
  auto mime = mimeEnd == std::string::npos ? header : header.substr(0, mimeEnd);
  if (mime.empty()) {
    mime = "audio/wav";
  }

  contentType.assign(mime.begin(), mime.end());
  auto payload = uri.substr(comma + 1);
  base64Payload = winrt::to_hstring(payload);
  return true;
}

void PlayDataAudioUri(
    std::string uri,
    double volume,
    ::React::ReactPromise<::React::JSValueObject> &&result,
    FallbackKind fallbackKind) noexcept {
  try {
    std::wstring contentType;
    winrt::hstring base64Payload;
    if (!TryParseDataAudioUri(uri, contentType, base64Payload)) {
      if (fallbackKind == FallbackKind::DefaultBeep) {
        PlayDefaultBeep(volume, std::move(result), true);
      } else if (fallbackKind == FallbackKind::SystemBeep) {
        PlaySystemBeep(std::move(result));
      } else {
        result.Reject("URI data:audio tidak valid.");
      }
      return;
    }

    auto stream = CreateStreamFromBase64(base64Payload);
    auto source = winrt::Windows::Media::Core::MediaSource::CreateFromStream(
        stream, winrt::hstring(contentType));
    PlayMediaSource(
        source,
        volume,
        "media-player-data",
        std::move(uri),
        std::move(result),
        fallbackKind);
  } catch (winrt::hresult_error const &error) {
    if (fallbackKind == FallbackKind::DefaultBeep) {
      PlayDefaultBeep(volume, std::move(result), true);
      return;
    }
    if (fallbackKind == FallbackKind::SystemBeep) {
      PlaySystemBeep(std::move(result));
      return;
    }
    result.Reject(winrt::to_string(error.message()).c_str());
  } catch (...) {
    if (fallbackKind == FallbackKind::DefaultBeep) {
      PlayDefaultBeep(volume, std::move(result), true);
      return;
    }
    if (fallbackKind == FallbackKind::SystemBeep) {
      PlaySystemBeep(std::move(result));
      return;
    }
    result.Reject("Suara notifikasi data:audio tidak bisa diputar.");
  }
}

void PlayDefaultBeep(
    double volume,
    ::React::ReactPromise<::React::JSValueObject> &&result,
    bool allowSystemBeepFallback) noexcept {
  try {
    auto stream = CreateStreamFromBase64(winrt::hstring(kDefaultBeepWavBase64));
    auto source = winrt::Windows::Media::Core::MediaSource::CreateFromStream(
        stream, L"audio/wav");
    PlayMediaSource(
        source,
        volume,
        "default-beep",
        "embedded:default-beep.wav",
        std::move(result),
        allowSystemBeepFallback ? FallbackKind::SystemBeep : FallbackKind::None);
  } catch (...) {
    if (allowSystemBeepFallback) {
      PlaySystemBeep(std::move(result));
      return;
    }
    result.Reject("Suara notifikasi default tidak bisa diputar.");
  }
}

void PlayMediaUri(
    std::string uri,
    double volume,
    ::React::ReactPromise<::React::JSValueObject> &&result,
    FallbackKind fallbackKind) noexcept {
  try {
    auto mediaUri = winrt::Windows::Foundation::Uri(winrt::to_hstring(uri));
    auto source = winrt::Windows::Media::Core::MediaSource::CreateFromUri(mediaUri);
    PlayMediaSource(
        source,
        volume,
        "media-player",
        std::move(uri),
        std::move(result),
        fallbackKind);
  } catch (winrt::hresult_error const &error) {
    if (fallbackKind == FallbackKind::DefaultBeep) {
      PlayDefaultBeep(volume, std::move(result), true);
      return;
    }
    if (fallbackKind == FallbackKind::SystemBeep) {
      PlaySystemBeep(std::move(result));
      return;
    }
    result.Reject(winrt::to_string(error.message()).c_str());
  } catch (...) {
    if (fallbackKind == FallbackKind::DefaultBeep) {
      PlayDefaultBeep(volume, std::move(result), true);
      return;
    }
    if (fallbackKind == FallbackKind::SystemBeep) {
      PlaySystemBeep(std::move(result));
      return;
    }
    result.Reject("Suara notifikasi tidak bisa diputar.");
  }
}

void PlayNotificationSound(
    std::string uri,
    ::React::JSValueObject options,
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  auto volume = ReadVolume(options);

  if (uri.empty()) {
    PlayDefaultBeep(volume, std::move(result), true);
    return;
  }

  if (StartsWith(uri, "data:audio/")) {
    PlayDataAudioUri(std::move(uri), volume, std::move(result), FallbackKind::DefaultBeep);
    return;
  }

  PlayMediaUri(std::move(uri), volume, std::move(result), FallbackKind::DefaultBeep);
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
