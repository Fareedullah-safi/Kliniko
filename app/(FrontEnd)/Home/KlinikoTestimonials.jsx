"use client";

import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { animate, motion, useMotionValue } from "motion/react";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

// ==========================================
// STATIC TESTIMONIAL DATA
// ==========================================

// Screenshot-matched demo content.
// Replace with genuine patient reviews before publishing.
const REVIEWS = [
  {
    id: "mira-lopez",
    name: "Mira Lopez",
    location: "Brisbane",
    photo: "/images/testimonials/patient-1.webp",
    review:
      '"Signs include unexplained increases in water bills, damp or moldy kind spots on walls or ceilings, and the sound of running.”',
  },
  {
    id: "sarah-johnson",
    name: "Sarah Johnson",
    location: "Brisbane",
    photo: "/images/testimonials/patient-2.webp",
    review:
      '"Signs include unexplained increases in water bills, damp or moldy kind spots on walls or ceilings, and the sound of running.”',
  },
  {
    id: "sarah-johnson-2",
    name: "Sarah Johnson",
    location: "Brisbane",
    photo: "/images/testimonials/patient-3.webp",
    review:
      '"Signs include unexplained increases in water bills, damp or moldy kind spots on walls or ceilings, and the sound of running.”',
  },
];

// ==========================================
// SLIDER SETTINGS
// ==========================================

const COUNT = REVIEWS.length;

const REPEATED = [...REVIEWS, ...REVIEWS, ...REVIEWS];

const AUTO_DELAY = 3000;
const SLIDE_DURATION = 0.75;
const EASE = [0.22, 1, 0.36, 1];

// ==========================================
// FRAMER MOTION HOVER VARIANTS
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
  rest: {
    color: "#818181",
    x: 0,
  },
  hover: {
    color: "#F7F9FE",
    x: 2,
  },
};

const NAME_VARIANTS = {
  rest: {
    color: "#0E1D4C",
    y: 0,
  },
  hover: {
    color: "#FFFFFF",
    y: -2,
  },
};

const LOCATION_VARIANTS = {
  rest: { color: "#818181" },
  hover: { color: "#F7F9FE" },
};

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
// ANIMATED RATING STARS
// ==========================================

function RatingStars() {
  return (
    <div
      role="img"
      aria-label="4.5 out of 5 stars"
      className="flex items-center gap-[5px]"
    >
      {[0, 1, 2, 3].map((index) => (
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
          className="inline-flex"
        >
          <Star
            size={22}
            strokeWidth={1.6}
            fill="#DB9E30"
            stroke="#DB9E30"
            aria-hidden="true"
          />
        </motion.span>
      ))}

      {/* HALF STAR */}
      <motion.span
        variants={{
          rest: {
            y: 0,
            rotate: 0,
            scale: 1,
          },
          hover: {
            y: -3,
            rotate: -9,
            scale: 1.09,
          },
        }}
        transition={{
          type: "spring",
          stiffness: 320,
          damping: 15,
          delay: 0.14,
        }}
        className="relative inline-flex h-[22px] w-[22px]"
        aria-hidden="true"
      >
        <Star
          size={22}
          strokeWidth={1.6}
          fill="transparent"
          stroke="#DB9E30"
          className="absolute inset-0"
        />

        <span className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
          <Star
            size={22}
            strokeWidth={1.6}
            fill="#DB9E30"
            stroke="#DB9E30"
            className="absolute top-0 left-0"
          />
        </span>
      </motion.span>
    </div>
  );
}

