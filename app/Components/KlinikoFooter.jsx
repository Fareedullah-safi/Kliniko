"use client";

import { useKlinikoLanguage } from "@/app/Components/Admin/Kliniko/KlinikoLanguageProvider";
import { Headphones, Mail, MapPinned } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

const FOOTER_API = "/api/kliniko/footer?public=1";

const NAVBAR_API = "/api/navbar?public=1";

// Keep the original molecular background.
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
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, 9],
  [9, 10],
  [0, 11],
  [1, 12],
  [2, 12],
  [2, 13],
  [4, 13],
  [4, 14],
  [6, 14],
  [6, 15],
  [8, 16],
  [8, 17],
  [10, 17],
  [11, 12],
  [11, 18],
  [12, 13],
  [13, 14],
  [13, 19],
  [14, 15],
  [15, 16],
  [15, 20],
  [16, 17],
  [17, 21],
  [18, 19],
  [19, 20],
  [20, 21],
];

function MoleculePattern({ className }) {
  return (
    <svg
      viewBox="0 0 850 500"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g stroke="#3974A7" strokeWidth="3" strokeOpacity="0.38">
        {EDGES.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={NODES[a][0]}
            y1={NODES[a][1]}
            x2={NODES[b][0]}
            y2={NODES[b][1]}
          />
        ))}
      </g>

      <g fill="#3974A7" fillOpacity="0.43">
        {NODES.map(([x, y, radius]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={radius} />
        ))}
      </g>
    </svg>
  );
}

function KlinikoLogo() {
  return (
    <svg
      viewBox="0 0 277 67"
      aria-hidden="true"
      className="h-auto w-[240px] max-w-full sm:w-[265px]"
    >
      <path
        fill="#FFFFFF"
        fillRule="evenodd"
        d="M185,23 183,25 183,55 185,57 188,57 190,54 190,26 188,23Z M131,23 129,25 129,55 131,57 133,57 135,56 135,24 134,23Z M170,24 165,22 160,22 159,23 157,23 152,27 149,23 146,23 144,26 144,54 146,57 149,57 151,55 151,34 152,32 157,28 162,28 166,31 167,33 167,55 169,57 172,57 174,54 174,34 173,33 173,29Z M248,21 247,22 242,23 237,27 234,33 233,41 234,42 235,48 239,53 242,55 244,55 248,57 253,57 254,56 259,55 264,51 267,46 268,36 267,35 266,30 262,25 257,22Z M248,27 253,27 255,28 261,35 261,43 260,45 256,49 251,51 245,49 241,45 241,43 240,42 240,35 241,33Z M71,12 69,14 69,56 71,57 75,56 76,54 76,43 82,37 84,38 98,57 103,56 104,54 103,53 103,51 88,32 88,31 103,17 103,13 102,12 99,12 77,34 76,33 76,15 75,13Z M184,11 183,12 183,16 184,17 189,17 190,16 190,12 189,11Z M130,11 129,12 129,17 135,17 136,13 134,11Z M117,9 114,9 112,11 112,55 115,57 118,55 118,10Z"
      />
      <path
        fill="#159AAF"
        fillRule="evenodd"
        d="M40,50 39,49 35,51 32,51 27,54 25,54 25,58 38,58 40,55Z M251,32 246,34 245,36 245,43 248,46 252,46 254,45 256,41 256,37 255,35Z M201,9 199,12 199,53 202,57 204,57 207,53 207,46 210,43 223,56 225,57 227,56 229,53 228,51 216,38 227,27 227,24 225,22 221,23 208,36 207,35 207,12 205,9Z M38,5 21,5 19,7 19,20 18,21 5,21 3,23 3,40 4,41 18,41 19,40 19,37 21,32 26,26 31,23 33,23 40,20 40,8Z"
      />
      <path
        fill="#5959EB"
        fillRule="evenodd"
        d="M54,17 48,21 33,25 29,27 24,32 21,39 21,46 20,47 20,49 21,50 21,56 23,61 23,58 22,57 22,50 23,49 24,44 28,40 29,42 26,46 25,51 28,46 31,49 42,46 49,40 52,35 53,29 54,28 54,19 55,18Z M31,38 32,39 29,41 28,40Z M32,37 33,36 34,37 33,38Z"
      />
    </svg>
  );
}

