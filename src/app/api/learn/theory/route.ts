import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export async function POST(req: Request) {
  let subject = "Science";
  let chapter = "NCERT Topic";
  try {
    const body = await req.json();
    subject = body.subject || "Science";
    chapter = body.chapter || "NCERT Topic";
    const language = body.language || "Hinglish";

    const isIshLanguage = (language || "Hinglish").endsWith("ish") && language !== "English";
    const langInstruction = isIshLanguage
      ? `Use ${language || "Hinglish"} for explanations. You MUST strictly use the English alphabet (Roman script). DO NOT use native scripts (Devanagari, Telugu, Tamil, etc.). Keep technical terms in English.`
      : `Use ${language || "English"} for explanations. Keep technical terms in English.`;

    const chemFormattingInstruction = `⚠️ CRITICAL CHEMICAL FORMULA FORMATTING RULE: You MUST write all chemical formulas, equations, or ionic charges using HTML <sub> and <sup> tags (or standard markdown ~sub~ and ^sup^ notations) so that they render perfectly with subscripts and superscripts in the browser. For example, write H<sub>2</sub>O or H~2~O, CO<sub>2</sub> or CO~2~, Ca(OH)<sub>2</sub> or Ca(OH)~2~, Fe<sup>3+</sup> or Fe^3+^, and SO<sub>4</sub><sup>2-</sup> or SO~4~^2-^. DO NOT write flat chemical numbers like H2O or CO2 under any circumstances.`;

    // We will generate the chapter in multiple sequential parts to guarantee it is fully extended (3500-5000 words)
    // with extreme academic rigor, detailed experiments, and solved exemplars.
    const partsPrompts: string[] = [];

    const isChemicalReactions = chapter.toLowerCase().includes("chemical reaction") || chapter.toLowerCase().includes("equations");

    if (isChemicalReactions) {
      // 4-Part Custom Exploded Prompts for Chemical Reactions and Equations
      partsPrompts.push(
        `You are a distinguished CBSE science textbook author and chief NCERT curriculum editor.
        Write **Part 1** of an extremely exhaustive, premium, and scientifically rigorous textbook chapter for the chapter "${chapter}" in the subject "${subject}" for the CBSE Class 10 curriculum.
        
        ${chemFormattingInstruction}
        
        This part must cover in extensive, paragraph-by-paragraph depth:
        - # ${chapter} (Official Chapter Title)
        - ## Introduction & Chemical vs Physical Changes: Include comprehensive analogies (cooking of food, respiration, digestion, souring of milk, rusting) and chemical reaction indicators: state change, color change, gas evolution, temperature change.
        - ## Chemical Equations & Balancing: Detailed explanation of chemical equations, writing balanced equations, the law of conservation of mass, and an extremely thorough, step-by-step, block-by-block explanation of the Hit-and-Trial balancing method using the Fe (s) + H2O (g) → Fe3O4 (s) + H2 (g) example (be sure to write formulas with proper subscripts). Explain every step in full, exhaustive detail.
        
        Format the response in beautiful, professional Markdown.
        ${langInstruction}
        Make this part exceptionally long, elaborate, and deep (approx. 1200-1500 words). Do NOT summarize, compress, or skip any details. Write in an elegant, senior academic style.`
      );

      partsPrompts.push(
        `You are a distinguished CBSE science textbook author and chief NCERT curriculum editor.
        Write **Part 2** of the textbook chapter for the chapter "${chapter}" in the subject "${subject}" for the CBSE Class 10 curriculum. This part must continue from the balancing method of Part 1.
        
        ${chemFormattingInstruction}
        
        This part must cover in extensive, paragraph-by-paragraph depth all **Types of Chemical Reactions**:
        Expand in major, deep subsections with elaborate paragraphs, complete chemical equations with states of matter symbols, molecular details, and thermochemical aspects for:
        1. **Combination Reactions** (with CaO + H2O Slaked lime deep-dive and thermochemistry of white-washing).
        2. **Decomposition Reactions** (explaining Thermal [Ferrous Sulfate crystals heating & Lead Nitrate heating], Electrolytic [Water electrolysis anode/cathode volume ratios], and Photolytic [Silver Chloride & Silver Bromide photolysis in sunlight] decompositions with molecular details).
        3. **Displacement Reactions** (explaining Reactivity Series logic with Fe + CuSO4 and Zn + CuSO4 examples).
        4. **Double Displacement Reactions** (explaining precipitation reactions with Na2SO4 + BaCl2).
        5. **Redox / Oxidation and Reduction Reactions** (explaining oxidation/reduction definitions, identifying oxidised/reduced substances and oxidising/reducing agents in detail).
        
        Format the response in beautiful, professional Markdown.
        ${langInstruction}
        Make this part exceptionally long, detailed, and comprehensive (approx. 1500-1800 words). Do NOT summarize or skip any chemical equations.`
      );

      partsPrompts.push(
        `You are a distinguished CBSE science textbook author and chief NCERT curriculum editor.
        Write **Part 3** of the textbook chapter for the chapter "${chapter}" in the subject "${subject}" for the CBSE Class 10 curriculum. This part must continue from the Redox reactions of Part 2.
        
        ${chemFormattingInstruction}
        
        This part must cover in extensive, paragraph-by-paragraph depth:
        - ## Real-World Oxidation Phenomena: Extensive deep-dives into Corrosion & Rancidity, describing exact scientific oxidation mechanisms, factors, and detailed commercial/industrial prevention techniques (nitrogen gas flushing, airtight containers, BHA, BHT). Absolutely DO NOT use childish equations like "Ghee + O2 → Rancid ghee".
        - ## NCERT Practical Activities: Thoroughly outline Activity 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, and 1.11, providing step-by-step procedures, elaborate visual observations, balanced chemical equations with state symbols, and specific CBSE exam takeaways for EVERY single activity.
        
        Format the response in beautiful, professional Markdown.
        ${langInstruction}
        Make this part exceptionally long, rich, and highly practical (approx. 1500-2000 words). Do NOT summarize any activities.`
      );

      partsPrompts.push(
        `You are a distinguished CBSE science textbook author and chief NCERT curriculum editor.
        Write **Part 4 (Final Part)** of the textbook chapter for the chapter "${chapter}" in the subject "${subject}" for the CBSE Class 10 curriculum. This part must continue from the activities of Part 3.
        
        ${chemFormattingInstruction}
        
        This part must cover:
        - ## Solved NCERT Conceptual & In-text Questions: Provide 5 highly detailed, step-by-step solved walkthroughs of conceptual, balancing, or observation-based question walkthroughs matching the highest standard of CBSE Class 10 NCERT.
        - ## Accurate Board Exam Weightage Blueprint: Explain how this chapter belongs to Unit 1 (Chemical Substances - Nature and Behaviour) and typically carries exactly 5 to 6 marks in Class 10 Board exams.
        
        ⚠️ STRICT SCOPE LOCK:
        Absolutely DO NOT include any Mole Concept, molar mass, molecular weight, Avogadro's number, or stoichiometric mass-mass/mole calculations. Keep everything strictly within Class 10 NCERT Science boundaries.
        All numericals or solved exemplars MUST be typical Class 10 CBSE conceptual questions, equation-balancing walkthroughs, or substance identification questions based on experimental observations (e.g., 'A shiny brown element X on heating in air becomes black...').
        
        Format the response in beautiful, professional Markdown.
        ${langInstruction}
        Make this part exceptionally clear, detailed, and pedagogically rich (approx. 800-1200 words).`
      );
    } else {
      // 3-Part Custom Exploded Prompts for General Chapters
      partsPrompts.push(
        `You are a distinguished CBSE textbook author and chief NCERT curriculum editor.
        Write **Part 1** of an extremely exhaustive, premium, and scientifically rigorous textbook chapter for the chapter "${chapter}" in the subject "${subject}" for the CBSE Class 10 curriculum.
        
        ${chemFormattingInstruction}
        
        This part must cover in extensive, paragraph-by-paragraph depth:
        - # ${chapter} (Official Chapter Title)
        - ## Introduction & Historical Foundations: Detailed introduction, real-world analogies, conceptual entry points, and fundamental definitions.
        - ## Core Foundational Principles: Comprehensive explanation of early foundational theories, laws, equations, and basic definitions relating to "${chapter}".
        
        Format the response in beautiful, professional Markdown.
        ${langInstruction}
        Make this part exceptionally long, elaborate, and deep (approx. 1200-1500 words). Do NOT summarize or skip any details.`
      );

      partsPrompts.push(
        `You are a distinguished CBSE textbook author and chief NCERT curriculum editor.
        Write **Part 2** of the textbook chapter for the chapter "${chapter}" in the subject "${subject}" for the CBSE Class 10 curriculum. This part must continue from Part 1.
        
        ${chemFormattingInstruction}
        
        This part must cover in extensive, paragraph-by-paragraph depth:
        - ## Core Systematic Sub-topics: Deep-dives into every major technical sub-topic, classification, mechanism, formula, structural diagram, or scientific reaction associated with "${chapter}".
        - Provide high-quality academic explanations rather than brief summaries. Include appropriate formulas or diagrams in text.
        
        Format the response in beautiful, professional Markdown.
        ${langInstruction}
        Make this part exceptionally long, detailed, and comprehensive (approx. 1500-1800 words).`
      );

      partsPrompts.push(
        `You are a distinguished CBSE textbook author and chief NCERT curriculum editor.
        Write **Part 3 (Final Part)** of the textbook chapter for the chapter "${chapter}" in the subject "${subject}" for the CBSE Class 10 curriculum. This part must continue from Part 2.
        
        ${chemFormattingInstruction}
        
        This part must cover:
        - ## Real-World & Practical Applications: Deep-dives into real-world phenomena, industrial uses, environmental implications, or safety controls.
        - ## NCERT Practical Activities: Detailed walkthrough of all official textbook experiments, procedures, key observations, formulas, and board exam takeaways.
        - ## Solved NCERT Board Exemplars: Provide 5 highly detailed, step-by-step solved conceptual, numerical, or reasoning question walkthroughs.
        - ## Board Exam Blueprint: Detailed weightage analysis for CBSE Class 10.
        
        ⚠️ STRICT SCOPE LOCK:
        Absolutely DO NOT include any advanced, college-level formulas or university-level syllabus topics. Keep everything strictly within Class 10 NCERT curriculum boundaries (specifically, NO mole concept or stoichiometric calculations).
        
        Format the response in beautiful, professional Markdown.
        ${langInstruction}
        Make this part exceptionally clear, detailed, and pedagogically rich (approx. 1200-1800 words).`
      );
    }

    // Now, we execute the parts concurrently using the best available API (Gemini with fallback to Groq)
    try {
      const theoryParts = await Promise.all(
        partsPrompts.map(async (partPrompt, idx) => {
          let partText = "";

          // 1. Try Gemini first
          try {
            const apiKey = process.env.GEMINI_API_KEY_SUMMARY || process.env.GEMINI_API_KEY;
            if (!apiKey) {
              throw new Error("No Gemini API key configured.");
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
              model: "gemini-2.0-flash",
              generationConfig: { maxOutputTokens: 8192, temperature: 0.4 }
            });
            const result = await model.generateContent(partPrompt);
            partText = result.response.text() || "";
          } catch (geminiError: any) {
            console.warn(`Gemini part ${idx + 1} generator failed, trying Groq...`, geminiError.message || geminiError);

            const groqKey = process.env.GROQ_API_KEY;
            if (!groqKey) {
              throw new Error("No Groq API key configured.");
            }
            const groq = new OpenAI({
              apiKey: groqKey,
              baseURL: "https://api.groq.com/openai/v1"
            });

            const completion = await groq.chat.completions.create({
              model: "llama-3.3-70b-versatile",
              messages: [
                { role: "system", content: "You are an elite NCERT textbook author who writes textbooks strictly in clean, engaging, highly-detailed Markdown within the Class 6-10 CBSE syllabus scope." },
                { role: "user", content: partPrompt }
              ],
              temperature: 0.4,
              max_tokens: 4096
            });

            partText = completion.choices[0]?.message?.content || "";
          }

          if (!partText) {
            throw new Error(`Failed to generate textbook theory part ${idx + 1}.`);
          }

          return partText;
        })
      );

      const theory = theoryParts.join("\n\n");
      return NextResponse.json({ theory });
    } catch (execError: any) {
      console.error("Theory Generation Loop Error:", execError);
      throw execError;
    }
  } catch (error) {
    console.error("Theory API Error:", error);
    
    // Fallback Mock Data for demo/offline resilience
    const lowercaseChapter = (chapter || "").toLowerCase();
    const isChemReactions = lowercaseChapter.includes("reaction") || lowercaseChapter.includes("equations");

    if (isChemReactions) {
      return NextResponse.json({ theory: MOCK_THEORY_CHEMICAL_REACTIONS });
    }
    return NextResponse.json({ theory: getGenericTheory(subject, chapter) });
  }
}

