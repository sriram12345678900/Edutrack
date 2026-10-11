"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Award, Sparkles, Star, BookOpen, MessageSquare, 
  GraduationCap, CheckCircle2, Search, ArrowRight, Plus, ShieldCheck 
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getStoredPeerTutors, registerAsPeerTutor, PeerTutorProfile } from "@/lib/peer-teaching";
import { awardUserXP } from "@/lib/xp";

export default function PeerTeachPage() {
  const { user } = useAuth();
  const [tutors, setTutors] = useState<PeerTutorProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  // Form states
  const [expertSubject, setExpertSubject] = useState("Science");
  const [expertChapter, setExpertChapter] = useState("Chemical Reactions & Equations");

  const loadTutors = () => {
    setTutors(getStoredPeerTutors());
  };

  useEffect(() => {
    loadTutors();
    const handleUpdate = () => loadTutors();
    window.addEventListener("edutrack_peer_tutors_updated", handleUpdate);
    return () => window.removeEventListener("edutrack_peer_tutors_updated", handleUpdate);
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const myName = user?.displayName || "Scholar Mentor";
    const initials = myName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "SM";

    registerAsPeerTutor({
      name: myName,
      className: 10,
      expertSubject,
      expertChapter,
      avatarInitials: initials,
      color: "from-indigo-500 to-purple-600",
    });

    awardUserXP(50); // Welcome bonus for stepping up as a mentor
    setRegisteredSuccess(true);
    setTimeout(() => {
      setRegisteredSuccess(false);
      setShowRegisterModal(false);
    }, 1500);
  };

  const filteredTutors = tutors.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.expertSubject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.expertChapter.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Hero Header */}
      <div className="premium-glass-panel p-8 rounded-3xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Protégé & Peer Teaching Hub
              </span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                ⚡ 2x Teaching Bonus XP
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Learn by Teaching Classmates
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl font-medium">
              Seneca's Dictum: <i>"While we teach, we learn."</i> Connect with verified student experts in your class or register to mentor others and double your XP velocity.
            </p>
          </div>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-black text-xs shadow-xl shadow-indigo-500/25 flex items-center gap-2 active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>I Want to Teach (Earn 2x XP)</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search mentors by topic or subject (e.g. Chemical Reactions, Acids, Trigonometry)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm"
        />
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTutors.map((mentor) => (
          <motion.div
            key={mentor.id}
            whileHover={{ y: -4 }}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${mentor.color} text-white font-black text-sm flex items-center justify-center shadow-md`}>
                    {mentor.avatarInitials}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      {mentor.name}
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold block">
                      Class {mentor.className} CBSE Scholar
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-lg text-xs font-black">
                  <Star className="w-3 h-3 fill-amber-500" /> {mentor.rating}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/60 dark:border-white/5 space-y-1 mb-4">
                <span className="text-[9px] uppercase font-black text-indigo-500 tracking-wider">
                  Specialty Domain
                </span>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                  {mentor.expertSubject} • {mentor.expertChapter}
                </p>
                <span className="text-[10px] text-slate-400 font-medium block">
                  {mentor.sessionsCompleted} collaborative sessions conducted
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
              <Link
                href="/study-room"
                className="flex-1 py-2 text-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1"
              >
                <MessageSquare className="w-3 h-3" /> Connect in Study Room
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-indigo-500/30 text-white shadow-2xl"
            >
              <h3 className="text-lg font-black mb-1 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" /> Register as a Peer Mentor
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Help classmates who find this chapter difficult. You earn 2x XP for every completed explanation!
              </p>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Subject</label>
                  <select
                    value={expertSubject}
                    onChange={(e) => setExpertSubject(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Science" className="bg-slate-900">Science</option>
                    <option value="Mathematics" className="bg-slate-900">Mathematics</option>
                    <option value="Social Science" className="bg-slate-900">Social Science</option>
                    <option value="English" className="bg-slate-900">English</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Mastered Chapter</label>
                  <input
                    type="text"
                    value={expertChapter}
                    onChange={(e) => setExpertChapter(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Light - Reflection & Refraction"
                  />
                </div>

                {registeredSuccess ? (
                  <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Mentor Profile Active! (+50 XP)
                  </div>
                ) : (
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowRegisterModal(false)}
                      className="flex-1 py-2 rounded-xl bg-white/10 text-slate-300 text-xs font-bold hover:bg-white/15 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg transition-all"
                    >
                      Confirm Registration
                    </button>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
