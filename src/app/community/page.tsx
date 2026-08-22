"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, Search, Filter, Plus, MessageSquare, ThumbsUp, CheckCircle, 
  Sparkles, Award, HelpCircle, Send, ArrowRight, Share2, Tag, BookOpen, 
  ChevronDown, ChevronUp, Bot, User, Check, Flame, Zap, Camera, ShieldCheck
} from "lucide-react";
import { 
  DoubtQuery, DoubtAnswer, getStoredDoubts, saveStoredDoubts 
} from "@/lib/community-store";
import { useAuth } from "@/context/AuthContext";
import { awardXp } from "@/lib/xp";
import { cn } from "@/lib/utils";

const SUBJECTS = ["All", "Physics", "Mathematics", "Chemistry", "Biology", "Computer Science", "English"] as const;
const GRADES = ["All Grades", "Class 9", "Class 10", "Class 11", "Class 12", "College"];
const EXAMS = ["All Exams", "CBSE", "JEE", "NEET", "ICSE", "SAT", "IGCSE"];

export default function CommunityPage() {
  const { user } = useAuth();
  const [doubts, setDoubts] = useState<DoubtQuery[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [selectedGrade, setSelectedGrade] = useState<string>("All Grades");
  const [selectedExam, setSelectedExam] = useState<string>("All Exams");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "solved" | "trending">("all");
  
  // Expanded Doubt view
  const [expandedDoubtId, setExpandedDoubtId] = useState<string | null>("doubt-1");
  const [replyText, setReplyText] = useState<{ [doubtId: string]: string }>({});
  const [isAnsweringAi, setIsAnsweringAi] = useState<{ [doubtId: string]: boolean }>({});

  // Ask Question Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSubject, setNewSubject] = useState<DoubtQuery["subject"]>("Physics");
  const [newGrade, setNewGrade] = useState("Class 10");
  const [newExam, setNewExam] = useState("CBSE");
  const [newTags, setNewTags] = useState("");
  const [newMath, setNewMath] = useState("");
  const [newBounty, setNewBounty] = useState(100);
  const [askAiInstant, setAskAiInstant] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loaded = getStoredDoubts();
    setDoubts(loaded);
  }, []);

  const handleUpvoteDoubt = (id: string) => {
    const updated = doubts.map(d => {
      if (d.id === id) {
        return { ...d, views: d.views + 1 };
      }
      return d;
    });
    setDoubts(updated);
    saveStoredDoubts(updated);
  };

  const handleUpvoteAnswer = (doubtId: string, answerId: string) => {
    const updated = doubts.map(d => {
      if (d.id === doubtId) {
        const answers = d.answers.map(ans => {
          if (ans.id === answerId) {
            return { ...ans, upvotes: ans.upvotes + 1 };
          }
          return ans;
        });
        return { ...d, answers };
      }
      return d;
    });
    setDoubts(updated);
    saveStoredDoubts(updated);
    awardXp(5, "Community Upvote");
  };

  const handleAcceptAnswer = (doubtId: string, answerId: string) => {
    const updated = doubts.map(d => {
      if (d.id === doubtId) {
        const answers = d.answers.map(ans => ({
          ...ans,
          isAccepted: ans.id === answerId ? !ans.isAccepted : false
        }));
        const hasAccepted = answers.some(a => a.isAccepted);
        return { ...d, status: hasAccepted ? "solved" : "open", answers } as DoubtQuery;
      }
      return d;
    });
    setDoubts(updated);
    saveStoredDoubts(updated);
    awardXp(25, "Accepted Answer Reward");
  };

  const handlePostAnswer = (doubtId: string) => {
    const text = replyText[doubtId]?.trim();
    if (!text) return;

    const newAnswer: DoubtAnswer = {
      id: `ans-${Date.now()}`,
      authorName: user?.displayName || "Global Student",
      authorAvatar: user?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.uid || "EduScholar"}`,
      authorRole: "Student",
      authorCountry: "India",
      content: text,
      createdAt: "Just now",
      upvotes: 1,
      isAccepted: false
    };

    const updated = doubts.map(d => {
      if (d.id === doubtId) {
        return {
          ...d,
          answers: [...d.answers, newAnswer]
        };
      }
      return d;
    });

    setDoubts(updated);
    saveStoredDoubts(updated);
    setReplyText(prev => ({ ...prev, [doubtId]: "" }));
    awardXp(50, "Answered Community Doubt");
  };

  const handleAskAiForDoubt = async (doubtId: string) => {
    const targetDoubt = doubts.find(d => d.id === doubtId);
    if (!targetDoubt) return;

    setIsAnsweringAi(prev => ({ ...prev, [doubtId]: true }));

    // Simulate AI synthesis with high-value academic breakdown
    setTimeout(() => {
      const aiResponse: DoubtAnswer = {
        id: `ai-${Date.now()}`,
        authorName: "EduTrack AI Co-Pilot",
        authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=EduAI",
        authorRole: "AI Assistant",
        authorCountry: "Global AI",
        content: `**Step-by-Step AI Solution for "${targetDoubt.title}"**:\n\n1. **Core Concept**: In ${targetDoubt.subject}, this problem revolves around foundational principles tested in ${targetDoubt.examTarget || "Board Exams"}.\n2. **Breakdown**: Analyzing the parameters given in the question description...\n3. **Key Takeaway**: Always verify units and edge cases when writing your board exam answer!`,
        createdAt: "Just now",
        upvotes: 5,
        isAccepted: false,
        isAiGenerated: true
      };

      const updated = doubts.map(d => {
        if (d.id === doubtId) {
          return { ...d, answers: [...d.answers, aiResponse] };
        }
        return d;
      });

      setDoubts(updated);
      saveStoredDoubts(updated);
      setIsAnsweringAi(prev => ({ ...prev, [doubtId]: false }));
    }, 1200);
  };

  const handleCreateDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    setSubmitting(true);

    const createdDoubt: DoubtQuery = {
      id: `doubt-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim(),
      subject: newSubject,
      grade: newGrade,
      examTarget: newExam !== "All Exams" ? newExam : "General",
      tags: newTags.split(",").map(t => t.trim()).filter(Boolean),
      authorName: user?.displayName || "Curious Scholar",
      authorAvatar: user?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${Date.now()}`,
      authorCountry: "Global",
      authorCountryFlag: "🌐",
      mathFormula: newMath.trim() || undefined,
      bountyXp: newBounty,
      views: 1,
      createdAt: "Just now",
      status: "open",
      answers: []
    };

    if (askAiInstant) {
      createdDoubt.answers.push({
        id: `ai-inst-${Date.now()}`,
        authorName: "EduTrack AI Co-Pilot",
        authorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=EduAI",
        authorRole: "AI Assistant",
        authorCountry: "Global AI",
        content: `**Instant AI Hint & Primer**: Great question! To begin solving this, recall the fundamental relations in ${newSubject}. Check key formula definitions and diagram symmetries. Human peers and teachers from around the world will also review and post detailed derivations shortly!`,
        createdAt: "Just now",
        upvotes: 3,
        isAccepted: false,
        isAiGenerated: true
      });
    }

    const updated = [createdDoubt, ...doubts];
    setDoubts(updated);
    saveStoredDoubts(updated);
    setExpandedDoubtId(createdDoubt.id);

    // Reset Form
    setNewTitle("");
    setNewDescription("");
    setNewTags("");
    setNewMath("");
    setSubmitting(false);
    setIsModalOpen(false);
    awardXp(30, "Posted Community Doubt");
  };

  // Filtered Doubts
  const filteredDoubts = useMemo(() => {
    return doubts.filter(d => {
      const matchSubject = selectedSubject === "All" || d.subject === selectedSubject;
      const matchGrade = selectedGrade === "All Grades" || d.grade === selectedGrade;
      const matchExam = selectedExam === "All Exams" || d.examTarget === selectedExam;
      const matchStatus = 
        statusFilter === "all" ? true :
        statusFilter === "solved" ? d.status === "solved" :
        statusFilter === "open" ? d.status === "open" :
        d.views > 200 || d.answers.length > 1;

      const query = searchQuery.toLowerCase();
      const matchQuery = 
        !searchQuery ||
        d.title.toLowerCase().includes(query) ||
        d.description.toLowerCase().includes(query) ||
        d.tags.some(t => t.toLowerCase().includes(query));

      return matchSubject && matchGrade && matchExam && matchStatus && matchQuery;
    });
  }, [doubts, selectedSubject, selectedGrade, selectedExam, statusFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Banner Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 border border-indigo-500/20 p-6 md:p-10 backdrop-blur-xl shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-black uppercase tracking-wider">
                <Globe className="w-3.5 h-3.5 animate-spin" />
                Worldwide Academic Exchange
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">Doubt & Query</span> Forum
              </h1>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                Connect with students, certified teachers, and AI mentors across 100+ countries. Post any academic question, earn XP bounties, and get step-by-step verified explanations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Ask a Doubt
              </button>
            </div>
          </div>

          {/* Stat Badges */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">Total Doubts</p>
                <p className="text-lg font-black text-white">{doubts.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-black">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">Resolved Rate</p>
                <p className="text-lg font-black text-white">94.8%</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-black">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">Countries</p>
                <p className="text-lg font-black text-white">100+ Global</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-black">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">Instant AI Co-Pilot</p>
                <p className="text-lg font-black text-white">24/7 Live</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-4 space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search doubts by topic, keywords, or formulas (e.g. 'solenoid', 'quadratic', 'ester')..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <select
                value={selectedGrade}
                onChange={e => setSelectedGrade(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>

              <select
                value={selectedExam}
                onChange={e => setSelectedExam(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-300 focus:outline-none focus:border-indigo-500"
              >
                {EXAMS.map(ex => <option key={ex} value={ex}>{ex}</option>)}
              </select>

              <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800">
                {(["all", "open", "solved", "trending"] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all",
                      statusFilter === status
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Subject Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            {SUBJECTS.map(subj => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border",
                  selectedSubject === subj
                    ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-sm"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                )}
              >
                {subj}
              </button>
            ))}
          </div>
        </div>

        {/* Doubts Feed */}
        <div className="space-y-4">
          {filteredDoubts.length === 0 ? (
            <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-12 text-center space-y-4">
              <HelpCircle className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-black text-slate-300">No doubts matching your filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Be the first to post a question in this category or adjust your search filters above!
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Ask a Doubt Now
              </button>
            </div>
          ) : (
            filteredDoubts.map(doubt => {
              const isExpanded = expandedDoubtId === doubt.id;
              const hasAcceptedAnswer = doubt.answers.some(a => a.isAccepted);

              return (
                <div
                  key={doubt.id}
                  className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all overflow-hidden shadow-lg"
                >
                  {/* Doubt Header Card */}
                  <div 
                    onClick={() => setExpandedDoubtId(isExpanded ? null : doubt.id)}
                    className="p-5 md:p-6 cursor-pointer space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img 
                          src={doubt.authorAvatar} 
                          alt={doubt.authorName} 
                          className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700" 
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-200">{doubt.authorName}</span>
                            <span className="text-sm" title={doubt.authorCountry}>{doubt.authorCountryFlag}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold">
                              {doubt.authorCountry}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500">{doubt.createdAt}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold">
                          {doubt.subject}
                        </span>
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold">
                          {doubt.grade}
                        </span>
                        {doubt.examTarget && (
                          <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 font-bold">
                            {doubt.examTarget}
                          </span>
                        )}
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-black flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 fill-amber-400" />
                          +{doubt.bountyXp} XP
                        </span>
                        {doubt.status === "solved" && (
                          <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Solved
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-base md:text-lg font-black text-slate-100 hover:text-indigo-400 transition-colors">
                        {doubt.title}
                      </h2>
                      <p className="text-xs md:text-sm text-slate-400 mt-2 leading-relaxed whitespace-pre-line">
                        {doubt.description}
                      </p>
                    </div>

                    {doubt.mathFormula && (
                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono text-indigo-300 overflow-x-auto">
                        Formula / Equation: <span className="font-bold text-white ml-2">{doubt.mathFormula}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
                      <div className="flex flex-wrap gap-1.5">
                        {doubt.tags.map(tag => (
                          <span key={tag} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4 text-indigo-400" />
                          {doubt.answers.length} {doubt.answers.length === 1 ? "answer" : "answers"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-4 h-4 text-slate-500" />
                          {doubt.views} views
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpvoteDoubt(doubt.id);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" /> Upvote
                        </button>
                        <span className="text-slate-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Answers & Discussion Thread */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-950/60 border-t border-slate-800 p-5 md:p-6 space-y-6"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-black text-slate-200 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-indigo-400" />
                            Community & AI Answers ({doubt.answers.length})
                          </h3>
                          <button
                            onClick={() => handleAskAiForDoubt(doubt.id)}
                            disabled={isAnsweringAi[doubt.id]}
                            className="text-xs px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <Bot className="w-3.5 h-3.5" />
                            {isAnsweringAi[doubt.id] ? "Generating AI Solution..." : "Get AI Co-Pilot Breakdown"}
                          </button>
                        </div>

                        {/* List of answers */}
                        <div className="space-y-4">
                          {doubt.answers.length === 0 ? (
                            <div className="p-4 bg-slate-900/60 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                              No answers posted yet. Be the first solver to earn the <span className="text-amber-400 font-bold">+{doubt.bountyXp} XP</span> bounty!
                            </div>
                          ) : (
                            doubt.answers.map(ans => (
                              <div
                                key={ans.id}
                                className={cn(
                                  "p-4 rounded-xl border transition-all space-y-3",
                                  ans.isAccepted
                                    ? "bg-emerald-950/20 border-emerald-500/40 shadow-md shadow-emerald-950/40"
                                    : ans.isAiGenerated
                                    ? "bg-purple-950/20 border-purple-500/30"
                                    : "bg-slate-900 border-slate-800"
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <img src={ans.authorAvatar} alt={ans.authorName} className="w-8 h-8 rounded-full bg-slate-800" />
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-white">{ans.authorName}</span>
                                        {ans.authorRole === "Teacher" && (
                                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-black flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3" /> Certified Teacher
                                          </span>
                                        )}
                                        {ans.isAiGenerated && (
                                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-black flex items-center gap-1">
                                            <Bot className="w-3 h-3" /> AI Co-Pilot
                                          </span>
                                        )}
                                        <span className="text-[10px] text-slate-500">({ans.authorCountry})</span>
                                      </div>
                                      <p className="text-[10px] text-slate-500">{ans.createdAt}</p>
                                    </div>
                                  </div>

                                  {ans.isAccepted && (
                                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-black">
                                      <CheckCircle className="w-3.5 h-3.5" /> Accepted Solution
                                    </div>
                                  )}
                                </div>

                                <div className="text-xs md:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                                  {ans.content}
                                </div>

                                {ans.mathFormula && (
                                  <div className="p-2.5 bg-slate-950 rounded-lg font-mono text-xs text-indigo-300 border border-slate-800">
                                    {ans.mathFormula}
                                  </div>
                                )}

                                <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                                  <button
                                    onClick={() => handleUpvoteAnswer(doubt.id, ans.id)}
                                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                                  >
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                    <span>{ans.upvotes} Helpful</span>
                                  </button>

                                  {!ans.isAiGenerated && (
                                    <button
                                      onClick={() => handleAcceptAnswer(doubt.id, ans.id)}
                                      className={cn(
                                        "text-xs font-bold px-3 py-1 rounded-lg transition-colors flex items-center gap-1",
                                        ans.isAccepted
                                          ? "text-emerald-400 hover:bg-emerald-950/40"
                                          : "text-slate-400 hover:text-emerald-300 hover:bg-slate-800"
                                      )}
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      {ans.isAccepted ? "Marked as Solution" : "Mark as Solution"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Reply / Submit Answer Input */}
                        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
                          <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                            <Send className="w-3.5 h-3.5 text-indigo-400" />
                            Post Your Solution (Help a student & earn XP)
                          </label>
                          <textarea
                            value={replyText[doubt.id] || ""}
                            onChange={e => setReplyText({ ...replyText, [doubt.id]: e.target.value })}
                            rows={3}
                            placeholder="Write a clear step-by-step answer or mathematical derivation..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                          />
                          <div className="flex justify-end">
                            <button
                              onClick={() => handlePostAnswer(doubt.id)}
                              disabled={!replyText[doubt.id]?.trim()}
                              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 disabled:opacity-40 transition-all"
                            >
                              <Send className="w-3.5 h-3.5" />
                              Submit Answer
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Ask Doubt Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-400" />
                    Ask Global Community & AI
                  </h2>
                  <p className="text-xs text-slate-400">Your question will be broadcast to international peers, teachers, and AI mentors.</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateDoubt} className="space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-300 block mb-1.5">Question Title *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. Why does a ray passing through the optical center of a thin lens emerge undeviated?"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Subject</label>
                    <select
                      value={newSubject}
                      onChange={e => setNewSubject(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      {SUBJECTS.filter(s => s !== "All").map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Target Grade</label>
                    <select
                      value={newGrade}
                      onChange={e => setNewGrade(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      {GRADES.filter(g => g !== "All Grades").map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Target Exam</label>
                    <select
                      value={newExam}
                      onChange={e => setNewExam(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      {EXAMS.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-300 block mb-1.5">Detailed Description & Context *</label>
                  <textarea
                    required
                    rows={4}
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    placeholder="Provide full problem statement, values given, what you have tried so far..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Formula / LaTeX Equation (Optional)</label>
                  <input
                    type="text"
                    value={newMath}
                    onChange={e => setNewMath(e.target.value)}
                    placeholder="e.g. 1/f = 1/v - 1/u or E = mc^2"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-indigo-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={e => setNewTags(e.target.value)}
                    placeholder="Light, Optics, Lens Formula, Reflection"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-purple-400" />
                      Auto-Generate Instant AI Co-Pilot Solution
                    </span>
                    <p className="text-[11px] text-slate-400">Receive an instant AI preliminary breakdown while peers view your query.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={askAiInstant}
                    onChange={e => setAskAiInstant(e.target.checked)}
                    className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30"
                  >
                    {submitting ? "Publishing..." : "Broadcast Question (+30 XP)"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
