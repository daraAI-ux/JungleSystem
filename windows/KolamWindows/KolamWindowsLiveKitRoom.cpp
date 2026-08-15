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

void EmitOnJs(
    winrt::Microsoft::ReactNative::ReactContext const &context,
    std::function<void(::React::JSValueObject const &)> handler,
    ::React::JSValueObject payload) {
  if (!handler) {
    return;
  }

  context.JSDispatcher().Post(
      [handler = std::move(handler), payload = std::move(payload)]() {
        if (handler) {
          handler(payload);
        }
      });
}

#if defined(_M_X64) && defined(KOLAM_HAS_LIVEKIT)

struct LiveKitEmitters {
  winrt::Microsoft::ReactNative::ReactContext context{nullptr};
  std::function<void(::React::JSValueObject const &)> onConnectionChanged;
  std::function<void(::React::JSValueObject const &)> onMediaError;
};

char const *ConnectionStateLabel(livekit::ConnectionState state) {
  switch (state) {
    case livekit::ConnectionState::Connected:
      return "connected";
    case livekit::ConnectionState::Reconnecting:
      return "reconnecting";
    case livekit::ConnectionState::Disconnected:
    default:
      return "disconnected";
  }
}

char const *DisconnectReasonLabel(livekit::DisconnectReason reason) {
  switch (reason) {
    case livekit::DisconnectReason::ClientInitiated:
      return "client_initiated";
    case livekit::DisconnectReason::DuplicateIdentity:
      return "duplicate_identity";
    case livekit::DisconnectReason::ServerShutdown:
      return "server_shutdown";
    case livekit::DisconnectReason::ParticipantRemoved:
      return "participant_removed";
    case livekit::DisconnectReason::RoomDeleted:
      return "room_deleted";
    case livekit::DisconnectReason::JoinFailure:
      return "join_failure";
    case livekit::DisconnectReason::SignalClose:
      return "signal_close";
    default:
      return "disconnected";
  }
}

class KolamLiveKitRoomDelegate final : public livekit::RoomDelegate {
 public:
  explicit KolamLiveKitRoomDelegate(LiveKitEmitters emitters)
      : m_emitters(std::move(emitters)) {}

  void onConnectionStateChanged(
      livekit::Room &,
      livekit::ConnectionStateChangedEvent const &event) override {
    EmitOnJs(
        m_emitters.context,
        m_emitters.onConnectionChanged,
        ::React::JSValueObject{
            {"status", ConnectionStateLabel(event.state)},
        });
  }

  void onDisconnected(
      livekit::Room &,
      livekit::DisconnectedEvent const &event) override {
    if (m_intentionalDisconnect.load()) {
      EmitOnJs(
          m_emitters.context,
          m_emitters.onConnectionChanged,
          ::React::JSValueObject{{"status", "disconnected"}, {"intentional", true}});
      return;
    }

    EmitOnJs(
        m_emitters.context,
        m_emitters.onConnectionChanged,
        ::React::JSValueObject{
            {"status", "disconnected"},
            {"reason", DisconnectReasonLabel(event.reason)},
        });
  }

  void onReconnecting(livekit::Room &, livekit::ReconnectingEvent const &) override {
    EmitOnJs(
        m_emitters.context,
        m_emitters.onConnectionChanged,
        ::React::JSValueObject{{"status", "reconnecting"}});
  }

  void onReconnected(livekit::Room &, livekit::ReconnectedEvent const &) override {
    EmitOnJs(
        m_emitters.context,
        m_emitters.onConnectionChanged,
        ::React::JSValueObject{{"status", "connected"}});
  }

  void onTrackSubscriptionFailed(
      livekit::Room &,
      livekit::TrackSubscriptionFailedEvent const &event) override {
    auto reason = event.error.empty() ? std::string("track_subscribe_failed") : event.error;
    EmitOnJs(
        m_emitters.context,
        m_emitters.onMediaError,
        ::React::JSValueObject{
            {"reason", reason},
            {"trackSid", event.track_sid},
        });
  }

