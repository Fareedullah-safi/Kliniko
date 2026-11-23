"use client";

import { Play, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const DOCTOR_IMAGE =
  "https://html.vecurosoft.com/kliniko/demo/assets/img/hero/banner-img-h1.png";

const VIDEO_ID = "o8OgzQdA70c";

const HERO = {
  eyebrow: "Your Health, Our Priority",
  title: "Trusted Care For Your Better Tomorrow",
  description:
    "Kliniko Offers Expert Medical Care And Personalized Health Solutions Designed To Keep You And Your Family Well.",
  appointmentText: "Appointment",
  appointmentHref: "/appointment",
};

// Fixed sparkle locations prevent random layout changes.
const SPARKLES = [
  { x: 33, y: 9, size: 22, delay: -0.5, duration: 3.8 },
  { x: 49, y: 43, size: 76, delay: -1.4, duration: 5.5 },
  { x: 98, y: 7, size: 70, delay: -2.1, duration: 5 },
  { x: 68, y: 12, size: 12, delay: -0.9, duration: 4.1 },
  { x: 83, y: 25, size: 15, delay: -3.3, duration: 4.8 },
  { x: 40, y: 72, size: 12, delay: -1.6, duration: 5.1 },
  { x: 59, y: 82, size: 16, delay: -2.9, duration: 4.4 },
  { x: 92, y: 78, size: 11, delay: -0.7, duration: 4.7 },
  { x: 74, y: 61, size: 10, delay: -2.5, duration: 3.7 },
];

// Scoped CSS animations — no animation library needed.
const ANIMATION_CSS = `
  .kliniko-hero .kliniko-glow-one {
    animation: kliniko-drift-one 14s ease-in-out infinite alternate;
  }

  .kliniko-hero .kliniko-glow-two {
    animation: kliniko-drift-two 18s ease-in-out infinite alternate;
  }

  .kliniko-hero .kliniko-sparkle {
    opacity: .65;
    animation: kliniko-twinkle 4s ease-in-out infinite;
    filter: drop-shadow(0 0 7px rgba(255,255,255,.4));
    transform-origin: center;
  }

  .kliniko-hero .kliniko-play-pulse {
    animation: kliniko-pulse 2.7s ease-out infinite;
  }

  .kliniko-hero .kliniko-play-pulse--second {
    animation-delay: -1.35s;
  }

  .kliniko-hero .kliniko-play-core {
    background-size: 200% 200%;
    animation: kliniko-gradient 4s ease-in-out infinite;
    box-shadow: 0 5px 24px rgba(20,158,181,.3);
  }

  @keyframes kliniko-drift-one {
    from {
      transform: translate3d(0,0,0) scale(1);
    }
    to {
      transform: translate3d(32px,-24px,0) scale(1.12);
    }
  }

  @keyframes kliniko-drift-two {
    from {
      transform: translate3d(0,0,0) scale(1);
    }
    to {
      transform: translate3d(-30px,25px,0) scale(1.08);
    }
  }

  @keyframes kliniko-twinkle {
    0%, 100% {
      opacity: .25;
      transform: translate3d(0,0,0) scale(.65) rotate(-10deg);
    }
    50% {
      opacity: .85;
      transform: translate3d(0,-8px,0) scale(1.12) rotate(12deg);
    }
  }

  @keyframes kliniko-pulse {
    0% {
      opacity: .7;
      transform: scale(.85);
    }
    75%, 100% {
      opacity: 0;
      transform: scale(1.48);
    }
  }

  @keyframes kliniko-gradient {
    0%, 100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .kliniko-hero .kliniko-glow-one,
    .kliniko-hero .kliniko-glow-two,
    .kliniko-hero .kliniko-sparkle,
    .kliniko-hero .kliniko-play-pulse,
    .kliniko-hero .kliniko-play-core {
      animation: none !important;
    }

    .kliniko-hero .kliniko-play-pulse {
      opacity: 0;
    }
  }
`;

// ANIMATED STAR
function Sparkle({ x, y, size, delay, duration }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className="kliniko-sparkle pointer-events-none absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      <path
        d="M50 0L54 44L100 50L54 54L50 100L46 54L0 50L46 46Z"
        fill="white"
        opacity=".78"
      />
      <path
        d="M21 21L44 44M79 21L56 44M21 79L44 56M79 79L56 56"
        fill="none"
        stroke="white"
        strokeOpacity=".35"
        strokeWidth="1.4"
      />
    </svg>
  );
}

