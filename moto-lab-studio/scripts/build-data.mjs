// ============================================================================
//  build-data.mjs  —  MotoScience veri temizleme & zenginleştirme hattı (ETL)
//  Çalıştır:  node scripts/build-data.mjs
//  Girdi:     motorcycle_datas.json               (HAM — asla değiştirme)
//  Çıktı:     public/data/motorcycles.clean.json  (uygulama runtime'da fetch eder)
//
//  Her spec alanı şu şekilde saklanır:  { v: <sayı|string|null>, s: <kaynak> }
//    s = 'raw'       -> siteden geldiği gibi, geçerli
//    s = 'derived'   -> aynı kayıttan hesaplandı (geometri, oran, kW->HP)
//    s = 'sibling'   -> aynı modelin başka yıl kaydından kopyalandı
//    s = 'estimated' -> istatistiksel tahmin (UI'da "~" / "tahmini" rozetiyle göster)
//    s = 'invalid'   -> ham değer yanlış alandaydı, atıldı (r: atılan ham değer)
//    s = 'missing'   -> hiç veri yok
// ============================================================================

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAW_PATH = join(ROOT, 'motorcycle_datas.json');
const OUT_PATH = join(ROOT, 'public', 'data', 'motorcycles.clean.json');

// ---------------------------------------------------------------------------
// 0) Yardımcılar
// ---------------------------------------------------------------------------
const isNA = (v) =>
  v == null || String(v).trim() === '' || String(v).trim().toUpperCase() === 'N/A';

// Bir string'ten ilk ondalık sayıyı çeker: "82.0 Nm (8.4 kgf-m)" -> 82.0
const firstNum = (s) => {
  if (isNA(s)) return null;
  const m = String(s).match(/-?\d+(?:[.,]\d+)?/);
  return m ? parseFloat(m[0].replace(',', '.')) : null;
};

const spec = (v, s, extra = {}) => ({ v: v ?? null, s: v == null ? 'missing' : s, ...extra });

// ---------------------------------------------------------------------------
// 1) Ham record -> alan alan parse
// ---------------------------------------------------------------------------
function parseRecord(rec) {
  const T = rec['Temel Bilgiler'] || {};
  const M = rec['Motor ve Performans'] || {};
  const W = rec['Ağırlık ve Kapasite'] || {};
  const E = rec['Ergonomi ve Şasi'] || {};

  const out = {
    id: slug(`${T.Brand}-${T.Model}-${T.Year}`),
    sourceUrl: rec['Source URL'] || null,
    brand: clean(T.Brand),
    model: clean(T.Model),
    year: firstNum(T.Year),
    category: isNA(T.Category) ? spec(null) : spec(clean(T.Category), 'raw'),
  };

  // --- Motor hacmi (ccm) — EN BOZUK ALAN ---
  const esRaw = M['Engine Size (ccm)'];
  const fuelRaw = W['Fuel Capacity (litres)'];
  if (isNA(esRaw)) {
    out.engineSizeCc = spec(null);
  } else if (/litre/i.test(esRaw) || String(esRaw) === String(fuelRaw)) {
    // Yakıt deposu litresi motor hacmi alanına sızmış -> geçersiz
    out.engineSizeCc = spec(null, 'invalid', { r: String(esRaw) });
  } else {
    out.engineSizeCc = spec(firstNum(esRaw), 'raw');
  }

  // --- Güç (HP) + devir ---
  const pwRaw = M['Power (HP ve RPM)'];
  if (isNA(pwRaw)) {
    out.powerHp = spec(null);
    out.powerToWeight = spec(null);
  } else if (/HP\s*\/\s*kg/i.test(pwRaw)) {
    // Aslında güç/ağırlık oranı — güç alanına yanlış yazılmış
    out.powerHp = spec(null, 'invalid', { r: String(pwRaw) });
    out.powerToWeight = spec(firstNum(pwRaw), 'raw'); // HP/kg
  } else {
    out.powerHp = spec(firstNum(pwRaw), 'raw');
    out.powerToWeight = spec(null);
    // devir: "@ 8750 RPM"
    const rpm = String(pwRaw).match(/@\s*(\d{3,6})\s*RPM/i);
    out.powerRpm = spec(rpm ? parseInt(rpm[1], 10) : null, 'raw');
    // kW: "(65.9 kW)" — HP boşsa türetmek için sakla
    const kw = String(pwRaw).match(/(\d+(?:\.\d+)?)\s*kW/i);
    out._kw = kw ? parseFloat(kw[1]) : null;
  }
  out.powerRpm = out.powerRpm || spec(null);

  // --- Tork (Nm) ---
  out.torqueNm = spec(firstNum(M['Torque (Nm ve RPM)']), 'raw');

  // --- Top Speed (km/h) — %8.7 dolu, çoğu tahmin edilecek ---
  out.topSpeedKmh = spec(firstNum(M['Top Speed (km/h)']), 'raw');

  // --- Sıkıştırma oranı "11.5:1" ---
  out.compression = spec(isNA(M['Compression Ratio']) ? null : firstNum(M['Compression Ratio']), 'raw');

  // --- Bore x Stroke "92.0 x 56.4 mm" -> bore, stroke ---
  const bs = String(M['Bore x Stroke'] || '').match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/i);
  out.boreMm = spec(bs ? parseFloat(bs[1]) : null, 'raw');
  out.strokeMm = spec(bs ? parseFloat(bs[2]) : null, 'raw');

  // --- Valf / silindir ---
  out.valvesPerCyl = spec(firstNum(M['Valves per Cylinder']), 'raw');

  // --- Motor tipi + silindir sayısı (tipten türetilir) ---
  const et = isNA(M['Engine Type']) ? null : clean(M['Engine Type']);
  out.engineType = spec(et, 'raw');
  out.cylinders = spec(cylindersFromType(et), et ? 'derived' : 'missing');

  // --- Ağırlık ---
  out.dryWeightKg = spec(firstNum(W['Dry Weight (kg)']), 'raw');
  out.wetWeightKg = spec(firstNum(W['Curb/Wet Weight (kg)']), 'raw'); // hep boş ama şema tutarlı
  out.fuelCapacityL = spec(firstNum(fuelRaw), 'raw');

  // --- Şasi / ergonomi (string alanlar, olduğu gibi) ---
  out.seatHeightMm = spec(firstNum(E['Seat Height (mm)']), 'raw');
  out.suspensionFront = spec(strOrNull(E['Suspension (Front)']), 'raw');
  out.suspensionRear = spec(strOrNull(E['Suspension (Rear)']), 'raw');
  out.brakesFront = spec(strOrNull(E['Brakes (Front)']), 'raw');
  out.brakesRear = spec(strOrNull(E['Brakes (Rear)']), 'raw');

  return out;
}

