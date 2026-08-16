  import { useEffect, useMemo, useState } from "react";
  import { motion } from "framer-motion";
  import { Calendar, Clock, Play, Radio, Sparkles } from "lucide-react";
  import PageHeader from "@/components/PageHeader";
  import { Badge } from "@/components/ui/badge";
  import { events, categoryStyles, type ChurchEvent } from "@/data/events";

  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const formatDate = (e: ChurchEvent) => {
    const start = new Date(e.startDate);
    const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    if (e.endDate) {
      const end = new Date(e.endDate);
      return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", opts)}`;
    }
    return start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const eventEnd = (e: ChurchEvent) => new Date(e.endDate ?? e.startDate);
  const eventStart = (e: ChurchEvent) => new Date(e.startDate);

  const useCountdown = (target: Date | null) => {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
      const id = setInterval(() => setNow(new Date()), 1000);
      return () => clearInterval(id);
    }, []);
    if (!target) return null;
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return null;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { days, hours, minutes, seconds };
  };

  const EventCard = ({ event, featured = false }: { event: ChurchEvent; featured?: boolean }) => {
    const styles = categoryStyles[event.category];
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -4 }}
        className={`group relative bg-card rounded-2xl overflow-hidden border-l-4 ${styles.accent} border-y border-r border-border hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/10 ${
          featured ? "ring-2 ring-primary/40 glow-gold" : ""
        }`}
      >
        {event.image && (
          <div className="relative w-full aspect-video overflow-hidden bg-muted/30">
            <img
              src={event.image}
              alt={event.title}
              loading="lazy"
              width={1280}
              height={720}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent pointer-events-none" />
          </div>
        )}
        <div className="p-6">
          {featured && (
            <div className="absolute -top-3 left-6 bg-vibrant-gradient text-primary-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 z-10">
              <Sparkles size={12} /> Next Up
            </div>
          )}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-display text-xl font-bold leading-tight">{event.title}</h3>
            <Badge variant="outline" className={`${styles.badge} shrink-0 font-body`}>
              {event.category}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground font-body text-sm mb-4">
            <Calendar size={14} className="text-primary" />
            <span>{formatDate(event)}</span>
          </div>
          {event.hasLiveStream && (
    <div className="flex gap-2 pt-3 border-t border-border">

      {event.youtubeUrl && (
        <a
          href={event.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs font-body font-semibold transition-colors"
        >
          <Play size={14} fill="currentColor" />
          YouTube
        </a>
      )}

      {event.facebookUrl && (
        <a
          href={event.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-2 rounded-lg text-xs font-body font-semibold transition-colors"
        >
          <Radio size={14} />
          Facebook
        </a>
      )}

    </div>
  )}
        </div>
      </motion.div>
    );
  };

  const Events = () => {
    const today = useMemo(() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    }, []);

    const { thisWeek, upcoming, past, byMonth, nextEvent } = useMemo(() => {
      const sorted = [...events].sort((a, b) => eventStart(a).getTime() - eventStart(b).getTime());

      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const thisWeek = sorted.filter((e) => {
        const s = eventStart(e);
        const en = eventEnd(e);
        return en >= startOfWeek && s <= endOfWeek;
      });

      const upcomingAll = sorted.filter((e) => eventEnd(e) >= today);
      const past = sorted.filter((e) => eventEnd(e) < today);
      const upcoming = upcomingAll.slice(0, 8);
      const nextEvent = upcomingAll[0] ?? null;

      const byMonth: Record<number, ChurchEvent[]> = {};
      sorted.forEach((e) => {
        const m = eventStart(e).getMonth();
        (byMonth[m] ??= []).push(e);
      });

      return { thisWeek, upcoming, past, byMonth, nextEvent };
    }, [today]);

    const countdown = useCountdown(
      nextEvent && ["Revival", "Special", "Youth"].includes(nextEvent.category)
        ? eventStart(nextEvent)
        : null
    );

    return (
      <div>
        <PageHeader
          eyebrow="Stay Connected"
          title="Church"
          highlight="Events"
          subtitle="Discover what's happening at JCC City Altar this year — services, revivals, prayer weeks and more."
        />

        <section className="container mx-auto px-6 py-12 space-y-20">
          {/* Countdown */}
          {countdown && nextEvent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-card via-card to-primary/10 border border-primary/30 rounded-3xl p-8 md:p-10 text-center glow-gold"
            >
              <p className="text-primary font-body font-semibold tracking-[0.3em] uppercase text-xs mb-3">
                Counting down to
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-black mb-6">{nextEvent.title}</h2>
              <div className="flex justify-center gap-3 md:gap-6">
                {[
                  { label: "Days", value: countdown.days },
                  { label: "Hours", value: countdown.hours },
                  { label: "Minutes", value: countdown.minutes },
                  { label: "Seconds", value: countdown.seconds },
                ].map((u) => (
                  <div key={u.label} className="bg-background/60 backdrop-blur rounded-xl px-4 py-3 md:px-6 md:py-4 min-w-[70px] md:min-w-[90px]">
                    <div className="font-display text-3xl md:text-5xl font-black text-vibrant-gradient">
                      {String(u.value).padStart(2, "0")}
                    </div>
                    <div className="text-xs font-body text-muted-foreground uppercase tracking-wider mt-1">
                      {u.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* This Week */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Clock className="text-primary" />
              <h2 className="font-display text-3xl md:text-4xl font-black">This Week</h2>
            </div>
            {thisWeek.length === 0 ? (
              <p className="text-muted-foreground font-body">No events scheduled this week. Check upcoming events below.</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {thisWeek.map((e) => (
                  <EventCard key={`${e.title}-${e.startDate}`} event={e} featured={e === nextEvent} />
                ))}
              </div>
            )}
          </div>

          {/* Upcoming */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="text-primary" />
              <h2 className="font-display text-3xl md:text-4xl font-black">Upcoming Events</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map((e, i) => (
                <EventCard
                  key={`${e.title}-${e.startDate}`}
                  event={e}
                  featured={i === 0 && e === nextEvent && thisWeek.length === 0}
                />
              ))}
            </div>
          </div>

          {/* Full Calendar */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="text-primary" />
              <h2 className="font-display text-3xl md:text-4xl font-black">2026 Full Calendar</h2>
            </div>
            <div className="space-y-10">
              {MONTHS.map((m, idx) => {
                const monthEvents = byMonth[idx];
                if (!monthEvents?.length) return null;
                return (
                  <div key={m}>
                    <h3 className="font-display text-2xl font-bold mb-4 text-vibrant-gradient inline-block">
                      {m} 2026
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {monthEvents.map((e) => (
                        <EventCard key={`${e.title}-${e.startDate}`} event={e} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Past Events */}
          {past.length > 0 && (
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-6 text-muted-foreground">
                Past Events
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 opacity-60">
                {past.slice(-8).reverse().map((e) => {
                  const styles = categoryStyles[e.category];
                  return (
                    <div
                      key={`${e.title}-${e.startDate}`}
                      className={`bg-card rounded-xl p-4 border-l-4 ${styles.accent} border-y border-r border-border`}
                    >
                      <div className="font-body font-semibold text-sm mb-1">{e.title}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(e)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    );
  };

  export default Events;
