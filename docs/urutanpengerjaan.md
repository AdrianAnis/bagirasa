# Urutan Pengerjaan — BagiRasa

Peta build dari nol sampai deploy & demo final. Kerjakan berurutan; tiap fase punya **Definition of Done (DoD)** — jangan lanjut sebelum DoD terpenuhi. Referensi detail ada di `prd.md`, `schemadatabase.md`, `techstack.md`, `aturanstrukturfolder.md`, `aturanpenulisancode.md`, dan `setup.md`.

---

## Peta Cepat

| Fase | Fokus | Fitur |
|---|---|---|
| 0 | Setup project | — |
| 1 | Fondasi data & auth | Registrasi berbasis peran |
| 2 | Core Donor | Fitur 2 (input donasi) |
| 3 | Matching & Distribusi | Fitur 1, 7, 8 |
| 4 | Notifikasi WhatsApp | Fitur 1 (notif) |
| 5 | Core Recipient | Fitur 2 (sisi penerima), FR-5 |
| 6 | Feedback & Scoring | Fitur 3 |
| 7 | Analitik & AI | Fitur 4 |
| 8 | Admin & Landing | Fitur 5, 6 |
| 9 | Polish UI/UX | — |
| 10 | Deploy | — |
| 11 | Proposal & Demo | — |

**Timeline lomba:** batas pengumpulan Batch II **27 September 2026**, Grand Final **5–6 Oktober 2026**. Target: Fase 0–9 selesai sebelum submit, Fase 11 (proposal) selesai bersamaan, polish demo menjelang final.

**Prioritas nilai:** UI/UX 25%, Kejelasan Masalah & Solusi 20%, Kesesuaian Tema 15%, Kreativitas 15%, Fungsi & Fitur 15%, Teknologi Terkini 10%. Artinya: Fase 9 (polish) dan kejelasan alur fitur bukan afterthought — itu penentu skor.

---

## Fase 0 — Setup Project

**Tujuan:** skeleton jalan, semua tooling siap.

Ikuti `setup.md` dari awal sampai akhir.

- [ ] Next.js + TS + Tailwind v4 jalan (`npm run dev`)
- [ ] Struktur folder sesuai `aturanstrukturfolder.md` (tanpa `src/`)
- [ ] shadcn/ui terpasang
- [ ] Dependency inti terpasang
- [ ] Project Supabase dibuat, `.env.local` terisi
- [ ] 3 file Supabase client (`client`, `server`, `middleware`)
- [ ] Design system (Poppins + warna `brand`) aktif
- [ ] `lib/config.ts` dibuat
- [ ] Git init + commit + push
- [ ] **Deploy kosong ke Vercel** (aktifkan continuous deploy dari awal)

**DoD:** halaman skeleton tampil di localhost **dan** di URL Vercel, tanpa error.

---

## Fase 1 — Fondasi Data & Auth

**Tujuan:** database siap dengan keamanan, dan orang bisa daftar/login sesuai peran.

- [ ] Terapkan schema `schemadatabase.md` ke Supabase (enum, tabel, index, trigger)
- [ ] **Aktifkan RLS** + policy per tabel (inti klaim "trusted/secure")
- [ ] Generate tipe: `npx supabase gen types typescript --linked > types/database.types.ts`
- [ ] Halaman `register` → pilih peran (Penyumbang / Penerima) → jika Penerima, pilih sub-tipe (Panti / Rumah Lansia)
- [ ] Halaman `login` + logout
- [ ] Trigger auto-buat `profiles` saat signup
- [ ] Proteksi route via `middleware.ts` (redirect belum-login)
- [ ] Guard berbasis peran (donor/recipient/admin akses area masing-masing)
- [ ] Storage bucket privat untuk KTP & dokumen legal

**Fitur:** registrasi berbasis peran (bagian dari Fitur 5).
**DoD:** bisa daftar sebagai donor & recipient, login, dan tiap peran hanya bisa akses areanya. Data antar peran terisolasi (uji RLS).

---

## Fase 2 — Core Donor

**Tujuan:** restoran bisa lengkapi profil dan input donasi multi-item.

