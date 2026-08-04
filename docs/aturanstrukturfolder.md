# Aturan Struktur Folder — BagiRasa

Struktur **flat** di atas Next.js App Router, tanpa `src/`. Routing dan endpoint dikelompokkan **per-domain** di dalam `app/`, sementara seluruh logika inti hidup di `lib/`. Konsisten dengan pola project lain (AdaTelur, Panen Pasti).

---

## 1. Struktur Utama

```
bagirasa/
├── app/                         # Routing, halaman, dan endpoint (per-domain)
│   ├── (landing)/               # Landing page publik
│   ├── (auth)/                  # login, register, choose-role
│   ├── (donor)/                 # Dashboard restoran
│   ├── (recipient)/             # Dashboard panti/lansia
│   ├── admin/                   # Panel verifikasi admin
│   ├── api/                     # Route Handlers, dikelompokkan per-domain
│   │   ├── auth/
│   │   ├── admin/               # verifikasi akun
│   │   ├── donors/
│   │   ├── recipients/
│   │   ├── donations/           # input & daftar donasi
│   │   ├── matches/             # terima/tolak/konfirmasi
│   │   ├── matching/            # jalankan algoritma + batch
│   │   ├── feedback/            # rating restoran
│   │   ├── assistant/           # insight AI Gemini
│   │   ├── whatsapp/            # kirim notifikasi via Fonnte
│   │   ├── upload-image/
│   │   └── cron/                # cleanup donasi kedaluwarsa
│   ├── globals.css
│   ├── layout.tsx
│   └── providers.tsx
│
├── components/                  # UI
│   ├── ui/                      # komponen shadcn/ui
│   ├── shared/                  # navbar, footer, empty-state (lintas fitur)
│   ├── donation/                # komponen khusus fitur donasi
│   ├── recipient/
│   └── analytics/
│
├── lib/                         # OTAK: semua logika, query, integrasi
│   ├── supabase/                # client.ts, server.ts, middleware.ts
│   ├── db/                      # fungsi query & mutasi per-domain
│   │   ├── donations.ts
│   │   ├── recipients.ts
│   │   ├── matches.ts
│   │   └── feedback.ts
│   ├── matching.ts              # algoritma haversine + batch (fungsi murni)
│   ├── gemini.ts                # integrasi Gemini
│   ├── fonnte.ts                # integrasi WhatsApp
│   ├── validations/             # schema Zod per-domain
│   ├── utils.ts                 # fungsi murni (cn, format, dll)
│   └── config.ts                # konstanta (bobot matching, radius, alergen baku)
│
├── types/
│   └── database.types.ts        # hasil `supabase gen types` + tipe global
│
├── supabase/
│   ├── migrations/              # SQL migration
│   └── seed.sql                 # data demo
│
├── public/                      # aset statis
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 2. Prinsip Inti: Route Tipis, Logic di `lib/`

Ini aturan paling penting yang menjaga pola `app/api/` per-domain tetap bersih.

**Route Handler = controller tipis.** Isinya hanya:
1. Validasi input dengan Zod.
2. Cek autentikasi & otorisasi.
3. Panggil fungsi dari `lib/`.
4. Kembalikan response.

**`lib/` = otak.** Semua algoritma, akses database, dan integrasi eksternal (Gemini, Fonnte) hidup di sini sebagai fungsi yang bisa dipakai ulang dan dites tanpa menembak HTTP.

```ts
// app/api/matching/route.ts  → tipis
export async function POST(req: Request) {
  const body = matchingSchema.parse(await req.json());
  const user = await requireAuth();
  const result = await calculateMatches(body.donationId);
  return Response.json(result);
}
```

```ts
// lib/matching.ts  → otak (fungsi murni, tanpa HTTP)
export async function calculateMatches(donationId: string) { ... }
```

Manfaat: logika inti bisa dites terpisah, tidak tercampur boilerplate request/response, dan `app/api/` tetap ringan meski banyak domain.

---

## 3. Aturan Isi Tiap Folder

### `app/`
- Hanya untuk **routing, layout, page, dan route handler**. Tidak ada algoritma atau query mentah di sini.
- Route group `(landing)`, `(auth)`, `(donor)`, `(recipient)` memisah layout tanpa mengubah URL.
- Halaman (Server Component) boleh baca data dengan memanggil fungsi `lib/db/*` langsung — tidak perlu lewat `app/api/` untuk sekadar membaca.

### `app/api/<domain>/`
- Satu folder per domain (donations, matches, matching, feedback, dst).
- Berisi `route.ts` yang tipis (lihat bagian 2).
- Dipakai untuk mutasi dari client, integrasi eksternal, webhook, dan cron.

### `components/`
- `ui/` — primitif shadcn/ui, tanpa logika bisnis.
- `shared/` — komponen dipakai ≥ 2 fitur.
- `components/<fitur>/` — komponen khusus satu fitur.

### `lib/`
- `supabase/` — pembuatan client (browser & server) + helper session.
- `db/` — fungsi query & mutasi per-domain (satu file per entitas).
- `matching.ts` — algoritma matching & batch, fungsi murni.
- `gemini.ts`, `fonnte.ts` — wrapper integrasi eksternal, selalu server-side.
- `validations/` — schema Zod, satu sumber kebenaran validasi.
- `utils.ts` — fungsi murni tanpa efek samping.
- `config.ts` — konstanta yang bisa berubah (bobot matching, radius, daftar alergen).

### `types/`
- `database.types.ts` — hasil `supabase gen types`. Jangan diedit manual.

### `supabase/`
- `migrations/` — perubahan schema sebagai file SQL bernomor urut.
- `seed.sql` — data demo untuk presentasi final.

---

## 4. Aturan Umum

1. **Route tipis, logic di `lib/`** (bagian 2) — aturan utama.
2. **`app/` tidak menyimpan logika berat** — semua algoritma & query di `lib/`.
3. **Validasi di batas route** — setiap route handler memvalidasi body dengan Zod sebelum memprosesnya. Jangan percaya data mentah dari client.
4. **Server-only terisolasi** — file yang memakai secret (Gemini, Fonnte, service role) diberi `import "server-only"` dan tidak pernah diimpor komponen client.
5. **Path alias `@/`** — gunakan untuk root project, hindari `../../../`.
6. **Tipe dibagikan** — client `fetch` dan server memakai tipe dari `types/database.types.ts` agar bentuk data konsisten.
7. **Baca via Server Component** — untuk sekadar membaca data, panggil `lib/db/*` dari Server Component; simpan `app/api/` untuk mutasi, integrasi eksternal, webhook, dan cron.

---

## 5. Konvensi Penamaan File

| Jenis | Konvensi | Contoh |
|---|---|---|
| Komponen React | `PascalCase.tsx` | `DonationForm.tsx` |
| Route handler | `route.ts` (konvensi Next) | `app/api/donations/route.ts` |
| Page / layout | konvensi Next | `page.tsx`, `layout.tsx` |
| Fungsi lib / util | `kebab.ts` atau `camelCase.ts` | `matching.ts`, `donations.ts` |
| Schema Zod | `kebab.ts` | `validations/donation.ts` |
| Hook | `use-kebab.ts` | `use-donations.ts` |

Detail aturan penamaan variabel & ekspor ada di `aturanpenulisancode.md`.
