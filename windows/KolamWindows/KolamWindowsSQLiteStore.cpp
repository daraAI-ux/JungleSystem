#include "pch.h"
#include "KolamWindowsSQLiteStore.h"

#include <shlobj.h>
#include <winsqlite/winsqlite3.h>

#include <memory>
#include <string>

namespace KolamWindows {
namespace {

struct SQLiteDeleter {
  void operator()(sqlite3 *db) const noexcept {
    if (db) {
      sqlite3_close(db);
    }
  }
};

struct StatementDeleter {
  void operator()(sqlite3_stmt *statement) const noexcept {
    if (statement) {
      sqlite3_finalize(statement);
    }
  }
};

using SQLiteDatabase = std::unique_ptr<sqlite3, SQLiteDeleter>;
using SQLiteStatement = std::unique_ptr<sqlite3_stmt, StatementDeleter>;

std::wstring GetLocalStoreDirectory() {
  DWORD requiredLength = GetEnvironmentVariableW(L"LOCALAPPDATA", nullptr, 0);
  if (requiredLength <= 1) {
    return {};
  }

  std::wstring localAppData(requiredLength, L'\0');
  DWORD actualLength =
      GetEnvironmentVariableW(L"LOCALAPPDATA", localAppData.data(), requiredLength);
  if (actualLength == 0 || actualLength >= requiredLength) {
    return {};
  }

  localAppData.resize(actualLength);
  return localAppData + L"\\Dunia Anura\\KolamWindows";
}

std::wstring GetDatabasePath() {
  const auto directory = GetLocalStoreDirectory();
  if (directory.empty()) {
    return {};
  }

  SHCreateDirectoryExW(nullptr, directory.c_str(), nullptr);
  return directory + L"\\kolam.sqlite";
}

bool Execute(sqlite3 *db, char const *sql) {
  char *error = nullptr;
  const int result = sqlite3_exec(db, sql, nullptr, nullptr, &error);
  if (error) {
    sqlite3_free(error);
  }

  return result == SQLITE_OK;
}

bool EnsureSchema(sqlite3 *db) {
  return Execute(db, "PRAGMA journal_mode=WAL;") &&
      Execute(
          db,
          "CREATE TABLE IF NOT EXISTS local_records ("
          "key TEXT PRIMARY KEY NOT NULL,"
          "payload TEXT NOT NULL,"
          "updated_at TEXT NOT NULL DEFAULT (datetime('now'))"
          ");");
}

SQLiteDatabase OpenDatabase() {
  const auto path = GetDatabasePath();
  if (path.empty()) {
    return nullptr;
  }

  sqlite3 *rawDb = nullptr;
  if (sqlite3_open16(path.c_str(), &rawDb) != SQLITE_OK || !rawDb) {
    if (rawDb) {
      sqlite3_close(rawDb);
    }
    return nullptr;
  }

  SQLiteDatabase db(rawDb);
  if (!EnsureSchema(db.get())) {
    return nullptr;
  }

  return db;
}

SQLiteStatement Prepare(sqlite3 *db, char const *sql) {
  sqlite3_stmt *rawStatement = nullptr;
  if (sqlite3_prepare_v2(db, sql, -1, &rawStatement, nullptr) != SQLITE_OK) {
    return nullptr;
  }

  return SQLiteStatement(rawStatement);
}

bool BindText(sqlite3_stmt *statement, int index, std::string const &value) {
  return sqlite3_bind_text(
             statement,
             index,
             value.c_str(),
             static_cast<int>(value.size()),
             SQLITE_TRANSIENT) == SQLITE_OK;
}

} // namespace

std::optional<std::string> KolamWindowsSQLiteStore::readRecord(std::string key) noexcept {
  auto db = OpenDatabase();
  if (!db) {
    return std::nullopt;
  }

  auto statement = Prepare(
      db.get(),
      "SELECT payload FROM local_records WHERE key = ? LIMIT 1;");
  if (!statement || !BindText(statement.get(), 1, key)) {
    return std::nullopt;
  }

  if (sqlite3_step(statement.get()) != SQLITE_ROW) {
    return std::nullopt;
  }

  const auto *text = sqlite3_column_text(statement.get(), 0);
  if (!text) {
    return std::nullopt;
  }

  return std::string(reinterpret_cast<char const *>(text));
}

bool KolamWindowsSQLiteStore::writeRecord(std::string key, std::string payload) noexcept {
  auto db = OpenDatabase();
  if (!db) {
    return false;
  }

  auto statement = Prepare(
      db.get(),
      "REPLACE INTO local_records (key, payload, updated_at) "
      "VALUES (?, ?, datetime('now'));");
  if (!statement || !BindText(statement.get(), 1, key) ||
      !BindText(statement.get(), 2, payload)) {
    return false;
  }

  return sqlite3_step(statement.get()) == SQLITE_DONE;
}

bool KolamWindowsSQLiteStore::removeRecord(std::string key) noexcept {
  auto db = OpenDatabase();
  if (!db) {
    return false;
  }

  auto statement = Prepare(db.get(), "DELETE FROM local_records WHERE key = ?;");
  if (!statement || !BindText(statement.get(), 1, key)) {
    return false;
  }

  return sqlite3_step(statement.get()) == SQLITE_DONE;
}

} // namespace KolamWindows
