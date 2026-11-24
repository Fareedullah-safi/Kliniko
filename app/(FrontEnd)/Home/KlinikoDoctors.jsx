"use client";

import { Share2, Stethoscope } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import sanitizeHtml from "sanitize-html";

// ==========================================
// DEFAULT DOCTORS
// ==========================================

const DEFAULT_DOCTORS = [
  {
    id: "dr-arman-hossain",
    name: "Dr. Arman Hossain",
    specialty: "Internal Medicine",
    image:
      "https://html.vecurosoft.com/kliniko/demo/assets/img/doctors/dr-h1-img1.jpg",
  },
  {
    id: "dr-sofia-rahman",
    name: "Dr. Sofia Rahman",
    specialty: "Specialist – Cardiology",
    image:
      "https://html.vecurosoft.com/kliniko/demo/assets/img/doctors/dr-h1-img2.jpg",
  },
  {
    id: "dr-neil-chowdhury",
    name: "Dr. Neil Chowdhury",
    specialty: "Orthopedic & Trauma",
    image:
      "https://html.vecurosoft.com/kliniko/demo/assets/img/doctors/dr-h1-img3.jpg",
  },
  {
    id: "dr-farhana-zayed",
    name: "Dr. Farhana Zayed",
    specialty: "Neurology Specialist",
    image:
      "https://html.vecurosoft.com/kliniko/demo/assets/img/doctors/dr-h1-img4.jpg",
  },
];

// ==========================================
// ORIGINAL HOVER ANIMATION
// ==========================================

const spring = {
  type: "spring",
  stiffness: 260,
  damping: 24,
};

const cardVariants = {
  idle: {
    y: 0,
    scale: 1,
    backgroundColor: "#F0F7F3",
    boxShadow: "0 8px 24px rgba(16,30,80,0)",
  },
  hover: {
    y: -10,
    scale: 1.012,
    backgroundColor: "#101E50",
    boxShadow: "0 22px 44px rgba(16,30,80,0.20)",
  },
};

// ==========================================
// SAFE RICH TEXT
// ==========================================

function rich(value, inheritWhite = false) {
  if (typeof value !== "string") return "";

  const html = value
    .replace(/&(?:nbsp|#160|#xA0);/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .replace(/<p\b[^>]*>\s*<\/p>/gi, "")
    .replace(/<\/(?:p|div|h[1-6])\s*>\s*<(?:p|div|h[1-6])\b[^>]*>/gi, "<br>")
    .replace(/<\/?(?:p|div|h[1-6])\b[^>]*>/gi, "");

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
    transformTags: inheritWhite
      ? {
          span: (tag, attributes) => {
            const style = attributes.style || "";

            if (
              /color\s*:\s*(?:rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)|#fff(?:fff)?)(?:\s*;|\s*$)/i.test(
                style,
              )
            ) {
              const rest = style.replace(
                /(?:^|;)\s*color\s*:\s*(?:rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)|#fff(?:fff)?)(?=\s*(?:;|$))/gi,
                "",
              );

              if (rest.trim()) {
                attributes.style = rest;
              } else {
                delete attributes.style;
              }
            }

            return {
              tagName: tag,
              attribs: attributes,
            };
          },
        }
      : {},
  }).trim();
}

// ==========================================
// PLAIN TEXT FOR SHARING AND ALT TEXT
// ==========================================

function asText(html) {
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .trim();
}

// ==========================================
// SAFE CLOUDINARY IMAGE
// ==========================================

function safeImage(value, fallback) {
  if (typeof value !== "string") return fallback;

  const input = value.trim();

  const markdown = /^\[[^\]]+\]\((https?:\/\/[^)]+)\)$/.exec(input);

  const src = markdown ? markdown[1] : input;

  if (src.startsWith("/") && !src.startsWith("//") && !/[\\\s]/.test(src)) {
    return src;
  }

  try {
    const url = new URL(src);

    if (url.protocol === "https:" && !url.username && !url.password) {
      return src;
    }
  } catch {}

  return fallback;
}

// ==========================================
// SAFE PROFILE LINK
// ==========================================

function safeLink(value) {
  if (typeof value !== "string") return "";

  const src = value.trim();

  if (src.startsWith("/") && !src.startsWith("//") && !/[\\\s]/.test(src)) {
    return src;
  }

  try {
    const url = new URL(src);

    if (
      ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    ) {
      return src;
    }
  } catch {}

  return "";
}

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
      className="shrink-0 text-[#149EB5]"
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
// DOCTOR CARD
// ==========================================

