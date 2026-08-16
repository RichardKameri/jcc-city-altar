import { motion } from "framer-motion";

import yearTheme from "@/assets/hero-banner.jpg";
import morningGlory from "@/assets/morning-glory.jpg";
import graceHour from "@/assets/grace-hour.jpg";
import jamTuesday from "@/assets/jam-tuesday.jpg";
import bibleFocus from "@/assets/bible-focus.jpg";
import towdahWorship from "@/assets/towdah-worship.jpg";
import keshaNight from "@/assets/kesha-night.jpg";
import sundayWorkers from "@/assets/sunday-workers.jpg";
import sundayEnglish from "@/assets/sunday-english.jpg";

const services = [
  { day: "2026 Theme", title: "Year of Manifestation", time: "Romans 8:19", image: yearTheme, description: "Our prophetic theme for 2026 — stepping into divine manifestation and breakthrough." },
  { day: "Monday – Friday", title: "Morning Glory", time: "5:00 AM – 7:00 AM", image: morningGlory, description: "Start your day in God's presence with powerful early morning prayers and worship." },
  { day: "Monday – Friday", title: "Grace Hour", time: "12:30 PM – 1:45 PM", image: graceHour, description: "Midday prayer and the Word to refresh your spirit during the day." },
  { day: "Tuesday", title: "JAM Tuesday", time: "5:30 PM – 7:30 PM", image: jamTuesday, description: "Youthful. Spiritual. Engaging. A dynamic youth gathering." },
  { day: "Wednesday", title: "Bible Focus", time: "5:30 PM – 7:30 PM", image: bibleFocus, description: "Deep dive into God's Word with Pastor Lawrence Gachara." },
  { day: "Thursday", title: "Towdah Worship", time: "5:30 PM – 7:30 PM", image: towdahWorship, description: "A powerful evening of praise, worship, and thanksgiving." },
  { day: "Friday", title: "Kesha Night", time: "9:30 PM – 4:00 AM", image: keshaNight, description: "An all-night prayer vigil for spiritual breakthrough and manifestation." },
  { day: "Sunday", title: "Workers Service", time: "6:15 AM – 8:30 AM", image: sundayWorkers, description: "Equipping and empowering church workers for effective service." },
  { day: "Sunday", title: "English Service", time: "9:00 AM – 12:15 PM", image: sundayEnglish, description: "Our main Sunday celebration with praise, worship, and the Word." },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-accent font-body font-semibold tracking-[0.2em] uppercase text-base mb-3">
            Weekly Schedule
          </p>
          <h2 className="font-display text-5xl md:text-6xl font-black">
            Our <span className="text-vibrant-gradient">Services</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-500 flex flex-col hover:glow-blue"
            >
              <div className="w-full h-72 bg-muted/30 flex items-center justify-center overflow-hidden p-3">
                <img
                  src={service.image}
                  alt={service.title}
                  loading="lazy"
                  className="max-w-full max-h-full object-contain group-hover:scale-[1.05] transition-transform duration-700"
                />
              </div>

              <div className="p-5 flex flex-col gap-2">
                <span className="inline-block w-fit bg-blue-purple-gradient text-primary-foreground text-xs font-body font-bold px-3 py-1 rounded-full">
                  {service.day}
                </span>
                <h3 className="font-display text-2xl font-bold">{service.title}</h3>
                <p className="text-accent font-body font-bold text-base">{service.time}</p>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground font-body text-lg">
            📍 <span className="text-foreground font-semibold">KCB Hamburg House, Opp Quickmart Supermarket, Tom Mboya Street</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
