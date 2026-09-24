import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { getUsersCollection } from "@/lib/users";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const profile = await (await getUsersCollection()).findOne({ _id: new ObjectId(user.id) }, { projection: { weightKg: 1 } });
    return NextResponse.json({ weightKg: profile?.weightKg ?? null }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return NextResponse.json({ error: "Unable to load profile" }, { status: 503 }); }
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: { weightKg?: unknown };
  try { body = await request.json() as { weightKg?: unknown }; } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (typeof body.weightKg !== "number" || !Number.isFinite(body.weightKg) || body.weightKg < 20 || body.weightKg > 300) return NextResponse.json({ error: "Weight must be between 20 and 300 kg." }, { status: 400 });
  try {
    await (await getUsersCollection()).updateOne({ _id: new ObjectId(user.id) }, { $set: { weightKg: Math.round(body.weightKg * 10) / 10 } });
    return NextResponse.json({ weightKg: Math.round(body.weightKg * 10) / 10 });
  } catch { return NextResponse.json({ error: "Unable to save weight" }, { status: 503 }); }
}
