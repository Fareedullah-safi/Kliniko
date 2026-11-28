"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useKlinikoLanguage } from "@/app/Components/Admin/Kliniko/KlinikoLanguageProvider";

const DOCTOR_PROFILE_PATH = /^\/(?:our-doctors|doctors)\/[^/]+\/[^/]+$/;

function normalizePath(value) {
  if (typeof value !== "string") return "";

  const path = value.trim();

  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("#") ||
    path.includes("?")
  ) {
    return "";
  }

  return path.replace(/\/+$/, "") || "/";
}

function plainText(value) {
  if (typeof value !== "string") return "";

  return value
    .replace(/<br\b[^>]*>|<\/(?:p|div|h[1-6]|li)>/gi, " ")
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/&nbsp;|&#160;|\u00a0/gi, " ")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function getLabel(value, language, defaultLanguage) {
  if (typeof value === "string") return plainText(value);

  for (const code of [language, defaultLanguage, "en"]) {
    const label = plainText(value?.[code]);
    if (label) return label;
  }

  return "";
}

function getRouteTitle(path) {
  if (path === "/") return "Home";
  if (DOCTOR_PROFILE_PATH.test(path)) return "Doctor Details";

  const lastSegment = path.split("/").filter(Boolean).pop() || "";
  let name = lastSegment;

  try {
    name = decodeURIComponent(lastSegment);
  } catch {
    // A malformed URL can still display its original segment.
  }

  return name
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

export default function RouteBanner({ image, heading, navItems }) {
  const pathname = usePathname();
  const { language, defaultLanguage, direction } = useKlinikoLanguage();
  const [loadedItems, setLoadedItems] = useState([]);

  useEffect(() => {
    if (Array.isArray(navItems)) return;

    const controller = new AbortController();

    async function loadNavbar() {
      try {
        const response = await fetch("/api/navbar", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) return;

        const result = await response.json();
        const cards = result?.data?.cards;

        if (Array.isArray(cards) && !controller.signal.aborted) {
          setLoadedItems(cards);
        }
      } catch {
        // The banner can still display the route title.
      }
    }

    loadNavbar();

    return () => controller.abort();
  }, [navItems]);

  const cards = Array.isArray(navItems) ? navItems : loadedItems;
  const path = normalizePath(pathname);
  const isDoctorProfile = DOCTOR_PROFILE_PATH.test(path);

  // All doctor profiles share the label from the Doctor Details navbar item.
  const currentItem = cards.find((item) => {
    const link = normalizePath(item?.link);

    if (isDoctorProfile) return DOCTOR_PROFILE_PATH.test(link);

    return link !== "" && link === path;
  });

  const homeItem = cards.find((item) => normalizePath(item?.link) === "/");

  const breadcrumbTitle =
    getLabel(currentItem?.label, language, defaultLanguage) ||
    getRouteTitle(path);

  const bannerTitle =
    getLabel(heading, language, defaultLanguage) || breadcrumbTitle;

  const homeLabel =
    getLabel(homeItem?.label, language, defaultLanguage) || "Home";

  const imageUrl = typeof image === "string" ? image.trim() : "";

  return (
    <section
      dir={direction}
      aria-label={bannerTitle}
      className="relative isolate overflow-hidden bg-[#142653] text-white"
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(17,34,81,0.92)_0%,rgba(24,42,88,0.85)_55%,rgba(32,48,91,0.78)_100%)]"
      />

      <div className="mx-auto flex min-h-[230px] w-full max-w-[1540px] items-center px-6 py-12 sm:min-h-[300px] sm:px-10 sm:py-16 lg:min-h-[390px] lg:px-12 2xl:min-h-[460px] 2xl:px-6">
        <div className="min-w-0">
          <h1 className="max-w-[20ch] text-[clamp(3rem,calc(2.5rem_+_2vw),4rem)] leading-[1.1] font-bold tracking-[-0.035em] text-balance break-words">
            {bannerTitle}
          </h1>
          <nav aria-label="Breadcrumb" className="mt-4 sm:mt-5">
            <ol className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-base leading-snug font-semibold sm:text-xl lg:text-2xl">
              {path !== "/" && (
                <li className="inline-flex items-baseline gap-3">
                  <Link
                    href="/"
                    className="rounded-sm text-white underline-offset-4 transition-colors hover:text-[#8CE3ED] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    {homeLabel}
                  </Link>

                  <span aria-hidden="true" dir="ltr" className="text-white/90">
                    {"//"}
                  </span>
                </li>
              )}

              <li aria-current="page" className="text-[#45C6D6]">
                {breadcrumbTitle}
              </li>
            </ol>
          </nav>
        </div>
      </div>
    </section>
  );
}