// ---------------------------------------------------------------------------
// 2) KADEME A — aynı kayıttan deterministik türetme
// ---------------------------------------------------------------------------
function deriveWithinRecord(b) {
  // (a) Motor hacmi bozuk/boşsa: geometriden hesapla  V = π/4·bore²·stroke·silindir
  if (b.engineSizeCc.v == null &&
      b.boreMm.v && b.strokeMm.v && b.cylinders.v) {
    const cc = (Math.PI / 4) * b.boreMm.v ** 2 * b.strokeMm.v * b.cylinders.v / 1000;
    b.engineSizeCc = spec(Math.round(cc), 'derived');
  }
  // (b) Güç boş ama güç/ağırlık oranı + kuru ağırlık varsa: HP = oran · kg
  if (b.powerHp.v == null && b.powerToWeight.v && b.dryWeightKg.v) {
    b.powerHp = spec(round1(b.powerToWeight.v * b.dryWeightKg.v), 'derived');
  }
  // (c) Güç boş ama kW varsa: HP = kW · 1.34102
  if (b.powerHp.v == null && b._kw) {
    b.powerHp = spec(round1(b._kw * 1.34102), 'derived');
  }
  // (d) Güç/ağırlık boşsa ve HP + kuru ağırlık varsa: hesapla (rozet/sıralama için faydalı)
  if (b.powerToWeight.v == null && b.powerHp.v && b.dryWeightKg.v) {
    b.powerToWeight = spec(round3(b.powerHp.v / b.dryWeightKg.v), 'derived');
  }
  delete b._kw;
  return b;
}

