import { motion } from "framer-motion";
import { Calendar, MapPin, Clock } from "lucide-react";

const events = [
  {
    title: "Sunday Celebration Service",
    date: "Every Sunday",
    time: "9:00 AM – 12:15 PM",
    location: "KCB Hamburg House, Tom Mboya St",
    description: "Join us for a powerful time of worship, praise, and the Word of God.",
    featured: true,
  },
  {
    title: "JAM Tuesday Youth Night",
    date: "Every Tuesday",
    time: "5:30 PM – 7:30 PM",
    location: "KCB Hamburg House, Tom Mboya St",
    description: "A vibrant, youth-focused gathering with music, worship, and the Word.",
    featured: false,
  },
  {
    title: "Kesha Night – All Night Prayer",
    date: "Every Friday",
    time: "9:30 PM – 4:00 AM",
    location: "KCB Hamburg House, Tom Mboya St",
    description: "Intense overnight prayers for breakthroughs and spiritual renewal.",
    featured: false,
  },
];

const EventsSection = () => {
  return (
    <section id="events" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />
      <div className="relative container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary font-body font-medium tracking-[0.2em] uppercase text-sm mb-3">
            Upcoming
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            <span className="text-gold-gradient">Events</span> & Programs
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {events.map((event, i) => (
            <motion.div
              key={event.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`rounded-2xl p-8 border transition-all duration-500 hover:scale-[1.02] ${
                event.featured
                  ? "bg-gradient-to-br from-gold-dark/20 to-card border-primary/40 glow-gold"
                  : "bg-card border-border hover:border-primary/30"
              }`}
            >
              {event.featured && (
                <span className="inline-block bg-gold-gradient text-primary-foreground text-xs font-body font-bold px-3 py-1 rounded-full mb-4">
                  Featured
                </span>
              )}
              <h3 className="font-display text-2xl font-bold mb-4">{event.title}</h3>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 text-muted-foreground font-body text-sm">
                  <Calendar size={16} className="text-primary" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground font-body text-sm">
                  <Clock size={16} className="text-primary" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground font-body text-sm">
                  <MapPin size={16} className="text-primary" />
                  <span>{event.location}</span>
                </div>
              </div>
              <p className="text-foreground/60 font-body text-sm leading-relaxed">{event.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
