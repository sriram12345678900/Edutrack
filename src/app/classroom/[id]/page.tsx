"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  GraduationCap, Video, BookOpen, Users, Clock, 
  Sparkles, CheckCircle2, ChevronRight, Copy, CheckCheck, 
  Send, AlertCircle, Award, Calendar, BarChart3, Layers, 
  FileText, MessageSquare, Pin, ArrowLeft, Paperclip, Check, Camera, UploadCloud
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { 
  Classroom, 
  getClassroomById, 
  addCommentToPost,
  submitAssignmentWork 
} from "@/lib/classroom";
import { cn } from "@/lib/utils";

export default function StudentClassDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const classId = params?.id as string;

  const [cls, setCls] = useState<Classroom | null>(null);
  const [activeTab, setActiveTab] = useState<"stream" | "live" | "classwork" | "grades" | "resources">("stream");

  // Stream Comments State
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  // Assignment Submission Modal State
  const [submittingAssignment, setSubmittingAssignment] = useState<any | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionFileName, setSubmissionFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    loadClass();
    const handleUpdate = () => loadClass();
    window.addEventListener("edutrack_classrooms_updated", handleUpdate);
    return () => window.removeEventListener("edutrack_classrooms_updated", handleUpdate);
  }, [classId]);

  const loadClass = () => {
    if (!classId) return;
    const found = getClassroomById(classId);
    setCls(found);
  };

  const handleAddComment = (postId: string) => {
    if (!cls || !commentText.trim()) return;
    const studentName = user?.displayName || "Scholar Student";
    addCommentToPost(cls.id, postId, {
      authorName: studentName,
      authorRole: "student",
      text: commentText.trim()
    });
    setCommentText("");
    setActiveCommentPostId(null);
    loadClass();
  };

  const handleSubmitHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cls || !submittingAssignment || !submissionText.trim()) return;

    setIsSubmitting(true);
    const studentUid = user?.uid || "sandbox-student-101";
    const studentName = user?.displayName || "Scholar Student";
    const studentEmail = user?.email || "student@edutrack.space";

    submitAssignmentWork(cls.id, submittingAssignment.id, {
      studentUid,
      studentName,
      studentEmail,
      textContent: submissionText.trim(),
      files: submissionFileName.trim() ? [{ name: submissionFileName.trim(), url: "#" }] : []
    });

    setIsSubmitting(false);
    setSubmitSuccess(true);
    loadClass();

    setTimeout(() => {
      setSubmitSuccess(false);
      setSubmittingAssignment(null);
      setSubmissionText("");
      setSubmissionFileName("");
    }, 1200);
  };

  if (!cls) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Classroom not found</h2>
        <Link href="/classroom" className="text-indigo-500 font-bold text-sm mt-3 inline-block">
          ← Return to Classroom Hub
        </Link>
      </div>
    );
  }

  const isLive = cls.activeMeeting && cls.activeMeeting.status === "live";
  const studentUid = user?.uid || "sandbox-student-101";
  const studentName = user?.displayName || "Scholar Student";

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* ── TOP BREADCRUMB ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/classroom"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Classrooms
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/teacher/class/${cls.id}`}
            className="text-xs font-bold text-indigo-500 hover:underline flex items-center gap-1"
          >
            Switch to Teacher Mode <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <div className={cn("relative overflow-hidden rounded-3xl p-6 md:p-8 text-white shadow-2xl bg-gradient-to-r", cls.bannerGradient)}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                {cls.grade} • {cls.section}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full border border-white/20">
                {cls.subject}
              </span>
              {isLive && (
                <span className="flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider animate-pulse shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  Live Class in Session
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-4xl font-black tracking-tight">{cls.name}</h1>
            <p className="text-xs md:text-sm text-white/80 font-medium leading-relaxed">
              Instructor: {cls.teacherName} ({cls.teacherEmail})
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-white/90 pt-2 font-medium">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-300" /> {cls.schedule}</span>
              <span>•</span>
              <span>{cls.room}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {cls.enrolledStudents.length} Students</span>
            </div>
          </div>

          {/* Right Action: Join Live Session */}
          <div className="shrink-0">
            {isLive ? (
              <Link
                href={`/classroom/${cls.id}/live`}
                className="py-3.5 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition-all shadow-2xl flex items-center justify-center gap-2 animate-bounce"
              >
                <Video className="w-4 h-4" />
                Join Live Classroom Now
              </Link>
            ) : (
              <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center space-y-1">
                <span className="text-[10px] font-bold text-white/70 block uppercase tracking-wider">Next Live Lecture</span>
                <span className="text-xs font-black text-white">{cls.schedule}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-white/10 overflow-x-auto pb-1 custom-scrollbar">
        {[
          { id: "stream", label: "Stream & Feed", icon: MessageSquare },
          { id: "live", label: "Live Classroom", icon: Video },
          { id: "classwork", label: "Classwork & Homework", icon: BookOpen, count: cls.assignments.length },
          { id: "grades", label: "My Grades & Remarks", icon: Award },
          { id: "resources", label: "Study Resources", icon: Layers }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-2xl font-black text-xs transition-all whitespace-nowrap relative",
                isActive
                  ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={cn(
                  "text-[9px] px-1.5 py-0.2 rounded-full font-bold",
                  isActive ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400"
                )}>
                  {tab.count}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="activeStudentTab"
                  className="absolute bottom-0 inset-x-2 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="pt-2">
        {/* 1. STREAM TAB */}
        {activeTab === "stream" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Upcoming Work Box */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-lg space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Upcoming Deadlines</span>
                {cls.assignments.length === 0 ? (
                  <p className="text-xs text-slate-500">Woohoo, no work due soon!</p>
                ) : (
                  <div className="space-y-2">
                    {cls.assignments.slice(0, 3).map((a) => (
                      <div key={a.id} className="text-xs space-y-0.5 pb-2 border-b border-slate-100 dark:border-white/5 last:border-0">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">{a.title}</span>
                        <span className="text-[10px] text-amber-500">Due: {new Date(a.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right 2 Columns: Stream Posts Feed */}
            <div className="lg:col-span-2 space-y-4">
              {cls.posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-lg space-y-4 hover:border-indigo-500/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                        {post.authorName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {post.authorName}
                          </span>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                            {post.authorRole}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>

                    {post.isPinned && (
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                  </div>

                  {post.title && (
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">{post.title}</h4>
                  )}
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>

                  {/* Attachments */}
                  {post.attachments && post.attachments.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {post.attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span className="truncate">{att.name}</span>
                          </div>
                          <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                            Study PDF
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comments Feed */}
                  <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span>{post.comments.length} Class Comments</span>
                      <button
                        onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                        className="text-indigo-500 hover:underline"
                      >
                        + Add Comment / Ask Doubt
                      </button>
                    </div>

                    {post.comments.length > 0 && (
                      <div className="space-y-2 pl-3 border-l-2 border-slate-200 dark:border-white/10">
                        {post.comments.map((comm) => (
                          <div key={comm.id} className="text-xs space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 dark:text-white text-[11px]">
                                {comm.authorName}
                              </span>
                              <span className="text-[8px] font-bold uppercase text-slate-400">
                                {comm.authorRole}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                              {comm.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeCommentPostId === post.id && (
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Ask a question or reply..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddComment(post.id)}
                          className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all"
                        >
                          Send
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. LIVE CLASSROOM TAB */}
        {activeTab === "live" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 md:p-8 text-white shadow-2xl border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 px-3 py-1 rounded-full border border-indigo-400/30">
                  Interactive Video Classroom
                </span>
                <h3 className="text-2xl font-black">Live Lecture & Whiteboard Attendance</h3>
                <p className="text-xs md:text-sm text-indigo-200/80 max-w-xl font-medium leading-relaxed">
                  Join the live video lecture with your teacher and classmates. Raise hand to ask doubts, view the live equation whiteboard, and vote in instant polls.
                </p>
              </div>

              <Link
                href={`/classroom/${cls.id}/live`}
                className="px-6 py-3.5 rounded-2xl bg-white text-indigo-950 hover:bg-slate-100 font-black text-sm transition-all shadow-xl flex items-center justify-center gap-2 hover:scale-105 shrink-0"
              >
                <Video className="w-5 h-5 text-indigo-600" />
                {isLive ? "Enter Live Classroom" : "Join Video Room"}
              </Link>
            </div>
          </div>
        )}

        {/* 3. CLASSWORK & HOMEWORK TAB */}
        {activeTab === "classwork" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Classwork & Homework</h3>
                <p className="text-xs text-slate-500">Submit homework answers and show your steps to the teacher</p>
              </div>
            </div>

            <div className="space-y-4">
              {cls.assignments.map((asg) => {
                const mySub = asg.submissions.find(s => s.studentUid === studentUid || s.studentName === studentName);
                const isSubmitted = !!mySub;
                const isGraded = mySub && mySub.status === "graded";

                return (
                  <div
                    key={asg.id}
                    className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4 hover:border-indigo-500/30 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                            {asg.topic}
                          </span>
                          <span className={cn(
                            "text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border",
                            isGraded
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : isSubmitted
                              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                              : "bg-amber-500/20 text-amber-500 border-amber-500/30"
                          )}>
                            {isGraded ? `Graded: ${mySub.marks}/${asg.maxMarks}` : isSubmitted ? "Submitted (Pending Grade)" : "Assigned"}
                          </span>
                        </div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white mt-1">
                          {asg.title}
                        </h4>
                        <span className="text-xs text-slate-400">Due: {new Date(asg.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} • Max {asg.maxMarks} Marks</span>
                      </div>

                      <button
                        onClick={() => {
                          setSubmittingAssignment(asg);
                          setSubmissionText(mySub ? mySub.textContent : "");
                          setSubmissionFileName(mySub?.files?.[0]?.name || "");
                        }}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm shrink-0",
                          isSubmitted
                            ? "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"
                        )}
                      >
                        {isSubmitted ? "View / Edit Submission" : "Submit Homework"}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {asg.instructions}
                    </p>

                    {mySub && (
                      <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
                        <span className="text-[10px] font-black uppercase text-indigo-400">Your Submitted Work:</span>
                        <p className="text-xs font-mono text-slate-800 dark:text-slate-200 line-clamp-2">
                          &quot;{mySub.textContent}&quot;
                        </p>
                        {mySub.feedback && (
                          <p className="text-xs text-emerald-400 font-bold pt-1">
                            Teacher Feedback: &quot;{mySub.feedback}&quot;
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. MY GRADES & REMARKS TAB */}
        {activeTab === "grades" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-500" />
                Assignment Marks & Teacher Feedback
              </h3>

              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {cls.assignments.map((asg) => {
                  const mySub = asg.submissions.find(s => s.studentUid === studentUid || s.studentName === studentName);

                  return (
                    <div key={asg.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">{asg.title}</h4>
                        <span className="text-[11px] text-slate-400">Topic: {asg.topic}</span>
                        {mySub?.feedback && (
                          <p className="text-xs text-emerald-400 font-medium mt-1">
                            Feedback: &quot;{mySub.feedback}&quot;
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        {mySub && mySub.status === "graded" ? (
                          <>
                            <span className="text-sm font-black text-emerald-400 block">{mySub.marks} / {asg.maxMarks}</span>
                            <span className="text-[9px] text-slate-400 font-bold">Graded</span>
                          </>
                        ) : mySub ? (
                          <span className="text-xs font-bold text-amber-500">Submitted (Pending Grade)</span>
                        ) : (
                          <span className="text-xs font-bold text-slate-400">Not Submitted</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 5. STUDY RESOURCES TAB */}
        {activeTab === "resources" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/ncert"
              className="p-5 rounded-3xl bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 transition-all shadow-xl space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-indigo-500">NCERT Digital Textbook</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Read Class 10 {cls.subject} Book</h4>
              <p className="text-xs text-slate-500">Official NCERT chapters with AI margin tutor and instant summary.</p>
            </Link>

            <Link
              href="/formulas"
              className="p-5 rounded-3xl bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 transition-all shadow-xl space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-500">Formulas & Theorem Cheat Sheet</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Quick Formula Vault</h4>
              <p className="text-xs text-slate-500">All essential formulas, laws, and proofs organized by unit.</p>
            </Link>
          </div>
        )}
      </div>

      {/* ── HOMEWORK SUBMITTER MODAL ── */}
      <AnimatePresence>
        {submittingAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/15 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Submit: {submittingAssignment.title}
                  </h3>
                  <p className="text-xs text-slate-500">Max Marks: {submittingAssignment.maxMarks}</p>
                </div>
                <button
                  onClick={() => setSubmittingAssignment(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                <span className="text-[10px] font-black uppercase text-indigo-400">Teacher Instructions:</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {submittingAssignment.instructions}
                </p>
              </div>

              {submitSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <p className="text-sm font-black text-slate-900 dark:text-white">Homework Submitted Successfully!</p>
                  <p className="text-xs text-slate-500">Your teacher will review your steps and award marks.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitHomework} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Write Solutions & Working *
                    </label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Write your step-by-step mathematical working, answers, or summary..."
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Attach Scanned Copy / Photo (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. My_Homework_Scan_Page1.pdf"
                      value={submissionFileName}
                      onChange={(e) => setSubmissionFileName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setSubmittingAssignment(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-lg shadow-indigo-500/30 flex items-center gap-1.5"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      {isSubmitting ? "Submitting..." : "Turn In Homework"}
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
