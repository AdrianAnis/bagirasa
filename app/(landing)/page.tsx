import Link from "next/link";

import { Hero } from "@/components/landing/Hero";

import { Button } from "@/components/ui/button";

const PROBLEMS = [
  {
    title: "Umur simpan pendek",
    body: "Surplus makan malam hanya layak beberapa jam. Mencari penerima lewat telepon satu per satu memakan waktu yang tidak dipunya makanan itu.",
  },
  {
    title: "Distribusi menumpuk",
    body: "Penyaluran manual cenderung ke lembaga yang itu-itu saja. Yang jauh dari jaringan pertemanan pengurus jarang kebagian.",
  },
  {
    title: "Isi makanan tidak jelas",
    body: "Pengurus lembaga menerima makanan tanpa tahu bahannya. Satu anak dengan alergi kacang cukup untuk membuat donasi jadi masalah.",
  },
];

const STEPS = [
  {
    title: "Restoran mencatat sisa",
    body: "Satu donasi bisa berisi banyak item. Tiap item mencantumkan bahan, ketahanan, status halal, dan alergen.",
  },
  {
    title: "Sistem menyaring dan membagi",
    body: "Penerima yang alergi atau tidak menerima non-halal disingkirkan lebih dulu. Sisanya diurutkan berdasarkan jarak, kebutuhan, dan giliran.",
  },
  {
    title: "Penerima memutuskan",
    body: "Penerima dapat melihat rincian bahan dan alergen sebelum menjawab, lalu menerima atau menolak.",
  },
  {
    title: "Penyerahan dikonfirmasi",
    body: "Setelah makanan diterima, kebutuhan lembaga berkurang otomatis dan giliran berikutnya bergeser ke yang lain.",
  },
];

const SAFEGUARDS = [
  {
    title: "Identitas diverifikasi",
    body: "Restoran mengunggah KTP, lembaga mengunggah dokumen legal. Admin memeriksa sebelum akun bisa bertransaksi.",
  },
  {
    title: "Data terisolasi per peran",
    body: "Row Level Security membatasi tiap akun hanya pada datanya sendiri, langsung di lapisan basis data.",
  },
  {
    title: "Alergen sebagai penyaring wajib",
    body: "Bukan sekadar peringatan. Penerima dengan pantangan tidak akan pernah muncul sebagai kandidat, bahkan saat restoran memilih manual.",
  },
  {
    title: "Setiap donasi punya jejak",
    body: "Siapa menyumbang, kapan, ke siapa, berisi apa. Tercatat dari input sampai penyerahan.",
  },
];

export default function LandingPage() {
  return (
    <>
      <Hero />



      <section className="border-y border-brand-ink/10 bg-canvas">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <p className="eyebrow text-brand/70">Yang terjadi tanpa jembatan</p>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {PROBLEMS.map((problem) => (
              <div key={problem.title} className="border-t-2 border-brand pt-4">
                <h2 className="font-semibold text-brand-ink">{problem.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-brand-ink/60">
                  {problem.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="cara-kerja" className="mx-auto w-full max-w-6xl px-6 py-20">
        <p className="eyebrow text-brand/70">Cara kerja</p>
        <h2 className="mt-3 max-w-lg text-title font-semibold text-brand-ink">
          Empat langkah, dari dapur ke meja makan panti.
        </h2>

        <ol className="mt-10 flex flex-col">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="grid gap-3 border-t border-brand-ink/10 py-6 md:grid-cols-[4rem_1fr_1.2fr] md:items-baseline md:gap-8"
            >
              <span className="numeric text-sm text-brand/60">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-semibold text-brand-ink">{step.title}</h3>
              <p className="text-sm leading-relaxed text-brand-ink/60">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section id="keamanan" className="border-t border-brand-ink/10 bg-brand-ink">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <p className="eyebrow text-brand-tint/60">Kepercayaan</p>
          <h2 className="mt-3 max-w-xl text-title font-semibold text-white">
            Donasi makanan hanya berjalan kalau kedua pihak merasa aman.
          </h2>

          <div className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-2">
            {SAFEGUARDS.map((item) => (
              <div
                key={item.title}
                className="border-t border-white/15 pt-4 text-white"
              >
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-lg">
            <h2 className="text-title font-semibold text-brand-ink">
              Punya sisa makanan malam ini? Ayo donasi!
            </h2>
            <p className="mt-3 text-brand-ink/60">
              Daftar sebagai penyumbang, lengkapi profil restoran, dan catat
              donasi pertamamu. Prosesnya di bawah lima menit.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/choose-role">Daftar sekarang</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
