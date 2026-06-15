"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  ArrowLeft, 
  BookOpen, 
  PenTool, 
  CheckSquare, 
  Sparkles, 
  Loader2, 
  Trophy, 
  ChevronRight, 
  RotateCcw, 
  Star,
  Clock,
  ArrowRight,
  Layers,
  Flame,
  ChevronLeft,
  Maximize2,
  Download,
  X,
  Brain
} from "lucide-react";
import { completeDailyMission, awardUserXP } from "@/lib/xp";

// Map chapter slug → chapter number for PYQ links
const chapterNumbers: Record<string, number> = {
  // chemistry
  "chemical-reactions": 1, "acids-bases": 2, "metals-nonmetals": 3, "carbon-compounds": 4,
  // biology
  "life-processes": 5, "control-coordination": 6, "reproduction": 7, "heredity": 8, "our-environment": 13,
  // physics
  "light": 9, "human-eye": 10, "electricity": 11, "magnetic-effects": 12,
  // mathematics
  "real-numbers": 1, "polynomials": 2, "linear-equations": 3, "quadratic-equations": 4, "arithmetic-progressions": 5, "triangles": 6, "coordinate-geometry": 7, "trigonometry": 8, "trigonometry-applications": 9, "circles": 10, "areas-circles": 11, "surface-areas": 12, "statistics": 13, "probability": 14,
  // history
  "nationalism-europe": 1, "nationalism-india": 2, "making-global-world": 3, "age-industrialisation": 4, "print-culture": 5,
  // geography
  "resources-development": 1, "forest-wildlife": 2, "water-resources": 3, "agriculture": 4, "minerals-energy": 5, "manufacturing-industries": 6, "lifelines-economy": 7,
  // civics
  "power-sharing": 1, "federalism": 2, "gender-religion-caste": 3, "political-parties": 4, "outcomes-democracy": 5,
  // economics
  "development": 1, "sectors-economy": 2, "money-credit": 3, "globalisation": 4, "consumer-rights": 5,
  // english
  "letter-to-god": 1, "nelson-mandela": 2, "stories-flying": 3, "diary-anne-frank": 4, "glimpses-india": 5, "madam-rides-bus": 6, "sermon-benares": 7, "proposal": 8, "dust-of-snow": 9, "fire-ice": 10, "tiger-zoo": 11
};

// Map subject slug → PYQ book code
const subjectCodes: Record<string, string> = {
  chemistry: "jesc1", science: "jesc1", physics: "jesc1", biology: "jesc1",
  mathematics: "jemh1", maths: "jemh1",
  history: "jess3",
  geography: "jess1",
  economics: "jess2",
  "political-science": "jess4", civics: "jess4",
  english: "jeff1", "english-literature": "jeff1", "english-communicative": "jecbse1"
};

interface Flashcard {
  front: string;
  back: string;
}

interface Deck {
  id: string;
  title: string;
  subject: string;
  createdAt: number;
  lastStudied?: number;
  cards: {
    id?: string;
    heading: string;
    content: string;
    flashcard: Flashcard;
    status?: "new" | "learning" | "mastered";
  }[];
  isGlobal: boolean;
}

