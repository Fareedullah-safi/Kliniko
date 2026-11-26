"use client";

import { motion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1];

export function DoctorReveal({
  children,
  delay = 0,
  className = "",
  lift = false,
}) {
  return (
    <motion.div
      initial={{ y: 14 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.48, delay, ease: EASE }}
      className={`motion-reduce:transform-none! ${className}`}
    >
      {lift ? (
        <div className="h-full motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:-translate-y-1">
          {children}
        </div>
      ) : (
        children
      )}
    </motion.div>
  );
}

export function DoctorSkillBar({ label, percent }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-[#142A55]">{label}</span>
        <span className="text-sm font-semibold text-[#34707B] tabular-nums">
          {percent}%
        </span>
      </div>

      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-2.5 overflow-hidden rounded-full bg-[#E5F0ED]"
      >
        <motion.div
          style={{ width: `${percent}%` }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          className="h-full origin-left rounded-full bg-gradient-to-r from-[#6457E8] to-[#159BB1] motion-reduce:transform-none! rtl:origin-right"
        />
      </div>
    </div>
  );
}
