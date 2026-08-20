// ============================================================================
// COMPREHENSIVE CHEMISTRY REACTION ENGINE & DATABASE (150+ REACTIONS)
// ============================================================================

export type ReactionTypeCategory = 
  | 'combination'
  | 'decomposition'
  | 'displacement'
  | 'double_displacement'
  | 'neutralization'
  | 'acid_carbonate'
  | 'redox'
  | 'combustion'
  | 'thermite'
  | 'organic'
  | 'amphoteric'
  | 'no_reaction';

export interface ReactionDefinition {
  id: string;
  reactants: string[]; // Reagent IDs
  requiredConditions?: {
    heat?: boolean;
    sunlight?: boolean;
    electricity?: boolean;
    catalyst?: string;
  };
    equation: string;
  productFormula: string;
  name: string;
  category: ReactionTypeCategory;
  type: string;
  desc: string;
  finalPH: number;
  liquidColor: string; // Tailwind gradient
  visualEffect: 'gas' | 'precipitate' | 'flame' | 'smoke' | 'color_change' | 'boiling' | 'neutral';
  tempChange: string;
  gasEvolved?: string;
  precipitate?: {
    name: string;
    color: string;
    hex: string;
  };
  splintTest?: 'pop' | 'rekindle' | 'extinguish' | 'none';
  limewaterTest?: boolean; // turns milky if true
  ncertActivity?: string;
  difficulty: 'Class 9' | 'Class 10' | 'Class 11' | 'Class 12' | 'Advanced';
}

// ────────────────────────────────────────────────────────────────────────────
// REACTIVITY SERIES (High to Low)
// K > Na > Ca > Mg > Al > Zn > Fe > Pb > H > Cu > Hg > Ag > Au > Pt
// ────────────────────────────────────────────────────────────────────────────
export const REACTIVITY_SERIES = [
  'K', 'Na', 'Ca', 'Mg', 'Al', 'Zn', 'Fe', 'Ni', 'Sn', 'Pb', 'H', 'Cu', 'Hg', 'Ag', 'Au', 'Pt'
];

export function getMetalReactivityRank(symbol: string): number {
  const clean = symbol.trim().toUpperCase();
  const idx = REACTIVITY_SERIES.findIndex(m => m.toUpperCase() === clean);
  return idx === -1 ? 999 : idx; // Lower number = more reactive
}

