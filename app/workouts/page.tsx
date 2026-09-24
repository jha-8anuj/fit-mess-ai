import { requireSessionUser } from "@/lib/session";
import WorkoutsClient from "./workouts-client";

export default async function WorkoutPage() {
  const user = await requireSessionUser();
  return <WorkoutsClient user={{ name: user.name, email: user.email }} />;
}
