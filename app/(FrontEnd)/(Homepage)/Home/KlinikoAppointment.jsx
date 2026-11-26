"use client";

import { Headphones, Mail, Play, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import sanitizeHtml from "sanitize-html";

const API = "/api/admin/kliniko-appointments";

const DEFAULT_IMAGE =
  "https://html.vecurosoft.com/kliniko/demo/assets/img/bg/appoint-bg-h1.jpg";

const DEFAULT_VIDEO_ID = "UyyaVC1hOFA";
const DEFAULT_PHONE = "(000) 920-448-963";

const DEPARTMENTS = [
  "General Medicine",
  "Cardiology",
  "Orthopedics",
  "Pediatrics",
  "Neurology",
  "Diagnostics",
];

const FIELD_CLASS =
  "h-[54px] w-full min-w-0 rounded-[8px] border border-[#168DB1] " +
  "bg-transparent px-4 text-[14px] font-medium text-white outline-none " +
  "transition-colors duration-200 placeholder:text-[#E3EBFF]/75 " +
  "focus:border-[#49D5E6] focus:ring-2 focus:ring-[#168DB1]/25 " +
  "sm:h-[58px] sm:text-[15px]";

const OPTION_CLASS = "bg-[#101E50] text-white";

function reveal(delay = 0) {
  return {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: {
      duration: 0.7,
      delay,
      ease: [0.22, 1, 0.36, 1],
    },
  };
}

// Keep the formatting from your CMS headings and button text.
function rich(value, fallback) {
  const source = typeof value === "string" ? value : value?.en;

  if (typeof source !== "string" || !source.trim()) return fallback;

  const html = source
    .replace(/&(?:nbsp|#160|#xA0);/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .replace(/<p\b[^>]*>\s*<\/p>/gi, "")
    .replace(/<\/(?:p|div|h[1-6])>\s*<(?:p|div|h[1-6])\b[^>]*>/gi, "<br>");

  return (
    sanitizeHtml(html, {
      allowedTags: ["span", "strong", "b", "em", "i", "u", "s", "br"],
      allowedAttributes: { span: ["style"] },
      allowedStyles: {
        span: {
          color: [/^#[a-f\d]{3,8}$/i, /^rgba?\([\d\s,.%]+\)$/i],
          "background-color": [/^#[a-f\d]{3,8}$/i, /^rgba?\([\d\s,.%]+\)$/i],
        },
      },
    }).trim() || fallback
  );
}

function unwrapUrl(value) {
  if (typeof value !== "string") return "";

  const input = value.trim();
  const match = /^\[[^\]]+\]\((https?:\/\/[^)]+)\)$/.exec(input);

  return match ? match[1] : input;
}

function getImage(value) {
  const input = unwrapUrl(value);

  if (
    input.startsWith("/") &&
    !input.startsWith("//") &&
    !/[\\\s"']/.test(input)
  ) {
    return input;
  }

  try {
    const url = new URL(input);

    if (url.protocol === "https:" && !url.username && !url.password) {
      return url.href;
    }
  } catch {
    return DEFAULT_IMAGE;
  }

  return DEFAULT_IMAGE;
}

function getVideoId(value) {
  try {
    const url = new URL(unwrapUrl(value));
    const host = url.hostname.toLowerCase();

    let id = "";

    if (["youtu.be", "www.youtu.be"].includes(host)) {
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
      id =
        url.pathname === "/watch"
          ? url.searchParams.get("v")
          : url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1];
    }

    return /^[\w-]{11}$/.test(id || "") ? id : DEFAULT_VIDEO_ID;
  } catch {
    return DEFAULT_VIDEO_ID;
  }
}

function SectionMark() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-[#19A4BD]"
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

const POINTS = [
  [15, 85],
  [75, 40],
  [135, 96],
  [195, 50],
  [255, 105],
  [315, 55],
  [375, 114],
  [65, 190],
  [155, 205],
  [250, 198],
  [345, 218],
  [425, 175],
  [105, 290],
  [210, 310],
  [325, 320],
];

const EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [0, 7],
  [2, 8],
  [4, 9],
  [6, 11],
  [7, 8],
  [8, 9],
  [9, 10],
  [10, 11],
  [7, 12],
  [8, 13],
  [9, 13],
  [10, 14],
];

function MedicalMolecules({ className }) {
  return (
    <svg
      viewBox="0 0 450 350"
      fill="none"
      aria-hidden="true"
      className={`pointer-events-none absolute text-[#4B7BAE] ${className}`}
    >
      <g stroke="currentColor" strokeWidth="2.3" strokeOpacity="0.65">
        {EDGES.map(([start, end]) => (
          <line
            key={`${start}-${end}`}
            x1={POINTS[start][0]}
            y1={POINTS[start][1]}
            x2={POINTS[end][0]}
            y2={POINTS[end][1]}
          />
        ))}
      </g>

      <g fill="currentColor" fillOpacity="0.65">
        {POINTS.map(([cx, cy], index) => (
          <circle key={index} cx={cx} cy={cy} r={index % 3 === 0 ? 9 : 6} />
        ))}
      </g>
    </svg>
  );
}

function ContactDetail({ icon: Icon, caption, text }) {
  return (
    <div className="flex min-w-0 items-center gap-4">
      <div className="relative flex size-[52px] shrink-0 items-center justify-center rounded-[7px] bg-[#179CB5] text-white sm:size-[58px]">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-[4px] rounded-[9px] border border-dashed border-[#179CB5]"
        />
        <Icon size={25} strokeWidth={2.2} aria-hidden="true" />
      </div>

      <div className="min-w-0">
        <p className="text-[14px] leading-6 font-semibold text-white/90">
          {caption}
        </p>
        <p className="text-[17px] leading-[1.4] font-bold break-words text-white sm:text-[19px]">
          {text}
        </p>
      </div>
    </div>
  );
}

function VideoDialog({ videoId, setVideoOpen }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function handleEscape(event) {
      if (event.key === "Escape") setVideoOpen(false);
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
      previousFocus?.focus?.();
    };
  }, [setVideoOpen]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050C20]/90 p-4 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setVideoOpen(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Kliniko video"
        className="relative flex max-h-[92dvh] w-full max-w-[440px] flex-col items-center"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={() => setVideoOpen(false)}
          aria-label="Close video"
          className="ms-auto mb-3 grid size-11 place-items-center rounded-full bg-white text-[#101E50] transition hover:bg-[#1BA1B8] hover:text-white"
        >
          <X size={23} />
        </button>

        <div className="aspect-[9/16] max-h-[78dvh] w-full overflow-hidden rounded-[18px] bg-black shadow-2xl">
          <iframe
            title="Kliniko appointment video"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`}
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>

        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 text-sm font-medium text-white underline underline-offset-4 hover:text-[#63D6E6]"
        >
          Watch directly on YouTube
        </a>
      </div>
    </div>,
    document.body,
  );
}

async function saveAppointment(fields) {
  const response = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message ||
        `Could not submit the request (HTTP ${response.status}).`,
    );
  }

  return result;
}

export default function KlinikoAppointment({
  data = {},
  doctors = [],
  onAppointmentSubmit = saveAppointment,
}) {
  const [videoOpen, setVideoOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const sendingRef = useRef(false);

  const badge = rich(data.badge, "Appointment");
  const title = rich(data.title, "Make An Appointment For Consulting");
  const buttonText = rich(data.buttonText, "Make An Appointment");

  const phone =
    typeof data.phone === "string" && data.phone.trim()
      ? data.phone.trim()
      : DEFAULT_PHONE;

  const image = getImage(data.image);
  const videoId = getVideoId(data.videoLink);
  const disabled = submitting || doctors.length === 0;

  async function handleSubmit(event) {
    event.preventDefault();

    if (sendingRef.current || doctors.length === 0) return;

    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));

    sendingRef.current = true;
    setSubmitting(true);
    setFeedback(null);

    try {
      const result = await onAppointmentSubmit(fields);

      if (result?.success === false) {
        throw new Error(result.message || "Could not submit your request.");
      }

      form.reset();
      setFeedback({
        success: true,
        message: "Your appointment request has been submitted.",
      });
    } catch (error) {
      setFeedback({
        success: false,
        message:
          error.message || "Could not submit your request. Please try again.",
      });
    } finally {
      sendingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <section
      aria-labelledby="kliniko-appointment-title"
      className="relative isolate overflow-hidden bg-[#101E50]"
    >
      <div className="grid w-full grid-cols-1 lg:grid-cols-[34%_66%]">
        <motion.div
          {...reveal()}
          className="relative isolate min-h-[340px] overflow-hidden bg-[#233D67] bg-cover bg-center sm:min-h-[460px] lg:min-h-full"
          style={{ backgroundImage: `url("${image}")` }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[#071D49]/10" />

          <div className="absolute inset-0 flex items-center justify-center">
            <motion.button
              type="button"
              aria-label="Play appointment video"
              onClick={() => setVideoOpen(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 300, damping: 19 }}
              className="group relative grid size-[88px] cursor-pointer place-items-center rounded-full border border-white/85 bg-white/20 text-white shadow-[0_10px_28px_rgba(0,0,0,0.18)] backdrop-blur-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:size-[105px]"
            >
              <span className="pointer-events-none absolute -inset-2 rounded-full border border-white/35" />
              <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-[#6254ED] via-[#347DCE] to-[#139DB3] opacity-0 transition-opacity group-hover:opacity-100" />
              <Play
                size={30}
                fill="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
                className="relative z-10 ms-1.5"
              />
            </motion.button>
          </div>
        </motion.div>

        <div className="relative isolate overflow-hidden bg-[#101E50]">
          <MedicalMolecules className="-top-32 -right-24 h-[350px] w-[480px] opacity-20" />
          <MedicalMolecules className="-bottom-44 -left-24 h-[380px] w-[510px] rotate-180 opacity-[0.16]" />

          <div className="relative z-10 mx-auto flex h-full w-full max-w-[1540px] items-center px-6 py-16 sm:px-10 sm:py-20 lg:px-12 lg:py-24 2xl:px-6 2xl:py-[110px]">
            <div className="mx-auto w-full max-w-[675px]">
              <motion.div {...reveal(0.08)} className="flex items-center gap-3">
                <SectionMark />
                <span
                  className="text-[17px] font-semibold text-white sm:text-[18px]"
                  dangerouslySetInnerHTML={{ __html: badge }}
                />
              </motion.div>

              <motion.h2
                {...reveal(0.16)}
                id="kliniko-appointment-title"
                className="mt-5 max-w-[670px] text-[clamp(2.1rem,3vw,3.5rem)] leading-[1.2] font-bold tracking-[-0.035em] text-white"
                dangerouslySetInnerHTML={{ __html: title }}
              />

              <div className="mt-9 grid grid-cols-1 gap-7 sm:mt-11 sm:grid-cols-2 sm:gap-5">
                <motion.div {...reveal(0.22)}>
                  <ContactDetail
                    icon={Headphones}
                    caption="Call Us 24/7"
                    text={phone}
                  />
                </motion.div>

                <motion.div {...reveal(0.3)}>
                  <ContactDetail
                    icon={Mail}
                    caption="Need Assistance?"
                    text="info@example.com"
                  />
                </motion.div>
              </div>

              <motion.form
                {...reveal(0.34)}
                onSubmit={handleSubmit}
                aria-busy={submitting}
                className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                <input
                  aria-label="Your name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your Name"
                  maxLength={100}
                  required
                  className={FIELD_CLASS}
                />

                <input
                  aria-label="Email address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email Address"
                  maxLength={254}
                  required
                  className={FIELD_CLASS}
                />

                <input
                  aria-label="Phone number"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Phone Number"
                  maxLength={30}
                  required
                  className={FIELD_CLASS}
                />

                <select
                  aria-label="Department"
                  name="department"
                  defaultValue=""
                  required
                  className={`${FIELD_CLASS} cursor-pointer`}
                >
                  <option value="" disabled className={OPTION_CLASS}>
                    Select Department
                  </option>

                  {DEPARTMENTS.map((department) => (
                    <option
                      key={department}
                      value={department}
                      className={OPTION_CLASS}
                    >
                      {department}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Doctor"
                  name="doctor"
                  defaultValue=""
                  required
                  disabled={doctors.length === 0}
                  className={`${FIELD_CLASS} cursor-pointer disabled:cursor-not-allowed`}
                >
                  <option value="" disabled className={OPTION_CLASS}>
                    {doctors.length ? "Select Doctor" : "No doctors available"}
                  </option>

                  {doctors.map((doctor) => (
                    <option
                      key={doctor.id}
                      value={doctor.id}
                      className={OPTION_CLASS}
                    >
                      {doctor.name}
                    </option>
                  ))}
                </select>

                <input
                  aria-label="Appointment date"
                  name="date"
                  type="date"
                  required
                  style={{ colorScheme: "dark" }}
                  className={FIELD_CLASS}
                />

                <textarea
                  aria-label="Message"
                  name="message"
                  placeholder="Type Your Message"
                  rows={4}
                  maxLength={1500}
                  className={`${FIELD_CLASS} h-auto min-h-[116px] resize-y py-4 sm:col-span-2`}
                />

                <motion.button
                  type="submit"
                  disabled={disabled}
                  whileHover={disabled ? undefined : { y: -3, scale: 1.01 }}
                  whileTap={disabled ? undefined : { scale: 0.985 }}
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                  className="group relative mt-2 flex min-h-[58px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#159BB1] px-6 text-[15px] font-bold text-white shadow-[0_12px_22px_rgba(0,0,0,0.08)] focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 sm:mt-3"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#6255EC] via-[#327BD9] to-[#139DB3] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  />

                  {submitting ? (
                    <span className="relative">Sending Request...</span>
                  ) : (
                    <span
                      className="relative"
                      dangerouslySetInnerHTML={{ __html: buttonText }}
                    />
                  )}
                </motion.button>

                {feedback && (
                  <p
                    role="status"
                    className={`text-sm leading-6 sm:col-span-2 ${
                      feedback.success ? "text-[#BDEEF6]" : "text-[#FFC7C7]"
                    }`}
                  >
                    {feedback.message}
                  </p>
                )}
              </motion.form>
            </div>
          </div>
        </div>
      </div>

      {videoOpen && (
        <VideoDialog videoId={videoId} setVideoOpen={setVideoOpen} />
      )}
    </section>
  );
}
