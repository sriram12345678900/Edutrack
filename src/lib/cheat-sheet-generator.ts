export interface ChapterCheatSheet {
  subject: string;
  chapter: string;
  classLevel: string;
  highWeightageTopics: string[];
  keyFormulas: { name: string; formula: string; units: string }[];
  essentialDefinitions: { term: string; definition: string }[];
  cbseExamTraps: string[];
  mnemonics: string[];
}

export const CHEAT_SHEETS: Record<string, ChapterCheatSheet> = {
  "electricity": {
    subject: "Physics",
    chapter: "Electricity",
    classLevel: "Class 10",
    highWeightageTopics: ["Ohm's Law V-I graphs", "Equivalent Resistance in Series & Parallel", "Joule's Law of Heating", "Electric Power & Commercial Units (kWh)"],
    keyFormulas: [
      { name: "Ohm's Law", formula: "V = I × R", units: "V in Volts, I in A, R in Ω" },
      { name: "Resistance & Resistivity", formula: "R = ρ × (L / A)", units: "ρ in Ω·m" },
      { name: "Series Resistance", formula: "R_s = R₁ + R₂ + R₃", units: "Ohms (Ω)" },
      { name: "Parallel Resistance", formula: "1/R_p = 1/R₁ + 1/R₂ + 1/R₃", units: "Ohms (Ω)" },
      { name: "Electric Power", formula: "P = V × I = I²R = V² / R", units: "Watts (W)" },
      { name: "Joule's Heat", formula: "H = I² × R × t", units: "Joules (J)" },
      { name: "Commercial Energy", formula: "1 kWh = 3.6 × 10⁶ Joules", units: "Units (kWh)" }
    ],
    essentialDefinitions: [
      { term: "1 Ampere", definition: "Flow of 1 Coulomb of electric charge per second through any cross-section (1 A = 1 C/s)." },
      { term: "1 Volt", definition: "Work done of 1 Joule in moving 1 Coulomb of charge between two points (1 V = 1 J/C)." },
      { term: "Resistivity (ρ)", definition: "Resistance of a conductor of unit length (1m) and unit cross-sectional area (1m²). Depends only on material and temperature." }
    ],
    cbseExamTraps: [
      "When a wire is stretched to double its length, its cross-sectional area halves (A/2), making new resistance R' = 4R (quadrupled!).",
      "Domestic appliances are ALWAYS connected in parallel so each gets 220V and failure of one does not turn off others.",
      "An ammeter is always connected in series (low resistance); a voltmeter is always connected in parallel (high resistance)."
    ],
    mnemonics: [
      "VIR: 'Very Important Rule' → V = I × R",
      "B B ROY of Great Britain had Very Good Wife (Resistor color codes)"
    ]
  },
  "light": {
    subject: "Physics",
    chapter: "Light - Reflection and Refraction",
    classLevel: "Class 10",
    highWeightageTopics: ["Ray diagrams for Concave Mirror & Convex Lens", "Cartesian Sign Convention", "Mirror & Lens Formula Numericals", "Refractive Index & Snell's Law"],
    keyFormulas: [
      { name: "Mirror Formula", formula: "1/v + 1/u = 1/f", units: "f = R / 2" },
      { name: "Mirror Magnification", formula: "m = -v / u = h_i / h_o", units: "m > 0 (Virtual), m < 0 (Real)" },
      { name: "Lens Formula", formula: "1/v - 1/u = 1/f", units: "f > 0 (Convex), f < 0 (Concave)" },
      { name: "Lens Magnification", formula: "m = v / u = h_i / h_o", units: "m > 0 (Erect), m < 0 (Inverted)" },
      { name: "Refractive Index", formula: "n₂₁ = v₁ / v₂ = sin(i) / sin(r)", units: "Absolute n = c / v" },
      { name: "Power of Lens", formula: "P = 1 / f (in meters)", units: "Dioptres (D)" }
    ],
    essentialDefinitions: [
      { term: "Principal Focus (F)", definition: "Point on principal axis where incident rays parallel to principal axis converge or appear to diverge from after reflection/refraction." },
      { term: "1 Dioptre (1 D)", definition: "Power of a lens with focal length of exactly 1 meter (1 D = 1 m⁻¹)." },
      { term: "Absolute Refractive Index", definition: "Ratio of speed of light in vacuum (c) to speed of light in the optical medium (v)." }
    ],
    cbseExamTraps: [
      "Object distance (u) is ALWAYS negative in sign convention.",
      "Convex lens focal length is POSITIVE (+f); Concave lens focal length is NEGATIVE (-f).",
      "A magnifying glass uses a convex lens with the object placed between F₁ and optical center O (forming virtual, erect, magnified image)."
    ],
    mnemonics: [
      "REAL images are always INVERTED ('RI'); VIRTUAL images are always ERECT ('VE')."
    ]
  },
  "chemical-reactions": {
    subject: "Science",
    chapter: "Chemical Reactions & Equations",
    classLevel: "Class 10",
    highWeightageTopics: ["Balancing Equations", "Types of Chemical Reactions", "Thermal vs Photolytic Decomposition", "Redox identification", "Corrosion & Rancidity"],
    keyFormulas: [
      { name: "Combination", formula: "CaO(s) + H₂O(l) → Ca(OH)₂(aq) + Heat", units: "Exothermic" },
      { name: "Thermal Decomposition", formula: "2FeSO₄(s) --Δ--> Fe₂O₃(s) + SO₂(g) + SO₃(g)", units: "Green to Red-Brown" },
      { name: "Photolytic Decomposition", formula: "2AgCl(s) --Sunlight--> 2Ag(s) + Cl₂(g)", units: "White to Grey" },
      { name: "Single Displacement", formula: "Fe(s) + CuSO₄(aq) → FeSO₄(aq) + Cu(s)", units: "Blue to Pale Green" },
      { name: "Double Displacement", formula: "Na₂SO₄(aq) + BaCl₂(aq) → BaSO₄(s)↓ + 2NaCl(aq)", units: "White Precipitate" }
    ],
    essentialDefinitions: [
      { term: "Precipitation Reaction", definition: "Reaction in which an insoluble solid (precipitate) separates out from a liquid solution." },
      { term: "Redox Reaction", definition: "Reaction where oxidation (loss of e⁻ / gain of O) and reduction (gain of e⁻ / loss of O) take place simultaneously." },
      { term: "Corrosion", definition: "Process in which metals are eaten away gradually by action of air, moisture, or a chemical (acid)." }
    ],
    cbseExamTraps: [
      "Always write physical state symbols: (s), (l), (g), (aq) and arrows (↑ gas, ↓ precipitate) in board answers.",
      "Respiration is EXOTHERMIC; Photosynthesis is ENDOTHERMIC.",
      "In redox, the substance that is oxidized is the REDUCING AGENT."
    ],
    mnemonics: [
      "OIL RIG: Oxidation Is Loss (of e⁻), Reduction Is Gain (of e⁻)."
    ]
  }
};

