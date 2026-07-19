#include "pch.h"
#include "KolamWindowsDeviceIdentity.h"

#include <algorithm>
#include <bcrypt.h>
#include <cstdlib>
#include <iomanip>
#include <iphlpapi.h>
#include <iptypes.h>
#include <sstream>
#include <string>
#include <vector>

namespace KolamWindows {
namespace {

std::string FormatMacAddress(BYTE const *address, ULONG length) {
  if (!address || length != 6) {
    return {};
  }

  std::ostringstream stream;
  stream << std::uppercase << std::hex << std::setfill('0');
  for (ULONG index = 0; index < length; ++index) {
    if (index > 0) {
      stream << ':';
    }
    stream << std::setw(2) << static_cast<unsigned int>(address[index]);
  }
  return stream.str();
}

bool ShouldUseAdapter(IP_ADAPTER_ADDRESSES const &adapter) {
  if (adapter.PhysicalAddressLength != 6) {
    return false;
  }

  if (adapter.IfType == IF_TYPE_SOFTWARE_LOOPBACK) {
    return false;
  }

  return adapter.OperStatus == IfOperStatusUp;
}

std::vector<std::string> ReadMacAddresses() {
  ULONG bufferLength = 0;
  constexpr ULONG flags =
      GAA_FLAG_SKIP_ANYCAST | GAA_FLAG_SKIP_MULTICAST | GAA_FLAG_SKIP_DNS_SERVER;

  ULONG result = GetAdaptersAddresses(AF_UNSPEC, flags, nullptr, nullptr, &bufferLength);
  if (result != ERROR_BUFFER_OVERFLOW || bufferLength == 0) {
    return {};
  }

  std::vector<BYTE> buffer(bufferLength);
  auto *addresses = reinterpret_cast<IP_ADAPTER_ADDRESSES *>(buffer.data());
  result = GetAdaptersAddresses(AF_UNSPEC, flags, nullptr, addresses, &bufferLength);
  if (result != NO_ERROR) {
    return {};
  }

  std::vector<std::string> macs;
  for (auto *adapter = addresses; adapter != nullptr; adapter = adapter->Next) {
    if (!ShouldUseAdapter(*adapter)) {
      continue;
    }

    auto mac = FormatMacAddress(adapter->PhysicalAddress, adapter->PhysicalAddressLength);
    if (!mac.empty() && std::find(macs.begin(), macs.end(), mac) == macs.end()) {
      macs.push_back(mac);
    }
  }

  return macs;
}

std::string ReadRegistryString(HKEY root, char const *subKey, char const *valueName) {
  DWORD type = 0;
  DWORD size = 0;
  auto status = RegGetValueA(
      root,
      subKey,
      valueName,
      RRF_RT_REG_SZ,
      &type,
      nullptr,
      &size);
  if (status != ERROR_SUCCESS || size <= 1) {
    return {};
  }

  std::string value(size, '\0');
  status = RegGetValueA(
      root,
      subKey,
      valueName,
      RRF_RT_REG_SZ,
      &type,
      value.data(),
      &size);
  if (status != ERROR_SUCCESS || size <= 1) {
    return {};
  }

  while (!value.empty() && value.back() == '\0') {
    value.pop_back();
  }
  return value;
}

std::string ReadDesktopClientSecret() {
  DWORD requiredLength =
      GetEnvironmentVariableA("KOLAM_DESKTOP_CLIENT_SECRET", nullptr, 0);
  if (requiredLength > 1) {
    std::string secret(requiredLength, '\0');
    DWORD actualLength = GetEnvironmentVariableA(
        "KOLAM_DESKTOP_CLIENT_SECRET", secret.data(), requiredLength);
    if (actualLength > 0 && actualLength < requiredLength) {
      secret.resize(actualLength);
      return secret;
    }
  }

  auto userSecret = ReadRegistryString(
      HKEY_CURRENT_USER,
      "Environment",
      "KOLAM_DESKTOP_CLIENT_SECRET");
  if (!userSecret.empty()) {
    return userSecret;
  }

  return ReadRegistryString(
      HKEY_LOCAL_MACHINE,
      "SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment",
      "KOLAM_DESKTOP_CLIENT_SECRET");
}

std::string BuildCanonicalMacPayload(std::vector<std::string> macs) {
  if (macs.empty()) {
    return {};
  }

  std::sort(macs.begin(), macs.end());

  std::ostringstream payload;
  for (size_t index = 0; index < macs.size(); ++index) {
    if (index > 0) {
      payload << ',';
    }
    payload << macs[index];
  }

  return payload.str();
}

std::string BytesToHex(std::vector<BYTE> const &bytes) {
  std::ostringstream stream;
  stream << std::hex << std::nouppercase << std::setfill('0');
  for (BYTE byte : bytes) {
    stream << std::setw(2) << static_cast<unsigned int>(byte);
  }
  return stream.str();
}

std::string SignMacAddresses(std::vector<std::string> const &macs) {
  const auto secret = ReadDesktopClientSecret();
  const auto payload = BuildCanonicalMacPayload(macs);
  if (secret.empty() || payload.empty()) {
    return {};
  }

  BCRYPT_ALG_HANDLE algorithm = nullptr;
  BCRYPT_HASH_HANDLE hash = nullptr;
  DWORD bytesWritten = 0;
  DWORD objectLength = 0;
  DWORD hashLength = 0;

  if (!BCRYPT_SUCCESS(BCryptOpenAlgorithmProvider(
          &algorithm,
          BCRYPT_SHA256_ALGORITHM,
          nullptr,
          BCRYPT_ALG_HANDLE_HMAC_FLAG))) {
    return {};
  }

  auto closeAlgorithm = [&]() {
    if (algorithm) {
      BCryptCloseAlgorithmProvider(algorithm, 0);
      algorithm = nullptr;
    }
  };

  if (!BCRYPT_SUCCESS(BCryptGetProperty(
          algorithm,
          BCRYPT_OBJECT_LENGTH,
          reinterpret_cast<PUCHAR>(&objectLength),
          sizeof(objectLength),
          &bytesWritten,
          0)) ||
      !BCRYPT_SUCCESS(BCryptGetProperty(
          algorithm,
          BCRYPT_HASH_LENGTH,
          reinterpret_cast<PUCHAR>(&hashLength),
          sizeof(hashLength),
          &bytesWritten,
          0))) {
    closeAlgorithm();
    return {};
  }

  std::vector<BYTE> hashObject(objectLength);
  std::vector<BYTE> digest(hashLength);

  if (!BCRYPT_SUCCESS(BCryptCreateHash(
          algorithm,
          &hash,
          hashObject.data(),
          objectLength,
          reinterpret_cast<PUCHAR>(const_cast<char *>(secret.data())),
          static_cast<ULONG>(secret.size()),
          0))) {
    closeAlgorithm();
    return {};
  }

  auto closeHash = [&]() {
    if (hash) {
      BCryptDestroyHash(hash);
      hash = nullptr;
    }
  };

  if (!BCRYPT_SUCCESS(BCryptHashData(
          hash,
          reinterpret_cast<PUCHAR>(const_cast<char *>(payload.data())),
          static_cast<ULONG>(payload.size()),
          0)) ||
      !BCRYPT_SUCCESS(BCryptFinishHash(hash, digest.data(), hashLength, 0))) {
    closeHash();
    closeAlgorithm();
    return {};
  }

  closeHash();
  closeAlgorithm();
  return BytesToHex(digest);
}

} // namespace

::React::JSValueObject KolamWindowsDeviceIdentity::getDeviceIdentity() noexcept {
  const auto macs = ReadMacAddresses();
  ::React::JSValueArray macAddresses;
  for (auto const &mac : macs) {
    macAddresses.push_back(mac);
  }

  auto payload = ::React::JSValueObject{
      {"macAddresses", std::move(macAddresses)},
  };

  const auto signature = SignMacAddresses(macs);
  if (!signature.empty()) {
    payload["macSignature"] = signature;
  }

  return payload;
}

} // namespace KolamWindows

