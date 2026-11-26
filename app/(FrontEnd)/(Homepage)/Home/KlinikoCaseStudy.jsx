"use client";

import { ArrowLeft, ArrowRight, Stethoscope } from "lucide-react";
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

const AUTO_DELAY = 3000;
const SLIDE_DURATION = 0.8;
const EASE = [0.22, 1, 0.36, 1];

// ==========================================
// ORIGINAL FALLBACK DATA
// ==========================================

const DEFAULT_CASES = [
  {
    id: "heart-care",
    category: "Orthopedic",
    title: "Heart Care Diagnostic...",
    image:
      "https://html.vecurosoft.com/kliniko/demo/assets/img/doctors/caseDimg.jpg",
    href: "/case-study",
  },
  {
    id: "neo-care",
    category: "Pediatric",
    title: "Neo Care Pediatric...",
    image:
      "https://html.vecurosoft.com/kliniko/demo/assets/img/doctors/case-h1-img2.jpg",
    href: "/case-study",
  },
];

// ==========================================
// SAFE RICH TEXT
// ==========================================

function rich(value, inheritWhite = false) {
  if (typeof value !== "string") return "";

  const normalized = value
    .replace(/&(?:nbsp|#160|#xA0);/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .replace(/<p\b[^>]*>\s*<\/p>/gi, "")
    .replace(/<\/(?:p|div|h[1-6])\s*>\s*<(?:p|div|h[1-6])\b[^>]*>/gi, "<br>");

  return sanitizeHtml(normalized, {
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
    transformTags: inheritWhite
      ? {
          span: (tag, attribs) => {
            const css = attribs.style || "";

            // Remove saved white text color so
            // the original hover color can work.
            const remaining = css
              .split(";")
              .filter(
                (part) =>
                  !/^\s*color\s*:\s*(?:rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)|#fff(?:fff)?)\s*$/i.test(
                    part,
                  ),
              )
              .join(";")
              .trim();

            return {
              tagName: tag,
              attribs: remaining ? { style: remaining } : {},
            };
          },
        }
      : {},
  }).trim();
}

function plain(html) {
  return sanitizeHtml(String(html || ""), {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}

// ==========================================
// SAFE URL
// ==========================================

function safeUrl(value, fallback = "") {
  if (typeof value !== "string") return fallback;

  const source = value.trim();

  const wrapped = /^\[[^\]]+\]\((https?:\/\/[^)]+)\)$/.exec(source);

  const url = wrapped ? wrapped[1] : source;

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
      className="shrink-0 text-[#14a3b7]"
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
// ORIGINAL MOLECULAR BACKGROUND
// ==========================================

const POINTS = [
  [0, 77],
  [65, 40],
  [111, 113],
  [159, 65],
  [224, 128],
  [291, 75],
  [354, 135],
  [420, 91],
  [483, 161],
  [540, 115],
  [607, 185],
  [110, 234],
  [175, 177],
  [252, 261],
  [325, 205],
  [405, 282],
  [492, 247],
];

const EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, 9],
  [9, 10],
  [2, 11],
  [2, 12],
  [4, 12],
  [11, 12],
  [12, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [8, 16],
];

function MoleculeDecoration() {
  return (
    <svg
      viewBox="0 0 640 310"
      fill="none"
      aria-hidden="true"
      className="pointer-events-none absolute -right-20 -bottom-16 h-[280px] w-[650px] text-[#9dcfce] opacity-30 sm:h-[360px] sm:w-[760px]"
    >
      <g stroke="currentColor" strokeWidth="2">
        {EDGES.map(([a, b], index) => (
          <line
            key={index}
            x1={POINTS[a][0]}
            y1={POINTS[a][1]}
            x2={POINTS[b][0]}
            y2={POINTS[b][1]}
          />
        ))}
      </g>

      <g fill="currentColor">
        {POINTS.map(([cx, cy], index) => (
          <circle key={index} cx={cx} cy={cy} r={index % 3 === 0 ? 9 : 6} />
        ))}
      </g>
    </svg>
  );
}

// ==========================================
// ORIGINAL CASE CARD WITH HOVER EFFECTS
// ==========================================

function CaseCard({ item }) {
  const [hovered, setHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <motion.article
      initial={false}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setHovered(false);
        }
      }}
      className="group relative aspect-[1.52] w-full shrink-0 overflow-hidden rounded-[23px] bg-[#91a7b6] sm:aspect-[1.67]"
    >
      {/* IMAGE WITH ORIGINAL HOVER ZOOM */}
      <motion.div
        initial={false}
        animate={{
          scale: hovered ? 1.055 : 1,
        }}
        transition={{
          duration: 0.65,
          ease: EASE,
        }}
        className="absolute inset-0"
      >
        {imageError ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#a9cbd1] text-[#101e50]">
            <Stethoscope size={48} aria-hidden="true" />

            <span className="px-4 text-center text-sm font-semibold">
              Image unavailable
            </span>
          </div>
        ) : (
          <Image
            src={item.image}
            alt={`${item.categoryText} medical case study`}
            fill
            unoptimized
            sizes="(min-width: 1024px) 46vw, 100vw"
            className="object-cover object-center"
            onError={() => setImageError(true)}
          />
        )}
      </motion.div>

      {/* ORIGINAL PHOTO OVERLAY */}
      <div className="pointer-events-none absolute inset-0 bg-[#101e50]/10" />

      {/* DYNAMIC CATEGORY */}
      <span
        className="absolute top-5 left-5 z-10 rounded-full bg-[#6155ec] px-4 py-1.5 text-[13px] leading-none font-semibold text-white sm:top-8 sm:left-8 sm:px-5 sm:text-[16px]"
        dangerouslySetInnerHTML={{
          __html: item.category,
        }}
      />

      {/* ORIGINAL TITLE BOX */}
      <motion.div
        initial={false}
        animate={{
          backgroundColor: hovered ? "#101e50" : "#ffffff",

          boxShadow: hovered
            ? "0 13px 30px rgba(16,30,80,0.24)"
            : "0 8px 24px rgba(16,30,80,0.10)",
        }}
        transition={{
          duration: 0.4,
          ease: "easeInOut",
        }}
        className="absolute right-4 bottom-4 left-4 z-10 flex min-h-[70px] items-center justify-between gap-3 rounded-[19px] px-4 py-2.5 sm:right-7 sm:bottom-6 sm:left-7 sm:min-h-[94px] sm:gap-4 sm:px-7"
      >
        {/* DYNAMIC TITLE */}
        <motion.h3
          initial={false}
          animate={{
            color: hovered ? "#ffffff" : "#101e50",
          }}
          transition={{ duration: 0.35 }}
          className="min-w-0 flex-1 truncate text-[17px] font-bold tracking-[-0.025em] sm:text-[21px] xl:text-[26px]"
          dangerouslySetInnerHTML={{
            __html: item.title,
          }}
        />

        {/* ORIGINAL ANIMATED ARROW */}
        <motion.div
          initial={false}
          whileHover={{ scale: 1.09 }}
          whileTap={{ scale: 0.94 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 21,
          }}
          className="relative h-[49px] w-[49px] shrink-0 overflow-hidden rounded-[11px] bg-[#101e50] sm:h-[69px] sm:w-[69px]"
        >
          <motion.span
            aria-hidden="true"
            initial={false}
            animate={{
              opacity: hovered ? 1 : 0,
            }}
            transition={{
              duration: 0.35,
            }}
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#6356ec] via-[#397ed5] to-[#149eb6]"
          />

          <Link
            href={item.href}
            aria-label={`View ${item.titleText} case study`}
            className="relative z-10 flex h-full w-full items-center justify-center rounded-[11px] text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#149eb6]"
          >
            <ArrowRight size={25} strokeWidth={2.5} />
          </Link>
        </motion.div>
      </motion.div>
    </motion.article>
  );
}

