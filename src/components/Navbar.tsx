import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, NavLink } from "react-router-dom";
import jccLogo from "@/assets/jcc-logo.jpeg";
import { Menu, X } from "lucide-react";

type NavItem = { label: string; to?: string; href?: string; external?: boolean };

const navLinks: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Ministries", to: "/ministries" },
  // { label: "Events", to: "/events" },
  { label: "Our Programs", to: "/programs" },
  { label: "Give", to: "/give" },
  { label: "Contact", to: "/contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `font-body text-sm font-semibold tracking-wide uppercase transition-colors duration-300 ${
      isActive ? "text-primary border-b-2 border-primary pb-1" : "text-foreground/80 hover:text-primary"
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `font-body text-lg font-semibold py-2 transition-colors ${
      isActive ? "text-primary" : "text-foreground/80 hover:text-primary"
    }`;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-background/95 backdrop-blur-md shadow-lg shadow-primary/5" : "bg-background/40 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={jccLogo} alt="JCC City Altar Logo" className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover ring-2 ring-primary/40 shadow-lg" />
          <span className="font-display text-xl md:text-2xl font-black text-vibrant-gradient">
            JCC City Altar
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/80 hover:text-primary transition-colors duration-300 font-body text-sm font-semibold tracking-wide uppercase"
              >
                {link.label}
              </a>
            ) : (
              <NavLink key={link.label} to={link.to!} end={link.to === "/"} className={linkClass}>
                {link.label}
              </NavLink>
            )
          )}
          <Link
            to="/give"
            className="bg-vibrant-gradient text-primary-foreground px-6 py-2.5 rounded-full font-body font-bold text-sm tracking-wide hover:opacity-90 transition-opacity animate-pulse-glow"
          >
            Give Now
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/98 backdrop-blur-lg border-t border-border"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) =>
                link.external ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)}
                    className="text-foreground/80 hover:text-primary transition-colors font-body text-lg font-semibold py-2"
                  >
                    {link.label}
                  </a>
                ) : (
                  <NavLink
                    key={link.label}
                    to={link.to!}
                    end={link.to === "/"}
                    onClick={() => setMobileOpen(false)}
                    className={mobileLinkClass}
                  >
                    {link.label}
                  </NavLink>
                )
              )}
              <Link
                to="/give"
                onClick={() => setMobileOpen(false)}
                className="bg-vibrant-gradient text-primary-foreground px-6 py-3 rounded-full font-body font-bold text-center"
              >
                Give Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
