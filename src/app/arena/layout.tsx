import SidebarLayout from "@/components/SidebarLayout";

export default function ArenaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
