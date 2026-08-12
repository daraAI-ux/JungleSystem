#include "pch.h"
#include "KolamWindowsNotificationSound.h"

#include <algorithm>
#include <atomic>
#include <cmath>
#include <cstdint>
#include <cstring>
#include <memory>
#include <mutex>
#include <string>
#include <utility>
#include <vector>

#include <mmsystem.h>

#include <winrt/Windows.Foundation.h>
#include <winrt/Windows.Media.Core.h>
#include <winrt/Windows.Media.Playback.h>

#pragma comment(lib, "winmm.lib")

namespace KolamWindows {
namespace {

std::mutex g_playerMutex;
std::mutex g_wavMutex;
winrt::Windows::Media::Playback::MediaPlayer g_player{nullptr};
std::vector<BYTE> g_wavPlayBuffer;

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

std::vector<BYTE> CreateCleanNotificationBeepWav() {
  constexpr uint32_t sampleRate = 22050;
  constexpr uint16_t bitsPerSample = 16;
  constexpr uint16_t numChannels = 1;
  constexpr double durationSec = 0.18;
  constexpr double freqHz = 880.0;
  constexpr double twoPi = 6.283185307179586;

  const uint32_t numSamples =
      static_cast<uint32_t>(sampleRate * durationSec);
  const uint32_t dataSize = numSamples * numChannels * (bitsPerSample / 8);
  const uint16_t blockAlign =
      static_cast<uint16_t>(numChannels * (bitsPerSample / 8));
  const uint32_t byteRate = sampleRate * blockAlign;

  std::vector<BYTE> bytes(44 + dataSize);
  auto writeU32 = [&](size_t offset, uint32_t value) {
    bytes[offset] = static_cast<BYTE>(value & 0xff);
    bytes[offset + 1] = static_cast<BYTE>((value >> 8) & 0xff);
    bytes[offset + 2] = static_cast<BYTE>((value >> 16) & 0xff);
    bytes[offset + 3] = static_cast<BYTE>((value >> 24) & 0xff);
  };
  auto writeU16 = [&](size_t offset, uint16_t value) {
    bytes[offset] = static_cast<BYTE>(value & 0xff);
    bytes[offset + 1] = static_cast<BYTE>((value >> 8) & 0xff);
  };

  std::memcpy(bytes.data(), "RIFF", 4);
  writeU32(4, 36 + dataSize);
  std::memcpy(bytes.data() + 8, "WAVE", 4);
  std::memcpy(bytes.data() + 12, "fmt ", 4);
  writeU32(16, 16);
  writeU16(20, 1);
  writeU16(22, numChannels);
  writeU32(24, sampleRate);
  writeU32(28, byteRate);
  writeU16(32, blockAlign);
  writeU16(34, bitsPerSample);
  std::memcpy(bytes.data() + 36, "data", 4);
  writeU32(40, dataSize);

  auto *samples = reinterpret_cast<int16_t *>(bytes.data() + 44);
  const uint32_t fadeSamples = std::max<uint32_t>(1, sampleRate / 100);
  for (uint32_t i = 0; i < numSamples; ++i) {
    double envelope = 1.0;
    if (i < fadeSamples) {
      envelope = static_cast<double>(i) / fadeSamples;
    } else if (i + fadeSamples >= numSamples) {
      envelope =
          static_cast<double>(numSamples - 1 - i) / fadeSamples;
    }
    envelope = std::max(0.0, std::min(1.0, envelope));
    const double sample =
        std::sin(twoPi * freqHz * (static_cast<double>(i) / sampleRate)) *
        envelope * 0.35;
    samples[i] = static_cast<int16_t>(sample * 32767.0);
  }

  return bytes;
}

bool PlayWavBytes(std::vector<BYTE> bytes) {
  if (bytes.size() < 44) {
    return false;
  }

  std::scoped_lock lock(g_wavMutex);
  // Keep the previous buffer until replaced — do not SND_PURGE (cuts mid-wave → crackle).
  g_wavPlayBuffer = std::move(bytes);
  return ::PlaySoundW(
             reinterpret_cast<LPCWSTR>(g_wavPlayBuffer.data()),
             nullptr,
             SND_ASYNC | SND_MEMORY | SND_NODEFAULT) != FALSE;
}

void PlayDefaultBeep(
    double /*volume*/,
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
    g_player.AudioCategory(
        winrt::Windows::Media::Playback::MediaPlayerAudioCategory::SoundEffects);
    g_player.Volume(volume);
    attempt->openedRevoker = g_player.MediaOpened(
        winrt::auto_revoke,
        [attempt, path, uri](auto const &, auto const &) noexcept {
          try {
            std::scoped_lock lock(g_playerMutex);
            if (g_player) {
              g_player.Play();
            }
          } catch (...) {
          }
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
  } catch (winrt::hresult_error const &error) {
    HandlePlaybackFailure(attempt, winrt::to_string(error.message()));
  } catch (...) {
    HandlePlaybackFailure(attempt, "Suara notifikasi tidak bisa diputar.");
  }
}

void PlayDefaultBeep(
    double /*volume*/,
    ::React::ReactPromise<::React::JSValueObject> &&result,
    bool allowSystemBeepFallback) noexcept {
  try {
    auto bytes = CreateCleanNotificationBeepWav();
    if (PlayWavBytes(std::move(bytes))) {
      result.Resolve(
          PlayedResult("winmm-clean-beep", "played", "embedded:clean-beep.wav"));
      return;
    }

    if (allowSystemBeepFallback) {
      // Kernel beep — clean tone, last resort if WinMM WAV path fails.
      ::Beep(880, 160);
      result.Resolve(PlayedResult("kernel-beep", "played"));
      return;
    }
    result.Reject("Suara notifikasi default tidak bisa diputar.");
  } catch (...) {
    if (allowSystemBeepFallback) {
      try {
        ::Beep(880, 160);
        result.Resolve(PlayedResult("kernel-beep", "played"));
        return;
      } catch (...) {
      }
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

  // data:audio (including JS default beep URI) → clean synthesized WAV.
  // Avoids crackle from truncated/corrupt base64 payloads.
  if (uri.empty() || StartsWith(uri, "data:audio/")) {
    PlayDefaultBeep(volume, std::move(result), true);
    return;
  }

  PlayMediaUri(std::move(uri), volume, std::move(result), FallbackKind::DefaultBeep);
}

} // namespace

void KolamWindowsNotificationSound::Initialize(
    winrt::Microsoft::ReactNative::ReactContext const &reactContext) noexcept {
  m_context = reactContext;
}

void KolamWindowsNotificationSound::playNotificationSound(
    std::string uri,
    ::React::JSValueObject options,
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  // Local WAV / data:audio can play via WinMM immediately on this thread.
  // Do not wait for the UI dispatcher queue (busy UI = late ding).
  if (uri.empty() || StartsWith(uri, "data:audio/")) {
    PlayNotificationSound(std::move(uri), std::move(options), std::move(result));
    return;
  }

  // Remote/file MediaPlayer still needs the UI thread on WinUI.
  m_context.UIDispatcher().Post([
    uri = std::move(uri),
    options = std::move(options),
    result = std::move(result)
  ]() mutable {
    PlayNotificationSound(std::move(uri), std::move(options), std::move(result));
  });
}

void KolamWindowsNotificationSound::playSound(
    std::string uri,
    ::React::JSValueObject options,
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  playNotificationSound(std::move(uri), std::move(options), std::move(result));
}

} // namespace KolamWindows
