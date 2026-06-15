const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const RAW_DIR = path.join(__dirname, '..', 'raw-pdfs');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'lib', 'extracted-pyqs.json');

async function extractQuestionsFromPDFs() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is not set in .env.local");
    return;
  }

  if (!fs.existsSync(RAW_DIR)) {
    fs.mkdirSync(RAW_DIR, { recursive: true });
    console.log(`📁 Created directory: ${RAW_DIR}`);
    console.log("👉 Please put your PYQ PDF files in the 'raw-pdfs' folder and run this script again.");
    return;
  }

  const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.pdf'));
  
  if (files.length === 0) {
    console.log(`❌ No PDFs found in ${RAW_DIR}. Please add some PDFs.`);
    return;
  }

  const ai = new GoogleGenAI({ apiKey });
  let allExtractedQuestions = [];

  for (const file of files) {
    console.log(`\n📄 Processing ${file}...`);
    const filePath = path.join(RAW_DIR, file);
    const fileBytes = fs.readFileSync(filePath);
    
    const prompt = `You are an expert educational data extractor.
    Read the provided PDF containing Previous Year Questions (PYQs).
    Extract every single question and its provided answer from the document.
    Categorize each question into one of the following categories based on its marks:
    - "MCQ" (Multiple Choice Questions, usually 1 mark)
    - "ExtraPractice" (Short answers, 1 or 2 marks)
    - "ThreeMarker" (3 marks)
    - "FiveMarker" (5 marks)

    If a question does not explicitly state the marks, infer it based on the length of the provided answer.

    Return the result strictly as a JSON array of objects, with NO markdown formatting, NO \`\`\`json block. Just the raw JSON array.
    Each object MUST have this structure:
    {
      "id": "<generate a unique id like q1, q2>",
      "question": "<the full question text>",
      "marks": <number>,
      "category": "<MCQ | ExtraPractice | ThreeMarker | FiveMarker>",
      "officialAnswer": "<the official answer or solution provided in the PDF>"
    }`;

    try {
      console.log("⏳ Sending PDF to Gemini 1.5 Pro for extraction...");
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: fileBytes.toString('base64'),
                  mimeType: "application/pdf"
                }
              }
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
      
      // Inject subject and chapter based on filename convention (e.g. jesc1-ch1.pdf)
      // For now, we add generic fields that the user can manually edit or we prompt for.
      const mapped = parsed.map(q => ({
        ...q,
        subjectCode: "jesc1", // Default to Science for now
        chapterNumber: 1,     // Default to chapter 1
        year: 2023,
      }));

      allExtractedQuestions.push(...mapped);
      console.log(`✅ Extracted ${parsed.length} questions from ${file}`);
    } catch (err) {
      console.error(`❌ Failed to process ${file}:`, err);
    }
  }

  if (allExtractedQuestions.length > 0) {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allExtractedQuestions, null, 2));
    console.log(`\n🎉 Successfully saved ${allExtractedQuestions.length} total questions to ${OUTPUT_FILE}`);
    console.log(`Next step: Restart the app to see them in the PYQ Hub!`);
  }
}

extractQuestionsFromPDFs();
