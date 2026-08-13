import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { topic, classLevel = "10", subject = "Geography", count = 10 } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY_FLASHCARDS || process.env.GEMINI_API_KEY || "";

    // 1. If no API key or local AI mode, use local offline flashcard engine
    if (!apiKey || process.env.USE_LOCAL_AI === "true") {
      const localFlashcards = generateLocalFlashcards(topic, subject, Number(count));
      return NextResponse.json({ flashcards: localFlashcards, engine: "EduTrack Self-Hosted Engine" });
    }

    // 2. Try Gemini API if key is present
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `You are an expert AI tutor for Indian students. Create exactly ${count} highly effective flashcards for a Class ${classLevel} student studying ${subject}, focusing on the topic: "${topic}".
      
You MUST generate the flashcards strictly in English.
Keep the "front" concise (short question under 15 words).
You MUST return a JSON object with a single key "flashcards" containing an array of objects with "front" and "back".

Example format:
{
  "flashcards": [
    { "front": "What is the Lens Formula?", "back": "1/f = 1/v - 1/u" }
  ]
}`;

      const result = await model.generateContent(prompt);
      const resultText = result.response.text();
      const parsed = JSON.parse(resultText);

      return NextResponse.json({ flashcards: parsed.flashcards || [] });
    } catch (apiErr: any) {
      console.warn("External Flashcard API failed, using Local Engine fallback:", apiErr.message);
      const fallbackCards = generateLocalFlashcards(topic, subject, Number(count));
      return NextResponse.json({ flashcards: fallbackCards, engine: "EduTrack Self-Hosted Engine" });
    }

  } catch (error: any) {
    console.error("Flashcard Gen Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate flashcards" }, { status: 500 });
  }
}

