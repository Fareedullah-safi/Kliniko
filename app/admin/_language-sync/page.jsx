"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const API = "/api/admin/kliniko-language-sync";

async function readJson(response) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Language Sync API returned HTML (HTTP ${response.status}). Check the API route and server terminal.`,
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Language sync request failed.");
  }

  return data;
}

export default function LanguageSyncPage() {
  const [languages, setLanguages] = useState([]);
  const [orphanLanguages, setOrphanLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [error, setError] = useState("");
  const [updatedDocuments, setUpdatedDocuments] = useState(null);

  const scan = useCallback(async () => {
    setLoading(true);
    setError("");
    setUpdatedDocuments(null);

    try {
      const response = await fetch(API, { cache: "no-store" });
      const data = await readJson(response);

      setLanguages(data.languages || []);
      setOrphanLanguages(data.orphanLanguages || []);
    } catch (scanError) {
      setError(scanError.message || "Could not scan translated content.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void scan();
  }, [scan]);

  async function cleanUnusedTranslations() {
    if (cleaning || orphanLanguages.length === 0) return;

    const codes = orphanLanguages.map((item) => item.code).join(", ");
    const confirmed = window.confirm(
      `Remove saved translations for unavailable language codes: ${codes}?`,
    );

    if (!confirmed) return;

    setCleaning(true);
    setError("");

    try {
      const response = await fetch(API, {
        method: "POST",
        cache: "no-store",
      });

      const data = await readJson(response);

      setUpdatedDocuments(data.updatedDocuments ?? 0);
      setLanguages(data.languages || []);
      setOrphanLanguages([]);

      window.dispatchEvent(new Event("kliniko-languages-updated"));
      toast.success(data.message || "Unused translations were cleaned up.");
    } catch (cleanError) {
      setError(cleanError.message || "Could not clean translated content.");
      toast.error(cleanError.message || "Could not clean translated content.");
    } finally {
      setCleaning(false);
    }
  }

  const hasOrphans = orphanLanguages.length > 0;

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 pb-28 text-[var(--foreground)]">
      <header>
        <p className="text-xs font-bold tracking-[0.2em] text-[var(--accent)] uppercase">
          Site Structure
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Language Syncer</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Find and remove translations for language codes that are no longer
          listed in Website Languages.
        </p>
      </header>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">Available languages</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              These codes are read from the Languages database.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void scan()}
            disabled={loading || cleaning}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Scan again
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {languages.map((language) => (
            <span
              key={language.code}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm"
            >
              <strong className="uppercase">{language.code}</strong>
              <span className="ml-2 text-[var(--muted)]">
                {language.nativeName || language.name}
              </span>
            </span>
          ))}

          {!loading && languages.length === 0 && (
            <p className="text-sm text-[var(--muted)]">
              No languages were returned by the Languages API.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="border-b border-[var(--border)] p-5">
          <h2 className="font-semibold">Unused translations</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            These codes appear in translated content but are missing from the
            Languages list.
          </p>
        </div>

        <div className="space-y-4 p-5">
          {loading ? (
            <div className="flex items-center gap-3 py-6 text-sm text-[var(--muted)]">
              <Loader2 size={18} className="animate-spin" />
              Scanning translated content...
            </div>
          ) : error ? (
            <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          ) : hasOrphans ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                      <th className="py-3 pr-4 font-semibold">Code</th>
                      <th className="py-3 pr-4 font-semibold">
                        Records affected
                      </th>
                      <th className="py-3 font-semibold">Translation maps</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orphanLanguages.map((item) => (
                      <tr
                        key={item.code}
                        className="border-b border-[var(--border)] last:border-0"
                      >
                        <td className="py-3 pr-4 font-bold uppercase">
                          {item.code}
                        </td>
                        <td className="py-3 pr-4">{item.documents}</td>
                        <td className="py-3">{item.translationMaps}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={() => void cleanUnusedTranslations()}
                disabled={cleaning}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {cleaning ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                {cleaning ? "Cleaning..." : "Clean unused translations"}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800">
              <CheckCircle2 size={18} />
              No unused language translations were found.
            </div>
          )}

          {updatedDocuments !== null && (
            <p className="text-sm text-[var(--muted)]">
              Cleanup complete. Updated {updatedDocuments} record
              {updatedDocuments === 1 ? "" : "s"}.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