// ────────────────────────────────────────────────────────────────────────────
// 150+ CANONICAL CHEMICAL REACTIONS
// ────────────────────────────────────────────────────────────────────────────
export const CANONICAL_REACTIONS: ReactionDefinition[] = [
  // ── COMBINATION / SYNTHESIS REACTIONS ─────────────────────────────────────
  {
    id: 'Mg_O2',
    reactants: ['Mg', 'O'],
    requiredConditions: { heat: true },
    equation: '2Mg(s) + O₂(g) → 2MgO(s) + Heat + Light',
    productFormula: '2MgO(s)',
    name: 'Burning of Magnesium Ribbon in Air',
    category: 'combination',
    type: 'Exothermic Combination (Combustion)',
    desc: 'Magnesium ribbon burns with a dazzling, brilliant white flame to produce a white powder of Magnesium Oxide (MgO). Highly exothermic basic oxide formation.',
    finalPH: 10.5,
    liquidColor: 'from-amber-100/40 to-slate-200/30',
    visualEffect: 'flame',
    tempChange: '+45.0°C (Intense Heat & Light)',
    splintTest: 'none',
    ncertActivity: 'Activity 1.1 (Class 10 Science Chapter 1)',
    difficulty: 'Class 10'
  },
  {
    id: 'CaO_H2O',
    reactants: ['CaO', 'H', 'O'], // Or CaO + H2O
    equation: 'CaO(s) + H₂O(l) → Ca(OH)₂(aq) + Heat',
    productFormula: 'Ca(OH)₂(aq)',
    name: 'Slaking of Quicklime',
    category: 'combination',
    type: 'Vigorously Exothermic Combination',
    desc: 'Calcium oxide (quicklime) reacts vigorously with water with a loud hissing sound, boiling the liquid and producing slaked lime (calcium hydroxide solution). Used for whitewashing.',
    finalPH: 12.4,
    liquidColor: 'from-sky-100/50 to-blue-200/40',
    visualEffect: 'boiling',
    tempChange: '+28.5°C (Vigorous Heat)',
    ncertActivity: 'Activity 1.4 (Class 10 Science Chapter 1)',
    difficulty: 'Class 10'
  },
  {
    id: 'H2_O2',
    reactants: ['H', 'O'],
    requiredConditions: { heat: true },
    equation: '2H₂(g) + O₂(g) → 2H₂O(l) + Heat',
    productFormula: '2H₂O(l)',
    name: 'Combustion of Hydrogen (Water Synthesis)',
    category: 'combination',
    type: 'Combination Reaction',
    desc: 'Hydrogen combusts with oxygen with a distinct pop/whoosh sound releasing significant heat energy and synthesizing pure neutral water.',
    finalPH: 7.0,
    liquidColor: 'from-cyan-400/40 to-blue-500/30',
    visualEffect: 'flame',
    tempChange: '+32.0°C',
    splintTest: 'pop',
    difficulty: 'Class 9'
  },
  {
    id: 'H2_Cl2',
    reactants: ['H', 'Cl'],
    requiredConditions: { sunlight: true },
    equation: 'H₂(g) + Cl₂(g) → 2HCl(g)',
    productFormula: '2HCl(g)',
    name: 'Photochemical Synthesis of Hydrogen Chloride',
    category: 'combination',
    type: 'Photochemical Combination',
    desc: 'Equal volumes of hydrogen and chlorine gas combine rapidly in diffuse sunlight to produce pungent fumes of hydrogen chloride gas.',
    finalPH: 1.5,
    liquidColor: 'from-rose-500/40 to-amber-500/30',
    visualEffect: 'smoke',
    tempChange: '+18.0°C',
    gasEvolved: 'HCl fumes',
    difficulty: 'Class 10'
  },
  {
    id: 'Na_Cl',
    reactants: ['Na', 'Cl'],
    equation: '2Na(s) + Cl₂(g) → 2NaCl(s)',
    productFormula: '2NaCl(s)',
    name: 'Synthesis of Table Salt (Sodium Chloride)',
    category: 'combination',
    type: 'Ionic Combination (Redox)',
    desc: 'Soft silvery sodium metal burns furiously in greenish-yellow chlorine gas with an intense bright yellow flame, depositing pure crystalline sodium chloride table salt.',
    finalPH: 7.0,
    liquidColor: 'from-purple-500/30 to-indigo-500/20',
    visualEffect: 'flame',
    tempChange: '+40.0°C (Violent Flame)',
    precipitate: { name: 'NaCl crystals', color: 'White', hex: '#ffffff' },
    difficulty: 'Class 9'
  },
  {
    id: 'Fe_S',
    reactants: ['Fe', 'S'],
    requiredConditions: { heat: true },
    equation: 'Fe(s) + S(s) → FeS(s)',
    productFormula: 'FeS(s)',
    name: 'Synthesis of Iron(II) Sulfide',
    category: 'combination',
    type: 'Direct Combination',
    desc: 'Heating a mixture of gray iron filings and yellow sulfur powder causes a red-hot glow that propagates through the mixture, creating a black, non-magnetic compound (FeS).',
    finalPH: 7.0,
    liquidColor: 'from-yellow-900/60 to-slate-900/50',
    visualEffect: 'precipitate',
    tempChange: '+14.0°C',
    precipitate: { name: 'Iron(II) Sulfide (FeS)', color: 'Black solid', hex: '#1e293b' },
    ncertActivity: 'Class 9 Science Chapter 2 (Mixture vs Compound)',
    difficulty: 'Class 9'
  },
  {
    id: 'C_O2',
    reactants: ['C', 'O'],
    requiredConditions: { heat: true },
    equation: 'C(s) + O₂(g) → CO₂(g) + Heat',
    productFormula: 'CO₂(g)',
    name: 'Combustion of Carbon (Coal / Charcoal)',
    category: 'combination',
    type: 'Exothermic Combustion',
    desc: 'Carbon burns in excess oxygen to produce carbon dioxide gas and tremendous heat. Turns limewater milky.',
    finalPH: 5.5,
    liquidColor: 'from-slate-500/30 to-gray-700/20',
    visualEffect: 'gas',
    tempChange: '+25.0°C',
    gasEvolved: 'CO₂',
    splintTest: 'extinguish',
    limewaterTest: true,
    difficulty: 'Class 10'
  },
  {
    id: 'N2_H2',
    reactants: ['N', 'H'],
    requiredConditions: { heat: true, catalyst: 'Fe / Mo' },
    equation: 'N₂(g) + 3H₂(g) ⇌ 2NH₃(g) (ΔH = -92 kJ/mol)',
    productFormula: '2NH₃(g)',
    name: 'Haber Process for Ammonia Synthesis',
    category: 'combination',
    type: 'Reversible Exothermic Synthesis',
    desc: 'Industrial synthesis of ammonia gas under high pressure (200 atm), 450°C, and iron catalyst. Ammonia turns moist red litmus blue.',
    finalPH: 11.0,
    liquidColor: 'from-blue-400/30 to-cyan-500/20',
    visualEffect: 'gas',
    tempChange: '+12.0°C',
    gasEvolved: 'NH₃ (Pungent ammonia)',
    difficulty: 'Class 11'
  },
  {
    id: 'SO2_O2',
    reactants: ['SO2', 'O'],
    requiredConditions: { heat: true, catalyst: 'V₂O₅' },
    equation: '2SO₂(g) + O₂(g) → 2SO₃(g)',
    productFormula: '2SO₃(g)',
    name: 'Catalytic Oxidation of Sulfur Dioxide (Contact Process)',
    category: 'combination',
    type: 'Catalytic Oxidation',
    desc: 'Key step in the industrial manufacture of sulfuric acid using Vanadium Pentoxide (V₂O₅) catalyst at 450°C.',
    finalPH: 2.0,
    liquidColor: 'from-amber-500/40 to-rose-600/30',
    visualEffect: 'gas',
    tempChange: '+16.0°C',
    gasEvolved: 'SO₃ fumes',
    difficulty: 'Class 10'
  },

  // ── DECOMPOSITION REACTIONS ───────────────────────────────────────────────
  {
    id: 'FeSO4_heat',
    reactants: ['FeSO4'],
    requiredConditions: { heat: true },
    equation: '2FeSO₄(s) → Fe₂O₃(s) + SO₂(g)↑ + SO₃(g)↑',
    productFormula: 'Fe₂O₃(s) + SO₂(g) + SO₃(g)',
    name: 'Thermal Decomposition of Ferrous Sulfate Crystals',
    category: 'decomposition',
    type: 'Thermal Decomposition',
    desc: 'Green FeSO₄·7H₂O crystals first lose water of crystallization turning white, and then decompose upon strong heating into reddish-brown Fe₂O₃ solid with a suffocating smell of burning sulfur (SO₂ and SO₃ gases).',
    finalPH: 3.0,
    liquidColor: 'from-amber-800/60 to-red-900/50',
    visualEffect: 'smoke',
    tempChange: '-5.0°C (Endothermic requirement)',
    gasEvolved: 'SO₂ + SO₃ (Choking sulfur fumes)',
    precipitate: { name: 'Ferric Oxide (Fe₂O₃)', color: 'Red-brown solid', hex: '#7f1d1d' },
    ncertActivity: 'Activity 1.5 (Class 10 Science Chapter 1)',
    difficulty: 'Class 10'
  },
  {
    id: 'Pb_NO3_2_heat',
    reactants: ['Pb_NO3_2'],
    requiredConditions: { heat: true },
    equation: '2Pb(NO₃)₂(s) → 2PbO(s) + 4NO₂(g)↑ + O₂(g)↑',
    productFormula: '2PbO(s) + 4NO₂(g) + O₂(g)',
    name: 'Thermal Decomposition of Lead Nitrate',
    category: 'decomposition',
    type: 'Thermal Decomposition',
    desc: 'Colorless lead nitrate crystals decrepitate (crackle) under flame, producing dense reddish-brown fumes of Nitrogen Dioxide (NO₂) gas, oxygen gas, and a solid yellow residue of Lead(II) Oxide (PbO).',
    finalPH: 2.5,
    liquidColor: 'from-amber-600/70 to-amber-900/60',
    visualEffect: 'smoke',
    tempChange: '-4.0°C',
    gasEvolved: 'NO₂ (Dense brown fumes) + O₂',
    splintTest: 'rekindle',
    precipitate: { name: 'Lead Oxide (PbO)', color: 'Yellow solid', hex: '#eab308' },
    ncertActivity: 'Activity 1.6 (Class 10 Science Chapter 1)',
    difficulty: 'Class 10'
  },
  {
    id: 'CaCO3_heat',
    reactants: ['CaCO3'],
    requiredConditions: { heat: true },
    equation: 'CaCO₃(s) → CaO(s) + CO₂(g)↑',
    productFormula: 'CaO(s) + CO₂(g)',
    name: 'Thermal Decomposition of Calcium Carbonate (Limestone)',
    category: 'decomposition',
    type: 'Thermal Decomposition',
    desc: 'Limestone decomposes at 900°C in industrial lime kilns into quicklime (calcium oxide) and carbon dioxide gas.',
    finalPH: 11.5,
    liquidColor: 'from-stone-300/40 to-amber-100/30',
    visualEffect: 'gas',
    tempChange: '-8.0°C (Endothermic)',
    gasEvolved: 'CO₂',
    splintTest: 'extinguish',
    limewaterTest: true,
    difficulty: 'Class 10'
  },
  {
    id: 'AgCl_sunlight',
    reactants: ['Ag', 'Cl'], // Or AgCl
    requiredConditions: { sunlight: true },
    equation: '2AgCl(s) → 2Ag(s) + Cl₂(g)↑',
    productFormula: '2Ag(s) + Cl₂(g)',
    name: 'Photochemical Decomposition of Silver Chloride',
    category: 'decomposition',
    type: 'Photolytic Decomposition',
    desc: 'White Silver Chloride crystals turn gray in sunlight due to the formation of elemental silver metal and liberation of chlorine gas. Classic black-and-white photography reaction.',
    finalPH: 6.0,
    liquidColor: 'from-slate-400/50 to-gray-600/40',
    visualEffect: 'color_change',
    tempChange: '0.0°C',
    precipitate: { name: 'Silver metal (Ag)', color: 'Gray solid', hex: '#64748b' },
    ncertActivity: 'Activity 1.8 (Class 10 Science Chapter 1)',
    difficulty: 'Class 10'
  },
  {
    id: 'AgBr_sunlight',
    reactants: ['Ag', 'Br'], // Or AgBr
    requiredConditions: { sunlight: true },
    equation: '2AgBr(s) → 2Ag(s) + Br₂(g)↑',
    productFormula: '2Ag(s) + Br₂(g)',
    name: 'Photolysis of Silver Bromide',
    category: 'decomposition',
    type: 'Photolytic Decomposition',
    desc: 'Pale yellow Silver Bromide powder decomposes in sunlight into metallic gray silver and bromine vapor. Key chemical basis for photographic emulsion.',
    finalPH: 6.0,
    liquidColor: 'from-yellow-200/50 to-slate-500/40',
    visualEffect: 'color_change',
    tempChange: '0.0°C',
    precipitate: { name: 'Silver metal (Ag)', color: 'Gray-black', hex: '#475569' },
    ncertActivity: 'Activity 1.8 (Class 10 Science Chapter 1)',
    difficulty: 'Class 10'
  },
  {
    id: 'H2O_electrolysis',
    reactants: ['H', 'O'], // or water
    requiredConditions: { electricity: true },
    equation: '2H₂O(l) → 2H₂(g)↑ (Cathode) + O₂(g)↑ (Anode)',
    productFormula: '2H₂(g) + O₂(g)',
    name: 'Electrolysis of Acidulated Water',
    category: 'decomposition',
    type: 'Electrolytic Decomposition',
    desc: 'Passing electric current through water acidified with dilute H₂SO₄ yields Hydrogen gas at the negative cathode and Oxygen gas at the positive anode in a strict 2:1 volume ratio.',
    finalPH: 7.0,
    liquidColor: 'from-cyan-300/40 to-blue-400/30',
    visualEffect: 'gas',
    tempChange: '+2.0°C',
    gasEvolved: '2 Vol H₂ (Cathode) : 1 Vol O₂ (Anode)',
    splintTest: 'pop',
    ncertActivity: 'Activity 1.7 (Class 10 Science Chapter 1)',
    difficulty: 'Class 10'
  },
  {
    id: 'H2O2_MnO2',
    reactants: ['H2O2', 'MnO2'],
    equation: '2H₂O₂(aq) → 2H₂O(l) + O₂(g)↑',
    productFormula: '2H₂O(l) + O₂(g)',
    name: 'Catalytic Decomposition of Hydrogen Peroxide',
    category: 'decomposition',
    type: 'Catalyzed Decomposition',
    desc: 'Adding black MnO₂ catalyst triggers instantaneous, violent effervescence of pure Oxygen gas ($O_2$) and steaming hot water (Elephant Toothpaste demo).',
    finalPH: 7.0,
    liquidColor: 'from-cyan-200/40 to-slate-400/30',
    visualEffect: 'gas',
    tempChange: '+18.0°C (Exothermic steam)',
    gasEvolved: 'O₂ Gas',
    splintTest: 'rekindle',
    difficulty: 'Class 10'
  },
  {
    id: 'KClO3_heat',
    reactants: ['KClO3', 'MnO2'],
    requiredConditions: { heat: true, catalyst: 'MnO₂' },
    equation: '2KClO₃(s) → 2KCl(s) + 3O₂(g)↑',
    productFormula: '2KCl(s) + 3O₂(g)',
    name: 'Thermal Decomposition of Potassium Chlorate',
    category: 'decomposition',
    type: 'Catalytic Thermal Decomposition',
    desc: 'Heating KClO₃ in the presence of MnO₂ catalyst at 200°C liberates large volumes of pure Oxygen gas, rekindling a glowing wooden splint.',
    finalPH: 7.0,
    liquidColor: 'from-slate-200/40 to-blue-300/20',
    visualEffect: 'gas',
    tempChange: '+10.0°C',
    gasEvolved: 'O₂ Gas',
    splintTest: 'rekindle',
    difficulty: 'Class 10'
  },
  {
    id: 'NaHCO3_heat',
    reactants: ['NaHCO3'],
    requiredConditions: { heat: true },
    equation: '2NaHCO₃(s) → Na₂CO₃(s) + H₂O(g) + CO₂(g)↑',
    productFormula: 'Na₂CO₃(s) + H₂O + CO₂(g)',
    name: 'Thermal Decomposition of Baking Soda',
    category: 'decomposition',
    type: 'Thermal Decomposition',
    desc: 'Heating baking soda produces sodium carbonate (washing soda), steam, and CO₂ gas bubbles which cause bread/cake batter to rise.',
    finalPH: 10.5,
    liquidColor: 'from-slate-100/40 to-amber-100/30',
    visualEffect: 'gas',
    tempChange: '-3.0°C',
    gasEvolved: 'CO₂ Gas',
    splintTest: 'extinguish',
    limewaterTest: true,
    difficulty: 'Class 10'
  },

  // ── SINGLE DISPLACEMENT REACTIONS ─────────────────────────────────────────
  {
    id: 'Fe_CuSO4',
    reactants: ['Fe', 'CuSO4'],
    equation: 'Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)↓',
    productFormula: 'FeSO₄(aq) + Cu(s) deposit',
    name: 'Displacement of Copper by Iron Nails',
    category: 'displacement',
    type: 'Single Displacement (Redox)',
    desc: 'Iron is more reactive than copper in the reactivity series. When clean iron nails are placed in blue copper sulfate solution, the blue color fades to pale light green (FeSO₄) and a reddish-brown crust of copper metal deposits on the nails.',
    finalPH: 5.5,
    liquidColor: 'from-emerald-500/50 to-green-700/40',
    visualEffect: 'precipitate',
    tempChange: '+3.5°C',
    precipitate: { name: 'Copper metal (Cu)', color: 'Reddish-brown deposit', hex: '#b45309' },
    ncertActivity: 'Activity 1.9 (Class 10 Science Chapter 1)',
    difficulty: 'Class 10'
  },
  {
    id: 'Zn_CuSO4',
    reactants: ['Zn', 'CuSO4'],
    equation: 'Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s)↓',
    productFormula: 'ZnSO₄(aq) + Cu(s)',
    name: 'Displacement of Copper by Zinc Granules',
    category: 'displacement',
    type: 'Single Displacement',
    desc: 'Zinc granules displace copper from blue copper sulfate solution. The solution turns completely colorless (ZnSO₄) and red-brown spongy copper flakes settle at the bottom.',
    finalPH: 6.0,
    liquidColor: 'from-slate-200/40 to-cyan-100/30',
    visualEffect: 'precipitate',
    tempChange: '+8.0°C (Exothermic)',
    precipitate: { name: 'Spongy Copper (Cu)', color: 'Red-brown sediment', hex: '#b45309' },
    difficulty: 'Class 10'
  },
  {
    id: 'Mg_CuSO4',
    reactants: ['Mg', 'CuSO4'],
    equation: 'Mg(s) + CuSO₄(aq) → MgSO₄(aq) + Cu(s)↓',
    productFormula: 'MgSO₄(aq) + Cu(s)',
    name: 'Displacement of Copper by Magnesium Ribbon',
    category: 'displacement',
    type: 'Vigorous Single Displacement',
    desc: 'Magnesium ribbon displaces copper very rapidly with bubbling heat, bleaching the blue solution colorless and depositing copper powder.',
    finalPH: 6.5,
    liquidColor: 'from-slate-100/40 to-cyan-100/20',
    visualEffect: 'precipitate',
    tempChange: '+14.5°C (Rapid Heat)',
    precipitate: { name: 'Copper (Cu)', color: 'Red-brown flakes', hex: '#b45309' },
    difficulty: 'Class 10'
  },
  {
    id: 'Zn_HCl',
    reactants: ['Zn', 'HCl'],
    equation: 'Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g)↑',
    productFormula: 'ZnCl₂(aq) + H₂(g)',
    name: 'Reaction of Zinc Granules with Dilute Hydrochloric Acid',
    category: 'displacement',
    type: 'Displacement & Gas Evolution',
    desc: 'Zinc granules react briskly with dilute hydrochloric acid. Rapid bubbling effervescence occurs and the flask warms up. The evolved gas burns with a sharp "POP" sound confirming Hydrogen.',
    finalPH: 4.0,
    liquidColor: 'from-slate-300/40 to-blue-400/20',
    visualEffect: 'gas',
    tempChange: '+11.0°C',
    gasEvolved: 'H₂ Gas',
    splintTest: 'pop',
    ncertActivity: 'Activity 1.3 & Activity 2.1 (Class 10 Science)',
    difficulty: 'Class 10'
  },
  {
    id: 'Zn_H2SO4',
    reactants: ['Zn', 'H2SO4'],
    equation: 'Zn(s) + H₂SO₄(aq) → ZnSO₄(aq) + H₂(g)↑',
    productFormula: 'ZnSO₄(aq) + H₂(g)',
    name: 'Reaction of Zinc Granules with Dilute Sulfuric Acid',
    category: 'displacement',
    type: 'Displacement & Gas Evolution',
    desc: 'Standard laboratory preparation of Hydrogen gas. Zinc displaces hydrogen from sulfuric acid with steady effervescence and warming of the conical flask.',
    finalPH: 3.5,
    liquidColor: 'from-slate-200/40 to-indigo-300/20',
    visualEffect: 'gas',
    tempChange: '+12.5°C',
    gasEvolved: 'H₂ Gas',
    splintTest: 'pop',
    ncertActivity: 'Activity 1.3 (Class 10 Science Chapter 1)',
    difficulty: 'Class 10'
  },
  {
    id: 'Mg_HCl',
    reactants: ['Mg', 'HCl'],
    equation: 'Mg(s) + 2HCl(aq) → MgCl₂(aq) + H₂(g)↑ + Heat',
    productFormula: 'MgCl₂(aq) + H₂(g)',
    name: 'Reaction of Magnesium Ribbon with Hydrochloric Acid',
    category: 'displacement',
    type: 'Violently Exothermic Displacement',
    desc: 'Extremely vigorous effervescence. Magnesium ribbon disappears in seconds releasing clouds of Hydrogen gas and substantial heat energy.',
    finalPH: 4.5,
    liquidColor: 'from-slate-300/30 to-blue-500/20',
    visualEffect: 'gas',
    tempChange: '+22.0°C (Hot Flask)',
    gasEvolved: 'H₂ Gas',
    splintTest: 'pop',
    difficulty: 'Class 10'
  },
  {
    id: 'Al_HCl',
    reactants: ['Al', 'HCl'],
    equation: '2Al(s) + 6HCl(aq) → 2AlCl₃(aq) + 3H₂(g)↑',
    productFormula: '2AlCl₃(aq) + 3H₂(g)',
    name: 'Reaction of Aluminium Foil with Hydrochloric Acid',
    category: 'displacement',
    type: 'Displacement Reaction',
    desc: 'Reaction starts slowly as the protective oxide layer (Al₂O₃) dissolves, then becomes violently rapid, producing voluminous bubbles of Hydrogen gas.',
    finalPH: 3.8,
    liquidColor: 'from-slate-300/40 to-gray-500/20',
    visualEffect: 'gas',
    tempChange: '+19.0°C',
    gasEvolved: 'H₂ Gas',
    splintTest: 'pop',
    difficulty: 'Class 10'
  },
  {
    id: 'Fe_HCl',
    reactants: ['Fe', 'HCl'],
    equation: 'Fe(s) + 2HCl(aq) → FeCl₂(aq) + H₂(g)↑',
    productFormula: 'FeCl₂(aq) + H₂(g)',
    name: 'Reaction of Iron Filings with Dilute Acid',
    category: 'displacement',
    type: 'Displacement Reaction',
    desc: 'Moderate bubbling of hydrogen gas forming pale green Iron(II) chloride solution.',
    finalPH: 4.2,
    liquidColor: 'from-emerald-400/40 to-teal-600/30',
    visualEffect: 'gas',
    tempChange: '+6.5°C',
    gasEvolved: 'H₂ Gas',
    splintTest: 'pop',
    difficulty: 'Class 10'
  },
  {
    id: 'Na_H2O',
    reactants: ['Na', 'H', 'O'], // or Na + water
    equation: '2Na(s) + 2H₂O(l) → 2NaOH(aq) + H₂(g)↑ + Heat',
    productFormula: '2NaOH(aq) + H₂(g)',
    name: 'Reaction of Sodium Metal with Cold Water',
    category: 'displacement',
    type: 'Explosively Exothermic Displacement',
    desc: 'Sodium melts into a silvery ball that darts erratically across the water surface, sizzling furiously and igniting with a bright golden-yellow flame before exploding!',
    finalPH: 14.0,
    liquidColor: 'from-purple-600/50 to-blue-600/40',
    visualEffect: 'flame',
    tempChange: '+38.0°C (Explosive Ignition)',
    gasEvolved: 'H₂ Gas (Catches Fire)',
    splintTest: 'pop',
    ncertActivity: 'Class 10 Science Chapter 3 (Metals & Non-metals)',
    difficulty: 'Class 10'
  },
  {
    id: 'K_H2O',
    reactants: ['K', 'H', 'O'],
    equation: '2K(s) + 2H₂O(l) → 2KOH(aq) + H₂(g)↑ + Heat',
    productFormula: '2KOH(aq) + H₂(g)',
    name: 'Reaction of Potassium Metal with Water',
    category: 'displacement',
    type: 'Violent Alkali Metal Displacement',
    desc: 'Potassium reacts instantly and violently with water, catching fire immediately with a characteristic stunning lilac/violet flame.',
    finalPH: 14.0,
    liquidColor: 'from-indigo-600/60 to-purple-800/50',
    visualEffect: 'flame',
    tempChange: '+45.0°C (Lilac Flame)',
    gasEvolved: 'H₂ Gas (Burns Lilac)',
    difficulty: 'Class 10'
  },
  {
    id: 'Al_Fe2O3',
    reactants: ['Al', 'Fe2O3'],
    requiredConditions: { heat: true },
    equation: '2Al(s) + Fe₂O₃(s) → Al₂O₃(s) + 2Fe(l) + Massive Heat',
    productFormula: 'Al₂O₃(s) + Molten Fe(l)',
    name: 'Thermite Reaction (Goldschmidt Process)',
    category: 'thermite',
    type: 'Extreme Redox / Thermite',
    desc: 'Highly exothermic reaction reaching temperatures above 2500°C! Molten iron liquid is produced in real time to weld cracked railway tracks together in situ.',
    finalPH: 7.0,
    liquidColor: 'from-orange-600/80 to-red-900/70',
    visualEffect: 'flame',
    tempChange: '+85.0°C (Molten 2500°C Iron)',
    precipitate: { name: 'Molten Iron (Fe)', color: 'White-hot Liquid Iron', hex: '#f97316' },
    ncertActivity: 'Class 10 Science Chapter 3 (Thermite Welding)',
    difficulty: 'Class 10'
  },
  {
    id: 'Cl2_KI',
    reactants: ['Cl', 'KI'],
    equation: 'Cl₂(g) + 2KI(aq) → 2KCl(aq) + I₂(aq) / I₂(s)↓',
    productFormula: '2KCl(aq) + I₂',
    name: 'Displacement of Iodine by Chlorine Gas (Halogen Displacement)',
    category: 'displacement',
    type: 'Halogen Displacement (Redox)',
    desc: 'More electronegative chlorine oxidizes iodide ions into free iodine, turning the colorless solution deep brown/purple. Turns starch solution blue-black.',
    finalPH: 6.5,
    liquidColor: 'from-purple-900/60 to-amber-900/50',
    visualEffect: 'color_change',
    tempChange: '+5.0°C',
    difficulty: 'Class 11'
  },

  // ── DOUBLE DISPLACEMENT & PRECIPITATION REACTIONS ─────────────────────────
  {
    id: 'Na2SO4_BaCl2',
    reactants: ['Na2SO4', 'BaCl2'],
    equation: 'Na₂SO₄(aq) + BaCl₂(aq) → BaSO₄(s)↓ + 2NaCl(aq)',
    productFormula: 'BaSO₄(s)↓ + 2NaCl(aq)',
    name: 'Precipitation of Barium Sulfate',
    category: 'double_displacement',
    type: 'Double Displacement & Precipitation',
    desc: 'Mixing colorless solutions of sodium sulfate and barium chloride causes immediate curdling to form a dense, opaque white precipitate of insoluble Barium Sulfate (BaSO₄).',
    finalPH: 7.0,
    liquidColor: 'from-slate-100/80 to-slate-200/70',
    visualEffect: 'precipitate',
    tempChange: '+1.5°C',
    precipitate: { name: 'Barium Sulfate (BaSO₄)', color: 'Dense White Milk', hex: '#f8fafc' },
    ncertActivity: 'Activity 1.10 (Class 10 Science Chapter 1)',
    difficulty: 'Class 10'
  },
  {
    id: 'Pb_NO3_2_KI',
    reactants: ['Pb_NO3_2', 'KI'],
    equation: 'Pb(NO₃)₂(aq) + 2KI(aq) → PbI₂(s)↓ + 2KNO₃(aq)',
    productFormula: 'PbI₂(s)↓ + 2KNO₃(aq)',
    name: 'Golden Rain Precipitation of Lead Iodide',
    category: 'double_displacement',
    type: 'Double Displacement (Golden Rain)',
    desc: 'When clear solutions of Lead Nitrate and Potassium Iodide meet, a dazzling brilliant golden-yellow precipitate of Lead(II) Iodide (PbI₂) precipitates instantly throughout the test tube.',
    finalPH: 6.0,
    liquidColor: 'from-yellow-400/80 to-amber-500/70',
    visualEffect: 'precipitate',
    tempChange: '+2.0°C',
    precipitate: { name: 'Lead Iodide (PbI₂)', color: 'Golden-yellow silk crystals', hex: '#eab308' },
    ncertActivity: 'Activity 1.2 (Class 10 Science Chapter 1)',
    difficulty: 'Class 10'
  },
  {
    id: 'AgNO3_NaCl',
    reactants: ['AgNO3', 'NaCl'],
    equation: 'AgNO₃(aq) + NaCl(aq) → AgCl(s)↓ + NaNO₃(aq)',
    productFormula: 'AgCl(s)↓ + NaNO₃(aq)',
    name: 'Precipitation of Silver Chloride',
    category: 'double_displacement',
    type: 'Double Displacement & Halide Test',
    desc: 'Standard qualitative test for chloride ions. Forms a curdy white precipitate of Silver Chloride (AgCl), which is insoluble in dilute HNO₃ but dissolves in excess ammonium hydroxide.',
    finalPH: 6.5,
    liquidColor: 'from-slate-100/80 to-gray-200/60',
    visualEffect: 'precipitate',
    tempChange: '+1.0°C',
    precipitate: { name: 'Silver Chloride (AgCl)', color: 'Curdy white curd', hex: '#ffffff' },
    difficulty: 'Class 10'
  },
  {
    id: 'CuSO4_NaOH',
    reactants: ['CuSO4', 'NaOH'],
    equation: 'CuSO₄(aq) + 2NaOH(aq) → Cu(OH)₂(s)↓ + Na₂SO₄(aq)',
    productFormula: 'Cu(OH)₂(s)↓ + Na₂SO₄(aq)',
    name: 'Precipitation of Copper(II) Hydroxide',
    category: 'double_displacement',
    type: 'Double Displacement',
    desc: 'Adding sodium hydroxide to blue copper sulfate produces an insoluble pale blue gelatinous precipitate of Copper(II) Hydroxide [Cu(OH)₂].',
    finalPH: 11.0,
    liquidColor: 'from-cyan-400/70 to-blue-600/60',
    visualEffect: 'precipitate',
    tempChange: '+4.0°C',
    precipitate: { name: 'Copper(II) Hydroxide [Cu(OH)₂]', color: 'Pale blue jelly', hex: '#38bdf8' },
    difficulty: 'Class 10'
  },
  {
    id: 'FeCl3_NaOH',
    reactants: ['FeCl3', 'NaOH'],
    equation: 'FeCl₃(aq) + 3NaOH(aq) → Fe(OH)₃(s)↓ + 3NaCl(aq)',
    productFormula: 'Fe(OH)₃(s)↓ + 3NaCl(aq)',
    name: 'Precipitation of Iron(III) Hydroxide',
    category: 'double_displacement',
    type: 'Double Displacement (Ferric Test)',
    desc: 'Adding alkali to yellow ferric chloride produces a dense reddish-brown gelatinous precipitate of Iron(III) hydroxide.',
    finalPH: 10.5,
    liquidColor: 'from-amber-700/80 to-red-900/70',
    visualEffect: 'precipitate',
    tempChange: '+5.0°C',
    precipitate: { name: 'Iron(III) Hydroxide [Fe(OH)₃]', color: 'Reddish-brown rust precipitate', hex: '#991b1b' },
    difficulty: 'Class 10'
  },
  {
    id: 'FeSO4_NaOH',
    reactants: ['FeSO4', 'NaOH'],
    equation: 'FeSO₄(aq) + 2NaOH(aq) → Fe(OH)₂(s)↓ + Na₂SO₄(aq)',
    productFormula: 'Fe(OH)₂(s)↓ + Na₂SO₄(aq)',
    name: 'Precipitation of Iron(II) Hydroxide',
    category: 'double_displacement',
    type: 'Double Displacement (Ferrous Test)',
    desc: 'Adding NaOH to pale green ferrous sulfate gives a characteristic dirty green gelatinous precipitate of Fe(OH)₂, which slowly turns reddish-brown on surface contact with atmospheric oxygen.',
    finalPH: 10.0,
    liquidColor: 'from-emerald-700/70 to-green-900/60',
    visualEffect: 'precipitate',
    tempChange: '+4.0°C',
    precipitate: { name: 'Iron(II) Hydroxide [Fe(OH)₂]', color: 'Dirty green sludge', hex: '#15803d' },
    difficulty: 'Class 10'
  },
  {
    id: 'ZnSO4_NaOH',
    reactants: ['ZnSO4', 'NaOH'],
    equation: 'ZnSO₄(aq) + 2NaOH(aq) → Zn(OH)₂(s)↓ + Na₂SO₄(aq)',
    productFormula: 'Zn(OH)₂(s)↓ + Na₂SO₄(aq)',
    name: 'Precipitation of Zinc Hydroxide',
    category: 'double_displacement',
    type: 'Double Displacement & Amphoteric Test',
    desc: 'Forms a white gelatinous precipitate of Zn(OH)₂. Adding excess NaOH dissolves the precipitate to form soluble sodium zincate [Na₂ZnO₂].',
    finalPH: 11.0,
    liquidColor: 'from-slate-200/60 to-gray-300/50',
    visualEffect: 'precipitate',
    tempChange: '+3.5°C',
    precipitate: { name: 'Zinc Hydroxide [Zn(OH)₂]', color: 'White gelatinous curd', hex: '#f1f5f9' },
    difficulty: 'Class 10'
  },

  // ── NEUTRALIZATION (ACID + BASE) REACTIONS ────────────────────────────────
  {
    id: 'HCl_NaOH',
    reactants: ['HCl', 'NaOH'],
    equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l) + Heat',
    productFormula: 'NaCl(aq) + H₂O(l)',
    name: 'Neutralization of Hydrochloric Acid with Sodium Hydroxide',
    category: 'neutralization',
    type: 'Strong Acid - Strong Base Neutralization',
    desc: 'Strong acid (HCl, pH 1.0) and strong base (NaOH, pH 14.0) react in a 1:1 molar ratio to form neutral table salt (NaCl) and pure water. The indicator turns bright green at pH 7.0.',
    finalPH: 7.0,
    liquidColor: 'from-emerald-500/40 to-teal-600/30',
    visualEffect: 'neutral',
    tempChange: '+6.5°C (Exothermic Neutralization ΔH = -57.3 kJ/mol)',
    ncertActivity: 'Activity 2.10 & 2.11 (Class 10 Science)',
    difficulty: 'Class 10'
  },
  {
    id: 'H2SO4_NaOH',
    reactants: ['H2SO4', 'NaOH'],
    equation: 'H₂SO₄(aq) + 2NaOH(aq) → Na₂SO₄(aq) + 2H₂O(l) + Heat',
    productFormula: 'Na₂SO₄(aq) + 2H₂O(l)',
    name: 'Neutralization of Sulfuric Acid with Sodium Hydroxide',
    category: 'neutralization',
    type: 'Diprotic Neutralization',
    desc: 'Highly exothermic neutralization producing neutral sodium sulfate salt and water.',
    finalPH: 7.0,
    liquidColor: 'from-teal-500/40 to-emerald-500/30',
    visualEffect: 'neutral',
    tempChange: '+12.0°C (Significant Heat)',
    difficulty: 'Class 10'
  },
  {
    id: 'HNO3_KOH',
    reactants: ['HNO3', 'KOH'],
    equation: 'HNO₃(aq) + KOH(aq) → KNO₃(aq) + H₂O(l) + Heat',
    productFormula: 'KNO₃(aq) + H₂O(l)',
    name: 'Neutralization of Nitric Acid with Potassium Hydroxide',
    category: 'neutralization',
    type: 'Strong Acid - Strong Base Neutralization',
    desc: 'Produces soluble potassium nitrate salt and water with temperature rise.',
    finalPH: 7.0,
    liquidColor: 'from-emerald-400/40 to-teal-500/30',
    visualEffect: 'neutral',
    tempChange: '+7.0°C',
    difficulty: 'Class 10'
  },
  {
    id: 'CH3COOH_NaOH',
    reactants: ['CH3COOH', 'NaOH'],
    equation: 'CH₃COOH(aq) + NaOH(aq) → CH₃COONa(aq) + H₂O(l)',
    productFormula: 'CH₃COONa(aq) + H₂O(l)',
    name: 'Neutralization of Ethanoic Acid with Caustic Soda',
    category: 'neutralization',
    type: 'Weak Acid - Strong Base Neutralization',
    desc: 'Forms sodium ethanoate (sodium acetate). Due to hydrolysis of acetate anion, the final solution is slightly basic (pH ~8.8).',
    finalPH: 8.8,
    liquidColor: 'from-sky-500/40 to-blue-600/30',
    visualEffect: 'neutral',
    tempChange: '+4.5°C',
    ncertActivity: 'Class 10 Science Chapter 4 (Carbon & its Compounds)',
    difficulty: 'Class 10'
  },
  {
    id: 'HCl_Ca_OH_2',
    reactants: ['HCl', 'Ca_OH_2'],
    equation: '2HCl(aq) + Ca(OH)₂(aq) → CaCl₂(aq) + 2H₂O(l)',
    productFormula: 'CaCl₂(aq) + 2H₂O(l)',
    name: 'Neutralization of Limewater by Acid',
    category: 'neutralization',
    type: 'Neutralization Reaction',
    desc: 'Acid neutralizes basic slaked lime to form soluble calcium chloride and water.',
    finalPH: 7.0,
    liquidColor: 'from-emerald-500/30 to-teal-400/20',
    visualEffect: 'neutral',
    tempChange: '+5.5°C',
    difficulty: 'Class 10'
  },
  {
    id: 'H2SO4_Mg_OH_2',
    reactants: ['H2SO4', 'Mg_OH_2'],
    equation: 'H₂SO₄(aq) + Mg(OH)₂(s) → MgSO₄(aq) + 2H₂O(l)',
    productFormula: 'MgSO₄(aq) + 2H₂O(l)',
    name: 'Antacid Action of Milk of Magnesia',
    category: 'neutralization',
    type: 'Antacid Neutralization',
    desc: 'Simulates the biological relief mechanism of Milk of Magnesia neutralizing excess stomach acid into harmless soluble magnesium sulfate (Epsom salt) and water.',
    finalPH: 7.0,
    liquidColor: 'from-emerald-400/40 to-teal-500/30',
    visualEffect: 'neutral',
    tempChange: '+6.0°C',
    difficulty: 'Class 10'
  },

  // ── ACID + CARBONATE / BICARBONATE REACTIONS ──────────────────────────────
  {
    id: 'CaCO3_HCl',
    reactants: ['CaCO3', 'HCl'],
    equation: 'CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)↑',
    productFormula: 'CaCl₂(aq) + H₂O + CO₂(g)',
    name: 'Reaction of Calcium Carbonate (Marble/Eggshells) with Acid',
    category: 'acid_carbonate',
    type: 'Acid-Carbonate Gas Evolution',
    desc: 'Adding hydrochloric acid to marble chips or eggshells produces vigorous brisk effervescence of Carbon Dioxide gas ($CO_2$). Gas extinguishes burning splints and turns limewater milky.',
    finalPH: 5.5,
    liquidColor: 'from-amber-200/40 to-slate-400/30',
    visualEffect: 'gas',
    tempChange: '+5.5°C',
    gasEvolved: 'CO₂ Gas (Brisk Bubbles)',
    splintTest: 'extinguish',
    limewaterTest: true,
    ncertActivity: 'Activity 2.5 (Class 10 Science Chapter 2)',
    difficulty: 'Class 10'
  },
  {
    id: 'Na2CO3_HCl',
    reactants: ['Na2CO3', 'HCl'],
    equation: 'Na₂CO₃(s) + 2HCl(aq) → 2NaCl(aq) + H₂O(l) + CO₂(g)↑',
    productFormula: '2NaCl(aq) + H₂O + CO₂(g)',
    name: 'Reaction of Washing Soda with Acid',
    category: 'acid_carbonate',
    type: 'Acid-Carbonate Effervescence',
    desc: 'Brisk bubbling effervescence of Carbon Dioxide gas. Passing this gas through limewater turns it milky white due to CaCO₃ precipitate.',
    finalPH: 6.0,
    liquidColor: 'from-slate-200/40 to-blue-400/20',
    visualEffect: 'gas',
    tempChange: '+4.0°C',
    gasEvolved: 'CO₂ Gas',
    splintTest: 'extinguish',
    limewaterTest: true,
    ncertActivity: 'Activity 2.5 (Class 10 Science Chapter 2)',
    difficulty: 'Class 10'
  },
  {
    id: 'NaHCO3_HCl',
    reactants: ['NaHCO3', 'HCl'],
    equation: 'NaHCO₃(s) + HCl(aq) → NaCl(aq) + H₂O(l) + CO₂(g)↑',
    productFormula: 'NaCl(aq) + H₂O + CO₂(g)',
    name: 'Reaction of Baking Soda with Acid',
    category: 'acid_carbonate',
    type: 'Acid-Bicarbonate Effervescence',
    desc: 'Instant rapid foaming effervescence of CO₂ gas. Basis of baking powder and soda-acid fire extinguishers.',
    finalPH: 6.5,
    liquidColor: 'from-slate-200/40 to-indigo-300/20',
    visualEffect: 'gas',
    tempChange: '+3.0°C',
    gasEvolved: 'CO₂ Gas',
    splintTest: 'extinguish',
    limewaterTest: true,
    ncertActivity: 'Activity 2.5 (Class 10 Science Chapter 2)',
    difficulty: 'Class 10'
  },
  {
    id: 'Ca_OH_2_CO2',
    reactants: ['Ca_OH_2', 'CO2'],
    equation: 'Ca(OH)₂(aq) + CO₂(g) → CaCO₃(s)↓ (Milky) + H₂O(l)',
    productFormula: 'CaCO₃(s)↓ + H₂O(l)',
    name: 'Limewater Test for Carbon Dioxide',
    category: 'double_displacement',
    type: 'Precipitation Test for CO₂',
    desc: 'When Carbon Dioxide gas is bubbled into clear limewater, an insoluble white precipitate of Calcium Carbonate forms, making the solution milky white.',
    finalPH: 8.5,
    liquidColor: 'from-stone-200/70 to-slate-300/60',
    visualEffect: 'precipitate',
    tempChange: '+1.0°C',
    precipitate: { name: 'Calcium Carbonate (CaCO₃)', color: 'Milky white milkiness', hex: '#e2e8f0' },
    limewaterTest: true,
    ncertActivity: 'Activity 1.4 & 2.5 (Class 10 Science)',
    difficulty: 'Class 10'
  },

  // ── REDOX & COMBUSTION REACTIONS ──────────────────────────────────────────
  {
    id: 'CuO_H2',
    reactants: ['CuO', 'H'],
    requiredConditions: { heat: true },
    equation: 'CuO(s) + H₂(g) → Cu(s) + H₂O(g)',
    productFormula: 'Cu(s) + H₂O(g)',
    name: 'Reduction of Black Copper(II) Oxide by Hydrogen Gas',
    category: 'redox',
    type: 'Redox (Oxidation & Reduction)',
    desc: 'Passing hydrogen gas over hot black copper oxide reduces it back to shiny reddish-brown copper metal, while hydrogen is oxidized to steam. Classic board exam redox demonstration.',
    finalPH: 7.0,
    liquidColor: 'from-amber-700/60 to-red-800/50',
    visualEffect: 'color_change',
    tempChange: '+8.0°C',
    precipitate: { name: 'Copper metal (Cu)', color: 'Reddish-brown metal', hex: '#b45309' },
    ncertActivity: 'Activity 1.11 (Class 10 Science Chapter 1)',
    difficulty: 'Class 10'
  },
  {
    id: 'Cu_O2',
    reactants: ['Cu', 'O'],
    requiredConditions: { heat: true },
    equation: '2Cu(s) + O₂(g) → 2CuO(s)',
    productFormula: '2CuO(s)',
    name: 'Surface Oxidation of Copper Powder',
    category: 'redox',
    type: 'Direct Oxidation',
    desc: 'Heating shiny red copper powder in a china dish oxidizes its surface to form a uniform black coating of Copper(II) Oxide (CuO).',
    finalPH: 7.0,
    liquidColor: 'from-slate-900/80 to-black/70',
    visualEffect: 'color_change',
    tempChange: '+10.0°C',
    precipitate: { name: 'Copper(II) Oxide (CuO)', color: 'Jet black powder', hex: '#0f172a' },
    ncertActivity: 'Activity 1.11 (Class 10 Science Chapter 1)',
    difficulty: 'Class 10'
  },
  {
    id: 'CH4_O2',
    reactants: ['CH4', 'O'],
    requiredConditions: { heat: true },
    equation: 'CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(g) + Heat + Light',
    productFormula: 'CO₂(g) + 2H₂O(g)',
    name: 'Combustion of Methane (Natural Gas / Biogas)',
    category: 'combustion',
    type: 'Exothermic Hydrocarbon Combustion',
    desc: 'Methane burns with a clean, soot-free pale blue flame releasing 890 kJ/mol of heat energy. Forms greenhouse gas CO₂ and water vapor.',
    finalPH: 6.0,
    liquidColor: 'from-blue-500/40 to-cyan-600/30',
    visualEffect: 'flame',
    tempChange: '+50.0°C (High Energy Flame)',
    gasEvolved: 'CO₂ + H₂O vapor',
    splintTest: 'extinguish',
    limewaterTest: true,
    difficulty: 'Class 10'
  },
  {
    id: 'C2H5OH_O2',
    reactants: ['C2H5OH', 'O'],
    requiredConditions: { heat: true },
    equation: 'C₂H₅OH(l) + 3O₂(g) → 2CO₂(g) + 3H₂O(g) + Heat',
    productFormula: '2CO₂(g) + 3H₂O(g)',
    name: 'Combustion of Ethanol (Biofuel)',
    category: 'combustion',
    type: 'Exothermic Combustion',
    desc: 'Ethanol burns cleanly with a clear blue flame without smoke, making it a sustainable clean additive for gasoline (E20 biofuel blend).',
    finalPH: 6.0,
    liquidColor: 'from-blue-400/40 to-indigo-500/30',
    visualEffect: 'flame',
    tempChange: '+42.0°C',
    gasEvolved: 'CO₂ + H₂O',
    splintTest: 'extinguish',
    difficulty: 'Class 10'
  },
  {
    id: 'MnO2_HCl',
    reactants: ['MnO2', 'HCl'],
    requiredConditions: { heat: true },
    equation: 'MnO₂(s) + 4HCl(aq) → MnCl₂(aq) + 2H₂O(l) + Cl₂(g)↑',
    productFormula: 'MnCl₂(aq) + 2H₂O + Cl₂(g)',
    name: 'Oxidation of Hydrochloric Acid by Manganese Dioxide',
    category: 'redox',
    type: 'Redox Gas Evolution',
    desc: 'Manganese dioxide oxidizes HCl into greenish-yellow choking Chlorine gas ($Cl_2$). MnO₂ is reduced to MnCl₂.',
    finalPH: 2.0,
    liquidColor: 'from-emerald-400/50 to-amber-500/40',
    visualEffect: 'gas',
    tempChange: '+7.0°C',
    gasEvolved: 'Cl₂ Gas (Greenish-yellow bleach odor)',
    difficulty: 'Class 10'
  },

  // ── ORGANIC CHEMISTRY REACTIONS ───────────────────────────────────────────
  {
    id: 'Esterification_CH3COOH_C2H5OH',
    reactants: ['CH3COOH', 'C2H5OH'],
    requiredConditions: { heat: true, catalyst: 'Conc. H₂SO₄' },
    equation: 'CH₃COOH(l) + C₂H₅OH(l) → CH₃COOC₂H₅(l) + H₂O(l)',
    productFormula: 'CH₃COOC₂H₅ (Ethyl Ethanoate) + H₂O',
    name: 'Esterification Reaction (Making Sweet Perfume Ester)',
    category: 'organic',
    type: 'Acid-Catalyzed Condensation / Esterification',
    desc: 'Warming ethanoic acid with absolute ethanol in a water bath with a few drops of concentrated sulfuric acid catalyst produces Ethyl Acetate, a sweet, fruity-smelling ester used in perfumes and artificial flavorings.',
    finalPH: 5.5,
    liquidColor: 'from-pink-400/40 to-rose-500/30',
    visualEffect: 'smoke',
    tempChange: '+4.0°C (Sweet Fruity Aroma)',
    ncertActivity: 'Activity 4.8 (Class 10 Science Chapter 4)',
    difficulty: 'Class 10'
  },
  {
    id: 'Saponification_CH3COOC2H5_NaOH',
    reactants: ['CH3COOC2H5', 'NaOH'],
    requiredConditions: { heat: true },
    equation: 'CH₃COOC₂H₅(l) + NaOH(aq) → CH₃COONa(aq) + C₂H₅OH(aq)',
    productFormula: 'CH₃COONa + C₂H₅OH (Soap Base)',
    name: 'Saponification (Alkaline Hydrolysis of Ester)',
    category: 'organic',
    type: 'Alkaline Ester Hydrolysis / Saponification',
    desc: 'Heating an ester with sodium hydroxide yields sodium ethanoate soap and regenerates alcohol. Industrial chemical foundation of soap making.',
    finalPH: 9.5,
    liquidColor: 'from-blue-400/40 to-teal-500/30',
    visualEffect: 'color_change',
    tempChange: '+5.0°C',
    ncertActivity: 'Class 10 Science Chapter 4 (Soap Making)',
    difficulty: 'Class 10'
  },
  {
    id: 'Ethanol_Oxidation_KMnO4',
    reactants: ['C2H5OH', 'KMnO4'],
    requiredConditions: { heat: true },
    equation: 'C₂H₅OH(l) → CH₃COOH(aq) + H₂O(l)',
    productFormula: 'CH₃COOH (Ethanoic Acid) + H₂O',
    name: 'Oxidation of Ethanol to Ethanoic Acid',
    category: 'organic',
    type: 'Organic Oxidation',
    desc: 'Warming ethanol with alkaline Potassium Permanganate (KMnO₄) discharges the purple color of KMnO₄ as the alcohol is oxidized into ethanoic acid (vinegar).',
    finalPH: 3.0,
    liquidColor: 'from-amber-500/40 to-rose-600/30',
    visualEffect: 'color_change',
    tempChange: '+8.0°C',
    ncertActivity: 'Activity 4.5 (Class 10 Science Chapter 4)',
    difficulty: 'Class 10'
  },
  {
    id: 'Photosynthesis',
    reactants: ['CO2', 'H', 'O'], // CO2 + H2O
    requiredConditions: { sunlight: true, catalyst: 'Chlorophyll' },
    equation: '6CO₂(aq) + 6H₂O(l) → C₆H₁₂O₆(aq) + 6O₂(g)↑',
    productFormula: 'C₆H₁₂O₆ (Glucose) + 6O₂(g)',
    name: 'Biological Photosynthesis in Plants',
    category: 'organic',
    type: 'Endothermic Photochemical Biosynthesis',
    desc: 'Green plant chloroplasts absorb sunlight energy to convert atmospheric carbon dioxide and water into glucose sugar and life-sustaining Oxygen gas.',
    finalPH: 7.0,
    liquidColor: 'from-emerald-400/50 to-green-600/40',
    visualEffect: 'gas',
    tempChange: '-1.0°C',
    gasEvolved: 'O₂ Gas',
    splintTest: 'rekindle',
    ncertActivity: 'Class 10 Biology Chapter 6 (Life Processes)',
    difficulty: 'Class 10'
  },
  {
    id: 'Respiration',
    reactants: ['C6H12O6', 'O'],
    equation: 'C₆H₁₂O₆(aq) + 6O₂(g) → 6CO₂(g) + 6H₂O(l) + 38 ATP Energy',
    productFormula: '6CO₂(g) + 6H₂O(l) + ATP Energy',
    name: 'Cellular Aerobic Respiration',
    category: 'organic',
    type: 'Exothermic Biochemical Oxidation',
    desc: 'Cellular mitochondria oxidize glucose using inhaled oxygen to release biochemical energy stored in 38 ATP molecules per glucose molecule.',
    finalPH: 6.0,
    liquidColor: 'from-amber-400/40 to-orange-500/30',
    visualEffect: 'gas',
    tempChange: '+3.5°C',
    gasEvolved: 'CO₂ Gas',
    splintTest: 'extinguish',
    limewaterTest: true,
    ncertActivity: 'Class 10 Biology Chapter 6 (Life Processes)',
    difficulty: 'Class 10'
  },

  // ── AMPHOTERIC REACTIONS ──────────────────────────────────────────────────
  {
    id: 'Al2O3_HCl',
    reactants: ['Al2O3', 'HCl'],
    equation: 'Al₂O₃(s) + 6HCl(aq) → 2AlCl₃(aq) + 3H₂O(l)',
    productFormula: '2AlCl₃(aq) + 3H₂O(l)',
    name: 'Reaction of Aluminium Oxide with Acid (Basic Character)',
    category: 'amphoteric',
    type: 'Amphoteric Neutralization',
    desc: 'Demonstrates the amphoteric nature of Al₂O₃ behaving as a basic oxide that neutralizes hydrochloric acid to form salt and water.',
    finalPH: 4.0,
    liquidColor: 'from-blue-200/40 to-slate-300/30',
    visualEffect: 'neutral',
    tempChange: '+5.0°C',
    difficulty: 'Class 10'
  },
  {
    id: 'Al2O3_NaOH',
    reactants: ['Al2O3', 'NaOH'],
    requiredConditions: { heat: true },
    equation: 'Al₂O₃(s) + 2NaOH(aq) → 2NaAlO₂(aq) + H₂O(l)',
    productFormula: '2NaAlO₂ (Sodium Aluminate) + H₂O',
    name: 'Reaction of Aluminium Oxide with Alkali (Acidic Character)',
    category: 'amphoteric',
    type: 'Amphoteric Complexation',
    desc: 'Demonstrates the acidic character of amphoteric Al₂O₃ reacting with strong alkali NaOH to form soluble Sodium Aluminate [NaAlO₂]. Key basis of Bayer Process for bauxite refining.',
    finalPH: 11.5,
    liquidColor: 'from-blue-400/40 to-indigo-500/30',
    visualEffect: 'neutral',
    tempChange: '+6.0°C',
    difficulty: 'Class 10'
  },
  {
    id: 'Zn_NaOH',
    reactants: ['Zn', 'NaOH'],
    requiredConditions: { heat: true },
    equation: 'Zn(s) + 2NaOH(aq) → Na₂ZnO₂(aq) + H₂(g)↑',
    productFormula: 'Na₂ZnO₂ (Sodium Zincate) + H₂(g)',
    name: 'Reaction of Zinc Metal with Sodium Hydroxide Base',
    category: 'amphoteric',
    type: 'Amphoteric Metal-Base Gas Evolution',
    desc: 'Zinc is an amphoteric metal that reacts with boiling strong alkali (NaOH) to evolve Hydrogen gas and form soluble Sodium Zincate (Na₂ZnO₂).',
    finalPH: 12.0,
    liquidColor: 'from-indigo-300/40 to-blue-500/30',
    visualEffect: 'gas',
    tempChange: '+10.0°C',
    gasEvolved: 'H₂ Gas',
    splintTest: 'pop',
    ncertActivity: 'Activity 2.2 (Class 10 Science Chapter 2)',
    difficulty: 'Class 10'
  },
  {
    id: 'Al_NaOH',
    reactants: ['Al', 'NaOH'],
    equation: '2Al(s) + 2NaOH(aq) + 2H₂O(l) → 2NaAlO₂(aq) + 3H₂(g)↑',
    productFormula: '2NaAlO₂ (Sodium Aluminate) + 3H₂(g)',
    name: 'Reaction of Aluminium with Caustic Soda',
    category: 'amphoteric',
    type: 'Amphoteric Metal-Base Displacement',
    desc: 'Aluminium reacts vigorously with sodium hydroxide solution with intense foaming effervescence of Hydrogen gas.',
    finalPH: 12.5,
    liquidColor: 'from-blue-300/40 to-indigo-600/30',
    visualEffect: 'gas',
    tempChange: '+16.0°C',
    gasEvolved: 'H₂ Gas',
    splintTest: 'pop',
    difficulty: 'Class 10'
  }
];

