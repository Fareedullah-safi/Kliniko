"use client";

import { MessageCircle, Share2, UserRound } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import sanitizeHtml from "sanitize-html";

// Original static cards are used only when no MongoDB cards exist.
const DEFAULT_POSTS = [
  {
    id: "preventive-care",
    title: "Why Preventive Care Matters Most",
    image:
      "https://html.vecurosoft.com/kliniko/demo/assets/img/blog/blog-h1-img1.jpg",
    date: "16 January, 2026",
    author: "Admin",
    comments: "(03) Comments",
    href: "/blog",
  },
  {
    id: "daily-wellness",
    title: "Simple Tips For Daily Wellness of health",
    image:
      "https://html.vecurosoft.com/kliniko/demo/assets/img/blog/blog-h1-img2.jpg",
    date: "16 January, 2026",
    author: "Admin",
    comments: "(03) Comments",
    href: "/blog",
  },
  {
    id: "health-risks",
    title: "Understanding Common Health Risks",
    image:
      "https://html.vecurosoft.com/kliniko/demo/assets/img/blog/blog-h1-img3.jpg",
    date: "16 January, 2026",
    author: "Admin",
    comments: "(03) Comments",
    href: "/blog",
  },
];

const EASE = [0.22, 1, 0.36, 1];

// ==========================================
// RICH TEXT FROM MONGODB
// ==========================================

function rich(value) {
  if (typeof value !== "string") return "";

  const html = value
    .replace(/&(?:nbsp|#160|#xA0);/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[\u200b-\u200d\ufeff]/g, "")
    .replace(/<p\b[^>]*>\s*<\/p>/gi, "")
    .replace(/<\/(?:p|div|h[1-6])\s*>\s*<(?:p|div|h[1-6])\b[^>]*>/gi, "<br>");

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
  }).trim();
}

function plain(html) {
  return sanitizeHtml(html || "", {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/\s+/g, " ")
    .trim();
}

// ==========================================
// SAFE LINKS AND CLOUDINARY IMAGES
// ==========================================

function safeUrl(value, fallback = "/blog", image = false) {
  if (typeof value !== "string") return fallback;

  const trimmed = value.trim();

  const markdown = /^\[[^\]]+\]\((https?:\/\/[^)]+)\)$/.exec(trimmed);

  const url = markdown ? markdown[1] : trimmed;

  if (url.startsWith("/") && !url.startsWith("//") && !/[\\\s"']/.test(url)) {
    return url;
  }

  try {
    const parsed = new URL(url);

    if (
      (image
        ? parsed.protocol === "https:"
        : ["https:", "http:"].includes(parsed.protocol)) &&
      !parsed.username &&
      !parsed.password
    ) {
      return url;
    }
  } catch {}

  return fallback;
}

// ==========================================
// DATE FORMAT WITHOUT HYDRATION ISSUES
// ==========================================

function formatDate(value, fallback) {
  if (typeof value !== "string" || !value.trim()) {
    return fallback;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());

  if (!match) return value;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    !months[month - 1] ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return fallback;
  }

  return `${day} ${months[month - 1]}, ${year}`;
}

// ==========================================
// SECTION MARK
// ==========================================

function SectionMark() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-[#139db3]"
    >
      {[45, -45].map((angle) => (
        <rect
          key={angle}
          x="12"
          y="1"
          width="8"
          height="30"
          rx="4"
          transform={`rotate(${angle} 16 16)`}
          stroke="currentColor"
          strokeWidth="2.7"
        />
      ))}

      <circle cx="16" cy="16" r="2" fill="currentColor" />
    </svg>
  );
}

// ==========================================
// ORIGINAL FRAMER MOTION HOVER ANIMATIONS
// ==========================================

const CARD = {
  rest: {
    y: 0,
    boxShadow: "0 0 0 rgba(16,30,80,0)",
  },
  hover: {
    y: -9,
    boxShadow: "0 22px 46px rgba(16,30,80,0.17)",
  },
};

const BODY = {
  rest: {
    backgroundColor: "#f0f7f3",
  },
  hover: {
    backgroundColor: "#101e50",
  },
};

const HEADING = {
  rest: {
    color: "#101e50",
    y: 0,
  },
  hover: {
    color: "#ffffff",
    y: -2,
  },
};

const META = {
  rest: {
    color: "#7b8085",
  },
  hover: {
    color: "#ffffff",
  },
};

// ==========================================
// DYNAMIC BLOG CARD
// ==========================================