async function readApi(url, signal) {
  const response = await fetch(url, {
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}.`);
  }

  const result = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.message || `Could not load ${url}.`);
  }

  return result.data;
}

// Run after fetching. Convert rich-editor HTML to plain text once,
// so a heading, email address, or placeholder never shows HTML tags.
function editorText(value) {
  if (typeof value !== "string" || !value.trim()) return "";

  const template = document.createElement("template");

  template.innerHTML = value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|li|h[1-6])>/gi, "$&\n");

  return (template.content.textContent || "").replace(/\u00a0/g, " ").trim();
}

function readTextField(value) {
  if (typeof value === "string") return editorText(value);
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).map(([code, text]) => [code, editorText(text)]),
  );
}

function translate(value, language, defaultLanguage, fallback = "") {
  if (typeof value === "string") return value || fallback;

  return value?.[language] || value?.[defaultLanguage] || value?.en || fallback;
}

function FooterHeading({ children }) {
  return (
    <div className="mb-7">
      <h3 className="text-[24px] leading-[1.2] font-bold text-white sm:text-[26px] lg:text-[27px]">
        {children}
      </h3>
      <div className="mt-[18px] h-[2px] w-[96px] bg-[#14A0B6]" />
    </div>
  );
}

function ContactItem({ icon: Icon, label, value, href, address = false }) {
  if (!value) return null;

  return (
    <div className="flex min-w-0 items-center gap-4 sm:gap-5 lg:gap-[21px]">
      <motion.div
        initial={false}
        whileHover={{ y: -4, rotate: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-[10px] bg-[#101E50] text-white sm:h-[86px] sm:w-[86px] xl:h-[92px] xl:w-[92px]"
      >
        <Icon
          size={39}
          fill={address ? "currentColor" : "none"}
          strokeWidth={address ? 1.8 : 2.5}
          aria-hidden="true"
        />
      </motion.div>

      <div className="min-w-0">
        {label && (
          <p className="mb-[5px] text-[12px] font-semibold sm:text-[13px]">
            {label}
          </p>
        )}

        {href ? (
          <a
            href={href}
            dir="ltr"
            className="inline-block text-[16px] leading-[1.45] font-bold break-all text-white transition-colors hover:text-[#C7F5FB] sm:text-[17px] xl:text-[18px]"
          >
            {value}
          </a>
        ) : (
          <p className="max-w-[260px] text-[18px] leading-[1.4] font-bold whitespace-pre-line sm:text-[21px] xl:text-[23px]">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

function FooterLinkColumn({ title, links, rtl }) {
  if (links.length === 0) return null;

  return (
    <nav aria-label={title} className="min-w-0">
      <FooterHeading>{title}</FooterHeading>

      <ul className="flex flex-col items-start gap-[13px]">
        {links.map((item) => (
          <li key={item.id}>
            <motion.div
              initial={false}
              whileHover={{ x: rtl ? -6 : 6 }}
              transition={{ type: "spring", stiffness: 320, damping: 23 }}
            >
              <Link
                href={item.href}
                className="text-[15px] leading-[1.45] font-medium text-[#F3F5FB] transition-colors hover:text-[#39C6D8] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#39C6D8] sm:text-[16px]"
              >
                {item.title}
              </Link>
            </motion.div>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function KlinikoFooter({ onNewsletterSubscribe }) {
  const { language, defaultLanguage, direction } = useKlinikoLanguage();

  const [content, setContent] = useState({});
  const [cards, setCards] = useState([]);
  const [newsletterState, setNewsletterState] = useState({
    status: "idle",
    message: "",
  });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    // Each request can succeed independently.
    async function loadContent() {
      try {
        const data = await readApi(FOOTER_API, signal);
        const saved = data.content || {};
        const nextContent = {};

        for (const [key, value] of Object.entries(saved)) {
          if (key === "logo") {
            nextContent.logo =
              typeof value === "string" ? value : value?.url || "";
          } else {
            nextContent[key] = readTextField(value);
          }
        }

        if (!signal.aborted) setContent(nextContent);
      } catch (error) {
        if (!signal.aborted) console.error("Footer content:", error);
      }
    }

    async function loadNavbarLinks() {
      try {
        const data = await readApi(NAVBAR_API, signal);
        const savedCards = Array.isArray(data.cards) ? data.cards : [];

        const selected = savedCards.filter((card) => {
          const enabled =
            card?.showInFooter === true || card?.showInFooter === "true";

          return (
            enabled &&
            typeof card.link === "string" &&
            /^\/(?!\/)[^\s\\]*$/.test(card.link)
          );
        });

        if (!signal.aborted) setCards(selected);
      } catch (error) {
        if (!signal.aborted) console.error("Footer navbar links:", error);
      }
    }

    void loadContent();
    void loadNavbarLinks();

    return () => controller.abort();
  }, []);

  function field(key, fallback = "") {
    return translate(content[key], language, defaultLanguage, fallback);
  }

  const links = cards
    .map((card) => ({
      id: card.id,
      href: card.link,
      title: translate(card.label, language, defaultLanguage),
    }))
    .filter((link) => link.title);

  // Example: [A, B, C, D, E] becomes [A, B, C] and [D, E].
  const middle = Math.ceil(links.length / 2);
  const services = links.slice(0, middle);
  const usefulLinks = links.slice(middle);

  const brand = field("brand", "Kliniko");
  const address = field("address");
  const email = field("email");
  const phone = field("phone");
  const description = field("description");
  const newsletterDescription = field("newsletterDescription");
  const emailPlaceholder = field("newsletterPlaceholder", "Email Address");
  const isSubmitting = newsletterState.status === "loading";

  const desktopGrid = usefulLinks.length
    ? "lg:grid-cols-[1.52fr_0.82fr_0.77fr_1.22fr]"
    : services.length
      ? "lg:grid-cols-[1.52fr_0.82fr_1.22fr]"
      : "lg:grid-cols-[1.52fr_1.22fr]";

  async function handleNewsletter(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const subscriberEmail = new FormData(form).get("email")?.toString().trim();

    if (!subscriberEmail || isSubmitting) return;

    if (typeof onNewsletterSubscribe !== "function") {
      setNewsletterState({
        status: "info",
        message: "Newsletter signup is not connected yet.",
      });
      return;
    }

    setNewsletterState({ status: "loading", message: "" });

    try {
      const result = await onNewsletterSubscribe(subscriberEmail);

      if (result?.success === false) {
        throw new Error(result.message || "Subscription was unsuccessful.");
      }

      form.reset();
      setNewsletterState({
        status: "success",
        message: "Your subscription request has been received.",
      });
    } catch (error) {
      setNewsletterState({
        status: "error",
        message: error?.message || "Unable to subscribe right now.",
      });
    }
  }

  return (
    <footer
      dir={direction}
      className="relative isolate overflow-hidden bg-[#101E50] text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <MoleculePattern className="absolute top-[120px] -left-[260px] h-[580px] w-[900px] opacity-[0.34]" />
        <MoleculePattern className="absolute -top-[135px] -right-[230px] h-[670px] w-[1030px] rotate-180 opacity-[0.25]" />
        <MoleculePattern className="absolute bottom-[-200px] left-[24%] h-[570px] w-[850px] opacity-[0.13]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1540px] px-6 pt-[75px] sm:px-10 sm:pt-[90px] lg:px-12 lg:pt-[112px] 2xl:px-6">
        {(address || email || phone) && (
          <div className="relative overflow-hidden rounded-[21px] bg-[#189CAF] px-5 py-7 sm:px-8 sm:py-9 lg:px-[42px] lg:py-[41px]">
            <div className="relative grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-[1.15fr_1.15fr_1fr] lg:items-center">
              <ContactItem icon={MapPinned} value={address} address />

              <ContactItem
                icon={Mail}
                label={field("emailLabel", "Email Address")}
                value={email}
                href={email ? `mailto:${email}` : undefined}
              />

              <ContactItem
                icon={Headphones}
                label={field("phoneLabel", "Call Anytime")}
                value={phone}
                href={phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : undefined}
              />
            </div>
          </div>
        )}

        <div
          className={`grid grid-cols-1 gap-x-9 gap-y-12 pt-[77px] pb-[84px] sm:grid-cols-2 lg:gap-x-[44px] lg:pt-[82px] lg:pb-[100px] ${desktopGrid}`}
        >
          <div className="min-w-0">
            <Link
              href="/"
              aria-label={`${brand} home`}
              className="inline-block max-w-full rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2DBFD0]"
            >
              {content.logo ? (
                <img
                  src={content.logo}
                  alt={brand}
                  className="h-auto max-h-[90px] w-auto max-w-[min(280px,100%)] object-contain"
                />
              ) : brand === "Kliniko" ? (
                <KlinikoLogo />
              ) : (
                <span className="text-4xl font-bold">{brand}</span>
              )}
            </Link>

            {description && (
              <p className="mt-[25px] max-w-[365px] text-[15px] leading-[1.8] font-medium whitespace-pre-line text-[#E9EEFB] sm:text-[16px]">
                {description}
              </p>
            )}
          </div>

          <FooterLinkColumn
            title={field("servicesTitle", "Our Services")}
            links={services}
            rtl={direction === "rtl"}
          />

          <FooterLinkColumn
            title={field("linksTitle", "Useful Links")}
            links={usefulLinks}
            rtl={direction === "rtl"}
          />

          <div className="min-w-0">
            <FooterHeading>
              {field("newsletterTitle", "Newsletter")}
            </FooterHeading>

            {newsletterDescription && (
              <p className="mb-5 text-[15px] font-medium text-[#F0F4FC] sm:text-[16px]">
                {newsletterDescription}
              </p>
            )}

            <form
              onSubmit={handleNewsletter}
              className="flex flex-col items-start gap-[15px]"
            >
              <label htmlFor="footer-newsletter-email" className="sr-only">
                {emailPlaceholder}
              </label>

              <input
                id="footer-newsletter-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                maxLength={254}
                placeholder={emailPlaceholder}
                className="h-[52px] w-full rounded-[10px] border-[1.5px] border-[#159FB4] bg-[#2C3C66] px-[25px] text-[15px] font-medium text-white outline-none placeholder:text-white focus:border-[#4CCBDB] focus:ring-2 focus:ring-[#159FB4]/25"
              />

              <motion.button
                type="submit"
                disabled={isSubmitting}
                initial={false}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 330, damping: 23 }}
                className="group relative inline-flex min-h-12 items-center justify-center overflow-hidden rounded-[11px] bg-[#159FB4] px-7 text-[15px] font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-60"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#6255EC] via-[#327BD9] to-[#139DB3] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
                />
                <span className="relative">
                  {isSubmitting
                    ? "Subscribing..."
                    : field("subscribeText", "Subscribe")}
                </span>
              </motion.button>

              {newsletterState.message && (
                <p
                  role="status"
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

      <div className="relative z-10 bg-[#2A3965]/80">
        <div className="mx-auto w-full max-w-[1540px] px-6 py-[26px] sm:px-10 lg:px-12 2xl:px-6">
          <p className="text-[14px] leading-[1.6] font-medium text-white sm:text-[15px]">
            Copyright © 2026{" "}
            <span className="font-bold text-[#20B2C5]">NetHub</span>. All Rights
            Reserved. Developed By{" "}
            <span className="font-bold text-[#20B2C5]">NetHub</span>.
          </p>
        </div>
      </div>
    </footer>
  );
}
