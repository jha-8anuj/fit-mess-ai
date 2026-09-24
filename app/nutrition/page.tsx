import { requireSessionUser } from "@/lib/session";
import NutritionClient from "./nutrition-client";

export default async function NutritionPage() {
  const user = await requireSessionUser();
  return <NutritionClient user={{ name: user.name, email: user.email }} />;
}
