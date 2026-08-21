import SidebarLayout from "@/components/SidebarLayout";

export const metadata = {
  title: "Avatar & Theme XP Marketplace | EduTrack",
  description: "Spend your earned academic XP on custom avatar frames, sound packs, and neon themes",
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
