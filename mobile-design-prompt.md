# MotoScience — Mobile App Design Prompt (for Claude Design)

Design a complete, native-feeling **mobile app UI** for **MotoScience**, a premium motorcycle platform for riders. This is the mobile version of an existing web app; keep the same brand identity and visual language, but redesign every screen around mobile-native patterns (bottom tab bar, thumb-reachable actions, vertical flow, swipe, bottom sheets). Deliver high-fidelity screens.

## Platform & format
- Target: iOS-first, works on Android. Portrait phone, 390 × 844 pt (iPhone), respect safe areas (notch top, home indicator bottom).
- Dark mode only (this is a dark-native product — do not produce a light theme).
- Deliver these screens as separate frames: (1) Home, (2) Explore, (3) Bike Detail, (4) Compare, (5) Performance Lab / Modify, (6) Garage, plus the shared Bottom Tab Bar. Mark Explore, Bike Detail and Garage as "planned" screens (they exist in the product vision, not yet in the web app).

## Brand & visual identity (match the existing web app exactly)
- **Mood:** high-tech, racing, precision-engineering, premium. Feels like a performance dashboard.
- **Colors (HSL is the source of truth; hex is an approximation):**
  - Background: `hsl(220 20% 7%)` ≈ `#0E1217` (deep blue-black)
  - Card / surface: `hsl(220 18% 10%)` ≈ `#151A20`
  - Primary (brand): `hsl(12 90% 55%)` ≈ `#F04E28` (vivid orange-red)
  - Accent: `hsl(28 100% 55%)` ≈ `#FF801A` (bright amber-orange)
  - **Signature gradient:** 135° linear, primary → accent (orange-red → amber). Used on logo text, emphasized words, primary buttons, big stat numbers, active states.
  - Text: near-white `#F2F2F2`; muted secondary text `hsl(220 10% 55%)` ≈ `#7E8590`.
  - Semantic spec badges: gains = emerald (`#34D399` on 10% tint), weight loss = blue (`#60A5FA` tint), added cost = red/destructive (`#F87171` tint).
- **Typography:**
  - Display / headings: **Orbitron** (futuristic, techy). Bold, wide letter-spacing, frequent UPPERCASE for eyebrows/labels.
  - Body / UI: **Inter**.
- **Style motifs (apply throughout):**
  - Glassmorphism: frosted translucent cards (`card @ 60% opacity` + backdrop blur) over dark background.
  - Glow: soft orange glow shadow on primary cards, borders, and CTAs; subtle text-glow on hero headline.
  - Gradient text for the one emphasized word in a headline (e.g. "Know Your **Machine**").
  - Corner radius ~12px (0.75rem). Rounded pill badges for specs.
  - Motion (indicate in design): fade/slide-up on load, gentle pulse-glow on the primary CTA, scale-up + orange glow on selected items, animated delta badges.

## Navigation — Bottom Tab Bar (replaces the web top navbar)
Fixed frosted-glass bottom bar with 5 tabs, active tab shown in the orange gradient with a glow; inactive tabs muted gray. Tabs + icons:
1. **Home** (house)
2. **Explore** (search / magnifier)
3. **Compare** (git-compare arrows) — consider a slightly emphasized center tab
4. **Lab** (wrench) — the Modify / Performance Lab
5. **Garage** (clipboard/garage)

---

## Screen 1 — Home
- Full-bleed hero photo of a sportbike with a left/bottom dark gradient overlay.
- Eyebrow (Orbitron, uppercase, tracked, orange): "THE ULTIMATE MOTORCYCLE PLATFORM".
- Headline: "Know Your **Machine**" (Machine in gradient + glow).
- One-line subtitle: explore specs, compare, modify, track maintenance.
- Two CTAs stacked: **Explore Features** (gradient-filled, pulse-glow) and **Compare Bikes** (glass outline).
- Feature cards (vertical stack or 2-col grid), each = image + gradient icon badge + title + short description:
  1. Explore Motorcycles — browse a large database, filter by brand/engine/displacement.
  2. Compare Side by Side — put bikes head-to-head on hp, torque, weight.
  3. Custom Modifications — try aftermarket parts, see projected performance.
  4. Maintenance Garage — register your bike, track services.
- Stats band (2×2 grid, big gradient numbers): 2,500+ Motorcycles · 150+ Brands · 800+ Aftermarket Parts · 50K+ Spec Data Points.
- Closing CTA glass card with glow: "Start Exploring Today".

