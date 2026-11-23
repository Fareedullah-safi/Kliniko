"use client";

import { HeartPulse, Microscope, UsersRound } from "lucide-react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const DOCTOR_IMAGE =
  "https://html.vecurosoft.com/kliniko/demo/assets/img/bg/chose-h1-img.jpg";

const FEATURES = [
  {
    title: "Experienced Medical Team",
    description:
      "Our doctors and nurses bring years of experience, professional training, and a commitment to delivering high-quality medical care.",
    icon: UsersRound,
  },
  {
    title: "Advanced Diagnostic Support",
    description:
      "We use updated medical technology and reliable testing systems to ensure accurate results and better treatment decisions.",
    icon: Microscope,
  },
  {
    title: "Patient-Focused Care",
    description:
      "Every patient receives personalized support, clear guidance, and dedicated follow-up for a smooth healthcare experience.",
    icon: HeartPulse,
  },
];

// Replace these example figures with verified clinic statistics.
const STATS = [
  { target: 310, suffix: "+", label: "Expert Doctor" },
  { target: 90, suffix: "%", label: "Patient Satisfaction" },
  {
    target: 3000,
    suffix: "+",
    compact: true,
    label: "Successful Operation",
  },
  { target: 10, suffix: "+", label: "Health Award" },
];

// ======================================
// HYDRATION-SAFE REDUCED MOTION
// ======================================

function useSafeReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => setReduced(query.matches);

    update();

    query.addEventListener("change", update);

    return () => {
      query.removeEventListener("change", update);
    };
  }, []);

  return reduced;
}

// ======================================
// SECTION ICON
// ======================================

function SectionIcon() {
  return (
    <svg
      width="29"
      height="29"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-[#17a6bc]"
    >
      <rect
        x="12"
        y="1"
        width="8"
        height="30"
        rx="4"
        transform="rotate(45 16 16)"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <rect
        x="12"
        y="1"
        width="8"
        height="30"
        rx="4"
        transform="rotate(-45 16 16)"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <circle cx="16" cy="16" r="2" fill="currentColor" />
    </svg>
  );
}

// ======================================
// MOLECULAR BACKGROUND
// ======================================

const MOLECULES = [
  [15, 80, 8],
  [100, 110, 13],
  [180, 44, 9],
  [260, 115, 14],
  [340, 52, 10],
  [430, 105, 13],
  [540, 52, 10],
  [660, 135, 15],
  [70, 250, 10],
  [170, 215, 13],
  [285, 265, 11],
  [395, 235, 12],
  [510, 285, 9],
  [625, 265, 12],
  [115, 370, 8],
  [300, 390, 13],
  [495, 400, 11],
  [680, 390, 9],
];

const CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [0, 8],
  [1, 9],
  [2, 9],
  [3, 10],
  [3, 11],
  [5, 11],
  [7, 13],
  [8, 9],
  [8, 14],
  [9, 10],
  [10, 11],
  [10, 15],
  [11, 12],
  [12, 13],
  [12, 16],
  [13, 17],
  [14, 15],
  [15, 16],
  [16, 17],
];

function MoleculePattern({ className = "", reduced = false, reverse = false }) {
  return (
    <motion.svg
      viewBox="0 0 700 440"
      fill="none"
      aria-hidden="true"
      className={className}
      initial={false}
      animate={
        reduced
          ? { x: 0, y: 0, opacity: 0.18 }
          : {
              x: reverse ? [0, -26, 0] : [0, 26, 0],
              y: [0, -16, 0],
              opacity: [0.18, 0.32, 0.18],
            }
      }
      transition={{
        duration: reverse ? 22 : 17,
        ease: "easeInOut",
        repeat: reduced ? 0 : Infinity,
      }}
    >
      <g stroke="#407eaf" strokeWidth="2.5" strokeOpacity="0.7">
        {CONNECTIONS.map(([a, b], index) => (
          <line
            key={index}
            x1={MOLECULES[a][0]}
            y1={MOLECULES[a][1]}
            x2={MOLECULES[b][0]}
            y2={MOLECULES[b][1]}
          />
        ))}
      </g>

      <g fill="#447eaf" fillOpacity="0.85">
        {MOLECULES.map(([x, y, radius], index) => (
          <circle key={index} cx={x} cy={y} r={radius} />
        ))}
      </g>
    </motion.svg>
  );
}

