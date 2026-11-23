"use client";

import AdminStickyFooter from "@/app/Components/Admin/AdminStickyFooter";
import RichTextEditor from "@/Lib/PageBuilder/blocks/shared/RichTextEditor";

import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Languages,
  Plus,
  Trash2,
} from "lucide-react";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ==========================================
// FIELD HELPERS
// ==========================================

const rich = (key, label) => ({
  key,
  label,
  type: "rich",
});

const plain = (key, label, type = "text") => ({
  key,
  label,
  type,
});

// ==========================================
// ALL KLINIKO SECTIONS
// Static configuration only.
// No separate sections.js required.
// ==========================================

const SECTIONS = {
  hero: {
    name: "Hero",
    fields: [
      rich("badge", "Small Heading"),
      rich("title", "Main Heading"),
      rich("description", "Description"),
      rich("buttonText", "Button Text"),
      plain("buttonLink", "Button Link"),
      plain("mainImage", "Doctor Image URL"),
      plain("videoLink", "Video URL"),
    ],
  },

  about: {
    name: "About Kliniko",
    fields: [
      rich("badge", "Section Label"),
      rich("title", "Section Title"),
      rich("description", "Description"),
      rich("experienceNumber", "Experience Number"),
      rich("experienceLabel", "Experience Label"),
      rich("buttonText", "Button Text"),
      plain("buttonLink", "Button Link"),
      plain("mainImage", "Main Image URL"),
      plain("thumbnailImage", "Thumbnail Image URL"),
      plain("videoLink", "Video URL"),
    ],
  },

  services: {
    name: "Services",
    fields: [
      rich("badge", "Section Label"),
      rich("title", "Section Title"),
      rich("description", "Description"),
    ],
    cardName: "Service",
    cardFields: [
      rich("title", "Service Title"),
      rich("description", "Description"),
      plain("icon", "Icon Name"),
      plain("image", "Image URL"),
      plain("link", "Service Link"),
    ],
  },

  "why-choose": {
    name: "Why Choose Us",
    fields: [
      rich("badge", "Section Label"),
      rich("title", "Section Title"),
      rich("description", "Description"),
      rich("stat1", "Statistic One"),
      rich("stat2", "Statistic Two"),
      rich("stat3", "Statistic Three"),
      rich("stat4", "Statistic Four"),
      plain("image", "Section Image URL"),
    ],
    cardName: "Feature",
    cardFields: [
      rich("title", "Feature Title"),
      rich("description", "Feature Description"),
      plain("icon", "Icon Name"),
    ],
  },

  doctors: {
    name: "Expert Doctors",
    fields: [
      rich("badge", "Section Label"),
      rich("title", "Section Title"),
      rich("description", "Description"),
    ],
    cardName: "Doctor",
    cardFields: [
      rich("name", "Doctor Name"),
      rich("specialty", "Specialty"),
      rich("bio", "Biography"),
      plain("image", "Doctor Image URL"),
      plain("link", "Profile Link"),
    ],
  },

  "case-study": {
    name: "Case Studies",
    fields: [
      rich("badge", "Section Label"),
      rich("title", "Section Title"),
      rich("description", "Description"),
    ],
    cardName: "Case Study",
    cardFields: [
      rich("title", "Case Title"),
      rich("category", "Category"),
      rich("description", "Description"),
      plain("image", "Image URL"),
      plain("link", "Details Link"),
    ],
  },

  appointment: {
    name: "Appointment",
    fields: [
      rich("badge", "Section Label"),
      rich("title", "Section Title"),
      rich("description", "Description"),
      rich("buttonText", "Button Text"),
      plain("phone", "Contact Phone"),
      plain("videoLink", "Video URL"),
      plain("image", "Image URL"),
    ],
  },

  testimonials: {
    name: "Testimonials",
    fields: [
      rich("badge", "Section Label"),
      rich("title", "Section Title"),
      rich("description", "Description"),
    ],
    cardName: "Testimonial",
    cardFields: [
      rich("name", "Patient Name"),
      rich("role", "Patient Role"),
      rich("review", "Patient Review"),
      plain("rating", "Rating", "number"),
      plain("image", "Patient Image URL"),
    ],
  },

  blog: {
    name: "Blog & News",
    fields: [
      rich("badge", "Section Label"),
      rich("title", "Section Title"),
      rich("description", "Description"),
    ],
    cardName: "Article",
    cardFields: [
      rich("title", "Article Title"),
      rich("excerpt", "Article Description"),
      rich("author", "Author"),
      plain("date", "Publication Date", "date"),
      plain("image", "Article Image URL"),
      plain("link", "Article Link"),
    ],
  },

  navbar: {
    name: "Navbar",
    fields: [
      rich("brand", "Website Name"),
      rich("appointmentText", "Appointment Button Text"),
      rich("searchPlaceholder", "Search Placeholder"),
      plain("logo", "Logo URL"),
      plain("appointmentLink", "Appointment Link"),
    ],
    cardName: "Menu Link",
    cardFields: [rich("label", "Menu Label"), plain("link", "Menu URL")],
  },

  footer: {
    name: "Footer",
    fields: [
      rich("brand", "Website Name"),
      rich("description", "Description"),
      rich("address", "Address"),
      rich("phone", "Phone"),
      rich("email", "Email"),
      rich("newsletterTitle", "Newsletter Title"),
      rich("copyright", "Copyright / NetHub Credits"),
      plain("logo", "Footer Logo URL"),
    ],
    cardName: "Footer Link",
    cardFields: [rich("label", "Link Label"), plain("link", "Link URL")],
  },
};

