# Tech Stack — BagiRasa

Ringkasan teknologi yang dipakai beserta alasannya, selaras dengan tema lomba *NextGen Secure: Building the Future of Trusted Web Ecosystems*.

---

## 1. Ringkasan

| Layer | Teknologi |
|---|---|
| Framework | Next.js 15+ (App Router) |
| Bahasa | TypeScript (strict) |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 |
| Komponen | shadcn/ui (Radix + Tailwind) |
| Ikon | lucide-react |
| Font | Poppins |
| Database & Auth | Supabase (PostgreSQL, Auth, Storage, RLS, Realtime) |
| Backend logic | Next.js Route Handlers per-domain (TypeScript), logic di `lib/` |
| Validasi | Zod |
| Form | React Hook Form |
| Charts | Recharts |
| AI | Google Gemini API (`@google/generative-ai`) |
| WhatsApp Gateway | Fonnte |
| Toast/Notif UI | sonner |
| Deployment | Vercel |

---

## 2. Detail & Alasan

### Framework — Next.js 15+ (App Router)
Full-stack dalam satu codebase: frontend (React Server/Client Components) dan backend (Route Handlers per-domain di `app/api/`) menyatu. Mendukung rendering server yang cepat dan aman untuk data sensitif. Sesuai stack andalan tim.

> Catatan istilah: di notulensi "Backend: TypeScript" berarti logika backend ditulis dengan TypeScript **di dalam Next.js** (Route Handlers per-domain, logika inti di `lib/`), dengan Supabase sebagai Backend-as-a-Service (database, auth, storage). Tidak ada server terpisah.

### Bahasa — TypeScript (strict)
Wajib `strict: true`, tanpa `any`. Tipe database di-generate dari Supabase agar query type-safe dari ujung ke ujung.

### Styling — Tailwind CSS v4 + shadcn/ui
- Tailwind: utility-first, cepat, konsisten, mudah dibuat responsif — penting karena UI/UX bernilai 25% penilaian.
- shadcn/ui: komponen aksesibel (Radix) yang bisa dikustom penuh, cocok dengan estetika modern-minimalis-clean. Bukan template jadi — komponen di-copy ke codebase dan dimodifikasi, aman terhadap larangan "template jadi" di guidebook.

### Design System
- Warna utama: `#23674E` (hijau) + natural white sebagai netral.
- Font: Poppins.
- Tema: modern, minimalis, clean.
Token warna & tipografi didefinisikan sekali di config Tailwind dan dipakai konsisten.

### Database & Auth — Supabase
- PostgreSQL dengan **Row Level Security** — inti dari klaim "trusted & secure" untuk tema lomba.
- Auth bawaan (email/password) + tabel `profiles` untuk peran.
- Storage untuk foto & dokumen identitas (bucket privat).
- Realtime opsional untuk notifikasi in-app.

### Backend Logic — Route Handlers per-domain
- Endpoint dikelompokkan per-domain di `app/api/` (donations, matches, matching, feedback, assistant, whatsapp, dst).
- Route handler dibuat **tipis**: validasi Zod → cek auth → panggil fungsi `lib/` → balikin response.
- Algoritma, query, dan integrasi (Gemini, Fonnte) hidup di `lib/` sebagai fungsi murni yang bisa dites & dipakai ulang.
- Untuk sekadar membaca data, Server Component memanggil `lib/db/*` langsung tanpa lewat `app/api/`.
- Semua secret (service role key, API key Gemini/Fonnte) hanya hidup di server.

### Validasi & Form — Zod + React Hook Form
- Zod: satu sumber kebenaran skema validasi, dipakai di client & server.
- React Hook Form: form performant dengan integrasi Zod resolver.

### AI — Google Gemini API
- Dipakai untuk **insight analitik food waste** dan **ekstraksi alergen** (lihat PRD bagian 11).
- Selalu dipanggil server-side, output dipaksa JSON agar mudah di-parse.

### WhatsApp — Fonnte
- Gateway untuk notifikasi donasi ke penerima (Fitur 1).
- Dipanggil server-side; tiap pengiriman dicatat di `wa_logs`.
- Pengurus yang tidak pakai website tetap terjangkau lewat WhatsApp.

### Charts — Recharts
- Visualisasi analitik dashboard (tren donasi, food waste tersalurkan).

### Deployment — Vercel
- Integrasi native dengan Next.js, deploy otomatis dari Git, environment variables aman.

---

## 3. Struktur Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google Gemini (server-only)
GEMINI_API_KEY=

# Fonnte (server-only)
FONNTE_API_TOKEN=
```

Aturan:
- Hanya variabel berprefiks `NEXT_PUBLIC_` yang boleh sampai ke client.
- `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `FONNTE_API_TOKEN` **tidak pernah** diakses dari komponen client.

---

## 4. Dependency Inti

```jsonc
{
  "dependencies": {
    "next": "^15",
    "react": "^19",
    "react-dom": "^19",
    "@supabase/supabase-js": "latest",
    "@supabase/ssr": "latest",
    "@google/generative-ai": "latest",
    "zod": "latest",
    "react-hook-form": "latest",
    "@hookform/resolvers": "latest",
    "recharts": "latest",
    "lucide-react": "latest",
    "sonner": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest"
  },
  "devDependencies": {
    "typescript": "latest",
    "tailwindcss": "^4",
    "@types/node": "latest",
    "@types/react": "latest",
    "eslint": "latest",
    "prettier": "latest"
  }
}
```

> Pin versi pasti saat inisialisasi project. `latest` di sini hanya menandai dependency yang dipakai.

---

## 5. Tooling Kualitas

- **ESLint** + **Prettier** — lint & format konsisten.
- **TypeScript strict** — cegah bug tipe.
- **supabase gen types** — sinkronkan tipe DB ke kode.
- Konvensi commit: Conventional Commits (lihat `aturanpenulisancode.md`).
