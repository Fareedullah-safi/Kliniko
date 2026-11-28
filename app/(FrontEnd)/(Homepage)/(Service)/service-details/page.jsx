import { ChevronsRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import KlinikoLoader from "@/app/Components/Kliniko/KlinikoLoader";
import RouteBanner from "@/app/Components/Kliniko/RouteBanner";
import { getKlinikoContent } from "@/Lib/Kliniko/getKlinikoContent";

// CMS rich-text fields are saved as { en: "<p>Text...</p>" }.
// Keep the text and paragraph breaks. The page controls the styling.
function plainText(value) {
  const text = typeof value === "string" ? value : value?.en;

  if (typeof text !== "string") return "";

  return text
    .replace(/<br\b[^>]*>/gi, "\n")
    .replace(/<\/(?:p|div|li|h[1-6])>/gi, "\n\n")
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/&nbsp;|&#160;|\u00a0/gi, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export const metadata = {
  title: "Service Details | Kliniko",
};

async function ServiceDetailsContent() {
  const cms = await getKlinikoContent();
  const services = cms.services ?? {};
  const content = services.content ?? {};

  const title = plainText(content["services-details-title"]);
  const description = plainText(content["services-details-description"]);
  const image = content["image-services-details"];
  const sidebarTitle = plainText(content.sidebarTitle) || "Our Services";

  const sidebarItems = (services.cards ?? [])
    .filter((card) => card?.id)
    .map((card) => ({
      id: card.id,
      title: plainText(card.title),
      href: typeof card.link === "string" ? card.link.trim() : "",
    }))
    .filter((item) => item.title)
    .slice(0, 10);

  return (
    <main className="min-h-screen bg-white text-[#101E50]">
      <RouteBanner image={content.detailsBanner || ""} />
      <div className="mx-auto w-full max-w-[1540px] px-6 py-12 sm:px-10 sm:py-16 lg:px-12 lg:py-20 2xl:px-6">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2.07fr)_minmax(0,1fr)] lg:gap-8">
          <article className="min-w-0 overflow-hidden rounded-[20px] bg-[#F1F7F3]">
            {typeof image === "string" && image.trim() && (
              <img
                src={image.trim()}
                alt=""
                fetchPriority="high"
                className="aspect-[5/3] w-full object-cover object-center"
              />
            )}

            <div className="p-6 sm:p-8 xl:p-10">
              <h1 className="text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.16] font-bold tracking-[-0.035em] text-balance">
                {title || "Service Details"}
              </h1>

              <div aria-hidden="true" className="mt-5 flex gap-2">
                <span className="h-2 w-14 skew-x-[35deg] rounded-sm bg-[#101E50]" />
                <span className="h-2 w-8 skew-x-[35deg] rounded-sm bg-[#159BAE]" />
              </div>

              {description && (
                <p className="mt-7 text-base leading-[1.8] whitespace-pre-line text-[#536269] sm:text-lg">
                  {description}
                </p>
              )}
            </div>
          </article>

          {sidebarItems.length > 0 && (
            <aside className="min-w-0 overflow-hidden rounded-[20px] bg-[#F1F7F3]">
              <h2
                id="services-sidebar-title"
                className="bg-[#117F91] px-6 py-5 text-2xl font-bold text-white"
              >
                {sidebarTitle}
              </h2>

              <nav
                aria-labelledby="services-sidebar-title"
                className="p-5 sm:p-7"
              >
                <ul className="space-y-2.5">
                  {sidebarItems.map((item) => {
                    const active =
                      item.href.replace(/\/$/, "") === "/service-details";
                    const rowClass = [
                      "flex min-h-12 items-center gap-3 rounded-lg px-4 py-3",
                      "text-sm leading-snug font-semibold sm:text-base",
                      active
                        ? "bg-[#101E50] text-white"
                        : "bg-white text-[#101E50]",
                    ].join(" ");

                    const label = (
                      <>
                        <ChevronsRight
                          size={18}
                          aria-hidden="true"
                          className={
                            active
                              ? "shrink-0 text-white"
                              : "shrink-0 text-[#117F91]"
                          }
                        />
                        <span className="border-l border-current/20 pl-3">
                          {item.title}
                        </span>
                      </>
                    );

                    return (
                      <li key={item.id}>
                        {item.href ? (
                          <Link
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            className={`${rowClass} transition-colors hover:bg-[#172B59] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#117F91]`}
                          >
                            {label}
                          </Link>
                        ) : (
                          <span className={rowClass}>{label}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ServiceDetailsPage() {
  return (
    <Suspense
      fallback={<KlinikoLoader mode="page" label="Loading service details…" />}
    >
      <ServiceDetailsContent />
    </Suspense>
  );
}
