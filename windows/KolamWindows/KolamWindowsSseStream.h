#pragma once

#include <NativeModules.h>
#include <atomic>
#include <memory>
#include <mutex>
#include <string>
#include <unordered_map>

namespace KolamWindows {

REACT_MODULE(KolamWindowsSseStream)
struct KolamWindowsSseStream {
  REACT_INIT(Initialize)
  void Initialize(winrt::Microsoft::ReactNative::ReactContext const &reactContext) noexcept;

  REACT_METHOD(open)
  void open(
      ::React::JSValueObject options,
      ::React::ReactPromise<::React::JSValueObject> &&result) noexcept;

  REACT_METHOD(close)
  void close(
      std::string streamId,
      ::React::ReactPromise<::React::JSValueObject> &&result) noexcept;

  REACT_METHOD(addListener)
  void addListener(std::string eventName) noexcept;

  REACT_METHOD(removeListeners)
  void removeListeners(int count) noexcept;

  REACT_EVENT(SseOpened)
  std::function<void(::React::JSValueObject const &)> SseOpened;

  REACT_EVENT(SseChunk)
  std::function<void(::React::JSValueObject const &)> SseChunk;

  REACT_EVENT(SseError)
  std::function<void(::React::JSValueObject const &)> SseError;

  REACT_EVENT(SseClosed)
  std::function<void(::React::JSValueObject const &)> SseClosed;

 private:
  winrt::Microsoft::ReactNative::ReactContext m_context;
  std::mutex m_mutex;
  std::atomic_uint64_t m_nextId{1};
  std::unordered_map<std::string, std::shared_ptr<std::atomic_bool>> m_cancelFlags;
};

} // namespace KolamWindows
