"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Sparkles, Zap, Flame, Timer, Play, RotateCcw, Volume2, VolumeX,
  CheckCircle2, XCircle, ArrowLeft, Brain, Compass, Star, Crown, Heart,
  Shield, HelpCircle, ChevronRight, Award, Atom, BookOpen, Layers,
  FlaskConical, Cpu, Clock, Dna, Crosshair, Feather, AlertTriangle, Plus, Minus,
  Check, RefreshCw, Radio, Sparkle
} from "lucide-react";
import Confetti from "@/components/Confetti";
import { awardUserXP } from "@/lib/xp";
import { arcadeAudio } from "@/lib/arcadeAudio";
import { 
  PERIODIC_BLITZ_QUESTIONS, 
  FORMULA_RUSH_LEVELS, 
  generateSpeedMathQuestion, 
  SpeedMathQuestion,
  WORD_DEFENDER_ITEMS, 
  MEMORY_CONCEPT_PAIRS,
  REACTION_BALANCER_LEVELS,
  CIRCUIT_PUZZLES,
  TIMELINE_CHALLENGES,
  BIO_SORT_ITEMS,
  GRAPH_SNIPER_TARGETS,
  GRAMMAR_SPELL_QUESTIONS,
  ASSERTION_REASON_ITEMS,
  ReactionBalancerLevel,
  CircuitMasterPuzzle,
  CircuitTile,
  TimelineChallenge,
  TimelineEventItem,
  BioSortItem,
  GraphSniperTarget,
  GrammarQuestion,
  AssertionReasonItem,
  FormulaRushLevel,
  WordDefenderItem,
  PeriodicQuestion
} from "@/lib/gamesData";

type GameMode = 
  | "lobby" 
  | "periodic_blitz" 
  | "formula_rush" 
  | "speed_math" 
  | "word_defender" 
  | "memory_flip"
  | "reaction_balancer"
  | "circuit_master"
  | "history_timeline"
  | "bio_sort"
  | "graph_sniper"
  | "grammar_spell"
  | "assertion_storm";

interface ArcadeStats {
  totalGameXp: number;
  gamesPlayed: number;
  highScores: Record<string, number>;
  bestCombo: number;
}

