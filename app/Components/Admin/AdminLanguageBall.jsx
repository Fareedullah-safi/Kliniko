"use client";

import {
  ArrowLeftRight,
  Check,
  Globe2,
  Languages,
  MessageSquareOff,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const LANGUAGES = [
  {
    code: "en",
    label: "English",
    nativeLabel: "English (International)",
    direction: "ltr",
    dirBadge: "LTR",
    keyHint: "1",
  },
  {
    code: "ps",
    label: "Pashto",
    nativeLabel: "پښتو (افغانستان)",
    direction: "rtl",
    dirBadge: "RTL",
    keyHint: "2",
  },
  {
    code: "fa",
    label: "Dari",
    nativeLabel: "دری (فارسی دری)",
    direction: "rtl",
    dirBadge: "RTL",
    keyHint: "3",
  },
];

// 24 Professional, executive-grade CMS insights in English, Pashto, and Dari
const PROFESSIONAL_INSIGHTS = [
  "Switch content language anytime",
  "Instant RTL & LTR layout adaptation",
  "Editing multilingual workspace",
  "په پښتو ژبه د منځپانګې سمون چمتو دی",
  "ویرایش محتوا به زبان دری فعال است",
  "All language fields sync seamlessly",
  "Tip: Press 1, 2, or 3 when menu is open",
  "د ژبې بدلون په اتومات ډول خوندي کیږي",
  "تغییر زبان بدون از دست رفتن اطلاعات",
  "Localized SEO metadata ready",
  "Magnetic dock locked to viewport",
  "Global content delivery active",
  "پښتو، دری او انګلیسي ژبې ملاتړ کیږي",
  "پشتیبانی کامل از راست‌چین و چپ‌چین",
  "Enterprise multilingual engine",
  "Real-time directionality switching",
  "Remember to save section changes",
  "د هرې برخې ژباړه په جلا توګه سمبال کړئ",
  "مدیریت هوشمند محتوای چندزبانه",
  "Press ESC anytime to close menu",
  "High-precision typography enabled",
  "Switch between EN, PS, and FA effortlessly",
  "سیستم مدیریت محتوای چندزبانه",
  "د منځپانګې ژبه له دې ځایه بدلولی شئ",
];

const RUBBER_LIMIT = 68;

const rubberBand = (value, limit = RUBBER_LIMIT) =>
  Math.sign(value) * limit * (1 - Math.exp(-Math.abs(value) / (limit * 0.8)));

export default function AdminLanguageBall({
  language = "en",
  onLanguageChange,
  scrollThreshold = 200,
}) {
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [orbHovered, setOrbHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tipsEnabled, setTipsEnabled] = useState(true);
  const [tooltip, setTooltip] = useState(null); // { id, text }
  const [pulseRing, setPulseRing] = useState(false);

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const coreGlobeRef = useRef(null);
  const specularRef = useRef(null);

  const ballCenterRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const springRef = useRef(null);
  const suppressClickRef = useRef(false);
  const menuOpenRef = useRef(false);
  const tipsEnabledRef = useRef(true);
  const greetedRef = useRef(false);
  const insightIndexRef = useRef(0);

  const tooltipTimerRef = useRef(null);
  const idleTimerRef = useRef(null);

  const activeLanguage =
    LANGUAGES.find((item) => item.code === language) || LANGUAGES[0];

  /* ---------------------------------- Utils --------------------------------- */

  const updateBallCenter = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    ballCenterRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }, []);

  const showInsight = useCallback((text, duration = 3200) => {
    if (!tipsEnabledRef.current) return;
    clearTimeout(tooltipTimerRef.current);
    setTooltip({ id: Date.now(), text });
    if (duration > 0) {
      tooltipTimerRef.current = setTimeout(() => setTooltip(null), duration);
    }
  }, []);

  /* -------------------- Auto-Rotating Professional Insights ------------------ */

  const scheduleNextInsight = useCallback(() => {
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      if (menuOpenRef.current || dragRef.current || !tipsEnabledRef.current) {
        scheduleNextInsight();
        return;
      }
      const nextText =
        PROFESSIONAL_INSIGHTS[
          insightIndexRef.current % PROFESSIONAL_INSIGHTS.length
        ];
      insightIndexRef.current += 1;
      showInsight(nextText, 3600);
      scheduleNextInsight();
    }, 12000);
  }, [showInsight]);

  useEffect(() => {
    menuOpenRef.current = menuOpen;
    if (menuOpen) setTooltip(null);
  }, [menuOpen]);

  useEffect(() => {
    tipsEnabledRef.current = tipsEnabled;
    if (!tipsEnabled) setTooltip(null);
  }, [tipsEnabled]);

  useEffect(() => {
    scheduleNextInsight();
    return () => {
      clearTimeout(idleTimerRef.current);
      clearTimeout(tooltipTimerRef.current);
    };
  }, [scheduleNextInsight]);

  /* ---------------------------- Scroll Visibility --------------------------- */

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > scrollThreshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollThreshold]);

  useEffect(() => {
    if (!visible) setMenuOpen(false);
  }, [visible]);

  useEffect(() => {
    if (!visible || greetedRef.current) return;
    greetedRef.current = true;
    const t = setTimeout(() => {
      showInsight(
        `Editing in ${activeLanguage.label} (${activeLanguage.dirBadge})`,
        3200,
      );
    }, 650);
    return () => clearTimeout(t);
  }, [visible, activeLanguage, showInsight]);

  /* ------------------- 3D Specular & Parallax Cursor Tracking --------------- */

  useEffect(() => {
    updateBallCenter();
    window.addEventListener("resize", updateBallCenter);
    return () => window.removeEventListener("resize", updateBallCenter);
  }, [updateBallCenter]);

  useEffect(() => {
    let raf = 0;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    const onMove = (event) => {
      const { x, y } = ballCenterRef.current;
      const dx = event.clientX - x;
      const dy = event.clientY - y;
      const angle = Math.atan2(dy, dx);
      const dist = Math.min(Math.hypot(dx, dy) / 36, 3.2);
      target.x = Math.cos(angle) * dist;
      target.y = Math.sin(angle) * dist;
    };

    const tick = () => {
      current.x += (target.x - current.x) * 0.14;
      current.y += (target.y - current.y) * 0.14;

      if (coreGlobeRef.current) {
        coreGlobeRef.current.style.transform = `translate3d(${current.x.toFixed(
          2,
        )}px, ${current.y.toFixed(2)}px, 0)`;
      }
      if (specularRef.current) {
        specularRef.current.style.transform = `translate3d(${(
          current.x * -1.4
        ).toFixed(2)}px, ${(current.y * -1.4).toFixed(2)}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  /* --------------------- Outside Click & Keyboard Shortcuts ----------------- */

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (["1", "2", "3"].includes(event.key)) {
        const picked = LANGUAGES[Number(event.key) - 1];
        if (picked) {
          event.preventDefault();
          selectLanguage(picked.code);
        }
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  });

  useEffect(() => {
    if (!menuOpen) return;
    const t = setTimeout(() => {
      const active = menuRef.current?.querySelector('[aria-checked="true"]');
      const first = menuRef.current?.querySelector('[role="menuitemradio"]');
      (active || first)?.focus({ preventScroll: true });
    }, 50);
    return () => clearTimeout(t);
  }, [menuOpen]);

  const handleMenuKeyDown = (event) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const items = Array.from(
      menuRef.current?.querySelectorAll('[role="menuitemradio"]') ?? [],
    );
    if (!items.length) return;
    event.preventDefault();
    const index = items.indexOf(document.activeElement);
    let next = 0;
    if (event.key === "ArrowDown")
      next = index < 0 ? 0 : (index + 1) % items.length;
    else if (event.key === "ArrowUp")
      next =
        index < 0
          ? items.length - 1
          : (index - 1 + items.length) % items.length;
    else if (event.key === "End") next = items.length - 1;
    items[next]?.focus();
  };

  /* -------------------- Magnetic Dock Resistance Physics -------------------- */

  const applyDrag = (dx, dy) => {
    const el = triggerRef.current;
    if (el) {
      el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    }
    setDragOffset({ x: dx, y: dy });
  };

  const handlePointerDownOrb = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    springRef.current?.cancel();
    dragRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      dx: 0,
      dy: 0,
    };
    try {
      triggerRef.current?.setPointerCapture(event.pointerId);
    } catch {
      /* noop */
    }
  };

  const handlePointerMoveOrb = (event) => {
    const d = dragRef.current;
    if (!d || d.id !== event.pointerId) return;

    const rawX = event.clientX - d.startX;
    const rawY = event.clientY - d.startY;

    if (!d.moved && Math.hypot(rawX, rawY) > 6) {
      d.moved = true;
      suppressClickRef.current = true;
      setDragging(true);
      setMenuOpen(false);
    }

    if (d.moved) {
      d.dx = rubberBand(rawX);
      d.dy = rubberBand(rawY);
      applyDrag(d.dx, d.dy);
      updateBallCenter();
    }
  };

  const releaseDrag = (event, cancelled) => {
    const d = dragRef.current;
    if (!d || (event && d.id !== event.pointerId)) return;
    dragRef.current = null;
    if (!d.moved) return;

    setDragging(false);
    setDragOffset({ x: 0, y: 0 });
    const el = triggerRef.current;

    if (el && !cancelled) {
      const { dx, dy } = d;
      const anim = el.animate(
        [
          { transform: `translate3d(${dx}px, ${dy}px, 0)` },
          {
            transform: `translate3d(${dx * -0.18}px, ${dy * -0.18}px, 0)`,
            offset: 0.55,
          },
          {
            transform: `translate3d(${dx * 0.05}px, ${dy * 0.05}px, 0)`,
            offset: 0.82,
          },
          { transform: "translate3d(0px, 0px, 0)" },
        ],
        { duration: 540, easing: "cubic-bezier(.22, 1.2, .36, 1)" },
      );
      springRef.current = anim;
      anim.onfinish = () => {
        el.style.transform = "";
      };
    } else if (el) {
      el.style.transform = "";
    }

    showInsight("Docked to workspace anchor", 2000);
    updateBallCenter();
    scheduleNextInsight();
  };

  const handleClickOrb = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    setMenuOpen((current) => !current);
    scheduleNextInsight();
  };

  /* --------------------------- Language Selection --------------------------- */

  const selectLanguage = (code) => {
    if (code !== language) {
      onLanguageChange?.(code);
      const selected = LANGUAGES.find((l) => l.code === code);
      setPulseRing(true);
      setTimeout(() => setPulseRing(false), 700);
      if (selected) {
        showInsight(
          `Switched to ${selected.label} (${selected.dirBadge})`,
          2600,
        );
      }
    }
    setMenuOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
    scheduleNextInsight();
  };

  /* --------------------------------- Render --------------------------------- */

  return (
    <div
      ref={containerRef}
      className={`fixed top-20 right-6 z-[1000] ${
        visible
          ? "pointer-events-auto visible translate-y-0 scale-100 opacity-100"
          : "pointer-events-none invisible -translate-y-5 scale-90 opacity-0"
      } transition-[opacity,transform,visibility] duration-500 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none`}
    >
      {/* Magnetic Anchor Tether SVG (Visible when dragged) */}
      {dragging && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute -inset-24 h-[252px] w-[252px] overflow-visible"
        >
          <defs>
            <linearGradient id="tetherGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1D8B8A" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#35B5B5" stopOpacity="0.65" />
            </linearGradient>
          </defs>
          <circle
            cx="126"
            cy="126"
            r="5"
            fill="none"
            stroke="#1D8B8A"
            strokeWidth="1.5"
            strokeDasharray="2 2"
            opacity="0.5"
          />
          <line
            x1="126"
            y1="126"
            x2={126 + dragOffset.x}
            y2={126 + dragOffset.y}
            stroke="url(#tetherGrad)"
            strokeWidth="2"
            strokeDasharray="4 3"
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* Executive Status Insight Pill */}
      {tooltip && !menuOpen && (
        <div
          key={tooltip.id}
          dir="auto"
          className="pointer-events-none absolute top-1/2 right-[74px] z-10 animate-[pillIn_260ms_cubic-bezier(.16,1,.3,1)_both]"
        >
          <div className="flex items-center gap-2 rounded-full border border-teal-700/15 bg-white/92 px-3.5 py-1.5 text-[11.5px] font-medium whitespace-nowrap text-slate-700 shadow-[0_10px_30px_rgba(12,30,33,0.12)] backdrop-blur-xl dark:border-teal-400/20 dark:bg-slate-900/92 dark:text-slate-200">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1D8B8A] shadow-[0_0_8px_#35B5B5]" />
            <span>{tooltip.text}</span>
          </div>
        </div>
      )}

      {/* Precision Optical Glass Orb */}
      <button
        ref={triggerRef}
        type="button"
        data-open={menuOpen}
        onClick={handleClickOrb}
        onPointerDown={handlePointerDownOrb}
        onPointerMove={handlePointerMoveOrb}
        onPointerUp={(e) => releaseDrag(e, false)}
        onPointerCancel={(e) => releaseDrag(e, true)}
        onMouseEnter={() => setOrbHovered(true)}
        onMouseLeave={() => setOrbHovered(false)}
        aria-label={`Content language: ${activeLanguage.label} (${activeLanguage.dirBadge})`}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        title={`Content language: ${activeLanguage.label}`}
        className={`alb-orb group relative isolate grid h-[60px] w-[60px] cursor-pointer [touch-action:none] place-items-center rounded-full border border-white/75 text-slate-800 shadow-[0_10px_32px_rgba(12,30,33,0.16),inset_0_1.5px_2px_rgba(255,255,255,0.95),inset_0_-6px_14px_rgba(29,139,138,0.18)] backdrop-blur-2xl backdrop-saturate-150 select-none focus-visible:ring-4 focus-visible:ring-[#1D8B8A]/30 focus-visible:outline-none motion-safe:animate-[orbFloat_5s_ease-in-out_infinite] dark:border-teal-300/25 ${
          dragging ? "cursor-grabbing" : ""
        } ${
          menuOpen
            ? "border-[#1D8B8A]/50 shadow-[0_14px_38px_rgba(29,139,138,0.26),0_0_0_4px_rgba(29,139,138,0.12)]"
            : ""
        }`}
        style={{
          background:
            "radial-gradient(circle at 28% 22%, rgba(255,255,255,0.98), rgba(255,255,255,0.52) 34%, transparent 60%), radial-gradient(circle at 74% 80%, rgba(29,139,138,0.28), transparent 56%), linear-gradient(145deg, rgba(255,255,255,0.58), rgba(240,253,250,0.32))",
        }}
      >
        {/* Dynamic Cursor-Tracked Specular Highlight */}
        <span
          ref={specularRef}
          className="pointer-events-none absolute top-2 left-2.5 h-3.5 w-6 rotate-[-28deg] rounded-full bg-white/80 blur-[1.5px]"
        />

        {/* Inner Machined Bezel Ring */}
        <span className="pointer-events-none absolute inset-[4px] rounded-full border border-teal-900/10 dark:border-white/15" />

        {/* Rotating Orbital Ring on Hover/Open */}
        <span
          className={`pointer-events-none absolute inset-[7px] rounded-full border border-dashed border-[#1D8B8A]/35 transition-transform duration-700 ${
            orbHovered || menuOpen
              ? "scale-105 rotate-90"
              : "scale-100 rotate-0"
          }`}
        />

        {/* Ambient Bexon Teal Glow */}
        <span className="pointer-events-none absolute -inset-1.5 -z-10 rounded-full bg-[#1D8B8A]/18 blur-xl transition duration-300 group-hover:scale-125 group-hover:bg-[#35B5B5]/30" />

        {/* Ripple Pulse Ring on Language Switch */}
        {pulseRing && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 animate-[ringPulse_650ms_ease-out_forwards] rounded-full border-2 border-[#1D8B8A]"
          />
        )}

        {/* 3D Parallax Globe Core */}
        <span
          ref={coreGlobeRef}
          className="relative grid place-items-center text-[#167575] transition-colors duration-300 group-hover:text-[#0C1E21] dark:text-teal-700"
        >
          {orbHovered || menuOpen ? (
            <Languages
              size={25}
              strokeWidth={1.75}
              className="scale-105 transition-transform duration-300"
            />
          ) : (
            <Globe2
              size={26}
              strokeWidth={1.65}
              className="transition-transform duration-300"
            />
          )}
        </span>

        {/* Precision Language Code Badge */}
        <span className="absolute -right-1 -bottom-1 grid h-[23px] min-w-[23px] place-items-center rounded-full border-2 border-white bg-gradient-to-br from-[#35B5B5] via-[#1D8B8A] to-[#0C1E21] px-1.5 text-[9px] font-extrabold tracking-wider text-white uppercase shadow-md">
          {activeLanguage.code}
        </span>
      </button>

      {/* Executive Glassmorphic Language Dropdown */}
      {menuOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Choose content language"
          onKeyDown={handleMenuKeyDown}
          className="absolute top-[72px] right-0 w-[292px] origin-top-right animate-[panelIn_220ms_cubic-bezier(.16,1,.3,1)_both] rounded-[22px] border border-white/65 bg-white/90 p-2.5 text-slate-900 shadow-[0_24px_68px_rgba(12,30,33,0.18)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-slate-900/90 dark:text-slate-100"
        >
          {/* Menu Header */}
          <div className="mb-2 flex items-center justify-between border-b border-slate-200/80 px-2.5 pt-2 pb-3 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[12px] bg-[#1D8B8A]/12 text-[#167575] dark:text-teal-300">
                <Languages size={20} strokeWidth={1.85} />
              </div>

              <div>
                <p className="text-[13px] font-bold tracking-tight">
                  Content Language
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  Select active editing locale
                </p>
              </div>
            </div>

            {/* Toggle Auto-Insights Button */}
            <button
              type="button"
              onClick={() => setTipsEnabled((prev) => !prev)}
              title={
                tipsEnabled ? "Pause status insights" : "Enable status insights"
              }
              aria-label={
                tipsEnabled ? "Pause status insights" : "Enable status insights"
              }
              className={`grid h-8 w-8 place-items-center rounded-lg border transition-colors ${
                tipsEnabled
                  ? "border-[#1D8B8A]/25 bg-[#1D8B8A]/10 text-[#167575] dark:text-teal-300"
                  : "border-slate-200 bg-slate-100/70 text-slate-400 dark:border-white/10 dark:bg-white/5"
              }`}
            >
              {tipsEnabled ? (
                <MessageSquareText size={14} />
              ) : (
                <MessageSquareOff size={14} />
              )}
            </button>
          </div>

          {/* Scrollable Language Options */}
          <div className="alb-scroll grid max-h-[240px] gap-1 overflow-y-auto overscroll-contain pr-0.5">
            {LANGUAGES.map((item, index) => {
              const isActive = item.code === language;

              return (
                <button
                  key={item.code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActive}
                  onClick={() => selectLanguage(item.code)}
                  style={{ animationDelay: `${index * 40}ms` }}
                  className={`flex w-full animate-[itemIn_220ms_ease-out_both] items-center gap-3 rounded-[14px] border p-2.5 text-left transition duration-200 hover:translate-x-0.5 hover:bg-[#1D8B8A]/[0.07] focus-visible:ring-2 focus-visible:ring-[#1D8B8A]/40 focus-visible:outline-none ${
                    isActive
                      ? "border-[#1D8B8A]/25 bg-[#1D8B8A]/10"
                      : "border-transparent"
                  }`}
                >
                  {/* Locale Code Box */}
                  <span
                    className={`grid h-[40px] w-[40px] shrink-0 place-items-center rounded-[12px] border text-[12px] font-extrabold transition-colors ${
                      isActive
                        ? "border-[#1D8B8A]/30 bg-[#1D8B8A] text-white shadow-sm"
                        : "border-slate-200/90 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                    }`}
                  >
                    {item.code.toUpperCase()}
                  </span>

                  {/* Language Name & Native Label */}
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className="flex items-center gap-2 text-[13px] leading-5 font-bold">
                      <span>{item.label}</span>
                      <span className="py-0.2 inline-flex items-center gap-0.5 rounded-md border border-slate-200/80 bg-slate-100/80 px-1.5 text-[9px] font-bold tracking-wider text-slate-500 uppercase dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                        <ArrowLeftRight size={9} />
                        {item.dirBadge}
                      </span>
                    </span>
                    <span
                      dir={item.direction}
                      className="truncate text-xs leading-5 text-slate-500 dark:text-slate-400"
                    >
                      {item.nativeLabel}
                    </span>
                  </span>

                  {/* Active Checkmark or Shortcut Key Hint */}
                  {isActive ? (
                    <span className="grid h-6 w-6 shrink-0 animate-[checkIn_180ms_ease-out_both] place-items-center rounded-full bg-[#167575] text-white shadow-sm">
                      <Check size={13} strokeWidth={2.6} />
                    </span>
                  ) : (
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded border border-slate-200/80 bg-slate-50/80 text-[10px] font-semibold text-slate-400 dark:border-white/10 dark:bg-white/5">
                      {item.keyHint}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Menu Footer */}
          <div className="mt-2 flex items-center justify-between border-t border-slate-200/80 px-2.5 pt-2.5 pb-1 text-[11px] text-slate-500 dark:border-white/10 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles size={13} className="text-[#1D8B8A]" />
              <span>Active: {activeLanguage.label}</span>
            </span>
            <span className="rounded bg-[#1D8B8A]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#167575] dark:text-teal-300">
              {activeLanguage.dirBadge} Mode
            </span>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes orbFloat {
          0%,
          100% {
            translate: 0 0;
          }
          50% {
            translate: 0 -3px;
          }
        }

        @keyframes panelIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
            filter: blur(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes itemIn {
          from {
            opacity: 0;
            transform: translateX(8px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes checkIn {
          from {
            opacity: 0;
            transform: scale(0.65);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pillIn {
          from {
            opacity: 0;
            transform: translate(8px, -50%) scale(0.92);
          }
          to {
            opacity: 1;
            transform: translate(0, -50%) scale(1);
          }
        }

        @keyframes ringPulse {
          from {
            opacity: 0.75;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(1.55);
          }
        }

        .alb-orb {
          transition:
            scale 0.28s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 0.28s ease,
            border-color 0.28s ease;
        }
        .alb-orb:hover {
          scale: 1.07;
        }
        .alb-orb[data-open="true"] {
          scale: 1.05;
        }

        .alb-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(29, 139, 138, 0.35) transparent;
        }
        .alb-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .alb-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .alb-scroll::-webkit-scrollbar-thumb {
          background: rgba(29, 139, 138, 0.35);
          border-radius: 999px;
        }
        .alb-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(29, 139, 138, 0.55);
        }

        @media (prefers-reduced-motion: reduce) {
          .alb-orb {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
