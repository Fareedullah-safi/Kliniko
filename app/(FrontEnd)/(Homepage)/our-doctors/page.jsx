import { Stethoscope } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import RouteBanner from "@/app/Components/Kliniko/RouteBanner";
import {
  doctorHref,
  doctorSocialLinks,
  doctorText,
} from "@/Lib/Kliniko/doctorProfile";
import { getKlinikoContent } from "@/Lib/Kliniko/getKlinikoContent";

import { DoctorReveal } from "./DoctorMotion";
import DoctorSocials from "./DoctorSocials";

export const metadata = {
  title: "Our Doctors | Kliniko",
};

function DoctorCard({ doctor, index }) {
  const name = doctorText(doctor.name);
  const specialty = doctorText(doctor.specialty);
  const href = doctorHref(doctor);

  return (
    <DoctorReveal lift delay={(index % 4) * 0.05}>
      <article className="group/card relative flex h-full flex-col rounded-[22px] border border-[#D5E5E1] bg-[#F0F7F3] p-2.5 text-[#101E50] shadow-sm transition-[background-color,border-color,box-shadow] duration-300 focus-within:border-[#142650] focus-within:bg-[#101F4D] hover:border-[#142650] hover:bg-[#101F4D] hover:shadow-xl">
        <Link
          href={href}
          aria-label={`View ${name}'s profile`}
          className="block overflow-hidden rounded-[16px] bg-[#DCEBE8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#159BB1]"
        >
          <div className="aspect-[4/3]">
            {doctor.image ? (
              <img
                src={doctor.image}
                alt=""
                loading={index < 2 ? "eager" : "lazy"}
                className="h-full w-full object-cover object-top motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover/card:scale-[1.035]"
              />
            ) : (
              <span className="grid h-full place-items-center text-[#458793]">
                <Stethoscope size={50} aria-hidden="true" />
              </span>
            )}
          </div>
        </Link>

        <div className="flex flex-1 items-end justify-between gap-3 px-3 pt-5 pb-3 sm:px-4 sm:pb-4">
          <div className="min-w-0 self-start">
            <h3 className="text-[22px] leading-tight font-bold tracking-[-0.03em] sm:text-2xl">
              <Link
                href={href}
                className="decoration-[#37BCCB] decoration-2 underline-offset-4 transition-colors group-focus-within/card:text-white group-hover/card:text-white hover:underline"
              >
                {name}
              </Link>
            </h3>

            {specialty && (
              <p className="mt-1.5 text-sm leading-6 font-medium text-[#546772] group-focus-within/card:text-[#E0EEF1] group-hover/card:text-[#E0EEF1]">
                {specialty}
              </p>
            )}
          </div>

          <DoctorSocials
            name={name}
            profilePath={href}
            links={doctorSocialLinks(doctor)}
          />
        </div>
      </article>
    </DoctorReveal>
  );
}

async function DoctorsDirectory() {
  const cms = await getKlinikoContent();
  const section = cms.doctors ?? {};
  const content = section.content ?? {};

  const doctors = (section.cards ?? []).filter(
    (doctor) => doctor?.id && doctorText(doctor.name),
  );

  const badge = doctorText(content.badge);
  const title = doctorText(content.title) || "Meet Our Doctors";

  return (
    <main className="min-h-screen bg-white text-[#101E50]">
      <RouteBanner
        image={content.detailsBanner}
        heading={content.bannerHeading}
      />

      <section className="mx-auto w-full max-w-[1540px] px-6 py-14 sm:px-10 sm:py-20 lg:px-12 2xl:px-6">
        <DoctorReveal>
          <header className="mx-auto mb-10 max-w-[800px] text-center sm:mb-14">
            {badge && (
              <p className="mb-4 inline-flex items-center gap-2 font-semibold text-[#11798A]">
                <Stethoscope size={19} aria-hidden="true" />
                {badge}
              </p>
            )}

            <h2 className="text-[clamp(2.2rem,4vw,4rem)] leading-[1.1] font-bold tracking-[-0.045em] text-balance whitespace-pre-line">
              {title}
            </h2>
          </header>
        </DoctorReveal>

        {doctors.length ? (
          <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
            {doctors.map((doctor, index) => (
              <DoctorCard key={doctor.id} doctor={doctor} index={index} />
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-600">
            No doctor profiles are available yet.
          </p>
        )}
      </section>
    </main>
  );
}

export default function OurDoctorsPage() {
  return (
    <Suspense
      fallback={
        <p role="status" className="p-8 text-center">
          Loading doctors...
        </p>
      }
    >
      <DoctorsDirectory />
    </Suspense>
  );
}