- [ ] Form profil restoran (nama, lokasi/koordinat, telepon, foto, KTP) → simpan ke `donors`
- [ ] Map picker / input koordinat untuk lokasi
- [ ] Form input donasi multi-item (`food_donations` + `food_items`)
- [ ] Per item: nama, foto, jenis, ketahanan, halal, bahan, kuantitas, porsi
- [ ] Validasi Zod di form & route handler
- [ ] Ekstraksi alergen versi manual dulu (input tag alergen); AI menyusul di Fase 7
- [ ] Dashboard donor + histori donasi (list + status)

**Fitur:** Fitur 2 (template input sisa makanan).
**DoD:** donor bisa membuat donasi berisi beberapa item lengkap, tersimpan, dan tampil di histori.

---

## Fase 3 — Matching & Distribusi (inti teknis)

**Tujuan:** otak sistem — mencocokkan & membagi donasi secara adil dan aman.

- [ ] `lib/matching.ts`: haversine distance (fungsi murni)
- [ ] Filter keras: verified, halal cocok, alergen aman, dalam radius
- [ ] Skor matching: proximity + need + fairness (bobot dari `lib/config.ts`)
- [ ] **Mode Auto**: alokasi single, atau batch bila porsi melebihi 1 penerima
- [ ] **Mode Manual**: donor pilih panti, bisa tambah panti selama sisa porsi > 0
- [ ] Guardrail manual: panti terakhir dapat alokasi **parsial**; tombol tambah terkunci saat sisa = 0
- [ ] **Invariant server**: Σ `allocated_servings` ≤ total porsi donasi
- [ ] Tulis baris `donation_matches` sesuai hasil alokasi
- [ ] UI pilih mode (Auto/Recommended vs Manual) saat kirim donasi

**Fitur:** Fitur 1 (matching), Fitur 7 (pilih mode), Fitur 8 (batch).
**DoD:** donasi kecil → 1 penerima; donasi besar mode auto → terbagi adil; mode manual → donor kontrol penuh tapi tak bisa over-commit. Semua lolos filter keamanan.

---

## Fase 4 — Notifikasi WhatsApp (Fonnte)

**Tujuan:** penerima langsung tahu ada donasi masuk.

- [ ] `lib/fonnte.ts`: wrapper kirim WA (server-only, via fetch)
- [ ] Kirim notifikasi ke penerima saat match dibuat
- [ ] Catat tiap pengiriman ke `wa_logs`
- [ ] Notifikasi in-app (`notifications`) + badge belum-dibaca
- [ ] Rate limiting pengiriman (anti-abuse)

**Fitur:** Fitur 1 (notifikasi via WA).
**DoD:** buat match → penerima menerima pesan WA + notifikasi in-app; pengiriman tercatat di `wa_logs`.

---

## Fase 5 — Core Recipient

**Tujuan:** penerima bisa merespons donasi dengan info keamanan yang jelas.

- [ ] Form profil penerima (kapasitas/jumlah penghuni, kebutuhan, pantangan/alergen, foto, dokumen legal)
- [ ] Dashboard penerima: daftar donasi masuk
- [ ] Detail donasi tampilkan **bahan, halal, alergen** dengan jelas
- [ ] Aksi terima / tolak → update `donation_matches.status`
- [ ] Alur konfirmasi penyerahan → `handed_over_at`
- [ ] Update `last_received_at` & `current_need` setelah terima
- [ ] Histori penerimaan

**Fitur:** Fitur 2 (info alergi sisi penerima), FR-5.
**DoD:** penerima melihat donasi lengkap info keamanan, bisa terima/tolak, dan menyelesaikan penyerahan.

---

## Fase 6 — Feedback & Scoring

**Tujuan:** reputasi restoran terbangun dari umpan balik penerima.

- [ ] Form rating + komentar dari penerima setelah penyerahan (`feedbacks`)
- [ ] Hitung ulang `donors.reputation_score` dari agregat rating
- [ ] Tampilkan skor reputasi di profil/dashboard donor

**Fitur:** Fitur 3 (scoring system).
**DoD:** penerima memberi rating → skor reputasi restoran ter-update dan tampil.

---

## Fase 7 — Analitik & AI (Gemini)

**Tujuan:** ubah data jadi insight — bagian yang "wow" saat demo.

