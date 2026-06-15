"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, X, Layers, Clock, Loader2, Sparkles, Home, ArrowRight, RotateCcw, Trophy, BookOpen, Search, SortAsc, Flame } from "lucide-react";
import { FlashcardDeck, getDecks, saveDeck, deleteDeck } from "@/lib/flashcards";

export default function FlashcardsHub() {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "mastery" | "name">("recent");

  // Form State
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [classLevel, setClassLevel] = useState("10");

  const [boxCounts, setBoxCounts] = useState<number[]>([0, 0, 0, 0, 0]);

  useEffect(() => {
    setDecks(getDecks());
    const savedClass = localStorage.getItem("edutrack_class");
    if (savedClass) setClassLevel(savedClass);
  }, []);

  useEffect(() => {
    const counts = [0, 0, 0, 0, 0];
    decks.forEach(deck => {
      deck.cards.forEach(card => {
        const cardId = card.id || `card_${card.front}`;
        const stored = localStorage.getItem(`edutrack_leitner_${deck.id}_${cardId}`);
        const box = stored ? parseInt(stored, 10) : 1;
        const index = Math.max(1, Math.min(5, box)) - 1;
        counts[index]++;
      });
    });
    setBoxCounts(counts);
  }, [decks]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !subject) return;
    setLoading(true);
    try {
      const res = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, subject, classLevel, count: 10 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const newDeck: FlashcardDeck = {
        id: Date.now().toString(),
        title: topic,
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
        const pa = a.cards.filter(c => c.status === "mastered").length / a.cards.length;
        const pb = b.cards.filter(c => c.status === "mastered").length / b.cards.length;
        return pb - pa;
      }
      return a.title.localeCompare(b.title);
    });

  // Stats
  const totalCards = decks.reduce((s, d) => s + d.cards.length, 0);
  const masteredCards = decks.reduce((s, d) => s + d.cards.filter(c => c.status === "mastered").length, 0);
  const overallMastery = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

  const subjectColors: Record<string, string> = {
    Science: "from-emerald-500 to-teal-600",
    Mathematics: "from-blue-500 to-indigo-600",
    History: "from-amber-500 to-orange-600",
    Geography: "from-green-500 to-emerald-600",
    English: "from-violet-500 to-purple-600",
  };

  return (
    <div className="space-y-6 pb-20">

      {/* ── HEADER ── */}
      <header className="relative p-6 md:p-8 rounded-[2rem] overflow-hidden bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-800/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-fuchsia-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-indigo-400 tracking-tight flex items-center gap-3 mb-2">
            <div className="bg-fuchsia-500/20 p-2.5 rounded-2xl border border-fuchsia-500/30">
              <Layers className="w-7 h-7 text-fuchsia-400" />
            </div>
            AI Flashcards
          </h1>
          <p className="text-slate-400 font-medium">Master concepts quickly with smart spaced repetition.</p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <Link href="/dashboard" className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-colors border border-white/10">
            <Home className="w-5 h-5" />
          </Link>
          <button onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-indigo-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 hover:-translate-y-0.5 transition-all">
            <Sparkles className="w-5 h-5" /> Generate Deck
          </button>
        </div>
      </header>

      {/* ── STATS ROW ── */}
      {decks.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Decks", value: decks.length, icon: <Layers className="w-5 h-5 text-fuchsia-500" />, color: "bg-fuchsia-50 dark:bg-fuchsia-900/20 border-fuchsia-100 dark:border-fuchsia-900/50" },
            { label: "Total Cards", value: totalCards, icon: <BookOpen className="w-5 h-5 text-indigo-500" />, color: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/50" },
            { label: "Overall Mastery", value: `${overallMastery}%`, icon: <Trophy className="w-5 h-5 text-amber-500" />, color: "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/50" },
          ].map(stat => (
            <div key={stat.label} className={`${stat.color} border rounded-2xl p-4 flex items-center gap-3`}>
              <div className="shrink-0">{stat.icon}</div>
              <div>
                <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">{stat.value}</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── LEITNER BOX DISTRIBUTION ── */}
      {decks.length > 0 && (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 p-6 rounded-[2rem] shadow-xl text-white">
          <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-indigo-400 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Spaced Repetition Stats Hub
          </h3>
          
          <div className="grid grid-cols-5 gap-3 h-48 items-end pt-6 border-b border-slate-800 pb-2">
            {boxCounts.map((count, idx) => {
              const maxCount = Math.max(...boxCounts, 1);
              const heightPercent = Math.round((count / maxCount) * 85) + 5;
              const configs = [
                { label: "Box 1", desc: "Daily", color: "from-rose-500 to-red-600 shadow-rose-500/20" },
                { label: "Box 2", desc: "2d Spacing", color: "from-orange-500 to-amber-600 shadow-orange-500/20" },
                { label: "Box 3", desc: "5d Spacing", color: "from-amber-400 to-orange-500 shadow-amber-400/20" },
                { label: "Box 4", desc: "9d Spacing", color: "from-indigo-500 to-purple-600 shadow-indigo-500/20" },
                { label: "Box 5", desc: "Mastered", color: "from-emerald-400 to-teal-500 shadow-emerald-500/20" }
              ];
              const config = configs[idx];

              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end group">
                  <span className="text-xs font-black text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-2">
                    {count} card{count !== 1 ? 's' : ''}
                  </span>
                  <div 
                    className={`w-full rounded-2xl bg-gradient-to-t ${config.color} shadow-lg transition-all duration-500 hover:scale-[1.03] flex items-center justify-center text-xs font-black text-white/40 group-hover:text-white`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    {count > 0 && <span className="drop-shadow-md text-xs">{count}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-5 gap-2 text-center pt-3 text-[10px] md:text-xs font-bold text-slate-400">
            {[
              { label: "Box 1", desc: "Daily", badge: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
              { label: "Box 2", desc: "2d Spacing", badge: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
              { label: "Box 3", desc: "5d Spacing", badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
              { label: "Box 4", desc: "9d Spacing", badge: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
              { label: "Box 5", desc: "Mastered 🏆", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" }
            ].map((box, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black tracking-widest uppercase ${box.badge}`}>
                  {box.label}
                </span>
                <span className="text-[10px] opacity-60 leading-none">{box.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SEARCH + SORT ── */}
      {decks.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search decks..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
            />
          </div>
          <div className="flex gap-2">
            {(["recent", "mastery", "name"] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                  sortBy === s
                    ? "bg-fuchsia-600 text-white shadow-md"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-fuchsia-400"
                }`}>
                {s === "recent" ? "⏱ Recent" : s === "mastery" ? "🏆 Mastery" : "🔤 A–Z"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── DECK GRID ── */}
      {decks.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] p-16 text-center flex flex-col items-center justify-center min-h-[380px]">
          <div className="w-20 h-20 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-3xl flex items-center justify-center mb-6 rotate-6 shadow-inner">
            <Brain className="w-10 h-10 text-fuchsia-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Decks Yet</h2>
          <p className="text-slate-500 max-w-sm mx-auto mb-8">Tell the AI what you're studying and it will generate a custom flashcard deck instantly.</p>
          <button onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg hover:shadow-fuchsia-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Create Your First Deck
          </button>
        </motion.div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No decks match "{search}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((deck, i) => {
            const mastered = deck.cards.filter(c => c.status === "mastered").length;
            const total = deck.cards.length;
            const progress = Math.round((mastered / total) * 100);
            const gradient = subjectColors[deck.subject] || "from-fuchsia-500 to-indigo-600";
            const isNew = !deck.lastStudied;

            return (
              <Link href={`/flashcards/${deck.id}`} key={deck.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-fuchsia-300 dark:hover:border-fuchsia-700/50 transition-all overflow-hidden h-full flex flex-col"
                >
                  {/* Color accent top bar */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />

                  {/* Delete button */}
                  <button onClick={(e) => handleDelete(e, deck.id)}
                    className="absolute top-5 right-4 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all z-10">
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="p-5 flex flex-col flex-1 gap-4">
                    {/* Subject badge + new label */}
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-3 py-1 bg-gradient-to-r ${gradient} text-white text-xs font-bold rounded-full`}>
                        {deck.subject}
                      </span>
                      {isNew && (
                        <span className="inline-block px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full">
                          New
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug pr-6">{deck.title}</h3>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> {total} cards</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(deck.createdAt || Date.now()).toLocaleDateString()}</span>
                      {deck.lastStudied && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <Flame className="w-3.5 h-3.5" /> Studied
                        </span>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="mt-auto space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Mastery</span>
                        <span className={progress === 100 ? "text-emerald-500" : "text-fuchsia-600 dark:text-fuchsia-400"}>{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}
                          style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Study Now <ArrowRight className="w-4 h-4" />
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {mastered}/{total} mastered
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}

          {/* Add new deck card */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: filtered.length * 0.05 }}
            onClick={() => setIsModalOpen(true)}
            className="group border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-fuchsia-400 dark:hover:border-fuchsia-600 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-fuchsia-500 transition-all min-h-[200px] bg-white/50 dark:bg-slate-900/50"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:bg-fuchsia-50 dark:group-hover:bg-fuchsia-900/20 flex items-center justify-center transition-colors">
              <Sparkles className="w-7 h-7 group-hover:scale-110 transition-transform" />
            </div>
            <p className="font-bold text-sm">Generate New Deck</p>
          </motion.button>
        </div>
      )}

      {/* ── GENERATE MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-fuchsia-600 to-indigo-600">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Generate Flashcard Deck
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleGenerate} className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Topic / Chapter</label>
                  <input
                    autoFocus required value={topic} onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. Life Processes, Acids & Bases, Quadratic Equations"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 font-medium text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Subject</label>
                    <select required value={subject} onChange={e => setSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 font-medium text-sm appearance-none">
                      <option value="" disabled>Select</option>
                      <option value="Science">Science</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="History">History</option>
                      <option value="Geography">Geography</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Class</label>
                    <select required value={classLevel} onChange={e => setClassLevel(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 font-medium text-sm appearance-none">
                      {["6","7","8","9","10"].map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-fuchsia-500/30 transition-all disabled:opacity-70">
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><Sparkles className="w-5 h-5" /> Generate Magic ✨</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
