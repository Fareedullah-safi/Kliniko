import {
  ArrowDownRight,
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  Mail,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import RouteBanner from "@/app/Components/Kliniko/RouteBanner";
import {
  doctorHref,
  doctorSkills,
  doctorSlug,
  doctorSocialLinks,
  doctorText,
} from "@/Lib/Kliniko/doctorProfile";
import { getKlinikoContent } from "@/Lib/Kliniko/getKlinikoContent";

import KlinikoAppointment from "@/app/(FrontEnd)/(Homepage)/Home/KlinikoAppointment";
import { DoctorReveal, DoctorSkillBar } from "../../DoctorMotion";
import DoctorSocials from "../../DoctorSocials";

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3.5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[#BBDDDC] bg-white text-[#117D90]">
        <Icon size={18} aria-hidden="true" />
      </span>

      <div className="min-w-0">
        <dt className="text-xs leading-5 font-semibold text-[#576C75]">
          {label}
        </dt>
        <dd className="text-[15px] leading-6 font-semibold break-words text-[#142A55]">
          {children}
        </dd>
      </div>
    </div>
  );
}

function ProfileSidebar({ doctor, name, href }) {
  const specialty = doctorText(doctor.specialty);
  const experience = doctorText(doctor.experience);
  const phone = doctorText(doctor.phone);
  const email = doctorText(doctor.email);
  const hours = doctorText(doctor.availability)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <aside className="rounded-[26px] border border-[#B5DCD9] bg-[#F0F7F3] p-3 shadow-[0_10px_30px_rgba(17,67,73,0.06)] sm:p-4">
      {doctor.image && (
        <img
          src={doctor.image}
          alt={name}
          className="aspect-[6/5] w-full rounded-[17px] bg-[#DCEBE8] object-cover object-top"
        />
      )}

      <div className="px-3 pt-6 pb-3 sm:px-4 sm:pb-4">
        {specialty && (
          <p className="inline-flex rounded-full bg-[#117F91] px-3.5 py-1.5 text-sm font-semibold text-white">
            {specialty}
          </p>
        )}

        <h2 className="mt-4 text-[clamp(1.8rem,2.4vw,2.7rem)] leading-[1.12] font-bold tracking-[-0.04em]">
          {name}
        </h2>

        {(phone || email || experience) && (
          <dl className="mt-6 space-y-4 border-t border-[#CFE0DC] pt-6">
            {phone && (
              <InfoRow icon={Phone} label="Phone number">
                <a
                  href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                  className="hover:underline"
                >
                  {phone}
                </a>
              </InfoRow>
            )}

            {email && (
              <InfoRow icon={Mail} label="Email address">
                <a href={`mailto:${email}`} className="hover:underline">
                  {email}
                </a>
              </InfoRow>
            )}

            {experience && (
              <InfoRow icon={BriefcaseBusiness} label="Experience">
                {experience}
              </InfoRow>
            )}
          </dl>
        )}

        {hours.length > 0 && (
          <section className="mt-6 border-t border-[#CFE0DC] pt-5">
            <h3 className="flex items-center gap-2 font-bold">
              <Clock3 size={17} className="text-[#117F91]" aria-hidden="true" />
              Availability
            </h3>

            <ul className="mt-2 divide-y divide-[#D7E5E1] text-sm leading-6 text-[#4D616D]">
              {hours.map((line, index) => (
                <li key={index} className="py-2">
                  {line}
                </li>
              ))}
            </ul>
          </section>
        )}

        <nav
          aria-label={`${name} social media`}
          className="mt-6 border-t border-[#CFE0DC] pt-5"
        >
          <DoctorSocials
            variant="details"
            name={name}
            profilePath={href}
            links={doctorSocialLinks(doctor)}
          />
        </nav>
      </div>
    </aside>
  );
}

