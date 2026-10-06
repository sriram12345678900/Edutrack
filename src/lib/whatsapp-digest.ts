// EduTrack WhatsApp Parent Digest Generator
// Produces high-engagement, culturally tailored WhatsApp academic progress reports for Indian parents

export interface StudentDigestData {
  studentName: string;
  classLevel: number | string;
  schoolName?: string;
  periodText: string; // e.g. "Weekly Report (22 Sep - 28 Sep)"
  studyHours: number;
  streakDays: number;
  questionsSolved: number;
  accuracyRate: number; // percentage (e.g. 84)
  srsCardsReviewed: number;
  strongChapters: string[];
  weakChapters: string[];
  upcomingExam?: {
    name: string;
    daysRemaining: number;
  };
  tutorNote: string;
}

export function generateWhatsAppDigest(data: StudentDigestData): string {
  const examLine = data.upcomingExam
    ? `\n⏳ *Upcoming Exam:* ${data.upcomingExam.name} in *${data.upcomingExam.daysRemaining} days*\n`
    : '';

  const strongList = data.strongChapters.map(c => `  ✅ ${c}`).join('\n');
  const weakList = data.weakChapters.map(c => `  ⚠️ ${c}`).join('\n');

  return `📚 *EduTrack AI — Weekly Academic Progress Report*
━━━━━━━━━━━━━━━━━━━━━
👤 *Student:* ${data.studentName}
🏫 *Class:* ${data.classLevel} ${data.schoolName ? `(${data.schoolName})` : ''}
📅 *Period:* ${data.periodText}
${examLine}
📊 *Weekly Effort & Consistency:*
• 🔥 *Active Study Streak:* ${data.streakDays} Days
• ⏱️ *Focus Time Logged:* ${data.studyHours} hours
• 🎯 *Questions Practiced:* ${data.questionsSolved} questions
• 📈 *Overall Accuracy:* *${data.accuracyRate}%*
• 🧠 *Memory (SRS) Cards Mastered:* ${data.srsCardsReviewed}

🌟 *Strong Mastery Topics:*
${strongList || '  ✅ Consistent performance across syllabus'}

🔍 *Focus Areas for Coming Week (Needs Revision):*
${weakList || '  ✨ No critical concept gaps detected!'}

💬 *AI Tutor & Teacher Remark:*
_"${data.tutorNote}"_

━━━━━━━━━━━━━━━━━━━━━
📲 *View detailed analytics & solved worksheets:*
https://edutrack.app/student/report`;
}

export function getWhatsAppShareUrl(message: string, phoneNumber?: string): string {
  const encoded = encodeURIComponent(message);
  if (phoneNumber) {
    // Strip non-digit characters
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    return `https://wa.me/${cleanNumber}?text=${encoded}`;
  }
  return `https://api.whatsapp.com/send?text=${encoded}`;
}

export const SAMPLE_STUDENT_DIGEST: StudentDigestData = {
  studentName: 'Aarav Sharma',
  classLevel: 'Class 10 CBSE',
  schoolName: 'Delhi Public School',
  periodText: 'Week 39 (Board Exam Prep Sprint)',
  studyHours: 14.5,
  streakDays: 24,
  questionsSolved: 168,
  accuracyRate: 86,
  srsCardsReviewed: 52,
  strongChapters: [
    'Chemical Reactions & Equations (94% Accuracy)',
    'Quadratic Equations & Roots (91% Accuracy)'
  ],
  weakChapters: [
    'Light: Reflection & Refraction (Sign Convention)',
    'Life Processes: Double Circulation Blood Flow'
  ],
  upcomingExam: {
    name: 'CBSE Class 10 Pre-Board Examination',
    daysRemaining: 136
  },
  tutorNote: 'Aarav has shown outstanding commitment this week, solving over 160 questions and maintaining his 24-day streak. With focused revision on lens formula sign conventions, his pre-board score will easily cross 95%!'
};
