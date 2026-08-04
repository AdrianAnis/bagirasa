# PRD — BagiRasa

**Product Requirements Document**
Platform penyaluran surplus makanan dari restoran ke panti asuhan & rumah lansia.

| | |
|---|---|
| Nama Produk | BagiRasa |
| Lomba | SwitchFest 2026 — Web Development (HMJ TI UIN Walisongo) |
| Tema Lomba | *NextGen Secure: Building the Future of Trusted Web Ecosystems* |
| Kategori | Web Development |
| Versi Dokumen | 1.0 |

---

## 1. Ringkasan Produk

BagiRasa adalah platform web yang menghubungkan **penyumbang makanan** (restoran, rumah makan, warteg) dengan **penerima** (panti asuhan & rumah lansia) untuk menyalurkan surplus makanan layak konsumsi secara cepat, adil, dan aman.

Sistem menyelesaikan tiga masalah sekaligus:

1. **Kecepatan penyaluran** — surplus makanan punya umur simpan pendek. BagiRasa mencocokkan donasi ke penerima terdekat yang membutuhkan secara otomatis, lalu memberi notifikasi via WhatsApp.
2. **Keadilan distribusi** — donasi besar tidak menumpuk di satu penerima. Sistem membagi (batch) ke beberapa penerima secara proporsional agar tidak ada makanan yang terbuang karena *overclaim*.
3. **Keamanan konsumsi** — setiap makanan disertai info bahan, status halal, dan alergen, sehingga penerima menerima makanan yang aman.

Nilai jual utama untuk lomba: platform ini **enabler operasional** untuk ekosistem donasi makanan yang **terpercaya dan aman** — sejalan langsung dengan tema *Trusted Web Ecosystems*.

---

## 2. Latar Belakang & Masalah

Indonesia menghasilkan food waste dalam jumlah besar, sementara banyak panti asuhan dan rumah lansia kekurangan pasokan makanan bergizi. Restoran dan warteg sering punya surplus makanan layak konsumsi di akhir hari, tetapi tidak punya kanal penyaluran yang praktis, sehingga makanan berakhir di tempat sampah.

Masalah spesifik yang diselesaikan:

- **Tidak ada jembatan operasional** antara penyumbang dan penerima yang cepat dan terverifikasi.
- **Distribusi tidak merata** — penyaluran manual cenderung ke penerima yang itu-itu saja.
- **Risiko keamanan pangan** — penerima tidak tahu isi bahan, status halal, atau alergen dari makanan donasi.
- **Kurangnya kepercayaan** — penyumbang ragu apakah penerima benar-benar valid, dan sebaliknya.

---

## 3. Relevansi Tema Lomba & SDG

### Tema: *NextGen Secure: Building the Future of Trusted Web Ecosystems*

BagiRasa membangun kepercayaan pada tiap lapisan:

- **Trust antar aktor** — verifikasi identitas (KTP/dokumen legal) oleh admin sebelum akun aktif.
- **Data security** — isolasi data per peran memakai Row Level Security (RLS) Supabase; tidak ada aktor yang bisa membaca data aktor lain.
- **Food safety & traceability** — setiap donasi punya jejak (siapa menyumbang, kapan, ke siapa, isi apa) untuk keterlacakan pangan.
- **Consumer safety** — pengecekan halal & alergen otomatis sebelum makanan disalurkan.

### SDG yang didukung

- **SDG 2 — Zero Hunger**: menyalurkan makanan ke yang membutuhkan.
- **SDG 12 — Responsible Consumption & Production** (target 12.3: mengurangi food waste): menekan makanan terbuang.
- **SDG 3 — Good Health & Well-being**: keamanan pangan lewat info alergen & halal.

---

## 4. Tujuan & Metrik Keberhasilan

### Tujuan produk

- Memungkinkan restoran menyalurkan surplus makanan dalam < 5 menit input.
- Mencocokkan donasi ke penerima yang tepat secara otomatis dan adil.
- Memastikan tiap donasi terverifikasi aman (halal/alergen) sebelum diterima.

### Metrik keberhasilan (untuk demo & proposal)

| Metrik | Target Demo |
|---|---|
| Waktu input satu donasi | < 5 menit |
| Waktu dari input ke notifikasi penerima | < 30 detik |
| Akurasi matching (penerima valid & sesuai) | 100% pada skenario uji |
| Donasi besar terbagi adil tanpa sisa terbuang | Ya |
| Estimasi dampak tampil (porsi/kg/CO₂) | Ya |

---

## 5. Target Pengguna & Persona

### Penyumbang — Restoran/Warteg
- **Bu Sari, pemilik warteg.** Punya sisa makanan tiap malam, ingin menyalurkan tanpa ribet. Melek HP tapi tidak mau instal aplikasi baru. Butuh proses cepat dan konfirmasi jelas.