// ==========================================
// CREATE BLANK DATA
// ==========================================

function createBlankFields(fields) {
  return Object.fromEntries(
    fields.map((field) => [
      field.key,
      field.type === "rich" ? { en: "", fa: "" } : "",
    ]),
  );
}

function createBlankSection(config) {
  return {
    content: createBlankFields(config.fields),
    cards: [],
  };
}

function createBlankCard(config) {
  return {
    id: crypto.randomUUID(),
    ...createBlankFields(config.cardFields),
  };
}

// ==========================================
// RESTORE A LOCAL DRAFT SAFELY
// ==========================================

function normalizeDraft(saved, config) {
  const blank = createBlankSection(config);

  if (!saved || typeof saved !== "object") {
    return blank;
  }

  const content = { ...blank.content };

  for (const field of config.fields) {
    const value = saved.content?.[field.key];

    if (field.type === "rich") {
      content[field.key] = {
        en: typeof value?.en === "string" ? value.en : "",
        fa: typeof value?.fa === "string" ? value.fa : "",
      };
    } else {
      content[field.key] = typeof value === "string" ? value : "";
    }
  }

  const cards =
    config.cardFields && Array.isArray(saved.cards)
      ? saved.cards.slice(0, 50).map((card, index) => {
          const fields = createBlankFields(config.cardFields);

          for (const field of config.cardFields) {
            const value = card?.[field.key];

            if (field.type === "rich") {
              fields[field.key] = {
                en: typeof value?.en === "string" ? value.en : "",
                fa: typeof value?.fa === "string" ? value.fa : "",
              };
            } else {
              fields[field.key] = typeof value === "string" ? value : "";
            }
          }

          return {
            id: typeof card?.id === "string" ? card.id : `saved-${index}`,
            ...fields,
          };
        })
      : [];

  return { content, cards };
}

function storageKey(section) {
  return `kliniko-static-draft-${section}`;
}

function readLocalDraft(section, config) {
  try {
    const raw = localStorage.getItem(storageKey(section));

    if (!raw) {
      return {
        draft: createBlankSection(config),
        found: false,
      };
    }

    return {
      draft: normalizeDraft(JSON.parse(raw), config),
      found: true,
    };
  } catch {
    return {
      draft: createBlankSection(config),
      found: false,
    };
  }
}

// ==========================================
// TWO-LANGUAGE FLOATING BALL
// English + Dari only
// ==========================================

function LanguageBall({ language, setLanguage }) {
  return (
    <div
      role="group"
      aria-label="Content language"
      className="fixed right-4 bottom-24 z-[90] flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] p-2 shadow-2xl sm:right-8"
    >
      <span className="pl-2 text-[var(--accent)]">
        <Languages size={19} />
      </span>

      <button
        type="button"
        aria-pressed={language === "en"}
        onClick={() => setLanguage("en")}
        className={`h-11 min-w-11 rounded-full px-3 text-xs font-bold transition ${
          language === "en"
            ? "bg-[var(--accent)] text-white"
            : "text-[var(--muted)] hover:bg-[var(--accent-soft)]"
        }`}
      >
        EN
      </button>

      <button
        type="button"
        aria-pressed={language === "fa"}
        onClick={() => setLanguage("fa")}
        className={`h-11 min-w-11 rounded-full px-3 text-xs font-bold transition ${
          language === "fa"
            ? "bg-[var(--accent)] text-white"
            : "text-[var(--muted)] hover:bg-[var(--accent-soft)]"
        }`}
      >
        FA
      </button>
    </div>
  );
}

// ==========================================
// RICH TEXT / REGULAR INPUT
// ==========================================

