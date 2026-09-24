import { requireSessionUser } from "@/lib/session";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const user = await requireSessionUser();
  return <DashboardClient user={{ name: user.name, email: user.email }} />;
}
