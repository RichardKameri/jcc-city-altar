import { motion } from "framer-motion";
import { Phone, CreditCard, Heart } from "lucide-react";

const GiveSection = () => {
  return (
    <section id="give" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-background to-background" />
      <div className="relative container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-accent font-body font-semibold tracking-[0.2em] uppercase text-base mb-3">
            Support the Ministry
          </p>
          <h2 className="font-display text-5xl md:text-6xl font-black mb-6">
            <span className="text-vibrant-gradient">Give</span> & Partner With Us
          </h2>
          <p className="text-muted-foreground font-body text-xl max-w-2xl mx-auto">
            Your generous giving helps us spread the gospel, support our community, and build God's kingdom.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto"
        >
          <div className="bg-card border-2 border-primary/40 rounded-3xl p-10 text-center glow-blue">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-vibrant-gradient flex items-center justify-center">
              <Heart size={36} className="text-primary-foreground" />
            </div>

            <h3 className="font-display text-3xl font-black mb-2">M-Pesa Paybill</h3>
            <p className="text-muted-foreground font-body text-lg mb-6">Give via M-Pesa to support JCC City Altar</p>

            <div className="bg-muted/50 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <CreditCard size={22} className="text-primary" />
                <span className="text-muted-foreground font-body text-base uppercase tracking-wider font-semibold">Paybill Number</span>
              </div>
              <p className="font-display text-6xl font-black text-vibrant-gradient">4316316</p>
            </div>

            <div className="bg-muted/30 rounded-2xl p-6 mb-6 text-left">
              <p className="text-muted-foreground font-body text-sm uppercase tracking-wider font-semibold mb-4 text-center">Account Numbers</p>
              <ul className="space-y-3 font-body">
                <li className="flex justify-between items-center border-b border-border/50 pb-2">
                  <span className="text-foreground font-semibold">Offering</span>
                  <span className="text-vibrant-gradient font-display font-black text-xl">7A</span>
                </li>
                <li className="flex justify-between items-center border-b border-border/50 pb-2">
                  <span className="text-foreground font-semibold">Tithe</span>
                  <span className="text-vibrant-gradient font-display font-black text-xl">7B</span>
                </li>
                <li className="flex justify-between items-center border-b border-border/50 pb-2">
                  <span className="text-foreground font-semibold">Seed</span>
                  <span className="text-vibrant-gradient font-display font-black text-xl">7C</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-foreground font-semibold">Thanksgiving</span>
                  <span className="text-vibrant-gradient font-display font-black text-xl">7D</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-center gap-2 text-muted-foreground font-body text-base">
              <Phone size={18} className="text-accent" />
              <span>For more info: <span className="text-foreground font-semibold text-lg">+254 711 316316</span></span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GiveSection;