// ==========================================
// ANIMATED QUOTATION MARKS
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
      aria-label={`Testimonial from ${review.name}`}

      // NORMAL STATE: WHITE
      initial="rest"
      animate="rest"

      // ONLY ACTIVATE WHEN THE USER HOVERS.
      // AUTOMATICALLY REVERT WHEN MOUSE LEAVES.
      whileHover="hover"

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
      className="relative flex min-h-[440px] min-w-0 shrink-0 basis-full flex-col overflow-hidden rounded-[26px] px-7 pt-8 pb-8 sm:min-h-[450px] sm:px-8 sm:pt-9 sm:pb-9 md:basis-[calc(50%_-_18px)] xl:h-[432px] xl:min-h-0 xl:basis-[calc(33.333333%_-_24px)] xl:px-[38px] xl:pt-[38px] xl:pb-[38px]"
    >
      {/* ====================================
          TOP RIGHT CYAN CORNER
      ==================================== */}

      <motion.span
        aria-hidden="true"
        variants={{
          rest: { opacity: 0.95 },
          hover: { opacity: 1 },
        }}
        className="pointer-events-none absolute top-0 right-0 h-[124px] w-[124px] rounded-tr-[26px] border-t-[1.5px] border-r-[1.5px] border-[#15A0B7]"
      />

      {/* ====================================
          BOTTOM LEFT CYAN CORNER
      ==================================== */}

      <motion.span
        aria-hidden="true"
        variants={{
          rest: { opacity: 0.95 },
          hover: { opacity: 1 },
        }}
        className="pointer-events-none absolute bottom-0 left-0 h-[124px] w-[124px] rounded-bl-[26px] border-b-[1.5px] border-l-[1.5px] border-[#15A0B7]"
      />

      {/* ====================================
          SUBTLE HOVER GLOW
      ==================================== */}

      <motion.div
        aria-hidden="true"
        variants={{
          rest: { opacity: 0 },
          hover: { opacity: 1 },
        }}
        transition={{ duration: 0.5 }}
        className="pointer-events-none absolute -top-16 -right-14 h-[220px] w-[220px] rounded-full bg-[#2384AB]/10 blur-[55px]"
      />

      {/* ====================================
          PATIENT PHOTO AND QUOTE MARK
      ==================================== */}

      <div className="relative flex items-start justify-between gap-5">
        {/* ANIMATED PATIENT PHOTO */}
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
          {imageFailed ? (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-[#0E1D4C]">
              {review.name.charAt(0)}
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
                alt={`Portrait accompanying ${review.name}'s demo review`}
                fill
                sizes="86px"
                className="object-cover object-center"
                onError={() => setImageFailed(true)}
              />
            </motion.div>
          )}
        </motion.div>

        {/* ANIMATED QUOTATION MARK */}
        <QuoteMark />
      </div>

      {/* ====================================
          STARS
      ==================================== */}

      <div className="relative mt-[24px]">
        <RatingStars />
      </div>

      {/* ====================================
          REVIEW TEXT
      ==================================== */}

      <motion.p
        variants={REVIEW_VARIANTS}
        transition={{
          duration: 0.36,
          ease: "easeOut",
        }}
        className="relative mt-[25px] flex-1 text-[15px] leading-[1.6] font-medium sm:text-[17px] xl:text-[19px] xl:leading-[1.72]"
      >
        {review.review}
      </motion.p>

      {/* ====================================
          PATIENT NAME AND LOCATION
      ==================================== */}

      <div className="relative mt-[20px]">
        <motion.h3
          variants={NAME_VARIANTS}
          transition={{
            duration: 0.35,
          }}
          className="text-[23px] leading-[1.25] font-bold tracking-[-0.022em] sm:text-[25px] xl:text-[29px]"
        >
          {review.name}
        </motion.h3>

        <motion.p
          variants={LOCATION_VARIANTS}
          transition={{
            duration: 0.35,
          }}
          className="mt-[12px] text-[16px] leading-[1.4] sm:text-[18px] xl:text-[20px]"
        >
          {review.location}
        </motion.p>
      </div>
    </motion.article>
  );
}

// ==========================================
// MAIN TESTIMONIALS SECTION
// ==========================================

