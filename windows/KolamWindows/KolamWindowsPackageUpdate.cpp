#include "pch.h"
#include "KolamWindowsPackageUpdate.h"

#include <algorithm>
#include <appmodel.h>
#include <cctype>
#include <cmath>
#include <cwctype>
#include <memory>
#include <sstream>
#include <vector>

#include <shellapi.h>

#include <winrt/Windows.ApplicationModel.h>
#include <winrt/Windows.ApplicationModel.Core.h>
#include <winrt/Windows.Foundation.h>
#include <winrt/Windows.Foundation.Collections.h>
#include <winrt/Windows.Management.Deployment.h>
#include <winrt/Windows.Security.Cryptography.h>
#include <winrt/Windows.Security.Cryptography.Core.h>
#include <winrt/Windows.Storage.h>
#include <winrt/Windows.Storage.Streams.h>
#include <winrt/Windows.Web.Http.h>
#include <winrt/Windows.Web.Http.Filters.h>
#include <winrt/Windows.Web.Http.Headers.h>

namespace KolamWindows {
namespace {

constexpr wchar_t kUpdateFolderName[] = L"kolam-updates";
constexpr uint32_t kDownloadChunkBytes = 64 * 1024;

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

std::wstring Utf8ToWide(std::string const &value) {
  if (value.empty()) {
    return {};
  }

  int length = MultiByteToWideChar(CP_UTF8, 0, value.c_str(), -1, nullptr, 0);
  if (length <= 1) {
    return {};
  }

  std::wstring wide(static_cast<size_t>(length - 1), L'\0');
  MultiByteToWideChar(CP_UTF8, 0, value.c_str(), -1, wide.data(), length);
  return wide;
}

std::string ReadString(::React::JSValueObject const &options, char const *key) {
  auto it = options.find(key);
  if (it == options.end() || it->second.Type() != ::React::JSValueType::String) {
    return {};
  }

  return it->second.AsString();
}

uint64_t ReadUint64(::React::JSValueObject const &options, char const *key) {
  auto it = options.find(key);
  if (it == options.end()) {
    return 0;
  }

  if (it->second.Type() == ::React::JSValueType::Int64) {
    auto value = it->second.AsInt64();
    return value > 0 ? static_cast<uint64_t>(value) : 0;
  }

  if (it->second.Type() == ::React::JSValueType::Double) {
    auto value = it->second.AsDouble();
    if (!std::isfinite(value) || value <= 0) {
      return 0;
    }
    return static_cast<uint64_t>(value);
  }

  if (it->second.Type() == ::React::JSValueType::String) {
    try {
      return std::stoull(it->second.AsString());
    } catch (...) {
      return 0;
    }
  }

  return 0;
}

std::string ToLowerHex(std::string value) {
  std::string hex;
  hex.reserve(value.size());
  for (unsigned char ch : value) {
    if (std::isxdigit(ch)) {
      hex.push_back(static_cast<char>(std::tolower(ch)));
    }
  }
  return hex;
}

bool IsHttpsUrl(std::string const &url) {
  if (url.size() < 8) {
    return false;
  }

  auto prefix = url.substr(0, 8);
  std::transform(prefix.begin(), prefix.end(), prefix.begin(), [](unsigned char ch) {
    return static_cast<char>(std::tolower(ch));
  });
  return prefix == "https://";
}

std::string SanitizeMsixFileName(std::string fileName) {
  if (fileName.empty()) {
    return "JungleSystem-update.msix";
  }

  auto slash = fileName.find_last_of("\\/");
  if (slash != std::string::npos) {
    fileName = fileName.substr(slash + 1);
  }

  for (auto &ch : fileName) {
    if (!(std::isalnum(static_cast<unsigned char>(ch)) || ch == '.' || ch == '_' ||
          ch == '-')) {
      ch = '_';
    }
  }

  auto lower = fileName;
  std::transform(lower.begin(), lower.end(), lower.begin(), [](unsigned char ch) {
    return static_cast<char>(std::tolower(ch));
  });
  if (lower.size() < 5 || lower.rfind(".msix") != lower.size() - 5) {
    return "JungleSystem-update.msix";
  }

  return fileName;
}

std::string FormatPublicVersion(uint16_t major, uint16_t minor, uint16_t build) {
  std::ostringstream stream;
  stream << major << '.' << minor << '.' << build;
  return stream.str();
}

std::string FormatFullVersion(
    uint16_t major,
    uint16_t minor,
    uint16_t build,
    uint16_t revision) {
  std::ostringstream stream;
  stream << major << '.' << minor << '.' << build << '.' << revision;
  return stream.str();
}

::React::JSValueObject UnpackagedInfo() {
  return ::React::JSValueObject{
      {"packaged", false},
      {"name", "JungleSystem"},
      {"publisher", ""},
      {"familyName", ""},
      {"version", ""},
      {"publicVersion", ""},
  };
}

std::wstring ReadAppModelString(LONG(WINAPI *reader)(UINT32 *, PWSTR)) {
  UINT32 length = 0;
  LONG status = reader(&length, nullptr);
  if (status != ERROR_INSUFFICIENT_BUFFER || length == 0) {
    return {};
  }

  std::wstring value(length, L'\0');
  status = reader(&length, value.data());
  if (status != ERROR_SUCCESS) {
    return {};
  }

  while (!value.empty() && value.back() == L'\0') {
    value.pop_back();
  }
  return value;
}

bool PathIsUnderFolder(std::wstring const &path, std::wstring const &folder) {
  if (path.empty() || folder.empty()) {
    return false;
  }

  auto normalizedPath = path;
  auto normalizedFolder = folder;
  std::transform(
      normalizedPath.begin(),
      normalizedPath.end(),
      normalizedPath.begin(),
      [](wchar_t ch) { return static_cast<wchar_t>(std::towlower(ch)); });
  std::transform(
      normalizedFolder.begin(),
      normalizedFolder.end(),
      normalizedFolder.begin(),
      [](wchar_t ch) { return static_cast<wchar_t>(std::towlower(ch)); });
  if (normalizedFolder.back() != L'\\') {
    normalizedFolder.push_back(L'\\');
  }
  return normalizedPath.rfind(normalizedFolder, 0) == 0;
}

winrt::Windows::Foundation::Uri MakeFileUri(std::wstring const &path) {
  auto normalized = path;
  std::replace(normalized.begin(), normalized.end(), L'\\', L'/');
  if (normalized.size() >= 2 && normalized[1] == L':') {
    return winrt::Windows::Foundation::Uri(L"file:///" + normalized);
  }
  return winrt::Windows::Foundation::Uri(L"file://" + normalized);
}

struct PackageUpdateRuntime {
  winrt::Microsoft::ReactNative::ReactContext context;
  std::function<void(::React::JSValueObject const &)> downloadProgress;
  std::function<void(::React::JSValueObject const &)> installProgress;
  std::mutex *mutex{nullptr};
  std::wstring *lastDownloadPath{nullptr};
  std::atomic_bool *busy{nullptr};
};

void ClearBusy(PackageUpdateRuntime const &runtime) noexcept {
  if (runtime.busy) {
    runtime.busy->store(false);
  }
}

void EmitOnJs(
    winrt::Microsoft::ReactNative::ReactContext const &context,
    std::function<void(::React::JSValueObject const &)> handler,
    ::React::JSValueObject payload) {
  if (!handler) {
    return;
  }

  context.JSDispatcher().Post([handler = std::move(handler), payload = std::move(payload)]() {
    if (handler) {
      handler(payload);
    }
  });
}

winrt::fire_and_forget DownloadMsixAsync(
    PackageUpdateRuntime runtime,
    ::React::JSValueObject options,
    ::React::ReactPromise<::React::JSValueObject> result) {
  auto busy = std::shared_ptr<void>(nullptr, [runtime](void *) { ClearBusy(runtime); });

  try {
    co_await winrt::resume_background();

    auto url = ReadString(options, "url");
    auto sha512 = ToLowerHex(ReadString(options, "sha512"));
    auto sha256 = ToLowerHex(ReadString(options, "sha256"));
    auto expectedSize = ReadUint64(options, "size");
    auto fileName = SanitizeMsixFileName(ReadString(options, "fileName"));
    auto authorization = ReadString(options, "authorization");

    if (!IsHttpsUrl(url)) {
      result.Reject("URL unduhan tidak valid.");
      co_return;
    }
    if (authorization.empty()) {
      result.Reject("Login dulu");
      co_return;
    }
    if (sha512.empty() && sha256.empty()) {
      result.Reject("Hash rilis kosong.");
      co_return;
    }

    auto root = winrt::Windows::Storage::ApplicationData::Current().LocalCacheFolder();
    auto folder = co_await root.CreateFolderAsync(
        kUpdateFolderName,
        winrt::Windows::Storage::CreationCollisionOption::OpenIfExists);
    auto file = co_await folder.CreateFileAsync(
        winrt::to_hstring(fileName),
        winrt::Windows::Storage::CreationCollisionOption::ReplaceExisting);

    winrt::Windows::Web::Http::Filters::HttpBaseProtocolFilter filter;
    filter.AllowUI(false);
    winrt::Windows::Web::Http::HttpClient client(filter);
    auto request = winrt::Windows::Web::Http::HttpRequestMessage(
        winrt::Windows::Web::Http::HttpMethod::Get(),
        winrt::Windows::Foundation::Uri(winrt::to_hstring(url)));
    request.Headers().TryAppendWithoutValidation(
        L"Authorization", winrt::to_hstring(authorization));
    auto response = co_await client.SendRequestAsync(
        request, winrt::Windows::Web::Http::HttpCompletionOption::ResponseHeadersRead);
    if (response.StatusCode() == winrt::Windows::Web::Http::HttpStatusCode::Unauthorized ||
        response.StatusCode() == winrt::Windows::Web::Http::HttpStatusCode::Forbidden) {
      result.Reject("Akses ditolak");
      co_return;
    }
    if (response.StatusCode() != winrt::Windows::Web::Http::HttpStatusCode::Ok) {
      result.Reject("Gagal unduh.");
      co_return;
    }

    uint64_t total = expectedSize;
    if (auto contentLength = response.Content().Headers().ContentLength()) {
      auto length = contentLength.Value();
      if (length > 0) {
        total = length;
      }
    }

    auto input = co_await response.Content().ReadAsInputStreamAsync();
    auto output = co_await file.OpenAsync(winrt::Windows::Storage::FileAccessMode::ReadWrite);
    auto hashAlgorithm = sha512.empty()
        ? winrt::Windows::Security::Cryptography::Core::HashAlgorithmNames::Sha256()
        : winrt::Windows::Security::Cryptography::Core::HashAlgorithmNames::Sha512();
    auto hasher = winrt::Windows::Security::Cryptography::Core::HashAlgorithmProvider::
                      OpenAlgorithm(hashAlgorithm)
                          .CreateHash();

    winrt::Windows::Storage::Streams::Buffer buffer(kDownloadChunkBytes);
    uint64_t received = 0;
    int lastPercent = -1;

    while (true) {
      auto loaded = co_await input.ReadAsync(
          buffer, buffer.Capacity(), winrt::Windows::Storage::Streams::InputStreamOptions::None);
      if (loaded.Length() == 0) {
        break;
      }

      hasher.Append(loaded);
      co_await output.WriteAsync(loaded);
      received += loaded.Length();

      int percent = 0;
      if (total > 0) {
        percent = static_cast<int>((received * 100) / total);
        if (percent > 100) {
          percent = 100;
        }
      }
      if (percent != lastPercent && runtime.downloadProgress) {
        lastPercent = percent;
        EmitOnJs(
            runtime.context,
            runtime.downloadProgress,
            ::React::JSValueObject{
                {"received", static_cast<double>(received)},
                {"total", static_cast<double>(total)},
                {"percent", percent},
            });
      }
    }

    output.Close();
    input.Close();

    if (expectedSize > 0 && received != expectedSize) {
      co_await file.DeleteAsync();
      result.Reject("Ukuran file tidak cocok.");
      co_return;
    }

    auto hashBuffer = hasher.GetValueAndReset();
    auto actualHex = ToLowerHex(WideToUtf8(
        winrt::Windows::Security::Cryptography::CryptographicBuffer::EncodeToHexString(hashBuffer)
            .c_str()));
    auto expectedHex = sha512.empty() ? sha256 : sha512;
    if (actualHex != expectedHex) {
      co_await file.DeleteAsync();
      result.Reject("Hash tidak cocok.");
      co_return;
    }

    auto path = std::wstring(file.Path().c_str());
    if (runtime.mutex && runtime.lastDownloadPath) {
      std::lock_guard<std::mutex> lock(*runtime.mutex);
      *runtime.lastDownloadPath = path;
    }

    result.Resolve(::React::JSValueObject{
        {"path", WideToUtf8(path)},
        {"size", static_cast<double>(received)},
        {"sha512", sha512.empty() ? "" : actualHex},
        {"sha256", sha512.empty() ? actualHex : ""},
    });
  } catch (winrt::hresult_error const &error) {
    result.Reject(winrt::to_string(error.message()).c_str());
  } catch (...) {
    result.Reject("Gagal unduh.");
  }
}

winrt::fire_and_forget InstallMsixAsync(
    PackageUpdateRuntime runtime,
    ::React::JSValueObject options,
    ::React::ReactPromise<::React::JSValueObject> result) {
  auto busy = std::shared_ptr<void>(nullptr, [runtime](void *) { ClearBusy(runtime); });

  try {
    co_await winrt::resume_background();

    std::wstring path;
    auto requested = ReadString(options, "path");
    if (runtime.mutex && runtime.lastDownloadPath) {
      std::lock_guard<std::mutex> lock(*runtime.mutex);
      path = *runtime.lastDownloadPath;
    }

    if (!requested.empty()) {
      path = Utf8ToWide(requested);
    }
    if (path.empty()) {
      result.Reject("File unduhan tidak ada.");
      co_return;
    }

    auto root = winrt::Windows::Storage::ApplicationData::Current().LocalCacheFolder();
    auto folder = co_await root.CreateFolderAsync(
        kUpdateFolderName,
        winrt::Windows::Storage::CreationCollisionOption::OpenIfExists);
    if (!PathIsUnderFolder(path, std::wstring(folder.Path().c_str()))) {
      result.Reject("Path unduhan tidak valid.");
      co_return;
    }

    winrt::Windows::Management::Deployment::PackageManager manager;
    auto operation = manager.AddPackageAsync(
        MakeFileUri(path),
        nullptr,
        winrt::Windows::Management::Deployment::DeploymentOptions::ForceApplicationShutdown |
            winrt::Windows::Management::Deployment::DeploymentOptions::
                ForceUpdateFromAnyVersion);

    auto installProgress = runtime.installProgress;
    auto context = runtime.context;
    operation.Progress(
        [context, installProgress](
            winrt::Windows::Foundation::IAsyncOperationWithProgress<
                winrt::Windows::Management::Deployment::DeploymentResult,
                winrt::Windows::Management::Deployment::DeploymentProgress> const &,
            winrt::Windows::Management::Deployment::DeploymentProgress const progress) {
          if (!installProgress) {
            return;
          }
          EmitOnJs(
              context,
              installProgress,
              ::React::JSValueObject{
                  {"percent", static_cast<int>(progress.percentage)},
              });
        });

    auto deployment = co_await operation;
    auto errorText = WideToUtf8(deployment.ErrorText().c_str());
    if (!errorText.empty() && deployment.ExtendedErrorCode() != winrt::hresult{0}) {
      // Fallback: open the MSIX with the system App Installer UI.
      auto launched = ShellExecuteW(
          nullptr, L"open", path.c_str(), nullptr, nullptr, SW_SHOWNORMAL);
      if (reinterpret_cast<INT_PTR>(launched) > 32) {
        result.Resolve(::React::JSValueObject{{"ok", true}, {"fallback", true}});
        co_return;
      }
      result.Reject(errorText.c_str());
      co_return;
    }

    result.Resolve(::React::JSValueObject{{"ok", true}});
  } catch (winrt::hresult_error const &error) {
    std::wstring path;
    auto requested = ReadString(options, "path");
    if (runtime.mutex && runtime.lastDownloadPath) {
      std::lock_guard<std::mutex> lock(*runtime.mutex);
      path = *runtime.lastDownloadPath;
    }
    if (!requested.empty()) {
      path = Utf8ToWide(requested);
    }
    if (!path.empty()) {
      auto launched = ShellExecuteW(
          nullptr, L"open", path.c_str(), nullptr, nullptr, SW_SHOWNORMAL);
      if (reinterpret_cast<INT_PTR>(launched) > 32) {
        result.Resolve(::React::JSValueObject{{"ok", true}, {"fallback", true}});
        co_return;
      }
    }
    result.Reject(winrt::to_string(error.message()).c_str());
  } catch (...) {
    result.Reject("Gagal pasang.");
  }
}

void RestartApp(::React::ReactPromise<::React::JSValueObject> result) noexcept {
  try {
    auto aumid = ReadAppModelString(GetCurrentApplicationUserModelId);
    if (aumid.empty()) {
      result.Reject("Gagal restart.");
      return;
    }

    auto target = std::wstring(L"shell:AppsFolder\\") + aumid;
    auto launched = ShellExecuteW(
        nullptr, L"open", target.c_str(), nullptr, nullptr, SW_SHOWNORMAL);
    if (reinterpret_cast<INT_PTR>(launched) <= 32) {
      result.Reject("Gagal restart.");
      return;
    }
    result.Resolve(::React::JSValueObject{{"ok", true}, {"restarted", true}});
    ExitProcess(0);
  } catch (...) {
    result.Reject("Gagal restart.");
  }
}

} // namespace

void KolamWindowsPackageUpdate::Initialize(
    winrt::Microsoft::ReactNative::ReactContext const &reactContext) noexcept {
  m_context = reactContext;
}

::React::JSValueObject KolamWindowsPackageUpdate::getPackageInfo() noexcept {
  // Prefer WinRT Package.Current() — more reliable than GetCurrentPackageId alone
  // for packaged MSIX identity used by Settings version + update compare.
  try {
    auto package = winrt::Windows::ApplicationModel::Package::Current();
    auto id = package.Id();
    auto version = id.Version();
    return ::React::JSValueObject{
        {"packaged", true},
        {"name", WideToUtf8(std::wstring(id.Name().c_str()))},
        {"publisher", WideToUtf8(std::wstring(id.Publisher().c_str()))},
        {"familyName", WideToUtf8(std::wstring(id.FamilyName().c_str()))},
        {"version",
         FormatFullVersion(version.Major, version.Minor, version.Build, version.Revision)},
        {"publicVersion", FormatPublicVersion(version.Major, version.Minor, version.Build)},
    };
  } catch (...) {
    // Fall through to AppModel APIs / unpackaged.
  }

  try {
    UINT32 fullNameLength = 0;
    LONG status = GetCurrentPackageFullName(&fullNameLength, nullptr);
    if (status == APPMODEL_ERROR_NO_PACKAGE) {
      return UnpackagedInfo();
    }

    UINT32 idLength = 0;
    status = GetCurrentPackageId(&idLength, nullptr);
    if (status != ERROR_INSUFFICIENT_BUFFER || idLength == 0) {
      return UnpackagedInfo();
    }

    std::vector<BYTE> buffer(idLength);
    status = GetCurrentPackageId(&idLength, buffer.data());
    if (status != ERROR_SUCCESS) {
      return UnpackagedInfo();
    }

    auto *id = reinterpret_cast<PACKAGE_ID *>(buffer.data());
    auto familyName = ReadAppModelString(GetCurrentPackageFamilyName);
    auto version = id->version;
    return ::React::JSValueObject{
        {"packaged", true},
        {"name", id->name ? WideToUtf8(id->name) : std::string("JungleSystem")},
        {"publisher", id->publisher ? WideToUtf8(id->publisher) : std::string()},
        {"familyName", WideToUtf8(familyName)},
        {"version",
         FormatFullVersion(version.Major, version.Minor, version.Build, version.Revision)},
        {"publicVersion", FormatPublicVersion(version.Major, version.Minor, version.Build)},
    };
  } catch (...) {
    return UnpackagedInfo();
  }
}

void KolamWindowsPackageUpdate::addListener(std::string /*eventName*/) noexcept {}

void KolamWindowsPackageUpdate::removeListeners(int /*count*/) noexcept {}

void KolamWindowsPackageUpdate::downloadMsix(
    ::React::JSValueObject options,
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  if (m_busy.exchange(true)) {
    result.Reject("Sibuk.");
    return;
  }

  try {
    DownloadMsixAsync(
        PackageUpdateRuntime{
            m_context,
            DownloadProgress,
            InstallProgress,
            &m_mutex,
            &m_lastDownloadPath,
            &m_busy,
        },
        std::move(options),
        std::move(result));
  } catch (...) {
    m_busy.store(false);
    result.Reject("Gagal unduh.");
  }
}

void KolamWindowsPackageUpdate::installMsix(
    ::React::JSValueObject options,
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  if (m_busy.exchange(true)) {
    result.Reject("Sibuk.");
    return;
  }

  try {
    InstallMsixAsync(
        PackageUpdateRuntime{
            m_context,
            DownloadProgress,
            InstallProgress,
            &m_mutex,
            &m_lastDownloadPath,
            &m_busy,
        },
        std::move(options),
        std::move(result));
  } catch (...) {
    m_busy.store(false);
    result.Reject("Gagal pasang.");
  }
}

void KolamWindowsPackageUpdate::restartApp(
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  RestartApp(std::move(result));
}

} // namespace KolamWindows
