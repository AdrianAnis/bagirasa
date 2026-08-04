# Setup Awal Project — BagiRasa

Panduan urut dari nol sampai skeleton siap dikembangkan. Ikuti dari atas ke bawah. Command aman untuk Windows (PowerShell/CMD) maupun macOS/Linux.

Target akhir: Next.js + TypeScript + Tailwind v4 + shadcn/ui + Supabase tersambung, struktur folder sesuai `aturanstrukturfolder.md`, design system terpasang, dan `npm run dev` jalan.

---

## 0. Prasyarat

- **Node.js 22 LTS ke atas** — cek: `node -v`. Supabase `v2.112+` tidak lagi mendukung Node 20, dan Vercel menjalankan Node 22 di produksi.
- **Akun Supabase** (gratis) — untuk database, auth, storage.
- **Akun Google AI Studio** — untuk API key Gemini (dipakai nanti, bukan sekarang).
- **Akun Fonnte** — untuk WhatsApp gateway (dipakai nanti).
- Editor (VS Code) + Git terpasang.

---

## 1. Buat Project Next.js

```bash
npx create-next-app@latest bagirasa
```

Jawab prompt-nya seperti ini:

| Prompt | Jawaban |
|---|---|
| TypeScript | **Yes** |
| ESLint | **Yes** |
| Tailwind CSS | **Yes** |
| `src/` directory | **No** ← penting, struktur kita flat |
| App Router | **Yes** |
| Turbopack | **Yes** |
| import alias `@/*` | **Yes** (biarkan default) |

Lalu masuk ke folder project:

```bash
cd bagirasa
```

> `create-next-app` sudah otomatis memasang Tailwind v4 (pakai `@import "tailwindcss"` di `globals.css`, tanpa `tailwind.config.js`).

---

## 2. Bersihkan Boilerplate

- Kosongkan isi `app/page.tsx` menjadi halaman minimal.
- Hapus contoh CSS bawaan di `app/globals.css` **kecuali** baris `@import "tailwindcss";`.
- Hapus aset contoh di `public/` yang tidak dipakai (opsional).

`app/page.tsx` sementara:
```tsx
export default function Home() {
  return (
    <main className="flex min-h-svh items-center justify-center">
      <h1 className="text-2xl font-semibold">BagiRasa</h1>
    </main>
  );
}
```

---

## 3. Susun Struktur Folder

Buat folder sesuai `aturanstrukturfolder.md`. Lewat VS Code atau command:

```bash
mkdir components components/ui components/shared
mkdir lib lib/supabase lib/db lib/validations
mkdir types supabase supabase/migrations
```

Struktur `app/api` per-domain menyusul saat fitur dibangun (belum perlu sekarang).

Route group di `app/` — `(landing)`, `(auth)`, `(donor)`, `(recipient)` — dibuat sesuai `aturanstrukturfolder.md`. Halaman minimal dari langkah 2 pindah ke `app/(landing)/page.tsx`; tanda kurung membuat nama grup tidak ikut jadi segmen URL, jadi halaman itu tetap melayani `/`.

---

## 4. Setup shadcn/ui

```bash
npx shadcn@latest init -b radix -p nova
```

CLI shadcn v4 tidak lagi menanyakan *base color*. Yang ditanyakan sekarang **preset**, dan flag `-b` berarti **component library**:

| Flag | Arti | Pilihan kita |
|---|---|---|
| `-b` | pustaka komponen: `base`, `radix`, `aria` | `radix` — sesuai `techstack.md` §1 |
| `-p` | preset gaya: `nova`, `vega`, `maia`, `lyra`, `mira`, `luma`, `sera`, `rhea` | `nova` |

Tanpa kedua flag itu CLI akan berhenti menunggu input. Perintah ini akan:
- membuat `components.json`,
- menyiapkan CSS variables di `app/globals.css`,
- menimpa `lib/utils.ts` dengan helper `cn` versi `clsx` + `tailwind-merge`.

Tambah satu komponen untuk tes:
```bash
npx shadcn@latest add button
```

> Jika `init` menolak karena Tailwind, pastikan langkah 1 memasang Tailwind v4 dan `globals.css` punya `@import "tailwindcss";`.

---

## 5. Install Dependency Lain

```bash
npm install @supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers recharts lucide-react sonner
```

- `@supabase/*` — database, auth, storage.
- `zod` + `react-hook-form` + `@hookform/resolvers` — validasi & form.
- `recharts` — chart analitik.
- `lucide-react` — ikon.
- `sonner` — toast notifikasi.

(`clsx` & `tailwind-merge` sudah ikut terpasang lewat shadcn.)

---

## 6. Buat Project Supabase

1. Buka dashboard Supabase → **New Project**. Catat password database.
2. Setelah project jadi, buka **Project Settings → API**.
3. Ambil: **Project URL**, **anon/publishable key**, dan **service_role key**.

---

## 7. Environment Variables

Buat file `.env.local` di root project:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

SUPABASE_SERVICE_ROLE_KEY=eyJ...

