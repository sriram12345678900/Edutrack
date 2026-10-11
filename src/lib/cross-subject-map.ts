// EduTrack Cross-Subject Curricular Connections Map
// Connects disparate CBSE Class 10 concepts to foster holistic multidisciplinary understanding

export interface CrossSubjectConnection {
  targetSubject: string;
  targetChapter: string;
  targetSlug: string;
  relationshipTitle: string;
  synopsis: string;
  icon: string;
}

export const CROSS_SUBJECT_REGISTRY: Record<string, CrossSubjectConnection[]> = {
  "chemical-reactions": [
    {
      targetSubject: "Science (Biology)",
      targetChapter: "Life Processes",
      targetSlug: "life-processes",
      relationshipTitle: "Cellular Respiration as a Redox Reaction",
      synopsis: "The breakdown of glucose (C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP) is fundamentally a multi-step exothermic redox reaction.",
      icon: "🧬",
    },
    {
      targetSubject: "Mathematics",
      targetChapter: "Linear Equations",
      targetSlug: "linear-equations",
      relationshipTitle: "Algebraic Conservation of Mass",
      synopsis: "Balancing stoichiometry equations employs simultaneous linear equations to ensure atomic quantity conservation on both sides.",
      icon: "📐",
    },
  ],
  "acids-bases": [
    {
      targetSubject: "Science (Biology)",
      targetChapter: "Life Processes",
      targetSlug: "life-processes",
      relationshipTitle: "Gastric Juice & Intestinal Buffering",
      synopsis: "Pepsin enzyme requires hydrochloric acid (pH 1.5–2.0) in the stomach, while bile salts convert acidic chyme to alkaline (pH 7.8) for pancreatic enzymes.",
      icon: "🧪",
    },
    {
      targetSubject: "Mathematics",
      targetChapter: "Real Numbers",
      targetSlug: "real-numbers",
      relationshipTitle: "Logarithmic Scale Representation",
      synopsis: "The pH equation pH = -log₁₀[H⁺] maps molar hydronium concentrations exponentially onto the base-10 real number line.",
      icon: "📊",
    },
  ],
  "electricity": [
    {
      targetSubject: "Mathematics",
      targetChapter: "Linear Equations",
      targetSlug: "linear-equations",
      relationshipTitle: "Kirchhoff's Matrix Analysis",
      synopsis: "Mesh loop currents and nodal voltages resolve cleanly via systems of linear equations in multiple variables.",
      icon: "⚡",
    },
    {
      targetSubject: "Social Science",
      targetChapter: "Lifelines of National Economy",
      targetSlug: "lifelines-economy",
      relationshipTitle: "National Power Grids & Industrial Hubs",
      synopsis: "High-voltage transmission infrastructure directly dictates regional industrial density and economic GDP output across India.",
      icon: "🏭",
    },
  ],
  "life-processes": [
    {
      targetSubject: "Science (Chemistry)",
      targetChapter: "Carbon Compounds",
      targetSlug: "carbon-compounds",
      relationshipTitle: "Biomolecules & Covalent Chains",
      synopsis: "Carbohydrates, lipids, and proteins all utilize catenated carbon-carbon tetravalent bonds as their structural backbone.",
      icon: "🔬",
    },
  ],
  "triangles": [
    {
      targetSubject: "Science (Physics)",
      targetChapter: "Light - Reflection & Refraction",
      targetSlug: "light",
      relationshipTitle: "Ray Optics & Similar Triangles",
      synopsis: "The mirror formula and magnification ratio derive directly from AAA similar triangles formed by incident and reflected light rays.",
      icon: "📐",
    },
  ]
};

export function getCrossSubjectConnections(chapterSlug: string): CrossSubjectConnection[] {
  return CROSS_SUBJECT_REGISTRY[chapterSlug] || [];
}
