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
import { useEffect, useMemo, useRef, useState } from "react";
import sanitizeHtml from "sanitize-html";

// ==========================================
// DEFAULT DATA
// ==========================================

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

const STATS = [
  { display: "310+", label: "Expert Doctor" },
  { display: "90%", label: "Patient Satisfaction" },
  { display: "3k+", label: "Successful Operation" },
  { display: "10+", label: "Health Award" },
];

// ==========================================
// RICH TEXT — SAFE INLINE HTML
// ==========================================

function rich(html = "") {
  if (typeof html !== "string") return "";

  const value = html
    .replace(/&(?:nbsp|#160|#xA0);/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .replace(/<p\b[^>]*>\s*<br\s*\/?>\s*<\/p>/gi, "")
    .replace(/<p\b[^>]*>\s*<\/p>/gi, "")
    .replace(/<\/(?:p|div|h[1-6])>\s*<(?:p|div|h[1-6])\b[^>]*>/gi, "<br>");

  return sanitizeHtml(value, {
    allowedTags: ["strong", "b", "em", "i", "u", "s", "span", "br"],
    allowedAttributes: {
      span: ["style"],
    },
    allowedStyles: {
      span: {
        color: [/^#[a-f\d]{3,8}$/i, /^rgba?\([\d\s,.%]+\)$/i],
        "background-color": [/^#[a-f\d]{3,8}$/i, /^rgba?\([\d\s,.%]+\)$/i],
      },
    },
  }).trim();
}

// ==========================================
// SAFE CLOUDINARY IMAGE
// ==========================================

function safeImage(value, fallback = "") {
  if (typeof value !== "string" || !value.trim()) {
    return fallback;
  }

  const src = value.trim();

  if (src.startsWith("/") && !src.startsWith("//") && !/[\\\s]/.test(src)) {
    return src;
  }

  try {
    const url = new URL(src);

    if (url.protocol === "https:" && !url.username && !url.password) {
      return src;
    }
  } catch {}

  return fallback;
}

// ==========================================
// DYNAMIC STATISTIC VALUES
// 310+, 90%, 3k+, etc.
// ==========================================

function makeStat(title, value, fallback) {
  const display =
    typeof value === "string" && value.trim() ? value.trim() : fallback.display;

  const match = display
    .replace(/,/g, "")
    .match(/^(\d+(?:\.\d+)?)\s*([kKmM]?)(.*)$/);

  if (!match) {
    return {
      label: title?.trim() || fallback.label,
      display,
      target: 0,
      suffix: "",
    };
  }

  const factor =
    match[2].toLowerCase() === "k"
      ? 1000
      : match[2].toLowerCase() === "m"
        ? 1000000
        : 1;

  return {
    label: title?.trim() || fallback.label,
    display,
    target: Number(match[1]) * factor,
    suffix: match[3],
  };
}

// ==========================================
// REDUCED MOTION
// ==========================================

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

// ==========================================
// SECTION ICON
// ==========================================

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

// ==========================================
// MOLECULAR BACKGROUND
// ==========================================

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

const REVEAL = { opacity: 0, y: 26 };
const SHOWN = { opacity: 1, y: 0 };

const REVEAL_TRANSITION = {
  duration: 0.7,
  ease: [0.22, 1, 0.36, 1],
};

// ==========================================
// FEATURE CARD
// ==========================================

function FeatureCard({
  feature,
  index,
  hoveredIndex,
  setHoveredIndex,
  reduced,
}) {
  const Icon = feature.icon;

  const [iconError, setIconError] = useState(false);

  const highlighted = (hoveredIndex ?? 0) === index;
  const hovered = hoveredIndex === index;

  return (
    <motion.article
      tabIndex={0}
      initial={REVEAL}
      whileInView={SHOWN}
      viewport={{ once: true, amount: 0.15 }}
      whileHover={reduced ? undefined : { y: -5, scale: 1.01 }}
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
      {/* ANIMATED GRADIENT */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{ opacity: highlighted ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.42 }}
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#6054e9] via-[#397cd4] to-[#129cb2]"
      />

      {/* SHIMMER */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{
          x: hovered && !reduced ? "130%" : "-130%",
          opacity: hovered ? 0.2 : 0,
        }}
        transition={{ duration: reduced ? 0 : 0.65 }}
        className="pointer-events-none absolute inset-y-0 left-0 w-[45%] skew-x-[-22deg] bg-white/20 blur-xl"
      />

      {/* FEATURE ICON */}
      <motion.div
        initial={false}
        animate={{
          backgroundColor: highlighted ? "#101e50" : "#159db5",
        }}
        transition={{ duration: 0.36 }}
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
          {feature.iconImage && !iconError ? (
            <Image
              src={feature.iconImage}
              alt=""
              width={56}
              height={56}
              unoptimized
              onError={() => setIconError(true)}
              className="h-9 w-9 object-contain brightness-0 invert sm:h-11 sm:w-11 xl:h-14 xl:w-14"
            />
          ) : (
            <Icon
              aria-hidden="true"
              strokeWidth={2}
              className="h-9 w-9 sm:h-11 sm:w-11 xl:h-14 xl:w-14"
            />
          )}
        </motion.div>
      </motion.div>

      {/* FEATURE CONTENT */}
      <div className="min-w-0 flex-1">
        <motion.div
          initial="idle"
          animate={hovered ? "hover" : "idle"}
          className="relative inline-block max-w-full"
        >
          <h3 className="text-[18px] leading-[1.3] font-bold tracking-[-0.015em] text-white sm:text-[22px] xl:text-[27px]">
            <span
              dangerouslySetInnerHTML={{
                __html: feature.title,
              }}
            />
          </h3>

          {/* ORIGINAL ANIMATED UNDERLINE */}
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

        <p className="mt-3 text-[13px] leading-[1.6] font-medium text-[#eff6fd] sm:text-[15px] xl:text-[17px]">
          <span
            dangerouslySetInnerHTML={{
              __html: feature.description,
            }}
          />
        </p>
      </div>
    </motion.article>
  );
}

// ==========================================
// ANIMATED COUNTER
// ==========================================

function CountUp({ target, suffix, display, inView }) {
  const count = useMotionValue(0);

  const text = useTransform(count, (value) => {
    const rounded = Math.max(0, Math.min(target, Math.floor(value)));

    if (rounded >= target) {
      return display;
    }

    return `${rounded.toLocaleString("en-US")}${suffix}`;
  });

  useEffect(() => {
    count.set(0);

    if (!inView) return;

    const controls = animate(count, target, {
      duration: 2.8,
      ease: "linear",
    });

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

// ==========================================
// FOUR ANIMATED STATISTICS
// ==========================================

function Statistics({ stats, reduced }) {
  const statsRef = useRef(null);

  const inView = useInView(statsRef, {
    amount: 0.3,
    once: false,
  });

  return (
    <motion.div
      ref={statsRef}
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={REVEAL_TRANSITION}
      className="relative mx-auto w-full max-w-[1160px] overflow-hidden rounded-[14px] bg-[#159db5] p-3 shadow-[0_15px_42px_rgba(0,61,91,0.18)] sm:p-4 lg:p-6"
    >
      {/* ANIMATED BACKGROUND */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={reduced ? { opacity: 0.45 } : { opacity: [0.45, 0.85, 0.45] }}
        transition={{
          duration: 7,
          repeat: reduced ? 0 : Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#6657ed]/50 via-[#27b7ce]/50 to-[#078ba6]/50"
      />

      {/* DOT PATTERN */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 3px 3px, rgba(255,255,255,.4) 1px, transparent 2px)",
          backgroundSize: "21px 21px",
        }}
      />

      {/* STATISTIC CARDS */}
      <div className="relative grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-5">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            role="group"
            aria-label={`${stat.display} ${stat.label}`}
            whileHover={reduced ? undefined : { y: -5, scale: 1.035 }}
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
              display={stat.display}
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

// ==========================================
// MAIN COMPONENT — MONGODB CONNECTED
// ==========================================

export default function KlinikoWhyChoose({ data = {}, cards = [] }) {
  const reduced = useSafeReducedMotion();

  const [hoveredIndex, setHoveredIndex] = useState(null);

  // SECTION CONTENT
  const badge = rich(data?.badge?.en || "Why Choose Us");

  const title = rich(
    data?.title?.en || "Trusted Healthcare Backed by Expertise & Compassion",
  );

  const description = rich(
    data?.description?.en ||
      "At Kliniko, we combine advanced medical practices with patient-focused care to ensure every individual receives safe, reliable, and comfortable treatment from start to finish.",
  );

  // DYNAMIC DOCTOR IMAGE
  const doctorImage = safeImage(data?.image, DOCTOR_IMAGE);

  // DYNAMIC FEATURE CARDS
  const features = useMemo(() => {
    const saved = Array.isArray(cards)
      ? cards.filter((card) => card && typeof card === "object")
      : [];

    if (!saved.length) {
      return FEATURES.map((feature) => ({
        ...feature,
        title: rich(feature.title),
        description: rich(feature.description),
        iconImage: "",
      }));
    }

    return saved.map((card, index) => {
      const fallback = FEATURES[index % FEATURES.length];

      return {
        id: card.id || `feature-${index}`,
        icon: fallback.icon,
        iconImage: safeImage(card.icon),

        title: rich(card.title?.en || fallback.title),

        description: rich(card.description?.en || fallback.description),
      };
    });
  }, [cards]);

  // DYNAMIC STATISTICS
  const stats = useMemo(
    () =>
      STATS.map((fallback, index) => {
        const number = index + 1;

        return makeStat(
          data?.[`stat${number}Title`],
          data?.[`stat${number}Value`],
          fallback,
        );
      }),
    [data],
  );

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

        {/* DESKTOP DOCTOR IMAGE */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1.1 }}
          className="pointer-events-none absolute inset-y-0 right-0 z-[1] hidden w-[37%] overflow-hidden lg:block"
        >
          <Image
            src={doctorImage}
            alt="Medical professional working in a clinical laboratory"
            fill
            unoptimized
            sizes="37vw"
            className="object-cover object-center"
          />

          <div className="absolute inset-0 bg-[#071632]/10" />
        </motion.div>

        {/* MAIN CONTAINER */}
        <div className="relative z-10 mx-auto w-full max-w-[1540px] px-6 sm:px-10 lg:px-12 2xl:px-6">
          {/* LEFT CONTENT */}
          <div className="w-full py-16 sm:py-20 lg:w-[61%] lg:pt-[110px] lg:pb-[170px] xl:pt-[135px] xl:pb-[185px]">
            {/* SECTION BADGE */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.65 }}
              className="flex items-center gap-4"
            >
              <SectionIcon />

              <span
                className="text-[19px] font-semibold text-white sm:text-[23px] lg:text-[26px]"
                dangerouslySetInnerHTML={{
                  __html: badge,
                }}
              />
            </motion.div>

            {/* MAIN HEADING */}
            <motion.h2
              id="kliniko-why-heading"
              initial={REVEAL}
              whileInView={SHOWN}
              viewport={{ once: true, amount: 0.2 }}
              transition={REVEAL_TRANSITION}
              className="mt-9 text-[clamp(2.2rem,3.5vw,4rem)] leading-[1.18] font-bold tracking-[-0.025em] text-white"
              dangerouslySetInnerHTML={{
                __html: title,
              }}
            />

            {/* DESCRIPTION */}
            <motion.p
              initial={REVEAL}
              whileInView={SHOWN}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                ...REVEAL_TRANSITION,
                delay: 0.12,
              }}
              className="mt-9 max-w-[900px] text-[16px] leading-[1.8] font-medium text-[#eaf1fa] sm:text-[18px] lg:mt-12 lg:text-[19px] xl:text-[21px]"
              dangerouslySetInnerHTML={{
                __html: description,
              }}
            />

            {/* FEATURE CARDS */}
            <div className="mt-10 flex flex-col gap-5 lg:mt-12 lg:gap-6">
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.id || index}
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

        {/* MOBILE / TABLET IMAGE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8 }}
          className="relative z-[1] h-[350px] w-full overflow-hidden sm:h-[460px] lg:hidden"
        >
          <Image
            src={doctorImage}
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
        <Statistics stats={stats} reduced={reduced} />
      </div>
    </section>
  );
}
