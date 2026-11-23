import FrontEndLayout from "@/app/Components/HelperHooks/FrontEndLayout";
import WowAnimation from "@/app/Components/WowAnimation";
import "@/app/globals.css";
import { Mona_Sans, Noto_Sans_Arabic } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";

const monaSans = Mona_Sans({
  subsets: ["latin"],
  variable: "--font-mona",
  display: "swap",
});

const arabicFont = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata = {
  title: "Bexon - Corporate Business",
  description: "Corporate Business Website",
  icons: {
    icon: "/project-logo.jpg?v=1",
    shortcut: "/project-logo.jpg?v=1",
    apple: "/project-logo.jpg?v=1",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/project-logo.jpg?v=1" sizes="any" />
      </head>

      <body
        className={`${monaSans.variable} ${arabicFont.variable}`}
        suppressHydrationWarning
      >
        <NextTopLoader
          color="#1D8B8A"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #1D8B8A, 0 0 5px #1D8B8A"
        />

        <WowAnimation />

        <FrontEndLayout>{children}</FrontEndLayout>

        <Toaster
          position="top-right"
          richColors
          // ★ Removed default closeButton
          // ★ Stays for 3 seconds (unless hovered)
          duration={3000}
          // ★ Pauses countdown on hover
          pauseWhenPageIsHidden
          toastOptions={{
            style: {
              fontFamily: "var(--font-mona), sans-serif",
              // ★ Make the whole box clickable to dismiss
              cursor: "pointer",
            },
            classNames: {
              // ★ High visibility box styles
              toast:
                "rounded-2xl border-2 border-[#1D8B8A]/50 bg-[var(--surface,#0C1E21)] text-[var(--foreground,#FFFFFF)] shadow-2xl shadow-[#1D8B8A]/20 backdrop-blur-md transition-all text-sm font-medium hover:border-[#1D8B8A] hover:bg-[#1D8B8A]/5 hover:scale-[1.02] active:scale-[0.98]",
              title: "font-semibold text-base text-[var(--foreground)]",
              description: "text-xs text-[var(--muted)] mt-0.5",
              actionButton:
                "bg-[#1D8B8A] hover:bg-[#167575] text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors shadow-sm",
              cancelButton:
                "bg-[var(--surface-soft)] text-[var(--muted)] hover:text-[var(--foreground)] text-xs font-medium px-3 py-1.5 rounded-xl transition-colors",
              // ★ Specific style rules for maximum visibility
              success:
                "!border-[#1D8B8A]/60 !bg-[#1D8B8A]/15 !text-[#35B5B5] !shadow-[#1D8B8A]/30",
              error:
                "!border-red-500/60 !bg-red-500/15 !text-red-400 !shadow-red-500/30",
              warning:
                "!border-amber-500/60 !bg-amber-500/15 !text-amber-400 !shadow-amber-500/30",
              info: "!border-[#1D8B8A]/60 !bg-[#1D8B8A]/15 !text-[#35B5B5] !shadow-[#1D8B8A]/30",
            },
          }}
        />
      </body>
    </html>
  );
}
