import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CtaSection = () => {
  return (
    <section id="cta" className="py-24 md:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card glow-border p-10 md:p-16 text-center max-w-3xl mx-auto"
        >
          <p className="font-display text-xs tracking-[0.3em] text-primary uppercase mb-3">
            Ready to Ride?
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Start Exploring <span className="gradient-text">Today</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
            Discover thousands of motorcycles, compare specs in real-time, and
            build your personal garage — completely free.
          </p>
          <a
            href="#features"
            className="inline-flex items-center gap-2 gradient-bg text-primary-foreground font-semibold px-8 py-3.5 rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            Get Started <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;
