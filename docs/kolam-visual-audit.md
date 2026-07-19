# Audit Visual Kolam Live

Dokumen ini mencatat acuan visual dari source Kolam live yang dipakai untuk shell React Native Windows.

## Source yang Diaudit

- `E:\Projects\_latest-da\da-inventory-frontend\src\app\styles\globals.css`
- `E:\Projects\_latest-da\da-inventory-frontend\src\app\(app)\layout.tsx`
- `E:\Projects\_latest-da\da-inventory-frontend\src\components\ui\sidebar.tsx`
- `E:\Projects\_latest-da\da-inventory-frontend\src\components\app-sidebar.tsx`
- `E:\Projects\_latest-da\da-inventory-frontend\src\components\app-sidebar-nav.tsx`
- `E:\Projects\_latest-da\da-inventory-frontend\src\components\header.tsx`
- `E:\Projects\_latest-da\da-inventory-frontend\src\components\logo.tsx`

## Pola Shell Kolam

- Layout utama memakai sidebar kiri dan area konten kanan, bukan landing page.
- First screen live langsung menampilkan dashboard/workspace operasional; panel teknis tidak mendahului konten utama.
- Sidebar default memakai lebar `17rem`, dock width `3.25rem`, latar `sidebar` hampir putih, border kanan tipis, dan teks slate gelap.
- Sidebar punya header logo, tombol `Quick Search`, section navigasi, item aktif dengan background secondary, dan rail/dock behavior.
- Item menu live punya label, icon, deskripsi/tooltip, dan kadang badge; operator mendapat konteks sebelum membuka route.
- Top navigation berada di atas konten: trigger sidebar, separator vertikal, breadcrumb, lalu notification/user menu di kanan.
- Top navigation live memakai notification circle dan avatar user.
- Konten memakai padding layout sekitar 16px dan surface putih dengan border halus.
- Header halaman ringkas: title `text-lg`, weight semibold, tidak memakai hero besar.
- Card live memakai `rounded-lg border bg-bg`, spacing default sekitar 24px, dan compact dashboard card sekitar 16px.
- Table live dibungkus card overflow hidden dengan spacing card 0, root `text-sm/6`, header `border-y bg-secondary/50`, cell padding horizontal sekitar 20px, dan row memakai border bawah.
- Dashboard live memakai grid gap 24px, stat card compact, dan inventory count card dengan icon square 36px.
- Dashboard live memakai main column dan right sidebar untuk Out of Stock, Low Stock, dan Top Selling.
- Dashboard header live memakai greeting `Good Morning/Afternoon/Evening/Night`, nama user dengan aksen primary, subtitle performa toko, dan action kecil `New Product`/`New Order`.
- Button live memakai intent primary/outline/secondary dengan rounded-lg, tinggi kecil sekitar 34-36px, dan font medium.
- Badge live berupa pill kecil `text-xs`, padding tipis, dan warna soft untuk success/info/warning/danger.
- Input live memakai rounded-lg, border/inset ring input, tinggi compact, dan placeholder muted.
- Form live memakai `Card` dengan padding sekitar 24px, vertical gap 16px, field grid dua kolom di desktop, dan action row justify-end.
- Radius utama `0.5rem` atau sekitar 8px.
- Token warna light theme utama:
  - background putih
  - foreground slate sangat gelap
  - primary hijau
  - muted near-gray
  - border gray tipis
  - sidebar near-white
- Font utama adalah Inter dengan fallback system sans.

## Mapping ke RNW