export default function EduArcadePage() {
  const [activeGame, setActiveGame] = useState<GameMode>("lobby");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);

  // Player Stats in LocalStorage
  const [stats, setStats] = useState<ArcadeStats>({
    totalGameXp: 0,
    gamesPlayed: 0,
    highScores: {},
    bestCombo: 0
  });

  // End Game Result Modal
  const [gameOverResult, setGameOverResult] = useState<{
    gameId: string;
    gameTitle: string;
    score: number;
    xpEarned: number;
    isNewHighScore: boolean;
    accuracy: number;
    streak: number;
  } | null>(null);

  // Load stats on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMuted(arcadeAudio.getMuted());
      const stored = localStorage.getItem("edutrack_arcade_stats");
      if (stored) {
        try {
          setStats(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse arcade stats", e);
        }
      }
    }
  }, []);

  const saveGameResult = (gameId: string, gameTitle: string, score: number, xpEarned: number, accuracy: number, streak: number) => {
    const currentHigh = stats.highScores[gameId] || 0;
    const isNewHighScore = score > currentHigh;
    const newHighScores = { ...stats.highScores, [gameId]: Math.max(currentHigh, score) };
    const newBestCombo = Math.max(stats.bestCombo, streak);
    const updatedStats: ArcadeStats = {
      totalGameXp: stats.totalGameXp + xpEarned,
      gamesPlayed: stats.gamesPlayed + 1,
      highScores: newHighScores,
      bestCombo: newBestCombo
    };

    setStats(updatedStats);
    if (typeof window !== "undefined") {
      localStorage.setItem("edutrack_arcade_stats", JSON.stringify(updatedStats));
    }

    awardUserXP(xpEarned);

    setGameOverResult({
      gameId,
      gameTitle,
      score,
      xpEarned,
      isNewHighScore,
      accuracy,
      streak
    });

    if (score > 0) {
      arcadeAudio.playVictory();
      setConfettiActive(true);
      setTimeout(() => setConfettiActive(false), 3500);
    } else {
      arcadeAudio.playGameOver();
    }
  };

  const toggleSound = () => {
    const nextMute = arcadeAudio.toggleMute();
    setIsMuted(nextMute);
  };

  // --------------------------------------------------------------------------
  // GAME 1: PERIODIC TABLE BLITZ
  // --------------------------------------------------------------------------
  const [pbQuestions, setPbQuestions] = useState<PeriodicQuestion[]>([]);
  const [pbIndex, setPbIndex] = useState<number>(0);
  const [pbScore, setPbScore] = useState<number>(0);
  const [pbCombo, setPbCombo] = useState<number>(0);
  const [pbTimeLeft, setPbTimeLeft] = useState<number>(45);
  const [pbSelectedOpt, setPbSelectedOpt] = useState<number | null>(null);
  const [pbDisabledOpts, setPbDisabledOpts] = useState<number[]>([]);
  const [pbFrozenTime, setPbFrozenTime] = useState<boolean>(false);
  const [pbCorrectCount, setPbCorrectCount] = useState<number>(0);

  const startPeriodicBlitz = () => {
    const shuffled = [...PERIODIC_BLITZ_QUESTIONS].sort(() => Math.random() - 0.5);
    setPbQuestions(shuffled);
    setPbIndex(0);
    setPbScore(0);
    setPbCombo(0);
    setPbTimeLeft(45);
    setPbSelectedOpt(null);
    setPbDisabledOpts([]);
    setPbFrozenTime(false);
    setPbCorrectCount(0);
    setActiveGame("periodic_blitz");
    arcadeAudio.playTap();
  };

  useEffect(() => {
    if (activeGame !== "periodic_blitz" || gameOverResult !== null) return;
    if (pbFrozenTime) return;

    const timer = setInterval(() => {
      setPbTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishPeriodicBlitz();
          return 0;
        }
        if (prev <= 6) arcadeAudio.playTick();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeGame, pbFrozenTime, gameOverResult, pbScore, pbCorrectCount, pbCombo]);

  const finishPeriodicBlitz = () => {
    const accuracy = pbQuestions.length > 0 ? Math.round((pbCorrectCount / Math.max(1, pbIndex + 1)) * 100) : 0;
    const earnedXp = Math.round(pbScore / 5);
    saveGameResult("periodic_blitz", "Periodic Table Blitz", pbScore, earnedXp, accuracy, pbCombo);
  };

  const handlePeriodicAnswer = (optIndex: number) => {
    if (pbSelectedOpt !== null || pbQuestions.length === 0) return;
    const currentQ = pbQuestions[pbIndex];
    setPbSelectedOpt(optIndex);

    if (optIndex === currentQ.correctIndex) {
      const newCombo = pbCombo + 1;
      setPbCombo(newCombo);
      const points = currentQ.points * Math.min(newCombo, 5);
      setPbScore((prev) => prev + points);
      setPbCorrectCount((prev) => prev + 1);
      arcadeAudio.playCorrect();
      if (newCombo >= 3) setTimeout(() => arcadeAudio.playCombo(newCombo), 150);
    } else {
      setPbCombo(0);
      arcadeAudio.playWrong();
    }

    setTimeout(() => {
      if (pbIndex + 1 < pbQuestions.length && pbTimeLeft > 0) {
        setPbIndex((prev) => prev + 1);
        setPbSelectedOpt(null);
        setPbDisabledOpts([]);
      } else {
        finishPeriodicBlitz();
      }
    }, 900);
  };

  // --------------------------------------------------------------------------
  // GAME 2: FORMULA RUSH
  // --------------------------------------------------------------------------
  const [frLevels, setFrLevels] = useState<FormulaRushLevel[]>([]);
  const [frLevelIdx, setFrLevelIdx] = useState<number>(0);
  const [frPlacedTokens, setFrPlacedTokens] = useState<string[]>([]);
  const [frAvailableTokens, setFrAvailableTokens] = useState<string[]>([]);
  const [frScore, setFrScore] = useState<number>(0);
  const [frCombo, setFrCombo] = useState<number>(0);
  const [frTimeLeft, setFrTimeLeft] = useState<number>(60);
  const [frStatus, setFrStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [frCompletedCount, setFrCompletedCount] = useState<number>(0);

  const startFormulaRush = () => {
    const shuffled = [...FORMULA_RUSH_LEVELS].sort(() => Math.random() - 0.5);
    setFrLevels(shuffled);
    setFrLevelIdx(0);
    setFrPlacedTokens([]);
    setFrAvailableTokens([...shuffled[0].scrambledTokens]);
    setFrScore(0);
    setFrCombo(0);
    setFrTimeLeft(60);
    setFrStatus("idle");
    setFrCompletedCount(0);
    setActiveGame("formula_rush");
    arcadeAudio.playTap();
  };

  useEffect(() => {
    if (activeGame !== "formula_rush" || gameOverResult !== null) return;
    const timer = setInterval(() => {
      setFrTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishFormulaRush();
          return 0;
        }
        if (prev <= 6) arcadeAudio.playTick();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeGame, gameOverResult, frScore, frCombo, frCompletedCount]);

  const finishFormulaRush = () => {
    const earnedXp = Math.round(frScore / 4);
    const accuracy = frLevels.length > 0 ? Math.round((frCompletedCount / frLevels.length) * 100) : 0;
    saveGameResult("formula_rush", "Formula Rush", frScore, earnedXp, accuracy, frCombo);
  };

  const handlePickToken = (token: string, index: number) => {
    if (frStatus !== "idle") return;
    arcadeAudio.playTap();
    setFrPlacedTokens([...frPlacedTokens, token]);
    const updated = [...frAvailableTokens];
    updated.splice(index, 1);
    setFrAvailableTokens(updated);
  };

  const handleRemovePlacedToken = (token: string, index: number) => {
    if (frStatus !== "idle") return;
    arcadeAudio.playTap();
    const updatedPlaced = [...frPlacedTokens];
    updatedPlaced.splice(index, 1);
    setFrPlacedTokens(updatedPlaced);
    setFrAvailableTokens([...frAvailableTokens, token]);
  };

  const verifyFormula = () => {
    if (frStatus !== "idle" || frLevels.length === 0) return;
    const current = frLevels[frLevelIdx];
    const isCorrect = JSON.stringify(frPlacedTokens) === JSON.stringify(current.correctTokens);

    if (isCorrect) {
      const nextCombo = frCombo + 1;
      setFrCombo(nextCombo);
      const points = current.points * Math.min(nextCombo, 4);
      setFrScore((prev) => prev + points);
      setFrCompletedCount((prev) => prev + 1);
      setFrTimeLeft((prev) => prev + 10);
      setFrStatus("correct");
      arcadeAudio.playCorrect();
      if (nextCombo >= 2) setTimeout(() => arcadeAudio.playCombo(nextCombo), 150);

      setTimeout(() => {
        if (frLevelIdx + 1 < frLevels.length) {
          const nextIdx = frLevelIdx + 1;
          setFrLevelIdx(nextIdx);
          setFrPlacedTokens([]);
          setFrAvailableTokens([...frLevels[nextIdx].scrambledTokens]);
          setFrStatus("idle");
        } else {
          finishFormulaRush();
        }
      }, 1000);
    } else {
      setFrCombo(0);
      setFrStatus("wrong");
      arcadeAudio.playWrong();
      setTimeout(() => setFrStatus("idle"), 900);
    }
  };

  // --------------------------------------------------------------------------
  // GAME 3: SPEED MATH MATRIX
  // --------------------------------------------------------------------------
  const [smQuestion, setSmQuestion] = useState<SpeedMathQuestion | null>(null);
  const [smScore, setSmScore] = useState<number>(0);
  const [smCombo, setSmCombo] = useState<number>(0);
  const [smTimeLeft, setSmTimeLeft] = useState<number>(10);
  const [smLevel, setSmLevel] = useState<number>(1);
  const [smSelectedOpt, setSmSelectedOpt] = useState<number | null>(null);
  const [smTotalQuestions, setSmTotalQuestions] = useState<number>(0);
  const [smCorrectAnswers, setSmCorrectAnswers] = useState<number>(0);

  const startSpeedMath = () => {
    const q = generateSpeedMathQuestion(1);
    setSmQuestion(q);
    setSmScore(0);
    setSmCombo(0);
    setSmTimeLeft(10);
    setSmLevel(1);
    setSmSelectedOpt(null);
    setSmTotalQuestions(0);
    setSmCorrectAnswers(0);
    setActiveGame("speed_math");
    arcadeAudio.playTap();
  };

  useEffect(() => {
    if (activeGame !== "speed_math" || gameOverResult !== null) return;
    const timer = setInterval(() => {
      setSmTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishSpeedMath();
          return 0;
        }
        if (prev <= 4) arcadeAudio.playTick();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeGame, gameOverResult, smScore, smCombo, smTotalQuestions, smCorrectAnswers]);

  const finishSpeedMath = () => {
    const accuracy = smTotalQuestions > 0 ? Math.round((smCorrectAnswers / smTotalQuestions) * 100) : 0;
    const earnedXp = Math.round(smScore / 3);
    saveGameResult("speed_math", "Speed Math Matrix", smScore, earnedXp, accuracy, smCombo);
  };

  const handleSpeedMathAnswer = (opt: number) => {
    if (smSelectedOpt !== null || !smQuestion) return;
    setSmSelectedOpt(opt);
    setSmTotalQuestions((prev) => prev + 1);

    if (opt === smQuestion.correctAnswer) {
      const nextCombo = smCombo + 1;
      setSmCombo(nextCombo);
      const points = smQuestion.points * Math.min(nextCombo, 5);
      setSmScore((prev) => prev + points);
      setSmCorrectAnswers((prev) => prev + 1);
      arcadeAudio.playCorrect();
      if (nextCombo % 5 === 0) setSmLevel((prev) => Math.min(prev + 1, 4));
      if (nextCombo >= 3) setTimeout(() => arcadeAudio.playCombo(nextCombo), 150);
      setSmTimeLeft((prev) => Math.min(prev + 4, 15));
    } else {
      setSmCombo(0);
      arcadeAudio.playWrong();
      setSmTimeLeft((prev) => Math.max(prev - 2, 1));
    }

    setTimeout(() => {
      setSmSelectedOpt(null);
      const nextQ = generateSpeedMathQuestion(smLevel);
      setSmQuestion(nextQ);
    }, 600);
  };

  // --------------------------------------------------------------------------
  // GAME 4: WORD DEFENDER (ACTIVE RECALL)
  // --------------------------------------------------------------------------
  const [wdItems, setWdItems] = useState<WordDefenderItem[]>([]);
  const [wdIndex, setWdIndex] = useState<number>(0);
  const [wdGuessedLetters, setWdGuessedLetters] = useState<Set<string>>(new Set());
  const [wdLives, setWdLives] = useState<number>(5);
  const [wdScore, setWdScore] = useState<number>(0);
  const [wdWordsCleared, setWdWordsCleared] = useState<number>(0);

  const startWordDefender = () => {
    const shuffled = [...WORD_DEFENDER_ITEMS].sort(() => Math.random() - 0.5);
    setWdItems(shuffled);
    setWdIndex(0);
    setWdGuessedLetters(new Set());
    setWdLives(5);
    setWdScore(0);
    setWdWordsCleared(0);
    setActiveGame("word_defender");
    arcadeAudio.playTap();
  };

  const currentWdItem = wdItems[wdIndex] || null;

  const handleGuessLetter = (letter: string) => {
    if (!currentWdItem || wdGuessedLetters.has(letter) || wdLives <= 0) return;
    const nextSet = new Set(wdGuessedLetters);
    nextSet.add(letter);
    setWdGuessedLetters(nextSet);

    if (currentWdItem.word.includes(letter)) {
      arcadeAudio.playCorrect();
      const allRevealed = currentWdItem.word.split("").every((ch) => nextSet.has(ch) || ch === " " || ch === "-");
      if (allRevealed) {
        const bonus = currentWdItem.points + wdLives * 30;
        setWdScore((prev) => prev + bonus);
        setWdWordsCleared((prev) => prev + 1);
        arcadeAudio.playVictory();
        setTimeout(() => {
          if (wdIndex + 1 < wdItems.length) {
            setWdIndex((prev) => prev + 1);
            setWdGuessedLetters(new Set());
          } else {
            finishWordDefender(wdScore + bonus, wdWordsCleared + 1);
          }
        }, 1200);
      }
    } else {
      arcadeAudio.playWrong();
      const nextLives = wdLives - 1;
      setWdLives(nextLives);
      if (nextLives <= 0) finishWordDefender(wdScore, wdWordsCleared);
    }
  };

  const finishWordDefender = (finalScore: number, cleared: number) => {
    const earnedXp = Math.round(finalScore / 3);
    const accuracy = wdItems.length > 0 ? Math.round((cleared / wdItems.length) * 100) : 0;
    saveGameResult("word_defender", "Academic Word Defender", finalScore, earnedXp, accuracy, cleared);
  };

  // --------------------------------------------------------------------------
  // GAME 5: CONCEPT MEMORY FLIP
  // --------------------------------------------------------------------------
  interface MemoryCard {
    cardId: string;
    pairId: string;
    text: string;
    isFlipped: boolean;
    isMatched: boolean;
  }
  const [mfCards, setMfCards] = useState<MemoryCard[]>([]);
  const [mfFlippedCards, setMfFlippedCards] = useState<number[]>([]);
  const [mfMoves, setMfMoves] = useState<number>(0);
  const [mfMatchedPairs, setMfMatchedPairs] = useState<number>(0);
  const [mfTimeLeft, setMfTimeLeft] = useState<number>(60);

  const startMemoryFlip = () => {
    const selectedPairs = [...MEMORY_CONCEPT_PAIRS].sort(() => Math.random() - 0.5).slice(0, 6);
    const cards: MemoryCard[] = [];
    selectedPairs.forEach((pair, idx) => {
      cards.push({ cardId: `c-${idx}-A`, pairId: pair.id, text: pair.cardA, isFlipped: false, isMatched: false });
      cards.push({ cardId: `c-${idx}-B`, pairId: pair.id, text: pair.cardB, isFlipped: false, isMatched: false });
    });
    setMfCards(cards.sort(() => Math.random() - 0.5));
    setMfFlippedCards([]);
    setMfMoves(0);
    setMfMatchedPairs(0);
    setMfTimeLeft(60);
    setActiveGame("memory_flip");
    arcadeAudio.playTap();
  };

  useEffect(() => {
    if (activeGame !== "memory_flip" || gameOverResult !== null) return;
    const timer = setInterval(() => {
      setMfTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishMemoryFlip();
          return 0;
        }
        if (prev <= 6) arcadeAudio.playTick();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeGame, gameOverResult, mfMatchedPairs, mfMoves]);

  const finishMemoryFlip = () => {
    const finalScore = mfMatchedPairs * 150 + Math.max(0, mfTimeLeft * 10) - mfMoves * 5;
    const earnedXp = Math.max(30, Math.round(finalScore / 3));
    const accuracy = mfMoves > 0 ? Math.min(100, Math.round((mfMatchedPairs * 2 / mfMoves) * 100)) : 0;
    saveGameResult("memory_flip", "Concept Memory Flip", Math.max(0, finalScore), earnedXp, accuracy, mfMatchedPairs);
  };

  const handleCardClick = (index: number) => {
    if (mfFlippedCards.length >= 2 || mfCards[index].isFlipped || mfCards[index].isMatched) return;
    arcadeAudio.playTap();
    const newCards = [...mfCards];
    newCards[index].isFlipped = true;
    setMfCards(newCards);
    const nextFlipped = [...mfFlippedCards, index];
    setMfFlippedCards(nextFlipped);

    if (nextFlipped.length === 2) {
      setMfMoves((prev) => prev + 1);
      const [firstIdx, secondIdx] = nextFlipped;
      if (newCards[firstIdx].pairId === newCards[secondIdx].pairId) {
        arcadeAudio.playCorrect();
        newCards[firstIdx].isMatched = true;
        newCards[secondIdx].isMatched = true;
        const nextMatched = mfMatchedPairs + 1;
        setMfMatchedPairs(nextMatched);
        setMfFlippedCards([]);
        if (nextMatched >= 6) setTimeout(() => finishMemoryFlip(), 800);
      } else {
        arcadeAudio.playWrong();
        setTimeout(() => {
          newCards[firstIdx].isFlipped = false;
          newCards[secondIdx].isFlipped = false;
          setMfCards([...newCards]);
          setMfFlippedCards([]);
        }, 900);
      }
    }
  };

  // --------------------------------------------------------------------------
  // GAME 6: CHEMICAL REACTION BALANCER (ALCHEMY TYCOON)
  // --------------------------------------------------------------------------
  const [rbLevels, setRbLevels] = useState<ReactionBalancerLevel[]>([]);
  const [rbIndex, setRbIndex] = useState<number>(0);
  const [rbReactantCoeffs, setRbReactantCoeffs] = useState<number[]>([]);
  const [rbProductCoeffs, setRbProductCoeffs] = useState<number[]>([]);
  const [rbScore, setRbScore] = useState<number>(0);
  const [rbTimeLeft, setRbTimeLeft] = useState<number>(60);

  const startReactionBalancer = () => {
    const shuffled = [...REACTION_BALANCER_LEVELS].sort(() => Math.random() - 0.5);
    setRbLevels(shuffled);
    setRbIndex(0);
    setRbReactantCoeffs(shuffled[0].reactants.map(() => 1));
    setRbProductCoeffs(shuffled[0].products.map(() => 1));
    setRbScore(0);
    setRbTimeLeft(60);
    setActiveGame("reaction_balancer");
    arcadeAudio.playTap();
  };

  useEffect(() => {
    if (activeGame !== "reaction_balancer" || gameOverResult !== null) return;
    const timer = setInterval(() => {
      setRbTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishReactionBalancer();
          return 0;
        }
        if (prev <= 6) arcadeAudio.playTick();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeGame, gameOverResult, rbScore, rbIndex]);

  const finishReactionBalancer = () => {
    const earnedXp = Math.round(rbScore / 4);
    const accuracy = rbLevels.length > 0 ? Math.round((rbIndex / rbLevels.length) * 100) : 0;
    saveGameResult("reaction_balancer", "Chemical Equation Balancer", rbScore, earnedXp, accuracy, rbIndex);
  };

  const currentRbLevel = rbLevels[rbIndex] || null;

  // Calculate live atom totals on Left and Right
  const atomCounts = useMemo(() => {
    if (!currentRbLevel) return { left: {}, right: {}, isBalanced: false };
    const left: Record<string, number> = {};
    const right: Record<string, number> = {};

    currentRbLevel.reactants.forEach((r, idx) => {
      const coeff = rbReactantCoeffs[idx] || 1;
      Object.entries(r.atoms).forEach(([elem, count]) => {
        left[elem] = (left[elem] || 0) + count * coeff;
      });
    });

    currentRbLevel.products.forEach((p, idx) => {
      const coeff = rbProductCoeffs[idx] || 1;
      Object.entries(p.atoms).forEach(([elem, count]) => {
        right[elem] = (right[elem] || 0) + count * coeff;
      });
    });

    const allElements = Array.from(new Set([...Object.keys(left), ...Object.keys(right)]));
    const isBalanced = allElements.every((el) => left[el] === right[el]);

    return { left, right, isBalanced };
  }, [currentRbLevel, rbReactantCoeffs, rbProductCoeffs]);

  const verifyBalancedEquation = () => {
    if (!atomCounts.isBalanced || !currentRbLevel) {
      arcadeAudio.playWrong();
      return;
    }
    arcadeAudio.playCorrect();
    const nextScore = rbScore + currentRbLevel.points;
    setRbScore(nextScore);

    if (rbIndex + 1 < rbLevels.length) {
      const nextIdx = rbIndex + 1;
      setRbIndex(nextIdx);
      setRbReactantCoeffs(rbLevels[nextIdx].reactants.map(() => 1));
      setRbProductCoeffs(rbLevels[nextIdx].products.map(() => 1));
      setRbTimeLeft((prev) => prev + 15);
    } else {
      finishReactionBalancer();
    }
  };

  // --------------------------------------------------------------------------
  // GAME 7: CIRCUIT MASTER & LOGIC GATE PUZZLE
  // --------------------------------------------------------------------------
  const [cpLevels, setCpLevels] = useState<CircuitMasterPuzzle[]>([]);
  const [cpIndex, setCpIndex] = useState<number>(0);
  const [cpTiles, setCpTiles] = useState<CircuitTile[]>([]);
  const [cpScore, setCpScore] = useState<number>(0);
  const [cpTimeLeft, setCpTimeLeft] = useState<number>(60);
  const [cpIsSolved, setCpIsSolved] = useState<boolean>(false);

  const startCircuitMaster = () => {
    const list = [...CIRCUIT_PUZZLES];
    setCpLevels(list);
    setCpIndex(0);
    setCpTiles(JSON.parse(JSON.stringify(list[0].tiles)));
    setCpScore(0);
    setCpTimeLeft(60);
    setCpIsSolved(false);
    setActiveGame("circuit_master");
    arcadeAudio.playTap();
  };

  useEffect(() => {
    if (activeGame !== "circuit_master" || gameOverResult !== null) return;
    const timer = setInterval(() => {
      setCpTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishCircuitMaster();
          return 0;
        }
        if (prev <= 6) arcadeAudio.playTick();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeGame, gameOverResult, cpScore, cpIndex]);

  const finishCircuitMaster = () => {
    const earnedXp = Math.round(cpScore / 3);
    const accuracy = cpLevels.length > 0 ? Math.round(((cpIndex + (cpIsSolved ? 1 : 0)) / cpLevels.length) * 100) : 0;
    saveGameResult("circuit_master", "Circuit Master & Logic Grid", cpScore, earnedXp, accuracy, cpIndex);
  };

  const handleRotateTile = (index: number) => {
    if (cpIsSolved) return;
    arcadeAudio.playTap();
    const updated = [...cpTiles];
    updated[index].rotation = (updated[index].rotation + 90) % 360;
    setCpTiles(updated);

    // Check if all tiles match valid rotations
    const allValid = updated.every((t) => t.validRotations.includes(t.rotation));
    if (allValid) {
      setCpIsSolved(true);
      arcadeAudio.playVictory();
      const points = cpLevels[cpIndex].points;
      setCpScore((prev) => prev + points);

      setTimeout(() => {
        if (cpIndex + 1 < cpLevels.length) {
          const nextIdx = cpIndex + 1;
          setCpIndex(nextIdx);
          setCpTiles(JSON.parse(JSON.stringify(cpLevels[nextIdx].tiles)));
          setCpIsSolved(false);
          setCpTimeLeft((prev) => prev + 25);
        } else {
          finishCircuitMaster();
        }
      }, 1200);
    }
  };

  // --------------------------------------------------------------------------
  // GAME 8: HISTORY TIMELINE & GEOMAP RUSH
  // --------------------------------------------------------------------------
  const [tlChallenges, setTlChallenges] = useState<TimelineChallenge[]>([]);
  const [tlIndex, setTlIndex] = useState<number>(0);
  const [tlEvents, setTlEvents] = useState<TimelineEventItem[]>([]);
  const [tlScore, setTlScore] = useState<number>(0);
  const [tlTimeLeft, setTlTimeLeft] = useState<number>(50);

  const startHistoryTimeline = () => {
    const list = [...TIMELINE_CHALLENGES].sort(() => Math.random() - 0.5);
    setTlChallenges(list);
    setTlIndex(0);
    setTlEvents([...list[0].events].sort(() => Math.random() - 0.5));
    setTlScore(0);
    setTlTimeLeft(50);
    setActiveGame("history_timeline");
    arcadeAudio.playTap();
  };

  useEffect(() => {
    if (activeGame !== "history_timeline" || gameOverResult !== null) return;
    const timer = setInterval(() => {
      setTlTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishHistoryTimeline();
          return 0;
        }
        if (prev <= 6) arcadeAudio.playTick();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeGame, gameOverResult, tlScore, tlIndex]);

  const finishHistoryTimeline = () => {
    const earnedXp = Math.round(tlScore / 4);
    const accuracy = tlChallenges.length > 0 ? Math.round((tlIndex / tlChallenges.length) * 100) : 0;
    saveGameResult("history_timeline", "History Timeline Chronology", tlScore, earnedXp, accuracy, tlIndex);
  };

  const handleMoveTimelineItem = (idx: number, direction: "up" | "down") => {
    arcadeAudio.playTap();
    const updated = [...tlEvents];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setTlEvents(updated);
  };

  const verifyTimelineOrder = () => {
    const isSorted = tlEvents.every((e, i, arr) => i === 0 || arr[i - 1].year <= e.year);
    if (isSorted) {
      arcadeAudio.playVictory();
      const points = tlChallenges[tlIndex].points;
      setTlScore((prev) => prev + points);

      if (tlIndex + 1 < tlChallenges.length) {
        const nextIdx = tlIndex + 1;
        setTlIndex(nextIdx);
        setTlEvents([...tlChallenges[nextIdx].events].sort(() => Math.random() - 0.5));
        setTlTimeLeft((prev) => prev + 20);
      } else {
        finishHistoryTimeline();
      }
    } else {
      arcadeAudio.playWrong();
    }
  };

  // --------------------------------------------------------------------------
  // GAME 9: BIO-SORT CONVEYOR
  // --------------------------------------------------------------------------
  const [bsItems, setBsItems] = useState<BioSortItem[]>([]);
  const [bsIndex, setBsIndex] = useState<number>(0);
  const [bsScore, setBsScore] = useState<number>(0);
  const [bsCombo, setBsCombo] = useState<number>(0);
  const [bsTimeLeft, setBsTimeLeft] = useState<number>(40);

  const startBioSort = () => {
    const list = [...BIO_SORT_ITEMS].sort(() => Math.random() - 0.5);
    setBsItems(list);
    setBsIndex(0);
    setBsScore(0);
    setBsCombo(0);
    setBsTimeLeft(40);
    setActiveGame("bio_sort");
    arcadeAudio.playTap();
  };

  useEffect(() => {
    if (activeGame !== "bio_sort" || gameOverResult !== null) return;
    const timer = setInterval(() => {
      setBsTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishBioSort();
          return 0;
        }
        if (prev <= 5) arcadeAudio.playTick();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeGame, gameOverResult, bsScore, bsIndex, bsCombo]);

  const finishBioSort = () => {
    const earnedXp = Math.round(bsScore / 3);
    const accuracy = bsItems.length > 0 ? Math.round((bsIndex / bsItems.length) * 100) : 0;
    saveGameResult("bio_sort", "Bio-Sort Organelle Conveyor", bsScore, earnedXp, accuracy, bsCombo);
  };

  const handleBioSortBin = (bin: "plant" | "animal" | "bacteria" | "virus") => {
    if (bsIndex >= bsItems.length) return;
    const current = bsItems[bsIndex];

    if (current.targetBin === bin) {
      const nextCombo = bsCombo + 1;
      setBsCombo(nextCombo);
      setBsScore((prev) => prev + current.points * Math.min(nextCombo, 4));
      arcadeAudio.playCorrect();
      if (nextCombo >= 3) setTimeout(() => arcadeAudio.playCombo(nextCombo), 150);
    } else {
      setBsCombo(0);
      arcadeAudio.playWrong();
    }

    if (bsIndex + 1 < bsItems.length && bsTimeLeft > 0) {
      setBsIndex((prev) => prev + 1);
    } else {
      finishBioSort();
    }
  };

  // --------------------------------------------------------------------------
  // GAME 10: COORDINATE & GRAPH LASER SNIPER
  // --------------------------------------------------------------------------
  const [gsTargets, setGsTargets] = useState<GraphSniperTarget[]>([]);
  const [gsIndex, setGsIndex] = useState<number>(0);
  const [gsSlope, setGsSlope] = useState<number>(1);
  const [gsIntercept, setGsIntercept] = useState<number>(0);
  const [gsScore, setGsScore] = useState<number>(0);
  const [gsTimeLeft, setGsTimeLeft] = useState<number>(50);

  const startGraphSniper = () => {
    const list = [...GRAPH_SNIPER_TARGETS].sort(() => Math.random() - 0.5);
    setGsTargets(list);
    setGsIndex(0);
    setGsSlope(1);
    setGsIntercept(0);
    setGsScore(0);
    setGsTimeLeft(50);
    setActiveGame("graph_sniper");
    arcadeAudio.playTap();
  };

  useEffect(() => {
    if (activeGame !== "graph_sniper" || gameOverResult !== null) return;
    const timer = setInterval(() => {
      setGsTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishGraphSniper();
          return 0;
        }
        if (prev <= 6) arcadeAudio.playTick();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeGame, gameOverResult, gsScore, gsIndex]);

  const finishGraphSniper = () => {
    const earnedXp = Math.round(gsScore / 4);
    const accuracy = gsTargets.length > 0 ? Math.round((gsIndex / gsTargets.length) * 100) : 0;
    saveGameResult("graph_sniper", "Coordinate & Graph Laser Sniper", gsScore, earnedXp, accuracy, gsIndex);
  };

  const currentGsTarget = gsTargets[gsIndex] || null;

  const fireLaserSniper = () => {
    if (!currentGsTarget) return;
    const expectedY = gsSlope * currentGsTarget.targetPoint.x + gsIntercept;
    const isHit = Math.abs(expectedY - currentGsTarget.targetPoint.y) < 0.1;

    if (isHit) {
      arcadeAudio.playVictory();
      setGsScore((prev) => prev + currentGsTarget.points);

      if (gsIndex + 1 < gsTargets.length) {
        const nextIdx = gsIndex + 1;
        setGsIndex(nextIdx);
        setGsSlope(1);
        setGsIntercept(0);
        setGsTimeLeft((prev) => prev + 15);
      } else {
        finishGraphSniper();
      }
    } else {
      arcadeAudio.playWrong();
    }
  };

  // --------------------------------------------------------------------------
  // GAME 11: GRAMMAR & VOCAB SPELL-CASTER
  // --------------------------------------------------------------------------
  const [gqQuestions, setGqQuestions] = useState<GrammarQuestion[]>([]);
  const [gqIndex, setGqIndex] = useState<number>(0);
  const [gqScore, setGqScore] = useState<number>(0);
  const [gqCombo, setGqCombo] = useState<number>(0);
  const [gqTimeLeft, setGqTimeLeft] = useState<number>(45);
  const [gqSelectedOpt, setGqSelectedOpt] = useState<number | null>(null);

  const startGrammarSpell = () => {
    const list = [...GRAMMAR_SPELL_QUESTIONS].sort(() => Math.random() - 0.5);
    setGqQuestions(list);
    setGqIndex(0);
    setGqScore(0);
    setGqCombo(0);
    setGqTimeLeft(45);
    setGqSelectedOpt(null);
    setActiveGame("grammar_spell");
    arcadeAudio.playTap();
  };

  useEffect(() => {
    if (activeGame !== "grammar_spell" || gameOverResult !== null) return;
    const timer = setInterval(() => {
      setGqTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishGrammarSpell();
          return 0;
        }
        if (prev <= 6) arcadeAudio.playTick();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeGame, gameOverResult, gqScore, gqIndex, gqCombo]);

  const finishGrammarSpell = () => {
    const earnedXp = Math.round(gqScore / 4);
    const accuracy = gqQuestions.length > 0 ? Math.round((gqIndex / gqQuestions.length) * 100) : 0;
    saveGameResult("grammar_spell", "Grammar & Vocab Spell-Caster", gqScore, earnedXp, accuracy, gqCombo);
  };

  const handleGrammarAnswer = (optIdx: number) => {
    if (gqSelectedOpt !== null || gqQuestions.length === 0) return;
    setGqSelectedOpt(optIdx);
    const current = gqQuestions[gqIndex];

    if (optIdx === current.correctIndex) {
      const nextCombo = gqCombo + 1;
      setGqCombo(nextCombo);
      setGqScore((prev) => prev + current.points * Math.min(nextCombo, 4));
      arcadeAudio.playCorrect();
      if (nextCombo >= 3) setTimeout(() => arcadeAudio.playCombo(nextCombo), 150);
    } else {
      setGqCombo(0);
      arcadeAudio.playWrong();
    }

    setTimeout(() => {
      if (gqIndex + 1 < gqQuestions.length && gqTimeLeft > 0) {
        setGqIndex((prev) => prev + 1);
        setGqSelectedOpt(null);
      } else {
        finishGrammarSpell();
      }
    }, 850);
  };

  // --------------------------------------------------------------------------
  // GAME 12: ASSERTION-REASON LIGHTNING STORM (SUDDEN DEATH)
  // --------------------------------------------------------------------------
  const [arQuestions, setArQuestions] = useState<AssertionReasonItem[]>([]);
  const [arIndex, setArIndex] = useState<number>(0);
  const [arScore, setArScore] = useState<number>(0);
  const [arStreak, setArStreak] = useState<number>(0);
  const [arTimeLeft, setArTimeLeft] = useState<number>(15);
  const [arSelectedOpt, setArSelectedOpt] = useState<number | null>(null);

  const startAssertionStorm = () => {
    const list = [...ASSERTION_REASON_ITEMS].sort(() => Math.random() - 0.5);
    setArQuestions(list);
    setArIndex(0);
    setArScore(0);
    setArStreak(0);
    setArTimeLeft(15);
    setArSelectedOpt(null);
    setActiveGame("assertion_storm");
    arcadeAudio.playTap();
  };

  useEffect(() => {
    if (activeGame !== "assertion_storm" || gameOverResult !== null) return;
    const timer = setInterval(() => {
      setArTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishAssertionStorm();
          return 0;
        }
        if (prev <= 4) arcadeAudio.playTick();
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeGame, gameOverResult, arScore, arStreak, arIndex]);

  const finishAssertionStorm = () => {
    const earnedXp = Math.round(arScore / 3);
    const accuracy = arQuestions.length > 0 ? Math.round((arStreak / arQuestions.length) * 100) : 0;
    saveGameResult("assertion_storm", "Assertion-Reason Lightning Storm", arScore, earnedXp, accuracy, arStreak);
  };

  const handleAssertionAnswer = (optIdx: number) => {
    if (arSelectedOpt !== null || arQuestions.length === 0) return;
    setArSelectedOpt(optIdx);
    const current = arQuestions[arIndex];

    if (optIdx === current.correctIndex) {
      const nextStreak = arStreak + 1;
      setArStreak(nextStreak);
      setArScore((prev) => prev + current.points * nextStreak);
      arcadeAudio.playCorrect();
      if (nextStreak >= 2) setTimeout(() => arcadeAudio.playCombo(nextStreak), 150);

      setTimeout(() => {
        if (arIndex + 1 < arQuestions.length) {
          setArIndex((prev) => prev + 1);
          setArSelectedOpt(null);
          setArTimeLeft(Math.max(8, 15 - arIndex * 1.5)); // gets faster!
        } else {
          finishAssertionStorm();
        }
      }, 700);
    } else {
      arcadeAudio.playGameOver();
      setTimeout(() => {
        finishAssertionStorm();
      }, 600);
    }
  };

  // --------------------------------------------------------------------------
  // MASTER GAMES LOBBY DIRECTORY (12 UNIQUE GAMES)
  // --------------------------------------------------------------------------
  const ALL_ARCADE_GAMES = [
    {
      id: "periodic_blitz",
      title: "Periodic Table Blitz",
      category: "chemistry",
      subject: "Chemistry",
      description: "Match atomic symbols, periods, and electron shells against a countdown timer.",
      icon: Atom,
      badge: "Fast Attack",
      color: "from-pink-500 to-rose-600",
      bgGlow: "shadow-pink-500/20",
      onStart: startPeriodicBlitz
    },
    {
      id: "formula_rush",
      title: "Formula Rush",
      category: "physics",
      subject: "Physics & Math",
      description: "Assemble scrambled equation tokens into classic scientific formulas.",
      icon: Zap,
      badge: "Equation Builder",
      color: "from-amber-500 to-orange-600",
      bgGlow: "shadow-amber-500/20",
      onStart: startFormulaRush
    },
    {
      id: "speed_math",
      title: "Speed Math Matrix",
      category: "math",
      subject: "Mathematics",
      description: "Lightning-fast mental arithmetic, squares, roots & algebra with combo streaks.",
      icon: Sparkles,
      badge: "Mental Math",
      color: "from-indigo-500 to-purple-600",
      bgGlow: "shadow-indigo-500/20",
      onStart: startSpeedMath
    },
    {
      id: "word_defender",
      title: "Academic Word Defender",
      category: "recall",
      subject: "Biology & Humanities",
      description: "Active recall hangman: decode vital curriculum terminology using scientific clues.",
      icon: Shield,
      badge: "Active Recall",
      color: "from-emerald-500 to-teal-600",
      bgGlow: "shadow-emerald-500/20",
      onStart: startWordDefender
    },
    {
      id: "memory_flip",
      title: "Concept Memory Flip",
      category: "recall",
      subject: "All Subjects",
      description: "Card-matching memory puzzle pairing scientific laws, units, and core definitions.",
      icon: Layers,
      badge: "Visual Recall",
      color: "from-cyan-500 to-blue-600",
      bgGlow: "shadow-cyan-500/20",
      onStart: startMemoryFlip
    },
    {
      id: "reaction_balancer",
      title: "Chemical Reaction Balancer",
      category: "chemistry",
      subject: "Chemistry",
      description: "Adjust reactant and product stoichiometric coefficients to balance the reaction equation.",
      icon: FlaskConical,
      badge: "Alchemy Lab",
      color: "from-violet-500 to-purple-700",
      bgGlow: "shadow-purple-500/20",
      onStart: startReactionBalancer
    },
    {
      id: "circuit_master",
      title: "Circuit Master & Logic Grid",
      category: "physics",
      subject: "Physics & Electronics",
      description: "Rotate grid wire tiles and logic gates to complete the circuit and power the beacon.",
      icon: Cpu,
      badge: "Logic Circuit",
      color: "from-blue-500 to-indigo-600",
      bgGlow: "shadow-blue-500/20",
      onStart: startCircuitMaster
    },
    {
      id: "history_timeline",
      title: "History Timeline Chronology",
      category: "humanities",
      subject: "Social Science",
      description: "Arrange historical turning points and freedom struggle events into chronological order.",
      icon: Clock,
      badge: "Chronology",
      color: "from-amber-600 to-yellow-600",
      bgGlow: "shadow-amber-500/20",
      onStart: startHistoryTimeline
    },
    {
      id: "bio_sort",
      title: "Bio-Sort Organelle Conveyor",
      category: "biology",
      subject: "Biology",
      description: "Fast-sort moving organelles and structures into Plant, Animal, Bacteria, or Virus bins.",
      icon: Dna,
      badge: "Cell Biology",
      color: "from-emerald-500 to-green-600",
      bgGlow: "shadow-emerald-500/20",
      onStart: startBioSort
    },
    {
      id: "graph_sniper",
      title: "Coordinate Graph Laser Sniper",
      category: "math",
      subject: "Mathematics",
      description: "Adjust line slope and y-intercept to calculate trajectories and blast drone coordinates.",
      icon: Crosshair,
      badge: "Coordinate Grid",
      color: "from-red-500 to-rose-600",
      bgGlow: "shadow-red-500/20",
      onStart: startGraphSniper
    },
    {
      id: "grammar_spell",
      title: "Grammar & Vocab Spell-Caster",
      category: "humanities",
      subject: "English & Literature",
      description: "Spot figures of speech, active/passive voice, error identification, and Greek/Latin roots.",
      icon: Feather,
      badge: "Language Arts",
      color: "from-teal-500 to-cyan-600",
      bgGlow: "shadow-teal-500/20",
      onStart: startGrammarSpell
    },
    {
      id: "assertion_storm",
      title: "Assertion-Reason Lightning Storm",
      category: "all",
      subject: "Board Exam Special",
      description: "Sudden-Death mode: solve Assertion & Reason questions at increasing speeds. 1 mistake ends streak!",
      icon: AlertTriangle,
      badge: "Sudden Death",
      color: "from-fuchsia-500 to-pink-600",
      bgGlow: "shadow-pink-500/20",
      onStart: startAssertionStorm
    }
  ];

  const filteredGames = useMemo(() => {
    if (subjectFilter === "all") return ALL_ARCADE_GAMES;
    return ALL_ARCADE_GAMES.filter((g) => g.category === subjectFilter);
  }, [subjectFilter]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b13] text-slate-900 dark:text-slate-100 p-4 sm:p-8 relative overflow-hidden">
      <Confetti active={confettiActive} />

      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        {/* TOP BAR / HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 border border-white/20">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  EduArcade
                </h1>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  12 Game Modules
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Master NCERT formulas, reaction balancing, bio-taxonomy, coordinate graphs & board trivia through games.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleSound}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
              <span>{isMuted ? "Muted" : "Sound On"}</span>
            </button>

            {activeGame !== "lobby" ? (
              <button
                onClick={() => {
                  setActiveGame("lobby");
                  setGameOverResult(null);
                  arcadeAudio.playTap();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-800 shadow-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Arcade Lobby
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-800 shadow-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </Link>
            )}
          </div>
        </header>

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 0: ARCADE LOBBY */}
        {/* ------------------------------------------------------------------ */}
        {activeGame === "lobby" && (
          <div className="space-y-6">
            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Arcade XP</span>
                  <span className="text-base font-black text-slate-900 dark:text-white font-mono">+{stats.totalGameXp} XP</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Games Played</span>
                  <span className="text-base font-black text-slate-900 dark:text-white font-mono">{stats.gamesPlayed}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Best Streak</span>
                  <span className="text-base font-black text-slate-900 dark:text-white font-mono">{stats.bestCombo}x Streak</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Arcade Tier</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {stats.totalGameXp > 3000 ? "Grandmaster" : stats.totalGameXp > 1000 ? "Challenger" : "Scholar"}
                  </span>
                </div>
              </div>
            </div>

            {/* Subject Filters */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { id: "all", label: "🌟 All 12 Mini-Games" },
                { id: "chemistry", label: "🧪 Chemistry & Reactions" },
                { id: "physics", label: "⚡ Physics & Circuits" },
                { id: "math", label: "🔢 Math & Graph Laser" },
                { id: "biology", label: "🧬 Biology Taxonomy" },
                { id: "humanities", label: "🗺️ History & Grammar" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSubjectFilter(tab.id);
                    arcadeAudio.playTap();
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    subjectFilter === tab.id
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20"
                      : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGames.map((game, idx) => {
                const Icon = game.icon;
                const highScore = stats.highScores[game.id] || 0;

                return (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col justify-between relative group hover:border-indigo-500/50 transition-all overflow-hidden"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-white shadow-lg ${game.bgGlow}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {game.badge}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                          {game.subject}
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                          {game.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                          {game.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[8px] font-bold uppercase text-slate-400 block">Personal Best</span>
                        <span className="text-xs font-black text-amber-500 font-mono">
                          {highScore > 0 ? `${highScore} pts` : "Unplayed"}
                        </span>
                      </div>

                      <button
                        onClick={game.onStart}
                        className={`px-4 py-2 rounded-xl bg-gradient-to-r ${game.color} hover:brightness-110 text-white text-xs font-black shadow-md flex items-center gap-1.5 active:scale-95 transition-all`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Play
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* GAME 1: PERIODIC TABLE BLITZ */}
        {/* ------------------------------------------------------------------ */}
        {activeGame === "periodic_blitz" && pbQuestions[pbIndex] && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-500">
                  <Atom className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400">Periodic Blitz</span>
                  <p className="text-xs font-black text-slate-900 dark:text-white">Q {pbIndex + 1} of {pbQuestions.length}</p>
                </div>
              </div>
              {pbCombo > 1 && (
                <div className="px-3 py-1 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-500 font-black text-xs flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{pbCombo}x Combo</span>
                </div>
              )}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Score</span>
                  <span className="text-sm font-black text-pink-500 font-mono">{pbScore}</span>
                </div>
                <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-mono font-black text-xs ${
                  pbTimeLeft <= 10 ? "bg-red-500/15 border-red-500/40 text-red-500 animate-pulse" : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                }`}>
                  <Timer className="w-3.5 h-3.5" />
                  <span>{pbTimeLeft}s</span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20">
                {pbQuestions[pbIndex].category}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {pbQuestions[pbIndex].question}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pbQuestions[pbIndex].options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    disabled={pbSelectedOpt !== null}
                    onClick={() => handlePeriodicAnswer(optIdx)}
                    className={`p-4 rounded-2xl border-2 text-left font-bold text-sm transition-all ${
                      pbSelectedOpt !== null
                        ? optIdx === pbQuestions[pbIndex].correctIndex
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-500"
                          : optIdx === pbSelectedOpt
                          ? "bg-red-500/20 border-red-500 text-red-500"
                          : "opacity-40 border-transparent"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-pink-500/50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* GAME 2: FORMULA RUSH */}
        {/* ------------------------------------------------------------------ */}
        {activeGame === "formula_rush" && frLevels[frLevelIdx] && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400">Formula Rush</span>
                  <p className="text-xs font-black text-slate-900 dark:text-white">Level {frLevelIdx + 1} of {frLevels.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-black text-amber-500 font-mono">{frScore} pts</span>
                <span className="text-xs font-black font-mono px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {frTimeLeft}s
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {frLevels[frLevelIdx].title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{frLevels[frLevelIdx].description}</p>

              <div className="min-h-[70px] p-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-wrap gap-2">
                {frPlacedTokens.map((token, tIdx) => (
                  <button
                    key={tIdx}
                    onClick={() => handleRemovePlacedToken(token, tIdx)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-sm font-mono shadow-md"
                  >
                    {token}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {frAvailableTokens.map((token, tIdx) => (
                  <button
                    key={tIdx}
                    onClick={() => handlePickToken(token, tIdx)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:border-amber-500 border border-slate-200 dark:border-slate-700 font-mono font-bold text-sm"
                  >
                    {token}
                  </button>
                ))}
              </div>

              <button
                onClick={verifyFormula}
                disabled={frPlacedTokens.length === 0}
                className="w-full py-3.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm shadow-md"
              >
                Verify Equation
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* GAME 3: SPEED MATH MATRIX */}
        {/* ------------------------------------------------------------------ */}
        {activeGame === "speed_math" && smQuestion && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <span className="text-xs font-black text-slate-400 uppercase">Speed Math • {smQuestion.topic}</span>
              <span className="text-sm font-black text-indigo-500 font-mono">{smScore} pts • {smTimeLeft}s</span>
            </div>
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6">
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono py-4">
                {smQuestion.prompt}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {smQuestion.options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => handleSpeedMathAnswer(opt)}
                    className="py-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-black text-2xl hover:border-indigo-500"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* GAME 4: WORD DEFENDER */}
        {/* ------------------------------------------------------------------ */}
        {activeGame === "word_defender" && currentWdItem && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, idx) => (
                  <Heart key={idx} className={`w-5 h-5 ${idx < wdLives ? "text-red-500 fill-red-500" : "text-slate-300 dark:text-slate-700"}`} />
                ))}
              </div>
              <span className="text-sm font-black text-emerald-500 font-mono">{wdScore} pts</span>
            </div>
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-center">
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">"{currentWdItem.clue}"</p>
              <div className="flex flex-wrap justify-center gap-2 py-4">
                {currentWdItem.word.split("").map((letter, lIdx) => (
                  <div key={lIdx} className="w-10 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center font-mono font-black text-xl">
                    {wdGuessedLetters.has(letter) ? letter : "_"}
                  </div>
                ))}
              </div>
              <div className="space-y-1 max-w-lg mx-auto">
                {["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].map((row, rIdx) => (
                  <div key={rIdx} className="flex justify-center gap-1">
                    {row.split("").map((ch) => (
                      <button
                        key={ch}
                        disabled={wdGuessedLetters.has(ch)}
                        onClick={() => handleGuessLetter(ch)}
                        className="w-8 h-9 rounded-xl font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30"
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* GAME 5: CONCEPT MEMORY FLIP */}
        {/* ------------------------------------------------------------------ */}
        {activeGame === "memory_flip" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <span className="text-xs font-black text-cyan-500 uppercase">Matched {mfMatchedPairs} of 6 Pairs</span>
              <span className="text-xs font-black font-mono">Moves: {mfMoves} • {mfTimeLeft}s</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {mfCards.map((card, cIdx) => (
                <button
                  key={card.cardId}
                  onClick={() => handleCardClick(cIdx)}
                  className={`h-24 sm:h-28 p-2.5 rounded-2xl border-2 flex items-center justify-center text-center font-bold text-xs ${
                    card.isMatched
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-500"
                      : card.isFlipped
                      ? "bg-indigo-600 text-white border-indigo-500"
                      : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {card.isFlipped || card.isMatched ? card.text : "🧠"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* GAME 6: CHEMICAL REACTION BALANCER */}
        {/* ------------------------------------------------------------------ */}
        {activeGame === "reaction_balancer" && currentRbLevel && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400">Alchemy Lab • {currentRbLevel.type}</span>
                  <p className="text-xs font-black text-slate-900 dark:text-white">Reaction {rbIndex + 1} of {rbLevels.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-black text-purple-500 font-mono">{rbScore} pts</span>
                <span className="text-xs font-black font-mono px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {rbTimeLeft}s
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white text-center">
                {currentRbLevel.title}
              </h2>

              {/* Chemical Equation Builder with Step Buttons */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-center gap-3 text-lg font-mono font-black">
                {/* Reactants */}
                {currentRbLevel.reactants.map((r, rIdx) => (
                  <div key={rIdx} className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => {
                        arcadeAudio.playTap();
                        const next = [...rbReactantCoeffs];
                        next[rIdx] = Math.max(1, (next[rIdx] || 1) - 1);
                        setRbReactantCoeffs(next);
                      }}
                      className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-purple-600 dark:text-purple-400 font-extrabold text-lg">
                      {rbReactantCoeffs[rIdx]}
                    </span>
                    <button
                      onClick={() => {
                        arcadeAudio.playTap();
                        const next = [...rbReactantCoeffs];
                        next[rIdx] = Math.min(8, (next[rIdx] || 1) + 1);
                        setRbReactantCoeffs(next);
                      }}
                      className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <span className="pl-1 text-slate-900 dark:text-white">{r.formula}</span>
                    {rIdx < currentRbLevel.reactants.length - 1 && <span className="text-slate-400 pl-2">+</span>}
                  </div>
                ))}

                <span className="text-2xl text-purple-500 px-2 font-sans">➔</span>

                {/* Products */}
                {currentRbLevel.products.map((p, pIdx) => (
                  <div key={pIdx} className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => {
                        arcadeAudio.playTap();
                        const next = [...rbProductCoeffs];
                        next[pIdx] = Math.max(1, (next[pIdx] || 1) - 1);
                        setRbProductCoeffs(next);
                      }}
                      className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-purple-600 dark:text-purple-400 font-extrabold text-lg">
                      {rbProductCoeffs[pIdx]}
                    </span>
                    <button
                      onClick={() => {
                        arcadeAudio.playTap();
                        const next = [...rbProductCoeffs];
                        next[pIdx] = Math.min(8, (next[pIdx] || 1) + 1);
                        setRbProductCoeffs(next);
                      }}
                      className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <span className="pl-1 text-slate-900 dark:text-white">{p.formula}</span>
                    {pIdx < currentRbLevel.products.length - 1 && <span className="text-slate-400 pl-2">+</span>}
                  </div>
                ))}
              </div>

              {/* Atom Balance Ledger */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {Object.keys(atomCounts.left).map((elem) => {
                  const lCount = atomCounts.left[elem] || 0;
                  const rCount = atomCounts.right[elem] || 0;
                  const match = lCount === rCount;

                  return (
                    <div
                      key={elem}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        match ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500" : "bg-red-500/10 border-red-500/40 text-red-500"
                      }`}
                    >
                      <span className="text-xs font-bold uppercase block">{elem} Atoms</span>
                      <span className="text-base font-black font-mono">{lCount} ➔ {rCount}</span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={verifyBalancedEquation}
                disabled={!atomCounts.isBalanced}
                className={`w-full py-4 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${
                  atomCounts.isBalanced
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:scale-[1.01]"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-50"
                }`}
              >
                <Sparkles className="w-5 h-5" />
                {atomCounts.isBalanced ? "Ignite Balanced Reaction!" : "Equation Not Balanced Yet"}
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* GAME 7: CIRCUIT MASTER */}
        {/* ------------------------------------------------------------------ */}
        {activeGame === "circuit_master" && cpLevels[cpIndex] && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <span className="text-xs font-black uppercase text-blue-500">Circuit Master • {cpLevels[cpIndex].title}</span>
              <span className="text-sm font-black text-blue-500 font-mono">{cpScore} pts • {cpTimeLeft}s</span>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">{cpLevels[cpIndex].description}</p>

              {/* 3x3 Tile Grid */}
              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto p-4 bg-slate-100 dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700">
                {cpTiles.map((tile, tIdx) => (
                  <motion.button
                    key={tile.id}
                    animate={{ rotate: tile.rotation }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onClick={() => handleRotateTile(tIdx)}
                    className="h-24 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-2 shadow-sm hover:border-blue-500"
                  >
                    <span className="text-xs font-black">{tile.label}</span>
                  </motion.button>
                ))}
              </div>

              {cpIsSolved && (
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 font-black text-xs flex items-center justify-center gap-1.5 animate-pulse">
                  <CheckCircle2 className="w-4 h-4" /> Power Grid Online! Current Flowing!
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* GAME 8: HISTORY TIMELINE */}
        {/* ------------------------------------------------------------------ */}
        {activeGame === "history_timeline" && tlChallenges[tlIndex] && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <span className="text-xs font-black uppercase text-amber-500">Timeline • {tlChallenges[tlIndex].theme}</span>
              <span className="text-sm font-black text-amber-500 font-mono">{tlScore} pts • {tlTimeLeft}s</span>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Arrange these turning points in chronological order (earliest at top).
              </p>

              <div className="space-y-3">
                {tlEvents.map((evt, eIdx) => (
                  <div key={evt.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-sm">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{evt.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{evt.clue}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        disabled={eIdx === 0}
                        onClick={() => handleMoveTimelineItem(eIdx, "up")}
                        className="p-1 rounded-lg bg-white dark:bg-slate-700 disabled:opacity-20 hover:text-amber-500 text-xs"
                      >
                        ▲
                      </button>
                      <button
                        disabled={eIdx === tlEvents.length - 1}
                        onClick={() => handleMoveTimelineItem(eIdx, "down")}
                        className="p-1 rounded-lg bg-white dark:bg-slate-700 disabled:opacity-20 hover:text-amber-500 text-xs"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={verifyTimelineOrder}
                className="w-full py-4 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm shadow-xl"
              >
                Lock In Chronology
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* GAME 9: BIO-SORT CONVEYOR */}
        {/* ------------------------------------------------------------------ */}
        {activeGame === "bio_sort" && bsItems[bsIndex] && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <span className="text-xs font-black uppercase text-emerald-500">Bio-Sort Conveyor • Item {bsIndex + 1}/{bsItems.length}</span>
              <span className="text-sm font-black text-emerald-500 font-mono">{bsScore} pts • {bsTimeLeft}s</span>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white block">
                  {bsItems[bsIndex].name}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{bsItems[bsIndex].hint}</p>
              </div>

              <span className="text-xs font-black uppercase text-slate-400 block">Fast-Sort into Destination Bin:</span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => handleBioSortBin("plant")}
                  className="py-4 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-black text-xs transition-all active:scale-95"
                >
                  🌱 Plant Cell
                </button>
                <button
                  onClick={() => handleBioSortBin("animal")}
                  className="py-4 rounded-2xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/40 text-blue-600 dark:text-blue-400 font-black text-xs transition-all active:scale-95"
                >
                  🐾 Animal Cell
                </button>
                <button
                  onClick={() => handleBioSortBin("bacteria")}
                  className="py-4 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-600 dark:text-amber-400 font-black text-xs transition-all active:scale-95"
                >
                  🦠 Bacteria
                </button>
                <button
                  onClick={() => handleBioSortBin("virus")}
                  className="py-4 rounded-2xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-600 dark:text-purple-400 font-black text-xs transition-all active:scale-95"
                >
                  🧬 Virus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* GAME 10: COORDINATE & GRAPH LASER SNIPER */}
        {/* ------------------------------------------------------------------ */}
        {activeGame === "graph_sniper" && currentGsTarget && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <span className="text-xs font-black uppercase text-red-500">Laser Sniper • Target {gsIndex + 1}/{gsTargets.length}</span>
              <span className="text-sm font-black text-red-500 font-mono">{gsScore} pts • {gsTimeLeft}s</span>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 text-center">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{currentGsTarget.prompt}</p>

              <div className="p-6 rounded-2xl bg-slate-900 text-white font-mono border border-slate-700">
                <span className="text-3xl font-black text-red-400">
                  y = {gsSlope}x {gsIntercept >= 0 ? `+ ${gsIntercept}` : `- ${Math.abs(gsIntercept)}`}
                </span>
                <p className="text-[10px] text-slate-400 mt-2">
                  Target Coordinate: ({currentGsTarget.targetPoint.x}, {currentGsTarget.targetPoint.y})
                </p>
              </div>

              {/* Adjusters */}
              <div className="grid grid-cols-2 gap-4 text-left text-xs font-bold">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block mb-1">Slope (m): {gsSlope}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setGsSlope(prev => prev - 0.5)} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">-</button>
                    <button onClick={() => setGsSlope(prev => prev + 0.5)} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">+</button>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block mb-1">Intercept (c): {gsIntercept}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setGsIntercept(prev => prev - 1)} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">-</button>
                    <button onClick={() => setGsIntercept(prev => prev + 1)} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">+</button>
                  </div>
                </div>
              </div>

              <button
                onClick={fireLaserSniper}
                className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2"
              >
                <Crosshair className="w-5 h-5" /> Fire Coordinate Laser!
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* GAME 11: GRAMMAR & VOCAB SPELL-CASTER */}
        {/* ------------------------------------------------------------------ */}
        {activeGame === "grammar_spell" && gqQuestions[gqIndex] && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <span className="text-xs font-black uppercase text-teal-500">Spell-Caster • {gqQuestions[gqIndex].type}</span>
              <span className="text-sm font-black text-teal-500 font-mono">{gqScore} pts • {gqTimeLeft}s</span>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {gqQuestions[gqIndex].question}
              </h2>
              <div className="space-y-2.5">
                {gqQuestions[gqIndex].options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    disabled={gqSelectedOpt !== null}
                    onClick={() => handleGrammarAnswer(optIdx)}
                    className="w-full p-4 rounded-2xl border text-left font-bold text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-teal-500 transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* GAME 12: ASSERTION-REASON LIGHTNING STORM */}
        {/* ------------------------------------------------------------------ */}
        {activeGame === "assertion_storm" && arQuestions[arIndex] && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-500 font-black text-[10px] uppercase">
                  ⚡ Sudden Death
                </span>
                <span className="text-xs font-bold text-slate-400">Streak: {arStreak}</span>
              </div>
              <span className="text-sm font-black text-pink-500 font-mono">{arScore} pts • {arTimeLeft}s</span>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2">
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  <strong>Assertion (A):</strong> {arQuestions[arIndex].assertion}
                </p>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  <strong>Reason (R):</strong> {arQuestions[arIndex].reason}
                </p>
              </div>

              <div className="space-y-2">
                {arQuestions[arIndex].options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    disabled={arSelectedOpt !== null}
                    onClick={() => handleAssertionAnswer(optIdx)}
                    className="w-full p-3.5 rounded-2xl border text-left font-bold text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-pink-500 transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* GAME OVER & VICTORY MODAL */}
        {/* ------------------------------------------------------------------ */}
        {gameOverResult && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6"
            >
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/25 border border-white/30">
                {gameOverResult.score > 0 ? "🏆" : "⚡"}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">Round Finished</span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {gameOverResult.gameTitle}
                </h2>
                {gameOverResult.isNewHighScore && (
                  <span className="inline-block text-[10px] font-black uppercase px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 animate-pulse mt-1">
                    🎉 New High Score Record!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Score</span>
                  <span className="text-base font-black text-slate-900 dark:text-white font-mono">{gameOverResult.score}</span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[9px] font-bold text-amber-500 uppercase block">XP Awarded</span>
                  <span className="text-base font-black text-amber-500 font-mono">+{gameOverResult.xpEarned}</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Accuracy</span>
                  <span className="text-base font-black text-slate-900 dark:text-white font-mono">{gameOverResult.accuracy}%</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setGameOverResult(null);
                    if (gameOverResult.gameId === "periodic_blitz") startPeriodicBlitz();
                    else if (gameOverResult.gameId === "formula_rush") startFormulaRush();
                    else if (gameOverResult.gameId === "speed_math") startSpeedMath();
                    else if (gameOverResult.gameId === "word_defender") startWordDefender();
                    else if (gameOverResult.gameId === "memory_flip") startMemoryFlip();
                    else if (gameOverResult.gameId === "reaction_balancer") startReactionBalancer();
                    else if (gameOverResult.gameId === "circuit_master") startCircuitMaster();
                    else if (gameOverResult.gameId === "history_timeline") startHistoryTimeline();
                    else if (gameOverResult.gameId === "bio_sort") startBioSort();
                    else if (gameOverResult.gameId === "graph_sniper") startGraphSniper();
                    else if (gameOverResult.gameId === "grammar_spell") startGrammarSpell();
                    else if (gameOverResult.gameId === "assertion_storm") startAssertionStorm();
                  }}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-4 h-4" /> Play Again
                </button>
                <button
                  onClick={() => {
                    setGameOverResult(null);
                    setActiveGame("lobby");
                  }}
                  className="flex-1 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all"
                >
                  Arcade Lobby
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
