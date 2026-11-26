"use client";

import {
  ArrowDown,
  ArrowUp,
  Globe2,
  Languages,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const API = "/api/kliniko-languages?all=1";
const BASE = "/api/kliniko-languages";

const INPUT =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]";

const PANEL =
  "rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm";

const BTN =
  "inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50";

const START = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    direction: "ltr",
    enabled: true,
  },
  {
    code: "fa",
    name: "Dari",
    nativeName: "دری",
    direction: "rtl",
    enabled: true,
  },
];

async function jsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Language API returned HTML (HTTP ${response.status}). Check your API route.`,
    );
  }

  const data = await response.json();

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Request failed.");
  }

  return data;
}

export default function LanguagesAdminPage() {
  const [languages, setLanguages] = useState(START);
  const [defaultLanguage, setDefaultLanguage] = useState("en");
  const [version, setVersion] = useState(null);

  const [newLang, setNewLang] = useState({
    code: "",
    name: "",
    nativeName: "",
    direction: "ltr",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingCode, setDeletingCode] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setReady(false);
    setError("");

    try {
      const response = await fetch(API, { cache: "no-store" });
      const data = await jsonResponse(response);

      setLanguages(data.languages?.length ? data.languages : START);
      setDefaultLanguage(data.defaultLanguage || "en");
      setVersion(data.version ?? null);
      setDirty(false);
      setReady(true);
    } catch (loadError) {
      setError(loadError.message || "Could not load languages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!dirty) return;

    function warnBeforeLeaving(event) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", warnBeforeLeaving);

    return () => {
      window.removeEventListener("beforeunload", warnBeforeLeaving);
    };
  }, [dirty]);

  function change(code, field, value) {
    if (field === "enabled" && code === "en" && !value) {
      return;
    }

    if (field === "enabled" && code === defaultLanguage && !value) {
      toast.error("Choose another default language first.");
      return;
    }

    setLanguages((current) =>
      current.map((language) =>
        language.code === code
          ? {
              ...language,
              [field]: value,
            }
          : language,
      ),
    );

    setDirty(true);
  }

  function move(index, distance) {
    const targetIndex = index + distance;

    if (targetIndex < 0 || targetIndex >= languages.length) {
      return;
    }

    setLanguages((current) => {
      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });

    setDirty(true);
  }

  function addLanguage(event) {
    event.preventDefault();

    const code = newLang.code.trim().toLowerCase();
    const name = newLang.name.trim();
    const nativeName = newLang.nativeName.trim();

    if (!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(code)) {
      toast.error("Enter a language code such as ps, ur, ar, or pt-br.");
      return;
    }

    if (!name || !nativeName) {
      toast.error("Both names are required.");
      return;
    }

    if (languages.some((language) => language.code === code)) {
      toast.error("This language already exists.");
      return;
    }

    setLanguages((current) => [
      ...current,
      {
        code,
        name,
        nativeName,
        direction: newLang.direction,
        enabled: true,
      },
    ]);

    setNewLang({
      code: "",
      name: "",
      nativeName: "",
      direction: "ltr",
    });

    setDirty(true);
  }

  async function save() {
    if (!ready || !dirty || saving || deletingCode) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          languages,
          defaultLanguage,
          version,
        }),
      });

      const data = await jsonResponse(response);

      setLanguages(data.languages);
      setDefaultLanguage(data.defaultLanguage);
      setVersion(data.version);
      setDirty(false);

      window.dispatchEvent(new Event("kliniko-languages-updated"));
      toast.success("Website languages saved.");
    } catch (saveError) {
      toast.error(saveError.message || "Could not save languages.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteLanguage(language) {
    if (!ready || saving || deletingCode) {
      return;
    }

    if (language.code === "en") {
      toast.error("English cannot be deleted.");
      return;
    }

    if (language.code === defaultLanguage) {
      toast.error("Choose another default language first.");
      return;
    }

    if (dirty) {
      toast.error("Save your language changes before deleting a language.");
      return;
    }

    const confirmed = window.confirm(
      `Permanently delete ${language.nativeName} (${language.code}) and its saved translations?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingCode(language.code);

    try {
      const response = await fetch(BASE, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: language.code,
        }),
      });

      const data = await jsonResponse(response);

      setLanguages(data.languages);
      setDefaultLanguage(data.defaultLanguage);
      setVersion(data.version);
      setDirty(false);

      window.dispatchEvent(new Event("kliniko-languages-updated"));
      toast.success(
        `${language.nativeName} and its saved translations were deleted.`,
      );
    } catch (deleteError) {
      toast.error(deleteError.message || "Could not delete this language.");
    } finally {
      setDeletingCode(null);
    }
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 pb-28 text-[var(--foreground)]">
      <header className="flex items-center gap-3">
        <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
          <Globe2 size={27} />
        </div>

        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-[var(--accent)] uppercase">
            Site Structure
          </p>

          <h1 className="text-2xl font-bold sm:text-3xl">Website Languages</h1>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Add and manage the languages used throughout your website.
          </p>
        </div>
      </header>

      {loading ? (
        <div className={`${PANEL} flex items-center justify-center gap-3 p-10`}>
          <Loader2 className="animate-spin" />
          Loading languages...
        </div>
      ) : (
        <>
          {error && (
            <div
              className={`${PANEL} flex items-center justify-between gap-3 p-5`}
            >
              <p className="text-sm text-red-500">
                {error}. Saving and deleting are disabled until the API works.
              </p>

              <button type="button" onClick={() => void load()} className={BTN}>
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          )}

          <section className={PANEL}>
            <div className="border-b border-[var(--border)] p-5">
              <h2 className="flex items-center gap-2 font-semibold">
                <Languages size={18} className="text-[var(--accent)]" />
                Add New Language
              </h2>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Enter a language code and choose its text direction.
              </p>
            </div>

            <form
              className="grid gap-4 p-5 sm:grid-cols-2"
              onSubmit={addLanguage}
            >
              <label className="space-y-2 text-sm font-semibold">
                Language Code
                <input
                  className={INPUT}
                  placeholder="ps"
                  value={newLang.code}
                  onChange={(event) =>
                    setNewLang((current) => ({
                      ...current,
                      code: event.target.value.toLowerCase(),
                    }))
                  }
                />
              </label>

              <label className="space-y-2 text-sm font-semibold">
                Language Name
                <input
                  className={INPUT}
                  placeholder="Pashto"
                  value={newLang.name}
                  onChange={(event) =>
                    setNewLang((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="space-y-2 text-sm font-semibold">
                Native Name
                <input
                  dir={newLang.direction}
                  className={INPUT}
                  placeholder="پښتو"
                  value={newLang.nativeName}
                  onChange={(event) =>
                    setNewLang((current) => ({
                      ...current,
                      nativeName: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="space-y-2 text-sm font-semibold">
                Text Direction
                <select
                  className={INPUT}
                  value={newLang.direction}
                  onChange={(event) =>
                    setNewLang((current) => ({
                      ...current,
                      direction: event.target.value,
                    }))
                  }
                >
                  <option value="ltr">Left to Right (LTR)</option>
                  <option value="rtl">Right to Left (RTL)</option>
                </select>
              </label>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={!ready || saving || deletingCode !== null}
                  className={BTN}
                >
                  <Plus size={16} />
                  Add Language
                </button>
              </div>
            </form>
          </section>

          <section className={PANEL}>
            <div className="border-b border-[var(--border)] p-5">
              <h2 className="font-semibold">
                All Languages ({languages.length})
              </h2>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Deleting a language also removes its saved translations handled
                by the language API.
              </p>
            </div>

            <div className="space-y-4 p-5">
              {languages.map((language, index) => (
                <article
                  key={language.code}
                  className="rounded-2xl border border-[var(--border)] p-4"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-[var(--accent)]">
                      <span className="rounded-lg bg-[var(--accent-soft)] px-3 py-1 uppercase">
                        {language.code}
                      </span>

                      {language.code === "en"
                        ? "English fallback"
                        : language.code === defaultLanguage
                          ? "Default website language"
                          : "Website language"}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        title="Move up"
                        disabled={
                          index === 0 || saving || deletingCode !== null
                        }
                        onClick={() => move(index, -1)}
                        className="rounded-lg p-2 disabled:opacity-30"
                      >
                        <ArrowUp size={16} />
                      </button>

                      <button
                        type="button"
                        title="Move down"
                        disabled={
                          index === languages.length - 1 ||
                          saving ||
                          deletingCode !== null
                        }
                        onClick={() => move(index, 1)}
                        className="rounded-lg p-2 disabled:opacity-30"
                      >
                        <ArrowDown size={16} />
                      </button>

                      <button
                        type="button"
                        title={`Delete ${language.nativeName}`}
                        aria-label={`Delete ${language.nativeName}`}
                        disabled={
                          language.code === "en" ||
                          language.code === defaultLanguage ||
                          dirty ||
                          saving ||
                          deletingCode !== null ||
                          !ready
                        }
                        onClick={() => void deleteLanguage(language)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        {deletingCode === language.code ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="space-y-2 text-xs font-semibold">
                      Name
                      <input
                        className={INPUT}
                        value={language.name}
                        onChange={(event) =>
                          change(language.code, "name", event.target.value)
                        }
                      />
                    </label>

                    <label className="space-y-2 text-xs font-semibold">
                      Native Name
                      <input
                        dir={language.direction}
                        className={INPUT}
                        value={language.nativeName}
                        onChange={(event) =>
                          change(
                            language.code,
                            "nativeName",
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <label className="space-y-2 text-xs font-semibold">
                      Direction
                      <select
                        className={INPUT}
                        value={language.direction}
                        onChange={(event) =>
                          change(language.code, "direction", event.target.value)
                        }
                      >
                        <option value="ltr">LTR</option>
                        <option value="rtl">RTL</option>
                      </select>
                    </label>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="accent-[var(--accent)]"
                        checked={language.enabled}
                        disabled={
                          language.code === "en" ||
                          saving ||
                          deletingCode !== null
                        }
                        onChange={(event) =>
                          change(language.code, "enabled", event.target.checked)
                        }
                      />
                      Enabled
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="default-language"
                        className="accent-[var(--accent)]"
                        checked={defaultLanguage === language.code}
                        disabled={
                          !language.enabled || saving || deletingCode !== null
                        }
                        onChange={() => {
                          setDefaultLanguage(language.code);
                          setDirty(true);
                        }}
                      />
                      Default
                    </label>

                    <span
                      dir={language.direction}
                      className="min-w-24 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2"
                    >
                      {language.nativeName}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div
            className={`${PANEL} sticky bottom-3 z-40 flex flex-wrap items-center justify-between gap-3 p-4 shadow-xl`}
          >
            <span className="text-xs text-[var(--muted)]">
              {!ready
                ? "API unavailable"
                : dirty
                  ? "Unsaved changes"
                  : "All changes saved"}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!dirty || window.confirm("Discard unsaved changes?")) {
                    void load();
                  }
                }}
                disabled={saving || deletingCode !== null}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm disabled:opacity-50"
              >
                <RefreshCw size={16} className="inline" />
                <span className="ml-2">Reload</span>
              </button>

              <button
                type="button"
                onClick={() => void save()}
                disabled={!ready || !dirty || saving || deletingCode !== null}
                className={BTN}
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}

                {saving ? "Saving..." : "Save Languages"}
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
