#pragma once

#include <NativeModules.h>
#include <optional>
#include <string>

namespace KolamWindows {

REACT_MODULE(KolamWindowsSecureTokenStore)
struct KolamWindowsSecureTokenStore {
  REACT_SYNC_METHOD(getSession)
  std::optional<std::string> getSession() noexcept;

  REACT_SYNC_METHOD(setSession)
  bool setSession(std::string payload) noexcept;

  REACT_SYNC_METHOD(clearSession)
  bool clearSession() noexcept;
};

} // namespace KolamWindows
