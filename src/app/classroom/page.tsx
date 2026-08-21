"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, Plus, Video, BookOpen, Users, Clock, 
  Sparkles, CheckCircle2, ChevronRight, Copy, CheckCheck, 
  Send, AlertCircle, Award, Calendar, BarChart3, Layers, 
  FileText, MessageSquare, Check, ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { 
  Classroom, 
  getStoredClassrooms, 
  joinClassByCode 
} from "@/lib/classroom";
import { cn } from "@/lib/utils";

export default function StudentClassroomHub() {
  const router = useRouter();
  const { user } = useAuth();
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClasses();
    const handleUpdate = () => loadClasses();
    window.addEventListener("edutrack_classrooms_updated", handleUpdate);
    return () => window.removeEventListener("edutrack_classrooms_updated", handleUpdate);
  }, []);

  const loadClasses = () => {
    const list = getStoredClassrooms();
    setClasses(list);
  };

  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    setJoinError("");
    setJoinSuccess("");
    setLoading(true);

    const studentUid = user?.uid || "sandbox-student-101";
    const studentName = user?.displayName || "Scholar Student";
    const studentEmail = user?.email || "student@edutrack.space";

    const res = joinClassByCode(joinCodeInput.trim(), {
      uid: studentUid,
      name: studentName,
      email: studentEmail
    });

    setLoading(false);

    if (res.success) {
      setJoinSuccess(res.message);
      loadClasses();
      setTimeout(() => {
        setIsJoinModalOpen(false);
        setJoinCodeInput("");
        setJoinSuccess("");
        if (res.classroom) {
          router.push(`/classroom/${res.classroom.id}`);
        }
      }, 1200);
    } else {
      setJoinError(res.message);
    }
  };

  // Aggregate student tasks & upcoming homework
  const studentUid = user?.uid || "sandbox-student-101";
  const studentName = user?.displayName || "Scholar Student";

  const allAssignments = classes.flatMap(c => 
    c.assignments.map(a => {
      const mySubmission = a.submissions.find(s => s.studentUid === studentUid || s.studentName === studentName);
      return {
        ...a,
        classId: c.id,
        className: c.name,
        classSubject: c.subject,
        bannerGradient: c.bannerGradient,
        submission: mySubmission
      };
    })
  );

  const pendingHomework = allAssignments.filter(a => !a.submission);
  const gradedHomework = allAssignments.filter(a => a.submission && a.submission.status === "graded");
  const liveClasses = classes.filter(c => c.activeMeeting && c.activeMeeting.status === "live");

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* ── STUDENT HUB HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 border border-blue-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-black uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-blue-300" />
              Student Virtual School Hub
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
              My Classrooms & Live Lessons
            </h1>
            <p className="text-sm md:text-base text-blue-200/80 max-w-2xl font-medium leading-relaxed">
              Access your subjects, join live video classes with interactive whiteboard, submit homework with photo/text scan, and track teacher grades & feedback.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/bridge"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs transition-all border border-white/15 flex items-center gap-2 shadow-sm"
            >
              <Calendar className="w-4 h-4 text-cyan-300" />
              Home Study Bridge
            </Link>
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold text-xs transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Join Class with Code
            </button>
          </div>
        </div>

        {/* Live Class Active Notification Banner */}
        {liveClasses.length > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-red-600/30 via-pink-600/20 to-red-600/30 border border-red-500/50 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
              </span>
              <div>
                <span className="text-xs font-black uppercase text-red-300 tracking-wider">Live Class in Progress</span>
                <p className="text-sm font-black text-white">{liveClasses[0].name} ({liveClasses[0].teacherName})</p>
              </div>
            </div>

            <Link
              href={`/classroom/${liveClasses[0].id}/live`}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition-all shadow-lg flex items-center gap-1.5 shrink-0"
            >
              <Video className="w-3.5 h-3.5" />
              Join Live Class Now
            </Link>
          </div>
        )}
      </div>

      {/* ── ENROLLED CLASSES GRID ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-500" />
              Enrolled Classes ({classes.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your school subjects, announcements, and assignments</p>
          </div>

          <Link
            href="/teacher"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Switch to Teacher Mode <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => {
            const isLive = cls.activeMeeting && cls.activeMeeting.status === "live";
            const myPendingHomework = cls.assignments.filter(a => !a.submissions.some(s => s.studentUid === studentUid || s.studentName === studentName)).length;

            return (
              <div
                key={cls.id}
                className="group relative bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Banner Header */}
                <div className={cn("p-5 bg-gradient-to-r relative text-white", cls.bannerGradient)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest bg-black/30 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                        {cls.grade}
                      </span>
                      <h3 className="text-lg font-black mt-2 line-clamp-1 group-hover:text-white">
                        {cls.name}
                      </h3>
                      <p className="text-xs text-white/80 font-medium">Instructor: {cls.teacherName}</p>
                    </div>

                    {isLive && (
                      <span className="flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        Live
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[11px] text-white/80">
                    <span>{cls.schedule}</span>
                    <span>{cls.room}</span>
                  </div>
                </div>

                {/* Class Content Summary */}
                <div className="p-5 space-y-4 flex-1">
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {cls.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-white/5 text-center">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.03]">
                      <span className="text-[10px] text-slate-400 font-bold block">Assignments</span>
                      <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                        {cls.assignments.length}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.03]">
                      <span className="text-[10px] text-amber-500 font-bold block">Homework Due</span>
                      <span className="text-sm font-black text-amber-500">
                        {myPendingHomework} Pending
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
                  {isLive ? (
                    <Link
                      href={`/classroom/${cls.id}/live`}
                      className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-red-600/30 transition-all animate-pulse"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Join Live Class
                    </Link>
                  ) : (
                    <Link
                      href={`/classroom/${cls.id}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center justify-center gap-1 shadow-md shadow-indigo-600/20 transition-all"
                    >
                      Enter Classroom <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── TODAY'S HOMEWORK & TEACHER FEEDBACK ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Homework Agenda */}
        <div className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Pending Homework & Assignments ({pendingHomework.length})
            </h3>
            <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Action Needed
            </span>
          </div>

          {pendingHomework.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">All homework completed!</p>
              <p className="text-[11px] text-slate-400 mt-0.5">You are fully caught up across all enrolled subjects.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {pendingHomework.map((asg) => (
                <div
                  key={asg.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/5 flex items-center justify-between gap-3 hover:border-indigo-500/30 transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {asg.title}
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        {asg.className}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {asg.instructions}
                    </p>
                    <span className="text-[10px] text-amber-500 font-bold block">
                      Due: {new Date(asg.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} • Max {asg.maxMarks} Marks
                    </span>
                  </div>

                  <Link
                    href={`/classroom/${asg.classId}`}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all shrink-0 shadow-sm"
                  >
                    Submit Work
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Teacher Feedback & Graded Work */}
        <div className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500" />
              Teacher Feedback & Graded Homework
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Performance</span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            {gradedHomework.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No graded submissions yet.</p>
            ) : (
              gradedHomework.map((asg) => (
                <div
                  key={asg.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/5 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block">
                        {asg.title}
                      </span>
                      <span className="text-[10px] text-indigo-400 font-bold">{asg.className}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-400">
                        {asg.submission?.marks} / {asg.maxMarks}
                      </span>
                      <span className="text-[9px] text-slate-400 block font-bold">Marks Scored</span>
                    </div>
                  </div>

                  {asg.submission?.feedback && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                      <span className="font-bold">Teacher Feedback:</span> &quot;{asg.submission.feedback}&quot;
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── JOIN CLASSROOM MODAL ── */}
      <AnimatePresence>
        {isJoinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/15 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Join a Classroom</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Enter the 6-character code provided by your teacher</p>
                </div>
                <button
                  onClick={() => setIsJoinModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>

              {joinSuccess ? (
                <div className="py-6 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <p className="text-sm font-black text-slate-900 dark:text-white">{joinSuccess}</p>
                  <p className="text-xs text-slate-500">Redirecting to your classroom...</p>
                </div>
              ) : (
                <form onSubmit={handleJoinClass} className="space-y-4">
                  {joinError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{joinError}</span>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Class Join Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      placeholder="e.g. MATH10, SCIE10"
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-base font-mono font-black text-slate-900 dark:text-white tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 space-y-1">
                    <span className="font-bold block text-indigo-400">💡 Quick demo codes:</span>
                    <p className="font-mono">MATH10 • SCIE10 • ENGL10</p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsJoinModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-lg shadow-indigo-500/30 flex items-center gap-1.5"
                    >
                      {loading ? "Joining..." : "Join Class"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
