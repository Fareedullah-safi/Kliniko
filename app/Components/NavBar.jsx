"use client";

import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// STATIC MENU — edit the href values to match your actual routes.
const MENU_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Service", href: "/services" },
  { label: "Pages", href: "/pages" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const APPOINTMENT_HREF = "/appointment";

function KlinikoLogo() {
  return (
    <span className="flex items-center gap-2.5" aria-label="Kliniko">
      {/* CSS/SVG recreation of the screenshot logo; no asset or API needed. */}
      <svg
        viewBox="0 0 88 85"
        aria-hidden="true"
        className="h-12 w-12 shrink-0 sm:h-16 sm:w-16 2xl:h-[82px] 2xl:w-[82px]"
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
        Klini<span className="text-[#119EB5]">k</span>
        <span className="relative inline-flex items-center justify-center text-white">
          o
          <span className="absolute top-[54%] left-1/2 h-[23%] w-[23%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#159FB4]" />
        </span>
      </span>
    </span>
  );
}

export const NavBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const isActive = (href) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  const handleSearch = (event) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <nav className="relative z-50 w-full bg-[linear-gradient(105deg,#174B58_0%,#266E88_100%)] text-white">
      <div className="flex h-[80px] w-full items-stretch lg:h-[100px] 2xl:h-[144px]">
        {/* LOGO — static, no database fetch */}
        <Link
          href="/"
          aria-label="Kliniko Home"
          className="flex shrink-0 items-center bg-[#0B3C4A]/25 px-4 sm:px-7 xl:w-[28.6%] xl:px-7 2xl:pl-[5.8%]"
        >
          <KlinikoLogo />
        </Link>

        {/* DESKTOP LINKS */}
        <ul className="hidden h-full items-stretch xl:flex">
          {MENU_ITEMS.map((item) => (
            <li key={item.label} className="h-full">
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`relative flex h-full items-center justify-center px-4 text-[17px] font-semibold whitespace-nowrap transition-colors 2xl:px-[22px] 2xl:text-[22px] ${
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

        {/* SEARCH + APPOINTMENT + MOBILE TOGGLE */}
        <div className="ml-auto flex shrink-0 items-center gap-2 px-4 sm:gap-4 sm:px-6 2xl:pr-[7%]">
          <button
            type="button"
            aria-label={searchOpen ? "Close search" : "Open search"}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((current) => !current)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#091B52] text-[#119EB5] transition-colors hover:bg-[#142A65] lg:h-16 lg:w-16 2xl:h-[90px] 2xl:w-[90px]"
          >
            {searchOpen ? (
              <X className="h-6 w-6 2xl:h-8 2xl:w-8" />
            ) : (
              <Search className="h-6 w-6 2xl:h-9 2xl:w-9" strokeWidth={2} />
            )}
          </button>

          <Link
            href={APPOINTMENT_HREF}
            className="hidden h-14 items-center justify-center rounded-full bg-[#139FB4] px-5 text-[16px] font-semibold whitespace-nowrap transition-colors hover:bg-[#0C8CA2] sm:flex lg:px-7 2xl:h-[84px] 2xl:min-w-[230px] 2xl:px-9 2xl:text-[22px]"
          >
            Appointment
          </Link>

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((current) => !current)}
            className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#091B52] text-white xl:hidden"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* WORKING STATIC SEARCH */}
      {searchOpen && (
        <div className="absolute top-full right-3 z-50 mt-3 w-[min(380px,calc(100vw-24px))] rounded-2xl border border-slate-100 bg-white p-5 text-[#142A55] shadow-2xl sm:right-6 2xl:right-[7%]">
          <h2 className="text-lg font-bold">What are you looking for?</h2>
          <p className="mt-1 text-sm text-slate-500">
            Search services, pages and articles.
          </p>
          <form onSubmit={handleSearch} className="mt-4 flex gap-2">
            <input
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
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#139FB4] text-white"
            >
              <Search size={18} />
            </button>
          </form>
        </div>
      )}

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="absolute inset-x-0 top-full z-40 border-t border-white/10 bg-[#174B58] p-4 shadow-xl xl:hidden">
          <ul className="flex flex-col">
            {MENU_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
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
    </nav>
  );
};

export default NavBar;
