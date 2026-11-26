import { Suspense } from "react";

import {
  doctorHref,
  doctorSocialLinks,
  doctorText,
} from "@/Lib/Kliniko/doctorProfile";
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

async function HomeContent() {
  const cms = await getKlinikoContent();

  const savedDoctors = (cms.doctors?.cards ?? []).filter(
    (card) => card?.id && doctorText(card.name),
  );

  const doctorCards = savedDoctors.map((card) => ({
    id: card.id,
    name: card.name,
    specialty: card.specialty,
    image: card.image,
    link: doctorHref(card),
    ...doctorSocialLinks(card),
  }));

  const doctorOptions = savedDoctors.map((card) => ({
    id: card.id,
    name: doctorText(card.name),
  }));

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
          <p role="status">Loading Kliniko...</p>
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
