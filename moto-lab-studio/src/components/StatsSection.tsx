import { motion } from "framer-motion";

const stats = [
  { value: "2,500+", label: "Motorcycles" },
  { value: "150+", label: "Brands" },
  { value: "800+", label: "Aftermarket Parts" },
  { value: "50K+", label: "Spec Data Points" },
];

const StatsSection = () => {
  return (
    <section className="py-16 relative">
      <div className="section-divider mb-16" />
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <p className="font-display text-3xl md:text-4xl font-bold gradient-text mb-1">
                {s.value}
              </p>
              <p className="text-muted-foreground text-sm">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="section-divider mt-16" />
    </section>
  );
};

export default StatsSection;
