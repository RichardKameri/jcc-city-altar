import { motion } from "framer-motion";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
}

const PageHeader = ({ eyebrow, title, highlight, subtitle }: PageHeaderProps) => {
  return (
    <section className="relative pt-36 pb-12 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-card via-background to-background" />
      <div className="absolute inset-0 bg-vibrant-gradient opacity-[0.04]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative container mx-auto px-6 text-center"
      >
        {eyebrow && (
          <p className="text-accent font-body font-semibold tracking-[0.3em] uppercase text-sm md:text-base mb-3">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-5xl md:text-7xl font-black mb-4">
          {title} {highlight && <span className="text-vibrant-gradient">{highlight}</span>}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground font-body text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </motion.div>
    </section>
  );
};

export default PageHeader;
