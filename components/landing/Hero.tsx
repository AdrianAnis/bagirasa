"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";

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
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        document.documentElement.classList.toggle(
          "hero-visible",
          entry.isIntersecting
        );
      },
      { threshold: 0.1 }
    );

    observer.observe(section);
    document.documentElement.classList.add("hero-visible");

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("hero-visible");
    };
  }, []);

  const enter = (delay: number) => ({
    initial: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: LANDING_EASE },
  });

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden"
    >

      <div
        aria-hidden
        className="absolute inset-0 bg-[url('/landing-handover.jpg')] bg-cover bg-center"
      />


      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20"
      />


      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-left px-6 text-left">
        <motion.h1
          {...enter(0)}
          className="text-hero font-bold text-white"
        >
          Sisa makan malam, sampai sebelum dingin.
        </motion.h1>

        <motion.p
          {...enter(0.08)}
          className="mt-7 max-w-2xl text-[1.0625rem] leading-[1.7] text-white/70"
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
            className="h-12 px-5 text-white/70 hover:text-white hover:bg-white/10"
          >
            <Link href="#cara-kerja">Lihat cara kerjanya</Link>
          </Button>
        </motion.div>

        <motion.ul
          {...enter(0.28)}
          className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-white/50"
        >
          {SPECS.map((spec, index) => (
            <li key={spec} className="flex items-center gap-3">
              {index > 0 ? (
                <span
                  aria-hidden
                  className="size-1 rounded-full bg-white/30"
                />
              ) : null}
              <span className="numeric">{spec}</span>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
