import { Search, GitCompareArrows, Wrench, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";
import FeatureCard from "./FeatureCard";
import exploreBike from "@/assets/explore-bike.jpg";
import compareBikes from "@/assets/compare-bikes.jpg";
import modifyBike from "@/assets/modify-bike.jpg";
import maintenanceBike from "@/assets/maintenance-bike.jpg";

const features = [
  {
    icon: Search,
    title: "Explore Motorcycles",
    description:
      "Browse a massive database of motorcycles. Filter by brand, engine type, displacement, and more. Dive into full spec sheets with a single tap.",
    image: exploreBike,
  },
  {
    icon: GitCompareArrows,
    title: "Compare Side by Side",
    description:
      "Put two motorcycles head-to-head. Compare horsepower, torque, weight, and every metric that matters to make an informed decision.",
    image: compareBikes,
  },
  {
    icon: Wrench,
    title: "Custom Modifications",
    description:
      "Experiment with aftermarket parts — exhausts, ECU tunes, air filters, and more. See how each mod impacts your bike's projected performance.",
    image: modifyBike,
  },
  {
    icon: ClipboardList,
    title: "Maintenance Garage",
    description:
      "Register your motorcycle and track oil changes, tire swaps, chain adjustments, and scheduled services. Never miss a maintenance window again.",
    image: maintenanceBike,
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 md:py-32 relative">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="font-display text-xs tracking-[0.3em] text-primary uppercase mb-3">
            What You Can Do
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Everything a Rider <span className="gradient-text">Needs</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            From discovery to daily riding — MotoScience is your all-in-one
            companion for understanding, comparing, modifying, and maintaining
            motorcycles.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
