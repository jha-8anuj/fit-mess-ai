import { getDatabase } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  // Enforce auth at the data boundary as well as in Proxy.
  if (!(await getSessionUser())) {
    return Response.json(
      { message: "Please log in to continue." },
      { status: 401, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  try {
    const database = await getDatabase();
    await database.command({ ping: 1 });

    return Response.json(
      { connected: true, database: database.databaseName },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    return Response.json(
      { connected: false, error: "Unable to connect to the database." },
      { status: 503 },
    );
  }
}
