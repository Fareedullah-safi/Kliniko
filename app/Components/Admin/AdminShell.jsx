"use client";

import "@/app/Components/Admin/kliniko-admin-theme.css";
import axios from "axios";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BookOpenText,
  CalendarCheck,
  ChevronDown,
  ClipboardList,
  FileText,
  HeartHandshake,
  HeartPulse,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Moon,
  Newspaper,
  PanelTop,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  Sun,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Kliniko CMS navigation is design-ready. The matching route scaffolds
// live in app/admin/kliniko/[section]/page.jsx. They do not write to MongoDB yet.
const NAVIGATION = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Kliniko homepage",
    items: [
      { title: "Hero", href: "/admin/kliniko/hero", icon: HeartPulse },
      {
        title: "About Kliniko",
        href: "/admin/kliniko/about",
        icon: HeartHandshake,
      },
      { title: "Services", href: "/admin/kliniko/services", icon: Stethoscope },
      {
        title: "Why Choose Us",
        href: "/admin/kliniko/why-choose",
        icon: Activity,
      },
      {
        title: "Expert Doctors",
        href: "/admin/kliniko/doctors",
        icon: UsersRound,
      },
      {
        title: "Case Studies",
        href: "/admin/kliniko/case-study",
        icon: Images,
      },
      {
        title: "Appointment",
        href: "/admin/kliniko/appointment",
        icon: CalendarCheck,
      },
      {
        title: "Testimonials",
        href: "/admin/kliniko/testimonials",
        icon: ClipboardList,
      },
      { title: "Blog & News", href: "/admin/kliniko/blog", icon: Newspaper },
    ],
  },
  {
    title: "Website",
    items: [
      { title: "Navbar", href: "/admin/kliniko/navbar", icon: PanelTop },
      { title: "Footer", href: "/admin/kliniko/footer", icon: Mail },
      { title: "Website Pages", href: "/admin/pages", icon: FileText },
    ],
  },
  {
    title: "Administration",
    items: [
      { title: "Messages", href: "/admin/messages", icon: Mail },
      {
        title: "Admin Management",
        href: "/admin/adminusersmanagment",
        icon: ShieldCheck,
      },
      {
        title: "My Profile & Settings",
        href: "/admin/adminusers",
        icon: Settings,
      },
      {
        title: "Backup Manager",
        href: "/admin/backup-data-manager",
        icon: BookOpenText,
      },
    ],
  },
];

