import SidebarLayout from "@/components/SidebarLayout";

export default function SkillTreeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
