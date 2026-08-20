// ============================================================================
// ALL 118 ELEMENTS OF THE PERIODIC TABLE - COMPREHENSIVE CHEMISTRY DATASET
// ============================================================================

export type ElementCategory = 
  | 'alkali'
  | 'alkaline_earth'
  | 'transition'
  | 'post_transition'
  | 'metalloid'
  | 'reactive_nonmetal'
  | 'noble_gas'
  | 'lanthanide'
  | 'actinide'
  | 'unknown';

export type ElementState = 'solid' | 'liquid' | 'gas' | 'synthetic';
export type ElementBlock = 's' | 'p' | 'd' | 'f';

export interface ChemicalElement {
  number: number;
  symbol: string;
  name: string;
  atomicMass: number;
  category: ElementCategory;
  group: number | null; // null for Lanthanides and Actinides
  period: number;
  block: ElementBlock;
  state: ElementState;
  color: string; // Tailwind bg color for pills
  badgeColor: string; // Hex color for atomic glow
  pH: number; // Typical oxide/solution pH behavior
  electronegativity: number | null; // Pauling scale
  electronConfig: string;
  shells: number[]; // Electrons per shell [K, L, M, N, O, P, Q]
  oxidationStates: string;
  meltingPoint: number | null; // °C
  boilingPoint: number | null; // °C
  density: string; // g/cm³ or g/L
  discoveredBy: string;
  year: number | string;
  summary: string;
  applications: string[];
  gridRow: number;
  gridCol: number;
}