function DoctorCard({ doctor, index }) {
  const [active, setActive] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [message, setMessage] = useState("");

  const messageTimer = useRef(null);

  useEffect(() => () => clearTimeout(messageTimer.current), []);

  // ORIGINAL SHARE FUNCTION
  const shareDoctor = async () => {
    const fallback = `${window.location.origin}${window.location.pathname}#${doctor.id}`;

    const url =
      doctor.link && doctor.link !== "/"
        ? new URL(doctor.link, window.location.origin).href
        : fallback;

    try {
      if (navigator.share) {
        await navigator.share({
          title: doctor.nameText,
          text: doctor.specialtyText,
          url,
        });

        return;
      }

      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard unavailable");
      }

      await navigator.clipboard.writeText(url);
      setMessage("Link copied!");
    } catch (error) {
      if (error?.name === "AbortError") return;

      setMessage("Unable to share. Please try again.");
    }

    clearTimeout(messageTimer.current);

    messageTimer.current = setTimeout(() => setMessage(""), 2400);
  };

  return (
    <motion.article
      id={doctor.id}
      tabIndex={0}
      initial={false}
      animate={active ? "hover" : "idle"}
      variants={cardVariants}
      transition={spring}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") {
          setActive(true);
        }
      }}
      onPointerLeave={() => setActive(false)}
      onFocusCapture={() => setActive(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setActive(false);
        }
      }}
      className="relative flex h-full min-w-0 flex-col rounded-[28px] p-[13px] pb-6 outline-none focus-visible:ring-2 focus-visible:ring-[#139DB3] focus-visible:ring-offset-4 sm:p-[14px] sm:pb-7"
    >
      {/* DOCTOR IMAGE */}
      <div className="relative aspect-[1.31] w-full overflow-hidden rounded-[27px] bg-[#87A7B2]">
        {imageError ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-[#101E50]">
            <Stethoscope size={44} />

            <span className="text-center text-xs font-medium">
              Doctor image unavailable
            </span>
          </div>
        ) : (
          <motion.div
            className="absolute inset-0"
            variants={{
              idle: {
                scale: 1,
                y: 0,
              },
              hover: {
                scale: 1.085,
                y: -5,
              },
            }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Image
              src={doctor.image}
              alt={`Portrait of ${doctor.nameText}`}
              fill
              unoptimized
              sizes="(max-width: 639px) calc(100vw - 74px), (max-width: 1279px) 44vw, (max-width: 1535px) 23vw, 350px"
              className="object-cover object-center"
              priority={index === 0}
              onError={() => setImageError(true)}
            />
          </motion.div>
        )}

        {/* HOVER IMAGE OVERLAY */}
        <motion.div
          aria-hidden="true"
          initial={false}
          variants={{
            idle: { opacity: 0 },
            hover: { opacity: 0.12 },
          }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none absolute inset-0 bg-[#101E50]"
        />
      </div>

      {/* DOCTOR INFORMATION */}
      <div className="flex min-w-0 flex-1 flex-col px-2 pt-6 sm:pt-7">
        {/* DOCTOR NAME */}
        <div className="relative self-start">
          <motion.h3
            variants={{
              idle: { color: "#101E50" },
              hover: { color: "#FFFFFF" },
            }}
            transition={{ duration: 0.3 }}
            className="text-[22px] leading-[1.3] font-bold tracking-[-0.02em] sm:text-[25px] xl:text-[21px] 2xl:text-[27px]"
            dangerouslySetInnerHTML={{
              __html: doctor.nameHtml,
            }}
          />

          {/* ANIMATED UNDERLINE */}
          <motion.span
            aria-hidden="true"
            initial={false}
            variants={{
              idle: { scaleX: 0 },
              hover: { scaleX: 1 },
            }}
            transition={{
              duration: 0.35,
              ease: "easeOut",
            }}
            className="absolute -bottom-[5px] left-0 h-[2px] w-full origin-left rounded-full bg-white"
          />
        </div>

        {/* SPECIALTY AND SHARE BUTTON */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-6">
          <motion.p
            variants={{
              idle: { color: "#7D8486" },
              hover: { color: "#FFFFFF" },
            }}
            transition={{ duration: 0.3 }}
            className="min-w-0 pb-1 text-[16px] leading-[1.4] sm:text-[18px] xl:text-[15px] 2xl:text-[18px]"
            dangerouslySetInnerHTML={{
              __html: doctor.specialtyHtml,
            }}
          />

          {/* SHARE BUTTON */}
          <motion.button
            type="button"
            onClick={shareDoctor}
            aria-label={`Share ${doctor.nameText}`}
            whileHover={{
              scale: 1.13,
              rotate: 10,
            }}
            whileTap={{ scale: 0.92 }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 18,
            }}
            className="relative flex h-[52px] w-[52px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#6055ED] text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#159DB5] sm:h-[56px] sm:w-[56px]"
          >
            <motion.span
              aria-hidden="true"
              initial={false}
              variants={{
                idle: { opacity: 0 },
                hover: { opacity: 1 },
              }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-gradient-to-br from-[#6456EE] via-[#367DD7] to-[#119DB3]"
            />

            <Share2 size={22} strokeWidth={2.6} className="relative z-10" />
          </motion.button>
        </div>

        <span className="sr-only" role="status" aria-live="polite">
          {message}
        </span>
      </div>
    </motion.article>
  );
}

// ==========================================
// MAIN DOCTORS SECTION
// MONGODB + SCROLL ANIMATIONS
// ==========================================

export default function KlinikoDoctors({ data = {}, cards = [] }) {
  // SECTION DATA
  const badge = rich(data?.badge?.en || "Our Expert Doctors");

  const title = rich(
    data?.title?.en || "Trusted Doctors Committed<br>to Your Well-Being",
  );

  // DYNAMIC DOCTOR CARDS
  const doctors = useMemo(() => {
    const saved = Array.isArray(cards)
      ? cards.filter(
          (card) =>
            card && typeof card === "object" && (card.name?.en || card.image),
        )
      : [];

    const source = saved.length ? saved : DEFAULT_DOCTORS;

    return source.map((card, index) => {
      const fallback = DEFAULT_DOCTORS[index % DEFAULT_DOCTORS.length];

      const nameHtml = rich(card.name?.en || card.name || fallback.name, true);

      const specialtyHtml = rich(
        card.specialty?.en || card.specialty || fallback.specialty,
        true,
      );

      return {
        id: card.id || fallback.id,
        nameHtml,
        specialtyHtml,
        nameText: asText(nameHtml),
        specialtyText: asText(specialtyHtml),
        image: safeImage(card.image, fallback.image),
        link: safeLink(card.link),
      };
    });
  }, [cards]);

  return (
    <section
      aria-labelledby="kliniko-doctors-heading"
      className="overflow-hidden bg-white py-16 sm:py-20 lg:py-[40px]"
    >
      <div className="mx-auto w-full max-w-[1540px] px-6 sm:px-10 lg:px-12 2xl:px-6">
        {/* ==================================
            ANIMATED SECTION HEADING
        ================================== */}

        <div className="text-center">
          {/* BADGE SCROLL ANIMATION */}
          <motion.div
            initial={{
              opacity: 0,
              y: 24,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.5,
            }}
            transition={{
              duration: 0.65,
              ease: "easeOut",
            }}
            className="flex items-center justify-center gap-3"
          >
            <SectionMark />

            <span
              className="text-[19px] font-semibold text-[#101E50] sm:text-[23px]"
              dangerouslySetInnerHTML={{
                __html: badge,
              }}
            />

            <SectionMark />
          </motion.div>

          {/* TITLE SCROLL ANIMATION */}
          <motion.h2
            id="kliniko-doctors-heading"
            initial={{
              opacity: 0,
              y: 35,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              duration: 0.75,
              delay: 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mx-auto mt-7 max-w-[1080px] text-[clamp(2.2rem,4vw,4rem)] leading-[1.2] font-bold tracking-[-0.035em] text-[#101E50]"
            dangerouslySetInnerHTML={{
              __html: title,
            }}
          />
        </div>

        {/* ==================================
            DOCTOR CARDS SCROLL ANIMATION
        ================================== */}

        <div className="mt-12 grid grid-cols-1 items-stretch gap-6 sm:mt-14 sm:grid-cols-2 lg:gap-7 xl:mt-[75px] xl:grid-cols-4 xl:gap-6 2xl:gap-8">
          {doctors.map((doctor, index) => (
            <motion.div
              key={`${doctor.id}-${doctor.image}`}
              initial={{
                opacity: 0,
                y: 55,
                scale: 0.97,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              viewport={{
                once: true,
                amount: 0.12,
              }}
              transition={{
                duration: 0.7,
                delay: Math.min(index, 4) * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="h-full min-w-0"
            >
              <DoctorCard doctor={doctor} index={index} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
