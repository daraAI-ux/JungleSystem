# Project-Wide Protection Rule

Semua file, modul, komponen, behavior, style, data flow, dan fitur existing di aplikasi ini adalah protected by default.

Agen tidak boleh:
- mengubah file apa pun di luar scope eksplisit
- refactor opportunistic
- cleanup "sekalian"
- extract shared component tanpa approval
- mengubah modul lain karena terlihat mirip
- menghapus fitur existing
- mengganti UI yang sudah benar
- mengubah naming/API/props existing tanpa approval
- menyentuh Species/Product/modul lain kecuali disebut eksplisit
- "memperbaiki" hal yang tidak diminta

Sebelum coding:
1. Audit-only.
2. Sebutkan file yang akan dibaca.
3. Sebutkan file yang akan disentuh.
4. Sebutkan behavior existing yang akan dipertahankan.
5. Sebutkan risiko regresi.
6. Tunggu approval eksplisit.

Saat coding:
1. Hanya sentuh file yang disetujui.
2. Jika menemukan kebutuhan di luar scope, STOP.
3. Jangan patch tambahan.
4. Jangan mengubah desain global.
5. Jangan mengubah reusable component tanpa approval khusus.

Setelah coding:
1. Laporkan file yang berubah.
2. Laporkan fitur yang dipertahankan.
3. Jalankan test/typecheck sesuai scope.
4. Reload atau rebuild aplikasi jika perlu agar perubahan terlihat. Jika rebuild tidak diperlukan, cukup reload.
5. Jangan lanjut section berikutnya tanpa approval.