function EditorField({ field, value, onChange, language, editorId }) {
  const rtl = language === "fa";

  return (
    <div className="min-w-0 space-y-2">
      <label className="block text-sm font-semibold text-[var(--foreground)]">
        {field.label}

        {field.type === "rich" && (
          <span className="ml-2 text-xs font-normal text-[var(--muted)]">
            {rtl ? "(دری)" : "(English)"}
          </span>
        )}
      </label>

      {field.type === "rich" ? (
        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          <RichTextEditor
            key={`${editorId}-${language}`}
            value={value?.[language] || ""}
            onChange={onChange}
            isRtl={rtl}
            dir={rtl ? "rtl" : "ltr"}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
            minHeight={120}
          />
        </div>
      ) : (
        <input
          type={field.type}
          min={field.type === "number" ? 1 : undefined}
          max={field.type === "number" ? 5 : undefined}
          step={field.type === "number" ? 0.1 : undefined}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          dir="ltr"
          placeholder={field.label}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--foreground)] transition outline-none focus:border-[var(--accent)]"
        />
      )}
    </div>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================

export default function KlinikoAdminPage() {
  const params = useParams();

  const section = Array.isArray(params?.section)
    ? params.section[0]
    : params?.section;

  const config = SECTIONS[section];

  if (!config) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <h1 className="text-xl font-bold">Section not found</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Select a Kliniko section from the AdminShell sidebar.
        </p>
      </div>
    );
  }

  return <KlinikoEditor key={section} section={section} config={config} />;
}

// ==========================================
// STATIC SECTION EDITOR
// ==========================================

