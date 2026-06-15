import { NextResponse } from "next/server";
import { fetchPYQsFromWeb, fetchFullPapersFromWeb } from "@/lib/scraper";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject") || "Science";
  const chapter = searchParams.get("chapter") || "Chemical Reactions";
  const type = searchParams.get("type") || "chapter-pyq"; // 'chapter-pyq' or 'full-paper'

  try {
    if (type === "full-paper") {
      const papers = await fetchFullPapersFromWeb(subject);
      return NextResponse.json({
        source: "Web Scraper",
        subject,
        type: "full-paper",
        papers
      });
    } else {
      const questions = await fetchPYQsFromWeb(subject, chapter);
      return NextResponse.json({ 
        source: "Web Scraper",
        subject,
        chapter,
        type: "chapter-pyq",
        questions
      });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data from web" }, { status: 500 });
  }
}
