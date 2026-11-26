import { connection } from "next/server";
import { Suspense } from "react";

import KlinikoLoader from "@/app/Components/Kliniko/KlinikoLoader";
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

const LOADER_DURATION = 3000;

async function HomeContent() {
  await connection();

  // Load the CMS and start the timer together.
  // Show the homepage after both are ready.
  const [cms] = await Promise.all([
    getKlinikoContent(),
    new Promise((resolve) => setTimeout(resolve, LOADER_DURATION)),
  ]);

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
      fallback={<KlinikoLoader mode="page" label="Loading homepage…" />}
    >
      <HomeContent />
    </Suspense>
  );
}