export function openPrintableCheatSheet(chapterKey: string = "electricity"): void {
  if (typeof window === "undefined") return;

  const data = CHEAT_SHEETS[chapterKey] || CHEAT_SHEETS["electricity"];

  const printWindow = window.open("", "_blank", "width=900,height=800");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>EduTrack 1-Page Revision Cheat Sheet - ${data.chapter}</title>
        <style>
          @page { size: A4; margin: 12mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #fff;
            margin: 0;
            padding: 20px;
            font-size: 11px;
            line-height: 1.4;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 10px;
            margin-bottom: 12px;
          }
          .title { font-size: 18px; font-weight: 900; color: #1e1b4b; }
          .subtitle { font-size: 11px; color: #4f46e5; font-weight: 700; text-transform: uppercase; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
          .card {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 10px;
            background: #f8fafc;
            page-break-inside: avoid;
          }
          .card-title {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #4338ca;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
            margin-bottom: 6px;
          }
          .formula-item { margin-bottom: 4px; }
          .formula-code { font-family: monospace; font-weight: bold; color: #b91c1c; font-size: 11px; }
          .trap-item { color: #991b1b; font-weight: 600; margin-bottom: 4px; }
          .footer { text-align: center; font-size: 9px; color: #64748b; margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 6px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 15px; text-align: right;">
          <button onclick="window.print()" style="padding: 8px 16px; background: #4f46e5; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">
            🖨 Print / Save as PDF
          </button>
        </div>

        <div class="header">
          <div>
            <div class="subtitle">EduTrack CBSE ${data.classLevel} Revision Desk</div>
            <div class="title">${data.chapter} • High-Yield Revision Sheet</div>
          </div>
          <div style="text-align: right; font-weight: bold; color: #475569;">
            Subject: ${data.subject}<br/>
            Board Exam High-Weightage
          </div>
        </div>

        <div class="grid">
          <!-- Key Formulas -->
          <div class="card">
            <div class="card-title">📐 Key Formulas & Mathematical Equations</div>
            ${data.keyFormulas.map(f => `
              <div class="formula-item">
                <strong>${f.name}:</strong> <span class="formula-code">${f.formula}</span>
                <span style="color: #64748b; font-size: 10px;">(${f.units})</span>
              </div>
            `).join("")}
          </div>

          <!-- High Weightage Topics -->
          <div class="card">
            <div class="card-title">🎯 High-Yield Board Exam Topics</div>
            <ul style="margin: 0; padding-left: 16px;">
              ${data.highWeightageTopics.map(t => `<li style="margin-bottom: 4px;"><strong>${t}</strong></li>`).join("")}
            </ul>
          </div>
        </div>

        <div class="grid">
          <!-- Essential Definitions -->
          <div class="card">
            <div class="card-title">📖 Compulsory Definitions (1 Mark Each)</div>
            ${data.essentialDefinitions.map(d => `
              <div style="margin-bottom: 5px;">
                <strong>${d.term}:</strong> ${d.definition}
              </div>
            `).join("")}
          </div>

          <!-- Common Board Traps -->
          <div class="card">
            <div class="card-title">⚠️ Common Board Traps & Step Deductions</div>
            ${data.cbseExamTraps.map(t => `
              <div class="trap-item">⚠️ ${t}</div>
            `).join("")}
          </div>
        </div>

        <!-- Mnemonics & Quick Memorization -->
        <div class="card" style="margin-bottom: 10px;">
          <div class="card-title">💡 Quick Mnemonics & Speed Memorization Hacks</div>
          ${data.mnemonics.map(m => `<div style="font-weight: 700; color: #047857;">• ${m}</div>`).join("")}
        </div>

        <div class="footer">
          Generated with EduTrack Platform • Designed strictly according to official CBSE Board Exam Marking Scheme.
        </div>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
