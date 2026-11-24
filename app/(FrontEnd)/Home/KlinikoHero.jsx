"use client";

import { Play, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
        fill="white"
        fillOpacity=".33"
      />

      <path
        d="M18 18L43 43M82 18L57 43M18 82L43 57M82 82L57 57"
        stroke="white"
        strokeOpacity=".25"
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
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-[#030914]/85 p-4 backdrop-blur-[3px] sm:p-8"
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

        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black shadow-2xl">
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
// MAIN KLINIKO HERO
// ==========================================

export default function KlinikoHero({ data = null }) {
  const [videoOpen, setVideoOpen] = useState(false);

  // Only use static defaults when no MongoDB
  // Hero document exists.
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
        aria-labelledby="kliniko-hero-heading"
        className="relative isolate overflow-hidden bg-[linear-gradient(110deg,#122a3c_0%,#42546c_58%,#2b6485_100%)] text-white"
      >
        {/* BACKGROUND */}
        <div className="pointer-events-none absolute top-[30%] -left-24 -z-10 h-[430px] w-[430px] rounded-full bg-[#18394d]/70 blur-[110px]" />

        <div className="pointer-events-none absolute top-[10%] left-[37%] -z-10 h-[400px] w-[330px] rounded-full bg-[#abb2bd]/25 blur-[100px]" />

        <div className="pointer-events-none absolute top-[0%] right-[-8%] -z-10 h-[420px] w-[420px] rounded-full bg-[#1676aa]/35 blur-[105px]" />

        {/* STARS */}
        <Star className="pointer-events-none absolute top-[9%] left-[33%] h-5 w-5" />

        <Star className="pointer-events-none absolute top-[43%] left-[49%] hidden h-20 w-20 lg:block" />

        <Star className="pointer-events-none absolute top-[6%] -right-7 h-20 w-20" />

        {/* HERO GRID */}
        <div className="relative mx-auto grid w-full max-w-[1540px] grid-cols-1 items-center gap-x-4 px-6 pt-16 sm:px-10 lg:min-h-[635px] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:px-12 lg:pt-0 xl:min-h-[690px] 2xl:min-h-[750px] 2xl:px-6">
          {/* LEFT CONTENT */}
          <div className="relative z-10 pb-8 lg:py-16">
            {/* DYNAMIC BADGE */}
            {badge && (
              <div
                className="mb-5 text-base font-semibold sm:text-lg xl:text-xl"
                dangerouslySetInnerHTML={{
                  __html: badge,
                }}
              />
            )}

            {/* DYNAMIC TITLE */}
            <h1
              id="kliniko-hero-heading"
              className="max-w-[790px] text-[clamp(2.5rem,4vw,4.5rem)] leading-[1.13] font-bold tracking-[-0.025em]"
              dangerouslySetInnerHTML={{
                __html: title,
              }}
            />

            {/* DYNAMIC DESCRIPTION */}
            {description && (
              <div
                className="mt-6 max-w-[660px] text-base leading-relaxed font-medium sm:text-lg xl:text-xl"
                dangerouslySetInnerHTML={{
                  __html: description,
                }}
              />
            )}

            {/* BUTTONS */}
            <div className="mt-8 flex items-center gap-4 sm:mt-10">
              {/* DYNAMIC APPOINTMENT BUTTON */}
              {buttonText && (
                <Link
                  href={buttonLink}
                  className="inline-flex h-14 items-center justify-center rounded-full bg-[#139db2] px-7 text-base font-semibold text-white transition hover:bg-[#0e8ba2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-9"
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: buttonText,
                    }}
                  />
                </Link>
              )}

              {/* VIDEO BUTTON */}
              <button
                type="button"
                onClick={() => setVideoOpen(true)}
                aria-label="Play introduction video"
                aria-haspopup="dialog"
                className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:h-[86px] sm:w-[86px]"
              >
                <span className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-gradient-to-r from-[#6553e9] via-[#3679d9] to-[#13a7ae] sm:h-[62px] sm:w-[62px]">
                  <Play className="ml-1 h-5 w-5 fill-white text-white" />
                </span>
              </button>
            </div>
          </div>

          {/* RIGHT DOCTOR IMAGE */}
          <div className="relative flex h-full items-end justify-center lg:justify-end">
            <Image
              src={doctorImage}
              alt="Medical professional in a white coat with a stethoscope"
              width={750}
              height={800}
              priority
              unoptimized
              sizes="(max-width: 639px) 300px, (max-width: 1023px) 380px, (max-width: 1279px) 460px, (max-width: 1535px) 520px, 580px"
              className="h-auto w-[min(75vw,300px)] object-contain object-bottom sm:w-[380px] lg:w-[460px] xl:w-[520px] 2xl:w-[580px]"
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
