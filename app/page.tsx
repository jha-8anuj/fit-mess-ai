import { redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/session";

export default async function Page() {
  await requireSessionUser();
  redirect("/dashboard");
}
