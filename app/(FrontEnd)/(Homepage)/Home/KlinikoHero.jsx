"use client";

import { Play, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { createPortal, useEffect, useRef, useState } from "react";

// ==========================================
// FALLBACK DATA
// Used only when Hero is not in MongoDB.
// ==========================================

const DEFAULT_HERO = {
  badge: "Your Health, Our Priority",
  title: "Trusted Care For Your Better Tomorrow",
  description:
    "Kliniko Offers Expert Medical Care And Personalized Health Solutions Designed To Keep You And Your Family Well.",
  buttonText: "Appointment",
  buttonLink: "/appointment",
  mainImage:
    "https://html.vecurosoft.com/kliniko/demo/assets/img/hero/banner-img-h1.png",
};

const DEFAULT_VIDEO_ID = "o8OgzQdA70c";

// ==========================================
// 11D LOADER-INSPIRED HERO ANIMATION STYLES
// ==========================================

const heroAnimationStyles = `
  .kl-hero-11d {
    --kl-bg-deep: #021014;
    --kl-bg-mid: #05222b;
    --kl-bg-surface: #08323f;
    --kl-accent: #00f5d4;
    --kl-cyan: #00e5ff;
    --kl-teal: #18aabc;
    --kl-violet: #8a7aff;
    --rx: 0deg;
    --ry: 0deg;
    --px: 0px;
    --py: 0px;

    background-color: var(--kl-bg-deep);
    background-image:
      radial-gradient(circle at 72% 52%, rgb(11 66 82 / 72%) 0%, rgb(4 28 36 / 86%) 52%, #021014 100%),
      radial-gradient(ellipse at 16% 20%, rgb(0 245 212 / 16%), transparent 52%),
      radial-gradient(ellipse at 84% 80%, rgb(117 103 235 / 20%), transparent 54%),
      radial-gradient(ellipse at 78% 18%, rgb(24 170 188 / 18%), transparent 46%),
      radial-gradient(ellipse at 20% 82%, rgb(0 229 255 / 12%), transparent 46%),
      linear-gradient(125deg, #020e12 0%, #062631 52%, #03131a 100%);
  }

  /* 2D Bioluminescent Teal Perspective Grid Matrix */
  .kl-hero-grid {
    position: absolute;
    inset: -60px;
    pointer-events: none;
    opacity: 0.42;
    background-image:
      radial-gradient(circle, rgb(0 245 212 / 55%) 1.25px, transparent 1.25px),
      linear-gradient(to right, rgb(24 170 188 / 12%) 1px, transparent 1px),
      linear-gradient(to bottom, rgb(24 170 188 / 12%) 1px, transparent 1px);
    background-size: 28px 28px, 56px 56px, 56px 56px;
    mask-image: radial-gradient(ellipse 80% 75% at 55% 50%, black 25%, transparent 80%);
    -webkit-mask-image: radial-gradient(ellipse 80% 75% at 55% 50%, black 25%, transparent 80%);
    animation: klHeroGridDrift 20s linear infinite;
  }

  /* 11D Volumetric Dark Teal & Quantum Violet Aurora Membrane */
  .kl-hero-aurora {
    position: absolute;
    top: 50%;
    left: 58%;
    width: 820px;
    height: 820px;
    margin-top: -410px;
    margin-left: -410px;
    border-radius: 50%;
    pointer-events: none;
    background: conic-gradient(
      from 0deg,
      rgb(0 245 212 / 18%),
      rgb(24 170 188 / 22%),
      rgb(117 103 235 / 22%),
      rgb(0 229 255 / 18%),
      rgb(0 245 212 / 18%)
    );
    filter: blur(95px);
    animation: klHeroAuroraSpin 16s linear infinite;
  }

  /* Secondary Ambient Bio-Glow Orbs */
  .kl-hero-orb-teal {
    animation: klHeroOrbFloat 9s ease-in-out infinite alternate;
  }

  .kl-hero-orb-violet {
    animation: klHeroOrbFloat 12s ease-in-out infinite alternate-reverse;
  }

  /* 9D Spatial Parallax Wrapper for Doctor Portal */
  .kl-hero-portal-stage {
    perspective: 1100px;
  }

  .kl-hero-portal-parallax {
    transform-style: preserve-3d;
    transform: translate3d(var(--px), var(--py), 0) rotateX(var(--rx)) rotateY(var(--ry));
    transition: transform 0.18s ease-out;
  }

  /* 8D Obsidian Dark-Teal Glassmorphic Halo Behind Doctor */
  .kl-hero-halo {
    position: absolute;
    width: clamp(260px, 34vw, 470px);
    height: clamp(260px, 34vw, 470px);
    border-radius: 50%;
    background: radial-gradient(
      circle at 32% 28%,
      rgb(16 86 104 / 45%) 0%,
      rgb(6 40 50 / 60%) 52%,
      rgb(3 20 26 / 75%) 100%
    );
    border: 1.5px solid rgb(0 245 212 / 28%);
    box-shadow:
      0 28px 65px rgb(0 0 0 / 65%),
      0 0 48px rgb(0 245 212 / 16%),
      inset 0 2px 24px rgb(0 229 255 / 20%),
      inset 0 -12px 28px rgb(2 12 16 / 85%);
    animation: klHeroHaloPulse 4s ease-in-out infinite;
  }

  .kl-hero-halo::before {
    content: "";
    position: absolute;
    inset: 14px;
    border-radius: 50%;
    border: 1.5px dashed rgb(0 245 212 / 35%);
    animation: klHeroSpinReverse 28s linear infinite;
  }

  /* 6D Interlocking 3D Gyroscopic Rings Behind Doctor */
  .kl-hero-gyro {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    transform-style: preserve-3d;
  }

  .kl-hero-gyro--1 {
    width: clamp(290px, 38vw, 520px);
    height: clamp(290px, 38vw, 520px);
    border: 2px solid rgb(0 245 212 / 16%);
    border-top-color: #00f5d4;
    border-bottom-color: #00e5ff;
    box-shadow: 0 0 22px rgb(0 245 212 / 30%);
    animation: klHeroGyroOrbit1 7s linear infinite;
  }

  .kl-hero-gyro--2 {
    width: clamp(250px, 33vw, 450px);
    height: clamp(250px, 33vw, 450px);
    border: 2px solid rgb(138 122 255 / 16%);
    border-left-color: #a799ff;
    border-right-color: #7567eb;
    box-shadow: 0 0 22px rgb(117 103 235 / 30%);
    animation: klHeroGyroOrbit2 9s linear infinite;
  }

  .kl-hero-gyro--3 {
    width: clamp(220px, 28vw, 390px);
    height: clamp(220px, 28vw, 390px);
    border: 1.5px dotted rgb(162 255 245 / 40%);
    border-top: 2px solid #e0ffff;
    animation: klHeroGyroOrbit3 11s linear infinite;
  }

  /* 2D Live Animated Medical ECG Pulse SVG */
  .kl-hero-ecg-track {
    fill: none;
    stroke: rgb(0 245 212 / 14%);
    stroke-width: 1.75;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .kl-hero-ecg-pulse {
    fill: none;
    stroke: url(#klHeroEcgGradient);
    stroke-width: 2.25;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 420;
    stroke-dashoffset: 420;
    filter: drop-shadow(0 0 8px rgb(0 245 212 / 70%));
    animation: klHeroEcgSweep 3.6s linear infinite;
  }

  /* 4D Sonic Shockwave Ripple on Video Play Button */
  .kl-hero-play-shockwave {
    position: absolute;
    inset: 0;
    border-radius: 9999px;
    border: 2px solid rgb(0 245 212 / 65%);
    box-shadow: 0 0 18px rgb(0 245 212 / 45%);
    pointer-events: none;
    animation: klHeroShockwave 2.8s ease-out infinite;
  }

  /* Star Twinkle */
  .kl-hero-star-float {
    animation: klHeroStarTwinkle 4.5s ease-in-out infinite alternate;
  }

  @keyframes klHeroGridDrift {
    0% { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(28px, 28px, 0); }
  }

  @keyframes klHeroAuroraSpin {
    0% { transform: rotate(0deg) scale(1); }
    50% { transform: rotate(180deg) scale(1.12); }
    100% { transform: rotate(360deg) scale(1); }
  }

  @keyframes klHeroOrbFloat {
    0% { transform: translate3d(0, 0, 0) scale(1); }
    100% { transform: translate3d(24px, -20px, 0) scale(1.08); }
  }

  @keyframes klHeroHaloPulse {
    0%, 100% { transform: scale(0.98); }
    50% { transform: scale(1.03); }
  }

  @keyframes klHeroSpinReverse {
    0% { transform: rotate(360deg); }
    100% { transform: rotate(0deg); }
  }

  @keyframes klHeroGyroOrbit1 {
    0% { transform: rotateX(66deg) rotateY(22deg) rotateZ(0deg); }
    100% { transform: rotateX(66deg) rotateY(22deg) rotateZ(360deg); }
  }

  @keyframes klHeroGyroOrbit2 {
    0% { transform: rotateX(-62deg) rotateY(28deg) rotateZ(360deg); }
    100% { transform: rotateX(-62deg) rotateY(28deg) rotateZ(0deg); }
  }

  @keyframes klHeroGyroOrbit3 {
    0% { transform: rotateX(18deg) rotateY(-68deg) rotateZ(0deg); }
    100% { transform: rotateX(18deg) rotateY(-68deg) rotateZ(360deg); }
  }

  @keyframes klHeroEcgSweep {
    0% { stroke-dashoffset: 420; }
    100% { stroke-dashoffset: -420; }
  }

  @keyframes klHeroShockwave {
    0% {
      opacity: 0.9;
      transform: scale(0.85);
    }
    80%, 100% {
      opacity: 0;
      transform: scale(1.45);
    }
  }

  @keyframes klHeroStarTwinkle {
    0% {
      opacity: 0.45;
      transform: scale(0.9) rotate(0deg);
    }
    100% {
      opacity: 1;
      transform: scale(1.12) rotate(12deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .kl-hero-grid,
    .kl-hero-aurora,
    .kl-hero-orb-teal,
    .kl-hero-orb-violet,
    .kl-hero-halo,
    .kl-hero-halo::before,
    .kl-hero-gyro--1,
    .kl-hero-gyro--2,
    .kl-hero-gyro--3,
    .kl-hero-ecg-pulse,
    .kl-hero-play-shockwave,
    .kl-hero-star-float {
      animation: none !important;
    }
  }
`;

// ==========================================
// SAFE BUTTON DESTINATION
// ==========================================

function getSafeLink(value) {
  if (typeof value !== "string" || !value.trim()) {
    return "/appointment";
  }

  const link = value.trim();

  if (link.startsWith("/") && !link.startsWith("//") && !/[\\\s]/.test(link)) {
    return link;
  }

  try {
    const url = new URL(link);

    if (
      ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    ) {
      return link;
    }
  } catch {
    // Invalid link.
  }

  return "/appointment";
}

// ==========================================
// GET YOUTUBE VIDEO ID
// ==========================================

function getYouTubeId(value) {
  if (!value) {
    return DEFAULT_VIDEO_ID;
  }

  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();

    let id = "";

    if (host === "youtu.be" || host === "www.youtu.be") {
      id = url.pathname.split("/")[1];
    } else if (
      [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtube-nocookie.com",
        "www.youtube-nocookie.com",
      ].includes(host)
    ) {
      if (url.pathname === "/watch") {
        id = url.searchParams.get("v");
      } else if (
        url.pathname.startsWith("/embed/") ||
        url.pathname.startsWith("/shorts/")
      ) {
        id = url.pathname.split("/")[2];
      }
    }

    if (typeof id === "string" && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
      return id;
    }
  } catch {
    // Invalid YouTube URL.
  }

  return DEFAULT_VIDEO_ID;
}

