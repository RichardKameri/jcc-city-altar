import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import MinistriesSection from "@/components/MinistriesSection";
import GiveSection from "@/components/GiveSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <MinistriesSection />
      <GiveSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