// RESPONSIVE YOUTUBE VIDEO MODAL
function VideoModal({ onClose }) {
  const closeButtonRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    const priorFocus = document.activeElement;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = modalRef.current?.querySelectorAll("button, iframe");

      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      priorFocus?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-[#030914]/85 p-4 backdrop-blur-sm sm:p-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Kliniko introduction video"
        ref={modalRef}
        className="relative w-full max-w-[1000px]"
        style={{
          maxWidth: "min(1000px, calc((100dvh - 96px) * 16 / 9))",
        }}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className="absolute -top-11 right-0 z-10 flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <X size={26} strokeWidth={2.5} />
        </button>

        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black shadow-2xl">
          <iframe
            title='"Hello, doctor" - 2017 Advertising campaign'
            src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}

// MAIN HERO
export default function KlinikoHero() {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <>
      <style>{ANIMATION_CSS}</style>

      <section
        aria-labelledby="kliniko-hero-heading"
        className="kliniko-hero relative isolate overflow-hidden bg-[linear-gradient(110deg,#122a3c_0%,#42546c_58%,#2b6485_100%)] text-white"
      >
        {/* ANIMATED BACKGROUND */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
          <div className="kliniko-glow-one absolute top-[28%] -left-24 h-[430px] w-[430px] rounded-full bg-[#34758d]/30 blur-[95px]" />

          <div className="kliniko-glow-two absolute top-[8%] left-[36%] h-[400px] w-[380px] rounded-full bg-[#a1a4b8]/25 blur-[95px]" />

          <div className="kliniko-glow-one absolute top-0 -right-[8%] h-[400px] w-[400px] rounded-full bg-[#167eb0]/30 blur-[100px]" />

          {/* TWINKLING STARS */}
          {SPARKLES.map((star, index) => (
            <Sparkle key={index} {...star} />
          ))}
        </div>

        {/* HERO CONTENT */}
        <div className="relative mx-auto grid w-full max-w-[1540px] grid-cols-1 items-center gap-x-4 px-6 pt-16 sm:px-10 lg:min-h-[635px] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:px-12 lg:pt-0 xl:min-h-[690px] 2xl:min-h-[750px] 2xl:px-6">
          {/* LEFT CONTENT */}
          <div className="relative z-10 pb-8 lg:py-16">
            <p className="mb-5 text-base font-semibold sm:text-lg xl:text-xl">
              {HERO.eyebrow}
            </p>

            <h1
              id="kliniko-hero-heading"
              className="max-w-[790px] text-[clamp(2.5rem,4vw,4.5rem)] leading-[1.13] font-bold tracking-[-0.025em]"
            >
              {HERO.title}
            </h1>

            <p className="mt-6 max-w-[660px] text-base leading-relaxed font-medium sm:text-lg xl:text-xl">
              {HERO.description}
            </p>

            {/* BUTTONS */}
            <div className="mt-8 flex items-center gap-4 sm:mt-10">
              <Link
                href={HERO.appointmentHref}
                className="inline-flex h-14 items-center justify-center rounded-full bg-[#139db2] px-7 text-base font-semibold text-white transition-colors hover:bg-[#0e8ba2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-9"
              >
                {HERO.appointmentText}
              </Link>

              {/* ANIMATED PLAY BUTTON */}
              <button
                type="button"
                onClick={() => setVideoOpen(true)}
                aria-label="Play introduction video"
                aria-haspopup="dialog"
                className="group relative isolate flex h-[80px] w-[80px] shrink-0 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:h-[90px] sm:w-[90px]"
              >
                {/* FIRST PULSE */}
                <span
                  aria-hidden="true"
                  className="kliniko-play-pulse pointer-events-none absolute inset-2 rounded-full border-2 border-[#66d9ed]"
                />

                {/* SECOND PULSE */}
                <span
                  aria-hidden="true"
                  className="kliniko-play-pulse kliniko-play-pulse--second pointer-events-none absolute inset-2 rounded-full border-2 border-[#66d9ed]"
                />

                {/* GRADIENT PLAY CIRCLE */}
                <span className="kliniko-play-core relative z-10 flex h-[57px] w-[57px] items-center justify-center rounded-full bg-gradient-to-r from-[#6655ec] via-[#317bde] to-[#12a6b5] transition-transform duration-300 group-hover:scale-110 sm:h-[65px] sm:w-[65px]">
                  <Play className="ml-1 h-5 w-5 fill-white text-white" />
                </span>
              </button>
            </div>
          </div>

          {/* LARGE DOCTOR IMAGE */}
          <div className="relative z-[1] flex h-full items-end justify-center lg:justify-end">
            <Image
              src={DOCTOR_IMAGE}
              alt="Medical professional in a white coat with a stethoscope"
              width={1000}
              height={1100}
              priority
              unoptimized
              sizes="(max-width: 639px) 400px, (max-width: 1023px) 500px, (max-width: 1279px) 650px, (max-width: 1535px) 750px, 800px"
              className="h-auto w-[min(95vw,400px)] max-w-none object-contain object-bottom sm:w-[500px] lg:w-[650px] xl:w-[750px] 2xl:w-[800px]"
            />
          </div>
        </div>
      </section>

      {/* VIDEO POPUP */}
      {videoOpen && <VideoModal onClose={() => setVideoOpen(false)} />}
    </>
  );
}
