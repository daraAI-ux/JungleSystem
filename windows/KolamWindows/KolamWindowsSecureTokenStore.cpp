#include "pch.h"
#include "KolamWindowsSecureTokenStore.h"

#include <wincred.h>

#pragma comment(lib, "Advapi32.lib")

namespace KolamWindows {
namespace {

constexpr wchar_t kCredentialTarget[] = L"KolamWindows/AuthSession";
constexpr wchar_t kCredentialUser[] = L"kolam";

} // namespace

std::optional<std::string> KolamWindowsSecureTokenStore::getSession() noexcept {
  PCREDENTIALW credential = nullptr;
  if (!CredReadW(kCredentialTarget, CRED_TYPE_GENERIC, 0, &credential) || !credential) {
    return std::nullopt;
  }

  std::optional<std::string> payload;
  if (credential->CredentialBlob && credential->CredentialBlobSize > 0) {
    payload = std::string(
        reinterpret_cast<char const *>(credential->CredentialBlob),
        reinterpret_cast<char const *>(credential->CredentialBlob) +
            credential->CredentialBlobSize);
  }

  CredFree(credential);
  return payload;
}

bool KolamWindowsSecureTokenStore::setSession(std::string payload) noexcept {
  if (payload.empty()) {
    return clearSession();
  }

  CREDENTIALW credential{};
  credential.Type = CRED_TYPE_GENERIC;
  credential.TargetName = const_cast<LPWSTR>(kCredentialTarget);
  credential.UserName = const_cast<LPWSTR>(kCredentialUser);
  credential.CredentialBlobSize = static_cast<DWORD>(payload.size());
  credential.CredentialBlob = reinterpret_cast<LPBYTE>(payload.data());
  credential.Persist = CRED_PERSIST_LOCAL_MACHINE;

  return CredWriteW(&credential, 0) == TRUE;
}

bool KolamWindowsSecureTokenStore::clearSession() noexcept {
  if (CredDeleteW(kCredentialTarget, CRED_TYPE_GENERIC, 0)) {
    return true;
  }

  return GetLastError() == ERROR_NOT_FOUND;
}

} // namespace KolamWindows
