"use client";

import { useKlinikoLanguage } from "@/app/Components/Admin/Kliniko/KlinikoLanguageProvider";
import { ChevronDown, ChevronsRight, Menu, Search, X } from "lucide-react";
import { MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

const API = "/api/navbar";

const FALLBACK_ITEMS = [
  { id: "home", label: { en: "Home" }, link: "/" },
  { id: "about", label: { en: "About" }, link: "/about" },
  { id: "services", label: { en: "Services" }, link: "/services" },
  { id: "pages", label: { en: "Pages" }, link: "/pages" },
  { id: "blog", label: { en: "Blog" }, link: "/blo" },
  { id: "contact", label: { en: "Contact" }, link: "/contact" },
];

const EASE = [0.22, 1, 0.36, 1];

function getText(value, language, defaultLanguage, fallback = "") {
  if (typeof value === "string") return value.trim() || fallback;

  for (const code of [language, defaultLanguage, "en"]) {
    const text = value?.[code];

    if (typeof text === "string" && text.trim()) {
      return text.trim();
    }
  }

  return fallback;
}

// Your navbar API stores parents and children together in data.cards.
// A child belongs to the parent whose id matches its parentId.
function buildMenu(cards) {
  const items = cards
    .filter((card) => card?.id != null && String(card.id).trim())
    .map((card) => ({
      ...card,
      id: String(card.id).trim(),
      parentId: String(card.parentId ?? "").trim(),
    }));

  const parents = items
    .filter((item) => !item.parentId)
    .map((item) => ({ ...item, children: [] }));

  const parentsById = new Map(parents.map((parent) => [parent.id, parent]));

  for (const item of items) {
    if (item.parentId) {
      parentsById.get(item.parentId)?.children.push(item);
    }
  }

  return parents;
}

function routePath(href) {
  if (typeof href !== "string") return "";

  const link = href.trim();

  if (
    !link.startsWith("/") ||
    link.startsWith("//") ||
    link.includes("#") ||
    link.includes("?")
  ) {
    return "";
  }

  return link.replace(/\/+$/, "") || "/";
}

// Choose one winner across the whole navbar.
// Equal paths keep the first match. More specific paths win.
function getActiveMenu(parents, pathname) {
  const current = routePath(pathname);
  let winner = { parentId: null, itemId: null, exact: false };
  let bestLength = -1;

  if (!current) return winner;

  for (const parent of parents) {
    for (const item of [parent, ...parent.children]) {
      const path = routePath(item.link);
      if (!path) continue;

      const exact = current === path;
      const nested = path !== "/" && current.startsWith(`${path}/`);

      if ((exact || nested) && path.length > bestLength) {
        bestLength = path.length;
        winner = {
          parentId: parent.id,
          itemId: item.id,
          exact,
        };
      }
    }
  }

  return winner;
}

function KlinikoLogo() {
  return (
    <span dir="ltr" aria-hidden="true" className="flex items-center gap-2.5">
      <svg
        viewBox="0 0 88 85"
        focusable="false"
        className="size-12 shrink-0 sm:size-16 2xl:size-[82px]"
      >
        <rect x="31" y="4" width="27" height="73" rx="5" fill="#149FB3" />
        <rect x="8" y="26" width="73" height="27" rx="5" fill="#149FB3" />

        <path
          d="M32 77C27 49 41 36 75 26C75 49 67 66 43 70C40 72 36 75 32 77Z"
          fill="#5D52E8"
        />

        <path
          d="M33 78C34 60 46 49 64 42"
          fill="none"
          stroke="#173F69"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      <span
        className="flex items-center text-[32px] leading-none font-bold tracking-[-0.045em] text-white sm:text-[48px] xl:text-[52px] 2xl:text-[70px]"
        style={{
          fontFamily: '"Arial Rounded MT Bold", "Trebuchet MS", sans-serif',
        }}
      >
        Klini
        <span className="text-[#119EB5]">k</span>
        <span className="relative inline-flex items-center justify-center">
          o
          <span className="absolute top-[54%] left-1/2 size-[23%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#159FB4]" />
        </span>
      </span>
    </span>
  );
}

function NavbarMenu({
  parents,
  active,
  translated,
  mobile = false,
  onNavigate,
}) {
  const menuRef = useRef(null);
  const menuId = useId();

  const [openId, setOpenId] = useState(null);
  const [pinnedId, setPinnedId] = useState(null);
  const [panelLeft, setPanelLeft] = useState(0);

  function closeMenu() {
    setOpenId(null);
    setPinnedId(null);
  }

  function navigate() {
    closeMenu();
    onNavigate?.();
  }

  function openMenu(parentId, row) {
    if (!mobile && row) {
      const rect = row.getBoundingClientRect();
      const width = 220;
      const rtl = window.getComputedStyle(row).direction === "rtl";
      const preferred = rtl ? rect.right - width : rect.left;
      const maxLeft = document.documentElement.clientWidth - width - 12;
      const viewportLeft = Math.max(12, Math.min(preferred, maxLeft));

      setPanelLeft(viewportLeft - rect.left);
    }

    setOpenId(parentId);
  }

  useEffect(() => {
    if (openId === null) return;

    function onOutside(event) {
      if (!menuRef.current?.contains(event.target)) {
        setOpenId(null);
        setPinnedId(null);
      }
    }

    function onResize() {
      setOpenId(null);
      setPinnedId(null);
    }

    document.addEventListener("pointerdown", onOutside);
    window.addEventListener("resize", onResize);

    return () => {
      document.removeEventListener("pointerdown", onOutside);
      window.removeEventListener("resize", onResize);
    };
  }, [openId]);

  return (
    <ul
      ref={menuRef}
      className={
        mobile
          ? "flex flex-col gap-1"
          : "hidden h-full items-stretch overflow-visible xl:flex"
      }
    >
      {parents.map((parent) => {
        const label = translated(parent.label);
        const hasChildren = parent.children.length > 0;
        const expanded = hasChildren && openId === parent.id;
        const parentActive = active.parentId === parent.id;
        const panelId = `${menuId}-${parent.id}`;

        return (
          <li
            key={parent.id}
            className={mobile ? "relative" : "relative h-full overflow-visible"}
            onPointerEnter={(event) => {
              if (mobile || event.pointerType !== "mouse") return;

              setPinnedId(null);

              if (hasChildren) {
                openMenu(parent.id, event.currentTarget);
              } else {
                closeMenu();
              }
            }}
            onPointerLeave={(event) => {
              if (mobile || event.pointerType !== "mouse") return;
              if (pinnedId === parent.id) return;

              if (!event.currentTarget.contains(document.activeElement)) {
                setOpenId((current) =>
                  current === parent.id ? null : current,
                );
              }
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setOpenId((current) =>
                  current === parent.id ? null : current,
                );
                setPinnedId((current) =>
                  current === parent.id ? null : current,
                );
              }
            }}
            onKeyDown={(event) => {
              const row = event.currentTarget;

              if (event.key === "Escape" && expanded) {
                event.preventDefault();
                event.stopPropagation();
                closeMenu();
                row.querySelector("[data-dropdown-toggle]")?.focus();
              }

              if (
                event.key === "ArrowDown" &&
                hasChildren &&
                event.target.closest("[data-parent-controls]")
              ) {
                event.preventDefault();
                openMenu(parent.id, row);

                requestAnimationFrame(() => {
                  row.querySelector("[data-dropdown-panel] a")?.focus();
                });
              }
            }}
          >
            <div
              data-parent-controls
              className={`relative flex items-center transition-colors ${
                mobile ? "rounded-lg" : "h-full"
              } ${
                parentActive
                  ? "bg-[#142A55]"
                  : expanded
                    ? "bg-white/10"
                    : "hover:bg-white/5"
              }`}
            >
              {/* The label navigates to the parent's saved URL. */}
              <Link
                href={parent.link || "/"}
                onClick={navigate}
                aria-current={
                  active.exact && active.itemId === parent.id
                    ? "page"
                    : undefined
                }
                className={`flex items-center font-semibold whitespace-nowrap text-white focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white ${
                  mobile
                    ? "min-h-12 flex-1 px-4 text-base"
                    : hasChildren
                      ? "h-full ps-3 pe-1 text-[16px] 2xl:ps-5 2xl:text-[23px]"
                      : "h-full px-4 text-[16px] 2xl:px-[22px] 2xl:text-[23px]"
                }`}
              >
                {label}
              </Link>

              {/* The visible arrow opens the submenu without navigating. */}
              {hasChildren && (
                <button
                  data-dropdown-toggle
                  type="button"
                  aria-label={`${expanded ? "Close" : "Open"} ${label} submenu`}
                  aria-expanded={expanded}
                  aria-controls={expanded ? panelId : undefined}
                  onClick={(event) => {
                    const row = event.currentTarget.closest("li");

                    if (expanded && (mobile || pinnedId === parent.id)) {
                      closeMenu();
                    } else {
                      openMenu(parent.id, row);
                      setPinnedId(parent.id);
                    }
                  }}
                  className={`grid shrink-0 cursor-pointer place-items-center rounded-md text-white/90 hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-white ${
                    mobile ? "me-1 size-11" : "me-1 h-9 w-7"
                  }`}
                >
                  <ChevronDown
                    size={16}
                    strokeWidth={2.4}
                    aria-hidden="true"
                    className={`motion-safe:transition-transform ${
                      expanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}

              {!mobile && parentActive && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1 rounded-full bg-white"
                />
              )}
            </div>

            {expanded && (
              <motion.ul
                id={panelId}
                data-dropdown-panel
                aria-label={`${label} submenu`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, ease: EASE }}
                style={mobile ? undefined : { left: panelLeft }}
                className={
                  mobile
                    ? "mx-2 mt-1 mb-2 rounded-lg border-s-[3px] border-[#159FB4] bg-white p-1.5 text-[#142A55]"
                    : "absolute top-full z-[110] max-h-[calc(100dvh-144px)] w-[220px] overflow-y-auto overscroll-contain rounded-b-lg border-x border-b-[3px] border-x-slate-200/80 border-b-[#142A55] bg-white p-2 text-[#142A55] shadow-[0_10px_24px_-8px_rgba(9,27,82,0.24)]"
                }
              >
                {parent.children.map((child) => {
                  const current = active.itemId === child.id;

                  return (
                    <li key={child.id}>
                      <Link
                        href={child.link || "/"}
                        onClick={navigate}
                        aria-current={
                          current && active.exact ? "page" : undefined
                        }
                        className={`group flex min-h-11 items-center gap-2.5 rounded-md px-3 py-2 text-[15px] leading-snug font-semibold outline-offset-[-2px] transition-colors hover:bg-[#EDF8F9] focus-visible:bg-[#EDF8F9] focus-visible:outline-2 focus-visible:outline-[#159FB4] 2xl:text-[16px] ${
                          current ? "bg-[#EDF8F9] text-[#104650]" : ""
                        }`}
                      >
                        <ChevronsRight
                          size={18}
                          strokeWidth={2}
                          aria-hidden="true"
                          className="shrink-0 text-[#079FB2] rtl:rotate-180"
                        />

                        <span className="relative min-w-0 break-words">
                          {translated(child.label)}
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-x-0 -bottom-1 h-[2px] origin-left scale-x-0 rounded-full bg-[#142A55] group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-safe:transition-transform rtl:origin-right"
                          />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, defaultLanguage, direction } = useKlinikoLanguage();

  const navRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchButtonRef = useRef(null);
  const menuButtonRef = useRef(null);

  const [navbar, setNavbar] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadNavbar() {
      try {
        const response = await fetch(API, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Navbar API returned HTTP ${response.status}.`);
        }

        const result = await response.json();

        if (result.success === false || !Array.isArray(result.data?.cards)) {
          throw new Error(result.message || "Invalid navbar response.");
        }

        // Public rendering uses the cards. Version is for admin edits.
        // Preserve the fallback when the settings document doesn't exist yet.
        if (
          result.version === null &&
          result.data.cards.length === 0 &&
          Object.keys(result.data.content || {}).length === 0
        ) {
          return;
        }

        if (!controller.signal.aborted) {
          setNavbar(result.data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Could not load Kliniko navbar:", error.message);
        }
      }
    }

    loadNavbar();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setHidden(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!mobileOpen && !searchOpen) return;

    function onOutside(event) {
      if (navRef.current?.contains(event.target)) return;
      setMobileOpen(false);
      setSearchOpen(false);
    }

    function onEscape(event) {
      if (event.key !== "Escape") return;

      if (searchOpen) searchButtonRef.current?.focus();
      if (mobileOpen) menuButtonRef.current?.focus();

      setMobileOpen(false);
      setSearchOpen(false);
    }

    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("pointerdown", onOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [mobileOpen, searchOpen]);

  // Hide on scroll down, show on scroll up.
  useEffect(() => {
    let lastY = Math.max(0, window.scrollY);
    let lastDirection = 0;
    let distance = 0;
    let frame = null;

    setScrolled(lastY > 20);

    function updateNavbar() {
      frame = null;

      const y = Math.max(0, window.scrollY);
      const delta = y - lastY;
      lastY = y;

      setScrolled(y > 20);

      if (
        y <= 120 ||
        mobileOpen ||
        searchOpen ||
        navRef.current?.contains(document.activeElement) ||
        navRef.current?.querySelector("[data-dropdown-panel]")
      ) {
        distance = 0;
        lastDirection = 0;
        setHidden(false);
        return;
      }

      const nextDirection = Math.sign(delta);
      if (!nextDirection) return;

      if (nextDirection !== lastDirection) {
        distance = 0;
        lastDirection = nextDirection;
      }

      distance += Math.abs(delta);

      if (distance >= 6) {
        setHidden(nextDirection > 0);
        distance = 0;
      }
    }

    function onScroll() {
      if (frame === null) {
        frame = window.requestAnimationFrame(updateNavbar);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [mobileOpen, searchOpen]);

  const content = navbar?.content || {};
  const parents = buildMenu(navbar?.cards ?? FALLBACK_ITEMS);
  const active = getActiveMenu(parents, pathname);

  function translated(value, fallback = "") {
    return getText(value, language, defaultLanguage, fallback);
  }

  const brand = translated(content.brand, "Kliniko");
  const appointmentText = translated(content.appointmentText, "Appointment");
  const appointmentHref = content.appointmentLink || "/appointment";

  function handleSearch(event) {
    event.preventDefault();

    const term = query.trim();
    if (!term) return;

    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="h-[80px] w-full lg:h-[100px] 2xl:h-[144px]">
        <motion.nav
          ref={navRef}
          dir={direction}
          aria-label="Main navigation"
          initial={false}
          animate={{ y: hidden ? "-100%" : "0%" }}
          transition={{ duration: 0.32, ease: EASE }}
          onFocusCapture={() => setHidden(false)}
          className={`fixed inset-x-0 top-0 z-[100] w-full overflow-visible bg-[linear-gradient(105deg,#174B58_0%,#266E88_100%)] text-white transition-shadow ${
            scrolled ? "shadow-[0_8px_24px_rgba(9,27,82,0.16)]" : ""
          }`}
        >
          <div className="flex h-[80px] w-full items-stretch overflow-visible lg:h-[100px] 2xl:h-[144px]">
            <Link
              href="/"
              aria-label={`${brand} Home`}
              className="flex min-w-0 items-center bg-[#0B3C4A]/25 px-4 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white sm:px-7 xl:w-[28.6%] 2xl:ps-[5.8%]"
            >
              {content.logo ? (
                <img
                  src={content.logo}
                  alt={brand}
                  className="max-h-14 w-auto max-w-[min(42vw,220px)] object-contain sm:max-h-20 2xl:max-h-[100px]"
                />
              ) : (
                <KlinikoLogo />
              )}
            </Link>

            <NavbarMenu
              key={`desktop-${pathname}`}
              parents={parents}
              active={active}
              translated={translated}
            />

            <div className="ms-auto flex shrink-0 items-center gap-2 px-4 sm:gap-4 sm:px-6 2xl:pe-[7%]">
              <motion.button
                ref={searchButtonRef}
                type="button"
                aria-label={searchOpen ? "Close search" : "Open search"}
                aria-expanded={searchOpen}
                aria-controls={searchOpen ? "kliniko-nav-search" : undefined}
                onClick={() => {
                  setSearchOpen((open) => !open);
                  setMobileOpen(false);
                  setHidden(false);
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#091B52] text-[#21B4C7] hover:bg-[#142A65] focus-visible:outline-2 focus-visible:outline-white lg:size-16 2xl:size-[90px]"
              >
                {searchOpen ? (
                  <X className="size-6 2xl:size-8" />
                ) : (
                  <Search className="size-6 2xl:size-9" />
                )}
              </motion.button>

              <Link
                href={appointmentHref}
                className="group relative hidden h-14 items-center justify-center overflow-hidden rounded-full bg-[#139FB4] px-5 text-[16px] font-semibold whitespace-nowrap text-white focus-visible:outline-2 focus-visible:outline-white sm:flex lg:px-7 2xl:h-[84px] 2xl:min-w-[230px] 2xl:px-9 2xl:text-[22px]"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#6255EC] via-[#327BD9] to-[#139DB3] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <span className="relative">{appointmentText}</span>
              </Link>

              <button
                ref={menuButtonRef}
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                aria-controls={mobileOpen ? "kliniko-nav-mobile" : undefined}
                onClick={() => {
                  setMobileOpen((open) => !open);
                  setSearchOpen(false);
                  setHidden(false);
                }}
                className="flex size-11 items-center justify-center rounded-lg bg-[#091B52] text-white hover:bg-[#142A65] focus-visible:outline-2 focus-visible:outline-white xl:hidden"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {searchOpen && (
            <div
              id="kliniko-nav-search"
              className="absolute end-3 top-full z-50 mt-3 w-[min(380px,calc(100vw-24px))] rounded-2xl border border-slate-200 bg-white p-5 text-[#142A55] shadow-xl sm:end-6 2xl:end-[7%]"
            >
              <h2 className="text-lg font-bold">
                {translated(content.searchTitle, "What are you looking for?")}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {translated(
                  content.searchSubtitle,
                  "Search services, pages and articles.",
                )}
              </p>

              <form
                role="search"
                onSubmit={handleSearch}
                className="mt-4 flex gap-2"
              >
                <input
                  ref={searchInputRef}
                  type="search"
                  aria-label="Search website"
                  placeholder={translated(
                    content.searchPlaceholder,
                    "Search...",
                  )}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-11 min-w-0 flex-1 rounded-full border border-slate-300 px-4 text-sm outline-none focus:border-[#139FB4] focus:ring-2 focus:ring-[#139FB4]/20"
                />

                <button
                  type="submit"
                  aria-label="Submit search"
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#11899B] text-white hover:bg-[#0D7484]"
                >
                  <Search size={18} />
                </button>
              </form>
            </div>
          )}

          {mobileOpen && (
            <div
              id="kliniko-nav-mobile"
              className="absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-80px)] overflow-y-auto overscroll-contain border-t border-white/10 bg-[#174B58] p-4 shadow-xl lg:max-h-[calc(100dvh-100px)] xl:hidden"
            >
              <NavbarMenu
                key={`mobile-${pathname}`}
                mobile
                parents={parents}
                active={active}
                translated={translated}
                onNavigate={() => setMobileOpen(false)}
              />

              <Link
                href={appointmentHref}
                onClick={() => setMobileOpen(false)}
                className="mt-3 flex min-h-12 items-center justify-center rounded-full bg-[#139FB4] px-4 text-base font-semibold text-white sm:hidden"
              >
                {appointmentText}
              </Link>
            </div>
          )}
        </motion.nav>
      </div>
    </MotionConfig>
  );
}

export default NavBar;