- [ ] `lib/gemini.ts`: wrapper Gemini (server-only, output dipaksa JSON)
- [ ] Dashboard analitik donor: statistik donasi, porsi, tren (Recharts)
- [ ] Insight AI: ringkasan tren, waktu puncak surplus, estimasi dampak (porsi/kg/CO₂), rekomendasi → simpan ke `waste_insights`
- [ ] Upgrade ekstraksi alergen ke AI (dari teks bahan → tag alergen, bisa dikoreksi)

**Fitur:** Fitur 4 (analitik dashboard).
**DoD:** dashboard menampilkan grafik + kartu insight AI berbahasa natural; ekstraksi alergen otomatis jalan.

---

## Fase 8 — Admin & Landing

**Tujuan:** jaga kepercayaan ekosistem + wajah publik produk.

- [ ] Panel admin: daftar akun `pending` → setujui/tolak donor & penerima
- [ ] Setelah verifikasi, akun bisa bertransaksi
- [ ] Landing page: misi, cara kerja, dampak (relevan tema & SDG)
- [ ] **Tautan donasi (uang) di footer** landing page

**Fitur:** Fitur 5 (verifikasi admin), Fitur 6 (landing + footer donasi).
**DoD:** admin bisa verifikasi akun; landing page publik tampil rapi dengan footer donasi.

---

## Fase 9 — Polish UI/UX (penentu skor)

**Tujuan:** dari "berfungsi" jadi "kelihatan juara". Bobot UI/UX 25%.

- [ ] Responsif penuh: mobile, tablet, desktop
- [ ] Konsistensi spacing, tipografi, hierarki (standar `ui-ux-design` skill)
- [ ] Loading state, empty state, error state di setiap halaman
- [ ] Micro-interaction & transisi halus
- [ ] Aksesibilitas: semantik HTML, kontras, navigasi keyboard
- [ ] Toast (sonner) konsisten untuk feedback aksi
- [ ] Konsisten dengan design system (`#23674E` + Poppins, modern-minimalis-clean)
- [ ] Seed data demo (`supabase/seed.sql`) untuk skenario presentasi

**DoD:** setiap layar rapi, responsif, dan punya state lengkap. Tidak ada tampilan "template/AI-generated".

---

## Fase 10 — Deploy

**Tujuan:** produksi stabil & aman.

- [ ] Set semua environment variable di Vercel (production)
- [ ] Pastikan secret hanya di server (tidak ada key bocor ke client)
- [ ] Cek RLS aktif di project Supabase produksi
- [ ] Uji alur end-to-end di URL produksi (daftar → donasi → match → terima → rating)
- [ ] Cek responsif & performa di produksi
- [ ] (Opsional) custom domain

**DoD:** aplikasi jalan penuh di URL produksi, aman, tanpa error, siap dinilai.

---

## Fase 11 — Proposal & Demo

**Tujuan:** kemasan yang bikin juri paham nilai produk.

- [ ] Susun **proposal** sesuai sistematika guidebook (Sampul → Daftar Isi → Bab I–III → Pustaka → Lampiran), narasi dari `prd.md`
- [ ] Nama file submit: `SWITCH2026_WEB_<Nama Tim>_<Nama Ketua>_<Instansi>`
- [ ] Lampiran: link GitHub (akses source code) + link demo
- [ ] Siapkan slide presentasi final (5 menit presentasi + 10 menit tanya jawab)
- [ ] Susun skenario demo: alur donasi besar → batch adil → insight AI (highlight keunggulan)
- [ ] Latihan demo end-to-end pakai seed data

**DoD:** proposal terkirim sesuai format & tenggat; demo lancar dan menonjolkan matching adil + insight AI + UI rapi.

---

## Catatan Dependency

- Fase 1 memblokir semua (butuh auth & data).
- Fase 3 butuh Fase 2 (harus ada donasi untuk dicocokkan).
- Fase 4 & 5 butuh Fase 3 (notif & respons muncul setelah match).
- Fase 6 butuh Fase 5 (rating setelah penyerahan).
- Fase 7 butuh data dari Fase 2–6.
- Fase 8 sebagian bisa jalan paralel (landing page kapan saja; verifikasi admin idealnya setelah Fase 1).
- Fase 9 menyentuh semua halaman → kerjakan setelah fitur stabil.
- Deploy kosong dilakukan di Fase 0; hardening produksi di Fase 10.
