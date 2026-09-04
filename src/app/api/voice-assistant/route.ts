import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { query, currentPath, activeContext } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }

    const lower = query.toLowerCase().trim();

    // 1. Direct Local Action Interceptions for Zero-Latency Execution
    if (lower === "flip" || lower.includes("flip card") || lower.includes("show answer") || lower.includes("turn card") || lower.includes("show question")) {
      return NextResponse.json({
        spokenText: "Flipping card.",
        displayText: "Flipped card 🔄",
        actionType: "ACTION_FLIP_CARD"
      });
    }

    if (lower === "got it" || lower.includes("mastered") || lower.includes("i know this") || lower.includes("i got it") || lower.includes("mark correct")) {
      return NextResponse.json({
        spokenText: "Great job! Marked as mastered. Plus 15 XP.",
        displayText: "Marked as Mastered! ⭐ (+15 XP)",
        actionType: "ACTION_MASTER_CARD"
      });
    }

    if (lower === "still learning" || lower.includes("needs review") || lower.includes("don't know") || lower.includes("review this") || lower.includes("repeat card")) {
      return NextResponse.json({
        spokenText: "No worries! Saved for review in Box 1.",
        displayText: "Saved to Box 1 for Review ⏱️",
        actionType: "ACTION_LEARN_CARD"
      });
    }

    if (lower.includes("read this") || lower.includes("read card") || lower.includes("read question") || lower.includes("read answer") || lower.includes("speak card")) {
      return NextResponse.json({
        spokenText: "Reading card aloud.",
        displayText: "Reading card 🔊",
        actionType: "ACTION_READ_CARD"
      });
    }

    // Pomodoro Action Interceptions
    if (lower.includes("start timer") || lower.includes("start focus") || lower.includes("resume timer") || lower.includes("start pomodoro") || lower.includes("resume pomodoro")) {
      return NextResponse.json({
        spokenText: "Starting focus timer.",
        displayText: "Focus Timer Started ⏱️",
        actionType: "ACTION_POMODORO_START"
      });
    }

    if (lower.includes("pause timer") || lower.includes("pause focus") || lower.includes("pause pomodoro") || lower.includes("pause session")) {
      return NextResponse.json({
        spokenText: "Timer paused.",
        displayText: "Focus Timer Paused ⏸️",
        actionType: "ACTION_POMODORO_PAUSE"
      });
    }

    if (lower.includes("reset timer") || lower.includes("reset focus") || lower.includes("reset pomodoro") || lower.includes("restart timer")) {
      return NextResponse.json({
        spokenText: "Timer has been reset.",
        displayText: "Focus Timer Reset 🔄",
        actionType: "ACTION_POMODORO_RESET"
      });
    }

    if (lower.includes("study mode") || lower.includes("focus mode") || lower.includes("study session") || lower.includes("focus session")) {
      return NextResponse.json({
        spokenText: "Switched to study focus session.",
        displayText: "Mode: Study Focus Session (25m) 🎯",
        actionType: "ACTION_POMODORO_MODE_STUDY",
        suggestedRoute: "/pomodoro"
      });
    }

    if (lower.includes("short break") || lower.includes("take a break") || lower.includes("break mode")) {
      return NextResponse.json({
        spokenText: "Enjoy your short break.",
        displayText: "Mode: Short Break (5m) ☕",
        actionType: "ACTION_POMODORO_MODE_SHORT",
        suggestedRoute: "/pomodoro"
      });
    }

    if (lower.includes("long break")) {
      return NextResponse.json({
        spokenText: "Enjoy your long break.",
        displayText: "Mode: Long Break (15m) 🌴",
        actionType: "ACTION_POMODORO_MODE_LONG",
        suggestedRoute: "/pomodoro"
      });
    }

    // 2. High-IQ Context-Aware System Prompt
    const contextPrompt = activeContext && activeContext.type === "flashcard"
      ? `CURRENT ON-SCREEN CONTEXT:
The student is viewing a Flashcard in deck "${activeContext.deckTitle}" (Card ${activeContext.cardIndex} of ${activeContext.totalCards}).
- Front (Question): "${activeContext.question}"
- Back (Answer): "${activeContext.answer}"
- Card is currently: ${activeContext.isFlipped ? "Flipped to Answer" : "Showing Question"}
If the student asks "why", "explain this", "give an analogy", or asks about this concept, directly ground your answer in this exact card context!`
      : `Current page route: "${currentPath || "/dashboard"}".`;

    const systemPrompt = `You are EduTrack AI, an elite, compassionate 24/7 personal tutor and study coach.
${contextPrompt}

Your mission:
1. Provide intuitive, concise, high-impact conceptual explanations (2 to 3 punchy sentences for spokenText).
2. SpokenText MUST be clean, natural speech without asterisks, bullets, or unpronounceable symbols, because it will be spoken via Text-to-Speech (TTS).
3. In displayText, provide rich, clear formatting (can include KaTeX math like $E=mc^2$ or brief analogies and emojis).
4. If the user asks in Hindi/Hinglish, reply with conversational, encouraging Hinglish.
5. If the student wants to navigate to an EduTrack tool, provide suggestedRoute:
   - Flashcards -> "/flashcards"
   - Feynman Learning Lab -> "/feynman"
   - AI Tutor -> "/tutor"
   - Virtual Simulations Lab -> "/sandbox"
   - Pomodoro Focus Timer -> "/pomodoro"
   - Whiteboard Canvas -> "/whiteboard"
   - Oral AI Viva -> "/viva"
   - Formulas Hub -> "/formulas"
   - NCERT Digital Books -> "/ncert"
   - Previous Year Questions (PYQs) -> "/pyq"
   - Multiplayer Arena -> "/arena"
   - Study Circles / Groups -> "/groups"
   - Chat / Global Doubt Forum -> "/community"
   - Dashboard -> "/dashboard"
   - Settings -> "/setup"

Respond strictly as JSON:
{
  "spokenText": "Spoken sentence for TTS",
  "displayText": "Display card text with optional formula/analogy",
  "suggestedRoute": "/route-or-null",
  "actionType": "ACTION_TYPE_IF_ANY_ELSE_NULL"
}`;

    const apiKey = process.env.GEMINI_API_KEY || "";
    
    // Try Gemini 2.5 Flash
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          systemInstruction: systemPrompt,
          generationConfig: {
            responseMimeType: "application/json"
          }
        });

        const prompt = `Student query: "${query}"`;
        const response = await model.generateContent(prompt);
        const jsonText = response.response.text();
        const parsed = JSON.parse(jsonText);
        return NextResponse.json(parsed);
      } catch (geminiErr) {
        console.warn("Gemini AI assistant fallback:", geminiErr);
      }
    }

    // Try Groq Llama 3.3 Fallback
    const groqKey = process.env.GROQ_API_KEY || "";
    if (groqKey) {
      try {
        const groq = new Groq({ apiKey: groqKey });
        const response = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Student query: "${query}"` }
          ],
          response_format: { type: "json_object" }
        });
        const reply = response.choices[0].message.content || "{}";
        const parsed = JSON.parse(reply);
        return NextResponse.json(parsed);
      } catch (groqErr) {
        console.warn("Groq AI assistant fallback:", groqErr);
      }
    }

    // Heuristic Fallback & Global Local Intercepts
    let suggestedRoute: string | null = null;
    let spokenText = "I'm right here! Let's master this concept together.";
    let displayText = spokenText;

    if (lower.includes("study circle") || lower.includes("group") || lower.includes("circle")) {
      suggestedRoute = "/groups";
      spokenText = "Opening your Study Circles and study groups.";
      displayText = "Opening Study Circles 👥";
    } else if (lower.includes("chat") || lower.includes("forum") || lower.includes("community") || lower.includes("discussion")) {
      suggestedRoute = "/community";
      spokenText = "Opening the Global Doubt Forum and community chat.";
      displayText = "Opening Global Doubt Forum 💬";
    } else if (lower.includes("flashcard")) {
      suggestedRoute = "/flashcards";
      spokenText = "Opening your AI Flashcards deck.";
      displayText = "Opening Flashcards 🗂️";
    } else if (lower.includes("feynman")) {
      suggestedRoute = "/feynman";
      spokenText = "Taking you to Feynman Lab to practice teaching concepts.";
      displayText = "Opening Feynman Lab 🧠";
    } else if (lower.includes("sandbox") || lower.includes("simulation")) {
      suggestedRoute = "/sandbox";
      spokenText = "Launching your virtual Science Simulations Lab.";
      displayText = "Opening Simulations Lab 🧪";
    } else if (lower.includes("tutor")) {
      suggestedRoute = "/tutor";
      spokenText = "Connecting you to your 24/7 AI tutor.";
      displayText = "Connecting to AI Tutor 💬";
    } else if (lower.includes("french revolution") || lower.includes("1789")) {
      spokenText = "The French Revolution of 1789 ended absolute monarchy in France, giving power to ordinary citizens and spreading the idea of liberty across the world.";
      displayText = "🇫🇷 **French Revolution (1789):** Transferred sovereignty from royal monarchy to citizens, establishing liberty, equality, and modern nationalism.";
    }

    return NextResponse.json({
      spokenText,
      displayText,
      suggestedRoute,
      actionType: null
    });

  } catch (error: any) {
    console.error("VOICE_ASSISTANT_ERROR:", error);
    return NextResponse.json({
      spokenText: "I'm listening! Please repeat your question.",
      displayText: "Could not process request.",
      suggestedRoute: null,
      actionType: null
    }, { status: 500 });
  }
}
