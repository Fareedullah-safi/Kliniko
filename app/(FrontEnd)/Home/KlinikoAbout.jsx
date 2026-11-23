import Image from "next/image";
import Link from "next/link";

// STATIC CONTENT — NO API OR DATABASE
const ABOUT = {
  subtitle: "About Kliniko",
  title: "Delivering Trusted Medical Care With Precision",
  buttonText: "Read More",
  buttonHref: "/about",
  experience: "25+",
  experienceText: "Years Of Experience",
  description:
    "Kliniko Provides Advanced Medical Services, Expert Consultation, And Patient-Focused Care Designed To Uphold The Highest Standards In Modern Healthcare.",
};

const IMAGES = {
  doctors:
    "https://html.vecurosoft.com/kliniko/demo/assets/img/about/about-img1-h1.jpg",
  stethoscope:
    "https://html.vecurosoft.com/kliniko/demo/assets/img/about/about-img2-h1.jpg",
};

const TITLE_ICON =
  "https://html.vecurosoft.com/kliniko/demo/assets/img/icons/title-icon.svg";

export default function KlinikoAbout() {
  return (
    <section
      aria-labelledby="about-kliniko-title"
      className="w-full overflow-hidden bg-white py-[52px] sm:py-[65px] lg:py-[75px] xl:py-[52px]"
    >
      {/* SAME WIDTH AND PADDING AS HERO */}
      <div className="mx-auto w-full max-w-[1540px] px-6 sm:px-10 lg:px-12 2xl:px-6">
        {/* MAIN TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 items-stretch gap-12 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] xl:gap-[clamp(35px,4.5vw,80px)]">
          {/* LEFT COLUMN */}
          <div className="flex min-w-0 flex-col">
            {/* SUBTITLE */}
            <div className="flex items-center gap-[18px]">
              <Image
                src={TITLE_ICON}
                alt=""
                width={32}
                height={32}
                unoptimized
                className="h-[30px] w-[30px] object-contain"
              />

              <span className="text-[21px] leading-tight font-semibold text-[#101e50] sm:text-[24px]">
                {ABOUT.subtitle}
              </span>
            </div>

            {/* HEADING */}
            <h2
              id="about-kliniko-title"
              className="mt-[34px] max-w-[850px] text-[clamp(36px,3.6vw,64px)] leading-[1.27] font-bold tracking-[-0.025em] text-[#111e50]"
            >
              {ABOUT.title}
            </h2>

            {/* READ MORE BUTTON */}
            <div className="mt-[56px] sm:mt-[60px]">
              <Link
                href={ABOUT.buttonHref}
                className="inline-flex h-[64px] min-w-[190px] items-center justify-center rounded-full bg-[#159db2] px-9 text-[17px] font-semibold text-white transition-colors duration-200 hover:bg-[#0d8298] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#159db2] sm:h-[78px] sm:min-w-[270px] sm:text-[22px]"
              >
                {ABOUT.buttonText}
              </Link>
            </div>

            {/* BOTTOM IMAGES */}
            <div className="mt-[55px] grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-end gap-3 sm:gap-6 xl:mt-auto xl:gap-[32px]">
              {/* EXPERIENCE CARD */}
              <div className="flex aspect-[0.965] min-w-0 flex-col items-center justify-center rounded-[20px] bg-[#111e50] px-2 py-5 text-center text-white sm:px-4">
                <span className="bg-gradient-to-r from-[#6254ec] via-[#377bdb] to-[#0fb1b8] bg-clip-text text-[clamp(39px,5.2vw,94px)] leading-none font-bold tracking-[-0.045em] text-transparent">
                  {ABOUT.experience}
                </span>

                <span className="mt-5 max-w-[190px] text-[clamp(12px,1.6vw,27px)] leading-[1.35] font-bold sm:mt-6">
                  {ABOUT.experienceText}
                </span>
              </div>

              {/* DOCTORS IMAGE */}
              <div className="relative aspect-[1.57] min-w-0 overflow-hidden rounded-[23px] bg-[#eef5f7]">
                <Image
                  src={IMAGES.doctors}
                  alt="Professional medical team at Kliniko"
                  fill
                  unoptimized
                  sizes="(max-width: 639px) 58vw, (max-width: 1279px) 62vw, 540px"
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex min-w-0 flex-col">
            {/* STETHOSCOPE IMAGE */}
            <div className="relative aspect-[1.12] w-full overflow-hidden rounded-[28px] bg-[#e5f1f5]">
              <Image
                src={IMAGES.stethoscope}
                alt="Stethoscope and medical documents representing trusted healthcare"
                fill
                unoptimized
                sizes="(max-width: 1279px) 100vw, (max-width: 1535px) 40vw, 620px"
                className="object-cover object-center"
              />
            </div>

            {/* DESCRIPTION */}
            <p className="mt-[39px] text-[17px] leading-[1.75] font-normal text-[#7c7c7c] sm:text-[19px] xl:text-[20px] 2xl:text-[21px]">
              {ABOUT.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
