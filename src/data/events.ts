import shabachImg from "@/assets/event-shabach-sunday.jpg";
import prayerFastingImg from "@/assets/event-prayer-fasting.jpg";
import revivalWeekImg from "@/assets/event-revival-week.jpg";
import mothersDayImg from "@/assets/event-mothers-day.jpg";

export type EventCategory = "Prayer" | "Revival" | "Youth" | "Service" | "Seminar" | "Special";

export interface ChurchEvent {
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  category: EventCategory;
  description?: string;
  hasLiveStream?: boolean;
  image?: string;
  youtubeUrl?: string;
  facebookUrl?: string;
}

const imageFor = (title: string): string | undefined => {
  const t = title.toLowerCase();
  if (t.includes("shabach")) return shabachImg;
  if (t.includes("prayer") && t.includes("fasting")) return prayerFastingImg;
  if (t.includes("revival")) return revivalWeekImg;
  if (t.includes("mother")) return mothersDayImg;
  return undefined;
};

export const events: ChurchEvent[] = ([
  // JANUARY
  { title: "Leader's Meeting", startDate: "2026-01-03", category: "Seminar" },
  { title: "Joint Service", startDate: "2026-01-04", category: "Service", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },
  { title: "Prayer & Fasting", startDate: "2026-01-05", endDate: "2026-01-10", category: "Prayer" },
  { title: "Shabach Sunday", startDate: "2026-01-18", category: "Special", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },
  { title: "Revival – Apst Nick Musembi", startDate: "2026-01-20", endDate: "2026-01-23", category: "Revival", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },
  { title: "Youth Leader Retreat", startDate: "2026-01-30", endDate: "2026-01-31", category: "Youth" },

  // FEBRUARY
  { title: "Kingdom Invest + Youth Crusade", startDate: "2026-02-01", category: "Youth", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },
  { title: "Prayer & Fasting", startDate: "2026-02-02", endDate: "2026-02-04", category: "Prayer" },
  { title: "Youth Worship Night", startDate: "2026-02-07", category: "Youth", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },
  { title: "Project Giving", startDate: "2026-02-08", category: "Service" },
  { title: "Shabach Sunday", startDate: "2026-02-15", category: "Special", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },
  { title: "Revival – Bsp Mark Kegohi", startDate: "2026-02-25", endDate: "2026-02-29", category: "Revival", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },

  // MARCH
  { title: "Kingdom Invest + Youth", startDate: "2026-03-05", category: "Youth" },
  { title: "Prayer & Fasting", startDate: "2026-03-06", endDate: "2026-03-08", category: "Prayer" },
  { title: "Project Giving", startDate: "2026-03-12", category: "Service" },
  { title: "Youth Street Praise", startDate: "2026-03-18", category: "Youth", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },
  { title: "Joint Service", startDate: "2026-03-19", category: "Service", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },
  { title: "Parenting Workshop", startDate: "2026-03-25", category: "Seminar" },
  { title: "Ladies Special Sunday", startDate: "2026-03-26", category: "Special", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },

  // APRIL
  { title: "Prayer & Fasting", startDate: "2026-04-02", endDate: "2026-04-04", category: "Prayer" },
  { title: "Easter Joint Service", startDate: "2026-04-05", category: "Service", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },
  { title: "Shabach Sunday", startDate: "2026-04-19", category: "Special", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },
  { title: "Revival Week", startDate: "2026-04-22", endDate: "2026-04-26", category: "Revival", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },

  // MAY
  { title: "Prayer & Fasting", startDate: "2026-05-04", endDate: "2026-05-06", category: "Prayer" },
  { title: "Youth Conference", startDate: "2026-05-15", endDate: "2026-05-17", category: "Youth", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },
  { title: "Shabach Sunday", startDate: "2026-05-17", category: "Special", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },
  { title: "Mother's Day Service", startDate: "2026-05-10", category: "Special", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },

  // JUNE
  { title: "Prayer & Fasting", startDate: "2026-06-01", endDate: "2026-06-03", category: "Prayer" },
  { title: "Men's Conference", startDate: "2026-06-12", endDate: "2026-06-14", category: "Seminar" },
  { title: "Shabach Sunday", startDate: "2026-06-21", category: "Special", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },
  { title: "Father's Day Service", startDate: "2026-06-21", category: "Special", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },

  // JULY
  { title: "Prayer & Fasting", startDate: "2026-07-06", endDate: "2026-07-08", category: "Prayer" },
  { title: "Youth Crusade", startDate: "2026-07-17", endDate: "2026-07-19", category: "Youth", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },
  { title: "Shabach Sunday", startDate: "2026-07-19", category: "Special", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },
  { title: "Joint Service", startDate: "2026-07-26", category: "Service", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },

  // AUGUST
  { title: "Prayer & Fasting", startDate: "2026-08-03", endDate: "2026-08-05", category: "Prayer" },
  { title: "Revival – Guest Speaker", startDate: "2026-08-12", endDate: "2026-08-16", category: "Revival", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },
  { title: "Shabach Sunday", startDate: "2026-08-16", category: "Special", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },
  { title: "Family Sunday", startDate: "2026-08-30", category: "Service", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },

  // SEPTEMBER
  { title: "Prayer & Fasting", startDate: "2026-09-07", endDate: "2026-09-09", category: "Prayer" },
  { title: "Marriage Seminar", startDate: "2026-09-19", category: "Seminar" },
  { title: "Shabach Sunday", startDate: "2026-09-20", category: "Special", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },
  { title: "Youth Worship Night", startDate: "2026-09-25", category: "Youth", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },

  // OCTOBER
  { title: "Prayer & Fasting", startDate: "2026-10-05", endDate: "2026-10-07", category: "Prayer" },
  { title: "Joint Service", startDate: "2026-10-11", category: "Service", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },
  { title: "Shabach Sunday", startDate: "2026-10-18", category: "Special", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },
  { title: "Revival Week", startDate: "2026-10-21", endDate: "2026-10-25", category: "Revival", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },

  // NOVEMBER
  { title: "Prayer & Fasting", startDate: "2026-11-02", endDate: "2026-11-04", category: "Prayer" },
  { title: "Thanksgiving Service", startDate: "2026-11-15", category: "Special", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },
  { title: "Shabach Sunday", startDate: "2026-11-15", category: "Special", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },
  { title: "Youth Convention", startDate: "2026-11-27", endDate: "2026-11-29", category: "Youth", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },

  // DECEMBER
  { title: "Prayer & Fasting", startDate: "2026-12-07", endDate: "2026-12-09", category: "Prayer" },
  { title: "Christmas Carols Night", startDate: "2026-12-20", category: "Special", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },
  { title: "Christmas Service", startDate: "2026-12-25", category: "Service", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },
  { title: "End of Year Crossover", startDate: "2026-12-31", category: "Special", hasLiveStream: true,  youtubeUrl: "https://www.youtube.com/@jesuscelebrationcentrecity3939", facebookUrl: "https://www.facebook.com/JCCCityAltar" },
] as ChurchEvent[]).map((e) => ({ ...e, image: e.image ?? imageFor(e.title) }));

export const categoryStyles: Record<EventCategory, { badge: string; accent: string }> = {
  Prayer: { badge: "bg-red-500/20 text-red-400 border-red-500/40", accent: "border-l-red-500" },
  Service: { badge: "bg-blue-500/20 text-blue-400 border-blue-500/40", accent: "border-l-blue-500" },
  Youth: { badge: "bg-green-500/20 text-green-400 border-green-500/40", accent: "border-l-green-500" },
  Revival: { badge: "bg-purple-500/20 text-purple-400 border-purple-500/40", accent: "border-l-purple-500" },
  Seminar: { badge: "bg-orange-500/20 text-orange-400 border-orange-500/40", accent: "border-l-orange-500" },
  Special: { badge: "bg-primary/20 text-primary border-primary/40", accent: "border-l-primary" },
};
