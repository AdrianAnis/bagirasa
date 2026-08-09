import { AppShell } from "@/components/shared/AppShell";

export default function DonorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
