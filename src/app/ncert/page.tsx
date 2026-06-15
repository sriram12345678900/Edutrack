"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { BookOpen, ExternalLink, Search, GraduationCap, X, FileText, ChevronRight, ArrowLeft, Download, Loader2, Home, Brain, Send, Bot, User, Camera, Crop, Image as ImageIcon, ZoomIn, ZoomOut, ChevronLeft, Moon, Sun, Pen, Eraser, Highlighter, Pencil, Trash2, Sparkles, Trophy, Volume2, Play, Pause, Activity } from "lucide-react";
import Link from "next/link";
import { ncertLibrary, subjects, subjectColors, NcertBook } from "@/lib/ncert-books";
import html2canvas from 'html2canvas';
import dynamic from 'next/dynamic';
import { cn } from "@/lib/utils";
const PdfViewer = dynamic(() => import('@/components/PdfViewer'), { ssr: false });

interface MindMapNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'root' | 'branch' | 'leaf';
  definition: string;
  equation?: string;
  tip?: string;
}

const MIND_MAPS: Record<string, MindMapNode[]> = {
  "Chemical Reactions": [
    { id: "root", label: "Chemical Reactions", x: 200, y: 160, type: "root", definition: "A process in which one or more substances are converted into new substances with different chemical properties." },
    { id: "types", label: "Types of Reactions", x: 90, y: 80, type: "branch", definition: "The classification of chemical reactions based on how products are formed." },
    { id: "comb", label: "Combination", x: 40, y: 30, type: "leaf", definition: "Two or more reactants combine to form a single product.", equation: "~CaO + H_2O ──> Ca(OH)_2~", tip: "Activity 1.4: Lime reacting with water is highly exothermic! Watch out for temperature rise." },
    { id: "decomp", label: "Decomposition", x: 140, y: 30, type: "leaf", definition: "A single reactant breaks down into two or more simpler products.", equation: "~2FeSO_4 ──> Fe_2O_3 + SO_2 + SO_3~", tip: "Activity 1.5: Green ferrous sulphate crystals turn brown and emit smell of burning sulfur." },
    { id: "effects", label: "Oxidation Effects", x: 310, y: 80, type: "branch", definition: "Common everyday chemical reactions resulting from atmospheric oxygen." },
    { id: "corrosion", label: "Corrosion", x: 280, y: 30, type: "leaf", definition: "Gradual decay of metals due to air, moisture, or acid attack.", equation: "Rust: ~Fe_2O_3 · xH_2O~", tip: "CBSE Tip: Iron rusting is oxidation; galvanization and electroplating prevent it." },
    { id: "rancidity", label: "Rancidity", x: 350, y: 30, type: "leaf", definition: "Oxidation of fats/oils in food making them smell and taste bad.", tip: "CBSE Tip: Nitrogen gas is flushed into chips packets to prevent rancidity." },
    { id: "energy", label: "Energy Dynamics", x: 200, y: 250, type: "branch", definition: "Reactions classified by heat exchange." },
    { id: "exo", label: "Exothermic", x: 140, y: 290, type: "leaf", definition: "Reactions in which heat is released along with the products.", equation: "~CH_4 + 2O_2 ──> CO_2 + 2H_2O + Heat~", tip: "Note: Respiration is a key exothermic process!" },
    { id: "endo", label: "Endothermic", x: 260, y: 290, type: "leaf", definition: "Reactions in which energy/heat is absorbed to carry out the process.", equation: "~CaCO_3 ──> CaO + CO_2~", tip: "Note: All decomposition reactions are endothermic processes." }
  ]
};

const chapterNamesMap: Record<string, string[]> = {
  jesc1: [
    "Chemical Reactions and Equations",
    "Acids, Bases and Salts",
    "Metals and Non-metals",
    "Carbon and its Compounds",
    "Life Processes",
    "Control and Coordination",
    "How do Organisms Reproduce?",
    "Heredity",
    "Light - Reflection and Refraction",
    "The Human Eye and the Colourful World",
    "Electricity",
    "Magnetic Effects of Electric Current",
    "Our Environment"
  ],
  jemh1: [
    "Real Numbers",
    "Polynomials",
    "Pair of Linear Equations in Two Variables",
    "Quadratic Equations",
    "Arithmetic Progressions",
    "Triangles",
    "Coordinate Geometry",
    "Introduction to Trigonometry",
    "Some Applications of Trigonometry",
    "Circles",
    "Areas Related to Circles",
    "Surface Areas and Volumes",
    "Statistics",
    "Probability"
  ],
  jeff1: [
    "A Letter to God (including Poems: Dust of Snow, Fire and Ice)",
    "Nelson Mandela: Long Walk to Freedom (including Poem: A Tiger in the Zoo)",
    "Two Stories about Flying (including Poems: How to Tell Wild Animals, The Ball Poem)",
    "From the Diary of Anne Frank (including Poem: Amanda!)",
    "Glimpses of India (including Poem: The Trees)",
    "Mijbil the Otter (including Poem: Fog)",
    "Madam Rides the Bus (including Poem: The Tale of Custard the Dragon)",
    "The Sermon at Benares (including Poem: For Anne Gregory)",
    "The Proposal"
  ],
  jefp1: [
    "A Triumph of Surgery",
    "The Thief's Story",
    "The Midnight Visitor",
    "A Question of Trust",
    "Footprints without Feet",
    "The Making of a Scientist",
    "The Necklace",
    "Bholi",
    "The Book That Saved the Earth"
  ],
  jess3: [
    "The Rise of Nationalism in Europe",
    "Nationalism in India",
    "The Making of a Global World",
    "The Age of Industrialisation",
    "Print Culture and the Modern World"
  ],
  jess1: [
    "Resources and Development",
    "Forest and Wildlife Resources",
    "Water Resources",
    "Agriculture",
    "Minerals and Energy Resources",
    "Manufacturing Industries",
    "Lifelines of National Economy"
  ],
  jess4: [
    "Power Sharing",
    "Federalism",
    "Gender, Religion and Caste",
    "Political Parties",
    "Outcomes of Democracy"
  ],
  jess2: [
    "Development",
    "Sectors of the Indian Economy",
    "Money and Credit",
    "Globalisation and the Indian Economy",
    "Consumer Rights"
  ]
};

type BookWithClass = NcertBook & { class: number };

// Hybrid URL logic:
// 1. Standard NCERT books (95% of books): We legally link to the official NCERT site.
// 2. Class 1 & 2 "New Syllabus" books: NCERT does not host these digitally yet. We point to our GitHub mirror.
// 3. Fallbacks: Single-file complete books.

function getChapterPdfUrl(book: NcertBook, chapterNum: number): string {
  if (book.directUrl) return book.directUrl;
  
  const formattedCh = chapterNum.toString().padStart(2, '0');
  
  if ((book as any).useGithubMirror) {
    return `https://raw.githubusercontent.com/manan024/ncert-pdf-mirror/main/${book.code}/${book.code}${formattedCh}.pdf`;
  }

  return `https://ncert.nic.in/textbook/pdf/${book.code}${formattedCh}.pdf`;
}

function getSinglePdfUrl(book: NcertBook): string {
  if (book.directUrl) return book.directUrl;
  return `https://ncert.nic.in/textbook/pdf/${book.code}dd.pdf`;
}

function getFullBookUrl(bookCode: string, chapters: number): string {
  return `https://ncert.nic.in/textbook.php?${bookCode}=1-${chapters}`;
}