## Screen 2 — Explore (planned)
- Sticky search bar at top ("Search motorcycles…").
- Horizontal scrollable filter chips: Brand, Year, Engine type, Displacement, Price. Selected chip = orange gradient.
- Results as a scrollable list/grid of bike cards: photo, brand (orange uppercase), model, 2–3 key specs (hp / top speed), price. Tap → Bike Detail.
- Show an empty state ("No models found") style consistent with the app.

## Screen 3 — Bike Detail (planned)
- Large hero image of the bike, brand + model overlaid, engine subtitle.
- Full spec sheet as clean rows: Engine, Horsepower, Torque, Weight, Top Speed, Price (MSRP), Year.
- Action buttons: **Add to Compare**, **Modify this bike**, **Add to Garage**.

## Screen 4 — Compare
- Title: "Compare **Motorcycles**" + subtitle "Analyze specs side-by-side".
- Up to **3 bike slots**. On mobile, show 2 slots side-by-side at the top with a dashed **"+ Add 3rd Motorcycle"** placeholder card; each filled slot = a small bike-image card with brand/model, a **Change** action and a remove (×) button.
- Bike selector (used inside slots / bottom sheet): two dropdowns **Year** and **Brand** (brand list depends on year), then a **Select Model** dropdown.
- Comparison table optimized for mobile: **one row per spec**, columns = the selected bikes. Sticky left spec-label column, horizontal scroll if 3 bikes. Specs: Engine, Horsepower, Torque, Weight, Top Speed, Price (MSRP), Year.
- Mobile enhancement: highlight the "winner" value per row (e.g. highest hp) with an orange accent.
- Sample data (real bikes to populate mockups):
  - BMW S 1000 RR (2024) — 999cc Inline-4, 210 hp, 113 Nm, 197 kg, 299 km/h, $18,295
  - Yamaha YZF-R1 (2024) — 998cc CP4, 200 hp, 113 Nm, 201 kg, 293 km/h, $18,399
  - Ducati Panigale V4 S (2024) — 1103cc V4, 215.5 hp, 123.6 Nm, 195.5 kg, 299 km/h, $32,195

## Screen 5 — Performance Lab (Modify)
- Title: "Performance **Lab**" + subtitle "Engineer your ultimate machine — apply upgrades, see projected gains in real time."
- Base-bike selector (dropdown / bottom sheet).
- Bike hero card: image + brand + model + engine.
- **Projected Specifications** panel (4 metric rows, each with a colored icon tile + current computed value + a delta badge when a mod is applied):
  - Horsepower (flame, rose) → e.g. `222.5 hp` with `+12.5 hp` green badge
  - Torque (bolt, amber) → e.g. `121 Nm` with `+8 Nm` green badge
  - Dry Weight (weight, blue) → e.g. `190.5 kg` with `-6.5 kg` blue badge
  - Est. Value w/ Mods (banknote, green) → e.g. `$21,095` with `+$2,800` red badge
  - Consider keeping this panel sticky at the top or as a pull-up bottom sheet so gains stay visible while browsing parts.
- **Modification Catalog**, grouped into collapsible sections by category (Exhaust · ECU · Weight · Intake). Each mod = a selectable card: name, short description, and effect badges (+hp, +Nm, −kg, +$). **Only one mod active per category.** Active card = orange border + glow + scale-up + a corner check mark.
- Example mods: Akrapovič Full Titanium Race System (Exhaust, +12.5hp/+8Nm/−6.5kg/+$2,800), Stage 1 ECU Flash (ECU, +15hp/+10Nm/+$600), Full Carbon Fiber Fairings (Weight, −8kg/+$3,200), Sprint Filter P08 (Intake, +3hp/+1.5Nm/+$150).

## Screen 6 — Garage (planned)
- "My **Garage**": list of the user's registered motorcycles (photo, name, "next service in N days" status pill).
- Bike maintenance detail: timeline/log of oil changes, tire swaps, chain adjustments, scheduled services, with status pills — **OK** (green), **Due soon** (amber), **Overdue** (red).
- Floating action button (gradient) to **+ Add motorcycle** / **+ Log service**.
- Upcoming reminders card at the top.

## Deliverable
Cohesive, production-quality mobile screens sharing one design system (colors, Orbitron/Inter type, glass + glow, gradient accents), with the bottom tab bar consistent across all screens. Show at least one interactive state per screen (selected chip, active mod card, applied delta badge, empty state).
