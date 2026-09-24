import { requireSessionUser } from "@/lib/session";
import RoutineClient from "./routine-client";

export default async function RoutinePage() {
  const user = await requireSessionUser();
  return <RoutineClient user={{ name: user.name, email: user.email }} />;
}
