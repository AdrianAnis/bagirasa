import { HeartHandshake, Utensils } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";

const ROLES = [
  {
    href: "/register?role=donor",
    icon: Utensils,
    title: "Saya punya sisa makanan",
    description:
      "Restoran, rumah makan, atau warteg yang punya surplus layak konsumsi.",
    action: "Daftar sebagai penyumbang",
  },
  {
    href: "/register?role=recipient",
    icon: HeartHandshake,
    title: "Kami membutuhkan makanan",
    description:
      "Lembaga sosial yang siap menerima donasi makanan.",
    action: "Daftar sebagai penerima",
  },
];

export default function ChooseRolePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-white px-6 py-16">
      <Logo href="/" className="text-2xl" />

      <h1 className="mt-10 text-center text-title font-semibold tracking-tight text-brand-ink">
        Bergabung bersama BagiRasa
      </h1>
      <p className="mt-2 text-center text-brand-ink/55">
        Pilih peranmu untuk melanjutkan pendaftaran.
      </p>

      <div className="mt-9 grid w-full max-w-3xl gap-5 sm:grid-cols-2">
        {ROLES.map((role) => (
          <section
            key={role.href}
            className="flex flex-col rounded-2xl border border-brand-ink/10 p-7 text-center transition-colors hover:border-brand/40"
          >
            <span className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-tint">
              <role.icon className="size-5 text-brand" aria-hidden />
            </span>

            <h2 className="mt-5 text-lg font-semibold tracking-tight text-brand-ink">
              {role.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-ink/55">
              {role.description}
            </p>

            <div className="mt-auto pt-6">
              <Button asChild className="w-full">
                <Link href={role.href}>{role.action}</Link>
              </Button>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-9 text-sm text-brand-ink/55">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand underline underline-offset-2"
        >
          Masuk
        </Link>
      </p>
    </main>
  );
}
