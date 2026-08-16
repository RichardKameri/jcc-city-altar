import { motion } from "framer-motion";
import { Play, Radio } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import LiveStreamModal from "@/components/LiveStreamModal";

import sundayWorkers from "@/assets/sunday-workers.jpg";
import sundayEnglish from "@/assets/sunday-english.jpg";
import morningGlory from "@/assets/morning-glory.jpg";
import graceHour from "@/assets/grace-hour.jpg";
import jamTuesday from "@/assets/Jam-tuesday.jpeg";
import towdahWorship from "@/assets/towdah-worship.jpg";
import keshaNight from "@/assets/kesha-night.jpg";
import heroBanner from "@/assets/hero-banner.jpg";
import heroGroup from "@/assets/hero-group.jpeg";
import heroBg from "@/assets/hero-bg.jpg";
import bibleFocusPoster from "@/assets/Bible-focus.jpeg";
import shabachPoster from "@/assets/shabach-poster.jpg";

const YOUTUBE_LIVE = "https://www.youtube.com/@jesuscelebrationcentrecity3939";
const FACEBOOK_LIVE = "https://www.facebook.com/JCCCityAltar";
 
interface Program {
  title: string;
  time: string;
  day: string;
  image: string;
}

const sunday: Program[] = [
  { title: "Workers Service", time: "6:00 AM – 8:45 AM", day: "Every Sunday", image: sundayWorkers },
  { title: "English Service", time: "9:00 AM – 12:30 PM", day: "Every Sunday", image: sundayEnglish },
];

const weekly: Program[] = [
  { title: "Morning Glory", time: "5:00 AM – 7:00 AM", day: "Mon – Fri", image: morningGlory },
  { title: "Grace Hour", time: "12:15 PM – 1:45 PM", day: "Mon – Fri", image: graceHour },
  { title: "HBC (Home Bible Church)", time: "5:30 PM – 7:30 PM", day: "Monday", image: heroGroup },
  { title: "Jam Tuesday", time: "5:30 PM – 7:30 PM", day: "Tuesday", image: jamTuesday },
  { title: "Bible Focus", time: "5:30 PM – 7:30 PM", day: "Wednesday", image: bibleFocusPoster },
  { title: "Towdah Service", time: "5:30 PM – 7:30 PM", day: "Thursday", image: towdahWorship },
  { title: "Friday Kesha", time: "10:00 PM – 4:00 AM", day: "Friday", image: keshaNight },
];

const monthly: Program[] = [
  { title: "Prayer & Fasting", time: "3 Days", day: "First week of every month", image: heroBg },
  { title: "Shabach Sunday", time: "3:00 PM – 5:30 PM", day: "3rd Sunday", image: shabachPoster },
  { title: "Destiny Life Breakfast", time: "9:00 AM – 12:00 PM", day: "Last Saturday", image: heroBanner },
];

const WatchButtons = () => (
  <div className="flex flex-wrap gap-2.5 mt-4">
    <LiveStreamModal platform="youtube">
      <button
        type="button"
        className="bg-[hsl(0_84%_55%)] hover:bg-[hsl(0_84%_60%)] hover:shadow-[0_0_20px_hsl(0_84%_55%/0.6)] text-primary-foreground font-body font-bold text-sm px-4 py-2.5 rounded-full transition-all"
      >
        🔴 YouTube Live
      </button>
    </LiveStreamModal>
    <LiveStreamModal platform="facebook">
      <button
        type="button"
        className="bg-[hsl(220_85%_55%)] hover:bg-[hsl(220_85%_60%)] hover:shadow-[0_0_20px_hsl(220_85%_55%/0.6)] text-primary-foreground font-body font-bold text-sm px-4 py-2.5 rounded-full transition-all"
      >
        🔵 Facebook Live
      </button>
    </LiveStreamModal>
  </div>
);

const ProgramCard = ({ p, i }: { p: Program; i: number }) => (
  <motion.article
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: i * 0.05 }}
    className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:glow-blue hover:-translate-y-1 transition-all duration-500 flex flex-col shadow-lg"
  >
    <div className="relative w-full aspect-video overflow-hidden bg-muted/30">
      <img
        src={p.image}
        alt={p.title}
        loading="lazy"
        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
      />
      {/* Dark gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent pointer-events-none" />
      <span className="absolute top-3 left-3 bg-blue-purple-gradient text-primary-foreground text-xs font-body font-bold px-3 py-1 rounded-full shadow-lg">
        {p.day}
      </span>
    </div>
    <div className="p-6 flex flex-col flex-1">
      <h3 className="font-display text-2xl font-bold mb-1 text-foreground">{p.title}</h3>
      <p className="text-accent font-body font-bold text-base">{p.time}</p>
      <WatchButtons />
    </div>
  </motion.article>
);

const Block = ({
  eyebrow,
  title,
  highlight,
  subtitle,
  items,
}: {
  eyebrow: string;
  title: string;
  highlight: string;
  subtitle?: string;
  items: Program[];
}) => (
  <div className="mb-20">
    <div className="text-center mb-12">
      <p className="text-accent font-body font-semibold tracking-[0.2em] uppercase text-sm mb-3">{eyebrow}</p>
      <h2 className="font-display text-4xl md:text-5xl font-black">
        {title} <span className="text-vibrant-gradient">{highlight}</span>
      </h2>
      {subtitle && <p className="text-muted-foreground font-body text-lg mt-3">{subtitle}</p>}
    </div>
    <div className={`grid gap-6 ${items.length <= 2 ? "sm:grid-cols-2 max-w-4xl mx-auto justify-items-center" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
      {items.map((p, i) => (
        <ProgramCard key={p.title} p={p} i={i} />
      ))}
    </div>
  </div>
);

const Programs = () => (
  <>
    <PageHeader
      eyebrow="Watch Live"
      title="Our"
      highlight="Programs"
      subtitle="Join us live from anywhere. Stay connected and be blessed."
    />
    <section className="py-16 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/40 to-background" />
      <div className="relative container mx-auto px-6 max-w-7xl">
        <Block eyebrow="Section 1" title="Sunday" highlight="Services" items={sunday} />
        <Block
          eyebrow="Section 2"
          title="Weekly"
          highlight="Services"
          subtitle="Our weekly program runs from Monday to Friday."
          items={weekly}
        />
        <Block eyebrow="Section 3" title="Monthly" highlight="Programs" items={monthly} />

        <p className="text-center font-display text-2xl md:text-3xl font-bold mt-8">
          Join us <span className="text-vibrant-gradient">live</span> from anywhere. Stay connected and be blessed.
        </p>
      </div>
    </section>
  </>
);

export default Programs;