- Token visual dipusatkan di `src/domain/kolam-visual.ts`.
- `App.tsx` memakai token itu untuk shell, sidebar, top nav, card, form, table/list, CTA, badge status, dan placeholder.
- Sidebar RNW diset ke 272px untuk mengikuti `17rem`, dan mode dock memakai 52px untuk mengikuti `3.25rem`.
- Brand sidebar RNW memakai emblem + wordmark native sebagai padanan logo SVG Kolam live; kontrak `Logo` live `size-40 h-14` dipetakan ke 160x56 saat expanded dan `size-12` ke 48px saat dock.
- Palet brand RNW mengambil warna utama dari SVG live: hijau gelap `#29381C`, hijau terang `#2EB028`, hijau daun `#185406`, merah aksen `#A32D2C`, krem `#D1C79D`, dan kuning `#F4A512`.
- Top nav RNW dipisahkan dari `ScrollView`, sehingga area workspace saja yang scroll.
- Sidebar RNW sekarang memisahkan brand header, menu content yang scrollable, dan footer seperti pola `SidebarHeader`/`SidebarContent` live, sehingga menu panjang tidak terpotong.
- Sidebar trigger RNW sekarang toggle antara mode penuh dan dock native: full menampilkan label/deskripsi/badge, dock menampilkan brand mark, quick search glyph, glyph module, ringkasan huruf/count Kolam Menu, dan footer compact.
- Top nav RNW mengikuti `AppSidebarNav` live: trigger, separator, breadcrumb, notification attention, avatar-only trigger, dan dropdown user native.
- Sidebar trigger RNW kini memakai panel/sidebar glyph native berbasis `View` sebagai padanan `SidebarTrigger` live, bukan hamburger tiga garis.
- Top nav right RNW kini lebih dekat ke live: hanya notification circle dan avatar trigger; status POS/Kolam/AM tetap tersedia melalui Attention Panel dan Sync Activity, tidak lagi sebagai pill permanen di navbar.
- Urutan kontrol top nav right RNW kini mengikuti live `AppSidebarNav`: notification button lebih dulu, lalu avatar/user menu.
- Notification trigger RNW kini memakai bell glyph native berbasis `View` sebagai padanan `IconBell` live, bukan tanda seru teks.
- Breadcrumb top nav RNW kini mengikuti struktur `Breadcrumbs` live: `Dashboard` sebagai item dasar, separator chevron native, dan current module sebagai item aktif, bukan teks datar `Kolam / module`.
- Notification popup live dipetakan ke native attention panel: header `Notifications`, unread badge, close icon-only native, dan list readiness/sync/source error dengan badge tone.
- Attention panel RNW kini menandai row unread seperti notification popup live: row non-clear mendapat highlight lembut dan dot primary di sisi title, sedangkan `All clear` tidak dihitung unread.
- Header attention panel RNW kini menambahkan action `See All` seperti popup live; karena native belum punya route `/notifications`, action ini membuka CommandPalette dengan pencarian `activity-log` sebagai jalur audit native terdekat.
- Avatar dropdown live dipetakan ke native user menu panel: header profil, email, access scope, close action, dan action `Dashboard`, `Settings`, `Command Menu`, `Contact Support`, serta `Log out`.
- Avatar dropdown RNW kini mengikuti gating admin live: role `admin`/`super-admin` mendapat item `Web Settings` yang membuka surface Settings native dengan route hint `/settings/websetting`, sedangkan staff/non-admin tetap melihat menu ringkas tanpa item tersebut.
  - Row avatar dropdown RNW kini punya ikon native per item sebagai padanan `IconDashboard`, `IconSettings`, `IconCommandRegular`, dan `IconLogout` di `AppSidebarNav` live, plus trailing chevron native berbasis `View` sebagai affordance route/action, tanpa menambah dependency icon web atau memakai teks simbol `>`.
- Avatar dropdown RNW kini memisahkan section menu seperti live: main actions, command menu, support, dan session/logout dipisah border tipis.
- Avatar dropdown close action RNW kini memakai icon-only X native 28px sebagai popup chrome, bukan tombol teks `Close`, karena live `Menu.Content` ditutup sebagai affordance popover/menu.
- Action `Settings` dari avatar dropdown kini membuka surface native Settings dengan metric route dan ringkasan `Web Settings`, `Role Management`, serta `Activity Log`.
- Quick search RNW ditampilkan di sidebar seperti Kolam live dan membuka CommandPalette native berbasis Command Index gabungan.
- Quick Search sidebar RNW kini memakai search glyph native berbasis `View` sebagai padanan ikon search live, bukan placeholder dua garis.
- Item sidebar RNW menampilkan label, deskripsi satu baris, dan badge jumlah route dari registry shell native.
  - Icon menu live dipetakan menjadi ikon native per module dari registry shell (`dashboard`, `settings`, `cart`, `catalog`, `sales`, `wallet`, `people`, `automation`, dan `plugin`) agar tidak bergantung pada icon package web.
