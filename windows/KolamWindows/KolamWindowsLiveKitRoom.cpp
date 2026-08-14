#include "pch.h"
#include "KolamWindowsLiveKitRoom.h"

#include <memory>
#include <mutex>
#include <string>
#include <thread>

#if defined(_M_X64) && defined(KOLAM_HAS_LIVEKIT)
#include "livekit/livekit.h"
#endif

namespace KolamWindows {
namespace {

std::mutex g_sessionMutex;

::React::JSValueObject OkResult(std::string status = "ok") {
  return ::React::JSValueObject{{"ok", true}, {"status", std::move(status)}};
}

::React::JSValueObject FailResult(std::string reason) {
  return ::React::JSValueObject{{"ok", false}, {"reason", std::move(reason)}};
}

#if defined(_M_X64) && defined(KOLAM_HAS_LIVEKIT)

struct LiveKitSession {
  std::unique_ptr<livekit::PlatformAudio> platformAudio;
  std::unique_ptr<livekit::Room> room;
  std::shared_ptr<livekit::PlatformAudioSource> micSource;
  std::shared_ptr<livekit::LocalAudioTrack> micTrack;
  bool micEnabled{true};
};

std::unique_ptr<LiveKitSession> g_session;
bool g_livekitInitialized{false};

void EnsureLiveKitInitialized() {
  if (g_livekitInitialized) {
    return;
  }
  if (!livekit::initialize(livekit::LogLevel::Warn)) {
    throw std::runtime_error("LiveKit initialize failed");
  }
  g_livekitInitialized = true;
}

void TearDownSessionLocked() {
  if (!g_session) {
    return;
  }

  if (g_session->micTrack) {
    try {
      g_session->micTrack->mute();
    } catch (...) {
    }
  }

  if (g_session->room) {
    try {
      g_session->room->disconnect();
    } catch (...) {
    }
  }

  g_session.reset();
}

std::string ReadStringParam(::React::JSValueObject const &params, char const *key) {
  auto it = params.find(key);
  if (it == params.end() || it->second.Type() != ::React::JSValueType::String) {
    return {};
  }
  return it->second.AsString();
}

#endif

} // namespace

void KolamWindowsLiveKitRoom::Initialize(
    winrt::Microsoft::ReactNative::ReactContext const &reactContext) noexcept {
  m_context = reactContext;
}

void KolamWindowsLiveKitRoom::connectRoom(
    ::React::JSValueObject params,
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
#if !(defined(_M_X64) && defined(KOLAM_HAS_LIVEKIT))
  result.Resolve(FailResult("livekit_unavailable"));
  return;
#else
  auto url = ReadStringParam(params, "url");
  auto token = ReadStringParam(params, "token");
  auto roomName = ReadStringParam(params, "roomName");
  auto identity = ReadStringParam(params, "identity");

  if (url.empty() || token.empty()) {
    result.Resolve(FailResult("missing_url_or_token"));
    return;
  }

  std::thread([url = std::move(url),
               token = std::move(token),
               roomName = std::move(roomName),
               identity = std::move(identity),
               result = std::move(result)]() mutable {
    try {
      std::lock_guard<std::mutex> lock(g_sessionMutex);
      EnsureLiveKitInitialized();
      TearDownSessionLocked();

      auto session = std::make_unique<LiveKitSession>();
      session->platformAudio = std::make_unique<livekit::PlatformAudio>();

      livekit::RoomOptions options;
      options.auto_subscribe = true;

      session->room = std::make_unique<livekit::Room>();
      if (!session->room->connect(url, token, options)) {
        result.Resolve(FailResult("connect_failed"));
        return;
      }

      livekit::PlatformAudioOptions audioOptions;
      audioOptions.echo_cancellation = true;
      audioOptions.noise_suppression = true;
      audioOptions.auto_gain_control = true;

      session->micSource = session->platformAudio->createAudioSource(audioOptions);
      session->micTrack = livekit::LocalAudioTrack::createLocalAudioTrack(
          "microphone", session->micSource);

      auto local = session->room->localParticipant().lock();
      if (!local) {
        session->room->disconnect();
        result.Resolve(FailResult("no_local_participant"));
        return;
      }

      livekit::TrackPublishOptions publishOptions;
      publishOptions.source = livekit::TrackSource::SOURCE_MICROPHONE;
      local->publishTrack(session->micTrack, publishOptions);

      g_session = std::move(session);

      auto response = OkResult("connected");
      if (!roomName.empty()) {
        response["roomName"] = roomName;
      }
      if (!identity.empty()) {
        response["identity"] = identity;
      }
      result.Resolve(std::move(response));
    } catch (std::exception const &ex) {
      std::lock_guard<std::mutex> lock(g_sessionMutex);
      TearDownSessionLocked();
      result.Resolve(FailResult(ex.what()));
    } catch (...) {
      std::lock_guard<std::mutex> lock(g_sessionMutex);
      TearDownSessionLocked();
      result.Resolve(FailResult("connect_exception"));
    }
  }).detach();
#endif
}

void KolamWindowsLiveKitRoom::disconnectRoom(
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
#if !(defined(_M_X64) && defined(KOLAM_HAS_LIVEKIT))
  result.Resolve(FailResult("livekit_unavailable"));
  return;
#else
  std::thread([result = std::move(result)]() mutable {
    try {
      std::lock_guard<std::mutex> lock(g_sessionMutex);
      TearDownSessionLocked();
      result.Resolve(OkResult("disconnected"));
    } catch (...) {
      result.Resolve(FailResult("disconnect_exception"));
    }
  }).detach();
#endif
}

void KolamWindowsLiveKitRoom::setMicEnabled(
    bool enabled,
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
#if !(defined(_M_X64) && defined(KOLAM_HAS_LIVEKIT))
  result.Resolve(FailResult("livekit_unavailable"));
  return;
#else
  std::thread([enabled, result = std::move(result)]() mutable {
    try {
      std::lock_guard<std::mutex> lock(g_sessionMutex);
      if (!g_session || !g_session->micTrack) {
        result.Resolve(FailResult("not_connected"));
        return;
      }

      if (enabled) {
        g_session->micTrack->unmute();
      } else {
        g_session->micTrack->mute();
      }
      g_session->micEnabled = enabled;
      result.Resolve(OkResult(enabled ? "mic_on" : "mic_off"));
    } catch (std::exception const &ex) {
      result.Resolve(FailResult(ex.what()));
    } catch (...) {
      result.Resolve(FailResult("mic_exception"));
    }
  }).detach();
#endif
}

} // namespace KolamWindows