function KlinikoEditor({ section, config }) {
  const [language, setLanguage] = useState("en");

  const [draft, setDraft] = useState(() => createBlankSection(config));

  const [dirty, setDirty] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(true);

  const [expandedId, setExpandedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmReload, setConfirmReload] = useState(false);

  // ========================================
  // RESTORE BROWSER DRAFT
  // NO API CALLS
  // ========================================

  useEffect(() => {
    const saved = readLocalDraft(section, config);

    setDraft(saved.draft);
    setHasSaved(saved.found);
    setDirty(false);
    setLoadingDraft(false);
  }, [section, config]);

  // ========================================
  // UPDATE SECTION FIELD
  // ========================================

  function updateContent(field, value) {
    setDraft((previous) => ({
      ...previous,

      content: {
        ...previous.content,

        [field.key]:
          field.type === "rich"
            ? {
                ...previous.content[field.key],
                [language]: value,
              }
            : value,
      },
    }));

    setDirty(true);
  }

  // ========================================
  // UPDATE CARD FIELD
  // ========================================

  function updateCard(id, field, value) {
    setDraft((previous) => ({
      ...previous,

      cards: previous.cards.map((card) => {
        if (card.id !== id) {
          return card;
        }

        return {
          ...card,

          [field.key]:
            field.type === "rich"
              ? {
                  ...card[field.key],
                  [language]: value,
                }
              : value,
        };
      }),
    }));

    setDirty(true);
  }

  // ========================================
  // ADD CARD
  // ========================================

  function addCard() {
    if (draft.cards.length >= 50) {
      toast.error("Maximum 50 cards allowed.");
      return;
    }

    const card = createBlankCard(config);

    setDraft((previous) => ({
      ...previous,
      cards: [...previous.cards, card],
    }));

    setExpandedId(card.id);
    setDirty(true);
  }

  // ========================================
  // REMOVE CARD
  // ========================================

  function removeCard(id) {
    setDraft((previous) => ({
      ...previous,

      cards: previous.cards.filter((card) => card.id !== id),
    }));

    setDeletingId(null);
    setExpandedId(null);
    setDirty(true);
  }

  // ========================================
  // SAVE DRAFT LOCALLY
  // NO POST REQUEST
  // ========================================

  function saveDraft(event) {
    event?.preventDefault?.();

    try {
      localStorage.setItem(storageKey(section), JSON.stringify(draft));

      setDirty(false);
      setHasSaved(true);

      toast.success(`${config.name} draft saved in this browser.`);
    } catch {
      toast.error("Could not save draft. Check browser storage.");
    }
  }

  // ========================================
  // RELOAD LAST SAVED DRAFT
  // ========================================

  function reloadDraft() {
    if (dirty) {
      setConfirmReload(true);
      return;
    }

    applySavedDraft();
  }

  function applySavedDraft() {
    const saved = readLocalDraft(section, config);

    setDraft(saved.draft);
    setHasSaved(saved.found);

    setDirty(false);
    setConfirmReload(false);
    setDeletingId(null);
    setExpandedId(null);

    toast.info(saved.found ? "Saved draft loaded." : "Blank section loaded.");
  }

  // ========================================
  // WARN BEFORE REFRESH
  // ========================================

  useEffect(() => {
    if (!dirty) return;

    function beforeUnload(event) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", beforeUnload);

    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, [dirty]);

  // ========================================
  // PAGE JSX
  // ========================================

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-36 text-[var(--foreground)]">
      {/* LANGUAGE BALL */}
      <LanguageBall language={language} setLanguage={setLanguage} />

      {/* HEADER */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.15em] text-[var(--accent)] uppercase">
            Kliniko · Homepage Management
          </p>

          <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            {config.name}
          </h1>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Manage English and Dari content. The live website is not affected.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-4 py-2 text-xs font-bold text-[var(--accent)]">
          {dirty ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}

          {dirty
            ? "Unsaved changes"
            : hasSaved
              ? "Draft saved locally"
              : "Blank draft"}
        </div>
      </header>

      {/* STATIC MODE NOTICE */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-6 text-[var(--muted)]">
        Static editor mode. No data is fetched from the server and nothing is
        posted to MongoDB. The Save button stores a draft only in this browser.
      </div>

      {/* RELOAD CONFIRMATION */}
      {confirmReload && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <span>Discard unsaved changes and reload the last saved draft?</span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmReload(false)}
              className="rounded-lg border border-amber-300 px-4 py-2"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={applySavedDraft}
              className="rounded-lg bg-amber-800 px-4 py-2 font-bold text-white"
            >
              Reload
            </button>
          </div>
        </div>
      )}

      {loadingDraft ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-sm text-[var(--muted)]">
          Preparing editor...
        </div>
      ) : (
        <>
          {/* ==================================
              SECTION CONTENT
          ================================== */}

          <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            <div className="border-b border-[var(--border)] p-5 sm:p-7">
              <h2 className="text-lg font-bold">Section Content</h2>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Editing {language === "en" ? "English" : "دری"}
              </p>
            </div>

            <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-7">
              {config.fields.map((field) => (
                <div
                  key={field.key}
                  className={
                    ["badge", "title", "description"].includes(field.key)
                      ? "sm:col-span-2"
                      : ""
                  }
                >
                  <EditorField
                    field={field}
                    value={draft.content[field.key]}
                    language={language}
                    editorId={`${section}-${field.key}`}
                    onChange={(value) => updateContent(field, value)}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* ==================================
              REPEATABLE CARDS
          ================================== */}

          {config.cardFields && (
            <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-5 sm:p-7">
                <div>
                  <h2 className="text-lg font-bold">
                    {config.cardName} Cards ({draft.cards.length})
                  </h2>

                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Add or edit cards in English and Dari.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addCard}
                  className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                >
                  <Plus size={17} />
                  Add {config.cardName}
                </button>
              </div>

              <div className="space-y-3 p-5 sm:p-7">
                {draft.cards.length === 0 && (
                  <div className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted)]">
                    No cards added yet.
                  </div>
                )}

                {draft.cards.map((card, index) => (
                  <div
                    key={card.id}
                    className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]"
                  >
                    {/* CARD HEADER */}
                    <div className="flex items-center gap-3 p-4">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(expandedId === card.id ? null : card.id)
                        }
                        aria-expanded={expandedId === card.id}
                        className="flex flex-1 items-center justify-between text-left text-sm font-bold"
                      >
                        {config.cardName} {index + 1}
                        <ChevronDown
                          size={18}
                          className={`transition-transform ${
                            expandedId === card.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        aria-label={`Remove ${config.cardName} ${index + 1}`}
                        onClick={() => setDeletingId(card.id)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* DELETE CONFIRMATION */}
                    {deletingId === card.id && (
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-red-300 bg-red-500/5 p-4 text-sm">
                        <span>Remove this {config.cardName}?</span>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setDeletingId(null)}
                            className="rounded-lg border border-[var(--border)] px-3 py-2"
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            onClick={() => removeCard(card.id)}
                            className="rounded-lg bg-red-600 px-3 py-2 font-bold text-white"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}

                    {/* CARD FIELDS */}
                    {expandedId === card.id && (
                      <div className="grid gap-5 border-t border-[var(--border)] p-4 sm:grid-cols-2">
                        {config.cardFields.map((field) => (
                          <div
                            key={field.key}
                            className={
                              [
                                "description",
                                "review",
                                "bio",
                                "excerpt",
                              ].includes(field.key)
                                ? "sm:col-span-2"
                                : ""
                            }
                          >
                            <EditorField
                              field={field}
                              value={card[field.key]}
                              language={language}
                              editorId={`${section}-${card.id}-${field.key}`}
                              onChange={(value) =>
                                updateCard(card.id, field, value)
                              }
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ==================================
              STICKY SAVE BUTTON
          ================================== */}

          <AdminStickyFooter
            onReload={reloadDraft}
            onSave={saveDraft}
            saving={false}
            busy={false}
            saveLabel="Save Draft"
            savingLabel="Saving Draft..."
          />
        </>
      )}
    </div>
  );
}
