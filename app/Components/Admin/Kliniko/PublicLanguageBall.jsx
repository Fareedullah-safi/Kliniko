"use client";

import KlinikoLanguageBall from "@/app/Components/Admin/KlinikoLanguageBall";

export default function PublicLanguageBall() {
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_PUBLIC_LANGUAGES === "true";

  // Client has not paid: hide the language ball.
  if (!isEnabled) {
    return null;
  }

  // Client has paid: show the language ball.
  return <KlinikoLanguageBall />;
}
