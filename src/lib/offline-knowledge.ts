// Comprehensive Offline Knowledge Engine for EduTrack CBSE Class 6-10 Curriculum

export interface KnowledgeEntry {
  keywords: string[];
  title: string;
  subject: "Science" | "Mathematics" | "Social Science";
  reply: string;
}

export const OFFLINE_KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    keywords: ["photosynthesis", "photosynthetic", "chlorophyll", "stomata", "autotrophic nutrition"],
    title: "Photosynthesis (Class 10 Science - Life Processes)",
    subject: "Science",
    reply: `### **Photosynthesis - NCERT Concept Breakdown**

**1. Definition:**
**Photosynthesis** is the fundamental biochemical process by which green plants (autotrophs) synthesize organic nutrients (glucose) from inorganic raw materials (**Carbon dioxide** and **Water**) in the presence of **Sunlight** absorbed by **Chlorophyll**.

**2. Chemical Equation:**
$$6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\xrightarrow[\\text{Chlorophyll}]{\\text{Sunlight}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$$

*(Note: Oxygen gas (O₂) is liberated as a byproduct into the atmosphere).*

**3. Three Main Events During Photosynthesis (Class 10 Board Core Topic):**
1. **Absorption of light energy** by chlorophyll pigments present in chloroplasts.
2. **Conversion of light energy to chemical energy** and **splitting of water molecules (H₂O)** into hydrogen (H₂) and oxygen (O₂).
3. **Reduction of Carbon Dioxide (CO₂)** to carbohydrates (Glucose).

**4. Site & Key Structures:**
- **Site of Photosynthesis:** **Chloroplasts** (organelles containing chlorophyll located in mesophyll cells of leaves).
- **Stomata:** Microscopic pores on leaf surfaces regulated by pairs of **Guard Cells**. They facilitate gas exchange (CO₂ intake, O₂ release) and transpiration.

**5. CBSE Board Exam Key Takeaways:**
- **Raw Materials:** CO₂ (from air via stomata) and H₂O (from soil via xylem).
- **Storage:** Excess glucose is stored in plants in the form of **Starch** (in animals, energy is stored as Glycogen).`
  },
  {
    keywords: ["respiration", "aerobic", "anaerobic", "glycolysis", "pyruvate", "atp"],
    title: "Respiration in Organisms (Class 10 Science - Life Processes)",
    subject: "Science",
    reply: `### **Respiration - NCERT Concept Breakdown**

**1. Definition:**
**Respiration** is the cellular metabolic process in which glucose is oxidized/broken down to release energy in the form of **ATP** (Adenosine Triphosphate).

**2. Breakdown Pathways of Glucose (Class 10 Core Diagram):**
1. **Glycolysis (In Cytoplasm):** 
   $$\\text{Glucose (6-Carbon)} \\rightarrow \\text{Pyruvate (3-Carbon)} + \\text{Energy}$$

2. **Pathways of Pyruvate Breakdown:**
   - **Aerobic Respiration (In Mitochondria - Presence of O₂):**
     $$\\text{Pyruvate} \\rightarrow \\text{CO}_2 + \\text{H}_2\\text{O} + \\text{Energy (38 ATP)}$$
   - **Anaerobic Respiration in Yeast (Absence of O₂ - Fermentation):**
     $$\\text{Pyruvate} \\rightarrow \\text{Ethanol (C}_2\\text{H}_5\\text{OH)} + \\text{CO}_2 + \\text{Energy (2 ATP)}$$
   - **Anaerobic Respiration in Human Muscle Cells (Lack of O₂ during heavy exercise):**
     $$\\text{Pyruvate} \\rightarrow \\text{Lactic Acid (3-Carbon)} + \\text{Energy (2 ATP)}$$
     *(Accumulation of Lactic Acid causes muscle cramps).*

**3. Aerobic vs. Anaerobic Respiration Comparison:**
- **Aerobic:** Requires O₂, occurs in cytoplasm + mitochondria, yields high energy (38 ATP).
- **Anaerobic:** Occurs without O₂, yields low energy (2 ATP), produces ethanol or lactic acid.

**4. CBSE Board Exam Tip:**
ATP is known as the **"Energy Currency of the Cell"**. Endothermic reactions in cells are driven using energy released from ATP hydrolysis (~30.5 kJ/mol).`
  },
  {
    keywords: ["newton", "force", "laws of motion", "inertia", "momentum", "f=ma", "f = ma"],
    title: "Newton's Laws of Motion (Class 9 Science - Force & Laws of Motion)",
    subject: "Science",
    reply: `### **Newton's Laws of Motion - NCERT Concept Breakdown**

**1. Newton's First Law of Motion (Law of Inertia):**
An object continues in its state of rest or uniform motion along a straight line unless acted upon by an external unbalanced force.
- **Inertia:** The inherent property of an object to resist changes in its state of motion. Mass is the measure of inertia.

**2. Newton's Second Law of Motion & Derivation of $F = ma$:**
The rate of change of momentum of an object is directly proportional to the applied unbalanced force and takes place in the direction of the force.
- **Mathematical Derivation:**
  - Let mass = $m$, initial velocity = $u$, final velocity = $v$, time = $t$.
  - Initial momentum $p_1 = mu$, Final momentum $p_2 = mv$.
  - Change in momentum $\\Delta p = mv - mu = m(v - u)$.
  - Rate of change of momentum $= \\frac{m(v - u)}{t} = ma$ (since acceleration $a = \\frac{v - u}{t}$).
  - Force $F \\propto ma \\implies F = k \\cdot ma$. In SI units ($k = 1$), **$F = ma$**.
- **SI Unit of Force:** **Newton (N)** or $\\text{kg}\\cdot\\text{m/s}^2$.

**3. Newton's Third Law of Motion:**
To every action, there is an equal and opposite reaction, and they act on two different bodies simultaneously.
- **Examples:** Recoil of a gun upon firing, rowing a boat, rocket propulsion.`
  },
  {
    keywords: ["light", "reflection", "refraction", "mirror", "lens", "snell", "focal length", "refractive index"],
    title: "Light: Reflection and Refraction (Class 10 Science)",
    subject: "Science",
    reply: `### **Light: Reflection & Refraction - NCERT Concept Breakdown**

**1. Laws of Reflection:**
1. The angle of incidence ($\\angle i$) is equal to the angle of reflection ($\\angle r$).
2. The incident ray, the reflected ray, and the normal to the mirror at the point of incidence all lie in the same plane.

**2. Mirror Formula & Magnification:**
- **Mirror Formula:** 
  $$\\frac{1}{f} = \\frac{1}{v} + \\frac{1}{u}$$
  *(where $f$ = focal length, $v$ = image distance, $u$ = object distance).*
- **Magnification ($m$):** 
  $$m = \\frac{h'}{h} = -\\frac{v}{u}$$

**3. Laws of Refraction & Snell's Law:**
1. The incident ray, refracted ray, and normal to the interface at the point of incidence lie in the same plane.
2. **Snell's Law:** The ratio of the sine of the angle of incidence to the sine of the angle of refraction is constant for a given pair of media:
   $$\\frac{\\sin i}{\\sin r} = n_{21} = \\frac{v_1}{v_2}$$

**4. Lens Formula & Power of a Lens:**
- **Lens Formula:** 
  $$\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u}$$
- **Power of Lens ($P$):** 
  $$P = \\frac{1}{f \\text{ (in meters)}}$$
  *(Unit: **Dioptre (D)**. Convex lens has $+P$, Concave lens has $-P$).*`
  },
  {
    keywords: ["electricity", "ohm", "ohms law", "resistance", "resistivity", "joule heating", "voltage", "current"],
    title: "Electricity & Ohm's Law (Class 10 Science)",
    subject: "Science",
    reply: `### **Electricity - NCERT Concept Breakdown**

**1. Electric Current & Potential Difference:**
- **Current ($I$):** Rate of flow of electric charge: $I = \\frac{Q}{t}$ (Unit: **Ampere, A**).
- **Potential Difference ($V$):** Work done to move a unit positive charge: $V = \\frac{W}{Q}$ (Unit: **Volt, V**).

**2. Ohm's Law:**
The electric current flowing through a metallic conductor is directly proportional to the potential difference across its ends, provided its temperature remains constant.
$$V \\propto I \\implies V = IR$$
*(where $R$ is the electrical resistance of the conductor, unit: **Ohm, $\\Omega$**).*

**3. Factors Affecting Resistance:**
$$R = \\rho \\frac{L}{A}$$
- $L$ = Length of conductor, $A$ = Cross-sectional area, $\\rho$ = Resistivity of material (Unit: $\\Omega\\cdot\\text{m}$).

**4. Resistors in Series and Parallel:**
- **Series Combination:** $R_s = R_1 + R_2 + R_3$ (Same current $I$, split voltage $V$).
- **Parallel Combination:** $\\frac{1}{R_p} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}$ (Same voltage $V$, split current $I$).

**5. Joule's Law of Heating:**
$$H = I^2 R t = V I t = \\frac{V^2}{R} t$$
*(Applications: Electric iron, electric heater, safety fuse).*`
  },
  {
    keywords: ["acid", "base", "salt", "ph", "neutralization", "baking soda", "washing soda", "plaster of paris", "bleaching powder"],
    title: "Acids, Bases and Salts (Class 10 Science)",
    subject: "Science",
    reply: `### **Acids, Bases and Salts - NCERT Concept Breakdown**

**1. Definitions:**
- **Acids:** Produce $\\text{H}^+$ (or $\\text{H}_3\\text{O}^+$ hydronium) ions in aqueous solution. Sour in taste, turn blue litmus red.
- **Bases:** Produce $\\text{OH}^-$ (hydroxide) ions in aqueous solution. Bitter in taste, soapy to touch, turn red litmus blue.

**2. Neutralization Reaction:**
$$\\text{Acid} + \\text{Base} \\rightarrow \\text{Salt} + \\text{Water} + \\text{Heat}$$
$$\\text{HCl}_{(aq)} + \\text{NaOH}_{(aq)} \\rightarrow \\text{NaCl}_{(aq)} + \\text{H}_2\\text{O}_{(l)}$$

**3. The pH Scale:**
- Measures hydrogen ion concentration: $\\text{pH} < 7$ (Acidic), $\\text{pH} = 7$ (Neutral), $\\text{pH} > 7$ (Basic).
- **Importance in Daily Life:** Tooth decay starts when mouth $\\text{pH} < 5.5$; rain is called acid rain when $\\text{pH} < 5.6$.

**4. Important Chemical Compounds & Formulas:**
- **Bleaching Powder:** $\\text{CaOCl}_2$ (Calcium oxychloride).
- **Baking Soda:** $\\text{NaHCO}_3$ (Sodium hydrogen carbonate).
- **Washing Soda:** $\\text{Na}_2\\text{CO}_3 \\cdot 10\\text{H}_2\\text{O}$ (Sodium carbonate decahydrate).
- **Plaster of Paris (POP):** $\\text{CaSO}_4 \\cdot \\frac{1}{2}\\text{H}_2\\text{O}$ (Calcium sulphate hemihydrate). 
  $$\\text{POP} + 1\\frac{1}{2}\\text{H}_2\\text{O} \\rightarrow \\text{CaSO}_4 \\cdot 2\\text{H}_2\\text{O (Gypsum)}$$`
  },
  {
    keywords: ["chemical reaction", "balancing", "decomposition", "displacement", "redox", "oxidation", "reduction"],
    title: "Chemical Reactions and Equations (Class 10 Science)",
    subject: "Science",
    reply: `### **Chemical Reactions & Equations - NCERT Concept Breakdown**

**1. Balanced Chemical Equation:**
A chemical equation in which the total number of atoms of each element is equal on both sides. It satisfies the **Law of Conservation of Mass** (mass can neither be created nor destroyed).

**2. Types of Chemical Reactions:**
1. **Combination Reaction:** Two or more substances combine to form a single product.
   $$\\text{CaO}_{(s)} + \\text{H}_2\\text{O}_{(l)} \\rightarrow \\text{Ca(OH)}_{2(aq)} + \\text{Heat (Slaked Lime)}$$
2. **Decomposition Reaction:** A single reactant breaks down into simpler products.
   - *Thermal:* $\\text{CaCO}_{3(s)} \\xrightarrow{\\Delta} \\text{CaO}_{(s)} + \\text{CO}_{2(g)}$
   - *Electrolytic:* $2\\text{H}_2\\text{O}_{(l)} \\xrightarrow{\\text{Electricity}} 2\\text{H}_{2(g)} + \\text{O}_{2(g)}$
   - *Photolytic:* $2\\text{AgBr}_{(s)} \\xrightarrow{\\text{Sunlight}} 2\\text{Ag}_{(s)} + \\text{Br}_{2(g)}$ *(used in black & white photography)*.
3. **Displacement Reaction:** A more reactive element displaces a less reactive element from its solution.
   $$\\text{Fe}_{(s)} + \\text{CuSO}_{4(aq)} \\rightarrow \\text{FeSO}_{4(aq)} + \\text{Cu}_{(s)}$$
4. **Double Displacement Reaction:** Exchange of ions between reactants.
   $$\\text{Na}_2\\text{SO}_{4(aq)} + \\text{BaCl}_{2(aq)} \\rightarrow \\text{BaSO}_{4(s) \\downarrow (White ppt)} + 2\\text{NaCl}_{(aq)}$$
5. **Redox Reaction:** Simultaneous **Oxidation** (gain of oxygen / loss of hydrogen) and **Reduction** (loss of oxygen / gain of hydrogen).
   $$\\text{CuO} + \\text{H}_2 \\xrightarrow{\\Delta} \\text{Cu} + \\text{H}_2\\text{O}$$`
  },
  {
    keywords: ["pythagoras", "pythagorean", "right triangle", "hypotenuse"],
    title: "Pythagoras Theorem (Class 10 Mathematics - Triangles)",
    subject: "Mathematics",
    reply: `### **Pythagoras Theorem - NCERT Concept Breakdown**

**1. Statement:**
In a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides.
$$c^2 = a^2 + b^2 \\quad \\text{or} \\quad \\text{(Hypotenuse)}^2 = \\text{(Base)}^2 + \\text{(Perpendicular)}^2$$

**2. Proof Overview (Class 10 Method):**
- Given: Right $\\triangle ABC$ with $\\angle B = 90^\\circ$.
- Draw altitude $BD \\perp AC$.
- $\\triangle ADB \\sim \\triangle ABC \\implies \\frac{AD}{AB} = \\frac{AB}{AC} \\implies AB^2 = AD \\cdot AC$.
- $\\triangle BDC \\sim \\triangle ABC \\implies \\frac{CD}{BC} = \\frac{BC}{AC} \\implies BC^2 = CD \\cdot AC$.
- Adding both equations:
  $$AB^2 + BC^2 = AC(AD + CD) = AC \\cdot AC = AC^2$$
  *(Hence Proved).*

**3. Common Pythagorean Triples:**
- $(3, 4, 5)$, $(5, 12, 13)$, $(7, 24, 25)$, $(8, 15, 17)$, $(9, 40, 41)$.`
  },
  {
    keywords: ["quadratic", "discriminant", "b2-4ac", "nature of roots", "quadratic formula"],
    title: "Quadratic Equations (Class 10 Mathematics)",
    subject: "Mathematics",
    reply: `### **Quadratic Equations - NCERT Concept Breakdown**

**1. Standard Form:**
$$ax^2 + bx + c = 0 \\quad (a \\neq 0)$$

**2. Quadratic Formula:**
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

**3. Discriminant ($D$) & Nature of Roots:**
The value $D = b^2 - 4ac$ determines the nature of roots:
1. **If $D > 0$:** Two distinct real roots ($x = \\frac{-b \\pm \\sqrt{D}}{2a}$).
2. **If $D = 0$:** Two equal real roots ($x = -\\frac{b}{2a}$).
3. **If $D < 0$:** No real roots (roots are complex/imaginary).

**4. Vieta's Formulas (Sum & Product of Roots):**
For roots $\\alpha$ and $\\beta$:
- **Sum of roots:** $\\alpha + \\beta = -\\frac{b}{a}$
- **Product of roots:** $\\alpha \\cdot \\beta = \\frac{c}{a}$`
  },
  {
    keywords: ["trigonometry", "sin", "cos", "tan", "cosec", "sec", "cot", "trigonometric identities"],
    title: "Introduction to Trigonometry (Class 10 Mathematics)",
    subject: "Mathematics",
    reply: `### **Trigonometry - NCERT Concept Breakdown**

**1. Trigonometric Ratios (in right-angled $\\triangle ABC$ at $\\angle B = 90^\\circ$):**
- $\\sin \\theta = \\frac{\\text{Perpendicular}}{\\text{Hypotenuse}} = \\frac{P}{H}$
- $\\cos \\theta = \\frac{\\text{Base}}{\\text{Hypotenuse}} = \\frac{B}{H}$
- $\\tan \\theta = \\frac{\\text{Perpendicular}}{\\text{Base}} = \\frac{P}{B} = \\frac{\\sin \\theta}{\\cos \\theta}$
- Reciprocals: $\\text{cosec } \\theta = \\frac{1}{\\sin \\theta}$, $\\sec \\theta = \\frac{1}{\\cos \\theta}$, $\\cot \\theta = \\frac{1}{\\tan \\theta}$.

**2. Standard Values Table:**
| Angle ($\\theta$) | $0^\\circ$ | $30^\\circ$ | $45^\\circ$ | $60^\\circ$ | $90^\\circ$ |
|---|---|---|---|---|---|
| **$\\sin\\theta$** | $0$ | $\\frac{1}{2}$ | $\\frac{1}{\\sqrt{2}}$ | $\\frac{\\sqrt{3}}{2}$ | $1$ |
| **$\\cos\\theta$** | $1$ | $\\frac{\\sqrt{3}}{2}$ | $\\frac{1}{\\sqrt{2}}$ | $\\frac{1}{2}$ | $0$ |
| **$\\tan\\theta$** | $0$ | $\\frac{1}{\\sqrt{3}}$ | $1$ | $\\sqrt{3}$ | Undefined |

**3. Three Fundamental Pythagorean Identities:**
1. $\\sin^2 \\theta + \\cos^2 \\theta = 1$
2. $1 + \\tan^2 \\theta = \\sec^2 \\theta$
3. $1 + \\cot^2 \\theta = \\text{cosec}^2 \\theta$`
  },
  {
    keywords: ["cell", "mitochondria", "chloroplast", "nucleus", "organelle", "prokaryote", "eukaryote"],
    title: "The Fundamental Unit of Life: Cell (Class 9 Science)",
    subject: "Science",
    reply: `### **Cell Structure & Function - NCERT Concept Breakdown**

**1. Definition:**
The **Cell** is the fundamental structural and functional unit of all living organisms. Discovered by **Robert Hooke** in 1665 in cork section.

**2. Key Cell Organelles & Functions:**
- **Nucleus:** Control center of cell containing chromosomes (DNA/genes).
- **Mitochondria:** **"Powerhouse of the Cell"** — site of cellular respiration, generates energy as ATP.
- **Chloroplasts:** **"Kitchen of the Cell"** — present in plant cells, site of photosynthesis containing green pigment chlorophyll.
- **Ribosomes:** Protein synthesis factories of the cell.
- **Endoplasmic Reticulum (ER):** RER (Rough ER with ribosomes for protein manufacture), SER (Smooth ER for lipid/fat synthesis).
- **Lysosomes:** **"Suicidal Bags of the Cell"** — contain digestive enzymes to clean up cell waste or self-digest damaged cells.
- **Cell Wall:** Rigid outer layer of plant cells made of **Cellulose** providing structural strength.

**3. Plant Cell vs. Animal Cell:**
- **Plant Cell:** Has rigid cell wall, large central vacuole, plastids/chloroplasts.
- **Animal Cell:** No cell wall, small temporary vacuoles, no chloroplasts.`
  },
  {
    keywords: ["french revolution", "bastille", "estates", "louis xvi", "1789", "robespierre"],
    title: "The French Revolution (Class 9 Social Science - History)",
    subject: "Social Science",
    reply: `### **The French Revolution - NCERT Concept Breakdown**

**1. Outbreak of the Revolution (1789):**
On **14th July 1789**, angry citizens stormed the **Bastille** fortress prison in Paris, symbolizing the end of autocratic royal tyranny of King **Louis XVI** (Bourbon dynasty).

**2. Three Estates of French Society:**
- **First Estate:** Clergy (Church officials - paid no taxes, collected *Tithe* tax).
- **Second Estate:** Nobility (Aristocrats - paid no taxes, held feudal privileges & collected feudal dues).
- **Third Estate:** Commoners (Peasants, artisans, merchants, lawyers — 98% of population, paid all direct taxes like *Taille* and indirect taxes).

**3. Key Causes:**
- Financial bankruptcy of France due to costly wars & luxury at Versailles.
- Severe food scarcity & subsistence crisis.
- Rise of middle class inspired by philosophers: **John Locke**, **Jean-Jacques Rousseau** (*The Social Contract*), and **Montesquieu** (*The Spirit of the Laws*).

**4. Major Milestones:**
- **Declaration of the Rights of Man and of the Citizen (1789):** Liberty, Equality, Fraternity.
- **Reign of Terror (1793-1794):** Led by **Maximilien Robespierre** (Jacobin Club) using the guillotine.
- **Abolition of Slavery:** Finalized in French colonies in 1848.`
  },
  {
    keywords: ["nationalism in india", "satyagraha", "gandhi", "dandi", "non cooperation", "civil disobedience", "jallianwala"],
    title: "Nationalism in India (Class 10 Social Science - History)",
    subject: "Social Science",
    reply: `### **Nationalism in India - NCERT Concept Breakdown**

**1. Concept of Satyagraha (Mahatma Gandhi):**
Emphasized the power of truth and non-violent resistance. Key early Satyagraha movements:
- **Champaran (Bihar, 1917):** Against indigo plantation system.
- **Kheda (Gujarat, 1917):** Revenue relaxation for famine-affected peasants.
- **Ahmedabad (1918):** Cotton mill workers strike.

**2. Key Turning Points:**
- **Rowlatt Act (1919):** Allowed detention of political prisoners without trial for 2 years.
- **Jallianwala Bagh Massacre (13 April 1919):** General Dyer opened fire on peaceful gathering in Amritsar.
- **Non-Cooperation Movement (1921-1922):** Boycott of foreign cloth, schools, titles. Called off after **Chauri Chaura incident** (1922).
- **Salt March / Dandi March (12 March - 6 April 1930):** Gandhiji walked 240 miles from Sabarmati to Dandi, broke Salt Law, inaugurating the **Civil Disobedience Movement**.`
  }
];

