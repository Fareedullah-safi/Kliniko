"use client";

import { Headphones, Mail, Play, X } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Exact image from the original Kliniko demo.
// You can later save it locally in your public folder.
const APPOINTMENT_IMAGE =
  "https://html.vecurosoft.com/kliniko/demo/assets/img/bg/appoint-bg-h1.jpg";

// Your YouTube Shorts video.
const VIDEO_ID = "UyyaVC1hOFA";

const DEPARTMENTS = [
  "General Medicine",
  "Cardiology",
  "Orthopedics",
  "Pediatrics",
  "Neurology",
  "Diagnostics",
];

const DOCTORS = [
  "Dr. Arman Hossain",
  "Dr. Sofia Rahman",
  "Dr. Neil Chowdhury",
  "Dr. Farhana Zayed",
];

const FIELD_CLASS =
  "h-[54px] w-full min-w-0 rounded-[8px] border border-[#168DB1] bg-transparent px-4 text-[14px] font-medium text-white outline-none transition-colors duration-200 placeholder:text-[#E3EBFF]/75 focus:border-[#49D5E6] focus:ring-2 focus:ring-[#168DB1]/25 sm:h-[58px] sm:text-[15px]";

const REVEAL = {
  opacity: 0,
  y: 24,
};

const SHOW = {
  opacity: 1,
  y: 0,
};

const REVEAL_TRANSITION = {
  duration: 0.7,
  ease: [0.22, 1, 0.36, 1],
};

// ==========================================
// SMALL MEDICAL ICON
// ==========================================

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
// MOLECULAR BACKGROUND
// ==========================================

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

function MedicalMolecules({ className = "" }) {
  return (
    <svg
      viewBox="0 0 450 350"
      fill="none"
      aria-hidden="true"
      className={`pointer-events-none absolute text-[#4B7BAE] ${className}`}
    >
      <g stroke="currentColor" strokeWidth="2.3" strokeOpacity="0.65">
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

      <g fill="currentColor" fillOpacity="0.65">
        {POINTS.map(([cx, cy], index) => (
          <circle key={index} cx={cx} cy={cy} r={index % 3 === 0 ? 9 : 6} />
        ))}
      </g>
    </svg>
  );
}

// ==========================================
// CONTACT DETAILS
// ==========================================