- Sidebar RNW kini membawa ringkasan `Kolam Menu` dari struktur live: Overview, Inventory, Sales & Cashflow, Finance, User, dan Settings, termasuk route inti seperti `/products`, `/raw-materials`, `/species`, `/sales`, `/finance`, `/wallet`, dan `/settings/activity-log`.
- Kolam Menu RNW kini punya permission filtering native saat user login: route inventory/settings/finance mengikuti akses Kolam, route product/species/sales/cashflow/wallet/customer tetap tersedia untuk scope POS, sedangkan seed/offline preview tetap menampilkan struktur penuh untuk audit visual.
- Kolam Menu RNW kini punya disclosure native per section: default menampilkan dua route agar sidebar tetap padat, header section bisa dibuka untuk melihat seluruh route live dengan counter `visible/total`, memakai chevron native berbasis `View` sebagai padanan `IconChevronLgDown` sidebar live.
- Item route Kolam Menu RNW kini clickable: `/products` dan `/species` masuk Catalog native, `/sales` masuk Sales, `/cashflow-session` masuk Cashflow, `/customers` masuk Customer, dan route Kolam lain membuka workspace Kolam dengan search hint route.
- Kolam Menu RNW kini punya kontrol reorder native per section dengan chevron up/down berbasis `View` sebagai padanan operasional dari drag reorder web tanpa perlu gesture drag yang belum dipasang di RNW.
- Top nav RNW menampilkan attention badge dari readiness/sync state dan avatar initial native.
- RNW merender module dashboard/workspace sebelum panel session, sync activity, readiness, runtime actions, dan command index agar first screen terasa seperti Kolam live.
- Metadata `Source repo live` tetap ada untuk audit source, tetapi posisinya dipindah setelah ringkasan operasional/surface/registry agar first screen Kolam menonjolkan Stats, Inventory Counts, Sales Graph, Pending Orders, dan right rail terlebih dahulu.
- Stats row Kolam RNW memakai range `Today`, `This Month`, `This Year`, dan `All Time` seperti partial `Stats` live, lengkap dengan badge perubahan, sparkline native dari sales graph, dan channel rows `POS`, `Web Store`, `Backoffice`.
- Dashboard Kolam RNW memakai layout dua kolom dengan right rail Out of stock, Low stock, dan Top sales dari dataset aktif/seed.
- Right rail RNW sekarang mengikuti partial live: `Out of Stock`, `Low Stock`, dan `Top Selling` punya icon native sesuai live (`CircleX`, `TriangleExclamation`, `ChartTrending`, `CircleCheck` untuk empty), title tone, description, action pendek `View All` dengan chevron native berbasis `View`, route item di domain, row chevron native, limit 5 item, rank badge untuk top selling, dan empty state native jika item kosong.
- Inventory count card live dipetakan ke strip native `Products`, `Raw Materials`, `Life Stock`, dan `Services` dari `/dashboard.counts`; square icon 36px live (`ShoppingBag`, `Package`, `Book`, `Service`) kini dipadankan dengan icon native berbasis `View`; jika live counts belum tersedia, RNW memakai fallback katalog untuk Products/Life Stock dan menampilkan Raw Materials/Services sebagai nol.
  - Sales Graph live dipetakan ke card grafik native full-width dengan title icon line-chart, total, range trigger `This Year`, opsi range live (`Last 7 Days`, `This Month`, `This Year`, `All Time`), dan bar chart sederhana. Jika `/dashboard/sales-graph` belum tersedia, RNW memakai paid sales seed sebagai fallback supaya struktur dashboard tetap mengikuti Kolam live.
  - Range trigger Sales Graph RNW kini mengikuti `Select.Trigger` live: bordered rounded trigger, padding compact, background putih, dan chevron native berbasis `View`, bukan teks `v`.