async function DoctorDetails({ params }) {
  const { id, slug } = await params;
  const cms = await getKlinikoContent();
  const section = cms.doctors ?? {};

  const doctor = (section.cards ?? []).find((card) => card?.id === id);
  if (!doctor) notFound();

  const href = doctorHref(doctor);
  if (slug !== doctorSlug(doctor)) redirect(href);

  const name = doctorText(doctor.name);
  const summary = doctorText(doctor.summary);
  const specializations = doctorText(doctor.specializations);
  const skills = doctorSkills(doctor);

  const topics = doctorText(doctor.specializationList)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <main className="bg-white text-[#101E50]">
      <RouteBanner image={section.content?.detailsBanner} />

      <div className="mx-auto w-full max-w-[1540px] px-6 pt-8 pb-14 sm:px-10 sm:pt-10 sm:pb-20 lg:px-12 2xl:px-6">
        <Link
          href="/our-doctors"
          className="mb-7 inline-flex min-h-10 items-center gap-2 font-semibold text-[#11798A] underline-offset-4 hover:underline"
        >
          <ArrowLeft size={17} aria-hidden="true" />
          All doctors
        </Link>

        <div className="grid items-start gap-9 lg:grid-cols-[minmax(270px,0.82fr)_minmax(0,1.75fr)] xl:gap-14">
          <DoctorReveal>
            <ProfileSidebar doctor={doctor} name={name} href={href} />
          </DoctorReveal>

          <div className="min-w-0 space-y-9 lg:pt-1">
            {(summary || skills.length > 0) && (
              <DoctorReveal delay={0.06}>
                <section>
                  <h2 className="text-[clamp(1.9rem,3vw,3.1rem)] leading-[1.1] font-bold tracking-[-0.045em]">
                    Professional Summary
                  </h2>

                  {summary && (
                    <p className="mt-5 max-w-[76ch] leading-8 whitespace-pre-line text-[#52616E] sm:text-[17px]">
                      {summary}
                    </p>
                  )}

                  {skills.length > 0 && (
                    <div className="mt-7 grid gap-x-7 gap-y-5 rounded-[20px] border border-[#DCE9E6] bg-[#F8FBFA] p-5 sm:grid-cols-2 sm:p-6">
                      {skills.map((skill) => (
                        <DoctorSkillBar
                          key={skill.id}
                          label={skill.label}
                          percent={skill.percent}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </DoctorReveal>
            )}

            {(specializations || topics.length > 0) && (
              <DoctorReveal delay={0.08}>
                <section>
                  <h2 className="text-[clamp(1.75rem,2.5vw,2.7rem)] leading-tight font-bold tracking-[-0.04em]">
                    Specializations
                  </h2>

                  {specializations && (
                    <p className="mt-4 max-w-[76ch] leading-8 whitespace-pre-line text-[#52616E] sm:text-[17px]">
                      {specializations}
                    </p>
                  )}

                  {topics.length > 0 && (
                    <ul className="mt-5 grid gap-x-6 sm:grid-cols-2">
                      {topics.map((topic, index) => (
                        <li
                          key={`${topic}-${index}`}
                          className="flex items-start gap-2.5 border-b border-[#E4EEEB] py-3 text-[15px] leading-6 text-[#344957]"
                        >
                          <BadgeCheck
                            size={18}
                            aria-hidden="true"
                            className="mt-1 shrink-0 text-[#6556CF]"
                          />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </DoctorReveal>
            )}

            <a
              href="#doctor-appointment"
              aria-label={`Request an appointment with ${name}`}
              className="inline-flex min-h-12 items-center gap-3 rounded-full bg-[#117F91] px-6 py-3 font-bold text-white transition-colors hover:bg-[#105E70]"
            >
              Request an appointment
              <ArrowDownRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <div
        id="doctor-appointment"
        className="scroll-mt-24 lg:scroll-mt-28 2xl:scroll-mt-36"
      >
        <KlinikoAppointment
          data={cms.appointment?.content ?? {}}
          doctors={[{ id: doctor.id, name }]}
        />
      </div>
    </main>
  );
}

export default function DoctorDetailsPage({ params }) {
  return (
    <Suspense
      fallback={
        <p role="status" className="p-8 text-center">
          Loading doctor profile...
        </p>
      }
    >
      <DoctorDetails params={params} />
    </Suspense>
  );
}
