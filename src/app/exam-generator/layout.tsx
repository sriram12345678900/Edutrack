import SidebarLayout from "@/components/SidebarLayout";

export default function ExamGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