export const CATEGORY_DETAILS: Record<ElementCategory, { name: string; color: string; border: string; text: string; bg: string }> = {
  alkali: { name: 'Alkali Metals', color: '#ef4444', border: 'border-red-500/40', text: 'text-red-400', bg: 'bg-red-500/20' },
  alkaline_earth: { name: 'Alkaline Earth Metals', color: '#f97316', border: 'border-orange-500/40', text: 'text-orange-400', bg: 'bg-orange-500/20' },
  transition: { name: 'Transition Metals', color: '#8b5cf6', border: 'border-purple-500/40', text: 'text-purple-400', bg: 'bg-purple-500/20' },
  post_transition: { name: 'Post-Transition Metals', color: '#3b82f6', border: 'border-blue-500/40', text: 'text-blue-400', bg: 'bg-blue-500/20' },
  metalloid: { name: 'Metalloids', color: '#06b6d4', border: 'border-cyan-500/40', text: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  reactive_nonmetal: { name: 'Reactive Nonmetals', color: '#10b981', border: 'border-emerald-500/40', text: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  noble_gas: { name: 'Noble Gases', color: '#ec4899', border: 'border-pink-500/40', text: 'text-pink-400', bg: 'bg-pink-500/20' },
  lanthanide: { name: 'Lanthanides', color: '#eab308', border: 'border-yellow-500/40', text: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  actinide: { name: 'Actinides', color: '#14b8a6', border: 'border-teal-500/40', text: 'text-teal-400', bg: 'bg-teal-500/20' },
  unknown: { name: 'Unknown / Superheavy', color: '#64748b', border: 'border-slate-500/40', text: 'text-slate-400', bg: 'bg-slate-500/20' },
};

export const ALL_ELEMENTS: ChemicalElement[] = [
  // ── PERIOD 1 ─────────────────────────────────────────────────────────────
  {
    number: 1, symbol: 'H', name: 'Hydrogen', atomicMass: 1.008, category: 'reactive_nonmetal',
    group: 1, period: 1, block: 's', state: 'gas', color: 'bg-emerald-500', badgeColor: '#10b981', pH: 7.0,
    electronegativity: 2.20, electronConfig: '1s¹', shells: [1], oxidationStates: '+1, -1',
    meltingPoint: -259.16, boilingPoint: -252.87, density: '0.08988 g/L', discoveredBy: 'Henry Cavendish', year: 1766,
    summary: 'Lightest and most abundant chemical substance in the universe. Burns with a pop sound to form water.',
    applications: ['Rocket Fuel', 'Ammonia Synthesis', 'Fuel Cells', 'Hydrogenation'],
    gridRow: 1, gridCol: 1
  },
  {
    number: 2, symbol: 'He', name: 'Helium', atomicMass: 4.0026, category: 'noble_gas',
    group: 18, period: 1, block: 's', state: 'gas', color: 'bg-pink-500', badgeColor: '#ec4899', pH: 7.0,
    electronegativity: null, electronConfig: '1s²', shells: [2], oxidationStates: '0',
    meltingPoint: -272.2, boilingPoint: -268.93, density: '0.1786 g/L', discoveredBy: 'Pierre Janssen, Norman Lockyer', year: 1868,
    summary: 'Colorless, odorless, inert noble gas. Second lightest and second most abundant element.',
    applications: ['Cryogenics / MRI Cooling', 'Party Balloons', 'Deep-sea Diving Gas', 'Welding Shield'],
    gridRow: 1, gridCol: 18
  },

  // ── PERIOD 2 ─────────────────────────────────────────────────────────────
  {
    number: 3, symbol: 'Li', name: 'Lithium', atomicMass: 6.94, category: 'alkali',
    group: 1, period: 2, block: 's', state: 'solid', color: 'bg-red-500', badgeColor: '#ef4444', pH: 13.0,
    electronegativity: 0.98, electronConfig: '[He] 2s¹', shells: [2, 1], oxidationStates: '+1',
    meltingPoint: 180.54, boilingPoint: 1342, density: '0.534 g/cm³', discoveredBy: 'Johan August Arfwedson', year: 1817,
    summary: 'Least dense solid element and lightest alkali metal. Highly reactive with crimson flame test.',
    applications: ['Lithium-ion Batteries', 'Mood Stabilizers (Psychiatry)', 'Lubricating Greases', 'Lightweight Alloys'],
    gridRow: 2, gridCol: 1
  },
  {
    number: 4, symbol: 'Be', name: 'Beryllium', atomicMass: 9.0122, category: 'alkaline_earth',
    group: 2, period: 2, block: 's', state: 'solid', color: 'bg-orange-500', badgeColor: '#f97316', pH: 8.5,
    electronegativity: 1.57, electronConfig: '[He] 2s²', shells: [2, 2], oxidationStates: '+2',
    meltingPoint: 1287, boilingPoint: 2469, density: '1.85 g/cm³', discoveredBy: 'Louis-Nicolas Vauquelin', year: 1798,
    summary: 'Steel-gray, strong, lightweight alkaline earth metal. Forms amphoteric oxides (BeO).',
    applications: ['Aerospace Components', 'X-ray Tube Windows', 'Beryllium-Copper Springs', 'Nuclear Reactors'],
    gridRow: 2, gridCol: 2
  },
  {
    number: 5, symbol: 'B', name: 'Boron', atomicMass: 10.81, category: 'metalloid',
    group: 13, period: 2, block: 'p', state: 'solid', color: 'bg-cyan-500', badgeColor: '#06b6d4', pH: 5.5,
    electronegativity: 2.04, electronConfig: '[He] 2s² 2p¹', shells: [2, 3], oxidationStates: '+3',
    meltingPoint: 2076, boilingPoint: 3927, density: '2.34 g/cm³', discoveredBy: 'Joseph Louis Gay-Lussac, Louis Jacques Thénard', year: 1808,
    summary: 'Semimetallic element found in borax and tourmaline. Produces apple-green flame.',
    applications: ['Borosilicate Heat-resistant Glass', 'Fiberglass Insulation', 'Semiconductor Dopant', 'Boron Carbide Armor'],
    gridRow: 2, gridCol: 13
  },
  {
    number: 6, symbol: 'C', name: 'Carbon', atomicMass: 12.011, category: 'reactive_nonmetal',
    group: 14, period: 2, block: 'p', state: 'solid', color: 'bg-slate-600', badgeColor: '#64748b', pH: 6.0,
    electronegativity: 2.55, electronConfig: '[He] 2s² 2p²', shells: [2, 4], oxidationStates: '+4, +2, -4',
    meltingPoint: 3550, boilingPoint: 4827, density: '2.267 g/cm³', discoveredBy: 'Ancient civilizations', year: 'Ancient',
    summary: 'Basis of all organic chemistry and life. Allotropes include Diamond, Graphite, Graphene, and Fullerenes.',
    applications: ['Organic Life Foundation', 'Steel Manufacturing', 'Carbon Fiber', 'Electrodes & Batteries'],
    gridRow: 2, gridCol: 14
  },
  {
    number: 7, symbol: 'N', name: 'Nitrogen', atomicMass: 14.007, category: 'reactive_nonmetal',
    group: 15, period: 2, block: 'p', state: 'gas', color: 'bg-indigo-500', badgeColor: '#6366f1', pH: 7.0,
    electronegativity: 3.04, electronConfig: '[He] 2s² 2p³', shells: [2, 5], oxidationStates: '+5, +4, +3, +2, -3',
    meltingPoint: -210.0, boilingPoint: -195.79, density: '1.251 g/L', discoveredBy: 'Daniel Rutherford', year: 1772,
    summary: 'Makes up 78% of Earth’s atmosphere. Triple bonded N₂ molecule is extremely stable.',
    applications: ['Ammonia / Fertilizers', 'Food Packaging (Inert Gas)', 'Liquid Nitrogen Cryogenics', 'Explosives (TNT, Nitroglycerin)'],
    gridRow: 2, gridCol: 15
  },
  {
    number: 8, symbol: 'O', name: 'Oxygen', atomicMass: 15.999, category: 'reactive_nonmetal',
    group: 16, period: 2, block: 'p', state: 'gas', color: 'bg-rose-500', badgeColor: '#f43f5e', pH: 7.0,
    electronegativity: 3.44, electronConfig: '[He] 2s² 2p⁴', shells: [2, 6], oxidationStates: '-2, -1',
    meltingPoint: -218.79, boilingPoint: -182.96, density: '1.429 g/L', discoveredBy: 'Carl Wilhelm Scheele, Joseph Priestley', year: 1774,
    summary: 'Essential for aerobic respiration and combustion. Makes up 21% of atmosphere and 46% of Earth’s crust.',
    applications: ['Cellular Respiration', 'Steel Smelting', 'Oxy-Acetylene Welding', 'Medical Oxygen Therapy'],
    gridRow: 2, gridCol: 16
  },
  {
    number: 9, symbol: 'F', name: 'Fluorine', atomicMass: 18.998, category: 'reactive_nonmetal',
    group: 17, period: 2, block: 'p', state: 'gas', color: 'bg-emerald-400', badgeColor: '#34d399', pH: 2.0,
    electronegativity: 3.98, electronConfig: '[He] 2s² 2p⁵', shells: [2, 7], oxidationStates: '-1',
    meltingPoint: -219.67, boilingPoint: -188.11, density: '1.696 g/L', discoveredBy: 'Henri Moissan', year: 1886,
    summary: 'Most electronegative and reactive chemical element. Pale yellow gas that attacks glass and water.',
    applications: ['Teflon (PTFE) Non-stick Coatings', 'Toothpaste Fluoride', 'Uranium Enrichment (UF₆)', 'Refrigerants'],
    gridRow: 2, gridCol: 17
  },
  {
    number: 10, symbol: 'Ne', name: 'Neon', atomicMass: 20.180, category: 'noble_gas',
    group: 18, period: 2, block: 'p', state: 'gas', color: 'bg-pink-500', badgeColor: '#ec4899', pH: 7.0,
    electronegativity: null, electronConfig: '[He] 2s² 2p⁶', shells: [2, 8], oxidationStates: '0',
    meltingPoint: -248.59, boilingPoint: -246.05, density: '0.9002 g/L', discoveredBy: 'William Ramsay, Morris Travers', year: 1898,
    summary: 'Inert noble gas that gives a brilliant reddish-orange glow in high-voltage electrical discharge tubes.',
    applications: ['Neon Advertising Signs', 'High-voltage Indicators', 'Cryogenic Refrigerant', 'Gas Lasers (He-Ne)'],
    gridRow: 2, gridCol: 18
  },

  // ── PERIOD 3 ─────────────────────────────────────────────────────────────
  {
    number: 11, symbol: 'Na', name: 'Sodium', atomicMass: 22.990, category: 'alkali',
    group: 1, period: 3, block: 's', state: 'solid', color: 'bg-purple-500', badgeColor: '#a855f7', pH: 14.0,
    electronegativity: 0.93, electronConfig: '[Ne] 3s¹', shells: [2, 8, 1], oxidationStates: '+1',
    meltingPoint: 97.79, boilingPoint: 882.9, density: '0.968 g/cm³', discoveredBy: 'Humphry Davy', year: 1807,
    summary: 'Soft, silvery-white alkali metal. Reacts violently with water releasing H₂ gas and heat with a yellow flame.',
    applications: ['Table Salt (NaCl)', 'Soap Manufacturing (NaOH)', 'Street Lighting (Sodium vapor)', 'Coolant in Fast Nuclear Reactors'],
    gridRow: 3, gridCol: 1
  },
  {
    number: 12, symbol: 'Mg', name: 'Magnesium', atomicMass: 24.305, category: 'alkaline_earth',
    group: 2, period: 3, block: 's', state: 'solid', color: 'bg-slate-300', badgeColor: '#cbd5e1', pH: 10.5,
    electronegativity: 1.31, electronConfig: '[Ne] 3s²', shells: [2, 8, 2], oxidationStates: '+2',
    meltingPoint: 650, boilingPoint: 1091, density: '1.738 g/cm³', discoveredBy: 'Joseph Black, Humphry Davy', year: 1755,
    summary: 'Burns with a dazzling white flame to form Magnesium Oxide (MgO). Central ion in plant chlorophyll.',
    applications: ['Fireworks & Flares', 'Lightweight Structural Alloys', 'Chlorophyll in Plants', 'Antacids (Milk of Magnesia)'],
    gridRow: 3, gridCol: 2
  },
  {
    number: 13, symbol: 'Al', name: 'Aluminium', atomicMass: 26.982, category: 'post_transition',
    group: 13, period: 3, block: 'p', state: 'solid', color: 'bg-blue-400', badgeColor: '#60a5fa', pH: 9.0,
    electronegativity: 1.61, electronConfig: '[Ne] 3s² 3p¹', shells: [2, 8, 3], oxidationStates: '+3',
    meltingPoint: 660.32, boilingPoint: 2470, density: '2.70 g/cm³', discoveredBy: 'Hans Christian Ørsted', year: 1825,
    summary: 'Most abundant metal in Earth’s crust. Forms protective Al₂O₃ oxide layer (anodizing) and amphoteric oxide.',
    applications: ['Aircraft & Automobile Bodies', 'Beverage Cans & Foil', 'Electrical Transmission Lines', 'Thermite Welding'],
    gridRow: 3, gridCol: 13
  },
  {
    number: 14, symbol: 'Si', name: 'Silicon', atomicMass: 28.085, category: 'metalloid',
    group: 14, period: 3, block: 'p', state: 'solid', color: 'bg-cyan-600', badgeColor: '#0891b2', pH: 7.0,
    electronegativity: 1.90, electronConfig: '[Ne] 3s² 3p²', shells: [2, 8, 4], oxidationStates: '+4, -4',
    meltingPoint: 1414, boilingPoint: 3265, density: '2.329 g/cm³', discoveredBy: 'Jöns Jacob Berzelius', year: 1824,
    summary: 'Heart of the semiconductor and computing industry. Second most abundant element in Earth’s crust (silica/sand).',
    applications: ['Computer Microchips', 'Solar Photovoltaic Cells', 'Glass & Concrete', 'Silicone Polymers & Lubricants'],
    gridRow: 3, gridCol: 14
  },
  {
    number: 15, symbol: 'P', name: 'Phosphorus', atomicMass: 30.974, category: 'reactive_nonmetal',
    group: 15, period: 3, block: 'p', state: 'solid', color: 'bg-amber-500', badgeColor: '#f59e0b', pH: 3.0,
    electronegativity: 2.19, electronConfig: '[Ne] 3s² 3p³', shells: [2, 8, 5], oxidationStates: '+5, +3, -3',
    meltingPoint: 44.15, boilingPoint: 280.5, density: '1.823 g/cm³', discoveredBy: 'Hennig Brand', year: 1669,
    summary: 'Exists in White, Red, and Black allotropes. Red phosphorus is used in safety matches; key part of DNA/ATP.',
    applications: ['Agricultural Fertilizers (NPK)', 'Safety Matches', 'DNA/RNA & ATP Backbone', 'Pesticides & Detergents'],
    gridRow: 3, gridCol: 15
  },
  {
    number: 16, symbol: 'S', name: 'Sulfur', atomicMass: 32.06, category: 'reactive_nonmetal',
    group: 16, period: 3, block: 'p', state: 'solid', color: 'bg-yellow-400', badgeColor: '#facc15', pH: 4.0,
    electronegativity: 2.58, electronConfig: '[Ne] 3s² 3p⁴', shells: [2, 8, 6], oxidationStates: '+6, +4, -2',
    meltingPoint: 115.21, boilingPoint: 444.6, density: '2.07 g/cm³', discoveredBy: 'Ancient civilizations', year: 'Ancient',
    summary: 'Bright yellow crystalline solid. Burns with a blue flame producing pungent SO₂ gas. Used to make H₂SO₄.',
    applications: ['Sulfuric Acid Production', 'Rubber Vulcanization', 'Gunpowder & Fireworks', 'Fungicides & Pharmaceuticals'],
    gridRow: 3, gridCol: 16
  },
  {
    number: 17, symbol: 'Cl', name: 'Chlorine', atomicMass: 35.45, category: 'reactive_nonmetal',
    group: 17, period: 3, block: 'p', state: 'gas', color: 'bg-emerald-500', badgeColor: '#10b981', pH: 2.0,
    electronegativity: 3.16, electronConfig: '[Ne] 3s² 3p⁵', shells: [2, 8, 7], oxidationStates: '+7, +5, +3, +1, -1',
    meltingPoint: -101.5, boilingPoint: -34.04, density: '3.2 g/L', discoveredBy: 'Carl Wilhelm Scheele', year: 1774,
    summary: 'Greenish-yellow suffocating toxic gas. Powerful disinfectant and oxidizing agent.',
    applications: ['Drinking Water Disinfection', 'PVC Plastic Pipes', 'Bleaching Powder (CaOCl₂)', 'Hydrochloric Acid Synthesis'],
    gridRow: 3, gridCol: 17
  },
  {
    number: 18, symbol: 'Ar', name: 'Argon', atomicMass: 39.948, category: 'noble_gas',
    group: 18, period: 3, block: 'p', state: 'gas', color: 'bg-pink-500', badgeColor: '#ec4899', pH: 7.0,
    electronegativity: null, electronConfig: '[Ne] 3s² 3p⁶', shells: [2, 8, 8], oxidationStates: '0',
    meltingPoint: -189.34, boilingPoint: -185.85, density: '1.784 g/L', discoveredBy: 'Lord Rayleigh, William Ramsay', year: 1894,
    summary: 'Third most abundant gas in Earth’s atmosphere (0.93%). Inert shielding gas in arc welding and incandescent bulbs.',
    applications: ['Inert Shield Gas in TIG/MIG Welding', 'Incandescent & Fluorescent Bulbs', 'Silicon Wafer Production', 'Insulating Windows'],
    gridRow: 3, gridCol: 18
  },

  // ── PERIOD 4 ─────────────────────────────────────────────────────────────
  {
    number: 19, symbol: 'K', name: 'Potassium', atomicMass: 39.098, category: 'alkali',
    group: 1, period: 4, block: 's', state: 'solid', color: 'bg-purple-600', badgeColor: '#9333ea', pH: 14.0,
    electronegativity: 0.82, electronConfig: '[Ar] 4s¹', shells: [2, 8, 8, 1], oxidationStates: '+1',
    meltingPoint: 63.5, boilingPoint: 759, density: '0.862 g/cm³', discoveredBy: 'Humphry Davy', year: 1807,
    summary: 'Extremely reactive alkali metal. Catches fire spontaneously in water with a lilac (violet) flame.',
    applications: ['NPK Potash Fertilizers', 'Nerve Impulse Conduction in Biology', 'Potassium Hydroxide (KOH) Soaps', 'Gunpowder (KNO₃)'],
    gridRow: 4, gridCol: 1
  },
  {
    number: 20, symbol: 'Ca', name: 'Calcium', atomicMass: 40.078, category: 'alkaline_earth',
    group: 2, period: 4, block: 's', state: 'solid', color: 'bg-stone-400', badgeColor: '#a8a29e', pH: 12.0,
    electronegativity: 1.00, electronConfig: '[Ar] 4s²', shells: [2, 8, 8, 2], oxidationStates: '+2',
    meltingPoint: 842, boilingPoint: 1484, density: '1.55 g/cm³', discoveredBy: 'Humphry Davy', year: 1808,
    summary: 'Essential mineral for bones, teeth, and shells. Forms Quicklime (CaO), Slaked lime (Ca(OH)₂), and Limestone (CaCO₃).',
    applications: ['Bones & Teeth Enamel', 'Cement & Concrete Mortar', 'Limestone & Marble Construction', 'Reducing Agent in Metallurgy'],
    gridRow: 4, gridCol: 2
  },
  {
    number: 21, symbol: 'Sc', name: 'Scandium', atomicMass: 44.956, category: 'transition',
    group: 3, period: 4, block: 'd', state: 'solid', color: 'bg-violet-500', badgeColor: '#8b5cf6', pH: 7.0,
    electronegativity: 1.36, electronConfig: '[Ar] 3d¹ 4s²', shells: [2, 8, 9, 2], oxidationStates: '+3',
    meltingPoint: 1541, boilingPoint: 2836, density: '2.985 g/cm³', discoveredBy: 'Lars Fredrik Nilson', year: 1879,
    summary: 'First d-block transition metal. Used in aerospace aluminum-scandium alloys for fighter jets.',
    applications: ['Aerospace Frameworks', 'High-intensity Metal Halide Stadium Lights', 'Baseball Bats', 'Fuel Cell Solid Electrolytes'],
    gridRow: 4, gridCol: 3
  },
  {
    number: 22, symbol: 'Ti', name: 'Titanium', atomicMass: 47.867, category: 'transition',
    group: 4, period: 4, block: 'd', state: 'solid', color: 'bg-slate-400', badgeColor: '#94a3b8', pH: 7.0,
    electronegativity: 1.54, electronConfig: '[Ar] 3d² 4s²', shells: [2, 8, 10, 2], oxidationStates: '+4, +3, +2',
    meltingPoint: 1668, boilingPoint: 3287, density: '4.506 g/cm³', discoveredBy: 'William Gregor', year: 1791,
    summary: 'Corrosion-resistant metal with highest strength-to-weight ratio. TiO₂ is the brightest white pigment.',
    applications: ['Surgical Implants & Prosthetics', 'Jet Engines & Spacecraft', 'Titanium Dioxide (TiO₂) White Paint & Sunscreen', 'Sports Equipment'],
    gridRow: 4, gridCol: 4
  },
  {
    number: 23, symbol: 'V', name: 'Vanadium', atomicMass: 50.942, category: 'transition',
    group: 5, period: 4, block: 'd', state: 'solid', color: 'bg-amber-600', badgeColor: '#d97706', pH: 6.0,
    electronegativity: 1.63, electronConfig: '[Ar] 3d³ 4s²', shells: [2, 8, 11, 2], oxidationStates: '+5, +4, +3, +2',
    meltingPoint: 1910, boilingPoint: 3407, density: '6.11 g/cm³', discoveredBy: 'Andrés Manuel del Río', year: 1801,
    summary: 'Forms colorful oxidation states: VO₂⁺ (yellow), VO²⁺ (blue), V³⁺ (green), V²⁺ (violet). V₂O₅ is the Contact Process catalyst.',
    applications: ['High-strength Vanadium Steel Tools', 'Vanadium Redox Flow Batteries', 'V₂O₅ Catalyst for Sulfuric Acid', 'Jet Engine Titanium-Vanadium Alloys'],
    gridRow: 4, gridCol: 5
  },
  {
    number: 24, symbol: 'Cr', name: 'Chromium', atomicMass: 51.996, category: 'transition',
    group: 6, period: 4, block: 'd', state: 'solid', color: 'bg-teal-500', badgeColor: '#14b8a6', pH: 5.5,
    electronegativity: 1.66, electronConfig: '[Ar] 3d⁵ 4s¹', shells: [2, 8, 13, 1], oxidationStates: '+6, +3, +2',
    meltingPoint: 1907, boilingPoint: 2671, density: '7.19 g/cm³', discoveredBy: 'Louis Nicolas Vauquelin', year: 1797,
    summary: 'Anomalous electronic configuration (half-filled 3d⁵). Provides shiny chrome electroplating and corrosion resistance in stainless steel.',
    applications: ['Stainless Steel (18% Cr)', 'Chrome Electroplating', 'Potassium Dichromate (K₂Cr₂O₇) Oxidizer', 'Ruby Crystal Red Color'],
    gridRow: 4, gridCol: 6
  },
  {
    number: 25, symbol: 'Mn', name: 'Manganese', atomicMass: 54.938, category: 'transition',
    group: 7, period: 4, block: 'd', state: 'solid', color: 'bg-purple-700', badgeColor: '#7e22ce', pH: 7.0,
    electronegativity: 1.55, electronConfig: '[Ar] 3d⁵ 4s²', shells: [2, 8, 13, 2], oxidationStates: '+7, +4, +2',
    meltingPoint: 1246, boilingPoint: 2061, density: '7.21 g/cm³', discoveredBy: 'Johan Gottlieb Gahn', year: 1774,
    summary: 'Exhibits oxidation states from +2 to +7. KMnO₄ is an intense purple laboratory oxidant.',
    applications: ['KMnO₄ Board Exam Oxidant', 'Steel Deoxidizer & Hardener', 'MnO₂ Dry Cell Battery Depolarizer', 'Photosynthetic Water-Splitting Enzyme'],
    gridRow: 4, gridCol: 7
  },
  {
    number: 26, symbol: 'Fe', name: 'Iron', atomicMass: 55.845, category: 'transition',
    group: 8, period: 4, block: 'd', state: 'solid', color: 'bg-amber-700', badgeColor: '#b45309', pH: 6.0,
    electronegativity: 1.83, electronConfig: '[Ar] 3d⁶ 4s²', shells: [2, 8, 14, 2], oxidationStates: '+3, +2',
    meltingPoint: 1538, boilingPoint: 2862, density: '7.874 g/cm³', discoveredBy: 'Ancient civilizations', year: 'Ancient',
    summary: 'Most used metal in modern civilization. Core of Earth and hemoglobin in blood. Displaces copper from CuSO₄.',
    applications: ['Steel & Construction Infrastructure', 'Hemoglobin Oxygen Transport', 'Haber Process Ammonia Catalyst', 'Magnetic Cores & Motors'],
    gridRow: 4, gridCol: 8
  },
  {
    number: 27, symbol: 'Co', name: 'Cobalt', atomicMass: 58.933, category: 'transition',
    group: 9, period: 4, block: 'd', state: 'solid', color: 'bg-blue-700', badgeColor: '#1d4ed8', pH: 7.0,
    electronegativity: 1.88, electronConfig: '[Ar] 3d⁷ 4s²', shells: [2, 8, 15, 2], oxidationStates: '+3, +2',
    meltingPoint: 1495, boilingPoint: 2927, density: '8.90 g/cm³', discoveredBy: 'Georg Brandt', year: 1735,
    summary: 'Hard, lustrous, silver-gray ferromagnetic metal. Essential in Vitamin B12 (Cobalamin) and EV battery cathodes.',
    applications: ['Lithium-ion EV Batteries', 'Cobalt Blue Pigment in Glass/Ceramics', 'Vitamin B12', 'Alnico Permanent Magnets'],
    gridRow: 4, gridCol: 9
  },
  {
    number: 28, symbol: 'Ni', name: 'Nickel', atomicMass: 58.693, category: 'transition',
    group: 10, period: 4, block: 'd', state: 'solid', color: 'bg-emerald-600', badgeColor: '#059669', pH: 7.0,
    electronegativity: 1.91, electronConfig: '[Ar] 3d⁸ 4s²', shells: [2, 8, 16, 2], oxidationStates: '+2, +3',
    meltingPoint: 1455, boilingPoint: 2730, density: '8.908 g/cm³', discoveredBy: 'Axel Fredrik Cronstedt', year: 1751,
    summary: 'Lustrous transition metal. Catalyst for hydrogenation of vegetable oils into vanaspati ghee.',
    applications: ['Hydrogenation Catalyst for Oils', 'Rechargeable NiMH Batteries', 'Nichrome Heating Elements', 'Stainless Steel Alloys'],
    gridRow: 4, gridCol: 10
  },
  {
    number: 29, symbol: 'Cu', name: 'Copper', atomicMass: 63.546, category: 'transition',
    group: 11, period: 4, block: 'd', state: 'solid', color: 'bg-amber-600', badgeColor: '#d97706', pH: 6.0,
    electronegativity: 1.90, electronConfig: '[Ar] 3d¹⁰ 4s¹', shells: [2, 8, 18, 1], oxidationStates: '+2, +1',
    meltingPoint: 1084.62, boilingPoint: 2562, density: '8.96 g/cm³', discoveredBy: 'Ancient civilizations', year: 'Ancient',
    summary: 'Reddish-brown metal with exceptional electrical and thermal conductivity. Forms blue CuSO₄·5H₂O crystals.',
    applications: ['Electrical Wiring & Motors', 'Brass & Bronze Alloys', 'Blue Vitriol (CuSO₄) Fungicide', 'Piping & Cookware'],
    gridRow: 4, gridCol: 11
  },
  {
    number: 30, symbol: 'Zn', name: 'Zinc', atomicMass: 65.38, category: 'transition',
    group: 12, period: 4, block: 'd', state: 'solid', color: 'bg-slate-400', badgeColor: '#94a3b8', pH: 7.5,
    electronegativity: 1.65, electronConfig: '[Ar] 3d¹⁰ 4s²', shells: [2, 8, 18, 2], oxidationStates: '+2',
    meltingPoint: 419.53, boilingPoint: 907, density: '7.14 g/cm³', discoveredBy: 'Indian metallurgists / Andreas Marggraf', year: 1746,
    summary: 'Bluish-white metal used in galvanization to prevent iron rusting. Reacts with acids to evolve H₂ gas vigorously.',
    applications: ['Galvanization of Iron', 'Zinc-Carbon Batteries', 'Brass Alloy (Cu + Zn)', 'Zinc Oxide Sunscreen & Ointment'],
    gridRow: 4, gridCol: 12
  },
  {
    number: 31, symbol: 'Ga', name: 'Gallium', atomicMass: 69.723, category: 'post_transition',
    group: 13, period: 4, block: 'p', state: 'solid', color: 'bg-indigo-400', badgeColor: '#818cf8', pH: 6.5,
    electronegativity: 1.81, electronConfig: '[Ar] 3d¹⁰ 4s² 4p¹', shells: [2, 8, 18, 3], oxidationStates: '+3',
    meltingPoint: 29.76, boilingPoint: 2204, density: '5.91 g/cm³', discoveredBy: 'Paul-Émile Lecoq de Boisbaudran', year: 1875,
    summary: 'Soft silvery metal that literally melts in the palm of your hand (mp 29.8°C). Mendeleev predicted it as Eka-aluminium.',
    applications: ['Gallium Nitride (GaN) Fast Chargers', 'Gallium Arsenide (GaAs) LEDs & Lasers', 'High-temperature Thermometers', 'Semiconductors'],
    gridRow: 4, gridCol: 13
  },
  {
    number: 32, symbol: 'Ge', name: 'Germanium', atomicMass: 72.630, category: 'metalloid',
    group: 14, period: 4, block: 'p', state: 'solid', color: 'bg-cyan-600', badgeColor: '#0891b2', pH: 7.0,
    electronegativity: 2.01, electronConfig: '[Ar] 3d¹⁰ 4s² 4p²', shells: [2, 8, 18, 4], oxidationStates: '+4, +2',
    meltingPoint: 938.25, boilingPoint: 2833, density: '5.323 g/cm³', discoveredBy: 'Clemens Winkler', year: 1886,
    summary: 'Semiconductor metalloid predicted by Mendeleev as Eka-silicon. Used in fiber optics and night-vision infrared lenses.',
    applications: ['Infrared Optics & Night-vision', 'Fiber-optic Communication Systems', 'Polymerization Catalysts (PET)', 'High-efficiency Solar Cells'],
    gridRow: 4, gridCol: 14
  },
  {
    number: 33, symbol: 'As', name: 'Arsenic', atomicMass: 74.922, category: 'metalloid',
    group: 15, period: 4, block: 'p', state: 'solid', color: 'bg-amber-700', badgeColor: '#b45309', pH: 4.5,
    electronegativity: 2.18, electronConfig: '[Ar] 3d¹⁰ 4s² 4p³', shells: [2, 8, 18, 5], oxidationStates: '+5, +3, -3',
    meltingPoint: 817, boilingPoint: 614, density: '5.776 g/cm³', discoveredBy: 'Albertus Magnus', year: 1250,
    summary: 'Historically notorious poison. In modern industry, arsenic is used as an n-type semiconductor dopant and in GaAs lasers.',
    applications: ['Semiconductor n-type Dopant', 'Gallium Arsenide High-speed ICs', 'Lead-Acid Battery Grid Hardener', 'Wood Preservatives (CCA)'],
    gridRow: 4, gridCol: 15
  },
  {
    number: 34, symbol: 'Se', name: 'Selenium', atomicMass: 78.971, category: 'reactive_nonmetal',
    group: 16, period: 4, block: 'p', state: 'solid', color: 'bg-emerald-600', badgeColor: '#059669', pH: 4.0,
    electronegativity: 2.55, electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁴', shells: [2, 8, 18, 6], oxidationStates: '+6, +4, -2',
    meltingPoint: 221, boilingPoint: 685, density: '4.819 g/cm³', discoveredBy: 'Jöns Jacob Berzelius', year: 1817,
    summary: 'Photoconductive nonmetal whose electrical conductivity increases when exposed to light. Used in photocopiers.',
    applications: ['Photocopying Drums', 'Anti-Dandruff Shampoos (Selenium Sulfide)', 'Glass Decolorizing & Ruby Red Glass', 'Dietary Antioxidant Supplement'],
    gridRow: 4, gridCol: 16
  },
  {
    number: 35, symbol: 'Br', name: 'Bromine', atomicMass: 79.904, category: 'reactive_nonmetal',
    group: 17, period: 4, block: 'p', state: 'liquid', color: 'bg-red-700', badgeColor: '#b91c1c', pH: 2.5,
    electronegativity: 2.96, electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁵', shells: [2, 8, 18, 7], oxidationStates: '+5, +3, +1, -1',
    meltingPoint: -7.2, boilingPoint: 58.8, density: '3.1028 g/cm³', discoveredBy: 'Antoine Jérôme Balard', year: 1826,
    summary: 'Only liquid non-metallic element at room temperature. Dense, fuming reddish-brown liquid with an acrid choking odor.',
    applications: ['Flame Retardants in Electronics', 'Silver Bromide (AgBr) Photographic Film', 'Pharmaceutical Synthesis', 'Water Treatment Biocide'],
    gridRow: 4, gridCol: 17
  },
  {
    number: 36, symbol: 'Kr', name: 'Krypton', atomicMass: 83.798, category: 'noble_gas',
    group: 18, period: 4, block: 'p', state: 'gas', color: 'bg-pink-500', badgeColor: '#ec4899', pH: 7.0,
    electronegativity: 3.00, electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁶', shells: [2, 8, 18, 8], oxidationStates: '+2, 0',
    meltingPoint: -157.36, boilingPoint: -153.22, density: '3.749 g/L', discoveredBy: 'William Ramsay, Morris Travers', year: 1898,
    summary: 'Noble gas giving a whitish glow in discharge tubes. Used in airport runway lighting and high-speed photography flashes.',
    applications: ['Airport Runway Flash Lights', 'Krypton Laser Eye Surgery', 'Insulating Gas in Triple-pane Windows', 'High-speed Photography Bulbs'],
    gridRow: 4, gridCol: 18
  },

  // ── PERIOD 5 ─────────────────────────────────────────────────────────────
  {
    number: 37, symbol: 'Rb', name: 'Rubidium', atomicMass: 85.468, category: 'alkali',
    group: 1, period: 5, block: 's', state: 'solid', color: 'bg-red-600', badgeColor: '#dc2626', pH: 14.0,
    electronegativity: 0.82, electronConfig: '[Kr] 5s¹', shells: [2, 8, 18, 8, 1], oxidationStates: '+1',
    meltingPoint: 39.31, boilingPoint: 688, density: '1.532 g/cm³', discoveredBy: 'Robert Bunsen, Gustav Kirchhoff', year: 1861,
    summary: 'Highly reactive alkali metal named for deep red lines in its atomic spectrum. Ignites spontaneously in air.',
    applications: ['Atomic Clocks (GPS Standard)', 'Photocells & Vacuum Tubes', 'Laser Cooling & Bose-Einstein Condensates', 'Specialty Glasses'],
    gridRow: 5, gridCol: 1
  },
  {
    number: 38, symbol: 'Sr', name: 'Strontium', atomicMass: 87.62, category: 'alkaline_earth',
    group: 2, period: 5, block: 's', state: 'solid', color: 'bg-orange-600', badgeColor: '#ea580c', pH: 12.5,
    electronegativity: 0.95, electronConfig: '[Kr] 5s²', shells: [2, 8, 18, 8, 2], oxidationStates: '+2',
    meltingPoint: 777, boilingPoint: 1382, density: '2.64 g/cm³', discoveredBy: 'Adair Crawford', year: 1790,
    summary: 'Alkaline earth metal that imparts a brilliant deep crimson-red color to fireworks and emergency road flares.',
    applications: ['Crimson Red Fireworks & Flares', 'Strontium Ferrite Ceramic Magnets', 'Toothpaste for Sensitive Teeth', 'Precision Optical Atomic Clocks'],
    gridRow: 5, gridCol: 2
  },
  {
    number: 39, symbol: 'Y', name: 'Yttrium', atomicMass: 88.906, category: 'transition',
    group: 3, period: 5, block: 'd', state: 'solid', color: 'bg-purple-500', badgeColor: '#a855f7', pH: 7.0,
    electronegativity: 1.22, electronConfig: '[Kr] 4d¹ 5s²', shells: [2, 8, 18, 9, 2], oxidationStates: '+3',
    meltingPoint: 1526, boilingPoint: 3345, density: '4.472 g/cm³', discoveredBy: 'Johan Gadolin', year: 1794,
    summary: 'Rare-earth transition metal used in YBCO high-temperature superconductors and Nd:YAG surgical lasers.',
    applications: ['Yttrium Barium Copper Oxide (YBCO) Superconductors', 'Nd:YAG Medical & Industrial Lasers', 'Phosphors for LED Displays', 'Spark Plugs'],
    gridRow: 5, gridCol: 3
  },
  {
    number: 40, symbol: 'Zr', name: 'Zirconium', atomicMass: 91.224, category: 'transition',
    group: 4, period: 5, block: 'd', state: 'solid', color: 'bg-slate-400', badgeColor: '#94a3b8', pH: 7.0,
    electronegativity: 1.33, electronConfig: '[Kr] 4d² 5s²', shells: [2, 8, 18, 10, 2], oxidationStates: '+4',
    meltingPoint: 1855, boilingPoint: 4409, density: '6.52 g/cm³', discoveredBy: 'Martin Heinrich Klaproth', year: 1789,
    summary: 'Corrosion-resistant metal with very low neutron absorption, making it ideal for nuclear reactor fuel rod cladding.',
    applications: ['Nuclear Reactor Fuel Cladding', 'Cubic Zirconia (Diamond Simulant)', 'Ceramic Knives & Dental Crowns', 'Corrosion-resistant Chemical Valves'],
    gridRow: 5, gridCol: 4
  },
  {
    number: 41, symbol: 'Nb', name: 'Niobium', atomicMass: 92.906, category: 'transition',
    group: 5, period: 5, block: 'd', state: 'solid', color: 'bg-slate-400', badgeColor: '#94a3b8', pH: 7.0,
    electronegativity: 1.6, electronConfig: '[Kr] 4d⁴ 5s¹', shells: [2, 8, 18, 12, 1], oxidationStates: '+5, +3',
    meltingPoint: 2477, boilingPoint: 4744, density: '8.57 g/cm³', discoveredBy: 'Charles Hatchett', year: 1801,
    summary: 'Superconducting metal used in MRI scanner electromagnets and high-grade pipeline steels.',
    applications: ['Superconducting MRI & Particle Accelerator Magnets', 'Gas Pipeline Micro-alloyed Steels', 'Rocket Nozzles', 'Jewelry Anodizing'],
    gridRow: 5, gridCol: 5
  },
  {
    number: 42, symbol: 'Mo', name: 'Molybdenum', atomicMass: 95.95, category: 'transition',
    group: 6, period: 5, block: 'd', state: 'solid', color: 'bg-slate-500', badgeColor: '#64748b', pH: 6.5,
    electronegativity: 2.16, electronConfig: '[Kr] 4d⁵ 5s¹', shells: [2, 8, 18, 13, 1], oxidationStates: '+6, +4, +3',
    meltingPoint: 2623, boilingPoint: 4639, density: '10.28 g/cm³', discoveredBy: 'Carl Wilhelm Scheele', year: 1778,
    summary: 'High melting point transition metal. MoS₂ is an industrial high-temperature lubricant. Essential enzyme cofactor (nitrogenase).',
    applications: ['High-temperature Steel Alloys', 'MoS₂ Dry Industrial Lubricant', 'Biological Nitrogen-Fixing Enzymes', 'Petroleum Desulfurization Catalysts'],
    gridRow: 5, gridCol: 6
  },
  {
    number: 43, symbol: 'Tc', name: 'Technetium', atomicMass: 98, category: 'transition',
    group: 7, period: 5, block: 'd', state: 'synthetic', color: 'bg-violet-600', badgeColor: '#7c3aed', pH: 7.0,
    electronegativity: 1.9, electronConfig: '[Kr] 4d⁵ 5s²', shells: [2, 8, 18, 13, 2], oxidationStates: '+7, +4',
    meltingPoint: 2157, boilingPoint: 4265, density: '11.0 g/cm³', discoveredBy: 'Emilio Segrè, Carlo Perrier', year: 1937,
    summary: 'First artificially produced chemical element. Tc-99m is the world’s most widely used medical radioisotope for SPECT scans.',
    applications: ['Nuclear Medicine Diagnostic Imaging (Tc-99m)', 'Corrosion Inhibitor in Steel', 'Beta Radiation Calibration Sources', 'Radiopharmaceutical Research'],
    gridRow: 5, gridCol: 7
  },
  {
    number: 44, symbol: 'Ru', name: 'Ruthenium', atomicMass: 101.07, category: 'transition',
    group: 8, period: 5, block: 'd', state: 'solid', color: 'bg-slate-500', badgeColor: '#64748b', pH: 7.0,
    electronegativity: 2.2, electronConfig: '[Kr] 4d⁷ 5s¹', shells: [2, 8, 18, 15, 1], oxidationStates: '+8, +4, +3',
    meltingPoint: 2334, boilingPoint: 4150, density: '12.45 g/cm³', discoveredBy: 'Karl Ernst Claus', year: 1844,
    summary: 'Rare platinum group metal. Grubbs catalyst for olefin metathesis and wear-resistant electrical contacts.',
    applications: ['Grubbs Olefin Metathesis Catalyst', 'Wear-resistant Electrical Switch Contacts', 'Hard Disk Drive Perpendicular Magnetic Recording', 'Solar Dye Cells'],
    gridRow: 5, gridCol: 8
  },
  {
    number: 45, symbol: 'Rh', name: 'Rhodium', atomicMass: 102.91, category: 'transition',
    group: 9, period: 5, block: 'd', state: 'solid', color: 'bg-slate-400', badgeColor: '#94a3b8', pH: 7.0,
    electronegativity: 2.28, electronConfig: '[Kr] 4d⁸ 5s¹', shells: [2, 8, 18, 16, 1], oxidationStates: '+3',
    meltingPoint: 1964, boilingPoint: 3695, density: '12.41 g/cm³', discoveredBy: 'William Hyde Wollaston', year: 1804,
    summary: 'Extremely precious and corrosion-resistant metal. Chief catalytic converter component reducing harmful vehicle emissions (NOx).',
    applications: ['Automotive 3-Way Catalytic Converters', 'White Gold & Sterling Silver Rhodium Plating', 'Industrial Chemical Catalysts', 'High-temp Thermocouples'],
    gridRow: 5, gridCol: 9
  },
  {
    number: 46, symbol: 'Pd', name: 'Palladium', atomicMass: 106.42, category: 'transition',
    group: 10, period: 5, block: 'd', state: 'solid', color: 'bg-slate-400', badgeColor: '#94a3b8', pH: 7.0,
    electronegativity: 2.20, electronConfig: '[Kr] 4d¹⁰', shells: [2, 8, 18, 18, 0], oxidationStates: '+2, +4, 0',
    meltingPoint: 1554.9, boilingPoint: 2963, density: '12.023 g/cm³', discoveredBy: 'William Hyde Wollaston', year: 1803,
    summary: 'Can absorb up to 900 times its own volume of hydrogen gas! Key catalyst for Suzuki and Heck cross-coupling reactions.',
    applications: ['Cross-Coupling Organic Catalysts (Nobel Prize)', 'Hydrogen Storage & Purification', 'Catalytic Converters', 'Multilayer Ceramic Capacitors'],
    gridRow: 5, gridCol: 10
  },
  {
    number: 47, symbol: 'Ag', name: 'Silver', atomicMass: 107.87, category: 'transition',
    group: 11, period: 5, block: 'd', state: 'solid', color: 'bg-slate-300', badgeColor: '#cbd5e1', pH: 7.0,
    electronegativity: 1.93, electronConfig: '[Kr] 4d¹⁰ 5s¹', shells: [2, 8, 18, 18, 1], oxidationStates: '+1',
    meltingPoint: 961.78, boilingPoint: 2162, density: '10.49 g/cm³', discoveredBy: 'Ancient civilizations', year: 'Ancient',
    summary: 'Highest electrical and thermal conductivity and highest optical reflectivity of all known metals.',
    applications: ['Photovoltaic Solar Paste', 'Jewelry & Silverware', 'Silver Halide Black & White Photography', 'Antibacterial Medical Dressings & Mirrors'],
    gridRow: 5, gridCol: 11
  },
  {
    number: 48, symbol: 'Cd', name: 'Cadmium', atomicMass: 112.41, category: 'transition',
    group: 12, period: 5, block: 'd', state: 'solid', color: 'bg-slate-400', badgeColor: '#94a3b8', pH: 7.0,
    electronegativity: 1.69, electronConfig: '[Kr] 4d¹⁰ 5s²', shells: [2, 8, 18, 18, 2], oxidationStates: '+2',
    meltingPoint: 321.07, boilingPoint: 767, density: '8.65 g/cm³', discoveredBy: 'Karl Samuel Leberecht Hermann, Friedrich Stromeyer', year: 1817,
    summary: 'Soft, toxic heavy metal. Historically used in NiCad rechargeable batteries and vibrant yellow CdS paint pigment.',
    applications: ['Cadmium Telluride (CdTe) Thin-film Solar Panels', 'NiCd Batteries', 'Cadmium Yellow & Red Artist Pigments', 'Nuclear Reactor Control Rods'],
    gridRow: 5, gridCol: 12
  },
  {
    number: 49, symbol: 'In', name: 'Indium', atomicMass: 114.82, category: 'post_transition',
    group: 13, period: 5, block: 'p', state: 'solid', color: 'bg-indigo-300', badgeColor: '#a5b4fc', pH: 7.0,
    electronegativity: 1.78, electronConfig: '[Kr] 4d¹⁰ 5s² 5p¹', shells: [2, 8, 18, 18, 3], oxidationStates: '+3',
    meltingPoint: 156.6, boilingPoint: 2072, density: '7.31 g/cm³', discoveredBy: 'Ferdinand Reich, Hieronymous Theodor Richter', year: 1863,
    summary: 'Very soft metal that produces a high-pitched cry when bent. Indium Tin Oxide (ITO) is the transparent conductor on smartphone touchscreens.',
    applications: ['Indium Tin Oxide (ITO) Touchscreens & Flat Screens', 'Low-melting Solders', 'InGaAs Photodetectors', 'Cryogenic High-vacuum Gaskets'],
    gridRow: 5, gridCol: 13
  },
  {
    number: 50, symbol: 'Sn', name: 'Tin', atomicMass: 118.71, category: 'post_transition',
    group: 14, period: 5, block: 'p', state: 'solid', color: 'bg-slate-300', badgeColor: '#cbd5e1', pH: 7.0,
    electronegativity: 1.96, electronConfig: '[Kr] 4d¹⁰ 5s² 5p²', shells: [2, 8, 18, 18, 4], oxidationStates: '+4, +2',
    meltingPoint: 231.93, boilingPoint: 2602, density: '7.287 g/cm³', discoveredBy: 'Ancient civilizations', year: 'Ancient',
    summary: 'Corrosion-resistant metal used for tin-plating food cans and forming Bronze (Cu + Sn) and Solder (Sn + Pb).',
    applications: ['Tin Plating for Food Cans', 'Electrical Soldering Wire', 'Bronze & Pewter Alloys', 'Float Glass Manufacturing Bath'],
    gridRow: 5, gridCol: 14
  },
  {
    number: 51, symbol: 'Sb', name: 'Antimony', atomicMass: 121.76, category: 'metalloid',
    group: 15, period: 5, block: 'p', state: 'solid', color: 'bg-cyan-700', badgeColor: '#0e7490', pH: 5.5,
    electronegativity: 2.05, electronConfig: '[Kr] 4d¹⁰ 5s² 5p³', shells: [2, 8, 18, 18, 5], oxidationStates: '+5, +3, -3',
    meltingPoint: 630.63, boilingPoint: 1587, density: '6.685 g/cm³', discoveredBy: 'Ancient civilizations', year: 'Ancient',
    summary: 'Lustrous gray metalloid known since antiquity (kohl eyeliner). Used in flame retardants and lead-acid battery plates.',
    applications: ['Antimony Trioxide Flame Retardants', 'Lead-Acid Battery Alloy Hardener', 'Infrared Detectors', 'PET Plastics Polymerization Catalyst'],
    gridRow: 5, gridCol: 15
  },
  {
    number: 52, symbol: 'Te', name: 'Tellurium', atomicMass: 127.60, category: 'metalloid',
    group: 16, period: 5, block: 'p', state: 'solid', color: 'bg-cyan-700', badgeColor: '#0e7490', pH: 5.0,
    electronegativity: 2.1, electronConfig: '[Kr] 4d¹⁰ 5s² 5p⁴', shells: [2, 8, 18, 18, 6], oxidationStates: '+6, +4, -2',
    meltingPoint: 449.51, boilingPoint: 988, density: '6.232 g/cm³', discoveredBy: 'Franz-Joseph Müller von Reichenstein', year: 1782,
    summary: 'Brittle silver-white metalloid. CdTe is used in solar panels; imparts garlic-like odor to human breath upon exposure.',
    applications: ['Cadmium Telluride Solar Panels', 'Thermoelectric Cooling Devices (Bi₂Te₃)', 'Rewritable Optical Discs (CD-RW/DVD-RW)', 'Free-machining Copper Alloys'],
    gridRow: 5, gridCol: 16
  },
  {
    number: 53, symbol: 'I', name: 'Iodine', atomicMass: 126.90, category: 'reactive_nonmetal',
    group: 17, period: 5, block: 'p', state: 'solid', color: 'bg-purple-800', badgeColor: '#6b21a8', pH: 5.0,
    electronegativity: 2.66, electronConfig: '[Kr] 4d¹⁰ 5s² 5p⁵', shells: [2, 8, 18, 18, 7], oxidationStates: '+7, +5, +1, -1',
    meltingPoint: 113.7, boilingPoint: 184.3, density: '4.933 g/cm³', discoveredBy: 'Bernard Courtois', year: 1811,
    summary: 'Sublimes from lustrous dark purple crystals into a gorgeous violet vapor. Turns starch solution deep blue-black.',
    applications: ['Iodized Salt (Prevents Goitre)', 'Tincture of Iodine Antiseptic', 'Thyroid Hormone (Thyroxine) Synthesis', 'Starch Indicator Test'],
    gridRow: 5, gridCol: 17
  },
  {
    number: 54, symbol: 'Xe', name: 'Xenon', atomicMass: 131.29, category: 'noble_gas',
    group: 18, period: 5, block: 'p', state: 'gas', color: 'bg-pink-500', badgeColor: '#ec4899', pH: 7.0,
    electronegativity: 2.60, electronConfig: '[Kr] 4d¹⁰ 5s² 5p⁶', shells: [2, 8, 18, 18, 8], oxidationStates: '+6, +4, +2, 0',
    meltingPoint: -111.7, boilingPoint: -108.12, density: '5.894 g/L', discoveredBy: 'William Ramsay, Morris Travers', year: 1898,
    summary: 'Heavy noble gas that forms stable compounds (XeF₂, XeF₄, XeO₃, discovered by Neil Bartlett in 1962). Propellant in spacecraft ion thrusters.',
    applications: ['Spacecraft Ion Propulsion Thrusters', 'Xenon Arc Headlights & Movie Projectors', 'General Anesthesia (Neuroprotective)', 'Xenon Flash Lamps'],
    gridRow: 5, gridCol: 18
  },

  // ── PERIOD 6 ─────────────────────────────────────────────────────────────
  {
    number: 55, symbol: 'Cs', name: 'Caesium', atomicMass: 132.91, category: 'alkali',
    group: 1, period: 6, block: 's', state: 'liquid', color: 'bg-red-600', badgeColor: '#dc2626', pH: 14.0,
    electronegativity: 0.79, electronConfig: '[Xe] 6s¹', shells: [2, 8, 18, 18, 8, 1], oxidationStates: '+1',
    meltingPoint: 28.44, boilingPoint: 671, density: '1.93 g/cm³', discoveredBy: 'Robert Bunsen, Gustav Kirchhoff', year: 1860,
    summary: 'Most electropositive natural element. Its hyperfine atomic vibration defines the official SI unit of the second (9,192,631,770 Hz).',
    applications: ['International Standard of Time (Cesium Atomic Clocks)', 'Drilling Fluids for Oil Extraction', 'Photoelectric Cells', 'Atomic Magnetometers'],
    gridRow: 6, gridCol: 1
  },
  {
    number: 56, symbol: 'Ba', name: 'Barium', atomicMass: 137.33, category: 'alkaline_earth',
    group: 2, period: 6, block: 's', state: 'solid', color: 'bg-orange-600', badgeColor: '#ea580c', pH: 13.5,
    electronegativity: 0.89, electronConfig: '[Xe] 6s²', shells: [2, 8, 18, 18, 8, 2], oxidationStates: '+2',
    meltingPoint: 727, boilingPoint: 1897, density: '3.51 g/cm³', discoveredBy: 'Carl Wilhelm Scheele, Humphry Davy', year: 1774,
    summary: 'Gives apple-green flame. BaCl₂ reacts with sulfates to form an insoluble milky white precipitate of BaSO₄.',
    applications: ['Barium Sulfate (BaSO₄) GI Tract X-ray Contrast', 'Green Pyrotechnics / Fireworks', 'Drilling Mud Weighting Agent (Barite)', 'Vacuum Tube Getters'],
    gridRow: 6, gridCol: 2
  },

  // ── LANTHANIDES (57 - 71) ────────────────────────────────────────────────
  {
    number: 57, symbol: 'La', name: 'Lanthanum', atomicMass: 138.91, category: 'lanthanide',
    group: null, period: 6, block: 'f', state: 'solid', color: 'bg-yellow-500', badgeColor: '#eab308', pH: 8.0,
    electronegativity: 1.10, electronConfig: '[Xe] 5d¹ 6s²', shells: [2, 8, 18, 18, 9, 2], oxidationStates: '+3',
    meltingPoint: 920, boilingPoint: 3464, density: '6.162 g/cm³', discoveredBy: 'Carl Gustaf Mosander', year: 1839,
    summary: 'Prototypical lanthanide metal. Used in hybrid car NiMH battery anodes and high-refractive-index camera lenses.',
    applications: ['Hybrid Car NiMH Battery Electrodes', 'High-index Low-dispersion Optical Glass', 'Carbon Arc Studio Lighting', 'Petroleum Cracking Catalysts'],
    gridRow: 9, gridCol: 4
  },
  {
    number: 58, symbol: 'Ce', name: 'Cerium', atomicMass: 140.12, category: 'lanthanide',
    group: null, period: 6, block: 'f', state: 'solid', color: 'bg-yellow-500', badgeColor: '#eab308', pH: 8.0,
    electronegativity: 1.12, electronConfig: '[Xe] 4f¹ 5d¹ 6s²', shells: [2, 8, 18, 19, 9, 2], oxidationStates: '+4, +3',
    meltingPoint: 798, boilingPoint: 3443, density: '6.77 g/cm³', discoveredBy: 'Martin Heinrich Klaproth, Jöns Jacob Berzelius', year: 1803,
    summary: 'Most abundant rare-earth element. CeO₂ is an exceptional glass polishing powder and automotive catalytic converter component.',
    applications: ['Mischmetal Flints for Lighters', 'Precision Optical Glass Polishing (CeO₂)', 'Automotive Exhaust Catalysts', 'Self-cleaning Oven Coatings'],
    gridRow: 9, gridCol: 5
  },
  {
    number: 59, symbol: 'Pr', name: 'Praseodymium', atomicMass: 140.91, category: 'lanthanide',
    group: null, period: 6, block: 'f', state: 'solid', color: 'bg-yellow-500', badgeColor: '#eab308', pH: 8.0,
    electronegativity: 1.13, electronConfig: '[Xe] 4f³ 6s²', shells: [2, 8, 18, 21, 8, 2], oxidationStates: '+3, +4',
    meltingPoint: 931, boilingPoint: 3520, density: '6.77 g/cm³', discoveredBy: 'Carl Auer von Welsbach', year: 1885,
    summary: 'Soft, ductile lanthanide. Imparts intense yellow-green color to glass and creates ultra-strong NdFeB permanent magnets.',
    applications: ['NdFeB Super-strength Permanent Magnets', 'Didymium Welder Goggles (Filters Yellow Sodium D-line)', 'Carbon Arc Projector Lighting', 'Aircraft Engine Alloys'],
    gridRow: 9, gridCol: 6
  },
  {
    number: 60, symbol: 'Nd', name: 'Neodymium', atomicMass: 144.24, category: 'lanthanide',
    group: null, period: 6, block: 'f', state: 'solid', color: 'bg-yellow-500', badgeColor: '#eab308', pH: 8.0,
    electronegativity: 1.14, electronConfig: '[Xe] 4f⁴ 6s²', shells: [2, 8, 18, 22, 8, 2], oxidationStates: '+3',
    meltingPoint: 1024, boilingPoint: 3074, density: '7.01 g/cm³', discoveredBy: 'Carl Auer von Welsbach', year: 1885,
    summary: 'King of permanent magnets. Nd₂Fe₁₄B magnets power electric vehicle motors, wind turbines, and audio speakers.',
    applications: ['EV Traction Motors & Wind Turbines', 'Nd:YAG High-power Surgical Lasers', 'Headphones & Acoustic Speakers', 'Hard Disk Drive Actuators'],
    gridRow: 9, gridCol: 7
  },
  {
    number: 61, symbol: 'Pm', name: 'Promethium', atomicMass: 145, category: 'lanthanide',
    group: null, period: 6, block: 'f', state: 'synthetic', color: 'bg-yellow-600', badgeColor: '#ca8a04', pH: 8.0,
    electronegativity: 1.13, electronConfig: '[Xe] 4f⁵ 6s²', shells: [2, 8, 18, 23, 8, 2], oxidationStates: '+3',
    meltingPoint: 1042, boilingPoint: 3000, density: '7.26 g/cm³', discoveredBy: 'Jacob A. Marinsky, Lawrence E. Glendenin, Charles D. Coryell', year: 1945,
    summary: 'Extremely rare radioactive lanthanide with no stable isotopes. Used in nuclear-powered atomic batteries for space probes.',
    applications: ['Atomic Batteries for Pacemakers & Spacecraft', 'Luminous Dials & Instruments', 'Beta Thickness Gauges', 'Portable X-ray Sources'],
    gridRow: 9, gridCol: 8
  },
  {
    number: 62, symbol: 'Sm', name: 'Samarium', atomicMass: 150.36, category: 'lanthanide',
    group: null, period: 6, block: 'f', state: 'solid', color: 'bg-yellow-500', badgeColor: '#eab308', pH: 8.0,
    electronegativity: 1.17, electronConfig: '[Xe] 4f⁶ 6s²', shells: [2, 8, 18, 24, 8, 2], oxidationStates: '+3, +2',
    meltingPoint: 1072, boilingPoint: 1794, density: '7.52 g/cm³', discoveredBy: 'Paul-Émile Lecoq de Boisbaudran', year: 1879,
    summary: 'High-temperature permanent magnets (SmCo) retain magnetic strength above 300°C in defense and aerospace applications.',
    applications: ['Samarium-Cobalt (SmCo) High-temp Magnets', 'Cancer Pain Radiopharmaceutical (Sm-153 Quadramet)', 'Nuclear Reactor Control Rods', 'Chemical Synthesis Catalysts'],
    gridRow: 9, gridCol: 9
  },
  {
    number: 63, symbol: 'Eu', name: 'Europium', atomicMass: 151.96, category: 'lanthanide',
    group: null, period: 6, block: 'f', state: 'solid', color: 'bg-yellow-500', badgeColor: '#eab308', pH: 8.0,
    electronegativity: 1.2, electronConfig: '[Xe] 4f⁷ 6s²', shells: [2, 8, 18, 25, 8, 2], oxidationStates: '+3, +2',
    meltingPoint: 822, boilingPoint: 1529, density: '5.244 g/cm³', discoveredBy: 'Eugène-Anatole Demarçay', year: 1901,
    summary: 'Most reactive lanthanide. Essential red and blue phosphor in TV screens and anti-counterfeiting Euro banknotes.',
    applications: ['Euro Banknote Anti-counterfeiting Fluorescents', 'Red & Blue Phosphors for OLED/LED Screens', 'Quantum Memory Research', 'Nuclear Control Rods'],
    gridRow: 9, gridCol: 10
  },
  {
    number: 64, symbol: 'Gd', name: 'Gadolinium', atomicMass: 157.25, category: 'lanthanide',
    group: null, period: 6, block: 'f', state: 'solid', color: 'bg-yellow-500', badgeColor: '#eab308', pH: 8.0,
    electronegativity: 1.20, electronConfig: '[Xe] 4f⁷ 5d¹ 6s²', shells: [2, 8, 18, 25, 9, 2], oxidationStates: '+3',
    meltingPoint: 1313, boilingPoint: 3273, density: '7.90 g/cm³', discoveredBy: 'Jean Charles Galissard de Marignac', year: 1880,
    summary: 'Paramagnetic element with 7 unpaired electrons. Standard MRI contrast agent and magnetocaloric magnetic refrigeration material.',
    applications: ['MRI Contrast Agents', 'Magnetocaloric Magnetic Refrigerators', 'High-thermal Neutron Capture', 'Scintillation Detectors in PET Scanners'],
    gridRow: 9, gridCol: 11
  },
  {
    number: 65, symbol: 'Tb', name: 'Terbium', atomicMass: 158.93, category: 'lanthanide',
    group: null, period: 6, block: 'f', state: 'solid', color: 'bg-yellow-500', badgeColor: '#eab308', pH: 8.0,
    electronegativity: 1.2, electronConfig: '[Xe] 4f⁹ 6s²', shells: [2, 8, 18, 27, 8, 2], oxidationStates: '+3, +4',
    meltingPoint: 1356, boilingPoint: 3230, density: '8.23 g/cm³', discoveredBy: 'Carl Gustaf Mosander', year: 1843,
    summary: 'Produces bright green luminescence in flat panel displays. Key component of Terfenol-D magnetostrictive sonar transducers.',
    applications: ['Green Phosphors in Trichromatic Lighting', 'Terfenol-D Magnetostrictive Sonar & Actuators', 'Fuel Cell Solid Oxide Electrolytes', 'Magneto-optical Data Storage'],
    gridRow: 9, gridCol: 12
  },
  {
    number: 66, symbol: 'Dy', name: 'Dysprosium', atomicMass: 162.50, category: 'lanthanide',
    group: null, period: 6, block: 'f', state: 'solid', color: 'bg-yellow-500', badgeColor: '#eab308', pH: 8.0,
    electronegativity: 1.22, electronConfig: '[Xe] 4f¹⁰ 6s²', shells: [2, 8, 18, 28, 8, 2], oxidationStates: '+3',
    meltingPoint: 1412, boilingPoint: 2567, density: '8.54 g/cm³', discoveredBy: 'Paul-Émile Lecoq de Boisbaudran', year: 1886,
    summary: 'Possesses highest magnetic strength at cryogenic temperatures. Added to NdFeB magnets to prevent demagnetization in EV motors.',
    applications: ['Heat-stabilizer in EV Neodymium Magnets', 'Nuclear Reactor Control Rods', 'Magnetostrictive Actuators', 'Laser Crystals'],
    gridRow: 9, gridCol: 13
  },
  {
    number: 67, symbol: 'Ho', name: 'Holmium', atomicMass: 164.93, category: 'lanthanide',
    group: null, period: 6, block: 'f', state: 'solid', color: 'bg-yellow-500', badgeColor: '#eab308', pH: 8.0,
    electronegativity: 1.23, electronConfig: '[Xe] 4f¹¹ 6s²', shells: [2, 8, 18, 29, 8, 2], oxidationStates: '+3',
    meltingPoint: 1474, boilingPoint: 2700, density: '8.79 g/cm³', discoveredBy: 'Jacques-Louis Soret, Per Teodor Cleve', year: 1878,
    summary: 'Highest magnetic permeability of any element. Used as magnetic flux concentrators and in Holmium:YAG surgical lasers for kidney stones.',
    applications: ['Holmium:YAG Medical Lasers for Kidney Stones', 'High-field Magnetic Pole Pieces', 'Color Calibration Standards for Spectrophotometers', 'Nuclear Control Rods'],
    gridRow: 9, gridCol: 14
  },
  {
    number: 68, symbol: 'Er', name: 'Erbium', atomicMass: 167.26, category: 'lanthanide',
    group: null, period: 6, block: 'f', state: 'solid', color: 'bg-yellow-500', badgeColor: '#eab308', pH: 8.0,
    electronegativity: 1.24, electronConfig: '[Xe] 4f¹² 6s²', shells: [2, 8, 18, 30, 8, 2], oxidationStates: '+3',
    meltingPoint: 1529, boilingPoint: 2868, density: '9.066 g/cm³', discoveredBy: 'Carl Gustaf Mosander', year: 1843,
    summary: 'Gives pink color to glass and cubic zirconia. Erbium-doped fiber amplifiers (EDFA) power the entire global transoceanic internet fiber optic backbone.',
    applications: ['EDFA Optical Amplifiers for Global Internet', 'Erbium Dental & Cosmetic Laser Surgery', 'Pink Glazes for Porcelain & Glass', 'Nuclear Poison Rods'],
    gridRow: 9, gridCol: 15
  },
  {
    number: 69, symbol: 'Tm', name: 'Thulium', atomicMass: 168.93, category: 'lanthanide',
    group: null, period: 6, block: 'f', state: 'solid', color: 'bg-yellow-500', badgeColor: '#eab308', pH: 8.0,
    electronegativity: 1.25, electronConfig: '[Xe] 4f¹³ 6s²', shells: [2, 8, 18, 31, 8, 2], oxidationStates: '+3, +2',
    meltingPoint: 1545, boilingPoint: 1950, density: '9.32 g/cm³', discoveredBy: 'Per Teodor Cleve', year: 1879,
    summary: 'Second rarest natural lanthanide. Bombarded with neutrons to create portable X-ray sources for remote medicine and dentistry.',
    applications: ['Portable Medical X-ray Sources (Tm-170)', 'High-efficiency Thulium Lasers', 'Anti-counterfeiting Euro Banknote Phosphors', 'Ceramic Superconductors'],
    gridRow: 9, gridCol: 16
  },
  {
    number: 70, symbol: 'Yb', name: 'Ytterbium', atomicMass: 173.05, category: 'lanthanide',
    group: null, period: 6, block: 'f', state: 'solid', color: 'bg-yellow-500', badgeColor: '#eab308', pH: 8.0,
    electronegativity: 1.1, electronConfig: '[Xe] 4f¹⁴ 6s²', shells: [2, 8, 18, 32, 8, 2], oxidationStates: '+3, +2',
    meltingPoint: 824, boilingPoint: 1196, density: '6.90 g/cm³', discoveredBy: 'Jean Charles Galissard de Marignac', year: 1878,
    summary: 'Has fully filled 4f¹⁴ shell. Used in optical atomic clocks that achieve precision of 1 second lost in 10 billion years.',
    applications: ['World-Record Optical Atomic Lattice Clocks', 'Ytterbium Fiber Lasers for Metal Cutting', 'Stress Gauges for Underground Earthquakes', 'Stainless Steel Dopant'],
    gridRow: 9, gridCol: 17
  },
  {
    number: 71, symbol: 'Lu', name: 'Lutetium', atomicMass: 174.97, category: 'lanthanide',
    group: null, period: 6, block: 'd', state: 'solid', color: 'bg-yellow-500', badgeColor: '#eab308', pH: 8.0,
    electronegativity: 1.27, electronConfig: '[Xe] 4f¹⁴ 5d¹ 6s²', shells: [2, 8, 18, 32, 9, 2], oxidationStates: '+3',
    meltingPoint: 1663, boilingPoint: 3402, density: '9.841 g/cm³', discoveredBy: 'Georges Urbain, Carl Auer von Welsbach', year: 1907,
    summary: 'Hardest and densest lanthanide. Lu-177 peptide radioligand therapy revolutionizes targeted cancer treatment.',
    applications: ['Targeted Prostate Cancer Therapy (Lu-177)', 'PET Scanner Scintillation Crystals (LSO)', 'High-refractive Index Immersion Lithography', 'Petroleum Refining Catalysts'],
    gridRow: 9, gridCol: 18
  },

  // ── RESUME PERIOD 6 TRANSITION METALS ────────────────────────────────────
  {
    number: 72, symbol: 'Hf', name: 'Hafnium', atomicMass: 178.49, category: 'transition',
    group: 4, period: 6, block: 'd', state: 'solid', color: 'bg-slate-500', badgeColor: '#64748b', pH: 7.0,
    electronegativity: 1.3, electronConfig: '[Xe] 4f¹⁴ 5d² 6s²', shells: [2, 8, 18, 32, 10, 2], oxidationStates: '+4',
    meltingPoint: 2233, boilingPoint: 4603, density: '13.31 g/cm³', discoveredBy: 'Dirk Coster, George de Hevesy', year: 1923,
    summary: 'Excellent neutron absorber used in nuclear submarine control rods and modern Intel computer microprocessor gate dielectrics.',
    applications: ['Intel Microprocessor High-k Dielectric Gates', 'Nuclear Submarine Control Rods', 'Plasma Arc Welding Electrodes', 'Superalloys for Gas Turbines'],
    gridRow: 6, gridCol: 4
  },
  {
    number: 73, symbol: 'Ta', name: 'Tantalum', atomicMass: 180.95, category: 'transition',
    group: 5, period: 6, block: 'd', state: 'solid', color: 'bg-slate-500', badgeColor: '#64748b', pH: 7.0,
    electronegativity: 1.5, electronConfig: '[Xe] 4f¹⁴ 5d³ 6s²', shells: [2, 8, 18, 32, 11, 2], oxidationStates: '+5',
    meltingPoint: 3017, boilingPoint: 5458, density: '16.69 g/cm³', discoveredBy: 'Anders Gustaf Ekeberg', year: 1802,
    summary: 'Corrosion-immune, high-capacitance metal. Tantalum micro-capacitors are vital components in all smartphones and laptops.',
    applications: ['Smartphone Miniature Tantalum Capacitors', 'Surgical Bone Implants & Cranial Plates', 'Chemical Industry Heat Exchangers', 'Gas Turbine Blades'],
    gridRow: 6, gridCol: 5
  },
  {
    number: 74, symbol: 'W', name: 'Tungsten', atomicMass: 183.84, category: 'transition',
    group: 6, period: 6, block: 'd', state: 'solid', color: 'bg-slate-600', badgeColor: '#475569', pH: 6.5,
    electronegativity: 2.36, electronConfig: '[Xe] 4f¹⁴ 5d⁴ 6s²', shells: [2, 8, 18, 32, 12, 2], oxidationStates: '+6, +4',
    meltingPoint: 3422, boilingPoint: 5555, density: '19.25 g/cm³', discoveredBy: 'Carl Wilhelm Scheele, Juan & Fausto Elhuyar', year: 1781,
    summary: 'Highest melting point of all metals (3422°C). Tungsten carbide (WC) is nearly as hard as diamond.',
    applications: ['Incandescent Light Bulb Filaments', 'Tungsten Carbide Machine Drill Bits & Armor-piercing Ammo', 'TIG Welding Electrodes', 'Rocket Engine Nozzle Liners'],
    gridRow: 6, gridCol: 6
  },
  {
    number: 75, symbol: 'Re', name: 'Rhenium', atomicMass: 186.21, category: 'transition',
    group: 7, period: 6, block: 'd', state: 'solid', color: 'bg-slate-500', badgeColor: '#64748b', pH: 7.0,
    electronegativity: 1.9, electronConfig: '[Xe] 4f¹⁴ 5d⁵ 6s²', shells: [2, 8, 18, 32, 13, 2], oxidationStates: '+7, +4',
    meltingPoint: 3186, boilingPoint: 5596, density: '21.02 g/cm³', discoveredBy: 'Masataka Ogawa, Walter Noddack, Ida Tacke', year: 1925,
    summary: 'Extremely dense, ultra-high-temperature metal. Added to nickel-base superalloys for combustion chambers in commercial jet airliners.',
    applications: ['Commercial Jet Aircraft Engine Turbines', 'Platinum-Rhenium High-octane Gasoline Catalysts', 'Thermocouples up to 2200°C', 'Mass Spectrometer Filaments'],
    gridRow: 6, gridCol: 7
  },
  {
    number: 76, symbol: 'Os', name: 'Osmium', atomicMass: 190.23, category: 'transition',
    group: 8, period: 6, block: 'd', state: 'solid', color: 'bg-slate-700', badgeColor: '#334155', pH: 7.0,
    electronegativity: 2.2, electronConfig: '[Xe] 4f¹⁴ 5d⁶ 6s²', shells: [2, 8, 18, 32, 14, 2], oxidationStates: '+8, +4',
    meltingPoint: 3033, boilingPoint: 5012, density: '22.59 g/cm³', discoveredBy: 'Smithson Tennant', year: 1803,
    summary: 'Densest natural element known (22.59 g/cm³). Osmium tetroxide (OsO₄) is a critical biological electron microscopy stain.',
    applications: ['Biological Electron Microscopy Staining (OsO₄)', 'Fountain Pen Nibs & Instrument Pivots', 'Wear-resistant Electrical Contacts', 'Sharpless Asymmetric Dihydroxylation'],
    gridRow: 6, gridCol: 8
  },
  {
    number: 77, symbol: 'Ir', name: 'Iridium', atomicMass: 192.22, category: 'transition',
    group: 9, period: 6, block: 'd', state: 'solid', color: 'bg-slate-500', badgeColor: '#64748b', pH: 7.0,
    electronegativity: 2.20, electronConfig: '[Xe] 4f¹⁴ 5d⁷ 6s²', shells: [2, 8, 18, 32, 15, 2], oxidationStates: '+4, +3',
    meltingPoint: 2446, boilingPoint: 4428, density: '22.56 g/cm³', discoveredBy: 'Smithson Tennant', year: 1803,
    summary: 'Most corrosion-resistant metal known. Worldwide iridium boundary layer proved the asteroid impact that wiped out the dinosaurs 66 million years ago.',
    applications: ['Proton Exchange Membrane (PEM) Green Hydrogen Electrolyzers', 'Aviation Spark Plugs', 'OLED Phosphorescent Emitters', 'Crucibles for Single-crystal Laser Growth'],
    gridRow: 6, gridCol: 9
  },
  {
    number: 78, symbol: 'Pt', name: 'Platinum', atomicMass: 195.08, category: 'transition',
    group: 10, period: 6, block: 'd', state: 'solid', color: 'bg-slate-300', badgeColor: '#cbd5e1', pH: 7.0,
    electronegativity: 2.28, electronConfig: '[Xe] 4f¹⁴ 5d⁹ 6s¹', shells: [2, 8, 18, 32, 17, 1], oxidationStates: '+4, +2',
    meltingPoint: 1768.3, boilingPoint: 3825, density: '21.45 g/cm³', discoveredBy: 'Antonio de Ulloa', year: 1735,
    summary: 'Noble transition metal. Cisplatin [Pt(NH₃)₂Cl₂] is one of the most effective chemotherapy anti-cancer drugs in history.',
    applications: ['Cisplatin Cancer Chemotherapy', 'Hydrogen Fuel Cell Catalysts', 'Automotive Catalytic Converters', 'Precious Jewelry & Investment'],
    gridRow: 6, gridCol: 10
  },
  {
    number: 79, symbol: 'Au', name: 'Gold', atomicMass: 196.97, category: 'transition',
    group: 11, period: 6, block: 'd', state: 'solid', color: 'bg-amber-400', badgeColor: '#f59e0b', pH: 7.0,
    electronegativity: 2.54, electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', shells: [2, 8, 18, 32, 18, 1], oxidationStates: '+3, +1',
    meltingPoint: 1064.18, boilingPoint: 2856, density: '19.30 g/cm³', discoveredBy: 'Ancient civilizations', year: 'Ancient',
    summary: 'Most malleable and ductile metal. Does not tarnish or react with single acids, but dissolves in Aqua Regia (3HCl + 1HNO₃).',
    applications: ['Corrosion-free Microchip Wire Bonding', 'Gold Reserves & Jewelry', 'James Webb Space Telescope Mirror Gold Coating', 'Astronaut Visor Infrared Shields'],
    gridRow: 6, gridCol: 11
  },
  {
    number: 80, symbol: 'Hg', name: 'Mercury', atomicMass: 200.59, category: 'transition',
    group: 12, period: 6, block: 'd', state: 'liquid', color: 'bg-slate-300', badgeColor: '#cbd5e1', pH: 7.0,
    electronegativity: 2.00, electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s²', shells: [2, 8, 18, 32, 18, 2], oxidationStates: '+2, +1',
    meltingPoint: -38.83, boilingPoint: 356.73, density: '13.534 g/cm³', discoveredBy: 'Ancient civilizations', year: 'Ancient',
    summary: 'Only metallic element that is liquid at standard temperature and pressure (Quicksilver). Forms amalgams with other metals.',
    applications: ['Clinical Thermometers & Barometers', 'Fluorescent Tube Lighting', 'Dental Amalgams (Ag-Hg)', 'Chlor-alkali Mercury Cells'],
    gridRow: 6, gridCol: 12
  },
  {
    number: 81, symbol: 'Tl', name: 'Thallium', atomicMass: 204.38, category: 'post_transition',
    group: 13, period: 6, block: 'p', state: 'solid', color: 'bg-slate-400', badgeColor: '#94a3b8', pH: 10.0,
    electronegativity: 1.62, electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹', shells: [2, 8, 18, 32, 18, 3], oxidationStates: '+1, +3',
    meltingPoint: 304, boilingPoint: 1473, density: '11.85 g/cm³', discoveredBy: 'William Crookes', year: 1861,
    summary: 'Highly toxic post-transition metal. Thallium(I) mimics Potassium (K⁺) in living cells, disrupting enzyme function.',
    applications: ['Cardiac Stress Test Imaging (Tl-201)', 'Infrared Optical Lenses (KRS-5)', 'High-temperature Superconductors', 'Specialty Low-melting Glasses'],
    gridRow: 6, gridCol: 13
  },
  {
    number: 82, symbol: 'Pb', name: 'Lead', atomicMass: 207.2, category: 'post_transition',
    group: 14, period: 6, block: 'p', state: 'solid', color: 'bg-slate-500', badgeColor: '#64748b', pH: 7.0,
    electronegativity: 2.33, electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²', shells: [2, 8, 18, 32, 18, 4], oxidationStates: '+2, +4',
    meltingPoint: 327.46, boilingPoint: 1749, density: '11.34 g/cm³', discoveredBy: 'Ancient civilizations', year: 'Ancient',
    summary: 'Dense, soft, corrosion-resistant heavy metal. Reacts with KI to precipitate brilliant yellow Lead Iodide (PbI₂).',
    applications: ['Automobile Lead-Acid Batteries', 'X-ray & Radiation Radiation Shielding', 'Perovskite Solar Cells (CH₃NH₃PbI₃)', 'Acoustic Soundproofing'],
    gridRow: 6, gridCol: 14
  },
  {
    number: 83, symbol: 'Bi', name: 'Bismuth', atomicMass: 208.98, category: 'post_transition',
    group: 15, period: 6, block: 'p', state: 'solid', color: 'bg-purple-400', badgeColor: '#c084fc', pH: 7.0,
    electronegativity: 2.02, electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³', shells: [2, 8, 18, 32, 18, 5], oxidationStates: '+3, +5',
    meltingPoint: 271.4, boilingPoint: 1564, density: '9.78 g/cm³', discoveredBy: 'Claude François Geoffroy', year: 1753,
    summary: 'Forms magnificent iridescent spiral-stepped rainbow hopper crystals due to surface oxide interference. Non-toxic heavy metal.',
    applications: ['Pepto-Bismol Stomach Relief (Bismuth Subsalicylate)', 'Low-melting Fire Sprinkler Alloys (Wood’s Metal)', 'Lead-free Plumbing Solders', 'Cosmetics Shimmer'],
    gridRow: 6, gridCol: 15
  },
  {
    number: 84, symbol: 'Po', name: 'Polonium', atomicMass: 209, category: 'post_transition',
    group: 16, period: 6, block: 'p', state: 'solid', color: 'bg-indigo-600', badgeColor: '#4f46e5', pH: 7.0,
    electronegativity: 2.0, electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴', shells: [2, 8, 18, 32, 18, 6], oxidationStates: '+4, +2',
    meltingPoint: 254, boilingPoint: 962, density: '9.196 g/cm³', discoveredBy: 'Marie & Pierre Curie', year: 1898,
    summary: 'Discovered by Marie Curie and named after her homeland Poland. Intense alpha emitter generating sufficient self-heat to glow blue.',
    applications: ['Radioisotope Thermoelectric Generators (RTGs) in Space', 'Anti-static Brushes for Photographic Film', 'Neutron Trigger Initiators', 'Physics Research'],
    gridRow: 6, gridCol: 16
  },
  {
    number: 85, symbol: 'At', name: 'Astatine', atomicMass: 210, category: 'metalloid',
    group: 17, period: 6, block: 'p', state: 'solid', color: 'bg-emerald-800', badgeColor: '#065f46', pH: 5.0,
    electronegativity: 2.2, electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵', shells: [2, 8, 18, 32, 18, 7], oxidationStates: '+7, +5, +3, +1, -1',
    meltingPoint: 302, boilingPoint: 337, density: '6.4 g/cm³', discoveredBy: 'Dale R. Corson, Kenneth Ross MacKenzie, Emilio Segrè', year: 1940,
    summary: 'Rarest naturally occurring element in Earth’s crust (< 30 grams total worldwide). At-211 is under research for targeted alpha cancer therapy.',
    applications: ['Targeted Alpha Particle Cancer Therapy (At-211)', 'Radiochemistry Tracers', 'Fundamental Halogen Research'],
    gridRow: 6, gridCol: 17
  },
  {
    number: 86, symbol: 'Rn', name: 'Radon', atomicMass: 222, category: 'noble_gas',
    group: 18, period: 6, block: 'p', state: 'gas', color: 'bg-pink-600', badgeColor: '#db2777', pH: 7.0,
    electronegativity: 2.2, electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶', shells: [2, 8, 18, 32, 18, 8], oxidationStates: '+2, 0',
    meltingPoint: -71, boilingPoint: -61.7, density: '9.73 g/L', discoveredBy: 'Friedrich Ernst Dorn', year: 1900,
    summary: 'Radioactive, colorless, odorless noble gas produced by uranium decay in granite soils. Major cause of lung cancer in non-smokers.',
    applications: ['Earthquake Prediction Groundwater Tracers', 'Hydrological Hydrology Flow Studies', 'Historical Cancer Radiation Seeds'],
    gridRow: 6, gridCol: 18
  },

  // ── PERIOD 7 ─────────────────────────────────────────────────────────────
  {
    number: 87, symbol: 'Fr', name: 'Francium', atomicMass: 223, category: 'alkali',
    group: 1, period: 7, block: 's', state: 'solid', color: 'bg-red-700', badgeColor: '#b91c1c', pH: 14.0,
    electronegativity: 0.7, electronConfig: '[Rn] 7s¹', shells: [2, 8, 18, 32, 18, 8, 1], oxidationStates: '+1',
    meltingPoint: 27, boilingPoint: 677, density: '1.87 g/cm³', discoveredBy: 'Marguerite Perey', year: 1939,
    summary: 'Second rarest natural element. Discovered at the Curie Institute by Marguerite Perey. Half-life is just 22 minutes.',
    applications: ['Atomic Physics Laser Trapping', 'Quantum Electrodynamics Weak Force Testing', 'Subatomic Spectroscopy'],
    gridRow: 7, gridCol: 1
  },
  {
    number: 88, symbol: 'Ra', name: 'Radium', atomicMass: 226, category: 'alkaline_earth',
    group: 2, period: 7, block: 's', state: 'solid', color: 'bg-orange-700', badgeColor: '#c2410c', pH: 13.0,
    electronegativity: 0.9, electronConfig: '[Rn] 7s²', shells: [2, 8, 18, 32, 18, 8, 2], oxidationStates: '+2',
    meltingPoint: 700, boilingPoint: 1737, density: '5.5 g/cm³', discoveredBy: 'Marie & Pierre Curie', year: 1898,
    summary: 'Intensely radioactive alkaline earth metal that glows pale blue in the dark. Ra-223 (Xofigo) treats prostate cancer bone metastases.',
    applications: ['Targeted Bone Cancer Radiotherapy (Ra-223 Xofigo)', 'Historical Self-luminous Clock Paint', 'Neutron Calibration Sources'],
    gridRow: 7, gridCol: 2
  },

  // ── ACTINIDES (89 - 103) ────────────────────────────────────────────────
  {
    number: 89, symbol: 'Ac', name: 'Actinium', atomicMass: 227, category: 'actinide',
    group: null, period: 7, block: 'f', state: 'solid', color: 'bg-teal-600', badgeColor: '#0d9488', pH: 8.0,
    electronegativity: 1.1, electronConfig: '[Rn] 6d¹ 7s²', shells: [2, 8, 18, 32, 18, 9, 2], oxidationStates: '+3',
    meltingPoint: 1050, boilingPoint: 3200, density: '10.07 g/cm³', discoveredBy: 'Friedrich Oskar Giesel', year: 1902,
    summary: 'Glows with an eerie blue light due to intense radioactivity ionizing the surrounding air. Ac-225 powers revolutionary targeted alpha cancer drugs.',
    applications: ['Targeted Alpha Therapy for Cancer (Ac-225)', 'Neutron Sources in Radiochemistry', 'Thermoelectric Power Generators'],
    gridRow: 10, gridCol: 4
  },
  {
    number: 90, symbol: 'Th', name: 'Thorium', atomicMass: 232.04, category: 'actinide',
    group: null, period: 7, block: 'f', state: 'solid', color: 'bg-teal-600', badgeColor: '#0d9488', pH: 7.0,
    electronegativity: 1.3, electronConfig: '[Rn] 6d² 7s²', shells: [2, 8, 18, 32, 18, 10, 2], oxidationStates: '+4',
    meltingPoint: 1750, boilingPoint: 4788, density: '11.72 g/cm³', discoveredBy: 'Jöns Jacob Berzelius', year: 1829,
    summary: 'Abundant weakly radioactive actinide. Safer, proliferation-resistant nuclear fuel cycle candidate (Thorium-232 / Uranium-233).',
    applications: ['Next-Generation Thorium Nuclear Power Reactors', 'High-temperature Tungsten Welding Electrodes', 'High-refractive Index Camera Lenses', 'Gas Lantern Mantles'],
    gridRow: 10, gridCol: 5
  },
  {
    number: 91, symbol: 'Pa', name: 'Protactinium', atomicMass: 231.04, category: 'actinide',
    group: null, period: 7, block: 'f', state: 'solid', color: 'bg-teal-600', badgeColor: '#0d9488', pH: 7.0,
    electronegativity: 1.5, electronConfig: '[Rn] 5f² 6d¹ 7s²', shells: [2, 8, 18, 32, 20, 9, 2], oxidationStates: '+5, +4',
    meltingPoint: 1568, boilingPoint: 4027, density: '15.37 g/cm³', discoveredBy: 'Kasimir Fajans, Oswald Helmuth Göhring', year: 1913,
    summary: 'Dense radioactive actinide intermediate formed in the Thorium-232 nuclear breeding cycle.',
    applications: ['Nuclear Geology Ocean Sediment Dating (Pa-231)', 'Thorium Nuclear Fuel Cycle Research'],
    gridRow: 10, gridCol: 6
  },
  {
    number: 92, symbol: 'U', name: 'Uranium', atomicMass: 238.03, category: 'actinide',
    group: null, period: 7, block: 'f', state: 'solid', color: 'bg-teal-500', badgeColor: '#14b8a6', pH: 6.0,
    electronegativity: 1.38, electronConfig: '[Rn] 5f³ 6d¹ 7s²', shells: [2, 8, 18, 32, 21, 9, 2], oxidationStates: '+6, +4',
    meltingPoint: 1132.2, boilingPoint: 4131, density: '19.1 g/cm³', discoveredBy: 'Martin Heinrich Klaproth', year: 1789,
    summary: 'Heavy metal that fuels commercial nuclear power plants worldwide via neutron-induced fission of Uranium-235.',
    applications: ['Commercial Nuclear Power Fission (U-235)', 'Naval Nuclear Submarine Propulsion', 'Armor-piercing Tank Munitions (Depleted U)', 'Vaseline Glass Yellow-Green Glow'],
    gridRow: 10, gridCol: 7
  },
  {
    number: 93, symbol: 'Np', name: 'Neptunium', atomicMass: 237, category: 'actinide',
    group: null, period: 7, block: 'f', state: 'synthetic', color: 'bg-teal-700', badgeColor: '#0f766e', pH: 6.5,
    electronegativity: 1.36, electronConfig: '[Rn] 5f⁴ 6d¹ 7s²', shells: [2, 8, 18, 32, 22, 9, 2], oxidationStates: '+5, +4, +3',
    meltingPoint: 644, boilingPoint: 3902, density: '20.45 g/cm³', discoveredBy: 'Edwin McMillan, Philip H. Abelson', year: 1940,
    summary: 'First transuranic element ever created artificially. Precursor for synthesizing Plutonium-238 space batteries.',
    applications: ['Precursor for Pu-238 Deep-space Radioisotope Power', 'High-energy Neutron Detectors', 'Nuclear Physics Research'],
    gridRow: 10, gridCol: 8
  },
  {
    number: 94, symbol: 'Pu', name: 'Plutonium', atomicMass: 244, category: 'actinide',
    group: null, period: 7, block: 'f', state: 'synthetic', color: 'bg-teal-700', badgeColor: '#0f766e', pH: 6.0,
    electronegativity: 1.28, electronConfig: '[Rn] 5f⁶ 7s²', shells: [2, 8, 18, 32, 24, 8, 2], oxidationStates: '+4, +3, +6',
    meltingPoint: 639.4, boilingPoint: 3228, density: '19.86 g/cm³', discoveredBy: 'Glenn T. Seaborg, Edwin McMillan, Joseph W. Kennedy, Arthur Wahl', year: 1940,
    summary: 'Fissile element (Pu-239) and radioisotope thermoelectric generator power source (Pu-238) powering NASA’s Curiosity and Perseverance Mars rovers.',
    applications: ['NASA Mars Rover & Voyager Spacecraft RTG Power (Pu-238)', 'Nuclear Power MOX Fuels', 'Fast Breeder Nuclear Reactors'],
    gridRow: 10, gridCol: 9
  },
  {
    number: 95, symbol: 'Am', name: 'Americium', atomicMass: 243, category: 'actinide',
    group: null, period: 7, block: 'f', state: 'synthetic', color: 'bg-teal-700', badgeColor: '#0f766e', pH: 7.0,
    electronegativity: 1.3, electronConfig: '[Rn] 5f⁷ 7s²', shells: [2, 8, 18, 32, 25, 8, 2], oxidationStates: '+3, +4',
    meltingPoint: 1176, boilingPoint: 2607, density: '12 g/cm³', discoveredBy: 'Glenn T. Seaborg, Ralph A. James, Leon O. Morgan, Albert Ghiorso', year: 1944,
    summary: 'Synthetic actinide present in millions of household ionization smoke detectors (Am-241).',
    applications: ['Household Smoke Detectors (Am-241)', 'Industrial Fluid Level & Thickness Gauges', 'Neutron Moisture Gauges in Construction'],
    gridRow: 10, gridCol: 10
  },
  {
    number: 96, symbol: 'Cm', name: 'Curium', atomicMass: 247, category: 'actinide',
    group: null, period: 7, block: 'f', state: 'synthetic', color: 'bg-teal-700', badgeColor: '#0f766e', pH: 7.0,
    electronegativity: 1.3, electronConfig: '[Rn] 5f⁷ 6d¹ 7s²', shells: [2, 8, 18, 32, 25, 9, 2], oxidationStates: '+3, +4',
    meltingPoint: 1345, boilingPoint: 3110, density: '13.51 g/cm³', discoveredBy: 'Glenn T. Seaborg, Ralph A. James, Albert Ghiorso', year: 1944,
    summary: 'Named in honor of Marie and Pierre Curie. Alpha source on Alpha Particle X-ray Spectrometers (APXS) examining Martian rocks.',
    applications: ['Mars Rover APXS Elemental Rock Analyzers (Cm-244)', 'Heat Source for Space Probes', 'Heavy Superheavy Element Synthesis Target'],
    gridRow: 10, gridCol: 11
  },
  {
    number: 97, symbol: 'Bk', name: 'Berkelium', atomicMass: 247, category: 'actinide',
    group: null, period: 7, block: 'f', state: 'synthetic', color: 'bg-teal-700', badgeColor: '#0f766e', pH: 7.0,
    electronegativity: 1.3, electronConfig: '[Rn] 5f⁹ 7s²', shells: [2, 8, 18, 32, 27, 8, 2], oxidationStates: '+3, +4',
    meltingPoint: 986, boilingPoint: 2627, density: '14.78 g/cm³', discoveredBy: 'Stanley G. Thompson, Albert Ghiorso, Glenn T. Seaborg', year: 1949,
    summary: 'Created at UC Berkeley. Target material (Bk-249) used to synthesize Tennessine (element 117).',
    applications: ['Target Material to Discover Tennessine (Element 117)', 'Actinide Coordination Chemistry Research'],
    gridRow: 10, gridCol: 12
  },
  {
    number: 98, symbol: 'Cf', name: 'Californium', atomicMass: 251, category: 'actinide',
    group: null, period: 7, block: 'f', state: 'synthetic', color: 'bg-teal-700', badgeColor: '#0f766e', pH: 7.0,
    electronegativity: 1.3, electronConfig: '[Rn] 5f¹⁰ 7s²', shells: [2, 8, 18, 32, 28, 8, 2], oxidationStates: '+3',
    meltingPoint: 900, boilingPoint: 1470, density: '15.1 g/cm³', discoveredBy: 'Stanley G. Thompson, Kenneth Street Jr., Albert Ghiorso, Glenn T. Seaborg', year: 1950,
    summary: 'Prodigious spontaneous emitter of neutrons (Cf-252 emits 170 million neutrons per minute per microgram).',
    applications: ['Neutron Startup Sources for Nuclear Reactors', 'Oil Well Neutron Logging', 'Airport Luggage Explosives & Drug Detectors', 'Cervical Cancer Brachytherapy'],
    gridRow: 10, gridCol: 13
  },
  {
    number: 99, symbol: 'Es', name: 'Einsteinium', atomicMass: 252, category: 'actinide',
    group: null, period: 7, block: 'f', state: 'synthetic', color: 'bg-teal-700', badgeColor: '#0f766e', pH: 7.0,
    electronegativity: 1.3, electronConfig: '[Rn] 5f¹¹ 7s²', shells: [2, 8, 18, 32, 29, 8, 2], oxidationStates: '+3',
    meltingPoint: 860, boilingPoint: 996, density: '8.84 g/cm³', discoveredBy: 'Albert Ghiorso et al.', year: 1952,
    summary: 'Discovered in the radioactive debris of the Ivy Mike thermonuclear hydrogen bomb test on Enewetak Atoll. Named after Albert Einstein.',
    applications: ['Synthesis of Mendelevium (Element 101)', 'Fundamental Heavy Actinide Physical & Bond Research'],
    gridRow: 10, gridCol: 14
  },
  {
    number: 100, symbol: 'Fm', name: 'Fermium', atomicMass: 257, category: 'actinide',
    group: null, period: 7, block: 'f', state: 'synthetic', color: 'bg-teal-700', badgeColor: '#0f766e', pH: 7.0,
    electronegativity: 1.3, electronConfig: '[Rn] 5f¹² 7s²', shells: [2, 8, 18, 32, 30, 8, 2], oxidationStates: '+3',
    meltingPoint: 1527, boilingPoint: null, density: '9.7 g/cm³', discoveredBy: 'Albert Ghiorso et al.', year: 1952,
    summary: 'Heaviest element that can be prepared in weighable macro-quantities by neutron bombardment in nuclear reactors. Named after Enrico Fermi.',
    applications: ['Nuclear Physics & Spontaneous Fission Studies', 'Heavy Actinide Coordination Chemistry'],
    gridRow: 10, gridCol: 15
  },
  {
    number: 101, symbol: 'Md', name: 'Mendelevium', atomicMass: 258, category: 'actinide',
    group: null, period: 7, block: 'f', state: 'synthetic', color: 'bg-teal-700', badgeColor: '#0f766e', pH: 7.0,
    electronegativity: 1.3, electronConfig: '[Rn] 5f¹³ 7s²', shells: [2, 8, 18, 32, 31, 8, 2], oxidationStates: '+3, +2',
    meltingPoint: 827, boilingPoint: null, density: '10.3 g/cm³', discoveredBy: 'Albert Ghiorso, Glenn T. Seaborg, Bernard G. Harvey, Gregory R. Choppin, Stanley G. Thompson', year: 1955,
    summary: 'First element synthesized one atom at a time. Named in honor of Dmitri Mendeleev, father of the Periodic Table.',
    applications: ['One-atom-at-a-time Heavy Element Physical Chemistry Studies'],
    gridRow: 10, gridCol: 16
  },
  {
    number: 102, symbol: 'No', name: 'Nobelium', atomicMass: 259, category: 'actinide',
    group: null, period: 7, block: 'f', state: 'synthetic', color: 'bg-teal-700', badgeColor: '#0f766e', pH: 7.0,
    electronegativity: 1.3, electronConfig: '[Rn] 5f¹⁴ 7s²', shells: [2, 8, 18, 32, 32, 8, 2], oxidationStates: '+2, +3',
    meltingPoint: 827, boilingPoint: null, density: '9.9 g/cm³', discoveredBy: 'Joint Institute for Nuclear Research / Lawrence Berkeley Lab', year: 1966,
    summary: 'Named in honor of Alfred Nobel, inventor of dynamite and founder of the Nobel Prizes.',
    applications: ['Actinide Relativistic Electron Configuration Studies'],
    gridRow: 10, gridCol: 17
  },
  {
    number: 103, symbol: 'Lr', name: 'Lawrencium', atomicMass: 266, category: 'actinide',
    group: null, period: 7, block: 'd', state: 'synthetic', color: 'bg-teal-700', badgeColor: '#0f766e', pH: 7.0,
    electronegativity: 1.3, electronConfig: '[Rn] 5f¹⁴ 7s² 7p¹', shells: [2, 8, 18, 32, 32, 8, 3], oxidationStates: '+3',
    meltingPoint: 1627, boilingPoint: null, density: '14.4 g/cm³', discoveredBy: 'Albert Ghiorso et al. at Lawrence Berkeley Laboratory', year: 1961,
    summary: 'Final member of the actinide series. Demonstrates relativistic 7p subshell electron stabilization.',
    applications: ['Relativistic Quantum Chemistry Verification'],
    gridRow: 10, gridCol: 18
  },

  // ── TRANSACTINIDE / SUPERHEAVY ELEMENTS (104 - 118) ──────────────────────
  {
    number: 104, symbol: 'Rf', name: 'Rutherfordium', atomicMass: 267, category: 'transition',
    group: 4, period: 7, block: 'd', state: 'synthetic', color: 'bg-slate-600', badgeColor: '#475569', pH: 7.0,
    electronegativity: null, electronConfig: '[Rn] 5f¹⁴ 6d² 7s²', shells: [2, 8, 18, 32, 32, 10, 2], oxidationStates: '+4',
    meltingPoint: 2100, boilingPoint: 5500, density: '23.2 g/cm³', discoveredBy: 'JINR Dubna & Lawrence Berkeley Lab', year: 1969,
    summary: 'First transactinide element. Named after Ernest Rutherford, father of nuclear physics.',
    applications: ['Transactinide Gas-phase Chemical Chromatography'],
    gridRow: 7, gridCol: 4
  },
  {
    number: 105, symbol: 'Db', name: 'Dubnium', atomicMass: 268, category: 'transition',
    group: 5, period: 7, block: 'd', state: 'synthetic', color: 'bg-slate-600', badgeColor: '#475569', pH: 7.0,
    electronegativity: null, electronConfig: '[Rn] 5f¹⁴ 6d³ 7s²', shells: [2, 8, 18, 32, 32, 11, 2], oxidationStates: '+5',
    meltingPoint: null, boilingPoint: null, density: '29.3 g/cm³', discoveredBy: 'JINR Dubna & Lawrence Berkeley Lab', year: 1970,
    summary: 'Named after Dubna, Russia, home of the Joint Institute for Nuclear Research (JINR).',
    applications: ['Heavy Element Group 5 Chemical Homology Research'],
    gridRow: 7, gridCol: 5
  },
  {
    number: 106, symbol: 'Sg', name: 'Seaborgium', atomicMass: 269, category: 'transition',
    group: 6, period: 7, block: 'd', state: 'synthetic', color: 'bg-slate-600', badgeColor: '#475569', pH: 7.0,
    electronegativity: null, electronConfig: '[Rn] 5f¹⁴ 6d⁴ 7s²', shells: [2, 8, 18, 32, 32, 12, 2], oxidationStates: '+6',
    meltingPoint: null, boilingPoint: null, density: '35.0 g/cm³', discoveredBy: 'Lawrence Berkeley National Laboratory', year: 1974,
    summary: 'First element named after a living person at the time (Glenn T. Seaborg, discoverer of 10 transuranic elements).',
    applications: ['Superheavy Carbonyl Complex Chemistry [Sg(CO)₆]'],
    gridRow: 7, gridCol: 6
  },
  {
    number: 107, symbol: 'Bh', name: 'Bohrium', atomicMass: 270, category: 'transition',
    group: 7, period: 7, block: 'd', state: 'synthetic', color: 'bg-slate-600', badgeColor: '#475569', pH: 7.0,
    electronegativity: null, electronConfig: '[Rn] 5f¹⁴ 6d⁵ 7s²', shells: [2, 8, 18, 32, 32, 13, 2], oxidationStates: '+7',
    meltingPoint: null, boilingPoint: null, density: '37.1 g/cm³', discoveredBy: 'GSI Helmholtz Centre, Darmstadt, Germany', year: 1981,
    summary: 'Named in honor of Niels Bohr, father of quantum atomic theory.',
    applications: ['Volatile Superheavy Oxychloride Synthesis [BhO₃Cl]'],
    gridRow: 7, gridCol: 7
  },
  {
    number: 108, symbol: 'Hs', name: 'Hassium', atomicMass: 269, category: 'transition',
    group: 8, period: 7, block: 'd', state: 'synthetic', color: 'bg-slate-600', badgeColor: '#475569', pH: 7.0,
    electronegativity: null, electronConfig: '[Rn] 5f¹⁴ 6d⁶ 7s²', shells: [2, 8, 18, 32, 32, 14, 2], oxidationStates: '+8',
    meltingPoint: null, boilingPoint: null, density: '40.7 g/cm³', discoveredBy: 'GSI Helmholtz Centre, Darmstadt, Germany', year: 1984,
    summary: 'Named after the German state of Hesse (Hassia in Latin). Forms volatile tetroxide compound HsO₄ analogous to OsO₄.',
    applications: ['Group 8 Transactinide Thermochromatography [HsO₄]'],
    gridRow: 7, gridCol: 8
  },
  {
    number: 109, symbol: 'Mt', name: 'Meitnerium', atomicMass: 278, category: 'unknown',
    group: 9, period: 7, block: 'd', state: 'synthetic', color: 'bg-slate-600', badgeColor: '#475569', pH: 7.0,
    electronegativity: null, electronConfig: '[Rn] 5f¹⁴ 6d⁷ 7s²', shells: [2, 8, 18, 32, 32, 15, 2], oxidationStates: '+9, +3',
    meltingPoint: null, boilingPoint: null, density: '37.4 g/cm³', discoveredBy: 'GSI Helmholtz Centre, Darmstadt, Germany', year: 1982,
    summary: 'Named in honor of Austrian physicist Lise Meitner, co-discoverer of nuclear fission.',
    applications: ['Heavy Ion Fusion Collision Physics'],
    gridRow: 7, gridCol: 9
  },
  {
    number: 110, symbol: 'Ds', name: 'Darmstadtium', atomicMass: 281, category: 'unknown',
    group: 10, period: 7, block: 'd', state: 'synthetic', color: 'bg-slate-600', badgeColor: '#475569', pH: 7.0,
    electronegativity: null, electronConfig: '[Rn] 5f¹⁴ 6d⁸ 7s²', shells: [2, 8, 18, 32, 32, 16, 2], oxidationStates: '+6, +4',
    meltingPoint: null, boilingPoint: null, density: '34.8 g/cm³', discoveredBy: 'GSI Helmholtz Centre, Darmstadt, Germany', year: 1994,
    summary: 'Named in honor of Darmstadt, Germany, where it was first synthesized at GSI.',
    applications: ['Cold Fusion Nuclear Reaction Physics'],
    gridRow: 7, gridCol: 10
  },
  {
    number: 111, symbol: 'Rg', name: 'Roentgenium', atomicMass: 282, category: 'unknown',
    group: 11, period: 7, block: 'd', state: 'synthetic', color: 'bg-slate-600', badgeColor: '#475569', pH: 7.0,
    electronegativity: null, electronConfig: '[Rn] 5f¹⁴ 6d⁹ 7s²', shells: [2, 8, 18, 32, 32, 17, 2], oxidationStates: '+3, +1',
    meltingPoint: null, boilingPoint: null, density: '28.7 g/cm³', discoveredBy: 'GSI Helmholtz Centre, Darmstadt, Germany', year: 1994,
    summary: 'Named after Wilhelm Conrad Röntgen, discoverer of X-rays (1895).',
    applications: ['Relativistic Superheavy Coinage Metal Research'],
    gridRow: 7, gridCol: 11
  },
  {
    number: 112, symbol: 'Cn', name: 'Copernicium', atomicMass: 285, category: 'post_transition',
    group: 12, period: 7, block: 'd', state: 'synthetic', color: 'bg-slate-500', badgeColor: '#64748b', pH: 7.0,
    electronegativity: null, electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s²', shells: [2, 8, 18, 32, 32, 18, 2], oxidationStates: '+2, 0',
    meltingPoint: 10, boilingPoint: 67, density: '14.0 g/cm³', discoveredBy: 'GSI Helmholtz Centre, Darmstadt, Germany', year: 1996,
    summary: 'Named after Nicolaus Copernicus. Extremely volatile metal that may behave like a heavy noble gas at room temperature due to relativistic effects.',
    applications: ['Relativistic Quantum Inert-gas Character Testing'],
    gridRow: 7, gridCol: 12
  },
  {
    number: 113, symbol: 'Nh', name: 'Nihonium', atomicMass: 286, category: 'unknown',
    group: 13, period: 7, block: 'p', state: 'synthetic', color: 'bg-slate-600', badgeColor: '#475569', pH: 7.0,
    electronegativity: null, electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹', shells: [2, 8, 18, 32, 32, 18, 3], oxidationStates: '+1, +3',
    meltingPoint: 430, boilingPoint: 1130, density: '16 g/cm³', discoveredBy: 'RIKEN Nishina Center, Wako, Japan', year: 2004,
    summary: 'First chemical element discovered in Asia. Named after Nihon (Japan in Japanese).',
    applications: ['Superheavy p-block Element Chemical Adsorption Studies'],
    gridRow: 7, gridCol: 13
  },
  {
    number: 114, symbol: 'Fl', name: 'Flerovium', atomicMass: 289, category: 'post_transition',
    group: 14, period: 7, block: 'p', state: 'synthetic', color: 'bg-slate-500', badgeColor: '#64748b', pH: 7.0,
    electronegativity: null, electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²', shells: [2, 8, 18, 32, 32, 18, 4], oxidationStates: '+2, +4',
    meltingPoint: -73, boilingPoint: 107, density: '9.928 g/cm³', discoveredBy: 'JINR Dubna & Lawrence Livermore National Lab', year: 1998,
    summary: 'Named in honor of Soviet nuclear physicist Georgy Flerov. Located at the heart of the theoretical Island of Stability.',
    applications: ['Theoretical Island of Stability Nuclear Shell Physics'],
    gridRow: 7, gridCol: 14
  },
  {
    number: 115, symbol: 'Mc', name: 'Moscovium', atomicMass: 290, category: 'unknown',
    group: 15, period: 7, block: 'p', state: 'synthetic', color: 'bg-slate-600', badgeColor: '#475569', pH: 7.0,
    electronegativity: null, electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³', shells: [2, 8, 18, 32, 32, 18, 5], oxidationStates: '+1, +3',
    meltingPoint: 400, boilingPoint: 1100, density: '13.5 g/cm³', discoveredBy: 'JINR Dubna, LLNL & Oak Ridge National Lab', year: 2003,
    summary: 'Named in honor of the Moscow Oblast region, where the Joint Institute for Nuclear Research is situated.',
    applications: ['Superheavy Transbismuth Target Decay Chain Tracking'],
    gridRow: 7, gridCol: 15
  },
  {
    number: 116, symbol: 'Lv', name: 'Livermorium', atomicMass: 293, category: 'unknown',
    group: 16, period: 7, block: 'p', state: 'synthetic', color: 'bg-slate-600', badgeColor: '#475569', pH: 7.0,
    electronegativity: null, electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴', shells: [2, 8, 18, 32, 32, 18, 6], oxidationStates: '+2, +4',
    meltingPoint: 435, boilingPoint: 800, density: '12.9 g/cm³', discoveredBy: 'JINR Dubna & Lawrence Livermore National Lab', year: 2000,
    summary: 'Named after Lawrence Livermore National Laboratory and the city of Livermore, California.',
    applications: ['Superheavy Chalcogen Relativistic Bond Research'],
    gridRow: 7, gridCol: 16
  },
  {
    number: 117, symbol: 'Ts', name: 'Tennessine', atomicMass: 294, category: 'unknown',
    group: 17, period: 7, block: 'p', state: 'synthetic', color: 'bg-slate-600', badgeColor: '#475569', pH: 7.0,
    electronegativity: null, electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵', shells: [2, 8, 18, 32, 32, 18, 7], oxidationStates: '+1, +3, +5',
    meltingPoint: 450, boilingPoint: 610, density: '7.2 g/cm³', discoveredBy: 'JINR Dubna, Oak Ridge National Lab & Vanderbilt University', year: 2010,
    summary: 'Second-heaviest known element. Produced by bombarding Berkelium-249 target with Calcium-48 ions. Named after Tennessee.',
    applications: ['Superheavy Halogen Relativistic Spin-Orbit Splitting'],
    gridRow: 7, gridCol: 17
  },
  {
    number: 118, symbol: 'Og', name: 'Oganesson', atomicMass: 294, category: 'noble_gas',
    group: 18, period: 7, block: 'p', state: 'synthetic', color: 'bg-pink-600', badgeColor: '#db2777', pH: 7.0,
    electronegativity: null, electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶', shells: [2, 8, 18, 32, 32, 18, 8], oxidationStates: '+4, +2, 0',
    meltingPoint: 50, boilingPoint: 80, density: '5.0 g/cm³', discoveredBy: 'JINR Dubna & Lawrence Livermore National Lab', year: 2002,
    summary: 'Heaviest chemical element on the Periodic Table (Z=118). Named in honor of Yuri Oganessian. Predicted to be a solid semiconductor rather than a gas due to relativistic electron smear.',
    applications: ['Thomas-Fermi Electron Cloud Smear & Quantum Physics Limits'],
    gridRow: 7, gridCol: 18
  }
];

// Helper to look up an element by symbol or atomic number
export function getElement(key: string | number): ChemicalElement | undefined {
  if (typeof key === 'number') {
    return ALL_ELEMENTS.find(el => el.number === key);
  }
  const upper = key.trim().toUpperCase();
  return ALL_ELEMENTS.find(el => el.symbol.toUpperCase() === upper || el.name.toUpperCase() === upper);
}
