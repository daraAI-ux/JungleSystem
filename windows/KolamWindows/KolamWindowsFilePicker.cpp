#include "pch.h"
#include "KolamWindowsFilePicker.h"

#include <Shobjidl.h>
#include <algorithm>
#include <cstdint>
#include <mutex>
#include <vector>
#include <string>
#include <winrt/Windows.Foundation.Collections.h>
#include <winrt/Windows.Storage.FileProperties.h>
#include <winrt/Windows.Storage.Pickers.h>
#include <winrt/Windows.Storage.h>

namespace KolamWindows {
namespace {

std::mutex g_droppedFileMutex;
std::string g_droppedFilePath;
int g_droppedFileScreenX = 0;
int g_droppedFileScreenY = 0;
bool g_droppedFileHasPoint = false;
constexpr uint64_t kMaxSvgPreviewBytes = 512 * 1024;

std::string GetExtension(std::string fileName) {
  const auto separator = fileName.find_last_of('.');
  if (separator == std::string::npos) {
    return {};
  }

  auto extension = fileName.substr(separator);
  std::transform(extension.begin(), extension.end(), extension.begin(), ::tolower);
  return extension;
}

std::string GetMimeType(std::string const &extension) {
  if (extension == ".png") return "image/png";
  if (extension == ".jpg" || extension == ".jpeg") return "image/jpeg";
  if (extension == ".webp") return "image/webp";
  if (extension == ".gif") return "image/gif";
  if (extension == ".svg") return "image/svg+xml";
  if (extension == ".mp4") return "video/mp4";
  if (extension == ".mov") return "video/quicktime";
  if (extension == ".webm") return "video/webm";
  if (extension == ".mp3") return "audio/mpeg";
  if (extension == ".wav") return "audio/wav";
  if (extension == ".m4a") return "audio/mp4";
  if (extension == ".aac") return "audio/aac";
  if (extension == ".pdf") return "application/pdf";
  if (extension == ".doc") return "application/msword";
  if (extension == ".docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (extension == ".xls") return "application/vnd.ms-excel";
  if (extension == ".xlsx") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  return "application/octet-stream";
}

std::string ToFileUri(std::string path) {
  std::replace(path.begin(), path.end(), '\\', '/');
  return std::string("file:///").append(path);
}

BOOL CALLBACK FindCurrentProcessWindow(HWND hwnd, LPARAM lParam) {
  DWORD windowProcessId = 0;
  GetWindowThreadProcessId(hwnd, &windowProcessId);
  if (windowProcessId != GetCurrentProcessId() || !IsWindowVisible(hwnd)) {
    return TRUE;
  }

  auto result = reinterpret_cast<HWND *>(lParam);
  *result = hwnd;
  return FALSE;
}

HWND GetCurrentProcessWindow() {
  HWND hwnd = nullptr;
  EnumWindows(FindCurrentProcessWindow, reinterpret_cast<LPARAM>(&hwnd));
  return hwnd;
}

::React::JSValueObject CancelledResult() {
  return ::React::JSValueObject{{"cancelled", true}};
}

::React::JSValueObject FileResult(std::string const &path) {
  const auto slash = path.find_last_of("\\/");
  const auto name = slash == std::string::npos ? path : path.substr(slash + 1);
  const auto extension = GetExtension(name);

  return ::React::JSValueObject{
      {"cancelled", false},
      {"path", path},
      {"uri", ToFileUri(path)},
      {"name", name},
      {"extension", extension},
      {"mimeType", GetMimeType(extension)},
  };
}

::React::JSValueObject DroppedFileResult(
    std::string const &path,
    bool hasPoint,
    int screenX,
    int screenY) {
  const auto slash = path.find_last_of("\\/");
  const auto name = slash == std::string::npos ? path : path.substr(slash + 1);
  const auto extension = GetExtension(name);

  if (!hasPoint) {
    return FileResult(path);
  }

  return ::React::JSValueObject{
      {"cancelled", false},
      {"path", path},
      {"uri", ToFileUri(path)},
      {"name", name},
      {"extension", extension},
      {"mimeType", GetMimeType(extension)},
      {"dropScreenX", screenX},
      {"dropScreenY", screenY},
  };
}

bool IsImageExtension(std::string const &extension) {
  return extension == ".png" ||
      extension == ".jpg" ||
      extension == ".jpeg" ||
      extension == ".webp" ||
      extension == ".gif" ||
      extension == ".svg";
}

bool IsSvgExtension(std::string const &extension) {
  return extension == ".svg";
}

std::string DecodeFileUri(std::string value) {
  if (value.rfind("file:///", 0) == 0) {
    value = value.substr(8);
  } else if (value.rfind("file://", 0) == 0) {
    value = value.substr(7);
  }

  std::replace(value.begin(), value.end(), '/', '\\');
  return value;
}

std::vector<uint8_t> DecodeBase64(std::string const &input) {
  static constexpr unsigned char kInvalid = 255;
  unsigned char table[256];
  std::fill(std::begin(table), std::end(table), kInvalid);
  for (int i = 'A'; i <= 'Z'; ++i) table[i] = static_cast<unsigned char>(i - 'A');
  for (int i = 'a'; i <= 'z'; ++i) table[i] = static_cast<unsigned char>(26 + i - 'a');
  for (int i = '0'; i <= '9'; ++i) table[i] = static_cast<unsigned char>(52 + i - '0');
  table[static_cast<unsigned char>('+')] = 62;
  table[static_cast<unsigned char>('/')] = 63;

  std::vector<uint8_t> output;
  output.reserve((input.size() * 3) / 4);
  int value = 0;
  int bits = -8;

  for (unsigned char c : input) {
    if (c == '=') break;
    if (c == '\r' || c == '\n' || c == ' ' || c == '\t') continue;
    const auto decoded = table[c];
    if (decoded == kInvalid) continue;
    value = (value << 6) + decoded;
    bits += 6;
    if (bits >= 0) {
      output.push_back(static_cast<uint8_t>((value >> bits) & 0xFF));
      bits -= 8;
    }
  }

  return output;
}

std::string SanitizeSuggestedName(std::string fileName) {
  if (fileName.empty()) {
    return "export.xlsx";
  }

  for (auto &ch : fileName) {
    if (ch == '\\' || ch == '/' || ch == ':' || ch == '*' || ch == '?' ||
        ch == '"' || ch == '<' || ch == '>' || ch == '|') {
      ch = '_';
    }
  }

  return fileName;
}

void SaveBase64File(
    std::string suggestedName,
    std::string base64Content,
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  try {
    auto picker = winrt::Windows::Storage::Pickers::FileSavePicker();
    picker.SuggestedStartLocation(winrt::Windows::Storage::Pickers::PickerLocationId::DocumentsLibrary);
    const auto safeSuggestedName = SanitizeSuggestedName(suggestedName);
    const auto extension = GetExtension(safeSuggestedName);
    picker.SuggestedFileName(winrt::to_hstring(safeSuggestedName));
    auto extensions = winrt::single_threaded_vector<winrt::hstring>();
    if (extension == ".pdf") {
      extensions.Append(L".pdf");
      picker.DefaultFileExtension(L".pdf");
      picker.FileTypeChoices().Insert(L"PDF Document", extensions);
    } else if (extension == ".xls") {
      extensions.Append(L".xls");
      picker.DefaultFileExtension(L".xls");
      picker.FileTypeChoices().Insert(L"Excel 97-2003 Workbook", extensions);
    } else {
      extensions.Append(L".xlsx");
      picker.DefaultFileExtension(L".xlsx");
      picker.FileTypeChoices().Insert(L"Excel Workbook", extensions);
    }

    auto hwnd = GetCurrentProcessWindow();
    if (hwnd) {
      auto initializeWithWindow{picker.as<::IInitializeWithWindow>()};
      initializeWithWindow->Initialize(hwnd);
    }

    auto asyncOp = picker.PickSaveFileAsync();
    asyncOp.Completed(
        [result = std::move(result), base64Content = std::move(base64Content)](
            winrt::Windows::Foundation::IAsyncOperation<winrt::Windows::Storage::StorageFile> const &operation,
            winrt::Windows::Foundation::AsyncStatus status) mutable {
          if (status != winrt::Windows::Foundation::AsyncStatus::Completed) {
            result.Resolve(CancelledResult());
            return;
          }

          auto file = operation.GetResults();
          if (!file) {
            result.Resolve(CancelledResult());
            return;
          }

          try {
            auto bytes = DecodeBase64(base64Content);
            auto writeOp = winrt::Windows::Storage::FileIO::WriteBytesAsync(
                file,
                winrt::array_view<uint8_t const>(bytes.data(), bytes.data() + bytes.size()));
            writeOp.Completed(
                [result = std::move(result), file](
                    winrt::Windows::Foundation::IAsyncAction const &,
                    winrt::Windows::Foundation::AsyncStatus writeStatus) mutable {
                  if (writeStatus != winrt::Windows::Foundation::AsyncStatus::Completed) {
                    result.Reject("File export tidak bisa disimpan.");
                    return;
                  }

                  const auto path = winrt::to_string(file.Path());
                  const auto name = winrt::to_string(file.Name());
                  result.Resolve(::React::JSValueObject{
                      {"cancelled", false},
                      {"path", path},
                      {"uri", ToFileUri(path)},
                      {"name", name},
                  });
                });
          } catch (winrt::hresult_error const &error) {
            result.Reject(winrt::to_string(error.message()).c_str());
          } catch (...) {
            result.Reject("File export tidak bisa disimpan.");
          }
        });
  } catch (winrt::hresult_error const &error) {
    result.Reject(winrt::to_string(error.message()).c_str());
  } catch (...) {
    result.Reject("File saver tidak bisa dibuka.");
  }
}

bool IsSafeRelativeCachePath(std::string const &relativePath) {
  if (relativePath.empty() || relativePath.size() > 180) {
    return false;
  }

  if (relativePath.find(':') != std::string::npos ||
      relativePath.find('\\') != std::string::npos ||
      relativePath.find('/') != std::string::npos ||
      relativePath.find("..") != std::string::npos) {
    return false;
  }

  return true;
}

void WriteCacheFileBase64(
    std::string relativePath,
    std::string base64Content,
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  if (!IsSafeRelativeCachePath(relativePath)) {
    result.Reject("Path cache tidak valid.");
    return;
  }

  try {
    auto root = winrt::Windows::Storage::ApplicationData::Current().LocalCacheFolder();
    auto folderOp = root.CreateFolderAsync(
        L"kolam-images",
        winrt::Windows::Storage::CreationCollisionOption::OpenIfExists);
    folderOp.Completed(
        [result = std::move(result),
         base64Content = std::move(base64Content),
         relativePath](
            winrt::Windows::Foundation::IAsyncOperation<
                winrt::Windows::Storage::StorageFolder> const &operation,
            winrt::Windows::Foundation::AsyncStatus status) mutable {
          if (status != winrt::Windows::Foundation::AsyncStatus::Completed) {
            result.Reject("Folder cache tidak bisa dibuat.");
            return;
          }

          try {
            auto folder = operation.GetResults();
            auto createOp = folder.CreateFileAsync(
                winrt::to_hstring(relativePath),
                winrt::Windows::Storage::CreationCollisionOption::ReplaceExisting);
            createOp.Completed(
                [result = std::move(result),
                 base64Content = std::move(base64Content),
                 relativePath](
                    winrt::Windows::Foundation::IAsyncOperation<
                        winrt::Windows::Storage::StorageFile> const &fileOperation,
                    winrt::Windows::Foundation::AsyncStatus createStatus) mutable {
                  if (createStatus != winrt::Windows::Foundation::AsyncStatus::Completed) {
                    result.Reject("File cache tidak bisa dibuat.");
                    return;
                  }

                  try {
                    auto file = fileOperation.GetResults();
                    auto bytes = DecodeBase64(base64Content);
                    auto writeOp = winrt::Windows::Storage::FileIO::WriteBytesAsync(
                        file,
                        winrt::array_view<uint8_t const>(
                            bytes.data(), bytes.data() + bytes.size()));
                    writeOp.Completed(
                        [result = std::move(result), file, relativePath](
                            winrt::Windows::Foundation::IAsyncAction const &,
                            winrt::Windows::Foundation::AsyncStatus writeStatus) mutable {
                          if (writeStatus !=
                              winrt::Windows::Foundation::AsyncStatus::Completed) {
                            result.Reject("File cache tidak bisa ditulis.");
                            return;
                          }

                          const auto path = winrt::to_string(file.Path());
                          result.Resolve(::React::JSValueObject{
                              {"cancelled", false},
                              {"path", path},
                              {"relativePath", relativePath},
                              {"uri", ToFileUri(path)},
                              {"name", winrt::to_string(file.Name())},
                          });
                        });
                  } catch (winrt::hresult_error const &error) {
                    result.Reject(winrt::to_string(error.message()).c_str());
                  } catch (...) {
                    result.Reject("File cache tidak bisa ditulis.");
                  }
                });
          } catch (winrt::hresult_error const &error) {
            result.Reject(winrt::to_string(error.message()).c_str());
          } catch (...) {
            result.Reject("File cache tidak bisa dibuat.");
          }
        });
  } catch (winrt::hresult_error const &error) {
    result.Reject(winrt::to_string(error.message()).c_str());
  } catch (...) {
    result.Reject("Cache writer tidak bisa dibuka.");
  }
}

void CacheFileExists(
    std::string relativePath,
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  if (!IsSafeRelativeCachePath(relativePath)) {
    result.Resolve(::React::JSValueObject{{"exists", false}});
    return;
  }

  try {
    auto root = winrt::Windows::Storage::ApplicationData::Current().LocalCacheFolder();
    auto folderOp = root.CreateFolderAsync(
        L"kolam-images",
        winrt::Windows::Storage::CreationCollisionOption::OpenIfExists);
    folderOp.Completed(
        [result = std::move(result), relativePath](
            winrt::Windows::Foundation::IAsyncOperation<
                winrt::Windows::Storage::StorageFolder> const &operation,
            winrt::Windows::Foundation::AsyncStatus status) mutable {
          if (status != winrt::Windows::Foundation::AsyncStatus::Completed) {
            result.Resolve(::React::JSValueObject{{"exists", false}});
            return;
          }

          try {
            auto folder = operation.GetResults();
            auto tryGetOp = folder.TryGetItemAsync(winrt::to_hstring(relativePath));
            tryGetOp.Completed(
                [result = std::move(result)](
                    winrt::Windows::Foundation::IAsyncOperation<
                        winrt::Windows::Storage::IStorageItem> const &itemOperation,
                    winrt::Windows::Foundation::AsyncStatus itemStatus) mutable {
                  if (itemStatus != winrt::Windows::Foundation::AsyncStatus::Completed) {
                    result.Resolve(::React::JSValueObject{{"exists", false}});
                    return;
                  }

                  auto item = itemOperation.GetResults();
                  const bool exists =
                      item != nullptr &&
                      item.IsOfType(winrt::Windows::Storage::StorageItemTypes::File);
                  if (!exists) {
                    result.Resolve(::React::JSValueObject{{"exists", false}});
                    return;
                  }

                  const auto path = winrt::to_string(item.Path());
                  result.Resolve(::React::JSValueObject{
                      {"exists", true},
                      {"path", path},
                      {"uri", ToFileUri(path)},
                  });
                });
          } catch (...) {
            result.Resolve(::React::JSValueObject{{"exists", false}});
          }
        });
  } catch (...) {
    result.Resolve(::React::JSValueObject{{"exists", false}});
  }
}

void PickFileWithTypes(
    ::React::ReactPromise<::React::JSValueObject> &&result,
    winrt::Windows::Storage::Pickers::PickerLocationId startLocation,
    winrt::Windows::Storage::Pickers::PickerViewMode viewMode,
    std::initializer_list<wchar_t const *> extensions) noexcept {
  try {
    auto picker = winrt::Windows::Storage::Pickers::FileOpenPicker();
    picker.SuggestedStartLocation(startLocation);
    picker.ViewMode(viewMode);
    for (auto extension : extensions) {
      picker.FileTypeFilter().Append(extension);
    }

    auto hwnd = GetCurrentProcessWindow();
    if (hwnd) {
      auto initializeWithWindow{picker.as<::IInitializeWithWindow>()};
      initializeWithWindow->Initialize(hwnd);
    }

    auto asyncOp = picker.PickSingleFileAsync();
    asyncOp.Completed(
        [result = std::move(result)](
            winrt::Windows::Foundation::IAsyncOperation<winrt::Windows::Storage::StorageFile> const &operation,
            winrt::Windows::Foundation::AsyncStatus status) mutable {
          if (status != winrt::Windows::Foundation::AsyncStatus::Completed) {
            result.Resolve(CancelledResult());
            return;
          }

          auto file = operation.GetResults();
          if (!file) {
            result.Resolve(CancelledResult());
            return;
          }

          result.Resolve(FileResult(winrt::to_string(file.Path())));
        });
  } catch (winrt::hresult_error const &error) {
    result.Reject(winrt::to_string(error.message()).c_str());
  } catch (...) {
    result.Reject("File picker tidak bisa dibuka.");
  }
}
} // namespace

void SetKolamDroppedFilePath(std::wstring path, int screenX, int screenY) noexcept {
  const auto nativePath = winrt::to_string(path);
  const auto extension = GetExtension(nativePath);
  if (!IsImageExtension(extension)) {
    return;
  }

  std::lock_guard<std::mutex> lock(g_droppedFileMutex);
  g_droppedFilePath = nativePath;
  g_droppedFileScreenX = screenX;
  g_droppedFileScreenY = screenY;
  g_droppedFileHasPoint = true;
}

void KolamWindowsFilePicker::Initialize(
    winrt::Microsoft::ReactNative::ReactContext const &reactContext) noexcept {
  m_context = reactContext;
}

void KolamWindowsFilePicker::pickImage(
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  m_context.UIDispatcher().Post([result = std::move(result)]() mutable {
    PickFileWithTypes(std::move(result),
        winrt::Windows::Storage::Pickers::PickerLocationId::PicturesLibrary,
        winrt::Windows::Storage::Pickers::PickerViewMode::Thumbnail,
        {L".png", L".jpg", L".jpeg", L".webp", L".gif", L".svg"});
  });
}

void KolamWindowsFilePicker::pickVideo(
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  m_context.UIDispatcher().Post([result = std::move(result)]() mutable {
    PickFileWithTypes(std::move(result),
        winrt::Windows::Storage::Pickers::PickerLocationId::VideosLibrary,
        winrt::Windows::Storage::Pickers::PickerViewMode::Thumbnail,
        {L".mp4", L".mov", L".webm"});
  });
}

void KolamWindowsFilePicker::pickAudio(
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  m_context.UIDispatcher().Post([result = std::move(result)]() mutable {
    PickFileWithTypes(std::move(result),
        winrt::Windows::Storage::Pickers::PickerLocationId::MusicLibrary,
        winrt::Windows::Storage::Pickers::PickerViewMode::List,
        {L".mp3", L".wav", L".m4a", L".aac"});
  });
}


void KolamWindowsFilePicker::pickFile(
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  m_context.UIDispatcher().Post([result = std::move(result)]() mutable {
    PickFileWithTypes(std::move(result),
        winrt::Windows::Storage::Pickers::PickerLocationId::DocumentsLibrary,
        winrt::Windows::Storage::Pickers::PickerViewMode::List,
        {
            L".pdf",
            L".doc",
            L".docx",
            L".xls",
            L".xlsx",
            L".png",
            L".jpg",
            L".jpeg",
            L".webp",
            L".gif",
            L".svg",
            L".mp4",
            L".mov",
            L".webm",
            L".mp3",
            L".wav",
            L".m4a",
            L".aac",
        });
  });
}

void KolamWindowsFilePicker::readSvgPreviewFile(
    std::string pathOrUri,
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  m_context.UIDispatcher().Post([
      pathOrUri = std::move(pathOrUri),
      result = std::move(result)]() mutable {
    try {
      const auto nativePath = DecodeFileUri(pathOrUri);
      if (!IsSvgExtension(GetExtension(nativePath))) {
        result.Resolve(::React::JSValueObject{{"ok", false}});
        return;
      }

      auto fileOperation = winrt::Windows::Storage::StorageFile::GetFileFromPathAsync(
          winrt::to_hstring(nativePath));
      fileOperation.Completed([
          result = std::move(result)](
          winrt::Windows::Foundation::IAsyncOperation<winrt::Windows::Storage::StorageFile> const &operation,
          winrt::Windows::Foundation::AsyncStatus status) mutable {
        if (status != winrt::Windows::Foundation::AsyncStatus::Completed) {
          result.Resolve(::React::JSValueObject{{"ok", false}});
          return;
        }

        auto file = operation.GetResults();
        auto propsOperation = file.GetBasicPropertiesAsync();
        propsOperation.Completed([
            file,
            result = std::move(result)](
            winrt::Windows::Foundation::IAsyncOperation<winrt::Windows::Storage::FileProperties::BasicProperties> const &props,
            winrt::Windows::Foundation::AsyncStatus propsStatus) mutable {
          if (propsStatus != winrt::Windows::Foundation::AsyncStatus::Completed ||
              props.GetResults().Size() > kMaxSvgPreviewBytes) {
            result.Resolve(::React::JSValueObject{{"ok", false}});
            return;
          }

          auto readOperation = winrt::Windows::Storage::FileIO::ReadTextAsync(file);
          readOperation.Completed([
              result = std::move(result)](
              winrt::Windows::Foundation::IAsyncOperation<winrt::hstring> const &read,
              winrt::Windows::Foundation::AsyncStatus readStatus) mutable {
            if (readStatus != winrt::Windows::Foundation::AsyncStatus::Completed) {
              result.Resolve(::React::JSValueObject{{"ok", false}});
              return;
            }

            const auto text = winrt::to_string(read.GetResults());
            if (text.find("<svg") == std::string::npos) {
              result.Resolve(::React::JSValueObject{{"ok", false}});
              return;
            }

            result.Resolve(::React::JSValueObject{
                {"ok", true},
                {"text", text},
            });
          });
        });
      });
    } catch (...) {
      result.Resolve(::React::JSValueObject{{"ok", false}});
    }
  });
}

void KolamWindowsFilePicker::peekDroppedImage(
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  m_context.UIDispatcher().Post([result = std::move(result)]() mutable {
    std::string path;
    int screenX = 0;
    int screenY = 0;
    bool hasPoint = false;
    {
      std::lock_guard<std::mutex> lock(g_droppedFileMutex);
      path = g_droppedFilePath;
      screenX = g_droppedFileScreenX;
      screenY = g_droppedFileScreenY;
      hasPoint = g_droppedFileHasPoint;
    }

    if (path.empty()) {
      result.Resolve(CancelledResult());
      return;
    }

    result.Resolve(DroppedFileResult(path, hasPoint, screenX, screenY));
  });
}

void KolamWindowsFilePicker::consumeDroppedImage(
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  m_context.UIDispatcher().Post([result = std::move(result)]() mutable {
    std::string path;
    int screenX = 0;
    int screenY = 0;
    bool hasPoint = false;
    {
      std::lock_guard<std::mutex> lock(g_droppedFileMutex);
      path = std::move(g_droppedFilePath);
      g_droppedFilePath.clear();
      screenX = g_droppedFileScreenX;
      screenY = g_droppedFileScreenY;
      hasPoint = g_droppedFileHasPoint;
      g_droppedFileScreenX = 0;
      g_droppedFileScreenY = 0;
      g_droppedFileHasPoint = false;
    }

    if (path.empty()) {
      result.Resolve(CancelledResult());
      return;
    }

    result.Resolve(DroppedFileResult(path, hasPoint, screenX, screenY));
  });
}

void KolamWindowsFilePicker::saveFileBase64(
    std::string suggestedName,
    std::string base64Content,
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  m_context.UIDispatcher().Post([
      suggestedName = std::move(suggestedName),
      base64Content = std::move(base64Content),
      result = std::move(result)]() mutable {
    SaveBase64File(std::move(suggestedName), std::move(base64Content), std::move(result));
  });
}

void KolamWindowsFilePicker::writeCacheFileBase64(
    std::string relativePath,
    std::string base64Content,
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  m_context.UIDispatcher().Post([
      relativePath = std::move(relativePath),
      base64Content = std::move(base64Content),
      result = std::move(result)]() mutable {
    WriteCacheFileBase64(
        std::move(relativePath), std::move(base64Content), std::move(result));
  });
}

void KolamWindowsFilePicker::cacheFileExists(
    std::string relativePath,
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  m_context.UIDispatcher().Post([
      relativePath = std::move(relativePath),
      result = std::move(result)]() mutable {
    CacheFileExists(std::move(relativePath), std::move(result));
  });
}

} // namespace KolamWindows
