"use client";

import { Globe, Share2, Stethoscope } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";
import sanitizeHtml from "sanitize-html";

const CLOSE_DELAY = 3000;
const EASE = [0.22, 1, 0.36, 1];
const SPRING = { type: "spring", stiffness: 260, damping: 24 };

const IMAGE_BASE =
  "https://html.vecurosoft.com/kliniko/demo/assets/img/doctors";

const DEFAULT_DOCTORS = [
  {
    id: "dr-arman-hossain",
    name: "Dr. Arman Hossain",
    specialty: "Internal Medicine",
    image: `${IMAGE_BASE}/dr-h1-img1.jpg`,
  },
  {
    id: "dr-sofia-rahman",
    name: "Dr. Sofia Rahman",
    specialty: "Specialist – Cardiology",
    image: `${IMAGE_BASE}/dr-h1-img2.jpg`,
  },
  {
    id: "dr-neil-chowdhury",
    name: "Dr. Neil Chowdhury",
    specialty: "Orthopedic & Trauma",
    image: `${IMAGE_BASE}/dr-h1-img3.jpg`,
  },
  {
    id: "dr-farhana-zayed",
    name: "Dr. Farhana Zayed",
    specialty: "Neurology Specialist",
    image: `${IMAGE_BASE}/dr-h1-img4.jpg`,
  },
];

const NETWORKS = [
  { key: "facebook", label: "Facebook", Icon: FaFacebookF },
  { key: "twitter", label: "Twitter / X", Icon: FaTwitter },
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn },
  { key: "whatsapp", label: "WhatsApp", Icon: FaWhatsapp },
  { key: "instagram", label: "Instagram", Icon: FaInstagram },
  { key: "website", label: "Website", Icon: Globe },
];

