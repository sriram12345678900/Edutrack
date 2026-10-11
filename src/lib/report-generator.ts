// EduTrack PDF Progress Report Generator (uses jsPDF)

import jsPDF from "jspdf";

export interface ReportData {
  studentName: string;
  className: number;
  totalXP: number;
  level: number;
  streak: number;
  executiveSummary: string;
  keyStrengths: string[];
  priorityGrowthAreas: string[];
}

export function generateStudentPdfReport(data: ReportData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner Background
  doc.setFillColor(15, 23, 42); // Deep slate
  doc.rect(0, 0, pageWidth, 42, "F");

  // Accent Line
  doc.setFillColor(99, 102, 241); // Indigo
  doc.rect(0, 42, pageWidth, 2, "F");

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("EduTrack • Academic Progress Audit", 16, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(199, 210, 254);
  doc.text(
    `Official Progress Report • CBSE Class ${data.className} • Generated: ${new Date().toLocaleDateString()}`,
    16,
    30
  );

  // Student Profile Summary Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(16, 52, pageWidth - 32, 28, 3, 3, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(16, 52, pageWidth - 32, 28, 3, 3, "S");

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Student: ${data.studentName}`, 22, 63);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Level ${data.level} Scholar`, 22, 72);
  doc.text(`Total Score: ${data.totalXP.toLocaleString()} XP`, 90, 72);
  doc.text(`Study Streak: ${data.streak} Consecutive Days`, 145, 72);

  // Section 1: Executive Summary
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("1. Executive Academic Assessment", 16, 92);

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  const splitSummary = doc.splitTextToSize(data.executiveSummary, pageWidth - 32);
  doc.text(splitSummary, 16, 100);

  let currentY = 100 + splitSummary.length * 5.5 + 8;

  // Section 2: Key Cognitive Strengths
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("2. Key Cognitive & Behavioral Strengths", 16, currentY);

  currentY += 8;
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  data.keyStrengths.forEach((strength) => {
    doc.text(`•  ${strength}`, 20, currentY);
    currentY += 6;
  });

  currentY += 6;

  // Section 3: Priority Growth Areas
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("3. High-Impact Study Targets for Next Week", 16, currentY);

  currentY += 8;
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);

  data.priorityGrowthAreas.forEach((area) => {
    doc.text(`•  ${area}`, 20, currentY);
    currentY += 6;
  });

  // Footer Note
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "EduTrack AI Learning OS • Verified CBSE Academic Transcript • Encrypted Client-Side Report",
    pageWidth / 2,
    pageHeight - 12,
    { align: "center" }
  );

  doc.save(`EduTrack_Progress_Report_${data.studentName.replace(/\s+/g, "_")}.pdf`);
}
