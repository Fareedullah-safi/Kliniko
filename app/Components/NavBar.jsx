"use client";

import { Menu, Search, X } from "lucide-react";
import { MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// ==========================================
// STATIC NAVIGATION
// ==========================================

const MENU_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Service", href: "/services" },
  { label: "Pages", href: "/pages" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const APPOINTMENT_HREF = "/appointment";

// ==========================================
// SCROLL SETTINGS
// ==========================================

const HIDE_AFTER = 120;
const DIRECTION_THRESHOLD = 6;

const NAV_VARIANTS = {
  visible: { y: "0%" },
  hidden: { y: "-100%" },
};

const NAV_TRANSITION = {
  type: "tween",
  duration: 0.38,
  ease: [0.22, 1, 0.36, 1],
};

// ==========================================
// KLINIKO LOGO
// ==========================================

function KlinikoLogo() {
  return (
    <span className="flex items-center gap-2.5" aria-hidden="true">
      <svg
        viewBox="0 0 88 85"
        className="h-12 w-12 shrink-0 sm:h-16 sm:w-16 2xl:h-[82px] 2xl:w-[82px]"
        focusable="false"
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
        <span className="relative inline-flex items-center justify-center text-white">
          o
          <span className="absolute top-[54%] left-1/2 h-[23%] w-[23%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#159FB4]" />
        </span>
      </span>
    </span>
  );
}

// ==========================================
// MAIN NAVBAR
// NAMED + DEFAULT EXPORT SUPPORT
// ==========================================

export const NavBar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const navRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchButtonRef = useRef(null);
  const menuButtonRef = useRef(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll refs avoid unnecessary re-renders.
  const lastYRef = useRef(0);
  const directionRef = useRef(0);
  const distanceRef = useRef(0);
  const rafRef = useRef(null);
  const focusInsideRef = useRef(false);

  // ==========================================
  // RESET ON ROUTE CHANGE
  // ==========================================

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setHidden(false);
  }, [pathname]);

  // ==========================================
  // ESCAPE + OUTSIDE CLICK
  // ==========================================

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;

      if (searchOpen) {
        searchButtonRef.current?.focus();
      } else if (mobileOpen) {
        menuButtonRef.current?.focus();
      }

      setSearchOpen(false);
      setMobileOpen(false);
    };

    const onOutsidePointer = (event) => {
      if (!navRef.current?.contains(event.target)) {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    if (searchOpen || mobileOpen) {
      document.addEventListener("pointerdown", onOutsidePointer);
    }

    return () => {
      document.removeEventListener("keydown", onKeyDown);

      document.removeEventListener("pointerdown", onOutsidePointer);
    };
  }, [searchOpen, mobileOpen]);

  // ==========================================
  // FOCUS SEARCH INPUT WHEN OPENED
  // ==========================================

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  // ==========================================
  // SMART STICKY SCROLL
  // DOWN = HIDE
  // UP = SHOW
  // ==========================================

  useEffect(() => {
    lastYRef.current = Math.max(0, window.scrollY);

    setScrolled(lastYRef.current > 20);

    const update = () => {
      rafRef.current = null;

      const y = Math.max(0, window.scrollY);
      const delta = y - lastYRef.current;

      lastYRef.current = y;

      // Update the navbar shadow only
      // when the value actually changes.
      setScrolled((previous) => {
        const next = y > 20;

        return previous === next ? previous : next;
      });

      // Always show near the top or
      // while the user is interacting.
      if (
        y <= HIDE_AFTER ||
        mobileOpen ||
        searchOpen ||
        focusInsideRef.current
      ) {
        directionRef.current = 0;
        distanceRef.current = 0;

        setHidden(false);
        return;
      }

      const direction = Math.sign(delta);

      if (!direction) return;

      // Reset distance when direction changes.
      if (direction !== directionRef.current) {
        directionRef.current = direction;
        distanceRef.current = 0;
      }

      // Accumulate small scroll movements.
      distanceRef.current += Math.abs(delta);

      if (distanceRef.current >= DIRECTION_THRESHOLD) {
        // Positive movement = scrolling down.
        // Negative movement = scrolling up.
        setHidden(direction > 0);

        distanceRef.current = 0;
      }
    };

    const onScroll = () => {
      if (rafRef.current !== null) return;

      rafRef.current = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);

        rafRef.current = null;
      }
    };
  }, [mobileOpen, searchOpen]);

  // ==========================================
  // ACTIVE LINK CHECK
  // ==========================================

  const isActive = (href) =>
    pathname === href || (href !== "/" && pathname?.startsWith(`${href}/`));

  // ==========================================
  // NAVIGATION CONTROLS
  // ==========================================

  const toggleSearch = () => {
    setSearchOpen((current) => !current);
    setMobileOpen(false);
    setHidden(false);
  };

  const toggleMobile = () => {
    setMobileOpen((current) => !current);
    setSearchOpen(false);
    setHidden(false);
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const term = query.trim();

    if (!term) return;

    setSearchOpen(false);

    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <MotionConfig reducedMotion="user">
      {/* SPACER PREVENTS LAYOUT JUMP */}
      <div className="h-[80px] w-full lg:h-[100px] 2xl:h-[144px]">
        {/* ANIMATED NAVBAR */}
        <motion.nav
          ref={navRef}
          aria-label="Main navigation"
          aria-hidden={hidden ? true : undefined}
          inert={hidden}
          initial={false}
          animate={hidden ? "hidden" : "visible"}
          variants={NAV_VARIANTS}
          transition={NAV_TRANSITION}

          // Keyboard focus keeps navbar visible.
          onFocusCapture={() => {
            focusInsideRef.current = true;
            setHidden(false);
          }}

          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              focusInsideRef.current = false;
            }
          }}

          className={`fixed inset-x-0 top-0 z-[100] w-full transform-gpu bg-[linear-gradient(105deg,#174B58_0%,#266E88_100%)] text-white transition-shadow duration-300 ${
            scrolled ? "shadow-[0_10px_30px_rgba(0,14,42,0.15)]" : "shadow-none"
          }`}
        >
          {/* MAIN NAVBAR ROW */}
          <div className="flex h-[80px] w-full items-stretch lg:h-[100px] 2xl:h-[144px]">
            {/* LOGO */}
            <Link
              href="/"
              aria-label="Kliniko Home"
              className="flex shrink-0 items-center bg-[#0B3C4A]/25 px-4 sm:px-7 xl:w-[28.6%] xl:px-7 2xl:pl-[5.8%]"
            >
              <KlinikoLogo />
            </Link>

            {/* DESKTOP MENU */}
            <ul className="hidden h-full min-w-0 items-stretch xl:flex">
              {MENU_ITEMS.map((item) => (
                <li key={item.href} className="h-full">
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`relative flex h-full items-center justify-center px-3 text-[15px] font-semibold whitespace-nowrap transition-colors 2xl:px-[22px] 2xl:text-[22px] ${
                      isActive(item.href)
                        ? "bg-[#142A55] after:absolute after:inset-x-0 after:bottom-0 after:h-[4px] after:bg-white"
                        : "hover:bg-[#142A55]/35"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* RIGHT CONTROLS */}
            <div className="ml-auto flex shrink-0 items-center gap-2 px-4 sm:gap-4 sm:px-6 2xl:pr-[7%]">
              {/* SEARCH BUTTON */}
              <motion.button
                ref={searchButtonRef}
                type="button"
                aria-controls="kliniko-nav-search"
                aria-label={searchOpen ? "Close search" : "Open search"}
                aria-expanded={searchOpen}
                onClick={toggleSearch}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#091B52] text-[#119EB5] transition-colors hover:bg-[#142A65] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:h-16 lg:w-16 2xl:h-[90px] 2xl:w-[90px]"
              >
                {searchOpen ? (
                  <X className="h-6 w-6 2xl:h-8 2xl:w-8" />
                ) : (
                  <Search className="h-6 w-6 2xl:h-9 2xl:w-9" strokeWidth={2} />
                )}
              </motion.button>

              {/* APPOINTMENT BUTTON */}
              <Link
                href={APPOINTMENT_HREF}
                className="group relative hidden h-14 items-center justify-center overflow-hidden rounded-full bg-[#139FB4] px-5 text-[16px] font-semibold whitespace-nowrap text-white sm:flex lg:px-7 2xl:h-[84px] 2xl:min-w-[230px] 2xl:px-9 2xl:text-[22px]"
              >
                {/* GRADIENT ON HOVER */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#6255EC] via-[#327BD9] to-[#139DB3] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
                />

                <span className="relative">Appointment</span>
              </Link>

              {/* MOBILE MENU BUTTON */}
              <motion.button
                ref={menuButtonRef}
                type="button"
                aria-controls="kliniko-nav-mobile"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={toggleMobile}
                whileTap={{ scale: 0.94 }}
                className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#091B52] text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white xl:hidden"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
          </div>

          {/* ====================================
              SEARCH PANEL
          ==================================== */}

          {searchOpen && (
            <div
              id="kliniko-nav-search"
              className="absolute top-full right-3 z-50 mt-3 w-[min(380px,calc(100vw-24px))] rounded-2xl border border-slate-100 bg-white p-5 text-[#142A55] shadow-2xl sm:right-6 2xl:right-[7%]"
            >
              <h2 className="text-lg font-bold">What are you looking for?</h2>

              <p className="mt-1 text-sm text-slate-500">
                Search services, pages and articles.
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
                  placeholder="Search..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-11 min-w-0 flex-1 rounded-full border border-slate-200 px-4 text-sm outline-none focus:border-[#139FB4]"
                />

                <button
                  type="submit"
                  aria-label="Submit search"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#139FB4] text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#139FB4]"
                >
                  <Search size={18} />
                </button>
              </form>
            </div>
          )}

          {/* ====================================
              MOBILE MENU
          ==================================== */}

          {mobileOpen && (
            <div
              id="kliniko-nav-mobile"
              className="absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-80px)] overflow-y-auto border-t border-white/10 bg-[#174B58] p-4 shadow-xl xl:hidden"
            >
              <ul className="flex flex-col">
                {MENU_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={`block rounded-lg px-4 py-3 text-base font-semibold transition-colors ${
                        isActive(item.href)
                          ? "bg-[#142A55] text-white"
                          : "text-white/90 hover:bg-white/10"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <Link
                href={APPOINTMENT_HREF}
                onClick={() => setMobileOpen(false)}
                className="mt-3 flex h-12 items-center justify-center rounded-full bg-[#139FB4] text-base font-semibold text-white sm:hidden"
              >
                Appointment
              </Link>
            </div>
          )}
        </motion.nav>
      </div>
    </MotionConfig>
  );
};

export default NavBar;