function hexToRgba(hex: string, alpha: number) {
  if (hex.startsWith('rgba')) return hex;
  const r = parseInt(hex.slice(1, 3), 16) || 0;
  const g = parseInt(hex.slice(3, 5), 16) || 0;
  const b = parseInt(hex.slice(5, 7), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const formatMarkdown = (md: string) => {
  if (!md) return "";
  
  // Escapes simple HTML tags to avoid raw injection while keeping the parsed markdown safe
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Restore sub and sup HTML tags safely if they were written directly
  html = html
    .replace(/&lt;sub&gt;/g, "<sub>")
    .replace(/&lt;\/sub&gt;/g, "</sub>")
    .replace(/&lt;sup&gt;/g, "<sup>")
    .replace(/&lt;\/sup&gt;/g, "</sup>");

  // Support standard Markdown subscript and superscript notations
  // Subscript: H~2~O -> H<sub>2</sub>O
  html = html.replace(/~([^~]+)~/g, "<sub>$1</sub>");
  // Superscript: 10^5^ -> 10<sup>5</sup>
  html = html.replace(/\^([^^]+)\^/g, "<sup>$1</sup>");

  // Headers: # Header -> <h1>Header</h1>
  html = html.replace(/^#\s+(.+)$/gm, "<h1 class='text-3xl font-extrabold text-slate-900 dark:text-white mt-8 mb-4'>$1</h1>");
  html = html.replace(/^##\s+(.+)$/gm, "<h2 class='text-2xl font-bold text-slate-900 dark:text-white mt-6 mb-3 border-b pb-2 border-slate-200 dark:border-slate-700'>$1</h2>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3 class='text-xl font-bold text-slate-955 dark:text-slate-200 mt-4 mb-2'>$1</h3>");
  html = html.replace(/^####\s+(.+)$/gm, "<h4 class='text-lg font-bold text-slate-960 dark:text-slate-200 mt-3 mb-2'>$1</h4>");

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

export default function NcertViewer() {
  const [selectedClass, setSelectedClass] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | "All">("All");
  
  const [englishCurriculum, setEnglishCurriculum] = useState<string>("All");
  const [sanskritCurriculum, setSanskritCurriculum] = useState<string>("All");
  const [userLanguage, setUserLanguage] = useState<string>("English");
  
  // Initialize from LocalStorage
  useEffect(() => {
    const savedClass = localStorage.getItem("edutrack_class");
    if (savedClass && savedClass !== "all") {
      setSelectedClass(parseInt(savedClass));
    }
    
    const savedTheme = localStorage.getItem("edutrack_theme");
    if (savedTheme === 'dark' || (savedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
    }

    const savedEng = localStorage.getItem("edutrack_english_curr");
    if (savedEng) setEnglishCurriculum(savedEng);

    const savedSan = localStorage.getItem("edutrack_sanskrit_curr");
    if (savedSan) setSanskritCurriculum(savedSan);

    const savedLang = localStorage.getItem("edutrack_language");
    if (savedLang) setUserLanguage(savedLang);
  }, []);
  
  // Viewer State
  const [openBook, setOpenBook] = useState<BookWithClass | null>(null);
  const [openChapter, setOpenChapter] = useState<{ num: number; pdfUrl: string } | null>(null);
  const [pdfLoading, setPdfLoading] = useState(true);

  const [lineByLineData, setLineByLineData] = useState<any>(null);
  const [showLineByLineModal, setShowLineByLineModal] = useState<boolean>(false);
  const [lineByLineLoading, setLineByLineLoading] = useState<boolean>(false);

  const fetchLineByLine = async () => {
    if (!openBook || !openChapter) return;
    if (lineByLineData) {
      setShowLineByLineModal(true);
      return;
    }
    setLineByLineLoading(true);
    try {
      const bookSubject = openBook.subject || "Science";
      const bookChapter = openBook.singleFileName || openBook.directUrl 
        ? openBook.title 
        : `${openBook.title} - Chapter ${openChapter.num}`;
      
      const res = await fetch("/api/learn/line-by-line", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: bookSubject, chapter: bookChapter, language: userLanguage })
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

  const [theory, setTheory] = useState<string>("");
  const [showSideTheory, setShowSideTheory] = useState<boolean>(false);
  const [theoryLoading, setTheoryLoading] = useState<boolean>(false);
  const [sidebarTab, setSidebarTab] = useState<'guide' | 'mindmap'>('guide');
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);

  const fetchTheory = async (force: boolean = false) => {
    if (!openBook || !openChapter) return;
    
    const chapterTitle = chapterNamesMap[openBook.code]?.[openChapter.num - 1] || `${openBook.title} - Chapter ${openChapter.num}`;
    const theoryKey = `theory__${openBook.subject.toLowerCase()}__${chapterTitle.replace(/\s+/g, '-').toLowerCase()}`;

    if (theory && !force) {
      setShowSideTheory(true);
      return;
    }
    
    if (!force) {
      try {
        const cached = localStorage.getItem(theoryKey);
        if (cached) {
          setTheory(cached);
          setShowSideTheory(true);
          return;
        }
      } catch {}
    } else {
      try {
        localStorage.removeItem(theoryKey);
      } catch {}
      setTheory(""); // Instantly wipe state so the screen shows loading spinner
    }

    setTheoryLoading(true);
    try {
      const res = await fetch("/api/learn/theory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: openBook.subject || "Science",
          chapter: chapterTitle,
          language: userLanguage
        })
      });
      const data = await res.json();
      if (data.theory) {
        setTheory(data.theory);
        try {
          localStorage.setItem(theoryKey, data.theory);
        } catch {}
        setShowSideTheory(true);
      } else {
        alert("Failed to load Textbook Draft: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      alert("Error generating Textbook Draft.");
    } finally {
      setTheoryLoading(false);
    }
  };

  // Custom PDF Viewer State
  const [numPages, setNumPages] = useState<number>(1);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfScale, setPdfScale] = useState<number>(1.2);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isDrawMode, setIsDrawMode] = useState<boolean>(false);
  const [drawTool, setDrawTool] = useState<'highlighter' | 'pen' | 'eraser'>('highlighter');
  const [drawColorHex, setDrawColorHex] = useState<string>('#ffeb3b');
  const [drawThickness, setDrawThickness] = useState<number>(12);
  const [clearDrawingsSignal, setClearDrawingsSignal] = useState<number>(0);
  const [downloadSignal, setDownloadSignal] = useState<number>(0);
  const [captureSignal, setCaptureSignal] = useState<number>(0);
  const [pageText, setPageText] = useState<string>("");

  const effectiveDrawColor = drawTool === 'eraser' 
    ? 'eraser' 
    : drawTool === 'highlighter' 
      ? hexToRgba(drawColorHex, 0.5) 
      : drawColorHex;

  // AI Chat State
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: "user" | "assistant", content: string, attachments?: {type: string, data: string, name: string}[]}[]>([]);
  const [chatAttachments, setChatAttachments] = useState<{type: string, data: string, name: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Window State (Position & Size)
  const [winState, setWinState] = useState({ x: -1, y: -1, w: 384, h: 480 });
  const isInteracting = useRef<{ type: 'drag' | 'resize', dir?: string } | null>(null);
  const interactStartCoords = useRef({ x: 0, y: 0 });
  const startWinState = useRef({ x: 0, y: 0, w: 0, h: 0 });

  // Initialize window position on first open
  useEffect(() => {
    if (isAiChatOpen && winState.x === -1) {
      setWinState(prev => ({
        ...prev,
        x: Math.max(20, window.innerWidth - prev.w - 24),
        y: Math.max(20, window.innerHeight - prev.h - 96)
      }));
    }
  }, [isAiChatOpen, winState.x]);

  // Screenshot & Crop State
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  // Audiobook State
  const [isPlaying, setIsPlaying] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const toggleAudioPlayback = () => {
    if (!synthRef.current) return;
    if (isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
    } else {
      if (synthRef.current.paused && utteranceRef.current) {
        synthRef.current.resume();
      } else {
        const text = pageText || "Welcome to the AI Professor Audiobook. Please navigate to a page with text to begin reading.";
        utteranceRef.current = new SpeechSynthesisUtterance(text);
        utteranceRef.current.onend = () => setIsPlaying(false);
        synthRef.current.speak(utteranceRef.current);
      }
      setIsPlaying(true);
    }
  };

  const handleOpenChapter = (ch: { num: number; pdfUrl: string }, book: BookWithClass) => {
    setPdfLoading(true);
    setOpenChapter(ch);
    setLineByLineData(null);
    setShowLineByLineModal(false);
    setTheory("");
    setShowSideTheory(false);
    setChatMessages([
      { role: "assistant", content: `Hi! I see you're reading **${book.title} - ${book.singleFileName || book.directUrl ? "Full Book" : "Chapter " + ch.num}**. How can I help you? Would you like me to generate a chapter summary, key concepts, or practice questions?` }
    ]);
    setIsAiChatOpen(false);

    // Fallback: If onLoad doesn't fire within 8 seconds, hide loading screen anyway
    setTimeout(() => {
      setPdfLoading(false);
    }, 8000);
  };

  const handleCloseViewer = useCallback(() => {
    setOpenChapter(null);
    setPdfLoading(true);
    setIsAiChatOpen(false);
    setPageNumber(1);
    setPdfScale(1.2);
    setLineByLineData(null);
    setShowLineByLineModal(false);
    setTheory("");
    setShowSideTheory(false);
  }, []);

  const handleInteractMove = useCallback((e: PointerEvent) => {
    if (!isInteracting.current) return;
    
    const deltaX = e.clientX - interactStartCoords.current.x;
    const deltaY = e.clientY - interactStartCoords.current.y;
    const start = startWinState.current;
    
    if (isInteracting.current.type === 'drag') {
      setWinState(prev => ({
        ...prev,
        x: Math.max(0, Math.min(window.innerWidth - prev.w, start.x + deltaX)),
        y: Math.max(0, Math.min(window.innerHeight - prev.h, start.y + deltaY))
      }));
    } else if (isInteracting.current.type === 'resize') {
      const dir = isInteracting.current.dir!;
      let { x, y, w, h } = start;

      if (dir.includes('e')) w = Math.max(300, Math.min(800, start.w + deltaX));
      if (dir.includes('s')) h = Math.max(400, Math.min(800, start.h + deltaY));
      if (dir.includes('w')) {
        const newW = Math.max(300, Math.min(800, start.w - deltaX));
        if (newW !== w) { x = start.x + (start.w - newW); w = newW; }
      }
      if (dir.includes('n')) {
        const newH = Math.max(400, Math.min(800, start.h - deltaY));
        if (newH !== h) { y = start.y + (start.h - newH); h = newH; }
      }
      
      setWinState({ x, y, w, h });
    }
  }, []);

  const handleInteractEnd = useCallback(() => {
    isInteracting.current = null;
    window.removeEventListener('pointermove', handleInteractMove);
    window.removeEventListener('pointerup', handleInteractEnd);
  }, [handleInteractMove]);

  const handleInteractStart = (e: React.PointerEvent, type: 'drag' | 'resize', dir?: string) => {
    e.preventDefault();
    isInteracting.current = { type, dir };
    interactStartCoords.current = { x: e.clientX, y: e.clientY };
    startWinState.current = { ...winState };
    
    window.addEventListener('pointermove', handleInteractMove);
    window.addEventListener('pointerup', handleInteractEnd);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handleInteractMove);
      window.removeEventListener('pointerup', handleInteractEnd);
    };
  }, [handleInteractMove, handleInteractEnd]);

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (isAiChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isAiChatOpen]);

  const handleCapture = useCallback((dataUrl: string) => {
    setIsAiChatOpen(true);
    const updatedMessages = [...chatMessages];
    
    // Attach to last user message or create a new one
    if (updatedMessages.length > 0 && updatedMessages[updatedMessages.length - 1].role === "user") {
      const lastMsg = updatedMessages[updatedMessages.length - 1];
      const newAttachments = [...(lastMsg.attachments || []), { type: "image", data: dataUrl, name: `Page_${pageNumber}.png` }];
      updatedMessages[updatedMessages.length - 1] = { ...lastMsg, attachments: newAttachments };
      setChatMessages(updatedMessages);
    } else {
      setChatMessages([
        ...updatedMessages,
        { role: "user", content: "I have a question about this page.", attachments: [{ type: "image", data: dataUrl, name: `Page_${pageNumber}.png` }] }
      ]);
      setChatLoading(true);
      setTimeout(() => {
        setChatMessages(prev => [...prev, { role: "assistant", content: "I see the page! What would you like to know about it?" }]);
        setChatLoading(false);
      }, 1000);
    }
  }, [chatMessages, pageNumber]);

  const handleChatSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault();
    const textToSend = overrideInput || chatInput;
    if (!textToSend.trim() && chatAttachments.length === 0) return;

    const newMessages = [...chatMessages, { role: "user" as const, content: textToSend, attachments: chatAttachments }];
    setChatMessages(newMessages);
    setChatInput("");
    setChatAttachments([]);
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: newMessages, 
          language: userLanguage,
          pdfUrl: openChapter?.pdfUrl,
          bookInfo: openBook ? `Class ${openBook.class} ${openBook.subject || openBook.title} - Chapter ${openChapter?.num !== undefined ? openChapter.num : ''}` : ''
        })
      });
      
      let data;
      try {
        data = await response.json();
      } catch (err) {
        throw new Error("Server returned an invalid response. Please check the server logs.");
      }

      if (!response.ok) {
        throw new Error(data.reply || "Server Error");
      }

      setChatMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (error: any) {
      setChatMessages([
        ...newMessages,
        { role: "assistant", content: `Oops! ${error.message}` }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setChatAttachments(prev => [...prev, {
              type: file.type,
              data: event.target!.result as string,
              name: file.name || "Pasted Image"
            }]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleScreenshot = async () => {
    const container = document.getElementById("pdf-render-container");
    if (!container) return;
    
    try {
      const canvas = await html2canvas(container, {
        useCORS: true,
        scale: 2,
        backgroundColor: null
      });
      setCropImageSrc(canvas.toDataURL("image/jpeg", 0.9));
    } catch (err) {
      console.error("Screenshot failed:", err);
      alert("Failed to capture screenshot.");
    }
  };

  // Lock body scroll when any modal/viewer is open to prevent double scrollbars and background bleeding
  useEffect(() => {
    if (openBook) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [openBook]);

  const filtered = ncertLibrary
    .filter(c => selectedClass === "all" || c.class === selectedClass)
    .flatMap(c => c.books.map(b => ({ ...b, class: c.class })))
    .filter(b => selectedSubject === "All" || b.subject === selectedSubject)
    .filter(b => {
      // Filter out curriculum specific books for class 9 & 10
      if (b.subject === "English" && (b.class === 9 || b.class === 10) && englishCurriculum !== "All") {
        if (englishCurriculum === "Language & Literature") {
          return !b.title.includes("Communicative") && !b.title.includes("Literature Reader");
        } else if (englishCurriculum === "Communicative") {
          return b.title.includes("Communicative") || b.title.includes("Literature Reader");
        }
      }
      if (b.subject === "Sanskrit" && (b.class === 9 || b.class === 10) && sanskritCurriculum !== "All") {
        if (sanskritCurriculum === "Regular") {
          return !b.title.includes("Communicative") && !b.title.includes("Manika");
        } else if (sanskritCurriculum === "Communicative") {
          return b.title.includes("Communicative") || b.title.includes("Manika");
        }
      }
      return true;
    })
    .filter(b =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.subject.toLowerCase().includes(search.toLowerCase())
    );

  const gradient = openBook ? subjectColors[openBook.subject] || "from-slate-500 to-slate-600" : "";

  const getProxyUrl = (url: string, book: BookWithClass, chNum: number) => {
    const filename = book.singleFileName || book.directUrl 
      ? `${book.title}.pdf` 
      : `${book.title} - Chapter ${chNum}.pdf`;
    return `/api/pdf-proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
  };

  return (
    <div className="space-y-8">
      {/* Header & Navigation */}
      <header className="relative p-8 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600 dark:from-indigo-400 dark:to-emerald-400 tracking-tight flex items-center gap-4">
            <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2.5 rounded-2xl shadow-inner border border-indigo-200 dark:border-indigo-500/30">
              <GraduationCap className="w-8 h-8 text-indigo-600 dark:text-indigo-400 drop-shadow-sm" />
            </div>
            NCERT Library
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium ml-1">
            Official curriculum textbooks · Classes 6–10
          </p>
        </div>
        
        <Link 
          href="/dashboard" 
          className="relative z-10 group flex items-center justify-center gap-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-6 py-3.5 rounded-2xl font-bold transition-all duration-300 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:-translate-y-1"
        >
          <Home className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
          Back to Dashboard
        </Link>
      </header>

      {/* Search */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-indigo-500/50" />
        <input
          type="text"
          placeholder="Search books by name or subject..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-2 border-slate-200/60 dark:border-slate-700/60 rounded-2xl focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300 shadow-sm text-lg font-medium placeholder:text-slate-400"
        />
      </div>

      {/* Class Filter */}
      <div className="flex flex-wrap gap-3">
        {(["all", 6, 7, 8, 9, 10] as const).map(c => (
          <button
            key={c}
            onClick={() => setSelectedClass(c)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
              selectedClass === c
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105 border border-transparent"
                : "bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5"
            }`}
          >
            {c === "all" ? "All Classes" : "Class " + c}
          </button>
        ))}
      </div>

      {/* Subject Filter */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
        {subjects.map(s => (
          <button
            key={s}
            onClick={() => setSelectedSubject(s)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
              selectedSubject === s
                ? "bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-md scale-105"
                : "bg-slate-100/80 dark:bg-slate-800/50 backdrop-blur-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:-translate-y-0.5"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-500">{filtered.length} book{filtered.length !== 1 ? "s" : ""} found</p>

      {/* Book Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((book, i) => {
            const grad = subjectColors[book.subject] || "from-slate-500 to-slate-600";
            return (
              <div key={i} className="group bg-white dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-2 flex flex-col ring-1 ring-white/10 dark:ring-white/5">
                <div className={`bg-gradient-to-br ${grad} h-28 flex items-center justify-center relative overflow-hidden`}>
                  {/* Glassmorphism shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 translate-x-[-100%] group-hover:translate-x-[100%]" />
                  
                  <BookOpen className="w-12 h-12 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500" />
                  <span className="absolute top-3 right-3 bg-black/20 backdrop-blur-md text-white text-xs font-extrabold px-2.5 py-1 rounded-xl border border-white/20 shadow-sm">
                    Class {book.class}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1 relative z-10">
                  <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1.5">{book.subject}</span>
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-base leading-snug mb-5 flex-1">{book.title}</h3>
                  {book.singleFileName || book.directUrl ? (
                    <button
                      onClick={() => { setOpenBook(book); handleOpenChapter({ num: 1, pdfUrl: getSinglePdfUrl(book) }, book); }}
                      className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${grad} text-white text-sm font-bold py-2.5 rounded-xl hover:shadow-md hover:scale-[1.02] transition-all`}
                    >
                      <BookOpen className="w-4 h-4" />
                      Read Book
                    </button>
                  ) : (
                    <button
                      onClick={() => { setOpenBook(book); setOpenChapter(null); }}
                      className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${grad} text-white text-sm font-bold py-2.5 rounded-xl hover:shadow-md hover:scale-[1.02] transition-all`}
                    >
                      <FileText className="w-4 h-4" />
                      View Chapters
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No books found for your selection.</p>
        </div>
      )}

      {/* ── CHAPTER LIST MODAL ── */}
      {openBook && !openChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-slate-950">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-800">
            {/* Header */}
            <div className={`bg-gradient-to-br ${gradient} p-6 shrink-0`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">
                    Class {openBook.class} · {openBook.subject}
                  </p>
                  <h2 className="text-white font-bold text-xl leading-tight">{openBook.title}</h2>
                  <p className="text-white/70 text-sm mt-1">{openBook.chapters} chapters</p>
                </div>
                <button onClick={() => setOpenBook(null)} className="bg-white/20 hover:bg-white/30 text-white rounded-xl p-2 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <a
                href={getFullBookUrl(openBook.code, openBook.chapters)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Open Full Book on NCERT
              </a>
            </div>

            {/* Chapter List */}
            <div className="p-4 overflow-y-auto flex-1">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-3 px-1">
                Click a chapter to read it in-app
              </p>
              <div className="space-y-2">
                {/* Prelims & Syllabus (ps.pdf) - Only for Class 10 */}
                {!(openBook.singleFileName || openBook.directUrl) && openBook.class === 10 && (
                  <button
                    onClick={() => handleOpenChapter({ num: 0, pdfUrl: `https://ncert.nic.in/textbook/pdf/${openBook.code}ps.pdf` }, openBook)}
                    className="flex items-center justify-between w-full px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl transition-all group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                        i
                      </span>
                      <span className="text-indigo-900 dark:text-indigo-200 font-bold text-sm">Prelims &amp; Syllabus</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </button>
                )}

                {/* Chapters List */}
                {Array.from({ length: openBook.chapters }, (_, i) => i + 1).map(ch => {
                  const pdfUrl = getChapterPdfUrl(openBook, ch);
                  const chName = chapterNamesMap[openBook.code]?.[ch - 1];
                  return (
                    <div key={ch} className="flex gap-2">
                      <button
                        onClick={() => handleOpenChapter({ num: ch, pdfUrl }, openBook)}
                        className="flex items-center justify-between flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 rounded-2xl transition-all group text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                            {ch}
                          </span>
                          <span className="text-slate-700 dark:text-slate-200 font-medium text-sm">
                            Chapter {ch}{chName ? `: ${chName}` : ""}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FULLSCREEN PDF VIEWER ── */}
      {openBook && openChapter && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950">

          {/* ── Attractive Loading Overlay ── */}
          <div 
            className={`absolute inset-0 z-[110] flex items-center justify-center bg-slate-950 transition-opacity duration-500 ${
              pdfLoading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-spin" style={{ animationDuration: "20s" }}>
                  <div className={`absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-3xl`} />
                  <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-10 blur-3xl" />
                </div>
              </div>

              {/* Loading content */}
              <div className="relative flex flex-col items-center gap-6">
                {/* Animated book icon with pulse ring */}
                <div className="relative">
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} opacity-20 animate-ping`} style={{ animationDuration: "2s" }} />
                  <div className={`relative w-20 h-20 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-2xl`}>
                    <BookOpen className="w-10 h-10 text-white animate-pulse" />
                  </div>
                </div>

                {/* Book title */}
                <div className="text-center max-w-sm">
                  <h3 className="text-white font-bold text-lg mb-1">{openBook.title}</h3>
                  <p className="text-white/50 text-sm">
                    {openBook.singleFileName || openBook.directUrl ? "Loading book..." : "Loading Chapter " + openChapter.num + "..."}
                  </p>
                </div>

                {/* Animated loading bar */}
                <div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${gradient} animate-loading-bar`}
                    style={{
                      animation: "loading-bar 1.5s ease-in-out infinite",
                    }}
                  />
                </div>

                {/* Skeleton page preview */}
                <div className="mt-4 w-48 bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                  <div className="space-y-2">
                    <div className="h-2 bg-white/10 rounded-full w-3/4 animate-pulse" />
                    <div className="h-2 bg-white/10 rounded-full w-full animate-pulse" style={{ animationDelay: "0.1s" }} />
                    <div className="h-2 bg-white/10 rounded-full w-5/6 animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <div className="h-2 bg-white/10 rounded-full w-2/3 animate-pulse" style={{ animationDelay: "0.3s" }} />
                    <div className="h-8 mt-3" />
                    <div className="h-2 bg-white/10 rounded-full w-full animate-pulse" style={{ animationDelay: "0.4s" }} />
                    <div className="h-2 bg-white/10 rounded-full w-4/5 animate-pulse" style={{ animationDelay: "0.5s" }} />
                    <div className="h-2 bg-white/10 rounded-full w-3/4 animate-pulse" style={{ animationDelay: "0.6s" }} />
                  </div>
                </div>
              </div>
            </div>

          {/* ── Top Bar (Premium Header) ── */}
          <div className="relative z-[105] shrink-0 w-full bg-[#0b0f19] shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-b border-white/5">
            {/* Background with Subject Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-15 mix-blend-screen`} />
            
            <div className="relative flex items-center justify-between px-4 sm:px-6 py-3">
              {/* Back button */}
              <button
                onClick={handleCloseViewer}
                className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-2xl shadow-lg backdrop-blur-md transition-all border border-white/10 hover:border-white/20 hover:scale-105"
              >
                <div className="bg-white/10 rounded-full p-1 group-hover:-translate-x-1 transition-transform">
                  <ArrowLeft className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm tracking-wide pr-1">Back</span>
              </button>

              {/* Book info (Center) */}
              <div className="hidden sm:flex items-center gap-4 bg-white/5 pr-6 pl-2 py-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-inner">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ring-2 ring-white/20`}>
                  <BookOpen className="w-4 h-4 text-white drop-shadow-md" />
                </div>
                <div className="flex flex-col justify-center">
                  <h2 className="text-white text-sm font-extrabold tracking-wide leading-tight drop-shadow-md">
                    {openBook.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${gradient} animate-pulse`} />
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                      {openBook.singleFileName || openBook.directUrl ? "Full Book" : "Chapter " + openChapter.num} <span className="opacity-40 mx-1">•</span> Class {openBook.class}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <a
                  href={getProxyUrl(openChapter.pdfUrl, openBook, openChapter.num)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/90 hover:text-white px-4 py-2 rounded-2xl backdrop-blur-md transition-all border border-white/10 hover:border-white/20 hover:scale-105"
                >
                  <ExternalLink className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span className="hidden sm:inline font-bold text-sm">New Tab</span>
                </a>
                <a
                  href={getProxyUrl(openChapter.pdfUrl, openBook, openChapter.num)}
                  download
                  className={`group flex items-center gap-2 bg-gradient-to-r ${gradient} hover:opacity-90 text-white px-5 py-2 rounded-2xl shadow-xl transition-all hover:scale-105 ring-1 ring-white/20`}
                >
                  <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform drop-shadow-md" />
                  <span className="hidden sm:inline font-bold text-sm drop-shadow-md">Download</span>
                </a>
              </div>
            </div>
          </div>

          {/* ── SPLIT VIEWER CONTAINER ── */}
          <div className="flex-1 w-full flex overflow-hidden relative">
            
            {/* Left Column: PDF Renderer */}
            <div id="pdf-render-container" className={`flex-1 relative bg-slate-900 overflow-auto flex justify-center py-8 transition-all duration-300 ${showSideTheory ? 'w-[55%] md:w-[60%] border-r border-slate-200 dark:border-slate-800' : 'w-full'}`}>
            {pdfLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <span className="text-white/70 font-medium animate-pulse">Loading PDF...</span>
              </div>
            )}
            
            <PdfViewer
              file={getProxyUrl(openChapter.pdfUrl, openBook, openChapter.num)}
              pageNumber={pageNumber}
              pdfScale={pdfScale}
              isDarkMode={isDarkMode}
              isDrawMode={isDrawMode}
              drawColor={effectiveDrawColor}
              drawThickness={drawThickness}
              clearDrawingsSignal={clearDrawingsSignal}
              downloadSignal={downloadSignal}
              captureSignal={captureSignal}
              onCapture={handleCapture}
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
                setPageNumber(1);
                setPdfLoading(false);
              }}
              onTextExtracted={setPageText}
            />
            
            {/* Custom PDF Controls (Floating Bottom) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl shadow-black/50 border border-slate-700 flex items-center gap-4 z-[110]">
              <div className="flex items-center gap-1">
                <button onClick={fetchLineByLine} disabled={lineByLineLoading} className="p-2 rounded-full hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1" title="Generate Side-by-Side Line-by-Line Study Guide (PDF)">
                  {lineByLineLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-450" />}
                  <span className="text-[10px] font-extrabold pr-1 hidden md:inline text-amber-300">NCERT Guide</span>
                </button>
                <div className="w-px h-6 bg-slate-600 mx-1"></div>
                <button onClick={() => fetchTheory()} disabled={theoryLoading} className="p-2 rounded-full hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1" title="Generate Premium NCERT Textbook Draft / Exhaustive Study Guide">
                  {theoryLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4 text-indigo-400" />}
                  <span className="text-[10px] font-extrabold pr-1 hidden md:inline text-indigo-300">Study Guide</span>
                </button>
                <div className="w-px h-6 bg-slate-600 mx-1"></div>
                <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-indigo-500 text-white' : 'hover:bg-slate-700 text-slate-300'}`} title="Dark Mode">
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <div className="w-px h-6 bg-slate-600 mx-1"></div>
                <button onClick={() => setDownloadSignal(s => s + 1)} className="p-2 rounded-full hover:bg-slate-700 text-slate-300 transition-colors" title="Download Page as Image">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={() => setCaptureSignal(s => s + 1)} className="p-2 rounded-full hover:bg-slate-700 text-slate-300 transition-colors" title="Send Page to AI Tutor">
                  <Camera className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-slate-600 mx-1"></div>
                <button onClick={toggleAudioPlayback} className={`p-2 rounded-full transition-colors ${isPlaying ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50 flex gap-2 items-center px-3' : 'hover:bg-slate-700 text-purple-400'}`} title="AI Professor Audiobook">
                  {isPlaying ? (
                    <>
                      <Activity className="w-4 h-4 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-widest hidden md:inline">Playing</span>
                    </>
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <div className="w-px h-6 bg-slate-600 mx-1"></div>
                <div className="flex items-center bg-slate-700/50 rounded-full p-1 border border-slate-600/50">
                  <button onClick={() => setIsDrawMode(!isDrawMode)} className={`p-1.5 rounded-full transition-colors ${isDrawMode ? 'bg-amber-500 text-slate-900 shadow-lg' : 'hover:bg-slate-600 text-slate-300'}`}>
                    <Pen className="w-4 h-4" />
                  </button>
                  {isDrawMode && (
                    <div className="flex items-center gap-1 px-2 animate-in fade-in slide-in-from-left-2 duration-200">
                      {/* Tool Type Selectors */}
                      <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-600">
                        <button onClick={() => setDrawTool('highlighter')} className={`p-1 rounded-md transition-colors ${drawTool === 'highlighter' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`} title="Highlighter">
                          <Highlighter className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDrawTool('pen')} className={`p-1 rounded-md transition-colors ${drawTool === 'pen' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`} title="Solid Pen">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDrawTool('eraser')} className={`p-1 rounded-md transition-colors ${drawTool === 'eraser' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`} title="Eraser">
                          <Eraser className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="w-px h-4 bg-slate-600 mx-1"></div>

                      {/* Color Palette (Disabled if Eraser is active) */}
                      <div className={`flex items-center gap-1 transition-opacity ${drawTool === 'eraser' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                        <button onClick={() => setDrawColorHex("#ffeb3b")} className={`w-4 h-4 rounded-full bg-yellow-400 ${drawColorHex === "#ffeb3b" ? "ring-2 ring-white scale-110" : ""}`} />
                        <button onClick={() => setDrawColorHex("#ef4444")} className={`w-4 h-4 rounded-full bg-red-500 ${drawColorHex === "#ef4444" ? "ring-2 ring-white scale-110" : ""}`} />
                        <button onClick={() => setDrawColorHex("#3b82f6")} className={`w-4 h-4 rounded-full bg-blue-500 ${drawColorHex === "#3b82f6" ? "ring-2 ring-white scale-110" : ""}`} />
                        <button onClick={() => setDrawColorHex("#22c55e")} className={`w-4 h-4 rounded-full bg-green-500 ${drawColorHex === "#22c55e" ? "ring-2 ring-white scale-110" : ""}`} />
                        <button onClick={() => setDrawColorHex("#a855f7")} className={`w-4 h-4 rounded-full bg-purple-500 ${drawColorHex === "#a855f7" ? "ring-2 ring-white scale-110" : ""}`} />
                        <div className="relative w-5 h-5 rounded-full overflow-hidden border border-slate-500 hover:scale-110 transition-transform ml-1">
                          <input 
                            type="color" 
                            value={drawColorHex} 
                            onChange={(e) => setDrawColorHex(e.target.value)}
                            className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer opacity-0"
                            title="Custom Color"
                          />
                          <div 
                            className="w-full h-full pointer-events-none" 
                            style={{ background: drawColorHex }}
                          />
                        </div>
                      </div>

                      <div className="w-px h-4 bg-slate-600 mx-1"></div>
                      
                      {/* Thickness */}
                      <input 
                        type="range" min="2" max="40" value={drawThickness} onChange={(e) => setDrawThickness(parseInt(e.target.value))}
                        className="w-16 h-1 bg-slate-500 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                        title="Size"
                      />

                      {/* Clear Button */}
                      <button 
                        onClick={() => setClearDrawingsSignal(s => s + 1)} 
                        className="p-1 ml-1 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-md transition-colors"
                        title="Clear Page"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-px h-6 bg-slate-600"></div>
              <div className="flex items-center gap-1">
                <button onClick={() => setPdfScale(s => Math.max(0.5, s - 0.2))} className="p-2 hover:bg-slate-700 rounded-full text-slate-300 transition-colors">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold w-12 text-center text-slate-300">{Math.round(pdfScale * 100)}%</span>
                <button onClick={() => setPdfScale(s => Math.min(3, s + 0.2))} className="p-2 hover:bg-slate-700 rounded-full text-slate-300 transition-colors">
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
              <div className="w-px h-6 bg-slate-600"></div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1} className="p-2 hover:bg-slate-700 rounded-full disabled:opacity-30 text-slate-300 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-300 w-16 text-center tracking-widest">
                  {pageNumber} / {numPages}
                </span>
                <button onClick={() => setPageNumber(p => Math.min(numPages, p + 1))} disabled={pageNumber >= numPages} className="p-2 hover:bg-slate-700 rounded-full disabled:opacity-30 text-slate-300 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* AI Tutor Floating Button */}
            <button 
              onClick={() => setIsAiChatOpen(!isAiChatOpen)}
              className="absolute bottom-6 right-6 z-[120] w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-2xl shadow-indigo-500/50 flex items-center justify-center hover:scale-110 transition-transform ring-4 ring-white/10"
            >
              {isAiChatOpen ? <X className="w-6 h-6 text-white" /> : <Brain className="w-6 h-6 text-white" />}
              {/* Ping indicator */}
              {!isAiChatOpen && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-slate-900"></span>
                </span>
              )}
            </button>

            {/* AI Tutor Chat Popover */}
            {isAiChatOpen && winState.x !== -1 && (
              <div 
                className="fixed z-[120] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-black/50 border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-200"
                style={{ left: winState.x, top: winState.y, width: winState.w, height: winState.h }}
              >
                {/* 8 Invisible Resize Handles */}
                <div className="absolute top-0 left-0 w-full h-3 cursor-ns-resize z-50" onPointerDown={(e) => handleInteractStart(e, 'resize', 'n')} />
                <div className="absolute bottom-0 left-0 w-full h-3 cursor-ns-resize z-50" onPointerDown={(e) => handleInteractStart(e, 'resize', 's')} />
                <div className="absolute top-0 left-0 w-3 h-full cursor-ew-resize z-50" onPointerDown={(e) => handleInteractStart(e, 'resize', 'w')} />
                <div className="absolute top-0 right-0 w-3 h-full cursor-ew-resize z-50" onPointerDown={(e) => handleInteractStart(e, 'resize', 'e')} />
                <div className="absolute top-0 left-0 w-6 h-6 cursor-nwse-resize z-50" onPointerDown={(e) => handleInteractStart(e, 'resize', 'nw')} />
                <div className="absolute top-0 right-0 w-6 h-6 cursor-nesw-resize z-50" onPointerDown={(e) => handleInteractStart(e, 'resize', 'ne')} />
                <div className="absolute bottom-0 left-0 w-6 h-6 cursor-nesw-resize z-50" onPointerDown={(e) => handleInteractStart(e, 'resize', 'sw')} />
                <div className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-50" onPointerDown={(e) => handleInteractStart(e, 'resize', 'se')} />

                {/* Header (Drag Handle) */}
                <div 
                  onPointerDown={(e) => handleInteractStart(e, 'drag')}
                  className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 flex justify-between items-center text-white shrink-0 rounded-t-3xl cursor-move touch-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold block text-sm leading-none mb-1">AI Tutor</span>
                      <span className="text-[10px] text-white/80 font-bold tracking-wider uppercase">Chapter Assistant</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setIsAiChatOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        msg.role === "assistant" ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400" : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                      }`}>
                        {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      <div className={`p-3 rounded-2xl max-w-[80%] text-sm shadow-sm ${
                        msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-200 dark:shadow-indigo-900/20" : "bg-white dark:bg-slate-800 rounded-tl-none border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}>
                        <p className="whitespace-pre-wrap leading-relaxed">
                          {msg.content.split('\n').map((line: string, i: number) => {
                            const parts = line.split(/(\*\*.*?\*\*)/g);
                            return (
                              <span key={i}>
                                {parts.map((part, j) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>;
                                  }
                                  const subParts = part.split(/(\*.*?\*)/g);
                                  return subParts.map((sp, k) => {
                                    if (sp.startsWith('*') && sp.endsWith('*') && sp.length > 2) {
                                      return <em key={k} className="italic">{sp.slice(1, -1)}</em>;
                                    }
                                    return sp;
                                  });
                                })}
                                <br />
                              </span>
                            );
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 rounded-tl-none border border-slate-200 dark:border-slate-700 flex gap-1.5 items-center">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 flex flex-col gap-2">
                  {chatAttachments.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {chatAttachments.map((att, i) => (
                        <div key={i} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                          <img src={att.data} alt={att.name} className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => setChatAttachments(prev => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleScreenshot}
                      className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Take a screenshot to ask about it"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                    <form onSubmit={handleChatSubmit} className="relative flex-1">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onPaste={handlePaste}
                        placeholder="Ask or paste an image (Ctrl+V)..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-200 placeholder:text-slate-400"
                      />
                      <button
                        type="submit"
                        disabled={chatLoading || (!chatInput.trim() && chatAttachments.length === 0)}
                        className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square bg-indigo-600 text-white flex items-center justify-center rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50"
                      >
                        <Send className="w-4 h-4 ml-0.5" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>

          {showSideTheory && (
            <div className="w-[45%] md:w-[40%] bg-[#0b0f19] border-l border-white/10 flex flex-col h-full overflow-hidden text-white animate-in slide-in-from-right duration-300 relative z-20">
              {/* Tab switcher */}
              <div className="flex border-b border-white/10 bg-[#0f172a] shrink-0 p-2 gap-2">
                <button 
                  onClick={() => setSidebarTab('guide')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all",
                    sidebarTab === 'guide' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <BookOpen className="w-4 h-4" />
                  Study Guide
                </button>
                <button 
                  onClick={() => setSidebarTab('mindmap')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all",
                    sidebarTab === 'mindmap' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <Brain className="w-4 h-4" />
                  Concept Map
                </button>
                <button 
                  onClick={() => setShowSideTheory(false)}
                  className="p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-6 bg-[#090d16] scroll-container">
                {sidebarTab === 'guide' ? (
                  <div className="space-y-4">
                    {theoryLoading ? (
                      <div className="py-20 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider animate-pulse">Drafting study guide...</span>
                      </div>
                    ) : theory ? (
                      <div 
                        className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatMarkdown(theory) }}
                      />
                    ) : (
                      <div className="text-center py-20 text-slate-500">
                        <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <p className="text-sm font-medium">Failed to load study guide. Try clicking the "Study Guide" button again.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Mind-Map View */
                  <div className="space-y-6">
                    <div className="bg-indigo-950/20 border border-indigo-900/50 p-4 rounded-2xl">
                      <p className="text-xs text-indigo-300 font-bold leading-normal m-0">
                        🕸 <strong>Interactive SVG Concept Map</strong>: Hover over nodes to see core definitions, high-yield chemistry reaction formulas, and CBSE board tips!
                      </p>
                    </div>

                    {/* SVG Mind-Map canvas */}
                    {(() => {
                      const chapterTitle = chapterNamesMap[openBook.code]?.[openChapter.num - 1] || openBook.title;
                      const mapNodes = MIND_MAPS[chapterTitle] || MIND_MAPS["Chemical Reactions"];
                      if (!mapNodes) {
                        return (
                          <div className="text-center py-20 text-slate-555">
                            <Brain className="w-10 h-10 text-slate-700 mx-auto mb-3 animate-pulse" />
                            <p className="text-xs">No Concept Map available for this chapter.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="flex flex-col gap-5">
                          {/* SVG Render box */}
                          <div className="bg-[#0f172a]/80 border border-white/5 rounded-3xl p-4 overflow-hidden relative group/canvas shadow-inner">
                            <svg viewBox="0 0 400 320" className="w-full h-auto">
                              {/* Define neon glow filters */}
                              <defs>
                                <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                                  <feGaussianBlur stdDeviation="3" result="blur" />
                                  <feMerge>
                                    <feMergeNode in="blur" />
                                    <feMergeNode in="SourceGraphic" />
                                  </feMerge>
                                </filter>
                              </defs>

                              {/* Draw connecting lines first */}
                              {mapNodes.map((node) => {
                                if (node.id === 'root') return null;
                                
                                let parentNode = mapNodes.find(n => n.id === 'root');
                                if (node.type === 'leaf') {
                                  if (node.id === 'comb' || node.id === 'decomp') {
                                    parentNode = mapNodes.find(n => n.id === 'types');
                                  } else if (node.id === 'corrosion' || node.id === 'rancidity') {
                                    parentNode = mapNodes.find(n => n.id === 'effects');
                                  } else if (node.id === 'exo' || node.id === 'endo') {
                                    parentNode = mapNodes.find(n => n.id === 'energy');
                                  }
                                }

                                if (!parentNode) return null;

                                return (
                                  <g key={`link-${node.id}`}>
                                    {/* Outer glowing path */}
                                    <line 
                                      x1={parentNode.x} y1={parentNode.y} 
                                      x2={node.x} y2={node.y} 
                                      stroke={node.type === 'leaf' ? '#10b981' : '#6366f1'} 
                                      strokeWidth="3" 
                                      strokeOpacity="0.25"
                                      filter="url(#neon-glow)"
                                    />
                                    {/* Inner clean path */}
                                    <line 
                                      x1={parentNode.x} y1={parentNode.y} 
                                      x2={node.x} y2={node.y} 
                                      stroke={node.type === 'leaf' ? '#059669' : '#4f46e5'} 
                                      strokeWidth="1.5" 
                                      strokeDasharray={node.type === 'leaf' ? "3,3" : "none"}
                                    />
                                  </g>
                                );
                              })}

                              {/* Draw interactive Nodes */}
                              {mapNodes.map((node) => {
                                const isSelected = selectedNode?.id === node.id;
                                let circleColor = "fill-indigo-600 stroke-indigo-400";
                                let size = 18;
                                if (node.type === 'branch') {
                                  circleColor = "fill-amber-600 stroke-amber-400";
                                  size = 14;
                                } else if (node.type === 'leaf') {
                                  circleColor = "fill-emerald-600 stroke-emerald-400";
                                  size = 11;
                                }

                                return (
                                  <g 
                                    key={`node-${node.id}`}
                                    transform={`translate(${node.x}, ${node.y})`}
                                    className="cursor-pointer"
                                    onMouseEnter={() => setSelectedNode(node)}
                                    onClick={() => setSelectedNode(node)}
                                  >
                                    <circle 
                                      r={size + 5} 
                                      className={`fill-white/0 stroke-white/0 transition-all ${isSelected ? 'stroke-indigo-500/30 fill-indigo-500/10' : 'group-hover/canvas:stroke-white/5'}`}
                                    />
                                    <circle 
                                      r={size} 
                                      className={`${circleColor} stroke-2 transition-all duration-300 ${isSelected ? 'scale-110 filter drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]' : ''}`}
                                    />
                                    <text 
                                      y={node.type === 'root' ? 0 : node.y > 160 ? size + 14 : -size - 6}
                                      textAnchor="middle" 
                                      dominantBaseline={node.type === 'root' ? 'middle' : 'auto'}
                                      className={`font-sans font-bold text-[9px] select-none pointer-events-none fill-slate-200 ${node.type === 'root' ? 'text-[10px] fill-white' : ''}`}
                                    >
                                      {node.label}
                                    </text>
                                  </g>
                                );
                              })}
                            </svg>
                          </div>

                          {/* Highlight details box of hovered node */}
                          <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-5 shadow-xl transition-all duration-300">
                            {selectedNode ? (
                              <div className="space-y-3.5">
                                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                  <div className="flex items-center gap-2">
                                    <span className={cn(
                                      "w-2.5 h-2.5 rounded-full",
                                      selectedNode.type === 'root' ? 'bg-indigo-500' : selectedNode.type === 'branch' ? 'bg-amber-500' : 'bg-emerald-500'
                                    )} />
                                    <h4 className="font-extrabold text-sm text-white">{selectedNode.label}</h4>
                                  </div>
                                  <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                                    {selectedNode.type}
                                  </span>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Concept Definition</span>
                                    <p className="text-xs text-slate-300 leading-relaxed font-semibold">{selectedNode.definition}</p>
                                  </div>

                                  {selectedNode.equation && (
                                    <div>
                                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest block mb-1">🔑 High-Yield Equation</span>
                                      <div className="bg-[#0b0f19] p-3 rounded-2xl border border-white/5 text-center text-xs font-mono font-bold text-emerald-400">
                                        <span dangerouslySetInnerHTML={{
                                          __html: selectedNode.equation
                                            .replace(/~([^~]+)~/g, "$1")
                                            .replace(/_([a-zA-Z0-9\+\-]+)/g, '<sub>$1</sub>')
                                            .replace(/\^([a-zA-Z0-9\+\-]+)/g, '<sup>$1</sup>')
                                        }} />
                                      </div>
                                    </div>
                                  )}

                                  {selectedNode.tip && (
                                    <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-2xl">
                                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block mb-1 flex items-center gap-1">
                                        <Trophy className="w-3.5 h-3.5" /> Board Evaluator Tip
                                      </span>
                                      <p className="text-xs text-amber-400 font-semibold m-0 leading-normal">{selectedNode.tip}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-10 text-slate-500">
                                <Brain className="w-10 h-10 text-slate-800 mx-auto mb-3 animate-pulse" />
                                <p className="text-xs">Hover/tap any node to unpack key definitions, reaction equations, and board exam tips!</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

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
                <h3 className="text-xl font-bold text-white mt-1 leading-none">{openBook ? openBook.title : "NCERT"} — Line-by-Line Breakdown</h3>
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
                <p className="text-xs text-indigo-800 dark:text-indigo-300 font-bold leading-relaxed m-0 font-sans">
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
                        <blockquote className="m-0 text-sm font-bold text-slate-800 dark:text-slate-250 italic leading-relaxed border-l-4 border-amber-500 pl-4 font-serif">
                          "{line.original}"
                        </blockquote>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-4 block opacity-50">
                        Official Curriculum Quote
                      </span>
                    </div>

                    {/* Right Column: Deep Explanation & Tips */}
                    <div className="p-6 space-y-4 font-sans text-slate-700 dark:text-slate-300">
                      {/* Conceptual Explanation */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 tracking-widest uppercase flex items-center gap-1">
                          <Brain className="w-3.5 h-3.5" /> Conceptual Explanation
                        </span>
                        <p className="text-xs font-semibold leading-relaxed">
                          {line.explanation}
                        </p>
                      </div>

                      {/* Evaluator Callout / Board Tip */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-amber-500 tracking-widest uppercase flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5" /> CBSE Evaluator Tip
                        </span>
                        <p className="text-xs font-bold bg-amber-500/5 p-3 rounded-xl border border-amber-555/10 leading-normal">
                          {line.boardTip}
                        </p>
                      </div>

                      {/* Misconception */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-rose-500 tracking-widest uppercase flex items-center gap-1">
                          ❌ Common Student Misconception
                        </span>
                        <p className="text-xs font-semibold bg-rose-500/5 p-3 rounded-xl border border-rose-500/10 leading-normal text-rose-600 dark:text-rose-455">
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

      {cropImageSrc && (
        <CropOverlay 
          imageSrc={cropImageSrc} 
          onClose={() => setCropImageSrc(null)} 
          onCrop={(croppedDataUrl) => {
            setChatAttachments(prev => [...prev, { type: "image/jpeg", data: croppedDataUrl, name: "Cropped Screenshot" }]);
            setCropImageSrc(null);
          }}
        />
      )}

      {/* Loading bar animation */}
      <style jsx>{`
        @keyframes loading-bar {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}

function CropOverlay({ imageSrc, onClose, onCrop }: { imageSrc: string, onClose: () => void, onCrop: (data: string) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [endPos, setEndPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setEndPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setEndPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Calculate bounding box
    const x = Math.min(startPos.x, endPos.x);
    const y = Math.min(startPos.y, endPos.y);
    const width = Math.abs(startPos.x - endPos.x);
    const height = Math.abs(startPos.y - endPos.y);
    
    if (width < 20 || height < 20) {
      // Too small to crop
      setStartPos({ x: 0, y: 0 });
      setEndPos({ x: 0, y: 0 });
      return;
    }

    if (imgRef.current) {
      const img = imgRef.current;
      const rect = img.getBoundingClientRect();
      
      // Calculate crop relative to natural image dimensions
      const scaleX = img.naturalWidth / rect.width;
      const scaleY = img.naturalHeight / rect.height;
      
      const cropX = (x - rect.left) * scaleX;
      const cropY = (y - rect.top) * scaleY;
      const cropW = width * scaleX;
      const cropH = height * scaleY;
      
      // Downscale image to prevent API Token Quota Exceeded (max dimension 800px)
      const maxDim = 800;
      let finalW = cropW;
      let finalH = cropH;
      if (finalW > maxDim || finalH > maxDim) {
        if (finalW > finalH) {
          finalH = (finalH / finalW) * maxDim;
          finalW = maxDim;
        } else {
          finalW = (finalW / finalH) * maxDim;
          finalH = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = finalW;
      canvas.height = finalH;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw the cropped area from the original image directly onto the scaled down canvas
        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, finalW, finalH);
        onCrop(canvas.toDataURL("image/jpeg", 0.8)); // Use JPEG with 80% quality to further reduce base64 size
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 flex flex-col items-center justify-center select-none"
         onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="absolute top-4 right-4 flex gap-4 z-[210]">
        <button onClick={onClose} className="px-6 py-2 bg-slate-800 text-white rounded-full font-semibold hover:bg-slate-700 shadow-xl border border-white/20 flex items-center gap-2">
          <X className="w-5 h-5" /> Cancel
        </button>
      </div>
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full font-bold shadow-xl border border-white/20 flex items-center gap-2 z-[210] pointer-events-none">
        <Crop className="w-5 h-5" /> Draw a box to crop
      </div>

      <img ref={imgRef} src={imageSrc} draggable={false} alt="Screenshot for cropping" className="max-w-full max-h-full object-contain pointer-events-none" />
      
      {startPos.x !== 0 && startPos.y !== 0 && (
        <div className="fixed border-2 border-indigo-500 bg-indigo-500/20 pointer-events-none" style={{
          left: Math.min(startPos.x, endPos.x),
          top: Math.min(startPos.y, endPos.y),
          width: Math.abs(startPos.x - endPos.x),
          height: Math.abs(startPos.y - endPos.y),
        }} />
      )}
    </div>
  );
}