- Pending Orders live dipetakan ke card native setelah ringkasan finance/wallet/sales graph: header warning memakai clock icon native, description `Awaiting payment confirmation`, action pendek `View All` dengan chevron native berbasis `View` dan route kontrak `/sales?status=sent`, serta grid range `Today`, `Month`, `Year`, `All`. Seed/native fallback menghitung draft/sent sale sebagai pending POS, sementara Web Store dan Backoffice tetap nol sampai breakdown live tersedia.
- Top Selling RNW kini menghitung product/species terlaris dari line item sale saat tersedia, termasuk quantity sold, revenue, rank, dan route `/products/:id` atau `/species/:id`; jika backend belum mengirim line item, rail tetap fallback ke sale summary agar panel tidak kosong.
- Metric card, module panel, readiness, sync activity, command index, surface list, dan Plugin Hub memakai spacing card/table dari token visual.
- Surface list dan Plugin Hub sekarang punya header row muted agar mengikuti pola table Kolam.
- Plugin Hub RNW sekarang memiliki summary metric cards untuk total plugin, ready, mismatch, dan route host sebelum tabel registry, lengkap dengan ikon native per card dan kontrak source `components/ui/card.tsx` live.
- Plugin Hub row metadata RNW kini memisahkan package name dan entry point dengan arrow-right native berbasis `View`, bukan string teks `->`, mengikuti pola metadata table/list Kolam.
- Katalog, Customer, dan Sales RNW kini memakai wrapper table native dengan kontrak visual dari `components/ui/table.tsx`: card overflow hidden, header muted `border-y`, typography `text-sm/6`, row min-height 52px, dan padding cell live, sehingga list operasional tidak tampil sebagai row polos tanpa konteks kolom.
- Empty state generik RNW kini mengikuti pola empty-state Table live: tinggi full 288px, icon container melingkar, ikon box native, title/message center, dan varian compact untuk cart, command palette, command index, serta Plugin Hub.
- Form Cashflow dan Customer RNW kini memakai pola `FormSection` live: title/description di kolom kiri dan kontrol input di kolom kanan, card padding 24px, gap field 16px, input height 36px, radius 8px, tetap di dalam panel operasional native.
  - Sync Activity, Native Readiness, Runtime Actions, dan Command Index kini memakai status panel frame yang konsisten: ikon native per panel, title, description, summary badge, border header, dan body list/grid dari pola `components/ui/card.tsx` live.
