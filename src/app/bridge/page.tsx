"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  GraduationCap, Calendar, CheckCircle2, Clock, AlertCircle, 
  Award, BookOpen, Send, Printer, Share2, Sparkles, ChevronRight, 
  MessageSquare, User, ShieldCheck, FileCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { 
  Classroom, 
  getStoredClassrooms, 
  getParentNotices, 
  ParentNotice,
  sendParentNotice
} from "@/lib/classroom";
import { cn } from "@/lib/utils";

export default function SchoolHomeBridgePage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [notices, setNotices] = useState<ParentNotice[]>([]);
  const [checkedTasks, setCheckedTasks] = useState<{ [key: string]: boolean }>({});
  const [parentNote, setParentNote] = useState("");
  const [parentNoteSent, setParentNoteSent] = useState(false);

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener("edutrack_classrooms_updated", handleUpdate);
    window.addEventListener("edutrack_parent_notices_updated", handleUpdate);
    return () => {
      window.removeEventListener("edutrack_classrooms_updated", handleUpdate);
      window.removeEventListener("edutrack_parent_notices_updated", handleUpdate);
    };
  }, []);

  const loadData = () => {
    setClasses(getStoredClassrooms());
    setNotices(getParentNotices());
  };

  const studentName = user?.displayName || "Scholar Student";
  const studentUid = user?.uid || "sandbox-student-101";

  // Compute all homework assignments due
  const allHomework = classes.flatMap(c => 
    c.assignments.map(a => {
      const mySub = a.submissions.find(s => s.studentUid === studentUid || s.studentName === studentName);
      return {
        ...a,
        classId: c.id,
        className: c.name,
        classSubject: c.subject,
        teacherName: c.teacherName,
        submission: mySub
      };
    })
  );

  const pendingHomework = allHomework.filter(a => !a.submission);
  const completedHomework = allHomework.filter(a => !!a.submission);

  const toggleTask = (id: string) => {
    setCheckedTasks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSendParentNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentNote.trim()) return;

    sendParentNotice({
      classId: "home",
      className: "Home-to-School Communication",
      teacherName: "Parent of " + studentName,
      title: "Parent Query / Note for Teachers",
      message: parentNote.trim(),
      type: "general"
    });

    setParentNote("");
    setParentNoteSent(true);
    setTimeout(() => setParentNoteSent(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* ── BRIDGE HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-900 to-indigo-950 border border-teal-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-teal-300" />
              School-to-Home Connection Bridge
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
              Daily Home Digest & Parent Portal
            </h1>
            <p className="text-sm md:text-base text-teal-200/80 max-w-2xl font-medium leading-relaxed">
              Bridging the classroom and home. Review tonight&apos;s homework agenda, track attendance records, read direct teacher notices, and verify completed study milestones.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs transition-all border border-white/15 flex items-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print Daily Report
            </button>
            <Link
              href="/classroom"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-extrabold text-xs transition-all shadow-lg shadow-teal-500/30 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Open Classrooms
            </Link>
          </div>
        </div>

        {/* Quick Home Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-300">Tonight&apos;s Homework</span>
            <p className="text-2xl font-black text-white mt-1">{pendingHomework.length} Tasks</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">Completed Work</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">{completedHomework.length} Submissions</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">Weekly Attendance</span>
            <p className="text-2xl font-black text-cyan-400 mt-1">98% (Present)</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">Teacher Notices</span>
            <p className="text-2xl font-black text-amber-400 mt-1">{notices.length} Active</p>
          </div>
        </div>
      </div>

      {/* ── DAILY HOMEWORK AGENDA & CHECKLIST ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Tonight's Homework Checklist */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-teal-500" />
                Tonight&apos;s Home Study Checklist ({new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Parents and students can tick off completed study tasks</p>
            </div>
            <span className="text-xs font-bold text-teal-500">Est. 45 mins</span>
          </div>

          <div className="space-y-3">
            {pendingHomework.map((asg) => {
              const isChecked = !!checkedTasks[asg.id];

              return (
                <div
                  key={asg.id}
                  onClick={() => toggleTask(asg.id)}
                  className={cn(
                    "p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 select-none",
                    isChecked
                      ? "bg-emerald-500/10 border-emerald-500/30 text-slate-500 line-through"
                      : "bg-slate-50 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/5 hover:border-teal-500/40"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-lg border-2 flex items-center justify-center mt-0.5 shrink-0 transition-all",
                    isChecked ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-400 dark:border-slate-500"
                  )}>
                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-xs font-black truncate",
                        isChecked ? "text-slate-500" : "text-slate-900 dark:text-white"
                      )}>
                        {asg.title}
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400">
                        {asg.classSubject}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {asg.instructions}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium pt-1">
                      <span>Instructor: {asg.teacherName}</span>
                      <span>•</span>
                      <span className="text-amber-500 font-bold">Due: {new Date(asg.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {pendingHomework.length === 0 && (
              <div className="text-center py-10 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-black text-slate-900 dark:text-white">All homework for tonight is complete!</p>
                <p className="text-xs text-slate-400 mt-1">Great job! Enjoy your evening or read ahead in the NCERT book.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Attendance & Punctuality Summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-500" />
              Weekly Attendance & Punctuality
            </h3>

            <div className="grid grid-cols-5 gap-2 text-center">
              {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, idx) => (
                <div key={idx} className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400">{day}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                  <span className="text-[9px] font-black text-emerald-400 uppercase">On Time</span>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Teacher Attendance Note:</span>
              &quot;{studentName} has maintained 100% active attendance in all live lectures this week.&quot;
            </div>
          </div>

          {/* Direct Note to Teachers */}
          <div className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-500" />
              Parent Message to School
            </h3>

            {parentNoteSent ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center">
                ✓ Message dispatched to teachers!
              </div>
            ) : (
              <form onSubmit={handleSendParentNote} className="space-y-3">
                <textarea
                  rows={3}
                  required
                  placeholder="Leave a note or query for the class teachers (e.g. Leave request, doubt clarification)..."
                  value={parentNote}
                  onChange={(e) => setParentNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Note to Teachers
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── TEACHER NOTICES & BULLETIN BOARD ── */}
      <div className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-indigo-500" />
          Official Teacher Notices for Home & Parents
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notices.map((not) => (
            <div
              key={not.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-2 hover:border-indigo-500/30 transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={cn(
                  "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border",
                  not.type === "homework" ? "bg-amber-500/20 text-amber-500 border-amber-500/30" : "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
                )}>
                  {not.type}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">{not.date}</span>
              </div>

              <h4 className="text-xs font-black text-slate-900 dark:text-white">{not.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {not.message}
              </p>

              <div className="text-[10px] text-indigo-500 font-bold pt-1">
                <span>{not.className}</span> • <span>Teacher: {not.teacherName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
