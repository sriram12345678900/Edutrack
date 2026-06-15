const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const RAW_FILE = path.join(__dirname, '..', 'raw-text.txt');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'lib', 'extracted-pyqs.json');

async function extractQuestionsFromText() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is not set in environment.");
    return;
  }

  if (!fs.existsSync(RAW_FILE)) {
    console.log(`❌ No raw text found at ${RAW_FILE}.`);
    return;
  }

  const textContent = fs.readFileSync(RAW_FILE, 'utf-8');
  
  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `You are an expert educational data extractor.
Read the provided raw text containing Previous Year Questions (PYQs).
Extract every single question and its provided options/sub-questions from the document.
Categorize each question into one of the following categories based on its apparent marks or section headers in the text:
- "MCQ" (Multiple Choice Questions, usually 1 mark)
- "ExtraPractice" (2-Mark Questions)
- "ThreeMarker" (3-Mark Questions)
- "FiveMarker" (5-Mark Questions)

Map the marks correctly based on the section (e.g. 1 for MCQ, 2 for Short Answer Type I, 3 for Short Answer Type II, 5 for Long Answer Type).
The text may not explicitly state the answers, but if you can infer the official answer or a highly accurate short solution, put it in "officialAnswer", otherwise leave it empty.

Return the result strictly as a JSON array of objects, with NO markdown formatting, NO \`\`\`json block. Just the raw JSON array.
Each object MUST have this structure:
{
  "id": "<generate a unique id like q1, q2>",
  "question": "<the full question text including any options a,b,c,d if it's an MCQ>",
  "marks": <number>,
  "category": "<MCQ | ExtraPractice | ThreeMarker | FiveMarker>",
  "officialAnswer": "<short accurate solution if inferable, else empty string>"
}`;

  try {
    console.log("⏳ Sending Text to Gemini 1.5 Pro for extraction...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { text: textContent }
          ],
        },
      ],
      config: {
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    });

    const jsonStr = response.text;
    const parsed = JSON.parse(jsonStr);
    
    // Inject subject and chapter based on filename convention
    const mapped = parsed.map((q, i) => ({
      ...q,
      id: `sc-10-ch1-pasted-${i}`,
      subjectCode: "jesc1", // Science
      chapterNumber: 1,     // Chapter 1: Chemical Reactions and Equations
      year: 2023,
    }));

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mapped, null, 2));
    console.log(`\n🎉 Successfully saved ${mapped.length} total questions to ${OUTPUT_FILE}`);
  } catch (err) {
    console.error(`❌ Failed to process text:`, err);
  }
}

extractQuestionsFromText();
