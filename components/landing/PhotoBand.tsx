"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import { Reveal } from "@/components/landing/Reveal";

export function PhotoBand() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const backdropY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? ["0%", "0%"] : ["-8%", "8%"],
  );

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden bg-brand-deep"
    >
      <motion.div
        aria-hidden
        style={{ y: backdropY }}
        className="absolute -inset-y-[10%] inset-x-0 bg-[url('/landing-handover.jpg')] bg-cover bg-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/55 to-brand-ink/15"
      />

      <div className="relative mx-auto flex min-h-[24rem] w-full max-w-6xl flex-col justify-end px-6 py-20 lg:min-h-[32rem] lg:py-28">
        <Reveal>
          <p className="max-w-2xl text-section font-semibold text-white">
            Yang memisahkan makanan layak dari sampah bukan kualitasnya. Cuma
            beberapa jam.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-5 max-w-lg text-[0.9375rem] leading-relaxed text-white/60">
            Setiap malam rumah makan di Semarang menutup dapur dengan makanan
            yang masih layak. Lembaga di seberang jalan tidak pernah tahu.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