function ContactDetail({ icon: Icon, caption, text }) {
  return (
    <div className="flex min-w-0 items-center gap-4">
      <div className="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[7px] bg-[#179CB5] text-white sm:h-[58px] sm:w-[58px]">
        {/* DASHED BORDER */}
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

// ==========================================
// YOUTUBE VIDEO POPUP
// ==========================================

function VideoDialog({ onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050C20]/90 p-4 sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Kliniko video"
        className="relative flex max-h-[92dvh] w-full max-w-[440px] flex-col items-center"
      >
        {/* CLOSE BUTTON */}
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className="mb-3 ml-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#101E50] transition hover:bg-[#1BA1B8] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <X size={23} />
        </button>

        {/* YOUTUBE SHORT */}
        <div className="aspect-[9/16] max-h-[78dvh] w-full overflow-hidden rounded-[18px] bg-black shadow-2xl">
          <iframe
            title="Kliniko appointment video"
            src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&playsinline=1&rel=0`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>

        <a
          href={`https://www.youtube.com/shorts/${VIDEO_ID}`}
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

// ==========================================
// MAIN APPOINTMENT COMPONENT
// ==========================================

export default function KlinikoAppointment({ onAppointmentSubmit }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const videoButtonRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeVideo = () => {
    setVideoOpen(false);

    requestAnimationFrame(() => {
      videoButtonRef.current?.focus();
    });
  };

  // ==========================================
  // FORM SUBMISSION
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;

    const fields = Object.fromEntries(new FormData(form));

    setFeedback(null);

    // The UI is currently static.
    // Supply a submission handler when your API is ready.
    if (typeof onAppointmentSubmit !== "function") {
      setFeedback({
        type: "info",
        message:
          "This form is a frontend demo. Connect your appointment API to receive requests.",
      });

      return;
    }

    setSubmitting(true);

    try {
      const result = await onAppointmentSubmit(fields);

      if (result?.success === false) {
        throw new Error(result.message || "Unable to submit the request.");
      }

      setFeedback({
        type: "success",
        message: "Your appointment request has been submitted.",
      });

      form.reset();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      aria-labelledby="kliniko-appointment-title"
      className="relative isolate overflow-hidden bg-[#101E50]"
    >
      {/* ======================================
          TWO COLUMN SPLIT LAYOUT
      ====================================== */}

      <div className="grid w-full grid-cols-1 lg:grid-cols-[34%_66%]">
        {/* ====================================
            LEFT MEDICAL IMAGE
        ==================================== */}

        <div
          className="relative isolate min-h-[340px] overflow-hidden bg-[#233D67] bg-cover bg-center sm:min-h-[460px] lg:min-h-full"
          style={{
            backgroundImage: `url("${APPOINTMENT_IMAGE}")`,
          }}
        >
          {/* SOFT IMAGE OVERLAY */}
          <div className="pointer-events-none absolute inset-0 bg-[#071D49]/10" />

          {/* VIDEO PLAY BUTTON */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.button
              ref={videoButtonRef}
              type="button"
              onClick={() => setVideoOpen(true)}
              aria-label="Play appointment video"
              whileHover={{
                scale: 1.1,
              }}
              whileTap={{
                scale: 0.94,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 19,
              }}
              className="group relative flex h-[88px] w-[88px] cursor-pointer items-center justify-center rounded-full border border-white/85 bg-white/20 text-white shadow-[0_10px_28px_rgba(0,0,0,0.18)] backdrop-blur-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:h-[105px] sm:w-[105px]"
            >
              {/* OUTER RING */}
              <span className="pointer-events-none absolute -inset-[8px] rounded-full border border-white/35" />

              {/* GRADIENT ON HOVER */}
              <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-[#6254ED] via-[#347DCE] to-[#139DB3] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <Play
                size={30}
                fill="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
                className="relative z-10 ml-1.5"
              />
            </motion.button>
          </div>
        </div>

        {/* ====================================
            RIGHT APPOINTMENT PANEL
        ==================================== */}

        <div className="relative isolate overflow-hidden bg-[#101E50]">
          {/* BACKGROUND MOLECULES */}
          <MedicalMolecules className="-top-32 -right-24 h-[350px] w-[480px] opacity-[0.2]" />

          <MedicalMolecules className="-bottom-44 -left-24 h-[380px] w-[510px] rotate-180 opacity-[0.16]" />

          {/* SAME SPACING AS HERO */}
          <div className="relative z-10 mx-auto flex h-full w-full max-w-[1540px] items-center px-6 py-16 sm:px-10 sm:py-20 lg:px-12 lg:py-24 2xl:px-6 2xl:py-[110px]">
            <div className="mx-auto w-full max-w-[675px]">
              {/* ====================================
                  SECTION HEADER
              ==================================== */}

              <motion.div
                initial={REVEAL}
                whileInView={SHOW}
                viewport={{
                  once: true,
                  amount: 0.25,
                }}
                transition={REVEAL_TRANSITION}
              >
                <div className="flex items-center gap-3">
                  <SectionMark />

                  <span className="text-[17px] font-semibold text-white sm:text-[18px]">
                    Appointment
                  </span>
                </div>

                <h2
                  id="kliniko-appointment-title"
                  className="mt-5 max-w-[670px] text-[clamp(2.1rem,3vw,3.5rem)] leading-[1.2] font-bold tracking-[-0.035em] text-white"
                >
                  Make An Appointment For Consulting
                </h2>
              </motion.div>

              {/* ====================================
                  CONTACT DETAILS
              ==================================== */}

              <motion.div
                initial={REVEAL}
                whileInView={SHOW}
                viewport={{
                  once: true,
                  amount: 0.15,
                }}
                transition={{
                  ...REVEAL_TRANSITION,
                  delay: 0.12,
                }}
                className="mt-9 grid grid-cols-1 gap-7 sm:mt-11 sm:grid-cols-2 sm:gap-5"
              >
                <ContactDetail
                  icon={Headphones}
                  caption="Call Us 24/7"
                  text="(000) 920-448-963"
                />

                <ContactDetail
                  icon={Mail}
                  caption="Need Assistance?"
                  text="info@example.com"
                />
              </motion.div>

              {/* ====================================
                  APPOINTMENT FORM
              ==================================== */}

              <motion.form
                initial={REVEAL}
                whileInView={SHOW}
                viewport={{
                  once: true,
                  amount: 0.1,
                }}
                transition={{
                  ...REVEAL_TRANSITION,
                  delay: 0.18,
                }}
                onSubmit={handleSubmit}
                className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                {/* NAME */}
                <label className="sr-only" htmlFor="appointment-name">
                  Your Name
                </label>

                <input
                  id="appointment-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  maxLength={100}
                  placeholder="Your Name"
                  className={FIELD_CLASS}
                />

                {/* EMAIL */}
                <label className="sr-only" htmlFor="appointment-email">
                  Email Address
                </label>

                <input
                  id="appointment-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  maxLength={254}
                  placeholder="Email Address"
                  className={FIELD_CLASS}
                />

                {/* PHONE */}
                <label className="sr-only" htmlFor="appointment-phone">
                  Phone Number
                </label>

                <input
                  id="appointment-phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  maxLength={30}
                  placeholder="Phone Number"
                  className={FIELD_CLASS}
                />

                {/* DEPARTMENT */}
                <label className="sr-only" htmlFor="appointment-department">
                  Select Department
                </label>

                <select
                  id="appointment-department"
                  name="department"
                  required
                  defaultValue=""
                  className={`${FIELD_CLASS} cursor-pointer`}
                >
                  <option value="" disabled className="bg-[#101E50]">
                    Select Department
                  </option>

                  {DEPARTMENTS.map((department) => (
                    <option
                      key={department}
                      value={department}
                      className="bg-[#101E50] text-white"
                    >
                      {department}
                    </option>
                  ))}
                </select>

                {/* DOCTOR */}
                <label className="sr-only" htmlFor="appointment-doctor">
                  Select Doctor
                </label>

                <select
                  id="appointment-doctor"
                  name="doctor"
                  required
                  defaultValue=""
                  className={`${FIELD_CLASS} cursor-pointer`}
                >
                  <option value="" disabled className="bg-[#101E50]">
                    Select Doctor
                  </option>

                  {DOCTORS.map((doctor) => (
                    <option
                      key={doctor}
                      value={doctor}
                      className="bg-[#101E50] text-white"
                    >
                      {doctor}
                    </option>
                  ))}
                </select>

                {/* DATE */}
                <label className="sr-only" htmlFor="appointment-date">
                  Appointment Date
                </label>

                <input
                  id="appointment-date"
                  name="date"
                  type="date"
                  required
                  className={FIELD_CLASS}
                  style={{
                    colorScheme: "dark",
                  }}
                />

                {/* MESSAGE */}
                <label className="sr-only" htmlFor="appointment-message">
                  Type Your Message
                </label>

                <textarea
                  id="appointment-message"
                  name="message"
                  rows={4}
                  maxLength={1500}
                  placeholder="Type Your Message"
                  className={`${FIELD_CLASS} h-auto min-h-[116px] resize-y py-4 sm:col-span-2`}
                />

                {/* ====================================
                    ANIMATED APPOINTMENT BUTTON
                ==================================== */}

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={
                    submitting
                      ? undefined
                      : {
                          y: -3,
                          scale: 1.01,
                        }
                  }
                  whileTap={
                    submitting
                      ? undefined
                      : {
                          scale: 0.985,
                        }
                  }
                  transition={{
                    type: "spring",
                    stiffness: 320,
                    damping: 24,
                  }}
                  className="group relative mt-2 flex min-h-[58px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#159BB1] px-6 text-[15px] font-bold text-white shadow-[0_12px_22px_rgba(0,0,0,0.08)] outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#101E50] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 sm:mt-3"
                >
                  {/* GRADIENT HOVER — SAME AS SERVICES */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#6255EC] via-[#327BD9] to-[#139DB3] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
                  />

                  <span className="relative z-10">
                    {submitting ? "Sending Request..." : "Make An Appointment"}
                  </span>
                </motion.button>

                {/* FORM FEEDBACK */}
                {feedback && (
                  <p
                    role="status"
                    aria-live="polite"
                    className={`text-[14px] leading-6 sm:col-span-2 ${
                      feedback.type === "error"
                        ? "text-[#FFC7C7]"
                        : "text-[#BDEEF6]"
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

      {/* VIDEO MODAL */}
      {mounted && videoOpen && <VideoDialog onClose={closeVideo} />}
    </section>
  );
}
