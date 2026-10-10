import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import heroBike from "@/assets/hero-bike.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroBike}
          alt="BMW S1000RR Sport Motorcycle"
          width={1920}
          height={1080}
          className="w-full h-full object-cover object-center"
        />
        <div className="hero-gradient-overlay absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
      </div>

      {/* Content */}
      <div className="container relative z-10 pt-20">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-xs md:text-sm tracking-[0.3em] text-primary uppercase mb-4"
          >
            The Ultimate Motorcycle Platform
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6"
          >
            <span className="text-foreground">Know Your </span>
            <span className="gradient-text text-glow">Machine</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-muted-foreground text-base md:text-lg max-w-lg mb-10 leading-relaxed"
          >
            Explore specs, compare performance, customize modifications, and
            track maintenance — all in one place. Built for riders who demand
            precision.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a
              href="#features"
              className="gradient-bg text-primary-foreground font-semibold px-8 py-3.5 rounded-lg text-sm hover:opacity-90 transition-opacity text-center animate-pulse-glow"
            >
              Explore Features
            </a>
            <a
              href="/compare"
              className="glass-card glow-border text-foreground font-semibold px-8 py-3.5 rounded-lg text-sm hover:bg-secondary/60 transition-colors text-center"
            >
              Compare Bikes
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <ChevronDown className="text-primary" size={28} />
      </motion.div>
    </section>
  );
};

export default HeroSection;