// ---------------------------------------------------------------------------
// 2.5) CONSENSUS — aynı modelin yılları arasında çoğunluk oylaması
//   Motor mimarisi/hacmi bir model içinde yıldan yıla neredeyse hiç değişmez.
//   Bu yüzden güçlü bir çoğunluk (≥3 yıl ve ≥%60), tek bir yılın bozuk/zayıf
//   değerini (invalid, geometriden türetilmiş veya azınlık outlier) EZER.
//   Böylece "17 litre + L-twin" gibi kaynak hataları otomatik düzelir.
// ---------------------------------------------------------------------------
function mode(values) {
  const m = new Map();
  for (const v of values) if (v != null) m.set(v, (m.get(v) || 0) + 1);
  let best = null;
  for (const [value, count] of m) if (!best || count > best.count) best = { value, count };
  return best;
}
function applyConsensus(bikes) {
  const byModel = new Map();
  for (const b of bikes) {
    const key = `${b.brand}||${b.model}`;
    if (!byModel.has(key)) byModel.set(key, []);
    byModel.get(key).push(b);
  }
  let fixed = 0;
  for (const group of byModel.values()) {
    if (group.length < 3) continue; // çoğunluğa güvenmek için yeterli kardeş

    // (1) Motor tipi: sadece 'raw' değerlerin modu
    const tMode = mode(group.filter((b) => b.engineType.s === 'raw').map((b) => b.engineType.v));
    if (tMode && tMode.count >= 3 && tMode.count / group.length >= 0.6) {
      for (const b of group) {
        if (b.engineType.v !== tMode.value) {
          b.engineType = { v: tMode.value, s: 'consensus', r: b.engineType.v ?? null };
          fixed++;
          // tip düzeldiyse, tipten türeyen silindir sayısını da güncelle (raw değilse)
          if (b.cylinders.s !== 'raw') {
            const c = cylindersFromType(tMode.value);
            if (c) b.cylinders = { v: c, s: 'consensus' };
          }
        }
      }
    }

    // (2) Motor hacmi: 'raw' değerlerin modu (yuvarlanmış)
    const sMode = mode(group.filter((b) => b.engineSizeCc.s === 'raw').map((b) => Math.round(b.engineSizeCc.v)));
    if (sMode && sMode.count >= 3 && sMode.count / group.length >= 0.6) {
      for (const b of group) {
        const cur = b.engineSizeCc.v;
        const differs = cur == null || Math.abs(cur - sMode.value) > 5;
        if (differs && b.engineSizeCc.s !== 'raw') {
          b.engineSizeCc = { v: sMode.value, s: 'consensus', r: b.engineSizeCc.r ?? (cur != null ? String(cur) : null) };
          fixed++;
        } else if (differs && b.engineSizeCc.s === 'raw') {
          // raw ama güçlü çoğunluktan sapan outlier -> yine de düzelt, hamı sakla
          b.engineSizeCc = { v: sMode.value, s: 'consensus', r: String(cur) };
          fixed++;
        }
      }
    }
  }
  return fixed;
}

// ---------------------------------------------------------------------------
// 3) KADEME B — kayıtlar arası (aynı model, komşu yıl) doldurma
//    Sadece yıla göre görece stabil alanlar taşınır.
// ---------------------------------------------------------------------------
const SIBLING_FIELDS = [
  'engineType', 'cylinders', 'boreMm', 'strokeMm', 'compression',
  'valvesPerCyl', 'engineSizeCc', 'torqueNm', 'powerHp', 'topSpeedKmh',
  'dryWeightKg', 'seatHeightMm',
];
function fillFromSiblings(bikes) {
  const byModel = new Map();
  for (const b of bikes) {
    const key = `${b.brand}||${b.model}`;
    if (!byModel.has(key)) byModel.set(key, []);
    byModel.get(key).push(b);
  }
  let filled = 0;
  for (const group of byModel.values()) {
    if (group.length < 2) continue;
    for (const b of group) {
      for (const f of SIBLING_FIELDS) {
        if (b[f].v != null) continue;
        // en yakın yıldaki geçerli (raw/derived) kardeşi bul
        const donor = group
          .filter((o) => o !== b && o[f].v != null && (o[f].s === 'raw' || o[f].s === 'derived'))
          .sort((x, y) => Math.abs((x.year || 0) - b.year) - Math.abs((y.year || 0) - b.year))[0];
        if (donor) {
          b[f] = { v: donor[f].v, s: 'sibling', from: donor.year };
          filled++;
        }
      }
    }
  }
  return filled;
}

// ---------------------------------------------------------------------------
// 4) KADEME C — istatistiksel tahmin (agresif doldurma)
//    Top Speed'i güçten regresyonla, kalanları grup medyanıyla tahmin et.
// ---------------------------------------------------------------------------
function estimateGaps(bikes) {
  let est = 0;

  // (a) Top Speed ~ a + b·HP  (bilinen çiftlerden lineer regresyon)
  const pairs = bikes.filter((b) => b.powerHp.v && b.topSpeedKmh.s === 'raw')
    .map((b) => [b.powerHp.v, b.topSpeedKmh.v]);
  const { a, b: slope } = linreg(pairs);
  for (const bike of bikes) {
    if (bike.topSpeedKmh.v == null && bike.powerHp.v && slope != null) {
      const v = Math.round(a + slope * bike.powerHp.v);
      if (v > 40 && v < 420) { bike.topSpeedKmh = spec(v, 'estimated'); est++; }
    }
  }

  // (b) Kalan sayısal boşluklar: (kategori + hacim kovası) grup medyanı
  const NUMERIC = ['engineSizeCc', 'powerHp', 'torqueNm', 'dryWeightKg', 'topSpeedKmh', 'seatHeightMm'];
  const bucket = (b) => `${b.category?.v || '?'}|${b.engineSizeCc.v ? Math.round(b.engineSizeCc.v / 125) : '?'}`;
  const medians = {};
  for (const f of NUMERIC) {
    const groups = {};
    for (const b of bikes) {
      if (b[f].v != null && (b[f].s === 'raw' || b[f].s === 'derived')) {
        (groups[bucket(b)] ??= []).push(b[f].v);
      }
    }
    medians[f] = Object.fromEntries(Object.entries(groups).map(([k, arr]) => [k, median(arr)]));
  }
  for (const b of bikes) {
    for (const f of NUMERIC) {
      if (b[f].v == null) {
        const m = medians[f][bucket(b)];
        if (m != null) { b[f] = spec(round1(m), 'estimated'); est++; }
      }
    }
  }
  return est;
}

