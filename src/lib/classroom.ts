// EduTrack Classroom Engine & School-to-Home Bridge Data Layer

export interface StreamComment {
  id: string;
  authorName: string;
  authorRole: "teacher" | "student" | "parent";
  authorAvatar?: string;
  text: string;
  timestamp: number;
}

export interface StreamPost {
  id: string;
  classId: string;
  authorName: string;
  authorRole: "teacher" | "student";
  title?: string;
  content: string;
  attachments?: {
    name: string;
    url: string;
    type: "pdf" | "image" | "link" | "doc";
  }[];
  isPinned?: boolean;
  audience: "all" | "students" | "parents";
  createdAt: number;
  comments: StreamComment[];
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentUid: string;
  studentName: string;
  studentEmail?: string;
  submittedAt: number;
  textContent: string;
  files?: {
    name: string;
    url: string;
    size?: string;
  }[];
  status: "submitted" | "graded" | "late";
  marks?: number;
  maxMarks: number;
  feedback?: string;
  gradedAt?: number;
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  instructions: string;
  topic: string;
  dueDate: string; // ISO string e.g. "2026-08-22T23:59"
  maxMarks: number;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  submissions: AssignmentSubmission[];
  createdAt: number;
}

export interface LiveMeeting {
  id: string;
  classId: string;
  title: string;
  hostName: string;
  status: "scheduled" | "live" | "ended";
  scheduledTime?: string;
  startedAt?: number;
  endedAt?: number;
  roomName: string;
  activeAttendees: string[];
  attendanceLog: {
    studentName: string;
    studentUid: string;
    joinedAt: number;
    durationMinutes: number;
    present: boolean;
  }[];
}

export interface Classroom {
  id: string;
  name: string;
  section: string;
  subject: string;
  grade: string;
  room: string;
  teacherUid: string;
  teacherName: string;
  teacherEmail: string;
  joinCode: string;
  bannerGradient: string;
  description: string;
  schedule: string;
  enrolledStudents: {
    uid: string;
    name: string;
    email?: string;
    joinedAt: number;
    attendancePercent: number;
  }[];
  posts: StreamPost[];
  assignments: Assignment[];
  activeMeeting?: LiveMeeting | null;
  createdAt: number;
}

export interface ParentNotice {
  id: string;
  classId: string;
  className: string;
  teacherName: string;
  title: string;
  message: string;
  type: "homework" | "attendance" | "exam" | "general" | "urgent";
  date: string;
  read?: boolean;
}

// Pre-populated realistic classes for initial experience
const INITIAL_CLASSES: Classroom[] = [];

const STORAGE_KEY = "edutrack_classrooms_v3";
const PARENT_NOTICES_KEY = "edutrack_parent_notices";

export function getStoredClassrooms(): Classroom[] {
  if (typeof window === "undefined") return INITIAL_CLASSES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CLASSES));
      return INITIAL_CLASSES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading classrooms from storage:", e);
    return INITIAL_CLASSES;
  }
}

export function saveClassrooms(classes: Classroom[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
    window.dispatchEvent(new CustomEvent("edutrack_classrooms_updated"));
  } catch (e) {
    console.error("Error saving classrooms to storage:", e);
  }
}

export function getClassroomById(id: string): Classroom | null {
  const classes = getStoredClassrooms();
  return classes.find(c => c.id === id) || null;
}

