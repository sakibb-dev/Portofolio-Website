import { getContent } from "@/lib/content";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { Services } from "@/components/site/Services";
import { Journey } from "@/components/site/Journey";
import { Projects } from "@/components/site/Projects";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";

export default async function Home() {
  const c = await getContent();
  return (
    <>
      <Nav settings={c.settings} sections={c.sections} />
      <main id="konten">
        <Hero hero={c.hero} />
        <Marquee items={c.stack} />
        <Services section={c.sections.about} items={c.services} />
        <Journey section={c.sections.journey} steps={c.journey} />
        <Projects section={c.sections.projects} projects={c.projects} />
        <Contact section={c.sections.contact} />
      </main>
      <Footer settings={c.settings} socials={c.socials} />
      <Reveal />
    </>
  );
}
