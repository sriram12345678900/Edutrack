"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gamepad2, Users, Trophy, Zap, Shield, Flame, Timer, CheckCircle, 
  XCircle, Award, Sparkles, Volume2, ArrowRight, Play, RotateCcw, 
  Crown, Star, Heart, Lock, Key, Copy, Check
} from "lucide-react";
import Confetti from "@/components/Confetti";
import { awardXp } from "@/lib/xp";
import { playArcadeSound } from "@/lib/arcadeAudio";
import { cn } from "@/lib/utils";

interface ArenaQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  subject: string;
  points: number;
  hint: string;
}

const ARENA_QUESTIONS: ArenaQuestion[] = [
  {
    id: 1,
    question: "What is the focal length of a plane mirror?",
    options: ["Zero", "Infinity", "1 metre", "-1 metre"],
    correctIndex: 1,
    subject: "Physics",
    points: 1000,
    hint: "Parallel rays reflected from a flat plane never converge to a finite point."
  },
  {
    id: 2,
    question: "Which gas is liberated when zinc granules react with dilute sulphuric acid?",
    options: ["Oxygen", "Carbon Dioxide", "Hydrogen", "Sulphur Dioxide"],
    correctIndex: 2,
    subject: "Chemistry",
    points: 1000,
    hint: "Active metals displace hydrogen gas with a characteristic 'pop' sound."
  },
  {
    id: 3,
    question: "In human kidneys, the structural and functional filtration unit is called:",
    options: ["Neuron", "Nephron", "Alveoli", "Villi"],
    correctIndex: 1,
    subject: "Biology",
    points: 1000,
    hint: "Contains the Bowman's capsule and Glomerulus."
  },
  {
    id: 4,
    question: "If sin θ + cos θ = √2 cos θ, then the value of cos θ - sin θ is:",
    options: ["√2 sin θ", "√2 cos θ", "1/√2", "0"],
    correctIndex: 0,
    subject: "Mathematics",
    points: 1200,
    hint: "Square both sides or express sin θ in terms of cos θ."
  },
  {
    id: 5,
    question: "What is the SI unit of magnetic field strength (B)?",
    options: ["Weber", "Tesla", "Oersted", "Ampere-turn"],
    correctIndex: 1,
    subject: "Physics",
    points: 1000,
    hint: "Named after the inventor Nikola..."
  }
];

interface Competitor {
  id: string;
  name: string;
  avatar: string;
  countryFlag: string;
  score: number;
  streak: number;
  isUser?: boolean;
}

