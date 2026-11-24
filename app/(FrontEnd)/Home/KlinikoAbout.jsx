import Image from "next/image";
import Link from "next/link";
import sanitizeHtml from "sanitize-html";

// ==========================================
// DEFAULT CONTENT
// ==========================================

const ABOUT = {
  subtitle: "About Kliniko",
  title: "Delivering Trusted Medical Care With Precision",
  buttonText: "Read More",
  buttonHref: "/about",
  experience: "25+",
  experienceText: "Years Of Experience",
  description:
    "Kliniko Provides Advanced Medical Services, Expert Consultation, And Patient-Focused Care Designed To Uphold The Highest Standards In Modern Healthcare.",
};

// ==========================================
// DEFAULT IMAGES
// ==========================================

const IMAGES = {
  doctors:
    "https://html.vecurosoft.com/kliniko/demo/assets/img/about/about-img1-h1.jpg",

  stethoscope:
    "https://html.vecurosoft.com/kliniko/demo/assets/img/about/about-img2-h1.jpg",
};

const TITLE_ICON =
  "https://html.vecurosoft.com/kliniko/demo/assets/img/icons/title-icon.svg";

// ==========================================
// RICH TEXT SANITIZATION
// PRESERVE HTML BLOCKS
// ==========================================

function safeRichText(html, allowLinks = true) {
  const value = String(html ?? "")
    .replace(/&(?:nbsp|#160|#xA0);/gi, " ")
    .replace(/\u00A0/g, " ");

  return sanitizeHtml(value, {
    allowedTags: [
      "p",
      "div",
      "br",
      "span",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "sub",
      "sup",
      "ul",
      "ol",
      "li",
      "blockquote",
      ...(allowLinks ? ["a"] : []),
    ],

    allowedAttributes: {
      "*": ["style"],
      a: ["href", "title"],
    },

    allowedSchemes: ["http", "https", "mailto", "tel"],

    allowedStyles: {
      "*": {
        color: [/^#[a-f0-9]{3,8}$/i, /^rgba?\([\d\s,.%]+\)$/i],
        "background-color": [/^#[a-f0-9]{3,8}$/i, /^rgba?\([\d\s,.%]+\)$/i],
        "text-align": [/^(left|right|center|justify)$/],
      },
    },

    // Preserve block structure, but prevent
    // multiple semantic headings inside our
    // frontend heading container.
    transformTags: {
      h1: "p",
      h2: "p",
      h3: "p",
      h4: "p",
      h5: "p",
      h6: "p",
    },
  }).trim();
}

// ==========================================
// SAFE LINK
// ==========================================

function safeLink(value) {
  if (typeof value !== "string") {
    return "/about";
  }

  const link = value.trim();

  if (link.startsWith("/") && !link.startsWith("//") && !/[\\\s]/.test(link)) {
    return link;
  }

  try {
    const url = new URL(link);

    if (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    ) {
      return link;
    }
  } catch {
    // Invalid link.
  }

  return "/about";
}

// ==========================================
// SAFE IMAGE
// ==========================================

function safeImage(value, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }

  const src = value.trim();

  if (src.startsWith("/") && !src.startsWith("//") && !/[\\\s]/.test(src)) {
    return src;
  }

  try {
    const url = new URL(src);

    if (url.protocol === "https:" && !url.username && !url.password) {
      return src;
    }
  } catch {
    // Invalid image.
  }

  return fallback;
}

// ==========================================
// MAIN ABOUT COMPONENT
// SERVER COMPONENT
// ==========================================

export default function KlinikoAbout({ data = {} }) {
  const hasData =
    data && typeof data === "object" && Object.keys(data).length > 0;

  // ========================================
  // MONGODB CONTENT
  // ========================================

  const subtitle = safeRichText(hasData ? data.badge?.en : ABOUT.subtitle);

  const title = safeRichText(hasData ? data.title?.en : ABOUT.title);

  const description = safeRichText(
    hasData ? data.description?.en : ABOUT.description,
  );

  const buttonText = safeRichText(
    hasData ? data.buttonText?.en : ABOUT.buttonText,
    false,
  );

  const experience = safeRichText(
    hasData ? data.experienceNumber?.en : ABOUT.experience,
  );

  const experienceText = safeRichText(
    hasData ? data.experienceLabel?.en : ABOUT.experienceText,
  );

  const buttonHref = safeLink(hasData ? data.buttonLink : ABOUT.buttonHref);

  const leftImage = safeImage(data?.Left, IMAGES.doctors);

  const rightImage = safeImage(data?.RightImage, IMAGES.stethoscope);

  const showExperience = Boolean(experience || experienceText);

  // ========================================
  // JSX — ORIGINAL DESIGN
  // ========================================

  return (
    <section
      aria-labelledby="about-kliniko-title"
      className="w-full overflow-hidden bg-white py-[52px] sm:py-[65px] lg:py-[75px] xl:py-[52px]"
    >
      {/* MAIN CONTAINER */}
      <div className="mx-auto w-full max-w-[1540px] px-6 sm:px-10 lg:px-12 2xl:px-6">
        {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 items-stretch gap-12 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] xl:gap-[clamp(35px,4.5vw,80px)]">
          {/* LEFT COLUMN */}
          <div className="flex min-w-0 flex-col">
            {/* SUBTITLE */}
            {subtitle && (
              <div className="flex min-w-0 items-center gap-[18px]">
                <Image
                  src={TITLE_ICON}
                  alt=""
                  width={32}
                  height={32}
                  unoptimized
                  className="h-[30px] w-[30px] shrink-0 object-contain"
                />

                <div
                  className="kliniko-about-rich min-w-0 text-[21px] leading-tight font-semibold text-[#101e50] sm:text-[24px]"
                  dangerouslySetInnerHTML={{
                    __html: subtitle,
                  }}
                />
              </div>
            )}

            {/* MAIN TITLE */}
            <div
              id="about-kliniko-title"
              role="heading"
              aria-level={2}
              className="kliniko-about-rich mt-[34px] w-full max-w-[850px] min-w-0 text-[clamp(36px,3.6vw,64px)] leading-[1.27] font-bold tracking-[-0.025em] text-[#111e50]"
              dangerouslySetInnerHTML={{
                __html: title,
              }}
            />

            {/* READ MORE BUTTON */}
            {buttonText && (
              <div className="mt-[56px] sm:mt-[60px]">
                <Link
                  href={buttonHref}
                  className="inline-flex h-[64px] max-w-full min-w-[190px] items-center justify-center rounded-full bg-[#159db2] px-9 text-[17px] font-semibold text-white transition-colors duration-200 hover:bg-[#0d8298] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#159db2] sm:h-[78px] sm:min-w-[270px] sm:text-[22px]"
                >
                  <div
                    className="kliniko-about-rich text-center"
                    dangerouslySetInnerHTML={{
                      __html: buttonText,
                    }}
                  />
                </Link>
              </div>
            )}

            {/* BOTTOM IMAGES */}
            <div
              className={`mt-[55px] grid items-end gap-3 sm:gap-6 xl:mt-auto xl:gap-[32px] ${
                showExperience
                  ? "grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"
                  : "grid-cols-1"
              }`}
            >
              {/* EXPERIENCE CARD */}
              {showExperience && (
                <div className="flex aspect-[0.965] min-w-0 flex-col items-center justify-center rounded-[20px] bg-[#111e50] px-2 py-5 text-center text-white sm:px-4">
                  {/* EXPERIENCE NUMBER */}
                  {experience && (
                    <div
                      className="kliniko-about-rich w-full min-w-0 bg-gradient-to-r from-[#6254ec] via-[#377bdb] to-[#0fb1b8] bg-clip-text text-[clamp(39px,5.2vw,94px)] leading-none font-bold tracking-[-0.045em] text-transparent"
                      dangerouslySetInnerHTML={{
                        __html: experience,
                      }}
                    />
                  )}

                  {/* EXPERIENCE LABEL */}
                  {experienceText && (
                    <div
                      className="kliniko-about-rich mt-5 w-full max-w-[190px] min-w-0 text-[clamp(12px,1.6vw,27px)] leading-[1.35] font-bold text-white sm:mt-6"
                      dangerouslySetInnerHTML={{
                        __html: experienceText,
                      }}
                    />
                  )}
                </div>
              )}

              {/* LEFT IMAGE */}
              <div className="relative aspect-[1.57] min-w-0 overflow-hidden rounded-[23px] bg-[#eef5f7]">
                <Image
                  src={leftImage}
                  alt="Professional medical team at Kliniko"
                  fill
                  unoptimized
                  sizes="(max-width: 639px) 100vw, (max-width: 1279px) 62vw, 540px"
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex min-w-0 flex-col">
            {/* RIGHT IMAGE */}
            <div className="relative aspect-[1.12] w-full overflow-hidden rounded-[28px] bg-[#e5f1f5]">
              <Image
                src={rightImage}
                alt="Stethoscope and medical documents representing trusted healthcare"
                fill
                unoptimized
                sizes="(max-width: 1279px) 100vw, (max-width: 1535px) 40vw, 620px"
                className="object-cover object-center"
              />
            </div>

            {/* DESCRIPTION */}
            {description && (
              <div
                className="kliniko-about-rich kliniko-about-description mt-[39px] w-full min-w-0 text-[17px] leading-[1.75] font-normal text-[#7c7c7c] sm:text-[19px] xl:text-[20px] 2xl:text-[21px]"
                dangerouslySetInnerHTML={{
                  __html: description,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
