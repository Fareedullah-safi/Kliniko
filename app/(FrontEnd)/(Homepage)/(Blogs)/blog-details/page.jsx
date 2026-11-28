import { ChevronsRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import KlinikoLoader from "@/app/Components/Kliniko/KlinikoLoader";
import { getKlinikoContent } from "@/Lib/Kliniko/getKlinikoContent";
import RouteBanner from "@/app/Components/Kliniko/RouteBanner";

export const metadata = {
  title: "Blog Details | Kliniko",
};

// Read English rich text and keep paragraph breaks for the article body.
function plainText(value) {
  const text = typeof value === "string" ? value : value?.en;
  if (typeof text !== "string") return "";

  return text
    .replace(/<br\b[^>]*>/gi, "\n")
    .replace(/<\/(?:p|div|h[1-6]|li)>/gi, "\n\n")
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

function pageLink(value) {
  if (typeof value !== "string") return "";

  const href = value.trim();
  if (/[\s\\]/.test(href)) return "";

  if (/^\/(?!\/)/.test(href) || /^https?:\/\//i.test(href)) {
    return href;
  }

  return "";
}

async function BlogDetailsContent() {
  const cms = await getKlinikoContent();
  const content = cms.blog?.content ?? {};

  // These keys match your Blog & News admin fields exactly.
  const title = plainText(content["Blog-details-title"]) || "Blog Details";
  const description = plainText(content["Blog-details-description"]);
  const image = content["image-Blog-details"];

  const sidebarTitle =
    plainText(cms.services?.content?.sidebarTitle) || "Our Services";

  const services = (cms.services?.cards ?? [])
    .filter((card) => card?.id)
    .map((card) => ({
      id: card.id,
      title: plainText(card.title),
      href: pageLink(card.link),
    }))
    .filter((service) => service.title)
    .slice(0, 10);

  return (
    <main className="min-h-screen bg-white text-[#101E50]">
        <RouteBanner image={cms.blog?.content?.detailsBanner || ""} />
      <div className="mx-auto w-full max-w-[1540px] px-6 py-12 sm:px-10 sm:py-16 lg:px-12 lg:py-20 2xl:px-6">
        <div
          className={`grid items-start gap-6 lg:gap-8 ${
            services.length
              ? "lg:grid-cols-[minmax(0,2.07fr)_minmax(0,1fr)]"
              : ""
          }`}
        >
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
              <h1 className="text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.16] font-bold tracking-[-0.035em] text-balance break-words">
                {title}
              </h1>

              <div aria-hidden="true" className="mt-5 flex gap-2">
                <span className="h-2 w-14 skew-x-[35deg] rounded-sm bg-[#101E50]" />
                <span className="h-2 w-8 skew-x-[35deg] rounded-sm bg-[#159BAE]" />
              </div>

              {description && (
                <div className="mt-7 space-y-4 text-base leading-[1.8] text-[#536269] sm:text-lg">
                  {description.split(/\n{2,}/).map((paragraph, index) => (
                    <p key={index} className="break-words whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}

              <Link
                href="/blog"
                className="mt-8 inline-flex rounded-sm font-semibold text-[#117F91] underline-offset-4 hover:underline focus-visible:underline"
              >
                Back to Blog &amp; News
              </Link>
            </div>
          </article>

          {services.length > 0 && (
            <aside className="min-w-0 rounded-[20px] bg-[#F1F7F3]">
              <h2
                id="blog-details-services-title"
                className="rounded-t-[20px] bg-[#117F91] px-6 py-5 text-2xl font-bold text-white"
              >
                {sidebarTitle}
              </h2>

              <nav
                aria-labelledby="blog-details-services-title"
                className="p-5 sm:p-7"
              >
                <ul className="space-y-2.5">
                  {services.map((service) => {
                    const rowClass =
                      "flex min-h-12 items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold";

                    const label = (
                      <>
                        <ChevronsRight
                          size={18}
                          aria-hidden="true"
                          className="shrink-0 text-[#12899B]"
                        />
                        <span className="border-s border-[#D5E5E1] ps-3">
                          {service.title}
                        </span>
                      </>
                    );

                    return (
                      <li key={service.id}>
                        {service.href ? (
                          <Link
                            href={service.href}
                            className={`${rowClass} transition-colors hover:bg-[#101E50] hover:text-white focus-visible:outline-2 focus-visible:outline-[#117F91]`}
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

export default function BlogDetailsPage() {
  return (
    <Suspense
      fallback={<KlinikoLoader mode="page" label="Loading blog details…" />}
    >
      <BlogDetailsContent />
    </Suspense>
  );
}