- Runtime Actions RNW kini memakai badge status inline icon+text seperti pola `Badge` live: `native-ready` memakai check native, `live-api` memakai activity native, `source-audit` memakai search native, dan action yang terkunci akses memakai clock/warning tone.
- Native Readiness RNW kini memakai badge status inline icon+text seperti pola `Badge` live: `ready` memakai check native, `partial` memakai activity native, dan `blocked` memakai clock/warning tone.
- Sync Activity RNW kini memakai badge status inline icon+text seperti pola `Badge` live: `live` memakai check native, `fallback` memakai activity native, `disabled` memakai clock/muted tone, dan `seed` memakai database glyph native.
- Settings RNW kini memakai panel operasional native, metric cards, route list bordered/muted, dan detail tab native untuk memetakan `/settings/websetting`, `/settings/roles`, dan `/settings/activity-log` tanpa membuka halaman web/Electron.
- Settings detail RNW kini memakai description-list native dari kontrak `components/ui/description-list.tsx` live: term muted di kiri, detail/value di kanan, border top antar row kecuali row pertama, dan skala `text-sm/6`.
- Tab Web Settings di Settings RNW kini punya kontrol native untuk storefront title, storefront enabled, dan maintenance mode sebagai draft UI dari `/settings/websetting`.
- Toggle Web Settings RNW kini memakai switch pill native dari kontrak `components/ui/switch.tsx` live: track rounded 32x20, knob rounded 14px, selected memakai primary tone dan knob translate kanan, bukan tombol teks `Enabled/Off`.
- Web Settings RNW kini punya preview `FormSection` native dari `settings/websetting/websetting-page.tsx`: Version, Logo, Company Info, Contact Info, Address, Shipping Origin, Social Media, dan Maintenance Mode, termasuk Save/Upload Logo visual, separator section, field grid, textarea, dan switch cards; submit/upload backend belum diaktifkan.
- Settings RNW kini membawa kontrak endpoint live dari backend: `GET/PUT /websetting`, `GET /websetting/version`, `GET /roles`, `GET /activity-log`, dan `GET /activity-log/stats`, lalu menampilkannya sebagai row kontrak native per tab.
- Tab Activity Log di Settings RNW kini membaca `syncActivity` nyata dari shell sehingga event POS/Kolam/AM terbaru tampil sebagai row audit native dengan status, detail, timestamp, dan tone.
- Activity Log Settings RNW kini punya summary stats cards native dari kontrak backend `GET /activity-log/stats`: window days, total preview events, success count, dan attention count sebagai preview sampai response `byType`, `byStatus`, `topUsers`, dan `topPaths` live dipasang penuh.
- Activity Log Settings RNW kini punya filter bar native dari source live `settings/activity-log/activity-log-list.tsx`: search `Cari path atau IP...`, select Type, Status, Method, Source, Suspicious, dan action `Refresh` sebagai kontrak visual sebelum query backend penuh dipasang.
- Activity Log Settings RNW kini memakai table native dengan kolom live `Waktu`, `User`, `Source`, `Tipe`, `Method`, `Path`, `IP`, `Status`, `Durasi`, dan action detail icon-eye; data masih preview dari sync activity sampai endpoint `/activity-log` penuh dipasang.
- Activity Log Settings RNW kini punya detail panel native dari modal live `Detail Log`: field Timestamp, User, Source, Type, Method, Path, IP, User Agent, Status, Duration, Action, suspicious flags, dan tombol `Tutup`; isi field masih preview native-shell sampai response detail live dipasang.
- Activity Log Settings RNW kini punya pagination footer native dari kontrak `components/ui/pagination.tsx` live: summary range, tombol previous/next chevron, nomor page 36px outline, current page disabled/primary, dan page rows dari sync activity shell.
- Tab Role Management di Settings RNW kini memiliki matrix akses native untuk Super Administrator, Inventory Staff, POS Cashier, dan AM Operator dengan kolom Kolam/POS/AM.
- Role Management RNW kini punya toolbar action native dari kontrak live `settings/roles/list.tsx`, `settings/roles/create-roles.tsx`, dan `api/settings/roles/mutations.ts`: `New role`, `Edit role`, `Delete role`, selected role state, serta preview resource-action `role`, `websetting`, dan `activity-log` dari `lib/permissions/resource-actions.ts`.
- Role Management RNW kini mengikuti guard live `DEFAULT_ROLE_KEYS`: role default seperti `super-admin` menampilkan delete action disabled/muted dengan label `Default`, sementara role custom tetap memakai delete danger action.
- Role Management RNW kini punya role tab strip native seperti live `TabList`: role name, permission count badge kecil font-mono, selected tab bg putih/shadow, serta flag `Full`/`Default` untuk role khusus.
- Role Management RNW kini punya Role Info strip native seperti live `TabPanel`: nama role, deskripsi, badge `Full Access`/`Default`, key role font-mono, delete button danger untuk custom role, dan notice warning untuk Super Admin.
- Role Management RNW kini memetakan `RESOURCE_GROUPS` live menjadi summary chip native untuk Inventory, Sales & Customers, Content, Purchasing & Production, Finance, Stock Management, Enclonura, Settings & Configuration, dan System sehingga operator melihat grouping permission sebelum editor CRUD lengkap dipindahkan.
- Role Management RNW kini punya permission toggle matrix preview seperti live `ToggleGroup`: group Settings & Configuration, counter active/total permissions, resource rows dengan status dot, dan action toggles `View/Create/Update/Delete` dari `lib/permissions/resource-actions.ts`; update permission backend belum diaktifkan.
- Role Management RNW kini memetakan section `RoleMembers` live menjadi preview native untuk selected role: header `Members (n)` dengan people icon, avatar initial pills, dan empty text `No members yet` saat role belum punya user seed.
- CommandPalette native memakai overlay dengan backdrop, input search, counter hasil, section `Modules`, `Runtime Actions`, dan `Plugin Routes`, serta memilih item menjalankan handler yang sama dengan Command Index.
- Search input utama RNW kini mengikuti `SearchField`/`CommandMenu.Search` live: ikon search native di kiri, input transparan di dalam bordered row, dan hint `Esc` di CommandPalette overlay.
- CommandPalette close chrome RNW kini memakai tombol icon-only X native 28px, sementara `Esc` tetap muncul sebagai shortcut hint di search field seperti pola command menu.
- CommandPalette result RNW kini mengikuti list pattern `CommandMenu` live: list padding 8px, section header kecil, row compact 52px, ikon native per jenis command, label/description kiri, dan kind/route di kanan.
- Segment/tab RNW kini dibedakan sesuai pola live: filter Katalog dan Settings memakai tab list underline dari `components/ui/tabs.tsx`, sedangkan toggle Rp/% dan auth source tetap memakai button compact dari `components/ui/button.tsx`.
- Header dashboard RNW memakai greeting dan subtitle live Kolam; action `New Product` dan `New Order` diarahkan ke modul native Catalog dan Checkout.
- Action header dashboard RNW kini data-driven dari kontrak live `DashboardHeader`: `New Product` memakai source route `/products/create` dengan icon package native, dan `New Order` memakai `/sales/create` dengan icon plus native.
- Button, badge, input, segment, selector chip, dan status pill RNW memakai token kontrol dari `src/domain/kolam-visual.ts`.
- Header konten tetap ringkas dan operasional, bukan hero marketing.
- Scope gabungan tetap terlihat: Kolam, POS, AM, Plugin Hub, Runtime Actions, Command Index, Readiness, Sync Activity.

