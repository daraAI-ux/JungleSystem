// KolamWindows.cpp : Defines the entry point for the application.
//

#include "pch.h"
#include "KolamWindows.h"
#include "KolamWindowsDeviceIdentity.h"
#include "KolamWindowsFilePicker.h"
#include "KolamWindowsNotificationSound.h"
#include "KolamWindowsSQLiteStore.h"
#include "KolamWindowsSecureTokenStore.h"

#include "AutolinkedNativeModules.g.h"

#include "NativeModules.h"

#include <shellapi.h>

namespace {

WNDPROC g_kolamPreviousWndProc = nullptr;

LRESULT CALLBACK KolamWindowProc(HWND hwnd, UINT message, WPARAM wParam, LPARAM lParam) {
  if (message == WM_DROPFILES) {
    auto drop = reinterpret_cast<HDROP>(wParam);
    WCHAR path[MAX_PATH]{};
    if (DragQueryFileW(drop, 0, path, MAX_PATH) > 0) {
      KolamWindows::SetKolamDroppedFilePath(path);
    }
    DragFinish(drop);
    return 0;
  }

  return CallWindowProc(g_kolamPreviousWndProc, hwnd, message, wParam, lParam);
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

HWND GetKolamMainWindow() {
  HWND hwnd = nullptr;
  EnumWindows(FindCurrentProcessWindow, reinterpret_cast<LPARAM>(&hwnd));
  return hwnd;
}

void EnableKolamFileDrop() {
  auto hwnd = GetKolamMainWindow();
  if (!hwnd || g_kolamPreviousWndProc) {
    return;
  }

  DragAcceptFiles(hwnd, TRUE);
  g_kolamPreviousWndProc =
      reinterpret_cast<WNDPROC>(SetWindowLongPtr(hwnd, GWLP_WNDPROC, reinterpret_cast<LONG_PTR>(KolamWindowProc)));
}

} // namespace

// A PackageProvider containing any turbo modules you define within this app project
struct CompReactPackageProvider
    : winrt::implements<CompReactPackageProvider, winrt::Microsoft::ReactNative::IReactPackageProvider> {
 public: // IReactPackageProvider
  void CreatePackage(winrt::Microsoft::ReactNative::IReactPackageBuilder const &packageBuilder) noexcept {
    AddAttributedModules(packageBuilder, true);
  }
};

// The entry point of the Win32 application
_Use_decl_annotations_ int CALLBACK WinMain(HINSTANCE instance, HINSTANCE, PSTR /* commandLine */, int showCmd) {
  // Initialize WinRT
  winrt::init_apartment(winrt::apartment_type::single_threaded);

  // Enable per monitor DPI scaling
  SetProcessDpiAwarenessContext(DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2);

  // Find the path hosting the app exe file
  WCHAR appDirectory[MAX_PATH];
  GetModuleFileNameW(NULL, appDirectory, MAX_PATH);
  PathCchRemoveFileSpec(appDirectory, MAX_PATH);

  // Create a ReactNativeWin32App with the ReactNativeAppBuilder
  auto reactNativeWin32App{winrt::Microsoft::ReactNative::ReactNativeAppBuilder().Build()};

  // Configure the initial InstanceSettings for the app's ReactNativeHost
  auto settings{reactNativeWin32App.ReactNativeHost().InstanceSettings()};
  // Register any autolinked native modules
  RegisterAutolinkedNativeModulePackages(settings.PackageProviders());
  // Register any native modules defined within this app project
  settings.PackageProviders().Append(winrt::make<CompReactPackageProvider>());

#if BUNDLE
  // Load the JS bundle from a file (not Metro):
  // Set the path (on disk) where the .bundle file is located
  settings.BundleRootPath(std::wstring(L"file://").append(appDirectory).append(L"\\Bundle\\").c_str());
  // Set the name of the bundle file (without the .bundle extension)
  settings.JavaScriptBundleFile(L"index.windows");
  // Disable hot reload
  settings.UseFastRefresh(false);
#else
  // Load the JS bundle from Metro
  settings.JavaScriptBundleFile(L"index");
  // Enable hot reload
  settings.UseFastRefresh(true);
#endif
#if _DEBUG
  // For Debug builds
  // Enable Direct Debugging of JS
  settings.UseDirectDebugger(true);
  // Enable the Developer Menu
  settings.UseDeveloperSupport(true);
#else
  // For Release builds:
  // Disable Direct Debugging of JS
  settings.UseDirectDebugger(false);
  // Disable the Developer Menu
  settings.UseDeveloperSupport(false);
#endif

  // Get the AppWindow so we can configure its initial title and size
  auto appWindow{reactNativeWin32App.AppWindow()};
  appWindow.Title(L"JungleSystem");
  appWindow.Resize({1800, 1000});
  if (auto presenter = appWindow.Presenter().try_as<winrt::Microsoft::UI::Windowing::OverlappedPresenter>()) {
    presenter.Maximize();
  }
  EnableKolamFileDrop();

  // Get the ReactViewOptions so we can set the initial RN component to load
  auto viewOptions{reactNativeWin32App.ReactViewOptions()};
  viewOptions.ComponentName(L"JungleSystem");

  // Start the app
  reactNativeWin32App.Start();
}
