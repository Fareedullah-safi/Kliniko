import { Suspense } from "react";

import KlinikoLoader from "@/app/Components/Kliniko/KlinikoLoader";
import RouteBanner from "@/app/Components/Kliniko/RouteBanner";
import {
  doctorHref,
  doctorSocialLinks,
  doctorText,
} from "@/Lib/Kliniko/doctorProfile";
import { getKlinikoContent } from "@/Lib/Kliniko/getKlinikoContent";

import KlinikoAppointment from "@/app/(FrontEnd)/(Homepage)/Home/KlinikoAppointment";
import KlinikoBlogNews from "@/app/(FrontEnd)/(Homepage)/Home/KlinikoBlogNews";
import KlinikoDoctors from "@/app/(FrontEnd)/(Homepage)/Home/KlinikoDoctors";
import KlinikoServices from "@/app/(FrontEnd)/(Homepage)/Home/KlinikoServices";
import KlinikoTestimonials from "@/app/(FrontEnd)/(Homepage)/Home/KlinikoTestimonials";

export const metadata = {
  title: "Our Medical Services | Kliniko",
};

const SECTION_LIMIT = 3;

async function ServicesContent() {
  const cms = await getKlinikoContent();

  const servicesContent = cms.services?.content ?? {};
  const serviceCards = cms.services?.cards ?? [];

  const doctors = (cms.doctors?.cards ?? [])
    .filter((doctor) => doctor?.id && doctorText(doctor.name))
    .slice(0, SECTION_LIMIT);

  const appointmentDoctors = doctors.map((doctor) => ({
    id: doctor.id,
    name: doctorText(doctor.name),
  }));

  const doctorCards = doctors.map((doctor) => ({
    id: doctor.id,
    name: doctor.name,
    specialty: doctor.specialty,
    image: doctor.image,
    link: doctorHref(doctor),
    ...doctorSocialLinks(doctor),
  }));

  const testimonials = (cms.testimonials?.cards ?? []).slice(0, SECTION_LIMIT);
  const articles = (cms.blog?.cards ?? []).slice(0, SECTION_LIMIT);

  return (
    <main className="overflow-x-hidden">
      <RouteBanner
        image={servicesContent.detailsBanner || ""}
        heading={servicesContent.bannerHeading}
      />

      <KlinikoServices data={servicesContent} cards={serviceCards} />

      <KlinikoAppointment
        data={cms.appointment?.content ?? {}}
        doctors={appointmentDoctors}
      />

      {doctorCards.length > 0 && (
        <KlinikoDoctors data={cms.doctors?.content ?? {}} cards={doctorCards} />
      )}

      {testimonials.length > 0 && (
        <KlinikoTestimonials
          data={cms.testimonials?.content ?? {}}
          cards={testimonials}
        />
      )}

      {articles.length > 0 && (
        <KlinikoBlogNews data={cms.blog?.content ?? {}} cards={articles} />
      )}
    </main>
  );
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={<KlinikoLoader mode="page" label="Loading services…" />}
    >
      <ServicesContent />
    </Suspense>
  );
}
