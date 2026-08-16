import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Globe } from "lucide-react";
import { useState } from "react";
import emailjs from "@emailjs/browser";

// ✅ Static data lives outside the component (no hooks, no problem)
const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/JCCCityAltar",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@jesuscelebrationcentrecity3939",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com/jcccityaltar",
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
];

const contactDetails = [
  {
    icon: <MapPin size={22} className="text-primary-foreground" />,
    title: "Location",
    content: (
      <p className="text-muted-foreground font-body text-lg">
        KCB Hamburg House,
        <br />
        Opp Quickmart Supermarket,
        <br />
        Tom Mboya Street
      </p>
    ),
  },
  {
    icon: <Phone size={22} className="text-primary-foreground" />,
    title: "Phone",
    content: (
      <p className="text-muted-foreground font-body text-lg">+254 711 316316</p>
    ),
  },
  {
    icon: <Mail size={22} className="text-primary-foreground" />,
    title: "Email",
    content: (
      <p className="text-muted-foreground font-body text-lg">
        jcccityaltar@gmail.com
      </p>
    ),
  },
  {
    icon: <Globe size={22} className="text-primary-foreground" />,
    title: "Website",
    content: (
      <p className="text-muted-foreground font-body text-lg">
        www.jcccityaltar.org
      </p>
    ),
  },
];

// ✅ FIX 1: Component is now properly declared — all hooks live inside it
const ContactSection = () => {

  // ✅ FIX 2: All useState hooks are inside the component
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  // ✅ FIX 3: status state is now declared (was used in JSX but missing entirely)
  const [status, setStatus] = useState(""); // "success" | "error" | ""

  // ✅ FIX 4: No TypeScript type annotations — this is a .jsx file
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ FIX 5: handleSubmit is inside the component, sets status, no alert()
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(""); // reset status on each new attempt

    try {
      await emailjs.send(
        "YOUR_SERVICE_ID",   // replace with your EmailJS service ID
        "YOUR_TEMPLATE_ID",  // replace with your EmailJS template ID
        {
          from_name: formData.name,
          from_email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
        "YOUR_PUBLIC_KEY"    // replace with your EmailJS public key
      );

      // ✅ FIX 6: Set status instead of using alert()
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error(error);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background to-card" />

      <div className="relative container mx-auto px-6">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl font-bold mb-4">Get In Touch</h2>
          <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
            We'd love to hear from you. Reach out and we'll get back to you as
            soon as possible.
          </p>
        </motion.div>

        {/* Two-column grid — contact info on left, form on right */}
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">

          {/* LEFT COLUMN — Contact Info + Social Links */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {contactDetails.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-purple-gradient flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-display text-xl font-bold mb-1">
                    {item.title}
                  </h4>
                  {item.content}
                </div>
              </div>
            ))}

            {/* Social Links — rendered once only */}
            <div className="pt-2">
              <h4 className="font-display text-xl font-bold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center hover:bg-blue-purple-gradient hover:border-primary transition-all duration-300 text-foreground hover:text-primary-foreground"
                  >
                    {social.svg}
                  </a>
                ))}
              </div>
              <p className="text-muted-foreground font-body text-sm mt-3">
                @Jcc City Altar
              </p>
            </div>
          </motion.div>

          {/* RIGHT COLUMN — Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display text-3xl font-bold mb-6">
              Send Us a Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <textarea
                name="message"
                rows={5}
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-blue-purple-gradient text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>

              {/* ✅ FIX 7: Inline status feedback — no alert() popups */}
              {status === "success" && (
                <p className="text-green-500 text-sm text-center">
                  ✅ Message sent successfully! We'll be in touch soon.
                </p>
              )}
              {status === "error" && (
                <p className="text-red-500 text-sm text-center">
                  ❌ Something went wrong. Please try again or email us directly.
                </p>
              )}
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;