// ==========================================
// BACKGROUND STAR
// ==========================================

function Star({ className = "" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M50 0L53 44L100 50L53 53L50 100L47 53L0 50L47 47L50 0Z"
        fill="#00f5d4"
        fillOpacity=".42"
      />

      <path
        d="M18 18L43 43M82 18L57 43M18 82L43 57M82 82L57 57"
        stroke="#e0ffff"
        strokeOpacity=".3"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// ==========================================
// VIDEO MODAL
// ==========================================

function VideoModal({ onClose, videoId }) {
  const closeButtonRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "Tab") {
        const focusable = modalRef.current?.querySelectorAll(
          "button:not([disabled]), iframe",
        );

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
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-[#021014]/88 p-4 backdrop-blur-md sm:p-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
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
          className="absolute -top-11 right-0 z-10 flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <X size={26} strokeWidth={2.5} />
        </button>

        <div className="aspect-video w-full overflow-hidden rounded-lg border border-[#00f5d4]/30 bg-black shadow-[0_0_50px_rgba(0,245,212,0.2)]">
          <iframe
            title="Kliniko introduction video"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
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

// ==========================================
// MAIN KLINIKO HERO (WITH 11D LOADER BG)
// ==========================================

export default function KlinikoHero({ data = null }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);

  // 5D Real-Time Quantum Molecular Field Canvas & 9D Spatial Mouse Parallax
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = section.offsetWidth || window.innerWidth);
    let height = (canvas.height = section.offsetHeight || 700);

    const handleResize = () => {
      if (!section) return;
      width = canvas.width = section.offsetWidth || window.innerWidth;
      height = canvas.height = section.offsetHeight || 700;
    };

    window.addEventListener("resize", handleResize);

    // Create 5D Bioluminescent Dark-Teal & Quantum Violet Molecular Nodes
    const nodeCount = 46;
    const nodes = Array.from({ length: nodeCount }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2.2 + 1,
      color:
        i % 3 === 0
          ? "rgba(0, 245, 212, 0.65)"
          : i % 3 === 1
            ? "rgba(0, 229, 255, 0.55)"
            : "rgba(138, 122, 255, 0.55)",
    }));

    const renderCanvas = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;

        if (a.x < 0 || a.x > width) a.vx *= -1;
        if (a.y < 0 || a.y > height) a.vy *= -1;

        // Draw glowing molecular node
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
        ctx.fillStyle = a.color;
        ctx.fill();

        // Draw bioluminescent teal entanglement bonds between nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 135) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0, 245, 212, ${(1 - dist / 135) * 0.2})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(renderCanvas);
    };

    renderCanvas();

    // 9D Interactive Spatial Tilt on Mouse Move
    const handleMouseMove = (e) => {
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      const rx = dy * -8;
      const ry = dx * 8;
      const px = dx * -12;
      const py = dy * -12;

      section.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      section.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
      section.style.setProperty("--px", `${px.toFixed(1)}px`);
      section.style.setProperty("--py", `${py.toFixed(1)}px`);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Only use static defaults when no MongoDB Hero document exists.
  const hasData = data !== null;

  const badge = hasData ? data?.badge?.en || "" : DEFAULT_HERO.badge;
  const title = hasData ? data?.title?.en || "" : DEFAULT_HERO.title;
  const description = hasData
    ? data?.description?.en || ""
    : DEFAULT_HERO.description;
  const buttonText = hasData
    ? data?.buttonText?.en || ""
    : DEFAULT_HERO.buttonText;
  const buttonLink = getSafeLink(
    hasData ? data?.buttonLink : DEFAULT_HERO.buttonLink,
  );
  const doctorImage = data?.mainImage || DEFAULT_HERO.mainImage;
  const videoId = getYouTubeId(data?.videoLink);

  return (
    <>
      <section
        ref={sectionRef}
        aria-labelledby="kliniko-hero-heading"
        className="kl-hero-11d relative isolate overflow-hidden text-white"
      >
        <style>{heroAnimationStyles}</style>

        {/* 1. 2D BIOLUMINESCENT TEAL PERSPECTIVE GRID MATRIX */}
        <div className="kl-hero-grid -z-20" aria-hidden="true" />

        {/* 2. 11D VOLUMETRIC AURORA MEMBRANE & AMBIENT GLOW ORBS */}
        <div className="kl-hero-aurora -z-20" aria-hidden="true" />

        <div
          aria-hidden="true"
          className="kl-hero-orb-teal pointer-events-none absolute top-[25%] -left-24 -z-10 h-[430px] w-[430px] rounded-full bg-[#00f5d4]/12 blur-[110px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-[10%] left-[37%] -z-10 h-[400px] w-[330px] rounded-full bg-[#18aabc]/20 blur-[100px]"
        />

        <div
          aria-hidden="true"
          className="kl-hero-orb-violet pointer-events-none absolute top-[0%] right-[-8%] -z-10 h-[440px] w-[440px] rounded-full bg-[#7567eb]/25 blur-[115px]"
        />

        {/* 3. 5D REAL-TIME QUANTUM MOLECULAR ENTANGLEMENT CANVAS */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
        />

        {/* 4. 2D AMBIENT BIOMETRIC ECG PULSE WAVE ACROSS BACKDROP */}
        <svg
          aria-hidden="true"
          viewBox="0 0 600 60"
          className="pointer-events-none absolute bottom-6 left-4 -z-10 h-14 w-[340px] opacity-65 sm:w-[480px] lg:left-10"
        >
          <defs>
            <linearGradient
              id="klHeroEcgGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#00F5D4" stopOpacity="0" />
              <stop offset="40%" stopColor="#00F5D4" />
              <stop offset="75%" stopColor="#8A7AFF" />
              <stop offset="100%" stopColor="#8A7AFF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            className="kl-hero-ecg-track"
            d="M 0 35 L 140 35 L 158 20 L 172 48 L 190 6 L 208 54 L 224 24 L 240 35 L 600 35"
          />
          <path
            className="kl-hero-ecg-pulse"
            d="M 0 35 L 140 35 L 158 20 L 172 48 L 190 6 L 208 54 L 224 24 L 240 35 L 600 35"
          />
        </svg>

        {/* 5. TWINKLING QUANTUM STARS */}
        <Star className="kl-hero-star-float pointer-events-none absolute top-[9%] left-[33%] h-5 w-5" />

        <Star className="kl-hero-star-float pointer-events-none absolute top-[43%] left-[49%] hidden h-20 w-20 lg:block" />

        <Star className="kl-hero-star-float pointer-events-none absolute top-[6%] -right-7 h-20 w-20" />

        {/* HERO GRID */}
        <div className="relative mx-auto grid w-full max-w-[1540px] grid-cols-1 items-center gap-x-4 pt-16 px-6 sm:px-10 lg:min-h-[600px] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:px-12 lg:pt-0 xl:min-h-[690px] 2xl:min-h-[750px] 2xl:px-6">
          {/* LEFT CONTENT */}
          <div className="relative z-10 pb-8 lg:py-16">
            {/* DYNAMIC BADGE */}
            {badge && (
              <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-[#00f5d4]/30 bg-[#05222b]/70 px-4 py-1.5 text-base font-semibold text-[#ecfeff] shadow-[0_0_24px_rgba(0,245,212,0.15)] backdrop-blur-md sm:text-lg xl:text-xl">
                <span className="h-2.5 w-2.5 rounded-full bg-[#00f5d4] shadow-[0_0_10px_#00f5d4]" />
                <span
                  dangerouslySetInnerHTML={{
                    __html: badge,
                  }}
                />
              </div>
            )}

            {/* DYNAMIC TITLE */}
            <h1
              id="kliniko-hero-heading"
              className="max-w-[790px] text-[clamp(2.5rem,4vw,4.5rem)] leading-[1.13] font-bold tracking-[-0.025em] drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
              dangerouslySetInnerHTML={{
                __html: title,
              }}
            />

            {/* DYNAMIC DESCRIPTION */}
            {description && (
              <div
                className="mt-6 max-w-[660px] text-base leading-relaxed font-medium text-[#d2f4f9]/90 sm:text-lg xl:text-xl"
                dangerouslySetInnerHTML={{
                  __html: description,
                }}
              />
            )}

            {/* BUTTONS */}
            <div className="mt-8 flex items-center gap-5 sm:mt-10">
              {/* DYNAMIC APPOINTMENT BUTTON */}
              {buttonText && (
                <Link
                  href={buttonLink}
                  className="inline-flex h-14 items-center justify-center rounded-full border border-[#00f5d4]/40 bg-gradient-to-r from-[#0e8ba2] via-[#139db2] to-[#00c4b4] px-7 text-base font-semibold text-white shadow-[0_0_28px_rgba(0,245,212,0.3)] transition hover:scale-[1.02] hover:shadow-[0_0_38px_rgba(0,245,212,0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-9"
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: buttonText,
                    }}
                  />
                </Link>
              )}

              {/* VIDEO BUTTON WITH LOADER SONIC SHOCKWAVE */}
              <button
                type="button"
                onClick={() => setVideoOpen(true)}
                aria-label="Play introduction video"
                aria-haspopup="dialog"
                className="relative flex h-[76px] w-[76px] items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:h-[86px] sm:w-[86px]"
              >
                <span className="kl-hero-play-shockwave" aria-hidden="true" />
                <span className="relative z-10 flex h-[56px] w-[56px] items-center justify-center rounded-full bg-gradient-to-r from-[#6553e9] via-[#18aabc] to-[#00f5d4] shadow-[0_0_24px_rgba(0,245,212,0.5)] sm:h-[62px] sm:w-[62px]">
                  <Play className="ml-1 h-5 w-5 fill-white text-white" />
                </span>
              </button>
            </div>
          </div>

          {/* RIGHT DOCTOR IMAGE + 6D GYROSCOPIC PORTAL STAGE */}
          <div className="kl-hero-portal-stage relative flex h-full items-end justify-center lg:justify-end">
            {/* 6D & 8D Animated Portal Halo Behind Doctor */}
            <div
              aria-hidden="true"
              className="kl-hero-portal-parallax pointer-events-none absolute inset-0 -z-10 flex items-center justify-center lg:translate-x-6"
            >
              <span className="kl-hero-halo" />
              <span className="kl-hero-gyro kl-hero-gyro--1" />
              <span className="kl-hero-gyro kl-hero-gyro--2" />
              <span className="kl-hero-gyro kl-hero-gyro--3" />
            </div>

            <Image
              src={doctorImage}
              alt="Medical professional in a white coat with a stethoscope"
              width={750}
              height={800}
              priority
              unoptimized
              sizes="(max-width: 639px) 300px, (max-width: 1023px) 380px, (max-width: 1279px) 460px, (max-width: 1535px) 520px, 580px"
              className="relative z-10 h-auto w-[min(75vw,300px)] object-contain object-bottom drop-shadow-[0_18px_45px_rgba(0,0,0,0.65)] sm:w-[380px] lg:w-[460px] xl:w-[520px] 2xl:w-[580px]"
            />
          </div>
        </div>
      </section>

      {/* VIDEO MODAL */}
      {videoOpen && (
        <VideoModal videoId={videoId} onClose={() => setVideoOpen(false)} />
      )}
    </>
  );
}
