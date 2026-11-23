
"use client";

import Image from "next/image";
import Link from "next/link";
import { Headphones, Mail, MapPinned } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

// ==========================================
// FOOTER LINKS
// ==========================================

const SERVICES = [
  { title: "Physiotherapy", href: "/services/physiotherapy" },
  { title: "General Medicine", href: "/services/general-medicine" },
  { title: "Emergency Service", href: "/services/emergency-care" },
  { title: "Diagnostic Service", href: "/services/diagnostics" },
];

const USEFUL_LINKS = [
  { title: "Our Story", href: "/about" },
  { title: "Services", href: "/services" },
  { title: "Gallery", href: "/gallery" },
  { title: "Contact", href: "/contact" },
];

// ==========================================
// MOLECULAR BACKGROUND DECORATION
// ==========================================

const NODES = [
  [10, 150, 5],
  [86, 114, 9],
  [150, 160, 14],
  [218, 78, 7],
  [293, 132, 12],
  [366, 48, 8],
  [456, 120, 15],
  [538, 55, 9],
  [640, 123, 16],
  [745, 52, 9],
  [825, 150, 13],
  [68, 298, 11],
  [174, 264, 10],
  [296, 318, 15],
  [425, 274, 9],
  [556, 343, 17],
  [690, 263, 11],
  [807, 350, 14],
  [120, 425, 8],
  [350, 444, 10],
  [570, 458, 8],
  [744, 458, 15],
];

const EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
  [5, 6], [6, 7], [7, 8], [8, 9], [9, 10],
  [0, 11], [1, 12], [2, 12], [2, 13],
  [4, 13], [4, 14], [6, 14], [6, 15],
  [8, 16], [8, 17], [10, 17], [11, 12],
  [11, 18], [12, 13], [13, 14], [13, 19],
  [14, 15], [15, 16], [15, 20], [16, 17],
  [17, 21], [18, 19], [19, 20], [20, 21],
];

function MoleculePattern({ className = "" }) {
  return (
    <svg
      viewBox="0 0 850 500"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g
        stroke="#3974A7"
        strokeWidth="3"
        strokeOpacity="0.38"
      >
        {EDGES.map(([a, b], index) => (
          <line
            key={index}
            x1={NODES[a][0]}
            y1={NODES[a][1]}
            x2={NODES[b][0]}
            y2={NODES[b][1]}
          />
        ))}
      </g>

      <g fill="#3974A7" fillOpacity="0.43">
        {NODES.map(([x, y, radius], index) => (
          <circle
            key={index}
            cx={x}
            cy={y}
            r={radius}
          />
        ))}
      </g>
    </svg>
  );
}

// ==========================================
// TOP CONTACT INFORMATION
// ==========================================