### Penerima — Panti Asuhan / Rumah Lansia
- **Pak Hadi, pengurus panti.** Mengelola 30 anak. Butuh info jelas soal alergen & halal. Sebagian pengurus tidak terbiasa website, jadi diarahkan lewat WhatsApp.

### Admin — Pengelola Platform
- Memverifikasi keaslian akun restoran & penerima agar ekosistem tetap terpercaya.

---

## 6. Peran & Hak Akses (RBAC)

| Peran | Hak Akses Utama |
|---|---|
| **Donor** (restoran) | Input & kelola donasi, pilih penerima (rekomendasi/manual), lihat analitik & histori, atur profil. |
| **Recipient** (panti/lansia) | Lihat & terima/tolak donasi masuk, lihat info alergen/halal, beri rating, lihat histori. |
| **Admin** | Verifikasi akun donor & recipient, kelola laporan, akses data agregat. |

Alur registrasi menentukan peran:

```
Register
 └── Pilih peran
      ├── Penyumbang  → daftar sebagai Donor
      └── Penerima    → pilih sub-tipe
                         ├── Panti Asuhan
                         └── Rumah Lansia
```

Semua akun baru berstatus `pending` sampai diverifikasi admin.

---

## 7. Ruang Lingkup MVP

Fokus lomba: fungsi inti yang bisa didemokan penuh, bukan seluruh visi.

**Masuk MVP:**
- Auth + registrasi berbasis peran + verifikasi admin
- Input donasi (multi-item) dengan info bahan, halal, alergen
- Algoritma matching (jarak + kebutuhan) + notifikasi WhatsApp (Fonnte)
- Alur terima/tolak/konfirmasi penyerahan
- Batch distribution untuk donasi besar
- Pilih penerima: rekomendasi otomatis ATAU pilih manual
- Rating & scoring restoran
- Analitik dashboard + insight AI (Gemini)
- Landing page + tautan donasi di footer

**Di luar MVP (nice-to-have, sebutkan sebagai roadmap):**
- Aplikasi mobile native
- Integrasi pembayaran donasi uang penuh
- Live tracking kurir
- WhatsApp Business API resmi (MVP cukup gateway Fonnte)

---

## 8. Functional Requirements

Dipetakan langsung ke fitur di notulensi.

### FR-1 — Registrasi & Verifikasi (Fitur 5)
- Pengguna daftar, pilih peran, isi data + unggah dokumen (KTP restoran / dokumen legal panti).
- Akun berstatus `pending`; admin menyetujui/menolak.
- Hanya akun `verified` yang bisa transaksi.

### FR-2 — Profil Restoran (Flow Penyumbang)
- Input data: nama restoran, lokasi (koordinat), no. telepon, foto restoran, KTP.
- Edit nama & data restoran, ganti password.

### FR-3 — Input Donasi Makanan (Fitur 2)
- Donasi bisa berisi **banyak item** makanan.
- Per item: nama, foto, jenis makanan, ketahanan/umur simpan, status halal, bahan yang digunakan, kuantitas + satuan, estimasi porsi.
- Sistem mengekstrak **alergen** dari daftar bahan (dibantu AI, bisa dikoreksi manual).

### FR-4 — Matching & Rekomendasi (Fitur 1 & 7)
- Sistem menghitung penerima yang cocok berdasarkan **jarak + kebutuhan + keadilan**, dengan filter keras (verified, halal cocok, alergen aman, dalam radius).
- Saat membuat donasi, donor memilih salah satu **mode penyaluran**:
  - **Auto (Recommended)** — BagiRasa yang menentukan penerima. Matching + batch berjalan penuh untuk membagi donasi secara adil dan tanpa sisa terbuang.
  - **Manual** — donor memilih sendiri penerima. Donor bisa menunjuk **satu atau menambah beberapa panti**, dengan guardrail sisa porsi (lihat FR-6).
- **Filter keamanan tetap berlaku di kedua mode.** Daftar penerima yang bisa dipilih di mode manual pun sudah tersaring halal & alergen, sehingga donor tidak bisa keliru menunjuk penerima yang alergi terhadap bahan makanannya. Kontrol ada di donor, keamanan konsumsi tidak dikompromikan.
- Setelah dikirim, penerima dapat **notifikasi WhatsApp** (via Fonnte) + notifikasi in-app.
- Detail algoritma di bagian 10.

### FR-5 — Terima/Tolak & Konfirmasi (Flow Panti)
- Penerima melihat donasi masuk lengkap dengan info bahan, halal, alergen.
- Penerima **terima** atau **tolak**. Jika terima → konfirmasi ke restoran → penyerahan → selesai.
- Pengurus yang tidak pakai website diarahkan merespon lewat WhatsApp.

