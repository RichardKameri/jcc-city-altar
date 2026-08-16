import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import { ministryDetails, discipleshipGroups } from "@/data/leadership";

const Field = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="font-body text-xs uppercase tracking-[0.2em] text-accent mb-1">{label}</p>
      <p className="font-display text-lg font-bold">{value}</p>
    </div>
  );
}; 

const MinistryDetail = () => {
  const { slug } = useParams();
  const ministry = slug ? ministryDetails[slug] : undefined;

  if (!ministry) return <Navigate to="/ministries" replace />;

  return (
    <>
      <PageHeader
        eyebrow={ministry.tagline}
        title={ministry.title.split(" ")[0]}
        highlight={ministry.title.split(" ").slice(1).join(" ")}
        subtitle={ministry.description}
      />
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-card/40 to-background" />
        <div className="relative container mx-auto px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12"
          >
            <Field label="Pastor" value={ministry.pastor} />
            <Field label="Deacon" value={ministry.deacon} />
            <Field label="Leader" value={ministry.leader} />
            <Field label="Assistant" value={ministry.assistant} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="font-display text-3xl font-black mb-6">Departments</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ministry.departments.map((d) => (
                <div
                  key={d.name}
                  className="bg-card border border-border rounded-xl p-5 hover:border-secondary/60 hover:glow-purple transition-all"
                >
                  <h3 className="font-display text-lg font-bold text-foreground mb-3">{d.name}</h3>
                  <div className="space-y-1.5 font-body text-sm">
                    {d.pastor && (
                      <p><span className="text-accent font-semibold">Pastor:</span> <span className="text-muted-foreground">{d.pastor}</span></p>
                    )}
                    {d.deacon && (
                      <p><span className="text-accent font-semibold">Deacon:</span> <span className="text-muted-foreground">{d.deacon}</span></p>
                    )}
                    {d.leader && (
                      <p><span className="text-accent font-semibold">Leader:</span> <span className="text-muted-foreground">{d.leader}</span></p>
                    )}
                    {d.assistant && (
                      <p><span className="text-accent font-semibold">Assistant:</span> <span className="text-muted-foreground">{d.assistant}</span></p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {ministry.slug === "discipleship" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl font-black mb-6">Discipleship Groups</h2>
              <div className="overflow-x-auto bg-card border border-border rounded-2xl">
                <table className="w-full">
                  <thead>
                    <tr className="bg-vibrant-gradient text-primary-foreground">
                      <th className="text-left font-body font-bold uppercase text-xs tracking-wider px-5 py-4">#</th>
                      <th className="text-left font-body font-bold uppercase text-xs tracking-wider px-5 py-4">Leader</th>
                      <th className="text-left font-body font-bold uppercase text-xs tracking-wider px-5 py-4">Assistant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discipleshipGroups.map((g) => (
                      <tr key={g.no} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3 font-display font-bold text-accent">{g.no}</td>
                        <td className="px-5 py-3 font-body text-foreground">{g.leader}</td>
                        <td className="px-5 py-3 font-body text-muted-foreground">{g.asst}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          <div className="text-center mt-16">
            <Link
              to="/contact"
              className="inline-block bg-vibrant-gradient text-primary-foreground font-body font-bold uppercase tracking-wide px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity"
            >
              Join Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default MinistryDetail;
