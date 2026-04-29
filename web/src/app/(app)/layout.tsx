import { ClientLayout } from "../../components/Layout/ClientLayout";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