const CARD_VARIANTS = {
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

function english(value) {
  return typeof value === "string" ? value : value?.en || "";
}

function rich(value, inheritWhite = false) {
  if (typeof value !== "string") return "";

  const html = value
    .replace(/&(?:nbsp|#160|#xA0);/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .replace(/<p\b[^>]*>\s*<\/p>/gi, "")
    .replace(/<\/(?:p|div|h[1-6])>\s*<(?:p|div|h[1-6])\b[^>]*>/gi, "<br>");

  return sanitizeHtml(html, {
    allowedTags: ["span", "strong", "b", "em", "i", "u", "s", "br"],
    allowedAttributes: { span: ["style"] },
    allowedStyles: {
      span: {
        color: [/^#[a-f\d]{3,8}$/i, /^rgba?\([\d\s,.%]+\)$/i],
        "background-color": [/^#[a-f\d]{3,8}$/i, /^rgba?\([\d\s,.%]+\)$/i],
      },
    },
    transformTags: inheritWhite
      ? {
          span(tagName, attribs) {
            const style = (attribs.style || "")
              .split(";")
              .filter(
                (part) =>
                  !/^\s*color\s*:\s*(?:#fff(?:fff)?|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))\s*$/i.test(
                    part,
                  ),
              )
              .join(";");

            return {
              tagName,
              attribs: style ? { ...attribs, style } : {},
            };
          },
        }
      : {},
  }).trim();
}

function plainText(html) {
  return sanitizeHtml(html.replace(/<br\s*\/?>/gi, " "), {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/&nbsp;|\u00a0/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

function safeUrl(value, allowLocal = false) {
  if (typeof value !== "string") return "";

  const input = value.trim();
  const markdownLink = /^\[[^\]]*\]\((https?:\/\/[^)]+)\)$/.exec(input);
  const href = markdownLink ? markdownLink[1] : input;

  if (
    allowLocal &&
    href.startsWith("/") &&
    !href.startsWith("//") &&
    !/[\\\s]/.test(href)
  ) {
    return href;
  }

  try {
    const url = new URL(href);

    if (
      ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    ) {
      return url.href;
    }
  } catch {
    return "";
  }

  return "";
}

function getSocialItems(doctor, pageUrl) {
  const encodedUrl = encodeURIComponent(pageUrl);
  const title = encodeURIComponent(`${doctor.nameText} | Kliniko`);

  const shareLinks = pageUrl
    ? {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${title}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(
          `${doctor.nameText} | Kliniko\n${pageUrl}`,
        )}`,
      }
    : {};

  return NETWORKS.flatMap(({ key, label, Icon }) => {
    let savedUrl = safeUrl(doctor.links[key]);

    // Your sample MongoDB records contain example.com placeholders.
    if (savedUrl && /(^|\.)example\.com$/i.test(new URL(savedUrl).hostname)) {
      savedUrl = "";
    }

    const href = savedUrl || shareLinks[key];
    if (!href) return [];

    return [
      {
        key,
        Icon,
        href,
        label: savedUrl
          ? `Open ${doctor.nameText}'s ${label} link`
          : `Share ${doctor.nameText}'s profile on ${label}`,
      },
    ];
  });
}

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

function DoctorShare({ doctor }) {
  const [open, setOpen] = useState(false);
  const [pageUrl, setPageUrl] = useState("");

  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const timerRef = useRef(null);
  const hoveringRef = useRef(false);
  const clickedRef = useRef(false);
  const panelId = useId();

  useEffect(() => {
    const href = doctor.href || `#${encodeURIComponent(doctor.id)}`;
    setPageUrl(new URL(href, window.location.href).href);

    return () => clearTimeout(timerRef.current);
  }, [doctor.href, doctor.id]);

  function cancelTimer() {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }

  function closeNow() {
    cancelTimer();
    clickedRef.current = false;
    setOpen(false);
  }

  function closeAfterDelay() {
    cancelTimer();

    timerRef.current = setTimeout(() => {
      // Let a keyboard user finish tabbing through the links.
      if (panelRef.current?.contains(document.activeElement)) return;

      clickedRef.current = false;
      setOpen(false);
    }, CLOSE_DELAY);
  }

  useEffect(() => {
    if (!open) return;

    function handleOutside(event) {
      if (!rootRef.current?.contains(event.target)) {
        clearTimeout(timerRef.current);
        clickedRef.current = false;
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key !== "Escape") return;

      if (rootRef.current?.contains(document.activeElement)) {
        triggerRef.current?.focus();
      }

      clearTimeout(timerRef.current);
      clickedRef.current = false;
      setOpen(false);
    }

    document.addEventListener("pointerdown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const items = getSocialItems(doctor, pageUrl);

  return (
    <div
      ref={rootRef}
      className="relative z-20 shrink-0"
      onPointerEnter={(event) => {
        if (event.pointerType === "touch") return;

        hoveringRef.current = true;
        cancelTimer();
        setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "touch") return;

        hoveringRef.current = false;
        closeAfterDelay();
      }}
      onFocusCapture={cancelTimer}
      onBlurCapture={(event) => {
        if (
          !event.currentTarget.contains(event.relatedTarget) &&
          !hoveringRef.current
        ) {
          closeAfterDelay();
        }
      }}
    >
      <motion.button
        ref={triggerRef}
        type="button"
        aria-label={`Social links for ${doctor.nameText}`}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => {
          cancelTimer();

          // The first click also works when hover has already opened the rail.
          if (open && clickedRef.current) {
            closeNow();
          } else {
            clickedRef.current = true;
            setOpen(true);
          }
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        transition={SPRING}
        className={`grid size-[52px] cursor-pointer place-items-center rounded-full text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#159DB5] sm:size-14 ${
          open
            ? "bg-gradient-to-br from-[#6456EE] via-[#367DD7] to-[#119DB3]"
            : "bg-[#6055ED]"
        }`}
      >
        <Share2 size={22} strokeWidth={2.6} aria-hidden="true" />
      </motion.button>

      <AnimatePresence>
        {open && items.length > 0 && (
          <motion.ul
            key="social-links"
            ref={panelRef}
            id={panelId}
            aria-label={`${doctor.nameText} social links`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.16, ease: EASE }}
            className="absolute inset-e-0 bottom-full flex max-h-[min(270px,55dvh)] w-[52px] flex-col items-center gap-1 overflow-y-auto overscroll-contain pb-2 sm:w-14"
          >
            {items.map(({ key, Icon, href, label }, index) => (
              <motion.li
                key={key}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.17, delay: index * 0.025 }}
                className="shrink-0"
              >
                <motion.a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  className="grid size-9 place-items-center rounded-full border border-[#C6E3E6] bg-white text-[#10234E] shadow-sm transition-colors hover:border-[#119EB4] hover:bg-[#119EB4] hover:text-white focus-visible:bg-[#119EB4] focus-visible:text-white focus-visible:outline-2 focus-visible:outline-[#142A55]"
                >
                  <Icon size={15} aria-hidden="true" />
                </motion.a>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function DoctorCard({ doctor, index }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [imageError, setImageError] = useState(false);

  const portrait = (
    <div className="relative aspect-[1.31] w-full overflow-hidden rounded-[27px] bg-[#87A7B2]">
      {imageError ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-[#101E50]">
          <Stethoscope size={44} aria-hidden="true" />
          <span className="text-xs font-medium">Doctor image unavailable</span>
        </div>
      ) : (
        <motion.div
          className="absolute inset-0"
          variants={{
            idle: { scale: 1, y: 0 },
            hover: { scale: 1.085, y: -5 },
          }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <Image
            src={doctor.image}
            alt={`Portrait of ${doctor.nameText}`}
            fill
            unoptimized
            priority={index === 0}
            sizes="(max-width: 639px) 90vw, (max-width: 1279px) 44vw, 24vw"
            className="object-cover object-center"
            onError={() => setImageError(true)}
          />
        </motion.div>
      )}

      <motion.div
        aria-hidden="true"
        variants={{ idle: { opacity: 0 }, hover: { opacity: 0.12 } }}
        className="pointer-events-none absolute inset-0 bg-[#101E50]"
      />
    </div>
  );

  const name = <span dangerouslySetInnerHTML={{ __html: doctor.nameHtml }} />;

  return (
    <motion.article
      id={doctor.id}
      initial={false}
      animate={hovered || focused ? "hover" : "idle"}
      variants={CARD_VARIANTS}
      transition={SPRING}
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocused(false);
        }
      }}
      className="relative flex h-full min-w-0 flex-col rounded-[28px] p-[13px] pb-6 sm:p-[14px] sm:pb-7"
    >
      {doctor.href ? (
        <Link
          href={doctor.href}
          aria-label={`View ${doctor.nameText}'s profile`}
          className="block rounded-[27px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#159DB5]"
        >
          {portrait}
        </Link>
      ) : (
        portrait
      )}

      <div className="flex min-w-0 flex-1 flex-col px-2 pt-6 sm:pt-7">
        <div className="relative self-start">
          <motion.h3
            variants={{
              idle: { color: "#101E50" },
              hover: { color: "#FFFFFF" },
            }}
            className="text-[22px] leading-[1.3] font-bold tracking-[-0.02em] sm:text-[25px] xl:text-[21px] 2xl:text-[27px]"
          >
            {doctor.href ? <Link href={doctor.href}>{name}</Link> : name}
          </motion.h3>

          <motion.span
            aria-hidden="true"
            variants={{ idle: { scaleX: 0 }, hover: { scaleX: 1 } }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="pointer-events-none absolute inset-s-0 -bottom-[5px] h-0.5 w-full origin-left rounded-full bg-white rtl:origin-right"
          />
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-6">
          <motion.p
            variants={{
              idle: { color: "#7D8486" },
              hover: { color: "#FFFFFF" },
            }}
            className="min-w-0 pb-1 text-[16px] leading-[1.4] sm:text-[18px] xl:text-[15px] 2xl:text-[18px]"
            dangerouslySetInnerHTML={{ __html: doctor.specialtyHtml }}
          />

          <DoctorShare doctor={doctor} />
        </div>
      </div>
    </motion.article>
  );
}

export default function KlinikoDoctors({ data = {}, cards = [] }) {
  const badge = rich(english(data.badge) || "Our Expert Doctors");
  const title = rich(
    english(data.title) || "Trusted Doctors Committed<br>to Your Well-Being",
  );

  const doctors = useMemo(() => {
    const saved = Array.isArray(cards)
      ? cards.filter((card) => card && (english(card.name) || card.image))
      : [];

    const source = saved.length ? saved : DEFAULT_DOCTORS;

    return source.map((card, index) => {
      const fallback = DEFAULT_DOCTORS[index % DEFAULT_DOCTORS.length];

      const nameHtml = rich(english(card.name) || fallback.name, true);
      const specialtyHtml = rich(
        english(card.specialty) || fallback.specialty,
        true,
      );

      return {
        id: card.id || fallback.id,
        nameHtml,
        nameText: plainText(nameHtml),
        specialtyHtml,
        image: safeUrl(card.image, true) || fallback.image,
        href: safeUrl(card.link, true),
        links: {
          facebook: card.facebook,
          twitter: card.twitter,
          linkedin: card.linkedin,
          whatsapp: card.whatsapp,
          instagram: card.instagram,
          website: card.website,
        },
      };
    });
  }, [cards]);

  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-labelledby="kliniko-doctors-heading"
        className="overflow-hidden bg-white py-16 sm:py-20 lg:py-[40px]"
      >
        <div className="mx-auto w-full max-w-[1540px] px-6 sm:px-10 lg:px-12 2xl:px-6">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="flex items-center justify-center gap-3"
            >
              <SectionMark />
              <span
                className="text-[19px] font-semibold text-[#101E50] sm:text-[23px]"
                dangerouslySetInnerHTML={{ __html: badge }}
              />
              <SectionMark />
            </motion.div>

            <motion.h2
              id="kliniko-doctors-heading"
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.75, delay: 0.12, ease: EASE }}
              className="mx-auto mt-7 max-w-[1080px] text-[clamp(2.2rem,4vw,4rem)] leading-[1.2] font-bold tracking-[-0.035em] whitespace-pre-line text-[#101E50]"
              dangerouslySetInnerHTML={{ __html: title }}
            />
          </div>

          <div className="mt-12 grid grid-cols-1 items-stretch gap-6 sm:mt-14 sm:grid-cols-2 lg:gap-7 xl:mt-[75px] xl:grid-cols-4 xl:gap-6 2xl:gap-8">
            {doctors.map((doctor, index) => (
              <motion.div
                key={`${doctor.id}-${doctor.image}`}
                initial={{ opacity: 0, y: 55, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{
                  duration: 0.7,
                  delay: Math.min(index, 4) * 0.12,
                  ease: EASE,
                }}
                className="h-full min-w-0"
              >
                <DoctorCard doctor={doctor} index={index} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
