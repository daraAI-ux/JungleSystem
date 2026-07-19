# Server Runtime Access Audit

Tanggal audit: 2026-07-18.

Scope audit ini read-only. Tidak ada perubahan NGINX, PM2, env, database, atau
source produksi yang dilakukan dari task ini.

## Tujuan

KolamWindows harus menjadi client resmi kedua selain Electron lama, tanpa
membuka backend untuk client umum dan tanpa merusak akses Electron.

Client native Windows yang dikirim aplikasi:

- `Origin: app://kolamwindows`
- `User-Agent: KolamWindows/0.0.1`
- `x-da-client: kolam-windows`
- `x-da-client-version: 0.0.1`
- `x-source: Kolam | pos | am`
- optional `x-device-mac` dan `x-device-mac-signature`

Kontrak di app: `src/domain/runtime-client-contract.ts`.

## Temuan NGINX Produksi

Server DA: `485area`.

`/var/www/staff-desktop-only/ON` sedang ada, berarti staff desktop-only gate
sedang aktif.

Snippet NGINX:

`/etc/nginx/snippets/da-staff-desktop-gate-check.conf`

Temuan penting:

- Snippet redirect browser staff ke `https://dunia-anura.com` saat flag ON ada.
- `KolamDesktop/` sudah exempt.
- `KolamWindows/` juga sudah exempt.
- `/api/*`, `/mobile/*`, `/login`, `?emergency=1`, dan cookie emergency/session
  juga exempt.
- Vhost yang meng-include snippet pada `location /`:
  - `kolam.dunia-anura.com`
  - `pos.dunia-anura.com`
  - `frogs.dunia-anura.com`

Implikasi:

- Gate UI NGINX sudah mengenali `KolamWindows/`.
- Runtime API KolamWindows ke `/api/*` tidak diblokir oleh NGINX staff gate.
- Ini tidak berarti semua API terbuka; backend tetap punya Origin/CORS/auth/MAC
  checks.

## Temuan Kolam BE

Repo live:

`/home/fito/merger/da-inventory-backend`

Temuan penting:

- `server/index.js` default allowed origins sudah berisi
  `app://kolamwindows`.
- `.env` live juga berisi `app://kolamwindows` pada `ALLOWED_ORIGINS`.
- CORS allowed headers sudah mencakup:
  - `x-source`
  - `x-device-mac`
  - `x-device-mac-signature`
  - `x-da-client`
  - `x-da-client-version`
- Server-side `/api` Origin gate menolak request tanpa `Origin` kecuali env
  `ALLOW_REQUESTS_WITHOUT_ORIGIN=true`.

Dokumen BE live:

`/home/fito/merger/da-inventory-backend/docs/kolam-mac-access-desktop.md`

MAC access berlaku untuk:

- `POST /auth/signin` dengan `source=inventory`
- `POST /auth/staff-otp-login/verify` dengan `source=inventory`
- `POST /auth/desktop-exchange`
- `verifyToken` untuk user `access_inventory` atau request `x-source`
  Kolam/inventory

Exempt:

- `x-source: pos`
- `x-source: store`

Implikasi untuk KolamWindows:

- POS runtime dengan `x-source: pos` tidak kena MAC allowlist.
- Kolam runtime dengan `x-source: Kolam` perlu MAC identity bila MAC access
  strict aktif.
- App sudah punya slot header `x-device-mac` dan `x-device-mac-signature`, tapi
  native Windows MAC collection/signature harus tetap diselesaikan sebelum
  klaim Kolam strict-MAC siap penuh.

## Temuan AM / Frogs

Repo live:

`/home/fito/da-automation-management`

`frogs.dunia-anura.com/api` masuk ke AM FE Next route:

`am-fe/src/app/api/[...path]/route.ts`

Proxy route saat audit meneruskan:

- `Content-Type`
- `cookie`
- `authorization`
- `x-forwarded-for`
- `user-agent`

Proxy route belum meneruskan:

- `origin`
- `x-source`
- `x-da-client`
- `x-da-client-version`
- `x-device-mac`
- `x-device-mac-signature`

AM BE CORS saat audit hanya mengizinkan origin localhost karena AM BE tidak
langsung diekspos publik; request public lewat AM FE proxy.

Implikasi:

- AM request dari KolamWindows ke `https://frogs.dunia-anura.com/api` dapat
  mencapai AM FE proxy.
- AM BE audit saat ini tetap melihat `User-Agent: KolamWindows/0.0.1` bila
  proxy meneruskan UA.
- Identitas `x-da-client` dan `x-source: am` belum sampai ke AM BE melalui
  proxy. Jika AM BE nanti harus membedakan Electron vs KolamWindows secara
  server-side, patch yang benar adalah add-only header forwarding di AM FE
  proxy, bukan membuka AM BE publik.

Patch add-only yang disarankan bila dibutuhkan:

```ts
for (const key of [
  "origin",
  "x-source",
  "x-da-client",
  "x-da-client-version",
  "x-device-mac",
  "x-device-mac-signature",
]) {
  const value = req.headers.get(key)
  if (value) headers.set(key, value)
}
```

Lokasi patch:

`/home/fito/da-automation-management/am-fe/src/app/api/[...path]/route.ts`

## Yang Tidak Boleh Diubah Sembarangan

- Jangan menghapus exemption `KolamDesktop/`.
- Jangan mengubah redirect target staff desktop gate tanpa instruksi owner.
- Jangan membuka `/api/*` untuk client umum di luar Origin/auth/MAC gate.
- Jangan mengekspos AM BE langsung ke publik hanya untuk KolamWindows.
- Jangan mematikan MAC access Kolam untuk memudahkan development.

## Status Saat Ini

Sudah siap di sisi app:

- Runtime URL memakai server existing:
  - `https://amfibi.dunia-anura.com/api`
  - `https://frogs.dunia-anura.com/api`
- Header client native Windows terpusat di
  `src/domain/runtime-client-contract.ts`.
- Bootstrap device identity membaca bridge native
  `KolamWindowsDeviceIdentity` / `KolamDeviceIdentity` bila tersedia dan mengisi
  `x-device-mac` serta `x-device-mac-signature` lewat `src/lib/api-client.ts`.
- `verify:runtime-backend` memastikan URL server dan client identity tidak
  regress.

Sudah terlihat siap di server Kolam/NGINX:

- `KolamWindows/` exempt di NGINX staff desktop gate.
- `app://kolamwindows` allowed di Kolam BE Origin gate.
- Header native Windows masuk allowedHeaders Kolam BE.

Belum selesai:

- Native C++ bridge untuk MAC/signature belum dibuktikan tersedia di build RNW;
  tanpa signature, status runtime tetap partial untuk Kolam strict-MAC.
- AM FE proxy belum meneruskan semua header native Windows ke AM BE.
- Belum ada perubahan produksi dari task ini; audit ini hanya bukti read-only.
