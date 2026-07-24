#include "pch.h"
#include "KolamWindowsFilePicker.h"

#include <Shobjidl.h>
#include <algorithm>
#include <cstdint>
#include <vector>
#include <string>
#include <winrt/Windows.Foundation.Collections.h>
#include <winrt/Windows.Storage.Pickers.h>
#include <winrt/Windows.Storage.h>

namespace KolamWindows {
namespace {

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
    picker.SuggestedFileName(winrt::to_hstring(SanitizeSuggestedName(suggestedName)));
    auto extensions = winrt::single_threaded_vector<winrt::hstring>();
    extensions.Append(L".xlsx");
    picker.FileTypeChoices().Insert(L"Excel Workbook", extensions);

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

          const auto path = winrt::to_string(file.Path());
          const auto name = winrt::to_string(file.Name());
          const auto extension = GetExtension(name);

          result.Resolve(::React::JSValueObject{
              {"cancelled", false},
              {"path", path},
              {"uri", ToFileUri(path)},
              {"name", name},
              {"extension", extension},
              {"mimeType", GetMimeType(extension)},
          });
        });
  } catch (winrt::hresult_error const &error) {
    result.Reject(winrt::to_string(error.message()).c_str());
  } catch (...) {
    result.Reject("File picker tidak bisa dibuka.");
  }
}
} // namespace

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
        {L".png", L".jpg", L".jpeg", L".webp", L".gif"});
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
        {L".pdf", L".doc", L".docx", L".xls", L".xlsx", L".png", L".jpg", L".jpeg"});
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

} // namespace KolamWindows
