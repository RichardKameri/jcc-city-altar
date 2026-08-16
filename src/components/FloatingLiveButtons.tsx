const FloatingLiveButtons = () => (
  <div className="fixed bottom-6 right-6 z-40 flex gap-2.5">
    <a
      href="https://www.youtube.com/@jesuscelebrationcentrecity3939"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Watch YouTube Live"
      className="px-4 py-2.5 rounded-full bg-[hsl(0_84%_55%)] text-primary-foreground font-body font-bold text-sm shadow-lg hover:scale-105 hover:shadow-[0_0_25px_hsl(0_84%_55%/0.7)] transition-all animate-pulse-glow"
    >
      🔴 YouTube Live
    </a>

    <a
      href="https://www.facebook.com/JCCCityAltar"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Watch Facebook Live"
      className="px-4 py-2.5 rounded-full bg-[hsl(220_85%_55%)] text-primary-foreground font-body font-bold text-sm shadow-lg hover:scale-105 hover:shadow-[0_0_25px_hsl(220_85%_55%/0.7)] transition-all"
    >
      🔵 Facebook Live
    </a>
  </div>
);

export default FloatingLiveButtons;