export default function KlinikoTestimonials() {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);

  const stepRef = useRef(0);
  const indexRef = useRef(COUNT);

  const animationRef = useRef(null);
  const movingRef = useRef(false);
  const visibleRef = useRef(false);
  const touchStartRef = useRef(null);

  const [ready, setReady] = useState(false);

  const x = useMotionValue(0);

  // ==========================================
  // RESPONSIVE CARD WIDTH MEASUREMENT
  // ==========================================

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!viewport || !track) return;

    const measure = () => {
      const children = track.children;

      if (children.length < 2) return;

      const step = children[1].offsetLeft - children[0].offsetLeft;

      if (step <= 0) return;

      const oldStep = stepRef.current;

      const previousProgress = oldStep
        ? -x.get() / oldStep - indexRef.current
        : 0;

      animationRef.current?.stop();

      animationRef.current = null;
      movingRef.current = false;

      stepRef.current = step;

      x.set(-(indexRef.current + previousProgress) * step);

      setReady(true);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);

    return () => {
      observer.disconnect();
      animationRef.current?.stop();
    };
  }, [x]);

  // ==========================================
  // VIEWPORT VISIBILITY CHECK
  // ==========================================

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

  // ==========================================
  // FRAMER MOTION SLIDE
  // ==========================================

  const move = (direction) => {
    if (!ready || movingRef.current || stepRef.current <= 0) {
      return;
    }

    movingRef.current = true;

    const nextIndex = indexRef.current + direction;

    animationRef.current = animate(x, -nextIndex * stepRef.current, {
      duration: SLIDE_DURATION,
      ease: EASE,

      onComplete: () => {
        let normalized = nextIndex;

        // SEAMLESS INFINITE LOOP
        if (normalized >= COUNT * 2) {
          normalized -= COUNT;
        }

        if (normalized < COUNT) {
          normalized += COUNT;
        }

        indexRef.current = normalized;

        // Instant invisible reset between
        // identical copies of the cards.
        x.set(-normalized * stepRef.current);

        movingRef.current = false;
        animationRef.current = null;
      },
    });
  };

  // ==========================================
  // AUTOMATIC RIGHT-TO-LEFT SLIDE
  // ==========================================

  useEffect(() => {
    if (!ready) return;

    const timer = window.setInterval(() => {
      if (!document.hidden && visibleRef.current) {
        // One card moves left every 3 seconds.
        move(1);
      }
    }, AUTO_DELAY);

    return () => window.clearInterval(timer);
  }, [ready]);

  // ==========================================
  // CLEANUP
  // ==========================================

  useEffect(() => {
    return () => {
      animationRef.current?.stop();
    };
  }, []);

  // ==========================================
  // MOBILE SWIPE
  // ==========================================

  const handleTouchStart = (event) => {
    touchStartRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    if (touchStartRef.current === null) return;

    const end = event.changedTouches[0]?.clientX;

    if (typeof end === "number") {
      const delta = touchStartRef.current - end;

      if (Math.abs(delta) > 45) {
        move(delta > 0 ? 1 : -1);
      }
    }

    touchStartRef.current = null;
  };

  // ==========================================
  // JSX
  // ==========================================

  return (
    <section
      aria-labelledby="kliniko-testimonials-heading"
      className="relative isolate overflow-hidden bg-[#F1F7F3] py-14 sm:py-16 lg:py-[76px]"
    >
      {/* SAME CONTAINER SPACING AS HERO */}
      <div className="mx-auto w-full max-w-[1540px] px-6 sm:px-10 lg:px-12 2xl:px-6">
        {/* SECTION HEADING AND ARROWS */}
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8">
          <div className="max-w-[900px]">
            <div className="flex items-center gap-3">
              <SectionMark />

              <span className="text-[19px] leading-none font-semibold text-[#0E1D4C] sm:text-[23px]">
                Testimonials
              </span>
            </div>

            <h2
              id="kliniko-testimonials-heading"
              className="mt-8 text-[clamp(2.25rem,3.8vw,3.75rem)] leading-[1.26] font-bold tracking-[-0.025em] text-[#0E1D4C]"
            >
              Feedback &amp; Review From
              <span className="block">Our Patient</span>
            </h2>
          </div>

          {/* PREVIOUS / NEXT ONLY */}
          <div className="mb-[6px] flex items-center gap-[8px] rounded-full border border-[#86D4DF] bg-white p-[6px]">
            <motion.button
              type="button"
              onClick={() => move(-1)}
              aria-label="Previous testimonial"
              whileHover={{
                scale: 1.08,
                backgroundColor: "#0E1D4C",
                color: "#FFFFFF",
              }}
              whileTap={{ scale: 0.91 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 19,
              }}
              className="flex h-[55px] w-[55px] cursor-pointer items-center justify-center rounded-full bg-[#F1F7F3] text-[#0E1D4C] outline-none focus-visible:ring-2 focus-visible:ring-[#159AAF]"
            >
              <ArrowLeft size={26} strokeWidth={2.1} />
            </motion.button>

            <motion.button
              type="button"
              onClick={() => move(1)}
              aria-label="Next testimonial"
              whileHover={{
                scale: 1.08,
                backgroundColor: "#0E1D4C",
                color: "#FFFFFF",
              }}
              whileTap={{ scale: 0.91 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 19,
              }}
              className="flex h-[55px] w-[55px] cursor-pointer items-center justify-center rounded-full bg-[#F1F7F3] text-[#0E1D4C] outline-none focus-visible:ring-2 focus-visible:ring-[#159AAF]"
            >
              <ArrowRight size={26} strokeWidth={2.1} />
            </motion.button>
          </div>
        </div>

        {/* ====================================
            INFINITE TESTIMONIAL CAROUSEL
        ==================================== */}

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
            {REPEATED.map((review, index) => (
              <ReviewCard key={`${review.id}-${index}`} review={review} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
