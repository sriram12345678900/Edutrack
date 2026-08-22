import SidebarLayout from "@/components/SidebarLayout";

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
