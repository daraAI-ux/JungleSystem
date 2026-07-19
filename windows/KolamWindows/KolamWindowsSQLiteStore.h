#pragma once

#include <NativeModules.h>
#include <optional>
#include <string>

namespace KolamWindows {

REACT_MODULE(KolamWindowsSQLiteStore)
struct KolamWindowsSQLiteStore {
  REACT_SYNC_METHOD(readRecord)
  std::optional<std::string> readRecord(std::string key) noexcept;

  REACT_SYNC_METHOD(writeRecord)
  bool writeRecord(std::string key, std::string payload) noexcept;

  REACT_SYNC_METHOD(removeRecord)
  bool removeRecord(std::string key) noexcept;
};

} // namespace KolamWindows
