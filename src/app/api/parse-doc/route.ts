import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { parse as parseCsv } from "csv-parse/sync";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "";
    const name = file.name.toLowerCase();

    let textContent = "";
    let names: string[] = [];

    // Parse PDF
    if (mimeType === "application/pdf" || name.endsWith(".pdf")) {
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      textContent = data.text;
    }
    // Parse DOCX (Word)
    else if (
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
      name.endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      textContent = result.value;
    }
    // Parse CSV
    else if (mimeType === "text/csv" || name.endsWith(".csv")) {
      const text = buffer.toString("utf-8");
      // Assuming CSV has names in the first column or just lists them
      const records = parseCsv(text, { skip_empty_lines: true });
      names = records.map((row: any[]) => row[0]).filter(Boolean);
    }
    // Parse TXT
    else if (mimeType === "text/plain" || name.endsWith(".txt")) {
      textContent = buffer.toString("utf-8");
    } 
    else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    // If textContent was extracted (PDF/DOCX/TXT), split it by newlines
    if (textContent) {
      names = textContent
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0 && line.length < 50); // basic filter to remove huge paragraphs
    }

    // Clean up names (remove numbers, bullet points)
    names = names.map(n => n.replace(/^[\d\.\-\*\s]+/, "").trim()).filter(n => n.length > 0);

    return NextResponse.json({ success: true, names });

  } catch (error: any) {
    console.error("Parse Error:", error);
    return NextResponse.json({ error: error.message || "Failed to parse document" }, { status: 500 });
  }
}
