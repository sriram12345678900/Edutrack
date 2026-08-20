// ============================================================================
// LABORATORY COMPOUNDS, REAGENTS, ACIDS, BASES, SALTS & INDICATORS
// ============================================================================

export type CompoundCategory = 
  | 'acid'
  | 'base'
  | 'salt'
  | 'oxide'
  | 'organic'
  | 'indicator'
  | 'catalyst';

export interface ChemicalCompound {
  id: string;
  formula: string;
  name: string;
  commonName?: string;
  category: CompoundCategory;
  state: 'solid' | 'liquid' | 'gas' | 'aqueous';
  pH: number;
  color: string; // Tailwind color class
  badgeColor: string; // Hex color
  molarMass: number;
  hazard?: 'corrosive' | 'flammable' | 'toxic' | 'oxidizer' | 'irritant' | 'safe';
  description: string;
  uses: string[];
}

export const COMPOUND_CATEGORIES: { id: CompoundCategory; label: string; color: string }[] = [
  { id: 'acid', label: 'Acids', color: '#ef4444' },
  { id: 'base', label: 'Bases & Alkalis', color: '#3b82f6' },
  { id: 'salt', label: 'Salts & Minerals', color: '#10b981' },
  { id: 'oxide', label: 'Oxides & Peroxides', color: '#f59e0b' },
  { id: 'organic', label: 'Organics & Hydrocarbons', color: '#8b5cf6' },
  { id: 'indicator', label: 'Indicators & Dyes', color: '#ec4899' },
  { id: 'catalyst', label: 'Catalysts & Reagents', color: '#06b6d4' },
];

