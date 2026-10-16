import { motion } from "framer-motion";
import { Crown, Shield, Sparkles, MapPin } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { pastoralTeam, deaconry, newTeam, regionalOverseers } from "@/data/leadership";

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Crown;
  title: string;
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="mb-16"
  >
    <div className="flex items-center gap-3 mb-8">
      <div className="w-12 h-12 rounded-full bg-blue-purple-gradient flex items-center justify-center">
        <Icon size={22} className="text-primary-foreground" />
      </div>
      <h2 className="font-display text-3xl md:text-4xl font-black">{title}</h2>
    </div>
    {children}
  </motion.div>
);

const PersonCard = ({ name, role, highlight }: { name: string; role?: string; highlight?: boolean }) => (
  <div
    className={`bg-card border rounded-xl p-5 transition-all hover:border-secondary/60 hover:glow-purple ${
      highlight ? "border-accent/60 ring-1 ring-accent/30" : "border-border"
    }`}
  >
    <p className="font-display text-lg font-bold text-foreground">{name}</p>
    {role && <p className="font-body text-sm text-accent mt-1">{role}</p>}
  </div>
);

const Leadership = () => (
  <>
    <PageHeader
      eyebrow="Leaders 2026"
      title="Our"
      highlight="Leadership"
      subtitle="Meet the shepherds and servants God has placed over JCC City Altar."
    />
    <section className="py-16 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/40 to-background" />
      <div className="relative container mx-auto px-6 max-w-6xl">
        <Section icon={Crown} title="Pastoral Team">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pastoralTeam.map((p, i) => (
              <PersonCard key={p.name} {...p} highlight={i === 0} />
            ))}
          </div>
        </Section>

        <Section icon={Shield} title="Deaconry">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {deaconry.map((d, i) => (
              <PersonCard key={d.name} {...d} highlight={i === 0} />
            ))}
          </div>
        </Section>

        <Section icon={Sparkles} title="New Team">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {newTeam.map((n) => (
              <PersonCard key={n} name={n} />
            ))}
          </div>
        </Section>

        <Section icon={MapPin} title="Regional Overseers">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {regionalOverseers.map((r) => (
              <PersonCard key={r.region} name={r.region} role={r.leaders} />
            ))}
          </div>
        </Section>
      </div>
    </section>
  </>
);

export default Leadership;
