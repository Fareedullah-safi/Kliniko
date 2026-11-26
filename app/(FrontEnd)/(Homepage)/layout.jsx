"use client";

import Footer from "@/app/Components/KlinikoFooter";
import { NavBar } from "@/app/Components/NavBar";
import { usePathname } from "next/navigation";

export default function FrontEndLayout({ children }) {
  const pathname = usePathname();

  // If on admin route, render only children
  if (pathname?.startsWith("/admin")) {
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