export const ALL_COMPOUNDS: ChemicalCompound[] = [
  // ── ACIDS ─────────────────────────────────────────────────────────────────
  {
    id: 'HCl', formula: 'HCl', name: 'Hydrochloric Acid', commonName: 'Muriatic Acid',
    category: 'acid', state: 'liquid', pH: 1.0, color: 'bg-rose-600', badgeColor: '#e11d48', molarMass: 36.46,
    hazard: 'corrosive', description: 'Strong mineral acid found in gastric juice. Reacts with metals to evolve H₂ gas.',
    uses: ['Steel Pickling', 'Digestive Aid in Stomach', 'pH Regulation', 'PVC Production']
  },
  {
    id: 'H2SO4', formula: 'H₂SO₄', name: 'Sulfuric Acid', commonName: 'King of Chemicals / Oil of Vitriol',
    category: 'acid', state: 'liquid', pH: 0.5, color: 'bg-red-700', badgeColor: '#b91c1c', molarMass: 98.08,
    hazard: 'corrosive', description: 'Extremely strong, dense dibasic acid and powerful dehydrating agent. Highly exothermic on dilution.',
    uses: ['Fertilizer (Superphosphate)', 'Car Lead-Acid Batteries', 'Petroleum Refining', 'Chemical Synthesis']
  },
  {
    id: 'HNO3', formula: 'HNO₃', name: 'Nitric Acid', commonName: 'Aqua Fortis',
    category: 'acid', state: 'liquid', pH: 1.0, color: 'bg-orange-600', badgeColor: '#ea580c', molarMass: 63.01,
    hazard: 'oxidizer', description: 'Strong oxidizing acid. Produces brown NO₂ gas fumes and dissolves most metals.',
    uses: ['Ammonium Nitrate Fertilizers', 'Explosives (TNT, Nitroglycerin)', 'Aqua Regia Synthesis', 'Rocket Propellant']
  },
  {
    id: 'CH3COOH', formula: 'CH₃COOH', name: 'Ethanoic Acid', commonName: 'Acetic Acid / Vinegar (5-8%)',
    category: 'acid', state: 'liquid', pH: 2.8, color: 'bg-amber-600', badgeColor: '#d97706', molarMass: 60.05,
    hazard: 'irritant', description: 'Weak monobasic carboxylic acid with pungent vinegar smell. Pure acid freezes at 16.6°C (Glacial Acetic Acid).',
    uses: ['Food Preservation & Vinegar', 'Esterification (Perfumes)', 'Cellulose Acetate Synthetic Fibers', 'Latex Coagulation']
  },
  {
    id: 'H2CO3', formula: 'H₂CO₃', name: 'Carbonic Acid', commonName: 'Soda Water Acid',
    category: 'acid', state: 'liquid', pH: 4.5, color: 'bg-amber-500', badgeColor: '#f59e0b', molarMass: 62.03,
    hazard: 'safe', description: 'Weak diprotic acid formed when CO₂ dissolves in water under pressure in fizzy soft drinks.',
    uses: ['Carbonated Beverages', 'Blood pH Buffer System', 'Cave Stalactite Formation']
  },
  {
    id: 'H3PO4', formula: 'H₃PO₄', name: 'Phosphoric Acid', commonName: 'Orthophosphoric Acid',
    category: 'acid', state: 'liquid', pH: 1.5, color: 'bg-rose-500', badgeColor: '#f43f5e', molarMass: 97.99,
    hazard: 'corrosive', description: 'Tribasic acid used to give tart tang to cola drinks and remove rust from steel.',
    uses: ['Cola Soft Drinks Flavoring', 'Phosphate Fertilizers', 'Rust Converter Coatings', 'Dental Etching Gel']
  },

  // ── BASES & ALKALIS ───────────────────────────────────────────────────────
  {
    id: 'NaOH', formula: 'NaOH', name: 'Sodium Hydroxide', commonName: 'Caustic Soda / Lye',
    category: 'base', state: 'solid', pH: 14.0, color: 'bg-blue-600', badgeColor: '#2563eb', molarMass: 40.00,
    hazard: 'corrosive', description: 'Deliquescent strong alkali that turns red litmus blue. Saponifies fats into soap.',
    uses: ['Soap & Detergent Manufacturing', 'Drain Cleaner', 'Paper & Pulp Bleaching', 'Bauxite Aluminum Extraction']
  },
  {
    id: 'KOH', formula: 'KOH', name: 'Potassium Hydroxide', commonName: 'Caustic Potash',
    category: 'base', state: 'solid', pH: 14.0, color: 'bg-indigo-600', badgeColor: '#4f46e5', molarMass: 56.11,
    hazard: 'corrosive', description: 'Strong hygroscopic base. Exceptional CO₂ gas absorber in respiration experiments.',
    uses: ['Liquid Soft Soaps', 'Alkaline Battery Electrolyte', 'CO₂ Gas Absorption in Biology Labs', 'Biodiesel Production']
  },
  {
    id: 'Ca_OH_2', formula: 'Ca(OH)₂', name: 'Calcium Hydroxide', commonName: 'Slaked Lime / Limewater',
    category: 'base', state: 'solid', pH: 12.4, color: 'bg-sky-500', badgeColor: '#0ea5e9', molarMass: 74.09,
    hazard: 'irritant', description: 'Clear limewater turns milky white when CO₂ gas is bubbled through due to CaCO₃ precipitate.',
    uses: ['White-Washing Walls', 'Limewater Test for CO₂', 'Soil Acidity Neutralization', 'Bleaching Powder Production']
  },
  {
    id: 'Mg_OH_2', formula: 'Mg(OH)₂', name: 'Magnesium Hydroxide', commonName: 'Milk of Magnesia',
    category: 'base', state: 'solid', pH: 10.5, color: 'bg-teal-500', badgeColor: '#14b8a6', molarMass: 58.32,
    hazard: 'safe', description: 'Mild antacid base that neutralizes excess stomach acid without damaging mucous lining.',
    uses: ['Antacid for Heartburn & Acidity', 'Laxative Suspension', 'Plastics Fire Retardant', 'Wastewater Treatment']
  },
  {
    id: 'NH4OH', formula: 'NH₄OH', name: 'Ammonium Hydroxide', commonName: 'Ammonia Solution / Household Ammonia',
    category: 'base', state: 'liquid', pH: 11.6, color: 'bg-cyan-600', badgeColor: '#0891b2', molarMass: 35.05,
    hazard: 'irritant', description: 'Pungent weak base that dissolves copper hydroxide precipitates into deep blue complex ion.',
    uses: ['Household Glass & Window Cleaners', 'Qualitative Cation Analysis', 'Textile Processing', 'Fertilizer Synthesis']
  },
  {
    id: 'Ba_OH_2', formula: 'Ba(OH)₂', name: 'Barium Hydroxide', commonName: 'Baryta Water',
    category: 'base', state: 'solid', pH: 13.5, color: 'bg-blue-700', badgeColor: '#1d4ed8', molarMass: 171.34,
    hazard: 'toxic', description: 'Reacts endothermically with ammonium thiocyanate or NH₄Cl, dropping temperatures below -20°C!',
    uses: ['Organic Base in Synthesis', 'Baryta Water Carbonate Detection', 'Sugar Refining', 'Endothermic Lab Demos']
  },

  // ── SALTS & MINERALS ──────────────────────────────────────────────────────
  {
    id: 'NaCl', formula: 'NaCl', name: 'Sodium Chloride', commonName: 'Common Table Salt / Rock Salt (Halite)',
    category: 'salt', state: 'solid', pH: 7.0, color: 'bg-slate-700', badgeColor: '#334155', molarMass: 58.44,
    hazard: 'safe', description: 'Essential ionic crystal salt. Raw material for chlor-alkali process (producing NaOH, Cl₂, H₂).',
    uses: ['Food Seasoning & Preservation', 'Chlor-Alkali Industrial Feedstock', 'Road De-icing in Winter', 'Saline IV Drip (0.9%)']
  },
  {
    id: 'CuSO4', formula: 'CuSO₄', name: 'Copper(II) Sulfate', commonName: 'Blue Vitriol (Hydrated: CuSO₄·5H₂O)',
    category: 'salt', state: 'solid', pH: 5.5, color: 'bg-sky-600', badgeColor: '#0284c7', molarMass: 159.61,
    hazard: 'irritant', description: 'Brilliant deep blue crystalline salt. Undergoes single displacement with Fe nails to turn green FeSO₄.',
    uses: ['Bordeaux Mixture Fungicide', 'Electroplating & Refining Copper', 'Fe Nail Displacement NCERT Activity', 'Algae Control in Pools']
  },
  {
    id: 'FeSO4', formula: 'FeSO₄', name: 'Iron(II) Sulfate', commonName: 'Green Vitriol (FeSO₄·7H₂O)',
    category: 'salt', state: 'solid', pH: 5.0, color: 'bg-emerald-700', badgeColor: '#047857', molarMass: 151.91,
    hazard: 'irritant', description: 'Pale green crystals. Decomposes on heating with a smell of burning sulfur (SO₂ + SO₃) to reddish Fe₂O₃.',
    uses: ['Thermal Decomposition NCERT Activity', 'Iron Deficiency Anemia Tablets', 'Black Ink & Dye Manufacture', 'Water Flocculant']
  },
  {
    id: 'AgNO3', formula: 'AgNO₃', name: 'Silver Nitrate', commonName: 'Lunar Caustic / Indelible Election Ink',
    category: 'salt', state: 'solid', pH: 6.0, color: 'bg-zinc-600', badgeColor: '#52525b', molarMass: 169.87,
    hazard: 'corrosive', description: 'Forms curdy white AgCl precipitate instantly when mixed with chlorides. Stains skin black in sunlight.',
    uses: ['Precipitation Test for Halides (Cl⁻, Br⁻, I⁻)', 'Voter Election Indelible Ink', 'Mirror Silvering', 'Wound Cauterization']
  },
  {
    id: 'KI', formula: 'KI', name: 'Potassium Iodide', commonName: 'Potassium Iodide',
    category: 'salt', state: 'solid', pH: 7.0, color: 'bg-purple-700', badgeColor: '#7e22ce', molarMass: 166.00,
    hazard: 'safe', description: 'Colorless soluble salt. Reacts with lead nitrate to form a brilliant golden-yellow precipitate of PbI₂.',
    uses: ['Golden Rain NCERT Experiment with Pb(NO₃)₂', 'Radiation Thyroid Blocking Tablets', 'Iodized Table Salt Additive', 'Iodine Solution Reagent']
  },
  {
    id: 'Pb_NO3_2', formula: 'Pb(NO₃)₂', name: 'Lead(II) Nitrate', commonName: 'Lead Nitrate',
    category: 'salt', state: 'solid', pH: 4.5, color: 'bg-stone-700', badgeColor: '#44403c', molarMass: 331.2,
    hazard: 'toxic', description: 'Thermal decomposition produces crackling decrepitation sound, yellow PbO solid, and pungent brown NO₂ fumes.',
    uses: ['Thermal Decomposition Activity 1.6', 'Yellow PbI₂ Precipitation Activity 1.2', 'Gold & Silver Pyrometallurgy', 'Matches & Explosives']
  },
  {
    id: 'PbI2', formula: 'PbI₂', name: 'Lead(II) Iodide', commonName: 'Golden Rain Precipitate',
    category: 'salt', state: 'solid', pH: 6.0, color: 'bg-amber-600', badgeColor: '#d97706', molarMass: 461.01,
    hazard: 'toxic', description: 'Intensely bright yellow insoluble precipitate formed from double displacement of Pb(NO₃)₂ + KI.',
    uses: ['Perovskite Solar Cells', 'X-ray & Gamma-ray Detectors', 'NCERT Double Displacement Benchmark']
  },
  {
    id: 'BaCl2', formula: 'BaCl₂', name: 'Barium Chloride', commonName: 'Barium Chloride',
    category: 'salt', state: 'solid', pH: 6.5, color: 'bg-indigo-700', badgeColor: '#4338ca', molarMass: 208.23,
    hazard: 'toxic', description: 'Standard reagent to confirm presence of sulfate ions ($SO_4^{2-}$). Yields insoluble white BaSO₄.',
    uses: ['Sulfate Ion Test in Qualitative Analysis', 'Green Pyrotechnic Flares', 'Heat Treatment Salts', 'Pigment Manufacturing']
  },
  {
    id: 'Na2SO4', formula: 'Na₂SO₄', name: 'Sodium Sulfate', commonName: 'Glauber’s Salt (Na₂SO₄·10H₂O)',
    category: 'salt', state: 'solid', pH: 7.0, color: 'bg-blue-700', badgeColor: '#1d4ed8', molarMass: 142.04,
    hazard: 'safe', description: 'Inert soluble neutral salt. Reacts with BaCl₂ in NCERT Activity 1.10 double displacement reaction.',
    uses: ['Powdered Laundry Detergents', 'Kraft Wood Pulp Paper Process', 'Thermal Heat Storage in Solar Panels', 'Glass Refining']
  },
  {
    id: 'BaSO4', formula: 'BaSO₄', name: 'Barium Sulfate', commonName: 'Barite / Blanc Fixe',
    category: 'salt', state: 'solid', pH: 7.0, color: 'bg-slate-700', badgeColor: '#334155', molarMass: 233.39,
    hazard: 'safe', description: 'Extremely insoluble white dense precipitate. Safe for medical ingestion as X-ray radiocontrast.',
    uses: ['Barium Meal X-ray Contrast', 'Bright White Paint Pigment', 'Oil Well Drilling Muds', 'Plastics Filler']
  },
  {
    id: 'CaCO3', formula: 'CaCO₃', name: 'Calcium Carbonate', commonName: 'Limestone / Marble / Chalk / Eggshell',
    category: 'salt', state: 'solid', pH: 9.0, color: 'bg-teal-700', badgeColor: '#0f766e', molarMass: 100.09,
    hazard: 'safe', description: 'Effervesces briskly with dilute HCl evolving CO₂ gas. Decomposes on strong heating to Quicklime (CaO).',
    uses: ['Cement & Construction Marble', 'Blackboard Chalk & Paper Coating', 'Antacid Tablets (Tums)', 'Lime (CaO) Production']
  },
  {
    id: 'Na2CO3', formula: 'Na₂CO₃', name: 'Sodium Carbonate', commonName: 'Washing Soda (Na₂CO₃·10H₂O) / Soda Ash',
    category: 'salt', state: 'solid', pH: 11.5, color: 'bg-cyan-700', badgeColor: '#0e7490', molarMass: 105.99,
    hazard: 'irritant', description: 'Alkaline salt manufactured by Solvay Process. Removes permanent hardness of water ($Ca^{2+}, Mg^{2+}$).',
    uses: ['Softening Hard Water', 'Glass, Soap & Paper Industry', 'Washing Clothes Detergent', 'Cleaning Agent']
  },
  {
    id: 'NaHCO3', formula: 'NaHCO₃', name: 'Sodium Hydrogen Carbonate', commonName: 'Baking Soda / Sodium Bicarbonate',
    category: 'salt', state: 'solid', pH: 8.4, color: 'bg-emerald-800', badgeColor: '#065f46', molarMass: 84.01,
    hazard: 'safe', description: 'Mild non-corrosive base. Releases CO₂ gas on heating or adding tartaric acid, making cakes soft and spongy.',
    uses: ['Baking Powder for Fluffy Cakes', 'Soda-Acid Fire Extinguishers', 'Mild Antacid for Acidity', 'Odor Absorber']
  },
  {
    id: 'NH4Cl', formula: 'NH₄Cl', name: 'Ammonium Chloride', commonName: 'Sal Ammoniac / Navsadar',
    category: 'salt', state: 'solid', pH: 5.0, color: 'bg-violet-800', badgeColor: '#5b21b6', molarMass: 53.49,
    hazard: 'irritant', description: 'Sublimes directly from solid to gas on heating, decomposing into NH₃ and HCl which recombine on cooling.',
    uses: ['Sublimation Demonstration in NCERT', 'Dry Leclanché Cell Electrolyte', 'Soldering Flux for Cleaning Metals', 'Cough Expectorant']
  },
  {
    id: 'KNO3', formula: 'KNO₃', name: 'Potassium Nitrate', commonName: 'Saltpeter / Nitre',
    category: 'salt', state: 'solid', pH: 7.0, color: 'bg-purple-800', badgeColor: '#6b21a8', molarMass: 101.10,
    hazard: 'oxidizer', description: 'Potent oxidizing salt. Traditional ingredient of black gunpowder (75% KNO₃ + 15% Charcoal + 10% Sulfur).',
    uses: ['Gunpowder & Pyrotechnics', 'High-grade Greenhouse Fertilizers', 'Molten Salt Solar Thermal Storage', 'Toothpaste for Sensitive Teeth']
  },
  {
    id: 'KMnO4', formula: 'KMnO₄', name: 'Potassium Permanganate', commonName: 'Condy’s Crystals / Purple Mineral Chameleon',
    category: 'salt', state: 'solid', pH: 7.0, color: 'bg-fuchsia-950', badgeColor: '#4a044e', molarMass: 158.03,
    hazard: 'oxidizer', description: 'Deep violet crystals giving an intense magenta solution. Powerful oxidizing agent in redox titrations.',
    uses: ['Alkaline KMnO₄ Oxidation of Ethanol to Ethanoic Acid', 'Well Water Disinfection', 'Redox Volumetric Titrations', 'Antiseptic Footbath']
  },
  {
    id: 'K2Cr2O7', formula: 'K₂Cr₂O₇', name: 'Potassium Dichromate', commonName: 'Potassium Bichromate',
    category: 'salt', state: 'solid', pH: 4.0, color: 'bg-orange-700', badgeColor: '#c2410c', molarMass: 294.18,
    hazard: 'toxic', description: 'Bright orange crystalline oxidizer. Turns green ($Cr^{3+}$) upon oxidizing alcohol or SO₂ gas in breathalyzers.',
    uses: ['Classic Police Breathalyzer for Alcohol', 'Acidified Dichromate Oxidation of Alcohols', 'Leather Tanning', 'Screen Printing Photogravure']
  },
  {
    id: 'KClO3', formula: 'KClO₃', name: 'Potassium Chlorate', commonName: 'Potassium Chlorate',
    category: 'salt', state: 'solid', pH: 7.0, color: 'bg-sky-800', badgeColor: '#075985', molarMass: 122.55,
    hazard: 'oxidizer', description: 'Decomposes on heating with MnO₂ catalyst at 200°C to release pure Oxygen gas ($O_2$).',
    uses: ['Laboratory Preparation of Oxygen Gas', 'Safety Matches Friction Heads', 'Fireworks & Flares', 'Chlorate Chemical Oxygen Generators in Aircraft']
  },
  {
    id: 'CaSO4_2H2O', formula: 'CaSO₄·2H₂O', name: 'Calcium Sulfate Dihydrate', commonName: 'Gypsum',
    category: 'salt', state: 'solid', pH: 7.0, color: 'bg-stone-700', badgeColor: '#44403c', molarMass: 172.17,
    hazard: 'safe', description: 'Heating gypsum at 373 K (100°C) loses water to form Plaster of Paris ($CaSO_4·½H_2O$).',
    uses: ['Retards Fast Setting of Portland Cement', 'Drywall Wallboard Plaster', 'Soil Conditioner', 'Alabaster Statues']
  },
  {
    id: 'CaSO4_halfH2O', formula: 'CaSO₄·½H₂O', name: 'Calcium Sulfate Hemihydrate', commonName: 'Plaster of Paris (POP)',
    category: 'salt', state: 'solid', pH: 7.0, color: 'bg-stone-700', badgeColor: '#44403c', molarMass: 145.15,
    hazard: 'safe', description: 'White powder that hardens into solid gypsum within 10-15 minutes when mixed with water with mild heat.',
    uses: ['Setting Fractured Bones in Hospitals', 'Statues, Moulds & Toys', 'False Ceilings & Decorative Plasterwork', 'Dentistry Moulds']
  },
  {
    id: 'FeCl3', formula: 'FeCl₃', name: 'Iron(III) Chloride', commonName: 'Ferric Chloride',
    category: 'salt', state: 'solid', pH: 2.0, color: 'bg-amber-800', badgeColor: '#92400e', molarMass: 162.20,
    hazard: 'corrosive', description: 'Yellowish-brown solution. Reacts with NaOH to form a dense reddish-brown gelatinous precipitate of Fe(OH)₃.',
    uses: ['PCB Copper Etching Solution', 'Wastewater Coagulant', 'Phenol Detection Color Test (Violet Complex)', 'Styptic Bleeding Stopper']
  },
  {
    id: 'ZnSO4', formula: 'ZnSO₄', name: 'Zinc Sulfate', commonName: 'White Vitriol (ZnSO₄·7H₂O)',
    category: 'salt', state: 'solid', pH: 5.5, color: 'bg-teal-800', badgeColor: '#115e59', molarMass: 161.47,
    hazard: 'irritant', description: 'White crystalline soluble salt formed when zinc granules react with dilute sulfuric acid.',
    uses: ['Zinc Supplement in Agriculture & Health', 'Electrogalvanizing Electrolyte', 'Rayon Viscose Spinning Bath', 'NCERT Daniell Cell Electrolyte']
  },

  // ── OXIDES & PEROXIDES ───────────────────────────────────────────────────
  {
    id: 'CaO', formula: 'CaO', name: 'Calcium Oxide', commonName: 'Quicklime / Burnt Lime',
    category: 'oxide', state: 'solid', pH: 12.5, color: 'bg-stone-700', badgeColor: '#44403c', molarMass: 56.08,
    hazard: 'corrosive', description: 'Reacts violently with water with a loud hissing sound, boiling heat, and forming slaked lime Ca(OH)₂.',
    uses: ['Activity 1.4 Exothermic Combination Reaction', 'Steel Smelting Flux', 'Cement Manufacturing', 'Glass Making']
  },
  {
    id: 'Fe2O3', formula: 'Fe₂O₃', name: 'Iron(III) Oxide', commonName: 'Rust / Red Hematite',
    category: 'oxide', state: 'solid', pH: 7.0, color: 'bg-red-800', badgeColor: '#991b1b', molarMass: 159.69,
    hazard: 'safe', description: 'Reddish-brown flaky powder formed by corrosion of iron in moist air. Used in Thermite reaction with Al.',
    uses: ['Thermite Welding of Railway Tracks (with Al powder)', 'Red Ochre Pigment', 'Jeweler’s Rouge Polishing Compound', 'Magnetic Tapes (γ-Fe₂O₃)']
  },
  {
    id: 'CuO', formula: 'CuO', name: 'Copper(II) Oxide', commonName: 'Black Copper Oxide / Tenorite',
    category: 'oxide', state: 'solid', pH: 7.0, color: 'bg-slate-800', badgeColor: '#1e293b', molarMass: 79.55,
    hazard: 'irritant', description: 'Black layer formed on heating red copper in air ($2Cu + O_2 \\rightarrow 2CuO$). Reduced by H₂ gas back to pink copper.',
    uses: ['Activity 1.11 Redox Oxidation of Copper', 'Blue-Green Glazes in Ceramics', 'CO/CO₂ Gas Catalytic Oxidation', 'Wood Preservative']
  },
  {
    id: 'Al2O3', formula: 'Al₂O₃', name: 'Aluminium Oxide', commonName: 'Alumina / Sapphire / Ruby / Corundum',
    category: 'oxide', state: 'solid', pH: 7.0, color: 'bg-blue-700', badgeColor: '#1d4ed8', molarMass: 101.96,
    hazard: 'safe', description: 'Classic amphoteric oxide: reacts with both acids (HCl) and strong bases (NaOH) to form salts and water.',
    uses: ['Amphoteric Oxide NCERT Benchmark', 'Sandpaper & Grinding Wheels Abrasive', 'Aluminum Metal Smelting (Hall-Héroult)', 'High-temp Refractory Bricks']
  },
  {
    id: 'ZnO', formula: 'ZnO', name: 'Zinc Oxide', commonName: 'Philosopher’s Wool / Zinc White',
    category: 'oxide', state: 'solid', pH: 7.0, color: 'bg-amber-700', badgeColor: '#b45309', molarMass: 81.38,
    hazard: 'safe', description: 'Amphoteric oxide. Yellow when hot, turns white on cooling (thermochromism due to crystal defect).',
    uses: ['Broad-Spectrum Mineral Sunscreen', 'Calamine Anti-itch Lotion', 'Rubber Tire Vulcanization Activator', 'Zinc White Oil Paint Pigment']
  },
  {
    id: 'MnO2', formula: 'MnO₂', name: 'Manganese Dioxide', commonName: 'Pyrolusite',
    category: 'oxide', state: 'solid', pH: 7.0, color: 'bg-slate-900', badgeColor: '#0f172a', molarMass: 86.94,
    hazard: 'irritant', description: 'Black catalyst that triggers vigorous bubbling decomposition of Hydrogen Peroxide ($H_2O_2$) into $O_2$ gas.',
    uses: ['Catalytic Decomposition of H₂O₂', 'Dry Cell Battery Depolarizer', 'Preparation of Chlorine Gas from HCl', 'Decolorizing Green Iron Glass']
  },
  {
    id: 'H2O2', formula: 'H₂O₂', name: 'Hydrogen Peroxide', commonName: 'Peroxide',
    category: 'oxide', state: 'liquid', pH: 6.0, color: 'bg-cyan-700', badgeColor: '#0e7490', molarMass: 34.01,
    hazard: 'oxidizer', description: 'Pale blue liquid that rapidly decomposes into water and oxygen gas in presence of MnO₂ or blood catalase.',
    uses: ['Wound Disinfectant & Antiseptic', 'Hair & Paper Pulp Bleaching', 'Elephant Toothpaste Demo', 'Rocket High-test Peroxide Monopropellant']
  },
  {
    id: 'CO2', formula: 'CO₂', name: 'Carbon Dioxide', commonName: 'Dry Ice (Solid CO₂)',
    category: 'oxide', state: 'gas', pH: 5.5, color: 'bg-slate-700', badgeColor: '#334155', molarMass: 44.01,
    hazard: 'safe', description: 'Colorless, odorless gas heavier than air. Turns lime water milky white and extinguishes burning splints.',
    uses: ['Photosynthesis in Plants', 'Carbonated Drinks', 'Fire Extinguishers', 'Dry Ice Cryogenic Blast Cleaning (-78.5°C)']
  },
  {
    id: 'SO2', formula: 'SO₂', name: 'Sulfur Dioxide', commonName: 'Sulfur Dioxide',
    category: 'oxide', state: 'gas', pH: 3.0, color: 'bg-amber-600', badgeColor: '#d97706', molarMass: 64.07,
    hazard: 'toxic', description: 'Choking pungent gas with smell of burning sulfur. Turns acidified potassium dichromate paper from orange to green.',
    uses: ['Sulfuric Acid Contact Process Feedstock', 'Wine Preservative (Antioxidant & Antimicrobial)', 'Paper Pulp Bleaching', 'Acid Rain Precursor']
  },
  {
    id: 'NO2', formula: 'NO₂', name: 'Nitrogen Dioxide', commonName: 'Brown Fumes',
    category: 'oxide', state: 'gas', pH: 2.5, color: 'bg-amber-800', badgeColor: '#92400e', molarMass: 46.01,
    hazard: 'toxic', description: 'Prominent reddish-brown toxic gas evolved during thermal decomposition of lead nitrate or reaction of copper with conc. HNO₃.',
    uses: ['Thermal Decomposition Activity 1.6 Observation', 'Nitric Acid Ostwald Process Intermediate', 'Rocket Oxidizer (Dinitrogen Tetroxide N₂O₄)']
  },

  // ── ORGANIC COMPOUNDS ────────────────────────────────────────────────────
  {
    id: 'CH4', formula: 'CH₄', name: 'Methane', commonName: 'Marsh Gas / Natural Gas / Biogas (65%)',
    category: 'organic', state: 'gas', pH: 7.0, color: 'bg-violet-600', badgeColor: '#7c3aed', molarMass: 16.04,
    hazard: 'flammable', description: 'Simplest alkane and cleanest burning fossil fuel. Burns with a clean pale blue flame ($CH_4 + 2O_2 \\rightarrow CO_2 + 2H_2O$).',
    uses: ['CNG Vehicle Fuel & PNG Kitchen Gas', 'Hydrogen Gas Production (Steam Methane Reforming)', 'Biogas Fuel in Rural India', 'Carbon Black for Tires']
  },
  {
    id: 'C2H5OH', formula: 'C₂H₅OH', name: 'Ethanol', commonName: 'Ethyl Alcohol / Rectified Spirit',
    category: 'organic', state: 'liquid', pH: 7.0, color: 'bg-indigo-600', badgeColor: '#4f46e5', molarMass: 46.07,
    hazard: 'flammable', description: 'Volatile liquid with characteristic intoxicating odor. Undergoes esterification with ethanoic acid to form sweet fruity ester.',
    uses: ['Tincture of Iodine & Cough Syrups', 'Hand Sanitizers & Disinfectants (70% v/v)', 'E20 Biofuel Blend with Petrol', 'Solvent for Paints & Perfumes']
  },
  {
    id: 'CH3COOC2H5', formula: 'CH₃COOC₂H₅', name: 'Ethyl Ethanoate', commonName: 'Ethyl Acetate / Sweet Fruity Ester',
    category: 'organic', state: 'liquid', pH: 7.0, color: 'bg-pink-600', badgeColor: '#db2777', molarMass: 88.11,
    hazard: 'flammable', description: 'Pleasantly sweet, fruity smelling ester formed by acid-catalyzed condensation of ethanol and ethanoic acid.',
    uses: ['Perfumes & Artificial Fruit Flavorings', 'Non-acetone Nail Polish Remover', 'Coffee Decaffeination Solvent', 'Esterification NCERT Activity 4.8']
  },
  {
    id: 'C6H12O6', formula: 'C₆H₁₂O₆', name: 'Glucose', commonName: 'Dextrose / Blood Sugar / Grape Sugar',
    category: 'organic', state: 'solid', pH: 7.0, color: 'bg-emerald-600', badgeColor: '#059669', molarMass: 180.16,
    hazard: 'safe', description: 'Universal cellular energy currency. Oxidized in respiration ($C_6H_{12}O_6 + 6O_2 \\rightarrow 6CO_2 + 6H_2O + 38 ATP$).',
    uses: ['Instant Energy Drinks', 'Cellular Respiration in Biology', 'Photosynthesis End Product', 'Hospital Intravenous Drip']
  },
  {
    id: 'C2H4', formula: 'C₂H₄', name: 'Ethene', commonName: 'Ethylene',
    category: 'organic', state: 'gas', pH: 7.0, color: 'bg-purple-600', badgeColor: '#9333ea', molarMass: 28.05,
    hazard: 'flammable', description: 'Simplest alkene with carbon-carbon double bond. Plant hormone responsible for fruit ripening.',
    uses: ['Polyethylene (Polythene) Plastics', 'Artificial Ripening of Bananas & Mangoes', 'Ethylene Glycol Antifreeze Synthesis']
  },
  {
    id: 'C2H2', formula: 'C₂H₂', name: 'Ethyne', commonName: 'Acetylene',
    category: 'organic', state: 'gas', pH: 7.0, color: 'bg-red-600', badgeColor: '#dc2626', molarMass: 26.04,
    hazard: 'flammable', description: 'Alkyne with carbon-carbon triple bond. Burns with pure oxygen at 3300°C in oxy-acetylene welding torches.',
    uses: ['Oxy-Acetylene High-temp Metal Welding & Cutting', 'Synthetic Rubber & Polymers', 'Calcium Carbide Fruit Ripening']
  },

  // ── INDICATORS & REAGENTS ────────────────────────────────────────────────
  {
    id: 'Ind_Universal', formula: 'Universal Indicator', name: 'Universal pH Indicator Solution', commonName: 'Rainbow pH Indicator',
    category: 'indicator', state: 'liquid', pH: 7.0, color: 'bg-emerald-600', badgeColor: '#059669', molarMass: 0,
    hazard: 'safe', description: 'Mixture of dyes showing smooth rainbow color spectrum: Red (pH 0-3), Orange/Yellow (pH 4-6), Green (pH 7), Blue (pH 8-10), Violet/Purple (pH 11-14).',
    uses: ['Broad-spectrum pH Measurement', 'Acid-Base Titrations', 'Classroom Color Demos']
  },
  {
    id: 'Ind_Phenolphthalein', formula: 'C₂₀H₁₄O₄', name: 'Phenolphthalein Indicator', commonName: 'Acid-Base Indicator',
    category: 'indicator', state: 'liquid', pH: 7.0, color: 'bg-pink-600', badgeColor: '#db2777', molarMass: 318.32,
    hazard: 'safe', description: 'Colorless in acidic and neutral solutions (pH < 8.2), turns intense bright magenta pink in basic/alkaline solutions (pH > 8.2).',
    uses: ['Acid-Base Neutralization Endpoint', 'Anti-corruption Currency Trapping Dye', 'Concrete Carbonation Depth Testing']
  },
  {
    id: 'Ind_MethylOrange', formula: 'C₁₄H₁₄N₃NaO₃S', name: 'Methyl Orange Indicator', commonName: 'Methyl Orange',
    category: 'indicator', state: 'liquid', pH: 7.0, color: 'bg-orange-600', badgeColor: '#ea580c', molarMass: 327.33,
    hazard: 'safe', description: 'Bright red in acidic solutions (pH < 3.1) and golden yellow in neutral and basic solutions (pH > 4.4).',
    uses: ['Strong Acid - Weak Base Titrations', 'Water Alkalinity Testing']
  },
  {
    id: 'Ind_Litmus_Red', formula: 'Red Litmus', name: 'Red Litmus Solution/Paper', commonName: 'Lichen Dye (Roccellaceae)',
    category: 'indicator', state: 'liquid', pH: 5.0, color: 'bg-rose-600', badgeColor: '#e11d48', molarMass: 0,
    hazard: 'safe', description: 'Natural dye extracted from lichens. Remains red in acids; turns bright blue in base/alkali.',
    uses: ['Basic Solution Verification', 'Standard NCERT Acid-Base Test']
  },
  {
    id: 'Ind_Litmus_Blue', formula: 'Blue Litmus', name: 'Blue Litmus Solution/Paper', commonName: 'Blue Litmus',
    category: 'indicator', state: 'liquid', pH: 8.0, color: 'bg-blue-600', badgeColor: '#2563eb', molarMass: 0,
    hazard: 'safe', description: 'Natural lichen indicator. Remains blue in basic/neutral; turns bright red in acid solution.',
    uses: ['Acidic Solution Verification', 'Standard NCERT Acid-Base Test']
  },
  {
    id: 'Ind_Turmeric', formula: 'Curcumin', name: 'Turmeric Indicator', commonName: 'Haldi Extract',
    category: 'indicator', state: 'liquid', pH: 7.0, color: 'bg-amber-600', badgeColor: '#d97706', molarMass: 368.38,
    hazard: 'safe', description: 'Natural yellow indicator. Remains yellow in acids; turns reddish-brown in basic solutions like soap.',
    uses: ['Curry Stain Washing Demonstration', 'Natural Non-toxic Indicator']
  },
  {
    id: 'Ind_Starch', formula: '(C₆H₁₀O₅)ₙ', name: 'Starch Solution', commonName: 'Starch Indicator',
    category: 'indicator', state: 'liquid', pH: 7.0, color: 'bg-indigo-800', badgeColor: '#3730a3', molarMass: 0,
    hazard: 'safe', description: 'Forms a magnificent deep blue-black charge-transfer complex with elementary iodine ($I_2 / I_3^-$).',
    uses: ['Iodometric Titrations', 'Photosynthesis Starch Leaf Test', 'Amylase Enzyme Activity Demo']
  }
];

export function getCompound(id: string): ChemicalCompound | undefined {
  const clean = id.trim();
  return ALL_COMPOUNDS.find(c => c.id.toLowerCase() === clean.toLowerCase() || c.formula.toLowerCase() === clean.toLowerCase() || c.name.toLowerCase() === clean.toLowerCase());
}
