import { Suspense } from "react";
import sanitizeHtml from "sanitize-html";

import { getKlinikoContent } from "@/Lib/Kliniko/getKlinikoContent";

import KlinikoAbout from "./Home/KlinikoAbout";
import KlinikoAppointment from "./Home/KlinikoAppointment";
import KlinikoBlogNews from "./Home/KlinikoBlogNews";
import KlinikoCaseStudy from "./Home/KlinikoCaseStudy";
import KlinikoDoctors from "./Home/KlinikoDoctors";
import KlinikoHero from "./Home/KlinikoHero";
import KlinikoServices from "./Home/KlinikoServices";
import KlinikoTestimonials from "./Home/KlinikoTestimonials";
import KlinikoWhyChoose from "./Home/KlinikoWhyChoose";

// The appointment dropdown only needs each doctor's saved ID and name.
function getDoctorOptions(cards = []) {
  const doctors = [];

  for (const card of cards) {
    const id = typeof card?.id === "string" ? card.id.trim() : "";

    // Support both old plain-text names and CMS rich-text translations.
    const rawName = typeof card?.name === "string" ? card.name : card?.name?.en;

    if (!id || typeof rawName !== "string") continue;

    const name = sanitizeHtml(rawName, {
      allowedTags: [],
      allowedAttributes: {},
    })
      .replace(/&nbsp;|\u00a0/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .trim();

    if (name) doctors.push({ id, name });
  }

  return doctors;
}

async function HomeContent() {
  const cms = await getKlinikoContent();

  const doctorCards = cms.doctors?.cards ?? [];
  const doctorOptions = getDoctorOptions(doctorCards);

  return (
    <main className="overflow-x-hidden">
      <KlinikoHero data={cms.hero?.content ?? null} />

      <KlinikoAbout data={cms.about?.content ?? {}} />

      <KlinikoServices
        data={cms.services?.content ?? {}}
        cards={cms.services?.cards ?? []}
      />

      <KlinikoWhyChoose
        data={cms["why-choose"]?.content ?? {}}
        cards={cms["why-choose"]?.cards ?? []}
      />

      <KlinikoDoctors data={cms.doctors?.content ?? {}} cards={doctorCards} />

      <KlinikoCaseStudy
        data={cms["case-study"]?.content ?? {}}
        cards={cms["case-study"]?.cards ?? []}
      />

      <KlinikoAppointment
        data={cms.appointment?.content ?? {}}
        doctors={doctorOptions}
      />

      <KlinikoTestimonials
        data={cms.testimonials?.content ?? {}}
        cards={cms.testimonials?.cards ?? []}
      />

      <KlinikoBlogNews
        data={cms.blog?.content ?? {}}
        cards={cms.blog?.cards ?? []}
      />
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p>Loading Kliniko...</p>
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
