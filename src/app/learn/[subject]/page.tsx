"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  PlayCircle, 
  CheckCircle2, 
  Lock, 
  Trophy, 
  BookOpen, 
  RotateCcw, 
  Sparkles, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight, 
  Layers, 
  Flame,
  Clock,
  ArrowRight
} from "lucide-react";

interface UnifiedDeck {
  id: string;
  title: string;
  subject: string;
  createdAt: number;
  lastStudied?: number;
  cards: any[];
  isGlobal: boolean;
  link: string;
}

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

const subjectCodes: Record<string, string> = {
  chemistry: "jesc1", science: "jesc1", physics: "jesc1", biology: "jesc1",
  mathematics: "jemh1", maths: "jemh1",
  history: "jess3",
  geography: "jess1",
  economics: "jess2",
  "political-science": "jess4", civics: "jess4",
  english: "jeff1", "english-literature": "jeff1", "english-communicative": "jecbse1"
};

export default function SubjectPage({ params }: { params: { subject: string } }) {
  const subjectName = params.subject.charAt(0).toUpperCase() + params.subject.slice(1);
  const [decksByChapter, setDecksByChapter] = useState<Record<string, UnifiedDeck[]>>({});
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [generatingChapterId, setGeneratingChapterId] = useState<string | null>(null);
  const [userClass, setUserClass] = useState<number>(10);

  useEffect(() => {
    const stored = localStorage.getItem("edutrack_class");
    if (stored) {
      setUserClass(parseInt(stored, 10));
    }
  }, []);

  // Mock Data for Chapters based on subject
  let chapters: any[] = [];
  const sName = params.subject.toLowerCase();
  
  if (sName === "physics") {
    chapters = [
      { id: "light", title: "Light - Reflection and Refraction", status: "completed", progress: 100 },
      { id: "human-eye", title: "The Human Eye and the Colourful World", status: "in-progress", progress: 60 },
      { id: "electricity", title: "Electricity", status: "locked", progress: 0 },
      { id: "magnetic-effects", title: "Magnetic Effects of Electric Current", status: "locked", progress: 0 },
    ];
  } else if (sName === "chemistry") {
    chapters = [
      { id: "chemical-reactions", title: "Chemical Reactions and Equations", status: "completed", progress: 100 },
      { id: "acids-bases", title: "Acids, Bases and Salts", status: "in-progress", progress: 60 },
      { id: "metals-nonmetals", title: "Metals and Non-metals", status: "locked", progress: 0 },
      { id: "carbon-compounds", title: "Carbon and its Compounds", status: "locked", progress: 0 },
    ];
  } else if (sName === "biology") {
    chapters = [
      { id: "life-processes", title: "Life Processes", status: "completed", progress: 100 },
      { id: "control-coordination", title: "Control and Coordination", status: "in-progress", progress: 60 },
      { id: "reproduction", title: "How do Organisms Reproduce?", status: "locked", progress: 0 },
      { id: "heredity", title: "Heredity and Evolution", status: "locked", progress: 0 },
      { id: "our-environment", title: "Our Environment", status: "locked", progress: 0 },
    ];
  } else if (sName === "mathematics" || sName === "maths") {
    chapters = [
      { id: "real-numbers", title: "Real Numbers", status: "completed", progress: 100 },
      { id: "polynomials", title: "Polynomials", status: "in-progress", progress: 60 },
      { id: "linear-equations", title: "Pair of Linear Equations in Two Variables", status: "locked", progress: 0 },
      { id: "quadratic-equations", title: "Quadratic Equations", status: "locked", progress: 0 },
      { id: "arithmetic-progressions", title: "Arithmetic Progressions", status: "locked", progress: 0 },
      { id: "triangles", title: "Triangles", status: "locked", progress: 0 },
      { id: "coordinate-geometry", title: "Coordinate Geometry", status: "locked", progress: 0 },
      { id: "trigonometry", title: "Introduction to Trigonometry", status: "locked", progress: 0 },
      { id: "trigonometry-applications", title: "Some Applications of Trigonometry", status: "locked", progress: 0 },
      { id: "circles", title: "Circles", status: "locked", progress: 0 },
      { id: "areas-circles", title: "Areas Related to Circles", status: "locked", progress: 0 },
      { id: "surface-areas", title: "Surface Areas and Volumes", status: "locked", progress: 0 },
      { id: "statistics", title: "Statistics", status: "locked", progress: 0 },
      { id: "probability", title: "Probability", status: "locked", progress: 0 },
    ];
  } else if (sName === "history") {
    chapters = [
      { id: "nationalism-europe", title: "The Rise of Nationalism in Europe", status: "completed", progress: 100 },
      { id: "nationalism-india", title: "Nationalism in India", status: "in-progress", progress: 65 },
      { id: "making-global-world", title: "The Making of a Global World", status: "locked", progress: 0 },
      { id: "age-industrialisation", title: "The Age of Industrialisation", status: "locked", progress: 0 },
      { id: "print-culture", title: "Print Culture and the Modern World", status: "locked", progress: 0 },
    ];
  } else if (sName === "geography") {
    chapters = [
      { id: "resources-development", title: "Resources and Development", status: "completed", progress: 100 },
      { id: "forest-wildlife", title: "Forest and Wildlife Resources", status: "in-progress", progress: 50 },
      { id: "water-resources", title: "Water Resources", status: "locked", progress: 0 },
      { id: "agriculture", title: "Agriculture", status: "locked", progress: 0 },
      { id: "minerals-energy", title: "Minerals and Energy Resources", status: "locked", progress: 0 },
      { id: "manufacturing-industries", title: "Manufacturing Industries", status: "locked", progress: 0 },
      { id: "lifelines-economy", title: "Lifelines of National Economy", status: "locked", progress: 0 },
    ];
  } else if (sName === "political-science" || sName === "civics") {
    chapters = [
      { id: "power-sharing", title: "Power Sharing", status: "completed", progress: 100 },
      { id: "federalism", title: "Federalism", status: "in-progress", progress: 70 },
      { id: "gender-religion-caste", title: "Gender, Religion and Caste", status: "locked", progress: 0 },
      { id: "political-parties", title: "Political Parties", status: "locked", progress: 0 },
      { id: "outcomes-democracy", title: "Outcomes of Democracy", status: "locked", progress: 0 },
    ];
  } else if (sName === "economics") {
    chapters = [
      { id: "development", title: "Development", status: "completed", progress: 100 },
      { id: "sectors-economy", title: "Sectors of the Indian Economy", status: "in-progress", progress: 60 },
      { id: "money-credit", title: "Money and Credit", status: "locked", progress: 0 },
      { id: "globalisation", title: "Globalisation and the Indian Economy", status: "locked", progress: 0 },
      { id: "consumer-rights", title: "Consumer Rights", status: "locked", progress: 0 },
    ];
  } else if (sName === "english-communicative") {
    chapters = [
      { id: "two-gentlemen", title: "Two Gentlemen of Verona (Prose)", status: "completed", progress: 100 },
      { id: "mrs-packletide", title: "Mrs. Packletide's Tiger (Prose)", status: "in-progress", progress: 60 },
      { id: "the-letter", title: "The Letter (Prose)", status: "locked", progress: 0 },
      { id: "shady-plot", title: "A Shady Plot (Prose)", status: "locked", progress: 0 },
      { id: "patol-babu", title: "Patol Babu, Film Star (Prose)", status: "locked", progress: 0 },
      { id: "virtually-true", title: "Virtually True (Prose)", status: "locked", progress: 0 },
      { id: "frog-nightingale", title: "The Frog and the Nightingale (Poem)", status: "locked", progress: 0 },
      { id: "mirror", title: "Mirror (Poem)", status: "locked", progress: 0 },
      { id: "not-marble", title: "Not Marble, nor the Gilded Monuments (Poem)", status: "locked", progress: 0 },
      { id: "ozymandias", title: "Ozymandias (Poem)", status: "locked", progress: 0 },
      { id: "ancient-mariner", title: "The Rime of the Ancient Mariner (Poem)", status: "locked", progress: 0 },
      { id: "snake", title: "Snake (Poem)", status: "locked", progress: 0 },
      { id: "dear-departed", title: "The Dear Departed (Drama)", status: "locked", progress: 0 },
      { id: "julius-caesar", title: "Julius Caesar (Drama)", status: "locked", progress: 0 },
    ];
  } else if (sName === "english" || sName === "english-literature") {
    chapters = [
      // First Flight - Prose
      { id: "letter-to-god", title: "A Letter to God (First Flight - Prose)", status: "completed", progress: 100 },
      { id: "nelson-mandela", title: "Nelson Mandela: Long Walk to Freedom (First Flight - Prose)", status: "in-progress", progress: 50 },
      { id: "stories-flying", title: "Two Stories about Flying (First Flight - Prose)", status: "locked", progress: 0 },
      { id: "diary-anne-frank", title: "From the Diary of Anne Frank (First Flight - Prose)", status: "locked", progress: 0 },
      { id: "glimpses-india", title: "Glimpses of India (First Flight - Prose)", status: "locked", progress: 0 },
      { id: "mijbil-otter", title: "Mijbil the Otter (First Flight - Prose)", status: "locked", progress: 0 },
      { id: "madam-rides-bus", title: "Madam Rides the Bus (First Flight - Prose)", status: "locked", progress: 0 },
      { id: "sermon-benares", title: "The Sermon at Benares (First Flight - Prose)", status: "locked", progress: 0 },
      { id: "proposal", title: "The Proposal (First Flight - Prose)", status: "locked", progress: 0 },
      
      // First Flight - Poetry
      { id: "dust-of-snow", title: "Dust of Snow (First Flight - Poem)", status: "locked", progress: 0 },
      { id: "fire-ice", title: "Fire and Ice (First Flight - Poem)", status: "locked", progress: 0 },
      { id: "tiger-zoo", title: "A Tiger in the Zoo (First Flight - Poem)", status: "locked", progress: 0 },
      { id: "wild-animals", title: "How to Tell Wild Animals (First Flight - Poem)", status: "locked", progress: 0 },
      { id: "ball-poem", title: "The Ball Poem (First Flight - Poem)", status: "locked", progress: 0 },
      { id: "amanda", title: "Amanda! (First Flight - Poem)", status: "locked", progress: 0 },
      { id: "trees", title: "The Trees (First Flight - Poem)", status: "locked", progress: 0 },
      { id: "fog", title: "Fog (First Flight - Poem)", status: "locked", progress: 0 },
      { id: "custard-dragon", title: "The Tale of Custard the Dragon (First Flight - Poem)", status: "locked", progress: 0 },
      { id: "anne-gregory", title: "For Anne Gregory (First Flight - Poem)", status: "locked", progress: 0 },
      
      // Footprints Without Feet
      { id: "triumph-surgery", title: "A Triumph of Surgery (Footprints Supplementary)", status: "locked", progress: 0 },
      { id: "thiefs-story", title: "The Thief's Story (Footprints Supplementary)", status: "locked", progress: 0 },
      { id: "midnight-visitor", title: "The Midnight Visitor (Footprints Supplementary)", status: "locked", progress: 0 },
      { id: "question-trust", title: "A Question of Trust (Footprints Supplementary)", status: "locked", progress: 0 },
      { id: "footprints-without-feet", title: "Footprints without Feet (Footprints Supplementary)", status: "locked", progress: 0 },
      { id: "making-scientist", title: "The Making of a Scientist (Footprints Supplementary)", status: "locked", progress: 0 },
      { id: "necklace", title: "The Necklace (Footprints Supplementary)", status: "locked", progress: 0 },
      { id: "bholi", title: "Bholi (Footprints Supplementary)", status: "locked", progress: 0 },
      { id: "book-saved-earth", title: "The Book That Saved the Earth (Footprints Supplementary)", status: "locked", progress: 0 },
    ];
  } else {
    // Default Chemistry/Science
    chapters = [
      { id: "chemical-reactions", title: "Chemical Reactions and Equations", status: "completed", progress: 100 },
      { id: "acids-bases", title: "Acids, Bases and Salts", status: "in-progress", progress: 60 },
      { id: "metals-nonmetals", title: "Metals and Non-metals", status: "locked", progress: 0 },
      { id: "carbon-compounds", title: "Carbon and its Compounds", status: "locked", progress: 0 },
    ];
  }

  const getSubjectColor = (subj: string) => {
    const s = (subj || "").toLowerCase();
    if (s === "science" || s === "chemistry" || s === "physics" || s === "biology") return "from-emerald-500 to-teal-600";
    if (s === "mathematics" || s === "maths") return "from-blue-500 to-indigo-600";
    if (s === "history") return "from-amber-500 to-orange-600";
    if (s === "geography") return "from-green-500 to-emerald-600";
    if (s === "english") return "from-violet-500 to-purple-600";
    return "from-fuchsia-500 to-indigo-600";
  };

  const refreshFlashcards = () => {
    try {
      // 1. Get global decks from localStorage
      const globalRaw = localStorage.getItem("edutrack_flashcards") || "[]";
      const globalDecks: any[] = JSON.parse(globalRaw);
      
      const mapping: Record<string, UnifiedDeck[]> = {};

      chapters.forEach(chapter => {
        const deckList: UnifiedDeck[] = [];

        // A. Load from chapter-specific lesson flashcards
        try {
          const lessonRaw = localStorage.getItem(`flashcards__${params.subject}__${chapter.id}`);
          if (lessonRaw) {
            const topics = JSON.parse(lessonRaw);
            if (Array.isArray(topics)) {
              const cards = topics
                .filter((t: any) => t.flashcard?.front && t.flashcard?.back)
                .map((t: any, idx: number) => ({
                  id: `lesson_card_${chapter.id}_${idx}`,
                  front: t.flashcard.front,
                  back: t.flashcard.back,
                  status: "new"
                }));

              if (cards.length > 0) {
                deckList.push({
                  id: `lesson_${chapter.id}`,
                  title: `${chapter.title} (Lesson)`,
                  subject: subjectName,
                  createdAt: Date.now(),
                  cards,
                  isGlobal: false,
                  link: `/learn/${params.subject}/${chapter.id}?tab=revise&deck=lesson_${chapter.id}`
                });
              }
            }
          }
        } catch (e) {
          console.error(e);
        }

        // B. Load from global decks ('edutrack_flashcards')
        if (Array.isArray(globalDecks)) {
          globalDecks.forEach(deck => {
            const deckSubject = (deck.subject || "").toLowerCase();
            const currentSubject = params.subject.toLowerCase();
            
            // Flexibly match subjects (Science matches Chemistry, Physics, Biology)
            const isSubjectMatch = 
              deckSubject === currentSubject ||
              (currentSubject === "chemistry" && deckSubject === "science") ||
              (currentSubject === "physics" && deckSubject === "science") ||
              (currentSubject === "biology" && deckSubject === "science") ||
              (currentSubject === "science" && ["chemistry", "physics", "biology"].includes(deckSubject));

            if (isSubjectMatch) {
              const normalizedDeckTitle = (deck.title || "").toLowerCase();
              const normalizedChapterTitle = (chapter.title || "").toLowerCase();
              const chapterWords = chapter.id.replace(/-/g, ' ');
              
              const isChapterMatch = 
                normalizedDeckTitle.includes(chapterWords) ||
                chapterWords.includes(normalizedDeckTitle) ||
                normalizedChapterTitle.includes(normalizedDeckTitle) ||
                normalizedDeckTitle.includes(normalizedChapterTitle);

              if (isChapterMatch && Array.isArray(deck.cards)) {
                deckList.push({
                  id: deck.id,
                  title: deck.title,
                  subject: deck.subject,
                  createdAt: deck.createdAt || Date.now(),
                  lastStudied: deck.lastStudied,
                  cards: deck.cards,
                  isGlobal: true,
                  link: `/learn/${params.subject}/${chapter.id}?tab=revise&deck=${deck.id}`
                });
              }
            }
          });
        }

        mapping[chapter.id] = deckList;
      });

      setDecksByChapter(mapping);
    } catch (err) {
      console.error("Error loading flashcards: ", err);
    }
  };

  useEffect(() => {
    refreshFlashcards();
  }, [params.subject]);

  const toggleAccordion = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const generateFlashcardsForChapter = async (chapterId: string, chapterTitle: string) => {
    setGeneratingChapterId(chapterId);
    try {
      const res = await fetch("/api/learn/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subjectName, chapter: chapterTitle, language: "Hinglish" })
      });
      
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const topics = data.topics || [];
      
      if (topics.length > 0) {
        const flashcardKey = `flashcards__${params.subject}__${chapterId}`;
        localStorage.setItem(flashcardKey, JSON.stringify(topics));
        
        // Update index
        try {
          const raw = localStorage.getItem("flashcard_index") || "{}";
          const index: Record<string, string[]> = JSON.parse(raw);
          if (!index[params.subject]) index[params.subject] = [];
          if (!index[params.subject].includes(chapterId)) {
            index[params.subject].push(chapterId);
          }
          localStorage.setItem("flashcard_index", JSON.stringify(index));
        } catch {}

        refreshFlashcards();
        
        // Auto expand newly generated cards
        setExpandedChapters(prev => ({ ...prev, [chapterId]: true }));
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate flashcards. Please try again.");
    } finally {
      setGeneratingChapterId(null);
    }
  };

  const handleDeleteDeck = (e: React.MouseEvent, id: string, isGlobal: boolean, chapterId: string) => {
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
        const flashcardKey = `flashcards__${params.subject}__${chapterId}`;
        localStorage.removeItem(flashcardKey);
        
        // Also remove from index
        const indexRaw = localStorage.getItem("flashcard_index") || "{}";
        const index: Record<string, string[]> = JSON.parse(indexRaw);
        if (index[params.subject]) {
          index[params.subject] = index[params.subject].filter(c => c !== chapterId);
          localStorage.setItem("flashcard_index", JSON.stringify(index));
        }
      } catch (err) {
        console.error(err);
      }
    }
    
    refreshFlashcards();
  };

  return (
    <div className="space-y-8">
      <header>
        <Link href="/learn" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Subjects
        </Link>
        <h1 className="text-3xl font-bold mb-2">{subjectName}</h1>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-slate-600 dark:text-slate-400">Class {userClass} CBSE • {chapters.length} Chapters</p>
          {userClass === 10 && (
            <Link href={`/pyq`} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all w-fit shadow-sm">
              <Trophy className="w-4 h-4" /> PYQ Practice Hub
            </Link>
          )}
        </div>
      </header>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Syllabus Progress</h2>
          <span className="text-sm font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">32% Completed</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 mb-8">
          <div className="bg-indigo-500 h-3 rounded-full" style={{ width: '32%' }}></div>
        </div>

        <div className="space-y-4">
          {chapters.map((chapter, index) => {
            const decks = decksByChapter[chapter.id] || [];
            const hasDecks = decks.length > 0;
            let subjectCode = subjectCodes[params.subject.toLowerCase()] || "jesc1";
            if (params.subject.toLowerCase() === "english-literature" || params.subject.toLowerCase() === "english") {
              const footprintsSlugs = ["triumph-surgery", "thiefs-story", "midnight-visitor", "question-trust", "footprints-without-feet", "making-scientist", "necklace", "bholi", "book-saved-earth"];
              if (footprintsSlugs.includes(chapter.id)) {
                subjectCode = "jefp1";
              } else {
                subjectCode = "jeff1";
              }
            }
            const chapterNum = chapterNumbers[chapter.id] || (index + 1);

            return (
              <div 
                key={chapter.id} 
                className={`group border ${
                  chapter.status === 'locked' 
                    ? 'border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/30 opacity-75' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white dark:bg-slate-800'
                } p-4 md:p-6 rounded-2xl flex flex-col gap-4 transition-all`}
              >
                {/* Main Chapter Content */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 flex-shrink-0 ${chapter.status === 'completed' ? 'text-emerald-500' : chapter.status === 'in-progress' ? 'text-indigo-500' : 'text-slate-400'}`}>
                      {chapter.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : chapter.status === 'locked' ? <Lock className="w-5 h-5 ml-0.5" /> : <PlayCircle className="w-6 h-6" />}
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium mb-1">Chapter {index + 1}</p>
                      <h3 className={`text-lg font-bold ${chapter.status === 'locked' ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400'} transition-colors`}>{chapter.title}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end gap-3 md:w-auto">
                    {chapter.status !== 'locked' && (
                      <div className="w-24">
                        <div className="flex justify-between text-xs font-medium mb-1 text-slate-500">
                          <span>Progress</span>
                          <span>{chapter.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                          <div className={`${chapter.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-500'} h-1.5 rounded-full`} style={{ width: `${chapter.progress}%` }}></div>
                        </div>
                      </div>
                    )}
                    
                    {/* PYQ Button */}
                    {chapter.status !== 'locked' && userClass === 10 && (
                      <Link
                        href={`/pyq/${subjectCode}/${chapterNum}`}
                        className="px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800/50"
                      >
                        <Trophy className="w-3.5 h-3.5" /> PYQ
                      </Link>
                    )}

                    <Link 
                      href={chapter.status === 'locked' ? '#' : `/learn/${params.subject}/${chapter.id}`}
                      className={`px-6 py-2 rounded-xl text-sm font-bold transition-colors ${
                        chapter.status === 'locked' 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {chapter.status === 'completed' ? 'Revise' : chapter.status === 'locked' ? 'Locked' : 'Start'}
                    </Link>
                  </div>
                </div>

                {/* Interactive Flashcard Accordion of Deck Cards arranged by Chapter */}
                {chapter.status !== 'locked' && (
                  <div className="mt-2 pt-4 border-t border-slate-100 dark:border-slate-800/80 w-full">
                    {hasDecks ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => toggleAccordion(chapter.id)}
                            className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          >
                            {expandedChapters[chapter.id] ? (
                              <>
                                <ChevronUp className="w-4 h-4 text-indigo-500" />
                                Hide Flashcards ({decks.length} deck{decks.length > 1 ? 's' : ''})
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4 text-indigo-500" />
                                View Flashcards ({decks.length} deck{decks.length > 1 ? 's' : ''})
                              </>
                            )}
                          </button>
                        </div>

                        {expandedChapters[chapter.id] && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                            {decks.map(deck => {
                              const mastered = deck.cards.filter((c: any) => c.status === "mastered" || c.status === "complete").length;
                              const total = deck.cards.length;
                              const progress = Math.round((mastered / total) * 100) || 0;
                              const isNew = !deck.lastStudied;
                              const gradient = getSubjectColor(deck.subject);

                              return (
                                <Link href={deck.link} key={deck.id} className="block group">
                                  <div className="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-6 flex flex-col gap-4 hover:border-slate-700 hover:shadow-xl hover:-translate-y-0.5 transition-all text-white">
                                    {/* Color accent top bar */}
                                    <div className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${gradient}`} />

                                    <div className="flex items-center justify-between">
                                      <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-full">
                                        {deck.subject}
                                      </span>
                                      
                                      <div className="flex items-center gap-2">
                                        {/* Delete Deck Button */}
                                        <button
                                          onClick={(e) => handleDeleteDeck(e, deck.id, deck.isGlobal, chapter.id)}
                                          className="p-1.5 bg-slate-800 hover:bg-red-500/25 hover:text-red-400 border border-slate-750 rounded-xl transition-all text-slate-400 z-10"
                                          title="Delete Deck"
                                        >
                                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                        <span className="inline-block px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-full flex items-center gap-1">
                                          <Flame className="w-3.5 h-3.5 text-emerald-400" /> Studied
                                        </span>
                                      </div>
                                    </div>

                                    <h4 className="text-lg font-bold text-white leading-snug group-hover:text-emerald-400 transition-colors">
                                      {deck.title}
                                    </h4>

                                    <div className="flex items-center gap-4 text-xs text-slate-400 font-semibold">
                                      <span className="flex items-center gap-1.5">
                                        <Layers className="w-4 h-4 text-slate-500" /> {total} cards
                                      </span>
                                      <span className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-slate-500" /> {new Date(deck.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>

                                    <div className="space-y-1.5">
                                      <div className="flex justify-between text-xs font-bold">
                                        <span className="text-slate-400">Mastery</span>
                                        <span className="text-emerald-400">{progress}%</span>
                                      </div>
                                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                          style={{ width: `${progress}%` }} />
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                                      <span className="text-sm font-bold text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                                        Study Now <ArrowRight className="w-4 h-4" />
                                      </span>
                                      <span className="text-xs text-slate-400 font-medium">
                                        {mastered}/{total} mastered
                                      </span>
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-sm py-1 bg-slate-50 dark:bg-slate-900/10 px-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-slate-400 font-medium text-xs">No flashcards generated yet.</p>
                        <button
                          onClick={() => generateFlashcardsForChapter(chapter.id, chapter.title)}
                          disabled={generatingChapterId === chapter.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold transition-all border border-indigo-100 dark:border-indigo-900/30 disabled:opacity-50"
                        >
                          {generatingChapterId === chapter.id ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3" />
                              Generate Flashcards
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