// Offline Self-Hosted Flashcard Generator
function generateLocalFlashcards(topic: string, subject: string, count: number) {
  const cleanTopic = topic.toLowerCase();
  
  // Dedicated Curated Subject Question Banks for Class 10 NCERT Subjects
  const defaultBank: Record<string, { front: string; back: string }[]> = {
    // ── GEOGRAPHY CHAPTER 3: WATER RESOURCES ──
    water: [
      { front: "What proportion of the Earth's surface is covered with water?", back: "Three-fourths (approx. 71%) of the Earth's surface is covered with water, but only 2.5% is fresh water." },
      { front: "What are Multi-Purpose River Projects?", back: "Dams built across rivers serving multiple objectives: flood control, irrigation, hydroelectricity, fish breeding, navigation, and soil conservation." },
      { front: "Why did Jawaharlal Nehru call dams the 'Temples of Modern India'?", back: "Because he believed multi-purpose river projects would integrate agricultural growth with rapid industrialization and urban progress." },
      { front: "Which is the highest gravity dam in India?", back: "Bhakra Nangal Dam constructed across the Satluj River." },
      { front: "Which is the longest dam in India?", back: "Hirakud Dam constructed across the Mahanadi River in Odisha." },
      { front: "What is Rooftop Rainwater Harvesting?", back: "Traditional technique of collecting rainwater from roofs via pipes into underground storage tanks (tanka) popular in semi-arid regions like Rajasthan." },
      { front: "Which Indian state made rooftop rainwater harvesting compulsory for all houses?", back: "Tamil Nadu (first state in India to mandate rooftop rainwater harvesting for all households)." },
      { front: "What is Bamboo Drip Irrigation?", back: "A 200-year-old traditional system in Meghalaya where stream water is tapped using bamboo pipes to irrigate betel leaf or black pepper plants." },
      { front: "What was the main objective of Narmada Bachao Andolan?", back: "An NGO movement led by Medha Patkar mobilizing tribal people and environmentalists against large dams like Sardar Sarovar Dam on Narmada River." },
      { front: "What is Water Scarcity?", back: "Shortage of water relative to demand, caused by over-exploitation, excessive use, unequal access, pollution, or seasonal drought." }
    ],

    // ── GEOGRAPHY CHAPTER 1: RESOURCES & DEVELOPMENT ──
    resource: [
      { front: "What are Biotic and Abiotic Resources?", back: "Biotic Resources are obtained from biosphere and have life (e.g., flora, fauna, human beings). Abiotic Resources consist of non-living things (e.g., rocks, metals)." },
      { front: "What are Renewable and Non-Renewable Resources?", back: "Renewable Resources can be renewed or reproduced by physical/chemical/mechanical processes (e.g., solar, wind, water). Non-Renewable Resources take millions of years in formation and get exhausted (e.g., coal, petroleum)." },
      { front: "What is Rio Earth Summit 1992?", back: "First International Earth Summit held in Rio de Janeiro, Brazil, where 100+ heads of state signed Agenda 21 for global sustainable development." },
      { front: "What is Agenda 21?", back: "A declaration signed at UNCED 1992 to achieve global sustainable development by combating environmental damage, poverty, and disease through global cooperation." },
      { front: "Which soil is most widely spread and important in India?", back: "Alluvial Soil (found in Northern Plains, coastal plains, and river deltas of Mahanadi, Godavari, Krishna, and Kaveri)." }
    ],

    // ── GEOGRAPHY CHAPTER 4: AGRICULTURE ──
    agriculture: [
      { front: "What are the three main cropping seasons in India?", back: "1. Kharif (sown June/July, harvested Oct/Nov - Rice, Maize, Cotton).\n2. Rabi (sown Oct/Dec, harvested April/June - Wheat, Barley, Mustard).\n3. Zaid (short summer season - Watermelon, Cucumber)." },
      { front: "Which is the staple food crop of a majority of people in India?", back: "Rice (India is 2nd largest producer after China; requires high temperature >25°C and annual rainfall >100 cm)." },
      { front: "What are the ideal growing conditions for Wheat?", back: "Cool growing season, bright sunshine at ripening time, 50-75 cm annual rainfall evenly distributed. Major belts: Ganga-Satluj plains & Black soil region." },
      { front: "What was the Bhoodan-Gramdan Movement?", back: "Bloodless Revolution initiated by Vinoba Bhave where land donors gifted land to landless farmers (Shri Ram Chandra Reddy donated 80 acres in Pochampally)." }
    ],

    // ── SCIENCE: LIGHT REFLECTION & REFRACTION ──
    light: [
      { front: "State the Laws of Reflection of Light.", back: "1. Angle of incidence equals angle of reflection (∠i = ∠r).\n2. Incident ray, reflected ray, and normal at point of incidence all lie in the same plane." },
      { front: "State the Mirror Formula.", back: "1/f = 1/v + 1/u (where f = focal length, v = image distance, u = object distance)." },
      { front: "Formula for Magnification of a Spherical Mirror?", back: "m = -v/u = h_image / h_object (Negative for real image, positive for virtual image)." },
      { front: "State Snell's Law of Refraction.", back: "The ratio of the sine of angle of incidence to sine of angle of refraction is constant (sin i / sin r = n₂₁)." },
      { front: "Define Absolute Refractive Index (n).", back: "n = c / v (Ratio of speed of light in vacuum 'c' to speed of light in the medium 'v')." },
      { front: "State the Lens Formula.", back: "1/f = 1/v - 1/u (where f = focal length, v = image distance, u = object distance)." },
      { front: "Define Power of a Lens and state its SI unit.", back: "Power (P) is reciprocal of focal length in meters: P = 1 / f(m). SI Unit: Dioptre (D)." },
      { front: "Why are Convex Mirrors used as rear-view mirrors in vehicles?", back: "Convex mirrors always produce an erect, diminished image and provide a wider field of view for the driver." },
      { front: "What is the nature & size of image formed by Concave Mirror when object is at C?", back: "Real, inverted, and SAME SIZE as the object, formed at Center of Curvature (C)." },
      { front: "Focal length of a Plane Mirror?", back: "Infinity (∞), and magnification is +1." }
    ],

    // ── SCIENCE: ELECTRICITY ──
    electric: [
      { front: "State Ohm's Law.", back: "Electric current (I) flowing through a conductor is directly proportional to potential difference (V) across its ends at constant temperature (V = IR)." },
      { front: "What is the SI unit of Electric Current?", back: "Ampere (A), where 1 Ampere = 1 Coulomb per second (1 A = 1 C/s)." },
      { front: "What is the SI unit of Potential Difference?", back: "Volt (V), where 1 Volt = 1 Joule per Coulomb (1 V = 1 J/C)." },
      { front: "Formula for Resistors connected in Series?", back: "R_total = R₁ + R₂ + R₃ + ..." },
      { front: "Formula for Resistors connected in Parallel?", back: "1/R_total = 1/R₁ + 1/R₂ + 1/R₃ + ..." },
      { front: "State Joule's Law of Heating.", back: "H = I²Rt (Heat produced is directly proportional to square of current, resistance, and time)." },
      { front: "What are the formulas for Electric Power (P)?", back: "P = VI = I²R = V²/R (SI Unit: Watt)." },
      { front: "Commercial unit of Electrical Energy?", back: "Kilowatt-hour (kWh). 1 kWh = 3.6 × 10⁶ Joules (1 unit)." }
    ]
  };

  const matchedCards: { front: string; back: string }[] = [];

  // 1. Check default curated subject banks first
  for (const key in defaultBank) {
    if (cleanTopic.includes(key) || (key === "water" && cleanTopic.includes("water"))) {
      for (const card of defaultBank[key]) {
        if (matchedCards.length < count) {
          matchedCards.push(card);
        }
      }
    }
  }

  // 2. Search PYQs dataset with subject relevance filtering
  if (matchedCards.length < count) {
    const pyqPath = path.join(process.cwd(), "public", "training", "edutrack_gemini_dataset.json");
    if (fs.existsSync(pyqPath)) {
      try {
        const raw = fs.readFileSync(pyqPath, "utf-8");
        const dataset = JSON.parse(raw);
        for (const item of dataset) {
          if (matchedCards.length >= count) break;
          const txt = (item.input_text || "").toLowerCase();

          // Exclude chemistry electrolysis when subject is Geography / Social Science
          if ((subject.toLowerCase().includes("geography") || subject.toLowerCase().includes("social") || cleanTopic.includes("water resource")) && txt.includes("electrolysis")) {
            continue;
          }

          if (txt.includes(cleanTopic) || cleanTopic.split(/\s+/).some(w => w.length > 3 && txt.includes(w))) {
            let cleanFront = item.input_text.replace(/\[[^\]]+\]\s*/g, "").trim();
            if (cleanFront.length > 110) {
              cleanFront = cleanFront.slice(0, 107) + "...";
            }
            matchedCards.push({
              front: cleanFront,
              back: item.output_text
            });
          }
        }
      } catch (e) {
        console.error("Error reading flashcard dataset:", e);
      }
    }
  }

  // 3. Fallback generic cards if still needed
  while (matchedCards.length < count) {
    const idx = matchedCards.length + 1;
    matchedCards.push({
      front: `Key Concept ${idx}: ${topic}`,
      back: `Important NCERT Class 10 term relating to ${topic}. Study definition, SI units, and chemical/physical laws.`
    });
  }

  return matchedCards;
}
