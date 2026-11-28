"use client";

import Spinner from "@/app/Components/Admin/Spinner";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const API = "/api/admin/kliniko-appointments";

const fields = [
  ["name", "Patient name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["department", "Department"],
  ["doctorName", "Doctor"],
  ["date", "Requested date"],
  ["message", "Message"],
];

export default function AppointmentsAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(API, {
          cache: "no-store",
          signal: controller.signal,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Could not load requests.");
        }

        setRows(result.data);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => controller.abort();
  }, []);

  async function remove(id) {
    setDeleting(id);

    try {
      const response = await fetch(API + "?id=" + encodeURIComponent(id), {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Delete failed.");
      }

      setRows((current) => current.filter((row) => row._id !== id));
      toast.success("Appointment request deleted.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting("");
    }
  }

  if (loading)
    return (
      <div className="flex min-h-96 items-center justify-center bg-[var(--background)]">
        <Spinner />
      </div>
    );

  return (
    <main className="mx-auto max-w-6xl space-y-5 text-[var(--foreground)]">
      <h1 className="text-2xl font-bold">Appointment requests</h1>

      {error && <p role="alert">{error}</p>}

      {!error && rows.length === 0 && <p>No appointment requests yet.</p>}

      {rows.map((row) => (
        <article
          key={row._id}
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
        >
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map(([key, label]) => (
              <div
                key={key}
                className={key === "message" ? "sm:col-span-2" : ""}
              >
                <dt className="text-xs font-semibold text-[var(--muted)]">
                  {label}
                </dt>

                <dd className="mt-1 break-words whitespace-pre-wrap">
                  {row[key] || "—"}
                </dd>
              </div>
            ))}
          </dl>

          <button
            type="button"
            disabled={Boolean(deleting)}
            onClick={() => remove(row._id)}
            className="mt-5 rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-500 disabled:opacity-50"
          >
            {deleting === row._id ? "Deleting…" : "Delete request"}
          </button>
        </article>
      ))}
    </main>
  );
}
