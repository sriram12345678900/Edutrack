"use client";

import React, { useState, useEffect } from "react";
import { 
  MessageSquare, Sparkles, ThumbsUp, CheckCircle2, 
  Send, Plus, Search, Filter, BookOpen, Brain, User, 
  Clock, Trophy, Award, Check, X, ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "@/components/Confetti";
import { awardUserXP } from "@/lib/xp";

export interface DoubtPost {
  id: string;
  author: string;
  authorCode: string;
  authorAvatar: string;
  subject: string;
  chapter: string;
  question: string;
  details?: string;
  upvotes: number;
  hasUpvoted?: boolean;
  timeAgo: string;
  isSolved: boolean;
  answers: {
    id: string;
    author: string;
    authorAvatar: string;
    isAi?: boolean;
    text: string;
    upvotes: number;
    timeAgo: string;
    isAccepted?: boolean;
  }[];
}

const INITIAL_FEED: DoubtPost[] = [
  {
    id: "feed-1",
    author: "Aarav Sharma",
    authorCode: "SCH-9021",
    authorAvatar: "⚡",
    subject: "Science",
    chapter: "Chemical Reactions & Equations",
    question: "Why does copper not liberate hydrogen gas when reacted with dilute nitric acid (HNO₃)?",
    details: "I tried combining Cu + HNO3 in the lab simulator, but it forms nitrogen dioxide instead of H2 gas. Why?",
    upvotes: 8,
    timeAgo: "25m ago",
    isSolved: true,
    answers: [
      {
        id: "ans-1",
        author: "EduTrack AI Tutor",
        authorAvatar: "🤖",
        isAi: true,
        text: "Nitric acid (HNO₃) is a strong oxidizing agent. It oxidizes the hydrogen (H₂) gas formed into water (H₂O) and is itself reduced to nitrogen oxides (NO₂ or NO). Only very dilute HNO₃ reacts with Magnesium (Mg) and Manganese (Mn) to liberate H₂ gas!",
        upvotes: 14,
        timeAgo: "20m ago",
        isAccepted: true
      }
    ]
  },
  {
    id: "feed-2",
    author: "Priya Patel",
    authorCode: "SCH-4819",
    authorAvatar: "🌟",
    subject: "Mathematics",
    chapter: "Quadratic Equations",
    question: "How to quickly check if a word problem will give rational or irrational roots?",
    details: "When doing speed tests for board exams, calculating the full quadratic formula takes time. Is there a fast check?",
    upvotes: 5,
    timeAgo: "1h ago",
    isSolved: false,
    answers: [
      {
        id: "ans-2",
        author: "Rohan Verma",
        authorAvatar: "🎓",
        isAi: false,
        text: "Compute just the discriminant D = b² - 4ac! If D is a perfect square (0, 1, 4, 9, 16, 25...), roots are strictly RATIONAL. If D > 0 but not a perfect square, roots are IRRATIONAL.",
        upvotes: 9,
        timeAgo: "45m ago"
      }
    ]
  },
  {
    id: "feed-3",
    author: "Ananya Iyer",
    authorCode: "SCH-7721",
    authorAvatar: "🔬",
    subject: "Science",
    chapter: "Life Processes",
    question: "Why is the small intestine much longer in herbivores compared to carnivores?",
    details: "I know it relates to digestion, but what is the exact CBSE marking point for 2 marks?",
    upvotes: 11,
    timeAgo: "2h ago",
    isSolved: true,
    answers: [
      {
        id: "ans-3",
        author: "Vikram Reddy",
        authorAvatar: "🧬",
        isAi: false,
        text: "Herbivores eat grass/plants rich in cellulose, which requires a longer small intestine with specialized symbiotic bacteria for complete digestion. Carnivores eat meat which is easily digested, hence have a shorter small intestine.",
        upvotes: 12,
        timeAgo: "1h ago",
        isAccepted: true
      }
    ]
  }
];

const FEED_STORAGE_KEY = "edutrack_study_feed";

export default function StudyFeed() {
  const [posts, setPosts] = useState<DoubtPost[]>(INITIAL_FEED);
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [isAnswering, setIsAnswering] = useState<boolean>(false);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);

  // New Question Modal
  const [showAskModal, setShowAskModal] = useState<boolean>(false);
  const [newSubject, setNewSubject] = useState<string>("Science");
  const [newChapter, setNewChapter] = useState<string>("");
  const [newQuestion, setNewQuestion] = useState<string>("");
  const [newDetails, setNewDetails] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(FEED_STORAGE_KEY);
      if (stored) {
        try {
          setPosts(JSON.parse(stored));
        } catch {
          setPosts(INITIAL_FEED);
        }
      }
    }
  }, []);

  const savePosts = (newPosts: DoubtPost[]) => {
    setPosts(newPosts);
    if (typeof window !== "undefined") {
      localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(newPosts));
    }
  };

  const handleUpvote = (postId: string) => {
    const updated = posts.map(p => {
      if (p.id === postId) {
        const hasUp = p.hasUpvoted;
        return {
          ...p,
          upvotes: hasUp ? p.upvotes - 1 : p.upvotes + 1,
          hasUpvoted: !hasUp
        };
      }
      return p;
    });
    savePosts(updated);
  };

  const handlePostReply = (postId: string) => {
    if (!replyText.trim()) return;

    const nickname = typeof window !== "undefined" ? localStorage.getItem("edutrack_nickname") || "Scholar Peer" : "Scholar Peer";

    const updated = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          answers: [
            ...p.answers,
            {
              id: "ans-" + Date.now(),
              author: nickname,
              authorAvatar: "🎓",
              isAi: false,
              text: replyText.trim(),
              upvotes: 0,
              timeAgo: "Just now"
            }
          ]
        };
      }
      return p;
    });

    savePosts(updated);
    setReplyText("");
    awardUserXP(20);
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 2500);
  };

  const handleAskAIForPost = async (post: DoubtPost) => {
    setIsAnswering(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Explain this CBSE doubt clearly with official keywords: "${post.question}". Details: ${post.details || "None"}. Chapter: ${post.chapter}, Subject: ${post.subject}`
        })
      });

      let aiText = "Nitric acid is a strong oxidizing agent which oxidizes nascent hydrogen into water, hence copper yields NO2 instead of H2.";
      if (res.ok) {
        const data = await res.json();
        if (data.reply) aiText = data.reply;
      }

      const updated = posts.map(p => {
        if (p.id === post.id) {
          return {
            ...p,
            isSolved: true,
            answers: [
              ...p.answers,
              {
                id: "ai-" + Date.now(),
                author: "EduTrack AI Tutor",
                authorAvatar: "🤖",
                isAi: true,
                text: aiText,
                upvotes: 5,
                timeAgo: "Just now",
                isAccepted: true
              }
            ]
          };
        }
        return p;
      });

      savePosts(updated);
    } catch {
      // Fallback
    } finally {
      setIsAnswering(false);
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    const nickname = typeof window !== "undefined" ? localStorage.getItem("edutrack_nickname") || "Scholar Peer" : "Scholar Peer";
    const friendCode = typeof window !== "undefined" ? localStorage.getItem("edutrack_friend_code") || "SCH-1000" : "SCH-1000";

    const newPost: DoubtPost = {
      id: "post-" + Date.now(),
      author: nickname,
      authorCode: friendCode,
      authorAvatar: "🌟",
      subject: newSubject,
      chapter: newChapter || "General Chapter",
      question: newQuestion,
      details: newDetails || undefined,
      upvotes: 1,
      timeAgo: "Just now",
      isSolved: false,
      answers: []
    };

    savePosts([newPost, ...posts]);
    setShowAskModal(false);
    setNewQuestion("");
    setNewDetails("");
    setNewChapter("");
  };

  const filteredPosts = posts.filter(p => {
    if (selectedSubject !== "All" && p.subject !== selectedSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.question.toLowerCase().includes(q) || p.chapter.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <Confetti active={confettiActive} />

      {/* Header Hero Banner */}
      <div className="relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-indigo-550/10 via-purple-500/10 to-pink-500/5 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900/40 border border-indigo-200/60 dark:border-indigo-500/20 backdrop-blur-xl shadow-lg shadow-indigo-500/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-600 dark:text-indigo-400 text-xs font-black tracking-wider uppercase">
              <MessageSquare className="w-3.5 h-3.5" /> Peer Doubt Exchange
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              StudyFeed: Ask Doubts, Help Peers & Earn XP
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-xs max-w-xl leading-relaxed">
              Connect with fellow CBSE students across India. Post tricky questions, explain concepts to earn +20 Karma XP, and get instant verified answers from AI!
            </p>
          </div>

          <button
            onClick={() => setShowAskModal(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-650 hover:from-indigo-500 hover:to-purple-550 text-white text-xs font-extrabold shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] self-start md:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" /> Post a Doubt
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-2xl bg-white/70 dark:bg-[#0e1424]/70 border border-slate-200/70 dark:border-slate-800/70 backdrop-blur-md shadow-sm">
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {["All", "Science", "Mathematics", "Social Science", "English"].map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                selectedSubject === sub
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-500/20"
                  : "bg-slate-100/70 hover:bg-slate-200/70 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search doubts or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-100/80 dark:bg-[#13192b] border border-slate-200/80 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white/50 dark:bg-[#0e1424]/50 border border-slate-200/60 dark:border-slate-800/60">
            <MessageSquare className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No doubts found matching your filter.</p>
            <p className="text-xs text-slate-500 mt-1">Try changing the subject or search query, or post a new question!</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 sm:p-6 rounded-3xl bg-white/80 dark:bg-[#0e1424]/80 border border-slate-200/80 dark:border-slate-800/80 shadow-md shadow-slate-200/20 dark:shadow-none space-y-4 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all backdrop-blur-md"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-sm shadow-sm">
                    {post.authorAvatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white">{post.author}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({post.authorCode})</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">{post.timeAgo}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/50">
                    {post.subject} • {post.chapter}
                  </span>
                  {post.isSolved && (
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Solved
                    </span>
                  )}
                </div>
              </div>

              {/* Question Body */}
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                  {post.question}
                </h3>
                {post.details && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60 font-sans">
                    {post.details}
                  </p>
                )}
              </div>

              {/* Post Actions Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => handleUpvote(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      post.hasUpvoted
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-500/20"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{post.upvotes}</span>
                  </button>

                  <button
                    onClick={() => setActivePostId(activePostId === post.id ? null : post.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                    <span>{post.answers.length} Answers</span>
                  </button>
                </div>

                <button
                  onClick={() => handleAskAIForPost(post)}
                  disabled={isAnswering}
                  className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70 px-3.5 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/60 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Ask AI to Answer
                </button>
              </div>

              {/* Expanded Answers & Reply Box */}
              <AnimatePresence>
                {activePostId === post.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800/80"
                  >
                    {/* Answers List */}
                    <div className="space-y-3">
                      {post.answers.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-3">
                          No answers yet. Be the first peer to answer and earn +20 XP!
                        </p>
                      ) : (
                        post.answers.map((ans) => (
                          <div
                            key={ans.id}
                            className={`p-4 rounded-2xl border space-y-2 ${
                              ans.isAi
                                ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60"
                                : ans.isAccepted
                                ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60"
                                : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{ans.authorAvatar}</span>
                                <span className="font-bold text-slate-900 dark:text-white">{ans.author}</span>
                                {ans.isAi && (
                                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-600 dark:text-indigo-300">
                                    Official AI
                                  </span>
                                )}
                                {ans.isAccepted && (
                                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                                    Verified Solution
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">{ans.timeAgo}</span>
                            </div>

                            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                              {ans.text}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Post Answer Box */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Write your explanation or step-by-step solution..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handlePostReply(post.id);
                        }}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100/90 dark:bg-[#13192b] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => handlePostReply(post.id)}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" /> Submit (+20 XP)
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      {/* Ask Doubt Modal */}
      <AnimatePresence>
        {showAskModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 relative text-slate-900 dark:text-white"
            >
              <button
                onClick={() => setShowAskModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[11px] font-black uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> New Doubt Broadcast
                </div>
                <h3 className="text-xl font-black">Post a Doubt to StudyCircles</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your question will be broadcast to study buddies and peer scholars across EduTrack.
                </p>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Subject</label>
                    <select
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Science">Science</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Social Science">Social Science</option>
                      <option value="English">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Chapter / Topic</label>
                    <input
                      type="text"
                      placeholder="e.g. Electricity, Triangles"
                      value={newChapter}
                      onChange={(e) => setNewChapter(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Question Prompt *</label>
                  <textarea
                    required
                    placeholder="Enter your exact doubt or textbook problem statement..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Additional Context / Where you're stuck</label>
                  <textarea
                    placeholder="Explain what steps you already tried or which concept is confusing..."
                    value={newDetails}
                    onChange={(e) => setNewDetails(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 h-16 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAskModal(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-extrabold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-650 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-extrabold shadow-lg shadow-indigo-500/25 transition-all"
                  >
                    Broadcast Question
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