  void setIntentionalDisconnect(bool value) {
    m_intentionalDisconnect.store(value);
  }

 private:
  LiveKitEmitters m_emitters;
  std::atomic_bool m_intentionalDisconnect{false};
};

struct LiveKitSession {
  std::unique_ptr<livekit::PlatformAudio> platformAudio;
  std::unique_ptr<livekit::Room> room;
  std::unique_ptr<KolamLiveKitRoomDelegate> delegate;
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

  if (g_session->delegate) {
    g_session->delegate->setIntentionalDisconnect(true);
  }

  if (g_session->micTrack) {
    try {
      g_session->micTrack->mute();
    } catch (...) {
    }
  }

  if (g_session->room) {
    try {
      g_session->room->setDelegate(nullptr);
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
int ConnectLiveKitRoomBody(
    char const *url,
    char const *token,
    LiveKitEmitters const *emitters,
    ConnectRawResult *out) {
  out->code = 1;
  out->session = nullptr;
  SetConnectReason(out, "connect_failed");

  try {
    EnsureLiveKitInitialized();

    auto session = std::make_unique<LiveKitSession>();

    // Create ADM/WASAPI before connect so playout is ready when remote tracks arrive.
    session->platformAudio = std::make_unique<livekit::PlatformAudio>();

    livekit::RoomOptions options;
    options.auto_subscribe = true;
    session->room = std::make_unique<livekit::Room>();

    if (emitters) {
      session->delegate = std::make_unique<KolamLiveKitRoomDelegate>(*emitters);
      session->room->setDelegate(session->delegate.get());
    }

    if (!session->room->connect(url, token, options)) {
      out->code = 1;
      SetConnectReason(out, "connect_failed");
      return 1;
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
      try {
        session->room->setDelegate(nullptr);
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
int ConnectLiveKitRoomSeh(
    char const *url,
    char const *token,
    LiveKitEmitters const *emitters,
    ConnectRawResult *out) {
  __try {
    return ConnectLiveKitRoomBody(url, token, emitters, out);
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

void KolamWindowsLiveKitRoom::addListener(std::string /*eventName*/) noexcept {}

void KolamWindowsLiveKitRoom::removeListeners(int /*count*/) noexcept {}

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

  LiveKitEmitters emitters{
      m_context,
      ConnectionChanged,
      MediaError,
  };

  std::thread([url = std::move(url),
               token = std::move(token),
               roomName = std::move(roomName),
               identity = std::move(identity),
               emitters = std::move(emitters),
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
      ConnectLiveKitRoomSeh(url.c_str(), token.c_str(), &emitters, &raw);

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
        EmitOnJs(
            emitters.context,
            emitters.onConnectionChanged,
            ::React::JSValueObject{{"status", "connected"}});
      } else {
        if (raw.session != nullptr) {
          delete raw.session;
          raw.session = nullptr;
        }
        auto reason =
            raw.reason[0] != '\0' ? std::string(raw.reason) : std::string("connect_failed");
        result.Resolve(FailResult(reason));
        EmitOnJs(
            emitters.context,
            emitters.onConnectionChanged,
            ::React::JSValueObject{
                {"status", "disconnected"},
                {"reason", reason},
            });
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
  auto emitters = LiveKitEmitters{m_context, ConnectionChanged, MediaError};
  std::thread([result = std::move(result), emitters = std::move(emitters)]() mutable {
    HRESULT const comHr = CoInitializeEx(nullptr, COINIT_MULTITHREADED);
    bool const comOwned = comHr == S_OK || comHr == S_FALSE;
    try {
      {
        std::lock_guard<std::mutex> lock(g_sessionMutex);
        TearDownSessionUnlocked();
      }
      result.Resolve(OkResult("disconnected"));
      EmitOnJs(
          emitters.context,
          emitters.onConnectionChanged,
          ::React::JSValueObject{
              {"status", "disconnected"},
              {"intentional", true},
          });
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
