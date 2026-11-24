import { Suspense } from "react";

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

// ==========================================
// HOMEPAGE CONTENT
// ==========================================

async function HomeContent() {
  // Load all sections from MongoDB in one query.
  const cms = await getKlinikoContent();

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

      <KlinikoDoctors
        data={cms.doctors?.content ?? {}}
        cards={cms.doctors?.cards ?? []}
      />

      <KlinikoCaseStudy
        data={cms["case-study"]?.content ?? {}}
        cards={cms["case-study"]?.cards ?? []}
      />

      <KlinikoAppointment data={cms.appointment?.content ?? {}} />

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

// ==========================================
// MAIN PAGE
// ==========================================

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
