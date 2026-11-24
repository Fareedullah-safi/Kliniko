
"use client";

import AdminStickyFooter from "@/app/Components/Admin/AdminStickyFooter";
import RichTextEditor from "@/Lib/PageBuilder/blocks/shared/RichTextEditor";

import {
  ENABLE_DARI_EDITOR,
  SECTIONS,
} from "@/Lib/Kliniko/sections";

import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ImagePlus,
  Languages,
  LoaderCircle,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";

import { useParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ==========================================
// CLOUDINARY WIDGET STYLING
// ==========================================

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

// ==========================================
// EMPTY SECTION DATA
// ==========================================

function blankFields(fields) {
  const data = {};

  for (const field of fields) {
    data[field.key] =
      field.type === "rich"
        ? { en: "", fa: "" }
        : "";

    if (field.type === "image") {
      data[`${field.key}PublicId`] = "";
    }
  }

  return data;
}

function blankSection(config) {
  return {
    content: blankFields(config.fields),
    cards: [],
  };
}

// ==========================================
// NORMALIZE MONGODB DATA
// ==========================================

function normalizeFields(fields, values = {}) {
  const result = blankFields(fields);

  for (const field of fields) {
    const value = values?.[field.key];

    if (field.type === "rich") {
      result[field.key] = {
        en:
          typeof value?.en === "string"
            ? value.en
            : "",
        fa:
          typeof value?.fa === "string"
            ? value.fa
            : "",
      };
    } else if (field.type === "image") {
      result[field.key] =
        typeof value === "string"
          ? value
          : value?.url || "";

      result[`${field.key}PublicId`] =
        values?.[`${field.key}PublicId`] ||
        value?.publicId ||
        "";
    } else {
      result[field.key] =
        typeof value === "string"
          ? value
          : "";
    }
  }

  return result;
}

// ==========================================
// READ LOCAL RECOVERY DRAFT
// ==========================================

function readDraft(section, config) {
  try {
    const raw = localStorage.getItem(
      `kliniko-static-draft-${section}`,
    );

    if (!raw) {
      return {
        found: false,
        draft: blankSection(config),
        recoveryRevision: null,
      };
    }

    const saved = JSON.parse(raw);

    return {
      found: true,

      recoveryRevision: Number.isSafeInteger(
        saved?._expectedRevision,
      )
        ? saved._expectedRevision
        : null,

      draft: {
        content: normalizeFields(
          config.fields,
          saved?.content,
        ),

        cards:
          config.cardFields &&
          Array.isArray(saved?.cards)
            ? saved.cards
                .slice(0, 50)
                .map((card, index) => ({
                  id:
                    typeof card?.id === "string"
                      ? card.id
                      : `saved-${index}`,

                  ...normalizeFields(
                    config.cardFields,
                    card,
                  ),
                }))
            : [],
      },
    };
  } catch {
    return {
      found: false,
      draft: blankSection(config),
      recoveryRevision: null,
    };
  }
}

// ==========================================
// LANGUAGE SELECTOR
// CURRENTLY HIDDEN
// ==========================================

function LanguageBall({
  language,
  onChange,
}) {
  return (
    <div className="fixed bottom-24 right-4 z-[90] flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-xl sm:right-8">
      <Languages
        size={18}
        className="ml-2 text-[var(--accent)]"
      />

      {[
        { code: "en", label: "EN" },
        { code: "fa", label: "FA" },
      ].map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() =>
            onChange(item.code)
          }
          className={`h-10 min-w-10 rounded-full px-2 text-xs font-bold transition ${
            language === item.code
              ? "bg-[var(--accent)] text-white"
              : "text-[var(--muted)] hover:bg-[var(--accent-soft)]"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ==========================================
// CLIENT-SIDE ENGLISH VALIDATION
// ==========================================

function visibleText(html) {
  return String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(
      /&(?:nbsp|#160|#xA0);/gi,
      " ",
    )
    .replace(
      /&[a-z0-9#]+;/gi,
      "x",
    )
    .replace(
      /[\u200B-\u200D\uFEFF]/g,
      "",
    )
    .trim();
}

function validLink(value) {
  const input = String(
    value || "",
  ).trim();

  if (
    input.startsWith("/") &&
    !input.startsWith("//") &&
    !/[\\\s]/.test(input)
  ) {
    return true;
  }

  if (
    /^#[a-zA-Z0-9_-]+$/.test(input)
  ) {
    return true;
  }

  try {
    const url = new URL(input);

    return (
      ["http:", "https:"].includes(
        url.protocol,
      ) &&
      Boolean(url.hostname)
    );
  } catch {
    return false;
  }
}

function fieldValidationError(field, value) {
  if (field.type === "rich") {
    if (
      field.required &&
      !visibleText(value?.en)
    ) {
      return `${field.label} is required in English.`;
    }

    return "";
  }

  if (field.type === "image") {
    return "";
  }

  const input = String(
    value ?? "",
  ).trim();

  if (!input) {
    return field.required
      ? `${field.label} is required.`
      : "";
  }

  if (
    [
      "link",
      "buttonLink",
      "appointmentLink",
      "videoLink",
    ].includes(field.key) &&
    !validLink(input)
  ) {
    return `${field.label} must be a valid link.`;
  }

  if (
    field.type === "number" &&
    (
      !Number.isFinite(
        Number(input),
      ) ||
      (
        field.key === "rating" &&
        (
          Number(input) < 1 ||
          Number(input) > 5
        )
      )
    )
  ) {
    return `${field.label} must contain a valid number.`;
  }

  return "";
}

function validateDraft(draft, config) {
  const errors = {};

  for (const field of config.fields) {
    const error = fieldValidationError(
      field,
      draft.content?.[field.key],
    );

    if (error) {
      errors[
        `content.${field.key}`
      ] = error;
    }
  }

  for (const card of draft.cards || []) {
    for (const field of config.cardFields || []) {
      const error = fieldValidationError(
        field,
        card[field.key],
      );

      if (error) {
        errors[
          `card.${card.id}.${field.key}`
        ] = error;
      }
    }
  }

  return errors;
}

// ==========================================
// CLOUDINARY IMAGE INPUT
// ==========================================

function ImageField({
  label,
  value,
  uploading,
  widgetReady,
  onUpload,
  onRemove,
}) {
  return (
    <div className="min-w-0 space-y-2">
      <label className="block text-sm font-semibold text-[var(--foreground)]">
        {label}
      </label>

      {value ? (
        <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
          <img
            src={value}
            alt={label}
            className="h-full w-full object-contain"
          />

          <button
            type="button"
            onClick={onRemove}
            disabled={uploading}
            className="absolute right-3 top-3 rounded-lg bg-red-600 p-2 text-white shadow hover:bg-red-700 disabled:opacity-50"
            aria-label={`Remove ${label}`}
          >
            <Trash2 size={17} />
          </button>
        </div>
      ) : (
        <div className="flex h-48 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--surface-soft)] text-center">
          <span className="mb-3 rounded-xl bg-[var(--accent-soft)] p-4 text-[var(--accent)]">
            <ImagePlus size={28} />
          </span>

          <p className="text-sm font-semibold">
            No image selected
          </p>

          <p className="mt-1 text-xs text-[var(--muted)]">
            JPG, PNG, WEBP · Maximum 5 MB
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onUpload}
        disabled={
          !widgetReady || uploading
        }
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading ? (
          <LoaderCircle
            size={17}
            className="animate-spin"
          />
        ) : (
          <Upload size={17} />
        )}

        {uploading
          ? "Uploading..."
          : !widgetReady
            ? "Loading Cloudinary..."
            : value
              ? "Change Image"
              : "Upload Image"}
      </button>

      {value && (
        <p className="break-all text-xs text-[var(--muted)]">
          {value}
        </p>
      )}
    </div>
  );
}

// ==========================================
// REUSABLE INPUT COMPONENT
// ==========================================

function EditorField({
  field,
  value,
  language,
  editorKey,
  onChange,
  onUpload,
  onRemove,
  uploading,
  widgetReady,
  error,
}) {
  if (field.type === "image") {
    return (
      <ImageField
        label={field.label}
        value={value || ""}
        uploading={uploading}
        widgetReady={widgetReady}
        onUpload={onUpload}
        onRemove={onRemove}
      />
    );
  }

  return (
    <div className="min-w-0 space-y-2">
      <label className="block text-sm font-semibold text-[var(--foreground)]">
        {field.label}

        {field.type === "rich" && (
          <>
            {field.required &&
              language === "en" && (
                <span className="ml-1 text-red-500">
                  *
                </span>
              )}

            <span className="ml-1 text-xs font-normal text-[var(--muted)]">
              (
              {language === "fa"
                ? "دری"
                : "English"}
              )
            </span>
          </>
        )}
      </label>

      {field.type === "rich" ? (
        <div
          className={`overflow-hidden rounded-xl border ${
            error
              ? "border-red-500"
              : "border-[var(--border)]"
          }`}
        >
          <RichTextEditor
            key={`${editorKey}-${language}`}
            value={
              value?.[language] || ""
            }
            onChange={onChange}
            isRtl={
              language === "fa"
            }
            dir={
              language === "fa"
                ? "rtl"
                : "ltr"
            }
            minHeight={120}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
          />
        </div>
      ) : (
        <input
          type={field.type}
          value={value || ""}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          dir="ltr"
          min={
            field.type === "number"
              ? 1
              : undefined
          }
          max={
            field.type === "number"
              ? 5
              : undefined
          }
          step={
            field.type === "number"
              ? 0.1
              : undefined
          }
          placeholder={field.label}
          aria-invalid={Boolean(error)}
          className={`w-full rounded-xl border bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)] ${
            error
              ? "border-red-500"
              : "border-[var(--border)]"
          }`}
        />
      )}

      {error && (
        <p
          role="alert"
          className="text-xs font-medium text-red-500"
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ==========================================
// MAIN DYNAMIC PAGE
// ==========================================

export default function KlinikoSectionAdminPage() {
  const params = useParams();

  const section = Array.isArray(
    params?.section,
  )
    ? params.section[0]
    : params?.section;

  const config =
    Object.hasOwn(
      SECTIONS,
      section,
    )
      ? SECTIONS[section]
      : null;

  if (!config) {
    return (
      <div className="p-6 text-[var(--foreground)]">
        Invalid Kliniko section.
      </div>
    );
  }

  return (
    <KlinikoEditor
      key={section}
      section={section}
      config={config}
    />
  );
}

// ==========================================
// REUSABLE SECTION EDITOR
// ==========================================

function KlinikoEditor({ section, config }) {
  const [language, setLanguage] =
    useState("en");

  const [
    validationErrors,
    setValidationErrors,
  ] = useState({});

  const [draft, setDraft] = useState(
    () => blankSection(config),
  );

  const [loaded, setLoaded] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [revision, setRevision] =
    useState(null);

  const [loadError, setLoadError] =
    useState("");

  const [dirty, setDirty] =
    useState(false);

  const [hasSaved, setHasSaved] =
    useState(false);

  const [widgetReady, setWidgetReady] =
    useState(false);

  const [isDark, setIsDark] =
    useState(false);

  const [uploadingKey, setUploadingKey] =
    useState("");

  const [expandedId, setExpandedId] =
    useState(null);

  const [deletingId, setDeletingId] =
    useState(null);

  const [
    confirmReload,
    setConfirmReload,
  ] = useState(false);

  const widgetRef = useRef(null);
  const uploadLock = useRef(false);
  const draftRef = useRef(draft);
  const editGenerationRef = useRef(0);

  // ========================================
  // KEEP DRAFT REFERENCE UPDATED
  // ========================================

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  // ========================================
  // LOAD SECTION FROM MONGODB
  // ========================================

  async function loadFromDatabase(
    cancelled = () => false,
    discardLocal = false,
  ) {
    try {
      setLoaded(false);
      setLoadError("");

      const response = await fetch(
        `/api/kliniko/${encodeURIComponent(section)}`,
        {
          credentials: "same-origin",
          cache: "no-store",
        },
      );

      const result = await response
        .json()
        .catch(() => null);

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
            "Section API is unavailable.",
        );
      }

      if (cancelled()) return;

      // Existing local drafts can be imported
      // only when MongoDB has no record.
      // New backups must match the DB revision.
      const local = discardLocal
        ? null
        : readDraft(section, config);

      const recoverLocal =
        Boolean(local?.found) &&
        (
          !result.exists ||
          local.recoveryRevision ===
            result.revision
        );

      const nextDraft = recoverLocal
        ? local.draft
        : {
            content: normalizeFields(
              config.fields,
              result.data?.content,
            ),

            cards:
              config.cardFields &&
              Array.isArray(
                result.data?.cards,
              )
                ? result.data.cards.map(
                    (card, index) => ({
                      id:
                        typeof card.id ===
                        "string"
                          ? card.id
                          : `saved-${index}`,

                      ...normalizeFields(
                        config.cardFields,
                        card,
                      ),
                    }),
                  )
                : [],
          };

      if (discardLocal) {
        try {
          localStorage.removeItem(
            `kliniko-static-draft-${section}`,
          );
        } catch {
          // Local storage cleanup is optional.
        }
      }

      draftRef.current = nextDraft;
      editGenerationRef.current = 0;

      setDraft(nextDraft);
      setRevision(result.revision ?? 0);
      setHasSaved(Boolean(result.exists));
      setDirty(recoverLocal);

      setValidationErrors({});
      setConfirmReload(false);
      setExpandedId(null);
      setDeletingId(null);

      if (recoverLocal) {
        toast.info(
          result.exists
            ? "Recovered unsaved edits for this revision."
            : "Local draft loaded. Save to move it into MongoDB.",
        );
      } else if (
        local?.found &&
        result.exists
      ) {
        toast.warning(
          "An old browser draft was skipped because it does not match this MongoDB revision.",
        );
      }
    } catch (error) {
      if (cancelled()) return;

      setLoadError(
        error.message ||
          "Could not load section.",
      );

      toast.error(
        error.message ||
          "Could not load section.",
      );
    } finally {
      if (!cancelled()) {
        setLoaded(true);
      }
    }
  }

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    let cancelled = false;

    void loadFromDatabase(
      () => cancelled,
    );

    return () => {
      cancelled = true;
    };
  }, [section, config]);

  // ========================================
  // LOCAL RECOVERY BACKUP
  // ========================================

  useEffect(() => {
    if (
      !loaded ||
      !dirty ||
      revision === null
    ) {
      return;
    }

    try {
      localStorage.setItem(
        `kliniko-static-draft-${section}`,
        JSON.stringify({
          ...draft,
          _expectedRevision: revision,
        }),
      );
    } catch {
      // MongoDB saving can still work.
    }
  }, [
    draft,
    dirty,
    loaded,
    revision,
    section,
  ]);

  // ========================================
  // DARK / LIGHT THEME DETECTION
  // ========================================

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(
        document.documentElement.classList.contains(
          "dark",
        ),
      );
    };

    updateTheme();

    const observer = new MutationObserver(
      updateTheme,
    );

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: [
          "class",
        ],
      },
    );

    return () =>
      observer.disconnect();
  }, []);

  // ========================================
  // CLOSE CLOUDINARY ON UNMOUNT
  // ========================================

  useEffect(() => {
    return () => {
      try {
        widgetRef.current?.close();
      } catch {
        // Already closed.
      }
    };
  }, []);

  // ========================================
  // WARN ABOUT UNSAVED CHANGES
  // ========================================

  useEffect(() => {
    if (!dirty) return;

    const beforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener(
      "beforeunload",
      beforeUnload,
    );

    return () =>
      window.removeEventListener(
        "beforeunload",
        beforeUnload,
      );
  }, [dirty]);

  // ========================================
  // UPDATE SECTION FIELD
  // ========================================

  function changeContent(field, value) {
    editGenerationRef.current += 1;

    setDraft((old) => ({
      ...old,

      content: {
        ...old.content,

        [field.key]:
          field.type === "rich"
            ? {
                ...old.content[field.key],
                [language]: value,
              }
            : value,
      },
    }));

    setDirty(true);

    setValidationErrors((old) => ({
      ...old,
      [`content.${field.key}`]:
        undefined,
    }));
  }

  // ========================================
  // UPDATE CARD FIELD
  // ========================================

  function changeCard(
    id,
    field,
    value,
  ) {
    editGenerationRef.current += 1;

    setDraft((old) => ({
      ...old,

      cards: old.cards.map((card) =>
        card.id !== id
          ? card
          : {
              ...card,

              [field.key]:
                field.type === "rich"
                  ? {
                      ...card[field.key],
                      [language]: value,
                    }
                  : value,
            },
      ),
    }));

    setDirty(true);

    setValidationErrors((old) => ({
      ...old,
      [`card.${id}.${field.key}`]:
        undefined,
    }));
  }

  // ========================================
  // CHANGE IMAGE REFERENCE
  // ========================================

  function changeImage(
    target,
    url,
    publicId,
  ) {
    editGenerationRef.current += 1;

    const publicIdKey =
      `${target.fieldKey}PublicId`;

    setDraft((old) =>
      target.cardId
        ? {
            ...old,

            cards: old.cards.map(
              (card) =>
                card.id !== target.cardId
                  ? card
                  : {
                      ...card,
                      [target.fieldKey]:
                        url,
                      [publicIdKey]:
                        publicId,
                    },
            ),
          }
        : {
            ...old,

            content: {
              ...old.content,
              [target.fieldKey]: url,
              [publicIdKey]: publicId,
            },
          },
    );

    setDirty(true);
  }

  // ========================================
  // ADD CARD
  // ========================================

  function addCard() {
    if (draft.cards.length >= 50) {
      toast.error(
        "Maximum 50 cards per section.",
      );
      return;
    }

    editGenerationRef.current += 1;

    const id = crypto.randomUUID();

    setDraft((old) => ({
      ...old,
      cards: [
        ...old.cards,
        {
          id,
          ...blankFields(
            config.cardFields,
          ),
        },
      ],
    }));

    setExpandedId(id);
    setDirty(true);
  }

  // ========================================
  // REMOVE CARD
  // ========================================

  function removeCard(id) {
    editGenerationRef.current += 1;

    setDraft((old) => ({
      ...old,

      cards: old.cards.filter(
        (card) =>
          card.id !== id,
      ),
    }));

    setExpandedId(null);
    setDeletingId(null);
    setDirty(true);

    setValidationErrors((old) =>
      Object.fromEntries(
        Object.entries(old).filter(
          ([key]) =>
            !key.startsWith(
              `card.${id}.`,
            ),
        ),
      ),
    );
  }

  // ========================================
  // CLOUDINARY UPLOAD SUCCESS
  // ========================================

  function replaceUploadedImage(
    target,
    uploaded,
  ) {
    const previous =
      draftRef.current;

    const field =
      target.fieldKey;

    const publicIdField =
      `${field}PublicId`;

    const current = target.cardId
      ? previous.cards.find(
          (card) =>
            card.id === target.cardId,
        )
      : previous.content;

    if (!current) {
      toast.error(
        "This card no longer exists.",
      );
      return;
    }

    const changes = {
      [field]: uploaded.secure_url,
      [publicIdField]: uploaded.public_id,
    };

    const updated = target.cardId
      ? {
          ...previous,

          cards: previous.cards.map(
            (card) =>
              card.id === target.cardId
                ? {
                    ...card,
                    ...changes,
                  }
                : card,
          ),
        }
      : {
          ...previous,

          content: {
            ...previous.content,
            ...changes,
          },
        };

    draftRef.current = updated;

    editGenerationRef.current += 1;

    setDraft(updated);
    setDirty(true);

    // Do not delete old Cloudinary assets
    // before MongoDB confirms this change.
    toast.success(
      "Image uploaded. Click Save Section to store it in MongoDB.",
    );
  }

  // ========================================
  // OPEN CLOUDINARY WIDGET
  // ========================================

  function openCloudinary(target) {
    if (
      uploadLock.current ||
      saving
    ) {
      return;
    }

    if (
      !widgetReady ||
      !window.cloudinary?.createUploadWidget
    ) {
      toast.error(
        "Cloudinary is still loading.",
      );
      return;
    }

    const cloudName =
      process.env
        .NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const uploadPreset =
      process.env
        .NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (
      !cloudName ||
      !uploadPreset
    ) {
      toast.error(
        "Cloudinary environment variables are missing.",
      );
      return;
    }

    uploadLock.current = true;

    const key = `${
      target.cardId || "section"
    }-${target.fieldKey}`;

    setUploadingKey(key);

    const finish = () => {
      uploadLock.current = false;
      setUploadingKey("");
    };

    try {
      widgetRef.current?.close();

      widgetRef.current =
        window.cloudinary.createUploadWidget(
          {
            cloudName,
            uploadPreset,

            folder: "kliniko/images",

            multiple: false,

            maxFileSize:
              5 * 1024 * 1024,

            clientAllowedFormats: [
              "jpg",
              "jpeg",
              "png",
              "webp",
            ],

            sources: [
              "local",
              "url",
              "camera",
            ],

            cropping: false,
            resourceType: "image",

            styles:
              cloudinaryStyles(
                isDark,
              ),
          },

          (error, result) => {
            if (error) {
              console.error(
                "Cloudinary error:",
                error,
              );

              toast.error(
                "Image upload failed.",
              );

              finish();
              return;
            }

            if (
              result?.event ===
              "success"
            ) {
              const info =
                result.info;

              if (
                !info?.secure_url ||
                !info?.public_id
              ) {
                toast.error(
                  "Cloudinary returned invalid image data.",
                );
              } else {
                replaceUploadedImage(
                  target,
                  info,
                );
              }

              finish();
              return;
            }

            if (
              result?.event ===
                "close" ||
              result?.event ===
                "abort"
            ) {
              finish();
            }
          },
        );

      widgetRef.current.open();
    } catch (error) {
      console.error(
        "Cloudinary widget error:",
        error,
      );

      toast.error(
        "Could not open Cloudinary.",
      );

      finish();
    }
  }

  // ========================================
  // SAVE SECTION TO MONGODB
  // ========================================

  async function saveDraft(event) {
    event?.preventDefault?.();

    if (
      saving ||
      uploadLock.current
    ) {
      return;
    }

    if (
      loadError ||
      revision === null
    ) {
      toast.error(
        "Reload this section before saving. Database revision is unknown.",
      );
      return;
    }

    const snapshot =
      draftRef.current;

    const generation =
      editGenerationRef.current;

    // Validate English before API request.
    const errors = validateDraft(
      snapshot,
      config,
    );

    setValidationErrors(errors);

    const keys =
      Object.keys(errors);

    if (keys.length > 0) {
      const firstCard =
        snapshot.cards.find(
          (card) =>
            keys.some((key) =>
              key.startsWith(
                `card.${card.id}.`,
              ),
            ),
        );

      if (firstCard) {
        setExpandedId(
          firstCard.id,
        );
      }

      toast.error(
        `Please fix ${keys.length} field(s) before saving.`,
      );

      return;
    }

    setSaving(true);

    try {
      // ONE API FOR ALL 11 SECTIONS
      const response = await fetch(
        `/api/kliniko/${encodeURIComponent(section)}`,
        {
          method: "POST",

          credentials:
            "same-origin",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            expectedRevision:
              revision,

            content:
              snapshot.content,

            cards:
              snapshot.cards,
          }),
        },
      );

      const result = await response
        .json()
        .catch(() => null);

      if (
        !response.ok ||
        !result?.success
      ) {
        // Display validation errors
        // returned by the server.
        if (result?.errors) {
          const mapped = {};

          for (const [
            key,
            message,
          ] of Object.entries(
            result.errors,
          )) {
            const match = key.match(
              /^cards\.(\d+)\.(.+)$/,
            );

            mapped[
              match &&
              snapshot.cards[
                Number(match[1])
              ]
                ? `card.${
                    snapshot.cards[
                      Number(match[1])
                    ].id
                  }.${match[2]}`
                : key
            ] = message;
          }

          setValidationErrors(
            mapped,
          );

          const firstCard =
            snapshot.cards.find(
              (card) =>
                Object.keys(
                  mapped,
                ).some((key) =>
                  key.startsWith(
                    `card.${card.id}.`,
                  ),
                ),
            );

          if (firstCard) {
            setExpandedId(
              firstCard.id,
            );
          }
        }

        if (response.status === 409) {
          throw new Error(
            result?.message ||
              "Another admin updated this section. Reload before saving.",
          );
        }

        throw new Error(
          result?.message ||
            `Save failed (HTTP ${response.status}).`,
        );
      }

      // Update revision after successful save.
      setRevision(
        result.revision,
      );

      setHasSaved(true);

      // If the admin edited something else
      // during the API request, preserve it.
      const unchanged =
        editGenerationRef.current ===
        generation;

      if (unchanged) {
        const saved = {
          content: normalizeFields(
            config.fields,
            result.data?.content,
          ),

          cards: (
            result.data?.cards || []
          ).map((card) => ({
            id: card.id,

            ...normalizeFields(
              config.cardFields ||
                [],
              card,
            ),
          })),
        };

        draftRef.current =
          saved;

        setDraft(saved);
        setDirty(false);

        try {
          localStorage.removeItem(
            `kliniko-static-draft-${section}`,
          );
        } catch {
          // Optional cleanup.
        }
      } else {
        setDirty(true);
      }

      toast.success(
        unchanged
          ? `${config.name} saved to MongoDB.`
          : "Previous edits saved. Newer edits still need saving.",
      );
    } catch (error) {
      toast.error(
        error.message ||
          "Unable to save section.",
      );
    } finally {
      setSaving(false);
    }
  }

  // ========================================
  // RELOAD FROM MONGODB
  // ========================================

  function reloadDraft() {
    if (
      saving ||
      uploadLock.current
    ) {
      return;
    }

    if (dirty) {
      setConfirmReload(true);
      return;
    }

    void restoreDraft();
  }

  async function restoreDraft() {
    if (
      saving ||
      uploadLock.current
    ) {
      return;
    }

    await loadFromDatabase(
      () => false,
      true,
    );
  }

  // ========================================
  // RENDER ANY CONFIGURED FIELD
  // ========================================

  function renderField(
    field,
    value,
    onChange,
    editorKey,
    target,
  ) {
    const errorKey =
      target.cardId
        ? `card.${target.cardId}.${field.key}`
        : `content.${field.key}`;

    return (
      <EditorField
        field={field}
        value={value}
        language={language}
        editorKey={editorKey}
        onChange={onChange}
        error={
          language === "en"
            ? validationErrors[
                errorKey
              ]
            : ""
        }
        widgetReady={widgetReady}
        uploading={
          Boolean(
            uploadingKey,
          ) || saving
        }
        onUpload={() =>
          openCloudinary(
            target,
          )
        }
        onRemove={() =>
          changeImage(
            target,
            "",
            "",
          )
        }
      />
    );
  }

  // ========================================
  // PAGE DESIGN
  // ========================================

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-36 text-[var(--foreground)]">
      {/* CLOUDINARY SCRIPT */}
      <Script
        src="https://upload-widget.cloudinary.com/latest/global/all.js"
        strategy="afterInteractive"
        onReady={() =>
          setWidgetReady(
            Boolean(
              window.cloudinary
                ?.createUploadWidget,
            ),
          )
        }
        onError={() =>
          toast.error(
            "Cloudinary script could not be loaded.",
          )
        }
      />

      {/* LANGUAGE SELECTOR */}
      {ENABLE_DARI_EDITOR && (
        <LanguageBall
          language={language}
          onChange={
            setLanguage
          }
        />
      )}

      {/* PAGE HEADER */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--accent)]">
            Kliniko · Homepage Management
          </p>

          <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            {config.name}
          </h1>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Manage English content
            and Cloudinary images.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-4 py-2 text-xs font-bold text-[var(--accent)]">
          {dirty ? (
            <AlertCircle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}

          {dirty
            ? "Unsaved changes"
            : hasSaved
              ? "Saved to MongoDB"
              : "No database record"}
        </div>
      </header>

      {/* DESCRIPTION */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-6 text-[var(--muted)]">
        Content is saved to MongoDB.
        English is validated before
        saving. Dari translations remain
        optional and hidden.
      </div>

      {/* DATABASE LOAD ERROR */}
      {loadError && (
        <div
          role="alert"
          className="rounded-xl border border-red-400 bg-red-500/10 p-4 text-sm text-red-600"
        >
          {loadError}

          <button
            type="button"
            onClick={() =>
              void loadFromDatabase()
            }
            className="ml-2 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* RELOAD CONFIRMATION */}
      {confirmReload && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <span>
            Discard unsaved changes
            and reload from MongoDB?
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setConfirmReload(
                  false,
                )
              }
              className="rounded-lg border border-amber-300 px-4 py-2"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={
                restoreDraft
              }
              className="rounded-lg bg-amber-800 px-4 py-2 font-bold text-white"
            >
              Reload
            </button>
          </div>
        </div>
      )}

      {/* LOADING */}
      {!loaded ? (
        <div className="rounded-xl border border-[var(--border)] p-6 text-sm text-[var(--muted)]">
          Loading section from MongoDB...
        </div>
      ) : (
        <>
          {/* SECTION CONTENT */}
          <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            <div className="border-b border-[var(--border)] p-5 sm:p-7">
              <h2 className="text-lg font-bold">
                Section Content
              </h2>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Editing English.
                <span className="ml-1 text-red-500">
                  *
                </span>{" "}
                Required fields.
              </p>
            </div>

            <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-7">
              {config.fields.map(
                (field) => (
                  <div
                    key={
                      field.key
                    }
                    className={
                      [
                        "badge",
                        "title",
                        "description",
                      ].includes(
                        field.key,
                      )
                        ? "sm:col-span-2"
                        : ""
                    }
                  >
                    {renderField(
                      field,

                      draft.content[
                        field.key
                      ],

                      (value) =>
                        changeContent(
                          field,
                          value,
                        ),

                      `${section}-${field.key}`,

                      {
                        fieldKey:
                          field.key,
                      },
                    )}
                  </div>
                ),
              )}
            </div>
          </section>

          {/* REPEATABLE CARDS */}
          {config.cardFields && (
            <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-5 sm:p-7">
                <div>
                  <h2 className="text-lg font-bold">
                    {config.cardName} Cards (
                    {draft.cards.length})
                  </h2>

                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Manage repeatable
                    items for this section.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    addCard
                  }
                  className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                >
                  <Plus size={17} />
                  Add{" "}
                  {config.cardName}
                </button>
              </div>

              <div className="space-y-3 p-5 sm:p-7">
                {draft.cards.length ===
                  0 && (
                  <p className="rounded-xl border border-dashed border-[var(--border)] p-5 text-sm text-[var(--muted)]">
                    No cards added yet.
                  </p>
                )}

                {draft.cards.map(
                  (
                    card,
                    index,
                  ) => (
                    <div
                      key={
                        card.id
                      }
                      className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]"
                    >
                      {/* CARD HEADER */}
                      <div className="flex items-center gap-3 p-4">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(
                              expandedId ===
                                card.id
                                ? null
                                : card.id,
                            )
                          }
                          aria-expanded={
                            expandedId ===
                            card.id
                          }
                          className="flex flex-1 items-center justify-between text-left text-sm font-semibold"
                        >
                          {config.cardName}{" "}
                          {index + 1}

                          <ChevronDown
                            size={18}
                            className={`transition-transform ${
                              expandedId ===
                              card.id
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDeletingId(
                              card.id,
                            )
                          }
                          className="rounded-lg p-2 text-red-500 hover:bg-red-500/10"
                          aria-label={`Remove ${config.cardName} ${index + 1}`}
                        >
                          <Trash2
                            size={18}
                          />
                        </button>
                      </div>

                      {/* DELETE CONFIRMATION */}
                      {deletingId ===
                        card.id && (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-red-300 bg-red-500/5 p-4 text-sm">
                          <span>
                            Remove this{" "}
                            {
                              config.cardName
                            }
                            ?
                          </span>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setDeletingId(
                                  null,
                                )
                              }
                              className="rounded-lg border border-[var(--border)] px-3 py-2"
                            >
                              Cancel
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                removeCard(
                                  card.id,
                                )
                              }
                              className="rounded-lg bg-red-600 px-3 py-2 font-bold text-white"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}

                      {/* CARD EDITOR */}
                      {expandedId ===
                        card.id && (
                        <div className="grid gap-5 border-t border-[var(--border)] p-4 sm:grid-cols-2">
                          {config.cardFields.map(
                            (
                              field,
                            ) => (
                              <div
                                key={
                                  field.key
                                }
                                className={
                                  [
                                    "description",
                                    "review",
                                    "bio",
                                    "excerpt",
                                  ].includes(
                                    field.key,
                                  )
                                    ? "sm:col-span-2"
                                    : ""
                                }
                              >
                                {renderField(
                                  field,

                                  card[
                                    field.key
                                  ],

                                  (
                                    value,
                                  ) =>
                                    changeCard(
                                      card.id,
                                      field,
                                      value,
                                    ),

                                  `${section}-${card.id}-${field.key}`,

                                  {
                                    cardId:
                                      card.id,

                                    fieldKey:
                                      field.key,
                                  },
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            </section>
          )}

          {/* STICKY SAVE BUTTON */}
          <AdminStickyFooter
            onReload={
              reloadDraft
            }
            onSave={
              saveDraft
            }
            saving={saving}
            busy={
              saving ||
              Boolean(
                uploadingKey,
              ) ||
              Boolean(
                loadError,
              )
            }
            saveLabel="Save Section"
            savingLabel="Saving..."
          />
        </>
      )}
    </div>
  );
}
