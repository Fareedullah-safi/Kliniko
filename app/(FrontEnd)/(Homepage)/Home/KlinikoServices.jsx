"use client";

import {
  Activity,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  HeartPulse,
  Microscope,
  Pause,
  Play,
  Siren,
  Stethoscope,
} from "lucide-react";

import { animate, motion, useMotionValue } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import sanitizeHtml from "sanitize-html";

const GAP = 24;
const INTERVAL = 3000;
const DURATION = 0.75;

// ==========================================
// DEFAULT SERVICES
// ==========================================

const DEFAULT_SERVICES = [
  {
    id: 1,
    title: "Advanced Medical Consultation",
    description:
      "Professional medical consultations and personalized healthcare guidance for patients.",
    icon: FlaskConical,
    href: "/services/consultation",
  },
  {
    id: 2,
    title: "Emergency & Critical Care Service",
    description:
      "Immediate medical support for urgent illnesses, injuries, and life-threatening conditions.",
    icon: Siren,
    href: "/services/emergency-care",
  },
  {
    id: 3,
    title: "Diagnostics & Laboratory Services",
    description:
      "Accurate blood tests, imaging, ECG, and other diagnostics for timely medical decisions.",
    icon: Microscope,
    href: "/services/diagnostics",
  },
  {
    id: 4,
    title: "General Medicine And Primary Care",
    description:
      "Our doctors provide timely checkups and essential medical guidance with complete care.",
    icon: Stethoscope,
    href: "/services/general-medicine",
  },
  {
    id: 5,
    title: "Cardiology & Heart Care",
    description:
      "Comprehensive heart health consultations and personalized medical care.",
    icon: HeartPulse,
    href: "/services/cardiology",
  },
  {
    id: 6,
    title: "Preventive Health Checkups",
    description: "Routine health examinations focused on long-term wellness.",
    icon: Activity,
    href: "/services/health-checkups",
  },
];

// ==========================================
// RICH TEXT - PRESERVE ADMIN FORMATTING
// ==========================================

function rich(html = "") {
  if (typeof html !== "string") return "";

  const value = html
    .replace(/&(?:nbsp|#160|#xA0);/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .replace(
      /<\/(?:p|div|h[1-6])\s*>\s*<(?:p|div|h[1-6])(?:\s[^>]*)?>/gi,
      "<br>",
    );

  return sanitizeHtml(value, {
    allowedTags: ["strong", "b", "em", "i", "u", "s", "span", "br"],
    allowedAttributes: {
      "*": ["style"],
    },
    allowedStyles: {
      "*": {
        color: [/^#[a-f\d]{3,8}$/i, /^rgba?\([\d\s,.%]+\)$/i],
        "background-color": [/^#[a-f\d]{3,8}$/i, /^rgba?\([\d\s,.%]+\)$/i],
      },
    },
  }).trim();
}

// ==========================================
// SAFE URL
// ==========================================

function safeUrl(value, fallback = "") {
  if (typeof value !== "string") return fallback;

  const url = value.trim();
  if (!url) return fallback;

  if (url.startsWith("/") && !url.startsWith("//") && !/[\\\s]/.test(url)) {
    return url;
  }

  try {
    const parsed = new URL(url);

    if (
      ["https:", "http:"].includes(parsed.protocol) &&
      !parsed.username &&
      !parsed.password
    ) {
      return url;
    }
  } catch {}

  return fallback;
}

// ==========================================
// BACKGROUND DECORATION
// ==========================================

const CROSSES = [
  ["4%", "75%", 65, true],
  ["0%", "87%", 100, true],
  ["8%", "91%", 45, false],
  ["20%", "79%", 110, false],
  ["19%", "89%", 90, true],
  ["22%", "97%", 48, true],
  ["39%", "95%", 130, true],
  ["54%", "89%", 52, true],
  ["59%", "-1%", 60, true],
  ["72%", "2%", 110, false],
  ["85%", "6%", 135, true],
  ["94%", "17%", 85, true],
];

function MedicalCross({ size, filled }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M38 0H62V38H100V62H62V100H38V62H0V38H38V0Z"
        fill={filled ? "#D6F6F2" : "none"}
        stroke="#D6F6F2"
        strokeWidth={filled ? 0 : 3}
      />
    </svg>
  );
}

function SectionIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="text-[#139DB3]"
    >
      {[45, -45].map((rotation) => (
        <rect
          key={rotation}
          x="12"
          y="1"
          width="8"
          height="30"
          rx="4"
          transform={`rotate(${rotation} 16 16)`}
          stroke="currentColor"
          strokeWidth="2.5"
        />
      ))}
      <circle cx="16" cy="16" r="2" fill="currentColor" />
    </svg>
  );
}