// ======================================
// SHARED ANIMATION SETTINGS
// ======================================

const REVEAL = {
  opacity: 0,
  y: 26,
};

const SHOWN = {
  opacity: 1,
  y: 0,
};

const REVEAL_TRANSITION = {
  duration: 0.7,
  ease: [0.22, 1, 0.36, 1],
};

// ======================================
// ANIMATED FEATURE CARDS
// ======================================

function FeatureCard({
  feature,
  index,
  hoveredIndex,
  setHoveredIndex,
  reduced,
}) {
  const Icon = feature.icon;

  // First card is highlighted by default.
  const highlighted = (hoveredIndex ?? 0) === index;
  const hovered = hoveredIndex === index;

  return (
    <motion.article
      tabIndex={0}
      initial={REVEAL}
      whileInView={SHOWN}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      whileHover={
        reduced
          ? undefined
          : {
              y: -5,
              scale: 1.01,
            }
      }
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
      onFocus={() => setHoveredIndex(index)}
      onBlur={() => setHoveredIndex(null)}
      onTouchStart={() => setHoveredIndex(index)}
      animate={{
        borderColor: highlighted ? "#f5faff" : "#168db0",
        boxShadow: highlighted
          ? "0 16px 35px rgba(3, 11, 35, 0.16)"
          : "0 0 0 rgba(3, 11, 35, 0)",
      }}
      transition={{
        ...REVEAL_TRANSITION,
        delay: index * 0.1,
      }}
      className="group relative isolate flex min-h-[148px] items-center gap-4 overflow-hidden rounded-[18px] border bg-[#143b65] px-5 py-5 text-white outline-none focus-visible:ring-2 focus-visible:ring-white sm:gap-5 sm:px-6 xl:min-h-[175px] xl:gap-7 xl:px-7"
    >
      {/* ANIMATED GRADIENT BACKGROUND */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{
          opacity: highlighted ? 1 : 0,
        }}
        transition={{
          duration: reduced ? 0 : 0.42,
        }}
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#6054e9] via-[#397cd4] to-[#129cb2]"
      />

      {/* SHIMMER EFFECT */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{
          x: hovered && !reduced ? "130%" : "-130%",
          opacity: hovered ? 0.2 : 0,
        }}
        transition={{
          duration: reduced ? 0 : 0.65,
        }}
        className="pointer-events-none absolute inset-y-0 left-0 w-[45%] skew-x-[-22deg] bg-white/20 blur-xl"
      />

      {/* ICON BACKGROUND */}
      <motion.div
        initial={false}
        animate={{
          backgroundColor: highlighted ? "#101e50" : "#159db5",
        }}
        transition={{
          duration: 0.36,
        }}
        className="flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-[17px] sm:h-[86px] sm:w-[86px] xl:h-[108px] xl:w-[108px]"
      >
        <motion.div
          initial={false}
          animate={{
            rotate: highlighted && !reduced ? 5 : 0,
            scale: highlighted && !reduced ? 1.12 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 17,
          }}
        >
          <Icon
            aria-hidden="true"
            strokeWidth={2}
            className="h-9 w-9 sm:h-11 sm:w-11 xl:h-14 xl:w-14"
          />
        </motion.div>
      </motion.div>

      {/* CARD TEXT */}
      <div className="min-w-0 flex-1">
        {/* TITLE WITH DOCTOR-STYLE UNDERLINE */}
        <motion.div
          initial="idle"
          animate={hovered ? "hover" : "idle"}
          className="relative inline-block max-w-full"
        >
          <h3 className="text-[18px] leading-[1.3] font-bold tracking-[-0.015em] text-white sm:text-[22px] xl:text-[27px]">
            {feature.title}
          </h3>

          {/* ONE ANIMATED UNDERLINE */}
          <motion.span
            aria-hidden="true"
            initial={false}
            variants={{
              idle: { scaleX: 0 },
              hover: { scaleX: 1 },
            }}
            transition={{
              duration: 0.35,
              ease: "easeOut",
            }}
            className="absolute -bottom-[5px] left-0 h-[2px] w-full origin-left rounded-full bg-white"
          />
        </motion.div>

        {/* DESCRIPTION */}
        <p className="mt-3 text-[13px] leading-[1.6] font-medium text-[#eff6fd] sm:text-[15px] xl:text-[17px]">
          {feature.description}
        </p>
      </div>
    </motion.article>
  );
}

