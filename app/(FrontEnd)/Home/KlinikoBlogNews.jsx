"use client";

import { MessageCircle, Share2, UserRound } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ==========================================
// STATIC BLOG DATA
// ==========================================

const POSTS = [
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
      <rect
        x="12"
        y="1"
        width="8"
        height="30"
        rx="4"
        transform="rotate(45 16 16)"
        stroke="currentColor"
        strokeWidth="2.7"
      />

      <rect
        x="12"
        y="1"
        width="8"
        height="30"
        rx="4"
        transform="rotate(-45 16 16)"
        stroke="currentColor"
        strokeWidth="2.7"
      />

      <circle cx="16" cy="16" r="2" fill="currentColor" />
    </svg>
  );
}

// ==========================================
// FRAMER MOTION VARIANTS
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
// ANIMATED BLOG CARD
// ==========================================

function BlogCard({ post, index }) {
  const [imageError, setImageError] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // ========================================
  // WORKING SHARE FUNCTION
  // ========================================

  const sharePost = async () => {
    const url = new URL(post.href, window.location.origin).href;

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: post.title,
          url,
        });

        return;
      }

      if (!navigator.clipboard?.writeText) {
        throw new Error("Sharing is unavailable");
      }

      await navigator.clipboard.writeText(url);
      setShareMessage("Link copied");
    } catch (error) {
      if (error?.name === "AbortError") return;

      setShareMessage("Unable to share this article");
    }

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setShareMessage("");
    }, 2400);
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 32,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.12,
      }}
      transition={{
        duration: 0.65,
        delay: index * 0.11,
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
        {/* ====================================
            BLOG IMAGE
        ==================================== */}

        <div className="relative aspect-[1.63] w-full shrink-0 overflow-hidden bg-[#b9d4db]">
          {/* IMAGE ZOOM ANIMATION */}
          <motion.div
            variants={{
              rest: {
                scale: 1,
              },
              hover: {
                scale: 1.075,
              },
            }}
            transition={{
              duration: 0.7,
              ease: EASE,
            }}
            className="absolute inset-0"
          >
            {imageError ? (
              <div className="flex h-full items-center justify-center bg-[#d6e9e9] px-4 text-center text-sm font-medium text-[#101e50]">
                Photo not found: {post.image}
              </div>
            ) : (
              <Image
                src={post.image}
                alt={post.title}
                fill
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
              rest: {
                opacity: 0,
              },
              hover: {
                opacity: 0.11,
              },
            }}
            transition={{
              duration: 0.45,
            }}
            className="pointer-events-none absolute inset-0 bg-[#101e50]"
          />

          {/* ====================================
              DATE BADGE
          ==================================== */}

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
            transition={{
              duration: 0.35,
            }}
            className="absolute bottom-0 left-6 z-10 flex h-[45px] min-w-[176px] items-center justify-center rounded-t-[21px] border-b-2 border-[#139db3] px-5 text-[14px] font-medium sm:left-[30px] sm:text-[15px]"
          >
            {post.date}
          </motion.div>
        </div>

        {/* ====================================
            ANIMATED CARD BODY
        ==================================== */}

        <motion.div
          variants={BODY}
          transition={{
            duration: 0.42,
            ease: "easeInOut",
          }}
          className="flex min-h-[250px] flex-1 flex-col px-6 pt-[29px] pb-[30px] sm:px-[30px] lg:min-h-[265px] lg:px-[32px]"
        >
          {/* ====================================
              META DATA
          ==================================== */}

          <motion.div
            variants={META}
            transition={{
              duration: 0.32,
            }}
            className="flex flex-wrap items-center gap-x-7 gap-y-2 text-[14px] font-medium sm:text-[15px]"
          >
            {/* AUTHOR */}
            <span className="inline-flex items-center gap-[11px]">
              <UserRound
                size={18}
                strokeWidth={2.6}
                fill="currentColor"
                aria-hidden="true"
              />

              {post.author}
            </span>

            {/* COMMENTS */}
            <span className="inline-flex items-center gap-[11px]">
              <MessageCircle
                size={19}
                strokeWidth={2.6}
                fill="currentColor"
                aria-hidden="true"
              />

              {post.comments}
            </span>
          </motion.div>

          {/* ====================================
    ANIMATED BLOG TITLE WITH UNDERLINE
==================================== */}

          <motion.h3
            variants={HEADING}
            transition={{
              duration: 0.34,
            }}
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
                {post.title}
              </motion.span>
            </Link>
          </motion.h3>

          {/* ====================================
              READ MORE AND SHARE BUTTON
          ==================================== */}

          <div className="mt-auto flex items-center justify-between gap-4 pt-[28px]">
            {/* READ MORE */}
            <motion.div
              whileHover={{
                y: -3,
                scale: 1.035,
              }}
              whileTap={{
                scale: 0.96,
              }}
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
                {/* PURPLE / BLUE / TEAL GRADIENT */}
                <motion.span
                  aria-hidden="true"
                  variants={{
                    rest: {
                      opacity: 0,
                    },
                    hover: {
                      opacity: 1,
                    },
                  }}
                  transition={{
                    duration: 0.35,
                  }}
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#6556ed] via-[#367dd7] to-[#139db3]"
                />

                <span className="relative z-10">Read More</span>
              </Link>
            </motion.div>

            {/* SHARE BUTTON */}
            <motion.button
              type="button"
              onClick={sharePost}
              aria-label={`Share ${post.title}`}
              whileHover={{
                rotate: 10,
                scale: 1.12,
              }}
              whileTap={{
                scale: 0.91,
              }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 18,
              }}
              className="relative flex h-[42px] w-[42px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[11px] bg-[#101e50] text-white outline-none focus-visible:ring-2 focus-visible:ring-[#139db3] focus-visible:ring-offset-2"
            >
              {/* ANIMATED SHARE GRADIENT */}
              <motion.span
                aria-hidden="true"
                variants={{
                  rest: {
                    opacity: 0,
                  },
                  hover: {
                    opacity: 1,
                  },
                }}
                transition={{
                  duration: 0.35,
                }}
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
// MAIN BLOG & NEWS SECTION
// ==========================================

export default function KlinikoBlogNews() {
  return (
    <section
      aria-labelledby="kliniko-blog-news-title"
      className="relative overflow-hidden bg-white pt-[42px] pb-[95px] sm:pt-[50px] sm:pb-[110px]"
    >
      {/* EXACT SAME CONTAINER AS HERO */}
      <div className="mx-auto w-full max-w-[1540px] px-6 sm:px-10 lg:px-12 2xl:px-6">
        {/* ====================================
            CENTERED HEADING
        ==================================== */}

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
          {/* SMALL SECTION LABEL */}
          <div className="flex items-center justify-center gap-3">
            <SectionMark />

            <span className="text-[19px] leading-none font-semibold text-[#101e50] sm:text-[22px]">
              Blog &amp; News
            </span>

            <SectionMark />
          </div>

          {/* MAIN TITLE */}
          <h2
            id="kliniko-blog-news-title"
            className="mx-auto mt-[29px] text-[clamp(2.2rem,3.3vw,3.5rem)] leading-[1.15] font-bold tracking-[-0.025em] text-[#101e50]"
          >
            Our Most Latest Health
            <span className="block">News &amp; Articles</span>
          </h2>
        </motion.div>

        {/* ====================================
            RESPONSIVE BLOG CARDS
        ==================================== */}

        <div className="mt-[54px] grid grid-cols-1 items-stretch gap-[30px] sm:mt-[57px] sm:grid-cols-2 lg:mt-[53px] lg:grid-cols-3">
          {POSTS.map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
