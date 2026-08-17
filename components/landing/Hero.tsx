"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

import { LANDING_EASE } from "@/components/landing/Reveal";
import { Button } from "@/components/ui/button";
import { MAX_RADIUS_KM } from "@/lib/config";

const SPECS = [
  `Radius ${MAX_RADIUS_KM} km`,
  "Penyaring alergen wajib",
  "Verifikasi admin",
];

export function Hero() {
  const prefersReducedMotion = useReducedMotion();

  const enter = (delay: number) => ({
    initial: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: LANDING_EASE },
  });

  return (
    <section className="mx-auto w-full max-w-6xl px-6 pb-24 pt-20 lg:pb-32 lg:pt-32">
      <motion.h1
        {...enter(0)}
        className="max-w-[46rem] text-hero font-bold text-brand-ink"
      >
        Sisa makan malam, sampai sebelum dingin.
      </motion.h1>

      <motion.p
        {...enter(0.08)}
        className="mt-7 max-w-xl text-[1.0625rem] leading-[1.7] text-brand-ink/60"
      >
        BagiRasa mencocokkan surplus rumah makan di Semarang dengan panti asuhan
        dan rumah lansia terdekat yang sedang butuh — lengkap dengan rincian
        bahan dan alergen.
      </motion.p>

      <motion.div {...enter(0.16)} className="mt-9 flex flex-wrap gap-3">
        <Button asChild size="lg" className="h-12 px-6">
          <Link href="/choose-role">Mulai menyumbang</Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          size="lg"
          className="h-12 px-5 text-brand-ink/60 hover:text-brand-ink"
        >
          <Link href="#cara-kerja">Lihat cara kerjanya</Link>
        </Button>
      </motion.div>

      <motion.ul
        {...enter(0.28)}
        className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-brand-ink/40"
      >
        {SPECS.map((spec, index) => (
          <li key={spec} className="flex items-center gap-3">
            {index > 0 ? (
              <span
                aria-hidden
                className="size-1 rounded-full bg-brand-ink/20"
              />
            ) : null}
            <span className="numeric">{spec}</span>
          </li>
        ))}
      </motion.ul>
    </section>
  );
}
