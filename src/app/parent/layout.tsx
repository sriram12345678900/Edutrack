import SidebarLayout from "@/components/SidebarLayout";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
