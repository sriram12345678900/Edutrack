import SidebarLayout from "@/components/SidebarLayout";

export const metadata = {
  title: "Handwritten Answer Sheet AI Grader | EduTrack",
  description: "CBSE step-by-step marking engine with OCR analysis and examiner feedback",
};

export default function GraderLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