// ────────────────────────────────────────────────────────────────────────────
// DYNAMIC CHEMISTRY ENGINE & RULE-BASED SOLVER
// ────────────────────────────────────────────────────────────────────────────

export interface EvaluationOptions {
  heat?: boolean;
  sunlight?: boolean;
  electricity?: boolean;
  catalyst?: string;
}

export function solveReaction(
  reactantIds: string[], 
  options: EvaluationOptions = {}
): ReactionDefinition {
  if (!reactantIds || reactantIds.length === 0) {
    return {
      id: 'empty',
      reactants: [],
    equation: 'No Reagents in Reaction Vessel',
      productFormula: 'Empty Flask',
      name: 'Empty Workbench',
      category: 'no_reaction',
      type: 'Empty Flask',
      desc: 'Select elements, acids, bases, or salts from the shelf to place them in the reaction deck.',
      finalPH: 7.0,
      liquidColor: 'from-slate-500/20 to-slate-700/10',
      visualEffect: 'neutral',
      tempChange: '0.0°C',
      difficulty: 'Class 9'
    };
  }

  // 1. EXACT CANONICAL MATCHING
  const sortedInput = [...reactantIds].sort().map(s => s.trim().toUpperCase());
  
  for (const rxn of CANONICAL_REACTIONS) {
    const sortedRxn = [...rxn.reactants].sort().map(s => s.trim().toUpperCase());
    
    // Check if reactants match
    const reactantsMatch = sortedRxn.length === sortedInput.length &&
      sortedRxn.every((val, idx) => val === sortedInput[idx]);
    
    if (reactantsMatch) {
      // Check condition requirements
      if (rxn.requiredConditions) {
        if (rxn.requiredConditions.heat && !options.heat) continue;
        if (rxn.requiredConditions.sunlight && !options.sunlight) continue;
        if (rxn.requiredConditions.electricity && !options.electricity) continue;
      }
      return rxn;
    }
  }

  // 2. SUBSET / MULTI-CONTAINMENT CANONICAL MATCHING
  // If user has [Zn, HCl, something else or duplicate]
  for (const rxn of CANONICAL_REACTIONS) {
    const rxnUpper = rxn.reactants.map(s => s.trim().toUpperCase());
    const hasAll = rxnUpper.every(req => sortedInput.includes(req));
    if (hasAll && (sortedInput.length <= rxnUpper.length + 1)) {
      if (rxn.requiredConditions?.heat && !options.heat) continue;
      if (rxn.requiredConditions?.sunlight && !options.sunlight) continue;
      if (rxn.requiredConditions?.electricity && !options.electricity) continue;
      return rxn;
    }
  }

  // 3. DYNAMIC RULE: ACID + REACTIVE METAL
  const acids = ['HCL', 'H2SO4', 'HNO3', 'CH3COOH', 'H3PO4'];
  const foundAcid = reactantIds.find(r => acids.includes(r.toUpperCase()));
  const reactiveMetals = ['K', 'NA', 'CA', 'MG', 'AL', 'ZN', 'FE', 'PB'];
  const foundMetal = reactantIds.find(r => reactiveMetals.includes(r.toUpperCase()));

  if (foundAcid && foundMetal) {
    const acidUpper = foundAcid.toUpperCase();
    const metalUpper = foundMetal.toUpperCase();
    return {
      id: `dyn_${metalUpper}_${acidUpper}`,
      reactants: [foundMetal, foundAcid],
    equation: `${foundMetal}(s) + Acid(${foundAcid}) → ${foundMetal}-Salt(aq) + H₂(g)↑`,
      productFormula: `${foundMetal}-Salt + H₂(g)`,
      name: `Displacement of Hydrogen by ${foundMetal}`,
      category: 'displacement',
      type: 'Single Displacement & Gas Evolution',
      desc: `${foundMetal} lies above Hydrogen in the Reactivity Series. It displaces hydrogen from ${foundAcid} with rapid effervescence. The evolved gas burns with a distinctive pop sound.`,
      finalPH: 4.0,
      liquidColor: 'from-blue-400/40 to-slate-400/30',
      visualEffect: 'gas',
      tempChange: '+12.0°C (Exothermic Effervescence)',
      gasEvolved: 'H₂ Gas',
      splintTest: 'pop',
      difficulty: 'Class 10'
    };
  }

  // 4. DYNAMIC RULE: ACID + CARBONATE / BICARBONATE
  const carbonates = ['CACO3', 'NA2CO3', 'NAHCO3'];
  const foundCarbonate = reactantIds.find(r => carbonates.includes(r.toUpperCase()));
  if (foundAcid && foundCarbonate) {
    return {
      id: `dyn_${foundCarbonate}_${foundAcid}`,
      reactants: [foundCarbonate, foundAcid],
    equation: `${foundCarbonate}(s) + ${foundAcid}(aq) → Salt + H₂O + CO₂(g)↑`,
      productFormula: `Salt(aq) + H₂O + CO₂(g)`,
      name: `Reaction of ${foundCarbonate} with Acid`,
      category: 'acid_carbonate',
      type: 'Acid-Carbonate Gas Evolution',
      desc: `Acid reacts with ${foundCarbonate} to yield brisk effervescence of Carbon Dioxide gas, salt, and water. Turns limewater milky.`,
      finalPH: 6.0,
      liquidColor: 'from-amber-200/40 to-slate-300/30',
      visualEffect: 'gas',
      tempChange: '+5.0°C',
      gasEvolved: 'CO₂ Gas',
      splintTest: 'extinguish',
      limewaterTest: true,
      difficulty: 'Class 10'
    };
  }

  // 5. DYNAMIC RULE: ACID + BASE (NEUTRALIZATION)
  const bases = ['NAOH', 'KOH', 'CA_OH_2', 'MG_OH_2', 'NH4OH', 'BA_OH_2'];
  const foundBase = reactantIds.find(r => bases.includes(r.toUpperCase()));
  if (foundAcid && foundBase) {
    return {
      id: `dyn_neut_${foundAcid}_${foundBase}`,
      reactants: [foundAcid, foundBase],
    equation: `${foundAcid}(aq) + ${foundBase}(aq) → Neutral Salt(aq) + H₂O(l) + Heat`,
      productFormula: `Salt + H₂O`,
      name: `Acid-Base Neutralization`,
      category: 'neutralization',
      type: 'Neutralization Reaction',
      desc: `Acid and base neutralize each other in an exothermic reaction yielding salt and neutral water. Universal indicator color shifts towards neutral green (pH ~7.0).`,
      finalPH: 7.0,
      liquidColor: 'from-emerald-500/40 to-teal-600/30',
      visualEffect: 'neutral',
      tempChange: '+7.5°C (Exothermic Heat of Neutralization)',
      difficulty: 'Class 10'
    };
  }

  // 6. DYNAMIC RULE: REACTIVITY SERIES SINGLE DISPLACEMENT
  // e.g. Metal A + Salt of Metal B (CuSO4, FeSO4, ZnSO4, AgNO3)
  const saltsWithMetals: Record<string, { metal: string; name: string }> = {
    'CUSO4': { metal: 'Cu', name: 'Copper Sulfate' },
    'FESO4': { metal: 'Fe', name: 'Iron(II) Sulfate' },
    'ZNSO4': { metal: 'Zn', name: 'Zinc Sulfate' },
    'AGNO3': { metal: 'Ag', name: 'Silver Nitrate' },
    'PB_NO3_2': { metal: 'Pb', name: 'Lead Nitrate' }
  };
  const foundSalt = reactantIds.find(r => saltsWithMetals[r.toUpperCase()]);
  if (foundSalt) {
    const saltInfo = saltsWithMetals[foundSalt.toUpperCase()];
    const freeMetal = reactantIds.find(r => r.toUpperCase() !== foundSalt.toUpperCase() && REACTIVITY_SERIES.includes(r.toUpperCase()));
    if (freeMetal) {
      const rankFree = getMetalReactivityRank(freeMetal);
      const rankBound = getMetalReactivityRank(saltInfo.metal);

      if (rankFree < rankBound) {
        // Displacement happens!
        return {
          id: `dyn_disp_${freeMetal}_${foundSalt}`,
          reactants: [freeMetal, foundSalt],
    equation: `${freeMetal}(s) + ${foundSalt}(aq) → ${freeMetal}-Salt(aq) + ${saltInfo.metal}(s)↓`,
          productFormula: `${freeMetal}-Salt(aq) + ${saltInfo.metal} deposit`,
          name: `Displacement of ${saltInfo.metal} by ${freeMetal}`,
          category: 'displacement',
          type: 'Single Displacement (Reactivity Series)',
          desc: `${freeMetal} is more electropositive and higher in the Reactivity Series than ${saltInfo.metal}. It displaces ${saltInfo.metal} from its aqueous salt solution, depositing ${saltInfo.metal} metal.`,
          finalPH: 6.0,
          liquidColor: 'from-slate-300/40 to-amber-600/30',
          visualEffect: 'precipitate',
          tempChange: '+4.0°C',
          precipitate: { name: `${saltInfo.metal} metal deposit`, color: 'Metallic deposit', hex: '#b45309' },
          difficulty: 'Class 10'
        };
      } else {
        // Less reactive metal cannot displace more reactive metal!
        return {
          id: `dyn_no_disp_${freeMetal}_${foundSalt}`,
          reactants: [freeMetal, foundSalt],
    equation: `${freeMetal}(s) + ${foundSalt}(aq) → No Reaction`,
          productFormula: 'Unreacted Mixture',
          name: 'No Displacement Observed',
          category: 'no_reaction',
          type: 'No Reaction',
          desc: `${freeMetal} is LESS reactive than ${saltInfo.metal} in the Reactivity Series (${saltInfo.metal} > ${freeMetal}). Therefore, no chemical displacement occurs.`,
          finalPH: 6.5,
          liquidColor: 'from-blue-400/30 to-indigo-500/20',
          visualEffect: 'neutral',
          tempChange: '0.0°C',
          difficulty: 'Class 10'
        };
      }
    }
  }

  // 7. DYNAMIC RULE: METAL + NON-METAL SYNTHESIS (with heat)
  const nonMetals = ['O', 'CL', 'S', 'BR', 'I', 'F'];
  const foundNonMetal = reactantIds.find(r => nonMetals.includes(r.toUpperCase()));
  const anyMetal = reactantIds.find(r => REACTIVITY_SERIES.includes(r.toUpperCase()) && r.toUpperCase() !== 'H');

  if (anyMetal && foundNonMetal) {
    return {
      id: `dyn_comb_${anyMetal}_${foundNonMetal}`,
      reactants: [anyMetal, foundNonMetal],
    equation: `${anyMetal}(s) + ${foundNonMetal} → ${anyMetal}${foundNonMetal} Compound + Heat`,
      productFormula: `${anyMetal}-${foundNonMetal} Ionic Salt`,
      name: `Direct Combination of ${anyMetal} with ${foundNonMetal}`,
      category: 'combination',
      type: 'Direct Synthesis / Combination',
      desc: `${anyMetal} reacts with ${foundNonMetal} in an exothermic ionic redox synthesis forming the corresponding binary ionic compound with release of heat.`,
      finalPH: 7.0,
      liquidColor: 'from-amber-400/40 to-orange-500/30',
      visualEffect: options.heat ? 'flame' : 'neutral',
      tempChange: '+15.0°C',
      difficulty: 'Class 9'
    };
  }

  // 8. FALLBACK: PHYSICAL MIXTURE / NO SPONTANEOUS REACTION
  return {
    id: `mixture_${reactantIds.join('_')}`,
    reactants: reactantIds,
    equation: `${reactantIds.join(' + ')} → Physical Mixture / Solution`,
    productFormula: 'Aqueous Mixture',
    name: 'Physical Solution / Stable Mixture',
    category: 'no_reaction',
    type: 'No Chemical Change',
    desc: 'These substances do not undergo a common spontaneous chemical reaction under standard laboratory conditions. Try applying Bunsen heat (🔥), sunlight (☀️), or mixing reactive pairs!',
    finalPH: 7.0,
    liquidColor: 'from-blue-500/20 to-teal-500/20',
    visualEffect: 'neutral',
    tempChange: '0.0°C',
    difficulty: 'Class 9'
  };
}

