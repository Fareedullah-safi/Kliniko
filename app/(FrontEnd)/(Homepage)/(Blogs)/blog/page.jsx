import { ChevronsRight, Share2, UserRound } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import KlinikoLoader from "@/app/Components/Kliniko/KlinikoLoader";
import RouteBanner from "@/app/Components/Kliniko/RouteBanner";
import { getKlinikoContent } from "@/Lib/Kliniko/getKlinikoContent";

export const metadata = {
  title: "Blog & News | Kliniko",
};

function plainText(value) {
  const text = typeof value === "string" ? value : value?.en;
  if (typeof text !== "string") return "";

  return text
    .replace(/<br\b[^>]*>|<\/(?:p|div|h[1-6])>/gi, " ")
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/&nbsp;|&#160;|\u00a0/gi, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function pageLink(value) {
  if (typeof value !== "string") return "";

  const href = value.trim();

  if (/[\s\\]/.test(href)) return "";
  if (/^\/(?!\/)/.test(href) || /^https?:\/\//i.test(href)) return href;

  return "";
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function publicationDate(value) {
  if (typeof value !== "string" || !value) return "";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : dateFormat.format(date);
}

function ArticleCard({ article }) {
  const { title, image, author, date, href } = article;
  const dateLabel = publicationDate(date);

  let shareUrl = "";

  if (href) {
    try {
      shareUrl = new URL(href, process.env.NEXT_PUBLIC_SITE_URL || undefined)
        .href;
    } catch {
      // A relative article URL needs the site's origin for email sharing.
    }
  }

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-[20px] bg-[#F1F7F3] text-[#101E50]">
      {image && (
        <div className="relative overflow-hidden">
          <img
            src={image}
            alt=""
            loading="lazy"
            className="aspect-[1.62] w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.035]"
          />

          {dateLabel && (
            <time
              dateTime={date}
              className="absolute start-6 bottom-0 rounded-t-2xl border-b-2 border-[#159BAE] bg-white px-5 py-2 text-sm text-[#52616A]"
            >
              {dateLabel}
            </time>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-4 text-sm text-[#52616A]">
          {author && (
            <span className="inline-flex items-center gap-2">
              <UserRound size={16} aria-hidden="true" />
              {author}
            </span>
          )}

          {!image && dateLabel && <time dateTime={date}>{dateLabel}</time>}
        </div>

        <h2 className="mt-3 text-[clamp(1.3rem,2vw,1.95rem)] leading-tight font-bold tracking-tight break-words">
          {href ? (
            <Link
              href={href}
              className="decoration-[#159BAE] underline-offset-4 hover:underline focus-visible:underline"
            >
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>

        {href && (
          <div className="mt-auto flex items-center justify-between gap-3 pt-6">
            <Link
              href={href}
              aria-label={`Read more about ${title}`}
              className="inline-flex min-h-10 items-center rounded-full bg-[#117F91] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#101E50]"
            >
              Read More
            </Link>

            {shareUrl && (
              <a
                href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareUrl)}`}
                aria-label={`Share ${title} by email`}
                title="Share by email"
                className="grid size-10 place-items-center rounded-xl bg-[#101E50] text-white transition-colors hover:bg-[#117F91]"
              >
                <Share2 size={17} aria-hidden="true" />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

async function BlogContent() {
  const cms = await getKlinikoContent();

  const articles = (cms.blog?.cards ?? [])
    .filter((card) => card?.id)
    .map((card) => ({
      id: card.id,
      title: plainText(card.title),
      author: plainText(card.author),
      image: typeof card.image === "string" ? card.image.trim() : "",
      date: card.date,
      href: pageLink(card.link),
    }))
    .filter((article) => article.title);

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
    <main className="bg-white text-[#101E50]">
      <RouteBanner image={cms.blog?.content?.detailsBanner || ""} />
      <div className="mx-auto w-full max-w-[1540px] px-6 py-12 sm:px-10 sm:py-16 lg:px-12 lg:py-20 2xl:px-6">
        <h1 className="sr-only">
          {plainText(cms.blog?.content?.title) || "Blog & News"}
        </h1>

        <div className="grid items-start gap-7 lg:grid-cols-3">
          <section aria-label="Blog articles" className="min-w-0 lg:col-span-2">
            {articles.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <p className="rounded-2xl bg-[#F1F7F3] p-6 text-[#52616A]">
                No articles are available yet.
              </p>
            )}
          </section>

          {services.length > 0 && (
            <aside className="min-w-0 rounded-[20px] bg-[#F1F7F3]">
              <h2
                id="blog-services-title"
                className="rounded-t-[20px] bg-[#117F91] px-6 py-5 text-2xl font-bold text-white"
              >
                {sidebarTitle}
              </h2>

              <nav aria-labelledby="blog-services-title" className="p-5 sm:p-7">
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

export default function BlogPage() {
  return (
    <Suspense
      fallback={<KlinikoLoader mode="page" label="Loading articles…" />}
    >
      <BlogContent />
    </Suspense>
  );
}
