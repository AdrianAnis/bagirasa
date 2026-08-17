"use client";

import { motion, useReducedMotion } from "motion/react";

export const LANDING_EASE: [number, number, number, number] = [
  0.22, 1, 0.36, 1,
];

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
};

export function Reveal({ children, delay = 0, className }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: LANDING_EASE }}
    >
      {children}
    </motion.div>
  );
}