export function createNewClassroom(data: {
  name: string;
  section: string;
  subject: string;
  grade: string;
  room?: string;
  schedule?: string;
  description?: string;
  teacherName: string;
  teacherEmail: string;
  teacherUid: string;
  bannerGradient?: string;
}): Classroom {
  const classes = getStoredClassrooms();
  
  // Generate friendly 6-character uppercase code (e.g. "PHY10X")
  const subPrefix = (data.subject || "CLS").slice(0, 3).toUpperCase();
  const randNum = Math.floor(10 + Math.random() * 90);
  const randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const joinCode = `${subPrefix}${randNum}${randLetter}`;

  const gradients = [
    "from-indigo-600 via-purple-600 to-pink-600",
    "from-blue-600 via-indigo-600 to-violet-700",
    "from-emerald-600 via-teal-600 to-cyan-700",
    "from-amber-600 via-orange-600 to-red-600",
    "from-violet-600 via-fuchsia-600 to-rose-600",
    "from-rose-600 via-pink-600 to-purple-700"
  ];

  const newClass: Classroom = {
    id: `cls-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name: data.name,
    section: data.section || "Section A",
    subject: data.subject || "General",
    grade: data.grade || "Class 10",
    room: data.room || "Room 101",
    teacherUid: data.teacherUid || "teacher-current",
    teacherName: data.teacherName || "Teacher",
    teacherEmail: data.teacherEmail || "teacher@edutrack.space",
    joinCode,
    bannerGradient: data.bannerGradient || gradients[Math.floor(Math.random() * gradients.length)],
    description: data.description || "Interactive virtual classroom with live lectures and homework grading.",
    schedule: data.schedule || "Mon, Wed, Fri • 10:00 AM",
    enrolledStudents: [
      { uid: "sandbox-student-101", name: "Scholar Student", email: "student@edutrack.space", joinedAt: Date.now(), attendancePercent: 100 }
    ],
    posts: [
      {
        id: `post-${Date.now()}`,
        classId: "",
        authorName: data.teacherName || "Teacher",
        authorRole: "teacher",
        title: `Welcome to ${data.name}!`,
        content: `Welcome students and parents to our official virtual classroom! Here you will find all class announcements, live lecture links, homework assignments, and lecture notes.`,
        isPinned: true,
        audience: "all",
        createdAt: Date.now(),
        comments: []
      }
    ],
    assignments: [],
    createdAt: Date.now()
  };

  newClass.posts[0].classId = newClass.id;
  classes.unshift(newClass);
  saveClassrooms(classes);
  return newClass;
}

export function joinClassByCode(code: string, student: { uid: string; name: string; email?: string }): { success: boolean; message: string; classroom?: Classroom } {
  const classes = getStoredClassrooms();
  const cleanCode = code.trim().toUpperCase();
  const targetClass = classes.find(c => c.joinCode.toUpperCase() === cleanCode);

  if (!targetClass) {
    return { success: false, message: `No classroom found with Join Code "${cleanCode}". Please verify with your teacher.` };
  }

  // Check if already enrolled
  const isEnrolled = targetClass.enrolledStudents.some(s => s.uid === student.uid || s.name === student.name);
  if (isEnrolled) {
    return { success: true, message: `You are already enrolled in ${targetClass.name}!`, classroom: targetClass };
  }

  targetClass.enrolledStudents.push({
    uid: student.uid,
    name: student.name,
    email: student.email,
    joinedAt: Date.now(),
    attendancePercent: 100
  });

  saveClassrooms(classes);
  return { success: true, message: `Successfully joined ${targetClass.name}!`, classroom: targetClass };
}

export function createStreamPost(classId: string, postData: {
  authorName: string;
  authorRole: "teacher" | "student";
  title?: string;
  content: string;
  attachments?: { name: string; url: string; type: "pdf" | "image" | "link" | "doc" }[];
  isPinned?: boolean;
  audience?: "all" | "students" | "parents";
}): StreamPost | null {
  const classes = getStoredClassrooms();
  const target = classes.find(c => c.id === classId);
  if (!target) return null;

  const newPost: StreamPost = {
    id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    classId,
    authorName: postData.authorName,
    authorRole: postData.authorRole,
    title: postData.title,
    content: postData.content,
    attachments: postData.attachments || [],
    isPinned: !!postData.isPinned,
    audience: postData.audience || "all",
    createdAt: Date.now(),
    comments: []
  };

  target.posts.unshift(newPost);
  saveClassrooms(classes);
  return newPost;
}

export function addCommentToPost(classId: string, postId: string, commentData: {
  authorName: string;
  authorRole: "teacher" | "student" | "parent";
  text: string;
}): StreamComment | null {
  const classes = getStoredClassrooms();
  const target = classes.find(c => c.id === classId);
  if (!target) return null;

  const post = target.posts.find(p => p.id === postId);
  if (!post) return null;

  const comment: StreamComment = {
    id: `comm-${Date.now()}`,
    authorName: commentData.authorName,
    authorRole: commentData.authorRole,
    text: commentData.text,
    timestamp: Date.now()
  };

  post.comments.push(comment);
  saveClassrooms(classes);
  return comment;
}

export function createAssignment(classId: string, asgData: {
  title: string;
  instructions: string;
  topic: string;
  dueDate: string;
  maxMarks: number;
  attachments?: { name: string; url: string; type: string }[];
}): Assignment | null {
  const classes = getStoredClassrooms();
  const target = classes.find(c => c.id === classId);
  if (!target) return null;

  const newAsg: Assignment = {
    id: `asg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    classId,
    title: asgData.title,
    instructions: asgData.instructions,
    topic: asgData.topic || "General",
    dueDate: asgData.dueDate,
    maxMarks: asgData.maxMarks || 20,
    attachments: asgData.attachments || [],
    submissions: [],
    createdAt: Date.now()
  };

  target.assignments.unshift(newAsg);
  saveClassrooms(classes);
  return newAsg;
}

