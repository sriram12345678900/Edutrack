import SidebarLayout from "@/components/SidebarLayout";
export const metadata = { title: "Intelligent Error Vault | EduTrack", description: "Review and master past mistakes and conceptual gaps" };
export default function ErrorsLayout({ children }: { children: React.ReactNode }) { return <SidebarLayout>{children}</SidebarLayout>; }