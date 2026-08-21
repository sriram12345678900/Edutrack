"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, Plus, Video, BookOpen, Users, Clock, 
  Sparkles, CheckCircle2, ChevronRight, Copy, CheckCheck, 
  Send, AlertCircle, Award, Calendar, BarChart3, Layers, FileText, Bell
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { 
  Classroom, 
  getStoredClassrooms, 
  createNewClassroom, 
  startLiveClassMeeting,
  gradeStudentSubmission,
  sendParentNotice,
  getParentNotices
} from "@/lib/classroom";
import { cn } from "@/lib/utils";

export default function TeacherDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New Class Form State
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("Section A");
  const [subject, setSubject] = useState("Mathematics");
  const [grade, setGrade] = useState("Class 10");
  const [room, setRoom] = useState("Room 201");
  const [schedule, setSchedule] = useState("Mon, Wed, Fri • 09:00 AM");
  const [description, setDescription] = useState("");

  // Parent Notice Form State
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [noticeClassId, setNoticeClassId] = useState("");
  const [noticeType, setNoticeType] = useState<"homework" | "exam" | "attendance" | "general">("homework");
  const [noticeSuccess, setNoticeSuccess] = useState(false);

  // Quick Grading State
  const [gradingSubmission, setGradingSubmission] = useState<{
    classId: string;
    className: string;
    assignmentId: string;
    assignmentTitle: string;
    submissionId: string;
    studentName: string;
    textContent: string;
    maxMarks: number;
  } | null>(null);
  const [gradeMarks, setGradeMarks] = useState<number>(20);
  const [gradeFeedback, setGradeFeedback] = useState("");

  useEffect(() => {
    loadClasses();
    const handleUpdate = () => loadClasses();
    window.addEventListener("edutrack_classrooms_updated", handleUpdate);
    return () => window.removeEventListener("edutrack_classrooms_updated", handleUpdate);
  }, []);

  const loadClasses = () => {
    const list = getStoredClassrooms();
    setClasses(list);
    if (list.length > 0 && !noticeClassId) {
      setNoticeClassId(list[0].id);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    const teacherName = user?.displayName || "Dr. Rajesh Sharma";
    const teacherEmail = user?.email || "teacher@edutrack.space";
    const teacherUid = user?.uid || "teacher-current";

    const created = createNewClassroom({
      name: className.trim(),
      section: section.trim(),
      subject: subject.trim(),
      grade: grade.trim(),
      room: room.trim(),
      schedule: schedule.trim(),
      description: description.trim(),
      teacherName,
      teacherEmail,
      teacherUid
    });

    setIsCreateModalOpen(false);
    setClassName("");
    setDescription("");
    router.push(`/teacher/class/${created.id}`);
  };

  const handleSendNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeMessage.trim()) return;

    const targetClass = classes.find(c => c.id === noticeClassId) || classes[0];
    const teacherName = user?.displayName || targetClass?.teacherName || "Teacher";

    sendParentNotice({
      classId: targetClass ? targetClass.id : "all",
      className: targetClass ? targetClass.name : "All Classes",
      teacherName,
      title: noticeTitle.trim(),
      message: noticeMessage.trim(),
      type: noticeType
    });

    setNoticeTitle("");
    setNoticeMessage("");
    setNoticeSuccess(true);
    setTimeout(() => {
      setNoticeSuccess(false);
      setIsNoticeModalOpen(false);
    }, 1500);
  };

  const handleQuickGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    gradeStudentSubmission(
      gradingSubmission.classId,
      gradingSubmission.assignmentId,
      gradingSubmission.submissionId,
      {
        marks: Number(gradeMarks),
        feedback: gradeFeedback.trim() || "Good work! Keep practicing."
      }
    );

    setGradingSubmission(null);
    setGradeFeedback("");
    loadClasses();
  };

  // Aggregated Stats
  const totalStudents = classes.reduce((acc, c) => acc + c.enrolledStudents.length, 0);
  const allSubmissions = classes.flatMap(c => 
    c.assignments.flatMap(a => 
      a.submissions.map(s => ({
        ...s,
        classId: c.id,
        className: c.name,
        assignmentId: a.id,
        assignmentTitle: a.title,
        maxMarks: a.maxMarks
      }))
    )
  );
  const pendingSubmissions = allSubmissions.filter(s => s.status === "submitted");
  const liveClassesCount = classes.filter(c => c.activeMeeting && c.activeMeeting.status === "live").length;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* ── TEACHER HUB HEADER ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 border border-indigo-500/30 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-black uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-indigo-300" />
              Teacher Command Center
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
              Virtual Classroom & School Bridge
            </h1>
            <p className="text-sm md:text-base text-indigo-200/80 max-w-2xl font-medium leading-relaxed">
              Conduct live video lectures with interactive whiteboard, manage assignments & grades, broadcast stream announcements, and keep parents updated in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsNoticeModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs transition-all border border-white/15 flex items-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4 text-indigo-300" />
              Dispatch Parent Notice
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold text-xs transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Class
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300">Active Classes</span>
            <p className="text-2xl font-black text-white mt-1">{classes.length}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300">Enrolled Students</span>
            <p className="text-2xl font-black text-white mt-1">{totalStudents}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">Pending Grading</span>
            <p className="text-2xl font-black text-amber-400 mt-1">{pendingSubmissions.length}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">Live Lectures</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <p className="text-2xl font-black text-emerald-400">{liveClassesCount} Live</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── TEACHER'S CLASSROOMS GRID ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              My Teaching Classes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage stream discussions, assignments, rosters, and live meetings</p>
          </div>
          <Link
            href="/classroom"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Switch to Student View <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => {
            const isLive = cls.activeMeeting && cls.activeMeeting.status === "live";
            const pendingForThisClass = cls.assignments.flatMap(a => a.submissions.filter(s => s.status === "submitted")).length;

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
                        {cls.grade} • {cls.section}
                      </span>
                      <h3 className="text-lg font-black mt-2 line-clamp-1 group-hover:text-white">
                        {cls.name}
                      </h3>
                      <p className="text-xs text-white/80 font-medium">{cls.subject} • {cls.room}</p>
                    </div>

                    {isLive && (
                      <span className="flex items-center gap-1.5 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        Live Now
                      </span>
                    )}
                  </div>

                  {/* Join Code Capsule */}
                  <div className="mt-4 flex items-center justify-between bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15">
                    <span className="text-[10px] font-bold text-white/80">Student Join Code:</span>
                    <button
                      onClick={() => handleCopy(cls.joinCode)}
                      className="flex items-center gap-1 text-xs font-mono font-black text-amber-300 hover:text-amber-200 transition-colors bg-white/10 px-2 py-0.5 rounded-md"
                      title="Click to copy join code"
                    >
                      {copiedCode === cls.joinCode ? (
                        <>
                          <CheckCheck className="w-3 h-3 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>{cls.joinCode}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Class Content Summary */}
                <div className="p-5 space-y-4 flex-1">
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {cls.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-white/5 text-center">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.03]">
                      <span className="text-[10px] text-slate-400 font-bold block">Students</span>
                      <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                        {cls.enrolledStudents.length}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.03]">
                      <span className="text-[10px] text-slate-400 font-bold block">Assignments</span>
                      <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                        {cls.assignments.length}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.03]">
                      <span className="text-[10px] text-amber-500 font-bold block">To Grade</span>
                      <span className="text-sm font-black text-amber-500">
                        {pendingForThisClass}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{cls.schedule}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
                  <Link
                    href={`/teacher/class/${cls.id}/live`}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
                  >
                    <Video className="w-3.5 h-3.5" />
                    {isLive ? "Enter Live Class" : "Start Live"}
                  </Link>

                  <Link
                    href={`/teacher/class/${cls.id}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-black flex items-center justify-center gap-1 transition-all"
                  >
                    Manage Class <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── PENDING GRADING STUDIO & PARENT BRIDGE NOTICES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Grading Queue */}
        <div className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Submissions Awaiting Grading ({pendingSubmissions.length})
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Quick Assessment</span>
          </div>

          {pendingSubmissions.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">All submissions are graded!</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Students will receive their scores and feedback automatically.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {pendingSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/5 flex items-center justify-between gap-3 hover:border-indigo-500/30 transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {sub.studentName}
                      </span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                        {sub.className}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                      {sub.assignmentTitle}
                    </p>
                    <p className="text-[10px] text-slate-400 line-clamp-1 italic">
                      &quot;{sub.textContent}&quot;
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setGradingSubmission({
                        classId: sub.classId,
                        className: sub.className,
                        assignmentId: sub.assignmentId,
                        assignmentTitle: sub.assignmentTitle,
                        submissionId: sub.id,
                        studentName: sub.studentName,
                        textContent: sub.textContent || "",
                        maxMarks: sub.maxMarks
                      });
                      setGradeMarks(sub.maxMarks);
                      setGradeFeedback("");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-black text-xs transition-all shrink-0 shadow-sm"
                  >
                    Grade
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Parent Home Bridge Notices */}
        <div className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-500" />
              Recent Parent & Home Notices
            </h3>
            <button
              onClick={() => setIsNoticeModalOpen(true)}
              className="text-xs font-bold text-indigo-500 hover:underline"
            >
              + Send New
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            {getParentNotices().map((not) => (
              <div
                key={not.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/5 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {not.title}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 shrink-0">{not.date}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                  {not.message}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-indigo-500 font-bold">
                  <span>{not.className}</span> • <span>By {not.teacherName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CREATE CLASS MODAL ── */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/15 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Create New Classroom</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Students will join using an auto-generated 6-character code</p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateClass} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Class Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class 10 - Mathematics (Core)"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Subject *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Physics, Math"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Grade / Level *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Class 10"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Section</label>
                    <input
                      type="text"
                      placeholder="e.g. Section A"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Room / Lab</label>
                    <input
                      type="text"
                      placeholder="e.g. Room 302"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Class Schedule</label>
                  <input
                    type="text"
                    placeholder="e.g. Mon, Wed, Fri • 09:00 AM - 10:00 AM"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Description & Syllabus Overview</label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of chapters and topics..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-lg shadow-indigo-500/30"
                  >
                    Create & Launch
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DISPATCH PARENT NOTICE MODAL ── */}
      <AnimatePresence>
        {isNoticeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#0c1020] border border-slate-200 dark:border-white/15 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Dispatch Parent & Home Notice</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Direct notice to parents regarding homework, attendance, or exams</p>
                </div>
                <button
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>

              {noticeSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <p className="text-sm font-black text-slate-900 dark:text-white">Notice Dispatched Successfully!</p>
                  <p className="text-xs text-slate-500">Parents and students will see this in the School-Home Bridge.</p>
                </div>
              ) : (
                <form onSubmit={handleSendNotice} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Class</label>
                    <select
                      value={noticeClassId}
                      onChange={(e) => setNoticeClassId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Notice Category</label>
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
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Notice Headline *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Daily Homework Reminder: Science Chapter 10"
                      value={noticeTitle}
                      onChange={(e) => setNoticeTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Message for Parents *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Write instructions, required preparation, or reminder details..."
                      value={noticeMessage}
                      onChange={(e) => setNoticeMessage(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsNoticeModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-lg shadow-indigo-500/30 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Dispatch to Parents
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── QUICK GRADING MODAL ── */}
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
                  <p className="text-xs text-slate-500">{gradingSubmission.assignmentTitle} ({gradingSubmission.className})</p>
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
                  {gradingSubmission.textContent || "No text content submitted."}
                </p>
              </div>

              <form onSubmit={handleQuickGrade} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Marks Awarded (Out of {gradingSubmission.maxMarks}) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={gradingSubmission.maxMarks}
                    required
                    value={gradeMarks}
                    onChange={(e) => setGradeMarks(Number(e.target.value))}
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
                    value={gradeFeedback}
                    onChange={(e) => setGradeFeedback(e.target.value)}
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
                    Submit Grade & Feedback
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
