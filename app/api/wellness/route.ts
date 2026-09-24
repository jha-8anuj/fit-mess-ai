import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/session";
import { getDatabase } from "@/lib/mongodb";

const collectionName = "daily_progress";
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

type ProgressPatch = {
  date?: unknown;
  steps?: unknown;
  water?: unknown;
  routineCompleted?: unknown;
  workoutProgress?: unknown;
};

function validDate(value: unknown): value is string {
  return typeof value === "string" && datePattern.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function lastSevenDates(endDate: string) {
  const date = new Date(`${endDate}T00:00:00Z`);
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(date);
    next.setUTCDate(date.getUTCDate() - (6 - index));
    return next.toISOString().slice(0, 10);
  });
}

function emptyProgress(date: string) {
  return { date, steps: 0, water: 0, routineCompleted: [] as boolean[] };
}

function serializeProgress(doc: Record<string, unknown> | undefined, date: string) {
  if (!doc) return emptyProgress(date);
  return {
    date,
    steps: typeof doc.steps === "number" ? doc.steps : 0,
    water: typeof doc.water === "number" ? doc.water : 0,
    routineCompleted: Array.isArray(doc.routineCompleted) ? doc.routineCompleted.map(Boolean) : [],
    workoutProgress: doc.workoutProgress && typeof doc.workoutProgress === "object" ? doc.workoutProgress : {},
  };
}

async function getCollection() {
  const db = await getDatabase();
  const collection = db.collection(collectionName);
  await collection.createIndex({ userId: 1, date: 1 }, { unique: true });
  return collection;
}

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requestedDate = new URL(request.url).searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  if (!validDate(requestedDate)) return NextResponse.json({ error: "Invalid date" }, { status: 400 });

  try {
    const dates = lastSevenDates(requestedDate);
    const docs = await (await getCollection()).find({ userId: new ObjectId(user.id), date: { $in: dates } }).toArray();
    const byDate = new Map(docs.map((doc) => [doc.date as string, doc as Record<string, unknown>]));
    return NextResponse.json({ dates: dates.map((date) => serializeProgress(byDate.get(date), date)), current: serializeProgress(byDate.get(requestedDate), requestedDate) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to load wellness progress" }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: ProgressPatch;
  try { body = await request.json() as ProgressPatch; } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const date = body.date;
  if (!validDate(date)) return NextResponse.json({ error: "A valid date is required" }, { status: 400 });

  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (body.steps !== undefined && (!Number.isInteger(body.steps) || (body.steps as number) < 0 || (body.steps as number) > 2_000_000)) return NextResponse.json({ error: "Invalid steps" }, { status: 400 });
  if (body.water !== undefined && (!Number.isInteger(body.water) || (body.water as number) < 0 || (body.water as number) > 8)) return NextResponse.json({ error: "Invalid water count" }, { status: 400 });
  if (body.routineCompleted !== undefined && (!Array.isArray(body.routineCompleted) || body.routineCompleted.length > 50 || body.routineCompleted.some((item) => typeof item !== "boolean"))) return NextResponse.json({ error: "Invalid routine progress" }, { status: 400 });
  if (body.workoutProgress !== undefined && (!body.workoutProgress || typeof body.workoutProgress !== "object" || Array.isArray(body.workoutProgress))) return NextResponse.json({ error: "Invalid workout progress" }, { status: 400 });
  if (body.steps !== undefined) update.steps = body.steps;
  if (body.water !== undefined) update.water = body.water;
  if (body.routineCompleted !== undefined) update.routineCompleted = body.routineCompleted;
  if (body.workoutProgress !== undefined) {
    for (const [day, value] of Object.entries(body.workoutProgress as Record<string, unknown>)) {
      if (!/^[A-Za-z]+$/.test(day) || !value || typeof value !== "object" || Array.isArray(value)) return NextResponse.json({ error: "Invalid workout progress" }, { status: 400 });
      const workout = value as { completed?: unknown; exercises?: unknown };
      if (workout.completed !== undefined && typeof workout.completed !== "boolean") return NextResponse.json({ error: "Invalid workout completion" }, { status: 400 });
      if (workout.exercises !== undefined && (!Array.isArray(workout.exercises) || workout.exercises.length > 20 || workout.exercises.some((item) => typeof item !== "string"))) return NextResponse.json({ error: "Invalid workout exercises" }, { status: 400 });
      update[`workoutProgress.${day}`] = workout;
    }
  }

  try {
    const collection = await getCollection();
    const result = await collection.findOneAndUpdate(
      { userId: new ObjectId(user.id), date },
      { $set: update, $setOnInsert: { userId: new ObjectId(user.id), date, createdAt: new Date() } },
      { upsert: true, returnDocument: "after" },
    );
    return NextResponse.json(serializeProgress(result as Record<string, unknown> | undefined, date));
  } catch {
    return NextResponse.json({ error: "Unable to save wellness progress" }, { status: 503 });
  }
}