// ---------------------------------------------------------------------------
// yardımcı fonksiyonlar
// ---------------------------------------------------------------------------
function cylindersFromType(t) {
  if (!t) return null;
  let s = String(t).toLowerCase().replace(/\b(two|four|2|4)[\s-]*stroke\b/g, ' '); // "four-stroke" tuzağını temizle
  let m;
  if ((m = s.match(/(\d+)\s*[- ]?cylinder/))) return +m[1];
  if ((m = s.match(/\b(?:v|inline|inline-|l|straight|flat|in-line)[\s-]*(\d)\b/))) return +m[1];
  if (/\bsingle\b|one cylinder/.test(s)) return 1;
  if (/\btwin\b/.test(s)) return 2; // v-twin, parallel twin, l-twin...
  if (/\btriple\b/.test(s)) return 3;
  return null;
}
const clean = (s) => (isNA(s) ? null : String(s).trim());
const strOrNull = (s) => (isNA(s) ? null : String(s).trim());
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const round1 = (n) => Math.round(n * 10) / 10;
const round3 = (n) => Math.round(n * 1000) / 1000;
const median = (a) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
function linreg(pairs) {
  const n = pairs.length;
  if (n < 30) return { a: 0, b: null };
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  for (const [x, y] of pairs) { sx += x; sy += y; sxy += x * y; sxx += x * x; }
  const b = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const a = (sy - b * sx) / n;
  return { a, b };
}

// ---------------------------------------------------------------------------
// raporlama
// ---------------------------------------------------------------------------
function report(bikes, label) {
  const fields = ['engineSizeCc', 'engineType', 'powerHp', 'torqueNm', 'topSpeedKmh',
    'compression', 'cylinders', 'dryWeightKg', 'seatHeightMm', 'category'];
  const N = bikes.length;
  console.log(`\n=== ${label} (${N} kayıt) ===`);
  for (const f of fields) {
    const filled = bikes.filter((b) => b[f]?.v != null).length;
    const src = {};
    for (const b of bikes) { const s = b[f]?.s || 'missing'; src[s] = (src[s] || 0) + 1; }
    const brk = Object.entries(src).filter(([k]) => k !== 'missing')
      .map(([k, v]) => `${k}:${v}`).join(' ');
    console.log(`  ${((filled / N) * 100).toFixed(1).padStart(5)}%  ${f.padEnd(14)} ${brk}`);
  }
}

// ---------------------------------------------------------------------------
// ana akış
// ---------------------------------------------------------------------------
console.log('HAM veri okunuyor…');
const raw = JSON.parse(readFileSync(RAW_PATH, 'utf8'));
let bikes = raw.map(parseRecord);
report(bikes, 'AŞAMA 1 — sadece parse + onarım');

bikes = bikes.map(deriveWithinRecord);
report(bikes, 'AŞAMA 2 — Kademe A: kayıt-içi türetme');

const cons = applyConsensus(bikes);
console.log(`\nConsensus: kardeş-yıl çoğunluğuyla düzeltilen alan sayısı = ${cons}`);
report(bikes, 'AŞAMA 2.5 — Consensus: çoğunluk düzeltmesi');

const sib = fillFromSiblings(bikes);
console.log(`\nKademe B: kardeş-yıldan doldurulan alan sayısı = ${sib}`);
report(bikes, 'AŞAMA 3 — Kademe B: kardeş-yıl doldurma');

const est = estimateGaps(bikes);
console.log(`\nKademe C: tahmin edilen alan sayısı = ${est}`);
report(bikes, 'AŞAMA 4 — Kademe C: tahmin (agresif)');

mkdirSync(dirname(OUT_PATH), { recursive: true });
const payload = {
  meta: {
    generatedAt: new Date().toISOString(),
    source: 'motorcycle_datas.json',
    sourceRecords: raw.length,
    schema: 'her spec = { v: değer, s: raw|derived|sibling|estimated|invalid|missing }',
  },
  bikes,
};
writeFileSync(OUT_PATH, JSON.stringify(payload));
const mb = (readFileSync(OUT_PATH).length / 1048576).toFixed(1);
console.log(`\n✔ Yazıldı: ${OUT_PATH}  (${mb} MB, ${bikes.length} motosiklet)`);
