// app/(site)/layout.js
import Footer from "@/app/Components/KlinikoFooter";
import { NavBar } from "../NavBar";
// Direct DB or cached fetch
import { getNavigationData } from "@/lib/getNavigation";

export default async function SiteLayout({ children }) {
  // Fetched in parallel on the server with cache
  const navData = await getNavigationData();

  return (
    <>
      <NavBar initialData={navData?.menu} />
      <main>{children}</main>
      <Footer initialData={navData?.footer} />
    </>
  );
}