GEMINI_API_KEY=
FONNTE_API_TOKEN=
```

Aturan: hanya `NEXT_PUBLIC_*` yang boleh ke client. `SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `FONNTE_API_TOKEN` **hanya di server**. `.env.local` sudah otomatis masuk `.gitignore` — jangan di-commit.

---

## 8. Setup Supabase Client (4 file)

### `lib/supabase/env.ts` — validasi environment variable
`aturanpenulisancode.md` §2 melarang non-null assertion (`!`) sembarangan, jadi env divalidasi sekali di sini lalu diimpor tiga file lainnya. Kalau `.env.local` belum terisi, error-nya jelas sejak awal, bukan `undefined` yang meledak di tengah request.

```ts
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL belum diisi di .env.local");
}

if (!supabaseAnonKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY belum diisi di .env.local");
}

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;
```

> Tulis `process.env.NEXT_PUBLIC_X` sebagai akses properti utuh seperti di atas. Next hanya menyisipkan nilainya ke bundle browser bila ditulis begitu — destructuring `const { NEXT_PUBLIC_X } = process.env` tidak ikut tersisip.

### `lib/supabase/client.ts` — untuk Client Component
```ts
import { createBrowserClient } from "@supabase/ssr";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
```

### `lib/supabase/server.ts` — untuk Server Component, Route Handler
```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          return;
        }
      },
    },
  });
}
```

### `lib/supabase/middleware.ts` — otak refresh session
```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}
```

### `proxy.ts` — di **root project**, pemanggil tipis
Sejak Next.js 16, konvensi file `middleware.ts` **deprecated** dan diganti `proxy.ts`. Fungsinya sama: kode yang jalan di server sebelum request mencapai route.

```ts
import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

Aturan file ini:
- **Harus di root project**, sejajar dengan `app/` — Next hanya mencarinya di situ, bukan hasil impor.
- Export bernama `proxy` (atau default export). Satu file, satu fungsi.
- `config.matcher` menentukan path mana yang dilewati.

Logika ditaruh di `lib/supabase/middleware.ts`, bukan di `proxy.ts`, mengikuti prinsip "route tipis, logic di `lib/`" (`aturanstrukturfolder.md` §2) sekaligus memenuhi daftar file di `aturanstrukturfolder.md`.

> Di server, selalu verifikasi user dengan `supabase.auth.getUser()`, bukan `getSession()` — token divalidasi ke server auth.

---

## 9. Design System (warna & font)

### Font Poppins — di `app/layout.tsx`
```tsx
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={poppins.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

### Token warna & font — di `app/globals.css`
Tambahkan blok `@theme` (Tailwind v4) di bawah import & variable shadcn:
```css
@import "tailwindcss";

@theme {
  --color-brand: #23674e;
  --font-sans: var(--font-poppins);
}
```

Setelah ini bisa dipakai: `bg-brand`, `text-brand`, dan font Poppins otomatis jadi default.

---

## 10. Konstanta Inti — `lib/config.ts`
```ts
export const MAX_RADIUS_KM = 15;

export const MATCH_WEIGHTS = {
  distance: 0.4,
  need: 0.35,
  fairness: 0.25,
} as const;

export const BASE_ALLERGENS = [
  "kacang",
  "susu",
  "telur",
  "seafood",
  "gluten",
  "kedelai",
] as const;
```

---

## 11. Jalankan & Verifikasi

```bash
npm run dev
```

Buka `http://localhost:3000`. Ceklis:
- Halaman muncul tanpa error.
- Font Poppins aktif.
- Class `bg-brand` menghasilkan warna hijau `#23674E`.
- Tidak ada error Supabase di terminal.

---

## 12. Git

```bash
git init
git add .
git commit -m "chore: setup awal project bagirasa"
```

Buat repo di GitHub, lalu:
```bash
git branch -M main
git remote add origin <url-repo>
git push -u origin main
```

---

## 13. (Nanti) Type Database dari Supabase

Setelah schema (`schemadatabase.md`) diterapkan ke Supabase, generate tipe TypeScript:

```bash
npm install -D supabase
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase gen types typescript --linked > types/database.types.ts
```

Tipe ini dipakai di seluruh query agar type-safe end-to-end.

---

## Checklist Selesai Setup

- [ ] Next.js + TS + Tailwind v4 jalan (`npm run dev`)
- [ ] Struktur folder sesuai `aturanstrukturfolder.md` (tanpa `src/`)
- [ ] shadcn/ui terpasang, `lib/utils.ts` ada
- [ ] Dependency inti terpasang
- [ ] Project Supabase dibuat, `.env.local` terisi
- [ ] 4 file Supabase (`env`, `client`, `server`, `middleware`) + `proxy.ts` di root dibuat
- [ ] Font Poppins & warna `brand` aktif
- [ ] `lib/config.ts` dibuat
- [ ] Git init + commit pertama + push

Setelah semua ceklis, lanjut ke milestone M1 di `prd.md`: terapkan schema ke Supabase + aktifkan RLS.