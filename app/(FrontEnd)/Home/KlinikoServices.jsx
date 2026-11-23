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
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const SLIDE_INTERVAL = 3000; // One slide every 3 seconds
const SLIDE_DURATION = 0.75; // 750 ms animated transition
const CARD_GAP = 24;

const SERVICES = [
  {
    id: 1,
    number: "01",
    title: "Advanced Medical Consultation",
    description:
      "Professional medical consultations and personalized healthcare guidance for patients.",
    icon: FlaskConical,
    href: "/services/consultation",
  },
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
      "Accurate blood tests, imaging, ECG, and other diagnostics for timely medical decisions.",
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
];

const COUNT = SERVICES.length;
const ALL_SLIDES = [...SERVICES, ...SERVICES, ...SERVICES];

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
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
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
    <svg width="23" height="23" viewBox="0 0 32 32" fill="none" aria-hidden="true" className="text-[#139DB3]">
      <rect x="12" y="1" width="8" height="30" rx="4" transform="rotate(45 16 16)" stroke="currentColor" strokeWidth="2.5" />
      <rect x="12" y="1" width="8" height="30" rx="4" transform="rotate(-45 16 16)" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="16" cy="16" r="2" fill="currentColor" />
    </svg>
  );
}

const CARD_VARIANTS = {
  idle: { backgroundColor: "#FFFFFF", boxShadow: "0 0 0 rgba(12,30,80,0)" },
  hover: { backgroundColor: "#101E50", boxShadow: "0 18px 45px rgba(12,30,80,.15)" },
};

