import SidebarLayout from "@/components/SidebarLayout";

export default function PodcastLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
