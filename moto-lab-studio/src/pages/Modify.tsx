import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, Flame, Gauge, Plus, Sparkles, X, Zap, Weight, Banknote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const motorcycles = [
  { id: "1", brand: "BMW", model: "S 1000 RR", year: 2024, engine: "999cc Inline-4", horsepower: "210 hp", torque: "113 Nm", weight: "197 kg", topSpeed: "299 km/h", price: "$18,295", image: "https://images.unsplash.com/photo-1568772585407-9361f9bfce49?q=80&w=2670&auto=format&fit=crop" },
  { id: "2", brand: "Yamaha", model: "YZF-R1", year: 2024, engine: "998cc CP4 Crossplane", horsepower: "200 hp", torque: "113 Nm", weight: "201 kg", topSpeed: "293 km/h", price: "$18,399", image: "https://images.unsplash.com/photo-1622185135505-2d795003994a?q=80&w=2670&auto=format&fit=crop" },
  { id: "3", brand: "Ducati", model: "Panigale V4 S", year: 2024, engine: "1103cc Desmosedici Stradale V4", horsepower: "215.5 hp", torque: "123.6 Nm", weight: "195.5 kg", topSpeed: "299 km/h", price: "$32,195", image: "https://images.unsplash.com/photo-1596541539260-26210ce5cbb9?q=80&w=2670&auto=format&fit=crop" },
  { id: "4", brand: "Kawasaki", model: "Ninja ZX-10R", year: 2024, engine: "998cc Inline-4", horsepower: "203 hp", torque: "114.9 Nm", weight: "207 kg", topSpeed: "299 km/h", price: "$17,799", image: "https://images.unsplash.com/photo-1627916538183-500b73c22b13?q=80&w=2670&auto=format&fit=crop" },
  { id: "5", brand: "Honda", model: "CBR1000RR-R", year: 2024, engine: "999cc Inline-4", horsepower: "214 hp", torque: "113 Nm", weight: "201 kg", topSpeed: "299 km/h", price: "$28,900", image: "https://images.unsplash.com/photo-1596707328608-410a80e07198?q=80&w=2670&auto=format&fit=crop" }
];

type ModEffect = { hpChange: number; torqueChange: number; weightChange: number; priceAdded: number; };
type ModCategory = "Exhaust" | "ECU" | "Weight" | "Intake";
type Modification = { id: string; name: string; category: ModCategory; effect: ModEffect; description: string; };

const modifications: Modification[] = [
  { id: "mod_1", name: "Akrapovič Full Titanium Race System", category: "Exhaust", effect: { hpChange: 12.5, torqueChange: 8, weightChange: -6.5, priceAdded: 2800 }, description: "Full titanium race exhaust system. Maximizes exhaust flow, significantly reduces weight, and provides an aggressive sound." },
  { id: "mod_2", name: "Termignoni Carbon Slip-On", category: "Exhaust", effect: { hpChange: 4, torqueChange: 2.5, weightChange: -2.5, priceAdded: 850 }, description: "High-quality carbon fiber slip-on. Aggressive tone and slight performance bump with easy installation." },
  { id: "mod_3", name: "Stage 1 ECU Flash", category: "ECU", effect: { hpChange: 15, torqueChange: 10, weightChange: 0, priceAdded: 600 }, description: "Optimized fuel mapping, removed factory restrictions, and enhanced ignition timing for a smoother power curve." },
  { id: "mod_4", name: "Stage 2 Race ECU Mapping", category: "ECU", effect: { hpChange: 22, torqueChange: 14, weightChange: 0, priceAdded: 1100 }, description: "Aggressive track-only tuning. Raises rev limiter and optimizes delivery for full exhaust systems." },
  { id: "mod_5", name: "Full Carbon Fiber Fairings Kit", category: "Weight", effect: { hpChange: 0, torqueChange: 0, weightChange: -8, priceAdded: 3200 }, description: "Complete carbon fiber bodywork replacing all stock plastics for extreme weight savings and aesthetics." },
  { id: "mod_6", name: "Marchesini Forged Magnesium Wheels", category: "Weight", effect: { hpChange: 0, torqueChange: 0, weightChange: -5, priceAdded: 4100 }, description: "Significantly reduces unsprung rotating mass, drastically improving handling, acceleration, and braking." },
  { id: "mod_7", name: "Sprint Filter P08 Race Air Filter", category: "Intake", effect: { hpChange: 3, torqueChange: 1.5, weightChange: 0, priceAdded: 150 }, description: "High permeability polyester racing air filter for maximum air intake volume." },
];