// ==========================================
// SERVICE CARD - ORIGINAL DESIGN
// ==========================================

function ServiceCard({ service, width }) {
  const [focused, setFocused] = useState(false);
  const [imageError, setImageError] = useState(false);

  const Icon = service.icon;

  return (
    <motion.article
      initial="idle"
      animate={focused ? "hover" : "idle"}
      whileHover="hover"
      variants={{
        idle: {
          backgroundColor: "#FFFFFF",
          boxShadow: "0 0 0 rgba(12,30,80,0)",
        },
        hover: {
          backgroundColor: "#101E50",
          boxShadow: "0 18px 45px rgba(12,30,80,.15)",
        },
      }}
      transition={{ duration: 0.4 }}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocused(false);
        }
      }}
      style={{ flex: `0 0 ${width}px`, width }}
      className="group flex min-h-[430px] min-w-0 flex-col rounded-[20px] p-6 sm:p-7 xl:p-8"
    >
      {/* ICON AND NUMBER */}
      <div className="flex items-start justify-between gap-3">
        <div className="relative flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-[9px] bg-[#159BB1] text-white sm:h-[96px] sm:w-[96px]">
          <motion.div
            variants={{
              idle: { opacity: 0 },
              hover: { opacity: 1 },
            }}
            className="absolute inset-0 bg-gradient-to-r from-[#6357ED] via-[#3385D9] to-[#139DB3]"
          />

          <motion.div
            variants={{
              idle: { scale: 1, rotate: 0 },
              hover: { scale: 1.1, rotate: 5 },
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 18,
            }}
            className="relative z-10"
          >
            {service.image && !imageError ? (
              <Image
                src={service.image}
                alt=""
                width={46}
                height={46}
                unoptimized
                onError={() => setImageError(true)}
                className="h-[46px] w-[46px] object-contain brightness-0 invert"
              />
            ) : (
              <Icon size={46} strokeWidth={1.8} />
            )}
          </motion.div>
        </div>

        <motion.span
          variants={{
            idle: { color: "#D0EBF0" },
            hover: { color: "#174477" },
          }}
          className="text-[38px] leading-none font-bold sm:text-[42px]"
        >
          {service.number}
        </motion.span>
      </div>

      {/* CARD TITLE */}
      <div className="mt-8 min-h-[80px]">
        <motion.h3
          variants={{
            idle: { color: "#101D4E" },
            hover: { color: "#FFFFFF" },
          }}
          className="text-[21px] leading-[1.45] font-semibold sm:text-[23px] xl:text-[25px]"
        >
          <motion.span
            variants={{
              idle: { backgroundSize: "0% 2px" },
              hover: { backgroundSize: "100% 2px" },
            }}
            transition={{ duration: 0.38 }}
            style={{
              backgroundImage: "linear-gradient(#FFFFFF,#FFFFFF)",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "left bottom",
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone",
              paddingBottom: "4px",
            }}
          >
            <span
              dangerouslySetInnerHTML={{
                __html: service.title,
              }}
            />
          </motion.span>
        </motion.h3>
      </div>

      {/* CARD DESCRIPTION */}
      <motion.p
        variants={{
          idle: { color: "#78818A" },
          hover: { color: "#E1E9F4" },
        }}
        className="mt-3 flex-1 text-[15px] leading-[1.75] sm:text-[16px]"
      >
        <span
          dangerouslySetInnerHTML={{
            __html: service.description,
          }}
        />
      </motion.p>

      {/* READ MORE BUTTON */}
      <motion.div
        variants={{
          idle: { borderColor: "#E8EDF0" },
          hover: { borderColor: "rgba(255,255,255,.2)" },
        }}
        className="mt-5 border-t pt-6"
      >
        <Link
          href={service.href}
          className="relative inline-flex min-h-[40px] min-w-[137px] items-center justify-center overflow-hidden rounded-full bg-[#159BB1] px-6 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#159BB1]"
        >
          <motion.span
            variants={{
              idle: { opacity: 0 },
              hover: { opacity: 1 },
            }}
            className="absolute inset-0 bg-gradient-to-r from-[#6255EC] via-[#327BD9] to-[#139DB3]"
          />

          <span className="relative z-10">Read More</span>
        </Link>
      </motion.div>
    </motion.article>
  );
}