const formatMarkdown = (md: string) => {
  if (!md) return "";
  
  // Escapes simple HTML tags to avoid raw injection while keeping the parsed markdown safe
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headers: # Header -> <h1>Header</h1>
  html = html.replace(/^#\s+(.+)$/gm, "<h1 class='text-3xl font-extrabold text-slate-900 dark:text-white mt-8 mb-4'>$1</h1>");
  html = html.replace(/^##\s+(.+)$/gm, "<h2 class='text-2xl font-bold text-slate-900 dark:text-white mt-6 mb-3 border-b pb-2 border-slate-200 dark:border-slate-700'>$1</h2>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3 class='text-xl font-bold text-slate-950 dark:text-slate-200 mt-4 mb-2'>$1</h3>");
  html = html.replace(/^####\s+(.+)$/gm, "<h4 class='text-lg font-bold text-slate-955 dark:text-slate-200 mt-3 mb-2'>$1</h4>");

  // Bold text: **text** -> <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold text-slate-955 dark:text-slate-100'>$1</strong>");

  // Italic text: *text* or _text_ -> <em>text</em>
  html = html.replace(/\*(.*?)\*/g, "<em class='italic'>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em class='italic'>$1</em>");

  // Code block: ```code``` -> <pre><code>code</code></pre>
  html = html.replace(/```([\s\S]*?)```/g, "<pre class='bg-slate-100 dark:bg-slate-900/60 p-4 rounded-xl my-4 overflow-x-auto'><code class='font-mono text-sm'>$1</code></pre>");

  // Inline code: `code` -> <code>code</code>
  html = html.replace(/`(.*?)`/g, "<code class='bg-slate-100 dark:bg-slate-900/80 px-1.5 py-0.5 rounded font-mono text-sm'>$1</code>");

  // Blockquotes: > quote -> <blockquote>quote</blockquote>
  html = html.replace(/^>\s+(.+)$/gm, "<blockquote class='border-l-4 border-indigo-500 pl-4 italic text-slate-600 dark:text-slate-400 my-4'>$1</blockquote>");

  // Unordered list items: - item or * item -> <li>item</li>
  html = html.replace(/^\s*[-*+]\s+(.+)$/gm, "<li class='list-disc ml-6 mt-1 text-slate-750 dark:text-slate-300'>$1</li>");
  
  // Ordered list items: 1. item -> <li>item</li>
  html = html.replace(/^\s*\d+\.\s+(.+)$/gm, "<li class='list-decimal ml-6 mt-1 text-slate-750 dark:text-slate-300'>$1</li>");

  // Split into lines and wrap standalone text in paragraphs
  const lines = html.split("\n");
  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return "";
    
    // Check if it's already an HTML block/tag we created
    if (trimmed.startsWith("<h") || 
        trimmed.startsWith("<li") || 
        trimmed.startsWith("<blockquote") || 
        trimmed.startsWith("<pre") || 
        trimmed.startsWith("</pre") || 
        trimmed.startsWith("<code") || 
        trimmed.startsWith("</code") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("</ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("</ol")) {
      return line;
    }
    
    return `<p class='text-slate-700 dark:text-slate-300 leading-relaxed mb-4'>${line}</p>`;
  });
  
  return processedLines.filter(l => l !== "").join("\n");
};

const getLeitnerBox = (deckId: string, cardId: string): number => {
  if (typeof window === "undefined") return 1;
  const stored = localStorage.getItem(`edutrack_leitner_${deckId}_${cardId}`);
  return stored ? parseInt(stored, 10) : 1;
};

const getBoxConfig = (box: number) => {
  switch(box) {
    case 5: return { label: "Box 5: Mastered 🏆", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
    case 4: return { label: "Box 4: Spaced Review (9d)", color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" };
    case 3: return { label: "Box 3: Mid Spacing (5d)", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
    case 2: return { label: "Box 2: Short Spacing (2d)", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" };
    default: return { label: "Box 1: Daily Review ⏱", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" };
  }
};

export default function ChapterPage({ params }: { params: { subject: string, chapter: string } }) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "learn";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [theory, setTheory] = useState("");
  const [summary, setSummary] = useState<any>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [userClass, setUserClass] = useState<number>(10);

  const [lineByLineData, setLineByLineData] = useState<any>(null);
  const [showLineByLineModal, setShowLineByLineModal] = useState<boolean>(false);
  const [lineByLineLoading, setLineByLineLoading] = useState<boolean>(false);

  useEffect(() => {
    const stored = localStorage.getItem("edutrack_class");
    if (stored) {
      setUserClass(parseInt(stored, 10));
    }
  }, []);

  // Decks state
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  // Premium Study session state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showGridView, setShowGridView] = useState(false);
  const [studySessionFlipped, setStudySessionFlipped] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const subjectName = params.subject.charAt(0).toUpperCase() + params.subject.slice(1);
  const chapterName = params.chapter.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const chapterNum = chapterNumbers[params.chapter] || 1;
  let subjectCode = subjectCodes[params.subject.toLowerCase()] || "jesc1";
  if (params.subject.toLowerCase() === "english-literature" || params.subject.toLowerCase() === "english") {
    const footprintsSlugs = ["triumph-surgery", "thiefs-story", "midnight-visitor", "question-trust", "footprints-without-feet", "making-scientist", "necklace", "bholi", "book-saved-earth"];
    if (footprintsSlugs.includes(params.chapter)) {
      subjectCode = "jefp1";
    } else {
      subjectCode = "jeff1";
    }
  }

  // localStorage key for persisting flashcards
  const flashcardKey = `flashcards__${params.subject}__${params.chapter}`;
  const theoryKey = `theory__${params.subject}__${params.chapter}`;

  const fetchTheory = async (force: boolean = false) => {
    if (theory && !force) return;
    
    if (!force) {
      // Try local storage cache
      try {
        const cached = localStorage.getItem(theoryKey);
        if (cached) {
          setTheory(cached);
          completeDailyMission("theory");
          return;
        }
      } catch {}
    } else {
      try {
        localStorage.removeItem(theoryKey);
      } catch {}
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/learn/theory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject: subjectName, chapter: chapterName, language: "Hinglish" })
      });
      const data = await res.json();
      if (data.theory) {
        setTheory(data.theory);
        completeDailyMission("theory");
        try {
          localStorage.setItem(theoryKey, data.theory);
        } catch {}
      } else {
        setTheory(data.error || "Failed to load textbook theory.");
      }
    } catch (e) {
      setTheory("Error connecting to AI service.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceRegenerate = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem(theoryKey);
      localStorage.removeItem(flashcardKey);
    } catch (e) {}
    
    setTheory("");
    setSummary(null);
    setQuiz(null);
    setLineByLineData(null);
    setDecks([]);
    setSelectedDeckId(null);
    
    await fetchTheory(true);
    
    if (activeTab === "revise") {
      await fetchNotes();
    } else if (activeTab === "notes") {
      await fetchSummary();
    } else if (activeTab === "practice") {
      await fetchQuiz();
    }
  };

  const fetchSummary = async () => {
    if (summary) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/learn/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subjectName, chapter: chapterName, language: "Hinglish" })
      });
      const data = await res.json();
      if (data.keyTerms || data.equations || data.mnemonics) {
        setSummary(data);
        completeDailyMission("notes");
      } else {
        setSummary({ error: "Failed to generate board-exam cheat sheet." });
      }
    } catch (e) {
      setSummary({ error: "Error connecting to AI revision service." });
    } finally { setIsLoading(false); }
  };

  const fetchLineByLine = async () => {
    if (lineByLineData) {
      setShowLineByLineModal(true);
      return;
    }
    setLineByLineLoading(true);
    try {
      const res = await fetch("/api/learn/line-by-line", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subjectName, chapter: chapterName, language: "Hinglish" })
      });
      const data = await res.json();
      if (data.lines) {
        setLineByLineData(data);
        setShowLineByLineModal(true);
      } else {
        alert("Failed to load Line-by-Line Guide: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      alert("Error generating Line-by-Line Guide.");
    } finally {
      setLineByLineLoading(false);
    }
  };

  const getSubjectColor = (subj: string) => {
    const s = (subj || "").toLowerCase();
    if (s === "science" || s === "chemistry" || s === "physics" || s === "biology") return "from-emerald-400 to-teal-500";
    if (s === "mathematics" || s === "maths") return "from-blue-400 to-indigo-500";
    if (s === "history") return "from-amber-400 to-orange-500";
    if (s === "geography") return "from-green-400 to-emerald-500";
    if (s === "english") return "from-violet-400 to-purple-500";
    return "from-fuchsia-400 to-indigo-500";
  };

  const fetchNotes = async () => {
    let localNotes: any[] = [];
    
    // 1. Try local NCERT flashcards first
    try {
      const cached = localStorage.getItem(flashcardKey);
      if (cached) {
        localNotes = JSON.parse(cached);
      }
    } catch {}

    // 2. Load matching global decks from `/flashcards`
    let globalDecksList: Deck[] = [];
    try {
      const globalRaw = localStorage.getItem("edutrack_flashcards") || "[]";
      const globalDecks: any[] = JSON.parse(globalRaw);
      
      globalDecks.forEach(deck => {
        const deckSubject = (deck.subject || "").toLowerCase();
        const currentSubject = params.subject.toLowerCase();
        
        const isSubjectMatch = 
          deckSubject === currentSubject ||
          (currentSubject === "chemistry" && deckSubject === "science") ||
          (currentSubject === "physics" && deckSubject === "science") ||
          (currentSubject === "biology" && deckSubject === "science") ||
          (currentSubject === "science" && ["chemistry", "physics", "biology"].includes(deckSubject));

        if (isSubjectMatch) {
          const normalizedDeckTitle = (deck.title || "").toLowerCase();
          const normalizedChapterTitle = chapterName.toLowerCase();
          const chapterWords = params.chapter.replace(/-/g, ' ');
          
          const isChapterMatch = 
            normalizedDeckTitle.includes(chapterWords) ||
            chapterWords.includes(normalizedDeckTitle) ||
            normalizedChapterTitle.includes(normalizedDeckTitle) ||
            normalizedDeckTitle.includes(normalizedChapterTitle);

          if (isChapterMatch && Array.isArray(deck.cards)) {
            globalDecksList.push({
              id: deck.id,
              title: deck.title,
              subject: deck.subject,
              createdAt: deck.createdAt || Date.now(),
              lastStudied: deck.lastStudied,
              cards: deck.cards.map((c: any) => ({
                id: c.id,
                heading: deck.title,
                content: c.back,
                status: c.status || "new",
                flashcard: {
                  front: c.front,
                  back: c.back
                }
              })),
              isGlobal: true
            });
          }
        }
      });
    } catch (e) {
      console.error(e);
    }

    // Wrap NCERT lesson notes in a Deck structure
    let chapterDecks: Deck[] = [];
    if (localNotes.length > 0) {
      chapterDecks.push({
        id: `lesson_${params.chapter}`,
        title: `${chapterName} (NCERT Lesson)`,
        subject: subjectName,
        createdAt: Date.now(),
        cards: localNotes.map((topic: any, idx: number) => ({
          id: `lesson_${chapterNum}_${idx}`,
          heading: topic.heading,
          content: topic.content,
          status: topic.status || "new",
          flashcard: {
            front: topic.flashcard.front,
            back: topic.flashcard.back
          }
        })),
        isGlobal: false
      });
    }

    // Combine them
    chapterDecks = [...chapterDecks, ...globalDecksList];
    setDecks(chapterDecks);
    
    // Auto-select the first deck if available
    if (chapterDecks.length > 0 && !selectedDeckId) {
      setSelectedDeckId(chapterDecks[0].id);
    }

    if (localNotes.length > 0 || globalDecksList.length > 0) {
      return;
    }

    // If no local or global cards exist, generate the NCERT lesson deck from Groq
    setIsLoading(true);
    try {
      const res = await fetch("/api/learn/notes", {
        method: "POST",
        body: JSON.stringify({ subject: subjectName, chapter: chapterName, language: "Hinglish" })
      });
      const data = await res.json();
      const topics = data.topics || [];
      
      // Save lesson cards to localStorage
      try {
        localStorage.setItem(flashcardKey, JSON.stringify(topics));
        const raw = localStorage.getItem("flashcard_index") || "{}";
        const index: Record<string, string[]> = JSON.parse(raw);
        if (!index[params.subject]) index[params.subject] = [];
        if (!index[params.subject].includes(params.chapter)) {
          index[params.subject].push(params.chapter);
        }
        localStorage.setItem("flashcard_index", JSON.stringify(index));
      } catch {}

      const freshLessonDeck: Deck = {
        id: `lesson_${params.chapter}`,
        title: `${chapterName} (NCERT Lesson)`,
        subject: subjectName,
        createdAt: Date.now(),
        cards: topics.map((t: any, idx: number) => ({
          id: `lesson_${chapterNum}_${idx}`,
          heading: t.heading,
          content: t.content,
          status: "new",
          flashcard: {
            front: t.flashcard.front,
            back: t.flashcard.back
          }
        })),
        isGlobal: false
      };

      const freshDecks = [freshLessonDeck, ...globalDecksList];
      setDecks(freshDecks);
      setSelectedDeckId(freshLessonDeck.id);
    } catch (e) {
      console.error(e);
    } finally { setIsLoading(false); }
  };

  const fetchQuiz = async () => {
    if (quiz) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/learn/quiz", {
        method: "POST",
        body: JSON.stringify({ subject: subjectName, chapter: chapterName, language: "Hinglish" })
      });
      const data = await res.json();
      setQuiz(data);
    } catch (e) {
      console.error(e);
    } finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (activeTab === "learn") fetchTheory();
    if (activeTab === "revise") fetchNotes();
    if (activeTab === "notes") fetchSummary();
    if (activeTab === "practice") fetchQuiz();
  }, [activeTab]);

  // Auto-load if deep-linked with ?tab=revise or tab=learn
  useEffect(() => {
    if (initialTab === "revise") fetchNotes();
    if (initialTab === "learn") fetchTheory();
  }, []);

  // Keyboard binding to exit fullscreen on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const selectDeck = (id: string) => {
    setSelectedDeckId(id);
    setCurrentCardIndex(0);
    setStudySessionFlipped(false);
  };

  const handleDeleteDeck = (e: React.MouseEvent, id: string, isGlobal: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this deck?")) return;
    
    if (isGlobal) {
      try {
        const raw = localStorage.getItem("edutrack_flashcards") || "[]";
        const globalDecks: any[] = JSON.parse(raw);
        const filtered = globalDecks.filter(d => d.id !== id);
        localStorage.setItem("edutrack_flashcards", JSON.stringify(filtered));
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        localStorage.removeItem(flashcardKey);
        
        // Also remove from index
        const indexRaw = localStorage.getItem("flashcard_index") || "{}";
        const index: Record<string, string[]> = JSON.parse(indexRaw);
        if (index[params.subject]) {
          index[params.subject] = index[params.subject].filter(c => c !== params.chapter);
          localStorage.setItem("flashcard_index", JSON.stringify(index));
        }
      } catch (err) {
        console.error(err);
      }
    }
    
    // Reset selection if we deleted the selected deck
    if (selectedDeckId === id) {
      setSelectedDeckId(null);
    }
    
    fetchNotes();
  };

  const handleMarkStatus = (status: "learning" | "mastered") => {
    if (!activeDeck) return;
    
    const currentCard = activeDeck.cards[currentCardIndex];
    const cardId = currentCard.id || `card_${currentCardIndex}`;
    const currentBox = getLeitnerBox(activeDeck.id, cardId);
    
    let newBox = 1;
    let earnedXp = 0;
    
    if (status === "mastered") {
      newBox = Math.min(5, currentBox + 1);
      earnedXp = 15;
      if (newBox > currentBox) {
        completeDailyMission("flashcards");
      }
      if (newBox === 5 && currentBox < 5) {
        earnedXp = 100;
      }
    } else {
      newBox = 1;
    }

    try {
      localStorage.setItem(`edutrack_leitner_${activeDeck.id}_${cardId}`, newBox.toString());
      
      // Award XP globally
      if (earnedXp > 0) {
        awardUserXP(earnedXp);
      }
    } catch (err) {}

    const updatedCards = activeDeck.cards.map((c: any, idx: number) => {
      if (idx === currentCardIndex) {
        return {
          ...c,
          status: status === "mastered" ? "mastered" : "learning"
        };
      }
      return c;
    });

    // Save back to local storage depending on whether it is a global deck or local notes
    if (activeDeck.isGlobal) {
      try {
        const raw = localStorage.getItem("edutrack_flashcards") || "[]";
        const globalDecks: any[] = JSON.parse(raw);
        const idx = globalDecks.findIndex(d => d.id === activeDeck.id);
        if (idx >= 0) {
          globalDecks[idx].cards = updatedCards.map((c: any) => ({
            id: c.id,
            front: c.flashcard.front,
            back: c.flashcard.back,
            status: c.status
          }));
          localStorage.setItem("edutrack_flashcards", JSON.stringify(globalDecks));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // Local NCERT notes
      try {
        const lessonStructure = updatedCards.map((c: any) => ({
          heading: c.heading,
          content: c.content,
          status: c.status,
          flashcard: {
            front: c.flashcard.front,
            back: c.flashcard.back
          }
        }));
        localStorage.setItem(flashcardKey, JSON.stringify(lessonStructure));
      } catch (err) {
        console.error(err);
      }
    }

    // Update local state to reflect mastery change instantly
    setDecks(prev => prev.map(d => d.id === activeDeck.id ? { ...d, cards: updatedCards } : d));

    // Advance to next card if available
    if (currentCardIndex < activeDeck.cards.length - 1) {
      setTimeout(() => {
        setCurrentCardIndex(prev => prev + 1);
        setStudySessionFlipped(false);
      }, 300); // Sleek delay for high satisfying micro-animation feedback
    } else {
      alert("✨ Congratulations! You've finished studying all the cards in this deck!");
    }
  };

  // Currently selected deck object
  const activeDeck = decks.find(d => d.id === selectedDeckId) || null;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-120px)]">
      {/* ── PERSISTENT CARD STYLE ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-2000 {
          perspective: 2000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .pulse-glow {
          animation: pulse-glow-anim 2s infinite ease-in-out;
        }
        @keyframes pulse-glow-anim {
          0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.25); }
          50% { box-shadow: 0 0 35px rgba(99, 102, 241, 0.6); }
        }
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />

      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link href={`/learn/${params.subject}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to {subjectName}
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">{chapterName}</h1>
        </div>
        <div className="flex items-center gap-3">
          {userClass === 10 && (
            <Link href={`/pyq/${subjectCode}/${chapterNum}`}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <Trophy className="w-4 h-4" /> PYQ Mock Test
            </Link>
          )}
          <Link href="/tutor" className="bg-gradient-to-r from-amber-200 to-amber-400 text-amber-900 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <Sparkles className="w-5 h-5" /> Ask AI Tutor
          </Link>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl mb-6 overflow-x-auto">
        {[
          { id: "learn", label: "Learn Theory", icon: BookOpen },
          { id: "practice", label: "Practice Quiz", icon: PenTool },
          { id: "revise", label: "Flashcards", icon: RotateCcw },
          { id: "notes", label: "Quick Revision", icon: Sparkles },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 md:p-10 prose prose-slate dark:prose-invert max-w-none">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
              <p className="font-medium">AI is preparing your content...</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* ── LEARN THEORY ── */}
              {activeTab === "learn" && (
                <div className="space-y-6">
                  {/* Floating Action Header inside Learn Theory */}
                  <div className="not-prose flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 rounded-2xl mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Premium NCERT Textbook Draft</span>
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">Exhaustive Curriculum Study Guide</h3>
                    </div>
                    <button
                      onClick={handleForceRegenerate}
                      disabled={isLoading}
                      className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      )}
                      Force Regenerate Complete Chapter
                    </button>
                  </div>

                  {theory ? (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div dangerouslySetInnerHTML={{ __html: formatMarkdown(theory) }} />
                      
                      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 my-6 rounded-r-xl not-prose">
                        <h4 className="m-0 text-blue-800 dark:text-blue-300 flex items-center gap-2 font-bold">
                          <Sparkles className="w-5 h-5 text-blue-500" /> AI Coach Tip
                        </h4>
                        <p className="m-0 mt-2 text-blue-700 dark:text-blue-200 text-sm">Focus on understanding the core principles rather than memorizing formulas. Try to relate these concepts to real-world examples!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-700">
                      <p className="text-slate-500 font-medium">Loading AI textbook theory...</p>
                    </div>
                  )}

                  <div className={`not-prose mt-8 grid gap-4 ${userClass === 10 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                    <Link href={`/learn/${params.subject}/${params.chapter}?tab=revise`}
                      className="p-5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl flex items-center justify-between gap-4 hover:bg-indigo-100 transition-colors group">
                      <div>
                        <p className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Study Flashcards</p>
                        <p className="text-indigo-600/70 dark:text-indigo-400/70 text-sm mt-0.5">AI-generated for this lesson</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    {userClass === 10 && (
                      <Link href={`/pyq/${subjectCode}/${chapterNum}`}
                        className="p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl flex items-center justify-between gap-4 hover:bg-amber-100 transition-colors group">
                        <div>
                          <p className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2"><Trophy className="w-4 h-4" /> PYQ Mock Test</p>
                          <p className="text-amber-600/70 dark:text-amber-400/70 text-sm mt-0.5">Real board exam questions</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* ── PRACTICE QUIZ ── */}
              {activeTab === "practice" && (
                <div className="max-w-2xl mx-auto not-prose space-y-6">
                  {userClass === 10 && (
                    <Link href={`/pyq/${subjectCode}/${chapterNum}`}
                      className="flex items-center justify-between p-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-3xl shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all group animate-in fade-in duration-300">
                      <div>
                        <p className="font-extrabold text-lg flex items-center gap-2"><Trophy className="w-5 h-5" /> Board Exam PYQs</p>
                        <p className="text-white/80 text-sm mt-0.5">MCQs, 2-Mark, 3-Mark, 5-Mark — AI graded</p>
                      </div>
                      <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}

                  {quiz ? (
                    <div>
                      <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">AI Knowledge Check</h2>
                        <p className="text-slate-500 text-sm">Generated for {chapterName}</p>
                      </div>
                      
                      {Array.isArray(quiz?.questions) ? (
                        quiz.questions.map((q: any, i: number) => (
                          <div key={q.id} className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 mb-4">
                            <p className="font-bold text-lg mb-4">{i + 1}. {q.question}</p>
                            <div className="space-y-3">
                              {Array.isArray(q.options) && q.options.map((option: string, j: number) => (
                                <label key={j} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-indigo-500 cursor-pointer transition-colors">
                                  <input type="radio" name={`q${q.id}`} className="w-5 h-5 text-indigo-600" />
                                  <span className="font-medium">{option}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border border-slate-100 dark:border-slate-800 text-slate-500 font-semibold mb-6">
                          {quiz?.error || "AI was unable to generate quiz questions at this moment. Please refresh the page or try again."}
                        </div>
                      )}

                      {quiz?.hots && (
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-indigo-900/10 dark:to-purple-900/10 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 mb-4">
                          <h3 className="text-indigo-800 dark:text-indigo-400 mt-0 flex items-center gap-2 font-bold">
                            <Sparkles className="w-5 h-5" /> HOTS Question
                          </h3>
                          <p className="text-lg font-bold">{quiz.hots.question}</p>
                          <p className="text-sm text-indigo-600 italic">Hint: {quiz.hots.hint}</p>
                        </div>
                      )}
                      <button className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors">
                        Submit Answers
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-700">
                      <p className="text-slate-500 font-medium">Loading AI quiz...</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── FLASHCARDS (MULTIPLE DECKS + IMMERSIVE ACTIVE DECK) ── */}
              {activeTab === "revise" && (
                <div className="not-prose space-y-8">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <RotateCcw className="w-6 h-6 text-indigo-500" /> Flashcards Hub
                      </h2>
                      <p className="text-slate-500 text-sm mt-1">Select a deck and tap a card to flip and reveal the answer.</p>
                    </div>
                    <span className="text-sm text-slate-500 font-semibold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-750">
                      {decks.length} Deck{decks.length > 1 ? 's' : ''} available
                    </span>
                  </div>

                  {/* Beautiful Decks Grid matching user's design */}
                  {decks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {decks.map(deck => {
                        const mastered = deck.cards.filter((c: any) => c.status === "mastered" || c.status === "complete").length;
                        const total = deck.cards.length;
                        const progress = Math.round((mastered / total) * 100) || 0;
                        const isNew = !deck.lastStudied;
                        const gradient = getSubjectColor(deck.subject);
                        const isSelected = selectedDeckId === deck.id;

                        return (
                          <div 
                            key={deck.id}
                            onClick={() => selectDeck(deck.id)}
                            className={`group relative bg-gradient-to-br from-slate-900/90 to-indigo-950/90 backdrop-blur-md border rounded-[2rem] p-6 flex flex-col gap-4 transition-all duration-300 cursor-pointer select-none ${
                              isSelected 
                                ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-2 ring-emerald-500/20' 
                                : 'border-slate-800/80 hover:border-slate-700/80 hover:shadow-2xl'
                            }`}
                          >
                            {/* Color accent top bar */}
                            <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${gradient}`} />

                            <div className="flex items-center justify-between">
                              <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full">
                                {deck.subject}
                              </span>
                              
                              <div className="flex items-center gap-2">
                                {/* Delete Deck Button */}
                                <button
                                  onClick={(e) => handleDeleteDeck(e, deck.id, deck.isGlobal)}
                                  className="p-1.5 bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/50 rounded-xl transition-all hover:scale-[1.05] active:scale-95"
                                  title="Delete Deck"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                                <span className="inline-block px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full flex items-center gap-1">
                                  <Flame className="w-3.5 h-3.5 text-emerald-400" /> Studied
                                </span>
                              </div>
                            </div>

                            <h4 className="text-lg font-bold text-white leading-snug group-hover:text-emerald-400 transition-colors">
                              {deck.title}
                            </h4>

                            <div className="flex items-center gap-4 text-xs text-slate-400 font-semibold">
                              <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-slate-500" /> {total} cards</span>
                              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-500" /> {new Date(deck.createdAt).toLocaleDateString()}</span>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-400">Mastery</span>
                                <span className="text-emerald-400">{progress}%</span>
                              </div>
                              <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                  style={{ width: `${progress}%` }} />
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                              <span className="text-sm font-bold text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                                {isSelected ? 'Active Deck ✓' : 'Select Deck →'}
                              </span>
                              <span className="text-xs text-slate-400 font-medium">
                                {mastered}/{total} mastered
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-750">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-3" />
                      <p className="text-slate-500 font-medium">Preparing your flashcards...</p>
                    </div>
                  )}

                  {/* Ultra-Premium Interactive Study Session Interface */}
                  {activeDeck && (
                    <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-850">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-500" />
                            {activeDeck.title} — Study Session
                          </h3>
                          <p className="text-xs text-slate-400 font-semibold mt-1">
                            {activeDeck.cards.filter((c: any) => c.status === "mastered" || c.status === "complete").length} of {activeDeck.cards.length} cards mastered
                          </p>
                        </div>
                        
                        {/* Toggle Grid vs Interactive Single vs Fullscreen */}
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => setIsFullscreen(true)}
                            className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/5 hover:-translate-y-0.5 active:scale-95"
                          >
                            <Maximize2 className="w-3.5 h-3.5" /> Fullscreen View
                          </button>
                          <button
                            onClick={() => setShowGridView(false)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              !showGridView 
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25' 
                                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 hover:text-slate-755'
                            }`}
                          >
                            🎯 Interactive Mode
                          </button>
                          <button
                            onClick={() => setShowGridView(true)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              showGridView 
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25' 
                                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 hover:text-slate-755'
                            }`}
                          >
                            🃏 Grid Overview
                          </button>
                        </div>
                      </div>

                      {showGridView ? (
                        /* Grid View */
                        <div className="grid md:grid-cols-2 gap-5">
                          {activeDeck.cards.map((topic: any, idx: number) => topic.flashcard && (
                            <div 
                              key={idx} 
                              onClick={() => {
                                const key = `${activeDeck.id}_${idx}`;
                                setFlippedCards(f => ({ ...f, [key]: !f[key] }));
                              }} 
                              className="cursor-pointer min-h-[200px] perspective-2000"
                            >
                              <div className={`w-full h-full min-h-[200px] duration-500 transform-style-3d relative ${
                                flippedCards[`${activeDeck.id}_${idx}`] ? "rotate-y-180" : ""
                              }`}>
                                {/* Front */}
                                <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-3xl p-8 flex flex-col justify-between shadow-md border border-white/5">
                                  <span className="text-xs font-bold uppercase tracking-wider opacity-70 bg-white/20 px-3 py-1 rounded-full mb-4 w-fit flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" /> Card {idx + 1}
                                  </span>
                                  <p className="font-bold text-xl leading-snug text-center my-auto">{topic.flashcard.front}</p>
                                  <p className="text-white/60 text-xs mt-6 text-center font-bold">Tap to reveal ↺</p>
                                </div>
                                
                                {/* Back */}
                                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 border-2 border-indigo-500/60 rounded-3xl p-8 flex flex-col justify-between shadow-md">
                                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-650 bg-indigo-500/10 px-3 py-1 rounded-full mb-4 w-fit flex items-center gap-1">
                                    <CheckSquare className="w-3 h-3" /> Answer
                                  </span>
                                  <p className="font-semibold text-lg text-slate-200 leading-relaxed text-center my-auto">{topic.flashcard.back}</p>
                                  <p className="text-slate-400 text-xs mt-6 text-center font-bold">Tap to flip back ↺</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* Premium Glassmorphic Interactive Study Mode (One-by-One) */
                        <div className="relative bg-gradient-to-b from-slate-900/60 to-slate-950/80 border border-slate-800/80 rounded-[3rem] p-8 md:p-12 max-w-2xl mx-auto flex flex-col items-center gap-8 shadow-2xl backdrop-blur-xl w-full overflow-hidden">
                          {/* Floating neon blur bubbles */}
                          <div className="absolute inset-0 overflow-hidden rounded-[3rem] pointer-events-none opacity-30">
                            <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
                            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
                          </div>

                          {/* Centered Flashcard */}
                          {activeDeck.cards.length > 0 && currentCardIndex < activeDeck.cards.length && (
                            <div 
                              onClick={() => setStudySessionFlipped(!studySessionFlipped)}
                              className="w-full h-80 relative cursor-pointer perspective-2000 select-none group relative z-10"
                            >
                              <div className={`w-full h-full duration-500 transform-style-3d relative ${
                                studySessionFlipped ? "rotate-y-180" : ""
                              }`}>
                                {/* Front view - gorgeous gradient & premium details */}
                                <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-[2.5rem] p-10 flex flex-col justify-between shadow-2xl border border-indigo-500/40 overflow-hidden pulse-glow">
                                  {/* Glass highlight overlay */}
                                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
                                  {/* Abstract background SVG pattern */}
                                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
                                  
                                  <div className="flex justify-between items-center relative z-10">
                                    <span className="text-xs font-bold uppercase tracking-widest bg-white/10 text-indigo-300 px-3 py-1 rounded-full border border-white/5">
                                      Card {currentCardIndex + 1} of {activeDeck.cards.length}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 uppercase ${
                                      getBoxConfig(getLeitnerBox(activeDeck.id, activeDeck.cards[currentCardIndex].id || `card_${currentCardIndex}`)).color
                                    }`}>
                                      {getBoxConfig(getLeitnerBox(activeDeck.id, activeDeck.cards[currentCardIndex].id || `card_${currentCardIndex}`)).label}
                                    </span>
                                  </div>
                                  <p className="font-extrabold text-2xl md:text-3xl text-center leading-relaxed tracking-tight my-auto px-4 max-h-[140px] overflow-y-auto relative z-10 text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-200">
                                    {activeDeck.cards[currentCardIndex].flashcard.front}
                                  </p>
                                  <div className="text-center relative z-10">
                                    <span className="inline-flex items-center gap-1.5 text-white/50 text-[11px] font-bold uppercase tracking-wider hover:text-white/80 transition-colors">
                                      <RotateCcw className="w-3.5 h-3.5 animate-spin-slow" /> Click to reveal answer
                                    </span>
                                  </div>
                                </div>

                                {/* Back view - premium dark glassmorphic style */}
                                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border-2 border-emerald-500/60 rounded-[2.5rem] p-10 flex flex-col justify-between shadow-2xl overflow-hidden">
                                  {/* Glass highlight overlay */}
                                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />
                                  
                                  <div className="flex justify-between items-center relative z-10">
                                    <span className="text-xs font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                                      Answer Revealed
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[120px]" title={activeDeck.title}>
                                      {activeDeck.title}
                                    </span>
                                  </div>
                                  <p className="font-bold text-lg md:text-xl text-center text-slate-100 leading-relaxed my-auto px-4 max-h-[140px] overflow-y-auto relative z-10">
                                    {activeDeck.cards[currentCardIndex].flashcard.back}
                                  </p>
                                  <div className="text-center relative z-10">
                                    <span className="inline-flex items-center gap-1.5 text-emerald-400/70 text-[11px] font-bold uppercase tracking-wider">
                                      <RotateCcw className="w-3.5 h-3.5" /> Click to flip back
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Controls Row (Circle buttons & Progress) */}
                          <div className="flex items-center justify-between w-full relative z-10 px-4">
                            <button
                              disabled={currentCardIndex === 0}
                              onClick={() => {
                                setCurrentCardIndex(prev => Math.max(0, prev - 1));
                                setStudySessionFlipped(false);
                              }}
                              className="w-12 h-12 rounded-full border border-slate-800 bg-slate-900 text-slate-400 hover:text-white disabled:opacity-20 hover:border-slate-700 transition-all flex items-center justify-center shadow-lg active:scale-95"
                            >
                              <ChevronLeft className="w-6 h-6" />
                            </button>
                            
                            {/* Linear percentage bubble */}
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-extrabold text-indigo-400 tracking-wider">
                                CARD {currentCardIndex + 1} OF {activeDeck.cards.length}
                              </span>
                              <div className="w-24 bg-slate-800 h-1 rounded-full overflow-hidden mt-1.5">
                                <div 
                                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                                  style={{ width: `${((currentCardIndex + 1) / activeDeck.cards.length) * 100}%` }}
                                />
                              </div>
                            </div>
                            
                            <button
                              disabled={currentCardIndex === activeDeck.cards.length - 1}
                              onClick={() => {
                                setCurrentCardIndex(prev => Math.min(activeDeck.cards.length - 1, prev + 1));
                                setStudySessionFlipped(false);
                              }}
                              className="w-12 h-12 rounded-full border border-slate-800 bg-slate-900 text-slate-400 hover:text-white disabled:opacity-20 hover:border-slate-700 transition-all flex items-center justify-center shadow-lg active:scale-95"
                            >
                              <ChevronRight className="w-6 h-6" />
                            </button>
                          </div>

                          {/* Beautiful Glowing HSL Action Buttons */}
                          <div className="flex gap-4 w-full relative z-10 max-w-md pt-2">
                            <button
                              onClick={() => handleMarkStatus("learning")}
                              className="flex-1 py-3.5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white rounded-2xl text-sm font-extrabold shadow-[0_4px_25px_rgba(244,63,94,0.25)] hover:shadow-[0_4px_35px_rgba(244,63,94,0.45)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
                            >
                              ❌ Still Learning
                            </button>
                            <button
                              onClick={() => handleMarkStatus("mastered")}
                              className="flex-1 py-3.5 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl text-sm font-extrabold shadow-[0_4px_25px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_35px_rgba(16,185,129,0.45)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-1.5"
                            >
                              ✓ Mastered!
                            </button>
                          </div>

                        </div>
                      )}

                    </div>
                  )}

                  {userClass === 10 && (
                    <Link href={`/pyq/${subjectCode}/${chapterNum}`}
                      className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl hover:bg-amber-100 transition-colors group">
                      <p className="font-bold text-amber-700 dark:text-amber-400 text-sm flex items-center gap-2"><Trophy className="w-4 h-4" /> Test yourself with real board PYQs</p>
                      <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>
              )}

              {/* ── QUICK REVISION (BOARD EXAM CHEAT SHEETS) ── */}
              {activeTab === "notes" && (
                <div className="not-prose space-y-8 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-amber-500" />
                        Quick Revision Cheat Sheet
                      </h2>
                      <p className="text-slate-500 text-sm mt-1">High-density facts, core equations, and visual memory aids for CBSE board preparation.</p>
                    </div>
                    
                    <button
                      onClick={fetchLineByLine}
                      disabled={lineByLineLoading}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50"
                    >
                      {lineByLineLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      Generate Line-by-Line PDF Guide
                    </button>
                  </div>

                  {summary ? (
                    summary.error ? (
                      <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-700">
                        <p className="text-rose-500 font-medium">{summary.error}</p>
                      </div>
                    ) : (
                      <div className="grid lg:grid-cols-3 gap-6">
                        {/* Column 1: Board Must-Knows & Key Terms */}
                        <div className="lg:col-span-2 space-y-6">
                          {/* Board Must-Knows */}
                          <div className="bg-slate-900 text-white border border-slate-800 p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 mb-4 flex items-center gap-2">
                              <Trophy className="w-5 h-5 text-amber-400" />
                              CBSE Board Must-Knows
                            </h3>
                            <div className="space-y-4">
                              {summary.boardMustKnow?.map((fact: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-3 bg-slate-850/50 p-4 rounded-2xl border border-slate-800">
                                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                    {idx + 1}
                                  </span>
                                  <p className="text-sm font-semibold text-slate-200 leading-relaxed">{fact}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Key Vocabulary / Terms */}
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 p-6 rounded-[2rem] shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-indigo-500" />
                              Core Key Terms
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                              {summary.keyTerms?.map((term: any, idx: number) => (
                                <div key={idx} className="bg-slate-50 dark:bg-slate-955 p-5 rounded-2xl border border-slate-105 dark:border-slate-850">
                                  <span className="inline-block px-2.5 py-0.5 bg-indigo-500/10 text-indigo-505 dark:text-indigo-400 text-[10px] font-black tracking-widest uppercase rounded-full mb-2">
                                    {term.term}
                                  </span>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{term.definition}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Formulas, Laws, & Mnemonics */}
                        <div className="space-y-6">
                          {/* Equations & Formula Cheat Sheet */}
                          <div className="bg-gradient-to-b from-indigo-950/80 to-slate-950/90 backdrop-blur-md border border-indigo-900/30 p-6 rounded-[2rem] shadow-2xl text-white">
                            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-4 flex items-center gap-2">
                              <PenTool className="w-5 h-5 text-indigo-400" />
                              Formulas &amp; Laws
                            </h3>
                            <div className="space-y-4">
                              {summary.equations?.map((eq: any, idx: number) => (
                                <div key={idx} className="bg-slate-900/80 p-4 rounded-xl border border-indigo-955/50 space-y-2">
                                  <p className="text-xs font-black text-indigo-300 uppercase tracking-widest leading-none">{eq.name}</p>
                                  <code className="block bg-slate-950 px-3 py-2 rounded font-mono text-sm text-emerald-450 border border-slate-850/80 text-center w-full">
                                    {eq.formula}
                                  </code>
                                  <p className="text-[11px] text-slate-400 leading-normal">{eq.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Memory Mnemonics */}
                          {summary.mnemonics?.map((m: any, idx: number) => (
                            <div key={idx} className="bg-gradient-to-br from-fuchsia-500/10 via-indigo-500/5 to-transparent border border-fuchsia-505/20 p-6 rounded-[2rem] shadow-sm relative overflow-hidden">
                              <div className="absolute -top-12 -right-12 w-24 h-24 bg-fuchsia-500/10 rounded-full blur-xl"></div>
                              <h3 className="text-base font-extrabold text-fuchsia-600 dark:text-fuchsia-400 flex items-center gap-2 mb-2.5">
                                <Sparkles className="w-4 h-4" /> Mnemonic Trick
                              </h3>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Concept: {m.concept}</p>
                              <div className="bg-white/40 dark:bg-slate-900/40 p-4 rounded-2xl border border-fuchsia-500/10 font-bold text-sm text-slate-800 dark:text-slate-100 italic leading-relaxed">
                                {m.trick}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-700">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-3" />
                      <p className="text-slate-500 font-medium">Preparing Board Cheat Sheet...</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* ── FULL VIEWPORT IMMERSIVE STUDY SCREEN OVERLAY ── */}
      {isFullscreen && activeDeck && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-6 md:p-12 overflow-hidden select-none animate-in fade-in duration-300">
          {/* Animated floating blur bubbles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl" />
          </div>

          {/* Fullscreen Header */}
          <div className="w-full flex items-center justify-between relative z-10 max-w-4xl border-b border-white/5 pb-6">
            <button
              onClick={() => setIsFullscreen(false)}
              className="flex items-center gap-2 text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 px-5 py-2.5 rounded-2xl transition-all shadow-lg active:scale-95 text-sm font-bold uppercase tracking-wider"
            >
              ← Exit Fullscreen <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded font-mono ml-1">ESC</span>
            </button>
            
            <div className="text-center">
              <h2 className="text-xl font-bold text-white tracking-tight leading-none mb-1.5">{activeDeck.title}</h2>
              <span className="text-xs text-indigo-400 font-extrabold tracking-widest uppercase">
                {subjectName} Hub • CBSE Class {userClass}
              </span>
            </div>
            
            <div className="w-40 hidden md:block">
              <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                <span>Mastered</span>
                <span>{Math.round((activeDeck.cards.filter((c: any) => c.status === "mastered" || c.status === "complete").length / activeDeck.cards.length) * 100) || 0}%</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${(activeDeck.cards.filter((c: any) => c.status === "mastered" || c.status === "complete").length / activeDeck.cards.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Large Centered Immersive Card */}
          {activeDeck.cards.length > 0 && currentCardIndex < activeDeck.cards.length && (
            <div 
              onClick={() => setStudySessionFlipped(!studySessionFlipped)}
              className="w-full max-w-2xl h-[400px] relative cursor-pointer perspective-2000 select-none group relative z-10 my-auto py-4"
            >
              <div className={`w-full h-full duration-500 transform-style-3d relative ${
                studySessionFlipped ? "rotate-y-180" : ""
              }`}>
                {/* Front view - giant, stunning neon purple container */}
                <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-purple-950 text-white rounded-[3rem] p-12 flex flex-col justify-between shadow-2xl border border-indigo-500/50 overflow-hidden pulse-glow">
                  {/* Glass highlight overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
                  
                  <div className="flex justify-between items-center relative z-10">
                    <span className="text-sm font-bold uppercase tracking-widest bg-white/10 text-indigo-300 px-4 py-1.5 rounded-full border border-white/5">
                      Card {currentCardIndex + 1} of {activeDeck.cards.length}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" /> immersive study
                    </span>
                  </div>
                  
                  <p className="font-extrabold text-3xl md:text-4xl text-center leading-relaxed tracking-tight my-auto px-6 max-h-[220px] overflow-y-auto relative z-10 text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-200">
                    {activeDeck.cards[currentCardIndex].flashcard.front}
                  </p>
                  
                  <div className="text-center relative z-10">
                    <span className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 text-xs font-bold uppercase tracking-widest transition-colors">
                      <RotateCcw className="w-4 h-4 animate-spin-slow" /> Click to reveal answer
                    </span>
                  </div>
                </div>

                {/* Back view - immersive dark glassmorphic card */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border-2 border-emerald-500/70 rounded-[3rem] p-12 flex flex-col justify-between shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="flex justify-between items-center relative z-10">
                    <span className="text-sm font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full border border-emerald-500/20">
                      Answer Revealed
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest truncate max-w-[200px]" title={activeDeck.title}>
                      {activeDeck.title}
                    </span>
                  </div>
                  
                  <p className="font-bold text-xl md:text-2xl text-center text-slate-100 leading-relaxed my-auto px-6 max-h-[220px] overflow-y-auto relative z-10">
                    {activeDeck.cards[currentCardIndex].flashcard.back}
                  </p>
                  
                  <div className="text-center relative z-10">
                    <span className="inline-flex items-center gap-2 text-emerald-400/80 text-xs font-bold uppercase tracking-widest">
                      <RotateCcw className="w-4 h-4" /> Click to flip back
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation & Action Footer Controls */}
          <div className="w-full flex flex-col items-center gap-6 relative z-10 max-w-2xl border-t border-white/5 pt-6">
            
            {/* Prev/Next arrows + track bar */}
            <div className="flex items-center justify-between w-full max-w-md">
              <button
                disabled={currentCardIndex === 0}
                onClick={() => {
                  setCurrentCardIndex(prev => Math.max(0, prev - 1));
                  setStudySessionFlipped(false);
                }}
                className="w-14 h-14 rounded-full border border-slate-800 bg-slate-900 text-slate-400 hover:text-white disabled:opacity-20 hover:border-slate-700 transition-all flex items-center justify-center shadow-lg active:scale-95 hover:shadow-indigo-500/5"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              
              <div className="flex flex-col items-center">
                <span className="text-xs font-extrabold text-indigo-400 tracking-widest uppercase">
                  PROGRESS TRACKER
                </span>
                <div className="w-48 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2 border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                    style={{ width: `${((currentCardIndex + 1) / activeDeck.cards.length) * 100}%` }}
                  />
                </div>
              </div>
              
              <button
                disabled={currentCardIndex === activeDeck.cards.length - 1}
                onClick={() => {
                  setCurrentCardIndex(prev => Math.min(activeDeck.cards.length - 1, prev + 1));
                  setStudySessionFlipped(false);
                }}
                className="w-14 h-14 rounded-full border border-slate-800 bg-slate-900 text-slate-400 hover:text-white disabled:opacity-20 hover:border-slate-700 transition-all flex items-center justify-center shadow-lg active:scale-95 hover:shadow-indigo-500/5"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>

            {/* Glowing HSL Action Buttons */}
            <div className="flex gap-5 w-full max-w-lg">
              <button
                onClick={() => handleMarkStatus("learning")}
                className="flex-1 py-4.5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white rounded-2xl text-base font-extrabold shadow-[0_4px_25px_rgba(244,63,94,0.25)] hover:shadow-[0_4px_35px_rgba(244,63,94,0.45)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
              >
                ❌ Still Learning
              </button>
              <button
                onClick={() => handleMarkStatus("mastered")}
                className="flex-1 py-4.5 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white rounded-2xl text-base font-extrabold shadow-[0_4px_25px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_35px_rgba(16,185,129,0.45)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
              >
                ✓ Mastered!
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── LINE-BY-LINE NCERT ANNOTATED STUDY GUIDE MODAL ── */}
      {showLineByLineModal && lineByLineData && (
        <div className="fixed inset-0 z-[150] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 select-none overflow-y-auto animate-in fade-in duration-300">
          
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 print-view">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 relative">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-indigo-600" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">NCERT Active Annotation Study Guide</span>
                <h3 className="text-xl font-bold text-white mt-1 leading-none">{chapterName} — Line-by-Line Breakdown</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-orange-500/20 active:scale-95 hover:scale-[1.03]"
                >
                  <Download className="w-3.5 h-3.5" />
                  Print / Export PDF Guide
                </button>
                <button
                  onClick={() => setShowLineByLineModal(false)}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50 dark:bg-slate-950 scroll-container">
              
              <div className="bg-indigo-50/50 dark:bg-indigo-950/10 border-l-4 border-indigo-500 p-4 rounded-r-2xl mb-4">
                <p className="text-xs text-indigo-800 dark:text-indigo-300 font-bold leading-relaxed m-0">
                  ⚡ <strong>CBSE Board Exam Advantage</strong>: Below are the exact high-frequency lines extracted from your NCERT textbook, paired side-by-side with high-yield conceptual annotations, evaluator tips, and misconceptions. Perfect for scoring 100% in board short-answer and long-answer questions.
                </p>
              </div>

              <div className="space-y-6">
                {lineByLineData.lines?.map((line: any, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden flex flex-col md:grid md:grid-cols-2">
                    
                    {/* Left Column: Original NCERT Quote */}
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/30 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 bg-amber-500/10 text-amber-500 text-[9px] font-black tracking-widest uppercase rounded-full mb-3 border border-amber-500/20">
                          NCERT Textbook Line {idx + 1}
                        </span>
                        <blockquote className="m-0 text-sm font-bold text-slate-800 dark:text-slate-250 italic leading-relaxed border-l-4 border-amber-505 pl-4">
                          "{line.original}"
                        </blockquote>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-4 block opacity-50">
                        Official Curriculum Quote
                      </span>
                    </div>

                    {/* Right Column: Deep Explanation & Tips */}
                    <div className="p-6 space-y-4">
                      {/* Conceptual Explanation */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 tracking-widest uppercase flex items-center gap-1">
                          <Brain className="w-3.5 h-3.5" /> Conceptual Explanation
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
                          {line.explanation}
                        </p>
                      </div>

                      {/* Evaluator Callout / Board Tip */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-amber-500 tracking-widest uppercase flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5" /> CBSE Evaluator Tip
                        </span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-bold bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 leading-normal">
                          {line.boardTip}
                        </p>
                      </div>

                      {/* Misconception */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-rose-500 tracking-widest uppercase flex items-center gap-1">
                          ❌ Common Student Misconception
                        </span>
                        <p className="text-xs text-rose-600 dark:text-rose-450 font-semibold bg-rose-500/5 p-3 rounded-xl border border-rose-500/10 leading-normal">
                          {line.misconception}
                        </p>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* ── PRINT MEDIA STYLE INJECTIONS ── */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * {
                visibility: hidden;
              }
              .print-view, .print-view * {
                visibility: visible;
              }
              .print-view {
                position: absolute;
                left: 0;
                top: 0;
                width: 100% !important;
                height: auto !important;
                border: none !important;
                box-shadow: none !important;
                background: white !important;
                color: black !important;
              }
              .print-view button, .print-view select, .print-view hr, .print-view .absolute {
                display: none !important;
              }
              .scroll-container {
                overflow: visible !important;
                height: auto !important;
                background: white !important;
              }
              .md\\:grid-cols-2 {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                display: grid !important;
              }
              .md\\:border-r {
                border-right-width: 1px !important;
              }
            }
          `}} />

        </div>
      )}

    </div>
  );
}
