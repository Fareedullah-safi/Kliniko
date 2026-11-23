"use client";

import { usePathname } from "next/navigation";

// Absolute imports using '@' alias (avoids relative path issues)
import Footer from "@/app/Components/KlinikoFooter";
import { NavBar } from "../NavBar";

export default function FrontEndLayout({ children }) {
  const pathname = usePathname();

  // Hide Navbar & Footer ONLY on admin routes (/admin, /admin/dashboard, etc.)
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <main>{children}</main>;
  }

  return (
    <>
      <NavBar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
