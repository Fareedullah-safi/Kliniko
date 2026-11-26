"use client";

import { useKlinikoLanguage } from "@/app/Components/Admin/Kliniko/KlinikoLanguageProvider";
import PublicLanguageBall from "@/app/Components/Admin/Kliniko/PublicLanguageBall";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  LayoutGrid,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Trash2,
  Upload,
} from "lucide-react";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const API = "/api/navbar";

const PANEL =
  "overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl";

const INPUT =
  "w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]";

const BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";

// ==========================================
// EMPTY NAVBAR DATA
// ==========================================

const blank = () => ({
  content: {
    logo: "",
    logoPublicId: "",
    brand: {},
    searchTitle: {},
    searchSubtitle: {},
    searchPlaceholder: {},
    appointmentText: {},
    appointmentLink: "",
  },
  cards: [],
});

// ==========================================
// TEXT HELPERS
// ==========================================

function plain(text) {
  return String(text || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

// Keep all language codes, not just en/fa/ps.
function allTranslations(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(
        ([code, text]) =>
          /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(code) &&
          typeof text === "string",
      )
      .map(([code, text]) => [code.toLowerCase(), plain(text)]),
  );
}

// ==========================================
// NORMALIZE MONGODB DATA
// ==========================================

function normalize(data) {
  const initial = blank();
  const content = data?.content || {};

  for (const key of [
    "brand",
    "searchTitle",
    "searchSubtitle",
    "searchPlaceholder",
    "appointmentText",
  ]) {
    initial.content[key] = allTranslations(content[key]);
  }

  initial.content.logo = content.logo || "";
  initial.content.logoPublicId = content.logoPublicId || "";
  initial.content.appointmentLink = content.appointmentLink || "";

  initial.cards = (Array.isArray(data?.cards) ? data.cards : []).map(
    (card) => ({
      id: card.id || crypto.randomUUID(),
      label: allTranslations(card.label),
      link: card.link || "",
      parentId: card.parentId || "",
      hasDropdown: card.hasDropdown === "true" ? "true" : "false",
      showInFooter: card.showInFooter === "true" ? "true" : "false",
    }),
  );

  return initial;
}

// ==========================================
// SAFE API RESPONSE
// ==========================================

async function readJson(response) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Navbar API returned HTML (HTTP ${response.status}). Check ${API}.`,
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || `Navbar API error (${response.status})`);
  }

  return data;
}

// ==========================================
// REUSABLE INPUT
// ==========================================

function TextField({ label, value, onChange, dir = "ltr", placeholder = "" }) {
  return (
    <label className="block min-w-0 space-y-2">
      <span className="block text-sm font-semibold">{label}</span>

      <input
        type="text"
        dir={dir}
        className={INPUT}
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

// ==========================================
// NAVBAR ADMIN
// ==========================================

export default function NavigationAdmin() {
  // Language comes from the shared provider.
  // Do not render the Provider inside this page.
  const { language, direction, languages } = useKlinikoLanguage();

  const [draft, setDraft] = useState(blank);
  const [version, setVersion] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);

  const [apiReady, setApiReady] = useState(false);
  const [warning, setWarning] = useState("");
  const [dirty, setDirty] = useState(false);
  const [expanded, setExpanded] = useState({});

  const revision = useRef(0);
  const requestId = useRef(0);
  const widgetRef = useRef(null);
  const isDark = document.documentElement.classList.contains("dark");
  function cloudinaryStyles(isDark) {
    return {
      palette: isDark
        ? {
            window: "#091633",
            windowBorder: "#35BDD0",
            tabIcon: "#35BDD0",
            menuIcons: "#BBCBE0",
            textDark: "#FFFFFF",
            textLight: "#FFFFFF",
            link: "#35BDD0",
            action: "#159BB1",
            inactiveTabIcon: "#8EA3C3",
            error: "#EF4444",
            inProgress: "#35BDD0",
            complete: "#10B981",
            sourceBg: "#101E50",
          }
        : {
            window: "#FFFFFF",
            windowBorder: "#159BB1",
            tabIcon: "#159BB1",
            menuIcons: "#60738B",
            textDark: "#101E50",
            textLight: "#FFFFFF",
            link: "#159BB1",
            action: "#159BB1",
            inactiveTabIcon: "#9BAABA",
            error: "#EF4444",
            inProgress: "#159BB1",
            complete: "#10B981",
            sourceBg: "#F1F8F5",
          },
    };
  }

  const parents = draft.cards.filter((item) => !item.parentId);

  const languageName =
    languages.find((item) => item.code === language)?.nativeName || language;

  const translation = (field) => draft.content[field]?.[language] || "";

  // ========================================
  // LOAD NAVBAR
  // ========================================

  async function load() {
    const id = ++requestId.current;

    setLoading(true);
    setApiReady(false);
    setWarning("");

    try {
      const response = await fetch(API, {
        cache: "no-store",
      });

      const result = await readJson(response);

      if (id !== requestId.current) return;

      // No MongoDB document = empty inputs.
      setDraft(normalize(result.data || {}));
      setVersion(result.version ?? null);
      setDirty(false);
      setApiReady(true);

      revision.current = 0;
    } catch (error) {
      if (id !== requestId.current) return;

      setDraft(blank());
      setVersion(null);
      setDirty(false);
      setWarning(error.message);
    } finally {
      if (id === requestId.current) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    void load();

    return () => {
      requestId.current += 1;
    };
  }, []);

  // ========================================
  // WARN BEFORE LEAVING
  // ========================================

  useEffect(() => {
    const warn = (event) => {
      if (!dirty) return;

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warn);

    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    return () => widgetRef.current?.close?.();
  }, []);

  // ========================================
  // EDIT HELPERS
  // ========================================

  function edit(update) {
    revision.current += 1;
    setDraft((old) => update(old));
    setDirty(true);
  }

  function changeContent(field, value, translated = false) {
    edit((old) => ({
      ...old,

      content: {
        ...old.content,

        [field]: translated
          ? {
              ...old.content[field],
              [language]: value,
            }
          : value,
      },
    }));
  }

  function changeCard(id, field, value) {
    edit((old) => ({
      ...old,

      cards: old.cards.map((card) =>
        card.id === id
          ? {
              ...card,

              [field]:
                field === "label"
                  ? {
                      ...card.label,
                      [language]: value,
                    }
                  : value,
            }
          : card,
      ),
    }));
  }

  // ========================================
  // ADD PARENT / SUB-LINK
  // ========================================

  function addLink(parentId = "") {
    if (draft.cards.length >= 50) {
      return toast.error("Maximum 50 menu links allowed.");
    }

    const id = crypto.randomUUID();

    edit((old) => ({
      ...old,

      cards: [
        ...old.cards.map((item) =>
          item.id === parentId
            ? {
                ...item,
                hasDropdown: "true",
              }
            : item,
        ),

        {
          id,
          label: {},
          link: "/",
          parentId,
          hasDropdown: "false",
          showInFooter: "false",
        },
      ],
    }));

    setExpanded((old) => ({
      ...old,
      [parentId || id]: true,
    }));
  }

  // ========================================
  // DELETE MENU
  // ========================================

  function removeLink(id) {
    if (!window.confirm("Delete this link and its sub-links?")) {
      return;
    }

    edit((old) => ({
      ...old,

      cards: old.cards.filter((item) => item.id !== id && item.parentId !== id),
    }));
  }

  // ========================================
  // REORDER MENUS
  // ========================================

  function moveLink(id, delta) {
    const current = draft.cards.find((item) => item.id === id);

    if (!current) return;

    const siblings = draft.cards.filter(
      (item) => item.parentId === current.parentId,
    );

    const index = siblings.findIndex((item) => item.id === id);

    const next = index + delta;

    if (next < 0 || next >= siblings.length) {
      return;
    }

    edit((old) => {
      if (!current.parentId) {
        // Keep sub-links attached to their parent.
        const roots = old.cards.filter((item) => !item.parentId);

        [roots[index], roots[next]] = [roots[next], roots[index]];

        return {
          ...old,

          cards: roots.flatMap((root) => [
            root,

            ...old.cards.filter((item) => item.parentId === root.id),
          ]),
        };
      }

      const a = old.cards.findIndex((item) => item.id === siblings[index].id);

      const b = old.cards.findIndex((item) => item.id === siblings[next].id);

      const cards = [...old.cards];

      [cards[a], cards[b]] = [cards[b], cards[a]];

      return {
        ...old,
        cards,
      };
    });
  }

  // ========================================
  // CLOUDINARY LOGO UPLOAD
  // ========================================

  async function uploadLogo() {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset || !window.cloudinary?.createUploadWidget) {
      return toast.error("Cloudinary is not configured or ready.");
    }

    setUploading(true);

    try {
      // Verify admin permission.
      await readJson(
        await fetch(`${API}?check=edit`, {
          cache: "no-store",
        }),
      );

      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName,
          uploadPreset,
          folder: "kliniko/images",
          multiple: false,
          sources: ["local", "url"],
          maxFileSize: 5 * 1024 * 1024,
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "svg"],
          styles: cloudinaryStyles(isDark),
        },
        (error, result) => {
          if (error) {
            setUploading(false);

            return toast.error("Logo upload failed.");
          }

          if (result?.event === "success") {
            if (result.info?.secure_url && result.info?.public_id) {
              edit((old) => ({
                ...old,

                content: {
                  ...old.content,

                  logo: result.info.secure_url,

                  logoPublicId: result.info.public_id,
                },
              }));

              toast.success("Logo uploaded. Click Save Changes.");
            }

            setUploading(false);
          }

          if (["close", "abort"].includes(result?.event)) {
            setUploading(false);
          }
        },
      );

      widgetRef.current.open();
    } catch (error) {
      setUploading(false);
      toast.error(error.message);
    }
  }

  // ========================================
  // SAVE TO MONGODB
  // ========================================

  async function save() {
    if (!apiReady || saving || uploading || !dirty) {
      return;
    }

    // English is required as a fallback.
    for (const card of draft.cards) {
      if (!card.label?.en?.trim()) {
        return toast.error("Every menu needs an English name.");
      }

      const link = String(card.link || "").trim();

      if (!link || !link.startsWith("/") || link.startsWith("//")) {
        return toast.error(
          "Every menu URL must start with /, for example /about.",
        );
      }
    }

    const startRevision = revision.current;

    setSaving(true);

    try {
      const response = await fetch(API, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          ...draft,
          version,
        }),
      });

      const result = await readJson(response);

      setVersion(result.version ?? null);

      // Do not overwrite edits made during saving.
      if (startRevision === revision.current) {
        setDraft(normalize(result.data || draft));

        setDirty(false);
      }

      toast.success("Navbar saved successfully.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  // ========================================
  // PAGE JSX
  // ========================================

  return (
    <main className="min-h-screen bg-[var(--background)] pb-20 text-[var(--foreground)]">
      <Script
        src="https://upload-widget.cloudinary.com/latest/global/all.js"
        strategy="afterInteractive"
        onReady={() => setWidgetReady(true)}
      />

      {/* SHARED DYNAMIC LANGUAGE BALL */}
      <PublicLanguageBall />

      <div className="mx-auto max-w-6xl space-y-5">
        {/* HEADER */}
        <header className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[var(--accent)] uppercase">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
            Site Structure
          </div>

          <h1 className="text-2xl font-bold sm:text-3xl">
            Navigation &amp; Header
          </h1>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Logo, CTA, search text, and menu links
          </p>
        </header>

        {loading ? (
          <div className="flex min-h-96 items-center justify-center gap-3">
            <Loader2 size={20} className="animate-spin text-[var(--accent)]" />
            Loading Navbar...
          </div>
        ) : (
          <>
            {/* API NOTICE */}
            {warning && (
              <div
                className={`${PANEL} flex flex-wrap items-center justify-between gap-3 p-4`}
              >
                <div>
                  <p className="text-sm font-semibold">
                    Navbar API unavailable
                  </p>

                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {warning} — Empty inputs shown; saving is disabled.
                  </p>
                </div>

                <button
                  type="button"
                  className={BUTTON}
                  onClick={() => void load()}
                >
                  <RefreshCw size={16} />
                  Retry
                </button>
              </div>
            )}

            {/* ==================================
                GLOBAL SETTINGS
            ================================== */}

            <section className={PANEL}>
              <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
                <h2 className="flex items-center gap-2 font-semibold">
                  <Settings size={18} className="text-[var(--accent)]" />
                  Global Settings ({language.toUpperCase()})
                </h2>
              </div>

              <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-2">
                {/* SITE LOGO */}
                <div className="md:col-span-2">
                  <p className="mb-2 text-sm font-semibold">Site Logo</p>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-20 w-40 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
                      {draft.content.logo ? (
                        <img
                          src={draft.content.logo}
                          alt="Navbar logo"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-[var(--muted)]">
                          No logo
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className={BUTTON}
                        // disabled={!apiReady || uploading || !widgetReady}
                        onClick={uploadLogo}
                      >
                        {uploading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Upload size={16} />
                        )}

                        {draft.content.logo ? "Replace Logo" : "Upload Logo"}
                      </button>

                      {draft.content.logo && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!window.confirm("Remove the logo?")) {
                              return;
                            }

                            edit((old) => ({
                              ...old,

                              content: {
                                ...old.content,
                                logo: "",
                                logoPublicId: "",
                              },
                            }));
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* WEBSITE NAME */}
                <div className="md:col-span-2">
                  <TextField
                    label="Website Name"
                    dir={direction}
                    value={translation("brand")}
                    onChange={(value) => changeContent("brand", value, true)}
                    placeholder="Kliniko"
                  />
                </div>

                {/* CTA BUTTON */}
                <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                  <h3 className="text-sm font-bold text-[var(--accent)]">
                    CTA Button
                  </h3>

                  <TextField
                    label="Label / Name"
                    dir={direction}
                    value={translation("appointmentText")}
                    onChange={(value) =>
                      changeContent("appointmentText", value, true)
                    }
                    placeholder="Make Appointment"
                  />

                  <TextField
                    label="Link URL"
                    value={draft.content.appointmentLink}
                    onChange={(value) =>
                      changeContent("appointmentLink", value)
                    }
                    placeholder="/appointment"
                  />
                </div>

                {/* SEARCH BOX */}
                <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                  <h3 className="text-sm font-bold text-[var(--accent)]">
                    Search Box Text
                  </h3>

                  {[
                    ["searchTitle", "Heading"],
                    ["searchSubtitle", "Subheading"],
                    ["searchPlaceholder", "Placeholder"],
                  ].map(([field, label]) => (
                    <TextField
                      key={field}
                      label={label}
                      dir={direction}
                      value={translation(field)}
                      onChange={(value) => changeContent(field, value, true)}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* ==================================
                MENU LINKS
            ================================== */}

            <section className={PANEL}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4 sm:px-6">
                <h2 className="flex items-center gap-2 font-semibold">
                  <Link2 size={18} className="text-[var(--accent)]" />
                  Menu Links ({parents.length})
                </h2>

                <button
                  type="button"
                  onClick={() => addLink()}
                  className={BUTTON}
                >
                  <Plus size={16} />
                  Add Link
                </button>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                {parents.length === 0 && (
                  <div className="rounded-2xl border-2 border-dashed border-[var(--border)] py-14 text-center">
                    <LayoutGrid
                      size={40}
                      className="mx-auto mb-3 text-[var(--muted)] opacity-50"
                    />

                    <p className="text-sm text-[var(--muted)]">
                      No menu links added yet
                    </p>
                  </div>
                )}

                {parents.map((parent, index) => {
                  const children = draft.cards.filter(
                    (item) => item.parentId === parent.id,
                  );

                  const open = expanded[parent.id] !== false;

                  return (
                    <article
                      key={parent.id}
                      className="overflow-hidden rounded-2xl border border-[var(--border)] shadow-sm"
                    >
                      {/* PARENT HEADER */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            setExpanded((old) => ({
                              ...old,
                              [parent.id]: !open,
                            }))
                          }
                          className="flex items-center gap-2 text-sm font-bold text-[var(--accent)]"
                        >
                          <ChevronDown
                            size={16}
                            className={open ? "rotate-180" : ""}
                          />
                          Link #{index + 1}{" "}
                          {parent.label?.en ? `— ${parent.label.en}` : ""}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label="Move link left"
                            disabled={index === 0}
                            onClick={() => moveLink(parent.id, -1)}
                            className="rounded-lg border border-[var(--border)] p-1.5 disabled:opacity-30"
                          >
                            <ArrowLeft size={16} />
                          </button>

                          <button
                            type="button"
                            aria-label="Move link right"
                            disabled={index === parents.length - 1}
                            onClick={() => moveLink(parent.id, 1)}
                            className="rounded-lg border border-[var(--border)] p-1.5 disabled:opacity-30"
                          >
                            <ArrowRight size={16} />
                          </button>

                          <button
                            type="button"
                            aria-label="Delete link"
                            onClick={() => removeLink(parent.id)}
                            className="rounded-lg px-2.5 py-1.5 text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {open && (
                        <div className="space-y-4 p-4 sm:p-5">
                          {/* MAIN LINK INPUTS */}
                          <div className="grid gap-4 sm:grid-cols-2">
                            <TextField
                              label={`Label (${language.toUpperCase()})`}
                              dir={direction}
                              value={parent.label?.[language] || ""}
                              onChange={(value) =>
                                changeCard(parent.id, "label", value)
                              }
                              placeholder="About Us"
                            />

                            <TextField
                              label="URL"
                              value={parent.link}
                              onChange={(value) =>
                                changeCard(parent.id, "link", value)
                              }
                              placeholder="/about"
                            />
                          </div>

                          {/* CHECKBOXES */}
                          <div className="flex flex-wrap items-center gap-6">
                            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                              <input
                                type="checkbox"
                                className="h-4 w-4 accent-[var(--accent)]"
                                checked={parent.hasDropdown === "true"}
                                onChange={(e) => {
                                  if (!e.target.checked && children.length) {
                                    toast.error(
                                      "Remove sub-links before disabling dropdown.",
                                    );
                                    return;
                                  }

                                  changeCard(
                                    parent.id,
                                    "hasDropdown",
                                    e.target.checked ? "true" : "false",
                                  );
                                }}
                              />
                              Enable Dropdown (Sub-links)
                            </label>

                            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                              <input
                                type="checkbox"
                                className="h-4 w-4 accent-[var(--accent)]"
                                checked={parent.showInFooter === "true"}
                                onChange={(e) =>
                                  changeCard(
                                    parent.id,
                                    "showInFooter",
                                    e.target.checked ? "true" : "false",
                                  )
                                }
                              />
                              Show in Footer
                            </label>
                          </div>

                          {/* SUB-LINKS */}
                          {parent.hasDropdown === "true" && (
                            <div className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                              <div className="mb-3 flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-[var(--muted)]">
                                  Sub-links ({children.length})
                                </span>

                                <button
                                  type="button"
                                  onClick={() => addLink(parent.id)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
                                >
                                  <Plus size={14} />
                                  Add sub-link
                                </button>
                              </div>

                              {children.length === 0 ? (
                                <p className="rounded-xl border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--muted)]">
                                  No sub-links added yet
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {children.map((child, childIndex) => (
                                    <div
                                      key={child.id}
                                      className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 sm:flex-nowrap"
                                    >
                                      {/* REORDER */}
                                      <div className="flex flex-col">
                                        <button
                                          type="button"
                                          aria-label="Move sub-link up"
                                          disabled={childIndex === 0}
                                          onClick={() => moveLink(child.id, -1)}
                                          className="disabled:opacity-30"
                                        >
                                          <ArrowUp size={14} />
                                        </button>

                                        <button
                                          type="button"
                                          aria-label="Move sub-link down"
                                          disabled={
                                            childIndex === children.length - 1
                                          }
                                          onClick={() => moveLink(child.id, 1)}
                                          className="disabled:opacity-30"
                                        >
                                          <ArrowDown size={14} />
                                        </button>
                                      </div>

                                      {/* TRANSLATED NAME */}
                                      <input
                                        dir={direction}
                                        aria-label={`Sub-link label (${language})`}
                                        className="w-full min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)] sm:w-auto"
                                        placeholder="Sub-link name"
                                        value={child.label?.[language] || ""}
                                        onChange={(e) =>
                                          changeCard(
                                            child.id,
                                            "label",
                                            e.target.value,
                                          )
                                        }
                                      />

                                      {/* URL */}
                                      <input
                                        dir="ltr"
                                        aria-label="Sub-link URL"
                                        className="w-full min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)] sm:w-auto"
                                        placeholder="/path"
                                        value={child.link}
                                        onChange={(e) =>
                                          changeCard(
                                            child.id,
                                            "link",
                                            e.target.value,
                                          )
                                        }
                                      />

                                      {/* FOOTER */}
                                      <label
                                        className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold ${
                                          child.showInFooter === "true"
                                            ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                                            : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)]"
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          className="h-3.5 w-3.5 accent-[var(--accent)]"
                                          checked={
                                            child.showInFooter === "true"
                                          }
                                          onChange={(e) =>
                                            changeCard(
                                              child.id,
                                              "showInFooter",
                                              e.target.checked
                                                ? "true"
                                                : "false",
                                            )
                                          }
                                        />
                                        Footer
                                      </label>

                                      {/* DELETE */}
                                      <button
                                        type="button"
                                        aria-label="Delete sub-link"
                                        onClick={() => removeLink(child.id)}
                                        className="shrink-0 rounded-lg p-2 text-red-500 hover:bg-red-500/10"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}

                {/* ADD ANOTHER LINK */}
                <button
                  type="button"
                  onClick={() => addLink()}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--accent)]/30 bg-[var(--accent)]/5 py-4 text-sm font-bold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
                >
                  <Plus size={18} />
                  Add another link
                </button>
              </div>
            </section>

            {/* ==================================
                STICKY SAVE BAR
            ================================== */}

            <footer className="sticky bottom-3 z-40 flex flex-col justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-4 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center">
              <p className="text-xs text-[var(--muted)]">
                Editing Language:{" "}
                <span className="font-semibold text-[var(--accent)]">
                  {languageName}
                </span>
                {" · "}
                Total Links: {parents.length}
                {" · "}
                {!apiReady
                  ? "API disconnected"
                  : dirty
                    ? "Unsaved changes"
                    : version === null
                      ? "Not saved yet"
                      : "Saved"}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={saving || uploading}
                  onClick={() => {
                    if (!dirty || window.confirm("Discard unsaved changes?")) {
                      void load();
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold"
                >
                  <RefreshCw size={16} />
                  Reload
                </button>

                <button
                  type="button"
                  disabled={!apiReady || !dirty || saving || uploading}
                  onClick={save}
                  className={BUTTON}
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}

                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
