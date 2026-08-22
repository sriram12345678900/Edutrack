import SidebarLayout from "@/components/SidebarLayout";

export default function VivaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
