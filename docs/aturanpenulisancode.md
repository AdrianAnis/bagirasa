# Aturan Penulisan Kode — BagiRasa

Standar wajib untuk seluruh kode BagiRasa. Tujuan: kode bersih, konsisten, aman, dan **self-documenting**.

---

## 1. Prinsip Utama: DILARANG KERAS Menulis Komentar

**Tidak ada komentar apa pun di dalam kode.** Larangan ini mutlak, mencakup **semua** bentuk komentar:

- Komentar baris: `// ...`
- Komentar blok: `/* ... */`
- Komentar JSX: `{/* ... */}`
- JSDoc / doc comment: `/** ... */`
- Komentar di CSS: `/* ... */`
- Komentar penanda: `// TODO`, `// FIXME`, `// eslint-disable`, section separator, dsb.

```ts
// ❌ SALAH — semua di bawah ini dilarang
// fungsi untuk menghitung jarak
function haversine(a: Coord, b: Coord) { ... }

const donations = await getDonations(); // ambil data donasi

/* hitung total porsi */
const total = sumServings(items);
```

```ts
// ✅ BENAR — nol komentar
function haversine(a: Coord, b: Coord) { ... }

const donations = await getDonations();

const total = sumServings(items);
```

(Tanda ❌/✅ di atas hanya penanda dokumen ini, bukan bagian dari kode project.)

Aturan:
- Kejelasan **hanya** boleh datang dari nama variabel, fungsi, dan tipe yang baik — bukan komentar.
- Kalau merasa butuh komentar untuk menjelaskan kode, itu tanda kodenya kurang jelas → **perbaiki penamaan atau pecah fungsinya**, jangan tambah komentar.
- Saat menyentuh kode lama yang ada komentarnya, **hapus semua komentarnya**.
- Jangan tinggalkan kode ter-comment (dead code) → hapus, bukan di-comment.
- Perkecualian teknis satu-satunya: direktif wajib yang secara fungsional **bukan** komentar penjelasan, seperti `"use client"`, `"use server"`, dan `import "server-only"`. Ini pragma, bukan komentar.

---

## 2. TypeScript

- `strict: true`, **dilarang `any`**. Pakai `unknown` + penyempitan tipe bila perlu.
- Pakai tipe hasil `supabase gen types` untuk semua data database.
- Prefer `type` untuk union/utility, `interface` untuk kontrak objek yang bisa diperluas.
- Jangan pakai non-null assertion (`!`) sembarangan; tangani nilai `null`/`undefined` secara eksplisit.
- Definisikan tipe return fungsi publik secara eksplisit.

---

## 3. Penamaan

| Elemen | Konvensi | Contoh |
|---|---|---|
| Variabel & fungsi | `camelCase` | `totalServings`, `createDonation` |
| Komponen React | `PascalCase` | `DonationForm` |
| Tipe & interface | `PascalCase` | `DonationMatch` |
| Konstanta global | `UPPER_SNAKE_CASE` | `MAX_RADIUS_KM` |
| Boolean | awali `is/has/should/can` | `isVerified`, `hasAllergen` |
| Fungsi | kata kerja | `calculateScore`, `sendWhatsApp` |
| Hook | awali `use` | `useDonations` |

Nama harus deskriptif dan jujur. Hindari singkatan tak jelas (`d`, `tmp`, `data2`).

---

## 4. Fungsi & Struktur

- Fungsi kecil, satu tanggung jawab.
- **Early return** untuk kurangi nesting; hindari `else` panjang.
```ts
function getStatusLabel(status: MatchStatus) {
  if (status === "pending") return "Menunggu";
  if (status === "accepted") return "Diterima";
  return "Selesai";
}
```
- Dilarang nested ternary. Pakai `if` atau lookup object.
- Batasi parameter; jika ≥ 4, gunakan satu objek parameter.
- Komponen React panjang → pecah jadi sub-komponen di `components/<fitur>/`.

---

## 5. React & Next.js