export function findOfflineKnowledge(prompt: string, bookInfo?: string): string | null {
  const clean = prompt.toLowerCase();
  
  const isMathContext = bookInfo ? /math|ganita|algebra|geometry|calculus|trigonometry/i.test(bookInfo) : false;
  const isScienceContext = bookInfo ? /science|chemistry|physics|biology/i.test(bookInfo) : false;
  const isSstContext = bookInfo ? /history|geography|civics|economics|social/i.test(bookInfo) : false;

  let bestMatch: KnowledgeEntry | null = null;
  let maxScore = 0;

  for (const entry of OFFLINE_KNOWLEDGE_BASE) {
    if (isMathContext && entry.subject !== "Mathematics") continue;
    if (isScienceContext && entry.subject !== "Science") continue;
    if (isSstContext && entry.subject !== "Social Science") continue;

    let matchedKeywords = 0;
    let score = 0;

    for (const kw of entry.keywords) {
      const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(clean)) {
        score += kw.length > 5 ? 3 : 2;
        matchedKeywords++;
      }
    }

    // Require either a strong multi-word keyword phrase or at least 2 distinct keywords matched
    const isStrongMatch = (matchedKeywords >= 2 && score >= 4) || (matchedKeywords >= 1 && score >= 3 && entry.keywords.some(k => k.includes(" ") && clean.includes(k)));

    if (isStrongMatch && score > maxScore) {
      maxScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && maxScore >= 3) {
    return bestMatch.reply;
  }

  return null;
}