function ServiceCard({ service, cardWidth }) {
  const Icon = service.icon;
  const [focused, setFocused] = useState(false);

  return (
    <motion.article
      initial="idle"
      animate={focused ? "hover" : "idle"}
      whileHover="hover"
      variants={CARD_VARIANTS}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocused(false);
        }
      }}
      style={{ flex: `0 0 ${cardWidth}px`, width: cardWidth }}
      className="group flex min-h-[430px] min-w-0 flex-col rounded-[20px] p-6 sm:p-7 xl:p-8"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="relative flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-[9px] bg-[#159BB1] text-white sm:h-[96px] sm:w-[96px]">
          <motion.div
            aria-hidden="true"
            variants={{ idle: { opacity: 0 }, hover: { opacity: 1 } }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-gradient-to-r from-[#6357ED] via-[#3385D9] to-[#139DB3]"
          />
          <motion.div
            variants={{ idle: { scale: 1, rotate: 0 }, hover: { scale: 1.1, rotate: 5 } }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="relative z-10"
          >
            <Icon size={46} strokeWidth={1.8} aria-hidden="true" />
          </motion.div>
        </div>
        <motion.span
          variants={{ idle: { color: "#D0EBF0" }, hover: { color: "#174477" } }}
          className="text-[38px] font-bold leading-none sm:text-[42px]"
        >
          {service.number}
        </motion.span>
      </div>

      {/* The underline is painted independently under EACH wrapped text line. */}
      <div className="mt-8 min-h-[80px]">
        <motion.h3
          variants={{ idle: { color: "#101D4E" }, hover: { color: "#FFFFFF" } }}
          transition={{ duration: 0.35 }}
          className="text-[21px] font-semibold leading-[1.45] sm:text-[23px] xl:text-[25px]"
        >
          <motion.span
            variants={{
              idle: { backgroundSize: "0% 2px" },
              hover: { backgroundSize: "100% 2px" },
            }}
            transition={{ duration: 0.38, ease: "easeOut" }}
            style={{
              backgroundImage: "linear-gradient(#FFFFFF, #FFFFFF)",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "left bottom",
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone",
              paddingBottom: "4px",
            }}
          >
            {service.title}
          </motion.span>
        </motion.h3>
      </div>

      <motion.p
        variants={{ idle: { color: "#78818A" }, hover: { color: "#E1E9F4" } }}
        transition={{ duration: 0.4 }}
        className="mt-3 flex-1 text-[15px] leading-[1.75] sm:text-[16px]"
      >
        {service.description}
      </motion.p>

      <motion.div
        variants={{ idle: { borderColor: "#E8EDF0" }, hover: { borderColor: "rgba(255,255,255,.2)" } }}
        className="mt-5 border-t pt-6"
      >
        <Link
          href={service.href}
          className="relative inline-flex min-h-[40px] min-w-[137px] items-center justify-center overflow-hidden rounded-full bg-[#159BB1] px-6 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#159BB1]"
        >
          <motion.span
            aria-hidden="true"
            variants={{ idle: { opacity: 0 }, hover: { opacity: 1 } }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 bg-gradient-to-r from-[#6255EC] via-[#327BD9] to-[#139DB3]"
          />
          <span className="relative z-10">Read More</span>
        </Link>
      </motion.div>
    </motion.article>
  );
}

export default function KlinikoServices() {
  const viewportRef = useRef(null);
  const x = useMotionValue(0);

  const indexRef = useRef(COUNT); // Start inside the middle copy.
  const stepRef = useRef(0);
  const animationRef = useRef(null);
  const movingRef = useRef(false);
  const visibleRef = useRef(false);
  const focusRef = useRef(false);
  const touchingRef = useRef(false);
  const touchStartRef = useRef(null);
  const touchTimerRef = useRef(null);

  const [cardWidth, setCardWidth] = useState(0);
  const [playing, setPlaying] = useState(true);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const measure = () => {
      const width = viewport.getBoundingClientRect().width;
      if (width <= 0) return;

      const columns = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
      const nextWidth = (width - CARD_GAP * (columns - 1)) / columns;
      const nextStep = nextWidth + CARD_GAP;
      if (Math.abs(stepRef.current - nextStep) < 0.2) return;

      // Stop an old transition before repositioning on resize.
      animationRef.current?.stop();
      animationRef.current = null;
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
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [x]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new IntersectionObserver(
      ([entry]) => { visibleRef.current = entry.isIntersecting; },
      { threshold: 0.1 },
    );
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  const move = (direction) => {
    const step = stepRef.current;
    if (step <= 0 || movingRef.current) return;

    movingRef.current = true;
    const nextIndex = indexRef.current + direction;

    // Motion animates the actual carousel track, not native scrollLeft.
    animationRef.current = animate(x, -nextIndex * step, {
      duration: SLIDE_DURATION,
      ease: [0.22, 1, 0.36, 1],
      onComplete: () => {
        indexRef.current = nextIndex;

        // Jump to the IDENTICAL middle copy after each complete loop.
        // As both copies show the same cards, the reset is invisible.
        if (indexRef.current >= COUNT * 2) indexRef.current -= COUNT;
        if (indexRef.current < COUNT) indexRef.current += COUNT;

        x.set(-indexRef.current * stepRef.current);
        movingRef.current = false;
        animationRef.current = null;
      },
    });
  };

  useEffect(() => {
    if (!playing) return;

    const interval = window.setInterval(() => {
      if (
        document.hidden ||
        !visibleRef.current ||
        focusRef.current ||
        touchingRef.current ||
        movingRef.current
      ) return;

      move(1); // Visually moves all cards LEFT, one position at a time.
    }, SLIDE_INTERVAL);

    return () => window.clearInterval(interval);
  }, [playing]);

  const handleTouchStart = (event) => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchingRef.current = true;
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
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
    touchTimerRef.current = window.setTimeout(() => {
      touchingRef.current = false;
      touchTimerRef.current = null;
    }, 600);
  };

  useEffect(() => () => {
    animationRef.current?.stop();
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
  }, []);

  return (
    <section
      aria-labelledby="kliniko-services-title"
      className="relative isolate overflow-hidden bg-[#F1F8F5] py-20 sm:py-24 lg:py-[100px]"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {CROSSES.map((cross, index) => (
          <div key={index} className="absolute opacity-80" style={{ top: cross.top, left: cross.left }}>
            <MedicalCross size={cross.size} filled={cross.filled} />
          </div>
        ))}
      </div>

      <div className="mx-auto w-full max-w-[1540px] px-6 sm:px-10 lg:px-12 2xl:px-6">
        <div className="mx-auto max-w-[850px] text-center">
          <div className="flex items-center justify-center gap-2">
            <SectionIcon />
            <span className="text-[18px] font-semibold text-[#101D4E]">Service</span>
            <SectionIcon />
          </div>
          <h2
            id="kliniko-services-title"
            className="mx-auto mt-5 max-w-[750px] text-[clamp(2rem,3.3vw,3.25rem)] font-bold leading-[1.2] tracking-[-0.025em] text-[#101D4E]"
          >
            Delivering Trusted Medical
            <span className="block">Care With Precision</span>
          </h2>
        </div>

        {/* Motion transforms the track from right to left once per 3 seconds. */}
        <div
          ref={viewportRef}
          dir="ltr"
          role="region"
          aria-roledescription="carousel"
          aria-label="Medical services"
          aria-live="off"
          className="mt-12 min-w-0 overflow-hidden rounded-[20px] lg:mt-14"
          onFocusCapture={() => { focusRef.current = true; }}
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
            style={{ x, opacity: cardWidth > 0 ? 1 : 0 }}
            className="flex w-full items-stretch gap-6 will-change-transform"
          >
            {ALL_SLIDES.map((service, index) => (
              <ServiceCard
                key={`${service.id}-${index}`}
                service={service}
                cardWidth={cardWidth || 350}
              />
            ))}
          </motion.div>
        </div>

        <div className="mt-10 flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-full border border-[#B5E3E7] bg-white/75 p-1.5">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Previous service"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#E9F4F3] text-[#101D4E] transition-colors duration-300 hover:bg-[#159BB1] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#159BB1]"
            >
              <ChevronLeft size={23} />
            </button>
            <button
              type="button"
              onClick={() => setPlaying((current) => !current)}
              aria-label={playing ? "Pause automatic sliding" : "Resume automatic sliding"}
              aria-pressed={!playing}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#159BB1] text-white transition-colors duration-300 hover:bg-[#101E50] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#159BB1]"
            >
              {playing ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Next service"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#E9F4F3] text-[#101D4E] transition-colors duration-300 hover:bg-[#159BB1] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#159BB1]"
            >
              <ChevronRight size={23} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
