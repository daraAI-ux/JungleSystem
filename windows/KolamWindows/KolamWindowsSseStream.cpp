#include "pch.h"
#include "KolamWindowsSseStream.h"

#include <memory>
#include <sstream>
#include <vector>

#include <winrt/Windows.Foundation.h>
#include <winrt/Windows.Foundation.Collections.h>
#include <winrt/Windows.Storage.Streams.h>
#include <winrt/Windows.Web.Http.h>
#include <winrt/Windows.Web.Http.Filters.h>
#include <winrt/Windows.Web.Http.Headers.h>

namespace KolamWindows {
namespace {

constexpr uint32_t kSseChunkBytes = 4 * 1024;

std::string WideToUtf8(std::wstring const &value) {
  if (value.empty()) {
    return {};
  }

  int length = WideCharToMultiByte(
      CP_UTF8, 0, value.c_str(), -1, nullptr, 0, nullptr, nullptr);
  if (length <= 1) {
    return {};
  }

  std::string utf8(static_cast<size_t>(length - 1), '\0');
  WideCharToMultiByte(
      CP_UTF8, 0, value.c_str(), -1, utf8.data(), length, nullptr, nullptr);
  return utf8;
}

std::string ReadString(::React::JSValueObject const &options, char const *key) {
  auto it = options.find(key);
  if (it == options.end() || it->second.Type() != ::React::JSValueType::String) {
    return {};
  }

  return it->second.AsString();
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

struct SseStreamRuntime {
  winrt::Microsoft::ReactNative::ReactContext context;
  std::string streamId;
  std::shared_ptr<std::atomic_bool> cancelled;
  std::function<void(::React::JSValueObject const &)> onOpened;
  std::function<void(::React::JSValueObject const &)> onChunk;
  std::function<void(::React::JSValueObject const &)> onError;
  std::function<void(::React::JSValueObject const &)> onClosed;
};

winrt::fire_and_forget RunSseStreamAsync(
    SseStreamRuntime runtime,
    ::React::JSValueObject options) {
  try {
    co_await winrt::resume_background();

    auto url = ReadString(options, "url");
    if (url.empty()) {
      EmitOnJs(
          runtime.context,
          runtime.onError,
          ::React::JSValueObject{
              {"streamId", runtime.streamId},
              {"message", "SSE url kosong."},
          });
      EmitOnJs(
          runtime.context,
          runtime.onClosed,
          ::React::JSValueObject{{"streamId", runtime.streamId}});
      co_return;
    }

    winrt::Windows::Web::Http::Filters::HttpBaseProtocolFilter filter;
    filter.AllowUI(false);
    // Keep cookies available when JS asks for credentials; Bearer is still
    // applied explicitly from headers.
    filter.CookieUsageBehavior(
        winrt::Windows::Web::Http::Filters::HttpCookieUsageBehavior::Default);

    winrt::Windows::Web::Http::HttpClient client(filter);
    auto request = winrt::Windows::Web::Http::HttpRequestMessage(
        winrt::Windows::Web::Http::HttpMethod::Get(),
        winrt::Windows::Foundation::Uri(winrt::to_hstring(url)));

    auto headersIt = options.find("headers");
    if (headersIt != options.end() &&
        headersIt->second.Type() == ::React::JSValueType::Object) {
      for (auto const &entry : headersIt->second.AsObject()) {
        if (entry.second.Type() != ::React::JSValueType::String) {
          continue;
        }
        auto name = entry.first;
        auto value = entry.second.AsString();
        if (name.empty()) {
          continue;
        }
        try {
          if (_stricmp(name.c_str(), "authorization") == 0 ||
              _stricmp(name.c_str(), "user-agent") == 0 ||
              _stricmp(name.c_str(), "last-event-id") == 0) {
            request.Headers().TryAppendWithoutValidation(
                winrt::to_hstring(name), winrt::to_hstring(value));
          } else {
            request.Headers().Append(
                winrt::to_hstring(name), winrt::to_hstring(value));
          }
        } catch (...) {
          // Skip invalid header pairs rather than failing the stream.
        }
      }
    }

    request.Headers().TryAppendWithoutValidation(L"Accept", L"text/event-stream");
    request.Headers().TryAppendWithoutValidation(L"Cache-Control", L"no-cache");

    auto response = co_await client.SendRequestAsync(
        request,
        winrt::Windows::Web::Http::HttpCompletionOption::ResponseHeadersRead);

    auto statusCode = response.StatusCode();
    auto status = static_cast<int>(statusCode);
    if (status < 200 || status >= 300) {
      EmitOnJs(
          runtime.context,
          runtime.onError,
          ::React::JSValueObject{
              {"streamId", runtime.streamId},
              {"message", "SSE HTTP " + std::to_string(status)},
              {"status", status},
          });
      EmitOnJs(
          runtime.context,
          runtime.onClosed,
          ::React::JSValueObject{{"streamId", runtime.streamId}});
      co_return;
    }

    EmitOnJs(
        runtime.context,
        runtime.onOpened,
        ::React::JSValueObject{{"streamId", runtime.streamId}});

    auto input = co_await response.Content().ReadAsInputStreamAsync();
    winrt::Windows::Storage::Streams::Buffer buffer(kSseChunkBytes);

    while (runtime.cancelled && !runtime.cancelled->load()) {
      auto loaded = co_await input.ReadAsync(
          buffer,
          buffer.Capacity(),
          winrt::Windows::Storage::Streams::InputStreamOptions::Partial);
      if (runtime.cancelled->load()) {
        break;
      }
      if (loaded.Length() == 0) {
        break;
      }

      auto dataReader =
          winrt::Windows::Storage::Streams::DataReader::FromBuffer(loaded);
      std::vector<uint8_t> bytes(loaded.Length());
      dataReader.ReadBytes(bytes);
      std::string chunk(bytes.begin(), bytes.end());
      if (chunk.empty()) {
        continue;
      }

      EmitOnJs(
          runtime.context,
          runtime.onChunk,
          ::React::JSValueObject{
              {"streamId", runtime.streamId},
              {"text", chunk},
          });
    }

    try {
      input.Close();
    } catch (...) {
    }
  } catch (winrt::hresult_error const &ex) {
    if (!(runtime.cancelled && runtime.cancelled->load())) {
      EmitOnJs(
          runtime.context,
          runtime.onError,
          ::React::JSValueObject{
              {"streamId", runtime.streamId},
              {"message", WideToUtf8(std::wstring(ex.message()))},
          });
    }
  } catch (...) {
    if (!(runtime.cancelled && runtime.cancelled->load())) {
      EmitOnJs(
          runtime.context,
          runtime.onError,
          ::React::JSValueObject{
              {"streamId", runtime.streamId},
              {"message", "SSE stream gagal."},
          });
    }
  }

  EmitOnJs(
      runtime.context,
      runtime.onClosed,
      ::React::JSValueObject{{"streamId", runtime.streamId}});
}

} // namespace

void KolamWindowsSseStream::Initialize(
    winrt::Microsoft::ReactNative::ReactContext const &reactContext) noexcept {
  m_context = reactContext;
}

void KolamWindowsSseStream::open(
    ::React::JSValueObject options,
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  auto cancelFlag = std::make_shared<std::atomic_bool>(false);
  auto streamId = std::to_string(m_nextId.fetch_add(1));

  {
    std::lock_guard<std::mutex> lock(m_mutex);
    m_cancelFlags[streamId] = cancelFlag;
  }

  SseStreamRuntime runtime{
      m_context,
      streamId,
      cancelFlag,
      SseOpened,
      SseChunk,
      SseError,
      SseClosed,
  };

  RunSseStreamAsync(std::move(runtime), std::move(options));
  result.Resolve(::React::JSValueObject{{"streamId", streamId}});
}

void KolamWindowsSseStream::close(
    std::string streamId,
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  std::shared_ptr<std::atomic_bool> flag;
  {
    std::lock_guard<std::mutex> lock(m_mutex);
    auto it = m_cancelFlags.find(streamId);
    if (it != m_cancelFlags.end()) {
      flag = it->second;
      m_cancelFlags.erase(it);
    }
  }

  if (flag) {
    flag->store(true);
  }

  result.Resolve(::React::JSValueObject{
      {"streamId", streamId},
      {"closed", true},
  });
}

void KolamWindowsSseStream::addListener(std::string /*eventName*/) noexcept {}

void KolamWindowsSseStream::removeListeners(int /*count*/) noexcept {}

} // namespace KolamWindows