### FR-6 — Batch Distribution (Fitur 8)
Berlaku berbeda tergantung mode penyaluran (FR-4).

**Mode Auto:**
- Jika kuantitas donasi melebihi kebutuhan satu penerima, sistem **membagi otomatis ke beberapa penerima** secara proporsional & adil (urut skor matching) sampai porsi habis.
- Jika donasi cukup untuk satu penerima, langsung ke satu penerima.

**Mode Manual (kontrol di donor, dengan guardrail):**
- Donor menunjuk satu panti, lalu boleh **menambah panti lain** selama masih ada **sisa porsi**.
- Sistem melacak **sisa porsi berjalan**: `sisa = totalPorsi − Σ porsi teralokasi`. Tiap kali donor menambah panti, sisa berkurang sebesar kebutuhan panti itu.
- **Panti terakhir menerima alokasi parsial**: jika kebutuhan panti melebihi sisa porsi, panti tetap boleh ditambahkan tetapi hanya kebagian sisa yang ada (bukan diblokir), demi prinsip zero waste.
- Begitu **sisa porsi = 0**, tombol "tambah panti" dikunci — donor tidak bisa menunjuk panti melebihi makanan yang tersedia.
- **Invariant**: total porsi teralokasi ke semua panti tidak pernah melebihi total porsi donasi.

- Detail algoritma di bagian 10.

### FR-7 — Scoring & Feedback (Fitur 3)
- Setelah penyerahan, penerima memberi rating & feedback ke restoran.
- Skor restoran dihitung dari agregat rating (reputasi penyumbang).

### FR-8 — Analitik Dashboard (Fitur 4)
- Donor melihat statistik food waste tersalurkan: jumlah donasi, porsi, tren waktu.
- **Insight AI (Gemini)**: ringkasan tren, waktu puncak surplus, estimasi dampak, rekomendasi pengurangan waste. Detail di bagian 11.

### FR-9 — Landing Page (Fitur 6)
- Landing page publik menjelaskan misi, cara kerja, dampak.
- **Tautan donasi (uang) di footer**.

---

## 9. User Flows

### Flow Penyumbang (utama)
```
Login → Dashboard → Input Donasi (multi-item)
     → Pilih penerima (rekomendasi / manual)
     → Kirim → Tunggu jawaban penerima
     → Penyerahan → Selesai → Histori Donasi
```

### Flow Penyumbang (samping)
```
Dashboard → Analitik food waste (dengan insight AI)
Profil → Ubah data restoran → Ubah password
```

### Flow Penerima
```
Login → Input data panti/lansia → Dashboard
     → Lihat donasi masuk (info alergen/halal)
     → Terima / Tolak → Konfirmasi penyerahan
     → Beri rating → Histori penerimaan
```

### Flow Admin
```
Login → Daftar akun pending → Verifikasi (setujui/tolak) → Kelola platform
```

---

## 10. Algoritma Matching & Batch

### 10.1 Filter keras (wajib lolos)
Kandidat penerima harus:
- Berstatus `verified`.
- Kompatibel halal (jika makanan non-halal, penerima yang menerima non-halal saja).
- **Aman alergen** — tidak ada alergen makanan yang bertentangan dengan pantangan penerima.
- Berada dalam radius maksimum (mis. 15 km).

### 10.2 Skor pencocokan
Untuk tiap kandidat yang lolos filter:

```
matchScore = (w_jarak    × proximityScore)
           + (w_kebutuhan × needScore)
           + (w_adil      × fairnessScore)
```

- `proximityScore` = 1 − jarak_ternormalisasi (jarak dihitung haversine dari koordinat donor ke penerima).
- `needScore` = kebutuhan penerima saat ini ÷ kapasitas (ternormalisasi).
- `fairnessScore` = lama waktu sejak penerima terakhir menerima donasi (ternormalisasi) → yang lama tidak kebagian diprioritaskan.

Bobot rekomendasi awal: `w_jarak = 0.4`, `w_kebutuhan = 0.35`, `w_adil = 0.25` (bisa dituning).

### 10.3 Alokasi porsi (Fitur 8)

Total porsi donasi: `totalPorsi = Σ porsi semua item donasi`.

**Mode Auto — alokasi otomatis:**
```
urutkan kandidat berdasarkan matchScore (desc)

JIKA totalPorsi ≤ kebutuhan kandidat teratas:
    → alokasikan seluruh donasi ke satu penerima
SELAIN ITU (batch):
    sisa = totalPorsi
    untuk tiap kandidat (urut skor):
        alokasi = min(sisa, kebutuhan_kandidat)
        buat alokasi ke kandidat sebesar `alokasi`
        sisa -= alokasi
        hentikan jika sisa == 0
```

