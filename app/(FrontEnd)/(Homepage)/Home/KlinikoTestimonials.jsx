"use client";

import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { animate, motion, useMotionValue } from "motion/react";
import Image from "next/image";
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
const SLIDE_DURATION = 0.75;
const EASE = [0.22, 1, 0.36, 1];

// Default content if MongoDB has no cards
const DEFAULT_REVIEWS = [
  {
    id: "mira-lopez",
    name: "Mira Lopez",
    location: "Brisbane",
    photo: "/images/testimonials/patient-1.webp",
    review:
      '"Signs include unexplained increases in water bills, damp or moldy kind spots on walls or ceilings, and the sound of running.”',
    rating: 4.5,
  },
  {
    id: "sarah-johnson",
    name: "Sarah Johnson",
    location: "Brisbane",
    photo: "/images/testimonials/patient-2.webp",
    review:
      '"Signs include unexplained increases in water bills, damp or moldy kind spots on walls or ceilings, and the sound of running.”',
    rating: 4.5,
  },
  {
    id: "sarah-johnson-2",
    name: "Sarah Johnson",
    location: "Brisbane",
    photo: "/images/testimonials/patient-3.webp",
    review:
      '"Signs include unexplained increases in water bills, damp or moldy kind spots on walls or ceilings, and the sound of running.”',
    rating: 4.5,
  },
];

// ==========================================
// RICH TEXT FROM MONGODB
// ==========================================

function rich(value, inheritHoverColor = false) {
  if (typeof value !== "string") return "";

  const html = value
    .replace(/&(?:nbsp|#160|#xA0);/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .replace(/<p\b[^>]*>\s*<\/p>/gi, "")
    .replace(/<\/(?:p|div|h[1-6])\s*>\s*<(?:p|div|h[1-6])\b[^>]*>/gi, "<br>");

  return sanitizeHtml(html, {
    allowedTags: ["span", "strong", "b", "em", "i", "u", "s", "br"],
    allowedAttributes: {
      span: ["style"],
    },
    allowedStyles: {
      span: {
        color: [/^#[a-f\d]{3,8}$/i, /^rgba?\([\d\s,.%]+\)$/i],
        "background-color": [/^#[a-f\d]{3,8}$/i, /^rgba?\([\d\s,.%]+\)$/i],
      },
    },
    transformTags: inheritHoverColor
      ? {
          span: (tagName, attribs) => {
            const declarations = (attribs.style || "")
              .split(";")
              .map((part) => part.trim())
              .filter(Boolean)
              .filter(
                (part) =>
                  !/^color\s*:\s*(?:rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)|rgb\(\s*247\s*,\s*249\s*,\s*254\s*\)|#fff(?:fff)?|#f7f9fe)$/i.test(
                    part,
                  ),
              );

            return {
              tagName,
              attribs: declarations.length
                ? { style: declarations.join(";") }
                : {},
            };
          },
        }
      : {},
  }).trim();
}

function plain(value) {
  return sanitizeHtml(String(value || ""), {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}

// ==========================================
// SAFE CLOUDINARY IMAGE
// ==========================================

function safeImage(value, fallback = "") {
  if (typeof value !== "string") return fallback;

  const raw = value.trim();
  const markdown = /^\[[^\]]+\]\((https?:\/\/[^)]+)\)$/.exec(raw);

  const url = markdown ? markdown[1] : raw;

  if (url.startsWith("/") && !url.startsWith("//") && !/[\\\s"']/.test(url)) {
    return url;
  }

  try {
    const parsed = new URL(url);

    if (parsed.protocol === "https:" && !parsed.username && !parsed.password) {
      return url;
    }
  } catch {}

  return fallback;
}

// ==========================================
// ORIGINAL HOVER ANIMATIONS
// ==========================================

const CARD_VARIANTS = {
  rest: {
    y: 0,
    backgroundColor: "#FFFFFF",
    boxShadow: "0 0 0 rgba(14,29,76,0)",
  },
  hover: {
    y: -8,
    backgroundColor: "#0E1D4C",
    boxShadow: "0 20px 45px rgba(14,29,76,0.18)",
  },
};

const REVIEW_VARIANTS = {
  rest: { color: "#818181", x: 0 },
  hover: { color: "#F7F9FE", x: 2 },
};

const NAME_VARIANTS = {
  rest: { color: "#0E1D4C", y: 0 },
  hover: { color: "#FFFFFF", y: -2 },
};

const LOCATION_VARIANTS = {
  rest: { color: "#818181" },
  hover: { color: "#F7F9FE" },
};

// ==========================================
// SCROLL ANIMATION
// ==========================================

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.12 },
  transition: {
    duration: 0.7,
    delay,
    ease: EASE,
  },
});

// ==========================================
// SECTION ICON
// ==========================================

function SectionMark() {
  return (
    <svg
      width="29"
      height="29"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-[#159AAF]"
    >
      {[45, -45].map((angle) => (
        <rect
          key={angle}
          x="12"
          y="1"
          width="8"
          height="30"
          rx="4"
          transform={`rotate(${angle} 16 16)`}
          stroke="currentColor"
          strokeWidth="2.5"
        />
      ))}

      <circle cx="16" cy="16" r="2" fill="currentColor" />
    </svg>
  );
}

// ==========================================
// DYNAMIC RATING STARS
// Supports 3.5, 4.3, etc.
// ==========================================

function RatingStars({ rating }) {
  const score = Math.min(5, Math.max(0, Number(rating) || 0));

  return (
    <div
      role="img"
      aria-label={`${score} out of 5 stars`}
      className="flex items-center gap-[5px]"
    >
      {Array.from({ length: 5 }, (_, index) => {
        const filled = Math.min(1, Math.max(0, score - index));

        return (
          <motion.span
            key={index}
            variants={{
              rest: {
                y: 0,
                rotate: 0,
                scale: 1,
              },
              hover: {
                y: -3,
                rotate: index % 2 ? 9 : -9,
                scale: 1.09,
              },
            }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 15,
              delay: index * 0.035,
            }}
            className="relative inline-flex h-[22px] w-[22px] shrink-0"
            aria-hidden="true"
          >
            <Star
              size={22}
              strokeWidth={1.6}
              fill="transparent"
              stroke="#DB9E30"
            />

            <span
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{
                width: `${filled * 100}%`,
              }}
            >
              <Star
                size={22}
                strokeWidth={1.6}
                fill="#DB9E30"
                stroke="#DB9E30"
                className="absolute top-0 left-0"
              />
            </span>
          </motion.span>
        );
      })}
    </div>
  );
}

