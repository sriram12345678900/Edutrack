"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, X, RotateCcw, Award, Volume2, Loader2, Sparkles, Flame, ShieldAlert, CheckCircle2, ChevronRight, Zap } from "lucide-react";
import { FlashcardDeck, getDeck, saveDeck, Flashcard, calculateSM2 } from "@/lib/flashcards";
import { useAccessibilityStore } from "@/store/useAccessibilityStore";
import Confetti from "@/components/Confetti";

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
  const [showConfetti, setShowConfetti] = useState(false);
  const [earnedXpTotal, setEarnedXpTotal] = useState(0);
  
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

  const handleAnswerQuality = useCallback((qualityRating: number) => {
    if (!deck || sessionCards.length === 0) return;
    const currentSessionCard = sessionCards[currentIndex];
    if (!currentSessionCard) return;

    const originalCardIndex = deck.cards.findIndex(c => c.id === currentSessionCard.id);
    if (originalCardIndex === -1) return;
    const currentCard = deck.cards[originalCardIndex];

    const sm2Result = calculateSM2(
      qualityRating, 
      currentCard.easeFactor, 
      currentCard.interval, 
      currentCard.repetition
    );

    const nextReviewDate = Date.now() + (sm2Result.interval * 24 * 60 * 60 * 1000);
    const newBox = getLeitnerBox({ ...currentCard, interval: sm2Result.interval });
    const currentBox = getLeitnerBox(currentCard);

    let earnedXp = 0;
    if (qualityRating >= 3) {
      earnedXp = 15;
      if (qualityRating === 5) earnedXp += 10;
      if (newBox === 5 && currentBox < 5) {
        earnedXp += 100;
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }

    if (earnedXp > 0) {
      setEarnedXpTotal(prev => prev + earnedXp);
      try {
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
      } catch (err) {}
    }

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
    setDeck(updatedDeck);

    if (currentIndex < sessionCards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    } else {
      setSessionCompleted(true);
      setShowConfetti(true);
      import("@/store/useGamificationStore").then(mod => {
        mod.useGamificationStore.getState().recordStudySession();
      });
    }
  }, [deck, currentIndex, sessionCards]);

  const handleAnswer = useCallback((status: "mastered" | "learning") => {
    handleAnswerQuality(status === "mastered" ? 4 : 1);
  }, [handleAnswerQuality]);

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
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === "Space" || e.key === " " || e.key === "Enter" || e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        handleFlip();
      } else if (e.key === "1") {
        e.preventDefault();
        handleAnswerQuality(1);
      } else if (e.key === "2") {
        e.preventDefault();
        handleAnswerQuality(2);
      } else if (e.key === "3") {
        e.preventDefault();
        handleAnswerQuality(4);
      } else if (e.key === "4") {
        e.preventDefault();
        handleAnswerQuality(5);
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
  }, [handleFlip, handleAnswer, handleAnswerQuality, playAudio, router]);

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
    setShowConfetti(false);
    setEarnedXpTotal(0);
  };

  if (!deck) return null;

  const currentCard = sessionCards[currentIndex] || deck.cards[0];
  const progress = sessionCards.length > 0 ? ((currentIndex) / sessionCards.length) * 100 : 100;
  const leitnerBox = currentCard ? getLeitnerBox(currentCard) : 1;
  const boxConfig = getBoxConfig(leitnerBox);

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-[#080d24] text-slate-900 dark:text-slate-100 flex flex-col select-none overflow-hidden font-sans">
      {showConfetti && <Confetti active={showConfetti} />}

      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/10 dark:bg-indigo-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-fuchsia-600/10 dark:bg-fuchsia-600/15 rounded-full blur-[120px]" />
      </div>

      {/* Header Bar */}
      <header className="px-6 py-4 flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-indigo-500/20 bg-white/90 dark:bg-slate-900/60 backdrop-blur-2xl z-20 gap-4 shadow-sm">
        <button 
          onClick={() => router.push("/flashcards")}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold transition-colors text-sm group"
        >
          <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 group-hover:bg-slate-200 dark:group-hover:bg-white/10">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Exit Hub</span>
          <kbd className="hidden sm:inline text-[10px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">Esc</kbd>
        </button>

        <div className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight flex items-center gap-3">
          <span className="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </span>
          {deck.title}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm">
            <input 
              type="checkbox" 
              className="accent-indigo-500 w-4 h-4 rounded"
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
          <div className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30 px-3.5 py-1.5 rounded-full backdrop-blur-md">
            Card {Math.min(currentIndex + 1, sessionCards.length)} / {sessionCards.length}
          </div>
        </div>
      </header>

      {/* Spaced Repetition Progress Bar */}
      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-900 relative z-20">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400 transition-all duration-300 shadow-[0_0_12px_rgba(168,85,247,0.5)]"
          style={{ width: `${sessionCompleted ? 100 : progress}%` }}
        />
      </div>

      {/* Main 3D Flashcard Reader Stage */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative z-10">
        <AnimatePresence mode="wait">
          {!sessionCompleted && sessionCards.length > 0 ? (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 60, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -60, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="w-full max-w-xl aspect-[4/3] relative perspective-1000"
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
                whileDrag={{ scale: 1.04, rotateZ: isFlipped ? 3 : 0 }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 240, damping: 20 }}
              >
                {/* ── CARD FRONT (QUESTION) ── */}
                <div className="absolute inset-0 backface-hidden bg-white/95 dark:bg-[#0d1436]/90 backdrop-blur-2xl rounded-[2.5rem] shadow-xl dark:shadow-2xl border border-slate-200/90 dark:border-indigo-500/30 p-8 md:p-10 flex flex-col justify-between pointer-events-none group">
                  {/* Subtle top light bar */}
                  <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />

                  {/* Header Badge & Audio */}
                  <div className="flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                        QUESTION
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${boxConfig.color}`}>
                        {boxConfig.label}
                      </span>
                    </div>

                    <button 
                      onClick={(e) => playAudio(e, currentCard.front)}
                      disabled={isPlayingAudio}
                      title="Read Question Aloud (Press R)"
                      className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-slate-200 dark:border-white/10 hover:border-indigo-500/30 active:scale-90 shadow-sm"
                    >
                      {isPlayingAudio ? <Loader2 className="w-5 h-5 animate-spin text-indigo-500" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Card Front Content */}
                  <div className="my-auto py-6 text-center">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-relaxed tracking-tight">
                      {bionicMode ? formatBionicText(currentCard.front) : currentCard.front}
                    </h2>
                  </div>

                  {/* Bottom Flip Hint */}
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 animate-pulse">
                    <span>Tap or press</span>
                    <kbd className="px-2 py-0.5 bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30 rounded text-indigo-600 dark:text-indigo-300 font-mono font-black">
                      Space
                    </kbd>
                    <span>to reveal answer</span>
                  </div>
                </div>

                {/* ── CARD BACK (ANSWER) ── */}
                <div 
                  className="absolute inset-0 backface-hidden bg-gradient-to-br from-fuchsia-50/95 via-purple-50/95 to-indigo-50/95 dark:from-[#121c4d]/95 dark:via-[#1a1542]/95 dark:to-[#161233]/95 backdrop-blur-2xl rounded-[2.5rem] shadow-xl dark:shadow-2xl border border-fuchsia-300/80 dark:border-fuchsia-500/40 p-8 md:p-10 flex flex-col justify-between pointer-events-none"
                  style={{ transform: "rotateY(180deg)" }}
                >
                  {/* Glowing header line */}
                  <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-fuchsia-400/50 to-transparent" />

                  {/* Header Badge & Audio */}
                  <div className="flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-widest text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-500/10 px-3 py-1 rounded-full border border-fuchsia-500/20">
                        ANSWER
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${boxConfig.color}`}>
                        {boxConfig.label}
                      </span>
                    </div>

                    <button 
                      onClick={(e) => playAudio(e, currentCard.back)}
                      disabled={isPlayingAudio}
                      title="Read Answer Aloud (Press R)"
                      className="p-3 rounded-2xl bg-white dark:bg-white/5 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-500/20 text-slate-600 dark:text-slate-300 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 transition-all border border-slate-200 dark:border-white/10 hover:border-fuchsia-500/30 active:scale-90 shadow-sm"
                    >
                      {isPlayingAudio ? <Loader2 className="w-5 h-5 animate-spin text-fuchsia-500" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Card Back Answer Content */}
                  <div className="my-auto py-6 text-center">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-fuchsia-100 leading-relaxed max-w-lg mx-auto">
                      {bionicMode ? formatBionicText(currentCard.back) : currentCard.back}
                    </h2>
                  </div>

                  {/* Bottom Navigation Hint */}
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-fuchsia-600/80 dark:text-fuchsia-300/80">
                    <span>Rate your confidence below or swipe</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            /* ── SESSION COMPLETED CARD ── */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl p-8 sm:p-12 rounded-[2.5rem] shadow-xl dark:shadow-2xl border border-slate-200 dark:border-indigo-500/30 text-center max-w-md w-full relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-indigo-500 to-fuchsia-500" />
              
              <div className="w-20 h-20 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                <Award className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-extrabold mb-2 text-slate-900 dark:text-white tracking-tight">Session Complete! 🎉</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium text-sm">
                You've mastered all {sessionCards.length} {dueOnly ? "due cards" : "cards"} in this session.
              </p>

              {earnedXpTotal > 0 && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 flex items-center justify-center gap-2 font-bold text-base">
                  <Flame className="w-5 h-5 text-amber-500 dark:text-amber-400" /> +{earnedXpTotal} XP Earned!
                </div>
              )}
              
              <div className="space-y-3">
                <button 
                  onClick={restart}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white font-bold py-3.5 rounded-2xl transition-all border border-slate-200 dark:border-white/10 text-sm active:scale-95"
                >
                  <RotateCcw className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> Review Deck Again
                </button>
                <button 
                  onClick={() => router.push("/flashcards")}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-fuchsia-600 text-white hover:opacity-95 font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-500/25 text-sm active:scale-95"
                >
                  Back to Flashcards Hub
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Confidence Controls */}
      <AnimatePresence>
        {!sessionCompleted && sessionCards.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="p-4 sm:p-6 border-t border-slate-200 dark:border-indigo-500/20 bg-white/90 dark:bg-slate-900/80 backdrop-blur-2xl z-20 flex flex-col items-center justify-center gap-3 shadow-sm"
          >
            {isFlipped ? (
              /* SM-2 4-Level Quality Rating Bar when card is flipped */
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-xl">
                <button 
                  onClick={() => handleAnswerQuality(1)}
                  title="Press 1 key"
                  className="py-3 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold rounded-2xl border border-rose-500/30 transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95"
                >
                  <span className="text-xs flex items-center gap-1"><X className="w-3.5 h-3.5" /> Again</span>
                  <span className="text-[10px] text-rose-500/70 dark:text-rose-400/70 font-mono">1d review</span>
                </button>

                <button 
                  onClick={() => handleAnswerQuality(2)}
                  title="Press 2 key"
                  className="py-3 px-3 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold rounded-2xl border border-orange-500/30 transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95"
                >
                  <span className="text-xs flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> Hard</span>
                  <span className="text-[10px] text-orange-500/70 dark:text-orange-400/70 font-mono">2d review</span>
                </button>

                <button 
                  onClick={() => handleAnswerQuality(4)}
                  title="Press 3 key"
                  className="py-3 px-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold rounded-2xl border border-indigo-500/30 transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95"
                >
                  <span className="text-xs flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Good</span>
                  <span className="text-[10px] text-indigo-500/70 dark:text-indigo-400/70 font-mono">6d review</span>
                </button>

                <button 
                  onClick={() => handleAnswerQuality(5)}
                  title="Press 4 key"
                  className="py-3 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-2xl border border-emerald-500/30 transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95 shadow-md shadow-emerald-500/10"
                >
                  <span className="text-xs flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Easy ⭐</span>
                  <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-mono">Mastered</span>
                </button>
              </div>
            ) : (
              /* Simple Flip button when front of card is shown */
              <div className="flex items-center gap-3 w-full max-w-md justify-center">
                <button 
                  onClick={handleFlip}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-500 to-fuchsia-600 hover:opacity-95 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Show Answer Card
                  <kbd className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">Space</kbd>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
