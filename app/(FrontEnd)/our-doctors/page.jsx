import { ArrowUpRight, Stethoscope } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { doctorHref, doctorText } from "@/Lib/Kliniko/doctorProfile";
import { getKlinikoContent } from "@/Lib/Kliniko/getKlinikoContent";
import { DoctorReveal } from "./DoctorMotion";

export const metadata = {
  title: "Our Doctors | Kliniko",
};

function DoctorCard({ doctor, index }) {
  const name = doctorText(doctor.name);
  const specialty = doctorText(doctor.specialty);

  return (
    <DoctorReveal lift delay={Math.min(index % 4, 3) * 0.055}>
      <Link
        href={doctorHref(doctor)}
        className="group flex h-full flex-col rounded-[24px] border border-[#D3E4E2] bg-white p-2.5 text-[#101E50] shadow-[0_4px_18px_rgba(16,30,80,0.045)] transition-[border-color,box-shadow] duration-300 hover:border-[#91CBD0] hover:shadow-[0_16px_35px_rgba(16,63,77,0.12)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#148B9E]"
      >
        <div className="relative aspect-[5/4] overflow-hidden rounded-[16px] bg-[#E5F0EE]">
          {doctor.image ? (
            <img
              src={doctor.image}
              alt=""
              loading={index < 2 ? "eager" : "lazy"}
              className="h-full w-full object-cover object-top motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.035]"
            />
          ) : (
            <span className="grid h-full place-items-center text-[#458793]">
              <Stethoscope size={54} strokeWidth={1.3} aria-hidden="true" />
            </span>
          )}
        </div>

        <div className="flex flex-1 items-end justify-between gap-4 px-3.5 pt-5 pb-4 sm:px-4">
          <div className="min-w-0">
            {specialty && (
              <p className="mb-2 text-sm leading-5 font-semibold text-[#127889]">
                {specialty}
              </p>
            )}

            <h2 className="text-[23px] leading-tight font-bold tracking-[-0.025em] sm:text-[25px]">
              <span className="decoration-[#159BB1] decoration-2 underline-offset-4 group-hover:underline group-focus-visible:underline">
                {name}
              </span>
            </h2>
          </div>

          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-[#CDE1DE] bg-[#F1F7F4] text-[#13596A] transition-colors group-hover:border-[#142A55] group-hover:bg-[#142A55] group-hover:text-white group-focus-visible:bg-[#142A55] group-focus-visible:text-white"
          >
            <ArrowUpRight
              size={19}
              className="motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
            />
          </span>
        </div>
      </Link>
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
  const title = doctorText(content.title) || "Our Doctors";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#EDF7F4_0%,#F7FAF9_34%,#FFFFFF_75%)] text-[#101E50]">
      <section className="mx-auto w-full max-w-[1540px] px-6 pt-14 pb-20 sm:px-10 sm:pt-20 lg:px-12 lg:pb-28 2xl:px-6">
        <DoctorReveal>
          <header className="mx-auto mb-10 max-w-[800px] text-center sm:mb-14">
            {badge && (
              <p className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#11798A] sm:text-base">
                <Stethoscope size={19} strokeWidth={2} aria-hidden="true" />
                {badge}
              </p>
            )}

            <h1 className="text-[clamp(2.35rem,4.4vw,4.5rem)] leading-[1.07] font-bold tracking-[-0.05em] text-balance whitespace-pre-line">
              {title}
            </h1>

            <span
              aria-hidden="true"
              className="mx-auto mt-6 block h-1 w-16 rounded-full bg-gradient-to-r from-[#6457E8] to-[#159BB1]"
            />
          </header>
        </DoctorReveal>

        {doctors.length > 0 ? (
          <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
            {doctors.map((doctor, index) => (
              <DoctorCard key={doctor.id} doctor={doctor} index={index} />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-slate-600">
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
        <main className="grid min-h-[50vh] place-items-center text-[#142A55]">
          <p role="status">Loading doctors...</p>
        </main>
      }
    >
      <DoctorsDirectory />
    </Suspense>
  );
}