- **Default Server Component**. Tambahkan `"use client"` hanya saat butuh interaktivitas/state/hook browser.
- **Route handler tipis, logic di `lib/`.** `app/api/<domain>/route.ts` hanya: validasi Zod → cek auth → panggil fungsi `lib/` → balikin response. Algoritma & query hidup di `lib/`, bukan di dalam route.
- **Baca via Server Component**: untuk sekadar membaca data, panggil `lib/db/*` langsung dari Server Component. Simpan `app/api/` untuk mutasi, integrasi eksternal, webhook, dan cron.
- Named export untuk komponen & util. Default export hanya di file yang mewajibkannya (`page.tsx`, `layout.tsx`, `route.ts`).
- Jangan taruh logika bisnis berat di dalam JSX; ekstrak ke fungsi/hook.
- Key list memakai id stabil, bukan index array.
- Data fetching utama di server; hindari fetch di `useEffect` bila bisa dikerjakan di server.

---

## 6. Styling (Tailwind)

- Pakai utility Tailwind; **dilarang inline style** (`style={{...}}`) kecuali nilai dinamis yang tak bisa diekspresikan Tailwind.
- Gabungkan class kondisional dengan `cn()` (clsx + tailwind-merge).
```ts
<button className={cn("rounded-lg px-4 py-2", isActive && "bg-primary text-white")} />
```
- Warna & spacing mengikuti token design system (jangan hardcode hex acak di JSX).
- Semua UI wajib responsif (mobile-first).

---

## 7. Validasi & Form

- Semua input tervalidasi dengan **Zod**, di client **dan** server.
- Satu schema Zod jadi sumber kebenaran; turunkan tipe dengan `z.infer`.
- Form pakai React Hook Form + `zodResolver`.
- Jangan pernah percaya data dari client; validasi ulang di Route Handler sebelum diproses.

---

## 8. Async & Error Handling

- Pakai `async/await`, bukan rantai `.then()`.
- Bungkus operasi yang bisa gagal (DB, Gemini, Fonnte) dengan penanganan error eksplisit.
- Jangan telan error diam-diam. Kembalikan hasil yang jelas ke pemanggil. Pola hasil untuk fungsi `lib/` / route handler:
```ts
type Result<T> = { ok: true; data: T } | { ok: false; error: string };
```
- Pesan error yang ditujukan ke pengguna: ramah & informatif. Detail teknis cukup di log server.

---

## 9. Keamanan (sesuai tema lomba)

- **Secret tidak pernah ke client.** `GEMINI_API_KEY`, `FONNTE_API_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY` hanya di server.
- File server-only diberi `import "server-only"`.
- Andalkan **RLS Supabase** sebagai lapisan otorisasi utama; jangan hanya mengandalkan pengecekan di client.
- Validasi & sanitasi semua input server-side.
- Jangan log data sensitif (dokumen identitas, token).
- Panggilan Gemini & Fonnte selalu dari server.

---

## 10. Impor & Organisasi

- Pakai path alias `@/`. Hindari `../../../`.
- Urutan impor: (1) library eksternal, (2) modul internal `@/`, (3) relatif, (4) tipe.
- Taruh komponen UI di `components/`, logika & query di `lib/`, dan endpoint tipis di `app/api/<domain>/` (lihat `aturanstrukturfolder.md`).
- Hindari file "barrel" `index.ts` yang menumpuk banyak re-export bila menyulitkan tree-shaking.

---

## 11. Konstanta

- Angka/aturan yang bisa berubah (bobot matching, radius, daftar alergen) ditaruh di `lib/config.ts`, bukan hardcode tersebar. Contoh isi `lib/config.ts`:
```ts
export const MAX_RADIUS_KM = 15;
export const MATCH_WEIGHTS = { distance: 0.4, need: 0.35, fairness: 0.25 } as const;
```

---

## 12. Git & Commit

- **Conventional Commits**: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `style:`.
```
feat(donation): tambah input multi-item
fix(matching): perbaiki normalisasi jarak haversine
```
- Commit kecil & fokus. Satu commit = satu perubahan logis.
- Branch per fitur: `feat/donation-form`, `feat/matching-algo`.

---

## 13. Checklist Sebelum Commit

- [ ] **Nol komentar** — tidak ada `//`, `/* */`, `/** */`, `{/* */}`, atau komentar CSS di mana pun. Tidak ada dead code.
- [ ] Tidak ada `any`, `console.log` sisa, atau secret ter-hardcode.
- [ ] Semua input tervalidasi Zod (client & server).
- [ ] Lolos `tsc` (tanpa error tipe), ESLint, dan Prettier.
- [ ] Nama variabel/fungsi jelas dan jujur.
- [ ] Komponen client hanya di tempat yang benar-benar perlu.
- [ ] Tidak ada secret yang bocor ke client.
