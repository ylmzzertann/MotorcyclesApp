import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  image: string;
  index: number;
}

const FeatureCard = ({ icon: Icon, title, description, image, index }: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="group glass-card overflow-hidden hover:glow-border transition-all duration-500"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <div className="gradient-bg p-2.5 rounded-lg">
            <Icon size={20} className="text-primary-foreground" />
          </div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-display text-base font-semibold mb-2 text-foreground">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default FeatureCard;
