#include "pch.h"
#include "KolamWindowsToastNotification.h"

#include <algorithm>
#include <functional>
#include <mutex>
#include <shellapi.h>
#include <string>
#include <vector>
#include <tlhelp32.h>

#include <winrt/Microsoft.Windows.AppNotifications.h>
#include <winrt/Windows.ApplicationModel.h>
#include <winrt/Windows.Data.Xml.Dom.h>
#include <winrt/Windows.Foundation.h>
#include <winrt/Windows.UI.Notifications.h>

#include <atomic>
#include <pathcch.h>
#include <propkey.h>
#include <propsys.h>
#include <propvarutil.h>
#include <shlobj.h>
#include <shobjidl.h>

namespace KolamWindows {
namespace {

std::mutex g_toastMutex;
std::atomic_bool g_appNotificationsRegistered{false};
std::atomic_bool g_appNotificationInvoked{false};
HANDLE g_instanceMutex = nullptr;

std::wstring GetKolamToastDirectory();
bool WriteUtf8File(std::wstring const &path, std::string const &bytes);
std::string WideToUtf8(std::wstring const &value);
std::string SanitizeLaunchPart(std::string value);

constexpr wchar_t kToastActivatorClsid[] =
    L"{8F3C2A91-6D47-4E1B-B9C0-2E7A4D15C8F3}";
constexpr wchar_t kUnpackagedAppUserModelId[] = L"JungleSystem";

void RegisterKolamAppNotificationsImpl() noexcept;

struct ToastSession {
  winrt::Windows::UI::Notifications::ToastNotification toast{nullptr};
  winrt::Windows::UI::Notifications::ToastNotification::Activated_revoker activated;
  winrt::Windows::UI::Notifications::ToastNotification::Dismissed_revoker dismissed;
};

std::vector<std::shared_ptr<ToastSession>> g_toastSessions;

std::string ReadString(::React::JSValueObject const &options, char const *key) {
  auto it = options.find(key);
  if (it == options.end() || it->second.Type() != ::React::JSValueType::String) {
    return {};
  }

  return it->second.AsString();
}

std::string XmlEscape(std::string value) {
  std::string escaped;
  escaped.reserve(value.size());
  for (char ch : value) {
    switch (ch) {
      case '&':
        escaped += "&amp;";
        break;
      case '<':
        escaped += "&lt;";
        break;
      case '>':
        escaped += "&gt;";
        break;
      case '"':
        escaped += "&quot;";
        break;
      case '\'':
        escaped += "&apos;";
        break;
      default:
        if (static_cast<unsigned char>(ch) >= 32 || ch == '\n' || ch == '\t') {
          escaped += ch;
        }
        break;
    }
  }
  return escaped;
}

std::string SanitizeLaunchPart(std::string value) {
  std::string sanitized;
  sanitized.reserve(value.size());
  for (char ch : value) {
    if (ch == '|' || ch == '<' || ch == '>' || ch == '"' || ch == '\'' || ch < 32) {
      continue;
    }
    sanitized += ch;
  }
  return sanitized;
}

HWND FindKolamMainWindow() {
  HWND hwnd = nullptr;
  EnumWindows(
      [](HWND candidate, LPARAM lParam) -> BOOL {
        DWORD processId = 0;
        GetWindowThreadProcessId(candidate, &processId);
        if (processId != GetCurrentProcessId() || !IsWindowVisible(candidate)) {
          return TRUE;
        }

        *reinterpret_cast<HWND *>(lParam) = candidate;
        return FALSE;
      },
      reinterpret_cast<LPARAM>(&hwnd));
  return hwnd;
}

void FocusWindow(HWND hwnd) {
  if (!hwnd) {
    return;
  }

  if (IsIconic(hwnd)) {
    ShowWindow(hwnd, SW_RESTORE);
  }

  DWORD otherThread = GetWindowThreadProcessId(hwnd, nullptr);
  DWORD thisThread = GetCurrentThreadId();
  if (otherThread && otherThread != thisThread) {
    AttachThreadInput(thisThread, otherThread, TRUE);
  }
  SetForegroundWindow(hwnd);
  BringWindowToTop(hwnd);
  if (otherThread && otherThread != thisThread) {
    AttachThreadInput(thisThread, otherThread, FALSE);
  }
}

void FocusKolamWindow() {
  FocusWindow(FindKolamMainWindow());
}

HWND FindOtherJungleSystemWindow() {
  struct State {
    DWORD currentPid;
    HWND hwnd;
  } state{GetCurrentProcessId(), nullptr};

  EnumWindows(
      [](HWND candidate, LPARAM lParam) -> BOOL {
        auto *state = reinterpret_cast<State *>(lParam);
        DWORD processId = 0;
        GetWindowThreadProcessId(candidate, &processId);
        if (processId == state->currentPid || !IsWindowVisible(candidate)) {
          return TRUE;
        }

        wchar_t title[256]{};
        GetWindowTextW(candidate, title, ARRAYSIZE(title));
        if (_wcsicmp(title, L"JungleSystem") != 0) {
          return TRUE;
        }

        state->hwnd = candidate;
        return FALSE;
      },
      reinterpret_cast<LPARAM>(&state));
  return state.hwnd;
}

void FocusOtherJungleSystemWindow() {
  FocusWindow(FindOtherJungleSystemWindow());
}

std::string TrimAscii(std::string value) {
  while (!value.empty() &&
         (value.front() == ' ' || value.front() == '"' || value.front() == '\'' ||
          value.front() == '\t' || value.front() == '\r' || value.front() == '\n')) {
    value.erase(value.begin());
  }
  while (!value.empty() &&
         (value.back() == ' ' || value.back() == '"' || value.back() == '\'' ||
          value.back() == '\t' || value.back() == '\r' || value.back() == '\n')) {
    value.pop_back();
  }
  return value;
}

bool ParseActivationText(
    std::string raw,
    std::string &stream,
    std::string &targetId) {
  raw = TrimAscii(std::move(raw));
  if (raw.empty()) {
    return false;
  }

  auto assignParts = [&](std::string nextStream, std::string nextTarget) {
    nextStream = SanitizeLaunchPart(std::move(nextStream));
    nextTarget = SanitizeLaunchPart(std::move(nextTarget));
    auto cut = nextTarget.find_first_of(" \t\"'?#&");
    if (cut != std::string::npos) {
      nextTarget.resize(cut);
    }
    if ((nextStream != "inbox" && nextStream != "team-chat") || nextTarget.empty()) {
      return false;
    }
    stream = std::move(nextStream);
    targetId = std::move(nextTarget);
    return true;
  };

  auto uri = raw.find("junglesystem://chat/");
  if (uri == std::string::npos) {
    uri = raw.find("junglesystem:chat/");
    if (uri != std::string::npos) {
      raw = raw.substr(uri + 18);
    }
  } else {
    raw = raw.substr(uri + 20);
  }

  if (uri != std::string::npos) {
    if (raw.rfind("team-chat/", 0) == 0) {
      return assignParts("team-chat", raw.substr(10));
    }
    if (raw.rfind("inbox/", 0) == 0) {
      return assignParts("inbox", raw.substr(6));
    }
    return false;
  }

  auto pipe = TrimAscii(raw);
  if (pipe.rfind("kolam-chat|", 0) == 0) {
    pipe = pipe.substr(11);
  }
  auto separator = pipe.find('|');
  if (separator == std::string::npos) {
    return false;
  }
  return assignParts(pipe.substr(0, separator), pipe.substr(separator + 1));
}

std::string ReadUtf8File(std::wstring const &path) {
  HANDLE file = CreateFileW(
      path.c_str(),
      GENERIC_READ,
      FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE,
      nullptr,
      OPEN_EXISTING,
      FILE_ATTRIBUTE_NORMAL,
      nullptr);
  if (file == INVALID_HANDLE_VALUE) {
    return {};
  }

  LARGE_INTEGER size{};
  if (!GetFileSizeEx(file, &size) || size.QuadPart <= 0 || size.QuadPart > 4096) {
    CloseHandle(file);
    return {};
  }

  std::string bytes(static_cast<size_t>(size.QuadPart), '\0');
  DWORD read = 0;
  BOOL ok = ReadFile(
      file,
      bytes.data(),
      static_cast<DWORD>(bytes.size()),
      &read,
      nullptr);
  CloseHandle(file);
  if (!ok) {
    return {};
  }
  bytes.resize(read);
  return bytes;
}

bool WritePendingActivation(std::string const &stream, std::string const &targetId) {
  auto directory = GetKolamToastDirectory();
  if (directory.empty()) {
    return false;
  }

  return WriteUtf8File(
      directory + L"\\pending-activation.txt", stream + "|" + targetId);
}

bool TakePendingActivation(std::string &stream, std::string &targetId) {
  auto directory = GetKolamToastDirectory();
  if (directory.empty()) {
    return false;
  }

  auto path = directory + L"\\pending-activation.txt";
  auto bytes = ReadUtf8File(path);
  DeleteFileW(path.c_str());
  return ParseActivationText(bytes, stream, targetId);
}

bool WritePendingFromLaunch(std::string const &launch) {
  std::string stream;
  std::string targetId;
  if (!ParseActivationText(launch, stream, targetId)) {
    return false;
  }
  return WritePendingActivation(stream, targetId);
}

void CaptureCommandLineActivation() {
  std::wstring commandLine = GetCommandLineW() ? GetCommandLineW() : L"";
  WritePendingFromLaunch(WideToUtf8(commandLine));

  int argc = 0;
  LPWSTR *argv = CommandLineToArgvW(commandLine.c_str(), &argc);
  if (!argv) {
    return;
  }

  for (int index = 1; index < argc; ++index) {
    WritePendingFromLaunch(WideToUtf8(argv[index]));
  }
  LocalFree(argv);
}

void ForgetToastSession(std::shared_ptr<ToastSession> const &session) {
  std::scoped_lock lock(g_toastMutex);
  g_toastSessions.erase(
      std::remove(g_toastSessions.begin(), g_toastSessions.end(), session),
      g_toastSessions.end());
}

void EmitToastActivated(
    std::function<void(::React::JSValueObject const &)> const &event,
    std::string stream,
    std::string targetId) {
  if (!event) {
    return;
  }

  ::React::JSValueObject payload;
  payload["stream"] = stream;
  payload["targetId"] = targetId;
  event(payload);
}

::React::JSValueObject ShownResult(std::string tag) {
  return ::React::JSValueObject{{"status", "shown"}, {"tag", tag}};
}

bool IsPackagedProcess() {
  try {
    auto id =
        winrt::Windows::ApplicationModel::AppInfo::Current().AppUserModelId();
    return !id.empty();
  } catch (...) {
    return false;
  }
}

winrt::hstring ResolveKolamAppUserModelId() {
  try {
    auto id =
        winrt::Windows::ApplicationModel::AppInfo::Current().AppUserModelId();
    if (!id.empty()) {
      return id;
    }
  } catch (...) {
  }

  return kUnpackagedAppUserModelId;
}

void EnsureKolamToastShortcut(winrt::hstring const &aumid) {
  if (aumid.empty()) {
    return;
  }

  PWSTR programs = nullptr;
  if (FAILED(SHGetKnownFolderPath(FOLDERID_Programs, 0, nullptr, &programs)) ||
      !programs) {
    return;
  }

  std::wstring shortcutPath(programs);
  CoTaskMemFree(programs);
  shortcutPath += L"\\JungleSystem.lnk";

  wchar_t exePath[MAX_PATH]{};
  if (!GetModuleFileNameW(nullptr, exePath, MAX_PATH)) {
    return;
  }

  wchar_t workingDirectory[MAX_PATH]{};
  wcsncpy_s(workingDirectory, exePath, _TRUNCATE);
  PathCchRemoveFileSpec(workingDirectory, MAX_PATH);

  winrt::com_ptr<IShellLinkW> link;
  if (FAILED(CoCreateInstance(
          CLSID_ShellLink,
          nullptr,
          CLSCTX_INPROC_SERVER,
          IID_PPV_ARGS(link.put())))) {
    return;
  }

  link->SetPath(exePath);
  link->SetWorkingDirectory(workingDirectory);
  link->SetDescription(L"JungleSystem");

  winrt::com_ptr<IPropertyStore> store;
  if (FAILED(link->QueryInterface(IID_PPV_ARGS(store.put())))) {
    return;
  }

  PROPVARIANT appId{};
  if (SUCCEEDED(InitPropVariantFromString(aumid.c_str(), &appId))) {
    store->SetValue(PKEY_AppUserModel_ID, appId);
    PropVariantClear(&appId);
  }

  CLSID activator{};
  PROPVARIANT clsid{};
  if (SUCCEEDED(CLSIDFromString(kToastActivatorClsid, &activator)) &&
      SUCCEEDED(InitPropVariantFromCLSID(activator, &clsid))) {
    store->SetValue(PKEY_AppUserModel_ToastActivatorCLSID, clsid);
    PropVariantClear(&clsid);
  }

  store->Commit();

  winrt::com_ptr<IPersistFile> persist;
  if (FAILED(link->QueryInterface(IID_PPV_ARGS(persist.put())))) {
    return;
  }

  persist->Save(shortcutPath.c_str(), TRUE);
}

winrt::Windows::UI::Notifications::ToastNotifier CreateKolamToastNotifier() {
  if (IsPackagedProcess()) {
    return winrt::Windows::UI::Notifications::ToastNotificationManager::
        CreateToastNotifier();
  }

  return winrt::Windows::UI::Notifications::ToastNotificationManager::
      CreateToastNotifier(kUnpackagedAppUserModelId);
}

std::string JsonEscape(std::string value) {
  std::string escaped;
  escaped.reserve(value.size() + 8);
  for (unsigned char ch : value) {
    switch (ch) {
      case '\\':
        escaped += "\\\\";
        break;
      case '"':
        escaped += "\\\"";
        break;
      case '\n':
        escaped += "\\n";
        break;
      case '\r':
        escaped += "\\r";
        break;
      case '\t':
        escaped += "\\t";
        break;
      default:
        if (ch < 32) {
          break;
        }
        escaped += static_cast<char>(ch);
        break;
    }
  }
  return escaped;
}

std::wstring GetRealPath(std::wstring const &path) {
  HANDLE handle = CreateFileW(
      path.c_str(),
      FILE_READ_ATTRIBUTES,
      FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE,
      nullptr,
      OPEN_EXISTING,
      FILE_FLAG_BACKUP_SEMANTICS,
      nullptr);
  if (handle == INVALID_HANDLE_VALUE) {
    return path;
  }

  wchar_t buffer[MAX_PATH * 4]{};
  DWORD length = GetFinalPathNameByHandleW(
      handle, buffer, ARRAYSIZE(buffer), FILE_NAME_NORMALIZED);
  CloseHandle(handle);
  if (length == 0 || length >= ARRAYSIZE(buffer)) {
    return path;
  }

  std::wstring real(buffer, length);
  if (real.rfind(L"\\\\?\\", 0) == 0) {
    real.erase(0, 4);
  }
  return real;
}

std::wstring GetKolamToastDirectory() {
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
  auto directory = localAppData + L"\\JungleSystemToast";
  SHCreateDirectoryExW(nullptr, directory.c_str(), nullptr);
  return GetRealPath(directory);
}

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

bool RunHiddenProcess(
    std::wstring const &application,
    std::wstring &command,
    DWORD timeoutMs,
    DWORD *exitCode) {
  STARTUPINFOW startup{};
  startup.cb = sizeof(startup);
  startup.dwFlags = STARTF_USESHOWWINDOW;
  startup.wShowWindow = SW_HIDE;
  PROCESS_INFORMATION process{};
  if (!CreateProcessW(
          application.c_str(),
          command.data(),
          nullptr,
          nullptr,
          FALSE,
          CREATE_NO_WINDOW | CREATE_UNICODE_ENVIRONMENT,
          nullptr,
          nullptr,
          &startup,
          &process)) {
    return false;
  }

  WaitForSingleObject(process.hProcess, timeoutMs);
  if (exitCode) {
    GetExitCodeProcess(process.hProcess, exitCode);
  }
  CloseHandle(process.hThread);
  CloseHandle(process.hProcess);
  return true;
}

bool WaitForHelperResult(std::wstring const &path, DWORD timeoutMs) {
  DWORD started = GetTickCount();
  while (GetTickCount() - started < timeoutMs) {
    if (GetFileAttributesW(path.c_str()) != INVALID_FILE_ATTRIBUTES) {
      return true;
    }
    Sleep(50);
  }
  return GetFileAttributesW(path.c_str()) != INVALID_FILE_ATTRIBUTES;
}

bool WriteUtf8File(std::wstring const &path, std::string const &bytes) {
  HANDLE file = CreateFileW(
      path.c_str(),
      GENERIC_WRITE,
      FILE_SHARE_READ,
      nullptr,
      CREATE_ALWAYS,
      FILE_ATTRIBUTE_NORMAL,
      nullptr);
  if (file == INVALID_HANDLE_VALUE) {
    return false;
  }

  DWORD written = 0;
  BOOL ok = WriteFile(
      file,
      bytes.data(),
      static_cast<DWORD>(bytes.size()),
      &written,
      nullptr);
  CloseHandle(file);
  return ok && written == bytes.size();
}

void WriteToastLog(std::wstring const &directory, std::string const &line) {
  if (directory.empty()) {
    return;
  }

  auto path = directory + L"\\toast-last.log";
  HANDLE file = CreateFileW(
      path.c_str(),
      FILE_APPEND_DATA,
      FILE_SHARE_READ,
      nullptr,
      OPEN_ALWAYS,
      FILE_ATTRIBUTE_NORMAL,
      nullptr);
  if (file == INVALID_HANDLE_VALUE) {
    return;
  }

  auto text = line + "\r\n";
  DWORD written = 0;
  WriteFile(
      file,
      text.data(),
      static_cast<DWORD>(text.size()),
      &written,
      nullptr);
  CloseHandle(file);
}

DWORD FindExplorerProcessId() {
  DWORD currentSession = 0;
  ProcessIdToSessionId(GetCurrentProcessId(), &currentSession);

  HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
  if (snapshot == INVALID_HANDLE_VALUE) {
    return 0;
  }

  PROCESSENTRY32W entry{};
  entry.dwSize = sizeof(entry);
  DWORD result = 0;
  if (Process32FirstW(snapshot, &entry)) {
    do {
      if (_wcsicmp(entry.szExeFile, L"explorer.exe") != 0) {
        continue;
      }

      DWORD session = 0;
      if (!ProcessIdToSessionId(entry.th32ProcessID, &session) ||
          session != currentSession) {
        continue;
      }

      result = entry.th32ProcessID;
      break;
    } while (Process32NextW(snapshot, &entry));
  }

  CloseHandle(snapshot);
  return result;
}

bool CreateProcessAsExplorerChild(
    std::wstring const &application,
    std::wstring &command,
    std::wstring const &directory) {
  DWORD explorerPid = FindExplorerProcessId();
  if (!explorerPid) {
    return false;
  }

  HANDLE explorer = OpenProcess(
      PROCESS_CREATE_PROCESS | PROCESS_QUERY_LIMITED_INFORMATION,
      FALSE,
      explorerPid);
  if (!explorer) {
    return false;
  }

  SIZE_T attributeSize = 0;
  InitializeProcThreadAttributeList(nullptr, 1, 0, &attributeSize);
  auto attributes = static_cast<LPPROC_THREAD_ATTRIBUTE_LIST>(
      HeapAlloc(GetProcessHeap(), 0, attributeSize));
  if (!attributes) {
    CloseHandle(explorer);
    return false;
  }

  bool created = false;
  if (InitializeProcThreadAttributeList(attributes, 1, 0, &attributeSize)) {
    if (UpdateProcThreadAttribute(
            attributes,
            0,
            PROC_THREAD_ATTRIBUTE_PARENT_PROCESS,
            &explorer,
            sizeof(explorer),
            nullptr,
            nullptr)) {
      STARTUPINFOEXW startup{};
      startup.StartupInfo.cb = sizeof(startup);
      startup.StartupInfo.dwFlags = STARTF_USESHOWWINDOW;
      startup.StartupInfo.wShowWindow = SW_HIDE;
      startup.lpAttributeList = attributes;

      PROCESS_INFORMATION process{};
      created = CreateProcessW(
                    application.c_str(),
                    command.data(),
                    nullptr,
                    nullptr,
                    FALSE,
                    CREATE_NO_WINDOW | CREATE_UNICODE_ENVIRONMENT |
                        EXTENDED_STARTUPINFO_PRESENT,
                    nullptr,
                    directory.empty() ? nullptr : directory.c_str(),
                    &startup.StartupInfo,
                    &process) != FALSE;
      if (created) {
        CloseHandle(process.hThread);
        CloseHandle(process.hProcess);
      }
    }

    DeleteProcThreadAttributeList(attributes);
  }

  HeapFree(GetProcessHeap(), 0, attributes);
  CloseHandle(explorer);
  return created;
}

bool EnsureUnpackagedToastScript(std::wstring const &directory) {
  static constexpr char const kScript[] = R"PS(param([Parameter(Mandatory=$true)][string]$PayloadPath)
$ErrorActionPreference = "Stop"
$logPath = Join-Path $PSScriptRoot "toast-helper-result.txt"
function Write-ToastHelperLog([string]$message) {
  ("{0} {1}" -f (Get-Date -Format o), $message) | Set-Content -LiteralPath $logPath -Encoding UTF8
}
try {
  Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public static class JungleToastAumid {
  [DllImport("shell32.dll", CharSet=CharSet.Unicode, PreserveSig=false)]
  public static extern void SetCurrentProcessExplicitAppUserModelID(string AppID);
}
"@
  [JungleToastAumid]::SetCurrentProcessExplicitAppUserModelID("JungleSystem")
  $payload = Get-Content -LiteralPath $PayloadPath -Raw -Encoding UTF8 | ConvertFrom-Json
  function Escape-ToastXml([string]$value) {
    if ([string]::IsNullOrEmpty($value)) { return "" }
    return (($value -replace "&","&amp;") -replace "<","&lt;" -replace ">","&gt;" -replace '"','&quot;')
  }
  $launch = "junglesystem://chat/" + [string]$payload.stream + "/" + [string]$payload.targetId
  $xmlText = "<toast activationType=`"protocol`" launch=`"" + (Escape-ToastXml $launch) + "`"><visual><binding template=`"ToastGeneric`"><text>" + (Escape-ToastXml ([string]$payload.title)) + "</text><text>" + (Escape-ToastXml ([string]$payload.body)) + "</text></binding></visual><audio silent=`"true`"/></toast>"
  [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
  [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
  $document = New-Object Windows.Data.Xml.Dom.XmlDocument
  $document.LoadXml($xmlText)
  $toast = [Windows.UI.Notifications.ToastNotification]::new($document)
  if ($payload.tag) {
    $toast.Tag = [string]$payload.tag
    $toast.Group = "kolam-chat"
  }
  [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("JungleSystem").Show($toast)
  Write-ToastHelperLog "shown"
} catch {
  Write-ToastHelperLog ("error " + $_.Exception.Message)
  throw
}
)PS";

  return WriteUtf8File(directory + L"\\show-junglesystem-toast.ps1", kScript);
}

bool SpawnUnpackagedJungleToast(
    std::string const &title,
    std::string const &body,
    std::string const &tag,
    std::string const &stream,
    std::string const &targetId) {
  auto directory = GetKolamToastDirectory();
  if (directory.empty()) {
    return false;
  }

  if (!EnsureUnpackagedToastScript(directory)) {
    WriteToastLog(directory, "script write failed");
    return false;
  }

  auto payload = std::string("{\"title\":\"") + JsonEscape(title) +
                 "\",\"body\":\"" + JsonEscape(body) + "\",\"tag\":\"" +
                 JsonEscape(tag) + "\",\"stream\":\"" + JsonEscape(stream) +
                 "\",\"targetId\":\"" + JsonEscape(targetId) + "\"}";
  auto payloadPath = directory + L"\\toast-payload.json";
  if (!WriteUtf8File(payloadPath, payload)) {
    WriteToastLog(directory, "payload write failed");
    return false;
  }

  std::wstring powershell =
      L"C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe";
  std::wstring scriptPath = GetRealPath(directory + L"\\show-junglesystem-toast.ps1");
  payloadPath = GetRealPath(payloadPath);
  std::wstring resultPath = directory + L"\\toast-helper-result.txt";
  DeleteFileW(resultPath.c_str());
  DeleteFileW((directory + L"\\run-toast.cmd").c_str());

  auto vbsBytes = std::string("Set sh = CreateObject(\"Wscript.Shell\")\r\nsh.Run \"") +
                  WideToUtf8(powershell) +
                  " -NoProfile -STA -WindowStyle Hidden -ExecutionPolicy Bypass -File \"\"" +
                  WideToUtf8(scriptPath) + "\"\" -PayloadPath \"\"" +
                  WideToUtf8(payloadPath) + "\"\"\", 0, True\r\n";
  auto vbsPath = directory + L"\\run-toast.vbs";
  if (!WriteUtf8File(vbsPath, vbsBytes)) {
    WriteToastLog(directory, "vbs write failed");
    return false;
  }
  vbsPath = GetRealPath(vbsPath);
  WriteToastLog(directory, std::string("helper dir ") + WideToUtf8(directory));

  std::wstring wscript = L"C:\\Windows\\System32\\wscript.exe";
  std::wstring schtasks = L"C:\\Windows\\System32\\schtasks.exe";
  std::wstring createCommand =
      L"\"" + schtasks +
      L"\" /Create /TN JungleSystemChatToast /TR \"" + wscript +
      L" //B //Nologo " + vbsPath +
      L"\" /SC ONCE /ST 00:00 /F /RL LIMITED /IT";
  DWORD createExit = 0;
  if (!RunHiddenProcess(schtasks, createCommand, 8000, &createExit) ||
      createExit != 0) {
    WriteToastLog(
        directory,
        std::string("schtasks create failed ") +
            std::to_string(GetLastError()) + " exit=" +
            std::to_string(createExit));
    return false;
  }

  std::wstring runCommand =
      L"\"" + schtasks + L"\" /Run /TN JungleSystemChatToast";
  DWORD runExit = 0;
  if (!RunHiddenProcess(schtasks, runCommand, 8000, &runExit) || runExit != 0) {
    WriteToastLog(
        directory,
        std::string("schtasks run failed ") + std::to_string(GetLastError()) +
            " exit=" + std::to_string(runExit));
    return false;
  }

  if (!WaitForHelperResult(resultPath, 4000)) {
    WriteToastLog(directory, "schtasks helper produced no result");
    return false;
  }

  WriteToastLog(directory, "spawned scheduled-task powershell");
  return true;
}

bool TryShowAppNotification(std::string const &xml, std::string const &tag) {
  if (!g_appNotificationsRegistered.load()) {
    return false;
  }

  try {
    auto manager =
        winrt::Microsoft::Windows::AppNotifications::AppNotificationManager::
            Default();
    winrt::Microsoft::Windows::AppNotifications::AppNotification notification{
        winrt::to_hstring(xml)};
    notification.Tag(winrt::to_hstring(tag));
    notification.Group(L"kolam-chat");
    manager.Show(notification);
    return true;
  } catch (...) {
    return false;
  }
}

void ShowWindowsToast(
    ::React::JSValueObject options,
    winrt::Microsoft::ReactNative::ReactContext context,
    std::function<std::function<void(::React::JSValueObject const &)>()> getEvent,
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  auto directory = GetKolamToastDirectory();
  try {
    auto title = ReadString(options, "title");
    auto body = ReadString(options, "body");
    auto tag = ReadString(options, "tag");
    auto stream = SanitizeLaunchPart(ReadString(options, "stream"));
    auto targetId = SanitizeLaunchPart(ReadString(options, "targetId"));
    WriteToastLog(
        directory,
        std::string("showToast title=") + title + " stream=" + stream +
            " targetId=" + targetId);

    if (title.empty() || body.empty() || stream.empty() || targetId.empty()) {
      WriteToastLog(directory, "rejected incomplete payload");
      result.Reject("Toast notifikasi tidak lengkap.");
      return;
    }

    if (tag.empty()) {
      tag = stream + "-" + targetId;
    }
    if (tag.size() > 64) {
      tag = tag.substr(0, 64);
    }

    if (!SpawnUnpackagedJungleToast(title, body, tag, stream, targetId)) {
      WriteToastLog(directory, "spawn failed");
      result.Reject("Toast notifikasi tidak bisa ditampilkan.");
      return;
    }
    result.Resolve(ShownResult(tag));
  } catch (winrt::hresult_error const &error) {
    WriteToastLog(directory, std::string("hresult ") + winrt::to_string(error.message()));
    result.Reject(winrt::to_string(error.message()).c_str());
  } catch (...) {
    WriteToastLog(directory, "showToast exception");
    result.Reject("Toast notifikasi tidak bisa ditampilkan.");
  }
}

bool ConsumeKolamToastActivationAndYieldImpl() noexcept {
  try {
    CaptureCommandLineActivation();
  } catch (...) {
  }

  g_instanceMutex = CreateMutexW(
      nullptr, TRUE, L"Local\\JungleSystem.SingleInstance");
  if (g_instanceMutex && GetLastError() == ERROR_ALREADY_EXISTS) {
    FocusOtherJungleSystemWindow();
    return true;
  }

  return false;
}

void RegisterKolamAppNotificationsImpl() noexcept {
  if (!IsPackagedProcess()) {
    try {
      SetCurrentProcessExplicitAppUserModelID(kUnpackagedAppUserModelId);
    } catch (...) {
    }
    try {
      EnsureKolamToastShortcut(kUnpackagedAppUserModelId);
    } catch (...) {
    }
  }

  try {
    auto manager =
        winrt::Microsoft::Windows::AppNotifications::AppNotificationManager::
            Default();
    if (!g_appNotificationInvoked.exchange(true)) {
      manager.NotificationInvoked(
          [](auto const &,
             winrt::Microsoft::Windows::AppNotifications::
                 AppNotificationActivatedEventArgs const &args) {
            WritePendingFromLaunch(winrt::to_string(args.Argument()));
            FocusKolamWindow();
          });
    }
    manager.Register();
    g_appNotificationsRegistered.store(true);
  } catch (...) {
  }
}

} // namespace

void RegisterKolamAppNotifications() noexcept {
  RegisterKolamAppNotificationsImpl();
}

bool ConsumeKolamToastActivationAndYield() noexcept {
  return ConsumeKolamToastActivationAndYieldImpl();
}

void KolamWindowsToastNotification::Initialize(
    winrt::Microsoft::ReactNative::ReactContext const &reactContext) noexcept {
  m_context = reactContext;
}

void KolamWindowsToastNotification::showToast(
    ::React::JSValueObject options,
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  ShowWindowsToast(
      std::move(options),
      m_context,
      [this]() { return ToastActivated; },
      std::move(result));
}

void KolamWindowsToastNotification::takePendingActivation(
    ::React::ReactPromise<::React::JSValueObject> &&result) noexcept {
  std::string stream;
  std::string targetId;
  if (!TakePendingActivation(stream, targetId)) {
    result.Resolve(::React::JSValueObject{});
    return;
  }

  FocusKolamWindow();
  result.Resolve(
      ::React::JSValueObject{{"stream", stream}, {"targetId", targetId}});
}

void KolamWindowsToastNotification::addListener(std::string /*eventName*/) noexcept {
}

void KolamWindowsToastNotification::removeListeners(int /*count*/) noexcept {
}

} // namespace KolamWindows
