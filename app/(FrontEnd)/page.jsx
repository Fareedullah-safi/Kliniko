"use client";

import KlinikoHero from "@/app/(FrontEnd)/Home/KlinikoHero";
import KlinikoAbout from "./Home/KlinikoAbout";
import KlinikoDoctors from "./Home/KlinikoDoctors";
import KlinikoServices from "./Home/KlinikoServices";
import KlinikoWhyChoose from "./Home/KlinikoWhyChoose";

export default function Page() {
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   async function loadData() {
  //     const apis = [
  //       "/api/homepage/slides",
  //       "/api/homepage/about-us",
  //       "/api/homepage/articles-section",
  //       "/api/homepage/brand-logos",
  //       "/api/homepage/faq",
  //       "/api/homepage/features",
  //       "/api/homepage/projects",
  //       "/api/homepage/reviews-section",
  //       "/api/homepage/services",
  //       // Add your other 11 actual API paths here
  //     ];

  //     try {
  //       await Promise.allSettled(
  //         apis.map((url) => fetch(url, { cache: "no-store" })),
  //       );
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   loadData();
  // }, []);

  // if (loading) return <Loader />;

  return (
    <main className="overflow-x-hidden">
      <KlinikoHero />
      <KlinikoAbout />
      <KlinikoServices />
      <KlinikoWhyChoose />
      <KlinikoDoctors />
      {/* <SectionTwo /> */}
      {/* <SectionThree /> */}
      {/* <SectionFour /> */}
      {/* <SectionFive /> */}
      {/* <SectionSix /> */}
      {/* <SectionSeven /> */}
      {/* <SectionEight />
      <SectionNine />
      <SectionTen />
      <SectionEleven /> */}
    </main>
  );
}
