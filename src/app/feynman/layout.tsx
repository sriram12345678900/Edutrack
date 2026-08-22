import SidebarLayout from "@/components/SidebarLayout";

export default function FeynmanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
