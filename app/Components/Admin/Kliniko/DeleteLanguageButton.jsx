"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function DeleteLanguageButton({
  language,
  disabled = false,
  onDeleted,
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete ${language.nativeName} (${language.code}) and its saved translations?`,
    );

    if (!confirmed || deleting) return;

    setDeleting(true);

    try {
      const response = await fetch("/api/kliniko-languages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: language.code }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not delete this language.");
      }

      window.dispatchEvent(new Event("kliniko-languages-updated"));
      toast.success(
        `${language.nativeName} and its translations were deleted.`,
      );
      onDeleted?.(result);
    } catch (error) {
      toast.error(error.message || "Could not delete this language.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={disabled || deleting}
      className="inline-flex items-center gap-2 rounded-xl border border-red-300 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {deleting ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Trash2 size={16} />
      )}
      {deleting ? "Deleting..." : "Delete"}
    </button>
  );
}
