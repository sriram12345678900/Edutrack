import SidebarLayout from "@/components/SidebarLayout";

export const metadata = {
  title: "Concept Mind Maps & Knowledge Graph | EduTrack",
  description: "Explore interactive prerequisite dependency graphs and concept mastery trees for CBSE Class 10",
};

export default function MindmapLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
