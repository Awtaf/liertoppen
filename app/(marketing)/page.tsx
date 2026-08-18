import { Hero } from "@/components/Hero";
import { QuoteCTA } from "@/components/QuoteCTA";
import { Introduction } from "@/components/Introduction";
import { Stats } from "@/components/Stats";
import { About } from "@/components/About";
import { Services } from "@/components/Services";
import { Fleet } from "@/components/Fleet";
import { Partners } from "@/components/Partners";
import { Collaboration } from "@/components/Collaboration";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { CoverageArea } from "@/components/CoverageArea";
import { ContactSection } from "@/components/ContactSection";

export default function Home() {
  return (
    <>
      <Hero />
      <QuoteCTA />
      <Introduction />
      <Stats />
      <About />
      <Services />
      <Fleet />
      <Partners />
      <Collaboration />
      <WhyChooseUs />
      <CoverageArea />
      <ContactSection />
    </>
  );
}
