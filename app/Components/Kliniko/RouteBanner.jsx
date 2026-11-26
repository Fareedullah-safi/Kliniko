"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useKlinikoLanguage } from "@/app/Components/Admin/Kliniko/KlinikoLanguageProvider";

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

function getLabel(value, language, defaultLanguage) {
  if (typeof value === "string") return value.trim();

  for (const code of [language, defaultLanguage, "en"]) {
    const label = value?.[code];

    if (typeof label === "string" && label.trim()) {
      return label.trim();
    }
  }

  return "";
}

function getRouteTitle(path) {
  if (path === "/") return "Home";

  // Your doctor route has two dynamic segments: [id]/[slug].
  if (/^\/(?:our-doctors|doctors)\/[^/]+\/[^/]+$/.test(path)) {
    return "Doctor Details";
  }

  // /our-doctors → Our Doctors
  // /case-studies → Case Studies
  const lastSegment = path.split("/").filter(Boolean).pop() || "";

  let name = lastSegment;

  try {
    name = decodeURIComponent(lastSegment);
  } catch {
    // Keep the original segment if the URL has malformed encoding.
  }

  return name
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

export default function RouteBanner({ image, navItems }) {
  const pathname = usePathname();
  const { language, defaultLanguage, direction } = useKlinikoLanguage();

  const [loadedItems, setLoadedItems] = useState([]);

  // A layout that already has the navbar cards can pass navItems={cards}
  // and reuse the same data. Otherwise load the public navbar here.
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

        if (!controller.signal.aborted && Array.isArray(cards)) {
          setLoadedItems(cards);
        }
      } catch {
        // The route-derived title remains visible if the navbar is unavailable.
      }
    }

    loadNavbar();

    return () => controller.abort();
  }, [navItems]);

  const cards = Array.isArray(navItems) ? navItems : loadedItems;
  const path = normalizePath(pathname);

  // Your navbar stores both parent and dropdown items in data.cards.
  // Match the full path so "/our-doctors" does not override "Doctor Details".
  const currentItem = cards.find(
    (item) => path && normalizePath(item?.link) === path,
  );

  const homeItem = cards.find((item) => normalizePath(item?.link) === "/");

  const title =
    getLabel(currentItem?.label, language, defaultLanguage) ||
    getRouteTitle(path);

  const homeLabel =
    getLabel(homeItem?.label, language, defaultLanguage) || "Home";

  const imageUrl = typeof image === "string" ? image.trim() : "";

  return (
    <section
      dir={direction}
      aria-label={title}
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
          <h1 className="max-w-[20ch] text-[clamp(2.3rem,4.8vw,5.5rem)] leading-[1.08] font-bold tracking-[-0.035em] text-balance break-words">
            {title}
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
                    //
                  </span>
                </li>
              )}

              <li aria-current="page" className="text-[#45C6D6]">
                {title}
              </li>
            </ol>
          </nav>
        </div>
      </div>
    </section>
  );
}
