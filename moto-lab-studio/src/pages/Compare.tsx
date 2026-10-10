import { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Plus, X, Edit2, Bike as BikeIcon, ExternalLink, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// --- Temiz verinin şeması (scripts/build-data.mjs üretir) ---
type Src = "raw" | "derived" | "sibling" | "estimated" | "invalid" | "missing";
type Field = { v: number | string | null; s: Src; from?: number };
type Bike = {
  id: string;
  sourceUrl: string | null;
  brand: string;
  model: string;
  year: number;
  category: Field;
  engineSizeCc: Field;
  engineType: Field;
  powerHp: Field;
  powerToWeight: Field;
  torqueNm: Field;
  topSpeedKmh: Field;
  compression: Field;
  cylinders: Field;
  valvesPerCyl: Field;
  dryWeightKg: Field;
  wetWeightKg: Field;
  fuelCapacityL: Field;
  seatHeightMm: Field;
};

// ---------------------------------------------------------------------------
// Veri yükleme
// ---------------------------------------------------------------------------
function useBikes() {
  const [bikes, setBikes] = useState<Bike[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetch("/data/motorcycles.clean.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => setBikes(d.bikes as Bike[]))
      .catch((e) => setError(String(e)));
  }, []);
  return { bikes, error };
}

// ---------------------------------------------------------------------------
// Kaynak-güven rozeti  (verinin nereden geldiğini gösterir → doğruluk kontrolü)
// ---------------------------------------------------------------------------
const SourceBadge = ({ f }: { f?: Field }) => {
  if (!f) return null;
  const map: Record<string, { txt: string; cls: string }> = {
    derived: { txt: "hesap", cls: "text-violet-300 bg-violet-500/10 border-violet-500/25" },
    sibling: { txt: `≈ ${f.from ?? ""}`, cls: "text-sky-300 bg-sky-500/10 border-sky-500/25" },
    consensus: { txt: "düzeltildi", cls: "text-emerald-300 bg-emerald-500/10 border-emerald-500/25" },
    estimated: { txt: "~ tahmini", cls: "text-amber-300 bg-amber-500/10 border-amber-500/25" },
  };
  const b = map[f.s];
  if (!b) return null; // raw -> rozet yok
  return (
    <span className={`ml-2 inline-block rounded-full border px-1.5 py-0.5 text-[10px] font-medium leading-none ${b.cls}`}>
      {b.txt}
    </span>
  );
};

// ---------------------------------------------------------------------------
// Aranabilir motor seçici (11k kayıt için combobox)
// ---------------------------------------------------------------------------
const BikePicker = ({
  bikes,
  onSelect,
  triggerLabel,
}: {
  bikes: Bike[];
  onSelect: (id: string) => void;
  triggerLabel: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return bikes.slice(0, 60);
    const terms = query.split(/\s+/);
    const out: Bike[] = [];
    for (const b of bikes) {
      const hay = `${b.brand} ${b.model} ${b.year}`.toLowerCase();
      if (terms.every((t) => hay.includes(t))) {
        out.push(b);
        if (out.length >= 60) break;
      }
    }
    return out;
  }, [q, bikes]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerLabel}</PopoverTrigger>
      <PopoverContent className="w-80 p-0 rounded-xl border border-border/50 shadow-2xl bg-card/95 backdrop-blur z-50" align="start" sideOffset={8}>
        <Command shouldFilter={false}>
          <CommandInput placeholder="Marka / model / yıl ara…" value={q} onValueChange={setQ} />
          <CommandList>
            <CommandEmpty>Sonuç yok.</CommandEmpty>
            <CommandGroup heading={`${results.length}${q ? "" : "+"} sonuç`}>
              {results.map((b) => (
                <CommandItem
                  key={b.id}
                  value={b.id}
                  onSelect={() => {
                    onSelect(b.id);
                    setOpen(false);
                    setQ("");
                  }}
                  className="cursor-pointer"
                >
                  <span className="text-primary font-semibold mr-1">{b.brand}</span>
                  <span className="text-foreground/90">{b.model.replace(new RegExp(`^${b.brand}\\s*`, "i"), "")}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{b.year}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// ---------------------------------------------------------------------------
// Karşılaştırma tablosu satır tanımları
// ---------------------------------------------------------------------------
type Row =
  | { label: string; kind: "engine" }
  | { label: string; kind: "year" }
  | { label: string; kind: "field"; field: keyof Bike; unit: string; better?: "max" | "min" };

const ROWS: Row[] = [
  { label: "Engine", kind: "engine" },
  { label: "Displacement", kind: "field", field: "engineSizeCc", unit: "cc", better: "max" },
  { label: "Horsepower", kind: "field", field: "powerHp", unit: "hp", better: "max" },
  { label: "Torque", kind: "field", field: "torqueNm", unit: "Nm", better: "max" },
  { label: "Top Speed", kind: "field", field: "topSpeedKmh", unit: "km/h", better: "max" },
  { label: "Dry Weight", kind: "field", field: "dryWeightKg", unit: "kg", better: "min" },
  { label: "Power/Weight", kind: "field", field: "powerToWeight", unit: "hp/kg", better: "max" },
  { label: "Cylinders", kind: "field", field: "cylinders", unit: "" },
  { label: "Compression", kind: "field", field: "compression", unit: ":1" },
  { label: "Fuel Capacity", kind: "field", field: "fuelCapacityL", unit: "L" },
  { label: "Seat Height", kind: "field", field: "seatHeightMm", unit: "mm" },
  { label: "Year", kind: "year" },
];

const numOf = (b: Bike | null, field: keyof Bike): number | null => {
  if (!b) return null;
  const f = b[field] as Field;
  return f && typeof f.v === "number" ? f.v : null;
};

const Compare = () => {
  const { bikes, error } = useBikes();
  const byId = useMemo(() => {
    const m = new Map<string, Bike>();
    (bikes ?? []).forEach((b) => m.set(b.id, b));
    return m;
  }, [bikes]);

  const [slots, setSlots] = useState<(string | null)[]>([null, null, null]);
  const setSlot = (i: number, id: string | null) =>
    setSlots((s) => s.map((v, idx) => (idx === i ? id : v)));

  const active = slots.map((id) => (id ? byId.get(id) ?? null : null));

  // Her satır için "kazanan" değeri hesapla (yalnızca ≥2 dolu değer varsa)
  const winners = useMemo(() => {
    const w: Record<string, number | null> = {};
    for (const row of ROWS) {
      if (row.kind !== "field" || !row.better) continue;
      const vals = active.map((b) => numOf(b, row.field)).filter((v): v is number => v != null);
      if (vals.length < 2) { w[row.field as string] = null; continue; }
      w[row.field as string] = row.better === "max" ? Math.max(...vals) : Math.min(...vals);
    }
    return w;
  }, [active]);

  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100));

  const renderCell = (b: Bike | null, row: Row) => {
    if (!b) return <span className="text-muted-foreground">—</span>;

    if (row.kind === "engine") {
      const size = b.engineSizeCc.v;
      const type = b.engineType.v;
      if (size == null && type == null) return <span className="text-muted-foreground">—</span>;
      return (
        <span>
          {size != null && <span className="font-semibold">{fmt(size as number)}cc </span>}
          {type != null && <span className="text-foreground/80">{type}</span>}
          <SourceBadge f={size != null ? b.engineSizeCc : b.engineType} />
        </span>
      );
    }
    if (row.kind === "year") return <span>{b.year}</span>;

    const f = b[row.field] as Field;
    if (!f || f.v == null || f.s === "invalid")
      return <span className="text-muted-foreground">—</span>;

    const isWinner = row.better && typeof f.v === "number" && winners[row.field as string] === f.v;
    return (
      <span>
        <span className={isWinner ? "text-primary font-bold" : ""}>
          {typeof f.v === "number" ? fmt(f.v) : f.v}
          {row.unit && ` ${row.unit}`}
        </span>
        <SourceBadge f={f} />
      </span>
    );
  };

  // --- yükleniyor / hata durumları ---
  if (error)
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center text-center px-4">
          <div>
            <p className="text-destructive font-semibold">Veri yüklenemedi: {error}</p>
            <p className="text-muted-foreground text-sm mt-2">
              <code>node scripts/build-data.mjs</code> ile <code>public/data/motorcycles.clean.json</code> üretildi mi?
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );

  const emptyTrigger = (
    <button className="flex flex-col items-center justify-center gap-2 w-full h-full">
      <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-primary">
        <Search size={26} />
      </div>
      <p className="font-semibold text-muted-foreground text-sm">Motosiklet Seç</p>
    </button>
  );

  const renderSlot = (b: Bike | null, i: number) => {
    if (!bikes)
      return <div className="h-64 rounded-xl bg-card/30 animate-pulse border border-border/30" />;

    if (!b)
      return (
        <div className="h-64 rounded-xl border-2 border-dashed border-border/50 bg-card/20 hover:bg-card/40 transition-colors flex items-center justify-center p-6">
          <BikePicker bikes={bikes} onSelect={(id) => setSlot(i, id)} triggerLabel={emptyTrigger} />
        </div>
      );

    return (
      <div className="relative group h-64 rounded-xl overflow-hidden glass-card flex flex-col justify-between shadow-lg">
        {/* görsel yok — markalı gradyan placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10 flex items-center justify-center">
          <BikeIcon size={80} className="text-foreground/10" />
        </div>
        <div className="relative z-10 flex justify-between items-start p-4">
          <BikePicker
            bikes={bikes}
            onSelect={(id) => setSlot(i, id)}
            triggerLabel={
              <button className="bg-background/80 hover:bg-background text-foreground text-xs font-semibold px-3 py-1.5 rounded-md backdrop-blur border border-border/50 flex items-center gap-2">
                <Edit2 size={14} /> Değiştir
              </button>
            }
          />
          <button
            className="bg-background/50 hover:bg-destructive text-white p-1.5 rounded-full backdrop-blur transition-colors"
            onClick={() => setSlot(i, null)}
          >
            <X size={16} />
          </button>
        </div>
        <div className="relative z-10 p-4">
          <p className="text-primary font-bold text-sm tracking-wider uppercase drop-shadow">{b.brand}</p>
          <h3 className="text-lg font-bold text-foreground drop-shadow leading-tight">
            {b.model.replace(new RegExp(`^${b.brand}\\s*`, "i"), "")}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-muted-foreground text-sm">{b.year}</span>
            {b.sourceUrl && (
              <a
                href={b.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-sky-300 hover:text-sky-200 inline-flex items-center gap-1"
              >
                Kaynak <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28 pb-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Compare <span className="gradient-text">Motorcycles</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {bikes ? `${bikes.length.toLocaleString("tr-TR")} motosiklet` : "Yükleniyor…"} · specs'i yan yana analiz et.
            </p>
          </motion.div>

          {/* Rozet açıklaması — verinin kaynağını/güvenini anlamak için */}
          <div className="flex flex-wrap justify-center gap-3 mb-8 text-[11px] text-muted-foreground">
            <span>Veri kaynağı:</span>
            <span className="text-foreground">● doğrudan site (rozetsiz)</span>
            <span className="text-violet-300">● hesap = kayıttan türetildi</span>
            <span className="text-sky-300">● ≈yıl = aynı modelin başka yılı</span>
            <span className="text-emerald-300">● düzeltildi = çoğunluk oylaması</span>
            <span className="text-amber-300">● ~tahmini = istatistiksel tahmin</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {renderSlot(active[0], 0)}
            {renderSlot(active[1], 1)}
            {renderSlot(active[2], 2)}
          </div>

          <div className="glass-card rounded-2xl p-0 md:p-6 overflow-x-auto shadow-xl glow-border">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-4 md:py-5 text-muted-foreground uppercase text-xs md:text-sm font-semibold tracking-wider font-display bg-card/40 backdrop-blur sticky left-0 z-20">
                    Specifications
                  </th>
                  {active.map((b, idx) => (
                    <th key={idx} className="p-4 md:py-5 font-display font-bold text-sm md:text-base w-1/4">
                      {b ? (
                        <span className="gradient-text">
                          {b.brand} {b.model.replace(new RegExp(`^${b.brand}\\s*`, "i"), "")}
                        </span>
                      ) : (
                        "—"
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4 py-4 font-medium text-muted-foreground bg-card/40 backdrop-blur sticky left-0 z-20 group-hover:bg-card/60 uppercase text-xs font-display tracking-widest whitespace-nowrap">
                      {row.label}
                    </td>
                    {active.map((b, idx) => (
                      <td key={idx} className="p-4 py-4 text-foreground font-medium text-sm md:text-base">
                        {renderCell(b, row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Compare;