export function submitAssignmentWork(classId: string, assignmentId: string, submissionData: {
  studentUid: string;
  studentName: string;
  studentEmail?: string;
  textContent: string;
  files?: { name: string; url: string; size?: string }[];
}): AssignmentSubmission | null {
  const classes = getStoredClassrooms();
  const target = classes.find(c => c.id === classId);
  if (!target) return null;

  const asg = target.assignments.find(a => a.id === assignmentId);
  if (!asg) return null;

  // Remove previous submission if re-submitting
  asg.submissions = asg.submissions.filter(s => s.studentUid !== submissionData.studentUid && s.studentName !== submissionData.studentName);

  const newSub: AssignmentSubmission = {
    id: `sub-${Date.now()}`,
    assignmentId,
    studentUid: submissionData.studentUid,
    studentName: submissionData.studentName,
    studentEmail: submissionData.studentEmail,
    submittedAt: Date.now(),
    textContent: submissionData.textContent,
    files: submissionData.files || [],
    status: "submitted",
    maxMarks: asg.maxMarks
  };

  asg.submissions.push(newSub);
  saveClassrooms(classes);
  return newSub;
}

export function gradeStudentSubmission(classId: string, assignmentId: string, submissionId: string, gradeData: {
  marks: number;
  feedback: string;
}): boolean {
  const classes = getStoredClassrooms();
  const target = classes.find(c => c.id === classId);
  if (!target) return false;

  const asg = target.assignments.find(a => a.id === assignmentId);
  if (!asg) return false;

  const sub = asg.submissions.find(s => s.id === submissionId);
  if (!sub) return false;

  sub.marks = gradeData.marks;
  sub.feedback = gradeData.feedback;
  sub.status = "graded";
  sub.gradedAt = Date.now();

  saveClassrooms(classes);
  return true;
}

export function startLiveClassMeeting(classId: string, meetingData: {
  title: string;
  hostName: string;
}): LiveMeeting | null {
  const classes = getStoredClassrooms();
  const target = classes.find(c => c.id === classId);
  if (!target) return null;

  const meeting: LiveMeeting = {
    id: `meet-${Date.now()}`,
    classId,
    title: meetingData.title || `Live Session - ${target.name}`,
    hostName: meetingData.hostName,
    status: "live",
    startedAt: Date.now(),
    roomName: `room-${target.id}`,
    activeAttendees: [meetingData.hostName],
    attendanceLog: []
  };

  target.activeMeeting = meeting;
  saveClassrooms(classes);
  return meeting;
}

export function endLiveClassMeeting(classId: string): boolean {
  const classes = getStoredClassrooms();
  const target = classes.find(c => c.id === classId);
  if (!target) return false;

  if (target.activeMeeting) {
    target.activeMeeting.status = "ended";
    target.activeMeeting.endedAt = Date.now();
    target.activeMeeting = null;
  }

  saveClassrooms(classes);
  return true;
}

export function recordMeetingAttendance(classId: string, student: { uid: string; name: string }): void {
  const classes = getStoredClassrooms();
  const target = classes.find(c => c.id === classId);
  if (!target || !target.activeMeeting) return;

  if (!target.activeMeeting.activeAttendees.includes(student.name)) {
    target.activeMeeting.activeAttendees.push(student.name);
  }

  const existingLog = target.activeMeeting.attendanceLog.find(a => a.studentUid === student.uid || a.studentName === student.name);
  if (!existingLog) {
    target.activeMeeting.attendanceLog.push({
      studentName: student.name,
      studentUid: student.uid,
      joinedAt: Date.now(),
      durationMinutes: 1,
      present: true
    });
  }

  saveClassrooms(classes);
}

// School-to-Home Parent Notices
export function getParentNotices(): ParentNotice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PARENT_NOTICES_KEY);
    if (!raw) {
      const defaultNotices: ParentNotice[] = [
        {
          id: "not-1",
          classId: "cls-math-10a",
          className: "Class 10 - Mathematics",
          teacherName: "Dr. Rajesh Sharma",
          title: "Daily Homework Alert: Trigonometry Exercise 8.4",
          message: "Please ensure your ward completes Questions 1-10 of Exercise 8.4 in their notebook for tomorrow's verification.",
          type: "homework",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        },
        {
          id: "not-2",
          classId: "cls-sci-10a",
          className: "Class 10 - Science",
          teacherName: "Prof. Sunita Verma",
          title: "Upcoming Science Unit Test & Lab Assessment",
          message: "The Unit Test on Light Optics and Electricity is scheduled for next Monday. Study materials have been shared on the stream.",
          type: "exam",
          date: new Date(Date.now() - 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        }
      ];
      localStorage.setItem(PARENT_NOTICES_KEY, JSON.stringify(defaultNotices));
      return defaultNotices;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function sendParentNotice(notice: Omit<ParentNotice, "id" | "date">): ParentNotice {
  const notices = getParentNotices();
  const newNotice: ParentNotice = {
    id: `not-${Date.now()}`,
    ...notice,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  };
  notices.unshift(newNotice);
  if (typeof window !== "undefined") {
    localStorage.setItem(PARENT_NOTICES_KEY, JSON.stringify(notices));
    window.dispatchEvent(new CustomEvent("edutrack_parent_notices_updated"));
  }
  return newNotice;
}
