"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, X, RotateCcw, Award, Volume2, Loader2, Keyboard, Sparkles } from "lucide-react";
import { FlashcardDeck, getDeck, saveDeck, Flashcard, calculateSM2 } from "@/lib/flashcards";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";

const getLeitnerBox = (card: Flashcard): number => {
  if (!card.interval) return 1;
  if (card.interval <= 1) return 1;
  if (card.interval <= 3) return 2;
  if (card.interval <= 7) return 3;
  if (card.interval <= 14) return 4;
  return 5;
};

const getBoxConfig = (box: number) => {
  switch(box) {
    case 5: return { label: "Box 5: Mastered ⭐", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
    case 4: return { label: "Box 4: Spaced Review", color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" };
    case 3: return { label: "Box 3: Mid Spacing", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
    case 2: return { label: "Box 2: Short Spacing", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" };
    default: return { label: "Box 1: Daily Review ⏱", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" };
  }
};

const formatBionicText = (text: string) => {
  if (!text) return "";
  return text.split(" ").map((word, i) => {
    if (word.length <= 1) return <span key={i}>{word} </span>;
    const mid = Math.ceil(word.length * 0.5);
    const boldPart = word.substring(0, mid);
    const rest = word.substring(mid);
    return (
      <span key={i}>
        <strong className="bionic-bold">{boldPart}</strong>{rest}{" "}
      </span>
    );
  });
};

export default function FlashcardPlayer({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([]);
  const [dueOnly, setDueOnly] = useState(false);
  const { bionicMode } = useAccessibilityStore();
  
  // Player state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  const isFlippedRef = useRef(isFlipped);
  isFlippedRef.current = isFlipped;

  // Audio playback
  const playAudio = useCallback(async (e?: React.MouseEvent, text?: string) => {
    if (e) e.stopPropagation(); 
    if (isPlayingAudio || !deck || sessionCards.length === 0) return;
    
    const card = sessionCards[currentIndex];
    const textToRead = text || (isFlippedRef.current ? card.back : card.front);
    if (!textToRead) return;

    setIsPlayingAudio(true);
    
    // 1. Web Speech Synthesis direct fallback for speed & offline resilience
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToRead.replace(/[*_~`#[\]]/g, ""));
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      const prefVoice = voices.find(v => v.lang.startsWith("en"));
      if (prefVoice) utterance.voice = prefVoice;

      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
      return;
    }

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToRead })
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => setIsPlayingAudio(false);
        audio.play().catch(() => setIsPlayingAudio(false));
      } else {
        setIsPlayingAudio(false);
      }
    } catch(err) {
      console.error(err);
      setIsPlayingAudio(false);
    }
  }, [isPlayingAudio, deck, currentIndex, sessionCards]);

  useEffect(() => {
    const loaded = getDeck(params.id);
    if (loaded) {
      const updated = { ...loaded, lastStudied: Date.now() };
      saveDeck(updated);
      setDeck(updated);
    }
  }, [params.id]);

  useEffect(() => {
    if (deck) {
      let cards = [...deck.cards];
      const now = Date.now();
      if (dueOnly) {
        cards = cards.filter(c => !c.nextReviewDate || c.nextReviewDate <= now);
      }
      
      cards.sort((a, b) => {
        const aDue = !a.nextReviewDate || a.nextReviewDate <= now;
        const bDue = !b.nextReviewDate || b.nextReviewDate <= now;
        if (aDue && !bDue) return -1;
        if (!aDue && bDue) return 1;
        return (a.nextReviewDate || 0) - (b.nextReviewDate || 0);
      });

      setSessionCards(cards);
      if (cards.length === 0 && deck.cards.length > 0) {
        setSessionCompleted(true);
      }
    }
  }, [deck, dueOnly]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleAnswer = useCallback((status: "mastered" | "learning") => {
    if (!deck || sessionCards.length === 0) return;
    const currentSessionCard = sessionCards[currentIndex];
    if (!currentSessionCard) return;

    const originalCardIndex = deck.cards.findIndex(c => c.id === currentSessionCard.id);
    if (originalCardIndex === -1) return;
    const currentCard = deck.cards[originalCardIndex];

    const quality = status === "mastered" ? 4 : 1;
    const sm2Result = calculateSM2(
      quality, 
      currentCard.easeFactor, 
      currentCard.interval, 
      currentCard.repetition
    );

    const nextReviewDate = Date.now() + (sm2Result.interval * 24 * 60 * 60 * 1000);
    const newBox = getLeitnerBox({ ...currentCard, interval: sm2Result.interval });
    const currentBox = getLeitnerBox(currentCard);

    let earnedXp = 0;
    if (status === "mastered") {
      earnedXp = 15;
      if (newBox === 5 && currentBox < 5) {
        earnedXp = 100;
      }
    }

    try {
      if (earnedXp > 0) {
        const storedXp = localStorage.getItem("edutrack_xp") || "0";
        const storedLvl = localStorage.getItem("edutrack_level") || "1";
        
        let newXp = parseInt(storedXp, 10) + earnedXp;
        let lvl = parseInt(storedLvl, 10);
        let nextLvlThreshold = lvl * 200;
        
        while (newXp >= nextLvlThreshold) {
          newXp -= nextLvlThreshold;
          lvl += 1;
          nextLvlThreshold = lvl * 200;
        }
        
        localStorage.setItem("edutrack_xp", newXp.toString());
        localStorage.setItem("edutrack_level", lvl.toString());

        const storedMissions = localStorage.getItem("edutrack_daily_missions");
        if (storedMissions) {
          try {
            const parsed = JSON.parse(storedMissions);
            const updatedMissions = parsed.map((m: any) => m.id === "flashcards" ? { ...m, completed: true } : m);
            localStorage.setItem("edutrack_daily_missions", JSON.stringify(updatedMissions));
          } catch {}
        }
      }
    } catch (err) {}

    const updatedCards = [...deck.cards];
    updatedCards[originalCardIndex] = {
      ...currentCard,
      status: sm2Result.interval > 14 ? "mastered" : "learning",
      lastReviewed: Date.now(),
      interval: sm2Result.interval,
      repetition: sm2Result.repetition,
      easeFactor: sm2Result.easeFactor,
      nextReviewDate: nextReviewDate
    };
    
    const updatedDeck = { ...deck, cards: updatedCards };
    saveDeck(updatedDeck);
    
    // We update the local deck, which will re-trigger the useEffect and rebuild sessionCards if dueOnly changed, 
    // but we can just let it rebuild or manage currentIndex. Wait, if it rebuilds sessionCards, currentIndex might be out of sync.
    // It's better to NOT trigger a sessionCard rebuild on every answer if dueOnly is active, unless we want the answered cards to disappear.
    // Usually it's fine. If we don't want it to rebuild and lose place, we should only setDeck without setting sessionCards.
    setDeck(updatedDeck);

    if (currentIndex < sessionCards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    } else {
      setSessionCompleted(true);
      import("@/store/useGamificationStore").then(mod => {
        mod.useGamificationStore.getState().recordStudySession();
      });
    }
  }, [deck, currentIndex, sessionCards]);

  // Expose current card context to EduTrack Voice Assistant & Window
  useEffect(() => {
    if (typeof window !== "undefined" && deck && deck.cards[currentIndex]) {
      const card = deck.cards[currentIndex];
      (window as any).__edutrack_active_context = {
        type: "flashcard",
        deckTitle: deck.title,
        cardIndex: currentIndex + 1,
        totalCards: deck.cards.length,
        question: card.front,
        answer: card.back,
        isFlipped: isFlipped
      };
    }
  }, [deck, currentIndex, isFlipped]);

  // Global Keyboard & Switch Accessibility Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if inside an input or textarea
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === "Space" || e.key === " " || e.key === "Enter" || e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        handleFlip();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleAnswer("mastered");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleAnswer("learning");
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        playAudio();
      } else if (e.key === "Escape") {
        router.push("/flashcards");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFlip, handleAnswer, playAudio, router]);

  // Custom Voice Assistant Event Listeners
  useEffect(() => {
    const onFlip = () => handleFlip();
    const onMaster = () => handleAnswer("mastered");
    const onLearning = () => handleAnswer("learning");
    const onRead = () => playAudio();

    window.addEventListener("edutrack_action_flip_card", onFlip);
    window.addEventListener("edutrack_action_master_card", onMaster);
    window.addEventListener("edutrack_action_learning_card", onLearning);
    window.addEventListener("edutrack_action_read_card", onRead);

    return () => {
      window.removeEventListener("edutrack_action_flip_card", onFlip);
      window.removeEventListener("edutrack_action_master_card", onMaster);
      window.removeEventListener("edutrack_action_learning_card", onLearning);
      window.removeEventListener("edutrack_action_read_card", onRead);
    };
  }, [handleFlip, handleAnswer, playAudio]);

  const restart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
    // The useEffect will re-evaluate sessionCards based on dueOnly
  };

  if (!deck) return null;

  const currentCard = sessionCards[currentIndex] || deck.cards[0];
  const progress = sessionCards.length > 0 ? ((currentIndex) / sessionCards.length) * 100 : 100;

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col select-none">
      {/* Header */}
      <header className="px-6 py-4 flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md gap-4">
        <button 
          onClick={() => router.push("/flashcards")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-bold transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Exit
          <span className="hidden sm:inline text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 rounded text-slate-500">Esc</span>
        </button>
        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm sm:text-base flex items-center gap-2">
          {deck.title}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-600 dark:text-slate-300">
            <input 
              type="checkbox" 
              className="accent-indigo-500 w-4 h-4"
              checked={dueOnly} 
              onChange={(e) => {
                setDueOnly(e.target.checked);
                setCurrentIndex(0);
                setIsFlipped(false);
                setSessionCompleted(false);
              }} 
            />
            Due Only
          </label>
          <div className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/20 px-3 py-1 rounded-full">
            Card {Math.min(currentIndex + 1, sessionCards.length)} of {sessionCards.length}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-300 shadow-sm"
          style={{ width: `${sessionCompleted ? 100 : progress}%` }}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative">
        <AnimatePresence mode="wait">
          {!sessionCompleted && sessionCards.length > 0 ? (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-xl aspect-[4/3] perspective-1000 relative"
            >


              <motion.div
                className="w-full h-full relative preserve-3d cursor-pointer"
                onClick={handleFlip}
                drag={isFlipped ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                onDragEnd={(e, info) => {
                  if (info.offset.x > 100) {
                    handleAnswer("mastered");
                  } else if (info.offset.x < -100) {
                    handleAnswer("learning");
                  }
                }}
                whileDrag={{ scale: 1.05, rotateZ: isFlipped ? 2 : 0 }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-8 text-center pointer-events-none">
                  <span className="absolute top-6 left-6 text-xs font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    Question
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border normal-case tracking-normal ${
                      getBoxConfig(getLeitnerBox(currentCard)).color
                    }`}>
                      {getBoxConfig(getLeitnerBox(currentCard)).label}
                    </span>
                  </span>
                  
                  <button 
                    onClick={(e) => playAudio(e, currentCard.front)}
                    disabled={isPlayingAudio}
                    title="Read Question Aloud (Press R)"
                    className="absolute top-6 right-6 p-2.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-indigo-600 transition-colors pointer-events-auto shadow-sm"
                  >
                    {isPlayingAudio ? <Loader2 className="w-5 h-5 animate-spin text-indigo-500" /> : <Volume2 className="w-5 h-5" />}
                  </button>

                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white leading-relaxed">
                    {bionicMode ? formatBionicText(currentCard.front) : currentCard.front}
                  </h2>

                  <div className="absolute bottom-6 flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 animate-pulse">
                    <span>Tap or press</span>
                    <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-indigo-600 dark:text-indigo-400 font-mono font-black">
                      Space
                    </kbd>
                    <span>to flip</span>
                  </div>
                </div>

                {/* Back */}
                <div 
                  className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-50 to-fuchsia-50 dark:from-indigo-900/20 dark:to-fuchsia-900/20 rounded-3xl shadow-2xl border border-fuchsia-200 dark:border-fuchsia-800 flex flex-col items-center justify-center p-8 text-center pointer-events-none"
                  style={{ transform: "rotateY(180deg)" }}
                >
                  <span className="absolute top-6 left-6 text-xs font-extrabold uppercase tracking-widest text-fuchsia-500 flex items-center gap-2">
                    Answer
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border normal-case tracking-normal ${
                      getBoxConfig(getLeitnerBox(currentCard)).color
                    }`}>
                      {getBoxConfig(getLeitnerBox(currentCard)).label}
                    </span>
                  </span>
                  
                  <button 
                    onClick={(e) => playAudio(e, currentCard.back)}
                    disabled={isPlayingAudio}
                    title="Read Answer Aloud (Press R)"
                    className="absolute top-6 right-6 p-2.5 rounded-full bg-white/60 dark:bg-slate-900/60 text-fuchsia-600 hover:text-indigo-600 transition-colors backdrop-blur-sm pointer-events-auto shadow-sm"
                  >
                    {isPlayingAudio ? <Loader2 className="w-5 h-5 animate-spin text-fuchsia-500" /> : <Volume2 className="w-5 h-5" />}
                  </button>

                  <h2 className="text-xl md:text-2xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed max-w-lg">
                    {bionicMode ? formatBionicText(currentCard.back) : currentCard.back}
                  </h2>

                  <div className="absolute bottom-6 flex items-center gap-2 text-xs font-bold text-fuchsia-500">
                    <span>Swipe or use</span>
                    <kbd className="px-1.5 py-0.5 bg-white/80 dark:bg-black/40 border border-fuchsia-300 rounded font-mono font-black text-rose-500">←</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white/80 dark:bg-black/40 border border-fuchsia-300 rounded font-mono font-black text-emerald-500">→</kbd>
                    <span>keys</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-800 p-8 sm:p-12 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 text-center max-w-md w-full"
            >
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                <Award className="w-10 h-10" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 text-slate-900 dark:text-white">Session Complete!</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium text-sm">
                You've reviewed all {sessionCards.length} {dueOnly ? "due cards" : "cards"} in this session.
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={restart}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold py-3 rounded-xl transition-colors text-sm"
                >
                  <RotateCcw className="w-4 h-4" /> Review Again
                </button>
                <button 
                  onClick={() => router.push("/flashcards")}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 font-bold py-3 rounded-xl transition-colors shadow-md text-sm"
                >
                  Back to Flashcards Hub
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Controls */}
      <AnimatePresence>
        {!sessionCompleted && sessionCards.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md"
          >
            <div className="flex items-center gap-3 w-full max-w-md justify-center">
              <button 
                onClick={() => handleAnswer("learning")}
                title="Needs Review (Press Left Arrow)"
                className="flex-1 py-3 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold rounded-2xl border border-rose-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm text-xs sm:text-sm"
              >
                <X className="w-4 h-4" /> 
                Still Learning
                <kbd className="hidden sm:inline text-[10px] bg-rose-100 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-300/60">←</kbd>
              </button>

              <button 
                onClick={handleFlip}
                className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl border border-slate-300 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5 active:scale-95 text-xs sm:text-sm"
              >
                <RotateCcw className="w-4 h-4 text-indigo-500" />
                Flip
                <kbd className="hidden sm:inline text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono">Space</kbd>
              </button>

              <button 
                onClick={() => handleAnswer("mastered")}
                title="Mastered (Press Right Arrow)"
                className="flex-1 py-3 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-2xl border border-emerald-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm text-xs sm:text-sm"
              >
                <Check className="w-4 h-4" /> 
                Got It
                <kbd className="hidden sm:inline text-[10px] bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-300/60">→</kbd>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