// ==========================================
// MAIN SERVICES SECTION
// ==========================================

export default function KlinikoServices({ data = {}, cards = [] }) {
  // Use MongoDB cards when available.
  const services = useMemo(() => {
    const saved = Array.isArray(cards)
      ? cards.filter(
          (card) =>
            card &&
            typeof card === "object" &&
            (card.title?.en || card.description?.en || card.image),
        )
      : [];

    const source = saved.length ? saved : DEFAULT_SERVICES;

    return source.map((card, index) => {
      const fallback = DEFAULT_SERVICES[index % DEFAULT_SERVICES.length];

      return {
        id: card.id ?? index,
        number: String(index + 1).padStart(2, "0"),
        title: rich(card.title?.en ?? card.title ?? fallback.title),
        description: rich(
          card.description?.en ?? card.description ?? fallback.description,
        ),
        image: safeUrl(card.image),
        icon: fallback.icon,
        href: safeUrl(card.link ?? card.href, fallback.href),
      };
    });
  }, [cards]);

  const count = services.length;

  // Padded copies prevent empty space on both ends.
  const padding = Math.max(3, count);

  const slides = useMemo(
    () =>
      Array.from({ length: count + padding * 2 }, (_, index) => {
        const serviceIndex = (((index - padding) % count) + count) % count;

        return services[serviceIndex];
      }),
    [services, count, padding],
  );

  // Section text. No description underneath.
  const badge = rich(data?.badge?.en || "Service");
  const title = rich(
    data?.title?.en || "Delivering Trusted Medical<br>Care With Precision",
  );

  const viewportRef = useRef(null);
  const indexRef = useRef(padding);
  const stepRef = useRef(0);
  const animationRef = useRef(null);

  const movingRef = useRef(false);
  const visibleRef = useRef(false);
  const focusRef = useRef(false);
  const touchingRef = useRef(false);
  const touchStartRef = useRef(null);
  const touchTimerRef = useRef(null);

  const x = useMotionValue(0);

  const [cardWidth, setCardWidth] = useState(0);
  const [playing, setPlaying] = useState(true);

  // ========================================
  // RESPONSIVE WIDTH AND INITIAL POSITION
  // ========================================

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    animationRef.current?.stop();
    movingRef.current = false;

    indexRef.current = padding;
    stepRef.current = 0;

    const measure = () => {
      const width = viewport.getBoundingClientRect().width;
      if (width <= 0) return;

      const columns =
        window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;

      const nextWidth = (width - GAP * (columns - 1)) / columns;
      const nextStep = nextWidth + GAP;

      if (Math.abs(stepRef.current - nextStep) < 0.2) return;

      animationRef.current?.stop();
      movingRef.current = false;

      stepRef.current = nextStep;
      x.set(-indexRef.current * nextStep);

      setCardWidth(nextWidth);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);

    window.addEventListener("resize", measure);

    return () => {
      animationRef.current?.stop();
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [count, padding, x]);

  // ========================================
  // VISIBLE IN VIEWPORT
  // ========================================

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 },
    );

    observer.observe(viewport);

    return () => observer.disconnect();
  }, []);

  // ========================================
  // INFINITE MOVEMENT
  // ========================================

  const move = useCallback(
    (direction) => {
      if (!stepRef.current || movingRef.current) return;

      movingRef.current = true;

      const next = indexRef.current + direction;

      animationRef.current = animate(x, -next * stepRef.current, {
        duration: DURATION,
        ease: [0.22, 1, 0.36, 1],

        onComplete: () => {
          indexRef.current = next;

          // Reset inside the identical card copies.
          if (indexRef.current >= padding + count) {
            indexRef.current -= count;
          }

          if (indexRef.current < padding) {
            indexRef.current += count;
          }

          x.set(-indexRef.current * stepRef.current);

          movingRef.current = false;
          animationRef.current = null;
        },
      });
    },
    [x, count, padding],
  );

  // ========================================
  // AUTO PLAY
  // ========================================

  useEffect(() => {
    if (!playing) return;

    const timer = setInterval(() => {
      if (
        document.hidden ||
        !visibleRef.current ||
        focusRef.current ||
        touchingRef.current ||
        movingRef.current
      ) {
        return;
      }

      move(1);
    }, INTERVAL);

    return () => clearInterval(timer);
  }, [playing, move]);

  // ========================================
  // TOUCH SUPPORT
  // ========================================

  const handleTouchStart = (event) => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);

    touchingRef.current = true;

    const touch = event.touches[0];

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  };

  const handleTouchEnd = (event) => {
    const start = touchStartRef.current;
    const touch = event.changedTouches[0];

    if (start && touch) {
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;

      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        move(dx < 0 ? 1 : -1);
      }
    }

    touchStartRef.current = null;

    touchTimerRef.current = setTimeout(() => {
      touchingRef.current = false;
      touchTimerRef.current = null;
    }, 600);
  };

  useEffect(
    () => () => {
      animationRef.current?.stop();

      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    },
    [],
  );

  // ========================================
  // ORIGINAL DESIGN
  // ========================================

  return (
    <section
      aria-labelledby="kliniko-services-title"
      className="relative isolate overflow-hidden bg-[#F1F8F5] py-20 sm:py-24 lg:py-[100px]"
    >
      {/* BACKGROUND CROSSES */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {CROSSES.map(([top, left, size, filled], index) => (
          <div
            key={index}
            className="absolute opacity-80"
            style={{ top, left }}
          >
            <MedicalCross size={size} filled={filled} />
          </div>
        ))}
      </div>

      <div className="mx-auto w-full max-w-[1540px] px-6 sm:px-10 lg:px-12 2xl:px-6">
        {/* HEADING - WITHOUT DESCRIPTION */}
        <div className="mx-auto max-w-[850px] text-center">
          <div className="flex items-center justify-center gap-2">
            <SectionIcon />

            <span
              className="text-[18px] font-semibold text-[#101D4E]"
              dangerouslySetInnerHTML={{ __html: badge }}
            />

            <SectionIcon />
          </div>

          <h2
            id="kliniko-services-title"
            className="mx-auto mt-5 max-w-[750px] text-[clamp(2rem,3.3vw,3.25rem)] leading-[1.2] font-bold tracking-[-0.025em] text-[#101D4E]"
            dangerouslySetInnerHTML={{ __html: title }}
          />
        </div>

        {/* SLIDER */}
        <div
          ref={viewportRef}
          dir="ltr"
          role="region"
          aria-roledescription="carousel"
          aria-label="Medical services"
          aria-live="off"
          className="mt-12 min-w-0 overflow-hidden rounded-[20px] lg:mt-14"
          onFocusCapture={() => {
            focusRef.current = true;
          }}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              focusRef.current = false;
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          style={{ touchAction: "pan-y" }}
        >
          <motion.div
            style={{
              x,
              opacity: cardWidth > 0 ? 1 : 0,
            }}
            className="flex w-full items-stretch gap-6 will-change-transform"
          >
            {slides.map((service, index) => (
              <ServiceCard
                key={`${service.id}-${index}`}
                service={service}
                width={cardWidth || 350}
              />
            ))}
          </motion.div>
        </div>

        {/* SLIDER BUTTONS */}
        <div className="mt-10 flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-full border border-[#B5E3E7] bg-white/75 p-1.5">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Previous service"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#E9F4F3] text-[#101D4E] transition-colors duration-300 hover:bg-[#159BB1] hover:text-white"
            >
              <ChevronLeft size={23} />
            </button>

            <button
              type="button"
              onClick={() => setPlaying((value) => !value)}
              aria-label={playing ? "Pause slider" : "Play slider"}
              aria-pressed={!playing}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#159BB1] text-white transition-colors duration-300 hover:bg-[#101E50]"
            >
              {playing ? (
                <Pause size={19} fill="currentColor" />
              ) : (
                <Play size={19} fill="currentColor" />
              )}
            </button>

            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Next service"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#E9F4F3] text-[#101D4E] transition-colors duration-300 hover:bg-[#159BB1] hover:text-white"
            >
              <ChevronRight size={23} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