const getGenericTheory = (subject: string, chapter: string) => `
# ${chapter}
Welcome to your NCERT Chapter study guide for **${chapter}** under the **${subject}** syllabus.

## Core Conceptual Overview
This textbook chapter covers the key concepts, activities, and board exam topics for **${chapter}**.

### Key Syllabus Highlights:
1. **Fundamental Concepts**: Essential definitions and structural principles.
2. **NCERT Activities**: Practical textbook experiments and observations.
3. **Solved Exemplars**: Sample board exam questions solved step-by-step.
4. **CBSE Board Focus**: Critical tips and mark weightage for board preparations.

*Configure your GEMINI_API_KEY or GROQ_API_KEY in .env.local to enable live dynamic AI explanations.*
`;

const MOCK_THEORY_CHEMICAL_REACTIONS = `# Chemical Reactions and Equations

## 1. Introduction to Chemical Changes
In our daily life, we observe many chemical changes: souring of milk in summer, rusting of an iron tawa/nail, fermentation of grapes, cooking of food, digestion in our body, and respiration.
In all these situations, the nature and identity of the initial substance have changed. We say a **chemical reaction** has taken place.

### Characteristics of a Chemical Reaction:
1. **Change in State**: Burning of candle wax.
2. **Change in Color**: Reaction of citric acid with potassium permanganate (purple to colorless).
3. **Evolution of Gas**: Zinc granules reacting with dilute hydrochloric acid producing Hydrogen gas.
4. **Change in Temperature**: Quicklime reacting with water to form slaked lime (highly exothermic).

---

## 2. Chemical Equations and Balancing
A chemical equation is the symbolic representation of a chemical reaction using symbols and formulae of the substances involved.

### Step-by-Step Balancing (Hit-and-Trial Method)
Let's balance the reaction of iron with steam:
Fe + H<sub>2</sub>O → Fe<sub>3</sub>O<sub>4</sub> + H<sub>2</sub>

- **Step 1**: Count the atoms of each element on both sides.
  Reactants: Fe = 1, H = 2, O = 1.
  Products: Fe = 3, H = 2, O = 4.
- **Step 2**: Balance Oxygen atoms first by multiplying H<sub>2</sub>O by 4:
  Fe + 4H<sub>2</sub>O → Fe<sub>3</sub>O<sub>4</sub> + H<sub>2</sub>
- **Step 3**: Balance Hydrogen atoms by multiplying H<sub>2</sub> on the product side by 4:
  Fe + 4H<sub>2</sub>O → Fe<sub>3</sub>O<sub>4</sub> + 4H<sub>2</sub>
- **Step 4**: Balance Iron atoms by multiplying Fe on the reactant side by 3:
  3Fe (s) + 4H<sub>2</sub>O (g) → Fe<sub>3</sub>O<sub>4</sub> (s) + 4H<sub>2</sub> (g)
This equation is now completely balanced.

---

## 3. Types of Chemical Reactions

### A. Combination Reaction
A reaction in which a single product is formed from two or more reactants.
**Example**: Burning of coal:
C (s) + O<sub>2</sub> (g) → CO<sub>2</sub> (g)
**Example**: Quicklime reacting with water:
CaO (s) [Quicklime] + H<sub>2</sub>O (l) → Ca(OH)<sub>2</sub> (aq) [Slaked Lime] + Heat

### B. Decomposition Reaction
A reaction in which a single reactant breaks down to give two or more simpler products.
1. **Thermal Decomposition**: Carried out by heating.
   2FeSO<sub>4</sub> (s) [Green] → Fe<sub>2</sub>O<sub>3</sub> (s) [Brown] + SO<sub>2</sub> (g) + SO<sub>3</sub> (g)
   2Pb(NO<sub>3</sub>)<sub>2</sub> (s) → 2PbO (s) [Yellow] + 4NO<sub>2</sub> (g) [Brown Fumes] + O<sub>2</sub> (g)
2. **Electrolytic Decomposition**: Carried out by passing electricity.
   **Electrolysis of Water**: 2H<sub>2</sub>O (l) → 2H<sub>2</sub> (g) [Cathode] + O<sub>2</sub> (g) [Anode] (The volume of Hydrogen collected is double that of Oxygen).
3. **Photolytic Decomposition**: Carried out in the presence of sunlight.
   2AgCl (s) [White] → 2Ag (s) [Grey] + Cl<sub>2</sub> (g)
   2AgBr (s) → 2Ag (s) + Br<sub>2</sub> (g) (Used in black and white photography).

### C. Displacement Reaction
A reaction in which a more reactive element displaces a less reactive element from its salt solution.
**Example**: Iron nail placed in Copper Sulfate solution:
Fe (s) + CuSO<sub>4</sub> (aq) [Blue] → FeSO<sub>4</sub> (aq) [Pale Green] + Cu (s) [Red-Brown]

### D. Double Displacement Reaction
A reaction in which there is an exchange of ions between the reactants to form new compounds.
**Example**: Sodium Sulfate reacting with Barium Chloride:
Na<sub>2</sub>SO<sub>4</sub> (aq) + BaCl<sub>2</sub> (aq) → BaSO<sub>4</sub> (s) [White Precipitate] + 2NaCl (aq)

### E. Redox Reactions (Oxidation and Reduction)
- **Oxidation**: Gain of oxygen or loss of hydrogen.
- **Reduction**: Loss of oxygen or gain of hydrogen.
**Example**: Heating of copper powder in oxygen:
2Cu + O<sub>2</sub> → 2CuO [Black]
When Hydrogen gas is passed over this hot CuO, it turns brown again:
CuO + H<sub>2</sub> → Cu + H<sub>2</sub>O
Here, CuO is reduced to Cu, and H<sub>2</sub> is oxidised to H<sub>2</sub>O.

---

## 4. Effects of Oxidation in Daily Life
1. **Corrosion**: When a metal is attacked by substances around it such as moisture, acids, etc.
   - **Rusting of Iron**: Reddish-brown powder.
   - **Black coating on Silver**.
   - **Green coating on Copper**.
2. **Rancidity**: When fats and oils are oxidised, they become rancid and their smell and taste change.
   - **Prevention**: Adding antioxidants (BHA, BHT), flushing chip bags with Nitrogen gas, and storing in airtight containers.`;