**Mode Manual — alokasi dikontrol donor (guardrail sisa porsi):**
```
sisa = totalPorsi
setiap donor menambah panti P:
    JIKA sisa == 0:
        tolak — tombol "tambah panti" terkunci
    alokasi = min(sisa, kebutuhan_P)      # panti terakhir bisa parsial
    buat alokasi ke P sebesar `alokasi`
    sisa -= alokasi
```

**Invariant (divalidasi di server, `lib/`):**
```
Σ allocated_servings semua panti  ≤  totalPorsi
```

Prinsip: di mode auto, donasi besar dibagi proporsional ke penerima ber-skor tertinggi sampai habis. Di mode manual, donor memegang kontrol memilih panti, tetapi sistem mencegah over-commit (tak bisa mengalokasi melebihi makanan yang ada) sambil tetap mengizinkan alokasi parsial demi zero waste. Keduanya mencegah *overclaim* dan makanan terbuang.

---

## 11. Fitur AI (Google Gemini)

Gemini dipakai untuk **lapisan insight**, bukan untuk matching/pembagian (itu deterministik).

### 11.1 Insight Analitik Food Waste (utama)
- **Input**: data agregat donasi donor (jumlah, jenis, waktu, porsi).
- **Output** (JSON terstruktur): ringkasan tren, waktu puncak surplus, estimasi dampak (porsi terselamatkan, kg makanan, estimasi CO₂), dan rekomendasi actionable pengurangan waste.
- **Tampil** di Analitik Dashboard sebagai kartu insight berbahasa natural.

### 11.2 Ekstraksi Alergen (opsional, penguat tema)
- **Input**: teks daftar bahan yang diinput restoran.
- **Output**: daftar tag alergen (mis. `kacang`, `susu`, `telur`, `seafood`, `gluten`).
- Hasil bisa dikoreksi manual sebelum donasi dikirim.
- Menguatkan tema *safety/trust* dan mengurangi beban input manual.

Semua panggilan Gemini dilakukan **server-side** (API key tidak pernah ke client) dan memaksa output JSON agar mudah di-parse.

---

## 12. Non-Functional Requirements

### Keamanan & Kepercayaan (sesuai tema)
- Autentikasi via Supabase Auth.
- **Row Level Security (RLS)** aktif di semua tabel — isolasi data per peran.
- API key (Gemini, Fonnte, Supabase service role) hanya di server, tidak pernah di-expose ke client.
- Validasi input di server (Zod) untuk semua data masuk.
- Dokumen identitas disimpan di storage privat, akses terkontrol.
- Rate limiting pada pengiriman WhatsApp untuk cegah abuse.

### Performa
- Server Components untuk data fetching utama; minimalkan bundle client.
- Query database beri index pada kolom pencarian (status, lokasi, foreign key).
- Estimasi waktu matching → notifikasi < 30 detik.

### Responsif & Aksesibilitas (UI/UX = 25% bobot penilaian)
- Tampilan konsisten & responsif di mobile, tablet, desktop.
- Semantik HTML, kontras warna cukup, navigasi keyboard.
- Konsisten dengan design system: warna `#23674E` + natural white, font Poppins, tema modern-minimalis-clean.

### Kualitas
- Kode bersih, self-documenting, tanpa komentar deskriptif (lihat `aturanpenulisancode.md`).
- Struktur folder konsisten (lihat `aturanstrukturfolder.md`).

---

## 13. Roadmap / Milestone

Diselaraskan dengan timeline lomba (batas Batch II: 27 September 2026; final: 5–6 Oktober 2026).

| Fase | Deliverable |
|---|---|
| **M1 — Fondasi** | Setup project, Supabase schema + RLS, auth, registrasi berbasis peran |
| **M2 — Core Donor** | Input donasi multi-item, profil restoran, ekstraksi alergen |
| **M3 — Matching** | Algoritma matching + batch, pilih penerima, notifikasi Fonnte |
| **M4 — Core Recipient** | Dashboard penerima, terima/tolak, konfirmasi, rating |
| **M5 — Analitik & AI** | Analitik dashboard + insight Gemini, scoring restoran |
| **M6 — Admin & Landing** | Panel verifikasi admin, landing page + footer donasi |
| **M7 — Polish** | Responsif, aksesibilitas, UI polish, seed data demo, deploy Vercel |
| **M8 — Proposal & Demo** | Proposal (format SwitchFest), skenario demo untuk presentasi final |

---

## 14. Out of Scope

- Aplikasi mobile native (fokus web responsif).
- Sistem pembayaran donasi uang lengkap (cukup tautan di footer).
- Live tracking pengantaran.
- WhatsApp Business API resmi Meta (cukup gateway Fonnte untuk MVP).