function BlogCard({ post, index }) {
  const [imageError, setImageError] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  // Original working share logic
  const sharePost = async () => {
    const url = new URL(post.href, window.location.origin).href;

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: post.titleText,
          url,
        });
        return;
      }

      if (!navigator.clipboard?.writeText) {
        throw new Error("Sharing unavailable");
      }

      await navigator.clipboard.writeText(url);
      setShareMessage("Link copied");
    } catch (error) {
      if (error?.name === "AbortError") return;

      setShareMessage("Unable to share this article");
    }

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => setShareMessage(""), 2400);
  };

  return (
    // Scroll animation: stagger each saved article
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{
        once: true,
        amount: 0.12,
      }}
      transition={{
        duration: 0.65,
        delay: Math.min(index, 5) * 0.11,
        ease: EASE,
      }}
      className="h-full min-w-0"
    >
      <motion.article
        initial="rest"
        animate="rest"
        whileHover="hover"
        whileFocus="hover"
        tabIndex={0}
        variants={CARD}
        transition={{
          type: "spring",
          stiffness: 250,
          damping: 24,
        }}
        className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[21px] outline-none focus-visible:ring-2 focus-visible:ring-[#149db7] focus-visible:ring-offset-4"
      >
        {/* BLOG IMAGE */}
        <div className="relative aspect-[1.63] w-full shrink-0 overflow-hidden bg-[#b9d4db]">
          <motion.div
            variants={{
              rest: { scale: 1 },
              hover: { scale: 1.075 },
            }}
            transition={{
              duration: 0.7,
              ease: EASE,
            }}
            className="absolute inset-0"
          >
            {imageError ? (
              <div className="flex h-full items-center justify-center bg-[#d6e9e9] px-4 text-center text-sm font-medium text-[#101e50]">
                Photo unavailable
              </div>
            ) : (
              <Image
                src={post.image}
                alt={post.titleText}
                fill
                unoptimized
                sizes="(min-width: 1280px) 32vw, (min-width: 640px) 47vw, 100vw"
                priority={index === 0}
                className="object-cover object-center"
                onError={() => setImageError(true)}
              />
            )}
          </motion.div>

          {/* IMAGE HOVER OVERLAY */}
          <motion.div
            aria-hidden="true"
            variants={{
              rest: { opacity: 0 },
              hover: { opacity: 0.11 },
            }}
            transition={{ duration: 0.45 }}
            className="pointer-events-none absolute inset-0 bg-[#101e50]"
          />

          {/* DYNAMIC DATE BADGE */}
          <motion.div
            variants={{
              rest: {
                backgroundColor: "#ffffff",
                color: "#7b8085",
              },
              hover: {
                backgroundColor: "#101e50",
                color: "#ffffff",
              },
            }}
            transition={{ duration: 0.35 }}
            className="absolute bottom-0 left-6 z-10 flex h-[45px] min-w-[176px] items-center justify-center rounded-t-[21px] border-b-2 border-[#139db3] px-5 text-[14px] font-medium sm:left-[30px] sm:text-[15px]"
          >
            {post.date}
          </motion.div>
        </div>

        {/* CARD BODY */}
        <motion.div
          variants={BODY}
          transition={{
            duration: 0.42,
            ease: "easeInOut",
          }}
          className="flex min-h-[250px] flex-1 flex-col px-6 pt-[29px] pb-[30px] sm:px-[30px] lg:min-h-[265px] lg:px-[32px]"
        >
          {/* META DETAILS */}
          <motion.div
            variants={META}
            transition={{ duration: 0.32 }}
            className="flex flex-wrap items-center gap-x-7 gap-y-2 text-[14px] font-medium sm:text-[15px]"
          >
            <span className="inline-flex items-center gap-[11px]">
              <UserRound
                size={18}
                strokeWidth={2.6}
                fill="currentColor"
                aria-hidden="true"
              />

              <span
                dangerouslySetInnerHTML={{
                  __html: post.authorHtml,
                }}
              />
            </span>

            {/* Show comment count only if saved */}
            {post.comments && (
              <span className="inline-flex items-center gap-[11px]">
                <MessageCircle
                  size={19}
                  strokeWidth={2.6}
                  fill="currentColor"
                  aria-hidden="true"
                />

                {post.comments}
              </span>
            )}
          </motion.div>

          {/* ANIMATED BLOG TITLE */}
          <motion.h3
            variants={HEADING}
            transition={{ duration: 0.34 }}
            className="mt-[22px] text-[clamp(21px,1.65vw,30px)] leading-[1.34] font-bold tracking-[-0.02em]"
          >
            <Link
              href={post.href}
              className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#139db3]"
            >
              <motion.span
                initial={false}
                variants={{
                  rest: {
                    backgroundSize: "0% 2px",
                  },
                  hover: {
                    backgroundSize: "100% 2px",
                  },
                }}
                transition={{
                  duration: 0.4,
                  ease: "easeOut",
                }}
                style={{
                  backgroundImage:
                    "linear-gradient(currentColor, currentColor)",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "left bottom",
                  boxDecorationBreak: "clone",
                  WebkitBoxDecorationBreak: "clone",
                  paddingBottom: "4px",
                }}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: post.titleHtml,
                  }}
                />
              </motion.span>
            </Link>
          </motion.h3>

          {/* READ MORE + SHARE */}
          <div className="mt-auto flex items-center justify-between gap-4 pt-[28px]">
            <motion.div
              whileHover={{
                y: -3,
                scale: 1.035,
              }}
              whileTap={{ scale: 0.96 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            >
              <Link
                href={post.href}
                className="relative inline-flex min-h-[43px] min-w-[151px] items-center justify-center overflow-hidden rounded-full bg-[#159db3] px-6 text-[15px] font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#101e50]"
              >
                <motion.span
                  aria-hidden="true"
                  variants={{
                    rest: { opacity: 0 },
                    hover: { opacity: 1 },
                  }}
                  transition={{ duration: 0.35 }}
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#6556ed] via-[#367dd7] to-[#139db3]"
                />

                <span className="relative z-10">Read More</span>
              </Link>
            </motion.div>

            {/* SHARE BUTTON */}
            <motion.button
              type="button"
              onClick={sharePost}
              aria-label={`Share ${post.titleText}`}
              whileHover={{
                rotate: 10,
                scale: 1.12,
              }}
              whileTap={{ scale: 0.91 }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 18,
              }}
              className="relative flex h-[42px] w-[42px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[11px] bg-[#101e50] text-white outline-none focus-visible:ring-2 focus-visible:ring-[#139db3] focus-visible:ring-offset-2"
            >
              <motion.span
                aria-hidden="true"
                variants={{
                  rest: { opacity: 0 },
                  hover: { opacity: 1 },
                }}
                transition={{ duration: 0.35 }}
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#6455ed] via-[#377ed7] to-[#129cb3]"
              />

              <Share2
                size={18}
                strokeWidth={2.6}
                fill="currentColor"
                aria-hidden="true"
                className="relative z-10"
              />
            </motion.button>
          </div>
        </motion.div>
      </motion.article>

      {/* SHARE FEEDBACK */}
      <span className="sr-only" aria-live="polite" role="status">
        {shareMessage}
      </span>
    </motion.div>
  );
}

