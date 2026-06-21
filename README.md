# CRM Lead-SPK — Frontend

Frontend untuk aplikasi CRM sederhana pencatatan dan pengelolaan Lead, yang dapat dikonversi menjadi SPK (Surat Perintah Kerja). Dibangun untuk Technical Test Fullstack — PT Solusi Klik.

Repo backend (NestJS): lihat `<url-repo-backend>`

## Teknologi

- **Framework**: Next.js (App Router)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand (dengan persist ke localStorage)
- **HTTP Client**: Axios (dengan interceptor token & auto-logout saat 401)

## Fitur Utama

- Login dengan JWT, token tersimpan dan tetap aktif setelah refresh halaman
- Route protection — otomatis redirect ke `/login` jika belum autentikasi
- Menu navigasi otomatis menyesuaikan role yang login (Admin/Sales/Finance)
- Halaman Lead: list (search, filter status, pagination), tambah, detail, update status, riwayat status
- Konversi Lead berstatus `WON` menjadi SPK langsung dari halaman detail
- Halaman SPK: list, detail, kirim ke Finance, approve/reject (dengan validasi catatan wajib jika reject)
- Halaman kelola User (khusus Admin): tambah, edit, hapus user beserta role-nya

## Prasyarat

- Node.js 20+
- Backend (be-crm) sudah berjalan — lihat repo backend untuk instruksi setup

## Setup & Instalasi

1. Clone repository dan install dependency

   ```bash
   git clone <url-repo-ini>
   cd fe-crm
   npm install
   ```

2. Buat file `.env.local` di root project:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

   Sesuaikan dengan alamat backend kamu (default backend berjalan di port `3000`).

3. Jalankan aplikasi dalam mode development. **Karena backend juga memakai port `3000`, jalankan frontend di port lain**, misalnya `3001`:

   ```bash
   npm run dev -- -p 3001
   ```

   Buka `http://localhost:3001` di browser.

## Struktur Halaman

```
src/
├── app/
│   ├── page.tsx                  # Redirect otomatis ke /login atau /leads
│   ├── login/
│   │   └── page.tsx              # Halaman login
│   └── (dashboard)/               # Route group dengan layout + route protection
│       ├── layout.tsx             # Navbar + cek autentikasi
│       ├── leads/
│       │   ├── page.tsx           # List Lead
│       │   └── [id]/page.tsx      # Detail Lead, update status, convert ke SPK
│       ├── spk/
│       │   ├── page.tsx           # List SPK
│       │   └── [id]/page.tsx      # Detail SPK, kirim & review
│       └── users/
│           └── page.tsx           # Kelola user (khusus Admin)
├── lib/
│   ├── apiClient.ts               # Axios instance + interceptor
│   ├── authStore.ts                # Zustand store untuk auth state
│   └── api/                        # Fungsi pemanggilan API per resource
│       ├── leads.ts
│       ├── spk.ts
│       └── users.ts
└── types/                          # Type definitions (auth, lead, spk)
```

## Role & Tampilan

| Halaman   | Admin | Sales | Finance |
|-----------|:-----:|:-----:|:-------:|
| `/leads`  | ✅ (semua) | ✅ (miliknya) | ✅ (lihat saja) |
| `/spk`    | ✅ (semua) | ✅ (miliknya) | ✅ (yang sudah dikirim) |
| `/users`  | ✅    | ❌ (auto-redirect) | ❌ (auto-redirect) |

Pembatasan akses di frontend hanya bersifat UX (menyembunyikan menu, redirect halaman). Validasi sesungguhnya tetap dilakukan di backend lewat RBAC guard, sehingga akses langsung lewat API tanpa melalui UI tetap aman.

## Alur Penggunaan Singkat

1. Login menggunakan akun yang sudah didaftarkan di backend (lihat README backend untuk cara register).
2. **Sebagai Sales**: buat Lead baru → update status bertahap hingga `WON` → konversi ke SPK → isi detail proyek → kirim SPK ke Finance.
3. **Sebagai Finance**: buka halaman SPK → pilih SPK yang sudah dikirim → setujui atau tolak (catatan wajib diisi jika menolak).
4. **Sebagai Admin**: dapat mengakses seluruh data Lead/SPK serta mengelola user di halaman `/users`.
5. Riwayat setiap perubahan status dapat dilihat di bagian bawah halaman detail Lead maupun SPK.

## Catatan Implementasi

- Auth state disimpan via Zustand `persist` ke `localStorage`. Layout dashboard menunggu proses *hydration* selesai (`hasHydrated`) sebelum memutuskan redirect, sehingga refresh halaman tidak salah melempar user ke halaman login.
- Axios response interceptor menangani `401 Unauthorized` secara otomatis dengan logout dan redirect ke `/login`, berguna saat token sudah kedaluwarsa.