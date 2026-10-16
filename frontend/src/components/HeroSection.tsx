import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import heroGroup from "@/assets/hero-group.jpeg";
import heroAltar from "@/assets/hero-altar.jpg";

// Third image is PRIMARY — appears more frequently and stays longer
const slides = [
  { src: heroBanner, alt: "2026 Year of Manifestation", duration: 5000 },
  { src: heroGroup, alt: "JCC City Altar Community", duration: 5000 },
  { src: heroAltar, alt: "JCC City Altar Sanctuary", duration: 8000, primary: true },
];

// Weighted rotation: after first cycle, primary (index 2) appears more often
// Sequence: 0 → 1 → 2 → 2 → 0 → 2 → 1 → 2 → repeat
const rotationSequence = [0, 1, 2, 2, 0, 2, 1, 2];

const HeroSection = () => {
  const [step, setStep] = useState(0);
  const current = rotationSequence[step % rotationSequence.length];
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<NodeJS.Timeout>();

  const goTo = useCallback((newStep: number, dir: number) => {
    setDirection(dir);
    setStep(newStep);
  }, []);

  const next = useCallback(() => goTo(step + 1, 1), [step, goTo]);
  const prev = useCallback(() => goTo(step - 1, -1), [step, goTo]);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setDirection(1);
      setStep((s) => s + 1);
    }, slides[current].duration);
    return () => clearTimeout(timerRef.current);
  }, [step, current]);

  // Touch swipe support
  const touchStartX = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) (diff > 0 ? prev : next)();
  };

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60, scale: 1.1 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60, filter: "blur(8px)" }),
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <motion.img
            src={slides[current].src}
            alt={slides[current].alt}
            className="w-full h-full object-cover"
            animate={{ scale: [1, 1.12] }}
            transition={{ duration: slides[current].duration / 1000, ease: "linear" }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />

      {/* Light sweep */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
      />

      {/* Arrows */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-background/40 backdrop-blur-md border border-foreground/20 text-foreground hover:bg-primary hover:border-primary transition-all"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full bg-background/40 backdrop-blur-md border border-foreground/20 text-foreground hover:bg-primary hover:border-primary transition-all"
      >
        <ChevronRight size={24} />
      </button>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-accent font-body font-semibold tracking-[0.3em] uppercase text-base md:text-lg mb-4"
        >
          Welcome to JCC City Altar
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight drop-shadow-2xl"
        >
          The Year of{" "}
          <span className="text-vibrant-gradient">Manifestation</span>
          <span className="block text-foreground/95">& The Word</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-foreground/80 font-body text-xl md:text-2xl max-w-2xl mx-auto mb-4 leading-relaxed font-light"
        >
          Experience the transforming power of worship, fellowship, and God's word.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-accent/90 font-body text-lg md:text-xl font-semibold tracking-widest mb-10"
        >
          Word · Worship · Prayer · Wonder
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/programs"
            className="bg-vibrant-gradient text-primary-foreground px-12 py-4 rounded-full font-body font-bold text-xl hover:opacity-90 transition-all glow-blue"
          >
            Our Programs
          </Link>
          <Link
            to="/give"
            className="border-2 border-accent text-accent px-12 py-4 rounded-full font-body font-bold text-xl hover:bg-accent hover:text-accent-foreground transition-all"
          >
            Give
          </Link>
        </motion.div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        {slides.map((s, i) => (
          <button
            key={i}
            onClick={() => {
              const nextIdx = rotationSequence.indexOf(i, step % rotationSequence.length);
              goTo(nextIdx >= 0 ? nextIdx : rotationSequence.indexOf(i), 1);
            }}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-500 ${
              i === current ? "bg-primary w-8" : "bg-foreground/30 w-2"
            } ${s.primary ? "ring-1 ring-accent/50" : ""}`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground flex flex-col items-center gap-2"
      >
        <span className="text-sm tracking-widest uppercase font-body">Scroll to explore</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <ChevronDown size={24} />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