// ==========================================
// MAIN BLOG & NEWS COMPONENT
// ==========================================

export default function KlinikoBlogNews({ data = {}, cards = [] }) {
  // SECTION HEADING FROM MONGODB
  const badge = rich(data?.badge?.en || "Blog & News");

  const title = rich(
    data?.title?.en || "Our Most Latest Health<br>News & Articles",
  );

  // ========================================
  // MONGODB POSTS WITH STATIC FALLBACK
  // ========================================

  const posts = useMemo(() => {
    const saved = Array.isArray(cards)
      ? cards.filter(
          (card) =>
            card && typeof card === "object" && (card.title?.en || card.image),
        )
      : [];

    const source = saved.length ? saved : DEFAULT_POSTS;

    return source.map((card, index) => {
      const fallback = DEFAULT_POSTS[index % DEFAULT_POSTS.length];

      const titleHtml = rich(card.title?.en ?? card.title ?? fallback.title);

      return {
        id: card.id || `blog-${index}`,

        titleHtml,

        titleText: plain(titleHtml),

        authorHtml: rich(card.author?.en ?? card.author ?? fallback.author),

        date: formatDate(card.date, fallback.date),

        image: safeUrl(card.image, fallback.image, true),

        href: safeUrl(card.link ?? card.href, fallback.href),

        // No invented comment count for saved posts
        comments: saved.length ? card.comments || "" : fallback.comments,
      };
    });
  }, [cards]);

  return (
    <section
      aria-labelledby="kliniko-blog-news-title"
      className="relative overflow-hidden bg-white pt-[42px] pb-[95px] sm:pt-[50px] sm:pb-[110px]"
    >
      <div className="mx-auto w-full max-w-[1540px] px-6 sm:px-10 lg:px-12 2xl:px-6">
        {/* ANIMATED SECTION HEADING */}
        <motion.div
          initial={{
            opacity: 0,
            y: 22,
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
            duration: 0.68,
            ease: EASE,
          }}
          className="mx-auto max-w-[890px] text-center"
        >
          {/* SECTION BADGE */}
          <div className="flex items-center justify-center gap-3">
            <SectionMark />

            <span
              className="text-[19px] leading-none font-semibold text-[#101e50] sm:text-[22px]"
              dangerouslySetInnerHTML={{
                __html: badge,
              }}
            />

            <SectionMark />
          </div>

          {/* SECTION TITLE */}
          <h2
            id="kliniko-blog-news-title"
            className="mx-auto mt-[29px] text-[clamp(2.2rem,3.3vw,3.5rem)] leading-[1.15] font-bold tracking-[-0.025em] text-[#101e50]"
            dangerouslySetInnerHTML={{
              __html: title,
            }}
          />
        </motion.div>

        {/* THREE-COLUMN BLOG GRID  */}
        <div className="mt-[54px] grid grid-cols-1 items-stretch gap-[30px] sm:mt-[57px] sm:grid-cols-2 lg:mt-[53px] lg:grid-cols-3">
          {posts.map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
