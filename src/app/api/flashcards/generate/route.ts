import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { topic, classLevel = "10", subject = "Science", count = 10 } = await req.json();

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
  
  // Dedicated Curated Subject Question Banks for Class 10 NCERT Science & Physics
  const defaultBank: Record<string, { front: string; back: string }[]> = {
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
    reflection: [
      { front: "State the Laws of Reflection of Light.", back: "1. Angle of incidence equals angle of reflection (∠i = ∠r).\n2. Incident ray, reflected ray, and normal at point of incidence all lie in the same plane." },
      { front: "State the Mirror Formula.", back: "1/f = 1/v + 1/u (where f = focal length, v = image distance, u = object distance)." },
      { front: "Formula for Magnification of a Spherical Mirror?", back: "m = -v/u = h_image / h_object." }
    ],
    refraction: [
      { front: "State Snell's Law of Refraction.", back: "sin i / sin r = constant (Refractive Index n₂₁)." },
      { front: "Define Absolute Refractive Index (n).", back: "n = c / v (Ratio of speed of light in vacuum to speed in medium)." },
      { front: "State the Lens Formula.", back: "1/f = 1/v - 1/u." }
    ],
    electric: [
      { front: "State Ohm's Law.", back: "Electric current (I) flowing through a conductor is directly proportional to potential difference (V) across its ends at constant temperature (V = IR)." },
      { front: "What is the SI unit of Electric Current?", back: "Ampere (A), where 1 Ampere = 1 Coulomb per second (1 A = 1 C/s)." },
      { front: "What is the SI unit of Potential Difference?", back: "Volt (V), where 1 Volt = 1 Joule per Coulomb (1 V = 1 J/C)." },
      { front: "Formula for Resistors connected in Series?", back: "R_total = R₁ + R₂ + R₃ + ..." },
      { front: "Formula for Resistors connected in Parallel?", back: "1/R_total = 1/R₁ + 1/R₂ + 1/R₃ + ..." },
      { front: "State Joule's Law of Heating.", back: "H = I²Rt (Heat produced is directly proportional to square of current, resistance, and time)." },
      { front: "What are the formulas for Electric Power (P)?", back: "P = VI = I²R = V²/R (SI Unit: Watt)." },
      { front: "Commercial unit of Electrical Energy?", back: "Kilowatt-hour (kWh). 1 kWh = 3.6 × 10⁶ Joules (1 unit)." },
      { front: "Factors on which Resistance of a conductor depends?", back: "Length (l), Area of cross-section (A), Material resistivity (ρ), and Temperature (R = ρ l / A)." },
      { front: "Difference between Ammeter and Voltmeter?", back: "Ammeter measures current and is connected in SERIES (low resistance). Voltmeter measures potential difference and is connected in PARALLEL (high resistance)." }
    ],
    photosynthesis: [
      { front: "What is Photosynthesis?", back: "Process by which green plants manufacture glucose from CO₂ and H₂O using sunlight and chlorophyll." },
      { front: "Write the chemical equation for Photosynthesis.", back: "6CO₂ + 6H₂O + Sunlight → C₆H₁₂O₆ + 6O₂" },
      { front: "Where does Photosynthesis occur in plant cells?", back: "Inside Chloroplasts containing Chlorophyll pigment." },
      { front: "What is the main byproduct of Photosynthesis released into air?", back: "Oxygen gas (O₂)." },
      { front: "What are Stomata?", back: "Tiny pores present on leaves used for gas exchange (CO₂ in, O₂ out) and transpiration." }
    ],
    motion: [
      { front: "State Newton's First Law of Motion.", back: "An object remains at rest or in uniform motion unless acted upon by an external unbalanced force (Law of Inertia)." },
      { front: "State Newton's Second Law formula.", back: "F = ma (Force = mass × acceleration)." },
      { front: "What is SI unit of Force?", back: "Newton (N) or kg·m/s²." },
      { front: "State Newton's Third Law of Motion.", back: "For every action, there is an equal and opposite reaction." }
    ]
  };

  const matchedCards: { front: string; back: string }[] = [];

  // 1. Check default curated subject banks first
  for (const key in defaultBank) {
    if (cleanTopic.includes(key)) {
      for (const card of defaultBank[key]) {
        if (matchedCards.length < count) {
          matchedCards.push(card);
        }
      }
    }
  }

  // 2. Search PYQs dataset and clean tags if needed
  if (matchedCards.length < count) {
    const pyqPath = path.join(process.cwd(), "public", "training", "edutrack_gemini_dataset.json");
    if (fs.existsSync(pyqPath)) {
      try {
        const raw = fs.readFileSync(pyqPath, "utf-8");
        const dataset = JSON.parse(raw);
        for (const item of dataset) {
          if (matchedCards.length >= count) break;
          const txt = (item.input_text || "").toLowerCase();
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
