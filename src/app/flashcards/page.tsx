"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, X, Layers, Clock, Loader2, Sparkles, Home, ArrowRight, RotateCcw, Trophy, BookOpen, Search, SortAsc, Flame, Zap, Plus, Filter } from "lucide-react";
import { FlashcardDeck, getDecks, saveDeck, deleteDeck } from "@/lib/flashcards";

export default function FlashcardsHub() {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "mastery" | "name" | "due">("recent");

  // Form State
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [classLevel, setClassLevel] = useState("10");
  const [generateMode, setGenerateMode] = useState<"topic" | "text">("topic");
  const [sourceText, setSourceText] = useState("");

  const [boxCounts, setBoxCounts] = useState<number[]>([0, 0, 0, 0, 0]);

  const cardsDueToday = decks.reduce((total, deck) => {
    return total + deck.cards.filter(c => !c.nextReviewDate || c.nextReviewDate <= Date.now()).length;
  }, 0);

  useEffect(() => {
    setDecks(getDecks());
    const savedClass = localStorage.getItem("edutrack_class");
    if (savedClass) setClassLevel(savedClass);
  }, []);

  useEffect(() => {
    const counts = [0, 0, 0, 0, 0];
    decks.forEach(deck => {
      deck.cards.forEach(card => {
        let box = 1;
        if (card.interval) {
          if (card.interval <= 1) box = 1;
          else if (card.interval <= 3) box = 2;
          else if (card.interval <= 7) box = 3;
          else if (card.interval <= 14) box = 4;
          else box = 5;
        }
        const index = Math.max(1, Math.min(5, box)) - 1;
        counts[index]++;
      });
    });
    setBoxCounts(counts);
  }, [decks]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (generateMode === "topic" && (!topic || !subject)) return;
    if (generateMode === "text" && (!sourceText || !subject)) return;
    
    setLoading(true);
    try {
      const bodyPayload = generateMode === "text" 
        ? { sourceText, subject, classLevel, count: 10 }
        : { topic, subject, classLevel, count: 10 };

      const res = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      const newDeck: FlashcardDeck = {
        id: Date.now().toString(),
        title: generateMode === "topic" ? topic : "From Text Extract",
        subject,
        createdAt: Date.now(),
        cards: data.flashcards.map((c: any, i: number) => ({
          id: `card_${Date.now()}_${i}`,
          front: c.front,
          back: c.back,
          status: "new"
        }))
      };
      saveDeck(newDeck);
      setDecks(getDecks());
      setIsModalOpen(false);
      setTopic("");
      setSubject("");
    } catch (err: any) {
      alert("Failed to generate: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Delete this deck?")) {
      deleteDeck(id);
      setDecks(getDecks());
    }
  };

  // Filter + sort
  const filtered = decks
    .filter(d =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.subject.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "recent") return (b.createdAt || 0) - (a.createdAt || 0);
      if (sortBy === "mastery") {
        const pa = a.cards.filter(c => c.status === "mastered").length / (a.cards.length || 1);
        const pb = b.cards.filter(c => c.status === "mastered").length / (b.cards.length || 1);
        return pb - pa;
      }
      if (sortBy === "due") {
        const dueA = a.cards.filter(c => !c.nextReviewDate || c.nextReviewDate <= Date.now()).length;
        const dueB = b.cards.filter(c => !c.nextReviewDate || c.nextReviewDate <= Date.now()).length;
        return dueB - dueA;
      }
      return a.title.localeCompare(b.title);
    });

  // Stats
  const totalCards = decks.reduce((s, d) => s + d.cards.length, 0);
  const masteredCards = decks.reduce((s, d) => s + d.cards.filter(c => c.status === "mastered").length, 0);
  const overallMastery = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

  const subjectColors: Record<string, string> = {
    Science: "from-emerald-500 via-teal-500 to-cyan-600",
    Mathematics: "from-blue-500 via-indigo-500 to-violet-600",
    History: "from-amber-500 via-orange-500 to-red-600",
    Geography: "from-green-500 via-emerald-500 to-teal-600",
    English: "from-violet-500 via-purple-500 to-fuchsia-600",
  };

  return (
    <div className="space-y-8 pb-24 font-sans">

      {/* ── HERO HEADER ── */}
      <header className="relative p-6 md:p-10 rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-[#090d24] border border-indigo-500/20 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[100px]" />
          <div className="absolute -bottom-24 -left-12 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px]" />
        </div>
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Zap className="w-3.5 h-3.5" /> Spaced Repetition Engine
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-fuchsia-300 tracking-tight flex items-center gap-4">
            <div className="bg-fuchsia-500/20 p-3 rounded-2xl border border-fuchsia-500/30 shadow-lg shadow-fuchsia-500/20">
              <Layers className="w-8 h-8 text-fuchsia-400" />
            </div>
            AI Flashcards Hub
          </h1>
          <p className="text-slate-400 font-medium text-sm md:text-base max-w-xl">
            Automated active recall decks powered by SM-2 spacing algorithms to keep concepts locked in long-term memory.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link href="/dashboard" className="p-3.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all border border-white/10 active:scale-95">
            <Home className="w-5 h-5" />
          </Link>
          <button onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2.5 bg-gradient-to-r from-fuchsia-500 via-indigo-600 to-cyan-500 text-white px-6 py-3.5 rounded-2xl font-extrabold shadow-xl shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40 hover:-translate-y-0.5 transition-all active:scale-95">
            <Sparkles className="w-5 h-5" /> Generate AI Deck
          </button>
        </div>
      </header>

      {/* ── DUE CARDS BANNER ── */}
      {cardsDueToday > 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-[2rem] p-6 text-white shadow-xl flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white/10 skew-x-12 pointer-events-none" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-white/20 p-3.5 rounded-2xl backdrop-blur-md">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black">Memory Review Ready!</h2>
              <p className="text-white/90 text-sm font-medium">You have {cardsDueToday} card{cardsDueToday !== 1 ? 's' : ''} scheduled for review today based on SM-2 spacing.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ✨ BENTO BOX STATS & LEITNER MATRIX ✨ */}
      {decks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          
          {/* Stats Column */}
          <div className="flex flex-col gap-4">
            {[
              { label: "Active Decks", value: decks.length, icon: <Layers className="w-5 h-5 text-fuchsia-400" />, color: "from-fuchsia-500/10 to-indigo-500/5 border-fuchsia-500/20" },
              { label: "Total Flashcards", value: totalCards, icon: <BookOpen className="w-5 h-5 text-indigo-400" />, color: "from-indigo-500/10 to-cyan-500/5 border-indigo-500/20" },
              { label: "Overall Retention", value: `${overallMastery}%`, icon: <Trophy className="w-5 h-5 text-amber-400" />, color: "from-amber-500/10 to-orange-500/5 border-amber-500/20" },
            ].map(stat => (
              <div key={stat.label} className={`bg-gradient-to-br ${stat.color} border rounded-3xl p-5 flex items-center gap-4 shadow-lg backdrop-blur-xl hover:scale-[1.02] transition-all`}>
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-white/10 shadow-sm">{stat.icon}</div>
                <div>
                  <p className="text-3xl font-black text-white leading-none mb-1">{stat.value}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Leitner Box Matrix Chart */}
          <div className="md:col-span-3 bg-slate-900/80 backdrop-blur-2xl border border-slate-800 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-indigo-400 flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                  <Layers className="w-5 h-5 text-indigo-400" />
                </div>
                Leitner Spaced Repetition Matrix
              </h3>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-slate-400">
                5-Box Distribution
              </span>
            </div>
            
            <div className="grid grid-cols-5 gap-3 h-48 items-end pt-6 border-b border-slate-800 pb-3 flex-1">
              {boxCounts.map((count, idx) => {
                const maxCount = Math.max(...boxCounts, 1);
                const heightPercent = Math.round((count / maxCount) * 85) + 5;
                const configs = [
                  { label: "Box 1", color: "from-rose-500 to-red-600 shadow-rose-500/30" },
                  { label: "Box 2", color: "from-orange-500 to-amber-600 shadow-orange-500/30" },
                  { label: "Box 3", color: "from-amber-400 to-orange-500 shadow-amber-400/30" },
                  { label: "Box 4", color: "from-indigo-500 to-purple-600 shadow-indigo-500/30" },
                  { label: "Box 5", color: "from-emerald-400 to-teal-500 shadow-emerald-500/30" }
                ];
                const config = configs[idx];

                return (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
                    <span className="absolute -top-8 text-xs font-black bg-slate-800 text-white px-2.5 py-1 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl z-10 pointer-events-none border border-slate-700">
                      {count} card{count !== 1 ? 's' : ''}
                    </span>
                    <div 
                      className={`w-full max-w-[4.5rem] rounded-2xl bg-gradient-to-t ${config.color} shadow-xl transition-all duration-500 group-hover:scale-105 flex items-end justify-center text-xs font-black text-white/50 pb-3 group-hover:text-white`}
                      style={{ height: `${heightPercent}%` }}
                    >
                      {count > 0 && <span className="drop-shadow-md text-xs font-mono">{count}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-5 gap-2 text-center pt-4 text-[10px] md:text-xs font-bold text-slate-400">
              {[
                { label: "Box 1", desc: "Daily", badge: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
                { label: "Box 2", desc: "2 Days", badge: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
                { label: "Box 3", desc: "5 Days", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
                { label: "Box 4", desc: "9 Days", badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
                { label: "Box 5", desc: "Mastered", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" }
              ].map((box, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black tracking-widest uppercase ${box.badge}`}>
                    {box.label}
                  </span>
                  <span className="opacity-70">{box.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── SEARCH + SORT CONTROLS ── */}
      {decks.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search decks..."
              className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-800 rounded-2xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Sort:
            </span>
            {(["recent", "mastery", "name", "due"] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold capitalize transition-all ${
                  sortBy === s
                    ? "bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white shadow-md shadow-fuchsia-500/20"
                    : "bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700"
                }`}>
                {s === "recent" ? "⏱ Recent" : s === "mastery" ? "⭐ Mastery" : s === "due" ? "⏳ Due" : "🔤 A–Z"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── DECK GRID ── */}
      {decks.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[2.5rem] p-16 text-center flex flex-col items-center justify-center min-h-[380px]">
          <div className="w-20 h-20 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
            <Brain className="w-10 h-10 text-fuchsia-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">No Decks Yet</h2>
          <p className="text-slate-400 max-w-sm mx-auto mb-8 font-medium text-sm">
            Enter a chapter or paste notes to generate custom flashcard decks with spaced repetition algorithms.
          </p>
          <button onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white px-8 py-3.5 rounded-2xl font-extrabold shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 hover:-translate-y-0.5 transition-all flex items-center gap-2 active:scale-95">
            <Sparkles className="w-5 h-5" /> Generate Your First Deck
          </button>
        </motion.div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-bold text-slate-400">No decks match "{search}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((deck, i) => {
            const mastered = deck.cards.filter(c => c.status === "mastered").length;
            const total = deck.cards.length || 1;
            const progress = Math.round((mastered / total) * 100);
            const gradient = subjectColors[deck.subject] || "from-fuchsia-500 via-purple-500 to-indigo-600";
            const isNew = !deck.lastStudied;

            return (
              <Link href={`/flashcards/${deck.id}`} key={deck.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                  whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative bg-slate-900/80 backdrop-blur-xl rounded-[2rem] border border-slate-800 shadow-xl hover:shadow-2xl hover:border-fuchsia-500/40 transition-all overflow-hidden h-full flex flex-col"
                >
                  {/* Subject top gradient stripe */}
                  <div className={`h-2 w-full bg-gradient-to-r ${gradient}`} />

                  {/* Delete button */}
                  <button onClick={(e) => handleDelete(e, deck.id)}
                    className="absolute top-5 right-5 p-2 bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-full transition-all border border-slate-700 opacity-0 group-hover:opacity-100 z-10">
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="p-6 flex flex-col flex-1 gap-4">
                    {/* Subject badge + label */}
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-3 py-1 bg-gradient-to-r ${gradient} text-white text-xs font-black rounded-full shadow-sm`}>
                        {deck.subject}
                      </span>
                      {isNew && (
                        <span className="inline-block px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-full">
                          New Deck
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-extrabold text-white leading-snug pr-6 group-hover:text-fuchsia-300 transition-colors">
                      {deck.title}
                    </h3>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-slate-400 font-bold">
                      <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-indigo-400" /> {total} cards</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-500" /> {new Date(deck.createdAt || Date.now()).toLocaleDateString()}</span>
                      {deck.lastStudied && (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Flame className="w-3.5 h-3.5" /> Studied
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-auto space-y-2">
                      <div className="flex justify-between text-xs font-extrabold">
                        <span className="text-slate-400">Mastery</span>
                        <span className={progress === 100 ? "text-emerald-400" : "text-fuchsia-400"}>{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5">
                        <div className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}
                          style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                      <span className="text-sm font-extrabold text-indigo-400 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                        Study Deck <ArrowRight className="w-4 h-4" />
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {mastered}/{total} mastered
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}

          {/* Create new deck tile */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: filtered.length * 0.05 }}
            onClick={() => setIsModalOpen(true)}
            className="group border-2 border-dashed border-slate-800 hover:border-fuchsia-500/50 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-fuchsia-400 transition-all min-h-[220px] bg-slate-900/30 hover:bg-slate-900/60"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-800 group-hover:bg-fuchsia-500/20 flex items-center justify-center transition-colors border border-slate-700 group-hover:border-fuchsia-500/30">
              <Plus className="w-7 h-7 group-hover:scale-110 transition-transform text-fuchsia-400" />
            </div>
            <p className="font-extrabold text-sm text-white">Generate Custom Deck</p>
          </motion.button>
        </div>
      )}

      {/* ── GENERATE DECK MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-indigo-500/30 overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-cyan-600">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Generate AI Flashcard Deck
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleGenerate} className="p-6 space-y-5">
                
                {/* Mode Selector */}
                <div className="flex bg-slate-800/80 p-1 rounded-2xl border border-slate-700">
                  <button type="button" onClick={() => setGenerateMode("topic")}
                    className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${generateMode === "topic" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>
                    By Topic / Chapter
                  </button>
                  <button type="button" onClick={() => setGenerateMode("text")}
                    className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all ${generateMode === "text" ? "bg-fuchsia-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>
                    From Text Paste
                  </button>
                </div>

                {generateMode === "topic" ? (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Topic / Chapter Title</label>
                    <input
                      autoFocus required value={topic} onChange={e => setTopic(e.target.value)}
                      placeholder="e.g. Life Processes, Trigonometry, Chemical Reactions"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 text-sm text-white font-medium placeholder-slate-500"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Source Notes / Text</label>
                    <textarea
                      autoFocus required value={sourceText} onChange={e => setSourceText(e.target.value)}
                      placeholder="Paste your study notes, textbook excerpt, or formula list..."
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm text-white font-medium placeholder-slate-500 resize-none"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Subject</label>
                    <select required value={subject} onChange={e => setSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 text-sm text-white font-bold">
                      <option value="" disabled>Select</option>
                      <option value="Science">Science</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="History">History</option>
                      <option value="Geography">Geography</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Class Level</label>
                    <select required value={classLevel} onChange={e => setClassLevel(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 text-sm text-white font-bold">
                      {["6","7","8","9","10"].map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-cyan-500 text-white font-extrabold py-4 rounded-2xl hover:shadow-lg hover:shadow-fuchsia-500/30 transition-all disabled:opacity-60 active:scale-95 text-sm">
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating AI Deck...</> : <><Sparkles className="w-5 h-5" /> Generate Magic Deck</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