const parseSpec = (val: string) => parseFloat(val.replace(/[^\d.]/g, ''));

const Modify = () => {
  const [selectedBikeId, setSelectedBikeId] = useState<string>("1");
  const [activeMods, setActiveMods] = useState<Record<string, string>>({}); // category -> mod_id

  const baseBike = motorcycles.find(m => m.id === selectedBikeId) || motorcycles[0];

  const handleToggleMod = (mod: Modification) => {
    setActiveMods(prev => {
      const isAlreadyActive = prev[mod.category] === mod.id;
      const newMods = { ...prev };
      if (isAlreadyActive) {
        delete newMods[mod.category]; // Deselect
      } else {
        newMods[mod.category] = mod.id; // Select and replace existing in category
      }
      return newMods;
    });
  };

  const calculatedSpecs = useMemo(() => {
    let hp = parseSpec(baseBike.horsepower);
    let torque = parseSpec(baseBike.torque);
    let weight = parseSpec(baseBike.weight);
    let price = parseFloat(baseBike.price.replace(/[^\d.]/g, ''));

    let diffHp = 0;
    let diffTorque = 0;
    let diffWeight = 0;
    let diffPrice = 0;

    Object.values(activeMods).forEach(modId => {
      const mod = modifications.find(m => m.id === modId);
      if (mod) {
        diffHp += mod.effect.hpChange;
        diffTorque += mod.effect.torqueChange;
        diffWeight += mod.effect.weightChange;
        diffPrice += mod.effect.priceAdded;
      }
    });

    return {
      totalHp: hp + diffHp, diffHp, baseHp: hp,
      totalTorque: torque + diffTorque, diffTorque, baseTorque: torque,
      totalWeight: weight + diffWeight, diffWeight, baseWeight: weight,
      totalPrice: price + diffPrice, diffPrice, basePrice: price,
    };
  }, [baseBike, activeMods]);

  const categories = Array.from(new Set(modifications.map(m => m.category)));

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-20 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Performance <span className="gradient-text">Lab</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Engineer your ultimate machine. Apply performance upgrades to different parts and see the theoretical gains in real-time.
            </p>

            <div className="max-w-xs mx-auto">
              <Select value={selectedBikeId} onValueChange={(val) => { setSelectedBikeId(val); setActiveMods({}); }}>
                <SelectTrigger className="w-full h-12 text-base glass-card border-primary/30">
                  <SelectValue placeholder="Select a base motorcycle" />
                </SelectTrigger>
                <SelectContent>
                  {motorcycles.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="cursor-pointer">{m.brand} {m.model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Col: Visual & Specs */}
            <div className="col-span-1 lg:col-span-5 flex flex-col gap-6">
              {/* Bike Card */}
              <div className="relative rounded-2xl overflow-hidden glass-card shadow-2xl glow-border">
                <div className="relative h-64 md:h-80 w-full overflow-hidden group">
                  <img src={baseBike.image} alt={baseBike.model} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
                  
                  <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end">
                    <p className="text-primary font-bold text-sm tracking-wider uppercase drop-shadow-md">{baseBike.brand}</p>
                    <h3 className="text-3xl font-bold text-foreground drop-shadow-md">{baseBike.model}</h3>
                    <p className="text-muted-foreground font-medium text-sm drop-shadow-md">{baseBike.engine}</p>
                  </div>
                </div>
              </div>

              {/* Live Spec Differences Card */}
              <div className="glass-card rounded-2xl p-6 shadow-xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Gauge size={120} />
                </div>
                <h4 className="text-xl font-bold font-display flex items-center gap-2 mb-6">
                  <Sparkles className="text-primary" /> Projected Specifications
                </h4>

                <div className="flex flex-col gap-5">
                  {/* Horsepower */}
                  <div className="flex justify-between items-center bg-card/40 p-4 rounded-xl border border-white/10 backdrop-blur">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-lg"><Flame size={20} /></div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Horsepower</p>
                        <p className="text-2xl font-bold font-display">{calculatedSpecs.totalHp.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">hp</span></p>
                      </div>
                    </div>
                    {calculatedSpecs.diffHp > 0 && (
                      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} key={calculatedSpecs.diffHp}>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-sm px-3 py-1 font-bold">+ {calculatedSpecs.diffHp} hp</Badge>
                      </motion.div>
                    )}
                  </div>

                  {/* Torque */}
                  <div className="flex justify-between items-center bg-card/40 p-4 rounded-xl border border-white/10 backdrop-blur">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-lg"><Zap size={20} /></div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Torque</p>
                        <p className="text-2xl font-bold font-display">{calculatedSpecs.totalTorque.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">Nm</span></p>
                      </div>
                    </div>
                    {calculatedSpecs.diffTorque > 0 && (
                      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} key={calculatedSpecs.diffTorque}>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-sm px-3 py-1 font-bold">+ {calculatedSpecs.diffTorque} Nm</Badge>
                      </motion.div>
                    )}
                  </div>

                  {/* Weight */}
                  <div className="flex justify-between items-center bg-card/40 p-4 rounded-xl border border-white/10 backdrop-blur">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-lg"><Weight size={20} /></div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Dry Weight</p>
                        <p className="text-2xl font-bold font-display">{calculatedSpecs.totalWeight.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">kg</span></p>
                      </div>
                    </div>
                    {calculatedSpecs.diffWeight < 0 && (
                      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} key={calculatedSpecs.diffWeight}>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-sm px-3 py-1 font-bold">{calculatedSpecs.diffWeight} kg</Badge>
                      </motion.div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex justify-between items-center bg-card/40 p-4 rounded-xl border border-white/10 backdrop-blur">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-green-500/10 text-green-500 rounded-lg"><Banknote size={20} /></div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">Est. Value (w/ Mods)</p>
                        <p className="text-2xl font-bold font-display">${calculatedSpecs.totalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                    {calculatedSpecs.diffPrice > 0 && (
                      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} key={calculatedSpecs.diffPrice}>
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-sm px-3 py-1 font-bold">+ ${calculatedSpecs.diffPrice.toLocaleString()}</Badge>
                      </motion.div>
                    )}
                  </div>

                </div>
              </div>
            </div>

            {/* Right Col: Parts Selection */}
            <div className="col-span-1 lg:col-span-7">
              <div className="glass-card rounded-2xl p-6 md:p-8 shadow-xl min-h-full border border-white/5">
                <h2 className="text-2xl font-bold font-display mb-2 flex items-center gap-2">
                  Modification Catalog
                </h2>
                <p className="text-muted-foreground mb-8 text-sm">Select parts below to apply modifications. You can equip one item per category at a time.</p>

                <div className="space-y-10">
                  {categories.map(category => {
                    const categoryMods = modifications.filter(m => m.category === category);
                    return (
                      <div key={category} className="space-y-4">
                        <h3 className="text-lg font-bold font-display text-primary uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
                          {category} Upgrades
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {categoryMods.map(mod => {
                            const isActive = activeMods[category] === mod.id;
                            
                            return (
                              <div 
                                key={mod.id}
                                onClick={() => handleToggleMod(mod)}
                                className={`relative p-5 rounded-xl border-2 transition-all cursor-pointer overflow-hidden flex flex-col justify-between ${
                                  isActive 
                                    ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(var(--primary),0.3)] shadow-primary/20 scale-[1.02]" 
                                    : "bg-card/30 border-white/10 hover:border-white/30 hover:bg-card/50"
                                }`}
                              >
                                {isActive && (
                                  <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-primary text-primary-foreground p-3 rounded-bl-2xl rotate-12">
                                    <Check className="-rotate-12" size={16} />
                                  </div>
                                )}
                                
                                <div className="mb-4">
                                  <h4 className={`font-bold text-base mb-1 ${isActive ? "text-primary" : "text-foreground"}`}>{mod.name}</h4>
                                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{mod.description}</p>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-white/5">
                                  {mod.effect.hpChange > 0 && (
                                    <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">+{mod.effect.hpChange} hp</span>
                                  )}
                                  {mod.effect.torqueChange > 0 && (
                                    <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">+{mod.effect.torqueChange} Nm</span>
                                  )}
                                  {mod.effect.weightChange < 0 && (
                                    <span className="text-xs font-semibold bg-blue-500/10 text-blue-400 px-2 py-1 rounded">{mod.effect.weightChange} kg</span>
                                  )}
                                  {mod.effect.priceAdded > 0 && (
                                    <span className="text-xs font-semibold bg-background/50 text-muted-foreground px-2 py-1 rounded">+${mod.effect.priceAdded}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Modify;
