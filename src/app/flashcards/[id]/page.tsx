"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, X, RotateCcw, Award, Volume2, Loader2 } from "lucide-react";
import { FlashcardDeck, getDeck, saveDeck, Flashcard } from "@/lib/flashcards";

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

export default function FlashcardPlayer({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  
  // Player state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  // Audio playback
  const playAudio = async (e: React.MouseEvent, text: string) => {
    e.stopPropagation(); 
    if (isPlayingAudio) return;
    
    setIsPlayingAudio(true);
    
    // 1. Create and unlock the audio element synchronously (required for Safari/iOS)
    const audio = new Audio();
    audio.play().catch(() => {}); // Ignore empty source error
    
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        
        // 2. Assign the actual audio source
        audio.src = url;
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => setIsPlayingAudio(false);
        
        // 3. Play the actual audio
        audio.play().catch(e => {
          console.error("Audio play error:", e);
          setIsPlayingAudio(false);
        });
      } else {
        const err = await res.json();
        console.error("TTS API Error:", err);
        alert(err.error || "Failed to generate audio (Check quota)");
        setIsPlayingAudio(false);
      }
    } catch(err) {
      console.error(err);
      alert("Network error while fetching audio.");
      setIsPlayingAudio(false);
    }
  };

  useEffect(() => {
    const loaded = getDeck(params.id);
    if (loaded) {
      // Update lastStudied
      const updated = { ...loaded, lastStudied: Date.now() };
      saveDeck(updated);
      setDeck(updated);
    }
  }, [params.id]);

  if (!deck) return null;

  const currentCard = deck.cards[currentIndex];
  const progress = ((currentIndex) / deck.cards.length) * 100;

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleAnswer = (status: "mastered" | "learning") => {
    const cardId = currentCard.id || `card_${currentIndex}`;
    const currentBox = getLeitnerBox(deck.id, cardId);
    
    let newBox = 1;
    let earnedXp = 0;
    
    if (status === "mastered") {
      newBox = Math.min(5, currentBox + 1);
      earnedXp = 15;
      if (newBox === 5 && currentBox < 5) {
        earnedXp = 100;
      }
    } else {
      newBox = 1;
    }

    try {
      localStorage.setItem(`edutrack_leitner_${deck.id}_${cardId}`, newBox.toString());
      
      // Award XP globally in localStorage
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

        // Mark Daily Mission "Recall Wizard" as complete!
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

    // Update card status
    const updatedCards = [...deck.cards];
    updatedCards[currentIndex] = {
      ...updatedCards[currentIndex],
      status,
      lastReviewed: Date.now()
    };
    
    const updatedDeck = { ...deck, cards: updatedCards };
    saveDeck(updatedDeck);
    setDeck(updatedDeck);

    // Go to next card
    if (currentIndex < deck.cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(currentIndex + 1), 150); // slight delay for smooth exit
    } else {
      setSessionCompleted(true);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        <button 
          onClick={() => router.push("/flashcards")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-bold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Exit
        </button>
        <div className="font-bold text-slate-800 dark:text-slate-200">{deck.title}</div>
        <div className="text-sm font-bold text-slate-500">
          {currentIndex + 1} / {deck.cards.length}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800">
        <div 
          className="h-full bg-fuchsia-500 transition-all duration-300"
          style={{ width: `${sessionCompleted ? 100 : progress}%` }}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <AnimatePresence mode="wait">
          {!sessionCompleted ? (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-xl aspect-[4/3] perspective-1000"
            >
              <motion.div
                className="w-full h-full relative preserve-3d cursor-pointer"
                onClick={handleFlip}
                animate={{ rotateX: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-8 text-center">
                  <span className="absolute top-6 left-6 text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    Question
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border normal-case tracking-normal ${
                      getBoxConfig(getLeitnerBox(deck.id, currentCard.id || `card_${currentIndex}`)).color
                    }`}>
                      {getBoxConfig(getLeitnerBox(deck.id, currentCard.id || `card_${currentIndex}`)).label}
                    </span>
                  </span>
                  
                  <button 
                    onClick={(e) => playAudio(e, currentCard.front)}
                    disabled={isPlayingAudio}
                    className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-indigo-600 transition-colors"
                  >
                    {isPlayingAudio ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
                  </button>

                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white leading-relaxed">
                    {currentCard.front}
                  </h2>
                  <p className="absolute bottom-6 text-sm text-slate-400 animate-pulse">Tap to flip</p>
                </div>

                {/* Back */}
                <div 
                  className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-50 to-fuchsia-50 dark:from-indigo-900/20 dark:to-fuchsia-900/20 rounded-3xl shadow-xl border border-fuchsia-200 dark:border-fuchsia-800 flex flex-col items-center justify-center p-8 text-center"
                  style={{ transform: "rotateX(180deg)" }}
                >
                  <span className="absolute top-6 left-6 text-xs font-extrabold uppercase tracking-widest text-fuchsia-500 flex items-center gap-2">
                    Answer
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border normal-case tracking-normal ${
                      getBoxConfig(getLeitnerBox(deck.id, currentCard.id || `card_${currentIndex}`)).color
                    }`}>
                      {getBoxConfig(getLeitnerBox(deck.id, currentCard.id || `card_${currentIndex}`)).label}
                    </span>
                  </span>
                  
                  <button 
                    onClick={(e) => playAudio(e, currentCard.back)}
                    disabled={isPlayingAudio}
                    className="absolute top-6 right-6 p-2 rounded-full bg-white/50 dark:bg-slate-900/50 text-fuchsia-600 hover:text-indigo-600 transition-colors backdrop-blur-sm"
                  >
                    {isPlayingAudio ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
                  </button>

                  <h2 className="text-xl md:text-2xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed max-w-lg">
                    {currentCard.back}
                  </h2>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-800 p-12 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 text-center max-w-md w-full"
            >
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-extrabold mb-2 text-slate-900 dark:text-white">Session Complete!</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
                You've reviewed all {deck.cards.length} cards.
              </p>
              
              <div className="space-y-3">
                <button 
                  onClick={restart}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold py-3.5 rounded-xl transition-colors"
                >
                  <RotateCcw className="w-5 h-5" /> Review Again
                </button>
                <button 
                  onClick={() => router.push("/flashcards")}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                >
                  Back to Hub
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Controls (Only visible when flipped) */}
      <AnimatePresence>
        {!sessionCompleted && isFlipped && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="p-6 pb-12 flex justify-center gap-4"
          >
            <button 
              onClick={() => handleAnswer("learning")}
              className="flex-1 max-w-xs flex items-center justify-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 py-4 rounded-2xl font-bold transition-colors border border-red-200 dark:border-red-800"
            >
              <X className="w-6 h-6" /> Still Learning
            </button>
            <button 
              onClick={() => handleAnswer("mastered")}
              className="flex-1 max-w-xs flex items-center justify-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 py-4 rounded-2xl font-bold transition-colors border border-emerald-200 dark:border-emerald-800"
            >
              <Check className="w-6 h-6" /> Got It
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