// ==========================================
// ORIGINAL QUOTATION DECORATION
// ==========================================

function QuoteMark() {
  return (
    <div className="mt-4 flex shrink-0 gap-[9px]" aria-hidden="true">
      {["#5856E6", "#258FAF"].map((color, index) => (
        <motion.span
          key={color}
          variants={{
            rest: {
              backgroundColor: "#D0EBEF",
              y: 0,
              rotate: 0,
              skewX: -16,
              opacity: 0.9,
            },
            hover: {
              backgroundColor: color,
              y: index ? -4 : -8,
              rotate: index ? 4 : -4,
              skewX: -16,
              opacity: 1,
            },
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 19,
            delay: index * 0.035,
          }}
          className="block h-[50px] w-[27px] rounded-[1px]"
        />
      ))}
    </div>
  );
}

// ==========================================
// TESTIMONIAL CARD
// ==========================================

function ReviewCard({ review }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <motion.article
      role="group"
      aria-label={`Testimonial from ${review.nameText}`}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      variants={CARD_VARIANTS}
      transition={{
        backgroundColor: {
          duration: 0.42,
          ease: "easeInOut",
        },
        boxShadow: {
          duration: 0.42,
        },
        y: {
          type: "spring",
          stiffness: 270,
          damping: 24,
        },
      }}
      className="relative flex h-full min-h-[440px] min-w-0 flex-col overflow-hidden rounded-[26px] px-7 pt-8 pb-8 sm:min-h-[450px] sm:px-8 sm:pt-9 sm:pb-9 xl:h-[432px] xl:min-h-0 xl:px-[38px] xl:pt-[38px] xl:pb-[38px]"
    >
      {/* TOP RIGHT CORNER */}
      <motion.span
        aria-hidden="true"
        variants={{
          rest: { opacity: 0.95 },
          hover: { opacity: 1 },
        }}
        className="pointer-events-none absolute top-0 right-0 h-[124px] w-[124px] rounded-tr-[26px] border-t-[1.5px] border-r-[1.5px] border-[#15A0B7]"
      />

      {/* BOTTOM LEFT CORNER */}
      <motion.span
        aria-hidden="true"
        variants={{
          rest: { opacity: 0.95 },
          hover: { opacity: 1 },
        }}
        className="pointer-events-none absolute bottom-0 left-0 h-[124px] w-[124px] rounded-bl-[26px] border-b-[1.5px] border-l-[1.5px] border-[#15A0B7]"
      />

      {/* HOVER GLOW */}
      <motion.div
        aria-hidden="true"
        variants={{
          rest: { opacity: 0 },
          hover: { opacity: 1 },
        }}
        transition={{ duration: 0.5 }}
        className="pointer-events-none absolute -top-16 -right-14 h-[220px] w-[220px] rounded-full bg-[#2384AB]/10 blur-[55px]"
      />

      {/* PATIENT PHOTO AND QUOTE */}
      <div className="relative flex items-start justify-between gap-5">
        <motion.div
          variants={{
            rest: {
              scale: 1,
              rotate: 0,
              borderColor: "#159AAF",
            },
            hover: {
              scale: 1.09,
              rotate: -3,
              borderColor: "#35CBDB",
            },
          }}
          transition={{
            type: "spring",
            stiffness: 250,
            damping: 17,
          }}
          className="relative h-[86px] w-[86px] shrink-0 overflow-hidden rounded-full border-[6px] bg-[#E6F5F3]"
        >
          {imageFailed || !review.photo ? (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-[#0E1D4C]">
              {review.nameText.charAt(0)}
            </div>
          ) : (
            <motion.div
              variants={{
                rest: { scale: 1 },
                hover: { scale: 1.08 },
              }}
              transition={{
                duration: 0.5,
                ease: EASE,
              }}
              className="absolute inset-0"
            >
              <Image
                src={review.photo}
                alt={`Portrait accompanying review by ${review.nameText}`}
                fill
                unoptimized
                sizes="86px"
                className="object-cover object-center"
                onError={() => setImageFailed(true)}
              />
            </motion.div>
          )}
        </motion.div>

        <QuoteMark />
      </div>

      {/* DYNAMIC STAR RATING */}
      <div className="relative mt-[24px]">
        <RatingStars rating={review.rating} />
      </div>

      {/* MONGODB REVIEW TEXT */}
      <motion.p
        variants={REVIEW_VARIANTS}
        transition={{
          duration: 0.36,
          ease: "easeOut",
        }}
        className="relative mt-[25px] flex-1 text-[15px] leading-[1.6] font-medium sm:text-[17px] xl:text-[19px] xl:leading-[1.72]"
      >
        <span
          dangerouslySetInnerHTML={{
            __html: review.reviewHtml,
          }}
        />
      </motion.p>

      {/* PATIENT NAME */}
      <div className="relative mt-[20px]">
        <motion.h3
          variants={NAME_VARIANTS}
          transition={{ duration: 0.35 }}
          className="text-[23px] leading-[1.25] font-bold tracking-[-0.022em] sm:text-[25px] xl:text-[29px]"
          dangerouslySetInnerHTML={{
            __html: review.nameHtml,
          }}
        />

        {/* Optional patient role */}
        {review.roleHtml && (
          <motion.p
            variants={LOCATION_VARIANTS}
            transition={{ duration: 0.35 }}
            className="mt-[12px] text-[16px] leading-[1.4] sm:text-[18px] xl:text-[20px]"
            dangerouslySetInnerHTML={{
              __html: review.roleHtml,
            }}
          />
        )}
      </div>
    </motion.article>
  );
}