export default function ArenaPage() {
  const [gameState, setGameState] = useState<"lobby" | "waiting" | "playing" | "results">("lobby");
  const [roomCode, setRoomCode] = useState<string>("");
  const [inputCode, setInputCode] = useState<string>("");
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copied, setCopied] = useState(false);

  // Power-ups
  const [power5050Used, setPower5050Used] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  const [doubleScoreActive, setDoubleScoreActive] = useState(false);

  // Competitors Leaderboard
  const [competitors, setCompetitors] = useState<Competitor[]>([
    { id: "comp-user", name: "You (Champion)", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Champion", countryFlag: "🇮🇳", score: 0, streak: 0, isUser: true },
    { id: "comp-1", name: "Liam Miller", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Liam", countryFlag: "🇺🇸", score: 0, streak: 0 },
    { id: "comp-2", name: "Yuki Tanaka", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Yuki", countryFlag: "🇯🇵", score: 0, streak: 0 },
    { id: "comp-3", name: "Emma Watson", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Emma", countryFlag: "🇬🇧", score: 0, streak: 0 },
    { id: "comp-4", name: "Carlos Santos", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Carlos", countryFlag: "🇧🇷", score: 0, streak: 0 }
  ]);

  const currentQuestion = ARENA_QUESTIONS[currentQIndex];

  // Timer countdown
  useEffect(() => {
    let timer: any;
    if (gameState === "playing" && !isAnswered && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAnswered && gameState === "playing") {
      handleTimeout();
    }
    return () => clearInterval(timer);
  }, [gameState, isAnswered, timeLeft]);

  const handleCreateRoom = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setRoomCode(code);
    setGameState("waiting");
    playArcadeSound("game_start");
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setRoomCode(inputCode.trim());
    setGameState("waiting");
    playArcadeSound("game_start");
  };

  const handleStartBattle = () => {
    setGameState("playing");
    setCurrentQIndex(0);
    setTimeLeft(15);
    setSelectedOption(null);
    setIsAnswered(false);
    setStreak(0);
    setUserScore(0);
    setPower5050Used(false);
    setDisabledOptions([]);
    setDoubleScoreActive(false);
    setShowConfetti(false);

    // Reset competitors
    setCompetitors(prev => prev.map(c => ({ ...c, score: 0, streak: 0 })));
  };

  const handleTimeout = () => {
    setIsAnswered(true);
    setStreak(0);
    simulateOpponents(false);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered || disabledOptions.includes(idx)) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQuestion.correctIndex;
    let earned = 0;

    if (isCorrect) {
      playArcadeSound("correct");
      const speedBonus = timeLeft * 40;
      const streakBonus = streak * 100;
      earned = currentQuestion.points + speedBonus + streakBonus;
      if (doubleScoreActive) earned *= 2;
      setStreak(prev => prev + 1);
      setUserScore(prev => prev + earned);
    } else {
      playArcadeSound("wrong");
      setStreak(0);
    }

    // Simulate competitor responses
    simulateOpponents(isCorrect);
  };

  const simulateOpponents = (userWasCorrect: boolean) => {
    setCompetitors(prev => {
      return prev.map(c => {
        if (c.isUser) {
          return {
            ...c,
            score: userWasCorrect ? c.score + (currentQuestion.points + timeLeft * 40) : c.score,
            streak: userWasCorrect ? c.streak + 1 : 0
          };
        }
        // AI rivals have 75% accuracy
        const aiCorrect = Math.random() > 0.25;
        const aiSpeed = Math.floor(Math.random() * 12) + 2;
        const pts = aiCorrect ? currentQuestion.points + aiSpeed * 35 : 0;
        return {
          ...c,
          score: c.score + pts,
          streak: aiCorrect ? c.streak + 1 : 0
        };
      }).sort((a, b) => b.score - a.score);
    });
  };

  const handleNextQuestion = () => {
    if (currentQIndex + 1 < ARENA_QUESTIONS.length) {
      setCurrentQIndex(prev => prev + 1);
      setTimeLeft(15);
      setSelectedOption(null);
      setIsAnswered(false);
      setDisabledOptions([]);
      setDoubleScoreActive(false);
    } else {
      setGameState("results");
      setShowConfetti(true);
      playArcadeSound("game_win");
      awardXp(150, "Quiz Battle Arena Victory");
    }
  };

  // Powerup 1: 50-50
  const usePower5050 = () => {
    if (power5050Used || isAnswered) return;
    const wrongIndices = currentQuestion.options
      .map((_, i) => i)
      .filter(i => i !== currentQuestion.correctIndex);
    
    // Disable 2 wrong choices
    setDisabledOptions(wrongIndices.slice(0, 2));
    setPower5050Used(true);
    playArcadeSound("powerup");
  };

  // Powerup 2: Time Freeze (+10s)
  const useTimeFreeze = () => {
    if (isAnswered) return;
    setTimeLeft(prev => prev + 10);
    playArcadeSound("powerup");
  };

  // Powerup 3: Double Points
  const useDoubleScore = () => {
    if (doubleScoreActive || isAnswered) return;
    setDoubleScoreActive(true);
    playArcadeSound("powerup");
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <Confetti active={showConfetti} />
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-900/40 via-amber-900/40 to-slate-900/60 border border-amber-500/20 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
                <Gamepad2 className="w-3.5 h-3.5 animate-bounce" />
                Live Multiplayer Arena
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                Live Quiz <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-400">Battle Royale</span>
              </h1>
              <p className="text-slate-300 text-xs md:text-sm max-w-xl">
                Compete in real-time against global students! Answer at lightning speed, activate power-ups, and climb to the top of the podium!
              </p>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold block">VICTORY PRIZE</span>
              <span className="text-sm font-black text-amber-400 flex items-center gap-1 justify-center">
                <Flame className="w-4 h-4" /> +150 XP
              </span>
            </div>
          </div>
        </div>

        {/* State 1: Lobby */}
        {gameState === "lobby" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Crown className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-white">Host a Battle Room</h2>
                <p className="text-xs text-slate-400">
                  Generate a 6-digit match code and challenge classmates or global contenders to a live synchronous battle.
                </p>
              </div>

              <button
                onClick={handleCreateRoom}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-black text-sm shadow-xl shadow-amber-600/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                Create Match Room
              </button>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Key className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-white">Join via Room PIN</h2>
                <p className="text-xs text-slate-400">
                  Enter the 6-digit game code provided by your teacher or battle host.
                </p>
              </div>

              <form onSubmit={handleJoinRoom} className="space-y-3">
                <input
                  type="text"
                  maxLength={6}
                  value={inputCode}
                  onChange={e => setInputCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-Digit PIN..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-center text-lg font-black tracking-widest text-indigo-400 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={inputCode.length < 4}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  Join Live Room
                </button>
              </form>
            </div>
          </div>
        )}

        {/* State 2: Waiting Room */}
        {gameState === "waiting" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl text-center"
          >
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Match PIN Code</span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl md:text-5xl font-black font-mono tracking-widest text-white">{roomCode}</span>
                <button
                  onClick={copyRoomCode}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-colors"
                  title="Copy PIN Code"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-slate-400">Share this code with your opponents to join this lobby.</p>
            </div>

            {/* Players Joined */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Combatants Ready in Lobby (5)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {competitors.map(c => (
                  <div key={c.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center gap-2">
                    <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full bg-slate-800" />
                    <span className="text-xs font-bold text-slate-200">{c.name.split(" ")[0]} {c.countryFlag}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <button
                onClick={() => setGameState("lobby")}
                className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                Leave Lobby
              </button>
              <button
                onClick={handleStartBattle}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-white font-black text-sm shadow-xl shadow-amber-500/30 flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                Launch Battle!
              </button>
            </div>
          </motion.div>
        )}

        {/* State 3: Active Battle Gameplay */}
        {gameState === "playing" && (
          <div className="space-y-6">
            
            {/* Top Battle HUD */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black text-indigo-400">Q {currentQIndex + 1}/{ARENA_QUESTIONS.length}</span>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold">{currentQuestion.subject}</span>
              </div>

              {/* Timer Dial */}
              <div className="flex items-center gap-2">
                <Timer className={cn("w-5 h-5", timeLeft <= 5 ? "text-red-500 animate-ping" : "text-amber-400")} />
                <span className={cn(
                  "text-xl font-black font-mono",
                  timeLeft <= 5 ? "text-red-400 animate-pulse" : "text-white"
                )}>
                  {timeLeft}s
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400">Streak:</span>
                <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                  <Flame className="w-4 h-4 fill-amber-400" /> {streak}x
                </span>
                <span className="text-sm font-black text-emerald-400">Score: {userScore}</span>
              </div>
            </div>

            {/* Power-up toolbar */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={usePower5050}
                disabled={power5050Used || isAnswered}
                className="px-4 py-2 rounded-xl bg-purple-600/20 border border-purple-500/40 hover:bg-purple-600/30 disabled:opacity-30 text-purple-300 text-xs font-black flex items-center gap-1.5 transition-all"
              >
                <Zap className="w-3.5 h-3.5" /> 50:50 ({power5050Used ? "Used" : "Ready"})
              </button>

              <button
                onClick={useTimeFreeze}
                disabled={isAnswered}
                className="px-4 py-2 rounded-xl bg-blue-600/20 border border-blue-500/40 hover:bg-blue-600/30 disabled:opacity-30 text-blue-300 text-xs font-black flex items-center gap-1.5 transition-all"
              >
                <Timer className="w-3.5 h-3.5" /> +10s Time Freeze
              </button>

              <button
                onClick={useDoubleScore}
                disabled={doubleScoreActive || isAnswered}
                className="px-4 py-2 rounded-xl bg-amber-600/20 border border-amber-500/40 hover:bg-amber-600/30 disabled:opacity-30 text-amber-300 text-xs font-black flex items-center gap-1.5 transition-all"
              >
                <Flame className="w-3.5 h-3.5" /> 2x Score Multiplier {doubleScoreActive && "(Active)"}
              </button>
            </div>

            {/* Question Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl text-center">
              <h2 className="text-lg md:text-2xl font-black text-white leading-relaxed">
                {currentQuestion.question}
              </h2>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentQuestion.options.map((opt, idx) => {
                  const isDisabled = disabledOptions.includes(idx);
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQuestion.correctIndex;

                  let btnStyle = "bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-200";
                  if (isAnswered) {
                    if (isCorrect) {
                      btnStyle = "bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-950/50";
                    } else if (isSelected) {
                      btnStyle = "bg-red-950/60 border-red-500 text-red-300";
                    } else {
                      btnStyle = "bg-slate-950/40 border-slate-900 text-slate-600 opacity-50";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered || isDisabled}
                      onClick={() => handleSelectOption(idx)}
                      className={cn(
                        "p-5 rounded-2xl border text-sm font-bold text-left transition-all flex items-center justify-between",
                        btnStyle,
                        isDisabled && "opacity-20 cursor-not-allowed line-through"
                      )}
                    >
                      <span>{opt}</span>
                      {isAnswered && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                      {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400" />}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    💡 <strong>Hint:</strong> {currentQuestion.hint}
                  </span>
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
                  >
                    Next Question <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Live Leaderboard Strip */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Live Match Leaderboard</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {competitors.map((c, i) => (
                  <div 
                    key={c.id} 
                    className={cn(
                      "p-2.5 rounded-xl border flex items-center justify-between text-xs",
                      c.isUser ? "bg-indigo-950/40 border-indigo-500 font-black text-indigo-300" : "bg-slate-950 border-slate-800 text-slate-300"
                    )}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-slate-500">#{i + 1}</span>
                      <span className="truncate">{c.name.split(" ")[0]} {c.countryFlag}</span>
                    </div>
                    <span className="font-mono font-bold text-amber-400">{c.score}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* State 4: Results & Podium */}
        {gameState === "results" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl text-center"
          >
            <div className="space-y-2">
              <Crown className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
              <h2 className="text-3xl font-black text-white">Battle Finished!</h2>
              <p className="text-xs text-slate-400">Final match standings and victory rewards:</p>
            </div>

            {/* Podium */}
            <div className="flex items-end justify-center gap-4 pt-6 pb-4">
              {/* 2nd Place */}
              <div className="flex flex-col items-center gap-2">
                <img src={competitors[1]?.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-slate-400 bg-slate-800" />
                <span className="text-xs font-bold text-slate-300">{competitors[1]?.name.split(" ")[0]}</span>
                <div className="w-24 h-24 bg-slate-800 rounded-t-2xl border border-slate-700 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-slate-400">2nd</span>
                  <span className="text-xs font-mono font-bold text-amber-400">{competitors[1]?.score}</span>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center gap-2 -mt-4">
                <Crown className="w-6 h-6 text-amber-400" />
                <img src={competitors[0]?.avatar} alt="" className="w-16 h-16 rounded-full border-2 border-amber-400 bg-slate-800" />
                <span className="text-xs font-black text-amber-300">{competitors[0]?.name.split(" ")[0]} 👑</span>
                <div className="w-28 h-36 bg-gradient-to-t from-amber-600/40 to-amber-500/20 rounded-t-2xl border border-amber-500/40 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-amber-400">1st</span>
                  <span className="text-sm font-mono font-black text-white">{competitors[0]?.score}</span>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center gap-2">
                <img src={competitors[2]?.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-amber-800 bg-slate-800" />
                <span className="text-xs font-bold text-slate-300">{competitors[2]?.name.split(" ")[0]}</span>
                <div className="w-24 h-16 bg-slate-800/80 rounded-t-2xl border border-slate-700 flex flex-col items-center justify-center">
                  <span className="text-lg font-black text-amber-700">3rd</span>
                  <span className="text-xs font-mono font-bold text-amber-400">{competitors[2]?.score}</span>
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-xs text-slate-400 block font-bold">Your Score</span>
                <span className="text-2xl font-black text-white">{userScore}</span>
              </div>
              <div className="w-[1px] h-8 bg-slate-800" />
              <div>
                <span className="text-xs text-slate-400 block font-bold">XP Awarded</span>
                <span className="text-2xl font-black text-amber-400">+150 XP</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <button
                onClick={() => setGameState("lobby")}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Play Another Battle
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