function ContactItem({
  icon: Icon,
  label,
  value,
  href,
  address = false,
}) {
  return (
    <div className="flex min-w-0 items-center gap-4 sm:gap-5 lg:gap-[21px]">
      {/* ICON BOX */}
      <motion.div
        initial={false}
        whileHover={{
          y: -4,
          rotate: -4,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-[10px] bg-[#101E50] text-white sm:h-[86px] sm:w-[86px] xl:h-[92px] xl:w-[92px]"
      >
        <Icon
          size={39}
          fill={address ? "currentColor" : "none"}
          strokeWidth={address ? 1.8 : 2.5}
          aria-hidden="true"
        />
      </motion.div>

      {/* CONTACT TEXT */}
      <div className="min-w-0">
        {label && (
          <p className="mb-[5px] text-[14px] font-semibold text-white sm:text-[15px]">
            {label}
          </p>
        )}

        {href ? (
          <a
            href={href}
            className="break-words text-[17px] font-bold leading-[1.45] text-white transition-colors duration-300 hover:text-[#C7F5FB] sm:text-[20px] xl:text-[22px]"
          >
            {value}
          </a>
        ) : (
          <p className="max-w-[260px] text-[18px] font-bold leading-[1.4] text-white sm:text-[21px] xl:text-[23px]">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

// ==========================================
// FOOTER COLUMN TITLE
// ==========================================

function FooterHeading({ children }) {
  return (
    <div className="mb-7">
      <h3 className="text-[24px] font-bold leading-[1.2] text-white sm:text-[26px] lg:text-[27px]">
        {children}
      </h3>

      {/* TURQUOISE UNDERLINE */}
      <div className="mt-[18px] h-[2px] w-[96px] bg-[#14A0B6]" />
    </div>
  );
}

// ==========================================
// FOOTER LINKS WITH HOVER ANIMATION
// ==========================================

function FooterLinks({ links }) {
  return (
    <ul className="flex flex-col items-start gap-[13px]">
      {links.map((item) => (
        <li key={item.title}>
          <motion.div
            initial={false}
            whileHover={{ x: 6 }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 23,
            }}
          >
            <Link
              href={item.href}
              className="text-[15px] font-medium leading-[1.45] text-[#F3F5FB] transition-colors duration-200 hover:text-[#39C6D8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#39C6D8] sm:text-[16px]"
            >
              {item.title}
            </Link>
          </motion.div>
        </li>
      ))}
    </ul>
  );
}

// ==========================================
// MAIN FOOTER
// ==========================================

export default function KlinikoFooter({
  onNewsletterSubscribe,
}) {
  const [newsletterState, setNewsletterState] = useState({
    status: "idle",
    message: "",
  });

  // ========================================
  // NEWSLETTER SUBMISSION
  // ========================================

  const handleNewsletter = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;

    const email = new FormData(form)
      .get("email")
      ?.toString()
      .trim();

    if (!email) return;

    // Frontend-only until a real subscription
    // function is provided.
    if (typeof onNewsletterSubscribe !== "function") {
      setNewsletterState({
        status: "info",
        message: "Newsletter signup is not connected yet.",
      });

      return;
    }

    setNewsletterState({
      status: "loading",
      message: "",
    });

    try {
      const result = await onNewsletterSubscribe(email);

      if (result?.success === false) {
        throw new Error(
          result.message || "Subscription was unsuccessful.",
        );
      }

      setNewsletterState({
        status: "success",
        message: "Your subscription request has been received.",
      });

      form.reset();
    } catch (error) {
      setNewsletterState({
        status: "error",
        message:
          error?.message || "Unable to subscribe right now.",
      });
    }
  };

  return (
    <footer className="relative isolate overflow-hidden bg-[#101E50] text-white">
      {/* ====================================
          BACKGROUND MOLECULAR PATTERN
      ==================================== */}

      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <MoleculePattern className="absolute -left-[260px] top-[120px] h-[580px] w-[900px] opacity-[0.34]" />

        <MoleculePattern className="absolute -right-[230px] -top-[135px] h-[670px] w-[1030px] rotate-180 opacity-[0.25]" />

        <MoleculePattern className="absolute bottom-[-200px] left-[24%] h-[570px] w-[850px] opacity-[0.13]" />
      </div>

      {/* ====================================
          SHARED HERO CONTAINER
      ==================================== */}

      <div className="relative mx-auto w-full max-w-[1540px] px-6 pt-[75px] sm:px-10 sm:pt-[90px] lg:px-12 lg:pt-[112px] 2xl:px-6">

        {/* ====================================
            TURQUOISE CONTACT BAR
        ==================================== */}

        <div className="relative overflow-hidden rounded-[21px] bg-[#189CAF] px-5 py-7 sm:px-8 sm:py-9 lg:px-[42px] lg:py-[41px]">

          {/* SUBTLE GRADIENT OVERLAY */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,rgba(255,255,255,0.015),rgba(255,255,255,0.04),rgba(0,0,0,0.02))]"
          />

          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-[1.15fr_1.15fr_1fr] lg:items-center lg:gap-8">

            {/* ADDRESS */}
            <ContactItem
              icon={MapPinned}
              value="40 Broklyn Golden Street, USA"
              address
            />

            {/* EMAIL */}
            <ContactItem
              icon={Mail}
              label="Email Address"
              value="Info@Example.Com"
              href="mailto:info@example.com"
            />

            {/* PHONE */}
            <ContactItem
              icon={Headphones}
              label="Call Anytime"
              value="(000) 920-448-963"
              href="tel:000920448963"
            />
          </div>
        </div>

        {/* ====================================
            FOUR COLUMN FOOTER BODY
        ==================================== */}

        <div className="grid grid-cols-1 gap-x-9 gap-y-12 pb-[84px] pt-[77px] sm:grid-cols-2 lg:grid-cols-[1.52fr_0.82fr_0.77fr_1.22fr] lg:gap-x-[44px] lg:pb-[100px] lg:pt-[82px]">

          {/* ==================================
              COLUMN 1: LOGO & DESCRIPTION
          ================================== */}

          <div className="min-w-0">
            <Link
              href="/"
              aria-label="Kliniko home"
              className="inline-block rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2DBFD0]"
            >
              <Image
                src="/images/footer/kliniko-logo.png"
                alt="Kliniko"
                width={277}
                height={67}
                sizes="277px"
                className="h-auto w-[240px] object-contain sm:w-[265px]"
              />
            </Link>

            <p className="mt-[25px] max-w-[365px] text-[15px] font-medium leading-[1.8] text-[#E9EEFB] sm:text-[16px]">
              Kliniko provides advanced medical services, expert
              consultation, and patient-focused care designed
              to uphold the highest standards in modern
              healthcare.
            </p>
          </div>

          {/* ==================================
              COLUMN 2: SERVICES
          ================================== */}

          <div className="min-w-0">
            <FooterHeading>Our Services</FooterHeading>
            <FooterLinks links={SERVICES} />
          </div>

          {/* ==================================
              COLUMN 3: USEFUL LINKS
          ================================== */}

          <div className="min-w-0">
            <FooterHeading>Useful Links</FooterHeading>
            <FooterLinks links={USEFUL_LINKS} />
          </div>

          {/* ==================================
              COLUMN 4: NEWSLETTER
          ================================== */}

          <div className="min-w-0">
            <FooterHeading>Newsletter</FooterHeading>

            <p className="mb-[20px] text-[15px] font-medium text-[#F0F4FC] sm:text-[16px]">
              Subscribe For Get Latest Updates
            </p>

            <form
              onSubmit={handleNewsletter}
              className="flex flex-col items-start gap-[15px]"
            >
              <label
                htmlFor="footer-newsletter-email"
                className="sr-only"
              >
                Email Address
              </label>

              <input
                id="footer-newsletter-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                maxLength={254}
                placeholder="Email Address"
                className="h-[52px] w-full rounded-[10px] border-[1.5px] border-[#159FB4] bg-[#2C3C66] px-[25px] text-[15px] font-medium text-white outline-none transition-all duration-300 placeholder:text-white focus:border-[#4CCBDB] focus:ring-2 focus:ring-[#159FB4]/25"
              />

              {/* ANIMATED SUBSCRIBE BUTTON */}
              <motion.button
                type="submit"
                disabled={newsletterState.status === "loading"}
                initial={false}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.96 }}
                transition={{
                  type: "spring",
                  stiffness: 330,
                  damping: 23,
                }}
                className="group relative inline-flex min-h-[48px] cursor-pointer items-center justify-center overflow-hidden rounded-[11px] bg-[#159FB4] px-[28px] text-[15px] font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#101E50] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {/* PURPLE → BLUE → TEAL HOVER */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#6255EC] via-[#327BD9] to-[#139DB3] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />

                <span className="relative">
                  {newsletterState.status === "loading"
                    ? "Subscribing..."
                    : "Subscribe"}
                </span>
              </motion.button>

              {/* FORM FEEDBACK */}
              {newsletterState.message && (
                <p
                  role="status"
                  aria-live="polite"
                  className={`text-[13px] leading-5 ${
                    newsletterState.status === "error"
                      ? "text-[#FFCFD0]"
                      : "text-[#AEEEF7]"
                  }`}
                >
                  {newsletterState.message}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* ====================================
          COPYRIGHT — NETHUB ONLY
      ==================================== */}

      <div className="relative z-10 bg-[#2A3965]/80">
        <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-4 px-6 py-[26px] sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-12 2xl:px-6">

          {/* ALL CREDIT TO NETHUB */}
          <p className="text-[14px] font-medium leading-[1.6] text-white sm:text-[15px]">
            Copyright © 2026{" "}
            <span className="font-bold text-[#20B2C5]">
              NetHub
            </span>
            . All Rights Reserved. Developed By{" "}
            <span className="font-bold text-[#20B2C5]">
              NetHub
            </span>
            .
          </p>

          {/* LEGAL LINKS */}
          <nav
            aria-label="Legal links"
            className="flex flex-wrap items-center gap-x-[35px] gap-y-3"
          >
            <Link
              href="/terms-and-conditions"
              className="text-[14px] font-medium text-white transition-colors hover:text-[#31BFD0] sm:text-[15px]"
            >
              Terms &amp; Conditions
            </Link>

            <Link
              href="/privacy-policy"
              className="text-[14px] font-medium text-white transition-colors hover:text-[#31BFD0] sm:text-[15px]"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
