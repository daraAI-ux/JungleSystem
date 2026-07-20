#include "pch.h"
#include "KolamWindowsFilePicker.h"

#include <Shobjidl.h>
#include <algorithm>
#include <string>
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
  if (extension == ".webp") return "image/webp";
  if (extension == ".gif") return "image/gif";
  if (extension == ".mp4") return "video/mp4";
  if (extension == ".mov") return "video/quicktime";
  if (extension == ".webm") return "video/webm";
  if (extension == ".mp3") return "audio/mpeg";
  if (extension == ".wav") return "audio/wav";
  if (extension == ".m4a") return "audio/mp4";
  if (extension == ".aac") return "audio/aac";

  return "image/jpeg";
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

} // namespace KolamWindows