function BrandIcon() {
  return (
    <svg
      viewBox="0 0 60 60"
      className="h-10 w-10 shrink-0"
      fill="none"
      aria-hidden="true"
    >
      <rect x="22" y="4" width="16" height="52" rx="3" fill="#159BB1" />
      <rect x="4" y="22" width="52" height="16" rx="3" fill="#159BB1" />
      <path d="M20 51c0-20 10-30 34-37-2 23-12 35-34 37Z" fill="#6255EC" />
      <path
        d="M20 54c3-17 13-24 24-29"
        stroke="#101E50"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Avatar({ name, image, size = "md" }) {
  const [failed, setFailed] = useState(false);
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "A";
  const dimensions = size === "sm" ? "h-9 w-9 text-xs" : "h-11 w-11 text-sm";

  return (
    <span
      className={`inline-flex ${dimensions} shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#159BB1]/15 font-bold text-[#159BB1] ring-1 ring-[#159BB1]/25`}
    >
      {image && !failed ? (
        // Image URL is supplied by the existing authenticated profile endpoint.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initials
      )}
    </span>
  );
}

function NavLink({ item, active, onNavigate }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#36C7DA] ${
        active
          ? "bg-[#159BB1] text-white shadow-[0_8px_18px_rgba(21,155,177,0.20)]"
          : "text-[#C7D8ED] hover:translate-x-0.5 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{item.title}</span>
      {active && (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-white"
        />
      )}
    </Link>
  );
}

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [admin, setAdmin] = useState({
    uid: "",
    name: "Administrator",
    email: "",
    image: "",
    role: "",
  });

  const isDark = mounted && resolvedTheme === "dark";
  const isActive = (href) =>
    pathname === href ||
    (href !== "/admin" && pathname?.startsWith(`${href}/`));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAdmin() {
      try {
        const session = await axios.get("/api/admin/adminusers/session", {
          withCredentials: true,
        });
        const account = session.data?.admin;
        if (!session.data?.success || !account)
          throw new Error("Your admin session could not be verified.");
        if (cancelled) return;
        const uid = account.uid || account.UID || "";
        setAdmin((previous) => ({
          ...previous,
          uid,
          email: account.email || "",
          name: account.name || previous.name,
          role: account.role || "",
        }));

        if (uid) {
          try {
            const result = await axios.get("/api/admin/adminusers/profile", {
              params: { UID: uid },
              withCredentials: true,
            });
            if (cancelled) return;
            const profile = result.data?.profile || result.data?.data;
            if (result.data?.success && profile) {
              setAdmin((previous) => ({
                ...previous,
                name: profile.name || previous.name,
                image: profile.imageUrl || "",
              }));
            }
          } catch (error) {
            // Profile is optional; an unavailable image must not block the dashboard.
            if (process.env.NODE_ENV !== "production")
              console.error("Admin profile unavailable:", error);
          }
        }
      } catch (error) {
        if (!cancelled)
          setSessionError(
            error.response?.data?.message ||
              error.message ||
              "Unable to load your session.",
          );
      } finally {
        if (!cancelled) setSessionLoading(false);
      }
    }

    loadAdmin();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setProfileOpen(false);
      }
    };
    const onOutside = (event) => {
      if (!event.target.closest("[data-kliniko-profile]"))
        setProfileOpen(false);
    };
    document.addEventListener("keydown", onEscape);
    document.addEventListener("pointerdown", onOutside);
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.removeEventListener("pointerdown", onOutside);
    };
  }, []);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    setLogoutError("");
    try {
      await axios.post(
        "/api/admin/adminusers/logout",
        {},
        { withCredentials: true },
      );
      window.location.replace("/adminLogin");
    } catch (error) {
      setLogoutError(
        error.response?.data?.message || "Sign out failed. Try again.",
      );
      setSigningOut(false);
    }
  }

  if (sessionLoading) {
    return (
      <div className="kliniko-admin flex min-h-dvh items-center justify-center bg-[var(--background)]">
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-5 font-semibold text-[var(--foreground)] shadow-sm">
          <span className="h-5 w-5 animate-spin rounded-full border-[3px] border-[#159BB1]/25 border-t-[#159BB1]" />
          Loading Kliniko Admin...
        </div>
      </div>
    );
  }

  if (!sessionError) {
    return (
      <div className="kliniko-admin flex min-h-dvh items-center justify-center bg-[var(--background)] px-6">
        <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto text-[#159BB1]" size={36} />
          <h1 className="mt-4 text-xl font-bold text-[var(--foreground)]">
            Admin verification required
          </h1>
          <p role="alert" className="mt-3 text-sm text-[var(--muted)]">
            {sessionError}
          </p>
          <Link
            className="mt-5 inline-flex rounded-xl bg-[#159BB1] px-5 py-3 font-semibold text-white"
            href="/adminLogin"
          >
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  const filteredGroups = NAVIGATION.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      `${item.title} ${group.title}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    ),
  })).filter((group) => group.items.length > 0);

  return (
    <div
      className="kliniko-admin min-h-dvh bg-[var(--background)] text-[var(--foreground)]"
      dir="ltr"
    >
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-[#071735]/60 backdrop-blur-[3px] lg:hidden"
        />
      )}

      <aside
        aria-label="Admin sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col overflow-hidden bg-[#101E50] text-white shadow-[12px_0_35px_rgba(5,16,50,0.10)] transition-transform duration-300 ease-out lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-[84px] shrink-0 items-center justify-between border-b border-white/10 px-5">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-[#39C6D8]"
            onClick={() => setMobileOpen(false)}
          >
            <BrandIcon />
            <span className="flex flex-col leading-tight">
              <span className="text-[23px] font-extrabold tracking-[-0.04em]">
                Klini<span className="text-[#33B8CA]">ko</span>
              </span>
              <span className="mt-1 text-[10px] font-semibold tracking-[0.22em] text-[#AFC9E4] uppercase">
                Medical CMS
              </span>
            </span>
          </Link>
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <div className="min-h-0 flex-1 [scrollbar-width:thin] [scrollbar-color:#29456c_transparent] overflow-y-auto px-3 pt-5 pb-6">
          <div className="px-2 pb-4 md:hidden">
            <label className="sr-only" htmlFor="kliniko-sidebar-search">
              Find admin page
            </label>
            <input
              id="kliniko-sidebar-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sections..."
              className="h-10 w-full rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white outline-none placeholder:text-white/60 focus:border-[#3AD1DB]"
            />
          </div>
          {filteredGroups.length ? (
            filteredGroups.map((group) => (
              <div key={group.title} className="mb-6">
                <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.16em] text-[#80A9C9] uppercase">
                  {group.title}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      active={isActive(item.href)}
                      onNavigate={() => setMobileOpen(false)}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="px-3 text-sm text-white/60">
              No matching admin pages.
            </p>
          )}
        </div>

        <Link
          href="/admin/adminusers"
          className="flex shrink-0 items-center gap-3 border-t border-white/10 bg-[#0C1841] px-5 py-4 transition-colors hover:bg-[#11285C]"
        >
          <Avatar name={admin.name} image={admin.image} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-white">
              {admin.name}
            </span>
            <span className="mt-1 block truncate text-xs text-[#AFC5DE]">
              {admin.email || "Administrator"}
            </span>
          </span>
          <ArrowUpRight size={17} className="shrink-0 text-[#86BED1]" />
        </Link>
      </aside>

      <div className="min-w-0 lg:pl-[280px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)]/95 px-4 shadow-[0_2px_16px_rgba(16,30,80,0.025)] backdrop-blur-xl sm:px-6 xl:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-[var(--border)] p-2.5 text-[var(--foreground)] hover:bg-[var(--surface-soft)] lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="hidden h-[42px] w-[min(330px,29vw)] items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 md:flex">
              <Search size={17} className="shrink-0 text-[var(--muted)]" />
              <label htmlFor="kliniko-admin-search" className="sr-only">
                Search admin pages
              </label>
              <input
                id="kliniko-admin-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find a section..."
                className="h-full min-w-0 flex-1 bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                  className="text-[var(--muted)] hover:text-[var(--accent)]"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="min-w-0 md:hidden">
              <span className="block truncate text-[15px] font-bold text-[var(--foreground)]">
                Kliniko Admin
              </span>
              <span className="text-[10px] font-medium text-[var(--muted)]">
                Medical CMS
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2.5 text-xs font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] sm:inline-flex"
            >
              <ArrowUpRight size={16} /> View Website
            </Link>
            <button
              type="button"
              aria-label={isDark ? "Use light theme" : "Use dark theme"}
              title="Toggle admin theme"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex h-[41px] w-[41px] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--foreground)] transition-colors hover:text-[var(--accent)]"
            >
              {mounted ? (
                isDark ? (
                  <Sun size={19} />
                ) : (
                  <Moon size={19} />
                )
              ) : (
                <span className="h-5 w-5" />
              )}
            </button>

            <div data-kliniko-profile className="relative">
              <button
                type="button"
                aria-label="Admin profile menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((value) => !value)}
                className="flex h-[43px] items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1.5 pr-2.5 text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
              >
                <Avatar name={admin.name} image={admin.image} size="sm" />
                <span className="hidden max-w-[105px] truncate text-sm font-semibold sm:block">
                  {admin.name}
                </span>
                <ChevronDown
                  size={15}
                  className={`hidden text-[var(--muted)] transition-transform sm:block ${profileOpen ? "rotate-180" : ""}`}
                />
              </button>
              {profileOpen && (
                <div className="absolute top-[51px] right-0 z-50 w-[275px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[0_18px_50px_rgba(12,30,80,0.16)]">
                  <div className="border-b border-[var(--border)] px-3 py-3">
                    <p className="truncate text-sm font-bold text-[var(--foreground)]">
                      {admin.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-[var(--muted)]">
                      {admin.email}
                    </p>
                    {admin.role && (
                      <span className="mt-2 inline-flex rounded-lg bg-[var(--accent-soft)] px-2 py-1 text-[10px] font-bold tracking-wider text-[var(--accent)] uppercase">
                        {admin.role.replaceAll("-", " ")}
                      </span>
                    )}
                  </div>
                  <Link
                    href="/admin/adminusers"
                    onClick={() => setProfileOpen(false)}
                    className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
                  >
                    <UserRound size={17} /> My Profile
                  </Link>
                  <button
                    type="button"
                    disabled={signingOut}
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    <LogOut size={17} />
                    {signingOut ? "Signing out..." : "Sign Out"}
                  </button>
                  {logoutError && (
                    <p role="alert" className="px-3 py-2 text-xs text-red-500">
                      {logoutError}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <main
          id="kliniko-admin-content"
          className="min-h-[calc(100dvh-76px)] px-4 py-6 sm:px-6 xl:px-8 xl:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