## Gap Saat Ini

- Sidebar RNW sudah punya dock/collapse native, disclosure section, filtering akses route inti, route click-through, dan reorder section native; gesture drag reorder web belum direplikasi, tetapi fungsi pengurutan sudah tersedia.
- CommandPalette sudah direplikasi sebagai overlay native, tetapi shortcut keyboard global `Ctrl K` belum ditangkap di level window RNW; tombol Quick Search dan user menu tetap membuka palette.
- Settings native sudah punya tab detail, Web Settings draft controls, Web Settings FormSection preview, role access matrix, Role Management tab strip, Role Management info strip, Role Management action toolbar, Role Management permission toggle matrix preview, Activity Log dari sync activity shell, filter bar native, table columns native, detail panel native, stats cards native, pagination footer native, dan service kontrak live untuk Web Settings/Role/Activity Log; submit/upload backend dari tombol UI, role editor modal CRUD lengkap, permission update backend, delete role backend, dan backend activity-log filter/detail/top users/top paths API penuh belum dipindahkan satu-satu ke RNW.
- Product-level Top Selling bergantung pada line item sale dari seed/API POS; jika response live hanya berisi summary invoice, RNW menampilkan fallback sale summary sampai backend mengirim detail item.
- Visual QA runtime sudah dicoba: `doctor:windows` lolos, Metro dapat berjalan, native build/deploy RNW berhasil setelah Windows Developer Mode/sideloading policy aktif, dan user sudah melihat UI. Pixel/UI QA manual tetap perlu diulang per perubahan visual besar.
- Token OKLCH web sudah dipetakan ke hex RNW terdekat agar kompatibel dengan React Native StyleSheet.