// ==========================================
// MAIN CASE STUDY COMPONENT
// ==========================================

export default function KlinikoCaseStudy({ data = {}, cards = [] }) {
  // ========================================
  // DYNAMIC MONGODB CARDS
  // ========================================

  const cases = useMemo(() => {
    const saved = Array.isArray(cards)
      ? cards.filter(
          (item) =>
            item && typeof item === "object" && (item.title?.en || item.image),
        )
      : [];

    const source = saved.length ? saved : DEFAULT_CASES;

    return source.map((item, index) => {
      const fallback = DEFAULT_CASES[index % DEFAULT_CASES.length];

      const title = rich(item.title?.en ?? item.title ?? fallback.title, true);

      const category = rich(
        item.category?.en ?? item.category ?? fallback.category,
      );

      return {
        id: item.id || `case-${index}`,
        title,
        category,
        titleText: plain(title),
        categoryText: plain(category),
        image: safeUrl(item.image, fallback.image),
        href: safeUrl(item.link ?? item.href, fallback.href),
      };
    });
  }, [cards]);

  // ========================================
  // DYNAMIC SECTION TEXT
  // ========================================

  const badge = rich(data?.badge?.en || "Case Study");

  const title = rich(data?.title?.en || "Showcasing Our Medical<br>Excellence");

  // ========================================
  // INFINITE SLIDER DATA
  // ========================================

  const count = cases.length;
  const padding = Math.max(3, count);

  const slides = useMemo(
    () =>
      Array.from({ length: count + padding * 2 }, (_, index) => {
        const cardIndex = (((index - padding) % count) + count) % count;

        return cases[cardIndex];
      }),
    [cases, count, padding],
  );

  // ========================================
  // SLIDER REFS
  // ========================================

  const viewportRef = useRef(null);
  const trackRef = useRef(null);

  const stepRef = useRef(0);
  const indexRef = useRef(padding);

  const movingRef = useRef(false);
  const animationRef = useRef(null);
  const visibleRef = useRef(true);
  const touchStartRef = useRef(null);

  const [ready, setReady] = useState(false);

  const x = useMotionValue(0);

  // ========================================
  // RESPONSIVE SLIDER MEASUREMENT
  // ========================================

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!viewport || !track) return;

    indexRef.current = padding;
    stepRef.current = 0;

    const measure = () => {
      if (track.children.length < 2) return;

      const step = track.children[1].offsetLeft - track.children[0].offsetLeft;

      if (step <= 0) return;

      animationRef.current?.stop();
      animationRef.current = null;
      movingRef.current = false;

      stepRef.current = step;

      x.set(-indexRef.current * step);

      setReady(true);
    };

    measure();

    const observer = new ResizeObserver(measure);

    observer.observe(viewport);

    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();

      window.removeEventListener("resize", measure);

      animationRef.current?.stop();
    };
  }, [x, count, padding]);

  // ========================================
  // SLIDER VIEWPORT VISIBILITY
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
  // INFINITE SLIDE ANIMATION
  // ========================================

  const moveSlide = useCallback(
    (direction) => {
      if (!stepRef.current || movingRef.current) {
        return;
      }

      movingRef.current = true;

      const nextIndex = indexRef.current + direction;

      animationRef.current = animate(x, -nextIndex * stepRef.current, {
        duration: SLIDE_DURATION,
        ease: EASE,

        onComplete: () => {
          indexRef.current = nextIndex;

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
  // AUTOMATIC SLIDER
  // ========================================

  useEffect(() => {
    if (!ready) return;

    const timer = setInterval(() => {
      if (!document.hidden && visibleRef.current) {
        moveSlide(1);
      }
    }, AUTO_DELAY);

    return () => clearInterval(timer);
  }, [ready, moveSlide]);

  // ========================================
  // MOBILE TOUCH SUPPORT
  // ========================================

  const handleTouchStart = (event) => {
    touchStartRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    if (touchStartRef.current === null) {
      return;
    }

    const last = event.changedTouches[0]?.clientX;

    if (typeof last === "number") {
      const distance = touchStartRef.current - last;

      if (Math.abs(distance) >= 45) {
        moveSlide(distance > 0 ? 1 : -1);
      }
    }

    touchStartRef.current = null;
  };

  // ========================================
  // ORIGINAL SECTION DESIGN
  // ========================================

  return (
    <section
      aria-labelledby="kliniko-case-heading"
      className="relative isolate overflow-hidden bg-[#F1F8F5] py-20 sm:py-24 lg:py-[105px]"
    >
      <MoleculeDecoration />

      <div className="relative z-10 mx-auto w-full max-w-[1540px] px-6 sm:px-10 lg:px-12 2xl:px-6">
        {/* SECTION HEADER */}
        <div className="flex flex-wrap items-end justify-between gap-7 sm:gap-10">
          <div className="max-w-[850px]">
            {/* BADGE SCROLL ANIMATION */}
            <motion.div
              initial={{
                opacity: 0,
                y: 24,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.5,
              }}
              transition={{
                duration: 0.65,
                ease: "easeOut",
              }}
              className="flex items-center gap-3"
            >
              <SectionIcon />

              <span
                className="text-[19px] font-semibold text-[#101e50] sm:text-[23px]"
                dangerouslySetInnerHTML={{
                  __html: badge,
                }}
              />
            </motion.div>

            {/* TITLE SCROLL ANIMATION */}
            <motion.h2
              id="kliniko-case-heading"
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
                amount: 0.3,
              }}
              transition={{
                duration: 0.75,
                delay: 0.12,
                ease: EASE,
              }}
              className="mt-7 text-[clamp(2.2rem,4vw,4rem)] leading-[1.16] font-bold tracking-[-0.035em] text-[#101e50]"
              dangerouslySetInnerHTML={{
                __html: title,
              }}
            />
          </div>

          {/* NAVIGATION SCROLL ANIMATION */}
          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              duration: 0.65,
              delay: 0.2,
              ease: "easeOut",
            }}
            className="flex items-center gap-2 rounded-full border border-[#9edbe6] bg-white p-1.5"
          >
            <button
              type="button"
              onClick={() => moveSlide(-1)}
              aria-label="Previous case study"
              className="flex h-[48px] w-[48px] cursor-pointer items-center justify-center rounded-full bg-[#f0f7f3] text-[#101e50] transition-colors duration-300 hover:bg-[#159AAF] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#159bb1]"
            >
              <ArrowLeft size={25} strokeWidth={2.2} />
            </button>

            <button
              type="button"
              onClick={() => moveSlide(1)}
              aria-label="Next case study"
              className="flex h-[48px] w-[48px] cursor-pointer items-center justify-center rounded-full bg-[#f0f7f3] text-[#101e50] transition-colors duration-300 hover:bg-[#159AAF] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#159bb1]"
            >
              <ArrowRight size={25} strokeWidth={2.2} />
            </button>
          </motion.div>
        </div>

        {/* INFINITE CASE STUDY SLIDER */}
        <div
          ref={viewportRef}
          dir="ltr"
          role="region"
          aria-roledescription="carousel"
          aria-label="Medical case studies"
          aria-live="off"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={() => {
            touchStartRef.current = null;
          }}
          style={{
            touchAction: "pan-y",
          }}
          className="mt-12 overflow-hidden rounded-[23px] sm:mt-14 lg:mt-[65px]"
        >
          <motion.div
            ref={trackRef}
            style={{
              x,
              opacity: ready ? 1 : 0,
            }}
            className="relative flex w-full items-stretch gap-6 will-change-transform"
          >
            {slides.map((item, index) => (
              <motion.div
                key={`${item.id}-${index}`}
                initial={{
                  opacity: 0,
                  y: 55,
                  scale: 0.97,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                viewport={{
                  once: true,
                  amount: 0.12,
                }}
                transition={{
                  duration: 0.7,
                  delay: (index % count) * 0.12,
                  ease: EASE,
                }}
                className="w-full shrink-0 lg:w-[calc(50%_-_12px)]"
              >
                <CaseCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
