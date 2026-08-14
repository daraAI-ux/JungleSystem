#include "pch.h"
#include "KolamWindowsLiveKitRoom.h"

#include <memory>
#include <mutex>
#include <string>
#include <thread>

#include <objbase.h>

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

void TearDownSessionUnlocked() {
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

// POD result for SEH trampoline (no C++ destructors in __try frame).
struct ConnectRawResult {
  int code; // 0 ok, >0 soft fail, -1 native fault
  char reason[160];
  LiveKitSession *session; // heap; ownership transferred to caller on success
};

void SetConnectReason(ConnectRawResult *out, char const *reason) {
  if (!out) {
    return;
  }
  strncpy_s(out->reason, reason ? reason : "unknown", _TRUNCATE);
}

// C++ body — catches C++ exceptions. Must NOT contain __try.
int ConnectLiveKitRoomBody(char const *url, char const *token, ConnectRawResult *out) {
  out->code = 1;
  out->session = nullptr;
  SetConnectReason(out, "connect_failed");

  try {
    EnsureLiveKitInitialized();

    auto session = std::make_unique<LiveKitSession>();

    livekit::RoomOptions options;
    options.auto_subscribe = true;
    session->room = std::make_unique<livekit::Room>();
    if (!session->room->connect(url, token, options)) {
      out->code = 1;
      SetConnectReason(out, "connect_failed");
      return 1;
    }

    // Mic path after room connect (WASAPI/ADM needs COM on this thread).
    session->platformAudio = std::make_unique<livekit::PlatformAudio>();

    livekit::PlatformAudioOptions audioOptions;
    audioOptions.echo_cancellation = true;
    audioOptions.noise_suppression = true;
    audioOptions.auto_gain_control = true;

    session->micSource = session->platformAudio->createAudioSource(audioOptions);
    session->micTrack = livekit::LocalAudioTrack::createLocalAudioTrack(
        "microphone", session->micSource);

    auto local = session->room->localParticipant().lock();
    if (!local) {
      try {
        session->room->disconnect();
      } catch (...) {
      }
      out->code = 2;
      SetConnectReason(out, "no_local_participant");
      return 2;
    }

    livekit::TrackPublishOptions publishOptions;
    publishOptions.source = livekit::TrackSource::SOURCE_MICROPHONE;
    local->publishTrack(session->micTrack, publishOptions);

    out->session = session.release();
    out->code = 0;
    SetConnectReason(out, "ok");
    return 0;
  } catch (std::exception const &ex) {
    out->code = 3;
    SetConnectReason(out, ex.what());
    return 3;
  } catch (...) {
    out->code = 4;
    SetConnectReason(out, "connect_exception");
    return 4;
  }
}

// SEH trampoline — only POD locals. Converts access violations into soft fail.
int ConnectLiveKitRoomSeh(char const *url, char const *token, ConnectRawResult *out) {
  __try {
    return ConnectLiveKitRoomBody(url, token, out);
  } __except (EXCEPTION_EXECUTE_HANDLER) {
    out->code = -1;
    out->session = nullptr;
    SetConnectReason(out, "livekit_native_fault");
    return -1;
  }
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
    HRESULT const comHr = CoInitializeEx(nullptr, COINIT_MULTITHREADED);
    bool const comOwned = comHr == S_OK || comHr == S_FALSE;

    try {
      {
        std::lock_guard<std::mutex> lock(g_sessionMutex);
        TearDownSessionUnlocked();
      }

      ConnectRawResult raw{};
      raw.code = 1;
      raw.session = nullptr;
      SetConnectReason(&raw, "connect_failed");

      // Do not hold session mutex across LiveKit connect / publish.
      ConnectLiveKitRoomSeh(url.c_str(), token.c_str(), &raw);

      if (raw.code == 0 && raw.session != nullptr) {
        std::unique_ptr<LiveKitSession> owned(raw.session);
        raw.session = nullptr;
        std::lock_guard<std::mutex> lock(g_sessionMutex);
        TearDownSessionUnlocked();
        g_session = std::move(owned);
        auto response = OkResult("connected");
        if (!roomName.empty()) {
          response["roomName"] = roomName;
        }
        if (!identity.empty()) {
          response["identity"] = identity;
        }
        result.Resolve(std::move(response));
      } else {
        if (raw.session != nullptr) {
          delete raw.session;
          raw.session = nullptr;
        }
        result.Resolve(FailResult(
            raw.reason[0] != '\0' ? raw.reason : "connect_failed"));
      }
    } catch (std::exception const &ex) {
      std::lock_guard<std::mutex> lock(g_sessionMutex);
      TearDownSessionUnlocked();
      result.Resolve(FailResult(ex.what()));
    } catch (...) {
      std::lock_guard<std::mutex> lock(g_sessionMutex);
      TearDownSessionUnlocked();
      result.Resolve(FailResult("connect_exception"));
    }

    if (comOwned) {
      CoUninitialize();
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
    HRESULT const comHr = CoInitializeEx(nullptr, COINIT_MULTITHREADED);
    bool const comOwned = comHr == S_OK || comHr == S_FALSE;
    try {
      std::lock_guard<std::mutex> lock(g_sessionMutex);
      TearDownSessionUnlocked();
      result.Resolve(OkResult("disconnected"));
    } catch (...) {
      result.Resolve(FailResult("disconnect_exception"));
    }
    if (comOwned) {
      CoUninitialize();
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
    HRESULT const comHr = CoInitializeEx(nullptr, COINIT_MULTITHREADED);
    bool const comOwned = comHr == S_OK || comHr == S_FALSE;
    try {
      std::lock_guard<std::mutex> lock(g_sessionMutex);
      if (!g_session || !g_session->micTrack) {
        result.Resolve(FailResult("not_connected"));
        if (comOwned) {
          CoUninitialize();
        }
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
    if (comOwned) {
      CoUninitialize();
    }
  }).detach();
#endif
}

} // namespace KolamWindows