// ==========================================
// MAIN TESTIMONIALS COMPONENT
// ==========================================

export default function KlinikoTestimonials({ data = {}, cards = [] }) {
  // ========================================
  // LOAD MONGODB REVIEWS
  // ========================================

  const reviews = useMemo(() => {
    const saved = Array.isArray(cards)
      ? cards.filter(
          (card) =>
            card &&
            typeof card === "object" &&
            (card.name?.en || card.review?.en || card.image),
        )
      : [];

    const source = saved.length ? saved : DEFAULT_REVIEWS;

    return source.map((card, index) => {
      const fallback = DEFAULT_REVIEWS[index % DEFAULT_REVIEWS.length];

      const nameHtml = rich(card.name?.en ?? card.name ?? fallback.name, true);

      return {
        id: card.id || `review-${index}`,

        nameHtml,

        nameText: plain(nameHtml),

        reviewHtml: rich(
          card.review?.en ?? card.review ?? fallback.review,
          true,
        ),

        roleHtml: rich(card.role?.en ?? card.role ?? card.location ?? ""),

        photo: safeImage(card.image ?? card.photo, fallback.photo),

        rating: Math.min(
          5,
          Math.max(0, Number(card.rating ?? fallback.rating) || 0),
        ),
      };
    });
  }, [cards]);

  // ========================================
  // MONGODB SECTION HEADING
  // ========================================

  const badge = rich(data?.badge?.en || "Testimonials");

  const title = rich(
    data?.title?.en || "Feedback & Review From<br>Our Patient",
  );

  // ========================================
  // DYNAMIC INFINITE SLIDER
  // ========================================

  const count = reviews.length;

  // Extra copies prevent blank spaces
  // when only 2 reviews are in MongoDB.
  const padding = Math.max(4, count);

  const slides = useMemo(
    () =>
      Array.from(
        {
          length: count + padding * 2,
        },
        (_, index) => reviews[(((index - padding) % count) + count) % count],
      ),
    [reviews, count, padding],
  );

  const viewportRef = useRef(null);
  const trackRef = useRef(null);

  const indexRef = useRef(padding);
  const stepRef = useRef(0);
  const animationRef = useRef(null);

  const movingRef = useRef(false);
  const visibleRef = useRef(false);

  const touchStartRef = useRef(null);
  const touchingRef = useRef(false);

  const x = useMotionValue(0);

  const [ready, setReady] = useState(false);

  // ========================================
  // RESPONSIVE SLIDER MEASUREMENT
  // ========================================

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!viewport || !track) return;

    indexRef.current = padding;
    stepRef.current = 0;

    setReady(false);

    const measure = () => {
      if (track.children.length < 2) return;

      const step = track.children[1].offsetLeft - track.children[0].offsetLeft;

      if (step <= 0 || Math.abs(stepRef.current - step) < 0.2) {
        return;
      }

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
  }, [padding, count, x]);

  // ========================================
  // DETECT VIEWPORT VISIBILITY
  // ========================================

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      {
        threshold: 0.1,
      },
    );

    observer.observe(viewport);

    return () => observer.disconnect();
  }, []);

  // ========================================
  // MOVE SLIDER
  // ========================================

  const move = useCallback(
    (direction) => {
      if (!stepRef.current || movingRef.current) {
        return;
      }

      movingRef.current = true;

      const next = indexRef.current + direction;

      animationRef.current = animate(x, -next * stepRef.current, {
        duration: SLIDE_DURATION,
        ease: EASE,

        onComplete: () => {
          indexRef.current = next;

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
  // AUTO SLIDE EVERY 3 SECONDS
  // ========================================

  useEffect(() => {
    if (!ready) return;

    const timer = window.setInterval(() => {
      if (!document.hidden && visibleRef.current && !touchingRef.current) {
        move(1);
      }
    }, AUTO_DELAY);

    return () => {
      window.clearInterval(timer);
    };
  }, [ready, move]);

  useEffect(() => () => animationRef.current?.stop(), []);

  // ========================================
  // MOBILE TOUCH
  // ========================================

  const handleTouchStart = (event) => {
    touchingRef.current = true;

    touchStartRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    const start = touchStartRef.current;

    const end = event.changedTouches[0]?.clientX;

    if (typeof start === "number" && typeof end === "number") {
      const distance = start - end;

      if (Math.abs(distance) >= 45) {
        move(distance > 0 ? 1 : -1);
      }
    }

    touchStartRef.current = null;
    touchingRef.current = false;
  };

  // ========================================
  // ORIGINAL SECTION DESIGN
  // ========================================

  return (
    <section
      aria-labelledby="kliniko-testimonials-heading"
      className="relative isolate overflow-hidden bg-[#F1F7F3] py-14 sm:py-16 lg:py-[76px]"
    >
      <div className="mx-auto w-full max-w-[1540px] px-6 sm:px-10 lg:px-12 2xl:px-6">
        {/* HEADING AND NAVIGATION */}
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8">
          <div className="max-w-[900px]">
            {/* BADGE ANIMATION */}
            <motion.div {...reveal(0)} className="flex items-center gap-3">
              <SectionMark />

              <span
                className="text-[19px] leading-none font-semibold text-[#0E1D4C] sm:text-[23px]"
                dangerouslySetInnerHTML={{
                  __html: badge,
                }}
              />
            </motion.div>

            {/* TITLE ANIMATION */}
            <motion.h2
              {...reveal(0.12)}
              id="kliniko-testimonials-heading"
              className="mt-8 text-[clamp(2.25rem,3.8vw,3.75rem)] leading-[1.26] font-bold tracking-[-0.025em] text-[#0E1D4C]"
              dangerouslySetInnerHTML={{
                __html: title,
              }}
            />
          </div>

          {/* NAVIGATION BUTTONS */}
          <motion.div
            {...reveal(0.2)}
            className="mb-[6px] flex items-center gap-[8px] rounded-full border border-[#86D4DF] bg-white p-[6px]"
          >
            {[
              {
                label: "Previous testimonial",
                direction: -1,
                Icon: ArrowLeft,
              },
              {
                label: "Next testimonial",
                direction: 1,
                Icon: ArrowRight,
              },
            ].map(({ label, direction, Icon }) => (
              <motion.button
                key={direction}
                type="button"
                onClick={() => move(direction)}
                aria-label={label}
                whileHover={{
                  scale: 1.08,
                  backgroundColor: "#0E1D4C",
                  color: "#FFFFFF",
                }}
                whileTap={{
                  scale: 0.91,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 19,
                }}
                className="flex h-[55px] w-[55px] cursor-pointer items-center justify-center rounded-full bg-[#F1F7F3] text-[#0E1D4C] outline-none focus-visible:ring-2 focus-visible:ring-[#159AAF]"
              >
                <Icon size={26} strokeWidth={2.1} />
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* INFINITE TESTIMONIAL SLIDER */}
        <div
          ref={viewportRef}
          dir="ltr"
          role="region"
          aria-roledescription="carousel"
          aria-label="Patient testimonials"
          aria-live="off"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={() => {
            touchStartRef.current = null;
            touchingRef.current = false;
          }}
          style={{
            touchAction: "pan-y",
          }}
          className="mt-[55px] overflow-hidden pt-3 pb-10 sm:mt-[60px] xl:mt-[62px]"
        >
          <motion.div
            ref={trackRef}
            style={{
              x,
              opacity: ready ? 1 : 0,
            }}
            className="relative flex w-full items-stretch gap-9 will-change-transform"
          >
            {slides.map((review, index) => (
              <motion.div
                key={`${review.id}-${index}`}
                {...reveal((index % count) * 0.1)}
                className="min-w-0 shrink-0 basis-full md:basis-[calc(50%_-_18px)] xl:basis-[calc(33.333333%_-_24px)]"
              >
                <ReviewCard review={review} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
