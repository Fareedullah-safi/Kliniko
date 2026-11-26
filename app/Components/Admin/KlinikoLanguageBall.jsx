"use client";

import {
  ArrowLeftRight,
  Check,
  Globe2,
  Languages,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";

import { useKlinikoLanguage } from "@/app/Components/Admin/Kliniko/KlinikoLanguageProvider";

const PAGE_SIZE = 50;
const RUBBER_LIMIT = 68;

function rubberBand(value) {
  return (
    Math.sign(value) *
    RUBBER_LIMIT *
    (1 - Math.exp(-Math.abs(value) / (RUBBER_LIMIT * 0.8)))
  );
}

export default function KlinikoLanguageBall({ scrollThreshold = 0 }) {
  const { languages, language, setLanguage, ready, error } =
    useKlinikoLanguage();

  const [visible, setVisible] = useState(scrollThreshold <= 0);

  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pulse, setPulse] = useState(false);

  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [tip, setTip] = useState("");

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const searchRef = useRef(null);
  const coreRef = useRef(null);
  const shineRef = useRef(null);

  const dragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const springRef = useRef(null);
  const tipTimerRef = useRef(null);
  const pulseTimerRef = useRef(null);

  // ==========================================
  // ALL ENABLED LANGUAGES FROM DATABASE
  // ==========================================

  const enabledLanguages = useMemo(
    () =>
      (Array.isArray(languages) ? languages : []).filter(
        (item) => item.enabled !== false,
      ),
    [languages],
  );

  const selected =
    enabledLanguages.find((item) => item.code === language) ||
    enabledLanguages[0];

  // ==========================================
  // DYNAMIC SEARCH
  // ==========================================

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    if (!query) return enabledLanguages;

    return enabledLanguages.filter((item) =>
      [item.code, item.name, item.nativeName, item.direction]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase()
        .includes(query),
    );
  }, [enabledLanguages, search]);

  // Render 50 entries initially.
  // Load additional entries when scrolling.
  const shown = filtered.slice(0, visibleCount);

  // ==========================================
  // SCROLL VISIBILITY
  // ==========================================

  useEffect(() => {
    if (scrollThreshold <= 0) {
      setVisible(true);
      return;
    }

    const onScroll = () => setVisible(window.scrollY >= scrollThreshold);

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollThreshold]);

  useEffect(() => {
    if (!visible) setMenuOpen(false);
  }, [visible]);

  // ==========================================
  // CLICK OUTSIDE / ESCAPE
  // ==========================================

  useEffect(() => {
    if (!menuOpen) return;

    searchRef.current?.focus({
      preventScroll: true,
    });

    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);

        triggerRef.current?.focus({
          preventScroll: true,
        });
      }
    };

    document.addEventListener("pointerdown", onPointerDown);

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);

      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    return () => {
      window.clearTimeout(tipTimerRef.current);
      window.clearTimeout(pulseTimerRef.current);
      springRef.current?.cancel?.();
    };
  }, []);

  // ==========================================
  // STATUS INSIGHT
  // ==========================================

  function flashTip(message) {
    window.clearTimeout(tipTimerRef.current);

    setTip(message);

    tipTimerRef.current = window.setTimeout(() => setTip(""), 2300);
  }

  // ==========================================
  // SELECT LANGUAGE
  // ==========================================

  function chooseLanguage(code) {
    if (code !== language) {
      setLanguage(code);
      setPulse(true);

      window.clearTimeout(pulseTimerRef.current);

      pulseTimerRef.current = window.setTimeout(() => setPulse(false), 700);

      const item = enabledLanguages.find((entry) => entry.code === code);

      if (item) {
        flashTip(`Editing in ${item.name} (${item.direction.toUpperCase()})`);
      }
    }

    setMenuOpen(false);
    setSearch("");
    setVisibleCount(PAGE_SIZE);

    triggerRef.current?.focus({
      preventScroll: true,
    });
  }

  // ==========================================
  // SEARCH INPUT
  // ==========================================

  function handleSearch(value) {
    setSearch(value);
    setVisibleCount(PAGE_SIZE);

    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }

  // ==========================================
  // INFINITE SCROLL / BATCH LOADING
  // ==========================================

  function loadNextBatch(event) {
    const node = event.currentTarget;

    const reachedBottom =
      node.scrollTop + node.clientHeight >= node.scrollHeight - 90;

    if (reachedBottom) {
      setVisibleCount((count) => Math.min(count + PAGE_SIZE, filtered.length));
    }
  }

  // ==========================================
  // KEYBOARD NAVIGATION
  // ==========================================

  function handleListKeyDown(event) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      return;
    }

    const nodes = Array.from(
      listRef.current?.querySelectorAll('button[role="option"]') || [],
    );

    if (!nodes.length) return;

    event.preventDefault();

    const current = nodes.indexOf(document.activeElement);

    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? nodes.length - 1
          : event.key === "ArrowDown"
            ? (current + 1) % nodes.length
            : (current - 1 + nodes.length) % nodes.length;

    nodes[next]?.focus();
  }

  // ==========================================
  // 3D PARALLAX GLOBE
  // ==========================================

  function moveGlobe(event) {
    const node = triggerRef.current;

    if (!node) return;

    const rect = node.getBoundingClientRect();

    const dx = Math.max(
      -3,
      Math.min(3, (event.clientX - (rect.left + rect.width / 2)) / 12),
    );

    const dy = Math.max(
      -3,
      Math.min(3, (event.clientY - (rect.top + rect.height / 2)) / 12),
    );

    if (coreRef.current) {
      coreRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    }

    if (shineRef.current) {
      shineRef.current.style.transform = `translate3d(${-dx * 1.4}px, ${
        -dy * 1.4
      }px, 0) rotate(-28deg)`;
    }
  }

  function resetGlobe() {
    setHovered(false);

    if (coreRef.current) {
      coreRef.current.style.transform = "";
    }

    if (shineRef.current) {
      shineRef.current.style.transform = "rotate(-28deg)";
    }
  }

  // ==========================================
  // MAGNETIC ORB DRAGGING
  // ==========================================

  function handleOrbPointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    springRef.current?.cancel?.();

    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      moved: false,
      dx: 0,
      dy: 0,
    };

    try {
      triggerRef.current?.setPointerCapture(event.pointerId);
    } catch {}
  }

  function handleOrbPointerMove(event) {
    moveGlobe(event);

    const drag = dragRef.current;

    if (!drag || drag.id !== event.pointerId) {
      return;
    }

    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;

    if (!drag.moved && Math.hypot(dx, dy) > 6) {
      drag.moved = true;

      suppressClickRef.current = true;

      setDragging(true);
      setMenuOpen(false);
    }

    if (drag.moved && triggerRef.current) {
      drag.dx = rubberBand(dx);
      drag.dy = rubberBand(dy);

      triggerRef.current.style.transform = `translate3d(${drag.dx}px, ${drag.dy}px, 0)`;
    }
  }

  function handleOrbPointerUp(event) {
    const drag = dragRef.current;

    if (!drag || drag.id !== event.pointerId) {
      return;
    }

    dragRef.current = null;

    setDragging(false);

    if (!drag.moved) return;

    const orb = triggerRef.current;

    if (!orb) return;

    springRef.current = orb.animate(
      [
        {
          transform: `translate3d(${drag.dx}px, ${drag.dy}px, 0)`,
        },
        {
          transform: `translate3d(${
            -drag.dx * 0.15
          }px, ${-drag.dy * 0.15}px, 0)`,
          offset: 0.62,
        },
        {
          transform: "translate3d(0, 0, 0)",
        },
      ],
      {
        duration: 520,
        easing: "cubic-bezier(.22,1.2,.36,1)",
      },
    );

    orb.style.transform = "";
  }

  function handleOrbClick() {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    setTip("");

    if (!menuOpen) {
      setSearch("");
      setVisibleCount(PAGE_SIZE);
    }

    setMenuOpen((open) => !open);
  }

  // ==========================================
  // COMPONENT UI
  // ==========================================

  return (
    <div
      ref={containerRef}
      className={`fixed top-20 right-3 z-[1000] transition-[opacity,transform,visibility] duration-300 sm:right-6 ${
        visible
          ? "visible translate-y-0 opacity-100"
          : "pointer-events-none invisible -translate-y-4 opacity-0"
      }`}
    >
      {/* STATUS INSIGHT PILL */}
      {tip && !menuOpen && (
        <div
          role="status"
          dir="auto"
          className="pointer-events-none absolute top-1/2 right-[72px] z-10 -translate-y-1/2 rounded-full border border-teal-700/15 bg-white/95 px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap text-slate-700 shadow-xl backdrop-blur-xl dark:border-teal-400/20 dark:bg-slate-900/95 dark:text-slate-100"
        >
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#1D8B8A]" />

          {tip}
        </div>
      )}

      {/* 3D GLASS ORB */}
      <button
        ref={triggerRef}
        type="button"
        data-open={menuOpen}
        onClick={handleOrbClick}
        onPointerDown={handleOrbPointerDown}
        onPointerMove={handleOrbPointerMove}
        onPointerUp={handleOrbPointerUp}
        onPointerCancel={handleOrbPointerUp}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={resetGlobe}
        aria-label={`Content language: ${selected?.name || "English"}`}
        aria-expanded={menuOpen}
        aria-haspopup="dialog"
        title={`Content language: ${selected?.name || "English"}`}
        className={`alb-orb group relative isolate grid h-[60px] w-[60px] cursor-pointer touch-none place-items-center rounded-full border border-white/75 text-slate-800 shadow-[0_10px_32px_rgba(12,30,33,0.16),inset_0_1.5px_2px_rgba(255,255,255,0.95),inset_0_-6px_14px_rgba(29,139,138,0.18)] backdrop-blur-2xl backdrop-saturate-150 select-none focus-visible:ring-4 focus-visible:ring-[#1D8B8A]/30 focus-visible:outline-none motion-safe:animate-[orbFloat_5s_ease-in-out_infinite] dark:border-teal-300/25 ${
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
        {/* SPECULAR HIGHLIGHT */}
        <span
          ref={shineRef}
          className="pointer-events-none absolute top-2 left-2.5 h-3.5 w-6 -rotate-[28deg] rounded-full bg-white/80 blur-[1.5px]"
        />

        {/* INNER BEZEL */}
        <span className="pointer-events-none absolute inset-[4px] rounded-full border border-teal-900/10 dark:border-white/15" />

        {/* ORBITAL RING */}
        <span
          className={`pointer-events-none absolute inset-[7px] rounded-full border border-dashed border-[#1D8B8A]/35 transition-transform duration-700 ${
            hovered || menuOpen ? "scale-105 rotate-90" : "scale-100 rotate-0"
          }`}
        />

        {/* TEAL GLOW */}
        <span className="pointer-events-none absolute -inset-1.5 -z-10 rounded-full bg-[#1D8B8A]/15 blur-xl transition group-hover:scale-125 group-hover:bg-[#35B5B5]/30" />

        {/* LANGUAGE CHANGE PULSE */}
        {pulse && (
          <span className="pointer-events-none absolute inset-0 animate-[ringPulse_650ms_ease-out_forwards] rounded-full border-2 border-[#1D8B8A]" />
        )}

        {/* GLOBE */}
        <span
          ref={coreRef}
          className="relative grid place-items-center text-[#167575]"
        >
          {hovered || menuOpen ? (
            <Languages size={25} strokeWidth={1.75} />
          ) : (
            <Globe2 size={26} strokeWidth={1.65} />
          )}
        </span>

        {/* ACTIVE LANGUAGE BADGE */}
        <span className="absolute -right-1 -bottom-1 grid h-[23px] min-w-[23px] place-items-center rounded-full border-2 border-white bg-gradient-to-br from-[#35B5B5] via-[#1D8B8A] to-[#0C1E21] px-1.5 text-[9px] font-extrabold tracking-wider text-white uppercase shadow-md">
          {selected?.code?.toUpperCase() || "EN"}
        </span>
      </button>

      {/* ======================================
          SEARCHABLE LANGUAGE DROPDOWN
      ====================================== */}

      {menuOpen && (
        <section
          role="dialog"
          aria-label="Choose content language"
          className="alb-panel absolute top-[72px] right-0 max-h-[calc(100dvh-164px)] w-[min(340px,calc(100vw-24px))] origin-top-right overflow-y-auto rounded-[22px] border border-white/65 bg-white/95 p-2.5 text-slate-900 shadow-[0_24px_68px_rgba(12,30,33,0.18)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-slate-900/95 dark:text-slate-100"
        >
          {/* DROPDOWN HEADER */}
          <div className="mb-2 flex items-center justify-between border-b border-slate-200/80 px-2.5 pt-2 pb-3 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[12px] bg-[#1D8B8A]/10 text-[#167575] dark:text-teal-300">
                <Languages size={20} strokeWidth={1.85} />
              </div>

              <div>
                <p className="text-[13px] font-bold tracking-tight">
                  Content Language
                </p>

                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  {error
                    ? "Language API unavailable — showing fallback"
                    : ready
                      ? `${enabledLanguages.length} languages available`
                      : "Loading languages..."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close language selector"
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200/80 text-slate-500 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10"
            >
              <X size={15} />
            </button>
          </div>

          {/* SEARCH LANGUAGE */}
          <div className="relative mb-2">
            <button
              type="button"
              aria-label="Focus language search"
              onClick={() => searchRef.current?.focus()}
              className="absolute top-1/2 left-2 -translate-y-1/2 rounded-md p-1 text-[#1D8B8A] hover:bg-[#1D8B8A]/10"
            >
              <Search size={16} />
            </button>

            <input
              ref={searchRef}
              type="search"
              aria-label="Search languages"
              placeholder="Search languages..."
              dir="auto"
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();

                  listRef.current
                    ?.querySelector('button[role="option"]')
                    ?.focus();
                }
              }}
              className="w-full rounded-xl border border-slate-200/90 bg-slate-50/90 py-3 pr-3 pl-10 text-[13px] transition outline-none focus:border-[#1D8B8A] focus:ring-2 focus:ring-[#1D8B8A]/15 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>

          {/* ======================================
              INFINITE SCROLL LANGUAGE LIST
          ====================================== */}

          <div
            ref={listRef}
            role="listbox"
            aria-label="Available languages"
            onScroll={loadNextBatch}
            onKeyDown={handleListKeyDown}
            className="alb-scroll grid max-h-[min(45vh,320px)] gap-1 overflow-y-auto overscroll-contain pr-0.5"
          >
            {shown.length === 0 ? (
              <p className="p-5 text-center text-xs text-slate-500 dark:text-slate-400">
                {error && !ready
                  ? "Could not load languages."
                  : "No matching languages"}
              </p>
            ) : (
              shown.map((item) => {
                const active = item.code === language;

                return (
                  <button
                    key={item.code}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => chooseLanguage(item.code)}
                    className={`flex w-full items-center gap-3 rounded-[14px] border p-2.5 text-left transition duration-200 hover:translate-x-0.5 hover:bg-[#1D8B8A]/[0.07] focus-visible:ring-2 focus-visible:ring-[#1D8B8A]/40 focus-visible:outline-none ${
                      active
                        ? "border-[#1D8B8A]/25 bg-[#1D8B8A]/10"
                        : "border-transparent"
                    }`}
                  >
                    {/* LANGUAGE CODE */}
                    <span
                      className={`grid h-[40px] w-[48px] shrink-0 place-items-center rounded-[12px] border px-1 text-[11px] font-extrabold uppercase ${
                        active
                          ? "border-[#1D8B8A]/30 bg-[#1D8B8A] text-white"
                          : "border-slate-200/90 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                      }`}
                    >
                      {item.code}
                    </span>

                    {/* LANGUAGE DETAILS */}
                    <span className="grid min-w-0 flex-1 gap-0.5">
                      <span className="flex items-center gap-2 text-[13px] leading-5 font-bold">
                        <span className="truncate">
                          {item.name || item.code}
                        </span>

                        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-md border border-slate-200/80 bg-slate-100/80 px-1.5 text-[9px] font-bold tracking-wider text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                          <ArrowLeftRight size={9} />

                          {item.direction === "rtl" ? "RTL" : "LTR"}
                        </span>
                      </span>

                      <span
                        dir={item.direction === "rtl" ? "rtl" : "ltr"}
                        className="truncate text-xs leading-5 text-slate-500 dark:text-slate-400"
                      >
                        {item.nativeName || item.name}
                      </span>
                    </span>

                    {/* SELECTED CHECKMARK */}
                    {active && (
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#167575] text-white shadow-sm">
                        <Check size={13} strokeWidth={2.6} />
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* DROPDOWN FOOTER */}
          <div className="mt-2 flex items-center justify-between border-t border-slate-200/80 px-2.5 pt-2.5 pb-1 text-[11px] text-slate-500 dark:border-white/10 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles size={13} className="text-[#1D8B8A]" />
              {shown.length} of {filtered.length} shown
            </span>

            <span className="rounded bg-[#1D8B8A]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#167575] dark:text-teal-300">
              {selected?.direction === "rtl" ? "RTL" : "LTR"} Mode
            </span>
          </div>
        </section>
      )}

      {/* ======================================
          ORB ANIMATIONS
      ====================================== */}

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

        @keyframes albPanelIn {
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

        .alb-panel {
          animation: albPanelIn 220ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .alb-orb {
          transition:
            scale 0.28s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 0.28s ease;
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

        .alb-scroll::-webkit-scrollbar-thumb {
          background: rgba(29, 139, 138, 0.35);
          border-radius: 99px;
        }

        @media (prefers-reduced-motion: reduce) {
          .alb-panel {
            animation: none;
          }

          .alb-orb {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