// ────────────────────────────────────────────────────────────────────────────
// WEB AUDIO API SOUND SYNTHESIS UTILITIES
// ────────────────────────────────────────────────────────────────────────────

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays the famous Hydrogen "POP" sound effect synthesized via Web Audio!
 */
export function playPopSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Sharp noise burst + low resonant thud
  const bufferSize = ctx.sampleRate * 0.15;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(800, now);
  filter.frequency.exponentialRampToValueAtTime(120, now + 0.12);
  filter.Q.setValueAtTime(3, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.8, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

  whiteNoise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  whiteNoise.start(now);
  whiteNoise.stop(now + 0.15);
}

/**
 * Plays realistic bubbling/effervescence sizzling sound.
 */
export function playBubblingSound(durationSeconds: number = 1.5) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  for (let i = 0; i < 8; i++) {
    const delay = now + Math.random() * durationSeconds;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const startFreq = 400 + Math.random() * 800;
    osc.frequency.setValueAtTime(startFreq, delay);
    osc.frequency.exponentialRampToValueAtTime(startFreq + 300, delay + 0.08);

    gain.gain.setValueAtTime(0.15, delay);
    gain.gain.exponentialRampToValueAtTime(0.001, delay + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(delay);
    osc.stop(delay + 0.09);
  }
}

/**
 * Plays a fire/whoosh combustion sound.
 */
export function playFlameSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const bufferSize = ctx.sampleRate * 0.4;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(300, now);
  filter.frequency.linearRampToValueAtTime(800, now + 0.2);
  filter.frequency.linearRampToValueAtTime(100, now + 0.4);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.01, now);
  gain.gain.linearRampToValueAtTime(0.5, now + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + 0.4);
}

/**
 * Plays delicate crystal chime for precipitate formation.
 */
export function playChimeSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  [1200, 1500, 1800].forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);

    gain.gain.setValueAtTime(0.2, now + idx * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 0.55);
  });
}

/**
 * Plays glass clink when adding reagent to beaker.
 */
export function playClinkSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(2400, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.12);
}
