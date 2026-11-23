"use client";

import {
  Activity,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  HeartPulse,
  Microscope,
  Siren,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

// ==========================================
// STATIC SERVICES
// ==========================================

const SERVICES = [
  {
    id: 2,
    number: "02",
    title: "Emergency & Critical Care Service",
    description:
      "Immediate medical support for urgent illnesses, injuries, and life-threatening conditions.",
    icon: Siren,
    href: "/services/emergency-care",
  },
  {
    id: 3,
    number: "03",
    title: "Diagnostics & Laboratory Services",
    description:
      "Accurate blood tests, imaging, ECG, and other diagnostics for proper evaluation and timely medical decision-making.",
    icon: Microscope,
    href: "/services/diagnostics",
  },
  {
    id: 4,
    number: "04",
    title: "General Medicine And Primary Care",
    description:
      "Our doctors provide timely checkups and essential medical guidance with complete care.",
    icon: Stethoscope,
    href: "/services/general-medicine",
  },
  {
    id: 5,
    number: "05",
    title: "Cardiology & Heart Care",
    description:
      "Comprehensive heart health consultations, assessments, and personalized medical care.",
    icon: HeartPulse,
    href: "/services/cardiology",
  },
  {
    id: 6,
    number: "06",
    title: "Preventive Health Checkups",
    description:
      "Routine health examinations and medical advice focused on long-term wellness.",
    icon: Activity,
    href: "/services/health-checkups",
  },
  {
    id: 1,
    number: "01",
    title: "Advanced Medical Consultation",
    description:
      "Professional medical consultations and personalized healthcare guidance for patients.",
    icon: FlaskConical,
    href: "/services/consultation",
  },
];

// Duplicate the services for a seamless loop.
const SERVICE_COUNT = SERVICES.length;
const ALL_SLIDES = [...SERVICES, ...SERVICES, ...SERVICES];

const CARD_GAP = 24;
const AUTO_SPEED = 65; // Pixels per second
const ARROW_DURATION = 550;

// ==========================================
// BACKGROUND DECORATIONS
// ==========================================

const CROSSES = [
  { top: "4%", left: "75%", size: 65, filled: true },
  { top: "0%", left: "87%", size: 100, filled: true },
  { top: "8%", left: "91%", size: 45, filled: false },
  { top: "20%", left: "79%", size: 110, filled: false },
  { top: "19%", left: "89%", size: 90, filled: true },
  { top: "22%", left: "97%", size: 48, filled: true },
  { top: "39%", left: "95%", size: 130, filled: true },
  { top: "54%", left: "89%", size: 52, filled: true },
  { top: "59%", left: "-1%", size: 60, filled: true },
  { top: "72%", left: "2%", size: 110, filled: false },
  { top: "85%", left: "6%", size: 135, filled: true },
  { top: "94%", left: "17%", size: 85, filled: true },
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
// SERVICE CARD
// ==========================================

function ServiceCard({ service, cardWidth }) {
  const Icon = service.icon;

  return (
    <article
      style={{
        width: cardWidth || 350,
        flex: `0 0 ${cardWidth || 350}px`,
      }}
      className="group flex min-h-[430px] min-w-0 flex-col rounded-[20px] bg-white p-6 transition-[background-color,box-shadow] duration-500 hover:bg-[#101E50] hover:shadow-[0_18px_45px_rgba(12,30,80,0.15)] sm:p-7 xl:p-8"
    >
      {/* ICON AND NUMBER */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-[9px] bg-[#159BB1] text-white transition-all duration-500 group-hover:bg-[linear-gradient(120deg,#6357ED_0%,#3385D9_48%,#139DB3_100%)] sm:h-[96px] sm:w-[96px]">
          <Icon
            size={46}
            strokeWidth={1.8}
            aria-hidden="true"
            className="transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        <span className="text-[38px] leading-none font-bold text-[#D0EBF0] transition-colors duration-500 group-hover:text-[#174477] sm:text-[42px]">
          {service.number}
        </span>
      </div>

      {/* HOVER UNDERLINE TITLE */}
      <h3 className="mt-8 min-h-[70px] text-[21px] leading-[1.35] font-semibold text-[#101D4E] decoration-2 underline-offset-[6px] transition-colors duration-500 group-hover:text-white group-hover:underline group-hover:decoration-white sm:text-[23px] xl:text-[25px]">
        {service.title}
      </h3>

      {/* DESCRIPTION */}
      <p className="mt-3 flex-1 text-[15px] leading-[1.75] text-[#78818A] transition-colors duration-500 group-hover:text-[#E1E9F4] sm:text-[16px]">
        {service.description}
      </p>

      {/* READ MORE */}
      <div className="mt-5 border-t border-[#E8EDF0] pt-6 transition-colors duration-500 group-hover:border-white/20">
        <Link
          href={service.href}
          className="inline-flex min-h-[40px] min-w-[137px] items-center justify-center rounded-full bg-[#159BB1] px-6 text-sm font-semibold text-white transition-[transform,box-shadow] duration-300 group-hover:bg-[linear-gradient(100deg,#6255EC_0%,#327BD9_50%,#139DB3_100%)] hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#159BB1]"
        >
          Read More
        </Link>
      </div>
    </article>
  );
}

// ==========================================
// MAIN SERVICES COMPONENT
// ==========================================

export default function KlinikoServices() {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);

  const cycleRef = useRef(0);
  const stepRef = useRef(0);

  const pausedRef = useRef(false);
  const focusedRef = useRef(false);
  const touchingRef = useRef(false);
  const manualRef = useRef(false);
  const visibleRef = useRef(true);
  const reducedMotionRef = useRef(false);

  const manualFrameRef = useRef(null);
  const touchTimerRef = useRef(null);

  const [cardWidth, setCardWidth] = useState(0);

  // ==========================================
  // KEEP THE INFINITE CAROUSEL CENTERED
  // ==========================================

  const normalizeScroll = (viewport) => {
    const cycle = cycleRef.current;

    if (!viewport || cycle <= 0) return;

    let left = viewport.scrollLeft;

    while (left >= cycle * 2) {
      left -= cycle;
    }

    while (left < cycle) {
      left += cycle;
    }

    if (Math.abs(left - viewport.scrollLeft) > 0.01) {
      viewport.scrollLeft = left;
    }
  };

  // ==========================================
  // RESPONSIVE CARD MEASUREMENT
  // ==========================================

  useLayoutEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) return;

    const measure = () => {
      const width = viewport.getBoundingClientRect().width;

      if (width <= 0) return;

      const columns =
        window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;

      const nextWidth = (width - CARD_GAP * (columns - 1)) / columns;

      setCardWidth((previous) =>
        Math.abs(previous - nextWidth) > 0.1 ? nextWidth : previous,
      );
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);

    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // ==========================================
  // INITIALIZE AND UPDATE LOOP MEASUREMENTS
  // ==========================================

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!viewport || !track || cardWidth <= 0) return;

    const slides = track.children;

    if (slides.length <= SERVICE_COUNT) return;

    const oldCycle = cycleRef.current;
    const oldStep = stepRef.current;

    const progress =
      oldStep > 0 ? (viewport.scrollLeft - oldCycle) / oldStep : 0;

    const newCycle = slides[SERVICE_COUNT].offsetLeft - slides[0].offsetLeft;

    if (newCycle <= 0) return;

    cycleRef.current = newCycle;
    stepRef.current = cardWidth + CARD_GAP;

    viewport.scrollLeft = newCycle + progress * stepRef.current;

    normalizeScroll(viewport);
  }, [cardWidth]);

  // ==========================================
  // REDUCED MOTION SUPPORT
  // ==========================================

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      reducedMotionRef.current = media.matches;
    };

    update();

    media.addEventListener("change", update);

    return () => {
      media.removeEventListener("change", update);
    };
  }, []);

  // ==========================================
  // PAUSE WHEN OUT OF VIEW
  // ==========================================

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

  // ==========================================
  // CONTINUOUS AUTO SCROLL RIGHT TO LEFT
  // ==========================================

  useEffect(() => {
    let frame = null;
    let previousTime = null;

    const animate = (time) => {
      if (previousTime === null) {
        previousTime = time;
      }

      const delta = Math.min(time - previousTime, 50);
      previousTime = time;

      const viewport = viewportRef.current;

      const canAutoScroll =
        viewport &&
        cycleRef.current > 0 &&
        !document.hidden &&
        !pausedRef.current &&
        !focusedRef.current &&
        !touchingRef.current &&
        !manualRef.current &&
        visibleRef.current &&
        !reducedMotionRef.current;

      if (canAutoScroll) {
        // Positive scrollLeft moves content
        // visually from right to left.
        viewport.scrollLeft += (delta * AUTO_SPEED) / 1000;

        normalizeScroll(viewport);
      }

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => {
      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  // ==========================================
  // WORKING LEFT / RIGHT BUTTONS
  // ==========================================

  const moveSlide = (direction) => {
    const viewport = viewportRef.current;
    const step = stepRef.current;

    if (!viewport || step <= 0) return;

    // Cancel the previous manual animation
    // if another arrow is clicked.
    if (manualFrameRef.current !== null) {
      cancelAnimationFrame(manualFrameRef.current);
      manualFrameRef.current = null;
    }

    manualRef.current = true;

    const startLeft = viewport.scrollLeft;
    const distance = step * direction;

    // Accessible instant navigation
    if (reducedMotionRef.current) {
      viewport.scrollLeft = startLeft + distance;
      normalizeScroll(viewport);
      manualRef.current = false;
      return;
    }

    let startTime = null;

    const animateMove = (time) => {
      if (startTime === null) {
        startTime = time;
      }

      const progress = Math.min((time - startTime) / ARROW_DURATION, 1);

      // Smooth ease-out cubic animation
      const eased = 1 - Math.pow(1 - progress, 3);

      viewport.scrollLeft = startLeft + distance * eased;

      if (progress < 1) {
        manualFrameRef.current = requestAnimationFrame(animateMove);
      } else {
        normalizeScroll(viewport);

        manualRef.current = false;
        manualFrameRef.current = null;
      }
    };

    manualFrameRef.current = requestAnimationFrame(animateMove);
  };

  // ==========================================
  // MOBILE TOUCH HANDLING
  // ==========================================

  const handleTouchStart = () => {
    if (touchTimerRef.current !== null) {
      clearTimeout(touchTimerRef.current);
    }

    touchingRef.current = true;
  };

  const handleTouchEnd = () => {
    touchTimerRef.current = setTimeout(() => {
      normalizeScroll(viewportRef.current);
      touchingRef.current = false;
      touchTimerRef.current = null;
    }, 1200);
  };

  // ==========================================
  // CLEANUP
  // ==========================================

  useEffect(() => {
    return () => {
      if (manualFrameRef.current !== null) {
        cancelAnimationFrame(manualFrameRef.current);
      }

      if (touchTimerRef.current !== null) {
        clearTimeout(touchTimerRef.current);
      }
    };
  }, []);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <section
      aria-labelledby="kliniko-services-title"
      className="relative isolate overflow-hidden bg-[#F1F8F5] py-20 sm:py-24 lg:py-[100px]"
    >
      {/* BACKGROUND MEDICAL CROSSES */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {CROSSES.map((cross, index) => (
          <div
            key={index}
            className="absolute opacity-80"
            style={{
              top: cross.top,
              left: cross.left,
            }}
          >
            <MedicalCross size={cross.size} filled={cross.filled} />
          </div>
        ))}
      </div>

      {/* SAME CONTAINER AS HERO */}
      <div className="mx-auto w-full max-w-[1540px] px-6 sm:px-10 lg:px-12 2xl:px-6">
        {/* HEADER */}
        <div className="mx-auto max-w-[850px] text-center">
          <div className="flex items-center justify-center gap-2">
            <SectionIcon />

            <span className="text-[18px] font-semibold text-[#101D4E]">
              Service
            </span>

            <SectionIcon />
          </div>

          <h2
            id="kliniko-services-title"
            className="mx-auto mt-5 max-w-[750px] text-[clamp(2rem,3.3vw,3.25rem)] leading-[1.2] font-bold tracking-[-0.025em] text-[#101D4E]"
          >
            Delivering Trusted Medical
            <span className="block">Care With Precision</span>
          </h2>
        </div>

        {/* CAROUSEL VIEWPORT */}
        <div
          ref={viewportRef}
          dir="ltr"
          role="region"
          aria-roledescription="carousel"
          aria-label="Medical services"
          className="mt-12 min-w-0 [scrollbar-width:none] overflow-x-auto overflow-y-hidden rounded-[20px] lg:mt-14 [&::-webkit-scrollbar]:hidden"
          style={{
            scrollBehavior: "auto",
            scrollSnapType: "none",
            overscrollBehaviorX: "contain",
          }}
          onMouseEnter={() => {
            pausedRef.current = true;
          }}
          onMouseLeave={() => {
            pausedRef.current = false;
          }}
          onFocusCapture={() => {
            focusedRef.current = true;
          }}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              focusedRef.current = false;
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          {/* INFINITE SCROLL TRACK */}
          <div
            ref={trackRef}
            className="relative flex w-max items-stretch gap-6"
            style={{
              opacity: cardWidth > 0 ? 1 : 0,
            }}
          >
            {ALL_SLIDES.map((service, index) => (
              <ServiceCard
                key={`${service.id}-${index}`}
                service={service}
                cardWidth={cardWidth}
              />
            ))}
          </div>
        </div>

        {/* NAVIGATION ARROWS */}
        <div className="mt-10 flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-full border border-[#B5E3E7] bg-white/75 p-1.5">
            <button
              type="button"
              onClick={() => moveSlide(-1)}
              aria-label="Previous service"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#E9F4F3] text-[#101D4E] transition-colors duration-300 hover:bg-[#159BB1] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#159BB1]"
            >
              <ChevronLeft size={23} strokeWidth={2} />
            </button>

            <button
              type="button"
              onClick={() => moveSlide(1)}
              aria-label="Next service"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#E9F4F3] text-[#101D4E] transition-colors duration-300 hover:bg-[#159BB1] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#159BB1]"
            >
              <ChevronRight size={23} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
