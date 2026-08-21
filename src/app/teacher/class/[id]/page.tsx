"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  GraduationCap, Plus, Video, BookOpen, Users, Clock, 
  Sparkles, CheckCircle2, ChevronRight, Copy, CheckCheck, 
  Send, AlertCircle, Award, Calendar, BarChart3, Layers, 
  FileText, MessageSquare, Pin, ArrowLeft, Paperclip, Check, MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { 
  Classroom, 
  getClassroomById, 
  createStreamPost, 
  addCommentToPost,
  createAssignment,
  gradeStudentSubmission,
  startLiveClassMeeting,
  endLiveClassMeeting,
  sendParentNotice
} from "@/lib/classroom";
import { cn } from "@/lib/utils";

export default function TeacherClassDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const classId = params?.id as string;

  const [cls, setCls] = useState<Classroom | null>(null);
  const [activeTab, setActiveTab] = useState<"stream" | "live" | "classwork" | "grades" | "people" | "bridge">("stream");
  const [copiedCode, setCopiedCode] = useState(false);

  // Stream Post Creator State
  const [isPosting, setIsPosting] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postAudience, setPostAudience] = useState<"all" | "students" | "parents">("all");
  const [postPinned, setPostPinned] = useState(false);
  const [attachmentName, setAttachmentName] = useState("");
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  // Assignment Creator State
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [asgTitle, setAsgTitle] = useState("");
  const [asgTopic, setAsgTopic] = useState("Unit 1");
  const [asgInstructions, setAsgInstructions] = useState("");
  const [asgDueDate, setAsgDueDate] = useState(new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16));
  const [asgMaxMarks, setAsgMaxMarks] = useState<number>(25);
  const [asgAttachment, setAsgAttachment] = useState("");

  // Grading Modal State
  const [gradingSubmission, setGradingSubmission] = useState<{
    assignmentId: string;
    submissionId: string;
    studentName: string;
    textContent: string;
    maxMarks: number;
    currentMarks?: number;
    currentFeedback?: string;
  } | null>(null);
  const [inputMarks, setInputMarks] = useState<number>(20);
  const [inputFeedback, setInputFeedback] = useState("");

  // Parent Notice State
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [noticeType, setNoticeType] = useState<"homework" | "exam" | "attendance" | "general">("homework");
  const [noticeSent, setNoticeSent] = useState(false);

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

  const handleCopyCode = () => {
    if (!cls) return;
    navigator.clipboard.writeText(cls.joinCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cls || !postContent.trim()) return;

    const teacherName = user?.displayName || cls.teacherName;
    createStreamPost(cls.id, {
      authorName: teacherName,
      authorRole: "teacher",
      title: postTitle.trim() || undefined,
      content: postContent.trim(),
      audience: postAudience,
      isPinned: postPinned,
      attachments: attachmentName.trim() ? [{ name: attachmentName.trim(), url: "#", type: "pdf" }] : []
    });

    setPostTitle("");
    setPostContent("");
    setAttachmentName("");
    setPostPinned(false);
    setIsPosting(false);
    loadClass();
  };

  const handleAddComment = (postId: string) => {
    if (!cls || !commentText.trim()) return;
    const authorName = user?.displayName || cls.teacherName;
    addCommentToPost(cls.id, postId, {
      authorName,
      authorRole: "teacher",
      text: commentText.trim()
    });
    setCommentText("");
    setActiveCommentPostId(null);
    loadClass();
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cls || !asgTitle.trim()) return;

    createAssignment(cls.id, {
      title: asgTitle.trim(),
      topic: asgTopic.trim(),
      instructions: asgInstructions.trim(),
      dueDate: asgDueDate,
      maxMarks: Number(asgMaxMarks),
      attachments: asgAttachment.trim() ? [{ name: asgAttachment.trim(), url: "#", type: "pdf" }] : []
    });

    setAsgTitle("");
    setAsgInstructions("");
    setAsgAttachment("");
    setIsAssignmentModalOpen(false);
    loadClass();
  };

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cls || !gradingSubmission) return;

    gradeStudentSubmission(cls.id, gradingSubmission.assignmentId, gradingSubmission.submissionId, {
      marks: Number(inputMarks),
      feedback: inputFeedback.trim() || "Good work!"
    });

    setGradingSubmission(null);
    setInputFeedback("");
    loadClass();
  };

  const handleStartLive = () => {
    if (!cls) return;
    const teacherName = user?.displayName || cls.teacherName;
    startLiveClassMeeting(cls.id, {
      title: `Live Session - ${cls.name}`,
      hostName: teacherName
    });
    router.push(`/teacher/class/${cls.id}/live`);
  };

  const handleSendNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cls || !noticeTitle.trim() || !noticeMessage.trim()) return;

    sendParentNotice({
      classId: cls.id,
      className: cls.name,
      teacherName: user?.displayName || cls.teacherName,
      title: noticeTitle.trim(),
      message: noticeMessage.trim(),
      type: noticeType
    });

    setNoticeTitle("");
    setNoticeMessage("");
    setNoticeSent(true);
    setTimeout(() => setNoticeSent(false), 2000);
  };

  if (!cls) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Classroom not found</h2>
        <Link href="/teacher" className="text-indigo-500 font-bold text-sm mt-3 inline-block">
          ← Return to Teacher Dashboard
        </Link>
      </div>
    );
  }

  const isLive = cls.activeMeeting && cls.activeMeeting.status === "live";

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* ── TOP BREADCRUMB ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/teacher"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Teacher Dashboard
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/classroom/${cls.id}`}
            className="text-xs font-bold text-indigo-500 hover:underline flex items-center gap-1"
          >
            Preview as Student <ChevronRight className="w-3.5 h-3.5" />
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
                  Live Meeting Active
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-4xl font-black tracking-tight">{cls.name}</h1>
            <p className="text-xs md:text-sm text-white/80 font-medium leading-relaxed">
              {cls.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-white/90 pt-2 font-medium">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-300" /> {cls.schedule}</span>
              <span>•</span>
              <span>{cls.room}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {cls.enrolledStudents.length} Students Enrolled</span>
            </div>
          </div>

          {/* Right Action Block */}
          <div className="flex flex-col sm:flex-row md:flex-col items-stretch gap-3 shrink-0">
            {/* Join Code Capsule */}
            <div className="bg-black/40 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-center space-y-1">
              <span className="text-[10px] font-bold text-white/70 block uppercase tracking-wider">Student Join Code</span>
              <button
                onClick={handleCopyCode}
                className="w-full py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 font-mono font-black text-sm text-amber-300 flex items-center justify-center gap-2 transition-all"
                title="Click to copy join code"
              >
                {copiedCode ? (
                  <>
                    <CheckCheck className="w-4 h-4 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>{cls.joinCode}</span>
                  </>
                )}
              </button>
            </div>

            {/* Start / Join Live Button */}
            <button
              onClick={handleStartLive}
              className="py-3 px-5 rounded-2xl bg-white text-indigo-950 hover:bg-slate-100 font-black text-xs transition-all shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <Video className="w-4 h-4 text-indigo-600" />
              {isLive ? "Enter Live Classroom" : "Start Live Class"}
            </button>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-white/10 overflow-x-auto pb-1 custom-scrollbar">
        {[
          { id: "stream", label: "Stream & Announcements", icon: MessageSquare },
          { id: "live", label: "Live Meetings", icon: Video },
          { id: "classwork", label: "Classwork & Assignments", icon: BookOpen, count: cls.assignments.length },
          { id: "grades", label: "Submissions & Grading", icon: Award },
          { id: "people", label: "Students & Roster", icon: Users, count: cls.enrolledStudents.length },
          { id: "bridge", label: "School-Home Bridge", icon: GraduationCap }
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
                  layoutId="activeTeacherTab"
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
            {/* Left Column: Upcoming & Code */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-lg space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Class Details</span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                    <span className="text-slate-500">Teacher:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{cls.teacherName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                    <span className="text-slate-500">Join Code:</span>
                    <span className="font-mono font-black text-indigo-500">{cls.joinCode}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                    <span className="text-slate-500">Total Assignments:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{cls.assignments.length}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Schedule:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{cls.schedule}</span>
                  </div>
                </div>
              </div>

              {/* Quick Start Live Card */}
              <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20 rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-indigo-500 font-black text-xs uppercase tracking-wider">
                  <Video className="w-4 h-4" />
                  <span>Interactive Live Meeting</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Host live video class, broadcast your whiteboard, share screen, and track attendance.
                </p>
                <button
                  onClick={handleStartLive}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Video className="w-3.5 h-3.5" />
                  Launch Live Classroom
                </button>
              </div>
            </div>

            {/* Right 2 Columns: Stream Posts & Creator */}
            <div className="lg:col-span-2 space-y-6">
              {/* Post Creator Box */}
              <div className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
                {!isPosting ? (
                  <button
                    onClick={() => setIsPosting(true)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-left text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-3 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                      {cls.teacherName.charAt(0)}
                    </div>
                    <span>Announce something to your class or parents...</span>
                  </button>
                ) : (
                  <form onSubmit={handlePublishPost} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 dark:text-white">New Class Announcement</span>
                      <button
                        type="button"
                        onClick={() => setIsPosting(false)}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Title / Topic (optional)"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <textarea
                      rows={3}
                      required
                      placeholder="Share updates, lecture notes, homework reminders, or study instructions..."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Target Audience</label>
                        <select
                          value={postAudience}
                          onChange={(e) => setPostAudience(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white"
                        >
                          <option value="all">All (Students & Parents)</option>
                          <option value="students">Students Only</option>
                          <option value="parents">Parents Only</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Attach Study Resource / PDF Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Chapter8_Formulas.pdf"
                          value={attachmentName}
                          onChange={(e) => setAttachmentName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={postPinned}
                          onChange={(e) => setPostPinned(e.target.checked)}
                          className="rounded text-indigo-600"
                        />
                        <Pin className="w-3.5 h-3.5" />
                        Pin to top of Stream
                      </label>

                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all shadow-md shadow-indigo-600/20"
                      >
                        Publish Post
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Stream Posts Feed */}
              <div className="space-y-4">
                {cls.posts.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-[#0c1020] rounded-3xl border border-slate-200 dark:border-white/10">
                    <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No stream posts yet</p>
                    <p className="text-[11px] text-slate-400">Post announcements or resources to start the conversation.</p>
                  </div>
                ) : (
                  cls.posts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-lg space-y-4 hover:border-indigo-500/30 transition-all"
                    >
                      {/* Post Header */}
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

                      {/* Post Title & Content */}
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
                              className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between hover:border-indigo-500/40 transition-all"
                            >
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                                <span className="truncate">{att.name}</span>
                              </div>
                              <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                                PDF Document
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment Threads */}
                      <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-3">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                          <span>{post.comments.length} Class Comments</span>
                          <button
                            onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                            className="text-indigo-500 hover:underline"
                          >
                            + Add Comment
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
                              placeholder="Write a reply or comment..."
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
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. LIVE MEETINGS TAB */}
        {activeTab === "live" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 md:p-8 text-white shadow-2xl border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 px-3 py-1 rounded-full border border-indigo-400/30">
                  Virtual Live Classroom
                </span>
                <h3 className="text-2xl font-black">Live Video Lecture & Whiteboard Studio</h3>
                <p className="text-xs md:text-sm text-indigo-200/80 max-w-xl font-medium leading-relaxed">
                  Start an instant interactive video meeting with screen share, live collaborative whiteboard, student hand raising, chat Q&A, and automatic attendance logging.
                </p>
              </div>

              <button
                onClick={handleStartLive}
                className="px-6 py-3.5 rounded-2xl bg-white text-indigo-950 hover:bg-slate-100 font-black text-sm transition-all shadow-xl flex items-center justify-center gap-2 hover:scale-105 shrink-0"
              >
                <Video className="w-5 h-5 text-indigo-600" />
                {isLive ? "Re-enter Live Room" : "Start Live Session Now"}
              </button>
            </div>

            {/* Past Meeting & Attendance Logs */}
            <div className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
              <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                Attendance & Live Sessions Log
              </h4>

              {cls.activeMeeting?.attendanceLog && cls.activeMeeting.attendanceLog.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-black uppercase text-[10px]">
                        <th className="pb-3">Student Name</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Joined Time</th>
                        <th className="pb-3">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-medium">
                      {cls.activeMeeting.attendanceLog.map((att, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                          <td className="py-3 font-bold text-slate-900 dark:text-white">{att.studentName}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">
                              Present
                            </span>
                          </td>
                          <td className="py-3 text-slate-500">
                            {new Date(att.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3 text-slate-500">{att.durationMinutes} mins</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4">No recent attendance records. Start a live session to record student participation.</p>
              )}
            </div>
          </div>
        )}

        {/* 3. CLASSWORK & ASSIGNMENTS TAB */}
        {activeTab === "classwork" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Assignments & Homework Studio</h3>
                <p className="text-xs text-slate-500">Create homework with rubrics, attachments, and due dates</p>
              </div>
              <button
                onClick={() => setIsAssignmentModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all shadow-md flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Assignment
              </button>
            </div>

            <div className="space-y-4">
              {cls.assignments.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-[#0c1020] rounded-3xl border border-slate-200 dark:border-white/10">
                  <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No assignments created yet</p>
                  <p className="text-[11px] text-slate-400 mt-1">Click &quot;Create Assignment&quot; to assign homework to students.</p>
                </div>
              ) : (
                cls.assignments.map((asg) => {
                  const totalSubs = asg.submissions.length;
                  const gradedSubs = asg.submissions.filter(s => s.status === "graded").length;

                  return (
                    <div
                      key={asg.id}
                      className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4 hover:border-indigo-500/30 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                            {asg.topic}
                          </span>
                          <h4 className="text-base font-black text-slate-900 dark:text-white mt-1">
                            {asg.title}
                          </h4>
                          <span className="text-xs text-slate-400">Due: {new Date(asg.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} • Max Marks: {asg.maxMarks}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-sm font-black text-slate-900 dark:text-white block">
                              {totalSubs} / {cls.enrolledStudents.length}
                            </span>
                            <span className="text-[10px] text-slate-400">Submitted ({gradedSubs} Graded)</span>
                          </div>
                          <button
                            onClick={() => setActiveTab("grades")}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-indigo-600 hover:text-white text-slate-800 dark:text-white font-black text-xs transition-all"
                          >
                            View & Grade
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {asg.instructions}
                      </p>

                      {asg.attachments && asg.attachments.length > 0 && (
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-500 pt-1">
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>Attached: {asg.attachments[0].name}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 4. SUBMISSIONS & GRADING STUDIO */}
        {activeTab === "grades" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Submissions & Grading Studio</h3>
                <p className="text-xs text-slate-500">Review student work, score assignments, and return feedback</p>
              </div>
            </div>

            <div className="space-y-6">
              {cls.assignments.map((asg) => (
                <div
                  key={asg.id}
                  className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">{asg.title}</h4>
                      <span className="text-[11px] text-slate-400">Max Marks: {asg.maxMarks} • {asg.submissions.length} Submissions</span>
                    </div>
                  </div>

                  {asg.submissions.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3">No student submissions received yet for this assignment.</p>
                  ) : (
                    <div className="space-y-3">
                      {asg.submissions.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-900 dark:text-white">{sub.studentName}</span>
                              <span className={cn(
                                "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border",
                                sub.status === "graded"
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                  : "bg-amber-500/20 text-amber-500 border-amber-500/30"
                              )}>
                                {sub.status === "graded" ? `Graded: ${sub.marks}/${sub.maxMarks}` : "Pending Review"}
                              </span>
                            </div>
                            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 line-clamp-2 bg-white dark:bg-black/30 p-2.5 rounded-xl border border-slate-200 dark:border-white/5">
                              &quot;{sub.textContent}&quot;
                            </p>
                            {sub.feedback && (
                              <p className="text-[11px] text-indigo-500 font-medium">
                                Teacher Note: {sub.feedback}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              setGradingSubmission({
                                assignmentId: asg.id,
                                submissionId: sub.id,
                                studentName: sub.studentName,
                                textContent: sub.textContent,
                                maxMarks: asg.maxMarks,
                                currentMarks: sub.marks,
                                currentFeedback: sub.feedback
                              });
                              setInputMarks(sub.marks !== undefined ? sub.marks : asg.maxMarks);
                              setInputFeedback(sub.feedback || "");
                            }}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all shadow-sm shrink-0"
                          >
                            {sub.status === "graded" ? "Edit Grade" : "Grade Now"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. STUDENTS & ROSTER TAB */}
        {activeTab === "people" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Teacher & Instructors</span>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-sm">
                  {cls.teacherName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">{cls.teacherName}</h4>
                  <p className="text-xs text-slate-400">{cls.teacherEmail}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  Enrolled Students ({cls.enrolledStudents.length})
                </h4>
                <span className="text-xs font-bold text-indigo-500">Class Code: {cls.joinCode}</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {cls.enrolledStudents.map((std) => (
                  <div key={std.uid} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-200 flex items-center justify-center font-black text-xs">
                        {std.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 dark:text-white block">{std.name}</span>
                        <span className="text-[10px] text-slate-400">{std.email || "student@edutrack.space"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-500">{std.attendancePercent}%</span>
                        <span className="text-[9px] text-slate-400 block">Attendance</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. SCHOOL-TO-HOME BRIDGE TAB */}
        {activeTab === "bridge" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Send Direct Notice to Parents</h3>
                  <p className="text-xs text-slate-500">Notify parents of tonight&apos;s homework, upcoming exams, or behavioral alerts</p>
                </div>
              </div>

              {noticeSent ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center">
                  ✓ Notice successfully dispatched to parents and students!
                </div>
              ) : (
                <form onSubmit={handleSendNotice} className="space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    {(["homework", "exam", "attendance", "general"] as const).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNoticeType(cat)}
                        className={cn(
                          "py-2 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all",
                          noticeType === cat
                            ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                            : "bg-slate-50 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10 hover:border-indigo-500/30"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Notice Headline (e.g. Mandatory Homework: Solve Trigonometry Worksheet tonight)"
                    value={noticeTitle}
                    onChange={(e) => setNoticeTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <textarea
                    rows={3}
                    required
                    placeholder="Message for parents (e.g. Please verify that your child finishes all questions before tomorrow's class)..."
                    value={noticeMessage}
                    onChange={(e) => setNoticeMessage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Dispatch to Parents
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── CREATE ASSIGNMENT MODAL ── */}
      <AnimatePresence>
        {isAssignmentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/15 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Create New Assignment</h3>
                  <p className="text-xs text-slate-500">Students will submit their answers and receive marks</p>
                </div>
                <button
                  onClick={() => setIsAssignmentModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Assignment Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Trigonometric Identities Exercise 8.4 Solutions"
                    value={asgTitle}
                    onChange={(e) => setAsgTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Topic / Unit</label>
                    <input
                      type="text"
                      placeholder="e.g. Trigonometry"
                      value={asgTopic}
                      onChange={(e) => setAsgTopic(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Max Marks *</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={asgMaxMarks}
                      onChange={(e) => setAsgMaxMarks(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Due Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={asgDueDate}
                    onChange={(e) => setAsgDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Instructions & Problem Set *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="List specific questions to solve, steps to show, or criteria..."
                    value={asgInstructions}
                    onChange={(e) => setAsgInstructions(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Attach Problem Sheet / PDF (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Exercise_8.4_Problems.pdf"
                    value={asgAttachment}
                    onChange={(e) => setAsgAttachment(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAssignmentModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-lg shadow-indigo-500/30"
                  >
                    Assign to Class
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── GRADING MODAL ── */}
      <AnimatePresence>
        {gradingSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/15 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Grade Submission: {gradingSubmission.studentName}
                  </h3>
                  <p className="text-xs text-slate-500">Max Marks: {gradingSubmission.maxMarks}</p>
                </div>
                <button
                  onClick={() => setGradingSubmission(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
                <span className="text-[10px] font-black uppercase text-indigo-400">Student Submitted Work:</span>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-mono bg-white dark:bg-black/40 p-3 rounded-xl border border-slate-200 dark:border-white/5 max-h-40 overflow-y-auto">
                  {gradingSubmission.textContent || "No text submitted."}
                </p>
              </div>

              <form onSubmit={handleGradeSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Marks Awarded (Out of {gradingSubmission.maxMarks}) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={gradingSubmission.maxMarks}
                    required
                    value={inputMarks}
                    onChange={(e) => setInputMarks(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Teacher Feedback & Corrections
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide constructive feedback, notes on steps to improve, or praises..."
                    value={inputFeedback}
                    onChange={(e) => setInputFeedback(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setGradingSubmission(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-lg shadow-emerald-500/30 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Save & Return Grade
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
