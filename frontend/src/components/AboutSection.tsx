import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Church, Heart, Phone, Users } from "lucide-react";
import theme2026 from "@/assets/theme-2026.jpg";
import FeedbackSection from "./FeedbackSection";

const stats = [
  { value: "5+", label: "Years of Ministry" },
  { value: "400+", label: "Members" },
  { value: "12+", label: "Programs" },
];
 
const AboutSection = () => {
  return (
    <section id="about" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card to-background" />
      <div className="relative container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-accent font-body font-semibold tracking-[0.2em] uppercase text-base mb-3">About Us</p>
          <h2 className="font-display text-5xl md:text-6xl font-black mb-8">
            <span className="text-vibrant-gradient">JCC City Altar</span>
          </h2>
          <p className="text-muted-foreground font-body text-xl max-w-3xl mx-auto leading-relaxed mb-5">
            JCC City Altar is a vibrant community of believers dedicated to spreading the love of Christ and making disciples.
          </p>
          <p className="text-muted-foreground font-body text-xl max-w-3xl mx-auto leading-relaxed mb-5">
            As a ministry of Jesus Celebration Center, we are committed to creating an environment where people can encounter God's presence, grow in their faith, and discover their purpose.
          </p>
          <p className="text-muted-foreground font-body text-xl max-w-3xl mx-auto leading-relaxed">
            Our mission is to be a beacon of hope in the city, bringing transformation through worship, biblical teaching, and genuine fellowship. We believe in the power of community and the importance of walking together in faith.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-16">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <p className="font-display text-5xl md:text-6xl font-black text-vibrant-gradient mb-2">{stat.value}</p>
              <p className="text-muted-foreground font-body text-base">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Church, title: "Worship", desc: "Spirit-filled worship experiences that draw you closer to God's presence" },
            { icon: Heart, title: "Fellowship", desc: "A warm community where every soul is valued and loved unconditionally" },
            { icon: Users, title: "Discipleship", desc: "Growing together through the study of God's Word and practical Christian living" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-card border border-border rounded-2xl p-8 text-center hover:border-primary/50 transition-all duration-500 group hover:glow-blue"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-purple-gradient flex items-center justify-center group-hover:scale-110 transition-transform">
                <item.icon size={28} className="text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">{item.title}</h3>
              <p className="text-muted-foreground font-body text-lg leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
{/* 
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 rounded-2xl border border-primary/30 bg-card p-8 md:p-12"
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-accent font-body font-semibold tracking-[0.2em] uppercase text-sm mb-3">
              New to the faith or our church?
            </p>
            <h3 className="font-display text-3xl md:text-4xl font-black mb-4">
              Your Next Steps
            </h3>
            <p className="text-muted-foreground font-body text-lg leading-relaxed">
              We would love to walk with you as you grow in faith and find community.
            </p>
          </div>

          <ol className="mx-auto mt-8 max-w-3xl space-y-4">
            {[
              <>
                Join <Link to="/contact" className="font-semibold text-primary underline-offset-4 hover:underline">SOS</Link>, a class for new believers and members who have recently joined, with teaching to help you grow in faith.
              </>,
              <>Begin to pray daily.</>,
              <>Begin to study the Bible daily.</>,
              <>
                Join a <Link to="/ministries/discipleship" className="font-semibold text-primary underline-offset-4 hover:underline">GCC</Link> for home fellowship and discipleship.
              </>,
              <>
                Join a <Link to="/services" className="font-semibold text-primary underline-offset-4 hover:underline">church worship service</Link>.
              </>,
            ].map((step, index) => (
              <li key={index} className="flex items-start gap-4 rounded-xl border border-border bg-background/60 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-purple-gradient font-display font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <span className="pt-1 font-body text-base leading-relaxed text-foreground/90">{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-8 text-center">
            <a
              href="tel:0712316316"
              className="inline-flex items-center gap-2 rounded-full bg-vibrant-gradient px-7 py-3 font-body font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Phone size={18} aria-hidden="true" />
              Contact us about salvation: 0712316316
            </a>
          </div>
        </motion.div> */}

        {/* Theme */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center bg-card border border-primary/30 rounded-2xl overflow-hidden glow-purple"
        >
          <div className="relative w-full overflow-hidden bg-black">
            <img
              src={theme2026}
              alt="2026 — The Year of Manifestation. Manifesting the Sons of God. Romans 8:19"
              loading="lazy"
              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="p-10">
            <p className="text-accent font-body font-semibold text-lg mb-2">2026 Theme</p>
            <h3 className="font-display text-4xl md:text-5xl font-black text-vibrant-gradient mb-4">
              The Year of Manifestation
            </h3>
            <p className="text-foreground/80 font-body text-xl italic">
              "For the earnest expectation of the creature waiteth for the manifestation of the sons of God."
            </p>
            <p className="text-accent font-body font-bold mt-2 text-lg">— Romans 8:19 KJV</p>
          </div>
        </motion.div>
        <FeedbackSection />
      </div>
    </section>
  );
};

export default AboutSection;