// ======================================
// NUMBER COUNT-UP ANIMATION
// ======================================

function CountUp({ target, suffix, compact, inView }) {
  const count = useMotionValue(0);

  // Automatically update the text without
  // re-rendering the React component every frame.
  const text = useTransform(count, (value) => {
    const rounded = Math.max(0, Math.min(target, Math.floor(value)));

    if (compact && rounded === target) {
      return "3k+";
    }

    return `${rounded.toLocaleString("en-US")}${suffix}`;
  });

  useEffect(() => {
    // RESET TO ZERO
    count.set(0);

    if (!inView) return;

    // COUNT FROM ZERO TO THE TARGET
    const controls = animate(count, target, {
      duration: 2.8,
      ease: "linear",
    });

    // Stop animation when leaving viewport
    // so it can restart on the next entry.
    return () => controls.stop();
  }, [inView, target, count]);

  return (
    <motion.span
      aria-hidden="true"
      className="block text-[29px] leading-none font-extrabold text-white tabular-nums sm:text-[36px] lg:text-[43px]"
    >
      {text}
    </motion.span>
  );
}

// ======================================
// ANIMATED STATISTICS
// ======================================

function Statistics({ reduced }) {
  const statsRef = useRef(null);

  // The value changes every time the
  // statistics section enters or leaves view.
  const inView = useInView(statsRef, {
    amount: 0.3,
    once: false,
  });

  return (
    <motion.div
      ref={statsRef}
      initial={{
        opacity: 0,
        y: 35,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={REVEAL_TRANSITION}
      className="relative mx-auto w-full max-w-[1160px] overflow-hidden rounded-[14px] bg-[#159db5] p-3 shadow-[0_15px_42px_rgba(0,61,91,0.18)] sm:p-4 lg:p-6"
    >
      {/* ANIMATED BACKGROUND */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={
          reduced
            ? { opacity: 0.45 }
            : {
                opacity: [0.45, 0.85, 0.45],
              }
        }
        transition={{
          duration: 7,
          repeat: reduced ? 0 : Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#6657ed]/50 via-[#27b7ce]/50 to-[#078ba6]/50"
      />

      {/* BACKGROUND DOT PATTERN */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 3px 3px, rgba(255,255,255,.4) 1px, transparent 2px)",
          backgroundSize: "21px 21px",
        }}
      />

      {/* FOUR STATISTICS */}
      <div className="relative grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-5">
        {STATS.map((stat) => (
          <motion.div
            key={stat.label}
            role="group"
            aria-label={`${
              stat.compact ? "3k+" : `${stat.target}${stat.suffix}`
            } ${stat.label}`}
            whileHover={
              reduced
                ? undefined
                : {
                    y: -5,
                    scale: 1.035,
                  }
            }
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 20,
            }}
            className="flex min-h-[112px] flex-col items-center justify-center rounded-md bg-[#087b99]/65 px-2 py-5 text-center sm:min-h-[135px] lg:min-h-[150px]"
          >
            <CountUp
              target={stat.target}
              suffix={stat.suffix}
              compact={stat.compact}
              inView={inView}
            />

            <span
              aria-hidden="true"
              className="mt-3 text-[12px] leading-snug font-semibold text-white sm:text-[14px] lg:text-[16px]"
            >
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ======================================
// MAIN COMPONENT
// ======================================

export default function KlinikoWhyChoose() {
  const reduced = useSafeReducedMotion();

  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section
      aria-labelledby="kliniko-why-heading"
      className="relative isolate overflow-hidden bg-white pb-16 sm:pb-20 lg:pb-24"
    >
      {/* NAVY BACKGROUND */}
      <div className="relative isolate overflow-hidden bg-[#101e50]">
        {/* BACKGROUND ANIMATIONS */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
          <MoleculePattern
            reduced={reduced}
            className="absolute -top-[8%] -left-[12%] h-[600px] w-[950px] xl:h-[740px] xl:w-[1100px]"
          />

          <MoleculePattern
            reduced={reduced}
            reverse
            className="absolute -bottom-[15%] left-[20%] h-[450px] w-[700px] rotate-180"
          />

          {/* MOVING GLOW */}
          <motion.div
            initial={false}
            animate={
              reduced
                ? { x: 0, y: 0 }
                : {
                    x: [0, 30, 0],
                    y: [0, -18, 0],
                  }
            }
            transition={{
              duration: 12,
              repeat: reduced ? 0 : Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-40 left-[20%] h-[420px] w-[420px] rounded-full bg-[#2371a2]/15 blur-[90px]"
          />
        </div>

        {/* RIGHT DOCTOR IMAGE — DESKTOP */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{
            once: true,
            amount: 0.1,
          }}
          transition={{
            duration: 1.1,
          }}
          className="pointer-events-none absolute inset-y-0 right-0 z-[1] hidden w-[37%] overflow-hidden lg:block"
        >
          <Image
            src={DOCTOR_IMAGE}
            alt="Medical professional working in a clinical laboratory"
            fill
            unoptimized
            sizes="37vw"
            className="object-cover object-center"
          />

          <div className="absolute inset-0 bg-[#071632]/10" />
        </motion.div>

        {/* SAME CONTAINER AS HERO */}
        <div className="relative z-10 mx-auto w-full max-w-[1540px] px-6 sm:px-10 lg:px-12 2xl:px-6">
          {/* LEFT CONTENT */}
          <div className="w-full py-16 sm:py-20 lg:w-[61%] lg:pt-[110px] lg:pb-[170px] xl:pt-[135px] xl:pb-[185px]">
            {/* LABEL */}
            <motion.div
              initial={{
                opacity: 0,
                x: -24,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
                amount: 0.3,
              }}
              transition={{
                duration: 0.65,
              }}
              className="flex items-center gap-4"
            >
              <SectionIcon />

              <span className="text-[19px] font-semibold text-white sm:text-[23px] lg:text-[26px]">
                Why Choose Us
              </span>
            </motion.div>

            {/* MAIN HEADING */}
            <motion.h2
              id="kliniko-why-heading"
              initial={REVEAL}
              whileInView={SHOWN}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={REVEAL_TRANSITION}
              className="mt-9 text-[clamp(2.2rem,3.5vw,4rem)] leading-[1.18] font-bold tracking-[-0.025em] text-white"
            >
              Trusted Healthcare Backed by Expertise &amp; Compassion
            </motion.h2>

            {/* DESCRIPTION */}
            <motion.p
              initial={REVEAL}
              whileInView={SHOWN}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                ...REVEAL_TRANSITION,
                delay: 0.12,
              }}
              className="mt-9 max-w-[900px] text-[16px] leading-[1.8] font-medium text-[#eaf1fa] sm:text-[18px] lg:mt-12 lg:text-[19px] xl:text-[21px]"
            >
              At Kliniko, we combine advanced medical practices with
              patient-focused care to ensure every individual receives safe,
              reliable, and comfortable treatment from start to finish.
            </motion.p>

            {/* FEATURE CARDS */}
            <div className="mt-10 flex flex-col gap-5 lg:mt-12 lg:gap-6">
              {FEATURES.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  feature={feature}
                  index={index}
                  hoveredIndex={hoveredIndex}
                  setHoveredIndex={setHoveredIndex}
                  reduced={reduced}
                />
              ))}
            </div>
          </div>
        </div>

        {/* MOBILE / TABLET DOCTOR IMAGE */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.1,
          }}
          transition={{
            duration: 0.8,
          }}
          className="relative z-[1] h-[350px] w-full overflow-hidden sm:h-[460px] lg:hidden"
        >
          <Image
            src={DOCTOR_IMAGE}
            alt="Medical professional working in a clinical laboratory"
            fill
            unoptimized
            sizes="100vw"
            className="object-cover object-[center_30%]"
          />
        </motion.div>
      </div>

      {/* ANIMATED OVERLAPPING STATISTICS */}
      <div className="relative z-20 mx-auto -mt-10 w-full max-w-[1540px] px-6 sm:-mt-12 sm:px-10 lg:-mt-[75px] lg:px-12 2xl:px-6">
        <Statistics reduced={reduced} />
      </div>
    </section>
  );
}
